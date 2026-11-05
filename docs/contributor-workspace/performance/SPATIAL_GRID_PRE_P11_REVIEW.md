# Maintained-grid residual work — pre-P11 source-review checkpoint

> **Fork contributor review, 2026-11-05.** Examines the verified P9 `testing` source at `7dc593236da08b87ec978e4b887ce9536d5ddb26` for an owner's question about unexpected lower *apparent* MAX-speed color when no creatures remain. This is a **static source review and proposed narrow gate**, **not a runtime profile, regression finding, implementation approval, or P11 experiment**. P10 may change these paths; read back the then-current `testing` head before acting.

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

## Proposed bounded pre-P11 checkpoint (not yet authorized)

**Working label: P10.5 — residual broadphase and empty-world throughput preflight.** A proposed gate **after P10 and before the P11 owner/performance campaign**, not an automatic fourteenth implementation stage, a P11 run or permission to tune code.

A future owner-authorized task should:

1. Verify the exact candidate head and inventory **every production runtime callsite/import** of `OrderedSpatialIndex`, `NutrientSightGrid` and any remaining transient spatial container/rebuild, distinguishing compiled/runtime paths from tests, scripts, fixtures and types. Document every old path retained and why.
2. Measure counts and elapsed cost of `MaintainedWorldGrid.synchronize()`, the nested roster/part scans, actual bucket deltas, `queryBounds`/`queryRay`, sorting and physical per-pass wrapper/pair preparation. An instrumented observer must not change authoritative state, scheduling, PRNG, test references, physics or snapshot semantics; quantify observer overhead.
3. Perform an **owner-approved, short, controlled** comparison between untouched main and the P10 final candidate using *matched* no-creature/no-egg worlds with matched nutrients, cycles, tubes, world size, pause/MAX, browser, hardware, build mode and measurement window, followed by at least one representative populated world. Record numeric simulated-time x speed, actual count and grid/sync costs; distinguish Worker speed from rendering frequency. Do not equate incomparable testing/production configurations.
4. Analyze why reconciliation occurs at each boundary and whether an additional dirty-roster or versioned fast path is logically safe for **all** historical import, lifecycle, tube, paused-edit and headless mutation contracts. If the proof is incomplete, retain reconciliation and label it as a measured tradeoff, rather than weakening validity.
5. Report evidence and a go/no-go decision for P11; pursue a **separately approved** targeted optimization/PR only if source-specific cause, correctness contract and potential benefit are established.

**Resource and release constraints:** apply [bounded Work/CI policy](../procedures/WORK_CI_RETRY_BUDGET.md); no repeated experiments, no unauthorized extended browser campaigns, no extra tuning, no relaxed golden baselines, no testing branch reset and no production/upstream changes. The previous P9 correction-cycle extension does not transfer to this proposed gate.

**Status:** proposed, not executed. The source-level presence of redundant *checks* is real; any net performance regression and its cause remain unmeasured.
