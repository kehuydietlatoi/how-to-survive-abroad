// USA · a roadside diner (tipping, tax, refills, 911).
// Facts checked Oct 2026 (US tipping guides 2026): sit-down restaurants typically 15–20% of the pre-tax bill (18–20% for good
// service); large parties often get an automatic gratuity (check the bill); menu prices exclude sales tax, which is added at the
// register and varies by state/city; free soft-drink refills are common at diners and fast-food places (not guaranteed everywhere);
// leftover boxes ("to-go box") are normal; 911 is the emergency number; ambulance rides and ER visits can be very expensive
// without insurance (often well over a thousand dollars), so travel/health insurance matters. Dollar amounts here are examples.

const waitress = { en: "Waitress Dana", vi: "Phục vụ Dana" };

const ITEMS = [
  { id: "waiter", icon: "🍽️", text: { en: "Your **waiter** at a sit-down restaurant", vi: "**Phục vụ bàn** ở nhà hàng ngồi bàn" }, answer: "right", why: { en: "Servers earn most of their income from tips: 15–20% (18–20% for good service).", vi: "Phục vụ bàn kiếm phần lớn thu nhập từ tiền boa: 15–20% (18–20% nếu phục vụ tốt)." } },
  { id: "bartender", icon: "🍸", text: { en: "The **bartender** pouring your drinks", vi: "**Bartender** pha đồ uống cho bạn" }, answer: "right", why: { en: "Customary: about a dollar or two per drink, or 15–20% on a tab.", vi: "Theo thông lệ: khoảng 1–2 đô mỗi ly, hoặc 15–20% hoá đơn." } },
  { id: "taxi", icon: "🚕", text: { en: "A **taxi** driver", vi: "Tài xế **taxi**" }, answer: "right", why: { en: "Tip around 15–20% (rounding up is common).", vi: "Boa khoảng 15–20% (làm tròn lên cũng phổ biến)." } },
  { id: "housekeeping", icon: "🛏️", text: { en: "Hotel **housekeeping**", vi: "**Dọn phòng** khách sạn" }, answer: "right", why: { en: "A few dollars per night, left in the room, is customary.", vi: "Vài đô mỗi đêm, để lại trong phòng, là thông lệ." } },
  { id: "haircut", icon: "💈", text: { en: "Your **haircut**", vi: "**Cắt tóc**" }, answer: "right", why: { en: "Typically 15–20% for the stylist.", vi: "Thường boa 15–20% cho thợ cắt tóc." } },
  { id: "pizza", icon: "🍕", text: { en: "**Pizza delivery** to your door", vi: "**Giao pizza** tận cửa" }, answer: "right", why: { en: "A few dollars for the driver is customary.", vi: "Vài đô cho tài xế giao hàng là thông lệ." } },
  { id: "fastfood", icon: "🍔", text: { en: "A **fast-food counter**: you order, pay, grab your own tray", vi: "**Quầy đồ ăn nhanh**: tự gọi, trả tiền, tự bưng khay" }, answer: "left", why: { en: "Tipping isn't expected at counter service (a tip jar is optional).", vi: "Không cần boa ở quầy tự phục vụ (hũ tiền boa chỉ là tuỳ chọn)." } },
  { id: "cashier", icon: "🛒", text: { en: "The **supermarket cashier**", vi: "**Thu ngân** siêu thị" }, answer: "left", why: { en: "No tip expected.", vi: "Không cần boa." } },
  { id: "kiosk", icon: "🖥️", text: { en: "A **self-service kiosk** that suddenly asks for 25% tip", vi: "**Máy tự gọi món** bỗng hỏi boa 25%" }, answer: "left", why: { en: "Optional: press “No tip” or custom. Tipping screens are everywhere now, but they're a choice.", vi: "Tuỳ chọn: bấm “No tip” hoặc nhập số khác. Màn hình boa giờ đâu cũng có, nhưng đó là lựa chọn." } },
  { id: "autograt", icon: "🧾", text: { en: "The bill already says **“Gratuity (18%) included”**", vi: "Hoá đơn đã ghi **“Gratuity (18%) included”**" }, answer: "left", why: { en: "Don't tip twice: large groups often get an automatic gratuity. Check the bill.", vi: "Đừng boa hai lần: nhóm đông thường bị tính phí phục vụ tự động. Hãy xem kỹ hoá đơn." } },
];

