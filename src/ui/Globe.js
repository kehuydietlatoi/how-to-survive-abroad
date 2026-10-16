import * as THREE from "three";
import { isLand } from "./landmask.js";
import { t } from "../i18n/i18n.js";

// Menu globe: a toy planet made of land dots (Natural Earth mask) with one pin per country.
// Drag to spin, tap a pin to pick a country. It draws into its own canvas so the menu can keep
// the same instance alive while the HTML around it is re-rendered (language / avatar change).

const R = 1;
const DEG = Math.PI / 180;
const PIN_BALL = 0.042;
const TAP_SLOP = 6; // px

/** lat/lon (degrees) → unit vector on the globe (lon 0 faces the camera, east is to the right). */
export function latLonToVec(lat, lon, r = 1, out = new THREE.Vector3()) {
  const la = lat * DEG;
  const lo = lon * DEG;
  return out.set(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)).multiplyScalar(r);
}

/** Yaw / pitch that bring (lat, lon) to the middle of the view. */
export function facing(lat, lon) {
  return { yaw: -lon * DEG, pitch: Math.max(-0.75, Math.min(0.75, lat * DEG * 0.7)) };
}

function wrapAngle(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

function pillLabel(text, color) {
  const font = 56;
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  g.font = `bold ${font}px "Baloo 2", system-ui, sans-serif`;
  const w = Math.ceil(g.measureText(text).width) + 56;
  const h = font + 32;
  c.width = w;
  c.height = h;
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.roundRect(4, 4, w - 8, h - 8, h / 2 - 4);
  g.fill();
  g.lineWidth = 8;
  g.strokeStyle = color;
  g.stroke();
  g.fillStyle = "#3b3355";
  g.font = `bold ${font}px "Baloo 2", system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 3);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  const s = 0.2;
  sp.scale.set((w / h) * s, s, 1);
  sp.center.set(0.5, -0.55); // sit above the pin instead of covering it
  sp.renderOrder = 10;
  return sp;
}

export class Globe {
  /**
   * @param {{id:string, flag:string, name:{en:string,vi:string}, lat:number, lon:number, color:string}[]} countries
   * @param {{ onPick?: (id: string) => void }} opts
   */
  constructor(countries, { onPick } = {}) {
    this.countries = countries;
    this.onPick = onPick;
    this.ok = false;
    this.selected = null;
    this.hovered = null;
    this.yaw = -10 * DEG;
    this.pitch = 0.35;
    this.target = null; // { yaw, pitch } while flying to a country
    this.vel = { yaw: 0, pitch: 0 };
    this.dist = 4.0;
    this.distTarget = 4.0;
    this.labels = new Map(); // `${id}|${lang}` → sprite
    this.canvas = document.createElement("canvas");
    this.canvas.className = "globe-canvas";
    this._size = [0, 0];
    this._drag = null;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    } catch {
      return; // no WebGL: the country chips still work
    }
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    this.scene.add(new THREE.HemisphereLight("#ffffff", "#9fb4e8", 1.9));
    const sun = new THREE.DirectionalLight("#fff4dc", 1.6);
    sun.position.set(-2, 3, 4);
    this.scene.add(sun);

    this.globe = new THREE.Group();
    this.scene.add(this.globe);
    this._buildPlanet();
    this._buildPins();
    this._bindPointer();
    this.ok = true;
  }

  _buildPlanet() {
    // Ocean + soft atmosphere rim.
    this.ocean = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 32), new THREE.MeshLambertMaterial({ color: "#6ec1f5" }));
    this.globe.add(this.ocean);
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.12, 48, 32),
      new THREE.MeshBasicMaterial({ color: "#cdeaff", transparent: true, opacity: 0.28, side: THREE.BackSide })
    );
    this.scene.add(halo);

    // Land: flat discs, spaced evenly on the sphere (longitude step grows toward the poles).
    const step = 2;
    const spots = [];
    for (let lat = -88; lat <= 88; lat += step) {
      const lonStep = step / Math.max(0.22, Math.cos(lat * DEG));
      for (let lon = -180; lon < 180; lon += lonStep) if (isLand(lat, lon)) spots.push([lat, lon]);
    }
    const dot = new THREE.CylinderGeometry(0.0115, 0.0115, 0.02, 7);
    const mat = new THREE.MeshLambertMaterial({ color: "#9be3a8" });
    const land = new THREE.InstancedMesh(dot, mat, spots.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const p = new THREE.Vector3();
    spots.forEach(([lat, lon], i) => {
      latLonToVec(lat, lon, R * 0.995, p);
      q.setFromUnitVectors(up, p.clone().normalize());
      m.compose(p, q, new THREE.Vector3(1, 1, 1));
      land.setMatrixAt(i, m);
      land.setColorAt(i, new THREE.Color().setHSL(0.36 + ((lat * 7 + lon * 3) % 10) * 0.004, 0.55, 0.7 + ((lon * 5) % 7) * 0.006));
    });
    this.globe.add(land);
    this.land = land;
  }

  _buildPins() {
    this.pins = [];
    const up = new THREE.Vector3(0, 1, 0);
    this.countries.forEach((c, i) => {
      const dir = latLonToVec(c.lat, c.lon, 1).normalize();
      const g = new THREE.Group();
      g.position.copy(dir).multiplyScalar(R);
      g.quaternion.setFromUnitVectors(up, dir);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.07, 6), new THREE.MeshLambertMaterial({ color: "#ffffff" }));
      stem.position.y = 0.035;
      const ball = new THREE.Mesh(new THREE.SphereGeometry(PIN_BALL, 16, 12), new THREE.MeshLambertMaterial({ color: c.color, emissive: c.color, emissiveIntensity: 0.25 }));
      ball.position.y = 0.09;
      // Generous invisible hit area so fingers can tap it.
      const hit = new THREE.Mesh(new THREE.SphereGeometry(PIN_BALL * 1.9, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
      hit.position.y = 0.09;
      hit.userData.pin = c.id;
      g.add(stem, ball, hit);
      this.globe.add(g);
      this.pins.push({ id: c.id, group: g, ball, hit, phase: i * 0.9, country: c, scale: 1 });
    });
  }

  // ---------------------------------------------------------------- input

  _bindPointer() {
    const cv = this.canvas;
    cv.addEventListener("pointerdown", (e) => {
      cv.setPointerCapture(e.pointerId);
      this._drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: 0, type: e.pointerType };
      this.target = null;
      this.vel.yaw = this.vel.pitch = 0;
    });
    cv.addEventListener("pointermove", (e) => {
      const d = this._drag;
      if (!d || d.id !== e.pointerId) {
        if (e.pointerType === "mouse") this._setHover(this._pick(e.clientX, e.clientY));
        return;
      }
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      d.moved = Math.hypot(e.clientX - d.sx, e.clientY - d.sy);
      const k = 0.0095 * (this.dist / 4.0);
      this.yaw += dx * k;
      this.vel.yaw = dx * k * 60;
      if (d.type === "mouse") {
        this.pitch = Math.max(-1.1, Math.min(1.1, this.pitch + dy * k));
        this.vel.pitch = dy * k * 60;
      }
    });
    const end = (e) => {
      const d = this._drag;
      if (!d || d.id !== e.pointerId) return;
      this._drag = null;
      if (e.type === "pointerup" && d.moved < TAP_SLOP) {
        const id = this._pick(e.clientX, e.clientY);
        if (id) this.onPick?.(id);
      }
    };
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    cv.addEventListener("pointerleave", () => this._setHover(null));
  }

  _pick(cx, cy) {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return null;
    const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -(((cy - r.top) / r.height) * 2 - 1));
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    this.globe.updateMatrixWorld(true);
    const hits = ray.intersectObjects([this.ocean, ...this.pins.map((p) => p.hit)], false);
    const first = hits[0]?.object;
    return first?.userData.pin ?? null; // the ocean being first means the pin is on the far side
  }

  _setHover(id) {
    if (id === this.hovered) return;
    this.hovered = id;
    this.canvas.style.cursor = id ? "pointer" : "grab";
  }

  // ---------------------------------------------------------------- API

  /** Show the host element's canvas (re-attaches the same canvas after the menu re-renders). */
  mount(slot) {
    slot.appendChild(this.canvas);
  }

  /** Select a country: fly to it and show its label. null clears the selection. */
  select(id) {
    this.selected = id;
    const c = this.countries.find((x) => x.id === id);
    if (c) {
      this.target = facing(c.lat, c.lon);
      this.distTarget = 3.5;
    } else {
      this.target = null;
      this.distTarget = 4.0;
    }
  }

  // ---------------------------------------------------------------- frame

  _resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h || (w === this._size[0] && h === this._size[1])) return;
    this._size = [w, h];
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _labelFor(id) {
    const key = `${id}|${t({ en: "en", vi: "vi" })}`;
    let sp = this.labels.get(key);
    if (!sp) {
      const c = this.countries.find((x) => x.id === id);
      sp = pillLabel(`${c.flag} ${t(c.name)}`, c.color);
      sp.visible = false;
      this.globe.add(sp);
      this.labels.set(key, sp);
    }
    return sp;
  }

  update(dt, time) {
    if (!this.ok || !this.canvas.isConnected) return;
    this._resize();
    if (!this._size[0]) return;
    dt = Math.min(dt, 0.05);

    if (!this._drag) {
      if (this.target) {
        const k = 1 - Math.exp(-dt * 4.5);
        this.yaw += wrapAngle(this.target.yaw - this.yaw) * k;
        this.pitch += (this.target.pitch - this.pitch) * k;
      } else if (!this.selected) {
        this.yaw += dt * 0.22; // idle spin
        this.yaw += this.vel.yaw * dt;
        this.pitch += this.vel.pitch * dt;
        const decay = Math.exp(-dt * 3);
        this.vel.yaw *= decay;
        this.vel.pitch *= decay;
        this.pitch += (0.35 - this.pitch) * (1 - Math.exp(-dt * 0.8));
      } else {
        this.yaw += this.vel.yaw * dt;
        this.pitch += this.vel.pitch * dt;
        const decay = Math.exp(-dt * 3);
        this.vel.yaw *= decay;
        this.vel.pitch *= decay;
      }
    }
    this.globe.rotation.set(this.pitch, this.yaw, 0, "XYZ");
    this.dist += (this.distTarget - this.dist) * (1 - Math.exp(-dt * 4));
    this.camera.position.set(0, 0, this.dist);

    // Pins bob a little; the selected / hovered one is bigger and wears its label.
    const label = this.selected || this.hovered;
    for (const p of this.pins) {
      const on = p.id === this.selected;
      const goal = on ? 1.7 : p.id === this.hovered ? 1.4 : 1;
      p.scale += (goal - p.scale) * (1 - Math.exp(-dt * 10));
      const bob = 1 + 0.08 * Math.sin(time * 3 + p.phase);
      p.ball.scale.setScalar(p.scale * bob);
      p.ball.position.y = 0.09 + (p.scale - 1) * 0.03;
    }
    for (const sp of this.labels.values()) sp.visible = false;
    if (label) {
      const p = this.pins.find((x) => x.id === label);
      const sp = this._labelFor(label);
      sp.position.copy(p.group.position).normalize().multiplyScalar(R + 0.2);
      sp.visible = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.canvas.remove();
    this.renderer?.dispose();
  }
}
