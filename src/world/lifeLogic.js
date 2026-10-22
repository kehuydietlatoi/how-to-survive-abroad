// Ambient motion on the XZ plane. No renderer, DOM, collision world or clock.
const EPS = 1e-8;
const mod = (n, d) => ((n % d) + d) % d;
const point = p => Array.isArray(p) && p.length >= 2 && p.every(Number.isFinite);
const between = (range, random) => range[0] + (range[1] - range[0]) * random();

export class PathFollower {
  constructor(path, { speed = 1.1, loop = true, pause = [0.4, 1.2], random = Math.random } = {}) {
    if (!Array.isArray(path) || path.length < 2 || !path.every(point) ||
        !path.some(p => Math.hypot(p[0] - path[0][0], p[1] - path[0][1]) > EPS)) {
      throw new Error('A pedestrian path needs at least two distinct finite points');
    }
    if (!(speed > 0) || !Number.isFinite(speed)) throw new Error('Pedestrian speed must be positive');
    if (!point(pause) || pause[0] < 0 || pause[1] < pause[0]) throw new Error('Invalid waypoint pause range');
    this.path = path.map(p => [...p]);
    this.speed = speed;
    this.loop = loop;
    this.pause = pause;
    this.random = random;
    this.x = path[0][0];
    this.z = path[0][1];
    this.target = 1;
    this.direction = 1;
    this.pauseLeft = 0;
    this.done = false;
    this.moving = false;
    this.heading = Math.atan2(path[1][0] - this.x, path[1][1] - this.z);
  }

  step(dt, player) {
    if (!(dt > 0) || !Number.isFinite(dt)) return;
    let remaining = dt;
    this.moving = false;
    // The cap also bounds work for pathological dt or runs of duplicate points.
    for (let hops = 0; remaining > EPS && hops < 1024; hops++) {
      const wait = Math.min(remaining, this.pauseLeft);
      this.pauseLeft -= wait;
      remaining -= wait;
      if (remaining <= EPS || this.done) break;
      const p = this.path[this.target];
      const dx = p[0] - this.x, dz = p[1] - this.z;
      const distance = Math.hypot(dx, dz);
      let travel = Math.min(distance, this.speed * remaining);
      if (distance > EPS && player) {
        const px = player.x - this.x, pz = player.z - this.z;
        const along = (px * dx + pz * dz) / distance;
        const lateral2 = px * px + pz * pz - along * along;
        const radius = 1.05;
        if (Math.hypot(px, pz) <= radius + EPS) break;
        if (along > 0 && lateral2 < radius * radius) {
          travel = Math.min(travel, Math.max(0, along - Math.sqrt(radius * radius - lateral2)));
        }
      }
      if (distance > EPS) {
        this.x += dx / distance * travel;
        this.z += dz / distance * travel;
        if (travel > EPS) {
          const angle = Math.atan2(dx, dz);
          const turn = Math.atan2(Math.sin(angle - this.heading), Math.cos(angle - this.heading));
          this.heading += turn * (1 - Math.exp(-dt * 8));
          this.moving = true;
        }
        remaining -= travel / this.speed;
        if (travel < distance - EPS) break;
      }
      this.pauseLeft = between(this.pause, this.random);
      if (this.loop === 'pingpong') {
        if (this.target === this.path.length - 1) this.direction = -1;
        else if (this.target === 0) this.direction = 1;
        this.target += this.direction;
      } else if (this.target === this.path.length - 1 && !this.loop) {
        this.done = true;
      } else {
        this.target = (this.target + 1) % this.path.length;
      }
    }
    if (this.pauseLeft > EPS || this.done) this.moving = false;
  }
}

/** A new route is chosen only after arrival and its waypoint pause. */
export class Wanderer {
  constructor(area, { random = Math.random, ...options } = {}) {
    if (!Array.isArray(area) || area.length !== 4 || !area.every(Number.isFinite) ||
        area[2] <= area[0] || area[3] <= area[1]) throw new Error('Invalid crowd area');
    this.area = area;
    this.random = random;
    this.options = options;
    this.route = this._route(this._point());
  }
  _point() {
    const [x, z, maxX, maxZ] = this.area;
    return [x + (maxX - x) * this.random(), z + (maxZ - z) * this.random()];
  }
  _route(start) {
    let end = this._point();
    if (Math.hypot(end[0] - start[0], end[1] - start[1]) < EPS) {
      const a = this.area;
      end = [start[0] < (a[0] + a[2]) / 2 ? a[2] : a[0], start[1] < (a[1] + a[3]) / 2 ? a[3] : a[1]];
    }
    return new PathFollower([start, end], { ...this.options, random: this.random, loop: false });
  }
  step(dt, player) {
    if (this.route.done && this.route.pauseLeft <= EPS) {
      const heading = this.route.heading;
      this.route = this._route([this.x, this.z]);
      this.route.heading = heading;
    }
    this.route.step(dt, player);
  }
  get x() { return this.route.x; }
  get z() { return this.route.z; }
  get heading() { return this.route.heading; }
  get moving() { return this.route.moving; }
}

