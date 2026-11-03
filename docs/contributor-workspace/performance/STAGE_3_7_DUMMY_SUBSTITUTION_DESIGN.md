# VIDA 2D — Stage 3.7 experimental dummy-substitution design

## Current checkpoint — Stage 3.7b recovery COMPLETE (2026-11-03)

Hernan explicitly authorized a recovery after the previous stopped lot. All 12 registered windows completed once; source57a7d45, original evidence66a89ed, [research DRAFT #92](https://github.com/hernansgarro/vidAI/pull/92), [report](https://github.com/hernansgarro/vidAI/blob/8481613ce08be6137d347cf0d8b9eabb0aed8130/docs/experiments/performance-stage-3-v9/report.md). [Cumulative findings](../../PERFORMANCE_AUDIT_STAGE_3.md) contain verified phase costs, actual counterfactual TPS, controls, independent GC/CPU, divergence and conservation. Vision +53.11%, brain-output +19.53%, learning OFF +6.88%, synthetic feeding +1.79% versus nearby real controls; one window each, real-control spread6.78%, no additive/removable CPU interpretation or production-safe benefit established. Physics/contacts dominate the separate phase ledger, then vision and inference. Counter/frame draining and early raw preservation now verify correctly.

This supersedes pending-throughput status, not the immutable original failed P01. All probes/raw/checkpoints remain isolated and unmerged. Active201.978s/runner357.601s/111,808,143rawbytes within bounds; scientific run41729322675 succeeded with required installation/fast/build/Worker/focusedChromium gates. Temporary workflow removed; reference YAML outside.github. Main receives documentation only. Stage3 remains ongoing; STOP after this lot. No automatic new study, upstream submission, production optimization or Stage4 authorization. Earlier checkpoints below are preserved dated history.


## Execution status — partial lot stopped (2026-11-03)

The owner later authorized the Work execution described by this proposal. The single lot is **BLOCKED after its first timed-slot counter failure**, with eight verified fixed120-tick pilots and no valid sustained TPS/overhead/trace comparison. [Cumulative findings](../../PERFORMANCE_AUDIT_STAGE_3.md), [full report](https://github.com/hernansgarro/vidAI/blob/f846d67939e32d46a398768c082368dea2d553b7/docs/experiments/performance-stage-3-v8/report.md), [isolated draft #90](https://github.com/hernansgarro/vidAI/pull/90). No second campaign/retry/Stage4 is authorized. The proposal below remains historical design, not permission to execute.

The owner's clarification was implemented only in the isolated synthetic-feeding fixture: transfer from positive universe reserve, capped by available stock/storage, <=1J/organism/s, zero forged physical-contact/intake feedback.60J transferred over the120-tick pilot; total world error1.4e-9J. This validates fixture conservation, not biology, survival or performance. All-real exact state/PRNG/energy/learning passed; dummies changed trajectories. Ordinary production contains no dummy or probe. A new authorized recovery protocol is required to complete the intended throughput contrasts.


> **Owner-requested proposal, 2026-11-03. DOCUMENTATION ONLY — NOT MEASURED, NOT AUTHORIZED AS PRODUCTION BEHAVIOR.** Stage 3 remains ongoing. This file refines the next separately executed Work investigation. It does **not** run Stage 3.7, implement dummy modes, change physics/ecology, tune organisms, or authorize Stage 4 performance optimizations.

## Research question and source-confirmed execution order

Previous Stage 3.1–3.6 evidence and stable S2 hypothesis IDs are retained in [the cumulative findings](../../PERFORMANCE_AUDIT_STAGE_3.md). Stage 3.6 resolved CPU/GC attribution but did not establish the removable cost of specific Worker components.

The current fork `simulation.ts` structure, checked at fork/main `64733adeba8c2d6ca6fc11b61b7d00b6a38296c5`, is **mixed**, not a single complete per-creature pipeline:

1. Global environment/nutrient, egg and incubation processing.
2. A per-organism traversal with sensing, neural-input construction, recurrent brain evaluation and conditional motor/sensory learning.
3. Synchronized physics: for each physical substep, advance **all** active organisms, then resolve **global** body/self contacts.
4. Subsequent per-organism energy/metabolic accounting.
5. A distinct post-movement per-organism feeding traversal with shared post-movement spatial indices, followed by remaining ecological/reproduction work.

Relevant source: [sensing/neural learning](https://github.com/hernansgarro/vidAI/blob/64733adeba8c2d6ca6fc11b61b7d00b6a38296c5/simulation.ts#L3795-L4035), [physics/contact](https://github.com/hernansgarro/vidAI/blob/64733adeba8c2d6ca6fc11b61b7d00b6a38296c5/simulation.ts#L4036-L4048), [metabolism and feeding](https://github.com/hernansgarro/vidAI/blob/64733adeba8c2d6ca6fc11b61b7d00b6a38296c5/simulation.ts#L4049-L4232).

The new experimental question is **how much end-to-end Worker throughput changes if one phase is replaced by a cheap, defined surrogate**, alongside independently measured exclusive phase/subphase time. A substitution is a counterfactual **intervention**, not by itself a causal estimate of the computation's isolated CPU cost.

## Suggested research-only substitution modes

These are design candidates, not approved implementations. Inspect the *then-current* source, types, phase order and state/energy contracts before specifying real hooks.

| Path / S2 ID | Original work | Candidate alternative(s) | Essential comparability warning |
| --- | --- | --- | --- |
| Vision / S2-03 | Shared sight-index construction/queries, eye geometry, raycasts, RGB/occlusion, neural inputs and optional ray-hit observer outputs | **Recorded-real stimulus**: capture a representative, typed original result and replay a fixed frame or small sequence per organism/eye/channel; **constant stimulus**: one validated static sensory event; **A/B/C**: deterministic cycling of a few recorded events | Preserve input dimensions, ranges, indices and required ray-hit shapes; separate global-index cost from per-eye work; sensory changes can alter all later neural/physics/contact costs |
| Brain / S2-05 | Actual recurrent evaluation and neural output updates | **Recorded-real motor/neural output** or safe constant/alternating command vectors, bypassing evaluation only in the research variant | Real recurrent and learned state will no longer evolve equivalently; explicitly classify replayed outputs, motor commands and output state; never imply real intelligence or motion validation |
| Learning / S2-05 | Conditional `applyWakingPlasticity` and `applySensoryAssociations`, associated somatic deltas and energy charges | **Learning OFF** in a research-only bypass, optionally separately motor/sensory OFF if preregistered | Baseline uses both pathways as originally enabled. Turning learning off also changes synapses, debits and future trajectories; do not use production configuration or retune alleles to disable it |
| Feeding / S2-04 | Post-physics mouth geometry, candidate queries, physical intake, prey/egg/food effects, feedback and energy ledger | **Recorded feedback/transfer replay**, or **small fixed synthetic intake** with explicit per-organism/per-mouth update and no mouth-contact evaluation | A fixed intake is not actual physical feeding; never create energy, counterfeit contact evidence, preserve unreported joules or call the mode ecologically valid. Prefer recorded sequence when comparing downstream work |
| Physics / S2-01/S2-02 | Every articulated substep, motor/drag/joints plus cross-organism contact resolution | **Optional** bounded replay of post-physics positions/velocities/contact-facing state from a recorded reference trajectory; otherwise only exclusive accounting, no bypass | Replaying only organism positions misses joints, collisions, mechanical energy, contact feedback and global order. A valid comparable surrogate may not exist; record infeasibility rather than fabricate a simple dummy |
| Global nutrient/egg/energy ecology / S2-06/S2-07 | Environmental evolution and funded life-cycle events | Retain real processing in the first study, unless a later *separately approved* fixture specifies a conservation-safe bounded surrogate | Do not silently eliminate background ecology or off-camera residents |

### Stateful and deterministic dummy generators

The owner suggests a low-cost global state machine yielding `A, B, C, A, B, C...` on successive requests. This is an optional **counterfactual generator**, not a replacement for natural randomness.

- Every `A/B/C` value must be a **typed, schema-valid** stimulus/command/feedback, ideally recorded from genuine reference simulation and documented with its provenance and eligible organisms. Vision inputs and brain output vectors can vary in size and allele meaning: do not indiscriminately reuse one array across dissimilar genomes.
- **Variant 1 — shared cyclic iterator:** one global research-only counter advances upon requests. Cheap but depends on iteration/request ordering, living-organism count and whether operations are skipped. Record request index and consumption order; never claim per-organism independence.
- **Variant 2 — reproducible keyed selector (preferred comparison control):** derive sequence index from stable `(experiment seed, completed logical tick, organism ID, channel/eye/output slot)` or a separately seeded research PRNG stream. No calls to or mutations of the authoritative `state.prng`. This yields deterministic pseudo-random-looking selection without order dependence.
- **Variant 3 — fixed genuine replay:** retain recorded values matched to logical tick/organism/channel (and, when needed, world state); it offers a better downstream-input control but may be memory- and lookup-expensive. Include replay/lookup cost in its measured intervention.
- Optional A/B/C cycling should be **clocked by exact logical tick** rather than wall-time, and its size/rate fixed before measurement.
- Missing/replaced values, incompatible dimensions or out-of-scope IDs must be detected. Do not silently synthesize unrealistic values or substitute zeros where the original output requires richer semantic structure.

### Feeding / energy accounting specifics

A fixed low intake can simplify collision/query work, **but changes the organism's actual energy budget and survival dynamics**. Plan one of the following diagnostic modes explicitly and label it:

1. **No synthetic intake:** skip real feeding and record a zero-intake counterfactual; this is cheap but diverges quickly and cannot represent the cost of feeding alone.
2. **Recorded transfer replay:** feed each organism the previously recorded contact/intake and ledger-relevant events from a full reference, preserving their original source provenance as much as possible. If exact states/identities differ, stop or flag the mismatch.
3. **Small synthetic ledger transfer:** transfer a preregistered number of joules from an explicitly identified **available** source stock/reserve to the organism, update all applicable conservation ledger/stock fields consistently, and fail clearly if the transfer cannot be funded. No external energy, hidden subsidy, forged prey bite or fake legitimate physical-contact learning signal. State that the experimental input is artificial and cannot validate ecology.

The third mode is for timing counterfactuals only; it must **never** become a gameplay path, evolutionary benchmark, trusted feeding baseline or upstream proposal without a wholly separate decision. Do not alter the real simulation's energy laws as a convenience. If fully conservation-safe fixture-level feeding cannot be implemented within scope, omit fixed credits and report the limitation.

### Brain/learning feedback and physics safety

- A brain dummy may inject a fixed set of **valid independent joint/motor commands** after the recurrent inference boundary, not a teleport/force override.
- A learning-off control should leave original neurons/recurrent inference running if its question is learning cost; do not combine it with brain dummy unintentionally.
- Preserve **all other real physics** for vision, brain, learning and feeding experiments, so the observed effect remains a realistic subsequent runtime response to the experimental inputs, albeit with divergent trajectories.
- The primary correctness gate is the **all-real lean vs all-real instrumented** exact fixed-tick state/PRNG/energy comparison. Dummy-on runs are deliberately **not expected** to match the original saved state; independently enforce type, finite-value, invariants, local accounting and crash-free behavior, and label all ecological divergence.

## Method: two different estimands, two different kinds of evidence

**A — Direct exclusive computation cost.** Use carefully priced phase/subphase timers, call/work-unit counters and independent thread CPU/GC where feasible. Nested spans must not be double-counted. Report `ms/tick`, `calls/tick`, variance, overhead and explicit unattributed time. These measure the work *as executed* in a particular workload.

**B — Counterfactual whole-Worker throughput.** On a dedicated research build, run the same immutable start/checkpoint and the same MAX/minimal-observer profile, toggling **one** replacement at a time. Report actual `ticks/s`, achieved simulated time, Worker CPU-ms/tick where available, effective entity/workload counts and short-window trajectory divergence. Observed TPS differences combine removed work, added dummy/replay cost, changed future data, branch/JIT behavior, GC and possible scheduling effects.

These quantities **must not be equated** or added as if Amdahl percentages. A larger tick rate under a nonphysical dummy does not establish a realizable production optimization, conservation-safe gameplay, or a removable CPU budget. A pair of modes can be explored only under a newly preregistered factorial submatrix with sufficient control windows; do not infer interactions from unpaired combinations.

## Proposed bounded Stage 3.7 execution

A later authorized Work request may implement and run a *single* fresh scientific lot on the current verified fork main, using a separate fork audit branch and preregistration in [upstream #57](https://github.com/smeagol44/vidAI/issues/57). Preserve all 3.1–3.6 completed windows and original archives.

- Start with **source-verified feasibility and inexpensive build-only experiments**. A first scientific matrix should prioritize independently toggled **vision, brain, learning and feeding** against all-real reference; physics may be documented as infeasible/deferred. The precise matrix, order and repeated controls must be chosen before any scientific run, within **at most 12 timed windows, 360 seconds charged active, 600 seconds runner and 128 MiB uncompressed archives**. Do not claim that four interventions plus controls and diagnostics can all be exhaustively replicated under these limits.
- Use the **exact immutable 30-organism Stage 3.5/3.6 checkpoint** if compatible (seed73; originally 162 parts, 78 eyes, 390 rays, 720 hidden neurons and 275 food), MAX, caustics OFF, no selected/tracked organism or inspector, fixed viewport/DPR/topology and normal off-camera simulation.
- Plan lean/reference, probe-overhead and dummy-on/off windows. Keep detailed profiling/GC traces in **different** diagnostic windows, never pooled with primary throughput; if the bound cannot support all intended interventions, prioritize, explicitly defer and stop.
- Use fixed logical tick validation for all-real code; preserve original state, full PRNG, learning state and energy. Dummy-on variants must pass their own integrity/conservation checks and disclose divergent live counts, contacts, behavior, energy, births/deaths and nutrient status. Compare equal-wall and equal-logical-tick results for different questions; record when changing workload makes comparison uninterpretable.
- Preserve source SHA, mode selector, preset/state-machine data and values, input/output contracts, original archive SHA256/lengths, exact original evidence and any failures. All probes and raw data stay on fork research branch/draft PR. Only verified conclusions, with immutable evidence links, go to fork main through a separate docs-only reviewed PR.
- No permanent application knob, changed save/schema, off-camera bypass, reduced real physics, stopped learning/feeding in production, synthetic nutritional subsidy, generic production optimization or upstream PR is authorized.

## Research questions to answer before Stage 4

For each candidate: Is the current time cost large and exclusive? Is the dummy cheaper than the original? Does downstream work change significantly? Do recorded inputs reduce that change? Can the measured benefit be translated into a *physically correct* optimization, or is it only a diagnostic upper bound? What does probe overhead hide? Which hypotheses remain UNKNOWN?

**Stop after the independently authorized Stage 3.7 lot and owner review.** This planning document alone authorizes no experiments or production changes.
