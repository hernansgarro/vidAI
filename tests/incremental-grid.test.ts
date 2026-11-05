import assert from 'node:assert/strict';
import {test} from 'node:test';
import {GridIntegrityObserver, auditWorldGrid, type GridAuditDiagnostic} from '../gridIntegrityAudit';
import {ensureMaintainedGrid, editSpatialState, type WorldGridValue} from '../maintainedGrid';
import {CentralSpatialGrid, type GridEntry} from '../centralSpatialGrid';
import {createInitialWorld} from '../world';
import {createSnapshot, restoreSnapshot, DEFAULT_SETTINGS, clearFreeNutrients, resizeWorld} from '../persistence';
import {stepSimulation, addNutrients} from '../simulation';
import {SimulationHost} from '../simulationHost';
import {food} from './support/nutrient-cycle';
import {p10Cases} from './support/p10-scenes';
import {setSelfTubes} from '../selfTubes';

const settings = {...DEFAULT_SETTINGS, targetNutrients: 3, inflowRate: 0};
function fixture() {
  const state = createInitialWorld(settings, 105, 'balanced', 'standard', 0);
  const grid = ensureMaintainedGrid(state);
  const entries: GridEntry<WorldGridValue>[] = []; grid.inspectRecords(e => entries.push(e));
  const entity = state.nutrients[0];
  return {state, grid, entity, entry: entries.find(e => e.value.entity === entity)!};
}
const modes = ['wrong-cell','missing','extra','size','category','range','local','duplicate','foreign','overflow','stale-overflow'] as const;
for (const mode of modes) test(`audited targeted repair: ${mode}, original evidence first, independent verification and no physical writes`, () => {
  const f = fixture(), untouched = f.state.nutrients[1];
  let untouchedEntry: unknown; f.grid.inspectRecords(e => {if (e.value.entity === untouched) untouchedEntry = e;});
  if (mode === 'wrong-cell') f.grid.matrix.relocate(f.entry,{left:2000,right:2001,top:1000,bottom:1001});
  if (mode === 'missing') f.grid.remove(f.entity);
  if (mode === 'extra') f.state.nutrients.pop(); // leave other source ranks unchanged
  if (mode === 'size') {f.entity.radius = 600; f.entity.kind = 'carrion';}
  if (mode === 'category') f.grid.matrix.relocate(f.entry,f.entry.value.bounds!,'carrion');
  if (mode === 'range') (f.entry as any)[Object.getOwnPropertySymbols(f.entry)[0]].range = {left:50,right:50,top:50,bottom:50};
  if (mode === 'local') delete (f.entity as any)[Object.getOwnPropertySymbols(f.entity)[0]];
  if (mode === 'duplicate') {
    const extra = f.grid.matrix.createEntry({...f.entry.value},f.entry.kind); f.grid.matrix.register(extra,f.entry.value.bounds!);
    (f.grid as any).records.add({entry:extra});
  }
  if (mode === 'foreign') {
    const other = new CentralSpatialGrid<WorldGridValue>(), extra = other.createEntry({...f.entry.value},f.entry.kind);
    const raw = f.grid.matrix as any; raw.cells.find((c:any)=>c?.nutrient?.has(f.entry)).nutrient.add(extra);
  }
  if (mode === 'overflow') {f.entity.x = 1e200;}
  if (mode === 'stale-overflow') {
    f.grid.matrix.remove(f.entry); (f.grid as any).overflow.add(f.entry);
    f.entity.radius += 800;
  }
  const saved = createSnapshot(f.state,settings), original = auditWorldGrid(f.state);
  assert.ok(original.issueCount>0,mode);
  const events: GridAuditDiagnostic[] = []; let sawOriginal = false;
  const observer = new GridIntegrityObserver(event => {
    if (!events.length) {assert.equal(auditWorldGrid(f.state).issueCount, original.issueCount); sawOriginal = true;}
    events.push(event);
  });
  const result = observer.audit(f.state);
  assert.ok(sawOriginal); assert.equal(result.issueCount,original.issueCount);
  assert.ok(result.repair!.succeeded>0); assert.equal(result.repair!.failed,0);
  assert.equal(result.repair!.remainingIssueCount,0,events.map(e=>e.message).join('\n'));
  assert.equal(auditWorldGrid(f.state).issueCount,0);
  assert.match(events[0].message,/inconsistencies/); assert.match(events.at(-1)!.message,/independent verification 0/);
  assert.deepEqual(createSnapshot(f.state,settings),saved);
  f.grid.inspectRecords(e=>{if(e.value.entity===untouched) assert.equal(e,untouchedEntry);});
});

