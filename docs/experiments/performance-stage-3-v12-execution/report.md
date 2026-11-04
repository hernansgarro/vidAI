# Stage 3.10 — 150-organism overhead, GC and finite pacing: COMPLETE

**All eight registered timed windows executed once, retained and verified. All complete authoritative endpoints match each other and the archived Stage3.9 reference exactly. The active, runner, storage, trace and attempt budgets passed.** No scientific retry, replacement or lost result. Earlier3.8/3.9 partial results and failed budgets remain unchanged.

The clearest new result is finite-speed saturation: requested1x and2x achieve53.16 and55.13ticks/s, respectively, on this fixed150body CI scenario. Separate tracing exposes substantial GC/allocation activity, but increases elapsed cost~60%; its GC share must not be applied to ordinary gameplay or subtracted to predict an optimization gain.

## Fixed scenario and actual performance

Every window starts from the same150spread authoritative state, executes360complete1/60second ticks (six simulated seconds), and uses the real Worker pump with ordinary30/s+ACK reporting. Before each window:60same-mode warmup ticks, then an exact reset. Viewport1280x850,DPR1; default visible camera, unchanged off-camera simulation and normal learning.

Initial SHA256`1190cca6d9a7a908d7b9fbeca0ac744e0f4bec70b969f5a38b44605b43dcf114`;150living,690parts,540joints,330eyes,1650rays,3600hidden neurons and600ordinary nutrients. Five CUR001–005 genotypes in equal proportions; habitat4000x3000, seed73, passive-work-v3/capsule-v1/closed-v1/decay-v2, normal reserves and energy accounting. No subsystem replacement, subsidy, physics change or placement search.

| Order / ID | Condition | Requested speed | Elapsed ms/tick | Actual ticks/s | Effective simulation speed |
| --- | --- | --- | ---: | ---: | ---: |
|1 / L01 |Lean control |MAX |18.7039 |53.4648 |0.8911x |
|2 / O01 |Research hooks OFF |MAX |19.2050 |52.0698 |0.8678x |
|3 / S01 |Lean finite pacing |1x |18.8125 |53.1561 |0.8859x |
|4 / L02 |Lean control |MAX |18.4661 |54.1533 |0.9026x |
|5 / C01 |Sampled counters |MAX |20.4589 |48.8785 |0.8146x |
|6 / T01 |Lean + separate GC trace |MAX |29.7206 |33.6467 |0.5608x |
|7 / D01 |Exclusive phase timers |MAX |20.7442 |48.2063 |0.8034x |
|8 / S02 |Lean finite pacing |2x |18.1383 |55.1319 |0.9189x |

Two lean controls: median18.5850ms/tick and53.8090ticks/s; range53.4648–54.1533, repeat span1.2876%. Only two primary repetitions; all diagnostic and finite-speed conditions have n1, fixed order, no confidence interval or order/host-noise correction. The controls are interleaved rather than adjacent, but do not bracket every later diagnostic.

Requested1x targets60ticks/s: achieved88.59% of that request, completing360ticks in6.7725s instead of6s. Requested2x targets120ticks/s: achieved45.94% of its request, completing360ticks in6.5298s instead of3s. The latter is only3.72% faster in actual ticks/s than the1x window; it does not double useful simulation. Both finite conditions and both MAX controls are below60ticks/s here. This is direct short-horizon saturation evidence on this CI host, not a sustained desktop limit or proof that2x inherently causes a slowdown.

## Measured observer cost

Compare each MAX diagnostic's elapsed ms/tick to the median of L01/L02, keeping the original data unchanged:

| Diagnostic | Observed elapsed change | Interpretation |
| --- | ---: | --- |
|Research hooks OFF O01 |+3.34% |Cost of compiled hooks/branches plus order/noise; not a calibrated universal overhead |
|Sampled counters C01 |+10.08% |One window with23sampled ticks; total instrumentation contrast |
|Phase timing D01 |+11.62% |Exclusive timers plus sampled counters; do not subtract from individual phases |
|Category-filtered trace T01 |+59.92% |Large perturbation; traced TPS and GC fractions are separate diagnostic evidence |

The two controls vary only1.29%, while the trace contrast is much larger. Nevertheless, the n1 fixed-order comparisons do not isolate a precise causal instrumentation coefficient. No diagnostic rate is mixed into the primary median. No production optimization or reduced sensing/learning/physics was implemented.

## Exclusive elapsed phases and work counts

D01 accounts for all360kernel ticks with zero exclusive-ledger closure error. Mean kernel tick19.1372ms; this excludes frame transport/pump gaps and differs from the whole-Worker20.7442ms/tick above. Times include probes, preemption, JIT and any GC occurring within the phase; they are not per-phase CPU or mutually exclusive with the separate trace's GC totals.

