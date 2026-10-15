import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { toon } from "../core/Assets.js";

// Procedural placeholder props for country-specific objects that no free kit covers.
// Later these can be swapped for Blender-made .glb files with the same name and size.
// All sizes in metres; origin at ground level.

const geoCache = new Map();
function rbox(w, h, d, r = 0.06) {
  const key = `${w}|${h}|${d}|${r}`;
  if (!geoCache.has(key)) geoCache.set(key, new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)));
  return geoCache.get(key);
}

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Box resting on the ground at (x, z). */
export function box(w, h, d, color, x = 0, y = 0, z = 0, r = 0.06) {
  return mesh(rbox(w, h, d, r), toon(color), x, y + h / 2, z);
}

export function cyl(rt, rb, h, color, x = 0, y = 0, z = 0, seg = 16) {
  return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), toon(color), x, y + h / 2, z);
}

// ---------------------------------------------------------------- text

export function textTexture(lines, { w = 512, h = 256, bg = "#ffffff", fg = "#333", font = 48, align = "center", pad = 24 } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  const arr = Array.isArray(lines) ? lines : [lines];
  const lh = h / arr.length;
  arr.forEach((line, i) => {
    const l = typeof line === "string" ? { text: line } : line;
    g.fillStyle = l.color || fg;
    g.font = `${l.bold === false ? "" : "bold "}${l.size || font}px "Baloo 2", system-ui, sans-serif`;
    g.textAlign = l.align || align;
    g.textBaseline = "middle";
    const x = g.textAlign === "left" ? pad : g.textAlign === "right" ? w - pad : w / 2;
    g.fillText(l.text, x, lh * i + lh / 2, w - pad * 2);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** A flat sign board with text on the front (+z) face. */
export function signBoard(lines, { w = 2, h = 1, depth = 0.08, color = "#ffffff", fg = "#333", font, px = 256 } = {}) {
  const g = new THREE.Group();
  g.add(box(w, h, depth, color, 0, 0, 0, 0.03));
  const tex = textTexture(lines, { w: px * (w / h), h: px, bg: color, fg, font: font || px * 0.35 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.9), new THREE.MeshBasicMaterial({ map: tex }));
  face.position.set(0, h / 2, depth / 2 + 0.002);
  g.add(face);
  return g;
}

/** Sign on a pole. */
export function signPost(lines, opts = {}) {
  const { height = 2.2, w = 1.6, h = 0.8, poleColor = "#8a8f9c" } = opts;
  const g = new THREE.Group();
  g.add(cyl(0.05, 0.05, height, poleColor));
  const b = signBoard(lines, { w, h, ...opts });
  b.position.y = height - 0.1;
  g.add(b);
  return g;
}

// ---------------------------------------------------------------- Germany

export function ticketMachine() {
  const g = new THREE.Group();
  g.add(box(1.0, 1.9, 0.6, "#e2231a")); // DB red body
  g.add(box(0.9, 0.35, 0.62, "#ffffff", 0, 1.5, 0)); // header
  const header = signBoard(["DB  Fahrkarten"], { w: 0.86, h: 0.3, color: "#ffffff", fg: "#e2231a", depth: 0.02 });
  header.position.set(0, 1.52, 0.31);
  g.add(header);
  const screen = mesh(new THREE.PlaneGeometry(0.6, 0.45), toon("#7ec8ff", { emissive: "#2a6aa8" }), 0, 1.15, 0.305);
  g.add(screen);
  g.add(box(0.5, 0.08, 0.1, "#333", 0, 0.75, 0.3)); // ticket slot
  g.add(box(0.12, 0.2, 0.06, "#ffd34d", 0.3, 0.85, 0.31)); // coin slot
  return withCollider(g, 1.0, 0.6);
}

export function validator() {
  const g = new THREE.Group();
  g.add(cyl(0.06, 0.06, 1.1, "#9aa0ad"));
  g.add(box(0.35, 0.45, 0.3, "#ffcc00", 0, 1.05, 0, 0.08));
  g.add(box(0.25, 0.06, 0.04, "#333", 0, 1.3, 0.15));
  const lbl = signBoard(["Entwerter"], { w: 0.33, h: 0.12, color: "#1f5fbf", fg: "#fff", depth: 0.01 });
  lbl.position.set(0, 1.1, 0.16);
  g.add(lbl);
  return withCollider(g, 0.4, 0.4);
}

/** German bus stop: green "H" on a yellow disc. */
export function busStopSign(line, dest) {
  const g = new THREE.Group();
  g.add(cyl(0.05, 0.05, 2.6, "#9aa0ad"));
  const disc = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 32), toon("#ffd400"), 0, 2.55, 0);
  disc.rotation.x = Math.PI / 2;
  g.add(disc);
  const h = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: textTexture(["H"], { w: 128, h: 128, bg: "#ffd400", fg: "#0d8a3a", font: 110 }) }));
  h.position.set(0, 2.55, 0.03);
  g.add(h);
  const plate = signBoard([{ text: `Bus ${line}`, size: 70 }, { text: dest, size: 46, bold: false }], {
    w: 0.9,
    h: 0.5,
    color: "#ffffff",
    fg: "#0d5a2a",
  });
  plate.position.set(0, 1.85, 0);
  g.add(plate);
  return withCollider(g, 0.3, 0.3);
}

