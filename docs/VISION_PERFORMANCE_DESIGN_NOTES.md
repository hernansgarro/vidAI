# VIDA 2D — Vision performance: evolving design candidates

**Status:** exploratory design notes only; not a specification, implementation approval, experiment authorization, performance claim, or upstream submission.
**As of:** 2026-11-04 (UTC; design clarification after the initial 2026-11-03 discussion).
**Owner of proposed ideas:** Hernan (contributor); technical questions and alternatives remain open for discussion.
**Tracking:** [upstream performance issue #67](https://github.com/smeagol44/vidAI/issues/67), [roadmap/handoffs #57](https://github.com/smeagol44/vidAI/issues/57), [sensory/HUD issue #65](https://github.com/smeagol44/vidAI/issues/65).
**Evidence:** [fork cumulative Stage 3 report](PERFORMANCE_AUDIT_STAGE_3.md) and the isolated Stage 3.7b research [report](https://github.com/hernansgarro/vidAI/blob/8481613ce08be6137d347cf0d8b9eabb0aed8130/docs/experiments/performance-stage-3-v9/report.md).

This document preserves the **latest corrected version** of each discussed idea, not every superseded interpretation. In particular, visual consultation is scheduled **independently for each eye**, not by cycling over every ray in the organism. Neither ray count nor sampling modulo is being changed in the shipped simulator.

## 1. Motivation, established baseline, and constraints

The immediate objective is **better Worker throughput with useful creature vision**, considering both exact optimizations and explicitly measured perceptual approximations. Physical ecology, neural learning, authoritative off-camera simulation, closed energy, genetics, deterministic continuation, and historical saves must be preserved or explicitly/versionedly migrated under separate authorization.

Current source at upstream main v0.39.0:
- Five physical rays per eye; per-eye inherited field of view, range, physical placement/orientation, and spectral sensitivity.
- Each ray determines its nearest geometric intersection after an ordered spatial-index candidate query, then returns attenuated/filtered RGB and normalized distance to the brain. Diagnostic ray-hit metadata is also available.
- The current spatial index uses 128-unit grid cells and finite ray corridors. The full sensing pass runs with the simulation's fixed 1/60-second tick, independently of UI rendering frequency.
- Existing sensory upkeep depends partly on receptor sensitivity; rays are still physically cast even with reduced receptor gain.
- A new design cannot silently change neural input order, genome meanings, saved state, movement, perception, or learning.

The verified **Stage 3.7b** research measured an all-real instrumented vision-plus-sight phase at **1.3871 ms/tick (31.72% of that tick's elapsed phase ledger)**. The separate recorded-vision dummy showed **+53.11% TPS versus adjacent real controls**, but altered trajectories/learning/contacts and is *not* an achievable or safe speedup estimate. One sampled diagnostic saw approximately **390 ray queries, 7,416 vision candidates, and 5,439 body-edge tests per tick**. Details are instrumented/perturbed observations, not exclusive removable CPU fractions. No Stage 4 implementation is authorized.

## 2. Candidate A — per-eye genetic consultation modulo and per-ray slots

### Latest proposed behavior

For each eye **e**, define its own integer **consultation modulo M_e >= 1**. Each ray **r** belonging to that eye has one **inherited, mutable consultation slot S_(e,r)** in [0, M_e - 1].

At authoritative global integer simulation tick **t**, the ray samples the actual world exactly when:

    (t % M_e) === S_(e,r)

Otherwise, its sensory value retains the last captured reading. **Multiple rays of the same eye may share a slot; some slots may be empty.** Each eye has its own M_e and own ray slots; there is no organism-wide round-robin over all eyes. A simple modulo over a global integer tick is preferred to maintaining independent eye timers/counters.

**M_e = 1** requires all that eye's rays to have slot 0 and to be sampled **every tick**, preserving the present capture frequency and, ideally, the exact legacy sensory computation in compatibility mode. For M_e > 1, each individual ray is sampled once per M_e ticks regardless of its assigned slot. The slot determines *phase and grouping*, not an additional reduction in a ray's own sampling rate.

For a five-ray eye at 60 fixed ticks/second:

| Per-eye modulo | Ray captures per eye per simulated second | Nominal reduction vs M=1 |
| ---: | ---: | ---: |
| 1 | 300 | 0% |
| 2 | 150 | 50% |
| 4 | 75 | 75% |
| 5 | 60 | 80% |
| 10 | 30 | 90% |

These are **consultation-count calculations**, not measured end-to-end CPU reductions. Nonuniform slots can create bursty ticks even when the average count is unchanged. At M_e=5, one ray has a fresh sample every five ticks, not every tick; different slot assignments can spread or group samples.

Approximate mean ray acquisition work scales with the sum, over eyes, of **R_e / M_e**, where **R_e** is the number of rays of eye e. Spatial index construction, neural processing, retention, and other work would still exist.

### Perceptual and evolutionary consequences to test

- A ray holds its **last completed optical signal**, so the brain keeps updating while vision may be stale. One proposal is to persist fully filtered RGB and normalized distance plus matching diagnostic ray-hit metadata.
- A fast-moving object may cross between samples; an articulating eye may significantly change direction while retaining a sample acquired in an earlier pose. A simultaneous burst can represent a more coherent instant; interleaved slots provide more frequent partial updates.
- With a common modulo for an eye, fewer rays do **not** automatically sample more frequently: that was an earlier, incorrect interpretation. Fewer rays lower the total observation and potential neural-resource burden; lower M_e increases capture rate per ray.
- Alternative/optional future work: allow the **ray count** itself to inherit and mutate, adding a spatial-versus-temporal/energy trade-off. Today there are five rays per eye and neural input topology/save compatibility would require explicit study. This is separate from the per-eye modulo design.
- Empty slots, multiple rays per slot, zero-receptor eyes, and eyes with different M_e can produce irregular CPU and sensory behavior. Selection, not scripted diet-based eye strategies, should determine which arrangements are useful.

### Open implementation questions (not decided)

- Source of the **authoritative integer tick index** and exact persistence across save/import, pause x0, finite speed/MAX, world forking, and historical schemas. The modulo rule avoids per-eye counters, but still depends on a correct global integer tick; deriving it from a floating-point clock needs validation.
- Scope of the **UI control** discussed earlier. It could be an experimental global override or multiplier independent of genetic M_e; the interaction with inherited M_e is not defined. Do **not** replace the genetic per-eye proposal with a single organism-wide modulo.
- How an M_e mutation maps or repairs existing S_(e,r) values; genotype and brain compatibility, inheritance, mutations, egg/Bank genome behavior, and exact continuation.
- What happens at world creation or import before a ray has any cached reading; whether snapshot observer data and neural sensory signals must remain exactly synchronized.
- Perceptual error measurements (RGB/distance/first detection/occlusion/staleness), controlled pursuit and food uptake, multi-seed ecological outcomes, CPU/tick distribution, and GC/allocations. No claim of biological neutrality.

## 3. Candidate B — charge organisms for ray acquisition

**Proposed principle:** computationally costly *biological capabilities* should have an organism-level energetic cost. Genetic selection can then favor organisms that obtain useful perceptual information for fewer costly acquisitions, indirectly reducing simulation workload without an imposed live fitness score.

The example **1 joule per ray consultation/capture** is a discussion placeholder, **not an approved or physically calibrated coefficient**. With five rays at 60 ticks/s, nominal acquisition cost is 300 J/s for M_e=1, 60 J/s for M_e=5, and 30 J/s for M_e=10 (assuming 1 J/consultation). Grouping three ray captures into one slot would still incur **three ray costs**, not one eye-wide discount.

Costs should be deterministic, hardware-independent, and based on model-defined sensor operations rather than actual elapsed processor milliseconds or the number of spatial-index candidates processed. Avoid penalizing organisms for implementation details of the engine.

**Revised owner direction:** if ray-capture energy debits are adopted, **replace the existing eye-maintenance component** instead of automatically charging both eye upkeep and every exposure. Keep unrelated neural, motor, physical, and basal obligations intact unless separately reviewed. If a biologically justified eye-structure charge is retained alongside per-capture costs, the owner expects a separate ecological-energy rebalance assessment, potentially including nutrient energy and mouth absorption rates. No such rebalance or coefficient is currently authorized.

**Closed-energy requirement:** debit available creature reserves through the accepted economy and return the spent energy through the existing conservation ledger; no creation, destruction, extra source grant, or reserve bypass. **No special vision debt or survival exception:** current organisms are marked for death when energy reaches zero or less. This remains unchanged. Any details of debit ordering must preserve existing death and conservation rules. Costs for neuronal computation and potential replacement of other basal metabolism are **separate future research**. The example 1 J per ray is not calibrated; never choose it from machine TPS.

## 4. Candidate C — alternative spatial candidate selection

The current ordered broadphase already aggressively rejects irrelevant objects: earlier 30-founder measurements retained about **4.54%** of full-scan entry possibilities as optical candidates. This is a candidate-count ratio, not proof of proportional CPU speedup.

Discussed alternatives, separately benchmarked against the existing finite-ray corridor:

1. **Organism-enclosing broad query:** query the coarse grid cells touched by an axis-aligned region centered around the organism. To conservatively include every ray, its half-extent must cover each actual eye's displacement from the body's center of mass **plus that eye's range**. Arbitrary eye positions and articulated parts mean eye offsets cannot be ignored. Object extents and boundary tangencies also matter.
2. **Face/facet-shared candidates:** eyes mounted on a particular body-part face reuse a candidate set covering all their active ray footprints. Their FOV, origins, slot positions, and ranges may differ; the shared region must be conservative.
3. **Coarse grid + tighter visual rectangle + exact intersection:** test a wider outer grid as a broad discard followed by a smaller region or ray-specific geometric filter, then existing exact ray–circle/body-edge calculations. Different cell sizes (128 baseline and alternatives) must be measured. A visual rectangle being four or five times smaller than a cell is an idea, **not** a geometric requirement or evidence that a wider grid is faster.
4. **Exact query/geometry optimizations:** reduce transient arrays, sorting, indexing and intersection work without changing ordered candidates, closest-hit ties, attenuation, RGB, occlusion or neural/observer output. Examine safe within-tick computation reuse.

Key trade-off: **one or a few scheduled rays per eye/tick may make a shared facet/organism list *less* economical** than a narrow direct corridor query, because shared lists include objects irrelevant to the currently active rays. A larger grid may also increase candidate density even if fewer cells are traversed. A coarse broadphase is not necessarily cheaper than the existing index. Benchmark all build/query/sort/exact-test costs and measure whole-Worker throughput.

Do not assume an index persists correctly across ticks: nutrients, eggs, and articulated bodies move, decay, appear, disappear, and change appearance. Exact occlusion and priority order require attention to these changes.

## 5. Evaluation plan — conceptual only, no experiments authorized

A separately approved Stage 4 research protocol could compare:

- **Equivalent, exact:** baseline index vs candidate alternative indices/geometry. Require ray and neural-input equivalence, full-state/PRNG/energy persistence, and historical continuation.
- **Approximate, sampled:** baseline all-ray-every-tick vs a controlled UI experiment with per-eye M = 2/4/5/8 and prescribed slot distributions. Record ray-age and perception errors, first detection of small moving objects, eye rotation, feeding and learned behavior, plus real end-to-end CPU/TPS and spike distribution.
- **Genetic/energetic, later:** inherited M_e and S_(e,r), and explicit per-consultation energy costs after calibration and save/physiology decisions. No evolutionary search without a bounded preregistered budget and owner authorization.
- **Combinations:** the per-eye sampling schedule may change which spatial candidate strategy is fastest. Study interaction rather than adding isolated alleged savings.

Keep unchanged physics, real sensory responses when sampled, motor control, energy economy, Worker authority and off-camera simulation. Changes to vision are **behavioral and evolutionary** and cannot be declared safe from performance-only measurements.

## 6. Current decision boundary and next discussion

- **Accepted as the user's corrected *idea*:** genetic per-eye consultation modulo, genetic per-ray slots within that eye, same-slot grouping/empty slots, module 1 equivalent in capture frequency to the current system, and an energetic per-ray consultation cost as the proposed evolutionary counterbalance.
- **Still exploratory:** 1 J magnitude, UI/genetic interaction, mutation and historical-save design, debit ordering within existing death rules, optional genetic ray count, spatial region organization, potential ecological rebalance, and real cost/benefit. No implementation plan accepted.
- **Stage classification:** this is **Stage 4 candidate refinement / pre-design brainstorming**, **not** the execution or authorization of Stage 4. Stage 3 research is still ongoing and the standing experimental STOP remains in effect.
- **Scope of this change:** documentation-only in Hernan's fork; no simulation, settings, schemas, genes, energy, Worker, display, tests, Wiki, testing branch, upstream runtime or Pages modification. No experiment conducted and no quantitative performance improvement claimed.
- **Next step:** continue discussion, clarify the undecided biological/computational semantics, and only then consider an independently approved bounded experiment/implementation protocol. The upstream owner retains authority over upstream decisions and release.

This is a living note for follow-up discussion. Amend it with the **latest corrected ideas** instead of accumulating contradictory interpretations.


## 7. Candidate comparison — discussion snapshot, 2026-11-04

This is a **subjective technical prioritization** of *potential* savings, **not benchmarks, implementation commitments, or additive speedup percentages**. Maturity: High = concept clearly specified (not necessarily tested); Medium = material details unresolved; Low = early hypothesis. Potential: 1 = limited direct CPU opportunity, 5 = large plausible opportunity. Genetic selection is a longer-term, indirect mechanism; biological benefit and consistency are unknown.

| Candidate | Maturity | Potential (1–5) |
| --- | --- | ---: |
| 1. Per-eye consultation modulo and sample-and-hold | High | 5 |
| 2. Inherited and mutable consultation slots for each ray, allowing synchronized bursts or staggering | High | 2 |
| 3. UI-controlled experimental sample budget / modulo override (interaction with inherited eye parameters undecided) | Medium | 5 |
| 4. Per-ray capture energy charge replacing current eye-maintenance debit; long-term genetic selection pressure | Medium | 4 |
| 5. Inherited and mutable number of rays per eye; separate topology/save discussion | Low | 3 |
| 6. Reduce per-query allocations, arrays, and sorting; retain exact ordered semantics | Medium | 4 |
| 7. Equivalent optimized ray/circle/rotated-body intersections | Medium | 4 |
| 8. Within-tick reuse of corners, transforms, directions, and safe geometric invariants | Medium | 3 |
| 9. Shared candidate set by anatomical facet / body-part face | Medium | 3 |
| 10. Organism-wide enclosing rectangle for candidate acquisition | Low | 2 |
| 11. Hierarchical coarse grid + narrower visual filter + exact intersections | Low | 3 |
| 12. Experiment with spatial index grid cell size vs current 128 world units | Medium | 3 |
| 13. Compare direct brute-force geometric scan for low-density workloads | Low | 2 |
| 14. Incrementally maintain or safely reuse spatial index structures across ticks | Low | 3 |
| 15. Integrate/fade prior sensory readings beyond the simple sample-and-hold cache | Low | 1 |

**Scope nuance:** items 1–3 share the same sampling mechanism; they are not independent gains. Items 6–14 are exact-computation optimization alternatives and should be compared with and without temporal sampling. Item 4's primary benefit is potential ecological selection pressure; it is not an immediate CPU optimization. A concurrent structural-eye charge or increased energy supply/uptake is not an independently demonstrated performance optimization.

**Clarified survival and accounting:** shipped `simulation.ts` checks `org.energy <= 0` for starvation death (predatory depletion has its own death cause); per-capture charging does **not** authorize changing that rule, adding credit/debt, free sensory work, or artificial food. The current `eyeSensoryUpkeep(g.eyes)` contributes to sensory metabolic rate and is the eye-maintenance component proposed for replacement, not an additional per-capture charge.

**Suggested future bounded comparisons only:** first isolate equivalent runtime improvements (allocations/spatial/geometric tests); then evaluate the per-eye modulo perceptual-quality-versus-Worker-throughput trade-off under multiple speeds, body plans, moving targets, and eye configurations; consider genetic and energetic changes only with separate compatibility, ecology and calibration decisions. Stage 4 execution remains unapproved.
