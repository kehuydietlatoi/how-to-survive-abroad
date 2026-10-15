import { t, getLang } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";
import { sfx } from "../core/Audio.js";

// German ticket vending machine (Fahrkartenautomat) as an HTML minigame.
// The machine itself speaks German or English (like real machines); a helper panel
// explains each screen in the player's language. Prices are example values for a
// typical regional network – the lesson is the *kind* of ticket, not the exact price.

const TICKETS = [
  {
    id: "short",
    de: "Kurzstrecke",
    en: "Short trip",
    subDe: "max. 3 Haltestellen",
    subEn: "max. 3 stops",
    price: 2.1,
    valid: false,
    points: 0,
  },
  {
    id: "p1",
    de: "Einzelfahrkarte · Preisstufe 1",
    en: "Single ticket · Zone 1",
    subDe: "nur Stadtgebiet",
    subEn: "city area only",
    price: 3.4,
    valid: false,
    points: 10,
  },
  {
    id: "p3",
    de: "Einzelfahrkarte · Preisstufe 3",
    en: "Single ticket · Zone 3",
    subDe: "inkl. Flughafen, 1 Fahrt mit Umsteigen",
    subEn: "incl. airport, one trip incl. transfers",
    price: 5.9,
    valid: true,
    points: 50,
  },
  {
    id: "day",
    de: "Tageskarte · Preisstufe 3",
    en: "Day ticket · Zone 3",
    subDe: "beliebig viele Fahrten bis 5 Uhr",
    subEn: "unlimited trips until 5 am",
    price: 11.8,
    valid: true,
    points: 35,
  },
  {
    id: "dt",
    de: "Deutschlandticket",
    en: "Deutschlandticket",
    subDe: "nur im Abo · 63 € / Monat",
    subEn: "subscription only · €63 / month",
    price: null,
  },
];

const WALLET = [
  { v: 50, kind: "note" },
  { v: 10, kind: "note" },
  { v: 5, kind: "note" },
  { v: 2, kind: "coin" },
  { v: 2, kind: "coin" },
  { v: 1, kind: "coin" },
  { v: 0.5, kind: "coin" },
];

const help = {
  start: {
    en: "This is a **Fahrkartenautomat** (ticket machine). Most machines have a **language button**. Look for a flag or “English”.",
    vi: "Đây là **máy bán vé tự động**. Hầu hết máy có **nút chọn ngôn ngữ**: tìm lá cờ hoặc chữ “English”.",
  },
  ticket: {
    en: "Your trip: **Airport → Hauptbahnhof → (bus) → Lindenstraße**. Check which zone (Preisstufe) covers the **airport**: airports are often outside the cheap city zone. One single ticket usually covers transfers in one direction.",
    vi: "Chuyến đi: **Sân bay → Ga trung tâm → (buýt) → Lindenstraße**. Hãy xem vùng giá (Preisstufe) nào bao gồm **sân bay**: sân bay thường nằm ngoài vùng giá rẻ của thành phố. Một vé lượt thường đã bao gồm chuyển tuyến theo một chiều.",
  },
  dt: {
    en: "The **Deutschlandticket** (€63/month in 2026) is a monthly **subscription** for all local transport in Germany. Buy it online or in an app (e.g. DB Navigator), not at this machine. Great once you live here!",
    vi: "**Deutschlandticket** (63 €/tháng năm 2026) là **vé tháng thuê bao** cho mọi phương tiện công cộng địa phương ở Đức. Mua online hoặc qua app (vd. DB Navigator), không bán ở máy này. Rất đáng khi bạn đã định cư!",
  },
  passenger: {
    en: "**Erwachsener** = adult, **Kind** = child (usually 6–14). Child tickets are cheaper but only valid for children.",
    vi: "**Erwachsener** = người lớn, **Kind** = trẻ em (thường 6–14 tuổi). Vé trẻ em rẻ hơn nhưng chỉ dành cho trẻ em.",
  },
  pay: {
    en: "Pay with coins, notes or card. Watch the sign: many machines **don't take large notes**.",
    vi: "Trả bằng xu, tiền giấy hoặc thẻ. Để ý thông báo: nhiều máy **không nhận tiền mệnh giá lớn**.",
  },
  done: {
    en: "Take your ticket **and your change**! Read the ticket: does it show a date and time?",
    vi: "Lấy vé **và tiền thừa**! Đọc vé: trên vé có ngày giờ không?",
  },
};

const fmt = (v) => `${v.toFixed(2).replace(".", ",")} €`;

