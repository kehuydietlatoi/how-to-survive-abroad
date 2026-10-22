import * as THREE from "three";
import { buildRoute, sampleRoute, RideSim, HANOI_ROUTE } from "./rideLogic.js";
import { motorbike, trafficLight, templeGate, tree } from "../world/props.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { xichLo, goodsBicycle, loadedScooter, hanoiBus, hanoiTaxi, oldQuarterHouse, colonialFacade } from "../world/propsVietnam.js";
import { Character } from "../world/Character.js";
import { toon } from "../core/Assets.js";
import { mulberry32 } from "./crossingSim.js";
import { sfx } from "../core/Audio.js";
import { t } from "../i18n/i18n.js";
import { esc, rich, isTouch } from "../ui/ui.js";

// 3D passenger ride: you sit behind a Grab driver from Hoàn Kiếm to Văn Miếu.
// Lean with the driver in turns, hold on when braking, keep knees in when squeezing.

const TXT = {
  title: { en: "Grab ride → Văn Miếu", vi: "Đi Grab → Văn Miếu" },
  driver: { en: "Driver", vi: "Tài xế" },
  leanL: { en: "Lean LEFT with the driver", vi: "Nghiêng TRÁI theo tài xế" },
  leanR: { en: "Lean RIGHT with the driver", vi: "Nghiêng PHẢI theo tài xế" },
  brace: { en: "HOLD ON! Driver brakes", vi: "BÁM CHẮC! Tài xế phanh" },
  tuck: { en: "KNEES IN! Tight gap", vi: "KHÉP GỐI! Khe hẹp" },
  good: { en: "Nice!", vi: "Tốt lắm!" },
  counter: { en: "Wobble! Don't lean against the turn", vi: "Loạng choạng! Đừng nghiêng ngược chiều" },
  stiff: { en: "Too stiff, go with the bike", vi: "Cứng người quá, hãy nghiêng theo xe" },
  jolt: { en: "Bonk! You slid into the driver 😵", vi: "Cộp! Bạn chúi vào lưng tài xế 😵" },
  knee: { en: "Ouch, your knee hit the bus! 🦵", vi: "Ối, đầu gối va vào xe buýt! 🦵" },
  keys: {
    en: "A/← D/→ lean · Space hold on · S/↓ knees in",
    vi: "A/← D/→ nghiêng · Space bám chắc · S/↓ khép gối",
  },
  holdBtn: { en: "Hold", vi: "Bám" },
  kneesBtn: { en: "Knees", vi: "Gối" },
  arrived: { en: "Văn Miếu! You arrived 🎉", vi: "Đến Văn Miếu rồi 🎉" },
};

const ROAD_HALF = 5;
const SHOP_COLORS = ["#ffd166", "#f4a6c1", "#a8e6cf", "#ffb385", "#c3b1e1", "#fff3b0", "#9ad1f5", "#f7c59f"];
const SIGNS = ["Phở", "Cà phê", "Bánh mì", "Trà sữa", "Bún chả", "Tạp hoá", "Hiệu thuốc", "Sửa xe", "Karaoke", "Áo dài", "Kem", "Xôi"];
const RIDERS = ["character-male-b", "character-female-b", "character-male-c", "character-female-d", "character-male-d", "character-female-e"];

function ribbon(route, from, to, y, color, step = 1) {
  const pos = [];
  const idx = [];
  const pts = [];
  for (let s = 0; s <= route.length + 0.001; s += step) pts.push(sampleRoute(route, s));
  for (const p of pts) {
    const rx = Math.cos(p.h);
    const rz = Math.sin(p.h);
    pos.push(p.x + rx * from, y, p.z + rz * from, p.x + rx * to, y, p.z + rz * to);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, toon(color));
  m.material = m.material.clone();
  m.material.side = THREE.DoubleSide;
  m.receiveShadow = true;
  return m;
}

/** World transform helper: put obj at (distance s, lateral offset) along the route. */
function placeAt(route, obj, s, lateral, y = 0, yawOffset = 0) {
  const p = sampleRoute(route, s);
  obj.position.set(p.x + Math.cos(p.h) * lateral, y, p.z + Math.sin(p.h) * lateral);
  // Local +z of objects = "toward the camera"; facing along the route means yaw = PI - h.
  obj.rotation.y = Math.PI - p.h + yawOffset;
  return p;
}

// The scenario's ambient hook starts preparation before booking/helmet/getOn choices.
// Each scene owns its prepared ride; exiting while loading cannot install a stale view.
const prepared = new WeakMap();
const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

