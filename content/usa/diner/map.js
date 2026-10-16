// USA: a classic roadside diner. Entrance + host stand at the south (z ≈ 6), booths along both walls,
// the counter with stools at the back and the cash register by the door.

const items = [];
items.push(
  { prop: "slab", args: [34, 20, 0.05, "#efe7d6"], p: [0, -1] },
  { prop: "wall", args: [34, 0.4, 5, "#2a9d8f"], p: [0, -11] },
  { prop: "wall", args: [0.4, 20, 5, "#f4e9d4"], p: [-17, -1] },
  { prop: "wall", args: [0.4, 20, 5, "#f4e9d4"], p: [17, -1] },
  { prop: "wall", args: [34, 0.3, 1.3, "#d6221f"], p: [0, -10.7] }, // red stripe along the back wall
  { prop: "signBoard", args: [["DINER · OPEN 24 HRS"], { w: 6.4, h: 0.9, color: "#14306b", fg: "#ff5d8f" }], p: [0, -10.7], y: 3.3, collide: false },
  { prop: "signBoard", args: [["Free refills · Pie of the day"], { w: 4.6, h: 0.6, color: "#fff4d6", fg: "#d6221f" }], p: [-10, -10.7], y: 2.4, collide: false },
  { prop: "signBoard", args: [["Burger $12.99 + tax"], { w: 3.6, h: 0.6, color: "#fff4d6", fg: "#222" }], p: [10, -10.7], y: 2.4, collide: false },
  { prop: "barCounter", args: ["", { length: 10, color: "#d6221f" }], p: [0, -6] },
  { npc: "character-male-d", p: [3, -7.0], r: 0, id: "cook" },
  { npc: "character-female-b", p: [-4, -3.5], r: 180, id: "waitress" },
  { prop: "plant", p: [-15.5, 5] },
  { prop: "plant", p: [15.5, 5] }
);
// stools at the counter
for (let i = 0; i < 6; i++) items.push({ prop: "plasticStool", args: ["#d6221f"], p: [-4.5 + i * 1.8, -4.4], s: 1.5, collide: false });
items.push(
  { npc: "character-male-e", p: [-2.7, -4.4], r: 180, anim: "sit", y: 0.35, collide: false },
  { npc: "character-female-e", p: [2.7, -4.4], r: 180, anim: "sit", y: 0.35, collide: false }
);
// booths: left wall (3), right wall (3). Ours is the right-hand one nearest the door.
for (const z of [-3, 0.5, 4]) {
  items.push({ prop: "dinerBooth", args: ["#2a9d8f"], p: [-12, z], collide: true });
  items.push({ prop: "dinerBooth", args: [z === 4 ? "#ff8fab" : "#d6221f"], p: [12, z], collide: true, id: z === 4 ? "ourBooth" : undefined });
}
items.push(
  { npc: "character-male-b", p: [-13.1, -3], r: 90, anim: "sit", y: 0.25, collide: false },
  { npc: "character-female-d", p: [-10.9, 0.5], r: 270, anim: "sit", y: 0.25, collide: false },
  { npc: "character-male-c", p: [13.1, -3], r: 270, anim: "sit", y: 0.25, collide: false },
  // host stand and register by the door
  { prop: "wall", args: [1.2, 0.8, 1.1, "#8a5a3b"], p: [0, 5.2] },
  { prop: "signBoard", args: [["PLEASE WAIT TO BE SEATED"], { w: 2.4, h: 0.55, color: "#ffffff", fg: "#d6221f" }], p: [0, 5.0], y: 1.15, collide: false },
  { prop: "cashRegister", p: [-9, 6.2], r: 180 },
  { prop: "signBoard", args: [["Pay here"], { w: 1.4, h: 0.4, color: "#ffd23f", fg: "#222" }], p: [-9, 5.7], y: 1.6, collide: false }
);

export default {
  sky: "#ffe9d6",
  fog: [50, 150],
  grounds: [{ size: [60, 40], p: [0, 0], color: "#c9b896" }],
  spawns: { start: [0, 8.2, 180] },
  items,
  walls: [
    [-17, -11.5, 17, -11],
    [-17, 8.6, 17, 9],
    [-17.3, -11.5, -16.9, 9],
    [16.9, -11.5, 17.3, 9],
  ],
  interactables: [
    { id: "host", p: [0, 6.6], radius: 2.0, tag: "Host stand 🧑‍🍳", tagY: 2.0, label: { en: "Check in at the host stand", vi: "Báo tên ở quầy đón khách" } },
    { id: "booth", p: [12, 6.2], radius: 2.2, tag: "Your booth 🛋️", tagY: 2.2, label: { en: "Sit in your booth", vi: "Ngồi vào bàn của bạn" } },
    { id: "register", p: [-9, 7.4], radius: 1.8, tag: "Register 💵", tagY: 2.0, label: { en: "Pay at the register", vi: "Thanh toán ở quầy" } },
    {
      id: "waitress",
      p: [-4, -2.3],
      radius: 1.8,
      label: { en: "Talk to the waitress", vi: "Nói chuyện với phục vụ" },
      speaker: { en: "Waitress Dana", vi: "Phục vụ Dana" },
      icon: "👩‍🍳",
      say: {
        en: "Hi hon! I'll be right with ya. Coffee? Free refills!",
        vi: "Chào cưng! Tôi qua liền. Cà phê không? Được thêm miễn phí!",
      },
    },
  ],
};
