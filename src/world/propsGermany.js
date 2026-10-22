import * as THREE from "three";
import { toon } from "../core/Assets.js";
import { box, cyl, signBoard } from "./props.js";
import { bicycle } from "./propsWorld.js";

// Procedural props specific to the Germany scenarios (trams, bikes, delivery vans, …).
// Same rules as props.js: real-life metres, origin on the ground, front faces +z,
// and a collider in userData for solid things. Every prop takes colour / variant args
// so a row of them can vary by seeded index. Vehicles run along local z.

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function withCollider(group, w, d, ox = 0, oz = 0) {
  group.userData.collider = { w, d, ox, oz };
  return group;
}
/** Wheel (tyre + hub) with its axle along x; registered in `spinners` so it can roll. */
function spokeWheel(r, x, y, z, spinners) {
  const w = new THREE.Group();
  const tyre = mesh(new THREE.CylinderGeometry(r, r, r * 0.6, 14), toon("#222428"));
  tyre.rotation.z = Math.PI / 2;
  w.add(tyre);
  w.add(mesh(new THREE.BoxGeometry(r * 0.64, r * 0.3, r * 0.3), toon("#c0c4cc")));
  w.position.set(x, y, z);
  spinners?.push({ w, r });
  return w;
}
/** Roll the wheels in `spinners` by however far the group moved since the last update. */
function spinWith(g, spinners) {
  const last = new THREE.Vector3();
  const now = new THREE.Vector3();
  let primed = false;
  g.userData.update = () => {
    g.getWorldPosition(now);
    if (primed) {
      const d = now.distanceTo(last);
      for (const s of spinners) s.w.rotation.x += d / s.r;
    }
    last.copy(now);
    primed = true;
  };
}
const pick = (arr, i) => arr[Math.abs(Math.round(i)) % arr.length];

// ---------------------------------------------------------------- trams

/** Straßenbahn along local z: 2–3 joined cars, bobbing pantograph, line + destination boards. */
export function tram(line = "12", dest = "Hauptbahnhof", sections = 3, color = "#e2231a") {
  const g = new THREE.Group();
  const n = Math.max(2, Math.min(3, Math.round(sections)));
  const secL = 8;
  const gap = 0.9;
  const total = n * secL + (n - 1) * gap;
  const spinners = [];
  for (let i = 0; i < n; i++) {
    const z = -total / 2 + secL / 2 + i * (secL + gap);
    g.add(box(2.4, 0.5, secL - 0.6, "#4b5563", 0, 0.25, z, 0.08));
    g.add(box(2.4, 2.5, secL, "#f4f4f2", 0, 0.7, z, 0.3));
    g.add(box(2.44, 0.55, secL - 0.2, color, 0, 0.8, z, 0.1)); // livery stripe
    g.add(box(2.46, 0.85, secL - 1.0, "#3b5878", 0, 1.9, z, 0.12)); // windows
    for (const dz of [-1.6, 1.6]) g.add(box(2.48, 1.9, 1.3, "#d4d8de", 0, 0.75, z + dz, 0.06)); // doors
    for (const dz of [-2.4, 2.4]) for (const sx of [-0.9, 0.9]) g.add(spokeWheel(0.38, sx, 0.4, z + dz, spinners));
    if (i < n - 1) g.add(box(2.1, 2.2, gap + 0.2, "#22262c", 0, 0.7, z + (secL + gap) / 2, 0.15)); // bellows
  }
  g.add(box(2.3, 0.18, total * 0.9, "#cfd3d9", 0, 3.2, 0, 0.05)); // roof gear
  const pan = new THREE.Group();
  pan.position.set(0, 3.3, -total / 2 + secL * 0.5);
  pan.add(box(0.1, 0.8, 0.1, "#2b2b2b", 0, 0, -0.5));
  pan.add(box(0.1, 0.8, 0.1, "#2b2b2b", 0, 0, 0.5));
  pan.add(box(1.8, 0.06, 0.1, "#111", 0, 0.8, 0, 0.01)); // contact strip
  g.add(pan);
  for (const s of [1, -1]) {
    const lbl = signBoard([`${line}  ${dest}`], { w: 2.0, h: 0.4, color: "#111827", fg: "#ffb000", depth: 0.02 });
    lbl.position.set(0, 2.62, s * (total / 2 + 0.01));
    if (s < 0) lbl.rotation.y = Math.PI;
    g.add(lbl);
    g.add(box(1.8, 0.3, 0.05, "#fff4c2", 0, 0.9, s * (total / 2 + 0.01), 0.02)); // headlight bar
  }
  const roll = { update: null };
  spinWith(g, spinners);
  roll.update = g.userData.update;
  g.userData.update = (dt, t) => {
    roll.update(dt, t);
    pan.position.y = 3.3 + Math.sin(t * 3) * 0.02;
  };
  return withCollider(g, 2.6, total);
}

