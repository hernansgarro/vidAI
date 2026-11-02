# VIDA 2D performance audit — Stage 1, v1 (2026-11-02)

**Contributor-fork evidence. Stage 1 complete; STOP for Hernan's review. Stages 2–4 have not started.** No optimization, production instrumentation, baseline repair or upstream submission was performed. [Fork PR #61](https://github.com/hernansgarro/vidAI/pull/61). Scope: [approved audit plan](../../PERFORMANCE_AUDIT_PLAN.md), IDEA-023; existing shared references [upstream #67](https://github.com/smeagol44/vidAI/issues/67), [#57](https://github.com/smeagol44/vidAI/issues/57), [#62](https://github.com/smeagol44/vidAI/issues/62). No issue was created and no upstream priority/status was changed.

## 1. Executive summary

The existing tools establish a reproducible **legacy-settings kernel reference**, production-Worker correctness and a few bounded observer checks. They **do not establish the cause of Hernan's excessive CPU usage or glow-correlated slowdown**. That report remains a valid observation requiring better targeted evidence.

- Three independent `benchmark:performance` processes produced six 120-tick windows: **353–486 ms**, descriptive median **430 ms**, approximately **3.583 ms/tick, 279 ticks/s, 4.65x simulated time** at that median duration. Full final-state equality is asserted between the two rounds within each process. This is Node, paid-work-v2/open economy, 15 creatures/78 food/221 carrion, **not the current application defaults**, a populated browser Worker, or FPS.
- The existing alternating `--baseline` mechanism passed complete-state equality against a revision with **identical runtime code**. It still produced apparent ratios of **1.23x then 0.76x**, warning against treating short timing differences as an optimization effect.
- Three headless runs of 180 ticks (3 simulated seconds) took **1.039–1.128 s per process**. Median 1.099s gives about **164 ticks/s / 2.73x**, including Node/npm startup, TypeScript loading, JIT, initialization and output. Final ecology summaries agree; no full cross-process snapshot comparison is emitted.
- **41/41 focused tests**, build and the actual production-Worker harness passed. The Worker harness separately printed **4922.6x / 256256 ticks in an empty world**. That is a short capacity/pacing smoke, not realistic populated throughput. The complete harness's14.22s duration cannot be divided by those ticks to estimate Worker speed.
- The frozen v0.31 CPU profiler failed its **first** state hash. Component microbenchmarks failed before any timed loop, at the initial lineage-count assertion. Neither yielded usable subsystem timing. Failures are retained; references/source were not altered.
- Chromium installation failed on truncated archives. No browser/fallback/FPS/interaction-latency/visual-glow measurement ran. No current bottleneck ranking or optimization recommendation is justified.

[Raw evidence](raw/), [registered protocol and disclosed addenda](protocol.md), [machine-readable summary](summary.json), [kernel CSV](kernel-results.csv).

## 2. Target, provenance and registered protocol

| Item | Actual record |
| --- | --- |
| Measured runtime | `hernansgarro/vidAI` main pinned at `3c737ac1bbf678915ebd945b6b5db8781a48831b`, v0.39.0 |
| Canonical upstream main | `041362eefa64971d9038f4ad7ec4fd59a747d3ec`, already an ancestor; no synchronization needed |
| Topic branch | `audit/performance-stage-1-2026-11-02` |
| Protocol preregistration | Remote commit `0281d00a751f1d6e5fc9f735a4d0d274a719199a`, draft forkPR61 before measurements |
| Identical-code control | `e9662a6ef5307a3349ea1338489d755a1879c8b9`; all intervening changes are Markdown |
| Concurrent main advance | `e25e1af44d94f78f654502c2f5341fb02de7a978`, three Markdown files only; added IDEA-024 reviewed. Target retained; no runtime difference |
| Working tree | Initially clean. Only report/protocol/raw evidence added; source remains exact target code |
| Tracking/publication | Fork PR only, left open; no merge, Pages/Wiki publication, upstream write or testing change |

[Environment](raw/environment.txt) and [provenance](raw/provenance.json) preserve refs, source SHA256 values, package versions and built Worker hash. GitHub authenticates as `hernansgarro`. Repository rulesets returned `[]`; branch-protection read returned403 (integration lacks administrative access), and the branch-rules endpoint is unsupported. This is not proof there are no other protection settings. The normal topic-branch/PR path was retained. HTTPS git push lacked credentials; the GitHub connector publishes evidence. Local original protocol commit99a2532 and remote protocol0281d00 differ in publication history; the latter is the public preregistration receipt.

