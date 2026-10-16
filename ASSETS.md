# Assets

## 1. Free kits (in `public/assets/kits/`)

All by **Kenney** ([kenney.nl](https://kenney.nl)), license **CC0** (see `public/assets/kits/LICENSE-Kenney-CC0.txt`). Credit is optional but appreciated (shown on the menu).

| Folder | Kit | Used for |
| --- | --- | --- |
| `characters/` | [Mini Characters](https://kenney.nl/assets/mini-characters) | Player avatars, NPCs, motorbike riders (has idle/walk/sprint/sit/drive/emote animations) |
| `roads/` | [City Kit Roads](https://kenney.nl/assets/city-kit-roads) | Road tiles |
| `suburban/` | [City Kit Suburban](https://kenney.nl/assets/city-kit-suburban) | Houses, fences, trees in Lindenstraße |
| `cars/` | [Car Kit](https://kenney.nl/assets/car-kit) | Taxi, sedan |

Only the models the game uses are kept (≈ 4 MB). To use more, download the kit again and copy the `.glb` files plus the kit's `Textures/colormap.png` into the folder. Reference models as `"<folder>/<file name without .glb>"` in a map.

Kit scale (kit units → metres) is set per folder in `src/core/Assets.js` (`KIT_SCALE`).

## 2. Procedural props (`src/world/props.js`)

Everything country-specific is built from rounded boxes and cylinders in code, so gameplay never waits on art:
ticket machine, validator, H bus-stop sign, shelter, departure board, S-Bahn, city bus, train interior, info desk, motorbike, plastic stool, low table, phở bowl, phở stall, tube houses, overhead cables, lanterns, vendor cart…

Each prop has the size it would have in real life (metres, origin on the ground) and a collider. That makes them easy to swap for real models later.

## 3. Unified "cute" look

`toonify()` (in `Assets.js`) replaces every loaded material with a `MeshToonMaterial` using a soft 3-band gradient, and procedural props use the same `toon()` material. Together with pastel colours, soft shadows, the high ¾ follow camera, the cut-away fading of buildings near the camera and the rounded HTML UI, kit models and code props look like one world.

## 4. Upgrading props with Blender MCP (next step)

Blender is not installed on this machine yet. One-time setup:

1. Install **Blender 4.x** from blender.org.
2. Download `addon.py` from [ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp). In Blender, go to *Edit → Preferences → Add-ons → Install…*, enable **Blender MCP**, then in the 3D view sidebar (N) → *BlenderMCP* → **Connect to Claude**.
3. Install `uv` (`pip install uv` or see astral.sh/uv), then register the server with Claude Code:
   `claude mcp add blender -- uvx blender-mcp`
4. Restart Claude Code. Claude can then model props through Blender's Python API.

Workflow per prop (do one end to end before batching):
- Keep the procedural prop's footprint/height (e.g. ticket machine 1.0 × 0.6 × 1.9 m), origin at the base centre, front facing +Z.
- Low-poly (< 3k triangles), flat pastel colours or one small palette texture, bevelled edges for the soft toy look.
- Export **glTF binary** to `public/assets/custom/<name>.glb`, then point the map item at it, keeping the same position and collider.
- Check it in the running game next to the Kenney characters for scale and style.

Optional: Blender MCP can also call Hyper3D Rodin (text → 3D, needs an API key) for quick drafts. Characters should stay kit-based, because generated rigs and animations are much weaker than Kenney's.

## 5. Globe land data

The menu globe's land dots come from **Natural Earth** 110m land polygons (public domain, naturalearthdata.com), rasterised by `scripts/build-landmask.mjs` into `src/ui/landmask.js` (a 2° bitset). Regenerate with `node scripts/build-landmask.mjs ne_110m_land.geojson`.

## 6. More procedural props

`src/world/propsWorld.js` adds the props for the world scenarios (ticket gate, vending machine, grill table, rickshaw, cow, Thai temple & Buddha shrine, phone box, bar counter, diner booth, café table, bicycle, bakery, Sacré-Cœur, beach flags / lifeguard tower / umbrella…), built the same way as `props.js`.
