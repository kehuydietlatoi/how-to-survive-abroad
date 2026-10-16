// UK · London: queueing, bus and Tube, the pub, Challenge 25 and British "politeness".
// Facts checked Oct 2026 (TfL guidance, press coverage of London's cashless buses, Challenge 25 retailer / council guidance):
// • British queue culture: join the back of the line at bus stops and shops.
// • London buses are cashless: pay with contactless / Oyster; the Tube and trains use touch in / touch out.
//   If you don't touch out, the journey is incomplete and you're charged a maximum fare.
//   Use the same card or device each time (a wallet full of cards can cause "card clash").
// • On Tube escalators the convention is "stand on the right, walk on the left".
// • In most pubs you order and pay at the bar (no table service), and it is normal to buy "rounds". Tipping isn't expected.
// • Challenge 25: sellers ask for photo ID (passport, UK photocard licence, PASS card) if you look under 25.
// • Emergency number 999 (112 also works). The "what the British really mean" cards are a light-hearted generalisation, not a rule.

export default {
  id: "uk-pub",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "🌧️",
      text: {
        en: "**London.** It's raining. Of course it's raining. A man steps on your foot and says “**sorry**”. You also say “sorry”. The universe is balanced. Today: bus, Tube, pub.",
        vi: "**London.** Trời đang mưa. Tất nhiên rồi. Một người đàn ông giẫm lên chân bạn và nói “**sorry**”. Bạn cũng nói “sorry”. Vũ trụ cân bằng. Hôm nay: xe buýt, Tube, quán pub.",
      },
      next: "toBusStop",
    },
    {
      id: "toBusStop",
      type: "sandbox",
      objective: { en: "Walk to the bus stop.", vi: "Đi tới trạm xe buýt." },
      target: "busStop",
      wrong: {
        phoneBox: { feedback: { en: "Nice phone box, but the bus won't wait. Well... it might, if you queue properly.", vi: "Buồng điện thoại đẹp đấy, nhưng xe buýt không đợi đâu. Mà... có thể đợi nếu bạn xếp hàng đúng cách." } },
      },
      next: "queue",
    },
    {
      id: "queue",
      type: "choice",
      icon: "🚌",
      prompt: {
        en: "Eight people stand in a silent, orderly line behind the bus stop pole. There's no sign saying “queue”. The bus appears in the distance.",
        vi: "Tám người đứng thành hàng im lặng, trật tự sau cột trạm xe buýt. Không có biển nào ghi “xếp hàng”. Xe buýt xuất hiện ở đằng xa.",
      },
      options: [
        {
          text: { en: "Join the **back of the queue** and wait your turn", vi: "Vào **cuối hàng** và đợi tới lượt" },
          points: 10,
          correct: true,
          feedback: {
            en: "Perfect. Queueing is a national religion. Nobody says a word, but everybody notices who joined where.",
            vi: "Tuyệt vời. Xếp hàng là quốc giáo. Không ai nói một lời, nhưng ai cũng để ý bạn vào hàng ở đâu.",
          },
        },
        {
          text: { en: "Stand at the **front** by the pole: that's where the bus stops", vi: "Đứng **đầu hàng** cạnh cột: nơi xe sẽ dừng" },
          points: 0,
          feedback: {
            en: "You've committed the ultimate crime. Eight people will tut quietly at exactly the same moment.",
            vi: "Bạn vừa phạm tội lớn nhất. Tám người sẽ cùng tặc lưỡi khe khẽ vào đúng một thời điểm.",
          },
        },
      ],
      tip: {
        en: "Queue at the back at bus stops and shops: jumping the queue is a serious social sin in the UK.",
        vi: "Xếp hàng ở cuối tại trạm xe buýt và cửa hàng: chen hàng là tội xã hội nghiêm trọng ở Anh.",
      },
      next: "busPay",
    },
    {
      id: "busPay",
      type: "choice",
      icon: "🚍",
      prompt: {
        en: "You reach the front of the queue and the red double-decker opens its doors. You wave a handful of **coins** at the driver.",
        vi: "Bạn lên đến đầu hàng và chiếc xe buýt hai tầng đỏ mở cửa. Bạn giơ một nắm **tiền xu** về phía tài xế.",
      },
      options: [
        {
          text: { en: "Tap a **contactless card / phone** (or Oyster) on the yellow reader", vi: "Chạm **thẻ không tiếp xúc / điện thoại** (hoặc Oyster) vào đầu đọc màu vàng" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right! London buses are cashless: you tap on when you board (no need to tap off on a bus).",
            vi: "Đúng! Xe buýt London không dùng tiền mặt: bạn chạm khi lên xe (không cần chạm khi xuống xe buýt).",
          },
        },
        {
          text: { en: "Insist on paying cash: “I've got exact change!”", vi: "Nhất quyết trả tiền mặt: “Tôi có đủ tiền lẻ!”" },
          points: 0,
          feedback: {
            en: "Buses don't take cash anymore, and the queue behind you sighs in perfect unison.",
            vi: "Xe buýt không nhận tiền mặt nữa, và hàng người phía sau thở dài đồng loạt.",
          },
        },
      ],
      tip: {
        en: "London buses are cashless: tap contactless or Oyster when boarding.",
        vi: "Xe buýt London không nhận tiền mặt: chạm thẻ không tiếp xúc hoặc Oyster khi lên xe.",
      },
      next: "toTube",
    },
    {
      id: "toTube",
      type: "travel",
      spawn: "tube",
      text: { en: "🚇 Down to the Underground…", vi: "🚇 Xuống tàu điện ngầm…" },
      next: "tubeGate",
    },
    {
      id: "tubeGate",
      type: "sandbox",
      objective: { en: "Walk to the Tube gates.", vi: "Đi tới cổng soát vé Tube." },
      target: "tubeGate",
      next: "touchIn",
    },
    {
      id: "touchIn",
      type: "choice",
      icon: "💳",
      prompt: {
        en: "You reach the barriers with your wallet full of cards. A yellow circular reader glows at the gate.",
        vi: "Bạn tới cổng với chiếc ví đầy thẻ. Một đầu đọc tròn màu vàng sáng lên ở cổng.",
      },
      options: [
        {
          text: { en: "Tap **one** card or your **phone**, and use the **same one** to touch out later", vi: "Chạm **một** thẻ hoặc **điện thoại**, và dùng **cùng một thứ** khi chạm ra sau này" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes. Touch in, touch out, with the same card or device. Tapping the whole wallet can cause a “card clash”.",
            vi: "Đúng. Chạm vào, chạm ra, bằng cùng một thẻ hoặc thiết bị. Chạm cả ví có thể gây “xung đột thẻ”.",
          },
        },
        {
          text: { en: "Press the whole **wallet** on the reader", vi: "Áp cả **chiếc ví** lên đầu đọc" },
          points: 2,
          feedback: {
            en: "Several cards in the field confuse the reader (“card clash”) and you may be charged on a card you didn't plan to use.",
            vi: "Nhiều thẻ cùng lúc làm đầu đọc rối (“card clash”) và bạn có thể bị trừ tiền ở thẻ không định dùng.",
          },
        },
      ],
      next: "escalator",
    },
    {
      id: "escalator",
      type: "sandbox",
      objective: { en: "Take the escalator down to the platform.", vi: "Đi thang cuốn xuống sân ga." },
      target: "escalator",
      next: "escChoice",
    },
    {
      id: "escChoice",
      type: "choice",
      icon: "↘️",
      prompt: {
        en: "The escalator is packed. Two people in front stand side by side on the left and right, chatting. A woman behind you is in a hurry.",
        vi: "Thang cuốn đầy người. Hai người phía trước đứng cạnh nhau bên trái và bên phải, trò chuyện. Một phụ nữ phía sau đang vội.",
      },
      options: [
        {
          text: { en: "**Stand on the right**; leave the **left** free for people walking", vi: "**Đứng bên phải**, để **bên trái** cho người đi bộ" },
          points: 10,
          correct: true,
          feedback: {
            en: "That's the rule on the Tube: stand on the right, walk on the left. Blocking the left lane draws the loudest silence in London.",
            vi: "Đó là quy tắc ở Tube: đứng bên phải, đi bên trái. Chắn làn trái sẽ tạo ra sự im lặng ồn ào nhất London.",
          },
        },
        {
          text: { en: "Stand on the left too: chat with your friend", vi: "Đứng cả bên trái: nói chuyện với bạn" },
          points: 0,
          feedback: {
            en: "People behind you start to tut, sigh and say “excuse me” with a very specific meaning.",
            vi: "Người phía sau bắt đầu tặc lưỡi, thở dài và nói “excuse me” với một ý nghĩa rất cụ thể.",
          },
        },
      ],
      tip: {
        en: "On Tube escalators: stand on the right, walk on the left.",
        vi: "Trên thang cuốn Tube: đứng bên phải, đi bên trái.",
      },
      next: "touchOut",
    },
    {
      id: "touchOut",
      type: "choice",
      icon: "🚪",
      prompt: {
        en: "Twenty minutes later you reach your stop, and the exit gates swing open as people stream through.",
        vi: "Hai mươi phút sau bạn tới ga đích, cổng ra mở khi dòng người đổ qua.",
      },
      options: [
        {
          text: { en: "**Touch out** on the yellow reader, then walk through", vi: "**Chạm ra** ở đầu đọc vàng rồi đi qua" },
          points: 10,
          correct: true,
          feedback: {
            en: "Correct. Always touch out on the Tube: that's how TfL knows where you got off and charges the right fare.",
            vi: "Đúng. Luôn chạm ra ở Tube: đó là cách TfL biết bạn xuống ở đâu và tính đúng giá vé.",
          },
        },
        {
          text: { en: "Follow the person ahead through the open gate: “free exit!”", vi: "Đi theo người phía trước qua cổng đang mở: “ra miễn phí!”" },
          points: 0,
          feedback: {
            en: "If you don't touch out the journey is incomplete and you're charged a **maximum fare**. Touching in only is expensive.",
            vi: "Nếu không chạm ra, hành trình bị coi là chưa hoàn tất và bạn bị tính **giá tối đa**. Chỉ chạm vào thì rất đắt.",
          },
        },
      ],
      tip: {
        en: "Touch in AND touch out on the Tube with the same card. Forgetting means a maximum fare.",
        vi: "Chạm vào VÀ chạm ra ở Tube bằng cùng một thẻ. Quên chạm ra sẽ bị tính giá tối đa.",
      },
      next: "toPub",
    },
    {
      id: "toPub",
      type: "travel",
      spawn: "pub",
      text: { en: "🍺 Evening. The pub.", vi: "🍺 Buổi tối. Quán pub." },
      next: "toBar",
    },
    {
      id: "toBar",
      type: "sandbox",
      objective: { en: "Find out how to order a drink.", vi: "Tìm cách gọi đồ uống." },
      target: "bar",
      next: "order",
    },
    {
      id: "order",
      type: "choice",
      icon: "🍺",
      prompt: {
        en: "Your colleagues are at a table. You sit down, and wait. And wait. Nobody comes to take your order.",
        vi: "Đồng nghiệp ngồi ở một bàn. Bạn ngồi xuống và chờ. Chờ mãi. Không ai đến lấy order.",
      },
      options: [
        {
          text: { en: "**Go to the bar**, order and **pay there**", vi: "**Ra quầy bar**, gọi và **trả tiền ngay đó**" },
          points: 10,
          correct: true,
          feedback: {
            en: "That's how it works. Most pubs have no table service: you order and pay at the bar, then carry your drinks back. No tip expected.",
            vi: "Đó là cách vận hành. Hầu hết pub không phục vụ tại bàn: bạn gọi và trả tiền ở quầy rồi tự bưng về. Không cần boa.",
          },
        },
        {
          text: { en: "Wave a hand and shout “**Oi! Over here!**”", vi: "Vẫy tay và hét “**Oi! Bên này!**”" },
          points: 0,
          feedback: {
            en: "Please don't. Shouting or snapping fingers is considered very rude. Walk to the bar and make eye contact.",
            vi: "Xin đừng. Hét hoặc búng tay bị coi là rất thô lỗ. Hãy đi ra quầy và giao tiếp bằng mắt.",
          },
        },
        {
          text: { en: "Wait patiently; somebody will definitely come", vi: "Kiên nhẫn chờ, chắc chắn sẽ có người đến" },
          points: 1,
          feedback: {
            en: "Nobody will. Thirst will win in the end; best to go and order.",
            vi: "Sẽ không ai đến đâu. Cuối cùng cơn khát sẽ thắng; tốt nhất hãy ra gọi.",
          },
        },
      ],
      tip: {
        en: "In most pubs you order and pay at the bar: no table service, no tip expected.",
        vi: "Ở hầu hết pub bạn gọi và trả tiền tại quầy: không phục vụ tại bàn, không cần boa.",
      },
      next: "round",
    },
    {
      id: "round",
      type: "choice",
      icon: "🍻",
      prompt: {
        en: "A colleague says: “Whose **round** is it?” There are four of you. They've already bought one each.",
        vi: "Một đồng nghiệp hỏi: “Đến lượt ai **mua một vòng** nào?” Nhóm bốn người. Mọi người đã mua một vòng rồi.",
      },
      options: [
        {
          text: { en: "“**My round!**”: buy drinks for everyone in your group", vi: "“**Đến lượt tôi!**”: mua đồ uống cho cả nhóm" },
          points: 10,
          correct: true,
          feedback: {
            en: "That's the pub rule: everyone takes a turn buying a round. It keeps things fair, and you're now a friend.",
            vi: "Đó là luật của pub: ai cũng lần lượt mua một vòng cho cả nhóm. Công bằng và bạn đã thành bạn bè.",
          },
        },
        {
          text: { en: "Buy only your own drink and sit back down", vi: "Chỉ mua đồ của mình rồi ngồi xuống" },
          points: 2,
          feedback: {
            en: "In a group the “round” system is expected. Skipping it earns the sort of look that lasts all evening.",
            vi: "Trong nhóm, hệ thống “mua vòng” là điều được mong đợi. Bỏ qua sẽ nhận ánh nhìn kéo dài cả buổi tối.",
          },
        },
      ],
      next: "id25",
    },
    {
      id: "id25",
      type: "choice",
      speaker: { en: "Barmaid", vi: "Cô phục vụ quầy" },
      icon: "🪪",
      prompt: {
        en: "“Can I see some ID please?” You are 30. You look 22 after the Tube. All the ID you have with you is a flat-pack furniture loyalty card.",
        vi: "“Cho tôi xem giấy tờ tuỳ thân nhé?” Bạn 30 tuổi. Sau chuyến Tube trông như 22. Giấy tờ duy nhất bạn mang theo là thẻ khách hàng của cửa hàng nội thất.",
      },
      options: [
        {
          text: { en: "Show your **passport** or a **photo driving licence**", vi: "Đưa **hộ chiếu** hoặc **bằng lái có ảnh**" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes! Many places run “Challenge 25”: if you look under 25 they ask for photo ID (passport, UK photocard licence or a PASS card). Take it as a compliment.",
            vi: "Đúng! Nhiều nơi áp dụng “Challenge 25”: nếu trông dưới 25 tuổi họ sẽ hỏi giấy có ảnh (hộ chiếu, bằng lái Anh hoặc thẻ PASS). Hãy coi đó là lời khen.",
          },
        },
        {
          text: { en: "Get offended: “Do I LOOK underage?”", vi: "Phật ý: “Trông tôi CÒN VỊ THÀNH NIÊN à?”" },
          points: 0,
          feedback: {
            en: "She's following the law. Showing ID quickly and with a smile is the fastest way to get your drink.",
            vi: "Cô ấy làm theo luật. Đưa giấy nhanh và mỉm cười là cách nhanh nhất để có đồ uống.",
          },
        },
        {
          text: { en: "Say “I forgot it, but I'm definitely 30”", vi: "Nói “Tôi quên mang, nhưng chắc chắn 30 tuổi rồi”" },
          points: 0,
          feedback: {
            en: "No ID, no drink: staff can face heavy penalties for serving the wrong person. Next time, carry your passport or a PASS card.",
            vi: "Không giấy tờ thì không có đồ uống: nhân viên có thể bị phạt nặng nếu bán nhầm người. Lần sau hãy mang hộ chiếu hoặc thẻ PASS.",
          },
        },
      ],
      tip: {
        en: "Carry photo ID (passport, UK photocard licence or a PASS card): you may be asked for it if you look under 25 (“Challenge 25”).",
        vi: "Mang theo giấy tờ có ảnh (hộ chiếu, bằng lái Anh hoặc thẻ PASS): bạn có thể bị hỏi nếu trông dưới 25 tuổi (“Challenge 25”).",
      },
      next: "phrases",
    },
    {
      id: "phrases",
      type: "minigame",
      game: "swipe",
      objective: { en: "Decode what the British really mean.", vi: "Giải mã điều người Anh thực sự muốn nói." },
      params: {
        title: { en: "What the British really mean", vi: "Người Anh thực sự muốn nói gì" },
        hint: { en: "Is it a **genuine compliment** or a **polite way of saying no / criticising**? (A light-hearted generalisation!)", vi: "Đây là **lời khen thật** hay **cách nói lịch sự để từ chối / chê**? (Một sự khái quát vui vẻ!)" },
        left: { label: { en: "Polite “no”", vi: "“Không” lịch sự" }, icon: "🙊", color: "#8d5fd3" },
        right: { label: { en: "Genuinely positive", vi: "Thật sự tích cực" }, icon: "😊", color: "#2f9e44" },
        secondsPerCard: 7,
        items: [
          { id: "notbad", icon: "😌", text: { en: "“**Not bad.**”", vi: "“**Không tệ.**”" }, answer: "right", why: { en: "From a Brit, “not bad” is real praise: it often means quite good.", vi: "Từ người Anh, “not bad” là lời khen thật: thường nghĩa là khá tốt." } },
          { id: "bear", icon: "🤔", text: { en: "“I'll **bear it in mind**.”", vi: "“Tôi sẽ **ghi nhớ**.”" }, answer: "left", why: { en: "Often means: I won't be doing that.", vi: "Thường nghĩa là: tôi sẽ không làm đâu." } },
          { id: "respect", icon: "🧐", text: { en: "“**With the greatest respect**…”", vi: "“**Với tất cả sự tôn trọng**…”" }, answer: "left", why: { en: "What follows is usually a polite way of saying “I think you're wrong”.", vi: "Phía sau thường là cách nói lịch sự cho “tôi nghĩ bạn sai rồi”." } },
          { id: "brave", icon: "😬", text: { en: "“That's a **brave** idea.”", vi: "“Ý tưởng đó **dũng cảm** thật.”" }, answer: "left", why: { en: "“Brave” is often code for “risky” or “probably a mistake”.", vi: "“Brave” thường là mật mã cho “mạo hiểm” hoặc “có lẽ là sai lầm”." } },
          { id: "interesting", icon: "🫤", text: { en: "“**Interesting**…”", vi: "“**Thú vị**…”" }, answer: "left", why: { en: "With a certain tone, it can mean “I don't like it / I disagree”.", vi: "Với một giọng nhất định, có thể nghĩa là “tôi không thích / tôi không đồng ý”." } },
          { id: "lovely", icon: "🥰", text: { en: "“Oh, **lovely**!”", vi: "“Ôi, **tuyệt vời**!”" }, answer: "right", why: { en: "Usually genuine. Brits really do say lovely a lot.", vi: "Thường là thật lòng. Người Anh thật sự hay nói lovely." } },
          { id: "dinner", icon: "🍽️", text: { en: "“You must **come over for dinner** sometime!”", vi: "“Lúc nào đó bạn phải **sang ăn tối** nhé!”" }, answer: "left", why: { en: "Often politeness, not an actual invitation. A real one comes with a date.", vi: "Thường là phép lịch sự, không phải lời mời thật. Lời mời thật sẽ kèm ngày giờ." } },
          { id: "shabby", icon: "😎", text: { en: "“Not **too shabby**.”", vi: "“Không đến nỗi **tệ**.”" }, answer: "right", why: { en: "Modest British for “that's pretty good”.", vi: "Cách nói khiêm tốn kiểu Anh cho “khá tốt đấy”." } },
          { id: "different", icon: "🙃", text: { en: "“That's... **different**.”", vi: "“Cái đó... **khác lạ** nhỉ.”" }, answer: "left", why: { en: "Rarely a compliment. Roughly: “not what I'd have chosen”.", vi: "Hiếm khi là lời khen. Đại ý: “không phải thứ tôi sẽ chọn”." } },
          { id: "cheers", icon: "🍻", text: { en: "“**Cheers!**” (to a bus driver)", vi: "“**Cheers!**” (nói với tài xế xe buýt)" }, answer: "right", why: { en: "“Cheers” also means “thanks”: sincere and friendly.", vi: "“Cheers” còn nghĩa là “cảm ơn”: chân thành và thân thiện." } },
        ],
      },
      tip: {
        en: "British politeness is often indirect: “interesting”, “brave” and “I'll bear it in mind” can be soft ways of saying no. Listen to the tone.",
        vi: "Sự lịch sự của người Anh thường gián tiếp: “interesting”, “brave”, “I'll bear it in mind” có thể là cách từ chối nhẹ nhàng. Hãy nghe giọng điệu.",
      },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      icon: "🇬🇧",
      text: {
        en: "You survived a day in London with all your dignity and most of your umbrella. **In an emergency call 999.** A stranger apologises to you for walking into you. “Sorry,” you say, automatically. You've become British.",
        vi: "Bạn sống sót qua một ngày ở London với đầy đủ phẩm giá và gần nguyên cây ô. **Khẩn cấp hãy gọi 999.** Một người lạ xin lỗi vì đã va vào bạn. “Sorry,” bạn đáp, theo phản xạ. Bạn đã thành người Anh.",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
