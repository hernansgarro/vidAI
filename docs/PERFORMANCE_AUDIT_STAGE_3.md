# VIDA 2D — Cumulative Stage 3 performance evidence (fork main)

> **Fork-main research knowledge ledger — consolidated 2026-11-04 through Stage 3.10.** Current conclusions belong here; executable probes/raw traces remain on immutable research branches. Stage3 is ONGOING. No optimization or Stage4 implementation is approved. The historical dated sections below retain their original decisions/failures.

## Current synthesis and delivery boundary — 2026-11-04

This update incorporates the previously missing3.8/3.9/3.10 conclusions into main at Hernan's explicit request. It does not merge research drafts98/99/100 or change production behavior. This is the current entry point; older “latest” and STOP language is dated history, not an instruction to repeat or disregard a subsequently authorized lot.

| Evidence front | Current supported conclusion | Limits / next question |
| --- | --- | --- |
|Large active ecosystem load |25/50/100/150 combined population+food+habitat scaling substantially reduces throughput.150body has690parts, below the1000part ambition. |No asymptotic class, independent population coefficient or universal saturation threshold. |
|Initially separated optical crowding |At100bodies, dense cost+20.60%; visual candidates2.13x, body-edge tests4.54x. |One phase pair; render contention and real trajectories differ. Earlier overlapping+62.20% is a separate stress case, not the same density effect. |
|150body capacity and finite pacing |3.10 MAX53.46–54.15TPS; requested1x53.16,2x55.13TPS. |Six simulated seconds, n2MAX/n1pacing, CI hardware. No claim of sustained desktop performance or that higher requested speed inherently slows simulation. |
|Essential Worker work |3.10 instrumented vision+sight6.238ms/32.60%,physics5.413/28.29%,inference4.512/23.58%. |Elapsed exclusive kernel phases, including probe/JIT/preemption/GC effects, not removable per-phase CPU. |
|GC/transient allocation |3.10 marked Worker GC-related union35.50% and inter-GC allocation proxy281.58MB/s under detailed trace. |Trace adds59.92% elapsed cost. Ordinary untraced GC cost/allocation ownership/leaks are unresolved; calibrate observer cost before ranking savings. |
|Probe and evidence overhead |HooksOFF+3.34%,counter+10.08%,phase+11.62%,trace+59.92% elapsed contrasts in3.10. Large exact exports take6–7.5s outside useful intervals. |n1diagnostics/fixedorder; no exact causal subtraction. Evidence volume/processing time is not live simulator memory or tick cost. |

These observations refine stable S2-01/02/03/05/09/10/12 questions; they do not erase historical feeding/ecology/tube/egg gaps or turn hypothetical exact caches/scratch buffers into tested optimizations. Per-eye sampling/energy/genetic proposals remain separate [exploratory designs](VISION_PERFORMANCE_DESIGN_NOTES.md).

### Stage 3.10 — COMPLETE, eight retained windows

