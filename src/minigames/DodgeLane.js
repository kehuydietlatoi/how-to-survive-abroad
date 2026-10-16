import { LaneGame, PLAYER_Y } from "./laneLogic.js";
import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";
import { sfx } from "../core/Audio.js";
import { openOverlay, onConfirmKey, COMMON_TXT } from "./mgCommon.js";

// Top-down lane dodger drawn on a 2D canvas. Used for the Sacré-Cœur steps, the Amsterdam bike lane
// and the Bondi flags. See laneLogic.js for the params.
//
// extra UI params: { title, hint, player: "🚲", bg: "#cfd8dc", laneColors?: [..], failText, doneText,
//                    actionLabel?: { en, vi }, actionIcon?: "🔔" }

const TXT = {
  hearts: { en: "Safety", vi: "An toàn" },
  left: { en: "Time left", vi: "Còn lại" },
  hint: { en: "← → (or tap a lane) to move", vi: "← → (hoặc chạm vào làn) để di chuyển" },
  actionHint: { en: "Space = {a}", vi: "Space = {a}" },
  done: { en: "You made it!", vi: "Bạn đã vượt qua!" },
  fail: { en: "You didn't survive that… 💀", vi: "Bạn không qua nổi… 💀" },
  hits: { en: "Hits", vi: "Va chạm" },
  forbidden: { en: "Careful!", vi: "Cẩn thận!" },
};

