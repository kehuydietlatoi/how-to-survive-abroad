// Germany · Mülltrennung (sorting your trash).
// Facts checked Oct 2026 (Umweltbundesamt / Verbraucherzentrale / local waste guides):
// • Yellow bin/bag = packaging (plastic, metal, composite such as drink cartons). Empty it, no need to rinse.
// • Thermal-paper receipts → general waste. Heavily soiled pizza boxes → general waste
//   (only lightly greasy, scraped boxes may go in paper).
// • Broken drinking glasses / window glass → general waste, NOT the glass bank (bottles & jars only).
// • Glass banks sort by colour; blue / other colours → green. Use only at the posted times
//   (typically Mon–Sat daytime), never on Sundays or public holidays.
// • Plastic drink bottles and cans carry Pfand (deposit): return them to the shop.
// Rules vary slightly by city; the game shows the most common version.

const becker = { en: "Frau Becker (landlady)", vi: "Bà Becker (chủ nhà)" };

const ZONES = [
  { id: "gelb", label: { en: "Packaging", vi: "Bao bì" }, sub: { en: "Gelbe Tonne", vi: "Thùng vàng" }, color: "#e9b824", icon: "🟡" },
  { id: "papier", label: { en: "Paper", vi: "Giấy" }, sub: { en: "Blaue Tonne", vi: "Thùng xanh" }, color: "#2f6db5", icon: "📦" },
  { id: "bio", label: { en: "Organic", vi: "Hữu cơ" }, sub: { en: "Biotonne", vi: "Thùng nâu" }, color: "#8b5a2b", icon: "🍂" },
  { id: "rest", label: { en: "General", vi: "Rác còn lại" }, sub: { en: "Restmüll", vi: "Thùng xám" }, color: "#4b5563", icon: "🗑️" },
  { id: "glas", label: { en: "Glass bank", vi: "Thuỷ tinh" }, sub: { en: "Altglas", vi: "Thùng kính" }, color: "#2f9e44", icon: "🍾" },
];

