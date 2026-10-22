import * as THREE from "three";

// Follow-camera rig: the camera sits `height` above and `distance` behind (+z) the focus,
// with a vertical `fov` (landscape; portrait screens get PORTRAIT_FOV more) and looks
// `lookAhead` metres ahead of a moving focus. The view is centred `aim` metres beyond (-z) the
// focus so the frame shows the street ahead instead of the ground under the camera.
// Maps can override it with `map.camera`.
const DEFAULT_RIG = { height: 5.5, distance: 14, fov: 36, lookAhead: 1.6, aim: 3 };
const PORTRAIT_FOV = 15;
const FOCUS_SPEED = 3.4; // m/s at which the look-ahead reaches its full length

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
    this.rig = { ...DEFAULT_RIG };
    this.camBase = new THREE.Vector3(0, this.rig.height, this.rig.distance);
    this.camOffset = this.camBase.clone();
    this.zoom = 1; // < 1 moves the camera closer (used during conversations)
    this.zoomTarget = 1;
    this.camTarget = new THREE.Vector3();
    this.camFocus = null; // Object3D to follow
    this.lookAhead = new THREE.Vector3(); // smoothed shift toward where the focus is heading
    this._lastFocus = new THREE.Vector3();
    this._goal = new THREE.Vector3();

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

  setEnvironment({ sky = "#bfe6ff", fog = [40, 110] } = {}) {
    this.scene.background = new THREE.Color(sky);
    this.scene.fog = new THREE.Fog(sky, fog[0], fog[1]);
  }

  /** Follow-camera rig ({ height, distance, fov?, lookAhead?, aim? }); null restores the default. */
  setCameraRig(rig) {
    this.rig = { ...DEFAULT_RIG, ...rig };
    this.camBase.set(0, this.rig.height, this.rig.distance);
    this.resize();
  }

  resize() {
    const w = innerWidth;
    const h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Pull the camera back a little on portrait screens so the scene stays readable.
    this.camera.fov = w < h ? this.rig.fov + PORTRAIT_FOV : this.rig.fov;
    this.camera.updateProjectionMatrix();
  }

  follow(obj, snap = false) {
    this.camFocus = obj;
    this._lastFocus.copy(obj.position);
    if (snap) this._updateCamera(1, true);
  }

  _updateCamera(dt, snap) {
    if (!this.camFocus) return;
    const p = this.camFocus.position;
    const k = snap ? 1 : 1 - Math.exp(-dt * 5);
    this.zoom += (this.zoomTarget - this.zoom) * (snap ? 1 : 1 - Math.exp(-dt * 3));
    this.camOffset.copy(this.camBase).multiplyScalar(this.zoom);
    this._updateLookAhead(dt, snap);
    this._goal.set(p.x + this.lookAhead.x, p.y + 1, p.z + this.lookAhead.z - this.rig.aim * this.zoom);
    if (snap) this.camTarget.copy(this._goal);
    else this.camTarget.lerp(this._goal, k);
    this.camera.position.copy(this.camTarget).add(this.camOffset);
    this.camera.lookAt(this.camTarget);
    // Centre the shadow map a little beyond the focus, where the lowered camera looks.
    const sz = this.camTarget.z - this.camOffset.z * 0.4;
    this.sun.position.set(this.camTarget.x + 12, 25, sz + 8);
    this.sun.target.position.set(this.camTarget.x, this.camTarget.y, sz);
  }

  /** Shift the view toward where the focus is moving (from its frame-to-frame motion). */
  _updateLookAhead(dt, snap) {
    const p = this.camFocus.position;
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

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    for (const fn of this.updaters) fn(dt, this.time);
    this._updateCamera(dt, false);
    // A minigame can take over the view with its own close-up scene.
    const v = this.view;
    this.renderer.render(v ? v.scene : this.scene, v ? v.camera : this.camera);
  }
}
