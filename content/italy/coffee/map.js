// Rome: an espresso bar on a sunny street (x -30..30) with the cassa on the left, the counter in the middle,
// terrace tables on the right, and a bus stop with a ticket validator further along (x ≈ 24).

const ochre = ["#e8b88a", "#d9a066", "#efc9a0", "#e2a77a", "#f0d2a8", "#d99a6c"];
const signs = ["Farmacia", "Gelateria", null, "Tabacchi", "Pizza al taglio", null, "Edicola", null];

const items = [];
for (let x = -40; x <= 40; x += 10) items.push({ model: "roads/road-straight", p: [x, 6] });
items.push({ prop: "slab", args: [80, 8, 0.16, "#d8cdb9"], p: [0, -3] });
for (let i = 0; i < 12; i++) {
  if (i >= 5 && i <= 7) continue; // the bar takes this stretch
  items.push({ prop: "shopFront", args: [ochre[i % 6], 3, 5.6, signs[i % signs.length]], p: [-33 + i * 5.8, -10], fade: true });
}
items.push(
  // the bar: back wall, counter, espresso machine
  { prop: "shopFront", args: ["#c96b3a", 3, 15, "Bar Sport · Caffè"], p: [0, -10], fade: true },
  { prop: "espressoBar", args: ["Caffè"], p: [0, -5.3] },
  { npc: "character-male-a", p: [0.6, -6.3], r: 0, id: "barista" },
  { npc: "character-male-c", p: [-1.8, -4.5], r: 180 },
  { npc: "character-female-b", p: [1.9, -4.5], r: 180 },
  // the cassa (cashier), left of the bar
  { prop: "cashRegister", p: [-7, -4.6], r: 0 },
  { prop: "signBoard", args: [["CASSA"], { w: 1.4, h: 0.45, color: "#14306b", fg: "#fff" }], p: [-7, -4.1], y: 1.7, collide: false },
  { npc: "character-female-d", p: [-7, -5.7], r: 0, id: "cashier" },
  // terrace tables
  { prop: "cafeTable", args: ["#c96b3a"], p: [9, -1.5] },
  { prop: "cafeTable", args: ["#c96b3a"], p: [13, -1.5] },
  { prop: "signBoard", args: [["Servizio al tavolo ☂"], { w: 2.4, h: 0.5, color: "#ffffff", fg: "#c1121f" }], p: [11, -3.2], y: 1.1, collide: false },
  { npc: "character-male-d", p: [9.8, -1.5], r: 270, anim: "sit", y: 0.25, collide: false },
  { prop: "plant", p: [-12, -3.5] },
  { prop: "tree", p: [-30, -5.5] },
  // the bus stop
  { prop: "busShelter", p: [26, -4.6] },
  { prop: "cityBus", args: ["64", "Termini", "#f28c28"], p: [36, 7.2], r: 90 },
  { prop: "wall", args: [0.45, 0.3, 1.3, "#f2c200"], p: [31.2, -0.7] }, // ticket validator on a post
  { prop: "signBoard", args: [["Convalida · Validate"], { w: 1.8, h: 0.4, color: "#ffffff", fg: "#14306b" }], p: [31.2, -1.0], y: 1.4, collide: false },
  { npc: "character-female-c", p: [24.4, -1.8], r: 90 },
  { npc: "character-male-e", p: [28, -0.2], r: 90 }
);

export default {
  sky: "#cfe8ff",
  fog: [50, 150],
  grounds: [{ size: [100, 40], p: [0, 0], color: "#c9bfa8" }],
  spawns: { start: [-24, 0.6, 90], bus: [26, 0.6, 90] },
  items,
  walls: [
    [-43, -8, 43, -7.6],
    [-43, 11, 43, 11.4],
    [-43.4, -8, -43, 11.4],
    [43, -8, 43.4, 11.4],
  ],
  interactables: [
    { id: "cassa", p: [-7, -2.4], radius: 1.9, tag: "Cassa 💶", tagY: 2.4, label: { en: "Pay at the cassa first", vi: "Trả tiền ở cassa trước" } },
    { id: "banco", p: [0, -2.6], radius: 2.6, tag: "Al banco ☕", tagY: 2.6, label: { en: "Go to the counter (banco)", vi: "Ra quầy bar (banco)" } },
    { id: "tavolo", p: [11, 0.6], radius: 2.2, tag: "Al tavolo 🪑", tagY: 2.3, label: { en: "Sit at a terrace table", vi: "Ngồi ở bàn ngoài hiên" } },
    { id: "validator", p: [31.2, 1.2], radius: 1.8, tag: "Convalida 🎫", tagY: 2.2, label: { en: "Validate your bus ticket", vi: "Bấm xác nhận vé xe buýt" } },
    {
      id: "barista",
      p: [0.6, -3.3],
      radius: 1.6,
      label: { en: "Talk to the barista", vi: "Nói chuyện với barista" },
      speaker: { en: "Barista", vi: "Barista" },
      icon: "👨‍🍳",
      say: {
        en: "Prego! First the cassa, signore. I only make the coffee: no receipt, no coffee. Rules are rules (but the coffee is perfect).",
        vi: "Prego! Trước tiên là cassa nhé. Tôi chỉ pha cà phê: không có hoá đơn thì không có cà phê. Luật là luật (nhưng cà phê thì hoàn hảo).",
      },
    },
  ],
};
