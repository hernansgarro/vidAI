import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createSnapshot} from '../persistence';
import {cycleFixture, food} from '../tests/support/nutrient-cycle';

test.use({viewport: {width: 1280, height: 850}});
test.setTimeout(60000);
for (const fallback of [false, true]) test(`versioned nutrient radii, paused imports and live mineralization (${fallback ? 'fallback' : 'Worker'})`, async ({page}, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    const radii: number[] = []; Object.assign(window, {nutrientRadii: radii});
    const arcs = new WeakMap<CanvasRenderingContext2D, number>();
    const arc = CanvasRenderingContext2D.prototype.arc, fill = CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.arc = function(x, y, r, a, b, ccw) {
      arcs.set(this, r); return arc.call(this, x, y, r, a, b, ccw);
    };
    CanvasRenderingContext2D.prototype.fill = function(this: CanvasRenderingContext2D, ...args: Parameters<typeof fill>) {
      if (this.fillStyle === '#22e078' && arcs.has(this)) {
        radii.push(arcs.get(this)!); if (radii.length > 60) radii.shift();
      }
      return fill.apply(this, args);
    } as typeof fill;
  });
  await page.goto(`./?autoplay${fallback ? '&mainthread' : ''}`);
  await page.getByTitle('Ecology & Physical Settings').click();
  const read = async () => {
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export Snapshot', exact: true}).dispatchEvent('click');
    return JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  };
  const upload = async (snapshot: unknown) => {
    await page.evaluate(() => {(window as any).nutrientRadii.length = 0;});
    await page.locator('input[type=file]').setInputFiles({name: 'nutrient-cycle.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(snapshot))});
    await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
    // An already-paused world also has Resume visible before File.text resolves.
    // Wait for the exact replacement, not that stale UI acknowledgement.
    await expect.poll(async () => {
      const current = await read(); return {state: current.state, settings: current.settings};
    }, {timeout: 10000}).toEqual({state: (snapshot as any).state, settings: (snapshot as any).settings});
  };
  // New startup must explicitly opt in, while old imports retain their semantics.
  const startup = await read(); expect(startup.schemaVersion).toBe('18.0.0');
  expect(startup.settings.nutrientCycle).toBe('decay-v1');
  const f = cycleFixture([food(75, false, 1120, 750), food(3000, false, 1280, 750), food(9300, true, 1200, 850)]);
  f.state.caustics = []; f.state.nutrients[2].decayTimeRemaining = .1;
  const source = createSnapshot(f.state, f.settings);
  await upload(source);
  await expect.poll(() => page.evaluate(() => (window as any).nutrientRadii.some((r: number) => r > 2.84 && r < 2.85))).toBe(true);
  expect((await read()).state).toEqual(source.state);
  expect((await read()).settings).toEqual(source.settings);
  await page.screenshot({path: info.outputPath('nutrient-cycle-radii.png')});
  await page.getByRole('button', {name: '5x', exact: true}).click();
  await expect.poll(async () => (await read()).state.nutrients.some((n: any) => n.kind === 'carrion')).toBe(false);
  await page.getByRole('button', {name: 'Pause', exact: true}).click();
  const advanced = await read(); expect(advanced.state.simTime).toBeGreaterThan(.1);
  expect(advanced.state.nutrients.every((n: any) => n.energyValue <= 3000)).toBe(true);
  const small = advanced.state.nutrients.find((n: any) => n.id === source.state.nutrients[0].id);
  if (small) {expect(small.energyValue).toBeLessThan(75); expect(small.radius).toBeLessThan(source.state.nutrients[0].radius);}
  await upload(advanced); expect((await read()).state).toEqual(advanced.state);
  expect((await read()).settings).toEqual(advanced.settings);
  const old = structuredClone(source); old.schemaVersion = '16.0.0'; delete old.settings.nutrientCycle;
  old.state.nutrients[0].radius = 8;
  await upload(old); expect((await read()).state).toEqual(old.state);
  expect((await read()).settings).toEqual(old.settings);
  await expect.poll(() => page.evaluate(() => (window as any).nutrientRadii.includes(8))).toBe(true);
  expect(errors).toEqual([]);
});
