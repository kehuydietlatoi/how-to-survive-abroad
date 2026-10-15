import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";

// Kenney kit models live in public/assets/kits/<kit>/<name>.glb.
// A model id is "<kit>/<name>", e.g. "roads/road-straight".

const BASE = `${import.meta.env.BASE_URL}assets/kits/`;

// Kit units → metres. Kenney kits use different base sizes.
export const KIT_SCALE = {
  characters: 2.6,
  roads: 10,
  commercial: 6,
  suburban: 6,
  cars: 1.25,
};

const loader = new GLTFLoader();
const cache = new Map(); // id -> Promise<gltf>

let gradientMap;
function toonGradient() {
  if (gradientMap) return gradientMap;
  // 3 soft bands give the "cute toy" look without hard black shadows.
  const data = new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]);
  gradientMap = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;
  return gradientMap;
}

/** Shared toon material for procedural props (cached per colour). */
const toonCache = new Map();
export function toon(color, opts = {}) {
  const key = `${color}|${opts.emissive || ""}|${opts.opacity ?? 1}|${opts.map ? opts.map.uuid : ""}`;
  if (toonCache.has(key)) return toonCache.get(key);
  const m = new THREE.MeshToonMaterial({
    color,
    gradientMap: toonGradient(),
    emissive: opts.emissive || 0x000000,
    transparent: (opts.opacity ?? 1) < 1,
    opacity: opts.opacity ?? 1,
    map: opts.map || null,
  });
  toonCache.set(key, m);
  return m;
}

const convCache = new Map();

/** Replace a loaded model's materials with toon materials (keeping texture + tint). */
export function toonify(root, tint) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const conv = (m) => {
      const key = `${m.uuid}|${tint || ""}`;
      if (convCache.has(key)) return convCache.get(key);
      const t = new THREE.MeshToonMaterial({
        map: m.map || null,
        color: m.color ? m.color.clone() : new THREE.Color(1, 1, 1),
        gradientMap: toonGradient(),
        transparent: m.transparent,
        opacity: m.opacity,
      });
      if (tint) t.color.multiply(new THREE.Color(tint));
      convCache.set(key, t);
      return t;
    };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
  return root;
}

export function loadModel(id) {
  if (!cache.has(id)) {
    cache.set(
      id,
      new Promise((resolve, reject) => loader.load(`${BASE}${id}.glb`, resolve, undefined, (e) => reject(new Error(`${id}: ${e.message || e}`))))
    );
  }
  return cache.get(id);
}

export async function preload(ids, onProgress) {
  const list = [...new Set(ids)];
  let done = 0;
  await Promise.all(
    list.map((id) =>
      loadModel(id).then(() => {
        done++;
        onProgress?.(done / list.length);
      })
    )
  );
}

/**
 * Instantiate a (pre)loaded model. Returns { object, animations }.
 * Scale defaults to the kit scale.
 */
export async function instance(id, { scale, tint } = {}) {
  const gltf = await loadModel(id);
  const kit = id.split("/")[0];
  const skinned = (gltf.animations || []).length > 0;
  const object = skinned ? cloneSkinned(gltf.scene) : gltf.scene.clone(true);
  toonify(object, tint);
  object.scale.setScalar(scale ?? KIT_SCALE[kit] ?? 1);
  return { object, animations: gltf.animations || [] };
}
