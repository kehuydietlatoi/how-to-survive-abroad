// Germany · Anmeldung (registering your address at the Bürgeramt).
// Facts checked Oct 2026: register within 2 weeks of moving in; bring passport (non-EU: with
// visa / residence permit) or ID card, the landlord's confirmation (Wohnungsgeberbestätigung)
// and the registration form; the appointment is free; you get the Meldebescheinigung at once.
// The tax ID (Steuer-ID) letter is then posted to your new address. Many offices only serve
// with an appointment; procedures vary by city.

const becker = { en: "Frau Becker (landlady)", vi: "Bà Becker (chủ nhà)" };
const clerk = { en: "Clerk at Platz 4", vi: "Nhân viên quầy 4" };

const DOCS = [
  {
    id: "passport",
    icon: "🛂",
    name: { en: "Passport (with visa / residence permit)", vi: "Hộ chiếu (kèm visa / thẻ cư trú)" },
    zone: "bring",
    why: { en: "Your identity document is a must. Non-EU citizens bring the passport with the visa page.", vi: "Giấy tờ tuỳ thân là bắt buộc. Người ngoài EU mang hộ chiếu có trang visa." },
  },
  {
    id: "wgb",
    icon: "📝",
    name: { en: "Wohnungsgeberbestätigung (signed by landlord)", vi: "Wohnungsgeberbestätigung (chủ nhà ký)" },
    zone: "bring",
    why: {
      en: "The **landlord's confirmation** that you moved in is required. Without it you can't register.",
      vi: "**Xác nhận của chủ nhà** rằng bạn đã dọn vào là bắt buộc. Thiếu nó thì không đăng ký được.",
    },
  },
  {
    id: "form",
    icon: "🗂️",
    name: { en: "Registration form (Anmeldeformular), filled in", vi: "Tờ khai đăng ký (Anmeldeformular) đã điền" },
    zone: "bring",
    why: { en: "Fill in the form beforehand (download it from your city's website). It saves lots of time.", vi: "Điền tờ khai trước (tải trên web thành phố). Tiết kiệm rất nhiều thời gian." },
  },
  {
    id: "appointment",
    icon: "📧",
    name: { en: "Appointment confirmation", vi: "Xác nhận lịch hẹn" },
    zone: "bring",
    why: { en: "You need the appointment code to check in at the number terminal.", vi: "Bạn cần mã lịch hẹn để check-in ở máy lấy số." },
  },
  {
    id: "lease",
    icon: "📄",
    name: { en: "Rental contract (Mietvertrag)", vi: "Hợp đồng thuê nhà (Mietvertrag)" },
    zone: "home",
    why: {
      en: "Not required: the office needs the **Wohnungsgeberbestätigung**, not the lease itself.",
      vi: "Không bắt buộc: cơ quan cần **Wohnungsgeberbestätigung**, không cần hợp đồng thuê.",
    },
  },
  {
    id: "birth",
    icon: "👶",
    name: { en: "Birth certificate", vi: "Giấy khai sinh" },
    zone: "home",
    why: { en: "Not needed for a normal address registration.", vi: "Không cần cho việc đăng ký địa chỉ thông thường." },
  },
  {
    id: "bank",
    icon: "🏦",
    name: { en: "Bank statement", vi: "Sao kê ngân hàng" },
    zone: "home",
    why: { en: "Not needed. Actually it's the other way round: banks often ask for your **Meldebescheinigung**.", vi: "Không cần. Thực ra ngược lại: ngân hàng thường hỏi **Meldebescheinigung** của bạn." },
  },
  {
    id: "photos",
    icon: "🖼️",
    name: { en: "Passport photos", vi: "Ảnh thẻ" },
    zone: "home",
    why: { en: "No photos needed for the Anmeldung.", vi: "Đăng ký cư trú không cần ảnh." },
  },
  {
    id: "cash",
    icon: "💶",
    name: { en: "€50 cash for the fee", vi: "50 € tiền mặt để nộp phí" },
    zone: "home",
    why: { en: "Registering your address is **free**.", vi: "Đăng ký địa chỉ **miễn phí**." },
  },
];

