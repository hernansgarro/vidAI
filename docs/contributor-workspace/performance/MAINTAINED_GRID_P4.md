# Maintained world grid P4 — authoritative shadow membership

**Fork testing only, 2026-11-04.** Based on P3
`ff3e786ffa0ac68046fb7a0037c147827f9711c2`, branch
`feature/maintained-grid-p4`. [Scope/decisions/acceptance registered before coding](https://github.com/hernansgarro/vidAI/pull/109#issuecomment-6642883763).
Canonical performance tracking remains upstream #67/#57, consulted read-only
because this task prohibits upstream writes. Main and upstream are unchanged.

## Ownership and views

`maintainedGrid.ts` owns one `MaintainedWorldGrid` per authoritative state through
a WeakMap. Its P1 `CentralSpatialGrid` retains the 128-unit, 1075-slot matrix
covering maximum aquarium/tube water; only P1 mutates matrix buckets. An entity's
non-enumerable symbol stores its transient handle, previous cell range, current
bounds, view and current source-array rank. Parts retain individual handles on
the physical segment. The organism handle also caches P2's immutable anatomy
descriptor. Independently owned fixtures can share an entity without mixing
handles. None of this metadata survives JSON/spread/structuredClone, render
transport or snapshots. There is no new setting, schema or Worker protocol.

| View | Payload | Category and bound | Ordering identity |
| --- | --- | --- | --- |
| Food | Individual authoritative nutrient object | `nutrient`/`carrion`, current radius square | Current nutrient-array index; duplicate textual IDs remain distinct |
| Egg | Individual authoritative egg object | `egg`, existing radius16 square | Current egg-array index |
| Body part | Individual authoritative physical segment plus owning organism | `body-part`, current rotated rectangle AABB | Organism-array index, then part index |
| Prey | Whole authoritative organism | `organism`, refreshed P2 current-pose square | Current organism-array index |

Dissolving organisms leave body/prey views, matching current sensing/contact
eligibility. Their later physical remains enter as individual carrion objects.
The lifecycle roster Set retains local records only for cleanup; it is not a
second neighbor index. Narrowphase always reads authoritative live objects.

`queryBounds`/`queryRay` combine matrix entries with explicit overflow entries,
deduplicate by handle and restore food → egg → body priority and ascending
source/part rank. Descending queries support one feeding category/group at a
time. These are preparatory APIs, **unused by existing consumer queries**.
No optical winner selection, candidate cache, feeding reordering or contact
pair enumeration is changed. Splice hooks refresh affected array ranks without
rewriting memberships; births append at their actual current index. A tube
handoff keeps simulation IDs/rank but replaces object handles for its existing
atomic record replacement, removing old objects and all their segment handles.

## Synchronization boundaries

- Initial worlds and validated restored snapshots derive fresh membership.
  Kernel callers supplying their own states initialize it on the first tick.
- Tick-entry and lifecycle-phase reconciliation diff the authoritative roster,
  refresh ranks and relocate existing entries. This is a source-array scan and
  incremental delta update, **not a matrix clear or full-grid rebuild**. It
  supports direct headless callers replacing arrays/records between ticks.
- Food motion/wall/tube projection, category conversion and bite-induced radius
  shrinkage synchronize immediately. Compacted nutrient-cycle batches reconcile
  at their synchronous transaction boundary. Carrion aggregation/spawning,
  depletion and free-food clearing register/update/remove the corresponding view.
- Eggs synchronize after motion/projection, register at laying and remove at
  predation, expiry, nonviability or funded hatching; new babies register both
  coarse and per-part views. Incubation energy has no geometric effect.
- Every completed body integration substep synchronizes its organism and parts.
  Pose-only joint repair synchronizes at the end of each complete projection
  call. Each contact pair's positional correction synchronizes both affected
  organisms before processing the next pair; contact/hinge passes therefore
  never wait for the end of the tick to update moved bounds. Individual inner
  hinge iterations remain one synchronous pose transaction, with no interleaved
  spatial query. Arithmetic, pair order, iterations and coefficients are intact.
- External translations, resize and topology changes update paused-world
  membership. Tube particle projection and full-record transfers synchronize
  before returning. Final lifecycle reconciliation removes obsolete objects
  and finishes derived-state synchronization before the next complete tick.
- Host reset validates/builds the new world first, then disposes the previous
  matrix and entity-local handles. Other unreachable worlds are weakly owned;
  no global all-world collection or old-world query cache is retained.

P1 compares old/new cell ranges. Same-category movement or shrinkage within the
same range updates current bounds **without any bucket insertion/deletion**.
A category transition changes typed buckets even if the occupied cells match.
No periodic scan, reference auditor, auto-repair or timer is introduced (P5).
The normal roster transaction is not a substitute for missing movement hooks.

## P2 limitation and bounded overflow

The solver/import contract has **no finite unconditional multi-part lifetime
radius**. P4 never uses the ideal anatomy radius as a culling guarantee. It caches
P2's birth descriptor and calls `encloseCreaturePose` after each pose transaction,
covering arbitrarily separated parts, rotation, branch and mass-weighted COM
shifts. Per-part views independently use their actual current rectangles.

The fixed matrix cannot contain every legally imported finite coordinate or
conservative pose square. An entry outside capacity, with arithmetic overflow,
or exceeding P1's bounded membership budget is removed from matrix cells and
retained in an explicit overflow Set. Every query of its category includes it
unconditionally. Bounds are never clipped, and an unbounded value never enters
P1's finite-range loops. Moving back into supported capacity/budget registers
it normally. Integrity errors other than P1 range/budget failures propagate;
they are not hidden by this fallback. Non-finite transient coordinates fail
open in the shadow broadphase rather than changing physical integration.

This preserves bounded matrix/membership allocation and no-false-negative
semantics, at the cost of extra candidates. Overflow cardinality is bounded by
authoritative entity/view counts, not by world-coordinate magnitude. No speedup,
low overflow frequency, ecological benefit or throughput comparison is claimed.
P4 adds maintenance cost while the old indexes still run.

## Verification and compatibility provenance

`tests/maintained-grid.test.ts` checks independent physical corner enclosure,
roster identity, typed membership and every matrix cell; no-op bucket mutations,
cell crossings, shrinkage, splices/reordering, duplicate IDs, categories, overflow
and budget recovery; physics/contact/joint transaction visibility; funded laying,
hatching, dissolution, mineralization, depletion, both tube directions, particle
handoff, paused commands/resizing/topology edits, reset cleanup and snapshot/frame
metadata exclusion. Mechanical-observer checkpoints verify current membership
*during* solving, so a final-tick synchronization cannot mask missing pose hooks.
This is test-only reference logic, not P5's runtime auditor.

A detached untouched P3 checkout produced the NEW reference file
`tests/fixtures/maintained-grid-p3.json`, using the same bounded fixture factory
`tests/support/maintained-grid-compatibility.ts`. Twelve scenarios /132 ticks
plus12 initial states give144 SHA256 full-snapshot references. They cover four
historical/current physics regimes, sparse/dense food+carrion, branched/rotated
and deliberately separated poses, both tube directions, closed mineralization,
funded eggs, real feeding and a v5 import. Each digest includes complete saved
state/settings/PRNG, ray hits, neural buffers, acquired learning, receipts and
energy. Existing frozen data are never refreshed. Split snapshot continuation
and energy checks compare complete states after restoration, independently of
derived membership. Browser math-runtime compatibility remains covered by the
existing Worker/browser suite; Node hashes are not asserted cross-engine.

The P1/P2 source-isolation tests now allow **only** `maintainedGrid.ts` to import
those modules at runtime, reflecting P4's explicit authorization. All original
geometry/integrity/nonmutation assertions remain. No inherited reference or
coefficient is changed. Fresh npm ci, test:fast, build, actual production Worker
and existing pinned Chromium/Firefox/toolbar/side-window gates are required.
Exact receipts, PR, final heads and publication checks belong in the internal PR.
No performance experiment or historical ecological trial is rerun.

P5 now independently observes this membership; see [P5 contract](GRID_INTEGRITY_P5.md).
P6 and query migration P7+ remain unimplemented. Source Wiki describes only
fork-testing behavior; no actual upstream Wiki publication is authorized.
