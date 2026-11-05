import assert from 'node:assert/strict';
import {test} from 'node:test';
import {auditWorldGrid, GridAuditSchedule, GridIntegrityObserver, GRID_AUDIT_DETAIL_LIMIT, gridAuditDiagnostics} from '../gridIntegrityAudit';
import {CentralSpatialGrid, type GridEntry} from '../centralSpatialGrid';
import {ensureMaintainedGrid, MaintainedWorldGrid, type WorldGridValue} from '../maintainedGrid';
import {createInitialWorld} from '../world';
import {createSnapshot, restoreSnapshot, DEFAULT_SETTINGS} from '../persistence';
import {stepSimulation} from '../simulation';
import {SimulationHost} from '../simulationHost';
import {gridCompatibilityCases, snapshotDigest} from './support/maintained-grid-compatibility';
import {food} from './support/nutrient-cycle';
import {readFileSync} from 'node:fs';

const config = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0};
const fixture = () => {
  const state = createInitialWorld(config, 51, 'balanced', 'standard', 0);
  state.nutrients.push(food(3000, false, 80, 80));
  const grid = ensureMaintainedGrid(state); grid.synchronize();
  const entries: GridEntry<WorldGridValue>[] = []; grid.inspectRecords(e => entries.push(e));
  return {state, grid, entry: entries[0]};
};
const messages = (s: ReturnType<typeof fixture>['state']) => auditWorldGrid(s).details.join('\n');
function dump(grid: MaintainedWorldGrid) {
  const records: unknown[] = [], cells: unknown[] = [], overflow: unknown[] = [];
  grid.inspectRecords((e, matches) => records.push([e, matches, e.kind, e.registered,
    {...e.cellRange}, {...e.value.bounds}, e.value.entity, e.value.organism, e.value.sourceIndex, e.value.partIndex,
    {...(e as any)[Object.getOwnPropertySymbols(e)[0]]}]));
  grid.matrix.inspectCells((x,y,k,entries) => cells.push([x,y,k,[...entries]]));
  grid.inspectOverflow(e => overflow.push(e));
  return {records, cells, overflow, stamp: (grid.matrix as any).stamp, entries: grid.entryCount,
    count: grid.matrix.membershipCount, occupied: grid.matrix.occupiedCellCount};
}

test('independent audit detects missing, extra, wrong cell/category/rank/bounds and stale owner references without repair', () => {
  const cases: Array<[string, (f: ReturnType<typeof fixture>) => void, RegExp]> = [
    ['missing', f => f.grid.remove(f.state.nutrients[0]), /Missing food/],
    ['extra', f => {f.state.nutrients.length = 0;}, /Extra\/stale entity reference/],
    ['wrong cell', f => f.grid.matrix.relocate(f.entry, {left: 800, right: 801, top: 800, bottom: 801}), /Wrong cell/],
    ['wrong category', f => f.grid.matrix.relocate(f.entry, f.entry.value.bounds!, 'carrion'), /Misclassified/],
    ['stale rank', f => {f.entry.value.sourceIndex = 55;}, /Stale source rank/],
    ['stale owner', f => {f.entry.value.organism = {} as any;}, /Stale source rank\/owner/],
    ['stale bounds', f => {f.entry.value.bounds!.left += 1;}, /Stale bounds/],
    ['missing registration', f => f.grid.matrix.remove(f.entry), /Missing registration/],
    ['stale local', f => {delete (f.state.nutrients[0] as any)[Object.getOwnPropertySymbols(f.state.nutrients[0])[0]];}, /Stale entity-local/],
    ['replaced entity', f => {f.state.nutrients[0] = {...f.state.nutrients[0]};}, /Extra\/stale entity reference/],
    ['untracked movement', f => {f.state.nutrients[0].x += 500;}, /Stale bounds/],
    ['untracked category', f => {f.state.nutrients[0].kind = 'carrion';}, /Misclassified/],
  ];
  for (const [name, inject, pattern] of cases) {
    const f = fixture(); assert.equal(auditWorldGrid(f.state).issueCount, 0, name);
    inject(f); const before = dump(f.grid), saved = createSnapshot(f.state, config);
    assert.match(messages(f.state), pattern, name); assert.ok(auditWorldGrid(f.state).issueCount > 0);
    assert.deepEqual(dump(f.grid), before, `${name}: no grid repair or query stamp change`);
    assert.deepEqual(createSnapshot(f.state, config), saved, `${name}: no physical mutation`);
  }
});

