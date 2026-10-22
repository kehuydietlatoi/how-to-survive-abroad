import * as THREE from "three";
import { instance } from "../core/Assets.js";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";
import { grabHelmet } from "./props.js";

const templates = new Map();
const pools = new Map(); // model -> detached ambient characters, shared across worlds

/** A Kenney mini character with crossfaded animations. */
export class Character {
  static async create(model, opts = {}) {
    const key = JSON.stringify([model, opts.scale, opts.tint]);
    if (!templates.has(key)) {
      const template = instance(`characters/${model}`, opts).catch(error => {
        templates.delete(key);
        throw error;
      });
      templates.set(key, template);
    }
    const { object, animations } = await templates.get(key);
    // Skeletons and mixers are private; geometry, materials and clips are shared.
    return new Character(cloneSkinned(object), animations);
  }

  static async acquire(model) {
    const character = pools.get(model)?.pop() || await Character.create(model);
    character._poolModel = model;
    character.root.visible = true;
    character.play("idle");
    return character;
  }

  static release(character) {
    const model = character._poolModel;
    if (!model) return;
    character._poolModel = null;
    character.root.removeFromParent();
    character.mixer.stopAllAction();
    character.current = null;
    if (!pools.has(model)) pools.set(model, []);
    pools.get(model).push(character);
  }

  constructor(object, animations) {
    this.root = new THREE.Group();
    this.root.add(object);
    this.model = object;
    this.mixer = new THREE.AnimationMixer(object);
    this.actions = new Map(animations.map((clip) => [clip.name, this.mixer.clipAction(clip)]));
    this.current = null;
    this.play("idle");
  }

  play(name, { fade = 0.2, once = false, timeScale = 1 } = {}) {
    const next = this.actions.get(name);
    if (!next || next === this.current) {
      if (next) next.timeScale = timeScale;
      return;
    }
    next.reset();
    next.timeScale = timeScale;
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat);
    next.clampWhenFinished = once;
    next.play();
    if (this.current) this.current.crossFadeTo(next, fade, false);
    this.current = next;
  }

  /** Put a green Grab-style helmet on the head bone. */
  addHelmet() {
    const head = this.model.getObjectByName("head") || this.model.getObjectByName("Head");
    const helmet = grabHelmet();
    if (head) {
      const kit = this.model.scale.x || 1;
      helmet.scale.setScalar(0.5 / 0.36 / kit);
      helmet.position.set(0, 0.3, 0.01);
      head.add(helmet);
    } else {
      helmet.scale.setScalar(0.62 / 0.36);
      helmet.position.set(0, 1.55, 0);
      this.root.add(helmet);
    }
    return helmet;
  }

  update(dt) {
    this.mixer.update(dt);
  }

  get position() {
    return this.root.position;
  }
}
