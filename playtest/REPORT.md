# Playtest report: How To Survive Abroad (6 scenarios)

**Run:** `E2E_EXTRAS=1 npm run e2e`, 2026-10-21, all 6 passed (242 s total), Chromium with ANGLE on an RTX 3060, 1280×720 plus a 390×844 sample and a Vietnamese UI sample.
**Evidence:** `playtest/out/<id>/log.json` and the screenshots, plus a read of every map, scenario and prop file.
**Limits, stated up front:**
- I did not write extra ad-hoc scripts for free walking or deliberate bad play. That part of the brief is **not done**.
- I reviewed a sample of about 10 screenshots, not all of them.
- Step times come from a bot that answers in about 0.4 s. Real reading time is my estimate and is marked "~human".
- FPS is the logged average and includes screenshot overhead.

## 1. TL;DR: the 5 biggest problems

1. **The maps are flat and empty.** Each map is one straight road strip, sidewalk slabs, and a row of boxes facing it. At the default camera, 30–40 % of the screen is plain beige or green ground (`spawn-1.png` in pho, grab and airport). Nobody walks anywhere. Every NPC is a statue playing an idle animation in place (`World.js` has no NPC movement; the "walk" NPCs in trash and supermarket walk on the spot).
2. **The streets all look alike.**
   - Both Hanoi maps use the same `tubeHouse` box in the same 8-colour palette, the same `road-straight` tile, the same 5.2 m `#e9dcc6` sidewalk and the same 4.5 m spacing.
   - All three German street maps share one `lindenstrasse()` block of three Kenney houses (`content/germany/lindenstrasse.js`). Airport-to-home rebuilds the same block by hand.
   - The only Kenney kits are `roads/road-straight`, 3 suburban houses, a fence, 2 trees, a taxi and a sedan.
3. **There is no vehicle variety and no Vietnamese vehicles in the walkable world.**
   - The only Vietnamese vehicle is one procedural `motorbike`, repeated in different colours.
   - No xích lô, no bicycle with goods, no street vendor cart on wheels, no bus.
   - The Hanoi ride uses a yellow Kenney NYC-style `cars/taxi`. Hanoi taxis are white or green (Mai Linh, Xanh SM).
   - Germany has no tram, no bikes and no delivery van.
   - A `rickshaw` and a `bicycle` already exist in `propsWorld.js` but are unused.
4. **The scenarios are mostly quizzes with a little walking.** Of 77 logged steps, only 14 are sandbox walks and 9 minigames. The rest are choice, info, travel and end screens.
   - The sandbox walks are 1–8 s straight lines to a pulsing marker.
   - Nothing rewards exploring. There are no optional NPCs with content except one per map, no secrets and no side tips.
   - Built locations are wasted:
     - The Văn Miếu arrival exists only for a 1.7 s fade and one choice, and the temple gate is not in frame (`10-getOff.png` shows bare asphalt).
     - The Anmeldung Lindenstraße start is never walked; the first roaming frame is already in the hall.
4b. **Ambience is silent and the camera is too high.**
   - The only sound is synth blips (`src/core/Audio.js`). There is no traffic hum, no honks while walking, no market chatter and no S-Bahn sounds.
   - The 12 m high camera (`Game.js camBase (0,12,10)`) points almost straight down. Characters read as heads and buildings as roofs. The cut-away fades the whole near-side row of houses, so the street never frames the player.
5. **Readability glitches.**
   - Overhead cables (`cableTangle`) draw across the player during the crossing (`4-cross-minigame-4.png`).
   - Plate tags overlap at the screen edge.
   - The player is often shown half-transparent or dark against the asphalt.
   - The bot got stuck twice where a new player will too: `toPlatform` and `toPfand` (details per scenario below).

## 2. Scenarios

Pacing is per step from `log.json`, bot seconds. Choice and info steps take ~human 5–15 s to read.

