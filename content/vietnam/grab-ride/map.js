// Hoàn Kiếm lakeside street (start) and the Văn Miếu gate (arrival, x = 200).
// Road along x (z = -5..5). Hotel side is south (+z, near the camera); the lake is north.

const houseColors = ["#ffd166", "#f4a6c1", "#a8e6cf", "#ffb385", "#c3b1e1", "#fff3b0", "#9ad1f5", "#f7c59f"];
const signs = [null, "Cà phê", null, "Khách sạn Hồ Gươm · Hotel", null, "Bánh cuốn", null, "Kem Tràng Tiền", null, "Sách", null, "Lụa"];

const items = [];

// --- Start: Hoàn Kiếm --------------------------------------------------------------
for (let x = -35; x <= 35; x += 10) items.push({ model: "roads/road-straight", p: [x, 0] });
items.push({ prop: "slab", args: [80, 5.2, 0.16, "#e9dcc6"], p: [0, 7.6] });
items.push({ prop: "slab", args: [80, 4, 0.16, "#e9dcc6"], p: [0, -7] });
for (let i = 0; i < 12; i++) {
  items.push({ prop: "tubeHouse", args: [houseColors[i % 8], 2 + (i % 3), 4.4, signs[i]], p: [-26 + i * 4.6, 13.2], r: 180, fade: true });
}
// The lake with trees and the red Thê Húc bridge.
items.push(
  { prop: "slab", args: [80, 22, 0.04, "#7cc8e8"], p: [0, -21] },
  { prop: "slab", args: [80, 1.2, 0.3, "#c9c2b0"], p: [0, -9.6] }, // lake wall
  { prop: "tree", p: [-20, -8.2] },
  { prop: "tree", p: [-9, -8.2] },
  { prop: "tree", p: [3, -8.2] },
  { prop: "tree", p: [16, -8.2] },
  { prop: "bench", p: [-14, -8.4], r: 0 },
  { prop: "bench", p: [9, -8.4], r: 0 },
  { prop: "wall", args: [1.6, 9, 0.5, "#e63946"], p: [-2, -15], collide: false }, // bridge deck
  { prop: "wall", args: [0.25, 9, 1.0, "#c1121f"], p: [-2.8, -15], collide: false },
  { prop: "wall", args: [0.25, 9, 1.0, "#c1121f"], p: [-1.2, -15], collide: false }
);

// Grab drivers waiting at the kerb: very similar plates. Only "29B1-234.56" is yours.
const grab = [
  { id: "driverA", x: -4, color: "#4da3ff", npc: "character-male-b" },
  { id: "driverOK", x: 0.5, color: "#e85d75", npc: "character-male-d" },
  { id: "driverB", x: 5, color: "#2b2b2b", npc: "character-male-f" },
  { id: "driverC", x: 9.5, color: "#f6c945", npc: "character-female-d" },
];
for (const g of grab) {
  items.push({ prop: "motorbike", args: [g.color], p: [g.x, 4.3], r: 90, s: 1.35 });
  items.push({ npc: g.npc, p: [g.x - 0.1, 4.3], y: 0.55, r: 90, anim: "drive", helmet: true, collide: false, id: g.id });
}
// Street xe ôm driver next to the hotel.
items.push(
  { prop: "motorbike", args: ["#8d6e63"], p: [-12, 9.6], r: 70, s: 1.35 },
  { npc: "character-male-c", p: [-10.6, 8.6], r: 200, id: "xeOm" },
  { npc: "character-female-c", p: [-8, 10.4], r: 180, id: "receptionist" },
  { prop: "plant", p: [-6.2, 10.6] },
  { prop: "vendorCart", p: [16, 8.4], r: 10 },
  { prop: "parkedBikes", args: [4], p: [20, 9.4] }
);

// --- Arrival: Văn Miếu ---------------------------------------------------------------
for (let x = 170; x <= 230; x += 10) items.push({ model: "roads/road-straight", p: [x, 0] });
items.push(
  { prop: "slab", args: [64, 5.2, 0.16, "#e9dcc6"], p: [200, 7.6] },
  { prop: "slab", args: [64, 12, 0.16, "#e9dcc6"], p: [200, -11] },
  { prop: "wall", args: [64, 0.6, 2.4, "#e8c36a"], p: [200, -16.5] }, // temple wall
  { prop: "templeGate", p: [200, -14], r: 0 },
  { prop: "tree", p: [190, -9] },
  { prop: "tree", p: [210, -9] },
  { prop: "lanternString", args: [10], p: [200, -10] },
  { prop: "motorbike", args: ["#e85d75"], p: [199, 4.3], r: 90, s: 1.35, id: "arrivedBike" },
  { npc: "character-male-d", p: [198.9, 4.3], y: 0.55, r: 90, anim: "drive", helmet: true, collide: false, id: "myDriver" },
  { npc: "character-female-e", p: [194, -9], r: 20 },
  { npc: "character-male-e", p: [206, -10], r: -30, anim: "emote-yes" }
);
for (let i = 0; i < 6; i++) items.push({ prop: "tubeHouse", args: [houseColors[(i + 2) % 8], 2 + (i % 2), 4.4, null], p: [186 + i * 5.6, 13.2], r: 180, fade: true });

export default {
  sky: "#ffe7c2",
  fog: [45, 130],
  grounds: [
    { size: [100, 60], p: [0, 0], color: "#d8c8ae" },
    { size: [80, 50], p: [200, 0], color: "#d8c8ae" },
  ],
  spawns: {
    start: [-8.5, 8, 180],
    arrive: [198.5, 6.2, 180],
  },
  items,
  walls: [
    [-30, 10.3, 30, 11],
    [-30, -9, 30, -8.6], // lake wall
    [-31, -9, -30, 11],
    [30, -9, 31, 11],
    [-40, -5, 40, 3.6, "road"], // stay on the pavement; the Grab bikes wait at the kerb
    [168, -16, 232, -15.6],
    [168, 10.3, 232, 11],
    [168, -5, 232, 3.6],
    [167, -16, 168, 11],
    [232, -16, 233, 11],
  ],
  interactables: [
    {
      id: "receptionist",
      p: [-8, 10.4],
      radius: 1.8,
      label: { en: "Talk to Chị Mai", vi: "Nói chuyện với chị Mai" },
      speaker: { en: "Chị Mai (hotel)", vi: "Chị Mai (khách sạn)" },
      icon: "👩",
      say: {
        en: "Your Grab driver will wait at the kerb in front of the hotel. Check the **plate number** in the app!",
        vi: "Tài xế Grab sẽ đợi ở mép đường trước khách sạn. Nhớ kiểm tra **biển số** trong ứng dụng nhé!",
      },
    },
    ...grab.map((g) => ({
      id: g.id,
      p: [g.x, 5.4],
      radius: 1.4,
      tag: { driverA: "29B1-243.56", driverOK: "29B1-234.56", driverB: "29H1-234.56", driverC: "29B1-234.65" }[g.id],
      tagY: 3.1,
      label: { en: "Check this driver", vi: "Xem tài xế này" },
    })),
  ],
};
