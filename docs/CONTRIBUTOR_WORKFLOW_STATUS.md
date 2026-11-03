# VIDA 2D — Contributor delivery status

> **Fork-only operational index, consolidated 2026-11-03.** The [active personal idea board](IDEA_LAB.md) defines future-idea maturity and priorities; [completed work](CONTRIBUTOR_COMPLETED.md) records verified fork deliveries. This file tracks only the **five contributor delivery stages** and open submission gates. It does not change or replace upstream issues, [#57](https://github.com/smeagol44/vidAI/issues/57), the shared project board or production release status.

## Stage definitions and gates

| Contributor stage | Exit criterion |
| --- | --- |
| 1. Planning | Scoped outcome, decisions/acceptance, base/environment and canonical upstream issue reference are recorded |
| 2. Work prompt | Self-contained executable handoff/prompt finalized |
| 3. Fork implementation | Topic branch and reviewed fork PR with reproducible evidence |
| 4. Fork review and integration | Accepted internal PR merged; exact `hernansgarro/vidAI:main` head verified |
| 5. Upstream submission | **Separate explicit approval** followed by clean upstream-main-based submission PR from the fork; upstream acceptance is still independent |

For Stage 5 distinguish `not authorized`, `approved / not submitted`, `PR open`, and `upstream accepted`. A fork merge is **never** an upstream merge. Do not infer permission to publish or deploy from a prompt or issue-card maturity. Shared upstream board stages are separate from these contributor stages.

## Current personal planning

- **P0 / IDEA-023 performance audit:** research and measurement are the user's highest personal priority. The [active four-stage audit plan](PERFORMANCE_AUDIT_PLAN.md) sets the **current 2026-11-03 throughput target** (populated running simulation, MAX capacity, caustics OFF, minimal observer load). [Stage 2 hypotheses](PERFORMANCE_AUDIT_STAGE_2.md) and [owner-selected measurement priorities](PERFORMANCE_AUDIT_PRIORITIES.md) are preserved. The plan references bounded Stage 3 evidence/receipts; **do not infer completed Stage 4 synthesis or authorization to optimize**. Check exact current protocol/evidence before continuing a trial. The old 2026-11-02 'no Stage 3 run' summary is not a current gate.
- **Other unfinished ideas:** statuses, individual priorities, unknowns and blockers are maintained **only in [IDEA_LAB.md](IDEA_LAB.md)**. In particular IDEA-008 is High; IDEA-021/022 are Medium-high; IDEA-010 remote aquariums and IDEA-011 portable living state remain deferred. IDEA-012 local agreement retention is already completed. IDEA-026 scent design is captured but not approved to implement.
- **Implementation boundaries:** No new code, experiments or upstream proposal is authorized merely by personal notes. The fork's completed work does not silently expand the upstream accepted scope.

## Verified fork deliveries with separate upstream gates

| Outcome | Fork evidence | Upstream status / gate |
| --- | --- | --- |
| **IDEA-001 Pipe World** | [Fork PR #53](https://github.com/hernansgarro/vidAI/pull/53), merged `e9662a6ef5307a3349ea1338489d755a1879c8b9`; [issue #135](https://github.com/smeagol44/vidAI/issues/135) | **No new upstream PR authorized** by the original fork integration; request explicit approval before submission |
| **Nutrient decay-v2 / carrion mineralization** | [Fork PR #48](https://github.com/hernansgarro/vidAI/pull/48), merged `2ad2c7daec458ac562876b8fe8326b24bf26fa4f`; [issue #125](https://github.com/smeagol44/vidAI/issues/125) | [Upstream PR #134](https://github.com/smeagol44/vidAI/pull/134) **open / not merged, checked 2026-11-03** |
| **Automatic selection/tracking preferences** | Same [fork PR #48](https://github.com/hernansgarro/vidAI/pull/48); [issue #126](https://github.com/smeagol44/vidAI/issues/126) | Included in upstream PR #134, **not independently accepted** |
| **Already integrated upstream local tube/observer stages** | [Upstream PR #132](https://github.com/smeagol44/vidAI/pull/132) and [completed register](CONTRIBUTOR_COMPLETED.md) | Local Stage 1–3 fulfilled; **remote Stage 4 explicitly deferred** under IDEA-010 |

Review live PR/issue status before acting; the checked date above is a receipt, not a perpetual status claim. For all other fork deliveries, use [the verified completed-work register](CONTRIBUTOR_COMPLETED.md) rather than duplicating implementation details here.

## Required fields for new bounded requirements

Issue / idea link; scope and acceptance; source/base and fork branch; stage and blocker; reviewed fork PR; exact merge SHA; verified fast/build/Worker/browser checks; independent upstream submission authorization; upstream PR and actual review/merge state; next action and last verification date.

**Maintenance rule:** Update only when a stage/gate or blocker materially changes. Do not reproduce idea-card detail, the audit protocol, issue conversations, experiment findings or previous stage snapshots. Keep active experiments and evidence in their own dedicated artifacts; retain all Git/PR history. Do not publish fork-only planning in upstream Wiki or submission branches without permission.
