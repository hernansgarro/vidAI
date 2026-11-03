# Stage 3.5 — active Worker throughput and report cadence

Research only. Stage3 remains ONGOING. This batch does not authorize Stage4, a permanent cadence change, merge, publication or another campaign.

## Main results and executive answers

The research-only30→10reports/s cap change has a workload-dependent observed effect. With30starting organisms it raises MAX throughput230.1→243.4ticks/s (+5.78% median; paired +3.58%/+8.13%). With15it changes601.2→595.3(−0.99%; paired −1.58%/−0.34%). There is no demonstrated universal benefit or basis for changing production policy.

Canvas remains about59–60FPS, but fresh authoritative states fall from~22/19.8reports/s to~8.8/8.7for15/30. Repainting a stale state is not extra simulation progress or smooth fresh motion. Human movement smoothness/input-latency acceptance remains untested.

Of the directly timed communication phases, synchronous postMessage is largest (~.4–.7ms/frame); frame construction is~.1ms and replica application typically0–.1ms. At30, cutting reports reduces post-call wall totals by~.74/.93percentage points of Worker wall time. That does not explain the full3.58–8.13% throughput contrast. CPU competition, Worker GC, cache/bandwidth, deserialization and scheduler attribution remain UNKNOWN.

Overhead controls are inconclusive at small-effect precision: full versus lean median+0.92%, adjacent pair signs+3.89%/−2.48%, individual control rates578.6–704.1ticks/s. They do not establish zero overhead.30's repeated positive effect is suggestive; two repeats on a software-rendered CI host cannot establish a stable desktop gain or causal mechanism.

The single most informative next bounded study would be a preregistered30-organism/cap30-versus10 contrast with **separate Worker/main thread CPU and GC attribution**, keeping the same minimal observer profile, reporting both a lean throughput control and a separate profiled diagnostic. Do not run it automatically. Essential optics/index/allocation, articulated contacts and recurrent neural/learning work retain the strongest historical coarse evidence; this study does not newly split their costs. Tube crossings remain a separate unresolved workload.

Median [minimum, maximum], two reversed-order windows per configuration. All eight use MAX, caustics OFF, no selection/tracking, full physics/biology and a fixed disconnected topology.

| Starting organisms | Cap30 ticks/s | Cap10 ticks/s | Relative medians | Paired changes |
| ---: | ---: | ---: | ---: | --- |
| 15 | 601.2 [572.0, 630.4] | 595.3 [570.1, 620.5] | -0.99% | -1.58% / -0.34% |
| 30 | 230.1 [222.4, 237.8] | 243.4 [240.5, 246.3] | 5.78% | 3.58% / 8.13% |

Achieved multipliers are10.02→9.92x for15 and3.83→4.06x for30. These are measured progress, not requested MAX or FPS. The cap intervention was effective:15sent221/220versus88/88reports per window;30sent199/198versus87/87. Effective report rates are21.99→8.79/s and19.81→8.69/s. No eligible send was skipped for an outstanding frame in these primary windows; cadence-skipped pumps were counted separately. ACK counts differ from sends by at most one at an edge. ACK medians remain~9.3–9.5ms at15and10.9–11.6ms at30. The ACK roundtrip includes time until the Worker next handles its message, not pure IPC latency.

Worker ticks consume roughly96–98% of measured Worker wall time; this is a wall-time attribution, NOT CPU utilization, and overlaps preemption/GC. Median batches~8.8–8.9ms at15and10–10.3ms at30complete5–6and2–3ticks. MAX_BATCH_TICKS256is never approached. Yield-gap medians round to0at the0.1ms timer resolution, with recorded upper tails; summing these gaps is not an OS scheduler/wait measure. Median send-start-to-main-receipt is~4.8–8.3ms and includes synchronous clone/enqueue plus main dispatch delay. Warm JSON payload estimates~183–191KB at15and~297–299KB at30are not actual structured-clone sizes.

Canvas RAF medians remain~16.7ms, with~59–60FPS in every primary configuration; measured callback medians~10.1–13.3ms. No >50ms main long-task entry was recorded within the primary boundaries; absence of that event is not evidence of no GC or no CPU contention. No subjective visual campaign was run. Reducing fresh-state cadence roughly doubles the time between updates despite unchanged repaint FPS, so visible motion fidelity/latency is still a real trade-off.

