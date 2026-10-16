// Seoul: a samgyeopsal (pork belly) restaurant. Entrance at the south (z = 7), shoe shelf by the door,
// three grill tables; ours is the middle one (id "table") with the team lead and two colleagues.

const items = [];
items.push(
  { prop: "slab", args: [34, 20, 0.05, "#d9c3a0"], p: [0, -1] },
  { prop: "wall", args: [34, 0.4, 5, "#f1e7d3"], p: [0, -11] },
  { prop: "wall", args: [0.4, 20, 5, "#f1e7d3"], p: [-17, -1] },
  { prop: "wall", args: [0.4, 20, 5, "#f1e7d3"], p: [17, -1] },
  { prop: "signBoard", args: [["삼겹살  Samgyeopsal"], { w: 6, h: 0.9, color: "#b5281c", fg: "#ffd23f" }], p: [0, -10.7], y: 3.0, collide: false },
  { prop: "signBoard", args: [["소주 · 맥주 · 막걸리"], { w: 3.4, h: 0.6, color: "#2a9d8f", fg: "#fff" }], p: [-10, -10.7], y: 2.4, collide: false },
  { prop: "signBoard", args: [["반찬 리필 무료  Free banchan refills"], { w: 4.6, h: 0.6, color: "#ffffff", fg: "#c1121f" }], p: [10, -10.7], y: 2.4, collide: false },
  { prop: "lanternString", args: [14, ["#ff4d4d", "#ffd23f", "#ffffff"]], p: [0, -9.5] },
  { prop: "lanternString", args: [14, ["#ff4d4d", "#ffd23f", "#ffffff"]], p: [-9, 2] },
  { prop: "plant", p: [-15.5, -9.5] },
  { prop: "plant", p: [15.5, -9.5] },
  // shoe shelf at the entrance
  { prop: "wall", args: [2.6, 0.5, 0.9, "#8a6a47"], p: [-9, 5.6] },
  { prop: "signBoard", args: [["신발장  Shoes"], { w: 1.8, h: 0.4, color: "#ffffff", fg: "#333" }], p: [-9, 5.35], y: 1.0, collide: false }
);
// three grill tables with stools
const tables = [-10, 0, 10];
for (const x of tables) {
  items.push({ prop: "grillTable", p: [x, -2.5], id: x === 0 ? "grill" : undefined });
  for (const [dx, dz] of [[-1.2, 0], [1.2, 0], [0, -1.05], [0, 1.05]]) items.push({ prop: "lowStool", args: [x === 0 ? "#2a6f97" : "#d62828"], p: [x + dx, -2.5 + dz], collide: false });
}
items.push(
  { prop: "sojuBottle", p: [-0.55, -2.1], y: 0.76, collide: false },
  { prop: "sojuBottle", p: [0.5, -2.9], y: 0.76, collide: false },
  { prop: "sojuBottle", p: [-0.1, -2.9], y: 0.76, collide: false },
  // team: the team lead sits at the head of the table (far from the door), juniors near the door side
  { npc: "character-male-a", p: [0, -3.55], r: 0, anim: "sit", y: 0.25, collide: false, id: "boss" },
  { npc: "character-female-c", p: [-1.2, -2.5], r: 90, anim: "sit", y: 0.25, collide: false },
  { npc: "character-male-d", p: [1.2, -2.5], r: 270, anim: "sit", y: 0.25, collide: false },
  // other tables: loud, happy
  { npc: "character-male-e", p: [-10, -3.55], r: 0, anim: "sit", y: 0.25, collide: false },
  { npc: "character-female-b", p: [-8.8, -2.5], r: 270, anim: "sit", y: 0.25, collide: false },
  { npc: "character-male-b", p: [10, -3.55], r: 0, anim: "sit", y: 0.25, collide: false },
  { npc: "character-female-e", p: [11.2, -2.5], r: 270, anim: "sit", y: 0.25, collide: false },
  { npc: "character-female-d", p: [6, 2.5], r: 180, anim: "walk" } // server
);

export default {
  sky: "#ffe9d6",
  fog: [50, 150],
  grounds: [{ size: [60, 40], p: [0, 0], color: "#c9b896" }],
  spawns: { start: [0, 7.8, 180], table: [0, 1.6, 180] },
  items,
  walls: [
    [-17, -11.5, 17, -11],
    [-17, 8.6, 17, 9],
    [-17.3, -11.5, -16.9, 9],
    [16.9, -11.5, 17.3, 9],
  ],
  interactables: [
    {
      id: "shoes",
      p: [-9, 6.8],
      radius: 1.8,
      tag: "신발장 👟",
      tagY: 1.8,
      label: { en: "Take your shoes off here", vi: "Cởi giày ở đây" },
    },
    {
      id: "table",
      p: [0, 0.2],
      radius: 1.9,
      tag: "회식 Hoesik 🍻",
      tagY: 2.7,
      label: { en: "Join your team's table", vi: "Ngồi vào bàn của nhóm" },
    },
    {
      id: "waiter",
      p: [6, 2.6],
      radius: 1.8,
      label: { en: "Talk to the server", vi: "Nói chuyện với nhân viên" },
      speaker: { en: "Server", vi: "Nhân viên" },
      icon: "🧑‍🍳",
      say: {
        en: "Side dishes (banchan) are **free refills**: just raise a hand and say “Yeogi juseyo!” (Excuse me, please!). There's no tipping here.",
        vi: "Các món ăn kèm (banchan) được **thêm miễn phí**: chỉ cần giơ tay và nói “Yeogi juseyo!” (Cho tôi xin ở đây ạ!). Ở đây không có tiền boa.",
      },
    },
  ],
};
