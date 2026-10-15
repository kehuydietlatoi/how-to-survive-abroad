import test from "node:test";
import assert from "node:assert/strict";
import { PfandMachine, CheckoutRace } from "../src/minigames/shopLogic.js";

test("pfand: right decisions return the full deposit", () => {
  const m = new PfandMachine();
  while (!m.done) (m.current.pfand > 0 ? m.insert() : m.keep());
  const r = m.result();
  assert.equal(r.score, 100);
  assert.equal(r.total, r.max);
  assert.equal(r.total, 0.98);
});

test("pfand: non-deposit items are rejected and kept deposit is lost", () => {
  const m = new PfandMachine();
  const results = [];
  while (!m.done) results.push(m.current.id === "water" ? m.keep() : m.insert());
  const r = m.result();
  assert.ok(results.find((x) => x.item.id === "water").lost === 0.25);
  assert.ok(r.mistakes.includes("wine") && r.mistakes.includes("crushed") && r.mistakes.includes("water"));
  assert.equal(r.total, 0.73);
});

function race(policy) {
  const g = new CheckoutRace();
  for (let i = 0; i < 60 * 60 && !g.done; i++) {
    g.step(1 / 60);
    policy(g, i);
  }
  return g.result();
}

test("checkout: a quick, careful packer has no pile-ups", () => {
  const r = race((g) => {
    if (g.tray.length) g.place(g.tray[0].type === "fragile" ? "top" : "cart");
  });
  assert.equal(r.score, 100);
});

test("checkout: doing nothing piles everything up", () => {
  const r = race((g, i) => {
    // only clear the tray at the very end so the race can finish
    if (g.scanned >= g.list.length && !g.belt.length) while (g.tray.length) g.place("cart");
  });
  assert.ok(r.pileups >= 8, `pileups ${r.pileups}`);
  assert.ok(r.score <= 10);
});

test("checkout: fragile food in the bottom of the cart gets crushed", () => {
  const r = race((g) => g.tray.length && g.place("cart"));
  assert.equal(r.crushed, 6);
});
