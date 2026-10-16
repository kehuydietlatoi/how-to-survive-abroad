// Thailand · Bangkok, Grand Palace & temple etiquette.
// Facts checked Oct 2026 (Bangkok travel guides on the Grand Palace, Thai cultural etiquette sources):
// • The Grand Palace: foreign visitors pay an entry fee (about 500 baht in recent years; check the official page).
//   Dress code: shoulders and knees covered; no tight leggings, torn clothes or see-through clothes. Clothes can be
//   borrowed / bought on site. Opening hours roughly 08:30–15:30.
// • Classic scam: a friendly stranger says the palace is "closed today" and offers a cheap tuk-tuk "tour"
//   that ends at gem shops / tailors that pay commission.
// • Shoes are removed before entering temple halls; don't point your feet at a Buddha image; heads are
//   considered high, don't touch people's heads; women should not touch monks or hand things directly to them.
// • The wai (palms together, slight bow) is the greeting; it is returned by sitting at similar or lower status.
// • The royal anthem is played before films in cinemas and people stand. Thailand has strict lèse-majesté laws:
//   never joke about or insult the monarchy.

const you = { en: "You", vi: "Bạn" };

const ZONES = [
  { id: "ok", label: { en: "OK to wear", vi: "Được mặc" }, color: "#2f9e44", icon: "✅" },
  { id: "no", label: { en: "Not allowed", vi: "Không được" }, color: "#e5484d", icon: "🚫" },
  { id: "door", label: { en: "Off at the door", vi: "Bỏ ở cửa" }, sub: { en: "shoes, hats", vi: "giày, mũ" }, color: "#f6a21b", icon: "🚪" },
];

const ITEMS = [
  { id: "tshirt", icon: "👕", name: { en: "T-shirt with sleeves", vi: "Áo thun có tay" }, zone: "ok", why: { en: "Sleeves cover your shoulders: perfect.", vi: "Có tay áo che vai: chuẩn." } },
  {
    id: "tank",
    icon: "🎽",
    name: { en: "Sleeveless tank top", vi: "Áo ba lỗ" },
    zone: "no",
    why: { en: "Shoulders must be covered. Buy or borrow a shirt with sleeves.", vi: "Phải che vai. Hãy mua hoặc mượn áo có tay." },
  },
  {
    id: "shorts",
    icon: "🩳",
    name: { en: "Short shorts above the knee", vi: "Quần short trên đầu gối" },
    zone: "no",
    why: { en: "Knees must be covered. Long loose trousers or a long skirt only.", vi: "Phải che đầu gối. Chỉ quần dài rộng hoặc váy dài." },
  },
  {
    id: "trousers",
    icon: "👖",
    name: { en: "Loose long trousers", vi: "Quần dài rộng" },
    zone: "ok",
    why: { en: "Long, loose trousers are fine. (Thin fisherman trousers are a classic.)", vi: "Quần dài rộng thì được. (Quần ngư dân mỏng rất phổ biến.)" },
  },
  {
    id: "ripped",
    icon: "🧵",
    name: { en: "Ripped jeans with holes", vi: "Quần jeans rách" },
    zone: "no",
    why: { en: "Torn clothes aren't allowed, even if they're fashionable.", vi: "Quần áo rách không được vào, kể cả khi đang hợp mốt." },
  },
  {
    id: "skirt",
    icon: "👗",
    name: { en: "Long skirt below the knee", vi: "Váy dài dưới đầu gối" },
    zone: "ok",
    why: { en: "Below the knee works. Cool in the heat too!", vi: "Dài dưới đầu gối là được. Lại mát trong thời tiết nóng nữa!" },
  },
  {
    id: "leggings",
    icon: "🩱",
    name: { en: "Tight leggings", vi: "Quần legging bó sát" },
    zone: "no",
    why: { en: "Tight clothing isn't accepted. Wear loose trousers instead.", vi: "Quần áo bó sát không được chấp nhận. Hãy mặc quần dài rộng." },
  },
  {
    id: "lace",
    icon: "🧶",
    name: { en: "See-through lace top", vi: "Áo ren xuyên thấu" },
    zone: "no",
    why: { en: "See-through fabric isn't allowed. Layer something opaque.", vi: "Vải xuyên thấu không được phép. Hãy mặc thêm lớp không trong suốt." },
  },
  {
    id: "shoes",
    icon: "👟",
    name: { en: "Your shoes", vi: "Giày của bạn" },
    zone: "door",
    why: { en: "Shoes come off before entering a temple hall.", vi: "Phải cởi giày trước khi vào chánh điện." },
  },
  {
    id: "hat",
    icon: "🧢",
    name: { en: "Baseball cap", vi: "Mũ lưỡi trai" },
    zone: "door",
    why: { en: "Take hats off inside temple buildings as a sign of respect.", vi: "Hãy bỏ mũ khi vào trong công trình chùa để thể hiện sự tôn trọng." },
  },
];

