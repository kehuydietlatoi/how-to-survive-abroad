// Japan · Tokyo rush hour.
// Facts checked Oct 2026 (JR East / JRailPass etiquette guides, general Japan travel guidance):
// • IC cards (Suica, PASMO…) are tapped on the gate reader; gates close if the card is invalid / low on balance.
// • Priority seats: courtesy seats for elderly, disabled, pregnant, injured passengers, parents with infants.
//   Not legally enforced, but firmly observed. Phones: silent ("manner mode"), no calls on trains.
// • Backpacks: hold in front or place on the overhead rack in a crowded car.
// • Eating: drinks are fine; eating full meals on local commuter trains is frowned upon (fine on shinkansen / long-distance).
// • Public bins are scarce in Japan; people carry their rubbish home. Vending-machine bins are for bottles and cans.
// • Lost property: report at the nearest kōban (police box) or the station office; cash and wallets are often handed back.

const you = { en: "You", vi: "Bạn" };
const officer = { en: "Officer Tanaka (kōban)", vi: "Cảnh sát Tanaka (kōban)" };

const ITEMS = [
  {
    id: "call",
    icon: "📞",
    text: { en: "Taking a phone **call** on the train", vi: "**Nghe điện thoại** trên tàu" },
    answer: "left",
    why: { en: "Calls are considered rude on trains. Text, or step off and call from the platform.", vi: "Gọi điện trên tàu bị coi là bất lịch sự. Hãy nhắn tin, hoặc xuống sân ga rồi gọi." },
  },
  {
    id: "text",
    icon: "📱",
    text: { en: "**Silently** texting with your phone on silent mode", vi: "Nhắn tin **im lặng**, điện thoại để chế độ im lặng" },
    answer: "right",
    why: { en: "Silent (“manner”) mode is exactly right. Keep it that way, especially near priority seats.", vi: "Chế độ im lặng (“manner mode”) là chuẩn rồi. Giữ vậy, nhất là gần ghế ưu tiên." },
  },
  {
    id: "headphones",
    icon: "🎧",
    text: { en: "Headphones turned up so **loud** the whole car can hear", vi: "Tai nghe mở **to** đến mức cả toa nghe thấy" },
    answer: "left",
    why: { en: "Sound leaking from headphones annoys people. Keep the volume low.", vi: "Âm thanh rò rỉ từ tai nghe làm phiền mọi người. Hãy để âm lượng nhỏ." },
  },
  {
    id: "backpack",
    icon: "🎒",
    text: { en: "Keeping a big **backpack on your back** in a packed car", vi: "Đeo **ba lô to sau lưng** trong toa chật cứng" },
    answer: "left",
    why: { en: "It bumps everyone behind you. Hold it in front of you or put it on the overhead rack.", vi: "Ba lô đụng vào người phía sau. Hãy ôm phía trước hoặc đặt lên giá hành lý." },
  },
  {
    id: "bento",
    icon: "🍱",
    text: { en: "Unpacking a full **bento lunch** on a commuter train", vi: "Mở nguyên **hộp cơm bento** ăn trên tàu đi làm" },
    answer: "left",
    why: {
      en: "Smelly meals on packed local trains are frowned upon. (Shinkansen and long-distance trains are a different story: bento is half the fun there.)",
      vi: "Ăn đồ nặng mùi trên tàu nội đô đông người bị cho là thiếu lịch sự. (Tàu shinkansen và đường dài thì khác: ăn bento là một nửa niềm vui.)",
    },
  },
  {
    id: "tea",
    icon: "🍵",
    text: { en: "Sipping a **bottled tea**", vi: "Nhấp ngụm **trà đóng chai**" },
    answer: "right",
    why: { en: "A quiet drink is fine on most trains.", vi: "Uống nhẹ nhàng thì ổn trên hầu hết các chuyến tàu." },
  },
  {
    id: "priority",
    icon: "🧓",
    text: { en: "Staying in the **priority seat** while an elderly passenger boards", vi: "Ngồi yên ở **ghế ưu tiên** khi một cụ già lên tàu" },
    answer: "left",
    why: { en: "Priority seats are for older, injured, pregnant passengers and parents with babies. Stand up and offer it.", vi: "Ghế ưu tiên dành cho người lớn tuổi, bị thương, mang thai và người bế trẻ nhỏ. Hãy đứng dậy nhường." },
  },
  {
    id: "exit",
    icon: "🚪",
    text: { en: "Waiting beside the door until everyone has **got off**, then boarding", vi: "Đứng sang bên cạnh cửa, đợi mọi người **xuống hết** rồi mới lên" },
    answer: "right",
    why: { en: "Exactly. Let passengers out first, then board in an orderly line.", vi: "Chính xác. Để người xuống trước, rồi xếp hàng lên tàu." },
  },
  {
    id: "chat",
    icon: "🗣️",
    text: { en: "Chatting **quietly** with a friend", vi: "Trò chuyện **nhỏ tiếng** với bạn" },
    answer: "right",
    why: { en: "Low voices are fine. It's loud group conversations that stand out.", vi: "Nói nhỏ thì không sao. Chỉ nhóm nói chuyện ồn ào mới nổi bật." },
  },
  {
    id: "nap",
    icon: "😴",
    text: { en: "**Dozing off** in your seat (inemuri)", vi: "**Ngủ gật** trên ghế (inemuri)" },
    answer: "right",
    why: {
      en: "So common it has a name: inemuri. Just don't lean on your neighbour, and keep one eye on your stop.",
      vi: "Phổ biến đến mức có hẳn tên riêng: inemuri. Chỉ cần đừng ngả vào người bên cạnh, và nhớ canh trạm xuống.",
    },
  },
];

