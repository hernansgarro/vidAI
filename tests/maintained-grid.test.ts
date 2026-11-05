import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {CentralSpatialGrid, type GridKind} from '../centralSpatialGrid';
import {ensureMaintainedGrid, getMaintainedGrid, MaintainedWorldGrid, type WorldGridValue} from '../maintainedGrid';
import {createInitialWorld, addExternalOrganism} from '../world';
import {createFounderGenome} from '../founders';
import {createSnapshot, restoreSnapshot, DEFAULT_SETTINGS, resizeWorld, clearFreeNutrients, totalAccountedEnergy} from '../persistence';
import {stepSimulation, addNutrients, type SimulationState} from '../simulation';
import {SimulationHost} from '../simulationHost';
import {resolveBodyContacts} from '../contacts';
import {translateLiveOrganism, setSelfTubes, moveTubeParticle, tubeGeometry} from '../selfTubes';
import {selfTubeFixture} from './support/self-tubes';
import {cycleFixture, food} from './support/nutrient-cycle';
import {eggReserveFixture} from './support/egg-reserve';
import {gridCompatibilityCases, compatibilityReceipt, snapshotDigest} from './support/maintained-grid-compatibility';

const capacity = {left: -300, right: 5100, top: 0, bottom: 3000};
const smallSettings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0};
const empty = () => createInitialWorld(smallSettings, 440, 'balanced', 'standard', 0);
const all = (s: SimulationState) => getMaintainedGrid(s)!.queryBounds(capacity);
function reference(s: SimulationState) {
  const entries: Array<{entity: object; kind: GridKind; sourceIndex: number; partIndex: number; points: Array<{x: number; y: number}>}> = [];
  const square = (x: number, y: number, r: number) => [{x: x-r, y: y-r}, {x: x+r, y: y+r}];
  s.nutrients.forEach((n, i) => entries.push({entity: n, kind: n.kind === 'carrion' ? 'carrion' : 'nutrient', sourceIndex: i, partIndex: -1, points: square(n.x, n.y, n.radius)}));
  s.eggs.forEach((e, i) => entries.push({entity: e, kind: 'egg', sourceIndex: i, partIndex: -1, points: square(e.x, e.y, 16)}));
  s.organisms.forEach((o, sourceIndex) => {
    if (o.dissolving) return;
    const body: Array<{x: number; y: number}> = [];
    o.segments.forEach((p, partIndex) => {
      const d = o.genome.parts[partIndex], points = [];
      for (const x of [-d.width/2, d.width/2]) for (const y of [-d.height/2, d.height/2])
        points.push({x: p.x + x*Math.cos(p.angle) - y*Math.sin(p.angle), y: p.y + x*Math.sin(p.angle) + y*Math.cos(p.angle)});
      body.push(...points); entries.push({entity: p, kind: 'body-part', sourceIndex, partIndex, points});
    });
    entries.push({entity: o, kind: 'organism', sourceIndex, partIndex: -1, points: body});
  });
  return entries;
}
/** Test-only independent roster/cell reference; no P5 runtime auditor. */
function assertIntegrity(s: SimulationState, everyCell = false) {
  const grid = getMaintainedGrid(s)!, actual = all(s), expected = reference(s);
  assert.equal(actual.length, expected.length); assert.equal(new Set(actual).size, actual.length);
  assert.equal(grid.entryCount, expected.length);
  assert.equal(grid.matrix.entryCount + grid.overflowCount, expected.length);
  for (const r of expected) {
    const e = actual.find(e => e.value.entity === r.entity)!;
    assert.ok(e, 'each authoritative entity has exactly one typed view');
    assert.equal(e.kind, r.kind); assert.equal(e.value.sourceIndex, r.sourceIndex); assert.equal(e.value.partIndex, r.partIndex);
    const b = e.value.bounds;
    if (b) for (const p of r.points) assert.ok(p.x >= b.left - 1e-10 && p.x <= b.right + 1e-10
      && p.y >= b.top - 1e-10 && p.y <= b.bottom + 1e-10, 'bound encloses independent physical corners');
    else assert.equal(e.registered, false);
    if (!e.registered) assert.ok(grid.queryBounds({left: 0, right: 0, top: 0, bottom: 0}, [e.kind]).includes(e), 'overflow always retained');
  }
  if (!everyCell) return;
  let memberships = 0, occupied = 0;
  const r = grid.matrix.cellRange;
  for (let y = r.top; y <= r.bottom; y++) for (let x = r.left; x <= r.right; x++) {
    const candidates = grid.matrix.queryCells({left: x, right: x, top: y, bottom: y});
    const expectedCell = actual.filter(e => e.registered && (() => {
      const b = e.value.bounds!;
      return x >= Math.floor((b.left-1e-7)/128) && x <= Math.floor((b.right+1e-7)/128)
        && y >= Math.floor((b.top-1e-7)/128) && y <= Math.floor((b.bottom+1e-7)/128);
    })());
    assert.deepEqual(new Set(candidates), new Set(expectedCell));
    assert.equal(candidates.length, new Set(candidates).size);
    memberships += candidates.length; if (candidates.length) occupied++;
  }
  assert.equal(grid.matrix.membershipCount, memberships); assert.equal(grid.matrix.occupiedCellCount, occupied);
}

