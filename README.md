# How To Survive Abroad

A cute 3D browser game (Three.js + Vite) that lets newcomers **practise everyday life in a new country** before they land.
Every scenario mixes three kinds of play:

| Part | What it is | Example |
| --- | --- | --- |
| **Sandbox** | Walk around a fixed map, interact with objects/people | Find the ticket machine, the right platform, your bus stop |
| **Multiple choice** | A decision with instant feedback + a "survival tip" | "Your ticket says *Bitte entwerten* — what now?" |
| **Mini-game** | A short skill moment | Buy a ticket at a German machine · cross a Hanoi street full of motorbikes |

At the end you get stars and a **survival journal** with every tip you learned (✅ done right / ⚠️ to remember).
All text is available in **English and Vietnamese** (toggle on the menu or with the EN/VI chip in game).

## Scenarios

- 🇩🇪 **Germany: from the airport to your new home**: info desk → ticket machine (language, fare zone, adult/child, a €50 note the machine refuses) → stamp the ticket → pick the right S8 direction from the departure board → ticket inspection (€60 fine if invalid/unstamped) → find bus 34 → board → press STOP → find Lindenstraße 12.
- 🇻🇳 **Vietnam: cross the street & eat phở**: walk the Old Quarter sidewalk → choose how to cross → **street-crossing mini-game** → sit at the phở stall → order → **phở eating mini-game** (taste, season with lime/chili/vinegar/herbs/quẩy, eat with chopsticks & spoon, trà đá when too spicy) → call "Em ơi!", pay after eating, judge a fair price.
- 🇻🇳 **Vietnam: your first Grab bike ride**: turn down an overpriced street xe ôm → book GrabBike → find your driver among look-alike plates → fasten the helmet → get on from the left (hot exhaust!) → **3D passenger ride mini-game** through Hanoi traffic (lean with the driver, hold on when braking, knees in through tight gaps) → get off, pay, rate.

- 🇩🇪 **Germany: Saturday at the supermarket**: Sunday closing → €1 cart lock → **3D Pfandautomat** (feed deposit bottles/cans, keep wine bottles, jars and cartons aside, crushed cans get rejected, print the Bon) → bags cost money → hand over the Bon → **checkout race** (keep up with the cashier: fragile on top, the rest in the cart, then pay) → pack at the Packtisch.
- 🇩🇪 **Germany: Mülltrennung**: **drag-and-sort** 14 tricky items into yellow / paper / organic / general / glass (receipts, greasy pizza boxes, Tetra Paks, broken glasses…) → glass-bank hours → blue bottles go in green → what to do with a Pfand bottle.
- 🇩🇪 **Germany: Anmeldung at the Bürgeramt**: book the free appointment (avoid paid resellers) → **pack the right documents** → check in for a number → **call-board mini-game** (react only to your number, look-alikes included) → find Platz 4 → greet in German → Meldebescheinigung, Steuer-ID by post, name on the mailbox.

The menu is a **spinning globe** (`src/ui/Globe.js`, dotted land built from Natural Earth data): drag to spin, tap a country pin (or its chip) to list that country's scenarios first, the rest below. Countries live in `content/countries.js`.

**Around the world** (each ~5–7 min, EN + VI, facts checked and recorded in the header of every `scenario.js`):

