import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {p10Cases,p10FoodNames,p10FoodScene} from './support/p10-scenes';
import {contactState} from './support/contact-grid';
import {stepSimulation,distPointToSegment,type Nutrient} from '../simulation';
import {ensureMaintainedGrid,MaintainedWorldGrid,type WorldGridValue} from '../maintainedGrid';
import {CentralSpatialGrid} from '../centralSpatialGrid';
import {restoreSnapshot} from '../persistence';
import {auditWorldGrid} from '../gridIntegrityAudit';
import {collectSpatialOverlay} from '../spatialDiagnostics';

const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const reference=JSON.parse(readFileSync(new URL('./fixtures/p10-query-p9.json',import.meta.url),'utf8'));
for(const f of p10Cases()) test(`P10-B exact P9 snapshots/optics/learning/receipts/mechanics: ${f.name}`,()=>{
  const expected=reference.cases.find((r:{name:string})=>r.name===f.name);assert.ok(expected);
  const hashes=[hash(contactState(f.state,f.settings))],events:unknown[]=[],energy:unknown[]=[];
  const mechanics=createHash('sha256'),counts:Record<string,number>={};
  for(let tick=0;tick<f.ticks;tick++) {
    stepSimulation(f.state,f.settings,f.dt,e=>events.push([tick,e]),(...r)=>{
      mechanics.update(JSON.stringify([tick,...r,f.state.organisms.map(o=>o.segments)]));
      counts[r[0]]=(counts[r[0]]??0)+1;
    },(...r)=>energy.push([tick,...r]));
    hashes.push(hash(contactState(f.state,f.settings)));
    assert.equal(auditWorldGrid(f.state).issueCount,0,f.name);
  }
  assert.deepEqual(hashes,expected.hashes);assert.deepEqual(events,expected.events);
  assert.equal(hash(energy),expected.energyHash);
  assert.equal(mechanics.digest('hex'),expected.mechanicalHash);assert.deepEqual(counts,expected.mechanicalCounts);
});

test('B filters only large combined food lists; every rejected edible target is outside the actual capsule',()=>{
  let rejected=0,tangent=false,large=0;
  for(const name of p10FoodNames) {
    const f=p10FoodScene(name),grid=ensureMaintainedGrid(f.state),query=grid.queryBounds.bind(grid);
    grid.queryBounds=(q,k,d,retain)=>{
      assert.equal(auditWorldGrid(f.state).issueCount,0);
      const raw=query(q,k,d),actual=query(q,k,d,retain);
      if(retain) {
        assert.deepEqual(k,['nutrient','carrion']);assert.equal(d,true);
        if(raw.length>=128) {
          large++;assert.ok(actual.length<raw.length);
          for(const entry of raw)if(!actual.includes(entry)) {
            const food=entry.value.entity as Nutrient;
            if(food.kind!=='carrion')assert.ok(distPointToSegment(food.x,food.y,133.5,750,140.5,750)>food.radius+3.5);
            rejected++;
          }
          if(name==='food-contact-tangency') {
            assert.ok(actual.some(e=>(e.value.entity as Nutrient).id==='exact-tangent'));tangent=true;
          }
        } else assert.deepEqual(actual,raw,'small lists retain the P9 path');
      }
      assert.deepEqual(actual.map(e=>e.value.sourceIndex),actual.map(e=>e.value.sourceIndex).sort((a,b)=>b-a));
      return actual;
    };
    stepSimulation(f.state,f.settings,f.dt);
    assert.equal(f.state.organisms[0].mouthFeedback!.mouth.contact,1);
    assert.ok(f.state.organisms[0].recentFeedings!.length>0);
    const before=contactState(f.state,f.settings);
    const overlay=collectSpatialOverlay(f.state,{cells:true,envelopes:true});
    assert.ok(overlay?.available);assert.deepEqual(contactState(f.state,f.settings),before);
  }
  assert.equal(large,4);assert.ok(rejected>900);assert.ok(tangent);
});

test('B keeps raw fail-open overflow and exact imported snapshot continuation without derived predicates',()=>{
  const f=p10FoodScene('food-cell-false-positives');
  const grid=new MaintainedWorldGrid(f.state,new CentralSpatialGrid<WorldGridValue>(undefined,1));grid.synchronize();
  const q={left:NaN,right:NaN,top:NaN,bottom:NaN};
  const kinds=['nutrient','carrion'] as const;
  const raw=grid.queryBounds(q,kinds,true),filtered=grid.queryBounds(q,kinds,true,e=>(e.value.entity as Nutrient).kind!=='carrion');
  const overflow:unknown[]=[];grid.inspectOverflow(e=>{if(kinds.includes(e.kind as never))overflow.push(e);});
  for(const entry of overflow)assert.ok(raw.includes(entry as never));
  assert.equal(raw.length,new Set(raw).size);
  assert.deepEqual(filtered,raw.filter(e=>(e.value.entity as Nutrient).kind!=='carrion'));grid.dispose();
  for(const name of p10FoodNames) {
    const f=p10FoodScene(name);stepSimulation(f.state,f.settings,f.dt);
    const b=restoreSnapshot(contactState(f.state,f.settings));
    for(let tick=0;tick<3;tick++) {
      stepSimulation(f.state,f.settings,f.dt);stepSimulation(b.state,b.settings,f.dt);
      assert.deepEqual(contactState(f.state,f.settings),contactState(b.state,b.settings));
      assert.equal(auditWorldGrid(b.state).issueCount,0);
    }
  }
});
