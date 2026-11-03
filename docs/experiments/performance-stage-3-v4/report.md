# Stage 3.3b — physical metadata: counted repetition, low observed substep cost and conditional reuse

**Batch COMPLETE. Stage3 remains ONGOING; stop for review.** 2026-11-03.
This is research evidence, not a production optimization.

## Executive findings

1. The old300/600 mass/inertia derivations per tick counted only one consumer.
   Contact body construction adds2400/~2179 part-mass calculations per sampled tick
   at15/30 founders; projection and COM add more. Redundant immutable arithmetic exists,
   but counts alone overstate its likely optimization value.
2. The directly timed substep metadata block is **low observed cost**: median~.026/
   .052ms per sampled tick,~.54%/.65% of instrumented sampled tick time. It is not
   the main expensive physics operation in these workloads.
3. Contact body construction is~.195/.214ms per sampled tick (~4.57%/2.56%), but
   includes rotation/bounds/cells/wrappers, not just cacheable mass/inertia. Projection
   setup is~.055/.026ms (~1.21%/.32%). No percentage of those whole blocks is proven
   removable by caching.
4. Isolated direct-index reuse is sometimes cheaper than recalculation; **WeakMap is
   not a universal win**. Substep recompute median35.22ms/2million visits versus
   WeakMap67.55ms. Contact WeakMap has a preserved759.90ms outlier. JIT/order/variation
   limit all microbenchmark ratios; no full-kernel cache variant or gain was measured.
5. A controlled retained-metadata fixture observed~1.77MB incremental JS heap for
   10000six-number WeakMap values (~177bytes/entry including representation/container
   effects, excluding key objects), versus480000bytes numeric payload. This is one
   synthetic process/GC estimate, not exact object size or application retained heap.
6. Every baseline/diagnostic authoritative trajectory agrees and also matches the
   historical v1 tick360 references. Actual caches must still preserve each consumer's
   different floating expression, identity/context and historical continuation.

## Authorization, provenance and original failure

Hernan explicitly authorized this Stage3.3b recovery/completion batch.
[Preregistration](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6596964012),
[protocol](protocol.md). The original Stage3.3 missing slot remains
[OUTCOME_UNKNOWN](../performance-stage-3-v3/incident.json); it is never overwritten
or relabeled. First15baseline/rep1 here is an **authorized recovery evaluation**
that may repeat a condition previously executed. It cannot establish original
exact-once execution.

Research base5be552000bfd832418e7d4dca42eeabb2525f365; source/evidence branch
`audit/performance-stage-3-3b-evidence` starts at
e6a1be3dbbae773ec995d9239454579d43cc7860. Kernel/loader source remains the archived
Stage3.3 version, executed inline with exact source digests; component adds complete
memory phase readings. Registered validity control source is separate.
Original runtime base remains fork/main11248f3. Local checkout7279fc8 has that
identical runtime; stale local documentation is not the final report source.

Each child result/archive was committed and its receipt read back on the evidence
branch **before** hash ACK and before the next child. Capture supports idempotent
HEADER/CHUNK-number retrieval without repeating RUN. All14original gzip archives
and receipts are retained. Sources are outside the application import graph;
no permanent cache, source optimization, physics, genetics, Worker or save change.

## Environment and workloads

Node24.22.1, Linux6.18.57, Intel Xeon Platinum8573C,8exposed CPUs,
cgroup quota800000/100000=8CPU equivalents,8GiB memory ceiling. This host differs
from the AMD-based Stage3.1/3.2 environments; **do not compare absolute timings across
them as a speedup**. Actual desktop/browser/Worker scheduling, GPU, thermal/power
state and host contention are not measured here.

Node builtin in-memory TypeScript hooks (experimental API) load original code/JSON,
with Node compilation cache disabled. No source or module copy is written locally.
Original/loaded source digests are retained. Diagnostic source changes only probes
in simulation.ts/contacts.ts; production source is unchanged. The earlier successful
zero-tick preflight was reused, not repeated as a biological trial.

Two archived v1 checkpoints:15organisms/75parts/200food and30organisms/150parts/
300food, v3 physics/closed economy/capsule mouths/decay-v2. Each of12independent
processes restores its checkpoint, warms60fixed1/60s ticks and measures300ticks.
Three baseline and three diagnostic repetitions per workload; repetition2 reverses
the order. Final counts remain15/30 organisms and75/150parts; food197/293.
No hatching/population-stress/fitness/vision/active-browser experiment is implied.

Total measured3600ticks +720warmup ticks. Source process started-to-finished intervals
sum46.601s; charging20s for the prior unknown slot gives66.601s. These intervals
exclude some Node startup/compression/transport costs. The registered per-process
hard ceilings bound this batch plus the prior unknown by340s, below the600s ceiling.
Connector/archive idle time is separate. Each child stayed within its resource guard.

## Kernel timing and probe overhead

