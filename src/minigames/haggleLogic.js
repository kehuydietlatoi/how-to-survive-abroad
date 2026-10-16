// Haggling rules (pure). The seller starts high, drops towards a hidden floor when countered,
// loses patience when insulted and lets you walk away once before calling you back.
//
//   new Haggle({ start, fair: [lo, hi], floor, patience = 3 })
//   offer(x) → { type: "insult" | "counter" | "deal" }, accept(), walkAway()
export class Haggle {
  constructor({ start, fair, floor, patience = 3 }) {
    this.start = start;
    this.fair = fair;
    this.floor = floor;
    this.ask = start;
    this.patience = patience;
    this.maxPatience = patience;
    this.rounds = 0;
    this.calledBack = false;
    this.outcome = null; // "deal" | "walk" | "angry"
    this.final = null;
  }

  get done() {
    return this.outcome !== null;
  }

  offer(x) {
    this.rounds++;
    if (x >= this.ask) return this._deal(this.ask);
    if (x >= this.floor) return this._deal(x);
    if (x < this.floor * 0.55) {
      this.patience -= 1;
      if (this.patience <= 0) return this._end("angry");
      return { type: "insult", ask: this.ask };
    }
    this.patience -= 0.25;
    this.ask = Math.max(this.floor + 1, Math.round(this.ask - (this.ask - this.floor) * 0.3));
    return { type: "counter", ask: this.ask };
  }

  accept() {
    return this._deal(this.ask);
  }

  walkAway() {
    if (!this.calledBack && this.patience > 0) {
      this.calledBack = true;
      this.ask = Math.max(this.floor + 1, Math.round(this.ask - (this.ask - this.floor) * 0.45));
      return { type: "callback", ask: this.ask };
    }
    return this._end("walk");
  }

  _deal(price) {
    this.final = price;
    this.outcome = "deal";
    return { type: "deal", price };
  }

  _end(outcome) {
    this.outcome = outcome;
    return { type: outcome };
  }

  result() {
    const [, hi] = this.fair;
    let score;
    if (this.outcome === "deal") {
      const over = Math.max(0, this.final - hi);
      const ratio = Math.min(1, over / Math.max(1, this.start - hi));
      score = Math.round(100 - 85 * Math.sqrt(ratio));
    } else if (this.outcome === "walk") score = 70; // walking away from a bad deal is a fine outcome
    else score = 40;
    return { score, passed: true, outcome: this.outcome, final: this.final, rounds: this.rounds, fairDeal: this.outcome === "deal" && this.final <= hi };
  }
}
