import test from "node:test";
import assert from "node:assert/strict";
import { PhoMeal } from "../src/minigames/phoLogic.js";

const eatAll = (m) => {
  m.startEating();
  while (m.phase === "eat") (m.noodles ? m.biteNoodles() : m.sipBroth());
};

test("tasting first, seasoning lightly and finishing scores full marks", () => {
  const m = new PhoMeal();
  m.taste();
  m.add("lime");
  m.add("chili");
  m.add("herbs");
  eatAll(m);
  const r = m.result();
  assert.equal(r.passed, true);
  assert.equal(r.tastedFirst, true);
  assert.equal(r.balanced, true);
  assert.equal(r.score, 100);
});

test("adding before tasting and overdoing chili costs points and causes coughing", () => {
  const m = new PhoMeal();
  m.add("sauce");
  m.add("sauce");
  m.add("chili");
  m.add("chili");
  assert.equal(m.tooSpicy, true);
  eatAll(m);
  const r = m.result();
  assert.equal(r.tastedFirst, false);
  assert.ok(r.coughs > 0, "too spicy makes you cough");
  assert.ok(r.score < 60, `score ${r.score}`);
});

test("trà đá cools you down and condiments have a maximum", () => {
  const m = new PhoMeal();
  for (let i = 0; i < 3; i++) assert.equal(m.add("lime").ok, true);
  assert.deepEqual(m.add("lime"), { ok: false, reason: "max" });
  m.heat = 1.5;
  m.drinkTea();
  assert.equal(m.heat, 0);
});
