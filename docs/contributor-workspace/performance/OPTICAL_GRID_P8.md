# P8 — Optical broadphase on maintained spatial membership

**Fork testing only, 2026-11-05.** Base P7
`db1ff0265dca0107508bf1b26b7156dbdf7d67c3`, work branch
`feature/maintained-grid-p8-vision`.
[Scope registered before coding](https://github.com/hernansgarro/vidAI/pull/113#issuecomment-6651145485).
Canonical upstream AGENTS, performance #67 and handoff #57 were read-only.
No main/upstream mutation, upstream PR, native board transition, issue completion,
actual Wiki publication, P9 contact migration or P10 cache/order optimization.
Internal PR holds check/merge/publication receipts. No speedup is claimed.

## Consumer and phase contract

Optical rays query P4 `MaintainedWorldGrid.queryRay` with `nutrient`, `carrion`,
`egg` and `body-part` kinds. The existing comparator/sort restores combined food
source order, then egg source order, then organism source order and segment
index. Food kinds are not sorted into separate groups. Whole-organism coarse
entries do not enter vision. Existing ascending source order and strict distance
comparisons preserve equal-hit winners; segment edge traversal stays 0,1,2,3.

Removed: tick-local `bodySight` wrappers/corners/bounds, `eggSight` wrappers,
`foodSight` wrappers, mixed `sightEntries`, `sightGrid` construction and
`sightFoodCount` count-triggered reconstruction. `simulation.ts` no longer
imports `OrderedSpatialIndex`/`SpatialBounds`. Standalone legacy spatial-index
modules/tests and the physical contact and hatching broadphases remain.

P4's existing synchronization after particle motion/egg processing establishes
pre-movement optical geometry. Every organism senses/learns before physical
movement begins. Corpse removal updates ranks; carrion append or merge calls
`syncFood` immediately. No new full-grid reconstruction or roster pass is added.
Corners for a retained part are evaluated from its unchanged pre-movement pose
at exact testing time, without a new cache. Exact tests still read live food,
egg and part geometry. Body pigment is read on the winning intersection, after
any earlier animal's learning debit; no RGB is frozen into grid membership.
Circle/edge intersections, historical prefilters, strict nearest-hit tests,
occlusion, attenuation, spectral response, ray diagnostics, neural inputs,
recurrent evaluation and learning arithmetic remain unchanged.

P4 outside-capacity/budget/arithmetic-overflow entries remain unconditional.
Nonfinite ray endpoints or deltas fail open to all requested entries via P7's
bounded query path. Finite corridors remain matrix-clipped without clipping
entities. Queries deduplicate and retain the existing sort; no P10 feature.
P5 audits do not repair membership and P6 still reads actual matrix assignments.

## Disclosed P7 continuation difference: capped carrion growth

A new fixed control exposes an inherited optical false negative. With 2200
particles, closed-economy corpse recycling merges into the first existing
carrion. Its radius grows from8 to about39.6 without changing collection length.
An earlier observer has already built P7's transient optical index. The later
observer casts at y126; carrion centered at y150 originally occupies row1, while
the ray corridor occupies row0. P7 uses the new radius in exact tests but never
supplies this candidate because its old membership remains in row1.

P8 consumes P4's already updated membership. Its center ray hits carrion at
`110.96315656636457` world units instead of P7's empty-water range500. It receives
RGB approximately `(0.628684, 0.314342, 0.277669)` instead of black; the distance
input and ensuing recurrent state differ consistently. No new optical rule is
introduced. This difference follows the requested current-phase/carrion and
no-false-negative requirements, **not a performance improvement**. Exact P7
continuation is not claimed for this case or its downstream trajectories.
A same-cell capped-merge control remains fully equal, demonstrating that the
changed candidate membership, not altered color/geometry/energy math, causes it.
The fixed one-tick ordered energy receipts/events and closed stock remain equal.

P7's independently approved imported-nutrient radius correction remains intact:
the two radius-growth feeding controls retain2880 J and both48 J receipts.
P8 adds no snapshot normalization, compatibility cache, schema change or hidden
state. All inherited P3/P6 references, physics hashes and experiment archives
remain unchanged. The new P7 reference records its original result, including
this capped-carrion miss; it is not refreshed to P8 behavior.

## Correctness evidence and reproduction

`tests/support/optical-grid.ts` combines the28 inherited feeding controls with14
new optical controls. Anatomy, rotated/overlapping segments, source/part ties,
food/egg/body priority, opaque spectral loss, dynamic pigment, same-tick carrion,
capped merges, boundary tangency, left/right tubes, historical import and all
four physics regimes are represented. These are fixed correctness controls,
not ecological/performance trials or reruns of historical experiments.

The same fixture/reference script ran on detached untouched P7 and P8 using the
same installed dependencies. Deep equality compares42 cases,303 COMPLETE
snapshots across261 ticks, including rays/neurons/learned state, physical/genetic
state, settings, PRNG and energy, plus ordered event/energy receipts.41 cases
match completely. Only the cross-cell capped-carrion control differs at its
final snapshot as disclosed above. NEW P7 hashes/receipt hashes are retained in
`tests/fixtures/optical-grid-p7.json`; no inherited baseline is modified. These
Node references do not assert cross-engine transcendental-math identity.

To reproduce, copy only the new optical-scene/optical-grid fixture files and
`scripts/check-optical-grid-reference.ts` into a detached checkout of the exact
P7 base, then run `node --import tsx scripts/check-optical-grid-reference.ts
/tmp/p7-optical.json` there and with `/tmp/p8-optical.json` in P8. Compare the
complete JSON objects; retain the disclosed capped-merge difference.

49 focused tests cover the42 reference cases plus current legacy candidate
identity/order equivalence with unconditional overflow, P5 before every optical
query without repair, explicit impacts/ties/occlusion/RGB/neural inputs, earlier
learning cost, closed stock, extreme/nonfinite/budget-overflow rays, P6 readback,
full split snapshot continuity and removal of optical reconstruction. The
approved P7 feeding correction and all inherited historical hashes still run.
New compiled-Worker controls exercise six optical scenes, full authoritative
state/PRNG equivalence, P5 and exact paused reset. Browser controls compare four
scenes against references evaluated in the SAME browser engine in both Worker
and fallback. Existing P6 Advanced Settings/actual overlays and all required
browser shards/aggregate remain mandatory.

Initial new-fixture checks revealed an inactive learning scene and a learning
rate above the existing import bound. The fixture was corrected before recording
final new P7 references; runtime/bounds/historical references were not changed.
The compiled-Worker reset also exposed a stale body-cost field in a new
fixture after its organs were removed; the fixture now recomputes its derived
cost before spawning. A missing test-only type import initially blocked the
build and was corrected.
Final gate results and CI links belong in the internal PR.
