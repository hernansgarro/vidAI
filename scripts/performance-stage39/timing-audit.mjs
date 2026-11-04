// Read-only timing audit. Does not waive the failed global runner budget.
import fs from 'node:fs';
import {decodeFile} from './archive.mjs';
const dir='docs/experiments/performance-stage-3-v11-execution',m=decodeFile(dir,'manifest');
const rows=m.ledger.filter(x=>x.status==='retained').map(s=>{const r=decodeFile(dir,s.id+'-original'),start=m.preflightReference.carriedRunnerMs+r.boundary.origin+r.boundary.begin-Date.parse(m.started),end=m.preflightReference.carriedRunnerMs+r.boundary.origin+r.boundary.end-Date.parse(m.started);return {id:s.id,chargedBeginMs:start,chargedEndMs:end,measurementEndBefore720s:end<720000,wallMs:r.boundary.end-r.boundary.begin,exportMs:r.exportMs};});
const output={method:'Align browser timeOrigin/performance timestamps with recorded runner-start Date and carried preflight duration. Millisecond wall-origin alignment uncertainty is immaterial to the last4second margin. Full runner budget remains failed.',rows,allUsefulWindowsEndedBefore720s:rows.every(x=>x.measurementEndBefore720s),lastUsefulWindowEndMs:Math.max(...rows.map(x=>x.chargedEndMs)),sumUsefulWindowMs:rows.reduce((a,x)=>a+x.wallMs,0),chargedRunnerMs:m.runnerWallMs,runnerLimitMs:720000,overrunMs:m.runnerWallMs-720000};
fs.writeFileSync(dir+'/runner-timing-audit.json',JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
