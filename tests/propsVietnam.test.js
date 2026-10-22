import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import * as THREE from "three";

registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    return url.endsWith("/src/core/Assets.js")
      ? { ...result, source: `import.meta.env ??= { BASE_URL: "/" };\n${result.source}` }
      : result;
  },
});
const { VN_PROPS } = await import("../src/world/propsVietnam.js");

const required = ["xichLo", "goodsBicycle", "quangGanh", "vendorCartWheeled", "loadedScooter", "hanoiBus", "hanoiTaxi",
  "oldQuarterHouse", "colonialFacade", "plantPots", "awning", "streetSign"];

test("Vietnam pack builds every registered prop with solid footprints, including seeded variants", () => {
  for (const name of required) assert.equal(typeof VN_PROPS[name], "function", name);
  for (const [name, build] of Object.entries(VN_PROPS)) {
    for (const args of [[], ["#417d62", 5]]) {
      const prop = build(...args);
      assert.ok(prop.isObject3D, name);
      const bounds = new THREE.Box3().setFromObject(prop);
      assert.ok(!bounds.isEmpty(), name);
      assert.ok([...bounds.min, ...bounds.max].every(Number.isFinite), name);
      const { w, d, ox, oz } = prop.userData.collider;
      assert.ok(w > 0 && d > 0 && Number.isFinite(ox) && Number.isFinite(oz), name);
      prop.userData.update?.(1 / 60, 2);
    }
  }
});

test("a cyclo carries the passenger in front of the pedalling rider", () => {
  const cyclo = VN_PROPS.xichLo();
  const passenger = cyclo.getObjectByName("passengerSeat");
  const rider = cyclo.getObjectByName("rider");
  assert.ok(passenger.position.z > rider.position.z);
  const wheel = cyclo.getObjectByName("wheel");
  cyclo.userData.update(0.25, 0.25);
  assert.notEqual(wheel.rotation.x, 0);
  assert.notEqual(cyclo.getObjectByName("pedals").rotation.x, 0);
});

test("quang ganh attaches to an NPC without adding a second vendor or collider", () => {
  const npc = new THREE.Group();
  const carried = VN_PROPS.quangGanh("#815478", 1, { carried: true });
  npc.add(carried);
  assert.ok(carried.getObjectByName("nonLa"));
  assert.equal(carried.userData.collider, undefined);
  assert.ok(carried.children.length < VN_PROPS.quangGanh().children.length);
});

test("cargo variants, bus destinations and facade laundry support street variation", () => {
  for (const load of ["flowers", "baskets", "goods"]) assert.equal(VN_PROPS.goodsBicycle("#417d62", load).userData.load, load);
  for (const load of ["boxes", "gas", "crates"]) assert.equal(VN_PROPS.loadedScooter("#417d62", load).userData.load, load);
  const bus = VN_PROPS.hanoiBus("#417d62", 3, "18", "Long Bien");
  assert.equal(bus.userData.route, "18");
  assert.equal(bus.userData.destination, "Long Bien");
  const house = VN_PROPS.oldQuarterHouse("#c5ad75", 3, "Cafe");
  const laundry = house.getObjectByName("laundry");
  house.userData.update(0.1, 1);
  const first = laundry.rotation.x;
  house.userData.update(0.1, 2);
  assert.notEqual(laundry.rotation.x, first);
  const a = new THREE.Box3().setFromObject(VN_PROPS.oldQuarterHouse("#c5ad75", 3));
  const b = new THREE.Box3().setFromObject(VN_PROPS.oldQuarterHouse("#c5ad75", 3));
  assert.deepEqual(a, b, "the same seeded index builds the same dimensions");
  assert.notDeepEqual(a, new THREE.Box3().setFromObject(VN_PROPS.oldQuarterHouse("#c5ad75", 4)));
});
