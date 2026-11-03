# Stage 3.7b — Worker profiling and counterfactual subsystem recovery

**Registered lot: COMPLETE. Stage 3 remains ongoing. Stop after this lot; no production optimization or Stage 4 implementation.**

This separately authorized recovery preserves original Stage 3.7's failed/missing P01 at `812f5113931e4cc6486dcc5b7559f0f85b212bdf`. New observations do not replace that failure or repeat historical Stage 3.1–3.6 studies.

## Main findings

The unchanged real controls have median **223.936 ticks/s**, range **222.108–237.170**, four separate 12-second windows. Each dummy has only ONE independent primary window. Nearby real controls define the reported comparison; no confidence interval, population-level causal effect or universal optimization benefit is established.


| Mode / window | Worker ticks/s | Nearby real reference | Absolute ticks/s difference | Relative difference |
| --- | --- | --- | --- | --- |
| vision / P02 | 340.584 | 222.448 | 118.136 | 53.11% |
| brain / P03 | 265.892 | 222.448 | 43.444 | 19.53% |
| learning / P06 | 247.029 | 231.127 | 15.902 | 6.88% |
| feeding / P07 | 235.270 | 231.127 | 4.143 | 1.79% |


**These are observed whole-system counterfactual effects.** Altered sensory inputs, hidden state, learned offsets, intake, trajectories, contacts, ages and food availability can change later workload. The percentages are not exclusive CPU shares, independently additive effects or demonstrated savings available to a legitimate optimization. No production behavior was changed.

The strongest observed contrasts are vision (+53.11%) and brain-output substitution (+19.53%). Both exceed the real-control range of6.78% relative to its minimum, but remain unreplicated and behavior-confounded. LearningOFF (+6.88%) is comparable to that control spread; synthetic feeding (+1.79%) is smaller. Stable benefit for the latter two is therefore **UNKNOWN**, not established by their positive single-window signs.

The separate phase diagnostic puts physics/contacts first (1.9180ms/tick,43.86%), vision plus sight construction second (1.3871ms,31.72%), then inference (0.5919ms,13.54%). Motor plus sensory learning adds0.1993ms (4.56%), feeding plus oral indices0.1323ms (3.03%). These are exclusive local elapsed categories, not browserCPU shares or removable work. Existing physical metadata alone is a small sampled subset; a general mass cache is not established as the best target.

## Protocol, source and exact starting state

