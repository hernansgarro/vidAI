import {test,expect} from '@playwright/test';
import {prepare,digests} from './build.mjs';
import {install} from './browser-init.mjs';
import {snapshot as cpuSnapshot,clockTicks,beginTrace,endTrace} from './accounting.mjs';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {mkdirSync,openSync,writeFileSync,fsyncSync,closeSync,readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
const out='docs/experiments/performance-stage-3-v10';
const hash=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
test('Stage 3.8 registered population scalability lot',async({browser})=>{
 const started=Date.now(),servers=[],contexts=[],receipts=[],results=[];
 const matrix=[['P01',25,false,false,'off'],['P02',50,false,false,'off'],['P03',100,false,false,'off'],['P04',150,false,false,'off'],['P05',100,true,false,'off'],['P06',150,false,false,'off'],['P07',100,false,false,'off'],['P08',50,false,false,'off'],['P09',25,false,false,'off'],['P10',100,true,false,'off'],['D01',25,false,true,'phase'],['D02',50,false,true,'phase'],['D03',100,false,true,'phase'],['D04',150,false,true,'phase'],['D05',100,true,true,'phase'],['O01',100,false,true,'off'],['T01',150,false,false,'off',true],['T02',100,true,false,'off',true]];
 const ledger=matrix.map(([id,count,compact,research,level,traced=false])=>({id,count,compact,research,level,traced,status:'not-started'}));
 const sha=execFileSync('git',['-c','safe.directory='+process.cwd(),'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 if(process.env.GITHUB_SHA&&sha!==process.env.GITHUB_SHA)throw Error('Exact source mismatch');
 mkdirSync(out,{recursive:true});if(readdirSync(out).some(x=>x.endsWith('.json.gz')))throw Error('Spent campaign: no repeats');
 let rawBytes=0,activeMs=0,activeStart=0,failure=null,current=null,pendingRaw=null,ticks=120;
 const meta={stage:'3.8',sourceSHA:sha,baseSHA:'dd7925b9d02a67459bb68985cf2d5647b737247e',sourceDigests:digests(),started:new Date().toISOString(),node:process.version,browser:browser.version(),os:{type:os.type(),release:os.release(),arch:os.arch()},cpu:os.cpus()[0],cpuCount:os.cpus().length,memory:os.totalmem(),clockTicks,cgroup:Object.fromEntries(['/sys/fs/cgroup/memory.max','/sys/fs/cgroup/cpu.max'].map(p=>{try{return [p,readFileSync(p,'utf8').trim()];}catch{return [p,'UNKNOWN'];}}))};
 const archive=(name,data)=>{const raw=Buffer.from(JSON.stringify(data)),bytes=gzipSync(raw),path=out+'/'+name+'.json.gz';if(rawBytes+raw.length>192*1024*1024)throw Error('Raw192MiB ceiling');const fd=openSync(path,'wx');try{writeFileSync(fd,bytes);fsyncSync(fd);}finally{closeSync(fd);}const read=readFileSync(path);expect(hash(read)).toBe(hash(bytes));expect(gunzipSync(read).equals(raw)).toBe(true);rawBytes+=raw.length;const receipt={name,sha256:hash(read),rawBytes:raw.length,bytes:read.length};receipts.push(receipt);return receipt;};
 const saveLedger=()=>writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));
 const check=()=>{if(activeMs+(activeStart?Date.now()-activeStart:0)>360000)throw Error('360s active ceiling');if(Date.now()-started>720000)throw Error('720s runner ceiling');};
 const span=async fn=>{check();activeStart=Date.now();try{return await fn();}finally{activeMs+=Date.now()-activeStart;activeStart=0;check();}};
 const ask=async(p,op,extra={})=>{const v=await p.evaluate(({op,extra})=>window.__s38Browser.ask(op,extra),{op,extra});expect(v?.researchError).toBeUndefined();return v;};
 const speed=async(p,v)=>p.getByRole('group',{name:'Simulation speed'}).getByRole('button',{name:v==='max'?'MAX':v+'x',exact:true}).dispatchEvent('click');
 let checkpoint,initialHash;
 const load=async(p,level='off')=>{
 await p.getByTitle('Ecology & Physical Settings').dispatchEvent('click');const canvas=p.locator('canvas[aria-label="Aquatic simulation"]'),old=Number(await canvas.getAttribute('data-world-epoch'));
 await p.locator('input[type=file]').setInputFiles({name:'stage38.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(checkpoint))});
 await expect(canvas).not.toHaveAttribute('data-world-epoch',String(old));await p.waitForFunction(e=>window.__s38Browser.control?.epoch>e,old,{timeout:15000});
 const restored=await ask(p,'snapshot');expect(hash(restored.state)).toBe(initialHash);expect(restored.settings).toEqual(checkpoint.settings);
 const config=await ask(p,'config',{level});expect(config.selected).toBeNull();await p.getByTitle('Close settings (✕)').dispatchEvent('click');return config;
 };
 const details=async(p,s)=>({inventory:await p.evaluate(s=>window.__s38Fixture.inventory(s),s),validation:await p.evaluate(s=>window.__s38Fixture.validate(s),s)});
 try{
 const bc=await browser.newBrowserCDPSession();meta.initialProcesses=await bc.send('SystemInfo.getProcessInfo');const browserPID=meta.initialProcesses.processInfo.find(x=>x.type==='browser')?.id;if(!browserPID)throw Error('Browser PID missing');meta.browserPID=browserPID;
 for(const method of ['Browser.getVersion','SystemInfo.getInfo','Browser.getBrowserCommandLine'])try{meta[method]=await bc.send(method);}catch(e){meta[method]={unavailable:String(e)};}
 servers.push(await prepare(false,4184));servers.push(await prepare(true,4185));
 for(const dir of ['dist','s38-lean-dist','s38-research-dist'])archive(dir+'-assets',{files:Object.fromEntries(readdirSync(dir+'/assets').filter(x=>x.endsWith('.js')||x.endsWith('.map')).map(file=>[file,readFileSync(dir+'/assets/'+file,'utf8')]))});
 const ctx=await browser.newContext({viewport:{width:1280,height:850},deviceScaleFactor:1});contexts.push(ctx);const p=await ctx.newPage();await p.addInitScript(install);
 const navigate=async research=>{await p.goto('http://127.0.0.1:'+(research?4185:4184)+'/vidAI/?autoplay');await p.waitForFunction(()=>window.__s38Fixture&&window.__s38Browser.control,undefined,{timeout:15000});};
 await navigate(false);const fixtures={};for(const count of [25,50,100,150])fixtures[count]=await p.evaluate(count=>window.__s38Fixture.make(count),count);fixtures.compact=await p.evaluate(()=>window.__s38Fixture.make(100,true));
 for(const [name,snapshot]of Object.entries(fixtures)){archive('fixture-'+name,{snapshot,stateSHA256:hash(snapshot.state),details:await details(p,snapshot)});expect(snapshot.state.organisms).toHaveLength(name==='compact'?100:Number(name));}
 let pilot100=null;
 for(const [count,research,level]of [[25,false,'off'],[150,false,'off'],[100,false,'off'],[100,true,'off'],[100,true,'phase']]){
 await navigate(research);checkpoint=fixtures[count];initialHash=hash(checkpoint.state);await load(p,level);
 if(count===100&&level==='off'){const counter=await span(()=>ask(p,'counterCheck'));archive('counter-'+(research?'research':'lean'),counter);expect(counter).toEqual({completed:7,simTicks:7,firstFrameSteps:4,secondFrameSteps:3});await load(p,level);}
 const pilot=await span(()=>ask(p,'pilot'));archive('pilot-'+count+'-'+(research?level:'lean'),pilot);expect(pilot.snapshot.state.simTime).toBeCloseTo(.4,10);
 if(count===150&&pilot.elapsed*5>30000){ticks=60;meta.pilotAmendment='All measured horizons reduced to60ticks before first timed slot under registered rule';}
 if(count===100){if(!pilot100)pilot100=pilot.snapshot;else expect(pilot.snapshot).toEqual(pilot100);}
 }
 meta.ticks=ticks;archive('readiness',{meta,ledger});
 const pageCDP=await ctx.newCDPSession(p);await pageCDP.send('Performance.enable');
 for(const slot of ledger){
 check();current=slot;slot.status='warmup';saveLedger();await navigate(slot.research);checkpoint=fixtures[slot.compact?'compact':slot.count];initialHash=hash(checkpoint.state);await load(p,slot.level);
 const warmup=await span(()=>ask(p,'pilot'));archive(slot.id+'-warmup',{elapsed:warmup.elapsed,stateSHA256:hash(warmup.snapshot.state)});await load(p,slot.level);
 if(slot.traced){await beginTrace(bc);await ask(p,'mark',{label:'S38_WORKER_'+slot.id});await p.evaluate(id=>performance.mark('S38_MAIN_'+id),slot.id);}
 const cpuBefore=cpuSnapshot(browserPID),metricsBefore=await pageCDP.send('Performance.getMetrics');
 await p.evaluate(()=>{window.__s38Browser.complete=null;});await ask(p,'arm',{ticks,token:slot.id});const mainStart=await p.evaluate(()=>window.__s38Browser.begin());
 slot.status='measurement-started';saveLedger();let boundary,main,cpuAfter;
 await span(async()=>{await speed(p,'max');await p.waitForFunction(id=>window.__s38Browser.complete?.token===id,slot.id,{timeout:30000});boundary=await p.evaluate(()=>window.__s38Browser.complete);pendingRaw={slot,boundary,cpuBefore,metricsBefore,mainStart};cpuAfter=cpuSnapshot(browserPID);main=await p.evaluate(()=>window.__s38Browser.end());await speed(p,0);});
 const trace=slot.traced?await endTrace(bc):null,metricsAfter=await pageCDP.send('Performance.getMetrics');
 pendingRaw={slot:{...slot},startSHA256:initialHash,boundary,cpuBefore,cpuAfter,metricsBefore,metricsAfter,mainStart,main};archive(slot.id+'-original',pendingRaw);if(trace)archive(slot.id+'-trace',trace);pendingRaw=null;slot.status='original-retained';saveLedger();
 const final=boundary.snapshot,info=await details(p,final),wallMs=boundary.end-boundary.begin;
 expect(boundary.steps).toBe(ticks);expect(Math.round((final.state.simTime-checkpoint.state.simTime)*60)).toBe(ticks);expect(wallMs).toBeGreaterThan(0);expect(main.error).toBeNull();expect(main.visible).toBe('visible');expect(Math.abs(info.validation.energy-info.validation.budget)).toBeLessThan(1e-5);
 const beginAbs=boundary.origin+boundary.begin,endAbs=boundary.origin+boundary.end,frames=main.rows.filter(x=>x.timestamp+main.origin>=beginAbs&&x.timestamp+main.origin<=endAbs),reports=main.transports.filter(x=>x.main+main.origin>=beginAbs&&x.main+main.origin<=endAbs);
 const summary={...slot,ticks,wallMs,msPerTick:wallMs/ticks,ticksPerSecond:ticks*1000/wallMs,multiplier:ticks*1000/wallMs/60,inventory:info.inventory,validation:info.validation,startSHA256:initialHash,endSHA256:hash(final.state),fps:frames.length*1000/wallMs,reportsPerSecond:reports.length*1000/wallMs,diagnostic:boundary.diagnostic};
 archive(slot.id+'-validated',summary);results.push(summary);slot.status='retained';current=null;saveLedger();writeFileSync(out+'/summary.json',JSON.stringify({meta,results,activeMs,rawBytes},null,2));console.log('S38_WINDOW='+JSON.stringify({...summary,diagnostic:undefined}));
 }
 }catch(e){failure=String(e);if(current){current.status='FAILED_OR_UNKNOWN';current.failure=failure;}if(pendingRaw)archive('failed-window-original',pendingRaw);archive('failure',{failure,current,ledger,activeMs,meta});throw e;}
 finally{meta.finished=new Date().toISOString();meta.activeMs=activeMs;meta.failure=failure;meta.ledger=ledger;meta.rawBytesBeforeManifest=rawBytes;meta.receipts=receipts.slice();meta.finalSourceDigests=digests();meta.runnerWallMs=Date.now()-started;archive('manifest',meta);writeFileSync(out+'/summary.json',JSON.stringify({meta,results,activeMs,rawBytes},null,2));saveLedger();console.log('S38_FINAL='+JSON.stringify({sourceSHA:sha,activeMs,rawBytes,windows:results.length,failure,ledger}));for(const c of contexts)try{await c.close();}catch{}for(const s of servers)await new Promise(r=>s.httpServer.close(()=>r()));}
});