| Exclusive group | Mean ms/tick | Share of timed kernel |
| --- | ---: | ---: |
|Vision + sight construction |6.2378 |32.60% |
|Physics + shared contacts |5.4131 |28.29% |
|Recurrent inference |4.5117 |23.58% |
|Motor + sensory learning |1.3414 |7.01% |
|Feeding + oral index |0.5775 |3.02% |

This reproduces the earlier qualitative150body attribution: vision, articulated/contact work and inference dominate. The six-second state is the same as3.9, but timings are a new host session and must not be presented as a cross-lot speedup/regression. No new100body/dense window or density coefficient was measured.

C01/D01 sample ordinals1mod16:23ticks. D01 counts per sampled tick:1650rays,22604.78visual candidates,16416.70body-edge tests,150brain evaluations,600body advances,2760part advances,2160joint advances,13.4348contact passes,1311.17self-contact candidates and477.26resolved self-overlap passes. External candidates4.8696; no counted resolved external pass. Counts are sampled iterative work, not unique encounters or full-trajectory collision totals. The observer activity-entry count can depend on render/report timing despite exact saved-state equality.

D01 frame construction median0.40ms and synchronous postMessage median3.10ms across108calls. These are not full IPC/deserialization/React/ACK latency. Non-traced windows receive14.46–15.74fresh reports/s and render38.17–41.95canvas frames/s; T01 drops to7.57reports/s and32.24FPS. Latest warmed-frame JSON approximation~947.7KB is not structured-clone wire size. No report-cadence or renderer ablation was performed.

## Marked Worker GC and allocation evidence

T01 retains46,756trace events,12,200,561JSON bytes (<16MiB), with explicit Worker/main user-timing marks and `dataLossOccurred:false`. WorkerPID1335/TID1398 and mainPID1335/TID1335 both match Linux task start identity before/after the useful window; no identity was reused across workers. All intervals are clipped to the same10.6994s useful Worker span. Nested GC scopes are unioned, never added together.

| Trace-only quantity |Worker thread |Main thread |
| --- | ---: | ---: |
|Linux task CPU over outer bracket |10.52s |10.69s |
|Union of GC-related wall intervals |3.7980s (35.50%) |2.7289s (25.51%) |
|Union of complete outer MinorGC/MajorGC intervals |3.7584s |2.6924s |
|Complete MinorGC / MajorGC events |95 /3 |14 /3 |
|Inter-GC allocation observations |98 |17 |
|Interior reported allocated bytes |2,957,338,728 |417,178,484 |
|Observation span |10.502755s |10.126451s |
|Inter-GC allocation-rate proxy |281.58MB/s |41.20MB/s |
|Rate divided by traced tick rate |8.37MB/tick |1.22MB/tick |

