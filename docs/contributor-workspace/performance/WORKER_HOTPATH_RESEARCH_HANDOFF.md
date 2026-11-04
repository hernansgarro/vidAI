# VIDA 2D — Stage 3 Worker hot-path research handoff

## Current evidence checkpoint — Stage 3.8–3.12 (2026-11-04)

Hernan explicitly requires verified conclusions in fork **main**, while raw evidence,
profilers and temporary launch workflows remain on isolated research branches.
The [cumulative Stage 3 ledger](../../PERFORMANCE_AUDIT_STAGE_3.md) is the current
scientific entry point. Older dated checkpoints below are historical, including
their then-current STOP/next-study wording; they are not permission to replay trials.

| Lot | Verified outcome | Primary finding / limitation |
| --- | --- | --- |
|3.8 / draft98 |PARTIAL:6retained, P07 raw lost,11unstarted |25–150 scaling; compact100 initially overlaps68pairs and triggers8guards; +62.2% cost is confounded. Storage guard stopped the lot. |
|3.9 / draft99 |PARTIAL:10retained,8unstarted; runner739.927s>720s |Initially separated dense100 costs20.60% more;2.13x visual candidates/4.54x edge tests.150spread51.61–56.57TPS. GC/finite pacing not reached. |
|3.10 / draft100 |COMPLETE:8/8, all budgets pass |150spread lean53.46–54.15TPS; requested1x53.16TPS,2x55.13TPS. HooksOFF/counter/phase/trace elapsed contrasts+3.34/+10.08/+11.62/+59.92%, n1diagnostics. |
|3.11 / draft102 |COMPLETE:6/6, all budgets pass |Lean66.14–66.68TPS on differentCPU; light GC2.37–2.53%with modest-cost flag passed, detailed42.36%with+65.11%elapsed cost. |
|3.12 / draft104 |COMPLETE:6/6, all budgets pass |Allocation ownership: broadkernel35%,physics advance19%,query11.4–11.6%,bodySight7.4–8.2%,pairs3.7–4.0%weighted samples; not CPU/savings. |

**New3.12 ownership evidence:** two Worker profiles identify repeatable closest
original-stack callers with99.92–99.94%weighted coverage and9/10top sites shared.
The broad stepSimulation35%bucket remains internally unresolved; physics advance
19%,spatial query11.4–11.6%,bodySight7.4–8.2%,contact pairs3.7–4.0%are allocation
weights, NOT CPU costs or removable savings. Source confirms temporary result/
sight/pair collections while existing scratch/caches/contact pools remain present.
Preserve exact ordering, geometry, reentrancy and physics/learning semantics.

Sampler/light elapsed contrast+1.054%is within control variation; both observations
meet the preregistered5%light-envelope criterion. n2/sixseconds/oneCIscenario,
sampling pre/post-roll and different host limit inference. stopSampling potential
forcedGC is AFTER useful/CPU/trace closure, before full export. Ordinary GC still
occupies~2–3%under light observation. Source ownership is now evidenced; allocation
creation/transfer CPU cost, live retention/leaks and a safe optimization gain remain
unisolated. See [main cumulative conclusions](../../PERFORMANCE_AUDIT_STAGE_3.md).

**Calibrated interpretation:**3.11 light outer-GC occupies2.37–2.53%Worker wall,
while detailed tracing adds65.11%elapsed cost and reports42.36%GC. Post-hoc raw
scope analysis locates95.57–96.08%of detailed outer-GC in object-statistics dumping;
immutable3.10's old35.50%GC-related measurement similarly contains94.38%observer
object-statistics work. Preserve old measurements, but **do not prioritize ordinary
GC pauses from that detailed percentage**. Allocation/transfer creation costs are
separate and unisolated; positive heap reductions are not retained/allocated bytes.
No leak or removable speedup established. Optics/physics/inference phases retain
their own perturbed-evidence boundaries; nothing is added or subtracted across probes.

New3.11 hostEPYC9V74 differs from3.10EPYC7763, so higher leanTPS is NOT a code
improvement or rebuttal of the previous host's1x/2x result. Both light observations
meet the preregistered lean-envelope±5%descriptive criterion; n2/fixedorder/sixseconds
and import/warmup heap context limit interpretation. See the current
[cumulative ledger](../../PERFORMANCE_AUDIT_STAGE_3.md) and its immutable3.11report.