/** Two rails with sleepers along local z; flush with the road. */
export function tramTrack(length = 20, gauge = 1.435) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) g.add(box(0.1, 0.06, length, "#8b8f98", (s * gauge) / 2, 0, 0, 0.02));
  for (let z = -length / 2 + 0.5; z < length / 2; z += 1.2) g.add(box(gauge + 0.7, 0.04, 0.3, "#6b6258", 0, 0, z, 0.01));
  return g;
}

/** Poles every ~12 m along local z with a contact wire spanning the whole length. Poles are solid. */
export function overheadWire(length = 24, height = 5.6, spacing = 12) {
  const g = new THREE.Group();
  const nPoles = Math.max(2, Math.floor(length / spacing) + 1);
  for (let i = 0; i < nPoles; i++) {
    const z = -length / 2 + (i * length) / (nPoles - 1);
    g.add(cyl(0.1, 0.13, height + 0.4, "#5a6068", -2.4, 0, z));
    g.add(box(2.6, 0.08, 0.08, "#5a6068", -1.1, height + 0.2, z, 0.01)); // cantilever arm
  }
  g.add(box(0.03, 0.03, length, "#222", 0, height, 0, 0.005));
  g.add(box(0.03, 0.03, length, "#222", 0, height + 0.25, 0, 0.005)); // catenary
  return withCollider(g, 0.4, length, -2.4, 0);
}

// ---------------------------------------------------------------- bikes

/** City bike with basket; variant 0..2 adds a rear rack or a step-through bar. */
export function cityBike(color = "#1d3557", variant = 0) {
  const g = bicycle(color);
  if (variant % 3 === 1) g.add(box(0.28, 0.08, 0.5, "#3a3a3a", 0, 0.95, -0.7, 0.02));
  if (variant % 3 === 2) g.add(box(0.05, 0.4, 0.05, "#c0c4cc", 0, 0.5, -0.1, 0.01));
  return g;
}

/** Long cargo bike (Lastenrad) with a wooden box up front. */
export function cargoBike(color = "#2a9d8f", boxColor = "#c89b5e") {
  const g = new THREE.Group();
  for (const z of [-0.9, 1.3]) {
    const w = mesh(new THREE.TorusGeometry(0.34, 0.07, 8, 18), toon("#2b2b2b"), 0, 0.36, z);
    w.rotation.y = Math.PI / 2;
    g.add(w);
  }
  g.add(box(0.05, 0.1, 2.2, color, 0, 0.5, 0.2, 0.02));
  g.add(box(0.7, 0.4, 0.9, boxColor, 0, 0.35, 0.95, 0.05));
  g.add(box(0.5, 0.04, 0.04, "#c0c4cc", 0, 1.05, -0.5, 0.01));
  g.add(box(0.22, 0.06, 0.4, "#3a3a3a", 0, 0.9, -0.7, 0.02));
  return withCollider(g, 0.8, 2.4, 0, 0.2);
}

