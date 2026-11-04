# VIDA 2D — Current Feature Reference

VIDA is an aquatic artificial-life simulator. Articulated bodies, inherited
neural controllers, individual experience and physical interactions determine
behavior. Survival and reproduction depend on finite energy.

**Implementation baseline: v0.39.0.** The core mechanisms exist; reliable
foraging, predator pursuit and self-sustaining multigeneration ecosystems remain
unproven. This reference covers VIDA 2D; the separate 3D project is independent.

[Play VIDA — production](https://smeagol44.github.io/vidAI/) · [Open experimental testing](https://smeagol44.github.io/vidAI/testing/) · [Source](https://github.com/smeagol44/vidAI)

The independent `testing` branch publishes to `/vidAI/testing/` without
replacing production. Its distinct release label identifies the pinned main
version and commit, cycle and iteration (currently `T1.1` from
`main v0.37.0 @ b2a05e5`). Each testing commit advances its iteration;
resetting to an explicitly chosen newer main baseline begins the next cycle.
Production uses its independent `v0.39.0` release and forward-mouth save format.
The testing-only version code must never be merged to main.

## Simulation overview

```mermaid
flowchart TD
  G["Inherited body, brain and learning rules"] --> A["Living creature"]
  W["Physical world and finite food"] -->|"Senses and contact"| A
  A -->|"Joint torques and feeding"| W
  A -->|"Sufficient reserves and maturity"| E["Funded egg"]
  E -->|"Incubation, population and space permit"| O["Offspring with mutated inherited genes"]
  O --> A
  A -->|"Death and dissolution"| R["Finite remains"]
  R --> W
```

## Diagrams

- [Starter construction](Featured-Starters#starter-construction)
- [Recurrent brain architecture](Waking-Learning#recurrent-brain-architecture) and [personal learning loop](Waking-Learning#personal-learning-loop)
- [Motor control loop](Motor-Control#motor-control-loop)
- [Sensory feedback loop](Sensory-Behavior#sensory-feedback-loop)
- [Closed energy transfers](Ecology-Baseline#closed-energy-transfers), [open-world transfers](Ecology-Baseline#chemical-energy-transfers) and [egg lifecycle](Ecology-Baseline#egg-lifecycle)
- [Worker and display architecture](Simulation-Performance#worker-and-display-architecture)

The contributor fork also implements [continuous food degradation and bounded
carrion mineralization](Ecology-Baseline#continuous-food-recycling--contributor-fork)
for new closed worlds; historical saves keep their original rules. This feature
is pending canonical upstream acceptance.

## Systems

| Page | Covers |
| --- | --- |
| [Featured Starters and Specimen Bank](Featured-Starters) | Nine featured designs, 55 legacy designs, defaults and selection |
| [Movement and Motor Control](Motor-Control) | Physical joints, mutable rhythms, drag, muscle scaling and offline swimming search |
| [Senses and Visually Guided Behavior](Sensory-Behavior) | Retina, spectral sensitivity, feedback and inherited sensory responses |
| [Waking Synaptic Learning](Waking-Learning) | Brain architecture, activation memory, personal learning and inheritance |
| [Ecology and Energy Auditing](Ecology-Baseline) | Feeding, funded eggs, egg reserve-loss display, environmental scenarios, food distribution and ecological measurements |
| [Energy Activity Overlays](Energy-Activity) | Observer overlays for real absorption and localized predation |
| [Simulation Performance](Simulation-Performance) | Worker ownership, rendering, optimizations, saves and throughput limits |
| [Self-Linked Windows and Physical Tubes — contributor fork](Side-Windows) | Fixed 300-unit sections, local self-call/window consent, physical channel ecology and full-state local transfer |

## Original plan and current status

| Original phase | Status |
| --- | --- |
| 1 — Variable neural architecture | Implemented: stable identities and variable hidden-neuron counts |
| 2 — Inherited structural brain evolution | Implemented: offspring can mutate neurons and connections |
| 3 — Biological trade-offs and egg inspection | Core scope implemented; some other inherited trait trade-offs remain open |
| 4 — Evolvable activation-memory timescales | Implemented |
| 5 — Learning during individual lives | Bounded waking-learning feature set implemented; ecological usefulness remains inconsistent |
| 6 — Optional rest/sleep and experience replay | Not implemented; world-model dreaming is also absent |

The additional **B-A–B-D** movement, sensory-behavior and ecological-measurement
workstream is complete as a bounded prototype. It did not replace original
Phases 5 and 6 or establish sustainable ecology. Worker/render separation and
the bounded offline starter search are implemented additional capabilities.

New worlds use the established swimming forces with prepaid simultaneous
muscle work and a kinetic-passive complete joint solve. Saved worlds retain their explicit regime; surface-model worlds
can opt into repaired swimming and other old worlds can explicitly stabilize
their joint solver without losing their ecosystem. Coherent
replacement drag/muscle scaling and full solver mechanical conservation remain
unresolved; see [Movement](Motor-Control).

New application worlds use a closed recycled energy budget and population
slots shared by living creatures and eggs. Incubation uptake is funded, debt
blocks hatching and unhatched eggs have finite lifetimes. Existing saves keep
their open economy until explicit conversion; see [Ecology](Ecology-Baseline).

## Scope and maintenance

The next ecological goal is unassisted food acquisition followed by genuinely
funded laying, hatching and reproduction across generations. Physical growth,
local tissue repair, gradual senescence and within-life structural brain growth
remain unimplemented. Current anatomy is capped at seven parts; the original
roughly 100-creature/1,000-part performance ambition remains unverified.

These pages describe current implementation and limitations, without release
history. Detailed experiments stay in
[project status](https://github.com/smeagol44/vidAI/blob/main/docs/PROJECT_STATUS.md);
priorities stay in the [roadmap](https://github.com/smeagol44/vidAI/blob/main/docs/FEATURE_ROADMAP.md).
The maintained source is `docs/wiki/`, automatically published to this Wiki.

## Advanced observation settings — contributor fork

**Fork-only; pending upstream acceptance.** The button at the bottom of Settings
opens a separate draggable Advanced Settings window with three independent options:
**Automatically select added creatures** (Add Life and every Bank spawn),
**Automatically track selected creatures** (manual picking and automatic selection),
and **Show water caustics** (the blurred, decorative water-light patterns).
New Default worlds start with all three checked; new Harsh World and fork-only
Pipe World worlds start with all three unchecked. Choosing a scenario in the menu
takes effect only when starting that world. In-world reseeding keeps current
overrides.

Changing a checkbox affects future actions; it does not clear an existing
selection or stop a manually chosen Track. Turning automatic selection off keeps
the previous selected creature when adding another. The Track/Free button remains
available independently. Preferences travel in exported snapshot metadata and
restore on import; historical snapshots without them retain automatic selection,
automatic tracking and visible caustics. Hiding caustics skips the canvas caustic
paint/blur pass but leaves the same caustic objects in the simulated state.
These preferences never enter the Worker simulation, sensory inputs, genetics,
energy or random stream. Disabling the blur may help display rendering on some
graphics backends; it does not guarantee higher Worker throughput.
On contributor **testing only**, **System diagnostics** opens a session event
console in the same window. It shows local date/time, severity, subsystem and
description, with combined severity/subsystem filters and **Clear history**.
The newest 200 entries are retained while the console is closed; reload clears
history. Worker startup/fallback/errors and snapshot import outcomes are
recorded. No event history enters saved worlds or the organisms' senses.
Back or Escape returns to the advanced options; another Escape closes the
window. The close button also dismisses it. Its size/position stay within the
tank viewport, including on phones. No grid-integrity auditing is implemented.
See [observer diagnostic console](Simulation-Performance#diagnostic-console--contributor-testing-only).

Observer-only energy activity is documented in [Energy Activity](Energy-Activity).
- [Self-Linked Windows and Physical Tubes](Side-Windows)
