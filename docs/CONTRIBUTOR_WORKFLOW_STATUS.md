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

## Current requirement register (provisional evidence review, 2026-11-01)

| Requirement | Contributor stage | Upstream status | Evidence / next verification |
| --- | --- | --- | --- |
| Independent Pipe World scenario (4600 × 2100; initially unconnected; independent environment initialized from Harsh World defaults) | **2 complete; Stage 3 pending** (conversation-derived, not repository-verified) | Not verified | Locate the final prompt and canonical issue; verify no existing implementation or overlapping scope before execution. Distinguish this scenario from the already integrated side-window/self-tube features. |
| Slower nutrient decay, radius floor, and carrion mineralization | **4 reported complete; fork-main merge/head verification pending** | Issues [#125](https://github.com/smeagol44/vidAI/issues/125) open | Fork `docs/PROJECT_STATUS.md` reports 1 J/s, floor 6, schema 19 and retained mineralization, with tests. Verify internal PR, exact merge/head and deployment. Confirm upstream submission authorization and PR status before Stage 5. |
| Automatic selection and tracking preferences | **4 reported complete; fork-main merge/head verification pending** | Issue [#126](https://github.com/smeagol44/vidAI/issues/126) open | Delivered alongside the nutrient follow-up; keep separate because upstream tracks distinct outcomes. |

### Important distinctions

- The initial 30 J/s nutrient cycle and its later 1 J/s revision are not separate completed upstream submissions. The current requested outcome is the final versioned 1 J/s behavior.
- Upstream issue #125 describes the original 30 J/s scope; its follow-up and issue #126 must be checked before composing a clean upstream submission.
- The contributor requested attempting upstream submission for the nutrient work, but an actual PR and accepted integration are not established by the evidence summarized here.
- No claim is made that the independent Pipe World scenario was implemented merely because tube stages 1–3 were integrated upstream.

## Required fields for future entries

Requirement ID/title; upstream issue link; idea/prompt link; stage and completion date; current blocker; fork branch and internal PR; fork-main merge SHA; validation results; explicit upstream submission authorization; upstream PR link; upstream review/merge/deployment status; next action; last verified date.

## Update policy

Update this register at stage boundaries and on material blockers. Cite concrete GitHub links and commit hashes; use `unverified` rather than assumed completion. Keep this contributor register separate from the idea bank, and keep upstream project state in its existing canonical tracking systems. Never write this status into the upstream Wiki, which documents implemented behavior rather than plans.
