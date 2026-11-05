import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CentralSpatialGrid, GRID_KINDS, GRID_CELL_SIZE, MAX_AQUARIUM_GRID_BOUNDS, type GridEntry, type GridKind} from '../centralSpatialGrid';
import {OrderedSpatialIndex, type SpatialBounds} from '../spatialIndex';
import {readFileSync, readdirSync} from 'node:fs';

const box = (left: number, top = left, right = left, bottom = top): SpatialBounds => ({left, top, right, bottom});
const ids = (entries: GridEntry<number>[]) => entries.map(e => e.value).sort((a, b) => a - b);
const overlap = (a: SpatialBounds, b: SpatialBounds) => a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
function segmentHitsBox(ray: readonly [number, number, number, number], b: SpatialBounds): boolean {
  let lo = 0, hi = 1;
  for (const [start, end, min, max] of [[ray[0], ray[2], b.left, b.right], [ray[1], ray[3], b.top, b.bottom]]) {
    const delta = end - start;
    if (delta === 0) {if (start < min || start > max) return false;}
    else {
      const a = (min - start) / delta, c = (max - start) / delta;
      lo = Math.max(lo, Math.min(a, c)); hi = Math.min(hi, Math.max(a, c));
      if (lo > hi) return false;
    }
  }
  return true;
}

test('maximum aquarium and both tube ends fit a fixed direct matrix with lazy bounded storage', () => {
  const grid = new CentralSpatialGrid<number>();
  assert.equal(GRID_CELL_SIZE, 128);
  assert.deepEqual(grid.capacity, {left: -300, right: 5100, top: 0, bottom: 3000});
  assert.deepEqual(grid.cellRange, {left: -3, right: 39, top: -1, bottom: 23});
  assert.equal(grid.columns, 43); assert.equal(grid.rows, 25); assert.equal(grid.cellCount, 1075);
  assert.equal(grid.occupiedCellCount, 0); assert.equal(grid.membershipCount, 0);
  const bounds = [box(-300, 0), box(0, 0), box(4800, 3000), box(5100, 3000), box(2700, 1000)];
  bounds.forEach((b, i) => grid.register(grid.createEntry(i, 'nutrient'), b));
  bounds.forEach((b, i) => assert.ok(ids(grid.queryBounds(b)).includes(i)));
  assert.deepEqual(ids(grid.queryCells(grid.cellRange)), [0, 1, 2, 3, 4]);
  assert.equal(grid.cellCount, 1075, 'Occupancy and current world size cannot resize capacity');
  assert.ok(Object.isFrozen(grid.capacity)); assert.ok(Object.isFrozen(grid.cellRange));
  const settings = readFileSync(new URL('../persistence.ts', import.meta.url), 'utf8');
  const ui = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  const tubes = readFileSync(new URL('../selfTubes.ts', import.meta.url), 'utf8');
  assert.match(settings, /\['worldWidth', 800, 4800\].*\['worldHeight', 600, 3000\]/);
  assert.match(ui, /aria-label="Tank width"[^\n]*max="4800"/);
  assert.match(ui, /aria-label="Tank height"[^\n]*max="3000"/);
  assert.match(tubes, /TUBE_DEPTH = 300/);
});

test('invalid capacities, coordinates, kinds and budget overflow reject before mutation', () => {
  for (const b of [box(NaN), box(Infinity), box(1, 0, 0, 1), box(0, 2, 1, 1), box(-1e12, -1e12, 1e12, 1e12)])
    assert.throws(() => new CentralSpatialGrid(b), RangeError);
  for (const limit of [0, -1, 1.5, NaN, Infinity, 262145]) assert.throws(() => new CentralSpatialGrid(undefined, limit));
  const grid = new CentralSpatialGrid<number>(undefined, 2), e = grid.createEntry(1, 'egg');
  assert.throws(() => grid.register(e, box(-301, 1)), /outside/);
  assert.throws(() => grid.register(e, box(1, 1, 5101, 3000)), /outside/);
  assert.throws(() => grid.register(e, box(1, -1)), /outside/);
  assert.throws(() => grid.register(e, box(1, 3001)), /outside/);
  assert.throws(() => grid.register(e, box(0, 0, 400, 400)), /budget/);
  assert.equal(e.registered, false); assert.equal(grid.entryCount, 0); assert.equal(grid.membershipCount, 0);
  grid.register(e, box(1, 1)); const old = e.cellRange;
  assert.throws(() => grid.relocate(e, box(0, 0, 400, 400), 'nutrient'), /budget/);
  assert.throws(() => grid.relocate(e, box(2), 'unknown' as GridKind), /kind/);
  assert.equal(e.cellRange, old); assert.equal(e.kind, 'egg'); assert.deepEqual(ids(grid.queryBounds(box(1))), [1]);
  assert.throws(() => grid.createEntry(2, 'unknown' as GridKind), /kind/);
  assert.throws(() => grid.queryBounds(box(2, 1, 1, 1)));
  assert.throws(() => grid.queryBounds(box(NaN)));
  assert.throws(() => grid.queryCells({left: .5, right: 1, top: 0, bottom: 1}));
  assert.throws(() => grid.queryCells(grid.cellRange, ['unknown' as GridKind]));
  assert.throws(() => grid.queryRay(0, 0, Infinity, 0));
  assert.throws(() => grid.queryRay(-Number.MAX_VALUE, 0, Number.MAX_VALUE, 0));
});