The protocol fixed seed/fixture/order,10warmup+120timed ticks, three independent kernel processes, one alternating control, three 3s headless processes, one profiler attempt, one component attempt, one focused test invocation, one production Worker harness and conditional two browser cases. Each command had a timeout. No outlier was excluded; no failed scientific trial was replaced. The benchmark series stopped after the component failure; only already scheduled correctness validation and the single permitted browser-install attempt followed.

`/usr/bin/time` was absent: a wrapper failed **before launching any benchmark**. The [setup error](raw/timer-setup-error.txt) and protocol addendum disclose using Python monotonic wall time and `os.wait4` resource usage instead. The Worker harness actually prints its empty-MAX speed; this corrects the protocol's preliminary description that it only asserts a threshold. No source or measured output was changed to obtain that value.

## 3. Actual execution environment and budget

Linux Ubuntu 24.04.3 LTS, x86_64, KVM virtual machine. Exposed CPU: AMD EPYC9V74 80-Core Processor, **9 online logical CPUs**, cgroup quota **8 CPU equivalents**. Host-visible RAM9967MiB; process environment cgroup memory limit8GiB, no swap. Physical host topology, CPU frequency policy, power/thermal conditions and contention are unknown. No CPU pinning, thermal stabilization or hardware-GPU characterization was performed. This is **not Hernan's Windows desktop**, and these numbers do not predict his performance.

Node **v24.22.1**, npm **11.9.0**, tsx4.23.15, TypeScript7.0.2, Vite8.3.4, React18.3.1, Playwright1.58.2. `npm ci` installed113packages; build/typecheck passed (existing chunk-size warning retained). Chromium target145.0.7632.6/v1208 was **not successfully installed or executed**. Browser version actually run, viewport, physical screen, DPR, camera zoom/pan, document visibility and GPU mode: **not measured / not applicable to Node trials**.

Commands ran sequentially with no intentional simultaneous benchmark work. The focused Node test runner itself schedules files concurrently; its test and microcheck durations are not isolated CPU benchmarks. No GPU/browser campaign or CI dispatch occurred. Simulation/benchmark command process wall sum11.87s; focused tests0.99s; production Worker14.22s; failed Chromium installation27.40s. Measurement/validation records span about77s including orchestration gaps, comfortably within the20min cumulative-command and30min active-campaign budget. Dependency setup/build happened beforehand (install about11s, build command about several seconds); documentation/publication is outside the campaign. No timeout or resource exhaustion occurred. The one Playwright install invocation performed five internal download attempts; no manual retry was made.

## 4. Existing-tool inventory and scientific meaning

All source references here are the unchanged files on the pinned runtime; this is tool/fixture inspection, **not Stage 2 static algorithm analysis**.