/** Circular lane coordinates keep vehicle order stable, including at the seam.
 * Spacing is centre-to-centre, in metres; choose it for the largest vehicle.
 */
export class TrafficLane {
  constructor({ from, to, speed = [4, 7], spacing = 12, count = 3 }, random = Math.random) {
    if (!point(from) || !point(to)) throw new Error('Traffic needs finite lane endpoints');
    this.length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    if (!(this.length > EPS)) throw new Error('Traffic lane must have length');
    if (!Number.isInteger(count) || count < 0 || !(spacing > 0) || !Number.isFinite(spacing) ||
        (count > 1 && count * spacing > this.length + EPS)) throw new Error('Traffic count does not fit lane spacing');
    if (!point(speed) || speed[0] < 0 || speed[1] < speed[0]) throw new Error('Invalid traffic speed range');
    this.from = [...from];
    this.ux = (to[0] - from[0]) / this.length;
    this.uz = (to[1] - from[1]) / this.length;
    this.spacing = spacing;
    this.vehicles = Array.from({ length: count }, (_, i) => ({
      distance: i * this.length / count, speed: between(speed, random),
      x: 0, z: 0, heading: Math.atan2(this.ux, this.uz), moving: false,
    }));
    this._moves = new Float64Array(count);
    this._gaps = new Float64Array(count);
    this._position();
  }

  _position() {
    for (const v of this.vehicles) {
      v.x = this.from[0] + this.ux * v.distance;
      v.z = this.from[1] + this.uz * v.distance;
    }
  }

  step(dt, player) {
    if (!(dt > 0) || !Number.isFinite(dt)) return;
    const n = this.vehicles.length;
    if (!n) return;
    // Bound both integration work and per-tick travel; a long browser stall
    // never lets a fast vehicle jump across another vehicle or the player.
    let remaining = Math.min(dt, 60);
    let fastest = 1;
    for (const v of this.vehicles) fastest = Math.max(fastest, v.speed);
    const quantum = Math.min(0.05, this.length / (fastest * 4));
    const lateral = player ? Math.abs((player.x - this.from[0]) * this.uz - (player.z - this.from[1]) * this.ux) : Infinity;
    const playerDistance = player ? (player.x - this.from[0]) * this.ux + (player.z - this.from[1]) * this.uz : 0;
    while (remaining > EPS) {
      const step = Math.min(quantum, remaining);
      remaining -= step;
      for (let i = 0; i < n; i++) {
        const v = this.vehicles[i];
        let move = v.speed * step;
        const stopDistance = 3 + (v.front || 0);
        if (lateral < (v.halfWidth ?? 1.15) + 0.35 && playerDistance >= -1 && playerDistance <= this.length + stopDistance) {
          const direct = playerDistance - v.distance;
          const ahead = playerDistance >= 0 && playerDistance < this.length ? mod(direct, this.length) : direct;
          if (Math.abs(direct) < 0.8 || (ahead >= 0 && ahead < stopDistance + 3)) {
            const clearance = Math.max(0, ahead - stopDistance);
            move = Math.min(move * Math.min(1, clearance / 3), clearance);
          }
        }
        this._moves[i] = move;
        this._gaps[i] = n === 1 ? Infinity : mod(this.vehicles[(i + 1) % n].distance - v.distance, this.length);
      }
      // Relax simultaneous moves, propagating a stopped leader through the
      // queue without freezing a convoy whose members all move together.
      for (let pass = 0; pass < n; pass++) {
        let changed = false;
        for (let i = 0; i < n; i++) {
          const allowed = Math.max(0, this._gaps[i] - this.spacing + this._moves[(i + 1) % n]);
          if (this._moves[i] > allowed + EPS) {
            this._moves[i] = allowed;
            changed = true;
          }
        }
        if (!changed) break;
      }
      for (let i = 0; i < n; i++) {
        const v = this.vehicles[i];
        v.distance = mod(v.distance + this._moves[i], this.length);
        v.moving = this._moves[i] > EPS;
      }
    }
    this._position();
  }
}