test('repair failures, unsafe ambiguous identities and incomplete inspection remain visible', () => {
  const f = fixture(); f.grid.remove(f.entity);
  f.grid.repairEntity = () => {throw new Error('injected operation failure');};
  const events: GridAuditDiagnostic[] = [], before = createSnapshot(f.state,settings);
  const result = new GridIntegrityObserver(e=>events.push(e)).audit(f.state);
  assert.equal(result.repair!.failed,1); assert.equal(result.repair!.succeeded,0);
  assert.ok(result.repair!.remainingIssueCount>0); assert.match(events.map(e=>e.message).join('\n'),/injected operation failure/);
  assert.deepEqual(createSnapshot(f.state,settings),before);
  const duplicate = fixture(); duplicate.state.nutrients.push(duplicate.entity);
  const ambiguous = new GridIntegrityObserver(()=>{}).audit(duplicate.state);
  assert.ok(ambiguous.repair!.unsafe>0); assert.ok(ambiguous.repair!.remainingIssueCount>0);
  const malformed = createInitialWorld(settings,55,'balanced','standard',1);
  malformed.organisms[0].genome.parts[0].dimN = -1;
  const incomplete = new GridIntegrityObserver(()=>{}).audit(malformed);
  assert.ok(incomplete.severeIssueCount>0); assert.ok(incomplete.repair!.unsafe>0);
});

test('severe pause is independent, based on original defect and occurs only after verification at a host boundary', () => {
  for (const enabled of [false,true]) for (const periodic of [false,true]) {
    const host = new SimulationHost(); host.reset(createSnapshot(fixture().state,settings),1); host.speed='max';
    host.gridAudit.pauseOnSevere=enabled; host.gridAudit.schedule.setEnabled(periodic,host.state.simTime);
    const grid=ensureMaintainedGrid(host.state); grid.remove(host.state.nutrients[0]);
    const before=host.snapshot(); const result=host.gridAudit.audit(host.state);
    assert.ok(result.severeIssueCount>0); assert.equal(result.repair!.remainingIssueCount,0);
    assert.equal(host.speed,enabled?0:'max'); assert.equal(host.gridAudit.schedule.enabled,periodic);
    assert.deepEqual(host.snapshot(),before); assert.equal(host.frame().gridPauseRequested,enabled?true:undefined);
    assert.equal(host.frame().gridPauseRequested,undefined,'notification is consumed once');
    host.reset(before,2); assert.equal(host.gridAudit.pauseOnSevere,enabled,'session preference survives imports');
    host.speed='max'; host.gridAudit.audit(host.state); assert.equal(host.speed,'max','clean audit never pauses');
  }
  const f=fixture(); f.entry.value.sourceIndex=99;
  const observer=new GridIntegrityObserver(()=>{},()=>{throw new Error('nonsevere must not pause');}); observer.pauseOnSevere=true;
  const result=observer.audit(f.state); assert.equal(result.severeIssueCount,0); assert.equal(result.repair!.remainingIssueCount,0);
});

test('periodic severe pause completes the tick, failed repair still pauses, disabled audit never scans', () => {
  const host=new SimulationHost();host.reset(createSnapshot(fixture().state,settings),1);
  host.gridAudit.pauseOnSevere=true;host.speed='max';host.gridAudit.schedule.setEnabled(true,host.state.simTime-60+1/60);
  host.gridAudit.audit = ((original => (state,trigger) => {
    // Inject at the complete-tick boundary, after all legitimate motion hooks.
    const grid=ensureMaintainedGrid(state);grid.remove(state.nutrients[0]);
    grid.repairEntity=()=>{throw new Error('injected failure');};
    return original(state,trigger);
  })(host.gridAudit.audit.bind(host.gridAudit)));
  host.tick();assert.equal(host.state.simTime,1/60);assert.equal(host.speed,0);
  assert.match(host.frame().diagnostics.map(e=>e.message).join('\n'),/failed 1/);
  const idle=new SimulationHost();idle.reset(createSnapshot(fixture().state,settings),1);idle.gridAudit.pauseOnSevere=true;
  idle.gridAudit.audit=()=>{throw new Error('disabled audit ran');};
  for(let i=0;i<5;i++) idle.tick();
});

test('normal initialized ticks, inflow, clear, resize and topology edits never invoke global reconciliation',()=>{
  for(const count of [0,2]) {
    const state=createInitialWorld(settings,73,'balanced','standard',count),grid=ensureMaintainedGrid(state);
    stepSimulation(state,settings,1/60); // explicit first kernel preparation
    grid.synchronize=()=>{throw new Error('global reconciliation in normal upkeep');};
    for(let i=0;i<12;i++){stepSimulation(state,settings,1/60);assert.equal(auditWorldGrid(state).issueCount,0);}
    clearFreeNutrients(state);addNutrients(state,settings,3);resizeWorld(state,settings,2300,1400);
    setSelfTubes(state,{...settings,worldWidth:2300,worldHeight:1400},{version:1,connected:true,accepted:[0]});
    assert.equal(auditWorldGrid(state).issueCount,0);
    stepSimulation(state,{...settings,worldWidth:2300,worldHeight:1400},1/60);
    assert.equal(auditWorldGrid(state).issueCount,0);
  }
});

