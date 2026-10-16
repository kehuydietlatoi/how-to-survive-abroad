import { mulberry32, shuffled } from "./rng.js";

// Swipe-judge rules: one card at a time, answer "left" or "right" before the timer runs out.
// Pure state machine (the DOM lives in SwipeJudge.js).
export class SwipeLogic {
  constructor(items, { secondsPerCard = 7, seed = 1, shuffle = true } = {}) {
    this.items = shuffle ? shuffled(items, mulberry32(seed)) : [...items];
    this.secondsPerCard = secondsPerCard;
    this.idx = 0;
    this.timeLeft = secondsPerCard;
    this.streak = 0;
    this.best = 0;
    this.right = 0;
    this.mistakes = []; // { item, timedOut, said }
  }

  get current() {
    return this.items[this.idx] || null;
  }
  get done() {
    return this.idx >= this.items.length;
  }

  /** Answer the current card. Returns { ok, item }. The caller shows feedback, then continues. */
  answer(side) {
    const item = this.current;
    if (!item) return null;
    const ok = item.answer === side;
    this._record(item, ok, { said: side });
    return { ok, item };
  }

  /** Advance the timer. Returns { timedOut: true, item } when the card ran out of time. */
  step(dt) {
    const item = this.current;
    if (!item) return null;
    this.timeLeft -= dt;
    if (this.timeLeft > 0) return null;
    this._record(item, false, { timedOut: true });
    return { timedOut: true, ok: false, item };
  }

  _record(item, ok, extra) {
    if (ok) {
      this.right++;
      this.streak++;
      this.best = Math.max(this.best, this.streak);
    } else {
      this.streak = 0;
      this.mistakes.push({ item, ...extra });
    }
    this.idx++;
    this.timeLeft = this.secondsPerCard;
  }

  result() {
    const total = this.items.length;
    return {
      score: Math.round((this.right / total) * 100),
      passed: true,
      right: this.right,
      total,
      best: this.best,
      mistakes: this.mistakes.map((m) => m.item.id),
    };
  }
}
