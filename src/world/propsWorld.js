import * as THREE from "three";
import { toon } from "../core/Assets.js";
import { box, cyl, signBoard } from "./props.js";

// Procedural props for the "around the world" scenarios (Japan, Korea, Thailand, India, USA, UK,
// France, Italy, Netherlands, Australia). Same rules as props.js: real-life metres, origin on the
// ground, front faces +z, and a collider in userData for solid things.

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
function wheel(r, x, y, z, color = "#2b2b2b") {
  const w = mesh(new THREE.TorusGeometry(r, r * 0.3, 8, 18), toon(color), x, y, z);
  w.rotation.y = Math.PI / 2;
  return w;
}

// ---------------------------------------------------------------- Japan

/** IC-card ticket gate (two facing posts with a reader on top and a flap). Passage runs along z. */
export function ticketGate() {
  const g = new THREE.Group();
  for (const x of [-0.45, 0.45]) {
    g.add(box(0.2, 1.0, 1.2, "#cfd6e0", x, 0, 0, 0.05));
    g.add(box(0.2, 0.08, 0.4, "#2ecc71", x, 1.0, -0.3, 0.02)); // reader
    g.add(box(0.2, 0.05, 0.3, "#1f5fbf", x, 1.0, 0.25, 0.02));
  }
  g.add(box(0.7, 0.04, 0.1, "#ff5d5d", 0, 0.7, -0.5, 0.01)); // closed flap
  return withCollider(g, 1.3, 1.2);
}

export function vendingMachine(color = "#e63946") {
  const g = new THREE.Group();
  g.add(box(0.9, 1.9, 0.75, color, 0, 0, 0, 0.06));
  g.add(box(0.7, 1.0, 0.05, "#e6f4ff", 0, 0.7, 0.38, 0.02));
  const cols = ["#ff6b6b", "#ffd23f", "#4da3ff", "#6cc070", "#ff9a3c"];
  for (let i = 0; i < 5; i++) g.add(box(0.1, 0.28, 0.06, cols[i], -0.28 + i * 0.14, 1.15, 0.42, 0.02));
  for (let i = 0; i < 5; i++) g.add(box(0.1, 0.28, 0.06, cols[(i + 2) % 5], -0.28 + i * 0.14, 0.8, 0.42, 0.02));
  g.add(box(0.5, 0.18, 0.05, "#222", 0, 0.12, 0.38));
  return withCollider(g, 0.9, 0.75);
}

// ---------------------------------------------------------------- Korea

/** Table with an inset charcoal grill and an extractor hood tube. */
export function grillTable() {
  const g = new THREE.Group();
  g.add(box(1.5, 0.08, 1.0, "#d9b98a", 0, 0.72, 0, 0.03));
  for (const [x, z] of [[-0.65, -0.4], [0.65, -0.4], [-0.65, 0.4], [0.65, 0.4]]) g.add(box(0.07, 0.72, 0.07, "#8a6a47", x, 0, z, 0.01));
  g.add(cyl(0.3, 0.3, 0.06, "#2b2b2b", 0, 0.8, 0, 20));
  g.add(cyl(0.26, 0.26, 0.02, "#ff7b3a", 0, 0.87, 0, 20));
  g.add(cyl(0.05, 0.05, 1.4, "#9aa0ad", 0, 1.6, 0)); // tube down from the ceiling
  g.add(cyl(0.32, 0.12, 0.25, "#9aa0ad", 0, 1.35, 0));
  return withCollider(g, 1.5, 1.0);
}

export function lowStool(color = "#d62828") {
  const g = new THREE.Group();
  g.add(box(0.4, 0.06, 0.4, color, 0, 0.42, 0, 0.02));
  for (const [x, z] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) g.add(box(0.04, 0.42, 0.04, "#6b7280", x, 0, z));
  return g;
}

