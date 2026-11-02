# VIDA 2D — Hernan's Idea Lab

> **Contributor-only planning board — 2026-10-29.** This board belongs to the `hernansgarro/vidAI` fork. These cards are exploratory, **not upstream issues, accepted upstream scope, or authorizations to implement**. It is intentionally separate from [Fede's canonical VIDA project](https://github.com/users/smeagol44/projects/1/views/1) and the [shared issue / decision index #57](https://github.com/smeagol44/vidAI/issues/57). The original [design journal](CONTRIBUTOR_IDEAS.md) remains the detailed source for previously recorded ideas. Neither document should be included in an upstream submission branch without separate approval.
>
> **Board implementation:** Repository-hosted Markdown with linked cards. This is a navigable **static Kanban view**, not a GitHub Projects v2 board; moving cards means editing this document. No fork issues were created to duplicate the upstream backlog.

## Board

| Ideas | Exploring | Ready for Work | Testing in fork | Ready to share | Deferred |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [IDEA-002 · Genetic egg-laying choice](#idea-002-genetic-egg-laying-choice) | [IDEA-003 · Parental reserve risk](#idea-003-parental-reserve-risk) | [IDEA-013 · Egg overlays behind creatures](#idea-013-egg-overlays-behind-creatures) | — | — | [IDEA-010 · Remote aquariums](#idea-010-remote-aquariums) |
| [IDEA-006 · Funded egg buoyancy](#idea-006-funded-egg-buoyancy) | [IDEA-004 · Parent-funded incubation](#idea-004-parent-funded-incubation) | [IDEA-017 · Opaque inactive side walls](#idea-017-opaque-inactive-side-walls) | — | — | [IDEA-011 · Portable organism state](#idea-011-portable-organism-state) |
| — | [IDEA-005 · Passive egg reserve uptake](#idea-005-passive-egg-reserve-uptake) | [IDEA-018 · Advanced boolean controls](#idea-018-advanced-boolean-controls) | — | — | — |
| — | [IDEA-007 · Hatching energy blockers](#idea-007-hatching-energy-blockers) | — | — | — | — |
| — | [IDEA-008 · Nutrient appearance below 1/s](#idea-008-nutrient-appearance-frequencies-below-one-per-second) | — | — | — | — |
| — | [IDEA-009 · Named scenario profiles](#idea-009-named-scenario-profiles) | — | — | — | — |
| — | [IDEA-014 · Mouth annotation layering](#idea-014-mouth-annotation-layering) | — | — | — | — |
| — | [IDEA-015 · Streamlined phone dialogs](#idea-015-streamlined-phone-dialogs) | — | — | — | — |
| — | [IDEA-016 · Compact observer interface](#idea-016-compact-observer-interface) | — | — | — | — |
| — | [IDEA-019 · Notebook Size scenario](#idea-019-notebook-size-scenario) | — | — | — | — |
| — | [IDEA-020 · Celphone Size scenario](#idea-020-celphone-size-scenario) | — | — | — | — |

**Completed work is not an active column.** [IDEA-001 — Pipe World](CONTRIBUTOR_COMPLETED.md) was delivered to fork main via [PR #53](https://github.com/hernansgarro/vidAI/pull/53). [IDEA-012 — Retained window agreements during resizing](CONTRIBUTOR_COMPLETED.md) was already implemented with local side-window/tube stages 1–3, as verified against code and automated tests on 2026-11-02. Both are recorded in the [completed-work register](CONTRIBUTOR_COMPLETED.md). Their implementation in the fork does not authorize an upstream PR.

**State rules:** *Ideas* = captured but not fully specified; *Exploring* = questions or design trade-offs remain; *Ready for Work* = sufficiently defined for an implementation request, but **not authorization to start**; *Testing in fork* = implemented only in the contributor fork and pending validation; *Ready to share* = contributor-approved for a possible, separately authorized upstream proposal; *Deferred* = intentionally postponed. These are **personal idea-maturity states**, not the official VIDA Project statuses.

## Personal priorities (2026-11-02)

Priority is independent from maturity, implementation approval, and upstream project status.

| Idea | Hernan's priority |
| --- | --- |
| IDEA-002 — Genetic egg-laying choice | Medium |
| IDEA-003 — Parental reserve risk | Medium |
| IDEA-004 — Parent-funded incubation | Medium |
| IDEA-005 — Passive egg reserve uptake | Medium |
| IDEA-006 — Funded egg buoyancy | High |
| IDEA-007 — Hatching energy blockers | Medium |
| IDEA-008 — Nutrient appearance frequencies below one per second | **High** |
| IDEA-009 — Named scenario profiles | Low |
| IDEA-010 — Remote aquariums | Low; remains deferred |
| IDEA-011 — Portable organism state | High; remains deferred pending design |


**Egg-energy design prerequisite:** Before proposing changes to parental
funding, incubation, shared-reserve egg uptake, or egg hatching-energy rules,
Hernan wants to discuss the rationale for current behavior with Fede and
jointly evaluate any alternatives. This particularly concerns IDEA-003,
IDEA-004, IDEA-005, and IDEA-007, plus relevant energy decisions in IDEA-002
and IDEA-006. Current behavior is not presumed defective. No implementation
or upstream contact is authorized by this note.

**IDEA-012 has been moved out of this active priority table:** Hernan rated it High on 2026-11-02, and a code/test review confirmed its *local* behavior was already delivered in Stage 3. See [completed work](CONTRIBUTOR_COMPLETED.md). Remote multi-aquarium agreement semantics belong to deferred IDEA-010, not a reopened duplicate.

The priorities of IDEA-013–IDEA-020 have not yet been assigned by Hernan.

## Cards

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

### IDEA-008: Nutrient appearance frequencies below one per second

- **State:** Exploring; **personal priority: High**, confirmed by Hernan on 2026-11-02. High priority is not implementation authorization.
- **Intent:** Configure the *frequency with which new funded nutrient particles appear* below one particle per simulated second, including examples **0.5/s** (one every two seconds on average) and **0.1/s** (one every ten seconds on average). This is the existing nutrient recycling/inflow rate expressed in more memorable terms, **not** a new free source of energy or a change to each particle's decay rate.
- **Open decisions:** Accepted fractional input representation, UI precision/step, exact accumulator rounding and deterministic simulation tick behavior, save/load compatibility and preserving legacy snapshot timing.
- **Guardrails:** Keep the energy ledger and existing nutrient-count limits. The accepted Default / Harsh selector in [#119](https://github.com/smeagol44/vidAI/issues/119) did not authorize this change.
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
- **Open decisions:** Identity, communication, authority, synchronization, latency/disconnects, security, persistent agreements **between separate remote aquariums**, and cross-world conservation/ecology. The already working local resize/suspension/restoration behavior from IDEA-012 must not be reimplemented.
- **Guardrails:** Do not conflate local stage-3 transfers with remote interoperability. No servers, accounts, peer directory or remote transport authorized.
- **Source:** [Design journal — section 8](CONTRIBUTOR_IDEAS.md#8-selective-lateral-portals-and-multi-aquarium-travel); [local stage #121](https://github.com/smeagol44/vidAI/issues/121), [#122](https://github.com/smeagol44/vidAI/issues/122).

### IDEA-011: Portable organism state

- **State:** Deferred — separate proposal needed.
- **Intent:** Explore exporting and importing the complete authoritative state of *one living creature*, distinct from whole-world saves and the already implemented in-memory local tube transfer.
- **Open decisions:** Identity collision policy, exact state/brain/learning/body serialization, format versioning, energy accounting and migration/security limits.
- **Guardrails:** Do not silently implement file export/import or remote transport under local stage-3 scope.
- **Source:** [Design journal — portable full-state files](CONTRIBUTOR_IDEAS.md#portable-full-state-organism-files-and-identity-decisions).

### IDEA-013: Egg overlays behind creatures

- **State:** Ready for Work (not scheduled or authorized for implementation). Recorded 2026-11-02.
- **Intent:** Render the **egg incubation/progress ring and pink original-reserve-loss sector beneath creature bodies**, not in front of passing creatures. Their current ordering creates visually misleading overlays when creatures overlap eggs.
- **Guardrails:** Change **observer rendering/layer order only**. Keep egg reserve calculations, incubation, energy, sensing, contact, picking, Worker authority and saves unchanged. Preserve legibility when unobscured.
- **Acceptance to refine:** Inspect actual composite passes and test crossing/occlusion involving creatures, eggs and tubes. Do not bundle an unrelated mouth-layer decision into this correction.
- **Related:** [Implemented egg display #116](https://github.com/smeagol44/vidAI/issues/116); [completed register](CONTRIBUTOR_COMPLETED.md).

### IDEA-014: Mouth annotation layering

- **State:** Exploring; recorded 2026-11-02. **Separate from IDEA-013**.
- **Observation:** Mouth outlines/annotations also appear in front of creatures. This may be misleading, but no target ordering has been decided.
- **Next decision:** Compare mouth visibility, anatomical occlusion, selection/inspection and creature overlap before selecting a rendering layer. No mouth geometry, feeding mechanics or optical perception changes are authorized.

### IDEA-015: Streamlined phone dialogs and directory workflow

- **State:** Exploring; recorded 2026-11-02. Not yet an implementation authorization.
- **Intent:** Minimize explanatory text in local phone/calling dialogs. Users should learn routine nonblocking behavior through the interface; reserve genuinely useful explanations for optional tooltips where discoverable.
- **Requested text removals/replacements:**
  - Remove `Name stays in this page session. No account or online directory.` from visible dialog content.
  - Replace the current `Turn availability off` treatment with a meaningful **leave phone directory / disconnect** choice while in an active connection, subject to a precise state-machine review.
  - Shorten `Waiting for the other phone to accept. You can keep using the aquarium`; omit the nonblocking explanation and, if needed, place call-status detail on `Calling ... - opposite side` as a tooltip.
  - Remove `From the opposite side of this tank. Each window needs separate acceptance` as body copy; a short optional title tooltip may explain the opposite side if necessary.
  - **Disable name editing while a call/connection is active**; allow name changes after leaving the phone directory.
  - Remove `Connected to ... - same tank. Offer a number window, then accept at its opposite end.` from visible body copy; any essential connection identity can move to a disconnect tooltip.
- **Open decisions:** Distinguish publishing/availability in the directory, ending a call, disconnecting accepted window links and leaving the directory; preserve caller cancellation, indefinite unanswered invitations, per-window consent and nonmodal operation. Determine whether tooltip-only information is discoverable on touch devices.
- **Guardrails:** Local observer/UI workflow only, with explicit confirmation if connection semantics must change. No automatic peer access, server, account or Stage 4 transport.

### IDEA-016: Compact header/footer and observer mode

- **State:** Exploring; recorded 2026-11-02. This may be a **larger UI redesign**, not necessarily a trivial cleanup.
- **Intent:** Reduce persistent UI obstruction of the aquarium, eliminate wasted header/footer space, and retain accessible information/actions when requested.
- **Candidate behavior:** Optional author names when space permits, otherwise discoverable via VIDA title tooltip or Version/Info menu; compact responsive controls without prematurely hiding meaningful data. Add a top-right `−` control to collapse header and footer to the smallest practical footprint (possibly removing both bars), exposing a discreet or semitransparent `+` restore control. Preserve the existing side-control eye as an independent concept unless deliberately unified.
- **Observer-first motivation:** The user estimates roughly **80%** of use may be watching organisms rather than configuring the environment; this is a design assumption, **not a measured usage statistic**. Certain statistics remain useful to observation.
- **Open decisions:** Visibility of stats on mouse hover vs touch/mobile affordance, keyboard and screen-reader operation, control discoverability, overlay hit areas, safe insets and responsive transitions. No implementation or upstream bundling approved yet.

### IDEA-017: Opaque inactive side walls

- **State:** Ready for Work (not scheduled or authorized for implementation). Recorded 2026-11-02.
- **Intent:** Tank **left/right side walls should be opaque while no tube is active**, matching the visual treatment of closed top/bottom boundaries. Progressive fade should be reserved for physically active tubes/openings.
- **Guardrails:** Observer visual correction only; do not change physical walls, connection consent, transfer mechanics, tube optics used by organisms or simulation rules. Define the appearance of mixed active/closed sections before implementation.

### IDEA-018: Advanced boolean controls

- **State:** Ready for Work (not scheduled or authorized for implementation). Recorded 2026-11-02.
- **Intent:** Replace or restyle checkboxes in Advanced Settings to use the established **boolean/switch presentation from regular Settings** for better consistency.
- **Guardrails:** Keep the two independent automatic selection/tracking preference semantics, defaults, keyboard/touch accessibility and persistence unchanged. No simulation-facing setting changes.

### IDEA-019: Notebook Size scenario

- **State:** Exploring; recorded 2026-11-02.
- **Intent:** Add a fixed built-in startup preset tentatively called `Notebook size`, independent of other presets, with **the same general initial settings as current Harsh World** but notebook-oriented tank dimensions.
- **Open decision:** **Exact world-unit width and height are not defined yet.** Determine them before an implementation-ready request. Do not confuse physical viewport CSS dimensions with simulation-world dimensions; preserve independent explicit preset values, existing funded initialization and zero automatic tube links.
- **Related:** [Harsh selector #119](https://github.com/smeagol44/vidAI/issues/119), [completed Pipe World IDEA-001](CONTRIBUTOR_COMPLETED.md).

### IDEA-020: Celphone Size scenario

- **State:** Exploring; recorded 2026-11-02.
- **Intent:** Add a fixed built-in startup preset tentatively called `Celphone size` (final English UI spelling to confirm), independent of other presets, with **the same general initial settings as current Harsh World** but phone-oriented tank dimensions.
- **Open decision:** **Exact world-unit width and height are not defined yet**; consider aspect ratio, usability and available small-screen world rendering before implementation. No guessed dimensions, automatic tube links, or changes to simulation rules.
- **Related:** [Harsh selector #119](https://github.com/smeagol44/vidAI/issues/119), [completed Pipe World IDEA-001](CONTRIBUTOR_COMPLETED.md).

## Notes on potential promotion

- These eight new ideas are **not the currently urgent new request** and have no implementation authorization or deadlines. Their statuses concern maturity only.
- A future upstream proposal may be considered alongside Pipe World, as suggested by Hernan, **but combining unrelated visual/phone/scenario changes into a single PR is not automatically approved**. After fork-main validation and separate explicit approval, prepare a clean scoped submission and evaluate reviewability, dependency order and owner preference.
- The [completed-work register](CONTRIBUTOR_COMPLETED.md) is the place for completed work; keep it out of pending columns.

## Previously addressed ideas — references, not duplicate cards

- [Completed-work register](CONTRIBUTOR_COMPLETED.md) records Pipe World, egg display, local tubes and other verified fork/upstream deliveries.
- [Observer-only egg reserve indicator #116](https://github.com/smeagol44/vidAI/issues/116): tracked in the shared issue and its fork delivery history; do not reopen merely because the older journal contains a pending-design description.
- [Local window/tube stages #121](https://github.com/smeagol44/vidAI/issues/121) and [#122](https://github.com/smeagol44/vidAI/issues/122): implementation and promotion evidence are tracked there. Only unimplemented, distinctly scoped follow-ups appear above.
- Other upstream issues and PRs remain authoritative for their own implementation, testing, review and acceptance stages.

## Working agreement

1. Capture a personal idea here first, with a stable `IDEA-NNN` identifier and a link to expanded notes. Merge or split idea cards only when they represent different decisions; do not clone the upstream issue backlog.
2. Advance maturity **only after the corresponding discussion/approval**. In particular, *Ready for Work* does not allow implementation without an explicit request, and *Ready to share* does not permit an upstream PR.
3. For any actual implementation, use the [contributor workflow](CONTRIBUTOR_WORKFLOW.md) and the shared canonical upstream issue. Do not create duplicate fork implementation issues.
4. When an idea becomes an upstream proposal or is implemented, link the canonical issue/PR and update its personal card; do not mark an upstream issue Done based solely on a fork merge.
5. Keep this board and the original journal **fork-only** in clean upstream submissions. The source journal contains historical decisions and may need verification before it is treated as current runtime documentation.
