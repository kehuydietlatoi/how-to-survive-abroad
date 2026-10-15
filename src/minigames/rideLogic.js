// Grab bike passenger minigame: pure rules (no DOM / three.js), unit tested.
//
// You ride pillion through Hanoi. Good passengers:
//   • lean WITH the driver into turns (never against),
//   • hold on (rear rail / driver's waist) when the driver brakes,
//   • keep knees in when squeezing between cars and buses.
//
// The route is built from segments; heading 0 points to -z, +dir = turning right (+x).

export const RIDE_TUNING = {
  speed: 8.5, // m/s (~30 km/h: typical city speed)
  cueTime: 1.3, // seconds of warning before an action window opens
  leanNeed: 0.55, // fraction of a turn you must lean the right way
  counterLimit: 0.25, // leaning the wrong way more than this = wobble
  braceBefore: 0.45, // brake window opens this long before the stop (s)
  braceAfter: 0.5,
  braceNeed: 0.4, // fraction of the brake window you must hold on
  tuckNeed: 0.65,
  comfortLoss: 18, // driver comfort lost per mistake
};

/**
 * segments: [{ straight: len, events?: [{ type: "brace"|"tuck", at, len? }] } | { turn: dir, angle: deg, radius }]
 * Returns { points: [{ x, z, h, s }], length, events: [{ id, type, dir?, start, end }] }
 */
export function buildRoute(segments, step = 1) {
  const points = [];
  const events = [];
  let x = 0;
  let z = 0;
  let h = 0;
  let s = 0;
  const push = () => points.push({ x, z, h, s });
  push();
  let id = 0;
  for (const seg of segments) {
    if (seg.straight != null) {
      for (const e of seg.events || []) {
        const at = s + e.at;
        events.push({ id: id++, type: e.type, start: at, end: at + (e.len || 0), obstacle: e.obstacle });
      }
      const n = Math.max(1, Math.round(seg.straight / step));
      const ds = seg.straight / n;
      for (let i = 0; i < n; i++) {
        x += Math.sin(h) * ds;
        z -= Math.cos(h) * ds;
        s += ds;
        push();
      }
    } else if (seg.turn) {
      const ang = (seg.angle * Math.PI) / 180;
      const len = ang * seg.radius;
      events.push({ id: id++, type: "lean", dir: seg.turn, start: s, end: s + len });
      const n = Math.max(2, Math.round(len / step));
      const ds = len / n;
      for (let i = 0; i < n; i++) {
        h += (seg.turn * ang) / n;
        x += Math.sin(h) * ds;
        z -= Math.cos(h) * ds;
        s += ds;
        push();
      }
    }
  }
  return { points, length: s, events };
}

/** Position / heading at distance s along the route (linear interpolation). */
export function sampleRoute(route, s) {
  const p = route.points;
  if (s <= 0) return { ...p[0] };
  if (s >= route.length) return { ...p[p.length - 1] };
  let lo = 0;
  let hi = p.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (p[mid].s <= s) lo = mid;
    else hi = mid;
  }
  const a = p[lo];
  const b = p[hi];
  const k = (s - a.s) / (b.s - a.s || 1);
  return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, h: a.h + (b.h - a.h) * k, s };
}

export class RideSim {
  constructor(route, tuning = {}) {
    this.T = { ...RIDE_TUNING, ...tuning };
    this.route = route;
    this.s = 0;
    this.time = 0;
    this.speed = this.T.speed;
    this.comfort = 100;
    this.done = false;
    this.log = []; // { id, type, ok, reason }
    this.out = []; // UI events, drained by the view
    const v = this.T.speed;
    // Action windows in distance units (brace windows are centred on the stop point).
    this.events = route.events.map((e) => {
      const w =
        e.type === "brace"
          ? { from: e.start - this.T.braceBefore * v, to: e.start + this.T.braceAfter * v }
          : { from: e.start, to: Math.max(e.end, e.start + 0.5 * v) };
      return { ...e, ...w, cueFrom: w.from - this.T.cueTime * v, frames: 0, good: 0, bad: 0, state: "pending" };
    });
  }

