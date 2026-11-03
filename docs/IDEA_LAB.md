# VIDA 2D — Hernan's Idea Lab

> **Contributor-only planning board — 2026-10-29.** This board belongs to the `hernansgarro/vidAI` fork. These cards are exploratory, **not upstream issues, accepted upstream scope, or authorizations to implement**. It is intentionally separate from [Fede's canonical VIDA project](https://github.com/users/smeagol44/projects/1/views/1) and the [shared issue / decision index #57](https://github.com/smeagol44/vidAI/issues/57). The original [design journal](CONTRIBUTOR_IDEAS.md) remains the detailed source for previously recorded ideas. Neither document should be included in an upstream submission branch without separate approval.
>
> **Board implementation:** Repository-hosted Markdown with linked cards. This is a navigable **static Kanban view**, not a GitHub Projects v2 board; moving cards means editing this document. No fork issues were created to duplicate the upstream backlog.

## Highest-priority next investigation

**IDEA-023 — VIDA 2D performance and CPU-load audit** is the contributor's
**P0 / top priority**, explicitly **above every other outstanding personal idea
or task**. Requested on 2026-11-02 for a future **joint analysis with Hernan**.
Its [four-stage audit plan](PERFORMANCE_AUDIT_PLAN.md), [completed Stage 2 review](PERFORMANCE_AUDIT_STAGE_2.md), and [Hernan's within-audit priorities / Stage 3 measurement questions](PERFORMANCE_AUDIT_PRIORITIES.md) are recorded. **Stage 1 receipts were reconciled in Stage 3.1. Stage 3 is ONGOING: the original pilot and the bounded Stage 3.2 continuation are research only; no optimization is implemented. See the [cumulative executive report](PERFORMANCE_AUDIT_STAGE_3.md).** Its purpose is to identify,
measure and rank the factors driving unacceptable processor load, slowdowns and
reduced responsiveness. The observed slowdown when organism glow appears is a
leading **hypothesis to test**, not a proven diagnosis or a license to weaken
simulation semantics. See the [full IDEA-023 card](#idea-023-vida-2d-performance-and-cpu-load-audit).

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
| — | [IDEA-021 · Nutrient contact and ledge geometry](#idea-021-nutrient-contact-and-ledge-geometry) | — | — | — | — |
| — | [IDEA-022 · Nutrient-to-nutrient collisions](#idea-022-nutrient-to-nutrient-collisions) | — | — | — | — |
| — | [IDEA-023 · Performance & CPU audit (P0)](#idea-023-vida-2d-performance-and-cpu-load-audit) | — | — | — | — |
| — | [IDEA-024 · Preset initial zoom](#idea-024-world-preset-initial-zoom-and-framing) | — | — | — | — |
| — | [IDEA-025 · Heritable per-eye ray subsets](#idea-025-heritable-per-eye-ray-subsets) | — | — | — | — |
| — | [IDEA-026 · Inherited per-ray vision range](#idea-026-inherited-per-ray-vision-range) | — | — | — | — |

**Completed work is not an active column.** [IDEA-001 — Pipe World](CONTRIBUTOR_COMPLETED.md) was delivered to fork main via [PR #53](https://github.com/hernansgarro/vidAI/pull/53). [IDEA-012 — Retained window agreements during resizing](CONTRIBUTOR_COMPLETED.md) was already implemented with local side-window/tube stages 1–3, as verified against code and automated tests on 2026-11-02. Both are recorded in the [completed-work register](CONTRIBUTOR_COMPLETED.md). Their implementation in the fork does not authorize an upstream PR.

**State rules:** *Ideas* = captured but not fully specified; *Exploring* = questions or design trade-offs remain; *Ready for Work* = sufficiently defined for an implementation request, but **not authorization to start**; *Testing in fork* = implemented only in the contributor fork and pending validation; *Ready to share* = contributor-approved for a possible, separately authorized upstream proposal; *Deferred* = intentionally postponed. These are **personal idea-maturity states**, not the official VIDA Project statuses.

## Personal priorities (2026-11-02)

Priority is independent from maturity, implementation approval, and upstream project status.
**P0 outranks High, Medium-high, Medium and Low**, without overriding upstream
maintainer authority or authorizing work in another branch.

| Idea | Hernan's priority |
| --- | --- |
| **IDEA-023 — VIDA 2D performance and CPU-load audit** | **P0 — Absolute top priority; joint investigation queued** |
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
| IDEA-021 — Nutrient contact and ledge geometry | **Medium-high**; exploratory |
| IDEA-022 — Nutrient-to-nutrient collisions | **Medium-high**; exploratory, independently scoped |


**Egg-energy design prerequisite:** Before proposing changes to parental
funding, incubation, shared-reserve egg uptake, or egg hatching-energy rules,
Hernan wants to discuss the rationale for current behavior with Fede and
jointly evaluate any alternatives. This particularly concerns IDEA-003,
IDEA-004, IDEA-005, and IDEA-007, plus relevant energy decisions in IDEA-002
and IDEA-006. Current behavior is not presumed defective. No implementation
or upstream contact is authorized by this note.

**IDEA-012 has been moved out of this active priority table:** Hernan rated it High on 2026-11-02, and a code/test review confirmed its *local* behavior was already delivered in Stage 3. See [completed work](CONTRIBUTOR_COMPLETED.md). Remote multi-aquarium agreement semantics belong to deferred IDEA-010, not a reopened duplicate.

The priorities of IDEA-013–IDEA-020, IDEA-024 and IDEA-025/IDEA-026 have not yet been assigned by Hernan. The within-audit ranking of S2-03 does **not** assign a separate implementation priority to IDEA-025. IDEA-021 and IDEA-022 have separately assigned **Medium-high** priority.

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

### IDEA-021: Nutrient contact and ledge geometry

- **State:** Exploring; **personal priority: Medium-high**, recorded 2026-11-02. No implementation authorization.
- **Observation:** Small nutrients appear to hover above surfaces and some fail to fall off an active tube's roof/edge as expected.
- **Verified current mechanism (source inspection, not newly executed physics tests):** `simulation.ts` represents nutrients as radius-bearing circular particles and, outside tubes, clamps **their centers** at a fixed **35-world-unit** margin from each tank wall, regardless of actual radius. In connected worlds, `moveTubeParticle` and `projectWaterPoint` in `selfTubes.ts` constrain particle **centers** to a union of rectangular water regions with a fixed **35-unit margin**. Thus a small particle of physical radius 6 may have about 29 world units of clear space from a regular tank floor; tube-roof behavior is also affected by the center projection. `App.tsx` renders a physical circle with a larger glow/texture envelope.
- **Hypothesis to test:** The fixed center margins / rectangular water projections, rather than an existing square nutrient collider, explain the visual separation and some failure to roll/fall from tube ledges. Determine exact behavior at corners and tube mouths through focused deterministic trajectories before choosing geometry.
- **User-proposed alternative:** An **octagonal contact frame** oriented with one vertex on the downward vertical axis (a nutrient would nominally rest on its bottom point). This is a candidate to compare, **not a decision** to replace the current circle. Clarify whether the polygon would rotate, whether optics/feeding retain circular bounds, and whether geometry or appearance should change.
- **Review goals:** Contact relative to actual particle radius, stable resting distance, natural departure from tube roof/edges under gravity and water resistance, no sticking/teleportation, exact save continuity and no changes to organism physics or feeding. Use a separate versioned behavior if historical motion would otherwise change. Keep user-visible artwork separate from physical collision representation.
- **Related:** [Tube geometry](../selfTubes.ts), [nutrient motion](../simulation.ts), [physical particle radius](wiki/Ecology-Baseline.md), IDEA-022 (separate collision proposal).

### IDEA-022: Nutrient-to-nutrient collisions

- **State:** Exploring; **personal priority: Medium-high**, recorded 2026-11-02. Independently scoped and not authorized for implementation.
- **Intent:** Evaluate **physical collisions between nutrient particles**, potentially enabling piles, occlusion and local accumulation. Initial scope need not include nutrient-versus-creature body collisions; preserving easy feeding is an explicit motivation.
- **Current implementation (source review):** Nutrient particles independently integrate gravity and drag, then apply tank limits or tube water projection; there is no particle-to-particle collision resolution in the nutrient-motion pass. Organism feeding is modeled separately via mouth/radius contact.
- **Open decisions:** Circle versus polygon contact shape; contact response, restitution/friction/damping and whether particles should rotate; interaction of particles with tube edges; high particle counts/near-overlaps and bounded broadphase costs; collision ordering and deterministic continuation; coupled food acquisition, sight occlusion and ecological distribution effects.
- **Guardrails:** Do not apply arbitrary repulsive thrust or energy subsidies. Preserve food energy, identities, historical save and Worker authority; do not alter existing creature feeding or organism contact without separate approval. Design regression tests for contacts, stable piles, conservation and performance. IDEA-021 does not authorize IDEA-022 and vice versa.

### IDEA-023: VIDA 2D performance and CPU-load audit

- **State:** Exploring / **four-stage audit planned, Stage 2 static review completed in the fork, and owner-selected Stage 3 measurement/Stage 4 questions documented**; **personal priority: P0 (absolute highest)**, explicitly above all other outstanding tasks as of 2026-11-02. **Stage 3 is ONGOING.** Stage 3.1 is the preserved completed pilot; Stage 3.2 completed a bounded graphics batch: software-rendered caustic blur explains the dominant observed deferred raster cost. Desktop/active behavior remains open; no production optimization was implemented. See the [cumulative executive report](PERFORMANCE_AUDIT_STAGE_3.md). No permanent optimization or upstream submission is authorized. See the [auditable four-stage plan](PERFORMANCE_AUDIT_PLAN.md), [Stage 2 report](PERFORMANCE_AUDIT_STAGE_2.md) and [combined owner+technical priority record](PERFORMANCE_AUDIT_PRIORITIES.md).
- **User-reported problem:** VIDA currently feels too slow and processor-intensive; organism energy-activity glow appears to coincide with a substantial slowdown. The current CPU burden is **unacceptable to the user**. Do not minimize this as merely cosmetic.
- **Purpose:** Establish evidence of what consumes CPU, rendering time and main-thread responsiveness; separate actual simulation/Worker cost from Canvas/visualization, event bookkeeping, UI state/render work and garbage collection. Rank costly subsystems and identify simpler approaches that preserve acceptable observable behavior.
- **First hypothesis — glow:** Determine whether expensive **trigger detection / energy-receipt accounting or temporal/spatial resolution**, **drawing/compositing/blur/filters**, excessive repaint frequency, glow area/overdraw, or another correlated factor causes the measured degradation. The purpose of the glow is an **observer-only signal** that a creature is gaining energy or losing energy to another creature; human perception may not require maximal per-tick/per-part precision. Test before deciding whether event aggregation, temporal throttling, sampling, simplified geometry, lower-cost rendering or another technique is acceptable.
- **Broad audit:** Review actual simulation tick throughput, organism count/body parts/joints, neural evaluation and learning, contact/feeding, sensing/indexing, nutrient/egg updates, tube operations, render/Canvas passes, overlays, state copies/Worker messages, snapshots, React work and memory/GC as measured—not merely as guesses.
- **Suggested analysis protocol (to be scoped jointly before execution):** Agree on reproducible settings and reference hardware; establish baseline CPU load, FPS, effective simulation steps/s, main/Worker profiling, organism/nutrient counts and stability. Compare controlled scenes with glow present/absent and other overlays independently, keeping **simulation state, speed and seeds equivalent**. Collect per-subsystem timings or trace evidence, identify highest-impact candidates and estimate expected benefit versus loss of fidelity. Use existing approved performance tests/receipts, and register any additional experiments/budgets/controls **before** expensive runs.
- **Decision criteria:** Prioritize optimizations by **measured impact**, simplicity, retained energy-signal meaning and visual adequacy. Preserve authoritative deterministic ticks, energy/accounting semantics, physical feeding/locomotion/genetics/learning, historical saves, Worker/render separation and off-camera simulation. Never suppress actual simulated events or substitute fake behavioral cues merely to make performance numbers look better.
- **Non-goals:** No premature tuning of founders/brains/physics/diet, no artificial physics shortcuts without separate authorization, no skipped simulation ticks claimed as an optimization, no relaxed test gates or unexplained baseline resets. Do not choose an optimization solely from the observed glow correlation.
- **Next action:** Review the [completed Stage3.2 batch](experiments/performance-stage-3-v2/report.md), then select a separately authorized Stage3.3. Preserve recursive evidence/dashboard updates and the mandatory S2-02 physical-metadata study. Do not automatically optimize or close Stage 3.
- **Related:** [Contributor workflow status](CONTRIBUTOR_WORKFLOW_STATUS.md), [simulation performance reference](wiki/Simulation-Performance.md), [energy-activity overlays](wiki/Energy-Activity.md). No new upstream issue, test campaign or PR is requested at this capture stage.

### IDEA-024: World-preset initial zoom and framing

- **State:** Exploring; recorded 2026-11-02; personal priority **not yet assigned**. This is a separate outstanding idea, **not** an extension or implementation of IDEA-009, IDEA-019/020, or the current performance audit.
- **User intent:** World configuration should be able to specify a preferred **initial camera zoom / view framing** as part of the selected starting-world preset. For example, choosing `Harsh World` should initially use a more distant zoom so the observer can see more of the aquarium; a "farthest zoom" or fit-to-tank presentation is the motivating example, **not a fixed zoom number already chosen**.
- **Scope to explore:** Determine whether each built-in scenario (Default, Harsh, Pipe World, and possible future notebook/phone presets) defines an explicit initial scale or a viewport-dependent **fit-to-world** rule, and whether user-defined named profiles (IDEA-009) could later retain the same preference. World dimensions (simulation units) and camera/view scale (presentation) must remain distinct.
- **Open decisions:** Choose the exact zoom/framing for each scenario; whether the value is a numeric scale, a normalized level or a computed fit; how aspect ratio, safe UI areas, window resize and mobile displays affect whole-tank visibility; whether the camera center/position is also preset; when the initial zoom is applied (startup, world reset, scenario selection, or importing a save); and whether a later manual pan/zoom override persists.
- **Expected UX safeguard:** A preset should establish an **initial observation preference**, not permanently lock camera controls or silently reset the user's chosen zoom during ordinary interactions. Evaluate save/restore and backward compatibility separately before specifying implementation.
- **Architecture and audit boundary:** Camera framing is observer/UI state. Do not modify world-coordinate dimensions, physics, energy, genetics, Worker ticks, off-camera simulation or authoritative saved-world semantics simply to fit more of the aquarium on screen. Changes in framing can change visible object counts, paint area, viewport culling and observed FPS; keep zoom, pixel resolution/DPR and actual world density controlled during performance comparisons.
- **Related:** IDEA-009 (named scenarios), IDEA-019/020 (future notebook/phone worlds), [Pipe World completion](CONTRIBUTOR_COMPLETED.md), [current performance audit plan](PERFORMANCE_AUDIT_PLAN.md). No code change, tests, upstream issue or PR is authorized by idea capture.

### IDEA-025: Heritable per-eye ray subsets

- **State:** Exploring; **personal priority: not assigned**. Captured from Hernan's 2026-11-02 discussion of audit hypothesis S2-03. The priority of measuring current optical work during IDEA-023 **does not** authorize this separate genetic feature. No code, test experiment, upstream issue or PR is requested.
- **Concept:** An eye could inherit a choice of **which of the existing five angular ray positions** it actually emits; its corresponding neural inputs/network structure should reflect the active rays. Natural biological and computational costs might reward organisms that need fewer retinal channels, without any fitness shortcut or guaranteed ecological advantage.
- **Verified current baseline:** `simulation.ts` has fixed `RAYS_PER_EYE=5`; `getBrainLayout` gives each of those rays red/green/blue/distance channels; `eyeSensoryUpkeep` charges receptor-dependent upkeep for five rays. Existing spectral-sensitivity alleles are **not** a variable-ray implementation.
- **Open decisions:** Identity-preserving five-position bitmask versus a count; admissible combinations and whether zero rays are allowed; inheritance/mutation operators and energetic upkeep of active rays; maintaining stable ray IDs, ordered inputs and exact occlusion; remapping weights/disabled connections/learned synapse records; introduction for new genomes versus old saves (omitted allele should retain all five rays); determinism, PRNG and schema migration; evolutionary trade-offs, test fixtures, UI/inspection display, and source-of-selection evidence.
- **Study before implementation:** Measure current ray/index/brain/input cost in IDEA-023 Stage 3 **without changing the existing five rays**. Any actual variable-ray simulation requires a separately scoped design, canonical upstream issue/authorization, exact persistence/Worker regression and ecological validation. It may change sensory behavior, physical selection and historic continuation; it is *not* an exact-preserving Stage 3 optimization.
- **Related:** [IDEA-023 Stage 2](PERFORMANCE_AUDIT_STAGE_2.md), [current priority/measurement register](PERFORMANCE_AUDIT_PRIORITIES.md), [upstream #57](https://github.com/smeagol44/vidAI/issues/57). No claim is made that fewer rays will automatically make organisms or whole-world processing more efficient.

### IDEA-026: Inherited per-ray vision range

- **State:** Exploring; personal priority **not assigned**. Stage 3.2 authorizes investigation/documentation only; no genetic implementation.
- **Concept:** Each of the five stable angular ray slots could independently inherit one of **five allowable maximum distances**, exact distances undecided. Distinct from IDEA-025 selecting which ray slots exist; related proposals may co-evolve but need separate mutation/energy decisions.
- **Existing behavior:** Vision is already finite, inherited and mutable **per eye**, with all five rays sharing `eye.range`. Empty rays supply black RGB and neural distance1. Range also scales attenuation and normalized distance, so changing it can alter signals for objects still in range. See [verified source inspection](experiments/performance-stage-3-v2/vision-range-source.md).
- **Performance hypothesis:** Shorter corridors may visit fewer cells/candidates/intersections; index build, fixed overhead, density, near occlusion and allocations limit savings. No measured marginal length cost or system speedup exists. Any future hypothetical query study must stay outside authoritative sensing and be registered/bounded.
- **Biological/compatibility decisions:** Per-eye versus per-ray inheritance, five discrete choices versus other representation; mutation/correlation with subsets; stable eye/ray/channel/weight/learned-record identities; RGB attenuation and distance normalization; actual structural/operational energy cost; absent allele preserves exact historical per-eye range and PRNG continuation. No requantizing old saves. Less vision can worsen feeding/survival; natural physical selection only, no artificial fitness reward.
- **Gate:** Separate sensory/genetic authorization, persistence/Worker/determinism and ecological review before implementation; no number/range change during this audit. [S2-03 research queue](PERFORMANCE_AUDIT_PRIORITIES.md), [cumulative report](PERFORMANCE_AUDIT_STAGE_3.md).

## Notes on potential promotion

- IDEA-013–IDEA-026 are personal future ideas. **IDEA-023 is now the explicitly identified P0 top priority for the next joint investigation**. IDEA-021/IDEA-022 remain medium-high, and all other user-assigned priorities remain unchanged. No entry authorizes implementation or sets an execution date. Their statuses concern maturity only.
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
