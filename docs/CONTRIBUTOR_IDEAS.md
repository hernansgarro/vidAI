# Contributor design ideas — fork-only discussion notes

> **Status:** Exploratory ideas from Hernan, recorded on 2026-10-28. These are **not approved implementation requirements**, **not upstream proposals**, and **not part of the canonical upstream backlog**. Do not create upstream issues, PRs, or owner requests from these notes without a separate explicit decision.
>
> **Visibility:** This file is in the public contributor fork `hernansgarro/vidAI`; it is not confidential. When preparing clean upstream submission branches, exclude this contributor-only journal unless separately authorized.

## Topic index

| Topic | Keywords to revisit when designing a related requirement | Status |
| --- | --- | --- |
| Genetically controlled decision to lay | reproduction, egg laying trigger, threshold, energy sufficiency, behavior | Deferred for future design |
| Heritable parental risk / retained reserve | reproduction, parent survival floor, reproductive sacrifice, selection | Deferred for future design |
| Prepaid incubation instead of shared-world uptake | egg energy, ecology, incubation, energy conservation, hatching | Deferred simulation-model review |
| Egg buoyancy as a paid inherited trait | buoyancy, gravity, egg dispersal, predation, inherited physics | Separate possible requirement |
| Simplifying hatch blockers | population occupancy, clearance, debt, expiry, hatching | Hypothesis only; needs careful review |

## 1. Genetically controlled decision to lay eggs

**Idea:** Reproduction should not occur through an identical automatic energy-eligibility rule for every organism. An inherited, mutable trait or controller decision should influence when a parent considers laying an egg worthwhile. Organisms with different strategies may reproduce earlier or wait for higher reserves.

**Existing distinction:** The parent's `eggReserveFraction` currently influences the initial reserve allocated to eggs; this is **not** the same as a genetic decision threshold or learned reproduction policy. Clutch size, maturity and cooldown are already heritable.

**Questions before adoption:** Define the measured parent-energy signal, how it connects to inherited genetics versus a neural decision, how to preserve asexual funded reproduction and exact historical saves, and how the strategy remains selectable by physical ecological outcomes. No hidden fitness or forced success.

## 2. Heritable parent reserve sacrifice

**Idea:** Make the amount or proportion of energy retained by a parent after egg laying a mutable, inherited risk trait. A low-retention, high-risk ("kamikaze") strategy could produce more eggs while leaving the parent vulnerable; a high-retention strategy favors parent survival. Let natural ecology determine which strategy persists.

**Current behavior:** The parent must retain at least `max(2,000 J, 12% of its energy-storage capacity)`. This floor is fixed rather than a heritable sacrifice trait. The existing inherited egg-reserve fraction is a different parameter.

**Questions before adoption:** Define sensible bounds and genetic inheritance, the interaction with clutch count and mutated offspring body cost, and conservation/history compatibility. Do not implement during the present visual-egg requirement.

## 3. All egg development energy should originate with the parent

**Idea:** The parent should prepay the full cost of the offspring's structure, incubation process, and intended usable reserve when laying. Eggs should not absorb abstract energy from the shared world reserve during incubation. Less food would naturally mean fewer affordable eggs. Incubation may have a separately accounted energetic cost, distinct from the energy stored in body structure and post-hatch reserve.

**Current behavior:** Closed-economy eggs receive parent-funded structure and reserve, but `fundIncubatingEggs` can transfer additional available world-reserve energy; incubation progress itself currently consumes no egg energy. Closed-world hatching uses a reserve target which includes a 10% top-up, subject to storage capacity.

**Scope gate:** This is a future simulation-economy change requiring explicit authorization, conservation accounting, migration/legacy-save behavior, and ecology tests. The present egg-energy visualization should initially continue to reflect the existing funding/recovery behavior, not silently alter it.

## 4. Genetically influenced egg buoyancy

**Idea:** A parent might pay energy for inherited egg buoyancy opposing gravity, potentially dispersing eggs away from predators. Decide physical mechanism, actual energy cost, and ecological trade-offs separately. No artificial scripted propulsion. Not in the current egg-visualization scope.

## 5. Hatching restrictions and occupied space

**Hypothesis:** Once incubation is complete and its energy is prepaid, the parent would like only population capacity to prevent hatching.

**Current conflict:** Closed-world eggs reserve population slots at laying, so the cap does not generally block hatching. Hatch clearance currently prevents body overlap and wall penetration, world energy debt can block hatching, and closed eggs expire after three incubation periods. Legacy open-economy worlds differ.

**Decision needed:** Reconcile the user's desired simplicity with physical collision clearance, existing reserved slots and historical-save compatibility. This is **not** an approved removal of existing protections.

## Related discussion: observer-only egg energy display

The ongoing visualization idea is **not yet finalized**. Tentative direction: an egg stays perceptually white to organisms, while a human-only pink sector expands counterclockwise as a fraction of its original usable reserve is consumed; the sector may shrink if the present closed-economy implementation restores that reserve. Keep the existing outer incubation ring and organism sensory semantics. Do not confuse energy depletion, structural damage, recovery prospects, or incubation completion. No Work prompt or implementation authorization has been issued.

## Reuse protocol

When a new requirement touches one of the indexed topics, re-read the relevant note, mention the potential connection to Hernan, and ask whether the idea should be considered. The file is a contributor discussion journal, not a parallel upstream roadmap or automatically authorized task list.
