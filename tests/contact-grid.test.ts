import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {collectBodyContactPairs, resolveBodyContacts} from '../contacts';
import * as old from './reference/p8-contacts';
import {contactGridCases, contactNames, contactScene, contactState} from './support/contact-grid';
import {stepSimulation, BASE_PART_DENSITY, type Organism} from '../simulation';
import {ensureMaintainedGrid, MaintainedWorldGrid, syncTrackedOrganism, type WorldGridValue} from '../maintainedGrid';
import {CentralSpatialGrid} from '../centralSpatialGrid';
import {auditWorldGrid} from '../gridIntegrityAudit';
import {collectSpatialOverlay} from '../spatialDiagnostics';
import {restoreSnapshot} from '../persistence';

const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const reference=JSON.parse(readFileSync(new URL('./fixtures/contact-grid-p8.json',import.meta.url),'utf8'));
const ids=(pairs:Array<[{org:Organism;index:number},{org:Organism;index:number}]>)=>pairs.map(([a,b])=>[a.org.id,a.index,b.org.id,b.index]);
const poses=(orgs:Organism[])=>structuredClone(orgs.map(o=>o.segments));

for (const f of contactGridCases()) test(`P9 complete untouched-P8 state/energy/events: ${f.name}`,()=>{
  const expected=reference.cases.find((r:{name:string})=>r.name===f.name);
  assert.ok(expected); assert.equal(expected.dt,f.dt); assert.equal(expected.ticks,f.ticks);
  const hashes=[hash(contactState(f.state,f.settings))], events:unknown[]=[], energy:unknown[]=[];
  const mechanics=createHash('sha256'), mechanicalCounts:Record<string,number>={};
  for(let tick=0;tick<f.ticks;tick++) {
    stepSimulation(f.state,f.settings,f.dt,e=>events.push([tick,e]),(...r)=>{mechanics.update(JSON.stringify([tick,...r,f.state.organisms.map(o=>o.segments)]));
      mechanicalCounts[r[0]]=(mechanicalCounts[r[0]]??0)+1;},(...r)=>energy.push([tick,...r]));
    hashes.push(hash(contactState(f.state,f.settings)));
    assert.equal(auditWorldGrid(f.state).issueCount,0,f.name);
  }
  assert.deepEqual(hashes,expected.hashes); assert.deepEqual(events,expected.events);
  assert.equal(hash(energy),expected.energyHash);
  assert.equal(mechanics.digest('hex'),expected.mechanicalHash);
  assert.deepEqual(mechanicalCounts,expected.mechanicalCounts);
});

test('every live part query has current P5 membership and legacy candidate coverage; P6 still reads actual cells',()=>{
  let queries=0;
  for(const name of contactNames) {
    const f=contactScene(name),grid=ensureMaintainedGrid(f.state),query=grid.queryBounds.bind(grid);
    grid.queryBounds=(bounds,kinds,descending)=>{
      if(kinds?.length===1&&kinds[0]==='body-part') {
        assert.equal(auditWorldGrid(f.state).issueCount,0,`${name} before consumption, no repair`);
        const actual=query(bounds,kinds,descending);
        const oldBodies=old.bodies(f.state.organisms,BASE_PART_DENSITY);
        for(const b of oldBodies) if(!(bounds.right<=b.left||bounds.left>=b.right||bounds.bottom<=b.top||bounds.top>=b.bottom))
          assert.ok(actual.some(e=>e.value.entity===b.p),`${name}: overlapping legacy AABB retained`);
        queries++;return actual;
      }
      return query(bounds,kinds,descending);
    };
    stepSimulation(f.state,f.settings,f.dt);
    const before=contactState(f.state,f.settings),overlay=collectSpatialOverlay(f.state,{cells:true,envelopes:true});
    assert.ok(overlay?.available); assert.deepEqual(contactState(f.state,f.settings),before);
    assert.equal(auditWorldGrid(f.state).issueCount,0);
  }
  assert.ok(queries>100);
});

test('ordered pass pairs exactly match P8 across dense/branched/long/tube/edge scenes and unconditional budget/capacity overflow',()=>{
  let pairs=0;
  for(const f of contactGridCases()) for(const budget of [undefined,1]) {
    const grid=new MaintainedWorldGrid(f.state,new CentralSpatialGrid<WorldGridValue>(undefined,budget));
    grid.synchronize(); const orgs=f.state.organisms.filter(o=>!o.dissolving);
    const expected=old.pairs(old.bodies(orgs,BASE_PART_DENSITY));
    const actual=collectBodyContactPairs(orgs,BASE_PART_DENSITY,grid);
    assert.deepEqual(ids(actual),ids(expected),`${f.name}, budget ${budget}`);
    assert.equal(actual.length,new Set(ids(actual).map(p=>JSON.stringify(p))).size);
    pairs+=actual.length; grid.dispose();
  }
  assert.ok(pairs>100);
});

