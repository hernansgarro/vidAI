# VIDA: remaining features — 2026-10-20 / v0.17.0

This is a focused review of the current 2D source, not an implementation promise.
Small changes fit the existing systems. Big changes affect simulation architecture,
biology or behavior and need their own focused updates. Optional extensions are
distinguished below from gaps in existing systems.

## Small

| Addition | Current gap and purpose |
| --- | --- |
| Bank favorites and sorting | Search, family/diet filters, previews, saving and spawning already exist. Add pinned designs and useful sort choices; do not replace those controls. |
| Environment profiles | Save and restore named settings profiles without replacing the active world with a full snapshot. Full ecosystem JSON save/load already exists. |
| CSV statistics export | Export population, diets, births/deaths and energy counters. The existing population plot keeps a short 60-sample history; a full experiment log is a larger feature. |
| Population anatomy summary | Show distributions of parts, eyes and mouths to make structural evolution visible without opening each creature. Genome mutation already adds/prunes parts and organs. |

## Big

| Work | Current state and intended improvement |
| --- | --- |
| Reliable sensory-driven behavior | The balanced Darter has measured retinal food approach and evolving injury-sensing motor circuits. New paired real-physics tests against self-propelled hunters report 6 improved, 2 tied, 1 worsened outcomes among 9 biting starts, with 6 no-bite setups excluded. Across five body types and 15 genuine biting encounters, the same injury response improves 5, worsens 6, ties 4. The Brain inspector exposes the actual injury signal, pending energy and active inherited synapses. Next: demonstrate sensory pursuit by **turning/tracking hunters**, morphology-specific adaptation, and heritable fitness under selection before Phase 5D. |
| Biological trait trade-offs | Egg reserve allocation now affects the actual funded hatchling reserve, parental energy cost and first-egg threshold; a higher allele improves starting reserves but delays reproduction. Parent survival floor and faster physical feeding were rebalanced in v0.10. Pending: review unused `reproductionThreshold` and other inherited efficiency/storage trade-offs separately without disguising them as guaranteed improvements. |
| Evolvable neural structure | Phases 1–2 support changing hidden sizes (1–96), neuron identity, inherited connection masks and bounded upkeep. Phase 4 adds per-hidden-neuron inherited activation memory (0–4 s) with tau=0 original baseline and an explicit upkeep cost. Memory timescales are not synaptic learning or dreaming: living organisms still cannot update weights or grow structure within life. Controlled tests have not demonstrated improved foraging or long-term survival. |
| Growth, injury and gradual aging | Juvenile/adult/aging labels exist, but real body growth, local tissue injury/repair and gradual senescence are absent. These require consistent mass, geometry, energy and controller updates. |
| Environment and communication (optional) | Currents and resource patches could create niches. Chemical or acoustic organs would add new physical signals and sensory channels. Current sound effects are presentation, not creature communication. Implement these as separate systems, not one large update. |
| Performance at larger populations | Body contacts have spatial indexing; sight still scans objects. Index perception and move the simulation to a Worker while preserving deterministic stepping and UI responsiveness. |
| Experiment archives and comparison | Current branching replaces the active world with a cloned snapshot; it does not retain multiple named worlds for switching/comparison. Add an archive, event history and repeatable cross-seed comparisons. Deterministic snapshot continuation already exists; playback/rewind does not. |

## Recommended order

- **Phase 5B: Evolvable locomotion — implemented.** Inherited oscillator
  mixing (including no wave), independently controlled direct joint-angle
  commands, smooth inherited waveform harmonics, maintained torque/drag
  physics and backward-compatible sine-only founders. Coordinate evolving
  motor strategies with measurable foraging rather than scripted thrust.
- **Phase 5C: Sensory-driven foraging/avoidance — in progress.** The
  balanced Three-link Darter now demonstrably follows real off-axis green
  food using inherited retinal neural weights, without scripted steering.
  Physically grounded injury feedback can now grow an isolated inherited
  neuron-to-joint circuit through stochastic mutation, with proven lower
  damage against a *stationary biting hunter* for one genotype. Continue
  with **sight-guided hunters that actually turn and track prey** rather
  than only moving in a preexisting heading. Evolve body-specific motor
  policies instead of assuming that one Amp response generalizes, and
  demonstrate selection across generations before finishing this phase.
- **Phase 5D: Ecological validation — subsequently.** Assess actual nutrient
  income, survival and reproduction across multiple fixed seeds, without
  fabricating ecological fitness or inserting survival subsidies.
- Research optional lifetime neural plasticity/rest separately once basic
  motor and sensory behavior is demonstrably effective.


Monitor performance only if measured bottlenecks arise.

## Limits that remain corrections rather than new features

- Collision response uses discrete substeps, not continuous swept collision.
  Directly hinged neighbors can still intersect at tight bends. Eggs/food use their
  existing contact models rather than full rigid-body response.
- Jellyfish are hinged rectangular swimmers; deformable bells and fluid jets are
  not implemented. The new variants have bounded two-second gait checks, not
  measurements of lifetime ecological fitness or reliable hunting.
- Historical reports in PROJECT_STATUS describe their own versions. Old statements
  that save continuation, solid body contacts or motor amplitude control are
  missing are superseded by the later implementations.
