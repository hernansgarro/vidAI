import {test, expect, type Locator} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test.use({viewport: {width: 1360, height: 900}});
test.setTimeout(90000);
async function range(input: Locator, value: number) {
  await input.evaluate((node, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, String(v));
    node.dispatchEvent(new Event('input', {bubbles: true}));
    node.dispatchEvent(new Event('change', {bubbles: true}));
  }, value);
}

test('catalogue, saved specimens, live brain graph and draggable inspector', async ({page}) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./');
  await expect(page.getByText('By Hernán Garro & Federico Regueira', {exact: true}).last()).toBeVisible();
  await page.getByRole('button', {name: 'SEED SIMULATION', exact: true}).click();
  await page.getByTitle('Specimen Bank (Save & Spawn Custom Genomes)').click();
  const rows = page.getByTestId('specimen-row');
  await expect(rows).toHaveCount(50);
  await expect(rows.first().getByRole('button')).toHaveCount(1);
  // Native select keyboard actions must not trigger simulation hotkeys.
  await page.getByLabel('Body family').focus();
  await page.keyboard.press('Space'); await page.keyboard.press('Escape');
  await expect(page.getByRole('button', {name: 'RESUME SIMULATION', exact: true})).toBeHidden();
  await page.getByLabel('Body family').selectOption('Four paddles'); await expect(rows).toHaveCount(5);
  await page.getByLabel('Diet filter').selectOption('carnivore'); await expect(rows).toHaveCount(1);
  await rows.first().getByRole('button', {name: 'Spawn', exact: true}).click();
  await page.getByTitle('Close specimen bank (✕)').click();
  await page.getByTitle('Save to Specimen Bank', {exact: true}).click();
  await page.getByTitle('Inspect Specimen Brain & Vision Rays').click();
  const inspector = page.getByTestId('creature-inspector');
  await expect(page.getByRole('img', {name: 'Live recurrent neural network'})).toBeVisible();
  const before = await inspector.boundingBox();
  const header = inspector.getByText('RECURRENT BRAIN & DIAGNOSTICS');
  await header.hover(); await page.mouse.down(); await page.mouse.move(before!.x - 100, before!.y + 120, {steps: 8}); await page.mouse.up();
  const after = await inspector.boundingBox(); expect(after!.x).not.toBe(before!.x);
  const title = inspector.locator('circle title').filter({hasText: /^Hidden 1:/});
  const activation = await title.textContent();
  await expect.poll(() => title.textContent()).not.toBe(activation);
  await page.screenshot({path: test.info().outputPath('catalogue-inspector.png')});
  await page.reload(); await page.getByRole('button', {name: 'SEED SIMULATION', exact: true}).click();
  await page.getByTitle('Specimen Bank (Save & Spawn Custom Genomes)').click();
  await expect(page.getByTestId('specimen-row')).toHaveCount(51);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vida_specimen_bank_v3')!).length)).toBe(1);
  expect(errors).toEqual([]);
});

test('sandbox controls, zero food, diagnostic report and snapshot restore', async ({page}, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?autoplay');
  await page.getByTitle('Ecology & Physical Settings').click();
  await range(page.getByLabel('Nutrient target', {exact: true}), 0);
  await page.getByRole('button', {name: 'Clear Free Nutrients', exact: true}).click();
  await range(page.getByLabel('Tank width', {exact: true}), 1800);
  await range(page.getByLabel('Tank height', {exact: true}), 1000);
  await range(page.getByLabel('Gravity', {exact: true}), 10);
  await range(page.getByLabel('Maximum living creatures', {exact: true}), 1);
  await page.getByRole('button', {name: 'Copy Diagnostic Report', exact: true}).click();
  const report = JSON.parse(await page.getByLabel('Diagnostic report', {exact: true}).inputValue());
  expect(report.settings.targetNutrients).toBe(0); expect(report.population.nutrients).toBe(0);
  expect(report.settings.maxOrganisms).toBe(1); expect(report.settings.gravity).toBe(10);
  expect(Math.abs(report.energy.errorJ)).toBeLessThan(.001);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', {name: 'Export Snapshot', exact: true}).click();
  const download = await downloadPromise, saved = info.outputPath('world.json'); await download.saveAs(saved);
  const snapshot = JSON.parse(await readFile(saved, 'utf8'));
  expect(snapshot.settings.worldWidth).toBe(1800); expect(snapshot.state.nutrientAccumulator).toBe(0);
  await range(page.getByLabel('Gravity', {exact: true}), -100);
  await page.locator('input[type=file]').setInputFiles(saved);
  await expect(page.getByRole('button', {name: 'RESUME SIMULATION', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'RESUME SIMULATION', exact: true}).click();
  await expect(page.getByLabel('Gravity', {exact: true})).toHaveValue('10');
  await expect(page.getByLabel('Nutrient target', {exact: true})).toHaveValue('0');
  await expect(page.getByLabel('Tank width', {exact: true})).toHaveValue('1800');
  await page.screenshot({path: info.outputPath('sandbox.png')});
  expect(errors).toEqual([]);
});
