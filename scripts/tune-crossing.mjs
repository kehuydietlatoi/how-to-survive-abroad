// Headless balance check for the street-crossing minigame: node scripts/tune-crossing.mjs
import { simulate, STRATEGIES } from "../src/minigames/crossingSim.js";
const N = 200;
for (const [name, s] of Object.entries(STRATEGIES)) {
  let pass = 0, hits = 0, near = 0, score = 0;
  for (let seed = 1; seed <= N; seed++) { const r = simulate(s, seed); pass += r.passed; hits += r.hits; near += r.nearMisses; score += r.score; }
  console.log(name.padEnd(11), "pass", (pass/N*100).toFixed(0)+"%", "hits/run", (hits/N).toFixed(2), "near/run", (near/N).toFixed(2), "avgScore", (score/N).toFixed(0));
}
