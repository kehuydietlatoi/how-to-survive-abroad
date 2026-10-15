// Lindenstraße 12: bin corner beside the house and the glass bank down the street.
import { lindenstrasse } from "../lindenstrasse.js";

const street = lindenstrasse(0, { bins: true, glass: true });

export default {
  sky: "#cfe8ff",
  fog: [45, 140],
  grounds: [{ size: [80, 50], p: [0, -4], color: "#b9dca3" }],
  spawns: { start: street.spawns.home, morning: [12, -6, 90] },
  items: [
    ...street.items,
    { prop: "suitcase", args: ["#8ecae6"], p: [1.5, -7.2], collide: false, id: "trashBag" },
    { npc: "character-male-f", p: [-12, -6], r: 90, anim: "walk" },
  ],
  walls: street.walls,
  interactables: [
    {
      id: "landlady",
      p: street.landlady.p,
      radius: 1.8,
      label: { en: "Talk to Frau Becker", vi: "Nói chuyện với bà Becker" },
      speaker: { en: "Frau Becker (landlady)", vi: "Bà Becker (chủ nhà)" },
      icon: "👵",
      say: {
        en: "The bins are right next to the house. Yellow for packaging, blue for paper, brown for food scraps, grey for the rest!",
        vi: "Thùng rác ở ngay cạnh nhà. Vàng cho bao bì, xanh dương cho giấy, nâu cho rác hữu cơ, xám cho phần còn lại!",
      },
    },
    { id: "bins", p: [6.8, -7.2], radius: 2.2, tag: "Mülltonnen 🗑️", tagY: 1.9, label: { en: "Sort your trash", vi: "Phân loại rác" } },
    { id: "glassBank", p: [17.8, -6.4], radius: 2.2, tag: "Altglas 🍾", tagY: 2.3, label: { en: "Use the glass bank", vi: "Bỏ chai lọ thuỷ tinh" } },
  ],
};
