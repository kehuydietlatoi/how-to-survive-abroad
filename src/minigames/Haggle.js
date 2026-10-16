import { Haggle as HaggleLogic } from "./haggleLogic.js";
import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";
import { sfx } from "../core/Audio.js";
import { openOverlay, onConfirmKey, COMMON_TXT } from "./mgCommon.js";

// Haggling minigame: slide your counter-offer, accept, or walk away. See haggleLogic.js for the rules.
//
// params: { title, hint?, seller: { name, icon }, item: { icon, name }, currency: "₹", start, fair: [lo, hi], floor,
//           step?, patience?, lines: { open, insult: [..], counter: [..], callback, deal, angry, walk } } (each line is { en, vi })

const TXT = {
  patience: { en: "Seller's patience", vi: "Độ kiên nhẫn của người bán" },
  offer: { en: "Offer", vi: "Trả giá" },
  accept: { en: "Accept {p}", vi: "Đồng ý {p}" },
  walk: { en: "Walk away", vi: "Bỏ đi" },
  yourOffer: { en: "Your offer", vi: "Giá bạn trả" },
  ask: { en: "Asking price", vi: "Giá người bán" },
  hint: { en: "Slide your offer, then press **Offer**. Too low insults the seller; walking away can bring a better price once.", vi: "Kéo thanh để chọn giá, rồi bấm **Trả giá**. Trả quá thấp sẽ xúc phạm người bán; bỏ đi có thể được giá tốt hơn (một lần)." },
  paid: { en: "You paid", vi: "Bạn đã trả" },
  fairRange: { en: "Typical fair price (illustrative)", vi: "Giá hợp lý thường gặp (minh hoạ)" },
  fairYes: { en: "That's a fair deal!", vi: "Một giá hợp lý!" },
  fairNo: { en: "You overpaid a little… classic tourist price.", vi: "Bạn trả hơi cao… đúng giá du khách." },
  walked: { en: "You walked away and used another option.", vi: "Bạn bỏ đi và chọn cách khác." },
  angry: { en: "The seller stormed off.", vi: "Người bán bỏ đi vì tức giận." },
};
const pick = (a) => (Array.isArray(a) ? a[Math.floor(Math.random() * a.length)] : a);

