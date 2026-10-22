import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { PathFollower, Wanderer, TrafficLane } from '../src/world/lifeLogic.js';

test('looping pedestrians follow the closing segment back to the start', () => {
  const walker = new PathFollower([[0, 0], [2, 0], [2, 2]], { speed: 1, pause: [0, 0] });
  walker.step(3);
  assert.equal(walker.x, 2);
  assert.equal(walker.z, 1);
  walker.step(1 + Math.sqrt(8));
  assert.ok(Math.hypot(walker.x, walker.z) < 1e-8);
  walker.step(1);
  assert.ok(Math.abs(walker.x - 1) < 1e-8);
});

test('pingpong pedestrians reverse at both ends and spend time idling at waypoints', () => {
  const walker = new PathFollower([[0, 0], [2, 0]], { speed: 1, loop: 'pingpong', pause: [1, 1] });
  walker.step(2);
  assert.equal(walker.x, 2);
  assert.equal(walker.moving, false);
  walker.step(0.5);
  assert.equal(walker.x, 2);
  walker.step(1.5);
  assert.equal(walker.x, 1);
  walker.step(3);
  assert.equal(walker.x, 1);
  assert.equal(walker.moving, true);
});

test('pedestrians wait before the player and resume after the player leaves', () => {
  const walker = new PathFollower([[0, 0], [10, 0]], { speed: 2, pause: [0, 0] });
  walker.step(2, { x: 3, z: 0 });
  assert.ok(Math.abs(walker.x - 1.95) < 1e-8);
  walker.step(1, { x: 3, z: 0 });
  assert.equal(walker.moving, false);
  walker.step(1, { x: 3, z: 3 });
  assert.ok(Math.abs(walker.x - 3.95) < 1e-8);
});

test('wanderers stay in their area across many randomly chosen destinations', () => {
  const walker = new Wanderer([-2, -3, 4, 5], { random: () => 0.5, speed: 2, pause: [0, 0] });
  const positions = new Set();
  for (let i = 0; i < 1000; i++) {
    walker.step(0.1);
    assert.ok(walker.x >= -2 && walker.x <= 4 && walker.z >= -3 && walker.z <= 5);
    positions.add(`${walker.x.toFixed(2)},${walker.z.toFixed(2)}`);
  }
  assert.ok(positions.size > 10);
});

test('vehicles maintain spacing while an exactly full lane moves as a convoy', () => {
  const lane = new TrafficLane({ from: [0, 0], to: [20, 0], count: 2, spacing: 10, speed: [2, 2] });
  lane.step(1);
  assert.ok(Math.abs(lane.vehicles[0].x - 2) < 1e-8);
  assert.ok(Math.abs(lane.vehicles[1].x - 12) < 1e-8);
});

test('faster vehicles keep their distance from slower leaders, including across wrap', () => {
  let i = 0;
  const lane = new TrafficLane({ from: [0, 0], to: [20, 0], count: 2, spacing: 6, speed: [2, 4] }, () => i++ === 0 ? 1 : 0);
  for (let frame = 0; frame < 1000; frame++) {
    lane.step(0.1);
    const gap = (lane.vehicles[1].distance - lane.vehicles[0].distance + 20) % 20;
    assert.ok(gap >= 6 - 1e-8 && gap <= 14 + 1e-8, `gap ${gap}`);
  }
});

test('traffic yields three metres before a player, queues safely, and resumes', () => {
  const lane = new TrafficLane({ from: [0, 0], to: [40, 0], count: 4, spacing: 6, speed: [5, 5] });
  const start = lane.vehicles[0].x;
  for (let frame = 0; frame < 300; frame++) lane.step(0.1, { x: 13, z: 0 });
  assert.ok(lane.vehicles.every(v => v.x <= 10 + 1e-8 || v.x >= 13));
  assert.ok(lane.vehicles[0].x > start);
  for (let i = 0; i < 4; i++) {
    const gap = (lane.vehicles[(i + 1) % 4].distance - lane.vehicles[i].distance + 40) % 40;
    assert.ok(gap >= 6 - 1e-8);
  }
  const stopped = lane.vehicles[0].x;
  lane.step(1, { x: 13, z: 4 });
  assert.ok(lane.vehicles[0].x > stopped);
});

test('vehicles wrap and yield to a player just beyond the wrap point', () => {
  const lane = new TrafficLane({ from: [0, 0], to: [20, 0], count: 1, speed: [2, 2] });
  lane.step(9);
  assert.ok(Math.abs(lane.vehicles[0].x - 18) < 1e-8);
  lane.step(2, { x: 1, z: 0 });
  assert.ok(Math.abs(lane.vehicles[0].x - 18) < 1e-8);
  lane.step(2);
  assert.ok(Math.abs(lane.vehicles[0].x - 2) < 1e-8);
});

test('long vehicles yield three metres before their front bumper reaches the player', () => {
  const lane = new TrafficLane({ from: [0, 0], to: [40, 0], count: 1, speed: [5, 5] });
  lane.vehicles[0].front = 4;
  for (let i = 0; i < 100; i++) lane.step(0.1, { x: 10, z: 0 });
  assert.ok(lane.vehicles[0].x <= 3 + 1e-8);
  assert.ok(lane.vehicles[0].x > 2.9);
});

test('World ticks placed animated props once per frame with dt and time', async () => {
  const hook = registerHooks({
    load(url, context, nextLoad) {
      const result = nextLoad(url, context);
      return url.endsWith('/src/core/Assets.js')
        ? { ...result, source: `import.meta.env ??= { BASE_URL: '/' };\n${result.source}` }
        : result;
    },
  });
  try {
    const { Scene } = await import('three');
    const { World } = await import('../src/world/World.js');
    const world = new World(new Scene());
    await world.build({ items: [{ id: 'flag', prop: 'slab', args: [1, 1, 0.1, '#ffffff'], p: [0, 0] }] });
    const calls = [];
    world.objects.flag.userData.update = (dt, time) => calls.push([dt, time]);
    world.update(0.016, 10);
    world.update(0.02, 10.02);
    assert.deepEqual(calls, [[0.016, 10], [0.02, 10.02]]);
    world.dispose();
  } finally {
    hook.deregister();
  }
});
