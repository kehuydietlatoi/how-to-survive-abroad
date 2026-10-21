# Browser playthroughs

From the repository root, run `npm run e2e`. The suite starts and stops its own
Vite server on an available localhost port and runs all six scenarios serially
in full Chromium's headless mode at 1280×720, using its hardware WebGL support.
No separately running dev server is needed.
`npm test` still runs only `tests/*.test.js` and never launches a browser.

Playwright is pinned to **1.64.1**, whose Chromium and headless-shell revision
**1248** matches the development machine's cache. On a fresh machine, run
`npx playwright install chromium` once (Linux CI may need
`npx playwright install --with-deps chromium`). Node 22 or newer is recommended.

Environment flags (set them before invoking the npm script):

- `E2E_ONLY=germany-trash`: run one scenario; other scenarios are skipped. IDs
  are listed in `driver.mjs`; unknown IDs fail immediately.
- `E2E_SHOTS=0`: skip all screenshots, including optional extras; keep JSON logs.
- `E2E_EXTRAS=1`: additionally capture a 390×844 viewport and Vietnamese UI for
  each selected scenario. These are layout/language samples, not mobile input tests.

For example, in PowerShell:

```powershell
$env:E2E_ONLY = 'germany-trash'
npm run e2e
Remove-Item Env:E2E_ONLY
```

Each run replaces that scenario's generated PNGs and `log.json` in
`playtest/out/<scenarioId>/` (gitignored). Other scenarios' artifacts are retained.
Outputs include a screenshot for every observed step, up to five additional
frames during each minigame, three free-roam spawn frames, the result screen,
and a failure screenshot if applicable. The JSON records step IDs/types,
wall-clock duration, average rendered FPS, choices, stuck/teleport events,
browser console warnings/errors, uncaught page errors, transient input retries, camera/player positions
at spawn, screenshot filenames, and final stars/score/max score. A failed run
also records its exception. Logs are checkpointed after every step and at cleanup,
so an interrupted run retains its completed steps. The graphics renderer is logged.
FPS includes screenshot overhead and depends on the host GPU; it is diagnostic,
not a performance threshold.

The reusable `startDriver()` owns Vite/Chromium. `Playthrough` exposes
`openScenario()`, `waitForScene()`, `currentStep()`, `walkToward()`, `pressE()`,
`answerChoice()` (including optional `wrongFirst`), `minigameInput()`, `play()`,
and `close()`. Steps have a 240-second wall-clock limit and each scenario has
a 10-minute suite limit. The driver reads positions through `window.__hsa`,
holds WASD toward the target, and presses E once the target is nearest. After
four seconds without meaningful progress toward the target it records a
`stuck` event, calls `scene.teleport`, and records a `teleport` event. Thus a
passing run with teleports proves scenario progression but warrants reviewing
the route before claiming collision-free navigation.

Choices prefer correct options. Minigames use their visible controls and input:
ticket language/zone/adult/card buttons, shuffled item names mapped to sort
zones, call-board number recognition, Pho eating buttons, Grab ride cues,
steady W+H crossing, deposit definitions mapped to insert/keep buttons, and
checkout tray items mapped to safe destinations. The driver never changes
runner progress, score, minigame completion flags, or synthesizes success.

Known scenario blockers: none. All six scenarios reached their result screens
in the verified full run (about four minutes with screenshots and both extras
on this GPU). Both required `hverify` checks passed; no cases are marked `todo`.
If a future game blocker appears, document its scenario/step here and mark that
case `todo`; do not weaken assertions or modify game code to hide failures.
