// Start at Lindenstraße 12 (x = 0), then the Bürgeramt waiting hall (x = 100).
import { lindenstrasse } from "../lindenstrasse.js";

const street = lindenstrasse(0, { bins: true, variant: "altbau" });
const H = 100; // hall centre x

const items = [...street.items];
// --- Bürgeramt hall ---------------------------------------------------------------
items.push(
  { prop: "slab", args: [30, 21, 0.05, "#eef1f5"], p: [H, -3.5] },
  { prop: "wall", args: [30, 0.4, 4.5, "#d7dde6"], p: [H, -14] },
  { prop: "wall", args: [0.4, 21, 4.5, "#d7dde6"], p: [H - 15, -3.5] },
  { prop: "wall", args: [0.4, 21, 4.5, "#d7dde6"], p: [H + 15, -3.5] },
  { prop: "wall", args: [30, 0.3, 1.1, "#bfe6ff", 0.45], p: [H, 7] },
  { prop: "signBoard", args: [["Bürgeramt · Bürgerservice"], { w: 8, h: 0.9, color: "#1f5fbf", fg: "#fff" }], p: [H, -13.75], y: 3.2, collide: false },
  { prop: "numberBoard", args: [["A-112 → Platz 3", "B-031 → Platz 6", "A-111 → Platz 1"]], p: [H, -6.2], collide: false },
  { prop: "ticketTerminal", p: [H - 9, 4.5], r: 0 },
  { prop: "chairs", args: [5, "#4da3ff"], p: [H - 5, 0.5], r: 180 },
  { prop: "chairs", args: [5, "#4da3ff"], p: [H + 5, 0.5], r: 180 },
  { prop: "chairs", args: [5, "#ff8fab"], p: [H - 5, 3], r: 180 },
  { prop: "chairs", args: [5, "#ff8fab"], p: [H + 5, 3], r: 180 },
  { prop: "plant", p: [H - 13.8, -12.8] },
  { prop: "plant", p: [H + 13.8, -12.8] },
  { prop: "plant", p: [H + 13.8, 5.8] },
  { npc: "character-male-b", p: [H - 6.4, 0.3], r: 180, anim: "sit", y: 0.25, collide: false },
  { npc: "character-female-e", p: [H + 3.6, 2.8], r: 180, anim: "sit", y: 0.25, collide: false },
  { npc: "character-male-e", p: [H + 6.4, 0.3], r: 180, anim: "sit", y: 0.25, collide: false },
  { npc: "character-female-f", p: [H - 3.5, -9.2], r: 180 }
);
const clerks = ["character-female-c", "character-male-a", "character-female-b", "character-male-c", "character-female-d", "character-male-d"];
for (let i = 0; i < 6; i++) {
  const x = H - 12 + i * 4.8;
  items.push({ prop: "serviceCounter", args: [i + 1], p: [x, -11] });
  items.push({ npc: clerks[i], p: [x, -12.2], r: 0, id: `clerk${i + 1}` });
}

// Looping visits from the front of the chair rows to counters 2 and 5. These are
// ambient appointments; Platz 4 and the player's check-in route remain clear.
for (const [i, path] of [
  [[-5, -0.7], [-7.2, -2.5], [-7.2, -9.65], [-9.5, -7.8], [-9.5, -1.4]],
  [[5, -0.7], [7.2, -2.5], [7.2, -9.65], [10, -7.8], [10, -1.4]],
].entries()) items.push({
  npc: ["character-female-a", "character-male-f"][i], id: `appointmentVisitor${i}`,
  path: path.map(([x, z]) => [H + x, z]), speed: 0.95 + i * 0.12,
  loop: true, pause: [1, 2.2], collide: false,
});

// Side aisles and the open space between chairs and board provide people-watching
// during the call-board wait. Path followers switch to idle at stops, never moonwalk.
for (const [i, path] of [
  [[-11.2, 3], [-11.2, -5], [-10.2, -5], [-10.2, 3]],
  [[10.5, 4.5], [10.5, -6.5], [11.7, -6.5], [11.7, 4.5]],
  [[-2.1, -2.5], [2.1, -2.5], [2.1, -4.6], [-2.1, -4.6]],
].entries()) items.push({
  npc: ["character-female-d", "character-male-c", "character-female-b"][i], id: `hallWalker${i}`,
  path: path.map(([x, z]) => [H + x, z]), speed: 0.85 + i * 0.1,
  loop: true, pause: [0.3, 0.8], collide: false,
});

export default {
  sky: "#cfe8ff",
  fog: [45, 140],
  camera: { height: 5.5, distance: 14, aim: 3, fov: 44 },
  grounds: [
    { size: [80, 50], p: [0, -4], color: "#b9dca3" },
    { size: [50, 40], p: [H, -3], color: "#c9cfc2" },
  ],
  spawns: { start: street.spawns.home, hall: [H, 5.5, 180] },
  items,
  traffic: street.traffic,
  walls: [...street.walls, [H - 15, 6.8, H + 15, 7.4]],
  interactables: [
    {
      id: "landlady",
      p: street.landlady.p,
      radius: 1.8,
      label: { en: "Talk to Frau Becker", vi: "Nói chuyện với bà Becker" },
      speaker: { en: "Frau Becker (landlady)", vi: "Bà Becker (chủ nhà)" },
      icon: "👵",
      say: { en: "Don't forget the form I signed for you, the Wohnungsgeberbestätigung!", vi: "Đừng quên tờ giấy tôi đã ký cho bạn, Wohnungsgeberbestätigung nhé!" },
    },
    { id: "terminal", p: [H - 9, 5.4], radius: 1.5, tag: "Wartenummer 🎫", tagY: 2.2, label: { en: "Check in with your appointment", vi: "Check-in bằng lịch hẹn" } },
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `counter${i + 1}`,
      p: [H - 12 + i * 4.8, -9.8],
      radius: 1.6,
      tag: `Platz ${i + 1}`,
      tagY: 3.2,
      label: { en: `Go to Platz ${i + 1}`, vi: `Đến quầy ${i + 1}` },
    })),
  ],
};