| Tool / source | Measures or outputs | Assertions / workload | What it cannot establish; execution |
| --- | --- | --- | --- |
| [`benchmark:performance`](../../../scripts/performance-benchmark.ts) | `performance.now()` elapsed kernel-loop ms, rounded to integer; derived tick rate possible | Seed82;15balanced standard creatures;78plant/221carrion;2400x1500;10warmup then120ticks, two restored rounds; full final snapshot state comparison | No Worker, event collector, IPC, Canvas, React, CPU%, memory trend or FPS; three independent processes passed |
| Same script `--baseline` | Alternating baseline/current then current/baseline timings from one checkpoint | Both restores/steps, full final-state assertion; current serializer used for final states | Scientific comparability must be established first. Identical-code control passed; no measured optimization. Old workflow baseline03a4802 not used for current-state ranking |
| [`benchmark`](../../../scripts/benchmark.ts) | Ecology summary at end/every60simulated seconds; no internal wall timer | Default seed4242,18initial animals/275food;60Hz; finite state, nonnegative reserve and ledger tolerance. Duration default60s, supported0–3600s | Defaults paid-work-v2/open, not app's closed-v1/v3/decay-v2; external wall includes process overhead. Three3s runs executed |
| [`benchmark:behavior`](../../../scripts/behavior-benchmark.ts) | Movement, motor/metabolic heat, speed, founder finite state, paired sighted/blind intake estimate | Seven10s isolated controls,55catalogue designs15s each; two founders x8seeds x2vision conditions x30s,12000x12000, no reproduction | Behavioral/energy assay, not CPU/FPS, current ecosystem or causal glow assay. Inspected, not run |
| [`benchmark:ecology`](../../../scripts/ecology-baseline.ts), [`ecologyBaseline.ts`](../../../ecologyBaseline.ts) | Actual observed intake, survival/death, reserve/eggs, food-distribution/acquisition outcomes | Seeds17/29/41; unassisted food/no-food pairs, controlled grazing, initially funded adults, depleted cohorts; nine-founder acquisition/showcase400food | Observer sampling overhead; scientific outcomes, no wall timer. Event slots limit comprehensive intake accounting. Inspected, not run; no ecological campaign repeated |
| [`profile-performance.mjs`](../../../scripts/profile-performance.mjs) | Inspector CPU samples at requested500us interval;120ticks after20warmup; nearest matching ancestor categories, top self samples, kernel line ticks, elapsed ms | Seed711; legacy-v0; four synthetic founders15/gen2-30/blocked75eggs/gen6-34 fixtures, pinned catalogue genes/phases and full golden hashes | Profiled timings include sampling overhead; no browser/Worker/render attribution. First hash failed; no valid category percentages or comparison file; three later scenarios never reached |
| [`compare-performance.mjs`](../../../scripts/compare-performance.mjs) | Ratios between two profiler JSON files | Scenario count/order and full stateHash equality | Cannot legitimize incompatible worlds or fix missing profiler output. Inspected, skipped because no valid current profile |
| [`benchmark-runtime-components.mjs`](../../../scripts/benchmark-runtime-components.mjs) | Intended100krectangle-contact calls,100klearning-delta calls,300unchanged-lineage frames;2000call/20frame warmups,3alternating rounds | Synthetic96hidden/.8motor+.8sensory learning;10000shared-genome ancestors; exact contacts/deltas and lineage lengths | No end-to-end kernel/UI; same org reused across implementations, narrow synthetic component check. Failed baseline initial frame0!=10000 **before all timed loops**; no microbenchmark results |
| [`performance-runtime.test.ts`](../../../tests/performance-runtime.test.ts) | Pass/fail; test-runner durations | Four v0.30 state goldens through explicit oral-field projection; mask invalidation, live weights, learning-record reuse/cold saves,4000contacts, commands, transport/lineage | Test duration includes assertions/fixtures; no per-phase CPU efficiency. Passed in focused41 |
| [`simulation-performance.test.ts`](../../../tests/simulation-performance.test.ts) | Pulse/color/throughput-meter logic | Synthetic cumulative sim/wall times; smoothing, stale/reset clocks, pause/MAX | Mathematical/UX correctness, no actual throughput or CPU observation. Passed |
| [`worker-pacing.test.ts`](../../../tests/worker-pacing.test.ts) | Scheduler function expectations | Synthetic20ms tick example, debt/yield, finite pacing, MAX, paused delay | Its50ticks/s example is stipulated arithmetic, not measured runtime. Passed |
| [`spatial-index.test.ts`](../../../tests/spatial-index.test.ts) | Candidate coverage/order, rectangle hit/reversal/boundary behavior | Seed715;240rectangles/250rays; oversized/point/tie/default-save cases | Conservative correctness; no elapsed speedup. Passed |
| [`sight-broadphase.test.ts`](../../../tests/sight-broadphase.test.ts) | Stable exact ray hits; candidate total asserted below50% full scan in one fixture | Seed107;380food+oversized carrion/240rays;20organisms+200food+180carrion,8ticks+continuation, energy/finite snapshots | Candidate reduction is not wall-time acceleration or viewport-dependent simulation. Passed |
| [`energy-activity.test.ts`](../../../tests/energy-activity.test.ts) | Real receipt/collector/presentation behavior; one printed microcheck timer | Actual feeding kinds, segment loss, full saved optical/neural/PRNG equality, fake Canvas stroke assertions, pause/hysteresis;6000single-org collector ticks/3000frames | Mock drawing does not measure rasterization; one unpaired6.22ms collector microcheck excludes feeding physics/IPC/Canvas/GC attribution and is not a scaling bound. Passed |
| [`test:worker`](../../../scripts/check-worker.mjs) | Real built Worker under node:worker_threads, browser port adapted; emptyMAX elapsed speed printed | Commands between ticks; open/closed/all physics/mouth/tube/nutrient/Pipe/activity/reset/x0; direct-state replay;200ms intentional parent stall; MAX256tick/8msyield rules | Not actual browser runtime; most scenarios yield pass/fail rather than timings. One populatedMAX equivalence check, not representative population-speed distribution. Passed once |
| [`diagnosticReport`](../../../persistence.ts), [`diagnostics.ts`](../../../diagnostics.ts), Worker snapshot protocol | Authoritative settings/PRNG/counts, chemical/motor/learning details; isolated production correctness suite | Exact state requests; selected-organism details. Isolated diagnostics own worlds/yield chunks | Joules and motor work are simulated energy, **not electrical CPU consumption**; no current per-subsystem wall profile/CPU utilization. Not executed beyond Worker snapshot coverage |
| [`e2e/performance-worker.spec.ts`](../../../e2e/performance-worker.spec.ts), [`energy-activity.spec.ts`](../../../e2e/energy-activity.spec.ts), [`presentation.spec.ts`](../../../e2e/presentation.spec.ts) | Worker URLs/state exports,200ms parent stall, glow path/phase/paint recording, toolbar/layout, fallback/0/MAX | Existing snapshot uploads/downloads, DOM/Canvas hooks, some controlled clocks, multiple viewports/DPR | Assertions and clock-controlled tests are not FPS/latency profiles. Test hooks can alter observer cost. No browser case ran here |
| [`simulationPerformance.ts`](../../../simulationPerformance.ts), App toolbar / [`simulation.worker.ts`](../../../simulation.worker.ts) | Live authoritative sim-time/wall-time ratio; display frame counts and delivered tick counts |250ms throughput window,350ms smoothing,1.25s stale timeout; telemetry about4/s; Worker frame cap30/s/one in flight; paint separate | Requested1/2/5/10/20 is not achieved speed. Display loop counts are not GPU timings or latency quantiles; smoothing/frame delivery affects readings. Not observed live |
| `.github/workflows/performance-profile.yml` / `performance-worker.yml` | Existing optional historical profiler/comparison and builtWorker/browser shards | Profile pinned03a4802, conditional branch/dispatch; browser aggregate requires shards | Not automatically current-compatible. No CI dispatch or gate modification; historical green runs are not this audit's current profile |

