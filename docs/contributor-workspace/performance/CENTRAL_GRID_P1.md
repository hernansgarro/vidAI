# Central grid P1 — isolated matrix primitive

**Fork/testing only, 2026-11-04.** Implements P1 of the
[maintained-grid design](MAINTAINED_SPATIAL_GRID_DESIGN.md), based on P0
`2c3b67b2f76bfb99baa1f3156daa5047c85455cd`, branch
`feature/central-grid-matrix-p1`. Pre-implementation scope is registered in
[fork P0 tracking](https://github.com/hernansgarro/vidAI/pull/106#issuecomment-6638733161).
Canonical performance tracking remains upstream #67/#57. The owner prohibits
upstream writes for this task; no duplicate issue or board is created.

## API and ownership

`centralSpatialGrid.ts` exports `CentralSpatialGrid<T>` and opaque-use
`GridEntry<T>` handles. This module has **no live simulation/Worker/UI consumer**;
it imports only the existing `SpatialBounds` type, erased at build time.

```ts
const grid = new CentralSpatialGrid<MyObject>();
const membership = grid.createEntry(entity, 'nutrient');
grid.register(membership, bounds);
grid.relocate(membership, currentBounds); // false if cell buckets are unchanged
grid.relocate(membership, currentBounds, 'carrion'); // explicit category change
const candidates = grid.queryBounds(searchBounds, ['nutrient', 'carrion']);
grid.remove(membership);
```

The caller retains a handle containing previous inclusive cell coordinates;
the grid alone mutates membership. No additional all-object registry is kept.
Duplicate registration of a handle, inactive relocation/removal and cross-grid
operations throw. A removed handle may be registered again in its original grid.
Distinct handles may represent different views of the same payload: a whole
organism is not substituted for its individual parts. Payload identity does not
deduplicate deliberately distinct views; callers must retain the one handle for
each intended view. Payload geometry stays caller-owned and current.

Register occupies every cell touched by an AABB. Relocate preserves overlapping
memberships, removes old-only memberships and adds new-only memberships; a kind
change moves the entry between typed buckets, including shared cells. A pose
change within the same range performs no bucket mutation. No steady-state rebuild,
simulation integration, envelope derivation or periodic audit is implemented.

## Capacity, boundaries and memory

- Cell width is fixed at 128 world units, preserving the existing epsilon guard
  (`1e-7`) on inclusive cell boundaries and point/corner tangencies.
- `persistence.ts` validates maximum aquarium dimensions 4800 × 3000; the UI
  matches. `selfTubes.ts` uses 300-unit left/right tube extents. The default
  capacity is therefore `[-300, 5100] × [0, 3000]`, independent of the current
  aquarium. Epsilon coverage gives 43 columns × 25 rows = **1075 direct slots**,
  including the row just above y=0. Slots use
  `(y - firstRow) * columns + x - firstColumn`; no row/column map search.
- Empty slots have no cell/category bucket allocation. Occupied categories use
  sets, releasing empty buckets/cells after removal. Storage scales with fixed
  slots plus actual memberships and active handles; every registered entry
  occupies at least one cell. JS object/reference byte costs are engine-dependent;
  the slot count is not a measured heap-byte claim.
- An explicit alternate capacity supports negative/unusual bounds and enlarged
  envelopes, with a hard ceiling of **65536 cell slots**. Memberships are capped
  at **262144**; a constructor argument may lower that budget. These are P1
  allocation guards, not changes to world settings or measured performance limits.
- Finite, ordered registration bounds must lie wholly inside the declared
  capacity. Invalid/outside/budget-exceeding registration or relocation throws
  before changing membership. The primitive never silently clips an entity.
  P4 must explicitly provision any additional conservative-envelope or transient
  solver/handoff overshoot space; default coverage of tube water alone does not
  prove containment of every future creature envelope.
- Queries clip traversal to allocated cells. `queryCells` accepts inclusive safe
  integer cell coordinates; `queryBounds` converts finite ordered world AABBs
  to safe cell coordinates. `queryRay` validates finite endpoints/deltas and
  visits only horizontal cell-slab corridors. No wraparound/topological image
  generation is implied. Inactive parts of capacity simply contain no entries.

## Candidate and ordering contract

`queryCells`, `queryBounds` and `queryRay` accept any subset of `nutrient`,
`carrion`, `egg`, `body-part`, `organism`; omitted means all, empty means none.
Repeated kind requests and multiple occupied cells never duplicate a handle.
An entry-local query stamp deduplicates in constant work per encounter; the
rare safe-integer rollover clears stamps using live buckets only. Results are
new caller-owned arrays. There is no candidate cache or result-array aliasing.

Results are **conservative and unordered**. Shared cells can return nonintersecting
objects; downstream exact geometry remains mandatory. No source-array rank,
optical tie rule, feeding priority or solver order is inferred from matrix/set
traversal. Future integration must explicitly restore each consumer's legacy
order. P1 does not change the existing `OrderedSpatialIndex` or its callers.

## Verification and limits

`tests/central-spatial-grid.test.ts` is included in `test:fast`. It checks maximum
capacity/tube coverage and drift of existing source limits; invalid input and
atomic budget failure; duplicate/stale/cross-grid operations; typed queries and
same-class removal; no-op/partial/disjoint moves, growth/shrink/category changes;
negative cells, inclusive boundaries and expanded capacity; ray reversal,
tangencies, zero-length rays and diagonal culling; stamp rollover and source
isolation. A deterministic 360-operation sequence over 80 handles compares cells
against independent full scans, preserves every exact AABB/segment hit, and
compares candidate sets with fresh existing `OrderedSpatialIndex` queries.
These are isolated correctness tests, not scientific performance trials or P5's
runtime integrity auditor. No baselines, coefficients or historical data change.

Exact-head local/CI results, internal PR, merge/publication receipts and next
action belong in the internal PR. No throughput/allocation improvement is claimed.
P2 and later packages, main promotion and upstream submission remain unauthorized.
