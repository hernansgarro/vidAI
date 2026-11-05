# VIDA 2D — Maintained Spatial Grid, Ordered Queries, and Observer Diagnostics

> **Status (2026-11-04): fork-only design and implementation plan. P0/P1 are integrated into testing. P2 adds an isolated mass-weighted anatomy envelope and an explicit current-pose fallback; the existing solver/import rules provide no finite unconditional multi-part lifetime radius. See [P1 contract](CENTRAL_GRID_P1.md) and [P2 proof, API and limitation](CREATURE_ENVELOPE_P2.md). Integration/validation/publication receipts remain in the internal PRs. P4 maintains authoritative shadow membership without replacing existing queries; see [P4 ownership, synchronization and overflow contract](MAINTAINED_GRID_P4.md). No measured improvement, upstream acceptance or production-promotion authorization. P3 adds a bounded observer-only console under Advanced Settings; see [P3 contract](DIAGNOSTICS_CONSOLE_P3.md). P5 adds independent nonrepairing integrity inspection, manual action and OFF-by-default 60-simulated-second audits; see [P5 contract](GRID_INTEGRITY_P5.md). P6 adds optional actual-membership cell outlines and actual P4 creature enclosures; see [P6 observer contract](SPATIAL_OVERLAYS_P6.md). P7+ remains unimplemented.**
>
> **Owner intent:** keep this design in `hernansgarro/vidAI:main`; after design review, refresh the fork's `testing` branch from fork `main` while preserving its independent testing overlay and historical experiment identity, then implement and manually inspect there. No experimental performance batch is a prerequisite. Automated correctness/regression tests remain mandatory. Compare against untouched `main` after the implementation is usable. No upstream PR or upstream merge is authorized.
>
> Related canonical tracking: [upstream performance #67](https://github.com/smeagol44/vidAI/issues/67), [roadmap/handoffs #57](https://github.com/smeagol44/vidAI/issues/57); [cumulative Stage 3 findings](../../PERFORMANCE_AUDIT_STAGE_3.md), [vision alternatives](../../VISION_PERFORMANCE_DESIGN_NOTES.md). This is a technical planning breakdown, **not a second authoritative upstream backlog**.

## 1. Problem and confirmed implementation

The owner proposes a **central, persistent, incrementally maintained spatial grid** instead of reconstructing transient spatial membership on every simulation tick. The grid conservatively returns possible neighbors; exact visual ray, physical contact, and feeding logic still decide whether interactions actually occur. Spatial-grid maintenance is independent from drawing the diagnostic overlay.

Current source (both fork and upstream versions inspected on 2026-11-04):

- [`spatialIndex.ts`](https://github.com/hernansgarro/vidAI/blob/main/spatialIndex.ts) uses 128-world-unit cells backed by `Map<row, Map<column, number[]>>`. This is **hash/key lookup**, not linear search through two unsorted lists. `OrderedSpatialIndex` is built from all supplied AABBs and has **no** mutable insert/move/remove API. `query` and `queryBounds` deduplicate with an existing reusable `Uint32Array` stamping mechanism, allocate a new result array, and sort it into source-array order. Sorting is **not** needed to locate cells.
- [`simulation.ts` vision](https://github.com/hernansgarro/vidAI/blob/main/simulation.ts#L3777-L3945) builds body-part and egg visual bounds once per tick and constructs an optical index covering food, eggs, then individual **organism parts** in that order. The index is normally built once for the sight pass and queried once per emitted ray; it is rebuilt if nutrient count changes while sensing. Five rays per eye are currently emitted. The visual pass precedes physical movement.
- [`simulation.ts` feeding](https://github.com/hernansgarro/vidAI/blob/main/simulation.ts#L4093-L4229) builds a post-movement **one-entry-per-organism** prey index, and lazily builds separate individual-egg and individual-nutrient indexes. Food/egg indexes are rebuilt or invalidated after relevant collection-length changes. Each mouth consumes candidate groups in the current sequence **prey, eggs, food**, each in **descending source-array order**, with physical tests and state-changing effects in that order.
- [`contacts.ts`](https://github.com/hernansgarro/vidAI/blob/main/contacts.ts#L81-L175) indexes individual **body parts** for physical contact, not whole creatures. It already reuses body wrappers and contact cell buckets with generation stamps, while recomputing current AABBs and candidate pairs after movement/projection. Current code uses four nominal substeps per 1/60 s tick, up to eight contact passes per substep (early exit possible). These are up to 32 spatial pair-building passes, **not necessarily 32 new map allocations**.
- [`sightBroadphase.ts`](https://github.com/hernansgarro/vidAI/blob/main/sightBroadphase.ts) builds a food-specific wrapper from food center and radius. Nutrients move before sensing; organisms subsequently move before feeding.
- The current performance record identifies **11.41–11.63% of weighted sampled allocations** at `OrderedSpatialIndex.query` in Stage 3.12. This is **not** an exclusive CPU-time share, a fraction attributable to grid rebuild, or a removable saving. Stage 3.10 attributed 32.60% of an instrumented kernel tick to the **combined** vision/sight phase, not sorting alone. Earlier optical broadphase work removed the vast majority of all-object candidate checks. Actual gain from an incremental grid, matrix layout, caching, or deferred order resolution is **unknown**.

### Actual lookup granularity (question resolved from source)

| Consumer | Current index unit | Required compatibility |
| --- | --- | --- |
| Optical sensing | Food item, egg, **individual body part** | Food/egg/body priority and original part/organism array order for exact nearest-hit ties; exact ray geometry and colors |
| Solid contact | **Individual body part** | Current pair/impulse/projection order and fully current substep pose |
| Predation broadphase | **Whole organism** | Descending organism array order, actual per-part mouth contact tests afterward |
| Egg feeding | **Individual egg** | Descending egg array order and dynamic removal |
| Nutrient feeding | **Individual food item** | Descending food array order and current radius/depletion/removal |

**Design implication:** the owner asked to retain the lookup granularity actually used rather than arbitrarily choosing one entry per creature. A proposed central grid can serve *typed views/entries* at these existing granularities; a conservative creature envelope can serve as an additional coarse prefilter/visualizable bound, but must not silently replace part-level semantics and performance without review. Final choice of single mixed grid vs dedicated typed layers in one central grid service remains an implementation-level decision subject to exact query equivalence.

## 2. Owner's intended architecture and settled requirements

1. A **single central grid authority** owns the matrix of cells and its membership/query operations. Each cell holds the object references/IDs needed to return candidates without scanning all world objects. Do not build a separate neighbor collection for every creature.
2. Prefer a **matrix/direct-index layout** provisioned for the **maximum allowed aquarium size**, not merely the current aquarium dimensions. Unused cells may be inactive/empty. A flat `cells[y * columns + x]` array is one possible implementation, not a benchmarked requirement; validate coordinate clipping, unusual world bounds and tube water outside the main rectangle, and bounded memory. Default cell width currently 128 world units; changes require a separate decision.
3. **Entity-local previous membership** is permitted/preferred: a moving entity can supply its previously assigned cells (or cell-coordinate range) and current position/envelope to the central grid. The **grid** computes new membership, compares old/new, and mutates its own cell contents. There is no requirement for an additional persistent per-object registry in the grid. This ownership rule applies to individual nutrients/eggs and to whichever creature/part entries each consumer needs.
4. Synchronize after **all** movement, including self-propulsion, passive movement, contact corrections, hinge projections, tube movement and externally triggered placement; also handle creation/hatching, disappearance/death, category transitions, food shrinkage/depletion, import/restart, and world replacement. Only change cell membership if the set of occupied cells changes. Even when a pose moves within the same cells, exact interaction geometry must use current positions.
5. **Conservative, inexpensive candidate culling** is the grid's role. No exact rotated-rectangle SAT, optical edge intersection or eating decision belongs inside the grid. These exact checks remain in the downstream interaction algorithms and cannot be skipped for retained candidates. Never return false negatives; false positives are acceptable but must be evaluated for cost.
6. For creatures, compute a **maximal conservative body envelope at birth**, analytically from connected modules, segment dimensions and worst-case permitted articulation, without running a private stretch simulation. A square centered on the current center of mass with a conservative radius is a proposed rotation-independent occupancy bound. A longest connected-path estimate needs proof that it encloses *every* segment relative to the potentially moving center of mass, including branches, nonzero segment extents, contact constraint tolerances and numerical deviations; otherwise choose a larger guaranteed bound/fallback.
7. Consider a separate optional **tighter adaptive enclosure** (possibly a rectangular bound), expanding/recomputing only when required; this is a follow-up optimization choice, *not* permission to risk missing contacts. The conservative birth envelope remains the correctness fallback. Creature-local transient data may store such an enclosure and previous cell assignment.
8. **No full-grid rebuild every tick as the intended steady-state algorithm.** Registration, motion-delta updates, removals, and occasional explicitly requested audits should maintain correctness. Do not rely on periodic auditing as a way to repair normal stale state.
9. A lightweight **query-result cache** may be considered, keyed by the exact set/region of cells and relevant query semantics; mutations to any covered cell must invalidate entries or change their version. This is a hypothesis only: caching candidate arrays is not yet proven faster than fresh queries and may require bounded storage, order/version rules, and invalidation on collection reorder or world replacement.
10. No changes to physical energy conservation, current optical rays/RGB/occlusion/nearest ties, brain input/persistence/learning, determinism, off-camera activity, solver corrections, predation priority, or world save format as an accidental byproduct of the new grid. Persistent scratch or cache data should not be serialized into historical snapshots; rebuild derived grid state after import.

## 3. Sorting, deduplication and delayed filtering

### Why order exists

The current grid sorts **candidate IDs by their original source-array indices** after gathering and deduplicating them. It does not sort by spatial distance. Order is used to preserve legacy closest-hit ties for sight and the order of stateful feeding/contact effects. A matrix alone does **not** ensure that candidate IDs collected from several cells arrive in source-array order.

### Vision: defer ordering when safe

The owner's opportunity is valid: instead of sorting every candidate, the optical routine could determine the nearest physically intersected target and apply a deterministic tie rule **only to equal-best hits**, using the original priority/rank. In many cases this could eliminate full-list sorting entirely (not even sorting the final two hits is inherently necessary if their ranks can be compared). It must preserve *strict* current distance comparisons, source order, per-part edge order and results of current-length and prefilter tests. Numerical ties, corner tangencies, occlusion, dynamic pigment evaluation and floating-point/reentrancy effects require exact regression evidence. This is **an optimization proposal**, not proven equivalent or faster.

### Feeding: do not blindly treat it as nearest-hit selection

A mouth is **not** limited to a single closest object: it iterates potential contacts, may take several energy transfers up to a budget, records contact feedback even when not ingesting, and changes food radius, prey/egg state and collection membership along the way. A candidate may therefore influence later candidates. The safest first design is to maintain original descending source order for surviving broadphase candidates. Filtering out *provably non-contacting* candidates before sorting may be possible only if its geometry checks are pure for that phase and do not change which later contacts are observed; then apply all transfers in original order. Measure the extra exact-test cost and memory before adopting this variant. Preserve prey/egg/food group ordering.

### Physical contacts: order is stateful

Contact pair impulses and positional corrections occur sequentially within the solver. Sorting only the eventually colliding pairs after the solver has started would change physics; a candidate-pair enumeration with original ordering is required until exact equivalence is demonstrated. An incremental broadphase does **not** authorize fewer substeps or different contact resolution.

### Deduplication and ordering costs are distinct

The existing per-query `Uint32Array` stamp already removes duplicates in **amortized constant work per encountered ID**. Replacing it with `result.includes(id)` would perform linear membership searches and may be worse. Cell membership should itself be duplicate-free for each object/cell. Candidate alternatives to benchmark after correctness: merge already ordered cell lists, ordered bitsets or stamp-then-ordered traversal, keyed ranks, or delayed optical winner selection. Sorted insertion into result arrays also shifts elements and is not automatically superior.

## 4. Efficient incremental update contract

Conceptual API, **illustrative only**:

```ts
register(entity, kind, currentEnvelope)
relocate(entity, previousCellRange, currentEnvelope)
remove(entity, previousCellRange)
queryCells(cellRegion, requestedKinds)
queryRayCorridor(ray, requestedKinds)
queryBounds(bounds, requestedKinds)
```

- A bounded square of side `2R` centered at `(x,y)` maps to four integer cell coordinates via `floor((x-R)/cellSize)`, `floor((x+R)/cellSize)` and their Y equivalents. Checking those four values is O(1); rewriting changed cell memberships is proportional to cells entered/left, not O(1) in general.
- An entity reports its prior assigned range (or non-rectangular cell set where needed) and the new physical envelope; the grid computes and performs the delta. A pure move within the same assigned cells requires no cell-list mutation.
- Source-array rank changes (e.g., `splice`, births/deaths) still need a deterministic rank policy for query ordering even if spatial cells do not change; stable entity IDs alone do not reproduce current array order.
- Unregistered, removed or out-of-bounds entries are detectable errors; no silent loss of objects. Exact bodies/food sizes can change without cell-range change, so narrowphase reads authoritative current entity state.
- One grid owner per authoritative simulation Worker/world. No coupling to UI render frequency. A world swap invalidates all derived membership/caches; no UI authority over simulation positions.

## 5. Observer-only spatial diagnostics

### Configurable overlays

Advanced Settings should independently offer:

- **Spatial cell occupancy borders** (OFF by default): draw subtle ~1-rendered-pixel inward-offset outlines at cell boundaries to avoid overlap, **after decoration and below creatures**, using only observable cell category/count information. Drawing should be conditioned on the human observer's toggle, and not change simulation timing, physics, PRNG, sensory inputs or saved physical state.
- **Entity/creature bounding squares/rectangles** (OFF by default), using conservative/adaptive envelopes actually used by the index. Distinguish a guaranteed bound from a more tightly estimated current bound if both exist.
- **Suggested class colors**: `nutrient` = green `#00FF00`; `carrion` and eggs = red `#FF0000`; creatures = blue `#0000FF`. Combine by **channel-wise saturated RGB addition**, e.g. creature+carrion `#FF00FF`, creature+nutrient `#00FFFF`, all three `#FFFFFF`. Multiple instances of the same class do not amplify beyond full channel intensity. Store category counts or equivalent correct presence tracking so removing one of two same-class occupants does not clear the class.
- The displayed grid represents the **actual authoritative occupancy data**. Overlay computation and frame transfer should be optional/observer-only. Count vs full object-ID data transfer must be considered to avoid observer traffic overwhelming the Worker. Respect camera, zoom, DPR and existing rendering layer/order; not an optical stimulus.

### Diagnostic console and audits

Provide a bounded **system diagnostics/monitoring console**, reachable from an appropriate existing controls/Advanced Settings surface, with timestamp/sim-time, severity, subsystem and event message. Provide filtering/clear/export only if useful and bounded; no unbounded log growth.

An **independent grid-integrity auditor** should compare current assigned memberships and category counters against a fresh reference built from authoritative world objects and their designated conservative bounds, identifying missing, extra, duplicate, misclassified, stale or out-of-bounds entries. Log failures to the diagnostic console; **do not auto-repair or hide them**. P5 freezes periodic auditing at **every 60 simulated seconds**, OFF by default; pauses stop its clock and import/restart resets its deadline while retaining the session toggle. Provide a manual 'audit now' action for testing. Heavy reference rebuilding and logs should be optional diagnostics, not an unnoticed production hot path. Any tests requiring a reference should separately validate that reference.

## 6. Ordered implementation work breakdown and dependencies

These are **bounded work packages**, not newly created issue cards and not an authorization to implement them now. Work on `testing` first, after explicit next-stage instruction. Preserve `testing` overlay, historic identity, dual-Pages ownership and no `testing`-to-`main` wholesale merge. Use upstream #67/#57 to coordinate scopes before implementation.

| ID | Work package | Depends on | Definition of done / why first |
| --- | --- | --- | --- |
| P0 | Refresh fork `testing` from fork `main` safely | None; user requested as prerequisite to future implementation | Verify both heads, retain testing-specific baseline/cycle/label and Pages rules; no experimental reset, no main/upstream mutation |
| P1 | Central grid matrix primitive + query and update interface, tested in isolation | P0 | Fixed maximum-capacity layout with bounded memory/boundaries, typed kinds, duplicate-free insertion/removal, query contracts and comparisons to current full scan; no simulation integration |
| P2 | Conservative birth-time creature envelope calculator | P0 | Pure anatomy-based bound and rotation/branch/COM/constraint adversarial tests; distinguish guaranteed envelope from optional adaptive candidate |
| P3 | Diagnostics console infrastructure (observer only) | P0 | Bounded log pipeline and Advanced Settings entry; works without the new grid, no Worker physical changes |
| P4 | Entity-local transient membership handles + authoritative lifecycle/update wiring | P1, P2 | Register/relocate/remove on all moves and object lifecycle transitions, exact source-rank policy; no stale cells, exact state/energy/PRNG equivalence |
| P5 | Independent grid integrity audit, periodic scheduling and manual action | P3, P4 | Detect/log membership and class inconsistencies, no silent repair, no expensive hidden always-on mode; freeze audit interval policy |
| P6 | Advanced diagnostic cell outlines + creature envelope overlays | P4, P3 | Correct RGB combinations, 1-pixel inward border, z-order, zoom/DPR, toggle OFF by default, no simulation/learning effect |
| P7 | Migrate post-physics prey/egg/nutrient **feeding** broadphase to maintained grid | P4, P5 | Exact candidates, original descending order, sequential contact/feeding and funded energy; no new repeated full rebuilds |
| P8 | Migrate **optical** part/food/egg broadphase to maintained grid | P4, P5 | Exact old optical priorities, source/part ordering and all ray/neural/learning outputs; sight from pre-movement state |
| P9 | Migrate **physical per-part contacts** to maintained grid | P4, P5 | Every substep/projection synchronizes relevant cells; exact pair enumeration/order, impulses, position repairs and physics baselines |
| P10 | Candidate-order optimization: defer optical winner tie resolution; selective mouth filtering; query-result cache as separately switchable choices | P7, P8, P9 as relevant | Each option independently verified for exact-state equivalence; do not assume a matrix alone removes sorting, or that caches outperform fresh queries |
| P11 | Owner visual review on `testing`, then controlled `main` vs `testing` throughput/allocation comparison | P6, P7, P8, P9; optionally P10 | Verify gameplay and inspect false positives, maintenance vs query vs allocation CPU, population/density/long-body cases; do not infer CPU savings from Stage 3.12 weighted allocation shares |
| P12 | Decide which verified work (if any) to promote, and plan fork-only clean integration | P11 and explicit owner decision | Preserve all test and published records; no automatic main promotion, no upstream PR without separate post-fork-main approval |

**Execution ordering:** P1, P2, P3 are mostly independent after P0; P4 depends on the two data/model foundations. P5/P6 can be developed in parallel after P4. P7/P8 are largely independent integrations after P4/P5; P9 is intentionally later/higher risk because solver ordering and substep corrections are physically sensitive. P10 should not be combined into the initial semantic-preserving migration; it is a separate optimization layer. P11/P12 gate evaluation/promotion.

### Required gates for all integration packages

- Existing `npm run test:fast`, `npm run build`, and `npm run test:worker` for simulation/Worker changes, plus focused browser checks for Advanced Settings and visual diagnostics.
- Complete authoritative snapshots/PRNG/energetics, actual eye hits/neural inputs/learning, feeding receipts, fixed-tick and historical import continuation; compare across representative sparse/dense, long/branched/rotated anatomies, dense mouth/egg/food scenes, edge cells and tubes. Preserve all earlier golden/reference baselines; no recalibration to hide failure.
- Distinguish per-query sorting, cells traversed, membership updates, candidate volume and effect ordering. Validation first; performance comparison only after safe implementation and owner review.
- No movement/vision/feeding/energy rules or underlying physics coefficient changes; no VIDA 3D, no experiment baseline resets, no unapproved upstream publication.

## 7. Explicit uncertainties, not blocking this documentation

- P1 confirmed maximum aquarium dimensions **4800 × 3000** from import validation/UI, with current **300-unit tube extensions** on both sides. Its default 1075-slot capacity covers that water; additional future conservative envelopes/solver overshoots require explicit bounded capacity provisioning, not silent clipping. See [P1 contract](CENTRAL_GRID_P1.md). Do not assume the initial Pipe World size equals the maximum.
- Mixed typed grid vs specialized views, and whether the permanent coarse creature envelope complements individual part entries, must retain current per-consumer granularity. Document any decision before changing query behavior.
- P5 freezes the audit interval at60 **simulated** seconds with a manual command; see its pause/reset/overflow policy in [P5 contract](GRID_INTEGRITY_P5.md).
- Whether and how to cache result sets, keep source-index order without `sort`, and opportunistically filter only actual mouth contacts remain implementation hypotheses. Benchmarks can follow the owner's manual testing; **not prerequisites** for building the first testing prototype.
- The previous Stage 3 research STOP applies to new experimental performance batches, not to writing this scoped design. This document requests no new test campaign, tuning, production change, upstream PR or release.
