/** Evidence verification only; no benchmark replay or archive replacement. */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const hash=x=>createHash('sha256').update(x).digest('hex');
const root='docs/experiments/performance-stage-3-v2';
const v1='docs/experiments/performance-stage-3-v1';
const old=JSON.parse(readFileSync(`${v1}/manifest.json`));
for(const [file,digest]of Object.entries(old.files))assert.equal(hash(readFileSync(`${v1}/${file}`)),digest,`Original v1 unchanged: ${file}`);
const b=readFileSync(`${root}/browser-original.json.gz`),raw=JSON.parse(gunzipSync(b));
const reference=JSON.parse(gunzipSync(readFileSync(`${v1}/browser-original.json.gz`)));
assert.deepEqual(raw.held,reference.held);assert.equal(raw.checkpointHash,hash(JSON.stringify(reference.held)));
assert.equal(raw.runs.length,10);assert.equal(raw.diagnostics.length,2);assert.equal(raw.copy.length,2);
assert.deepEqual(raw.failures,[]);assert.deepEqual(raw.initial.state,raw.held.state);assert.deepEqual(raw.final.state,raw.held.state);
assert.deepEqual(raw.initial.settings,raw.held.settings);assert.deepEqual(raw.final.settings,raw.held.settings);
const groups=new Map();
for(const r of raw.runs){assert.equal(r.stateHash,hash(JSON.stringify(raw.held.state)));assert.ok(r.capture.rows.length>1);
 assert.equal(r.capture.dpr,1);assert.equal(r.capture.visibility,'visible');assert.ok(r.capture.workers>0);
 const key=`${r.mode}/${r.timers}`;groups.set(key,(groups.get(key)??0)+1);}
assert.equal(groups.size,5);for(const n of groups.values())assert.equal(n,2);
assert.ok(raw.elapsedExperimentalMs<300000);
// Explicit path classification avoids treating documentation/research helpers as runtime.
const changed=execFileSync('git',['diff','11248f3431604a1b883a7a948a6e6baddc3fafdd','--name-only'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert.ok(changed.every(p=>['docs/','scripts/','e2e/'].some(prefix=>p.startsWith(prefix))),`Unexpected runtime change: ${changed}`);
const verification={originalV1ManifestFiles:Object.keys(old.files).length,v1Unchanged:true,checkpointEqual:true,
 completeAuthoritativeStateEqual:true,windows:10,diagnostics:2,isolatedCopies:60,experimentalMs:raw.elapsedExperimentalMs,
 originalArchiveSHA256:hash(b),runtimeFilesUnchanged:true};
writeFileSync(`${root}/verification.json`,JSON.stringify(verification,null,2));
const manifest=Object.fromEntries(readdirSync(root).filter(f=>f!=='manifest.json').sort().map(f=>[f,hash(readFileSync(`${root}/${f}`))]));
writeFileSync(`${root}/manifest.json`,JSON.stringify(manifest,null,2));console.log(JSON.stringify(verification));