Additional existing candidates: `audit:foundation`, `audit:locomotion`, `audit:foraging`, `audit:mechanics`, `audit:mouth-contact`, `audit:solver`, `scripts/audit-closed-energy.ts`, nutrient-cycle audits and baseline-continuation scripts. Their entry points report physical movement/work/energy/contact/feeding or exact snapshots, rather than standard subsystem CPU budgets. They can guard semantics in a later authorized study, but were **not run or assumed current-compatible** here. `search:locomotion` is an evolutionary search, not an efficiency benchmark; excluded. No stopped protocol or historical selection was reopened.

### Golden hashes and comparison compatibility

The [profiler failure](raw/profiler.stderr) was the first `founders-15` scenario: expected `de3c9130159af23590db2b385c2d11c338f2882f5e64f0eb4c756db4fa71b672`; actual `f54de46652a30c7c11a52db0282cd8ec0e7c9eea68c5451e1036bbfc9b1fe00f`. Complete v0.31 continuation is **not certified by this profiler on current main**. The script collects samples then asserts before printing/writing: no validated profile JSON was emitted. The cause is not diagnosed in Stage1. Current mouth serialization is a known representation change, and the separate runtime tests already use an explicit `legacyMouthState` projection; that does **not** prove that projecting this different profiler fixture would restore scientific equivalence. No projection, golden refresh or fix was attempted.

The [component failure](raw/components.stderr) is `0 !== 10000` at line38, baseline first `host.frame().lineage.length`. Even identical runtime files in two checkouts do not guarantee a compatible module/observer context; whether cross-checkout lineage registration explains this belongs to a later review. It does not prove production loses lineage, and no contact/learning/lineage timings were produced.

Historical status sections v0.31–0.32 report kernel sampling/components and an old egg-clearance cost. They remain historical evidence under different semantics/hardware, **not a present bottleneck ranking**. The retained profiler workflow's historical baseline was not silently reinterpreted as v0.39+.

## 5. Benchmark commands and raw results

All invocation/exit/time/resource records: [executions.json](raw/executions.json), [validation-executions.json](raw/validation-executions.json). Raw stdout/stderr are separate, including empty output files. Derived summaries do not replace them.

### Kernel, three independent processes

`npm run benchmark:performance` — seed82, settings as registered. The script's printed counts are fixture labels, not final inventory samples. It times only120calls to `stepSimulation`, excluding restore/warmup/final snapshot/assert/output. Observer callbacks are not supplied; it does not execute production collector/frame/render work. Full-state equality within a process excludes unchanged settings metadata, and only round2 can compare against round1's reference. No full snapshot hash is emitted for cross-process equality.

| Process | Round |120ticks ms | ms/tick | ticks/s | simulated-time multiplier |
| --- | ---: | ---: | ---: | ---: | ---: |
|1|1|441|3.675|272.11|4.535x|
|1|2|418|3.483|287.08|4.785x|
|2|1|419|3.492|286.40|4.773x|
|2|2|486|4.050|246.91|4.115x|
|3|1|456|3.800|263.16|4.386x|
|3|2|353|2.942|339.94|5.666x|

