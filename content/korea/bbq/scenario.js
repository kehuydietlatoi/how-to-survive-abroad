// South Korea · hoesik (company dinner) at a BBQ restaurant.
// Facts checked Oct 2026 (Wikipedia "Drinking culture of Korea", Korea Herald / Daum hoesik etiquette, Korea tourism guidance):
// • Juniors pour for seniors, starting with the eldest / highest-ranking; pour with both hands (or right hand
//   supported at the wrist / forearm). Receive a glass with two hands and a slight bow.
// • When drinking in front of an elder, turn your head away and shield the glass / mouth.
// • You normally don't pour your own drink; you fill others' glasses and they fill yours.
// • The eldest or most senior person starts eating first (lifts their spoon).
// • Banchan (side dishes) refills are normally free. Tipping is not expected in Korea.
// • Declining alcohol is increasingly accepted, but is best done politely (hand over the glass, say you can't drink).
//   Drinking culture and "second rounds" (cha) are slowly changing, especially among younger staff.

const boss = { en: "Team Lead Kim", vi: "Trưởng nhóm Kim" };

export default {
  id: "korea-bbq",
  steps: [
    {
      id: "intro",
      type: "info",
      speaker: boss,
      icon: "🧑‍💼",
      text: {
        en: "“Welcome to the team! Tonight is **hoesik**, our team dinner. Just one drink!” In Korea, “one drink” is a unit with no upper bound. Your liver files a quiet complaint.",
        vi: "“Chào mừng bạn vào nhóm! Tối nay là **hoesik**, bữa ăn chung của team. Chỉ một ly thôi!” Ở Hàn, “một ly” là đơn vị không có giới hạn trên. Lá gan của bạn lặng lẽ nộp đơn khiếu nại.",
      },
      next: "toShoes",
    },
    {
      id: "toShoes",
      type: "sandbox",
      objective: { en: "Check the shoe shelf by the entrance.", vi: "Xem kệ giày ở lối vào." },
      target: "shoes",
      done: {
        en: "Some Korean restaurants have heated-floor seating (ondol): shoes come off at the door. Here you keep your shoes on, but now you know where the shelf is.",
        vi: "Một số quán Hàn có chỗ ngồi sàn sưởi (ondol): giày phải cởi ở cửa. Quán này bạn vẫn đi giày, nhưng giờ bạn biết kệ giày ở đâu.",
      },
      next: "toTable",
    },
    {
      id: "toTable",
      type: "sandbox",
      objective: { en: "Join your team's table in the middle.", vi: "Ngồi vào bàn của nhóm ở giữa." },
      target: "table",
      wrong: {
        waiter: { feedback: { en: "The server nods but you still need to find your team first.", vi: "Nhân viên gật đầu nhưng bạn còn phải tìm nhóm mình trước đã." } },
      },
      next: "seat",
    },
    {
      id: "seat",
      type: "choice",
      icon: "🪑",
      prompt: {
        en: "The table has seats at the head (far from the door, next to Team Lead Kim) and seats near the **door and the grill**. Where do you sit?",
        vi: "Bàn có chỗ ở đầu bàn (xa cửa, cạnh trưởng nhóm Kim) và chỗ gần **cửa và vỉ nướng**. Bạn ngồi đâu?",
      },
      options: [
        {
          text: { en: "A seat near the **door / grill**, until the seniors sit down", vi: "Chỗ gần **cửa / vỉ nướng**, đợi cấp trên ngồi xong" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right: the seat farthest from the door is for the most senior person. The junior sits nearest the door and usually looks after the grill.",
            vi: "Đúng: chỗ xa cửa nhất dành cho người cấp cao nhất. Người trẻ nhất ngồi gần cửa và thường lo vỉ nướng.",
          },
        },
        {
          text: { en: "The comfy corner seat next to the boss, it's the best view", vi: "Ghế góc êm ái cạnh sếp, view đẹp nhất" },
          points: 0,
          feedback: {
            en: "That's the seat of honour. Everybody pretends not to see. Everybody sees.",
            vi: "Đó là ghế danh dự. Ai cũng giả vờ không thấy. Ai cũng thấy hết.",
          },
        },
        {
          text: { en: "Ask where to sit and wait to be shown", vi: "Hỏi xem ngồi đâu và đợi được chỉ chỗ" },
          points: 7,
          feedback: {
            en: "Perfectly polite. Seniors will point you to a seat. Next time you'll know the 'door side' rule.",
            vi: "Rất lịch sự. Cấp trên sẽ chỉ chỗ cho bạn. Lần sau bạn đã biết quy tắc “phía gần cửa”.",
          },
        },
      ],
      tip: {
        en: "Seniors sit farthest from the door; juniors sit near the door and the grill.",
        vi: "Cấp trên ngồi xa cửa nhất; người trẻ ngồi gần cửa và vỉ nướng.",
      },
      next: "firstBite",
    },
    {
      id: "firstBite",
      type: "choice",
      icon: "🥢",
      prompt: {
        en: "A mountain of side dishes and kimchi arrives. You're starving. Team Lead Kim is chatting and hasn't picked up his spoon.",
        vi: "Một núi món ăn kèm và kim chi được dọn ra. Bạn đói meo. Trưởng nhóm Kim đang nói chuyện và chưa cầm thìa.",
      },
      options: [
        {
          text: { en: "Wait until the **eldest / most senior** person starts eating", vi: "Đợi **người lớn tuổi nhất / cấp cao nhất** bắt đầu ăn" },
          points: 10,
          correct: true,
          feedback: {
            en: "Yes. The most senior person lifts their spoon first. Then everyone digs in. (Say **“jal meokkesseumnida”**: “I will eat well”.)",
            vi: "Đúng. Người cấp cao nhất cầm thìa trước, rồi cả bàn cùng ăn. (Nói **“jal meokkesseumnida”**: “Tôi sẽ ăn thật ngon”.)",
          },
        },
        {
          text: { en: "Start eating now: food gets cold!", vi: "Ăn luôn: đồ ăn nguội mất!" },
          points: 0,
          feedback: {
            en: "Starting before the eldest is considered rude. Let them begin first.",
            vi: "Ăn trước người lớn tuổi nhất bị coi là bất lịch sự. Hãy đợi họ bắt đầu.",
          },
        },
      ],
      tip: {
        en: "Wait for the most senior person to start eating, and say “jal meokkesseumnida” before you begin.",
        vi: "Đợi người cấp cao nhất bắt đầu ăn, và nói “jal meokkesseumnida” trước khi ăn.",
      },
      next: "grill",
    },
    {
      id: "grill",
      type: "minigame",
      game: "grill",
      objective: { en: "Grill duty! Flip the pork, serve it golden and pour Kim's drink with two hands.", vi: "Nhiệm vụ nướng thịt! Lật thịt, dọn khi vàng đều và rót rượu cho Kim bằng hai tay." },
      params: {
        title: { en: "Samgyeopsal grill duty", vi: "Nhiệm vụ nướng samgyeopsal" },
        boss: { name: boss, icon: "🧑‍💼" },
        meat: "🥓",
        slots: 3,
        pieces: 8,
        cookTime: 4,
        events: [9, 19, 29],
        eventWindow: 4.5,
        askText: { en: "Team Lead Kim's glass is empty! Pour with TWO hands!", vi: "Ly của trưởng nhóm Kim cạn rồi! Rót bằng HAI tay!" },
      },
      tip: {
        en: "Juniors often handle the grill and pour for seniors: pour with two hands (or right hand with the left supporting).",
        vi: "Người trẻ thường lo nướng thịt và rót cho cấp trên: rót bằng hai tay (hoặc tay phải, tay trái đỡ).",
      },
      next: "soju",
    },
    {
      id: "soju",
      type: "choice",
      icon: "🍶",
      prompt: {
        en: "Team Lead Kim lifts the green bottle and pours **you** a glass of soju. The whole table watches.",
        vi: "Trưởng nhóm Kim nhấc chai xanh và rót cho **bạn** một ly soju. Cả bàn đang nhìn.",
      },
      options: [
        {
          text: { en: "Receive it with **two hands**, bow slightly, and **turn your head away** to drink", vi: "Nhận bằng **hai tay**, cúi đầu nhẹ, và **quay mặt đi** khi uống" },
          points: 10,
          correct: true,
          feedback: {
            en: "Textbook! Two hands to receive, and turn away from elders when you drink, shielding the glass. Respect points: +100.",
            vi: "Chuẩn sách giáo khoa! Hai tay nhận, và quay đi khi uống trước người lớn, che ly. Điểm kính trọng: +100.",
          },
        },
        {
          text: { en: "Grab it with one hand and **chug it facing him**, smiling", vi: "Chộp bằng một tay và **tu một hơi nhìn thẳng vào sếp**, cười tươi" },
          points: 0,
          feedback: {
            en: "A one-handed grab while staring at the boss comes across as casual and disrespectful. Two hands, turn away.",
            vi: "Chộp một tay và nhìn thẳng vào sếp trông như xuề xoà và thiếu tôn trọng. Hai tay, quay đi.",
          },
        },
        {
          text: { en: "Politely say you **don't drink**, and keep the glass of cider (soda) in front of you", vi: "Lịch sự nói **bạn không uống rượu** và giữ ly nước ngọt (cider) trước mặt" },
          points: 6,
          feedback: {
            en: "Acceptable: culture is slowly changing and many people decline. Be warm and polite, and still accept the glass with two hands before saying no.",
            vi: "Chấp nhận được: văn hoá đang dần thay đổi và nhiều người từ chối. Hãy ấm áp, lịch sự và vẫn nhận ly bằng hai tay trước khi từ chối.",
          },
        },
      ],
      tip: {
        en: "Receive a glass with two hands and turn your head away to drink when an elder is looking. Declining politely is increasingly accepted.",
        vi: "Nhận ly bằng hai tay và quay đầu đi khi uống trước người lớn. Từ chối lịch sự ngày càng được chấp nhận.",
      },
      next: "refill",
    },
    {
      id: "refill",
      type: "choice",
      icon: "🥃",
      prompt: {
        en: "Your glass is empty. The bottle is right in front of you, and everybody's chatting.",
        vi: "Ly của bạn trống rồi. Chai rượu ngay trước mặt và mọi người đang mải nói chuyện.",
      },
      options: [
        {
          text: { en: "**Fill a colleague's glass** first. Somebody will fill yours", vi: "**Rót cho đồng nghiệp trước.** Sẽ có người rót cho bạn" },
          points: 10,
          correct: true,
          feedback: {
            en: "That's the loop: you pour for others, others pour for you. Fill the seniors' glasses first.",
            vi: "Đó là vòng tuần hoàn: bạn rót cho người khác, người khác rót cho bạn. Rót cho cấp trên trước.",
          },
        },
        {
          text: { en: "Pour yourself a glass: it's efficient", vi: "Tự rót cho mình, hiệu quả mà" },
          points: 2,
          feedback: {
            en: "Pouring your own drink is normally avoided: it suggests you're not paying attention to the others. Fill someone else's, and yours will follow.",
            vi: "Thường người ta tránh tự rót rượu của mình: như thể bạn không để ý tới người khác. Hãy rót cho người khác, ly của bạn sẽ được rót.",
          },
        },
        {
          text: { en: "Wait silently with your empty glass", vi: "Ngồi im lặng cầm ly rỗng chờ" },
          points: 5,
          feedback: {
            en: "Someone will eventually notice, but being proactive (pouring for others) is better.",
            vi: "Rồi cũng có người để ý, nhưng chủ động rót cho người khác thì tốt hơn.",
          },
        },
      ],
      next: "second",
    },
    {
      id: "second",
      type: "choice",
      icon: "🎤",
      prompt: {
        en: "10 p.m. Team Lead Kim: “**Second round!** Noraebang (karaoke), my treat!” You have a presentation at 9 a.m. His signature ballad is already warming up in his throat.",
        vi: "10 giờ tối. Trưởng nhóm Kim: “**Tăng hai!** Đi noraebang (karaoke), tôi mời!” Sáng 9 giờ bạn có buổi thuyết trình. Bài ballad “sở trường” của sếp đã sẵn sàng trong cổ họng.",
      },
      options: [
        {
          text: { en: "Thank him warmly, say you have an early meeting, and leave **politely**", vi: "Cảm ơn ấm áp, nói sáng mai có họp sớm và rời đi **lịch sự**" },
          points: 10,
          correct: true,
          feedback: {
            en: "Honest, polite and warm: a good reason plus a real thank-you works. Many Koreans do this too, and attitudes are shifting.",
            vi: "Thật thà, lịch sự và ấm áp: một lý do chính đáng cộng lời cảm ơn thật lòng là ổn. Nhiều người Hàn cũng làm vậy, quan niệm đang thay đổi.",
          },
        },
        {
          text: { en: "Vanish silently into the toilet and out the back door", vi: "Lặng lẽ biến mất vào nhà vệ sinh rồi ra cửa sau" },
          points: 0,
          feedback: {
            en: "Disappearing without a word is far worse than a polite no. Tomorrow's “where did you go?” will be loud.",
            vi: "Biến mất không nói lời nào còn tệ hơn một lời từ chối lịch sự. Ngày mai câu “bạn đi đâu vậy?” sẽ rất to.",
          },
        },
        {
          text: { en: "Go along for **one** song, then leave early", vi: "Đi cùng **một** bài rồi về sớm" },
          points: 6,
          feedback: {
            en: "A decent compromise. Show up, sing something, thank everyone, then go home.",
            vi: "Một thoả hiệp ổn. Có mặt, hát một bài, cảm ơn mọi người rồi về.",
          },
        },
      ],
      tip: {
        en: "You can decline the second round politely: thank the host, give a real reason, and don't just disappear.",
        vi: "Bạn có thể từ chối tăng hai một cách lịch sự: cảm ơn người mời, đưa lý do thật, đừng biến mất lặng lẽ.",
      },
      next: "tip",
    },
    {
      id: "tip",
      type: "choice",
      icon: "💴",
      prompt: {
        en: "The team lead pays the bill at the counter. The server brought you extra kimchi all evening. Should you leave a tip on the table?",
        vi: "Trưởng nhóm thanh toán ở quầy. Nhân viên mang thêm kim chi cho bạn suốt buổi tối. Bạn có nên để lại tiền boa trên bàn không?",
      },
      options: [
        {
          text: { en: "**No tip**, just say “jal meogeosseumnida” (thanks for the meal)", vi: "**Không tiền boa**, chỉ nói “jal meogeosseumnida” (cảm ơn bữa ăn)" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right. Tipping isn't expected in Korea: the price already covers service, and money left on a table can even confuse the staff.",
            vi: "Đúng. Ở Hàn không có văn hoá boa: giá đã gồm phục vụ, tiền để lại trên bàn thậm chí còn làm nhân viên bối rối.",
          },
        },
        {
          text: { en: "Leave 20% like in the US", vi: "Để 20% như ở Mỹ" },
          points: 0,
          feedback: {
            en: "Not needed. The staff may run after you to give the money back. Bow and thank them instead.",
            vi: "Không cần. Nhân viên có thể chạy theo trả lại tiền. Hãy cúi đầu và cảm ơn.",
          },
        },
      ],
      tip: {
        en: "No tipping in Korea. Side dishes (banchan) can be refilled for free: ask politely with “Yeogi juseyo!”.",
        vi: "Hàn Quốc không có tiền boa. Món ăn kèm (banchan) được thêm miễn phí: hãy gọi lịch sự bằng “Yeogi juseyo!”.",
      },
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      speaker: boss,
      icon: "🧑‍💼",
      text: {
        en: "“Great work tonight! Tomorrow, **haejangguk** (hangover soup) is on me.” The team lead has already forgotten you declined the karaoke. Your liver sends a thank-you card.",
        vi: "“Tối nay làm tốt lắm! Mai **haejangguk** (canh giải rượu) tôi mời.” Trưởng nhóm đã quên mất bạn từ chối karaoke rồi. Lá gan của bạn gửi tấm thiệp cảm ơn.",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
