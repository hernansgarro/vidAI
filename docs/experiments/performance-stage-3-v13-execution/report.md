# Stage 3.11 — GC observer calibration: COMPLETE

**Six registered windows executed once, all retained; exact authoritative endpoints and every budget passed. Lightweight GC observation does not support treating the earlier detailed trace's large GC percentage as ordinary simulation cost.** No production optimization was implemented.

## Main finding: the detailed observer creates most of its apparent GC cost

All conditions use the SAME lean Worker binary, fixed150spread world and360complete1/60second ticks. Two reversed-order repetitions per condition: L01none/G01light/T01detailed/T02detailed/G02light/L02none. Each gets60lean warmup ticks then exact initial reset; tracing starts only afterward. No forced GC, heap tuning or altered physics/learning/senses.

| Condition | Actual ticks/s, range | Median ms/tick | Elapsed change vs lean median |
| --- | ---: | ---: | ---: |
|No trace L01/L02 |66.136–66.678 |15.0589 |Reference;0.819%repeat span |
|Light G01/G02 |67.103–68.845 |14.7139 |−2.291% observed; not a speedup claim |
|Detailed T01/T02 |39.710–40.742 |24.8636 |+65.109% |

Both light costs14.9025/14.5253ms fall within the preregistered lean min/max envelope expanded5%:14.247625–15.876292ms. The descriptive modest-cost flag passes. Negative observed overhead is order/host/GC variability, not evidence that tracing improves simulation. n2/fixed reversed order is not randomization or statistical confidence; all six windows cover only six simulated seconds.

| Trace window |Worker outer GC wall union |Worker GC share |Minor / Major |MajorGC duration range |Object-statistics scope union |
| --- | ---: | ---: | ---: | ---: | ---: |
|G01 light |127.356ms |2.374% |94 /4 |2.506–6.022ms |0 observed |
|G02 light |132.152ms |2.527% |98 /4 |2.277–5.843ms |0 observed |
|T01 detailed |3743.118ms |42.362% |94 /4 |271.405–1225.296ms |3577.164ms |
|T02 detailed |3840.238ms |42.360% |93 /4 |414.412–1210.972ms |3689.587ms |

Light uses ONLY `v8,blink.user_timing`. Detailed adds `toplevel,disabled-by-default-v8.gc,disabled-by-default-v8.gc_stats`, exactly as3.10; neither enables JS stack sampling. The detailed trace's `V8.GC_OBJECT_DUMP_STATISTICS` spans occupy95.57%/96.08% of its Worker outer-GC union. These nested spans are already inside GC; never add them to it. Main outer-GC share similarly changes from1.91–2.05% light to28.67–32.16% detailed. Worker/main percentages are concurrent and cannot be summed into one wall fraction.