Descriptive six-window median 430ms, range353–486, populationSD41.07ms. **Only three independent processes**, not six independent trials. First-round median 441ms/SD15.20; second-round median 418ms/SD54.30. Per-process mean durations429.5/452.5/404.5ms; median429.5ms, populationSD19.60. Separate round results show warmup/JIT/order effects are not reliably eliminated by10ticks. There is no prespecified reason to discard the486ms or353ms result; both remain.

Formula for120ticks and Mms: `ms/tick=M/120`, `ticks/s=120000/M`, `speed=2000/M`. Integer rounding introduces about±0.5ms/window uncertainty. Median-derived4.65x describes this timed fixture only. It is not a selected browser speed mode or a sustainable5x guarantee.

### Identical-code positive control

`npm run benchmark:performance -- --baseline ../performance-baseline`

| Order | Baseline e9662a6 ms | Current3c737ac ms | baseline/current duration ratio |
| --- | ---: | ---: | ---: |
|Baseline then current|451|366|1.232x|
|Current then baseline|296|390|0.759x|

All final states passed equality. The two runtime trees are identical; therefore these differences cannot be claimed as an implementation benefit/regression. Separate imports, JIT/cache state, execution order, GC and host scheduling may influence short windows. This is evidence of noise/confounding, not a measured individual cause. Do not pool this control with the three-process current reference.

### Bounded headless process timing

`npm run benchmark -- --seed 4242 --seconds 3`

| Process | Wall s | User CPU s | System CPU s | Max RSS KiB |180ticks/wall ticks/s |3sim seconds/wall |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
|1|1.127963|1.753703|0.155423|183996|159.58|2.660x|
|2|1.038610|1.795397|0.161168|165032|173.31|2.888x|
|3|1.099247|1.812274|0.175137|161564|163.75|2.729x|

Median wall 1.099247s; populationSD0.037246s. Wall-equivalent duration/tick5.77–6.27ms includes startup/initialization/output, so it is **not kernel ms/tick** or directly comparable to the other fixture. All three emitted18living,18cumulative births (includes initialization),0deaths/eggs/carrion,275nutrients, generation1 and energy error`2.3283064365386963e-9 J`. Three seconds is not ecological viability. CPU accounting includes process/toolchain/helper threads: summed CPU time can exceed wall time. It is neither whole-machine CPU% nor the simulation main thread alone. Maximum resident set is one process-tree resource result, not JS heap/live memory/GC/leak measurement; no memory trend follows from three values.

### Actual production Worker and observer microcheck

`npm run test:worker` passed, process wall14.222581s. Its **empty-world** MAX probe (seed123; v3/closed; no initial organisms/food, no inflow; no rendering) printed4922.6x and256256ticks. Approximate equivalents:295356ticks/s and0.003386ms/tick from the rounded multiplier. The **actual elapsed interval is not printed**; it includes send/pacing/pause/snapshot response, a150ms scheduled parent delay that is not the guaranteed elapsed interval, and current VM scheduling. One observation, no representative steady-state warmup/repetition. The direct replay of those ticks occurs outside the measured interval. Finite1x/5x checks are intentionally paced and cannot establish uncapped capacity. PopulatedMAX checks establish equality only.

The focused activity test printed **6.22ms for6000synthetic one-organism collector updates/3000frames**, no physical simulation or drawing. It ran once among concurrent test files, with no repeated paired control, and must not be extrapolated linearly to high populations or interpreted as proof glow is cheap.

## 6. Reliability, comparability and evidence classification

