# VIDA 2D — Contributor performance audit: investigation priorities and Stage 3/4 decision questions

## Current evidence checkpoint — Stage 3.8–3.10 (2026-11-04)

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

Stage3.10's traced Worker GC-related union35.50% and allocation proxy281.58MB/s
are **trace-only**. The trace perturbs throughput substantially; neither is an
untraced GC cost, retained-heap/leak result or recoverable speedup. Instrumented
150body vision+sight32.60%,physics28.29%,inference23.58% are separate elapsed phases,
not additive with GC and not independently removable CPU. All8complete endpoints
match3.9 exactly. Representative desktop, evolved populations, egg bursts and
per-allocation ownership remain gaps. Earlier3.1–3.7b data/failures are preserved.

**Current owner authorization:** a NEW worthwhile bounded investigative lot may
run after explicit goals/metrics/protocol registration. Selected3.11 question:
does meaningful GC evidence survive a less intrusive category-filtered trace?
Six150body windows, two each lean/light-GC/detailed-GC, fixed reversed order and
exact360tick endpoint controls, are to be preregistered before execution. This
supersedes the previous task's stop for this new lot only. No production optimization,
Stage4 implementation, upstream submission or old-result replacement is authorized.
Afterward publish verified3.11 conclusions in main as well; research PRs stay unmerged.

> **Hernan's decision input, 2026-11-02; documentation only.** This is an overlay on the immutable [Stage 2 static source review](PERFORMANCE_AUDIT_STAGE_2.md) and the [approved four-stage audit plan](PERFORMANCE_AUDIT_PLAN.md), not an executed benchmark, permission to instrument, an optimization specification, an upstream decision or a performance guarantee. Keep the original S2-01–S2-12 IDs stable.
>
> **Reference:** `hernansgarro/vidAI:main` inspected at `bf75b5649c6d843c48586acca59c51830678e316`; Stage 2 integrated at fork/main `d926557ac6ea09895afa8895311734e68290c55e`. Source facts below refer to that pinned implementation. Current/future source heads must be rechecked before the Stage 3 Work run. **IDEA-023 remains overall contributor P0.** The ranking below is *within this audit only*.

## Current priority override — 2026-11-03