export default {
  id: "japan-rush-hour",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "🚇",
      text: {
        en: "**Tokyo, 8:15 a.m.** Rush hour: the carriage will hold more people than the fire code allows and fewer than the shame you'd feel breaking a rule. Your personal space will be returned at the next station. Maybe. You have a Suica IC card.",
        vi: "**Tokyo, 8:15 sáng.** Giờ cao điểm: toa tàu chứa nhiều người hơn quy định cho phép, nhưng ít hơn nỗi xấu hổ khi bạn phạm luật bất thành văn. Không gian riêng của bạn sẽ được trả lại ở ga sau. Có thể. Bạn có thẻ IC Suica.",
      },
      next: "toGate",
    },
    {
      id: "toGate",
      type: "sandbox",
      objective: { en: "Walk to the ticket gates inside the station.", vi: "Đi tới cổng soát vé trong nhà ga." },
      target: "gate",
      wrong: {
        koban: { feedback: { en: "Not yet! The kōban is for emergencies, and you have a train to catch.", vi: "Chưa đâu! Kōban dành cho việc khẩn cấp, mà bạn còn phải bắt tàu." } },
      },
      next: "gateChoice",
    },
    {
      id: "gateChoice",
      type: "choice",
      icon: "🎫",
      prompt: {
        en: "Rows of gates, a wall of commuters behind you. Your IC card is in your wallet at the bottom of your bag.",
        vi: "Dãy cổng soát vé, sau lưng là cả đám người đi làm. Thẻ IC nằm trong ví ở đáy túi.",
      },
      options: [
        {
          text: { en: "Step aside, take the card out, then **tap it on the reader** and walk through", vi: "Tránh sang bên, lấy thẻ ra rồi **chạm vào đầu đọc** và đi qua" },
          points: 10,
          correct: true,
          feedback: {
            en: "Beep, green light, flap open. Keep the card ready before you reach the gate so the queue doesn't pile up.",
            vi: "Bíp, đèn xanh, cửa mở. Hãy chuẩn bị thẻ trước khi tới cổng để hàng người không bị ùn.",
          },
        },
        {
          text: { en: "Slip through **right behind** the person ahead before the flap closes", vi: "Lách qua **sát sau** người phía trước trước khi cửa đóng" },
          points: 0,
          feedback: {
            en: "That's fare evasion. The flap slams shut, an alarm beeps and a station worker appears. Everyone watches.",
            vi: "Đó là trốn vé. Cửa sập lại, chuông báo kêu và nhân viên ga xuất hiện. Cả hàng nhìn bạn.",
          },
        },
        {
          text: { en: "Stop dead in front of the gate and dig through your bag", vi: "Đứng khựng ngay trước cổng và lục túi" },
          points: 3,
          feedback: {
            en: "Everyone behind you now has a silent opinion about you. Step aside first, then search.",
            vi: "Mọi người phía sau đang có một ý kiến im lặng về bạn. Hãy tránh sang bên rồi mới lục.",
          },
        },
      ],
      tip: {
        en: "Have your IC card (Suica / PASMO) in hand before the gate, tap and keep moving. If the flap closes, step aside; the station staff will help.",
        vi: "Chuẩn bị sẵn thẻ IC (Suica / PASMO) trước cổng, chạm và đi tiếp. Nếu cửa đóng, hãy tránh sang bên; nhân viên ga sẽ hỗ trợ.",
      },
      next: "toPlatform",
    },
    {
      id: "toPlatform",
      type: "travel",
      spawn: "platform",
      text: { en: "🚉 On the platform…", vi: "🚉 Trên sân ga…" },
      next: "queue",
    },
    {
      id: "queue",
      type: "sandbox",
      objective: { en: "Join the line at the blue door mark on the platform.", vi: "Xếp vào hàng ở vạch xanh trước cửa tàu." },
      target: "queueMark",
      next: "boarding",
    },
    {
      id: "boarding",
      type: "choice",
      icon: "🚆",
      onEnter: [{ do: "visible", id: "train", on: true }],
      prompt: {
        en: "The train arrives and the doors open. A wave of people wants to **get off**. You're standing right in front of the door.",
        vi: "Tàu vào ga, cửa mở. Một làn sóng người muốn **xuống tàu**. Bạn đang đứng ngay trước cửa.",
      },
      options: [
        {
          text: { en: "Step to the **side** of the door, let everyone out, then board", vi: "Bước sang **bên** cửa, để mọi người xuống hết rồi mới lên" },
          points: 10,
          correct: true,
          feedback: {
            en: "Perfect. The line forms on both sides of the door, passengers exit in the middle, then you board in order.",
            vi: "Chuẩn. Hàng xếp hai bên cửa, hành khách xuống ở giữa, rồi bạn lên theo thứ tự.",
          },
        },
        {
          text: { en: "Push in immediately: the train only stops for 30 seconds", vi: "Chen lên ngay: tàu chỉ dừng 30 giây" },
          points: 0,
          feedback: {
            en: "You collide with a wall of exiting commuters. Let them out first; the doors stay open long enough.",
            vi: "Bạn đâm sầm vào cả bức tường người đang xuống. Hãy để họ xuống trước; cửa mở đủ lâu mà.",
          },
        },
        {
          text: { en: "Cut in front of the line, you're very late", vi: "Chen lên đầu hàng vì bạn rất trễ" },
          points: 0,
          feedback: {
            en: "Queue-jumping is the cardinal sin. Nobody says anything. Everybody remembers.",
            vi: "Chen hàng là tội nặng nhất. Không ai nói gì. Nhưng ai cũng nhớ.",
          },
        },
      ],
      tip: {
        en: "Line up at the door marks on the platform, stand to the side while people exit, then board in order.",
        vi: "Xếp hàng theo vạch trước cửa tàu, đứng sang bên khi người xuống, rồi lên theo thứ tự.",
      },
      next: "ride",
    },
    {
      id: "ride",
      type: "minigame",
      game: "swipe",
      objective: { en: "Judge every behaviour: OK or not OK on a Tokyo train?", vi: "Phán xét từng hành vi: được hay không được trên tàu ở Tokyo?" },
      params: {
        title: { en: "OK on a Tokyo train?", vi: "Có được trên tàu ở Tokyo không?" },
        left: { label: { en: "Not OK", vi: "Không được" }, icon: "🙅", color: "#e5484d" },
        right: { label: { en: "OK", vi: "Được" }, icon: "👌", color: "#2f9e44" },
        secondsPerCard: 7,
        items: ITEMS,
      },
      tip: {
        en: "On trains: phone on silent, no calls, backpack in front, no smelly meals on commuter lines, offer priority seats, and let people off first.",
        vi: "Trên tàu: điện thoại để im lặng, không gọi điện, ôm ba lô phía trước, không ăn đồ nặng mùi trên tàu nội đô, nhường ghế ưu tiên và để người xuống trước.",
      },
      next: "wrapper",
    },
    {
      id: "wrapper",
      type: "choice",
      icon: "🍙",
      onEnter: [{ do: "teleport", spawn: "start" }],
      prompt: {
        en: "Back outside the station you've finished your onigiri. You look around: **not a single public bin** in sight. What do you do with the wrapper?",
        vi: "Ra khỏi ga, bạn ăn xong nắm cơm onigiri. Nhìn quanh: **không có một thùng rác công cộng nào**. Bạn làm gì với cái vỏ?",
      },
      options: [
        {
          text: { en: "Put it in your bag and **take it with you** until you find a bin", vi: "Cho vào túi và **mang theo** đến khi gặp thùng rác" },
          points: 10,
          correct: true,
          feedback: {
            en: "That's what everyone does. Public bins are rare in Japan, so people carry their rubbish home. Pack a little bag for it.",
            vi: "Ai cũng làm vậy. Thùng rác công cộng rất hiếm ở Nhật nên người ta mang rác về nhà. Hãy mang theo một túi nhỏ.",
          },
        },
        {
          text: { en: "Use the bin next to the **vending machines**", vi: "Bỏ vào thùng cạnh **máy bán hàng tự động**" },
          points: 3,
          feedback: {
            en: "That bin is only for **bottles and cans** (and often sorted). Wrappers don't belong there.",
            vi: "Thùng đó chỉ dành cho **chai và lon** (và thường được phân loại). Vỏ bọc không thuộc về đó.",
          },
        },
        {
          text: { en: "Drop it by the kerb. Someone from the city will deal with it", vi: "Thả xuống lề đường. Sẽ có người của thành phố dọn" },
          points: 0,
          feedback: {
            en: "Littering is a serious social sin and can be fined. Streets are clean because everyone carries their own trash.",
            vi: "Xả rác là tội xã hội rất nặng và có thể bị phạt. Đường sạch vì ai cũng tự mang rác của mình.",
          },
        },
      ],
      tip: {
        en: "Carry a small bag for rubbish: public bins are scarce. Vending-machine bins are for bottles and cans only.",
        vi: "Mang theo túi nhỏ đựng rác: thùng rác công cộng rất hiếm. Thùng cạnh máy bán hàng chỉ dành cho chai và lon.",
      },
      next: "wallet",
    },
    {
      id: "wallet",
      type: "choice",
      icon: "😱",
      prompt: {
        en: "You pat your pockets. **Your wallet is gone!** Last seen on the platform bench. Your whole life is in it, plus your card, a stamp-card for ramen and a photo of your cat.",
        vi: "Bạn sờ túi. **Ví mất rồi!** Lần cuối thấy là trên ghế ở sân ga. Cả cuộc đời nằm trong đó, cùng thẻ, thẻ tích điểm ramen và ảnh con mèo.",
      },
      options: [
        {
          text: { en: "Report it at the **kōban** (police box) or station office", vi: "Báo ngay ở **kōban** (đồn cảnh sát nhỏ) hoặc văn phòng ga" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes! Lost property in Japan is surprisingly often returned, cash included. A kōban is on nearly every corner.",
            vi: "Đúng! Đồ thất lạc ở Nhật khá thường được trả lại, kể cả tiền mặt. Gần như góc phố nào cũng có kōban.",
          },
        },
        {
          text: { en: "Assume it's gone and cancel your cards first, then report it", vi: "Coi như mất, khoá thẻ trước rồi mới báo" },
          points: 6,
          feedback: {
            en: "Cancelling cards is smart, but do **both**, and start with the report: it's often found within hours.",
            vi: "Khoá thẻ là khôn ngoan, nhưng hãy làm **cả hai**, và báo mất trước: thường tìm lại được trong vài giờ.",
          },
        },
        {
          text: { en: "Give up, it's Tokyo, it's hopeless", vi: "Bỏ cuộc, ở Tokyo thì hết hy vọng thôi" },
          points: 0,
          feedback: {
            en: "Quite the opposite. Japan is famous for its returned wallets. Giving up is the only way to lose it for sure.",
            vi: "Ngược lại hoàn toàn. Nhật nổi tiếng vì ví được trả lại. Bỏ cuộc mới là cách chắc chắn mất ví.",
          },
        },
      ],
      tip: {
        en: "Lost something? Go to the nearest kōban or the station's lost-property office. Items are often returned.",
        vi: "Mất đồ? Đến kōban gần nhất hoặc văn phòng đồ thất lạc của ga. Đồ thường được trả lại.",
      },
      next: "toKoban",
    },
    {
      id: "toKoban",
      type: "sandbox",
      objective: { en: "Walk to the kōban beside the station.", vi: "Đi tới kōban cạnh nhà ga." },
      target: "koban",
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      speaker: officer,
      icon: "👮",
      text: {
        en: "“Ah, a black wallet? A kind passenger handed it in twenty minutes ago. Please check the contents… and sign here.” Everything is inside, including the cat photo. The only thing not returned is your dignity from the 8:15 train.",
        vi: "“À, ví đen đúng không? Một hành khách tốt bụng đã nộp từ hai mươi phút trước. Mời kiểm tra đồ bên trong… và ký vào đây.” Mọi thứ vẫn còn nguyên, cả ảnh con mèo. Thứ duy nhất không được trả lại là phẩm giá của bạn trên chuyến tàu 8:15.",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
