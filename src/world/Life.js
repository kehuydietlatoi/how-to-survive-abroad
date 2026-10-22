import { Character } from './Character.js';
import { Box3 } from 'three';
import { PathFollower, Wanderer, TrafficLane } from './lifeLogic.js';

const CROWD_MODELS = ['character-male-f', 'character-female-a', 'character-female-d'];

/** Rendering adapter; all movement and yielding decisions live in lifeLogic.js. */
export class Life {
  constructor(world) {
    this.world = world;
    this.walkers = [];
    this.lanes = [];
  }

  static modelIds(map) {
    const ids = [];
    if (map.crowd?.count) for (const npc of map.crowd.npcs || CROWD_MODELS) ids.push(`characters/${npc}`);
    for (const lane of map.traffic || []) for (const vehicle of lane.vehicles || []) if (vehicle.model) ids.push(vehicle.model);
    return ids;
  }

  addPedestrian(character, options, motion = new PathFollower(options.path, options)) {
    this.walkers.push({ character, motion, y: options.y || 0 });
    character.position.set(motion.x, this.world.heightAt(motion.x, motion.z) + (options.y || 0), motion.z);
    character.root.rotation.y = motion.heading;
    character.play('idle');
  }

  async build(map) {
    if (map.crowd) {
      const { count, area, npcs = CROWD_MODELS } = map.crowd;
      if (!Number.isInteger(count) || count < 0 || !npcs.length) throw new Error('Crowd needs a nonnegative count and NPC models');
      for (let i = 0; i < count; i++) {
        const motion = new Wanderer(area, { speed: 0.85 + Math.random() * 0.45 });
        const character = await Character.acquire(npcs[i % npcs.length]);
        character.mixer.setTime(Math.random() * 2);
        this.world.npcs.push(character);
        this.world.root.add(character.root);
        this.addPedestrian(character, {}, motion);
      }
    }
    for (const definition of map.traffic || []) {
      if (!definition.vehicles?.length) throw new Error('Traffic lane needs vehicle definitions');
      const motion = new TrafficLane(definition);
      const objects = [];
      for (let i = 0; i < motion.vehicles.length; i++) {
        const vehicle = definition.vehicles[i % definition.vehicles.length];
        const obj = await this.world._place({ ...vehicle, p: definition.from, collide: false });
        const box = new Box3().setFromObject(obj);
        motion.vehicles[i].front = Math.max(0, box.max.z - obj.position.z);
        motion.vehicles[i].halfWidth = Math.max(box.max.x - obj.position.x, obj.position.x - box.min.x);
        objects.push(obj);
      }
      this.lanes.push({ motion, objects });
    }
    this.update(0);
  }

  update(dt) {
    const player = this.world.player?.position;
    for (const { character, motion, y } of this.walkers) {
      motion.step(dt, player);
      character.position.set(motion.x, this.world.heightAt(motion.x, motion.z) + y, motion.z);
      character.root.rotation.y = motion.heading;
      character.play(motion.moving ? 'walk' : 'idle');
    }
    for (const { motion, objects } of this.lanes) {
      motion.step(dt, player);
      for (let i = 0; i < objects.length; i++) {
        const vehicle = motion.vehicles[i];
        const obj = objects[i];
        obj.position.x = vehicle.x;
        obj.position.z = vehicle.z;
        obj.rotation.y = vehicle.heading;
      }
    }
  }

  dispose() {
    for (const { character } of this.walkers) Character.release(character);
    this.walkers.length = 0;
    this.lanes.length = 0;
  }
}
