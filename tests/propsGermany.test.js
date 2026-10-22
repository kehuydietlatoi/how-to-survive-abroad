import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Assets.js reads Vite's import.meta.env at module level; give it the dev-server default.
registerHooks({
  load(url, context, nextLoad) {
    const res = nextLoad(url, context);
    if (!url.endsWith("/src/core/Assets.js")) return res;
    return { ...res, source: `import.meta.env ??= { BASE_URL: "/" };\n${res.source}` };
  },
});

// signBoard draws to a canvas; node has no DOM, so stub the 2D context.
const ctx = new Proxy({}, { get: () => () => {}, set: () => true });
globalThis.document ??= { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };

const { DE_PROPS } = await import("../src/world/propsGermany.js");

const NOT_SOLID = ["tramTrack", "bikeLaneMarking"];

test("DE_PROPS has enough vehicles, street objects and facades", () => {
  assert.ok(Object.keys(DE_PROPS).length >= 8);
  for (const n of ["altbauFacade", "halfTimberedHouse", "tram", "parcelVan", "binLorry", "germanTaxi", "germanCar", "bikeRack"]) {
    assert.ok(DE_PROPS[n], n);
  }
});

test("every DE_PROPS entry builds with defaults; solid ones have colliders", () => {
  for (const [name, fn] of Object.entries(DE_PROPS)) {
    const obj = fn();
    assert.ok(obj.isObject3D, name);
    if (!NOT_SOLID.includes(name)) {
      const c = obj.userData.collider;
      assert.ok(c && c.w > 0 && c.d > 0, `${name} collider`);
    }
  }
});

test("variant args build", () => {
  assert.ok(DE_PROPS.tram("5", "Markt", 2, "#0a7").userData.collider.d < DE_PROPS.tram("5", "Markt", 3).userData.collider.d);
  for (const shop of ["spaeti", "baeckerei", "apotheke", ""]) for (const f of [4, 5]) DE_PROPS.altbauFacade(f, shop, f);
  DE_PROPS.bikeRack(7);
  DE_PROPS.overheadWire(60);
  DE_PROPS.tramTrack(40);
  DE_PROPS.bikeLaneMarking(10);
  DE_PROPS.germanCar("#ff0000");
  DE_PROPS.cargoBike("#ffffff", "#000000");
});

test("animated props update without throwing", () => {
  for (const name of ["tram", "parcelVan", "binLorry", "germanCar"]) {
    const o = DE_PROPS[name]();
    o.userData.update(0.016, 1);
    o.position.z += 1;
    o.userData.update(0.016, 1.1);
  }
});
