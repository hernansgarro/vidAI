# VIDA: remaining features — 2026-10-20 / v0.7.0

This is a focused review of the current 2D source, not an implementation promise.
Small changes fit the existing systems. Big changes affect simulation architecture,
biology or behavior and need their own focused updates. Optional extensions are
distinguished below from gaps in existing systems.

## Small

| Addition | Current gap and purpose |
| --- | --- |
| Egg inspector | Select an egg to inspect parent, funded reserve, incubation progress and whether occupied space is delaying hatching. Clearance exists; its reason is not exposed through a dedicated egg inspector. |
| Bank favorites and sorting | Search, family/diet filters, previews, saving and spawning already exist. Add pinned designs and useful sort choices; do not replace those controls. |
| Environment profiles | Save and restore named settings profiles without replacing the active world with a full snapshot. Full ecosystem JSON save/load already exists. |
| CSV statistics export | Export population, diets, births/deaths and energy counters. The existing population plot keeps a short 60-sample history; a full experiment log is a larger feature. |
| Population anatomy summary | Show distributions of parts, eyes and mouths to make structural evolution visible without opening each creature. Genome mutation already adds/prunes parts and organs. |

## Big

| Work | Current state and intended improvement |
| --- | --- |
| Reliable sensory-driven behavior | Founders have phased gaits and a weak retinal steering prior, not demonstrated dependable foraging, pursuit or escape. Evaluate and improve inherited controllers using only their actual senses. Strong swimming alone does not demonstrate intelligent behavior. |
| Biological trait trade-offs | `eggReserveFraction` is inherited/mutated but not used when funding eggs; egg cost currently uses a fixed 10,000 J reserve plus construction. Maintenance efficiency also needs a meaningful benefit/cost trade-off. Preserve energy conservation when completing or retiring these traits. |
| Evolvable neural structure | Hidden size is fixed at 24; dense weights evolve, hidden neurons/connections are not structurally added or removed. Add bounded topology changes, stable identities, migration and appropriate upkeep. More neurons alone do not guarantee better behavior. |
| Growth, injury and gradual aging | Juvenile/adult/aging labels exist, but real body growth, local tissue injury/repair and gradual senescence are absent. These require consistent mass, geometry, energy and controller updates. |
| Environment and communication (optional) | Currents and resource patches could create niches. Chemical or acoustic organs would add new physical signals and sensory channels. Current sound effects are presentation, not creature communication. Implement these as separate systems, not one large update. |
| Performance at larger populations | Body contacts have spatial indexing; sight still scans objects. Index perception and move the simulation to a Worker while preserving deterministic stepping and UI responsiveness. |
| Experiment archives and comparison | Current branching replaces the active world with a cloned snapshot; it does not retain multiple named worlds for switching/comparison. Add an archive, event history and repeatable cross-seed comparisons. Deterministic snapshot continuation already exists; playback/rewind does not. |

## Recommended order

Improve foraging/escape behavior and complete biological trait trade-offs before
increasing brain size. Egg inspection and anatomy summaries would make both easier
to understand. Brain topology evolution, richer environments and body biology can
follow as separate milestones; performance should follow measured bottlenecks.

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
