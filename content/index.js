// Scenario registry shown on the menu. Each entry lazy-loads its map + script.
import { StreetCrossing } from "../src/minigames/StreetCrossing.js";
import { TicketMachine } from "../src/minigames/TicketMachine.js";
import { PhoEating } from "../src/minigames/PhoEating.js";

export const SCENARIOS = [
  {
    id: "germany-airport-to-home",
    country: "germany",
    flag: "🇩🇪",
    emoji: "🚆",
    color: "linear-gradient(135deg,#ffd6d6,#ffeaa7)",
    minutes: 6,
    title: { en: "From the airport to your new home", vi: "Từ sân bay về nhà mới" },
    desc: {
      en: "Buy the right ticket, validate it, find the right platform, survive a ticket check and catch your bus.",
      vi: "Mua đúng vé, dập vé, tìm đúng sân ga, vượt qua kiểm tra vé và bắt xe buýt.",
    },
    tags: [{ en: "Public transport", vi: "Giao thông công cộng" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./germany/airport-to-home/map.js"), import("./germany/airport-to-home/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { ticketMachine: TicketMachine } };
    },
  },
  {
    id: "vietnam-cross-street-pho",
    country: "vietnam",
    flag: "🇻🇳",
    emoji: "🍜",
    color: "linear-gradient(135deg,#ffe29a,#ffb3a7)",
    minutes: 4,
    title: { en: "Cross the street & eat phở", vi: "Băng qua đường & ăn phở" },
    desc: {
      en: "Walk through Hanoi's motorbike traffic like a local, then order, eat and pay at a street phở stall.",
      vi: "Băng qua dòng xe máy Hà Nội như người bản xứ, rồi gọi món, ăn và trả tiền ở quán phở vỉa hè.",
    },
    tags: [{ en: "Traffic", vi: "Giao thông" }, { en: "Street food", vi: "Ẩm thực đường phố" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./vietnam/cross-street-pho/map.js"), import("./vietnam/cross-street-pho/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { streetCrossing: StreetCrossing, phoEating: PhoEating }, minigameParams: { streetCrossing: { crossX: 0, roadZ: 0 } } };
    },
  },
];
