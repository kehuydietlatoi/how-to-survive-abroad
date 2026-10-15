import { CallBoard as Board, makeSchedule } from "./callBoardLogic.js";
import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";
import { sfx } from "../core/Audio.js";

// Bürgeramt waiting-room minigame: watch the LED call board and react only to your number.

const TXT = {
  title: { en: "Waiting room: watch for your number", vi: "Phòng chờ: canh số của bạn" },
  hint: {
    en: "Press **That's me!** (or Space) only when **your** number is called. Some look very similar!",
    vi: "Bấm **Số của tôi!** (hoặc Space) chỉ khi **số của bạn** được gọi. Có số trông rất giống!",
  },
  yourNumber: { en: "Your number", vi: "Số của bạn" },
  me: { en: "That's me!", vi: "Số của tôi!" },
  notYou: { en: "That's **{num}**, not your number!", vi: "Đó là số **{num}**, không phải số của bạn!" },
  missed: { en: "You missed your call! It'll be called again… 😬", vi: "Bạn lỡ lượt gọi! Sẽ được gọi lại… 😬" },
  found: { en: "That's you! Go to **Platz {counter}**.", vi: "Là bạn đó! Đến **Platz {counter}** (quầy {counter})." },
  timeout: { en: "A clerk comes looking for you…", vi: "Một nhân viên phải đi tìm bạn…" },
  clock: { en: "Waiting", vi: "Đang chờ" },
  recall: { en: "2nd call", vi: "Gọi lần 2" },
};

export const CallBoard = {
  run(ctx, params = {}) {
    return new Promise((resolve) => {
      const mine = params.mine || "A-117";
      const counter = params.counter || 4;
      const board = new Board(makeSchedule({ mine, counter }));
      const root = document.getElementById("minigame");
      root.className = "show";
      document.body.classList.add("mg-ui");
      root.innerHTML = `
        <div class="cb-wrap">
          <div class="cb-top">
            <div class="sort-title">${esc(t(TXT.title))}</div>
            <div class="sort-hint">${rich(t(TXT.hint))}</div>
          </div>
          <div class="cb-board">
            <div class="cb-head"><span>Nummer</span><span>Platz</span></div>
            <div class="cb-rows"></div>
          </div>
          <div class="cb-msg"></div>
          <div class="cb-bottom">
            <div class="cb-ticket"><small>${esc(t(TXT.yourNumber))}</small><b>${esc(mine)}</b><small>Anmeldung · 09:12</small></div>
            <button class="cb-btn">🙋 ${esc(t(TXT.me))}</button>
            <div class="cb-clock">🕘 <span>09:12</span></div>
          </div>
        </div>`;
      const rows = root.querySelector(".cb-rows");
      const msg = root.querySelector(".cb-msg");
      const clock = root.querySelector(".cb-clock span");
      const btn = root.querySelector(".cb-btn");
      let msgTimer = 0;
      const say = (txt, kind) => {
        msg.className = `cb-msg show ${kind}`;
        msg.innerHTML = rich(txt);
        msgTimer = 2.2;
      };

      const render = () => {
        rows.innerHTML = board.shown
          .map(
            (c, i) =>
              `<div class="cb-row ${i === 0 ? "new" : ""}"><span>${esc(c.num)}${c.recall ? ` <em>${esc(t(TXT.recall))}</em>` : ""}</span><span>${c.counter}</span></div>`
          )
          .join("");
      };

      const press = () => {
        if (board.done) return;
        board.press();
      };
      btn.onclick = press;
      const onKey = (e) => {
        if (e.key === " " || e.key.toLowerCase() === "e" || e.key === "Enter") {
          e.preventDefault();
          press();
        }
      };
      addEventListener("keydown", onKey, true);

      let finished = false;
      const update = (dt) => {
        if (finished) return;
        board.step(dt);
        // waiting clock runs fast: ~1 minute per real second
        const mins = 12 + Math.floor(board.time);
        clock.textContent = `${String(9 + Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
        for (const ev of board.out.splice(0)) {
          if (ev.type === "call") {
            sfx.print();
            render();
          } else if (ev.type === "false") {
            sfx.bad();
            btn.classList.add("bad");
            setTimeout(() => btn.classList.remove("bad"), 400);
            say(t(TXT.notYou, { num: ev.call ? ev.call.num : "…" }), "bad");
          } else if (ev.type === "missed") {
            sfx.bad();
            say(t(TXT.missed), "bad");
          } else if (ev.type === "found" || ev.type === "timeout") {
            finished = true;
            if (ev.type === "found") sfx.good();
            say(ev.type === "found" ? t(TXT.found, { counter }) : t(TXT.timeout), ev.type === "found" ? "good" : "bad");
            setTimeout(finish, 1600);
          }
        }
        msgTimer -= dt;
        if (msgTimer <= 0 && !finished) msg.className = "cb-msg";
      };
      ctx.game.updaters.add(update);

      const cleanup = () => {
        ctx.game.updaters.delete(update);
        removeEventListener("keydown", onKey, true);
        root.className = "";
        root.innerHTML = "";
        document.body.classList.remove("mg-ui");
      };
      ctx.scene.onDispose?.(cleanup);
      const finish = () => {
        cleanup();
        const r = board.result();
        const tips = [
          {
            tip: {
              en: "At German offices you get a number (Wartenummer). Watch the board: **number + Platz/Raum** tells you where to go.",
              vi: "Ở cơ quan Đức bạn lấy số thứ tự (Wartenummer). Canh bảng: **số + Platz/Raum** cho biết bạn đến quầy nào.",
            },
            good: r.falsePresses === 0 && r.misses === 0,
          },
        ];
        resolve({ ...r, tips });
      };
      render();
    });
  },
};
