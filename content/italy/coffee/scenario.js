// Italy · Rome: the espresso bar, coffee rules, coperto and the bus ticket.
// Facts checked Oct 2026 (Italian coffee-culture guides, bar etiquette articles):
// • In many city / tourist bars you pay first at the cassa and take the scontrino (receipt) to the counter. In small-town and many
//   southern bars you may order first and pay as you leave: watch what the locals do.
// • Prices differ: al banco (standing at the counter) is cheaper than al tavolo (seated, table service), which can be double or more.
// • "Un caffè" = espresso. Cappuccino / milky coffees are morning drinks; ordering one after a meal marks you as a tourist.
//   "Latte" = a glass of milk; "caffè corretto" = espresso "corrected" with a shot of liquor (often grappa).
// • "Coperto" (cover charge) is legal if it is shown on the menu / prices; check before sitting down.
// • Public-transport tickets must be validated ("convalidare") in the machine on board; unvalidated tickets can be fined.

const cashier = { en: "Cashier", vi: "Thu ngân" };

const ZONES = [
  { id: "morning", label: { en: "Morning only", vi: "Chỉ buổi sáng" }, sub: { en: "breakfast drink", vi: "đồ ăn sáng" }, color: "#f6a21b", icon: "☀️" },
  { id: "any", label: { en: "Any time", vi: "Giờ nào cũng được" }, color: "#2f9e44", icon: "☕" },
  { id: "surprise", label: { en: "Surprise!", vi: "Bất ngờ!" }, sub: { en: "not what you think", vi: "không như bạn nghĩ" }, color: "#8d5fd3", icon: "😳" },
];

const ITEMS = [
  {
    id: "cappuccino",
    icon: "🥛",
    name: { en: "Cappuccino", vi: "Cappuccino" },
    zone: "morning",
    why: { en: "Milky coffee is a **breakfast** drink. Ordering one after lunch or dinner makes the barista age ten years.", vi: "Cà phê sữa là đồ uống **bữa sáng**. Gọi sau bữa trưa hay tối khiến barista già đi mười tuổi." },
  },
  {
    id: "cornetto",
    icon: "🥐",
    name: { en: "Cornetto (croissant)", vi: "Cornetto (bánh sừng bò)" },
    zone: "morning",
    why: { en: "The classic Italian breakfast: a cornetto and a coffee, standing at the bar.", vi: "Bữa sáng kinh điển của Ý: một cornetto và một ly cà phê, đứng ở quầy." },
  },
  {
    id: "espresso",
    icon: "☕",
    name: { en: "Un caffè (espresso)", vi: "Un caffè (espresso)" },
    zone: "any",
    why: { en: "“Un caffè” means **espresso**, and you can have it any time of day (and after meals).", vi: "“Un caffè” nghĩa là **espresso**, và bạn có thể uống bất cứ lúc nào (kể cả sau bữa ăn)." },
  },
  {
    id: "macchiato",
    icon: "🤎",
    name: { en: "Caffè macchiato", vi: "Caffè macchiato" },
    zone: "any",
    why: { en: "Espresso “stained” with a drop of milk: fine at any time.", vi: "Espresso “nhuộm” bằng một giọt sữa: lúc nào cũng được." },
  },
  {
    id: "shakerato",
    icon: "🧊",
    name: { en: "Caffè shakerato", vi: "Caffè shakerato" },
    zone: "any",
    why: { en: "Espresso shaken with ice: a summer classic, all day.", vi: "Espresso lắc với đá: món kinh điển mùa hè, uống cả ngày." },
  },
  {
    id: "latte",
    icon: "🥛",
    name: { en: "“Un latte, per favore”", vi: "“Un latte, per favore”" },
    zone: "surprise",
    why: { en: "**Latte** just means **milk** in Italian. You'll get a glass of cold milk. Ask for a “caffè latte” instead.", vi: "**Latte** trong tiếng Ý chỉ có nghĩa là **sữa**. Bạn sẽ nhận một ly sữa lạnh. Hãy gọi “caffè latte”." },
  },
  {
    id: "corretto",
    icon: "🥃",
    name: { en: "Caffè corretto", vi: "Caffè corretto" },
    zone: "surprise",
    why: { en: "An espresso “corrected” with a shot of grappa or other liquor. Don't order it before a meeting!", vi: "Espresso được “hiệu chỉnh” bằng một ly grappa hoặc rượu mạnh. Đừng gọi trước buổi họp!" },
  },
  {
    id: "venti",
    icon: "🍦",
    name: { en: "A “venti caramel macchiato to go”", vi: "Một ly “venti caramel macchiato mang đi”" },
    zone: "surprise",
    why: { en: "That's a chain-café drink. Italian bars don't do giant takeaway coffee: you get a puzzled look and a tiny espresso.", vi: "Đó là đồ uống của chuỗi cà phê. Quán bar Ý không có cà phê mang đi khổng lồ: bạn nhận ánh nhìn khó hiểu và một ly espresso nhỏ xíu." },
  },
];

