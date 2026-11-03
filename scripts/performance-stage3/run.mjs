import {spawnSync} from 'node:child_process';
import {writeFileSync, appendFileSync, readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
const output='docs/experiments/performance-stage-3-v1';
const log=`${output}/executions.jsonl`;
writeFileSync(log,'',{flag:'wx'});
let spent=0;
const previous=new Map();
for(let rep=1;rep<=3;rep++) {
  const configurations=[['activity15','baseline'],['activity15','diagnostic'],['activity15','no-observer'],
    ['founders5','baseline'],['founders5','diagnostic'],['founders15','baseline'],['founders15','diagnostic'],
    ['founders30','baseline'],['founders30','diagnostic'],['tube15','diagnostic']];
  if(rep===2) configurations.reverse();
  for(const [scenario,mode] of configurations) {
    if(spent>=1500000) throw new Error('Campaign budget stop; reserve 5 minutes for browser');
    const start=performance.now();
    const child=spawnSync(process.execPath,['--import','tsx','scripts/performance-stage3/run-one.mjs',scenario,mode,String(rep),output],{encoding:'utf8',timeout:45000,maxBuffer:1e7});
    const elapsedMs=performance.now()-start;spent+=elapsedMs;
    appendFileSync(log,JSON.stringify({scenario,mode,rep,elapsedMs,status:child.status,signal:child.signal,stdout:child.stdout,stderr:child.stderr})+'\n');
    console.log(child.stdout.trim()||child.stderr);
    assert.equal(child.status,0,'Stop on failed configuration; do not replace trial');
    const result=JSON.parse(gunzipSync(readFileSync(`${output}/${scenario}-${mode}-${rep}.json.gz`)));
    const key=scenario;
    if(previous.has(key)) {
      const control=previous.get(key);
      assert.deepEqual(result.periodicHashes,control.periodicHashes,'Every measured second: complete state including optics, learning, ledger and PRNG');
      assert.equal(result.warmHash,control.warmHash);assert.equal(result.finalHash,control.finalHash);
    } else previous.set(key,result);
  }
}
console.log(JSON.stringify({totalProcessMs:spent,completeStateEquality:true}));
