# VIDA 2D — Contributor workflow and requirement status

**Owner:** hernansgarro  
**Recorded:** 2026-11-01  
**Scope:** Contributor-side workflow tracking; not an upstream project status or release record.

## Purpose and authoritative sources

This document tracks the contributor's progress through five personal delivery stages. It does **not** replace upstream issues, the VIDA Development board, `docs/FEATURE_ROADMAP.md`, `docs/PROJECT_STATUS.md`, or issue #57. Upstream issues and PRs remain the authoritative record of scope, decisions, checks, review, and acceptance. Update this summary from verified GitHub evidence; never infer an upstream merge from a fork merge.

## Idea intake versus active requirements

The idea bank holds proposals that are not yet committed to delivery, including incomplete or deferred ideas. Once the contributor elects to plan a bounded outcome, link the original idea and open or reuse its canonical upstream issue. The outcome enters Stage 1; do not duplicate the upstream backlog. The idea may remain in the idea bank as historical context, marked as promoted with a link. A postponed active requirement retains its stage and a blocked/deferred flag instead of silently returning to the idea bank.

## Five contributor stages

| Stage | Name | Completion criterion |
| --- | --- | --- |
| 1 | Ideation and planning | Scope, decisions, constraints, acceptance criteria and upstream tracking reference are recorded. |
| 2 | Prompt preparation | An executable, self-contained handoff prompt is finalized and saved or linked. |
| 3 | Prompt execution | Work is implemented on a fork topic branch with recorded evidence and an internal PR or equivalent review candidate. |
| 4 | Review, corrections and fork integration | Contributor review and necessary corrections are complete; internal PR is merged and the exact `hernansgarro/vidAI:main` head is verified. |
| 5 | Upstream submission | After separate explicit approval, a clean submission branch based on upstream main is reviewed and the upstream PR is opened. This stage does not imply acceptance or deployment. |

Track Stage 5 separately as `not authorized`, `authorized / pending`, `PR open`, or `PR submitted / awaiting review`. Record upstream acceptance as an independent field (`not submitted`, `in review`, `accepted`, `rejected`, `superseded`) supported by merge and deployment receipts.

The stages are a contributor-facing overlay, not replacements for board statuses (`Backlog`, `Needs decision`, `Ready`, `In progress`, `In review`, `Testing`, `Done`). Active discussion counts as upstream `In progress`. Upstream `Done` requires upstream acceptance.

## Current requirement register (verified 2026-11-02)

**No new personal idea is authorized for implementation by this documentation update.**
The active [idea board](IDEA_LAB.md) contains only unfinished, exploratory,
implementation-ready-but-unscheduled or explicitly deferred proposals. New ideas
IDEA-013–IDEA-020 are recorded as **future work**, not requirements already in
progress. Notebook/Cellphone dimensions are still undecided.

Finished fork work is kept in the
[verified completion history](CONTRIBUTOR_COMPLETED.md), rather than as
repeated "pending implementation" entries here.

### Personal idea triage (2026-11-02; no new implementation authorization)

- **IDEA-008 — Nutrient appearance frequencies below one per second:** Hernan assigns **High priority**. Remains exploratory because fractional-rate UI, deterministic accumulation and snapshot compatibility must be designed; see the [active idea board](IDEA_LAB.md). This is about rate of particle appearance, **not** per-particle nutrient decay.
- **IDEA-012 — Retained agreements when tank windows disappear:** Hernan assigns **High importance**, but code and unit/browser tests confirm this is **already delivered** for local Stage 3 self-links. It is now in the [completed-work history](CONTRIBUTOR_COMPLETED.md), **not an outstanding requirement**. Do not conflate this with deferred Stage 4 cross-user agreement persistence under IDEA-010.
- No issue/PR or new implementation is authorized merely by updating personal priority. The urgent new need Hernan mentioned remains undefined and is not superseded by this triage.

### Nutrient geometry ideas (2026-11-02; no development started)

- **IDEA-021 — Nutrient contact and ledge geometry:** **Medium-high** personal priority, exploring. Source review found a fixed 35-unit center clamp in ordinary tanks (`simulation.ts`) and a fixed-margin rectangular center projection around physical tubes (`selfTubes.ts`). Neither uses the nutrient's current physical radius as a boundary clearance. The proposed downward-vertex octagonal frame is a hypothesis, not approved geometry. See [IDEA-021](IDEA_LAB.md#idea-021-nutrient-contact-and-ledge-geometry).
- **IDEA-022 — Nutrient-to-nutrient collisions:** **Medium-high** personal priority, independent exploratory proposal. No nutrient-particle pairwise collision resolution is present in the inspected nutrient-motion pass. Assess ecology/performance, deterministic state and possible pile-up before authorizing any physics change. Do not assume body-versus-nutrient collisions are required. See [IDEA-022](IDEA_LAB.md#idea-022-nutrient-to-nutrient-collisions).
- This update is **documentation only**. No tests were newly executed, and no implementation, experiment protocol or upstream proposal was authorized.

### Submission and acceptance watchlist (not feature-development backlog)

| Completed in fork | Current upstream gate | Verified evidence / next action |
| --- | --- | --- |
| Pipe World (IDEA-001) | **Fork Stage 4 complete; Stage 5 not authorized.** Upstream acceptance pending. | [Fork PR #53](https://github.com/hernansgarro/vidAI/pull/53) merged at `e9662a6ef5307a3349ea1338489d755a1879c8b9`; CI and fork publication confirmed in [#135](https://github.com/smeagol44/vidAI/issues/135). **Ask for explicit upstream PR authorization only after the user requests submission**; do not open it as part of this documentation update. |
| Versioned nutrient-cycle decay-v2 / carrion mineralization | **Fork Stage 4 complete; Stage 5 PR open, awaiting upstream review.** | [Fork PR #48](https://github.com/hernansgarro/vidAI/pull/48) merged at `2ad2c7daec458ac562876b8fe8326b24bf26fa4f`. [Upstream PR #134](https://github.com/smeagol44/vidAI/pull/134) is open, **not merged** (checked 2026-11-02). [Issue #125](https://github.com/smeagol44/vidAI/issues/125). |
| Automatic selection/tracking preferences | **Fork Stage 4 complete; Stage 5 PR open, awaiting upstream review.** | Delivered together with nutrient work in fork PR #48 and included in [upstream PR #134](https://github.com/smeagol44/vidAI/pull/134). [Issue #126](https://github.com/smeagol44/vidAI/issues/126). Keep its acceptance distinct from nutrient-cycle acceptance. |

The completed upstream-integrated local tube and observer features are not
reopened because new cosmetic enhancements mention the same interface.
Stage 4 **remote cross-user tanks** remain explicitly deferred.

## Required fields for future entries

Requirement ID/title; upstream issue link; idea/prompt link; stage and completion date; current blocker; fork branch and internal PR; fork-main merge SHA; validation results; explicit upstream submission authorization; upstream PR link; upstream review/merge/deployment status; next action; last verified date.

## Update policy

Update this register at stage boundaries and on material blockers. Cite concrete GitHub links and commit hashes; use `unverified` rather than assumed completion. Keep this contributor register separate from the idea bank, and keep upstream project state in its existing canonical tracking systems. Never write this status into the upstream Wiki, which documents implemented behavior rather than plans.
