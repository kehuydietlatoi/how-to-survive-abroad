// A typical German city trip, built as four small zones on one map:
//   A  airport arrivals hall + S-Bahn platform   (around x = 0)
//   T  inside the S-Bahn                          (x = -100)
//   B  Hauptbahnhof forecourt + bus stops         (x = 100)
//   C  Lindenstraße, your new home               (x = 200)
// City and stop names are fictional; the rules are the common German ones.

const items = [];
const walls = [];

// ------------------------------------------------------------------ A: airport
items.push(
  { prop: "slab", args: [28, 18, 0.05, "#eef1f5"], p: [-2, 1] }, // hall floor
  { prop: "wall", args: [14, 0.4, 4.5, "#d7dde6"], p: [-9, -8] },
  { prop: "wall", args: [10, 0.4, 4.5, "#d7dde6"], p: [7, -8] },
  { prop: "wall", args: [0.4, 18, 4.5, "#d7dde6"], p: [-16, 1] },
  { prop: "wall", args: [0.4, 18, 4.5, "#d7dde6"], p: [12, 1] },
  { prop: "wall", args: [28, 0.3, 1.1, "#bfe6ff", 0.45], p: [-2, 10] }, // low glass front
  { prop: "arrivalGate", args: ["Ankunft · Arrivals  ✈"], p: [-10, 9.3], r: 180, fade: true },
  { prop: "infoDesk", p: [-6, 0], r: 0 },
  { npc: "character-female-c", p: [-6, -0.9], r: 0, id: "infoAgent", collide: false },
  { prop: "ticketMachine", p: [5, -7.4], r: 0 },
  { prop: "ticketMachine", p: [6.6, -7.4], r: 0 },
  { prop: "signBoard", args: [["Außer Betrieb"], { w: 0.9, h: 0.3, color: "#ffffff", fg: "#e2231a" }], p: [6.6, -7.05], y: 1.2, collide: false },
  { prop: "validator", p: [2.6, -7.2], r: 0 },
  { prop: "signPost", args: [[{ text: "S  S-Bahn ↑  Gleis 1–2", size: 80 }], { height: 3.4, w: 3.4, h: 0.6, color: "#3aa04a", fg: "#ffffff" }], p: [-3.2, -7.4], collide: false },
  { prop: "signPost", args: [[{ text: "🎫 Fahrkarten · Tickets", size: 70 }], { height: 3.4, w: 2.8, h: 0.55, color: "#14306b", fg: "#ffffff" }], p: [8.8, -7.4], collide: false },
  { prop: "bench", p: [-12, -3], r: 90 },
  { prop: "bench", p: [-12, 2], r: 90 },
  { prop: "plant", p: [10.8, 8.6] },
  { prop: "plant", p: [-14.8, -6.8] },
  { prop: "plant", p: [10.8, -6.8] },
  { prop: "suitcase", args: ["#ff8fab"], p: [-9.4, 6.8], collide: false },
  { npc: "character-male-b", p: [-11.6, -3], r: 90, anim: "sit", y: 0.05, collide: false },
  { npc: "character-female-f", p: [3, 3], r: 200 },
  { npc: "character-male-d", p: [-2, 6], r: 140, anim: "emote-yes" }
);
walls.push([-16, 10, 12, 10.6]); // glass front collision

// Platform (island between two tracks) north of the hall opening.
items.push(
  { prop: "slab", args: [4.4, 28, 0.1, "#cfd6e0"], p: [0, -22] },
  { prop: "slab", args: [4.4, 0.25, 0.11, "#ffffff"], p: [0, -8.2] },
  { prop: "track", args: [28], p: [4.6, -22.2] },
  { prop: "track", args: [28], p: [-4.6, -22.2] },
  { prop: "sbahnTrain", args: [18, "S8  Hauptbahnhof"], p: [4.6, -22], id: "train1" },
  { prop: "sbahnTrain", args: [18, "S8  Rheinhafen"], p: [-4.6, -22], id: "train2" },
  {
    prop: "departureBoard",
    args: [["Gl. 1   S8 → Hauptbahnhof    14:32", "Gl. 2   S8 → Rheinhafen        14:35"]],
    p: [0, -11.5],
    collide: false,
  },
  { prop: "signPost", args: [[{ text: "Gleis 1 →", size: 90 }], { height: 2.6, w: 1.6, h: 0.5, color: "#14306b", fg: "#fff" }], p: [1.6, -14.5], r: -90, collide: false },
  { prop: "signPost", args: [[{ text: "← Gleis 2", size: 90 }], { height: 2.6, w: 1.6, h: 0.5, color: "#14306b", fg: "#fff" }], p: [-1.6, -14.5], r: 90, collide: false },
  { npc: "character-female-e", p: [-1, -26], r: 30 },
  { npc: "character-male-e", p: [1.2, -18], r: 180 }
);
walls.push(
  [-2.3, -36, -2.2, -8], // platform edges
  [2.2, -36, 2.3, -8],
  [-2.3, -36.2, 2.3, -36]
);

