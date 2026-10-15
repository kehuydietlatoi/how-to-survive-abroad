import * as THREE from "three";
import { toon } from "../core/Assets.js";
import { mulberry32 } from "../minigames/crossingSim.js";

// Detailed procedural phở bowl + Hanoi table condiments for the close-up eating minigame.
// Units: metres, origin at the table top. Bowl ≈ 20 cm wide.

const BOWL_R = 0.1; // inner radius at the rim
export const BROTH_TOP = 0.072; // broth surface height when full
const BROTH_LOW = 0.02;

function m(geo, mat, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, mat);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

/** Blue-and-white rim pattern texture (typical Vietnamese porcelain). */
function rimTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 32;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 256, 32);
  g.fillStyle = "#2f6db5";
  g.fillRect(0, 2, 256, 4);
  g.fillRect(0, 26, 256, 4);
  for (let x = 8; x < 256; x += 32) {
    g.beginPath();
    g.arc(x + 8, 16, 6, 0, Math.PI * 2);
    g.fill();
    g.fillRect(x + 18, 14, 10, 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.x = 3;
  return t;
}

export function makeBowl() {
  const g = new THREE.Group();
  // Lathe profile: foot → body → rim (outer), then back down the inside.
  const pts = [
    [0.0, 0.0],
    [0.045, 0.0],
    [0.046, 0.012],
    [0.06, 0.016],
    [0.085, 0.045],
    [0.1, 0.075],
    [0.106, 0.09],
    [0.1, 0.09],
    [0.094, 0.075],
    [0.08, 0.045],
    [0.055, 0.022],
    [0.0, 0.02],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const porcelain = toon("#fbfaf6");
  const bowl = m(new THREE.LatheGeometry(pts, 48), porcelain);
  g.add(bowl);
  // Painted rim band.
  const band = m(new THREE.CylinderGeometry(0.1065, 0.1005, 0.016, 48, 1, true), new THREE.MeshToonMaterial({ map: rimTexture() }), 0, 0.078, 0);
  g.add(band);

  // Broth (scaled down as you sip).
  const broth = m(new THREE.CircleGeometry(BOWL_R * 0.95, 40), toon("#e3a85a", { opacity: 0.92 }));
  broth.rotation.x = -Math.PI / 2;
  broth.position.y = BROTH_TOP;
  broth.receiveShadow = true;
  broth.castShadow = false;
  g.add(broth);

  // Fat droplets on the broth.
  const rand = mulberry32(7);
  const dropMat = toon("#ffd27a", { opacity: 0.85 });
  const drops = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const r = rand() * 0.075;
    const d = m(new THREE.CircleGeometry(0.003 + rand() * 0.004, 10), dropMat, Math.cos(a) * r, 0.0006, Math.sin(a) * r);
    d.rotation.x = -Math.PI / 2;
    d.castShadow = false;
    drops.add(d);
  }
  broth.add(drops);
  drops.rotation.x = Math.PI / 2;

  // Noodles: soft white ribbons curling just under/over the surface, in a few bundles.
  const noodleMat = toon("#f6f0df");
  const noodles = [];
  for (let b = 0; b < 6; b++) {
    const bundle = new THREE.Group();
    const a0 = (b / 6) * Math.PI * 2 + rand() * 0.4;
    for (let k = 0; k < 5; k++) {
      const pts3 = [];
      const r0 = 0.02 + rand() * 0.05;
      for (let s = 0; s < 6; s++) {
        const a = a0 + s * 0.35 + rand() * 0.2;
        const r = r0 + Math.sin(s + k) * 0.012;
        pts3.push(new THREE.Vector3(Math.cos(a) * r, BROTH_TOP - 0.004 + rand() * 0.008, Math.sin(a) * r));
      }
      const curve = new THREE.CatmullRomCurve3(pts3);
      bundle.add(m(new THREE.TubeGeometry(curve, 24, 0.0028, 5, false), noodleMat));
    }
    g.add(bundle);
    noodles.push(bundle);
  }

  // Thin rare beef slices (tái) fanned on top.
  const beefMat = toon("#c4746a");
  const beefCooked = toon("#9c6a55");
  const beef = [];
  for (let i = 0; i < 5; i++) {
    const a = -0.6 + i * 0.32;
    const s = m(new THREE.CylinderGeometry(0.022, 0.024, 0.003, 14), i % 2 ? beefMat : beefCooked, Math.cos(a) * 0.045, BROTH_TOP + 0.004 + i * 0.0007, Math.sin(a) * 0.045);
    s.scale.set(1.3, 1, 0.8);
    s.rotation.y = -a;
    g.add(s);
    beef.push(s);
  }

  // Default garnish: a few spring onion rings and white onion slivers.
  const garnish = new THREE.Group();
  g.add(garnish);
  for (let i = 0; i < 10; i++) garnish.add(onionRing(rand));
  for (let i = 0; i < 4; i++) garnish.add(whiteOnion(rand));

  const toppings = new THREE.Group(); // what the player adds
  g.add(toppings);

  g.userData = { broth, noodles, beef, toppings, garnish, rand };
  return g;
}

function onSurface(rand, maxR = 0.075) {
  const a = rand() * Math.PI * 2;
  const r = Math.sqrt(rand()) * maxR;
  return [Math.cos(a) * r, Math.sin(a) * r];
}

function onionRing(rand) {
  const [x, z] = onSurface(rand);
  const o = m(new THREE.TorusGeometry(0.004, 0.0013, 5, 10), toon("#5fbf4a"), x, BROTH_TOP + 0.003, z);
  o.rotation.x = Math.PI / 2;
  return o;
}

function whiteOnion(rand) {
  const [x, z] = onSurface(rand, 0.06);
  const o = m(new THREE.TorusGeometry(0.012, 0.0016, 4, 12, Math.PI * 0.9), toon("#f3eef7"), x, BROTH_TOP + 0.004, z);
  o.rotation.set(Math.PI / 2, 0, rand() * 6);
  return o;
}

/** A small piece that gets dropped into the bowl for a condiment. */
export function toppingPiece(id, rand) {
  const [x, z] = onSurface(rand);
  const y = BROTH_TOP + 0.004;
  switch (id) {
    case "lime": {
      const o = m(new THREE.CylinderGeometry(0.009, 0.009, 0.002, 12), toon("#c8e66a", { opacity: 0.9 }), x, y, z);
      return o;
    }
    case "chili": {
      const grp = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const [cx, cz] = onSurface(rand);
        const o = m(new THREE.TorusGeometry(0.0035, 0.0014, 5, 10), toon("#e0262b"), cx, y, cz);
        o.rotation.x = Math.PI / 2;
        grp.add(o);
      }
      return grp;
    }
    case "sauce": {
      const o = m(new THREE.CircleGeometry(0.018 + rand() * 0.006, 16), toon("#d8402b", { opacity: 0.85 }), x * 0.6, y - 0.002, z * 0.6);
      o.rotation.x = -Math.PI / 2;
      return o;
    }
    case "vinegar": {
      const grp = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const [cx, cz] = onSurface(rand);
        grp.add(m(new THREE.BoxGeometry(0.004, 0.002, 0.003), toon("#fff6dc"), cx, y, cz));
      }
      return grp;
    }
    case "onion": {
      const grp = new THREE.Group();
      for (let i = 0; i < 6; i++) grp.add(onionRing(rand));
      return grp;
    }
    case "herbs": {
      const grp = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const [cx, cz] = onSurface(rand);
        const leaf = m(new THREE.CircleGeometry(0.009, 10), toon("#3f9d3a"), cx, y + 0.001, cz);
        leaf.scale.set(1, 0.5, 1);
        leaf.rotation.set(-Math.PI / 2, 0, rand() * 6);
        grp.add(leaf);
      }
      return grp;
    }
    case "quay": {
      const o = m(new THREE.CapsuleGeometry(0.008, 0.06, 4, 8), toon("#e2a54b"), x * 0.5, y + 0.004, z * 0.5);
      o.rotation.set(Math.PI / 2, 0, rand() * 6);
      return o;
    }
  }
  return new THREE.Group();
}

