# Contributor brainstorming — Personal fork workspace

> **Owner:** Hernan Garro (`hernansgarro/vidAI`). This is a **fork-only working area** for personal research, ideas and planning. It is **not** Federico's canonical VIDA roadmap, a parallel upstream issue backlog, a simulation specification, or permission to implement. Canonical issues/decisions remain in [upstream #57](https://github.com/smeagol44/vidAI/issues/57) and the [shared development board](https://github.com/users/smeagol44/projects/1/views/1). Keep this entire folder out of clean upstream submission branches unless explicitly approved.

## Current personal workspace

| Area | Contents |
| --- | --- |
| [Ideas](ideas/IDEA_LAB.md) | Active IDEA-### cards, priorities, maturity and unresolved questions |
| [Topic index](ideas/CONTRIBUTOR_IDEAS.md) | Compact pointers to unfinished ideas (not a chronological journal) |
| [Scent/olfaction design](designs/SCENT_AND_OLFACTION_DESIGN.md) | Current IDEA-026 decisions, constraints and open parameters |
| [Remote aquarium/portable state](designs/REMOTE_AQUARIUM_DESIGN.md) | Deferred IDEA-010/011 design; local tube stages 1–3 are already implemented |
| [Performance audit](performance/PERFORMANCE_AUDIT_PLAN.md) | IDEA-023 P0 current measurement objective, protocol/stage gates |
| [Performance priorities](performance/PERFORMANCE_AUDIT_PRIORITIES.md) | Historical technical hypotheses and current owner priority overrides |
| [Stage 2 evidence](performance/PERFORMANCE_AUDIT_STAGE_2.md) | Pinned source-based performance cost model; not measured proof |
| [Verified contributor deliveries](tracking/CONTRIBUTOR_COMPLETED.md) | Fork implementations and upstream acceptance boundaries |
| [Contributor workflow status](tracking/CONTRIBUTOR_WORKFLOW_STATUS.md) | Current delivery and upstream-submission gates |

## Ownership and maintenance

- **Current decisions first:** each active concept should contain only its chosen state, unresolved questions, constraints and evidence links. Earlier experiments, discarded variants and deliberation remain recoverable through Git/PR history.
- **Preserve external authority:** the shared [contributor workflow](../CONTRIBUTOR_WORKFLOW.md), upstream `AGENTS.md`, official roadmap, Wiki, issue/project decisions and experimental data remain in their established locations. Do not relocate shared `docs/experiments/` results, published technical docs or build/CI evidence into this personal ideas folder.
- **No silent promotion:** an idea can remain exploratory indefinitely. Moving a file, editing a personal card or merging a docs-only fork PR does not authorize simulation changes, an upstream PR, acceptance or release.
- **Performance evidence stays verifiable:** do not compress preregistered protocols, original measured results, pinned baselines or uncertainty into unsupported summaries.

This index is the recommended single entry point for contributor-only plans. Links elsewhere in the fork should point here or directly to one current document, not duplicate the full personal backlog.
