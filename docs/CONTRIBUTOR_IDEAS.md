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

> **Exploratory design notes, 2026-10-28.** These are not approved implementation requirements, not upstream submissions, and not authorization to change VIDA's simulation. Hernan will explicitly decide when the concept is sufficiently refined to prepare a Work execution prompt.

### Visual window geometry — phase 1 candidate

- Both physical left and right edges are partitioned vertically into identical **sections/windows**, indexed upward from the floor as `L0, L1, ...` and `R0, R1, ...`. The fixed reference/minimum window height is **300 world units**, independent of current or future default aquarium height. The present 1500-unit default yields five windows as a consequence, not as a hardcoded count.
- Growing or **shrinking** the simulated world height `H` follows the same discrete rule in both directions: `N(H) = max(1, floor(H / 300))`, `sectionHeight = H / N(H)` for positive H. Sections expand evenly between integer-count thresholds; crossing a threshold adds/removes a section and redistributes all boundaries. When `H < 300`, there is exactly one section (index 0) per side and its height can be below 300: the sole exception to the 300-unit minimum. Do not change existing UI world-height limits just to expose this mathematical edge case.
- **Corrected marker placement:** A small, conspicuous **yellow circle is centered exactly on each INTERNAL boundary between adjacent windows**, just outside the left/right wall. Its *center*, not the circle's entire area, aligns with the height where sections change. It is **not** located at a window's center. The tank floor and top already visibly define the outer boundaries, so markers at those two extremes are unnecessary unless later requested.
- Therefore, `N` windows ordinarily have **`N - 1` circles per edge**: five windows have four circles; one window has zero internal circles. Internal boundary heights measured from the floor are `y_i = i * H / N` for `i = 1 ... N - 1`. Separate section labels/icons can be placed within or beside their corresponding window without relocating the boundary circles.
- Recompute from authoritative simulated world dimensions, never browser viewport size or camera zoom. The visual markings must remain outside the organisms' sensing and physical world (no perceived colors, collisions, forces, or ecology changes).
- Phase 1 covers the visual geometry test **and an interactive observer-only prototype of connection/window-state icons** (as subsequently requested), including mock click transitions and mock suspended agreements. No wall is opened, no actual traversal is possible, no real connection is established, and no network state is exchanged.

### Planned feature sequence (not authorized for implementation yet)

1. **Window geometry and icon mockup:** Show and verify dynamic left/right subdivisions using the fixed 300-unit reference, indexing, internal-boundary yellow circles, and a clickable demonstration of per-side and per-window connection states. The mockup remains observer-only and network-free.
2. **User/caller name:** Provide a minimal interface to choose a local display name, without adding user accounts, remote connectivity, or implied authentication. Storage/persistence policy remains to be designed.
3. **Self-connection:** From one side of a single aquarium, initiate a conceptual call; from the other side, discover/answer it to establish a local left-to-right connection. The same user display name appears on both ends. Subsequent per-window opening negotiation and any actual travel still require explicit bounded decisions. This phase can validate basic connection state before cross-user networking.
4. **Cross-user connection (later):** Connect different users/aquariums. Each **side independently chooses its peer**: the left side may connect to one user while the right connects to another. Do not impose a single peer for the whole aquarium. The same two users may connect both complementary sides to form a two-aquarium lateral loop analogous to a cylinder. More generally allow a ring of `N` aquariums/users rather than hardcode two peers; precise connection endpoints must determine the topology. Cross-user communications and any server are deferred.

These are proposed successive stages, not simultaneous changes. Display-name entry does not by itself establish side connections.

### Observer-only icon language to refine before connection features