export function busShelter() {
  const g = new THREE.Group();
  g.add(box(3, 0.08, 1.4, "#cfd6e0", 0, 2.4, 0));
  g.add(box(3, 2.4, 0.06, "#bfe6ff", 0, 0, -0.65, 0.02));
  g.children[1].material = toon("#bfe6ff", { opacity: 0.5 });
  g.add(box(0.08, 2.4, 0.08, "#8a8f9c", -1.45, 0, -0.65));
  g.add(box(0.08, 2.4, 0.08, "#8a8f9c", 1.45, 0, -0.65));
  g.add(box(2.2, 0.45, 0.4, "#c9a27a", 0, 0, -0.35)); // bench
  return withCollider(g, 3, 0.4, 0, -0.55);
}

export function departureBoard(rows) {
  const g = new THREE.Group();
  g.add(cyl(0.06, 0.06, 2.4, "#6b7280", -1.1));
  g.add(cyl(0.06, 0.06, 2.4, "#6b7280", 1.1));
  const lines = [
    { text: "Abfahrt / Departures", size: 44, color: "#ffffff" },
    ...rows.map((r) => ({ text: r, size: 40, color: "#ffe066", align: "left" })),
  ];
  const b = signBoard(lines, { w: 2.6, h: 1.2, color: "#14306b", fg: "#fff", px: 320 });
  b.position.y = 2.2;
  g.add(b);
  const back = signBoard(lines, { w: 2.6, h: 1.2, color: "#14306b", fg: "#fff", px: 320 });
  back.position.y = 2.2;
  back.rotation.y = Math.PI;
  g.add(back);
  return withCollider(g, 2.4, 0.3);
}

/** Red/white S-Bahn train along local z. */
export function sbahnTrain(length = 16, dest = "S8 Hauptbahnhof") {
  const g = new THREE.Group();
  g.add(box(2.6, 0.6, length, "#4b5563", 0, 0, 0, 0.1)); // undercarriage
  g.add(box(2.8, 2.6, length, "#ffffff", 0, 0.6, 0, 0.35));
  g.add(box(2.84, 0.7, length - 0.4, "#e2231a", 0, 0.75, 0, 0.1));
  // windows
  for (let i = -length / 2 + 1.5; i < length / 2 - 1; i += 2.2) {
    g.add(box(2.86, 0.8, 1.4, "#5a7fa6", 0, 2.0, i, 0.12));
  }
  // doors (yellowish) on both sides
  for (const zz of [-length / 4, length / 4]) {
    g.add(box(2.88, 2.0, 1.3, "#d4d8de", 0, 0.65, zz, 0.08));
  }
  // destination display at both ends
  for (const s of [1, -1]) {
    const d = signBoard([dest], { w: 2.0, h: 0.4, color: "#111827", fg: "#ffb000", depth: 0.02 });
    d.position.set(0, 2.55, s * (length / 2 + 0.01));
    if (s < 0) d.rotation.y = Math.PI;
    g.add(d);
  }
  return withCollider(g, 2.9, length);
}

export function cityBus(line = "34", dest = "Lindenstraße", color = "#f6c945") {
  const g = new THREE.Group();
  const L = 11;
  g.add(box(2.5, 2.7, L, color, 0, 0.35, 0, 0.4));
  g.add(box(2.54, 0.9, L - 1.2, "#3c5a80", 0, 1.6, -0.2, 0.15)); // window band
  for (const zz of [-3.5, 3.5]) {
    for (const xx of [-1.15, 1.15]) {
      const wh = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 18), toon("#2b2b2b"), xx, 0.5, zz);
      wh.rotation.z = Math.PI / 2;
      g.add(wh);
    }
  }
  const d = signBoard([`${line}  ${dest}`], { w: 2.1, h: 0.4, color: "#111827", fg: "#ffb000", depth: 0.02 });
  d.position.set(0, 2.55, L / 2 + 0.01);
  g.add(d);
  return withCollider(g, 2.6, L);
}

