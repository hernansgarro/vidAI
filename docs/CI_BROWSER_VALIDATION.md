# Browser CI validation

Tracking: issue #123; integrated through #131 and #132. The workflow preserves
every accumulated canonical Worker/Chromium/Firefox case and its assertions.
It runs the production Worker independently and uses four browser groups on
separate GitHub-hosted runners: toolbar geometry, side-window/tube controls,
Chromium regressions, and Firefox regressions including tube scenarios. Tube controls and
the observer mask are therefore exercised in both engines. Each runner keeps one Playwright worker to
avoid software-rendering contention. `fail-fast: false` retains all results.

The required `browser-smoke` name remains an aggregate. It succeeds only when
the Worker and every browser shard succeed. No skipped/failed dependency can
make the aggregate green. Permissions, dependency installation, branch
protection, Pages publication and scientific baselines are unchanged.

Run fast tests and build while developing. Use focused browser checks for UI
changes and the actual built Worker for kernel/command/persistence changes.
Before merge, review all required checks on the exact candidate. A YAML edit
alone is not evidence of a speed improvement. Separate runners reduce serial
waiting but can increase total runner-minutes; do not claim better game FPS.
Do not repeat full campaigns after prose-only edits unless required checks or
new concerns call for them. Never shorten assertions or refresh baselines to
hide failures. Use recorded run links rather than repeatedly polling slow jobs.

The final v0.39.0 integration passed all 76 browser cases (16 toolbar, five
side-window, 25 Chromium and 30 Firefox), the actual Worker gate and the required
aggregate in run 41287349596. Fast/build and standing locomotion checks also
passed. Exact candidate, merge and publication receipts are maintained in #57.
Production main and independent testing remain separate checkouts; parallel CI
does not authorize promoting testing features or resetting its baseline.

## Preserved contributor validation guidance

# Contributor validation history

This contributor-side workflow guidance applies to `hernansgarro/vidAI`; upstream retains its own release and acceptance authority. Issue: https://github.com/smeagol44/vidAI/issues/123.

## Existing gates are preserved

- `.github/workflows/pages.yml` continues to run the regular fast tests and production build. Its optional manual extended checks are unchanged.
- `.github/workflows/performance-worker.yml` retains the real production Worker check and **all** previously selected Playwright commands, grouped into independent GitHub-hosted runners (one Playwright worker in each runner). The `browser-smoke` aggregate check succeeds only when the Worker and every browser shard succeed.
- Both fork environments run the same four groups: side-window/tube checks (with screenshots), toolbar checks, focused Chromium regressions and Firefox regressions. The independent Worker gate and mandatory aggregate check cover both environments.
- GitHub branch protection and release requirements are never bypassed. A required browser check must pass against the **exact candidate commit**; earlier commits and visually similar edits do not count.

## Right-size validation while developing

| Change category | First-pass verification | Before merge or release |
| --- | --- | --- |
| Documentation-only | Review changed documentation/links; do not rerun a simulation campaign merely for prose | Existing required status checks for the PR |
| Static copy, icons, small UI styles | `npm run test:fast`, `npm run build`; focused Chromium check when rendering or interaction is affected | Applicable required browser groups and existing release gates |
| Canvas layers, responsive layout, camera, navigation, selection, tubes | Fast/build and relevant focused browser checks; both engines where behavior/graphics can differ | Complete required browser/Worker gates for the final commit |
| Worker, physics, energy, feeding, genetics, saves or ecology | Fast/build, `npm run test:worker`, applicable regression/baseline checks | Required browser, Worker, determinism and release controls; disclose material behavioral changes |
| Workflow/CI changes | Verify workflow structure, matrix, command coverage, required check names and job aggregation | Execute the affected workflow at the candidate commit and review every shard |

## Work scheduling

1. Run short checks promptly and push a stable candidate early enough for GitHub Actions to start while documentation, independent review and PR description can proceed.
2. Do not wait by repeatedly polling a slow job. Record its run URL and check the final conclusion when a merge or release decision depends on it.
3. Do not relaunch the complete suite after a non-code change when successful evidence already matches the exact tested commit; however, a **new** commit always needs the status checks required by branch protection.
4. Browser jobs run concurrently on separate runners. Avoid `--workers>1` within a runner because the full-tank Canvas software renderer can saturate its resources. Do not remove tests, shorten meaningful assertions or refresh baselines to hide a failing gate.
5. A `workflow_dispatch` run remains available for an explicit extra check, not as a default second pass after every ordinary successful PR run.

## Baseline and limitations

The old serial browser workflow for testing PR #40 (2026-10-29) took approximately 14 minutes for 5 side-window, 16 toolbar, 25 Chromium general and 23 Firefox scenarios; the independent fast/build workflow took approximately 34 seconds. Sharding should reduce wall-clock latency but can consume more total runner-minutes, especially if jobs install dependencies independently. Record measured new durations after successful CI. Never claim improved runtime or released behavior based only on the YAML change.

Production/main and experimental/testing remain independent. Never merge `testing` wholesale into `main`. Fork validation/merge does not authorize an upstream PR, upstream merge or release.
