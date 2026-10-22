import test from 'node:test';
import assert from 'node:assert/strict';
import { ScenarioRunner } from '../src/scenario/ScenarioRunner.js';
import trash from '../content/germany/trash/scenario.js';
import anmeldung from '../content/germany/anmeldung/scenario.js';

// ui.js reads the browser query string when loaded.
globalThis.location = { search: '' };
globalThis.matchMedia = () => ({ matches: false });
globalThis.document = { body: { classList: { toggle() {} } } };
const { SortGame, isRightZone } = await import('../src/minigames/SortGame.js');
delete globalThis.location;
delete globalThis.matchMedia;
delete globalThis.document;

// DOM and animation time are system boundaries; scoring and scenario logic run unchanged.
function element() {
  const classes = new Set();
  return {
    style: {}, dataset: {}, innerHTML: '', textContent: '',
    classList: {
      add: (...names) => names.forEach(n => classes.add(n)),
      remove: (...names) => names.forEach(n => classes.delete(n)),
      contains: name => classes.has(name),
    },
    addEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
  };
}

async function sort(t, params, mistakeAt = -1) {
  const nodes = Object.fromEntries(['.sort-card', '.sort-explain', '.sort-count', '.sort-streak', '.sort-stage']
    .map(selector => [selector, element()]));
  const zones = params.zones.map(z => Object.assign(element(), { dataset: { z: z.id } }));
  const explanationButton = element();
  const continueButton = element();
  nodes['.sort-explain'].querySelector = () => explanationButton;
  nodes['.sort-stage'].querySelector = () => continueButton;
  const root = Object.assign(element(), {
    querySelector: selector => nodes[selector],
    querySelectorAll: () => zones,
  });
  const timers = [];
  t.mock.method(globalThis, 'setTimeout', callback => { timers.push(callback); });
  const flush = async () => {
    while (timers.length) timers.shift()();
    await Promise.resolve();
  };
  const originals = new Map();
  for (const [key, value] of Object.entries({
    document: { getElementById: () => root, body: element() },
    window: {}, addEventListener() {}, removeEventListener() {},
  })) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  }
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  const result = SortGame.run({ scene: {} }, { ...params, shuffle: false });
  for (const [index, item] of params.items.entries()) {
    const accepted = [].concat(item.zone);
    const zone = index === mistakeAt
      ? zones.find(z => !accepted.includes(z.dataset.z))
      : zones.find(z => z.dataset.z === accepted[0]);
    const dropped = zone.onclick();
    await flush();
    await dropped;
    if (index === mistakeAt) {
      const acknowledged = explanationButton.onclick();
      await flush();
      await acknowledged;
    }
  }
  const summary = nodes['.sort-stage'].innerHTML;
  continueButton.onclick();
  return { result: await result, summary };
}

for (const scenario of [trash, anmeldung]) {
  const step = scenario.steps.find(s => s.game === 'sort');
  test(`${scenario.id}: a perfect sort scores the maximum`, async t => {
    const { result } = await sort(t, step.params);
    assert.equal(result.score, 100);
    assert.equal(result.right, step.params.items.length);
    assert.deepEqual(result.mistakes, []);
    const runner = new ScenarioRunner({ ...scenario, steps: [step, { id: step.next, type: 'end' }] });
    runner.finishMinigame(result);
    assert.equal(runner.score, runner.maxScore);
    assert.equal(runner.stars(), 3);
  });

  test(`${scenario.id}: one wrong first answer loses only that item's credit and explains it`, async t => {
    const { result, summary } = await sort(t, step.params, 0);
    assert.equal(result.score, scenario === trash ? 93 : 89);
    assert.equal(result.right, step.params.items.length - 1);
    assert.deepEqual(result.mistakes, [step.params.items[0].id]);
    assert.ok(summary.includes(step.params.items[0].name.en));
    assert.ok(summary.includes('Score:'));
    assert.ok(summary.includes('Only first-try answers count'));
    const runner = new ScenarioRunner({ ...scenario, steps: [step, { id: step.next, type: 'end' }] });
    runner.finishMinigame(result);
    assert.equal(runner.score, scenario === trash ? 93 : 89);
    assert.equal(runner.maxScore, 100);
  });
}

test('every accepted zone is correct for a multi-zone item', () => {
  const item = { zone: ['paper', 'general'] };
  assert.equal(isRightZone(item, 'paper'), true);
  assert.equal(isRightZone(item, 'general'), true);
  assert.equal(isRightZone(item, 'glass'), false);
});
