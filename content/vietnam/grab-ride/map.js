// Hoàn Kiếm lakeside street (start) and the Văn Miếu gate (arrival, x = 200).
// Road along x (z = -5..5). Hotel side is south (+z, near the camera); the lake is north.
// Traffic lanes: z = 2 (westbound, clear of the Grab riders at z = 4.3) and
// z = -2.4 (eastbound), both inside the road wall band.

const facades = ["#e8c987", "#d9a7a0", "#b9cfd8", "#e5e0c9", "#caa2b8", "#d8b55b", "#9db6a4", "#e2b37a"];

const items = [];

// --- Start: Hoàn Kiếm --------------------------------------------------------------
for (let x = -35; x <= 35; x += 10) items.push({ model: "roads/road-straight", p: [x, 0] });
items.push({ prop: "slab", args: [80, 5.2, 0.16, "#e9dcc6"], p: [0, 7.6] });
items.push({ prop: "slab", args: [84, 4.2, 0.16, "#dfd2b8"], p: [0, -7.1] }); // lakeside promenade
// The colonial hotel row: at the start spawn (x = 4) the two near facades (x = 2, 6.75)
// sit inside the ±4 m cut-away band and fade, so the lake, bridge and plate tags stay
// clear of loom and the remaining facades hang past the east frame edge.
for (let i = 0; i < 9; i++) {
  items.push({ prop: "colonialFacade", args: [facades[i % 8], i % 4], p: [2 + i * 4.75, 13.2], r: 180, fade: true });
}
// West of the hotel row: hotel forecourt with trees well behind the spawn camera axis.
items.push(
  { prop: "tree", p: [-22, 10.8] },
  { prop: "tree", p: [-16, 10.8] },
  { prop: "plant", p: [-9.8, 9.6] }
);
// The lake with the island and the red Thê Húc bridge.
items.push(
  { prop: "slab", args: [80, 22, 0.04, "#7cc8e8"], p: [0, -21] },
  { prop: "slab", args: [11, 7, 0.12, "#e3d7bd"], p: [-2, -23] }, // temple islet
  { prop: "slab", args: [80, 1.2, 0.3, "#c9c2b0"], p: [0, -9.6] }, // lake wall
  { prop: "bench", p: [9, -8], r: 0 },
  { prop: "bench", p: [2, -23.5], r: 180 },
  { prop: "tree", p: [-6, -24] },
  { prop: "tree", p: [-14, -22.5] },
  { prop: "tree", p: [5, -23] },
  { prop: "wall", args: [1.6, 9, 0.5, "#e63946"], p: [-2, -15], collide: false }, // bridge deck
  { prop: "wall", args: [0.25, 9, 1.0, "#c1121f"], p: [-2.8, -15], collide: false },
  { prop: "wall", args: [0.25, 9, 1.0, "#c1121f"], p: [-1.2, -15], collide: false }
);
// Promenade trees kept off the sight lines to bridge, lake and the plate tags.
items.push(
  { prop: "tree", p: [-24, -8] },
  { prop: "tree", p: [-15, -8] },
  { prop: "tree", p: [-5, -8] },
  { prop: "tree", p: [21, -8] }
);
// Lakeside life: vendor, cyclo parked, walkers on the promenade and the hotel walk.
items.push(
  { prop: "quangGanh", args: ["#8d5b8e", 0], p: [12, -8.7], r: 180 },
  { prop: "xichLo", args: ["#b44343", 0], p: [17, -8.6], r: 200 },
  { npc: "character-male-b", path: [[-22, -6.6], [19, -6.6]], speed: 1.1, loop: "pingpong", pause: [1, 4] },
  { npc: "character-female-a", path: [[8, -7.6], [-20, -7.6]], speed: 0.9, loop: "pingpong" },
  { npc: "character-female-e", path: [[-18, 8.8], [22, 8.8]], speed: 1, loop: "pingpong", pause: [2, 6] }
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
  { prop: "parkedBikes", args: [4], p: [20, 9.4] },
  { prop: "streetSign", args: ["#356386", 1, "PHỐ Đinh Tiên Hoàng"], p: [10, 10.4] },
  { prop: "plantPots", args: ["#ae7156"], p: [-2, 10.5] }
);