These are original Node host/kernel calls, **not browser FPS, actual Worker IPC
throughput or desktop capacity**. Snapshot construction/hash checks occur outside
summed tick-call times, but their allocations may affect subsequent GC/JIT.
Process CPU-window receipts include those harness operations and V8 helper threads;
they are not isolated per-block CPU utilization.

| Workload / mode | Original300-tick call sums ms | Median ms | Pooled tick median /p95 /p99 ms |
| --- | --- | ---: | --- |
|15 baseline |1246.638 /1339.522 /1049.314 |1246.638 |3.581 /6.616 /9.485 |
|15 diagnostic |1189.860 /1084.837 /1495.137 |1189.860 |3.541 /6.660 /13.965 |
|30 baseline |2339.282 /2547.645 /2039.506 |2339.282 |6.284 /15.465 /29.797 |
|30 diagnostic |2387.739 /2337.399 /2067.106 |2337.399 |6.076 /16.118 /25.943 |

Apparent median diagnostic changes are−4.55%/−.08%, but paired changes span
−19.01% to+42.49% for15 and−8.25% to+2.07% for30. **This is not a probe speedup,
zero-overhead proof or cache gain.** Process/JIT/scheduling/GC variation overlaps
the probe effect;60warmup ticks do not establish a stable optimized plateau.
No local build or other benchmark ran concurrently. All repetitions/outliers remain.
Pooled900ticks/mode are correlated observations, not independent confidence bounds.

## Recalculation counts and block attribution

Diagnostics sample38ticks/process (one in eight). Values below are median block
wall times across3processes. Percentages use each process's same sampled tick times,
not the baseline median or a cross-machine CPU total.

| Consumer |15-founder units/tick |30-founder units/tick |15 block ms/tick /sample share |30 block ms/tick /sample share |
| --- | ---: | ---: | --- | --- |
|Substep mass/inertia fill: part records |300 |600 |.0264 / .54% |.0521 / .65% |
|Contact body construction: part records |2400 |2178.95 |.1950 /4.57% |.2136 /2.56% |
|Projection local setup: child/parent joint entries |366.63 |221.24 |.0547 /1.21% |.0260 / .32% |
|COM: weighted part visits |150 |300 |.0140 / .33% |.0230 / .29% |

Contact construction is32passes/sampled tick at15 but~14.53 at30; density/contact
early exit explains why more organisms need not mean more contact passes. Founder
count, eyes/parts/food also co-vary, so this is not independent scaling attribution.

Substep/contact records each derive one mass; projection entries derive **two**
masses/inverse inertias and local anchors; COM derives a mass but also performs
dynamic weighted sums. Approximate mass-derivation totals from these counted consumers
are3583/3521per sampled tick, not300/600. Those totals mix consumers and are **counts,
not CPU costs**. They do not include every possible helper/demand outside the window.

Unique visited part-definition identities:75/150 in substep/contact/COM;31/50 in
projection-involved genomes. Projection entry count and unique part count have
different units; do not divide them to claim an exact cache hit rate. Derived inputs
are stable under this anatomy/density context; true immutable-key/invalidation
requirements remain separate.

The substep block is the most direct immutable-arithmetic measurement. Contact
and COM clocks include useful dynamic work, so their entire times cannot be assigned
to mass derivation or removed by a cache. Block clocks include timer overhead;
probe counter/WeakSet bookkeeping is outside those block intervals but inside
instrumented tick calls. The zero-tick timer control records median empty pairs
55–87ns, p95~57–188ns and isolated spikes up to140624ns. The original aggregate
820.5ns mean is retained. Small block timings remain approximate and are not exact
nanosecond instruction prices.

## Isolated recomputation versus lookup

One registered component process; three families × three modes × three repetitions,
10000warmup +2000000measured visits each:54million measured visits total.
Checksums are exactly equal within each family, and original consumer-specific
floating formulas are retained.

| Family | Recompute median ms/2M (range) | Direct-index median (range) | WeakMap median (range) |
| --- | --- | --- | --- |
|Substep four values |35.22 (26.97–61.27) |25.69 (21.47–86.05) |67.55 (50.76–80.67) |
|Contact two values |50.49 (44.05–91.42) |30.31 (28.56–32.02) |47.14 (44.17–759.90) |
|Projection eight local values |127.67 (110.35–291.26) |111.98 (37.88–203.24) |77.48 (62.84–80.45) |

These loops copy numeric values into reusable output and consume them in a checksum.
They include common indexing/loop/consumption work; projection recomputation calls
the existing local-anchor helpers. Fixed contexts, polymorphic functions, tiering,
the short warmup and mode order constrain interpretation. Keep the759.90ms WeakMap
contact outlier and early slow iterations; none were replaced or dropped.

Direct lookup has promising **component-only** medians in these cases. WeakMap is
~1.92× recomputation cost for substep metadata and is not a universal remedy.
Projection WeakMap is faster in this isolated setup, but no full-kernel variant
tests its net cost, lifetime or cache key. Do not multiply these ratios by complete
physics/contact budgets or promise a game speedup.

