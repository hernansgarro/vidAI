import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {opticalGridCases,opticalScene,opticalState,opticalNames} from './support/optical-grid';
import {stepSimulation,getPartCornerVertices,rayCircleIntersection,getFoodRGB,
  getBodyPigment,hslToRgb} from '../simulation';
import {restoreSnapshot,totalAccountedEnergy} from '../persistence';
import {ensureMaintainedGrid,MaintainedWorldGrid,compareWorldGridValues,type WorldGridValue} from '../maintainedGrid';
import {CentralSpatialGrid} from '../centralSpatialGrid';
import {OrderedSpatialIndex,type SpatialBounds} from '../spatialIndex';
import {auditWorldGrid} from '../gridIntegrityAudit';
import {collectSpatialOverlay} from '../spatialDiagnostics';

const hash=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const reference=JSON.parse(readFileSync(new URL('./fixtures/optical-grid-p7.json',import.meta.url),'utf8'));
const kinds=['nutrient','carrion','egg','body-part'] as const;
const square=(x:number,y:number,r:number)=>({left:x-r,right:x+r,top:y-r,bottom:y+r});

for(const f of opticalGridCases()) test(`P8 complete P7 state and receipts: ${f.name}`,()=>{
  const expected=reference.cases.find((r:{name:string})=>r.name===f.name);
  assert.ok(expected);assert.equal(expected.ticks,f.ticks);
  const hashes=[hash(opticalState(f.state,f.settings))],events:unknown[]=[],energy:unknown[]=[];
  for(let tick=0;tick<f.ticks;tick++) {
    stepSimulation(f.state,f.settings,1/60,e=>events.push([tick,e]),undefined,(...r)=>energy.push([tick,...r]));
    hashes.push(hash(opticalState(f.state,f.settings)));
    assert.equal(auditWorldGrid(f.state).issueCount,0);
  }
  if(f.name==='cap-merge-cross-cell') {
    assert.equal(hashes[0],expected.hashes[0]);assert.notEqual(hashes[1],expected.hashes[1]);
    assert.equal(f.state.organisms[0].rayHits[2].objectType,'carrion');
    // A new mechanism control, not a refreshed historical baseline. Full-state
    // divergence is explicitly documented: P7's count-only rebuild misses this.
  } else assert.deepEqual(hashes,expected.hashes);
  assert.deepEqual(events,expected.events);assert.equal(hash(energy),expected.energyHash);
});

function legacyEntries(state:ReturnType<typeof opticalScene>['state']) {
  const entries:Array<{entity:unknown;bounds:SpatialBounds}>=[];
  state.nutrients.forEach(n=>entries.push({entity:n,bounds:square(n.x,n.y,n.radius)}));
  state.eggs.forEach(e=>entries.push({entity:e,bounds:square(e.x,e.y,16)}));
  state.organisms.forEach(o=>{if(!o.dissolving)o.segments.forEach((p,i)=>{
    const c=getPartCornerVertices(p,o.genome.parts[i]);
    entries.push({entity:p,bounds:{left:Math.min(...c.map(p=>p.x)),right:Math.max(...c.map(p=>p.x)),
      top:Math.min(...c.map(p=>p.y)),bottom:Math.max(...c.map(p=>p.y))}});
  });});return entries;
}

