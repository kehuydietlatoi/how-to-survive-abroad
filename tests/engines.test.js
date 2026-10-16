import test from "node:test";
import assert from "node:assert/strict";
import { SwipeLogic } from "../src/minigames/swipeLogic.js";
import { Haggle } from "../src/minigames/haggleLogic.js";
import { Grill } from "../src/minigames/grillLogic.js";
import { LaneGame, PLAYER_Y } from "../src/minigames/laneLogic.js";

// ---------------------------------------------------------------- swipe
const cards = [
  { id: "a", answer: "left" },
  { id: "b", answer: "right" },
  { id: "c", answer: "left" },
  { id: "d", answer: "right" },
];

test("swipe: perfect run scores 100 with a full streak", () => {
  const g = new SwipeLogic(cards, { seed: 3 });
  while (!g.done) g.answer(g.current.answer);
  const r = g.result();
  assert.equal(r.score, 100);
  assert.equal(r.best, 4);
});

test("swipe: wrong answers and timeouts are mistakes and break the streak", () => {
  const g = new SwipeLogic(cards, { seed: 3, secondsPerCard: 5 });
  g.answer(g.current.answer);
  g.answer(g.current.answer === "left" ? "right" : "left"); // wrong
  assert.equal(g.streak, 0);
  assert.equal(g.step(4.9), null);
  assert.equal(g.step(0.2).timedOut, true); // third card runs out
  g.answer(g.current.answer);
  const r = g.result();
  assert.equal(r.right, 2);
  assert.equal(r.mistakes.length, 2);
  assert.equal(r.score, 50);
});

test("swipe: the same seed gives the same order", () => {
  const order = (s) => new SwipeLogic(cards, { seed: s }).items.map((c) => c.id).join();
  assert.equal(order(7), order(7));
});

// ---------------------------------------------------------------- haggle
const deal = () => new Haggle({ start: 400, fair: [120, 180], floor: 130 });

test("haggle: paying the first price is a poor result", () => {
  const h = deal();
  h.accept();
  const r = h.result();
  assert.equal(h.final, 400);
  assert.ok(r.score <= 20, `score ${r.score}`);
});

test("haggle: offering the floor ends at a fair price with a top score", () => {
  const h = deal();
  assert.equal(h.offer(100).type, "counter"); // below floor, not insulting
  assert.equal(h.offer(140).type, "deal");
  const r = h.result();
  assert.equal(r.final, 140);
  assert.equal(r.score, 100);
  assert.equal(r.fairDeal, true);
});

test("haggle: insulting lowballs burn patience until the seller loses it", () => {
  const h = deal();
  assert.equal(h.offer(10).type, "insult");
  assert.equal(h.offer(10).type, "insult");
  assert.equal(h.offer(10).type, "angry");
  assert.equal(h.outcome, "angry");
  assert.equal(h.result().score, 40);
});

test("haggle: walking away is called back once, then really ends", () => {
  const h = deal();
  const a = h.walkAway();
  assert.equal(a.type, "callback");
  assert.ok(h.ask < 400);
  assert.equal(h.walkAway().type, "walk");
  assert.equal(h.result().score, 70);
});

test("haggle: the asking price falls but never below the floor", () => {
  const h = deal();
  for (let i = 0; i < 6 && !h.done; i++) h.offer(100);
  assert.ok(h.ask >= h.floor);
});

// ---------------------------------------------------------------- grill
test("grill: flipping on time serves golden pieces and pouring in the window scores", () => {
  const g = new Grill({ slots: 2, pieces: 2, cookTime: 4, events: [5], eventWindow: 4 });
  for (let t = 0; t < 4; t += 0.1) g.step(0.1);
  g.slots.forEach((_, i) => g.flip(i));
  for (let t = 0; t < 4; t += 0.1) g.step(0.1);
  assert.deepEqual(g.state(0), ["golden", "golden"]);
  g.serve(0);
  g.serve(1);
  assert.ok(g.pour(), "event is active by now");
  assert.equal(g.done, true);
  const r = g.result();
  assert.equal(r.perfect, 2);
  assert.equal(r.score, 100);
});

