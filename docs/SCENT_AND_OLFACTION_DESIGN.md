# IDEA-026 — Scents, olfaction and pheromone traces

> **State:** Exploring, personal future concept; no implementation, experiments or upstream submission authorized. [Active idea card](IDEA_LAB.md#idea-026-chemical-scents-olfaction-and-pheromone-traces) · [related upstream #118](https://github.com/smeagol44/vidAI/issues/118) · [shared tracking #57](https://github.com/smeagol44/vidAI/issues/57). **IDEA-023 performance remains P0**.
>
> This document contains **only the current design, unresolved decisions and constraints**. Previous models, naming comparisons and discussion history remain in Git history and [fork PRs](https://github.com/hernansgarro/vidAI/pulls?q=is%3Apr+author%3Ahernansgarro).

## Agreed conceptual model

### Chemical channels and source signatures

| Channel | Selected mnemonic | Preferred biological association | Source signature |
| --- | --- | --- | --- |
| R | **Umami** | Organic food particles, blood/raw-meat-like | R only: `RR0000` |
| G | **Fresco** | Inorganic nutrient particles | G only: `00GG00` |
| B | **Almizclado** | Living creatures and inherited odor | B dominant; variable lesser R/G |

The names describe **fictional olfactory dimensions**, not actual human odor chemistry: **umami is a taste, not an odor**. Names may be reconsidered if a future taste feature requires it, but these are the present user-selected labels. Creature odor is heritable and may vary in every channel, often emphasizing B. Gland-produced pheromones may have more variable heritable signatures, initially possibly B-dominant. These chemical channels are **not visible RGB light to organism eyes**. No genetic numeric defaults have been selected.

### Eggs: offspring-like odor shifted toward white

Eggs emit scent directly, with an odor signature based on the **actual genetically determined future offspring**, but shifted toward `FFFFFF` so all three components have a positive baseline. A candidate formula for each channel `c` is:

`egg[c] = round((1 - w) * offspring[c] + 255*w)`, for `0 < w < 1`.

This preserves a scaled difference from the offspring's signature, keeps every component **at or below FF**, and makes any already-FF component remain FF. At illustrative `w=0.2`, future organism `2030C0` yields egg `4D59CD`; `0000FF` yields `3333FF`. **No whitening amount has been selected**. This changes the chemical signature, not the egg's established white optical appearance or an emitted circle's intensity/alpha. The correct authoritative embryo-genotype lifecycle point must be verified before implementation. No source or kin identifiers are delivered to noses.

### Common scent-circle lifecycle

- Every direct source or pheromone marker periodically emits an **independent circular scent pulse**. A pulse retains a fixed three-channel fragrance signature, expands in radius and loses its **single scalar intensity faster than simple inverse-area dilution**.
- Illustrative non-binding decay example: area 1 / intensity 10; area 2 / intensity 4; area 4 / intensity 1; next tick intensity 0, followed by **real removal from authoritative state**. Exact law and zero cutoff remain open. Do not merely hide expired pulses.
- **Direct emission while present:** inorganic/organic nutrients, eggs and creature bodies. Nutrients and eggs may pulse less frequently; direct creature body scent is tentatively somewhat stronger than scent released by its passive pheromone objects. Ordinary direct pulses may leave brief trails after movement.
- **Involuntary deposits:** each creature also intermittently deposits small finite pheromone markers bearing its inherited signature. A marker contains a limited number of perfume units, consuming one per emitted weak pulse, and disappears when exhausted; earlier emitted pulses continue until independently expired. A deposit per second and three units per marker are only **examples**, not approved settings.
- **Controlled glands:** optional inheritable organs emit further pheromone markers on brain command at **a real organism energy cost**. They may use distinct, more flexible inherited signatures and provide **camouflage by additive mixture**, never chemical neutralization or subtraction. No attracting, avoiding or social goals are hardcoded.
- Persistent emitters have a conceptual unlimited emission capacity **while they exist**, but this does not imply free material energy, unbounded particles or an exception from the energy ledger. The scent-circle lifecycle is identical for all emitter types.

### Fixed RRGGBB signature; separate intensity equals observer alpha

The proposed hexadecimal representation is `RRGGBBTT`: fixed fragrance components R/G/B each in `00–FF`, with one **independent scalar pulse intensity** matching **spectator alpha/opacity TT one-to-one** (`00` = no signal/fully transparent, `FF` = maximum/opaque). A pulse retains its RGB proportions throughout its lifetime; **all three signature components fade together** through the common intensity scalar, not through separate chemical decay rates. TT is not a fourth sense.

At the sensory point, each circle contributes attenuated components, e.g. the candidate `localC = signatureC * intensity/255` for a uniform pulse; **nose readings sum the three channels independently across all overlapping circles**, then saturate at a high per-channel `FF` cap. Example: R=3 plus R=5 yields R=8. Ordinary signals should stay well below saturation. Source strength, scaling, rounding, within-circle spatial gradient and exact field overlap are still undecided.

The spectator may optionally view RGB-colored circles with matching opacity. Hiding the overlay does not stop real simulation or nose signals. **Analysis of exact alpha-compositing parity with additive sensing is expressly deferred** by the user and is not a current design blocker.

### Olfactory organs and evolution

Inheritable noses sample only the **physically present local three-channel concentration**, feeding the existing recurrent brain and lifetime learning; a reading supplies **no emitter identity, kin label, intended target or privileged source direction**. Scent tracking/avoidance/communication must emerge through gradients sampled by movement, receptor position and neural memory. Nose number, location, receptor sensitivity and construction/upkeep cost remain undecided.

## Open design decisions

1. Frequency, capacity, cost and initial intensity of direct body/nutrient/egg pulses and passive/active pheromone markers; limits for stationary creatures and dense populations.
2. Circle growth rate, accelerated decay equation, true deletion threshold, per-position concentration profile and transport with water/walls/tubes.
3. Numeric representation/rounding/normalization of each component, sampled intensity, summed signals and saturation.
4. Genetic location/inheritance/mutation of noses, gland outputs and creature odor; offspring signature availability for eggs and the whitening factor.
5. Energy transfer/accounting for active secretion, passive deposits, persistent sources and physical perfume units; exact conservation.
6. Deterministic Worker fixed-tick updates, PRNG/persistence, historical saves and Bank compatibility; authoritative spatial indexing, CPU/memory/frame-traffic bounds, and approved ecological/performance experiments.

## Non-negotiable boundaries

- Preserve physically emergent articulated movement, inherited genetics, funded reproduction, energy conservation, Worker authority, off-camera simulation, fixed ticks, x0 pause, historical saves and exact continuation. Never introduce artificial propulsion, behavior guarantees or hidden fitness.
- The separate olfactory sense is **not optical RGB**. Human visualization must not change organism senses or physics. Source disappearance cannot leave permanent, cost-free scent entries.
- **Performance is P0 elsewhere**: no naive all-circles × all-noses implementation or thousands of uncontrolled overlays without measured capacity and a bounded approved protocol. Future realization needs separate authorizations, tests, and a fork-first PR; **no upstream PR or VIDA 3D modifications** are authorized here.
