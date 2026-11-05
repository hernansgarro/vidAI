import {build} from 'vite';
import {Worker} from 'node:worker_threads';
import {mkdtemp,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Preregistered P10.5 kernel-only Worker probe, NOT the browser pump or P11.
const [baseRoot,output]=process.argv.slice(2);
if(!baseRoot || !output) throw new Error('Usage: node scripts/measure-incremental-grid.mjs BASE_ROOT OUTPUT_JSON');
const work=await mkdtemp(join(tmpdir(),'vida-p105-'));
const sources={P10:resolve(baseRoot),P105:process.cwd()},bundles={};
for(const [label,root] of Object.entries(sources)) {
  const entry=join(work,`${label}.ts`),out=join(work,label);
  await writeFile(entry,`
import {parentPort} from 'node:worker_threads';
import {createHash} from 'node:crypto';
import {SimulationHost} from ${JSON.stringify(join(root,'simulationHost.ts'))};
import {createInitialWorld} from ${JSON.stringify(join(root,'world.ts'))};
import {createSnapshot,DEFAULT_SETTINGS} from ${JSON.stringify(join(root,'persistence.ts'))};
import {MaintainedWorldGrid} from ${JSON.stringify(join(root,'maintainedGrid.ts'))};
const settings={...DEFAULT_SETTINGS,targetNutrients:275,inflowRate:0,ecologyRegime:'closed-v1',nutrientCycle:'decay-v2',physicsRegime:'passive-work-v3'};
parentPort.on('message',({creatures,audit,counts})=>{
  const source=createSnapshot(createInitialWorld(settings,73,'balanced','standard',creatures),settings);
  const host=new SimulationHost();host.reset(source,1);
  for(let i=0;i<60;i++) host.tick();
  host.reset(source,2);host.gridAudit.schedule.setEnabled(audit,0);
  const operations={synchronize:0,rosterVisits:0,syncFood:0,syncEgg:0,syncOrganism:0,queryBounds:0,queryRay:0};
  if(counts) {
    host.tick(); // exclude one-time kernel setup from steady operation counts
    for(const method of ['synchronize','syncFood','syncEgg','syncOrganism','queryBounds','queryRay']) {
      const original=MaintainedWorldGrid.prototype[method];
      MaintainedWorldGrid.prototype[method]=function(...args){
        operations[method]++;
        if(method==='synchronize')operations.rosterVisits+=this.state.nutrients.length+this.state.eggs.length+this.state.organisms.length+this.state.organisms.reduce((n,o)=>n+o.segments.length,0);
        return original.apply(this,args);
      };
    }
  }
  const ticks=counts?120:3600,start=performance.now();let completed=0;
  for(;completed<ticks;completed++) {
    host.tick();
    if(performance.now()-start>30000) {completed++;break;}
  }
  const elapsedMs=performance.now()-start;
  const snapshot=JSON.stringify(host.snapshot()),diagnostics=host.frame().diagnostics;
  parentPort.postMessage({creatures,audit,counts,completed,requested:ticks,elapsedMs,tps:completed*1000/elapsedMs,simulatedSpeed:completed/60*1000/elapsedMs,
    hash:createHash('sha256').update(snapshot).digest('hex'),operations,audits:diagnostics.length,diagnostics});
});
`);
  await build({configFile:false,root,logLevel:'error',build:{outDir:out,emptyOutDir:true,minify:true,
    lib:{entry,formats:['es'],fileName:()=> 'probe.mjs'},rolldownOptions:{external:['node:worker_threads','node:crypto']}}});
  bundles[label]=join(out,'probe.mjs');
}
const results=[],start=performance.now();
const save=()=>writeFile(resolve(output),JSON.stringify({protocol:'P10.5 fixed 3600 ticks, 275 food, seed73, audit60s; dedicated compiled SimulationHost Worker, no browser pacing/UI',node:process.version,baseRoot:resolve(baseRoot),elapsedMs:performance.now()-start,results},null,2)+'\n');
await mkdir(resolve(output,'..'),{recursive:true});
async function run(label,creatures,audit,counts,round) {
  if(performance.now()-start>300000)throw new Error('300s campaign limit');
  const worker=new Worker(bundles[label]);
  try {
    const result=await new Promise((resolveResult,reject)=>{
      const timer=setTimeout(()=>reject(new Error('Worker window did not complete within closure reserve')),40000);
      worker.once('message',value=>{clearTimeout(timer);resolveResult(value);});worker.once('error',reject);
      worker.postMessage({creatures,audit,counts});
    });
    results.push({label,round,...result});await save();
    assert.equal(result.completed,result.requested,'incomplete window: preserve and stop, no retry');
    if(!counts) assert.equal(result.audits,audit?1:0,'normal audit interval only');
  } finally {await worker.terminate();}
}
try {
  for(const label of ['P10','P105'])for(const creatures of [0,2])await run(label,creatures,false,true,-1);
  const order=[];for(const creatures of [0,2])for(const audit of [false,true])for(const label of ['P10','P105'])order.push([label,creatures,audit]);
  for(const [round,list] of [[0,order],[1,[...order].reverse()]])for(const [label,creatures,audit] of list)await run(label,creatures,audit,false,round);
  for(const creatures of [0,2]) {
    const hashes=new Set(results.filter(r=>!r.counts&&r.creatures===creatures).map(r=>r.hash));
    assert.equal(hashes.size,1,'complete state must match across sources/audit/rounds');
  }
  await save();
} catch(error) {results.push({failure:String(error)});await save();throw error;}
console.log(JSON.stringify({windows:results.length,elapsedMs:performance.now()-start,file:resolve(output)}));
