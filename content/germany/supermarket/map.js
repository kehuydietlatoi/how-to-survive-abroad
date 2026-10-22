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
  { prop: "wall", args: [6, 0.4, 1.2, "#e9ecef"], p: [-11, 2] }, // shopfront plinth, wide entrance x = -8..8
  { prop: "wall", args: [6, 0.4, 1.2, "#e9ecef"], p: [11, 2] },
  { prop: "signBoard", args: [["FRISCHMARKT"], { w: 7, h: 1.1, color: "#e63946", fg: "#ffffff" }], p: [0, 2.25], y: 4.5, collide: false },
  { prop: "wall", args: [28, 0.4, 4.5, "#e9ecef"], p: [0, -16] },
  // entrance: door mat, sliding-door frame, solid sign, and a green guide line to the Pfand corner
  { prop: "slab", args: [5, 2.2, 0.03, "#2b2f36"], p: [0, 3.2] },
  { prop: "wall", args: [0.25, 0.25, 3, "#9aa0ad"], p: [-2.5, 2], collide: false },
  { prop: "wall", args: [0.25, 0.25, 3, "#9aa0ad"], p: [2.5, 2], collide: false },
  { prop: "signBoard", args: [[{ text: "Eingang · Automatiktür", size: 70 }], { w: 4.4, h: 0.4, color: "#14306b", fg: "#ffffff" }], p: [0, 2.3], y: 3.0, collide: false },
  { prop: "slab", args: [6, 0.3, 0.03, "#2fa84f"], p: [-3, 0.4] },
  { prop: "signBoard", args: [[{ text: "♻ Pfand  ←", size: 80 }], { w: 1.8, h: 0.4, color: "#2fa84f", fg: "#ffffff" }], p: [-3, -0.4], y: 0.04, collide: false },
  // more shelves and a fruit stand
  { prop: "shelf", args: [6, 4], p: [-11, -10], r: 90 },
  { prop: "shelf", args: [6, 9], p: [11, -9], r: 90 },
  { prop: "wall", args: [2.4, 0.9, 0.9, "#d98c3a"], p: [-1.5, -4] },
  { prop: "signBoard", args: [["Äpfel 🍎 Birnen"], { w: 1.6, h: 0.35, color: "#ffffff", fg: "#c0392b" }], p: [-1.5, -4], y: 1.0, collide: false },
  // shoppers walking the aisles
  { npc: "character-female-a", path: [[-3, -13], [-3, -5], [-9, -5]], speed: 0.9, pause: [1, 3] },
  { npc: "character-male-b", path: [[3, -5], [3, -13]], speed: 1.0, pause: [1, 3] },
  { npc: "character-female-d", path: [[9, -13], [9, -5], [13, -5]], speed: 0.85, pause: [1, 3] },
  { npc: "character-male-f", path: [[-9, -13], [-9, -6], [-3, -4]], speed: 1.0, pause: [1, 3] },
  { npc: "character-female-c", path: [[12, 11], [-12, 11]], speed: 1.1, pause: [1, 3] },
  { prop: "bikeRack", args: [4], p: [13, 5.5] },
  { prop: "wall", args: [0.4, 18, 4.5, "#e9ecef"], p: [-14, -7] },
  { prop: "wall", args: [0.4, 18, 4.5, "#e9ecef"], p: [14, -7] },
  // inside: Pfand corner
  { prop: "wall", args: [3, 0.3, 2.6, "#d7dde6"], p: [-6, -2.6] },
  { prop: "pfandAutomat", p: [-6, -2.1], r: 0 },
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
    { id: "pfand", p: [-6, -1.1], radius: 1.6, tag: "Pfandautomat ♻", tagY: 2.9, label: { en: "Return your bottles", vi: "Trả vỏ chai" } },
    { id: "shelf", p: [-3, -7], radius: 2, tag: "Obst & Gemüse 🍎", tagY: 2.4, label: { en: "Grab your groceries", vi: "Lấy đồ cần mua" } },
    { id: "checkout", p: [5.2, -0.8], radius: 1.8, tag: "Kasse 1", tagY: 2.6, label: { en: "Queue at the checkout", vi: "Xếp hàng thanh toán" } },
  ],
};
