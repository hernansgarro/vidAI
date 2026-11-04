import React, {useEffect, useRef, useState, useSyncExternalStore} from 'react';
import {DIAGNOSTIC_SEVERITIES, DiagnosticEventStore, filterDiagnosticEvents, type DiagnosticSeverity} from './diagnosticEvents';

const severityColor = {info: 'text-cyan-300', warning: 'text-amber-300', error: 'text-rose-300'};

/** Subscribes only while visible; the application-owned store keeps collecting while closed. */
export function DiagnosticsConsole({store, onBack}: {store: DiagnosticEventStore; onBack: () => void}) {
  const events = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [severity, setSeverity] = useState<DiagnosticSeverity | ''>('');
  const [subsystem, setSubsystem] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {heading.current?.focus();}, []);
  const subsystems = [...new Set(events.map(event => event.subsystem))].sort();
  // Keep a selected subsystem available even when retention/clear removes its last row.
  if (subsystem && !subsystems.includes(subsystem)) subsystems.push(subsystem);
  const visible = filterDiagnosticEvents(events, {severity: severity || undefined, subsystem: subsystem || undefined});
  return <section aria-label="System diagnostics" className="flex flex-col min-h-0 gap-3">
    <h2 ref={heading} tabIndex={-1} className="font-bold text-cyan-300 text-sm">System diagnostics</h2>
    <p className="text-slate-400">Session history only. Oldest events are discarded after {store.capacity} entries. Reloading clears history.</p>
    <div className="flex flex-wrap gap-2 items-end">
      <label className="flex flex-col gap-1 text-slate-200">Severity
        <select aria-label="Diagnostic severity" value={severity} onChange={e => setSeverity(e.target.value as DiagnosticSeverity | '')}
          className="bg-slate-950 border border-slate-600 rounded p-1">
          <option value="">All severities</option>
          {DIAGNOSTIC_SEVERITIES.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-slate-200 min-w-0">Subsystem
        <select aria-label="Diagnostic subsystem" value={subsystem} onChange={e => setSubsystem(e.target.value)}
          className="bg-slate-950 border border-slate-600 rounded p-1 max-w-full">
          <option value="">All subsystems</option>
          {subsystems.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => store.clear()} disabled={!events.length}
        className="border border-rose-400/50 text-rose-300 rounded px-2 py-1 disabled:opacity-40">Clear history</button>
    </div>
    <p className="text-slate-400" data-testid="diagnostic-count">{visible.length} shown / {events.length} retained / {store.capacity} maximum</p>
    <ol aria-label="Diagnostic events" className="overflow-y-auto max-h-72 space-y-2 min-h-0">
      {[...visible].reverse().map(event => <li key={event.id} data-testid="diagnostic-event"
        className="rounded border border-slate-700 bg-slate-950/70 p-2 break-words [overflow-wrap:anywhere]">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <time dateTime={new Date(event.timestamp).toISOString()} className="text-slate-400">{new Date(event.timestamp).toLocaleString()}</time>
          <span className={severityColor[event.severity]}>{event.severity}</span>
          <span className="text-slate-300">{event.subsystem}</span>
        </div>
        <p className="text-slate-100 whitespace-pre-wrap mt-1">{event.message}</p>
      </li>)}
    </ol>
    {!visible.length && <p className="text-slate-400">{events.length ? 'No events match these filters.' : 'No diagnostic events recorded.'}</p>}
    <button type="button" onClick={onBack} className="text-cyan-300 border border-cyan-500/40 rounded py-2">Back to advanced settings</button>
  </section>;
}