// ------------------------------------------------------------------ T: inside the S-Bahn
items.push(
  { prop: "trainInterior", args: [16], p: [-100, 0] },
  { npc: "character-male-a", p: [-100.3, 0.6], r: 0, id: "inspector" },
  { npc: "character-female-e", p: [-101.15, -3.1], r: 0, anim: "sit", y: 0.25, collide: false },
  { npc: "character-male-f", p: [-98.85, 3.9], r: 0, anim: "sit", y: 0.25, collide: false }
);
walls.push([-102, -8, -101.7, 8], [-98.3, -8, -98, 8], [-102, -8, -98, -7.8], [-102, 7.8, -98, 8]);

// ------------------------------------------------------------------ B: Hauptbahnhof
items.push(
  { prop: "slab", args: [44, 7.2, 0.16, "#dcd6cc"], p: [100, -7.1] },
  { prop: "wall", args: [34, 6, 9, "#e9d8c3"], p: [100, -15] },
  { prop: "signBoard", args: [[{ text: "Hauptbahnhof", size: 110 }], { w: 9, h: 1.3, color: "#14306b", fg: "#ffffff" }], p: [100, -11.9], y: 6, collide: false },
  { prop: "wall", args: [6, 0.4, 4, "#8fb4d9"], p: [100, -11.9] }, // entrance glass
  { prop: "busShelter", p: [93, -8.2], r: 0 },
  { prop: "busStopSign", args: ["34", "Lindenstraße"], p: [94.8, -4.4] },
  { prop: "busShelter", p: [107, -8.2], r: 0 },
  { prop: "busStopSign", args: ["12", "Messe"], p: [108.8, -4.4] },
  { prop: "cityBus", args: ["34", "Lindenstraße"], p: [60, -1.3], r: 90, id: "bus34", collide: false, hidden: true },
  { prop: "lamp", p: [86, -4.2] },
  { prop: "lamp", p: [114, -4.2] },
  { prop: "tree", p: [83, -8] },
  { prop: "tree", p: [117, -8] },
  { model: "cars/taxi", p: [88, 4.2], r: 90 },
  { model: "cars/sedan", p: [112, 4.2], r: -90 },
  { npc: "character-female-d", p: [92.5, -8.4], r: 0, anim: "sit", y: 0.42, collide: false },
  { npc: "character-male-c", p: [107.6, -6.4], r: 200 },
  { npc: "character-female-b", p: [103.5, -9.6], r: 10 }
);
for (let x = 70; x <= 130; x += 10) items.push({ model: "roads/road-straight", p: [x, 1.5] });
walls.push([78, -3.4, 122, 12], [78, -12, 78.5, -3], [121.5, -12, 122, -3]);

// ------------------------------------------------------------------ C: Lindenstraße
items.push(
  { prop: "slab", args: [44, 6, 0.16, "#dcd6cc"], p: [200, -6.5] },
  { prop: "slab", args: [44, 10, 0.05, "#9fd38a"], p: [200, -14.2] },
  { model: "suburban/building-type-c", p: [188, -14], tint: "#ffe3c7" },
  { model: "suburban/building-type-a", p: [200, -14], tint: "#fff3d6", id: "home" },
  { model: "suburban/building-type-f", p: [212, -14], tint: "#e3f0ff" },
  { model: "suburban/fence-1x4", p: [194, -9.8] },
  { model: "suburban/fence-1x4", p: [206, -9.8] },
  { model: "suburban/tree-large", p: [183, -9.8] },
  { model: "suburban/tree-small", p: [217, -9.8] },
  { prop: "busStopSign", args: ["34", "Lindenstraße"], p: [192, -3.9] },
  { prop: "signBoard", args: [["Lindenstraße 12"], { w: 1.6, h: 0.4, color: "#1f5fbf", fg: "#fff" }], p: [201.4, -9.6], y: 1.4, collide: false },
  { prop: "suitcase", args: ["#ff8fab"], p: [199, -8.4], collide: false, id: "homeSuitcase", hidden: true },
  { npc: "character-female-d", p: [204, -7], r: 200, anim: "emote-yes", id: "neighbour" }
);
for (let x = 170; x <= 230; x += 10) items.push({ model: "roads/road-straight", p: [x, 0.5] });
walls.push([178, -3.6, 222, 12], [178, -20, 178.5, -3], [221.5, -20, 222, -3], [178, -20, 222, -19.5]);