export const Haggle = {
  run(ctx, params) {
    return new Promise((resolve) => {
      const logic = new HaggleLogic({ start: params.start, fair: params.fair, floor: params.floor, patience: params.patience ?? 3 });
      const cur = params.currency || "";
      const money = (n) => `${cur}${n}`;
      const lo = Math.max(1, Math.round(params.start * 0.1));
      const step = params.step ?? Math.max(1, Math.round(params.start / 80));
      const { root, close } = openOverlay(`
        <div class="sort-wrap haggle-wrap">
          <div class="sort-top">
            <div class="sort-title">${esc(t(params.title))}</div>
            <div class="sort-hint">${rich(t(params.hint || TXT.hint))}</div>
          </div>
          <div class="hg-stage">
            <div class="hg-seller"><div class="hg-face">${params.seller.icon}</div><div class="hg-name">${esc(t(params.seller.name))}</div></div>
            <div class="hg-bubble"></div>
            <div class="hg-ask"><small>${esc(t(TXT.ask))}</small><b></b><span class="hg-item">${params.item.icon} ${esc(t(params.item.name))}</span></div>
            <div class="hg-patience"><small>${esc(t(TXT.patience))}</small><div class="hg-pbar"><i></i></div></div>
          </div>
          <div class="hg-panel">
            <div class="hg-offer"><small>${esc(t(TXT.yourOffer))}</small><b></b></div>
            <input class="hg-slider" type="range" min="${lo}" max="${params.start}" step="${step}" />
            <div class="hg-btns">
              <button class="btn primary hg-do">${esc(t(TXT.offer))}</button>
              <button class="btn hg-accept"></button>
              <button class="btn secondary hg-walk">${esc(t(TXT.walk))}</button>
            </div>
          </div>
          <div class="hg-end"></div>
        </div>`);
      const bubble = root.querySelector(".hg-bubble");
      const askEl = root.querySelector(".hg-ask b");
      const face = root.querySelector(".hg-face");
      const pbar = root.querySelector(".hg-pbar i");
      const slider = root.querySelector(".hg-slider");
      const offerEl = root.querySelector(".hg-offer b");
      const acceptBtn = root.querySelector(".hg-accept");
      const endEl = root.querySelector(".hg-end");
      let locked = false;

      const speak = (line, mood) => {
        bubble.innerHTML = rich(t(line));
        bubble.classList.remove("pop");
        void bubble.offsetWidth;
        bubble.classList.add("pop");
        face.dataset.mood = mood || "";
      };
      const render = () => {
        askEl.textContent = money(logic.ask);
        slider.max = logic.ask;
        if (Number(slider.value) > logic.ask) slider.value = logic.ask;
        offerEl.textContent = money(slider.value);
        acceptBtn.textContent = t(TXT.accept, { p: money(logic.ask) });
        const pct = Math.max(0, (logic.patience / logic.maxPatience) * 100);
        pbar.style.width = `${pct}%`;
        pbar.className = pct < 35 ? "low" : pct < 70 ? "mid" : "";
      };
      slider.value = Math.round(params.start * 0.5);
      slider.oninput = () => (offerEl.textContent = money(slider.value));

      const react = (res) => {
        if (res.type === "insult") {
          sfx.bad();
          speak(pick(params.lines.insult), "mad");
        } else if (res.type === "counter") {
          sfx.click();
          speak(pick(params.lines.counter), "think");
        } else if (res.type === "callback") {
          sfx.click();
          speak(params.lines.callback, "think");
        } else if (res.type === "deal") {
          sfx.coin();
          speak(params.lines.deal, "happy");
        } else if (res.type === "angry") {
          sfx.bad();
          speak(params.lines.angry, "mad");
        } else if (res.type === "walk") {
          speak(params.lines.walk, "think");
        }
        render();
        if (logic.done) {
          locked = true;
          setTimeout(finish, 1100);
        }
      };

      root.querySelector(".hg-do").onclick = () => !locked && react(logic.offer(Number(slider.value)));
      acceptBtn.onclick = () => !locked && react(logic.accept());
      root.querySelector(".hg-walk").onclick = () => !locked && react(logic.walkAway());
      const onKey = (e) => {
        if (locked) return;
        if (e.key === "Enter") {
          e.preventDefault();
          react(logic.offer(Number(slider.value)));
        } else if (e.key === "Escape") return;
      };
      addEventListener("keydown", onKey, true);

      const cleanup = () => {
        locked = true;
        removeEventListener("keydown", onKey, true);
        close();
      };
      ctx.scene.onDispose?.(cleanup);

      const finish = () => {
        const r = logic.result();
        const line =
          logic.outcome === "deal"
            ? `${t(TXT.paid)} <b>${esc(money(logic.final))}</b><br>${esc(t(r.fairDeal ? TXT.fairYes : TXT.fairNo))}`
            : esc(t(logic.outcome === "walk" ? TXT.walked : TXT.angry));
        endEl.className = "hg-end show";
        endEl.innerHTML = `<div class="sort-summary pop"><h3>🤝</h3><div class="big" style="font-size:22px">${line}</div>
          <div class="hg-fair">${esc(t(TXT.fairRange))}: <b>${esc(money(params.fair[0]))}–${esc(money(params.fair[1]))}</b></div>
          <button class="btn primary">${esc(t(COMMON_TXT.continue))}</button></div>`;
        const go = () => {
          unbind();
          cleanup();
          resolve(r);
        };
        const unbind = onConfirmKey(go, 300);
        endEl.querySelector("button").onclick = go;
      };

      speak(params.lines.open, "");
      render();
    });
  },
};