test('caller-local handles reject duplicate registration, stale operations and another grid', () => {
  const a = new CentralSpatialGrid<number>(), b = new CentralSpatialGrid<number>();
  const e = a.createEntry(9, 'body-part');
  assert.throws(() => a.remove(e)); assert.throws(() => a.relocate(e, box(1)));
  assert.throws(() => b.register(e, box(1)));
  a.register(e, box(1)); assert.throws(() => a.register(e, box(1)));
  assert.throws(() => b.remove(e)); assert.throws(() => b.relocate(e, box(2)));
  assert.equal(a.entryCount, 1); assert.equal(b.entryCount, 0);
  a.remove(e); assert.equal(e.cellRange, undefined); assert.equal(e.registered, false);
  assert.throws(() => a.remove(e)); assert.throws(() => a.relocate(e, box(2)));
  a.register(e, box(512)); assert.deepEqual(ids(a.queryBounds(box(512))), [9]);
});

test('typed queries deduplicate across kinds and cells, retaining other same-kind occupants on removal', () => {
  const grid = new CentralSpatialGrid<number>();
  const entries = GRID_KINDS.map((kind, i) => grid.createEntry(i, kind));
  for (const e of entries) grid.register(e, box(0, 0, 400, 400));
  const second = grid.createEntry(10, 'egg'); grid.register(second, box(128));
  assert.deepEqual(ids(grid.queryBounds(box(0, 0, 1000, 1000))), [0, 1, 2, 3, 4, 10]);
  assert.deepEqual(ids(grid.queryBounds(box(128), ['egg', 'egg', 'carrion'])), [1, 2, 10]);
  assert.deepEqual(grid.queryCells(grid.cellRange, []), []);
  for (let i = 0; i < GRID_KINDS.length; i++) {
    const kind = GRID_KINDS[i];
    assert.deepEqual(ids(grid.queryBounds(box(128), [kind])), kind === 'egg' ? [i, 10] : [i]);
  }
  grid.remove(entries[2]); assert.deepEqual(ids(grid.queryBounds(box(128), ['egg'])), [10]);
  entries.filter((_, i) => i !== 2).forEach(e => grid.remove(e)); grid.remove(second);
  assert.equal(grid.entryCount, 0); assert.equal(grid.membershipCount, 0); assert.equal(grid.occupiedCellCount, 0);
});

test('same-cell poses, partial/disjoint moves, growth, shrinkage and category transitions retain exact memberships', () => {
  const grid = new CentralSpatialGrid<number>(); const e = grid.createEntry(1, 'organism');
  grid.register(e, box(10, 10, 100, 100)); const range = e.cellRange;
  assert.equal(grid.relocate(e, box(20, 30, 110, 120)), false);
  assert.equal(e.cellRange, range); assert.equal(grid.membershipCount, 1);
  for (const b of [box(10, 10, 300, 300), box(150, 150, 400, 400), box(2000, 1000, 2300, 1200), box(2100, 1100)]) {
    assert.equal(grid.relocate(e, b), true);
    const r = e.cellRange!, expected = (r.right - r.left + 1) * (r.bottom - r.top + 1);
    assert.equal(grid.membershipCount, expected); assert.equal(grid.occupiedCellCount, expected);
    for (let y = grid.cellRange.top; y <= grid.cellRange.bottom; y++) for (let x = grid.cellRange.left; x <= grid.cellRange.right; x++) {
      const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      assert.deepEqual(ids(grid.queryCells({left: x, right: x, top: y, bottom: y})), inside ? [1] : []);
    }
  }
  const b = box(2100, 1100); assert.equal(grid.relocate(e, b, 'carrion'), true);
  assert.deepEqual(grid.queryBounds(b, ['organism']), []); assert.deepEqual(ids(grid.queryBounds(b, ['carrion'])), [1]);
  assert.equal(grid.membershipCount, 1); grid.remove(e); assert.equal(grid.occupiedCellCount, 0);
});

