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

**User clarification (2026-11-03):** Keep the memorable metaphorical names **floral, herbal, mineral** for the three fictional chemical dimensions. They are not claimed to match real chemistry. The previously suggested unnamed A/B/C axes are explicitly **not preferred**; do not reopen that naming choice without a new user request. The human observer may map these dimensions to R/G/B, but the simulated chemicals are **not optical pigments** and noses must not receive optical color or hidden entity labels. It remains open whether per-channel values encode relative composition, absolute concentration, or both.

### Emission, spatial range and decay

- Proposed spectator visualization: a circular halo centered on the source, optionally shown. **Opacity** represents concentration/intensity and **radius** represents the *effective reach* of a scent rather than a direct measurement of chemical amount. The user's clarified preference is for a scent to **grow in reach and then fade away**, not necessarily shrink.
- Emission may begin at an organism's **center of mass** for simplicity, with part-based emission as a potential later extension.
- **Proposed two-phase pheromone life cycle (not a fixed physical law):** during **emission/dispersal**, a small material pheromone core/droplet dissolves, emitting a localized scent cloud. Core volume/remaining amount decreases, while the emitted cloud may gain reach and retain substantial intensity from continuing release. Once the core is exhausted, **source-free diffusion/decay** starts: the residual scent cloud spreads further while its local intensity falls quickly, and disappears at a defined perceptibility/expiry cutoff.
- For more enduring emitters (nutrients or creature bodies), an actively emitting source may sustain a bounded characteristic reach and concentration while it exists. A source's size/available emitted material can influence its characteristic reach, but **volume, area, radius, mass, concentration, and emitted flux are distinct quantities**, not interchangeable without a mapping. The user suggested reach related to pheromone quantity/volume; define the dimensional relationship later.
- A scent cloud should be conceptualized separately from a diminishing material pheromone core. In particular, **dissolution transfers material/signaling potential out of the core into the surrounding scent field** rather than automatically deleting the emitted scent. Conversely, maintaining concentration while the area expands requires a continuing source or an explicitly acknowledged abstraction; otherwise dilution must lower concentration.
- These principles are an evolutionary-simulation design direction, not a measured real-world diffusion model. Whether concentration varies with distance from the core (e.g. stronger near the center), whether field movement follows currents, and exact growth/fade curves are **undecided**.
- Clarify emitted quantity, local concentration, source strength, effective radius, falloff, decay rate, lifetime and behavior when the original source moves or disappears.
- Nearby sources can overlap. The three sensor concentrations must combine according to an explicit rule, with defined saturation; rendering layers must not determine what organisms smell.
- Water barriers, tank edges, local tubes and potential transfer between connected water regions need explicit behavior. A human hide/show toggle must never disable actual sensing or accelerate/stop scent decay.

### Olfactory organs and brain inputs

- Proposed noses sample three actual local chemical components when inside the field, passing them into the creature's brain through a sensory pathway analogous to vision, **not** through existing optical RGB or secret source identifiers.
- Open: genetic presence, number and position of noses; relative receptor sensitivity; normalization, saturation, refresh cadence, possible noise and construction/maintenance costs.
- A single local sample gives **concentration, not source direction**. Gradient following should only be possible through different sampling positions, changes over time and neural memory, or another explicitly modeled mechanism.
- Organism odors are genetically determined and inheritable/mutable. Shared scent similarity is not an automatic parent/offspring identifier.

### Passive odor trails versus active glands

**Involuntary traces:** Organisms would periodically release small scent-bearing droplets, leaving short-lived trails. Their scent initially matches the organism's ordinary genetic signature. Cadence should not be high; exact interval, duration, drift, total particle bound, stationary emission and possible passive emission cost remain open. The **material droplet shrinks/dissolves while the associated scent cloud may initially spread**, then the residual **core-free cloud spreads further and fades** before expiry. A vanished core does not necessarily mean that its scent immediately disappears. Droplets need not collide with bodies, provide food, or be visible to creature vision.

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

1. **Naming preference resolved:** use the metaphorical floral/herbal/mineral components with R/G/B spectator mapping. Still decide whether component numbers represent chemical mixture ratios, absolute local concentrations, or separate values for both.
2. **Two-phase direction established, mathematical model open:** how do a shrinking core, emitted amount, characteristic source reach, cloud radius, concentration gradient, continued diffusion and decay relate over time? Which intensity cutoff ends sensing?
2a. When a *nutrient or organism* emitter disappears or moves, should its existing scent persist as a separate short-lived residual cloud, as proposed for pheromone cores, or should this special treatment apply only to deposited pheromones?
3. Do organisms emit from their center of mass or each individual part? What is inherited?
4. How many noses, where, at what sensing cost, and with what optional per-channel sensitivity?
5. How often do passive droplets appear, how long do they persist, and is their release paid?
6. Are active glands limited to one signature, or can there be multiple genetically distinct emitted signals?
7. Do droplets contain energy-bearing chemical material or only a sensory marker? How do decay, water movement and tubes interact with them?
8. How will we maintain acceptable CPU, Worker-to-UI traffic and renderer cost given the existing performance audit?

## Dated design history

- **2026-10-28:** The user briefly proposed chemical signatures and scent droplets as a distinct future system, noted in [upstream #118](https://github.com/smeagol44/vidAI/issues/118). No detailed implementation choice was settled.
- **2026-11-03:** The user expanded this to three scent channels, nutrient/body emissions, circular observer-only halos, noses, genetic body odor, passive droplets, active controlled glands and open energy accounting. This file captures his proposal and unresolved questions for iterative refinement.
- **2026-11-03 (refinement):** The user rejected abstract A/B/C names and explicitly retained floral/herbal/mineral as mnemonic metaphors. He proposed a dissolving pheromone core that initially supports an expanding strong odor cloud, followed by source-free further expansion and rapid loss of intensity until disappearance. A sustained emitter may retain a characteristic reach while it exists; exact source quantity/reach scaling, physically plausible dilution, residual trails and concentration gradients remain open. No runtime behavior or coefficient is approved.
