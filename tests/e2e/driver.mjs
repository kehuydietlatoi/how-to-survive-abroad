import { chromium } from 'playwright';
import { createServer } from 'vite';
import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createSocketServer } from 'node:net';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const SCENARIO_IDS = [
  'germany-airport-to-home', 'vietnam-cross-street-pho', 'vietnam-grab-ride',
  'germany-trash', 'germany-anmeldung', 'germany-supermarket',
];

export async function startDriver() {
  const socket = createSocketServer();
  await new Promise((ok, fail) => { socket.once('error', fail); socket.listen(0, '127.0.0.1', ok); });
  const port = socket.address().port;
  await new Promise((ok, fail) => socket.close(error => error ? fail(error) : ok()));
  const server = await createServer({ root, server: { host: '127.0.0.1', port, strictPort: true, open: false } });
  let browser;
  try {
    await server.listen();
    // Full Chromium's new headless mode supports hardware WebGL. The default
    // headless shell used software rendering here, slowing the game's capped
    // frame delta and stretching a run past the harness deadline.
    browser = await chromium.launch({ channel: 'chromium', headless: true });
    const address = server.httpServer.address();
    return {
      browser, url: `http://127.0.0.1:${address.port}`,
      async close() { try { await browser.close(); } finally { await server.close(); } },
    };
  } catch (error) {
    await browser?.close();
    await server.close();
    throw error;
  }
}

/** Reusable controller: never advances the runner or fabricates a minigame result. */
export class Playthrough {
  constructor(driver, id, { stepTimeout = 240_000, stuckSeconds = 4 } = {}) {
    this.driver = driver;
    this.id = id;
    this.stepTimeout = stepTimeout;
    this.stuckSeconds = stuckSeconds;
    this.out = resolve(root, 'playtest/out', id);
    this.shots = process.env.E2E_SHOTS !== '0';
    this.log = { scenarioId: id, startedAt: new Date().toISOString(), viewport: { width: 1280, height: 720 },
      steps: [], console: [], pageErrors: [], spawnFrames: [], screenshots: [], result: null };
    this.held = new Set();
  }

