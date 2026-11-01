# VIDA 2D — Hernan's Idea Lab

> **Contributor-only planning board — 2026-10-29.** This board belongs to the `hernansgarro/vidAI` fork. These cards are exploratory, **not upstream issues, accepted upstream scope, or authorizations to implement**. It is intentionally separate from [Fede's canonical VIDA project](https://github.com/users/smeagol44/projects/1/views/1) and the [shared issue / decision index #57](https://github.com/smeagol44/vidAI/issues/57). The original [design journal](CONTRIBUTOR_IDEAS.md) remains the detailed source for previously recorded ideas. Neither document should be included in an upstream submission branch without separate approval.
>
> **Board implementation:** Repository-hosted Markdown with linked cards. This is a navigable **static Kanban view**, not a GitHub Projects v2 board; moving cards means editing this document. No fork issues were created to duplicate the upstream backlog.

## Board

| Ideas | Exploring | Ready for Work | Testing in fork | Ready to share | Deferred |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [IDEA-002 · Genetic egg-laying choice](#idea-002-genetic-egg-laying-choice) | [IDEA-003 · Parental reserve risk](#idea-003-parental-reserve-risk) | [IDEA-001 · Pipe World](#idea-001-pipe-world) | — | — | [IDEA-010 · Remote aquariums](#idea-010-remote-aquariums) |
| [IDEA-006 · Funded egg buoyancy](#idea-006-funded-egg-buoyancy) | [IDEA-004 · Parent-funded incubation](#idea-004-parent-funded-incubation) | — | — | — | [IDEA-011 · Portable organism state](#idea-011-portable-organism-state) |
| — | [IDEA-005 · Passive egg reserve uptake](#idea-005-passive-egg-reserve-uptake) | — | — | — | [IDEA-012 · Persistent window agreements](#idea-012-persistent-window-agreements) |
| — | [IDEA-007 · Hatching energy blockers](#idea-007-hatching-energy-blockers) | — | — | — | — |
| — | [IDEA-008 · Fractional recycling rates](#idea-008-fractional-recycling-rates) | — | — | — | — |
| — | [IDEA-009 · Named scenario profiles](#idea-009-named-scenario-profiles) | — | — | — | — |

**State rules:** *Ideas* = captured but not fully specified; *Exploring* = questions or design trade-offs remain; *Ready for Work* = sufficiently defined for an implementation request, but **not authorization to start**; *Testing in fork* = implemented only in the contributor fork and pending validation; *Ready to share* = contributor-approved for a possible, separately authorized upstream proposal; *Deferred* = intentionally postponed. These are **personal idea-maturity states**, not the official VIDA Project statuses.

## Cards

### IDEA-001: Pipe World

- **State:** Ready for Work (prompt / implementation still pending).
- **Intent:** Add a third world to the simulation startup scenario selector, tailored to studying local lateral windows, tubes and their connections.
- **Size:** Width **4600** and height **2100** world units.
- **Initial settings:** Use the current *Harsh World* preset as a **one-time source of values**, including its initial environment, organisms, food and other startup conditions, then override width and height. Pipe World owns its own **independent explicit preset**: never extend, spread, import or dynamically derive its settings from the Harsh World preset. Shared engine constants are fine. Future changes to either preset do not implicitly change the other.
- **Initial topology:** Normal unconnected world; **no preconfigured calls, connections, openings or tubes**. Users connect windows themselves. This does **not** mean an empty ecosystem.
- **Presentation:** Label `Pipe World` in the existing pre-start dropdown; use an original green angled pipe / plumbing icon with a retro video-game feel. Avoid copying proprietary character or game artwork.
- **Acceptance for a future Work task:** Keep Default and Harsh behavior intact; verify independent preset values and scenario selection; verify 4600 × 2100 dimensions and ordinary, unconnected initial state. Do not modify simulation/physics or other scenario rules beyond the new preset. Follow fork-first PR/validation; upstream submission only by separate explicit approval.
- **Decision record:** Confirmed by Hernan on 2026-10-29. This is a proposed implementation requirement, not an implemented feature.
- **Related:** [Initial scenario selector #119](https://github.com/smeagol44/vidAI/issues/119); [local tube implementation #122](https://github.com/smeagol44/vidAI/issues/122).

### IDEA-002: Genetic egg-laying choice

- **State:** Ideas.
- **Intent:** Make the decision *when* to lay an egg subject to inherited and mutable behavior, rather than applying an identical automatic eligibility trigger to all creatures.
- **Open decisions:** Energy signal, heritable trait versus neural policy, mutation bounds, interplay with clutch size / maturity / cooldown, historical saves and physical ecological selection.
- **Guardrails:** Do not confuse existing `eggReserveFraction` (allocation) with the egg-laying decision. No hidden fitness scores, survival guarantees or changes without a scoped simulation review.
- **Source:** [Design journal — section 1](CONTRIBUTOR_IDEAS.md#1-genetically-controlled-decision-to-lay-eggs).

### IDEA-003: Parental reserve risk

- **State:** Exploring.
- **Intent:** Allow heritable risk-taking in how much energy the parent retains after funding offspring, including low-retention/high-reproduction and high-retention/cautious strategies.
- **Open decisions:** Safe bounds; relation to current fixed parent reserve floor; body and clutch costs; conservation, inheritance and historical-save compatibility.
- **Source:** [Design journal — section 2](CONTRIBUTOR_IDEAS.md#2-heritable-parent-reserve-sacrifice).

### IDEA-004: Parent-funded incubation

- **State:** Exploring.
- **Intent:** Have the parent prepay offspring structure, intended usable reserve and any explicitly defined incubation energy at egg laying. Scarce parental energy should constrain affordable reproduction.
- **Open decisions:** Exact accounting for structure/reserve/incubation, egg affordability, conservation and migration, ecological consequences.
- **Guardrails:** Not approved to change existing incubation / egg display mechanics. Related but not identical to IDEA-005.
- **Source:** [Design journal — section 3](CONTRIBUTOR_IDEAS.md#3-all-egg-development-energy-should-originate-with-the-parent).

### IDEA-005: Passive egg reserve uptake

- **State:** Exploring.
- **Intent:** Reconsider the current `fundIncubatingEggs` mechanism that may transfer energy from the shared world reserve to incubating eggs. Explore whether to remove this passive funding and rely solely on parent-funded eggs.
- **Open decisions:** Interaction with IDEA-004, incubation and hatching requirements, conservation, legacy-save continuation and ecology validation.
- **Guardrails:** This is a question about existing behavior, **not** a proposal to introduce egg energy regeneration.
- **Source:** [Design journal — section 3a](CONTRIBUTOR_IDEAS.md#3a-review-passive-egg-energy-recovery-from-the-shared-world-reserve).

### IDEA-006: Funded egg buoyancy

- **State:** Ideas.
- **Intent:** Investigate inherited, physically grounded egg buoyancy opposing gravity, potentially creating dispersal trade-offs.
- **Open decisions:** Physical mechanism, energy funding, mutable bounds and ecological selection. Do not invent propulsion.
- **Source:** [Design journal — section 4](CONTRIBUTOR_IDEAS.md#4-genetically-influenced-egg-buoyancy).

### IDEA-007: Hatching energy blockers

- **State:** Exploring.
- **Intent:** Reassess the extra energy-target restriction which may prevent an otherwise fully incubated egg from hatching.
- **Already accepted constraints:** Retain population slots reserved at laying, physical clearance and world-energy debt constraints unless separately revised; preserve save compatibility.
- **Open decisions:** Define alternative rules and test conservation and ecology; distinguish actual blockers before changing any code.
- **Source:** [Design journal — section 5](CONTRIBUTOR_IDEAS.md#5-hatching-restrictions-and-occupied-space).

### IDEA-008: Fractional recycling rates

- **State:** Exploring.
- **Intent:** Allow nutrient generation/recycling rates below 1 unit per simulated second (for example 0.5/s or 0.1/s) with deterministic accumulation.
- **Open decisions:** Input representation, rounding and exact simulation-tick accumulator, save/load determinism and UI step sizes.
- **Guardrails:** The accepted Default / Harsh selector in [#119](https://github.com/smeagol44/vidAI/issues/119) did not authorize this change.
- **Source:** [Design journal — section 6](CONTRIBUTOR_IDEAS.md#6-fractional-nutrient-recycling-rate).

### IDEA-009: Named scenario profiles

- **State:** Exploring.
- **Intent:** Save user-customized environmental settings as named, reusable starting profiles.
- **Open decisions:** Storage/versioning, compatibility, snapshot independence and separation from starting genetic populations.
- **Distinction:** Unlike the built-in, fixed and independent Pipe World preset (IDEA-001), this would introduce user-defined reusable presets.
- **Source:** [Design journal — section 7](CONTRIBUTOR_IDEAS.md#7-named-custom-environmental-scenarios); [initial selector #119](https://github.com/smeagol44/vidAI/issues/119).

### IDEA-010: Remote aquariums

- **State:** Deferred — **stage 4 explicitly postponed**.
- **Intent:** Eventually connect different users' aquariums with opt-in peer discovery, permissions and authentic transit, extending the local/self-connected windows already implemented in the fork.
- **Open decisions:** Identity, communication, authority, synchronization, latency/disconnects, security and cross-world conservation/ecology.
- **Guardrails:** Do not conflate local stage-3 transfers with remote interoperability. No servers, accounts, peer directory or remote transport authorized.
- **Source:** [Design journal — section 8](CONTRIBUTOR_IDEAS.md#8-selective-lateral-portals-and-multi-aquarium-travel); [local stage #121](https://github.com/smeagol44/vidAI/issues/121), [#122](https://github.com/smeagol44/vidAI/issues/122).

### IDEA-011: Portable organism state

- **State:** Deferred — separate proposal needed.
- **Intent:** Explore exporting and importing the complete authoritative state of *one living creature*, distinct from whole-world saves and the already implemented in-memory local tube transfer.
- **Open decisions:** Identity collision policy, exact state/brain/learning/body serialization, format versioning, energy accounting and migration/security limits.
- **Guardrails:** Do not silently implement file export/import or remote transport under local stage-3 scope.
- **Source:** [Design journal — portable full-state files](CONTRIBUTOR_IDEAS.md#portable-full-state-organism-files-and-identity-decisions).

### IDEA-012: Persistent window agreements

- **State:** Deferred — future state-model review.
- **Intent:** Preserve accepted peer/window agreements when resizing temporarily removes a window, and define restoration/cancellation after it becomes valid again.
- **Open decisions:** Persisted agreement schema, explicit cancellation, peer disconnect/reconnect behavior and save compatibility.
- **Guardrails:** Do not mistake temporary visual/mock agreement states from earlier tube stages for general persisted remote agreements.
- **Source:** [Design journal — persisted agreement](CONTRIBUTOR_IDEAS.md#persisted-agreement-when-a-window-disappears).

## Previously addressed ideas — references, not duplicate cards

- [Observer-only egg reserve indicator #116](https://github.com/smeagol44/vidAI/issues/116): tracked in the shared issue and its fork delivery history; do not reopen merely because the older journal contains a pending-design description.
- [Local window/tube stages #121](https://github.com/smeagol44/vidAI/issues/121) and [#122](https://github.com/smeagol44/vidAI/issues/122): implementation and promotion evidence are tracked there. Only unimplemented, distinctly scoped follow-ups appear above.
- Other upstream issues and PRs remain authoritative for their own implementation, testing, review and acceptance stages.

## Working agreement

1. Capture a personal idea here first, with a stable `IDEA-NNN` identifier and a link to expanded notes. Merge or split idea cards only when they represent different decisions; do not clone the upstream issue backlog.
2. Advance maturity **only after the corresponding discussion/approval**. In particular, *Ready for Work* does not allow implementation without an explicit request, and *Ready to share* does not permit an upstream PR.
3. For any actual implementation, use the [contributor workflow](CONTRIBUTOR_WORKFLOW.md) and the shared canonical upstream issue. Do not create duplicate fork implementation issues.
4. When an idea becomes an upstream proposal or is implemented, link the canonical issue/PR and update its personal card; do not mark an upstream issue Done based solely on a fork merge.
5. Keep this board and the original journal **fork-only** in clean upstream submissions. The source journal contains historical decisions and may need verification before it is treated as current runtime documentation.
