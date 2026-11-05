# P7 — Post-physics feeding on maintained spatial membership

**Fork testing only, 2026-11-05.** Base P6
`1b0db3247fdf188e2627b7fc47efecff29e643b6`, branch
`feature/p7-maintained-feeding`. [Scope registered before coding](https://github.com/hernansgarro/vidAI/pull/112#issuecomment-6650376091).
Canonical upstream #67/#57 and current upstream rules were read-only; no upstream
or main mutation, issue completion, native board transition or actual Wiki
publication is claimed. Internal PR/check/merge/publication receipts accompany
the delivery. P8 optical, P9 contacts and P10 sorting/caching remain excluded.

## Queries and order

The existing post-physics feeding loops now call P4 `queryBounds` on these views:

| Pass | Granularity | Kinds | Order |
| --- | --- | --- | --- |
| Prey | Whole living organism | `organism` | Descending organism source-array rank |
| Eggs | Individual egg | `egg` | Descending current egg-array rank |
| Food | Individual food object | `nutrient`, `carrion` together | Descending current nutrient-array rank |

The enclosing active-organism reverse traversal, genome mouth order and
prey → egg → combined food priority are unchanged. P4's existing comparator and
sort restore source order after cell deduplication; no sorting algorithm,
winner-only shortcut, early geometric filter or query cache is added. A query
is taken separately for each group of each mouth. Deleting an element while
iterating descending ranks cannot shift the lower pending ranks. P4 refreshes
ranks after each splice; the next mouth queries the live roster.

Removed from feeding: the once-per-tick `preyGrid` full body-bounds construction;
the lazy `oralEggGrid` construction, count tracking and deletion invalidation;
and the lazy `oralFoodGrid` construction/count-triggered reconstruction. The
now-unused simulation import of `NutrientSightGrid` is removed. Its standalone
class/tests remain. Hatching obstacle bounds, the pre-movement optical index and
per-part physical contact broadphase remain unchanged.

## Live geometry, lifecycle and safety

P4's completed physics/contact/hinge/tube hooks already supply current poses.
No new tick-wide grid reconstruction or reconciliation is added. Existing
hooks immediately update bite-induced nutrient radius, delete consumed food and
eggs, remove dissolving prey, refresh splice ranks, and register laid eggs.
Decay/category conversion, corpse carrion and mineralization happen at their
existing boundaries and are visible to feeding. Future queries read current
objects, including when a radius changes without changing collection length.

Whole-prey P2 current-pose squares can return more raw candidates than the old
tight AABBs. Conversely, shrinking food can leave cells before the old lazy
index would have rebuilt. These differences are conservative broadphase work,
not an instruction to change downstream rules. All inherited contact tests,
kin checks, contact feedback even without intake, budgets, storage limits,
reserve-before-tissue bites, assimilation, discard thresholds, counters,
injury/feeding receipts and funded energy transfers remain byte-identical.

Entries outside capacity or the membership budget remain unconditional P4
candidates, including unbounded entity arithmetic. Finite query bounds are
clipped to matrix capacity before converting them to cell coordinates; entity
bounds are never clipped. A wholly outside query still returns relevant
overflow entries. Unbounded query arithmetic fails open to all requested kinds,
without duplicate overflow entries or a loop over enormous cell coordinates.
Exact narrowphase still owns every interaction decision.

## Explicitly approved compatibility correction

[Owner decision](https://github.com/hernansgarro/vidAI/pull/112#issuecomment-6650453046):
use the **updated radius** for an imported nutrient whose radius grows on its
first bite. Import legitimately accepts positive finite radii independently of
stored energy. With 3000 J/radius1 at x126, the first mouth consumes60 J and
recomputes its radius to about18. P6 retains the radius1 index until a count
change and misses a second actual contact in the adjacent cell. P7 finds it.

| One-tick control | P6 | P7 |
| --- | ---: | ---: |
| Remaining food J | 2940 | 2880 |
| Absorbed receipts | 48 J once | 48 J twice |
| Returned assimilation heat J | 12 | 24 |

Both open and closed controls conserve stock; reserve/ledger, feedback and
feeding histories change consistently with that extra physical transfer.
Snapshots are not silently normalized and no compatibility cache reproduces
the omission. Exact P6 continuation is intentionally **not** claimed for this
approved corner case. Later trajectories may consequently diverge. No other
behavior difference was found in the bounded comparison; this is not a proof
that every possible imported world has identical trajectories.

## Correctness evidence and reproduction

`tests/support/feeding-grid.ts` defines28 fixed mechanism cases, including the
12 inherited P4 cases, twelve overlapping multi-mouth scenes across legacy and
capsule geometry / historical, decay-v1 and decay-v2 food / reversed collections,
same-tick laying, cell-crossing shrinkage and the two imported-radius controls.
Consumer siblings use ordinary kin protection so they can exhaust unrelated
prey/eggs instead of spending every budget eating one another. Fixtures include
corpse carrion creation, category conversion, mineralization and removals.
They are correctness controls, not new ecological or performance experiments.

The same factory and `scripts/check-feeding-grid-reference.ts` ran in a detached
untouched P6 checkout and this implementation. The temporary outputs contain
**239 complete snapshots across211 ticks**, plus ordered event and energy
receipts. They were compared with deep equality, not selected-state tolerances.
The26 ordinary cases match completely. Only the two approved controls differ
at their final tick. `tests/fixtures/feeding-grid-p6.json` retains NEW P6 state
and receipt SHA256 references; no inherited golden/physics/experiment baseline
was refreshed. These Node references do not assert cross-engine math identity.

To reproduce, copy only the new fixture factory and reference script into an
untouched checkout of the exact P6 base (using the same installed dependencies),
then run `node --import tsx scripts/check-feeding-grid-reference.ts /tmp/p6.json`
there and the same command with `/tmp/p7.json` here. Compare the full objects;
the two named `imported-radius-growth-*` controls are the documented exception.
Do not regenerate inherited references to accommodate a difference.

`tests/feeding-grid.test.ts` also checks fresh old candidate coverage, descending
live ranks, actual removals and cell crossings, P5 before every feeding query
without synchronization/repair, approved growth and closed stock, extreme and
budget overflow, explicit group priority, same-tick laid-egg intake and complete
split snapshot continuation. Existing P3's144 historical state hashes remain
intact. The actual compiled Worker suite adds five valid imported feeding
scenes, exact full direct/Worker state, paused reset and P5 readback. Existing
browser groups still exercise real feeding halos and Advanced Settings audits
in Worker/fallback runtimes and both required engines.

Required delivery gates: `npm ci`, `npm run test:fast`, `npm run build`,
`npm run test:worker`, plus all existing required browser shards and aggregate.
Their exact results/CI URLs and final published heads belong in the internal PR.
No throughput/allocation benchmark was run and **no speedup is claimed**.
