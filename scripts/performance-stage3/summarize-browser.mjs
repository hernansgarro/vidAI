import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const root='docs/experiments/performance-stage-3-v1';
const raw=JSON.parse(gunzipSync(readFileSync(`${root}/browser-original.json.gz`)));
const stats=a=>{a=[...a].sort((a,b)=>a-b);const q=p=>a[Math.floor((a.length-1)*p)];return {n:a.length,median:q(.5),p95:a.length>=100?q(.95):null,p99:a.length>=100?q(.99):null,min:a[0],max:a.at(-1)};};
const runs=raw.runs.map(r=>{
 const rows=r.capture.rows,seconds=(rows.at(-1)[0]-rows[0][0])/1000;
 const elapsed=r.after.Timestamp-r.before.Timestamp;
 const profile=r.profile, nodes=new Map(profile.nodes.map(n=>[n.id,n])), counts={};
 for(let i=0;i<(profile.samples??[]).length;i++){const f=nodes.get(profile.samples[i]).callFrame;const k=`${f.functionName||'(anonymous)'} @ ${f.url.split('/').at(-1)}:${f.lineNumber+1}`;counts[k]=(counts[k]??0)+(profile.timeDeltas?.[i]??4000);}
 const profileTotal=Object.values(counts).reduce((a,b)=>a+b,0);
 const drawImageUs=Object.entries(counts).filter(([k])=>k.startsWith('drawImage @')).reduce((a,[k,v])=>a+v,0);
 return {drawImageSelfSamplePercent:100*drawImageUs/profileTotal,rep:r.rep,omit:r.omit,frames:rows.length,fps:(rows.length-1)/seconds,seconds,
  frameCallbackMs:stats(rows.map(r=>r[1])),frameIntervalMs:stats(rows.map(r=>r[2]).filter(v=>v!==null)),
  mainThreadTaskMs:(r.after.TaskDuration-r.before.TaskDuration)*1000,mainThreadScriptMs:(r.after.ScriptDuration-r.before.ScriptDuration)*1000,
  taskDurationFraction:(r.after.TaskDuration-r.before.TaskDuration)/elapsed,
  native:r.capture.native,attemptedEnergyStrokes:r.capture.strokes,energyStrokesPerFrame:r.capture.strokes/rows.length,
  heapBefore:r.before.JSHeapUsedSize,heapAfter:r.after.JSHeapUsedSize,topProfileSelfUs:Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,12),
  metadata:Object.fromEntries(Object.entries(r.capture).filter(([k])=>!['rows','native'].includes(k)))};
});
const groups={};for(const omit of[false,true]){const rows=runs.filter(r=>r.omit===omit);groups[omit?'omit':'draw']={fps:stats(rows.map(r=>r.fps)),
 frameCallbackMs:stats(raw.runs.filter(r=>r.omit===omit).flatMap(r=>r.capture.rows.map(r=>r[1]))),
 frameIntervalMs:stats(raw.runs.filter(r=>r.omit===omit).flatMap(r=>r.capture.rows.map(r=>r[2]).filter(v=>v!==null))),
 mainThreadTaskMs:stats(rows.map(r=>r.mainThreadTaskMs)),mainThreadScriptMs:stats(rows.map(r=>r.mainThreadScriptMs))};}
const out={browserVersion:raw.browserVersion,runs,groups,sourceStateEqualAcrossAllWindows:true,sourceCounts:{organisms:raw.source.state.organisms.length,food:raw.source.state.nutrients.length},heldCounts:{organisms:raw.held.state.organisms.length,parts:raw.held.state.organisms.reduce((n,o)=>n+o.segments.length,0),food:raw.held.state.nutrients.length,caustics:raw.held.state.caustics.length,simTime:raw.held.state.simTime}};
writeFileSync(`${root}/browser-summary.json`,JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
