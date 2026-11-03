# VIDA 2D — Performance Efficiency Audit: Four-Stage Plan

## Current checkpoint — Stage 3.7b recovery COMPLETE (2026-11-03)

Hernan explicitly authorized a recovery after the previous stopped lot. All 12 registered windows completed once; source57a7d45, original evidence66a89ed, [research DRAFT #92](https://github.com/hernansgarro/vidAI/pull/92), [report](https://github.com/hernansgarro/vidAI/blob/8481613ce08be6137d347cf0d8b9eabb0aed8130/docs/experiments/performance-stage-3-v9/report.md). [Cumulative findings](../../PERFORMANCE_AUDIT_STAGE_3.md) contain verified phase costs, actual counterfactual TPS, controls, independent GC/CPU, divergence and conservation. Vision +53.11%, brain-output +19.53%, learning OFF +6.88%, synthetic feeding +1.79% versus nearby real controls; one window each, real-control spread6.78%, no additive/removable CPU interpretation or production-safe benefit established. Physics/contacts dominate the separate phase ledger, then vision and inference. Counter/frame draining and early raw preservation now verify correctly.

This supersedes pending-throughput status, not the immutable original failed P01. All probes/raw/checkpoints remain isolated and unmerged. Active201.978s/runner357.601s/111,808,143rawbytes within bounds; scientific run41729322675 succeeded with required installation/fast/build/Worker/focusedChromium gates. Temporary workflow removed; reference YAML outside.github. Main receives documentation only. Stage3 remains ongoing; STOP after this lot. No automatic new study, upstream submission, production optimization or Stage4 authorization. Earlier checkpoints below are preserved dated history.


## Current checkpoint — Stage 3.7 attempted and BLOCKED (2026-11-03)

The separately authorized Stage 3.7 lot ran once and stopped at the first timed-window counter failure. Eight fixed-120-tick correctness controls are verified; zero valid end-to-end TPS/overhead/trace windows, 11 slots unstarted. **No repeat or second campaign is authorized.** See the [cumulative verified partial findings](../../PERFORMANCE_AUDIT_STAGE_3.md#stage-37-update--2026-11-03-partial-verified-pilots-timed-lot-blocked), [detailed report](https://github.com/hernansgarro/vidAI/blob/f846d67939e32d46a398768c082368dea2d553b7/docs/experiments/performance-stage-3-v8/report.md) and [research draft #90](https://github.com/hernansgarro/vidAI/pull/90). This checkpoint supersedes the earlier “3.7 not started” planning status, while preserving the dated proposal and all prior evidence below.

The short pilot suggests physics/contacts, vision/query processing and inference as hotspots, with substantial nested-probe perturbation and no calibrated sustained costs. Universe-funded synthetic feeding conserved energy without fake contact cues; dummy trajectories diverged. All real variants exactly match ordinary full state/PRNG/settings/learning/energy. `frame().steps` is a draining per-frame delta, not a cumulative counter; the research-only harness repair compiled but was not executed. Original failure/raw evidence are immutable at812f511. Conclusions and limitations are in fork main; all probes/checkpoints/raw archives remain isolated/unmerged. Temporary experiment workflow removed. Stage3 remains ongoing; Stage4 unauthorized. A future recovery requires new explicit owner approval and a fresh finite protocol; unused budget is not permission to retry.



## Stage 3.7 methodology amendment — controlled component bypasses (2026-11-03)

**Owner request, planning only.** In addition to the hierarchical exclusive Worker timers already specified, evaluate research-only **counterfactual dummy substitutions** to see how end-to-end ticks/s changes when an expensive component is bypassed. Complete proposal: [Stage 3.7 Dummy Substitution Design](STAGE_3_7_DUMMY_SUBSTITUTION_DESIGN.md). This is not measured evidence, a shipped optimization, permission to bypass essential work in production, or automatic approval to launch a run.

The source has mixed global/per-organism phases: vision + recurrent brain + optional waking/sensory learning are grouped in a per-organism traversal, while physical substeps and shared contacts are global; metabolic accounting and feeding follow in distinct per-organism traversals. Suggested *one-at-a-time* diagnostic modes: (a) recorded real or controlled deterministic vision stimuli; (b) known constant/alternating brain motor outputs; (c) learning OFF as its own intervention, separately motor/sensory if affordable; (d) feeding replay or an explicitly funded small synthetic intake that bypasses mouth-contact evaluation. Physics replay is a feasibility hypothesis only, not an assumed valid shortcut, because collision and joint states are shared.

Optional low-cost state-machine generators may emit `A→B→C→A` from recorded typed values, either using a shared global request counter (order-sensitive) or, preferably for controlled per-organism comparisons, a deterministic selector keyed by logical tick, organism ID and channel. Do not advance the production PRNG, mix input vectors of incompatible genome shape, or claim such values reproduce ecological reality.

**Two distinct measurements must not be conflated:** exclusive phase time in the unchanged all-real simulation versus observed whole-Worker throughput after a counterfactual bypass. Dummies can change subsequent motion, energy, contact counts, learning, population and workload; the measured TPS difference is not automatically the cost of that component or an achievable physical optimization. Record divergence, benchmark-control overhead, dummy generation cost, synthetic energy ledger provenance, and limits. All-real fixed-tick state/PRNG/energy controls must remain exact; dummy-on results intentionally need not match the real trajectory, but must honor finite-value/type/state integrity and conservation requirements.

A new Stage 3.7 Work task must **preregister a feasible subset** of bypasses plus phase timers and overhead controls within the existing finite window/time/archive budget, not promise exhaustive combinations or silently increase trial counts. Historical 3.1–3.6 results remain untouched; experimental probes and evidence belong on isolated audit branches, with verified scientific conclusions in fork-main documentation.

## Current owner decision — Stage 3.6 complete; Stage 3.7 Worker micro-attribution next (2026-11-03)

Hernan requests that completed scientific **findings be discoverable in fork `main`**, separate from research-only probes, tracers, generated raw evidence and temporary workflows on their own unmerged research branches. The new [main cumulative Stage 3 evidence ledger](../../PERFORMANCE_AUDIT_STAGE_3.md) preserves all Stage 3.1–3.6 findings and immutable original links. Research PRs [#66](https://github.com/hernansgarro/vidAI/pull/66), [#69](https://github.com/hernansgarro/vidAI/pull/69), [#80](https://github.com/hernansgarro/vidAI/pull/80) and [#87](https://github.com/hernansgarro/vidAI/pull/87) remain draft/unmerged. Stage 3.6's one-shot CPU/GC attribution was completed, successfully validated and stopped; its medians were Worker~99% one logical core, main~98%, additional software graphics~74–75%, and browser~285–287%. Worker is only~35% of browser CPU. The cap30→10/s median TPS change was+5.33%, with one negative pair and almost unchanged total CPU. This establishes neither a universal speedup nor thermal savings.

**Stage 3.7 is a proposed next separately executed Work investigation, not completed by this document.** Primary objective: finer-grained *authoritative Worker* phase and subphase cost attribution under a running, populated MAX simulation with minimal accepted observer presentation. Design and preregister one bounded experiment before running; no automated exploratory expansion and no Stage 4 implementation. Suggested graduated instrumentation:

1. **Level 0: lean uninstrumented reference.** Preserve actual production Worker throughput, tick counts, full state, camera, backend, resource/OS counters, latency and workload inventories; do not conflate with headless kernel or profiled throughput.
2. **Level 1: exclusive top-level Worker phase ledger.** Delimit full tick; distinguish physics/motors/drag/joints/contacts, sensing/vision/index, neural inference and learning, feeding/ecology/energy/reproduction, observer-side tick event collection and other/unattributed. Verify source call order and ensure mutually exclusive accounting: sum(exclusive)+residual=observed tick span within measured clock overhead, rather than adding nested spans or unrelated CPU samples.
3. **Level 2: selective nested subphases.** Within previously observed hotspots, isolate spatial-index update/query, corridor candidates/ray intersections, cardinal-anchor and pose geometry, contact broadphase/body/pairs/narrowphase/solver, neural input/forward/recurrent and somatic-delta work. Split feeding scans and environmental passes only where actively present. Assign stable S2 IDs; preserve already-existing scratch/cache behavior and record distinct call/work-unit counts.
4. **Level 3: separately priced allocation/GC diagnosis.** V8 allocation sampling/GC trace and source-mapped Worker stacks on a *different diagnostic run*, never silently pool with unprofiled primaries. Report thread CPU and scheduling independent of wall time; memory traffic/retained-heap/leaks stay UNKNOWN without appropriate controls. Include counter-only and timer-enabled overhead controls to detect perturbation.
5. **Cost/scaling attribution.** Report exclusive milliseconds per tick and per operation, median/tails, calls/tick, ray candidates/intersections, contacts/pairs/iterations, parts/joints, neural neurons/edges/updates and food/eggs/events. Compare matched checkpoints/workload manipulations only when they preserve authorized physics and deterministic interpretation. 15 vs30 unrelated founders do not isolate a population-count coefficient. State which work is essential versus plausibly avoidable; do not claim a sampled hotspot can be eliminated.

**Secondary, separate observation question:** a stationary camera does not imply static pixels. The water/background, organism positions, nutrients, egg animation, halos/fades, time-based effects, masks and selections have distinct invalidation needs. Static-layer caching, state-aware paint and dirty-region updates can be scoped for a later hardware-GPU study, without changing Worker truth or ignoring animated content. Software SwiftShader observations alone do not price user-device gains. This is not authorization to implement a redraw change during 3.7.

The forthcoming Work prompt may authorize the **new bounded Stage 3.7 research lot**; it must set immutable base/source/checkpoint, preregistration and limits, exact120-tick state/PRNG/energy validity where applicable, lean-vs-probe comparisons, immutable archiving and stop/failure/retry rules. Existing Stage 3.1–3.6 windows must not be rerun as “more replicates” or modified. Preserve ALL Worker physics/genetics/learning/ecology, off-camera simulation, historical saves and core release safeguards. Do not change fork production runtime, testing branch, upstream, Wiki/Pages or VIDA 3D. No fork-main research merger or upstream PR is authorized by this documentation task.


> **Contributor-fork planning document; 2026-11-02.** Tracks Hernan's IDEA-023 (P0). This plan is not an upstream delivery, a performance diagnosis, a change to the production simulation, or authorization to implement optimizations. Its four **audit stages** are separate from the five contributor delivery workflow stages and the side-window/tube feature stages.

## Deferred next Work request — Stage 3 Worker hot-path diagnosis (2026-11-03)

**Research focus selected for future discussion, not approved for execution:** After Stage 3.5, Hernan wants the *next proposed investigation* to examine internal Worker tick costs, scaling and avoidable repeated work before choosing Stage 4 optimizations. The reasons, historical measured evidence, specific S2-01–S2-12 suspects, exactness safeguards, bounded protocol requirements, alternative CPU/GC attribution follow-up, and instructions for **generating a Work prompt only when later requested** are preserved in the [Worker hot-path research handoff](WORKER_HOTPATH_RESEARCH_HANDOFF.md). Do not infer that a hotspot or speedup has been demonstrated. Keep the prior Stage 3.5 stop, existing research artifacts, and all future experiment/implementation authorization gates in force. This record is fork-only and **documentation-only**; no Work execution was requested.

## Current measurement target — owner decision (2026-11-03)

**This section governs all future audit protocols and Stage 4 recommendations.** It updates the target workload, **not** the historical scope, results, or validity of completed Stages 1–3.4. [Decision receipt in upstream #57](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6607358209). The original stage instructions and already completed protocols below are preserved as dated research history; where they call for a broader matrix, the narrower rules here take precedence **for new performance measurements**.

**Primary goal:** maximize *actual progress of a running, populated simulation* while showing only what a human needs to understand organisms and their environment. Do not maximize decoration-enabled FPS or optimize a paused scene as a proxy for that goal.

### Required future benchmark profile

- **Playback:** simulation running, with MAX/unbounded throughput as the primary capacity measurement. Finite nonzero speeds may be measured only for a specific pacing, responsiveness or correctness question. Report achieved ticks/s and simulated-time multiplier, not just requested speed or FPS. Paused/0x FPS and idle repaint are **not performance targets**; a short paused import/reset/snapshot control is permitted when scientifically required, never as a substitute for active throughput evidence.
- **Least-cost supported presentation:** turn **water caustics OFF** via the shipped observer setting for every new primary benchmark, including any controls and tube variants. No selected organism, brain/neural inspector, selected sensor rays, tracking traces, or optional organism-inspection overlays/panels. Keep only the minimum meaningful world/organism/nutrient/egg/tube presentation. Preserve controls and correct semantics necessary to observe behavior; do not silently hide material information that cannot currently be disabled safely.
- **Future display/performance options:** if an accepted, independently validated setting can reduce *optional* observer cost, keep it in its least-cost acceptable state across the **entire future primary matrix**. Do not continue ranking workloads with expensive decoration settings switched back on. Do not claim a setting improves Worker throughput merely because FPS improves. An explicit paired diagnostic to establish a causal mechanism may be proposed separately but is **not** part of the new routine target profile and requires its own approval.
- **Representative active populations:** vary living-organism count, total body parts/joints, eyes/rays, neural complexity, nutrient and egg counts, births/deaths and density. Keep background/off-camera simulation fully authoritative. Use realistic existing Default, Harsh and fork-only Pipe World conditions where applicable, comparing counts/topology rather than assuming world area alone determines cost.
- **Tube topology:** include both **no active connection** and **active local tubes**, including occupants/crossings when a bounded approved fixture exists. Tubes are functional gameplay, **not optional decoration**. Do not drop their costs to make a benchmark faster; preserve physical continuity, state, energy, IDs and offscreen behavior.
- **Controls and metrics:** fix/log source SHA, original checkpoint/PRNG, genetics, settings, topology, speed, camera/zoom, viewport/DPR, graphics backend, machine/browser, visible organism/food geometry, repetitions/order and instrumentation overhead. Primary metric is actual Worker ticks/s (and derived multiplier) at sustained active load; separately record per-thread CPU, Worker/main memory/GC, frame traffic/ACK and UI responsiveness when available. FPS is a minimum-usable-observation guardrail, not proof of simulation speed. Check exact-state/physics/ecology and visual truthfulness for every proposed change.
- **Exclusions:** do not run primary benchmarks dominated by pauses, selected-organism/brain panels, maximal decorations or isolated decorative effects. Such historical research remains useful for causal explanation and acceptable-appearance decisions, but it cannot set the Stage 4 implementation priority unless it also affects the new operating profile. Never bypass essential simulation work or degrade accepted semantics merely to achieve more ticks.

### Stages 1 and 2: applicability review, not repeat execution

- **Stage 1:** retain the complete, immutable tool inventory, measured benchmarks, production Worker validity and all limitations. Its legacy Node/preset results, empty-world Worker smoke, and historical paused/observer measurements are **not representative end-to-end throughput baselines** for the new target. No wholesale rerun is needed. A future separately authorized short, populated, caustics-OFF active Worker baseline can fill a specific gap when making a Stage 4 decision.
- **Stage 2:** retain the code-backed cost model and IDs S2-01–S2-12. Static complexity and exactness safeguards do not depend on presentation preference. Reprioritize hypotheses by **measured marginal contribution to active essential Worker throughput**, including contacts/physics, vision, neural evaluation, feeding/ecology, allocations/GC, scheduling, transport and active local tubes. Decoration-only/paused/selection-specific costs become secondary or excluded; observer processing still matters when unavoidable in the minimal profile.
- **Stage 3:** preserve every historical preregistration, original measurement and uncertainty (including Stage 3.4 caustics ON/OFF as explanatory contrast). Subsequent experiments must preregister the target profile and scope only unresolved relevant questions; no automatic new run is authorized by this decision.
- **Stage 4:** synthesize old evidence **with applicability labels** (direct / conditional / historical-out-of-target / unknown). Do not extrapolate performance across sources, machines, workloads or decoration configurations. Propose optimizations only after evidence and Hernan's explicit implementation approval.

## Authority, references, and scope

- Primary personal priority: [IDEA-023](../ideas/IDEA_LAB.md#idea-023-vida-2d-performance-and-cpu-load-audit). Other current ideas and constraints are indexed on that board; earlier discussion remains in Git history.
- Contributor planning: [IDEA_LAB](../ideas/IDEA_LAB.md), [workflow status](../tracking/CONTRIBUTOR_WORKFLOW_STATUS.md), [roadmap](../../FEATURE_ROADMAP.md), [completion history](../tracking/CONTRIBUTOR_COMPLETED.md).
- Shared tracking: [upstream #57](https://github.com/smeagol44/vidAI/issues/57), [performance budget #67](https://github.com/smeagol44/vidAI/issues/67), and [future fluid research #62](https://github.com/smeagol44/vidAI/issues/62).
- Current technical reference: [Simulation Performance](../../wiki/Simulation-Performance.md), [Energy Activity](../../wiki/Energy-Activity.md); upstream `AGENTS.md` and `docs/CONTRIBUTOR_WORKFLOW.md` govern execution.
- Primary target: current `hernansgarro/vidAI:main` at a **recorded, immutable commit**. The fork contains features not yet accepted upstream, including nutrient cycle v2 and Pipe World. Do not substitute upstream main or the independent testing branch for the target.
- Motivation: user-reported unacceptable CPU load, slow response, and a perceived coincidence between organism energy-activity glow and slowdowns. **Correlation is not causation.** No measured bottleneck is established at plan creation.
- This is a read-only diagnosis first. A tool or test exists only as a candidate until its behavior, cost, and current compatibility are verified.

## Stage overview

| Stage | Question | Deliverable | Gate |
| --- | --- | --- | --- |
| **1 — Existing measurements** | What can current tools establish about actual processing efficiency? | Reproducible baseline, raw evidence, tool audit, limitations and unanswered questions | Review Stage 1 results before beginning Stage 2 |
| **2 — Static algorithm analysis** | What does the implementation imply about asymptotic cost, redundancy and precision trade-offs? | Code-backed cost-model inventory with hypotheses and acceptable/unacceptable semantic compromises | No refactor or tuning; hypotheses routed to Stage 3 |
| **3 — Targeted evidence** | What additional measurements can confirm or falsify costly-path hypotheses? | Approved scoped diagnostics/tests, controlled comparisons, overhead assessment and findings | Instrumentation requires scoped approval and protocol |
| **4 — Synthesis and decision** | What should actually be optimized, if anything? | Evidence-ranked options, trade-offs, discussion with Hernan and implementation prompt for Work | **Explicit human decision** before optimization implementation |

Stages may uncover new subtasks; record them under the originating stage and retain their IDs. No stage is considered complete merely because a script finished successfully.

## Stage 1 — Audit the tools already present

> **Historical execution specification (2026-11-02):** already completed; do not rerun under the new profile. See the 2026-11-03 target above for forward-looking applicability.

**Scope:** Inventory and run existing facilities with unchanged simulation/runtime code. Existing tests may protect correctness without being timing benchmarks; report that distinction. External shell timing/OS and browser profiler facilities may be used **without committing instrumentation**. Any new persistent diagnostics or tests belong to Stage 3.

### 1.1 — Provenance and protocol registration

- Read current upstream instructions, #57, related issues/PR discussions, fork documentation, and actual script implementations. Check main/branch SHA, installed toolchain, CI constraints, optional scripts, and historical reference compatibility.
- Record exact fork SHA, upstream SHA, OS/CPU/core count/RAM, power/thermal conditions if known, Node/browser versions, architecture, Worker/fallback mode, screen resolution/DPR and browser visibility when relevant. Missing values must be marked unknown.
- Before running expensive trials, write a bounded protocol: hypotheses, baseline worlds/seeds, test order, warm-up, run lengths, number of repetitions, permitted runtime/cost and stop conditions. Keep the protocol and raw outputs separate from conclusions.
- Prefer a small reproducible first pass, then extend only if evidence warrants it. Do not repeat previously spent experimental campaigns or silently regenerate lost data.

### 1.2 — Existing-tool inventory and scientific meaning

Inspect commands, implementation, fixture construction, output units, correctness checks, state evolution, and compatibility of at least:

| Facility | Established or probable output | Limitation to verify |
| --- | --- | --- |
| `npm run benchmark:performance` | Same-checkpoint simulation-kernel elapsed milliseconds; 120 ticks after 10 warm-up ticks, two rounds, 15 creatures / 78 plant food / 221 carrion, exact final-state assertion; optional `--baseline` | Single workload; node kernel rather than actual UI/Worker; short duration; aggregate timing only |
| `npm run benchmark` | Headless ecology progression/invariants over simulated duration (default 60 s) | No elapsed wall-clock timing in its JSON output; not itself a speed benchmark |
| `npm run benchmark:behavior` | Deterministic behavioral/energy measurements on controlled founders | Behavioral validity, not representative runtime efficiency |
| `npm run benchmark:ecology` | Ecological baseline outputs | Scientific/economic outcome, not CPU or render time |
| `node --import tsx scripts/profile-performance.mjs [checkout] [output.json]` | CPU sampling of four synthetic kernel scenarios with function-category attribution and golden-hash assertions | Historical frozen golden hashes may not match current main; validate compatibility, never overwrite them to force a pass |
| `node --import tsx scripts/benchmark-runtime-components.mjs <baseline-checkout>` | Relative component timings for contacts, learning buffers and unchanged lineage transport | Requires a compatible baseline checkout; synthetic component microbenchmark, not overall FPS |
| `npm run test:fast` and `npm run test:worker` | Determinism/physical invariants, Worker behavior, transport and scheduling correctness | Pass/fail is not measured CPU efficiency or FPS |
| `tests/performance-runtime.test.ts`, `tests/simulation-performance.test.ts`, `tests/worker-pacing.test.ts` | Cache/continuation safety, throughput-indicator logic, pacing behavior | Not equivalent to direct CPU breakdown |
| `tests/spatial-index.test.ts`, `tests/sight-broadphase.test.ts` | Conservatively correct/ordered broadphase and off-camera continuation | Candidate reduction is not a measured wall-clock speedup |
| Existing Playwright/DevTools/CI and in-app throughput | Actual speed relative to wall clock, browser/Worker behaviors and UI checks | Indicator is **not** CPU utilization; existence of browser tests does not imply FPS profiling |

Confirm any additional scripts, profiler fixtures, browser test helpers and historical measurements rather than assuming this list exhaustive.

### 1.3 — Reproduce existing benchmark results

- Run the unmodified benchmark performance workload with repeated independent executions, and retain all raw timings, seeds, settings and any reported state equality.
- If the script's `--baseline` works for an intentionally selected **compatible** revision, run its alternating baseline/current order. Document why the two revisions are scientifically comparable; if compatibility fails, record failure and stop rather than altering golden fixtures.
- Run a bounded `benchmark` headless sample; separately time its process with a standard external clock **if desired**, labeling startup/JIT/process overhead rather than misrepresenting it as per-tick kernel time.
- Assess existing profiler script and component microbenchmarks, including whether their inputs/expected hashes are current. Do not silently reinterpret a 0.31-era frozen golden as a 0.39+ state.
- Preserve raw output and failures; summarize per-run elapsed time, throughput, median, dispersion and sample count. Do not hide discarded runs or present instrumented/profiled timings as unprofiled timings.

### 1.4 — What headless simulation reveals

- Distinguish `kernel-only` (direct `stepSimulation`), `actual production Worker` (thread/batching/pacing), `main-thread fallback` (simulation competes with painting), and `browser presentation`.
- For `T` completed ticks over `W` elapsed wall seconds, calculate ticks/s = `T/W` and equivalent simulation multiplier = `T/(60 W)`. Report CPU/core utilization separately if supported; high ticks/s and high/low CPU use are not synonymous.
- Keep speed modes 0/1/2/5/10/20/MAX distinct: finite requested speed can throttle an otherwise fast kernel; MAX is uncapped but yields in bounded batches; pause is not idle CPU evidence by itself.
- Any frame/transport/snapshot measurement must distinguish an authoritative Worker state and observer-only render replica.
- Existing 60 Hz logical ticks, up-to-30/s render transports, and ~4/s visible telemetry are different quantities.

### 1.5 — Representative workload coverage and future-proofing

Inventory which scenarios are **already executable** without changing tests or source:

1. Default, Harsh and **fork-only Pipe World** presets; compare workload counts/densities, not just dimensions. A larger, emptier world is not necessarily slower than a smaller, crowded world.
2. Realistic 5/15/30-organism states and independently varying segment/joint/eye/neuron counts if existing fixtures allow; include the shared **~100 creatures/~1,000 parts** performance ambition from #67 as a *future capacity target*, not proof current settings can sustain it.
3. Low/moderate/high food and carrion inventories, eggs, births/deaths, lineage changes and steady state versus growing state.
4. Active local self-tubes/windows (including off-screen organisms), tube crossing and many visible controls, where existing fixtures permit.
5. Observer effects: no glow activity versus active feeding/predation glow, egg overlays and other compositing layers, *only if an existing safe toggle/fixture/control allows an equivalent-state comparison*. Otherwise mark as Stage 3; do not disable the energy-observer logic by changing authoritative simulation.
6. Worker vs `?mainthread` diagnostic fallback, selected speeds, visible/offscreen display and different viewports only through supported existing facilities. Record the actual initial camera zoom/framing and pan; equivalent world dimensions do not guarantee equivalent visible work.

Do **not** create new synthetic features or secretly raise runtime caps in Stage 1. Record missing dimensions, including pixel fill/DPR, paused/render-only CPU, memory/GC and message sizes, as Stage 3 candidates.

### 1.6 — Interpretation and reliability review

- For every number, specify what was actually timed: kernel work, process startup, scheduling, transfer, UI render, CPU profile samples or end-to-end wall time.
- Run an ordered, bounded warm-up and repeated measures on a stable environment; distinguish medians/ranges from hard guarantees. If comparison uses different machines, browser builds, settings, seeds or world trajectories, report it as non-equivalent.
- Check whether counts, density, genomes, simulated time, energy events, PRNG state, snapshots and flags are truly held fixed in paired comparisons. Avoid conflating a different world with a faster implementation.
- If profiling tools fail, stop rather than relaxing frozen hashes or altering tests. Negative outcomes and unsupported measurements remain useful findings.
- Do not conclude the glow is causal without a controlled paired test; user-observed correlation is a hypothesis.
- Do not claim a profile percentage proves an overall optimization opportunity: distinguish self/total time, sampling overhead and cross-thread load.

### 1.7 — Stage 1 evidence and completion criteria

Publish the detailed **Stage 1 report and raw outputs** under a new, dated/versioned `docs/experiments/` path on a fork topic branch using the established PR workflow. Include:

1. Target commit, protocol, environment and budget actually used.
2. Tool matrix: command, input/fixture, output, correctness assertions, metric units, reliability and blind spots.
3. Exact invocation and raw run results, including failures/skips.
4. Kernel ticks/s, ms/tick, simulation multiplier and dispersion where valid.
5. Existing evidence about Worker, UI, FPS, CPU, communication and memory, separating measured from undocumented.
6. Scenarios supported/unsupported, especially the glow hypothesis and future capacity needs.
7. Conclusions supported by data; hypotheses only; gaps to test in Stage 3; code questions for Stage 2.
8. Reproduction commands, follow-up recommendations, and explicitly unrun tests.

**Exit gate:** Hernan can answer “what is presently measurable, what is actually slow under which workload, and what still needs investigation?” with source-linked evidence. Stop and request the next stage rather than performing static optimization design or instrumenting production.

## Stage 2 — Cold/static algorithm review (not part of Stage 1 execution)

> **Historical completed static review:** retain its code-backed hypotheses; only their future measurement and prioritization are narrowed by the current target above.

**No timing conclusions solely from Big-O reasoning.** Identify code paths, input sizes, call frequencies, allocation patterns, duplicated work and candidate simplifications. Document exact function names, file locations and possible hidden costs.

- **2.1 Simulation scheduling:** 60 Hz fixed ticks, substeps, catch-up/refresh, Worker batch yields, main-thread fallback and offscreen execution.
- **2.2 Physics:** body segments, joints, ten provisional joint iterations where applicable, resistance/drag, contacts, clipping and boundary projections; evaluate bounding/caching candidates without changing validated motion.
- **2.3 Sensing/feeding:** optical rays, spatial candidate queries, nutrition and mouth contacts, predation triggers and observer signal generation.
- **2.4 Brains:** enabled-edge evaluation, recurrent state, learned weights, architecture masks, per-creature allocations and cache invalidation.
- **2.5 Ecology and reproduction:** nutrient integration/recycling, carrion, eggs, funded hatching, lineage and density-dependent costs.
- **2.6 Tubes/world sizes:** topology queries, transfer, world coordinates, collision/visibility, cross-window overhead.
- **2.7 Worker/UI communication:** frame construction, delta/full copies, structured cloning/transfers, epochs, selection diagnostics and UI state updates.
- **2.8 Rendering:** canvas passes, per-organism glow, per-part energy signals, composites/blur/filters, overdraw, culling, cache policies, DPR and responsive layout.
- **2.9 Memory/GC:** hot-path object creation, arrays/Maps, transient snapshots, retained historical data, disposal/leaks and buffer reuse.
- **2.10 Trade-off register:** categorize each proposal as (A) exact state/ordering-preserving, (B) observer-only presentation quality trade-off, (C) approximate physical/biological model, or (D) invalid shortcut; quantify potential impact only when measured and disclose invariants at risk.
- **2.11 Future complexity review:** include `IDEA-021/022` nutrient contacts and particle collisions, `IDEA-010` remote networking/authority, `IDEA-011` organism transfer/export, `IDEA-019/020` device-oriented presets, and upstream #62 moving-fluid research as **future requirements, not implemented costs**.

**Deliverable:** code-backed hypothesis register, expected growth variables, constraints and Stage 3 measurement requests; no changes to simulation behavior.

## Stage 3 — Targeted instrumentation and controlled tests (separate approval required)

> **Forward-looking override:** the proposals below are an original broad research inventory, **not** an instruction to rerun caustics ON, paused, selected-inspector, or decorative workloads. Every newly authorized protocol follows the 2026-11-03 minimal-observer, caustics-OFF, actively running target above.

- **3.1** Approve a scoped experiment protocol: hypothesis, baseline/variant, trace budget, affected functions, environment and stop rules.
- **3.2** Add optional coarse per-tick/phase timers (mean/p50/p95/p99), measure overhead, and avoid per-entity timers in production hot loops.
- **3.3** Isolate CPU by physics, contacts, vision, neural learning, ecology, and observer-event accounting; use sampling + bounded event counters.
- **3.4** Profile Worker scheduling vs main-thread fallback, queue delay, actual steps/s and background-tab/offscreen behavior.
- **3.5** Profile rendering by pass: glow off/on with equivalent authoritative state, energy-event computation on/off **only through observer-safe controlled instrumentation**, overlay blending, egg/food effects, selection/diagnostics, DPR and viewport; compare FPS, main-thread long tasks and throughput.
- **3.6** Measure frame payload size/count, structured-clone/serialization, replica application, transfer wait/ack and snapshot/lineage spikes.
- **3.7** Measure heap/GC and duration-dependent degradation; separate Worker/main memory where available.
- **3.8** Run a bounded workload matrix (organisms/parts/brains/nutrients/eggs/tubes/world size), plus existing tests; document stress/cap changes as **research-only** and never quietly alter defaults.
- **3.9** Preserve exact saved snapshots/PRNG/energy and user-relevant optics for observer-only probes. Any physics approximation is a later separate decision, not a Stage 3 optimization.
- **3.10** Preserve raw traces, failure/negative findings, current-base comparison and instrument overhead. Do not promote new gates or edit frozen references to conceal differences.

**Deliverable:** measurement-backed hypothesis assessments with effect sizes, uncertainty and reproducible evidence. The instrumentation itself must be reversible, optional and isolated from production behavior unless separately approved.

## Stage 4 — Integrated findings, priorities and Work implementation prompt

> **Decision target (2026-11-03):** optimization value must be assessed primarily as actual populated-Worker active throughput under the minimal-observer configuration, including with and without local tubes; old decoration/paused metrics are contextual, not the objective.

- **4.1 Evidence matrix:** consolidate Stage 1 measured baselines, Stage 2 static concerns and Stage 3 controlled results. Classify **confirmed**, **plausible but unverified**, **refuted**, and **not measured**.
- **4.2 Ranking:** use severity on representative hardware, contribution to total CPU/wall time/FPS, expected end-to-end gain (beware Amdahl's law), development complexity, risk to deterministic history, visual/ecological/physical fidelity, memory cost and maintenance burden.
- **4.3 Decision tiers:** (A) exact low-risk optimizations, (B) observer-only acceptable simplifications (e.g. aggregate glow draws without falsifying energy receipts), (C) explicit high-risk numerical/physical approximations requiring separately authorized versioning, (D) rejected/unsupported shortcuts.
- **4.4 Future-proofing:** evaluate the accepted target workload and whether planned `IDEA-021/022` collisions, large-world/mobile presets, possible remote aquarium transport and upstream fluid research would invalidate or amplify the selected approach. Do not implement those future features here.
- **4.5 Human review:** discuss measurable benefit versus trade-offs with Hernan, choose one or multiple bounded fronts, define acceptance and rollback criteria. Approval is required before implementation.
- **4.6 Final Work prompt:** name exact fork/base/branch, scoped files, experiments/measurements, invariants and frozen baselines, performance success criteria on controlled hardware, required tests, browser/Worker evidence, report and fork PR. **Do not open an upstream PR without a separate explicit request.**

## Stage 4 discussion candidates — configurable reporting and selective redraw (2026-11-03)

> **Owner-requested documentation only.** These are exploratory candidates within IDEA-023's **performance-audit Stage 4 synthesis/decision**, not the unrelated remote-tube Stage 4, an accepted design, an approved optimization, or authorization for new Stage 3 trials. Keep the existing Stage 3 stop and all scientific evidence intact. Source inspection below refers to the fork's `main` at e3c72cf2e00ce91daa84ef13a3c636029493b538; do not treat it as a newly measured profile.

### Candidate A — Advanced user control of Worker-to-UI state-report cadence (S2-09/S2-12)

- **Intent:** Explore a user-facing **visual state update frequency** / **Worker reports per second** setting in Advanced Settings, preferably a clearly labeled discrete slider with a documented default. The permitted positions/range (possible measured presets such as 5, 10, 15, 20, 30 reports/s) and whether an adaptive/automatic mode is appropriate remain **open decisions**, not selected values.
- **Separation:** This must never be mislabeled as simulation tick speed, Canvas repaint FPS, or CPU utilization. Lowering the report cap must not lower fixed simulation ticks, omit off-camera organisms, alter physical/biological calculations, omit energy receipts, or make observer replicas authoritative. Preserve immediate reset/action/paused inspection frames, accurate snapshots/exports, epoch protection and existing one-outstanding-frame ACK safety.
- **Evidence:** [Stage 3.5 fork draft PR #80](https://github.com/hernansgarro/vidAI/pull/80) and its [executive summary](https://github.com/hernansgarro/vidAI/blob/audit/performance-stage-3-5/docs/experiments/performance-stage-3-v6/executive-summary.md) report research-only cap 30→10/s: with 30 starting organisms 230.1→243.4 ticks/s (+5.78% median), but with 15 organisms 601.2→595.3 ticks/s (−0.99%, beneath small-effect certainty). Effective fresh Worker reports fell to about 8.7–8.8/s while Canvas stayed about 59–60 FPS. Two repeats on software-rendered CI do not establish a universal desktop benefit; visual smoothness, input freshness and per-thread CPU/GC attribution remain unknown.
- **Decision criteria:** Compare actual populated-Worker throughput and responsiveness at matched full-state checkpoints, with/without local tubes where appropriate, against perceptible motion stutter and input/selection latency. Distinguish requested cap from *achieved* report rate; measure Worker/main CPU/GC and transport cost before selecting a default or an automatic policy. The main-thread fallback must have defined behavior rather than advertising nonexistent Worker traffic.

### Candidate B — Invalidate/copy only changed visual layers instead of unconditional full redraw (S2-11/S2-12)

- **Current source-backed behavior:** `App.tsx` schedules `requestAnimationFrame` continuously and calls `drawRef.current(ctx)` on every callback (around lines 1715–1728); the draw function starts around line 1191. It fills the target, rebuilds the scene and draws organisms, nutrients, eggs, effects and annotations on each pass. `WorldSceneLayer.begin()` in `worldScene.ts` reuses one off-screen Canvas allocation but **clears its full contents each frame**; `finish()` reapplies the observer side-fade mask and composites it to the visible Canvas. This is not a persistent static-scene cache. An unchanged Worker state can therefore still incur a full presentation pass. Stage 3.5's ~60 FPS despite <10 fresh reports/s supports the cadence distinction, **not** a measured cost saving from skipped draws.
- **Candidate approach:** Investigate an explicit invalidation/dirty model (new authoritative render frame, camera/zoom/pan/viewport/DPR, scenario/observer settings, selection and interaction, topology/window controls, transient wall-clock animations, visual effects, overlays). Compare (i) skipping genuinely unchanged frames, (ii) caching safe static backgrounds, and (iii) layered/static-versus-dynamic redraw with unchanged visual ordering. These are alternatives to **measure**, not an assumed architectural recommendation.
- **Occlusion/compositing correctness:** Entities and overlays can overlap or move across layers. Transparent glows, eggs, body segments, side-window fades/masks, outlines and UI controls may require erasing/recompositing previously occupied pixels even if the background itself is unchanged. Avoid drawing a supposedly independent layer over stale foreground content; maintain equivalent z-order, masks, alpha, hit selection and camera transforms. Cache invalidation, memory cost and canvas resizing are first-class acceptance concerns.
- **Decision criteria:** Profile full scene-pass CPU/compositing costs, main-thread work, memory/GPU pressure where measurable, fresh-state latency, frame pacing, perceived motion quality and **actual Worker ticks/s**, not repaint FPS alone. Use the owner's active/minimal-observer (caustics OFF, no inspector) target and representative topology. A reduction in Canvas work may improve UI CPU yet have zero Worker throughput gain; do not promise one without a matched end-to-end comparison.

**Relationship:** Candidate A controls *how often authoritative render state is shipped*; Candidate B controls *when/how retained visual state is painted*. They are independent knobs that may interact. Stage 4 should evaluate both together for latency/smoothness and performance trade-offs, then request explicit approval before any implementation. No runtime/test/CI changes, new experiments, main/testing behavior changes or upstream submission follow from these notes.

## Future idea impact matrix (planning only)

This table preserves the present idea board as the authority for idea state and priority. It is a **capacity/test planning input**, not implementation approval. “Stage 1” means *inventory supported existing scenarios*, not create a new workload.

| Existing proposal | Audit relevance | Primary stage(s) |
| --- | --- | --- |
| **IDEA-023:** current CPU/glow concern | Main hypothesis: separate energy-receipt bookkeeping, observer draw, Worker, UI and GC | 1–4 |
| **IDEA-021:** nutrient boundary/contact geometry | More complex edge contact may change particle/geometry cost; compare circle/possible polygon only after design | 2, 3, 4 |
| **IDEA-022:** particle-particle collisions | Potential density-dependent pair count; examine spatial index options and high-nutrient stress; no collision code yet | 2, 3, 4 |
| **IDEA-010:** remote aquariums | Potential network serialization, authority and synchronization; not equivalent to current local tubes | 2, 4 |
| **IDEA-011:** portable organism state | Future serialization, historical compatibility, payload size | 2, 4 |
| **IDEA-019 / 020:** notebook/phone-sized worlds | Distinguish world-unit dimensions from physical display pixels/DPR and resource-constrained devices; dimensions undecided | 1 (existing viewport support), 2–4 |
| **IDEA-024:** scenario-specific initial zoom/framing | Future preset-selected camera distance or fit-to-tank view (Harsh World example); separate UI scale, position, visible-object count, culling and DPR from world size; no fixed value chosen | 1 (record existing zoom/viewport as confound), 2–4 |
| **IDEA-008:** sub-one-per-second nutrient appearance | Event rate/particle count influence stress profiles; not nutrient decay | 1 (current density), 2, 4 |
| **IDEA-009:** named custom scenarios | Future variability/reproducibility of benchmarks; no generated profiles now | 2, 4 |
| **IDEA-002–007:** egg decisions, funding, buoyancy and hatching | Future reproduction/egg dynamics change workload and fidelity; energy rules remain frozen | 2, 4 |
| **IDEA-013 / 014 / 017:** egg/mouth/side-wall observer layers | Rendering order, occlusion and composite cost; no physics changes implied | 1 (existing overlay controls), 2–4 |
| **IDEA-015 / 016 / 018:** phone workflow, compact observer UI, advanced toggles | UI layout, responsiveness and interaction frequency; not kernel work | 2–4 |
| **Completed IDEA-001:** Pipe World | **Existing fork feature** and large-world baseline candidate; not an unfinished proposal | 1 |
| **Completed IDEA-012:** retained local window agreements | Already implemented; benchmark current local tube behavior, do not reimplement | 1, 2 |
| **Upstream #67 / #62:** 100 creatures/1,000 parts, possible moving fluid | Performance target and speculative future fluid cost; #62 remains deferred research | 1 (inventory), 2–4 |

No future-world, remote-network, collision or moving-fluid scenario may be represented as an existing benchmark result without actual implementation evidence. The [current idea board](../ideas/IDEA_LAB.md), focused design notes and [completed-work register](../tracking/CONTRIBUTOR_COMPLETED.md) distinguish proposed from delivered behavior.

## Non-negotiable safeguards

- Preserve Worker-authoritative fixed ticks, complete offscreen simulation, precise exports, deterministic PRNG continuation, genetics, real physical feeding, conservation, recurrent learning and valid historical saves.
- Preserve current and prior physics regimes, existing tuned founders and all accepted science. Do not tune genetics/physics/diet or skip entities/ticks to inflate performance.
- Current observer glow/halos must remain an honest representation of actual energy transfer. A lower visual sampling rate may be explored as an **observer** trade-off; never suppress real simulation accounting.
- No undocumented changes to core equations, baseline files, saved schema, safety caps, dual Pages, release/deploy, GitHub Actions/CI gates, unrelated feature work or VIDA 3D.
- The branch `testing` and its pinned baseline remain untouched. Do not reset or re-run owner-stopped experiments.
- Keep this contributor-only plan out of a clean upstream submission unless the owner separately approves it. Link to upstream issue #67 for conceptual alignment without asserting that this contributor audit changes its priority/status.
- Keep planning, code and issue content in English; chat discussions with Hernan are in Latin American Spanish.
- Fork documentation/PR is not an upstream acceptance or release.

## Stage 2 execution receipt (2026-11-02)

The read-only [Stage 2 static analysis and Stage 4 handoff](PERFORMANCE_AUDIT_STAGE_2.md) was completed against the immutable contributor fork/main commit `bf75b5649c6d843c48586acca59c51830678e316`. It contains S2-01–S2-12 code-backed hypotheses, loop-growth variables, risk tiers A–D, existing optimizations, future-feature boundaries and proposed Stage 3 falsification measurements. **No runtime bottleneck, cost fraction, speedup or optimization was measured or implemented in Stage 2.** Stage 1 measurements from another session require separately verifiable archival/provenance. This is a **Stage 2-only receipt**; consult the current target above and separately preserved Stage 3 evidence for later status. Stage 4 synthesis and optimization are not approved here.

## Owner-priority refinement and Stage 3 measurement design (2026-11-02)

Hernan's [within-audit investigation order, owner questions, Stage 3 measurement candidates and Stage 4 decision criteria](PERFORMANCE_AUDIT_PRIORITIES.md) overlay the completed [Stage 2 hypothesis register](PERFORMANCE_AUDIT_STAGE_2.md). This ranks S2-10, S2-11, S2-02, S2-03, S2-04, S2-09, S2-12, S2-06 and S2-08; S2-01/05/07 remain diagnostic coverage. **Glow attribution is first, not a diagnosis.** S2-03's heritable variable ray subset is a distinct exploratory [IDEA-025](../ideas/IDEA_LAB.md#idea-025-heritable-per-eye-ray-subsets), not permitted profiling instrumentation. The user requested **documentation only at this 2026-11-02 planning checkpoint**; it did not itself authorize trials or optimization. Later Stage 3 work and current operating-profile decisions must be assessed from their own receipts and approvals, without rewriting earlier results.
