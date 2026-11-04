// Static archived-pose geometry only. Does not step or modify a simulation.
import fs from 'node:fs';
import {decodeFile,sha} from './archive.mjs';
globalThis.window={};await import('./fixture.ts');
const dir='docs/experiments/performance-stage-3-v11-execution',m=decodeFile(dir,'manifest'),seen=new Map(),rows=[];
for(const slot of m.ledger.filter(x=>x.status==='retained')){
 const raw=decodeFile(dir,slot.id+'-original'),hash=sha(raw.final.state);
 if(!seen.has(hash)){const geometry=window.__s39Fixture.geometry(raw.final);if(sha(raw.final.state)!==hash)throw Error('Static geometry modified archived state');seen.set(hash,geometry);}
 const {boxes,...geometry}=seen.get(hash);rows.push({id:slot.id,count:slot.count,dense:slot.dense,ticks:slot.ticks,endSHA256:hash,...geometry});
}
fs.writeFileSync(dir+'/static-final-geometry.json',JSON.stringify({method:'Read-only SAT/body-AABB inventory at archived endpoints; not cumulative dynamic contact/impulse counts. Duplicate full states reuse the same static calculation.',rows},null,2));console.log(JSON.stringify({uniqueEndpointStates:seen.size,rows},null,2));
