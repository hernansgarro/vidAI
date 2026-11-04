import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {DiagnosticEventStore, DIAGNOSTIC_HISTORY_LIMIT, DIAGNOSTIC_MESSAGE_LIMIT,
  DIAGNOSTIC_SUBSYSTEM_LIMIT, filterDiagnosticEvents, type DiagnosticInput} from '../diagnosticEvents';
import {createInitialWorld} from '../world';
import {DEFAULT_SETTINGS, createSnapshot, restoreSnapshot} from '../persistence';
import {stepSimulation} from '../simulation';

const info = (message: string): DiagnosticInput => ({severity: 'info', subsystem: 'runtime', message});

test('event fields are immutable scalar copies with a display-only timestamp', () => {
  const store = new DiagnosticEventStore(undefined, () => 1234);
  const input = info('Started');
  const event = store.record(input)!;
  input.message = 'changed'; input.subsystem = 'changed';
  assert.deepEqual(event, {id: 1, timestamp: 1234, severity: 'info', subsystem: 'runtime', message: 'Started'});
  assert.ok(Object.isFrozen(event)); assert.ok(Object.isFrozen(store.getSnapshot()));
  assert.throws(() => {(event as any).message = 'changed';});
  assert.equal(store.capacity, DIAGNOSTIC_HISTORY_LIMIT);
  assert.deepEqual(Object.keys(event).sort(), ['id', 'timestamp', 'severity', 'subsystem', 'message'].sort());
});

test('fixed ring retains precisely the latest events across many wraps in source order', () => {
  for (const capacity of [1, 2, 7, DIAGNOSTIC_HISTORY_LIMIT]) {
    const store = new DiagnosticEventStore(capacity, () => 0);
    for (let i = 1; i <= 1000; i++) {
      store.record(info(String(i)));
      const rows = store.getSnapshot();
      assert.equal(rows.length, Math.min(i, capacity));
      assert.equal(rows[0].message, String(Math.max(1, i - capacity + 1)));
      assert.equal(rows.at(-1)!.message, String(i));
      assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
    }
  }
});

test('clear releases history without reusing IDs, and immutable prior snapshots stay stable', () => {
  const store = new DiagnosticEventStore(2);
  store.record(info('a')); store.record(info('b'));
  const old = store.getSnapshot(); store.clear();
  assert.deepEqual(store.getSnapshot(), []); assert.equal(old.length, 2);
  store.record(info('c'));
  assert.equal(store.getSnapshot()[0].id, 3);
  assert.deepEqual(old.map(row => row.message), ['a', 'b']);
});

test('bounded text and rejected malformed packets cannot grow or corrupt history', () => {
  const store = new DiagnosticEventStore();
  const row = store.record({severity: 'warning', subsystem: 'x'.repeat(1000), message: 'y'.repeat(100000)})!;
  assert.equal(row.message.length, DIAGNOSTIC_MESSAGE_LIMIT);
  assert.equal(row.subsystem.length, DIAGNOSTIC_SUBSYSTEM_LIMIT);
  const initial = store.getSnapshot();
  for (const bad of [null, {}, {severity: 'debug'}, {...info(''), message: '  '},
    {...info('ok'), subsystem: '  '}, {...info('ok'), subsystem: {}}, {...info('ok'), message: {}},
    {...info('ok'), severity: 'fatal'}, {get severity() {throw new Error('bad packet');}}]) {
    assert.doesNotThrow(() => assert.equal(store.record(bad as DiagnosticInput), undefined));
  }
  assert.equal(store.getSnapshot(), initial);
  for (const clock of [() => NaN, () => Infinity, () => 8.64e15 + 1, () => {throw new Error('clock');}])
    assert.equal(new DiagnosticEventStore(2, clock).record(info('ok')), undefined);
  for (const capacity of [0, -1, 1.5, 2001, Infinity, NaN]) assert.throws(() => new DiagnosticEventStore(capacity));
});

test('filters combine exact severity and subsystem without changing retention or ordering', () => {
  const store = new DiagnosticEventStore();
  store.record(info('start'));
  store.record({severity: 'warning', subsystem: 'worker', message: 'fallback'});
  store.record({severity: 'error', subsystem: 'grid-integrity', message: 'Future producer fixture only'});
  store.record({severity: 'error', subsystem: 'worker', message: 'failure'});
  const rows = store.getSnapshot();
  assert.equal(filterDiagnosticEvents(rows, {}).length, 4);
  assert.deepEqual(filterDiagnosticEvents(rows, {severity: 'error'}).map(row => row.id), [3, 4]);
  assert.deepEqual(filterDiagnosticEvents(rows, {subsystem: 'worker'}).map(row => row.id), [2, 4]);
  assert.deepEqual(filterDiagnosticEvents(rows, {severity: 'error', subsystem: 'worker'}).map(row => row.id), [4]);
  assert.deepEqual(filterDiagnosticEvents(rows, {subsystem: 'absent'}), []);
  assert.equal(store.getSnapshot(), rows);
});

test('subscriptions notify mutations, unsubscribe cleanly, and isolate failing observers', () => {
  const store = new DiagnosticEventStore();
  let notifications = 0;
  const initial = store.getSnapshot();
  const bad = store.subscribe(() => {throw new Error('observer failure');});
  const stop = store.subscribe(() => {notifications++; assert.ok(store.getSnapshot());});
  store.clear(); assert.equal(notifications, 0);
  assert.doesNotThrow(() => store.record(info('record')));
  const next = store.getSnapshot(); assert.notEqual(next, initial); assert.equal(next, store.getSnapshot());
  assert.equal(notifications, 1);
  store.record({} as DiagnosticInput); assert.equal(notifications, 1);
  stop(); stop(); bad(); store.clear(); store.record(info('closed-console'));
  assert.equal(notifications, 1);
  assert.equal(store.getSnapshot()[0].message, 'closed-console');
});

test('logging/filtering/clearing between ticks preserves exact physical, neural, energy and PRNG state', () => {
  const settings = {...DEFAULT_SETTINGS, targetNutrients: 10, inflowRate: 0};
  const initial = createSnapshot(createInitialWorld(settings, 73, 'balanced', 'standard', 2), settings);
  const control = restoreSnapshot(initial), observed = restoreSnapshot(initial);
  const store = new DiagnosticEventStore(4, () => 1720000000000);
  for (let i = 0; i < 24; i++) {
    stepSimulation(control.state, settings, 1 / 60);
    store.record({severity: 'error', subsystem: 'grid-integrity', message: `Fixture event ${i}`});
    filterDiagnosticEvents(store.getSnapshot(), {severity: 'error'});
    if (i % 3 === 0) store.clear();
    stepSimulation(observed.state, settings, 1 / 60);
  }
  assert.deepEqual(createSnapshot(observed.state, settings), createSnapshot(control.state, settings));
  assert.deepEqual(initial, createSnapshot(restoreSnapshot(initial).state, settings));
});

test('P3 has no kernel, Worker, persistence or P1/P2 wiring', () => {
  const storeSource = readFileSync(new URL('../diagnosticEvents.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(storeSource, /^import /m);
  for (const file of ['simulation.ts', 'simulation.worker.ts', 'simulationHost.ts', 'simulationClient.ts',
    'contacts.ts', 'persistence.ts', 'centralSpatialGrid.ts', 'creatureEnvelope.ts']) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /from\s+['"].*(?:diagnosticEvents|DiagnosticsConsole)['"]/);
  }
});