// Batch only static facade meshes, in short street sections so frustum culling still works.
// Animated laundry stays in the scene graph with its original prop update callback.
function batchFacades(facades, scene, ownedGeometry) {
  const materials = new Map();
  for (const facade of facades) {
    facade.updateMatrixWorld(true);
    const meshes = [];
    facade.traverse(obj => {
      if (!obj.isMesh) return;
      for (let parent = obj; parent && parent !== facade; parent = parent.parent)
        if (parent.userData.animated) return;
      if (!materials.has(obj.material)) materials.set(obj.material, []);
      // Rounded boxes are non-indexed; normalize cylinders and sign planes before merging.
      const geometry = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
      geometry.deleteAttribute("uv1");
      materials.get(obj.material).push(geometry.applyMatrix4(obj.matrixWorld));
      meshes.push(obj);
    });
    meshes.forEach(obj => obj.removeFromParent());
  }
  for (const [material, geometries] of materials) {
    const geometry = mergeGeometries(geometries, false);
    geometries.forEach(g => g.dispose());
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);
    ownedGeometry.push(geometry);
  }
}

function prepare(ctx) {
  if (prepared.has(ctx.scene)) return prepared.get(ctx.scene);
  const state = { disposed: false, ownedGeometry: [], ownedMaterials: [], ride: null, scene: null, sun: null, error: null };
  prepared.set(ctx.scene, state);
  ctx.scene.onDispose(() => {
    state.disposed = true;
    state.sun?.shadow.dispose();
    state.scene?.clear();
    state.ride = null;
    state.ownedGeometry.forEach(geometry => geometry.dispose());
    state.ownedMaterials.forEach(material => material.dispose());
    prepared.delete(ctx.scene);
  });
  state.ready = buildRide(ctx, state).then(ride => {
    if (!state.disposed) state.ride = ride;
  }).catch(error => { state.error = error; });
  return state;
}

