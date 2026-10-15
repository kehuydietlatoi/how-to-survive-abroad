import test from "node:test";
import assert from "node:assert/strict";
import { validateScenario, ScenarioRunner, isAcceptable } from "../src/scenario/ScenarioRunner.js";
import vnMap from "../content/vietnam/cross-street-pho/map.js";
import vnScenario from "../content/vietnam/cross-street-pho/scenario.js";
import deMap from "../content/germany/airport-to-home/map.js";
import deScenario from "../content/germany/airport-to-home/scenario.js";

const all = [
  ["vietnam", vnMap, vnScenario],
  ["germany", deMap, deScenario],
];

// Every bilingual text object must have both languages.
function findMissing(node, path, out) {
  if (Array.isArray(node)) node.forEach((n, i) => findMissing(n, `${path}[${i}]`, out));
  else if (node && typeof node === "object") {
    if ("en" in node || "vi" in node) {
      if (!node.en || !node.vi) out.push(path);
      return;
    }
    for (const [k, v] of Object.entries(node)) findMissing(v, `${path}.${k}`, out);
  }
}

for (const [name, map, scenario] of all) {
  test(`${name}: scenario graph is valid`, () => {
    assert.deepEqual(validateScenario(scenario), []);
  });

  test(`${name}: all text exists in English and Vietnamese`, () => {
    const missing = [];
    findMissing(scenario, "scenario", missing);
    findMissing(map.interactables, "interactables", missing);
    assert.deepEqual(missing, []);
  });

  test(`${name}: sandbox targets, wrong targets and spawns exist in the map`, () => {
    const ids = new Set(map.interactables.map((i) => i.id));
    for (const s of scenario.steps) {
      if (s.type === "sandbox") {
        assert.ok(ids.has(s.target), `${s.id} target ${s.target}`);
        for (const w of Object.keys(s.wrong || {})) assert.ok(ids.has(w), `${s.id} wrong ${w}`);
      }
      if (s.spawn) assert.ok(map.spawns[s.spawn], `${s.id} spawn ${s.spawn}`);
      for (const a of [...(s.onEnter || []), ...(s.during || [])]) if (a.spawn) assert.ok(map.spawns[a.spawn], `${s.id} action spawn ${a.spawn}`);
    }
  });
}

// Drive the German scenario: mistakes are retried, so every route reaches a clean inspection.
test("germany: the full route reaches the inspection and home", () => {
  const r = new ScenarioRunner(deScenario);
  r.acknowledge(); // intro
  r.interact("ticketMachine");
  r.finishMinigame({ score: 80, passed: true, flags: { hasTicket: true, ticketValid: true } });
  assert.throws(() => r.choose(1), /not acceptable/, "boarding unstamped must be retried");
  r.choose(0, 1);
  r.interact("validator");
  assert.equal(r.flags.stamped, true);
  assert.equal(r.interact("train2Door").done, false, "wrong direction is refused");
  r.interact("train1Door");
  r.acknowledge(); // ride
  r.choose(0, 1); // pretended to sleep first, then showed the ticket
  assert.equal(r.current().id, "checkOk");
});

test("every choice step offers at least one acceptable answer", () => {
  for (const sc of [vnScenario, deScenario])
    for (const s of sc.steps.filter((x) => x.type === "choice")) assert.ok(s.options.some(isAcceptable), s.id);
});
