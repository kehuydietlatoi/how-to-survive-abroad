import { CheckoutRace, GROCERIES, euro } from "./shopLogic.js";
import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";
import { sfx } from "../core/Audio.js";

// The famous German checkout: the cashier scans at lightning speed and you have to
// keep up. Clear the oldest item from the tray: 🛒 cart (normal / heavy) or 🧺 top basket
// (fragile). Then pay. Pack properly afterwards at the packing shelf.

const TXT = {
  title: { en: "Checkout race!", vi: "Cuộc đua ở quầy thu ngân!" },
  hint: {
    en: "Clear the tray before it overflows. **Fragile → 🧺 top**, everything else → **🛒 cart**.",
    vi: "Dọn khay trước khi tràn. **Đồ dễ vỡ → 🧺 giỏ trên**, còn lại → **🛒 xe đẩy**.",
  },
  cart: { en: "Cart", vi: "Xe đẩy" },
  top: { en: "Top basket", vi: "Giỏ trên" },
  pileup: { en: "Pile-up! The next customer's shopping is coming…", vi: "Ùn ứ! Đồ của khách sau đang tới…" },
  crushed: { en: "Squashed! Heavy stuff will land on that. 🥚", vi: "Bẹp rồi! Đồ nặng sẽ đè lên đó. 🥚" },
  heavy: { en: "Too heavy for the top basket!", vi: "Quá nặng cho giỏ trên!" },
  good: ["Zack!", "Schnell!", "Super!", "Weiter!"],
  total: { en: "“Das macht **{sum}**.”", vi: "“Das macht **{sum}**.” (Tổng cộng {sum}.)" },
  pfandOff: { en: "Leergut-Bon −{v}", vi: "Phiếu trả vỏ −{v}" },
  card: { en: "Card (tap)", vi: "Thẻ (chạm)" },
  cash: { en: "Cash", vi: "Tiền mặt" },
  paidCard: { en: "Bitte Karte auflegen… ✔ Zahlung erfolgreich.", vi: "Bitte Karte auflegen… ✔ Thanh toán thành công." },
  paidCash: { en: "You hand over the cash and take your change. ✔", vi: "Bạn đưa tiền mặt và nhận tiền thừa. ✔" },
  next: { en: "Continue", vi: "Tiếp tục" },
  cashier: { en: "Cashier", vi: "Thu ngân" },
};

const PRICES = { water: 1.89, eggs: 2.49, potatoes: 2.99, bread: 2.29, milk: 1.15, pasta: 0.99, berries: 3.49, cheese: 2.79, detergent: 4.95, apples: 2.49, chips: 1.29, rice: 6.99, tomatoes: 1.99, coffee: 5.99, beer: 14.99, croissant: 1.79 };

