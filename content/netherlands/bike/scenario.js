// Netherlands · Amsterdam: buying a bike, locks, bike-lane etiquette and traffic rules.
// Facts checked Oct 2026 (Dutch cycling-rules guides, DutchNews, municipal cycling safety pages):
// • Bikes must have a white/yellow front light and a red rear light, switched on in the dark / at dusk / in poor visibility (fines apply).
// • Holding a phone (or tablet etc.) while cycling is banned; it's fined.
// • Cross tram tracks at a right angle (or as close to it as you can), never along them: narrow wheels get trapped. Trams have priority.
// • At unmarked intersections traffic from the right has priority, including cyclists.
// • Bike theft is common: lock your bike through the frame to a fixed object, ideally with two locks. Buying a bike from a street dealer at a
//   suspiciously low price encourages theft (and can be an offence: handling stolen goods).
// • Red lanes are bike paths: pedestrians should keep off them. The bell is for a friendly warning.

const dealer = { en: "Man on the bridge", vi: "Người đàn ông trên cầu" };
const shop = { en: "Bike shop owner", vi: "Chủ tiệm xe đạp" };

export default {
  id: "netherlands-bike",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "🚲",
      text: {
        en: "**Amsterdam.** There are more bikes than people, and the pedestrian is the endangered species. To live here, you need a bike. Preferably one that wasn't recently fished out of a canal.",
        vi: "**Amsterdam.** Xe đạp nhiều hơn người, và người đi bộ là loài sắp tuyệt chủng. Muốn sống ở đây, bạn cần một chiếc xe đạp. Tốt nhất là chiếc không vừa mới được vớt lên từ kênh đào.",
      },
      next: "toDealer",
    },
    {
      id: "toDealer",
      type: "sandbox",
      objective: { en: "A man by the bridge is whispering at you. Go and listen.", vi: "Một người đàn ông cạnh cầu đang thì thầm gọi bạn. Đến nghe xem." },
      target: "dealer",
      next: "hotBike",
    },
    {
      id: "hotBike",
      type: "choice",
      speaker: dealer,
      icon: "🤫",
      prompt: {
        en: "“Psst. Nice bike, **€30**, no questions. It was my cousin's.” The bike has a freshly cut lock and a very nervous seat post.",
        vi: "“Psst. Xe đẹp, **30 €**, không hỏi han gì. Là của anh họ tôi.” Chiếc xe có ổ khoá mới bị cắt và cái cọc yên run rẩy.",
      },
      options: [
        {
          text: { en: "**Decline** and buy a bike from a proper **shop** (with a receipt)", vi: "**Từ chối** và mua xe ở **cửa hàng** đàng hoàng (có hoá đơn)" },
          points: 10,
          correct: true,
          feedback: {
            en: "Wise. A bargain bike from a street dealer is very likely stolen, and buying it feeds bike theft (it can be an offence too). Shops and verified second-hand sellers give you a receipt.",
            vi: "Khôn ngoan. Xe giá hời từ người bán đường phố rất có thể là xe ăn cắp, mua nó tiếp tay cho nạn trộm xe (còn có thể phạm pháp). Cửa hàng và người bán lại uy tín cho bạn hoá đơn.",
          },
        },
        {
          text: { en: "Buy it: €30 is a steal! (Literally.)", vi: "Mua luôn: 30 € rẻ như cho! (Theo nghĩa đen.)" },
          points: 0,
          feedback: {
            en: "Bad idea: it's probably stolen, the police do check, and the bike may even be re-stolen from you by lunchtime. Buy from a shop.",
            vi: "Ý tồi: có thể là xe trộm, cảnh sát có kiểm tra, và xe có thể bị trộm lại trước giờ ăn trưa. Hãy mua ở cửa hàng.",
          },
        },
      ],
      tip: {
        en: "A very cheap bike from a street seller is probably stolen: buy from a shop or a reliable second-hand seller and keep the receipt.",
        vi: "Xe đạp rẻ bất thường từ người bán đường phố rất có thể là xe trộm: mua ở cửa hàng hoặc người bán lại uy tín và giữ hoá đơn.",
      },
      next: "toShop",
    },
    {
      id: "toShop",
      type: "sandbox",
      objective: { en: "Go to the bike shop.", vi: "Đến cửa hàng xe đạp." },
      target: "bikeShop",
      next: "shopInfo",
    },
    {
      id: "shopInfo",
      type: "info",
      speaker: shop,
      icon: "🧔",
      text: {
        en: "“A good second-hand bike, lights included. And buy **two locks**: a frame lock and a chain. In this city, a single lock is a suggestion.” You pay, ride out and feel instantly 40% more Dutch.",
        vi: "“Một chiếc xe đạp cũ tốt, kèm đèn. Và hãy mua **hai ổ khoá**: khoá khung và dây xích. Ở thành phố này, một ổ khoá chỉ là lời đề nghị.” Bạn trả tiền, đạp ra khỏi tiệm và thấy mình ngay lập tức giống người Hà Lan hơn 40%.",
      },
      next: "toRack",
    },
    {
      id: "toRack",
      type: "sandbox",
      objective: { en: "Park your new bike at the rack by the canal.", vi: "Gửi xe mới ở giá cạnh kênh." },
      target: "rack",
      next: "lock",
    },
    {
      id: "lock",
      type: "choice",
      icon: "🔒",
      prompt: {
        en: "You park next to a hundred other bikes. You're only going for a coffee: **ten minutes**.",
        vi: "Bạn gửi xe cạnh cả trăm chiếc khác. Bạn chỉ đi uống cà phê: **mười phút**.",
      },
      options: [
        {
          text: { en: "Lock the **frame** to a **fixed object** (rack), ideally with **two locks**", vi: "Khoá **khung xe** vào **vật cố định** (giá), tốt nhất bằng **hai ổ khoá**" },
          points: 10,
          correct: true,
          feedback: {
            en: "Exactly. Bike theft is common: lock through the frame and to something fixed. A second chain lock makes thieves look for an easier bike.",
            vi: "Chính xác. Trộm xe phổ biến: khoá xuyên qua khung và vào vật cố định. Thêm ổ khoá dây xích khiến kẻ trộm đi tìm xe dễ hơn.",
          },
        },
        {
          text: { en: "Don't bother locking: it's only ten minutes", vi: "Không cần khoá: chỉ mười phút thôi" },
          points: 0,
          feedback: {
            en: "In ten minutes it can be gone, and you'll join the club of people who've lost their first Dutch bike in under an hour.",
            vi: "Chỉ mười phút là có thể mất, và bạn sẽ gia nhập hội những người mất chiếc xe Hà Lan đầu tiên chưa tới một giờ.",
          },
        },
        {
          text: { en: "Lock just the **wheel** to itself", vi: "Chỉ khoá **bánh xe** vào chính nó" },
          points: 2,
          feedback: {
            en: "That only stops you riding away: someone can simply lift the bike into a van. Attach it to something fixed.",
            vi: "Cách đó chỉ chặn bạn đạp đi: ai đó có thể nhấc cả xe lên ô tô. Hãy gắn vào vật cố định.",
          },
        },
      ],
      tip: {
        en: "Lock your bike through the frame to a fixed object, ideally with two locks.",
        vi: "Khoá xe xuyên qua khung vào vật cố định, tốt nhất bằng hai ổ khoá.",
      },
      next: "toPhoto",
    },
    {
      id: "toPhoto",
      type: "sandbox",
      objective: { en: "Walk along the quay to the photo spot by the canal.", vi: "Đi dọc bờ kênh tới điểm chụp ảnh." },
      target: "photo",
      next: "photoChoice",
    },
    {
      id: "photoChoice",
      type: "choice",
      icon: "📸",
      prompt: {
        en: "The light on the canal is perfect. You step back to fit the houses in… onto the **red** strip of asphalt. A bell: **ding-ding!** A cyclist is heading straight at you.",
        vi: "Ánh sáng trên kênh thật hoàn hảo. Bạn lùi lại để lấy trọn dãy nhà… lên dải nhựa đường **đỏ**. Một tiếng chuông: **kính-coong!** Một người đạp xe đang lao thẳng tới.",
      },
      options: [
        {
          text: { en: "Step **back onto the pavement**: the red surface is the bike path", vi: "Bước **trở lại vỉa hè**: mặt đỏ là đường dành cho xe đạp" },
          points: 10,
          correct: true,
          feedback: {
            en: "Good reflex. In the Netherlands the red lanes belong to bikes; pedestrians use the pavement. Always look both ways before stepping onto one.",
            vi: "Phản xạ tốt. Ở Hà Lan các làn đỏ dành cho xe đạp; người đi bộ dùng vỉa hè. Luôn nhìn hai bên trước khi bước vào.",
          },
        },
        {
          text: { en: "Stay put: they'll go around", vi: "Đứng yên: họ sẽ đi vòng qua" },
          points: 0,
          feedback: {
            en: "They won't have time. A pedestrian on the bike path is known locally as a “learning experience”.",
            vi: "Họ sẽ không kịp. Người đi bộ trên làn xe đạp được dân địa phương gọi là một “trải nghiệm học hỏi”.",
          },
        },
      ],
      tip: {
        en: "Red surfaces are bike paths: pedestrians keep to the pavement.",
        vi: "Mặt đường đỏ là làn xe đạp: người đi bộ đi trên vỉa hè.",
      },
      next: "toLane",
    },
    {
      id: "toLane",
      type: "travel",
      spawn: "lane",
      text: { en: "🌆 Dusk. Time to ride home.", vi: "🌆 Hoàng hôn. Đạp xe về nhà thôi." },
      next: "lights",
    },
    {
      id: "lights",
      type: "choice",
      icon: "💡",
      prompt: {
        en: "It's getting dark. Your bike came with front and rear lights, but they're off. You know the way, and it's only fifteen minutes.",
        vi: "Trời tối dần. Xe của bạn có đèn trước và sau, nhưng đang tắt. Bạn thuộc đường và chỉ mất mười lăm phút.",
      },
      options: [
        {
          text: { en: "Switch both lights **on**: white/yellow in front, **red** behind", vi: "**Bật** cả hai đèn: trắng/vàng phía trước, **đỏ** phía sau" },
          points: 10,
          correct: true,
          feedback: {
            en: "Required by law when it's dark, at dusk or in poor visibility, and the police do hand out fines. It also stops you from being invisible to trams.",
            vi: "Bắt buộc theo luật khi trời tối, lúc chạng vạng hoặc tầm nhìn kém, và cảnh sát có phạt. Nó cũng giúp bạn không “vô hình” với tàu điện.",
          },
        },
        {
          text: { en: "Ride without: lights are for beginners", vi: "Đạp không đèn: đèn là cho người mới" },
          points: 0,
          feedback: {
            en: "You can be fined, and you're invisible to everyone around you. Lights on, always, when it's dark.",
            vi: "Bạn có thể bị phạt và vô hình với mọi người quanh bạn. Luôn bật đèn khi trời tối.",
          },
        },
      ],
      tip: {
        en: "Bike lights (white/yellow front, red rear) are mandatory when it's dark or dusk.",
        vi: "Đèn xe đạp (trước trắng/vàng, sau đỏ) là bắt buộc khi trời tối hoặc chạng vạng.",
      },
      next: "phone",
    },
    {
      id: "phone",
      type: "choice",
      icon: "📱",
      prompt: {
        en: "You need directions. Your phone buzzes with a map: you're riding along the canal with one hand free.",
        vi: "Bạn cần chỉ đường. Điện thoại rung lên với bản đồ: bạn đang đạp bên kênh với một tay rảnh.",
      },
      options: [
        {
          text: { en: "**Stop** at the side to look at the map, then ride on", vi: "**Dừng lại** bên đường xem bản đồ rồi đạp tiếp" },
          points: 10,
          correct: true,
          feedback: {
            en: "Correct. Holding a phone while cycling is banned in the Netherlands (it can be fined). Pull over safely, or use a mount and voice directions.",
            vi: "Đúng. Cầm điện thoại khi đạp xe bị cấm ở Hà Lan (có thể bị phạt). Hãy tấp vào an toàn hoặc dùng giá gắn và chỉ đường bằng giọng nói.",
          },
        },
        {
          text: { en: "Hold the phone in one hand and steer with the other", vi: "Cầm điện thoại một tay, lái bằng tay còn lại" },
          points: 0,
          feedback: {
            en: "That's what the fine is for. Dutch roads are busy and unforgiving. Stop first.",
            vi: "Đó chính là điều tiền phạt dành cho. Đường Hà Lan đông và không khoan nhượng. Hãy dừng trước.",
          },
        },
      ],
      tip: {
        en: "Don't hold your phone while cycling in the Netherlands: stop first or use a mount / voice directions.",
        vi: "Không cầm điện thoại khi đạp xe ở Hà Lan: hãy dừng lại trước hoặc dùng giá gắn / chỉ đường giọng nói.",
      },
      next: "tram",
    },
    {
      id: "tram",
      type: "choice",
      icon: "🚋",
      prompt: {
        en: "The cycle path crosses a pair of **tram rails**. The rails run diagonally across your route.",
        vi: "Làn xe đạp cắt ngang một cặp **đường ray tàu điện**. Đường ray chạy chéo qua lộ trình của bạn.",
      },
      options: [
        {
          text: { en: "**Cross at (nearly) a right angle**, slowly and upright", vi: "**Cắt ngang ở góc (gần) vuông**, chậm và giữ thẳng người" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes. Narrow bike wheels get trapped in the groove if you cross at a shallow angle or ride along the rails. Aim for 90°, and remember: trams have priority.",
            vi: "Đúng. Bánh xe đạp hẹp dễ kẹt vào rãnh nếu bạn cắt xiên hoặc đạp dọc đường ray. Hãy hướng gần 90° và nhớ: tàu điện được ưu tiên.",
          },
        },
        {
          text: { en: "Cross at a shallow angle to keep your speed up", vi: "Cắt xiên để giữ tốc độ" },
          points: 0,
          feedback: {
            en: "That's how wheels get stuck in the rail groove and riders go flying. Slow down and cross straight.",
            vi: "Đó là cách bánh xe bị kẹt vào rãnh ray và người đạp văng ra. Hãy chậm lại và cắt thẳng.",
          },
        },
        {
          text: { en: "Ride along the rails: they're nice and smooth", vi: "Đạp dọc theo đường ray: phẳng lì mà" },
          points: 0,
          feedback: {
            en: "Rails are slippery in the rain and the groove traps your wheel. Stay off them.",
            vi: "Đường ray trơn khi mưa và rãnh kẹp bánh xe. Hãy tránh xa.",
          },
        },
      ],
      tip: {
        en: "Cross tram rails at a right angle, not along them: wheels get trapped. Trams always have priority.",
        vi: "Cắt qua đường ray tàu điện ở góc vuông, không đi dọc theo: bánh xe dễ bị kẹt. Tàu điện luôn được ưu tiên.",
      },
      next: "priority",
    },
    {
      id: "priority",
      type: "choice",
      icon: "➡️",
      prompt: {
        en: "A small unmarked junction. A cyclist is coming from your **right**; you're on a big road.",
        vi: "Một ngã tư nhỏ không có biển báo. Một người đạp xe đang tới từ bên **phải** bạn; bạn đang ở đường lớn.",
      },
      options: [
        {
          text: { en: "**Give way** to traffic from the right (cyclists too)", vi: "**Nhường đường** cho xe từ bên phải (cả xe đạp)" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right. At unmarked junctions in the Netherlands, traffic from the right has priority, even bikes. Check the shark teeth markings (they mean give way) too.",
            vi: "Đúng. Ở ngã tư không biển báo tại Hà Lan, xe từ bên phải được ưu tiên, kể cả xe đạp. Cũng nhìn vạch răng cưa (nghĩa là nhường đường).",
          },
        },
        {
          text: { en: "Keep going: you're on the bigger road", vi: "Cứ đi: bạn đang ở đường lớn hơn" },
          points: 0,
          feedback: {
            en: "Size doesn't matter at an unmarked junction: the right has priority. Expect a very Dutch bell.",
            vi: "Kích thước không quan trọng ở ngã tư không biển: bên phải được ưu tiên. Chờ một tiếng chuông rất Hà Lan.",
          },
        },
      ],
      tip: {
        en: "At unmarked junctions, traffic from the right has priority (cyclists included).",
        vi: "Ở ngã tư không biển báo, xe đến từ bên phải được ưu tiên (kể cả xe đạp).",
      },
      next: "dodge",
    },
    {
      id: "dodge",
      type: "minigame",
      game: "lane",
      objective: { en: "Ride the bike lane: ring your bell for tourists, avoid the rails and the pavement!", vi: "Đạp xe trên làn xe đạp: rung chuông cho du khách, tránh đường ray và vỉa hè!" },
      params: {
        title: { en: "Rush hour on the fietspad", vi: "Giờ cao điểm trên làn xe đạp" },
        hint: { en: "← → (or tap a lane) · Space = ring the bell", vi: "← → (hoặc chạm vào làn) · Space = rung chuông" },
        player: "🚴",
        bg: "#c9514a",
        lanes: [
          { kind: "forbidden", label: { en: "Pavement", vi: "Vỉa hè" }, color: "#cfc8bd", why: { en: "You're riding on the pavement among pedestrians. Stay on the bike path!", vi: "Bạn đang đạp trên vỉa hè giữa người đi bộ. Hãy ở trên làn xe đạp!" } },
          { kind: "ok", color: "#d9645a" },
          { kind: "ok", color: "#c9514a" },
          { kind: "ok", color: "#d9645a" },
          { kind: "forbidden", label: { en: "Tram rails", vi: "Đường ray" }, color: "#a9a49a", why: { en: "Your wheel is stuck in the tram rails! Never ride along them.", vi: "Bánh xe của bạn kẹt vào đường ray! Đừng bao giờ đạp dọc theo.", } },
        ],
        startLane: 2,
        duration: 36,
        hearts: 3,
        drainEvery: 2,
        spawnEvery: [0.55, 1.0],
        actionIcon: "🔔",
        actionLabel: { en: "Ring bell", vi: "Rung chuông" },
        action: { id: "bell", clears: ["tourist", "dog"], cooldown: 1.6, range: 0.6 },
        obstacles: [
          { id: "tourist", icon: "🧍", speed: 0.34, lanes: [1, 2, 3], weight: 3, why: { en: "A tourist wandered into the bike lane. Ring your bell early!", vi: "Một du khách lạc vào làn xe đạp. Hãy rung chuông sớm!" } },
          { id: "scooter", icon: "🛵", speed: 0.62, lanes: [1, 2, 3], weight: 2, why: { en: "A fast scooter on the bike lane: they're allowed here. Watch out!", vi: "Một chiếc xe máy nhanh trên làn xe đạp: loại này được phép đi ở đây. Cẩn thận!" } },
          { id: "bike", icon: "🚲", speed: 0.4, lanes: [1, 2, 3], weight: 2, why: { en: "A rental bike was dropped across the lane. Leave room!", vi: "Một chiếc xe đạp thuê bị bỏ ngang làn. Chừa khoảng trống!" } },
          { id: "dog", icon: "🐕", speed: 0.45, lanes: [1, 2, 3], weight: 1, why: { en: "A dog on a long leash crossed the path. Ring first!", vi: "Một chú chó dây dài băng qua. Hãy rung chuông trước!" } },
        ],
        pickups: [
          { id: "stroopwafel", icon: "🧇", points: 1 },
          { id: "tulip", icon: "🌷", points: 1 },
        ],
        failText: { en: "Too many collisions. “Learning experience” unlocked. Try again!", vi: "Quá nhiều va chạm. Mở khoá “trải nghiệm học hỏi”. Thử lại!" },
        doneText: { en: "You rode home like a local!", vi: "Bạn đạp về nhà như người bản xứ!" },
        seed: 21,
      },
      tip: {
        en: "Stay on the bike path, ring your bell early, and stay off tram rails and the pavement.",
        vi: "Ở yên trên làn xe đạp, rung chuông sớm, tránh đường ray tàu điện và vỉa hè.",
      },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      icon: "🇳🇱",
      text: {
        en: "You park with two locks, lights on, phone in your pocket. A local nods at you: the highest Dutch compliment is a silent nod. **Emergency: 112.** Welcome to the fietspad!",
        vi: "Bạn gửi xe với hai ổ khoá, đèn sáng, điện thoại trong túi. Một người địa phương gật đầu với bạn: lời khen cao nhất của người Hà Lan là cái gật đầu im lặng. **Khẩn cấp: 112.** Chào mừng đến làn xe đạp!",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