export function infoDesk() {
  const g = new THREE.Group();
  g.add(box(3, 1.1, 1, "#f0e3cf", 0, 0, 0, 0.12));
  g.add(box(3.1, 0.08, 1.1, "#c9a27a", 0, 1.1, 0));
  const s = signPost([{ text: "i  Information", size: 90 }], { height: 2.8, w: 1.8, h: 0.5, color: "#1f5fbf", fg: "#fff" });
  s.position.set(0, 0, -0.4);
  g.add(s);
  return withCollider(g, 3, 1);
}

export function suitcase(color = "#ff8fab") {
  const g = new THREE.Group();
  g.add(box(0.45, 0.6, 0.25, color, 0, 0.05, 0, 0.08));
  g.add(box(0.2, 0.25, 0.04, "#555", 0, 0.65, 0, 0.02));
  return g;
}

export function bench() {
  const g = new THREE.Group();
  g.add(box(1.8, 0.1, 0.5, "#c9a27a", 0, 0.45, 0));
  g.add(box(1.8, 0.5, 0.08, "#c9a27a", 0, 0.55, -0.22));
  g.add(box(0.08, 0.45, 0.45, "#6b7280", -0.8));
  g.add(box(0.08, 0.45, 0.45, "#6b7280", 0.8));
  return withCollider(g, 1.8, 0.5);
}

export function plant() {
  const g = new THREE.Group();
  g.add(cyl(0.3, 0.22, 0.5, "#d98f5f"));
  const leaves = mesh(new THREE.IcosahedronGeometry(0.5, 1), toon("#6cc070"), 0, 0.95, 0);
  g.add(leaves);
  return withCollider(g, 0.6, 0.6);
}

export function tree() {
  const g = new THREE.Group();
  g.add(cyl(0.18, 0.25, 2, "#9c6b43"));
  g.add(mesh(new THREE.IcosahedronGeometry(1.4, 1), toon("#7cc66b"), 0, 3, 0));
  g.add(mesh(new THREE.IcosahedronGeometry(1.0, 1), toon("#8fd67c"), 0.5, 3.8, 0.2));
  return withCollider(g, 0.5, 0.5);
}

export function lamp() {
  const g = new THREE.Group();
  g.add(cyl(0.07, 0.09, 4, "#5b6170"));
  g.add(box(0.5, 0.15, 0.3, "#5b6170", 0.2, 4, 0));
  g.add(mesh(new THREE.SphereGeometry(0.14, 12, 8), toon("#fff3b0", { emissive: "#806a20" }), 0.3, 3.95, 0));
  return withCollider(g, 0.25, 0.25);
}

/** Gate / glass doors with a sign. */
export function arrivalGate(text) {
  const g = new THREE.Group();
  g.add(box(0.3, 3, 0.3, "#9aa0ad", -2));
  g.add(box(0.3, 3, 0.3, "#9aa0ad", 2));
  const s = signBoard([text], { w: 4.3, h: 0.6, color: "#ffd400", fg: "#222" });
  s.position.y = 3;
  g.add(s);
  return g;
}

// ---------------------------------------------------------------- Vietnam

/** Cub-style motorbike, facing +z. */
export function motorbike(color = "#e85d75") {
  const g = new THREE.Group();
  for (const zz of [-0.6, 0.6]) {
    const w = mesh(new THREE.TorusGeometry(0.24, 0.08, 8, 18), toon("#2b2b2b"), 0, 0.32, zz);
    w.rotation.y = Math.PI / 2;
    g.add(w);
  }
  g.add(box(0.32, 0.35, 1.2, color, 0, 0.35, 0, 0.12)); // body
  g.add(box(0.3, 0.12, 0.6, "#3a3a3a", 0, 0.72, -0.2, 0.05)); // seat
  g.add(box(0.28, 0.5, 0.3, color, 0, 0.45, 0.55, 0.1)); // leg shield
  g.add(box(0.7, 0.06, 0.06, "#c0c4cc", 0, 1.0, 0.6, 0.02)); // handlebar
  g.add(mesh(new THREE.SphereGeometry(0.09, 10, 8), toon("#fff3b0", { emissive: "#806a20" }), 0, 0.88, 0.72)); // headlight
  return g;
}