### vietnam-cross-street-pho: Fun 6/10 · Visuals/map 5/10 · Clarity 7/10
- **Result:** 2★, 205/250, 32.9 s bot (~human 3–4 min).
- **Steps:**
  - intro 0.5
  - toKerb 5.6
  - howCross 0.5
  - cross 9.2 (minigame)
  - toStall 1.0
  - order 0.8 (FPS 39, the scene swap)
  - eat 12.9 (minigame)
  - callStaff / pay / price 0.5 each
  - outro 0.4
- **What works:**
  - The crossing minigame is the best idea in the game: traffic that predicts your path, three hearts, H to raise a hand.
  - The phở close-up (`7-eat-minigame-3.png`) is the prettiest screen in the game, with its bowl, quẩy, lime, chili, herbs and trà đá.
  - The cultural content (em ơi, tái/chín, the blue 20k vs 500k notes) is accurate and useful.
- **What's boring:**
  - toKerb is a 6 s walk down an empty sidewalk.
  - After the crossing you sit at once. The second sandbox step (toStall) takes 1 s, so there is no street to explore.
  - The last three steps are back-to-back quiz cards with no world interaction. Paying is a menu choice, not walking to Cô Hoa.
- **Bugs and glitches:**
  - `cross`: the `cableTangle` at z = −5.6 is drawn over the player and riders mid-road (`4-cross-minigame-4.png`). The player sprite is darkened and partly transparent under it.
  - The bottom ~35 % of the frame is empty sand-coloured ground (`spawn-1.png`), because the south tube houses fade out.
  - `order`: FPS drops to 39 (log), a one-off hitch on teleport, sit pose and bowl reveal.
  - 2★ with a "correct" bot is a driver limit, not a bug: the bot only presses Taste and then Eat in `eat`. But the game does not tell a player who skips seasoning why they lost points until the result screen.
- **Minigame feel:**
  - Crossing: holding W is all it takes to pass. It is too easy if you follow the advice and gives no sense of danger. The bikes are all one model.
  - Phở: tactile and charming, but it is a button row. Clicking the table objects directly should be the primary input.

### vietnam-grab-ride: Fun 7/10 · Visuals/map 5/10 (ride 7, street 4) · Clarity 7/10
- **Result:** 3★, 160/160, 51.7 s bot.
- **Steps:**
  - intro / xeOm / service / booked: 0.4–0.6 each
  - findDriver 5.1
  - helmet 0.4
  - getOn 0.5 (FPS 42)
  - ride 40.4 (minigame)
  - arrive 1.7
  - getOff / pay / outro: about 0.5 each
- **What works:**
  - The ride (`8-ride-minigame-4.png`) is the most "game-like" moment: a third-person camera, a curving road, cue bubbles ("HOLD ON! Driver brakes") and lean, hold and knee buttons.
  - The plate look-alikes (29B1-243.56 / 29H1-234.56 / 29B1-234.65) are a clever perception test.
- **What's boring:**
  - Four choice cards in a row before you can move.
  - The ride is 40 s of a mostly empty pastel corridor:
    - The building fronts are blank-window boxes with tiny unreadable signs.
    - The traffic is 14 identical bikes.
    - The obstacles are one bus, one taxi, one bike cutting in, a pedestrian and a red light.
  - The ride has no Hanoi landmarks (no Hoàn Kiếm, no Hỏa Lò, no train street).
- **Bugs and glitches:**
  - `findDriver`: at spawn only 2 of the 4 plate tags are on screen, and the right one is clipped at the edge (`spawn-1.png`). The hotel, lake and red Thê Húc bridge are all out of frame or faded, so the "Hoàn Kiếm lakeside" is invisible.
  - `getOff`: the camera focuses on the arrived bike, and the Văn Miếu `templeGate` (z = −14) is off-screen. The arrival shows grey road and beige ground (`10-getOff.png`).
  - `arrive`: the travel overlay still shows the start street (`9-arrive.png`), so the scene swap happens under the fade, as intended. But no arrival shot is ever shown.
  - `getOn`: FPS dips to 42 while the minigame scene is built (`GrabRide` awaits character loads in a loop).
  - The helmet is still on in `getOff`/`pay`. That is fine, but "give back the helmet" is never shown.
  - The ride uses `cars/taxi`, a yellow US-style taxi that is wrong for Hanoi.
