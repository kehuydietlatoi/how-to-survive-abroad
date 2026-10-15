import { t } from "../i18n/i18n.js";
import { sfx } from "../core/Audio.js";

// Small DOM helpers for the HTML overlay. Everything returns promises so scenario code reads linearly.

const $ = (sel) => document.querySelector(sel);

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

export function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

/** Minimal markup: **bold** and line breaks. */
export function rich(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\n/g, "<br>");
}

let dialogOpen = false;
export const isDialogOpen = () => dialogOpen;

function openDialog(build) {
  const root = $("#dialog");
  root.innerHTML = "";
  const panel = el("div", "panel pop");
  root.appendChild(panel);
  root.classList.add("show");
  dialogOpen = true;
  document.body.classList.add("dialog-open");
  return new Promise((resolve) => {
    build(panel, (value) => {
      root.classList.remove("show");
      dialogOpen = false;
      document.body.classList.remove("dialog-open");
      setTimeout(() => {
        if (!dialogOpen) root.innerHTML = "";
      }, 200);
      resolve(value);
    });
  });
}

function header(panel, speaker, icon) {
  if (!speaker && !icon) return;
  const h = el("div", "speaker", `${icon ? `<span class="icon">${icon}</span>` : ""}${speaker ? esc(t(speaker)) : ""}`);
  panel.appendChild(h);
}

function continueButton(panel, close, label = "continue") {
  const b = el("button", "btn primary", esc(t(label)) + (isTouch ? "" : ' <span class="key">E</span>'));
  b.onclick = () => close();
  panel.appendChild(b);
  setTimeout(() => b.focus(), 50);
  const onKey = (e) => {
    if (["e", "enter", " "].includes(e.key.toLowerCase())) {
      e.preventDefault();
      removeEventListener("keydown", onKey, true);
      close();
    }
  };
  // Small delay so the key press that opened the dialog doesn't close it.
  setTimeout(() => addEventListener("keydown", onKey, true), 250);
  b.addEventListener("click", () => removeEventListener("keydown", onKey, true));
}

/** Show a message. */
export function info(text, { speaker, icon, card, button } = {}) {
  return openDialog((panel, close) => {
    header(panel, speaker, icon);
    panel.appendChild(el("p", "text", rich(t(text))));
    if (card) panel.appendChild(card);
    continueButton(panel, close, button);
  });
}

/**
 * Show a multiple-choice question. Resolves with the chosen index after
 * showing the option's feedback.
 */
export function choice(prompt, options, { speaker, icon } = {}) {
  return openDialog((panel, close) => {
    header(panel, speaker, icon);
    panel.appendChild(el("p", "text", rich(t(prompt))));
    const list = el("div", "options");
    panel.appendChild(list);
    const keys = ["1", "2", "3", "4", "5"];
    let picked = false;
    const pick = (i) => {
      if (picked) return;
      picked = true;
      removeEventListener("keydown", onKey, true);
      const opt = options[i];
      (opt.correct ? sfx.good : opt.points > 0 ? sfx.click : sfx.bad)();
      [...list.children].forEach((b, j) => {
        b.disabled = true;
        if (j === i) b.classList.add(opt.correct ? "good" : opt.points > 0 ? "ok" : "bad");
      });
      const fb = el("div", `feedback ${opt.correct ? "good" : opt.points > 0 ? "ok" : "bad"}`);
      fb.innerHTML = `<b>${esc(t(opt.correct ? "correct" : opt.points > 0 ? "hmm" : "notQuite"))}</b> ${rich(t(opt.feedback || ""))}`;
      panel.appendChild(fb);
      continueButton(panel, () => close(i));
    };
    options.forEach((o, i) => {
      const b = el("button", "btn option", `<span class="num">${keys[i]}</span> ${rich(t(o.text))}`);
      b.onclick = () => pick(i);
      list.appendChild(b);
    });
    const onKey = (e) => {
      const i = keys.indexOf(e.key);
      if (i >= 0 && i < options.length) {
        e.preventDefault();
        pick(i);
      }
    };
    setTimeout(() => addEventListener("keydown", onKey, true), 150);
  });
}

let toastTimer;
export function toast(text, kind = "") {
  const tEl = $("#toast");
  tEl.className = `show ${kind}`;
  tEl.innerHTML = rich(t(text));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (tEl.className = ""), 2600);
}

export function setObjective(text) {
  const o = $("#objective");
  if (!text) {
    o.classList.remove("show");
    return;
  }
  o.innerHTML = `<div class="label">${esc(t("objective"))}</div><div>${rich(t(text))}</div>`;
  o.classList.add("show");
}

export function setScore(score) {
  $("#score").innerHTML = `⭐ ${score}`;
}

export function setPrompt(label, onClick) {
  const p = $("#prompt");
  if (!label) {
    p.classList.remove("show");
    p.onclick = null;
    return;
  }
  p.innerHTML = isTouch ? `👆 ${esc(label)}` : `<span class="key">E</span> ${esc(label)}`;
  p.onclick = onClick;
  p.classList.add("show");
}

export function fade(on, ms = 450) {
  const f = $("#fade");
  f.classList.toggle("show", on);
  return new Promise((r) => setTimeout(r, ms));
}

export function fadeText(text) {
  $("#fade").innerHTML = text ? `<div>${rich(t(text))}</div>` : "";
}

export function showScreen(html, cls = "") {
  const s = $("#screen");
  s.className = `show ${cls}`;
  s.innerHTML = html;
  return s;
}

export function hideScreen() {
  const s = $("#screen");
  s.className = "";
  s.innerHTML = "";
}

/** Touch screen? (?touch=1 forces it, handy for testing on desktop) */
export const isTouch =
  new URLSearchParams(location.search).get("touch") === "1" ||
  matchMedia("(pointer: coarse)").matches ||
  navigator.maxTouchPoints > 0;
document.body.classList.toggle("touch", isTouch);

export function setHudVisible(v) {
  $("#hud").classList.toggle("show", v);
  $("#touch").classList.toggle("show", v && isTouch);
}