export function plasticStool(color = "#e63946") {
  const g = new THREE.Group();
  g.add(cyl(0.17, 0.2, 0.36, color, 0, 0, 0, 14));
  g.add(cyl(0.18, 0.18, 0.04, color, 0, 0.36, 0, 14));
  return g;
}

export function lowTable(color = "#4da3ff") {
  const g = new THREE.Group();
  g.add(box(0.8, 0.05, 0.6, color, 0, 0.5, 0, 0.02));
  for (const [x, z] of [
    [-0.35, -0.25],
    [0.35, -0.25],
    [-0.35, 0.25],
    [0.35, 0.25],
  ])
    g.add(box(0.05, 0.5, 0.05, color, x, 0, z, 0.01));
  return g;
}

export function phoBowl() {
  const g = new THREE.Group();
  const bowlMat = toon("#ffffff").clone();
  bowlMat.side = THREE.DoubleSide;
  g.add(mesh(new THREE.SphereGeometry(0.13, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), bowlMat, 0, 0.13, 0));
  const broth = mesh(new THREE.CircleGeometry(0.12, 16), toon("#e9b25f"), 0, 0.12, 0);
  broth.rotation.x = -Math.PI / 2;
  g.add(broth);
  g.add(box(0.06, 0.01, 0.04, "#a0522d", 0.03, 0.125, 0.02, 0.005));
  g.add(box(0.03, 0.012, 0.03, "#6cc070", -0.04, 0.125, -0.02, 0.005));
  return g;
}

/** Street phở stall: cart with glass box, sign, stools and low tables. */
export function phoStall() {
  const g = new THREE.Group();
  // cart
  g.add(box(1.6, 0.9, 0.8, "#2e86de", 0, 0.1));
  g.add(box(1.5, 0.7, 0.75, "#e6f4ff", 0, 1.0, 0, 0.04));
  g.children[1].material = toon("#e6f4ff", { opacity: 0.6 });
  g.add(cyl(0.32, 0.32, 0.55, "#b0b7c3", -0.4, 1.0, 0)); // broth pot
  g.add(cyl(0.34, 0.34, 0.04, "#8a919c", -0.4, 1.55, 0));
  const sign = signBoard([{ text: "PHỞ BÒ", size: 120 }, { text: "Gia truyền", size: 60, bold: false }], {
    w: 1.6,
    h: 0.7,
    color: "#d62828",
    fg: "#ffd60a",
  });
  sign.position.set(0, 1.75, 0);
  g.add(sign);
  for (const [x, z] of [
    [-0.7, 0.35],
    [0.7, 0.35],
  ])
    g.add(box(0.06, 1.75, 0.06, "#8a919c", x, 0, z));
  return withCollider(g, 1.6, 0.8);
}

/** Bundle of overhead cables – a Hanoi street icon. */
export function cableTangle(len = 20) {
  const g = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: "#2b2b2b" });
  for (let i = 0; i < 9; i++) {
    const pts = [];
    const y0 = 5.4 + Math.random() * 0.6;
    const sag = 0.3 + Math.random() * 0.5;
    for (let k = 0; k <= 12; k++) {
      const t = k / 12;
      pts.push(new THREE.Vector3(-len / 2 + t * len, y0 - Math.sin(t * Math.PI) * sag, (Math.random() - 0.5) * 0.25));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  return g;
}

export function utilityPole() {
  const g = new THREE.Group();
  g.add(cyl(0.12, 0.15, 6.2, "#a1a1aa"));
  g.add(box(0.8, 0.12, 0.12, "#71717a", 0, 5.6, 0));
  return withCollider(g, 0.35, 0.35);
}

export function lanternString(len = 8, colors = ["#ff4d4d", "#ffd23f", "#ff8c42"]) {
  const g = new THREE.Group();
  const n = Math.floor(len / 1.1);
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + (i + 0.5) * (len / n);
    const y = 4.2 - Math.sin(((i + 0.5) / n) * Math.PI) * 0.4;
    g.add(mesh(new THREE.SphereGeometry(0.18, 12, 10), toon(colors[i % colors.length], { emissive: "#401010" }), x, y, 0));
  }
  return g;
}

