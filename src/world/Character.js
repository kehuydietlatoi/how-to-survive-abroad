import * as THREE from "three";
import { instance } from "../core/Assets.js";
import { grabHelmet } from "./props.js";

/** A Kenney mini character with crossfaded animations. */
export class Character {
  static async create(model, opts = {}) {
    const { object, animations } = await instance(`characters/${model}`, opts);
    return new Character(object, animations);
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
