# Contributor design ideas — fork-only discussion notes

> **Status:** Exploratory ideas from Hernan, recorded on 2026-10-28. These are **not approved implementation requirements**, **not upstream proposals**, and **not part of the canonical upstream backlog**. Do not create upstream issues, PRs, or owner requests from these notes without a separate explicit decision.
>
> **Visibility:** This file is in the public contributor fork `hernansgarro/vidAI`; it is not confidential. When preparing clean upstream submission branches, exclude this contributor-only journal unless separately authorized.

## Topic index

| Topic | Keywords to revisit when designing a related requirement | Status |
| --- | --- | --- |
| Genetically controlled decision to lay | reproduction, egg laying trigger, threshold, energy sufficiency, behavior | Deferred for future design |
| Heritable parental risk / retained reserve | reproduction, parent survival floor, reproductive sacrifice, selection | Deferred for future design |
| Prepaid incubation energy (parent-funded) | egg energy, parental budget, incubation, conservation, hatching | Deferred; explicitly excluded from egg-display requirement |
| Review passive egg energy recovery / shared-world uptake | egg energy, osmosis, replenishment, shared reserve, hatching | Deferred review and possible removal; not part of display change |
| Egg buoyancy as a paid inherited trait | buoyancy, gravity, egg dispersal, predation, inherited physics | Separate possible requirement |
| Simplifying hatch blockers | population occupancy, clearance, debt, expiry, hatching | Hypothesis only; needs careful review |
| Fractional nutrient recycling rate | recycling, 0.5/s, 0.1/s, deterministic accumulator | Deferred; excluded from scenario selector |
| Named custom environmental scenarios | environment profiles, reusable settings, mnemonic names | Deferred; first version has only Default / Harsh World |

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

**Scope gate (2026-10-28):** Explicitly **exclude all incubation energy costs, parent prepayment changes, and incubation-funding mechanics** from the observer-only egg-display requirement. This is a future simulation-economy change requiring separate authorization, conservation accounting, migration/legacy-save behavior, and ecology tests. Preserve existing runtime behavior and historical saves for now; no implicit replenishment mechanism is being proposed by the contributor.

## 3a. Review passive egg energy recovery from the shared world reserve

**Pending review / possible adjustment (2026-10-28):** Hernan does **not** propose that eggs replenish their energy, and questions the existing `fundIncubatingEggs` transfer from the shared world reserve as an unnatural, osmosis-like mechanism. In a future requirement, reconsider removing this uptake entirely and making the parent fund all egg energy before laying. This is **not approval to alter or remove existing uptake in the current visualization change**. Present observational data must reflect whatever the authoritative runtime currently does, including possible reserve restoration, without introducing another energy source or recovery path.

**Related:** Parent-paid incubation energy above is a separate design decision; no egg energy conservation, reproduction, hatching, migration, or genetics rules are to be changed just to deliver the visual indicator.

## 4. Genetically influenced egg buoyancy

**Idea:** A parent might pay energy for inherited egg buoyancy opposing gravity, potentially dispersing eggs away from predators. Decide physical mechanism, actual energy cost, and ecological trade-offs separately. No artificial scripted propulsion. Not in the current egg-visualization scope.

## 5. Hatching restrictions and occupied space

**Current agreement (2026-10-28):** Keep existing population slots reserved at laying; this already addresses the population cap for closed-world eggs. Retain physical hatch-space clearance and world-energy debt as acceptable hatch blockers. Hernan questions the *additional energy-target requirement* that can block a fully incubated egg; study that separately, not in the visual indicator requirement. Leave existing incubation, reserve-uptake, space, expiry, debt, and legacy-world hatching behavior unchanged for now.

**Pending review:** Simplify remaining hatching-energy requirements in a future authorized simulation-model change, preserving conservation, clearance, and historical saves. No current change is approved.

## Related discussion: observer-only egg energy display

**Design direction agreed 2026-10-28; implementation not started:** Store the originally parent-funded usable egg reserve for a persistent observer-only reference. Render a white egg with a pink sector growing counterclockwise as the original usable reserve falls, and shrinking when existing code actually replenishes that reserve; clamp the white area at 100%. At zero remaining usable reserve, keep the egg fully pink even if predators then consume structural funding. Do not display structural damage as an additional color or treat the sector as a hatch-readiness indicator. Preserve the clockwise outer incubation-progress ring, sensory egg white (`EGG_RGB`) and all ecology/genetics/physics. A fully pink egg does **not** necessarily fail or immediately become carrion under the current closed-world rules, because present uptake may restore funding before expiry; avoid claiming otherwise in the UI. Historic eggs without stored original reserve need a clearly documented, noninvented compatibility fallback. Work prompt may be drafted when requested; no implementation or upstream submission authorization is inferred from these notes.

## 6. Fractional nutrient recycling rate

**Deferred with #119 (2026-10-28):** Allow rates below one nutrient per second,
such as 0.5/s or 0.1/s, with correct deterministic accumulation over simulation
time. The current UI uses integer steps; #119 retains that behavior and uses
1/s for Harsh World. No slider-step or recycling-rule change is authorized here.

## 7. Named custom environmental scenarios

**Deferred with #119 (2026-10-28):** Save user-configured environmental conditions
under a memorable name for later new simulations. This consolidates the existing
roadmap's named environment profiles idea; no separate implementation issue is
requested now. Define storage, versioning, snapshot independence and founder
independence in a future decision. The first selector has only Default / Harsh World.

## Reuse protocol


When a new requirement touches one of the indexed topics, re-read the relevant note, mention the potential connection to Hernan, and ask whether the idea should be considered. The file is a contributor discussion journal, not a parallel upstream roadmap or automatically authorized task list.
