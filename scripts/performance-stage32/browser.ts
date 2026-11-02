/** Optional, explicitly preregistered Stage 3.2 research; never imported by app. */
import {test, expect} from '@playwright/test';
import {readFileSync, writeFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {gunzipSync, gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

test('Stage 3.2 registered deferred Canvas raster investigation', async ({page, browserName}, info) => {
  test.skip(browserName !== 'chromium', 'Registered research engine only; inherited Firefox cases remain unchanged.');
  test.setTimeout(600000);
  const output = 'docs/experiments/performance-stage-3-v2';
  const hash = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex');
  const pilot = JSON.parse(gunzipSync(readFileSync('docs/experiments/performance-stage-3-v1/browser-original.json.gz')).toString());
  const held = pilot.held;
  const result: any = {stage: '3.2', started: new Date().toISOString(), sourceSHA: execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    checkpointHash: hash(held), held, project: info.project.name, runs: [], diagnostics: [], copy: [], failures: [],
    os: execFileSync('uname',['-a'],{encoding:'utf8'}).trim(), cpu: readFileSync('/proc/cpuinfo','utf8').split('\n').find(x=>x.startsWith('model name'))};
  let cdp: any;
  try {
    await page.setViewportSize({width:1280,height:850});
    await page.addInitScript(() => {
      const a: any = {active:false, timers:false, mode:'baseline', rows:[], frames:0, messages:0, acks:0, workers:0, previous:0, current:{}, source:null};
      (window as any).stage32 = a;
      const Base = window.Worker;
      window.Worker = class extends Base {
        constructor(url: string|URL, options?: WorkerOptions) {super(url,options);a.workers++;this.addEventListener('message',e=>{if(e.data?.type==='frame')a.messages++;});}
        postMessage(packet:any,...rest:any[]) {if(packet?.type==='ack')a.acks++;return (Base.prototype.postMessage as any).call(this,packet,...rest);}
      };
      const proto=CanvasRenderingContext2D.prototype;
      const rect=proto.fillRect, fill=proto.fill, image=proto.drawImage, read=proto.getImageData;
      a.nativeImage=image; a.nativeRead=read;
      const record=(key:string,ms:number) => {a.current[key]=(a.current[key]??0)+ms;};
      proto.fillRect=function(this: CanvasRenderingContext2D, ...args:Parameters<typeof rect>) {
        if(this.canvas.getAttribute('aria-label')==='Aquatic simulation' && args[0]===0 && args[1]===0) {a.frames++;a.current={};}
        return rect.apply(this,args);
      };
      proto.fill=function(this: CanvasRenderingContext2D, ...args:Parameters<typeof fill>) {
        if(this.filter!=='blur(16px)')return fill.apply(this,args);
        if(a.active) {a.current.causticCalls=(a.current.causticCalls??0)+1;a.transform=Array.from(this.getTransform().toFloat64Array());}
        if(a.mode==='no-caustics')return;
        const previous=this.filter;
        if(a.mode==='unblur')this.filter='none';
        const start=a.active&&a.timers?performance.now():0;
        try {return fill.apply(this,args);} finally {
          if(a.active&&a.timers)record('causticMs',performance.now()-start);
          if(a.mode==='unblur')this.filter=previous;
        }
      } as typeof fill;
      proto.drawImage=function(this: CanvasRenderingContext2D, ...args:any[]) {
        const composition=this.canvas.getAttribute('aria-label')==='Aquatic simulation' && args[0] instanceof HTMLCanvasElement;
        if(!composition)return (image as any).apply(this,args);
        a.source=args[0];
        if(a.mode==='flush') {
          const start=performance.now();read.call(args[0].getContext('2d'),0,0,1,1);
          if(a.active)record('flushMs',performance.now()-start);
        }
        const start=a.active&&a.timers?performance.now():0;
        try{return (image as any).apply(this,args);}finally{if(a.active&&a.timers)record('compositeMs',performance.now()-start);}
      } as typeof image;
      const raf=window.requestAnimationFrame;
      window.requestAnimationFrame=callback=>raf.call(window,t=>{
        const before=a.frames,start=performance.now();callback(t);
        if(a.active && a.frames!==before) {a.rows.push({timestamp:t,callbackMs:performance.now()-start,intervalMs:a.previous?t-a.previous:null,...a.current});a.previous=t;}
      });
    });
    await page.goto('./?autoplay');
    await page.getByTitle('Ecology & Physical Settings').click();
    const snapshot=async()=>{const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export Snapshot',exact:true}).dispatchEvent('click');return JSON.parse(await readFile((await (await event).path())!,'utf8'));};
    await page.locator('input[type=file]').setInputFiles({name:'stage32-held.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(held))});
    await expect.poll(async()=>(await snapshot()).state,{timeout:15000}).toEqual(held.state);
    await expect(page.getByRole('button',{name:'Resume',exact:true})).toBeVisible();
    result.initial=await snapshot();expect(result.initial.state).toEqual(held.state);
    const browser=page.context().browser()!;
    result.browserVersion=browser.version();
    const browserCDP=await browser.newBrowserCDPSession();
    for(const method of ['Browser.getVersion','SystemInfo.getInfo','Browser.getBrowserCommandLine']) {
      try {result[method]=await browserCDP.send(method as any);}catch(e){result[method]={unavailable:String(e)};}
    }
    await browserCDP.detach();
    cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
    const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x:any)=>[x.name,x.value]));
    const started=Date.now();
    const configure=async(mode:string,timers:boolean)=>{
      await page.evaluate(({mode,timers})=>{const a=(window as any).stage32;a.active=false;a.mode=mode;a.timers=timers;},{mode,timers});
      await page.waitForTimeout(2000);
      await page.evaluate(()=>{const a=(window as any).stage32;a.rows=[];a.previous=0;a.active=true;});
    };
    const capture=async()=>page.evaluate(()=>{
      const a=(window as any).stage32;a.active=false;
      const c=document.querySelector('canvas[aria-label="Aquatic simulation"]') as HTMLCanvasElement;
      return {rows:a.rows,workers:a.workers,messages:a.messages,acks:a.acks,canvas:[c.width,c.height],css:[c.clientWidth,c.clientHeight],dpr:devicePixelRatio,
        viewport:[innerWidth,innerHeight],visibility:document.visibilityState,transform:a.transform,userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,
        contextAttributes:c.getContext('2d')!.getContextAttributes(),sourceContextAttributes:a.source.getContext('2d').getContextAttributes()};
    });
    const modes=[['baseline',false],['baseline',true],['unblur',true],['no-caustics',true],['flush',true]] as const;
    for(let rep=1;rep<=2;rep++)for(const [mode,timers]of rep===1?modes:[...modes].reverse()) {
      if(Date.now()-started>300000)throw new Error('Registered five-minute experimental ceiling');
      await configure(mode,timers);const before=await metrics();
      await page.waitForTimeout(8000);const after=await metrics(),measurement=await capture();
      const afterSnapshot=await snapshot();
      const row={rep,mode,timers,before,after,capture:measurement,stateHash:hash(afterSnapshot.state)};
      result.runs.push(row);
      expect(measurement.rows.length).toBeGreaterThan(1);expect(measurement.workers).toBeGreaterThan(0);
      expect(afterSnapshot.state).toEqual(held.state);
    }
    // Diagnostics are additional registered slots, excluded from timing aggregates.
    for(const mode of ['baseline','unblur']) {
      await configure(mode,true);const events:any[]=[];
      const listener=({value}:any)=>events.push(...value);cdp.on('Tracing.dataCollected',listener);
      await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:4000});
      await cdp.send('Tracing.start',{categories:'devtools.timeline,toplevel,blink,cc,gpu,viz',options:'record-as-much-as-possible'});
      await cdp.send('Profiler.start');await page.waitForTimeout(3000);
      const {profile}=await cdp.send('Profiler.stop');
      const end=new Promise<void>(resolve=>cdp.once('Tracing.tracingComplete',()=>resolve()));
      await cdp.send('Tracing.end');await end;cdp.off('Tracing.dataCollected',listener);
      result.diagnostics.push({mode,capture:await capture(),profile,traceEvents:events});
      expect((await snapshot()).state).toEqual(held.state);
      if(Buffer.byteLength(JSON.stringify(result))>512*1024*1024)throw new Error('Registered evidence ceiling');
    }
    // Already-flushed source copy component, off the game RAF path. A readback
    // can force software/readback policy; this is not a pure GPU copy benchmark.
    result.copy=await page.evaluate(()=>{
      const a=(window as any).stage32;a.active=false;a.mode='baseline';
      const source=a.source as HTMLCanvasElement, target=document.createElement('canvas');
      target.width=source.width;target.height=source.height;const ctx=target.getContext('2d')!;
      const flushStart=performance.now();a.nativeRead.call(source.getContext('2d'),0,0,1,1);const sourceFlushMs=performance.now()-flushStart;
      const blocks=[];for(let rep=1;rep<=2;rep++) {const rows=[];for(let i=0;i<30;i++) {
        const start=performance.now();a.nativeImage.call(ctx,source,0,0);const middle=performance.now();a.nativeRead.call(ctx,0,0,1,1);
        rows.push({drawMs:middle-start,readMs:performance.now()-middle});
      }blocks.push({rep,sourceFlushMs,rows});}return blocks;
    });
    result.final=await snapshot();expect(result.final.state).toEqual(held.state);
    result.elapsedExperimentalMs=Date.now()-started;
    expect(result.elapsedExperimentalMs).toBeLessThan(300000);
  } catch(e) {result.failures.push(String(e));throw e;}
  finally {
    result.finished=new Date().toISOString();
    const archive=gzipSync(JSON.stringify(result));
    writeFileSync(`${output}/browser-original.json.gz`,archive,{flag:'wx'});
    await info.attach('stage32-original',{body:archive,contentType:'application/gzip'});
    const encoded=archive.toString('base64');
    for(let i=0;i<encoded.length;i+=16000)console.log(`STAGE32_PART_${i/16000}=${encoded.slice(i,i+16000)}`);
    console.log(`STAGE32_ARCHIVE_SHA256=${createHash('sha256').update(archive).digest('hex')}`);
    if(cdp)await cdp.detach();
  }
});
