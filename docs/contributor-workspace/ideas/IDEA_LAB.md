# VIDA 2D — Hernan's Idea Lab

> **Contributor-only planning board — 2026-10-29.** This board belongs to the `hernansgarro/vidAI` fork. These cards are exploratory, **not upstream issues, accepted upstream scope, or authorizations to implement**. It is intentionally separate from [Fede's canonical VIDA project](https://github.com/users/smeagol44/projects/1/views/1) and the [shared issue / decision index #57](https://github.com/smeagol44/vidAI/issues/57). The [earlier contributor journal](CONTRIBUTOR_IDEAS.md) is now a compact index; live detail belongs in each card or its linked design document. Neither document should be included in an upstream submission branch without separate approval.
>
> **Board implementation:** Repository-hosted Markdown with linked cards. This is a navigable **static Kanban view**, not a GitHub Projects v2 board; moving cards means editing this document. No fork issues were created to duplicate the upstream backlog.

## Current top priority

**IDEA-023 — Active simulation performance audit (P0)**. Its current objective is **maximal actual Worker progress under representative populated, running, minimal-observer-load conditions**, not paused/decoration FPS. See the [current measurement target and stage gates](../performance/PERFORMANCE_AUDIT_PLAN.md), [Stage 2 source review](../performance/PERFORMANCE_AUDIT_STAGE_2.md) and [measurement/decision priorities](../performance/PERFORMANCE_AUDIT_PRIORITIES.md). Preserve completed experimental evidence and uncertainties. No finding, optimization or new experiment is authorized by this board alone.

**Next research handoff (deferred, documentation only):** [Worker hot-path diagnosis and future Work-prompt context](../performance/WORKER_HOTPATH_RESEARCH_HANDOFF.md). After Stage 3.5, candidate priority shifted toward Worker internal tick/phase costs, scaling and redundant computation, without claiming a proven root cause or authorizing a new run. Hernan is reserving Work credits for a separate upstream submission.

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
| — | [IDEA-026 · Chemical scents and olfaction](#idea-026-chemical-scents-olfaction-and-pheromone-traces) | — | — | — | — |
| [IDEA-027 · Effective-speed audio cues](#idea-027-audio-cues-for-abrupt-effective-speed-changes) | — | — | — | — | — |

**Completed work is not an active column.** [IDEA-001 — Pipe World](../tracking/CONTRIBUTOR_COMPLETED.md) was delivered to fork main via [PR #53](https://github.com/hernansgarro/vidAI/pull/53). [IDEA-012 — Retained window agreements during resizing](../tracking/CONTRIBUTOR_COMPLETED.md) was already implemented with local side-window/tube stages 1–3, as verified against code and automated tests on 2026-11-02. Both are recorded in the [completed-work register](../tracking/CONTRIBUTOR_COMPLETED.md). Their implementation in the fork does not authorize an upstream PR.

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
| IDEA-027 — Audio cues for abrupt effective-speed changes | **Low**; potentially quick to implement, which may raise scheduling priority |


**Egg-energy design prerequisite:** Before proposing changes to parental
funding, incubation, shared-reserve egg uptake, or egg hatching-energy rules,
Hernan wants to discuss the rationale for current behavior with Fede and
jointly evaluate any alternatives. This particularly concerns IDEA-003,
IDEA-004, IDEA-005, and IDEA-007, plus relevant energy decisions in IDEA-002
and IDEA-006. Current behavior is not presumed defective. No implementation
or upstream contact is authorized by this note.

**IDEA-012 is completed** for local same-world windows; see [verified deliveries](../tracking/CONTRIBUTOR_COMPLETED.md). This does not resolve Stage 4 remote agreements in deferred IDEA-010.

**Unassigned priorities:** IDEA-013–020, IDEA-024–026 (except IDEA-021/022, each Medium-high). In-audit S2 hypothesis order does not assign IDEA-025 a feature priority. P0 IDEA-023 remains above all.

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
- **Detail:** [Deferred remote design](../designs/REMOTE_AQUARIUM_DESIGN.md); [delivered local stages #121](https://github.com/smeagol44/vidAI/issues/121) and [#122](https://github.com/smeagol44/vidAI/issues/122).

### IDEA-011: Portable organism state

- **State:** Deferred — separate proposal needed.
- **Intent:** Explore exporting and importing the complete authoritative state of *one living creature*, distinct from whole-world saves and the already implemented in-memory local tube transfer.
- **Open decisions:** Identity collision policy, exact state/brain/learning/body serialization, format versioning, energy accounting and migration/security limits.
- **Guardrails:** Do not silently implement file export/import or remote transport under local stage-3 scope.
- **Detail:** [Deferred remote/portable design](../designs/REMOTE_AQUARIUM_DESIGN.md#idea-011-portable-living-organism-files).

### IDEA-013: Egg overlays behind creatures

- **State:** Ready for Work (not scheduled or authorized for implementation). Recorded 2026-11-02.
- **Intent:** Render the **egg incubation/progress ring and pink original-reserve-loss sector beneath creature bodies**, not in front of passing creatures. Their current ordering creates visually misleading overlays when creatures overlap eggs.
- **Guardrails:** Change **observer rendering/layer order only**. Keep egg reserve calculations, incubation, energy, sensing, contact, picking, Worker authority and saves unchanged. Preserve legibility when unobscured.
- **Acceptance to refine:** Inspect actual composite passes and test crossing/occlusion involving creatures, eggs and tubes. Do not bundle an unrelated mouth-layer decision into this correction.
- **Related:** [Implemented egg display #116](https://github.com/smeagol44/vidAI/issues/116); [completed register](../tracking/CONTRIBUTOR_COMPLETED.md).

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
- **Related:** [Harsh selector #119](https://github.com/smeagol44/vidAI/issues/119), [completed Pipe World IDEA-001](../tracking/CONTRIBUTOR_COMPLETED.md).

### IDEA-020: Celphone Size scenario

- **State:** Exploring; recorded 2026-11-02.
- **Intent:** Add a fixed built-in startup preset tentatively called `Celphone size` (final English UI spelling to confirm), independent of other presets, with **the same general initial settings as current Harsh World** but phone-oriented tank dimensions.
- **Open decision:** **Exact world-unit width and height are not defined yet**; consider aspect ratio, usability and available small-screen world rendering before implementation. No guessed dimensions, automatic tube links, or changes to simulation rules.
- **Related:** [Harsh selector #119](https://github.com/smeagol44/vidAI/issues/119), [completed Pipe World IDEA-001](../tracking/CONTRIBUTOR_COMPLETED.md).

### IDEA-021: Nutrient contact and ledge geometry

- **State:** Exploring; **personal priority: Medium-high**, recorded 2026-11-02. No implementation authorization.
- **Observation:** Small nutrients appear to hover above surfaces and some fail to fall off an active tube's roof/edge as expected.
- **Verified current mechanism (source inspection, not newly executed physics tests):** `simulation.ts` represents nutrients as radius-bearing circular particles and, outside tubes, clamps **their centers** at a fixed **35-world-unit** margin from each tank wall, regardless of actual radius. In connected worlds, `moveTubeParticle` and `projectWaterPoint` in `selfTubes.ts` constrain particle **centers** to a union of rectangular water regions with a fixed **35-unit margin**. Thus a small particle of physical radius 6 may have about 29 world units of clear space from a regular tank floor; tube-roof behavior is also affected by the center projection. `App.tsx` renders a physical circle with a larger glow/texture envelope.
- **Hypothesis to test:** The fixed center margins / rectangular water projections, rather than an existing square nutrient collider, explain the visual separation and some failure to roll/fall from tube ledges. Determine exact behavior at corners and tube mouths through focused deterministic trajectories before choosing geometry.
- **User-proposed alternative:** An **octagonal contact frame** oriented with one vertex on the downward vertical axis (a nutrient would nominally rest on its bottom point). This is a candidate to compare, **not a decision** to replace the current circle. Clarify whether the polygon would rotate, whether optics/feeding retain circular bounds, and whether geometry or appearance should change.
- **Review goals:** Contact relative to actual particle radius, stable resting distance, natural departure from tube roof/edges under gravity and water resistance, no sticking/teleportation, exact save continuity and no changes to organism physics or feeding. Use a separate versioned behavior if historical motion would otherwise change. Keep user-visible artwork separate from physical collision representation.
- **Related:** [Tube geometry](../../../selfTubes.ts), [nutrient motion](../../../simulation.ts), [physical particle radius](../../wiki/Ecology-Baseline.md), IDEA-022 (separate collision proposal).

### IDEA-022: Nutrient-to-nutrient collisions

- **State:** Exploring; **personal priority: Medium-high**, recorded 2026-11-02. Independently scoped and not authorized for implementation.
- **Intent:** Evaluate **physical collisions between nutrient particles**, potentially enabling piles, occlusion and local accumulation. Initial scope need not include nutrient-versus-creature body collisions; preserving easy feeding is an explicit motivation.
- **Current implementation (source review):** Nutrient particles independently integrate gravity and drag, then apply tank limits or tube water projection; there is no particle-to-particle collision resolution in the nutrient-motion pass. Organism feeding is modeled separately via mouth/radius contact.
- **Open decisions:** Circle versus polygon contact shape; contact response, restitution/friction/damping and whether particles should rotate; interaction of particles with tube edges; high particle counts/near-overlaps and bounded broadphase costs; collision ordering and deterministic continuation; coupled food acquisition, sight occlusion and ecological distribution effects.
- **Guardrails:** Do not apply arbitrary repulsive thrust or energy subsidies. Preserve food energy, identities, historical save and Worker authority; do not alter existing creature feeding or organism contact without separate approval. Design regression tests for contacts, stable piles, conservation and performance. IDEA-021 does not authorize IDEA-022 and vice versa.

### IDEA-023: VIDA 2D performance and CPU-load audit

- **State:** Exploring/research underway; **personal priority P0, above all other ideas**. The four-stage audit has a completed source-model Stage 2 and separately recorded Stage 3 evidence/receipts; **do not infer a full Stage 3 completion, a proven root cause or approved optimization** from this card. Consult the [live audit plan](../performance/PERFORMANCE_AUDIT_PLAN.md) for the exact gates and latest target.
- **Objective:** Increase achieved simulation ticks/s under MAX with **populated, running worlds**, caustics **OFF**, no organism selected/tracked and no optional sensory/brain overlay; preserve a minimally useful display. Test both disconnected and physically active local tubes. FPS remains a usability guardrail, not a simulation-speed proxy.
- **Evidence questions:** Separate true Worker tick cost (physics, articulated bodies, feeding/contact, vision/neural, ecology, allocations/GC), Worker/report/ACK backpressure, React/Canvas observer work and energy-event bookkeeping from actual glow drawing. Glow correlation is **a hypothesis, not a causal diagnosis**.
- **Required controls:** Pinned source and seed/checkpoint, exact organism/parts/rays/food/egg counts, tubes/topology, settings, viewport/DPR, machine/browser and CPU memory/GC; preregister any new test budget. Preserve physical energy transfers, deterministic state, old saves, off-camera authority and original baselines. Do not tune biology or delete essential simulation work to improve results.
- **Evidence and next decisions:** [Current active plan](../performance/PERFORMANCE_AUDIT_PLAN.md) · [Static S2 hypotheses](../performance/PERFORMANCE_AUDIT_STAGE_2.md) · [priorities and Stage 4 questions](../performance/PERFORMANCE_AUDIT_PRIORITIES.md). Subsequent tests and implementation require separate bounded approval. No upstream submission follows from these personal notes.

### IDEA-024: World-preset initial zoom and framing

- **State:** Exploring; recorded 2026-11-02; personal priority **not yet assigned**. This is a separate outstanding idea, **not** an extension or implementation of IDEA-009, IDEA-019/020, or the current performance audit.
- **User intent:** World configuration should be able to specify a preferred **initial camera zoom / view framing** as part of the selected starting-world preset. For example, choosing `Harsh World` should initially use a more distant zoom so the observer can see more of the aquarium; a "farthest zoom" or fit-to-tank presentation is the motivating example, **not a fixed zoom number already chosen**.
- **Scope to explore:** Determine whether each built-in scenario (Default, Harsh, Pipe World, and possible future notebook/phone presets) defines an explicit initial scale or a viewport-dependent **fit-to-world** rule, and whether user-defined named profiles (IDEA-009) could later retain the same preference. World dimensions (simulation units) and camera/view scale (presentation) must remain distinct.
- **Open decisions:** Choose the exact zoom/framing for each scenario; whether the value is a numeric scale, a normalized level or a computed fit; how aspect ratio, safe UI areas, window resize and mobile displays affect whole-tank visibility; whether the camera center/position is also preset; when the initial zoom is applied (startup, world reset, scenario selection, or importing a save); and whether a later manual pan/zoom override persists.
- **Expected UX safeguard:** A preset should establish an **initial observation preference**, not permanently lock camera controls or silently reset the user's chosen zoom during ordinary interactions. Evaluate save/restore and backward compatibility separately before specifying implementation.
- **Architecture and audit boundary:** Camera framing is observer/UI state. Do not modify world-coordinate dimensions, physics, energy, genetics, Worker ticks, off-camera simulation or authoritative saved-world semantics simply to fit more of the aquarium on screen. Changes in framing can change visible object counts, paint area, viewport culling and observed FPS; keep zoom, pixel resolution/DPR and actual world density controlled during performance comparisons.
- **Related:** IDEA-009 (named scenarios), IDEA-019/020 (future notebook/phone worlds), [Pipe World completion](../tracking/CONTRIBUTOR_COMPLETED.md), [current performance audit plan](../performance/PERFORMANCE_AUDIT_PLAN.md). No code change, tests, upstream issue or PR is authorized by idea capture.

### IDEA-025: Heritable per-eye ray subsets

- **State:** Exploring; **personal priority: not assigned**. Captured from Hernan's 2026-11-02 discussion of audit hypothesis S2-03. The priority of measuring current optical work during IDEA-023 **does not** authorize this separate genetic feature. No code, test experiment, upstream issue or PR is requested.
- **Concept:** An eye could inherit a choice of **which of the existing five angular ray positions** it actually emits; its corresponding neural inputs/network structure should reflect the active rays. Natural biological and computational costs might reward organisms that need fewer retinal channels, without any fitness shortcut or guaranteed ecological advantage.
- **Verified current baseline:** `simulation.ts` has fixed `RAYS_PER_EYE=5`; `getBrainLayout` gives each of those rays red/green/blue/distance channels; `eyeSensoryUpkeep` charges receptor-dependent upkeep for five rays. Existing spectral-sensitivity alleles are **not** a variable-ray implementation.
- **Open decisions:** Identity-preserving five-position bitmask versus a count; admissible combinations and whether zero rays are allowed; inheritance/mutation operators and energetic upkeep of active rays; maintaining stable ray IDs, ordered inputs and exact occlusion; remapping weights/disabled connections/learned synapse records; introduction for new genomes versus old saves (omitted allele should retain all five rays); determinism, PRNG and schema migration; evolutionary trade-offs, test fixtures, UI/inspection display, and source-of-selection evidence.
- **Study before implementation:** Measure current ray/index/brain/input cost in IDEA-023 Stage 3 **without changing the existing five rays**. Any actual variable-ray simulation requires a separately scoped design, canonical upstream issue/authorization, exact persistence/Worker regression and ecological validation. It may change sensory behavior, physical selection and historic continuation; it is *not* an exact-preserving Stage 3 optimization.
- **Related:** [IDEA-023 Stage 2](../performance/PERFORMANCE_AUDIT_STAGE_2.md), [current priority/measurement register](../performance/PERFORMANCE_AUDIT_PRIORITIES.md), [upstream #57](https://github.com/smeagol44/vidAI/issues/57). No claim is made that fewer rays will automatically make organisms or whole-world processing more efficient.

### IDEA-026: Chemical scents, olfaction and pheromone traces

- **State:** Exploring; priority unassigned; **not authorized for implementation**. [Canonical current design and open decisions](../designs/SCENT_AND_OLFACTION_DESIGN.md).
- **Selected three-channel metaphor:** **Umami (R)** = pure-red organic nutrient odor, **Fresco (G)** = pure-green inorganic nutrient odor, **Almizclado (B)** = usually blue-dominant inherited creature scent with possible weaker R/G. Umami is deliberately a mnemonic *taste* term, not real odor chemistry.
- **Selected emission model:** Nutrients, eggs and creature bodies emit independent expanding/fading circles. Creatures also leave weak finite-unit involuntary pheromone emitters; brain-controlled, energetically funded glands may emit more genetically diverse markers. Camouflage is **additive mixture only**, never neutralization. Circles decay faster than area dilution and are deleted at zero. Nose channels sum overlapping contributions independently, saturating high at FF; no scripted attraction or identity sensing.
- **Selected egg concept:** each egg's signature resembles the **future offspring's inherited three-channel signature**, shifted toward white with a positive R/G/B floor and FF cap. The whitening parameter is **undecided**.
- **Representation:** `RRGGBBTT` fixes each circle's chemical signature; one declining intensity equals the observer's alpha TT **one-to-one**. No changing fragrance ratios during a pulse, no optical sense of odor. Exact observer alpha-overlap fidelity is intentionally deferred.
- **Unresolved and safeguarded:** Emission/decay laws, counts/intensities, egg genetics timing, nose/gland inheritance, energy costs and persistence, spatial transport and CPU budgets. Do not implement until the [P0 performance audit](../performance/PERFORMANCE_AUDIT_PLAN.md) and separate bounded user decisions support it. Original design iterations remain in Git/PR history, not in the current spec.

### IDEA-027: Audio cues for abrupt effective-speed changes

- **State:** Ideas; captured 2026-11-05. **Personal priority: Low**, with potentially low implementation effort as a reason it could be scheduled earlier than other low-priority ideas. This is not implementation authorization.
- **Intent:** Play a brief, futuristic engine-like sound when the **achieved/effective simulation speed** changes sharply, to alert an observer without continuously watching the speed indicator.
- **Examples:** A sudden drop from roughly 3x to 0.5x should trigger a **descending pitch** (machine slowing down); a rise from roughly 0.5x to 3x should trigger an **ascending pitch** (engine accelerating). These are illustrative transitions, not chosen numerical thresholds.
- **Motivation:** A sudden increase in effective speed may indicate a substantially lighter computational workload, for example when an aquarium loses all its creatures. The sound is an indirect performance/activity cue, not an authoritative cause diagnosis.
- **Accepted latency:** Detection and playback may occur after the actual speed change; immediate synchronization is unnecessary.
- **Open decisions:** Detect relative versus absolute change; minimum magnitude and sample window; debounce/cooldown for noisy fluctuations; whether playback is opt-in/mutable; browser audio permission and mute behavior; accessible non-audio alternative; sound design and volume.
- **Guardrails:** Observer-only feedback based on measured effective speed, **not the user-selected speed setting**. No impact on Worker pacing, ticks, simulation state, physics, energy, deterministic saves, or ecological behavior. Avoid repeated sounds from ordinary small fluctuations.
- **Implementation:** Not requested. No upstream issue, PR, or experiment authorized by this idea capture.

## Promotion boundaries

This is a **personal idea-maturity board**, not the shared upstream backlog. Implemented work belongs in [the completed register](../tracking/CONTRIBUTOR_COMPLETED.md); approval to merge fork work **does not** approve an upstream submission. Upstream issues and PRs remain authoritative for implementation, review and acceptance. A clean upstream submission requires the separately approved fork-first workflow; avoid bundling unrelated features just because they share a fork.


## Working agreement

1. Capture a personal idea here first, with a stable `IDEA-NNN` identifier and a link to expanded notes. Merge or split idea cards only when they represent different decisions; do not clone the upstream issue backlog.
2. Advance maturity **only after the corresponding discussion/approval**. In particular, *Ready for Work* does not allow implementation without an explicit request, and *Ready to share* does not permit an upstream PR.
3. For any actual implementation, use the [contributor workflow](../../CONTRIBUTOR_WORKFLOW.md) and the shared canonical upstream issue. Do not create duplicate fork implementation issues.
4. When an idea becomes an upstream proposal or is implemented, link the canonical issue/PR and update its personal card; do not mark an upstream issue Done based solely on a fork merge.
5. Keep this board and the original journal **fork-only** in clean upstream submissions. The compact contributor index is navigational only; use current cards, focused design documents and upstream evidence for authoritative status.