/** Bike stand with `n` bikes leaning in a row (colours cycle; every 4th is a cargo bike). */
export function bikeRack(n = 5, colors = ["#e85d75", "#1d3557", "#2a9d8f", "#f6c945", "#6b7280"]) {
  const g = new THREE.Group();
  const count = Math.max(1, Math.round(n));
  const step = 0.6;
  g.add(box(count * step + 0.2, 0.06, 0.06, "#8a8f9c", 0, 0.45, 0.3, 0.01));
  for (let i = 0; i < count; i++) {
    const cargo = i % 4 === 3;
    const b = cargo ? cargoBike(pick(colors, i)) : cityBike(pick(colors, i), i);
    b.userData.collider = undefined;
    b.scale.setScalar(cargo ? 0.8 : 1);
    b.position.x = (i - (count - 1) / 2) * step;
    b.rotation.z = i % 2 ? 0.08 : -0.08;
    g.add(b);
  }
  return withCollider(g, count * step + 0.2, 1.8);
}

/** Painted bike lane along local z: red strip, edge line and bicycle pictograms. */
export function bikeLaneMarking(length = 6, color = "#c8483f") {
  const g = new THREE.Group();
  g.add(box(1.5, 0.02, length, color, 0, 0, 0, 0.005));
  g.add(box(0.1, 0.03, length, "#ffffff", -0.7, 0, 0, 0.005));
  for (let z = -length / 2 + 1.5; z < length / 2 - 0.8; z += 4) {
    g.add(box(0.5, 0.03, 0.08, "#ffffff", 0, 0, z + 0.1, 0.005));
    g.add(box(0.1, 0.03, 0.1, "#ffffff", 0, 0, z + 0.45, 0.005));
    g.add(box(0.1, 0.03, 0.1, "#ffffff", 0, 0, z - 0.2, 0.005));
  }
  return g;
}

// ---------------------------------------------------------------- road vehicles

function carWheels(g, track, zs, r, spinners) {
  for (const z of zs) for (const s of [-1, 1]) g.add(spokeWheel(r, (s * track) / 2, r, z, spinners));
}

/** Yellow delivery van, no brand text. */
export function parcelVan(color = "#ffcc00", stripe = "#c0c4cc") {
  const g = new THREE.Group();
  const spinners = [];
  g.add(box(2.0, 2.3, 4.4, color, 0, 0.45, -0.5, 0.15)); // cargo box
  g.add(box(2.0, 1.5, 1.4, color, 0, 0.45, 2.0, 0.2)); // cab
  g.add(box(1.8, 0.65, 0.06, "#2d4a66", 0, 1.35, 2.72, 0.02)); // windscreen
  g.add(box(2.02, 0.12, 4.4, stripe, 0, 1.2, -0.5, 0.02));
  g.add(box(2.1, 0.3, 0.3, "#333", 0, 0.4, 2.7, 0.05)); // bumper
  carWheels(g, 1.7, [-1.4, 1.8], 0.36, spinners);
  spinWith(g, spinners);
  return withCollider(g, 2.1, 5.8, 0, 0.3);
}

/** Orange refuse lorry (Müllabfuhr) with a rear loader. */
export function binLorry(color = "#f26a1b") {
  const g = new THREE.Group();
  const spinners = [];
  g.add(box(2.4, 0.5, 8, "#3b3f46", 0, 0.4, 0, 0.1)); // chassis
  g.add(box(2.5, 1.6, 2.0, color, 0, 0.85, 3.0, 0.2)); // cab
  g.add(box(2.3, 0.7, 0.06, "#2d4a66", 0, 1.7, 4.02, 0.02));
  g.add(box(2.5, 2.4, 5.2, color, 0, 0.9, -1.4, 0.35)); // body
  g.add(box(2.3, 0.9, 1.0, "#7a7f88", 0, 0.7, -4.2, 0.1)); // rear loader hopper
  g.add(box(2.0, 0.15, 0.7, "#222", 0, 1.6, -4.4, 0.02));
  g.add(box(2.52, 0.18, 5.2, "#ffffff", 0, 1.8, -1.4, 0.03)); // stripe
  carWheels(g, 2.1, [-2.6, 2.8], 0.55, spinners);
  spinWith(g, spinners);
  return withCollider(g, 2.6, 8.8);
}

