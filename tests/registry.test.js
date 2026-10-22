import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Assets.js reads Vite's import.meta.env at module level, which node does not provide.
// Give it the dev-server default so the prop modules import without Vite or a DOM.
registerHooks({
  load(url, context, nextLoad) {
    const res = nextLoad(url, context);
    if (!url.endsWith("/src/core/Assets.js")) return res;
    return { ...res, source: `import.meta.env ??= { BASE_URL: "/" };\n${res.source}` };
  },
});

const { ALL_PROPS } = await import("../src/world/registry.js");
const { VN_PROPS } = await import("../src/world/propsVietnam.js");
const { DE_PROPS } = await import("../src/world/propsGermany.js");

// Every content/<country>/<scenario>/map.js, so new maps are covered automatically.
const root = fileURLToPath(new URL("../content/", import.meta.url));
const dirs = (dir) => readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const maps = [];
for (const country of dirs(root)) {
  for (const sc of dirs(join(root, country))) {
    const file = join(root, country, sc, "map.js");
    if (existsSync(file)) maps.push([`${country}/${sc}`, (await import(pathToFileURL(file))).default]);
  }
}

test("every content map is found", () => {
  assert.ok(maps.length >= 6, `only ${maps.length} maps found`);
});

test("country prop registries are merged into the world registry", () => {
  for (const [name, fn] of Object.entries({ ...VN_PROPS, ...DE_PROPS })) assert.equal(ALL_PROPS[name], fn, name);
  for (const [name, fn] of Object.entries(ALL_PROPS)) assert.equal(typeof fn, "function", name);
});

test("every prop used by a map exists in the registry", () => {
  for (const [id, map] of maps)
    for (const item of map.items) if (item.prop) assert.ok(ALL_PROPS[item.prop], `${id}: unknown prop "${item.prop}"`);
});
