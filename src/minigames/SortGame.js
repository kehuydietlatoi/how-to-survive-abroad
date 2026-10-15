import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";
import { sfx } from "../core/Audio.js";

// Generic "put each item in the right place" minigame (trash bins, documents folder…).
// Drag the card onto a zone, tap a zone, or press 1–9. Wrong answers explain why and
// the item then goes to the right place; the score counts right-first-time answers.
//
// params: { title, hint, theme, zones: [{ id, label, sub?, color, icon }],
//           items: [{ id, icon, name, zone (id or [ids]), why }], shuffle? }

export function isRightZone(item, zoneId) {
  return Array.isArray(item.zone) ? item.zone.includes(zoneId) : item.zone === zoneId;
}

const TXT = {
  right: { en: "Right!", vi: "Đúng rồi!" },
  wrong: { en: "Not there!", vi: "Không phải chỗ này!" },
  gotIt: { en: "Got it", vi: "Hiểu rồi" },
  done: { en: "All sorted!", vi: "Xong hết rồi!" },
  firstTry: { en: "right first time", vi: "đúng ngay lần đầu" },
  review: { en: "Remember:", vi: "Ghi nhớ:" },
  continue: { en: "Continue", vi: "Tiếp tục" },
  streak: { en: "streak", vi: "liên tiếp" },
  dragHint: { en: "Drag the card to the right place, or tap it", vi: "Kéo thẻ vào đúng chỗ, hoặc chạm vào đó" },
};