/** Small hatchback; pass any colour. */
export function germanCar(color = "#3a6ea5") {
  const g = new THREE.Group();
  const spinners = [];
  g.add(box(1.72, 0.7, 3.9, color, 0, 0.3, 0, 0.2));
  g.add(box(1.6, 0.6, 2.2, color, 0, 0.95, -0.2, 0.25)); // cabin
  g.add(box(1.62, 0.42, 1.9, "#33485e", 0, 1.0, -0.2, 0.1)); // glass band
  g.add(box(1.5, 0.12, 0.05, "#fff4c2", 0, 0.65, 1.96, 0.02)); // lights
  g.add(box(0.5, 0.12, 0.04, "#f3f3f3", 0, 0.38, 1.97, 0.01)); // plate
  carWheels(g, 1.5, [-1.2, 1.2], 0.3, spinners);
  spinWith(g, spinners);
  return withCollider(g, 1.8, 4.0);
}

/** Cream/beige taxi with a roof sign. */
export function germanTaxi(color = "#efe3c2") {
  const g = germanCar(color);
  g.add(box(0.6, 0.18, 0.25, "#fff6b0", 0, 1.55, -0.1, 0.04)); // roof sign
  return g;
}

// ---------------------------------------------------------------- street character

const SHOPS = {
  spaeti: { sign: "Späti", color: "#2a9d8f" },
  baeckerei: { sign: "Bäckerei", color: "#b5651d" },
  apotheke: { sign: "Apotheke", color: "#2e9e4f" },
};
const STUCCO = ["#e8d9b5", "#d9b8a0", "#c9d6c3", "#e3c97a", "#bfc9d8"];

/**
 * 4–5 storey stucco Altbau townhouse, front at +z. `shop` is "spaeti" | "baeckerei" | "apotheke"
 * or empty for a plain doorway; `colorIndex` (number, or a colour string) picks the stucco.
 */
export function altbauFacade(floors = 5, shop = "", colorIndex = 0, w = 8) {
  const g = new THREE.Group();
  const n = Math.max(4, Math.min(5, Math.round(floors)));
  const color = typeof colorIndex === "string" ? colorIndex : pick(STUCCO, colorIndex);
  const fh = 3.3;
  const d = 10;
  const H = n * fh + 1.2;
  g.add(box(w, H, d, color, 0, 0, 0, 0.1));
  g.add(box(w + 0.2, 0.25, d + 0.3, "#f2ead6", 0, H - 0.25, 0.1, 0.04)); // top cornice
  g.add(box(w + 0.1, 0.5, d, "#6b5a4c", 0, H, 0, 0.1)); // roof edge
  const cols = Math.max(2, Math.round(w / 2.4));
  const cw = w / cols;
  const fz = d / 2;
  for (let f = 0; f < n; f++) {
    const y = f * fh + 1.2;
    if (f > 0) g.add(box(w + 0.15, 0.15, 0.2, "#f2ead6", 0, y - 0.1, fz + 0.05, 0.02)); // floor cornice
    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + cw * (c + 0.5);
      if (f === 0) {
        if (!shop && c === Math.floor(cols / 2)) g.add(box(1.4, 2.4, 0.1, "#4a3426", x, 0, fz + 0.02)); // door
        continue;
      }
      g.add(box(1.2, 0.12, 0.2, "#f2ead6", x, y + 0.85, fz + 0.08, 0.02)); // sill
      g.add(box(1.0, 2.0, 0.08, "#5d7690", x, y + 0.95, fz + 0.02, 0.02)); // tall window
      g.add(box(1.25, 0.18, 0.15, "#f2ead6", x, y + 3.0, fz + 0.05, 0.02)); // lintel
      g.add(box(0.05, 2.0, 0.1, "#f8f8f8", x, y + 0.95, fz + 0.07, 0.01)); // mullion
      if (f === 2 && c % 2 === 0) {
        g.add(box(cw * 0.8, 0.1, 1.0, "#6b6f78", x, y + 0.75, fz + 0.5, 0.02)); // balcony slab
        g.add(box(cw * 0.8, 0.8, 0.05, "#2b2b2b", x, y + 0.85, fz + 0.98, 0.01)); // railing
      }
    }
  }
  const s = SHOPS[shop];
  if (s) {
    g.add(box(w - 0.6, 2.2, 0.1, "#9fc7d9", 0, 0.1, fz + 0.03)); // shop window
    g.add(box(w - 0.2, 0.2, 0.25, "#2b2b2b", 0, 2.4, fz + 0.1, 0.02)); // fascia
    const sign = signBoard([s.sign], { w: Math.min(3.6, w - 1), h: 0.7, color: s.color, fg: "#ffffff", depth: 0.05 });
    sign.position.set(0, 2.45, fz + 0.3);
    g.add(sign);
    g.add(box(1.0, 2.1, 0.08, "#4a3426", -w / 2 + 0.8, 0, fz + 0.06)); // entrance
  }
  g.userData.fade = true;
  return withCollider(g, w, d);
}