export default {
  id: "usa-diner",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "🍔",
      text: {
        en: "**Welcome to America.** Everything is bigger: the portions, the trucks, the refills and, regrettably, the medical bills. You're starving, and a neon sign says **DINER · OPEN 24 HRS**.",
        vi: "**Chào mừng đến nước Mỹ.** Cái gì cũng to hơn: khẩu phần, xe bán tải, ly nước refill và, đáng tiếc, cả hoá đơn y tế. Bạn đói meo, và biển neon ghi **DINER · OPEN 24 HRS**.",
      },
      next: "toHost",
    },
    {
      id: "toHost",
      type: "sandbox",
      objective: { en: "Walk into the diner and check in at the host stand.", vi: "Vào quán và báo tên ở quầy đón khách." },
      target: "host",
      next: "seat",
    },
    {
      id: "seat",
      type: "choice",
      icon: "🪧",
      prompt: {
        en: "A sign says **PLEASE WAIT TO BE SEATED**. A pink booth by the window is empty and sunny.",
        vi: "Biển ghi **PLEASE WAIT TO BE SEATED** (vui lòng đợi được xếp chỗ). Một chiếc bàn hồng cạnh cửa sổ đang trống và đầy nắng.",
      },
      options: [
        {
          text: { en: "**Wait** for the host to show you a table", vi: "**Đợi** nhân viên dẫn đến bàn" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right. When a sign says wait to be seated, don't grab a table: the host assigns seats to spread the work between waiters.",
            vi: "Đúng. Khi biển ghi đợi xếp chỗ, đừng tự chiếm bàn: nhân viên chia chỗ để phân đều việc cho các phục vụ.",
          },
        },
        {
          text: { en: "Slide into the sunny booth, it's obviously free", vi: "Tự trượt vào bàn nắng đẹp, rõ ràng là trống mà" },
          points: 0,
          feedback: {
            en: "The booth's waiter has a full section already and nobody knows you're there. Wait for the host, unless the sign says “seat yourself”.",
            vi: "Phục vụ khu đó đã kín khách và không ai biết bạn ngồi đó. Hãy đợi nhân viên, trừ khi biển ghi “seat yourself”.",
          },
        },
      ],
      tip: {
        en: "“Please wait to be seated” means wait for the host. “Seat yourself” means you may pick any free table.",
        vi: "“Please wait to be seated” nghĩa là đợi nhân viên xếp chỗ. “Seat yourself” nghĩa là tự chọn bàn trống.",
      },
      next: "toBooth",
    },
    {
      id: "toBooth",
      type: "sandbox",
      objective: { en: "Follow the host to your booth.", vi: "Theo nhân viên tới bàn của bạn." },
      target: "booth",
      wrong: {
        register: { feedback: { en: "Not yet! You pay at the end.", vi: "Chưa đâu! Trả tiền ở cuối bữa." } },
      },
      next: "price",
    },
    {
      id: "price",
      type: "choice",
      speaker: waitress,
      icon: "👩‍🍳",
      prompt: {
        en: "“What can I get ya, hon?” The menu says **Cheeseburger & fries: $12.99**. Roughly how much will you pay in total?",
        vi: "“Cưng muốn dùng gì nào?” Thực đơn ghi **Cheeseburger & khoai chiên: $12.99**. Tổng cộng bạn sẽ trả khoảng bao nhiêu?",
      },
      options: [
        {
          text: { en: "About **$16–17**: price + **sales tax** + **tip**", vi: "Khoảng **$16–17**: giá + **thuế bán hàng** + **tiền boa**" },
          points: 10,
          correct: true,
          feedback: {
            en: "Exactly! Menu prices in the US usually exclude sales tax (added on the bill, varies by place) and the tip is on top.",
            vi: "Chính xác! Giá trên thực đơn ở Mỹ thường chưa gồm thuế bán hàng (cộng thêm vào hoá đơn, tuỳ nơi) và tiền boa tính thêm.",
          },
        },
        {
          text: { en: "**$12.99**: that's the price on the menu", vi: "**$12.99**: giá trên thực đơn mà" },
          points: 0,
          feedback: {
            en: "Surprise! The total will be higher: tax is added at the end and a tip is expected for table service.",
            vi: "Bất ngờ chưa! Tổng sẽ cao hơn: thuế cộng ở cuối và boa là điều được mong đợi ở nhà hàng ngồi bàn.",
          },
        },
        {
          text: { en: "About **$13–14**: tax is included, tipping is optional", vi: "Khoảng **$13–14**: đã gồm thuế, boa là tuỳ ý" },
          points: 2,
          feedback: {
            en: "Not quite. Tax is usually added on top, and tipping isn't really optional at a sit-down restaurant.",
            vi: "Chưa đúng. Thuế thường cộng thêm, và boa không thực sự tuỳ ý ở nhà hàng ngồi bàn.",
          },
        },
      ],
      tip: {
        en: "US menu prices exclude sales tax; add tax and a 15–20% tip when you do the maths.",
        vi: "Giá thực đơn ở Mỹ chưa gồm thuế bán hàng; hãy cộng thuế và 15–20% boa khi tính tiền.",
      },
      next: "refill",
    },
    {
      id: "refill",
      type: "choice",
      speaker: waitress,
      icon: "🥤",
      prompt: {
        en: "She brings an enormous soda, ice water and a menu of pies. Your cup is empty after ten minutes. A busy room, a hot afternoon.",
        vi: "Cô mang ra ly soda khổng lồ, nước đá và thực đơn bánh. Mười phút sau ly của bạn cạn. Quán đông, chiều nóng.",
      },
      options: [
        {
          text: { en: "Ask for a **refill**: soft drinks are often free to refill here", vi: "Xin **thêm nước**: nước ngọt thường được thêm miễn phí ở đây" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes! Free refills are common on soft drinks and coffee at diners (but not everywhere, so check the menu).",
            vi: "Đúng! Thêm nước miễn phí khá phổ biến với nước ngọt và cà phê ở diner (nhưng không phải đâu cũng vậy, nên xem thực đơn).",
          },
        },
        {
          text: { en: "Order a **second soda**, it's a new drink", vi: "Gọi **ly soda thứ hai**, coi như đồ uống mới" },
          points: 3,
          feedback: {
            en: "That would work but costs extra. Ask for a refill of the same cup first!",
            vi: "Cũng được nhưng tốn thêm tiền. Hãy xin thêm nước vào cùng ly trước đã!",
          },
        },
      ],
      next: "tipGame",
    },
    {
      id: "tipGame",
      type: "minigame",
      game: "swipe",
      objective: { en: "Tip expected, or optional? Judge each situation.", vi: "Cần boa hay tuỳ ý? Phán xét từng tình huống." },
      params: {
        title: { en: "Tip expected or optional?", vi: "Boa là bắt buộc hay tuỳ ý?" },
        left: { label: { en: "Optional", vi: "Tuỳ ý" }, icon: "🙅", color: "#6d6589" },
        right: { label: { en: "Tip expected", vi: "Nên boa" }, icon: "💵", color: "#2f9e44" },
        secondsPerCard: 7,
        items: ITEMS,
      },
      tip: {
        en: "Tip 15–20% for table service, bar, taxi, haircuts and delivery. Counter service, supermarket cashiers and bills that already include gratuity: no tip needed.",
        vi: "Boa 15–20% cho phục vụ bàn, quầy bar, taxi, cắt tóc và giao hàng. Quầy tự phục vụ, thu ngân siêu thị và hoá đơn đã gồm phí phục vụ: không cần boa.",
      },
      next: "math",
    },
    {
      id: "math",
      type: "choice",
      speaker: waitress,
      icon: "🧾",
      prompt: {
        en: "The check comes: **$40.00** before tax. The waitress was great, so you want to leave **20%**. How much is the tip?",
        vi: "Hoá đơn tới: **$40.00** trước thuế. Phục vụ rất tuyệt nên bạn muốn boa **20%**. Tiền boa là bao nhiêu?",
      },
      options: [
        {
          text: { en: "**$8** (20% of the pre-tax total: move the decimal, then double)", vi: "**$8** (20% của tổng trước thuế: dịch dấu thập phân rồi nhân đôi)" },
          points: 10,
          correct: true,
          feedback: {
            en: "Great trick: 10% of $40 is $4; double it for 20% = $8. Tip on the pre-tax total.",
            vi: "Mẹo hay: 10% của $40 là $4; nhân đôi cho 20% = $8. Tính boa trên tổng trước thuế.",
          },
        },
        {
          text: { en: "**$4** (that's 10%, but it feels fine)", vi: "**$4** (đó là 10% nhưng cảm giác ổn)" },
          points: 3,
          feedback: {
            en: "That's only 10%, which is on the low side for good table service. 15–20% is the norm.",
            vi: "Đó mới chỉ 10%, hơi thấp cho phục vụ bàn tốt. 15–20% là mức thông thường.",
          },
        },
        {
          text: { en: "**$0**: the menu said free refills, that's my gift", vi: "**$0**: thực đơn ghi miễn phí thêm nước, vậy là quà của tôi" },
          points: 0,
          feedback: {
            en: "Servers rely on tips, so not tipping hurts their wages. “Free refills” means the drink is free, not the work.",
            vi: "Phục vụ sống dựa vào tiền boa nên không boa ảnh hưởng thu nhập của họ. “Free refills” nghĩa là đồ uống miễn phí, không phải công sức.",
          },
        },
      ],
      tip: {
        en: "Quick tip maths: 10% = move the decimal one place; double it for 20%. Tip on the pre-tax amount.",
        vi: "Mẹo tính boa nhanh: 10% = dịch dấu thập phân một chữ số; nhân đôi cho 20%. Tính trên số tiền trước thuế.",
      },
      next: "box",
    },
    {
      id: "box",
      type: "choice",
      speaker: waitress,
      icon: "📦",
      prompt: {
        en: "Half the giant burger is left. “Everything's bigger in America,” including what you can't finish.",
        vi: "Còn lại nửa chiếc burger khổng lồ. “Ở Mỹ cái gì cũng to hơn”, kể cả phần bạn ăn không hết.",
      },
      options: [
        {
          text: { en: "Ask for a **to-go box** and take it home", vi: "Xin **hộp mang về** và đem về nhà" },
          points: 10,
          correct: true,
          feedback: {
            en: "Totally normal! Restaurant portions are big, and asking for a box (“Could I get a box, please?”) is standard.",
            vi: "Hoàn toàn bình thường! Khẩu phần nhà hàng lớn, và xin hộp (“Could I get a box, please?”) là chuyện thông thường.",
          },
        },
        {
          text: { en: "Leave it, taking leftovers is embarrassing", vi: "Bỏ lại, mang đồ thừa về thì ngại" },
          points: 5,
          feedback: {
            en: "Not embarrassing at all, and you'd waste a free lunch. Next time, ask for a box.",
            vi: "Không hề ngại, và bạn bỏ phí một bữa trưa miễn phí. Lần sau hãy xin hộp.",
          },
        },
      ],
      next: "toRegister",
    },
    {
      id: "toRegister",
      type: "sandbox",
      objective: { en: "Pay at the register by the door.", vi: "Thanh toán ở quầy cạnh cửa." },
      target: "register",
      next: "emergency",
    },
    {
      id: "emergency",
      type: "choice",
      icon: "🚑",
      prompt: {
        en: "At the next booth, an older man suddenly slumps over and can't breathe. Staff are shouting. You're the one holding a phone.",
        vi: "Ở bàn bên cạnh, một cụ ông đột nhiên gục xuống và không thở được. Nhân viên đang la hét. Người đang cầm điện thoại là bạn.",
      },
      options: [
        {
          text: { en: "Call **911** right now", vi: "Gọi **911** ngay" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes! 911 is the US emergency number (police, fire, ambulance). Say where you are and what's happening.",
            vi: "Đúng! 911 là số khẩn cấp ở Mỹ (cảnh sát, cứu hoả, cấp cứu). Nói rõ bạn ở đâu và chuyện gì đang xảy ra.",
          },
        },
        {
          text: { en: "Google the nearest hospital's number first", vi: "Tra số điện thoại bệnh viện gần nhất trước" },
          points: 0,
          feedback: {
            en: "Don't waste minutes. Dispatchers on 911 send the right help and guide you through first aid.",
            vi: "Đừng phí phút giây. Tổng đài 911 điều đúng đội cấp cứu và hướng dẫn sơ cứu cho bạn.",
          },
        },
        {
          text: { en: "Wait: ambulances cost a fortune in the US", vi: "Chờ đã: xe cấp cứu ở Mỹ đắt kinh khủng" },
          points: 0,
          feedback: {
            en: "A real problem, but never a reason to delay in a life-threatening emergency. Call first; ask about costs and financial help afterwards. And get health or travel insurance before you need it.",
            vi: "Đúng là vấn đề thật, nhưng không bao giờ là lý do để chần chừ khi tính mạng nguy cấp. Gọi trước, hỏi về chi phí và hỗ trợ tài chính sau. Và hãy mua bảo hiểm y tế hoặc du lịch trước khi cần.",
          },
        },
      ],
      tip: {
        en: "Emergency in the US: call 911. Ambulances and ER visits can cost well over a thousand dollars without insurance, so get health or travel insurance.",
        vi: "Khẩn cấp ở Mỹ: gọi 911. Xe cấp cứu và khám cấp cứu có thể tốn hơn cả nghìn đô nếu không có bảo hiểm, nên hãy mua bảo hiểm y tế hoặc du lịch.",
      },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      icon: "🇺🇸",
      text: {
        en: "Paramedics arrive in minutes and the man is fine (he'd choked on pie). The ambulance ride, you hear, costs more than your flight over. Welcome to America: leave 20%, and buy insurance.",
        vi: "Nhân viên cấp cứu đến sau vài phút và cụ ông ổn (cụ bị nghẹn miếng bánh). Chuyến xe cấp cứu, nghe nói, đắt hơn cả vé máy bay của bạn. Chào mừng đến nước Mỹ: boa 20%, và mua bảo hiểm.",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