export function sojuBottle() {
  const g = new THREE.Group();
  g.add(cyl(0.05, 0.06, 0.22, "#5fbf8f"));
  g.add(cyl(0.025, 0.04, 0.1, "#5fbf8f", 0, 0.22, 0));
  g.add(cyl(0.052, 0.052, 0.08, "#e8f5e9", 0, 0.06, 0));
  return g;
}

// ---------------------------------------------------------------- Thailand / India

/** Three-wheeled taxi (tuk-tuk / auto-rickshaw), facing +z. */
export function rickshaw(color = "#ffd23f", sign = "") {
  const g = new THREE.Group();
  g.add(wheel(0.28, 0, 0.28, 0.85));
  g.add(wheel(0.28, -0.55, 0.28, -0.5));
  g.add(wheel(0.28, 0.55, 0.28, -0.5));
  g.add(box(1.0, 0.6, 1.7, color, 0, 0.35, -0.1, 0.18)); // body
  g.add(box(1.05, 0.12, 1.6, "#2b2b2b", 0, 1.55, -0.4, 0.05)); // roof
  g.add(box(1.0, 0.7, 0.05, "#bfe6ff", 0, 0.95, 0.5, 0.02)); // windscreen
  for (const x of [-0.48, 0.48]) g.add(box(0.05, 0.65, 0.05, "#2b2b2b", x, 0.95, -1.05));
  g.add(box(0.45, 0.12, 0.45, "#1f1f1f", 0, 0.62, 0.35)); // driver seat
  g.add(box(0.95, 0.12, 0.6, "#8d2b2b", 0, 0.62, -0.55)); // passenger bench
  g.add(box(0.06, 0.4, 0.06, "#c0c4cc", 0, 0.95, 0.75)); // handlebar post
  g.add(box(0.5, 0.05, 0.05, "#c0c4cc", 0, 1.3, 0.75));
  if (sign) {
    const s = signBoard([sign], { w: 0.9, h: 0.25, color: "#ffffff", fg: "#222", depth: 0.02 });
    s.position.set(0, 1.5, 0.55);
    g.add(s);
  }
  return withCollider(g, 1.2, 2.0);
}

export function cow() {
  const g = new THREE.Group();
  g.add(box(0.7, 0.7, 1.5, "#f4efe4", 0, 0.5, 0, 0.25)); // body
  g.add(box(0.28, 0.3, 0.3, "#8d6e63", 0.2, 0.9, 0.15, 0.1)); // patch
  g.add(box(0.5, 0.5, 0.55, "#f4efe4", 0, 0.95, 0.9, 0.18)); // head
  g.add(box(0.3, 0.2, 0.2, "#e8c4b8", 0, 0.82, 1.2, 0.08)); // muzzle
  for (const x of [-0.22, 0.22]) g.add(box(0.07, 0.2, 0.07, "#ffffff", x, 1.4, 0.8, 0.02)); // horns
  for (const [x, z] of [[-0.25, -0.55], [0.25, -0.55], [-0.25, 0.5], [0.25, 0.5]]) g.add(box(0.14, 0.55, 0.14, "#f4efe4", x, 0, z, 0.04));
  g.add(box(0.05, 0.5, 0.05, "#d9d2c3", 0, 0.4, -0.78)); // tail
  return withCollider(g, 0.9, 1.7);
}

/** Thai temple: golden stupa (chedi) on a white base with a tiered red-gold roof. */
export function thaiTemple() {
  const g = new THREE.Group();
  g.add(box(7, 0.8, 7, "#f3efe6", 0, 0, 0, 0.1));
  g.add(box(5.5, 1.2, 5.5, "#e9e2d0", 0, 0.8, 0, 0.1));
  const gold = "#f2b705";
  g.add(mesh(new THREE.CylinderGeometry(0.9, 1.9, 2.2, 20), toon(gold), 0, 3.1, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.5, 0.9, 1.8, 20), toon(gold), 0, 5.1, 0));
  g.add(mesh(new THREE.ConeGeometry(0.5, 2.6, 16), toon("#ffd23f"), 0, 7.3, 0));
  // pavilion with a tiered roof
  g.add(box(3.4, 2, 2.8, "#f3efe6", 4.8, 0, 0.6, 0.06));
  g.add(box(4.4, 0.35, 3.6, "#b5281c", 4.8, 2, 0.6, 0.1));
  g.add(box(3.4, 0.3, 2.8, gold, 4.8, 2.35, 0.6, 0.1));
  g.add(box(2.4, 0.3, 2.0, "#b5281c", 4.8, 2.65, 0.6, 0.1));
  return withCollider(g, 7, 7);
}

