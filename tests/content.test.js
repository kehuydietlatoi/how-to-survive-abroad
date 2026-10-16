import test from "node:test";
import assert from "node:assert/strict";
import { validateScenario, ScenarioRunner, isAcceptable } from "../src/scenario/ScenarioRunner.js";
import vnMap from "../content/vietnam/cross-street-pho/map.js";
import vnScenario from "../content/vietnam/cross-street-pho/scenario.js";
import deMap from "../content/germany/airport-to-home/map.js";
import deScenario from "../content/germany/airport-to-home/scenario.js";
import grabMap from "../content/vietnam/grab-ride/map.js";
import grabScenario from "../content/vietnam/grab-ride/scenario.js";
import trashMap from "../content/germany/trash/map.js";
import trashScenario from "../content/germany/trash/scenario.js";
import anmMap from "../content/germany/anmeldung/map.js";
import anmScenario from "../content/germany/anmeldung/scenario.js";
import shopMap from "../content/germany/supermarket/map.js";
import shopScenario from "../content/germany/supermarket/scenario.js";
import jpMap from "../content/japan/rush-hour/map.js";
import jpScenario from "../content/japan/rush-hour/scenario.js";
import krMap from "../content/korea/bbq/map.js";
import krScenario from "../content/korea/bbq/scenario.js";
import thMap from "../content/thailand/temple/map.js";
import thScenario from "../content/thailand/temple/scenario.js";
import inMap from "../content/india/auto/map.js";
import inScenario from "../content/india/auto/scenario.js";
import usMap from "../content/usa/diner/map.js";
import usScenario from "../content/usa/diner/scenario.js";
import ukMap from "../content/uk/pub/map.js";
import ukScenario from "../content/uk/pub/scenario.js";
import frMap from "../content/france/paris/map.js";
import frScenario from "../content/france/paris/scenario.js";
import itMap from "../content/italy/coffee/map.js";
import itScenario from "../content/italy/coffee/scenario.js";
import nlMap from "../content/netherlands/bike/map.js";
import nlScenario from "../content/netherlands/bike/scenario.js";
import auMap from "../content/australia/beach/map.js";
import auScenario from "../content/australia/beach/scenario.js";
import { COUNTRIES } from "../content/countries.js";
import { readdirSync, statSync, readFileSync } from "node:fs";

const all = [
  ["vietnam", vnMap, vnScenario],
  ["germany", deMap, deScenario],
  ["grab ride", grabMap, grabScenario],
  ["trash", trashMap, trashScenario],
  ["anmeldung", anmMap, anmScenario],
  ["supermarket", shopMap, shopScenario],
  ["japan", jpMap, jpScenario],
  ["korea", krMap, krScenario],
  ["thailand", thMap, thScenario],
  ["india", inMap, inScenario],
  ["usa", usMap, usScenario],
  ["uk", ukMap, ukScenario],
  ["france", frMap, frScenario],
  ["italy", itMap, itScenario],
  ["netherlands", nlMap, nlScenario],
  ["australia", auMap, auScenario],
];

// Sort-game data: every item must point at an existing zone.
test("sort minigames reference existing zones", () => {
  for (const [, , sc] of all)
    for (const s of sc.steps.filter((x) => x.game === "sort")) {
      const zones = new Set(s.params.zones.map((z) => z.id));
      for (const it of s.params.items) for (const z of [].concat(it.zone)) assert.ok(zones.has(z), `${sc.id}: ${it.id} → ${z}`);
      for (const z of zones) assert.ok(s.params.items.some((it) => [].concat(it.zone).includes(z)), `zone ${z} unused`);
    }
});

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
  for (const [, , sc] of all)
    for (const s of sc.steps.filter((x) => x.type === "choice")) assert.ok(s.options.some(isAcceptable), s.id);
});

// Every content/<country>/ folder belongs to a country on the globe.
test("content folders match the country registry", () => {
  const ids = new Set(COUNTRIES.map((c) => c.id));
  for (const dir of readdirSync("content")) {
    if (!statSync(`content/${dir}`).isDirectory()) continue;
    assert.ok(ids.has(dir), `content/${dir} is not in COUNTRIES`);
  }
});

// Split the registry source into one text block per scenario entry.
function registryBlocks() {
  const src = readFileSync("content/index.js", "utf8");
  return src
    .split(/\n {2}\{\n {4}id: /)
    .slice(1)
    .map((b) => ({
      id: b.match(/^"([a-z-]+)"/)[1],
      country: b.match(/country: "([a-z]+)"/)[1],
      dir: b.match(/import\("\.\/([a-z]+\/[a-z-]+)\/map\.js"\)/)[1],
      minigames: [...(b.match(/minigames: \{([^}]*)\}/)?.[1] || "").matchAll(/(\w+):/g)].map((m) => m[1]),
    }));
}

test("registry entries point at existing files and use known countries", () => {
  const ids = new Set(COUNTRIES.map((c) => c.id));
  const blocks = registryBlocks();
  assert.equal(blocks.length, 16, "6 original + 10 new scenarios");
  const seen = new Set();
  for (const b of blocks) {
    assert.ok(!seen.has(b.id), `duplicate scenario id ${b.id}`);
    seen.add(b.id);
    assert.ok(ids.has(b.country), `${b.id}: unknown country ${b.country}`);
    assert.ok(b.id.startsWith(b.country), `${b.id} should start with ${b.country}`);
    assert.ok(statSync(`content/${b.dir}/map.js`).isFile() && statSync(`content/${b.dir}/scenario.js`).isFile(), b.dir);
  }
  // every country on the globe has at least one scenario
  for (const c of COUNTRIES) assert.ok(blocks.some((b) => b.country === c.id), `${c.id} has no scenario`);
});

const NEW = {
  "japan/rush-hour": jpScenario,
  "korea/bbq": krScenario,
  "thailand/temple": thScenario,
  "india/auto": inScenario,
  "usa/diner": usScenario,
  "uk/pub": ukScenario,
  "france/paris": frScenario,
  "italy/coffee": itScenario,
  "netherlands/bike": nlScenario,
  "australia/beach": auScenario,
};

// Every minigame a scenario step asks for must be provided by its registry entry.
test("minigame steps use minigames the registry provides", () => {
  const byDir = new Map(registryBlocks().map((b) => [b.dir, b.minigames]));
  for (const [dir, sc] of Object.entries(NEW)) {
    const provided = byDir.get(dir);
    assert.ok(provided, dir);
    for (const st of sc.steps.filter((x) => x.type === "minigame")) assert.ok(provided.includes(st.game), `${dir}: ${st.id} needs "${st.game}"`);
  }
});

// A perfect run through every new scenario reaches the end, so no branch is a dead end.
test("new scenarios can be played through to the end", () => {
  for (const sc of Object.values(NEW)) {
    const r = new ScenarioRunner(sc);
    let guard = 0;
    while (!r.finished && guard++ < 200) {
      const st = r.current();
      if (st.type === "info" || st.type === "travel") r.acknowledge();
      else if (st.type === "sandbox") r.interact(st.target);
      else if (st.type === "choice") r.choose(Math.max(0, st.options.findIndex((o) => o.correct)));
      else if (st.type === "minigame") r.finishMinigame({ score: 90, passed: true });
      else throw new Error(`${sc.id}: unexpected ${st.type}`);
    }
    assert.ok(r.finished, `${sc.id} did not finish`);
    assert.ok(r.stars() >= 2, `${sc.id}: a perfect run should earn stars`);
  }
});

