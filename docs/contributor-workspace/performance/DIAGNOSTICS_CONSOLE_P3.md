# P3 — Observer diagnostics console

**Contributor testing only.** Based on P2 testing
`15563e92581b2cd0e2395b7c4427f82ac42a677e`; canonical upstream #67/#57
remain read-only for this task. Scope and acceptance were recorded before coding
in [internal P2 PR108](https://github.com/hernansgarro/vidAI/pull/108#issuecomment-6641268494).
Validation, internal P3 PR, integration and publication receipts belong in that PR.

## Access and behavior

Open **Ecology & Physical Settings → Advanced Settings → System diagnostics**.
The existing draggable/resizable window expands for the console and remains
bounded by the tank viewport. Events appear newest first, with local wall-clock
date/time, severity (`info`, `warning`, `error`), subsystem and description.
Filters combine exact severity and subsystem; they do not discard stored events.
**Clear history** removes every event, including hidden filtered entries. It
leaves the current filters selected. **Back to advanced settings** or Escape
returns to the checkboxes and focuses the console entry. Another Escape closes
the advanced window. Console keyboard actions do not trigger simulation shortcuts.

History belongs to the application session, survives closing/reopening the
console and world imports/restarts, and is discarded on application reload.
It is not included in snapshots, metadata, local storage or sensory data.
No export control or periodic polling is installed.

Current producers are deliberately sparse:

- Worker initialization (`info`, `worker`), unavailable Worker/fallback
  (`warning`, `worker` or `runtime`), explicit `?mainthread` (`info`, `runtime`).
- Existing client-reported Worker errors (`error`, `worker`); the pre-existing
  visible notification and pause behavior remain in place.
- Successful snapshot restoration (`info`, `persistence`), rejected oversized
  imports (`warning`, `persistence`) and failed imports (`error`, `persistence`).

These entries describe real host operations or failures. No synthetic integrity
pass, per-frame event or automatic collection of global browser errors is added.

## Reusable bounded API

`DiagnosticEventStore` in `diagnosticEvents.ts` exposes:

```ts
const history = new DiagnosticEventStore(); // default 200 entries
history.record({severity: 'error', subsystem: 'grid-integrity', message: '...'});
const rows = history.getSnapshot(); // immutable, oldest first, stable until mutation
const stop = history.subscribe(() => { /* observer notification */ });
stop();
history.clear();
```

A fixed-size ring overwrites its oldest entry in O(1). Capacity is restricted to
1–2000 (default 200); messages are truncated to 2048 UTF-16 code units and subsystem
names to 64. Only scalar event fields are copied, so no creature/world reference
or arbitrary payload is retained. IDs continue across clear; timestamps are
finite JavaScript-date milliseconds from an injectable display-only clock.
Invalid inputs or clock failures are dropped. A failing subscriber cannot
interrupt another subscriber or the original producer's error handling.
Snapshots are frozen and materialized lazily; callers retaining old snapshots
own those copies. The store itself retains at most the ring and one bounded
snapshot. `filterDiagnosticEvents` provides a pure, combined exact-match filter.

`DiagnosticsConsole` uses `useSyncExternalStore` only while mounted. Closing it
unsubscribes; the app's single store continues collecting without React updates
or a polling timer. Text is rendered through React escaping, never HTML.

## Isolation and future integration

The event module imports no simulation dependency. Existing Worker protocol,
acknowledgements, scheduling, frame frequency, kernel, P1 matrix, P2 envelope,
physics, energy, genetics, learning, source ordering, PRNG and save schemas are
unchanged. Logging has ordinary observer allocation/render cost; it makes no
throughput or exact wall-clock timing guarantee. It never determines ticks or
physical results.

A future grid-integrity producer can feed the same scalar input shape from its
host boundary. **There is no Worker diagnostic transport, P1/P2 runtime wiring,
P4 membership maintenance, P5 auditor/manual action/timer, or P6 overlay here.**
No main/upstream merge, release bump, baseline reset, workflow edit or actual Wiki
publication is included.

## Verification

Eight new fast cases cover retained field immutability, multiple ring wraps,
clear/IDs, bounded payloads, malformed packets/clocks/capacity, combined filters,
subscription cleanup/failure isolation, exact saved neural/physical/energy/PRNG
state after paired ticks, and source isolation. The existing fast suite remains
intact. Browser cases exercise Worker and main-thread modes, real rejected and
successful imports, live updates, history while closed, filters/clear/empty
states, timestamp, literal hostile text, focus/Escape/Space behavior, phone bounds
and exact unchanged snapshots/metadata. A separate case exercises actual Worker
constructor failure and its retained warning. They are appended to the existing
observer-preferences browser group, so both established Chromium and Firefox CI
shards run them without changing workflow configuration. Actual production Worker
checks and build/typecheck remain required.
