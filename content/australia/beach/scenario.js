// Australia · Sydney beach safety.
// Facts checked Oct 2026 (Surf Life Saving Australia / Beachsafe, Better Health Victoria, Queensland government beach safety, SunSmart):
// • Sun protection: Slip on a shirt, Slop on SPF30+ (broad-spectrum, water-resistant) sunscreen and reapply every two hours,
//   Slap on a hat, Seek shade, Slide on sunglasses.
// • Swim between the red-and-yellow flags on a patrolled beach; if there are no flags, lifeguards aren't watching.
// • Caught in a rip: stay calm, float, raise an arm to signal for help. Don't try to swim straight against it. (SLSA's "three Rs": relax, raise, rescue.)
// • Bluebottle sting: don't rub; pick off any tentacles; rinse with sea water; immerse in hot water (as hot as comfortably tolerated);
//   use cold packs if there's no hot water. Seek medical help if severe or you have trouble breathing.
// • Emergency number 000 (on a mobile 112 also works). "Drop bears" are a made-up tall tale told to tourists.

const lifeguard = { en: "Lifeguard", vi: "Nhân viên cứu hộ" };
const local = { en: "Local", vi: "Người địa phương" };

export default {
  id: "australia-beach",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "🏖️",
      text: {
        en: "**Sydney, a perfect 32 °C.** Golden sand, blue sea, and a country where the sun, the surf and roughly half the wildlife are trying to ruin your day. Welcome! Let's make sure you survive it.",
        vi: "**Sydney, 32 °C hoàn hảo.** Cát vàng, biển xanh, và một đất nước nơi mặt trời, sóng biển và khoảng một nửa số động vật hoang dã đang cố phá hỏng ngày của bạn. Chào mừng! Hãy đảm bảo bạn sống sót nhé.",
      },
      next: "toSun",
    },
    {
      id: "toSun",
      type: "sandbox",
      objective: { en: "Visit the sunscreen stand before you do anything else.", vi: "Ghé quầy kem chống nắng trước khi làm bất cứ việc gì khác." },
      target: "sunscreen",
      wrong: {
        water: { feedback: { en: "Whoa, not yet! You've got no sun protection and the lifeguard hasn't said hello. Stand first, swim later.", vi: "Khoan, chưa được! Bạn chưa chống nắng và nhân viên cứu hộ còn chưa chào. Đầu tiên đứng đã, bơi sau." } },
        flags: { feedback: { en: "You'll get there. Sun protection first!", vi: "Rồi bạn sẽ tới đó. Chống nắng trước đã!" } },
      },
      next: "sun",
    },
    {
      id: "sun",
      type: "choice",
      icon: "🧴",
      prompt: {
        en: "The UV index is **extreme**. You burn in ten minutes. What's the Australian slogan, and what do you actually do?",
        vi: "Chỉ số UV ở mức **cực cao**. Bạn cháy nắng chỉ sau mười phút. Khẩu hiệu của người Úc là gì và bạn thực sự làm gì?",
      },
      options: [
        {
          text: { en: "**Slip, Slop, Slap, Seek, Slide**: shirt, SPF30+ sunscreen (reapply every 2 h), hat, shade, sunglasses", vi: "**Slip, Slop, Slap, Seek, Slide**: áo, kem chống nắng SPF30+ (bôi lại mỗi 2 giờ), mũ, bóng râm, kính" },
          points: 10,
          correct: true,
          feedback: {
            en: "Exactly. “Slip, Slop, Slap, Seek, Slide” is the national mantra. Water-resistant sunscreen still needs reapplying after swimming and every two hours.",
            vi: "Chính xác. “Slip, Slop, Slap, Seek, Slide” là câu thần chú quốc gia. Kem chống nắng chống nước vẫn cần bôi lại sau khi bơi và mỗi hai giờ.",
          },
        },
        {
          text: { en: "One layer of sunscreen at 9 a.m. is plenty", vi: "Bôi một lớp kem lúc 9 giờ sáng là đủ" },
          points: 2,
          feedback: {
            en: "It wears off with sweat, sand and swimming. Reapply about every two hours, and cover up.",
            vi: "Nó trôi đi vì mồ hôi, cát và nước. Hãy bôi lại khoảng mỗi hai giờ và che người.",
          },
        },
        {
          text: { en: "Tanning oil, baby: get that glow", vi: "Dầu tắm nắng, cưng ơi: lên màu rực rỡ nào" },
          points: 0,
          feedback: {
            en: "In Australia that makes you a medium-rare steak with a rash. Don't.",
            vi: "Ở Úc, việc đó biến bạn thành miếng bít tết tái kèm phát ban. Đừng.",
          },
        },
      ],
      tip: {
        en: "Slip on a shirt, Slop on SPF30+ sunscreen (reapply every 2 hours), Slap on a hat, Seek shade, Slide on sunglasses.",
        vi: "Mặc áo, bôi kem chống nắng SPF30+ (bôi lại mỗi 2 giờ), đội mũ, tìm bóng râm, đeo kính.",
      },
      next: "toFlags",
    },
    {
      id: "toFlags",
      type: "sandbox",
      objective: { en: "Walk to the red-and-yellow flags.", vi: "Đi tới cặp cờ đỏ-vàng." },
      target: "flags",
      wrong: {
        local: { feedback: { en: "The local's story will have to wait!", vi: "Câu chuyện của người địa phương phải chờ đã!" } },
      },
      next: "wherSwim",
    },
    {
      id: "wherSwim",
      type: "choice",
      speaker: lifeguard,
      icon: "🦺",
      prompt: {
        en: "The beach is packed between the flags. Down to the **east**, past the sign, there's a calm, empty stretch of sea with no flags and no people.",
        vi: "Bãi biển giữa hai cờ chật kín người. Phía **đông**, qua tấm biển, có một dải biển phẳng lặng, vắng người, không cờ.",
      },
      options: [
        {
          text: { en: "Swim **between the flags**, where lifeguards are watching", vi: "Bơi **giữa hai cờ**, nơi nhân viên cứu hộ đang quan sát" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes! Patrolled areas are marked with red-and-yellow flags. If there are no flags, nobody is watching. And the empty water is empty for a reason.",
            vi: "Đúng! Khu vực có người trực được đánh dấu bằng cờ đỏ-vàng. Không có cờ nghĩa là không ai trông chừng. Và vùng nước vắng là vắng vì có lý do.",
          },
        },
        {
          text: { en: "Go east: calm water, no crowds, perfect", vi: "Đi về phía đông: nước êm, vắng người, tuyệt vời" },
          points: 0,
          feedback: {
            en: "Smooth, calm-looking patches are often **rips**: channels of water flowing out to sea. Swimming outside the flags is how most rescues happen.",
            vi: "Những chỗ phẳng lặng thường là **dòng rip**: dòng nước chảy ra biển. Bơi ngoài vùng cờ là nguyên nhân của phần lớn các vụ cứu hộ.",
          },
        },
      ],
      tip: {
        en: "Only swim between the red-and-yellow flags. Calm patches outside them can be rip currents.",
        vi: "Chỉ bơi giữa hai cờ đỏ-vàng. Những chỗ nước phẳng ngoài đó có thể là dòng rip.",
      },
      next: "swim",
    },
    {
      id: "swim",
      type: "minigame",
      game: "lane",
      objective: { en: "Swim between the flags and dodge the bluebottles and surfers!", vi: "Bơi giữa hai cờ và né sứa bluebottle cùng người lướt sóng!" },
      params: {
        title: { en: "Swim between the flags", vi: "Bơi giữa hai cờ" },
        hint: { en: "← → (or tap a lane) to move", vi: "← → (hoặc chạm vào làn) để di chuyển" },
        player: "🏊",
        bg: "#4fb4e8",
        lanes: [
          { kind: "forbidden", label: { en: "RIP!", vi: "RIP!" }, color: "#2f86b8", why: { en: "You drifted outside the flags into a rip! Swim back between the flags.", vi: "Bạn trôi ra ngoài cờ vào dòng rip! Hãy bơi trở lại giữa hai cờ." } },
          { kind: "ok", color: "#5bbdf0" },
          { kind: "ok", color: "#6dc7f5" },
          { kind: "ok", color: "#5bbdf0" },
          { kind: "forbidden", label: { en: "RIP!", vi: "RIP!" }, color: "#2f86b8", why: { en: "You drifted outside the flags into a rip! Swim back between the flags.", vi: "Bạn trôi ra ngoài cờ vào dòng rip! Hãy bơi trở lại giữa hai cờ." } },
        ],
        startLane: 2,
        duration: 32,
        hearts: 3,
        drainEvery: 2.2,
        spawnEvery: [0.55, 1.0],
        obstacles: [
          { id: "bluebottle", icon: "🪼", speed: 0.32, lanes: [1, 2, 3], weight: 3, why: { en: "Ouch! A bluebottle sting. Drifting with the wind, they wash up in summer: look ahead!", vi: "Ối! Sứa bluebottle đốt. Chúng trôi theo gió và dạt vào bờ vào mùa hè: nhìn phía trước!" } },
          { id: "surfer", icon: "🏄", speed: 0.6, lanes: [1, 2, 3], weight: 2, why: { en: "A surfer rode over you. Swimmers and surfers have separate areas for a reason.", vi: "Một người lướt sóng cán qua bạn. Người bơi và người lướt có khu vực riêng là có lý do." } },
          { id: "board", icon: "🛟", speed: 0.4, lanes: [1, 2, 3], weight: 1, why: { en: "A stray boogie board hit you. Keep your eyes open!", vi: "Một tấm ván boogie lạc bay trúng bạn. Mở to mắt ra!" } },
        ],
        pickups: [
          { id: "shell", icon: "🐚", points: 1 },
          { id: "dolphin", icon: "🐬", points: 2 },
        ],
        failText: { en: "The ocean won this round. Try again!", vi: "Đại dương thắng hiệp này. Thử lại nhé!" },
        doneText: { en: "Lifeguards give you a thumbs-up!", vi: "Nhân viên cứu hộ giơ ngón cái khen bạn!" },
        seed: 31,
      },
      tip: {
        en: "Stay between the flags, keep an eye out for bluebottles on windy summer days, and don't swim among surfers.",
        vi: "Ở giữa hai cờ, để ý sứa bluebottle vào những ngày hè có gió, và đừng bơi giữa người lướt sóng.",
      },
      next: "rip",
    },
    {
      id: "rip",
      type: "choice",
      icon: "🌊",
      prompt: {
        en: "Something's wrong: you feel yourself being pulled out to sea. The sand is getting far away, and the flags are tiny. You've drifted into a **rip current**.",
        vi: "Có gì đó không ổn: bạn cảm thấy mình bị kéo ra biển. Bờ cát xa dần, cờ nhỏ xíu. Bạn đã trôi vào một **dòng rip**.",
      },
      options: [
        {
          text: { en: "**Stay calm, float**, and **raise one arm** to signal the lifeguards", vi: "**Bình tĩnh, nổi trên mặt nước**, và **giơ một tay** ra hiệu cho nhân viên cứu hộ" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right: relax, raise, rescue. Conserve energy, wave an arm, and let the lifeguards come to you. A rip doesn't pull you under, it carries you out.",
            vi: "Đúng: thư giãn, giơ tay, chờ cứu hộ. Tiết kiệm sức, vẫy tay và để nhân viên cứu hộ đến với bạn. Dòng rip không kéo bạn chìm, nó chỉ đưa bạn ra xa.",
          },
        },
        {
          text: { en: "Swim **straight back** against the current as hard as you can", vi: "Bơi **thẳng vào bờ** ngược dòng hết sức" },
          points: 0,
          feedback: {
            en: "Even Olympic swimmers can't beat a rip. Fighting it exhausts you, and exhaustion is what drowns people.",
            vi: "Ngay cả vận động viên Olympic cũng không thắng nổi dòng rip. Chống lại nó làm bạn kiệt sức, và kiệt sức mới là thứ khiến người ta chết đuối.",
          },
        },
        {
          text: { en: "Panic and shout while swimming in circles", vi: "Hoảng loạn, hét lên và bơi vòng tròn" },
          points: 0,
          feedback: {
            en: "Panic wastes the energy you need. Float, breathe, signal. Stay calm.",
            vi: "Hoảng loạn lãng phí năng lượng bạn cần. Hãy nổi, thở, ra hiệu. Giữ bình tĩnh.",
          },
        },
      ],
      tip: {
        en: "Caught in a rip: stay calm, float and raise an arm to signal for help: don't swim straight against it.",
        vi: "Bị cuốn vào dòng rip: bình tĩnh, nổi trên mặt nước và giơ tay ra hiệu cầu cứu; đừng bơi thẳng ngược dòng.",
      },
      next: "sting",
    },
    {
      id: "sting",
      type: "choice",
      icon: "🪼",
      prompt: {
        en: "You're back on the sand, safe… and then **ouch**: a blue-purple tentacle is stuck to your leg, and it burns like fire. A bluebottle sting!",
        vi: "Bạn đã trở lại bãi cát, an toàn… và rồi **ối**: một xúc tu xanh tím dính vào chân, rát như lửa. Bị sứa bluebottle đốt!",
      },
      options: [
        {
          text: { en: "**Pick off tentacles**, **rinse with sea water**, then soak in **hot water** (as hot as you can tolerate)", vi: "**Gỡ xúc tu**, **rửa bằng nước biển**, rồi ngâm **nước nóng** (nóng tới mức chịu được)" },
          points: 10,
          correct: true,
          feedback: {
            en: "That's the lifesaver advice: don't rub, remove tentacles, rinse with seawater, then hot water for pain relief. Use cold packs if no hot water. Get medical help if you have trouble breathing.",
            vi: "Đó là lời khuyên của đội cứu hộ: không chà xát, gỡ xúc tu, rửa bằng nước biển, rồi dùng nước nóng giảm đau. Dùng túi lạnh nếu không có nước nóng. Đi khám nếu khó thở.",
          },
        },
        {
          text: { en: "Rinse it with **fresh water** from the shower", vi: "Rửa bằng **nước ngọt** ở vòi sen" },
          points: 2,
          feedback: {
            en: "Fresh water can make unfired stinging cells fire and hurt more. Use sea water first.",
            vi: "Nước ngọt có thể làm các tế bào độc chưa phóng kích hoạt và đau hơn. Hãy dùng nước biển trước.",
          },
        },
        {
          text: { en: "Rub it hard with sand and a towel", vi: "Chà mạnh bằng cát và khăn" },
          points: 0,
          feedback: {
            en: "Rubbing spreads the venom. Don't rub! Lift tentacles off gently, rinse, then use heat.",
            vi: "Chà xát làm lan nọc độc. Đừng chà! Hãy nhẹ nhàng gỡ xúc tu, rửa, rồi dùng nhiệt.",
          },
        },
      ],
      tip: {
        en: "Bluebottle sting: pick off tentacles, rinse with seawater, then hot water (or cold packs). Don't rub it. Seek help if it's severe.",
        vi: "Bị bluebottle đốt: gỡ xúc tu, rửa nước biển, rồi ngâm nước nóng (hoặc chườm lạnh). Không chà xát. Tìm trợ giúp nếu nặng.",
      },
      next: "toLocal",
    },
    {
      id: "toLocal",
      type: "sandbox",
      objective: { en: "A local on the sand is waving at you. Go and say g'day.", vi: "Một người địa phương trên bãi cát đang vẫy bạn. Đến chào g'day." },
      target: "local",
      next: "dropBear",
    },
    {
      id: "dropBear",
      type: "choice",
      speaker: local,
      icon: "🤠",
      prompt: {
        en: "“Mate, watch out for the **drop bears**. Vicious. Drop out of eucalyptus trees on tourists. You'll want to rub **Vegemite behind your ears** to keep them away.”",
        vi: "“Bạn ơi, coi chừng **drop bear**. Hung dữ lắm. Chúng nhảy từ cây bạch đàn xuống khách du lịch. Bạn nên bôi **Vegemite sau tai** để chúng tránh xa.”",
      },
      options: [
        {
          text: { en: "Laugh: it's a famous **prank on tourists**", vi: "Cười lớn: đó là **trò đùa nổi tiếng với du khách**" },
          points: 10,
          correct: true,
          feedback: {
            en: "Correct! Drop bears are a made-up tall tale Aussies tell visitors. (Real dangers: sun, rips, bluebottles, snakes and spiders, which are just more serious, not funnier.)",
            vi: "Đúng! Drop bear là chuyện bịa người Úc kể cho du khách. (Nguy hiểm thật: nắng, dòng rip, sứa bluebottle, rắn và nhện, những thứ nghiêm túc hơn chứ không buồn cười hơn.)",
          },
        },
        {
          text: { en: "Ask where to buy Vegemite and put some behind your ears", vi: "Hỏi mua Vegemite ở đâu và bôi sau tai" },
          points: 0,
          feedback: {
            en: "That's the second half of the prank! The local is now laughing so hard he's crying. Vegemite is best on toast.",
            vi: "Đó là nửa sau của trò đùa! Người địa phương giờ cười đến chảy nước mắt. Vegemite ngon nhất khi phết lên bánh mì nướng.",
          },
        },
      ],
      next: "emergency",
    },
    {
      id: "emergency",
      type: "choice",
      icon: "📞",
      prompt: {
        en: "Later, a swimmer further down the beach is waving both arms and shouting. This could be an emergency. What number do you call from your phone?",
        vi: "Lát sau, một người bơi ở xa hơn trên bãi biển vẫy cả hai tay và la hét. Có thể đây là tình huống khẩn cấp. Bạn gọi số nào từ điện thoại?",
      },
      options: [
        {
          text: { en: "**000** (triple zero), and alert the lifeguards", vi: "**000** (ba số không), và báo cho nhân viên cứu hộ" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes! 000 is Australia's emergency number (112 also works from a mobile). Alert the lifeguards too, since they're the fastest help on the beach.",
            vi: "Đúng! 000 là số khẩn cấp của Úc (112 cũng gọi được từ điện thoại di động). Hãy báo cả nhân viên cứu hộ vì họ là trợ giúp nhanh nhất trên bãi biển.",
          },
        },
        {
          text: { en: "**911**, like in the movies", vi: "**911**, như trong phim" },
          points: 0,
          feedback: {
            en: "That's the US number. In Australia it's 000 (or 112 from a mobile).",
            vi: "Đó là số của Mỹ. Ở Úc là 000 (hoặc 112 từ điện thoại di động).",
          },
        },
      ],
      tip: {
        en: "Emergency in Australia: call 000 (or 112 from a mobile). On a beach, alert the lifeguards first if they're close.",
        vi: "Khẩn cấp ở Úc: gọi 000 (hoặc 112 từ điện thoại di động). Ở bãi biển, báo nhân viên cứu hộ trước nếu họ ở gần.",
      },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      icon: "🇦🇺",
      text: {
        en: "You survived the sun, the surf, the sting and the drop bears (they don't exist). The lifeguard gives you a thumbs-up: “Not bad for a tourist.” In Australian, that's a medal. **Stay between the flags!**",
        vi: "Bạn sống sót qua nắng, sóng, vết đốt và cả drop bear (chúng không tồn tại). Nhân viên cứu hộ giơ ngón cái: “Không tệ cho một du khách.” Theo tiếng Úc, đó là huy chương. **Hãy ở giữa hai cờ!**",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