/** Fachwerkhaus: white plaster with dark timber frame and a steep roof, front at +z. */
export function halfTimberedHouse(plaster = "#f1e8d2", timber = "#4a3426", floors = 2) {
  const g = new THREE.Group();
  const w = 7;
  const d = 7;
  const n = Math.max(2, Math.min(3, Math.round(floors)));
  const fh = 2.8;
  const H = n * fh;
  g.add(box(w, H, d, plaster, 0, 0, 0, 0.08));
  for (let f = 0; f <= n; f++) g.add(box(w + 0.1, 0.18, 0.14, timber, 0, f * fh - (f ? 0.09 : 0), d / 2 + 0.03, 0.02));
  for (let i = 0; i <= 4; i++) g.add(box(0.18, H, 0.14, timber, -w / 2 + (i * w) / 4, 0, d / 2 + 0.03, 0.02));
  for (let f = 0; f < n; f++) {
    for (const x of [-1.75, 1.75]) {
      g.add(box(0.9, 1.2, 0.06, "#5d7690", x, f * fh + 1.0, d / 2 + 0.08, 0.02));
      g.add(box(1.0, 0.1, 0.1, timber, x, f * fh + 0.95, d / 2 + 0.1, 0.01));
    }
  }
  g.add(box(1.1, 2.1, 0.08, "#6b4a30", 0, 0, d / 2 + 0.06)); // door
  for (const s of [-1, 1]) {
    const slab = box(w / 1.3, 0.2, d + 0.6, "#a2432e", s * (w / 4), H + 1.3, 0, 0.03);
    slab.rotation.z = -s * 0.95;
    g.add(slab);
  }
  g.userData.fade = true;
  return withCollider(g, w, d);
}

/** Round Litfaßsäule advertising column with poster bands; `posterIndex` varies the colours. */
export function litfassSaeule(posterIndex = 0) {
  const g = new THREE.Group();
  const cols = ["#d94f4f", "#4f8ad9", "#e8c34a", "#5cb07a", "#c07ad9"];
  g.add(cyl(0.6, 0.6, 0.3, "#2f6b4f"));
  g.add(cyl(0.5, 0.5, 1.9, pick(cols, posterIndex), 0, 0.3));
  g.add(cyl(0.505, 0.505, 0.8, pick(cols, posterIndex + 2), 0, 0.9));
  g.add(cyl(0.58, 0.45, 0.3, "#2f6b4f", 0, 2.2)); // cap
  g.add(cyl(0.2, 0.3, 0.2, "#2f6b4f", 0, 2.5));
  return withCollider(g, 1.2, 1.2);
}

/** Blue street-name sign (Straßenschild) on a pole. */
export function streetSignDE(name = "Lindenstraße", number = "") {
  const g = new THREE.Group();
  g.add(cyl(0.04, 0.04, 2.6, "#8a8f9c"));
  const b = signBoard([number ? `${name}  ${number}` : name], { w: 0.9, h: 0.22, color: "#1f4e9c", fg: "#ffffff", depth: 0.03 });
  b.position.set(0, 2.4, 0.05);
  g.add(b);
  return withCollider(g, 0.2, 0.2);
}

export const DE_PROPS = {
  tram,
  tramTrack,
  overheadWire,
  cityBike,
  cargoBike,
  bikeRack,
  bikeLaneMarking,
  parcelVan,
  binLorry,
  germanTaxi,
  germanCar,
  altbauFacade,
  halfTimberedHouse,
  litfassSaeule,
  streetSignDE,
};