// --- Arrival: Văn Miếu ---------------------------------------------------------------
for (let x = 170; x <= 230; x += 10) items.push({ model: "roads/road-straight", p: [x, 0] });
items.push(
  { prop: "slab", args: [64, 5.2, 0.16, "#dfd2b8"], p: [200, 7.6] },
  { prop: "slab", args: [64, 12, 0.16, "#dfd2b8"], p: [200, -11] },
  { prop: "slab", args: [8, 3.2, 0.1, "#e0cfab"], p: [197.5, -2], id: "gateFocus" }, // drop-off apron
  { prop: "wall", args: [64, 0.6, 2.4, "#e8c36a"], p: [200, -16.5] }, // temple wall
  { prop: "templeGate", p: [200, -14], r: 0 },
  { prop: "tree", p: [188, -10.5] },
  { prop: "tree", p: [212, -10.5] },
  { prop: "lanternString", args: [10], p: [200, -10] },
  { prop: "plantPots", args: ["#b37856"], p: [196.6, -11.4], r: 90 },
  { prop: "plantPots", args: ["#b37856", 1], p: [203.4, -11.4], r: 90 },
  { prop: "motorbike", args: ["#e85d75"], p: [199, 4.3], r: 90, s: 1.35, id: "arrivedBike" },
  { npc: "character-male-d", p: [198.9, 4.3], y: 0.55, r: 90, anim: "drive", helmet: true, collide: false, id: "myDriver" },
  { npc: "character-female-e", p: [194, -9], r: 20 },
  { npc: "character-male-e", p: [206, -10], r: -30, anim: "emote-yes" },
  // Forecourt life so the gate isn't bare asphalt and beige ground.
  { prop: "quangGanh", args: ["#5d8aa8", 2], p: [191.5, -13.2], r: 180 },
  { prop: "parkedBikes", args: [3], p: [206.5, -6.4], r: 180 },
  { prop: "motorbike", args: ["#f6c945"], p: [203.5, -5.9], r: 160, s: 1.3 },
  { prop: "vendorCartWheeled", args: ["#438d8e"], p: [211, 8.2], r: 200 },
  { prop: "streetSign", args: ["#7a4a2b", 2, "PHỐ VĂN MIẾU"], p: [185, 7.8] },
  { npc: "character-male-b", path: [[186, -8.4], [213, -8.4]], speed: 1, loop: "pingpong", pause: [1.5, 4] },
  { npc: "character-female-c", path: [[213, -9.6], [187, -9.6]], speed: 0.85, loop: "pingpong", pause: [2, 5] },
  { npc: "character-male-f", path: [[214, 7.8], [187, 7.8]], speed: 0.95, loop: "pingpong" }
);
// Arrival facade row sits one slot west of the spawn camera axis (x = 198.5): the
// adjacent east facade's box then crosses the camera sight lines and fades cleanly.
for (let i = 0; i < 11; i++) items.push({ prop: "colonialFacade", args: [facades[(i + 3) % 8], (i + 2) % 4], p: [170.5 + i * 5.1, 13.2], r: 180, fade: true });

export default {
  sky: "#ffe7c2",
  fog: [45, 130],
  // A longer lens over the default: the frame reaches the kerb plates up close and
  // still holds the lake, bridge (below) and the full Văn Miếu gate (to the north).
  camera: { height: 6, distance: 20, aim: 3.6 },
  grounds: [
    { size: [96, 58], p: [0, -3], color: "#cfc3a3" },
    { size: [76, 52], p: [200, -3], color: "#c8bc9e" },
  ],
  spawns: {
    // Start mid-row among the four waiting drivers (row x = -4..9.5): all plate tags fit
    // the camera field of view, the lake and bridge sit behind, and both near hotel
    // facades (x = 2, 6.75) are within the ±4 m cut-away band, so they fade at spawn.
    start: [4, 7, 180],
    arrive: [198.5, 6.2, 180],
  },
  items,
  crowd: { count: 5, area: [-22, 5.8, 24, 10], npcs: ["character-male-f", "character-female-a", "character-female-d"] },
  traffic: [
    { from: [40, 2], to: [-38, 2], speed: [4.5, 7], spacing: 11, count: 4, vehicles: [{ prop: "motorbike", args: ["#d94f3d"] }, { prop: "hanoiTaxi", args: ["#f3f1e7"] }, { prop: "motorbike", args: ["#3a7d5d"], s: 1.15 }, { prop: "hanoiTaxi", args: ["#27476e", 1] }] },
    { from: [-38, -2.4], to: [40, -2.4], speed: [2.6, 4.4], spacing: 13, count: 4, vehicles: [{ prop: "xichLo", args: ["#b44343"] }, { prop: "goodsBicycle", args: ["#427f86", 2] }, { prop: "hanoiBus", args: ["#3d9968", 0, "09A", "Đống Đa – Bờ Hồ"] }, { prop: "loadedScooter", args: ["#5a8f9d", 1] }] },
  ],
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
