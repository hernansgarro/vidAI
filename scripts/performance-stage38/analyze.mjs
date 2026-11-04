// Analysis only: verify immutable archives without launching simulation or browser.
import fs from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const dir='docs/experiments/performance-stage-3-v10';
const read=n=>JSON.parse(gunzipSync(fs.readFileSync(`${dir}/${n}.json.gz`)));
const hash=b=>createHash('sha256').update(typeof b==='object'&&!Buffer.isBuffer(b)?JSON.stringify(b):b).digest('hex');
const stats=xs=>{xs=xs.filter(Number.isFinite).sort((a,b)=>a-b);if(!xs.length)return null;const mean=xs.reduce((a,b)=>a+b,0)/xs.length;return {n:xs.length,mean,sd:xs.length>1?Math.sqrt(xs.reduce((a,b)=>a+(b-mean)**2,0)/xs.length):null,min:xs[0],median:xs.length%2?xs[(xs.length-1)/2]:(xs[xs.length/2-1]+xs[xs.length/2])/2,p95:xs.length>=20?xs[Math.floor((xs.length-1)*.95)]:null,max:xs.at(-1)};};
const m=read('manifest'),v={archives:[],sourceUnchanged:isDeepStrictEqual(m.sourceDigests,m.finalSourceDigests),rawBytes:0,pilotChecks:[],failures:[]};
for(const r of m.receipts){const b=fs.readFileSync(`${dir}/${r.name}.json.gz`),raw=gunzipSync(b);if(hash(b)!==r.sha256||b.length!==r.bytes||raw.length!==r.rawBytes)throw Error('Archive mismatch '+r.name);v.archives.push(r);v.rawBytes+=raw.length;}
v.rawBytes+=gunzipSync(fs.readFileSync(`${dir}/manifest.json.gz`)).length;
const windows=m.ledger.filter(x=>x.status==='retained').map(x=>({...read(x.id+'-original'),...read(x.id+'-validated')}));
const fixture=w=>read('fixture-'+(w.compact?'compact':w.count)).snapshot;
v.retainedTimedWindows=windows.length;v.failedOrUnknownSlots=m.ledger.filter(x=>x.status==='FAILED_OR_UNKNOWN').length;v.notStartedSlots=m.ledger.filter(x=>x.status==='not-started'||x.status==='warmup').length;v.attemptedTimedWindows=m.ledger.filter(x=>!['not-started','warmup'].includes(x.status)).length;
v.originalBeforeValidated=windows.every(w=>m.receipts.findIndex(x=>x.name===w.id+'-original')<m.receipts.findIndex(x=>x.name===w.id+'-validated'));
v.settingsPreserved=windows.every(w=>isDeepStrictEqual(w.boundary.snapshot.settings,fixture(w).settings));
v.counterEqualsReceipt=windows.every(w=>w.boundary.steps===w.ticks&&w.ticks===m.ticks&&w.ticks===Math.round((w.boundary.snapshot.state.simTime-fixture(w).state.simTime)*60)&&Math.abs((w.boundary.end-w.boundary.begin)-w.wallMs)<1e-8);
v.energyConserved=windows.every(w=>Math.abs(w.validation.energy-w.validation.budget)<1e-5);
v.startHashes=windows.every(w=>hash(fixture(w).state)===w.startSHA256);
v.counterChecks=['lean','research'].flatMap(kind=>fs.existsSync(`${dir}/counter-${kind}.json.gz`)?[{kind,...read('counter-'+kind)}]:[]);
if(v.counterChecks.some(x=>x.completed!==7||x.simTicks!==7||x.firstFrameSteps!==4||x.secondFrameSteps!==3))v.failures.push('Counter regression');
const pilots=m.receipts.filter(x=>x.name.startsWith('pilot-100-')).map(x=>({name:x.name,...read(x.name)}));
v.pilotChecks=pilots.map(x=>({name:x.name,stateSHA256:hash(x.snapshot.state),fullStateEqual:hash(x.snapshot)===hash(pilots[0].snapshot)}));
const groups=new Map();for(const w of windows){const k=w.count+':'+w.compact;const a=groups.get(k)??[];a.push(w);groups.set(k,a);}
v.equalHorizonEndpoints=[...groups].map(([fixture,ws])=>({fixture,windows:ws.map(w=>w.id),n:ws.length,fullSnapshotExact:ws.every(w=>hash(w.boundary.snapshot)===hash(ws[0].boundary.snapshot))}));
const tasks=s=>s.processes.flatMap(p=>p.tasks),key=t=>`${t.pid}:${t.tid}:${t.starttime}`;
const rows=windows.map(w=>{const before=new Map(w.cpuBefore.processes.map(p=>[p.pid,p])),outerMs=(w.cpuAfter.started+w.cpuAfter.ended-w.cpuBefore.started-w.cpuBefore.ended)/2;let cpuSeconds=0;const starts=[],exits=[];for(const p of w.cpuAfter.processes){const b=before.get(p.pid);if(b&&b.starttime===p.starttime)cpuSeconds+=(p.utime+p.stime-b.utime-b.stime)/m.clockTicks;else starts.push(p.pid);}for(const p of w.cpuBefore.processes)if(!w.cpuAfter.processes.some(a=>a.pid===p.pid&&a.starttime===p.starttime))exits.push(p.pid);
 return {id:w.id,count:w.count,compact:w.compact,research:w.research,level:w.level,traced:w.traced,ticks:w.ticks,msPerTick:w.msPerTick,tps:w.ticksPerSecond,multiplier:w.multiplier,wallMs:w.wallMs,browserCPUmsPerTick:cpuSeconds*1000/w.ticks,browserCPUOneCorePercent:cpuSeconds*100000/outerMs,cpuBoundarySkewMs:outerMs-w.wallMs,processStarts:starts,processExits:exits,initialOrganisms:fixture(w).state.organisms.length,inventory:w.inventory,energyErrorJ:w.validation.energy-w.validation.budget,fps:w.fps,reportsPerSecond:w.reportsPerSecond,mainHeap:w.main.heap,endSHA256:w.endSHA256};});
