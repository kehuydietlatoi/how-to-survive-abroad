// Amsterdam: canal quay, red bike lane, tram rails. Start is at the west end (x = -30); bike shop at x = -26,
// a shady "bike dealer" by the bridge at x = 6, the bike rack at x = -8 and the tram crossing at x = 24.

const brick = ["#9c5a45", "#b5654a", "#7d4a3a", "#c4875f", "#a3523e", "#8c5b46"];
const items = [];
items.push(
  // canal + quay + canal houses across the water
  { prop: "slab", args: [90, 9, 0.02, "#6ec1e4"], p: [0, -13] },
  { prop: "wall", args: [90, 0.7, 0.5, "#9a8f84"], p: [0, -8.2], collide: false },
  { prop: "slab", args: [90, 4.4, 0.14, "#cfc8bd"], p: [0, -5.4] },
  { prop: "slab", args: [90, 3.2, 0.06, "#c9514a"], p: [0, -1.5] }, // the red bike lane
  { prop: "slab", args: [90, 1.4, 0.12, "#bfb7aa"], p: [0, 1.5] },
  { model: "roads/road-straight", p: [-40, 6] },
  { model: "roads/road-straight", p: [-30, 6] },
  { model: "roads/road-straight", p: [-20, 6] },
  { model: "roads/road-straight", p: [-10, 6] },
  { model: "roads/road-straight", p: [0, 6] },
  { model: "roads/road-straight", p: [10, 6] },
  { model: "roads/road-straight", p: [20, 6] },
  { model: "roads/road-straight", p: [30, 6] },
  { model: "roads/road-straight", p: [40, 6] },
  { prop: "track", args: [90], p: [0, 6], r: 90, collide: false },
  { prop: "sbahnTrain", args: [14, "Tram 24 · Centraal", "#1f5fbf"], p: [-24, 7.6], r: 90, fade: true },
  { prop: "tree", p: [-18, -7] },
  { prop: "tree", p: [14, -7] },
  { prop: "lamp", p: [-2, -7] },
  { prop: "lamp", p: [30, -7] },
  { prop: "wall", args: [3.2, 0.5, 0.5, "#8d6e63"], p: [2, -7.4], collide: false }
);
for (let i = 0; i < 12; i++) items.push({ prop: "tubeHouse", args: [brick[i % 6], 3, 4.6, null], p: [-40 + i * 5.2, -24], collide: false });

// bike shop
items.push(
  { prop: "building", args: [7, 3.4, 4, "#fff4d6", "Fietsenwinkel 🚲", "#1d3557"], p: [-26, -6.4], collide: true },
  { prop: "bicycle", args: ["#d6221f"], p: [-23, -3.9], r: 90, collide: false },
  { prop: "bicycle", args: ["#2a9d8f"], p: [-22, -3.9], r: 90, collide: false },
  { npc: "character-male-d", p: [-26, -3.8], r: 180, id: "shop" }
);
// the rack by the quay (fixed railing)
items.push(
  { prop: "wall", args: [8, 0.12, 0.95, "#8a8f9c"], p: [-8, -7.5], collide: false },
  { prop: "bicycle", args: ["#264653"], p: [-11, -6.6], r: 0, collide: false },
  { prop: "bicycle", args: ["#e9c46a"], p: [-9.6, -6.6], r: 0, collide: false },
  { prop: "bicycle", args: ["#e76f51"], p: [-8.2, -6.6], r: 0, collide: false },
  { prop: "bicycle", args: ["#8ab17d"], p: [-6.8, -6.6], r: 0, collide: false },
  { prop: "signBoard", args: [["Fietsen hier stallen 🚲"], { w: 2.6, h: 0.5, color: "#ffffff", fg: "#c9514a" }], p: [-8, -8.3], y: 0.8, collide: false }
);
// the shady "dealer" on the bridge and some tourists in the bike lane
items.push(
  { npc: "character-male-b", p: [6, -4.2], r: 90, id: "dealer" },
  { prop: "bicycle", args: ["#111111"], p: [7.4, -4.2], r: 0, collide: false },
  { npc: "character-female-e", p: [16, -1.5], r: 90, anim: "idle", id: "photoTourist" },
  { npc: "character-male-e", p: [18.6, -2.2], r: 180, anim: "idle" },
  { npc: "character-female-c", p: [30, -3.5], r: 270, anim: "walk" }
);

export default {
  sky: "#cfe3f2",
  fog: [55, 160],
  grounds: [{ size: [100, 50], p: [0, -4], color: "#b5ad9f" }],
  spawns: { start: [-34, -4.4, 90], lane: [10, -1.6, 90] },
  items,
  walls: [
    [-43, -8, 43, -7.6],
    [-43, 9.6, 43, 10],
    [-43.4, -8, -43, 10],
    [43, -8, 43.4, 10],
    [-43, 4.6, 43, 7.6, "rails"], // keep the player off the tram road
  ],
  interactables: [
    { id: "dealer", p: [6, -2.6], radius: 2.0, tag: "“Psst… bike?” 🤫", tagY: 2.6, label: { en: "Listen to the man by the bridge", vi: "Nghe người đàn ông cạnh cây cầu" } },
    { id: "bikeShop", p: [-26, -2.6], radius: 2.2, tag: "Fietsenwinkel 🚲", tagY: 3.6, label: { en: "Go to the bike shop", vi: "Vào cửa hàng xe đạp" } },
    { id: "rack", p: [-8, -5.2], radius: 2.4, tag: "Bike rack 🔒", tagY: 2.0, label: { en: "Park your bike", vi: "Gửi xe đạp" } },
    { id: "photo", p: [16, -2.3], radius: 1.8, tag: "Photo spot 📸", tagY: 2.4, label: { en: "Take a photo of the canal", vi: "Chụp ảnh kênh đào" } },
    {
      id: "tramStop",
      p: [24, 2.8],
      radius: 2.0,
      label: { en: "Look at the tram tracks", vi: "Nhìn đường ray tàu điện" },
      speaker: { en: "You", vi: "Bạn" },
      icon: "🚋",
      say: {
        en: "Tram rails: perfect for catching a narrow bike wheel. Remember: **cross them at a right angle**, never along them. Trams always have priority.",
        vi: "Đường ray tàu điện: rất dễ kẹt bánh xe đạp hẹp. Hãy nhớ: **cắt ngang chúng ở góc vuông**, đừng đi dọc theo. Tàu điện luôn được ưu tiên.",
      },
    },
  ],
};
