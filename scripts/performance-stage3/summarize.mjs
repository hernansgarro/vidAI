import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const root='docs/experiments/performance-stage-3-v1';
const quantile=(values,p)=>{const a=[...values].sort((a,b)=>a-b);return a[Math.floor((a.length-1)*p)];};
const stats=a=>({n:a.length,median:quantile(a,.5),p95:quantile(a,.95),p99:quantile(a,.99),min:Math.min(...a),max:Math.max(...a)});
const raw=readdirSync(root).filter(f=>/-(baseline|diagnostic|no-observer)-\d.json.gz$/.test(f)).map(f=>JSON.parse(gunzipSync(readFileSync(`${root}/${f}`))));
const profiles={};
for(const f of readdirSync(root).filter(f=>f.endsWith('.cpuprofile.json.gz'))) {
 const p=JSON.parse(gunzipSync(readFileSync(`${root}/${f}`))),nodes=new Map(p.nodes.map(n=>[n.id,n])),parents=new Map();
 for(const n of p.nodes)for(const child of n.children??[])parents.set(child,n.id);
 const categories={},self={};let totalUs=0;
 for(let i=0;i<(p.samples??[]).length;i++) {
  let current=p.samples[i],category='harness-other',names=[],frames=[];
  const weight=p.timeDeltas?.[i]??500;totalUs+=weight;
  const leaf=nodes.get(current).callFrame;
  const label=`${leaf.functionName||'(anonymous)'} @ ${leaf.url.split('/').at(-1)}:${leaf.lineNumber+1}`;
  self[label]=(self[label]??0)+weight;
  while(current!==undefined){const n=nodes.get(current);names.push(n.callFrame.functionName);frames.push(n.callFrame);current=parents.get(current);}
  if(names.includes('advanceOrganismPhysics'))category='physics-joints-drag';
  else if(names.includes('resolveBodyContacts'))category='contacts';
  else if(names.includes('evaluateOrganismBrain')||names.includes('applyWakingPlasticity')||names.includes('applySensoryAssociations'))category='neural-learning';
  else if(names.includes('hatchPlacement')||names.includes('fundIncubatingEggs'))category='hatching-funding';
  else if(names.includes('advanceNutrientCycle'))category='nutrient-cycle';
  else if(frames.some(f=>f.url.endsWith('/energyActivity.ts')))category='energy-observer';
  else if(names.includes('stepSimulation'))category='other-kernel-vision-feeding-ecology';
  else if(names.includes('(garbage collector)'))category='gc-unattributed';
  categories[category]=(categories[category]??0)+weight;
 }
 const classifiedUs=Object.entries(categories).filter(([k])=>!['harness-other','gc-unattributed'].includes(k)).reduce((n,[k,v])=>n+v,0);
 profiles[f]={classifiedKernelObserverPercent:Object.fromEntries(Object.entries(categories).filter(([k])=>!['harness-other','gc-unattributed'].includes(k)).map(([k,v])=>[k,100*v/classifiedUs])),totalSamples:p.samples?.length,totalUs,categoryPercent:Object.fromEntries(Object.entries(categories).map(([k,v])=>[k,100*v/totalUs])),topSelf:Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,15),rawCategoryUs:categories};
}
const groups={};
for(const r of raw){const k=`${r.scenario}/${r.mode}`; (groups[k]??=[]).push(r);}
const summary={groups:{},profiles};
for(const [k,rows]of Object.entries(groups)) {
 rows.sort((a,b)=>a.repetition-b.repetition);
 const phases=rows[0].probe?Object.fromEntries(Object.keys(rows[0].probe.phases).map(p=>[p,stats(rows.map(r=>100*r.probe.phases[p]/Object.values(r.probe.phases).reduce((a,b)=>a+b,0)))])):null;
 const componentStats=Object.fromEntries(Object.entries(rows[0].components).filter(([k,v])=>Array.isArray(v)).map(([name])=>[name,stats(rows.flatMap(r=>r.components[name]))]));
 summary.groups[k]={kernelMs:stats(rows.map(r=>r.kernelMs)),perRunKernelMs:rows.map(r=>r.kernelMs),tickMs:stats(rows.flatMap(r=>r.tickMs)),
 ticksPerSecond:stats(rows.map(r=>600000/r.kernelMs)),initial:rows[0].initial,final:rows[0].final,receipts:rows[0].receipts,
 phasePercent:phases,counters:rows[0].probe?.counters,componentsMs:componentStats,jsonCharacterProxy:rows[0].components.bytes,
 heapDeltaBytes:rows.map(r=>r.heap.end.heapUsed-r.heap.start.heapUsed),gcMs:rows.map(r=>r.gc.reduce((s,e)=>s+e.ms,0)),
 cpuMicroseconds:rows.map(r=>r.cpuMicroseconds),energyErrorJ:rows.map(r=>r.energyErrorJ),
 hashes:rows.map(r=>({source:r.sourceHash,warm:r.warmHash,final:r.finalHash}))};
}
writeFileSync(`${root}/summary.json`,JSON.stringify(summary,null,2));
for(const [k,v] of Object.entries(summary.groups))console.log(k,JSON.stringify({ms:v.perRunKernelMs,p50:v.tickMs.median,p95:v.tickMs.p95,p99:v.tickMs.p99,initial:v.initial,final:v.final,phases:v.phasePercent&&Object.fromEntries(Object.entries(v.phasePercent).map(([k,v])=>[k,Math.round(v.median*10)/10])),components:Object.fromEntries(Object.entries(v.componentsMs).map(([k,v])=>[k,Math.round(v.median*1000)/1000]))}));
for(const [k,p]of Object.entries(profiles))if(k.endsWith('-1.cpuprofile.json.gz'))console.log(k,p.categoryPercent,p.topSelf.slice(0,6));
