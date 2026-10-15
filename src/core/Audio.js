// Tiny WebAudio synth for UI and gameplay blips – no audio files needed.

let ctx;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, dur, { type = "sine", vol = 0.15, slide = 0, delay = 0 } = {}) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.linearRampToValueAtTime(freq + slide, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  honk: () => {
    tone(420, 0.18, { type: "square", vol: 0.05 });
    tone(520, 0.18, { type: "square", vol: 0.04 });
  },
  bump: () => tone(160, 0.25, { type: "triangle", vol: 0.25, slide: -80 }),
  good: () => {
    tone(660, 0.12, { vol: 0.12 });
    tone(990, 0.18, { vol: 0.12, delay: 0.1 });
  },
  bad: () => tone(300, 0.25, { type: "triangle", vol: 0.15, slide: -120 }),
  click: () => tone(880, 0.05, { vol: 0.06 }),
  coin: () => {
    tone(1200, 0.08, { type: "square", vol: 0.04 });
    tone(1600, 0.12, { type: "square", vol: 0.04, delay: 0.06 });
  },
  print: () => {
    for (let i = 0; i < 6; i++) tone(200 + i * 15, 0.05, { type: "sawtooth", vol: 0.03, delay: i * 0.06 });
  },
};
