import {CentralSpatialGrid, GRID_KINDS, type GridEntry, type GridKind} from './centralSpatialGrid';
import {calculateCreatureEnvelope, encloseCreaturePose, type CreatureEnvelope} from './creatureEnvelope';
import {getPartCornerVertices, type Organism, type PartPhys, type Nutrient, type Egg,
  type SimulationState, type PartDef} from './simulation';
import type {SpatialBounds} from './spatialIndex';

export type GridView = 'food' | 'egg' | 'body-part' | 'organism';
export interface WorldGridValue {
  readonly entity: Organism | PartPhys | Nutrient | Egg;
  readonly view: GridView;
  organism?: Organism;
  sourceIndex: number;
  partIndex: number;
  /** Null means arithmetic overflow: always retain this candidate. */
  bounds: SpatialBounds | null;
}
type Local = {entry: GridEntry<WorldGridValue>;
  seen: number; parts?: PartDef[]; envelope?: CreatureEnvelope};
// Non-enumerable entity-local metadata: JSON, spread and structuredClone omit it.
// Multiple independently owned worlds may deliberately share a fixture object.
const MEMBERSHIPS = Symbol('transient maintained world grid');
type Entity = WorldGridValue['entity'];
type WithMemberships = Entity & {[MEMBERSHIPS]?: Map<MaintainedWorldGrid, Local>};
const worlds = new WeakMap<SimulationState, MaintainedWorldGrid>();
const priority = (v: GridView) => v === 'food' ? 0 : v === 'egg' ? 1 : v === 'body-part' ? 2 : 3;
export function compareWorldGridValues(a: WorldGridValue, b: WorldGridValue): number {
  return priority(a.view) - priority(b.view) || a.sourceIndex - b.sourceIndex || a.partIndex - b.partIndex;
}
const valid = (b: SpatialBounds | null): b is SpatialBounds => !!b
  && [b.left, b.right, b.top, b.bottom].every(Number.isFinite) && b.left <= b.right && b.top <= b.bottom;
function partBounds(org: Organism, index: number): SpatialBounds | null {
  const points = getPartCornerVertices(org.segments[index], org.genome.parts[index]);
  const b = {left: Math.min(...points.map(p => p.x)), right: Math.max(...points.map(p => p.x)),
    top: Math.min(...points.map(p => p.y)), bottom: Math.max(...points.map(p => p.y))};
  return valid(b) ? b : null;
}

/** P4 shadow state. Consumers still use the historical broadphases.
 * Roster reconciliation scans source arrays, never clears/rebuilds the matrix.
 * Motion hooks relocate only moved entities; P1 owns every bucket mutation.
 * No audit, timer, repair mode, observer transfer or saved schema is added. */
