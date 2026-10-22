import { mulberry32 } from "../../../src/minigames/crossingSim.js";

// Hanoi Old Quarter street. Road runs along x (z = -5..5), guesthouse on the south
// (+z, near the camera) side, phở stall on the north (-z) side.

const houseColors = ["#ffd166", "#f4a6c1", "#a8e6cf", "#ffb385", "#c3b1e1", "#fff3b0", "#9ad1f5", "#f7c59f"];
const signsSouth = [null, "Cà phê", null, "Nhà nghỉ Hoa Sen · Guesthouse", "Bánh mì", null, "Tạp hoá", null, "Áo dài", null, "Trà chanh", null, "Giày dép", null, null, "Bún chả", null, "Hoa"];
const signsNorth = ["Lụa", null, "Cà phê trứng", null, null, "Đồ lưu niệm", null, null, "Tiệm vàng", null, "Kem", null, "Hiệu thuốc", null, "Sách", null, "Bia hơi", null];

const items = [];

// Road (10 m tiles along x).
for (let x = -45; x <= 45; x += 10) items.push({ model: "roads/road-straight", p: [x, 0], r: 0 });

// Sidewalks.
items.push({ prop: "slab", args: [100, 5.2, 0.16, "#e9dcc6"], p: [0, 7.6] });
items.push({ prop: "slab", args: [100, 5.2, 0.16, "#e9dcc6"], p: [0, -7.6] });

// Narrow, weathered shop houses: stable variation across both sides of the street.
const rand = mulberry32(7107);
for (let i = 0; i < 18; i++) {
  const x = -38 + i * 4.5;
  const south = Math.floor(rand() * 1000), north = Math.floor(rand() * 1000);
  // The south row sits behind the camera rather than enclosing the spawn in cut-away walls.
  items.push({ prop: "oldQuarterHouse", args: [houseColors[south % 8], south, signsSouth[i] || "Tạp hoá"], p: [x, 21], r: 180, fade: true });
  items.push({ prop: "oldQuarterHouse", args: [houseColors[north % 8], north, signsNorth[i] || "Cửa hàng"], p: [x, -13.2], r: 0 });
}

// Street life: parked bikes, vendors, poles, cables, lanterns.
items.push(
  { prop: "parkedBikes", args: [5], p: [-5.5, 9], r: 0 },
  { prop: "parkedBikes", args: [4], p: [6.5, 9.2], r: 0 },
  { prop: "parkedBikes", args: [6], p: [-9, -9], r: 180 },
  { prop: "parkedBikes", args: [3], p: [12, -9], r: 180 },
  { prop: "goodsBicycle", args: ["#497f78", "flowers"], p: [-15, 9.1], r: 80, y: 0.16 },
  { prop: "goodsBicycle", args: ["#a26e68", "baskets"], p: [-6.5, -9.1], r: -85, y: 0.16 },
  { prop: "loadedScooter", args: ["#cf8e51", "boxes"], p: [-9, 9.3], r: 85, y: 0.16 },
  { prop: "loadedScooter", args: ["#658e9a", "gas"], p: [9, -9.2], r: -90, y: 0.16 },
  { prop: "quangGanh", args: ["#81548a", 2], p: [-4.4, -9.2], r: -10, y: 0.16 },
  { prop: "vendorCartWheeled", args: ["#4e8f7b", 1], p: [-18, 9.0], r: 20, y: 0.16 },
  { prop: "vendorCartWheeled", args: ["#bc6e51", 0], p: [12, -8.7], r: -30, y: 0.16 },
  { prop: "utilityPole", p: [-16, 5.6] },
  { prop: "utilityPole", p: [14, 5.6] },
  { prop: "utilityPole", p: [-16, -5.6] },
  { prop: "utilityPole", p: [14, -5.6] },
  // Leave a clear +/-4 m crossing corridor; Line objects do not participate in mesh fading.
  ...[-5.6, 5.6].flatMap(z => [-11, 11].map(x => ({ prop: "cableTangle", args: [14], p: [x, z], y: 0.8 }))),
  { prop: "lanternString", args: [6], p: [-10, 9.9], fade: true },
  { prop: "lanternString", args: [6], p: [9, -9.9], fade: true },
  { prop: "tree", p: [-26, 6.2] },
  { prop: "tree", p: [24, -6.2] },
  { prop: "plasticStool", args: ["#4da3ff"], p: [-17, 8.6] },
  { prop: "plasticStool", args: ["#e63946"], p: [-16.3, 8.8] }
);

