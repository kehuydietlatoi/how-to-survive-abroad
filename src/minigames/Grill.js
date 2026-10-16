import { Grill as GrillLogic, GOLD_MIN, GOLD_MAX, doneness } from "./grillLogic.js";
import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";
import { sfx } from "../core/Audio.js";
import { openOverlay, onConfirmKey, COMMON_TXT } from "./mgCommon.js";

// Barbecue minigame: flip the meat before it burns, serve it golden, and pour the boss's drink
// with two hands when he asks. See grillLogic.js for the rules.
//
// params: { title, hint?, boss: { name, icon }, meat: "🥓", slots?, pieces?, cookTime?, events?, eventWindow?, askText, seed? }

const TXT = {
  hint: { en: "Flip (1-3) before a side burns · Serve (Q W E) when both sides are golden · Space = pour with two hands", vi: "Lật (1-3) trước khi cháy · Dọn (Q W E) khi cả hai mặt vàng · Space = rót bằng hai tay" },
  flip: { en: "Flip", vi: "Lật" },
  serve: { en: "Serve", vi: "Dọn" },
  pour: { en: "🙌 Pour with TWO hands", vi: "🙌 Rót bằng HAI tay" },
  served: { en: "Served", vi: "Đã dọn" },
  side: { en: "side", vi: "mặt" },
  empty: { en: "empty", vi: "trống" },
  done: { en: "Dinner survived!", vi: "Bữa tối sống sót!" },
  perfect: { en: "perfect", vi: "hoàn hảo" },
  glass: { en: "Boss's glass", vi: "Ly của sếp" },
  full: { en: "full", vi: "đầy" },
  quips: {
    perfect: [
      { en: "Chef's kiss. 👨‍🍳", vi: "Quá đỉnh. 👨‍🍳" },
      { en: "The boss nods. This is the highest praise.", vi: "Sếp gật đầu. Đó là lời khen cao nhất." },
    ],
    burnt: [
      { en: "Burnt. The intern will eat this one.", vi: "Cháy rồi. Thực tập sinh sẽ ăn miếng này." },
      { en: "Charcoal. Very 'rustic'.", vi: "Than rồi. Rất “mộc mạc”." },
    ],
    raw: [
      { en: "Raw. Hospital is three stops away.", vi: "Còn sống. Bệnh viện cách ba trạm." },
      { en: "Still mooing.", vi: "Vẫn còn kêu “bò”." },
    ],
    mixed: [{ en: "Edible. Nobody will say anything.", vi: "Ăn được. Không ai nói gì cả." }],
  },
  pourOk: { en: "Two hands, slight bow: respect +100.", vi: "Hai tay, hơi cúi đầu: điểm kính trọng +100." },
  pourMiss: { en: "The boss pours his own glass and sighs. Everyone saw.", vi: "Sếp tự rót rượu và thở dài. Ai cũng thấy." },
  pourWaste: { en: "You poured on the table. Nobody asked.", vi: "Bạn rót ra bàn. Có ai bảo đâu." },
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const SLOT_KEYS_FLIP = ["1", "2", "3", "4", "5"];
const SLOT_KEYS_SERVE = ["q", "w", "e", "r", "t"];
const BAR_MAX = 1.7; // bar shows cook values 0 … BAR_MAX

export const Grill = {
  run(ctx, params) {
    return new Promise((resolve) => {
      const n = params.slots ?? 3;
      const logic = new GrillLogic({ slots: n, pieces: params.pieces ?? 8, cookTime: params.cookTime ?? 4, events: params.events ?? [9, 20, 31], eventWindow: params.eventWindow ?? 4, seed: params.seed ?? 1 });
      const slotsHtml = Array.from({ length: n }, (_, i) => `
        <div class="gr-slot" data-i="${i}">
          <div class="gr-meat"></div>
          <div class="gr-sides">
            ${[0, 1].map((s) => `<div class="gr-side" data-s="${s}"><span class="gr-sl">${esc(t(TXT.side))} ${s + 1}</span><div class="gr-bar"><i></i><u style="left:${(GOLD_MIN / BAR_MAX) * 100}%;width:${((GOLD_MAX - GOLD_MIN) / BAR_MAX) * 100}%"></u></div></div>`).join("")}
          </div>
          <div class="gr-btns">
            <button class="btn gr-flip"><span class="key">${SLOT_KEYS_FLIP[i]}</span>🔄 ${esc(t(TXT.flip))}</button>
            <button class="btn primary gr-serve"><span class="key">${SLOT_KEYS_SERVE[i].toUpperCase()}</span>🍽 ${esc(t(TXT.serve))}</button>
          </div>
        </div>`).join("");
      const { root, close } = openOverlay(`
        <div class="sort-wrap grill-wrap">
          <div class="sort-top">
            <div class="sort-title">${esc(t(params.title))}</div>
            <div class="sort-meta"><span class="gr-count"></span></div>
            <div class="sort-hint">${esc(t(params.hint || TXT.hint))}</div>
          </div>
          <div class="gr-boss">
            <div class="gr-bface">${params.boss.icon}<small>${esc(t(params.boss.name))}</small></div>
            <div class="gr-glass"><span class="gr-gl">🥃</span><div class="gr-gbar"><i></i></div></div>
            <button class="btn gr-pour">${esc(t(TXT.pour))}</button>
          </div>
          <div class="gr-msg"></div>
          <div class="gr-grid" style="--n:${n}">${slotsHtml}</div>
          <div class="gr-end"></div>
        </div>`);
      const els = [...root.querySelectorAll(".gr-slot")];
      const countEl = root.querySelector(".gr-count");
      const msg = root.querySelector(".gr-msg");
      const pourBtn = root.querySelector(".gr-pour");
      const glassBar = root.querySelector(".gr-gbar i");
      const glass = root.querySelector(".gr-glass");
      const bface = root.querySelector(".gr-bface");
      const endEl = root.querySelector(".gr-end");
      let msgTimer = 0;
      let finished = false;

      const say = (text, kind) => {
        msg.className = `gr-msg show ${kind}`;
        msg.innerHTML = rich(t(text));
        msgTimer = 2.6;
      };

      els.forEach((el, i) => {
        el.querySelector(".gr-flip").onclick = () => doFlip(i);
        el.querySelector(".gr-serve").onclick = () => doServe(i);
      });
      pourBtn.onclick = () => doPour();
      const doFlip = (i) => {
        if (logic.flip(i)) sfx.click();
      };
      const doServe = (i) => {
        const r = logic.serve(i);
        if (!r) return;
        r.quality === "perfect" ? sfx.good() : sfx.bad();
        say(pick(TXT.quips[r.quality]), r.quality === "perfect" ? "good" : r.quality === "mixed" ? "" : "bad");
      };
      const doPour = () => {
        const was = logic.activeEvent;
        const ok = logic.pour();
        if (ok) {
          sfx.coin();
          say(TXT.pourOk, "good");
        } else if (!was) {
          sfx.bad();
          say(TXT.pourWaste, "bad");
        }
      };
      const onKey = (e) => {
        const k = e.key.toLowerCase();
        let i = SLOT_KEYS_FLIP.indexOf(k);
        if (i >= 0 && i < n) return e.preventDefault(), doFlip(i);
        i = SLOT_KEYS_SERVE.indexOf(k);
        if (i >= 0 && i < n) return e.preventDefault(), doServe(i);
        if (k === " " || k === "p") {
          e.preventDefault();
          doPour();
        }
      };
      addEventListener("keydown", onKey, true);

      const update = (dt) => {
        if (finished) return;
        logic.step(dt);
        for (const ev of logic.out.splice(0)) {
          if (ev.type === "event") {
            sfx.honk();
            say(params.askText || { en: "The boss's glass is empty!", vi: "Ly của sếp cạn rồi!" }, "warn");
          } else if (ev.type === "missed") {
            sfx.bad();
            say(TXT.pourMiss, "bad");
          }
        }
        msgTimer -= dt;
        if (msgTimer <= 0) msg.className = "gr-msg";
        render();
        if (logic.done) {
          finished = true;
          setTimeout(finish, 600);
        }
      };
      ctx.game.updaters.add(update);

      const render = () => {
        countEl.textContent = `${t(TXT.served)}: ${logic.served.length} / ${logic.pieces} · ✨ ${logic.served.filter((s) => s.quality === "perfect").length}`;
        const ev = logic.activeEvent;
        pourBtn.classList.toggle("urgent", !!ev);
        glass.classList.toggle("empty", !!ev);
        bface.classList.toggle("wait", !!ev);
        glassBar.style.width = ev ? `${Math.max(0, (ev.left / logic.eventWindow) * 100)}%` : "100%";
        els.forEach((el, i) => {
          const p = logic.slots[i];
          el.classList.toggle("vacant", !p);
          const meat = el.querySelector(".gr-meat");
          if (!p) {
            meat.textContent = "·";
            return;
          }
          meat.textContent = params.meat || "🥓";
          meat.classList.toggle("sizzle", true);
          el.querySelectorAll(".gr-side").forEach((sd, s) => {
            const v = p.cook[s] / logic.cookTime;
            const d = doneness(v);
            sd.dataset.state = d;
            sd.classList.toggle("down", p.down === s);
            sd.querySelector("i").style.width = `${Math.min(100, (v / BAR_MAX) * 100)}%`;
          });
          const [a, b] = logic.state(i);
          el.dataset.ready = a === "golden" && b === "golden" ? "1" : "";
          el.dataset.burning = a === "burnt" || b === "burnt" ? "1" : "";
        });
      };

      const cleanup = () => {
        finished = true;
        ctx.game.updaters.delete(update);
        removeEventListener("keydown", onKey, true);
        close();
      };
      ctx.scene.onDispose?.(cleanup);

      const finish = () => {
        const r = logic.result();
        sfx.good();
        endEl.className = "gr-end show";
        endEl.innerHTML = `<div class="sort-summary pop">
          <h3>🔥 ${esc(t(TXT.done))}</h3>
          <div class="big">${r.perfect} / ${logic.pieces} <small>${esc(t(TXT.perfect))}</small></div>
          <div>🥩 ${r.raw} · ⬛ ${r.burnt} · 🥃 ${r.pours.ok} / ${r.asked}</div>
          <button class="btn primary">${esc(t(COMMON_TXT.continue))}</button></div>`;
        const go = () => {
          unbind();
          cleanup();
          resolve(r);
        };
        const unbind = onConfirmKey(go, 300);
        endEl.querySelector("button").onclick = go;
      };
      render();
    });
  },
};