test('every optical query uses phase-current membership, fresh legacy candidates/order plus unconditional overflow, with P5 before consumption',()=>{
  let queries=0,carrionSeen=0;
  for(const f of opticalGridCases()) {
    const grid=ensureMaintainedGrid(f.state),query=grid.queryRay.bind(grid);
    grid.queryRay=(x0,y0,x1,y1,requested)=>{
      assert.deepEqual(requested,kinds);
      assert.equal(auditWorldGrid(f.state).issueCount,0,`${f.name}: pre-query, no repair`);
      const old=legacyEntries(f.state),oldGrid=new OrderedSpatialIndex(old.map(e=>e.bounds));
      const actual=query(x0,y0,x1,y1,requested);
      const overflow:unknown[]=[];grid.inspectOverflow(e=>{if(requested!.includes(e.kind as never))overflow.push(e.value.entity);});
      const expected=new Set([...oldGrid.query(x0,y0,x1,y1).map(i=>old[i].entity),...overflow]);
      assert.deepEqual(actual.map(e=>e.value.entity),old.filter(e=>expected.has(e.entity)).map(e=>e.entity),f.name);
      assert.equal(actual.length,new Set(actual).size);
      assert.deepEqual(actual.map(e=>e.value),actual.map(e=>e.value).sort(compareWorldGridValues));
      if(f.name==='same-tick-carrion'&&actual.some(e=>e.kind==='carrion'))carrionSeen++;
      queries++;return actual;
    };
    for(let t=0;t<f.ticks;t++)stepSimulation(f.state,f.settings,1/60);
    // Queries must never substitute a privately rebuilt diagnostic view.
    const before=opticalState(f.state,f.settings),overlay=collectSpatialOverlay(f.state,{cells:true,envelopes:true});
    assert.ok(overlay?.available);assert.deepEqual(opticalState(f.state,f.settings),before);
  }
  assert.ok(queries>1000);assert.ok(carrionSeen>0);
});

test('explicit food/egg/body priority, food ties, creature rank, segment rank, occlusion and spectral inputs',()=>{
  const results=new Map<string,ReturnType<typeof opticalScene>>();
  for(const name of opticalNames) {
    const f=opticalScene(name);stepSimulation(f.state,f.settings,1/60);results.set(name,f);
  }
  const ray=(name:string)=>results.get(name)!.state.organisms[0].rayHits[2];
  assert.equal(ray('food-egg-body-tie').objectType,'nutrient');
  assert.equal(ray('reverse-food-tie').objectType,'carrion');
  assert.equal(ray('egg-body-tie').objectType,'egg');
  assert.equal(ray('body-order-tie').objectType,'creature');
  assert.notDeepEqual(ray('body-order-tie'),ray('reverse-body-tie'));
  assert.equal(ray('part-order-tie').objectType,'creature');
  const partScene=results.get('part-order-tie')!,partRay=ray('part-order-tie');
  const partRGB=hslToRgb(...getBodyPigment(partScene.state.organisms[1],0));
  assert.deepEqual([partRay.r,partRay.g,partRay.b],partRGB.map(v=>v*Math.exp(-(1/(500*.55))*partRay.dist)));
  for(const name of ['dark-occlusion','spectral-occlusion']) {
    const f=results.get(name)!,org=f.state.organisms[0],r=ray(name);
    assert.equal(r.objectType,'creature');assert.equal(r.hit,true);
    assert.deepEqual([r.r,r.g,r.b],[0,0,0]);
    const i=org.genome.inputKeys!.indexOf('eye:optical-eye:ray:2:red');
    assert.deepEqual(org.neuralInputs.slice(i,i+4),[0,0,0,1]);
  }
  assert.equal(ray('nearest-body').objectType,'creature');
});

test('body pigment is evaluated at hit time after earlier same-tick learning debits',()=>{
  const f=opticalScene('dynamic-pigment'),grid=ensureMaintainedGrid(f.state),query=grid.queryRay.bind(grid);
  const target=f.state.organisms[1],initial=target.energy;
  const originalRGB=hslToRgb(...getBodyPigment(target,0));
  let seenEnergy=NaN,seenRGB:number[]=[];
  grid.queryRay=(x0,y0,x1,y1,kinds)=>{
    if(x0<200) {seenEnergy=target.energy;seenRGB=hslToRgb(...getBodyPigment(target,0));}
    return query(x0,y0,x1,y1,kinds);
  };
  stepSimulation(f.state,f.settings,1/60);
  assert.ok(seenEnergy<initial);assert.notDeepEqual(seenRGB,originalRGB);assert.equal(f.state.organisms[0].rayHits[2].objectType,'creature');
  const r=f.state.organisms[0].rayHits[2],attenuation=Math.exp(-(1/(500*.55))*r.dist);
  assert.deepEqual([r.r,r.g,r.b],seenRGB.map(v=>v*attenuation));
});