test('inclusive edges, zero-area boxes, negative cells, huge queries and expanded capacity have no missing hits', () => {
  const grid = new CentralSpatialGrid<number>({left: -1024, top: -1024, right: 5500, bottom: 3500});
  const bounds = [box(128), box(-128), box(-1000, -1000, 1000, 1000), box(5200, 3100), box(256, 0, 258, 128)];
  bounds.forEach((b, i) => grid.register(grid.createEntry(i, 'nutrient'), b));
  const queries = [box(128), box(-128), box(-2000, -2000, 6000, 4000), box(5200, 3100), box(-2000, 0, -1500, 10)];
  const old = new OrderedSpatialIndex(bounds);
  for (const q of queries) {
    const found = ids(grid.queryBounds(q));
    assert.deepEqual(found, old.queryBounds(q.left, q.top, q.right, q.bottom));
    bounds.forEach((b, i) => {if (overlap(q, b)) assert.ok(found.includes(i));});
  }
  assert.deepEqual(ids(grid.queryBounds(box(-1e9, -1e9, 1e9, 1e9))), bounds.map((_, i) => i));
  assert.deepEqual(grid.queryBounds(box(1e9)), []);
  assert.ok(MAX_AQUARIUM_GRID_BOUNDS.left > grid.capacity.left);
});

test('ray corridors equal the old index for tangencies, reversal, points, long diagonals and outside rays', () => {
  const referenceBox = box(10, 10, 20, 20);
  for (const [ray, expected] of [
    [[0, 0, 30, 30], true], [[0, 10, 30, 10], true], [[20, 20, 20, 20], true],
    [[0, 9, 30, 9], false], [[9, 0, 9, 30], false], [[21, 21, 21, 21], false],
  ] as const) assert.equal(segmentHitsBox(ray, referenceBox), expected, 'Independently validate the full-scan ray reference');
  const grid = new CentralSpatialGrid<number>({left: -1024, top: -1024, right: 5500, bottom: 3500});
  const bounds = [box(128), box(-512, -512, 512, 512), box(500, 500, 510, 510), box(0, 900, 10, 910), box(5000, 128)];
  bounds.forEach((b, i) => grid.register(grid.createEntry(i, i % 2 ? 'egg' : 'nutrient'), b));
  const old = new OrderedSpatialIndex(bounds);
  for (const ray of [[0, 128, 512, 128], [128, -512, 128, 512], [128, 128, 128, 128], [-128, -128, 128, 128],
    [0, 0, 1000, 1000], [-2000, -2000, -1500, -1500], [-1e6, 128, 1e6, 128]]) {
    const [x0, y0, x1, y1] = ray;
    const found = ids(grid.queryRay(x0, y0, x1, y1));
    assert.deepEqual(found, old.query(x0, y0, x1, y1));
    assert.deepEqual(ids(grid.queryRay(x1, y1, x0, y0)), found);
    assert.deepEqual(ids(grid.queryRay(x0, y0, x1, y1, ['egg'])), found.filter(i => i % 2));
  }
});