/** Sitting Buddha shrine (feet / soles should not point at it). */
export function buddhaShrine() {
  const g = new THREE.Group();
  g.add(box(2.4, 0.5, 1.6, "#b5281c", 0, 0, 0, 0.06));
  g.add(box(1.4, 0.7, 1.0, "#f2b705", 0, 0.5, 0, 0.12));
  g.add(mesh(new THREE.SphereGeometry(0.45, 14, 10), toon("#f2b705"), 0, 1.55, 0));
  g.add(box(0.6, 0.8, 0.5, "#f2b705", 0, 0.9, 0, 0.15));
  g.add(mesh(new THREE.ConeGeometry(0.1, 0.35, 8), toon("#ffd23f"), 0, 2.2, 0));
  for (const x of [-0.8, 0.8]) g.add(mesh(new THREE.SphereGeometry(0.12, 8, 6), toon("#ff6fb1"), x, 0.62, 0.55));
  return withCollider(g, 2.4, 1.6);
}

// ---------------------------------------------------------------- UK / USA

/** Red telephone box. */
export function phoneBox() {
  const g = new THREE.Group();
  g.add(box(1.0, 2.5, 1.0, "#d6221f", 0, 0, 0, 0.08));
  g.add(box(0.7, 1.4, 0.04, "#cfe8f7", 0, 0.7, 0.51, 0.01));
  g.add(box(1.1, 0.12, 1.1, "#d6221f", 0, 2.5, 0, 0.04));
  g.add(box(0.9, 0.2, 0.05, "#ffffff", 0, 2.15, 0.52, 0.01));
  return withCollider(g, 1.0, 1.0);
}

/** Long bar counter with a back shelf of bottles and a few beer taps; customer side is +z. */
export function barCounter(sign = "", { length = 8, color = "#6b3f2a" } = {}) {
  const g = new THREE.Group();
  g.add(box(length, 1.05, 0.9, color, 0, 0, 0, 0.06));
  g.add(box(length + 0.2, 0.08, 1.1, "#c9a27a", 0, 1.05, 0, 0.02));
  g.add(box(length, 2.4, 0.4, "#4a2a1c", 0, 0, -1.6, 0.04)); // back unit
  const cols = ["#f2b705", "#2a9d8f", "#d6221f", "#4da3ff", "#9b5de5"];
  for (let i = 0; i < length * 2; i++) g.add(cyl(0.07, 0.07, 0.3, cols[i % 5], -length / 2 + 0.3 + i * 0.5, 1.5, -1.45, 8));
  for (let i = 0; i < 4; i++) g.add(box(0.1, 0.35, 0.1, "#c0c4cc", -1.2 + i * 0.8, 1.1, -0.1, 0.02));
  if (sign) {
    const s = signBoard([sign], { w: Math.min(length - 1, 4), h: 0.6, color: "#2a2a2a", fg: "#ffd23f" });
    s.position.set(0, 2.7, -1.35);
    g.add(s);
  }
  return withCollider(g, length, 0.9);
}

/** American diner booth: two benches and a table. Opens towards +z. */
export function dinerBooth(color = "#d6221f") {
  const g = new THREE.Group();
  g.add(box(1.4, 0.08, 0.9, "#f3efe6", 0, 0.75, 0, 0.02));
  g.add(box(0.1, 0.75, 0.1, "#9aa0ad", 0, 0, 0));
  for (const x of [-1.0, 1.0]) {
    g.add(box(0.5, 0.5, 0.95, color, x, 0, 0, 0.1));
    g.add(box(0.12, 0.6, 0.95, color, x + Math.sign(x) * 0.25, 0.5, 0, 0.05));
  }
  return withCollider(g, 2.6, 1.0);
}

