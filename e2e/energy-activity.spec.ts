import {test, expect} from '@playwright/test';
import {energyActivityFixture} from '../tests/support/energy-activity';
import {createSnapshot} from '../persistence';

test.use({viewport: {width: 1280, height: 850}});
test.setTimeout(60000);
for (const fallback of [false, true]) test(`energy overlays follow real body paths and freeze at x0 (${fallback ? 'fallback' : 'Worker'})`, async ({page}, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    const capture = {green: [] as Array<{alpha: number; path: number[]; at: number; scale: number}>,
      red: [] as Array<{alpha: number; path: number[]; at: number; scale: number}>};
    Object.assign(window, {energyTintCapture: capture});
    const paths = new WeakMap<CanvasRenderingContext2D, number[]>();
    const originalRect = CanvasRenderingContext2D.prototype.roundRect;
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, ...rest) {
      paths.set(this, [x, y, w, h]); return originalRect.call(this, x, y, w, h, ...rest);
    };
    const originalFill = CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.fill = function(this: CanvasRenderingContext2D, ...args: Parameters<typeof originalFill>) {
      const style = String(this.fillStyle);
      const color = /rgba\(34, 220, 105, ([\d.]+)\)/.exec(style) ? 'green'
        : /rgba\(245, 55, 65, ([\d.]+)\)/.exec(style) ? 'red' : null;
      if (color) {
        const alpha = Number(style.match(/([\d.]+)\)$/)![1]);
        capture[color].push({alpha, path: paths.get(this) ?? [], at: performance.now(), scale: Math.hypot(this.getTransform().a, this.getTransform().b)});
        if (capture[color].length > 1000) capture[color].shift();
      }
      return originalFill.apply(this, args);
    } as typeof originalFill;
  });
  await page.goto(`./?autoplay${fallback ? '&mainthread' : ''}`);
  await page.getByTitle('Ecology & Physical Settings').click();
  const {state, config} = energyActivityFixture();
  await page.locator('input[type=file]').setInputFiles({name: 'activity.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(createSnapshot(state, config)))});
  await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
  await page.evaluate(() => {const c = (window as any).energyTintCapture; c.green.length = c.red.length = 0;});
  await page.getByRole('button', {name: '1x', exact: true}).click();
  await expect.poll(() => page.evaluate(() => {
    const c = (window as any).energyTintCapture; return c.green.length > 2 && c.red.length > 2;
  })).toBe(true);
  // Freeze while activity is ongoing; navigation/inspection remain available.
  await page.getByRole('button', {name: 'Pause', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
  const sample = () => page.evaluate(() => {
    const c = (window as any).energyTintCapture;
    return {green: c.green.at(-1), red: c.red.at(-1), counts: [c.green.length, c.red.length]};
  });
  await page.waitForTimeout(150);
  const paused = await sample();
  await expect.poll(async () => {
    const latest = await sample();
    return latest.counts[0] > paused.counts[0] && latest.counts[1] > paused.counts[1];
  }).toBe(true);
  const held = await sample();
  // Observe fresh painted frames at x0: both waves keep exact opacity/path.
  if (held.counts[0] > paused.counts[0]) expect(held.green.alpha).toBe(paused.green.alpha);
  if (held.counts[1] > paused.counts[1]) expect(held.red.alpha).toBe(paused.red.alpha);
  const capture = await page.evaluate(() => (window as any).energyTintCapture);
  expect(capture.green.some((s: any) => s.path[2] === 7 && s.path[3] === 7)).toBe(true);
  expect(capture.red.every((s: any) => s.path[2] === 7 && s.path[3] === 7)).toBe(true);
  expect(Math.max(...capture.green.map((s: any) => s.alpha))).toBeLessThanOrEqual(.24);
  expect(Math.max(...capture.red.map((s: any) => s.alpha))).toBeLessThanOrEqual(.28);
  const beforeZoom = await sample();
  await page.mouse.move(800, 450); await page.mouse.wheel(0, -500);
  await expect.poll(async () => {
    const latest = await sample();
    return (latest.green?.scale !== beforeZoom.green?.scale && latest.counts[0] > beforeZoom.counts[0])
      || (latest.red?.scale !== beforeZoom.red?.scale && latest.counts[1] > beforeZoom.counts[1]);
  }).toBe(true);
  await page.screenshot({path: info.outputPath('energy-pulses-paused.png')});
  await page.getByRole('button', {name: '5x', exact: true}).click();
  await page.waitForTimeout(350);
  await page.getByRole('button', {name: 'Pause', exact: true}).click();
  // Replacing the world at x0 must clear all old activity without advancing time.
  state.nutrients = []; state.organisms = [];
  await page.locator('input[type=file]').setInputFiles({name: 'empty.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(createSnapshot(state, config)))});
  await page.waitForTimeout(150);
  const cleared = await sample(); await page.waitForTimeout(150);
  expect((await sample()).counts).toEqual(cleared.counts);
  expect(errors).toEqual([]);
});