MB here is decimal. The allocation proxy sums `allocated` from the second through last in-bound NVP record, divided by the first-to-last record interval; boundary intervals are excluded. It is a sampled inter-GC diagnostic, not a complete allocation census, exact per-tick receipt or retained-heap increase. [V8 GCTracer source](https://chromium.googlesource.com/v8/v8/+/76322a1262f8bc00687faf62bb6a00cc0ed9926f/src/heap/gc-tracer.cc) documents the NVP `allocated` field; [CDP Tracing](https://chromedevtools.github.io/devtools-protocol/tot/Tracing/) describes the category-filtered stream. Raw NVP/event values are retained in T01-trace, not recreated from a summary.

The three traced Worker MajorGC intervals last about1.319/1.241/1.041seconds. These are large observed diagnostic stalls. **The trace itself costs~60% extra elapsed time and may materially change allocation/collection behavior. The35.50% GC share is not the untraced simulation's GC share.** Worker/main percentages are separate concurrent threads and cannot be summed into one wall-time fraction. GC time is not added to phase totals from D01. Do not subtract traced GC from primary time or promise a35% optimization. No forced GC, allocation-stack ownership, long Workerheap series or leak diagnosis was obtained. Main performance.memory is coarse main-thread evidence only.

The new evidence makes transient memory/allocation lifetime a credible next analysis front, alongside optics, physics and inference. It does not establish which source allocations are unnecessary or safe to reuse. Full deterministic state, recurrent learning, sense/occlusion ordering and physical accounting remain required for any later proposal.

## State fidelity, ecology and source integrity

All eight complete endpoints match the archived3.9 P03 snapshot SHA256`c9189ebe919fc196e899b15780803ae85387602f54f56ea551a395b49a31bf7b`; state-only SHA256`d90ec09ea4848648bd57d1e3e3719b161147310feeb2feb109865f00f4ffd0e4`. This includes PRNG, inherited and acquired neural state, learning, bodies, settings and energy. Exact completed counters360 independently match six simulated seconds; frame deltas are not used as cumulative totals.

Both4+3counter controls report7completed ticks with drained frame steps4and3. All four24tick150pilot modes match each other and the previous150lean pilot exactly. Normal economy remains funded, max energy-closure error3.8511e-7J. Final living150/parts690/joints540/food569, no death, new offspring, egg or numerical guard event. No physical/ecological improvement is inferred. Previously disclosed small spread-world wall-AABB protrusions are not corrected; unchanged endpoint fidelity preserves that limitation.

All276inherited fork-main files remain byte-identical. All47original output files match the immutable fetched Git blob, SHA256 and length;14copied reference files also match their original commits/paths/bytes. Every compressed receipt verifies stored bytes and exact expanded JSON/hash/length/order. [Verification](verification.json), [source equivalence](source-equivalence.json), [findings](findings.json), [CI job](ci-job.json), [selected original log lines](run-log-excerpt.log).

## Budget, provenance and publication

Protocol registered BEFORE coding in [upstream#57 comment6629413476](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6629413476), shared [#67](https://github.com/smeagol44/vidAI/issues/67), [fork draft PR100](https://github.com/hernansgarro/vidAI/pull/100). Base fork/main`dd7925b9d02a67459bb68985cf2d5647b737247e`; source`6835f03ee42134bd00dd09c8321334bfab201aa0`; immutable original evidence`a21a042c9b259f708f59fcde38f154e0d09489a3`. Research/reference dependencies are selected copies from3.9, not an experimental/testing merge into main.

[Scientific run41821659990](https://github.com/hernansgarro/vidAI/actions/runs/41821659990), job126546033488, SUCCEEDED. npmci, codec/corruption/refusal/emergency checks,385fast tests, typecheck/build and actualproductionWorker passed before the single matrix. Routine source-headCI41821666503 also succeeded. No Firefox/full-suite/manual browser expansion was required. Artifact13317758941:11,007,868bytes, SHA256`505997a0c38e7efbce5cdf5f44466911ef3e72c1ee52586667ec57f0fd22d054`; all47files match Git preservation.

| Registered resource | Actual | Ceiling / outcome |
| --- | ---: | --- |
|Timed attempts / retained / missing |8 /8 /0 |8; passed |
|Active finite-control/warmup/scientific brackets |148.961s |180s; passed |
|Inclusive research runner through context/server cleanup and final manifest/write tail |623.218s |720s; passed |
|Full Playwright invocation step, including launch/reporting |627s |720s; passed |
|Latest slot admission |565.657s |No admission after600s; passed |
|Largest useful window |10.6994s |30s; passed |
|Normal output stored raw + plain controls + copied input references |49,625,831bytes |192MiB; passed |
|Independent emergency stored raw |38,264bytes |2MiB; passed |
|Trace JSON |12,200,561bytes |16MiB; passed |

Preflight reached readiness at153.627s. Useful scientific intervals total59.1298s. Full authoritative exports take6.02–7.46s each outside useful CPU/Worker timing; repeated imports, warmup exports, comparisons and archives consume most remaining runner time. Smaller scope and120s admission reserve allowed all eight windows to close. This is harness overhead, not an extra tick cost. External artifact upload/Git replication and routine preparation are separate identified workflow steps; they are not hidden within the reported useful intervals.

Normal output stored raw43,804,032bytes plus emergency38,264 and plain controls62,676 totals43,904,972; copied reference stored raw5,759,123. Regular expanded receipts represent291,975,698JSON bytes. Storage limits count the stored lossless representation, with logical volume reported separately. No product save format or live memory optimization was changed.

Host: AMD EPYC7763,4reportedlogical CPUs,16.76GB total memory, Linux7.0.0-1017-azure/x64, Node24.22.1, Chromium145.0.7632.6 / Playwright1.58.2 pinned noble container; software rendering details and cgroup values are in the manifest. This is CI, not representative desktop hardware. Browser-group CPU~54–63CPU-ms/tick untraced and85traced sums multiple processes/threads; it is not Worker-only CPU. Residual bracket excess1.46–3.16% is disclosed; full snapshot export happens after bracket closure.

## Reproduction and exact next action

From a full Git checkout of this research branch:

```sh
node scripts/performance-stage310/analyze.mjs
python scripts/performance-stage310/verify-source.py
```

These only read archived evidence/Git objects; no simulator or browser is launched. The source auditor pins immutable originals, avoiding report-head self-reference. Analysis has no failures and reports COMPLETE. The historical workflow reference remains in scripts/performance-stage310; the active launch YAML is removed so report commits cannot launch another scientific lot.

PR100 stays DRAFT/UNMERGED. Main/testing/upstream code, release/Pages/Wiki and all earlier research branches remain unchanged. Shared#67 remains In progress, not Done/upstream acceptance. **STOP after completed lot3.10. Next action is Hernan's review of accumulated Stage3 evidence; no automatic new lot, Stage4/product optimization or upstream submission.**