export default {
  sky: "#cfe8ff",
  fog: [45, 140],
  grounds: [
    { size: [80, 70], p: [-2, -10], color: "#cbd5c0" },
    { size: [30, 30], p: [-100, 0], color: "#5f6b7a" },
    { size: [80, 50], p: [100, 0], color: "#c9cfc2" },
    { size: [80, 50], p: [200, 0], color: "#b9dca3" },
  ],
  spawns: {
    start: [-10, 6, 180],
    inTrain: [-100, 2.2, 180],
    hbf: [100, -8, 0],
    home: [192, -5, 90],
  },
  items,
  walls,
  interactables: [
    {
      id: "infoDesk",
      p: [-6, 1.3],
      radius: 1.8,
      label: { en: "Ask at the info desk", vi: "Hỏi quầy thông tin" },
      speaker: { en: "Info desk", vi: "Quầy thông tin" },
      icon: "ℹ️",
      say: {
        en: "Guten Tag! Tickets for the S-Bahn are sold at the **red DB ticket machines** at the back of the hall, next to the S-Bahn sign. The trains leave from **Gleis 1–2**.",
        vi: "Guten Tag! Vé S-Bahn được bán ở **máy bán vé màu đỏ của DB** cuối sảnh, cạnh biển S-Bahn. Tàu chạy từ **Gleis (sân ga) 1–2**.",
      },
    },
    { id: "ticketMachine", p: [5, -6.4], radius: 1.2, tag: "Fahrkarten 🎫", tagY: 2.6, label: { en: "Use ticket machine", vi: "Dùng máy bán vé" } },
    {
      id: "brokenMachine",
      p: [6.6, -6.4],
      radius: 0.9,
      label: { en: "Use ticket machine", vi: "Dùng máy bán vé" },
      icon: "🚫",
      say: { en: "**Außer Betrieb** means *out of order*. Try the machine next to it.", vi: "**Außer Betrieb** nghĩa là *hỏng / ngừng hoạt động*. Thử máy bên cạnh nhé." },
    },
    {
      id: "validator",
      p: [2.6, -6.4],
      tag: "Entwerter",
      tagY: 1.9,
      radius: 1.1,
      label: { en: "Stamp ticket (Entwerter)", vi: "Dập vé (Entwerter)" },
      icon: "🟨",
      say: { en: "An **Entwerter** (ticket validator). It prints date and time on tickets that need validating.", vi: "**Entwerter** (máy dập vé): in ngày giờ lên những vé cần dập." },
    },
    {
      id: "board",
      p: [0, -10.6],
      radius: 1.6,
      label: { en: "Read departure board", vi: "Xem bảng giờ tàu" },
      icon: "🕑",
      say: {
        en: "**Abfahrt** (departures):\nGleis 1 · S8 → **Hauptbahnhof** · 14:32\nGleis 2 · S8 → Rheinhafen · 14:35\nSame line, **opposite directions**. The end station tells you the direction (**Richtung**).",
        vi: "**Abfahrt** (giờ khởi hành):\nGleis 1 · S8 → **Hauptbahnhof** · 14:32\nGleis 2 · S8 → Rheinhafen · 14:35\nCùng tuyến, **ngược chiều nhau**. Ga cuối cho biết hướng đi (**Richtung**).",
      },
      markerY: 4,
    },
    { id: "train1Door", p: [2.0, -17.5], radius: 1.4, tag: "S8 → Hauptbahnhof", tagY: 3.6, label: { en: "Board train (Gleis 1)", vi: "Lên tàu (Gleis 1)" } },
    { id: "train2Door", p: [-2.0, -17.5], radius: 1.4, tag: "S8 → Rheinhafen", tagY: 3.6, label: { en: "Board train (Gleis 2)", vi: "Lên tàu (Gleis 2)" } },
    { id: "stop34", p: [94.8, -5.2], radius: 1.6, tag: "🚏 34 · Lindenstraße", label: { en: "Wait at this stop", vi: "Đợi ở trạm này" } },
    { id: "stop12", p: [108.8, -5.2], radius: 1.6, tag: "🚏 12 · Messe", label: { en: "Wait at this stop", vi: "Đợi ở trạm này" } },
    { id: "homeDoor", p: [199.6, -8.4], radius: 1.6, tag: "Lindenstraße 12", tagY: 2.4, label: { en: "Ring the doorbell", vi: "Bấm chuông cửa" }, markerY: 3.5 },
  ],
};
