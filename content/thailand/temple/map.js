// Bangkok: the pavement outside the Grand Palace wall (start, x -36..36) and a temple courtyard inside (x ≈ 100).
// Road runs along x at z 0..10; the palace wall is at z = -7.5 with a gap (the real gate) at x -2..2.

const items = [];
for (let x = -30; x <= 30; x += 10) items.push({ model: "roads/road-straight", p: [x, 5] });
items.push(
  { prop: "slab", args: [74, 6, 0.16, "#e0d6c2"], p: [0, -3] },
  // palace wall + gate
  { prop: "wall", args: [34, 0.8, 3.2, "#f4efe4"], p: [-19.2, -7.5] },
  { prop: "wall", args: [34, 0.8, 3.2, "#f4efe4"], p: [19.2, -7.5] },
  { prop: "wall", args: [1.0, 1.2, 4.4, "#b5281c"], p: [-2.5, -7.5] },
  { prop: "wall", args: [1.0, 1.2, 4.4, "#b5281c"], p: [2.5, -7.5] },
  { prop: "signBoard", args: [["พระบรมมหาราชวัง · Grand Palace"], { w: 5.4, h: 0.8, color: "#14306b", fg: "#ffd23f" }], p: [0, -7.1], y: 3.7, collide: false },
  { prop: "thaiTemple", p: [0, -19], collide: false },
  { prop: "tree", p: [-26, -5.5] },
  { prop: "tree", p: [26, -5.5] },
  { prop: "lamp", p: [-16, -1] },
  { prop: "lamp", p: [18, -1] },
  // ticket booth & clothes stall
  { prop: "building", args: [4, 3, 3, "#ffffff", "Tickets", "#1f5fbf"], p: [8, -5.4] },
  { prop: "vendorCart", p: [14, -2.2], r: 10 },
  { prop: "signBoard", args: [["เสื้อ · กางเกง  Shirts · Trousers"], { w: 2.6, h: 0.5, color: "#fff4d6", fg: "#c1121f" }], p: [14, -2.9], y: 1.9, collide: false },
  // tuk-tuks at the kerb (the uncle's one is the shiny pink one)
  { prop: "rickshaw", args: ["#ff6fb1", "TUK-TUK"], p: [-8, 2], r: 90, collide: false },
  { prop: "rickshaw", args: ["#2ec4b6", "TUK-TUK"], p: [-14, 2], r: 90, collide: false },
  { prop: "rickshaw", args: ["#ffd23f", "TUK-TUK"], p: [16, 2], r: 90, collide: false },
  { npc: "character-male-e", p: [-10, -0.4], r: 90, id: "uncle" },
  { npc: "character-female-b", p: [-2, -3.5], r: 180, anim: "walk" },
  { npc: "character-male-c", p: [22, -3.2], r: 270, anim: "walk" }
);

// --- inside the temple courtyard -----------------------------------------------------
const C = 100;
items.push(
  { prop: "slab", args: [50, 30, 0.06, "#e9e2d0"], p: [C, -3] },
  { prop: "thaiTemple", p: [C, -12] },
  { prop: "buddhaShrine", p: [C - 4, -2.5] },
  { prop: "wall", args: [2.4, 0.5, 0.9, "#8a6a47"], p: [C + 10, 4.4] }, // shoe rack
  { prop: "signBoard", args: [["รองเท้า  Shoes"], { w: 1.6, h: 0.4, color: "#ffffff", fg: "#333" }], p: [C + 10, 4.15], y: 0.95, collide: false },
  { prop: "plant", p: [C - 18, 8] },
  { prop: "plant", p: [C + 18, 8] },
  { prop: "tree", p: [C - 20, -6] },
  { prop: "tree", p: [C + 20, -6] },
  { npc: "character-male-f", p: [C + 6, -2], r: 270, id: "monk" },
  { npc: "character-female-c", p: [C - 10, 3], r: 90, anim: "walk" }
);

export default {
  sky: "#ffeccf",
  fog: [55, 160],
  grounds: [
    { size: [90, 40], p: [0, 0], color: "#cdbf9e" },
    { size: [60, 40], p: [C, -3], color: "#b9ad8a" },
  ],
  spawns: { start: [-24, -2.5, 90], inside: [C - 14, 8, 0] },
  items,
  walls: [
    [-36, -8, -3.1, -7],
    [3.1, -8, 36, -7],
    [-2.6, -9.5, 2.6, -9],
    [-36, 9.6, 36, 10],
    [-36.4, -9.5, -36, 10],
    [36, -9.5, 36.4, 10],
    [C - 25, -18, C + 25, -17.6],
    [C - 25, 12, C + 25, 12.4],
    [C - 25.4, -18, C - 25, 12.4],
    [C + 25, -18, C + 25.4, 12.4],
  ],
  interactables: [
    { id: "uncle", p: [-10, -0.4], radius: 2.0, tag: "😀 “Friend!”", tagY: 2.6, label: { en: "Talk to the friendly man", vi: "Nói chuyện với người đàn ông thân thiện" } },
    { id: "gate", p: [0, -5.2], radius: 2.2, tag: "Grand Palace 🎫", tagY: 4.2, label: { en: "Go to the palace entrance", vi: "Đi tới cổng cung điện" } },
    {
      id: "stall",
      p: [14, -1.2],
      radius: 1.8,
      label: { en: "Look at the clothes stall", vi: "Xem sạp quần áo" },
      speaker: { en: "Stall owner", vi: "Chủ sạp" },
      icon: "👕",
      say: {
        en: "Need to cover up? Shirts with sleeves and long trousers or skirts are sold right by the gate (and can often be borrowed or rented at the entrance too).",
        vi: "Cần che người? Áo có tay và quần dài hoặc váy dài bán ngay gần cổng (cũng thường có thể mượn hoặc thuê ở lối vào).",
      },
    },
    { id: "shoes", p: [C + 10, 5.8], radius: 1.8, tag: "รองเท้า 👟", tagY: 1.8, label: { en: "Leave your shoes on the rack", vi: "Để giày lên kệ" } },
    { id: "shrine", p: [C - 4, 0.4], radius: 2.2, tag: "Buddha image 🙏", tagY: 3.0, label: { en: "Visit the Buddha image", vi: "Đến tượng Phật" } },
    { id: "monk", p: [C + 6, -0.3], radius: 1.9, tag: "Monk 🧘", tagY: 2.6, label: { en: "Greet the monk", vi: "Chào nhà sư" } },
  ],
};
