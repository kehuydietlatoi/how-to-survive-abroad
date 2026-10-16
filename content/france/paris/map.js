// Paris, Montmartre: boulangerie and café on a cobbled street (start, x -36..36),
// and the stairs of Sacré-Cœur (x ≈ 100) for the finale.

const cream = ["#f1e4c8", "#ecd9b5", "#f6ecd6", "#e8d2a6", "#f2dfc0"];
const signs = ["Pharmacie", null, "Fromagerie", "Librairie", null, "Fleuriste", "Tabac", null, "Chocolatier", null];

const items = [];
items.push(
  { prop: "slab", args: [76, 14, 0.12, "#d3cabb"], p: [0, 1] },
  { prop: "slab", args: [76, 5, 0.04, "#8d8a85"], p: [0, 9.5] } // little road on the south side
);
for (let i = 0; i < 13; i++) {
  if (i === 2) continue; // the boulangerie takes this slot
  items.push({ prop: "shopFront", args: [cream[i % 5], 3, 5.4, signs[i % signs.length]], p: [-36 + i * 5.8, -9], fade: true });
}
items.push(
  { prop: "bakery", args: ["Boulangerie · Pâtisserie", "#f5deb3"], p: [-23.4, -8] },
  { prop: "tree", p: [-30, -3] },
  { prop: "tree", p: [32, -3] },
  { prop: "lamp", p: [-12, -2] },
  { prop: "lamp", p: [22, -2] },
  { prop: "plant", p: [2, -4.5] },
  // café terrace
  { prop: "shopFront", args: ["#a23b3b", 3, 8, "Café de la Butte"], p: [12.5, -9], fade: true },
  { prop: "cafeTable", args: ["#a23b3b"], p: [6, -0.4] },
  { prop: "cafeTable", args: ["#a23b3b"], p: [10, -0.4] },
  { prop: "cafeTable", args: ["#a23b3b"], p: [14, -0.4] },
  { prop: "cafeTable", args: ["#a23b3b"], p: [18, -0.4] },
  { npc: "character-female-c", p: [-23.4, -5.4], r: 0, id: "baker" },
  { npc: "character-male-d", p: [6.8, 0.2], r: 270, anim: "sit", y: 0.25, collide: false },
  { npc: "character-female-b", p: [14.8, -0.4], r: 270, anim: "sit", y: 0.25, collide: false },
  { npc: "character-male-a", p: [24, 1.2], r: 90, anim: "walk" },
  { npc: "character-female-e", p: [-8, 3], r: 270, anim: "walk" },
  { npc: "character-male-f", p: [34, 4], r: 180, id: "friend" }
);

// --- Sacré-Cœur steps (x ≈ 100): 14 shallow steps up to the terrace, basilica on top -------------
const S = 100;
items.push({ prop: "slab", args: [40, 26, 0.04, "#cfc7b6"], p: [S, 0] });
for (let i = 0; i < 14; i++) items.push({ prop: "slab", args: [10, 0.5, 0.2 * (i + 1), "#e9e3d4"], p: [S, 8 - i * 0.5] });
items.push(
  { prop: "slab", args: [16, 5, 2.8, "#f1ecdd"], p: [S, 1.5 - 5 + 0.5] },
  { prop: "sacreCoeur", p: [S, -8.4], collide: false },
  { prop: "lamp", p: [S - 6, 7] },
  { prop: "lamp", p: [S + 6, 7] },
  { prop: "tree", p: [S - 12, 3] },
  { prop: "tree", p: [S + 12, 3] },
  { npc: "character-male-e", p: [S - 4.5, 4], r: 180, anim: "idle" },
  { npc: "character-female-a", p: [S + 4.5, 3], r: 180, anim: "idle" },
  { npc: "character-male-b", p: [S + 8, 9.5], r: 270, anim: "idle" }
);

export default {
  sky: "#d9e8f7",
  fog: [50, 150],
  grounds: [
    { size: [90, 34], p: [0, 2], color: "#bdb4a3" },
    { size: [50, 36], p: [S, 0], color: "#b8b09f" },
  ],
  spawns: { start: [-31, 1.4, 90], steps: [S, 10.8, 180] },
  items,
  walls: [
    [-39, -9.5, 39, -9],
    [-39, 11.8, 39, 12.2],
    [-39.4, -9.5, -39, 12.2],
    [39, -9.5, 39.4, 12.2],
    [S - 20, -13, S + 20, -12.6],
    [S - 20, 12.6, S + 20, 13],
    [S - 20.4, -13, S - 20, 13],
    [S + 20, -13, S + 20.4, 13],
  ],
  interactables: [
    { id: "bakery", p: [-23.4, -3.6], radius: 2.2, tag: "Boulangerie 🥖", tagY: 4.4, label: { en: "Enter the boulangerie", vi: "Vào tiệm bánh mì" } },
    { id: "cafe", p: [10, 2.2], radius: 2.4, tag: "Café ☕", tagY: 3.2, label: { en: "Sit on the café terrace", vi: "Ngồi ở hiên quán cà phê" } },
    { id: "friend", p: [34, 2.4], radius: 2.0, tag: "Camille 👋", tagY: 2.7, label: { en: "Say hello to Camille", vi: "Chào Camille" } },
    { id: "view", p: [S, -1.6], radius: 2.6, tag: "Vue sur Paris 🌇", tagY: 4.4, label: { en: "Enjoy the view from the top", vi: "Ngắm cảnh từ trên cao" } },
  ],
};
