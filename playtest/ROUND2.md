# Playtest round 2: check of the round-1 backlog

Run: `E2E_EXTRAS=1 npm run e2e`. All 6 scenarios passed with the stricter gates (0 stuck/teleport events,
≥ 4 moving NPCs). Screenshots and logs are in `playtest/out/<scenario>/`. Criteria come from REPORT.md §5.

## Log summary

| Scenario | Stars / score | Stuck | Moving NPCs (10 s) | Moving vehicles | Lowest step FPS | Console errors |
|---|---|---|---|---|---|---|
| germany-airport-to-home | 3★ 165/165 | 0 | 16 / 35 | 11 / 11 | 58 (toHbf) | 0 |
| vietnam-cross-street-pho | 3★ 235/250 | 0 | 8 / 14 | 0 / 0 | 45 (intro) | 0 |
| vietnam-grab-ride | 3★ 160/160 | 0 | 10 / 20 | 8 / 8 | 36 (xeOm) | 0 |
| germany-trash | 3★ 130/130 | 0 | 9 / 10 | 11 / 11 | 59 | 0 |
| germany-anmeldung | 3★ 230/230 | 0 | 12 / 24 | 11 / 11 | 58 (toOffice, end) | 0 |
| germany-supermarket | 3★ 250/250 | 0 | 5 / 10 | 0 / 0 | 53 (bon) | 0 |

The life sample is taken in the first roaming step, at the spawn.

## Backlog items

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Walking pedestrians | **Pass** | `log.life.movingNpcs` ≥ 4 on every map (5–16, see table). Walkers use the walk animation in `spawn-1.png` of pho, trash and supermarket. Pho is 8: it showed 3–4 under the first start-to-end distance sample, because walkers pause at waypoints or loop back. The sample now keeps the largest distance from the start across 0.5 s reads. |
| 2 | Ambient street traffic | **Partial pass** | Vehicles move in grab (8), airport (11), trash (11) and anmeldung (11). The pho spawn shows moving bikes in `spawn-1.png`, but those belong to the crossing sim, not `map.traffic`, so `movingVehicles` is 0 there. |
| 3 | Vietnam vehicle pack | **Pass** | pho `spawn-1.png`: loaded scooter, bicycle with goods, quang gánh vendor, vendor cart. grab `spawn-1.png`: green Hanoi bus, cream taxi, cargo bicycle. No `cars/taxi` is visible in Hanoi frames. |
| 4 | German vehicle pack | **Pass** | airport Hbf has a tram, cars, a taxi, a parcel van and bikes, with 11/11 moving. trash `spawn-1.png` shows a moving scooter. `12-boardBus.png` shows the tram crossing the frame. |
| 5 | Street variety | **Pass** | airport `15-findHome.png` (half-timbered house, Litfaßsäule) differs from trash `spawn-1.png` (suburban houses and fences). The Hanoi pho row (`spawn-1.png`) and grab lakeside (`5-findDriver.png`) also differ. |
| 6 | Lower camera, ≤ 15 % bare ground | **Partial pass** | Facades fill the pho and trash spawn frames. The anmeldung `spawn-1.png` and supermarket `spawn-1.png` still show about 25–30 % plain floor and pavement. |
| 7 | Landmarks | **Pass** | grab `5-findDriver.png` shows the lake and the red bridge. `10-getOff.png` shows the Văn Miếu gate. |
| 9 | Sort scoring | **Pass** | trash 130/130 and anmeldung 230/230 with the all-correct bot. |
| 10 | Navigation traps | **Pass** | 0 `stuck` events in toPlatform and toPfand; 0 stuck in all 6 runs. The gate now fails on any stuck or teleport. |
| 11 | Cables not over the player | **Pass** | pho `4-cross-minigame-4.png` shows the player unobstructed. The cables stay above the facades. |
| 15 | Ambient motion and evening lanterns | **Partial** | Wheel spin and swinging laundry use `userData.update` in the Hanoi props; the screenshots cannot show motion. No evening map with lit lanterns was seen in these frames, so that part is unverified. |
| 17 | Live language switch | **Not verified** | e2e only takes an isolated Vietnamese sample (`extra-vietnamese.png`). No test toggles the language mid-dialog. |
| 18 | No step below 55 FPS | **Fail** | xeOm 36, pho intro 45, pho howCross 49, pho order 53, supermarket bon 53. |
| 19 | Favicon, 0 console errors | **Pass** | `index.html` links `/favicon.svg`; 0 console errors in all 6 logs. |

## New problems seen

- **Tram blocks the Hbf view.** The tram lane (z = 0.6) runs between the camera and the player. In `12-boardBus.png` the frame is filled by the tram roof and windows. The tram should use a lane north of the player or join the cut-away.
- **Hbf spawn faces a wall.** In `11-findBus.png` the entrance glass (a solid blue box) fills the upper half of the frame behind the player.
- **Zone C sign blocks the player.** In `15-findHome.png` the bus-stop sign sits on top of the player at the home spawn.
- **Supermarket clutter.** The "Eingang" header board hides the shelf signs behind it (`spawn-1.png`). The opening-hours sign stands inside the entrance.
- **Anmeldung hall.** The foreground has a pale translucent band (glass front) across the lower third, and most of the floor is still bare.
- **Arrivals crowd bunches.** At spawn, crowd wanderers clump around the player and the info desk (`spawn-1.png`). They have no colliders, so they overlap.