export default {
  id: "italy-coffee",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "☕",
      text: {
        en: "**Rome, 8 a.m.** You just want a coffee. How hard can it be? (Very.) In Italy, “quick coffee” means thirty seconds at the counter and thirty minutes of strong opinions about football.",
        vi: "**Rome, 8 giờ sáng.** Bạn chỉ muốn một ly cà phê. Khó đến đâu được chứ? (Rất khó.) Ở Ý, “cà phê nhanh” nghĩa là ba mươi giây ở quầy và ba mươi phút bàn luận sôi nổi về bóng đá.",
      },
      next: "toBar",
    },
    {
      id: "toBar",
      type: "sandbox",
      objective: { en: "Walk into the bar and head for the counter.", vi: "Vào quán bar và đi ra quầy." },
      target: "banco",
      next: "barista",
    },
    {
      id: "barista",
      type: "info",
      speaker: { en: "Barista", vi: "Barista" },
      icon: "👨‍🍳",
      text: {
        en: "The barista says, without looking at you: “**Prego… lo scontrino?**” (Your receipt?). Ah. You haven't paid yet. In many city bars you pay at the **cassa** first.",
        vi: "Barista nói mà không nhìn bạn: “**Prego… lo scontrino?**” (Hoá đơn của bạn đâu?). À. Bạn chưa trả tiền. Ở nhiều quán bar trong thành phố, bạn phải trả ở **cassa** trước.",
      },
      next: "toCassa",
    },
    {
      id: "toCassa",
      type: "sandbox",
      objective: { en: "Go to the cassa and pay first.", vi: "Đến cassa và trả tiền trước." },
      target: "cassa",
      wrong: {
        tavolo: { feedback: { en: "The terrace is lovely, but table service costs more. Pay at the cassa first and see.", vi: "Hiên ngoài rất đẹp, nhưng phục vụ tại bàn đắt hơn. Hãy trả ở cassa trước đã." } },
      },
      next: "bancoOrTavolo",
    },
    {
      id: "bancoOrTavolo",
      type: "choice",
      speaker: cashier,
      icon: "💶",
      prompt: {
        en: "“**Dica!**” says the cashier. You want one espresso. “Al banco o al tavolo?” (At the counter, or at a table?)",
        vi: "“**Dica!**” thu ngân nói. Bạn muốn một ly espresso. “Al banco o al tavolo?” (Ở quầy hay ở bàn?)",
      },
      options: [
        {
          text: { en: "“**Un caffè, al banco**, per favore.” Stand at the counter", vi: "“**Un caffè, al banco**, per favore.” Đứng ở quầy" },
          points: 10,
          correct: true,
          feedback: {
            en: "That's how Romans do it: a quick standing espresso, cheaper than sitting down. Standing at the counter is the standard price.",
            vi: "Người Roma làm vậy: một ly espresso đứng nhanh gọn, rẻ hơn ngồi. Đứng ở quầy là giá tiêu chuẩn.",
          },
        },
        {
          text: { en: "“Al tavolo.” You'd like to sit on the sunny terrace", vi: "“Al tavolo.” Bạn muốn ngồi ngoài hiên đầy nắng" },
          points: 6,
          feedback: {
            en: "Lovely, but remember: table service often costs double or more (especially on tourist squares). Fine for a treat, not for your daily coffee.",
            vi: "Rất đẹp, nhưng nhớ rằng: phục vụ tại bàn thường đắt gấp đôi hoặc hơn (nhất là ở quảng trường du lịch). Ổn cho dịp đặc biệt, không phải cà phê hằng ngày.",
          },
        },
      ],
      tip: {
        en: "A coffee “al banco” (standing at the counter) costs much less than “al tavolo” (seated with table service).",
        vi: "Cà phê “al banco” (đứng ở quầy) rẻ hơn nhiều so với “al tavolo” (ngồi bàn có phục vụ).",
      },
      next: "toBanco",
    },
    {
      id: "toBanco",
      type: "sandbox",
      objective: { en: "Take your receipt (scontrino) to the counter.", vi: "Mang hoá đơn (scontrino) ra quầy." },
      target: "banco",
      next: "scontrino",
    },
    {
      id: "scontrino",
      type: "choice",
      speaker: { en: "Barista", vi: "Barista" },
      icon: "🧾",
      prompt: {
        en: "A crowd of locals is pressed against the counter, all shouting orders over each other. You have your scontrino in hand.",
        vi: "Một đám người địa phương chen sát quầy, ai cũng gọi món chồng lên nhau. Bạn cầm hoá đơn trên tay.",
      },
      options: [
        {
          text: { en: "Put the **scontrino on the counter edge** and say “**Un caffè, per favore**”", vi: "Đặt **hoá đơn lên mép quầy** và nói “**Un caffè, per favore**”" },
          points: 10,
          correct: true,
          feedback: {
            en: "Perfect. Place the receipt on the counter, catch the barista's eye, and ask. A small coin left on the scontrino is a friendly custom.",
            vi: "Hoàn hảo. Đặt hoá đơn lên quầy, giao tiếp bằng mắt với barista và gọi món. Để một đồng xu nhỏ lên hoá đơn là thói quen thân thiện.",
          },
        },
        {
          text: { en: "Wait silently, receipt hidden in your pocket", vi: "Đứng im lặng, giấu hoá đơn trong túi" },
          points: 2,
          feedback: {
            en: "Nobody will notice you; the counter is a free-for-all. Show the receipt and speak up.",
            vi: "Sẽ không ai để ý bạn; quầy là nơi giành giật. Hãy đưa hoá đơn ra và lên tiếng.",
          },
        },
        {
          text: { en: "Wave a banknote over the crowd shouting “**Scusi!**”", vi: "Vẫy tờ tiền qua đầu đám đông và hét “**Scusi!**”" },
          points: 0,
          feedback: {
            en: "You already paid at the cassa. Waving money is confusing; you only need to show the receipt.",
            vi: "Bạn đã trả ở cassa rồi. Vẫy tiền chỉ gây rối; chỉ cần đưa hoá đơn.",
          },
        },
      ],
      next: "clock",
    },
    {
      id: "clock",
      type: "minigame",
      game: "sort",
      objective: { en: "Sort the coffee orders by the Italian clock.", vi: "Phân loại đồ uống theo “đồng hồ cà phê” của người Ý." },
      params: {
        title: { en: "The Italian coffee clock", vi: "Đồng hồ cà phê kiểu Ý" },
        theme: "docs",
        zones: ZONES,
        items: ITEMS,
      },
      tip: {
        en: "“Un caffè” = espresso (any time). Cappuccino is for mornings. “Latte” is milk. “Corretto” has liquor in it.",
        vi: "“Un caffè” = espresso (lúc nào cũng được). Cappuccino dành cho buổi sáng. “Latte” là sữa. “Corretto” có rượu.",
      },
      next: "coperto",
    },
    {
      id: "coperto",
      type: "choice",
      icon: "🍝",
      prompt: {
        en: "**Lunch.** The bill arrives with a line you didn't order: “**Coperto €2.50 × 2**”. You also ate two bread rolls you didn't ask for.",
        vi: "**Bữa trưa.** Hoá đơn có một dòng bạn không gọi: “**Coperto 2,50 € × 2**”. Bạn cũng đã ăn hai ổ bánh mì không gọi.",
      },
      options: [
        {
          text: { en: "It's the **cover charge** (coperto) shown on the menu: check the menu, and pay it", vi: "Đó là **phí cover** (coperto) ghi trên thực đơn: kiểm tra thực đơn và trả" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right. A coperto is a per-person cover charge (bread, table, service) and must be shown on the menu. Check it **before** you sit down.",
            vi: "Đúng. Coperto là phí cover tính theo đầu người (bánh mì, bàn, phục vụ) và phải được ghi trên thực đơn. Hãy kiểm tra **trước khi** ngồi.",
          },
        },
        {
          text: { en: "Argue loudly that you didn't order it and refuse to pay it", vi: "Cãi to rằng bạn không gọi và từ chối trả" },
          points: 0,
          feedback: {
            en: "If it's on the menu, it's legitimate. Check the menu first. If it was NOT listed, politely ask to see the price list.",
            vi: "Nếu có trong thực đơn thì hợp lệ. Hãy xem thực đơn trước. Nếu KHÔNG được ghi, hãy lịch sự xin xem bảng giá.",
          },
        },
        {
          text: { en: "Leave a 20% tip to make up for it", vi: "Để 20% tiền boa cho bù" },
          points: 2,
          feedback: {
            en: "Not necessary: the coperto (and often the service) already covers it. Tipping is small change at most.",
            vi: "Không cần: coperto (và thường cả phục vụ) đã gồm rồi. Boa nhiều nhất cũng chỉ là tiền lẻ.",
          },
        },
      ],
      tip: {
        en: "Check for “coperto” (cover charge) on the menu before sitting down: it's legal if it's listed.",
        vi: "Kiểm tra “coperto” (phí cover) trên thực đơn trước khi ngồi: hợp lệ nếu có ghi.",
      },
      next: "toBus",
    },
    {
      id: "toBus",
      type: "travel",
      spawn: "bus",
      text: { en: "🚌 Afternoon. Time to catch the bus.", vi: "🚌 Buổi chiều. Đến lúc bắt xe buýt." },
      next: "validate",
    },
    {
      id: "validate",
      type: "choice",
      icon: "🎫",
      prompt: {
        en: "You board with a paper ticket. The bus is crowded, nobody checks anything, and a yellow machine sits by the door.",
        vi: "Bạn lên xe với vé giấy. Xe đông, không ai kiểm tra gì, và một chiếc máy vàng đặt cạnh cửa.",
      },
      options: [
        {
          text: { en: "**Validate** the ticket in the machine straight away", vi: "**Bấm xác nhận** vé vào máy ngay lập tức" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes. A ticket is only valid once it's stamped (“convalidato”). Ticket inspectors do appear, and an unvalidated ticket can get you a fine.",
            vi: "Đúng. Vé chỉ có hiệu lực sau khi được dập (“convalidato”). Nhân viên kiểm soát vẫn xuất hiện, và vé chưa dập có thể bị phạt.",
          },
        },
        {
          text: { en: "Keep it in your pocket: nobody's checking", vi: "Cất trong túi: không ai kiểm tra đâu" },
          points: 0,
          feedback: {
            en: "Of course an inspector boards two stops later. An unvalidated ticket counts as no ticket, and the fine is far bigger than a fare.",
            vi: "Tất nhiên một nhân viên kiểm soát sẽ lên sau hai trạm. Vé chưa dập coi như không có vé và tiền phạt cao hơn giá vé rất nhiều.",
          },
        },
      ],
      tip: {
        en: "Validate (convalidare) your paper ticket in the machine as soon as you board.",
        vi: "Hãy dập (convalidare) vé giấy vào máy ngay khi lên xe.",
      },
      next: "toValidator",
    },
    {
      id: "toValidator",
      type: "sandbox",
      objective: { en: "Go to the yellow validator by the door.", vi: "Đến máy dập vé màu vàng cạnh cửa." },
      target: "validator",
      done: { en: "Ka-chunk! The ticket is stamped with the date and time. 🎫", vi: "Cạch! Vé được dập ngày và giờ. 🎫" },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      icon: "🇮🇹",
      text: {
        en: "Pay first, drink standing, validate your ticket, and never, ever order a cappuccino after dinner. A barista somewhere just felt a chill and does not know why. Ciao!",
        vi: "Trả tiền trước, uống đứng, dập vé, và đừng bao giờ gọi cappuccino sau bữa tối. Một barista nào đó vừa thấy rùng mình mà không biết tại sao. Ciao!",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