test('first-common-cell X/Y takes priority over earlier source rank, including long rectangles',()=>{
  const f=contactScene('cell-corners');f.state.organisms.length=3;
  f.state.organisms.forEach((o,i)=>{
    o.segments.length=1;
    o.genome.parts=[{...o.genome.parts[0],width:i===2?400:60,height:20,parentIndex:-1}];
    Object.assign(o.segments[0],{x:[280,80,180][i],y:128,angle:0});
  });
  const grid=ensureMaintainedGrid(f.state);grid.synchronize();
  const actual=collectBodyContactPairs(f.state.organisms,BASE_PART_DENSITY,grid);
  assert.deepEqual(ids(actual),ids(old.pairs(old.bodies(f.state.organisms,BASE_PART_DENSITY))));
  assert.deepEqual(actual.map(([b,a])=>[b.rank,a.rank]),[[1,2],[0,2]]);
  // Relocate the earlier bodies in Y to exercise the second ownership key.
  f.state.organisms.forEach((o,i)=>{
    o.genome.parts=[{...o.genome.parts[0],width:20,height:i===2?400:60}];
    Object.assign(o.segments[0],{x:128,y:[280,80,180][i]});
  });
  grid.synchronize();const vertical=collectBodyContactPairs(f.state.organisms,BASE_PART_DENSITY,grid);
  assert.deepEqual(ids(vertical),ids(old.pairs(old.bodies(f.state.organisms,BASE_PART_DENSITY))));
  assert.deepEqual(vertical.map(([b,a])=>[b.rank,a.rank]),[[1,2],[0,2]]);
});

test('each actual impulse/projection and complete pose/velocity trace matches P8; correction cannot change an already frozen pass',()=>{
  let impulses=0,projections=0;
  for(const name of contactNames) {
    const a=contactScene(name),b=contactScene(name),grid=ensureMaintainedGrid(a.state);
    ensureMaintainedGrid(b.state);
    const traces:unknown[][]=[[],[]];
    const project=(org:Organism,n:number)=>{
      // Deterministic adversarial callback changes rotations/cells between passes.
      // Real joint projection is independently covered by detached full-kernel P8.
      org.segments.forEach((p,i)=>{p.angle+=.001*n; p.x+=(i%2?1:-1)*.01*n;});
      syncTrackedOrganism(org);
    };
    let frozen:ReturnType<typeof collectBodyContactPairs>|undefined,first:unknown;
    let passQueries: number | undefined;
    const query=grid.queryBounds.bind(grid); let queryCount=0;
    grid.queryBounds=(...args)=>{queryCount++;return query(...args);};
    frozen=collectBodyContactPairs(a.state.organisms,BASE_PART_DENSITY,grid);first=ids(frozen);
    const touchedA=resolveBodyContacts(a.state.organisms,BASE_PART_DENSITY,project,(stage,before,after)=>{
      assert.equal(auditWorldGrid(a.state).issueCount,0);
      traces[0].push([stage,before,after,poses(a.state.organisms),queryCount]);
      if(stage==='contact-impulse') {
        if(passQueries!==undefined) assert.equal(queryCount,passQueries,'no queries during the same impulse pass');
        passQueries=queryCount; impulses++;
      } else {passQueries=undefined; projections++;}
    },grid);
    assert.deepEqual(ids(frozen),first,'the earlier pass retains its full identity/order');
    const touchedB=old.resolveBodyContacts(b.state.organisms,BASE_PART_DENSITY,project,(stage,before,after)=>{
      traces[1].push([stage,before,after,poses(b.state.organisms)]);
    });
    assert.deepEqual(traces[0].map((t:any)=>t.slice(0,4)),traces[1],name);
    assert.deepEqual(poses(a.state.organisms),poses(b.state.organisms),name);
    assert.deepEqual([...touchedA].map(o=>o.id),[...touchedB].map(o=>o.id));
    assert.equal(auditWorldGrid(a.state).issueCount,0);
  }
  assert.ok(impulses>100);assert.ok(projections>0);
});

test('split authoritative snapshot continuation through every new contact scene and both tubes',()=>{
  for(const f of contactGridCases().filter(f=>contactNames.includes(f.name as never)||f.name.startsWith('tube-'))) {
    const a=restoreSnapshot(contactState(f.state,f.settings)); stepSimulation(a.state,a.settings,f.dt);
    const b=restoreSnapshot(contactState(a.state,a.settings));
    for(let tick=0;tick<3;tick++) {
      stepSimulation(a.state,a.settings,f.dt); stepSimulation(b.state,b.settings,f.dt);
      assert.deepEqual(contactState(a.state,a.settings),contactState(b.state,b.settings),f.name);
      assert.equal(auditWorldGrid(b.state).issueCount,0);
    }
  }
});

test('P8 oracle differs only in imports/test exports; transient contact buckets are absent from runtime',()=>{
  const source=readFileSync(new URL('../contacts.ts',import.meta.url),'utf8');
  assert.doesNotMatch(source,/ContactCell|contactColumns|contactStamp|contactCells|new Map<number/);
  assert.match(source,/grid.queryBounds/);
  const oracle=readFileSync(new URL('./reference/p8-contacts.ts',import.meta.url),'utf8');
  assert.equal(hash(oracle.replace(/^\/\/ Immutable.*\n/,'').replaceAll('../../','./')
    .replace('export function bodies(','function bodies(').replace('export function pairs(','function pairs(')),
    '072ba7b93134a3945d67e507418228046299344a1c67a381a8e7e3034e51e64c');
});
