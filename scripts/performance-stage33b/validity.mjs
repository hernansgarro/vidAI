/** One preregistered zero-tick validity control; original readings remain preserved. */
import {readFileSync} from 'node:fs';
import {brotliDecompressSync,gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const result={started:new Date().toISOString(),failures:[],timerPairs:[]},gc=()=>{global.gc?.();global.gc?.();};
try {
 const s=JSON.parse(brotliDecompressSync(readFileSync('docs/experiments/performance-stage-3-v1/founders15-checkpoint.json.br')));
 const defs=s.state.organisms.flatMap(o=>o.genome.parts),density=.4;
 gc();result.initial=process.memoryUsage();
 globalThis.__stage33bKeys=Array.from({length:10000},(_,i)=>({...defs[i%defs.length]}));
 gc();result.keyOnly=process.memoryUsage();
 globalThis.__stage33bCache=new WeakMap();
 for(const d of globalThis.__stage33bKeys){const m=Math.max(.35,d.dimN*d.dimM*density),I=(1/12)*m*(d.width*d.width+d.height*d.height);globalThis.__stage33bCache.set(d,new Float64Array([m,1/m,I,1/I,1/m,12/(m*(d.width**2+d.height**2))]));}
 gc();result.populated=process.memoryUsage();
 let checksum=0,count=0;
 for(const d of globalThis.__stage33bKeys){const v=globalThis.__stage33bCache.get(d);if(!v||v.length!==6)throw Error('Missing live metadata entry');count++;for(const x of v)checksum+=x;}
 result.liveEntriesVerified=count;result.checksum=checksum;
 globalThis.__stage33bKeys=null;gc();await new Promise(r=>setImmediate(r));gc();result.afterKeyDrop=process.memoryUsage();
 result.containerRetained=globalThis.__stage33bCache instanceof WeakMap;
 result.metadataPayloadBytes=10000*6*8;
 result.cacheHeapBytes=result.populated.heapUsed-result.keyOnly.heapUsed;
 for(let rep=1;rep<=3;rep++){const values=[];for(let i=0;i<10000;i++){const t=performance.now();values.push(performance.now()-t);}result.timerPairs.push({rep,values});}
 if(process.memoryUsage().rss>512*1024*1024)throw Error('Resource ceiling');
} catch(e){result.failures.push(String(e.stack??e));}
result.finished=new Date().toISOString();
const archive=gzipSync(JSON.stringify(result)),receipt={failures:result.failures,initial:result.initial,keyOnly:result.keyOnly,populated:result.populated,afterKeyDrop:result.afterKeyDrop,liveEntriesVerified:result.liveEntriesVerified,containerRetained:result.containerRetained,metadataPayloadBytes:result.metadataPayloadBytes,cacheHeapBytes:result.cacheHeapBytes,timerPairCount:result.timerPairs.reduce((n,r)=>n+r.values.length,0),archiveSHA256:createHash('sha256').update(archive).digest('hex'),gitBlobSHA:createHash('sha1').update('blob '+archive.length+'\0').update(archive).digest('hex'),archiveBytes:archive.length};
console.log('STAGE33_RESULT='+JSON.stringify({receipt,archive:archive.toString('base64')}));
if(result.failures.length)process.exitCode=1;