/** Condiment containers around the bowl. Each has userData.condiment = id for picking. */
export function makeCondiments() {
  const g = new THREE.Group();
  const items = {};
  const add = (id, obj, x, z) => {
    obj.position.set(x, 0, z);
    obj.userData.condiment = id;
    obj.traverse((o) => (o.userData.condiment = id));
    g.add(obj);
    items[id] = obj;
  };
  const saucer = (color = "#ffffff") => m(new THREE.CylinderGeometry(0.045, 0.038, 0.012, 24), toon(color), 0, 0.006, 0);

  // lime wedges on a saucer
  const lime = new THREE.Group();
  lime.add(saucer());
  for (let i = 0; i < 3; i++) {
    const w = m(new THREE.SphereGeometry(0.018, 10, 8, 0, Math.PI, 0, Math.PI / 2), toon("#8fcf3c"), -0.015 + i * 0.016, 0.014, (i % 2) * 0.012);
    w.rotation.z = Math.PI / 2;
    w.rotation.y = i;
    lime.add(w);
  }
  add("lime", lime, -0.19, -0.06);

  // fresh chili slices in a small dish
  const chili = new THREE.Group();
  chili.add(saucer());
  for (let i = 0; i < 8; i++) {
    const c = m(new THREE.TorusGeometry(0.005, 0.0022, 6, 10), toon("#e0262b"), (i % 4) * 0.012 - 0.018, 0.015, Math.floor(i / 4) * 0.014 - 0.007);
    c.rotation.x = Math.PI / 2;
    chili.add(c);
  }
  add("chili", chili, -0.14, 0.11);

  // chili sauce bottle
  const sauce = new THREE.Group();
  sauce.add(m(new THREE.CylinderGeometry(0.022, 0.024, 0.11, 16), toon("#d8402b"), 0, 0.055, 0));
  sauce.add(m(new THREE.CylinderGeometry(0.008, 0.014, 0.03, 12), toon("#2fa84f"), 0, 0.125, 0));
  sauce.add(m(new THREE.CylinderGeometry(0.0225, 0.0225, 0.03, 16), toon("#fff3c4"), 0, 0.06, 0));
  add("sauce", sauce, 0.2, -0.1);

  // garlic vinegar jar (glass with garlic slices)
  const vinegar = new THREE.Group();
  vinegar.add(m(new THREE.CylinderGeometry(0.028, 0.026, 0.07, 18), toon("#e8f3ff", { opacity: 0.5 }), 0, 0.035, 0));
  vinegar.add(m(new THREE.CylinderGeometry(0.026, 0.024, 0.045, 18), toon("#f4e7b8", { opacity: 0.75 }), 0, 0.024, 0));
  for (let i = 0; i < 6; i++) vinegar.add(m(new THREE.BoxGeometry(0.008, 0.003, 0.006), toon("#fffbe8"), (i % 3) * 0.01 - 0.01, 0.04, Math.floor(i / 3) * 0.01 - 0.005));
  add("vinegar", vinegar, 0.21, 0.05);

  // spring onion in a little bowl
  const onion = new THREE.Group();
  onion.add(m(new THREE.CylinderGeometry(0.035, 0.025, 0.025, 20), toon("#ffffff"), 0, 0.0125, 0));
  const rr = mulberry32(3);
  for (let i = 0; i < 14; i++) {
    const o = m(new THREE.TorusGeometry(0.004, 0.0015, 5, 10), toon("#5fbf4a"), (rr() - 0.5) * 0.045, 0.026, (rr() - 0.5) * 0.045);
    o.rotation.x = Math.PI / 2;
    onion.add(o);
  }
  add("onion", onion, 0.12, 0.15);

  // herb plate
  const herbs = new THREE.Group();
  herbs.add(m(new THREE.CylinderGeometry(0.06, 0.052, 0.01, 24), toon("#ffffff"), 0, 0.005, 0));
  for (let i = 0; i < 12; i++) {
    const leaf = m(new THREE.SphereGeometry(0.014, 8, 6), toon(i % 3 ? "#3f9d3a" : "#6cc070"), (rr() - 0.5) * 0.07, 0.016 + rr() * 0.01, (rr() - 0.5) * 0.07);
    leaf.scale.set(1, 0.35, 0.55);
    leaf.rotation.y = rr() * 6;
    herbs.add(leaf);
  }
  add("herbs", herbs, -0.04, -0.2);

  // quẩy on a plate
  const quay = new THREE.Group();
  quay.add(m(new THREE.CylinderGeometry(0.055, 0.05, 0.01, 24), toon("#ffffff"), 0, 0.005, 0));
  for (let i = 0; i < 3; i++) {
    const q = m(new THREE.CapsuleGeometry(0.01, 0.08, 4, 8), toon("#e2a54b"), -0.02 + i * 0.02, 0.022, 0);
    q.rotation.x = Math.PI / 2;
    q.rotation.z = 0.2 * (i - 1);
    quay.add(q);
  }
  add("quay", quay, 0.08, -0.2);

  // trà đá (iced tea) glass
  const tea = new THREE.Group();
  tea.add(m(new THREE.CylinderGeometry(0.03, 0.025, 0.1, 18), toon("#e8f3ff", { opacity: 0.45 }), 0, 0.05, 0));
  tea.add(m(new THREE.CylinderGeometry(0.027, 0.024, 0.07, 18), toon("#d9a24a", { opacity: 0.8 }), 0, 0.037, 0));
  for (let i = 0; i < 3; i++) tea.add(m(new THREE.BoxGeometry(0.016, 0.016, 0.016), toon("#ffffff", { opacity: 0.7 }), (i - 1) * 0.014, 0.068, (i % 2) * 0.01));
  add("tea", tea, -0.22, 0.08);

  return { group: g, items };
}

