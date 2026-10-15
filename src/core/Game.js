import * as THREE from "three";

/** Renderer, scene, lights, follow camera and the main loop. */
export class Game {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 400);
    this.camBase = new THREE.Vector3(0, 12, 10);
    this.camOffset = this.camBase.clone();
    this.zoom = 1; // < 1 moves the camera closer (used during conversations)
    this.zoomTarget = 1;
    this.camTarget = new THREE.Vector3();
    this.camFocus = null; // Object3D to follow

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

  resize() {
    const w = innerWidth;
    const h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Pull the camera back a little on portrait screens so the scene stays readable.
    this.camera.fov = w < h ? 60 : 45;
    this.camera.updateProjectionMatrix();
  }

  follow(obj, snap = false) {
    this.camFocus = obj;
    if (snap) this._updateCamera(1, true);
  }

  _updateCamera(dt, snap) {
    if (!this.camFocus) return;
    const p = this.camFocus.position;
    const k = snap ? 1 : 1 - Math.exp(-dt * 5);
    this.zoom += (this.zoomTarget - this.zoom) * (snap ? 1 : 1 - Math.exp(-dt * 3));
    this.camOffset.copy(this.camBase).multiplyScalar(this.zoom);
    this.camTarget.lerp(new THREE.Vector3(p.x, p.y + 1, p.z), k);
    if (snap) this.camTarget.set(p.x, p.y + 1, p.z);
    this.camera.position.copy(this.camTarget).add(this.camOffset);
    this.camera.lookAt(this.camTarget);
    this.sun.position.set(this.camTarget.x + 12, 25, this.camTarget.z + 8);
    this.sun.target.position.copy(this.camTarget);
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
