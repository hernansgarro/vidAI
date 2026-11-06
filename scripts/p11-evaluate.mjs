import {build} from 'vite';
import ts from 'typescript';
import {Worker} from 'node:worker_threads';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join,basename} from 'node:path';
import {createHash} from 'node:crypto';
import os from 'node:os';
const [base,output,mode='pilot']=process.argv.slice(2), root=process.cwd(), out=resolve(output);
await mkdir(out,{recursive:true});
const sources={main:resolve(base),testing:root}, bundles={};
const measuredFunctions=new Set(['stepSimulation','advanceNutrientCycle','advanceOrganismPhysics','resolveBodyContacts',
  'bodies','pairs','collectBodyContactPairs','projectBodyJoints','evaluateOrganismBrain','applyWakingPlasticity','applySensoryAssociations']);
const measuredMethods=new Set(['synchronize','prepareTick','syncFood','syncEgg','syncOrganism','queryBounds','queryRay','query','ordered','relocate','register','remove','collect','append']);
function instrument(code,id) {
  const sf=ts.createSourceFile(id,code,ts.ScriptTarget.Latest,true), edits=[];
  const walk=n=>{
    const name=n.name?.getText(sf);
    if(n.body && (ts.isFunctionDeclaration(n)&&measuredFunctions.has(name)||ts.isMethodDeclaration(n)&&measuredMethods.has(name)||ts.isConstructorDeclaration(n)&&basename(id)==='spatialIndex.ts')) {
      const key=basename(id)+':'+(name??'constructor');
      edits.push([n.body.getStart(sf)+1,`const __t=globalThis.__p11.enter(${JSON.stringify(key)});try{`],
        [n.body.end-1,`}finally{globalThis.__p11.exit(${JSON.stringify(key)},__t);}`]);
    }
    ts.forEachChild(n,walk);
  };walk(sf);
  for(const [pos,text] of edits.sort((a,b)=>b[0]-a[0]))code=code.slice(0,pos)+text+code.slice(pos);
  if(basename(id)==='simulation.ts') {
    code=code.replace('// A. MULTI-EYE OPTICAL RGB RAYCAST WITH WATER ATTENUATION',`const __vision=globalThis.__p11.enter('phase:vision');\n// A. MULTI-EYE OPTICAL RGB RAYCAST WITH WATER ATTENUATION`)
      .replace('// All joints have normalized angle',`globalThis.__p11.exit('phase:vision',__vision);\n// All joints have normalized angle`)
      .replace('// D. CONTACT FEEDING.',`const __feeding=globalThis.__p11.enter('phase:feeding');\n// D. CONTACT FEEDING.`)
      .replace('// E.',`globalThis.__p11.exit('phase:feeding',__feeding);\n// E.`);
  }
  return code;
}
for(const [label,path] of Object.entries(sources))for(const diagnostic of (mode==='pilot'||mode==='primary'?[false]:[false,true])) {
  const entry=join(out,`entry-${label}-${diagnostic}.ts`), dest=join(out,`${label}-${diagnostic}`);
  await writeFile(entry,`
import {parentPort} from 'node:worker_threads';
import {createHash} from 'node:crypto';
import {Session} from 'node:inspector';
import {SimulationHost} from ${JSON.stringify(join(path,'simulationHost.ts'))};
import {embodiedEnergy} from ${JSON.stringify(join(path,'energyEconomy.ts'))};
${label==='testing'?`import {MaintainedWorldGrid} from ${JSON.stringify(join(path,'maintainedGrid.ts'))};
import {CentralSpatialGrid} from ${JSON.stringify(join(path,'centralSpatialGrid.ts'))};`:''}
const metrics={}, stack=[];let enabled=false;
globalThis.__p11={enter(k){if(!enabled)return 0;const t=performance.now();stack.push({k,t,child:0});return t;},exit(k,t){if(!t)return;const d=performance.now()-t,s=stack.pop();if(s.k!==k)throw Error('phase stack mismatch '+s.k+' '+k);const r=metrics[k]??={calls:0,inclusiveMs:0,exclusiveMs:0};r.calls++;r.inclusiveMs+=d;r.exclusiveMs+=d-s.child;if(stack.length)stack[stack.length-1].child+=d;}};
parentPort.on('message',async ({snapshot,warmup,ticks,kind})=>{
const h=new SimulationHost();h.reset(snapshot,1);for(let i=0;i<warmup;i++)h.tick();h.reset(snapshot,2);h.tick();
const startState=JSON.stringify(h.snapshot());const operations={};
${label==='testing'?`
if(kind==='diagnostic') {
for(const [proto,methods] of [[CentralSpatialGrid.prototype,['relocate','queryBounds','queryRay']],[MaintainedWorldGrid.prototype,['synchronize','ordered']]])for(const method of methods){
const original=proto[method];proto[method]=function(...a){const r=original.apply(this,a),key=proto===CentralSpatialGrid.prototype?'matrix.':'world.';const m=operations[key+method]??={calls:0,changed:0,input:0,output:0};m.calls++;if(method==='relocate'&&r)m.changed++;if(method==='ordered')m.input+=a[0].length;if(Array.isArray(r))m.output+=r.length;return r;};
}
}
if(kind==='audit') {const a=[];for(let i=0;i<5;i++){const t=performance.now(),r=h.gridAudit.audit(h.state);a.push({ms:performance.now()-t,issues:r.issueCount});}parentPort.postMessage({audits:a,physicalUnchanged:startState===JSON.stringify(h.snapshot())});return;}
`:''}
const session=new Session();const post=(m,p={})=>new Promise((yes,no)=>session.post(m,p,(e,r)=>e?no(e):yes(r)));
if(kind==='allocation'){session.connect();await post('HeapProfiler.startSampling',{samplingInterval:32768});}
const memoryBefore=process.memoryUsage(),cpu=process.threadCpuUsage(),t=performance.now();let done=0;
enabled=kind==='diagnostic';
for(;done<ticks;done++){h.tick();if(performance.now()-t>30000){done++;break;}}
const elapsedMs=performance.now()-t,threadCpuUs=process.threadCpuUsage(cpu),memoryAfter=process.memoryUsage();enabled=false;
const profile=kind==='allocation'?(await post('HeapProfiler.stopSampling')).profile:undefined;if(kind==='allocation')session.disconnect();
const end=h.snapshot(),state=h.state,fr=h.frame();
parentPort.postMessage({done,requested:ticks,elapsedMs,tps:done*1000/elapsedMs,effectiveX:done/60*1000/elapsedMs,threadCpuUs,memoryBefore,memoryAfter,
hash:createHash('sha256').update(JSON.stringify(end)).digest('hex'),startHash:createHash('sha256').update(startState).digest('hex'),
population:state.organisms.length,parts:state.organisms.reduce((n,o)=>n+o.segments.length,0),food:state.nutrients.length,eggs:state.eggs.length,
energyError:state.energyPool.budget-state.energyPool.reserve-embodiedEnergy(state),metrics,operations,diagnostics:fr.diagnostics??[],profile});
});
`);
  await build({configFile:false,root:path,logLevel:'error',plugins:diagnostic?[{name:'p11-research-only',load(id){if(['simulation.ts','contacts.ts','maintainedGrid.ts','centralSpatialGrid.ts','spatialIndex.ts'].includes(basename(id)))return readFile(id,'utf8').then(s=>instrument(s,id));}}]:[],build:{outDir:dest,emptyOutDir:true,minify:true,lib:{entry,formats:['es'],fileName:()=> 'probe.mjs'},rolldownOptions:{external:['node:worker_threads','node:crypto','node:inspector']}}});
  bundles[label+'-'+diagnostic]=join(dest,'probe.mjs');
}
const results=[],started=performance.now(), file=join(out,mode+'.json');
const save=()=>writeFile(file,JSON.stringify({mode,node:process.version,cpu:os.cpus()[0].model,started:new Date().toISOString(),durationMs:performance.now()-started,results},null,2));
async function run(label,scene,round,kind='lean') {
  if(performance.now()-started>900000)throw Error('campaign budget');
  const slot={label,scene,round,kind};results.push(slot);await save();
  const worker=new Worker(bundles[label+'-'+(kind==='diagnostic')]);
  try {
    const snapshot=JSON.parse(await readFile(join(out,'scenes',scene+'.json'),'utf8'));
    const value=await new Promise((yes,no)=>{const timer=setTimeout(()=>no(Error('window timeout')),40000);worker.once('message',r=>{clearTimeout(timer);yes(r);});worker.once('error',e=>{clearTimeout(timer);no(e);});worker.postMessage({snapshot,warmup:mode==='pilot'?30:mode==='primary'?120:60,ticks:mode==='pilot'?60:mode==='primary'?180:120,kind});});
    Object.assign(slot,value);if(slot.profile){await writeFile(join(out,'allocation-'+label+'.json'),JSON.stringify(slot.profile));delete slot.profile;}
    await save();console.log(JSON.stringify({...slot,metrics:undefined,operations:undefined,memoryBefore:undefined,memoryAfter:undefined}));
    if(kind!=='audit'&&(slot.done!==slot.requested||!Number.isFinite(slot.energyError)||Math.abs(slot.energyError)>.01))throw Error('invalid/incomplete slot');
  }catch(e){slot.error=String(e);await save();throw e;}finally{await worker.terminate();}
}
if(mode==='pilot'||mode==='primary')for(let round=0;round<(mode==='pilot'?1:3);round++)for(const scene of round%2?['adversarial','dense','moderate','empty']:['empty','moderate','dense','adversarial'])for(const label of round%2?['testing','main']:['main','testing'])await run(label,scene,round);
if(mode==='diagnostic'){
for(const scene of ['empty','moderate','dense','adversarial'])for(const label of ['main','testing'])await run(label,scene,0,'diagnostic');
for(const label of ['testing','main'])for(const kind of ['lean','diagnostic'])await run(label,'dense',1,kind);
for(const label of ['main','testing'])for(const kind of ['lean','allocation'])await run(label,'dense',2,kind);
for(let i=0;i<2;i++)await run('testing','dense',i,'audit');
}
