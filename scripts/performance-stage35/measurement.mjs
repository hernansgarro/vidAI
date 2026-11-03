import {test,expect} from '@playwright/test';
import {prepare,digests} from './build.mjs';
import {install} from './browser-init.mjs';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {mkdirSync,openSync,writeFileSync,fsyncSync,closeSync,readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import {preview} from 'vite';

test('Stage 3.5 once-only active Worker report cadence',async({browser},info)=>{
 const out='docs/experiments/performance-stage-3-v6',started=Date.now(),servers=[],contexts=[],ledger=[],receipts=[];
 const hash=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
 const sha=execFileSync('git',['-c','safe.directory='+process.cwd(),'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 if(process.env.GITHUB_SHA&&sha!==process.env.GITHUB_SHA)throw Error('Exact source mismatch');
 mkdirSync(out,{recursive:true});
 if(readdirSync(out).some(x=>x.endsWith('.json.gz')))throw Error('Spent campaign: refusing duplicate execution');
 let rawBytes=0,activeMs=0,activeStart=0,failure=null,pilot=null,current=null;
 const meta={stage:'3.5',sourceSHA:sha,baseSHA:'eff903441bf6e914809345aeb44d5b1461c8c745',sourceDigests:digests(),started:new Date().toISOString(),
 os:{type:os.type(),release:os.release(),arch:os.arch()},cpu:os.cpus()[0],cpuCount:os.cpus().length,memory:os.totalmem(),node:process.version,browser:browser.version(),
 cgroup:Object.fromEntries(['/sys/fs/cgroup/memory.max','/sys/fs/cgroup/cpu.max'].map(p=>{try{return [p,readFileSync(p,'utf8').trim()];}catch{return [p,'UNKNOWN'];}}))};
 const archive=(name,data)=>{
  const raw=Buffer.from(JSON.stringify(data)),compressed=gzipSync(raw),path=out+'/'+name+'.json.gz';
  if(rawBytes+raw.length>48*1024*1024)throw Error('48MiB raw archive ceiling before write');
  const fd=openSync(path,'wx');try{writeFileSync(fd,compressed);fsyncSync(fd);}finally{closeSync(fd);}
  const read=readFileSync(path);expect(hash(read)).toBe(hash(compressed));expect(gunzipSync(read).equals(raw)).toBe(true);
  rawBytes+=raw.length;const receipt={name,sha256:hash(read),rawBytes:raw.length,bytes:read.length};receipts.push(receipt);
  console.log('S35_RECEIPT='+JSON.stringify(receipt));return receipt;
 };
 const check=()=>{
  const running=activeStart?Date.now()-activeStart:0;
  if(activeMs+running>360000)throw Error('360s active research ceiling');
  if(Date.now()-started>600000)throw Error('600s inclusive runner ceiling');
 };
 const span=async fn=>{check();activeStart=Date.now();try{return await fn();}finally{activeMs+=Date.now()-activeStart;activeStart=0;check();}};
 const checkpoint={},initialHash={},inventory={},results=[];
 const ask=async(p,op,extra={})=>{const v=await p.evaluate(({op,extra})=>window.__s35Browser.ask(op,extra),{op,extra});expect(v?.researchError).toBeUndefined();return v;};
 const speed=async(p,v)=>{await p.getByRole('group',{name:'Simulation speed'}).getByRole('button',{name:v==='max'?'MAX':v+'x',exact:true}).dispatchEvent('click');};
 const load=async(p,n,cap)=>{
  const snap=structuredClone(checkpoint[n]);snap.metadata={...(snap.metadata??{}),observerPreferences:{selectAddedCreature:false,trackSelectedCreature:false,showCaustics:false}};
  await p.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
  const canvas=p.locator('canvas[aria-label="Aquatic simulation"]'),old=Number(await canvas.getAttribute('data-world-epoch'));
  await p.locator('input[type=file]').setInputFiles({name:'stage35.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(snap))});
  await expect(canvas).not.toHaveAttribute('data-world-epoch',String(old));
  await p.waitForFunction(e=>window.__s35Browser.control?.epoch>e,old,{timeout:15000});
  await expect(p.getByRole('group',{name:'Simulation speed'}).getByRole('button',{name:'0x',exact:true})).toHaveAttribute('aria-pressed','true');
  const restored=await ask(p,'snapshot');expect(hash(restored.state)).toBe(initialHash[n]);expect(restored.settings).toEqual(checkpoint[n].settings);
  const config=await ask(p,'config',{cap});expect(config).toMatchObject({cap,speed:0,selected:null});
  expect(restored.metadata?.observerPreferences?.showCaustics??false).toBe(false);
  await p.getByTitle('Close settings (✕)').dispatchEvent('click');
  return config;
 };
 const stats=xs=>{if(!xs?.length)return {n:0};const x=[...xs].sort((a,b)=>a-b);return {n:x.length,sum:xs.reduce((a,b)=>a+b,0),min:x[0],median:x[Math.floor(x.length/2)],max:x.at(-1),...(x.length>=100?{p95:x[Math.floor(x.length*.95)],p99:x[Math.floor(x.length*.99)]}:{})};};
 try{
  const bc=await browser.newBrowserCDPSession();
  for(const method of ['Browser.getVersion','SystemInfo.getInfo','Browser.getBrowserCommandLine'])try{meta[method]=await bc.send(method);}catch(e){meta[method]={unavailable:String(e)};}
  await bc.detach();
  // Load the exact ordinary production build before building explicit research variants.
  const production=await preview({logLevel:'warn',preview:{host:'127.0.0.1',port:4183,strictPort:true}});servers.push(production);
  const prod=await browser.newContext({viewport:{width:1280,height:850},deviceScaleFactor:1});contexts.push(prod);
  const pp=await prod.newPage();await pp.goto('http://127.0.0.1:4183/vidAI/?autoplay');
  await expect(pp.locator('canvas[aria-label="Aquatic simulation"]')).toBeVisible({timeout:15000});meta.productionLoaded=true;await pp.goto('about:blank');await prod.close();
  servers.push(await prepare(false,4184));servers.push(await prepare(true,4185));
  const ctx=await browser.newContext({viewport:{width:1280,height:850},deviceScaleFactor:1});contexts.push(ctx);
  const p=await ctx.newPage();await p.addInitScript(install);
  const navigate=async diag=>{await p.goto('http://127.0.0.1:'+(diag?4185:4184)+'/vidAI/?autoplay');await p.waitForFunction(()=>window.__s35Fixture&&window.__s35Browser.control,undefined,{timeout:15000});};
  await navigate(false);
  for(const n of [15,30]){checkpoint[n]=await p.evaluate(n=>window.__s35Fixture.create(n),n);initialHash[n]=hash(checkpoint[n].state);inventory[n]=await p.evaluate(s=>window.__s35Fixture.inventory(s),checkpoint[n]);archive('checkpoint'+n,{snapshot:checkpoint[n],stateSHA256:initialHash[n],inventory:inventory[n]});}
  await load(p,15,30);await load(p,30,10);
  const readinessSeconds=(Date.now()-Number(process.env.STAGE35_JOB_STARTED||started))/1000;
  if(readinessSeconds>600)throw Error('600s setup ceiling including installation/validation');
  meta.readinessSeconds=readinessSeconds;
  // Only bounded matched-logical-tick pilots precede timed slots.
  pilot=await span(async()=>{
   const baseline=await p.evaluate(s=>window.__s35Fixture.validity(s,false),checkpoint[15]);
   const baselineHash=hash(baseline.snapshot.state),rows=[];
   for(const diag of [false,true]){
    await navigate(diag);
    for(const cap of [30,10]){
     await load(p,15,cap);const final=await ask(p,'pilot');
     expect(hash(final.state)).toBe(baselineHash);expect(final.settings).toEqual(baseline.snapshot.settings);
     const energy=await p.evaluate(s=>window.__s35Fixture.energy(s),final);expect(energy).toBe(baseline.energy);
     rows.push({diag,cap,stateSHA256:hash(final.state),prng:final.state.prngState,energy,simTime:final.state.simTime});
    }
   }
   return {baseline,rows,fullStateEqual:true,prngEqual:true};
  });archive('pilot',pilot);
  // Pre-size remaining evidence conservatively before spending the first timed slot.
  if(rawBytes+12*1024*1024>48*1024*1024)throw Error('Insufficient scientific archive budget');
  meta.initialInventory=inventory;meta.initialHash=initialHash;
  const measure=async(n,cap,diag,durationMs,id)=>{
   check();current={id,n,cap,diag,status:'warmup',durationMs};ledger.push(current);writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));
   await span(async()=>{await load(p,n,cap);await speed(p,'max');await p.waitForTimeout(2000);await speed(p,0);});
   await load(p,n,cap);
   const arm=await ask(p,'arm');expect(arm.simTime).toBe(checkpoint[n].state.simTime);
   const mainStart=await p.evaluate(()=>window.__s35Browser.begin());
   current.status='measurement-started';writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));
   let after,main;
   await span(async()=>{
    await speed(p,'max');await p.waitForTimeout(durationMs);
    after=await ask(p,'end');main=await p.evaluate(()=>window.__s35Browser.end());await speed(p,0);
   });
   const tickDelta=Math.round((after.final.state.simTime-after.initialSim)*60),wallMs=after.end-after.begin;
   expect(wallMs).toBeGreaterThan(durationMs*.9);expect(tickDelta).toBeGreaterThan(0);
   if(diag)expect(after.diagnostic.ticks).toBe(tickDelta);
   expect(main.error).toBeNull();expect(main.visible).toBe('visible');
   const startAbs=after.origin+after.begin,endAbs=after.origin+after.end;
   const frames=main.rows.filter(x=>x.timestamp+main.origin>=startAbs&&x.timestamp+main.origin<=endAbs);
   const transports=main.transports.filter(x=>x.main+main.origin>=startAbs&&x.main+main.origin<=endAbs);
   const endInventory=await p.evaluate(s=>window.__s35Fixture.inventory(s),after.final);
   const initialIDs=new Set(checkpoint[n].state.organisms.map(o=>o.id));
   const finalIDs=new Set(after.final.state.organisms.map(o=>o.id));
   const summary={id,n,cap,diag,durationMs,wallMs,tickDelta,ticksPerSecond:tickDelta/wallMs*1000,multiplier:tickDelta/wallMs*1000/60,
    startSHA256:initialHash[n],endSHA256:hash(after.final.state),endPRNG:after.final.state.prngState,initialInventory:inventory[n],endInventory,
    birthsPresent:after.final.state.organisms.filter(o=>!initialIDs.has(o.id)).length,initialIDsAbsent:[...initialIDs].filter(id=>!finalIDs.has(id)).length,
    fps:frames.length/wallMs*1000,raf:stats(frames.map(x=>x.intervalMs).filter(x=>x!==null)),canvasCallback:stats(frames.map(x=>x.callbackMs)),
    transportRate:transports.length/wallMs*1000,queueInclusive:stats(transports.filter(x=>x.sent!==null).map(x=>x.main+main.origin-x.sent-x.sentOrigin)),
    longTasks:main.longTasks.filter(x=>x.start+main.origin>=startAbs&&x.start+main.origin<=endAbs),heap:main.heap,payloadEstimate:main.payload,
    counts:after.diagnostic?.counts??null,worker:after.diagnostic?Object.fromEntries(Object.entries(after.diagnostic.rows).map(([k,v])=>[k,stats(v)])):null,
    main:main.main?Object.fromEntries(Object.entries(main.main.rows).map(([k,v])=>[k,stats(v)])):null,
    reportRate:after.diagnostic?(after.diagnostic.counts.sent??0)/wallMs*1000:null};
   const raw={...summary,boundary:{begin:after.begin,end:after.end,origin:after.origin,initialSim:after.initialSim,finalSim:after.final.state.simTime,mainStart},workerRaw:after.diagnostic,mainRaw:main};
   archive(id,raw);results.push(summary);current.status='retained';current=null;
   writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));writeFileSync(out+'/summary.json',JSON.stringify({meta,results,activeMs,rawBytes},null,2));
   console.log('S35_WINDOW='+JSON.stringify(summary));check();
  };
  for(const [i,diag]of [false,true,true,false].entries()){await navigate(diag);await measure(15,30,diag,4000,'O'+(i+1));}
  await navigate(true);
  for(const [i,[n,cap]]of [[15,30],[15,10],[30,30],[30,10],[30,10],[30,30],[15,10],[15,30]].entries())await measure(n,cap,true,10000,'P'+String(i+1).padStart(2,'0'));
 }catch(e){
  failure=String(e);if(current){current.status='UNKNOWN';current.failure=failure;}
  archive('failure',{failure,current,ledger,activeMs,meta});
  throw e;
 }finally{
  meta.finished=new Date().toISOString();meta.activeMs=activeMs;meta.failure=failure;meta.ledger=ledger;meta.rawBytes=rawBytes;meta.receipts=receipts.slice();meta.finalSourceDigests=digests();meta.runnerWallMs=Date.now()-started;
  archive('manifest',meta);
  writeFileSync(out+'/summary.json',JSON.stringify({meta,results,activeMs,rawBytes},null,2));
  console.log('S35_FINAL='+JSON.stringify({sourceSHA:sha,activeMs,rawBytes,windows:results.length,failure,ledger}));
  for(const c of contexts)try{await c.close();}catch{}
  for(const s of servers)await new Promise(r=>s.httpServer.close(()=>r()));
 }
});
