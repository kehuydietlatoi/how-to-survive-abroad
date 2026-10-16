// India · Delhi: auto-rickshaw fare, a cow in the road, a chai stall.
// Facts checked Oct 2026 (Delhi High Court coverage on auto meters, traveller guides on autos in India, UberAUTO/Ola/Rapido):
// • Autos are required to use the fare meter, but many drivers refuse ("meter broken") and quote a fixed price.
//   Safer options: ride-hailing apps (Uber, Ola, Rapido list autos with the price shown first) or agree the fare BEFORE getting in.
//   All rupee numbers in this scenario are illustrative, not an official rate card.
// • Cows roam city streets and have de-facto right of way; drivers wait or drive around.
// • UPI QR codes are used almost everywhere for small payments; some UPI apps support foreign visitors, otherwise carry small cash.
// • Use the right hand for eating / giving / receiving (the left is considered unclean).
// • The Indian head wobble usually means a friendly "yes / okay / I understand": ask with words when the detail matters.

const driver = { en: "Auto driver", vi: "Tài xế auto" };
const chaiwala = { en: "Chai-wallah", vi: "Người bán chai" };

export default {
  id: "india-auto",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "🛺",
      text: {
        en: "**Delhi, 38 °C.** You've landed with a 12 kg suitcase and a plan. The plan is already melting. The horns are not an emergency: in India the horn is **punctuation**. First mission: get to your guesthouse, 6 km away.",
        vi: "**Delhi, 38 °C.** Bạn vừa hạ cánh với chiếc vali 12 kg và một kế hoạch. Kế hoạch đã tan chảy rồi. Tiếng còi không phải tình huống khẩn cấp: ở Ấn Độ còi là **dấu câu**. Nhiệm vụ đầu tiên: đến nhà nghỉ cách đó 6 km.",
      },
      next: "toStand",
    },
    {
      id: "toStand",
      type: "sandbox",
      objective: { en: "Walk to the auto-rickshaw stand.", vi: "Đi tới bến xe auto-rickshaw." },
      target: "autoStand",
      wrong: {
        truck: { feedback: { en: "Funny truck! But you have a guesthouse to find first.", vi: "Xe tải ngộ nghĩnh! Nhưng bạn cần tìm nhà nghỉ trước đã." } },
      },
      next: "meter",
    },
    {
      id: "meter",
      type: "choice",
      speaker: driver,
      icon: "🛺",
      prompt: {
        en: "“Madam / sir, auto? **Meter kharab** (broken)! I give you special price. Very good price. Only for you.”",
        vi: "“Chị/anh đi auto không? **Đồng hồ hỏng** rồi! Tôi lấy giá đặc biệt. Giá rất tốt. Chỉ riêng cho chị/anh thôi.”",
      },
      options: [
        {
          text: { en: "Say you'll go by meter, or **agree the fare first** before getting in", vi: "Nói đi theo đồng hồ, hoặc **thoả thuận giá trước** khi lên xe" },
          points: 10,
          correct: true,
          feedback: {
            en: "Always settle the price before you sit down. Autos must use meters by law, but many drivers refuse, so a clear, friendly haggle works.",
            vi: "Luôn chốt giá trước khi ngồi. Theo luật auto phải dùng đồng hồ nhưng nhiều tài xế từ chối, nên mặc cả rõ ràng, thân thiện là hiệu quả.",
          },
          next: "haggle",
        },
        {
          text: { en: "Open a **ride-hailing app** (Uber / Ola / Rapido) and book an auto with the price shown", vi: "Mở **ứng dụng gọi xe** (Uber / Ola / Rapido) và đặt auto với giá hiển thị sẵn" },
          points: 8,
          feedback: {
            en: "Smart! Apps show the fare up front, so there's no haggling. A fine option anywhere you have data.",
            vi: "Khôn ngoan! Ứng dụng hiện giá trước, không cần mặc cả. Một lựa chọn tốt ở bất cứ đâu có mạng.",
          },
          next: "appRide",
        },
        {
          text: { en: "Hop in: “We'll sort the price at the end”", vi: "Lên xe luôn: “Cuối chuyến tính giá sau”" },
          points: 0,
          feedback: {
            en: "At the end the price will be 4× what it should be, and you'll have no leverage because you're already at your destination.",
            vi: "Cuối chuyến giá sẽ gấp 4 lần bình thường, và bạn không còn lợi thế gì vì đã đến nơi rồi.",
          },
        },
      ],
      tip: {
        en: "Agree the auto fare **before** getting in (or use the meter / a ride-hailing app that shows the price).",
        vi: "Chốt giá auto **trước khi** lên xe (hoặc dùng đồng hồ / ứng dụng gọi xe hiển thị giá).",
      },
      next: "haggle",
    },
    {
      id: "haggle",
      type: "minigame",
      game: "haggle",
      objective: { en: "Haggle the auto fare. Be friendly, don't insult him!", vi: "Mặc cả giá auto. Thân thiện, đừng xúc phạm ông!" },
      params: {
        title: { en: "Haggle: auto-rickshaw to the guesthouse (6 km)", vi: "Mặc cả: auto tới nhà nghỉ (6 km)" },
        seller: { name: driver, icon: "👳" },
        item: { icon: "🛺", name: { en: "6 km ride", vi: "Chuyến 6 km" } },
        currency: "₹",
        start: 450,
        fair: [90, 150],
        floor: 110,
        step: 5,
        patience: 3,
        lines: {
          open: { en: "“Four hundred fifty rupees only! Meter is broken today, boss!”", vi: "“Bốn trăm năm mươi rupee thôi! Hôm nay đồng hồ hỏng, sếp ơi!”" },
          insult: [
            { en: "“Arre baba! My children will starve!”", vi: "“Trời ơi! Con tôi sẽ đói mất!”" },
            { en: "“Petrol alone costs more than that!”", vi: "“Riêng tiền xăng đã hơn thế rồi!”" },
          ],
          counter: [
            { en: "“Okay okay, special price for you!”", vi: "“Được rồi được rồi, giá đặc biệt cho bạn!”" },
            { en: "“You are tough, boss! Okay, a little less.”", vi: "“Bạn cứng quá! Được, bớt chút.”" },
          ],
          callback: { en: "“Wait wait, come back! Final price!”", vi: "“Khoan khoan, quay lại đi! Giá cuối!”" },
          deal: { en: "“Done! Sit sit, we go!”", vi: "“Xong! Ngồi đi ngồi đi, đi thôi!”" },
          angry: { en: "“Go go, find another auto!” He drives away honking.", vi: "“Đi đi, tìm xe khác!” Ông lái đi, bấm còi inh ỏi." },
          walk: { en: "He shrugs. Another auto pulls up already.", vi: "Ông nhún vai. Một chiếc auto khác đã tấp vào." },
        },
      },
      tip: {
        en: "Haggle with a smile: start well below his ask, stay friendly, and be ready to walk away. Insulting offers burn the seller's patience.",
        vi: "Mặc cả với nụ cười: bắt đầu thấp hơn nhiều giá của ông, thân thiện, và sẵn sàng bỏ đi. Trả giá quá thấp làm người bán mất kiên nhẫn.",
      },
      next: "toCow",
    },
    {
      id: "appRide",
      type: "info",
      icon: "📱",
      text: {
        en: "The app shows your fare in advance. The driver arrives in three minutes, checks your OTP code and, miraculously, uses the meter.",
        vi: "Ứng dụng hiện giá từ trước. Tài xế đến sau ba phút, kiểm tra mã OTP và, thật kỳ diệu, dùng đồng hồ tính tiền.",
      },
      next: "toCow",
    },
    {
      id: "toCow",
      type: "travel",
      spawn: "cow",
      text: { en: "🛺 Bumpy ride, honks everywhere… then the auto stops.", vi: "🛺 Chuyến đi xóc nảy, còi vang khắp nơi… rồi xe dừng lại." },
      next: "cow",
    },
    {
      id: "cow",
      type: "sandbox",
      objective: { en: "A cow has blocked the road. Go and see.", vi: "Một con bò chặn mất đường. Đi xem sao." },
      target: "cow",
      wrong: {
        truck: { feedback: { en: "The truck reads “Horn OK Please”, but this problem has four legs.", vi: "Xe tải ghi “Horn OK Please”, nhưng vấn đề này có bốn chân." } },
      },
      next: "cowChoice",
    },
    {
      id: "cowChoice",
      type: "choice",
      speaker: driver,
      icon: "🐄",
      prompt: {
        en: "A large cow sits calmly in the middle of the road. Cars and autos snake around her. You're late for lunch.",
        vi: "Một con bò to ngồi thản nhiên giữa đường. Xe cộ lượn vòng quanh nó. Bạn sắp trễ bữa trưa.",
      },
      options: [
        {
          text: { en: "**Wait calmly** (or go around her slowly), like everyone else", vi: "**Bình tĩnh chờ** (hoặc đi vòng chậm rãi) như mọi người" },
          points: 10,
          correct: true,
          feedback: {
            en: "Exactly. Cows have the right of way: the driver waits or edges around. Honking at her won't change her mind.",
            vi: "Chính xác. Bò có quyền ưu tiên: tài xế chờ hoặc nhích vòng qua. Bấm còi cũng không đổi ý được nó.",
          },
        },
        {
          text: { en: "Hit the horn for a full minute and shout at the cow", vi: "Bấm còi cả phút và la hét với con bò" },
          points: 0,
          feedback: {
            en: "She has seen worse. Honking at animals is pointless (and many locals consider cows sacred, so be respectful).",
            vi: "Nó từng thấy tệ hơn nhiều. Bấm còi với động vật chẳng có tác dụng (và nhiều người coi bò là linh thiêng nên hãy tôn trọng).",
          },
        },
        {
          text: { en: "Get out and push the cow", vi: "Xuống xe đẩy con bò" },
          points: 0,
          feedback: {
            en: "Please don't. Cows are large, unpredictable and treated with respect. Wait for her to move.",
            vi: "Xin đừng. Bò to, khó đoán và được đối xử trân trọng. Hãy chờ nó tự nhúc nhích.",
          },
        },
      ],
      tip: {
        en: "Cows have the right of way on Indian streets. Wait or go around slowly; don't honk at them or push them.",
        vi: "Bò có quyền ưu tiên trên đường phố Ấn Độ. Chờ hoặc đi vòng chậm rãi; đừng bấm còi hay đẩy chúng.",
      },
      next: "toChai",
    },
    {
      id: "toChai",
      type: "travel",
      spawn: "chai",
      text: { en: "🐄 The cow finally decides to move. Chai time!", vi: "🐄 Con bò cuối cùng cũng chịu nhích. Giờ uống chai thôi!" },
      next: "chai",
    },
    {
      id: "chai",
      type: "sandbox",
      objective: { en: "Order a chai at the stall.", vi: "Gọi một ly chai ở sạp." },
      target: "chai",
      next: "pay",
    },
    {
      id: "pay",
      type: "choice",
      speaker: chaiwala,
      icon: "☕",
      prompt: {
        en: "The chai-wallah pours milky, sweet, spiced tea into a tiny cup in one theatrical arc. It costs about ₹15. You only have one **₹500** note, and there's a **QR code** taped to the counter.",
        vi: "Người bán chai rót trà sữa ngọt, thơm gia vị vào ly nhỏ trong một đường cong đầy kịch tính. Giá khoảng ₹15. Bạn chỉ có một tờ **₹500** và có **mã QR** dán trên quầy.",
      },
      options: [
        {
          text: { en: "Pay with **small notes / coins** (keep some ₹10–20 notes), or scan the **UPI QR** if your app supports it", vi: "Trả bằng **tiền lẻ** (luôn giữ vài tờ ₹10–20), hoặc quét **mã UPI** nếu ứng dụng của bạn hỗ trợ" },
          points: 10,
          correct: true,
          feedback: {
            en: "UPI QR codes are everywhere for small payments, but not every foreign phone works with them, so keep small cash handy.",
            vi: "Mã UPI có khắp nơi cho các khoản nhỏ, nhưng không phải điện thoại nước ngoài nào cũng dùng được, nên luôn giữ ít tiền lẻ.",
          },
        },
        {
          text: { en: "Hand over the ₹500 note for a ₹15 tea", vi: "Đưa tờ ₹500 để trả ly trà ₹15" },
          points: 2,
          feedback: {
            en: "He can't change it and the whole queue sighs. Break big notes at a shop or ATM and keep a stack of small ones.",
            vi: "Ông không thối được và cả hàng người thở dài. Hãy đổi tiền lớn ở cửa hàng hoặc ATM và giữ một xấp tiền lẻ.",
          },
        },
        {
          text: { en: "Haggle: “₹5, my final price!”", vi: "Mặc cả: “₹5, giá cuối của tôi!”" },
          points: 0,
          feedback: {
            en: "Fixed prices at food stalls aren't negotiable. Haggling is for autos and bazaars, not tea.",
            vi: "Giá ở quán ăn là cố định, không mặc cả. Mặc cả dành cho auto và chợ, không phải trà.",
          },
        },
      ],
      tip: {
        en: "Carry small cash (₹10–20 notes). UPI QR payments are common; check whether your app works for foreign visitors.",
        vi: "Mang theo tiền lẻ (tờ ₹10–20). Thanh toán UPI QR rất phổ biến; hãy kiểm tra ứng dụng của bạn có dùng được cho khách nước ngoài không.",
      },
      next: "hand",
    },
    {
      id: "hand",
      type: "choice",
      speaker: chaiwala,
      icon: "🥟",
      prompt: {
        en: "He also hands you a hot samosa on a paper plate. Your **left** hand is holding your phone, your right is free.",
        vi: "Ông còn đưa bạn một chiếc samosa nóng trên đĩa giấy. Tay **trái** bạn đang cầm điện thoại, tay phải rảnh.",
      },
      options: [
        {
          text: { en: "Take it and eat with your **right hand**", vi: "Nhận và ăn bằng **tay phải**" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right! The left hand is traditionally considered unclean, so eat, give and receive with the right (or both hands).",
            vi: "Đúng! Tay trái theo truyền thống được coi là không sạch, nên hãy ăn, đưa và nhận bằng tay phải (hoặc cả hai tay).",
          },
        },
        {
          text: { en: "Grab it with your left hand: it's closer", vi: "Chộp bằng tay trái cho gần" },
          points: 0,
          feedback: {
            en: "Not terrible in an emergency, but you'll get a gentle look. Switch to the right hand.",
            vi: "Không đến nỗi tệ lúc gấp, nhưng bạn sẽ nhận một cái nhìn nhẹ nhàng. Hãy đổi sang tay phải.",
          },
        },
      ],
      tip: {
        en: "Eat, give and receive with your **right** hand (the left is considered unclean).",
        vi: "Hãy ăn, đưa và nhận bằng tay **phải** (tay trái bị coi là không sạch).",
      },
      next: "wobble",
    },
    {
      id: "wobble",
      type: "choice",
      speaker: chaiwala,
      icon: "🙂",
      prompt: {
        en: "You ask, “More sugar?” He tilts his head side to side in a smooth wobble and says nothing. **Yes? No?**",
        vi: "Bạn hỏi: “Thêm đường không?” Ông nghiêng đầu qua lại một nhịp mềm mại và không nói gì. **Có? Không?**",
      },
      options: [
        {
          text: { en: "Usually a friendly “**okay / yes / I hear you**”. Confirm with words if it matters", vi: "Thường là “**được / vâng / tôi hiểu**” thân thiện. Hãy xác nhận bằng lời nếu quan trọng" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes! The head wobble is a flexible “OK”. It's friendly. If you need a clear answer (like sugar), ask again with words.",
            vi: "Đúng! Cái lắc đầu là một chữ “OK” linh hoạt. Nó thân thiện. Nếu cần câu trả lời rõ (như đường), hãy hỏi lại bằng lời.",
          },
        },
        {
          text: { en: "A firm “no”", vi: "Một lời “không” dứt khoát" },
          points: 0,
          feedback: {
            en: "Not at all: that's the opposite of how it's meant. It's closer to “fine, sure”.",
            vi: "Không hề: ngược với ý nghĩa của nó. Gần với “được thôi, chắc chắn” hơn.",
          },
        },
      ],
      tip: {
        en: "The Indian head wobble usually means a friendly “OK”. If the detail matters, confirm with words.",
        vi: "Cái lắc đầu kiểu Ấn thường là một chữ “OK” thân thiện. Nếu chi tiết quan trọng, hãy xác nhận bằng lời.",
      },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      icon: "🇮🇳",
      text: {
        en: "You've learned the three laws of Delhi: **settle the price first, respect the cow, carry small notes**. Behind you, a truck honks twice, which in this city means “good luck!”.",
        vi: "Bạn đã học ba định luật của Delhi: **chốt giá trước, tôn trọng con bò, mang tiền lẻ**. Phía sau, một chiếc xe tải bấm còi hai lần, ở thành phố này nghĩa là “chúc may mắn!”.",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
