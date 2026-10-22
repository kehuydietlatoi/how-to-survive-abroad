import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as THREE from "three";

// Assets.js reads Vite's import.meta.env at module level, which node does not provide.
// Give it the dev-server default so the prop modules import without Vite or a DOM.
registerHooks({
  load(url, context, nextLoad) {
    const res = nextLoad(url, context);
    if (!url.endsWith("/src/core/Assets.js")) return res;
    return { ...res, source: `import.meta.env ??= { BASE_URL: "/" };\n${res.source}` };
  },
});

const { ALL_PROPS } = await import("../src/world/registry.js");
const { VN_PROPS } = await import("../src/world/propsVietnam.js");
const { DE_PROPS } = await import("../src/world/propsGermany.js");
const { World } = await import("../src/world/World.js");
const { FollowCamera, DEFAULT_RIG, PORTRAIT_FOV } = await import("../src/core/Game.js");

// Every content/<country>/<scenario>/map.js, so new maps are covered automatically.
const root = fileURLToPath(new URL("../content/", import.meta.url));
const dirs = (dir) => readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const maps = [];
for (const country of dirs(root)) {
  for (const sc of dirs(join(root, country))) {
    const file = join(root, country, sc, "map.js");
    if (existsSync(file)) maps.push([`${country}/${sc}`, (await import(pathToFileURL(file))).default]);
  }
}

test("every content map is found", () => {
  assert.ok(maps.length >= 6, `only ${maps.length} maps found`);
});

test("country prop registries are merged into the world registry", () => {
  for (const [name, fn] of Object.entries({ ...VN_PROPS, ...DE_PROPS })) assert.equal(ALL_PROPS[name], fn, name);
  for (const [name, fn] of Object.entries(ALL_PROPS)) assert.equal(typeof fn, "function", name);
});

test("every prop used by a map exists in the registry", () => {
  for (const [id, map] of maps)
    for (const item of map.items) if (item.prop) assert.ok(ALL_PROPS[item.prop], `${id}: unknown prop "${item.prop}"`);
});

// ---------------------------------------------------------------- follow camera

