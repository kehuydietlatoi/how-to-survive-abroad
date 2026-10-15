// Pure scenario state machine. No DOM / three.js here so it can be unit tested.
//
// A scenario is { id, steps: [...] }. Each step has an `id`, a `type` and usually `next`:
//   info     { text, next }                         – a message the player acknowledges
//   sandbox  { objective, target, wrong?, next }    – walk around until interacting with `target`
//   choice   { prompt, options: [{ text, points, correct?, feedback, tip?, set?, next? }], next }
//   minigame { game, params?, next, passScore? }    – result { score, passed, flags? }
//   travel   { text, spawn, next }                  – fade + teleport the player
//   end      { }                                    – scenario finished
// Any step may have `nextIf: [{ flag, equals, next }]`, checked before `next`.

export class ScenarioRunner {
  constructor(scenario) {
    this.scenario = scenario;
    this.stepsById = new Map(scenario.steps.map((s) => [s.id, s]));
    if (this.stepsById.size !== scenario.steps.length) throw new Error("duplicate step id");
    this.reset();
  }

  reset() {
    this.flags = { ...(this.scenario.flags || {}) };
    this.score = 0;
    this.maxScore = 0;
    this.journal = []; // tips learned: [{ tip, good }]
    this.history = [];
    this.currentId = this.scenario.steps[0].id;
    this.finished = this.current().type === "end";
  }

  current() {
    return this.stepsById.get(this.currentId);
  }

  // --- step completion ---------------------------------------------------

  /** Acknowledge an info / travel step. */
  acknowledge() {
    const s = this.current();
    if (s.type !== "info" && s.type !== "travel") throw new Error(`acknowledge on ${s.type}`);
    this._applyOutcome(s, s.good ?? (s.points || 0) >= 0);
    return this._advance(s);
  }

  /**
   * Player interacted with something during a sandbox step.
   * Returns { done, wrong?: { feedback, points } }
   */
  interact(targetId) {
    const s = this.current();
    if (s.type !== "sandbox") return { done: false };
    if (targetId === s.target) {
      this._applyOutcome(s, true);
      this._advance(s);
      return { done: true };
    }
    const wrong = s.wrong && s.wrong[targetId];
    if (wrong) {
      this.score += wrong.points || 0;
      if (wrong.tip) this._addTip(wrong.tip, false);
      return { done: false, wrong };
    }
    return { done: false };
  }

  /** Pick option `index` of a choice step. Returns the chosen option. */
  choose(index) {
    const s = this.current();
    if (s.type !== "choice") throw new Error(`choose on ${s.type}`);
    const opt = s.options[index];
    if (!opt) throw new Error(`no option ${index}`);
    this.score += opt.points || 0;
    this.maxScore += Math.max(0, ...s.options.map((o) => o.points || 0));
    if (opt.set) Object.assign(this.flags, opt.set);
    if (opt.tip) this._addTip(opt.tip, !!opt.correct);
    else if (s.tip) this._addTip(s.tip, !!opt.correct);
    this.history.push({ step: s.id, option: index });
    this._advance(s, opt.next);
    return opt;
  }

  /** Report a minigame result { score, passed, flags?, tips? }. */
  finishMinigame(result) {
    const s = this.current();
    if (s.type !== "minigame") throw new Error(`finishMinigame on ${s.type}`);
    this.score += result.score || 0;
    this.maxScore += s.maxScore ?? 100;
    if (result.flags) Object.assign(this.flags, result.flags);
    for (const t of result.tips || []) this._addTip(t.tip, t.good);
    if (s.tip) this._addTip(s.tip, !!result.passed);
    this._advance(s);
  }

  // --- internals ---------------------------------------------------------

  // Optional score / flags / tip attached to info, travel and sandbox steps.
  _applyOutcome(s, good) {
    if (s.points) this.score += s.points;
    if (s.maxPoints) this.maxScore += s.maxPoints;
    if (s.set) Object.assign(this.flags, s.set);
    if (s.tip) this._addTip(s.tip, good);
  }

  _addTip(tip, good) {
    // Same tip only once; a bad outcome wins over a good one so the player sees what to fix.
    const existing = this.journal.find((j) => j.tip === tip || JSON.stringify(j.tip) === JSON.stringify(tip));
    if (existing) {
      existing.good = existing.good && good;
      return;
    }
    this.journal.push({ tip, good });
  }

  _advance(step, override) {
    let next = override;
    if (!next && step.nextIf) {
      for (const cond of step.nextIf) {
        if (this.flags[cond.flag] === cond.equals) {
          next = cond.next;
          break;
        }
      }
    }
    next = next || step.next;
    if (!next) throw new Error(`step ${step.id} has no next`);
    if (!this.stepsById.has(next)) throw new Error(`unknown step ${next}`);
    this.currentId = next;
    this.finished = this.current().type === "end";
    return this.current();
  }

  /** Stars 1-3 from score ratio. */
  stars() {
    if (this.maxScore <= 0) return 3;
    const r = this.score / this.maxScore;
    return r >= 0.85 ? 3 : r >= 0.55 ? 2 : 1;
  }
}

/** Static validation used by tests and at load time in dev. */
export function validateScenario(scenario) {
  const errors = [];
  const ids = new Set(scenario.steps.map((s) => s.id));
  const check = (from, to) => to && !ids.has(to) && errors.push(`${from} -> unknown step "${to}"`);
  for (const s of scenario.steps) {
    check(s.id, s.next);
    for (const c of s.nextIf || []) check(s.id, c.next);
    for (const o of s.options || []) check(s.id, o.next);
    if (s.type !== "end" && !s.next && !(s.options || []).every((o) => o.next)) errors.push(`${s.id} has no next`);
    if (s.type === "choice" && !(s.options || []).length) errors.push(`${s.id} has no options`);
  }
  if (!scenario.steps.some((s) => s.type === "end")) errors.push("no end step");
  return errors;
}