- **Minigame feel:**
  - Responsive and readable, and the cues are fair.
  - It never gets hard. There are no combo cues, no rain and no rush-hour section.
  - The keyboard hint says "Space hold on". Check that W and Space are both documented consistently.

### germany-airport-to-home: Fun 6/10 · Visuals/map 4/10 · Clarity 7/10
- **Result:** 3★, 165/165, 34.3 s bot (~human 5–6 min).
- **Steps:**
  - intro 0.6
  - findMachine 7.9
  - buy 3.7 (minigame)
  - stampChoice 0.4
  - stamp 0.5
  - toPlatform 5.2 (stuck plus teleport)
  - ride 2.4 (travel)
  - inspection / checkOk: about 0.4
  - toHbf 2.2
  - findBus 1.7
  - boardBus 2.7
  - stopButton 0.4
  - toHome 2.2
  - findHome 2.9
  - welcome 0.4
- **What works:**
  - The best scenario structure: a real journey with four zones.
  - The departure-board direction trap (S8 to Hauptbahnhof vs S8 to Rheinhafen) and the "Außer Betrieb" machine are good, real-world gotchas.
  - The ticket machine minigame teaches language, zone, adult and payment.
- **What's boring:**
  - The arrivals hall is a huge empty cream floor (`spawn-1.png`): one desk, two benches, three static NPCs. There are no luggage trolleys, no crowd, no shops and no flight board.
  - The S-Bahn interior is skipped through in a choice card.
  - The bus ride is a choice card plus a fade. You never see the bus drive.
- **Bugs and glitches:**
  - `toPlatform`: the log shows `stuck` at (3.15, −7.45), 10.1 m from `train1Door` [2.0, −17.5], then a teleport.
    - The platform-edge walls at x = ±2.2…2.3 start at z = −8, and the Gleis 1 door sits 0.2 m from the edge wall.
    - Coming straight from the validator (x = 2.6) puts the player on the wrong side of the edge.
    - Nothing on the floor shows the 4.4 m opening.
  - The airport's south glass wall and arrival gate fade, which leaves a translucent rectangle floating in the foreground (`spawn-1.png` bottom).
  - The S-Bahn platform is only visible after walking north. From the hall, nothing hints at where to go except a small green sign.
- **Minigame feel:** The ticket machine is a 4-click form. It is functional, but it could have time pressure (the train leaves at 14:32) and the €50 note refusal could be felt more.

### germany-trash: Fun 5/10 · Visuals/map 4/10 · Clarity 7/10
- **Result:** 2★, 87/130, 20.2 s bot. This is the shortest scenario.
- **Steps:**
  - intro 0.6
  - toBins 3.7
  - sort 10.4 (minigame)
  - glassTime 0.4
  - monday 2.2 (travel)
  - toGlass 1.4
  - blueBottle 0.4
  - pfandBottle 0.4
  - outro 0.4
- **What works:**
  - The 14 tricky items (greasy pizza box, receipt, Tetra Pak, broken drinking glass) are genuinely useful knowledge.
  - The bin colours are readable.
- **What's boring:**
  - The "world" is 4 bins and 3 glass containers 11 m apart. The two walks take 3.7 s and 1.4 s.
  - The sort minigame is a card plus 5 buttons. Dragging into the actual 3D bins would make it a game.
  - The neighbour NPC (`character-male-f`, anim "walk") walks on the spot forever.
- **Bugs and glitches:**
  - A bot that maps every card to its defined zone got only 87/130 (2★). Either multi-zone items score only one accepted zone, or speed or penalties apply that a player is never told about. **Not diagnosed. Check `SortGame.js` scoring before shipping.**
  - The "monday" travel only teleports 12 m down the same street.
