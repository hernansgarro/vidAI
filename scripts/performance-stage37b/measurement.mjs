import {test,expect} from '@playwright/test';
import {prepare,digests} from './build.mjs';
import {install} from './browser-init.mjs';
import {snapshot as cpuSnapshot,clockTicks,beginTrace,endTrace} from './accounting.mjs';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {mkdirSync,openSync,writeFileSync,fsyncSync,closeSync,readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import {preview} from 'vite';
const out='docs/experiments/performance-stage-3-v9';
test('Stage 3.7b single registered Worker counterfactual lot',async({browser})=>{
 const started=Date.now(),servers=[],contexts=[],ledger=[],receipts=[],results=[],pilots=[];
 const hash=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
 const sha=execFileSync('git',['-c','safe.directory='+process.cwd(),'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 if(process.env.GITHUB_SHA&&sha!==process.env.GITHUB_SHA)throw Error('Exact source mismatch');
 mkdirSync(out,{recursive:true});if(readdirSync(out).some(x=>x.endsWith('.json.gz')))throw Error('Spent campaign: no repeats');
 let rawBytes=0,activeMs=0,activeStart=0,failure=null,current=null,sequences=null,pendingRaw=null;
 const meta={stage:'3.7b',sourceSHA:sha,baseSHA:'a430f3b51ffd00f4327e692d1b8a417f10a98831',sourceDigests:digests(),started:new Date().toISOString(),node:process.version,browser:browser.version(),os:{type:os.type(),release:os.release(),arch:os.arch()},cpu:os.cpus()[0],cpuCount:os.cpus().length,memory:os.totalmem(),clockTicks,
 cgroup:Object.fromEntries(['/sys/fs/cgroup/memory.max','/sys/fs/cgroup/cpu.max'].map(p=>{try{return [p,readFileSync(p,'utf8').trim()];}catch{return [p,'UNKNOWN'];}}))};
 const archive=(name,data)=>{const raw=Buffer.from(JSON.stringify(data)),bytes=gzipSync(raw),path=out+'/'+name+'.json.gz';if(rawBytes+raw.length>128*1024*1024)throw Error('Raw archive128MiB ceiling');const fd=openSync(path,'wx');try{writeFileSync(fd,bytes);fsyncSync(fd);}finally{closeSync(fd);}const read=readFileSync(path);expect(hash(read)).toBe(hash(bytes));expect(gunzipSync(read).equals(raw)).toBe(true);rawBytes+=raw.length;const receipt={name,sha256:hash(read),rawBytes:raw.length,bytes:read.length};receipts.push(receipt);console.log('S37B_RECEIPT='+JSON.stringify(receipt));return receipt;};
 const check=()=>{if(activeMs+(activeStart?Date.now()-activeStart:0)>360000)throw Error('360s active ceiling');if(Date.now()-started>600000)throw Error('600s runner ceiling');};
 const span=async fn=>{check();activeStart=Date.now();try{return await fn();}finally{activeMs+=Date.now()-activeStart;activeStart=0;check();}};
 const ask=async(p,op,extra={})=>{const v=await p.evaluate(({op,extra})=>window.__s37bBrowser.ask(op,extra),{op,extra});expect(v?.researchError).toBeUndefined();return v;};
 const speed=async(p,v)=>p.getByRole('group',{name:'Simulation speed'}).getByRole('button',{name:v==='max'?'MAX':v+'x',exact:true}).dispatchEvent('click');
 let checkpoint,initialHash;
 const load=async(p,mode,level='off')=>{
 const snap=structuredClone(checkpoint);snap.metadata={...(snap.metadata??{}),observerPreferences:{selectAddedCreature:false,trackSelectedCreature:false,showCaustics:false}};
 await p.getByTitle('Ecology & Physical Settings').dispatchEvent('click');const canvas=p.locator('canvas[aria-label="Aquatic simulation"]'),old=Number(await canvas.getAttribute('data-world-epoch'));
 await p.locator('input[type=file]').setInputFiles({name:'stage37b.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(snap))});
 await expect(canvas).not.toHaveAttribute('data-world-epoch',String(old));await p.waitForFunction(e=>window.__s37bBrowser.control?.epoch>e,old,{timeout:15000});
 await expect(p.getByRole('group',{name:'Simulation speed'}).getByRole('button',{name:'0x',exact:true})).toHaveAttribute('aria-pressed','true');
 const restored=await ask(p,'snapshot');expect(hash(restored.state)).toBe(initialHash);expect(restored.settings).toEqual(checkpoint.settings);
 const config=await ask(p,'config',{mode,level,sequences});expect(config.selected).toBeNull();await p.getByTitle('Close settings (✕)').dispatchEvent('click');return config;
 };
 const details=async(p,s)=>({inventory:await p.evaluate(s=>window.__s37bFixture.inventory(s),s),validation:await p.evaluate(s=>window.__s37bFixture.validate(s),s)});
 try{
 const bc=await browser.newBrowserCDPSession();meta.initialProcesses=await bc.send('SystemInfo.getProcessInfo');const browserPID=meta.initialProcesses.processInfo.find(x=>x.type==='browser')?.id;if(!browserPID)throw Error('Browser PID missing');meta.browserPID=browserPID;
 for(const method of ['Browser.getVersion','SystemInfo.getInfo','Browser.getBrowserCommandLine'])try{meta[method]=await bc.send(method);}catch(e){meta[method]={unavailable:String(e)};}
 // Load the actual unmodified production bundle before the research-only variants.
 const production=await preview({logLevel:'warn',preview:{host:'127.0.0.1',port:4183,strictPort:true}});servers.push(production);
 const prod=await browser.newContext({viewport:{width:1280,height:850},deviceScaleFactor:1});contexts.push(prod);const pp=await prod.newPage();await pp.goto('http://127.0.0.1:4183/vidAI/?autoplay');await expect(pp.locator('canvas[aria-label="Aquatic simulation"]')).toBeVisible({timeout:15000});meta.productionLoaded=true;await prod.close();
 servers.push(await prepare(false,4184));servers.push(await prepare(true,4185));
 // Preserve the actual generated binaries/maps, not a later reconstruction.
 for(const dir of ['dist','s37b-lean-dist','s37b-research-dist']){meta[dir]={};for(const file of readdirSync(dir+'/assets').filter(x=>x.endsWith('.js')||x.endsWith('.map'))){const data=readFileSync(dir+'/assets/'+file);meta[dir][file]={sha256:hash(data),bytes:data.length};}archive(dir+'-assets',{files:Object.fromEntries(readdirSync(dir+'/assets').filter(x=>x.endsWith('.js')||x.endsWith('.map')).map(file=>[file,readFileSync(dir+'/assets/'+file,'utf8')]))});}
 const ctx=await browser.newContext({viewport:{width:1280,height:850},deviceScaleFactor:1});contexts.push(ctx);const p=await ctx.newPage();await p.addInitScript(install);
 const navigate=async research=>{await p.goto('http://127.0.0.1:'+(research?4185:4184)+'/vidAI/?autoplay');await p.waitForFunction(()=>window.__s37bFixture&&window.__s37bBrowser.control,undefined,{timeout:15000});};
 await navigate(false);const original=readFileSync('scripts/performance-stage37b/checkpoint30-reference.json.gz');expect(hash(original)).toBe('c6ab22b6d12f5b38f8234c5a440620218173a31f8ae23fbf4a5ef83a9455758e');const reference=JSON.parse(gunzipSync(original));checkpoint=reference.snapshot;initialHash=hash(checkpoint.state);expect(initialHash).toBe(reference.stateSHA256);
 meta.initial=await details(p,checkpoint);meta.initialHash=initialHash;expect(checkpoint.state.selfTubes??null).toBeNull();archive('checkpoint',{snapshot:checkpoint,stateSHA256:initialHash,referenceSHA256:hash(original),originalProvenance:{commit:'18e6673ceede77089faf9a914f595f4a5ed1d0fd',stateSHA256:reference.stateSHA256}});
 const recorded=readFileSync('scripts/performance-stage37b/recorded-sequences-reference.json.gz');expect(hash(recorded)).toBe('ba6521b6bb107ad2b1d114e91cfdb530d5a5f13b7582e29ec5c7516d34bab54f');const recording=JSON.parse(gunzipSync(recorded));sequences=recording.sequences;expect(hash(sequences)).toBe(recording.sha256);meta.recordedSequenceReference={commit:'812f5113931e4cc6486dcc5b7559f0f85b212bdf',fileSHA256:hash(recorded),dataSHA256:hash(sequences)};
 let baseline=null;
 // New finite24-tick correctness controls; reuse immutable A/B/C instead of repeating original120-tick trials. No pilot TPS inference.
 for(const [research,mode,level,capture]of [[false,'real','off',false],[true,'real','off',false],[true,'real','counter',false],[true,'real','phase',false],[true,'vision','phase',false],[true,'brain','phase',false],[true,'learning','phase',false],[true,'feeding','phase',false]]){
 await navigate(research);await load(p,mode,level);if(mode==='real'&&level==='off'){const counter=await span(()=>ask(p,'counterCheck'));archive('counter-check-'+(research?'research':'lean'),counter);expect(counter).toEqual({completed:7,simTicks:7,firstFrameSteps:4,secondFrameSteps:3});await load(p,mode,level);}
 const pilot=await span(()=>ask(p,'pilot',{capture}));
 if(capture){sequences=pilot.sequences;expect(Object.keys(sequences)).toHaveLength(30);for(const a of Object.values(sequences)){expect(a.vision).toHaveLength(3);expect(a.brain).toHaveLength(3);}}
 if(!baseline)baseline=pilot.snapshot;
 if(mode==='real'){expect(pilot.snapshot).toEqual(baseline);}
 const info=await details(p,pilot.snapshot);expect(Math.abs(info.validation.energy-info.validation.budget)).toBeLessThan(1e-5);
 const row={research,mode,level,snapshot:pilot.snapshot,diagnostic:pilot.diagnostic,details:info,allRealEqual:mode==='real'?true:null};pilots.push(row);archive('pilot-'+pilots.length,row);
 }
 archive('recorded-sequences',{originalEvidence:'812f5113931e4cc6486dcc5b7559f0f85b212bdf',captureTicks:[1,2,3],selector:'(hash73(id)+logicalTick-1)%3',authoritativePRNGUsed:false,sequences,sha256:hash(sequences)});
 meta.readinessSeconds=(Date.now()-Number(process.env.STAGE37B_JOB_STARTED||started))/1000;if(meta.readinessSeconds>600)throw Error('600s setup ceiling');
 const pageCDP=await ctx.newCDPSession(p);await pageCDP.send('Performance.enable');
 const matrix=[['P01',true,'real','off',12000,false],['P02',true,'vision','off',12000,false],['P03',true,'brain','off',12000,false],['P04',true,'real','off',12000,false],['P05',true,'real','off',12000,false],['P06',true,'learning','off',12000,false],['P07',true,'feeding','off',12000,false],['P08',true,'real','off',12000,false],['C01',false,'real','off',5000,false],['C02',true,'real','counter',5000,false],['C03',true,'real','phase',5000,false],['C04',true,'real','off',5000,true]];
 for(const [id,research,mode,level,durationMs,traced]of matrix){
 check();current={id,research,mode,level,durationMs,traced,status:'warmup'};ledger.push(current);writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));await navigate(research);
 await span(async()=>{await load(p,mode,level);await speed(p,'max');await p.waitForTimeout(2000);await speed(p,0);});await load(p,mode,level);
 if(traced){await beginTrace(bc);await ask(p,'mark',{label:'S37B_WORKER_'+id});await p.evaluate(id=>performance.mark('S37B_MAIN_'+id),id);}
 const cpuBefore=cpuSnapshot(browserPID),metricsBefore=await pageCDP.send('Performance.getMetrics');await ask(p,'arm');const mainStart=await p.evaluate(()=>window.__s37bBrowser.begin());current.status='measurement-started';writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));let after,main,cpuAfter;
 await span(async()=>{await speed(p,'max');await p.waitForTimeout(durationMs);after=await ask(p,'end');pendingRaw={id,after,cpuBefore,metricsBefore,mainStart};cpuAfter=cpuSnapshot(browserPID);main=await p.evaluate(()=>window.__s37bBrowser.end());await speed(p,0);});
 const trace=traced?await endTrace(bc):null,final=await ask(p,'snapshot');const metricsAfter=await pageCDP.send('Performance.getMetrics'),wallMs=after.end-after.begin;
 pendingRaw={id,research,mode,level,traced,durationMs,startSHA256:initialHash,final,boundary:{...after,mainStart},cpuBefore,cpuAfter,metricsBefore,metricsAfter,main};
 archive(id+'-original',pendingRaw);if(trace)archive(id+'-trace',trace);current.status='original-retained';writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));pendingRaw=null;
 const info=await details(p,final);
 expect(after.steps).toBe(Math.round((final.state.simTime-checkpoint.state.simTime)*60));expect(after.steps).toBeGreaterThan(0);expect(wallMs).toBeGreaterThan(durationMs*.9);expect(main.error).toBeNull();expect(main.visible).toBe('visible');expect(Math.abs(info.validation.energy-info.validation.budget)).toBeLessThan(1e-5);
 const beginAbs=after.origin+after.begin,endAbs=after.origin+after.end,frames=main.rows.filter(x=>x.timestamp+main.origin>=beginAbs&&x.timestamp+main.origin<=endAbs),reports=main.transports.filter(x=>x.main+main.origin>=beginAbs&&x.main+main.origin<=endAbs);
 const summary={id,research,mode,level,traced,ticks:after.steps,wallMs,ticksPerSecond:after.steps*1000/wallMs,multiplier:after.steps*1000/wallMs/60,inventory:info.inventory,validation:info.validation,startSHA256:initialHash,endSHA256:hash(final.state),endPRNG:final.state.prngState,fps:frames.length*1000/wallMs,reportsPerSecond:reports.length*1000/wallMs,diagnostic:after.diagnostic};
 archive(id+'-validated',summary);results.push(summary);current.status='retained';current=null;pendingRaw=null;writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));writeFileSync(out+'/summary.json',JSON.stringify({meta,results,activeMs,rawBytes},null,2));console.log('S37B_WINDOW='+JSON.stringify({...summary,diagnostic:undefined}));check();
 }
 }catch(e){failure=String(e);if(current){current.status='FAILED_OR_UNKNOWN';current.failure=failure;}if(pendingRaw)archive('failed-window-original',pendingRaw);archive('failure',{failure,current,ledger,activeMs,meta});throw e;}
 finally{meta.finished=new Date().toISOString();meta.activeMs=activeMs;meta.failure=failure;meta.ledger=ledger;meta.rawBytesBeforeManifest=rawBytes;meta.receipts=receipts.slice();meta.finalSourceDigests=digests();meta.runnerWallMs=Date.now()-started;archive('manifest',meta);writeFileSync(out+'/summary.json',JSON.stringify({meta,results,activeMs,rawBytes},null,2));writeFileSync(out+'/ledger.json',JSON.stringify(ledger,null,2));console.log('S37B_FINAL='+JSON.stringify({sourceSHA:sha,activeMs,rawBytes,windows:results.length,failure,ledger}));for(const c of contexts)try{await c.close();}catch{}for(const s of servers)await new Promise(r=>s.httpServer.close(()=>r()));}
});