Starting inventories:15/30organisms,81/162parts,39/78eyes (195/390rays),360/720hidden neurons,275food,0eggs,28stored caustics whose drawing is OFF. All30organism windows end30/162with279–281food and0eggs. Early15windows end16/87with285–286food; reversed late15windows end15/81with286food and1egg. New IDs present:1/1inP01/P02and0inP07/P08; no initial ID is absent. These net indicators do not reconstruct transient birth/death totals.

## Required findings register

| Stable ID | Tested mechanism | Measured evidence / effect and variability | Classification | Confidence / relevance and next measurement |
| --- | --- | --- | --- | --- |
| S2-09 | Lower reporting cap raises active throughput |30:+5.78%, paired+3.58/+8.13%;15:−.99%, paired−1.58/−.34% | PLAUSIBLE workload-dependent benefit; universal benefit REFUTED IN TESTED SCOPE | Moderate within paired30observations; low for general causal gain. Separate CPU/GC-attributed30contrast is most informative next. |
| S2-09 | Frame construction and native send are direct costs | Build~.1ms; post~.4–.7ms;30post totals1.32/1.51%→.58/.59%wall | CONFIRMED measured costs | High timers/receipts, medium coarse attribution. Removable cost and remainder UNKNOWN; do not equate native call wall with CPU or all IPC. |
| S2-09/S2-12 | ACK backpressure blocks simulation progress |199/198reports versus2381/2229ticks at30/cap30; no outstanding skips; all ticks complete independently | REFUTED IN TESTED SCOPE | High for this policy/workload. Existing one-frame backpressure remains intact and is not the observed limiting skip here. |
| S2-12 | Lower state cadence necessarily lowers Canvas FPS | All primary59–60FPS despite state cadence~22/20→8.8/8.7 | REFUTED IN TESTED SCOPE | High counts, no human visual acceptance. FPS does not measure freshness/motion smoothness. |
| S2-09/S2-12 | Diagnostic overhead is small enough to interpret sub-percent changes | Lean635.54vsfull641.36TPS(+.92%); pairs+3.89/−2.48%, control range578.6–704.1 | UNKNOWN | ABBA controls cannot bound small overhead or cap/population interactions;15effect is below demonstrated resolution. |
| S2-12 | CPU, memory, GC or cache contention explains the30gain | Lower native send wall; some tick-wall distributions improve; no per-thread CPU/Worker GC trace | UNKNOWN | No causal attribution from TPS/FPS/heap. Proposed separate trace above. |
| S2-12 | MAX256tick ceiling or mandatory ACK wait constrains this workload | Batch5–6ticks at15and2–3at30; median gaps0within timer resolution | REFUTED IN TESTED SCOPE for256ceiling; other scheduling cause UNKNOWN | High batch evidence; scheduler/preemption requires direct trace. |
| S2-01/03/05 | New subsystem-specific bottleneck confirmed in3.5 | Whole-tick scaling only; older coarse essential costs retained below | UNKNOWN for new attribution | No subphase/profiling campaign was executed; existing evidence motivates later controlled work. |
| S2-08 | Tubes/crossings materially constrain active throughput | Primary topology disconnected; previous tube evidence has0crossings | UNKNOWN | No Stage3.5tube experiment; bounded physical crossing follow-up described below. |

Measured communication wall reductions are **not estimated removable percentages**. No standalone serialization byte/time, guaranteed CPU recovery or permanent end-to-end speedup is established.

## Environment, validation and outcomes

Measured source40d7467cdc628429f434f5105d83f8f7220d81f7, baseeff9034. Intel Xeon6973P-C,4reported logical CPUs, Linux7.0.0-1017-azure/x64, Node24.22.1, Chromium145.0.7632.6, Playwright1.58.2. os.totalmem=16,759,308,288bytes; cgroup reports memory.max=maxandcpu.max='max100000', so no explicit tighter cgroup ceiling was observed (not a dedicated-host guarantee). Actual graphics are ANGLE/SwiftShader, software Canvas/raster/compositor; physical GPU performance remains unmeasured. Viewport1280×850,DPR1, source-default camera center(1200,750),zoom.85,no pointer/camera/tracking input; an independent camera transform telemetry trace was not collected.

