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
| Selective lateral portals / interconnected aquariums | side windows, linked tanks, cylindrical world, transfer protocol, rearm threshold, server validation | Future concept only; excluded from window-marker prototype |

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

## 8. Selective lateral portals and multi-aquarium travel

**Deferred idea (2026-10-28):** After a separate observer-only prototype verifies dynamically numbered lateral window markers, consider allowing selected left/right wall windows to act as traversable connections. Closed windows remain ordinary solid boundaries. A window may connect a left edge to a right edge of the **same** aquarium (a possible periodic/cylindrical lateral topology), or to a specific window in another aquarium. Connections could be sparse (for example only the top or bottom window), making access dependent on an organism's own physically achieved position and movement. This is **not** an implementation authorization or a request for an upstream issue.

**Window concept:** Each lateral edge has five vertically indexed windows at the default world height, bottom-up from zero, with left/right identifiers. When the actual simulated world height grows, window heights expand until another window of the baseline size can fit; at that threshold, the count increases and all windows are redistributed evenly. The initial visual prototype only tests this partitioning, with bright observer-only markers outside the sensing boundaries. The connection/portal behavior is outside that prototype's scope.

**Open geometry/physics decisions:** Define how the complete articulated body (not just its center) crosses an opening, what happens when its width/height exceeds a window, how joints, forces, velocities, collisions and contacts behave during transfer, and how a destination with different dimensions or occupied space is handled. Define whether body parts can straddle two worlds, or whether an atomic transfer is ever acceptable. A rearm/deadband or hysteresis condition must prevent immediate back-and-forth transfers across a portal; a chosen x-coordinate or cooldown alone should not create exploitable motion. Current VIDA rules explicitly prohibit artificial teleportation/scripted locomotion, so any future topology/transfer feature requires an explicit owner-approved exception or revised physical-boundary model. Do not bypass present movement, energy or conservation safeguards.

**Possible multi-world protocol (exploratory):** A mediator/server could route an organism only between explicitly linked windows and accept only a strict, versioned, size-bounded, validated organism-transfer schema rather than commands or arbitrary client data. Authenticate/authorize source and destination, reject unknown fields and executable content, and design idempotent handoff/acknowledgment to prevent duplication, loss or replay. The minimal payload is unresolved: genetic blueprint alone would not preserve live anatomy, age, health, reserve, neural/learning state, velocities and deterministic continuation. Determine authoritative Worker ownership, capacity, conservation ledgers, timing across separate ticks, compatibility with snapshots/legacy saves, disconnected recipients and cross-world identity before approving any actual transfer. A server is not necessarily required for a single-world periodic topology.

**Scope protection:** The present requirement remains an observer-only window partition and icon preview; do not open walls, create traversal logic, alter creature sensing, change physics, exchange organism state, create a service, or redefine world topology. Revisit these deferred questions only with a separately approved bounded design.

### 2026-10-28 refinement: bidirectional window-count resizing and connection icon language

- Partition both left and right walls identically, retaining bottom-up indices `L0, L1...` and `R0, R1...`. Baseline height `H0` gives five windows and baseline segment size `S0 = H0/5`. A candidate symmetrical discrete rule is `N(H) = max(1, floor(H/S0))`, `segmentHeight = H/N(H)`, including *downward* resizing and removal of windows. Confirm actual minimum world-height constraints during implementation. Under this rule, crossing a lower count boundary can make remaining segments larger, an intended reciprocal step behavior. Recompute by authoritative *world height* rather than viewport pixels; preserve fixed independent left/right labeling.
- **Marker correction:** One conspicuous yellow circle at the **center of each segment**, outside simulated tank boundaries, not at boundaries between segments. At baseline this is five circles per side (not six). Markers and labels are exclusively for human observers and must not enter organisms' vision, perception or physics.
- A visually separate **side-wide connection status** can eventually show a disconnected/hung-up phone or a connected/answered phone, below the bottom segment (`0`) on each side. Display the remote caller's name next to a connected phone; a self-link shows the local name for both ends. This is **only a visual mock state** for the early UI prototype, not a phone/network implementation.
- Exploratory **per-window negotiation**: after a mutually accepted left-to-right side connection (including possible self-links), show unavailable/forbidden when the destination lacks the corresponding window number (including if its world height shrinks). An available sender may offer an opening using a hand extended outward, mirrored appropriately for L-to-R versus R-to-L. The recipient sees an incoming hand and may accept (handshake / linked hands) or reject (refusal hand or forbidden symbol); a rejected/opening-not-possible window remains closed. All of these states must remain distinct from actual open, collision-free traversal. Icon choices and refusal behavior are not yet finalized.
- New concept: a minimal editable **caller display name** (local user nickname) for future connections. Define storage/privacy/uniqueness/authentication separately; a freely entered name is not an authenticated identity. Do not introduce a network service, user accounts or trust claims for the prototype.
- Important deferred behavior: decide whether disappearance of a destination window suspends an accepted opening, invalidates it permanently, or requires fresh consent when restored. Distinguish 'no side connection', 'window unavailable', 'pending offer in/out', 'declined', and 'mutually accepted' in a clear state machine. No negotiation messages or transfer semantics are authorized now.

**Current chat scope (design only):** Refine visual segmentation, center markers and an illustrative future-state icon legend/mockup. Do not create a Work execution prompt or implement anything until Hernan explicitly declares the concept sufficiently refined.

## Reuse protocol

When a new requirement touches one of the indexed topics, re-read the relevant note, mention the potential connection to Hernan, and ask whether the idea should be considered. The file is a contributor discussion journal, not a parallel upstream roadmap or automatically authorized task list.
