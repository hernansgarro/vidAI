/** Fork-only Stage 3 research, exercised through the existing Chromium shard. */
import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {activityCheckpoint} from './fixtures';

test('Stage 3 registered paused Canvas glow contrast (research only)', async ({page, browserName}, info) => {
  test.skip(browserName !== 'chromium', 'The registered profiling engine is Chromium; Firefox keeps existing regression coverage.');
  test.setTimeout(360000);
  await page.setViewportSize({width: 1280, height: 850});
  await page.addInitScript(() => {
    const audit: any = {enabled: false, omit: false, frames: 0, rows: [], native: {}, strokes: 0, workers: 0, messages: 0, acks: 0, previous: 0, sampled: false};
    (window as any).stage3 = audit;
    const BaseWorker = window.Worker;
    window.Worker = class extends BaseWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options); audit.workers++;
        this.addEventListener('message', event => {if (event.data?.type === 'frame') audit.messages++;});
      }
      postMessage(message: any, ...rest: any[]) {
        if (message?.type === 'ack') audit.acks++;
        return (BaseWorker.prototype.postMessage as any).call(this, message, ...rest);
      }
    };
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = callback => originalRAF.call(window, timestamp => {
      const beforeFrames = audit.frames, start = performance.now();
      callback(timestamp);
      if (audit.enabled && audit.frames !== beforeFrames) {
        audit.rows.push([timestamp, performance.now() - start, audit.previous ? timestamp - audit.previous : null]);
        audit.previous = timestamp;
      }
    });
    const proto = CanvasRenderingContext2D.prototype;
    const originalRect = proto.fillRect;
    proto.fillRect = function(...args: Parameters<typeof originalRect>) {
      if (this.canvas.getAttribute('aria-label') === 'Aquatic simulation' && args[0] === 0 && args[1] === 0) {
        audit.frames++; audit.sampled = audit.frames % 16 === 0;
      }
      return originalRect.apply(this, args);
    };
    const record = (key: string, elapsed: number) => {const row = audit.native[key] ??= {calls: 0, ms: 0}; row.calls++; row.ms += elapsed;};
    const originalStroke = proto.stroke;
    proto.stroke = function(this: CanvasRenderingContext2D, ...args: Parameters<typeof originalStroke>) {
      const style = String(this.strokeStyle);
      const energy = /^rgba\((34, 220, 105|245, 55, 65),/.test(style);
      if (energy && audit.enabled) audit.strokes++;
      if (energy && audit.omit) return;
      if (!(audit.enabled && audit.sampled)) return originalStroke.apply(this, args);
      const start = performance.now(); originalStroke.apply(this, args); record(energy ? 'energyStroke' : 'otherStroke', performance.now() - start);
    } as typeof originalStroke;
    const originalFill = proto.fill;
    proto.fill = function(this: CanvasRenderingContext2D, ...args: Parameters<typeof originalFill>) {
      if (!(audit.enabled && audit.sampled)) return originalFill.apply(this, args);
      const category = this.filter.includes('blur(16px)') ? 'causticFill' : 'otherFill';
      const start = performance.now(); originalFill.apply(this, args); record(category, performance.now() - start);
    } as typeof originalFill;
    const originalImage = proto.drawImage;
    proto.drawImage = function(this: CanvasRenderingContext2D, ...args: any[]) {
      if (!(audit.enabled && audit.sampled)) return (originalImage as any).apply(this, args);
      const key = args[0] instanceof HTMLCanvasElement ? 'surfaceComposite' : 'otherImage';
      const start = performance.now(); (originalImage as any).apply(this, args); record(key, performance.now() - start);
    } as typeof originalImage;
  });
  await page.goto('./?autoplay');
  await page.getByTitle('Ecology & Physical Settings').click();
  const source = activityCheckpoint();
  const snapshot = async () => {
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export Snapshot', exact: true}).dispatchEvent('click');
    return JSON.parse(await readFile((await (await download).path())!, 'utf8'));
  };
  await page.locator('input[type=file]').setInputFiles({name:'stage3-contact.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(source))});
  await expect.poll(async () => (await snapshot()).state).toEqual(source.state);
  expect(await page.evaluate(() => (window as any).stage3.workers)).toBeGreaterThan(0);
  await page.getByRole('button', {name:'1x',exact:true}).click();
  await expect.poll(() => page.evaluate(() => {const a=(window as any).stage3; a.enabled=true; return a.strokes;})).toBeGreaterThan(0);
  await page.getByRole('button', {name:'Pause',exact:true}).click();
  await expect(page.getByRole('button', {name:'Resume',exact:true})).toBeVisible();
  await page.waitForTimeout(250);
  const held = await snapshot();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable'); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval',{interval:4000});
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m:any)=>[m.name,m.value]));
  const runs: any[] = [];
  // AB/BA/AB, exactly three windows per rendering configuration, no retries.
  for(let rep=1;rep<=3;rep++) for(const omit of rep===2?[true,false]:[false,true]) {
    await page.evaluate(omit => {const a=(window as any).stage3;a.enabled=false;a.omit=omit;},omit);
    await page.waitForTimeout(10000);
    await page.evaluate(() => {const a=(window as any).stage3;a.rows=[];a.native={};a.strokes=0;a.previous=0;a.enabled=true;});
    const before=await metrics(); await cdp.send('Profiler.start');
    await page.waitForTimeout(30000);
    const {profile}=await cdp.send('Profiler.stop'); const after=await metrics();
    const capture=await page.evaluate(() => {
      const a=(window as any).stage3;a.enabled=false;
      const c=document.querySelector('canvas[aria-label="Aquatic simulation"]') as HTMLCanvasElement;
      return {rows:a.rows,native:a.native,strokes:a.strokes,workers:a.workers,messages:a.messages,acks:a.acks,
        viewport:[innerWidth,innerHeight],canvas:[c.width,c.height],dpr:devicePixelRatio,visibility:document.visibilityState,
        userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency};
    });
    expect(capture.rows.length).toBeGreaterThan(1);
    expect(capture.strokes).toBeGreaterThan(0);
    expect((await snapshot()).state).toEqual(held.state);
    runs.push({rep,omit,capture,before,after,profile});
  }
  await cdp.detach();
  // Exact original sample series/profiles are recovered from CI logs, compressed
  // to keep source evidence compact. No benchmark rerun is needed for archival.
  const evidence={source,held,runs,browserVersion:page.context().browser()?.version(),project:info.project.name};
  console.log('STAGE3_BROWSER_GZIP='+gzipSync(JSON.stringify(evidence)).toString('base64'));
});
