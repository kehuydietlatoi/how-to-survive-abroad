import { SwipeLogic } from "./swipeLogic.js";
import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";
import { sfx } from "../core/Audio.js";
import { openOverlay, onConfirmKey, reviewHtml, COMMON_TXT } from "./mgCommon.js";

// "Judge it" minigame: one card at a time, swipe / tap left or right before the timer runs out.
// Used for "OK on a Tokyo train?", "tip or no tip?", "what the British really mean"…
//
// params: { title, hint?, left: { label, icon, color }, right: { … }, items: [{ id, icon, text, answer: "left"|"right", why }],
//           secondsPerCard?, seed? }

const TXT = {
  right: { en: "Right!", vi: "Đúng rồi!" },
  wrong: { en: "Not quite!", vi: "Chưa đúng!" },
  slow: { en: "Too slow!", vi: "Chậm quá!" },
  done: { en: "Verdict delivered!", vi: "Phán quyết xong!" },
  firstTry: { en: "right", vi: "đúng" },
  hint: { en: "Swipe the card (or ← →) before time runs out", vi: "Vuốt thẻ (hoặc phím ← →) trước khi hết giờ" },
};
const HAPPY = ["😎", "🤩", "👌", "🥳", "😏"];
const SAD = ["😱", "🫠", "💀", "🙈", "😬"];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const SWIPE_AT = 80; // px

