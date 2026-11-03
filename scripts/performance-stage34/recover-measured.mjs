// Read-only recovery of an already executed log. Never imports simulation or Playwright.
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const repo='hernansgarro/vidAI',job=125923264339,out='docs/experiments/performance-stage-3-v5/measurement';
const hash=x=>createHash('sha256').update(x).digest('hex');
const response=await fetch('https://api.github.com/repos/'+repo+'/actions/jobs/'+job+'/logs',{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+process.env.GH_TOKEN}});
if(!response.ok)throw Error('Log download HTTP '+response.status);
const log=await response.text();mkdirSync(out,{recursive:true});
const receipts=[...log.matchAll(/S34_RECEIPT=([^\n]+)/g)].map(x=>JSON.parse(x[1]));
const records=[];
for(const r of receipts){
 const re=new RegExp('S34_'+r.name+'_PART_(\\d+)=([A-Za-z0-9+/=]+)','g');
 const parts=[...log.matchAll(re)].map(x=>({i:+x[1],b:x[2]})).sort((a,b)=>a.i-b.i);
 if(parts.some((p,i)=>p.i!==i))throw Error('Missing chunk '+r.name);
 const bytes=Buffer.from(parts.map(x=>x.b).join(''),'base64');
 if(bytes.length!==r.bytes||hash(bytes)!==r.sha256)throw Error('Archive integrity '+r.name);
 const data=JSON.parse(gunzipSync(bytes));writeFileSync(out+'/'+r.name+'.json.gz',bytes,{flag:'wx'});
 if(hash(readFileSync(out+'/'+r.name+'.json.gz'))!==r.sha256)throw Error('Readback '+r.name);
 records.push({...r,gitBlob:createHash('sha1').update(Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes])).digest('hex'),uncompressedBytes:gunzipSync(bytes).length});
}
writeFileSync(out+'/integrity.json',JSON.stringify({records:records.map(r=>({...r,name:r.name+'.json.gz'}))},null,2)+'\n',{flag:'wx'});
writeFileSync(out+'/source-ci.log.gz',gzipSync(log),{flag:'wx'});
const manifest=receipts.find(r=>r.name==='manifest')?JSON.parse(gunzipSync(readFileSync(out+'/manifest.json.gz'))):null;
const failures=log.split('\n').filter(x=>/failed|Error:|Expected|Received|at .*performance-stage34|passed|skipped/.test(x)).slice(-80);
const result={job,logBytes:Buffer.byteLength(log),logSha256:hash(log),records,manifest,failures};
writeFileSync(out+'/capture-recovery.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log('S34_RECOVERY='+JSON.stringify({job,logBytes:result.logBytes,archives:records,manifest,failures}));
