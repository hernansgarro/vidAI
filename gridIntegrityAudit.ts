import {GRID_CELL_SIZE, type GridCellRange, type GridEntry, type GridKind} from './centralSpatialGrid';
import {calculateCreatureEnvelope, encloseCreaturePose} from './creatureEnvelope';
import {getMaintainedGrid, type GridView, type WorldGridValue} from './maintainedGrid';
import type {SimulationState, Organism} from './simulation';
import type {SpatialBounds} from './spatialIndex';

export const GRID_AUDIT_INTERVAL = 60;
export const GRID_AUDIT_DETAIL_LIMIT = 20;
export interface GridAuditDiagnostic {
  severity: 'info' | 'warning' | 'error'; subsystem: 'grid-integrity'; message: string;
}
export interface GridAuditResult {
  simTime: number; expectedEntries: number; overflowEntries: number;
  issueCount: number; severeIssueCount: number; details: string[];
  repair?: {attempted: number; succeeded: number; failed: number; unsafe: number; remainingIssueCount: number};
}
type Reference = {entity: object; view: GridView; kind: GridKind; sourceIndex: number;
  partIndex: number; organism?: object; bounds: SpatialBounds | null};
const finiteBounds = (b: SpatialBounds | null): b is SpatialBounds => !!b
  && [b.left, b.right, b.top, b.bottom].every(Number.isFinite) && b.left <= b.right && b.top <= b.bottom;
const normalized = (b: SpatialBounds | null) => finiteBounds(b) ? b : null;
const square = (x: number, y: number, r: number) => normalized({left: x-r, right: x+r, top: y-r, bottom: y+r});
const sameRange = (a: GridCellRange | undefined, b: GridCellRange | undefined) => a === b || !!a && !!b
  && a.left === b.left && a.right === b.right && a.top === b.top && a.bottom === b.bottom;
const range = (b: SpatialBounds): GridCellRange => ({left: Math.floor((b.left-1e-7)/GRID_CELL_SIZE),
  right: Math.floor((b.right+1e-7)/GRID_CELL_SIZE), top: Math.floor((b.top-1e-7)/GRID_CELL_SIZE), bottom: Math.floor((b.bottom+1e-7)/GRID_CELL_SIZE)});
const sameBounds = (a: SpatialBounds | null, b: SpatialBounds | null) => a === b || !!a && !!b
  && a.left === b.left && a.right === b.right && a.top === b.top && a.bottom === b.bottom;
const area = (r: GridCellRange) => (r.right-r.left+1)*(r.bottom-r.top+1);

/** Fresh authoritative reference: no maintained bounds, local handles, cached
 * anatomy, grid queries or registration. Pure P2 geometry is recomputed from
 * current anatomy; per-part rotated corners are independently reconstructed. */
function reference(state: SimulationState): Reference[] {
  const rows: Reference[] = [];
  state.nutrients.forEach((n, sourceIndex) => rows.push({entity: n, view: 'food',
    kind: n.kind === 'carrion' ? 'carrion' : 'nutrient', sourceIndex, partIndex: -1, bounds: square(n.x, n.y, n.radius)}));
  state.eggs.forEach((e, sourceIndex) => rows.push({entity: e, view: 'egg', kind: 'egg', sourceIndex,
    partIndex: -1, bounds: square(e.x, e.y, 16)}));
  state.organisms.forEach((o, sourceIndex) => {
    if (o.dissolving) return;
    const descriptor = calculateCreatureEnvelope(o.genome.parts);
    const bounds = o.segments.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))
      ? encloseCreaturePose(descriptor, o.segments).bounds : null;
    rows.push({entity: o, view: 'organism', kind: 'organism', sourceIndex, partIndex: -1, bounds});
    o.segments.forEach((p, partIndex) => {
      const d = o.genome.parts[partIndex], xs: number[] = [], ys: number[] = [];
      const c = Math.cos(p.angle), s = Math.sin(p.angle);
      for (const [x, y] of [[-d.width/2, -d.height/2], [d.width/2, -d.height/2],
        [d.width/2, d.height/2], [-d.width/2, d.height/2]]) {
        xs.push(p.x + x*c - y*s); ys.push(p.y + x*s + y*c);
      }
      rows.push({entity: p, organism: o, view: 'body-part', kind: 'body-part', sourceIndex, partIndex,
        bounds: normalized({left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys)})});
    });
  });
  return rows;
}