| Conclusion | Classification | Basis / limit |
| --- | --- | --- |
|This fixed15/78/221 Node kernel completes faster than1x here|Confirmed for these windows|246.91–339.94ticks/s with within-process exact-state assertion; historical settings |
|Short benchmark differences may be substantial without any code change|Confirmed|Identical-code reversed-order results; individual sources of variation unisolated |
|Headless output summaries repeat across three runs|Confirmed at summary level|Identical outputs; no emitted full-state hashes across processes |
|Worker continues independently and preserves tested exact states|Confirmed in Node production-bundle harness|Includes deliberately stalled parent, pause, control regimes, activity, tubes/Pipe; browser scheduling is separate |
|Activity metadata preserves tested physical/optical/neural/PRNG state|Confirmed, bounded|Focused tests and actualWorker direct comparison; not a cost comparison |
|Current v0.31 profiler/component tools are immediately usable|Refuted for these invocations|Hash mismatch and initial lineage assertion; no baselines changed |
|JIT/GC/VM scheduling contributed to noise|Suggestive, unisolated|Plausible influences; no GC/scheduler trace identifies their shares |
|Glow causes Hernan's slowdown or dominates CPU|Unsupported by current measurements|No equivalent-state drawing-on/off comparison or browser CPU profile |
|Rendering or message passing is cheap because kernel is fast|Unsupported|Those costs excluded from kernel loop |
|100organisms/1000parts sustains real time|Not measured|Current anatomy cap7parts; existing target is an ambition, not delivered capacity |
|BrowserFPS, input latency, main-thread CPU, Worker phaseCPU, GPU cost, memory retention/GC|Not measured|Browser install failed; no approved targeted instrumentation |

Timings are short, fixed-seed, one VM session, one world trajectory per fixture, small n, no confidence intervals, no long-duration tail statistics or hardware replication. Assertions verify covered state invariants, not speed, global ecological quality or universal compatibility. Profile overhead is irrelevant to unprofiled numbers but would affect any accepted future profile. No successful sample percentage exists in this campaign. The lower limit of measured headless kernel performance is not a reported desktop regression; the user slowdown is **not reproduced or disproved** by this environment.

## 7. Glow hypothesis: what existing evidence can separate

| Layer | Existing capability / Stage1 evidence | Remaining uncertainty |
| --- | --- | --- |
|Actual feeding/energy transfers|Physical contact/intake tests, primitive receipt fixtures, exact energy/PRNG continuation pass|No feeding-only CPU contribution measured; more feeding can correlate with denser/older worlds |
|Observer event metadata|Collector/presentation tests, exact observer-free vs observed saved state;6.22ms isolated microcheck|No paired populated throughput comparison, event rate/payload/count scaling or GC attribution |
|Glow drawing/compositing|MockCanvas tests verify five translucent contour widths/colors/path; Wiki says no shadowBlur/filter; existing browser hooks available|No actual raster/composite time, pixel/DPR/zoom/overlap cost, GPU or FPS measurement |
|Worker simulation|Kernel reference and builtWorker invariants pass|Kernel reference omits collector/transport; no populated current-appMAX capacity measurement |
|Main-thread rendering|Existing toolbar FPS and real-world Canvas test facilities|No measured paint budget, input delay or paused-renderCPU |
|Message passing/React/GC|Genome/lineage/selected diagnostics correctness tests; bounded frame protocol described|No cloned bytes, transfer/apply latency, React duration, allocation/heap or GC breakdown |

There is no supported existing equivalent-state UI toggle independently disabling **only** energy contour drawing in this inspected test/control set. Body/scene changes, removing food, blinding a creature, pausing physics or comparing different worlds would confound a causal glow test. Existing no-callback vs observer-callback correctness comparisons safely protect state, but contain no repeated paired timing for the complete pipeline. Disabling real energy transfer/signaling would change the feature and is excluded. No such change was made.

## 8. Present and future workload coverage

| Dimension | Existing executable coverage | Actual Stage1 measurement and gap |
| --- | --- | --- |
|Default|App preset18organisms/275food, v3/closed/decay-v2; scenario/Worker fixtures|Timing uses DEFAULT_SETTINGS paid-v2/open, **not app preset**. App defaults verified by source, not benchmarked |
|Harsh|4800x3000,gravity20,viscosity.4,50cap,1/srecycling,200foodlimit; initial food banked|Worker small2-organism continuation passed, no preset capacity timing |
|Pipe|Independent4600x2100 recipe, same listed Harsh initial settings, zero automatic links|Worker2-organism/unbiased edited-settings continuation passed; no populated timing. Larger/sparser world alone cannot establish greater cost |
|Population/body complexity|15timed;18headless;20/200/180 correctness; old profiler15/30/34synthetic; learning tests and elsewhere100-organism bounded mechanisms|No current independent5/15/30/100 population series, segments/joints/eyes distribution not printed by kernel benchmark; no1000-part result. A cap is not an observed count |
|Neural complexity/learning|Masked edge path in kernel; runtime goldens/plain/masked/learning; intended96hidden component fixture|No successful independent neural-size/learning-rate timing. Golden validity remains local to its exact fixture |
|Food/carrion|78/221timing;275food short headless;200/180 correctness; old profiler200–272food/3–180carrion|No current density curve or2200safety-limit stress; observed labels not independent controlled dimensions |
|Eggs/birth/death/lineage|Runtime laying/hatching/death/transport tests; profiler intended75blocked/27eggs; component intended10000ancestors|No egg-heavy timing because profiler failed; no long growth/extinction throughput/GC trend. Headless3s had no new births/deaths |
|Local tubes/offscreen|L/R realWorker transfer/direct continuation, nutrient tank/tube cycle; existing sidewindow/browser fixtures|Correctness passed. No timed tube/visibility/control-density curve; camera culling must not halt simulation |
|Glow/egg/other overlays|Receipt/collector/mockdrawing tests; dedicated e2e; egg observer checks inWorker|No rasterization/on-off control, selected diagnostics/Bank/chart cost or overlay timing |
|Screen/device/zoom|Existing responsive e2e, DPR checks, manual camera controls; ?mainthread fallback|Browser blocked; desktop/mobile/low-powerGPU/DPR/visibility/initial framing not measured |
|Speed modes|0/1/2/5/10/20/MAX supported; pacing/math andWorker pause/1x/5x/MAX checks|Do not combine capped speeds with uncapped kernel capacity or equate0x with zeroUI CPU |

