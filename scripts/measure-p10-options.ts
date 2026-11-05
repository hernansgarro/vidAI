import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {p10Cases,p10FoodNames,p10FoodScene} from '../tests/support/p10-scenes';
import {ensureMaintainedGrid,compareWorldGridValues,type MaintainedWorldGrid,type WorldGridValue} from '../maintainedGrid';
import type {GridEntry,GridKind} from '../centralSpatialGrid';
import type {SpatialBounds} from '../spatialIndex';
type GridCandidateFilter=(entry:GridEntry<WorldGridValue>)=>boolean;
// Test-only optional protocol, so this evaluator also compiles after reverting B.
type CaptureGrid=Omit<MaintainedWorldGrid,'queryBounds'> & {queryBounds(q:SpatialBounds,k?:readonly GridKind[],d?:boolean,retain?:GridCandidateFilter):GridEntry<WorldGridValue>[]};
import {stepSimulation} from '../simulation';
import {contactState} from '../tests/support/contact-grid';
import {installP10Cache} from '../tests/support/p10-cache-prototype';

if (!process.argv[2]) throw new Error('Provide an output JSON path');
const batches: {entries: GridEntry<WorldGridValue>[]; retain: GridCandidateFilter}[]=[];
// Capture actual unordered matrix traversal plus unconditional overflow at query time.
for (const f of p10Cases()) {
  const grid=ensureMaintainedGrid(f.state) as CaptureGrid, query=grid.queryBounds.bind(grid);
  const matrixQuery=grid.matrix.queryBounds.bind(grid.matrix);
  let raw: GridEntry<WorldGridValue>[]=[];
  grid.matrix.queryBounds=(q,k)=>{const entries=matrixQuery(q,k);raw=entries.slice();return entries;};
  grid.queryBounds=(q,k,d,retain)=>{
    if (retain) {
      raw=[];const sorted=query(q,k,d);
      grid.inspectOverflow(e=>{if(k!.includes(e.kind))raw.push(e);});
      assert.deepEqual(raw.slice().sort((a,b)=>-compareWorldGridValues(a.value,b.value)),sorted);
      // Freeze source ranks and geometry before later removals/bites change them.
      const entries=raw.map(e=>({value:{...e.value,entity:{...e.value.entity}}} as GridEntry<WorldGridValue>));
      batches.push({entries,retain});
    }
    return query(q,k,d,retain);
  };
  stepSimulation(f.state,f.settings,f.dt);
}
const groups={small:batches.filter(b=>b.entries.length<32),large:batches.filter(b=>b.entries.length>=32)};
const bResults: Record<string,unknown>={};
let sink=0;
for (const [name,items] of Object.entries(groups)) {
  let oldComparisons=0,newComparisons=0;
  const old=()=>{for(const b of items) {const a=b.entries.slice();
    a.sort((a,b)=>{oldComparisons++;return -compareWorldGridValues(a.value,b.value);});
    sink+=a.length;
  }};
  const filtered=()=>{for(const b of items) {const a=b.entries.slice();let n=0;
    for(let i=0;i<a.length;i++)if(b.retain(a[i]))a[n++]=a[i];a.length=n;
    a.sort((a,b)=>{newComparisons++;return -compareWorldGridValues(a.value,b.value);});sink+=a.length;
  }};
  for(let i=0;i<200;i++){old();filtered();}oldComparisons=0;newComparisons=0;
  const rounds=[];
  for(let round=0;round<7;round++) {
    const time=(fn:()=>void)=>{const t=performance.now();for(let i=0;i<1000;i++)fn();return performance.now()-t;};
    let original:number,selected:number;
    if(round%2){selected=time(filtered);original=time(old);}else{original=time(old);selected=time(filtered);}
    rounds.push({original,selected});
  }
  bResults[name]={batches:items.length,candidates:items.reduce((n,b)=>n+b.entries.length,0),
    retained:items.reduce((n,b)=>n+b.entries.filter(b.retain).length,0),oldComparisons,newComparisons,rounds};
}
// C is evaluated independently: erase B's optional filter for BOTH arms.
const cRounds=[];
for(let round=0;round<7;round++) {
  const run=(cached:boolean)=>{
    let elapsed=0;const totals={hits:0,misses:0,invalidations:0,maxEntries:0,maxReferences:0};
    const states=[];
    for(const name of p10FoodNames) {
      const f=p10FoodScene(name),grid=ensureMaintainedGrid(f.state),query=grid.queryBounds.bind(grid);
      grid.queryBounds=(q,k,d)=>query(q,k,d);
      const prototype=cached?installP10Cache(grid):undefined;
      const t=performance.now();for(let tick=0;tick<2;tick++)stepSimulation(f.state,f.settings,f.dt);elapsed+=performance.now()-t;
      states.push(contactState(f.state,f.settings));
      if(prototype) {
        for(const k of ['hits','misses','invalidations'] as const)totals[k]+=prototype.stats[k];
        for(const k of ['maxEntries','maxReferences'] as const)totals[k]=Math.max(totals[k],prototype.stats[k]);
        prototype.uninstall();
      }
    }
    return {elapsed,totals,states};
  };
  let fresh,cached;
  if(round%2){cached=run(true);fresh=run(false);}else{fresh=run(false);cached=run(true);}
  assert.deepEqual(cached.states,fresh.states);
  cRounds.push({freshMs:fresh.elapsed,cachedMs:cached.elapsed,...cached.totals});
}
writeFileSync(process.argv[2],JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,
  scope:'Bounded local operation controls, not P11 or whole-game throughput. B uses actual unordered matrix/overflow traversal and frozen live geometry; original omits all downstream filtering (conservative sort-only lower bound), selected includes actual pure diet/reach predicate and compaction. Same fresh query collection is excluded from both. Durations are ms per1000 complete captured batches.',
  b:bResults,c:cRounds,sink},null,2));