- **Minigame feel:** Quick and clear, but flat. There is no consequence animation (lid opening, item flying in) and no neighbour reaction.

### germany-anmeldung: Fun 6/10 · Visuals/map 5/10 · Clarity 7/10
- **Result:** 3★, 197/230, 44.4 s bot.
- **Steps:**
  - intro 0.6
  - booking 0.5
  - pack 6.9 (sort minigame)
  - toOffice 2.2
  - checkIn 4.6
  - wait 21.5 (call board)
  - toCounter 6.6
  - greet 0.4
  - certificate 0.4
  - mailbox 0.4
- **What works:**
  - The call-board minigame (react only to A-117, with look-alikes) mirrors the real Bürgeramt tension well.
  - The hall with 6 counters, chairs and a number board is the most believable German interior.
- **What's boring:**
  - The `wait` minigame is 21.5 s of watching numbers. That is accurate, but it is the longest dead time in the German set with nothing else to do (no people-watching, no form to fill in).
  - The Lindenstraße start is never walked. The scenario goes from a card to the pack minigame to the hall.
  - `pack` reuses SortGame, which is the same UI as the trash scenario.
- **Bugs and glitches:**
  - 197/230 for a correct bot. The `pack` (sort) scoring seems to lose points the same way as in trash; see above.
  - The clerks are 6 static NPCs and nobody walks to or from a counter when a number is called.
- **Minigame feel:** The call board is good. Add an audible "ding" and moving people.

### germany-supermarket: Fun 7/10 · Visuals/map 5/10 · Clarity 6/10
- **Result:** 3★, 239/250, 50.9 s bot.
- **Steps:**
  - intro 0.7
  - whenShop 0.5
  - toCarts 4.4
  - coinLock 0.4
  - toPfand 7.1 (stuck plus teleport)
  - pfandGame 14.2 (minigame)
  - shop 3.0
  - toCheckout 3.4
  - bag / bon: 0.4 each
  - race 15.3 (minigame)
  - packing 0.4
  - outro 0.4
- **What works:**
  - Two different minigames: the 3D Pfandautomat and the checkout race.
  - The checkout race delivers the "German cashier speed" joke as gameplay. This is the best-paced scenario.
- **What's boring:**
  - The "shop" step is walking to one shelf and pressing E. You never pick groceries.
  - The store has 3 shelves and one checkout.
- **Bugs and glitches:**
  - `toPfand`: the log shows `stuck` 3.7 m from the Pfandautomat, then a teleport. The front wall is split at x = ±2 (a 4 m door) at z = 2, and the Pfand corner is behind the left wall half.
    - The door is not marked: no mat, no opening sliding doors.
    - The FRISCHMARKT sign wall fades with the cut-away, so the entrance becomes even less readable.
  - The cart is never shown with the player after the coin-lock step: no cart prop follows you.
- **Minigame feel:** Pfand is good because of its physicality (crushed cans rejected). Checkout is fun and the right length.

## 3. 3D maps and environment (cross-cutting)

**Empty and flat.**
- Every map is a ground plane plus slabs at height 0.05–0.16.
- There are no kerbs with height or texture, no road markings except the Kenney tile, and no puddles, litter, manhole covers, shop awnings with depth, or plants on balconies.
- The large ground planes (`grounds` 80 × 50 to 140 × 60) are a single colour and fill a third of every frame.