const ITEMS = [
  {
    id: "yoghurt",
    icon: "🥣",
    name: { en: "Empty yoghurt pot", vi: "Hộp sữa chua rỗng" },
    zone: "gelb",
    why: { en: "Plastic **packaging** goes in the yellow bin. Spoon it empty; no need to wash it.", vi: "**Bao bì** nhựa bỏ thùng vàng. Vét sạch là được, không cần rửa." },
  },
  {
    id: "pizza",
    icon: "🍕",
    name: { en: "Pizza box, cheese stuck inside", vi: "Hộp pizza dính đầy phô mai" },
    zone: "rest",
    why: {
      en: "Heavily soiled cardboard can't be recycled, so it goes in **general waste**. A clean or lightly greasy box (scraped out) may go in paper.",
      vi: "Bìa dính bẩn nhiều không tái chế được: bỏ **rác còn lại**. Hộp sạch hoặc chỉ hơi dính dầu (đã vét) mới bỏ thùng giấy.",
    },
  },
  {
    id: "parcel",
    icon: "📦",
    name: { en: "Clean cardboard parcel box", vi: "Thùng bìa các-tông sạch" },
    zone: "papier",
    why: { en: "Clean cardboard → **paper bin**. Flatten it so the bin doesn't fill up.", vi: "Bìa sạch → **thùng giấy**. Gấp dẹt lại để không chiếm chỗ." },
  },
  {
    id: "newspaper",
    icon: "📰",
    name: { en: "Old newspaper", vi: "Báo cũ" },
    zone: "papier",
    why: { en: "Newspapers and magazines → **paper bin**.", vi: "Báo và tạp chí → **thùng giấy**." },
  },
  {
    id: "receipt",
    icon: "🧾",
    name: { en: "Supermarket receipt", vi: "Hoá đơn siêu thị" },
    zone: "rest",
    why: {
      en: "Receipts are **thermal paper** with chemical developers, so they go in **general waste**, not paper.",
      vi: "Hoá đơn là **giấy in nhiệt** có hoá chất: bỏ **rác còn lại**, không bỏ thùng giấy.",
    },
  },
  {
    id: "banana",
    icon: "🍌",
    name: { en: "Banana peel", vi: "Vỏ chuối" },
    zone: "bio",
    why: { en: "Fruit and veg scraps → **organic bin** (Biotonne).", vi: "Vỏ rau củ quả → **thùng hữu cơ** (Biotonne)." },
  },
  {
    id: "coffee",
    icon: "☕",
    name: { en: "Coffee grounds with paper filter", vi: "Bã cà phê kèm giấy lọc" },
    zone: "bio",
    why: { en: "Coffee grounds and paper filters → **organic bin**.", vi: "Bã cà phê và giấy lọc → **thùng hữu cơ**." },
  },
  {
    id: "can",
    icon: "🥫",
    name: { en: "Empty tomato tin", vi: "Lon cà chua rỗng" },
    zone: "gelb",
    why: { en: "Metal food tins are packaging → **yellow bin**.", vi: "Lon kim loại đựng thực phẩm là bao bì → **thùng vàng**." },
  },
  {
    id: "tetra",
    icon: "🧃",
    name: { en: "Juice carton (Tetra Pak)", vi: "Hộp nước ép giấy (Tetra Pak)" },
    zone: "gelb",
    why: {
      en: "It looks like paper, but it's a **composite** with plastic and aluminium inside, so it goes in the **yellow bin**.",
      vi: "Trông như giấy nhưng là **vật liệu phức hợp** có nhựa và nhôm bên trong → **thùng vàng**.",
    },
  },
  {
    id: "brokenGlass",
    icon: "🥂",
    name: { en: "Broken drinking glass", vi: "Cốc thuỷ tinh vỡ" },
    zone: "rest",
    why: {
      en: "Drinking glasses melt differently from bottle glass. Wrap the shards and put them in **general waste**, never the glass bank.",
      vi: "Cốc uống nước khác loại thuỷ tinh làm chai lọ. Gói mảnh vỡ lại và bỏ **rác còn lại**, không bỏ thùng kính.",
    },
  },
  {
    id: "jar",
    icon: "🫙",
    name: { en: "Empty jam jar", vi: "Lọ mứt rỗng" },
    zone: "glas",
    why: {
      en: "Glass jars and bottles → **glass bank** down the street. The metal lid goes in the yellow bin.",
      vi: "Lọ và chai thuỷ tinh → **thùng kính** cuối phố. Nắp kim loại bỏ thùng vàng.",
    },
  },
  {
    id: "wine",
    icon: "🍾",
    name: { en: "Empty wine bottle", vi: "Chai rượu vang rỗng" },
    zone: "glas",
    why: { en: "Wine bottles have no Pfand: take them to the **glass bank**.", vi: "Chai vang không có tiền cọc (Pfand): mang ra **thùng kính**." },
  },
  {
    id: "tissue",
    icon: "🤧",
    name: { en: "Used tissue", vi: "Khăn giấy đã dùng" },
    zone: "rest",
    why: { en: "Used tissues and napkins → **general waste** (they're too dirty for paper recycling).", vi: "Khăn giấy đã dùng → **rác còn lại** (quá bẩn để tái chế giấy)." },
  },
  {
    id: "toothbrush",
    icon: "🪥",
    name: { en: "Old toothbrush", vi: "Bàn chải cũ" },
    zone: "rest",
    why: {
      en: "It's plastic, but **not packaging**. In most cities the yellow bin is for packaging only, so this goes in general waste.",
      vi: "Là nhựa nhưng **không phải bao bì**. Ở hầu hết thành phố thùng vàng chỉ nhận bao bì → rác còn lại.",
    },
  },
];