test('explicit external transactions and automatic roster replacement preserve headless continuation',()=>{
  const f=fixture();stepSimulation(f.state,settings,1/60);
  editSpatialState(f.state,()=>{
    f.state.nutrients.reverse(); f.state.nutrients[0].radius=400;f.state.nutrients[0].x=128;
  });
  assert.equal(auditWorldGrid(f.state).issueCount,0);
  f.state.nutrients=[food(3000,true,80,80)]; // supported raw whole-roster replacement at next tick
  const control=restoreSnapshot(createSnapshot(f.state,settings));
  stepSimulation(f.state,settings,1/60);stepSimulation(control.state,control.settings,1/60);
  assert.deepEqual(createSnapshot(f.state,settings),createSnapshot(control.state,control.settings));
  assert.equal(auditWorldGrid(f.state).issueCount,0);
});

for(const f of p10Cases()) test(`all consumer/lifecycle hooks current without repeated reconciliation: ${f.name}`,()=>{
  const restored=restoreSnapshot(createSnapshot(f.state,f.settings));
  stepSimulation(f.state,f.settings,f.dt);stepSimulation(restored.state,restored.settings,f.dt);
  const grid=ensureMaintainedGrid(f.state);grid.synchronize=()=>{throw new Error('unexpected repeated reconciliation');};
  for(let i=1;i<f.ticks;i++) {
    stepSimulation(f.state,f.settings,f.dt);stepSimulation(restored.state,restored.settings,f.dt);
    assert.equal(auditWorldGrid(f.state).issueCount,0,f.name);
    assert.deepEqual(createSnapshot(f.state,f.settings),createSnapshot(restored.state,restored.settings));
  }
});

test('body-part/coarse anatomy repairs and counter-only recovery preserve untouched entries and physical state',()=>{
  for(const mode of ['part-pose','part-owner','coarse-anatomy','counters']) {
    const state=createInitialWorld(settings,73,'balanced','standard',2),grid=ensureMaintainedGrid(state);
    const entries:GridEntry<WorldGridValue>[]=[];grid.inspectRecords(e=>entries.push(e));
    const org=state.organisms[0],part=entries.find(e=>e.value.entity===org.segments[0])!;
    if(mode==='part-pose')org.segments[0].angle+=.5;
    if(mode==='part-owner')part.value.organism=state.organisms[1];
    if(mode==='coarse-anatomy') {
      const def=org.genome.parts[0];def.dimN=def.dimN===10?9:def.dimN+1;def.width=def.dimN*7;
    }
    if(mode==='counters') {const raw=grid.matrix as any;raw.entries++;raw.memberships++;raw.occupied++;}
    const before=createSnapshot(state,settings),untouched=entries.filter(e=>e.value.entity===state.organisms[1]||state.organisms[1].segments.some(p=>p===e.value.entity));
    const result=new GridIntegrityObserver(()=>{}).audit(state);
    assert.ok(result.issueCount>0);assert.ok(result.repair!.succeeded>0);assert.equal(result.repair!.remainingIssueCount,0,mode);
    assert.deepEqual(createSnapshot(state,settings),before);
    const after=new Set<GridEntry<WorldGridValue>>();grid.inspectRecords(e=>after.add(e));
    for(const e of untouched)assert.ok(after.has(e));
  }
});


test('invalid authoritative anatomy remains unsafe, physically unchanged and eligible for severe pause',()=>{
  const state=createInitialWorld(settings,73,'balanced','standard',2);
  state.organisms[0].genome.parts[0].width+=500;
  const before=createSnapshot(state,settings),events:GridAuditDiagnostic[]=[];
  let paused=false;
  const observer=new GridIntegrityObserver(event=>events.push(event),()=>{paused=true;});observer.pauseOnSevere=true;
  const result=observer.audit(state);
  assert.match(result.details.join('\n'),/Invalid envelope part geometry/);
  assert.ok(result.severeIssueCount>0);assert.equal(result.repair!.attempted,0);
  assert.equal(result.repair!.succeeded,0);assert.ok(result.repair!.unsafe>0);
  assert.ok(result.repair!.remainingIssueCount>0);assert.ok(paused);
  assert.deepEqual(createSnapshot(state,settings),before);
  assert.match(events.at(-1)!.message,/requesting authoritative 0x pause/);
});
