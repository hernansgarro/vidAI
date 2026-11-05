# P10 — Independent candidate ordering, feeding filtering and query cache evaluation

**Partial implementation, fork testing only, 2026-11-05.** Authorized base P9
`7dc593236da08b87ec978e4b887ce9536d5ddb26`; branch
`feature/maintained-grid-p10-queries`. [Preregistration before implementation](https://github.com/hernansgarro/vidAI/pull/117#issuecomment-6664152743)
and [bounded diagnostic/cost protocol](https://github.com/hernansgarro/vidAI/pull/117#issuecomment-6664184542).
Canonical upstream AGENTS/#67/#57 are read-only. This is NOT completed P10,
P11/P12, an upstream submission, main promotion or a whole-game speedup claim.
Final required exact-head checks, internal PR, merge and actual publication
receipts belong in the internal PR; pending/skipped checks are never passes.

## Independent decisions

| Option | Runtime decision | What remains open |
| --- | --- | --- |
| A: replace complete optical sorting with winner/rank selection | Rejected for this delivery; original sorting/evaluation retained | An exact-arithmetic/order-preserving alternative with demonstrated benefit |
| B: filter before descending feeding sort | Adopt only pure food diet/axis-reach rejection for lists of at least128 raw candidates | Prey/egg filtering and smaller-list strategies have no accepted optimization |
| C: bounded candidate cache | Test-only prototype rejected for runtime; no cache enabled | More selective versioned cell-region invalidation with independently justified benefit |

Each proposal is evaluated against P9 independently. Only B changes production
code. A/C evidence and the cache prototype stay outside the application import
graph. No feature flag, observer preference or new persisted setting is added.
B can be removed without changing optical, contact, geometry, lifecycle or cache
behavior. Do not combine future A/C work with this delivery without new evidence.

## A: exact arithmetic prevents an unordered minimum shortcut

P9 evaluates candidates in food → egg → body order, ascending source ranks and
segment ranks. Body edges stay0/1/2/3. Its current closest distance changes both
prefilters and the endpoint passed to `lineIntersection`. An unordered full-range
intersection followed by `(distance, priority, rank)` minimum does NOT reproduce
that arithmetic. Among128 preregistered deterministic edge controls,11 change
intersection coordinates between lengths500 and200. The first has identical X
but Y `130.39028071593134` versus `130.39028071593137`. This would already change
observable hit coordinates, even where rounded distance/RGB happens to agree.
`evidence/p10/a-clipping.json` preserves that control; the additive A test retains
the cause. No runtime A prototype or full-state-equivalence claim is made: the
necessary exact-geometry condition fails before integration. No A cost/speedup
measurement was attempted because this proposed arithmetic is inadmissible.

This does not prove every possible order optimization impossible. Finding a
method that retains clipped numerical evaluation, tangencies, strict ties and
live pigment is deferred. All existing optical/neural/recurrent controls still
run against the unchanged P9 path, including the accepted P8 capped-merge fix.

## B: selective combined-food filtering contract

`queryBounds` has an optional **pure consumer predicate**. After normal matrix
collection/deduplication and unconditional overflow collection, lists>=128 compact
survivors in place BEFORE the unchanged source-rank sort. Lists<128 ignore this
optional optimization and return the original P9 candidates. The default raw
query and every optical/contact/prey/egg query remain unchanged. Threshold128 is
a conservative large-list gate, not a measured global crossover or guarantee.

Only the existing combined nutrient/carrion feeding call supplies a predicate:

1. Reject food inadmissible for the current mouth's inherited diet.
2. Reject the exact existing axis condition using current
   `food.radius + intakeLength + mouthRadius` relative to the mouth origin.

No new AABB tolerance, distance metric, rectangle/capsule test, nearest-food
selection or change to source/group order is introduced. Exact contact/transfer
loops retain their original live diet/axis guards, point-to-segment geometry,
strictness, feedback, budget, reserves, assimilation, radius recomputation,
rank-refresh/removal, receipts and callbacks. A mouth can still interact with
multiple objects in descending source order, after prey and eggs.

Safety is scoped to one mouth's food group. Its normal transfers mutate only the
current food; they do not move or resize another pending food. Each later mouth
queries again, after every earlier bite/merge/category/lifecycle change. An
imported radius1 food can still grow across cells after a bite, and a capped
corpse merge can enlarge carrion without a length change. Both P7/P8 corrections
remain part of the P9 reference. No predicate result/geometry survives a query.
Simulation observer callbacks retain their existing observation-only contract;
mutation/reentrancy through an observer is not newly supported.

Overflow candidates are never lost at the grid boundary. The unfiltered query
still returns them unconditionally; only this consumer's unchanged safe diet/
axis rejection may discard them afterward. Invalid/huge query bounds retain P7
fail-open collection. NaN comparisons are not inverted into unsafe rejection:
the predicate uses the original negated `>` disjunction.

Prey/egg filters were deliberately left unchanged: the bounded cost evidence
justifies only large food lists, and does not justify extra per-part/prey or egg
contact work before their stateful budgets. This is a partial B scope.

## B correctness evidence

A detached pristine P9 worktree ran only the additive scene factory and reference
runner, sharing installed dependencies. No P9 tracked runtime file was modified.
The52 fixed scenes comprise all48 P9 cases plus four new food controls:256
same-cell false positives, reversed collection, exact tangency and full reserve.
No inherited fixture/reference/baseline is edited. New P9 hashes are separately
retained in `tests/fixtures/p10-query-p9.json`.

The initial ungated B prototype matched **353 COMPLETE snapshots over301 ticks**,
ordered events and energy receipts, and **100,261 mechanical observations**
(including complete segment poses/velocities at each observation). The final
large-list candidate is checked against the same P9 references, with P5 after
every tick, explicit rejected-target no-contact checks, tangency/actual intake,
P6 readback without state changes, overflow and complete split snapshot
continuation. New browser Worker/fallback controls in BOTH required engines
compare a large-food scene against P9's unfiltered query path in the SAME engine.
The actual compiled Worker adds all four scenes with full P9-state/PRNG equality,
P5 and paused reset. Existing optics/contacts/browser/overlay gates remain intact.

Reproduce full-object comparison with `scripts/check-p10-reference.ts`: copy only
that additive runner and `tests/support/p10-scenes.ts` into pristine P9, run there
and on the candidate, and deep-compare both entire JSON arrays. Do not regenerate
historical references to accommodate divergence. Same-engine controls do not
promise cross-engine transcendental math identity.

## Local costs: narrow evidence, not P11

`evidence/p10/local-cost.json` retains ALL seven alternating paired rounds and
operation counts. Node24.22.1/Linux x64;200 warmup iterations,7×1000 iterations
of captured batches. Same fresh query collection is excluded from both B arms.
Original copy/sort omits all downstream rejection, providing a conservative
sort-only lower bound; selected copy/predicate/compaction/sort includes actual
pure diet/axis math on frozen geometry and actual unordered matrix/overflow
traversal. These are local operation costs, not frame rate, allocation profiling,
ecological measurements or whole-simulation throughput.

| B captured lists | Raw→retained | Median original ms | Median filtered ms | Decision |
| --- | ---: | ---: | ---: | --- |
|164 small lists |773→494 |35.029 |48.693 | Keep original path |
|4 large lists |967→7 |29.445 |17.924 | Allow large-list filter |

Across7000 repetitions, comparator calls for large lists fall13,468,000→21,000.
No general speedup is inferred: all-contact large lists, other densities,
engines/hardware and whole-kernel impact were NOT measured. Lists128–the measured
large-list sizes are not asserted to be a precise crossover. Future P11 requires
owner authorization/visual review and its own preregistered protocol.

## C: conservative cache rejected

The test-only prototype holds at most32 arrays, each at most256 references
(8192 total), with copied arrays on retrieval. Keys distinguish method, exact
numeric arguments (including -0/nonfinite encodings), kinds/order/direction and
bounds. Optional predicate closures are never cached. It caches candidate
references only, never intersections, colors, contacts or transfer decisions.

EVERY public mutation invalidates: food/egg/organism sync (including geometry
changes within unchanged cells), removal, organism removal, source-rank refresh,
roster synchronization and disposal. Owner-instance isolation covers import,
reset and replacement; lifecycle/movement/physics hooks already use those
mutators. Over-invalidating is intentional. Finer cell/range/version and rank
tracking would require additional runtime writes/keys and a separate proof.

Adversarial tests compare cached to fresh results after same-cell motion,
expansion/shrinkage, category changes, births/deaths/removals, reorders, body
moves, reverse/nonfinite rays and whole-world replacement. They mutate returned
arrays to prove cache ownership, bound retained references, assert P5 and prove
no snapshot content change. A separate52-case C-only run suppresses B filtering
and matches P9 complete states/ordered receipts exactly. No C+ B combination is
needed for production because C is rejected.

In the preregistered seven paired rounds of four food scenes×two ticks, each
cached arm had **0 hits,32 misses and8336 conservative invalidations**. Median
fresh4.746ms versus prototype10.184ms, including keys/copies/invalidation/stats.
The prototype instrumentation and narrow scenes limit interpretation; this is
not evidence against every possible cache. It establishes no adoption benefit
for THIS design, so its runtime complexity is avoided. Regions sharing cells
but differing exact endpoints are intentionally not coalesced. A smarter cache
remains pending, not silently declared unnecessary/completed.

## Resource accounting and failures

Apply the [fork policy on main](https://github.com/hernansgarro/vidAI/blob/main/docs/contributor-workspace/procedures/WORK_CI_RETRY_BUDGET.md),
which is absent from the P9 testing tree. P9 extraordinary authorizations do not
carry over. No unchanged retry has been used. TWO targeted harness cycles used:

- Cycle1: first combined B focused run87pass/1fail. The NEW forwarding assertion
  filtered small lists despite the new size gate. It now preserves the complete
  original unfiltered P7 candidate/rank/P5/removal/shrink oracle and separately
  checks raw below128 / safe subset at128+. Affected-query test1/1 passes.
- Cycle2: A/C focused run2pass/1fail. The standalone imported fixture replaced
  its roster without completing a sync before independent queries. Diagnostic
  P5 reports5 missing entries before sync,0 after. Sync completed test setup;
  three tuple-spread type errors in the same test use explicit coordinates.
  Affected lifecycle test1/1 and typecheck pass. C's independent52-case reference
  comparison had already passed. No runtime/reference/tolerance/timeout/CI fix.

Original failed logs, diagnoses and successful focused correction logs remain
in `evidence/p10/`. These corrections do not weaken P5 or historical guarantees.
**No further harness correction is authorized.** Stop on another unresolved
mandatory failure rather than inventing a third cycle. Full final-head mandatory
campaign results and exact GitHub run/merge/publication receipts stay in the PR.
