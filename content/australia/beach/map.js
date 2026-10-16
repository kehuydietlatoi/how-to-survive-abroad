// Sydney, Bondi-style beach: sand (z -6..10) with the sea to the north. Patrol flags and a lifeguard tower in the middle,
// an unpatrolled stretch to the east (x > 16), a sunscreen stand on the west side, the promenade to the south.

const items = [];
items.push(
  { prop: "slab", args: [90, 18, 0.06, "#f0dcae"], p: [0, 2] }, // sand z -7..11
  { prop: "slab", args: [90, 30, 0.02, "#4fb4e8"], p: [0, -22] }, // the sea
  { prop: "slab", args: [90, 6, 0.04, "#7fcdf2"], p: [0, -10.5] }, // shallow water
  { prop: "slab", args: [90, 2.5, 0.16, "#d8cfc1"], p: [0, 11.8] }, // promenade
  { prop: "lifeguardTower", p: [-8, 2] },
  { prop: "beachFlag", args: ["#d6221f", "#ffd23f"], p: [-1.4, -4.6] },
  { prop: "beachFlag", args: ["#d6221f", "#ffd23f"], p: [2.6, -4.6] },
  { prop: "signBoard", args: [["SWIM BETWEEN THE FLAGS"], { w: 3.2, h: 0.55, color: "#ffd23f", fg: "#d6221f" }], p: [0.6, -3.6], y: 0.9, collide: false },
  { prop: "signBoard", args: [["⚠ RIP CURRENT · Not patrolled"], { w: 3.8, h: 0.55, color: "#d6221f", fg: "#ffffff" }], p: [20, -3.6], y: 0.9, collide: false },
  { prop: "signBoard", args: [["Slip · Slop · Slap · Seek · Slide"], { w: 4.2, h: 0.6, color: "#ffffff", fg: "#1f5fbf" }], p: [-24, 8], y: 1.4, collide: false },
  { prop: "building", args: [5, 3.4, 3, "#fff4d6", "Sunscreen 🧴", "#f77f00"], p: [-26, 10] },
  { prop: "beachUmbrella", args: ["#ff6b6b"], p: [-16, 6] },
  { prop: "beachUmbrella", args: ["#4da3ff"], p: [-13, 8.5] },
  { prop: "beachUmbrella", args: ["#ffd23f"], p: [10, 7] },
  { prop: "beachTowel", args: ["#4da3ff"], p: [-16, 7.6] },
  { prop: "beachTowel", args: ["#ff8fab"], p: [10, 8.5] },
  { prop: "surfboard", args: ["#2ec4b6"], p: [14, 3.5], r: 80 },
  { prop: "surfboard", args: ["#ff6b6b"], p: [-19, 2], r: 10 },
  { prop: "lamp", p: [-12, 12.4] },
  { prop: "lamp", p: [14, 12.4] },
  { prop: "tree", p: [-36, 10] },
  { prop: "tree", p: [36, 10] },
  { npc: "character-male-f", p: [-8, 4.4], r: 180, id: "lifeguard" },
  { npc: "character-female-d", p: [-26, 7.8], r: 180, id: "seller" },
  { npc: "character-male-c", p: [4, -2], r: 0, anim: "walk" },
  { npc: "character-female-b", p: [24, 4], r: 270, anim: "idle" },
  { npc: "character-male-b", p: [32, -1], r: 0, anim: "idle", id: "local" }
);

export default {
  sky: "#bfe6ff",
  fog: [60, 170],
  grounds: [{ size: [110, 60], p: [0, -6], color: "#e6d3a2" }],
  spawns: { start: [-30, 8, 0], flags: [0, 3, 0] },
  items,
  walls: [
    [-43, -7.4, 43, -7],
    [-43, 13, 43, 13.4],
    [-43.4, -7.4, -43, 13.4],
    [43, -7.4, 43.4, 13.4],
  ],
  interactables: [
    { id: "sunscreen", p: [-26, 7.6], radius: 2.2, tag: "Sunscreen 🧴", tagY: 2.6, label: { en: "Visit the sunscreen stand", vi: "Đến quầy kem chống nắng" } },
    { id: "flags", p: [0.6, -2.6], radius: 2.8, tag: "Flags 🚩", tagY: 3.0, label: { en: "Go to the red-and-yellow flags", vi: "Đến cặp cờ đỏ-vàng" } },
    { id: "water", p: [0.6, -6.1], radius: 2.2, tag: "Water 🌊", tagY: 1.8, label: { en: "Wade in", vi: "Lội xuống nước" }, enabled: true },
    { id: "local", p: [32, 1.2], radius: 2.2, tag: "Local 🤠", tagY: 2.6, label: { en: "Chat with the local", vi: "Nói chuyện với người địa phương" } },
    {
      id: "lifeguard",
      p: [-8, 6.3],
      radius: 2.2,
      label: { en: "Talk to the lifeguard", vi: "Nói chuyện với nhân viên cứu hộ" },
      speaker: { en: "Lifeguard", vi: "Nhân viên cứu hộ" },
      icon: "🦺",
      say: {
        en: "G'day! Swim **between the red-and-yellow flags**, that's where we're watching. Outside them, rips can pull you out fast.",
        vi: "G'day! Hãy bơi **giữa hai cờ đỏ-vàng**, nơi chúng tôi trông chừng. Ngoài đó, dòng rip có thể kéo bạn ra xa rất nhanh.",
      },
    },
  ],
};