test('entity-local handles persist, same cells do not mutate buckets, crossing and category changes stay exact', () => {
  const s = empty(), n = food(3000, false, 80, 80); s.nutrients.push(n);
  const grid = ensureMaintainedGrid(s); grid.synchronize(); assertIntegrity(s, true);
  const e = all(s)[0], range = e.cellRange;
  // Verify actual bucket mutators, rather than relying on a return-value claim.
  const internal = grid.matrix as unknown as {add: (...args: unknown[]) => void; erase: (...args: unknown[]) => void};
  let changes = 0;
  for (const method of ['add', 'erase'] as const) {
    const original = internal[method].bind(grid.matrix);
    internal[method] = (...args) => {changes++; original(...args);};
  }
  n.x += 1; n.radius -= .1; grid.synchronize();
  assert.equal(all(s)[0], e); assert.equal(e.cellRange, range); assert.equal(changes, 0);
  n.x += 400; grid.synchronize(); assert.ok(changes > 0); assert.equal(all(s)[0], e); assertIntegrity(s, true);
  n.kind = 'carrion'; n.decayTimeRemaining = 60; grid.synchronize();
  assert.equal(e.kind, 'carrion'); assert.equal(grid.queryBounds(capacity, ['nutrient']).length, 0); assertIntegrity(s, true);
  s.nutrients.splice(0, 1); grid.synchronize();
  assert.equal(e.registered, false); assert.equal(grid.matrix.membershipCount, 0); assert.equal(grid.entryCount, 0);
  assert.equal(Object.getOwnPropertySymbols(n).length, 0);
});

test('splices, births, reordered source arrays and identical IDs preserve identity and current ranks', () => {
  const s = empty(); s.nutrients.push(...[0, 1, 2].map(i => ({...food(3000, false, 300, 300), id: `same-id`})));
  const grid = ensureMaintainedGrid(s); grid.synchronize();
  const originals = all(s), survivor = s.nutrients[2];
  grid.remove(s.nutrients[1]); s.nutrients.splice(1, 1); grid.refreshRanks('food');
  s.nutrients.push(food(500, true, 300, 300)); grid.syncFood(s.nutrients.at(-1)!, s.nutrients.length - 1);
  assert.deepEqual(grid.queryBounds(capacity, ['nutrient', 'carrion']).map(e => e.value.entity), s.nutrients);
  assert.deepEqual(grid.queryBounds(capacity, ['nutrient', 'carrion'], true).map(e => e.value.entity), [...s.nutrients].reverse());
  assert.equal(all(s).find(e => e.value.entity === survivor), originals[2]);
  s.nutrients.reverse(); grid.synchronize(); assertIntegrity(s, true);
  const o = addExternalOrganism(s, createFounderGenome('CUR-007'), smallSettings, 900, 600, .8)!;
  assertIntegrity(s); assert.equal(all(s).filter(e => e.kind === 'body-part').length, o.segments.length);
  o.dissolving = true; grid.synchronize(); assertIntegrity(s, true);
});

