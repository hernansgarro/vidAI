# Stage 3.12 — Transient Worker allocation ownership: COMPLETE

**All six registered windows executed once and were retained. Exact full endpoints, integrity and every budget passed.** Two allocation profiles identify a repeatable set of source candidates with modest observed probe cost. Sampled allocation volume is not CPU cost, live heap, wasted memory or an achievable speedup.

## What the new evidence identifies

All conditions use the SAME compiled lean Worker and unchanged150spread world,360complete1/60ticks (six simulated seconds), with60lean warmup ticks followed by exact initial reset. Fixed reversed order L01none/G01lightGC/A01lightGC+sampler/A02sampler/G02lightGC/L02none; n2each.

| Closest verified original stack owner |A01 weighted share |A02 weighted share |Granularity / interpretation |
| --- | ---: | ---: | --- |
|stepSimulation — simulation.ts:3579 |35.16% |35.45% |Large function-entry ownership bucket; internal allocating expressions remain unresolved |
|advanceOrganismPhysics — simulation.ts:3002 |19.29% |19.03% |Whole articulated-body advancement function; not an isolated invariant or scratch operation |
|OrderedSpatialIndex.query — spatialIndex.ts:42 |11.41% |11.63% |Ordered finite-corridor query; source constructs a result array and sorts it |
|bodySight per-part callback — simulation.ts:3783 |7.44% |8.17% |Per-tick body sight/corners/bounds construction callback; not a measured saving from removing it |
|contacts.pairs — contacts.ts:119 |3.99% |3.68% |Pair-list construction in code that ALREADY reuses contact-cell buckets |
|evaluateOrganismBrain — simulation.ts:3423 |2.99% |2.48% |Direct function ownership, not all inference/learning allocations elsewhere |

These are **exclusive closest-original-call-stack shares of weighted samples**, not additive inclusive parent-stack totals. The first three account for65.86–66.10%; top-five order agrees in both profiles. Nine of top10sites are shared (intersection9/union11,Jaccard0.8182), descriptive replication only. Function locations often point to declarations; they are not exact allocating-expression addresses. In particular, the35%stepSimulation bucket cannot be assigned wholesale to vision, learning or any single pass.

By exclusive original-source group: simulation.ts74.98–75.92%,spatialIndex.ts14.50–14.62%,contacts.ts6.55–6.98%; foundationPhysics.ts1.25–1.31%; other groups smaller. The neuralRuntime.ts module alone is0.30–0.41%, which does NOT make recurrent inference cheap: earlier phase measurements quantify CPU/elapsed work, and neural/learning work also lives inside simulation.ts. Do not rank CPU bottlenecks by allocation bytes.

The two profiles contain11,489/11,695samples, with3,012,948,064/3,067,052,900weighted bytes attributed by the sampling API. These are approximate cumulative allocations during a sampling bracket, **not3GB simultaneous RAM usage or an exact allocation census**.99.939%/99.923%of sample weight has a closest byte-verified original-source caller; remaining0.061%/0.077%is explicitly marked transformed research-worker code. Native/generated leaf frames remain in the raw attribution, not silently reassigned as exact original expressions.

## Observer price and GC guardrail

| Condition |Actual ticks/s range |Median ms/tick |Elapsed contrast vs lean median |
| --- | ---: | ---: | ---: |
|Lean L01/L02 |79.777–83.187 |12.2781 |Reference;4.275%repeat span |
|LightGC G01/G02 |78.062–83.562 |12.3887 |+0.902% observed |
|LightGC + sampler A01/A02 |77.185–82.762 |12.5193 |+1.965% observed |

Sampler versus lightGC median elapsed contrast is+1.054%. Both sampler costs12.0828/12.9558ms fall in the preregistered light min/max envelope expanded5%:11.368861–13.450792ms. The descriptive modest-cost flag passes. Control variation is material (light span7.045%,sampler7.226%); these contrasts are not precise causal coefficients, significance or corrections to subtract. No claim that the sampler speeds up a window.

Worker outerGC occupies2.083/2.886% in light controls and2.859/2.951% with sampling. This remains compatible with3.11's calibrated finding of modest GC-pause share in this fixture. No detailedGC object-statistics category is enabled. Marked Worker/main Linux identities match their task starttimes; all4light traces report no data loss and contain393,027–464,331JSON bytes, below16MiB each. Separate CPU/frame/report values are retained; no cross-thread percentage sum or GC addition to earlier exclusive phase totals.

