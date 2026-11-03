import {readdirSync} from 'node:fs';
// Optional, once-only registered research entrypoint; no production imports.
import {test,expect} from '@playwright/test';
// @ts-ignore Research build helper is intentionally JavaScript-only.
import {prepare,digests} from './build.mjs';
// @ts-ignore Matched browser bootstrap is intentionally JavaScript-only.
import {install} from './browser-init.mjs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {mkdirSync,openSync,writeFileSync,fsyncSync,closeSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

test('Stage 3.4 actual Worker UI throughput registered batch',async({browserName,browser},info)=>{
 test.skip(browserName!=='chromium','Registered engine only; inherited Firefox checks retained.');
 test.setTimeout(1080000);
 const out='docs/experiments/performance-stage-3-v5',hash=(x:any)=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
 mkdirSync(out,{recursive:true});
 if(readdirSync(out).some(name=>name.endsWith('.json.gz')))throw Error('Existing scientific evidence: refuse to repeat or overwrite a spent batch');
 const receipts:any[]=[],servers:any[]=[],contexts:any[]=[],trialLedger:any[]=[];
 let activeStart=0,experimentalMs=0,failed=false;
 const archive=async(name:string,data:any)=>{
  const bytes=gzipSync(JSON.stringify(data)),path=out+'/'+name+'.json.gz',fd=openSync(path,'wx');
  try{writeFileSync(fd,bytes);fsyncSync(fd);}finally{closeSync(fd);}
  const actual=readFileSync(path);expect(hash(actual)).toBe(hash(bytes));
  const receipt={name,bytes:bytes.length,sha256:hash(bytes)};receipts.push(receipt);
  const encoded=bytes.toString('base64');
  for(let i=0;i<encoded.length;i+=12000)console.log('S34_'+name+'_PART_'+i/12000+'='+encoded.slice(i,i+12000));
  console.log('S34_RECEIPT='+JSON.stringify(receipt));
  await info.attach(name,{body:bytes,contentType:'application/gzip'});
 };
 const meta:any={stage:'3.4',started:new Date().toISOString(),sourceSHA:execFileSync('git',['-c','safe.directory='+process.cwd(),'rev-parse','HEAD'],{encoding:'utf8'}).trim(),runtimeBase:'3e7319e9d81f86a026bcb5746512fbc1b435b5d8',sourceDigests:digests(),os:execFileSync('uname',['-a'],{encoding:'utf8'}).trim(),cpu:readFileSync('/proc/cpuinfo','utf8').split('\n').find(x=>x.startsWith('model name')),node:process.version,browser:browser.version()};
 const time=()=>{if(experimentalMs+(activeStart?Date.now()-activeStart:0)>720000)throw Error('12 minute active experiment ceiling');};
 const span=async(fn:()=>Promise<any>)=>{activeStart=Date.now();try{return await fn();}finally{experimentalMs+=Date.now()-activeStart;activeStart=0;}};
 try{
  const bc=await browser.newBrowserCDPSession();
  for(const method of ['Browser.getVersion','SystemInfo.getInfo','Browser.getBrowserCommandLine'])try{meta[method]=await bc.send(method as any);}catch(e){meta[method]={unavailable:String(e)};}
  await bc.detach();
  servers.push(await prepare(false,4184));servers.push(await prepare(true,4185));
  const makePage=async(port:number)=>{
   const ctx=await browser.newContext({viewport:{width:1280,height:850},deviceScaleFactor:1});contexts.push(ctx);
   const p=await ctx.newPage();await p.addInitScript(install);await p.goto('http://127.0.0.1:'+port+'/vidAI/?autoplay');
   await p.waitForFunction(()=>!!(window as any).__s34Fixture&&!!(window as any).__s34Browser.control,undefined,{timeout:15000});
   return p;
  };
  const original=await makePage(4184),diagnostic=await makePage(4185);
  // Only one app is allowed to render during a measured trial.
  await original.goto('about:blank');
  const checkpoints:any={};
  for(const n of [5,15,30])checkpoints[n]=await diagnostic.evaluate((n:any)=>(window as any).__s34Fixture.create(n),n);
  const inventory:any={};for(const n of [5,15,30])inventory[n]=await diagnostic.evaluate((s:any)=>(window as any).__s34Fixture.inventory(s),checkpoints[n]);
  const load=async(p:any,s:any,on:boolean)=>{
   const snap=structuredClone(s);snap.metadata={...(snap.metadata??{}),observerPreferences:{selectAddedCreature:false,trackSelectedCreature:false,showCaustics:on}};
   await p.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
   await p.locator('input[type=file]').setInputFiles({name:'s34.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(snap))});
   await expect(p.getByRole('group',{name:'Simulation speed'}).getByRole('button',{name:'0x',exact:true})).toHaveAttribute('aria-pressed','true');
   const current=await p.evaluate(()=>(window as any).__s34Browser.ask('snapshot',false));
   expect(current.state).toEqual(s.state);expect(current.settings).toEqual(s.settings);
   await p.getByTitle('Close settings (✕)').dispatchEvent('click');
   return current;
  };
  const speed=async(p:any,value:any)=>{await p.getByRole('group',{name:'Simulation speed'}).getByRole('button',{name:value==='max'?'MAX':value+'x',exact:true}).dispatchEvent('click');};
  const ask=async(p:any,op:string)=>p.evaluate((op:any)=>(window as any).__s34Browser.ask(op),op);
  const clocks=async(p:any)=>{const rows=[];for(let i=0;i<5;i++)rows.push(await p.evaluate(async()=>{const b=(window as any).__s34Browser,t0=performance.now(),v=await b.ask('clock');return {t0,t1:performance.now(),...v};}));return rows;};
  // Zero-tick restore/capture and exact120-tick equivalence precede scientific timing.
  const pilot=await span(async()=>{
   await load(diagnostic,checkpoints[15],false);
   const paused=await ask(diagnostic,'snapshot');expect(paused.state).toEqual(checkpoints[15].state);
   const exact:any={};meta.partialValidity=exact;
   for(const selected of [false,true])exact[String(selected)]=await diagnostic.evaluate(({s,selected}:any)=>(window as any).__s34Fixture.validity(s,selected),{s:checkpoints[15],selected});
   expect(exact.false.snapshot.state).toEqual(exact.true.snapshot.state);
   await diagnostic.goto('about:blank');
   await original.goto('http://127.0.0.1:4184/vidAI/?autoplay');await original.waitForFunction(()=>!!(window as any).__s34Fixture,undefined,{timeout:15000});
   const baseline=await original.evaluate((s:any)=>(window as any).__s34Fixture.validity(s,false),checkpoints[15]);
   meta.partialBaseline=baseline;expect(baseline.snapshot.state).toEqual(exact.false.snapshot.state);expect(baseline.snapshot.settings).toEqual(exact.false.snapshot.settings);
   expect(baseline.energy).toBe(exact.false.energy);
   await original.goto('about:blank');
   await diagnostic.goto('http://127.0.0.1:4185/vidAI/?autoplay');await diagnostic.waitForFunction(()=>!!(window as any).__s34Fixture,undefined,{timeout:15000});
   return {paused,baseline,exact,checkpoints,inventory,meta};
  });await archive('pilot',pilot);delete meta.partialValidity;delete meta.partialBaseline;
  const measure=async(p:any,n:number,on:boolean,v:any,duration:number,diag:boolean,id:string)=>{
   return await span(async()=>{
    time();await load(p,checkpoints[n],on);await speed(p,v);await p.waitForTimeout(2000);await speed(p,0);
    await load(p,checkpoints[n],on);
    const beforeClock=diag?await clocks(p):null;
    const before=diag?await ask(p,'start'):await p.evaluate(async()=>{const b=(window as any).__s34Browser,t0=performance.now(),initial=await b.ask('snapshot',false);return {initial,t0,t1:performance.now()};});
    const mainStart=await p.evaluate(()=>(window as any).__s34Browser.begin());
    await speed(p,v);await p.waitForTimeout(duration);
    const after=diag?await ask(p,'end'):await p.evaluate(async()=>{const b=(window as any).__s34Browser,t0=performance.now(),final=await b.ask('snapshot',false);return {final,t0,t1:performance.now()};});
    const main=await p.evaluate(()=>(window as any).__s34Browser.end());
    await speed(p,0);const afterClock=diag?await clocks(p):null;
    const tickDelta=Math.round((after.final.state.simTime-before.initial.state.simTime)*60);
    if(v===0)expect(tickDelta).toBe(0);else expect(tickDelta).toBeGreaterThan(0);
    if(diag)expect(after.diagnostic.ticks).toBe(tickDelta);
    expect(main.error).toBeNull();expect(main.rows.length).toBeGreaterThan(0);
    const finalInventory=await p.evaluate((s:any)=>(window as any).__s34Fixture.inventory(s),after.final);
    return {id,n,on,speed:v,durationMs:duration,diag,before,after,mainStart,main,beforeClock,afterClock,tickDelta,finalInventory};
   });
  };
  // ABBA short controls price added diagnostics; matched browser wrappers remain in all four.
  for(const [i,diag]of [false,true,true,false].entries()){
   time();const p=diag?diagnostic:original,other=diag?original:diagnostic;
   await other.goto('about:blank');
   await p.goto('http://127.0.0.1:'+(diag?4185:4184)+'/vidAI/?autoplay');
   await p.waitForFunction(()=>!!(window as any).__s34Fixture,undefined,{timeout:15000});
   const id='overhead'+(i+1);trialLedger.push({id,status:'started'});
   const r=await measure(p,15,false,'max',6000,diag,id);await archive(id,r);trialLedger.at(-1).status='retained';
  }
  await original.goto('about:blank');
  await diagnostic.goto('http://127.0.0.1:4185/vidAI/?autoplay');await diagnostic.waitForFunction(()=>!!(window as any).__s34Fixture,undefined,{timeout:15000});
  const configurations=[{n:15,v:'max'},{n:30,v:'max'},{n:5,v:'max'},{n:15,v:0},{n:15,v:5}];
  let slot=0;
  for(let rep=1;rep<=2;rep++)for(const config of rep===1?configurations:[...configurations].reverse())for(const on of rep===1?[true,false]:[false,true]){
   if(rep===2&&config.v!=='max')continue;
   time();const id='trial'+String(++slot).padStart(2,'0');trialLedger.push({id,rep,...config,on,status:'started'});
   const r:any=await measure(diagnostic,config.n,on,config.v,10000,true,id);r.rep=rep;await archive(id,r);trialLedger.at(-1).status='retained';
  }
  const component=await span(async()=>{await load(diagnostic,checkpoints[15],false);return await diagnostic.evaluate((s:any)=>(window as any).__s34Fixture.component(s),checkpoints[15]);});
  expect(component.snapshot.state).toEqual(checkpoints[15].state);await archive('component',component);
  time();
 }catch(e){failed=true;meta.failure=String(e);throw e;}
 finally{
  meta.finished=new Date().toISOString();meta.experimentalMs=experimentalMs;meta.failed=failed;meta.ledger=trialLedger;meta.receipts=receipts.slice();meta.finalSourceDigests=digests();
  await archive('manifest',meta);
  for(const ctx of contexts)await ctx.close();for(const server of servers)await new Promise<void>(r=>server.httpServer.close(()=>r()));
 }
});