test('raw inspection finds duplicate memberships/handles, stale buckets, foreign owners and corrupt counters', () => {
  for (const mode of ['duplicate', 'duplicate-handle', 'stale-bucket', 'foreign', 'counter', 'range', 'bucket-kind']) {
    const f = fixture(), raw = f.grid.matrix as any;
    const slot = raw.cells.findIndex((c: any) => c?.nutrient?.has(f.entry));
    const bucket = raw.cells[slot].nutrient;
    if (mode === 'duplicate') raw.cells[slot].nutrient = [f.entry, f.entry];
    if (mode === 'duplicate-handle') {
      const extra = f.grid.matrix.createEntry({...f.entry.value}, 'nutrient'); f.grid.matrix.register(extra, f.entry.value.bounds!);
      (f.grid as any).records.add({entry: extra});
    }
    if (mode === 'stale-bucket') (f.grid as any).records.clear();
    if (mode === 'foreign') {const e = new CentralSpatialGrid<WorldGridValue>().createEntry(f.entry.value, 'nutrient'); bucket.add(e);}
    if (mode === 'counter') {raw.entries++; raw.memberships++; raw.occupied++;}
    if (mode === 'range') {(f.entry as any)[Object.getOwnPropertySymbols(f.entry)[0]].range = {left: 50,right:50,top:50,bottom:50};}
    if (mode === 'bucket-kind') {raw.cells[slot].carrion = bucket; delete raw.cells[slot].nutrient;}
    const result = auditWorldGrid(f.state); assert.ok(result.issueCount > 0, mode);
    assert.match(result.details.join('\n'), /Duplicate|Stale|stale|Foreign|foreign|counter|range|Misclassified/, mode);
  }
});

test('all views, exact edges/rotation/tubes, duplicate IDs and legitimate overflow are accepted', () => {
  for (const f of gridCompatibilityCases()) {
    ensureMaintainedGrid(f.state).synchronize();
    for (let i = 0; i <= f.ticks; i++) {
      assert.equal(auditWorldGrid(f.state).issueCount, 0, `${f.name}/${i}: ${messages(f.state)}`);
      if (i < f.ticks) stepSimulation(f.state, f.settings, 1/60);
    }
  }
  const f = fixture();
  for (const x of [-1e200, -300, 0, 128, 5100, 1e200]) f.state.nutrients.push({...food(100, true, x, 128), id: 'same'});
  f.grid.synchronize(); const good = auditWorldGrid(f.state);
  assert.equal(good.issueCount, 0, good.details.join('\n')); assert.ok(good.overflowEntries >= 3);
  f.state.nutrients[0].x = Infinity; f.grid.synchronize();
  assert.equal(auditWorldGrid(f.state).issueCount, 0, 'nonfinite transient unconditional candidate is intentional');
  (f.grid as any).overflow.delete(f.entry);
  assert.match(messages(f.state), /unconditional candidate/);
});

test('budget overflow is valid even when later relocations release capacity; corrupt overflow is reported', () => {
  const f = fixture();
  // Controlled derived-budget restriction exercises the actual authoritative grid.
  const raw = f.grid as any;
  Object.defineProperty(f.grid.matrix, 'membershipLimit', {value: 1});
  f.state.nutrients.push(food(3000, false, 80, 80)); f.grid.synchronize();
  assert.equal(auditWorldGrid(f.state).issueCount, 0); assert.equal(f.grid.overflowCount, 1);
  f.grid.matrix.remove(f.entry); raw.overflow.add(f.entry);
  assert.equal(auditWorldGrid(f.state).issueCount, 0, 'budget-history overflow need not currently exhaust capacity');
  raw.overflow.add(f.grid.matrix.createEntry({...f.entry.value}, 'nutrient'));
  assert.match(messages(f.state), /Extra\/stale overflow/);
});

test('fresh body/creature reference detects stale pose, anatomy, view and part ownership', () => {
  for (const mode of ['pose', 'anatomy', 'view', 'owner']) {
    const state = createInitialWorld(config, 91, 'balanced', 'standard', 1), grid = ensureMaintainedGrid(state);
    const entries: GridEntry<WorldGridValue>[] = []; grid.inspectRecords(e => entries.push(e));
    const part = entries.find(e => e.value.view === 'body-part')!;
    if (mode === 'pose') state.organisms[0].segments[0].angle += .5;
    if (mode === 'anatomy') {state.organisms[0].genome.parts[0].width += 7; state.organisms[0].genome.parts[0].dimN++;}
    if (mode === 'view') (part.value as any).view = 'organism';
    if (mode === 'owner') part.value.organism = {...state.organisms[0]};
    assert.ok(auditWorldGrid(state).issueCount > 0, mode);
  }
});