  /** Events whose cue or window is active now (for prompts). */
  active() {
    return this.events.filter((e) => e.state !== "finished" && this.s >= e.cueFrom && this.s <= e.to);
  }

  /** input: { lean: -1|0|1, brace: bool, tuck: bool } */
  step(dt, input = {}) {
    if (this.done) return;
    this.time += dt;
    // The driver slows down around brake points.
    let slow = 0;
    for (const e of this.events) if (e.type === "brace") slow = Math.max(slow, 1 - Math.min(1, Math.abs(this.s - e.start) / (this.T.speed * 0.6)));
    this.speed = this.T.speed * (1 - 0.65 * slow);
    this.s += this.speed * dt;

    for (const e of this.events) {
      if (e.state === "finished") continue;
      if (this.s < e.from) continue;
      if (e.state === "pending") {
        e.state = "open";
        this.out.push({ type: "open", ev: e });
      }
      if (this.s <= e.to) {
        e.frames += dt;
        if (e.type === "lean") {
          if (input.lean === e.dir) e.good += dt;
          else if (input.lean === -e.dir) e.bad += dt;
        } else if (e.type === "brace") {
          if (input.brace) e.good += dt;
        } else if (e.type === "tuck") {
          if (input.tuck) e.good += dt;
        }
      } else {
        this._judge(e);
      }
    }
    if (this.s >= this.route.length) {
      for (const e of this.events) if (e.state !== "finished") this._judge(e);
      this.done = true;
    }
  }

  _judge(e) {
    const T = this.T;
    const f = e.frames || 1e-6;
    let ok;
    let reason = "";
    if (e.type === "lean") {
      if (e.bad / f > T.counterLimit) {
        ok = false;
        reason = "counter";
      } else {
        ok = e.good / f >= T.leanNeed;
        reason = ok ? "" : "stiff";
      }
    } else if (e.type === "brace") {
      ok = e.good / f >= T.braceNeed;
      reason = ok ? "" : "jolt";
    } else {
      ok = e.good / f >= T.tuckNeed;
      reason = ok ? "" : "knee";
    }
    e.state = "finished";
    e.ok = ok;
    if (!ok) this.comfort = Math.max(0, this.comfort - T.comfortLoss);
    this.log.push({ id: e.id, type: e.type, ok, reason });
    this.out.push({ type: "result", ev: e, ok, reason });
  }

  result() {
    const total = this.log.length || 1;
    const good = this.log.filter((l) => l.ok).length;
    const mistakes = (type) => this.log.filter((l) => l.type === type && !l.ok).length;
    return {
      score: Math.round((good / total) * 100),
      passed: this.done,
      good,
      total: this.log.length,
      comfort: this.comfort,
      leanMistakes: mistakes("lean"),
      counterLean: this.log.filter((l) => l.reason === "counter").length,
      braceMistakes: mistakes("brace"),
      tuckMistakes: mistakes("tuck"),
    };
  }
}

/** The ride from Hoàn Kiếm to Văn Miếu (stylised, ~45 s). */
export const HANOI_ROUTE = [
  { straight: 40, events: [{ type: "brace", at: 30, obstacle: "bikeCut" }] },
  { turn: 1, angle: 70, radius: 14 },
  { straight: 45, events: [{ type: "tuck", at: 14, len: 12, obstacle: "busCar" }] },
  { turn: -1, angle: 60, radius: 16 },
  { straight: 35, events: [{ type: "brace", at: 22, obstacle: "pedestrian" }] },
  { turn: -1, angle: 45, radius: 18 },
  { straight: 40, events: [{ type: "tuck", at: 10, len: 14, obstacle: "busCar" }] },
  { turn: 1, angle: 75, radius: 14 },
  { straight: 38, events: [{ type: "brace", at: 26, obstacle: "redLight" }] },
  { turn: 1, angle: 40, radius: 20 },
  { straight: 30 },
];