Host AMD EPYC9V45,4reportedlogical CPUs,Linux7.0.0-1017-azure/x64,Node24.22.2,Chromium145.0.7632.6/Playwright1.58.2-noble. Previous3.10/3.11 hosts/session/Node differed. Higher newTPS is NOT a product optimization; runtime bytes and saved endpoints remain unchanged. No new finite-speed pacing, dense/evolved/egg-rich world or representative desktop result.

## Sampling semantics, boundaries and mapping fidelity

A dedicated CDP session attaches ONLY the active simulationWorker. TargetURL, DedicatedWorkerGlobalScope and timeOrigin match the actual window completion origin. HeapProfiler sampling interval262144bytes,stackDepth64,both includeObjectsCollectedByMinorGC andMajorGC true; temporary samples survive collection rather than being mistaken for retained-heap-only data. [Official CDP schema](https://github.com/ChromeDevTools/devtools-protocol/blob/master/json/js_protocol.json) describes these fields; [V8 inspector](https://github.com/v8/v8/blob/main/src/inspector/v8-heap-profiler-agent-impl.cc) supplies weighted sample sizes and may force collection when returning a profile.

There is NO getSamplingProfile during/before a timed window. startSampling immediately precedes resume. After exact useful/CPU closure, the light trace ends; only then stopSampling materializes its profile, before expensive authoritative snapshot export. Possible inspector-forced collection is an explicitly separate observer tail, not normal measuredGC. No collectGarbage or heap snapshot command is issued.

| Sampling bracket |A01 |A02 |
| --- | ---: | ---: |
|Useful Worker interval |4349.8ms |4664.1ms |
|Pre-roll from recorded before-start clock |23.2ms |20.4ms |
|Post-roll through after-stop clock |155.8ms |143.9ms |
|Total recorded bracket |4528.8ms |4828.4ms |
|Bracket excess over useful |4.12% |3.52% |
|stopSampling command, outside useful/trace |34.30ms |34.98ms |
|Profile JSON |520,725bytes |528,267bytes |

Samples have ordinal ordering but no individual timestamps; the profile therefore covers this explicit bracket, not an exact per-tick allocation receipt. The paused post-roll avoids full-export contamination but is not silently removed. The sampled24tick pilot includes its snapshot export and is labeled plumbing-only, excluded from scientific allocation ranking.

The analysis uses the exact archived lean JS/source maps and already-locked trace-mapping dependency; no dependency or runtime change. Nine original mapped source files match repository content by SHA256. simulation.worker.ts is known to be transformed by the research completion guard and is marked transformed regardless of source-map claims; no false original line mapping. Original/native/generated leaf context and nearest original caller attribution are distinct. Inclusive source groups overlap and are never summed as exclusive percentages.

Every sample ordinal is unique and refers to a retained profile node; exclusive groups sum exactly to the sample-weight denominator. Sum of node selfSize is210,408/172,712bytes below summed sample weights (0.0070%/0.0056%); these API aggregates are not treated as identical or an exact allocation ledger. All reported shares consistently use sample weights, without mixing denominators. [Allocation attribution](allocation-attribution.json) retains coverage, verified hashes, source groups, leaf/owner sites and top10agreement; generated raw locations remain reproducible.

## Code-backed candidates, not implemented savings

| Candidate to consider under future authorization |Evidence |Required fidelity / uncertainty |
| --- | --- | --- |
|Query result-array lifetime/reuse |query stack11.41–11.63%; source creates result[] and sorts source indices |Candidate uniqueness/order, finite-ray corridor/epsilon tangencies, nested query/reentrancy and caller lifetime; no measured removable fraction |
|Per-tick optical body/corner/bounds scratch |bodySight callback7.44–8.17%; earlier independent visual-crowding work |Live pose/appearance, occlusion/closest ties/ordering, real sensing/learning; cross-tick caching is not automatically valid |
|Physics and pair-list temporary lifetimes |advanceOrganismPhysics19.03–19.29%; pairs3.68–3.99% |Existing typed scratch/contact pools already present; preserve all substeps/iterations, physics arithmetic, guards and body continuity |
|Finer source decomposition of stepSimulation |35.16–35.45%function-level bucket |Large unresolved inline kernel region; do not label all of it optical, neural or avoidable without finer evidence |

This is new evidence about creation/ownership, not a fourth-stage implementation or a speedup experiment. Essential objects can be frequent, and allocating less may increase CPU or complicate correctness. No cache, pooling, sensing reduction, learning bypass or physics alteration was implemented. Earlier3.8/3.9 missing/failing trials remain immutable.

## Integrity, budgets and provenance

Base verified fork/main`a856a2d9d9f5e650a95be3abeadbd908105e70db`; protocol registered BEFORE coding in [#57 comment6631707584](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6631707584), shared[#67](https://github.com/smeagol44/vidAI/issues/67). Scientific source`a26569b0d039404cdb5bb8ceeeac46be7916e5d0`; immutable originals`28fb12bb67e8666b38d3e12e355dacaae5931993`; [research draft104](https://github.com/hernansgarro/vidAI/pull/104), unmerged.

Unchanged150spread initial state1190cca6d9a7a908d7b9fbeca0ac744e0f4bec70b969f5a38b44605b43dcf114,150living/690parts/540joints/330eyes/1650rays/3600hidden/600ordinaryfood,4000x3000/seed73/equal currentCUR001–005 proportions. Normal funded energy/physical feeding/learning/passive-work-v3/capsule-v1/closed-v1/decay-v2. CausticsOFF/no selection/tracking/inspector,1280x850/DPR1,original30/s+ACK and authoritative off-camera work.

ALL6full endpoints exactlymatch3.9–3.11 SHA256`c9189ebe919fc196e899b15780803ae85387602f54f56ea551a395b49a31bf7b`, including genes/acquired/recurrent neural state, settings,PRNG,physics,energy. Final150living/569food, no deaths/new offspring/eggs/guards, energyerror<3.86e-7J. One24tick lean plus one24tick sampled pilot match archived state; independent4+3counter passes.2575finite research ticks maximum. Same prior compiled leanWorker hash for all modes.

All44original output files/14references/all276inheritedfiles match immutable Git/SHA256/length; exact lossless JSON/hash/order roundtrips. [Verification](verification.json),[source audit](source-equivalence.json),[findings](findings.json),[CI job](ci-job.json),[original log excerpt](run-log-excerpt.log).

[ScientificCI41837660795](https://github.com/hernansgarro/vidAI/actions/runs/41837660795),job126600657300,SUCCEEDED; npmci,385fast/build/typecheck/actualproductionWorker,codec/corruption/refusal/emergency and6focusedChromium windows pass. Source routineCI41837668412 succeeded. No Firefox/full-suite expansion/manual browser campaign. Artifact13326782911 ZIP7,101,253bytes SHA256`9926159234fa01b560d164ad404c8d20aa9e3ddccd52844ffdf314e18b0c9d62`; original Git preservation succeeded.

|Registered resource |Actual |Limit / outcome |
| --- | ---: | --- |
|Timed attempts / retained / missing |6 /6 /0 |6;passed |
|Active pilot/warmup/useful brackets |61.894s |120s;passed |
|Inclusive runner cleanup/finalwrite |260.237s |720s;passed |
|Full Playwright invocation |263s |720s;passed |
|Latest slot admission |223.504s |600s,120sreserve;passed |
|Largest useful interval |4.6641s |30s;passed |
|Normal output+controls+copiedinputs |29,424,082bytes |192MiB;passed |
|Independent emergency raw |37,638bytes |2MiB;passed |
|Largest of3sampling profiles |528,267JSON bytes |8MiB each;passed |
|Largest of4light traces |464,331JSON bytes |16MiB each;passed |

Preflight47.420s; useful intervals26.774s. Full exports3.52–4.11s happen after useful/CPU/trace/sampling closure; imports/exports/archives/comparisons dominate the rest of runner time. Normal output23,606,408bytes +plaincontrols58,551 +inputs5,759,123, emergency37,638; regular expanded receipts200,602,088bytes. External artifact/Git replication and routine setup are separately identified steps, not hidden in useful timing. No waiver, extension, lost trial or rerun.

## Documentation delivery and reproduction

Verified conclusions and their limits return to the fork-main cumulative [ledger](../../PERFORMANCE_AUDIT_STAGE_3.md) and current plan/priorities/handoff/project/vision context through a separate DOCS-ONLY integration under Hernan's standing instruction. Follow shared#57 final merge/readback receipt. Probes/raw remain on the unmerged research branch; production/testing/upstream and earlier data remain separate.

From a full checkout with existing locked npm dependencies:

```sh
node scripts/performance-stage312/analyze.mjs
node scripts/performance-stage312/attribute-allocations.mjs
python scripts/performance-stage312/verify-source.py
```

These read archives/maps/Git objects only, without simulation or browser. Source audit pins immutable originals, avoiding final-report self-reference. Active scientific launch workflow removed; historical reference YAML is not permission to run again. **STOP after3.12 and authorized documentation integration. No new campaign, Stage4/product optimization, upstream submission orVIDA3D.**