export default {
  id: "thailand-temple",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "🛕",
      text: {
        en: "**Bangkok, 9 a.m.** 35 °C, 80% humidity. You're wearing the tourist uniform: tank top and shorts. Today: the Grand Palace, where everyone knows a very helpful friend.",
        vi: "**Bangkok, 9 giờ sáng.** 35 °C, độ ẩm 80%. Bạn mặc “đồng phục du khách”: áo ba lỗ và quần short. Hôm nay: Cung điện Hoàng gia, nơi ai cũng có một người bạn cực kỳ nhiệt tình.",
      },
      next: "toUncle",
    },
    {
      id: "toUncle",
      type: "sandbox",
      objective: { en: "Walk along the palace wall. A friendly man is waving at you.", vi: "Đi dọc tường cung điện. Có một người đàn ông thân thiện đang vẫy tay với bạn." },
      target: "uncle",
      next: "scam",
    },
    {
      id: "scam",
      type: "choice",
      speaker: { en: "Friendly man", vi: "Người đàn ông thân thiện" },
      icon: "😀",
      prompt: {
        en: "“Hello my friend! Grand Palace **closed today**: Buddhist holiday! But I have tuk-tuk, **20 baht**, three beautiful temples, very special government tour!”",
        vi: "“Chào bạn thân! Cung điện **hôm nay đóng cửa**: lễ Phật giáo! Nhưng tôi có xe tuk-tuk, **20 baht**, ba ngôi chùa tuyệt đẹp, tour chính phủ cực đặc biệt!”",
      },
      options: [
        {
          text: { en: "“No, thank you.” Walk on and **check the gate yourself**", vi: "“Không, cảm ơn.” Đi tiếp và **tự kiểm tra ở cổng**" },
          points: 10,
          correct: true,
          feedback: {
            en: "Smart. “Closed today” is the classic opener of the **gem-shop scam**: the tour ends at shops that pay your driver commission.",
            vi: "Khôn ngoan. “Hôm nay đóng cửa” là câu mở đầu kinh điển của **trò lừa tiệm đá quý**: tour kết thúc ở những cửa hàng trả hoa hồng cho tài xế.",
          },
        },
        {
          text: { en: "Hop in: 20 baht is a bargain!", vi: "Leo lên: 20 baht rẻ quá!" },
          points: 0,
          feedback: {
            en: "The three temples turn out to be three gem shops and one very pushy tailor. The 20 baht was the only thing you didn't pay for.",
            vi: "Ba ngôi chùa hoá ra là ba tiệm đá quý và một thợ may rất nài ép. 20 baht là thứ duy nhất bạn không phải trả thêm.",
          },
        },
        {
          text: { en: "Say “OK” but keep walking toward the gate", vi: "Nói “OK” nhưng vẫn đi về phía cổng" },
          points: 6,
          feedback: {
            en: "It works, but it's simpler to stay polite and firm: “No, thank you”. Don't follow strangers' directions to attractions.",
            vi: "Cũng được, nhưng đơn giản hơn là lịch sự và dứt khoát: “Không, cảm ơn”. Đừng đi theo chỉ dẫn của người lạ tới điểm tham quan.",
          },
        },
      ],
      tip: {
        en: "“The palace is closed today” from a stranger is a classic scam. Check the official gate or sign yourself.",
        vi: "Người lạ nói “hôm nay cung điện đóng cửa” là mánh lừa kinh điển. Hãy tự kiểm tra ở cổng hoặc biển chính thức.",
      },
      next: "toGate",
    },
    {
      id: "toGate",
      type: "sandbox",
      objective: { en: "Go to the real entrance of the Grand Palace.", vi: "Đi tới lối vào thật của Cung điện." },
      target: "gate",
      wrong: {
        stall: { feedback: { en: "You'll want that stall in a minute, but head to the gate first.", vi: "Lát nữa bạn sẽ cần sạp đó, nhưng hãy ra cổng trước đã." } },
      },
      next: "guard",
    },
    {
      id: "guard",
      type: "info",
      speaker: { en: "Guard", vi: "Bảo vệ" },
      icon: "💂",
      text: {
        en: "Open, of course. A guard looks at your tank top and shorts and politely points to a sign: **shoulders and knees must be covered**. Time for a wardrobe check.",
        vi: "Dĩ nhiên là mở cửa. Một bảo vệ nhìn áo ba lỗ và quần short của bạn rồi lịch sự chỉ vào biển báo: **phải che vai và đầu gối**. Đến lúc kiểm tra tủ đồ.",
      },
      next: "wardrobe",
    },
    {
      id: "wardrobe",
      type: "minigame",
      game: "sort",
      objective: { en: "Sort the clothes: OK, not allowed, or off at the door.", vi: "Phân loại trang phục: được mặc, không được, hay bỏ ở cửa." },
      params: {
        title: { en: "Temple wardrobe check", vi: "Kiểm tra trang phục khi vào chùa" },
        theme: "docs",
        zones: ZONES,
        items: ITEMS,
      },
      tip: {
        en: "Cover **shoulders and knees**; no tight, torn or see-through clothes. Take off shoes (and hats) before entering temple halls.",
        vi: "Che **vai và đầu gối**; không mặc đồ bó sát, rách hay xuyên thấu. Cởi giày (và mũ) trước khi vào chánh điện.",
      },
      next: "toInside",
    },
    {
      id: "toInside",
      type: "travel",
      spawn: "inside",
      text: { en: "👕 Cheap T-shirt and loose trousers: bought. Inside the temple courtyard…", vi: "👕 Mua áo thun rẻ và quần dài rộng xong. Bên trong sân chùa…" },
      next: "toShoes",
    },
    {
      id: "toShoes",
      type: "sandbox",
      objective: { en: "Leave your shoes on the rack before the temple hall.", vi: "Để giày lên kệ trước chánh điện." },
      target: "shoes",
      next: "toShrine",
    },
    {
      id: "toShrine",
      type: "sandbox",
      objective: { en: "Visit the golden Buddha image.", vi: "Đến thăm tượng Phật vàng." },
      target: "shrine",
      next: "feet",
    },
    {
      id: "feet",
      type: "choice",
      icon: "🧘",
      prompt: {
        en: "It's hot and your feet hurt. You want to sit on the floor in front of the Buddha image. How?",
        vi: "Trời nóng và chân bạn đau. Bạn muốn ngồi xuống sàn trước tượng Phật. Ngồi thế nào?",
      },
      options: [
        {
          text: { en: "Sit with legs **tucked to the side**, feet pointing away from the Buddha", vi: "Ngồi **gập chân sang một bên**, bàn chân hướng ra xa tượng Phật" },
          points: 10,
          correct: true,
          feedback: {
            en: "Exactly. Feet are the lowest part of the body, so never point them at a Buddha image (or at a person).",
            vi: "Chính xác. Bàn chân là phần thấp nhất của cơ thể, nên đừng bao giờ chĩa chân vào tượng Phật (hay vào người khác).",
          },
        },
        {
          text: { en: "Stretch out your legs towards it, so comfy", vi: "Duỗi thẳng chân về phía tượng, thoải mái ghê" },
          points: 0,
          feedback: {
            en: "Pointing your soles at a Buddha image is very disrespectful. An elderly lady's glare could power the whole city.",
            vi: "Chĩa lòng bàn chân vào tượng Phật là rất bất kính. Ánh nhìn của một bà cụ đủ để chạy điện cả thành phố.",
          },
        },
        {
          text: { en: "Climb up for a selfie with the Buddha", vi: "Trèo lên chụp ảnh tự sướng với tượng Phật" },
          points: 0,
          feedback: {
            en: "Never climb on or pose disrespectfully with a Buddha image. Tourists have been fined and even expelled for this.",
            vi: "Không bao giờ trèo lên hay tạo dáng thiếu tôn trọng với tượng Phật. Có du khách đã bị phạt và thậm chí bị trục xuất vì chuyện này.",
          },
        },
      ],
      tip: {
        en: "Never point your feet at a Buddha image or at people. Sit with your feet tucked behind you. Don't touch people's heads either.",
        vi: "Đừng chĩa chân vào tượng Phật hay vào người khác. Ngồi gập chân ra sau. Cũng đừng chạm vào đầu người khác.",
      },
      next: "toMonk",
    },
    {
      id: "toMonk",
      type: "sandbox",
      objective: { en: "A monk is walking by. Greet him.", vi: "Một nhà sư đang đi ngang. Hãy chào ông." },
      target: "monk",
      next: "monk",
    },
    {
      id: "monk",
      type: "choice",
      icon: "🧘",
      prompt: {
        en: "A monk smiles at you. You'd like to give him a small donation and say hello.",
        vi: "Một nhà sư mỉm cười với bạn. Bạn muốn dâng một khoản cúng nhỏ và chào ông.",
      },
      options: [
        {
          text: { en: "Greet with a **wai** (palms together), and place the donation in the **donation box** or **on a cloth** he holds out", vi: "Chào bằng **wai** (chắp tay), đặt tiền vào **hòm công đức** hoặc **lên tấm vải** ông đưa ra" },
          points: 10,
          correct: true,
          feedback: {
            en: "Good. Women especially shouldn't touch monks or hand things directly to them; use the box or a cloth. A gentle wai is the greeting.",
            vi: "Tốt. Phụ nữ đặc biệt không nên chạm vào nhà sư hay đưa đồ trực tiếp; hãy dùng hòm hoặc tấm vải. Chắp tay wai nhẹ nhàng là cách chào.",
          },
        },
        {
          text: { en: "Pat him on the shoulder and hand the money over directly", vi: "Vỗ vai ông và đưa tiền thẳng vào tay" },
          points: 0,
          feedback: {
            en: "Monks aren't touched (women in particular), and money is given via a box or cloth. Don't pat anyone's head or shoulder either.",
            vi: "Không chạm vào nhà sư (nhất là phụ nữ), tiền được dâng qua hòm hoặc tấm vải. Cũng đừng vỗ đầu hay vai ai.",
          },
        },
        {
          text: { en: "Shake his hand", vi: "Bắt tay ông" },
          points: 2,
          feedback: {
            en: "Handshakes are the Western way. In Thailand the wai is used, and monks aren't touched.",
            vi: "Bắt tay là kiểu phương Tây. Ở Thái dùng wai, và không chạm vào nhà sư.",
          },
        },
      ],
      tip: {
        en: "Greet with a wai (palms together, slight bow). Don't touch monks (especially women) and don't hand them things directly.",
        vi: "Chào bằng wai (chắp tay, cúi nhẹ). Không chạm vào nhà sư (nhất là phụ nữ) và đừng đưa đồ trực tiếp.",
      },
      next: "anthem",
    },
    {
      id: "anthem",
      type: "choice",
      icon: "🎬",
      prompt: {
        en: "**Evening, cinema.** Before the film, a royal anthem plays on the screen and the whole audience stands up. You're holding a giant popcorn.",
        vi: "**Buổi tối, rạp chiếu phim.** Trước phim, nhạc quốc vương vang lên trên màn hình và cả khán phòng đứng dậy. Tay bạn đang ôm thùng bắp rang khổng lồ.",
      },
      options: [
        {
          text: { en: "**Stand up** quietly until the clip ends", vi: "**Đứng dậy** lặng lẽ cho đến khi đoạn clip kết thúc" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes. It's a sign of respect, and it takes less than two minutes. Never joke about the monarchy: Thai law takes it very seriously.",
            vi: "Đúng. Đó là biểu hiện của sự tôn trọng và chỉ mất chưa tới hai phút. Đừng bao giờ đùa về hoàng gia: luật Thái Lan xử lý rất nghiêm.",
          },
        },
        {
          text: { en: "Stay seated and whisper a joke to your friend", vi: "Ngồi yên và thì thầm một câu đùa với bạn" },
          points: 0,
          feedback: {
            en: "Staying seated draws disapproval, and jokes about the royal family can be a **criminal offence** (lèse-majesté). Stand and stay quiet.",
            vi: "Ngồi yên sẽ bị phản đối, còn đùa về hoàng gia có thể là **tội hình sự** (lèse-majesté). Hãy đứng và giữ im lặng.",
          },
        },
      ],
      tip: {
        en: "Stand for the royal anthem in cinemas, and never joke about or insult the monarchy.",
        vi: "Hãy đứng khi nhạc quốc vương vang lên ở rạp, và đừng bao giờ đùa hay xúc phạm hoàng gia.",
      },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      icon: "🇹🇭",
      text: {
        en: "You survived Bangkok with your shoulders covered and your wallet intact. Somewhere across town, a tuk-tuk driver is telling his cousin about the one who got away. Sawasdee!",
        vi: "Bạn đã sống sót ở Bangkok với đôi vai được che kín và chiếc ví còn nguyên. Ở đâu đó trong thành phố, một tài xế tuk-tuk đang kể cho người anh họ nghe về “con mồi” đã thoát. Sawasdee!",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
