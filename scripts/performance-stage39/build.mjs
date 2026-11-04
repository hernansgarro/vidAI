// Explicit Vite-only profiling transform. All production files remain unchanged.
import {build,preview} from 'vite';
import {resolve,basename} from 'node:path';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=process.cwd();
export const sourcePaths=['simulation.ts','simulation.worker.ts','simulationHost.ts','contacts.ts','neuralRuntime.ts','spatialIndex.ts','energyActivity.ts','energyEconomy.ts','persistence.ts','world.ts','App.tsx','package.json','package-lock.json',...['build.mjs','runtime.mjs','measurement.mjs','fixture.ts','browser-init.mjs','accounting.mjs','archive.mjs','test-archive.mjs','preserve.mjs'].map(n=>'scripts/performance-stage39/'+n)];
export const digests=()=>Object.fromEntries(sourcePaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const once=(c,a,b)=>{if(c.split(a).length!==2)throw Error('Research anchor mismatch: '+a);return c.replace(a,b);};
export function plugin(research){return {name:'explicit-stage39-only',enforce:'pre',
 transformIndexHtml:{order:'pre',handler(){return [{tag:'script',attrs:{type:'module',src:'/scripts/performance-stage39/fixture.ts'},injectTo:'head'}];}},
 transform(code,id){const path=id.split('?')[0],file=basename(path);if(path!==resolve(root,file))return null;let c=code;
 if(research&&['simulation.ts','simulationHost.ts','contacts.ts','spatialIndex.ts','energyActivity.ts'].includes(file))c="import {r as __r} from './scripts/performance-stage39/runtime.mjs';\n"+c;
 if(research&&file==='simulationHost.ts'){
  c=once(c,'  tick(): void {','  tick(): void {__r.begin();__r.phase("environment");');
  c=once(c,'    this.energyActivity.advance(this.state);','    __r.phase("observer");this.energyActivity.advance(this.state);');
  c=once(c,'    this.steps++;','    this.steps++;__r.finish();');
 }
 if(research&&file==='simulation.ts'){
  for(const[a,b]of [
   ['  const bodySight = organisms.flatMap','  __r.phase("sight-build");const bodySight = organisms.flatMap'],
   ['    const org = organisms[orgIdx];','    __r.phase("organism-overhead");const org = organisms[orgIdx];'],
   ['    // A. MULTI-EYE OPTICAL RGB RAYCAST WITH WATER ATTENUATION','    __r.phase("vision");\n    // A. MULTI-EYE OPTICAL RGB RAYCAST WITH WATER ATTENUATION'],
   ['    // All joints have normalized angle and angular-velocity feedback.','    __r.phase("neural-inputs");\n    // All joints have normalized angle and angular-velocity feedback.'],
   ['    evaluateOrganismBrain(org, dt);','    __r.phase("inference");if(__r.detail)__r.count("brainEvaluations");evaluateOrganismBrain(org, dt);'],
   ['    if ((g.plasticityRate ?? 0) > 0) {','    __r.phase("motor-learning");if ((g.plasticityRate ?? 0) > 0) {'],
   ['    if ((g.sensoryPlasticityRate ?? 0) > 0) {','    __r.phase("sensory-learning");if ((g.sensoryPlasticityRate ?? 0) > 0) {'],
   ['  const active = organisms.filter','  __r.phase("physics");const active = organisms.filter'],
   ['    const org = active[index], g = org.genome;\n    let frameMechanicalWork','    __r.phase("metabolism");const org = active[index], g = org.genome;\n    let frameMechanicalWork'],
   ['  const preyGrid = new OrderedSpatialIndex','  __r.phase("feeding-index");const preyGrid = new OrderedSpatialIndex'],
   ['    // D. CONTACT FEEDING.','    __r.phase("feeding");\n    // D. CONTACT FEEDING.'],
   ['    org.mouthFeedback = oralFeedback;','    org.mouthFeedback = oralFeedback;__r.phase("reproduction-death");'],
   ['  // 6. Bubbles','  __r.phase("finalize");\n  // 6. Bubbles'],
   ['        for (const candidate of candidates) {','        if(__r.detail)__r.count("visionCandidates",candidates.length);for (const candidate of candidates) {'],
   ['        const candidates = sightGrid.query','        if(__r.detail)__r.count("rays");const candidates = sightGrid.query'],
   ['const res = rayCircleIntersection(eyeWorldX, eyeWorldY, rayDirX, rayDirY, closestDist, nut.x','if(__r.detail)__r.count("circleTestsFood");const res = rayCircleIntersection(eyeWorldX, eyeWorldY, rayDirX, rayDirY, closestDist, nut.x'],
   ['              const inter = lineIntersection','              if(__r.detail)__r.count("bodyEdgeTests");const inter = lineIntersection'],
   ['    for (const mouth of g.mouths) {\n      const feedback = oralFeedback','    for (const mouth of g.mouths) {\n      if(__r.detail)__r.count("mouths");const feedback = oralFeedback'],
   ['  const g = org.genome, numJoints = org.joints.length;','  if(__r.detail){__r.count("bodyAdvances");__r.count("partAdvances",org.segments.length);__r.count("jointAdvances",org.joints.length);}const g = org.genome, numJoints = org.joints.length;']
  ])c=once(c,a,b);
 }
 if(research&&file==='contacts.ts'){
  c=once(c,'      contactCount++; touched.add','      if(__r.detail)__r.count(a.org===b.org?"selfResolvedContacts":"externalResolvedContacts");contactCount++; touched.add');
  c=once(c,'    let contactCount = 0;','    if(__r.detail)__r.count("contactPasses");let contactCount = 0;');
  c=once(c,'      result.push([b, a]);','      if(__r.detail)__r.count(a.org===b.org?"selfContactCandidates":"externalContactCandidates");result.push([b, a]);');
 }
 if(research&&file==='spatialIndex.ts')c=once(c,'    this.visited = new Uint32Array(bounds.length);','    if(__r.detail)__r.count("indexEntries",bounds.length);this.visited = new Uint32Array(bounds.length);');
 if(research&&file==='energyActivity.ts')c=once(c,'    for (const [id, entry] of this.entries) {','    if(__r.detail)__r.count("activityEntries",this.entries.size);for (const [id, entry] of this.entries) {');
 if(file==='simulation.worker.ts'){
  c=(research?"import {r as __r} from './scripts/performance-stage39/runtime.mjs';\n":'')+c;
  c=once(c,'const host = new SimulationHost();',`const host=new SimulationHost();let __armed=false,__begin=0,__steps=0,__completed=0,__remaining=0,__token=null;const __originalTick=host.tick.bind(host);host.tick=()=>{__originalTick();__completed++;if(__remaining>0&&--__remaining===0){const end=performance.now();host.speed=0;${research?'__r.active=false;':''}self.postMessage({type:'s39-complete',token:__token,begin:__begin,end,origin:performance.timeOrigin,steps:__completed-__steps,simTime:host.state.simTime,diagnostic:${research?'__r.dump()':'null'}});}};
self.addEventListener('message',({data})=>{if(data.type!=='s39')return;try{if(data.epoch!==host.epoch)throw Error('Epoch mismatch');let value;
if(data.op==='config'){if(host.speed!==0)throw Error('Configure while paused');${research?'__r.configure(data.level);':''}value={research:${research},level:data.level,selected:host.selected};}
else if(data.op==='counterCheck'){if(host.speed!==0)throw Error('Counter while paused');const before=__completed,sim=host.state.simTime;for(let i=0;i<4;i++)host.tick();const first=host.frame().steps;for(let i=0;i<3;i++)host.tick();const second=host.frame().steps;value={completed:__completed-before,simTicks:Math.round((host.state.simTime-sim)*60),firstFrameSteps:first,secondFrameSteps:second};}
else if(data.op==='pilot'){if(host.speed!==0)throw Error('Pilot while paused');const ticks=data.ticks??24;if(!Number.isInteger(ticks)||ticks<1||ticks>120)throw Error('Pilot tick cap');${research?'__r.active=true;':''}const start=performance.now();for(let i=0;i<ticks;i++)host.tick();const elapsed=performance.now()-start;${research?'__r.active=false;':''}value={snapshot:host.snapshot(),elapsed,diagnostic:${research?'__r.dump()':'null'}};}
else if(data.op==='arm'){if(host.speed!==0||!Number.isInteger(data.ticks)||data.ticks<1)throw Error('Invalid arm');__armed=true;__remaining=data.ticks;__token=data.token;value={ready:true};}
else if(data.op==='snapshot')value=host.snapshot();else if(data.op==='mark'){performance.mark(data.label);value={label:data.label};}else throw Error('Unknown research op');self.postMessage({type:'s39-result',id:data.id,value});}catch(e){self.postMessage({type:'s39-result',id:data.id,value:{researchError:String(e)}});}});`);
  c=once(c,'      host.selected = data.selected; return;',`      host.selected=data.selected;if(__armed&&data.speed!==0){__armed=false;__begin=performance.now();__steps=__completed;${research?'__r.reset();__r.ordinal=0;__r.active=true;':''}}return;`);
  c=once(c,'while ((unlimited || accumulator >= 1 / 60)', 'while (host.speed!==0 && (unlimited || accumulator >= 1 / 60)');
  if(research)c=once(c,"  port.postMessage({type: 'frame', frame: host.frame()});",`  if(__r.active&&__r.level==='phase'){const start=performance.now(),frame=host.frame(),built=performance.now();port.postMessage({type:'frame',frame});__r.transport.push({tick:__r.ordinal,buildMs:built-start,postMs:performance.now()-built});}else port.postMessage({type:'frame',frame:host.frame()});`);
 }
 return c===code?null:{code:c,map:null};
 }};}
export async function prepare(research,port){const outDir=research?'s39-research-dist':'s39-lean-dist';await build({logLevel:'warn',plugins:[plugin(research)],worker:{plugins:()=>[plugin(research)]},build:{outDir,emptyOutDir:true,sourcemap:true}});return preview({logLevel:'warn',build:{outDir},preview:{host:'127.0.0.1',port,strictPort:true}});}
