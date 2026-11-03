// Derived analysis only; all original archives and the first summary remain unchanged.
import{readFileSync,writeFileSync}from'node:fs';
import{execFileSync}from'node:child_process';
const s=JSON.parse(readFileSync('docs/experiments/performance-stage-3-v5/summary.json','utf8'));
if(s.pilot?.meta){delete s.pilot.meta.partialValidity;delete s.pilot.meta.partialBaseline;}
for(const v of Object.values(s.pilot?.inventory??{}))delete v.brainLayouts;
for(const t of s.trials)if(t.inventory)delete t.inventory.brainLayouts;
writeFileSync('docs/experiments/performance-stage-3-v5/summary-compact.json',JSON.stringify(s,null,2)+'\n',{flag:'wx'});
console.log('S34_COMPACT='+JSON.stringify({windows:s.trials.length,comparisons:s.comparisons,manifest:s.manifest??null}));
for(const args of [['config','user.name','github-actions[bot]'],['config','user.email','41898282+github-actions[bot]@users.noreply.github.com'],['add','docs/experiments/performance-stage-3-v5/summary-compact.json'],['commit','-m','research: publish compact derived Stage 3.4 summary without duplicate pilot snapshots'],['push','origin','HEAD:audit/performance-stage-3-4-evidence']])execFileSync('git',['-c','safe.directory='+process.cwd(),...args],{stdio:'inherit'});
