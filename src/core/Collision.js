// 2D collision on the XZ plane: the player is a circle, the world is axis-aligned boxes.

export class CollisionWorld {
  constructor() {
    this.boxes = []; // { minX, maxX, minZ, maxZ, tag? }
  }

  addBox(minX, minZ, maxX, maxZ, tag) {
    const box = { minX, minZ, maxX, maxZ, tag, enabled: true };
    this.boxes.push(box);
    return box;
  }

  /** Box centred on (x, z) with full size w × d. */
  addRect(x, z, w, d, tag) {
    return this.addBox(x - w / 2, z - d / 2, x + w / 2, z + d / 2, tag);
  }

  /**
   * Move a circle from (x, z) by (dx, dz), sliding along boxes.
   * Returns the resolved { x, z }.
   */
  move(x, z, dx, dz, radius) {
    // Resolve axes separately so the circle slides along walls.
    let nx = x + dx;
    let nz = z;
    for (const b of this.boxes) if (b.enabled) [nx, nz] = pushOut(nx, nz, radius, b);
    nz += dz;
    for (const b of this.boxes) if (b.enabled) [nx, nz] = pushOut(nx, nz, radius, b);
    return { x: nx, z: nz };
  }

  hits(x, z, radius) {
    return this.boxes.some((b) => b.enabled && overlap(x, z, radius, b));
  }
}

function overlap(x, z, r, b) {
  const cx = Math.max(b.minX, Math.min(x, b.maxX));
  const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
  const dx = x - cx;
  const dz = z - cz;
  return dx * dx + dz * dz < r * r;
}

function pushOut(x, z, r, b) {
  const cx = Math.max(b.minX, Math.min(x, b.maxX));
  const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
  let dx = x - cx;
  let dz = z - cz;
  const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return [x, z];
  if (d2 > 1e-9) {
    const d = Math.sqrt(d2);
    return [cx + (dx / d) * r, cz + (dz / d) * r];
  }
  // Centre is inside the box: push out along the shortest axis.
  const left = x - b.minX + r;
  const right = b.maxX - x + r;
  const down = z - b.minZ + r;
  const up = b.maxZ - z + r;
  const m = Math.min(left, right, down, up);
  if (m === left) return [b.minX - r, z];
  if (m === right) return [b.maxX + r, z];
  if (m === down) return [x, b.minZ - r];
  return [x, b.maxZ + r];
}
