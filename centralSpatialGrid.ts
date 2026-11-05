import type {SpatialBounds} from './spatialIndex';

export const GRID_CELL_SIZE = 128;
// persistence.ts admits 4800 × 3000; selfTubes.ts extends water by 300 per side.
export const MAX_AQUARIUM_GRID_BOUNDS: Readonly<SpatialBounds> = Object.freeze({
  left: -300, right: 5100, top: 0, bottom: 3000,
});
export const GRID_KINDS = ['nutrient', 'carrion', 'egg', 'body-part', 'organism'] as const;
export type GridKind = typeof GRID_KINDS[number];
export interface GridCellRange {readonly left: number; readonly right: number; readonly top: number; readonly bottom: number}
const EPSILON = 1e-7, MAX_CELLS = 65_536, MAX_MEMBERSHIPS = 262_144;
const STATE = Symbol('grid membership');
type EntryState = {owner: object; kind: GridKind; range?: GridCellRange; seen: number};

/** Entity-local, transient handle. Separate part/coarse views may share a value.
 * Register the same handle only once; retain it for relocation and removal. */
export class GridEntry<T> {
  readonly [STATE]: EntryState;
  private constructor(readonly value: T, state: EntryState) {this[STATE] = state;}
  static create<T>(value: T, owner: object, kind: GridKind): GridEntry<T> {
    return new GridEntry(value, {owner, kind, seen: 0});
  }
  get kind(): GridKind {return this[STATE].kind;}
  get registered(): boolean {return this[STATE].range !== undefined;}
  get cellRange(): GridCellRange | undefined {return this[STATE].range;}
}
type Cell<T> = Partial<Record<GridKind, Set<GridEntry<T>>>>;

function validateBounds(b: SpatialBounds): void {
  if (![b.left, b.right, b.top, b.bottom].every(Number.isFinite) || b.left > b.right || b.top > b.bottom)
    throw new RangeError('Grid bounds must be finite and ordered');
}
function rangeOf(b: SpatialBounds): GridCellRange {
  return {left: Math.floor((b.left - EPSILON) / GRID_CELL_SIZE), right: Math.floor((b.right + EPSILON) / GRID_CELL_SIZE),
    top: Math.floor((b.top - EPSILON) / GRID_CELL_SIZE), bottom: Math.floor((b.bottom + EPSILON) / GRID_CELL_SIZE)};
}
function contains(r: GridCellRange | undefined, x: number, y: number): boolean {
  return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}
function area(r?: GridCellRange): number {return r ? (r.right - r.left + 1) * (r.bottom - r.top + 1) : 0;}
function kindCheck(kind: GridKind): void {
  if (!GRID_KINDS.includes(kind)) throw new RangeError('Unknown grid kind');
}

/** P1 matrix primitive; P4 supplies authoritative shadow integration.
 * Direct matrix slots cover fixed maximum capacity, not the current tank.
 * Buckets exist only while occupied; no persistent all-entity registry or cache.
 * Queries are conservative, unique and UNORDERED: callers retain narrowphase
 * and legacy source-rank semantics. Derived memberships must never be saved. */
export class CentralSpatialGrid<T> {
  readonly capacity: Readonly<SpatialBounds>;
  readonly cellRange: GridCellRange;
  readonly columns: number;
  readonly rows: number;
  private readonly cells: (Cell<T> | undefined)[];
  private readonly owner = {};
  private stamp = 0;
  private memberships = 0;
  private entries = 0;
  private occupied = 0;

  constructor(capacity: SpatialBounds = MAX_AQUARIUM_GRID_BOUNDS, readonly membershipLimit = MAX_MEMBERSHIPS) {
    validateBounds(capacity);
    const r = rangeOf(capacity);
    this.columns = r.right - r.left + 1; this.rows = r.bottom - r.top + 1;
    if (!Object.values(r).every(Number.isSafeInteger) || !Number.isSafeInteger(this.columns * this.rows)
      || this.columns * this.rows > MAX_CELLS || !Number.isSafeInteger(membershipLimit)
      || membershipLimit < 1 || membershipLimit > MAX_MEMBERSHIPS)
      throw new RangeError('Grid capacity exceeds bounded storage limits');
    this.capacity = Object.freeze({...capacity}); this.cellRange = Object.freeze(r);
    this.cells = new Array(this.columns * this.rows);
  }
  get cellCount(): number {return this.cells.length;}
  get entryCount(): number {return this.entries;}
  get membershipCount(): number {return this.memberships;}
  get occupiedCellCount(): number {return this.occupied;}