The complete pinned IDEA_LAB and plan matrix were reviewed, plus concurrent IDEA-024. Future implications are **coverage needs, not implemented costs**:

- **IDEA-021** nutrient boundary/contact geometry and **IDEA-022** nutrient-particle collisions are absent as proposed alternatives. No polygon/particle-collision timing exists; current particle motion cannot represent that future workload.
- **IDEA-010/011** remote aquariums/portable living states: local same-world tube tests cover neither networking nor versioned single-organism serialization cost. No latency/disconnect/security/payload claim.
- **IDEA-019/020** notebook/phone worlds: dimensions undecided; world units, physical pixel area, DPR and constrained hardware require separate controls. **IDEA-024** initial zoom/framing is undecided; future comparisons must retain camera center/scale/visible counts as well as world settings.
- **#67** roughly100creatures/1000parts remains unverified; current7part cap means100current creatures are not automatically1000parts. No cap was raised. **#62** moving-fluid dynamics remains deferred/undecided and is not an existing solver benchmark.
- **IDEA-008/009** fractional recycling/named scenarios would change reproducibility and density trajectories; no generated preset or rate implementation here.
- **IDEA-002–007** reproduction/funding/buoyancy/hatching could alter eggs/lifecycle load; preserve current energy rules. This audit did not evaluate their biological design.
- **IDEA-013/014/017** egg/mouth/sidewall layers, **IDEA-015/016/018** compact/phone/toggleUI and completed **IDEA-001/012** Pipe/local agreements identify observer/topology workloads. Present correctness fixtures do not measure their compositing/UI or scaling cost. Completed features were not reimplemented.

## 9. Questions reserved for Stage 2

These are unresolved questions, **not conclusions from a static algorithm audit**:

1. Which exact current app settings/state/counts reproduce the reported slowdown, and which existing fixture can represent that state faithfully?
2. Where do actual energy-transfer accounting, observer receipt collection, transport, replica application and contour drawing occur, and what frequencies/state sizes link them?
3. What changed between the profiler's v0.31 state representation/fixture and current saved semantics? Can an explicit, reviewed compatibility treatment preserve scientific meaning without refreshing goldens?
4. Why does the component script's initial lineage assertion fail with identical runtime checkouts? Are its fixture/module-context assumptions valid?
5. Which kernel phases, joints/eyes/brain shapes/food/egg densities and local-topology conditions deserve separate measurement, based on code and actual workload rather than historical claims?
6. How are rendering counts, throughput smoothing, fallbacks, selected diagnostics, React updates and background/visible scheduling related? Which live counters represent delivery rather than execution?
7. What allocation/clone/retained-history paths and future collision/network/fluid workloads need hypotheses for a later scoped experiment?

No asymptotic model, refactor design, simplification selection or optimization ranking is supplied in this stage.

## 10. Missing instrumentation candidates for Stage 3

Subject to a separate scoped protocol/approval, potential evidence gaps are:

- Repeated saved-state **current v3/closed/decay-v2** populated WorkerMAX measurements with exact sim ticks, wall interval, settings/PRNG and counts; separately paced finite modes and fallback.
- Coarse phase wall distributions/p50/p95/p99 plus sampling in the actual Worker; assess instrumentation overhead and state invariance.
- Equivalent-state observer-only drawing control, separate receipt/collector/control, actual main-thread CPU/GPU/Canvas/rendering and input latency; preserve honest real-energy signaling.
- Transport frame count/bytes/clone/apply/queue/ack timing, selected neural/lineage/snapshot spikes, React render work.
- Worker/main heap, allocation/GC pauses and long-duration retention, CPU usage by thread/process, paused/render-only resource use.
- Controlled matrix of organisms/parts/eyes/brain/food/carrion/eggs/tubes, visible-object count, viewport/DPR/zoom and representative desktop/mobile hardware; no unauthorized cap/model changes.
- A reviewed current-compatible profiler/component fixture and comparison contract, retaining all frozen evidence, not silently replacing historical hashes.