[Detailed report](https://github.com/hernansgarro/vidAI/blob/afce7aa548c165f9548e0df6fdc876752b412d72/docs/experiments/performance-stage-3-v12-execution/report.md), [raw originals](https://github.com/hernansgarro/vidAI/tree/a21a042c9b259f708f59fcde38f154e0d09489a3/docs/experiments/performance-stage-3-v12-execution), [draft100](https://github.com/hernansgarro/vidAI/pull/100), [preregistration](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6629413476). Source6835f03ee42134bd00dd09c8321334bfab201aa0; originalsa21a042c9b259f708f59fcde38f154e0d09489a3; verified reportafce7aa548c165f9548e0df6fdc876752b412d72.

Fixed order L01/O01/S01/L02/C01/T01/D01/S02; every window360fixedticks,60same-mode warmup then exact reset. One unchanged150spread world:150living/690parts/540joints/330eyes/1650rays/3600hidden/600initialfood,4000x3000/seed73, five current genotypes equally represented, normal learning/funded ecology, causticsOFF/no selection/tracking/inspector. Final150living/569food, no deaths/newoffspring/eggs/guards. Four24tick mode pilots and two4+3counter checks pass.

| Condition | n | Actual TPS | ms/tick | Observed elapsed contrast vs lean median |
| --- | ---: | ---: | ---: | ---: |
|Lean MAX L01/L02 |2 |53.465–54.153; median53.809 |18.466–18.704; median18.585 |Reference;1.288%repeatspan |
|HooksOFF O01 |1 |52.070 |19.205 |+3.34% |
|Counter C01 |1 |48.879 |20.459 |+10.08% |
|Phase D01 |1 |48.206 |20.744 |+11.62% |
|Detailed trace T01 |1 |33.647 |29.721 |+59.92% |
|Requested1x S01 |1 |53.156 |18.813 |Effective0.88594x |
|Requested2x S02 |1 |55.132 |18.138 |Effective0.91886x;45.94%of requested120TPS |

The2x window is only3.72% faster than1x. All complete endpoint/settings/PRNG/neural/learning/physical/energy snapshots match each other and archived3.9 exactly (full SHA256c9189ebe919fc196e899b15780803ae85387602f54f56ea551a395b49a31bf7b). Max energy closure error3.8511e-7J. Transient observer frames legitimately differ; inherited wall-AABB limitations remain disclosed.

D01 has360exclusive phase rows with ledger closure0 and23sampled counter ticks. Vision+sight32.60%,physics28.29%,inference23.58%,learning7.01%,feeding/index3.02% of19.137ms mean kernel tick.1650rays/22604.78candidates/16416.70edge tests per sampled tick;600body/2760part/2160joint advances. Frame-build median0.40ms/postMessage call3.10ms are synchronous components, not end-to-end IPC; no cadence ablation. Non-traced reports14.46–15.74/s, canvas38.17–41.95FPS, approximate frameJSON947.7KB, not wire bytes.

T01 retains46,756events/12.20MB/noDataLoss. Worker/main Linux PID/TID start identities verified. Worker GC-related wall union3.798s/35.50% of10.6994s traced window;95Minor/3Major events; inter-GC proxy281.58MB/s from2.957GB over10.503s. Main separately25.51%/41.20MB/s. **Do not apply these traced fractions to untraced gameplay, add threads/GC to exclusive phase costs, infer leaks or source-stack ownership, or promise equivalent savings.** The trace's~60% perturbation is the main unresolved attribution caveat.

ScientificCI41821659990/job126546033488 and finalCI41824370165/job126555224099 succeeded;385fast/build/actualWorker and8focusedChromium windows pass. All47originals/14references and276inheritedbasefiles verified against Git, exact lossless JSON reconstruction; clean checkout reproduces findings/verification. Active148.961/180s; inclusive runner623.218/720s, full invocation627s; last slot admitted565.657<600s with120sreserve. Normal output+controls+inputs49,625,831<192MiB, emergency38,264<2MiB, trace12,200,561<16MiB. All8retained, no failure/retry/missing trial. Temporary launch workflow removed; draft remains unmerged.

### Stage 3.9 — PARTIAL, valid crowding evidence, runner budget FAILED

[Report](https://github.com/hernansgarro/vidAI/blob/4eb25207c90e85d738d2d736fa142034d5e81a80/docs/experiments/performance-stage-3-v11-execution/report.md), [immutable matrix originals](https://github.com/hernansgarro/vidAI/tree/f76bb95a764eaf872cbdb63ecef1f889198ccdb2/docs/experiments/performance-stage-3-v11-execution), [draft99](https://github.com/hernansgarro/vidAI/pull/99). Source4bc35f0198d6997fed06d543d973589d0df87490; preflightoriginals0445603d2d0c348ec602be52284385af8b416452; finalreport4eb25207c90e85d738d2d736fa142034d5e81a80. Initial storage-only preflight attempted ZERO scientific windows; permitted lossless codec repair reused the same pilots without simulation and charged original setup against unchanged limits.

10attempted/10retained/8unstarted,360ticks each. Lean n2per100spread/100dense/150spread: medians11.782/14.209/18.527ms per tick and84.88/70.39/54.09TPS; ranges84.23–85.53/69.35–71.43/51.61–56.57.100→150 co-scales population/food/area1.5x and cost1.572x, with9.61%repeatspan at150; no superlinear-law proof. New dense100 translates whole bodies to fixed140px grid, ZERO initial external intersections/minimumAABBgap30.842px. Same genes/food/PRNG/settings/energy; dense cost+20.60%, visual candidates2.13x and edge checks4.54x. Phase vision+sight3.868→7.516ms, physics3.466→3.842, inference2.865→2.769; n1each100phase. Later contacts/render/learning legitimately diverge; this is no guaranteed optimization saving.

All retained endpoints exactlymatch within eachfixture group, energyerror<3.86e-7J, no deaths/newoffspring/eggs/guards.54matrixoriginal files and23preflightoriginals match immutable Git. Source/runtime and all3Worker binaries matched original preflight; no dummy or simulation rule change. Codec2 losslessly interns genomes/edge labels/columns/IEEE754 arrays;49.94MB combined retained raw/control versus277.60MB expanded current receipts, not a live memory reduction.

Scientificrun41778306250 FAILED beforeD05: combined runner739.927>720s, active147.117<360s. Last useful window ended715.943s; export/validation/archive caused19.927s overrun. All useful spans before deadline do NOT waive the global failure. Analyzer intentionally exits1 for budgetsOK=false. Missing D05/D06,O01/O02,T01/T02,S01/S02 are not zeros or later replaced by3.10. Budget/protocol failure stays explicit. Temporary workflow removed, draft99 unmerged.

### Stage 3.8 — PARTIAL, storage stop and missing original

[Report](https://github.com/hernansgarro/vidAI/blob/e5101841d57cdb0e035c310b5551609b536038ff/docs/experiments/performance-stage-3-v10/report.md), [immutable originals](https://github.com/hernansgarro/vidAI/tree/9c00d5497db3b351ada3230a4c2b835c79d0abcc/docs/experiments/performance-stage-3-v10), [draft98](https://github.com/hernansgarro/vidAI/pull/98). Sourcef2e5e936f63eb0ca2f366a997abcacbd38460208; finalreporte5101841d57cdb0e035c310b5551609b536038ff.

Six120tick primary windows retained:25spread361.77TPS(n1),50spread202.29(n1),100spread110.55(n1),150spread67.49–70.55(n2),100compact68.15(n1). Loads115/230/460/690parts; food100/200/400/600 and habitat co-scale. No pure population coefficient, asymptotic class or universal saturation claim. Compact100 starts68external intersecting part pairs and ends8guards, costs62.20% more than spread; initial overlap/contact/optics/render/trajectory changes confound that contrast. It is not equivalent to3.9's initially separated density case.24tick100phase pilot only; all timed phase/GC/overhead cells unstarted. CPU brackets include large full exports, so CPU-ms/tick are contaminated and not ranked.

P07 ran but full original hit192MiB archive guard; emergency full-payload retry hit the same guard. **P07 has no usable rate or retained endpoint, and remains missing.**11slots unstarted; no rerun. Scientificrun41770391294 FAILED on storage refusal. Retained191,912,261bytes/active59.525s/runner267.048s stay within retained caps, but the refused next write and preservation weakness stopped the lot.39originalfiles match immutable Git; all276basefiles unchanged. Original failure is not repaired by later codec/workflows; draft98 stays unmerged.

### Current authorized next action and documentation maintenance

Hernan's2026-11-04 follow-up authorizes a worthwhile NEW bounded lot after goals/metrics/preregistration. Selected3.11 question: does GC remain material under lightweight outer-GC tracing, with quantified overhead versus both no trace and detailed trace? Six150body360tick windows/two per condition are to be registered before execution. No Stage4/product change or old-trial rerun. Findings from that lot must also be integrated into this main ledger and the current plan/priorities/handoff; raw evidence and launch tools stay on research branches. Documentation integration is not upstream acceptance; shared#67 remains In progress.

---

# Preserved Stage 3.1–3.7b findings and dated decisions

> **Fork-main research knowledge ledger — consolidated 2026-11-03.** The complete verified *findings*, historical status, negative results, uncertainty and scientific source links from Stage 3.1–3.6 are retained below. This file is documentation, **not** merged research code or a claim that an optimization has shipped. Stage 3 is ongoing; Stage 4 synthesis/optimization remains unapproved.

## Stage 3.7b update — 2026-11-03: authorized recovery COMPLETE

**The bounded Stage 3.7b lot completed all 12 registered windows once. Stage 3 remains ONGOING; STOP after this lot. Stage 4 implementation is not authorized.** This update supersedes the previous pending-throughput status while preserving original Stage 3.7's failed/missing P01 below. New recovery observations do not retroactively repair or replace that failure.

[Detailed report](https://github.com/hernansgarro/vidAI/blob/8481613ce08be6137d347cf0d8b9eabb0aed8130/docs/experiments/performance-stage-3-v9/report.md), [immutable original evidence](https://github.com/hernansgarro/vidAI/tree/66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed/docs/experiments/performance-stage-3-v9), [research DRAFT #92](https://github.com/hernansgarro/vidAI/pull/92), [preregistration](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6616234234). Measured source `57a7d45f3edf812b6b147ef67a2d80445e95d778`; base fork main `a430f3b51ffd00f4327e692d1b8a417f10a98831`; original evidence `66a89ed39b7d277b22cc64b9c77bd0bb1d3193ed`; verified analysis/report `8481613ce08be6137d347cf0d8b9eabb0aed8130`. All probes, raw archives and checkpoints remain isolated and UNMERGED. Production behavior is unchanged.

### Whole-Worker counterfactual effects

Four unchanged real controls: median **223.94 ticks/s**, range **222.11–237.17**, a 6.78% spread relative to the minimum. Each dummy has ONE independent 12-second window; its reference is the average of its nearest real controls before/after it.

| Independent dummy | Actual ticks/s | Nearby real reference | Absolute change | Relative change | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- |
| Recorded vision A/B/C | 340.58 | 222.45 | +118.14 | +53.11% | Large observed contrast; stable gain and physically correct recoverable fraction remain unknown. |
| Recorded brain outputs | 265.89 | 222.45 | +43.44 | +19.53% | Large observed contrast; hidden-state freezing and altered learning/contact workload confound interpretation. |
| Learning OFF | 247.03 | 231.13 | +15.90 | +6.88% | Similar to real-control spread; reliable benefit UNKNOWN. Not permission to disable learning. |
| Funded synthetic feeding | 235.27 | 231.13 | +4.14 | +1.79% | Below control spread; reliable benefit UNKNOWN. Ecologically invalid diagnostic. |

These are actual measured **whole-system counterfactual effects**, not exclusive CPU shares, additive savings or production-safe optimizations. Dummy runs alter trajectories, acquired state, contacts, energy, food and population. Equal wall-time endpoints have different simulated horizons: the brain dummy ends with 29 living/158 parts while the vision dummy retains 30/162; real P05 also reaches one completed death. Feeding leaves 294 food versus roughly 280 in nearby real controls. All full endpoint states and changing counts are preserved. Do not generalize a single contrast or treat altered survival as an optimization.

### Direct exclusive costs and diagnostic limits

Separate C03 all-real phase window: 1,087 ticks, mean measured tick 4.3728 ms, SD 1.9850 ms, median 3.8 ms, p95 7.0 ms. Top-level ledger closes to measured tick span with an explicit unattributed category. Elapsed time includes probe/JIT/preemption/GC; it is not independently measured CPU per phase.

| Stable IDs / exclusive phase | ms/tick | Share of measured tick elapsed | Finding |
| --- | ---: | ---: | --- |
| S2-01/02 — physics and contacts | 1.9180 | 43.86% | Largest measured bucket. Essential articulated solve/contact work; avoidable fraction UNKNOWN. |
| S2-03 — vision plus sight construction | 1.3871 | 31.72% | Strong follow-up target for equivalent ordered-index/query/result/geometry work, preserving all sensing. |
| S2-05 — recurrent inference | 0.5919 | 13.54% | Real neural work; compiled topology and somatic buffers already exist. |
| S2-05 — motor plus sensory learning | 0.1993 | 4.56% | Preserve legitimate learning/debits; disabling it is a counterfactual only. |
| S2-04 — feeding plus oral indices | 0.1323 | 3.03% | Physical contact, intake order and feedback remain mandatory. |
| S2-06/07/10 — ecology, metabolism, reproduction and observer | Remaining smaller categories | See full ledger | Event-heavy/hatching scaling remains UNKNOWN. |

Sparse details sampled 17 ticks (ordinal 1 mod 64): observed per sampled tick 390 rays/queries, ~7,416 vision candidates, ~5,439 body-edge tests, 120 body advances, 32 contact passes, ~1,274 contact candidates/SAT tests, ~668 actual contacts, ~186 joint projections, 1,526 cardinal anchors and 972 corner calls. Detailed source spans/counters remain in the report. Physical metadata alone is a small sampled subset; no general mass-cache payoff is established. No independent density/anatomy scaling coefficient or allocation-stack ownership was measured.

**Probe uncertainty:** sampled tick mean 10.7706 ms versus 4.2711 ms without nested detail; workload/JIT positions also differ. Nested exclusive times are not added to parent phase totals. Separate five-second controls were ordinary 212.38, counter 219.62, phase 216.51 and traced 175.41 ticks/s. Positive counter/phase signs do not establish zero overhead; these are single ordered controls with noise and changing horizons. Traced C04 is 17.41% below ordinary C01, a combined guard/trace contrast. No correction is subtracted from primary TPS. Detailed phase costs describe the separate shorter diagnostic, not the entire 12-second primary horizon.

**Independent C04 CPU/GC:** explicit marks identify actual Worker/main PID/TID for that Worker lifetime only. Worker/main accumulated CPU 4.86/4.85 s over the surrounding OS bracket; browser group 293.51% of one logical core. Worker GC union 166.069 ms (~3.31% of window wall), union thread CPU 112.958 ms, 75 minor/6 major pauses. V8 inter-GC allocation proxy 477.52 MB/s (~2.72 MB per normalized completed tick). This confirms transient allocation pressure in a perturbed diagnostic, not a retained-heap leak, per-component allocation source, thermal effect or primary causal mediator. Primary Worker TIDs are not inferred from a later recreated Worker. Desktop/hardware-GPU applicability remains unknown.

### Correctness, conservation and evidence status

The independent cumulative tick wrapper passed both ordinary/research 7-tick regressions despite draining frame deltas 4 then 3. All ordinary/all-real off/counter/phase 24-tick complete snapshots, settings, PRNG, energy and learned state match exactly (full snapshot SHA256 `ee37b9a8d317e3f77a40f5e18851817d6eb4bbbd796b7b3175567059f04bf137`). Original 120-tick controls and failed observation remain immutable at 812f511. A/B/C recordings and the 30-organism checkpoint were reused by original hashes; no authoritative PRNG draws or coefficient/genome tuning. Physics replay remains deferred; position-only replay is inadequate for shared joints/contacts/work.

Synthetic feeding transferred **1,414.5 J** from positive universe reserve across 84,870 calls, capped at 1 J/organism/s and available source/storage; max transfer error 1.82e-12 J, final world error ~5.4e-8 J. No counterfeit physical-contact/intake cue, authentic feeding event, increased world budget or survival guarantee. All independent dummy modes validate but are biologically non-equivalent. Matched 24-tick divergence and equal-wall workload changes are recorded separately.

[Scientific run 41729322675](https://github.com/hernansgarro/vidAI/actions/runs/41729322675), job 126242231666, **SUCCESS**: npm ci, 385 fast tests, typecheck/build, actual production Worker, focused Chromium counter/pilot checks and all 12 windows. Charged active **201.978 s**, inclusive runner **357.601 s**, original archives **111,808,143 bytes**, within 360 s/600 s/128 MiB. No lost, repeated or replaced recovery window. All **43 original files / 41 gzip archives** independently verified by SHA256, length and fetched Git blob. Original window objects precede separate validated receipts; tick equations, settings/modes, source hashes and conservation pass. Analysis-only settings equality was corrected to ignore JSON key order while comparing the same keys/values; original data and measurements were unchanged. No new full/Firefox campaign; inherited gates remain intact.

Only verified conclusions/documentation are integrated into fork main. Research draft #92 stays unmerged; original drafts #66/#69/#80/#87/#90 and their evidence remain unchanged. The one-shot scientific workflow was removed; reference YAML stays outside .github. No production runtime/schema, testing, Pages, Wiki, upstream PR/code/merge or VIDA 3D changes. #67 remains In progress until upstream acceptance. **STOP after Stage 3.7b.** Further investigation or Stage 4 optimization requires explicit subsequent authorization.

## Stage 3.7 update — 2026-11-03: partial verified pilots; timed lot BLOCKED

**Stage 3 remains ONGOING. Stage 3.7's scientific objective is INCOMPLETE. STOP: no further campaign or Stage 4 is authorized.** This dated checkpoint supersedes the earlier design-only “not started” status below, without rewriting any historical Stage 3.1–3.6 evidence.

The first timed window failed because the research harness misread `SimulationHost.frame().steps` as a cumulative counter. It is a since-last-frame delta; `frame()` resets it and drains observer queues. P01's assertion reported 2 versus 1,885 logical ticks. Its complete raw boundary/endpoint/CPU objects were not saved before validation failed. **Zero valid primary throughput windows were retained; the other 11 slots never started.** No dummy TPS improvement, calibrated probe overhead or new CPU/GC finding can be claimed. The assertion and nominal duration cannot reconstruct TPS. No repeat/replacement/second campaign was run. This is a research harness failure, not evidence of a production simulation regression.

[Detailed report](https://github.com/hernansgarro/vidAI/blob/f846d67939e32d46a398768c082368dea2d553b7/docs/experiments/performance-stage-3-v8/report.md), [immutable original evidence and failure](https://github.com/hernansgarro/vidAI/tree/812f5113931e4cc6486dcc5b7559f0f85b212bdf/docs/experiments/performance-stage-3-v8), [fork DRAFT #90](https://github.com/hernansgarro/vidAI/pull/90), [preregistration](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6615597868), [stop receipt](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6615848902). Measured source `f0db3e47f3f3396492c1b6fa7ccb1fc2ee4602ee`, base fork main `73ee85bff65f219affde3117bd7e13d5a451f986`, original evidence `812f5113931e4cc6486dcc5b7559f0f85b212bdf`; analysis/compile-only repair `f846d67939e32d46a398768c082368dea2d553b7`. Research code/checkpoints/raw evidence remain isolated and UNMERGED.

### What the preserved evidence supports

Eight pre-registered fixed-120-tick controls completed and were archived before P01. The ordinary Worker and all-real research off/counter/phase variants have **identical complete snapshots, settings, PRNG, energy and learned state**. Full snapshot SHA256 `2a7753be8bff8fc68e6cda9c93fa07d09f0e7577bdd046d44f26e59c0b9c8da6`. Each independent vision, brain, learning-OFF and synthetic-feeding fixture passed state/persistence/energy validation. This is correctness/feasibility evidence, not biological equivalence or a sustained performance result.

| Stable IDs | Preserved observation | Classification / limitation |
| --- | --- | --- |
| S2-01/02 | Short cold all-real phase pilot: physics/contacts 3.7275 ms/tick (41.74% of instrumented tick elapsed time) | **PLAUSIBLE** sustained hotspot; local measured bucket **CONFIRMED**. Essential articulated solve/contacts remain; no removable/cache-saving budget. |
| S2-03 | Vision 2.5325 + sight-build 0.2633 = 2.7958 ms/tick; sampled 390 rays, ~7,645 candidates and ~5,531 body-edge tests/tick | **PLAUSIBLE** hotspot. Ordered query/allocation/geometry reuse deserves evidence; never skip rays/off-camera sensing or change RGB/occlusion. |
| S2-05 | Inference 1.3775 ms/tick; motor + sensory learning 0.3925 ms/tick | **PLAUSIBLE** hotspot. Existing compiled topology/delta buffers remain. No benefit from disabling legitimate recurrence/learning established. |
| S2-04 | Feeding + oral-index 0.2558 ms/tick; sampled 30 mouths/66 bounds queries | Local instrumented work **CONFIRMED**; sustained impact **UNKNOWN**. Synthetic intake is an artificial control, not an acceptable production shortcut. |
| S2-06/07/10 | Smaller environmental/metabolic/reproduction/observer buckets in two simulated seconds | Event-heavy scaling **UNKNOWN**; no hatch/birth-rich workload. Preserve funded ecology and truthful energy activity. |
| S2-12-M / S2-09/11/12 | Overhead and trace windows were not reached | New CPU/GC/allocation/transport effects **UNKNOWN**. Historical 3.6 evidence remains historical. |
| S2-08 | Disconnected topology | Tube/crossing cost **UNKNOWN**; no new tube study. |
| Measurement control | Cumulative interpretation of `frame().steps` | **REFUTED**. Independent counter/raw-failure preservation repaired and compile-checked only; not scientifically executed. |

**Measurement uncertainty:** only 120 short cold instrumented ticks, mean full tick 8.930 ms, SD 7.342 ms; no sustained control. Eight ticks with nested probes average 22.5625 ms versus 7.95625 ms for 112 ticks without nested detail; tick positions/cache/JIT also differ. Probe perturbation is substantial and uncalibrated. Nested exclusive spans must not be added to parent phases, and sampled means are not whole-run CPU shares. Top-level ledger has an explicit unattributed category and exact measured arithmetic closure. Source/code/binary hashes, sampled call counts and subphase timings remain in the detailed report; no independent scaling coefficient or per-allocation ownership was measured.

**Downstream divergence:** after 120 ticks, mean/max part-position differences from real are vision 1.6535/12.1312 px, brain 4.6131/27.1574 px, learning OFF 0.1427/4.0417 px, feeding 0.2169/4.5068 px. Learning OFF changes acquired state, energy debits and commands despite genuine inference/physics. A brain-output dummy freezes hidden state while real learning routines still run. Thus future measured dummy effects would mix removed work with altered trajectories/contact/workload; percentages cannot be equated to CPU shares or added.

**Owner's universe-funded feeding clarification verified:** 3,600 fixed-pilot calls transferred 60 J at <=1 J/organism/s from positive universe reserve, capped by available stock/storage. Closed world total error 1.4e-9 J; per-transfer error <=1.82e-12 J. No unaccounted energy, counterfeit physical contact/intake cues or genuine feeding receipts. Artificial and ecologically invalid; no guaranteed survival. No source budget/physics/PRNG/settings change. Keyed A/B/C values originate from three genuine per-organism frames; no authoritative PRNG calls. Physics replay deferred because positions alone omit shared joints/velocities/impulses/work/contact state.

**Verification/status:** original 15 gzip archives / 17 raw-ledger-summary files verified by SHA256, lengths and fetched Git blobs, without replay. All pilot conservation errors <=3.73e-9 J. Scientific run [41721182109](https://github.com/hernansgarro/vidAI/actions/runs/41721182109): npm ci, 385 fast tests, typecheck/build and actual production Worker gates passed; focused Chromium eight pilots passed; scientific P01 FAILED. Active 39.280 s / runner 145.350 s / 50,837,124 raw bytes, within bounds. Timed checks remain explicitly unmeasured, not vacuous passes. AMD EPYC 7763, four reported CPUs, Linux/Node24.22.1, Chromium145/Playwright1.58.2, SwiftShader; no cross-host speedup inference. No Firefox/full-suite expansion or new scientific execution.

Only this dated documentation update is integrated into fork main. The experimental branch/draft #90, old drafts #66/#69/#80/#87 and their original evidence remain unmerged. Temporary experiment workflow was removed, original YAML retained outside .github. Production runtime/save schemas/testing/Pages/Wiki/upstream/VIDA 3D are unchanged by this update. #67 remains verified native **In progress**, not Done. Any recovery needs **new explicit authorization and preregistration**, preserving P01's failed/missing observation. No permanent optimization or Stage 4 work follows.

## Where evidence and measurement tools belong

- **Fork `main`:** durable cumulative conclusions, hypothesis IDs, confidence and applicability, measured values, limits, decisions and links to immutable original evidence. This is the discoverable reference for future studies.
- **Dedicated research branches/draft PRs:** source-specific raw archives, fixtures/checkpoints, probes, profilers, tracing helpers, experimental workflows and one-shot reproducibility receipts. These remain isolated and **unmerged** unless a later separately reviewed decision explicitly selects safe documentation or tooling. Production Worker/runtime and testing branch are unchanged by this consolidation.
- **Immutable provenance:** [Stage 3.1–3.3b / PR66](https://github.com/hernansgarro/vidAI/pull/66), [Stage 3.4 / PR69](https://github.com/hernansgarro/vidAI/pull/69), [Stage 3.5 / PR80](https://github.com/hernansgarro/vidAI/pull/80), [Stage 3.6 / PR87](https://github.com/hernansgarro/vidAI/pull/87); [upstream handoff #57](https://github.com/smeagol44/vidAI/issues/57), [performance budget #67](https://github.com/smeagol44/vidAI/issues/67). Original reports and data are linked by fixed commits, not duplicated/replayed as new experiments.
- **Scope clarity:** historical “no main merge” statements below describe their corresponding *research code/evidence PRs*, not this later **documentation-only** consolidation. Each earlier proposed next stage/stop was superseded only by the dated later authorized stage; none is retroactive permission.

## Proposed Stage 3.7 refinement — experimental subsystem dummies (not executed)

**Owner design request, 2026-11-03; no new measurement or confirmed speedup.** Beside exclusive phase/subphase timing, plan one-at-a-time **research-only** subsystem replacements to measure their **counterfactual effect on end-to-end Worker throughput**: controlled real-recorded or deterministic vision signals, known constant/cyclic neural outputs, an independent learning-off mode, and feeding-contact bypass with clearly recorded or fully funded synthetic transfer. Physics replay is conditional on credible shared-contact/state contracts; no safe substitute is assumed. See the detailed [Stage 3.7 dummy design](contributor-workspace/performance/STAGE_3_7_DUMMY_SUBSTITUTION_DESIGN.md).

These are not real biological simulations. Dummy-on runs can change neural decisions, contacts, metabolism, energy, deaths, reproduction and future workload; they **cannot** be presented as exclusive CPU-percent estimates or ready-to-ship speedups. A cheap deterministic A/B/C state machine can be globally shared (order-sensitive) or selected by logical tick/organism/channel (preferable comparison control), but must not perturb production PRNG. Keep all-real exactness controls and conservation-aware dummy fixtures, measurement overhead and source provenance separate. Historical results below remain unchanged; Stage 3 continues ongoing and Stage 4 optimization is unapproved.

## Latest owner direction and proposed Stage 3.7 (not yet executed)

**Priority: more granular, exclusive Worker analysis.** Stage 3.6 source-mapped samples identified costly Worker locations but their percentages are sampled-location evidence, not exclusive per-function CPU budgets or removable waste. The next separate bounded protocol should measure a mutually exclusive tick-phase ledger, then drill into nested subphases (physics/contacts, spatial indexing/vision, recurrent inference/learning, feeding/ecology/energy/reproduction), retaining an explicit residual/unattributed bucket. For each hotspot distinguish calls, work units, measured inclusive/exclusive elapsed time, independent thread-CPU evidence where obtainable, allocations/GC, scaling and probe overhead. Do not sum overlapping samples, present wall time as CPU time, or extrapolate a software-CI result to user hardware. See the [owner audit plan](contributor-workspace/performance/PERFORMANCE_AUDIT_PLAN.md), [Worker handoff](contributor-workspace/performance/WORKER_HOTPATH_RESEARCH_HANDOFF.md) and [Stage 2 source inventory](contributor-workspace/performance/PERFORMANCE_AUDIT_STAGE_2.md).

**Secondary rendering question:** a stationary camera does **not** make moving organisms, nutrients, effects or observer animation static. Investigate background/static-layer caching, dirty-region invalidation and state-aware redraw only as a separate **unmeasured hypothesis**, preserving truthful animation, pan/zoom/resizing, masks, selections and all life movement. SwiftShader bottlenecks do not establish hardware-GPU benefits. No redraw optimization is approved here.

**Integrity/authorization:** Stage 3.7 may be executed only under a fresh explicit Work task and preregistered finite protocol/budget. Use current fork-main as the target, dedicated fork research branch, exact checkpoint/PRNG/settings/energy control, low-overhead lean throughput versus separately priced profiling and no scientific trial repeats by default. Never skip offscreen physics, change solver/brain/learning/ecology/diet, delete safety guards, refresh historical baselines or modify production in order to manufacture a gain.

---

## Preserved cumulative scientific dashboard (Stages 3.1–3.6)

# Stage 3.6 update — 2026-11-03

**Stage 3 remains ONGOING. Stage 3.6 bounded batch COMPLETE; STOP for Hernan review.**

[Full report](https://github.com/hernansgarro/vidAI/blob/eed47f7f211936022c06af04edc40d199b518ed2/docs/experiments/performance-stage-3-v7/report.md), [executive summary](https://github.com/hernansgarro/vidAI/blob/eed47f7f211936022c06af04edc40d199b518ed2/docs/experiments/performance-stage-3-v7/executive-summary.md), [numerical findings](https://github.com/hernansgarro/vidAI/blob/eed47f7f211936022c06af04edc40d199b518ed2/docs/experiments/performance-stage-3-v7/findings.json), [verification](https://github.com/hernansgarro/vidAI/blob/eed47f7f211936022c06af04edc40d199b518ed2/docs/experiments/performance-stage-3-v7/verification.json), [scientific CI](https://github.com/hernansgarro/vidAI/actions/runs/41695218166).

| Stable ID | New measured evidence | Classification / remaining boundary |
| --- | --- | --- |
| S2-12 / S2-11 | Verified Worker ~98.7–99.4% of one logical CPU, main/UI ~98.1–98.4%, additional graphics ~73.7–75.3%; browser ~285–287% (~71% of four reported CPUs) | CONFIRMED on software Chromium. Worker is ~35% of browser CPU; prior 96–98% tick-wall share was not browser CPU. Hardware desktop and removable observer cost UNKNOWN. |
| S2-09 | Cap 30→10 primary TPS 175.10→184.43 (+5.33%); pairs +5.90/+9.77/−0.51%. Browser CPU-ms/tick 16.778→15.527 (−7.46%) | Workload/platform efficiency benefit PLAUSIBLE, not stable universal gain. Total CPU barely changes 286.71→285.05%; no demonstrated cooling. |
| S2-11 / S2-12 | UI sampled drawImage intervals ~74–77%, chiefly world-layer finish/composition; report cadence 19.64→8.49/s while Canvas ~52→51 FPS | Expensive software presentation CONFIRMED; native sampled location is not pure-copy CPU or desktop GPU prediction. Fresh-state spacing ~51→118ms; visual/input acceptance UNKNOWN. |
| S2-12-M | Actual Worker GC ~2.4–2.7% of diagnostic wall time; substantial V8 inter-GC allocation proxy. Main allocation proxy lower at cap 10 | Allocation/GC CONFIRMED in perturbed diagnostics. Worker GC/tick ~0.154→0.158ms does not improve; no leak, retained-heap or primary mediation claim. |
| S2-01/02/03/05 | Source-mapped sampled anchors, spatial queries, somatic writeDeltas and contacts are real hot locations | CONFIRMED sampled activity; avoidable fraction UNKNOWN. Existing caches/scratch remain. Recommend separately authorized fixed-logical-tick phase/allocation study. |
| S2-12 | Worker runqueue waits ~0.24–1.36% of primary time; short tracing control TPS −5.78%, FPS −14.12% | Scheduler waiting alone unsupported as explanation; profiling materially perturbs measurements. Do not pool traced diagnostics with primaries. |
| S2-08 and remaining historical rows | Fixed disconnected topology; previous outcomes retained below | No new tube campaign, optimization, long-run retention or physical thermal measurement. |

All 12 windows retained exactly once, 249.714s active / 372.628s runner, under registered 360s/600s. Exact reused Stage 3.5 checkpoint; 120-tick full-state/settings/PRNG/energy pilot and archive SHA256/length/tick checks passed. Source 81ce31d; original evidence d530894. Intel Xeon Platinum 8370C, four reported CPUs, Chromium 145 / Playwright 1.58.2, SwiftShader. Different host/duration from 3.5: absolute TPS/FPS differences are not regressions or speedups. Original runtime/package/lock/inherited tests/workflows unchanged; temporary measurement workflow removed after execution and retained as reference only.

No main/testing merge, upstream PR/merge, release, Pages, Wiki publication, Stage 3.7 or Stage 4 implementation. Proposed next investigation is unexecuted. Historical PRs #66/#69/#80 and evidence remain unchanged.

---

# Preserved Stage 3.5 and earlier dashboard

Historical values and stopping receipts below describe their own checkpoints; only the dated Stage 3.6 update above supersedes the previous proposed-next authorization state. Stage 3.5 evidence links point to immutable 18e6673.

# Stage 3.5 update — 2026-11-03

**Stage 3 remains ONGOING. Stage 3.5 bounded batch COMPLETE; stop for Hernan review.**

[Report](https://github.com/hernansgarro/vidAI/blob/18e6673ceede77089faf9a914f595f4a5ed1d0fd/docs/experiments/performance-stage-3-v6/report.md), [executive summary](https://github.com/hernansgarro/vidAI/blob/18e6673ceede77089faf9a914f595f4a5ed1d0fd/docs/experiments/performance-stage-3-v6/executive-summary.md), [quantitative findings](https://github.com/hernansgarro/vidAI/blob/18e6673ceede77089faf9a914f595f4a5ed1d0fd/docs/experiments/performance-stage-3-v6/quantitative-findings.json), [verification](https://github.com/hernansgarro/vidAI/blob/18e6673ceede77089faf9a914f595f4a5ed1d0fd/docs/experiments/performance-stage-3-v6/verification.json), [compact windows](https://github.com/hernansgarro/vidAI/blob/18e6673ceede77089faf9a914f595f4a5ed1d0fd/docs/experiments/performance-stage-3-v6/window-summary.json), [fork draft PR80](https://github.com/hernansgarro/vidAI/pull/80).

Current target is **active MAX simulation with caustics OFF, no selection/inspector/tracking**, essential organism/food/egg presentation and full off-camera biology/physics. Historical decoration-enabled/paused findings below remain valid history; they do not set the current optimization target.

| Stable ID | New measured evidence / effect | Classification, uncertainty and remaining question |
| --- | --- | --- |
| S2-09 | Fixed reporting-cap intervention30→10/s:15 organisms601.2→595.3ticks/s(−0.99%);30 organisms230.1→243.4(+5.78%), two reversed-order repetitions each | Workload-dependent benefit PLAUSIBLE at30; no universal gain. Pairs at30+3.58/+8.13%; at15−1.58/−.34%. No production scheduling change. |
| S2-09/S2-12 | Effective reports~22/19.8→8.8/8.7/s; Canvas remains~59–60FPS; no eligible outstanding-frame skips | Independent tick/render/report rates CONFIRMED. Human fresh-motion/input trade-off UNKNOWN; repaint FPS is not fresh-state cadence. |
| S2-09 | Native synchronous postMessage~.4–.7ms versus frame build~.1ms; at30 post-call wall fraction~1.32/1.51%→.58/.59% | Direct costs CONFIRMED, removable budget UNKNOWN. This does not explain all3.58–8.13% measured throughput movement; serialization/GC/contention not separated. |
| S2-12 | Lean/full short-control medians635.54/641.36TPS(+.92%); adjacent pair signs+3.89/−2.48%, individual578.6–704.1 | Small overhead and small gains UNKNOWN. No zero-overhead claim or statistical confidence bound. CPU/thread, Worker GC, cache/bandwidth remain UNKNOWN. |
| S2-01/02/03/04/05/06/07/10 | Whole ticks and evolving inventory measured; prior coarse essential costs retained | No new subsystem attribution/optimization from3.5. Optics/index/allocation, articulated contacts and recurrent neural/learning remain worthwhile measured historical suspicions. |
| S2-08 | Fixed disconnected topology throughout3.5; older tube fixture has zero crossings | Active crossing/boundary/off-camera tube cost UNKNOWN. No tube campaign executed. |

All8 primary +4 overhead windows completed once.120logical-tick full authoritative state/PRNG/energy pilot passed. Exact measured source40d7467, fork-baseeff9034; Intel Xeon6973P-C,4reported CPUs, Chromium145/Playwright1.58.2, software SwiftShader,1280×850/DPR1. Active173.099s; scientific archives11,800,912bytes; all original SHA256/lengths and18Git blob pointers read back. Scientific CI41664520289 and analysis-only verification41665757852 succeeded. Original runtime/package/lock/inherited tests/workflows unchanged.

**Next proposed bounded measurement, not authorized/executed:**30-organism cap30-versus10 with independent Worker/main CPU and GC attribution, separating a lean throughput control from a profiled diagnostic. The current software-CI two-repetition result cannot establish a stable desktop gain or its mechanism. No merge to main/testing, upstream PR, release/Pages/Wiki, Stage4 or extra campaign.

The report discloses the incomplete exact transient birth/death totals, unavailable per-thread attribution and unmeasured subjective smoothness. No failed/missing timing was reconstructed.

---

# Preserved Stage 3.4 and earlier results

The text below preserves prior numeric findings and uncertainties. Relative3.4evidence links resolve to immutable44f847d because research remains unmerged. Historic proposed-next/stopping wording describes its own checkpoint and is superseded only by the dated update above.

# Stage 3.4 update — 2026-11-03

**Stage3 remains ONGOING. Stage3.4 bounded execution and evidence recovery are COMPLETE.**
[Report](https://github.com/hernansgarro/vidAI/blob/44f847dc9bbebaea09cf63d6249b80a6a3dff2de/docs/experiments/performance-stage-3-v5/report.md), [verification](https://github.com/hernansgarro/vidAI/blob/44f847dc9bbebaea09cf63d6249b80a6a3dff2de/docs/experiments/performance-stage-3-v5/verification.json), [final machine summary](https://github.com/hernansgarro/vidAI/blob/44f847dc9bbebaea09cf63d6249b80a6a3dff2de/docs/experiments/performance-stage-3-v5/summary-final.json), [fork draft PR69](https://github.com/hernansgarro/vidAI/pull/69).

New runtime base3e7319e (caustic toggle included), executed research c997001bceb7e268f03e4d649121ec1c55c2207a. Historical PR66/c80b25a and v1–v4 evidence remain immutable and use their own older source/machines. No cross-revision speedup is inferred. No optimization/main merge/testing/upstream submission.

| Stable ID | New evidence / impact | Confidence and remaining boundary |
| --- | --- | --- |
| S2-11 | **CRITICAL software-CI display cost confirmed in active and paused scenes.** Caustics off raises~4–5FPS to~58–59FPS. | High within matched software scenes; physical GPU/desktop and independent pixel scaling unmeasured. No Worker gain follows from FPS. |
| S2-09 + S2-12 | **Actual Worker/ACK measured.** MAX TPS on→off:5=1828→1706(−6.67%),15=603→533(−11.66%),30=238→218(−8.50%); two windows/mode.30ACK medians~231→11ms, reports~4→20/s. | Real Worker progress continues during slow ACKs. Negative throughput signs repeat, but rendering/report demand/indirect contention/trajectory are not isolated. Native post~.7ms and frame build~.1ms do not price the whole8.5% drop. No production policy change. |
| S2-12 scheduling | At15/5x both~299.82ticks/s despite4.18vs58.45FPS; at0x zero ticks/frames but4.40vs59.71FPS. | One pair each, explicitly omitted second repetitions to include overhead within20total windows. Continued paused repaint confirmed. |
| S2-12 measurement / memory | Corrected short original/diagnostic medians565.37/563.47TPS (~−.34%); original apparent+8.9% was mismatched snapshot boundaries. | Approximate start/receipt boundaries and mixed pair signs; not zero overhead. Main windows are longer than Worker intervals. Per-thread CPU/GC/retention remain UNKNOWN. |
| S2-01/03/05 | Current realistic starts have27/81/162parts,13/39/78eyes and120/360/720hidden neurons at5/15/30. Throughput scales strongly with load. | No new per-kernel subsystem attribution; retain historical optics/contact/neural findings without adding percentages.5-on ends4organisms;15-on ends16;30remains30. |
| S2-10 + S2-07 + S2-08 | Semantic inventory classifies real energy contours/egg reserve as informational B; optional visual candidates documented. | No new glow-isolation, egg-rich/hatch or tube-crossing benchmark. No dismissal of informative layers. |
| S2-02/04/06 and other preserved rows | Previous evidence and stable priorities remain as below. | No new cache, ray, broadphase, ecology or physics experiment in3.4. |

Exactly20measured windows retained:12MAX,4single-repetition0x/5x and4short controls. All hashes read back,120-tick full state/PRNG/energy equality passed. Active counter424.103s includes35.731s carried setup/pilot; initial18minute preflight wait and92.19MiBraw versus64MiB data ceiling are explicit protocol failures, not hidden. Final recovery obtained all22measurement archives after a partial19-window log read; no scientific outcome remains missing and no timed window was repeated.

Potential next Stage3 study (not executed): fixed redraw/caustics off with isolated report-cap30vs10/s at15/30MAX,8windows. Stage4 and further execution await Hernan review.

---

# Preserved historical executive register and Stage3.1–3.3b evidence

The following historical report is retained with its S2 IDs, ordering, numerical limits and negative findings. Its old “next action”/authorization wording describes that checkpoint and is superseded only by the dated3.4 update above. Historical relative evidence/script links are resolved to immutable c80b25a; no historic data was rewritten.

# VIDA 2D performance audit — cumulative Stage 3 research

**Stage 3 status: ONGOING — additional investigation remains pending.**

Contributor/fork research only; updated2026-11-03. Stage3.1 is the preserved completed
pilot; Stage3.2 and the authorized Stage3.3b recovery batch are completed. The original
Stage3.3 missing observation remains preserved. A finished batch or execution budget
does not close Stage3. Stop after each batch for Hernan's review; Stage3.4 and
Stage4 optimization implementation are not authorized automatically. Completion needs
all meaningful reasonably testable questions at justified stopping points, including
new questions, or Hernan's explicit closure decision.

Research remains on [fork draft PR66](https://github.com/hernansgarro/vidAI/pull/66),
`audit/performance-stage-3`, based on fork/main `11248f3431604a1b883a7a948a6e6baddc3fafdd`.
[Stage3.2 protocol](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/protocol.md),
[batch evidence](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/),
[Stage3.1 immutable evidence](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v1/).
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
| 3 / S2-02 | Invariant physical metadata / conditional reuse | 🟢 LOW OBSERVED substep cost; ⚪ UNKNOWN end-to-end cache benefit | High repeat-count/exact-state confidence; medium coarse timing; low production-gain confidence |Substep~.54/.65% sampled tick time; contacts2400/~2179mass records/tick; WeakMap substep~1.92× recompute cost in isolated loop | Stage3.3b batch COMPLETE; mechanism/tradeoffs partially investigated, no cache implemented | Real-cache end-to-end gain/lifetimes/historical regimes remain untested; prioritize actual Worker/UI/IPC next |
| 4 / S2-03 | Optical index/query/intersections | 🟠 HIGH observed coarse cost | Medium coarse attribution |34.0%/40.5% sampled vision+update shares,195/390rays/tick | Confirmed broad cost; exact breakdown partial | Separate index build, finite corridor, exact tests, sorting/allocation and independent density/eye scaling |
| 5 / S2-01 | Contact physics and articulated solve | 🟠 HIGH observed essential work | Medium measured attribution |Older coarse physics/contact shares retained; new body-wrapper subset~4.57/2.56% sampled tick time at15/30, includes dynamic bounds | Confirmed cost; removable fraction unknown | Profile broad/narrowphase, iterations and existing scratch; no solver/physics change |
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
| Stage3.1 — original pilot,2026-11-02 | COMPLETED batch only:30Node trials +6paused Chromium windows | [v1](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v1/), original final head9a040fc; report below preserved as historical pilot. Old references to 'complete' concern this batch. |
| Stage3.2 —2026-11-02; consolidated2026-11-03 | COMPLETED batch only:10timed windows,2diagnostic captures,60isolated copies plus executive/vision/cache source review | [v2 protocol](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/protocol.md), initial metadata preflight1c4927a failed before measurements; repaired source7279fc8 and tested PR merge6971be7 passed; [report](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/report.md) |
| Stage3.3 —2026-11-03 | Stopped at missing observation; original outcome stays UNKNOWN | [Immutable incident](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v3/incident.json); recovery explicitly authorized under3.3b |
| Stage3.3b —2026-11-03 | COMPLETE batch:12kernel slots,54M isolated visits and one zero-tick validity control | [v4 report/evidence](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v4/report.md); all trajectories equal and match historical tick360 |
| Stage3.4 | PROPOSED ONLY; not executed | Real Worker/UI transport/throughput next, with a separately registered budget |

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
scope/uncertainty. [Completed Stage3.2 report](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/report.md),
[raw evidence](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/browser-original.json.gz),
[derived summary](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/summary.json),
[proposed Stage3.3](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/next-substage-proposal.md).
Experimental visual ablation is not a shipped speedup or active Worker gain.

## Stage 3.3 —2026-11-03: blocked at missing-evidence stop

The physical derivation/isolated reuse/lifetime batch was preregistered, but its first
kernel slot's receipt/archive were not retained after a capture-orchestration failure.
Whether its planned ticks completed is unknown. No valid timing or new cache benefit
is reported. The zero-tick loader/restore preflight succeeded and is preserved.
One outcome is unknown;11kernel slots and the component study remain unstarted.

[Incident, original preflight and report](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v3/report.md),
[explicit recovery proposal](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v3/recovery-proposal.md).
The capture bridge was repaired/tested using synthetic data only. **Stage3.3 BLOCKED;
Stage3 ONGOING.** No unauthorized lost-trial rerun occurred. S2-02 remains UNKNOWN
impact/low benefit confidence; all other executive classifications remain unchanged.
Historical stop: Hernan subsequently authorized3.3b; see its completed results below.
The original unknown observation and this incident remain preserved.

## Stage3.3b —2026-11-03: authorized recovery complete, new evidence consolidated

Hernan explicitly authorized a labeled recovery and the remaining studies. The first
old observation stays UNKNOWN; [v3](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v3/) is unchanged.
All12new kernel results, the54million-visit component study and one separately
registered zero-tick validity control are preserved in [v4](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v4/).
Every trajectory/hash agrees and matches the original v1 tick360 reference.

**Changed conclusions:** the old300/600counts omitted contact/projection/COM consumers.
Substep mass/inertia is only~.54/.65% of sampled diagnostic time in these workloads;
whole contact-body construction~4.57/2.56% includes necessary dynamic work. A generic
WeakMap speedup is refuted: isolated substep lookup median67.55ms versus35.22ms
recomputation per2million visits. Direct indexing and projection reuse have conditional
component evidence, not a measured whole-kernel gain. One controlled retained-key
fixture observed~1.77MB incremental heap for10000six-number records; the original
negative heap delta is preserved as invalid size telemetry. Actual cache lifetime/
historical compatibility and end-to-end gain remain open.

All executive rows were reassessed: S2-02 changes to LOW OBSERVED for its substep
block and UNKNOWN for net production benefit; S2-01 gets the new wrapper/iteration
breakdown. No other impact classification changes. Synthetic heap/timer controls
do not establish an application leak diagnosis. Graphics/vision/neural prior results,
real IPC, independent scaling, eggs/tubes and long-run/desktop gaps remain preserved.
[Detailed report](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v4/report.md),
[summary](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v4/summary.json),
[verification](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v4/verification.json).

Next proposed bounded question: actual Worker/UI transport, ACK and ticks/s versus
display cost. **Stage3.4 is not executed. Stage3 remains ONGOING.** No optimization,
merge, upstream submission or application publication is authorized by these results.

## Current source reviews and pending research inventory

[Finite vision/source and IDEA-026 design questions](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/vision-range-source.md).
[Invariant physical source inventory and mandatory future study](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v2/physical-source.md).
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
[retained protocol](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v1/protocol.md),
[priority input](contributor-workspace/performance/PERFORMANCE_AUDIT_PRIORITIES.md), [Stage 2](contributor-workspace/performance/PERFORMANCE_AUDIT_STAGE_2.md).

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
not Hernan's Windows machine. [Environment and timing receipts](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v1/environment.json).
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

[prepare.mjs](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/scripts/performance-stage3/prepare.mjs) copies current root modules
into ignored `.audit-stage3/`, verifies unique textual anchors, and adds coarse
phase switches plus aggregate counters. No original simulation file is edited.
[probe.mjs](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/scripts/performance-stage3/probe.mjs) samples one tick in eight;
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

[Original browser checkpoints, six series and profiles](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v1/browser-original.json.gz),
[derived browser summary](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v1/browser-summary.json).

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
verified research runtime; [source readback](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v1/source-equivalence.json).
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

[Raw data/profiles/checkpoints/logs](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v1/),
[derived machine-readable summary](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/docs/experiments/performance-stage-3-v1/summary.json),
[runner](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/scripts/performance-stage3/run.mjs),
[analysis](https://github.com/hernansgarro/vidAI/blob/c80b25ac391a409da6c321bbdfc5cb7bec447db9/scripts/performance-stage3/summarize.mjs).
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
