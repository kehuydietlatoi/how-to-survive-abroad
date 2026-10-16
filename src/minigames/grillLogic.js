import { mulberry32 } from "./rng.js";

// Korean-BBQ rules (pure): meat slots cook on the side facing the grill; flip, then serve when
// both sides are golden. A boss event asks for a refill poured "with two hands" within a window.
//
// cook value v = seconds on that side / cookTime:  < GOLD_MIN raw · GOLD_MIN..GOLD_MAX golden · > GOLD_MAX burnt
export const GOLD_MIN = 0.85;
export const GOLD_MAX = 1.35;

export const doneness = (v) => (v < GOLD_MIN ? "raw" : v > GOLD_MAX ? "burnt" : "golden");

export class Grill {
  constructor({ slots = 3, pieces = 8, cookTime = 4, events = [9, 20, 31], eventWindow = 4, seed = 1 } = {}) {
    this.cookTime = cookTime;
    this.eventWindow = eventWindow;
    this.rand = mulberry32(seed);
    this.time = 0;
    this.remaining = pieces; // not yet on the grill
    this.pieces = pieces;
    this.slots = Array.from({ length: slots }, () => null);
    this.refill = Array.from({ length: slots }, () => 0);
    this.served = []; // { quality: "perfect" | "raw" | "burnt" | "mixed" }
    this.events = events.map((at) => ({ at, state: "later", left: eventWindow }));
    this.pours = { ok: 0, missed: 0, wasted: 0 };
    this.out = [];
    for (let i = 0; i < slots; i++) this._place(i);
  }

  _place(i) {
    if (this.remaining <= 0) return;
    this.remaining--;
    this.slots[i] = { cook: [0, 0], down: 0 }; // cook[side] in seconds; `down` is the side on the grill
  }

  get activeEvent() {
    return this.events.find((e) => e.state === "active") || null;
  }
  get done() {
    // Events that never came up (you were quick) are simply skipped.
    return this.served.length >= this.pieces && !this.activeEvent;
  }

  step(dt) {
    this.time += dt;
    this.slots.forEach((p) => {
      if (p) p.cook[p.down] += dt;
    });
    this.refill.forEach((r, i) => {
      if (this.slots[i] || this.remaining <= 0) return;
      this.refill[i] = r - dt;
      if (this.refill[i] <= 0) this._place(i);
    });
    for (const e of this.events) {
      if (e.state === "later" && this.time >= e.at) {
        e.state = "active";
        this.out.push({ type: "event", event: e });
      } else if (e.state === "active") {
        e.left -= dt;
        if (e.left <= 0) {
          e.state = "missed";
          this.pours.missed++;
          this.out.push({ type: "missed" });
        }
      }
    }
  }

  flip(i) {
    const p = this.slots[i];
    if (!p) return false;
    p.down = 1 - p.down;
    return true;
  }

  state(i) {
    const p = this.slots[i];
    return p && p.cook.map((c) => doneness(c / this.cookTime));
  }

  /** Serve the piece in slot i. Returns { quality } or null if the slot is empty. */
  serve(i) {
    const p = this.slots[i];
    if (!p) return null;
    const [a, b] = this.state(i);
    const quality = a === "golden" && b === "golden" ? "perfect" : a === "burnt" || b === "burnt" ? "burnt" : a === "raw" || b === "raw" ? "raw" : "mixed";
    this.served.push({ quality });
    this.slots[i] = null;
    this.refill[i] = 0.8;
    this.out.push({ type: "serve", quality, slot: i });
    return { quality };
  }

  /** Pour the boss's drink with two hands. */
  pour() {
    const e = this.activeEvent;
    if (!e) {
      this.pours.wasted++;
      this.out.push({ type: "wasted" });
      return false;
    }
    e.state = "ok";
    this.pours.ok++;
    this.out.push({ type: "poured" });
    return true;
  }

  result() {
    const perfect = this.served.filter((s) => s.quality === "perfect").length;
    const mixed = this.served.filter((s) => s.quality === "mixed").length;
    const asked = this.events.filter((e) => e.state !== "later").length;
    const total = this.pieces + asked;
    const points = perfect + mixed * 0.5 + this.pours.ok - this.pours.wasted * 0.25;
    return {
      score: Math.max(0, Math.min(100, Math.round((points / total) * 100))),
      passed: true,
      perfect,
      served: this.served.length,
      burnt: this.served.filter((s) => s.quality === "burnt").length,
      raw: this.served.filter((s) => s.quality === "raw").length,
      asked,
      pours: { ...this.pours },
    };
  }
}
