import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {DEFAULT_SETTINGS, createSnapshot} from '../persistence';
import {createInitialWorld, addExternalOrganism} from '../world';
import {createFounderGenome} from '../founders';
import {enableClosedEconomy, setWorldEnergy} from '../energyEconomy';

test.setTimeout(120000);
for (const fallback of [false, true]) test(`independent observer preferences, both spawn paths and exact imports (${fallback ? 'fallback' : 'Worker'})`, async ({page}, info) => {
  await page.setViewportSize({width: 1280, height: 850});
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
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
  await page.getByTitle('Ecology & Physical Settings').click();
  const read = async () => {
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export Snapshot', exact: true}).dispatchEvent('click');
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
    await settings.getByRole('button', {name: 'Advanced Settings', exact: true}).click();
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
    await expect.poll(() => page.evaluate(() => !!(window as any).originalCreaturePoint)).toBe(true);
    const point = await page.evaluate(() => (window as any).originalCreaturePoint);
    await canvas.click({position: point});
    await expect(badge).toHaveAttribute('data-organism-id', source.state.organisms[0].id);
  };
  for (const selectAddedCreature of [false, true]) for (const trackSelectedCreature of [false, true]) {
    await upload(source); await expect(badge).toHaveCount(0);
    const advanced = await openAdvanced();
    await expect(advanced.getByRole('checkbox')).toHaveCount(2);
    await advanced.getByLabel('Automatically select added creatures', {exact: true}).setChecked(selectAddedCreature);
    await advanced.getByLabel('Automatically track selected creatures', {exact: true}).setChecked(trackSelectedCreature);
    const configured = await read();
    expect(configured.state).toEqual(source.state); expect(configured.settings).toEqual(source.settings);
    expect(configured.metadata.observerPreferences).toEqual({selectAddedCreature, trackSelectedCreature});
    await advanced.getByTitle('Close advanced settings').click();
    await page.getByTitle('Close settings (✕)').click();
    await page.getByRole('button', {name: 'Add Life', exact: true}).click();
    if (selectAddedCreature) {
      await expect(badge).toBeVisible();
      await expect(badge.getByRole('button', {name: 'Track selected creature'})).toHaveAttribute('aria-pressed', String(trackSelectedCreature));
    } else await expect(badge).toHaveCount(0);
    await page.getByTitle('Ecology & Physical Settings').click();
    await expect.poll(async () => (await read()).state.organisms.length).toBe(2);
    await page.getByTitle('Close settings (✕)').click();
    // Clear any automatic choice, then explicitly pick the fixed original creature.
    if (!selectAddedCreature) await expect(badge).toHaveCount(0);
    await canvas.click({position: {x: 10, y: 10}});
    await selectCenter();
    const track = badge.getByRole('button', {name: 'Track selected creature'});
    await expect(track).toHaveAttribute('aria-pressed', String(trackSelectedCreature));
    await track.click(); await expect(track).toHaveAttribute('aria-pressed', String(!trackSelectedCreature));
    await track.click();
    await page.getByTitle('Specimen Bank (Save & Spawn Custom Genomes)').click();
    await page.getByTestId('specimen-row').first().getByRole('button', {name: 'Spawn', exact: true}).click();
    if (selectAddedCreature) {
      await expect(badge).not.toHaveAttribute('data-organism-id', source.state.organisms[0].id);
      await expect(track).toHaveAttribute('aria-pressed', String(trackSelectedCreature));
    } else await expect(badge).toHaveAttribute('data-organism-id', source.state.organisms[0].id);
    await page.getByTitle('Close specimen bank (✕)').click();
    await page.getByTitle('Ecology & Physical Settings').click();
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
  await override.getByLabel('Automatically select added creatures').uncheck();
  await override.getByLabel('Automatically track selected creatures').uncheck();
  await override.getByTitle('Close advanced settings').click();
  const beforeFork = await read(), epoch = Number(await canvas.getAttribute('data-world-epoch'));
  await settings.getByRole('button', {name: 'Fork', exact: true}).click();
  await expect(canvas).toHaveAttribute('data-world-epoch', String(epoch + 1));
  const forked = await read(); expect(forked.state).toEqual(beforeFork.state);
  expect(forked.metadata.observerPreferences).toEqual({selectAddedCreature: false, trackSelectedCreature: false});
  await page.setViewportSize({width: 375, height: 812});
  const advanced = await openAdvanced(), box = (await advanced.boundingBox())!, tank = (await canvas.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(tank.x); expect(box.x + box.width).toBeLessThanOrEqual(tank.x + tank.width);
  expect(box.y + box.height).toBeLessThanOrEqual(tank.y + tank.height);
  await page.screenshot({path: info.outputPath('observer-preferences-mobile.png')});
  expect(errors).toEqual([]);
});
