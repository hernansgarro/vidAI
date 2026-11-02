# Stage 1 existing measurements — registered protocol v1

Registered 2026-11-02 before dependency installation, build or measurement execution.
Target: fork main `3c737ac1bbf678915ebd945b6b5db8781a48831b`.
Canonical upstream main: `041362eefa64971d9038f4ad7ec4fd59a747d3ec` (ancestor).
Branch: `audit/performance-stage-1-2026-11-02` in hernansgarro/vidAI.
Authority: docs/PERFORMANCE_AUDIT_PLAN.md, Stage 1 only; user explicitly requests documentation PR and stops before Stage 2. No upstream writes, priority changes, testing modifications, merge, deployment or optimization.

## Questions and controls

1. What repeatable kernel throughput does the unchanged existing performance benchmark achieve here?
2. Are historical profiler references compatible? One attempt; stop on first failure and preserve error.
3. What do existing Worker, pacing, spatial and activity checks establish, without calling correctness a timing profile?
4. Can existing facilities isolate the reported glow slowdown? No causal claim without equivalent authoritative states and a supported observer control.

## Environment and execution order

Linux x86_64 virtual machine; Node v24.22.1, npm 11.9.0. CPU exposed as AMD EPYC 9V74, 9 online logical CPUs; cgroup quota 8 CPU equivalents, 8 GiB memory limit (host-visible RAM about 9.7 GiB). Power, thermal state, host contention and physical GPU unknown. This is not Hernan's Windows desktop. Capture OS, CPU, memory, cgroup, tool versions and git refs in raw/environment.txt. Browser installation/availability checked once; if absent, one bounded Chromium installation attempt permitted; no remote CI dispatch or full browser campaign.

Run sequentially; no simultaneous benchmark processes or other intentional CPU-intensive work. Inspection may continue only while dependency installation/build is running, not during timings.

1. `npm ci` (180s max), `npm run build` (120s max). Preserve outputs.
2. Three independent `npm run benchmark:performance` processes, in numbered order, each max 60s. Existing fixture seed82, 2400x1500, 15 balanced featured organisms, 78 plant food, 221 synthetic carrion, no inflow or mutation severity. `DEFAULT_SETTINGS` uses paid-work-v2/open economy and no nutrientCycle setting; **not current application defaults**. Exact settings from pinned source. Each process restores the same checkpoint, performs 10 warm-up ticks then 120 timed ticks twice. No additional unreported warm-up. Preserve both rounds and rounded integer ms. First round's equality flag establishes its reference; second asserts full final-state equality.
3. One `--baseline` execution against fork merge `e9662a6ef5307a3349ea1338489d755a1879c8b9` (only Markdown differs from target), max60s. Verify code/package-lock equality first. Existing baseline/current then current/baseline order and full-state assertion. This is an identical-code positive control, **not a historical optimization comparison**. Do not use upstream or old physics as a speed baseline.
4. Three independent `npm run benchmark -- --seed 4242 --seconds 3`, max60s each; external GNU time wall/user/system/max RSS. 180 ticks, no in-process warm-up; default settings, 18 organisms, 275 initial food, inflow15. Label process overhead and evolving world. No extra ecological campaign.
5. One `node --import tsx scripts/profile-performance.mjs . <scratch-output>` (60s). Four historical fixtures seed711, legacy-v0, up to34 animals/75eggs/272food/180carrion, 20warmup+120profiled ticks each, 500us requested samples. Frozen complete v0.31 hashes unchanged; stop immediately on first failed assertion. Do not recover unvalidated sampling percentages or claim later fixtures ran.
6. One component script run against the same identical-code baseline, max60s. Existing3 alternating rounds: 100k rectangle contacts,100k compiled deltas (96hidden, motor/sensory plasticity .8),300frames with10000unchanged lineage records. Existing warmups2000 component calls/20frames. Equality only for contact/deltas and lineage length; no whole-world equivalence claim.
7. One focused Node test invocation for performance-runtime, simulation-performance, worker-pacing, spatial-index, sight-broadphase and energy-activity (120s); one production-built `npm run test:worker` (120s). The latter includes an empty MAX world threshold >50x and selected exact continuation checks, but does not print throughput values. External process timings are harness durations, **not Worker ms/tick**.
8. Browser conditional: if local Chromium exists or the single install succeeds, run at most two existing focused Worker/fallback browser tests (180s total), preserving raw pass/fail. No new browser harness or persistent instrumentation, CPU traces, modified clocks interpreted as FPS, or unsafe glow-off comparisons. Otherwise mark browser, fallback, FPS and responsiveness not measured.

## Units, summaries and limits

For120ticks and elapsedM milliseconds: ms/tick=M/120; ticks/s=120000/M; equivalent speed=2000/M (60Hz). Headless process: ticks/s=180/wallSeconds, equivalent speed=3/wallSeconds; explicitly includes startup/JIT/output. Describe median,min,max and population standard deviation across observations; split first/second rounds, since paired rounds are not six independent trials. No outlier exclusion, significance tests or guarantee. GNU time CPU seconds/user+system and RSS apply to the whole process; CPU% is process CPU/wall, not hardware-wide usage or isolated subsystem cost. No GPU/heap/GC/FPS measurement unless actually supported and executed.

Budget: at most 3 kernel +1 paired +3 headless +1 profiler +1 component executions,1 focused test invocation,1Worker harness,2browser cases; <=20min cumulative command wall budget, <=30min active campaign elapsed excluding documentation. Stop a command at its timeout; stop campaign after repeated invariant failure, resource exhaustion, changed runtime/base, or budget exhaustion. Preserve failures; no replacement trials, retries, baseline edits, cap changes or stopped scientific experiments. Browser download failure is not grounds for CI changes or unbounded retries.

## Evidence and completion

Raw stdout, stderr, exit codes and external process timings; initial settings/fixture source pinned by SHA. No new simulation instrumentation. Report workload coverage, future matrix, negative results, unknowns, Stage 2 questions and Stage 3 instrumentation candidates. Dedicated documentation-only fork PR, left open for Hernan's review. Upstream #67/#57 are read-only references; no duplicate issue or Project field mutation. Stages2–4 remain unstarted.