- 🇯🇵 **Japan: Tokyo rush hour**: IC-card gate → door-mark queue → **"OK on a Tokyo train?" swipe-judge** → no public bins → lost wallet at the kōban.
- 🇰🇷 **South Korea: Hoesik BBQ dinner**: seats, eldest eats first → **grill minigame** (flip pork, serve golden, pour the boss's soju with two hands) → soju etiquette → declining the second round → no tipping.
- 🇹🇭 **Thailand: Grand Palace**: dodge the "palace is closed" tuk-tuk scam → **temple wardrobe sort game** → feet, monks, the royal anthem.
- 🇮🇳 **India: Delhi auto-rickshaw**: "meter kharab" → **haggle minigame** → cow in the road → chai, UPI/cash, right hand, the head wobble.
- 🇺🇸 **USA: roadside diner**: wait to be seated → price + tax + tip → **"tip expected or optional?" swipe-judge** → boxes, 911 and insurance.
- 🇬🇧 **UK: London**: queue → cashless bus → Tube touch in/out + escalator → pub bar ordering, rounds, Challenge 25 → **"what the British really mean" swipe-judge**.
- 🇫🇷 **France: Paris**: "bonjour" → carafe d'eau → service compris → la bise → **Sacré-Cœur steps lane-dodger** past bracelet hustlers and pigeons.
- 🇮🇹 **Italy: Rome espresso bar**: cassa first, banco vs tavolo → **coffee-clock sort game** → coperto → validate your bus ticket.
- 🇳🇱 **Netherlands: Amsterdam bike**: don't buy the hot bike → two locks → stay off the red lane → lights, phone, tram rails, priority from the right → **fietspad lane-dodger** (ring your bell!).
- 🇦🇺 **Australia: Sydney beach**: Slip-Slop-Slap → between the flags → **swim lane-dodger** → rip current, bluebottle sting, drop bears, 000.

Wrong answers in choices must be re-picked until an acceptable one is chosen; the score and journal keep the first pick.

The street-crossing traffic is a small simulation: riders steer around where they **predict** you will be, so walking slowly and steadily is safe, while sprinting, stopping suddenly or stepping back causes bumps. `node scripts/tune-crossing.mjs` prints the balance (steady ≈ 99, sprint ≈ 80, stop ≈ 83, step back ≈ 52 average score).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # scenario logic, content checks (EN/VI parity), collision, traffic balance
npm run build      # static site in dist/ (≈ 4 MB of models)
```

Controls: **WASD / arrows** move · **Shift** run · **E** interact / continue · **1–4** pick an answer · **R** route card · **H** raise hand (crossing) · **Esc** menu. On touch devices a joystick and buttons appear.

Dev shortcuts: `?play=vietnam-cross-street-pho` starts a scenario directly; `&step=<stepId>` jumps to a step (e.g. `?play=germany-airport-to-home&step=findBus`).

## How it is built

```
content/                     scenario data (no engine code)
  index.js                   menu registry: title, colours, which minigames each scenario uses
  germany/airport-to-home/   map.js (what stands where) + scenario.js (the steps)
  vietnam/cross-street-pho/
src/
  core/      Game (renderer, light, follow camera), Input, Assets (GLB loader + toon look), Collision, Audio (synth blips)
  world/     World (builds a map, interactables, floating labels, cut-away fading), Character, props (procedural props)
  scenario/  ScenarioRunner (pure state machine, unit tested), ScenarioScene (glues runner ↔ world ↔ UI)
  minigames/ StreetCrossing (+ crossingSim, pure & tested), TicketMachine, PhoEating, GrabRide, SortGame, CallBoard, …
             reusable engines with pure, tested logic: SwipeJudge (swipeLogic), DodgeLane (laneLogic), Haggle (haggleLogic), Grill (grillLogic)
  ui/        dialogs, choices, HUD, toasts, result screen
  i18n/      UI strings + t() for inline { en, vi } text
```

### Adding a scenario (e.g. "Japan: take out the trash")

1. `content/japan/trash-day/map.js`: list `items` (kit models, procedural `prop`s, `npc`s), `walls`, `spawns` and `interactables`.
2. `content/japan/trash-day/scenario.js`: a list of steps: `info`, `sandbox` (target + optional wrong targets), `choice` (options with points/feedback/tip/flags), `minigame`, `travel`, `end`. Steps can branch with `nextIf` on flags and run small `onEnter` actions (`visible`, `move`, `anim`, `focus`, `teleport`…).
3. Register it in `content/index.js`. `npm test` automatically checks the step graph, the map ids and that every text has `en` and `vi`.

Put a "facts checked" comment at the top of each scenario. The game must not teach wrong rules.

## Art & assets

See [ASSETS.md](ASSETS.md). In short: free CC0 Kenney kits for characters/roads/houses/cars, procedural code props for country-specific objects (ticket machine, validator, S-Bahn, bus, motorbikes, phở stall…), and one shared toon material so everything looks consistent. Blender MCP is the planned next step for upgrading those procedural props.
