import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {DEFAULT_SETTINGS, createSnapshot} from '../persistence';
import {XoshiroPRNG, type SimulationState} from '../simulation';

test.use({viewport: {width: 1280, height: 900}});
test.setTimeout(60000);
for (const fallback of [false, true]) test(`side windows follow real tank resizing, imports and camera without changing saved state (${fallback ? 'fallback' : 'Worker'})`, async ({page}, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    type Point = {x: number; y: number; screenX: number; screenY: number; scale: number};
    const capture = {frame: 0, labels: [] as Array<Point & {id: string}>,
      circles: [] as Array<Point & {radius: number}>, wall: {width: 0, height: 0, scale: 0}};
    Object.assign(window, {sideWindowPaint: capture});
    const tank = (ctx: CanvasRenderingContext2D) => ctx.canvas.getAttribute('aria-label') === 'Aquatic simulation';
    const point = (ctx: CanvasRenderingContext2D, x: number, y: number): Point => {
      const m = ctx.getTransform(), p = m.transformPoint(new DOMPoint(x, y));
      return {x, y, screenX: p.x / devicePixelRatio, screenY: p.y / devicePixelRatio,
        scale: Math.hypot(m.a, m.b) / devicePixelRatio};
    };
    const background = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect = function(x, y, w, h) {
      if (tank(this) && x === 0 && y === 0) {capture.frame++; capture.labels = []; capture.circles = [];}
      return background.call(this, x, y, w, h);
    };
    const wall = CanvasRenderingContext2D.prototype.strokeRect;
    CanvasRenderingContext2D.prototype.strokeRect = function(x, y, w, h) {
      if (tank(this) && x === 0 && y === 0) capture.wall = {width: w, height: h, scale: point(this, x, y).scale};
      return wall.call(this, x, y, w, h);
    };
    const text = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(id, x, y, maxWidth) {
      if (tank(this) && /^[LR]\d+$/.test(id)) capture.labels.push({...point(this, x, y), id});
      return maxWidth === undefined ? text.call(this, id, x, y) : text.call(this, id, x, y, maxWidth);
    };
    const arcs = new WeakMap<CanvasRenderingContext2D, Point & {radius: number}>();
    const arc = CanvasRenderingContext2D.prototype.arc;
    CanvasRenderingContext2D.prototype.arc = function(x, y, radius, start, end, counterclockwise) {
      if (tank(this)) arcs.set(this, {...point(this, x, y), radius});
      return arc.call(this, x, y, radius, start, end, counterclockwise);
    };
    const fill = CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.fill = function(this: CanvasRenderingContext2D, ...args: Parameters<typeof fill>) {
      if (tank(this) && this.fillStyle === '#facc15' && arcs.has(this)) capture.circles.push(arcs.get(this)!);
      return fill.apply(this, args);
    } as typeof fill;
  });
  await page.goto(`./?autoplay${fallback ? '&mainthread' : ''}`);
  await page.getByTitle('Ecology & Physical Settings').click();
  const state: SimulationState = {simTime: 0, organisms: [], eggs: [], nutrients: [], caustics: [], bubbles: [],
    ledger: {externalInflow: 0, metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
    nutrientAccumulator: 0, totalBirths: 0, totalDeaths: 0, initialSeed: 51,
    prng: new XoshiroPRNG(51), lineage: new Map(), recentDeaths: []};
  const read = async () => {
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export Snapshot', exact: true}).dispatchEvent('click');
    return JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  };
  const upload = async (height: number) => {
    const snapshot = JSON.parse(JSON.stringify(createSnapshot(state,
      {...DEFAULT_SETTINGS, worldWidth: 1800, worldHeight: height, targetNutrients: 0, inflowRate: 0})));
    await page.locator('input[type=file]').setInputFiles({name: 'side-windows.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(snapshot))});
    await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
    await expect.poll(async () => (await read()).state).toEqual(snapshot.state);
    return snapshot;
  };
  const source = await upload(1500);
  const paint = () => page.evaluate(() => (window as any).sideWindowPaint);
  const check = async (height: number) => {
    const count = Math.max(1, Math.floor(height / 300));
    await expect.poll(async () => {const p = await paint(); return [p.wall.width, p.wall.height, p.labels.length, p.circles.length];})
      .toEqual([1800, height, count * 2, (count - 1) * 2]);
    const p = await paint();
    for (let index = 0; index < count; index++) for (const [side, prefix] of ['L', 'R'].entries()) {
      const label = p.labels[index * 2 + side];
      expect(label.id).toBe(prefix + index); expect(label.y).toBeCloseTo(height - (index + .5) * height / count, 8);
      expect(side === 0 ? label.x < 0 : label.x > 1800).toBe(true);
    }
    for (let index = 1; index < count; index++) for (let side = 0; side < 2; side++) {
      const circle = p.circles[(index - 1) * 2 + side];
      expect(circle.y).toBeCloseTo(height - index * height / count, 8);
      expect(circle.y).toBeGreaterThan(0); expect(circle.y).toBeLessThan(height);
      expect(side === 0 ? circle.x + circle.radius < 0 : circle.x - circle.radius > 1800).toBe(true);
      expect(circle.radius * circle.scale).toBeCloseTo(4, 8);
    }
    return p;
  };
  await check(1500);
  await expect(page.getByLabel('Tank height', {exact: true})).toHaveAttribute('min', '600');
  await expect(page.getByLabel('Tank height', {exact: true})).toHaveAttribute('max', '3000');
  for (const height of [1800, 1600, 1200, 600, 900, 1500]) {
    await page.getByLabel('Tank height', {exact: true}).evaluate((node, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, String(value));
      node.dispatchEvent(new Event('input', {bubbles: true}));
    }, height);
    await check(height);
  }
  await upload(700); await check(700); await upload(1500); await check(1500);
  await page.getByTitle('Close settings (✕)').click();
  const canvas = page.getByLabel('Aquatic simulation');
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 200);
  await expect.poll(async () => (await paint()).wall.scale).toBeCloseTo(.35, 6);
  await check(1500);
  // Check the actual published-color pixels, not just attempted draw calls.
  const pixels = await canvas.evaluate(node => {
    const c = node as HTMLCanvasElement, ctx = c.getContext('2d')!, p = (window as any).sideWindowPaint;
    return p.circles.map((circle: any) => {
      const x = Math.round(circle.screenX * devicePixelRatio), y = Math.round(circle.screenY * devicePixelRatio);
      return {inside: x > 4 && y > 4 && x < c.width - 4 && y < c.height - 4,
        rgb: Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0, 3)};
    });
  });
  expect(pixels).toHaveLength(8);
  for (const pixel of pixels) {expect(pixel.inside).toBe(true); expect(pixel.rgb).toEqual([250, 204, 21]);}
  await page.screenshot({path: info.outputPath(`side-windows-${fallback ? 'fallback' : 'worker'}.png`)});
  const before = await paint();
  await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width / 2 + 100, bounds.y + bounds.height / 2 + 40, {steps: 4}); await page.mouse.up();
  await expect.poll(async () => Math.abs((await paint()).labels[0].screenX - before.labels[0].screenX)).toBeGreaterThan(20);
  await check(1500);
  await page.mouse.wheel(0, -200);
  await expect.poll(async () => (await paint()).wall.scale).toBeGreaterThan(.35);
  await check(1500);
  await page.setViewportSize({width: 960, height: 720}); await check(1500);
  await page.getByTitle('Ecology & Physical Settings').click();
  const exact = await read();
  expect(exact.state).toEqual(source.state);
  expect(exact.settings.worldWidth).toBe(1800); expect(exact.settings.worldHeight).toBe(1500);
  expect(errors).toEqual([]);
});
