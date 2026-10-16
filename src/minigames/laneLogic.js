import { mulberry32 } from "./rng.js";

// Lane-dodge rules (pure). Obstacles fall down N lanes (y 0 → 1); the player stands at PLAYER_Y.
// Forbidden lanes drain a heart every `drainEvery` seconds; an optional action (bell, wave…)
// clears certain obstacles ahead of you in your lane.
//
// params: { lanes: [{ kind: "ok" | "forbidden", why? }], duration, hearts = 3, drainEvery = 2.2,
//           obstacles: [{ id, icon, speed, lanes?, weight?, why }], pickups?: [{ id, icon, points, weight? }],
//           action?: { id, clears: [obstacleIds], cooldown, range }, spawnEvery?: [min, max], seed }
export const PLAYER_Y = 0.86;
const HIT = 0.065;

export class LaneGame {
  constructor(params) {
    this.p = params;
    this.rand = mulberry32(params.seed ?? 1);
    this.lane = params.startLane ?? Math.floor(params.lanes.length / 2);
    this.hearts = params.hearts ?? 3;
    this.maxHearts = this.hearts;
    this.time = 0;
    this.obstacles = [];
    this.pickups = [];
    this.nextSpawn = 0.8;
    this.invuln = 0;
    this.forbiddenFor = 0;
    this.actionCd = 0;
    this.points = 0;
    this.hits = 0;
    this.cleared = 0;
    this.picked = 0;
    this.out = [];
    this._id = 1;
  }

  get done() {
    return this.hearts <= 0 || this.time >= this.p.duration;
  }
  get won() {
    return this.hearts > 0 && this.time >= this.p.duration;
  }

  move(d) {
    this.setLane(this.lane + d);
  }
  setLane(i) {
    this.lane = Math.max(0, Math.min(this.p.lanes.length - 1, i));
  }

  /** Use the action (bell…). Clears matching obstacles in front of the player in their lane. */
  act() {
    const a = this.p.action;
    if (!a || this.actionCd > 0) return false;
    this.actionCd = a.cooldown ?? 3;
    let n = 0;
    this.obstacles = this.obstacles.filter((o) => {
      const near = o.lane === this.lane && o.y < PLAYER_Y && PLAYER_Y - o.y <= (a.range ?? 0.5);
      if (near && a.clears.includes(o.def.id)) {
        n++;
        return false;
      }
      return true;
    });
    this.cleared += n;
    this.out.push({ type: "action", cleared: n });
    return true;
  }

  _spawn() {
    const { obstacles, pickups = [], lanes } = this.p;
    const wantPickup = pickups.length > 0 && this.rand() < 0.2;
    const pool = wantPickup ? pickups : obstacles;
    const total = pool.reduce((s, d) => s + (d.weight ?? 1), 0);
    let r = this.rand() * total;
    const def = pool.find((d) => (r -= d.weight ?? 1) < 0) || pool[0];
    const allowed = def.lanes ?? lanes.map((_, i) => i);
    let lane;
    if (wantPickup) {
      // Pickups sit in ok lanes only.
      const oks = allowed.filter((l) => lanes[l].kind !== "forbidden");
      lane = (oks.length ? oks : allowed)[Math.floor(this.rand() * (oks.length || allowed.length))];
    } else {
      // Never wall off every lane close to the top of the screen.
      const taken = new Set(this.obstacles.filter((o) => o.y < 0.3).map((o) => o.lane));
      const free = allowed.filter((l) => !taken.has(l));
      if (!free.length) return;
      if (taken.size + 1 >= lanes.length) return;
      lane = free[Math.floor(this.rand() * free.length)];
    }
    (wantPickup ? this.pickups : this.obstacles).push({ uid: this._id++, def, lane, y: -0.06 });
  }

  step(dt) {
    if (this.done) return;
    this.time += dt;
    this.invuln = Math.max(0, this.invuln - dt);
    this.actionCd = Math.max(0, this.actionCd - dt);

    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0) {
      this._spawn();
      const [lo, hi] = this.p.spawnEvery ?? [0.55, 1.1];
      this.nextSpawn = lo + this.rand() * (hi - lo);
    }

    for (const o of this.obstacles) {
      o.y += o.def.speed * dt;
      if (o.lane === this.lane && Math.abs(o.y - PLAYER_Y) < HIT && !o.hit) {
        o.hit = true;
        if (this.invuln <= 0) {
          this.hearts--;
          this.hits++;
          this.invuln = 1;
          this.out.push({ type: "hit", def: o.def });
        }
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.y < 1.1);
    for (const k of this.pickups) {
      k.y += (this.p.pickupSpeed ?? 0.3) * dt;
      if (k.lane === this.lane && Math.abs(k.y - PLAYER_Y) < HIT + 0.03) {
        k.got = true;
        this.points += k.def.points ?? 1;
        this.picked++;
        this.out.push({ type: "pickup", def: k.def });
      }
    }
    this.pickups = this.pickups.filter((k) => k.y < 1.1 && !k.got);

    const lane = this.p.lanes[this.lane];
    if (lane.kind === "forbidden") {
      this.forbiddenFor += dt;
      if (this.forbiddenFor >= (this.p.drainEvery ?? 2.2)) {
        this.forbiddenFor = 0;
        this.hearts--;
        this.out.push({ type: "drain", lane });
      }
    } else this.forbiddenFor = 0;
  }

  result() {
    const base = Math.round((Math.max(0, this.hearts) / this.maxHearts) * 80);
    const bonus = Math.min(20, this.picked * 4 + this.cleared * 3);
    const failed = this.hearts <= 0;
    return {
      score: failed ? 0 : Math.min(100, base + bonus),
      passed: !failed,
      hearts: Math.max(0, this.hearts),
      hits: this.hits,
      picked: this.picked,
      cleared: this.cleared,
    };
  }
}
