import { t } from "../i18n/i18n.js";
import { esc, rich } from "../ui/ui.js";

// Shared plumbing for the DOM-based minigames (open / close the overlay, Enter/E key helper, summary card).

export const COMMON_TXT = {
  gotIt: { en: "Got it", vi: "Hiểu rồi" },
  continue: { en: "Continue", vi: "Tiếp tục" },
  review: { en: "Remember:", vi: "Ghi nhớ:" },
  streak: { en: "streak", vi: "liên tiếp" },
  tryAgain: { en: "Try again", vi: "Thử lại" },
};

/** Open the minigame overlay with `html`; returns { root, close }. */
export function openOverlay(html, cls = "show") {
  const root = document.getElementById("minigame");
  root.className = cls;
  document.body.classList.add("mg-ui");
  root.innerHTML = html;
  const close = () => {
    root.className = "";
    root.innerHTML = "";
    document.body.classList.remove("mg-ui");
  };
  return { root, close };
}

/** Call fn on E / Enter / Space (after a small delay so the opening key press is ignored). Returns an unbind fn. */
export function onConfirmKey(fn, delay = 250) {
  const h = (e) => {
    if (["e", "enter", " "].includes(e.key.toLowerCase())) {
      e.preventDefault();
      fn();
    }
  };
  const id = setTimeout(() => addEventListener("keydown", h, true), delay);
  return () => {
    clearTimeout(id);
    removeEventListener("keydown", h, true);
  };
}

/** HTML for a "what went wrong" review list. */
export function reviewHtml(mistakes) {
  if (!mistakes.length) return "";
  return `<div class="rev"><b>${esc(t(COMMON_TXT.review))}</b><ul>${mistakes
    .map((m) => `<li>${m.icon || ""} <b>${rich(t(m.name))}</b>:${rich(t(m.why))}</li>`)
    .join("")}</ul></div>`;
}