  /** Read-only P5 inspection: raw buckets, including corrupt categories, without
   * query deduplication/stamps or geometry derived from membership handles. */
  inspectCells(visit: (x: number, y: number, kind: string, entries: Iterable<GridEntry<T>>) => void): void {
    for (let slot = 0; slot < this.cells.length; slot++) {
      const cell = this.cells[slot];
      if (!cell) continue;
      const x = this.cellRange.left + slot % this.columns;
      const y = this.cellRange.top + Math.floor(slot / this.columns);
      for (const [kind, entries] of Object.entries(cell)) if (entries) visit(x, y, kind, entries);
    }
  }
  owns(entry: GridEntry<T>): boolean {return entry?.[STATE]?.owner === this.owner;}

  createEntry(value: T, kind: GridKind): GridEntry<T> {
    kindCheck(kind); return GridEntry.create(value, this.owner, kind);
  }
  private state(entry: GridEntry<T>, active: boolean): EntryState {
    const s = entry?.[STATE];
    if (!s || s.owner !== this.owner || (s.range !== undefined) !== active)
      throw new Error(active ? 'Expected an active entry owned by this grid' : 'Expected an inactive entry owned by this grid');
    return s;
  }
  private slot(x: number, y: number): number {
    return (y - this.cellRange.top) * this.columns + x - this.cellRange.left;
  }
  private membershipRange(bounds: SpatialBounds, previous?: GridCellRange): GridCellRange {
    validateBounds(bounds);
    const b = this.capacity;
    if (bounds.left < b.left || bounds.right > b.right || bounds.top < b.top || bounds.bottom > b.bottom)
      throw new RangeError('Entry outside grid capacity; supply an explicitly larger bounded capacity');
    const next = rangeOf(bounds);
    if (this.memberships - area(previous) + area(next) > this.membershipLimit)
      throw new RangeError('Grid membership budget exceeded');
    return next;
  }
  private add(entry: GridEntry<T>, kind: GridKind, x: number, y: number): void {
    const slot = this.slot(x, y);
    let cell = this.cells[slot];
    if (!cell) {this.cells[slot] = cell = {}; this.occupied++;}
    (cell[kind] ??= new Set()).add(entry); this.memberships++;
  }
  private erase(entry: GridEntry<T>, kind: GridKind, x: number, y: number): void {
    const slot = this.slot(x, y), cell = this.cells[slot]!;
    const bucket = cell[kind]!;
    if (!bucket.delete(entry)) throw new Error('Missing grid membership');
    this.memberships--;
    if (!bucket.size) delete cell[kind];
    if (Object.keys(cell).length === 0) {this.cells[slot] = undefined; this.occupied--;}
  }
  register(entry: GridEntry<T>, bounds: SpatialBounds): void {
    const s = this.state(entry, false), next = this.membershipRange(bounds);
    for (let y = next.top; y <= next.bottom; y++) for (let x = next.left; x <= next.right; x++) this.add(entry, s.kind, x, y);
    s.range = Object.freeze(next); s.seen = 0; this.entries++;
  }
  /** Returns false when no cell bucket changed. Geometry remains caller-owned. */
  relocate(entry: GridEntry<T>, bounds: SpatialBounds, kind: GridKind = entry.kind): boolean {
    const s = this.state(entry, true); kindCheck(kind);
    const old = s.range!, next = this.membershipRange(bounds, old), changedKind = s.kind !== kind;
    if (!changedKind && old.left === next.left && old.right === next.right && old.top === next.top && old.bottom === next.bottom) return false;
    for (let y = old.top; y <= old.bottom; y++) for (let x = old.left; x <= old.right; x++)
      if (changedKind || !contains(next, x, y)) this.erase(entry, s.kind, x, y);
    for (let y = next.top; y <= next.bottom; y++) for (let x = next.left; x <= next.right; x++)
      if (changedKind || !contains(old, x, y)) this.add(entry, kind, x, y);
    s.range = Object.freeze(next); s.kind = kind; return true;
  }
  remove(entry: GridEntry<T>): void {
    const s = this.state(entry, true), r = s.range!;
    for (let y = r.top; y <= r.bottom; y++) for (let x = r.left; x <= r.right; x++) this.erase(entry, s.kind, x, y);
    s.range = undefined; s.seen = 0; this.entries--;
  }
  /** Audited recovery only: erase precisely the diagnosed handles, reading raw
   * buckets instead of trusting their possibly corrupt kind/range metadata.
   * Foreign handles are detached here but never mutated in their owning grid.
   * Recount derived counters from observed buckets; never recreate memberships. */
  discardForRepair(targets: ReadonlySet<GridEntry<T>>): void {
    let memberships = 0, occupied = 0;
    const live = new Set<GridEntry<T>>();
    for (let slot = 0; slot < this.cells.length; slot++) {
      const cell = this.cells[slot]; if (!cell) continue;
      for (const [kind, bucket] of Object.entries(cell)) {
        if (!bucket) continue;
        const retained = [...bucket].filter(e => !targets.has(e));
        if (retained.length) {
          // Do not normalize unrelated corruption while repairing these entries.
          if (retained.length !== [...bucket].length) (cell as Record<string, Iterable<GridEntry<T>>>)[kind] = new Set(retained);
          memberships += retained.length;
          for (const e of retained) live.add(e);
        } else delete (cell as Record<string, unknown>)[kind];
      }
      if (Object.keys(cell).length) occupied++; else this.cells[slot] = undefined;
    }
    for (const e of targets) if (this.owns(e)) {e[STATE].range = undefined; e[STATE].seen = 0;}
    this.memberships = memberships; this.occupied = occupied; this.entries = live.size;
  }
  private begin(kinds: readonly GridKind[]): number {
    for (const kind of kinds) kindCheck(kind);
    // Extremely rare wraparound uses only live buckets, without a registry.
    if (this.stamp === Number.MAX_SAFE_INTEGER) {
      for (const cell of this.cells) if (cell) for (const kind of GRID_KINDS)
        for (const e of cell[kind] ?? []) e[STATE].seen = 0;
      this.stamp = 0;
    }
    return ++this.stamp;
  }
  private collect(y: number, left: number, right: number, kinds: readonly GridKind[], stamp: number, result: GridEntry<T>[]): void {
    for (let x = Math.max(left, this.cellRange.left); x <= Math.min(right, this.cellRange.right); x++) {
      const cell = this.cells[this.slot(x, y)];
      if (!cell) continue;
      for (const kind of kinds) for (const entry of cell[kind] ?? []) if (entry[STATE].seen !== stamp) {
        entry[STATE].seen = stamp; result.push(entry);
      }
    }
  }
  /** Integer cell coordinates are inclusive; outside queries are clipped. */
  queryCells(range: GridCellRange, kinds: readonly GridKind[] = GRID_KINDS): GridEntry<T>[] {
    validateBounds(range);
    if (!Object.values(range).every(Number.isSafeInteger)) throw new RangeError('Expected safe integer cell coordinates');
    const result: GridEntry<T>[] = [], stamp = this.begin(kinds);
    for (let y = Math.max(range.top, this.cellRange.top); y <= Math.min(range.bottom, this.cellRange.bottom); y++)
      this.collect(y, range.left, range.right, kinds, stamp, result);
    return result;
  }
  queryBounds(bounds: SpatialBounds, kinds: readonly GridKind[] = GRID_KINDS): GridEntry<T>[] {
    validateBounds(bounds); return this.queryCells(rangeOf(bounds), kinds);
  }
  /** Same conservative horizontal-slab corridor as OrderedSpatialIndex.
   * No exact intersection/visibility/contact decision or result sorting here. */
  queryRay(x0: number, y0: number, x1: number, y1: number, kinds: readonly GridKind[] = GRID_KINDS): GridEntry<T>[] {
    const dx = x1 - x0, dy = y1 - y0;
    if (![x0, y0, x1, y1, dx, dy].every(Number.isFinite)) throw new RangeError('Ray coordinates and deltas must be finite');
    const result: GridEntry<T>[] = [], stamp = this.begin(kinds);
    const top = Math.max(this.cellRange.top, Math.floor((Math.min(y0, y1) - EPSILON) / GRID_CELL_SIZE));
    const bottom = Math.min(this.cellRange.bottom, Math.floor((Math.max(y0, y1) + EPSILON) / GRID_CELL_SIZE));
    for (let y = top; y <= bottom; y++) {
      let start = 0, end = 1;
      if (dy !== 0) {
        const a = (y * GRID_CELL_SIZE - EPSILON - y0) / dy, b = ((y + 1) * GRID_CELL_SIZE + EPSILON - y0) / dy;
        start = Math.max(0, Math.min(a, b)); end = Math.min(1, Math.max(a, b));
        if (start > end) continue;
      }
      const a = x0 + dx * start, b = x0 + dx * end;
      this.collect(y, Math.floor((Math.min(a, b) - EPSILON) / GRID_CELL_SIZE),
        Math.floor((Math.max(a, b) + EPSILON) / GRID_CELL_SIZE), kinds, stamp, result);
    }
    return result;
  }
}