async function buildRide(ctx, state) {
  const ownedGeometry = state.ownedGeometry;
  const animated = [];
  const route = buildRoute(HANOI_ROUTE);
  const sim = new RideSim(route);
  const rand = mulberry32(11);

  // ---------------------------------------------------------------- scene
  const scene = state.scene = new THREE.Scene();
  scene.background = new THREE.Color("#ffe7c2");
  scene.fog = new THREE.Fog("#ffe7c2", 35, 90);
  scene.add(new THREE.HemisphereLight("#fff6e8", "#a7b6d6", 1.6));
  const sun = state.sun = new THREE.DirectionalLight("#fff1d6", 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 60 });
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), toon("#d8c8ae"));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);
  scene.add(ribbon(route, -ROAD_HALF, ROAD_HALF, 0, "#5a5f6b"));
  scene.add(ribbon(route, -0.08, 0.08, 0.01, "#f1f1f1", 0.5));
  scene.add(ribbon(route, ROAD_HALF, ROAD_HALF + 3.5, 0.12, "#e9dcc6"));
  scene.add(ribbon(route, -ROAD_HALF - 3.5, -ROAD_HALF, 0.12, "#e9dcc6"));

  ownedGeometry.push(ground.geometry);
  for (const obj of scene.children.filter(obj => obj.isMesh && obj !== ground)) {
    ownedGeometry.push(obj.geometry);
    state.ownedMaterials.push(obj.material);
  }

  // Shops along both sides (skip spots that would overlap on the inside of turns).
  const placed = [];
  const facadeBatch = [];
  const free = (x, z) => placed.every((p) => Math.hypot(p.x - x, p.z - z) > 4.2);
  for (let s = 2; s < route.length - 4; s += 4.6) {
    for (const side of [-1, 1]) {
      const p = sampleRoute(route, s);
      const lat = side * (ROAD_HALF + 6.2);
      const x = p.x + Math.cos(p.h) * lat;
      const z = p.z + Math.sin(p.h) * lat;
      const near = route.points.some((q) => Math.hypot(q.x - x, q.z - z) < ROAD_HALF + 3.6);
      if (near || !free(x, z)) continue;
      placed.push({ x, z });
      const variant = placed.length - 1;
      const shop = variant % 4 === 0
        ? colonialFacade(SHOP_COLORS[variant % SHOP_COLORS.length], variant)
        : oldQuarterHouse(SHOP_COLORS[variant % SHOP_COLORS.length], variant, SIGNS[variant % SIGNS.length]);
      shop.position.set(x, 0, z);
      // Face the road: local +z must point back toward the route centre.
      shop.rotation.y = Math.atan2(-Math.cos(p.h) * side, -Math.sin(p.h) * side);
      scene.add(shop);
      facadeBatch.push(shop);
      if (shop.userData.update) animated.push(shop);
      if (facadeBatch.length >= 2) {
        batchFacades(facadeBatch.splice(0), scene, ownedGeometry);
        await nextFrame();
        if (state.disposed) return;
      }
    }
  }
  batchFacades(facadeBatch, scene, ownedGeometry);
  // Trees soften the street edges.
  for (let s = 10; s < route.length; s += 23) {
    const tr = tree();
    placeAt(route, tr, s, (s % 2 ? 1 : -1) * (ROAD_HALF + 1.8), 0.12);
    scene.add(tr);
  }
  const gate = templeGate();
  placeAt(route, gate, route.length + 6, 0, 0, Math.PI);
  scene.add(gate);

  // ---------------------------------------------------------------- the bike: driver + you
  const bike = new THREE.Group();
  const bikeBody = new THREE.Group();
  bike.add(bikeBody);
  const mb = motorbike("#00b14f");
  mb.scale.setScalar(1.35);
  bikeBody.add(mb);
  const driver = await Character.create("character-male-d");
  driver.play("drive");
  driver.root.position.set(0, 0.42, 0.05);
  bikeBody.add(driver.root);
  driver.addHelmet();
  const you = await Character.create(ctx.scene.avatar);
  you.play("drive");
  you.root.position.set(0, 0.5, -0.75);
  const youPivot = new THREE.Group(); // lean / brace pose
  youPivot.add(you.root);
  youPivot.position.y = 0.4;
  you.root.position.y = 0.1;
  bikeBody.add(youPivot);
  you.addHelmet();
  scene.add(bike);

  // ---------------------------------------------------------------- obstacles per event
  const obstacles = [];
  for (const e of sim.events) {
    if (e.obstacle === "busCar") {
      const bus = hanoiBus("#438b53", 0, "09");
      bus.name = "hanoiBus";
      placeAt(route, bus, e.start + 6, -2.4, 0);
      const car = hanoiTaxi("#f3f1e7", e.id);
      car.name = "hanoiTaxi";
      placeAt(route, car, e.start + 5, 2.6, 0, Math.PI);
      scene.add(bus, car);
      obstacles.push({ e, objs: [bus, car], kind: "convoy", base: [e.start + 6, e.start + 5] });
    } else if (e.obstacle === "bikeCut") {
      const ob = loadedScooter("#c68150", "crates");
      ob.scale.setScalar(1.35);
      const r = await Character.create("character-female-f");
      r.play("drive");
      r.root.position.set(0, 0.42, -0.1);
      ob.add(r.root);
      scene.add(ob);
      obstacles.push({ e, objs: [ob], kind: "cut", chars: [r] });
    } else if (e.obstacle === "pedestrian") {
      const p = await Character.create("character-male-c");
      p.play("walk");
      scene.add(p.root);
      obstacles.push({ e, objs: [p.root], kind: "walk", chars: [p] });
    } else if (e.obstacle === "redLight") {
      const tl = trafficLight("red");
      placeAt(route, tl, e.start + 3, ROAD_HALF + 0.6, 0.12);
      scene.add(tl);
      obstacles.push({ e, objs: [tl], kind: "light" });
    }
  }

  // Vietnamese street traffic: distinct silhouettes, not just different bike colours.
  const traffic = [];
  const vehicleBuilders = [
    i => xichLo("#b44343", Math.floor(i / 6)),
    i => goodsBicycle("#427f86", Math.floor(i / 6)),
    i => loadedScooter("#5a8f9d", Math.floor(i / 6)),
    i => hanoiTaxi(i % 2 ? "#438b63" : "#f3f1e7", i),
    i => hanoiBus("#438b53", i, "32", "Gi\u00e1p B\u00e1t \u2013 Nh\u1ed5n"),
    () => motorbike("#e85d75"),
  ];
  for (let i = 0; i < 14; i++) {
    const type = i % vehicleBuilders.length;
    const g = vehicleBuilders[type](i);
    g.name = ["xichLo", "goodsBicycle", "loadedScooter", "hanoiTaxi", "hanoiBus", "motorbike"][type];
    let r = null;
    if (type === 2 || type === 5) {
      r = await Character.create(RIDERS[i % RIDERS.length]);
      r.play("drive");
      r.mixer.setTime(rand());
      r.root.position.set(0, 0.42, 0.12);
      g.add(r.root);
    }
    scene.add(g);
    if (g.userData.update) animated.push(g);
    const lane = (i % 2 ? -1 : 1) * (type === 4 ? 3.5 : 2.3 + rand() * 1.5);
    const s = 10 + i * 18;
    placeAt(route, g, s, lane);
    traffic.push({ g, r, s, lane, v: type <= 1 ? 3.5 : type === 4 ? 6 : 7 + rand() * 2 });
    await nextFrame();
    if (state.disposed) return;
  }

  // ---------------------------------------------------------------- camera
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  const fit = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.fov = camera.aspect < 1 ? 70 : 55;
    camera.updateProjectionMatrix();
  };
  fit();

  // Upload initial geometry, textures and shader variants before the boarding step.
  const initial = sampleRoute(route, 0), look = sampleRoute(route, 7);
  bike.rotation.y = Math.PI - initial.h;
  camera.position.set(initial.x, 4.2, initial.z);
  camera.lookAt(look.x, 1, look.z);
  sun.position.set(initial.x + 10, 22, initial.z + 8);
  sun.target.position.set(initial.x, 0, initial.z);
  await ctx.game.renderer.compileAsync(scene, camera);
  if (state.disposed) return;
  await nextFrame();
  if (state.disposed) return;
  const renderer = ctx.game.renderer;
  const target = new THREE.WebGLRenderTarget(64, 64);
  const previous = renderer.getRenderTarget();
  try {
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
  } finally {
    renderer.setRenderTarget(previous);
    target.dispose();
  }
  return { route, sim, rand, scene, sun, bike, bikeBody, driver, you, youPivot, obstacles, traffic, camera, fit, animated };
}