export const SwipeJudge = {
  run(ctx, params) {
    return new Promise((resolve) => {
      const logic = new SwipeLogic(params.items, { secondsPerCard: params.secondsPerCard ?? 7, seed: params.seed ?? (Date.now() & 0xffff) });
      const side = (s) => params[s];
      const { root, close } = openOverlay(`
        <div class="sort-wrap swipe-wrap">
          <div class="sort-top">
            <div class="sort-title">${esc(t(params.title))}</div>
            <div class="sort-meta"><span class="sw-count"></span><span class="sw-streak"></span></div>
            <div class="sort-hint">${rich(t(params.hint || TXT.hint))}</div>
            <div class="sw-timer"><i></i></div>
          </div>
          <div class="sort-stage">
            <div class="sort-card sw-card"></div>
            <div class="sw-face"></div>
            <div class="sort-explain"></div>
          </div>
          <div class="sw-btns">
            ${["left", "right"]
              .map((s) => `<button class="sw-btn ${s}" data-side="${s}" style="--c:${side(s).color}"><span class="key">${s === "left" ? "←" : "→"}</span><span class="zi">${side(s).icon}</span><b>${esc(t(side(s).label))}</b></button>`)
              .join("")}
          </div>
        </div>`);
      const card = root.querySelector(".sw-card");
      const face = root.querySelector(".sw-face");
      const explain = root.querySelector(".sort-explain");
      const bar = root.querySelector(".sw-timer i");
      const countEl = root.querySelector(".sw-count");
      const streakEl = root.querySelector(".sw-streak");
      const btns = [...root.querySelectorAll(".sw-btn")];
      let busy = false;
      let finished = false;
      let unbindExplain = null;

      const showCard = () => {
        const it = logic.current;
        countEl.textContent = `${logic.idx + 1} / ${logic.items.length}`;
        streakEl.textContent = logic.streak >= 2 ? `🔥 ${logic.streak} ${t(COMMON_TXT.streak)}` : "";
        card.className = "sort-card sw-card enter";
        card.style.transform = "";
        card.style.opacity = "";
        card.innerHTML = `<div class="ci">${it.icon}</div><div class="cn">${rich(t(it.text))}</div>`;
        void card.offsetWidth;
        card.classList.remove("enter");
      };

      const fling = (s) => {
        const dir = s === "left" ? -1 : 1;
        card.style.transition = "transform 0.3s ease-in, opacity 0.3s";
        card.style.transform = `translateX(${dir * 420}px) rotate(${dir * 24}deg)`;
        card.style.opacity = "0";
        setTimeout(() => (card.style.transition = ""), 320);
      };

      const next = () => {
        busy = false;
        face.className = "sw-face";
        if (logic.done) finish();
        else showCard();
      };

      const react = (res, s) => {
        busy = true;
        face.textContent = res.ok ? pick(HAPPY) : pick(SAD);
        face.className = "sw-face show";
        if (s) fling(s);
        if (res.ok) {
          sfx.good();
          setTimeout(next, 480);
          return;
        }
        sfx.bad();
        const title = res.timedOut ? TXT.slow : TXT.wrong;
        const right = side(res.item.answer);
        explain.className = "sort-explain show";
        explain.innerHTML = `<b>${esc(t(title))}</b> ${rich(t({ en: "It's", vi: "Đáp án:" }))} <b>${right.icon} ${esc(t(right.label))}</b>. ${rich(t(res.item.why))}<button class="btn primary">${esc(t(COMMON_TXT.gotIt))}</button>`;
        const go = () => {
          unbindExplain?.();
          explain.className = "sort-explain";
          next();
        };
        explain.querySelector("button").onclick = go;
        unbindExplain = onConfirmKey(go, 200);
      };

      const answer = (s) => {
        if (busy || finished || logic.done) return;
        const res = logic.answer(s);
        react(res, s);
      };

      // --- input
      btns.forEach((b) => (b.onclick = () => answer(b.dataset.side)));
      const onKey = (e) => {
        if (busy) return;
        const k = e.key.toLowerCase();
        if (k === "arrowleft" || k === "a") {
          e.preventDefault();
          answer("left");
        } else if (k === "arrowright" || k === "d") {
          e.preventDefault();
          answer("right");
        }
      };
      addEventListener("keydown", onKey, true);

      let drag = null;
      card.addEventListener("pointerdown", (e) => {
        if (busy) return;
        drag = { x: e.clientX, id: e.pointerId };
        card.setPointerCapture(e.pointerId);
        card.classList.add("dragging");
      });
      card.addEventListener("pointermove", (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x;
        card.style.transform = `translateX(${dx}px) rotate(${dx * 0.06}deg)`;
        btns.forEach((b) => b.classList.toggle("over", (b.dataset.side === "left" && dx < -SWIPE_AT / 2) || (b.dataset.side === "right" && dx > SWIPE_AT / 2)));
      });
      const endDrag = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x;
        drag = null;
        card.classList.remove("dragging");
        btns.forEach((b) => b.classList.remove("over"));
        if (Math.abs(dx) > SWIPE_AT) answer(dx < 0 ? "left" : "right");
        else card.style.transform = "";
      };
      card.addEventListener("pointerup", endDrag);
      card.addEventListener("pointercancel", endDrag);

      // --- timer (driven by the game loop so it pauses with the rest of the game)
      const update = (dt) => {
        if (busy || finished || logic.done) return;
        const res = logic.step(dt);
        bar.style.width = `${Math.max(0, (logic.timeLeft / logic.secondsPerCard) * 100)}%`;
        bar.classList.toggle("low", logic.timeLeft < 2);
        if (res) react(res, null);
      };
      ctx.game.updaters.add(update);

      const cleanup = () => {
        finished = true;
        ctx.game.updaters.delete(update);
        removeEventListener("keydown", onKey, true);
        unbindExplain?.();
        close();
      };
      ctx.scene.onDispose?.(cleanup);

      const finish = () => {
        finished = true;
        const r = logic.result();
        sfx.good();
        const stage = root.querySelector(".sort-stage");
        const mistakes = logic.mistakes.map((m) => ({ icon: m.item.icon, name: m.item.text, why: m.item.why }));
        stage.innerHTML = `<div class="sort-summary pop">
          <h3>⚖️ ${esc(t(TXT.done))}</h3>
          <div class="big">${r.right} / ${r.total} <small>${esc(t(TXT.firstTry))}</small></div>
          ${r.best >= 3 ? `<div>🔥 ${r.best} ${esc(t(COMMON_TXT.streak))}</div>` : ""}
          ${reviewHtml(mistakes)}
          <button class="btn primary">${esc(t(COMMON_TXT.continue))}</button></div>`;
        root.querySelector(".sw-btns").style.visibility = "hidden";
        const go = () => {
          unbind();
          cleanup();
          resolve(r);
        };
        const unbind = onConfirmKey(go, 300);
        stage.querySelector("button").onclick = go;
      };

      showCard();
    });
  },
};
