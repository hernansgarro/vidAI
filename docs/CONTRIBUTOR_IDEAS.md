# Contributor ideas — current references

> **Fork-only navigation, consolidated 2026-11-03.** The [active IDEA board](IDEA_LAB.md) is the single current record for idea maturity, priority, accepted intent and open questions. [Completed work](CONTRIBUTOR_COMPLETED.md) and [workflow status](CONTRIBUTOR_WORKFLOW_STATUS.md) track delivery, not pending ideas. This document is a short compatibility index for earlier links; it is **not** a parallel roadmap, a dated discussion transcript or approval to implement. Original notes, rejected options, temporary stage restrictions and discussion history remain in Git history and linked PRs. No personal planning files are intended for clean upstream submissions without separate approval.

## Highest-priority future discussion — performance and CPU cost (2026-11-02)

**IDEA-023 is P0.** For the current active-workload objective, stage gates, measured-source limitations and owner-selected priorities consult [the audit plan](PERFORMANCE_AUDIT_PLAN.md), [Stage 2 evidence](PERFORMANCE_AUDIT_STAGE_2.md) and [audit decision questions](PERFORMANCE_AUDIT_PRIORITIES.md). Do not treat historical glow correlation as a proven cause or stale stage summaries as current execution permission.

## Topic index — unresolved design questions only

| Topic | Current source |
| --- | --- |
| Genetic choice of egg laying | [IDEA-002](IDEA_LAB.md#idea-002-genetic-egg-laying-choice) |
| Parental energy-retention risk | [IDEA-003](IDEA_LAB.md#idea-003-parental-reserve-risk) |
| Parent-funded incubation and world-reserve uptake | [IDEA-004](IDEA_LAB.md#idea-004-parent-funded-incubation), [IDEA-005](IDEA_LAB.md#idea-005-passive-egg-reserve-uptake) |
| Funded inherited egg buoyancy and hatch constraints | [IDEA-006](IDEA_LAB.md#idea-006-funded-egg-buoyancy), [IDEA-007](IDEA_LAB.md#idea-007-hatching-energy-blockers) |
| Fractional nutrient appearance and named world profiles | [IDEA-008](IDEA_LAB.md#idea-008-nutrient-appearance-frequencies-below-one-per-second), [IDEA-009](IDEA_LAB.md#idea-009-named-scenario-profiles) |
| Remote aquarium Stage 4 and portable live-organism state | [IDEA-010](IDEA_LAB.md#idea-010-remote-aquariums), [IDEA-011](IDEA_LAB.md#idea-011-portable-organism-state), [deferred detailed design](REMOTE_AQUARIUM_DESIGN.md) |
| Observer cleanup, scenarios, nutrient geometry and variable rays | [IDEA-013–IDEA-025](IDEA_LAB.md#cards) |
| Olfaction and pheromone traces | [IDEA-026](IDEA_LAB.md#idea-026-chemical-scents-olfaction-and-pheromone-traces), [current design](SCENT_AND_OLFACTION_DESIGN.md) |

## 1. Genetically controlled decision to lay eggs

See [IDEA-002](IDEA_LAB.md#idea-002-genetic-egg-laying-choice). An inherited/mutable **egg-laying decision**, potentially mediated by neural policy, is distinct from the existing `eggReserveFraction` energy allocation, clutch size, maturity and cooldown. Preserve funded asexual reproduction and historical genetics.

## 2. Heritable parent reserve sacrifice

See [IDEA-003](IDEA_LAB.md#idea-003-parental-reserve-risk). Consider heritable reproductive risk relative to the currently fixed parent retention floor `max(2,000 J, 12% of storage capacity)`. That floor is a **historically observed baseline to reverify at implementation time**, not approval to change biology or bypass conservation.

## 3. All egg development energy should originate with the parent

See [IDEA-004](IDEA_LAB.md#idea-004-parent-funded-incubation). The proposal is to prepay offspring structure, reserve and any explicitly defined incubation cost. This remains **a future question** requiring owner/maintainer discussion, closed-energy accounting, compatibility and ecological validation.

## 3a. Review passive egg energy recovery from the shared world reserve

See [IDEA-005](IDEA_LAB.md#idea-005-passive-egg-reserve-uptake). Reconsider existing `fundIncubatingEggs` world-reserve transfers; the contributor is **not proposing a new free recovery mechanism**. Do not conflate this with observer-only egg energy visualization.

## 4. Genetically influenced egg buoyancy

See [IDEA-006](IDEA_LAB.md#idea-006-funded-egg-buoyancy). Investigate physically grounded, inherited, energy-funded buoyancy rather than scripted egg propulsion.

## 5. Hatching restrictions and occupied space

See [IDEA-007](IDEA_LAB.md#idea-007-hatching-energy-blockers). Retain population slots reserved at laying, physical clearance and world-energy debt blockers unless separately reviewed. The further energy-target restriction is the issue for later evaluation.

## Related discussion: observer-only egg energy display

**Already implemented**; see [egg display reference](EGG_RESERVE_DISPLAY.md) and [completed work](CONTRIBUTOR_COMPLETED.md). The current observer-layer ordering idea is [IDEA-013](IDEA_LAB.md#idea-013-egg-overlays-behind-creatures), not a reopening of the initial feature.

## 6. Fractional nutrient recycling rate

See [IDEA-008](IDEA_LAB.md#idea-008-nutrient-appearance-frequencies-below-one-per-second). Permit deterministic appearance frequency below 1 particle per simulated second (examples 0.5/s, 0.1/s), **not** faster/slower nutrient energy decay.

## 7. Named custom environmental scenarios

See [IDEA-009](IDEA_LAB.md#idea-009-named-scenario-profiles). Reusable user-named environment profiles are distinct from fixed built-in Default, Harsh and Pipe World presets.

## 8. Selective lateral portals and multi-aquarium travel

Local self-connected windows and stages 1–3 are **completed**, not pending requests. See [completed-work register](CONTRIBUTOR_COMPLETED.md). Only **Stage 4 cross-user aquariums** remains under [IDEA-010](IDEA_LAB.md#idea-010-remote-aquariums); its current deferred requirements and open questions are consolidated in [REMOTE_AQUARIUM_DESIGN.md](REMOTE_AQUARIUM_DESIGN.md). Do not revive superseded mockups, yellow-marker designs, old testing-only freezes or stale stage approval constraints.

### Portable full-state organism files and identity decisions — 2026-10-28

The separate, deferred [IDEA-011](IDEA_LAB.md#idea-011-portable-organism-state) covers versioned **one-live-organism** export/import. Do not confuse this with a genome-only bank entry, whole-aquarium snapshot or already implemented local in-memory tube transfers. Destination identity and birth/import/transfer counter semantics remain open; see [the consolidated remote/portable design](REMOTE_AQUARIUM_DESIGN.md).

## Reuse protocol

Read the [current idea card](IDEA_LAB.md) and its linked detailed design rather than old PR snapshots. Preserve source links and experimental evidence. Avoid treating historical plans as current implementation authorization. For past discussions, consult this file's history and the original fork/upstream issue and PR threads.