Cold direct precompute timings for225substep,225contact and180projection entries
are~.215/.731/3.892ms; WeakMap insert~.067/.201/.150ms. Numeric payload totals
7200+3600+11520bytes for these separate component fixtures. These are one cold
construction per family, include startup/tiering effects, and do not price an
approved cache design or entire organism/genome memory.

## Memory validity control and lifecycle evidence

The original component's populated heap was below key-only heap
(−1566944bytes). It is **invalid as retained-cache size**, consistent with last-use
weak-key liveness/GC; it is preserved, not interpreted as a memory saving.
[Registered one-process control](validity-amendment.md) retains keys and container
through explicit global roots, verifies10000live lookups after populated GC, then
drops only the strong key root. No kernel or54M-visit comparison was rerun.

| Controlled phase | Heap used bytes | RSS bytes | External /ArrayBuffer bytes |
| --- | ---: | ---: | --- |
|Initial |8283736 |49303552 |4247421 /350526 |
|Keys strongly retained |10046128 |51007488 |4109086 /212151 |
|10000metadata entries, keys retained |11818688 |59658240 |4109086 /212151 |
|After key-root drop + explicit GC, container retained |7420064 |65818624 |4109086 /212151 |

Observed populated-minus-key-only heap is1772560bytes (~177.3bytes/entry) for
six-number Float64Array metadata and a WeakMap, excluding key objects. Numeric payload
is48bytes/entry,480000bytes total. This is a single-process incremental heap estimate,
not an exact object-layout size or universal storage cost. Other phase liveness and
GC/allocator behavior can affect deltas; RSS can remain high after heap decreases.
External/ArrayBuffer readings did not rise in this small-record representation;
do not add numeric payload again as if it were separately measured external memory.

Key-drop evidence demonstrates reclamation under this synthetic forced-GC setup,
not deterministic cleanup timing, a solved application leak or real organism-death
lifetime. Actual genomes may stay strongly reachable through lineage, eggs or Bank.
No TTL/LRU/sweeper has been selected.

Isolated identity/dependency checks all passed: cloned child-part and restored-world
identities miss the old weak key; same-object dimension edit and changed density
invalidate cached numeric values; current-schema full snapshot round trip is exact.
These were synthetic metadata checks with zero living evolution. Every historical
regime/save, real mutation/reproduction/death retention and world-reset integration
with an actual cache remain open. No permanent cache was inserted.

## Exactness, evidence and verification

All14archives pass original SHA256, Git-blob SHA and gzip checks. All12kernel slots
have identical initial/warm/fiveperiodic/final hashes within their workload, including
authoritative physics, PRNG, optics, neural/learned state, energy and lineage.
Final hashes independently equal v1's original tick360 references:
15=`bc7e89b26e3ec1e51df77adc2819a91b35bb4b9dbfbf9b6e5ce69b04d17bc239`;
30=`b480213ea8af3c599ea63c978e09926c485877c0d2891c47678fb489f98a5636`.
Energy discrepancies are~−1.36e−8/−3.68e−8J.

Full shared final snapshots are preserved in the recovery15baseline and30baseline
rep1 archives (2182071/4351803serialized bytes). Their exact serialized snapshot
hashes match every applicable trial; no missing snapshot was reconstructed by replay.
Initial full checkpoints remain in immutable v1. [Summary](summary.json),
[verification](verification.json), [manifest](manifest.json), individual archives/
receipts, [analysis source](../../../scripts/performance-stage33b/analyze.py).

## Cumulative reassessment and next questions

- S2-02 is now **partially investigated**: repeated derivations/identity constraints
  confirmed, substep metadata LOW OBSERVED cost, isolated reuse tradeoffs measured.
  A dominating substep-derivation explanation is refuted for these workloads.
  Actual end-to-end cache gain remains UNKNOWN; no optimization benefit is shipped.
- S2-01 is deepened: body-wrapper construction subset is measured, and iteration
  density/early exit is a confirmed reason not to infer cost from population alone.
  Broadphase/narrowphase/solver/actual cache variants remain open.
- S2-12 memory/GC remains open for the application; the new synthetic retained-key
  control and invalid original reading clarify measurement methodology, not a leak.
- Every other executive row retains its previous scoped evidence and uncertainty.
  Graphics software-CI caustic blur remains the strongest measured display problem;
  optics/neural work remain major older coarse fronts; real Worker/UI/IPC, independent
  scaling, hatch/crossing bursts and long-run/desktop behavior remain pending.
- Preserve original Stage3.3 unknown outcome, recovery authorization and both memory
  readings. Stage3.3b completes the authorized batch, not Stage3.

Proposed Stage3.4: a bounded **real Worker/UI transport and throughput** study,
separating actual ticks/s, frame construction/serialization/receive/apply/ACK and
observer refresh. Use few fixed worlds/speeds and matched rendering controls;
record protocol/budget before execution. This proposal is **not executed**.
Do not automatically implement a cache, change display cadence or begin another batch.
