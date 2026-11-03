/** Registered isolated arithmetic/lookup and metadata lifetime study. No live cache. */
import {readFileSync} from 'node:fs';
import {brotliDecompressSync,gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const result={started:new Date().toISOString(),failures:[],timings:[],cold:[],memory:[]};
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
try {
 await import('data:text/javascript;base64,'+Buffer.from(process.env.VIDA_STAGE33_LOADER).toString('base64'));
 const sim=await import(pathToFileURL(process.cwd()+'/simulation.ts'));
 const {restoreSnapshot,createSnapshot}=await import(pathToFileURL(process.cwd()+'/persistence.ts'));
 const snapshots=[15,30].map(n=>JSON.parse(brotliDecompressSync(readFileSync('docs/experiments/performance-stage-3-v1/founders'+n+'-checkpoint.json.br'))));
 const defs=snapshots.flatMap(s=>s.state.organisms.flatMap(o=>o.genome.parts));
 const joints=snapshots.flatMap(s=>s.state.organisms.flatMap(o=>o.genome.parts.slice(1).map(def=>({def,parent:o.genome.parts[def.parentIndex]}))));
 const density=sim.BASE_PART_DENSITY;
 const families={
  substep:{items:defs,width:4,derive:(d,out,rho=density)=>{
   const mass=Math.max(.35,d.dimN*d.dimM*rho),inertia=(1/12)*mass*(d.width*d.width+d.height*d.height);
   out[0]=mass;out[1]=1/mass;out[2]=inertia;out[3]=1/inertia;
  }},
  contact:{items:defs,width:2,derive:(d,out,rho=density)=>{
   const mass=Math.max(.35,d.dimN*d.dimM*rho);out[0]=1/mass;out[1]=12/(mass*(d.width**2+d.height**2));
  }},
  projection:{items:joints,width:8,derive:({def,parent:pd},out,rho=density)=>{
   const am=Math.max(.35,pd.dimN*pd.dimM*rho),bm=Math.max(.35,def.dimN*def.dimM*rho);
   out[0]=1/am;out[1]=1/bm;out[2]=12/(am*(pd.width**2+pd.height**2));out[3]=12/(bm*(def.width**2+def.height**2));
   const pa=sim.getCardinalAnchor(def.attachmentPoint,pd.width,pd.height),pb=sim.getChildAnchorForParentDir(def.attachmentPoint,def.width,def.height);
   out[4]=pa.x;out[5]=pa.y;out[6]=pb.x;out[7]=pb.y;
  }}
 };
 const startAll=performance.now();
 for(const [family,f]of Object.entries(families)) {
  const start=performance.now(),precomputed=f.items.map(d=>{const a=new Float64Array(f.width);f.derive(d,a);return a;});
  const directMs=performance.now()-start,w=new WeakMap(),before=performance.now();
  f.items.forEach((d,i)=>w.set(d,precomputed[i]));result.cold.push({family,entries:f.items.length,directPrecomputeMs:directMs,weakMapInsertMs:performance.now()-before,numericPayloadBytes:f.items.length*f.width*8});
  const scratch=new Float64Array(f.width);
  const visit=(mode,n)=>{
   let checksum=0;
   for(let i=0;i<n;i++){
    const index=i%f.items.length,d=f.items[index];
    if(mode==='recompute')f.derive(d,scratch);
    else {const stored=mode==='direct'?precomputed[index]:w.get(d);for(let k=0;k<f.width;k++)scratch[k]=stored[k];}
    for(let k=0;k<f.width;k++)checksum+=scratch[k];
   }return checksum;
  };
  let expected;
  for(let rep=1;rep<=3;rep++)for(const mode of rep===2?['weak','direct','recompute']:['recompute','direct','weak']) {
   visit(mode,10000);const cpu=process.cpuUsage(),before=performance.now();const checksum=visit(mode,2000000);
   const row={family,mode,rep,visits:2000000,ms:performance.now()-before,cpu:process.cpuUsage(cpu),checksum};
   result.timings.push(row);if(expected===undefined)expected=checksum;else if(!Object.is(checksum,expected))throw new Error('Component output/checksum mismatch');
   if(performance.now()-startAll>60000||process.memoryUsage().rss>512*1024*1024)throw new Error('Component resource ceiling');
  }
 }
 let timerSum=0;for(let i=0;i<10000;i++){const t=performance.now();timerSum+=performance.now()-t;}
 result.timerPairCalibration={pairs:10000,totalMs:timerSum,meanNs:timerSum*1e6/10000};
 // Metadata-only key population: no giant brain/genome clones or living evolution.
 const gc=()=>{if(global.gc){global.gc();global.gc();}};
 gc();const initial=process.memoryUsage().heapUsed;
 let keys=Array.from({length:10000},(_,i)=>({...defs[i%defs.length]}));gc();const keyOnly=process.memoryUsage().heapUsed;
 const metadata=new WeakMap();
 for(const d of keys){const m=Math.max(.35,d.dimN*d.dimM*density),inertia=(1/12)*m*(d.width*d.width+d.height*d.height);metadata.set(d,new Float64Array([m,1/m,inertia,1/inertia,1/m,12/(m*(d.width**2+d.height**2))]));}
 gc();const populated=process.memoryUsage().heapUsed;
 // Keep the weak container alive through the post-key-drop reading.
 keys=null;gc();const afterDrop=process.memoryUsage().heapUsed;
 result.memory={keys:10000,numericBytesPerEntry:48,gcAvailable:!!global.gc,initial,keyOnly,populated,afterDrop,incrementalCacheHeapBytes:populated-keyOnly,weakContainerStillReferenced:metadata instanceof WeakMap};
 const restored=restoreSnapshot(snapshots[0]),exported=createSnapshot(restored.state,restored.settings),again=restoreSnapshot(exported);
 const parent=restored.state.organisms[0].genome.parts[0],loaded=again.state.organisms[0].genome.parts[0],child={...parent};
 const out=new Float64Array(4);families.substep.derive(parent,out);const stored=Array.from(out);
 const candidate=new WeakMap([[parent,stored]]);
 const oldDim=parent.dimN;parent.dimN=oldDim+1;parent.width=parent.dimN*7;families.substep.derive(parent,out);
 const editInvalidates=JSON.stringify(Array.from(out))!==JSON.stringify(stored);
 parent.dimN=oldDim;parent.width=oldDim*7;families.substep.derive(parent,out,density*2);
 const densityInvalidates=JSON.stringify(Array.from(out))!==JSON.stringify(stored);
 result.lifecycle={restoredIdentityChanges:parent!==loaded,restoreMiss:!candidate.has(loaded),childCloneMiss:!candidate.has(child),sameObjectDimensionEditNeedsInvalidation:editInvalidates,densityContextNeedsInvalidation:densityInvalidates,fullSnapshotRoundTripEqual:hash(exported)===hash(createSnapshot(again.state,again.settings)),note:'Synthetic metadata edits only; no organism was stepped or evolved; real death/retained lineage/Bank/egg and all historical regimes remain untested'};
 if(!Object.values(result.lifecycle).slice(0,6).every(Boolean))throw new Error('Ownership/invalidation check failed');
 result.sources=globalThis.__stage33Sources;result.elapsedMs=performance.now()-startAll;result.heapEnd=process.memoryUsage();
} catch(e){result.failures.push(String(e.stack??e));}
result.finished=new Date().toISOString();
const archive=gzipSync(JSON.stringify(result)),receipt={failures:result.failures,timings:result.timings,cold:result.cold,memory:result.memory,lifecycle:result.lifecycle,timerPairCalibration:result.timerPairCalibration,elapsedMs:result.elapsedMs,archiveSHA256:createHash('sha256').update(archive).digest('hex'),gitBlobSHA:createHash('sha1').update('blob '+archive.length+'\0').update(archive).digest('hex'),archiveBytes:archive.length};
console.log('STAGE33_RESULT='+JSON.stringify({receipt,archive:archive.toString('base64')}));
if(result.failures.length)process.exitCode=1;