/** Narrow colourful "tube house" shopfront facade. */
export function tubeHouse(color = "#ffd166", floors = 3, w = 4.2, sign) {
  const g = new THREE.Group();
  const h = floors * 3;
  g.add(box(w, h, 6, color, 0, 0, 0, 0.1));
  for (let f = 1; f < floors; f++) {
    g.add(box(w - 0.6, 1.4, 0.2, "#6b8fb3", 0, f * 3 + 0.8, 3.0, 0.05)); // window
    g.add(box(w - 0.3, 0.1, 0.8, "#f8f9fa", 0, f * 3 + 0.2, 3.3, 0.03)); // balcony
    g.add(box(w - 0.3, 0.5, 0.05, "#f8f9fa", 0, f * 3 + 0.25, 3.68, 0.02));
  }
  g.add(box(w - 0.8, 2.2, 0.15, "#5c4033", 0, 0, 3.0, 0.03)); // shop opening
  g.add(box(w, 0.08, 1.6, "#3fa34d", 0, 2.7, 3.6, 0.02)); // awning
  g.add(box(1.0, 0.3, 0.1, "#334", 0, h - 0.5, 3.05)); // little roof edge
  if (sign) {
    const s = signBoard([sign], { w: w - 0.6, h: 0.5, color: "#fff4d6", fg: "#c1121f" });
    s.position.set(0, 2.15, 3.1);
    g.add(s);
  }
  return withCollider(g, w, 6);
}

export function vendorCart() {
  const g = new THREE.Group();
  g.add(box(1.0, 0.6, 0.6, "#f4a261", 0, 0.3));
  g.add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.05, 20), toon("#ff6b6b"), 0, 2.1, 0));
  g.add(cyl(0.03, 0.03, 2.1, "#888"));
  for (let i = 0; i < 5; i++) g.add(mesh(new THREE.SphereGeometry(0.09, 8, 6), toon(["#ffd23f", "#6cc070", "#ff8c42"][i % 3]), -0.3 + i * 0.15, 0.95, 0));
  return withCollider(g, 1.0, 0.6);
}

/** Kerb-side parked motorbikes row. */
export function parkedBikes(n = 4, colors = ["#e85d75", "#4da3ff", "#2b2b2b", "#f6c945", "#6cc070"]) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const b = motorbike(colors[i % colors.length]);
    b.position.x = (i - (n - 1) / 2) * 0.75;
    b.rotation.y = Math.PI / 2 + 0.25;
    g.add(b);
  }
  return withCollider(g, n * 0.75, 1.2);
}

// ---------------------------------------------------------------- generic

export function ground(w, d, color, y = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), toon(color));
  m.position.y = y - 0.1;
  m.receiveShadow = true;
  return m;
}

/** Walkable slab (sidewalk / platform). */
export function slab(w, d, h, color) {
  const g = new THREE.Group();
  g.add(box(w, h, d, color, 0, 0, 0, 0.04));
  return g;
}

/** Cheap shopfront for long streets (few meshes). Front faces +z. */
export function shopFront(color = "#ffd166", floors = 3, w = 4.4, sign = null) {
  const g = new THREE.Group();
  const h = floors * 3;
  g.add(box(w, h, 5, color, 0, 0, 0, 0.08));
  g.add(box(w - 0.6, h - 3.4, 0.12, "#6b8fb3", 0, 3.2, 2.5, 0.04)); // window band
  g.add(box(w, 0.08, 1.4, ["#3fa34d", "#e63946", "#2e86de", "#f4a261"][(w * 10 + floors) % 4 | 0], 0, 2.6, 3.1, 0.02)); // awning
  if (sign) {
    const sb = signBoard([sign], { w: w - 0.8, h: 0.5, color: "#fff4d6", fg: "#c1121f" });
    sb.position.set(0, 2.0, 2.56);
    g.add(sb);
  }
  return g;
}

