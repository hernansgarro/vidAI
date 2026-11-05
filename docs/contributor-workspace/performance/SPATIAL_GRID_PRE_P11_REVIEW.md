# Maintained-grid residual work — pre-P11 source-review checkpoint

> **Fork contributor review and owner scope decision, 2026-11-05.** Source findings inspect verified P9 `testing` at `7dc593236da08b87ec978e4b887ce9536d5ddb26`; owner subsequently chose the P10.5 architecture documented below. **P10 is currently active separately; P10.5 has not been implemented, benchmarked, tested, or started.** This document is a decision/handoff on fork `main`, not an assertion of a runtime regression, performance gain, completed P11 experiment, or production promotion. Recheck the final P10 `testing` head before P10.5 coding.

## Findings supported by the P9 source

1. **The previous per-consumer transient broadphase constructors have been removed from the active feeding, optical and contact paths.** `simulation.ts` feeds through `spatial.queryBounds` for organisms/eggs/food and optically queries `spatial.queryRay`. `contacts.ts` obtains `body-part` candidates through the maintained `grid.queryBounds` and freezes each pass's ordered pair list before contact impulses. See [P7](FEEDING_GRID_P7.md), [P8](OPTICAL_GRID_P8.md), [P9](CONTACT_GRID_P9.md), and their PRs [#113](https://github.com/hernansgarro/vidAI/pull/113), [#114](https://github.com/hernansgarro/vidAI/pull/114), [#117](https://github.com/hernansgarro/vidAI/pull/117). This review does not assert that no other legacy spatial code can ever be invoked.
2. **Legacy source files still exist**: `spatialIndex.ts` implements `OrderedSpatialIndex` and `sightBroadphase.ts` implements `NutrientSightGrid`. Their mere existence is not runtime execution. `maintainedGrid.ts` and `centralSpatialGrid.ts` import **only the `SpatialBounds` type** from `spatialIndex.ts`. The primary simulation and contact modules do not import `OrderedSpatialIndex` or `NutrientSightGrid`. A later build/import/callsite inventory should establish whether any separate runtime entrypoint still constructs these classes; keep test/reference uses intact until proved redundant.
3. **Repeated roster-wide reconciliation remains.** `MaintainedWorldGrid.synchronize()` loops through **all** `state.nutrients`, `state.eggs` and `state.organisms`; `syncOrganism` also computes the whole-organism pose envelope and per-part bounding boxes. This updates current entries and diffs removals rather than clearing/rebuilding matrix buckets. `stepSimulation` invokes `spatial.synchronize()` at tick entry, before vision after food/egg lifecycle, and at tick end, plus after nutrient cycling when enabled. Direct entity-local motion/lifecycle hooks also exist. This is real repeated work even if spatial cell membership does not change. Its marginal wall-clock cost, necessity at each boundary, and risk of safe removal have **not** been measured or proved. Current behavior also protects callers that mutate authoritative rosters between ticks, so do not simply delete scans.
4. **P9 still performs indispensable per-pass physical geometry.** `contacts.ts` rebuilds body wrappers, masses, inertia, rotations and current AABBs and creates a pass-local part-to-wrapper `Map` before each pair query. It also calculates integer cell coordinates and sorts candidate pairs by legacy first-common-cell order. Those are **not** the old transient spatial buckets. Removing them blindly could break sequential solver determinism; any such change belongs in a separately proven optimization, not an unreviewed cleanup.
5. **Current query costs are not zero.** `MaintainedWorldGrid.ordered()` restores original category/source/part order by sorting each query's result; P10 explicitly evaluates safe alternatives. `queryRay`, `queryBounds`, deduplication, overflow and per-entity updates all have costs even without old index reconstruction.

## Indicator semantics and the owner's observation

`simulationPerformance.ts` and `SimulationPerformanceIndicator.tsx` have **identical Git blob SHAs** on fork `main` and P9 `testing` at review time: the color mapping did **not** change between these builds. The indicator measures **actual simulated seconds divided by wall seconds**, not render FPS or CPU percentage. In MAX mode, its visual reference is **x50**, not a hard cap. The Oklab color anchors map approximately:

| Measured MAX speed | Nominal anchor |
| --- | --- |
| x5 | Red |
| x15 | Orange |
| x30 | Yellow |
| x50 | Green |
| x65 | Cyan |
| x75 or higher | White |

The owner reports that a no-creature scene previously reached white but now appears yellow. If observed in steady MAX mode, this **may** indicate a substantial difference in actual simulated-time throughput; it is **not** conclusive without matched settings/world/environment and readback of numeric actual x rather than color alone. A no-creature simulation may still advance nutrient motion/cycles, resource economy, bubbles and grid reconciliation. Do not infer a causal slowdown from the color or suggest adjusting the scale to mask it.

## Owner decision: P10.5 — incremental-only normal upkeep, audited repair

**Decision date: 2026-11-05; implementation follows P10, not concurrently.**
The owner explicitly accepts the possibility of stale spatial membership for up to
the next **60 seconds of simulated time (nominally 3,600 fixed 1/60-s ticks)**
when an incremental update is accidentally missed, in exchange for avoiding
whole-roster safety reconciliation on each tick. This is a deliberate risk
tradeoff, **not** permission to knowingly leave a broken mutation path, omit
correctness tests, weaken the solver, or misrepresent real geometry.

The owner also approves extending the existing P5 observer from **detect-only**
to **detect → report → attempt targeted repair → independently verify**.
P5's original detection-only contract is therefore a *historical current-state
reference*, not the desired P10.5 behavior. Before coding, record the bounded
change, acceptance conditions, branch and P10 base in the existing shared
tracking context, without duplicating upstream's backlog.

### Normal authoritative simulation (required)

- Maintain food/carrion, eggs, organism coarse bounds and **individual body
  parts** incrementally at the exact mutation/lifecycle boundaries: motion,
  rotation, radius/energy conversion and growth/shrink, birth/hatch/death,
  contact/joint projection, feeding, collection reorder, tubes, paused edits,
  and other existing supported state mutations.
- **Remove normal per-tick full-roster reconciliations** that only recheck data
  already maintained by those hooks. Examine all `synchronize()` callsites
  individually, replace missing targeted hooks before deleting a safety scan,
  and test phase-current candidates. Do not make the periodic audit responsible
  for expected/ordinary entity motion.
- Full one-off initialization/rebuild remains allowed when loading/importing,
  replacing, or explicitly rebuilding an authoritative world; do not perform it
  as repeated normal-tick maintenance. Headless/external mutation contracts
  must be preserved or made explicit with correctly tested APIs; no silent loss
  of previously supported operations.
- The independent P5 audit must **not** run per tick or under the hood as a
  cheap-looking replacement for the removed full scans. Keep simulations with
  auditing disabled free of P5 full-reference enumeration.

### P5 audit: optional periodic/manual verification and repair (required)

- Retain the existing **Advanced Settings → Periodic grid integrity audit
  (60 simulated seconds)** switch, **OFF by default** for every initial world;
  also retain the **Audit grid now** manual action, including during pause.
  Keep the previously established 60-s simulated scheduling semantics,
  Worker authority, observer independence and nonserialized/session-local
  setting unless a separately approved compatibility requirement demands a
  change.
- When an audit finds a mismatch, log the **pre-repair** difference in the
  diagnostic console: simulation time, entity identity/view/category, missing,
  extra or incorrect cell memberships, and relevant old/new bounds/ranks.
  Account for missing entries, stale entries, wrong category, wrong coverage,
  duplicates, overflow and collection changes; preserve complete bounded
  diagnostics where feasible and clearly mark truncation.
- Then **attempt correction against the authoritative world state**, using
  targeted register/relocate/remove operations for affected objects and
  cells, including a carrion particle that grew into more cells. Do **not**
  move the physical entity to match its stale grid entry, silently redraw
  historical state, alter physics or invent a missing object.