export default {
  id: "germany-trash",
  steps: [
    {
      id: "intro",
      type: "info",
      speaker: becker,
      icon: "👵",
      text: {
        en: "Guten Morgen! Your first week here: time to take out the trash. In Germany we **separate** it, and the neighbours notice if you don't! The bins are next to the house.",
        vi: "Guten Morgen! Tuần đầu tiên rồi, đến lúc đổ rác. Ở Đức chúng tôi **phân loại rác**, và hàng xóm sẽ để ý nếu bạn không làm đâu! Thùng rác ở cạnh nhà.",
      },
      next: "toBins",
    },
    {
      id: "toBins",
      type: "sandbox",
      objective: { en: "Take your kitchen trash to the bin corner beside the house.", vi: "Mang rác bếp ra góc thùng rác cạnh nhà." },
      target: "bins",
      onEnter: [{ do: "visible", id: "trashBag", on: false }],
      next: "sort",
    },
    {
      id: "sort",
      type: "minigame",
      game: "sort",
      objective: { en: "Sort every item into the right bin.", vi: "Bỏ từng món vào đúng thùng." },
      params: {
        title: { en: "Mülltrennung: sort your trash", vi: "Mülltrennung: phân loại rác" },
        theme: "trash",
        zones: ZONES,
        items: ITEMS,
      },
      tip: {
        en: "Yellow = packaging, blue = paper, brown = food scraps, grey = everything else. Receipts, dirty pizza boxes and broken glasses go in **general waste**.",
        vi: "Vàng = bao bì, xanh = giấy, nâu = rác thực phẩm, xám = còn lại. Hoá đơn, hộp pizza bẩn và cốc vỡ bỏ **rác còn lại**.",
      },
      next: "glassTime",
    },
    {
      id: "glassTime",
      type: "choice",
      icon: "🕘",
      prompt: {
        en: "It's **Sunday, 9 pm**. You still have a bag of empty jars and bottles for the glass bank. What now?",
        vi: "Bây giờ là **9 giờ tối Chủ nhật**. Bạn còn một túi chai lọ rỗng cần bỏ thùng kính. Làm gì đây?",
      },
      options: [
        {
          text: { en: "Wait and take them on a weekday, during the posted hours", vi: "Đợi đến ngày thường, trong khung giờ ghi trên biển" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right. Glass banks have **drop-off times** (often Mon–Sat, about 7–20 h) because the clattering is loud. Sundays and holidays are quiet days.",
            vi: "Đúng. Thùng kính có **giờ bỏ rác** (thường thứ 2–thứ 7, khoảng 7–20 giờ) vì tiếng chai vỡ rất ồn. Chủ nhật và ngày lễ là ngày yên tĩnh.",
          },
        },
        {
          text: { en: "Go now, it's quick", vi: "Đi luôn bây giờ, nhanh mà" },
          points: 0,
          feedback: {
            en: "Smashing bottles on a Sunday night breaks the quiet-time rules (**Ruhezeit**), and neighbours may complain or report it.",
            vi: "Đập chai vào thùng tối Chủ nhật vi phạm giờ yên tĩnh (**Ruhezeit**), hàng xóm có thể phàn nàn hoặc báo cáo.",
          },
        },
        {
          text: { en: "Leave the bag next to the container", vi: "Để túi cạnh thùng chứa" },
          points: 0,
          feedback: {
            en: "That's **illegal dumping** and can get you fined. Only put glass inside the container.",
            vi: "Đó là **vứt rác trái phép** và có thể bị phạt. Chỉ bỏ thuỷ tinh vào bên trong thùng.",
          },
        },
      ],
      tip: {
        en: "Use glass banks only at the posted times (usually Mon–Sat daytime). Never on Sundays or holidays, and never leave bags beside them.",
        vi: "Chỉ bỏ thùng kính trong giờ quy định (thường thứ 2–7 ban ngày). Không bỏ vào Chủ nhật, ngày lễ, và không để túi bên cạnh.",
      },
      next: "monday",
    },
    {
      id: "monday",
      type: "travel",
      spawn: "morning",
      text: { en: "☀️ Monday, 9:00. Time for the glass bank.", vi: "☀️ Thứ Hai, 9:00. Ra thùng kính thôi." },
      next: "toGlass",
    },
    {
      id: "toGlass",
      type: "sandbox",
      objective: { en: "Take your jars and bottles to the glass bank (Altglas) down the street.", vi: "Mang chai lọ ra thùng kính (Altglas) cuối phố." },
      target: "glassBank",
      next: "blueBottle",
    },
    {
      id: "blueBottle",
      type: "choice",
      icon: "🍾",
      prompt: {
        en: "There are containers for **white**, **green** and **brown** glass. Where does your **blue** bottle go?",
        vi: "Có thùng cho thuỷ tinh **trắng**, **xanh lá** và **nâu**. Chai **xanh dương** của bạn bỏ vào đâu?",
      },
      options: [
        {
          text: { en: "Green glass (Grünglas)", vi: "Thuỷ tinh xanh lá (Grünglas)" },
          points: 10,
          correct: true,
          feedback: { en: "Yes! Blue, red and other colours go in with the **green** glass.", vi: "Đúng! Màu xanh dương, đỏ và màu khác bỏ chung với thuỷ tinh **xanh lá**." },
        },
        {
          text: { en: "White glass (Weißglas)", vi: "Thuỷ tinh trắng (Weißglas)" },
          points: 0,
          feedback: {
            en: "Only clear glass goes in white: coloured shards would tint the new clear glass. Other colours → **green**.",
            vi: "Chỉ thuỷ tinh trong suốt mới bỏ thùng trắng: mảnh màu sẽ làm thuỷ tinh mới bị ám màu. Màu khác → **xanh lá**.",
          },
        },
        {
          text: { en: "General waste at home", vi: "Thùng rác còn lại ở nhà" },
          points: 0,
          feedback: { en: "Bottles are recyclable: glass bank, **green** container.", vi: "Chai tái chế được: bỏ thùng kính, thùng **xanh lá**." },
        },
      ],
      tip: { en: "Glass banks: clear → white, brown → brown, green **and any other colour** → green.", vi: "Thùng kính: trong suốt → trắng, nâu → nâu, xanh lá **và mọi màu khác** → xanh lá." },
      next: "pfandBottle",
    },
    {
      id: "pfandBottle",
      type: "choice",
      icon: "♻️",
      prompt: {
        en: "At the bottom of your bag: a plastic water bottle with the **Pfand logo**. What do you do with it?",
        vi: "Dưới đáy túi: một chai nước nhựa có **logo Pfand**. Bạn làm gì với nó?",
      },
      options: [
        {
          text: { en: "Bring it back to the supermarket's return machine: **€0.25**", vi: "Mang trả máy thu chai ở siêu thị: **0,25 €**" },
          points: 10,
          correct: true,
          feedback: { en: "Exactly, that's your deposit back. Plastic drink bottles and cans almost always carry Pfand.", vi: "Chuẩn, đó là tiền cọc của bạn. Chai nhựa đựng đồ uống và lon hầu như luôn có Pfand." },
        },
        {
          text: { en: "Put it **next to** a public bin for bottle collectors", vi: "Đặt **cạnh** thùng rác công cộng cho người nhặt chai" },
          points: 6,
          feedback: {
            en: "A kind German custom (“Pfand gehört daneben”): collectors can return it. Fine on the street, just don't litter.",
            vi: "Một thói quen tử tế ở Đức (“Pfand gehört daneben”): người nhặt chai có thể đem trả. Ổn khi ở ngoài đường, miễn đừng xả rác.",
          },
        },
        {
          text: { en: "Yellow bin, it's plastic packaging", vi: "Thùng vàng, vì là bao bì nhựa" },
          points: 0,
          feedback: { en: "You'd throw away **25 cents**! Pfand bottles go back to the shop, not into any bin.", vi: "Bạn vứt mất **25 xu** đấy! Chai có Pfand mang trả cửa hàng, không bỏ thùng nào cả." },
        },
      ],
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      speaker: becker,
      icon: "👵",
      text: {
        en: "“Sehr gut! Bin days are in the **Abfallkalender** (or your city's waste app). Put the bins out the evening before collection.”",
        vi: "“Sehr gut! Lịch thu gom có trong **Abfallkalender** (hoặc app rác của thành phố). Đưa thùng ra đường từ tối hôm trước ngày thu gom.”",
      },
      tip: {
        en: "Check collection days in the **Abfallkalender** or your city's waste app.",
        vi: "Xem lịch thu gom trong **Abfallkalender** hoặc app rác của thành phố.",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