const STEP = 1 / 60;
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} vs ${b}`);

function rigAt(x = 2, z = 5) {
  const cam = new FollowCamera(new THREE.PerspectiveCamera());
  cam.setViewport(1280, 720);
  const focus = new THREE.Object3D();
  focus.position.set(x, 0, z);
  cam.follow(focus, true);
  return { cam, focus, camera: cam.camera };
}

/** Run the camera for `secs`, moving the focus by (vx, vz) m/s. */
function run(cam, focus, secs, vx = 0, vz = 0) {
  for (let t = 0; t < secs; t += STEP) {
    focus.position.x += vx * STEP;
    focus.position.z += vz * STEP;
    cam.update(STEP);
  }
}

test("camera: default rig frames the focus from behind, aimed past it", () => {
  const { camera, cam } = rigAt(2, 5);
  const { height, distance, aim, fov } = DEFAULT_RIG;
  near(cam.target.x, 2, 1e-9, "target x");
  near(cam.target.z, 5 - aim, 1e-9, "target z");
  near(camera.position.y, 1 + height, 1e-9, "camera y");
  near(camera.position.z, 5 - aim + distance, 1e-9, "camera z");
  assert.equal(camera.fov, fov);
});

test("camera: a map override replaces height/distance/fov and null restores the default", () => {
  const { camera, cam, focus } = rigAt(0, 0);
  cam.setRig({ height: 9, distance: 6, fov: 50 });
  cam.follow(focus, true);
  near(camera.position.y, 10, 1e-9, "override height");
  near(camera.position.z - cam.target.z, 6, 1e-9, "override distance");
  assert.equal(camera.fov, 50);
  assert.equal(cam.rig.lookAhead, DEFAULT_RIG.lookAhead, "unspecified fields keep defaults");
  cam.setRig(null);
  cam.follow(focus, true);
  near(camera.position.y, 1 + DEFAULT_RIG.height, 1e-9, "reset height");
  near(camera.position.z - cam.target.z, DEFAULT_RIG.distance, 1e-9, "reset distance");
  assert.equal(camera.fov, DEFAULT_RIG.fov);
});

test("camera: portrait screens widen the (overridden) FOV", () => {
  const { camera, cam } = rigAt();
  cam.setViewport(390, 844);
  assert.equal(camera.fov, DEFAULT_RIG.fov + PORTRAIT_FOV);
  cam.setRig({ height: 8, distance: 10, fov: 50 });
  assert.equal(camera.fov, 50 + PORTRAIT_FOV);
  cam.setViewport(1280, 720);
  assert.equal(camera.fov, 50);
  near(camera.aspect, 1280 / 720, 1e-9, "aspect");
});

test("camera: looks ahead in the movement direction and recentres when standing", () => {
  const { cam, focus } = rigAt(0, 0);
  run(cam, focus, 4, 3.4, 0); // walk +x
  near(cam.lookAhead.x, DEFAULT_RIG.lookAhead, 0.05, "look-ahead along +x");
  near(cam.lookAhead.z, 0, 1e-6, "no sideways look-ahead");
  // The smoothed target trails its goal a little but still leads the walker.
  assert.ok(cam.target.x - focus.position.x > 0.5, `view leads the walker: ${cam.target.x - focus.position.x}`);
  run(cam, focus, 4, 0, -3.4); // walk away from the camera
  near(cam.lookAhead.z, -DEFAULT_RIG.lookAhead, 0.05, "look-ahead along -z");
  near(cam.lookAhead.x, 0, 0.05, "x look-ahead released");
  run(cam, focus, 2, 1, 0); // slow stroll: shorter look-ahead
  near(cam.lookAhead.x, DEFAULT_RIG.lookAhead / 3.4, 0.05, "scaled by speed");
  run(cam, focus, 5);
  near(cam.lookAhead.length(), 0, 0.01, "recentred when idle");
  near(cam.target.x - focus.position.x, 0, 0.01, "target back on the walker");
  near(cam.target.z - focus.position.z, -DEFAULT_RIG.aim, 0.01, "target back at the aim point");
});

test("camera: teleports are not treated as movement", () => {
  const { cam, focus } = rigAt(0, 0);
  focus.position.x += 50;
  cam.update(STEP);
  near(cam.lookAhead.length(), 0, 1e-9, "no look-ahead from a jump");
});

test("camera: conversation zoom moves the camera closer and back", () => {
  const { cam, focus, camera } = rigAt(0, 0);
  cam.zoomTarget = 0.62;
  run(cam, focus, 4);
  near(camera.position.y - cam.target.y, DEFAULT_RIG.height * 0.62, 0.02, "zoomed height");
  near(camera.position.z - cam.target.z, DEFAULT_RIG.distance * 0.62, 0.02, "zoomed distance");
  cam.zoomTarget = 1;
  run(cam, focus, 4);
  near(camera.position.z - cam.target.z, DEFAULT_RIG.distance, 0.02, "zoomed back out");
});

// ---------------------------------------------------------------- cut-away

/** World with one fade occluder spanning [x0..x1] x [0..h] x [z0..z1]. */
function occluderWorld([x0, x1], [z0, z1], h = 9) {
  const world = new World(new THREE.Scene());
  const obj = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), new THREE.MeshBasicMaterial());
  obj.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2);
  world.root.add(obj);
  obj.updateMatrixWorld(true);
  const o = { obj, box: new THREE.Box3().setFromObject(obj), opacity: 1, mats: null };
  world.occluders.push(o);
  return { world, o };
}

// Camera behind and above a player standing at (0, 8) (head at y 1.2), as in the phở street.
const CAM = new THREE.Vector3(0, 6.5, 19);
const HEAD = new THREE.Vector3(0, 1.2, 8);

function settle(world, cam = CAM, head = HEAD) {
  const camera = new THREE.PerspectiveCamera();
  camera.position.copy(cam);
  for (let i = 0; i < 60; i++) world.updateOccluders(STEP * 2, camera, head);
}

test("cut-away: a house that hides the player fades out, and back in once it no longer does", () => {
  const { world, o } = occluderWorld([-2, 2], [10, 16]);
  settle(world);
  assert.equal(o.opacity, 0);
  assert.equal(o.obj.visible, false);
  settle(world, CAM.clone().setX(12), HEAD.clone().setX(12)); // player walked 12 m along the street
  assert.equal(o.opacity, 1);
  assert.equal(o.obj.visible, true);
});

test("cut-away: a house that only covers the player's side fades too", () => {
  const { world, o } = occluderWorld([0.45, 4.5], [10, 16]);
  settle(world);
  assert.equal(o.opacity, 0);
});

test("cut-away: objects in the corridor that do not hide the player stay opaque", () => {
  const cases = {
    "neighbour house beside the sight line": [[2.5, 6.5], [10, 16], 9],
    "low kerb between camera and player": [[-2, 2], [10, 12], 0.3],
    "house behind the player": [[-2, 2], [-6, -2], 9],
  };
  for (const [name, [xs, zs, h]] of Object.entries(cases)) {
    const { world, o } = occluderWorld(xs, zs, h);
    settle(world);
    assert.equal(o.opacity, 1, name);
    assert.equal(o.obj.visible, true, name);
  }
});

test("cut-away: only objects within the ±4 m corridor are faded", () => {
  // Off-axis camera: the sight line crosses x = 2..9 between z 10 and 16.
  const cam = new THREE.Vector3(12, 6.5, 19);
  const outside = occluderWorld([4.2, 8], [10, 16]);
  assert.ok(outside.world._hidesTarget(outside.o.box, cam, HEAD), "the outside box does cut the sight line");
  settle(outside.world, cam);
  assert.equal(outside.o.opacity, 1, "outside the corridor: ignored");
  const inside = occluderWorld([3.8, 8], [10, 16]);
  settle(inside.world, cam);
  assert.equal(inside.o.opacity, 0, "inside the corridor: faded");
});

test("cut-away: only fade-marked map items become occluders", async () => {
  const world = new World(new THREE.Scene());
  await world._place({ prop: "wall", args: [4, 0.4, 4, "#ffffff"], p: [0, 12] });
  await world._place({ prop: "lanternString", args: [8], p: [0, 10] });
  assert.equal(world.occluders.length, 0);
  await world._place({ prop: "wall", args: [4, 0.4, 4, "#ffffff"], p: [0, 12], fade: true });
  assert.equal(world.occluders.length, 1);
});
