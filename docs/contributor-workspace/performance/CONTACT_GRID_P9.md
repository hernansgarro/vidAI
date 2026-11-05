# P9 — Physical per-part contacts on maintained spatial membership

> **STOP: unmerged draft implementation, mandatory validation incomplete.**
> Two harness correction cycles are exhausted. The last affected-test run passes
> 82/84; two isolated tests fail before/without registered contact consumption.
> Do not merge, publish, start a third harness cycle or launch browser CI until
> the owner authorizes a specific bounded continuation. See the handoff below.

**Fork testing only, 2026-11-05.** Authorized base P8
`5fdc1b78d7c16132554bfcfe83375cf1142f42de`, branch
`feature/maintained-grid-p9-contacts`.
[Preregistered scope, decisions, acceptance and resource budget](https://github.com/hernansgarro/vidAI/pull/114#issuecomment-6662434242).
Canonical upstream #67/#57 and current instructions are read-only. No main or
upstream mutation, P10, cache, physics/energy/genetic/learning change, baseline
reset, performance experiment, release bump or speedup claim. The internal PR
holds exact check/head/merge/publication receipts; implementation is not evidence
of upstream acceptance.

## Consumer and ordering

`resolveBodyContacts` receives the authoritative world's existing maintained
grid from `stepSimulation`. Each pass rebuilds the physical wrappers in active
organism/segment order and queries `body-part` entries for each part's current
legacy AABB. The pass-local segment-to-wrapper map is an identity lookup, not a
spatial index or cross-pass cache. Whole-organism/P2 bounds never cull contacts.

Removed: `ContactCell`, nested `contactColumns` maps, per-pass stamp/reset logic,
retained cell count/storage cap, spatial bucket rebuilding and cell insertion
loops. The old pair builder is retained only as an immutable test oracle outside
the application graph. Retained: per-pass physical wrappers, mass/inverse inertia,
trigonometry, AABBs, legacy cell coordinates for ordering, and a complete pair
array that is consumed only after enumeration finishes.

The old algorithm inserts each later part into X-then-Y cells; each earlier part
owns the pair at the first common cell. Its exact pair order is therefore:

1. Later flattened active-organism/segment rank.
2. `max(later.cellLeft, earlier.cellLeft)`.
3. `max(later.cellTop, earlier.cellTop)`.
4. Earlier flattened active-organism/segment rank.

Maintained queries deduplicate references, including overflow. The consumer
rejects non-active/duplicate-direction pairs, excludes directly hinged neighbors,
and applies the unchanged strict AABB rejection. It sorts the retained earlier
wrappers by keys2–4 before appending `[earlier, later]`. This does not change
vision/feeding sorting or implement P10. Extra matrix boundary candidates are
conservative and cannot alter the post-AABB pair sequence.

P4 indexes corner-derived bounds with P1's conservative boundary padding; the
consumer keeps the original center/extent AABB arithmetic. Within bounded matrix
coordinates its roundoff is covered by that padding. Outside capacity, membership
budget or arithmetic limits, P4 supplies unconditional entries; invalid query
bounds fail open. There is no assumption that ideal joint articulation contains
the actual current pose. Huge coordinates do not induce unbounded cell loops.

## Phase and physics

Each pass enumerates its COMPLETE pair array before any stateful narrowphase.
Updating membership during corrections cannot remove/add/reorder pairs in that
array. Original SAT and clipping read corrected centers with pass-frozen rotations;
joint projections change rotations only between passes. The next pass rebuilds
physical wrappers and queries the newly synchronized grid.

Existing P4 hooks synchronize after each body's substep integration, after each
contact position correction, after every real joint projection (including final
projection), and after wall/tube placement. Impulses modify velocity only; their
positions need no membership change. No new global rebuild, roster pass or
audit-as-repair is introduced. The projection callback contract retains its P4
requirement to synchronize any completed pose mutation before returning.

Substep count, eight contact passes, four/twelve joint projection iterations,
SAT/plane/vertex order, AABB strictness, `.02` slop, `.6` factor, correction cap3,
impulse arithmetic, touched-organism insertion order, masses, forces, damping,
energy ledger and historical regimes remain unchanged. No coefficients or
observed-state schemas change. P7's approved imported-food radius correction and
P8's capped-carrion optical correction remain present.

## Correctness evidence and reproduction

`tests/support/contact-grid.ts` combines all42 P8 controls with six contact scenes:
branched anatomy, long separated/folded pose, dense cell boundary contacts,
reversed dense roster, overlapping rotated cell-corner segments and larger-dt
substeps. Inherited cases include both tube sides, all four physics regimes,
historical import, energy/learning, eggs, food and both P7/P8 corrections.

The same reference script/fixtures run on a detached untouched P8 checkout and
P9 with the same installed dependencies. Complete JSON equality covers48 cases,
333 snapshots/285 ticks and ordered event/energy receipts. Additional mechanical
trace digests cover stage, kinetic values and EVERY organism's complete segment
pose/velocity at each mechanical observation, including actual joint projections
and individual contact impulses. These are correctness controls, not performance
measurements or ecological trial repetitions. New P8 references in
`tests/fixtures/contact-grid-p8.json` are separate from all historical fixtures.

Reproduction: copy only `tests/support/contact-grid.ts`, `tests/support/contact-scene.ts` and
`scripts/check-contact-grid-reference.ts` into a detached checkout of the exact P8
base; run `node --import tsx scripts/check-contact-grid-reference.ts /tmp/p8.json`
there and `/tmp/p9.json` in P9, then deeply compare the complete objects.
The immutable test oracle `tests/reference/p8-contacts.ts` differs from P8 only
in relative imports, a provenance comment and test exports; a hash assertion
protects its original algorithm.

Focused tests compare ordered post-AABB pairs against that oracle, including
unconditional budget/capacity overflow, long rectangles where cell X/Y ownership
overrides earlier source rank, per-impulse/projection complete pose/velocity traces,
pass freezing, P5 audits before consumption/after corrections, P6 readback and
split authoritative snapshot continuation. The actual built Worker covers all six
new scenes with full state/PRNG equality, P5 and exact paused resets. Browser tests
exercise branched/dense contacts in Worker and fallback with full-state references
computed in the same browser engine. Existing P6 overlay tests remain mandatory.

One initial new harness failure exposed uncommitted external fixture mutations:
poses/ranks were edited after registration. The fixture now completes its normal
external-edit synchronization before standalone queries. The original P5 assertion
is retained. A test helper's old/new wrapper type annotation was corrected in that
same harness cycle. Initial failure details and the retry ledger are preserved in
the [checkpoint](https://github.com/hernansgarro/vidAI/pull/114#issuecomment-6662618075).
No runtime repair, tolerance/timeout increase or historical reference update.
Final required gate results belong in the internal PR, never inferred here.

A second harness correction cycle fixed the new long-rectangle ordering control
and adapted standalone inherited contact test: anatomy changes must replace the
parts-array identity, as P4/P2 caches immutable anatomy certificates by that
identity. In-place truncation had produced an explicit anatomy/pose-count error.
The split Node/browser fixture wrapper also received its missing type-only import.
All original physical assertions remain. This exhausts the two harness correction
cycles; any further failing mandatory gate requires a stop/owner decision before
additional harness edits or expensive troubleshooting.

## Stop-gate handoff — 2026-11-05

**Current result:** implemented on a fork topic branch, NOT integrated into
`testing`, NOT published. Testing remains P8 `5fdc1b78…`. Main and upstream remain
untouched. No new PR was opened: pull-request creation would automatically start
full browser gates despite two known failing isolated tests. Existing PR114 holds
preregistration and diagnostic checkpoints; no duplicate issue was created.

**Gates/evidence:**

| Gate | Recorded result |
| --- | --- |
| `npm ci` | Passed,113 packages |
| Detached untouched P8 complete JSON | Passed:48 cases,333 snapshots,285 ticks, ordered events/energy |
| Detached mechanical trace digests | Passed:100,069 observations including16,659 contact impulses |
| Initial focused tests |52/53; first fixture synchronization failure preserved |
| Cycle1 focused tests |53/53; before the additional X/Y control |
| Last affected tests |82/84;53/54 P9 plus29/30 inherited senses/contact |
| `npm run build` | Passed on the final code/test tree before this documentation checkpoint |
| `npm run test:worker` | Passed, all inherited sets and six P9 cases; no browser test implied |
| `npm run test:fast` | Exited1 without completed TAP summary; NOT a pass |
| Remote Worker/browser/toolbar/side-window/aggregate | NOT started |
| Merge / testing publication | NOT performed |

Original logs: [evidence/p9](evidence/p9). No failed evidence, inherited reference,
physical threshold, assertion, timeout or baseline was removed/weakened. Resource
ledger: zero unchanged retries, two harness correction cycles, no local browser
installation or performance experiment. The ad-hoc browser-bundle inspection first
used the wrong Vite return shape; corrected inspection succeeded without changing
product/test code or starting a browser. The incomplete full fast run's root cause
is unknown; do not reinterpret it as a physics failure or green validation.

**Remaining failures and source diagnosis:**

1. The explicit X/Y ownership fixture uses rectangles400/60/20px while P2 accepts
   only dimensions1..10 with width/height exactly dimension*7. After fixing the
   array identity in cycle2, it now correctly rejects those unsupported shapes
   with `Invalid envelope part geometry` BEFORE querying. Proposed bounded fix:
   use valid70x14 and14x14 parts (`dimN`10/2, `dimM`2), X centers158/102/130;
   transpose X/Y and dimensions for the Y control. These preserve the intended
   reversed first-common-cell order `[[1,2],[0,2]]` across128, using supported
   geometry instead of weakening P2 validation. This proposal has NOT run.
2. The inherited standalone self-contact test replaces `state.organisms` AFTER
   `createInitialWorld` initialized its empty maintained grid. Calling
   `ensureMaintainedGrid` alone intentionally does not reconcile that existing
   grid. The new resolver therefore receives no registered test creature and
   its original separation assertion fails. Proposed bounded fix: synchronize
   immediately after this test-only roster replacement, before the resolver.
   The subsequent anatomy replacement must retain its already-correct new array
   identity. No resolver auto-repair or weakened physical expectation. This
   proposal has NOT run.

**Owner decision needed:** authorize ONE additional targeted harness correction
cycle limited to those two fixture changes, with one focused affected-test run
and one required final-head validation campaign if it passes. Stop on any further
failure; do not invent consent from elapsed time or generic continuation. Runtime
source should remain unchanged unless new evidence establishes a product defect.
Preserve all existing logs and the P8 references. Only after all exact-head gates
pass may an internal PR be merged into testing under the original authorization.