/** Sit-down table with two chairs (café / terrace). */
export function cafeTable(color = "#d6221f") {
  const g = new THREE.Group();
  g.add(cyl(0.4, 0.4, 0.05, "#f3efe6", 0, 0.72, 0, 20));
  g.add(cyl(0.04, 0.04, 0.72, "#6b7280"));
  for (const x of [-0.55, 0.55]) {
    g.add(box(0.36, 0.05, 0.36, color, x, 0.42, 0, 0.02));
    g.add(box(0.36, 0.4, 0.05, color, x, 0.45, 0, 0.02));
    g.children[g.children.length - 1].position.x = x + Math.sign(x) * 0.17;
    for (const [dx, dz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) g.add(box(0.03, 0.42, 0.03, "#6b7280", x + dx, 0, dz));
  }
  return withCollider(g, 1.5, 0.8);
}

// ---------------------------------------------------------------- Netherlands

/** Dutch "omafiets": upright bike with a basket, facing +z. */
export function bicycle(color = "#1d3557") {
  const g = new THREE.Group();
  g.add(wheel(0.34, 0, 0.36, 0.55, "#2b2b2b"));
  g.add(wheel(0.34, 0, 0.36, -0.55, "#2b2b2b"));
  g.add(box(0.04, 0.5, 0.9, color, 0, 0.4, 0, 0.02)); // frame
  g.add(box(0.04, 0.6, 0.04, color, 0, 0.45, 0.45)); // fork
  g.add(box(0.5, 0.04, 0.04, "#c0c4cc", 0, 1.05, 0.5, 0.01)); // handlebar
  g.add(box(0.22, 0.06, 0.4, "#3a3a3a", 0, 0.9, -0.25, 0.02)); // saddle
  g.add(box(0.3, 0.2, 0.25, "#b88a54", 0, 0.8, 0.7, 0.04)); // basket
  return withCollider(g, 0.4, 1.7);
}

// ---------------------------------------------------------------- France / Italy

export function bakery(sign = "Boulangerie", color = "#f5deb3") {
  const g = new THREE.Group();
  g.add(box(5, 4, 4, color, 0, 0, 0, 0.1));
  g.add(box(3.6, 2, 0.1, "#e6f4ff", 0, 0.6, 2.02, 0.02)); // shop window
  g.add(box(5.2, 0.2, 1.4, "#b5281c", 0, 2.9, 2.5, 0.02)); // awning
  const s = signBoard([sign], { w: 4, h: 0.7, color: "#3b2a1a", fg: "#ffd23f" });
  s.position.set(0, 3.2, 2.05);
  g.add(s);
  // baguettes in the window
  for (let i = 0; i < 6; i++) g.add(box(0.1, 0.1, 1.0, "#d49a4a", -1.2 + i * 0.45, 1.1, 1.5, 0.05));
  return withCollider(g, 5, 4);
}

/** Zinc bar counter used for the Italian espresso bar (standing customers). */
export function espressoBar(sign = "Bar") {
  const g = barCounter(sign, { length: 6, color: "#3b2a1a" });
  g.add(box(0.5, 0.45, 0.4, "#c0c4cc", 1.2, 1.1, -0.2, 0.06)); // espresso machine
  g.add(box(0.5, 0.22, 0.4, "#c0c4cc", 1.2, 1.55, -0.2, 0.06));
  return g;
}

export function cashRegister() {
  const g = new THREE.Group();
  g.add(box(0.9, 1.05, 0.7, "#cfd6e0", 0, 0, 0, 0.06));
  g.add(box(0.5, 0.3, 0.4, "#2b2b2b", 0, 1.05, 0, 0.04));
  g.add(box(0.3, 0.2, 0.04, "#7ec8ff", 0, 1.3, 0.2, 0.01));
  return withCollider(g, 0.9, 0.7);
}

export function sacreCoeur() {
  const g = new THREE.Group();
  g.add(box(14, 4, 7, "#f8f3e8", 0, 0, 0, 0.2));
  g.add(mesh(new THREE.SphereGeometry(2.6, 18, 12), toon("#fffaf0"), 0, 5, 0));
  for (const x of [-4.8, 4.8]) {
    g.add(mesh(new THREE.SphereGeometry(1.3, 14, 10), toon("#fffaf0"), x, 5, 1));
    g.add(cyl(1.2, 1.2, 1.5, "#f8f3e8", x, 4, 1));
  }
  g.add(mesh(new THREE.ConeGeometry(0.4, 2, 10), toon("#fffaf0"), 0, 8.9, 0));
  return withCollider(g, 14, 7);
}

// ---------------------------------------------------------------- Australia

/** Red-and-yellow patrol flag on a pole. */
export function beachFlag(topColor = "#d6221f", bottomColor = "#ffd23f") {
  const g = new THREE.Group();
  g.add(cyl(0.04, 0.04, 2.4, "#e5e7eb"));
  g.add(box(0.7, 0.28, 0.03, topColor, 0.38, 2.12, 0, 0.01));
  g.add(box(0.7, 0.28, 0.03, bottomColor, 0.38, 1.84, 0, 0.01));
  return g;
}

export function lifeguardTower() {
  const g = new THREE.Group();
  for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) g.add(box(0.12, 2.0, 0.12, "#f3efe6", x, 0, z));
  g.add(box(2.4, 0.12, 2.4, "#f3efe6", 0, 2.0, 0, 0.03));
  g.add(box(2.0, 1.2, 2.0, "#ffd23f", 0, 2.12, 0, 0.06));
  g.add(box(2.6, 0.14, 2.6, "#d6221f", 0, 3.32, 0, 0.04));
  const s = signBoard(["SURF LIFE SAVING"], { w: 2.0, h: 0.35, color: "#d6221f", fg: "#fff" });
  s.position.set(0, 2.5, 1.02);
  g.add(s);
  return withCollider(g, 2.4, 2.4);
}