// The phở stall with low tables and stools.
items.push(
  { prop: "phoStall", p: [4, -9.2], r: 0 },
  { prop: "lowTable", args: ["#4da3ff"], p: [2.6, -7.0] },
  { prop: "lowTable", args: ["#4da3ff"], p: [5.6, -7.0] },
  { prop: "plasticStool", args: ["#e63946"], p: [2.6, -7.8], id: "myStool" },
  { prop: "plasticStool", args: ["#e63946"], p: [1.8, -7.0] },
  { prop: "plasticStool", args: ["#4da3ff"], p: [5.6, -7.8] },
  { prop: "plasticStool", args: ["#e63946"], p: [6.4, -7.0] },
  { prop: "phoBowl", p: [2.6, -7.0], y: 0.53, id: "myBowl", hidden: true },
  { prop: "phoBowl", p: [5.6, -7.0], y: 0.53 }
);

// Sidewalk paths stay outside the x=0 crossing and the stall's approach. No map.traffic:
// StreetCrossing owns all road traffic, including its avoidance and collision sizes.
for (const [i, path] of [
  [[-17, 6.2], [-8, 6.2]], [[-7.5, 7.0], [-3.7, 7.0]],
  [[5, 6.3], [12, 6.3]], [[14, 7.1], [20, 7.1]],
  [[-15, -6.1], [-8, -6.1]], [[-7, -7.4], [-3.6, -7.4]],
  [[8, -6.2], [14, -6.2]], [[8, -7.5], [13, -7.5]],
].entries()) {
  items.push({ npc: ["character-female-a", "character-male-b", "character-female-c", "character-male-e"][i % 4],
    id: `sidewalkWalker${i}`, path: i % 2 ? [...path].reverse() : path,
    speed: 0.8 + i % 3 * 0.13, loop: "pingpong", pause: [0.3, 0.8], collide: false });
}

// People.
items.push(
  { npc: "character-female-d", p: [-10, 8.8], r: -70, id: "guesthouseOwner" },
  { npc: "character-female-b", p: [5.5, -9.6], r: -20, id: "phoLady" },
  { npc: "character-male-c", p: [5.6, -7.8], r: 0, anim: "sit", y: 0.3, collide: false },
  { npc: "character-male-f", p: [-16.3, 8.8], r: 160, anim: "sit", y: 0.46, collide: false },
  { npc: "character-female-e", p: [10, 7.5], r: 90, anim: "emote-yes" },
  { npc: "character-male-d", p: [-3, -7.2], r: 270 }
);

export default {
  sky: "#ffe7c2",
  fog: [45, 120],
  camera: { height: 5.2, distance: 13, fov: 48, aim: 4.5, lookAhead: 1.2 },
  grounds: [{ size: [140, 60], p: [0, 0], color: "#d8c8ae" }],
  spawns: {
    start: [-12, 8.6, 180],
    stool: [2.6, -7.8, 0],
  },
  items,
  walls: [
    [-41, -11, 41, -10.3], // north building fronts
    [-41, 10.3, 41, 11], // south building fronts
    [-41, -11, -40, 11],
    [40, -11, 41, 11],
    [-50, -5, 50, 5, "road"], // can only cross via the minigame
  ],
  interactables: [
    { id: "kerb", p: [0, 5.7], radius: 1.8, label: { en: "Cross the street", vi: "Băng qua đường" } },
    {
      id: "guesthouseOwner",
      p: [-10, 8.8],
      radius: 1.8,
      label: { en: "Talk to Cô Lan", vi: "Nói chuyện với cô Lan" },
      speaker: { en: "Cô Lan (guesthouse)", vi: "Cô Lan (nhà nghỉ)" },
      icon: "👩",
      say: {
        en: "The phở stall is just across the street, a bit to the right. Walk slowly, don't run, the bikes will go around you!",
        vi: "Quán phở ngay bên kia đường, hơi chếch sang phải. Đi chậm thôi, đừng chạy, xe sẽ tự tránh cháu!",
      },
    },
    { id: "myStool", p: [2.6, -7.8], radius: 1.4, tag: "Phở 🍜", tagY: 1.6, label: { en: "Sit down", vi: "Ngồi xuống" } },
    {
      id: "phoLady",
      p: [5.5, -9.6],
      radius: 2,
      label: { en: "Talk to Cô Hoa", vi: "Nói chuyện với cô Hoa" },
      speaker: { en: "Cô Hoa (phở stall)", vi: "Cô Hoa (quán phở)" },
      icon: "👩‍🍳",
      say: { en: "Ngồi đi em! (Have a seat!), pick any little stool.", vi: "Ngồi đi em! Ghế nào cũng được." },
    },
  ],
};
