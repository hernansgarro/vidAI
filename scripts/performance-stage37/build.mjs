// Strict research-only Vite transforms; ordinary build/source files stay untouched.
import {build,preview} from 'vite';
import {resolve,basename} from 'node:path';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=process.cwd();
export const sourcePaths=['simulation.ts','simulation.worker.ts','simulationHost.ts','contacts.ts','neuralRuntime.ts','spatialIndex.ts','energyEconomy.ts','persistence.ts','world.ts','App.tsx','package.json','package-lock.json','scripts/performance-stage37/build.mjs','scripts/performance-stage37/runtime.mjs','scripts/performance-stage37/measurement.mjs','scripts/performance-stage37/fixture.ts'];
export const digests=()=>Object.fromEntries(sourcePaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const once=(c,a,b)=>{if(c.split(a).length!==2)throw Error('Research anchor mismatch: '+a);return c.replace(a,b);};
// Lexical balanced delimiters operate only on pinned named declarations. Unique anchors
// fail closed; the compiler then validates every transformed module.
function matching(code,start,open,close){let depth=0,quote=null,line=false,block=false;
 for(let i=start;i<code.length;i++){const ch=code[i],next=code[i+1];
 if(line){if(ch==='\n')line=false;continue;}if(block){if(ch==='*'&&next==='/'){block=false;i++;}continue;}
 if(quote){if(ch==='\\'){i++;continue;}if(ch===quote)quote=null;continue;}
 if(ch==='/'&&next==='/'){line=true;i++;continue;}if(ch==='/'&&next==='*'){block=true;i++;continue;}
 if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
 if(ch===open)depth++;if(ch===close&&!--depth)return i;
 }throw Error('Unbalanced research declaration');}
function spans(code,file){
 const names={
  'simulation.ts':['getCardinalAnchor','getOrganAnchor','getPartCornerVertices','projectBodyJoints','advanceOrganismPhysics','calculateOrganismCOM','evaluateOrganismBrain','applyWakingPlasticity','applySensoryAssociations','advanceNutrientCycle','bodyBounds'],
  'contacts.ts':['bodies','pairs','rotatedContact','contactImpulse','resolveBodyContacts'],
  'neuralRuntime.ts':['compiledBrain','compiledDeltas','writeDeltas','alignPlasticRecords'],
  'spatialIndex.ts':['constructor','query','queryBounds','collect']
 }[file]??[],edits=[];
 for(const name of names){const pattern=file==='spatialIndex.ts'?new RegExp('^  (?:private )?'+name+'\\(', 'gm'):new RegExp('^(?:export )?function '+name+'\\(', 'gm');
 const matches=[...code.matchAll(pattern)];if(matches.length!==1)throw Error('Nonunique named declaration '+name);
 const at=matches[0].index,paren=code.indexOf('(',at),end=matching(code,paren,'(',')');let start=code.indexOf('{',end),finish=matching(code,start,'{','}');
 if(/^[>\[\]\s]*\{/.test(code.slice(finish+1))){start=code.indexOf('{',finish+1);finish=matching(code,start,'{','}');}
 edits.push([start+1,`const __detail=__r.detail;if(__detail)__r.enter(${JSON.stringify(file+':'+name)});try{`],[finish,'}finally{if(__detail)__r.leave();}']);}
 for(const [pos,value]of edits.sort((a,b)=>b[0]-a[0]))code=code.slice(0,pos)+value+code.slice(pos);return code;
}
export function plugin(research){return {name:'explicit-stage37-only',enforce:'pre',
 transformIndexHtml:{order:'pre',handler(){return [{tag:'script',attrs:{type:'module',src:'/scripts/performance-stage37/fixture.ts'},injectTo:'head'}];}},
 transform(code,id){const path=id.split('?')[0],file=basename(path);if(path!==resolve(root,file))return null;let c=code;
 if(research&&['simulation.ts','simulationHost.ts','contacts.ts','neuralRuntime.ts','spatialIndex.ts'].includes(file))c="import {r as __r} from './scripts/performance-stage37/runtime.mjs';\n"+c;
 if(research&&file==='simulationHost.ts'){
 c=once(c,'  tick(): void {','  tick(): void {__r.begin();__r.phase("environment");');
 c=once(c,'    this.energyActivity.advance(this.state);','    __r.phase("observer");this.energyActivity.advance(this.state);');
 c=once(c,'    this.steps++;','    this.steps++;__r.finish();');
 }
 if(research&&file==='simulation.ts'){
 c=once(c,'  const bodySight = organisms.flatMap','  __r.phase("sight-build");\n  const bodySight = __r.mode==="vision"?[]:organisms.flatMap');
 c=once(c,"  const eggSight = eggs.map","  const eggSight = __r.mode===\"vision\"?[]:eggs.map");
 c=once(c,'    const org = organisms[orgIdx];','    __r.phase("organism-overhead");const org = organisms[orgIdx];');
 c=once(c,'    // A. MULTI-EYE OPTICAL RGB RAYCAST WITH WATER ATTENUATION','    __r.phase("vision");if(__r.mode==="vision"){__r.replay(org,"vision");}else{\n    // A. MULTI-EYE OPTICAL RGB RAYCAST WITH WATER ATTENUATION');
 c=once(c,'    // All joints have normalized angle and angular-velocity feedback.','    }\n    __r.capture(org,"vision");\n    __r.phase("neural-inputs");\n    // All joints have normalized angle and angular-velocity feedback.');
 // Retinal count is needed by the real proprioceptive and oral input construction.
 c=once(c,'    let rayInputIdx = 0;','    rayInputIdx = 0;');
 c=once(c,'    __r.phase("vision");','    let rayInputIdx=org.genome.eyes.length*20;__r.phase("vision");');
 c=once(c,'    evaluateOrganismBrain(org, dt);','    __r.phase("inference");if(__r.mode==="brain")__r.replay(org,"brain");else evaluateOrganismBrain(org, dt);__r.capture(org,"brain");');
 c=once(c,'    if ((g.plasticityRate ?? 0) > 0) {','    __r.phase("motor-learning");if(__r.mode==="learning")org.plasticityEnergyRate=0;\n    if (__r.mode!=="learning"&&(g.plasticityRate ?? 0) > 0) {');
 c=once(c,'    if ((g.sensoryPlasticityRate ?? 0) > 0) {','    __r.phase("sensory-learning");if (__r.mode!=="learning"&&(g.sensoryPlasticityRate ?? 0) > 0) {');
 c=once(c,'  const active = organisms.filter','  __r.phase("physics");const active = organisms.filter');
 c=once(c,'    const org = active[index], g = org.genome;\n    let frameMechanicalWork','    __r.phase("metabolism");const org = active[index], g = org.genome;\n    let frameMechanicalWork');
 c=once(c,'  const preyGrid = new OrderedSpatialIndex','  __r.phase("feeding-index");const preyGrid = __r.mode==="feeding"?null:new OrderedSpatialIndex');
 c=once(c,'    // D. CONTACT FEEDING.','    __r.phase("feeding");if(__r.mode==="feeding"){__r.feed(org,state,dt);}else{\n    // D. CONTACT FEEDING.');
 c=once(c,'    org.mouthFeedback = oralFeedback;','    org.mouthFeedback = oralFeedback;}\n    __r.phase("reproduction-death");');
 c=once(c,'  // 6. Bubbles','  __r.phase("finalize");\n  // 6. Bubbles');
 // Selective subphase spans, only on the preregistered sampled ticks.
 for(const [anchor,label] of [
  ['  const g = org.genome, numJoints = org.joints.length;','physics.metadata'],
  ['  // Motor torque computation across joints','physics.motors'],
  ['  // Integrated Hydrodynamic Drag','physics.drag-walls'],
  ['  // A complete joint solve is one provisional impulse batch. Preserve its','physics.joint-solve']
 ])c=once(c,anchor,(label==='physics.metadata'?'':'if(__r.detail)__r.leave();')+'if(__r.detail)__r.enter('+JSON.stringify(label)+');\n'+anchor);
 c=once(c,'  return frameMechanicalWork;','  if(__r.detail)__r.leave();return frameMechanicalWork;');
 c=once(c,'  const hiddenCount = g.hiddenIds!.length;','  if(__r.detail)__r.enter("inference.prepare-deltas");const hiddenCount = g.hiddenIds!.length;');
 c=once(c,'  for (let h = 0; h < hiddenCount; h++) scratchPrevHidden','  if(__r.detail){__r.leave();__r.enter("inference.hidden-recurrent");}for (let h = 0; h < hiddenCount; h++) scratchPrevHidden');
 c=once(c,'  const numJoints = org.segments.length - 1;','  if(__r.detail){__r.leave();__r.enter("inference.outputs");}const numJoints = org.segments.length - 1;');
 c=once(c,'    org.neuralOutputs[o] = isNaN(sum) ? 0 : Math.tanh(sum);','    org.neuralOutputs[o] = isNaN(sum) ? 0 : Math.tanh(sum);');
 c=once(c,'\n  \n}\n\n/** At the particle safety limit,','\n  if(__r.detail)__r.leave();\n}\n\n/** At the particle safety limit,');
 // Work-unit counters are sampled, without per-ray/contact clocks.
 c=once(c,'        for (const candidate of candidates) {','        if(__r.detail)__r.count("visionCandidates",candidates.length);\n        for (const candidate of candidates) {');
 c=once(c,'        const candidates = sightGrid.query','        if(__r.detail)__r.count("rays");const candidates = sightGrid.query');
 c=once(c,'const res = rayCircleIntersection(eyeWorldX, eyeWorldY, rayDirX, rayDirY, closestDist, nut.x','if(__r.detail)__r.count("circleTestsFood");const res = rayCircleIntersection(eyeWorldX, eyeWorldY, rayDirX, rayDirY, closestDist, nut.x');
 // Egg occurrence remains separately counted by generic source call volume only where present.
 c=once(c,'              const inter = lineIntersection','              if(__r.detail)__r.count("bodyEdgeTests");const inter = lineIntersection');
 c=once(c,'    for (const mouth of g.mouths) {\n      const feedback = oralFeedback','    for (const mouth of g.mouths) {\n      if(__r.detail)__r.count("mouths");const feedback = oralFeedback');
 }
 if(research&&file==='contacts.ts'){
 c=once(c,'      contactCount++; touched.add','      if(__r.detail)__r.count("actualContacts");contactCount++; touched.add');
 c=once(c,'    let contactCount = 0;','    if(__r.detail)__r.count("contactPasses");let contactCount = 0;');
 c=once(c,'      result.push([b, a]);','      if(__r.detail)__r.count("contactCandidates");result.push([b, a]);');
 }
 if(research&&file==='spatialIndex.ts')c=once(c,'    this.visited = new Uint32Array(bounds.length);','    if(__r.detail)__r.count("indexEntries",bounds.length);this.visited = new Uint32Array(bounds.length);');
 if(research&&['simulation.ts','contacts.ts','neuralRuntime.ts','spatialIndex.ts'].includes(file))c=spans(c,file);
 if(file==='simulation.worker.ts'){
 c=(research?"import {r as __r} from './scripts/performance-stage37/runtime.mjs';\n":'')+c;
 c=once(c,'const host = new SimulationHost();',`const host=new SimulationHost();let __armed=false,__begin=0,__steps=0;
 self.addEventListener('message',({data})=>{if(data.type!=='s37')return;try{if(data.epoch!==host.epoch)throw Error('Epoch mismatch');let value;
 if(data.op==='config'){if(host.speed!==0)throw Error('Configure while paused');${research?'__r.configure(data.mode,data.level);if(data.sequences)__r.sequences=data.sequences;':''}value={research:${research},mode:data.mode,level:data.level,selected:host.selected};}
 else if(data.op==='pilot'){if(host.speed!==0)throw Error('Pilot while paused');${research?'__r.record=!!data.capture;__r.active=true;':''}for(let i=0;i<120;i++)host.tick();${research?'__r.record=false;__r.active=false;':''}value={snapshot:host.snapshot(),diagnostic:${research?'__r.dump()':'null'},sequences:${research?'__r.sequences':'null'}};}
 else if(data.op==='arm'){if(host.speed!==0)throw Error('Arm while paused');__armed=true;value={steps:host.frame().steps};}
 else if(data.op==='end'){const end=performance.now();host.speed=0;${research?'__r.active=false;':''}value={begin:__begin,end,origin:performance.timeOrigin,steps:host.frame().steps-__steps,diagnostic:${research?'__r.dump()':'null'}};}
 else if(data.op==='snapshot')value=host.snapshot();else if(data.op==='mark'){performance.mark(data.label);value={label:data.label};}else throw Error('Unknown research op');
 self.postMessage({type:'s37-result',id:data.id,value});}catch(e){self.postMessage({type:'s37-result',id:data.id,value:{researchError:String(e)}});}});`);
 c=once(c,'      host.selected = data.selected; return;',`      host.selected=data.selected;if(__armed&&data.speed!==0){__armed=false;__begin=performance.now();__steps=host.frame().steps;${research?'__r.reset();__r.ordinal=0;__r.active=true;':''}}return;`);
 }
 return c===code?null:{code:c,map:null};
 }};}
export async function prepare(research,port){const outDir=research?'s37-research-dist':'s37-lean-dist';await build({logLevel:'warn',plugins:[plugin(research)],worker:{plugins:()=>[plugin(research)]},build:{outDir,emptyOutDir:true,sourcemap:true}});return preview({logLevel:'warn',build:{outDir},preview:{host:'127.0.0.1',port,strictPort:true}});}
