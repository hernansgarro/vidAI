# P5 — Independent maintained-grid integrity audit

**Fork testing only.** Base P4 `c0dda9aaca99743addcb0fd58f75ca7b046cd908`,
branch `feature/grid-integrity-p5`. [Scope and acceptance registered before coding](https://github.com/hernansgarro/vidAI/pull/110#issuecomment-6645849246).
Upstream #67/#57 were consulted read-only. Integration/publication and exact
validation receipts belong in the internal PR, not an upstream completion claim.

## Running and timing

Open **Ecology & Physical Settings → Advanced Settings → Audit grid now**.
The action runs on the authoritative Worker between complete fixed ticks,
including at 0x, then opens **System diagnostics**. The fallback main-thread
runtime uses the same observer at its own authoritative boundary. Auditing
never reads the render replica as its reference and never repairs membership.

**Periodic grid integrity audit (60 simulated seconds)** is OFF by default.
The toggle is session-only, outside simulation settings, snapshots and local
storage. Closing either window does not stop an enabled observer. Reloading
starts disabled. Results use subsystem `grid-integrity`, wall-clock display
from P3, and simulated time in every audit message. A clean audit emits one
`info` summary; defects emit an `error` summary and investigation details;
truncation emits a `warning`. Ordinary Worker error/pause behavior is unchanged;
an integrity mismatch reports evidence without pausing or correcting physics.

| Event | Clock behavior |
| --- | --- |
| Enable | First deadline is current authoritative simTime +60 s |
| Pause / 0x | No ticks, no periodic audit; manual audit still works |
| 1x/2x/5x/10x/20x/MAX | Same fixed simulated interval; wall duration depends on actual throughput |
| Repeated unchanged configuration | Keeps the current deadline |
| Manual audit | Does not postpone or reset the periodic deadline |
| Disable, then enable | Cancels the old deadline and starts a new 60 s interval |
| Restart/import/world replacement | Keeps the session toggle and starts a new interval from restored simTime |
| Large clock jump | At most one audit at the next boundary; next deadline is that time +60 s, no catch-up burst |

The scheduler allows 1e-9 s rounding slack for repeated fixed 1/60 additions.
Historical finite timestamps too large to represent a +60s deadline remain
manual-only until a reset with a representable clock; nonfinite transient clocks
do not fire periodic audits. This prevents accidental per-tick audits.
No wall timer, substep audit, frame-driven Worker audit or audit on every
command is installed. Disabled mode performs only a constant scalar check per
authoritative host tick; no reference, cell scan or report is constructed.
Headless `stepSimulation` callers do not acquire an automatic observer.

## Independent reference and inspection

`auditWorldGrid` enumerates current authoritative arrays by object identity,
not textual ID. It reconstructs individual nutrient/carrion radius squares,
egg radius16 squares, independently rotated body-part corner AABBs, and whole
organism squares. Dissolving organisms are excluded. Whole-organism bounds
recompute P2's pure, validated descriptor from current anatomy and its current
pose; the auditor does not reuse P4's cached descriptor or stored bounds.
There is no shadow-world simulation, random draw or lifecycle synchronization.

P1 exposes raw bucket inspection and ownership checks; P4 exposes roster/local
handle agreement and overflow inspection. These read-only traversals do not use
query APIs, stamping, deduplication, sorting, registration or relocation. A
missing world grid is a reported failure; the auditor does not initialize one.
Expected inclusive cell coordinates independently apply P1's documented128-unit
cells and 1e-7 boundary slack. Correct observed memberships are counted against
expected rectangle area without enumerating potentially enormous outside ranges.

The checks identify:

- Missing or extra authoritative object/view handles, including obsolete
  objects retained after replacement/removal and duplicate handles for an entity.
- Duplicate authoritative object references and duplicate raw cell memberships.
- Incorrect nutrient/carrion/egg/body-part/organism categories or view tags,
  source-array/part ranks and obsolete part-owner references.
- Stale physical bounds, wrong occupied cells, missing cells and wrong handle
  cell ranges, including movement within a single cell.
- Missing/inactive/foreign registrations, stale entity-local handles and bucket
  references absent from the maintained roster.
- Matrix entry, membership and occupied-cell counter mismatches and exceeded
  membership limits. Category bucket populations are checked against reference
  identities; P1 has no separate stored per-category counter to compare.

Reports include view/index, part index, bounded textual ID and relevant cell
coordinates/ranges when applicable. One root defect may cause several findings;
`issueCount` counts findings, not distinct physical objects or root causes.
Malformed state/inspection exceptions become `Audit could not complete` errors,
never a false clean result. This is detection, not a proof against arbitrary
malicious runtime code or every possible memory corruption.

## Legitimate overflow and resource bounds

P4's outside-capacity, unbounded-arithmetic and membership-budget overflow Set
is an intentional unconditional candidate path. Its entries must still match
authoritative identities, categories, ranks and independently computed bounds,
be unregistered, and have no matrix cells. In-capacity overflow is not itself an
error: P4 admission depends on prior budget pressure, and later relocations can
free capacity during the same transaction. Current spare capacity cannot prove
that an earlier admission failed incorrectly. P4 stores no rejection-history
certificate; P5 does not invent one or force a retry. Tests cover this limitation.

Expected/reference maps and observed membership counts are released at the end
of each audit. Work is O(matrix slots + actual memberships + entity roster +
sum of squared part counts for fresh P2 descriptors). Retained memory is
O(entity/view count + occupied slots), not a second persistent spatial index or
an unbounded all-pairs comparison. Missing cells are detected by rectangle area,
not a loop through extreme imported coordinates.

Each report retains at most20 details of at most512 code units, with full finding
totals and a truncation summary. Worker pending diagnostics retain at most64
events plus one dropped-count summary in a frame; frame acknowledgements still
limit transport to one frame in flight. P3 retains only200 session rows, bounded
scalar text, no entity references. A stalled observer can lose old diagnostic
details with an explicit dropped count. History survives imports, so simulated
timestamps should be interpreted alongside surrounding import/lifecycle events.
No high-frequency automatic producer or background audit starts by default.

## Verification and boundaries

Controlled corruption tests cover all reported defect families, and compare
raw grid/local metadata/counters/query stamps and complete saved state before
and after audits. Fresh reference checks cover rotated/branched/separated bodies,
exact cell edges, duplicate IDs, nutrient/carrion/egg views, both tube directions,
nonfinite and budget overflow, all physics regimes and historical imports.
P3's immutable12-scenario/144-hash references remain unchanged: observed and
unobserved ticks/continuations preserve physical/neural/learning/energy/PRNG
state. Scheduler/host tests cover 60 s, pause, enable/disable, manual deadlines,
reset/import and bounded transport. Built real-Worker tests exercise the actual
protocol, paused commands, periodic MAX and exact direct continuation. Browser
cases in the existing Chromium/Firefox observer group cover both runtimes,
manual console results, paused clock, toggle persistence, keyboard isolation,
phone bounds and unchanged snapshots/settings/metadata.

P1/P2 isolation assertions now permit the authorized P5 reader, in addition to
P4. Existing geometric, golden, physical and state assertions remain intact.
No P6 overlay, P7+ consumer query migration, physical/genetic/energy change,
save/schema/baseline reset, main/upstream write, upstream PR, actual Wiki
publication or new performance experiment is included. Diagnostic cost is real
when requested; no speedup or ecological improvement is claimed.