**Current next action:** STOP after completed3.12 and authorized docs integration.
Hernan's instruction places verified3.8–3.12 conclusions on main, while research
code/raw/workflows stay isolated and drafts98/99/100/102/104 remain unmerged. No automatic
new lot, Stage4/product optimization, upstream submission or historical-trial replay.
Review accumulated evidence before any new separately authorized work. Historical
dated checkpoints below retain their original status and are not executable orders.

## Current checkpoint — Stage 3.7b recovery COMPLETE (2026-11-03)

Hernan explicitly authorized a recovery after the previous stopped lot. All 12 registered windows completed once; source57a7d45, original evidence66a89ed, [research DRAFT #92](https://github.com/hernansgarro/vidAI/pull/92), [report](https://github.com/hernansgarro/vidAI/blob/8481613ce08be6137d347cf0d8b9eabb0aed8130/docs/experiments/performance-stage-3-v9/report.md). [Cumulative findings](../../PERFORMANCE_AUDIT_STAGE_3.md) contain verified phase costs, actual counterfactual TPS, controls, independent GC/CPU, divergence and conservation. Vision +53.11%, brain-output +19.53%, learning OFF +6.88%, synthetic feeding +1.79% versus nearby real controls; one window each, real-control spread6.78%, no additive/removable CPU interpretation or production-safe benefit established. Physics/contacts dominate the separate phase ledger, then vision and inference. Counter/frame draining and early raw preservation now verify correctly.

This supersedes pending-throughput status, not the immutable original failed P01. All probes/raw/checkpoints remain isolated and unmerged. Active201.978s/runner357.601s/111,808,143rawbytes within bounds; scientific run41729322675 succeeded with required installation/fast/build/Worker/focusedChromium gates. Temporary workflow removed; reference YAML outside.github. Main receives documentation only. Stage3 remains ongoing; STOP after this lot. No automatic new study, upstream submission, production optimization or Stage4 authorization. Earlier checkpoints below are preserved dated history.


## Latest execution handoff — Stage 3.7 BLOCKED; stop (2026-11-03)

The owner subsequently launched the Stage 3.7 Work request, superseding the design-only stop below for that one lot. Measured sourcef0db3e4, base73ee85b; research branch `audit/performance-stage-3-7`, [draft #90](https://github.com/hernansgarro/vidAI/pull/90), [report](https://github.com/hernansgarro/vidAI/blob/f846d67939e32d46a398768c082368dea2d553b7/docs/experiments/performance-stage-3-v8/report.md), original evidence812f511. Eight fixed120-tick controls passed complete all-real equality and independent dummy/closed-energy validation. P01 failed because the harness used `frame().steps` as a cumulative counter; zero valid TPS windows, 11 unstarted. Boundary/endpoint objects from that slot were not archived: preserve the missing observation and do not reconstruct TPS. No rerun/second campaign.

Short cold phase diagnostics and deterministic dummy divergence are in [fork-main cumulative findings](../../PERFORMANCE_AUDIT_STAGE_3.md). No calibrated overhead, sustained dummy speedup or new CPU/GC result. Synthetic feeding transferred60J directly from available universe reserve, capped by stock/storage and without physical-contact learning cues. All pilot world energy errors <=3.73e-9J. Physics replay deferred. Independent count/raw-failure plumbing repaired, compile-only; no additional ticks run. Runtime production files and historical research PRs remain unchanged; temporary workflow removed, YAML retained outside.github.

**Precise next action:** STOP for owner review. If and only if explicitly authorized, preregister a new bounded recovery with independent cumulative tick counting, failed-window raw-object preservation and independently priced probe overhead; preserve P01 as failed/missing and reuse immutable controls where appropriate. Do not silently repeat/replace it or promote research. Main contains documentation only; raw/probes remain unmerged. Stage3 ongoing; Stage4, upstream submission and production optimization unauthorized. The following sections are preserved historical planning, not an instruction to execute another study.



## Owner refinement — Stage 3.7 dummy-substitution experiments (2026-11-03)

**Latest planning decision, no execution yet.** Hernan requests a revised Work prompt that combines detailed Worker phase/subphase instrumentation with **controlled counterfactual component bypasses**. Refer to the new [Stage 3.7 Dummy Substitution Design](STAGE_3_7_DUMMY_SUBSTITUTION_DESIGN.md), the [updated plan](PERFORMANCE_AUDIT_PLAN.md) and the [fork-main Stage 3 ledger](../../PERFORMANCE_AUDIT_STAGE_3.md).

Preferred candidates: replay a genuine vision event or fixed/cyclic typed sensor input; replace brain evaluation with a known one- or multi-step fixed motor/output sequence; switch learning completely OFF as a dedicated research-mode control; bypass contact-based feeding while replaying documented transfers or accounting for a *small fully funded* artificial intake. A global A/B/C generator is possible but order-dependent; a deterministic per-organism/tick/channel selector is the stronger comparison default, without touching authoritative PRNG. Do not quietly equate bypass gains with removable CPU cost: altered behavior and ecology affect downstream work. Shared global contact physics makes a valid physics dummy particularly difficult; defer if replay would falsify semantics.

All-real Worker execution stays unchanged and exactly validated. Dummy-on runs are labeled nonphysical counterfactuals, never saved as valid evolution or promoted to production. The scientific window budget and new protocol still require separate Work authorization. Only documentation in this task; no Stage 3.7 trials, implementation, upstream PR or Stage 4 optimization.

## Current continuation note — updated after completed Stage 3.6 (2026-11-03)

This top-level note **supersedes only the earlier time-specific references to Stage 3.5 as the latest completed batch** below; historical language and evidence remain unchanged. Stage 3.6 has now completed the independent Linux CPU/thread/GC attribution described in [fork draft PR #87](https://github.com/hernansgarro/vidAI/pull/87), with original immutable evidence at [eed47f7](https://github.com/hernansgarro/vidAI/tree/eed47f7f211936022c06af04edc40d199b518ed2/docs/experiments/performance-stage-3-v7). The complete Stage 3.1–3.6 cumulative findings now have a durable fork-main [research evidence ledger](../../PERFORMANCE_AUDIT_STAGE_3.md) linked to immutable historical branches. **Research scripts, trace data and measurement infrastructure remain outside fork main.** This documentation update does not merge PRs #66/#69/#80/#87 or publish production changes.

**What Stage 3.6 changes:** Worker and UI each spend roughly a logical processor; additional software graphics is also substantial. Worker is about 35% of browser CPU, despite its previous 96–98% Worker tick-wall attribution. Cap30→10/s improved median ticks/s by 5.33% but hardly changed total CPU utilization and included one negative pair. Actual GC and substantial transient allocation were measured in diagnostics, but tracing perturbed speed. Source-mapped anchors/queries/somatic writeDeltas/contacts are sampled hot locations, **not exclusive percent-of-CPU or removable costs**. Full report: [Stage 3.6 research](https://github.com/hernansgarro/vidAI/blob/eed47f7f211936022c06af04edc40d199b518ed2/docs/experiments/performance-stage-3-v7/report.md). No desktop hardware, heat or watts conclusion.

**Current next direction:** Hernan prioritizes a *finer decomposition* inside the authoritative Worker, not another broad cadence matrix or immediate optimization. For proposed Stage 3.7, independently account for full tick and exclusive nested phases; add targeted operation counts and separate memory/GC diagnostics; control timer/profiler overhead and ensure no nested double counting. Specific source candidates: cardinal anchor/pose geometry, spatial-index build/query/visibility, body/contact candidate construction and resolution, somatic neural deltas, recurrent inference, feeding/ecological passes and birth/death/egg spikes. Include an “other” residual bucket; quantify scaling and absolute cost, not only percentages. Use the [updated audit plan](PERFORMANCE_AUDIT_PLAN.md) and [Stage 2 model](PERFORMANCE_AUDIT_STAGE_2.md) to design a **new separately preregistered and budgeted Work lot**. This note itself is not execution authorization.

**Secondary UI interest:** consider static-layer/invalidation/dirty-region redrawing later, but static camera does not mean no change in world pixels. Do not discard organism movement, nutrient drift, observer effects, camera/resize input or stale-state guarantees. Measurements on SwiftShader must not be treated as hardware GPU performance. Stage 3 stays ongoing and Stage 4 optimization remains unapproved. The old “next authorized action” at the bottom was specific to its original dated documentation-only task and is now historical.


> **Recorded 2026-11-03 by contributor request; documentation only.** This is a recoverable planning/handoff note under fork-only IDEA-023 (P0), **not** a completed experiment, an optimization design approval, permission to launch Work, or an upstream decision. The owner has paused further Work execution to preserve limited credits for a separate upstream PR. Resume only after a new explicit request, a bounded approved protocol, and review of the latest repository/issue state. **Stage 3 remains ongoing and stopped after Stage 3.5; Stage 4 synthesis/optimization is not authorized.** Here, Stage 4 means the four-stage **performance audit**, not remote tube Stage 4.

## Owner intent and rationale

- The owner's emerging hypothesis is that **the most valuable next bottlenecks to investigate may lie inside the authoritative simulation Worker**, rather than primarily in Canvas drawing or Worker-to-UI reporting.
- Prioritize identifying *which internal computations consume time*, *how their cost scales with real organism/body/sensory/neural/ecological loads*, and *what portion could be redundant or avoidable without changing the physical/biological simulation*.
- Do **not** turn this into the established conclusion that the Worker contains inefficient algorithms or that UI/transport cannot constrain throughput. A large unavoidable kernel cost and a correct but CPU-bound simulator are different from a removable bottleneck. Thread scheduling/CPU competition and GC remain open alternative explanations.
- The immediate deliverable **today** is only durable documentation so a later assistant can draft a suitable prompt for Work. The owner did **not** request that prompt, a new scientific run, implementation, merges upstream, or any code change now.

## Evidence supporting the focus — and what is not proven

| Source/evidence | Supported observation | Important limitation |
| --- | --- | --- |
| [Stage 3.5 report](https://github.com/hernansgarro/vidAI/blob/audit/performance-stage-3-5/docs/experiments/performance-stage-3-v6/report.md) / [fork draft PR #80](https://github.com/hernansgarro/vidAI/pull/80) | About **96–98% of measured Worker wall time** is attributed to tick execution under the sampled active MAX workload. The work runs in short yielding batches. | This is **wall-time attribution, not per-thread CPU utilization**. It can include preemption/GC. It does not by itself prove an avoidable hot spot. |
| Same Stage 3.5 study | At 15 starting organisms, report cap 30→10/s changed throughput **601.2→595.3 ticks/s (−0.99%)**; at 30, **230.1→243.4 ticks/s (+5.78%)**. The 30-organism effect repeated with paired +3.58%/+8.13%. | Only two reversed-order repetitions/configuration; 15-organism effect lies below reliable small-effect resolution. Populations differ in anatomy/genetics/placement, so 15-vs-30 is not a pure organism-count scaling experiment. The 30-organism benefit has **unknown causal mechanism** and is not a recommended production setting. |
| Same Stage 3.5 study | Directly timed synchronous `postMessage` was roughly **0.4–0.7 ms/send**. A lower cap reduced its measured Worker-wall share but does **not** explain the full throughput contrast. Canvas remained about **59–60 FPS** despite only ~8.7–8.8 fresh Worker frames/s at cap 10. | Main/Worker CPU, Worker GC, memory/cache and scheduling attribution are **unknown**. Canvas FPS is not fresh-state motion quality; the reporting/redraw ideas remain separate Stage 4 decision candidates. |
| [Stage 3.5 report, historical Stage 3.1 context](https://github.com/hernansgarro/vidAI/blob/audit/performance-stage-3-5/docs/experiments/performance-stage-3-v6/report.md) | Earlier coarse observations highlighted **optics/update ~34–40.5%**, **articulated physics/contacts ~27–38.8%**, and **neural/learning ~18.8–26.9%** in their original fixtures. | These are historical coarse timing shares under other setups, **not current per-thread CPU shares**, not confirmed waste, not independently additive removable budgets, and not newly split by Stage 3.5. |
| [Stage 2 source review](PERFORMANCE_AUDIT_STAGE_2.md) | Repeated substeps/contacts, optics index/ray construction, neural operations, feeding/ecology, allocation/GC and tube topology have specific code-backed hypotheses and stable S2 IDs. | Static costs, Big-O and loop counts **do not measure** end-to-end bottlenecks or guarantee optimization benefits. Existing caches/indexing/scratch buffers already eliminate some naive proposals. |

**Interpretation:** This is sufficient justification for **changing the focus of the next *proposed* Stage 3 analysis** toward internal Worker costs; it is insufficient to declare that rendering/transport are negligible or to begin optimizing. The separate [Stage 3.5 recommended follow-up](https://github.com/hernansgarro/vidAI/blob/audit/performance-stage-3-5/docs/experiments/performance-stage-3-v6/executive-summary.md) remains an **unexecuted** 30-organism cap 30/10 contrast with independent Worker/main CPU and GC attribution; it is a useful diagnostic/control, not a silently replaced or automatically approved study.

## Current architecture and cost map to verify on resumption

At the fork snapshot used for this handoff, `simulation.worker.ts` performs MAX yielding batches through `host.tick()`; `SimulationHost.tick()` in `simulationHost.ts` calls `stepSimulation(..., 1/60, ..., energyActivity.record)` and then `energyActivity.advance()`. `SimulationHost.frame()`, transport and render replica are **separate**, less frequent observer paths. The UI `App.tsx` runs its own animation-frame redraw loop. Re-read these files on the **then-current** fork/main before using old line numbers or committing instrumentation.

Candidate decomposition, preserving the original Stage 2 ID vocabulary:

| Stable source hypothesis | Substeps worth separating in a future profile | Potential avoidable-work *question*, not an approved change |
| --- | --- | --- |
| **S2-01 — articulated physics/contacts** | Bodies, motor/drag, joints, broadphase candidate generation, narrowphase contact/impulse, actual contact/solver iterations across physical substeps | Rebuilt bounds/cells or scratch allocations? Poor scaling with **actual contacts/density**, not merely count? **Do not** cut physical substeps, solver iterations or off-camera work. |
| **S2-02 — derived mass/geometry** | Invariant mass/inertia/dimensions versus pose-dependent corners/transforms and use inside contacts | Repeat derivations at each physical substep? Correct cache/scratch lifetime and invalidation? Beware arithmetic-order and historical-save sensitivity. |
| **S2-03 — optical sensing** | Sight/index build, ray corridor candidates, ordered queries, exact intersection/occlusion, result allocations | Excessive index rebuild/query allocations or poor high-density candidate ratios? Preserve the current ray count, ordering, RGB and neural input semantics. |
| **S2-05 — recurrent neural/learning** | Input preparation, recurrent hidden/output accumulation, learned/somatic updates and actual allocation/GC | Dense-vs-sparse work, buffers, topology misses? **Compiled topology/WeakMap and somatic scratch already exist**: do not propose them as brand-new optimizations. |
| **S2-04 — feeding/contact** | Oral broadphase, exact mouth/egg/prey/food contact, index rebuilds, consumption/accounting | Repeated rebuilds or scans under high food/mouth density? Preserve exact feeding and absorbed joules/order. |
| **S2-06/07 — ecology/energy/reproduction** | Nutrient decay/mineralization, expiry scans, eggs/incubation/hatching, lineage/energy accounting | Repeated collections, scans or allocation spikes during births/deaths? Do not suppress funded ecology or biological events. |
| **S2-08 — active local tubes** | Topology/wall queries, physical crossings, off-camera inhabitants, authoritative transfer | Real crossing cost may grow; previously recorded tube workload did **not** establish a crossing bottleneck. Keep as a **separate bounded workload** if authorized. |
| **S2-09/10/12 — observer/transport/scheduler controls** | Energy-event collection in tick, frame construction/send/ACK, main replica, RAF, Worker scheduling/yields and GC | Keep measured observer costs distinct from physical tick costs. These are necessary controls, not presumed primary optimization targets. |

The historical Stage 2 model notes fixed **60 logical ticks/simulated second** and **four physical substeps/tick**, with variable contact-pass counts; do not confuse those with real achieved ticks/s, CPU occupancy, or mandatory full maximum iteration counts.

## Recommended *future* research sequence (not executable authorization)

1. **Recover and reconcile evidence before proposing any new run.** Read latest upstream `AGENTS.md`, upstream [#57](https://github.com/smeagol44/vidAI/issues/57), [#67](https://github.com/smeagol44/vidAI/issues/67), fork `AGENTS.md`, workflow, current [four-stage audit plan](PERFORMANCE_AUDIT_PLAN.md), [owner priorities](PERFORMANCE_AUDIT_PRIORITIES.md), [Stage 2 hypotheses](PERFORMANCE_AUDIT_STAGE_2.md), scientific Stage 3 reports, draft PRs [#66](https://github.com/hernansgarro/vidAI/pull/66), [#69](https://github.com/hernansgarro/vidAI/pull/69), [#80](https://github.com/hernansgarro/vidAI/pull/80), their evidence and stop points. Verify actual fork/main/upstream heads, research branches, outstanding proposals, and recent authorized work. Do not assume that a report's historical source SHA is current, merge experimental PRs, refresh baselines, or rerun already completed trials. If a later authorized investigation has superseded this handoff, reconcile rather than duplicate it.
2. **First separate the complete Worker tick into mutually exclusive coarse accounting buckets.** Trace the actual current `stepSimulation` call tree and identify phase boundaries where aggregation will not double-count nested physics/sensory calls. Include an **other/unattributed** bucket and cross-cutting allocations/GC. Report tick time and per-phase cost as wall-clock (with clear limitations), and independent thread CPU when it can be obtained. Do not assume that adding per-operation timers is cheap; use bounded sample/coarse counters and measure probe overhead.
3. **Investigate scaling rather than just top percentages.** Use representative **active** MAX workloads with minimal presentation, including 15/30-organism evidence as reference, but design any new comparison to control/checkpoint anatomy, joint/part count, eyes/rays, recurrent network size, mouths, nutrients/carrion, eggs, real contacts/density, birth/death evolution, topology and visible/off-camera state. Different founding populations **cannot isolate** an organism-count coefficient. Test separately which phase grows linearly or superlinearly and report cause-oriented counters (calls, candidates, iterations, allocations), not just source loop bounds.
4. **Distinguish compute from scheduling and memory pressure.** If feasible, add a separately priced diagnostic trace of Worker/main thread CPU, GC/allocation, idle/wakeup time, tick batch distribution and observer/transport activity. Compare a minimally instrumented **lean throughput** run to a separate **profiled diagnostic**; never treat profiled speed as an ordinary baseline. Keep the Stage 3.5 cap 30-vs-10 with 30 organisms as a **distinct optional attribution experiment** requiring its own preregistration, not a compulsory repeat.
5. **Rank only measured pain points.** For each candidate record: affected paths, real input/workload, **absolute ms/tick** and share of Worker tick time, distribution (median/tails), scaling and variability, real/allocation CPU/GC evidence, instrumentation uncertainty, existing optimizations, which operations are physically essential versus potentially redundant, exactness risks and a bounded falsification/next test. A dominant **essential** phase is not necessarily a good optimization. Use Amdahl-style upper bounds cautiously; do not promise additive speedups or invent CPU savings from wall-time reductions.
6. **Stop with a research report and Stage 4 decision input.** Produce a reproducible, linked, uncertainty-aware hotspot register and proposed experiments/optimizations for owner discussion. No production optimization, release, upstream PR or promotion of Stage 4 follows automatically. Any later Stage 4 implementation requires the owner's **new explicit approval**.

## Protocol and evidence gates to include when a future Work prompt is actually requested

**Before executing scientific measurements**, first negotiate/preregister a **single bounded lot**: purpose and S2 IDs; exact fork SHA/base/branch and current upstream reference; primary and control checkpoints/seeds, full starting state/PRNG, anatomy/eyes/neurons/food/eggs/crossings; scenario/settings, caustics OFF, no selection/track/inspector, camera/viewport/DPR, hardware/OS/browser/backend, active MAX; warm-up, logical/wall-time windows, repetitions/order; per-run and total wall/CI budgets, trace and archive byte budgets, overhead-control method, expected acceptance metrics, stop/failure/retry rules. All unknown quantities are **to be determined at future authorization**, not invented here.

- **Primary metric:** authoritative completed Worker ticks / measured Worker-wall interval and achieved simulated-time multiplier. Also report median/p95/p99 tick or phase durations when statistically meaningful; sample count, distribution and workload count evolution. Never substitute Canvas FPS, requested MAX speed, a paused scene, kernel-only Node time or a profile-only rate.
- **Independent diagnostics:** Worker/main CPU attribution (if available), memory/GC, contact candidates and solver iterations, per-ray queries/intersections, neural evaluations, food/egg scans and entity churn, frame sends/ACK, UI responsiveness and visual truthfulness. Explicitly say **UNKNOWN** where browser/runner cannot measure a metric.
- **Controls:** same initial full authoritative state and PRNG/settings, same physics/senses/learning/feeding/ecology, equivalent visibility and tubes. Separate simulation-tick equality validation at fixed **logical ticks** from equal-wall throughput windows (whose endpoints naturally diverge). Preserve source/commit identifiers, artifact hashes and every failed/negative observation. Use reversible research-only probes; never inject hidden fitness, tune creatures, disable learning, skip offscreen physics or simplify biology to get faster numbers.
- **Profiling overhead:** compare lean vs instrumented probes in a preregistered order; isolate sampling distortions and avoid claiming sub-percent effects from an unstable control. Record OS scheduling/GC uncertainty; sampling or timestamps do not automatically measure CPU use.
- **Execution and branch rules:** Use a fresh **fork-first research branch** with scope and protocol recorded in the proper upstream tracking discussion **when later explicitly authorized**, protect historical research drafts and testing/main isolation, never run expensive/duplicate scientific campaigns without permission, do not alter VIDA 3D. Use `npm ci`, `npm run test:fast`, `npm run build`, `npm run test:worker` and focused browser checks **as applicable to the eventual changes**, without weakening required gates. Docs-only capture today requires no simulation tests.
- **Deliverables:** approved protocol; raw archives/manifest/hashes/reproduction recipe; exactness and overhead verification; full scientific report; concise executive summary separating confirmed/plausible/refuted/unknown; ranked hotspot table; limits and next decision with fork PR/status. Do not report a speedup without measured end-to-end evidence. Explicitly preserve any lost-trial uncertainty and stops.

## Prompt-generation handoff for a future assistant

When Hernan later asks **for the Work prompt** (not now):

1. Re-open **this document** and the linked audit plan, report #80, Stage 2 hypotheses, latest Stage 3 evidence and applicable upstream issues; verify repository status and whether credit/time restrictions or owner stops have changed.
2. Ask/resolve **only genuinely missing consequential choices** (especially whether the next bounded task is **A: coarse phase-level Worker profiling** or **B: independent CPU/GC attribution on the 30-organism report-cadence contrast**, or a staged combination if the owner explicitly approves it). **Default recommendation:** start with bounded coarse phase-level hotspot accounting and scaling evidence, but include CPU/GC control where feasible; avoid unbounded profiling.
3. Draft a **self-contained, implementable English Work task prompt** that specifies the exact research goal, repo/branch/issue references, source evidence, authorized scope, required measurements and checks, cost/stop guards, outputs and forbidden side effects. Introduce/explain that prompt to Hernan in **Latin American Spanish**. Do not present this handoff as if it were an approved experimental protocol.
4. **Wait for separate explicit authorization** before running a study, changing runtime code, spending a new trial budget, opening upstream PRs or merging research-only branches. If asked to draft only, produce the prompt without execution.

## Current stop and ownership

**Status at this handoff:** Stage 3 research and hotspot hypothesis remain **open**; Stage 3.5 is completed and archived in fork draft PR #80; no new Worker dissecting/profiling trial was run under this discussion; Stage 4 (performance synthesis) not started. Contributor-only document, not canonical upstream roadmap, not an approved source for a future upstream PR. Hernan is intentionally deferring new Work usage to conserve credits for a separate upstream submission. Do not consume them on automatic CI/research runs.

**Next authorized action today:** merge **only this documentation handoff and lightweight navigation links** to the contributor fork's `main` through a fork-internal docs-only PR, then stop. No upstream write, science run, production/Worker/Canvas change, testing branch change, Wiki/Pages/release change.