export const SortGame = {
  run(ctx, params) {
    return new Promise((resolve) => {
      const zones = params.zones;
      const items = params.shuffle === false ? [...params.items] : shuffle([...params.items]);
      let idx = 0;
      let streak = 0;
      let best = 0;
      let busy = false;
      const mistakes = [];

      const root = document.getElementById("minigame");
      root.className = "show";
      document.body.classList.add("mg-ui");
      root.innerHTML = `
        <div class="sort-wrap theme-${params.theme || "plain"}">
          <div class="sort-top">
            <div class="sort-title">${esc(t(params.title))}</div>
            <div class="sort-meta"><span class="sort-count"></span><span class="sort-streak"></span></div>
            <div class="sort-hint">${rich(t(params.hint || TXT.dragHint))}</div>
          </div>
          <div class="sort-stage"><div class="sort-card"></div><div class="sort-explain"></div></div>
          <div class="sort-zones" style="--n:${zones.length}">
            ${zones
              .map(
                (z, i) => `<button class="sort-zone" data-z="${z.id}" style="--c:${z.color}">
                  <span class="lid"></span><span class="zi">${z.icon}</span>
                  <b>${esc(t(z.label))}</b>${z.sub ? `<small>${esc(t(z.sub))}</small>` : ""}<span class="key">${i + 1}</span></button>`
              )
              .join("")}
          </div>
        </div>`;
      const card = root.querySelector(".sort-card");
      const explain = root.querySelector(".sort-explain");
      const countEl = root.querySelector(".sort-count");
      const streakEl = root.querySelector(".sort-streak");
      const zoneEls = [...root.querySelectorAll(".sort-zone")];

      const showItem = () => {
        const it = items[idx];
        countEl.textContent = `${idx + 1} / ${items.length}`;
        streakEl.textContent = streak >= 2 ? `🔥 ${streak} ${t(TXT.streak)}` : "";
        card.className = "sort-card enter";
        card.style.transform = "";
        card.innerHTML = `<div class="ci">${it.icon}</div><div class="cn">${esc(t(it.name))}</div>${it.desc ? `<div class="cd">${esc(t(it.desc))}</div>` : ""}`;
        void card.offsetWidth;
        card.classList.remove("enter");
      };

      const flyTo = (zoneEl) =>
        new Promise((res) => {
          const a = card.getBoundingClientRect();
          const b = zoneEl.getBoundingClientRect();
          const dx = b.left + b.width / 2 - (a.left + a.width / 2);
          const dy = b.top + b.height / 3 - (a.top + a.height / 2);
          card.style.transition = "transform 0.35s cubic-bezier(.5,-0.3,.6,1), opacity 0.35s";
          card.style.transform = `translate(${dx}px, ${dy}px) scale(0.25) rotate(${dx > 0 ? 25 : -25}deg)`;
          card.style.opacity = "0";
          zoneEl.classList.add("open");
          setTimeout(() => {
            zoneEl.classList.remove("open");
            card.style.transition = "";
            card.style.opacity = "";
            res();
          }, 380);
        });

      const next = () => {
        idx++;
        busy = false;
        if (idx >= items.length) finish();
        else showItem();
      };

      const drop = async (zoneId) => {
        if (busy || idx >= items.length) return;
        busy = true;
        const it = items[idx];
        const zEl = zoneEls.find((z) => z.dataset.z === zoneId);
        if (isRightZone(it, zoneId)) {
          streak++;
          best = Math.max(best, streak);
          sfx.coin();
          zEl.classList.add("good");
          setTimeout(() => zEl.classList.remove("good"), 500);
          await flyTo(zEl);
          next();
          return;
        }
        // wrong: explain, show the right zone, then move it there
        streak = 0;
        mistakes.push(it);
        sfx.bad();
        zEl.classList.add("bad");
        card.classList.add("shake");
        const right = zoneEls.find((z) => isRightZone(it, z.dataset.z));
        right.classList.add("hint");
        card.style.transform = "";
        explain.className = "sort-explain show";
        explain.innerHTML = `<b>${esc(t(TXT.wrong))}</b> ${rich(t(it.why))}<button class="btn primary">${esc(t(TXT.gotIt))}</button>`;
        explain.querySelector("button").onclick = async () => {
          explain.className = "sort-explain";
          zEl.classList.remove("bad");
          card.classList.remove("shake");
          await flyTo(right);
          right.classList.remove("hint");
          next();
        };
      };

      // ---- input: tap zones, keys, drag the card
      zoneEls.forEach((z) => (z.onclick = () => drop(z.dataset.z)));
      const onKey = (e) => {
        if (explain.classList.contains("show")) {
          if (["e", "enter", " "].includes(e.key.toLowerCase())) {
            e.preventDefault();
            explain.querySelector("button")?.click();
          }
          return;
        }
        const n = Number(e.key);
        if (n >= 1 && n <= zones.length) {
          e.preventDefault();
          drop(zones[n - 1].id);
        }
      };
      addEventListener("keydown", onKey, true);

      let drag = null;
      card.addEventListener("pointerdown", (e) => {
        if (busy) return;
        drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
        card.setPointerCapture(e.pointerId);
        card.classList.add("dragging");
      });
      card.addEventListener("pointermove", (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        card.style.transform = `translate(${e.clientX - drag.x}px, ${e.clientY - drag.y}px) rotate(${(e.clientX - drag.x) * 0.05}deg)`;
        const over = zoneAt(e.clientX, e.clientY);
        zoneEls.forEach((z) => z.classList.toggle("over", z === over));
      });
      const endDrag = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const moved = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
        drag = null;
        card.classList.remove("dragging");
        zoneEls.forEach((z) => z.classList.remove("over"));
        const over = zoneAt(e.clientX, e.clientY);
        if (over && moved > 10) drop(over.dataset.z);
        else card.style.transform = "";
      };
      card.addEventListener("pointerup", endDrag);
      card.addEventListener("pointercancel", endDrag);
      const zoneAt = (x, y) =>
        zoneEls.find((z) => {
          const r = z.getBoundingClientRect();
          return x >= r.left && x <= r.right && y >= r.top - 30 && y <= r.bottom;
        });

      // ---- finish
      const cleanup = () => {
        removeEventListener("keydown", onKey, true);
        root.className = "";
        root.innerHTML = "";
        document.body.classList.remove("mg-ui");
      };
      ctx.scene.onDispose?.(cleanup);

      const finish = () => {
        const right = items.length - mistakes.length;
        const score = Math.round((right / items.length) * 100);
        sfx.good();
        const stage = root.querySelector(".sort-stage");
        stage.innerHTML = `<div class="sort-summary pop">
          <h3>✨ ${esc(t(TXT.done))}</h3>
          <div class="big">${right} / ${items.length} <small>${esc(t(TXT.firstTry))}</small></div>
          ${best >= 3 ? `<div>🔥 ${best} ${esc(t(TXT.streak))}</div>` : ""}
          ${
            mistakes.length
              ? `<div class="rev"><b>${esc(t(TXT.review))}</b><ul>${mistakes
                  .map((m) => `<li>${m.icon} <b>${esc(t(m.name))}</b>: ${rich(t(m.why))}</li>`)
                  .join("")}</ul></div>`
              : ""
          }
          <button class="btn primary">${esc(t(TXT.continue))}</button></div>`;
        const btn = stage.querySelector("button");
        const go = () => {
          removeEventListener("keydown", k, true);
          cleanup();
          resolve({ score, passed: true, right, total: items.length, mistakes: mistakes.map((m) => m.id) });
        };
        const k = (e) => {
          if (["e", "enter", " "].includes(e.key.toLowerCase())) {
            e.preventDefault();
            go();
          }
        };
        setTimeout(() => addEventListener("keydown", k, true), 300);
        btn.onclick = go;
      };

      showItem();
    });
  },
};

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
