import {test, expect, type Locator} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {DEFAULT_SETTINGS, createSnapshot} from '../persistence';
import {createInitialWorld, addExternalOrganism} from '../world';
import {createFounderGenome} from '../founders';
import {enableClosedEconomy, setWorldEnergy} from '../energyEconomy';

test.setTimeout(120000);
const preferenceFailureNotes = new WeakMap<object, string[]>();
test.afterEach(async ({page}, info) => {
  const notes = preferenceFailureNotes.get(page);
  if (notes && info.status !== info.expectedStatus) {
    console.log('Observer preference browser diagnostics:', notes);
    console.log('Observer preference visible state:', await page.locator('body').innerText());
    await page.screenshot({path: info.outputPath('spatial-overlays-preferences-failure.png')});
  }
});
for (const fallback of [false, true]) test(`independent observer preferences, both spawn paths and exact imports (${fallback ? 'fallback' : 'Worker'})`, async ({page}, info) => {
  await page.setViewportSize({width: 1280, height: 850});
  // Paused-world policy checks need no continuous software-rendered tank.
  // Advance only the few frames used for physical picking and layout checks.
  await page.clock.install({time: new Date('2026-01-01T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-01-02T00:00:00Z'));
  const setChecked = async (checkbox: Locator, checked: boolean) => {
    if (await checkbox.isChecked() !== checked) await checkbox.dispatchEvent('click');
    await expect(checkbox).toBeChecked({checked});
  };
  const notes: string[] = []; preferenceFailureNotes.set(page, notes);
  page.on('console', message => {if (message.type() === 'warning' || message.type() === 'error') notes.push(message.text());});
  const errors: string[] = []; page.on('pageerror', e => {errors.push(e.message); notes.push(e.message);});
  await page.addInitScript(() => {
    const translate = CanvasRenderingContext2D.prototype.translate;
    CanvasRenderingContext2D.prototype.translate = function(x, y) {
      translate.call(this, x, y);
      if (x === 1200 && y === 750) {
        const m = this.getTransform(); (window as any).originalCreaturePoint = {x: m.e / devicePixelRatio, y: m.f / devicePixelRatio};
      }
    };
  });
  await page.goto(`./?autoplay${fallback ? '&mainthread' : ''}`);
  await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
  const read = async () => {
    const download = page.waitForEvent('download');
    // Use a trusted click for repeated browser downloads. The clock is frozen,
    // so force skips animation-frame stability waits; state assertions stay exact.
    await page.getByRole('button', {name: 'Export Snapshot', exact: true}).click({force: true});
    return JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  };
  const cfg = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0};
  const state = createInitialWorld(cfg, 126, 'balanced', 'standard', 0);
  addExternalOrganism(state, createFounderGenome('FND-001'), cfg, 1200, 750, 0);
  enableClosedEconomy(state); setWorldEnergy(state, 1e6);
  const config = {...cfg, ecologyRegime: 'closed-v1' as const, nutrientLimit: null};
  const source = createSnapshot(state, config);
  const canvas = page.getByLabel('Aquatic simulation'), badge = page.getByTestId('badge-window');
  const settings = page.getByTestId('settings-window');
  const openAdvanced = async () => {
    await settings.getByRole('button', {name: 'Advanced Settings', exact: true}).dispatchEvent('click');
    return page.getByRole('dialog', {name: 'Advanced Settings', exact: true});
  };
  const upload = async (snapshot: unknown) => {
    const epoch = Number(await canvas.getAttribute('data-world-epoch'));
    await page.locator('input[type=file]').setInputFiles({name: 'observer-preferences.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(snapshot))});
    await expect(canvas).toHaveAttribute('data-world-epoch', String(epoch + 1));
    await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
    await expect.poll(async () => (await read()).state).toEqual((snapshot as any).state);
  };
  const selectCenter = async () => {
    await page.clock.runFor(32);
    await expect.poll(() => page.evaluate(() => !!(window as any).originalCreaturePoint)).toBe(true);
    const point = await page.evaluate(() => (window as any).originalCreaturePoint);
    const box = (await canvas.boundingBox())!;
    await page.mouse.click(box.x + point.x, box.y + point.y);
    await expect(badge).toHaveAttribute('data-organism-id', source.state.organisms[0].id);
  };
  for (const selectAddedCreature of [false, true]) for (const trackSelectedCreature of [false, true]) {
    await upload(source); await expect(badge).toHaveCount(0);
    const advanced = await openAdvanced();
    await expect(advanced.getByRole('checkbox')).toHaveCount(6);
    await setChecked(advanced.getByLabel('Automatically select added creatures', {exact: true}), selectAddedCreature);
    await setChecked(advanced.getByLabel('Automatically track selected creatures', {exact: true}), trackSelectedCreature);
    const configured = await read();
    expect(configured.state).toEqual(source.state); expect(configured.settings).toEqual(source.settings);
    expect(configured.metadata.observerPreferences).toEqual({selectAddedCreature, trackSelectedCreature, showCaustics: true});
    await advanced.getByTitle('Close advanced settings').dispatchEvent('click');
    await page.getByTitle('Close settings (✕)').dispatchEvent('click');
    await page.getByRole('button', {name: 'Add Life', exact: true}).dispatchEvent('click');
    if (selectAddedCreature) {
      await expect(badge).toBeVisible();
      await expect(badge.getByRole('button', {name: 'Track selected creature'})).toHaveAttribute('aria-pressed', String(trackSelectedCreature));
    } else await expect(badge).toHaveCount(0);
    await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
    await expect.poll(async () => (await read()).state.organisms.length).toBe(2);
    await page.getByTitle('Close settings (✕)').dispatchEvent('click');
    // Clear any automatic choice, then explicitly pick the fixed original creature.
    if (!selectAddedCreature) await expect(badge).toHaveCount(0);
    const box = (await canvas.boundingBox())!;
    await page.mouse.click(box.x + 10, box.y + 10);
    await selectCenter();
    const track = badge.getByRole('button', {name: 'Track selected creature'});
    await expect(track).toHaveAttribute('aria-pressed', String(trackSelectedCreature));
    await track.dispatchEvent('click'); await expect(track).toHaveAttribute('aria-pressed', String(!trackSelectedCreature));
    await track.dispatchEvent('click');
    await page.getByTitle('Specimen Bank (Save & Spawn Custom Genomes)').dispatchEvent('click');
    await page.getByTestId('specimen-row').first().getByRole('button', {name: 'Spawn', exact: true}).dispatchEvent('click');
    if (selectAddedCreature) {
      await expect(badge).not.toHaveAttribute('data-organism-id', source.state.organisms[0].id);
      await expect(track).toHaveAttribute('aria-pressed', String(trackSelectedCreature));
    } else await expect(badge).toHaveAttribute('data-organism-id', source.state.organisms[0].id);
    await page.getByTitle('Close specimen bank (✕)').dispatchEvent('click');
    await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
    await expect.poll(async () => (await read()).state.organisms.length).toBe(3);
    if (!selectAddedCreature) await expect(badge).toHaveAttribute('data-organism-id', source.state.organisms[0].id);
    const final = await read(); await upload(final);
    const restored = await openAdvanced();
    await expect(restored.getByLabel('Automatically select added creatures')).toBeChecked({checked: selectAddedCreature});
    await expect(restored.getByLabel('Automatically track selected creatures')).toBeChecked({checked: trackSelectedCreature});
    await restored.getByLabel('Automatically track selected creatures').focus();
    await page.keyboard.press('Escape'); await expect(restored).toHaveCount(0);
  }
  const override = await openAdvanced();
  await setChecked(override.getByLabel('Automatically select added creatures'), false);
  await setChecked(override.getByLabel('Automatically track selected creatures'), false);
  await setChecked(override.getByLabel('Show water caustics'), false);
  await override.getByTitle('Close advanced settings').dispatchEvent('click');
  const beforeFork = await read(), epoch = Number(await canvas.getAttribute('data-world-epoch'));
  await settings.getByRole('button', {name: 'Fork', exact: true}).dispatchEvent('click');
  await expect(canvas).toHaveAttribute('data-world-epoch', String(epoch + 1));
  const forked = await read(); expect(forked.state).toEqual(beforeFork.state);
  expect(forked.metadata.observerPreferences).toEqual({selectAddedCreature: false, trackSelectedCreature: false, showCaustics: false});
  await page.setViewportSize({width: 375, height: 812});
  const advanced = await openAdvanced();
  await page.clock.runFor(32);
  const box = (await advanced.boundingBox())!, tank = (await canvas.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(tank.x); expect(box.x + box.width).toBeLessThanOrEqual(tank.x + tank.width);
  expect(box.y + box.height).toBeLessThanOrEqual(tank.y + tank.height);
  await page.screenshot({path: info.outputPath('observer-preferences-mobile.png')});
  expect(errors).toEqual([]);
});

for (const fallback of [false, true]) {
  test(`caustic paint can be disabled without changing authoritative world state (${fallback ? 'fallback' : 'Worker'})`,
    async ({page}) => {
      await page.setViewportSize({width: 1280, height: 850});
      await page.clock.install({time: new Date('2026-01-01T00:00:00Z')});
      await page.clock.pauseAt(new Date('2026-01-02T00:00:00Z'));
      const pageErrors: string[] = [];
      page.on('pageerror', error => pageErrors.push(error.message));

      // Count precisely the expensive native caustic filter submissions, not display FPS.
      await page.addInitScript(() => {
        (window as any).causticBlurFills = 0;
        const original = CanvasRenderingContext2D.prototype.fill;
        CanvasRenderingContext2D.prototype.fill = function(...args: any[]) {
          if (this.filter === 'blur(16px)') (window as any).causticBlurFills++;
          return (original as any).apply(this, args);
        };
      });
      await page.goto(`./?autoplay${fallback ? '&mainthread' : ''}`);

      const cfg = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, nutrientLimit: null};
      const state = createInitialWorld(cfg, 71, 'balanced', 'standard', 1);
      state.caustics = [{x: cfg.worldWidth / 2, y: cfg.worldHeight / 2, radius: 180,
        speed: .3, alpha: .09, angle: 0}];
      const source = createSnapshot(state, cfg);
      const upload = async (value: unknown) => {
        await page.getByTestId('settings-window').locator('input[type=file]').setInputFiles({name: 'caustic-visibility.json',
          mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value))});
        await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
      };
      const paintCount = async () => {
        await page.evaluate(() => { (window as any).causticBlurFills = 0; });
        await page.clock.runFor(64);
        return page.evaluate(() => (window as any).causticBlurFills as number);
      };

      await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
      const settings = page.getByTestId('settings-window');
      await expect(settings).toBeVisible();
      await upload(source);
      await settings.getByRole('button', {name: 'Advanced Settings', exact: true}).dispatchEvent('click');
      const toggle = page.getByRole('dialog', {name: 'Advanced Settings'}).getByLabel('Show water caustics');
      await expect(toggle).toBeChecked();
      expect(await paintCount()).toBeGreaterThan(0);

      const read = async () => {
        const download = page.waitForEvent('download');
        await page.getByRole('button', {name: 'Export Snapshot', exact: true}).dispatchEvent('click');
        return JSON.parse(await readFile((await (await download).path())!, 'utf8'));
      };
      await toggle.dispatchEvent('click');
      await expect(toggle).not.toBeChecked();
      expect(await paintCount()).toBe(0);
      const hidden = await read();
      expect(hidden.metadata.observerPreferences.showCaustics).toBe(false);
      expect(hidden.state).toEqual(source.state);
      expect(hidden.settings).toEqual(source.settings);

      await toggle.dispatchEvent('click');
      await expect(toggle).toBeChecked();
      expect(await paintCount()).toBeGreaterThan(0);
      await toggle.dispatchEvent('click');
      expect(await paintCount()).toBe(0);

      // Explicit observer metadata restores the override; historical snapshots remain visible.
      await upload(hidden);
      await expect(toggle).not.toBeChecked();
      expect(await paintCount()).toBe(0);
      await upload(source);
      await expect(toggle).toBeChecked();
      expect(await paintCount()).toBeGreaterThan(0);
      expect(pageErrors).toEqual([]);
    });
}

