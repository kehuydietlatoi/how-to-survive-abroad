import "./style.css";
import "./minigames.css";
import { Game } from "./core/Game.js";
import { Input } from "./core/Input.js";
import { ScenarioScene } from "./scenario/ScenarioScene.js";
import { SCENARIOS } from "../content/index.js";
import { COUNTRIES, countryName } from "../content/countries.js";
import { Globe } from "./ui/Globe.js";
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

// Only countries that have at least one scenario get a pin / chip.
const PLAYABLE = COUNTRIES.filter((c) => SCENARIOS.some((s) => s.country === c.id));
let selectedCountry = PLAYABLE.some((c) => c.id === safeGet("hsa.country")) ? safeGet("hsa.country") : null;
let globe = null;

function getGlobe() {
  if (!globe) {
    globe = new Globe(PLAYABLE, { onPick: (id) => pickCountry(id) });
    game.updaters.add((dt, time) => globe.update(dt, time));
  }
  return globe;
}

function cardHtml(s) {
  return `<div class="card">
      <div class="banner" style="background:${s.color}">${s.emoji}<span class="country">${s.flag} ${ui.esc(t(countryName(s.country)))}</span></div>
      <div class="body">
        <h3>${ui.esc(t(s.title))}</h3>
        <p>${ui.esc(t(s.desc))}</p>
        <div class="tags">${s.tags.map((x) => `<span class="tag">${ui.esc(t(x))}</span>`).join("")}<span class="tag">~${s.minutes} ${t("minutes")}</span></div>
        <div class="row" style="align-items:center"><button class="btn" data-play="${s.id}">${ui.esc(t("play"))} ▶</button>
        <span class="best">${stars(s.id)}</span></div>
      </div></div>`;
}

function countrySection(c, picked = false) {
  const list = SCENARIOS.filter((s) => s.country === c.id);
  return `<section class="country-section ${picked ? "picked" : ""}">
      <h2><span class="flag">${c.flag}</span> ${ui.esc(t(c.name))} <small>${list.length} ${ui.esc(t(list.length === 1 ? "scenarioOne" : "scenarioMany"))}</small></h2>
      <div class="cards">${list.map(cardHtml).join("")}</div>
    </section>`;
}

function listHtml() {
  const picked = PLAYABLE.find((c) => c.id === selectedCountry);
  if (!picked) return `<div class="pick-hint">🌍 ${ui.esc(t("pickCountry"))}</div>${PLAYABLE.map((c) => countrySection(c)).join("")}`;
  const rest = PLAYABLE.filter((c) => c !== picked);
  return `${countrySection(picked, true)}
    <div class="other-title">${ui.esc(t("otherCountries"))}</div>
    ${rest.map((c) => countrySection(c)).join("")}`;
}

function bindList(root) {
  root.querySelectorAll("[data-play]").forEach((b) => (b.onclick = () => start(b.dataset.play)));
}

/** Select a country (from the globe, a chip or a finished scenario) and re-list its scenarios first. */
function pickCountry(id, toggle = false) {
  selectedCountry = toggle && selectedCountry === id ? null : id;
  safeSet("hsa.country", selectedCountry || "");
  getGlobe().select(selectedCountry);
  const menu = document.querySelector(".menu");
  const list = menu?.querySelector("#countryList");
  if (!list) return;
  menu.querySelectorAll("[data-country]").forEach((b) => b.classList.toggle("on", b.dataset.country === selectedCountry));
  list.innerHTML = listHtml();
  bindList(list);
  const head = list.querySelector(".country-section.picked");
  // Bring the picked country's cards into view but keep part of the globe visible.
  const over = head ? head.getBoundingClientRect().top - innerHeight * 0.55 : 0;
  if (over > 0) document.getElementById("screen").scrollBy({ top: over, behavior: "smooth" });
}

function showMenu() {
  ui.setHudVisible(false);
  game.setEnvironment({ sky: "#ffe9d6" });
  const g = getGlobe();
  const chips = PLAYABLE.map((c) => {
    const n = SCENARIOS.filter((s) => s.country === c.id).length;
    return `<button class="chip-country ${c.id === selectedCountry ? "on" : ""}" data-country="${c.id}" style="--c:${c.color}">${c.flag} ${ui.esc(t(c.name))} <b>${n}</b></button>`;
  }).join("");
  const s = ui.showScreen(
    `<div class="menu">
      <h1>${ui.esc(t("title"))}</h1>
      <div class="sub">${ui.esc(t("subtitle"))}</div>
      <div class="lang-switch">${LANGS.map((l) => `<button data-lang="${l}" class="${l === getLang() ? "on" : ""}">${l === "en" ? "English" : "Tiếng Việt"}</button>`).join("")}</div>
      <div class="avatars">${AVATARS.map((a) => `<button data-avatar="${a.model}" class="${a.model === avatar ? "on" : ""}">${a.emoji}</button>`).join("")}</div>
      <div class="globe-slot"></div>
      <div class="globe-hint">${ui.esc(t("globeHint"))}</div>
      <div class="country-chips">${chips}</div>
      <div id="countryList">${listHtml()}</div>
      <div class="credits">3D assets: Kenney.nl (CC0) · Globe: Natural Earth · ${ui.esc(t({ en: "Rules shown are typical examples – always check local details.", vi: "Quy định trong game là ví dụ phổ biến – hãy luôn kiểm tra thông tin địa phương." }))}</div>
    </div>`
  );
  if (g.ok) {
    g.mount(s.querySelector(".globe-slot"));
    g.select(selectedCountry);
  } else {
    s.querySelector(".globe-slot").remove();
    s.querySelector(".globe-hint").remove();
  }
  s.querySelectorAll("[data-lang]").forEach((b) => (b.onclick = () => setLang(b.dataset.lang)));
  s.querySelectorAll("[data-country]").forEach((b) => (b.onclick = () => pickCountry(b.dataset.country, true)));
  s.querySelectorAll("[data-avatar]").forEach(
    (b) =>
      (b.onclick = () => {
        avatar = b.dataset.avatar;
        safeSet("hsa.avatar", avatar);
        showMenu();
      })
  );
  bindList(s);
}

function stars(id) {
  const n = Number(safeGet(`hsa.best.${id}`) || 0);
  return n ? "★".repeat(n) + "☆".repeat(3 - n) : "";
}

async function start(id) {
  const entry = SCENARIOS.find((s) => s.id === id);
  selectedCountry = entry.country; // the menu reopens on this country
  safeSet("hsa.country", selectedCountry);
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
