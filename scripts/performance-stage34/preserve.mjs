// Preserve retained original archives only; no simulation is imported.
import{readdirSync,readFileSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{gunzipSync}from'node:zlib';
import{execFileSync}from'node:child_process';
const out='docs/experiments/performance-stage-3-v5/measurement';
const records=readdirSync(out).filter(x=>x.endsWith('.json.gz')).map(name=>{const b=readFileSync(out+'/'+name);JSON.parse(gunzipSync(b));return{name,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),gitBlob:createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex'),uncompressedBytes:gunzipSync(b).length};});
writeFileSync(out+'/integrity.json',JSON.stringify({records},null,2)+'\n',{flag:'wx'});
console.log('S34_RETAINED='+JSON.stringify(records));
execFileSync('git',['config','user.name','github-actions[bot]']);
execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
execFileSync('git',['add',out]);execFileSync('git',['commit','-m','research: preserve Stage 3.4 original measured windows and outcomes'],{stdio:'inherit'});
execFileSync('git',['push','origin','HEAD:audit/performance-stage-3-4-evidence'],{stdio:'inherit'});
