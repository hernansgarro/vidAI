# Stage 3.3 preregistration — physical derivation attribution and isolated reuse costs

2026-11-03. Hernan explicitly requested choosing and executing another bounded Stage3 batch. This authorizes this investigation, not permanent optimization, a production cache, a main/testing merge, an upstream PR or automatic Stage3.4.

## Questions and scope

S2-02: (1) how often do substep mass/inertia, contact body metadata, projection local data and COM calculations repeat? (2) what wall time do the relevant blocks consume? (3) in isolated component calls, is recomputation actually slower than direct indexed precomputation or WeakMap lookup/copy? (4) what ownership/invalidation and memory costs do those candidate representations imply? Preserve meaningful negative results.

Research base: `29e3f7569e1e788e3301d4bb9f71aa1a4a01d3ff`, fork draft PR66, `hernansgarro:audit/performance-stage-3`. Runtime fork/main11248f3 and upstream041362e verified unchanged; testing4bda30a is excluded. Local checkout7279fc8 has the identical runtime as this research base; stale local documentation is not the report source. Keep v1/v2 immutable; new evidence lives in `docs/experiments/performance-stage-3-v3/`.

## Environment and execution

Current local filesystem is read-only. Use installed Node24.22.1 builtin registerHooks/stripTypeScriptTypes to load original TypeScript/JSON and optional diagnostic patches **in memory**, without writing copied modules or caches. Original source digests are recorded and checked against the pinned runtime; no production source/import graph is edited. Node host/kernel measurements are not actual browser Worker, UI/GPU or desktop throughput. Record OS/CPU/cgroup limits/Node/flags, heap/RSS, exact sources and checkpoint hashes. No local browser/download or unrelated browser campaign is needed.

Before scientific slots, allow one loader/source-anchor/checkpoint-restore preflight with **zero simulation ticks**, no timings interpreted as performance. Stop if it cannot run; no failed scientific slot may be replaced. The preflight is not extra biological evolution.

## Fixed workload attribution — exactly12 slots maximum

Two original archived checkpoints (founders15 and founders30, v3/closed/capsule/decay-v2); baseline vs diagnostic; three repetitions. Order:
rep1 15baseline/15diagnostic/30baseline/30diagnostic;
rep2 reversed;
rep3 same as rep1.
Each independent Node process restores the exact original checkpoint, warms60fixed ticks and measures300fixed1/60s ticks. Record every tick wall time, process CPU window (includes stated harness overhead), initial/warm/five60-tick/final full-state hashes, energy discrepancy, inventory and heap/RSS. Preserve a shared full final snapshot per workload from first baseline; subsequent equal hashes refer to those exact bytes, not missing reconstructed outcomes.

Diagnostic mode samples one tick in eight and clocks whole blocks, never individual scalar operations: substep mass/inertia fill; projection local setup; complete contact-body wrapper construction (explicitly includes dynamic transforms/bounds); complete COM function (explicitly includes dynamic weighted sums). Count calls and relevant parts/joints by consumer; do not pretend contact/COM block times isolate immutable arithmetic. No CPU sampler or cache is inserted into authoritative execution. Baseline is the original unpatched kernel/host loaded with the same TypeScript eraser. Measure apparent diagnostic overhead; same source/operator order, no changes to PRNG/physics/learning/energy. Snapshots occur outside summed tick timing, but may induce later GC; disclose that confound. No concurrent local build/suite while slots run.

## Isolated arithmetic/lookup study — one component process

Use finalized parts from the same archived checkpoints, fixed density. Three families:
substep mass/inertia/inverses; contact inverse mass/inertia using its original distinct formula; projection local inverse masses/inertias/anchors.
Compare original recomputation into reusable numeric output, direct indexed precomputed metadata copied into the same output, and WeakMap lookup/copy. Three repetitions with reversed mode order in rep2;10000warmup and2000000measured part/joint visits per family/mode/repetition (27timed loops,54million visits maximum). Retain exact checksum/output equality, all timings and cold construction costs. Consume numeric outputs to limit dead-code elimination; disclose JIT, fixed-context and microbenchmark limits. Calibrate10000empty timer pairs separately. These synthetic lookup ratios are not demonstrated full-kernel/game speedups.

## Ownership/invalidation/memory — same component process, bounded

Use10000fresh part-definition keys (not full neural-genome clones) to estimate incremental retained heap for six-number metadata records and WeakMap containers with explicit GC before/after when available. Record raw heap readings, key-only versus populated phases and after dropping keys; numeric payload48bytes/part is not JS heap size. No heap delta proves deterministic collection or a real-world long-run leak fix.

Inspect candidate identity behavior across current snapshot restore/reset, cloned child anatomy and one synthetic dimension/density-context edit outside any living simulation. Demonstrate stale-key risk and context invalidation requirements with exact scalar comparisons. No offspring search, coefficient tuning, live mutation or changed biology. Actual reproduction/death with retained lineage/Bank/egg genomes, every historical regime/save and long-run retention remain open unless explicitly covered by these small checks; never overclaim compatibility.

## Stops, evidence and validation

Experimental ceiling10cumulative minutes,20seconds per kernel child,60seconds component process,512MiB RSS per child and128MiB evidence. Parent pauses between slots to preserve originals before advancing; connector/archive idle time is not experimental CPU time. Stop on any scientific failure, mismatch, ceiling or missing evidence; no replacement/retry. Preserve failed outcomes and partial results.

Save exact runnable research source/protocol before execution, compressed original per-slot/component receipts, full shared final snapshots, source/checkpoint digests, overhead, comparisons and cumulative dashboard/research-queue updates. Verify outputs/hashes without replay. Persist via fork GitHub connector because local writes are unavailable. Original runtime/package/workflow/required tests remain unchanged. Final research code gets applicable fast/build CI; browser/Worker suites are not repeatedly scheduled for an unchanged runtime. No Wiki publication, deployment, releases or VIDA3D changes. No native Project transition is claimed for this fork-only substage; #67 remains open.

After this one batch, reassess every executive row, report confirmed/refuted/partial findings and propose a next bounded study. **Stage3 remains ONGOING; STOP for Hernan's review.**

Coordination: https://github.com/smeagol44/vidAI/issues/57#issuecomment-6596621809
