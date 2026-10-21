// Scenario registry shown on the menu. Each entry lazy-loads its map + script.
import { StreetCrossing } from "../src/minigames/StreetCrossing.js";
import { TicketMachine } from "../src/minigames/TicketMachine.js";
import { PhoEating } from "../src/minigames/PhoEating.js";
import { GrabRide } from "../src/minigames/GrabRide.js";
import { SortGame } from "../src/minigames/SortGame.js";
import { CallBoard } from "../src/minigames/CallBoard.js";
import { PfandAutomat } from "../src/minigames/PfandAutomat.js";
import { Checkout } from "../src/minigames/Checkout.js";

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
  {
    id: "vietnam-grab-ride",
    country: "vietnam",
    flag: "🇻🇳",
    emoji: "🛵",
    color: "linear-gradient(135deg,#b8f2c9,#ffe29a)",
    minutes: 5,
    title: { en: "Your first Grab bike ride", vi: "Chuyến Grab bike đầu tiên" },
    desc: {
      en: "Dodge an overpriced xe ôm, find the right driver, wear the helmet properly and ride pillion through Hanoi traffic to Văn Miếu.",
      vi: "Tránh xe ôm “chặt chém”, tìm đúng tài xế, đội mũ đúng cách và ngồi sau xe máy băng qua phố Hà Nội tới Văn Miếu.",
    },
    tags: [{ en: "Transport", vi: "Đi lại" }, { en: "Safety", vi: "An toàn" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./vietnam/grab-ride/map.js"), import("./vietnam/grab-ride/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { grabRide: GrabRide } };
    },
  },
  {
    id: "germany-trash",
    country: "germany",
    flag: "🇩🇪",
    emoji: "🗑️",
    color: "linear-gradient(135deg,#fff3b0,#b8e0ff)",
    minutes: 4,
    title: { en: "Mülltrennung: sort your trash", vi: "Mülltrennung: phân loại rác" },
    desc: {
      en: "Yellow, blue, brown or grey? Sort tricky trash, learn glass-bank hours and what to do with Pfand bottles.",
      vi: "Vàng, xanh, nâu hay xám? Phân loại rác “khó nhằn”, học giờ bỏ thùng kính và cách xử lý chai Pfand.",
    },
    tags: [{ en: "Home", vi: "Ở nhà" }, { en: "Neighbours", vi: "Hàng xóm" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./germany/trash/map.js"), import("./germany/trash/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { sort: SortGame } };
    },
  },
  {
    id: "germany-anmeldung",
    country: "germany",
    flag: "🇩🇪",
    emoji: "🏛️",
    color: "linear-gradient(135deg,#d6e4ff,#ffe3ee)",
    minutes: 5,
    title: { en: "Anmeldung at the Bürgeramt", vi: "Đăng ký cư trú ở Bürgeramt" },
    desc: {
      en: "Book the free appointment, pack the right documents, catch your number on the call board and get your Meldebescheinigung.",
      vi: "Đặt lịch miễn phí, chuẩn bị đúng giấy tờ, canh số trên bảng gọi và nhận Meldebescheinigung.",
    },
    tags: [{ en: "Paperwork", vi: "Giấy tờ" }, { en: "First weeks", vi: "Tuần đầu" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./germany/anmeldung/map.js"), import("./germany/anmeldung/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { sort: SortGame, callBoard: CallBoard } };
    },
  },
  {
    id: "germany-supermarket",
    country: "germany",
    flag: "🇩🇪",
    emoji: "🛒",
    color: "linear-gradient(135deg,#ffd6d6,#c9f2d8)",
    minutes: 6,
    title: { en: "Saturday at the supermarket", vi: "Thứ Bảy đi siêu thị" },
    desc: {
      en: "Sunday closing, the €1 cart lock, the Pfand bottle machine and the legendary German checkout speed.",
      vi: "Chủ nhật đóng cửa, khoá xe đẩy 1 €, máy trả vỏ chai Pfand và tốc độ quét hàng “huyền thoại” của Đức.",
    },
    tags: [{ en: "Shopping", vi: "Mua sắm" }, { en: "Pfand", vi: "Tiền cọc chai" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./germany/supermarket/map.js"), import("./germany/supermarket/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { pfand: PfandAutomat, checkout: Checkout } };
    },
  },
];
