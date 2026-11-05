# Maintained Spatial Grid — Fork Testing Implementation Status

> **Verified checkpoint: 2026-11-05 (Uruguay UTC-3).** Fork-only operational record, preserved in `hernansgarro/vidAI:main` so contributors can resume without relying on chat history. **This document is not a claim that the maintained grid is deployed in fork main or upstream production.**
>
> **Authoritative sources:** [original P0–P12 design and dependency plan](MAINTAINED_SPATIAL_GRID_DESIGN.md), [GitHub performance issue #67](https://github.com/smeagol44/vidAI/issues/67), [shared upstream handoff #57](https://github.com/smeagol44/vidAI/issues/57), fork PRs linked below. The GitHub PR/commit/CI history is the authoritative evidence for each delivery; this file is a concise cross-PR index, **not a parallel canonical issue backlog**.

## Exact branch and publication state

| Branch/site | Verified state on 2026-11-05 |
| --- | --- |
| Fork `main` **before this documentation update** | `8a884c3549213e43d89f03add29acc6eabc5c377`: contributor documentation for P0–P8 and retry policy present; **P0–P9 runtime not integrated into main** |
| Fork `testing` | `7dc593236da08b87ec978e4b887ce9536d5ddb26`: **P0–P9** implemented, merged, and published |
| Testing deployment | [P9 automatic publication run 42065536729](https://github.com/hernansgarro/vidAI/actions/runs/42065536729): validation, independent main/testing assembly and deployment **SUCCESS**. [PR #117 final receipt](https://github.com/hernansgarro/vidAI/pull/117#issuecomment-6663525938) verifies the actual served P9 testing and unchanged main bundles (HTTP 200) |
| Fork production | Independently built from fork `main`; no P0–P9 runtime promotion or testing-to-main bulk merge |
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
| **P8** | Optical broadphase now queries maintained individual food/carrion, eggs, body parts; removes transient optical index and count-only refresh | [#114](https://github.com/hernansgarro/vidAI/pull/114) | `5fdc1b78d7c16132554bfcfe83375cf1142f42de` |
| **P9** | Physical per-part contacts now query maintained body-part candidates; removes transient contact cell maps/buckets/stamps, preserving pass-frozen pair order and solver | [#117](https://github.com/hernansgarro/vidAI/pull/117) | **`7dc593236da08b87ec978e4b887ce9536d5ddb26`** |

### Important semantic and validation boundaries

- **P2:** guaranteed finite lifetime bounds require a maximum physical anchor-gap guarantee that the solver does not provide. P4 uses conservative *current-pose* envelopes and unconditional overflow/fail-open candidates instead of inventing an invalid global guarantee. See [P2 design/proof](https://github.com/hernansgarro/vidAI/blob/testing/docs/contributor-workspace/performance/CREATURE_ENVELOPE_P2.md).
- **P7:** two explicitly approved imported-food radius-growth controls produce additional legitimate feeding contacts that the old transient-index implementation missed. Against unchanged P6: **26/28 fixed cases** preserve complete state, with **239 compared states**; the two differences and conserved energy are recorded in [PR #113](https://github.com/hernansgarro/vidAI/pull/113). No global identity guarantee for those changed cases.
- **P8:** capped carrion growth can expand spatial membership without increasing nutrient count. P4 membership was already correctly updated; P7 optical transient index could still miss the newly occupied cells. P8 removes this false negative. Against unchanged P7: **41/42 fixed cases** preserve complete state, with **303 compared snapshots**; the one disclosed optical correction changes ray/neural state, not the feeding energy receipt. See [P8 contract](https://github.com/hernansgarro/vidAI/blob/testing/docs/contributor-workspace/performance/OPTICAL_GRID_P8.md) and [PR #114](https://github.com/hernansgarro/vidAI/pull/114). Historical baselines were not rewritten to hide these changes.
- **P8 final tested head:** `94e6e800c97fe8d6789c91a2290e94861e8ffa8d`. [Fast/build 41986260679](https://github.com/hernansgarro/vidAI/actions/runs/41986260679) (523/523), [Worker and browser 41986260474](https://github.com/hernansgarro/vidAI/actions/runs/41986260474) (Worker plus Chromium **48/48**, Firefox **53/53**, toolbar **16/16**, side-windows **5/5**, mandatory aggregate), and [locomotion 41986260533](https://github.com/hernansgarro/vidAI/actions/runs/41986260533) all passed. P8 [resumption and publish receipt](https://github.com/hernansgarro/vidAI/pull/114#issuecomment-6659261905) confirms the final testing merge tree matches the validated P8 tree, without another discretionary rerun. Earlier CI failures/harness fixes remain recorded in PR #114; green final CI does not erase them.
- **P9:** final tested head `0688e2b09c0ec1c2d8ca0a37f9e2ef44e23d518e`, merge `7dc593236da08b87ec978e4b887ce9536d5ddb26`. Against untouched P8, **48 fixed scenarios, 333 complete snapshots across 285 ticks and 100,069 mechanical observations** including **16,659 impulses** preserve full state, ordered events/energy, pair and mechanical traces. [Validate 42063699026](https://github.com/hernansgarro/vidAI/actions/runs/42063699026) (577/577 fast, build); [Worker/browser 42063698797](https://github.com/hernansgarro/vidAI/actions/runs/42063698797) (actual Worker, Chromium **52/52**, Firefox **57/57**, toolbar **16/16**, side windows **5/5**, aggregate); [locomotion 42063698813](https://github.com/hernansgarro/vidAI/actions/runs/42063698813) all passed. [Final deployment 42065536729](https://github.com/hernansgarro/vidAI/actions/runs/42065536729) passed with served-bundle readback. The two *additional owner-authorized* harness correction cycles were fully used (four total); zero unchanged CI retries. Earlier failures remain in [PR #117](https://github.com/hernansgarro/vidAI/pull/117); no new performance claim. [P9 contract](https://github.com/hernansgarro/vidAI/blob/testing/docs/contributor-workspace/performance/CONTACT_GRID_P9.md).
- **Scope:** P9 did **not** implement query-order/cache optimization (P10), measure controlled performance (P11), or authorize `main`/upstream promotion (P12). No actual upstream Wiki publication is claimed.

## Still pending (no implementation confirmed at this checkpoint)

| Stage | Next bounded objective | Dependency / important gate |
| --- | --- | --- |
| **P10** | Separately assess optical winner/tie ordering, safe feeding filters, and query-result caches | **Not** part of P7/P8. Prove exact semantics first; measure actual cost rather than assume removing sort is faster |
| **Proposed P10.5 checkpoint** | Static/runtime residual spatial-work inventory and controlled empty-world speed investigation *after P10* | **Proposed, not implemented or authorized.** [Pre-P11 source review](SPATIAL_GRID_PRE_P11_REVIEW.md) documents remaining roster-wide `synchronize()` scans and legacy files; measure and evaluate their actual cost before declaring a regression |
| **P11** | Owner visual approval and controlled `testing` versus `main` performance comparison | Follow original registered protocol/approval; no extrapolation from weighted allocation samples or unrelated CPU hosts |
| **P12** | Decide whether/how to promote verified outcomes | Explicit owner decision, fork-first clean integration; **no upstream PR without post-fork-main explicit authorization** |

**Immediate next action:** scope P10 independently from verified P9 `testing` head `7dc593236da08b87ec978e4b887ce9536d5ddb26`. The owner also requested a source review of apparent empty-world performance. [This documented P10.5 proposal](SPATIAL_GRID_PRE_P11_REVIEW.md) is a **future optional gate after P10, before P11**, requiring separate authorization, not an already-run comparison or permission to tune. No new implementation, simulation tests, performance experiments or upstream/main runtime promotion are authorized by this documentation.

## Continuity if ChatGPT conversations cannot be accessed

The contributor experienced intermittent ChatGPT Work/chat availability issues on 2026-11-05. Their relationship to any platform-wide incident is **unknown**, and the problems may be temporary. The minimal, privacy-conscious operational incident record is [ChatGPT conversation continuity incident](../tracking/CHATGPT_WORK_CONTINUITY_2026-11-05.md). No screenshots, private conversation URLs, account usage, personal identifiers or third-party confidential content are stored in GitHub.

To resume without original chats: inspect `AGENTS.md`, this status file, the [original design](MAINTAINED_SPATIAL_GRID_DESIGN.md), the relevant fork PR's complete discussion and exact GitHub Actions run/head, and the [fork retry/stop policy](../procedures/WORK_CI_RETRY_BUDGET.md). Verify live heads and open work before taking any action. The original Work chat is **not** the authoritative record of merge, acceptance, publication or test results.