- Independently recheck the affected entries after repair, record whether
  each repair **succeeded, failed, or was unsafe to attempt**, and emit an
  explicit audit summary with counts. Never claim a successful repair merely
  because a sync method was called. Failures remain visible for root-cause
  diagnosis; no silent self-healing.
- A normal update error may affect vision, feeding or contacts until the
  next audit. The owner **accepts this bounded exposure as a performance
  tradeoff**; a clean audit is not proof that no earlier tick was affected.
  Instrument counts/repair rate to support later decisions. In a long-running
  world with a disabled audit, there is **no periodic discovery guarantee**.

### Separate optional pause-on-severe control (required)

- Add **one independent Advanced Settings option**, e.g.
  `Pause on severe grid inconsistency`, **OFF by default in every initial
  menu world**, independently of the periodic audit toggle. It should not
  change simulation snapshots/historical world formats merely to store an
  observer preference; use the existing session-local observer-control model
  unless a separately approved persistence requirement applies.
- A manual audit can still detect/repair while the periodic audit is OFF.
  The pause option applies **when an audit actually detects a severe mismatch**;
  it does not secretly enable auditing or add per-tick scans.
- Before implementation, document and test a deterministic severity
  classification based on the *observed original inconsistency*, rather than
  arbitrary performance-dependent criteria. When enabled, log the anomaly,
  attempt safe correction and independently recheck it, **then request
  authoritative 0x pause** if the original anomaly was severe (even if the
  repair succeeded), leaving the event visible for investigation. Avoid
  a pause merely from a clean audit. Preserve existing stop/resume and
  fixed-tick transaction boundaries; do not pause mid-physics step.
- If the pause option is OFF (default), report/attempt repairs and continue
  normally. If repair cannot be safely performed, log failure clearly and
  preserve the original physical state. Do not guarantee uninterrupted
  correctness from optional recovery.

### Bounded performance and compatibility evidence

1. After P10 is completed or explicitly stopped, verify current `testing`
   head; inventory active production callsites for the old
   `OrderedSpatialIndex`/`NutrientSightGrid` constructors versus tests,
   tooling, fixtures and type-only imports. Distinguish obsolete source
   files from active duplicate work; do not delete historical references.
2. Observe counts and measured cost for `synchronize()`/roster iteration,
   incremental updates, query sorting, bounds and per-contact pass wrappers.
   Identify duplicate work from evidence, not visual impressions alone.
3. Protect **actual complete state equivalence with P10** in correctly
   maintained scenarios (including P7/P8 growth/optical corrections and P9
   solver order), complete snapshots/PRNG, Worker/headless behavior,
   imported saved worlds, tube transfers, off-camera simulation and
   pause/manual audits. Deliberately inject controlled stale, missing,
   oversized and mismatched memberships for independent detection,
   targeted repair, repair-failure and optional pause tests.
4. If a controlled performance contrast is needed, register a short,
   bounded owner-approved protocol comparing matched empty and populated
   worlds; report actual numeric throughput, audit off/on overhead and
   repair frequencies. Do not assert a regression or gain without matched
   measurements, and do not turn P10.5 into the P11 campaign.
5. Record outcomes and remaining risks before the P11 owner visual review.
   No production/upstream promotion is implied by a testing-only P10.5
   implementation or a passing automated suite.

### Sequencing and access boundary

**Do not touch the P10 branch, PR, evidence or fork `testing` while P10
Work is active.** This update records the owner's target behavior in fork-main
documentation **only**. When P10 has finished and its exact final head is
verified, P10.5 may start through the standard fork-first branch/PR process
with preregistered scope. Apply the
[bounded Work/CI policy](../procedures/WORK_CI_RETRY_BUDGET.md). No lost-run
repetitions, silent repairs, baseline refreshes, artificial physics tuning,
unapproved upstream writes or promotion into `main`.

**Status:** architecture and risk accepted by owner; documentation only.
No implementation, no speedup/regression verdict, no P11 campaign.
