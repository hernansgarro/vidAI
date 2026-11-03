// Analysis only: reads retained archives; never starts a Worker or browser.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const out='docs/experiments/performance-stage-3-v6';
const hash=x=>createHash('sha256').update(x).digest('hex');
const decode=n=>JSON.parse(gunzipSync(fs.readFileSync(out+'/'+n+'.json.gz')));
const manifest=decode('manifest'),verified=[];
const pilot=decode('pilot');
const pilotHash=hash(JSON.stringify(pilot.baseline.snapshot.state));
if(!pilot.rows.every(r=>r.stateSHA256===pilotHash&&r.energy===pilot.baseline.energy))throw Error('Pilot full-state/energy mismatch');
const environment={sourceSHA:manifest.sourceSHA,baseSHA:manifest.baseSHA,sourceDigests:manifest.sourceDigests,finalSourceDigests:manifest.finalSourceDigests,os:manifest.os,cpu:manifest.cpu,cpuCount:manifest.cpuCount,memory:manifest.memory,cgroup:manifest.cgroup,node:manifest.node,browser:manifest.browser,gpu:manifest['SystemInfo.getInfo']?.gpu,readinessSeconds:manifest.readinessSeconds,runnerWallMs:manifest.runnerWallMs,started:manifest.started,finished:manifest.finished,pilot:{stateSHA256:pilotHash,rows:pilot.rows,energy:pilot.baseline.energy,budget:pilot.baseline.budget}};
fs.writeFileSync(out+'/environment.json',JSON.stringify(environment,null,2));
console.log('S35_ENV='+JSON.stringify({...environment,gpu:{devices:environment.gpu?.devices,featureStatus:environment.gpu?.featureStatus}}));
let rawBytes=0;
for(const r of manifest.receipts){
 const file=fs.readFileSync(out+'/'+r.name+'.json.gz'),raw=gunzipSync(file);
 if(hash(file)!==r.sha256||file.length!==r.bytes||raw.length!==r.rawBytes)throw Error('Archive integrity: '+r.name);
 rawBytes+=raw.length;verified.push({...r,verified:true});
}
const rows=manifest.receipts.filter(r=>/^[OP][0-9]+$/.test(r.name)).map(r=>decode(r.name));
for(const r of rows){
 if(Math.abs(r.ticksPerSecond-r.tickDelta/r.wallMs*1000)>1e-9)throw Error('Throughput equation '+r.id);
 if(Math.round((r.boundary.finalSim-r.boundary.initialSim)*60)!==r.tickDelta)throw Error('Authoritative tick delta '+r.id);
 if(r.diag&&r.tickDelta!==r.workerRaw.ticks)throw Error('Diagnostic tick delta '+r.id);
 const cp=decode('checkpoint'+r.n);
 if(r.startSHA256!==cp.stateSHA256)throw Error('Starting equality '+r.id);
}
const median=xs=>{const x=[...xs].sort((a,b)=>a-b);return x.length%2?x[Math.floor(x.length/2)]:(x[x.length/2-1]+x[x.length/2])/2;};
const dist=xs=>({n:xs.length,values:xs,median:median(xs),min:Math.min(...xs),max:Math.max(...xs)});
const byID=Object.fromEntries(rows.map(r=>[r.id,r]));
const population={};
for(const n of [15,30]){
 const a=rows.filter(r=>r.id.startsWith('P')&&r.n===n&&r.cap===30),b=rows.filter(r=>r.id.startsWith('P')&&r.n===n&&r.cap===10);
 if(a.length&&b.length)population[n]={cap30:dist(a.map(r=>r.ticksPerSecond)),cap10:dist(b.map(r=>r.ticksPerSecond)),relativeMedianPercent:(median(b.map(r=>r.ticksPerSecond))/median(a.map(r=>r.ticksPerSecond))-1)*100,
  fps30:dist(a.map(r=>r.fps)),fps10:dist(b.map(r=>r.fps)),reports30:dist(a.map(r=>r.reportRate)),reports10:dist(b.map(r=>r.reportRate))};
}
const pairs=[['P01','P02'],['P08','P07'],['P03','P04'],['P06','P05']].filter(([a,b])=>byID[a]&&byID[b]).map(([a,b])=>({n:byID[a].n,cap30:a,cap10:b,relativePercent:(byID[b].ticksPerSecond/byID[a].ticksPerSecond-1)*100}));
const lean=rows.filter(r=>r.id.startsWith('O')&&!r.diag).map(r=>r.ticksPerSecond),full=rows.filter(r=>r.id.startsWith('O')&&r.diag).map(r=>r.ticksPerSecond);
const overhead=lean.length&&full.length?{lean:dist(lean),full:dist(full),fullVsLeanPercent:(median(full)/median(lean)-1)*100}:null;
const result={stage:'3.5',sourceSHA:manifest.sourceSHA,population,pairs,overhead,windowCount:rows.length,rawBytesIncludingManifest:rawBytes+gunzipSync(fs.readFileSync(out+'/manifest.json.gz')).length,activeMs:manifest.activeMs,failure:manifest.failure};
const verification={verified,manifestSHA256:hash(fs.readFileSync(out+'/manifest.json.gz')),allHashesValid:true,tickBoundariesValid:true,startingEqualityValid:true,under48MiB:result.rawBytesIncludingManifest<=48*1024*1024,under360s:manifest.activeMs<=360000,totalWindows:rows.length,ledger:manifest.ledger};
fs.writeFileSync(out+'/quantitative-findings.json',JSON.stringify(result,null,2));
fs.writeFileSync(out+'/verification.json',JSON.stringify(verification,null,2));
console.log('S35_ANALYSIS='+JSON.stringify(result));
console.log('S35_VERIFY='+JSON.stringify({...verification,verified:verified.map(x=>({name:x.name,sha256:x.sha256,verified:x.verified}))}));
