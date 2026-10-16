import * as THREE from "three";
import { instance, preload, toon } from "../core/Assets.js";
import { CollisionWorld } from "../core/Collision.js";
import { PROPS, ground } from "./props.js";
import { WORLD_PROPS } from "./propsWorld.js";
import { Character } from "./Character.js";
import { t } from "../i18n/i18n.js";

// Builds a fixed map from a data description (see content/*/map.js).
//
// map = {
//   sky, fog: [near, far], grounds: [{ size:[w,d], p:[x,z], color }],
//   spawns: { name: [x, z, rotDeg] },
//   items: [
//     { model: "roads/road-straight", p:[x,z], r, s?, y?, tint?, collide? }
//     { prop: "ticketMachine", args?: [...], p, r, y?, collide? }
//     { npc: "character-female-a", p, r, anim? }
//     any item may have `id` to be looked up later (world.objects[id])
//   ],
//   walls: [[minX, minZ, maxX, maxZ, tag?]],
//   interactables: [{ id, p:[x,z], radius, label:{en,vi}, say?:{en,vi}, y? }]
// }

/** Camera-facing pill label (readable from the top-down camera). */
export function labelSprite(text, { bg = "#ffffff", fg = "#3b3355" } = {}) {
  const font = 64;
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  g.font = `bold ${font}px "Baloo 2", system-ui, sans-serif`;
  const w = Math.ceil(g.measureText(text).width) + 60;
  const h = font + 36;
  c.width = w;
  c.height = h;
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect(4, 4, w - 8, h - 8, h / 2 - 4);
  g.fill();
  g.lineWidth = 6;
  g.strokeStyle = "#3b335533";
  g.stroke();
  g.fillStyle = fg;
  g.font = `bold ${font}px "Baloo 2", system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  const scale = 0.55;
  sp.scale.set((w / h) * scale, scale, 1);
  sp.renderOrder = 10;
  return sp;
}

const ALL_PROPS = { ...PROPS, ...WORLD_PROPS };
const COLLIDE_KITS = new Set(["commercial", "suburban", "cars"]);

export class World {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.collision = new CollisionWorld();
    this.objects = {};
    this.npcs = [];
    this.interactables = [];
    this.wallBoxes = {};
    this.floors = []; // raised walkable slabs: { minX, maxX, minZ, maxZ, h }
    this.occluders = []; // { obj, box, opacity, mats }
    this._ray = new THREE.Ray();
    this._hit = new THREE.Vector3();
  }

  static modelIds(map) {
    const ids = map.items.filter((i) => i.model).map((i) => i.model);
    for (const i of map.items) if (i.npc) ids.push(`characters/${i.npc}`);
    return ids;
  }

  async build(map, onProgress) {
    await preload(World.modelIds(map), onProgress);
    for (const g of map.grounds || []) {
      const m = ground(g.size[0], g.size[1], g.color, g.y || 0);
      m.position.x = g.p[0];
      m.position.z = g.p[1];
      this.root.add(m);
    }
    for (const item of map.items) await this._place(item);
    for (const w of map.walls || []) {
      const b = this.collision.addBox(w[0], w[1], w[2], w[3], w[4]);
      if (w[4]) (this.wallBoxes[w[4]] ||= []).push(b);
    }
    for (const it of map.interactables || []) this._addInteractable(it);
  }

  async _place(item) {
    let obj;
    let collider = null;
    if (item.model) {
      ({ object: obj } = await instance(item.model, { scale: item.s, tint: item.tint }));
      const kit = item.model.split("/")[0];
      if (item.collide ?? COLLIDE_KITS.has(kit)) collider = "auto";
    } else if (item.prop) {
      obj = ALL_PROPS[item.prop](...(item.args || []));
      if (item.prop === "slab") {
        const [w, d, h] = item.args;
        const q = Math.round(((item.r || 0) % 180) / 90) !== 0;
        const hw = (q ? d : w) / 2;
        const hd = (q ? w : d) / 2;
        this.floors.push({ minX: item.p[0] - hw, maxX: item.p[0] + hw, minZ: item.p[1] - hd, maxZ: item.p[1] + hd, h: h + (item.y || 0) });
      }
      if (item.s) obj.scale.setScalar(item.s);
      if (obj.userData.collider && item.collide !== false) collider = obj.userData.collider;
    } else if (item.npc) {
      const c = await Character.create(item.npc);
      c.play(item.anim || "idle");
      if (item.helmet) c.addHelmet();
      c.mixer.setTime(Math.random() * 2);
      obj = c.root;
      this.npcs.push(c);
      if (item.collide !== false) collider = { w: 0.7, d: 0.7, ox: 0, oz: 0 };
      if (item.id) this.objects[item.id + ":char"] = c;
    } else {
      throw new Error(`bad map item ${JSON.stringify(item)}`);
    }
    obj.position.set(item.p[0], item.y || 0, item.p[1]);
    obj.rotation.y = THREE.MathUtils.degToRad(item.r || 0);
    this.root.add(obj);
    if (item.hidden) obj.visible = false;
    if (item.fade) {
      obj.updateMatrixWorld(true);
      // Expanded sideways so neighbours at the screen edge fade too.
      const box = new THREE.Box3().setFromObject(obj);
      this.occluders.push({ obj, box, opacity: 1, mats: null });
    }
    if (item.id) this.objects[item.id] = obj;

    if (collider === "auto") {
      obj.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(obj);
      const shrink = 0.05;
      obj.userData.box = this.collision.addBox(b.min.x + shrink, b.min.z + shrink, b.max.x - shrink, b.max.z - shrink, item.id);
    } else if (collider) {
      const quarter = Math.round(((item.r || 0) % 180) / 90) !== 0;
      const s = item.s || 1;
      const w = (quarter ? collider.d : collider.w) * s;
      const d = (quarter ? collider.w : collider.d) * s;
      const off = new THREE.Vector3(collider.ox, 0, collider.oz).applyAxisAngle(new THREE.Vector3(0, 1, 0), obj.rotation.y);
      obj.userData.box = this.collision.addRect(item.p[0] + off.x * s, item.p[1] + off.z * s, w, d, item.id);
    }
    return obj;
  }

  _addInteractable(it) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 32), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.55 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    g.add(ring);
    // Bouncing marker shown when this is the current objective.
    const marker = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 4), toon("#ffcc33", { emissive: "#7a5a00" }));
    cone.rotation.x = Math.PI;
    marker.add(cone);
    marker.position.y = (it.markerY ?? 3) + 0.3;
    marker.visible = false;
    g.add(marker);
    if (it.tag) {
      const tag = labelSprite(it.tag);
      tag.position.y = it.tagY ?? 2.9;
      g.add(tag);
      it.tagSprite = tag;
    }
    g.position.set(it.p[0], it.y || 0, it.p[1]);
    this.root.add(g);
    this.interactables.push({ ...it, radius: it.radius || 1.6, group: g, ring, marker, enabled: it.enabled !== false });
  }

  /** Height of the walkable surface at (x, z). */
  heightAt(x, z) {
    let h = 0;
    for (const f of this.floors) if (x >= f.minX && x <= f.maxX && z >= f.minZ && z <= f.maxZ && f.h > h) h = f.h;
    return h;
  }

  getInteractable(id) {
    return this.interactables.find((i) => i.id === id);
  }

  /** Nearest enabled interactable within its radius of (x, z). */
  nearest(x, z) {
    let best = null;
    let bestD = Infinity;
    for (const it of this.interactables) {
      if (!it.enabled) continue;
      const d = Math.hypot(it.p[0] - x, it.p[1] - z);
      if (d < it.radius && d < bestD) {
        best = it;
        bestD = d;
      }
    }
    return best;
  }

  setMarker(targetId) {
    for (const it of this.interactables) it.marker.visible = it.id === targetId;
  }

  setWalls(tag, enabled) {
    for (const b of this.wallBoxes[tag] || []) b.enabled = enabled;
  }

  /** Fade objects that sit between the camera and the player (cutaway view). */
  updateOccluders(dt, camera, target) {
    // Floating labels only for things nearby (they draw on top of walls).
    for (const it of this.interactables) {
      if (it.tagSprite) it.tagSprite.visible = it.enabled && Math.hypot(it.p[0] - target.x, it.p[1] - target.z) < 16;
    }
    if (!this.occluders.length) return;
    const from = camera.position;
    const dir = this._hit.copy(target).sub(from);
    const dist = dir.length();
    this._ray.set(from, dir.normalize());
    const p = new THREE.Vector3();
    for (const o of this.occluders) {
      // Anything marked "fade" that stands between the player and the camera (in z) and is
      // roughly on screen gets faded, plus whatever the direct sight line hits.
      const hit = this._ray.intersectBox(o.box, p);
      const between = (o.box.min.z + o.box.max.z) / 2 > target.z + 1 && o.box.min.z < from.z && o.box.min.x < target.x + 16 && o.box.max.x > target.x - 16;
      const blocking = between || (hit && from.distanceTo(p) < dist - 0.5);
      const goal = blocking ? 0 : 1;
      if (Math.abs(o.opacity - goal) < 0.01) continue;
      if (!o.mats) {
        o.mats = [];
        o.obj.traverse((m) => {
          if (!m.isMesh) return;
          m.material = m.material.clone();
          o.mats.push(m.material);
        });
      }
      o.opacity += (goal - o.opacity) * Math.min(1, dt * 8);
      for (const m of o.mats) {
        m.transparent = o.opacity < 0.99;
        m.opacity = o.opacity;
        m.depthWrite = o.opacity > 0.9;
      }
      o.obj.traverse((m) => m.isMesh && (m.castShadow = o.opacity > 0.5));
      o.obj.visible = o.opacity > 0.04; // fully hidden cutaway once faded out
      if (goal === 0 && o.opacity < 0.05) o.opacity = 0;
      if (goal === 1 && o.opacity > 0.98) o.opacity = 1;
    }
  }

  update(dt, time) {
    for (const n of this.npcs) n.update(dt);
    for (const it of this.interactables) {
      it.ring.visible = it.enabled;
      it.ring.material.opacity = 0.35 + 0.25 * Math.sin(time * 3);
      if (it.marker.visible) {
        it.marker.position.y = (it.markerY ?? 3) + 0.3 + Math.sin(time * 4) * 0.15;
        it.marker.rotation.y = time * 2;
      }
    }
  }

  label(it) {
    return t(it.label);
  }

  dispose() {
    // Geometries/materials are shared through caches, so only detach the tree.
    this.scene.remove(this.root);
  }
}
