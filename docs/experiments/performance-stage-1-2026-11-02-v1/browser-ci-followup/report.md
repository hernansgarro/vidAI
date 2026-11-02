# Stage 1 browser-validation follow-up — 2026-11-02, v1

## Authorization, boundary and procedure

Hernan explicitly requested revisiting the browser point after changing the execution policy. This follow-up applies the current fork policy at `bf75b5649c6d843c48586acca59c51830678e316`: prefer existing GitHub Actions browser evidence, use the version-pinned Playwright container, do not routinely download local Chromium to duplicate successful CI, and preserve every required gate.

Policy sources: [AGENTS.md](https://github.com/hernansgarro/vidAI/blob/bf75b5649c6d843c48586acca59c51830678e316/AGENTS.md), [contributor workflow](https://github.com/hernansgarro/vidAI/blob/bf75b5649c6d843c48586acca59c51830678e316/docs/CONTRIBUTOR_WORKFLOW.md). Upstream main remains `041362eefa64971d9038f4ad7ec4fd59a747d3ec`. The original Stage 1 runtime and measurements remain pinned to `3c737ac1bbf678915ebd945b6b5db8781a48831b`.

Bounded procedure: inspect current rules and CI results, verify source equivalence and suite membership, reuse one existing successful run when sufficient, preserve its logs and conclusions, and update the same fork PR. No new simulation campaign, workflow dispatch, local browser download, code/CI change, Stage 2 analysis or Stage 3 instrumentation. No upstream write, merge or deployment. No new expensive execution was necessary.

## Resolution and provenance

**The browser installation obstacle has a verified CI workaround.** Existing [Worker integration smoke run 41504774006](https://github.com/hernansgarro/vidAI/actions/runs/41504774006) completed successfully on the reviewed container procedure. It already covers the two planned energy-contour cases, Worker and main-thread fallback, in both Chromium and Firefox.

This is deliberately **reused evidence**, not a newly executed browser trial or a browser check on the documentation PR's exact SHA:

- Workflow event: pull_request, attempt1, source PR #62, branch `ci/playwright-preinstalled-browsers`, head `a4554405797c0f09a790c6f8ed0341ec57a02a7e`.
- The logs show the **actual tested checkout** `refs/remotes/pull/62/merge`, commit `97f53e11582dbb88520d65830417ae7c2c99814d`.
- Both head and actual merge were compared against audit runtime `3c737ac`. The complete diffs contain only `.github/workflows/performance-worker.yml` and three planning Markdown files. **Application, Worker, simulation, browser test files/configuration, styles, assets and dependency lockfile are unchanged.** See [head comparison](raw/source-comparison-head.json) and [tested-merge comparison](raw/source-comparison-tested-merge.json).
- Container: `mcr.microsoft.com/playwright:v1.58.2-noble`, pulled digest `sha256:6446946a1d9fd62d9ae501312a2d76a43ee688542b21622056a372959b65d63d`; browsers preinstalled under `/ms-playwright`. Node v24.22.1; one Playwright worker per shard. Job logs show chromium1208 and firefox1509 directories.
- Installed Playwright1.58.2's registry maps these revisions to Chromium145.0.7632.6 and Firefox146.0.1. These are **registry-declared versions**, not a separately captured `browser.version()` measurement. The image/node/build/test command evidence is retained in the job logs.
- The glow tests declare viewport1280x850 and import the same controlled energyActivityFixture. Actual physical display, pixel/DPR/camera observations, runner CPU/RAM, GPU mode and power/thermal state are not captured here. Do not equate CI rendering with Hernan's desktop.

## Verified results

| Job | Job ID | Final result | Browser test outcome |
| --- | ---: | --- | --- |
| Chromium regressions |125481140647|Success|31 passed, including energy activity Worker/fallback |
| Firefox regressions |125481141092|Success|36 passed, including energy activity Worker/fallback and side-window cases |
| Side windows |125481140668|Success|5 passed |
| Toolbar |125481140706|Success|16 passed |
| Actual production Worker |125481139944|Success|Built-worker state/transport/regime checks passed |
| Mandatory browser-smoke aggregate |125486010922|Success|Requires Worker and every browser shard to succeed |

**88 browser cases passed** across four shards; no skipped shard is counted as success. [jobs.json](raw/jobs.json) retains native conclusions, not just an overall green badge. The aggregate log explicitly reads `WORKER_RESULT: success` and `BROWSER_RESULT: success`. Full decoded job logs are retained under [raw/](raw/). A nonfatal concurrent npm-cache reservation warning remains in the browser logs; it did not fail tests.

The reused run started18:53:18UTC and completed19:02:34UTC. Chromium's suite reports8.4minutes, Firefox5.2, side windows3.7, toolbar3.1. **These are test-harness durations**, with software rendering, fixture import/export, waits/assertions and startup. They are not game FPS, frame time, throughput or causal glow costs. The Worker job also contains an empty-MAX number; it is not pooled with the original VM timing dataset or interpreted as a desktop improvement.

Suite membership was checked without executing a browser via:

```sh
npx playwright test e2e/energy-activity.spec.ts --grep 'energy contour glows' --list
```

[The retained output](raw/selected-test-list.stdout) lists exactly two cases: `energy contour glows follow real body paths and freeze at x0 (Worker)` and `(fallback)`. The Chromium command explicitly includes that file; Firefox's unchanged config includes it too. Both full suites passed, so the four engine/mode combinations are covered. Individual per-test durations are not printed by this CI reporter; suite membership plus unchanged source/commands and complete suite success are the evidence, not invented individual test receipts.

## What this closes and what remains open

**Confirmed, bounded:** the reviewed app/test code runs successfully in real Chromium and Firefox; controlled real feeding/predation paints the expected body-path glows, freeze/resume and observer behavior in the tested Worker/fallback cases. The full suites additionally cover commands, exports, presets, layouts and local tubes. The container procedure avoids the failing per-runtime browser archive installation.

**Still not measured:** browser FPS, UI/input latency, CPU split between main/Worker, per-pass Canvas/compositor/GPU cost, memory/GC, equivalent-state glow-on/off performance, or a representative populated current-settings Worker capacity curve. The successful functional glow checks **neither confirm nor refute that glow causes Hernan's slowdown**. No supported safe draw-only performance control or new instrumentation was added.

The original local Chromium failure and all Stage1 raw timings/errors remain preserved. Statements in the original report about a blocked browser apply to its original local campaign; this follow-up supersedes the absence of functional browser validation through source-equivalent CI. It does not turn those old failures into successes, certify an unexecuted exact documentation head, or fill the remaining profiling gaps.

No fresh full suite was launched because the policy explicitly favors reading and reusing adequate existing evidence. Exact-final-candidate branch-protection checks remain required for any future merge; reused source-equivalent evidence does not bypass them. Fork PR #61 stays open/unmerged. Stage2–4 remain unstarted; await Hernan's review.