test('seeded incremental mutations match independent per-cell full scans and the old index', () => {
  let seed = 75931;
  const random = () => {seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32;};
  const nextBox = () => {
    const left = -280 + random() * 4800, top = random() * 2600;
    return {left, top, right: left + random() * 400, bottom: top + random() * 300};
  };
  const grid = new CentralSpatialGrid<number>();
  const records = Array.from({length: 80}, (_, i) => ({entry: grid.createEntry(i, GRID_KINDS[i % 5]), bounds: nextBox(), active: false}));
  for (let step = 0; step < 360; step++) {
    const r = records[Math.floor(random() * records.length)];
    if (r.active && random() < .2) {grid.remove(r.entry); r.active = false;}
    else {
      r.bounds = nextBox();
      if (r.active) grid.relocate(r.entry, r.bounds, GRID_KINDS[Math.floor(random() * 5)]);
      else {grid.register(r.entry, r.bounds); r.active = true;}
    }
    const active = records.filter(r => r.active), q = nextBox();
    const kind = GRID_KINDS[Math.floor(random() * 5)];
    const actual = ids(grid.queryBounds(q, [kind]));
    // Independently scan all authoritative boxes. Exact overlap is a subset;
    // shared closed cell squares define the complete conservative result.
    const reference = active.filter(r => r.entry.kind === kind && (() => {
      for (let y = grid.cellRange.top; y <= grid.cellRange.bottom; y++) for (let x = grid.cellRange.left; x <= grid.cellRange.right; x++) {
        const cell = {left: x * 128 - 1e-7, right: (x + 1) * 128 + 1e-7, top: y * 128 - 1e-7, bottom: (y + 1) * 128 + 1e-7};
        if (overlap(cell, q) && overlap(cell, r.bounds)) return true;
      }
      return false;
    })()).map(r => r.entry.value).sort((a, b) => a - b);
    assert.deepEqual(actual, reference);
    for (const r of active) if (r.entry.kind === kind && overlap(r.bounds, q)) assert.ok(actual.includes(r.entry.value));
    const old = new OrderedSpatialIndex(active.map(r => r.bounds));
    assert.deepEqual(ids(grid.queryBounds(q)), old.queryBounds(q.left, q.top, q.right, q.bottom).map(i => active[i].entry.value).sort((a, b) => a - b));
    const ray = [-400 + random() * 5600, -200 + random() * 3400, -400 + random() * 5600, -200 + random() * 3400] as const;
    assert.deepEqual(ids(grid.queryRay(...ray)), old.query(...ray).map(i => active[i].entry.value).sort((a, b) => a - b));
    const rayCandidates = new Set(ids(grid.queryRay(...ray)));
    for (const r of active) if (segmentHitsBox(ray, r.bounds)) assert.ok(rayCandidates.has(r.entry.value), 'Full-scan exact ray hits survive');
    assert.equal(grid.entryCount, active.length);
    if (step % 30 === 0) {
      let memberships = 0, occupied = 0;
      for (let y = grid.cellRange.top; y <= grid.cellRange.bottom; y++) for (let x = grid.cellRange.left; x <= grid.cellRange.right; x++) {
        const cell = {left: x * 128 - 1e-7, right: (x + 1) * 128 + 1e-7, top: y * 128 - 1e-7, bottom: (y + 1) * 128 + 1e-7};
        const expected = active.filter(r => overlap(cell, r.bounds)).map(r => r.entry.value).sort((a, b) => a - b);
        assert.deepEqual(ids(grid.queryCells({left: x, right: x, top: y, bottom: y})), expected);
        memberships += expected.length; if (expected.length) occupied++;
      }
      assert.equal(grid.membershipCount, memberships); assert.equal(grid.occupiedCellCount, occupied);
    }
  }
});

test('query stamp rollover preserves uniqueness and removed/reinserted handles', () => {
  const grid = new CentralSpatialGrid<number>(), e = grid.createEntry(1, 'egg');
  grid.register(e, box(0, 0, 1000, 1000)); grid.queryCells(grid.cellRange);
  (grid as unknown as {stamp: number}).stamp = Number.MAX_SAFE_INTEGER;
  assert.deepEqual(ids(grid.queryCells(grid.cellRange)), [1]);
  grid.remove(e); grid.register(e, box(128)); assert.deepEqual(ids(grid.queryCells(grid.cellRange)), [1]);
});

test('P1 runtime integration is confined to P4 authority and the P5 observer', () => {
  assert.match(readFileSync(new URL('../maintainedGrid.ts', import.meta.url), 'utf8'), /from\s*['"].*centralSpatialGrid/);
  for (const name of readdirSync(new URL('..', import.meta.url)).filter(n => /\.(ts|tsx)$/.test(n) && n !== 'centralSpatialGrid.ts' && n !== 'maintainedGrid.ts' && n !== 'gridIntegrityAudit.ts'))
    assert.doesNotMatch(readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), /from\s*['"].*centralSpatialGrid/,
      `${name} must not integrate P1`);
});
