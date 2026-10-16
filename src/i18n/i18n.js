// Bilingual text. Scenario content stores text inline as { en, vi } objects;
// UI strings live in the `ui` table below and are looked up by key.

export const LANGS = ["en", "vi"];

const ui = {
  title: { en: "How To Survive Abroad", vi: "Sống Sót Nơi Xứ Người" },
  subtitle: {
    en: "Practise everyday life in a new country before you land.",
    vi: "Luyện tập cuộc sống hằng ngày ở đất nước mới trước khi bạn đến.",
  },
  play: { en: "Play", vi: "Chơi" },
  continue: { en: "Continue", vi: "Tiếp tục" },
  ok: { en: "OK", vi: "OK" },
  interact: { en: "Interact", vi: "Tương tác" },
  objective: { en: "Objective", vi: "Nhiệm vụ" },
  route: { en: "Route", vi: "Lộ trình" },
  score: { en: "Score", vi: "Điểm" },
  retry: { en: "Try again", vi: "Thử lại" },
  menu: { en: "Back to menu", vi: "Về menu" },
  journal: { en: "Survival journal", vi: "Sổ tay sinh tồn" },
  complete: { en: "Scenario complete!", vi: "Hoàn thành tình huống!" },
  loading: { en: "Loading…", vi: "Đang tải…" },
  minutes: { en: "min", vi: "phút" },
  controls: {
    en: "Move: WASD / arrows · Interact: E · Route: R",
    vi: "Di chuyển: WASD / mũi tên · Tương tác: E · Lộ trình: R",
  },
  globeHint: { en: "Drag to spin the planet · tap a pin to pick a country", vi: "Kéo để xoay hành tinh · chạm vào ghim để chọn quốc gia" },
  pickCountry: { en: "Pick a country on the globe to start there!", vi: "Chọn một quốc gia trên quả địa cầu để bắt đầu!" },
  otherCountries: { en: "More countries to explore", vi: "Các quốc gia khác" },
  scenarioOne: { en: "scenario", vi: "tình huống" },
  scenarioMany: { en: "scenarios", vi: "tình huống" },
  hearts: { en: "Safety", vi: "An toàn" },
  nearMiss: { en: "Close call!", vi: "Suýt nữa!" },
  bump: { en: "Bump! Be predictable.", vi: "Va chạm! Hãy đi đều." },
  crossHint: {
    en: "Hold W / ↑ to walk steadily · Shift = run · H = raise hand",
    vi: "Giữ W / ↑ để đi đều · Shift = chạy · H = giơ tay",
  },
  crossHintTouch: {
    en: "Push the stick up to walk steadily · Run / Hand buttons",
    vi: "Đẩy cần điều khiển lên để đi đều · Nút Chạy / Giơ tay",
  },
  crossDone: { en: "You made it across!", vi: "Bạn đã qua đường!" },
  crossFail: { en: "Too many bumps… try again calmly.", vi: "Va chạm nhiều quá… bình tĩnh thử lại nhé." },
  walk: { en: "Walk", vi: "Đi" },
  run: { en: "Run", vi: "Chạy" },
  hand: { en: "Hand", vi: "Giơ tay" },
  correct: { en: "Good choice!", vi: "Lựa chọn tốt!" },
  notQuite: { en: "Not quite…", vi: "Chưa đúng lắm…" },
  hmm: { en: "Hmm…", vi: "Hừm…" },
};

let lang = "en";
try {
  const saved = localStorage.getItem("hsa.lang");
  if (LANGS.includes(saved)) lang = saved;
} catch {
  /* storage unavailable (node tests / private mode) */
}

const listeners = new Set();

export function getLang() {
  return lang;
}

export function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  try {
    localStorage.setItem("hsa.lang", next);
  } catch {
    /* ignore */
  }
  for (const fn of listeners) fn(lang);
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Translate a UI key, an inline { en, vi } object, or pass a plain string through. */
export function t(value, vars) {
  let out;
  if (value == null) out = "";
  else if (typeof value === "string") out = ui[value] ? ui[value][lang] : value;
  else out = value[lang] ?? value.en ?? "";
  if (vars) out = out.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
  return out;
}

export const uiStrings = ui;
