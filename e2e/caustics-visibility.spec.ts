import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {DEFAULT_SETTINGS, createSnapshot} from '../persistence';
import {createInitialWorld} from '../world';

test.setTimeout(60000);
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

      const cfg = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0};
      const state = createInitialWorld(cfg, 71, 'balanced', 'standard', 1);
      state.caustics = [{x: cfg.worldWidth / 2, y: cfg.worldHeight / 2, radius: 180,
        speed: .3, alpha: .09, angle: 0}];
      const source = createSnapshot(state, cfg);
      const upload = async (value: unknown) => {
        await page.locator('input[type=file]').setInputFiles({name: 'caustic-visibility.json',
          mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value))});
        await expect(page.getByRole('button', {name: 'Resume', exact: true})).toBeVisible();
      };
      const paintCount = async () => {
        await page.evaluate(() => { (window as any).causticBlurFills = 0; });
        await page.clock.runFor(64);
        return page.evaluate(() => (window as any).causticBlurFills as number);
      };

      await upload(source);
      await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
      const settings = page.getByTestId('settings-window');
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
