// Vietnam · Your first Grab bike ride (Hoàn Kiếm → Văn Miếu, ~2.5 km).
// Facts checked Oct 2026: GrabBike Hanoi ≈ 17.000đ first 2 km + ≈ 5.500đ/km, so this trip is
// roughly 20.000–30.000đ. Passengers must wear a helmet with the strap fastened; carrying a
// passenger without a properly worn helmet is fined 400.000–600.000đ. Most bike exhausts are on
// the right side, so get on and off on the left to avoid burns.

const mai = { en: "Chị Mai (hotel)", vi: "Chị Mai (khách sạn)" };
const xeOm = { en: "Street xe ôm driver", vi: "Bác xe ôm" };
const tuan = { en: "Anh Tuấn (your Grab driver)", vi: "Anh Tuấn (tài xế Grab)" };

export default {
  id: "vietnam-grab-ride",
  routeTitle: { en: "Grab app: your booking", vi: "Ứng dụng Grab: chuyến của bạn" },
  route: [
    { badge: "🛵", color: "#00b14f", text: { en: "**GrabBike** · Hoàn Kiếm → **Văn Miếu** · ≈ 25.000đ (cash)", vi: "**GrabBike** · Hoàn Kiếm → **Văn Miếu** · ≈ 25.000đ (tiền mặt)" } },
    { badge: "👤", color: "#7cc6fe", text: { en: "Driver: **Anh Tuấn** ⭐ 4.9 · Honda Wave, red", vi: "Tài xế: **Anh Tuấn** ⭐ 4.9 · Honda Wave, màu đỏ" } },
    { badge: "🔢", color: "#ff7aa2", text: { en: "Plate: **29B1-234.56**", vi: "Biển số: **29B1-234.56**" } },
  ],
  steps: [
    {
      id: "intro",
      type: "info",
      speaker: mai,
      icon: "👩",
      text: {
        en: "Good morning! You want to visit **Văn Miếu** (the Temple of Literature)? It's about 2.5 km. Too far to walk in this heat. Take a **Grab bike**, it's fast and cheap!",
        vi: "Chào buổi sáng! Bạn muốn đi **Văn Miếu**? Khoảng 2,5 km. Trời nóng thế này đi bộ thì xa lắm. Đi **Grab bike** đi, vừa nhanh vừa rẻ!",
      },
      next: "xeOm",
    },
    {
      id: "xeOm",
      type: "choice",
      speaker: xeOm,
      icon: "🧔",
      onEnter: [{ do: "anim", id: "xeOm", anim: "emote-yes" }],
      prompt: { en: "“Xe ôm! Văn Miếu? **Two hundred thousand!**” (200.000đ)", vi: "“Xe ôm không? Văn Miếu à? **Hai trăm nghìn!**” (200.000đ)" },
      options: [
        {
          text: { en: "OK, let's go!", vi: "OK, đi thôi!" },
          points: 0,
          feedback: {
            en: "That's about **8× the app price** (≈ 25.000đ). Street xe ôm can be fine, but tourists often get quoted far too much.",
            vi: "Gấp khoảng **8 lần giá trên app** (≈ 25.000đ). Xe ôm truyền thống vẫn ổn, nhưng khách du lịch hay bị “chặt chém”.",
          },
        },
        {
          text: { en: "Bargain: “150.000?”", vi: "Mặc cả: “150.000 nhé?”" },
          points: 3,
          feedback: { en: "Still about 6× too much! Without knowing the fair price, bargaining doesn't help.", vi: "Vẫn đắt gấp 6 lần! Không biết giá đúng thì mặc cả cũng không giúp được." },
        },
        {
          text: { en: "“Không, cảm ơn anh” (no, thank you), then book in the app", vi: "“Không, cảm ơn anh” rồi đặt xe qua app" },
          points: 10,
          correct: true,
          feedback: {
            en: "Polite and smart. Apps like Grab, Be or Xanh SM show a **fixed price** before you ride.",
            vi: "Lịch sự và khôn ngoan. Các app như Grab, Be hay Xanh SM báo **giá cố định** trước khi đi.",
          },
        },
      ],
      tip: {
        en: "Use a ride app (Grab, Be, Xanh SM) for a fixed price. If you take a street xe ôm, agree on the price **before** you get on.",
        vi: "Dùng app gọi xe (Grab, Be, Xanh SM) để có giá cố định. Nếu đi xe ôm truyền thống, thoả thuận giá **trước khi** lên xe.",
      },
      next: "service",
    },
    {
      id: "service",
      type: "choice",
      icon: "📱",
      prompt: { en: "In the Grab app. You're alone with a small bag. Which service?", vi: "Trong app Grab. Bạn đi một mình với túi nhỏ. Chọn dịch vụ nào?" },
      options: [
        {
          text: { en: "**GrabBike** ≈ 25.000đ, about 10 min", vi: "**GrabBike** ≈ 25.000đ, khoảng 10 phút" },
          points: 10,
          correct: true,
          feedback: { en: "Best choice for one person: cheap and it slips through traffic.", vi: "Lựa chọn tốt nhất cho một người: rẻ và luồn lách qua kẹt xe tốt." },
        },
        {
          text: { en: "**GrabCar** ≈ 60.000đ, about 15–20 min", vi: "**GrabCar** ≈ 60.000đ, khoảng 15–20 phút" },
          points: 5,
          feedback: {
            en: "Fine too: comfier with luggage or in rain, but pricier and slower in rush hour.",
            vi: "Cũng được: thoải mái hơn khi có hành lý hoặc trời mưa, nhưng đắt hơn và chậm hơn giờ cao điểm.",
          },
        },
      ],
      next: "booked",
    },
    {
      id: "booked",
      type: "info",
      icon: "📱",
      route: true,
      text: {
        en: "Driver found! He's waiting at the kerb. Remember the **plate number**: press **R** / 🗺️ to see the app again.",
        vi: "Đã tìm được tài xế! Anh ấy đang đợi ở mép đường. Nhớ **biển số xe**: nhấn **R** / 🗺️ để xem lại app.",
      },
      next: "findDriver",
    },
    {
      id: "findDriver",
      type: "sandbox",
      objective: { en: "Find your driver: plate **29B1-234.56**.", vi: "Tìm tài xế của bạn: biển số **29B1-234.56**." },
      target: "driverOK",
      hideMarker: true,
      wrong: Object.fromEntries(
        [
          ["driverA", "29B1-243.56"],
          ["driverB", "29H1-234.56"],
          ["driverC", "29B1-234.65"],
        ].map(([id, plate]) => [
          id,
          {
            points: -5,
            icon: "🙅",
            feedback: {
              en: `Plate **${plate}** looks similar but isn't yours (29B1-234.56). Getting on the wrong bike is risky. Always match **plate, name and photo** in the app.`,
              vi: `Biển **${plate}** trông giống nhưng không phải xe của bạn (29B1-234.56). Lên nhầm xe rất nguy hiểm. Luôn đối chiếu **biển số, tên và ảnh** trong app.`,
            },
            tip: {
              en: "Before getting on, check the **plate number, driver name and photo** in the app.",
              vi: "Trước khi lên xe, kiểm tra **biển số, tên và ảnh tài xế** trong app.",
            },
          },
        ])
      ),
      next: "helmet",
    },
    {
      id: "helmet",
      type: "choice",
      speaker: tuan,
      icon: "🪖",
      onEnter: [{ do: "anim", id: "driverOK", anim: "emote-yes", once: true }],
      prompt: { en: "“Chào bạn! Mũ bảo hiểm đây.” He hands you a helmet.", vi: "“Chào bạn! Mũ bảo hiểm đây.” Anh ấy đưa bạn mũ bảo hiểm." },
      options: [
        {
          text: { en: "Put it on and **click the chin strap**", vi: "Đội mũ và **cài quai** cẩn thận" },
          points: 10,
          correct: true,
          feedback: { en: "Safe and legal. Helmets are compulsory for passengers too.", vi: "An toàn và đúng luật. Người ngồi sau cũng bắt buộc đội mũ." },
        },
        {
          text: { en: "Just put it on loosely, it's a short ride", vi: "Đội hờ thôi, đi gần mà" },
          points: 0,
          feedback: {
            en: "An unfastened strap counts as **not wearing a helmet**: your driver can be fined 400.000–600.000đ, and it flies off in a crash.",
            vi: "Không cài quai bị coi như **không đội mũ**: tài xế có thể bị phạt 400.000–600.000đ, và mũ sẽ văng ra khi ngã.",
          },
        },
        {
          text: { en: "“No thanks, it'll mess up my hair”", vi: "“Thôi, đội vào hỏng tóc”" },
          points: 0,
          feedback: { en: "Not optional: helmets are required by law, for drivers **and** passengers.", vi: "Không được tuỳ chọn: luật bắt buộc đội mũ, cả người lái **và** người ngồi sau." },
        },
      ],
      tip: {
        en: "Always wear the helmet with the chin strap clicked. It's the law for passengers too.",
        vi: "Luôn đội mũ bảo hiểm và cài quai. Người ngồi sau cũng phải tuân thủ.",
      },
      next: "getOn",
    },
    {
      id: "getOn",
      type: "choice",
      icon: "🛵",
      prompt: { en: "Which side do you climb on from?", vi: "Bạn leo lên xe từ phía nào?" },
      options: [
        {
          text: { en: "The **left** side", vi: "Phía **bên trái**" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right! The **exhaust pipe** is on the right on most bikes and gets very hot. Many tourists get a burn on the calf.",
            vi: "Đúng! **Ống xả (pô)** của hầu hết xe máy nằm bên phải và rất nóng. Nhiều khách du lịch bị bỏng bắp chân.",
          },
        },
        {
          text: { en: "The **right** side", vi: "Phía **bên phải**" },
          points: 0,
          feedback: {
            en: "Careful: that's where the hot **exhaust pipe** is. Brush it with your leg and you get a nasty burn.",
            vi: "Cẩn thận: bên đó có **ống xả (pô)** rất nóng. Chạm chân vào là bị bỏng nặng.",
          },
        },
      ],
      tip: {
        en: "Get on and off a motorbike on the **left**: the hot exhaust is on the right.",
        vi: "Lên xuống xe máy ở **bên trái**: ống xả nóng nằm bên phải.",
      },
      next: "ride",
    },
    {
      id: "ride",
      type: "minigame",
      game: "grabRide",
      objective: { en: "Be a good passenger all the way to Văn Miếu!", vi: "Làm người ngồi sau thật “chuẩn” tới Văn Miếu!" },
      next: "arrive",
    },
    {
      id: "arrive",
      type: "travel",
      spawn: "arrive",
      text: { en: "🛵 Văn Miếu, the Temple of Literature.", vi: "🛵 Văn Miếu, Quốc Tử Giám." },
      wait: 900,
      next: "getOff",
    },
    {
      id: "getOff",
      type: "choice",
      icon: "🛵",
      onEnter: [{ do: "focus", id: "arrivedBike" }],
      prompt: { en: "The bike stops. How do you get off?", vi: "Xe dừng lại. Bạn xuống xe thế nào?" },
      options: [
        {
          text: { en: "Wait until it fully stops, then step off on the **left**", vi: "Đợi xe dừng hẳn rồi bước xuống bên **trái**" },
          points: 10,
          correct: true,
          feedback: { en: "Perfect: no burns, no surprises.", vi: "Hoàn hảo: không bỏng, không bất ngờ." },
        },
        {
          text: { en: "Hop off on the right while it's still rolling", vi: "Nhảy xuống bên phải khi xe còn đang chạy" },
          points: 0,
          feedback: { en: "Double danger: moving bike **and** the hot exhaust on the right!", vi: "Nguy hiểm gấp đôi: xe còn chạy **và** ống xả nóng bên phải!" },
        },
      ],
      next: "pay",
    },
    {
      id: "pay",
      type: "choice",
      speaker: tuan,
      icon: "💸",
      prompt: { en: "The app shows **25.000đ** (cash). What do you do?", vi: "App hiển thị **25.000đ** (tiền mặt). Bạn làm gì?" },
      options: [
        {
          text: { en: "Give back the helmet, pay 25.000đ and say “Cảm ơn anh!”", vi: "Trả mũ, trả 25.000đ và nói “Cảm ơn anh!”" },
          points: 10,
          correct: true,
          feedback: {
            en: "Exactly. Tipping isn't expected; rounding up (e.g. 30.000đ) is a nice extra.",
            vi: "Chuẩn. Không bắt buộc tiền boa; làm tròn (vd. 30.000đ) là thêm phần dễ thương.",
          },
        },
        {
          text: { en: "Pay with a 500.000đ note", vi: "Trả bằng tờ 500.000đ" },
          points: 3,
          feedback: {
            en: "Drivers often can't change big notes. Keep **small notes** (10.000–50.000đ) for rides, or pay by card in the app.",
            vi: "Tài xế thường không có tiền thối cho tờ lớn. Hãy giữ **tiền lẻ** (10.000–50.000đ) hoặc trả bằng thẻ trong app.",
          },
        },
        {
          text: { en: "Keep the helmet as a souvenir", vi: "Giữ mũ làm kỷ niệm" },
          points: 0,
          feedback: { en: "That's the driver's helmet. He needs it for the next passenger!", vi: "Mũ của tài xế đấy, anh ấy cần cho khách sau!" },
        },
      ],
      tip: {
        en: "Pay the app price, keep small notes for cash rides, give the helmet back and rate your driver.",
        vi: "Trả đúng giá trên app, giữ tiền lẻ khi trả tiền mặt, trả lại mũ và đánh giá tài xế.",
      },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      speaker: tuan,
      icon: "⭐",
      onEnter: [{ do: "anim", id: "myDriver", anim: "emote-yes", once: true }],
      text: {
        en: "“Cảm ơn bạn! Đi chơi vui nhé!” (Thanks, have fun!) You give him ⭐⭐⭐⭐⭐ in the app.",
        vi: "“Cảm ơn bạn! Đi chơi vui nhé!” Bạn đánh giá anh ấy ⭐⭐⭐⭐⭐ trên app.",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