**Hernan has changed the operational objective after completed Stage 3.4.** This is a forward-looking audit priority decision, not a rejection or rewrite of historical Stage 1/2/3.4 evidence. Follow the [current benchmark profile](PERFORMANCE_AUDIT_PLAN.md#current-measurement-target--owner-decision-2026-11-03) and [shared decision receipt](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6607358209). The owner-selected 2026-11-02 order **below remains a historical snapshot**; it is superseded for planning future experiments and Stage 4 optimization ranking.

**Target:** speed of the **running** simulation with multiple organisms and only indispensable observer detail. Every new primary measurement uses shipped `showCaustics=false`, no creature selected/tracked and no brain/inspector or optional sensory overlay; if other validated low-cost observer settings become available, consistently enable their cost-saving modes. Keep physical organism, ecology, energy and all authoritative off-camera computation intact. Tube-connected **and** disconnected worlds must remain eligible, including crossings when relevant. Do not profile paused/0x display or decoration-enabled scenes as target workloads. Limited correctness/causal controls require their own bounded, preregistered justification.

**Measure and rank in this order of decision criteria (not a premature component speed ranking):**

1. **Actual active simulation capacity:** Worker completed ticks/s and multiplier under MAX for populated, representative, **caustics-OFF** checkpoints; optionally a finite nonzero speed for an explicit pacing guardrail. Always report entity/part/eye/neuron/food/egg loads, evolution and exact topology. Preserve a minimum usable view and report its responsiveness separately.
2. **Essential compute hotspots:** S2-01/02/03/04/05/06/07 — articulated physics/contacts, invariant derivations, sensing, feeding, recurrent brains and learning, ecology/eggs/lineage — with allocations/GC as cross-cutting causes. Rank by measured active throughput effect, *not* historical paused FPS or an unvalidated `O(N)` prediction.
3. **Worker/observer interaction in the minimal mode:** S2-09/10/12 — frame construction/serialization, send cadence and ACK, main replica/RAF, energy-activity bookkeeping and necessary drawing. A bottleneck must be measured as relevant to Worker progress or a meaningful display guardrail. Existing one-frame backpressure and cap30 are part of the baseline; do not assume they are absent.
4. **Real gameplay variation:** S2-08, connected versus disconnected local tubes, crossings and off-camera residents; varied populations/density and world presets. Tube authority/physics must remain enabled in relevant scenarios.
5. **Not current optimization targets:** S2-11 expensive water caustics **when ON**, paused redraw, selected-organism/brain-panel diagnostics, and optional decoration quality. Their existing evidence remains scientifically valid and explains why we choose the minimal view; it does not justify more routine time spent benchmarking them.

**Reassessment of completed stages:** Stage 1 tools, provenance and correctness baseline remain useful but legacy/empty-world results are not a realistic active minimal-view benchmark. Stage 2 static hypotheses still apply; only their future applicability/priority changes. **Neither stage needs a wholesale rerun.** A new targeted active Worker baseline or tube comparison, if needed, is a **new approved Stage 3 experiment**, not a repaired/repeated historical trial.

**Open Stage 3 decision:** the proposed `30/s` versus `10/s` Worker report-cap experiment at fixed caustics OFF and active 15/30 MAX remains relevant, but is **only a proposal**; Hernan has not approved a new experiment or production scheduling change with this directive. Similar future tests must use matched authoritative checkpoints, an explicit budget and exact-state validation. Stage 4 remains a later synthesis/approval gate.

## 1. Combined investigation order (owner preferences × technical triage)

Hernan explicitly elevated **S2-02, S2-03, S2-04, S2-06, S2-08, S2-09, S2-10, S2-11 and S2-12**. The order below keeps only those requested priorities in the primary sequence and applies the previously proposed technical ordering *within* that owner-selected subset. The reported glow correlation is the first **question**, not accepted causation. Each ID retains separate evidence and decisions even when paired in one experiment.

| Rank | S2 ID | Owner's specific review question; evidence first, no optimization authorized | Stage 3 evidence to request | Potential Stage 4 decision |
| --- | --- | --- | --- | --- |
| **1** | **S2-10 — energy-activity bookkeeping** | Is detecting/qualifying actual gain/loss events more elaborate or frequent than needed for a simple, truthful human indicator? Separate real joule receipts from observer aggregation and retention. Linear per-ID organism lookups are an existing candidate; do not drop actual accounting. | Event counts/tick and recipient/part cardinality, collector `record` and `advance` CPU, time-window aggregation allocations, listener lifetime and accurate positive/negative classifications. Compare against a passive, observer-only equivalent-state control without changing any authoritative receipt. | Exact ID lookup / buffer reuse (A) versus separately accepted less granular observer signal (B); preserve true transfer and paused/intervening-frame semantics. |
| **2** | **S2-11 — glow and Canvas drawing** | Are repeated glow contours, drawing of hidden bodies, offscreen world-surface composition, caustic blur or other filters actually expensive? Can the visible signal be simpler without misleading viewers? | Browser trace per Canvas pass, number of illuminated segments/drawn strokes, offscreen segments, pixels/DPR, RAF paint/FPS, glow vs caustic/food glow/mask costs and controlled visual comparisons at **identical authoritative state**. | Exact visual culling/precomputed geometry (A) or clearly approved appearance/sampling compromise (B). No offscreen simulation skipping. |
| **3** | **S2-02 — repeated physical derivations / cache lifecycle** | Which dimensions/masses/inertias/anchors remain invariant within a genotype and physics regime? Should reusable values be cached, and how should stale data leave memory? | Per-substep recomputation counts and time, cache-hit projections, memory/GC/retained objects, cold vs warm trials and exact-state replay. Evaluate `WeakMap` keyed by genome or immutable identity, explicit invalidation on remap/edit and primitive scratch reuse **before** any TTL/LRU scheme. | Favor a smaller, exact cache only if measured benefit exceeds lookup/retention cost (A); no change to the physical equations or floating-point replay. |
| **4** | **S2-03 — optical raycasting/index work** | How costly are the current five rays/eye, index rebuilds, allocations and candidate tests? **Separately:** can the number/identity of rays be inherited as genetic anatomy (new exploratory IDEA-025), with a corresponding brain? | Current unmodified kernel: rays/tick, eye count, index build/query/intersection times, candidate histograms, neural input size and GC; vary existing valid eye/part/genome counts. Do not disable rays as a Stage 3 'optimization'. | Exact scratch/index efficiency (A) may proceed to decision; heritable ray subsets require a **separate genetic/sensory change authorization**, migration and ecological review (C, future IDEA-025). |
| **5** | **S2-04 — physical food/mouth contacts** | Are distant foods already rejected efficiently, and what candidate checks remain unnecessarily broad? Avoid testing each mouth against all foods if the existing spatial filter is sufficient. | Current ordered `NutrientSightGrid`/prey/egg candidate counts; rejection distances/AABB versus narrowphase counts, query/rebuild duration, food density, number of mouths, exact consumed joules/contact ordering. | Improve the **existing** spatial prefilter only when a gain is measured (A). Never approximate edible contact or feed at a distance. |
| **6** | **S2-09 — Worker→UI frame traffic** | Are reports/payload fields constructed or cloned that the UI never consumes? Can unused presentation work be skipped without starving the render replica or exports? **Already in place:** one outstanding frame/ACK, ~30/s cap, selective neural payload and incremental genome/lineage transfer. | Distinguish produced vs sent vs ACKed/dropped frames and bytes/fields actually read; frame build/clone/send/receive/apply/ACK latency, memory, selected/unselected, active/paused, high nutrient load, epoch/reset. | Remove *proven* redundant observer fields or avoid unnecessary assembly only if replica consistency holds (A); observer cadence changes require B and clear UI latency criteria. |
| **7** | **S2-12 — UI telemetry and conditional work** | Which stats, measurements, React state updates and repeated render tasks are actually read? Could any be sampled or activated only while consumers exist? | Consumers and code paths map; CPU and React commits for observer panels open/closed, selected/unselected, paused/playing, hidden/visible and Worker/fallback; memory and expensive `collectWorldStats` traversals. Measure before claiming data are unused. | Exact lazy observation (A), or deliberate observer refresh/fidelity trade-off (B); never lazily suspend authoritative simulation or safety accounting. |
| **8** | **S2-06 — ecology repeated passes** | Can counts or passes over nutrients/carrion/population serve more than one task without losing ordering, timing or energy? | Distinguish pass counts and durations for spawn slots, decay-v1/v2, body-food filtering, recycler, counters/telemetry; vary F and transient decay spikes, compare exact ledger/PRNG/stock. | Combined counts/loops only when phase boundaries, deletion/insertion and historical versions remain identical (A). |
| **9** | **S2-08 — local tube geometry/crossing** | Can wall/rect/run calculations and sorting be reused while preserving exact collisions and transfers? | Tube enabled/disabled, run count, particle/part wall queries, `tubeWallContact`/projection durations, run sorting/allocation, crossings and `structuredClone` spikes; compare same world with matched population and known tube topology. | Exact geometry precomputation/buffer reuse (A). Preserve real funded transfer; never replace with spawn/teleport. |

**Coverage without owner elevation:** S2-01 (physics/contact main iterations), S2-05 (recurrent/plastic brain execution), and S2-07 (eggs/hatching) remain in the Stage 3 *diagnostic baseline*. They must **not be deleted from measurement or Stage 4 synthesis** merely because Hernan did not specifically elevate them here. A measured dominant cost may justify discussing a revised order, but not silently overriding his preferences.

### S2-02 cache lifecycle — implementation questions for future review

- **First identify a valid immutable key and invalidation rule.** Mass, inertia, local anchors or dimension-only properties may follow the genome/part definition; a cache keyed by the long-lived genome identity can be garbage-collected naturally with a JavaScript `WeakMap` once no other strong references remain. Existing retained egg/lineage/bank genomes may legitimately remain reachable. Mutating the same genome object or changing applicable physical context requires explicit invalidation/versioning or a context-aware key.
- **Do not install an independent timer/last-used timestamp/periodic sweeper by default.** These introduce clocks, traversal, strong references or nondeterministic cleanup scheduling and can cost more than an inexpensive derivation. A bounded LRU is an alternative only if profiling demonstrates actual retention pressure; it must not influence simulated time, PRNG, physics or deterministic continuation.
- **Avoid over-caching:** derived values depending on changing angle, velocity, state or solver settings cannot be assumed invariant. Typed scratch arrays already exist. Compare native GC + weak keys vs no-cache vs reusable scratch and count overhead; a cache is not inherently a win.
- **Exactness gate:** validate each supported historical physics regime and save schema with deterministic complete-state/PRNG/energy comparisons; arithmetic rearrangement, even for algebraically equivalent formulas, may change floating-point results.

### S2-03 inherited ray subsets — separate exploratory design boundary

Today the eye has a **fixed `RAYS_PER_EYE=5`** and `getBrainLayout` allocates four neural channels (RGB + distance) for each ray. The hypothetical new allele would let each eye specify **which of the five existing angular ray slots** it projects; the actual selectable mask, allowed minimum, mutation mechanisms, upkeep and evolutionary costs are undecided. Keeping the canonical five slot directions and stable input keys is a promising compatibility question, **not an approved implementation**.

Any implementation needs a coupled brain layout/topology remap, consistent input/output ordering and masks, inherited mutation, somatic learning compatibility, physical energy upkeep attributable to actual sensing, import/export and historical saves (omitted allele = legacy five rays), deterministic continuation and natural selection without an artificial fitness reward. Fewer rays could lower computational and biological sensing costs but could also reduce navigation/feeding ability; neither system-wide gain nor evolutionary success is established. Track this separately as [IDEA-025](../ideas/IDEA_LAB.md#idea-025-heritable-per-eye-ray-subsets), **not** a Stage 3 source change or an optimization to deploy during profiling.

## 2. Stage 3 — proposed measurements to make Stage 4 decisions possible

**Execution gate:** The following is a measurement-design backlog and future Work handoff **only**. Hernan has **not** authorized Stage 3 code, instrumentation, tests, benchmark execution, parameter changes or any optimization here. Before Work starts, establish the actual latest fork/main base, review Stage 1 receipts and obtain approval of a bounded protocol: seeds/snapshots, environment/hardware, resolution/DPR, actual simulation and display speeds, repetitions/order/warm-up, max wall time/CPU and stop criteria. Separate exact kernel snapshots and raw traces from conclusions. Preserve bad/failed runs. Don't rerun owner-stopped scientific campaigns.

### P3-01 — First: glow attribution without changing biological meaning (S2-10 + S2-11)

**Questions:** Is the cost in actual energy receipt handling, observer state maintenance, frame transport, glow strokes, another visual filter (e.g. caustics) or full-surface compositing? Does user-observed slowing correlate with increased organism count/activity/density instead?

**Existing probes:** sampling profiler / browser Performance trace, scene observer counters where available, in-app actual speed and render FPS (not CPU%), comparison against an authoritative checkpoint.

**Proposed optional instrumentation if unavailable:** aggregate per-phase durations (collector `record/advance/frame`, presentation `accept/advance`, glow draw, other filters, mask/composite, total render), number of emitted positive/negative energy receipts, active IDs/parts, illuminated parts and stroke calls per frame, rendered vs culled parts, frame times and dropped/late frames. Prefer bounded phase counters rather than timing every event/organism; measure the probes' own overhead. Use visually paired controls from the **same saved authoritative scene/state**, isolating **observer-only** paint/aggregation rather than muting actual energy transfers, and separately verify that optical RGB and neural inputs remain unchanged. Distinguish kernel Worker CPU from main-thread Canvas, FPS and throughput.

**Stage 4 decision:** If collection dominates, investigate exact keyed lookup and observer aggregation; if drawing dominates, investigate culling, stroke count or visual level of detail. If another filter/composite dominates, do not blame energy glow. Before any B-grade visual compromise, ask Hernan what amount of temporal/part-detail coarsening still communicates real energy gain/loss.

### P3-02 — Exact repeated-derivation cache study (S2-02)

Count physical derived-property calls *by category* (constant per genotype vs dynamic per segment/pose), timing cost and allocations. Document cacheable identity/context, required invalidations and lifetime. Use a **reversible research-only branch/variant only after separately scoped approval** to compare no cache, weak-key cache and scratch reuse if the initial profile justifies it. Check memory after organism death, genome retention in lineage/eggs, world resets and repeated imports; report bytes/entry, lookup cost, churn and full source-state equality. The Stage 3 variant is an experiment, **not** permission to merge optimization into production.

### P3-03 — Optical and mouth broadphase accounting (S2-03 + S2-04)

Sample optical index construction, array/Map allocations, ray corridor queries, candidate counts/order, actual ray/part/food intersection calls and oral index rebuilds. Capture 5/15/30-organism cases with independently recorded rays/eyes/parts/food/mouth density where valid. Compare low/high density and different zoom while keeping physics unchanged (camera affects only drawing). Stage 3 stays with **five actual rays/eye**; generate IDEA-025 engineering questions and a cost model only, no ray-removal trial unless separately approved as future sensory/genetic research.

### P3-04 — Worker frame and UI demand map (S2-09 + S2-12)

Profile `SimulationHost.frame`, Worker structured-clone send, number of constructed/posted/ACKed frames, main `RenderReplica.apply`, event/lineage/genome payload, copy count/byte size (approximate via sampled serialization **off hot path**, never treat serialized size as exact structured-clone bytes), selection diagnostics and React telemetry consumers. Record observer-panel visibility, x0/finite/MAX, Worker vs `?mainthread`, tab visibility, zoom/DPR, render FPS and main-thread long tasks; separate requested speed from actual steps/s. Confirm whether unused fields **exist**, not just whether they look unnecessary. Any conditionalization must preserve frame epochs, pending ACK, exports, snapshots and observer state after selection/resume.

### P3-05 — Ecology passes and local tubes (S2-06 + S2-08)

Count food/carrion scans in each phase and repeated entity lookups; sample nutrient density/decay-v1/v2, carrion mineralization and hatching bursts; log phase boundaries and canonical energy ledger/PRNG. For tubes, capture `tubeGeometry` cache hits, sorted run counts, `tubeWallContact` wall samples, projection calls, crossing clone frequency/size and full-state continuation after crossing. Keep **Pipe World without automatic tubes** separate from an explicitly connected local-tube fixture. Do not treat remote transfer or moving-fluid computation as implemented.

### Baseline coverage for S2-01/05/07

Even at lower *discussion* priority, collect coarse physics/contact iteration counts, recurrent network/learning phase time, and egg clearance/hatching spikes alongside the above. Otherwise Amdahl analysis would omit a potentially dominant cost and Stage 4 could mis-rank observer optimizations.

### Measurement design / overhead and correctness requirements

- Prefer existing `benchmark:performance`, the headless profiler, actual Worker integration, browser Performance/DevTools traces and `npm run test:fast` / `npm run test:worker` for what they **actually** prove; don't rebrand tests as CPU measurements. Verify historical profiler golden compatibility before use.
- If optional instrumentation is authorized: compile- or explicitly test-gate it, choose aggregated phase/counter collection instead of thousands of hot-path timer calls, record its own overhead with paired uninstrumented runs, and preserve raw warm-ups/discards/failures. Do not use the production render replica as an authoritative state source.
- For comparable scenes: pin full fork SHA and checkpoint, known seed/settings, ecology/mouth/physics regime, counts of organisms/parts/eyes/rays/hidden edges/food/eggs/tube runs and actual tracked events; specify visibility, resolution, DPR, browser/Node/OS/CPU/RAM, thermal/power conditions (unknown if unavailable). Use a small bounded pilot before additional repeats.
- Record distributions (median, p95/p99 where sample count permits), frames/s, actual ticks/s, CPU process/thread utilization separately from wall time and frame timing, memory/GC and experimental uncertainty. If a metric cannot be captured, explicitly mark it unavailable.
- Any observer-only toggled comparison must retain equivalent actual simulation state, PRNG, real energy ledger and feeding/optics, and measure visual acceptance separately. Never reduce fixed ticks, off-camera world authority, biological rates, safety guards or historical fidelity to make a profile appear faster.
- Keep instrumentation/results and risk findings in a separately approved Stage 3 artifact; **do not** automatically put a research overlay in fork/main or upstream.

## 3. Stage 4 — decisions to return to Hernan (not decisions taken today)

Stage 4 must explicitly address every owner-selected S2 ID **in the rank order above**, but may recommend reordering *implementation* only from new measured representative-world evidence, with stated rationale and Hernan's decision:

| Question | Required output |
| --- | --- |
| **Does the candidate dominate?** | Stage 1 source + Stage 2 `S2-xx` evidence + Stage 3 trace ID; classify confirmed / plausible-unverified / refuted / unmeasured, with uncertainty and representative workload. |
| **Will it improve end-to-end performance?** | Percentage of CPU/Worker wall time/render frame actually consumed, testable expected improvement range and Amdahl limit only after measurement, plus cost of memory/GC. A hot loop alone is insufficient. |
| **What would be modified and what cannot change?** | Exact optimization candidate and files, A/B/C/D tier, deterministic continuation/energy/geometry/history/Worker/visual consequences and required replay/browser gates. |
| **What is the observer compromise, if any?** | For glow/render/telemetry, present truthful baseline and a visual demo/proposed contrast, especially perceived gain/loss clarity, temporal fidelity, pausing and occlusion. Ask approval for B-grade changes. |
| **Is cache cleanup warranted?** | For S2-02, compare no-cache/native weak lifetime versus explicit eviction with measured CPU/GC/memory; reject a bespoke sweeper unless it has a net benefit and correct invalidation. |
| **What is the exact next unit of implementation?** | Bounded fork branch/PR, metric acceptance and non-regression thresholds, rollback, tests, user visual check, and separate explicit approval before modifying production behavior. |
| **What remains future research?** | IDEA-025 inherited rays, IDEA-021/022 particle interactions, remote networking, device presets and moving fluids are **not existing speed improvements**. Retain separate genetic/physics/compatibility decisions. |

**Future use:** This historical measurement-question register is supporting design evidence, **not an active experimental approval**. For subsequent Stage 3 work, follow the current benchmark target and obtain a separate scoped protocol, reproducible checkpoint and budget. Stage 4 prioritization must use representative active throughput measurements rather than the superseded 2026-11-02 question order.