for (const fallback of [false, true]) test(`diagnostic console retains, filters and clears observer-only history (${fallback ? 'fallback' : 'Worker'})`, async ({page}, info) => {
  await page.setViewportSize({width: 1280, height: 850});
  await page.clock.install({time: new Date('2026-01-01T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-01-02T00:00:00Z'));
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  if (!fallback) await page.addInitScript(() => {
    const OriginalWorker = window.Worker;
    window.Worker = class extends OriginalWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options); (window as any).diagnosticTestWorker = this;
      }
    };
  });
  await page.goto(`./?autoplay${fallback ? '&mainthread' : ''}`);
  await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
  const settings = page.getByTestId('settings-window');
  const read = async () => {
    const download = page.waitForEvent('download');
    await settings.getByRole('button', {name: 'Export Snapshot', exact: true}).dispatchEvent('click');
    return JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  };
  const cfg = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, nutrientLimit: null};
  const source = createSnapshot(createInitialWorld(cfg, 73, 'balanced', 'standard', 1), cfg);
  const upload = async (text: string) => settings.locator('input[type=file]').setInputFiles({name: 'diagnostics.json', mimeType: 'application/json', buffer: Buffer.from(text)});
  await upload(JSON.stringify(source));
  await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
  await expect.poll(async () => (await read()).state).toEqual(source.state);
  const before = await read();
  // A real rejected import records an error while the console has never been mounted.
  await upload('invalid-json');
  const open = async () => {
    await settings.getByRole('button', {name: 'Advanced Settings', exact: true}).dispatchEvent('click');
    await page.getByRole('button', {name: 'System diagnostics', exact: true}).dispatchEvent('click');
    return page.getByRole('region', {name: 'System diagnostics', exact: true});
  };
  const console = await open();
  const rows = console.getByTestId('diagnostic-event');
  await expect(rows).toHaveCount(3);
  await expect(console.getByRole('heading', {name: 'System diagnostics'})).toBeFocused();
  await expect(rows.first()).toContainText('Snapshot import failed:');
  await expect(rows.last()).toContainText(fallback ? 'Main-thread simulation explicitly selected.' : 'Simulation Worker initialized.');
  await expect(rows.first().locator('time')).toHaveAttribute('datetime', /2026-01-02T/);
  await console.getByLabel('Diagnostic severity').selectOption('error');
  await expect(rows).toHaveCount(1);
  await console.getByLabel('Diagnostic subsystem').selectOption(fallback ? 'runtime' : 'worker');
  await expect(rows).toHaveCount(0); await expect(console.getByText('No events match these filters.')).toBeVisible();
  await console.getByLabel('Diagnostic severity').selectOption('');
  await expect(rows).toHaveCount(1);
  await console.getByLabel('Diagnostic subsystem').selectOption('persistence');
  await expect(rows).toHaveCount(2);
  // A live event updates the visible console without polling or simulation ticks.
  await upload(JSON.stringify(source));
  await expect(rows).toHaveCount(3);
  await console.getByLabel('Diagnostic subsystem').selectOption('');
  await expect(rows).toHaveCount(4);
  const afterBrowsing = await read();
  expect(afterBrowsing.state).toEqual(before.state); expect(afterBrowsing.settings).toEqual(before.settings);
  expect(afterBrowsing.metadata).toEqual(before.metadata);
  // Space activates the focused console control, without toggling playback.
  await console.getByRole('button', {name: 'Clear history', exact: true}).focus();
  await page.keyboard.press('Space');
  await expect(rows).toHaveCount(0);
  await expect(console.getByRole('button', {name: 'Clear history', exact: true})).toBeDisabled();
  await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
  await expect(console.getByText('No diagnostic events recorded.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(console).toHaveCount(0);
  const entry = page.getByRole('button', {name: 'System diagnostics', exact: true});
  await expect(entry).toBeFocused();
  await page.keyboard.press('Space');
  await expect(console).toBeVisible(); await expect(rows).toHaveCount(0);
  await console.getByRole('button', {name: 'Back to advanced settings'}).dispatchEvent('click');
  await expect(entry).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('advanced-settings-window')).toHaveCount(0);
  if (!fallback) {
    // Exercise the existing client error callback; no test seam is added to runtime code.
    await page.evaluate(() => {
      const worker = (window as any).diagnosticTestWorker as Worker;
      worker.onerror?.(new ErrorEvent('error', {message: '<img src=x onerror=alert(1)> diagnostic fixture'}));
    });
  } else await upload('invalid-json');
  await open(); await expect(rows).toHaveCount(1);
  if (!fallback) {
    await expect(rows).toContainText('<img src=x onerror=alert(1)> diagnostic fixture');
    await expect(rows.locator('img')).toHaveCount(0);
  }
  await page.setViewportSize({width: 375, height: 812});
  await page.clock.runFor(48);
  const box = (await page.getByTestId('advanced-settings-window').boundingBox())!;
  const tank = (await page.getByLabel('Aquatic simulation').boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(tank.x);
  expect(box.x + box.width).toBeLessThanOrEqual(tank.x + tank.width);
  expect(box.y).toBeGreaterThanOrEqual(tank.y);
  expect(box.y + box.height).toBeLessThanOrEqual(tank.y + tank.height);
  await page.screenshot({path: info.outputPath('diagnostics-mobile.png')});
  const final = await read();
  expect(final.state).toEqual(source.state); expect(final.settings).toEqual(source.settings);
  expect(final.metadata).toEqual(before.metadata);
  expect(errors).toEqual([]);
});

