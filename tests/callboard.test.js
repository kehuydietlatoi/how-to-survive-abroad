import test from "node:test";
import assert from "node:assert/strict";
import { CallBoard, makeSchedule } from "../src/minigames/callBoardLogic.js";

const run = (policy) => {
  const b = new CallBoard(makeSchedule());
  for (let i = 0; i < 60 * 120 && !b.done; i++) {
    b.step(1 / 60);
    policy(b);
  }
  return b.result();
};

test("pressing right when your number appears scores 100", () => {
  const r = run((b) => b.current?.mine && b.mineShownAt != null && b.time - b.mineShownAt > 0.5 && b.press());
  assert.equal(r.score, 100);
  assert.equal(r.found, true);
});

test("falling for a look-alike number costs points", () => {
  let fooled = false;
  const r = run((b) => {
    if (!fooled && b.current?.num === "A-171") {
      fooled = true;
      b.press();
    }
    if (b.current?.mine && b.mineShownAt != null) b.press();
  });
  assert.equal(r.falsePresses, 1);
  assert.equal(r.score, 80);
});

test("missing your number brings a second call, with a penalty", () => {
  let seen = 0;
  const r = run((b) => {
    if (b.current?.mine && b.mineShownAt != null && b.time - b.mineShownAt < 0.02) seen++;
    if (seen >= 2 && b.current?.recall) b.press();
  });
  assert.equal(r.misses, 1);
  assert.equal(r.found, true);
  assert.equal(r.score, 70);
});