export function beachUmbrella(color = "#ff6b6b") {
  const g = new THREE.Group();
  g.add(cyl(0.03, 0.03, 2.0, "#e5e7eb"));
  g.add(mesh(new THREE.ConeGeometry(1.1, 0.5, 12), toon(color), 0, 2.2, 0));
  g.add(mesh(new THREE.ConeGeometry(0.55, 0.5, 12), toon("#ffffff"), 0, 2.25, 0));
  g.children[2].scale.set(1.0, 0.7, 1.0);
  return g;
}

export function beachTowel(color = "#4da3ff") {
  const g = new THREE.Group();
  g.add(box(0.8, 0.03, 1.8, color, 0, 0, 0, 0.01));
  g.add(box(0.8, 0.032, 0.25, "#ffffff", 0, 0, 0.5, 0.01));
  return g;
}

export function surfboard(color = "#2ec4b6") {
  const g = new THREE.Group();
  g.add(box(0.5, 0.08, 2.1, color, 0, 0, 0, 0.04));
  g.add(box(0.06, 0.09, 1.8, "#ffffff", 0, 0, 0, 0.01));
  return g;
}

export const WORLD_PROPS = {
  ticketGate,
  vendingMachine,
  grillTable,
  lowStool,
  sojuBottle,
  rickshaw,
  cow,
  thaiTemple,
  buddhaShrine,
  phoneBox,
  barCounter,
  dinerBooth,
  cafeTable,
  bicycle,
  bakery,
  espressoBar,
  cashRegister,
  sacreCoeur,
  beachFlag,
  lifeguardTower,
  beachUmbrella,
  beachTowel,
  surfboard,
};
