# Maintained Spatial Grid — Fork Testing Implementation Status

> **Verified checkpoint: 2026-11-05 (Uruguay UTC-3).** Fork-only operational record, preserved in `hernansgarro/vidAI:main` so contributors can resume without relying on chat history. **This document is not a claim that the maintained grid is deployed in fork main or upstream production.**
>
> **Authoritative sources:** [original P0–P12 design and dependency plan](MAINTAINED_SPATIAL_GRID_DESIGN.md), [GitHub performance issue #67](https://github.com/smeagol44/vidAI/issues/67), [shared upstream handoff #57](https://github.com/smeagol44/vidAI/issues/57), fork PRs linked below. The GitHub PR/commit/CI history is the authoritative evidence for each delivery; this file is a concise cross-PR index, **not a parallel canonical issue backlog**.

## Exact branch and publication state

| Branch/site | Verified state on 2026-11-05 |
| --- | --- |
| Fork `main` **before this documentation update** | `6d008d7cd2114fc2ff657a0a91c4c90c05e5d70c`: P0–P8 **not integrated into main**; fork-only contributor Work/CI retry policy merged via PR #115 |
| Fork `testing` | `5fdc1b78d7c16132554bfcfe83375cf1142f42de`: P0–P8 implemented, merged, and published |
| Testing deployment | [GitHub Actions run 42035935206](https://github.com/hernansgarro/vidAI/actions/runs/42035935206): validate, independently assembled main/testing Pages artifact, and deployment **SUCCESS**. PR #114 [publication readback](https://github.com/hernansgarro/vidAI/pull/114#issuecomment-6659261905) verified the served testing/main bundles |
| Fork production | Independently built from fork `main`; no P0–P8 runtime promotion or testing-to-main bulk merge |
| Upstream `smeagol44/vidAI` | No maintained-grid implementation submitted or promoted upstream by this sequence; upstream acceptance remains a separate explicit owner gate |
| Performance | **No measured speedup or regression verdict** for the new grid. Equivalence/correctness evidence is not throughput evidence |

The tested code is in `testing`, not `main`; this document and the original design remain on `main`. Do not merge `testing` wholesale into `main`; preserve its frozen experimental identity, baselines, version labels and Pages deployment rules.

## Completed, merged and published stages

All merge commits and PR states were read back from GitHub on 2026-11-05. PR evidence (including browser, Worker, snapshots and exact head) should be consulted rather than inferred from this table.

| Stage | Outcome | Fork PR | Merge commit on `testing` |
| --- | --- | --- | --- |
| **P0** | Safely integrate fork `main` into `testing` without resetting testing-specific history or baseline | [#106](https://github.com/hernansgarro/vidAI/pull/106) | `2c3b67b2f76bfb99baa1f3156daa5047c85455cd` |
| **P1** | Isolated direct-access spatial matrix: 1,075 slots, typed categories, register/relocate/remove/candidate queries | [#107](https://github.com/hernansgarro/vidAI/pull/107) | `3f66276e3f5b223af490a9c1a857b604dcd40993` |
| **P2** | Analytical conservative articulated-creature envelope, with explicitly unbounded lifetime fallback under the current solver | [#108](https://github.com/hernansgarro/vidAI/pull/108) | `15563e92581b2cd0e2395b7c4427f82ac42a677e` |
| **P3** | Bounded 200-entry observer diagnostics console with Worker/import logging | [#109](https://github.com/hernansgarro/vidAI/pull/109) | `ff3e786ffa0ac68046fb7a0037c147827f9711c2` |
| **P4** | One authoritative maintained grid per world; transient entity-local handles, current-pose bounds, all movement/lifecycle/World replacement synchronization, fail-open overflow | [#110](https://github.com/hernansgarro/vidAI/pull/110) | `c0dda9aaca99743addcb0fd58f75ca7b046cd908` |
| **P5** | Independent, nonrepairing grid-integrity audit; manual action and opt-in every 60 simulated seconds; diagnostics output | [#111](https://github.com/hernansgarro/vidAI/pull/111) | `ebccd7129142b580304cbfcea2440682671b68a1` |
| **P6** | Observer-only optional RGB cell borders and current/guaranteed creature enclosure overlays | [#112](https://github.com/hernansgarro/vidAI/pull/112) | `1b0db3247fdf188e2627b7fc47efecff29e643b6` |
| **P7** | Feeding broadphase now queries maintained prey, eggs, nutrient/carrion views; removes transient feeding-grid constructions | [#113](https://github.com/hernansgarro/vidAI/pull/113) | `db1ff0265dca0107508bf1b26b7156dbdf7d67c3` |
| **P8** | Optical broadphase now queries maintained individual food/carrion, eggs, body parts; removes transient optical index and count-only refresh | [#114](https://github.com/hernansgarro/vidAI/pull/114) | **`5fdc1b78d7c16132554bfcfe83375cf1142f42de`** |

### Important semantic and validation boundaries

- **P2:** guaranteed finite lifetime bounds require a maximum physical anchor-gap guarantee that the solver does not provide. P4 uses conservative *current-pose* envelopes and unconditional overflow/fail-open candidates instead of inventing an invalid global guarantee. See [P2 design/proof](https://github.com/hernansgarro/vidAI/blob/testing/docs/contributor-workspace/performance/CREATURE_ENVELOPE_P2.md).
- **P7:** two explicitly approved imported-food radius-growth controls produce additional legitimate feeding contacts that the old transient-index implementation missed. Against unchanged P6: **26/28 fixed cases** preserve complete state, with **239 compared states**; the two differences and conserved energy are recorded in [PR #113](https://github.com/hernansgarro/vidAI/pull/113). No global identity guarantee for those changed cases.
- **P8:** capped carrion growth can expand spatial membership without increasing nutrient count. P4 membership was already correctly updated; P7 optical transient index could still miss the newly occupied cells. P8 removes this false negative. Against unchanged P7: **41/42 fixed cases** preserve complete state, with **303 compared snapshots**; the one disclosed optical correction changes ray/neural state, not the feeding energy receipt. See [P8 contract](https://github.com/hernansgarro/vidAI/blob/testing/docs/contributor-workspace/performance/OPTICAL_GRID_P8.md) and [PR #114](https://github.com/hernansgarro/vidAI/pull/114). Historical baselines were not rewritten to hide these changes.
- **P8 final tested head:** `94e6e800c97fe8d6789c91a2290e94861e8ffa8d`. [Fast/build 41986260679](https://github.com/hernansgarro/vidAI/actions/runs/41986260679) (523/523), [Worker and browser 41986260474](https://github.com/hernansgarro/vidAI/actions/runs/41986260474) (Worker plus Chromium **48/48**, Firefox **53/53**, toolbar **16/16**, side-windows **5/5**, mandatory aggregate), and [locomotion 41986260533](https://github.com/hernansgarro/vidAI/actions/runs/41986260533) all passed. P8 [resumption and publish receipt](https://github.com/hernansgarro/vidAI/pull/114#issuecomment-6659261905) confirms the final testing merge tree matches the validated P8 tree, without another discretionary rerun. Earlier CI failures/harness fixes remain recorded in PR #114; green final CI does not erase them.
- **Scope:** P8 did **not** migrate physical contact pairs (P9), implement query-order/cache optimization (P10), measure performance (P11), or authorize `main`/upstream promotion (P12). No actual upstream Wiki publication is claimed.

## Still pending (no implementation confirmed at this checkpoint)

| Stage | Next bounded objective | Dependency / important gate |
| --- | --- | --- |
| **P9** | Migrate per-part physical-contact broadphase to maintained grid | Depends on P4/P5 and completed P7/P8 for integrated testing. Preserve substep/projection geometry and deterministic pair order; compare all physics/energy baselines |
| **P10** | Separately assess optical winner/tie ordering, safe feeding filters, and query-result caches | **Not** part of P7/P8. Prove exact semantics first; measure actual cost rather than assume removing sort is faster |
| **P11** | Owner visual approval and controlled `testing` versus `main` performance comparison | Follow original registered protocol/approval; no extrapolation from weighted allocation samples or unrelated CPU hosts |
| **P12** | Decide whether/how to promote verified outcomes | Explicit owner decision, fork-first clean integration; **no upstream PR without post-fork-main explicit authorization** |

**Immediate next action:** owner may authorize P9 as a new bounded implementation task after reviewing this checkpoint, using the verified P8 `testing` head `5fdc1b78…`. No code work, performance trial, promotion or new issue is authorized by this checkpoint alone.

## Continuity if ChatGPT conversations cannot be accessed

The contributor experienced intermittent ChatGPT Work/chat availability issues on 2026-11-05. Their relationship to any platform-wide incident is **unknown**, and the problems may be temporary. The minimal, privacy-conscious operational incident record is [ChatGPT conversation continuity incident](../tracking/CHATGPT_WORK_CONTINUITY_2026-11-05.md). No screenshots, private conversation URLs, account usage, personal identifiers or third-party confidential content are stored in GitHub.

To resume without original chats: inspect `AGENTS.md`, this status file, the [original design](MAINTAINED_SPATIAL_GRID_DESIGN.md), the relevant fork PR's complete discussion and exact GitHub Actions run/head, and the [fork retry/stop policy](../procedures/WORK_CI_RETRY_BUDGET.md). Verify live heads and open work before taking any action. The original Work chat is **not** the authoritative record of merge, acceptance, publication or test results.
