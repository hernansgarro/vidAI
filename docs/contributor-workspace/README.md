# Contributor workspace — Personal planning and fork deliveries

> **Owner:** Hernan Garro (`hernansgarro/vidAI`). This is a **fork-only workspace** for personal research, ideas, pending feature submissions and delivery tracking. It is **not** Federico's canonical VIDA roadmap, a parallel upstream issue backlog, a simulation specification, or permission to implement. Canonical issues/decisions remain in [upstream #57](https://github.com/smeagol44/vidAI/issues/57) and the [shared development board](https://github.com/users/smeagol44/projects/1/views/1). Keep this entire folder out of clean upstream submission branches unless explicitly approved.

## Current personal workspace

| Area | Contents |
| --- | --- |
| [Ideas](ideas/IDEA_LAB.md) | Active IDEA-### cards, priorities, maturity and unresolved questions |
| [Topic index](ideas/CONTRIBUTOR_IDEAS.md) | Compact pointers to unfinished ideas (not a chronological journal) |
| [Scent/olfaction design](designs/SCENT_AND_OLFACTION_DESIGN.md) | Current IDEA-026 decisions, constraints and open parameters |
| [Remote aquarium/portable state](designs/REMOTE_AQUARIUM_DESIGN.md) | Deferred IDEA-010/011 design; local tube stages 1–3 are already implemented |
| [Cumulative measured findings](../PERFORMANCE_AUDIT_STAGE_3.md) | Verified Stage3 conclusions through3.12, including partial/failed lots and immutable evidence links; maintained on main |
| [Performance audit](performance/PERFORMANCE_AUDIT_PLAN.md) | IDEA-023 P0 current measurement objective, protocol/stage gates |
| [Worker research handoff](performance/WORKER_HOTPATH_RESEARCH_HANDOFF.md) | Current Stage3 checkpoint, verified evidence, safeguards and next bounded-lot requirements |
| [Performance priorities](performance/PERFORMANCE_AUDIT_PRIORITIES.md) | Historical technical hypotheses and current owner priority overrides |
| [Maintained spatial grid design](performance/MAINTAINED_SPATIAL_GRID_DESIGN.md) | Source-backed owner discussion, query ordering, persistent central grid, diagnostics, and dependency-ordered testing plan; P1–P9 implemented on testing topic branches; see stage PRs for validation/integration |
| [Physical contacts P9](performance/CONTACT_GRID_P9.md) | Exact pair order, maintained segment queries, P8 compatibility and bounded validation |
| [Stage 2 evidence](performance/PERFORMANCE_AUDIT_STAGE_2.md) | Pinned source-based performance cost model; not measured proof |
| [Verified contributor deliveries](tracking/CONTRIBUTOR_COMPLETED.md) | Fork implementations and upstream acceptance boundaries |
| [Contributor workflow status](tracking/CONTRIBUTOR_WORKFLOW_STATUS.md) | Current delivery and upstream-submission gates |

## Implemented in the fork, not yet accepted upstream

The implementation status of a feature is separate from the maturity of its original IDEA card:

| Fork feature | Verified contributor status as of 2026-11-03 | Canonical technical documentation and evidence |
| --- | --- | --- |
| **Pipe World (IDEA-001)** | Implemented and merged in fork main ([fork PR #53](https://github.com/hernansgarro/vidAI/pull/53)); separate upstream submission approval still required; [upstream issue #135](https://github.com/smeagol44/vidAI/issues/135) remains open | [Fork scenario documentation](../ENVIRONMENT_SCENARIOS.md) and relevant fork [Wiki source](../wiki/Ecology-Baseline.md) |
| **Nutrient cycle decay-v2** | Implemented in fork; [upstream PR #134](https://github.com/smeagol44/vidAI/pull/134) open, awaiting acceptance | [Fork experiment evidence](../experiments/nutrient-cycle-v2.md), [upstream issue #125](https://github.com/smeagol44/vidAI/issues/125) and [current Wiki proposal](../wiki/Ecology-Baseline.md) |
| **Automatic selection/tracking preferences** | Implemented in fork; included in upstream PR #134, not yet accepted | [Upstream issue #126](https://github.com/smeagol44/vidAI/issues/126), [fork delivery record](tracking/CONTRIBUTOR_COMPLETED.md) |

For ongoing work, always check live upstream PR/issue status: this table is a dated **index**, not a permanent assertion of pending acceptance. The [contributor workflow status](tracking/CONTRIBUTOR_WORKFLOW_STATUS.md) and [completed fork deliveries](tracking/CONTRIBUTOR_COMPLETED.md) record verified implementation and submission boundaries; they do **not** duplicate code-backed documentation or experiment data.

**Federico's contribution workflow remains unchanged:** implement, test and update `docs/wiki/` within the fork when appropriate; explicitly label fork-only functionality. When authorized, submit a clean feature branch based on upstream main that includes its necessary technical documentation and Wiki changes. Only accepted upstream integration/publication makes the feature official. Keep technical behavior docs, versioned experiment receipts and the original shared Wiki paths where the workflow requires them, not inside this personal workspace.

## Upstream delivery waves

Hernan may batch completed fork features **before preparing a new upstream PR**
to reduce preparation and token costs. Existing upstream PRs stay separate, with
their original submitted scope; do not absorb another wave into them without
an explicit decision. Prefer isolated, reviewable features within Federico's
upstream contribution policy, which has final authority. See the
[submission-wave rule](../CONTRIBUTOR_WORKFLOW.md#delivery-waves-and-existing-upstream-prs).
The previous #134 expansion remains untouched at Hernan's explicit direction;
it is not a precedent for future submissions.

## Ownership and maintenance

- **Current decisions first:** each active concept should contain only its chosen state, unresolved questions, constraints and evidence links. Earlier experiments, discarded variants and deliberation remain recoverable through Git/PR history.
- **Preserve external authority:** the shared [contributor workflow](../CONTRIBUTOR_WORKFLOW.md), upstream `AGENTS.md`, official roadmap, Wiki, issue/project decisions and experimental data remain in their established locations. Do not relocate shared `docs/experiments/` results, published technical docs or build/CI evidence into this personal ideas folder.
- **No silent promotion:** an idea can remain exploratory indefinitely. Moving a file, editing a personal card or merging a docs-only fork PR does not authorize simulation changes, an upstream PR, acceptance or release.
- **Performance evidence stays verifiable:** do not compress preregistered protocols, original measured results, pinned baselines or uncertainty into unsupported summaries.

This index is the recommended single entry point for contributor-only plans. Links elsewhere in the fork should point here or directly to one current document, not duplicate the full personal backlog.
