// Delhi market street: auto-rickshaw stand (x ≈ -26), a cow in the road (x ≈ 2) and a chai stall (x ≈ 24).
// Road runs along x at z 0..10, shops and pavement are to the north (z < 0).

const signs = ["मिठाई · Sweets", null, "Saree · साड़ी", "Mobile 📱", null, "चाय · Chai", "Spices · मसाले", null, "Books", "Jewellers"];
const colors = ["#ffd166", "#ef8354", "#a8e6cf", "#f4a6c1", "#9ad1f5", "#fff3b0", "#c3b1e1", "#ffb385"];

const items = [];
for (let x = -40; x <= 40; x += 10) items.push({ model: "roads/road-straight", p: [x, 5] });
items.push(
  { prop: "slab", args: [86, 7, 0.16, "#d9cdb5"], p: [0, -3.5] },
  { prop: "cableTangle", args: [40], p: [-20, -1.5] },
  { prop: "cableTangle", args: [40], p: [20, -1.5] },
  { prop: "utilityPole", p: [-8, -0.6] },
  { prop: "utilityPole", p: [14, -0.6] }
);
for (let i = 0; i < 14; i++) {
  items.push({ prop: "shopFront", args: [colors[i % 8], 2 + (i % 2), 5.6, signs[i % signs.length]], p: [-38 + i * 5.8, -10], fade: true });
}
// auto-rickshaw stand: yellow-and-green autos waiting at the kerb
items.push(
  { prop: "rickshaw", args: ["#2e9e4f", "AUTO"], p: [-30, 2.2], r: 90, collide: false },
  { prop: "rickshaw", args: ["#2e9e4f", "AUTO"], p: [-26, 2.2], r: 90, collide: false },
  { prop: "rickshaw", args: ["#2e9e4f", "AUTO"], p: [-22, 2.2], r: 90, collide: false },
  { npc: "character-male-c", p: [-26.2, -0.4], r: 180, id: "driver" },
  { npc: "character-male-f", p: [-29, -0.2], r: 160, anim: "idle" },
  { prop: "signBoard", args: [["Auto Stand · ऑटो स्टैंड"], { w: 3, h: 0.5, color: "#2e9e4f", fg: "#fff" }], p: [-26, -1.5], y: 1.8, collide: false }
);
// the truck with painted advice
items.push(
  { prop: "wall", args: [7, 2.8, 2.8, "#d6221f"], p: [-8, 8.2] },
  { prop: "wall", args: [2.4, 2.6, 2.2, "#f4a261"], p: [-12.4, 8.2] },
  { prop: "signBoard", args: [["HORN OK PLEASE 📯"], { w: 5, h: 0.7, color: "#ffd23f", fg: "#222" }], p: [-8, 9.62], y: 0.6, collide: false }
);
// the cow
items.push({ prop: "cow", p: [2, 5], r: 90, id: "cow" });
// chai stall
items.push(
  { prop: "vendorCart", p: [24, -2.2], r: 0 },
  { prop: "signBoard", args: [["चाय · Chai  ☕"], { w: 2.4, h: 0.6, color: "#fff4d6", fg: "#c1121f" }], p: [24, -2.9], y: 2.0, collide: false },
  { prop: "plasticStool", args: ["#ff6b6b"], p: [22.4, -0.9] },
  { prop: "plasticStool", args: ["#4da3ff"], p: [25.4, -0.9] },
  { npc: "character-male-d", p: [24, -3.6], r: 0, id: "chaiwala" },
  { npc: "character-female-a", p: [30, -2], r: 270, anim: "walk" },
  { npc: "character-male-b", p: [12, -2.5], r: 90, anim: "walk" }
);
items.push({ prop: "tree", p: [36, -6.5] }, { prop: "tree", p: [-40, -6.5] });

export default {
  sky: "#ffe7bf",
  fog: [55, 150],
  grounds: [{ size: [100, 40], p: [0, 0], color: "#cdbb98" }],
  spawns: { start: [-34, -1.4, 90], cow: [-8, -1.4, 90], chai: [14, -1.4, 90] },
  items,
  walls: [
    [-43, -8, 43, -7.6],
    [-43, 10.4, 43, 10.8],
    [-43.4, -8, -43, 10.8],
    [43, -8, 43.4, 10.8],
  ],
  interactables: [
    { id: "autoStand", p: [-26, 0.6], radius: 2.2, tag: "Auto 🛺", tagY: 2.6, label: { en: "Talk to the auto drivers", vi: "Nói chuyện với tài xế xe tuk-tuk" } },
    { id: "cow", p: [2, 2.8], radius: 2.4, tag: "Holy cow 🐄", tagY: 2.2, label: { en: "Look at the cow in the road", vi: "Nhìn con bò giữa đường" } },
    { id: "chai", p: [24, 0.2], radius: 2.0, tag: "Chai ☕", tagY: 3.0, label: { en: "Order a chai", vi: "Gọi một ly chai" } },
    {
      id: "truck",
      p: [-8, 6.2],
      radius: 2.6,
      label: { en: "Read the back of the truck", vi: "Đọc chữ phía sau xe tải" },
      speaker: { en: "You", vi: "Bạn" },
      icon: "🚛",
      say: {
        en: "“**HORN OK PLEASE**”: painted on trucks all over India. It means: honk to say you're overtaking. In Delhi the horn is punctuation, not anger.",
        vi: "“**HORN OK PLEASE**”: được sơn trên xe tải khắp Ấn Độ. Nghĩa là: bấm còi để báo bạn đang vượt. Ở Delhi, còi là dấu câu chứ không phải sự giận dữ.",
      },
    },
  ],
};
