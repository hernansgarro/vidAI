# Fork Work/CI retry budget, stop gates and owner handoffs

> **Fork contributor policy, 2026-11-05.** Applies to work executed on `hernansgarro/vidAI` in ChatGPT Work or equivalent agents. It supplements, but does not override, upstream `AGENTS.md`, fork `AGENTS.md`, existing branch rules, tracked experimental budgets, required checks, or the release workflow. General operational lessons belong here; individual incident logs belong in their original fork PR/issue/CI evidence, not in a new mirrored backlog.
>
> **Goal:** provide clear evidence, bounded retries and an owner decision before repeated CI/browser troubleshooting consumes substantial resources without progress. This policy is not permission to weaken quality gates or avoid fixing real regressions.

## Owner amendment — 2026-11-05

The owner raises the default targeted harness/environment correction allowance
from two to **three cycles per bounded task**, effective for future work. Preserve
historical incident accounting and independently authorized task-specific budgets.
An explicit additional allowance extends that task's recorded total; it does not
reset used cycles or also add the new default. The single unchanged failed-job
retry, mandatory exact-head gates and all stop/evidence rules remain unchanged.

## 1. Work budget and early checkpoints

At the start of a bounded feature, record the source/branch/expected head, exact required test gates, diagnostic scope, and any special registered experiment budget in its existing tracking issue/PR. Keep implementation, test-harness, and performance/experimental scopes separate.

When a check fails:

1. Preserve the **original** failing run/job/test, artifact/log link, head SHA, failure category and first failure point before any retry or edit. Never call an in-progress or skipped check a pass.
2. Give the owner a concise progress checkpoint **when a repeated or material failure first appears**, with current evidence, affected gate, what remains green, and planned diagnostic next step. If the user cannot receive messages in the active interface, persist an English checkpoint in the existing fork PR/issue before performing another costly action.
3. Read completed CI logs and the actual failure step. Prefer local source/log investigation and a narrow, reproducible diagnostic over another full browser matrix.
4. **Default unchanged retry allowance: at most one** retry of the specifically failed job(s) for a plausibly transient environmental failure **in the bounded task**, not one retry per continually appearing test. Never rerun successful shards merely to replay one failed shard. A repeated failure at the same code/head triggers diagnosis rather than further unchanged retries.
5. **Default correction budget: up to three distinct, targeted test-harness/CI-environment correction cycles per task**, each with a stated hypothesis, minimal change, validation of the affected test, and evidence. Count a correction cycle when the agent edits and tests its proposed resolution; changing a file does not reset the budget. Preserve CI and incident logs across all cycles.
6. After a source or test change, do not borrow earlier green checks from a different head: run the required **exact-final-head** gates. Prefer narrow checks during diagnosis, then the required full validation once when the candidate is ready. If a further failure would exceed the correction budget, record the result and stop for owner guidance rather than automatically creating a fourth cycle.

These defaults are intentionally conservative. An owner may authorize another *specific*, bounded diagnostic action with a reason, expected evidence, and a fresh stop condition. Generic "continue", retries automatically performed by CI, and an open browser spinner are **not** implied authorization for unlimited reruns. If an explicitly preregistered scientific experiment budget is stricter, obey that budget and do not rerun or substitute trials.

## 2. Failure classification and stop conditions

Distinguish and report:

- **Product/runtime regression:** invariant, energy, physics, simulation state, genetic semantics, optical output, snapshot continuation, or cross-engine deterministic result differs from the accepted reference. Stop promotion and investigate as a genuine code defect; do not treat as mere flakiness.
- **Test harness race or browser interaction issue:** stale world epoch, Worker message ordering, missing download event, synthetic gesture, actionability, camera settling, environment readiness. Demonstrate where the product request completed versus which browser assertion or event failed; retain the original assertion.
- **Infrastructure/environment interruption:** CI capacity, browser installation/cache, missing credentials/tool permissions, transient network or service access. Record what the evidence proves and what remains unknown; do not repeatedly install browsers in disposable environments where pinned browser CI already exists.
- **Unknown or recurring cross-shard failure:** classify as unresolved until reproduced or isolated. Never attribute cause solely to "too short a timeout" without evidence.

Stop and ask the owner for a decision **before** additional expensive retries when any applies:

- The unchanged retry allowance or three targeted correction cycles is exhausted.
- The same check repeatedly fails with no new causal evidence, or a new test repeatedly moves the failure without isolating it.
- The development environment/Work conversation becomes unavailable, state cannot be verified, or the intended next tool action would be repeated on guesswork.
- A mandatory gate remains red/unknown, historical references diverge, a registered experiment stop is reached, or permissions/merge authority are unclear.
- The next step requires disabling/skipping a check, increasing timeouts/tolerances, changing CI coverage, altering release protections, refreshing a baseline, introducing different physical rules, or promoting incomplete evidence. These demand **separate, explicit owner authorization and review**; ordinary retry permission does not suffice.

A timeout increase may be proposed only with measured readiness evidence and a focused justification, not as an automatic failure mask. A test correction must preserve its meaningful original checks (including ordering, full-state assertions, camera expectations, energy, PRNG and snapshots) and show what race it fixes. If an owner wants to quarantine a flaky test, document that as a separately authorized incomplete-validation branch; **never present mandatory gates as passed or release/promote contrary to branch/release rules**.

## 3. Mandatory checkpoint/report template

Use a short Spanish update to the owner, with a durable English GitHub record where relevant, after the first material repeated failure and at the stop gate. The report must cover:

| Field | Required content |
| --- | --- |
| Task and exact state | PR/branch, tested head SHA, target base, merged/published or NOT merged/published |
| Gate outcome | Passed / failed / running / skipped for fast, build, Worker, each browser shard and aggregate; links to evidence |
| Attempts/budget | Distinguish initial runs, unchanged retries, targeted correction cycles, completed/successful checks and remaining allowance |
| Failure evidence | First failing test, phase, exact symptom, error/log/artifact URL, whether product invariant was actually reached |
| Hypothesis and learning | Proven cause vs hypothesis; what changed, what it established, whether the same failure recurred |
| Safety | Historical/current baselines, tests not skipped/weakened, physics/determinism/energy/output untouched or exceptions explicitly approved |
| Next action/options | Narrow diagnosis, a bounded approved retry, pause with draft work preserved, defer promotion, or require owner decision |
| Resource transparency | Exact recorded workflow runs/jobs and diagnostic attempts; do **not** invent unavailable ChatGPT-credit counts or cost estimates |

Explain any material environmental problem before initiating another browser installation, lengthy test campaign, or repeated full-suite run. If the chat UI becomes unusable, leave a final up-to-date durable PR comment naming the next action and current gates; do not perform further discretionary work beyond an already approved bounded action.

## 4. Evidence, compatibility and promotion

- Preserve reproducible PR/issue comments and CI run/artifact links. Do not overwrite the failed evidence or call later green tests proof that prior failures never occurred.
- Capture reusable lessons in this procedure rather than duplicating private account details, chat screenshots, or all incident logs in upstream/shared product documentation.
- Continue to run `npm run test:fast`, `npm run build`, `npm run test:worker` for Worker changes and the relevant mandatory Chromium, Firefox, toolbar, side-window and browser-smoke checks before a fork merge/publication where required. The project-specific CI gates outrank the retry budget.
- Prefer remote pinned Playwright/browser CI already configured. Use a local browser if genuinely needed to isolate a failure and the environment supports it; no indefinite installation attempts or entire manual browser campaigns.
- Compare against the exact recorded prior accepted baseline. Never silently change physical selection, feeds, energy accounting, optics, fixed-tick behavior, snapshots or test expectations. Preserve known/approved exceptions with their own causal evidence.
- **Green CI is necessary but not sufficient for a merge:** inspect unchanged base/head, protected-branch rules, authorization, the full diff and the outstanding owner checkpoints. If the agent stalled after green CI, resume from current GitHub evidence rather than automatically restarting work, rerunning every check or merging without verification.
- A documentation-only rule update needs readback, language/link/diff review; it does not justify a full simulation/browser campaign or an experiment rerun.

## 5. Owner decision examples

At a stop gate, offer concrete choices without taking one silently: (a) preserve the draft and pause; (b) authorize one additional **specific** diagnosis with a bounded run budget; (c) review and correct the test harness while preserving assertions; or (d) investigate whether the CI/service infrastructure is degraded. Skipping a required test is **not** equivalent to accepting a feature and must not be represented as a fully validated promotion.

No P8 runtime changes, extra P8 retries, merges, upstream submissions, deployment changes or experimental reruns are authorized by this document. Its acceptance is limited to the new **fork-only operational policy**.
