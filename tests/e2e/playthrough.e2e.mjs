import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startDriver, Playthrough, SCENARIO_IDS } from './driver.mjs';

let driver;
before(async () => { driver = await startDriver(); });
after(async () => { await driver?.close(); });

const only = process.env.E2E_ONLY;
if (only && !SCENARIO_IDS.includes(only)) throw new Error(`Unknown E2E_ONLY: ${only}`);

for (const id of SCENARIO_IDS) {
  test(`${id}: reaches the result screen`, {
    skip: only && only !== id,
    timeout: 600_000,
  }, async () => {
    const run = new Playthrough(driver, id);
    try {
      await run.openScenario();
      await run.play();
      assert.equal(await run.page.locator('#screen.show .result').isVisible(), true);
      assert.deepEqual(run.log.pageErrors, [], 'uncaught page errors');
      assert.ok(run.log.steps.length > 0);
      assert.deepEqual(run.log.steps.map(step => step.id), run.log.visitedSteps.map(step => step.id), 'every visited step was captured');
      for (const step of run.log.steps) {
        assert.ok(step.seconds < run.stepTimeout / 1000, `${step.id} exceeded step timeout`);
      }
    } catch (error) {
      run.log.failure = error.stack;
      await run.shot('failure').catch(() => {});
      throw error;
    } finally {
      await run.close();
    }
  });
}
