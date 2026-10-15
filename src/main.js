import "./style.css";
import { Game } from "./core/Game.js";
import { Input } from "./core/Input.js";
import { ScenarioScene } from "./scenario/ScenarioScene.js";
import { SCENARIOS } from "../content/index.js";
import * as ui from "./ui/ui.js";
import { t, getLang, setLang, onLangChange, LANGS } from "./i18n/i18n.js";

const game = new Game(document.getElementById("game"));
const input = new Input(document.getElementById("touch"));
let current = null;

const AVATARS = [
  { model: "character-female-a", emoji: "👧" },
  { model: "character-male-a", emoji: "👦" },
  { model: "character-female-c", emoji: "👩" },
  { model: "character-male-e", emoji: "🧑" },
];
let avatar = safeGet("hsa.avatar") || AVATARS[0].model;

function applyStaticText() {
  for (const n of document.querySelectorAll("[data-t]")) n.textContent = t(n.dataset.t);
  document.getElementById("langBtn").textContent = getLang().toUpperCase();
  document.getElementById("controlsHint").textContent = t("controls");
  document.documentElement.lang = getLang();
}

function showMenu() {
  ui.setHudVisible(false);
  game.setEnvironment({ sky: "#ffe9d6" });
  const cards = SCENARIOS.map(
    (s) => `<div class="card">
      <div class="banner" style="background:${s.color}">${s.emoji}<span class="country">${s.flag} ${ui.esc(t(s.country))}</span></div>
      <div class="body">
        <h3>${ui.esc(t(s.title))}</h3>
        <p>${ui.esc(t(s.desc))}</p>
        <div class="tags">${s.tags.map((x) => `<span class="tag">${ui.esc(t(x))}</span>`).join("")}<span class="tag">~${s.minutes} ${t("minutes")}</span></div>
        <div class="row" style="align-items:center"><button class="btn" data-play="${s.id}">${ui.esc(t("play"))} ▶</button>
        <span class="best">${stars(s.id)}</span></div>
      </div></div>`
  ).join("");
  const s = ui.showScreen(
    `<div class="menu">
      <h1>${ui.esc(t("title"))}</h1>
      <div class="sub">${ui.esc(t("subtitle"))}</div>
      <div class="lang-switch">${LANGS.map((l) => `<button data-lang="${l}" class="${l === getLang() ? "on" : ""}">${l === "en" ? "English" : "Tiếng Việt"}</button>`).join("")}</div>
      <div class="avatars">${AVATARS.map((a) => `<button data-avatar="${a.model}" class="${a.model === avatar ? "on" : ""}">${a.emoji}</button>`).join("")}</div>
      <div class="cards">${cards}</div>
      <div class="credits">3D assets: Kenney.nl (CC0) · ${ui.esc(t({ en: "Rules shown are typical examples – always check local details.", vi: "Quy định trong game là ví dụ phổ biến – hãy luôn kiểm tra thông tin địa phương." }))}</div>
    </div>`
  );
  s.querySelectorAll("[data-lang]").forEach((b) => (b.onclick = () => setLang(b.dataset.lang)));
  s.querySelectorAll("[data-avatar]").forEach(
    (b) =>
      (b.onclick = () => {
        avatar = b.dataset.avatar;
        safeSet("hsa.avatar", avatar);
        showMenu();
      })
  );
  s.querySelectorAll("[data-play]").forEach((b) => (b.onclick = () => start(b.dataset.play)));
}

function stars(id) {
  const n = Number(safeGet(`hsa.best.${id}`) || 0);
  return n ? "★".repeat(n) + "☆".repeat(3 - n) : "";
}

async function start(id) {
  const entry = SCENARIOS.find((s) => s.id === id);
  current?.dispose();
  current = null;
  ui.showScreen(`<div class="menu"><h1>${entry.emoji}</h1><div class="sub">${ui.esc(t("loading"))}</div><div class="loading-bar"><div></div></div></div>`);
  const bar = document.querySelector(".loading-bar div");
  const def = await entry.load();
  const startStep = new URLSearchParams(location.search).get("step");
  const scene = new ScenarioScene(game, input, { id, ...def, startStep }, {
    avatar,
    onExit: (what) => {
      scene.dispose();
      if (current === scene) current = null;
      ui.hideScreen();
      document.getElementById("dialog").classList.remove("show");
      document.getElementById("minigame").className = "";
      document.getElementById("minigame").innerHTML = "";
      if (what === "retry") start(id);
      else showMenu();
    },
  });
  current = scene;
  await scene.load((p) => (bar.style.width = `${Math.round(p * 100)}%`));
  if (current !== scene) return;
  ui.hideScreen();
  ui.setHudVisible(true);
  window.__hsa = { scene, game }; // handy for debugging / automated playtests
  scene.run();
}

document.getElementById("langBtn").onclick = () => setLang(getLang() === "en" ? "vi" : "en");
document.getElementById("menuBtn").onclick = () => current?.exit();
document.getElementById("routeBtn").onclick = () => current?.showRoute();
onLangChange(() => {
  applyStaticText();
  if (!current) showMenu();
});

applyStaticText();
const auto = new URLSearchParams(location.search).get("play");
if (auto && SCENARIOS.some((s) => s.id === auto)) start(auto);
else showMenu();

function safeGet(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}