test('P2 uncertain lifetime bound uses current separated/rotated pose; out-of-capacity and overflow never cull', () => {
  const s = empty(), o = addExternalOrganism(s, createFounderGenome('CUR-009'), smallSettings, 500, 500, .4)!;
  const grid = ensureMaintainedGrid(s);
  o.segments[1].x = 10000; o.segments[1].angle = 2.7; grid.synchronize();
  assertIntegrity(s, true); assert.ok(grid.overflowCount > 0);
  const coarse = all(s).find(e => e.kind === 'organism')!;
  assert.equal(coarse.registered, false);
  assert.ok(grid.queryRay(9990, 490, 10010, 510, ['organism']).includes(coarse));
  o.segments[1].x = Number.MAX_VALUE / 2; grid.synchronize();
  assert.equal(coarse.value.bounds, null); assertIntegrity(s);
  o.segments[1].x = 520; grid.synchronize(); assert.equal(coarse.registered, true); assertIntegrity(s, true);
});

test('membership-budget exhaustion uses explicit always-candidates and recovers without clipping or duplication', () => {
  const s = empty(); s.nutrients = [food(3000, false, 80, 80), food(3000, true, 80, 80)];
  const grid = new MaintainedWorldGrid(s, new CentralSpatialGrid<WorldGridValue>(capacity, 1));
  grid.synchronize(); assert.equal(grid.matrix.entryCount, 1); assert.equal(grid.overflowCount, 1);
  assert.equal(grid.queryBounds({left: 4000, right: 4010, top: 2000, bottom: 2010}).length, 1);
  const removed = s.nutrients.shift()!; grid.remove(removed); grid.synchronize();
  assert.equal(grid.overflowCount, 0); assert.equal(grid.matrix.entryCount, 1);
  grid.dispose(); assert.equal(grid.matrix.membershipCount, 0); assert.equal(grid.entryCount, 0);
});

test('physics, joint projection, passive contact repair and external translation synchronize before returning', () => {
  const s = empty(), g = createFounderGenome('CUR-001');
  const a = addExternalOrganism(s, g, smallSettings, 800, 500, 0)!;
  const b = addExternalOrganism(s, g, smallSettings, 802, 500, .5)!;
  const grid = ensureMaintainedGrid(s); let updates = 0;
  const original = grid.syncOrganism.bind(grid);
  grid.syncOrganism = (o, i) => {updates++; original(o, i);};
  const initial = JSON.stringify(a.segments);
  resolveBodyContacts(s.organisms, .4, () => {}, undefined, grid);
  assert.notEqual(JSON.stringify(a.segments), initial); assert.ok(updates >= 2); assertIntegrity(s, true);
  translateLiveOrganism(a, -700, -400); assertIntegrity(s, true);
  const phases = new Set<string>();
  updates = 0; stepSimulation(s, {...smallSettings, physicsRegime: 'passive-work-v3'}, 1/60, undefined, phase => {
    phases.add(phase); assertIntegrity(s);
  });
  assert.ok(phases.has('position-projection'), 'real joint projection is observed with current membership');
  assert.ok(updates >= 8, 'both organisms synchronize on every physics substep'); assertIntegrity(s, true);
  assert.ok(b.segments.every(p => Number.isFinite(p.x)));
});

test('real lifecycle covers mineralization, depletion, hatching, laying, dissolution and cleanup', () => {
  const c = cycleFixture([food(.001), food(12000, true)]); c.settings.nutrientCycle = 'decay-v2';
  c.state.nutrients[1].decayTimeRemaining = .001;
  stepSimulation(c.state, c.settings, 1/60); assertIntegrity(c.state, true);
  assert.ok(c.state.nutrients.every(n => n.kind !== 'carrion'));
  const f = eggReserveFixture();
  f.state.eggs[0].incubationProgress = 1;
  stepSimulation(f.state, f.config, 1/60); assert.ok(f.state.organisms.length > 0); assertIntegrity(f.state, true);
  const newborn = f.state.organisms[0];
  f.state.simTime = 50;
  newborn.energy = 100000; newborn.age = 50; newborn.genome.maturityAge = 1; newborn.genome.targetClutchSize = 1;
  stepSimulation(f.state, f.config, 1/60); assertIntegrity(f.state, true);
  assert.ok(newborn.clutchesLaid > 0, 'ordinary funded laying registers a new egg');
  newborn.dissolving = true; newborn.dissolveAlpha = .001;
  stepSimulation(f.state, f.config, 1/60); assertIntegrity(f.state, true);
  assert.ok(!f.state.organisms.includes(newborn)); assert.ok(f.state.nutrients.some(n => n.kind === 'carrion'));
});