export default {
  id: "germany-anmeldung",
  steps: [
    {
      id: "intro",
      type: "info",
      speaker: becker,
      icon: "👵",
      text: {
        en: "Here's your **Wohnungsgeberbestätigung**, the form that confirms you live here. You must register at the **Bürgeramt** within **2 weeks** of moving in. Without the Meldebescheinigung you'll struggle to open a bank account!",
        vi: "Đây là **Wohnungsgeberbestätigung**, giấy xác nhận bạn ở đây. Bạn phải đăng ký ở **Bürgeramt** trong vòng **2 tuần** sau khi dọn vào. Không có Meldebescheinigung thì khó mở tài khoản ngân hàng lắm!",
      },
      next: "booking",
    },
    {
      id: "booking",
      type: "choice",
      icon: "💻",
      prompt: { en: "How do you get an appointment (Termin)?", vi: "Làm sao để có lịch hẹn (Termin)?" },
      options: [
        {
          text: { en: "Book online on the city's official service portal", vi: "Đặt online trên cổng dịch vụ chính thức của thành phố" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right. Slots can be weeks away in big cities, so check often (new slots appear in the morning) and try other districts.",
            vi: "Đúng. Ở thành phố lớn lịch có thể kín vài tuần, hãy kiểm tra thường xuyên (lịch mới hay mở buổi sáng) và thử quận khác.",
          },
        },
        {
          text: { en: "Pay a website €50 for an “express appointment”", vi: "Trả 50 € cho một trang web để có “lịch hẹn nhanh”" },
          points: 0,
          feedback: {
            en: "Don't! The Anmeldung is **free** and appointments are only issued by the city. Resellers are a known scam.",
            vi: "Đừng! Đăng ký cư trú **miễn phí** và lịch hẹn chỉ do thành phố cấp. Bán lại lịch hẹn là chiêu lừa phổ biến.",
          },
        },
        {
          text: { en: "Just show up and wait", vi: "Cứ đến rồi chờ" },
          points: 3,
          feedback: {
            en: "Many offices only serve people **with an appointment**. You might be sent home after hours of waiting.",
            vi: "Nhiều nơi chỉ phục vụ người **có lịch hẹn**. Bạn có thể bị về không sau mấy tiếng chờ.",
          },
        },
      ],
      tip: {
        en: "Register within **2 weeks** of moving in; book the free appointment on the city's official website.",
        vi: "Đăng ký trong vòng **2 tuần** sau khi chuyển đến; đặt lịch miễn phí trên web chính thức của thành phố.",
      },
      next: "pack",
    },
    {
      id: "pack",
      type: "minigame",
      game: "sort",
      objective: { en: "Pack the right documents for your appointment.", vi: "Chuẩn bị đúng giấy tờ cho buổi hẹn." },
      params: {
        title: { en: "What goes in your folder?", vi: "Bỏ gì vào bìa hồ sơ?" },
        hint: { en: "Bring only what the Bürgeramt needs. Drag or tap.", vi: "Chỉ mang những gì Bürgeramt cần. Kéo hoặc chạm." },
        theme: "docs",
        zones: [
          { id: "bring", label: { en: "Bring", vi: "Mang theo" }, sub: { en: "your folder", vi: "bìa hồ sơ" }, color: "#2f6db5", icon: "📁" },
          { id: "home", label: { en: "Leave at home", vi: "Để ở nhà" }, sub: { en: "not needed", vi: "không cần" }, color: "#8a8f9c", icon: "🏠" },
        ],
        items: DOCS,
      },
      tip: {
        en: "Anmeldung documents: passport/ID (+ visa), the landlord's **Wohnungsgeberbestätigung**, the filled-in form and your appointment.",
        vi: "Giấy tờ đăng ký: hộ chiếu/CMND (+ visa), **Wohnungsgeberbestätigung** của chủ nhà, tờ khai đã điền và lịch hẹn.",
      },
      next: "toOffice",
    },
    {
      id: "toOffice",
      type: "travel",
      spawn: "hall",
      text: { en: "🏛️ Bürgeramt, Tuesday 9:10. Your appointment is at 9:15.", vi: "🏛️ Bürgeramt, thứ Ba 9:10. Lịch hẹn của bạn lúc 9:15." },
      next: "checkIn",
    },
    {
      id: "checkIn",
      type: "sandbox",
      objective: { en: "Check in at the number terminal (Wartenummer).", vi: "Check-in ở máy lấy số (Wartenummer)." },
      target: "terminal",
      done: {
        en: "You scan your appointment code. A ticket prints: **A-117**. Take a seat and watch the screen.",
        vi: "Bạn quét mã lịch hẹn. Máy in ra vé: **A-117**. Ngồi chờ và theo dõi màn hình.",
      },
      next: "wait",
    },
    {
      id: "wait",
      type: "minigame",
      game: "callBoard",
      objective: { en: "Watch the board for **A-117**.", vi: "Canh bảng gọi số **A-117**." },
      params: { mine: "A-117", counter: 4 },
      next: "toCounter",
    },
    {
      id: "toCounter",
      type: "sandbox",
      objective: { en: "Your number was called: go to **Platz 4**.", vi: "Số của bạn được gọi: đến **Platz 4** (quầy 4)." },
      target: "counter4",
      hideMarker: true,
      wrong: Object.fromEntries(
        [1, 2, 3, 5, 6].map((n) => [
          `counter${n}`,
          {
            points: -5,
            icon: "🙅",
            feedback: {
              en: `This is Platz ${n}: they're serving someone else. The board said **A-117 → Platz 4**.`,
              vi: `Đây là quầy ${n}: họ đang phục vụ người khác. Bảng ghi **A-117 → Platz 4**.`,
            },
          },
        ])
      ),
      next: "greet",
    },
    {
      id: "greet",
      type: "choice",
      speaker: clerk,
      icon: "🧑‍💼",
      onEnter: [{ do: "anim", id: "clerk4", anim: "emote-yes", once: true }],
      prompt: { en: "The clerk looks up: “Guten Tag. Was kann ich für Sie tun?”", vi: "Nhân viên ngẩng lên: “Guten Tag. Was kann ich für Sie tun?” (Tôi giúp gì được cho bạn?)" },
      options: [
        {
          text: { en: "“Guten Tag! Ich möchte mich anmelden.” (I'd like to register.)", vi: "“Guten Tag! Ich möchte mich anmelden.” (Tôi muốn đăng ký cư trú.)" },
          points: 10,
          correct: true,
          feedback: { en: "Perfect German! A friendly greeting goes a long way at the Amt.", vi: "Tiếng Đức chuẩn! Lời chào thân thiện giúp ích rất nhiều ở cơ quan." },
        },
        {
          text: { en: "“Hello, sorry, do you speak English?”", vi: "“Xin chào, xin lỗi, anh/chị nói tiếng Anh không?”" },
          points: 6,
          feedback: {
            en: "Often fine. Many clerks speak some English, but the official language is German. Learning a few key phrases helps.",
            vi: "Thường là ổn. Nhiều nhân viên nói chút tiếng Anh, nhưng ngôn ngữ chính thức là tiếng Đức. Học vài câu chính sẽ giúp ích.",
          },
        },
        {
          text: { en: "Silently slide your papers across the desk", vi: "Im lặng đẩy giấy tờ qua bàn" },
          points: 0,
          feedback: { en: "Say hello first: a polite “Guten Tag” is expected.", vi: "Hãy chào trước: một câu “Guten Tag” lịch sự là điều nên làm." },
        },
      ],
      next: "certificate",
    },
    {
      id: "certificate",
      type: "info",
      speaker: clerk,
      icon: "📜",
      text: {
        en: "Ten minutes later: “Hier ist Ihre **Meldebescheinigung**.” Keep it safe: banks, employers and many offices will ask for it. Your **tax ID (Steuer-ID)** will arrive by post in a few weeks.",
        vi: "Mười phút sau: “Hier ist Ihre **Meldebescheinigung**.” Giữ cẩn thận: ngân hàng, chủ lao động và nhiều cơ quan sẽ hỏi. **Mã số thuế (Steuer-ID)** sẽ được gửi qua bưu điện sau vài tuần.",
      },
      tip: {
        en: "Keep your **Meldebescheinigung**; the **Steuer-ID** letter comes by post afterwards, and your employer needs it.",
        vi: "Giữ **Meldebescheinigung**; thư **Steuer-ID** gửi qua bưu điện sau đó, chủ lao động sẽ cần.",
      },
      next: "mailbox",
    },
    {
      id: "mailbox",
      type: "choice",
      icon: "📬",
      prompt: {
        en: "Back home you notice: your name isn't on the **mailbox** or doorbell yet. Does it matter?",
        vi: "Về nhà bạn để ý: tên bạn chưa có trên **hộp thư** và chuông cửa. Có quan trọng không?",
      },
      options: [
        {
          text: { en: "Yes, put my name on the mailbox and doorbell today", vi: "Có, dán tên lên hộp thư và chuông cửa ngay hôm nay" },
          points: 10,
          correct: true,
          feedback: {
            en: "Exactly. Without your name, the postman may **return letters**, including your Steuer-ID and bank cards!",
            vi: "Chính xác. Thiếu tên, bưu tá có thể **trả lại thư**, kể cả Steuer-ID và thẻ ngân hàng!",
          },
        },
        {
          text: { en: "No, the post office knows my address now", vi: "Không, bưu điện biết địa chỉ của tôi rồi" },
          points: 0,
          feedback: {
            en: "The registration doesn't tell the postman. Letters to a name that isn't on the mailbox often go back to the sender.",
            vi: "Đăng ký cư trú không báo cho bưu tá. Thư gửi tên không có trên hộp thư thường bị trả lại.",
          },
        },
      ],
      tip: { en: "Put your name on the mailbox and doorbell, or important letters get returned.", vi: "Dán tên lên hộp thư và chuông cửa, nếu không thư quan trọng sẽ bị trả lại." },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
