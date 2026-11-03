# VIDA 2D performance audit — cumulative Stage 3 research

**Stage 3 status: ONGOING — additional investigation remains pending.**

Contributor/fork research only; updated2026-11-03. Stage3.1 is the preserved completed
pilot; Stage3.2 is a completed bounded graphics batch; it does not close Stage3. A finished batch or execution
budget does not close Stage3. Stop after each batch for Hernan's review; Stage3.3 and
Stage4 optimization implementation are not authorized automatically. Completion needs
all meaningful reasonably testable questions at justified stopping points, including
new questions, or Hernan's explicit closure decision.

Research remains on [fork draft PR66](https://github.com/hernansgarro/vidAI/pull/66),
`audit/performance-stage-3`, based on fork/main `11248f3431604a1b883a7a948a6e6baddc3fafdd`.
[Stage3.2 protocol](experiments/performance-stage-3-v2/protocol.md),
[batch evidence](experiments/performance-stage-3-v2/),
[Stage3.1 immutable evidence](experiments/performance-stage-3-v1/).
No main/testing merge, upstream submission, optimization, release or application deployment.

## Executive Performance Summary

Impact describes observed workload cost or explicitly suspected potential, **not
confidence or removable work**. Confidence describes supporting evidence. A high
observed essential cost is not a demonstrated optimization opportunity. No permanent
optimization or gameplay speedup has been demonstrated. Different machines/threads
and coarse categories must not be added into one total CPU budget.

Legend: 🔴 **CRITICAL** severe observed bottleneck; 🟠 **HIGH** substantial measured
cost or strong potential; 🟡 **MEDIUM** moderate/uncertain cost; 🟢 **LOW OBSERVED**
small in tested workloads; ⚪ **UNKNOWN** insufficient impact evidence. Text labels
remain meaningful without color. Ranks are the current investigation order, retain
stable S2 IDs and owner interest in S2-02; they are not implementation priorities.

| Rank / ID | Component / finding | Potential impact | Evidence confidence | Key measurement | Investigation status | Next question / action |
| --- | --- | --- | --- | --- | --- | --- |
| 1 / S2-11 | Caustic blur / deferred raster at composition | 🔴 CRITICAL observed on software CI | High matched-controls confidence; desktop unverified |3.34FPS/288.9ms baseline vs58.81FPS/5.4ms unblur; forced flush moves~287ms before copy | Confirmed bottleneck; blur cause clarified within tested scene | Desktop/active workloads, pixel/DPR/filter scaling and exact invalidation/static-scene reuse remain open |
| 1b / S2-11-B | Graphics backend and bare-copy interpretation | 🟢 LOW OBSERVED isolated copy; ⚪ UNKNOWN desktop scaling | High backend/source-copy evidence in this setup |SwiftShader/software2D; already-flushed copy+readback median~.10ms | Software backend confirmed; intrinsically~290ms pure-copy hypothesis refuted in scope | Fresh-context/readback policy and real hardware graphics; do not generalize component cost |
| 2 / S2-09 + S2-12 | Active Worker/UI contention, cloning and reporting cadence | 🟡 MEDIUM suspected end-to-end impact | Medium component evidence, low causal active-browser confidence | Warm clone .803/1.433ms at15/30 founders; cap~30frames/s, one ACK already | Partial; IPC/ACK/throughput untested | Measure actual MAX ticks/s, send/receive/ACK and render contention; do not confuse copy benchmark with IPC |
| 3 / S2-02 | Repeated invariant physical metadata | ⚪ UNKNOWN CPU impact | High repeat-count confidence, low benefit confidence |300/600 substep mass/inertia derivations/tick at15/30 founders | Dedicated future study REQUIRED; benefit unmeasured | Price each consumer, exact lookup vs recompute, memory/GC/invalidation/save continuation |
| 4 / S2-03 | Optical index/query/intersections | 🟠 HIGH observed coarse cost | Medium coarse attribution |34.0%/40.5% sampled vision+update shares,195/390rays/tick | Confirmed broad cost; exact breakdown partial | Separate index build, finite corridor, exact tests, sorting/allocation and independent density/eye scaling |
| 5 / S2-01 | Contact physics and articulated solve | 🟠 HIGH observed essential work | Medium measured attribution |27–38.8% coarse physics+contacts;15-founder contacts25.8–27.8% of classified samples | Confirmed cost; removable fraction unknown | Profile broad/narrowphase, iterations and existing scratch; no solver/physics change |
| 6 / S2-05 | Recurrent inference and learning | 🟠 HIGH observed essential work | Medium coarse attribution |18.8–26.9% neural+learning share at15/30 founders | Confirmed cost; detailed scaling unresolved | Distinguish inference/plasticity/allocation; existing neural cache already present |
| 7 / S2-12-M | Allocation, GC and retained memory | ⚪ UNKNOWN long-run impact | Low; pilot GC event telemetry invalid |10.8–139.6MB short diagnostic30 heap deltas; not retained heap | Untested retention; sampled GC includes harness | Allocation/lifetime/paused vs active traces, growing lineage and long-run stability |
| 8 / S2-03-R | Finite per-ray range proposal (IDEA-026) | ⚪ UNKNOWN hypothetical savings | High current-source confidence; no marginal-cost measurements |Finite inherited per-eye range already; five rays share it | Source clarified; new per-ray feature unapproved | Hypothetical cost study later; attenuation/distance/energy/save decisions first |
| 9 / S2-08 | Tubes/walls/crossing clones | 🟡 MEDIUM suspected scaling/spike cost | Medium query counts; low crossing evidence |1200 wall queries/tick in15-founder tube fixture; zero crossings | Partial; crossing/boundary load untested | Real crossing/boundary-heavy fixed states and clone spikes, not only open tubes |
| 10 / S2-07 | Eggs, offspring creation, lineage growth | ⚪ UNKNOWN burst impact | Low relevant-load confidence |No eggs/hatches in pilot windows | Not exercised; remains open | Bounded funded hatch/offspring/large-lineage scenario |
| 11 / S2-06 | Ecology passes and UI stats | 🟢 LOW OBSERVED in founder pilot | Medium within small tested scope |Ecology .8–3%; stats .009–.025ms component medians | Low observed; burst/scaling partial | Mineralization/expiry and independent food/age scaling; preserve phase order |
| 12 / S2-10 | Energy collector bookkeeping | 🟢 LOW OBSERVED in tested cases | Medium sampled/omission evidence |.11–.54% classified samples at15/30;1.17–1.64% event fixture; omission mixed signs | Dominant-cause hypothesis refuted within scope; scaling open | O(A*C) at larger independent activity/count; no wholesale accounting removal |
| 13 / S2-04 | Oral feeding broadphase | 🟢 LOW OBSERVED residual phase | High candidate counts; medium CPU specificity |.78%/.84% food candidates vs full scans at15/30 | Full-food-scan claim refuted in scope; exact contacts retained | Dense mouth/food and transient rebuild workload only if justified |
| 14 / S2-11-G | Native energy contour strokes | 🟢 LOW OBSERVED in sparse paused fixture | Medium matched stroke contrast |Stage3.1 median3.682 vs3.760FPS drawn/omitted (~2.1% descriptive) | Dominant-stroke explanation refuted in this scene | Dense articulated glowing bodies not tested; retain truthful observer visuals |
| 15 / S2-12-S | Paused redraw scheduling and React consumers | 🟠 HIGH observed repeated visual work on software CI | High unchanged-state/paint evidence; gain untested |23blurred caustic fills/frame atx0; no measured Worker traffic (15/14frames/ACKs) | Repeated costly render confirmed; redraw/cache benefit untested | Map exact camera/UI/presentation invalidations, active state and observer latency before any cadence/cache change |
| 16 / SCALE | Population/age/backend representativeness | ⚪ UNKNOWN beyond tested scenes | Low independent-scaling confidence |5/15/30 recipes co-vary eyes/parts/food; CI differs from desktop | Confounded scaling; long-run/desktop untested | Independent population/anatomy/food controls and bounded age series later |

All rows were reassessed for Stage3.2; unchanged rows preserve the Stage3.1 evidence
and its environment limits. Low-cost rows remain in this register; they were not
removed to inflate apparent optimization opportunities.

## Substage register and dated assessment changes

| Batch | Status and scope | Immutable evidence / decision |
| --- | --- | --- |
| Stage3.1 — original pilot,2026-11-02 | COMPLETED batch only:30Node trials +6paused Chromium windows | [v1](experiments/performance-stage-3-v1/), original final head9a040fc; report below preserved as historical pilot. Old references to 'complete' concern this batch. |
| Stage3.2 —2026-11-02; consolidated2026-11-03 | COMPLETED batch only:10timed windows,2diagnostic captures,60isolated copies plus executive/vision/cache source review | [v2 protocol](experiments/performance-stage-3-v2/protocol.md), initial metadata preflight1c4927a failed before measurements; repaired source7279fc8 and tested PR merge6971be7 passed; [report](experiments/performance-stage-3-v2/report.md) |
| Stage3.3 | PROPOSED ONLY; not executed | Select after Stage3.2 review; S2-02 must retain dedicated follow-up |

2026-11-02 interpretation update: replaced the old automatic jump from completed
pilot to Stage4 with recursive Stage3. Stage3.1 measurements/archives remain unchanged.
Current vision is finite and already genetically variable **per eye**; IDEA-026
concerns new independent per-ray choices. Range-dependent attenuation and distance
normalization are compatibility questions newly made explicit. Physical inventory
now includes contact rebuilds, pose-projection setup and COM; CPU/cache benefit
remains unknown. No old count is relabeled as timed optimization evidence.
2026-11-03 graphics update: matched controls identify **deferred caustic blur on
software graphics** as the dominant measured cause:3.34→58.81FPS with blur removed,
while forced readback moves~287ms off drawImage without raisingFPS. The raw copy-only
interpretation weakens; current-scene blur attribution strengthens. Software backend
is now identified. Paused redraw is elevated to HIGH observed work; no scheduling
optimization is implemented. Every other row is reassessed with unchanged prior
scope/uncertainty. [Completed Stage3.2 report](experiments/performance-stage-3-v2/report.md),
[raw evidence](experiments/performance-stage-3-v2/browser-original.json.gz),
[derived summary](experiments/performance-stage-3-v2/summary.json),
[proposed Stage3.3](experiments/performance-stage-3-v2/next-substage-proposal.md).
Experimental visual ablation is not a shipped speedup or active Worker gain.

## Current source reviews and pending research inventory

[Finite vision/source and IDEA-026 design questions](experiments/performance-stage-3-v2/vision-range-source.md).
[Invariant physical source inventory and mandatory future study](experiments/performance-stage-3-v2/physical-source.md).
The executive rows rank the full pending inventory: graphics/backend; actual Worker
throughput/communications; S2-02; optics; contacts; neural work; memory/GC; hypothetical
range; tubes; eggs/reproduction; ecology/UI stats; bookkeeping; mouth contacts;
contour load; refresh/React; independent population/long-run/desktop scaling. New
questions should be added rather than declaring the original queue exhausted.

---

# Preserved Stage 3.1 pilot report

The following report describes the first completed research batch. Its Stage4
candidate suggestions remain hypotheses, not authority to skip pending Stage3 work.
Its original text/evidence can also be read at immutable commit9a040fc.
The original historical Stage4 suggestions below are superseded by the ONGOING
research gate at the top; no additional batch or optimization starts automatically.

# VIDA 2D performance audit — Stage 3 bounded pilot

**Contributor research only; 2026-11-02. No optimization or production change.**

Target: `hernansgarro/vidAI:main` at `11248f3431604a1b883a7a948a6e6baddc3fafdd`.
Canonical reference: `041362eefa64971d9038f4ad7ec4fd59a747d3ec`.
Research: [fork PR #66](https://github.com/hernansgarro/vidAI/pull/66), intentionally unmerged;
[branch](https://github.com/hernansgarro/vidAI/tree/audit/performance-stage-3).
[Preregistration](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6587965264),
[retained protocol](experiments/performance-stage-3-v1/protocol.md),
[priority input](PERFORMANCE_AUDIT_PRIORITIES.md), [Stage 2](PERFORMANCE_AUDIT_STAGE_2.md).

## Conclusions supported by the completed pilot

The current founder kernel spends its largest coarse shares in vision/organism updates,
physics/contacts, and recurrent neural work. Energy observer bookkeeping is small in
these measured workloads. Its omission does not produce a consistent baseline speedup.
In the actual headless Chromium CI contrast, a much larger cost appears at the
world-surface `drawImage` composition boundary: approximately260 ms per frame and
98.77–99.17% of V8 sample time, with or without native glow strokes. This is a
confirmed render synchronization/composition hotspot **on that runner**, not proof
that the surface copy alone (rather than deferred raster/filters) costs that much,
or that Hernan's desktop has the same backend/bottleneck.

The pilot deliberately did not implement caches, culling, simpler glow, fewer rays,
changed frame cadence, lazy telemetry, changed physics or biological tuning.
Research-only code is outside the production import graph; diagnostic kernel copies
are disposable and never built into the app. The production bundle retains
`index-Cq_4ZBoJ.js` and `simulation.worker-BOfAki5g.js`.

## 1. Provenance, prior evidence, environment and actual protocol

Stage 1 **does exist** on the separate fork branch
`audit/performance-stage-1-2026-11-02`, including report commit `c8f9fc1` and browser
follow-up `dfb4eb2`. Its [report](https://github.com/hernansgarro/vidAI/blob/dfb4eb23b2c02d6f061ef061364316e73f9f825a/docs/experiments/performance-stage-1-2026-11-02-v1/report.md)
records six legacy-settings 120-tick windows, median 430 ms, the incompatible historical
profiler hash and component assertion failures, and subsequently verified browser
correctness CI. It does not measure causal glow cost. It is not in this target's
ancestry. No stopped historical profiler/component trial was repaired or rerun here.
Do not compare its paid-v2/open timings directly to this v3/closed pilot.

Node measurements ran on Ubuntu 24.04.3/KVM, AMD EPYC 9V74, nine exposed logical CPUs,
cgroup quota eight CPU equivalents, 8 GiB memory limit, Node 24.22.1/npm 11.9.0.
Power, temperature, actual host contention and physical GPU are unknown. This is
not Hernan's Windows machine. [Environment and timing receipts](experiments/performance-stage-3-v1/environment.json).
Browser CI uses a different GitHub runner; cross-machine percentages must not be
combined into a single CPU budget.

| Configuration | Fixture and controls | Repetitions |
| --- | --- | ---: |
| 1–6 | Current v3/capsule-v1/closed-v1/decay-v2 founder worlds, seed711, 5/15/30 organisms, 78/200/300 initial plants; baseline vs optional sampled diagnostic copy | 3 each |
| 7–9 | Seven independent copies of existing real energy-contact fixture plus one founder, 15 organisms; collector baseline vs diagnostics vs observer omitted, real feeding retained | 3 each |
| 10 | Matched 15-founder recipe with explicit connected local tube runs, accepted windows0/2/4; no forced crossing | 3 |
| 11–12 | Same actual Chromium app/checkpoint paused after real gain/loss; native contour strokes drawn vs omitted, same wrappers and retained presentation state | 3 each, completed |

Initial research effort and trial order prioritize activity bookkeeping. Repetition2
reverses Node order. Each Node trial restores its full checkpoint, warms120 ticks,
and measures600 more (10 simulated seconds). This fixed-tick window intentionally
replaces a 30-second wall window to retain exact comparable trajectories. Kernel
wall values below sum only tick calls. The broader process window also performs ten
complete snapshot/hash checks and budget checks; its CPU time is **not pure kernel
CPU time**. Thirty Node processes consumed82.059 seconds including startup. All
fixed-checkpoint comparisons passed; no trial was replaced. The registered ceiling
remains36 slots/30 cumulative experimental minutes, excluding regression checks.

The contact fixture's world PRNG is711; seed12 is used by the existing prey reset
and extra-founder recipe. Preregistration's shorthand "seed12" was incomplete:
the exact archived checkpoint/hash is authoritative. Genotypes are existing test
fixture genotypes, not retuned production founders. Initial finite energy is fully
accounted when closed economy is enabled. There are no repeated top-ups/food moves.

**Protocol deviation / retained confound:** a build was started while the last
Node repetition was still finishing. It overlapped approximately the founders5
baseline/diagnostic portion; exact file/log timestamps are retained in environment
receipts. The 557.886-ms third founders5 baseline is retained, not dropped or
replaced. Smaller external tool/source reads also occurred during the campaign.
Treat timing variation and probe-overhead estimates as descriptive pilot results,
not confidence bounds or an isolated-host causal speedup. No fourth repetition ran.

Two additional evidence limits are explicit: full final snapshot files were not
written despite the protocol's initial/final-checkpoint intention; final/periodic
full-state hashes and inventories were preserved, along with all initial
checkpoints. No extra replay was run to reconstruct missing final files. Also,
periodic snapshots allocate memory between tick groups, so even summed tick-call
timing can inherit snapshot-induced GC/JIT effects. These are pilot capacity
observations under this harness, not ordinary gameplay throughput.

## 2. Instrumentation, overhead and validity

[prepare.mjs](../scripts/performance-stage3/prepare.mjs) copies current root modules
into ignored `.audit-stage3/`, verifies unique textual anchors, and adds coarse
phase switches plus aggregate counters. No original simulation file is edited.
[probe.mjs](../scripts/performance-stage3/probe.mjs) samples one tick in eight;
no timer is installed per ray, joint iteration or receipt. Counter increments
still have overhead; V8 sampling requests500 microseconds. Diagnostic modules
share their own consistent lineage/cache module instances.

Each baseline/diagnostic/no-observer comparison matches the complete serialized
snapshot hash after warmup, each measured second and at the final tick, including
PRNG, ray hits, neural inputs, learned weights, energy, eggs and lineage. All
three repetitions reproduce their full hashes. Exact raw checkpoints use lossless
Brotli to avoid multi-megabyte duplicate genome dumps; original profile/measurement
JSON is gzip-compressed. Save representation and production persistence are unchanged.
Stock discrepancy stays below7.4e-8 J across these cases.

| Fixture | Median baseline kernel ms /600 ticks | Median diagnostic ms | Apparent probe overhead |
| --- | ---: | ---: | ---: |
| 5 founders | 402.153 | 491.951 | +22.3% |
| 15 founders | 1571.405 | 1705.105 | +8.5% |
| 30 founders | 2753.295 | 3154.209 | +14.6% |
| Active contact fixture | 157.851 | 216.265 | +37.0% |

These medians include3 trials/mode; overhead also contains JIT/process/scheduling
variation, with the disclosed build overlap. Use baseline timings for throughput,
diagnostic phases/samples for approximate attribution. Do not scale all timings
by one overhead correction. Baseline receipt counts use a lightweight aggregate
callback wrapper; "baseline" means no coarse probes/sampler, not zero observation.

CPU samples include snapshot/hash/inspector overhead. The derived summary retains
these as `harness-other`; do not count them as gameplay. Kernel+observer-normalized
percentages exclude harness and unattributable GC and are explicitly conditional.
The coarse phase percentages are independent sampled wall shares, not OS thread
utilization. Nearest-ancestor categorization cannot precisely price every inline
calculation or compiler-inlined function.

Heap before/after is recorded, not an allocation rate or retained-memory proof.
Diagnostic founder30 heap deltas vary10.8–139.6 MB across short windows. The GC event
collector produced empty arrays even though V8 profiles contain GC samples. Its
zero event duration is **unavailable telemetry, not evidence of zero GC**. Profiled
GC represents roughly2–3% of the entire captured process interval in first trials,
including harness snapshots. No leak, live allocation rate, retained heap,
post-death cache lifetime or long-run GC diagnosis is established.

## 3. Quantitative kernel results

All per-tick values pool1800 correlated tick observations across3 independent
processes. Percentiles describe those workloads and are not independent-trial
confidence intervals. Throughput is600 divided by summed tick-call wall time;
it excludes snapshots, process startup, message scheduling, actual IPC, UI and
Canvas. MAX equivalents are capacity arithmetic, not achieved browser speed.

| Fixture | Initial C / parts / eyes / food | Final C / food | Tick median / p95 / p99 ms | Median ticks/s | Kernel equivalent |
| --- | --- | --- | --- | ---: | ---: |
| 5 founders | 5 /25 /13 /78 | 5 /77 | .623 /1.309 /2.541 | 1492 | 24.87x |
| 15 founders | 15 /75 /39 /200 | 15 /196 | 2.395 /4.308 /10.592 | 382 | 6.36x |
| 30 founders | 30 /150 /78 /300 | 30 /288 | 4.196 /7.048 /9.334 | 218 | 3.63x |
| Active contact fixture | 15 /17 /2 /7 | 8 /0 | .200 /.615 /1.130 | 3801 | 63.35x |

The active fixture has far fewer articulated parts and eyes, and seven prey die
through normal predation. It is a controlled **event-accounting assay**, not an
otherwise equivalent 15-founder performance workload. Organism counts alone do
not establish comparable cost. Founder count, parts, eyes and food co-vary in
these recipes, so this is not a factorial estimate of each variable's marginal cost. No eggs hatch in these short trials.

Median coarse diagnostic phase shares (% of sampled kernel phase time):

| Phase | 5 founders | 15 founders | 30 founders | Active contact fixture |
| --- | ---: | ---: | ---: | ---: |
| Vision plus organism update/index setup | 30.8 | 34.0 | 40.5 | 14.6 |
| Recurrent neural evaluation plus learning | 19.4 | 18.8 | 26.9 | 32.4 |
| Articulated physics plus contacts | 33.2 | 38.8 | 27.0 | 31.8 |
| Metabolism, feeding and reproduction checks | 9.7 | 5.4 | 5.4 | 19.2 |
| Ecology | 3.0 | 1.8 | .8 | 2.6 |
| Incubation/hatching | .2 | .1 | .1 | .4 |

Column medians need not sum100. Vision includes bookkeeping/index work, not only
ray intersection arithmetic. Neural includes real paid learning, never disabled.
Sample ancestry separates contacts from other physics: for15 founders, contacts
are25.8–27.8% and articulated joint/drag physics10.5–12.0% of **classified kernel+
observer samples**. At30 founders these are13.4–15.0% and10.2–11.3%. Contact density
matters: the sampled15-founder case uses all eight contact iterations in each of
four substeps, while the30-founder case often exits earlier. More organisms do
not imply a linearly larger contact fraction.

### Energy receipts and maintenance (S2-10)

The measured600 ticks in the active fixture emit798 positive absorption receipts
and602 loss receipts (36860.337 J absorbed,36082.099 J extracted from prey).
Observer omission preserves every complete state hash and actual feeding result.
Baseline kernel windows are161.999/156.495/157.851 ms; observer-omitted windows
169.792/147.020/159.318 ms. Paired changes have mixed signs; median omission is
159.318 ms vs157.851 ms baseline. There is **no consistent speedup** here.

Energy-observer code accounts for approximately1.17–1.64% of classified kernel+
observer CPU samples in this event-rich assay, and .11–.54% in the15/30-founder
cases. Sampling error and instrumentation matter at this size. Receipt callbacks,
collector advancement and frame generation are all observer work; real contact,
assimilation, ledger and feeding-history operations remain in both controls.
The no-observer direct-step variant also omits host event-Set/step bookkeeping,
so it is not a nanosecond isolation of the callback alone. No exact percentage
of "all energy detection" versus Canvas may be inferred by adding results from
different machines or threads.

Late-trial component measurements of collector advancement/frame/presentation
are tiny, but the active assay has no remaining food/prey at that point; they
**do not price its earlier peak activity**. The whole-loop samples above are the
relevant bookkeeping evidence. The O(A*C) lookup concern is not a demonstrated
major bottleneck at these populations; it remains a scaling hypothesis.

### Optics and physical feeding indexes (S2-03/04)

The75 sampled ticks at15 founders cast14625 rays:195/tick =39 eyes *5 rays.
Their optical broadphase delivers221566 candidates vs3988920 full-scene entries
(5.55%). At30 founders:29250 rays,587688 vs12933960 entries (4.54%).
This counts ordered broadphase candidates, not successful hits or an equivalent
speedup. Ray corridor query CPU appears among top self functions; optics is a
credible current optimization front, but reducing ray count would change sensory
and brain semantics and belongs to separate IDEA-025.

The15-founder oral food grid yields1741 candidate foods vs222465 possible full
food scans (0.78%). At30 founders:5509 vs657384 (0.84%). Existing spatial filtering
is effective at rejecting distant food. The claim "every mouth checks every food"
is refuted for these measured cases. Neither candidate counts nor this low feeding
phase share justify replacing exact physical intake or promising further gain.

### Physical derivations, ecology and local tubes (S2-02/06/08)

The15-founder case records22500 mass/inertia derivations across75 sampled ticks,
300/tick =75 parts *4 substeps;30 founders records45000,600/tick. Dimensions,
dimN/dimM, density and a genome/context identity determine these derived properties;
angle-dependent corners, velocities, contact bounds and motor settings are dynamic.
Contact and articulated-physics inertia expressions also use different floating-point
operation orders (`12 / (mass * sum)` versus the inverse of `(1/12) * mass * sum`).
A shared cache must preserve each consumer's original arithmetic, not normalize
these algebraically equivalent expressions. No standalone mass-derivation duration,
cache hit trial or WeakMap benefit is
measured. No cache, sweeper, invalidation scheme or scratch optimization was added.

Ecology currently performs distinct population/plant-count/cycle/motion passes.
The coarse ecology share is .8–3.0% in these founder cases; sampling independently
attributes the nutrient-cycle function below~2%. A counter named
`food-scan-multiplier` records food inventory per organism, **not actual total
traversal counts**; do not use it as a measurement of all ecology passes. Safe
sharing across deletion/spawn/mineralization phase boundaries is untested.

The connected15-founder case issues90000 sampled tube-wall queries (1200/tick),
with zero measured crossings. It has equivalent contact/vision counters and food
counts to the no-tube15-founder recipe. Diagnostic kernel totals are1673.688,
1770.675,1784.636 ms vs1983.210,1705.105,1602.228 ms without tubes. Variation and
order overlap any stable net difference. Ecology share rises to5.1%, but no
forced wall-contact/crossing spike was exercised. Existing tubeGeometry cache is
retained. No crossing-clone cost or strong tube speedup conclusion is established.

### Host frame, clone, replica and telemetry components (S2-09/12)

These are200 separate component calls/trial after kernel measurement,600 calls
per mode pooled. Frames use a warm genome/lineage transport after their first
full frame. No UI inspector is selected. Approximate JSON character count is
not actual structured-clone bytes or network payload size.

| Baseline fixture | host.frame median ms | structuredClone median ms | replica.apply median ms | world stats median ms |
| --- | ---: | ---: | ---: | ---: |
| 5 founders | .015 | .340 | .011 | .009 |
| 15 founders | .026 | .803 | .020 | .016 |
| 30 founders | .044 | 1.433 | .036 | .025 |

Cloning is much more expensive than frame wrapper construction in these components.
At30 wall frames/s,1.433 ms/clone corresponds arithmetically to~43 ms/s of CPU-call
wall time (~4.3% of one second), not a measured Worker IPC tax or total speedup.
Production postMessage serialization, receiver deserialization, ACK delay and
queue/application pressure need a real active-Worker transport trace. The kernel
never emits frames once per tick merely because requested speed increases: the
existing30/s cap and one outstanding ACK remain. This pilot implements no demand
protocol or reduced reporting cadence.

Consumers traced in App include always-visible population/time/speed statistics,
selected organism/egg details, inspector neural state, lineage and energy/scenario
panels. Current selected-only neural payload pruning is retained. No field is
proven unused by all consumers. Panel-open/closed demand contrasts, React commit
cost, paused versus active telemetry and active Worker CPU utilization remain gaps.

## 4. Browser glow contrast — completed, dominant render boundary found

Exact research commit `23f225be2900028d6700a4129ac2519affc281aa`,
[successful run41522795671](https://github.com/hernansgarro/vidAI/actions/runs/41522795671),
Chromium job125542801803. Chromium145.0.7632.6, visible headless page, viewport
1280x850, actual canvas1280x674, DPR1, four exposed logical CPUs. GPU/graphics
backend and true GPU utilization were not captured. App camera starts at source
zoom.85/center1200,750; no camera interaction occurred between contrasts, but a
separate transform trace was not captured. These values must not be equated to
Hernan's desktop hardware.

The imported real-contact fixture was paused at3.033333 simulated seconds, with
15 living organisms,17 parts, zero remaining plants,28 caustics and active real
predation glow. Every window passes full authoritative snapshot equality against
that same held state. One real Worker is confirmed; cumulative frame/ACK counts
stay27/26 throughout paused measurement, so **there is no ongoing frame traffic
or simulation-tick load explaining these slow paint frames**. Worker CPU itself
was not profiled.

The test retains collector/presentation state, body paths and every other visual
effect, omitting only native strokes with the exact two energy colors. Both
variants retain style checks, path setup, intensity calculations and wrappers.
There are70 attempted energy strokes/frame; the omit variant executes none of
those native strokes. Timers sample native calls every16th frame. AB/BA/AB runs
complete with no retries and all original series/profiles recovered from CI logs.
The emitted compressed archive decoded successfully; it was not regenerated.

| Metric | Glow drawn | Native glow strokes omitted |
| --- | ---: | ---: |
| Individual observed window FPS |3.728 /3.682 /3.672 |3.760 /3.748 /3.811 |
| Median window FPS |3.682 |3.760 |
| Callback-frame median /p95 /p99 ms, pooled |261.4 /306.2 /314.3 |257.7 /296.4 /309.3 |
| Median frame interval ms |266.7 |266.6 |
| Total recorded frames |347 |354 |
| CDP main-task-time fraction |~99.98% |~99.98% |
| V8 self-sample time inside native drawImage |98.77–99.17% across all6 windows |same dominant boundary |

These are distributions of347/354 correlated frames, not independent trial
confidence bounds. Removing strokes produces a small observed FPS change (~2.1%
comparing medians), and pooled callback median falls~1.4%. This does **not** establish
a repeatable desktop gain or that all glow rendering costs only1.4%: common path,
style/intensity work remains, timing varies and an unwrapped browser baseline was
not collected. Large/dense articulated glowing bodies were not tested. A dominant
native-contour explanation is refuted **for this paused small-part fixture**.

The sampled `surfaceComposite` drawImage calls block on average~256–274 ms/call
(7–8 sampled calls/window). V8 independently attributes nearly all sample time to
native drawImage. At that boundary the app draws the entire reusable world canvas
to the visible canvas in `WorldSceneLayer.finish`. Energy stroke and caustic-fill
submission calls themselves are tiny at this timer resolution, but Canvas can
**defer rasterization** until drawImage; their submission timers cannot prove their
raster work is cheap. The hotspot is confirmed at the flush/composition boundary,
not resolved to a copy implementation, caustic blur, mask, GPU readback, driver,
software renderer or another underlying raster operation. No layer ablation or
production correction was performed.

This is a severe main-thread paint bottleneck even while authoritative simulation
is paused. It warrants the first S2-11 Stage4 diagnostic/optimization discussion,
while preserving the original research priority order. Investigate the full-surface
composition path, deferred filters, backend behavior and possible exact static-scene
reuse before assuming simple contour removal will solve the problem. A huge overall
speedup cannot be predicted from removing useful drawing wholesale.

Planned30-second observation timers were delayed by the blocked main thread:
CDP before/after windows are30.64–30.85 seconds; RAF record spans30.95–31.12 seconds
include instrumentation/control edges. Six windows plus approximately60 seconds
of settling, Node82.059 seconds and modest setup are below6 minutes of experimental
execution, comfortably below30 minutes. Existing browser regressions are separate
validation, not additional experimental configurations.

The contrast is **paused render-only**: it cannot measure active/MAX Worker/render
contention, changing camera/visibility, multiple active populations or lifetime
event-rate scaling. CDP task time and native wall blocking are not OS thread CPU
utilization or GPU raster time. Sampling/wrapping overhead was matched across
variants but not independently priced against a completely unwrapped browser.

[Original browser checkpoints, six series and profiles](experiments/performance-stage-3-v1/browser-original.json.gz),
[derived browser summary](experiments/performance-stage-3-v1/browser-summary.json).

## 5. Individual hypothesis assessment

"Confirmed" below means the stated measured cost/existing behavior is confirmed
for these fixtures, not that an optimization has proven a speedup.

| ID | Pilot classification | Evidence and decision limit |
| --- | --- | --- |
| S2-10 | Dominant bookkeeping explanation **refuted for measured cases**; lookup scaling plausible | Mixed-sign observer omission; ~.11–1.64% classified CPU samples. Does not establish callback-only exact cost or large populations. |
| S2-11 | **Confirmed composition/flush hotspot in CI; dominant native-glow explanation refuted for this fixture** |~260ms frame,98.77–99.17% samples at drawImage,3.68 vs3.76FPS with/without strokes. Actual raster root cause, desktop/backend and active/dense populations unconfirmed. |
| S2-02 | **Plausible, unconfirmed benefit** | Repeated derivations counted; invariant inputs identified. No measured standalone share or cache variant. |
| S2-03 | **Confirmed substantial coarse vision cost** | 34–40.5% in15/30-founder sampled phases; five rays/eye retained. Broadphase already reduces candidate count strongly. |
| S2-04 | All-mouth/all-food claim **refuted for measured cases**; incremental benefit unconfirmed | Existing grid returns <1% of full food scan possibilities; exact narrowphase remains. |
| S2-09 | **Confirmed component clone cost**, end-to-end evidence insufficient | .803/1.433 ms clone vs .026/.044 ms frame build at15/30; active production IPC/cadence/ACK not timed. |
| S2-12 | **Confirmed expensive repeated paused paint in this CI scene**; statistics-demand bottleneck unconfirmed | Paused world/traffic remains fixed while full canvas paints~3.7FPS at~260ms/frame; stats component .016/.025ms, no panel/React ablation. |
| S2-06 | **Measured low coarse share**; fusion benefit unconfirmed | .8–3.0% ecology in ordinary founder cases; no mineralization burst or complete scan attribution. |
| S2-08 | **Evidence insufficient for a bottleneck** | Matched tube case/query counts, zero crossings; timing contrast inconsistent. |
| S2-01 | **Confirmed substantial physics/contact cost** |27–38.8% coarse phase in15/30 founders, substantial contact iteration count. Solver/physical approximations excluded. |
| S2-05 | **Confirmed substantial recurrent neural/learning cost** |18.8–26.9% coarse phase at15/30; existing compiled cache retained, no network/ray/learning changes. |
| S2-07 | **Not loaded sufficiently** | Incubation/reproduction checks included; zero eggs/hatch events. No inference about hatch bursts. |

## 6. Stage 4 decision candidates and fidelity

Research priority remains S2-10/11 first despite their possible lower measured
bookkeeping burden. Do not silently rewrite Hernan's interests. Implementation
ranking can now discuss the substantial optics/contacts/neural budget.

| Candidate to evaluate, not implement | Expected fidelity and complexity | Quantitative benefit allowed by this pilot |
| --- | --- | --- |
| Ordered optics scratch/index reuse | Potential exact A; moderate/high complexity; preserve order/occlusion/PRNG/learned state | Largest measured coarse front34–40.5%; not all removable. No predicted actual gain. |
| Contact scratch/broadphase reuse beyond existing pools | Potential exact A; high replay risk; solver/equations unchanged | Substantial sampled contact budget; no tested replacement or gain. |
| Weak-key invariant mass/inertia metadata | Potential exact A with context/version invalidation; moderate complexity | Counted300/600 derivations per tick; standalone share/gain unknown. No TTL sweeper justified. |
| Clone/observer payload efficiency | Potential exact A if replica consistency retained; moderate/high complexity |1.433ms steady clone at30 founders; rough43ms/s at30frames/s is a component capacity bound only. |
| Keyed energy lookup or scratch reuse | Potential exact A; low/moderate complexity | Current sampled observer share small; likely lower kernel ceiling than optics/contacts here. No promised gain. |
| Full-surface composition / deferred raster / static-scene reuse | Exact A only where visible output truly stays identical; B for reduced effect quality/cadence, moderate/high backend complexity | Dominant CI call boundary; investigate underlying raster/flush first. No actual optimization gain established. |
| Simpler contour glow / visual culling | Observer B, or exact visible output A where fully offscreen; requires visual decision | Small~2.1% observed median FPS difference in this fixture; no reliable desktop gain or full-glow bound. |
| Lazy statistics / shared ecology counts | A only with identical ordering/consumers; B if refresh semantics change | Small measured components/coarse ecology; no end-to-end speedup established. |
| Inherited fewer rays (IDEA-025) | Separate sensory/genetic C, observable biology/save/brain change | Not an exact performance optimization; not authorized or tested here. |

No positive optimization-speedup forecast is justified yet. Amdahl ceilings based
on entire coarse phases would describe removing useful simulation, not a feasible
optimization. Any exact candidate still needs bitwise full-state/PRNG continuation
across all historical regimes; equal formulas can change floating-point order.
Visual simplification/cadence/culling must preserve truthful energy activity,
phase/pause, layering and selection, with explicit user visual acceptance.

## 7. Validation, reproducibility and remaining evidence

Local npm ci passed,385/385 fast tests passed, build/typecheck passed, and the real
production Worker harness passed all inherited cases. No browser binary was
installed locally. CI source and all workflow/gate files are unchanged. Exact-head
Worker CI passed at [run41522795671](https://github.com/hernansgarro/vidAI/actions/runs/41522795671).
All mandatory CI gates passed: Chromium32 (31 inherited +1 research), Firefox36
inherited with1 intentionally skipped Chromium-only research case, side-windows5,
toolbar16, production Worker and mandatory browser-smoke aggregate. No inherited
case was skipped or weakened. Fast/build CI
[41522795744](https://github.com/hernansgarro/vidAI/actions/runs/41522795744) passed;
Pages assembly/deploy were explicitly skipped.

After this one campaign, the research test is moved to optional
`e2e/performance-stage3.spec.ts`; the original energy-activity regression file is
restored byte-for-byte. The helper/fixture is unchanged. This keeps future prose
updates from rerunning a spent experiment through the standard shard. No workflow
or gate was changed. Final root/runtime/CI source is identical to both base and
verified research runtime; [source readback](experiments/performance-stage-3-v1/source-equivalence.json).
Final local build/typecheck also passed with identical production asset names.

Production `main`/`testing`, release labels, Pages/Wiki publication and upstream
source are not modified. Fork PR66 remains draft/unmerged. This does not close or
change upstream performance budget #67 or any unrelated owner-stopped experiment.

Reproduce in a **new empty output directory** after preregistering any new execution:

```sh
npm ci
node scripts/performance-stage3/prepare.mjs
node scripts/performance-stage3/run.mjs
node scripts/performance-stage3/summarize.mjs
```

The runner uses exclusive-create output to prevent replacing original trials.
Running against the existing evidence fails before trials. To conduct a new
approved campaign, explicitly change its output path/version; never delete this
record to enable an unregistered rerun. Source anchors intentionally fail if code
changes. Browser reproduction uses `npx playwright test e2e/performance-stage3.spec.ts
--workers=1` after build, with already available compatible Chromium and a new
registered budget. The tested research commit's temporary import is preserved in
history; no repeat is part of this delivery. Browser summary regeneration is an
analysis-only command: `node scripts/performance-stage3/summarize-browser.mjs`.

[Raw data/profiles/checkpoints/logs](experiments/performance-stage-3-v1/),
[derived machine-readable summary](experiments/performance-stage-3-v1/summary.json),
[runner](../scripts/performance-stage3/run.mjs),
[analysis](../scripts/performance-stage3/summarize.mjs).
No historical references or failed trial records were overwritten.

**Remaining evidence before broad conclusions:** resolve whether the measured
drawImage block is copying, deferred caustic/filter raster or backend synchronization;
representative desktop browser
active/MAX and fallback CPU traces; real Worker serialization/receive/ACK and
selected payloads; unwrapped browser baseline/probe overhead; no-glow and effect
ablation at multiple actual active populations; cache cold/warm/lifetime memory;
standalone invariant derivation cost; true GC/allocation/retention; egg hatch and
carrion-mineralization bursts; boundary-heavy tube contacts and real crossings;
longer stability. Additional configurations need a separately registered bounded
extension; do not run them automatically. This pilot may support a first Stage 4
choice while explicitly leaving these hypotheses incomplete.
