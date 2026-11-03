/** Analysis only: consumes originals, never launches browser/simulation trials. */
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const root='docs/experiments/performance-stage-3-v2';
const raw=JSON.parse(gunzipSync(readFileSync(`${root}/browser-original.json.gz`)));
const stat=values=>{
  const a=values.filter(Number.isFinite).sort((a,b)=>a-b);
  const q=p=>{if(!a.length)return null;const x=(a.length-1)*p,i=Math.floor(x);return a[i]+(a[Math.ceil(x)]-a[i])*(x-i);};
  return {n:a.length,median:q(.5),p95:a.length>=100?q(.95):null,p99:a.length>=100?q(.99):null,min:a[0]??null,max:a.at(-1)??null};
};
const runs=raw.runs.map(r=>{
  const a=r.capture.rows, elapsed=(a.at(-1).timestamp-a[0].timestamp)/1000;
  const keys=['callbackMs','intervalMs','compositeMs','flushMs','causticMs','causticCalls'];
  return {rep:r.rep,mode:r.mode,timers:r.timers,frames:a.length,fps:(a.length-1)/elapsed,seconds:elapsed,
    stats:Object.fromEntries(keys.map(k=>[k,stat(a.map(v=>v[k]))])),
    mainTaskMs:(r.after.TaskDuration-r.before.TaskDuration)*1000,
    mainTaskFraction:(r.after.TaskDuration-r.before.TaskDuration)/(r.after.Timestamp-r.before.Timestamp),
    stateHash:r.stateHash,metadata:Object.fromEntries(Object.entries(r.capture).filter(([k])=>k!=='rows'))};
});
const groups={};
for(const row of runs){const key=`${row.mode}/${row.timers?'timers':'no-timers'}`;(groups[key]??=[]).push(row);}
const summaryGroups=Object.fromEntries(Object.entries(groups).map(([key,rs])=>{
  const originals=raw.runs.filter(r=>`${r.mode}/${r.timers?'timers':'no-timers'}`===key);
  return [key,{windows:rs.length,fps:stat(rs.map(r=>r.fps)),perWindowFPS:rs.map(r=>r.fps),
    stats:Object.fromEntries(['callbackMs','intervalMs','compositeMs','flushMs','causticMs','causticCalls'].map(k=>[k,stat(originals.flatMap(r=>r.capture.rows.map(x=>x[k])))]))}];
}));
const diagnostics=raw.diagnostics.map(d=>{
  const p=d.profile,nodes=new Map(p.nodes.map(n=>[n.id,n])),counts={};let us=0;
  for(let i=0;i<(p.samples??[]).length;i++){
    const f=nodes.get(p.samples[i]).callFrame,weight=p.timeDeltas[i];us+=weight;
    const key=`${f.functionName||'(anonymous)'} @ ${f.url.split('/').at(-1)}:${f.lineNumber+1}`;
    counts[key]=(counts[key]??0)+weight;
  }
  const trace={};
  for(const e of d.traceEvents){if(e.ph!=='X'||!Number.isFinite(e.dur))continue;
    const key=`${e.pid}/${e.tid} ${e.name}`;
    const row=trace[key]??={count:0,totalUs:0,maxUs:0};row.count++;row.totalUs+=e.dur;row.maxUs=Math.max(row.maxUs,e.dur);
  }
  return {mode:d.mode,profileSamples:p.samples?.length,topSelfUs:Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,20),
    nativeDrawImageSelfPercent:100*Object.entries(counts).filter(([k])=>k.startsWith('drawImage @')).reduce((n,[k,v])=>n+v,0)/us,
    traceEvents:d.traceEvents.length,traceTopCompleteEvents:Object.entries(trace).sort((a,b)=>b[1].totalUs-a[1].totalUs).slice(0,35),
    threadNames:d.traceEvents.filter(e=>e.ph==='M'&&e.name==='thread_name')};
});
const summary={sourceSHA:raw.sourceSHA,checkpointHash:raw.checkpointHash,browserVersion:raw.browserVersion,
  graphics:raw['SystemInfo.getInfo'],browserFlags:raw['Browser.getBrowserCommandLine'],os:raw.os,cpu:raw.cpu,
  elapsedExperimentalMs:raw.elapsedExperimentalMs,failures:raw.failures,runs,groups:summaryGroups,diagnostics,
  copy:raw.copy.map(r=>({rep:r.rep,sourceFlushMs:r.sourceFlushMs,drawMs:stat(r.rows.map(x=>x.drawMs)),readMs:stat(r.rows.map(x=>x.readMs)),totalMs:stat(r.rows.map(x=>x.drawMs+x.readMs))}))};
writeFileSync(`${root}/summary.json`,JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
