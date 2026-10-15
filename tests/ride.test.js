import test from "node:test";
import assert from "node:assert/strict";
import { buildRoute, sampleRoute, RideSim, HANOI_ROUTE } from "../src/minigames/rideLogic.js";

const route = buildRoute(HANOI_ROUTE);

// A perfect passenger: reacts to whatever window is open.
function perfect(sim) {
  const inp = { lean: 0, brace: false, tuck: false };
  for (const e of sim.events) {
    if (sim.s < e.from || sim.s > e.to) continue;
    if (e.type === "lean") inp.lean = e.dir;
    if (e.type === "brace") inp.brace = true;
    if (e.type === "tuck") inp.tuck = true;
  }
  return inp;
}

function play(strategy) {
  const sim = new RideSim(route);
  while (!sim.done) sim.step(1 / 60, strategy(sim));
  return sim.result();
}

test("route has turns both ways plus brake and squeeze events", () => {
  const types = route.events.map((e) => e.type + (e.dir || ""));
  for (const t of ["lean1", "lean-1", "brace", "tuck"]) assert.ok(types.includes(t), t);
  const end = sampleRoute(route, route.length);
  assert.ok(Math.hypot(end.x, end.z) > 150, "the ride goes somewhere");
});

test("a perfect passenger scores 100 and keeps the driver comfortable", () => {
  const r = play(perfect);
  assert.equal(r.score, 100);
  assert.equal(r.comfort, 100);
  assert.equal(r.total, route.events.length);
});

test("doing nothing fails every action", () => {
  const r = play(() => ({}));
  assert.equal(r.score, 0);
  assert.equal(r.comfort, 0);
});

test("leaning against the turns is called out", () => {
  const r = play((sim) => ({ ...perfect(sim), lean: -perfect(sim).lean }));
  assert.equal(r.counterLean, route.events.filter((e) => e.type === "lean").length);
  assert.ok(r.score < 70);
});

test("reacting a bit late to a brake still counts, very late does not", () => {
  const late = (delay) => (sim) => {
    const inp = perfect(sim);
    const b = sim.events.find((e) => e.type === "brace" && sim.s >= e.from && sim.s <= e.to);
    if (b) inp.brace = sim.s >= b.from + delay * sim.T.speed;
    return inp;
  };
  assert.equal(play(late(0.25)).braceMistakes, 0);
  assert.ok(play(late(0.85)).braceMistakes > 0);
});