This scope inspection is explicitly **post-hoc analysis of the retained traces**, not an extra experimental condition or new trial. [V8 MarkCompactCollector source](https://chromium.googlesource.com/v8/v8/+/31c192f5465b45c6f82a780bd84423cf4caab948/src/heap/mark-compact.cc) corroborates that enabled GC object statistics collect and dump additional live/dead-object information in this path. The trace records matching scope names/durations. Category differences are bundled, so this is not a separate category-only causal trial or license to subtract dump duration to predict untraced throughput.

**Interpretation:** recurring GC is real, but the very large detailed-trace fraction mainly reflects observer work. Under the cheaper observer, GC pauses are a small fraction of this particular workload. Deprioritize the hypothesis that ordinary GC pauses dominate it. The cost of creating/transferring temporary objects remains an independent question: small GC-pause time does not prove allocations are free or safe to remove. Preserve vision/physics/inference findings and exact semantics; no optimization saving is established.

## Review of the earlier Stage 3.10 interpretation

A separate analysis-only review reads immutable old trace commit`a21a042c9b259f708f59fcde38f154e0d09489a3`, using its original published useful bounds. It runs no simulation and changes no old result.

| Old3.10 role |GC-related wall union |Object-statistics union inside it |Fraction |
| --- | ---: | ---: | ---: |
|Worker |3798.007ms |3584.399ms |94.376% |
|Main |2728.935ms |2572.408ms |94.264% |

[Prior-trace review](prior-stage310-trace-review.json) records original hash/path/commit, marks and raw matching events; [review script](../../../scripts/performance-stage311/review-prior-trace.mjs) reproduces it from Git objects. Thus old3.10's35.50% GC-related fraction remains a valid **detailed-observer** measurement, but must not lead the current bottleneck ranking. Its original report/data and3.8/3.9 failures remain immutable; this is a corrected interpretation, not rewritten history or a recovered missing trial.

## Allocation, heap and CPU boundaries

Light outer events record positive heap reductions totaling3.026/3.070GB in Worker and0.383/0.348GB main. These are repeated collection/churn observations across the useful window, **not simultaneous heap size, allocated-byte counts or retained growth**. There are zero exposed light NVP records, so light allocation rate is explicitly unavailable. No replacement value is fabricated.

Detailed-only NVP inter-GC allocation proxies are342.46/328.39MB/s for Worker and44.36/41.33MB/s main. They sum interior `allocated` records after the first, divided by first-to-last record span, excluding boundary intervals. They remain diagnostic proxies under a heavy observer, not untraced rates or allocation-stack ownership. No leak/long-term retention claim, no allocation or cache implementation.

Every trace has explicit Worker/main marks and matching Linux PID/TID start identity at the two CPU boundaries; no reused-worker attribution. Useful bounds are derived from the Worker mark's time origin and completed-tick begin/end. Complete outer MinorGC/MajorGC events are clipped/unioned, not nested totals. Heap reductions use complete nonnested outer events. Detailed streams report no data loss; trace sizes G01/G02≈0.432/0.424MB, T01/T02≈11.741/13.108MB, all below16MiB.

Marked WorkerCPU is5.26/5.13seconds light,8.68/8.84seconds detailed; mainCPU5.05/5.01 versus8.69/8.65. Browser-group CPU is separately summed and is not WorkerCPU. Residual CPU bracket excess1.36–2.60% is disclosed. Full authoritative export4.41–5.26seconds occurs AFTER useful/CPU closure and trace stop; it is not included in GC/tick denominators.

State reset is not V8 heap reset. Import/warmup garbage and the fresh Worker/page lifetime can influence collections, especially boundary events. No forced collection was used to hide that limitation. This is CI, not sustained gameplay; other loads, long-lived worlds, eggs, food/anatomy factors and source-level allocation ownership remain unmeasured here.

## Fidelity, environment and scope

The initial150spread state hash is`1190cca6d9a7a908d7b9fbeca0ac744e0f4bec70b969f5a38b44605b43dcf114`;150living/690parts/540joints/330eyes/1650rays/3600hidden neurons/600ordinaryfood,4000x3000,seed73, equal currentCUR001–005 proportions. Normal reserves/learning/funded ecology, passive-work-v3/capsule-v1/closed-v1/decay-v2. CausticsOFF, no selected/tracked creature or inspector,1280x850/DPR1, unchanged real Worker pump30/s+ACK and off-camera work.

All6full authoritative final snapshots exactlymatch archived3.9/3.10 SHA256`c9189ebe919fc196e899b15780803ae85387602f54f56ea551a395b49a31bf7b`, including settings, PRNG, physics, genes and acquired/recurrent neural/learning/energy state. Living150/parts690/joints540/food569, no deaths/newoffspring/eggs/guards, max energy error3.8511e-7J. Independent360tick equations, one4+3cumulativecounter and one24tick lean pilot pass. Finite research total2551ticks. All6use the exact prior3.10 compiled lean Worker SHA. All276inherited files,39original outputs and14reference inputs match immutable Git/SHA256/length; every archive reconstructs exact expanded JSON/order/hash.

Host: AMD EPYC9V74 80-core,4reportedlogicalCPUs, Linux/x64, Node24.22.1, Chromium145.0.7632.6/Playwright1.58.2-noble, same viewport/software-rendering context. This CPU differs from3.10'sEPYC7763. New lean66.14–66.68TPS versus old53.46–54.15 is **not a product improvement**: runtime bytes and endpoints are unchanged, host/session differ. Earlier1x/2x saturation is valid for its original runner; it is not a universal150organism ceiling. No new finite-pacing measurement was performed.

## Protocol, budgets and durable evidence

Preregistered before coding in [#57 comment6630109681](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6630109681); [warmup clarification6630177872](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6630177872). Base verified fork/main`3e1cfeec8f71f8c76056848b344596db5148e329`, following docs-onlyPR101 integrating3.8–3.10. Scientific source`61d040bc35b6dc057cc01e524499632907a39082`; immutable originals`a93f9d1e54505b3c62e96ee7be3a66e01175873a`; [research DRAFT102](https://github.com/hernansgarro/vidAI/pull/102), unmerged. Shared issue [#67](https://github.com/smeagol44/vidAI/issues/67).

[ScientificCI41826625738](https://github.com/hernansgarro/vidAI/actions/runs/41826625738), job126562880347, SUCCEEDED. npmci,385fast tests,typecheck/build,actualproductionWorker and codec/corruption/refusal/emergency checks pass, followed by6focusedChromium windows. Source routineCI41826633860 succeeded. No Firefox/full-suite expansion/manual browser campaign. Artifact13319034739 ZIP8,475,356bytes SHA256`55fc26614ad2f3fe2c03b9f3251fe74f92f50d10e33f9459e444b2a621a87671`; all39originals match Git preservation. [Findings](findings.json), [verification](verification.json), [source audit](source-equivalence.json), [CI job](ci-job.json), [original log excerpt](run-log-excerpt.log).

| Resource |Actual |Limit / outcome |
| --- | ---: | --- |
|Timed attempts / retained / missing |6 /6 /0 |6; passed |
|Active finite-control/warmup/science brackets |78.943s |120s; passed |
|Inclusive runner through cleanup/final-write tail |315.371s |720s; passed |
|Full Playwright invocation |319s |720s; passed |
|Latest slot admission |271.938s |600s;120sreserve; passed |
|Normal stored raw+plaincontrols+copiedinputs |50,912,640bytes |192MiB; passed |
|Independent emergency raw |35,919bytes |2MiB; passed |
|Largest trace JSON |13,108,165bytes |16MiB each; passed |

Preflight44.153s, useful scientific spans39.3382s. Normal output45,097,797bytes, emergency35,919, plaincontrols55,720, inputs5,759,123; expanded regular receipts204,105,462bytes. Exact imports/exports/comparisons/archive dominate the remaining runner time, not extra simulation work. Subsequent external artifact/Git replication and routine setup are separately identified workflow steps. No budget waiver/extension, lost trial or automatic rerun.

## Documentation delivery and reproduction

Hernan explicitly requires verified conclusions on **fork main**, including earlier lots. PR101 already integrated3.8–3.10. The cumulative main [ledger](../../PERFORMANCE_AUDIT_STAGE_3.md), current plan/priorities/handoff/project/vision context receive this3.11 interpretation through a separate **docs-only** integration; this research PR/code/raw remain unmerged. Follow the shared#57 final integration receipt for the exact main merge/head. Production behavior, testing, upstream release authority and historical scientific evidence remain separate.

From a full checkout with historical branch audit/performance-stage-3-10 fetched:

```sh
node scripts/performance-stage311/analyze.mjs
python scripts/performance-stage311/verify-source.py
node scripts/performance-stage311/review-prior-trace.mjs
```

These only read archives/Git objects; they do not run simulation or browsers. Original-evidence commit is pinned, avoiding self-referencing final-report audits. Temporary scientific launch workflow removed; historical YAML outside.github is not permission to execute. **STOP after complete3.11 and the authorized docs integration. No new lot, Stage4/product optimization, upstream PR orVIDA3D.**