/** Observe only. Do not call ensure/synchronize: even a missing grid is evidence.
 * Work is O(matrix slots + actual memberships + roster/anatomy); missing cells
 * are counted from expected rectangle area, never a huge world-coordinate loop.
 * Retained report is bounded scalar text, not entity or grid references. */
type Finding = {entity?: object; entry?: GridEntry<WorldGridValue>; severe: boolean; message: string};
export function auditWorldGrid(state: SimulationState, finding?: (value: Finding) => void): GridAuditResult {
  const result: GridAuditResult = {simTime: state.simTime, expectedEntries: 0, overflowEntries: 0, issueCount: 0, severeIssueCount: 0, details: []};
  let entity: object | undefined, entry: GridEntry<WorldGridValue> | undefined;
  const issue = (message: string, severe = true) => {
    result.issueCount++; if (severe) result.severeIssueCount++;
    finding?.({entity, entry, severe, message});
    if (result.details.length < GRID_AUDIT_DETAIL_LIMIT) result.details.push(message.slice(0, 512));
  };
  try {
    const rows = reference(state); result.expectedEntries = rows.length;
    const expected = new Map<object, Reference>();
    for (const row of rows) {
      entity = row.entity;
      if (expected.has(row.entity)) issue(`Duplicate authoritative object in ${row.view}[${row.sourceIndex}].`);
      expected.set(row.entity, row);
    }
    entity = undefined;
    const grid = getMaintainedGrid(state);
    if (!grid) {issue('Missing maintained world grid.'); return result;}
    type Entry = GridEntry<WorldGridValue>;
    const records = new Set<Entry>(), overflow = new Set<Entry>(), byEntity = new Map<object, Entry>();
    const observed = new Map<Entry, {memberships: number; correct: number}>();
    const label = (e: Entry) => `${e.value.view}[${e.value.sourceIndex}] part=${e.value.partIndex} id=${String((e.value.entity as {id?: string}).id ?? '(segment)').slice(0, 80)}`;
    grid.inspectRecords((e, localMatches) => {
      entity = e.value.entity; entry = e;
      if (records.has(e)) issue(`Duplicate roster handle: ${label(e)}.`);
      records.add(e);
      if (!localMatches) issue(`Stale entity-local handle: ${label(e)}.`);
      if (!grid.matrix.owns(e)) issue(`Foreign handle: ${label(e)}.`);
      if (byEntity.has(e.value.entity)) issue(`Duplicate entity handles: ${label(e)}.`);
      byEntity.set(e.value.entity, e);
      const r = expected.get(e.value.entity);
      if (!r) {issue(`Extra/stale entity reference: ${label(e)}.`); return;}
      if (e.kind !== r.kind || e.value.view !== r.view) issue(`Misclassified ${label(e)}: expected ${r.view}/${r.kind}, got ${e.value.view}/${e.kind}.`);
      if (e.value.sourceIndex !== r.sourceIndex || e.value.partIndex !== r.partIndex || e.value.organism !== r.organism)
        issue(`Stale source rank/owner reference: ${label(e)}; expected index=${r.sourceIndex}, part=${r.partIndex}.`, e.value.organism !== r.organism || e.value.partIndex !== r.partIndex);
      if (!sameBounds(e.value.bounds, r.bounds)) {
        const old = e.value.bounds, b = r.bounds;
        const conservative = !!old && !!b && old.left <= b.left && old.right >= b.right && old.top <= b.top && old.bottom >= b.bottom;
        issue(`Stale bounds: ${label(e)}; stored=${JSON.stringify(old)}, physical=${JSON.stringify(b)}.`, !conservative);
      }
    });
    grid.inspectOverflow(e => {
      entity = e.value.entity; entry = e;
      overflow.add(e); result.overflowEntries++;
      if (!records.has(e)) issue(`Extra/stale overflow handle: ${label(e)}.`);
      if (e.registered || e.cellRange) issue(`Overflow handle is also registered: ${label(e)}.`);
    });
    for (const r of rows) if (!byEntity.has(r.entity)) {
      entity = r.entity; entry = undefined;
      issue(`Missing ${r.view}[${r.sourceIndex}] part=${r.partIndex} id=${String((r.entity as {id?: string}).id ?? '(segment)').slice(0,80)}.`);
    }
    let memberships = 0;
    const occupied = new Set<string>(), matrixEntries = new Set<Entry>();
    grid.matrix.inspectCells((x, y, kind, entries) => {
      const cellSeen = new Set<Entry>();
      for (const e of entries) {
        entity = e.value.entity; entry = e;
        memberships++; occupied.add(`${x},${y}`); matrixEntries.add(e);
        const counts = observed.get(e) ?? {memberships: 0, correct: 0}; observed.set(e, counts); counts.memberships++;
        const duplicate = cellSeen.has(e);
        if (duplicate) issue(`Duplicate membership at cell (${x},${y})/${kind}: ${label(e)}.`);
        cellSeen.add(e);
        if (!records.has(e)) issue(`Extra/stale bucket reference at cell (${x},${y})/${kind}: ${label(e)}.`);
        if (!grid.matrix.owns(e) || !e.registered) issue(`Stale/foreign inactive bucket handle at (${x},${y}): ${label(e)}.`);
        if (e.kind !== kind) issue(`Misclassified bucket at (${x},${y})/${kind}: ${label(e)}; handle kind=${e.kind}.`);
        const r = expected.get(e.value.entity), b = r?.bounds;
        if (!r || !b) {issue(`Unexpected cell (${x},${y}) for ${label(e)}.`); continue;}
        const cells = range(b);
        if (x < cells.left || x > cells.right || y < cells.top || y > cells.bottom)
          issue(`Wrong cell (${x},${y}) for ${label(e)}; expected x=${cells.left}..${cells.right}, y=${cells.top}..${cells.bottom}.`);
        else if (kind === r.kind && !duplicate) counts.correct++;
      }
    });
    for (const e of records) {
      entity = e.value.entity; entry = e;
      const r = expected.get(e.value.entity), counts = observed.get(e), b = r?.bounds, c = grid.matrix.capacity;
      if (overflow.has(e)) {
        if (counts) issue(`Overflow handle also has matrix cells: ${label(e)}.`);
        // Admission can depend on prior budget pressure in the same transaction.
        // Current free capacity cannot disprove a legitimate P4 overflow entry.
        continue;
      }
      if (!e.registered || !e.cellRange) issue(`Missing registration: ${label(e)}.`);
      if (!b || b.left < c.left || b.right > c.right || b.top < c.top || b.bottom > c.bottom) {
        issue(`Out-of-capacity/unbounded entry is not an unconditional candidate: ${label(e)}.`); continue;
      }
      const cells = range(b);
      if (!sameRange(e.cellRange, cells)) issue(`Incorrect handle cell range: ${label(e)}.`);
      if ((counts?.correct ?? 0) !== area(cells)) issue(`Missing/duplicate/wrong-category cells: ${label(e)}; expected ${area(cells)}, found ${counts?.correct ?? 0}.`);
    }
    entity = undefined; entry = undefined;
    if (grid.entryCount !== records.size) issue('Roster entry counter mismatch.');
    if (grid.matrix.entryCount !== matrixEntries.size) issue(`Matrix entry counter mismatch: ${grid.matrix.entryCount} vs ${matrixEntries.size}.`);
    if (grid.matrix.membershipCount !== memberships) issue(`Matrix membership counter mismatch: ${grid.matrix.membershipCount} vs ${memberships}.`);
    if (grid.matrix.occupiedCellCount !== occupied.size) issue(`Matrix occupied-cell counter mismatch: ${grid.matrix.occupiedCellCount} vs ${occupied.size}.`);
    if (memberships > grid.matrix.membershipLimit) issue('Matrix membership budget exceeded.');
  } catch (error) {
    entity = undefined; entry = undefined;
    issue(`Audit could not complete: ${error instanceof Error ? error.message : String(error)}`);
  }
  return result;
}