test("grill: leaving meat alone burns it, serving it raw counts as raw", () => {
  const g = new Grill({ slots: 2, pieces: 2, cookTime: 4, events: [] });
  g.step(0.5);
  g.flip(1);
  for (let t = 0; t < 8; t += 0.1) g.step(0.1);
  assert.equal(g.serve(0).quality, "burnt");
  const g2 = new Grill({ slots: 1, pieces: 1, cookTime: 4, events: [] });
  g2.step(1);
  assert.equal(g2.serve(0).quality, "raw");
});

test("grill: ignoring the boss's glass is a miss, pouring when nothing is asked is wasted", () => {
  const g = new Grill({ slots: 1, pieces: 1, cookTime: 4, events: [1], eventWindow: 2 });
  assert.equal(g.pour(), false);
  for (let t = 0; t < 3.5; t += 0.1) g.step(0.1);
  assert.equal(g.pours.missed, 1);
  assert.equal(g.pours.wasted, 1);
});

// ---------------------------------------------------------------- lane dodge
const lanes3 = [{ kind: "ok" }, { kind: "ok" }, { kind: "ok" }];
const baseLane = {
  lanes: lanes3,
  duration: 20,
  obstacles: [{ id: "pigeon", icon: "🐦", speed: 0.5 }],
  pickups: [{ id: "coin", icon: "🪙", points: 1 }],
  action: { id: "bell", clears: ["pigeon"], cooldown: 1, range: 0.6 },
  seed: 5,
};

test("lane: standing still gets you hit; dodging each obstacle keeps all hearts", () => {
  const stay = new LaneGame({ ...baseLane, spawnEvery: [0.3, 0.4] });
  while (!stay.done) stay.step(1 / 30);
  assert.ok(stay.hits > 0);

  const dodge = new LaneGame({ ...baseLane, spawnEvery: [0.5, 0.9] });
  while (!dodge.done) {
    // Move to a lane with nothing coming in the next stretch.
    const danger = (l) => dodge.obstacles.some((o) => o.lane === l && o.y < PLAYER_Y + 0.07 && o.y > PLAYER_Y - 0.5);
    if (danger(dodge.lane)) {
      const free = [0, 1, 2].filter((l) => !danger(l));
      if (free.length) dodge.setLane(free.sort((a, b) => Math.abs(a - dodge.lane) - Math.abs(b - dodge.lane))[0]);
    }
    dodge.step(1 / 30);
  }
  assert.equal(dodge.hearts, 3);
  assert.equal(dodge.won, true);
  assert.ok(dodge.result().score >= 80);
});

test("lane: the action clears matching obstacles in front of you only", () => {
  const g = new LaneGame({ ...baseLane, obstacles: [{ id: "pigeon", speed: 0.5 }, { id: "scooter", speed: 0.5 }] });
  g.obstacles.push({ uid: 1, def: { id: "pigeon", speed: 0.5 }, lane: g.lane, y: PLAYER_Y - 0.3 });
  g.obstacles.push({ uid: 2, def: { id: "scooter", speed: 0.5 }, lane: g.lane, y: PLAYER_Y - 0.2 });
  g.obstacles.push({ uid: 3, def: { id: "pigeon", speed: 0.5 }, lane: (g.lane + 1) % 3, y: PLAYER_Y - 0.3 });
  g.act();
  assert.equal(g.cleared, 1);
  assert.equal(g.obstacles.length, 2);
  assert.equal(g.act(), false, "cooldown");
});

test("lane: a forbidden lane drains hearts until you leave it, and zero hearts fails", () => {
  const g = new LaneGame({
    ...baseLane,
    lanes: [{ kind: "forbidden", why: "x" }, { kind: "ok" }],
    startLane: 0,
    obstacles: [{ id: "far", speed: 0.01 }],
    drainEvery: 2,
    hearts: 3,
    duration: 60,
  });
  for (let t = 0; t < 4.1; t += 0.1) g.step(0.1);
  assert.equal(g.hearts, 1);
  g.setLane(1);
  for (let t = 0; t < 5; t += 0.1) g.step(0.1);
  assert.equal(g.hearts, 1);
  g.setLane(0);
  for (let t = 0; t < 3; t += 0.1) g.step(0.1);
  assert.equal(g.done, true);
  assert.equal(g.result().passed, false);
});
