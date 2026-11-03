import {gunzipSync} from 'node:zlib';import{readFileSync,writeFileSync}from'node:fs';import{execFileSync}from'node:child_process';import {createHash} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex');
const q=(xs,p)=>{const a=xs.filter(Number.isFinite).sort((a,b)=>a-b);if(!a.length)return null;const v=(a.length-1)*p,i=Math.floor(v);return a[i]+(a[Math.min(i+1,a.length-1)]-a[i])*(v-i);};
const stat=xs=>({n:xs.length,median:q(xs,.5),min:q(xs,0),max:q(xs,1),p95:xs.length>=100?q(xs,.95):null,p99:xs.length>=100?q(xs,.99):null,sum:xs.reduce((a,b)=>a+b,0)});
const receipts=JSON.parse(readFileSync('docs/experiments/performance-stage-3-v5/measurement/integrity.json','utf8')).records.map(r=>({...r,name:r.name.replace('.json.gz',''),base64:readFileSync('docs/experiments/performance-stage-3-v5/measurement/'+r.name).toString('base64')}));
const decoded=receipts.map(r=>{const bytes=Buffer.from(r.base64,'base64');if(hash(bytes)!==r.sha256)throw Error('Hash mismatch '+r.name);return {name:r.name,bytes:bytes.length,sha256:r.sha256,gitBlob:createHash('sha1').update(Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes])).digest('hex'),uncompressedBytes:gunzipSync(bytes).length,data:JSON.parse(gunzipSync(bytes))};});
const trials=decoded.filter(r=>/^(trial|overhead)/.test(r.name)).map(({name,data:r})=>{
 const diag=r.after.diagnostic,ms=diag?diag.end-(diag.controlStart??diag.start):((r.after.t0+r.after.t1-r.before.t0-r.before.t1)/2);
 const clock=(r.beforeClock??[]).concat(r.afterClock??[]).map(x=>({rtt:x.t1-x.t0,offset:x.now-(x.t0+x.t1)/2,lower:x.now-x.t1,upper:x.now-x.t0}));
 const best=clock.sort((a,b)=>a.rtt-b.rtt)[0];
 const latency=best?r.main.transports.filter(x=>x.sent!==null).map(x=>x.main+best.offset-x.sent):[];
 const ts=r.main.rows.map(x=>x.timestamp),fps=ts.length>1?(ts.length-1)*1000/(ts.at(-1)-ts[0]):null;
 return {name,rep:r.rep,n:r.n,on:r.on,speed:r.speed,diagnostic:r.diag,ticks:r.tickDelta,wallMs:ms,ticksPerSecond:r.tickDelta*1000/ms,effectiveSpeed:r.tickDelta*1000/ms/60,fps,render:stat(r.main.rows.map(x=>x.callbackMs)),intervals:stat(r.main.rows.map(x=>x.intervalMs).filter(x=>x!==null)),
 worker:diag?Object.fromEntries(Object.entries(diag.rows).map(([k,v])=>[k,stat(v)])):null,workerCounts:diag?.counts,mainCounts:r.main.main?.counts,mainTimings:r.main.main?Object.fromEntries(Object.entries(r.main.main.rows).map(([k,v])=>[k,stat(v)])):null,
 longTasks:stat(r.main.longTasks.map(x=>x.duration)),framesReceived:r.main.transports.length,transportFrequency:r.main.transports.length*1000/(r.main.end-r.mainStart),clockBest:best??null,calibratedSendToReceive:stat(latency),payload:r.main.payload,inventory:r.finalInventory,heap:r.main.heap,
 stateBeforeHash:hash(JSON.stringify(r.before.initial.state)),stateFinalHash:hash(JSON.stringify(r.after.final.state)),settingsHash:hash(JSON.stringify(r.before.initial.settings)),canvas:r.main.canvas,viewport:r.main.viewport,dpr:r.main.dpr,visible:r.main.visible};
});
const groups={};for(const t of trials.filter(x=>x.name.startsWith('trial'))){const key=t.n+'/'+t.speed+'/'+t.on;(groups[key]??=[]).push(t);}
const comparisons=[];for(const n of [5,15,30])for(const speed of ['max',0,5]){
 const on=groups[n+'/'+speed+'/true'],off=groups[n+'/'+speed+'/false'];if(!on||!off)continue;
 const value=(rows,k)=>stat(rows.map(r=>r[k]));const a=value(on,'ticksPerSecond'),b=value(off,'ticksPerSecond'),f=value(on,'fps'),g=value(off,'fps');
 comparisons.push({n,speed,onTPS:a,offTPS:b,tpsDifference:b.median-a.median,tpsPct:a.median?100*(b.median/a.median-1):null,onFPS:f,offFPS:g,
 pairs:on.filter(x=>off.some(y=>y.rep===x.rep)).map(x=>{const y=off.find(y=>y.rep===x.rep);return {rep:x.rep,onTPS:x.ticksPerSecond,offTPS:y.ticksPerSecond,pct:x.ticksPerSecond?100*(y.ticksPerSecond/x.ticksPerSecond-1):null,onFPS:x.fps,offFPS:y.fps};})});
}
const manifest=decoded.find(r=>r.name==='manifest')?.data,pilot=JSON.parse(gunzipSync(readFileSync('docs/experiments/performance-stage-3-v5/pilot.json.gz'))),component=decoded.find(r=>r.name==='component')?.data;
const summary={archives:decoded.map(({data,...r})=>r),trials,comparisons,manifest,pilot:pilot?{meta:pilot.meta,inventory:pilot.inventory,checkpointHashes:Object.fromEntries(Object.entries(pilot.checkpoints).map(([k,v])=>[k,hash(JSON.stringify(v))])),validityHashes:{baseline:hash(JSON.stringify(pilot.baseline.snapshot.state)),unselected:hash(JSON.stringify(pilot.exact.false.snapshot.state)),selected:hash(JSON.stringify(pilot.exact.true.snapshot.state))},energy:{baseline:pilot.baseline.energy,instrumented:pilot.exact.false.energy,budget:pilot.baseline.budget}}:null,component:component?{samples:component.result.map(r=>({...r,rows:stat(r.rows)}))}:null};
writeFileSync("docs/experiments/performance-stage-3-v5/summary.json",JSON.stringify(summary,null,2)+"\n",{flag:"wx"});
console.log("S34_ANALYSIS="+JSON.stringify({comparisons:summary.comparisons,failed:summary.manifest?.failed,ledger:summary.manifest?.ledger,experimentalMs:summary.manifest?.experimentalMs}));

execFileSync('git',['-c','safe.directory='+process.cwd(),'config','user.name','github-actions[bot]']);
execFileSync('git',['-c','safe.directory='+process.cwd(),'config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
execFileSync('git',['-c','safe.directory='+process.cwd(),'add','docs/experiments/performance-stage-3-v5']);
execFileSync('git',['-c','safe.directory='+process.cwd(),'commit','-m','research: recover and analyze original Stage 3.4 windows without rerunning them'],{stdio:'inherit'});
execFileSync('git',['-c','safe.directory='+process.cwd(),'push','origin','HEAD:audit/performance-stage-3-4-evidence'],{stdio:'inherit'});