export function gridAuditDiagnostics(result: GridAuditResult, trigger: 'manual' | 'periodic'): GridAuditDiagnostic[] {
  const prefix = `${trigger} grid audit at t=${result.simTime.toFixed(3)}s`;
  return [{severity: result.issueCount ? 'error' : 'info', subsystem: 'grid-integrity',
    message: `${prefix}: ${result.issueCount ? `${result.issueCount} inconsistencies` : 'passed'}; ${result.expectedEntries} expected entries, ${result.overflowEntries} unconditional candidates.`},
  ...result.details.map(message => ({severity: 'error' as const, subsystem: 'grid-integrity' as const, message: `t=${result.simTime.toFixed(3)}s: ${message}`})),
  ...(result.issueCount > result.details.length ? [{severity: 'warning' as const, subsystem: 'grid-integrity' as const,
    message: `${prefix}: ${result.issueCount-result.details.length} additional inconsistencies omitted (detail limit ${GRID_AUDIT_DETAIL_LIMIT}).`}] : [])];
}

/** Session observer clock, intentionally outside settings, saves and PRNG. */
export class GridAuditSchedule {
  enabled = false;
  private next = Infinity;
  setEnabled(enabled: boolean, time: number): void {
    if (enabled === this.enabled) return;
    this.enabled = enabled; this.reset(time);
  }
  private deadline(time: number): number {
    const next = time + GRID_AUDIT_INTERVAL;
    // Historical imports admit any finite simTime. If +60 is no longer
    // representable, do not turn a stopped numeric clock into an audit per tick.
    return Number.isFinite(time) && Number.isFinite(next) && next > time ? next : Infinity;
  }
  reset(time: number): void {this.next = this.enabled ? this.deadline(time) : Infinity;}
  due(time: number): boolean {
    if (!this.enabled || !Number.isFinite(time) || time + 1e-9 < this.next) return false;
    this.next = this.deadline(time); return true;
  }
}

