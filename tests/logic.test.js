import test from "node:test";
import assert from "node:assert/strict";
import { ScenarioRunner, validateScenario, isAcceptable } from "../src/scenario/ScenarioRunner.js";
import { CollisionWorld } from "../src/core/Collision.js";
import { simulate, STRATEGIES } from "../src/minigames/crossingSim.js";
import { t, setLang, getLang } from "../src/i18n/i18n.js";

const mini = {
  id: "mini",
  steps: [
    { id: "a", type: "info", text: "hi", next: "b" },
    { id: "b", type: "sandbox", target: "door", wrong: { window: { points: -5, feedback: "no" } }, next: "c" },
    {
      id: "c",
      type: "choice",
      options: [
        { text: "good", points: 10, correct: true, set: { ok: true }, tip: "tipGood" },
        { text: "meh", points: 5, set: { ok: false }, tip: "tipMeh" },
        { text: "bad", points: 0, tip: "tipBad" },
      ],
      next: "d",
    },
    { id: "d", type: "minigame", game: "x", nextIf: [{ flag: "ok", equals: false, next: "sad" }], next: "end" },
    { id: "sad", type: "info", text: "oops", next: "end" },
    { id: "end", type: "end" },
  ],
};

test("runner walks through all step types", () => {
  const r = new ScenarioRunner(mini);
  assert.equal(r.current().id, "a");
  r.acknowledge();
  assert.deepEqual(r.interact("nothing"), { done: false });
  const wrong = r.interact("window");
  assert.equal(wrong.done, false);
  assert.equal(r.score, -5);
  assert.equal(r.interact("door").done, true);
  r.choose(0);
  assert.equal(r.flags.ok, true);
  r.finishMinigame({ score: 80, passed: true });
  assert.equal(r.current().id, "end");
  assert.equal(r.finished, true);
  assert.equal(r.score, 85);
  assert.equal(r.maxScore, 110);
  assert.deepEqual(r.journal.map((j) => j.tip), ["tipGood"]);
});

test("runner branches on flags", () => {
  const r = new ScenarioRunner(mini);
  r.acknowledge();
  r.interact("door");
  r.choose(1); // acceptable (5 points) but sets ok = false
  r.finishMinigame({ score: 0, passed: false });
  assert.equal(r.current().id, "sad");
  assert.equal(r.journal[0].good, false);
});

test("wrong choices must be retried; the first pick decides score and journal", () => {
  const r = new ScenarioRunner(mini);
  r.acknowledge();
  r.interact("door");
  assert.equal(isAcceptable(mini.steps[2].options[2]), false);
  assert.throws(() => r.choose(2), /not acceptable/);
  r.choose(0, 2); // first picked "bad", then the correct one
  assert.equal(r.score, 0, "no points for a corrected wrong answer");
  assert.equal(r.flags.ok, true, "flags come from the final pick");
  assert.deepEqual(r.journal.at(-1), { tip: "tipBad", good: false });
});

test("validateScenario catches broken links", () => {
  assert.deepEqual(validateScenario(mini), []);
  const broken = { steps: [{ id: "a", type: "info", next: "zzz" }] };
  assert.ok(validateScenario(broken).length >= 2);
});

test("collision slides along boxes and never ends inside", () => {
  const w = new CollisionWorld();
  w.addRect(0, 0, 2, 2);
  let p = { x: -3, z: 0.2 };
  for (let i = 0; i < 100; i++) p = w.move(p.x, p.z, 0.1, 0.02, 0.3);
  assert.ok(!w.hits(p.x, p.z, 0.29));
  assert.ok(p.z > 1.2, "slid past the box along z");
});

test("street crossing rewards walking steadily", () => {
  const avg = (name) => {
    let s = 0;
    for (let seed = 1; seed <= 60; seed++) s += simulate(STRATEGIES[name], seed).score;
    return s / 60;
  };
  const steady = avg("steady");
  assert.ok(steady >= 90, `steady avg ${steady}`);
  for (const bad of ["sprint", "stopAndGo", "panicBack"]) {
    assert.ok(avg(bad) < steady - 8, `${bad} should score clearly lower than steady`);
  }
});

test("i18n translates keys and inline objects", () => {
  const prev = getLang();
  setLang("vi");
  assert.equal(t("play"), "Chơi");
  assert.equal(t({ en: "Hi {n}", vi: "Chào {n}" }, { n: "An" }), "Chào An");
  setLang("en");
  assert.equal(t("play"), "Play");
  setLang(prev);
});
