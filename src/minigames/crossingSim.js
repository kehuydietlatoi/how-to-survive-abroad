// Street-crossing simulation (pure logic, deterministic with a seed).
//
// Teaching goal: in Vietnamese traffic, riders don't stop for you – they steer around
// where they *expect* you to be. Walking slowly and steadily is safe; sprinting,
// stopping suddenly or stepping back breaks their prediction.
//
// Local frame: x runs along the road, z across it. The player starts on the near curb
// (negative z) and must reach the far curb (positive z).

export const CROSSING_TUNING = {
  roadHalf: 5, // road is 10 m wide
  lanes: [
    { z: -3.6, dir: 1 },
    { z: -1.3, dir: 1 },
    { z: 1.3, dir: -1 },
    { z: 3.6, dir: -1 },
  ],
  spawnDist: 34, // bikes appear this far up/down the road
  spawnGap: [0.9, 2.1], // seconds between bikes in one lane
  bikeSpeed: [5.5, 8], // m/s (~20-29 km/h, typical old-quarter traffic)
  walkSpeed: 1.3,
  runSpeed: 3.4,
  playerAccel: 9,
  playerRadius: 0.28,
  bikeHalfLength: 0.95,
  bikeHalfWidth: 0.32,
  estimateTau: 0.45, // how quickly riders update their guess of your velocity (s)
  planInterval: 0.35, // riders re-plan this often (reaction delay)
  reactRange: 11, // metres ahead at which riders start avoiding you
  reactRangeHand: 16, // ...when you raise your hand
  clearance: 1.25, // how far riders try to pass from your predicted position
  maxLateral: 1.6, // riders' max sideways speed (m/s)
  brakeSpeed: 2.2, // speed riders slow to when they can't swerve in time
  hearts: 3,
  invulnerable: 1.2,
  timeLimit: 60,
};

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class CrossingSim {
  constructor({ seed = 1, tuning = {}, active = true } = {}) {
    this.T = { ...CROSSING_TUNING, ...tuning };
    this.rand = mulberry32(seed);
    this.time = 0;
    this.player = { x: 0, z: -this.T.roadHalf - 0.4, vz: 0, vEst: 0, hand: false };
    this.hearts = this.T.hearts;
    this.hits = 0;
    this.nearMisses = 0;
    this.runTime = 0;
    this.backTime = 0;
    this.invuln = 0;
    this.bikes = [];
    this.events = []; // drained by the renderer: { type: 'hit'|'near'|'spawn', bike }
    this.done = false;
    this.passed = false;
    this.nextId = 1;
    // Inactive = ambient traffic only (no pedestrian, never finishes).
    this.active = active;
    if (!active) this.player.z = -1000;
    this.laneTimers = this.T.lanes.map(() => this._range(this.T.spawnGap) * 0.5);
    this._prewarm();
  }

  _range([a, b]) {
    return a + (b - a) * this.rand();
  }

  // Fill the road with traffic before the player starts.
  _prewarm() {
    this.T.lanes.forEach((lane, i) => {
      let x = -this.T.spawnDist;
      while (x < this.T.spawnDist) {
        const speed = this._range(this.T.bikeSpeed);
        x += speed * this._range(this.T.spawnGap);
        if (x < this.T.spawnDist) this._spawn(i, lane.dir > 0 ? x : -x, speed);
      }
    });
  }

  _spawn(laneIndex, x, speed) {
    const lane = this.T.lanes[laneIndex];
    const bike = {
      id: this.nextId++,
      lane: laneIndex,
      dir: lane.dir,
      laneZ: lane.z,
      x: x ?? -lane.dir * this.T.spawnDist,
      z: lane.z,
      cruise: speed ?? this._range(this.T.bikeSpeed),
      speed: 0,
      targetZ: lane.z,
      planT: this.rand() * this.T.planInterval,
      ghost: 0,
      honk: 0,
      lastSide: null,
      sweptAt: null,
    };
    bike.speed = bike.cruise;
    this.bikes.push(bike);
    this.events.push({ type: "spawn", bike });
    return bike;
  }

  /** Put the pedestrian on the near kerb and start a crossing attempt. */
  beginCrossing() {
    Object.assign(this.player, { x: 0, z: -this.T.roadHalf - 0.4, vz: 0, vEst: 0, hand: false });
    Object.assign(this, { active: true, time: 0, hearts: this.T.hearts, hits: 0, nearMisses: 0, runTime: 0, backTime: 0, invuln: 0, done: false, passed: false });
    for (const b of this.bikes) b.sweptAt = null;
  }

  /** Stop the attempt and let traffic flow freely again. */
  deactivate() {
    this.active = false;
    this.player.z = -1000;
  }

  /**
   * input: { forward: -1|0|1, run: boolean, hand: boolean }
   */
  step(dt, input = {}) {
    if (this.done) return;
    if (!this.active) input = {};
    const T = this.T;
    const p = this.player;
    this.time += dt;

    // --- player ---
    const want = (input.forward || 0) * (input.run ? T.runSpeed : T.walkSpeed);
    const dv = want - p.vz;
    const maxDv = T.playerAccel * dt;
    p.vz += Math.max(-maxDv, Math.min(maxDv, dv));
    p.z += p.vz * dt;
    if (this.active) p.z = Math.max(p.z, -T.roadHalf - 0.6);
    p.hand = !!input.hand;
    if (input.run && input.forward) this.runTime += dt;
    if (input.forward < 0) this.backTime += dt;
    // Riders' smoothed estimate of your velocity.
    const k = 1 - Math.exp(-dt / T.estimateTau);
    p.vEst += (p.vz - p.vEst) * k;
    this.invuln = Math.max(0, this.invuln - dt);

    // Riders start paying attention as soon as you step to the kerb edge.
    const onRoad = Math.abs(p.z) < T.roadHalf + 0.2;

    // --- bikes ---
    T.lanes.forEach((lane, i) => {
      this.laneTimers[i] -= dt;
      if (this.laneTimers[i] <= 0) {
        this._spawn(i);
        this.laneTimers[i] = this._range(T.spawnGap);
      }
    });

    const react = p.hand ? T.reactRangeHand : T.reactRange;
    for (const b of this.bikes) {
      const ahead = (p.x - b.x) * b.dir; // distance until the bike reaches the player's x
      b.planT -= dt;
      b.honk = Math.max(0, b.honk - dt);
      if (b.ghost > 0) {
        b.ghost -= dt;
        b.speed = Math.min(b.cruise, b.speed + 3 * dt);
      } else if (onRoad && ahead > 0 && ahead < react) {
        if (b.planT <= 0) {
          b.planT = T.planInterval;
          this._plan(b, ahead);
        }
      } else if (ahead < -(T.bikeHalfLength + 1.2)) {
        // Fully past the pedestrian: drift back into lane.
        b.targetZ = b.laneZ;
        b.speed = Math.min(b.cruise, b.speed + 2.5 * dt);
      }
      if (!(onRoad && ahead > 0 && ahead < react)) b.speed = Math.min(b.cruise, b.speed + 2.5 * dt);

      const dz = b.targetZ - b.z;
      const lat = T.maxLateral * dt;
      b.z += Math.max(-lat, Math.min(lat, dz));
      const prevAhead = ahead;
      b.x += b.dir * b.speed * dt;
      const newAhead = (p.x - b.x) * b.dir;

      // collisions / near misses
      const dxAbs = Math.abs(b.x - p.x);
      const dzAbs = Math.abs(b.z - p.z);
      if (b.ghost <= 0 && dxAbs < T.bikeHalfLength + T.playerRadius && dzAbs < T.bikeHalfWidth + T.playerRadius) {
        if (this.invuln <= 0) {
          this.hits++;
          this.hearts--;
          this.invuln = T.invulnerable;
          this.events.push({ type: "hit", bike: b });
        }
        b.ghost = 1.0;
        b.speed = 0.5;
        b.honk = 1;
        b.sweptAt = this.time;
      } else if (prevAhead > 0 && newAhead <= 0 && b.sweptAt == null && onRoad) {
        b.sweptAt = this.time;
        if (dzAbs < 0.95) {
          this.nearMisses++;
          b.honk = 0.6;
          this.events.push({ type: "near", bike: b });
        }
      }
    }
    this.bikes = this.bikes.filter((b) => Math.abs(b.x) < T.spawnDist + 2);

    if (!this.active) {
      // ambient: never finishes
    } else if (this.hearts <= 0) {
      this.done = true;
      this.passed = false;
    } else if (p.z >= T.roadHalf + 0.4) {
      this.done = true;
      this.passed = true;
    } else if (this.time > T.timeLimit) {
      this.done = true;
      this.passed = false;
    }
  }

  // Rider decides where to pass, based on where they predict the pedestrian will be.
  _plan(b, ahead) {
    const T = this.T;
    const p = this.player;
    const t = ahead / Math.max(b.speed, 0.1);
    // Riders expect walking pace; a sprinting pedestrian outruns their prediction.
    const vGuess = Math.max(-T.walkSpeed * 1.15, Math.min(T.walkSpeed * 1.15, p.vEst));
    const clear = T.clearance + (p.hand ? 0.35 : 0);
    if (p.hand) b.speed = Math.min(b.speed, b.cruise * 0.75); // a raised hand makes riders ease off
    let pred = p.z + vGuess * t;
    pred = Math.max(-T.roadHalf, Math.min(T.roadHalf, pred));
    const moving = Math.abs(p.vEst) > 0.25;
    const lo = -T.roadHalf + 0.3;
    const hi = T.roadHalf - 0.3;
    // Where the pedestrian will be while the bike passes: between "now" and the prediction.
    const bandLo = Math.min(pred, p.z + vGuess * t * 0.5) - clear;
    const bandHi = Math.max(pred, p.z + vGuess * t * 0.5) + clear;
    if (b.laneZ <= bandLo || b.laneZ >= bandHi) {
      b.targetZ = b.laneZ; // no conflict: keep lane
    } else {
      // Pass behind the pedestrian (the side they walk away from) when there is room,
      // otherwise in front of where they *will* be. Standing still: the closer side.
      // Once a rider picks a side they stick with it (no last-second weaving).
      const ok = (z) => z >= lo && z <= hi;
      const s = moving ? Math.sign(p.vEst) : b.laneZ >= p.z ? -1 : 1; // walking direction
      // "behind" (-s) is the side the pedestrian walks away from; "front" (+s) gets extra room.
      const sideZ = (side) => (side > 0 ? bandHi : bandLo) + (side === s && moving ? side * 0.5 : 0);
      if (!b.passSide || !ok(sideZ(b.passSide))) {
        b.passSide = ok(sideZ(-s)) ? -s : ok(sideZ(s)) ? s : Math.abs(b.z - lo) < Math.abs(b.z - hi) ? -1 : 1;
      }
      b.targetZ = sideZ(b.passSide);
    }
    b.targetZ = Math.max(lo, Math.min(hi, b.targetZ));
    // Slow down if the swerve can't be completed in time.
    const need = Math.abs(b.targetZ - b.z);
    const tNeeded = need / T.maxLateral;
    if (tNeeded > t * 0.85) {
      const desired = ahead / Math.max(tNeeded / 0.85, 0.01);
      b.speed = Math.max(T.brakeSpeed * 0.5, Math.min(b.speed, desired));
      if (!b.honk) b.honk = 0.4;
    }
  }

  result() {
    let score = 100 - this.hits * 30 - this.nearMisses * 6;
    if (this.runTime > 0.6) score -= 10;
    if (this.backTime > 0.4) score -= 10;
    score = Math.max(0, Math.min(100, Math.round(score)));
    return {
      passed: this.passed,
      score: this.passed ? score : 0,
      hits: this.hits,
      nearMisses: this.nearMisses,
      ran: this.runTime > 0.6,
      wentBack: this.backTime > 0.4,
      time: this.time,
    };
  }
}

