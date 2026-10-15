// Phở eating minigame: pure rules (no DOM / three.js) so they can be unit tested.
//
// Hanoi table condiments: lime, fresh chili, chili sauce, garlic vinegar, extra spring
// onion, herbs and quẩy (fried dough sticks). Locals taste the broth first, season a little,
// eat noodles with chopsticks and broth with the spoon, and cool down with trà đá.

export const CONDIMENTS = [
  { id: "lime", icon: "🍋", name: { en: "Lime", vi: "Chanh" }, sour: 1, max: 3 },
  { id: "chili", icon: "🌶️", name: { en: "Fresh chili", vi: "Ớt tươi" }, spicy: 1, max: 4 },
  { id: "sauce", icon: "🥫", name: { en: "Chili sauce", vi: "Tương ớt" }, spicy: 1.5, max: 4 },
  { id: "vinegar", icon: "🧄", name: { en: "Garlic vinegar", vi: "Dấm tỏi" }, sour: 1, max: 3 },
  { id: "onion", icon: "🧅", name: { en: "Spring onion", vi: "Hành lá" }, fresh: 1, max: 3 },
  { id: "herbs", icon: "🌿", name: { en: "Herbs", vi: "Rau thơm" }, fresh: 1, max: 3 },
  { id: "quay", icon: "🥖", name: { en: "Quẩy (fried dough)", vi: "Quẩy" }, max: 3 },
];

export const PHO_TUNING = {
  spicyLimit: 3, // above this it gets "too spicy"
  sourLimit: 3,
  noodleBites: 6,
  brothSips: 3,
};

export class PhoMeal {
  constructor(tuning = {}) {
    this.T = { ...PHO_TUNING, ...tuning };
    this.added = Object.fromEntries(CONDIMENTS.map((c) => [c.id, 0]));
    this.flavor = { sour: 0, spicy: 0, fresh: 0 };
    this.tasted = false;
    this.addedBeforeTasting = false;
    this.phase = "season"; // season → eat → done
    this.noodles = this.T.noodleBites;
    this.broth = this.T.brothSips;
    this.heat = 0; // how much your mouth burns (rises with spicy sips/bites)
    this.coughs = 0;
    this.drankTea = false;
    this.bitesInARow = 0;
  }

  get tooSpicy() {
    return this.flavor.spicy > this.T.spicyLimit;
  }

  get tooSour() {
    return this.flavor.sour > this.T.sourLimit;
  }

  /** Taste the broth with the spoon. */
  taste() {
    this.tasted = true;
    return this._comment();
  }

  /** Add one portion of a condiment. Returns { ok, reason?, comment }. */
  add(id) {
    if (this.phase !== "season") return { ok: false, reason: "phase" };
    const c = CONDIMENTS.find((x) => x.id === id);
    if (!c) return { ok: false, reason: "unknown" };
    if (this.added[id] >= c.max) return { ok: false, reason: "max" };
    if (!this.tasted) this.addedBeforeTasting = true;
    this.added[id]++;
    for (const k of ["sour", "spicy", "fresh"]) this.flavor[k] += c[k] || 0;
    return { ok: true, comment: this._comment() };
  }

  startEating() {
    if (this.phase === "season") this.phase = "eat";
  }

  /** One bite of noodles (chopsticks). */
  biteNoodles() {
    if (this.phase !== "eat" || this.noodles <= 0) return { ok: false };
    this.noodles--;
    this.bitesInARow++;
    return this._afterMouthful(0.5);
  }

  /** One spoon of broth. */
  sipBroth() {
    if (this.phase !== "eat" || this.broth <= 0) return { ok: false };
    this.broth--;
    this.bitesInARow = 0;
    return this._afterMouthful(1);
  }

  /** Iced tea: cools you down. */
  drinkTea() {
    this.drankTea = true;
    this.heat = 0;
    return { ok: true };
  }

  _afterMouthful(weight) {
    let cough = false;
    if (this.tooSpicy) {
      this.heat += weight * (this.flavor.spicy - this.T.spicyLimit + 1);
      if (this.heat >= 2) {
        cough = true;
        this.coughs++;
        this.heat = 1;
      }
    }
    if (this.noodles <= 0 && this.broth <= 0) this.phase = "done";
    return { ok: true, cough, done: this.phase === "done" };
  }

  _comment() {
    if (this.tooSpicy) return "tooSpicy";
    if (this.tooSour) return "tooSour";
    const any = Object.values(this.added).some((n) => n > 0);
    return any ? "nice" : "plain";
  }

  get kinds() {
    return Object.values(this.added).filter((n) => n > 0).length;
  }

  result() {
    let score = 30;
    if (this.tasted && !this.addedBeforeTasting) score += 20;
    if (!this.tooSpicy && !this.tooSour) score += 20;
    if (this.kinds >= 2) score += 15;
    if (this.phase === "done") score += 15;
    score -= Math.min(15, this.coughs * 5);
    return {
      score: Math.max(0, Math.min(100, score)),
      passed: this.phase === "done",
      tastedFirst: this.tasted && !this.addedBeforeTasting,
      balanced: !this.tooSpicy && !this.tooSour,
      kinds: this.kinds,
      coughs: this.coughs,
      drankTea: this.drankTea,
    };
  }
}
