import * as THREE from "three";
import { toon } from "../core/Assets.js";
import { box as roundedBox, signBoard, motorbike } from "./props.js";

// Metres, ground-level origins, fronts facing +z. All builders accept (color, variant).
// Numeric variants are deterministic indexes; named loads are accepted by cargo vehicles.
// hanoiBus(color, variant, route, destination), oldQuarterHouse(color, variant, sign),
// streetSign(color, variant, text), quangGanh(color, variant, { carried: true }).
const geometries = new Map();
const signs = new Map();
const index = (variant) => typeof variant === "number" ? Math.abs(Math.trunc(variant)) : 0;
const pick = (variant, choices) => choices.includes(variant) ? variant : choices[index(variant) % choices.length];
const solid = (g, w, d, ox = 0, oz = 0) => {
  g.userData.collider = { w, d, ox, oz };
  return g;
};
function geo(key, build) {
  if (!geometries.has(key)) geometries.set(key, build());
  return geometries.get(key);
}
function mesh(geometry, color, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, toon(color));
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}
// Facade trim and cargo use shared low-poly boxes; round only the large vehicle bodies.
function box(w, h, d, color, x = 0, y = 0, z = 0, radius = 0) {
  return radius > 0 ? roundedBox(w, h, d, color, x, y, z, radius)
    : mesh(geo(`b:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d)), color, x, y + h / 2, z);
}
function cylinder(rt, rb, h, color, x = 0, y = 0, z = 0) {
  h = Math.round(h * 1000) / 1000;
  return mesh(geo(`c:${rt}:${rb}:${h}`, () => new THREE.CylinderGeometry(rt, rb, h, 12)), color, x, y + h / 2, z);
}
function ball(r, color, x, y, z) {
  return mesh(geo(`s:${r}`, () => new THREE.SphereGeometry(r, 8, 6)), color, x, y, z);
}
function rod(g, a, b, color = "#b8bdc5", radius = 0.025) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
  const direction = end.sub(start);
  const m = cylinder(radius, radius, direction.length(), color);
  m.position.copy(start).addScaledVector(direction, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  g.add(m);
  return m;
}
function label(text, w, h, color = "#fff0d2", fg = "#253e42") {
  const key = JSON.stringify([text, w, h, color, fg]);
  if (!signs.has(key)) {
    // Node builds retain the physical board and label metadata without requiring a canvas.
    const s = typeof document === "undefined" ? new THREE.Group() : signBoard([text], { w, h, color, fg, px: 64 });
    if (!s.children.length) s.add(box(w, h, 0.08, color));
    s.userData.text = text;
    signs.set(key, s);
  }
  return signs.get(key).clone(true);
}
function wheel(r, x, z, width = 0.045) {
  const g = new THREE.Group();
  g.name = "wheel";
  g.position.set(x, r + width, z);
  const tyre = mesh(geo(`w:${r}:${width}`, () => new THREE.TorusGeometry(r, width, 6, 16)), "#292d32");
  tyre.rotation.y = Math.PI / 2;
  g.add(tyre);
  for (const angle of [0, Math.PI / 2]) {
    const spoke = box(0.025, r * 1.8, 0.025, "#bdc4c9", 0, -r * 0.9);
    spoke.rotation.x = angle;
    g.add(spoke);
  }
  return g;
}
function rolling(g, wheels, pedals = null, legs = []) {
  let phase = 0;
  g.userData.update = (dt) => {
    phase += dt * 4;
    wheels.forEach(w => { w.rotation.x = phase; });
    if (pedals) pedals.rotation.x = phase;
    legs.forEach((leg, i) => { leg.rotation.x = Math.sin(phase + i * Math.PI) * 0.45; });
  };
}
function pedals(g, z = 0, y = 0.42) {
  const p = new THREE.Group();
  p.name = "pedals";
  p.position.set(0, y, z);
  rod(p, [-0.2, -0.13, 0], [0.2, 0.13, 0], "#b8bdc5", 0.025);
  p.add(box(0.16, 0.04, 0.14, "#31383e", -0.23, -0.15), box(0.16, 0.04, 0.14, "#31383e", 0.23, 0.11));
  g.add(p);
  return p;
}
function basket(g, x, y, z, color = "#ba8950", r = 0.26) {
  g.add(cylinder(r, r * 0.72, 0.34, color, x, y, z));
  g.add(cylinder(r * 0.88, r * 0.88, 0.025, "#63503a", x, y + 0.33, z));
  for (let i = 0; i < 3; i++) g.add(cylinder(r + 0.012, r + 0.012, 0.025, "#e3be7f", x, y + 0.1 * i, z));
}
function flowers(g, x, y, z, variant) {
  for (let i = 0; i < 5; i++) {
    const dx = (i % 3 - 1) * 0.13, dz = (Math.floor(i / 3) - 0.5) * 0.16;
    rod(g, [x, y, z], [x + dx, y + 0.45 + (i % 2) * 0.1, z + dz], "#4e8a48", 0.015);
    g.add(ball(0.1, ["#f4b5c4", "#ffd56b", "#e85a87"][(i + index(variant)) % 3], x + dx, y + 0.47 + (i % 2) * 0.1, z + dz));
  }
}

/** A true cyclo: front passenger bench and canopy, rider pedalling behind. */
export function xichLo(color = "#b44343", variant = 0) {
  const g = new THREE.Group();
  const wheels = [wheel(0.34, -0.62, 0.65), wheel(0.34, 0.62, 0.65), wheel(0.34, 0, -1.15)];
  g.add(...wheels);
  g.add(box(1.15, 0.12, 1.3, color, 0, 0.4, 0.5));
  const seat = box(1.05, 0.16, 0.65, "#e9bc7b", 0, 0.62, 0.45);
  seat.name = "passengerSeat";
  g.add(seat, box(1.05, 0.7, 0.12, color, 0, 0.65, 0.05));
  for (const x of [-0.54, 0.54]) {
    rod(g, [x, 0.55, 0], [x, 1.82, 0], "#c8c6ba");
    rod(g, [x, 0.55, 0.95], [x, 1.82, 0.95], "#c8c6ba");
    g.add(box(0.08, 0.08, 0.9, "#d3c7ae", x, 0.94, 0.45));
  }
  g.add(box(1.28, 0.15, 1.35, index(variant) % 2 ? "#e2c48b" : color, 0, 1.8, 0.48, 0.12));
  rod(g, [0, 0.45, -1.15], [0, 0.9, -0.6], color, 0.055);
  g.add(box(0.32, 0.08, 0.35, "#30373b", 0, 0.93, -0.85));
  rod(g, [-0.38, 1.18, -0.2], [0.38, 1.18, -0.2]);
  const rider = new THREE.Group();
  rider.name = "rider";
  rider.position.set(0, 0.95, -0.88);
  rider.add(box(0.4, 0.48, 0.24, "#559692", 0, 0.12));
  rider.add(ball(0.17, "#dca77b", 0, 0.8, 0));
  rider.add(cylinder(0.22, 0.22, 0.08, "#e8d7a9", 0, 0.94));
  const legs = [-0.14, 0.14].map(x => {
    const leg = new THREE.Group();
    leg.position.set(x, 0.08, 0);
    rod(leg, [0, 0, 0], [0, -0.27, 0.25], "#3e4f5d", 0.065);
    rod(leg, [0, -0.27, 0.25], [0, -0.52, 0.07], "#3e4f5d", 0.055);
    rider.add(leg);
    rod(rider, [x * 1.4, 0.55, 0], [x * 2, 0.23, 0.65], "#dca77b", 0.05);
    return leg;
  });
  g.add(rider);
  rolling(g, wheels, pedals(g, -0.55), legs);
  return solid(g, 1.4, 2.9, 0, -0.1);
}

export function goodsBicycle(color = "#427f86", variant = 0) {
  const g = new THREE.Group();
  const wheels = [wheel(0.33, 0, -0.62), wheel(0.33, 0, 0.62)];
  g.add(...wheels);
  for (const [a, b] of [
    [[0, 0.38, -0.62], [0, 0.85, -0.24]], [[0, 0.85, -0.24], [0, 0.38, 0]],
    [[0, 0.38, 0], [0, 0.38, -0.62]], [[0, 0.85, -0.24], [0, 0.9, 0.48]],
    [[0, 0.9, 0.48], [0, 0.38, 0]], [[0, 0.9, 0.48], [0, 0.38, 0.62]],
  ]) rod(g, a, b, color, 0.03);
  g.add(box(0.28, 0.07, 0.3, "#363a3b", 0, 0.9, -0.24));
  rod(g, [-0.3, 1.08, 0.5], [0.3, 1.08, 0.5]);
  const load = pick(variant, ["flowers", "baskets", "goods"]);
  for (const x of [-0.31, 0.31]) {
    basket(g, x, 0.64, -0.6);
    if (load === "flowers") flowers(g, x, 1, -0.6, variant);
    if (load === "baskets") basket(g, x, 1.02, -0.6, "#d4ab70", 0.21);
    if (load === "goods") g.add(box(0.38, 0.6, 0.5, "#ba9b6c", x, 0.98, -0.6));
  }
  basket(g, 0, 0.85, 0.75, "#d4ab70", 0.24);
  rolling(g, wheels, pedals(g));
  g.userData.load = load;
  return solid(g, 1.16, 1.98, 0, 0.03);
}

/** Attach the carried form to an NPC root at ground level; it omits the vendor and collider. */
export function quangGanh(color = "#8d5b8e", variant = 0, { carried = false } = {}) {
  const g = new THREE.Group();
  rod(g, [-1.05, 1.42, 0], [1.05, 1.42, 0], "#b69654", 0.035);
  for (const x of [-0.86, 0.86]) {
    basket(g, x, 0.12, 0, "#bd9258", 0.3);
    for (const z of [-0.22, 0.22]) rod(g, [x, 0.43, z], [x, 1.42, 0], "#d3b476", 0.012);
    flowers(g, x, 0.45, 0, variant);
  }
  if (!carried) {
    for (const x of [-0.13, 0.13]) g.add(box(0.14, 0.62, 0.18, "#343e50", x, 0));
    g.add(box(0.42, 0.66, 0.29, color, 0, 0.62), ball(0.18, "#dca77b", 0, 1.51, 0));
    rod(g, [-0.25, 1.19, 0], [-0.42, 1.41, 0], "#dca77b", 0.055);
    rod(g, [0.25, 1.19, 0], [0.44, 1.41, 0], "#dca77b", 0.055);
  }
  const hat = mesh(geo("nonLa", () => new THREE.ConeGeometry(0.4, 0.26, 16)), "#ead5a0", 0, 1.84, 0);
  hat.name = "nonLa";
  g.add(hat);
  return carried ? g : solid(g, 2.35, 0.65);
}

export function vendorCartWheeled(color = "#438d8e", variant = 0) {
  const g = new THREE.Group();
  const wheels = [wheel(0.2, -0.63, 0), wheel(0.2, 0.63, 0)];
  g.add(...wheels, box(1.15, 0.63, 0.75, color, 0, 0.32));
  g.add(box(1.3, 0.08, 0.9, "#d5dbd7", 0, 0.96));
  g.add(cylinder(0.22, 0.22, 0.3, "#aab4b6", -0.3, 1.04));
  basket(g, 0.3, 1.04, 0, "#c69d67", 0.2);
  rod(g, [-0.55, 0.6, -0.4], [-0.55, 0.85, -0.85]);
  rod(g, [0.55, 0.6, -0.4], [0.55, 0.85, -0.85]);
  rod(g, [-0.55, 0.85, -0.85], [0.55, 0.85, -0.85]);
  g.add(cylinder(0.025, 0.025, 2.3, "#c5c5bd", 0, 0, -0.24));
  const umbrella = mesh(geo("umbrella", () => new THREE.ConeGeometry(1.05, 0.4, 12)), index(variant) % 2 ? "#e6b65d" : color, 0, 2.3, -0.24);
  g.add(umbrella);
  const sign = label(index(variant) % 2 ? "BÁNH MÌ" : "XÔI", 0.95, 0.26);
  sign.position.set(0, 0.56, 0.4);
  g.add(sign);
  rolling(g, wheels);
  return solid(g, 1.4, 1.4, 0, -0.2);
}

export function loadedScooter(color = "#5a8f9d", variant = 0) {
  const g = motorbike(color);
  g.add(box(1.0, 0.08, 0.9, "#5b656b", 0, 0.84, -0.52));
  const load = pick(variant, ["boxes", "gas", "crates"]);
  for (let i = 0; i < 3; i++) {
    if (load === "gas") {
      const x = (i - 1) * 0.32;
      g.add(cylinder(0.15, 0.15, 0.72, "#4e91a9", x, 0.94, -0.56));
      g.add(cylinder(0.07, 0.07, 0.11, "#555e64", x, 1.66, -0.56));
      if (i === 1) g.add(cylinder(0.15, 0.15, 0.72, "#4e91a9", x, 1.8, -0.56));
    } else {
      const y = 0.94 + i * 0.43;
      g.add(box(0.95 - i * 0.08, 0.4, 0.82, load === "boxes" ? "#bc9564" : "#4b9365", (i % 2) * 0.06, y, -0.52));
      if (load === "crates") for (const dy of [0.12, 0.26]) g.add(box(0.78, 0.045, 0.025, "#28593a", 0, y + dy, -0.1));
      else g.add(box(0.1, 0.405, 0.83, "#e4cc97", 0, y, -0.52));
    }
  }
  for (const x of [-0.35, 0.35]) g.add(box(0.035, 1.55, 0.85, "#535356", x, 0.92, -0.52));
  g.userData.load = load;
  return solid(g, 1.05, 1.95, 0, -0.1);
}

export function hanoiBus(color = "#438b53", variant = 0, route = "09", destination = "Bờ Hồ – Kim Mã") {
  const g = new THREE.Group();
  g.add(box(2.3, 2.65, 7.6, color, 0, 0.36, 0, 0.18));
  g.add(box(2.33, 0.42, 7.62, "#efd566", 0, 0.75));
  g.add(box(2.16, 0.1, 7.4, "#e5e6d6", 0, 3.01));
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) g.add(box(0.035, 0.95, 1.02, "#395666", side * 1.16, 1.72, -2.75 + i * 1.3));
    for (const z of [-2.4, 2.4]) g.add(wheel(0.42, side * 1.1, z, 0.09));
  }
  g.add(box(1.95, 1.05, 0.06, "#395666", 0, 1.5, 3.82));
  const display = label(`${route}  ${destination}`, 2.04, 0.35, "#283c32", "#ffeb83");
  display.position.set(0, 2.64, 3.83);
  g.add(display);
  for (const x of [-0.8, 0.8]) g.add(box(0.26, 0.16, 0.06, "#fff2b4", x, 0.77, 3.83));
  g.add(box(0.04, 1.85, 0.88, "#efd566", 1.18, 0.45, index(variant) % 2 ? 2.3 : 2.65));
  g.userData.route = route;
  g.userData.destination = destination;
  return solid(g, 2.4, 7.75);
}

export function hanoiTaxi(color = "#f3f1e7", variant = 0) {
  const g = new THREE.Group();
  const stripe = index(variant) % 2 ? "#eee7cf" : "#3d9968";
  g.add(box(1.75, 0.58, 3.9, color, 0, 0.42, 0, 0.16));
  g.add(box(1.48, 0.65, 2.1, color, 0, 0.96, -0.15, 0.15));
  g.add(box(1.34, 0.46, 0.06, "#466679", 0, 1.07, 0.91));
  g.add(box(1.34, 0.42, 0.06, "#466679", 0, 1.07, -1.22));
  for (const side of [-1, 1]) {
    for (const z of [-0.68, 0.38]) g.add(box(0.04, 0.42, 0.85, "#466679", side * 0.75, 1.08, z));
    g.add(box(0.04, 0.14, 3.4, stripe, side * 0.89, 0.64));
    for (const z of [-1.18, 1.18]) g.add(wheel(0.27, side * 0.83, z, 0.07));
    g.add(box(0.28, 0.16, 0.08, "#fff1ba", side * 0.57, 0.69, 1.97));
    g.add(box(0.25, 0.13, 0.08, "#c94a48", side * 0.57, 0.69, -1.97));
  }
  const sign = label("TAXI", 0.65, 0.24, "#fff5c9", "#254f3c");
  sign.position.set(0, 1.62, -0.05);
  g.add(sign);
  return solid(g, 1.85, 4.05);
}

export function plantPots(color = "#ae7156", variant = 0) {
  const g = new THREE.Group();
  const count = 2 + index(variant) % 2;
  for (let i = 0; i < count; i++) {
    const x = (i - (count - 1) / 2) * 0.5;
    const h = 0.28 + (i % 2) * 0.12;
    g.add(cylinder(0.19, 0.13, h, color, x));
    for (const dx of [-0.1, 0.1]) {
      const leaf = ball(0.19, i % 2 ? "#77a65a" : "#467e52", x + dx, h + 0.21, 0);
      leaf.scale.set(0.8, 1.6, 0.8);
      g.add(leaf);
    }
  }
  return solid(g, count * 0.5, 0.45);
}

export function awning(color = "#43866f", variant = 0) {
  const g = new THREE.Group();
  const width = 3.4 + index(variant) % 3 * 0.2;
  const canopy = box(width, 0.1, 1.2, color, 0, 0.18);
  canopy.rotation.x = 0.15;
  g.add(canopy, box(width, 0.22, 0.08, color, 0, 0, 0.58));
  for (let i = 0; i < 5; i++) g.add(box(0.24, 0.025, 1.18, "#ead8ac", (i - 2) * width / 5, 0.24));
  return solid(g, width, 1.2);
}

export function streetSign(color = "#356386", variant = 0, text = null) {
  const g = new THREE.Group();
  g.add(cylinder(0.04, 0.055, 2.75, "#8e9997"));
  const sign = label(text ?? ["PHỐ HÀNG BẠC", "PHỐ HÀNG ĐÀO", "PHỐ TRÀNG THI"][index(variant) % 3], 1.6, 0.38, color, "#fff9df");
  sign.position.set(0, 2.31, 0.06);
  g.add(sign);
  return solid(g, 0.14, 0.14);
}

export function oldQuarterHouse(color = "#e4c77f", variant = 0, sign = "CÀ PHÊ") {
  const g = new THREE.Group();
  const v = index(variant), w = 3.8 + (v % 3) * 0.2, floors = 3 + v % 2;
  g.add(box(w, floors * 2.7, 4.6, color, 0, 0, 0));
  g.add(box(w - 0.5, 2.12, 0.08, "#727e79", 0, 0, 2.34));
  for (let i = 0; i < 10; i++) g.add(box(w - 0.55, 0.035, 0.04, "#a4aba0", 0, 0.15 + i * 0.2, 2.4));
  const board = label(sign, w - 0.3, 0.48, "#e8ddb7", "#9d443a");
  board.position.set(0, 2.15, 2.38);
  const canopy = awning(v % 2 ? "#b05e4c" : "#548c76", v);
  canopy.position.set(0, 2.7, 2.8);
  g.add(board, canopy);
  for (let f = 1; f < floors; f++) {
    const y = f * 2.7;
    g.add(box(w - 1.1, 1.55, 0.08, "#45656c", 0, y + 0.4, 2.34));
    g.add(box(w - 0.15, 0.13, 0.88, "#e8dfcc", 0, y + 0.1, 2.65));
    rod(g, [-w / 2 + 0.15, y + 0.95, 3.04], [w / 2 - 0.15, y + 0.95, 3.04], "#526565");
    for (let j = 0; j < 6; j++) rod(g, [-w / 2 + 0.2 + j * (w - 0.4) / 5, y + 0.2, 3.04], [-w / 2 + 0.2 + j * (w - 0.4) / 5, y + 0.95, 3.04], "#526565", 0.018);
    const pots = plantPots("#ac7054", v);
    pots.scale.setScalar(0.65);
    pots.position.set(w / 2 - 0.7, y + 0.23, 2.7);
    g.add(pots);
  }
  const laundry = new THREE.Group();
  laundry.name = "laundry";
  laundry.userData.animated = true;
  laundry.position.set(0, 5.05, 3.12);
  rod(laundry, [-1.35, 0, 0], [1.35, 0, 0], "#a28e75", 0.012);
  for (let i = 0; i < 3; i++) laundry.add(box(0.45, 0.6 + i * 0.1, 0.035, ["#e8dfce", "#729fb7", "#d58683"][(i + v) % 3], (i - 1) * 0.78, -0.7));
  g.add(laundry);
  g.userData.update = (dt, time) => { laundry.rotation.x = Math.sin(time * 1.7 + v) * 0.13; };
  return solid(g, w, 4.6);
}

export function colonialFacade(color = "#d8b55b", variant = 0) {
  const g = new THREE.Group();
  const v = index(variant), w = 4.4, floors = 2 + v % 2, h = floors * 2.8;
  g.add(box(w, h, 4.6, color));
  for (let f = 0; f < floors; f++) {
    const y = f * 2.8;
    g.add(box(w + 0.12, 0.16, 0.28, "#f1dfb5", 0, y + 2.61, 2.36));
    for (const x of [-1.08, 1.08]) {
      g.add(box(1.18, 1.5, 0.06, "#344d51", x, y + 0.35, 2.34));
      const arch = mesh(geo("arch", () => new THREE.RingGeometry(0.59, 0.71, 16, 1, 0, Math.PI)), "#f1dfb5", x, y + 1.85, 2.4);
      g.add(arch);
      for (const dx of [-0.66, 0.66]) g.add(box(0.12, 1.5, 0.15, "#f1dfb5", x + dx, y + 0.35, 2.38));
      if (f > 0) for (const side of [-1, 1]) {
        g.add(box(0.43, 1.5, 0.11, "#42725a", x + side * 0.84, y + 0.35, 2.44));
        for (let j = 0; j < 5; j++) g.add(box(0.34, 0.04, 0.06, "#83a07a", x + side * 0.84, y + 0.5 + j * 0.23, 2.52));
      }
    }
  }
  g.add(box(w + 0.3, 0.24, 4.85, "#a35c44", 0, h));
  const pots = plantPots("#b37856", v);
  pots.position.set(0, 0, 2.75);
  g.add(pots);
  return solid(g, w + 0.3, 4.85);
}

export const VN_PROPS = {
  xichLo, goodsBicycle, quangGanh, vendorCartWheeled, loadedScooter, hanoiBus, hanoiTaxi,
  oldQuarterHouse, colonialFacade, plantPots, awning, streetSign,
};
