import {build} from 'vite';
import {selfTubeFixture} from '../tests/support/self-tubes';
import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {DEFAULT_SETTINGS, createSnapshot, restoreSnapshot, totalAccountedEnergy} from '../persistence';
import {enableClosedEconomy} from '../energyEconomy';
import {XoshiroPRNG, type SimulationState} from '../simulation';

test.use({viewport: {width: 1280, height: 900}});
test.setTimeout(90000);
// Bundle an isolated test-only kernel for exact replay in Chrome's own math
// runtime. Node/Chrome transcendental rounding and near-zero diagnostic branch
// counts are not a valid bit-exact cross-runtime reference.
let browserReplayCode: string;
test.beforeAll(async () => {
  const built = await build({configFile: false, logLevel: 'silent', build: {
    write: false, minify: false, lib: {entry: 'tests/support/self-tube-browser.ts',
      formats: ['iife'], name: 'selfTubeReplay'},
  }});
  const output = Array.isArray(built) ? built[0] : built;
  if (!('output' in output)) throw new Error('Missing browser replay bundle');
  const chunk = output.output.find(file => file.type === 'chunk');
  if (!chunk || chunk.type !== 'chunk') throw new Error('Missing browser replay code');
  browserReplayCode = chunk.code;
});
for (const fallback of [false, true]) test(`local phone consent and grouped glass tubes follow tank/camera with authoritative physical topology (${fallback ? 'fallback' : 'Worker'})`, async ({page}, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    type Point = {x: number; y: number; screenX: number; screenY: number; scale: number};
    const capture = {frame: 0, labels: [] as Array<Point & {id: string}>,
      circles: [] as Array<Point & {radius: number}>, tubes: [] as number[][], wall: {width: 0, height: 0, scale: 0}};
    Object.assign(window, {sideWindowPaint: capture});
    const tank = (ctx: CanvasRenderingContext2D) => ctx.canvas.getAttribute('aria-label') === 'Aquatic simulation';
    const point = (ctx: CanvasRenderingContext2D, x: number, y: number): Point => {
      const m = ctx.getTransform(), p = m.transformPoint(new DOMPoint(x, y));
      return {x, y, screenX: p.x / devicePixelRatio, screenY: p.y / devicePixelRatio,
        scale: Math.hypot(m.a, m.b) / devicePixelRatio};
    };
    const background = CanvasRenderingContext2D.prototype.fillRect;
    CanvasRenderingContext2D.prototype.fillRect = function(x, y, w, h) {
      if (tank(this) && x === 0 && y === 0) {capture.frame++; capture.labels = []; capture.circles = []; capture.tubes = [];}
      return background.call(this, x, y, w, h);
    };
    const wall = CanvasRenderingContext2D.prototype.strokeRect;
    CanvasRenderingContext2D.prototype.strokeRect = function(x, y, w, h) {
      if (tank(this) && x === 0 && y === 0) capture.wall = {width: w, height: h, scale: point(this, x, y).scale};
      return wall.call(this, x, y, w, h);
    };
    const text = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(id, x, y, maxWidth) {
      if (tank(this) && /^[LR]\d+$/.test(id)) {
        const p = point(this, x, y); capture.labels.push({...p, id}); capture.wall.scale = p.scale;
        if (id[0] === 'L') capture.wall.height = y * 2 * (Number(id.slice(1)) + 1);
        else capture.wall.width = x - 10 / p.scale;
      }
      return maxWidth === undefined ? text.call(this, id, x, y) : text.call(this, id, x, y, maxWidth);
    };
    let pen = [0, 0], segments: number[][] = [];
    const begin = CanvasRenderingContext2D.prototype.beginPath;
    CanvasRenderingContext2D.prototype.beginPath = function() {segments = []; return begin.call(this);};
    const move = CanvasRenderingContext2D.prototype.moveTo;
    CanvasRenderingContext2D.prototype.moveTo = function(x, y) {pen = [x, y]; return move.call(this, x, y);};
    const line = CanvasRenderingContext2D.prototype.lineTo;
    CanvasRenderingContext2D.prototype.lineTo = function(x, y) {segments.push([...pen, x, y]); pen = [x, y]; return line.call(this, x, y);};
    const stroke = CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke = function(this: CanvasRenderingContext2D, ...args: Parameters<typeof stroke>) {
      if (tank(this) && this.strokeStyle instanceof CanvasGradient) for (const segment of segments) {
        const [x, y, end, endY] = segment;
        if (y === endY && Math.abs(end - x) === 300 && (x === 0 || Math.abs(x - capture.wall.width) < 1e-5)) capture.tubes.push(segment);
      }
      return stroke.apply(this, args);
    } as typeof stroke;
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
  // An empty closed world keeps running; a legacy open world correctly ends on extinction.
  enableClosedEconomy(state);
  const read = async () => {
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export Snapshot', exact: true}).dispatchEvent('click');
    return JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  };
  const upload = async (height: number) => {
    const canvas = page.getByLabel('Aquatic simulation'), epoch = await canvas.getAttribute('data-world-epoch');
    const snapshot = JSON.parse(JSON.stringify(createSnapshot(state,
      {...DEFAULT_SETTINGS, worldWidth: 1800, worldHeight: height, targetNutrients: 0, inflowRate: 0})));
    await page.locator('input[type=file]').setInputFiles({name: 'side-windows.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(snapshot))});
    await expect(canvas).not.toHaveAttribute('data-world-epoch', epoch!);
    await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
    await expect.poll(async () => (await read()).state).toEqual(snapshot.state);
    return snapshot;
  };
  const source = await upload(1500);
  const paint = () => page.evaluate(() => (window as any).sideWindowPaint);
  const check = async (height: number) => {
    const count = Math.max(1, Math.floor(height / 300));
    await expect.poll(async () => {const p = await paint(); return [Math.round(p.wall.width), Math.round(p.wall.height), p.labels.length, p.circles.length];})
      .toEqual([1800, height, count * 2, 0]);
    const p = await paint();
    for (let index = 0; index < count; index++) for (const [side, prefix] of ['L', 'R'].entries()) {
      const label = p.labels[index * 2 + side];
      expect(label.id).toBe(prefix + index); expect(label.y).toBeCloseTo(height - (index + .5) * height / count, 8);
      expect(side === 0 ? label.x < 0 : label.x > 1800).toBe(true);
    }
    return p;
  };
  await check(1500);
  await expect(page.getByLabel('Tank height', {exact: true})).toHaveAttribute('min', '600');
  await expect(page.getByLabel('Tank height', {exact: true})).toHaveAttribute('max', '3000');
  const setHeight = async (height: number) => {
    await page.getByLabel('Tank height', {exact: true}).evaluate((node, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, String(value));
      node.dispatchEvent(new Event('input', {bubbles: true}));
    }, height);
    await check(height);
  };
  for (const height of [1800, 1600, 1200, 600, 900, 1500]) await setHeight(height);
  await upload(700); await check(700); await upload(1500); await check(1500);
  await page.getByTitle('Close settings (✕)').click();
  const canvas = page.getByLabel('Aquatic simulation');
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 200);
  await expect.poll(async () => (await paint()).wall.scale).toBeCloseTo(.35, 6);
  await check(1500);
  const phone = (side: string) => page.getByTestId(`side-demo-phone-${side}`);
  const windowButton = (side: string, index: number) => page.getByTestId(`side-demo-window-${side}${index}`);
  const menu = (side: string) => page.getByRole('region', {name: `${side} phone menu`, exact: true});
  const tubes = async (expected: number) => expect.poll(async () => (await paint()).tubes.length).toBe(expected);
  const call = async (side: string) => {
    await phone(side).click(); await page.getByTestId(`side-person-self-${side}`).click();
  };
  await expect(page.getByTestId('side-demo-pair')).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Reset local connections', exact: true})).toHaveCount(0);
  await expect(page.locator('.side-demo-toolbar')).toHaveCount(0);
  await expect(windowButton('L', 0)).toBeDisabled(); await tubes(0);
  await phone('L').click();
  await menu('L').getByLabel('Your display name').pressSequentially('fN 123');
  await menu('L').getByLabel('Your display name').press('Enter');
  await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
  await expect(page.getByTestId('side-person-self-L')).toContainText('fN 123');
  await page.getByTestId('side-person-self-L').click();
  await expect(phone('R')).toHaveAttribute('data-ringing', 'true');
  await expect(page.getByTestId('side-call-accept-R')).toBeVisible();
  await expect(page.locator('[aria-modal=true]')).toHaveCount(0);
  await page.screenshot({path: info.outputPath(`side-windows-${fallback ? 'fallback' : 'worker'}-incoming.png`)});
  // Pending calls never block simulation controls or acquire a response deadline.
  await page.getByRole('button', {name: 'Resume', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Pause', exact: true})).toBeVisible();
  await page.getByTitle('Ecology & Physical Settings').click();
  await expect.poll(async () => (await read()).state.simTime).toBeGreaterThan(0);
  await page.getByTitle('Close settings (✕)').click();
  await page.getByRole('button', {name: 'Pause', exact: true}).click();
  await expect(phone('R')).toHaveAttribute('data-ringing', 'true');
  await menu('L').getByRole('button', {name: 'Cancel call', exact: true}).click();
  await expect(phone('R')).toHaveAttribute('data-ringing', 'false');
  await page.getByTestId('side-person-self-L').click();
  await menu('R').getByRole('button', {name: 'Decline', exact: true}).click();
  await expect(phone('R')).toHaveAttribute('data-ringing', 'false');
  await page.getByTitle('Ecology & Physical Settings').click(); await upload(1500);
  await page.getByTitle('Close settings (✕)').click();
  await call('R'); await page.getByTestId('side-call-accept-L').click();
  await expect(phone('L')).toHaveAttribute('data-connected', 'true');
  await expect(phone('R')).toHaveAttribute('data-connected', 'true');
  await tubes(0); await expect(windowButton('L', 0)).toHaveAttribute('data-state', 'closed');
  const pixel = () => canvas.evaluate(node => {
    const c = node as HTMLCanvasElement, p = (window as any).sideWindowPaint;
    const label = p.labels.find((l: any) => l.id === 'L0');
    const x = Math.round((label.screenX + 10 - 100 * label.scale) * devicePixelRatio);
    const y = Math.round(label.screenY * devicePixelRatio);
    return Array.from(c.getContext('2d')!.getImageData(x, y, 1, 1).data).slice(0, 3);
  });
  const closedPixel = await pixel();
  await windowButton('L', 0).focus(); await windowButton('L', 0).press('Space');
  await expect(windowButton('L', 0)).toHaveAttribute('data-state', 'outgoing');
  await expect(windowButton('R', 0)).toHaveAttribute('data-state', 'incoming');
  await expect(windowButton('L', 0).locator('svg')).toHaveAttribute('data-hand-direction', 'left');
  await expect(windowButton('R', 0).locator('svg')).toHaveAttribute('data-hand-direction', 'left');
  await tubes(0); await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Decline window offer R0', exact: true}).click();
  await expect(windowButton('L', 0)).toHaveAttribute('data-state', 'rejected');
  await windowButton('L', 0).click(); await windowButton('R', 0).click(); await tubes(4);
  await expect.poll(pixel).not.toEqual(closedPixel); // actual pixels change outside the wall
  await windowButton('L', 1).click(); await windowButton('R', 1).click(); await tubes(4);
  await expect.poll(async () => (await paint()).tubes.length === 4 && (await paint()).tubes.every(([, y]: number[]) => y === 900 || y === 1500)).toBe(true);
  await windowButton('R', 4).click(); await windowButton('L', 4).click(); await tubes(8);
  const geometry = await paint(), leftBox = (await windowButton('L', 0).boundingBox())!, rightBox = (await windowButton('R', 0).boundingBox())!;
  const leftLabel = geometry.labels.find((l: any) => l.id === 'L0'), rightLabel = geometry.labels.find((l: any) => l.id === 'R0');
  expect(leftBox.x + leftBox.width).toBeLessThan(bounds.x + leftLabel.screenX + 10 - 300 * geometry.wall.scale);
  expect(rightBox.x).toBeGreaterThan(bounds.x + rightLabel.screenX - 10 + 300 * geometry.wall.scale);
  await page.screenshot({path: info.outputPath(`side-windows-${fallback ? 'fallback' : 'worker'}.png`)});
  await page.getByTitle('Ecology & Physical Settings').click(); await setHeight(600);
  await page.getByTitle('Close settings (✕)').click();
  await expect(windowButton('L', 4)).toHaveCount(0); await tubes(4);
  await expect(page.getByTestId('side-demo-suspended-L4')).toBeVisible();
  await expect(page.getByTestId('side-demo-suspended-R4')).toBeVisible();
  await page.screenshot({path: info.outputPath(`side-windows-${fallback ? 'fallback' : 'worker'}-suspended.png`)});
  await page.getByTitle('Ecology & Physical Settings').click(); await setHeight(1500);
  await page.getByTitle('Close settings (✕)').click();
  await expect(windowButton('L', 4)).toHaveAttribute('data-state', 'accepted'); await tubes(8);
  await page.getByTitle('Ecology & Physical Settings').click(); await setHeight(600);
  await page.getByTitle('Close settings (✕)').click();
  await page.getByTestId('side-demo-suspended-L4').click();
  await expect(page.getByTestId('side-demo-suspended-R4')).toHaveCount(0);
  await page.getByTitle('Ecology & Physical Settings').click(); await setHeight(1500);
  await page.getByTitle('Close settings (✕)').click(); await tubes(4);
  await phone('L').click();
  await menu('L').getByRole('button', {name: 'Turn availability off', exact: true}).click();
  await tubes(4); // leaving discovery does not break an existing connection
  await menu('L').getByRole('button', {name: 'Disconnect · retain agreements', exact: true}).click();
  await tubes(0); await expect(windowButton('L', 0)).toHaveAttribute('data-state', 'suspended');
  await expect(windowButton('L', 0).locator('svg')).toHaveClass(/lucide-wifi-off/);
  await expect(page.getByTestId('side-demo-suspended-L0')).toHaveCount(0);
  await menu('L').getByRole('button', {name: 'Make phone available', exact: true}).click();
  await page.getByTestId('side-person-self-L').click(); await page.getByTestId('side-call-accept-R').click(); await tubes(4);
  // Opening all windows leaves only the outer floor and ceiling on each side.
  for (const index of [2, 3, 4]) {await windowButton('L', index).click(); await windowButton('R', index).click();}
  await tubes(4);
  await expect.poll(async () => (await paint()).tubes.length === 4 && (await paint()).tubes.every(([, y]: number[]) => y === 0 || y === 1500)).toBe(true);
  for (let index = 0; index < 5; index++) await windowButton('L', index).click();
  await tubes(0);
  const before = await paint();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width / 2 + 100, bounds.y + bounds.height / 2 + 40, {steps: 4}); await page.mouse.up();
  await expect.poll(async () => Math.abs((await paint()).labels[0].screenX - before.labels[0].screenX)).toBeGreaterThan(20);
  await check(1500);
  await page.mouse.wheel(0, -200);
  await expect.poll(async () => (await paint()).wall.scale).toBeGreaterThan(.35);
  await check(1500);
  const beforeResize = (await paint()).frame;
  await page.setViewportSize({width: 960, height: 720});
  await expect.poll(() => canvas.evaluate(node => node.getBoundingClientRect().width)).toBe(960);
  await expect.poll(async () => (await paint()).frame).toBeGreaterThan(beforeResize);
  await check(1500);
  await page.getByTitle('Ecology & Physical Settings').click();
  const exact = await read();
  expect(exact.state).toEqual({...source.state, selfTubes: {version: 1, connected: true, accepted: []}});
  expect(exact.settings.worldWidth).toBe(1800); expect(exact.settings.worldHeight).toBe(1500);
  expect(errors).toEqual([]);
  await page.getByTitle('Close settings (✕)').click();
  await page.getByRole('button', {name: 'Center Cam', exact: true}).click();
  // Center Cam restores 0.85 zoom. Wheel events must target the canvas, not
  // the footer button where the preceding click left the mouse.
  const smallBounds = (await canvas.boundingBox())!;
  await page.mouse.move(smallBounds.x + smallBounds.width / 2, smallBounds.y + smallBounds.height / 2);
  for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 200);
  await expect.poll(async () => (await paint()).wall.scale).toBeCloseTo(.35, 6);
  // Pan a tall tank's phone into this short viewport without implicit scrolling.
  await page.mouse.down();
  await page.mouse.move(smallBounds.x + smallBounds.width / 2, smallBounds.y + smallBounds.height / 2 - 150, {steps: 4});
  await page.mouse.up();
  await phone('R').click({timeout: 5000});
  await expect.poll(() => page.getByTestId('tank-viewport').evaluate(node => node.scrollTop)).toBe(0);
  await expect.poll(() => page.getByRole('region', {name: 'Local aquarium connections', exact: true}).evaluate(node => node.scrollTop)).toBe(0);
  const card = (await menu('R').boundingBox())!;
  expect(card.x).toBeGreaterThanOrEqual(0); expect(card.x + card.width).toBeLessThanOrEqual(960);
  expect(card.y).toBeGreaterThanOrEqual(0); expect(card.y + card.height).toBeLessThanOrEqual(720);
  await page.setViewportSize({width: 1280, height: 900});
  await page.reload();
  const reloadedCanvas = (await canvas.boundingBox())!;
  await page.mouse.move(reloadedCanvas.x + reloadedCanvas.width / 2, reloadedCanvas.y + reloadedCanvas.height / 2);
  for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 200);
  await expect(phone('L')).toHaveAttribute('data-connected', 'false');
  await phone('L').click(); await expect(menu('L').getByLabel('Your display name')).toHaveValue('');
});