The120tick15organism baseline browser host and four actual-Worker cap/mode controls match full stateSHA256 cde30a6f0a24837d64acfae5968626d289a2d5b1f6e95cddbd90fc1bca60aa2e, exact PRNG and accounted energy1,074,269.9999999988J versusbudget1,074,270J. Same initial state hash verified before every timed window. Different equal-wall endpoints are allowed.

[Scientific run41664520289](https://github.com/hernansgarro/vidAI/actions/runs/41664520289), job126016168511, succeeded: npmci,385/385fast(no failures), build/typecheck, actual production Worker regressions and focused Chromium readiness/pilot/12windows. No inherited test was edited, skipped or weakened. No Firefox research campaign was executed. [Independent analysis-only verification41665757852](https://github.com/hernansgarro/vidAI/actions/runs/41665757852), job126020482154, succeeded without starting a browser or Worker. Archive SHA256/lengths, tick equations and starting hashes passed; all18original scientific/summary Git blob pointers and lengths were read back against preservation logs. The original summary is retained even though its redundant layout data are large; compact window-summary.json is easier to inspect.

No setup failure, timed failure, lost outcome or rerun occurred in3.5. Eight primary +four overhead controls exactly; active173.099s<360s, runner216.442s<600s, readiness53.703safter the first clock step<600s, whole Actions run~5min10s<18min. Container initialization precedes that first setup clock but is bounded by the whole-job timeout. Scientific archives11,800,912bytes(~11.25MiB)<48MiB; even including original3.36MBsummary/derived files the total is below48MiB. Missing directCPU/GC attribution, subjective smoothness and exact transient birth/death counts are explicitly incomplete observations, not failed/replaced windows.

Fork/main does not contain the cumulative Stage3dashboard because historical research PRs remain unmerged. This branch copies the latest PR69dashboard, resolves its3.4links to immutable44f847dand appends this batch, preserving all historical numbers/results. Historical drafts#66/#69and evidence are unchanged. The dedicated measurement workflow is removed after its sole execution; its exact YAML is retained as a reproduction artifact outside .github. No scientific execution is wired into normal validation.


## Measurement validity and source
The exact runtime is fork main eff903441bf6e914809345aeb44d5b1461c8c745; measurement source and environment are in manifest.json.gz and summary.json. Only an explicitly invoked Vite plugin changes research bundles. Original Worker, SimulationHost, client, App, package/lock and inherited tests/workflows remain unchanged; the added workflow is research-only, with no Pages/deployment jobs.
The primary metric uses completed authoritative ticks / Worker-clock interval between the real MAX control and the end message, recorded before export. Import, startup and final snapshot serialization are excluded. simTime independently verifies ticks. Main-frame sample boundaries are filtered to the same absolute time interval using performance.timeOrigin; pure queue, deserialization and scheduling time are not individually isolated.

## Limits that must be stated
Two reversed-order repetitions per configuration describe this fixed checkpoint/runner; they are not independent population-level confidence bounds. Across populations, anatomy, genetics and placement differ, so the scaling contrast is not a pure count coefficient. Equal wall-clock endpoints may have different ecology because more ticks were completed. Instrumentation overhead controls use the same lean boundary protocol and browser wrappers in both variants; they cannot establish zero total observer overhead or price interactions with every population/cap.

Worker per-thread CPU, main CPU, compositor CPU, Worker heap/GC, cache/bandwidth and host thermal/background contention remain UNKNOWN. Main heap is sampled after final export and is contaminated by controller/snapshot allocations; it is not retained-memory or GC evidence. Native postMessage includes synchronous clone/enqueue effects; it is not total communication CPU or actual structured-clone byte size. Warm payload UTF8 JSON estimates are not transport bytes.

Full initial checkpoints are stored once with state/PRNG hashes. A matched120tick pilot verifies complete authoritative state, settings, PRNG and total energy. Timed endpoints are preserved as hashes and inventories rather than repeated full snapshots; this keeps scientific evidence under48MiB. Exact births/deaths counters were not included in the endpoint inventory: new IDs still present and missing initial IDs are net endpoint indicators, not complete birth/death totals. Treat transient births/deaths between endpoints as UNKNOWN; do not infer them from those net counts.

## Other essential work: suspicions retained, not newly confirmed
| Stable ID | Path and growth | Supporting evidence | Work class | Distinguishing bounded measurement |
| --- | --- | --- | --- | --- |
| S2-01 | simulation.ts articulated four-substep solve and contacts.ts repeated broad/narrowphase, up to8contact passes and10joint iterations | Historical Stage3.1 coarse physics/contact27–38.8% in15/30founders; current batch only whole ticks | Essential physics; reusable scratch potential unmeasured | At fixed logical ticks sample candidate counts/actual iterations and coarse contact vs joint solve without changing equations/order |
| S2-02 | mass/inertia and geometry in each substep/contact consumer | Historical3.3b substep fill~.54/.65% sampled ticks, contact consumers previously undercounted; no production-cache gain | Mixture of essential geometry and possible redundant derivation | Matched end-to-end exact cache prototype only under separate authorization; do not infer gain from isolated arithmetic |
| S2-03 | optical world index construction, ordered ray corridor candidates and exact intersections | Historical3.1 optics+update34–40.5%; current15/30checkpoint eyes/parts co-vary | Essential sensing plus possible redundant indexing/allocations | Fixed-state coarse index/query/intersection split with unchanged rays, order and full-state replay |
| S2-05 | recurrent input/hidden/output sums, lifetime learning and somatic buffers | Historical3.1 neural+learning18.8–26.9%; existing compiled topology cache already present | Essential neural/learning computation | Inference vs learning timers/allocation samples at matched logical ticks, without disabling either |
| S2-04 | oral prey/egg/food indices and exact post-movement contact queries | Historical candidates<1% of full food scan; dense cases unresolved | Essential actual feeding, possible rebuild redundancy | Dense food/mouth fixture with exact absorbed-J/order checks and rebuild counts |
| S2-06/07 | nutrient decay/expiry scans, funded incubation/hatching/lineage and body-clearance tests | Historical ecology~.8–3%, hatch-rich loads insufficient | Essential ecology; repeated counts possible | Authorized mineralization/hatch-burst fixed fixture, preserve grants/IDs/PRNG and state |
| S2-10/12 | energy collector per-active-ID organism search; UI stats/replica/RAF | Historical collector .11–1.64% classified samples; cadence study addresses unavoidable observer interaction | Observer-only bookkeeping fed by truthful physical receipts | Separate receipt aggregation from replica/RAF while keeping real energy accounting unchanged |

Historical percentages use different source/Node fixtures and are not current CPU shares, removable budgets or additive end-to-end predictions. Static complexity alone confirms no new bottleneck. No permanent optimization is recommended from isolated microbenchmarks.

## Connected tubes and off-camera coverage
The primary topology is fixed disconnected; all organisms continue simulating outside the viewport. Historical Stage3.1 tube fixture measured roughly1200wall queries/tick but zero organism crossings. selfTubes.ts caches topology geometry, still sorts boundary runs/constructs rectangles in wall queries and clones living state at actual crossing; simulation.ts creates a previous-x map when tubes are active. Near-wall articulated populations, crossing frequency, particles and geometry runs can grow those costs. These remain PLAUSIBLE, not a confirmed active throughput bottleneck. A useful later bounded tube study would compare matched biology in disconnected/open-local topology, with genuinely physical off-camera residents/crossings and exact ID/PRNG/energy/learned-state validation. No tube windows were executed in3.5.

## Reproduction
Read protocol.md first. The original experiment must not be rerun merely to regenerate the report. After explicit authorization and a new evidence path/budget, use npm ci, npm run test:fast, npm run build, npm run test:worker, and the explicit Playwright configuration in scripts/performance-stage35/measurement.config.mjs with the pinned1.58.2 Chromium container. Existing archives cause a deliberate no-overwrite failure. Ordinary production builds do not activate the cap override.
Analysis alone: node scripts/performance-stage35/analyze.mjs reads original archives, verifies SHA256/byte counts/tick equations/starting equality and regenerates quantitative-findings.json and verification.json without simulation.
