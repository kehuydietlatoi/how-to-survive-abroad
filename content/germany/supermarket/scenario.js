// Germany · Saturday at the supermarket.
// Facts checked Oct 2026: shops are closed on Sundays & public holidays (Ladenschluss);
// bakeries and shops at main stations / petrol stations may open. Shopping carts usually
// need a €1 coin or a cart chip. Deposits: €0.25 single-use bottles & cans, €0.08 / €0.15
// refillable bottles. Shopping bags cost money. Cashiers scan fast; customers pack at the
// packing shelf after paying. The store name is fictional.

const cashier = { en: "Cashier", vi: "Thu ngân" };

export default {
  id: "germany-supermarket",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "🛍️",
      text: {
        en: "**Saturday, 18:30.** Your fridge is empty, and there's a bag of empty bottles in the hallway. Time for the supermarket!",
        vi: "**Thứ Bảy, 18:30.** Tủ lạnh trống trơn, ngoài hành lang còn một túi vỏ chai. Đi siêu thị thôi!",
      },
      next: "whenShop",
    },
    {
      id: "whenShop",
      type: "choice",
      icon: "📅",
      prompt: { en: "You're tired. Can you just go tomorrow, **Sunday** morning?", vi: "Bạn mệt rồi. Để sáng mai **Chủ nhật** đi được không?" },
      options: [
        {
          text: { en: "Sure, the supermarket opens Sunday morning", vi: "Được chứ, siêu thị mở sáng Chủ nhật mà" },
          points: 0,
          feedback: {
            en: "Nope! Shops are **closed on Sundays** and public holidays in Germany. You'd find locked doors.",
            vi: "Không! Ở Đức cửa hàng **đóng cửa Chủ nhật** và ngày lễ. Bạn sẽ gặp cửa khoá.",
          },
        },
        {
          text: { en: "Go now: it's open until 22:00 today", vi: "Đi ngay: hôm nay mở tới 22:00" },
          points: 10,
          correct: true,
          feedback: { en: "Good thinking. Many people do a big shop on Saturday for exactly this reason.", vi: "Hợp lý. Nhiều người đi chợ lớn vào thứ Bảy chính vì lý do này." },
        },
        {
          text: { en: "Wait and buy at the main station or a petrol station on Sunday", vi: "Đợi Chủ nhật mua ở ga trung tâm hoặc trạm xăng" },
          points: 5,
          feedback: {
            en: "Possible in an emergency: station and petrol-station shops may open, but they're pricier and small.",
            vi: "Được khi cần gấp: cửa hàng ở ga và trạm xăng có thể mở, nhưng đắt và ít đồ.",
          },
        },
      ],
      tip: {
        en: "Shops close on **Sundays and public holidays**. Do your big shop on Saturday (bakeries & station shops may open on Sundays).",
        vi: "Cửa hàng đóng **Chủ nhật và ngày lễ**. Hãy đi chợ lớn vào thứ Bảy (tiệm bánh & cửa hàng ở ga có thể mở Chủ nhật).",
      },
      next: "toCarts",
    },
    {
      id: "toCarts",
      type: "sandbox",
      objective: { en: "Grab a shopping cart (Einkaufswagen) outside the store.", vi: "Lấy một xe đẩy (Einkaufswagen) bên ngoài cửa hàng." },
      target: "carts",
      next: "coinLock",
    },
    {
      id: "coinLock",
      type: "choice",
      icon: "🔒",
      prompt: {
        en: "The carts are chained together. There's a little slot on the handle with a lock.",
        vi: "Các xe đẩy bị khoá dính vào nhau. Trên tay cầm có một khe nhỏ có khoá.",
      },
      options: [
        {
          text: { en: "Insert a **€1 coin** (or a cart chip)", vi: "Bỏ **đồng 1 €** (hoặc thẻ chip xe đẩy)" },
          points: 10,
          correct: true,
          feedback: {
            en: "Click! The coin releases the cart; you get it back when you return the cart to the row. Many people keep a plastic **Einkaufswagenchip** on their keys.",
            vi: "Cạch! Đồng xu mở khoá xe; bạn nhận lại khi trả xe về hàng. Nhiều người móc một **thẻ chip xe đẩy** vào chùm chìa khoá.",
          },
        },
        {
          text: { en: "Yank it really hard", vi: "Giật thật mạnh" },
          points: 0,
          feedback: { en: "It won't budge, and people are staring. It's a coin deposit lock.", vi: "Không nhúc nhích, mọi người đang nhìn kìa. Đó là khoá đặt cọc bằng xu." },
        },
        {
          text: { en: "Take a basket from inside instead", vi: "Lấy giỏ xách bên trong thay vào" },
          points: 6,
          feedback: { en: "Works for a small shop, but your bottle bag and a week of groceries won't fit.", vi: "Được nếu mua ít, nhưng túi vỏ chai và đồ ăn cả tuần sẽ không vừa." },
        },
      ],
      tip: { en: "Carts need a **€1 coin** or cart chip; you get it back when you return the cart.", vi: "Xe đẩy cần **đồng 1 €** hoặc thẻ chip; bạn nhận lại khi trả xe." },
      next: "toPfand",
    },
    {
      id: "toPfand",
      type: "sandbox",
      objective: { en: "First, return your empty bottles at the Pfandautomat inside.", vi: "Trước tiên, trả vỏ chai ở máy Pfandautomat bên trong." },
      target: "pfand",
      next: "pfandGame",
    },
    {
      id: "pfandGame",
      type: "minigame",
      game: "pfand",
      objective: { en: "Feed in the deposit bottles, keep the rest aside, print your Bon.", vi: "Cho chai có cọc vào máy, giữ lại món khác, in phiếu Bon." },
      next: "shop",
    },
    {
      id: "shop",
      type: "sandbox",
      objective: { en: "Now grab your groceries from the shelves.", vi: "Giờ lấy đồ cần mua trên kệ." },
      target: "shelf",
      done: { en: "Eggs, bread, pasta, milk, a crate of water… your cart is full! 🛒", vi: "Trứng, bánh mì, mì Ý, sữa, một két nước… xe đầy rồi! 🛒" },
      next: "toCheckout",
    },
    {
      id: "toCheckout",
      type: "sandbox",
      objective: { en: "Go to the checkout (Kasse).", vi: "Ra quầy thanh toán (Kasse)." },
      target: "checkout",
      next: "bag",
    },
    {
      id: "bag",
      type: "choice",
      speaker: cashier,
      icon: "🧑‍💼",
      prompt: { en: "“Hallo! Brauchen Sie eine Tüte?” (Do you need a bag?)", vi: "“Hallo! Brauchen Sie eine Tüte?” (Bạn có cần túi không?)" },
      options: [
        {
          text: { en: "“Nein danke, ich habe eine Tasche.” (I brought my own)", vi: "“Nein danke, ich habe eine Tasche.” (Tôi có túi rồi)" },
          points: 10,
          correct: true,
          feedback: { en: "Very German! Most people bring their own bags or a folding box.", vi: "Rất kiểu Đức! Hầu hết mọi người mang túi tái sử dụng hoặc hộp gấp." },
        },
        {
          text: { en: "“Ja, bitte.” Buy a bag", vi: "“Ja, bitte.” Mua một chiếc túi" },
          points: 5,
          feedback: { en: "Fine, but bags **cost money** here. Keep one in your backpack next time.", vi: "Được, nhưng túi ở đây **mất tiền**. Lần sau để sẵn một cái trong ba lô." },
        },
        {
          text: { en: "Ask for free plastic bags", vi: "Xin túi nilon miễn phí" },
          points: 0,
          feedback: {
            en: "There are no free plastic carrier bags at German checkouts; bags are sold, and lightweight plastic carrier bags are banned.",
            vi: "Quầy thu ngân ở Đức không phát túi nilon miễn phí; túi phải mua, và túi nilon mỏng đã bị cấm.",
          },
        },
      ],
      tip: { en: "Bring your own bag: shopping bags cost money in Germany.", vi: "Mang túi riêng: túi mua sắm ở Đức phải trả tiền." },
      next: "bon",
    },
    {
      id: "bon",
      type: "choice",
      icon: "🧾",
      prompt: { en: "What about your **Leergut-Bon** from the bottle machine?", vi: "Còn **phiếu trả vỏ (Leergut-Bon)** từ máy thì sao?" },
      options: [
        {
          text: { en: "Hand it to the cashier **before** paying", vi: "Đưa cho thu ngân **trước khi** thanh toán" },
          points: 10,
          correct: true,
          feedback: { en: "The deposit comes straight off your bill. Bons usually only work in **this** store / chain.", vi: "Tiền cọc được trừ thẳng vào hoá đơn. Phiếu thường chỉ dùng được ở **cửa hàng / chuỗi này**." },
        },
        {
          text: { en: "Keep it in your wallet for another time", vi: "Giữ trong ví để lần sau" },
          points: 5,
          feedback: { en: "Allowed, but people often lose them, and other chains won't take it.", vi: "Được, nhưng hay bị mất, và chuỗi cửa hàng khác không nhận." },
        },
        {
          text: { en: "Throw it away, it's just a receipt", vi: "Vứt đi, chỉ là tờ hoá đơn" },
          points: 0,
          feedback: { en: "That's your money! Hand it over at the checkout.", vi: "Đó là tiền của bạn! Đưa ở quầy thanh toán." },
        },
      ],
      next: "race",
    },
    {
      id: "race",
      type: "minigame",
      game: "checkout",
      objective: { en: "Keep up with the cashier!", vi: "Theo kịp tốc độ của thu ngân!" },
      onEnter: [{ do: "visible", id: "nextCustomer", on: true }],
      next: "packing",
    },
    {
      id: "packing",
      type: "choice",
      icon: "📦",
      prompt: {
        en: "The cashier is already scanning the next customer's shopping. Your stuff is jumbled in the cart. Now what?",
        vi: "Thu ngân đã quét hàng cho khách tiếp theo. Đồ của bạn lộn xộn trong xe. Giờ làm gì?",
      },
      options: [
        {
          text: { en: "Push the cart to the **packing shelf** (Packtisch) and pack there calmly", vi: "Đẩy xe ra **bàn xếp đồ** (Packtisch) và xếp thong thả" },
          points: 10,
          correct: true,
          feedback: { en: "Exactly how locals do it. Nobody packs at the till.", vi: "Người địa phương làm đúng như vậy. Không ai xếp đồ ngay tại quầy." },
        },
        {
          text: { en: "Stay at the till and pack everything into bags there", vi: "Đứng lại quầy và xếp hết vào túi ở đó" },
          points: 0,
          feedback: { en: "You'd block the next customer, whose shopping is already piling up. Move to the Packtisch!", vi: "Bạn sẽ chắn khách sau, đồ của họ đang dồn tới rồi. Ra Packtisch đi!" },
        },
      ],
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      speaker: cashier,
      icon: "🧑‍💼",
      text: { en: "“Schönes Wochenende!” (Have a nice weekend!) Don't forget your €1 coin when you return the cart.", vi: "“Schönes Wochenende!” (Cuối tuần vui vẻ!) Đừng quên lấy lại đồng 1 € khi trả xe đẩy." },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