for (const fallback of [false, true]) test(`physical self-tube crossing conserves live state in ${fallback ? 'fallback' : 'Worker'}`, async ({page}) => {
  await page.goto(`./?autoplay${fallback ? '&mainthread' : ''}`);
  await page.getByTitle('Ecology & Physical Settings').click();
  const read = async () => {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export Snapshot', exact: true}).dispatchEvent('click');
    return JSON.parse(await readFile((await (await pending).path())!, 'utf8'));
  };
  for (const side of ['L', 'R'] as const) {
    const {source, settings} = selfTubeFixture(side);
    const canvas = page.getByLabel('Aquatic simulation'), epoch = await canvas.getAttribute('data-world-epoch');
    await page.locator('input[type=file]').setInputFiles({name: 'physical-tubes.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(source))});
    // An export issued before asynchronous import replaces the world can be
    // rejected by the intentional epoch guard. Observe replacement first.
    await expect(canvas).not.toHaveAttribute('data-world-epoch', epoch!);
    await expect.poll(async () => (await read()).state).toEqual(source.state);
    await expect(page.getByTestId('side-demo-window-L0')).toHaveAttribute('data-state', 'accepted');
    await page.getByRole('button', {name: 'Resume', exact: true}).click();
    await expect.poll(async () => {
      const s = await read(), x = s.state.organisms[0].segments[0].x;
      return side === 'L' ? x > settings.worldWidth : x < 0;
    }).toBe(true);
    await page.getByRole('button', {name: 'Pause', exact: true}).click();
    const arrived = await read();
    const ticks = Math.round(arrived.state.simTime * 60); expect(ticks).toBeGreaterThan(0);
    await page.addScriptTag({content: browserReplayCode});
    const expected = await page.evaluate(({source, ticks}) =>
      (window as any).selfTubeReplay.replaySelfTubeSnapshot(source, ticks), {source, ticks});
    expect(arrived.state).toEqual(expected);
    expect(arrived.state.organisms).toHaveLength(1);
    expect(arrived.state.organisms[0].id).toBe(source.state.organisms[0].id);
    expect(arrived.state.totalBirths).toBe(source.state.totalBirths);
    expect(Math.abs(totalAccountedEnergy(restoreSnapshot(arrived).state) - source.state.energyPool!.budget)).toBeLessThan(1e-6);
    expect((await read()).state).toEqual(arrived.state);
  }
});