/** Green Grab-style half helmet (sits on a Kenney character head). */
export function grabHelmet() {
  const g = new THREE.Group();
  const shell = mesh(new THREE.SphereGeometry(0.36, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon("#00b14f"));
  g.add(shell);
  g.add(box(0.5, 0.05, 0.2, "#00b14f", 0, 0, 0.3, 0.02)); // visor
  return g;
}

export function trafficLight(state = "red") {
  const g = new THREE.Group();
  g.add(cyl(0.08, 0.1, 3.4, "#4b5563"));
  g.add(box(0.4, 1.0, 0.3, "#222", 0, 2.8, 0, 0.06));
  const colors = { red: ["#ff3b30", "#442222", "#224422"], green: ["#442222", "#443b22", "#34c759"] }[state] || [];
  ["#ff3b30", "#ffcc00", "#34c759"].forEach((c, i) => {
    const on = colors[i] === c;
    g.add(mesh(new THREE.SphereGeometry(0.11, 12, 8), toon(on ? c : "#333", { emissive: on ? c : "#000" }), 0, 3.6 - i * 0.3, 0.16));
  });
  return withCollider(g, 0.3, 0.3);
}

/** Văn Miếu (Temple of Literature) style gate: red pillars, tiled roofs. */
export function templeGate() {
  const g = new THREE.Group();
  for (const x of [-4, -1.4, 1.4, 4]) g.add(box(0.7, 5, 0.7, "#b23a2b", x, 0, 0, 0.08));
  g.add(box(10, 0.6, 1.6, "#7a2a1f", 0, 5, 0, 0.1));
  g.add(box(11, 0.5, 2.2, "#3d4a5c", 0, 5.6, 0, 0.2)); // roof
  g.add(box(3.4, 0.5, 2.2, "#3d4a5c", 0, 6.4, 0, 0.2));
  g.add(box(2.6, 1.0, 0.8, "#7a2a1f", 0, 6.1, 0, 0.1));
  const sb = signBoard(["Văn Miếu"], { w: 2.4, h: 0.6, color: "#1d3557", fg: "#ffd60a" });
  sb.position.set(0, 4.3, 0.4);
  g.add(sb);
  return withCollider(g, 10, 1.6);
}

/** German wheelie bin with a coloured lid. */
export function wheelieBin(color = "#4b5563", label = "") {
  const g = new THREE.Group();
  g.add(box(0.75, 1.0, 0.8, "#3d4451", 0, 0.08, 0, 0.08));
  g.add(box(0.8, 0.12, 0.88, color, 0, 1.08, 0, 0.05));
  g.add(box(0.77, 0.18, 0.06, color, 0, 0.85, 0.4, 0.03));
  for (const x of [-0.3, 0.3]) {
    const w = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), toon("#222"), x, 0.1, -0.35);
    w.rotation.z = Math.PI / 2;
    g.add(w);
  }
  if (label) {
    const s = signBoard([label], { w: 0.6, h: 0.22, color: "#ffffff", fg: "#333", depth: 0.01 });
    s.position.set(0, 0.45, 0.41);
    g.add(s);
  }
  return withCollider(g, 0.8, 0.85);
}

/** Street glass bank (Altglascontainer). */
export function glassContainer(color = "#2f9e44", label = "Grünglas") {
  const g = new THREE.Group();
  g.add(box(1.4, 1.6, 1.4, color, 0, 0, 0, 0.25));
  g.add(cyl(0.18, 0.18, 0.06, "#1f2937", 0, 1.6, 0));
  for (const x of [-0.35, 0.35]) {
    const hole = mesh(new THREE.CircleGeometry(0.13, 16), toon("#111"), x, 1.25, 0.705);
    g.add(hole);
  }
  const s = signBoard([label], { w: 1.2, h: 0.3, color: "#ffffff", fg: "#222", depth: 0.01 });
  s.position.set(0, 0.6, 0.71);
  g.add(s);
  return withCollider(g, 1.4, 1.4);
}

/** Simple shop / office facade with a big sign; front faces +z. */
export function building(w = 16, h = 7, d = 10, color = "#f3efe6", sign = "", signColor = "#1f5fbf") {
  const g = new THREE.Group();
  g.add(box(w, h, d, color, 0, 0, 0, 0.15));
  g.add(box(w - 1, 0.3, d + 0.2, "#d9d2c3", 0, h - 0.3, 0, 0.05));
  for (let x = -w / 2 + 2; x < w / 2 - 1; x += 3) g.add(box(1.8, 1.4, 0.12, "#8fb4d9", x, h - 2.6, d / 2, 0.05));
  if (sign) {
    const s = signBoard([sign], { w: Math.min(w - 2, 8), h: 1, color: signColor, fg: "#ffffff" });
    s.position.set(0, h - 1.2, d / 2 + 0.05);
    g.add(s);
  }
  return withCollider(g, w, d);
}

