// London: bus stop on a rainy street (start, x -40..40), the Tube gate and escalator (x ≈ 60) and a pub (x ≈ 120).
// Road runs along x at z 0..10; pavement and buildings are to the north (z < 0).

const brick = ["#b5654a", "#c7845f", "#9c5a45", "#d19a6b", "#a3523e", "#bf7a58"];
const signs = ["Chemist", null, "Newsagent", "Fish & Chips", null, "Charity Shop", "Tesco Express", null, "Bookshop", null];

const items = [];
for (let x = -40; x <= 40; x += 10) items.push({ model: "roads/road-straight", p: [x, 5] });
items.push({ prop: "slab", args: [86, 6, 0.16, "#cfcac0"], p: [0, -3] });
for (let i = 0; i < 14; i++) items.push({ prop: "shopFront", args: [brick[i % 6], 3, 5.6, signs[i % signs.length]], p: [-38 + i * 5.8, -10], fade: true });
items.push(
  { prop: "phoneBox", p: [-12, -5.2] },
  { prop: "phoneBox", p: [-10.8, -5.2] },
  { prop: "lamp", p: [-30, -0.6] },
  { prop: "lamp", p: [8, -0.6] },
  // bus stop with a queue, a big red double-decker waiting down the road
  { prop: "busShelter", p: [-24, -3.6], r: 0 },
  { prop: "signPost", args: [[{ text: "BUS STOP", size: 70 }, { text: "N29 · to Trafalgar Sq", size: 40, bold: false }], { height: 2.6, w: 1.5, h: 0.7, color: "#d6221f", fg: "#fff" }], p: [-20, -0.9], collide: false },
  { prop: "cityBus", args: ["N29", "Trafalgar Sq", "#d6221f"], p: [-4, 6.6], r: 90 },
  { npc: "character-male-a", p: [-26.2, -1.2], r: 90 },
  { npc: "character-female-b", p: [-27.4, -1.2], r: 90 },
  { npc: "character-male-c", p: [-28.6, -1.2], r: 90 },
  { npc: "character-female-e", p: [-14, -2], r: 270, anim: "walk" }
);
// a pub sign hanging outside (the real pub is further on)
items.push({ prop: "signBoard", args: [["The Crown & Whistle  🍺"], { w: 3.6, h: 0.7, color: "#2b2b2b", fg: "#ffd23f" }], p: [22, -6.8], y: 3.2, collide: false });

// --- Tube station (x ≈ 60) -----------------------------------------------------------
const T = 60;
items.push(
  { prop: "slab", args: [34, 20, 0.05, "#e9ecef"], p: [T, 0] },
  { prop: "wall", args: [34, 0.4, 5, "#2d6a4f"], p: [T, -10] },
  { prop: "signBoard", args: [["⭕ UNDERGROUND"], { w: 5.4, h: 0.9, color: "#14306b", fg: "#ffffff" }], p: [T, -9.7], y: 3.4, collide: false },
  { prop: "ticketGate", p: [T - 2, 2], r: 90, collide: false },
  { prop: "ticketGate", p: [T - 2, -1], r: 90, collide: false },
  { prop: "signBoard", args: [["Touch in · Touch out"], { w: 2.6, h: 0.5, color: "#ffffff", fg: "#14306b" }], p: [T - 6.5, -3.4], y: 1.3, collide: false },
  // two-lane escalator: stand right, walk left
  { prop: "slab", args: [10, 3.2, 0.12, "#8d99ae"], p: [T + 10, 0] },
  { prop: "signBoard", args: [["STAND ON THE RIGHT"], { w: 3.2, h: 0.5, color: "#d6221f", fg: "#fff" }], p: [T + 10, -2.6], y: 1.1, collide: false },
  { npc: "character-male-d", p: [T + 8, 1.0], r: 90 },
  { npc: "character-female-c", p: [T + 9.4, 1.0], r: 90 },
  { npc: "character-male-f", p: [T + 14, -1.0], r: 270, anim: "walk" }
);