test('both tube transfers replace handles without obsolete identities; particles, resize and topology edits synchronize paused state', () => {
  for (const side of ['L', 'R'] as const) {
    const {state, settings} = selfTubeFixture(side), old = state.organisms[0];
    ensureMaintainedGrid(state).synchronize();
    stepSimulation(state, settings, 1/60); assertIntegrity(state, true);
    assert.notEqual(state.organisms[0], old); assert.equal(state.organisms[0].id, old.id);
    assert.ok(!all(state).some(e => e.value.entity === old || e.value.organism === old));
    addNutrients(state, {...settings, targetNutrients: 10}, 3); assertIntegrity(state);
    const n = state.nutrients[0]; n.x = -301; n.y = 450;
    moveTubeParticle(n, tubeGeometry(settings, state.selfTubes)!); assertIntegrity(state, true);
    setSelfTubes(state, settings, {version: 1, connected: false, accepted: []}); assertIntegrity(state, true);
    resizeWorld(state, settings, 1000, 800); assertIntegrity(state, true);
    clearFreeNutrients(state); assertIntegrity(state, true);
  }
});

test('transient handles never enter snapshots, clones or render transport; reset disposes the old matrix', () => {
  const s = empty(); addExternalOrganism(s, createFounderGenome('CUR-007'), smallSettings, 800, 700);
  addNutrients(s, {...smallSettings, targetNutrients: 5}, 5);
  const before = createSnapshot(s, smallSettings), grid = ensureMaintainedGrid(s);
  grid.synchronize(); assert.deepEqual(createSnapshot(s, smallSettings), before);
  assert.equal(Object.getOwnPropertySymbols(structuredClone(s.organisms[0])).length, 0);
  const host = new SimulationHost(); host.reset(before, 1); assertIntegrity(host.state, true);
  const old = getMaintainedGrid(host.state)!;
  const frame = structuredClone(host.frame());
  assert.equal(Object.getOwnPropertySymbols(frame.state.organisms[0]).length, 0);
  assert.equal(Object.getOwnPropertySymbols(frame.state.organisms[0].segments[0]).length, 0);
  host.reset(before, 2); assert.equal(old.entryCount, 0); assert.equal(old.matrix.membershipCount, 0); assertIntegrity(host.state, true);
  host.action({kind: 'spawn', archetype: 'eel', x: 500, y: 500});
  host.action({kind: 'feed', x: 600, y: 500, count: 4}); assertIntegrity(host.state, true);
  host.action({kind: 'resize', width: 1600, height: 1000}); assertIntegrity(host.state, true);
  host.action({kind: 'clear-food'}); assertIntegrity(host.state, true);
  assert.deepEqual(createSnapshot(restoreSnapshot(before).state, smallSettings), before);
});

test('every authoritative tick matches immutable P3 full-state hashes across all regimes, tubes, senses, food and historical imports', () => {
  const references = JSON.parse(readFileSync(new URL('./fixtures/maintained-grid-p3.json', import.meta.url), 'utf8'));
  assert.equal(references.sourceCommit, 'ff3e786ffa0ac68046fb7a0037c147827f9711c2');
  const cases = gridCompatibilityCases();
  assert.deepEqual(cases.map(c => c.name), references.cases.map((c: {name: string}) => c.name));
  for (const fixture of cases) assert.deepEqual(compatibilityReceipt(fixture), references.cases.find((r: {name: string}) => r.name === fixture.name), fixture.name);
});

test('snapshot split continuation, energy and derived-state reconstruction remain exact across fixtures', () => {
  for (const f of gridCompatibilityCases().filter(f => f.name !== 'branched-rotated-separated')) {
    stepSimulation(f.state, f.settings, 1/60);
    const snapshot = createSnapshot(f.state, f.settings), loaded = restoreSnapshot(snapshot);
    assertIntegrity(loaded.state, true);
    const energy = totalAccountedEnergy(f.state);
    for (let i = 0; i < 3; i++) {stepSimulation(f.state, f.settings, 1/60); stepSimulation(loaded.state, loaded.settings, 1/60);}
    assert.equal(snapshotDigest(loaded.state, loaded.settings), snapshotDigest(f.state, f.settings), f.name);
    assert.ok(Math.abs(totalAccountedEnergy(f.state) - energy) < 1e-6, f.name);
    assertIntegrity(f.state); assertIntegrity(loaded.state);
  }
});
