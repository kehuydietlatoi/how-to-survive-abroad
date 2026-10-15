// Germany · From the airport to your new home.
// Facts checked Oct 2026: fare-dodging penalty ("erhöhtes Beförderungsentgelt") is €60;
// Deutschlandticket costs €63/month from Jan 2026 and is sold only as a subscription.
// Station / stop names are fictional; validation rules differ by city. The game teaches
// the habit: if a ticket says "bitte entwerten" (no date/time printed), stamp it before boarding.

const inspector = { en: "Ticket inspector", vi: "Nhân viên soát vé" };

export default {
  id: "germany-airport-to-home",
  flags: { stamped: false, ticketValid: false },
  routeTitle: { en: "Your route (from your phone)", vi: "Lộ trình (trên điện thoại)" },
  route: [
    { badge: "S8", color: "#3aa04a", text: { en: "Airport (Flughafen) → **Hauptbahnhof** · from Gleis 1–2", vi: "Sân bay (Flughafen) → **Hauptbahnhof** · từ Gleis 1–2" } },
    { badge: "34", color: "#a3007c", text: { en: "Bus 34 Hauptbahnhof → **Lindenstraße**", vi: "Buýt 34 Hauptbahnhof → **Lindenstraße**" } },
    { badge: "🚶", color: "#7cc6fe", text: { en: "Walk to **Lindenstraße 12**", vi: "Đi bộ tới **Lindenstraße 12**" } },
  ],
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "📱",
      route: true,
      text: {
        en: "Willkommen in Deutschland! You just landed. Your new landlord texted you the route to your flat. You can open it any time with **R** or the 🗺️ button.",
        vi: "Willkommen in Deutschland! Bạn vừa hạ cánh. Chủ nhà mới đã nhắn lộ trình về căn hộ. Bạn có thể mở lại bất cứ lúc nào bằng phím **R** hoặc nút 🗺️.",
      },
      next: "findMachine",
    },
    {
      id: "findMachine",
      type: "sandbox",
      objective: { en: "Buy a ticket. Find a ticket machine (Fahrkartenautomat).", vi: "Mua vé: tìm máy bán vé (Fahrkartenautomat)." },
      target: "ticketMachine",
      next: "buy",
    },
    {
      id: "buy",
      type: "minigame",
      game: "ticketMachine",
      objective: { en: "Buy the right ticket for your whole trip.", vi: "Mua đúng vé cho cả hành trình." },
      next: "stampChoice",
    },
    {
      id: "stampChoice",
      type: "choice",
      icon: "🎫",
      prompt: {
        en: "Your ticket says **“Bitte entwerten!”** and has no date or time printed on it. What now?",
        vi: "Vé của bạn ghi **“Bitte entwerten!”** và không in ngày giờ. Giờ làm gì?",
      },
      options: [
        {
          text: { en: "Stamp it at the little validator box (Entwerter) before boarding", vi: "Dập vé ở hộp dập vé nhỏ (Entwerter) trước khi lên tàu" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right! Without the stamp the ticket isn't valid yet. Validators are at platform entrances (in buses/trams they're often on board).",
            vi: "Đúng! Chưa dập thì vé chưa có hiệu lực. Máy dập vé ở lối vào sân ga (trên buýt/tram thường có sẵn trên xe).",
          },
          next: "stamp",
        },
        {
          text: { en: "Just get on, I paid, so it's fine", vi: "Cứ lên tàu thôi, mình đã trả tiền rồi mà" },
          points: 0,
          feedback: {
            en: "Risky! An unstamped ticket counts as **no ticket** at an inspection, even if you paid: that's a **€60** penalty on the spot.",
            vi: "Rủi ro! Vé chưa dập bị coi như **không có vé** khi bị kiểm tra, dù bạn đã trả tiền: phạt **60 €** tại chỗ.",
          },
          next: "toPlatform",
        },
        {
          text: { en: "Ask the S-Bahn driver to stamp it", vi: "Nhờ lái tàu S-Bahn dập vé" },
          points: 2,
          feedback: {
            en: "Train drivers don't check or stamp tickets. Use the validator yourself.",
            vi: "Lái tàu không kiểm tra hay dập vé. Bạn tự dùng máy dập vé.",
          },
          next: "toPlatform",
        },
      ],
      tip: {
        en: "If a ticket shows no date/time (“bitte entwerten”), stamp it in an Entwerter **before** you ride.",
        vi: "Nếu vé không in ngày giờ (“bitte entwerten”), hãy dập vé ở Entwerter **trước khi** đi.",
      },
    },
    {
      id: "stamp",
      type: "sandbox",
      objective: { en: "Stamp your ticket at the yellow validator (Entwerter).", vi: "Dập vé ở máy dập vé màu vàng (Entwerter)." },
      target: "validator",
      set: { stamped: true },
      done: { en: "*Klack!* Your ticket now shows today's date, time and place. It's valid.", vi: "*Cạch!* Vé đã in ngày, giờ và địa điểm hôm nay. Vé có hiệu lực rồi." },
      next: "toPlatform",
    },
    {
      id: "toPlatform",
      type: "sandbox",
      objective: {
        en: "Go to the platform and board the S8 **towards Hauptbahnhof**. Check the departure board!",
        vi: "Ra sân ga và lên tàu S8 **hướng Hauptbahnhof**. Xem bảng giờ tàu!",
      },
      target: "train1Door",
      hideMarker: true,
      wrong: {
        train2Door: {
          points: -10,
          icon: "🙅",
          feedback: {
            en: "Wait! This S8 goes to **Rheinhafen**, the opposite direction. Same line number, different direction. Check the end station on the board.",
            vi: "Khoan! Chuyến S8 này đi **Rheinhafen**, ngược chiều. Cùng số tuyến nhưng khác hướng. Xem ga cuối trên bảng.",
          },
          tip: {
            en: "The line number isn't enough: check the **direction** (end station / Richtung) and the platform (Gleis).",
            vi: "Chỉ số tuyến là chưa đủ: hãy xem **hướng đi** (ga cuối / Richtung) và sân ga (Gleis).",
          },
        },
      },
      next: "ride",
    },
    {
      id: "ride",
      type: "travel",
      spawn: "inTrain",
      text: { en: "🚆 “Zurückbleiben, bitte!” The doors close…", vi: "🚆 “Zurückbleiben, bitte!” (Xin đứng lùi lại!) Cửa đóng…" },
      next: "inspection",
    },
    {
      id: "inspection",
      type: "choice",
      speaker: inspector,
      icon: "👮",
      onEnter: [{ do: "anim", id: "inspector", anim: "interact-right" }],
      prompt: {
        en: "“**Fahrkartenkontrolle!** Die Fahrkarten, bitte.” (Ticket inspection, tickets please.)",
        vi: "“**Fahrkartenkontrolle!** Die Fahrkarten, bitte.” (Kiểm tra vé, xin cho xem vé.)",
      },
      options: [
        {
          text: { en: "Show your ticket with a smile", vi: "Mỉm cười và đưa vé" },
          points: 5,
          correct: true,
          feedback: { en: "Inspectors are often in plain clothes and show an ID badge.", vi: "Nhân viên soát vé thường mặc thường phục và đưa thẻ công vụ." },
        },
        {
          text: { en: "Pretend to be asleep", vi: "Giả vờ ngủ" },
          points: 0,
          feedback: {
            en: "Nice try, they will wake you up. Riding without showing a valid ticket costs **€60**.",
            vi: "Thử hay đấy, nhưng họ sẽ đánh thức bạn. Không xuất trình được vé hợp lệ bị phạt **60 €**.",
          },
        },
      ],
      next: "checkOk",
    },
    {
      id: "checkOk",
      type: "info",
      speaker: inspector,
      icon: "👮",
      maxPoints: 30,
      points: 30,
      text: { en: "“Danke, alles in Ordnung. Gute Fahrt!” (Thanks, all good. Have a nice trip!)", vi: "“Danke, alles in Ordnung. Gute Fahrt!” (Cảm ơn, mọi thứ ổn. Chúc đi vui vẻ!)" },
      tip: {
        en: "Valid ticket + stamped = no stress at inspections. Without one you pay **€60** on the spot (erhöhtes Beförderungsentgelt).",
        vi: "Vé đúng + đã dập = không lo khi bị kiểm tra. Không có vé hợp lệ sẽ bị phạt **60 €** tại chỗ (erhöhtes Beförderungsentgelt).",
      },
      next: "toHbf",
    },
    {
      id: "toHbf",
      type: "travel",
      spawn: "hbf",
      text: { en: "“Nächster Halt: **Hauptbahnhof**.” Time to change to the bus.", vi: "“Nächster Halt: **Hauptbahnhof**.” (Ga tiếp theo: Ga trung tâm) Đến lúc đổi sang xe buýt." },
      next: "findBus",
    },
    {
      id: "findBus",
      type: "sandbox",
      objective: { en: "Find the right bus stop. Check your route (R).", vi: "Tìm đúng trạm xe buýt. Xem lộ trình (R)." },
      target: "stop34",
      hideMarker: true,
      wrong: {
        stop12: {
          points: -5,
          icon: "🚏",
          feedback: {
            en: "This stop is for **Bus 12 → Messe**. Your route says **Bus 34 → Lindenstraße**. Look for the green **H** sign with the right number.",
            vi: "Trạm này của **buýt 12 → Messe**. Lộ trình của bạn là **buýt 34 → Lindenstraße**. Tìm biển **H** xanh lá có đúng số tuyến.",
          },
        },
      },
      next: "boardBus",
    },
    {
      id: "boardBus",
      type: "choice",
      icon: "🚌",
      onEnter: [
        { do: "visible", id: "bus34", on: true },
        { do: "focus", id: "bus34" },
        { do: "move", id: "bus34", to: [93, -1.3], dur: 2.2 },
      ],
      prompt: { en: "Bus 34 pulls in. How do you get on?", vi: "Buýt 34 vào trạm. Bạn lên xe thế nào?" },
      options: [
        {
          text: { en: "Front door, show your ticket to the driver", vi: "Lên cửa trước, đưa vé cho tài xế xem" },
          points: 10,
          correct: true,
          feedback: {
            en: "Good habit. In many German cities you board buses at the front and show your ticket. Your S-Bahn ticket also covers this transfer!",
            vi: "Thói quen tốt. Ở nhiều thành phố Đức, bạn lên buýt cửa trước và đưa vé. Vé S-Bahn của bạn cũng dùng được cho lần chuyển này!",
          },
        },
        {
          text: { en: "Hop in the back door without showing anything", vi: "Lên cửa sau, không đưa vé" },
          points: 5,
          feedback: {
            en: "Some cities allow all doors, but then random checks happen. Fine **only** with a valid ticket.",
            vi: "Một số nơi cho lên mọi cửa, nhưng sẽ có kiểm tra ngẫu nhiên. Chỉ ổn **nếu** bạn có vé hợp lệ.",
          },
        },
        {
          text: { en: "Buy a new ticket from the driver with your €50 note", vi: "Mua vé mới từ tài xế bằng tờ 50 €" },
          points: 0,
          feedback: {
            en: "No need: one single ticket covers the **whole trip incl. transfers** in one direction. And drivers often won't take big notes.",
            vi: "Không cần: một vé lượt dùng cho **cả hành trình kể cả chuyển tuyến** theo một chiều. Tài xế cũng thường không nhận tiền mệnh giá lớn.",
          },
        },
      ],
      tip: {
        en: "One ticket covers your whole trip in one direction, transfers included (S-Bahn → bus), within its validity.",
        vi: "Một vé dùng cho cả hành trình một chiều, kể cả chuyển tuyến (S-Bahn → buýt), trong thời hạn hiệu lực.",
      },
      next: "stopButton",
    },
    {
      id: "stopButton",
      type: "choice",
      icon: "🔴",
      onEnter: [{ do: "visible", id: "player", on: false }],
      prompt: {
        en: "The display reads: **“Nächster Halt: Lindenstraße”**. What do you do?",
        vi: "Màn hình hiện: **“Nächster Halt: Lindenstraße”** (Trạm tới: Lindenstraße). Bạn làm gì?",
      },
      options: [
        {
          text: { en: "Press the red **STOP** button", vi: "Bấm nút **STOP** màu đỏ" },
          points: 10,
          correct: true,
          feedback: { en: "Ding! “Wagen hält”: the bus will stop for you.", vi: "Ding! “Wagen hält” (Xe sẽ dừng): xe sẽ dừng cho bạn." },
        },
        {
          text: { en: "Wait. The bus stops everywhere anyway", vi: "Cứ đợi, xe buýt dừng ở mọi trạm mà" },
          points: 0,
          feedback: {
            en: "Not always! If nobody presses STOP and nobody is waiting, the bus can **drive past** your stop.",
            vi: "Không phải lúc nào cũng vậy! Nếu không ai bấm STOP và không ai đợi ở trạm, xe có thể **chạy qua** luôn.",
          },
        },
        {
          text: { en: "Walk up and tell the driver while driving", vi: "Đi lên nói với tài xế khi xe đang chạy" },
          points: 2,
          feedback: { en: "Please don't distract the driver. That's what the button is for.", vi: "Đừng làm phiền tài xế khi đang lái. Nút bấm là để làm việc đó." },
        },
      ],
      tip: {
        en: "Press the **STOP** button before your stop (Haltewunsch), or the bus may not stop.",
        vi: "Bấm nút **STOP** trước trạm của bạn (Haltewunsch), không thì xe có thể không dừng.",
      },
      next: "toHome",
    },
    {
      id: "toHome",
      type: "travel",
      spawn: "home",
      text: { en: "🚌 “Lindenstraße.” You hop off the bus.", vi: "🚌 “Lindenstraße.” Bạn xuống xe." },
      during: [{ do: "visible", id: "player", on: true }],
      next: "findHome",
    },
    {
      id: "findHome",
      type: "sandbox",
      objective: { en: "Find your new home: **Lindenstraße 12**.", vi: "Tìm nhà mới: **Lindenstraße 12**." },
      target: "homeDoor",
      next: "welcome",
    },
    {
      id: "welcome",
      type: "info",
      speaker: { en: "Frau Becker (landlady)", vi: "Bà Becker (chủ nhà)" },
      icon: "👵",
      text: {
        en: "“Herzlich willkommen! You found it all by yourself. Next step: register your address at the **Bürgeramt** within 2 weeks. But that's another adventure…”",
        vi: "“Herzlich willkommen! Bạn tự tìm được đường rồi. Bước tiếp theo: đăng ký địa chỉ ở **Bürgeramt** trong vòng 2 tuần. Nhưng đó là một chuyến phiêu lưu khác…”",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