export class MaintainedWorldGrid {
  readonly matrix: CentralSpatialGrid<WorldGridValue>;
  private readonly records = new Set<Local>();
  private readonly overflow = new Set<GridEntry<WorldGridValue>>();
  private generation = 0;
  private disposed = false;
  constructor(readonly state: SimulationState, matrix = new CentralSpatialGrid<WorldGridValue>()) {
    this.matrix = matrix;
  }
  get entryCount(): number {return this.records.size;}
  get overflowCount(): number {return this.overflow.size;}
  private local(entity: Entity, view: GridView, kind: GridKind, sourceIndex: number, partIndex = -1, organism?: Organism): Local {
    if (this.disposed) throw new Error('Disposed maintained world grid');
    const e = entity as WithMemberships;
    if (!e[MEMBERSHIPS]) Object.defineProperty(e, MEMBERSHIPS, {value: new Map(), configurable: true});
    let record = e[MEMBERSHIPS]!.get(this);
    if (!record) {
      const value: WorldGridValue = {entity, view, sourceIndex, partIndex, organism, bounds: null};
      record = {entry: this.matrix.createEntry(value, kind), seen: this.generation};
      e[MEMBERSHIPS]!.set(this, record); this.records.add(record);
    }
    record.seen = this.generation;
    const value = record.entry.value;
    value.sourceIndex = sourceIndex; value.partIndex = partIndex; value.organism = organism;
    return record;
  }
  private place(record: Local, bounds: SpatialBounds | null, kind: GridKind): void {
    const entry = record.entry, c = this.matrix.capacity;
    entry.value.bounds = valid(bounds) ? bounds : null;
    const fits = valid(bounds) && bounds.left >= c.left && bounds.right <= c.right
      && bounds.top >= c.top && bounds.bottom <= c.bottom;
    if (fits) {
      try {
        if (entry.registered) this.matrix.relocate(entry, bounds, kind);
        else {
          // An overflow entry may have changed category while unregistered.
          // P1 allows kind changes only on active entries, so replace the handle.
          if (entry.kind !== kind) record.entry = this.matrix.createEntry(entry.value, kind);
          this.matrix.register(record.entry, bounds);
        }
        this.overflow.delete(entry); return;
      } catch (error) {
        // P1 validates capacity/budget atomically. Do not hide integrity errors.
        if (!(error instanceof RangeError)) throw error;
      }
    }
    if (entry.registered) this.matrix.remove(entry);
    if (entry.kind !== kind) {
      this.overflow.delete(entry); record.entry = this.matrix.createEntry(entry.value, kind);
    }
    this.overflow.add(record.entry);
  }
  private forget(record: Local): void {
    if (record.entry.registered) this.matrix.remove(record.entry);
    this.overflow.delete(record.entry); this.records.delete(record);
    const entity = record.entry.value.entity as WithMemberships;
    entity[MEMBERSHIPS]!.delete(this);
    if (!entity[MEMBERSHIPS]!.size) delete entity[MEMBERSHIPS];
  }
  syncFood(food: Nutrient, index: number): void {
    const kind = food.kind === 'carrion' ? 'carrion' : 'nutrient';
    const r = this.local(food, 'food', kind, index), radius = food.radius;
    this.place(r, {left: food.x - radius, right: food.x + radius,
      top: food.y - radius, bottom: food.y + radius}, kind);
  }
  syncEgg(egg: Egg, index: number): void {
    this.place(this.local(egg, 'egg', 'egg', index),
      {left: egg.x - 16, right: egg.x + 16, top: egg.y - 16, bottom: egg.y + 16}, 'egg');
  }
  syncOrganism(org: Organism, index: number): void {
    if (org.dissolving) {this.removeOrganism(org); return;}
    const coarse = this.local(org, 'organism', 'organism', index);
    if (coarse.parts !== org.genome.parts) {
      coarse.parts = org.genome.parts;
      coarse.envelope = calculateCreatureEnvelope(org.genome.parts);
    }
    const bounds = org.segments.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))
      ? encloseCreaturePose(coarse.envelope!, org.segments).bounds : null;
    this.place(coarse, bounds, 'organism');
    for (let i = 0; i < org.segments.length; i++)
      this.place(this.local(org.segments[i], 'body-part', 'body-part', index, i, org), partBounds(org, i), 'body-part');
  }
  remove(entity: Entity): void {
    const record = (entity as WithMemberships)[MEMBERSHIPS]?.get(this);
    if (record) this.forget(record);
  }
  removeOrganism(org: Organism): void {
    this.remove(org); for (const segment of org.segments) this.remove(segment);
  }
  /** Collection edits update ordering independently of spatial membership. */
  refreshRanks(view: 'food' | 'egg' | 'organism'): void {
    const update = (entity: Entity, index: number) => {
      const record = (entity as WithMemberships)[MEMBERSHIPS]?.get(this);
      if (record) record.entry.value.sourceIndex = index;
    };
    if (view === 'food') this.state.nutrients.forEach(update);
    else if (view === 'egg') this.state.eggs.forEach(update);
    else this.state.organisms.forEach((org, i) => {
      update(org, i); for (const segment of org.segments) update(segment, i);
    });
  }
  /** Normal lifecycle transaction boundary: diff roster and refresh exact array
   * ranks after splices/replacements. No reference-grid rebuild or audit repair. */
  synchronize(): void {
    if (this.disposed) throw new Error('Disposed maintained world grid');
    if (this.generation === Number.MAX_SAFE_INTEGER) {
      for (const record of this.records) record.seen = 0;
      this.generation = 0;
    }
    this.generation++;
    this.state.nutrients.forEach((food, i) => this.syncFood(food, i));
    this.state.eggs.forEach((egg, i) => this.syncEgg(egg, i));
    this.state.organisms.forEach((org, i) => this.syncOrganism(org, i));
    for (const record of this.records) if (record.seen !== this.generation) this.forget(record);
  }
  private ordered(entries: GridEntry<WorldGridValue>[], kinds: readonly GridKind[], descending: boolean): GridEntry<WorldGridValue>[] {
    for (const entry of this.overflow) if (kinds.includes(entry.kind)) entries.push(entry);
    entries.sort((a, b) => (descending ? -1 : 1) * compareWorldGridValues(a.value, b.value));
    return entries;
  }
  queryBounds(bounds: SpatialBounds, kinds: readonly GridKind[] = GRID_KINDS, descending = false): GridEntry<WorldGridValue>[] {
    return this.ordered(this.matrix.queryBounds(bounds, kinds), kinds, descending);
  }
  queryRay(x0: number, y0: number, x1: number, y1: number, kinds: readonly GridKind[] = GRID_KINDS): GridEntry<WorldGridValue>[] {
    return this.ordered(this.matrix.queryRay(x0, y0, x1, y1, kinds), kinds, false);
  }
  dispose(): void {
    for (const record of this.records) this.forget(record);
    this.disposed = true;
    if (worlds.get(this.state) === this) worlds.delete(this.state);
  }
}

export function getMaintainedGrid(state: SimulationState): MaintainedWorldGrid | undefined {return worlds.get(state);}
export function ensureMaintainedGrid(state: SimulationState): MaintainedWorldGrid {
  let grid = worlds.get(state);
  if (!grid) {grid = new MaintainedWorldGrid(state); worlds.set(state, grid); grid.synchronize();}
  return grid;
}
/** Commands and import/reset boundaries also execute while paused. */
export function synchronizeMaintainedGrid(state: SimulationState): void {worlds.get(state)?.synchronize();}
export function disposeMaintainedGrid(state: SimulationState): void {worlds.get(state)?.dispose();}
/** Called after a completed pose mutation transaction, before any next query. */
export function syncTrackedOrganism(org: Organism): void {
  const records = (org as WithMemberships)[MEMBERSHIPS];
  if (records) for (const [owner, record] of records) owner.syncOrganism(org, record.entry.value.sourceIndex);
}

/** Particle wall/tube projection is also callable outside a kernel tick. */
export function syncTrackedParticle(p: {x: number; y: number}): void {
  const records = (p as WithMemberships)[MEMBERSHIPS];
  if (records) for (const [owner, record] of records) {
    if (record.entry.value.view === 'egg') owner.syncEgg(p as Egg, record.entry.value.sourceIndex);
    else if (record.entry.value.view === 'food') owner.syncFood(p as Nutrient, record.entry.value.sourceIndex);
  }
}