export const DodgeLane = {
  run(ctx, params) {
    return new Promise((resolve) => {
      let attempts = 1;
      let logic = new LaneGame({ ...params, seed: (params.seed ?? 1) });
      const n = params.lanes.length;
      const { root, close } = openOverlay(`
        <div class="sort-wrap lane-wrap">
          <div class="sort-top">
            <div class="sort-title">${esc(t(params.title))}</div>
            <div class="lane-meta"><span class="lane-hearts"></span><span class="lane-time"></span></div>
            <div class="sort-hint">${rich(t(params.hint || TXT.hint))}${params.action && !params.hint ? ` · ${esc(t(TXT.actionHint, { a: t(params.actionLabel || params.action.id) }))}` : ""}</div>
            <div class="sw-timer"><i></i></div>
          </div>
          <div class="lane-stage">
            <canvas class="lane-cv"></canvas>
            <div class="lane-msg"></div>
            <div class="lane-over"></div>
          </div>
          <div class="lane-ctrl">
            <button class="lane-b" data-act="left">◀</button>
            ${params.action ? `<button class="lane-b act" data-act="action">${params.actionIcon || "🔔"}<small>${esc(t(params.actionLabel || params.action.id))}</small></button>` : ""}
            <button class="lane-b" data-act="right">▶</button>
          </div>
        </div>`);
      const cv = root.querySelector(".lane-cv");
      const g = cv.getContext("2d");
      const msg = root.querySelector(".lane-msg");
      const over = root.querySelector(".lane-over");
      const heartsEl = root.querySelector(".lane-hearts");
      const timeEl = root.querySelector(".lane-time");
      const bar = root.querySelector(".sw-timer i");
      const actBtn = root.querySelector(".lane-b.act");
      let msgTimer = 0;
      let shake = 0;
      let finished = false;
      let ended = false;
      let px = null; // smoothed player x (in lane units)
      const floats = []; // { text, x, y, life }
      let W = 0;
      let H = 0;

      const say = (text, kind = "bad") => {
        msg.className = `lane-msg show ${kind}`;
        msg.innerHTML = rich(t(text));
        msgTimer = 2.4;
      };

      // --- input
      const keys = (e) => {
        const k = e.key.toLowerCase();
        if (k === "arrowleft" || k === "a") {
          e.preventDefault();
          logic.move(-1);
        } else if (k === "arrowright" || k === "d") {
          e.preventDefault();
          logic.move(1);
        } else if (k === " " || k === "arrowup" || k === "w") {
          e.preventDefault();
          if (params.action) doAction();
        }
      };
      addEventListener("keydown", keys, true);
      const doAction = () => {
        if (!logic.done && logic.act()) {
          const ev = logic.out[logic.out.length - 1];
          if (ev.cleared) {
            sfx.good();
            floats.push({ text: `${params.actionIcon || "🔔"} +${ev.cleared}`, lane: logic.lane, y: PLAYER_Y - 0.1, life: 1 });
          } else sfx.click();
        }
      };
      root.querySelector('[data-act="left"]').onclick = () => logic.move(-1);
      root.querySelector('[data-act="right"]').onclick = () => logic.move(1);
      if (actBtn) actBtn.onclick = doAction;
      let tap = null;
      const laneAt = (e) => {
        const r = cv.getBoundingClientRect();
        return Math.floor(((e.clientX - r.left) / r.width) * n);
      };
      cv.addEventListener("pointerdown", (e) => {
        tap = e.pointerId;
        cv.setPointerCapture(e.pointerId);
        logic.setLane(laneAt(e));
      });
      cv.addEventListener("pointermove", (e) => tap === e.pointerId && logic.setLane(laneAt(e)));
      cv.addEventListener("pointerup", () => (tap = null));
      cv.addEventListener("pointercancel", () => (tap = null));

      // --- drawing
      const resize = () => {
        const r = cv.getBoundingClientRect();
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const w = Math.round(r.width * dpr);
        const h = Math.round(r.height * dpr);
        if (cv.width !== w || cv.height !== h) {
          cv.width = w;
          cv.height = h;
        }
        W = cv.width;
        H = cv.height;
      };

      const draw = () => {
        resize();
        if (!W) return;
        const laneW = W / n;
        g.save();
        if (shake > 0) g.translate((Math.random() - 0.5) * 14 * shake, (Math.random() - 0.5) * 8 * shake);
        g.clearRect(-20, -20, W + 40, H + 40);
        g.fillStyle = params.bg || "#cfd8dc";
        g.fillRect(0, 0, W, H);
        params.lanes.forEach((l, i) => {
          g.fillStyle = l.color || params.laneColors?.[i] || (i % 2 ? "#dfe6ea" : "#e9eef1");
          g.fillRect(i * laneW, 0, laneW, H);
          if (l.kind === "forbidden") {
            // red hazard stripes
            g.fillStyle = "rgba(255,70,70,0.22)";
            for (let y = -H; y < H * 2; y += 46) {
              g.beginPath();
              g.moveTo(i * laneW, y + ((logic.time * 60) % 46));
              g.lineTo(i * laneW + laneW, y + ((logic.time * 60) % 46) - 30);
              g.lineTo(i * laneW + laneW, y + ((logic.time * 60) % 46) - 6);
              g.lineTo(i * laneW, y + ((logic.time * 60) % 46) + 24);
              g.fill();
            }
          }
          if (l.label) {
            g.fillStyle = "rgba(59,51,85,0.55)";
            g.font = `800 ${Math.max(11, laneW * 0.17)}px "Baloo 2", sans-serif`;
            g.textAlign = "center";
            g.fillText(t(l.label), i * laneW + laneW / 2, 20 * (H / 600 + 0.6));
          }
        });
        // scrolling lane dashes
        g.strokeStyle = "rgba(255,255,255,0.8)";
        g.lineWidth = 3;
        g.setLineDash([22, 26]);
        g.lineDashOffset = -(logic.time * 120);
        for (let i = 1; i < n; i++) {
          g.beginPath();
          g.moveTo(i * laneW, 0);
          g.lineTo(i * laneW, H);
          g.stroke();
        }
        g.setLineDash([]);

        const size = Math.min(laneW * 0.62, H * 0.1, 64);
        g.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        for (const k of logic.pickups) g.fillText(k.def.icon, k.lane * laneW + laneW / 2, k.y * H);
        for (const o of logic.obstacles) g.fillText(o.def.icon, o.lane * laneW + laneW / 2, o.y * H);

        if (px === null) px = logic.lane;
        const blink = logic.invuln > 0 && Math.floor(logic.time * 12) % 2 === 0;
        if (!blink) {
          g.font = `${size * 1.15}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
          g.fillText(params.player || "🚶", (px + 0.5) * laneW, PLAYER_Y * H);
        }
        g.font = `800 ${size * 0.55}px "Baloo 2", sans-serif`;
        for (const f of floats) {
          g.globalAlpha = Math.max(0, f.life);
          g.fillStyle = "#2a9d4a";
          g.fillText(f.text, (f.lane + 0.5) * laneW, f.y * H);
        }
        g.globalAlpha = 1;
        g.restore();
      };

      const renderHud = () => {
        heartsEl.textContent = `${t(TXT.hearts)}: ${"❤️".repeat(Math.max(0, logic.hearts))}${"🖤".repeat(Math.max(0, logic.maxHearts - logic.hearts))}`;
        const left = Math.max(0, Math.ceil(logic.p.duration - logic.time));
        timeEl.textContent = `⏱ ${left}s`;
        bar.style.width = `${Math.min(100, (logic.time / logic.p.duration) * 100)}%`;
        if (actBtn) actBtn.classList.toggle("cool", logic.actionCd > 0);
      };

      const update = (dt) => {
        if (finished) return;
        if (!logic.done) logic.step(dt);
        if (px !== null) px += (logic.lane - px) * Math.min(1, dt * 16);
        shake = Math.max(0, shake - dt * 3);
        for (const f of floats) {
          f.life -= dt;
          f.y -= dt * 0.12;
        }
        while (floats.length && floats[0].life <= 0) floats.shift();
        for (const ev of logic.out.splice(0)) {
          if (ev.type === "hit") {
            sfx.bump();
            shake = 1;
            say(ev.def.why, "bad");
          } else if (ev.type === "drain") {
            sfx.bad();
            shake = 0.6;
            say(ev.lane.why || TXT.forbidden, "bad");
          } else if (ev.type === "pickup") {
            sfx.coin();
            floats.push({ text: `+${ev.def.points ?? 1} ${ev.def.icon}`, lane: logic.lane, y: PLAYER_Y - 0.08, life: 0.9 });
          }
        }
        msgTimer -= dt;
        if (msgTimer <= 0) msg.className = "lane-msg";
        renderHud();
        draw();
        if (logic.done && !ended) {
          ended = true;
          setTimeout(finishRound, 700);
        }
      };
      ctx.game.updaters.add(update);
      ctx.scene.laneDebug = () => logic; // handy for automated playtests (see window.__hsa)

      const cleanup = () => {
        finished = true;
        ctx.game.updaters.delete(update);
        removeEventListener("keydown", keys, true);
        close();
      };
      ctx.scene.onDispose?.(cleanup);

      const finishRound = () => {
        if (finished) return;
        const r = logic.result();
        if (!logic.won) {
          sfx.bad();
          over.className = "lane-over show";
          over.innerHTML = `<div class="sort-summary pop"><h3>${esc(t(params.failText || TXT.fail))}</h3>
            <button class="btn primary">${esc(t(COMMON_TXT.tryAgain))}</button></div>`;
          const again = () => {
            unbind();
            over.className = "lane-over";
            attempts++;
            logic = new LaneGame({ ...params, seed: (params.seed ?? 1) + attempts });
            ended = false;
            px = null;
            floats.length = 0;
          };
          const unbind = onConfirmKey(again, 300);
          over.querySelector("button").onclick = again;
          return;
        }
        sfx.good();
        const score = Math.max(30, r.score - 15 * (attempts - 1));
        over.className = "lane-over show";
        over.innerHTML = `<div class="sort-summary pop"><h3>✨ ${esc(t(params.doneText || TXT.done))}</h3>
          <div class="big">${"❤️".repeat(r.hearts)}${"🖤".repeat(logic.maxHearts - r.hearts)}</div>
          <div>${esc(t(TXT.hits))}: <b>${r.hits}</b>${r.picked ? ` · ${r.picked} ✨` : ""}${r.cleared ? ` · ${params.actionIcon || "🔔"} ${r.cleared}` : ""}</div>
          <button class="btn primary">${esc(t(COMMON_TXT.continue))}</button></div>`;
        const go = () => {
          unbind();
          cleanup();
          resolve({ ...r, score, attempts });
        };
        const unbind = onConfirmKey(go, 300);
        over.querySelector("button").onclick = go;
      };
    });
  },
};
