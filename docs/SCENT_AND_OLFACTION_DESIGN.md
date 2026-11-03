# IDEA-026 — Chemical scents, olfaction, and pheromone traces

> **State:** Exploring. First expanded discussion: 2026-11-03. Personal contributor notes only. This is neither an approved specification nor authorization for implementation, experiments, an upstream issue/PR, release, or deployment.
>
> [Personal idea card](IDEA_LAB.md#idea-026-chemical-scents-olfaction-and-pheromone-traces) · [Earlier related mention: upstream #118](https://github.com/smeagol44/vidAI/issues/118) · [Shared roadmap #57](https://github.com/smeagol44/vidAI/issues/57)

## Motivation and Hernan's initial proposal

Create an evolvable chemical sensory and signaling system, independent of optical RGB vision. The proposed emitters are (1) inorganic/organic nutrients, (2) living organisms and potentially their body parts, and (3) short-lived abstract scent/pheromone droplets not yet in the simulation. Organisms with noses would receive three local chemical readings into their brain; attraction, tracking, avoidance, recognition and communication would need to emerge rather than being scripted.

### Proposed three-channel scent and observer colors

Hernan initially suggested **floral (R), herbal (G), mineral (B)**. His initial text repeated G for the third component, apparently a channel-letter typo. This is a *provisional analogy*, not a real-world chemical taxonomy or a finalized genetic representation.

| Emitter | Initial illustrative scent | Optional human-visible halo |
| --- | --- | --- |
| Inorganic nutrient | Entirely herbal/G | Green |
| Organic nutrient | Floral/R and mineral/B, with more R | Red-purple |
| Organism | Heritable signature; initial illustrative mineral/B-dominant plus floral/R | Blue-purple |
| Scent droplet | A signature inherited from its source or separately produced, to decide | Corresponding color mix |

An alternative worth discussing is **abstract chemical axes A/B/C**, displayed as RGB *only to the human spectator*. Source genes and nose readings would refer to independent chemical channels, not actual red/green/blue optical pigments. Channel values might represent proportions, absolute concentration or a combination; that has not been decided. No smell is visible to a creature's eyes by default.

### Emission, spatial range and decay

- Proposed spectator visualization: a circular halo centered on the source, optionally shown. **Opacity** represents scent intensity; **radius** represents scent amount. The initial proposal describes both shrinking/fading as scent dissolves.
- Emission may begin at an organism's **center of mass** for simplicity, with part-based emission as a potential later extension.
- These labels do not yet define a physical field model. In real diffusion, a plume can expand while becoming less concentrated. Decide between bounded local auras, spreading/fading fields, advected droplets or another deterministic simplified field.
- Clarify emitted quantity, local concentration, source strength, effective radius, falloff, decay rate, lifetime and behavior when the original source moves or disappears.
- Nearby sources can overlap. The three sensor concentrations must combine according to an explicit rule, with defined saturation; rendering layers must not determine what organisms smell.
- Water barriers, tank edges, local tubes and potential transfer between connected water regions need explicit behavior. A human hide/show toggle must never disable actual sensing or accelerate/stop scent decay.

### Olfactory organs and brain inputs

- Proposed noses sample three actual local chemical components when inside the field, passing them into the creature's brain through a sensory pathway analogous to vision, **not** through existing optical RGB or secret source identifiers.
- Open: genetic presence, number and position of noses; relative receptor sensitivity; normalization, saturation, refresh cadence, possible noise and construction/maintenance costs.
- A single local sample gives **concentration, not source direction**. Gradient following should only be possible through different sampling positions, changes over time and neural memory, or another explicitly modeled mechanism.
- Organism odors are genetically determined and inheritable/mutable. Shared scent similarity is not an automatic parent/offspring identifier.

### Passive odor trails versus active glands

**Involuntary traces:** Organisms would periodically release small scent-bearing droplets, leaving short-lived trails. Their scent initially matches the organism's ordinary genetic signature. Cadence should not be high; exact interval, duration, drift, total particle bound, stationary emission and possible passive emission cost remain open. Each droplet fades and its amount decreases until expiry. Droplets need not collide with bodies, provide food, or be visible to creature vision.

**Brain-controlled glands:** Separate inheritable organs could, on a brain output command, produce an emitted scent (possibly with a distinct heritable signature). These emissions **cost organism energy**. Quantity, timing, gland phenotype, cooldown, possible multiple signatures and maintenance expenses are unresolved; the brain is not supplied with built-in messages or predefined social goals.

**Energy model to decide:**
- **Information marker without a separately spendable energy store:** Charge the emitter for active secretion and account for that expense through the closed-world energy ledger in line with existing dissipation rules. The marker holds sensory information, not collectible energy.
- **Physical chemical stock:** Transfer paid material energy from organism to droplet, persist it explicitly and return it exactly once upon decay/removal. Never conjure or discard energy.
- Explicitly decide whether passive deposition carries an energy cost. Do not assume that generating arbitrarily many persistent physical chemicals is free.

### Preservation, performance and compatibility constraints

- The simulation Worker is authoritative for emissions, positions, field state, nose sampling, energy, and expiries on deterministic fixed ticks, including off-camera and at high playback speeds. At x0 none of those lifetimes advance; display-only inspection remains allowed.
- Preserve genetic inheritance, lifetime neural learning, physical locomotion/feeding, ecology, energy conservation, current tube behavior and exact historical saves. New genes/parts/glands/markers would need deliberate schema and Bank compatibility; legacy bodies cannot silently acquire a new sense.
- **IDEA-023 performance is still P0.** A naive all-emitters × all-noses query and per-droplet alpha compositing can be expensive. Any implementation proposal needs a measured performance budget and an efficient, deterministic local spatial sampling approach (for example bounded emissions/spatial indexing), keeping renderer refresh and Worker tick rate separate.
- Eventual validation would need tests for overlapping fields, mixed channel readings, source direction not being secretly injected, absence of nose, genetics, costs, droplet expiry, tube boundaries, old saves/PRNG continuation, off-camera Worker execution and observer visualization isolation. Ecology/performance comparisons require a separately authorized bounded protocol.
- This future chemical system is **not** an extension of the own-egg/offspring retinal proposal in upstream #118. No feature coding, tuning, trials, PR to upstream, or change to VIDA 3D is authorized by these notes.

## Questions still open

1. Are the three axes best named floral/herbal/mineral or neutral A/B/C, with RGB only for spectators? What do the three values quantify?
2. Is scent a simple local halo, a spatially diffusing field, or many drifting droplets? How should radius and opacity evolve?
3. Do organisms emit from their center of mass or each individual part? What is inherited?
4. How many noses, where, at what sensing cost, and with what optional per-channel sensitivity?
5. How often do passive droplets appear, how long do they persist, and is their release paid?
6. Are active glands limited to one signature, or can there be multiple genetically distinct emitted signals?
7. Do droplets contain energy-bearing chemical material or only a sensory marker? How do decay, water movement and tubes interact with them?
8. How will we maintain acceptable CPU, Worker-to-UI traffic and renderer cost given the existing performance audit?

## Dated design history

- **2026-10-28:** The user briefly proposed chemical signatures and scent droplets as a distinct future system, noted in [upstream #118](https://github.com/smeagol44/vidAI/issues/118). No detailed implementation choice was settled.
- **2026-11-03:** The user expanded this to three scent channels, nutrient/body emissions, circular observer-only halos, noses, genetic body odor, passive droplets, active controlled glands and open energy accounting. This file captures his proposal and unresolved questions for iterative refinement.
