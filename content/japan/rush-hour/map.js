// Tokyo: station forecourt (x -20..10), ticket gates (x 22) and the platform (x 30..70).
// The commuter train is hidden until the "queue" step. Platform edge is at z = -2.4; passengers stand on z > -2.

const items = [];

// --- forecourt: konbini, vending machines, kōban ------------------------------------------
items.push(
  { prop: "slab", args: [40, 20, 0.04, "#d9dde2"], p: [-5, 0] },
  { prop: "building", args: [10, 4.5, 6, "#f3efe6", "コンビニ  Konbini", "#1f9d55"], p: [-12, -9]},
  { prop: "building", args: [6, 4, 5, "#ffffff", "交番  KŌBAN", "#d6221f"], p: [-1, -9] },
  { prop: "vendingMachine", args: ["#e63946"], p: [5, -9.2] },
  { prop: "vendingMachine", args: ["#2a9d8f"], p: [6.1, -9.2] },
  { prop: "vendingMachine", args: ["#4da3ff"], p: [7.2, -9.2] },
  { prop: "wheelieBin", args: ["#2a9d8f", "ペットボトル"], p: [8.6, -9.2] }, // bottles & cans only
  { prop: "lamp", p: [-18, -6] },
  { prop: "lamp", p: [8, 6] },
  { prop: "tree", p: [-19, 5] },
  { npc: "character-male-c", p: [-8, 2], r: 90, anim: "walk" },
  { npc: "character-female-b", p: [2, 4], r: 270, anim: "walk" }
);

// --- concourse + ticket gates -------------------------------------------------------------
items.push(
  { prop: "slab", args: [24, 20, 0.05, "#eef1f5"], p: [22, 0] },
  { prop: "wall", args: [24, 0.4, 5, "#d7dde6"], p: [22, -10] },
  { prop: "signBoard", args: [["東京  Tōkyō  Station"], { w: 8, h: 0.9, color: "#14306b", fg: "#fff" }], p: [22, -9.7], y: 3.4, collide: false },
  { prop: "ticketGate", p: [22, -4], r: 90, collide: false },
  { prop: "ticketGate", p: [22, 0], r: 90, collide: false, id: "gateA" },
  { prop: "ticketGate", p: [22, 4], r: 90, collide: false },
  { npc: "character-male-d", p: [14, 1], r: 90, anim: "walk" },
  { npc: "character-female-e", p: [27, -3], r: 270 }
);

// --- platform + track ---------------------------------------------------------------------
items.push(
  { prop: "slab", args: [44, 11.8, 0.3, "#d8dde3"], p: [52, 3.5] },
  { prop: "slab", args: [44, 0.4, 0.31, "#ffd23f"], p: [52, -2.0] }, // yellow tactile line
  { prop: "track", args: [40], p: [50, -4.6], r: 90, collide: false },
  { prop: "sbahnTrain", args: [16, "山手線 Yamanote", "#7cc74a"], p: [44, -4.6], r: 90, hidden: true, id: "train", fade: true },
  // door marks: line up where the train doors will be (x = 40 and x = 48)
  { prop: "slab", args: [0.9, 0.6, 0.02, "#4da3ff"], p: [40, -0.9], y: 0.3 },
  { prop: "slab", args: [0.9, 0.6, 0.02, "#4da3ff"], p: [48, -0.9], y: 0.3 },
  { prop: "signBoard", args: [["ゴミ箱なし · No bins"], { w: 1.8, h: 0.5, color: "#ffffff", fg: "#c1121f" }], p: [58, 4.8], y: 0.9, collide: false },
  { prop: "lamp", p: [34, 4.8] },
  { prop: "lamp", p: [66, 4.8] },
  // commuters queueing politely at the second door, one in the wrong place
  { npc: "character-male-b", p: [48, 0.4], r: 180 },
  { npc: "character-female-c", p: [48, 1.4], r: 180 },
  { npc: "character-male-e", p: [48, 2.4], r: 180 },
  { npc: "character-female-f", p: [55, 2], r: 90, anim: "idle" }
);

export default {
  sky: "#cfe8ff",
  fog: [50, 150],
  grounds: [{ size: [120, 40], p: [30, 0], color: "#c9cfd6" }],
  spawns: { start: [-14, 2, 90], platform: [36, 2.2, 90] },
  items,
  walls: [
    [-22, -12, 72, -11.6],
    [-22, 9.5, 72, 10],
    [-22, -12, -21.6, 10],
    [71.6, -12, 72, 10],
    [30, -2.6, 70, -2.3, "edge"], // platform edge
  ],
  interactables: [
    { id: "gate", p: [19.6, 0], radius: 2.0, tag: "改札 Gate 🎫", tagY: 2.1, label: { en: "Go through the ticket gate", vi: "Đi qua cổng soát vé" } },
    { id: "queueMark", p: [48, -0.2], radius: 1.7, tag: "乗車位置 Queue here", tagY: 2.2, label: { en: "Line up at the door mark", vi: "Xếp hàng ở vạch cửa tàu" } },
    {
      id: "vending",
      p: [6.1, -7.5],
      radius: 2.0,
      tag: "自販機 🥤",
      tagY: 2.4,
      label: { en: "Look at the vending machines", vi: "Xem máy bán hàng tự động" },
      speaker: { en: "You", vi: "Bạn" },
      icon: "🥤",
      say: {
        en: "A vending machine on every corner: hot coffee in a can, cold tea, even soup. The little bin beside it is for **bottles and cans only**.",
        vi: "Góc phố nào cũng có máy bán hàng: cà phê nóng đóng lon, trà lạnh, cả súp. Thùng nhỏ bên cạnh chỉ dành cho **chai và lon**.",
      },
    },
    { id: "koban", p: [-1, -6.4], radius: 2.0, tag: "交番 Kōban 👮", tagY: 3.4, label: { en: "Visit the kōban (police box)", vi: "Vào đồn cảnh sát nhỏ (kōban)" } },
  ],
};
