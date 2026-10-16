// Scenario registry shown on the menu. Each entry lazy-loads its map + script.
import { StreetCrossing } from "../src/minigames/StreetCrossing.js";
import { TicketMachine } from "../src/minigames/TicketMachine.js";
import { PhoEating } from "../src/minigames/PhoEating.js";
import { GrabRide } from "../src/minigames/GrabRide.js";
import { SortGame } from "../src/minigames/SortGame.js";
import { CallBoard } from "../src/minigames/CallBoard.js";
import { PfandAutomat } from "../src/minigames/PfandAutomat.js";
import { Checkout } from "../src/minigames/Checkout.js";
import { SwipeJudge } from "../src/minigames/SwipeJudge.js";
import { DodgeLane } from "../src/minigames/DodgeLane.js";
import { Haggle } from "../src/minigames/Haggle.js";
import { Grill } from "../src/minigames/Grill.js";

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
  {
    id: "japan-rush-hour",
    country: "japan",
    flag: "🇯🇵",
    emoji: "🚇",
    color: "linear-gradient(135deg,#ffd6e0,#d6e4ff)",
    minutes: 5,
    title: { en: "Tokyo rush hour", vi: "Giờ cao điểm ở Tokyo" },
    desc: {
      en: "Tap your IC card, queue on the platform marks, judge what is (not) OK on a packed train and rescue your lost wallet.",
      vi: "Chạm thẻ IC, xếp hàng theo vạch, phán xét điều được (và không được) làm trên chuyến tàu chật cứng và tìm lại chiếc ví đã mất.",
    },
    tags: [{ en: "Public transport", vi: "Giao thông công cộng" }, { en: "Manners", vi: "Phép lịch sự" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./japan/rush-hour/map.js"), import("./japan/rush-hour/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { swipe: SwipeJudge } };
    },
  },
  {
    id: "korea-bbq",
    country: "korea",
    flag: "🇰🇷",
    emoji: "🥓",
    color: "linear-gradient(135deg,#ffd6c9,#ffe29a)",
    minutes: 6,
    title: { en: "Hoesik: the team BBQ dinner", vi: "Hoesik: bữa nướng của team" },
    desc: {
      en: "Wait for the boss's first spoon, grill the samgyeopsal, pour with two hands and dodge the second round at karaoke.",
      vi: "Chờ thìa đầu tiên của sếp, nướng samgyeopsal, rót rượu bằng hai tay và né vòng hai ở karaoke.",
    },
    tags: [{ en: "Dining", vi: "Ăn uống" }, { en: "Work culture", vi: "Văn hoá công sở" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./korea/bbq/map.js"), import("./korea/bbq/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { grill: Grill } };
    },
  },
  {
    id: "thailand-temple",
    country: "thailand",
    flag: "🇹🇭",
    emoji: "🛕",
    color: "linear-gradient(135deg,#ffe7a8,#ffc9de)",
    minutes: 6,
    title: { en: "Bangkok: the Grand Palace & the tuk-tuk “tour”", vi: "Bangkok: Cung điện Hoàng gia & “tour” tuk-tuk" },
    desc: {
      en: "Dodge the friendly “palace is closed” scam, pass the temple wardrobe check, mind your feet and greet a monk.",
      vi: "Né mánh “cung điện đóng cửa”, qua cửa kiểm tra trang phục, giữ ý với đôi chân và chào một nhà sư.",
    },
    tags: [{ en: "Etiquette", vi: "Phép lịch sự" }, { en: "Scams", vi: "Lừa đảo" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./thailand/temple/map.js"), import("./thailand/temple/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { sort: SortGame } };
    },
  },
  {
    id: "india-auto",
    country: "india",
    flag: "🇮🇳",
    emoji: "🛺",
    color: "linear-gradient(135deg,#ffd6a5,#caffbf)",
    minutes: 6,
    title: { en: "Delhi: auto-rickshaw, cow & chai", vi: "Delhi: xe auto-rickshaw, con bò & chai" },
    desc: {
      en: "Haggle with an auto driver who swears the meter is broken, wait for a cow, pay for chai and decode the head wobble.",
      vi: "Mặc cả với tài xế auto thề rằng đồng hồ hỏng, chờ con bò, trả tiền chai và giải mã cái lắc đầu.",
    },
    tags: [{ en: "Transport", vi: "Đi lại" }, { en: "Haggling", vi: "Mặc cả" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./india/auto/map.js"), import("./india/auto/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { haggle: Haggle } };
    },
  },
  {
    id: "usa-diner",
    country: "usa",
    flag: "🇺🇸",
    emoji: "🍔",
    color: "linear-gradient(135deg,#ffcad4,#b8d8ff)",
    minutes: 6,
    title: { en: "Roadside diner: tip, tax & 911", vi: "Quán diner ven đường: boa, thuế & 911" },
    desc: {
      en: "Wait to be seated, add tax and tip to the menu price, judge who gets a tip, and learn why insurance matters.",
      vi: "Đợi xếp chỗ, cộng thuế và boa vào giá thực đơn, phán xét ai nhận boa và hiểu vì sao bảo hiểm quan trọng.",
    },
    tags: [{ en: "Money", vi: "Tiền bạc" }, { en: "Tipping", vi: "Tiền boa" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./usa/diner/map.js"), import("./usa/diner/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { swipe: SwipeJudge } };
    },
  },
  {
    id: "uk-pub",
    country: "uk",
    flag: "🇬🇧",
    emoji: "🍺",
    color: "linear-gradient(135deg,#d8d8f6,#ffd6d6)",
    minutes: 7,
    title: { en: "London: queue, Tube & the pub", vi: "London: xếp hàng, Tube & quán pub" },
    desc: {
      en: "Queue at the bus stop, touch in and out on the Tube, order at the bar, buy a round and decode British politeness.",
      vi: "Xếp hàng ở trạm buýt, chạm vào và ra ở Tube, gọi ở quầy bar, mua một vòng và giải mã sự lịch sự kiểu Anh.",
    },
    tags: [{ en: "Transport", vi: "Đi lại" }, { en: "Social life", vi: "Giao tiếp" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./uk/pub/map.js"), import("./uk/pub/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { swipe: SwipeJudge } };
    },
  },
  {
    id: "france-paris",
    country: "france",
    flag: "🇫🇷",
    emoji: "🥐",
    color: "linear-gradient(135deg,#ffe3ec,#d6e8ff)",
    minutes: 7,
    title: { en: "Paris: bonjour, café & Sacré-Cœur", vi: "Paris: bonjour, quán cà phê & Sacré-Cœur" },
    desc: {
      en: "Greet before you order, ask for the free carafe, survive la bise and climb the steps past bracelet hustlers.",
      vi: "Chào trước khi gọi món, xin bình nước miễn phí, vượt qua la bise và leo bậc thang qua những kẻ bán vòng tay.",
    },
    tags: [{ en: "Etiquette", vi: "Phép lịch sự" }, { en: "Scams", vi: "Lừa đảo" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./france/paris/map.js"), import("./france/paris/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { lane: DodgeLane } };
    },
  },
  {
    id: "italy-coffee",
    country: "italy",
    flag: "🇮🇹",
    emoji: "☕",
    color: "linear-gradient(135deg,#ffe0b2,#c8f7c5)",
    minutes: 6,
    title: { en: "Rome: the espresso bar", vi: "Rome: quán espresso" },
    desc: {
      en: "Pay at the cassa first, drink standing, learn the coffee clock and validate your bus ticket.",
      vi: "Trả tiền ở cassa trước, uống đứng, học “đồng hồ cà phê” và dập vé xe buýt.",
    },
    tags: [{ en: "Food & drink", vi: "Ăn uống" }, { en: "Transport", vi: "Đi lại" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./italy/coffee/map.js"), import("./italy/coffee/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { sort: SortGame } };
    },
  },
  {
    id: "netherlands-bike",
    country: "netherlands",
    flag: "🇳🇱",
    emoji: "🚲",
    color: "linear-gradient(135deg,#ffd9b3,#b8e0ff)",
    minutes: 7,
    title: { en: "Amsterdam: your first bike", vi: "Amsterdam: chiếc xe đạp đầu tiên" },
    desc: {
      en: "Skip the hot bike, lock it twice, keep off the red lane and ring your way through rush hour on the fietspad.",
      vi: "Tránh xe trộm, khoá hai lần, tránh làn đỏ và rung chuông băng qua giờ cao điểm trên làn xe đạp.",
    },
    tags: [{ en: "Transport", vi: "Đi lại" }, { en: "Safety", vi: "An toàn" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./netherlands/bike/map.js"), import("./netherlands/bike/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { lane: DodgeLane } };
    },
  },
  {
    id: "australia-beach",
    country: "australia",
    flag: "🇦🇺",
    emoji: "🏖️",
    color: "linear-gradient(135deg,#ffeaa7,#a0e7f5)",
    minutes: 7,
    title: { en: "Sydney: the beach tries to kill you", vi: "Sydney: bãi biển muốn lấy mạng bạn" },
    desc: {
      en: "Slip-Slop-Slap, swim between the flags, escape a rip, treat a bluebottle sting and meet the drop bears.",
      vi: "Slip-Slop-Slap, bơi giữa hai cờ, thoát dòng rip, xử lý vết đốt bluebottle và gặp drop bear.",
    },
    tags: [{ en: "Safety", vi: "An toàn" }, { en: "Outdoors", vi: "Ngoài trời" }],
    load: async () => {
      const [map, scenario] = await Promise.all([import("./australia/beach/map.js"), import("./australia/beach/scenario.js")]);
      return { map: map.default, scenario: scenario.default, minigames: { lane: DodgeLane } };
    },
  },
];