  async openScenario() {
    if (!SCENARIO_IDS.includes(this.id)) throw new Error(`Unknown scenario: ${this.id}`);
    await mkdir(this.out, { recursive: true });
    // Remove only this scenario's previous generated artifacts, avoiding stale evidence.
    for (const name of await readdir(this.out)) {
      if (name.endsWith('.png') || name === 'log.json') await unlink(resolve(this.out, name));
    }
    this.context = await this.driver.browser.newContext({ viewport: this.log.viewport });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(8000);
    this.page.on('pageerror', error => this.log.pageErrors.push(error.stack || error.message));
    this.page.on('console', message => {
      if (['warning', 'error'].includes(message.type())) this.log.console.push({ type: message.type(), text: message.text(), location: message.location() });
    });
    await this.page.goto(`${this.driver.url}/?play=${this.id}`);
    await this.waitForScene();
    this.log.graphics = await this.page.evaluate(() => {
      const gl = window.__hsa.game.renderer.getContext();
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      return { renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), browser: navigator.userAgent };
    });
    // Count real renderer frames, rather than timer ticks or simulated game dt.
    await this.page.evaluate(() => {
      const renderer = window.__hsa.game.renderer;
      window.__e2eFrames = 0;
      const render = renderer.render.bind(renderer);
      renderer.render = (...args) => { window.__e2eFrames++; return render(...args); };
      window.__e2eVisits = [];
      const observe = () => {
        const step = window.__hsa.scene.runner.current();
        if (window.__e2eVisits.at(-1)?.id !== step.id) {
          window.__e2eVisits.push({ id: step.id, type: step.type, enteredAt: Date.now() });
        }
      };
      observe();
      window.__e2eObserveStep = observe;
      window.__hsa.game.updaters.add(observe);
    });
  }

  async waitForScene() {
    await this.page.waitForFunction(() => window.__hsa?.scene?.runner, null, { timeout: 60_000 });
  }

  async currentStep() {
    return this.page.evaluate(() => {
      const s = window.__hsa.scene;
      const step = s.runner.current();
      const target = step.target && s.world.getInteractable(step.target);
      return { ...step, roaming: s.roaming, targetPosition: target?.p, targetRadius: target?.radius };
    });
  }

  async shot(name, page = this.page) {
    if (!this.shots) return;
    const filename = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    await page.screenshot({ path: resolve(this.out, filename) });
    this.log.screenshots.push(filename);
  }

  async hold(keys = []) {
    const desired = new Set(keys);
    for (const key of this.held) if (!desired.has(key)) await this.page.keyboard.up(key);
    for (const key of desired) if (!this.held.has(key)) await this.page.keyboard.down(key);
    this.held = desired;
  }

  async pressE() { await this.page.keyboard.press('e'); }

  async answerChoice(step, { wrongFirst = false } = {}) {
    const correct = step.options.findIndex(o => o.correct);
    const index = correct >= 0 ? correct : step.options.findIndex(o => o.acceptable || o.points >= 5);
    if (index < 0) throw new Error(`No acceptable choice: ${step.id}`);
    const picks = [];
    if (wrongFirst) {
      const wrong = step.options.findIndex(o => !o.correct && !o.acceptable && !(o.points >= 5));
      if (wrong >= 0) picks.push(wrong);
    }
    picks.push(index);
    for (const picked of picks) {
      await this.page.locator('#dialog.show .option').nth(picked).click();
      this.active.choices.push({ index: picked, text: step.options[picked].text, correct: !!step.options[picked].correct });
      await this.page.locator('#dialog.show .btn.primary').click();
    }
  }

  async walkToward(step) {
    if (!step.targetPosition) throw new Error(`Missing target for ${step.id}`);
    let best = Infinity;
    let progressAt = Date.now();
    while (Date.now() < this.deadline) {
      const state = await this.page.evaluate(id => {
        const s = window.__hsa.scene;
        const p = s.player.position;
        return { x: p.x, z: p.z, near: s.world.nearest(p.x, p.z)?.id, current: s.runner.currentId, roaming: s.roaming };
      }, step.target);
      if (state.current !== step.id || !state.roaming) break;
      if (state.near === step.target) { await this.hold(); await this.pressE(); return; }
      const dx = step.targetPosition[0] - state.x;
      const dz = step.targetPosition[1] - state.z;
      const distance = Math.hypot(dx, dz);
      if (distance < best - 0.12) { best = distance; progressAt = Date.now(); }
      if (Date.now() - progressAt > this.stuckSeconds * 1000) {
        await this.hold();
        const event = { type: 'stuck', seconds: (Date.now() - progressAt) / 1000, position: [state.x, state.z], target: step.target, distance };
        this.active.events.push(event);
        await this.page.evaluate(p => window.__hsa.scene.teleport(p), step.targetPosition);
        this.active.events.push({ type: 'teleport', to: step.targetPosition, reason: 'stuck' });
        await this.page.waitForTimeout(100);
        await this.pressE();
        return;
      }
      await this.hold([...(Math.abs(dx) > 0.2 ? [dx > 0 ? 'd' : 'a'] : []), ...(Math.abs(dz) > 0.2 ? [dz > 0 ? 's' : 'w'] : [])]);
      await this.page.waitForTimeout(120);
    }
    await this.hold();
  }

  async spawnFrames() {
    for (let i = 0; i < 3; i++) {
      this.checkDeadline();
      await this.shot(`spawn-${i + 1}`);
      this.log.spawnFrames.push(await this.page.evaluate(() => {
        const { game, scene } = window.__hsa;
        return { camera: game.camera.position.toArray(), player: scene.player.position.toArray(), roaming: scene.roaming };
      }));
      await this.page.waitForTimeout(180);
    }
    await this.sampleLife();
    if (process.env.E2E_EXTRAS === '1' && this.shots) {
      await this.page.setViewportSize({ width: 390, height: 844 });
      await this.shot('extra-mobile');
      await this.page.setViewportSize(this.log.viewport);
      // Select Vietnamese before content is rendered: changing language in a
      // live scene only translates the static HUD, leaving its current dialog
      // and objective in the old language. Keep this sample isolated.
      const localized = await this.driver.browser.newContext({ viewport: this.log.viewport });
      try {
        const page = await localized.newPage();
        page.on('pageerror', error => this.log.pageErrors.push(`Vietnamese sample: ${error.stack || error.message}`));
        page.on('console', message => {
          if (['warning', 'error'].includes(message.type())) this.log.console.push({ type: message.type(), text: message.text(), location: message.location(), sample: 'vietnamese' });
        });
        await page.addInitScript(() => localStorage.setItem('hsa.lang', 'vi'));
        await page.goto(`${this.driver.url}/?play=${this.id}`);
        await page.waitForFunction(() => window.__hsa?.scene?.runner, null, { timeout: 60_000 });
        await this.shot('extra-vietnamese', page);
      } finally { await localized.close(); }
    }
  }

  /** Count NPCs and vehicles that move more than 1 m over 10 s of roaming. */
  async sampleLife(seconds = 10) {
    const read = () => this.page.evaluate(() => {
      const { world } = window.__hsa.scene;
      return {
        npcs: world.npcs.map(c => [c.root.position.x, c.root.position.z]),
        vehicles: world.life.lanes.flatMap(l => l.objects.map(o => [o.position.x, o.position.z])),
      };
    });
    // Sample every 0.5 s and keep each object's largest distance from its start, so a walker that
    // pauses at a waypoint or loops back to where it began still counts as moving.
    const before = await read();
    const far = { npcs: before.npcs.map(() => 0), vehicles: before.vehicles.map(() => 0) };
    for (let t = 0; t < seconds * 2; t++) {
      await this.page.waitForTimeout(500);
      const now = await read();
      for (const k of ['npcs', 'vehicles']) {
        before[k].forEach((p, i) => { const q = now[k][i]; if (q) far[k][i] = Math.max(far[k][i], Math.hypot(p[0] - q[0], p[1] - q[1])); });
      }
    }
    const moved = d => d.filter(m => m > 1).length;
    this.log.life = { seconds, npcs: before.npcs.length, movingNpcs: moved(far.npcs),
      vehicles: before.vehicles.length, movingVehicles: moved(far.vehicles) };
  }

  checkDeadline() {
    if (Date.now() >= this.deadline) throw new Error(`Step timeout: ${this.active.id} (${this.active.type})`);
  }

  async minigameInput(step) {
    const p = this.page;
    if (step.game === 'streetCrossing') { await this.hold(['w', 'h']); return; }
    if (step.game === 'grabRide') {
      const want = await p.evaluate(() => document.querySelector('.ride-pad .want')?.dataset.k);
      await this.hold(want ? [{ 'lean-l': 'a', 'lean-r': 'd', brace: 'w', tuck: 's' }[want]] : []);
      return;
    }
    const click = async selector => {
      const el = p.locator(`#minigame.show ${selector}`).first();
      if (await el.isVisible()) {
        try { await el.click({ timeout: 1500 }); }
        catch (error) {
          // Animation completion can replace or disable a button between the
          // visibility probe and pointer input. Retry from fresh DOM next tick;
          // an actually inaccessible control still fails the step deadline.
          if (error.name !== 'TimeoutError') throw error;
          this.active.events.push({ type: 'inputRetry', selector, seconds: (Date.now() - this.stepStarted) / 1000 });
        }
        return true;
      }
      return false;
    };
    if (step.game === 'ticketMachine') {
      for (const selector of ['[data-lang=en]', '[data-ticket=p3]', '[data-adult="1"]', '[data-card]', '[data-take]']) {
        if (await click(selector)) return;
      }
    } else if (step.game === 'sort') {
      if (await p.locator('.sort-summary').isVisible()) {
        this.active.events.push({ type: 'sortSummary', text: await p.locator('.sort-summary').innerText() });
        await click('.sort-summary button');
        return;
      }
      const count = await p.locator('.sort-count').textContent();
      const waitForNext = () => p.waitForFunction(previous =>
        document.querySelector('.sort-summary') ||
        document.querySelector('.sort-count')?.textContent !== previous, count);
      if (await click('.sort-explain.show button')) {
        await waitForNext();
        return;
      }
      const name = await p.locator('.sort-card .cn').textContent();
      const item = step.params.items.find(i => Object.values(i.name).includes(name));
      if (!item) throw new Error(`Unknown sort card: ${name}`);
      await p.evaluate(() => {
        document.querySelector('.sort-zones').addEventListener('click', e => {
          window.__sortClick = {
            card: document.querySelector('.sort-card .cn')?.textContent,
            zone: e.target.closest('[data-z]')?.dataset.z,
          };
        }, { once: true, capture: true });
      });
      await click(`[data-z="${[].concat(item.zone)[0]}"]`);
      this.active.events.push({ type: 'sortAnswer', expectedCard: name, ...await p.evaluate(() => window.__sortClick) });
      // A click returns before the 380 ms flight finishes. Wait for the next
      // card before reading its answer: Playwright may defer a later click
      // until a moving bin settles, applying a stale answer to the next card.
      await p.waitForFunction(previous =>
        document.querySelector('.sort-explain.show') ||
        document.querySelector('.sort-summary') ||
        document.querySelector('.sort-count')?.textContent !== previous, count);
      if (await p.locator('.sort-explain.show').isVisible()) {
        throw new Error(`Correct-answer sort bot made a mistake on ${name}`);
      }
    } else if (step.game === 'callBoard') {
      const called = await p.evaluate(() => document.querySelector('.cb-row.new span')?.textContent);
      if (called?.trim() === (step.params?.mine || 'A-117')) await click('.cb-btn');
    } else if (step.game === 'phoEating') {
      for (const selector of ['[data-a=taste]:not(.done)', '[data-a=eat]', '[data-a=noodles]:not(:disabled)', '[data-a=broth]:not(:disabled)']) {
        if (await click(selector)) return;
      }
    } else if (step.game === 'pfand') {
      if (await click('.pf-receipt button') || await click('[data-a=bon]')) return;
      const index = Number((await p.locator('.pf-name b').textContent()).split('/')[0]) - 1;
      // Read the game's item definitions, then use its normal insertion/keep UI.
      const deposit = await p.evaluate(async i => (await import('/src/minigames/shopLogic.js')).PFAND_ITEMS[i].pfand, index);
      await click(`[data-a=${deposit > 0 ? 'insert' : 'keep'}]`);
    } else if (step.game === 'checkout') {
      if (await click('[data-p=card]') || await click('.co-pay .btn')) return;
      const first = p.locator('.co-tray-items .first');
      if (await first.count()) await click((await first.getAttribute('class')).includes('fragile') ? '[data-w=top]' : '[data-w=cart]');
    } else throw new Error(`Unsupported minigame: ${step.game}`);
  }

  async play() {
    let capturedSpawn = false;
    for (let n = 0; n < 150; n++) {
      const step = await this.currentStep();
      this.active = { id: step.id, type: step.type, game: step.game, startedAt: new Date().toISOString(), seconds: 0, events: [], choices: [], averageFps: null };
      this.log.steps.push(this.active);
      const start = Date.now();
      this.stepStarted = start;
      this.deadline = start + this.stepTimeout;
      const frameStart = await this.page.evaluate(() => window.__e2eFrames);
      let mgShots = 0;
      let nextShot = 0;
      try {
        await this.shot(`${n + 1}-${step.id}`);
        if (step.type === 'end') {
          await this.page.locator('#screen.show .result').waitFor({ state: 'visible' });
          this.log.result = await this.page.evaluate(() => {
            const r = window.__hsa.scene.runner;
            return { stars: r.stars(), score: r.score, maxScore: r.maxScore };
          });
          await this.shot('result');
          this.log.visitedSteps = await this.page.evaluate(() => {
            window.__e2eObserveStep();
            return window.__e2eVisits;
          });
          return;
        }
        while (true) {
          this.checkDeadline();
          if ((await this.currentStep()).id !== step.id) break;
          if (step.type === 'minigame' && mgShots < 5 && Date.now() >= nextShot && await this.page.locator('#minigame.show').isVisible()) {
            await this.shot(`${n + 1}-${step.id}-minigame-${++mgShots}`);
            nextShot = Date.now() + (mgShots < 3 ? 200 : 1600);
          }
          if (await this.page.locator('#dialog.show .btn.primary').isVisible()) {
            await this.hold();
            await this.page.locator('#dialog.show .btn.primary').click();
          } else if (step.type === 'choice' && await this.page.locator('#dialog.show .option:not(:disabled)').count()) {
            await this.answerChoice(step);
          } else if (step.type === 'sandbox' && (await this.currentStep()).roaming) {
            if (!capturedSpawn) { await this.spawnFrames(); capturedSpawn = true; }
            await this.walkToward(step);
          } else if (step.type === 'minigame' && await this.page.locator('#minigame.show').isVisible()) {
            await this.minigameInput(step);
          }
          await this.page.waitForTimeout(220);
        }
        await this.hold();
      } finally {
        this.active.seconds = (Date.now() - start) / 1000;
        const frames = await this.page.evaluate(() => window.__e2eFrames);
        this.active.averageFps = (frames - frameStart) / this.active.seconds;
        await this.saveLog();
      }
    }
    throw new Error('Scenario exceeded 150 steps');
  }

  async close() {
    this.log.finishedAt = new Date().toISOString();
    try { await this.saveLog(); }
    finally { await this.context?.close(); }
  }

  async saveLog() {
    await writeFile(resolve(this.out, 'log.json'), `${JSON.stringify(this.log, null, 2)}\n`);
  }
}