**Repetitive streets (the user's complaint is correct).**
- Hanoi Old Quarter and Hoàn Kiếm are the same street: identical `tubeHouse(color, floors 2–4, 4.4, sign)` rows, 4.5–4.6 m apart, with the same palette array copied verbatim into both maps.
- The only differences are a blue lake slab and a red bridge, which are off-screen at spawn.
- In Germany, `lindenstrasse.js` (3 Kenney houses, 2 fences, 2 trees) is the street in trash and anmeldung and is hand-copied into airport-to-home zone C.
- The Hauptbahnhof is one 34 × 6 × 9 box with a sign.

**Sense of place and landmarks.** Weak.

| Scenario | Landmark today | Problem |
| --- | --- | --- |
| Hanoi pho / grab | Lanterns, cables, plastic stools, phở stall | The best of the set |
| Hoàn Kiếm | Lake and Thê Húc bridge | Not visible during play |
| Văn Miếu | Gate | Never in frame |
| Germany | Generic | No half-timbered or Altbau facades, no Litfaßsäule, no Späti, no bike lanes, no Pfand bottles by bins, no tram wires, no DB red |

**Aliveness.**
- The only moving traffic in walkable maps is the crossing sim in the phở map (from the `ambient()` hook). It is not in the Grab map, which is the same kind of street.
- There are no walking pedestrians anywhere. NPCs idle in place, and "walk"-animated NPCs moonwalk without moving.
- No ambient motion: no flags, steam from the phở pot, swaying lanterns, birds or leaves.
- No ambient sound at all. `Audio.js` has 7 synth blips.

**Vehicle variety.**

| Have today | Missing, Vietnam | Missing, Germany |
| --- | --- | --- |
| `motorbike` (one shape, coloured), `parkedBikes`, `cityBus` (procedural, reused as Hanoi bus "09"), `sbahnTrain`, Kenney `cars/taxi` and `cars/sedan`, unused `rickshaw` and `bicycle` in `propsWorld.js` | **xích lô** (cyclo, passenger in front), bicycle loaded with goods or flowers (xe đạp chở hàng), mobile vendor cart and quang gánh (shoulder pole), scooter with a stacked load, Hanoi bus (green-yellow), white/green taxi (Mai Linh / Xanh SM), Grab-green jacket rider variant, electric VinFast scooter | Tram (Straßenbahn) with overhead wires, cyclists and bike racks, DHL/Post delivery van (yellow), Müllabfuhr truck (orange, ideal for the trash scenario), ICE/regional train variant, taxi in German cream/beige |

**Camera.**
- `camBase (0,12,10)` is nearly top-down at 45° FOV.
- It is good for navigation, but it hides facades, so all the art budget in tube houses is spent on roofs.
- There is no camera rotation or zoom.
- Recommended: a lower pitch (about y 8, z 11), a slight look-ahead, and per-map overrides.

**Lighting and colour.**
- Pleasant toon pastel, and consistent.
- It is also identical everywhere: Hanoi has a warmer sky `#ffe7c2`, but the same sun, the same hemisphere light and no time of day.
- No evening lanterns glow and there is no rain.
- The shadows are soft and work.

**Prop reuse.** Sensible as code, but visibly repetitive:
- `tree()` is one cone tree used in both countries.
- `plant()`, `bench()` and `wall()` are boxes.

**Inventory: Kenney kits today** (`public/assets/kits`):

| Folder | Contents |
| --- | --- |
| `characters` | 12 mini characters |
| `roads` | road-straight only |
| `suburban` | building-type-a/c/f, fence-1x4, tree-large/small |
| `cars` | taxi, sedan |

**Missing kits:**
- road crossing, intersection and kerb tiles from City Kit Roads
- City Kit Commercial (shop fronts; `World.js` already has `commercial` in `COLLIDE_KITS`)
- more Car Kit models: van, delivery truck, bus, police
- Furniture Kit for interiors
- Food Kit for the market and supermarket

**Procedural props in `props.js`:**
- signBoard, signPost, ticketMachine, validator, busStopSign, busShelter, departureBoard
- sbahnTrain, cityBus, infoDesk, suitcase, bench, plant, tree, lamp, arrivalGate
- motorbike, plasticStool, lowTable, phoBowl, phoStall, cableTangle, utilityPole, lanternString
- tubeHouse, vendorCart (static), parkedBikes, ground, slab, shopFront, grabHelmet, trafficLight, templeGate
- wheelieBin, glassContainer, building, shelf, checkoutCounter, pfandAutomat, cartRow, numberBoard
- serviceCounter, chairs, ticketTerminal, wall, track, trainInterior

**In `propsWorld.js`, unused:**
- ticketGate, vendingMachine, grillTable, lowStool, sojuBottle, rickshaw, cow, thaiTemple, buddhaShrine
- phoneBox, barCounter, dinerBooth, cafeTable, bicycle, bakery, espressoBar, cashRegister, sacreCoeur
- beach flag, tower, umbrella, towel and surfboard

## 4. Controls, UI/HUD, text, mobile, performance

- **Controls.**
  - WASD and E are fine.
  - Choices can be answered with 1–4.
  - Walking has no run feedback.
  - Interactables use a pulsing ring plus a bouncing cone. The ring is hard to see on the light sidewalk.
  - `hideMarker` steps (findDriver, toPlatform, findBus) are fine by design, but they need better landmarks to compensate.
- **HUD.**
  - Clean and cute: the objective card top-left, stars, Route, EN, ✕.
  - The objective card overlaps world signage at the top-left. In `6-toPlatform.png` it covers the departure board.
  - The control hint at the bottom-left is tiny.
  - The dialog box covers the lower third of the scene. Acceptable.
- **Text and EN/VI.**
  - EN/VI parity is complete (unit tested). The Vietnamese reads naturally (cháu/em/anh register used correctly).
  - Some EN bubbles mix in German without a gloss on first sight ("Zurückbleiben, bitte!" is glossed only in VI).
  - Known T1 note: switching language in a live scene leaves the current dialog in the old language. That is a bug worth fixing.
- **Mobile (390×844 sample).**
  - The FOV switches to 60 in portrait. The captured `extra-mobile.png` was not reviewed in detail by me, so this is **unverified**.
  - These are layout samples only; touch input was not tested by the suite.
- **Performance.**
  - 57–62 FPS average on every step except two scene builds: `order` 39 FPS (pho) and `getOn` 42 FPS (grab).
  - The only console error is a favicon 404 (every scenario). There are no page errors.
  - Untested on low-end or integrated GPUs. The 2048² PCF soft shadow map and 40 pre-built crossing riders are the likely costs.

## 5. Prioritized backlog

| # | Item | Impact | Effort | Files | Acceptance criterion |
|---|---|---|---|---|---|
| 1 | Ambient walking pedestrians: NPCs with waypoint paths, using the walk anim with real movement and collision avoidance | H | M | `src/world/World.js`, new `src/world/Pedestrians.js`, all `content/*/*/map.js` | Each map has ≥ 4 NPCs whose positions change over 10 s, with no NPC walking on the spot |
| 2 | Ambient street traffic on every street map (reuse the crossing sim view in Grab; add German cars, vans and bikes on Lindenstraße and Hbf) | H | M | `src/minigames/StreetCrossing.js` (extract the ambient part), `content/index.js`, maps | Motor vehicles visibly move in the grab, airport, trash and anmeldung maps while roaming |
| 3 | Vietnam vehicle pack: xích lô, bicycle with goods, quang gánh vendor, loaded scooter, Hanoi bus, white/green taxi; mixed into traffic and parked | H | M | `src/world/props.js` or a new `src/world/propsVietnam.js`, `src/minigames/GrabRide.js`, `StreetCrossing.js`, VN maps | ≥ 5 distinct Vietnamese vehicle types appear in the pho/grab maps and the ride; no `cars/taxi` in Hanoi |
| 4 | German vehicle pack: tram with wires, cyclists and bike racks, yellow delivery van, orange Müllabfuhr truck | M | M | `src/world/props.js`, German maps, `lindenstrasse.js` | Each German street map shows ≥ 3 vehicle types, at least one of them moving |
| 5 | Street variety: per-map facade generators (Old Quarter vs lakeside vs French colonial; Altbau vs suburban) with varied widths, balconies, awnings, signs; stop sharing `houseColors` and copies | H | L | `props.js` (tubeHouse, shopFront), new facade presets, all street maps | No two scenario streets share the same house row pattern; a side-by-side screenshot review tells them apart |
| 6 | Lower, framed camera with per-map overrides and look-ahead; stop fading the whole near row | H | S | `src/core/Game.js`, `src/world/World.js` (occluder rule), map `camera` field | In spawn screenshots, ≤ 15 % of the frame is bare ground and facades are visible |
| 7 | Show landmarks: Hoàn Kiếm lake and bridge in the findDriver framing, and a Văn Miếu arrival shot with the gate in frame | M | S | `content/vietnam/grab-ride/map.js`, `scenario.js` (focus/spawn) | `getOff` and `findDriver` screenshots include the gate and the lake respectively |
| 8 | Ambient audio loops per map (Hanoi honks and chatter, German station announcements, birds) plus spatial honk near bikes | H | M | `src/core/Audio.js`, `ScenarioScene.js`, `public/assets/audio/` (CC0) | Every scenario plays an ambient bed with a volume toggle in the HUD |
| 9 | Investigate the sort scoring: a correct bot gets 87/130 in trash and loses points in anmeldung `pack` | H | S | `src/minigames/SortGame.js`, tests | An all-correct sort run scores max; the result screen explains any deductions |
| 10 | Fix the navigation traps: mark the platform opening and the supermarket door (floor arrows or mat), move `train1Door` away from the edge wall | M | S | `content/germany/airport-to-home/map.js`, `content/germany/supermarket/map.js` | The e2e run has 0 `stuck` events in toPlatform and toPfand |
| 11 | Cable tangle and occluders must not draw over the player during the crossing (raise them or fade them near the camera ray) | M | S | `src/world/props.js` (cableTangle), `content/vietnam/cross-street-pho/map.js` | `cross` minigame frames show the player unobstructed |
| 12 | Turn quiz steps into world actions: walk to Cô Hoa to pay, hand over the helmet, press STOP inside a visible bus, push a cart that follows you | H | L | the scenario.js files, `ScenarioScene.js` | Each scenario has ≥ 3 sandbox or minigame steps; no more than 2 choice cards in a row |
| 13 | Optional exploration content: 2–3 optional NPCs or objects per map giving journal tips | M | M | maps, `ScenarioRunner.js` (optional tips), i18n | Each map has ≥ 2 optional interactables that add a journal entry |
| 14 | Minigame depth: phở clicks on table objects; crossing has a varying gap or density; ride has a rush-hour or rain segment; ticket machine has a departure timer | M | M | `PhoEating.js`, `crossingSim.js`, `rideLogic.js`, `TicketMachine.js` | Playtesters must vary input to get 3★ in each; balance tests are updated |
| 15 | Ambient motion: phở steam, swaying lanterns, flags, leaves, time-of-day lighting per map | M | S | `props.js`, `Game.js`, maps (`light` field) | Hanoi maps have visibly animated props; at least one evening map has lit lanterns |
| 16 | Add Kenney kits: City Kit Commercial, the rest of City Kit Roads (crossings, intersections), more of Car Kit, Furniture Kit, Food Kit | M | S | `public/assets/kits/*`, `src/core/Assets.js` (KIT_SCALE), `ASSETS.md` | New kit folders load and are used in ≥ 3 maps; build size stays below 8 MB |
| 17 | Fix the live language switch so it re-renders the current dialog and objective | M | S | `src/ui/ui.js`, `src/scenario/ScenarioScene.js` | Toggling EN/VI mid-dialog changes the dialog text immediately |
| 18 | Smooth scene-build hitches: preload the minigame scenes and characters before the step | L | S | `src/minigames/GrabRide.js`, `PhoEating.js` | No step drops below 55 FPS average in the e2e log |
| 19 | Add a favicon | L | S | `index.html`, `public/favicon.ico` | The e2e console log has 0 errors |
| 20 | Mobile review: verify touch joystick and button reach on 390×844, and HUD overlap | M | S | `src/ui/ui.js`, CSS, `tests/e2e/driver.mjs` (touch sample) | Manual and e2e touch run completes one scenario on a mobile viewport |
