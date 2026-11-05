import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {feedingGridCases, feedingState, importedRadiusCase} from './support/feeding-grid';
import {stepSimulation, getPartCornerVertices} from '../simulation';
import {ensureMaintainedGrid, MaintainedWorldGrid, type WorldGridValue} from '../maintainedGrid';
import {CentralSpatialGrid} from '../centralSpatialGrid';
import {OrderedSpatialIndex, type SpatialBounds} from '../spatialIndex';
import {auditWorldGrid} from '../gridIntegrityAudit';
import {restoreSnapshot, totalAccountedEnergy} from '../persistence';

const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const reference = JSON.parse(readFileSync(new URL('./fixtures/feeding-grid-p6.json', import.meta.url), 'utf8'));
const square = (x: number, y: number, r: number) => ({left: x-r, right: x+r, top: y-r, bottom: y+r});
const legacyQuery = (bounds: SpatialBounds[], q: SpatialBounds) =>
  new OrderedSpatialIndex(bounds).queryBounds(q.left, q.top, q.right, q.bottom).reverse();

for (const fixture of feedingGridCases()) test(`P7 full P6 state/ordered-receipt equivalence: ${fixture.name}`, () => {
  const {state, settings, ticks, name} = fixture;
  const expected = reference.cases.find((r: {name: string}) => r.name === name);
  assert.ok(expected); assert.equal(expected.ticks, ticks);
  const hashes = [hash(feedingState(state, settings))], events: unknown[] = [], energy: unknown[] = [];
  const before = totalAccountedEnergy(state);
  for (let tick = 0; tick < ticks; tick++) {
    stepSimulation(state, settings, 1/60, event => events.push([tick, event]), undefined,
      (...receipt) => energy.push([tick, ...receipt]));
    hashes.push(hash(feedingState(state, settings)));
    assert.equal(auditWorldGrid(state).issueCount, 0, name);
  }
  if (name.startsWith('imported-radius-growth')) {
    assert.equal(hashes[0], expected.hashes[0]); assert.notEqual(hashes[1], expected.hashes[1]);
    assert.deepEqual(expected.finalFood, [2940]); assert.equal(state.nutrients[0].energyValue, 2880);
    assert.deepEqual(state.organisms.map(o => o.recentFeedings!.map(e => e.energyTransferred)), [[48], [48]]);
    assert.ok(Math.abs(totalAccountedEnergy(state)-before) < 1e-6);
  } else {
    assert.deepEqual(hashes, expected.hashes); assert.deepEqual(events, expected.events);
    assert.equal(hash(energy), expected.energyHash);
  }
});

test('live feeding queries preserve descending ranks and fresh legacy candidate coverage; P5 is clean before every query', () => {
  let queries = 0, coarseExtras = 0, shrinkCrossings = 0, removedEggs = 0, removedFood = 0;
  for (const fixture of feedingGridCases()) {
    const {state, settings, ticks} = fixture, grid = ensureMaintainedGrid(state);
    const query = grid.queryBounds.bind(grid), syncFood = grid.syncFood.bind(grid);
    const remove = grid.remove.bind(grid);
    grid.remove = entity => {
      if (state.eggs.includes(entity as never)) removedEggs++;
      if (state.nutrients.includes(entity as never)) removedFood++;
      remove(entity);
    };
    grid.syncFood = (food, index) => {
      const entry = query(square(food.x, food.y, 0), ['nutrient', 'carrion']).find(e => e.value.entity === food);
      const old = entry?.cellRange; syncFood(food, index);
      if (old && entry?.cellRange && old.left !== entry.cellRange.left) shrinkCrossings++;
    };
    grid.queryBounds = (q, kinds, descending) => {
      assert.equal(auditWorldGrid(state).issueCount, 0, `${fixture.name}: before consumption, without repair`);
      // P9 contact queries share the grid; this oracle checks feeding order only.
      if (kinds?.length === 1 && kinds[0] === 'body-part') return query(q, kinds, descending);
      assert.equal(descending, true); queries++;
      const actual = query(q, kinds, descending), ranks = actual.map(e => e.value.sourceIndex);
      assert.deepEqual(ranks, [...new Set(ranks)].sort((a,b) => b-a));
      let expected: number[];
      if (kinds![0] === 'organism') {
        const bounds = state.organisms.map(o => {
          const points = o.segments.flatMap((p,i) => getPartCornerVertices(p,o.genome.parts[i]));
          return {left: Math.min(...points.map(p=>p.x)), right: Math.max(...points.map(p=>p.x)),
            top: Math.min(...points.map(p=>p.y)), bottom: Math.max(...points.map(p=>p.y))};
        });
        expected = legacyQuery(bounds,q).filter(i => !state.organisms[i].dissolving);
        for (const i of expected) assert.ok(ranks.includes(i), 'no missing old whole-prey candidate');
        coarseExtras += ranks.filter(i => !expected.includes(i)).length;
      } else {
        const items = kinds![0] === 'egg' ? state.eggs : state.nutrients;
        expected = legacyQuery(items.map(n => square(n.x,n.y,'radius' in n ? n.radius : 16)),q);
        const overflow: number[] = [];
        grid.inspectOverflow(e => {if (kinds!.includes(e.kind)) overflow.push(e.value.sourceIndex);});
        expected = [...new Set([...expected,...overflow])].sort((a,b)=>b-a);
        assert.deepEqual(ranks,expected,'individual food/egg views equal fresh legacy candidates plus overflow');
      }
      return actual;
    };
    for (let tick=0;tick<ticks;tick++) stepSimulation(state,settings,1/60);
  }
  assert.ok(queries > 100); assert.ok(coarseExtras > 0);
  assert.ok(shrinkCrossings > 0); assert.ok(removedEggs > 0); assert.ok(removedFood > 0);
});