These are candidate **measurement requirements**, not permission to add instrumentation, gate CI or implement optimizations.

## 11. Reproduction

Use Node24.22.1 and the exact lockfile. The same hardware/runtime/state is needed for a meaningful timing comparison; numerical equality alone does not equal equivalent CPU load.

```sh
git clone https://github.com/hernansgarro/vidAI.git vidAI
cd vidAI
git checkout --detach 3c737ac1bbf678915ebd945b6b5db8781a48831b
npm ci
npm run build
git worktree add --detach ../performance-baseline e9662a6ef5307a3349ea1338489d755a1879c8b9
ln -s ../vidAI/node_modules ../performance-baseline/node_modules
npm run benchmark:performance
npm run benchmark:performance
npm run benchmark:performance
npm run benchmark:performance -- --baseline ../performance-baseline
npm run benchmark -- --seed 4242 --seconds 3
npm run benchmark -- --seed 4242 --seconds 3
npm run benchmark -- --seed 4242 --seconds 3
node --import tsx scripts/profile-performance.mjs . /tmp/profile-stage1.json
# Expected current failure: stop at first golden mismatch; do not edit it.
node --import tsx scripts/benchmark-runtime-components.mjs ../performance-baseline
# Expected current failure before timing; do not alter source to force results.
node --import tsx --test tests/performance-runtime.test.ts tests/simulation-performance.test.ts tests/worker-pacing.test.ts tests/spatial-index.test.ts tests/sight-broadphase.test.ts tests/energy-activity.test.ts
npm run test:worker
```

Each kernel process has only the script's10warmup ticks per restored round; headless has no separate warmup. For external timing (Linux), wrap a command without modifying it; actual raw records use this pattern, with command-specific timeout60or120s and separate output files:

```python
import os, subprocess, time
with open('trial.stdout', 'w') as out, open('trial.stderr', 'w') as err:
    start = time.monotonic()
    process = subprocess.Popen(['timeout', '60', 'npm', 'run', 'benchmark',
                                '--', '--seed', '4242', '--seconds', '3'],
                               stdout=out, stderr=err)
    _, status, usage = os.wait4(process.pid, 0)
    process.returncode = os.waitstatus_to_exitcode(status)
    wall = time.monotonic() - start
print(process.returncode, wall, usage.ru_utime, usage.ru_stime, usage.ru_maxrss)
```

The failed browser install command was `timeout 60 npx playwright install chromium`. If an appropriate browser were available, the registered conditional two-case selection was the existing `e2e/energy-activity.spec.ts` cases matching `energy contour glows`, Worker/fallback, one browser worker,180s total. They are correctness checks with Canvas hooks, not an efficiency comparison. None ran in this audit, and no alternative remote/browser/CI campaign was substituted.

## 12. Limitations, validation and review stop

[Explicit skips/access record](raw/skips-and-access.md) includes unrun behavior/ecology/full test suites, three unreached profile fixtures, all component timed loops, browser/fallback/FPS/latency/DevTools/GC and representative-machine observation. There is no missing successful profile hidden elsewhere: the incompatible script emitted none. No raw outlier/error was suppressed. Empty output files are deliberately retained.

Validation performed for this documentation/evidence change: npmci; build/typecheck;41focused correctness tests; one productionWorker harness; derived-number/JSON/link/hash/diff checks. Fullfast/simulation/browser campaigns are not necessary to validate prose and were not manually repeated. Automatically triggered forkPR CI, if any, is a separate publication check, not new audit timing data. No test/CI/frozen reference was relaxed. Source/package/CI/testing/Wiki remained unchanged.

The evidence answers what is presently measurable and establishes a small reproducible reference. It **does not yet identify which subsystem is slow in Hernan's actual current workload**. The most valuable next review topics are the current-app measurement gap, profiler/component compatibility, and the unmeasured Worker/observer/render/transport boundaries. They deserve investigation; no ranking among them is supported here. Stage2 requires Hernan's review/authorization. Leave forkPR61 open; no automatic merge, upstream PR, optimization, further scientific campaign or Stage2–4 work.
