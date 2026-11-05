import assert from 'node:assert/strict';
import {test} from 'node:test';
import {installP10Cache} from './support/p10-cache-prototype';
import {importedRadiusCase} from './support/feeding-grid';
import {p10Cases} from './support/p10-scenes';
import {contactState} from './support/contact-grid';
import {ensureMaintainedGrid,MaintainedWorldGrid} from '../maintainedGrid';
import {stepSimulation} from '../simulation';
import {auditWorldGrid} from '../gridIntegrityAudit';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const reference=JSON.parse(readFileSync(new URL('./fixtures/p10-query-p9.json',import.meta.url),'utf8'));
test('C prototype: exact keys, bounded results, result ownership, lifecycle/rank/geometry/category invalidation and world isolation',()=>{
  const f=importedRadiusCase(false),grid=ensureMaintainedGrid(f.state);
  // Complete the factory's manual roster replacement before standalone queries.
  grid.synchronize();
  const freshBounds=grid.queryBounds.bind(grid),freshRay=grid.queryRay.bind(grid);
  const prototype=installP10Cache(grid),kinds=['nutrient','carrion','egg','body-part'] as const;
  const q={left:0,top:600,right:500,bottom:900};
  const check=()=>{
    for(const requested of [kinds,['nutrient'] as const,['carrion'] as const,['body-part'] as const]) {
      for(const descending of [false,true]) {
        const fresh=freshBounds(q,requested,descending);
        const first=grid.queryBounds(q,requested,descending);first.reverse();first.length=0;
        assert.deepEqual(grid.queryBounds(q,requested,descending),fresh);
      }
      for(const ray of [[0,750,500,750],[500,750,0,750],[-0,0,0,0],
        [NaN,0,Infinity,0],[-Infinity,0,Infinity,0]] as const) {
        const expected=freshRay(ray[0],ray[1],ray[2],ray[3],requested);
        assert.deepEqual(grid.queryRay(ray[0],ray[1],ray[2],ray[3],requested),expected);
        assert.deepEqual(grid.queryRay(ray[0],ray[1],ray[2],ray[3],requested),expected);
      }
    }
    assert.ok(prototype.size<=32);assert.ok(prototype.stats.maxReferences<=8192);
  };
  const initial=contactState(f.state,f.settings);check();assert.deepEqual(contactState(f.state,f.settings),initial);
  const food=f.state.nutrients[0];
  for(const patch of [{x:127},{radius:80},{x:300},{radius:1},{kind:'carrion' as const},{kind:'nutrient' as const}]) {
    Object.assign(food,patch);grid.syncFood(food,0);check();assert.equal(auditWorldGrid(f.state).issueCount,0);
  }
  f.state.nutrients.push({...food,id:'new',x:250});grid.syncFood(f.state.nutrients[1],1);check();
  f.state.nutrients.reverse();grid.refreshRanks('food');check();
  grid.remove(f.state.nutrients[0]);f.state.nutrients.splice(0,1);grid.refreshRanks('food');check();
  const org=f.state.organisms[0];org.segments[0].x+=128;grid.syncOrganism(org,0);check();
  org.dissolving=true;grid.removeOrganism(org);check();
  grid.synchronize();check();assert.equal(auditWorldGrid(f.state).issueCount,0);
  // Whole-world replacement/import gets an independent owner and empty cache.
  const replacement=importedRadiusCase(false),other=new MaintainedWorldGrid(replacement.state);other.synchronize();
  const second=installP10Cache(other);assert.equal(second.size,0);
  assert.notDeepEqual(other.queryBounds(q,kinds),grid.queryBounds(q,kinds));
  other.dispose();assert.equal(second.size,0);second.uninstall();
  assert.ok(prototype.stats.hits>0);assert.ok(prototype.stats.invalidations>0);
  grid.dispose();assert.equal(prototype.size,0);prototype.uninstall();
  assert.deepEqual(contactState(replacement.state,replacement.settings),contactState(importedRadiusCase(false).state,replacement.settings));
});

test('C independent prototype matches P9 complete states and ordered receipts across all52 fixed cases',()=>{
  for(const f of p10Cases()) {
    const expected=reference.cases.find((r:{name:string})=>r.name===f.name),grid=ensureMaintainedGrid(f.state);
    // Isolate C from B: both query implementations use P9 unfiltered ordering.
    const query=grid.queryBounds.bind(grid);grid.queryBounds=(q,k,d)=>query(q,k,d);
    const prototype=installP10Cache(grid),hashes=[hash(contactState(f.state,f.settings))],events:unknown[]=[],energy:unknown[]=[];
    for(let tick=0;tick<f.ticks;tick++) {
      stepSimulation(f.state,f.settings,f.dt,e=>events.push([tick,e]),undefined,(...r)=>energy.push([tick,...r]));
      hashes.push(hash(contactState(f.state,f.settings)));assert.equal(auditWorldGrid(f.state).issueCount,0);
    }
    assert.deepEqual(hashes,expected.hashes,f.name);assert.deepEqual(events,expected.events,f.name);
    assert.equal(hash(energy),expected.energyHash,f.name);prototype.uninstall();
  }
});