- **Per-side call status** (visually below section 0): use a hung-up/disconnected phone when no peer is connected, and an answered/connected phone plus the **peer display name** when connected. Each side has its own independent status. For self-connections, both sides show the same local user's name.
- **Per-window offers:** after a side-to-side call is established, offer a particular available window to the corresponding window on the connected edge. If the counterpart has no window with that number, show a prohibited/unavailable indicator; it must not be offered or opened.
- **Exact candidate emoji supplied by Hernan:** `🫱` (U+1FAF1 RIGHTWARDS HAND), `🫲` (U+1FAF2 LEFTWARDS HAND) for offered/receiving extended hands; `🫸` (U+1FAF8 RIGHTWARDS PUSHING HAND), `🫷` (U+1FAF7 LEFTWARDS PUSHING HAND) for refusal/rejection. Mirror orientation in the UI according to whether the endpoint is on the left or right side and whether the offer is outgoing or incoming. Accepted offers use a handshake/linked hands icon (candidate `🤝`); unavailable counterpart can use `🚫` or another prohibition mark. Precise icon-state mapping and interaction remain to be chosen during refinement.
- Emoji glyph rendering may be unsupported in some fonts/platforms (displaying empty boxes). Record their Unicode identities and ensure an accessible, reliable fallback, e.g., bundled vector icons/SVGs, before implementation; do not silently replace their semantics with unrelated icons.
- Distinguish **side connected**, **window available**, **outgoing offer**, **incoming offer**, **accepted**, **rejected**, **unavailable/suspended**, and **actually traversable**. Acceptance of a call does not automatically open every window; a negotiated handshake does not automatically mean physically traversable until that separate behavior is implemented.
- **Suspended previously accepted window (agreed 2026-10-28):** consider a distinct **lost-signal / signal-unavailable** icon to indicate that an accepted agreement still exists but the corresponding window is temporarily absent because its aquarium became too short. This must not be mistaken for an overall phone disconnection, a rejected offer, or cancellation. Include an accessible tooltip/label such as `Window unavailable — agreement retained` and restore the accepted state when window indices become available again, subject to connection validity. A **nonpersisted visual mock state is included in phase 1**; actual persistent agreements and the final icon remain future work.

### Persisted agreement when a window disappears

- **User decision:** If a tank shrinks and loses an already accepted window index, the active opening becomes unavailable/suspended but the **underlying accepted agreement is retained**. If the corresponding window becomes available again, it can be restored without requesting the same consent again, provided the side connection and the relevant agreement remain valid.
- To end an agreement, the user must deliberately **cancel** it. Mere height reduction is not cancellation. Future design must still define exact reconnection/recovery behavior after a side connection itself is lost.
- Closed/suspended windows must never allow traversal. No implementation of persistent consent state is authorized in phase 1.

### Future portal transit visual and rearm concept — recorded 2026-10-28

**Status:** A future-stage design idea, **not** an implementation request, phase-1 extension, or change to existing physics. The established phase numbers remain phase 1 = windows and interactive icon mockup; phase 2 = local caller name; phase 3 = actual self-connection signaling; phase 4 = cross-user links. Organism passage/traversal is **not phase 3** and has not received a fixed phase number (possibly a later phase 5 or separate increment, to decide).

**Desired experience:**

- An accepted and eventually open lateral window becomes a short **channel** or transition corridor rather than an instantaneous, visible jump at the aquarium wall. A creature that physically moves toward the channel gradually **fades into darkness / transparency**, as though disappearing into the distance.
- Distinguish two nested concepts: a **transport/rearm buffer** that determines the real crossing gate, and a **larger visual fade-in/fade-out zone** encompassing that gate. The creature should reach **full visual transparency before the actual transfer** so its deletion from the source world is imperceptible.
- Transfer the organism to the corresponding **receiving channel**, at the position/orientation on the far side of the receiving transport buffer chosen to prevent immediate reverse triggering. It begins visually fully transparent, then becomes progressively more opaque as it moves *outward from the destination transfer gate into the destination aquarium*. The fade direction is symmetric in reverse. The transition should feel smooth and continuous even though the simulation authority changes location/world.
- **Anti-oscillation / hysteresis requirement:** mere presence near the arrival coordinate must not trigger immediate travel back. To reverse direction, the creature must physically retrace the entire designated receiving buffer and cross its threshold from the proper direction, with a robust directional/rearm condition; design the exact gate geometry later. Do not solve this by granting artificial forward thrust or preventing a legitimate reverse traversal forever.
- Once beyond the receiving channel, moving farther into the new aquarium is simply normal movement in the destination environment, whether the destination is another user's tank or the opposite side of the same tank.
- The fade is **observer-only**: it must not change the body's real physical properties, perception, sensory information, energy, collision behavior or neural inputs. Crucially, before actual transfer, the organism must **not see or sense through the portal into the destination aquarium**. Its sensory context changes only when the authoritative world transition occurs, consistent with normal receiving-world sensing.
- When every lateral window is open, the aquarium's visual edges should appear effectively **borderless / diffuse**, with organisms fading into the hazy edges and returning on the connected side without abrupt pop-in. With selectively open windows, the effect applies only to each actual channel, not closed wall segments.
- The user describes the aesthetic as an organism disappearing into the **hondananza** (a distant, dim vanishing zone), rather than a conspicuous teleport flash. No decorative portal animation that changes creature behavior is requested.