Owner authorization and [preregistration](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6616234234) precede implementation/execution. Fork branch `audit/performance-stage-3-7b`, [DRAFT PR #92](https://github.com/hernansgarro/vidAI/pull/92), base `a430f3b51ffd00f4327e692d1b8a417f10a98831`, measured source `57a7d45f3edf812b6b147ef67a2d80445e95d778`, immutable original evidence `66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed`. Upstream reference remains `041362eefa64971d9038f4ad7ec4fd59a747d3ec`.

- Reused exact Stage 3.5/3.6 checkpoint: gzip SHA256 `c6ab22b6d12f5b38f8234c5a440620218173a31f8ae23fbf4a5ef83a9455758e`; state `1299114a9d1195056cacd2a2a7bac87b824d830911d7bbee88b51f1e1ce99e83`. Seed73, 30 living, 162 parts, 132 joints, 78 eyes, 390 rays, 720 hidden neurons, 30 mouths, 275 food, zero eggs, disconnected topology. Closed world budget1,323,540J; initial organism reserves300,000J, universe reserve0J.
- Actual browser production Worker, active MAX, caustics OFF, no selected/tracked organism or inspector, fixed default camera, viewport1280x850/DPR1. All off-camera physics, senses and ecology remain active. Mixed execution order stays global environment/eggs, organism senses/inference/learning, shared physics/contact substeps, metabolism, then post-movement feeding/reproduction.
- P01 real, P02 vision, P03 brain, P04 real, P05 real, P06 learning OFF, P07 synthetic feeding, P08 real:12s each. C01 ordinary lean, C02 counter-only, C03 phase timing, C04 independent trace:5s each. Each starts after2s same-mode warmup and exact original checkpoint reimport. No factorial combinations or extra repetitions.
- Source-only Vite transforms. Ordinary source/build imports no probe or dummy. C01 and research builds share the small independent completed-tick wrapper; that common boundary cost is not separately priced. Nested details sample ordinal1mod64; only C03 clocks top-level phases every tick. Detailed diagnostics are excluded from primary contrasts.
- Genuine A/B/C data reused byte-for-byte from original evidence812f511, gzip SHA256 `ba6521b6bb107ad2b1d114e91cfdb530d5a5f13b7582e29ec5c7516d34bab54f`. Per-organism retinal/hit/output shapes preserved; selector `(hash73(id)+logicalTick-1)%3`, no authoritative PRNG consumption. Global request-order generator not used or benchmarked. Unknown organism IDs fail explicitly.

Environment: AMD EPYC 9V74 80-Core Processor; 4 reported logical CPUs; 15.61GiB; Linux7.0.0-1017-azure; Nodev24.22.1; Chromium145.0.7632.6/Playwright1.58.2. Actual backend and flags are retained in [manifest](https://github.com/hernansgarro/vidAI/blob/66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed/docs/experiments/performance-stage-3-v9/manifest.json.gz); distinguish software graphics from a physical desktop GPU. Host contention, watts, thermal state and frequency throttling are unmeasured. No absolute cross-study speedup/regression inference.


## Every primary window and evolving workload

| Window | Mode | Ticks | Actual ticks/s | Living / parts / food / eggs at end | New births / completed deaths | Browser CPU-ms/tick | Canvas FPS / reports/s |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P01 | real | 2669 | 222.108 | 30 / 162 / 280 / 0 | 0 / 0 | 12.315 | 57.1 / 19.6 |
| P02 | vision | 4093 | 340.584 | 30 / 162 / 275 / 0 | 0 / 0 | 7.804 | 58.7 / 20.5 |
| P03 | brain | 3196 | 265.892 | 29 / 158 / 278 / 0 | 0 / 1 | 10.432 | 56.6 / 20.0 |
| P04 | real | 2676 | 222.788 | 30 / 162 / 280 / 0 | 0 / 0 | 12.216 | 57.4 / 19.8 |
| P05 | real | 2851 | 237.170 | 29 / 156 / 282 / 0 | 0 / 1 | 11.589 | 57.6 / 19.5 |
| P06 | learning | 2970 | 247.029 | 30 / 162 / 281 / 0 | 0 / 0 | 11.013 | 58.0 / 20.0 |
| P07 | feeding | 2829 | 235.270 | 30 / 162 / 294 / 0 | 0 / 0 | 11.022 | 59.0 / 20.0 |
| P08 | real | 2705 | 225.083 | 30 / 162 / 280 / 0 | 0 / 0 | 12.292 | 58.0 / 19.7 |


Equal wall-time endpoints represent different simulated horizons because achieved TPS differs. Their snapshots, full neural/learned/energy state, world counts and PRNG are retained. Browser CPU is independent Linux process execution normalized by useful ticks; it is not per-phase CPU. Process starts/exits and CPU-boundary skew are in findings.json. No claim that observer FPS equals fresh-state cadence or human motion/input acceptance.

## Exclusive direct computation ledger: separate C03 diagnostic


C03 measured1087 ticks; elapsed tick mean4.373ms, SD1.985, median3.800, p957.000, max40.900. Maximum top-level accounting closure error0ms. An explicit unattributed bucket remains.


| Exclusive top-level phase | ms/tick | Share of measured tick elapsed | SD ms |
| --- | --- | --- | --- |
| physics | 1.9180 | 43.86% | 0.9456 |
| vision | 1.2685 | 29.01% | 0.6775 |
| inference | 0.5919 | 13.54% | 0.4056 |
| sight-build | 0.1186 | 2.71% | 0.1210 |
| sensory-learning | 0.1022 | 2.34% | 0.1080 |
| feeding | 0.1006 | 2.30% | 0.1089 |
| motor-learning | 0.0971 | 2.22% | 0.1127 |
| environment | 0.0328 | 0.75% | 0.0540 |
| feeding-index | 0.0317 | 0.73% | 0.0535 |
| reproduction-death | 0.0307 | 0.70% | 0.0545 |
| neural-inputs | 0.0301 | 0.69% | 0.0582 |
| metabolism | 0.0270 | 0.62% | 0.0491 |
| organism-overhead | 0.0156 | 0.36% | 0.0395 |
| observer | 0.0063 | 0.14% | 0.0242 |
| unattributed | 0.0011 | 0.03% | 0.0113 |
| finalize | 0.0006 | 0.01% | 0.0074 |


Nested details sampled17 ticks. Their mean tick time is10.771ms versus4.271ms without nested detail. Tick locations/workloads/JIT also differ; this is not a calibrated causal subtraction. All phase times include clock/probe, preemption, GC and JIT effects. They are elapsed times, not per-thread CPU utilization. C03's shorter/different logical horizon is not the complete12s primary workload.


### Executed operation counts

| Operation | Calls or work units per sampled tick |
| --- | --- |
| simulation.ts:advanceNutrientCycle | 1.000 |
| simulation.ts:getPartCornerVertices | 972.000 |
| spatialIndex.ts:constructor | 4.000 |
| indexEntries | 746.471 |
| simulation.ts:getOrganAnchor | 108.000 |
| simulation.ts:getCardinalAnchor | 1526.471 |
| rays | 390.000 |
| spatialIndex.ts:query | 390.000 |
| spatialIndex.ts:collect | 1307.000 |
| visionCandidates | 7416.412 |
| circleTestsFood | 2585.176 |
| bodyEdgeTests | 5439.294 |
| simulation.ts:calculateOrganismCOM | 60.000 |
| simulation.ts:evaluateOrganismBrain | 30.000 |
| inference.prepare-deltas | 30.000 |
| neuralRuntime.ts:compiledBrain | 66.000 |
| inference.hidden-recurrent | 30.000 |
| inference.outputs | 30.000 |
| simulation.ts:applyWakingPlasticity | 18.000 |
| neuralRuntime.ts:alignPlasticRecords | 36.000 |
| simulation.ts:applySensoryAssociations | 18.000 |
| simulation.ts:advanceOrganismPhysics | 120.000 |
| physics.metadata | 120.000 |
| physics.motors | 120.000 |
| physics.drag-walls | 120.000 |
| physics.joint-solve | 120.000 |
| contacts.ts:resolveBodyContacts | 4.000 |
| contactPasses | 32.000 |
| contacts.ts:bodies | 32.000 |
| contacts.ts:pairs | 32.000 |
| contactCandidates | 1273.941 |
| contacts.ts:rotatedContact | 1273.941 |
| actualContacts | 667.529 |
| contacts.ts:contactImpulse | 667.529 |
| simulation.ts:projectBodyJoints | 186.353 |
| simulation.ts:bodyBounds | 30.000 |
| mouths | 30.000 |
| spatialIndex.ts:queryBounds | 66.000 |
| neuralRuntime.ts:compiledDeltas | 16.941 |
| neuralRuntime.ts:writeDeltas | 33.882 |


### Sampled nested exclusive time

| Phase / nested span | Exclusive ms per sampled tick |
| --- | --- |
| environment/simulation.ts:advanceNutrientCycle | 0.01176 |
| sight-build/simulation.ts:getPartCornerVertices | 0.05294 |
| vision/spatialIndex.ts:constructor | 0.03529 |
| vision/simulation.ts:getCardinalAnchor | 0.01765 |
| vision/simulation.ts:getOrganAnchor | 0.07647 |
| vision/spatialIndex.ts:collect | 0.44118 |
| vision/spatialIndex.ts:query | 1.09412 |
| neural-inputs/simulation.ts:calculateOrganismCOM | 0.00588 |
| inference/neuralRuntime.ts:compiledBrain | 0.21765 |
| inference/inference.prepare-deltas | 0.03529 |
| inference/inference.hidden-recurrent | 0.48824 |
| inference/inference.outputs | 0.08235 |
| inference/simulation.ts:evaluateOrganismBrain | 0.10000 |
| motor-learning/neuralRuntime.ts:compiledBrain | 0.00000 |
| motor-learning/neuralRuntime.ts:alignPlasticRecords | 0.02941 |
| motor-learning/simulation.ts:applyWakingPlasticity | 0.15882 |
| sensory-learning/neuralRuntime.ts:compiledBrain | 0.00588 |
| sensory-learning/neuralRuntime.ts:alignPlasticRecords | 0.00000 |
| sensory-learning/simulation.ts:applySensoryAssociations | 0.10588 |
| physics/physics.metadata | 0.03529 |
| physics/physics.motors | 0.19412 |
| physics/simulation.ts:getPartCornerVertices | 0.25294 |
| physics/physics.drag-walls | 0.49412 |
| physics/simulation.ts:getCardinalAnchor | 0.34706 |
| physics/physics.joint-solve | 0.67059 |
| physics/simulation.ts:advanceOrganismPhysics | 0.20588 |
| physics/contacts.ts:bodies | 0.32353 |
| physics/contacts.ts:pairs | 0.68235 |
| physics/contacts.ts:rotatedContact | 0.50588 |
| physics/contacts.ts:contactImpulse | 0.19412 |
| physics/simulation.ts:projectBodyJoints | 0.93529 |
| physics/contacts.ts:resolveBodyContacts | 0.91176 |
| metabolism/simulation.ts:calculateOrganismCOM | 0.00000 |
| feeding-index/simulation.ts:getPartCornerVertices | 0.05882 |
| feeding-index/simulation.ts:bodyBounds | 0.08235 |
| feeding-index/spatialIndex.ts:constructor | 0.01176 |
| feeding/simulation.ts:getCardinalAnchor | 0.01176 |
| feeding/simulation.ts:getOrganAnchor | 0.00588 |
| feeding/spatialIndex.ts:collect | 0.01176 |
| feeding/spatialIndex.ts:queryBounds | 0.05294 |
| feeding/spatialIndex.ts:constructor | 0.05294 |
| inference/neuralRuntime.ts:writeDeltas | 0.01765 |
| inference/neuralRuntime.ts:compiledDeltas | 0.01176 |


Nested spans subtract measured children. Parent top-level phases already contain their descendants: do not add both levels or compare sampled means directly to all-tick means. Per-operation quotients can be derived using matching call counts, but tiny quantized values and probe overhead prevent precision CPU constants. Subphase variance and allocation-stack ownership were not retained. `physics.drag-walls` includes prepayment/integration before joint solving; it is not pure drag. Existing scratch, compiled topology and somatic delta buffers remain intact. No independent anatomy/density scaling coefficient was measured.


## Probe and profiler controls

| Control | Build / profile | Ticks/s | Relative to ordinary C01 | Browser CPU-ms/tick |
| --- | --- | --- | --- | --- |
| C01 | ordinary / off | 212.380 | 0.00% | 13.377 |
| C02 | research / counter | 219.623 | 3.41% | 12.777 |
| C03 | research / phase | 216.512 | 1.95% | 13.744 |
| C04 | research / off + trace | 175.411 | -17.41% | 17.015 |


These are single ordered5s windows with equal starts/warmup but different resulting horizons and JIT/host variation. C02 includes research guard/counter cost; C03 adds phase/sample clocks; C04 includes the research-off build plus tracing. C04 versus ordinary C01 is a combined guard/trace contrast, not a pure tracing coefficient. No correction is subtracted from primary TPS, and no zero-overhead or sub-percent accuracy claim is made. Real primary controls use the same research-off code as every dummy.

## Independent CPU, GC and allocation diagnosis


C04 trace events:36830; trace metadata:{'dataLossOccurred': False, 'traceFormat': 'json', 'streamCompression': 'none'}. Explicit Worker/main marks identify that trace's PID/TID and align to actual Worker begin/end. The Worker is recreated by navigation; do not assign C04's thread ID to primary windows.


| Role | PID / TID | CPU-ms/tick | GC union wall ms | GC union thread ms | Minor / major pauses | Allocation proxy MB/s / bytes per tick |
| --- | --- | --- | --- | --- | --- | --- |
| worker | 1355 / 1452 | 5.516 | 166.069 | 112.958 | 75 / 6 | 477.52 / 2722275 |
| main | 1355 / 1355 | 5.505 | 37.434 | 31.835 | 4 / 1 | 24.53 / 139844 |


GC wall intervals are clipped and unioned, avoiding nested-event double counting. Thread GC CPU uses fully contained tts/tdur intervals; parallel/shared GC work is not uniquely assigned. V8 inter-GC `allocated` sums exclude first/last partial intervals. This is an allocation-rate proxy, not retained-heap growth, leak evidence or per-component allocation ownership. Trace/profile overhead means these values cannot explain primary gain causally. No watts/temperature/hardware-GPU claim.

The independently traced Worker has166.069ms of union GC wall time (~3.31% of its5.0225s window) and112.958ms measured GC thread CPU. V8 allocation proxy is477.52MB/s (~2.72MB per normalized completed tick). This confirms heavy transient allocation in that diagnostic, but identifies no allocating source stack or stable savings. Worker/main accumulated CPU4.86/4.85s over the surrounding OS bracket, nearly one core each; browser-group CPU is293.51% of one core. These are traced-window observations only. C04 TPS is17.41% below ordinary C01, so profiled measurements must stay separate.

## Matched-logical-horizon divergence and conservation

New fixed24-tick controls are correctness observations, not timed TPS results. All-real ordinary/off/counter/phase snapshots match completely; the cumulative-counter regression independently confirms7 completed ticks despite frame deltas4then3. Existing original120-tick controls remain at812f511 and were not overwritten.


| Mode | Mean / max part-position difference px | Mean abs neural-output difference | Motor / sensory learned L1 | Organism reserve J |
| --- | --- | --- | --- | --- |
| vision | 0.13502 / 0.75694 | 0.0158374 | 0.00091641 / 0.00612818 | 301408.4661 |
| brain | 0.29976 / 2.52157 | 0.0300452 | 0.00000000 / 0.00000000 | 301433.0344 |
| learning | 0.00002 / 0.00035 | 0.0000008 | 0.00000000 / 0.00000000 | 301435.5378 |
| feeding | 0.01002 / 0.33553 | 0.0028678 | 0.00000000 / 0.00000000 | 299620.7598 |


Vision supplies genuine but historical retinal/hit events, not current optical truth; proprioception/oral inputs remain real. Brain replaces neural outputs, leaves hidden state frozen and genuine learning calls active; physical motors, joints, forces and coefficients remain real. LearningOFF leaves senses/inference/physics active but changes future learned deltas, paid debits and commands. These downstream effects prevent interpreting any TPS contrast as only omitted computation.

Synthetic feeding bypasses oral grids/geometry/query/intake work, drawing at most1J/organism/s from positive universe reserve, capped by available source and storage. No fake physical contact/intake learning cue or authentic feeding event. The universe budget is unchanged; transfers are stock debit/credit, not new energy or a guaranteed-survival rule. Artificial and ecologically invalid.


Primary feeding receipt: **1414.500000J** transferred across84870 calls; max per-transfer error1.819e-12J; final closed-world error-5.378e-08J. Source debit/credit and zero feedback checks pass independently.


Physics replay was deferred: positions alone omit velocities, hinges, shared contacts, impulses, work and mechanical energy. No physics simplification. Counts/qualitative feasibility do not establish a safe physically equivalent optimization.

## Ranked hotspot register and boundaries

| Stable IDs | What is demonstrated | What remains uncertain / possible legitimate follow-up |
| --- | --- | --- |
| S2-01/02 | Executed articulated advances, contact candidates/SAT/impulses/projections and exclusive diagnostic phase costs | Avoidable fraction UNKNOWN. Study repeated geometry/metadata lifetime, bounds and scratch without changing substeps/iterations/coefficients/order. |
| S2-03 | Real optical index/query/candidate/geometry work; independently observed vision counterfactual TPS | Stable benefit and ecological mediation PLAUSIBLE/UNKNOWN. Equivalent ordered-index/result/geometry reuse needs exact tests; rays/occlusion/RGB/off-camera sensing stay essential. |
| S2-05 | Inference, preparation/deltas and learning costs; independent brain-output and learningOFF contrasts | No permission to disable recurrence/learning. Existing caches already exist; test equivalent data layout/lifetime only under future approval. |
| S2-04 | Oral index/query/contact work and independently funded diagnostic transfer | Artificial intake is not a production optimization. Preserve actual feeding order, receipts, learning cues, energy and ecology. |
| S2-06/07/10 | Real environmental/metabolic/reproduction/death and observer costs in this fixture | Event-heavy/hatching scaling UNKNOWN; retain funded ecology and truthful observer signals. |
| S2-12-M / S2-09/11/12 | Browser execution and separate traced CPU/GC/allocation data; probe controls | Allocation-stack ownership, retained heap, thermal effects, desktop applicability and exact mediation UNKNOWN. |
| S2-08 | Disconnected topology fixed | Connected tubes/crossings remain UNKNOWN, not silently excluded production work. |
| Counter validity | Independent completed-tick meter agrees with full authoritative time; originals precede validation | Original Stage3.7 measurement remains failed/missing; recovery does not retroactively repair that observation. |

Classification: actual per-window rates/counts/conservation and measured phase observations are CONFIRMED within their recorded scope. Stable general speedups or a production-safe recoverable fraction are PLAUSIBLE/UNKNOWN; additivity and pure-component causal interpretations are unsupported. The cumulative interpretation of frame().steps is REFUTED by the prior failure and source, and the independent counter is now validated. No biological equivalence claim for dummies.

## Validation, archive integrity and stop

Scientific run [41729322675](https://github.com/hernansgarro/vidAI/actions/runs/41729322675), job126242231666. Source installation, 385 fast tests, typecheck/build and actual production Worker gates precede the focused Chromium counter/pilot/matrix execution. Routine source PR validation41729330065 passed with extended/full/browser and Pages steps skipped by existing gates; it does not substitute for the dedicated measured-source Worker/browser work.

Attempts:12; retained:12; not started:0; active201.978s; inclusive runner357.601s; uncompressed original scientific archives111,808,143bytes. Finite360s/600s/128MiB/12slot limits checked. Every original SHA256/length, full-state counter/pilot/window equation, settings/mode, synthetic conservation and pre-validation archive order independently verified. Actual built JS/maps and immutable source digests retained, not reconstructed. No lost/repeated/replaced window or automatic next campaign. The first analysis-only settings comparison used JSON property order and was rejected; it was corrected to deep structural equality of unchanged keys/values. Original bytes and measurements were not changed or rerun.

Reproduce **analysis only** with `node scripts/performance-stage37b/analyze.mjs`; this launches no simulation/browser. [Manifest](https://github.com/hernansgarro/vidAI/blob/66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed/docs/experiments/performance-stage-3-v9/manifest.json.gz), [checkpoint](https://github.com/hernansgarro/vidAI/blob/66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed/docs/experiments/performance-stage-3-v9/checkpoint.json.gz), [counter regression](https://github.com/hernansgarro/vidAI/blob/66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed/docs/experiments/performance-stage-3-v9/counter-check-research.json.gz), [example original](https://github.com/hernansgarro/vidAI/blob/66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed/docs/experiments/performance-stage-3-v9/P01-original.json.gz), [validated receipt](https://github.com/hernansgarro/vidAI/blob/66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed/docs/experiments/performance-stage-3-v9/P01-validated.json.gz), [independent trace](https://github.com/hernansgarro/vidAI/blob/66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed/docs/experiments/performance-stage-3-v9/C04-trace.json.gz). The recorded workflow YAML and README describe the finite experiment; re-execution requires new owner authorization and a new output namespace, never deletion of original data.

Research branch/draft92 remains UNMERGED; a separate documentation-only PR publishes verified conclusions to fork main. All original runtime/package/lock/inherited gates, testing, Pages, Wiki, schema, upstream code and VIDA3D remain untouched. Temporary experiment entrypoint is removed after this one execution, YAML retained outside.github. Shared #67 stays In progress until actual upstream acceptance. **STOP after this recovery; Stage4 implementation/optimization is not authorized.**