/** Supermarket shelf (gondola) filled with colourful goods. */
export function shelf(len = 6, seed = 1) {
  const g = new THREE.Group();
  g.add(box(len, 1.9, 0.9, "#e5e7eb", 0, 0, 0, 0.04));
  const colors = ["#e63946", "#f4a261", "#2a9d8f", "#e9c46a", "#8ecae6", "#b5838d", "#90be6d", "#ffb703"];
  let k = seed;
  for (let row = 0; row < 3; row++) {
    for (let x = -len / 2 + 0.3; x < len / 2 - 0.2; x += 0.42) {
      k = (k * 9301 + 49297) % 233280;
      const c = colors[k % colors.length];
      const h = 0.28 + (k % 5) * 0.04;
      for (const side of [-1, 1]) g.add(box(0.34, h, 0.3, c, x, 0.25 + row * 0.55, side * 0.32, 0.03));
    }
  }
  return withCollider(g, len, 0.95);
}

/** Supermarket checkout: belt, scanner, cashier booth. Customer side is +z. */
export function checkoutCounter() {
  const g = new THREE.Group();
  g.add(box(4.5, 0.85, 0.9, "#9aa0ad", 0, 0, 0, 0.05));
  g.add(box(3.2, 0.04, 0.6, "#2b2b2b", -0.6, 0.85, 0, 0.01)); // belt
  g.add(box(0.5, 0.25, 0.5, "#1f5fbf", 1.2, 0.85, 0, 0.04)); // scanner
  g.add(box(1.0, 1.2, 1.0, "#d9d2c3", 1.4, 0, -1.0, 0.05)); // booth
  return withCollider(g, 4.5, 1.0);
}

/** Bottle return machine (Pfandautomat) in a wall. */
export function pfandAutomat() {
  const g = new THREE.Group();
  g.add(box(1.4, 2.2, 0.6, "#e8ecef", 0, 0, 0, 0.08));
  g.add(cyl(0.16, 0.16, 0.08, "#222", 0, 1.1, 0.28));
  g.children[1].rotation.x = Math.PI / 2;
  g.children[1].position.set(0, 1.2, 0.3);
  g.add(box(0.6, 0.35, 0.05, "#7ec8ff", 0, 1.65, 0.3, 0.03));
  g.add(box(0.2, 0.2, 0.05, "#2fa84f", 0.45, 0.9, 0.3, 0.05));
  const s = signBoard(["♻ Leergut · Pfand"], { w: 1.3, h: 0.3, color: "#2fa84f", fg: "#fff" });
  s.position.set(0, 2.0, 0.31);
  g.add(s);
  return withCollider(g, 1.4, 0.6);
}

/** Row of shopping carts. */
export function cartRow(n = 4) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const c = new THREE.Group();
    c.add(box(0.6, 0.45, 0.9, "#b8c1cc", 0, 0.45, 0, 0.03));
    c.children[0].material = toon("#b8c1cc", { opacity: 0.7 });
    c.add(box(0.62, 0.05, 0.05, "#e63946", 0, 1.0, -0.48, 0.02));
    for (const [x, z] of [[-0.25, -0.35], [0.25, -0.35], [-0.25, 0.35], [0.25, 0.35]]) c.add(cyl(0.06, 0.06, 0.05, "#333", x, 0.0, z));
    c.position.z = i * 0.35;
    g.add(c);
  }
  return withCollider(g, 0.7, 0.9 + (n - 1) * 0.35, 0, ((n - 1) * 0.35) / 2);
}

/** Waiting-number display board (LED style). */
export function numberBoard(lines = ["A-112 → Platz 3", "A-113 → Platz 1"]) {
  const g = new THREE.Group();
  const s = signBoard(
    lines.map((l) => ({ text: l, color: "#ffb000", size: 70 })),
    { w: 3, h: 1.4, color: "#111827", fg: "#ffb000", px: 320 }
  );
  s.position.y = 2.4;
  g.add(s);
  g.add(box(0.1, 2.4, 0.1, "#6b7280", -1.2));
  g.add(box(0.1, 2.4, 0.1, "#6b7280", 1.2));
  return withCollider(g, 2.8, 0.3);
}

/** Office service counter with a number sign. */
export function serviceCounter(n = 1) {
  const g = new THREE.Group();
  g.add(box(2.2, 1.05, 0.8, "#c9a27a", 0, 0, 0, 0.06));
  g.add(box(2.3, 0.06, 0.9, "#f3efe6", 0, 1.05, 0, 0.02));
  g.add(box(0.5, 0.35, 0.05, "#111827", 0.6, 1.11, -0.2, 0.02)); // monitor
  const s = signBoard([`Platz ${n}`], { w: 1.2, h: 0.45, color: "#1f5fbf", fg: "#fff" });
  s.position.set(0, 2.6, -0.2);
  g.add(s);
  g.add(box(0.06, 1.5, 0.06, "#6b7280", 0, 1.1, -0.2));
  return withCollider(g, 2.2, 0.8);
}