const primary=rows.filter(x=>x.id.startsWith('P'));
const scalability=[...new Set(primary.map(x=>x.count+':'+x.compact))].map(k=>{const rs=primary.filter(x=>x.count+':'+x.compact===k);return {count:rs[0].count,compact:rs[0].compact,windows:rs.map(x=>x.id),msPerTick:stats(rs.map(x=>x.msPerTick)),tps:stats(rs.map(x=>x.tps)),multiplier:stats(rs.map(x=>x.multiplier)),inventory:rs[0].inventory,repeatSpanPercent:rs.length>1?(Math.max(...rs.map(x=>x.msPerTick))/Math.min(...rs.map(x=>x.msPerTick))-1)*100:null};}).sort((a,b)=>Number(a.compact)-Number(b.compact)||a.count-b.count);
const base=scalability.find(x=>x.count===25&&!x.compact);for(const s of scalability)if(base){s.costRatioTo25=s.msPerTick.median/base.msPerTick.median;s.perOrganismMs=s.msPerTick.median/s.count;}
const phaseSources=[...windows.filter(w=>w.diagnostic?.ticks?.length),...pilots.filter(p=>p.name==='pilot-100-phase').map(p=>({id:p.name,count:100,compact:false,pilot:true,diagnostic:p.diagnostic}))];
const phases=phaseSources.map(w=>{const d=w.diagnostic,keys=[...new Set(d.ticks.flatMap(x=>Object.keys(x)))].filter(k=>!['tick','total'].includes(k)),sumTotal=d.ticks.reduce((a,x)=>a+x.total,0);return {id:w.id,count:w.count,compact:w.compact,pilot:!!w.pilot,tickElapsed:stats(d.ticks.map(x=>x.total)),sampledTicks:d.sampled,closureMaxAbsMs:Math.max(...d.ticks.map(x=>Math.abs(keys.reduce((a,k)=>a+(x[k]??0),0)-x.total))),phaseRows:keys.map(k=>{const xs=d.ticks.map(x=>x[k]??0),sum=xs.reduce((a,b)=>a+b,0);return {phase:k,msPerTick:sum/d.ticks.length,sharePercent:sum/sumTotal*100,distribution:stats(xs)};}).sort((a,b)=>b.msPerTick-a.msPerTick),callsPerSampledTick:Object.fromEntries(Object.entries(d.counts).map(([k,n])=>[k,n/d.sampled])),note:'Exclusive elapsed phases, not thread CPU. Sampled contact counts include repeated solver passes, not unique pairs.'};});
const diagnostics=[];
for(const w of windows.filter(x=>x.traced)){
 const t=read(w.id+'-trace'),es=t.trace.traceEvents,wm=es.find(e=>e.name===`S38_WORKER_${w.id}`),mm=es.find(e=>e.name===`S38_MAIN_${w.id}`);
 if(!wm||!mm||!Number.isFinite(wm.args?.data?.startTime))throw Error('Missing trace identity mark');
 const bounds=[wm.ts+(w.boundary.begin-wm.args.data.startTime)*1000,wm.ts+(w.boundary.end-wm.args.data.startTime)*1000];
 const union=xs=>{xs.sort((a,b)=>a[0]-b[0]);let end=-Infinity,total=0;for(const[a,b]of xs)if(b>end){total+=b-Math.max(a,end);end=b;}return total;};
 const paired=[],stack=new Map();for(const e of es){const k=e.pid+':'+e.tid,s=stack.get(k)??[];stack.set(k,s);if(e.ph==='B')s.push(e);if(e.ph==='E'&&s.length){const b=s.pop();if(/GC|Scavenge/i.test(b.name))paired.push({...b,dur:e.ts-b.ts,...(Number.isFinite(e.tts)&&Number.isFinite(b.tts)?{tdur:e.tts-b.tts}:{})});}}
 const complete=[...es.filter(e=>e.ph==='X'&&/GC|Scavenge/i.test(e.name)&&Number.isFinite(e.dur)),...paired],roles=[];
 for(const[role,mark]of [['worker',wm],['main',mm]]){
 const {pid,tid}=mark,events=complete.filter(e=>e.pid===pid&&e.tid===tid),clip=events.map(e=>[Math.max(e.ts,bounds[0]),Math.min(e.ts+e.dur,bounds[1])]).filter(([a,b])=>b>a),inside=events.filter(e=>e.ts>=bounds[0]&&e.ts+e.dur<=bounds[1]),pauses=inside.filter(e=>['MinorGC','MajorGC'].includes(e.name));
 const logs=es.filter(e=>e.pid===pid&&e.tid===tid&&e.name==='V8.GCTraceGCNVP'&&e.ts>=bounds[0]&&e.ts<=bounds[1]).map(e=>{try{return {ts:e.ts,...JSON.parse(e.args.value)};}catch{return null;}}).filter(Boolean),span=logs.length>1?(logs.at(-1).ts-logs[0].ts)/1e6:null,allocated=logs.slice(1).reduce((a,l)=>a+(l.allocated??0),0);
 const before=tasks(w.cpuBefore).find(x=>x.pid===pid&&x.tid===tid),after=tasks(w.cpuAfter).find(x=>x.pid===pid&&x.tid===tid),cpu=before&&after&&key(before)===key(after)?(after.utime+after.stime-before.utime-before.stime)/m.clockTicks:null;
 roles.push({role,pid,tid,identityVerified:cpu!==null,cpuSeconds:cpu,cpuMsPerTick:cpu===null?null:cpu*1000/w.ticks,gcUnionWallMs:union(clip)/1000,gcWallPercent:union(clip)/(w.wallMs*10),gcUnionThreadMs:union(inside.filter(e=>Number.isFinite(e.tts)&&Number.isFinite(e.tdur)).map(e=>[e.tts,e.tts+e.tdur]))/1000,minorPauses:pauses.filter(e=>e.name==='MinorGC').length,majorPauses:pauses.filter(e=>e.name==='MajorGC').length,allocationSamples:logs.length,allocationSpanSeconds:span,reportedAllocatedBytes:allocated,allocationBytesPerSecond:span?allocated/span:null,allocationBytesPerTick:span?allocated/span/w.ticksPerSecond:null});
 }
 diagnostics.push({id:w.id,metadata:t.metadata,events:es.length,bounds,marks:{worker:wm,main:mm},roles,note:'Independent traced diagnostic, excluded from primaries. Per-lifetime mark identity; GC intervals unioned. Allocation is an inter-GC proxy, not retained heap or leak evidence.'});
}
const spread=scalability.find(x=>x.count===100&&!x.compact),compact=scalability.find(x=>x.compact);
const concentration=spread&&compact?{spreadMs:spread.msPerTick.median,compactMs:compact.msPerTick.median,costRatio:compact.msPerTick.median/spread.msPerTick.median,tpsPercent:(compact.tps.median/spread.tps.median-1)*100}:null;
v.completeCampaign=m.failure===null&&windows.length===18;v.budgetsOK=m.activeMs<=360000&&m.runnerWallMs<=720000&&v.rawBytes<=192*1024*1024&&v.attemptedTimedWindows<=18;
const output={status:v.completeCampaign?'COMPLETE':'PARTIAL',sourceSHA:m.sourceSHA,environment:m,rows,scalability,concentration,phases,diagnostics,limitations:['Only150spread has two retained repetitions. Other cells have one. P07 raw preservation failed at the archive budget;11 slots were not started. Only the100spread24tick phase pilot exists; no timed phase/overhead/trace diagnostics.','Population, food count and habitat co-scale at expected constant density. This does not isolate organism count from all other work.','Concentration changes initial body positions only, not food or walls; trajectories and contacts differ. No natural/evolved-population contrast.','GC traces identify transient allocation, not retained-heap scaling/leaks or per-allocation-stack ownership. Main performance.memory is not Worker heap.','No browser desktop equivalence, watts, thermal measurement, changed report cadence or sustained paced-speed sweep. No asymptotic complexity or production-safe speedup claim.']};
for(const k of ['sourceUnchanged','originalBeforeValidated','settingsPreserved','counterEqualsReceipt','energyConserved','startHashes','budgetsOK'])if(!v[k])v.failures.push(k);
if(v.pilotChecks.some(x=>!x.fullStateEqual)||v.equalHorizonEndpoints.some(x=>!x.fullSnapshotExact))v.failures.push('Complete state/PRNG equality');
fs.writeFileSync(dir+'/findings.json',JSON.stringify(output,null,2));fs.writeFileSync(dir+'/verification.json',JSON.stringify(v,null,2));console.log(JSON.stringify({status:output.status,verification:{...v,archives:v.archives.length},scalability,concentration,phases,diagnostics},null,2));
if(v.failures.length)throw Error('Scientific integrity verification failed: '+v.failures.join(', '));