test('audit and logging preserve exact historical snapshots, PRNG, grid internals and continuation', () => {
  const baseline = JSON.parse(readFileSync(new URL('./fixtures/maintained-grid-p3.json', import.meta.url), 'utf8'));
  const references = new Map(baseline.cases.map((r: any) => [r.name, r.hashes]));
  for (const f of gridCompatibilityCases()) {
    const control = restoreSnapshot(createSnapshot(f.state, f.settings));
    const grid = ensureMaintainedGrid(f.state); grid.synchronize();
    const initial = createSnapshot(f.state, f.settings);
    for (let i=0; i<=f.ticks; i++) {
      const before = dump(grid), saved = createSnapshot(f.state, f.settings);
      const observed: unknown[] = [];
      const observer = new GridIntegrityObserver(event => observed.push(event));
      assert.equal(observer.audit(f.state).issueCount, 0, f.name);
      assert.deepEqual(dump(grid), before); assert.deepEqual(createSnapshot(f.state, f.settings), saved);
      assert.equal(snapshotDigest(f.state, f.settings), (references.get(f.name) as string[])[i], f.name);
      assert.deepEqual(saved, createSnapshot(control.state, control.settings));
      if (i<f.ticks) {stepSimulation(f.state,f.settings,1/60); stepSimulation(control.state, control.settings,1/60);}
    }
    assert.deepEqual(createSnapshot(restoreSnapshot(initial).state, f.settings), initial);
  }
});

test('simulated 60-second schedule is opt-in, pause/speed independent and resets without catch-up bursts', () => {
  const clock = new GridAuditSchedule(); assert.equal(clock.due(1e6), false);
  clock.setEnabled(true, 17); assert.equal(clock.due(76.98), false);
  for (let i=0;i<20;i++) assert.equal(clock.due(17), false, 'paused time never advances');
  assert.equal(clock.due(77), true); assert.equal(clock.due(77), false);
  clock.setEnabled(true, 80); assert.equal(clock.due(137), true, 'repeated config does not postpone');
  assert.equal(clock.due(10000), true); assert.equal(clock.due(10000), false, 'no catch-up');
  clock.reset(5); assert.equal(clock.due(64.99), false); assert.equal(clock.due(65), true);
  clock.setEnabled(false, 70); assert.equal(clock.due(100000), false);
  clock.setEnabled(true, 100); assert.equal(clock.due(160), true);
});

test('host periodic/manual audit, imports and bounded transport do not change saved simulation or tick results', () => {
  const source = createSnapshot(createInitialWorld(config, 91, 'balanced', 'standard', 0), config);
  const observed = new SimulationHost(), control = new SimulationHost();
  observed.reset(source, 1); control.reset(source, 1);
  observed.gridAudit.schedule.setEnabled(true, observed.state.simTime);
  for (let i=0;i<3600;i++) {observed.tick(); control.tick();}
  assert.deepEqual(observed.snapshot(), control.snapshot());
  const diagnostics = observed.frame().diagnostics;
  assert.equal(diagnostics.length, 1); assert.match(diagnostics[0].message, /periodic.*t=60.000s.*passed/);
  assert.deepEqual(observed.frame().diagnostics, []);
  for (let i=0;i<200;i++) observed.gridAudit.audit(observed.state);
  assert.equal(observed.frame().diagnostics.length, 65, '64 events plus dropped-count summary');
  assert.deepEqual(observed.snapshot(), control.snapshot());
  observed.reset(source, 2); assert.ok(observed.gridAudit.schedule.enabled);
  for (let i=0;i<3599;i++) observed.tick();
  assert.deepEqual(observed.frame().diagnostics, []);
  observed.gridAudit.audit(observed.state); observed.tick();
  assert.equal(observed.frame().diagnostics.length, 2, 'manual does not postpone periodic deadline');
});

test('details and event payloads are bounded; auditor failures are reported and observer failures isolated', () => {
  const f = fixture();
  for (let i=0; i<200; i++) f.state.nutrients.push({...food(10, false, 80, 80), id: 'duplicate'});
  const report = auditWorldGrid(f.state); assert.equal(report.details.length, GRID_AUDIT_DETAIL_LIMIT);
  assert.equal(report.issueCount, 200);
  const events = gridAuditDiagnostics(report, 'manual'); assert.equal(events.length, GRID_AUDIT_DETAIL_LIMIT+2);
  assert.equal(events.at(-1)!.severity, 'warning'); assert.ok(events.every(e => e.message.length < 2048));
  assert.doesNotThrow(() => new GridIntegrityObserver(() => {throw new Error('subscriber');}).audit(f.state));
  const state = createInitialWorld(config, 91, 'balanced', 'standard', 1);
  state.organisms[0].genome.parts[0].dimN = -1;
  assert.match(messages(state), /Audit could not complete/);
});
