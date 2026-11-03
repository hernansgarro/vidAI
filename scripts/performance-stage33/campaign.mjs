/** Interactive bounded controller: NEXT runs one slot; READ retrieves archive chunks. */
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {performance} from 'node:perf_hooks';
const code=process.env.VIDA_STAGE33_CODE??readFileSync(new URL('./run-one.mjs',import.meta.url),'utf8');
const loader=process.env.VIDA_STAGE33_LOADER??readFileSync(new URL('./loader.mjs',import.meta.url),'utf8');
const slots=[];for(let rep=1;rep<=3;rep++){const a=[['founders15','baseline'],['founders15','diagnostic'],['founders30','baseline'],['founders30','diagnostic']];if(rep===2)a.reverse();for(const [scenario,mode]of a)slots.push({scenario,mode,rep});}
if(process.stdin.isTTY)process.stdin.setRawMode(true);
const rl=createInterface({input:process.stdin,terminal:false}),input=rl[Symbol.asyncIterator](),prior=new Map();let elapsed=0;
console.log('STAGE33_READY');
for(let index=0;index<slots.length;index++) {
 const line=await input.next();if(line.value!=='NEXT')throw new Error('Expected NEXT');
 const cfg=slots[index],start=performance.now(),r=spawnSync(process.execPath,['--expose-gc','--input-type=module','-e',code],{env:{...process.env,NODE_DISABLE_COMPILE_CACHE:'1',VIDA_STAGE33_SLOT:JSON.stringify(cfg),VIDA_STAGE33_LOADER:loader},encoding:'utf8',timeout:20000,maxBuffer:5000000});
 elapsed+=performance.now()-start;
 const match=r.stdout.match(/STAGE33_RESULT=(.+)/);
 if(!match){console.log('STAGE33_FATAL='+JSON.stringify({cfg,status:r.status,signal:r.signal,stdout:r.stdout,stderr:r.stderr}));break;}
 const parsed=JSON.parse(match[1]),receipt=parsed.receipt;
 console.log('STAGE33_RECEIPT='+JSON.stringify({index,...receipt,processMs:performance.now()-start,status:r.status,stderr:r.stderr}));
 let offset=0;while(offset<parsed.archive.length){const next=await input.next();if(next.value!=='READ')throw new Error('Expected READ');const chunk=parsed.archive.slice(offset,offset+12000);console.log('STAGE33_CHUNK='+JSON.stringify({index,part:offset/12000,data:chunk,last:offset+12000>=parsed.archive.length}));offset+=12000;}
 const old=prior.get(cfg.scenario),fields=['sourceHash','warmHash','periodicHashes','finalHash'];
 if(r.status!==0||receipt.failures.length||elapsed>600000||(old&&fields.some(k=>JSON.stringify(old[k])!==JSON.stringify(receipt[k])))){console.log('STAGE33_STOP='+JSON.stringify({cfg,equality:!old||fields.every(k=>JSON.stringify(old[k])===JSON.stringify(receipt[k])),elapsed}));break;}
 if(!old)prior.set(cfg.scenario,receipt);
 console.log('STAGE33_SLOT_DONE='+index);
}
console.log('STAGE33_CAMPAIGN_DONE='+JSON.stringify({elapsedProcessMs:elapsed,workloads:prior.size}));rl.close();process.exit();
