// Persist all original root receipts and content-addressed dictionaries, never main/testing.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const repo='hernansgarro/vidAI',branch='audit/performance-stage-3-9',dir='docs/experiments/performance-stage-3-v11';
const token=process.env.GH_TOKEN;if(!token)throw Error('Missing scoped Actions token');
const api=async(p,method='GET',body)=>{const response=await fetch('https://api.github.com/repos/'+repo+p,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Evidence API '+method+' '+p+' status '+response.status);return await response.json();};
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(p,x.name)):[path.join(p,x.name)]);
const names=walk(dir).filter(x=>x.endsWith('.json')||x.endsWith('.gz')).sort();if(!names.length){console.log('No scientific evidence created');process.exit(0);}
const ref=await api('/git/ref/heads/'+branch);if(ref.object.sha!==process.env.GITHUB_SHA)throw Error('Concurrent advance: preservation refuses overwrite');const commit=await api('/git/commits/'+ref.object.sha),entries=[];
for(const name of names){const bytes=fs.readFileSync(name),blob=await api('/git/blobs','POST',{content:bytes.toString('base64'),encoding:'base64'});entries.push({path:name,mode:'100644',type:'blob',sha:blob.sha});console.log('S39_DURABLE_BLOB='+JSON.stringify({name,gitBlob:blob.sha,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}));}
const tree=await api('/git/trees','POST',{base_tree:commit.tree.sha,tree:entries}),next=await api('/git/commits','POST',{message:'research: preserve Stage 3.9 original evidence and genome dictionaries',tree:tree.sha,parents:[ref.object.sha]});await api('/git/refs/heads/'+branch,'PATCH',{sha:next.sha,force:false});console.log('S39_DURABLE_COMMIT='+next.sha);
