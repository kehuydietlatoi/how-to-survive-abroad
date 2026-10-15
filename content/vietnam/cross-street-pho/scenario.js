// Vietnam · Cross the street and eat phở (Hanoi Old Quarter).
// Facts checked Oct 2026: street phở in Hanoi ≈ 40.000–70.000đ (Old Quarter at the
// higher end); pedestrians are advised to cross slowly and steadily, not run or step back.

const lan = { en: "Cô Lan (guesthouse)", vi: "Cô Lan (nhà nghỉ)" };
const hoa = { en: "Cô Hoa (phở stall)", vi: "Cô Hoa (quán phở)" };

export default {
  id: "vietnam-cross-street-pho",
  steps: [
    {
      id: "intro",
      type: "info",
      speaker: lan,
      icon: "👩",
      text: {
        en: "Chào cháu! Welcome to Hanoi's Old Quarter. Hungry? The best **phở** around is at the stall **right across the street**.\nCareful, the street is full of motorbikes and there's no traffic light here.",
        vi: "Chào cháu! Chào mừng đến Phố Cổ Hà Nội. Đói chưa? Quán **phở** ngon nhất ở ngay **bên kia đường**.\nCẩn thận nhé, đường toàn xe máy mà chỗ này không có đèn giao thông.",
      },
      next: "toKerb",
    },
    {
      id: "toKerb",
      type: "sandbox",
      objective: { en: "Walk along the sidewalk to the kerb by the yellow marker.", vi: "Đi dọc vỉa hè tới mép đường, chỗ có mũi tên vàng." },
      target: "kerb",
      next: "howCross",
    },
    {
      id: "howCross",
      type: "choice",
      icon: "🛵",
      prompt: {
        en: "A river of motorbikes flows past. They are not going to stop. How do you cross?",
        vi: "Dòng xe máy chảy qua liên tục và sẽ không dừng lại. Bạn qua đường thế nào?",
      },
      options: [
        {
          text: { en: "Wait until the road is completely empty", vi: "Đợi đến khi đường hoàn toàn vắng xe" },
          points: 3,
          feedback: {
            en: "You might wait all evening! In busy streets traffic never fully stops. Wait for a **small gap**, then go.",
            vi: "Có khi phải đợi cả tối! Đường đông thì xe không bao giờ ngừng hẳn. Hãy đợi một **khoảng trống nhỏ** rồi đi.",
          },
        },
        {
          text: { en: "Walk slowly at a steady pace and keep an eye on the riders", vi: "Đi chậm, đều bước và để ý người lái xe" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes! Riders steer around where they **expect** you to be. Slow + steady = predictable = safe.",
            vi: "Đúng! Người lái xe sẽ lách quanh chỗ họ **đoán** bạn sẽ tới. Chậm + đều = dễ đoán = an toàn.",
          },
        },
        {
          text: { en: "Sprint across as fast as possible", vi: "Chạy thật nhanh qua đường" },
          points: 0,
          feedback: {
            en: "Running is risky: riders plan to pass in front of you, and suddenly you're there.",
            vi: "Chạy rất nguy hiểm: xe định đi qua trước mặt bạn, thế mà bạn lại lao tới đúng chỗ đó.",
          },
        },
      ],
      tip: {
        en: "Crossing in Vietnam: wait for a small gap, then walk **slowly and steadily**. Don't run, stop suddenly or step back.",
        vi: "Qua đường ở Việt Nam: đợi khoảng trống nhỏ rồi đi **chậm và đều**. Đừng chạy, dừng đột ngột hay lùi lại.",
      },
      next: "cross",
    },
    {
      id: "cross",
      type: "minigame",
      game: "streetCrossing",
      objective: { en: "Cross the street safely!", vi: "Băng qua đường an toàn!" },
      params: {
        tipRan: { en: "You ran during the crossing. Riders can't predict a running pedestrian.", vi: "Bạn đã chạy khi qua đường. Người lái xe không đoán được người đi bộ đang chạy." },
        tipBack: { en: "Stepping back or freezing in the middle is when bumps happen. Keep moving forward slowly.", vi: "Lùi lại hoặc đứng khựng giữa đường là lúc dễ va chạm nhất. Cứ từ từ tiến lên." },
        tipPerfect: { en: "Perfect crossing. Raising a hand also helps riders notice you early.", vi: "Qua đường hoàn hảo. Giơ tay cũng giúp người lái xe thấy bạn sớm hơn." },
      },
      next: "toStall",
    },
    {
      id: "toStall",
      type: "sandbox",
      objective: { en: "Find the phở stall and sit on a little plastic stool.", vi: "Tìm quán phở và ngồi xuống một chiếc ghế nhựa nhỏ." },
      target: "myStool",
      onEnter: [{ do: "walls", tag: "road", on: true }],
      next: "order",
    },
    {
      id: "order",
      type: "choice",
      speaker: hoa,
      icon: "👩‍🍳",
      onEnter: [
        { do: "teleport", spawn: "stool" },
        { do: "anim", id: "player", anim: "sit" },
        { do: "interactable", id: "myStool", on: false },
        { do: "y", id: "player", y: 0.3 },
      ],
      prompt: { en: "**Ăn gì em?** (What would you like?)", vi: "**Ăn gì em?**" },
      options: [
        {
          text: { en: "“Một phở bò tái ạ” (one rare-beef phở, please)", vi: "“Cho cháu một phở bò tái ạ”" },
          points: 10,
          correct: true,
          feedback: {
            en: "Perfect. **Tái** = thin rare beef that cooks in the hot broth. **Chín** = well-done, **gà** = chicken. Adding **ạ** sounds polite.",
            vi: "Chuẩn. **Tái** = thịt bò thái mỏng, chín trong nước dùng nóng. **Chín** = bò chín, **gà** = gà. Thêm **ạ** cho lễ phép.",
          },
        },
        {
          text: { en: "Point at a neighbour's bowl and smile", vi: "Chỉ vào bát của bàn bên và cười" },
          points: 8,
          correct: true,
          feedback: {
            en: "Works every time! Pointing is totally fine at street stalls.",
            vi: "Lúc nào cũng hiệu quả! Chỉ tay gọi món ở quán vỉa hè là bình thường.",
          },
        },
        {
          text: { en: "“Pizza, please!”", vi: "“Cho cháu pizza!”" },
          points: 0,
          feedback: {
            en: "Cô Hoa laughs. Street stalls usually cook **one dish**, and the sign tells you which (**PHỞ BÒ** = beef phở).",
            vi: "Cô Hoa bật cười. Quán vỉa hè thường chỉ bán **một món**, biển hiệu ghi rõ (**PHỞ BÒ**).",
          },
        },
      ],
      tip: {
        en: "Street stalls specialise in one dish; the sign is the menu. Phở bò tái = rare beef, chín = well-done, gà = chicken.",
        vi: "Quán vỉa hè thường chỉ bán một món, biển hiệu chính là thực đơn. Phở bò tái / chín / phở gà.",
      },
      next: "eat",
    },
    {
      id: "eat",
      type: "minigame",
      game: "phoEating",
      onEnter: [{ do: "visible", id: "myBowl", on: true }],
      objective: { en: "Season your phở like a local, then eat it all!", vi: "Nêm phở như người Hà Nội, rồi ăn hết nhé!" },
      next: "callStaff",
    },
    {
      id: "callStaff",
      onEnter: [{ do: "visible", id: "myBowl", on: false }],
      type: "choice",
      icon: "🙋",
      prompt: {
        en: "You'd like another trà đá. A young server is nearby. How do you call them?",
        vi: "Bạn muốn thêm một cốc trà đá. Có một bạn phục vụ trẻ đứng gần đó. Bạn gọi thế nào?",
      },
      options: [
        {
          text: { en: "“Em ơi!”", vi: "“Em ơi!”" },
          points: 10,
          correct: true,
          feedback: {
            en: "Exactly. **Em ơi** for someone younger, **Anh ơi / Chị ơi** for a man / woman older than you.",
            vi: "Chính xác. **Em ơi** với người nhỏ tuổi hơn, **Anh ơi / Chị ơi** với người lớn tuổi hơn.",
          },
        },
        {
          text: { en: "Snap your fingers", vi: "Búng tay" },
          points: 0,
          feedback: { en: "That's seen as rude. Use a friendly “Em ơi!” instead.", vi: "Như vậy bị coi là bất lịch sự. Hãy gọi “Em ơi!” thân thiện." },
        },
        {
          text: { en: "Shout “Waiter!”", vi: "Hét to “Waiter!”" },
          points: 4,
          feedback: { en: "They may not understand English. “Em ơi!” works everywhere.", vi: "Có thể họ không hiểu tiếng Anh. “Em ơi!” dùng được ở mọi nơi." },
        },
      ],
      tip: {
        en: "Call staff with “Em ơi!” (younger) or “Anh/Chị ơi!” (older). Never snap fingers.",
        vi: "Gọi phục vụ: “Em ơi!” (nhỏ tuổi hơn) hoặc “Anh/Chị ơi!” (lớn tuổi hơn). Đừng búng tay.",
      },
      next: "pay",
    },
    {
      id: "pay",
      type: "choice",
      icon: "💸",
      onEnter: [
        { do: "anim", id: "player", anim: "idle" },
        { do: "y", id: "player", y: 0.16 },
      ],
      prompt: { en: "Delicious! You're done. How do you pay?", vi: "Ngon tuyệt! Ăn xong rồi. Bạn trả tiền thế nào?" },
      options: [
        {
          text: { en: "Go to Cô Hoa and say “Tính tiền ạ” (the bill, please)", vi: "Tới chỗ cô Hoa và nói “Cô ơi, tính tiền ạ”" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right: at street stalls you usually pay **after** eating, directly to the owner.",
            vi: "Đúng: ở quán vỉa hè thường trả tiền **sau khi** ăn, trực tiếp cho chủ quán.",
          },
        },
        {
          text: { en: "Leave some money on the table and walk off", vi: "Để tiền trên bàn rồi đi" },
          points: 0,
          feedback: {
            en: "Money could blow away or be mistaken. Hand it to the owner and wait for change.",
            vi: "Tiền có thể bay mất hoặc bị nhầm. Hãy đưa tận tay chủ quán và đợi tiền thừa.",
          },
        },
        {
          text: { en: "Wave a card and ask for contactless", vi: "Giơ thẻ và hỏi thanh toán chạm" },
          points: 4,
          feedback: {
            en: "Small stalls rarely take cards. Many show a **QR code** for bank transfer, but always carry some cash.",
            vi: "Quán nhỏ hiếm khi nhận thẻ. Nhiều quán có **mã QR** chuyển khoản, nhưng hãy luôn mang tiền mặt.",
          },
        },
      ],
      tip: {
        en: "At street stalls pay after eating, to the owner. Carry cash; many stalls also accept QR bank transfer.",
        vi: "Ở quán vỉa hè, trả tiền sau khi ăn, cho chủ quán. Mang tiền mặt; nhiều quán nhận chuyển khoản QR.",
      },
      next: "price",
    },
    {
      id: "price",
      type: "choice",
      speaker: hoa,
      icon: "👩‍🍳",
      prompt: {
        en: "“**Năm mươi nghìn** em nhé!” (50.000đ). Is that a fair price for a bowl in the Old Quarter?",
        vi: "“**Năm mươi nghìn** em nhé!” (50.000đ). Giá này ở Phố Cổ có hợp lý không?",
      },
      options: [
        {
          text: { en: "Yes, normal (street phở is about 40.000–70.000đ here)", vi: "Có, bình thường (phở vỉa hè ở đây khoảng 40.000–70.000đ)" },
          points: 10,
          correct: true,
          feedback: {
            en: "Spot on. Outside the tourist centre it's often even cheaper.",
            vi: "Chuẩn. Ra ngoài khu phố cổ còn rẻ hơn nữa.",
          },
        },
        {
          text: { en: "No! Haggle hard down to 10.000đ", vi: "Không! Mặc cả xuống 10.000đ" },
          points: 0,
          feedback: {
            en: "Food stalls have fixed prices; haggling over a bowl of phở is unusual and a bit rude. Bargain at markets instead.",
            vi: "Quán ăn có giá cố định; mặc cả bát phở là không bình thường và hơi bất lịch sự. Hãy mặc cả ở chợ.",
          },
        },
        {
          text: { en: "Hand over the blue 500.000đ note and say keep the change", vi: "Đưa tờ 500.000đ màu xanh và bảo khỏi thối" },
          points: 0,
          feedback: {
            en: "Whoa, that's 10× the price! The **20.000đ** and **500.000đ** notes are both blue. Always count the zeros.",
            vi: "Ối, gấp 10 lần giá! Tờ **20.000đ** và **500.000đ** đều màu xanh. Luôn đếm số 0 nhé.",
          },
        },
      ],
      tip: {
        en: "Street phở in Hanoi ≈ 40.000–70.000đ. Don't haggle over food, and double-check blue notes: 20.000đ vs 500.000đ.",
        vi: "Phở vỉa hè Hà Nội ≈ 40.000–70.000đ. Không mặc cả đồ ăn, và kiểm tra kỹ tờ màu xanh: 20.000đ hay 500.000đ.",
      },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      speaker: hoa,
      icon: "👩‍🍳",
      onEnter: [{ do: "anim", id: "player", anim: "emote-yes", once: true }],
      text: { en: "“Cảm ơn em, mai lại ăn nhé!” (Thanks, come again tomorrow!)", vi: "“Cảm ơn em, mai lại ăn nhé!”" },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