// --- the pub (x ≈ 120) ----------------------------------------------------------------
const P = 120;
items.push(
  { prop: "slab", args: [34, 20, 0.05, "#7b5a3e"], p: [P, 0] },
  { prop: "wall", args: [34, 0.4, 5, "#3b2a1a"], p: [P, -10] },
  { prop: "wall", args: [0.4, 20, 5, "#3b2a1a"], p: [P - 17, 0] },
  { prop: "wall", args: [0.4, 20, 5, "#3b2a1a"], p: [P + 17, 0] },
  { prop: "barCounter", args: ["The Crown & Whistle", { length: 10, color: "#6b3f2a" }], p: [P, -5] },
  { prop: "lanternString", args: [14, ["#ffd23f", "#ffd23f", "#ffffff"]], p: [P, -8] },
  { prop: "cafeTable", args: ["#2d6a4f"], p: [P - 9, 2] },
  { prop: "cafeTable", args: ["#2d6a4f"], p: [P - 9, 5.5] },
  { prop: "cafeTable", args: ["#2d6a4f"], p: [P + 9, 2] },
  { prop: "cafeTable", args: ["#2d6a4f"], p: [P + 9, 5.5] },
  { prop: "plant", p: [P - 15.5, 8] },
  { npc: "character-female-d", p: [P - 3, -3.6], r: 180, anim: "idle", id: "barmaid" },
  { npc: "character-male-b", p: [P + 2, -3.6], r: 180 },
  { npc: "character-female-a", p: [P + 3.2, -3.6], r: 180 },
  { npc: "character-male-e", p: [P - 9.7, 2], r: 90, anim: "sit", y: 0.25, collide: false },
  { npc: "character-female-b", p: [P + 9.7, 5.5], r: 270, anim: "sit", y: 0.25, collide: false },
  { npc: "character-male-c", p: [P - 7.5, -3], r: 90 }
);

export default {
  sky: "#c9d3dd",
  fog: [40, 120],
  grounds: [
    { size: [100, 40], p: [0, 0], color: "#9a9a96" },
    { size: [40, 24], p: [T, 0], color: "#c4c8cc" },
    { size: [40, 24], p: [P, 0], color: "#5b4129" },
  ],
  spawns: { start: [-31, -2, 90], tube: [T - 12, 3, 90], pub: [P, 7, 180] },
  items,
  walls: [
    [-43, -8, 43, -7.6],
    [-43, 10.4, 43, 10.8],
    [-43.4, -8, -43, 10.8],
    [43, -8, 43.4, 10.8],
    [T - 17, -10.5, T + 17, -10],
    [T - 17, 9.6, T + 17, 10],
    [T - 17.4, -10.5, T - 17, 10],
    [T + 17, -10.5, T + 17.4, 10],
    [P - 17, -10.5, P + 17, -10],
    [P - 17, 9.6, P + 17, 10],
    [P - 17.4, -10.5, P - 17, 10],
    [P + 17, -10.5, P + 17.4, 10],
  ],
  interactables: [
    { id: "busStop", p: [-22, -1.4], radius: 2.2, tag: "Bus stop 🚌", tagY: 2.8, label: { en: "Go to the bus stop", vi: "Ra trạm xe buýt" } },
    { id: "tubeGate", p: [T - 4.8, 0.5], radius: 2.2, tag: "Touch in 💳", tagY: 2.0, label: { en: "Go to the Tube gates", vi: "Ra cổng soát vé Tube" } },
    { id: "escalator", p: [T + 7, -0.2], radius: 2.2, tag: "Escalator ↗", tagY: 2.2, label: { en: "Take the escalator", vi: "Đi thang cuốn" } },
    { id: "bar", p: [P, -2.6], radius: 2.4, tag: "The bar 🍺", tagY: 2.0, label: { en: "Go to the bar", vi: "Ra quầy bar" } },
    {
      id: "phoneBox",
      p: [-11.4, -3.6],
      radius: 1.6,
      label: { en: "Look at the red phone box", vi: "Nhìn buồng điện thoại đỏ" },
      speaker: { en: "You", vi: "Bạn" },
      icon: "☎️",
      say: {
        en: "A classic red phone box. These days they're mostly decoration, and a few are tiny libraries or coffee kiosks. Emergency number: **999** (or **112**).",
        vi: "Buồng điện thoại đỏ kinh điển. Ngày nay chúng chủ yếu để trang trí, một số là thư viện nhỏ hoặc quầy cà phê. Số khẩn cấp: **999** (hoặc **112**).",
      },
    },
  ],
};