export const TicketMachine = {
  run(ctx) {
    return new Promise((resolve) => {
      const root = document.getElementById("minigame");
      root.className = "show";
      document.body.classList.add("mg-ui");
      let mlang = "de"; // machine language
      const state = { ticket: null, adult: null, paid: 0, rejected50: false, sawDT: false, used: new Set(), card: false };
      const L = (de, en) => (mlang === "de" ? de : en);

      const render = (screen, msg = "", bad = false) => {
        const tvm = (body) => `
          <div class="tvm-wrap">
            <div class="tvm pop">
              <div class="top"><span>DB · Fahrkarten</span><span>${mlang === "de" ? "DE" : "EN"}</span></div>
              <div class="screen">${body}${msg ? `<div class="msg ${bad ? "bad" : ""}">${msg}</div>` : ""}</div>
              <div class="slot"></div>
            </div>
            <div class="helper"><div class="who">💡 ${esc(t({ en: "Helper", vi: "Gợi ý" }))}</div>${rich(t(help[screen]))}</div>
          </div>`;
        let body = "";
        if (screen === "start") {
          body = `<h4>Willkommen! · Welcome!</h4>
            <p>Bitte wählen Sie eine Sprache.</p>
            <div class="tbtns">
              <button class="tbtn2" data-lang="de"><span>Deutsch</span></button>
              <button class="tbtn2" data-lang="en"><span>English</span></button>
            </div>`;
        } else if (screen === "ticket" || screen === "dt") {
          body = `<h4>${L("Fahrkarte wählen", "Choose ticket")}</h4>
            <div class="tbtns">${TICKETS.map(
              (tk) => `<button class="tbtn2" data-ticket="${tk.id}">
                <span>${esc(L(tk.de, tk.en))}<small>${esc(L(tk.subDe, tk.subEn))}</small></span>
                <span class="price">${tk.price ? fmt(tk.price) : "Abo"}</span></button>`
            ).join("")}</div>`;
        } else if (screen === "passenger") {
          body = `<h4>${L("Wer fährt?", "Who is travelling?")}</h4>
            <p>${esc(L(state.ticket.de, state.ticket.en))}</p>
            <div class="tbtns">
              <button class="tbtn2" data-adult="1"><span>${L("1 Erwachsener", "1 Adult")}</span><span class="price">${fmt(state.ticket.price)}</span></button>
              <button class="tbtn2" data-adult="0"><span>${L("1 Kind (6–14 Jahre)", "1 Child (6–14 years)")}</span><span class="price">${fmt(childPrice())}</span></button>
            </div>`;
        } else if (screen === "pay") {
          const due = price() - state.paid;
          body = `<h4>${L("Bitte zahlen", "Please pay")}: ${fmt(Math.max(0, due))}</h4>
            <p style="font-size:14px;color:#5a6b85">${L("Akzeptiert: Münzen, Scheine bis 20 €, Karte", "Accepted: coins, notes up to €20, card")}</p>
            <div class="wallet">${WALLET.map(
              (m, i) =>
                `<button class="money ${m.kind} n${m.v}" data-money="${i}" ${state.used.has(i) ? "disabled" : ""}>${m.v >= 1 ? `${m.v} €` : `${m.v * 100} ct`}</button>`
            ).join("")}<button class="money card" data-card="1">💳 ${L("Karte", "Card")}</button></div>`;
        } else if (screen === "done") {
          const tk = state.ticket;
          const change = state.card ? 0 : state.paid - price();
          body = `<h4>${L("Vielen Dank! Gute Fahrt.", "Thank you! Have a good trip.")}</h4>
            <div class="printed-ticket">
              <b>${esc(tk.de.toUpperCase())}</b><br>
              ${state.adult ? "Erwachsener" : "Kind"} · ${fmt(price())}<br>
              Flughafen → Stadtgebiet<br>
              <b>*** Bitte entwerten! ***</b><br>
              <small>Nur gültig mit Entwerterstempel</small>
            </div>
            ${change > 0.001 ? `<p>${L("Rückgeld", "Change")}: <b>${fmt(change)}</b></p>` : ""}
            <div class="tbtns" style="margin-top:10px"><button class="tbtn2" data-take="1"><span>✋ ${esc(t({ en: "Take ticket & change", vi: "Lấy vé & tiền thừa" }))}</span></button></div>`;
        }
        root.innerHTML = tvm(body);
        bind(screen);
      };

      const price = () => (state.adult === false ? childPrice() : state.ticket.price);
      const childPrice = () => Math.round(state.ticket.price * 0.6 * 10) / 10;

      const bind = (screen) => {
        root.querySelectorAll("[data-lang]").forEach(
          (b) =>
            (b.onclick = () => {
              sfx.click();
              mlang = b.dataset.lang;
              render("ticket");
            })
        );
        root.querySelectorAll("[data-ticket]").forEach(
          (b) =>
            (b.onclick = () => {
              sfx.click();
              const tk = TICKETS.find((x) => x.id === b.dataset.ticket);
              if (tk.id === "dt") {
                state.sawDT = true;
                render("dt", esc(L("Das Deutschlandticket gibt es nur im Abo (online / App).", "The Deutschlandticket is only sold as a subscription (online / app).")), true);
                return;
              }
              state.ticket = tk;
              render("passenger");
            })
        );
        root.querySelectorAll("[data-adult]").forEach(
          (b) =>
            (b.onclick = () => {
              sfx.click();
              state.adult = b.dataset.adult === "1";
              render("pay");
            })
        );
        root.querySelectorAll("[data-money]").forEach(
          (b) =>
            (b.onclick = () => {
              const i = Number(b.dataset.money);
              const m = WALLET[i];
              if (m.v > 20) {
                sfx.bad();
                state.rejected50 = true;
                render("pay", esc(L("Banknote nicht akzeptiert. Max. 20 €.", "Banknote not accepted. Max. €20.")), true);
                return;
              }
              sfx.coin();
              state.used.add(i);
              state.paid += m.v;
              if (state.paid + 1e-6 >= price()) finishPay();
              else render("pay");
            })
        );
        root.querySelectorAll("[data-card]").forEach(
          (b) =>
            (b.onclick = () => {
              sfx.click();
              state.card = true;
              render("pay", esc(L("Bitte Karte vorhalten … Zahlung erfolgreich.", "Please hold your card … Payment successful.")));
              setTimeout(finishPay, 900);
            })
        );
        root.querySelectorAll("[data-take]").forEach((b) => (b.onclick = () => finish()));
        if (screen === "start") root.querySelector("[data-lang]")?.focus();
      };

      const finishPay = () => {
        sfx.print();
        render("done");
      };

      const finish = () => {
        sfx.good();
        document.body.classList.remove("mg-ui");
        root.className = "";
        root.innerHTML = "";
        const tk = state.ticket;
        const valid = tk.valid && state.adult;
        let score = 20 + tk.points + (state.adult ? 20 : 0) + (state.rejected50 ? 0 : 10);
        score = Math.min(100, score);
        const tips = [
          {
            tip: {
              en: "Airports are often in a higher fare zone (Preisstufe) than the city. Buy a ticket that covers the **whole trip**, incl. bus transfers.",
              vi: "Sân bay thường thuộc vùng giá (Preisstufe) cao hơn trung tâm. Mua vé bao trọn **cả hành trình**, kể cả chuyển sang xe buýt.",
            },
            good: tk.valid,
          },
        ];
        if (tk.id === "day")
          tips.push({
            tip: { en: "A day ticket works, but a single ticket is cheaper if you only make one trip.", vi: "Vé ngày dùng được, nhưng nếu chỉ đi một chuyến thì vé lượt rẻ hơn." },
            good: false,
          });
        if (!state.adult)
          tips.push({
            tip: { en: "Child tickets (Kind) are only for children. Adults with a child ticket count as fare dodgers.", vi: "Vé trẻ em (Kind) chỉ dành cho trẻ em. Người lớn dùng vé trẻ em bị coi là trốn vé." },
            good: false,
          });
        if (state.rejected50)
          tips.push({
            tip: { en: "Many ticket machines don't take €50 notes. Carry small notes/coins or pay by card.", vi: "Nhiều máy bán vé không nhận tờ 50 €. Hãy mang tiền lẻ/xu hoặc trả bằng thẻ." },
            good: false,
          });
        if (state.sawDT)
          tips.push({
            tip: {
              en: "Deutschlandticket: €63/month subscription for all local and regional transport in Germany. Worth it once you live here.",
              vi: "Deutschlandticket: vé tháng 63 € cho mọi phương tiện địa phương và vùng ở Đức. Rất đáng khi bạn sống ở đây.",
            },
            good: true,
          });
        resolve({
          score,
          passed: true,
          flags: { hasTicket: true, ticketValid: valid, ticketType: tk.id, lang: getLang() },
          tips,
        });
      };

      render("start");
    });
  },
};