/** Chopsticks + porcelain spoon held by "you". */
export function makeUtensils() {
  const chop = new THREE.Group();
  const stickMat = toon("#c98b4f");
  for (const x of [-0.006, 0.006]) {
    const s = m(new THREE.CylinderGeometry(0.0025, 0.004, 0.24, 8), stickMat, x, 0, 0);
    s.rotation.x = Math.PI / 2;
    s.position.z = 0.12;
    chop.add(s);
  }
  const spoon = new THREE.Group();
  const bowlPart = m(new THREE.SphereGeometry(0.022, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon("#fbfaf6"), 0, 0.02, 0);
  bowlPart.scale.set(1, 0.6, 1.3);
  bowlPart.material = bowlPart.material.clone();
  bowlPart.material.side = THREE.DoubleSide;
  spoon.add(bowlPart);
  const handle = m(new THREE.BoxGeometry(0.012, 0.006, 0.08), toon("#fbfaf6"), 0, 0.024, 0.06);
  handle.rotation.x = -0.35;
  spoon.add(handle);
  return { chop, spoon };
}

/** Update visuals from the meal state. */
export function syncBowl(bowl, meal) {
  const { broth, noodles, beef } = bowl.userData;
  const t = meal.broth / meal.T.brothSips;
  const y = BROTH_LOW + (BROTH_TOP - BROTH_LOW) * t;
  broth.position.y = y;
  broth.scale.setScalar(0.72 + 0.28 * t); // the bowl narrows towards the bottom
  broth.visible = meal.broth > 0 || meal.noodles > 0;
  const n = meal.noodles;
  noodles.forEach((b, i) => {
    b.visible = i < n;
    b.position.y = y - BROTH_TOP;
  });
  beef.forEach((b, i) => {
    b.visible = i < Math.ceil((n / meal.T.noodleBites) * beef.length);
    b.position.y = y + 0.004;
  });
  for (const grp of [bowl.userData.toppings, bowl.userData.garnish]) {
    grp.position.y = y - BROTH_TOP;
    grp.visible = meal.phase !== "done";
  }
}