test('same-tick capped carrion merge crosses cells without a count change: current hit/RGB/retina and closed stock',()=>{
  const f=opticalScene('cap-merge-cross-cell'),grid=ensureMaintainedGrid(f.state),query=grid.queryRay.bind(grid);
  const before=totalAccountedEnergy(f.state),count=f.state.nutrients.length;
  let radius=NaN,fy=NaN,foodRGB:number[]=[];
  grid.queryRay=(x0,y0,x1,y1,kinds)=>{
    if(x0<200){const n=f.state.nutrients[0];radius=n.radius;fy=n.y;foodRGB=getFoodRGB(n);}
    return query(x0,y0,x1,y1,kinds);
  };
  stepSimulation(f.state,f.settings,1/60);
  assert.equal(f.state.nutrients.length,count);assert.ok(radius>24);
  const org=f.state.organisms[0],hit=org.rayHits[2];
  const exact=rayCircleIntersection(117.5,126,1,0,500,260,fy,radius);
  assert.equal(hit.dist,exact.dist);assert.equal(hit.objectType,'carrion');
  const attenuation=Math.exp(-(1/(500*.55))*hit.dist);
  assert.deepEqual([hit.r,hit.g,hit.b],foodRGB.map(v=>v*attenuation));
  const i=org.genome.inputKeys!.indexOf('eye:optical-eye:ray:2:red');
  assert.deepEqual(org.neuralInputs.slice(i,i+4),[hit.r,hit.g,hit.b,hit.dist/500]);
  assert.ok(Math.abs(totalAccountedEnergy(f.state)-before)<1e-6);
});

test('optical boundaries, reverse/point/huge/nonfinite rays and budget overflow fail open without duplicates',()=>{
  for(const budget of [undefined,1]) {
    const f=opticalScene('food-egg-body-tie'),grid=new MaintainedWorldGrid(f.state,
      new CentralSpatialGrid<WorldGridValue>({left:-300,right:5100,top:0,bottom:3000},budget));
    f.state.nutrients.push({...f.state.nutrients[0],id:'outside',x:6000});grid.synchronize();
    const overflow:unknown[]=[];grid.inspectOverflow(e=>{if(kinds.includes(e.kind as never))overflow.push(e);});
    for(const ray of [[128,128,128,128],[0,126,500,126],[500,126,0,126],
      [0,0,1e100,1e100],[-1e308,0,1e308,0],[NaN,0,Infinity,0],[1e100,1e100,1e100,1e100]]) {
      const actual=grid.queryRay(...ray as [number,number,number,number],kinds);
      overflow.forEach(e=>assert.ok(actual.includes(e as never)));
      assert.equal(actual.length,new Set(actual).size);
      assert.deepEqual(actual.map(e=>e.value),actual.map(e=>e.value).sort(compareWorldGridValues));
    }
    grid.dispose();
  }
});

test('complete split snapshot continuity for optical scenes, including inherited P7 radius correction',()=>{
  for(const f of opticalGridCases()) {
    const a=restoreSnapshot(opticalState(f.state,f.settings));
    stepSimulation(a.state,a.settings,1/60);
    const b=restoreSnapshot(opticalState(a.state,a.settings));
    for(let t=0;t<3;t++) {
      stepSimulation(a.state,a.settings,1/60);stepSimulation(b.state,b.settings,1/60);
      assert.deepEqual(opticalState(a.state,a.settings),opticalState(b.state,b.settings),f.name);
      assert.equal(auditWorldGrid(b.state).issueCount,0);
    }
  }
});

test('optical transient reconstruction removed; contacts and ordering remain separate',()=>{
  const source=readFileSync(new URL('../simulation.ts',import.meta.url),'utf8');
  assert.doesNotMatch(source,/sightGrid|sightEntries|sightFoodCount|bodySight|eggSight|new OrderedSpatialIndex/);
  assert.match(source,/spatial.queryRay/);assert.match(source,/resolveBodyContacts\(active/);
  assert.match(readFileSync(new URL('../maintainedGrid.ts',import.meta.url),'utf8'),/entries.sort/);
});
