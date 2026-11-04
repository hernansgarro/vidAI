/** Observer-only session history. Never import this module into the simulation kernel. */
export const DIAGNOSTIC_SEVERITIES = ['info', 'warning', 'error'] as const;
export type DiagnosticSeverity = typeof DIAGNOSTIC_SEVERITIES[number];
export const DIAGNOSTIC_HISTORY_LIMIT = 200;
export const DIAGNOSTIC_MESSAGE_LIMIT = 2048;
export const DIAGNOSTIC_SUBSYSTEM_LIMIT = 64;

export interface DiagnosticInput {
  severity: DiagnosticSeverity;
  subsystem: string;
  message: string;
}
export interface DiagnosticEvent extends DiagnosticInput {
  readonly id: number;
  /** Wall-clock milliseconds, used for display only. Never a simulation clock. */
  readonly timestamp: number;
}
export interface DiagnosticFilter {
  severity?: DiagnosticSeverity;
  subsystem?: string;
}

export function filterDiagnosticEvents(events: readonly DiagnosticEvent[], filter: DiagnosticFilter): readonly DiagnosticEvent[] {
  return events.filter(event => (!filter.severity || event.severity === filter.severity)
    && (!filter.subsystem || event.subsystem === filter.subsystem));
}

/** Fixed ring, bounded text, immutable snapshots, and no world/object references. */
export class DiagnosticEventStore {
  private readonly ring: (Readonly<DiagnosticEvent> | undefined)[];
  private cursor = 0;
  private count = 0;
  private nextId = 1;
  private snapshot: readonly Readonly<DiagnosticEvent>[] = Object.freeze([]);
  private dirty = false;
  private readonly listeners = new Set<() => void>();

  constructor(readonly capacity = DIAGNOSTIC_HISTORY_LIMIT, private readonly clock: () => number = Date.now) {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 2000)
      throw new RangeError('Diagnostic capacity must be an integer from 1 to 2000.');
    this.ring = new Array(capacity);
  }

  /** Malformed packets/clock failures are dropped, never thrown into a producer. */
  record(input: DiagnosticInput): Readonly<DiagnosticEvent> | undefined {
    try {
      if (!input) return;
      const {severity, subsystem: rawSubsystem, message: rawMessage} = input;
      if (!DIAGNOSTIC_SEVERITIES.includes(severity)
        || typeof rawSubsystem !== 'string' || typeof rawMessage !== 'string') return;
      const subsystem = rawSubsystem.trim().slice(0, DIAGNOSTIC_SUBSYSTEM_LIMIT);
      const message = rawMessage.slice(0, DIAGNOSTIC_MESSAGE_LIMIT);
      const timestamp = this.clock();
      if (!subsystem || !message.trim() || !Number.isFinite(timestamp) || Math.abs(timestamp) > 8.64e15) return;
      const event = Object.freeze({id: this.nextId++, timestamp, severity, subsystem, message});
      this.ring[this.cursor] = event;
      this.cursor = (this.cursor + 1) % this.capacity;
      this.count = Math.min(this.count + 1, this.capacity);
      this.changed();
      return event;
    } catch { return; }
  }

  clear(): void {
    if (!this.count) return;
    this.ring.fill(undefined); this.count = 0; this.cursor = 0;
    this.changed();
  }

  /** Stable identity until a mutation, oldest first. Suitable for useSyncExternalStore. */
  getSnapshot = (): readonly Readonly<DiagnosticEvent>[] => {
    if (this.dirty) {
      this.snapshot = Object.freeze(Array.from({length: this.count}, (_, i) =>
        this.ring[(this.cursor - this.count + i + this.capacity) % this.capacity]!));
      this.dirty = false;
    }
    return this.snapshot;
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {this.listeners.delete(listener);};
  };

  private changed(): void {
    this.dirty = true;
    // A broken observer cannot prevent retention or the original error handling.
    for (const listener of this.listeners) { try {listener();} catch {} }
  }
}