/** Row of waiting-room chairs. */
export function chairs(n = 4, color = "#4da3ff") {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * 0.7;
    g.add(box(0.6, 0.08, 0.55, color, x, 0.45, 0, 0.03));
    g.add(box(0.6, 0.55, 0.06, color, x, 0.5, -0.25, 0.03));
  }
  g.add(box(n * 0.7, 0.06, 0.1, "#6b7280", 0, 0.38, 0, 0.02));
  return withCollider(g, n * 0.7, 0.6);
}

/** Small ticket terminal (Wartenummer). */
export function ticketTerminal() {
  const g = new THREE.Group();
  g.add(box(0.6, 1.4, 0.45, "#1f5fbf", 0, 0, 0, 0.08));
  g.add(box(0.45, 0.32, 0.05, "#7ec8ff", 0, 1.0, 0.23, 0.03));
  g.add(box(0.3, 0.05, 0.05, "#222", 0, 0.7, 0.23, 0.01));
  const s = signBoard(["Wartenummer"], { w: 0.9, h: 0.25, color: "#ffffff", fg: "#1f5fbf" });
  s.position.set(0, 1.5, 0);
  g.add(s);
  return withCollider(g, 0.6, 0.45);
}

/** Solid wall / block with collision. */
export function wall(w, d, h, color, opacity = 1) {
  const g = new THREE.Group();
  const m = box(w, h, d, color, 0, 0, 0, 0.04);
  if (opacity < 1) m.material = toon(color, { opacity });
  g.add(m);
  return withCollider(g, w, d);
}

/** Railway track along local z. */
export function track(len = 40) {
  const g = new THREE.Group();
  g.add(box(3, 0.04, len, "#8d8a83", 0, 0, 0, 0.01));
  for (let z = -len / 2 + 0.4; z < len / 2; z += 0.8) g.add(box(2.4, 0.06, 0.25, "#7a5c45", 0, 0.03, z, 0.01));
  for (const x of [-0.72, 0.72]) g.add(box(0.1, 0.1, len, "#c0c4cc", x, 0.08, 0, 0.01));
  return g;
}

/** Simple train interior: floor, seats, windows. */
export function trainInterior(len = 16) {
  const g = new THREE.Group();
  g.add(box(3.4, 0.1, len, "#c9d2dc", 0, 0, 0, 0.02));
  for (const x of [-1.8, 1.8]) {
    g.add(box(0.2, 3, len, "#f4f4f4", x, 0, 0, 0.05));
    for (let z = -len / 2 + 1.5; z < len / 2 - 1; z += 2.4) g.add(box(0.22, 1.1, 1.6, "#9ad1f5", x * 0.99, 1.2, z, 0.1));
  }
  for (let z = -len / 2 + 1.5; z < len / 2 - 1; z += 2.4) {
    for (const x of [-1.15, 1.15]) {
      g.add(box(1.0, 0.5, 0.6, "#e2231a", x, 0, z - 0.4, 0.1));
      g.add(box(1.0, 0.8, 0.15, "#c21d16", x, 0.5, z - 0.7, 0.06));
    }
  }
  return g;
}

function withCollider(group, w, d, ox = 0, oz = 0) {
  group.userData.collider = { w, d, ox, oz };
  return group;
}

export const PROPS = {
  ticketMachine,
  validator,
  busStopSign,
  busShelter,
  departureBoard,
  sbahnTrain,
  cityBus,
  infoDesk,
  suitcase,
  bench,
  plant,
  tree,
  lamp,
  arrivalGate,
  motorbike,
  plasticStool,
  lowTable,
  phoBowl,
  phoStall,
  cableTangle,
  utilityPole,
  lanternString,
  tubeHouse,
  vendorCart,
  parkedBikes,
  signPost,
  signBoard,
  slab,
  wall,
  track,
  trainInterior,
  shopFront,
  grabHelmet,
  trafficLight,
  templeGate,
  wheelieBin,
  glassContainer,
  building,
  shelf,
  checkoutCounter,
  pfandAutomat,
  cartRow,
  numberBoard,
  serviceCounter,
  chairs,
  ticketTerminal,
};
