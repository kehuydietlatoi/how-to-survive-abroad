import * as THREE from "three";

// Follow-camera rig: the camera sits `height` above and `distance` behind (+z) the focus,
// with a vertical `fov` (landscape; portrait screens get PORTRAIT_FOV more) and looks
// `lookAhead` metres ahead of a moving focus. The view is centred `aim` metres beyond (-z) the
// focus so the frame shows the street ahead instead of the ground under the camera.
// Maps can override it with `map.camera`.
export const DEFAULT_RIG = { height: 5.5, distance: 14, fov: 36, lookAhead: 1.6, aim: 3 };
export const PORTRAIT_FOV = 15;
const FOCUS_SPEED = 3.4; // m/s at which the look-ahead reaches its full length

/** Third-person camera that follows an Object3D (no renderer, so it runs under node too). */
export class FollowCamera {
  constructor(camera) {
    this.camera = camera;
    this.rig = { ...DEFAULT_RIG };
    this.base = new THREE.Vector3(0, this.rig.height, this.rig.distance);
    this.offset = this.base.clone();
    this.zoom = 1; // < 1 moves the camera closer (used during conversations)
    this.zoomTarget = 1;
    this.target = new THREE.Vector3(); // point the camera looks at
    this.focus = null; // Object3D to follow
    this.lookAhead = new THREE.Vector3(); // smoothed shift toward where the focus is heading
    this._lastFocus = new THREE.Vector3();
    this._goal = new THREE.Vector3();
    this._portrait = false;
  }

  /** { height, distance, fov?, lookAhead?, aim? }; null restores the default. */
  setRig(rig) {
    this.rig = { ...DEFAULT_RIG, ...rig };
    this.base.set(0, this.rig.height, this.rig.distance);
    this._applyFov();
  }

  setViewport(w, h) {
    this.camera.aspect = w / h;
    this._portrait = w < h;
    this._applyFov();
  }

  _applyFov() {
    // Pull the camera back a little on portrait screens so the scene stays readable.
    this.camera.fov = this._portrait ? this.rig.fov + PORTRAIT_FOV : this.rig.fov;
    this.camera.updateProjectionMatrix();
  }

  follow(obj, snap = false) {
    this.focus = obj;
    this._lastFocus.copy(obj.position);
    if (snap) this.update(1, true);
  }

  update(dt, snap = false) {
    if (!this.focus) return;
    const p = this.focus.position;
    const k = snap ? 1 : 1 - Math.exp(-dt * 5);
    this.zoom += (this.zoomTarget - this.zoom) * (snap ? 1 : 1 - Math.exp(-dt * 3));
    this.offset.copy(this.base).multiplyScalar(this.zoom);
    this._updateLookAhead(dt, snap);
    this._goal.set(p.x + this.lookAhead.x, p.y + 1, p.z + this.lookAhead.z - this.rig.aim * this.zoom);
    if (snap) this.target.copy(this._goal);
    else this.target.lerp(this._goal, k);
    this.camera.position.copy(this.target).add(this.offset);
    this.camera.lookAt(this.target);
  }

  /** Shift the view toward where the focus is moving (from its frame-to-frame motion). */
  _updateLookAhead(dt, snap) {
    const p = this.focus.position;
    const vx = (p.x - this._lastFocus.x) / dt;
    const vz = (p.z - this._lastFocus.z) / dt;
    this._lastFocus.copy(p);
    if (snap) this.lookAhead.set(0, 0, 0);
    if (snap || !(dt > 0)) return;
    const speed = Math.hypot(vx, vz);
    // Ignore standing still and jumps (teleports, a new focus object).
    const s = speed > 0.3 && speed < 20 ? (this.rig.lookAhead * this.zoom * Math.min(1, speed / FOCUS_SPEED)) / speed : 0;
    this._goal.set(vx * s, 0, vz * s);
    this.lookAhead.lerp(this._goal, 1 - Math.exp(-dt * 2));
  }
}

/** Renderer, scene, lights, follow camera and the main loop. */
export class Game {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(DEFAULT_RIG.fov, 1, 0.1, 400);
    this.cam = new FollowCamera(this.camera);

    this.hemi = new THREE.HemisphereLight("#fff6e8", "#a7b6d6", 1.6);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight("#fff1d6", 2.0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const s = 22;
    Object.assign(this.sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 80 });
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.02;
    this.scene.add(this.sun, this.sun.target);

    this.updaters = new Set();
    this.view = null; // { scene, camera } override
    this.clock = new THREE.Clock();
    this.time = 0;

    addEventListener("resize", () => this.resize());
    this.resize();
    this.renderer.setAnimationLoop(() => this._frame());
  }

  /** Conversation zoom: < 1 moves the follow camera closer. */
  get zoomTarget() {
    return this.cam.zoomTarget;
  }
  set zoomTarget(v) {
    this.cam.zoomTarget = v;
  }

  setEnvironment({ sky = "#bfe6ff", fog = [40, 110] } = {}) {
    this.scene.background = new THREE.Color(sky);
    this.scene.fog = new THREE.Fog(sky, fog[0], fog[1]);
  }

  /** Follow-camera rig ({ height, distance, fov?, lookAhead?, aim? }); null restores the default. */
  setCameraRig(rig) {
    this.cam.setRig(rig);
  }

  resize() {
    const w = innerWidth;
    const h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.cam.setViewport(w, h);
  }

  follow(obj, snap = false) {
    this.cam.follow(obj, snap);
    if (snap) this._updateSun();
  }

  _updateSun() {
    // Centre the shadow map a little beyond the focus, where the lowered camera looks.
    const t = this.cam.target;
    const sz = t.z - this.cam.offset.z * 0.4;
    this.sun.position.set(t.x + 12, 25, sz + 8);
    this.sun.target.position.set(t.x, t.y, sz);
  }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    for (const fn of this.updaters) fn(dt, this.time);
    this.cam.update(dt);
    this._updateSun();
    // A minigame can take over the view with its own close-up scene.
    const v = this.view;
    this.renderer.render(v ? v.scene : this.scene, v ? v.camera : this.camera);
  }
}