export const GrabRide = {
  ambient(ctx) {
    prepare(ctx);
    return {};
  },
  async run(ctx) {
    const game = ctx.game;
    const state = prepare(ctx);
    await state.ready;
    if (state.error) throw state.error;
    if (state.disposed) return { points: 0, maxPoints: 100 };
    const { route, sim, rand, scene, sun, bike, bikeBody, driver, you, youPivot, obstacles, traffic, camera, fit, animated } = state.ride;
    fit();
    addEventListener("resize", fit);
    game.view = { scene, camera };
    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();
    let camInit = false;

    // ---------------------------------------------------------------- HUD
    const root = document.getElementById("minigame");
    root.className = "show";
    document.body.classList.add("mg-ui");
    root.innerHTML = `
      <div class="ride-top">
        <div class="ride-title">🛵 ${esc(t(TXT.title))}</div>
        <div class="ride-progress"><div></div><span>🏁</span></div>
        <div class="ride-mood">${esc(t(TXT.driver))}: <span class="mood">😊</span></div>
      </div>
      <div class="ride-cue"></div>
      <div class="ride-fb"></div>
      <div class="ride-pad">
        <div class="pad-left">
          <button class="rbtn" data-k="lean-l">⬅️</button>
          <button class="rbtn" data-k="lean-r">➡️</button>
        </div>
        <div class="pad-right">
          <button class="rbtn" data-k="brace">✊<small>${esc(t(TXT.holdBtn))}</small></button>
          <button class="rbtn" data-k="tuck">🦵<small>${esc(t(TXT.kneesBtn))}</small></button>
        </div>
      </div>
      ${isTouch ? "" : `<div class="ride-keys">${esc(t(TXT.keys))}</div>`}`;
    const keys = ctx.input.keys;
    for (const b of root.querySelectorAll("[data-k]")) {
      const k = b.dataset.k;
      const down = (e) => {
        e.preventDefault();
        keys.add(k);
        b.classList.add("down");
      };
      const up = () => {
        keys.delete(k);
        b.classList.remove("down");
      };
      b.addEventListener("pointerdown", down);
      b.addEventListener("pointerup", up);
      b.addEventListener("pointerleave", up);
      b.addEventListener("pointercancel", up);
    }
    const cueEl = root.querySelector(".ride-cue");
    const fbEl = root.querySelector(".ride-fb");
    const progEl = root.querySelector(".ride-progress div");
    const moodEl = root.querySelector(".mood");
    let fbTimer = 0;
    const feedback = (txt, kind) => {
      fbEl.className = `ride-fb show ${kind}`;
      fbEl.innerHTML = rich(t(txt));
      fbTimer = 1.4;
    };

    const readInput = () => {
      const has = (...k) => k.some((x) => keys.has(x));
      return {
        lean: has("a", "arrowleft", "lean-l") ? -1 : has("d", "arrowright", "lean-r") ? 1 : 0,
        brace: has(" ", "w", "arrowup", "brace"),
        tuck: has("s", "arrowdown", "tuck"),
      };
    };

    // ---------------------------------------------------------------- loop
    let jolt = 0;
    let wobble = 0;
    let knee = 0;
    let finished = false;
    let arrivalTimer;
    let cleaned = false;
    let resolveRun;
    const donePromise = new Promise((r) => (resolveRun = r));

    const update = (dt, time) => {
      if (finished) return;
      const inp = readInput();
      sim.step(dt, inp);
      for (const o of sim.out.splice(0)) {
        if (o.type !== "result") continue;
        if (o.ok) {
          sfx.click();
          feedback(TXT.good, "good");
        } else {
          sfx.bad();
          feedback(TXT[o.reason], "bad");
          if (o.reason === "jolt") jolt = 0.6;
          if (o.reason === "counter" || o.reason === "stiff") wobble = 0.8;
          if (o.reason === "knee") knee = 0.6;
        }
      }

      // bike pose
      const p = sampleRoute(route, sim.s);
      const ahead = sampleRoute(route, sim.s + 3);
      const turnRate = ahead.h - p.h; // >0 turning right
      bike.position.set(p.x, 0.0, p.z);
      bike.rotation.y = Math.PI - p.h;
      const roll = THREE.MathUtils.clamp(-turnRate * 2.2, -0.35, 0.35);
      wobble = Math.max(0, wobble - dt);
      bikeBody.rotation.z = roll + Math.sin(time * 28) * 0.06 * wobble;
      // passenger body: lean input, brace forward, jolt
      jolt = Math.max(0, jolt - dt);
      knee = Math.max(0, knee - dt);
      youPivot.rotation.z += ((-inp.lean * 0.3) - youPivot.rotation.z) * Math.min(1, dt * 10);
      const pitch = (inp.brace ? 0.25 : 0) + jolt * 0.8;
      youPivot.rotation.x += (pitch - youPivot.rotation.x) * Math.min(1, dt * 12);
      youPivot.scale.x += ((inp.tuck ? 0.82 : 1) - youPivot.scale.x) * Math.min(1, dt * 12);
      if (knee > 0) youPivot.position.x = Math.sin(time * 40) * 0.05 * knee;
      else youPivot.position.x = 0;
      driver.update(dt);
      you.update(dt);

      // obstacles
      for (const ob of obstacles) {
        const d = ob.e.start - sim.s; // metres until the event
        if (ob.kind === "cut") {
          // a bike pulls out from the right kerb and crosses in front of you
          const k = THREE.MathUtils.clamp(1 - (d + 4) / 14, 0, 1);
          placeAt(route, ob.objs[0], ob.e.start + 3, (ROAD_HALF + 1) - k * 7, 0, -Math.PI / 2 + 0.4);
          ob.chars[0].update(dt);
        } else if (ob.kind === "walk") {
          const k = THREE.MathUtils.clamp(1 - (d + 2) / 14, 0, 1);
          placeAt(route, ob.objs[0], ob.e.start + 3, -(ROAD_HALF + 0.5) + k * 5.5, 0, -Math.PI / 2);
          ob.chars[0].play(k > 0 && k < 1 ? "walk" : "idle");
          ob.chars[0].update(dt);
        } else if (ob.kind === "convoy") {
          // bus and car crawl forward so you pass between them
          const prog = Math.max(0, -(d + 10)) * 0.35;
          placeAt(route, ob.objs[0], ob.base[0] + prog, -2.6, 0);
          placeAt(route, ob.objs[1], ob.base[1] + prog, 2.6, 0, Math.PI);
        }
      }
      // Ambient traffic: recycle vehicles beyond the visible stretch of road.
      for (const tr of traffic) {
        tr.s += tr.v * dt;
        if (tr.s < sim.s - 25) tr.s = sim.s + 40 + rand() * 40;
        if (tr.s > sim.s + 90) tr.s = sim.s - 20;
        // keep a gap from you and out of the camera corridor behind you
        const near = tr.s > sim.s - 10 && tr.s < sim.s + 4;
        const lane = near && Math.abs(tr.lane) < 2.8 ? Math.sign(tr.lane || 1) * 2.8 : tr.lane;
        tr.g.visible = tr.s >= 0 && tr.s <= route.length;
        placeAt(route, tr.g, tr.s, lane, 0);
        tr.r?.update(dt);
      }

      for (const obj of animated) obj.userData.update(dt, time);

      // camera: behind and above, looking ahead along the route
      const back = sampleRoute(route, Math.max(0, sim.s - 6.5));
      const look = sampleRoute(route, sim.s + 7);
      const target = new THREE.Vector3(back.x, 4.2, back.z);
      const lookAt = new THREE.Vector3(look.x, 1.0, look.z);
      if (!camInit) {
        camPos.copy(target);
        camLook.copy(lookAt);
        camInit = true;
      }
      camPos.lerp(target, Math.min(1, dt * 4));
      camLook.lerp(lookAt, Math.min(1, dt * 5));
      camera.position.copy(camPos);
      if (jolt > 0) camera.position.y += Math.sin(time * 50) * 0.08 * jolt;
      camera.lookAt(camLook);
      sun.position.set(p.x + 10, 22, p.z + 8);
      sun.target.position.set(p.x, 0, p.z);

      // HUD
      progEl.style.width = `${Math.min(100, (sim.s / route.length) * 100)}%`;
      moodEl.textContent = sim.comfort > 80 ? "😊" : sim.comfort > 50 ? "😐" : sim.comfort > 20 ? "😬" : "😫";
      // Show the action whose window is open now; otherwise the next one coming up.
      const act = sim.active().sort((a, b) => (sim.s >= b.from) - (sim.s >= a.from) || a.from - b.from)[0];
      if (act) {
        const txt = act.type === "lean" ? (act.dir < 0 ? TXT.leanL : TXT.leanR) : TXT[act.type];
        const icon = act.type === "lean" ? (act.dir < 0 ? "⬅️" : "➡️") : act.type === "brace" ? "✊" : "🦵";
        const open = sim.s >= act.from;
        const doing =
          (act.type === "lean" && inp.lean === act.dir) || (act.type === "brace" && inp.brace) || (act.type === "tuck" && inp.tuck);
        const html = `<span class="ic">${icon}</span>${esc(t(txt))}`;
        if (cueEl.dataset.html !== html) {
          cueEl.innerHTML = html;
          cueEl.dataset.html = html;
        }
        cueEl.className = `ride-cue show ${open ? "now" : "soon"} ${doing ? "doing" : ""}`;
        // highlight the matching button
        for (const b of root.querySelectorAll("[data-k]")) {
          const k = b.dataset.k;
          const want = act.type === "lean" ? (act.dir < 0 ? "lean-l" : "lean-r") : act.type;
          b.classList.toggle("want", k === want);
        }
      } else {
        cueEl.className = "ride-cue";
        for (const b of root.querySelectorAll(".want")) b.classList.remove("want");
      }
      fbTimer -= dt;
      if (fbTimer <= 0) fbEl.className = "ride-fb";

      if (sim.done) {
        finished = true;
        feedback(TXT.arrived, "good");
        sfx.good();
        arrivalTimer = setTimeout(() => resolveRun(), 1400);
      }
    };
    game.updaters.add(update);

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      clearTimeout(arrivalTimer);
      resolveRun();
      game.updaters.delete(update);
      removeEventListener("resize", fit);
      for (const k of ["lean-l", "lean-r", "brace", "tuck"]) keys.delete(k);
      if (game.view?.scene === scene) game.view = null;
      root.className = "";
      root.innerHTML = "";
      document.body.classList.remove("mg-ui");
    };
    ctx.scene.onDispose?.(cleanup);

    await donePromise;
    cleanup();
    prepared.delete(ctx.scene);
    const r = sim.result();
    const tips = [
      {
        tip: { en: "As a passenger, lean **with** the driver into turns. Never lean against them.", vi: "Khi ngồi sau, hãy nghiêng **theo** tài xế khi vào cua. Đừng nghiêng ngược lại." },
        good: r.leanMistakes === 0,
      },
      {
        tip: { en: "Hold the rear rail or the driver's waist so you don't slide forward when they brake.", vi: "Bám vào tay nắm phía sau hoặc eo tài xế để không bị chúi khi xe phanh." },
        good: r.braceMistakes === 0,
      },
      {
        tip: { en: "Keep your knees and bags tucked in. Bikes squeeze through very small gaps.", vi: "Khép gối và giữ túi sát người. Xe máy hay luồn qua những khe rất hẹp." },
        good: r.tuckMistakes === 0,
      },
    ];
    return { ...r, tips };
  },
};
