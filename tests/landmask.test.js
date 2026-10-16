import test from "node:test";
import assert from "node:assert/strict";
import { isLand, LAND } from "../src/ui/landmask.js";
import { COUNTRIES } from "../content/countries.js";

test("land mask grid is 180x90", () => {
  assert.equal(LAND.w, 180);
  assert.equal(LAND.h, 90);
});

test("known places are land, open oceans are water", () => {
  assert.ok(isLand(52.5, 13.4), "Berlin");
  assert.ok(isLand(-25, 134), "central Australia");
  assert.ok(isLand(28.6, 77.2), "Delhi");
  assert.ok(isLand(39.5, -98), "Kansas");
  assert.ok(!isLand(0, -30), "mid-Atlantic");
  assert.ok(!isLand(0, -150), "mid-Pacific");
  assert.ok(!isLand(-40, 80), "southern Indian Ocean");
});

test("every country pin is on (or right beside) land", () => {
  for (const c of COUNTRIES) {
    const near = [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]].some(([dy, dx]) => isLand(c.lat + dy, c.lon + dx));
    assert.ok(near, c.id);
  }
});

test("country registry is sane", () => {
  const ids = new Set(COUNTRIES.map((c) => c.id));
  assert.equal(ids.size, COUNTRIES.length);
  for (const c of COUNTRIES) {
    assert.ok(c.lat >= -90 && c.lat <= 90 && c.lon >= -180 && c.lon <= 180, c.id);
    assert.ok(c.name.en && c.name.vi && c.flag, c.id);
  }
});