export const Checkout = {
  run(ctx) {
    return new Promise((resolve) => {
      const race = new CheckoutRace(GROCERIES);
      const pfand = ctx.scene.runner.flags.pfandBon || 0;
      const root = document.getElementById("minigame");
      root.className = "show";
      document.body.classList.add("mg-ui");
      root.innerHTML = `
        <div class="co-wrap">
          <div class="co-top">
            <div class="sort-title">🛒 ${esc(t(TXT.title))}</div>
            <div class="sort-hint">${rich(t(TXT.hint))}</div>
          </div>
          <div class="co-msg"></div>
          <div class="co-counter">
            <div class="co-cashier">🧑‍💼<small>${esc(t(TXT.cashier))}</small><div class="co-scan"></div></div>
            <div class="co-belt"><div class="co-stripes"></div><div class="co-items"></div></div>
            <div class="co-tray"><div class="co-tray-items"></div><div class="co-tray-cap"></div></div>
          </div>
          <div class="co-dest">
            <div class="co-pile top"><span class="big">🧺</span><div class="co-in"></div></div>
            <div class="co-pile cart"><span class="big">🛒</span><div class="co-in"></div></div>
          </div>
          <div class="co-btns">
            <button class="co-btn top" data-w="top">🧺 ${esc(t(TXT.top))}<small>A / ←</small></button>
            <button class="co-btn cart" data-w="cart">🛒 ${esc(t(TXT.cart))}<small>D / →</small></button>
          </div>
        </div>`;
      const beltItems = root.querySelector(".co-items");
      const trayEl = root.querySelector(".co-tray-items");
      const capEl = root.querySelector(".co-tray-cap");
      const msgEl = root.querySelector(".co-msg");
      const scanEl = root.querySelector(".co-scan");
      const topIn = root.querySelector(".co-pile.top .co-in");
      const cartIn = root.querySelector(".co-pile.cart .co-in");
      const btns = root.querySelector(".co-btns");
      let msgT = 0;
      const say = (txt, kind) => {
        msgEl.className = `co-msg show ${kind}`;
        msgEl.innerHTML = rich(txt);
        msgT = 1.2;
      };

      const beltEls = new Map();
      const renderTray = () => {
        trayEl.innerHTML = race.tray
          .map((it, i) => `<div class="co-item ${i === 0 ? "first" : ""} ${it.type}" title="${esc(t(it.name))}"><span>${it.icon}</span>${i === 0 ? `<small>${esc(t(it.name))}</small>` : ""}</div>`)
          .join("");
        capEl.textContent = `${race.tray.length}/${race.T.trayMax}`;
        capEl.classList.toggle("full", race.tray.length >= race.T.trayMax);
      };

      const place = (where) => {
        if (race.done || !race.tray.length) return;
        const r = race.place(where);
        if (!r) return;
        const pile = where === "top" ? topIn : cartIn;
        const el = document.createElement("span");
        el.textContent = r.item.icon;
        el.className = r.ok ? "" : "bad";
        pile.appendChild(el);
        if (r.ok) {
          sfx.click();
          if (Math.random() < 0.35) say(TXT.good[(Math.random() * TXT.good.length) | 0], "good");
        } else {
          sfx.bad();
          say(t(TXT[r.reason]), "bad");
        }
        renderTray();
      };
      btns.querySelectorAll("[data-w]").forEach((b) => (b.onclick = () => place(b.dataset.w)));
      root.querySelector(".co-pile.top").onclick = () => place("top");
      root.querySelector(".co-pile.cart").onclick = () => place("cart");
      trayEl.onclick = () => {
        const first = race.tray[0];
        if (first) place(first.type === "fragile" ? "top" : "cart");
      };
      const onKey = (e) => {
        const k = e.key.toLowerCase();
        if (k === "a" || k === "arrowleft" || k === "1") {
          e.preventDefault();
          place("top");
        } else if (k === "d" || k === "arrowright" || k === "2") {
          e.preventDefault();
          place("cart");
        }
      };
      addEventListener("keydown", onKey, true);

      let finished = false;
      const update = (dt) => {
        if (finished) return;
        race.step(dt);
        for (const ev of race.out.splice(0)) {
          if (ev.type === "scan") {
            sfx.coin();
            scanEl.classList.remove("beep");
            void scanEl.offsetWidth;
            scanEl.classList.add("beep");
            const el = document.createElement("div");
            el.className = `co-item ${ev.item.type}`;
            el.innerHTML = `<span>${ev.item.icon}</span>`;
            beltItems.appendChild(el);
            beltEls.set(ev.item.uid, el);
          } else if (ev.type === "tray") {
            beltEls.get(ev.item.uid)?.remove();
            beltEls.delete(ev.item.uid);
            renderTray();
          } else if (ev.type === "pileup") {
            sfx.bad();
            say(t(TXT.pileup), "bad");
            root.querySelector(".co-tray").classList.add("shake");
            setTimeout(() => root.querySelector(".co-tray")?.classList.remove("shake"), 400);
          } else if (ev.type === "done") {
            finished = true;
            setTimeout(pay, 500);
          }
        }
        for (const b of race.belt) {
          const el = beltEls.get(b.item.uid);
          if (el) el.style.left = `${Math.min(1, b.t) * 88}%`;
        }
        msgT -= dt;
        if (msgT <= 0) msgEl.className = "co-msg";
      };
      ctx.game.updaters.add(update);

      const pay = () => {
        const sum = Object.values(PRICES).reduce((a, b) => a + b, 0);
        const due = Math.max(0, sum - pfand);
        btns.innerHTML = `
          <div class="co-pay pop">
            <div>${rich(t(TXT.total, { sum: euro(due) }))}</div>
            ${pfand ? `<small>${esc(t(TXT.pfandOff, { v: euro(pfand) }))}</small>` : ""}
            <div class="co-pay-btns">
              <button class="co-btn cart" data-p="card">💳 ${esc(t(TXT.card))}</button>
              <button class="co-btn top" data-p="cash">💶 ${esc(t(TXT.cash))}</button>
            </div>
          </div>`;
        btns.querySelectorAll("[data-p]").forEach(
          (b) =>
            (b.onclick = () => {
              sfx.good();
              const paid = b.dataset.p;
              btns.innerHTML = `<div class="co-pay pop"><div>${esc(t(paid === "card" ? TXT.paidCard : TXT.paidCash))}</div><button class="btn primary">${esc(t(TXT.next))}</button></div>`;
              btns.querySelector("button").onclick = () => done(paid);
            })
        );
      };

      const cleanup = () => {
        ctx.game.updaters.delete(update);
        removeEventListener("keydown", onKey, true);
        root.className = "";
        root.innerHTML = "";
        document.body.classList.remove("mg-ui");
      };
      ctx.scene.onDispose?.(cleanup);
      const done = (paid) => {
        cleanup();
        const r = race.result();
        const tips = [
          {
            tip: {
              en: "German cashiers scan **fast**. Just put everything back in the cart, pay, then pack calmly at the **packing shelf** (Packtisch).",
              vi: "Thu ngân ở Đức quét hàng **rất nhanh**. Cứ bỏ hết vào xe đẩy, thanh toán, rồi xếp đồ thong thả ở **bàn xếp đồ** (Packtisch).",
            },
            good: r.pileups === 0,
          },
          {
            tip: { en: "Put fragile things (eggs, bread, berries) on top, never under heavy bottles.", vi: "Để đồ dễ vỡ (trứng, bánh mì, dâu) lên trên, đừng để dưới chai nặng." },
            good: r.crushed === 0,
          },
        ];
        resolve({ ...r, flags: { paidWith: paid }, tips });
      };

      renderTray();
    });
  },
};
