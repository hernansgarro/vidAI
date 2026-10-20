# VIDA: remaining features — 2026-10-20 / v0.14.0

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
| Reliable sensory-driven behavior | Calibrated head-first FND-001 (balanced founder mode) now inherits retinal RGB-to-motor steering weights that permit verified food intake in 7/8 short off-axis real-physics cases versus none for vision-disconnected or weak-weight controls. This is **one measured genotype in controlled geometry**, not robust general foraging, species-wide pursuit or predator recognition. Next investigate threat cues and avoidance without interpreting arbitrary pigment as danger; expand cross-morphology comparisons before wider founder calibration. |
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
  Generalize beyond the measured body, study safe/unsafe visual ambiguity
  and demonstrate real escape before calling the whole phase complete.
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
