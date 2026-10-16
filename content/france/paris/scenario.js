// France · Paris: bonjour, the café, la bise and the tourist traps of Montmartre.
// Facts checked Oct 2026 (Connexion France / The Local France / French dining guides):
// • Greet shopkeepers with "Bonjour" (or "Bonsoir") when you enter and "Merci, au revoir" when you leave: it is expected.
// • Restaurants and cafés must give tap water free if you ask for "une carafe d'eau" (asking just for "de l'eau" may get bottled water).
// • "Service compris": the service charge is already in the price, so tipping is optional (rounding up / small change is a kindness).
// • La bise (cheek kisses): number and side depend on region and relationship; follow the other person's lead.
// • Montmartre / Sacré-Cœur scams: friendship-bracelet sellers who tie a bracelet on you, "petition" clipboards used as distractions
//   for pickpockets, shell games with accomplices. Politely say "non, merci" and keep walking. Emergency number: 112 (EU), or 15 / 17 / 18.

const baker = { en: "Madame Dupont (baker)", vi: "Bà Dupont (thợ làm bánh)" };
const camille = { en: "Camille", vi: "Camille" };

export default {
  id: "france-paris",
  steps: [
    {
      id: "intro",
      type: "info",
      icon: "🥐",
      text: {
        en: "**Paris, 8 a.m.** You've been awake for twenty minutes and have already been told “**bonjour**” by a pigeon. The métro may be on strike. If so: congratulations, a free two-hour walking tour! First stop: the corner bakery.",
        vi: "**Paris, 8 giờ sáng.** Bạn mới thức dậy hai mươi phút và đã được một con bồ câu nói “**bonjour**”. Tàu điện ngầm có thể đang đình công. Nếu vậy: chúc mừng, tour đi bộ hai tiếng miễn phí! Điểm dừng đầu tiên: tiệm bánh góc phố.",
      },
      next: "toBakery",
    },
    {
      id: "toBakery",
      type: "sandbox",
      objective: { en: "Walk to the boulangerie on the corner.", vi: "Đi tới tiệm bánh mì ở góc phố." },
      target: "bakery",
      next: "bonjour",
    },
    {
      id: "bonjour",
      type: "choice",
      speaker: baker,
      icon: "🥖",
      prompt: {
        en: "The shop smells of butter and judgement. Madame Dupont is arranging croissants, and the queue is silent. It's your turn.",
        vi: "Tiệm thơm mùi bơ và sự phán xét. Bà Dupont đang xếp bánh sừng bò và hàng người im lặng. Đến lượt bạn.",
      },
      options: [
        {
          text: { en: "“**Bonjour, madame!**” then order: “Une baguette tradition, s'il vous plaît.”", vi: "“**Bonjour, madame!**” rồi gọi: “Une baguette tradition, s'il vous plaît.”" },
          points: 10,
          correct: true,
          feedback: {
            en: "Perfect. In France you greet first (“bonjour”), then ask, then say “merci, au revoir” when leaving. The greeting is not optional.",
            vi: "Hoàn hảo. Ở Pháp bạn chào trước (“bonjour”), rồi mới hỏi, và nói “merci, au revoir” khi ra về. Lời chào không phải tuỳ chọn.",
          },
        },
        {
          text: { en: "Point at a croissant: “One of those.”", vi: "Chỉ vào chiếc bánh sừng bò: “Cho tôi cái kia.”" },
          points: 0,
          feedback: {
            en: "No greeting? To a French shopkeeper that's a bit like walking in uninvited. A cold “bonjour” from her is a punishment.",
            vi: "Không chào? Với chủ tiệm Pháp, như thể bạn vào nhà không mời. Một tiếng “bonjour” lạnh tanh từ bà là hình phạt.",
          },
        },
        {
          text: { en: "“**Bonjour, madame. Parlez-vous anglais ?**”", vi: "“**Bonjour, madame. Parlez-vous anglais ?**”" },
          points: 7,
          feedback: {
            en: "Very good: starting with “bonjour” and asking politely if she speaks English is much better than launching straight into English.",
            vi: "Rất tốt: bắt đầu bằng “bonjour” và hỏi lịch sự bà có nói tiếng Anh không tốt hơn nhiều so với nói thẳng tiếng Anh.",
          },
        },
      ],
      tip: {
        en: "Say “Bonjour” when you enter any shop or café, and “Merci, au revoir” when you leave.",
        vi: "Hãy nói “Bonjour” khi bước vào bất kỳ cửa hàng hay quán cà phê nào, và “Merci, au revoir” khi ra về.",
      },
      next: "toCafe",
    },
    {
      id: "toCafe",
      type: "sandbox",
      objective: { en: "Find a seat on the café terrace.", vi: "Tìm chỗ ngồi ở hiên quán cà phê." },
      target: "cafe",
      wrong: {
        friend: { feedback: { en: "Camille is far away; coffee first!", vi: "Camille ở xa lắm; cà phê trước đã!" } },
      },
      next: "water",
    },
    {
      id: "water",
      type: "choice",
      icon: "💧",
      prompt: {
        en: "A waiter with a perfect moustache arrives. You're thirsty. You'd like **water** with your coffee.",
        vi: "Một người phục vụ có bộ ria hoàn hảo đến. Bạn khát nước. Bạn muốn **nước** kèm cà phê.",
      },
      options: [
        {
          text: { en: "“**Une carafe d'eau, s'il vous plaît.**”", vi: "“**Une carafe d'eau, s'il vous plaît.**”" },
          points: 10,
          correct: true,
          feedback: {
            en: "Excellent. A carafe of tap water is **free** on request in restaurants and cafés. Say “une carafe d'eau”, not just “de l'eau”.",
            vi: "Xuất sắc. Một bình nước máy **miễn phí** khi bạn yêu cầu ở nhà hàng và quán cà phê. Hãy nói “une carafe d'eau”, đừng chỉ nói “de l'eau”.",
          },
        },
        {
          text: { en: "“Water, please.”", vi: "“Water, please.”" },
          points: 2,
          feedback: {
            en: "You may get a small bottle of mineral water that ends up on the bill. Specify “une carafe d'eau” to get the free tap water.",
            vi: "Bạn có thể nhận một chai nước khoáng nhỏ rồi bị tính tiền. Hãy nói rõ “une carafe d'eau” để có nước máy miễn phí.",
          },
        },
        {
          text: { en: "Order a bottle of sparkling water", vi: "Gọi một chai nước có ga" },
          points: 6,
          feedback: {
            en: "Perfectly fine if you fancy it. Just know the free option exists next time.",
            vi: "Hoàn toàn ổn nếu bạn thích. Chỉ cần biết lần sau có lựa chọn miễn phí.",
          },
        },
      ],
      tip: {
        en: "Ask for “une carafe d'eau” to get free tap water in restaurants and cafés.",
        vi: "Hãy xin “une carafe d'eau” để có nước máy miễn phí ở nhà hàng và quán cà phê.",
      },
      next: "tipChoice",
    },
    {
      id: "tipChoice",
      type: "choice",
      icon: "🧾",
      prompt: {
        en: "The bill arrives: €9.80. The menu says **“service compris”**. You're used to leaving 20% like in the US.",
        vi: "Hoá đơn đến: 9,80 €. Thực đơn ghi **“service compris”**. Bạn quen để lại 20% như ở Mỹ.",
      },
      options: [
        {
          text: { en: "Service is **already included**: leave nothing, or **round up** with a few coins", vi: "Phí phục vụ **đã được tính**: không cần để lại gì, hoặc **làm tròn** vài đồng xu" },
          points: 10,
          correct: true,
          feedback: {
            en: "Right. “Service compris” means a service charge is built into the price. Tipping is a small bonus, not an obligation.",
            vi: "Đúng. “Service compris” nghĩa là phí phục vụ đã nằm trong giá. Tiền boa chỉ là phần thưởng nhỏ, không bắt buộc.",
          },
        },
        {
          text: { en: "Add 20% to the card payment", vi: "Cộng thêm 20% vào thanh toán thẻ" },
          points: 6,
          feedback: {
            en: "Generous but unnecessary. It won't offend anyone, but it isn't expected.",
            vi: "Hào phóng nhưng không cần thiết. Không ai phật ý, nhưng cũng không ai mong đợi.",
          },
        },
        {
          text: { en: "Refuse to pay until he smiles", vi: "Từ chối trả tiền cho đến khi anh ta cười" },
          points: 0,
          feedback: {
            en: "You'll wait a long time. French waiters are professional, not performative. No smile does not mean bad service.",
            vi: "Bạn sẽ chờ rất lâu. Phục vụ Pháp chuyên nghiệp chứ không diễn. Không cười không có nghĩa là phục vụ tệ.",
          },
        },
      ],
      tip: {
        en: "“Service compris” means service is included: tipping is optional (small change or rounding up is nice).",
        vi: "“Service compris” nghĩa là đã gồm phí phục vụ: boa là tuỳ ý (tiền lẻ hoặc làm tròn là đủ đẹp).",
      },
      next: "toFriend",
    },
    {
      id: "toFriend",
      type: "sandbox",
      objective: { en: "Camille is waving from the corner. Go and say hello.", vi: "Camille đang vẫy tay ở góc phố. Đến chào bạn ấy." },
      target: "friend",
      next: "bise",
    },
    {
      id: "bise",
      type: "choice",
      speaker: camille,
      icon: "😘",
      prompt: {
        en: "Camille brings along a friend you've never met. They both lean in towards your face with a wide smile.",
        vi: "Camille dẫn theo một người bạn bạn chưa từng gặp. Cả hai cùng nghiêng mặt về phía bạn với nụ cười rạng rỡ.",
      },
      options: [
        {
          text: { en: "Greet with **la bise** (air-kisses on the cheeks), following their lead", vi: "Chào bằng **la bise** (hôn gió lên má), theo nhịp của họ" },
          points: 10,
          correct: true,
          feedback: {
            en: "Good. Friends and friends of friends often do la bise: usually 2 kisses in Paris, but it varies by region (and sometimes 3 or 4). Follow their lead.",
            vi: "Tốt. Bạn bè và bạn của bạn thường chào bằng la bise: thường 2 cái ở Paris, nhưng tuỳ vùng (đôi khi 3 hoặc 4). Hãy làm theo họ.",
          },
        },
        {
          text: { en: "Step back and offer a **handshake**", vi: "Lùi lại và đưa tay ra **bắt**" },
          points: 6,
          feedback: {
            en: "Perfectly polite, especially at first meetings or at work. Among friends it may feel a little formal.",
            vi: "Hoàn toàn lịch sự, nhất là lần gặp đầu hoặc ở chỗ làm. Giữa bạn bè có thể hơi trang trọng.",
          },
        },
        {
          text: { en: "Give them both a bear hug", vi: "Ôm chặt cả hai" },
          points: 2,
          feedback: {
            en: "A big hug from someone they've just met may startle them. Light cheek kisses or a handshake are the norm.",
            vi: "Một cái ôm lớn từ người vừa gặp có thể làm họ giật mình. Hôn nhẹ lên má hoặc bắt tay mới là thông lệ.",
          },
        },
      ],
      tip: {
        en: "La bise (cheek air-kisses) is common between friends: the number depends on the region, so follow the other person's lead. A handshake is fine at first meetings.",
        vi: "La bise (hôn gió lên má) phổ biến giữa bạn bè: số lần tuỳ vùng nên hãy theo người kia. Bắt tay cũng ổn trong lần gặp đầu.",
      },
      next: "toSteps",
    },
    {
      id: "toSteps",
      type: "travel",
      spawn: "steps",
      text: { en: "⛪ Up to Sacré-Cœur… a long staircase ahead and a fine group of “friends”.", vi: "⛪ Lên Sacré-Cœur… một cầu thang dài phía trước và một nhóm “bạn bè” rất nhiệt tình." },
      next: "steps",
    },
    {
      id: "steps",
      type: "minigame",
      game: "lane",
      objective: { en: "Climb the steps and dodge every “friendly” hustler!", vi: "Leo bậc thang và né mọi “người bạn thân thiện”!" },
      params: {
        title: { en: "The Sacré-Cœur steps", vi: "Bậc thang Sacré-Cœur" },
        hint: { en: "← → (or tap a lane) · Space = “Non, merci!”", vi: "← → (hoặc chạm vào làn) · Space = “Non, merci!”" },
        player: "🚶",
        bg: "#e9e3d4",
        laneColors: ["#efe9da", "#e6dfcd", "#efe9da", "#e6dfcd"],
        lanes: [{ kind: "ok" }, { kind: "ok" }, { kind: "ok" }, { kind: "ok" }],
        duration: 34,
        hearts: 3,
        spawnEvery: [0.55, 1.05],
        actionIcon: "🙅",
        actionLabel: { en: "Non, merci!", vi: "Non, merci!" },
        action: { id: "non", clears: ["bracelet", "petition"], cooldown: 2.2, range: 0.6 },
        obstacles: [
          { id: "bracelet", icon: "🧶", speed: 0.4, weight: 3, why: { en: "A “friendship bracelet” got tied on your wrist. Now he wants money! Say “non, merci” early and keep your hands to yourself.", vi: "Một “vòng tay tình bạn” bị buộc vào cổ tay bạn. Giờ anh ta đòi tiền! Hãy nói “non, merci” sớm và giữ tay cho mình." } },
          { id: "petition", icon: "📋", speed: 0.38, weight: 3, why: { en: "A petition clipboard: a classic distraction while a partner checks your pockets. “Non, merci” and keep walking.", vi: "Bảng kiến nghị: mánh đánh lạc hướng kinh điển trong khi đồng bọn móc túi. Nói “non, merci” rồi đi tiếp." } },
          { id: "shells", icon: "🥤", speed: 0.34, weight: 2, why: { en: "The shell game is rigged: the crowd around it are all in on it. Never play.", vi: "Trò đoán cốc là lừa: đám đông xung quanh đều là đồng bọn. Đừng bao giờ chơi." } },
          { id: "pigeon", icon: "🐦", speed: 0.5, weight: 2, why: { en: "A pigeon with a direct hit. Paris is generous.", vi: "Một con bồ câu bắn trúng phóc. Paris hào phóng thật." } },
          { id: "scooter", icon: "🛴", speed: 0.6, weight: 1, why: { en: "A scooter whizzes by. Look before you step sideways!", vi: "Một chiếc xe scooter vút qua. Nhìn trước khi bước ngang!" } },
        ],
        pickups: [
          { id: "croissant", icon: "🥐", points: 1 },
          { id: "macaron", icon: "🍪", points: 1 },
        ],
        failText: { en: "Overwhelmed by bracelets and pigeons… Try again!", vi: "Bị vòng tay và bồ câu nhấn chìm… Thử lại nhé!" },
        doneText: { en: "You made it up the steps!", vi: "Bạn đã lên tới đỉnh bậc thang!" },
        seed: 11,
      },
      tip: {
        en: "At tourist spots: bracelet sellers, petition clipboards and street games are classic scams or pickpocket distractions. Say “non, merci” firmly and keep walking.",
        vi: "Ở điểm du lịch: người bán vòng tay, bảng kiến nghị và trò chơi đường phố là các mánh lừa hoặc đánh lạc hướng móc túi. Nói “non, merci” dứt khoát và đi tiếp.",
      },
      next: "toView",
    },
    {
      id: "toView",
      type: "sandbox",
      objective: { en: "Climb to the terrace and enjoy the view.", vi: "Leo lên sân thượng và ngắm cảnh." },
      target: "view",
      next: "outro",
    },
    {
      id: "outro",
      type: "info",
      icon: "🇫🇷",
      text: {
        en: "The whole city glitters below you, a pigeon eyes your croissant and you realise you have learned the three laws of Paris: **greet first, ask for the carafe, say “non, merci”**. **Emergency: 112** (or 15 / 17 / 18). Vive la France!",
        vi: "Cả thành phố lấp lánh phía dưới, một con bồ câu liếc chiếc bánh sừng bò của bạn và bạn nhận ra mình đã học ba luật của Paris: **chào trước, xin bình nước, nói “non, merci”**. **Khẩn cấp: 112** (hoặc 15 / 17 / 18). Vive la France!",
      },
      next: "end",
    },
    { id: "end", type: "end" },
  ],
};