test('diagnostic warning retains a real Worker initialization fallback', async ({page}) => {
  await page.clock.install(); await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.addInitScript(() => {
    window.Worker = class {constructor() {throw new Error('Worker fixture unavailable');}} as any;
  });
  await page.goto('./?autoplay');
  await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
  await page.getByRole('button', {name: 'Advanced Settings', exact: true}).dispatchEvent('click');
  await page.getByRole('button', {name: 'System diagnostics', exact: true}).dispatchEvent('click');
  const console = page.getByRole('region', {name: 'System diagnostics'});
  await console.getByLabel('Diagnostic severity').selectOption('warning');
  await expect(console.getByTestId('diagnostic-event')).toHaveCount(1);
  await expect(console.getByTestId('diagnostic-event')).toContainText('Worker unavailable; running simulation on the main thread.');
});

for (const fallback of [false, true]) test(`grid audit uses authoritative paused state and session-only opt-in (${fallback ? 'fallback' : 'Worker'})`, async ({page}) => {
  await page.setViewportSize({width: 1280, height: 850});
  await page.clock.install({time: new Date('2026-01-01T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-01-02T00:00:00Z'));
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`./?autoplay${fallback ? '&mainthread' : ''}`);
  await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
  const settings = page.getByTestId('settings-window');
  const config = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0};
  const state = createInitialWorld(config, 73, 'balanced', 'standard', 2);
  // Valid saved separation exercises the unconditional candidate path.
  state.organisms[0].segments.at(-1)!.x += 9000;
  const source = createSnapshot(state, config);
  const upload = async () => {
    const canvas = page.getByLabel('Aquatic simulation');
    const epoch = Number(await canvas.getAttribute('data-world-epoch'));
    await settings.locator('input[type=file]').setInputFiles({name: 'grid-audit.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(source))});
    // File.text() completes asynchronously. Wait for reset before exporting:
    // an earlier export request can otherwise be cancelled by world replacement.
    await expect(canvas).toHaveAttribute('data-world-epoch', String(epoch+1));
    await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
  };
  await upload();
  await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
  const read = async () => {
    const download = page.waitForEvent('download');
    await settings.getByRole('button', {name: 'Export Snapshot', exact: true}).dispatchEvent('click');
    return JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  };
  await expect.poll(async () => (await read()).state).toEqual(source.state);
  const before = await read();
  await settings.getByRole('button', {name: 'Advanced Settings', exact: true}).dispatchEvent('click');
  const advanced = page.getByRole('dialog', {name: 'Advanced Settings', exact: true});
  const toggle = advanced.getByLabel('Periodic grid integrity audit (60 simulated seconds)', {exact: true});
  await expect(toggle).not.toBeChecked();
  await toggle.focus(); await page.keyboard.press('Space'); await expect(toggle).toBeChecked();
  await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
  await advanced.getByRole('button', {name: 'Audit grid now', exact: true}).dispatchEvent('click');
  const console = page.getByRole('region', {name: 'System diagnostics', exact: true});
  await expect(console).toBeVisible();
  await console.getByLabel('Diagnostic subsystem').selectOption('grid-integrity');
  const rows = console.getByTestId('diagnostic-event');
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText('manual grid audit at t=0.000s: passed');
  await expect(rows).toContainText('unconditional candidates');
  await expect(rows.locator('time')).toHaveAttribute('datetime', /2026-01-02T/);
  // Even a long paused wall-clock advance must not produce a periodic audit.
  await page.clock.fastForward(61000);
  await expect(rows).toHaveCount(1);
  const after = await read(); expect(after.state).toEqual(before.state); expect(after.settings).toEqual(before.settings);
  expect(after.metadata).toEqual(before.metadata);
  await console.getByRole('button', {name: 'Back to advanced settings'}).dispatchEvent('click');
  await expect(toggle).toBeChecked();
  await upload(); await expect.poll(async () => (await read()).state).toEqual(source.state);
  await expect(toggle).toBeChecked();
  await toggle.dispatchEvent('click'); await expect(toggle).not.toBeChecked();
  await advanced.getByRole('button', {name: 'Audit grid now', exact: true}).dispatchEvent('click');
  await expect(console).toBeVisible(); await console.getByLabel('Diagnostic subsystem').selectOption('grid-integrity');
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText('passed');
  await page.setViewportSize({width: 375, height: 812}); await page.clock.runFor(32);
  const box = (await advanced.boundingBox())!, tank = (await page.getByLabel('Aquatic simulation').boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(tank.x); expect(box.x+box.width).toBeLessThanOrEqual(tank.x+tank.width);
  expect(box.y+box.height).toBeLessThanOrEqual(tank.y+tank.height);
  expect(errors).toEqual([]);
});

test.describe('P6 diagnostics at DPR2',()=>{
  test.use({deviceScaleFactor:2});
  test.afterEach(async ({page},info)=>{
    if(info.status!==info.expectedStatus) await page.screenshot({path:info.outputPath('spatial-overlays-failure.png')});
  });
for (const fallback of [false, true]) test(`spatial overlays: independent options, real canvas colors, scaling, imports and state isolation (${fallback ? 'fallback' : 'Worker'})`, async ({page}, info) => {
  await page.setViewportSize({width: 1280,height: 850});
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-01-02T00:00:00Z'));
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    const w=window as any; w.spatialPaint={cells:[],envelopes:[]}; w.overlayFrames=[];
    const strokeRect=CanvasRenderingContext2D.prototype.strokeRect;
    CanvasRenderingContext2D.prototype.strokeRect=function(x,y,width,height){
      if(Math.abs(this.globalAlpha-.55)<1e-6){
        const m=this.getTransform();
        if(w.spatialPaint.cells.length<2000) w.spatialPaint.cells.push({color:this.strokeStyle,x,y,width,height,
          cssWidth:this.lineWidth*Math.hypot(m.a,m.b)/devicePixelRatio});
      }
      return strokeRect.call(this,x,y,width,height);
    };
    const stroke=CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke=function(...args:any[]){
      if(Math.abs(this.globalAlpha-.55)<1e-6 && this.strokeStyle==='#0000ff' && w.spatialPaint.envelopes.length<2000)
        w.spatialPaint.envelopes.push({dash:this.getLineDash(),lineWidth:this.lineWidth});
      return (stroke as any).apply(this,args);
    };
    const OriginalWorker=window.Worker;
    window.Worker=class extends OriginalWorker {
      constructor(url:URL|string,options?:WorkerOptions){
        super(url,options); this.addEventListener('message',({data})=>{
          if(data.type==='frame') {w.overlayFrames.push({epoch:data.frame.epoch,overlay:data.frame.spatialOverlay});
            if(w.overlayFrames.length>100) w.overlayFrames.shift();}
        });
      }
    } as typeof Worker;
  });
  await page.goto(`./?autoplay${fallback?'&mainthread':''}`);
  await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
  const cfg={...DEFAULT_SETTINGS,targetNutrients:0,inflowRate:0};
  const state=createInitialWorld(cfg,712,'balanced','standard',0);
  addExternalOrganism(state,createFounderGenome('CUR-009'),cfg,1200,750,0);
  const {food}=await import('../tests/support/nutrient-cycle');
  state.nutrients.push(food(3000,false,1200,750),{...food(3000,true,1200,750),id:'carrion-overlay'},
    {...food(3000,false,800,750),id:'nutrient-overlay'});
  const source=createSnapshot(state,cfg);
  const canvas=page.getByLabel('Aquatic simulation');
  const upload=async()=>{
    const epoch=Number(await canvas.getAttribute('data-world-epoch'));
    await page.locator('input[type=file]').setInputFiles({name:'spatial-overlays.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(source))});
    await expect(canvas).toHaveAttribute('data-world-epoch',String(epoch+1));
    await expect(page.getByRole('button',{name:'Resume',exact:true})).toBeVisible();
  };
  const read=async()=>{
    const download=page.waitForEvent('download');
    await page.getByRole('button',{name:'Export Snapshot',exact:true}).dispatchEvent('click');
    return JSON.parse(await readFile((await (await download).path())!,'utf8'));
  };
  await upload();
  await page.getByTestId('settings-window').getByRole('button',{name:'Advanced Settings',exact:true}).dispatchEvent('click');
  const advanced=page.getByRole('dialog',{name:'Advanced Settings',exact:true});
  const cells=advanced.getByLabel('Show spatial cell borders',{exact:true});
  const envelopes=advanced.getByLabel('Show creature enclosures',{exact:true});
  await expect(cells).not.toBeChecked(); await expect(envelopes).not.toBeChecked();
  const before=await read();
  const paint=async()=>{
    await page.evaluate(()=>{(window as any).spatialPaint={cells:[],envelopes:[]};});
    await page.clock.runFor(64);
    return page.evaluate(()=>(window as any).spatialPaint);
  };
  expect(await paint()).toEqual({cells:[],envelopes:[]});
  if(!fallback) expect(await page.evaluate(()=>(window as any).overlayFrames.every((f:any)=>!f.overlay))).toBe(true);
  await cells.dispatchEvent('click');
  if(!fallback) await expect.poll(()=>page.evaluate(()=>(window as any).overlayFrames.at(-1)?.overlay?.cells?.length??0)).toBeGreaterThan(0);
  let painted=await paint(); expect(painted.cells.length).toBeGreaterThan(0); expect(painted.envelopes).toEqual([]);
  expect(painted.cells.some((c:any)=>c.color==='#ffffff')).toBe(true);
  expect(painted.cells.some((c:any)=>c.color==='#00ff00')).toBe(true);
  // Native canvas state/transforms can round through float32 in either engine.
  // This is 0.0001% of one CSS pixel; the pure geometry test remains exact.
  expect(painted.cells.every((c:any)=>Math.abs(c.cssWidth-1)<1e-6),JSON.stringify(painted.cells)).toBe(true);
  await cells.dispatchEvent('click'); await envelopes.dispatchEvent('click');
  if(!fallback) await expect.poll(()=>page.evaluate(()=>(window as any).overlayFrames.at(-1)?.overlay?.envelopes?.length??0)).toBeGreaterThan(0);
  painted=await paint(); expect(painted.cells).toEqual([]); expect(painted.envelopes.some((e:any)=>e.dash.length===2)).toBe(true);
  await cells.dispatchEvent('click');
  if(!fallback) await expect.poll(()=>page.evaluate(()=>(window as any).overlayFrames.at(-1)?.overlay?.cells?.length??0)).toBeGreaterThan(0);
  painted=await paint(); expect(painted.cells.length).toBeGreaterThan(0); expect(painted.envelopes.length).toBeGreaterThan(0);
  const observed=await read(); expect(observed).toEqual(before);
  await upload(); await expect(cells).toBeChecked(); await expect(envelopes).toBeChecked();
  expect(await read()).toEqual(before);
  // Actual native paint and camera zoom remain CSS-pixel thin.
  const box=(await canvas.boundingBox())!;
  await page.mouse.move(box.x+box.width*.7,box.y+box.height*.7); await page.mouse.wheel(0,-300);
  await page.clock.runFor(64); painted=await paint();
  expect(painted.cells.length).toBeGreaterThan(0);
  // Native canvas state/transforms can round through float32 in either engine.
  // This is 0.0001% of one CSS pixel; the pure geometry test remains exact.
  expect(painted.cells.every((c:any)=>Math.abs(c.cssWidth-1)<1e-6),JSON.stringify(painted.cells)).toBe(true);
  await advanced.getByTitle('Close advanced settings').dispatchEvent('click');
  await page.getByTitle('Close settings (✕)').dispatchEvent('click'); await page.clock.runFor(64);
  await page.screenshot({path:info.outputPath('spatial-overlays-desktop.png')});
  await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
  await page.getByTestId('settings-window').getByRole('button',{name:'Advanced Settings',exact:true}).dispatchEvent('click');
  await page.setViewportSize({width:375,height:812}); await page.clock.runFor(64);
  const panel=(await advanced.boundingBox())!,tank=(await canvas.boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(tank.x); expect(panel.x+panel.width).toBeLessThanOrEqual(tank.x+tank.width);
  expect(panel.y+panel.height).toBeLessThanOrEqual(tank.y+tank.height);
  await page.screenshot({path:info.outputPath('spatial-overlays-mobile.png')});
  await cells.dispatchEvent('click'); await envelopes.dispatchEvent('click');
  expect(await paint()).toEqual({cells:[],envelopes:[]});
  if(!fallback) await expect.poll(()=>page.evaluate(()=>!(window as any).overlayFrames.at(-1)?.overlay)).toBe(true);
  expect(await read()).toEqual(before); expect(errors).toEqual([]);
});

});