/** Run a scripted strategy headlessly – used by tests and tuning. */
export function simulate(strategy, seed, tuning) {
  const sim = new CrossingSim({ seed, tuning });
  const dt = 1 / 60;
  while (!sim.done) sim.step(dt, strategy(sim));
  return sim.result();
}

/** True while a bike in the first lane is about to pass right in front of the kerb. */
export function kerbBlocked(sim, within = 6) {
  const p = sim.player;
  return sim.bikes.some((b) => b.lane === 0 && (p.x - b.x) * b.dir > -1 && (p.x - b.x) * b.dir < within);
}

// Each strategy waits for a small gap at the kerb, then behaves differently on the road.
const started = new WeakMap();
const gate = (sim) => {
  if (!started.get(sim) && !kerbBlocked(sim)) started.set(sim, sim.time);
  return started.get(sim);
};

export const STRATEGIES = {
  steady: (sim) => ({ forward: gate(sim) != null ? 1 : 0 }),
  steadyHand: (sim) => ({ forward: gate(sim) != null ? 1 : 0, hand: true }),
  sprint: (sim) => ({ forward: gate(sim) != null ? 1 : 0, run: true }),
  // Walk, then freeze mid-road for a while, then continue.
  stopAndGo: (sim) => {
    const s = gate(sim);
    if (s == null) return { forward: 0 };
    const t = sim.time - s;
    return { forward: t > 2.5 && t < 4.5 ? 0 : 1 };
  },
  // Walk, panic and step back, then continue.
  panicBack: (sim) => {
    const s = gate(sim);
    if (s == null) return { forward: 0 };
    const t = sim.time - s;
    return { forward: t > 2.5 && t < 3.6 ? -1 : 1 };
  },
  // Steps out without looking.
  blind: () => ({ forward: 1 }),
};
