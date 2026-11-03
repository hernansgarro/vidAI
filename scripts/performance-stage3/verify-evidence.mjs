/** Verify saved evidence without re-executing a benchmark. */
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {gunzipSync, brotliDecompressSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const root='docs/experiments/performance-stage-3-v1';
const hash=b=>createHash('sha256').update(b).digest('hex');
const groups=new Map();let trials=0;
for(const name of readdirSync(root).filter(f=>/-(baseline|diagnostic|no-observer)-\d.json.gz$/.test(f))) {
 const r=JSON.parse(gunzipSync(readFileSync(`${root}/${name}`)));
 const source=brotliDecompressSync(readFileSync(`${root}/${r.scenario}-checkpoint.json.br`));
 assert.equal(hash(source),r.sourceHash,'Exact original checkpoint hash');
 assert.equal(r.tickMs.length,600);assert.equal(r.periodicHashes.length,10);
 assert.ok(Math.abs(r.energyErrorJ)<1e-7);
 const old=groups.get(r.scenario);
 if(old){assert.equal(old.warmHash,r.warmHash);assert.equal(old.finalHash,r.finalHash);assert.deepEqual(old.periodicHashes,r.periodicHashes);}
 else groups.set(r.scenario,r);
 trials++;
}
assert.equal(trials,30);
const manifest={trials,scenarios:groups.size,periodicStateHashesEqual:true,checkpointBytesEqual:true,
 files:Object.fromEntries(readdirSync(root).filter(f=>!['manifest.json','verification.json'].includes(f)).sort().map(f=>[f,hash(readFileSync(`${root}/${f}`))]))};
writeFileSync(`${root}/manifest.json`,JSON.stringify(manifest,null,2));
console.log(JSON.stringify({trials,scenarios:groups.size,periodicStateHashesEqual:true,checkpointBytesEqual:true}));
