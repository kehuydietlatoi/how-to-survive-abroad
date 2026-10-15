// "Wait for your number" minigame at the Bürgeramt: pure rules, unit tested.
// Numbers are called on an LED board; some look like yours. Press "That's me!" only
// when YOUR number appears. Miss it and it is called again later (with a penalty).

export const CALL_TUNING = {
  interval: 2.3, // seconds between calls
  window: 6, // seconds you have to react after your number appears
  falsePenalty: 20,
  missPenalty: 30,
};

/**
 * mine: "A-117", counter: 4
 * decoys: numbers shown before yours that look similar.
 */
export function makeSchedule({ mine = "A-117", counter = 4, decoys = ["A-171", "B-117", "A-118", "A-711"], filler = 4 } = {}) {
  const calls = [];
  let n = 109;
  const counterFor = (i) => ((i * 5 + 2) % 6) + 1;
  // A few unrelated numbers, the decoys mixed in, then yours.
  const pre = [];
  for (let i = 0; i < filler; i++) pre.push(`A-${n++}`);
  pre.splice(1, 0, decoys[0]);
  pre.splice(3, 0, decoys[1]);
  pre.push(decoys[2]);
  pre.push(decoys[3]);
  pre.forEach((num, i) => calls.push({ num, counter: counterFor(i), mine: false }));
  calls.push({ num: mine, counter, mine: true });
  // Calls after yours (used when you miss it).
  for (let i = 0; i < 6; i++) calls.push({ num: `A-${n++ + 10}`, counter: counterFor(i + 7), mine: false });
  return calls;
}

export class CallBoard {
  constructor(schedule, tuning = {}) {
    this.T = { ...CALL_TUNING, ...tuning };
    this.queue = schedule.map((c) => ({ ...c }));
    this.shown = []; // newest first
    this.time = 0;
    this.nextAt = 1.2;
    this.falsePresses = 0;
    this.misses = 0;
    this.found = false;
    this.done = false;
    this.mineShownAt = null;
    this.out = []; // UI events
  }

  get current() {
    return this.shown[0] || null;
  }

  step(dt) {
    if (this.done) return;
    this.time += dt;
    if (this.mineShownAt != null && this.time - this.mineShownAt > this.T.window) {
      // Missed: you'll be called again after a couple of other numbers.
      this.misses++;
      const mine = this.shown.find((c) => c.mine);
      this.mineShownAt = null;
      this.queue.splice(Math.min(2, this.queue.length), 0, { ...mine, recall: this.misses + 1 });
      this.out.push({ type: "missed" });
    }
    if (this.time >= this.nextAt && this.queue.length) {
      const call = this.queue.shift();
      this.shown.unshift(call);
      this.shown = this.shown.slice(0, 5);
      this.nextAt = this.time + this.T.interval;
      if (call.mine) this.mineShownAt = this.time;
      this.out.push({ type: "call", call });
    }
    if (!this.queue.length && this.mineShownAt == null && !this.found) {
      // Ran out of calls without reacting: the clerk comes to find you.
      this.done = true;
      this.out.push({ type: "timeout" });
    }
  }

  /** Player presses "That's me!". Returns { ok, num? }. */
  press() {
    if (this.done) return { ok: false };
    if (this.mineShownAt != null) {
      this.found = true;
      this.done = true;
      const mine = this.shown.find((c) => c.mine);
      this.out.push({ type: "found", call: mine });
      return { ok: true, call: mine };
    }
    this.falsePresses++;
    const cur = this.current;
    this.out.push({ type: "false", call: cur });
    return { ok: false, call: cur };
  }

  result() {
    const score = Math.max(0, 100 - this.falsePresses * this.T.falsePenalty - this.misses * this.T.missPenalty - (this.found ? 0 : 40));
    return { score, passed: true, found: this.found, falsePresses: this.falsePresses, misses: this.misses };
  }
}
