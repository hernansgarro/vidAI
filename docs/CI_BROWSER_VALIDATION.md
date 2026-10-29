# Browser CI validation policy (fork-only)

This contributor-side workflow guidance applies to `hernansgarro/vidAI`; upstream retains its own release and acceptance authority. Issue: https://github.com/smeagol44/vidAI/issues/123.

## Existing gates are preserved

- `.github/workflows/pages.yml` continues to run the regular fast tests and production build. Its optional manual extended checks are unchanged.
- `.github/workflows/performance-worker.yml` retains the real production Worker check and **all** previously selected Playwright commands, grouped into independent GitHub-hosted runners (one Playwright worker in each runner). The `browser-smoke` aggregate check succeeds only when the Worker and every browser shard succeed.
- `main` runs toolbar, focused Chromium and Firefox regression groups; `testing` also runs its separate side-window regression group and retains side-window screenshots.
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
