# P10.5 — incremental upkeep and audited repair (candidate, STOP)

**2026-11-05; fork topic branch only, NOT integrated or published in testing.**
Base: `hernansgarro/vidAI:testing` `de658fd90e48154cc83d6d4ea6c22a4f82f0afa1`.
Branch: `feature/incremental-grid-p10-5`; internal draft PR targets `testing`.
Scope registered before coding in [existing decision PR120](https://github.com/hernansgarro/vidAI/pull/120#issuecomment-6666008234).
Canonical upstream #67/#57 consulted read-only. Main, upstream, historical
references, testing baseline/identity and research branches are unchanged.
P10 is evaluatively closed by the owner: preserve A/C rejection and B's128-item
large combined-food filter. No P11/P12, 3D, tuning, schema or release work.

## Normal maintenance and explicit external edits

Removed normal full-roster `synchronize()` calls at tick entry, after the
nutrient cycle, before vision and at tick completion. `prepareTick()` now does
only constant-time roster reference/length checks in steady normal execution.
It permits one complete initial kernel preparation and one-off reconciliation
when an external caller replaced a roster or changed its length between ticks.
`acceptRosterChanges()` records completed internal transactions without scans.

Additional former complete reconciliations replaced:

| Boundary | Candidate operation |
| --- | --- |
| `addNutrients` | Register newly appended food only, then accept roster lengths |
| Nutrient-cycle compaction | Remove exhausted/expired food; update retained geometry/rank in the existing physical loop; register new mineralization fragments |
| Tube full-record transfer | Remove old organism/coarse/part handles and register its replacement at the same index |
| Topology edits | Existing organism translation hooks plus targeted particle projection hooks |
| Clear free nutrients | Remove the filtered entries, refresh surviving food ranks, accept replacement roster |
| World resize | Synchronize each translated organism/particle in its existing mutation loop |

Existing immediate hooks remain for nutrient/egg motion, carrion merge/growth,
bite-induced radius growth/shrink, category changes, births/hatches/laying,
death/dissolution/removal, every completed integration/joint projection,
each contact positional correction, external translation and particle handoff.
Individual parts remain independently indexed. Physical geometry/wrappers and
pass-local contact-pair order are unchanged. Splices refresh ranks only when
collections actually change, rather than rescanning them on every tick.

Full enumerations deliberately retained:

- World initialization/validated import; first kernel preparation supports
  fixtures edited after creation but before their first tick.
- Explicit `synchronizeMaintainedGrid(state)` / `grid.synchronize()` and new
  exception-safe `editSpatialState(state, () => { /* external edits */ })`.
- Constant-time-detected external roster replacement/length change at next tick.
- Physical nutrient/egg/organism lifecycle and geometry loops, actual resize or
  topology mutation, rank refresh after a real splice, contact pass wrappers.
- P5 independent references/raw-cell inspections only on requested manual or
  due60-simulated-second audits; bounded recovery scans only after logged defects.
- P6 optional overlay inspection and unavoidable snapshot/frame serialization.

**External/headless contract:** after initial setup, arbitrary raw pose/anatomy
writes or same-length in-place roster reorder/replacement must be enclosed in
`editSpatialState`, followed by explicit synchronization, or use targeted grid
hooks before any query/audit/tick. The constant-time guard cannot detect arbitrary
raw field writes or same-length index assignment. Application commands use hooks.
No Proxy/deep scan/hidden audit is installed. This explicit API requirement is a
material compatibility boundary compared with P10's automatic per-tick scans;
callers must not assume arbitrary mutation is discovered automatically. Direct
whole-array replacement and length changes retain next-tick compatibility.
The audit detects unsupported unannounced edits but does not make them a valid
normal maintenance strategy. No discovery guarantee exists with auditing off.

## Independent audit and targeted recovery

`auditWorldGrid` remains a pure detector, inspecting fresh authoritative
identities/anatomy/pose against raw buckets/handles/counters without sync or query
stamping. `GridIntegrityObserver` collects affected identities transiently:

1. Emit the original findings, bounded details and truncation warning first.
2. Diagnose missing/extra/duplicate handles, stale local owner, category/view,
   bounds/radius, ranks, wrong/missing cells, registration and overflow corruption.
3. Remove precisely affected handles from raw buckets without trusting corrupt
   range/kind metadata; detach foreign handles without changing their owner.
4. Register only affected authoritative records, or remove obsolete ones.
   Coarse anatomy is freshly calculated on repair. Part repair is individual.
   Recount diagnosed derived counters; do not reconstruct all memberships.
5. Run a fresh independent reference/raw inspection and classify each attempted
   entity/counter repair as succeeded or failed. Report unsafe identities,
   incomplete inspection, caught operations and remaining findings explicitly.

`discardForRepair` traverses raw matrix slots to find affected handles and
recount derived counters. This is optional recovery work, not normal maintenance
and not a whole-roster rebuild. Untouched records/memberships keep identity.
Repair never moves or mutates physical objects, genomes, reserves, PRNG or saves.
A missing whole grid, ambiguous duplicate authoritative identity or invalid
physical anatomy cannot be safely reconstructed by moving/tuning the object;
those failures remain visible. One defect can produce multiple findings.
Findings and repair units are different counts; diagnostics label both.
Reports retain20 original and20 repair details plus explicit omitted counts;
Worker pending64 events/P3 history200 remain bounded.

## Deterministic severity and authoritative pause

Severe original findings: missing/extra/duplicate entries/cells; wrong category,
view, part index or owner; wrong/missing cell coverage, registration or overflow;
corrupt counters; nonconservative stale bounds; incomplete independent inspection.
Pure source-array rank staleness and bounds that still enclose the complete fresh
reference are nonsevere unless another severe finding coexists. Severity uses
original evidence and never depends on timing or repair outcome.

`Pause on severe grid inconsistency` is independent of periodic enablement and
OFF by default. Both are session-only controls, never settings/snapshot fields.
Neither a pause preference nor a clean audit schedules an audit or pauses.
Manual audits work with periodic auditing off and at0x. A severe manual/periodic
finding first logs, attempts recovery and independently verifies, then requests
0x even if repaired. Host callback sets authoritative speed0. Worker pump checks
after each complete host tick and clears pacing debt before breaking the batch.
A one-shot frame notification updates the toolbar. Fallback uses the same
observer and exits its frame batch after the completed tick. Imports preserve
session preferences and reset only the existing audit deadline. No solver
operation is interrupted; fixed tick arithmetic/order is unchanged.

## Equivalence and limited performance evidence

Untouched detached P10 versus candidate, using unchanged `check-p10-reference.ts`:
52 fixed cases,353 complete snapshots/301 ticks, ordered event/energy receipts
and100,261 mechanical observations deeply AND byte-identically equal. Full output
110,386,797 bytes each; SHA256
`575243d8a90bf4e2c738a31171e7eb66689f7ba797bd3fe66a45ab9771bbaaec`.
[Receipt](evidence/p10-5/complete-equivalence.json). Inherited references unchanged.
Coverage includes P7/P8 imported-radius/merged-carrion exceptions, P9 pair/order/
impulse/projection semantics, brains/learning/PRNG, historical imports, tubes,
feeding/vision/contact and full continuation. New tests additionally disable
repeated reconciliation after initialization and inspect independent integrity.

[Protocol refinement before timing](https://github.com/hernansgarro/vidAI/pull/120#issuecomment-6666261528).
Exactly4 count-only plus16 timed windows, no failure/incomplete/retry/replacement.
Node24.22.1, compiled `SimulationHost`/kernel in dedicated Node Workers; seed73,
275 food,0 or2 creatures,2400x1500, closed-v1/decay-v2/passive-work-v3, no inflow.
60 disposable warmup ticks then exact reset. Each timed window3600 fixed ticks;
normal audit OFF/ON, one clean audit at60s when enabled. Two reversed-order rounds.
Largest window3.239s <30s; complete orchestration29.695s <300s. All complete
endpoints equal across source/audit/round within each scene. No repaired defects
were observed in correctly maintained timed scenes (this is not a lifetime rate).

| Creatures / audit | P10 time range ms (median) | Candidate time range ms (median) | Median time change |
| --- | --- | --- | --- |
| 0 / OFF | 472.849–571.823 (522.336) | 252.018–279.486 (265.752) | -49.12% |
| 0 / ON | 517.360–549.692 (533.526) | 254.818–333.241 (294.029) | -44.89% |
| 2 / OFF | 3044.800–3238.248 (3141.524) | 2515.932–2707.164 (2611.548) | -16.87% |
| 2 / ON | 3030.089–3123.296 (3076.693) | 2424.357–2528.703 (2476.530) | -19.51% |

Steady120-tick counts, instrumentation in separate nontimed windows:

| Scene | Global sync calls P10→candidate | Roster entity/part visits | Food sync calls | Organism sync calls | Bounds / ray queries |
| --- | --- | --- | --- | --- | --- |
| 0 creatures | 480→0 | 132000→0 | 165000→66000 | 0→0 | 0 /0 unchanged |
| 2 creatures | 480→0 | 138240→0 | 165003→66003 | 6833→5873 | 15847 /3000 unchanged |

Timed-window operation fields are uninstrumented zero placeholders, NOT measured
absence of local updates/queries. Only `counts:true` rows contain operation
observations. Food sync still occurs at cycle and motion boundaries. This is
whole-kernel throughput evidence for these small scenes, not a query microbench,
browser pump/transport benchmark, UI refresh/FPS result or global game speedup.
One normal audit's marginal cost is NOT isolated: ON/OFF median differences
include repeat/order/JIT/noise and even reverse sign in populated scenes.
Do not infer free/negative audit cost. No broader P11 campaign was started.
[Raw](evidence/p10-5/worker-kernel-cost.json), exact compiled probes and SHA256
manifest are retained alongside `scripts/measure-incremental-grid.mjs`.

Legacy constructor inventory: active simulation/contact/maintained modules have
no `new OrderedSpatialIndex` or `new NutrientSightGrid`. `sightBroadphase.ts`
retains its old class and runtime import of `OrderedSpatialIndex`, but only
historical tests import that module; no production entrypoint reaches it.
`centralSpatialGrid`, `maintainedGrid`, `creatureEnvelope`, `gridIntegrityAudit`
and `spatialDiagnostics` import `SpatialBounds` as a TYPE. Old constructor calls
remain in spatial-index, central-grid and feeding/optical reference tests.
No historical source/test oracle was deleted. Contact body wrappers/AABBs and
ordered per-pass pair arrays remain intentional production work.

## Validation status, retained failures and mandatory STOP

- npm ci passed.210 inherited focused tests passed.702/702 fast tests passed on
  the candidate before the last additional anatomy/counter test. No skips.
- Build first failed TS2367 because TypeScript narrowed speed before `host.tick`;
  runtime boundary query now calls `host.isPaused()`. Subsequent build passed.
- Actual production-built Worker gate passed, including added test-only boot
  injection: manual repair/physical snapshot equality, independent pause toggle,
  periodic severe repair then exact60s/3600-tick0x stop, no extra MAX batch ticks,
  stable paused exports and exact full direct continuation. Test injection wraps
  the unchanged compiled Worker; production contains no corruption command.
- Browser controls were authored but NOT run locally; no browser installation.
  They extend Worker/fallback audit preferences/import/state checks and add a
  real Worker/toolbar severe manual pause. Mandatory final-head Chromium,
  Firefox, toolbar, side-window and aggregate validation remains pending.
- Correction1: extra-record test spliced index0 then incorrectly called index1
  untouched despite stale rank. Pop the last entity instead; focused1/1 passed.
- Correction2: new owner-corruption test selected untouched parts through the
  deliberately corrupted owner reference. Select physical identities instead.
  Rerun then reached a DIFFERENT faulty fixture: `width +=500` exceeds valid
  envelope anatomy, and the auditor correctly reports `Invalid envelope part
  geometry`,0 attempted/0 succeeded/unsafe2. The test wrongly expects success.
  Part-pose/owner repairs succeed; counter-only repair succeeds and independently
  clears all3 findings in a narrow diagnostic. Invalid authoritative anatomy
  must remain unsafe; do not change physical validation to make this test pass.

Both of TWO targeted harness cycles are used; ZERO unchanged retries. Original
logs and second failure are preserved in `evidence/p10-5/`. STOP before a third
harness edit/test cycle or extra expensive campaigns. Final-head full fast/build/
Worker/browser gates are NOT complete; there is a known failing new test.
No merge/publication is allowed. Preserve this draft and ask the owner to
explicitly authorize one bounded third cycle: use a VALID anatomy change to
exercise coarse-envelope repair, retain a separate invalid-anatomy unsafe case,
then run focused tests and the mandatory final-head checks once. Stop on further
unresolved failure; no threshold/timeout/baseline/assertion weakening.

No intended unpushed work after branch/PR preservation. Upstream submission is
not approved, and main/testing publication is not claimed.