**Unresolved design and safety work before implementation:** Determine the exact spatial widths of both the transport buffer and the larger fade envelope; transform/articulate the **entire organism**, including parts and joints, without impossible straddling or intersecting solid walls; address long bodies, moving contacts, direction and momentum continuity, boundaries, simultaneous/world-tick timing, capacity, energy conservation, source/destination worker authority and snapshots/legacy save determinism. Clarify whether separate worlds can maintain a coherent transfer without violating VIDA's existing ban on artificial teleportation/scripted locomotion; explicit owner authorization is needed for any physical world-transition rule. The fade must not hide a nonconservative simulation step or erroneous duplicate/lost organism.

**Design-only checkpoint:** Preserve this entire intended visual/physical *feel* for future discussion. Do not start a teleport mechanism or graphical fade implementation as a side effect of the earlier phase-1 prompts.

### Deferred physics, security and world-transfer architecture

- Selective openings may eventually permit actual traversal between windows of one aquarium or different aquariums, including sparse top-only/bottom-only connections. Access should arise from organisms' own physical locomotion and ecology, not scripted propulsion.
- Work out the complete articulated body crossing and boundary collision behavior, body/window size limits, joint state, velocities, forces, partially crossed bodies, destination occupancy, timing, energy conservation, authoritative Worker ownership, determinism, snapshots and historical saves. A deadband/rearm condition must prevent immediate oscillating back-transfers at a portal.
- Current VIDA principles disallow artificial teleportation/scripted locomotion. Implementing portal transport would require an explicit owner-approved physical-topology/transfer model or exception, not a covert workaround.
- For multi-user transfer, a possible mediator/server would route only between approved endpoints, enforce strict typed and versioned organism-only data, validate origin/destination and quotas, reject arbitrary executable content/unknown fields, and use acknowledged idempotent handoffs to avoid duplication, loss and replay. Genetics alone are not enough to serialize a live organism's changing state. No server is needed merely to preview markers or provide a name, and a local self-link may not require a network service.
- Do not change physics, sensing, genetics, reproduction, energy, save semantics, or topology during the window-visualization stage. Avoid mixing these deferred plans into an upstream PR for markers.

**Scope decision (2026-10-28):** Hernan authorized drafting a Work implementation prompt **for phase 1 only**, then supplied (a) a fixed 300-world-unit minimum-window-height correction with the under-300 single-window exception, and (b) a separate prompt extending phase 1 to interactive **mock** window and phone iconography, without actual links or persistence. Phase 1 development/integration is directed to the fork **testing** branch, preserving the testing overlay and leaving fork **main** free; never merge testing wholesale into main. These prompts do **not** authorize phase 2 caller-name functionality, phase 3 actual self-connection, phase 4 cross-user networking, real window agreements, physical portals, or organism travel. Future promotion to fork main and any upstream submission require their own explicit authorizations in accordance with contributor rules.

## Reuse protocol

When a new requirement touches one of the indexed topics, re-read the relevant note, mention the potential connection to Hernan, and ask whether the idea should be considered. The file is a contributor discussion journal, not a parallel upstream roadmap or automatically authorized task list.
