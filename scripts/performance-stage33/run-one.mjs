/** One preregistered process slot. Writes only stdout; preserve its archive. */
import {readFileSync} from 'node:fs';
import {brotliDecompressSync,gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import os from 'node:os';
const cfg=JSON.parse(process.env.VIDA_STAGE33_SLOT), hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const result={config:cfg,started:new Date().toISOString(),base:'29e3f7569e1e788e3301d4bb9f71aa1a4a01d3ff',failures:[]};
const probe=globalThis.__stage33={active:false,rows:{},seen:{},sampledTicks:0,
 start(){return this.active?performance.now():0;},
 end(key,start,items,offset=0,wrapped=false) {
  if(!this.active)return;const ms=performance.now()-start;
  const row=this.rows[key]??={calls:0,units:0,ms:0,uniqueParts:0};
  row.calls++;row.units+=items.length-offset;row.ms+=ms;
  const seen=this.seen[key]??=new WeakSet();
  for(const item of items){const def=wrapped?item.def:item;if(!seen.has(def)){seen.add(def);row.uniqueParts++;}}
 }};
try {
 await import('data:text/javascript;base64,'+Buffer.from(process.env.VIDA_STAGE33_LOADER).toString('base64'));
 const {SimulationHost}=await import(pathToFileURL(process.cwd()+'/simulationHost.ts'));
 const {createSnapshot,totalAccountedEnergy}=await import(pathToFileURL(process.cwd()+'/persistence.ts'));
 const checkpoint=JSON.parse(brotliDecompressSync(readFileSync('docs/experiments/performance-stage-3-v1/'+cfg.scenario+'-checkpoint.json.br')));
 const host=new SimulationHost();host.reset(checkpoint,1);
 result.sourceHash=hash(checkpoint);result.restoredHash=hash(host.snapshot());
 result.inventory={organisms:host.state.organisms.length,parts:host.state.organisms.reduce((n,o)=>n+o.segments.length,0),food:host.state.nutrients.length};
 result.environment={node:process.version,os:os.release(),cpu:os.cpus()[0]?.model,cpus:os.availableParallelism(),flags:process.execArgv.filter(x=>x!=='-e'),memoryMax:readFileSync('/sys/fs/cgroup/memory.max','utf8').trim(),cpuMax:readFileSync('/sys/fs/cgroup/cpu.max','utf8').trim()};
 if(!cfg.preflight) {
  for(let i=0;i<60;i++)host.tick();
  result.warmHash=hash(host.snapshot());result.tickMs=[];result.periodicHashes=[];
  result.heapStart=process.memoryUsage();const cpu=process.cpuUsage(),start=performance.now();
  for(let t=0;t<300;t++) {
   probe.active=cfg.mode==='diagnostic'&&t%8===0;if(probe.active)probe.sampledTicks++;
   const before=performance.now();host.tick();result.tickMs.push(performance.now()-before);probe.active=false;
   if(t%60===59)result.periodicHashes.push(hash(host.snapshot()));
   if(performance.now()-start>20000||process.memoryUsage().rss>512*1024*1024)throw new Error('Registered slot resource ceiling');
  }
  result.windowMs=performance.now()-start;result.cpu=process.cpuUsage(cpu);result.heapEnd=process.memoryUsage();
  result.kernelMs=result.tickMs.reduce((a,b)=>a+b,0);result.probe={rows:probe.rows,sampledTicks:probe.sampledTicks};
  const final=createSnapshot(host.state,host.settings);result.finalHash=hash(final);
  result.finalSnapshot=cfg.mode==='baseline'&&cfg.rep===1?final:null;
  result.finalInventory={organisms:host.state.organisms.length,parts:host.state.organisms.reduce((n,o)=>n+o.segments.length,0),food:host.state.nutrients.length};
  result.energyErrorJ=totalAccountedEnergy(host.state)-host.state.energyPool.budget;
 }
 result.sources=globalThis.__stage33Sources;
} catch(e) {result.failures.push(String(e.stack??e));}
result.finished=new Date().toISOString();
const archive=gzipSync(JSON.stringify(result));
const receipt={config:cfg,failures:result.failures,sourceHash:result.sourceHash,warmHash:result.warmHash,periodicHashes:result.periodicHashes,finalHash:result.finalHash,kernelMs:result.kernelMs,windowMs:result.windowMs,probe:result.probe,inventory:result.inventory,energyErrorJ:result.energyErrorJ,sources:result.sources,
 archiveSHA256:createHash('sha256').update(archive).digest('hex'),gitBlobSHA:createHash('sha1').update('blob '+archive.length+'\0').update(archive).digest('hex'),archiveBytes:archive.length};
console.log('STAGE33_RESULT='+JSON.stringify({receipt,archive:archive.toString('base64')}));
if(result.failures.length)process.exitCode=1;