export class GridIntegrityObserver {
  readonly schedule = new GridAuditSchedule();
  pauseOnSevere = false;
  pauseRevision = 0;
  constructor(private readonly emit: (event: GridAuditDiagnostic) => void,
    private readonly pause?: () => void) {}
  private log(event: GridAuditDiagnostic): void {try {this.emit(event);} catch { /* Diagnostic subscriber isolation. */ }}
  audit(state: SimulationState, trigger: 'manual' | 'periodic' = 'manual'): GridAuditResult {
    const affected = new Map<object, Set<GridEntry<WorldGridValue>>>();
    let unscoped = 0, counters = false;
    const result = auditWorldGrid(state, f => {
      if (!f.entity) {if (/counter mismatch/.test(f.message)) counters = true; else unscoped++; return;}
      let entries = affected.get(f.entity);
      if (!entries) affected.set(f.entity, entries = new Set());
      if (f.entry) entries.add(f.entry);
    });
    // Emit the original report before the first mutation, including truncation.
    for (const event of gridAuditDiagnostics(result, trigger)) this.log(event);
    if (result.issueCount) {
      const repair = result.repair = {attempted: 0, succeeded: 0, failed: 0, unsafe: unscoped, remainingIssueCount: result.issueCount};
      const attempted = new Set<object>(), failed = new Set<object>();
      const labels = new Map<object, string>();
      let countersAttempted = false, countersFailed = false;
      let details = 0;
      const detail = (message: string, severity: GridAuditDiagnostic['severity'] = 'error') => {
        if (details++ < GRID_AUDIT_DETAIL_LIMIT) this.log({severity, subsystem: 'grid-integrity',
          message: `t=${state.simTime.toFixed(3)}s repair: ${message}`.slice(0, 1024)});
      };
      try {
        const grid = getMaintainedGrid(state), rows = reference(state);
        const expected = new Map<object, Reference>(), duplicates = new Set<object>();
        for (const row of rows) {
          if (expected.has(row.entity)) duplicates.add(row.entity);
          expected.set(row.entity, row);
        }
        for (const [entity, entries] of affected) {
          const row = expected.get(entity);
          const label = `${row?.view ?? 'extra'}[${row?.sourceIndex ?? '-'}] part=${row?.partIndex ?? '-'} id=${String((entity as {id?: string}).id ?? '(segment)').slice(0,80)}`;
          labels.set(entity, label);
          if (!grid || duplicates.has(entity)) {repair.unsafe++; detail(`${label}: unsafe: missing grid or ambiguous authoritative identity.`); continue;}
          repair.attempted++; attempted.add(entity);
          try {
            grid.repairEntity(entity as WorldGridValue['entity'], entries, row && {...row, organism: row.organism as Organism | undefined});
          } catch (error) {failed.add(entity); detail(`${label}: operation failed: ${String(error)}`);}
        }
        if (counters && grid) {
          repair.attempted++; countersAttempted = true;
          try {grid.matrix.discardForRepair(new Set());}
          catch (error) {countersFailed = true; detail(`counter repair failed: ${String(error)}`);}
        } else if (counters) repair.unsafe++;
        // Fresh reference AND raw bucket inspection, no queries or sync shortcut.
        const remaining = new Set<object>(); let globalFailure = false;
        const verified = auditWorldGrid(state, f => {if (f.entity) remaining.add(f.entity); else globalFailure = true;});
        repair.remainingIssueCount = verified.issueCount;
        for (const entity of attempted) {
          if (failed.has(entity) || remaining.has(entity) || globalFailure) {
            repair.failed++; detail(`${labels.get(entity)}: failed independent verification.`);
          } else {repair.succeeded++; detail(`${labels.get(entity)}: succeeded, independently verified.`, 'info');}
        }
        if (countersAttempted) {
          if (countersFailed || globalFailure) {repair.failed++; detail('counters: failed independent verification.');}
          else {repair.succeeded++; detail('counters: succeeded, independently verified.', 'info');}
        }
        for (const message of verified.details) detail(`post-repair verification: ${message}`);
      } catch (error) {
        repair.unsafe++; repair.failed = repair.attempted; repair.succeeded = 0;
        detail(`repair/verification could not complete: ${String(error)}`);
      }
      if (details > GRID_AUDIT_DETAIL_LIMIT) this.log({severity: 'warning', subsystem: 'grid-integrity',
        message: `${details - GRID_AUDIT_DETAIL_LIMIT} additional repair details omitted.`});
      this.log({severity: repair.failed || repair.unsafe || repair.remainingIssueCount ? 'error' : 'info', subsystem: 'grid-integrity',
        message: `${trigger} grid repair at t=${state.simTime.toFixed(3)}s: detected ${result.issueCount} findings (${result.severeIssueCount} severe); attempted ${repair.attempted} entity repairs; succeeded ${repair.succeeded}, failed ${repair.failed}, unsafe ${repair.unsafe}; independent verification ${repair.remainingIssueCount} remaining findings.`});
      if (this.pauseOnSevere && result.severeIssueCount) {
        this.log({severity: 'warning', subsystem: 'grid-integrity',
          message: `Severe original grid inconsistency at t=${state.simTime.toFixed(3)}s: requesting authoritative 0x pause after repair/verification.`});
        this.pauseRevision++;
        this.pause?.();
      }
    }
    return result;
  }
  afterTick(state: SimulationState): void {
    if (this.schedule.due(state.simTime)) this.audit(state, 'periodic');
  }
}
