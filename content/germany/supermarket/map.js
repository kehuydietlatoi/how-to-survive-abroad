// A neighbourhood supermarket ("Frischmarkt", fictional). Outside (z > 2): pavement and the
// cart corral. Inside (z < 2): bottle-return machine, shelves, checkouts and packing shelf.

const items = [
  // outside
  { prop: "slab", args: [40, 12, 0.12, "#dcd6cc"], p: [0, 8] },
  { model: "roads/road-straight", p: [-10, 19] },
  { model: "roads/road-straight", p: [0, 19] },
  { model: "roads/road-straight", p: [10, 19] },
  { prop: "cartRow", args: [5], p: [-7, 5.2], r: 0, s: 1.5 },
  { prop: "signPost", args: [[{ text: "🛒 Einkaufswagen", size: 70 }], { height: 2.2, w: 2, h: 0.5, color: "#e63946", fg: "#fff" }], p: [-8.6, 7.2], collide: false },
  {
    prop: "signPost",
    args: [[{ text: "Mo–Sa 7–22 Uhr", size: 70 }, { text: "So geschlossen", size: 60 }], { height: 2.4, w: 2, h: 0.8, color: "#ffffff", fg: "#1f5fbf" }],
    p: [3.4, 3.2],
    collide: false,
  },
  { prop: "tree", p: [-15, 9] },
  { prop: "tree", p: [15, 9] },
  { npc: "character-female-b", p: [5, 8], r: 200, anim: "walk" },
  // the building shell
  { prop: "slab", args: [28, 18, 0.05, "#eef1f5"], p: [0, -7] },
  { prop: "wall", args: [12, 0.4, 4.5, "#e9ecef"], p: [-8, 2], fade: true },
  { prop: "wall", args: [12, 0.4, 4.5, "#e9ecef"], p: [8, 2], fade: true },
  { prop: "signBoard", args: [["FRISCHMARKT"], { w: 7, h: 1.1, color: "#e63946", fg: "#ffffff" }], p: [0, 2.25], y: 3.4, collide: false, fade: true },
  { prop: "wall", args: [28, 0.4, 4.5, "#e9ecef"], p: [0, -16] },
  { prop: "wall", args: [0.4, 18, 4.5, "#e9ecef"], p: [-14, -7] },
  { prop: "wall", args: [0.4, 18, 4.5, "#e9ecef"], p: [14, -7] },
  // inside: Pfand corner
  { prop: "wall", args: [3, 0.3, 2.6, "#d7dde6"], p: [-10, -2.6] },
  { prop: "pfandAutomat", p: [-10, -2.1], r: 0 },
  // shelves
  { prop: "shelf", args: [8, 1], p: [-6, -10], r: 90 },
  { prop: "shelf", args: [8, 7], p: [0, -10], r: 90 },
  { prop: "shelf", args: [8, 13], p: [6, -10], r: 90 },
  { prop: "signPost", args: [[{ text: "Obst & Gemüse", size: 60 }], { height: 3, w: 2.2, h: 0.5, color: "#2fa84f", fg: "#fff" }], p: [-3, -5.5], collide: false },
  // checkouts + packing shelf
  { prop: "checkoutCounter", p: [6, -2.2], r: 0 },
  { npc: "character-male-a", p: [7.4, -3.3], r: 0, id: "cashier" },
  { prop: "wall", args: [3.6, 0.8, 0.9, "#c9a27a"], p: [11.8, -0.4] },
  { prop: "signBoard", args: [["Packtisch"], { w: 1.4, h: 0.35, color: "#ffffff", fg: "#333" }], p: [11.8, -0.4], y: 0.95, collide: false },
  { npc: "character-female-e", p: [-6, -4.5], r: 30 },
  { npc: "character-male-c", p: [3.2, -12], r: 160 },
  { npc: "character-female-f", p: [5.2, -0.6], r: 180, id: "nextCustomer", hidden: true },
];

export default {
  sky: "#cfe8ff",
  fog: [45, 120],
  grounds: [{ size: [80, 60], p: [0, 0], color: "#c9cfc2" }],
  spawns: { start: [0, 9, 180] },
  items,
  walls: [
    [-20, 14, 20, 15], // road
    [-20, 2, -20.5, 15],
    [20, 2, 20.5, 15],
    [-20.5, 1.9, -14, 14],
    [14, 1.9, 20.5, 14],
  ],
  interactables: [
    { id: "carts", p: [-7, 7.4], radius: 1.8, tag: "Einkaufswagen 🛒", tagY: 2.2, label: { en: "Take a cart", vi: "Lấy xe đẩy" } },
    { id: "pfand", p: [-10, -1.1], radius: 1.6, tag: "Pfandautomat ♻", tagY: 2.9, label: { en: "Return your bottles", vi: "Trả vỏ chai" } },
    { id: "shelf", p: [-3, -7], radius: 2, tag: "Obst & Gemüse 🍎", tagY: 2.4, label: { en: "Grab your groceries", vi: "Lấy đồ cần mua" } },
    { id: "checkout", p: [5.2, -0.8], radius: 1.8, tag: "Kasse 1", tagY: 2.6, label: { en: "Queue at the checkout", vi: "Xếp hàng thanh toán" } },
  ],
};