test('P7 accepted imported-radius growth survives validation, closed stock and exact split continuation', () => {
  for (const closed of [false,true]) {
    const f = importedRadiusCase(closed), initial = feedingState(f.state,f.settings);
    const a = restoreSnapshot(initial), b = restoreSnapshot(initial);
    stepSimulation(a.state,a.settings,1/60);
    assert.equal(a.state.nutrients[0].energyValue,2880);
    stepSimulation(b.state,b.settings,1/60);
    const continued = restoreSnapshot(feedingState(b.state,b.settings));
    for (let i=0;i<6;i++) {
      stepSimulation(a.state,a.settings,1/60); stepSimulation(continued.state,continued.settings,1/60);
      assert.deepEqual(feedingState(a.state,a.settings),feedingState(continued.state,continued.settings));
      assert.equal(auditWorldGrid(a.state).issueCount,0);
    }
    if (closed) assert.ok(Math.abs(totalAccountedEnergy(a.state)-a.state.energyPool!.budget)<1e-6);
  }
});

test('overlapping mouths exhaust prey, then eggs, then mixed food; newly laid eggs are visible in the same tick', () => {
  const f=feedingGridCases().find(f=>f.name==='overlap-capsule-v1-historical-false')!;
  stepSimulation(f.state,f.settings,1/60);
  const omnivore=f.state.organisms.find(o=>o.genome.mouths[0]?.mouthType==='omnivore')!;
  assert.deepEqual(omnivore.recentFeedings!.map(e=>e.foodCategory),['Prey','Egg']);
  // The first mouth exhausts its ordinary budget on eggs. Food becomes
  // available to this consumer on the next tick, after the other mouths eat.
  stepSimulation(f.state,f.settings,1/60);
  assert.deepEqual(omnivore.recentFeedings!.map(e=>e.foodCategory),['Prey','Egg','Carrion']);
  assert.ok(f.state.eggs.length<4); assert.ok(f.state.nutrients.length<8);
  const laying=feedingGridCases().find(f=>f.name==='same-tick-laying')!;
  assert.equal(laying.state.eggs.length,0);
  stepSimulation(laying.state,laying.settings,1/60);
  assert.ok(laying.state.organisms[1].offspringCount>0);
  assert.deepEqual(laying.state.organisms[0].recentFeedings!.map(e=>e.foodCategory),['Egg']);
});

test('dense feeding and same-tick laying retain exact complete snapshot continuation after import', () => {
  for (const f of feedingGridCases().filter(f=>f.name.startsWith('overlap-')||f.name==='same-tick-laying')) {
    const a=restoreSnapshot(feedingState(f.state,f.settings));
    for(let tick=0;tick<2;tick++) stepSimulation(a.state,a.settings,1/60);
    const b=restoreSnapshot(feedingState(a.state,a.settings));
    for(let tick=0;tick<4;tick++) {
      stepSimulation(a.state,a.settings,1/60); stepSimulation(b.state,b.settings,1/60);
      assert.deepEqual(feedingState(a.state,a.settings),feedingState(b.state,b.settings),f.name);
      assert.equal(auditWorldGrid(b.state).issueCount,0);
    }
  }
});

test('unconditional overflow, extreme query coordinates and unbounded query arithmetic never cull or duplicate', () => {
  const {state} = importedRadiusCase(false), grid = new MaintainedWorldGrid(state,
    new CentralSpatialGrid<WorldGridValue>({left:-300,right:5100,top:0,bottom:3000},1));
  grid.synchronize(); assert.ok(grid.overflowCount > 0);
  const overflow: unknown[] = []; grid.inspectOverflow(e => overflow.push(e));
  for (const q of [square(1e100,1e100,1),square(-1e100,-1e100,1),
    {left:-1e300,right:1e300,top:-1e300,bottom:1e300},
    {left:NaN,right:Infinity,top:-Infinity,bottom:NaN}]) {
    const found=grid.queryBounds(q);
    for (const e of overflow) assert.ok(found.includes(e as never));
    assert.equal(found.length,new Set(found).size);
  }
  const full=grid.queryBounds({left:NaN,right:NaN,top:NaN,bottom:NaN});
  assert.equal(full.length,grid.entryCount); grid.dispose();
});

test('feeding uses only maintained queries; physical contact migration remains separate', () => {
  const source=readFileSync(new URL('../simulation.ts',import.meta.url),'utf8');
  const feeding=source.slice(source.indexOf('// P4 pose/lifecycle hooks'),source.indexOf('// E. REPRODUCTION'));
  assert.doesNotMatch(feeding,/new OrderedSpatialIndex|new NutrientSightGrid|oralFoodGrid|oralEggGrid|preyGrid/);
  assert.match(feeding,/\['organism'\], true/); assert.match(feeding,/\['egg'\], true/);
  assert.match(feeding,/\['nutrient', 'carrion'\], true/);
  assert.doesNotMatch(source,/sightGrid = new OrderedSpatialIndex/);
});
