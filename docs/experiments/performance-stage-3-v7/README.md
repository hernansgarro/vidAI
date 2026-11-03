# Stage 3.6 CPU/GC and reporting-cadence study

Research only; Stage 3 remains ongoing. This directory preserves the bounded one-shot Stage 3.6 evidence and its failures, if any. It authorizes no Stage 3.7 or Stage 4 implementation.

- `protocol.md`: preregistered design, definitions, source/base, workload, ordering, budgets and stops.
- `checkpoint30.json.gz`: exact Stage 3.5 authoritative starting checkpoint, with immutable source and compressed-reference hash.
- `pilot.json.gz`: full-state/settings/PRNG/energy logical-tick validity control.
- `C*`, `P*`, `D*`: short controls, untraced primary windows and separate traced diagnostics. Each window's `.json.gz` contains raw CPU/process/thread counters and browser observations. `*-trace.json.gz` contains original CDP trace data.
- `manifest.json.gz`, `ledger.json`, `summary.json`: original execution provenance, once-only progress, archive SHA256/lengths and numerical summaries.
- `findings.json`, `verification.json`: analysis-only derived measurements and integrity checks. Regenerate with `node scripts/performance-stage36/analyze.mjs`; this command never runs a simulation.
- `report.md`: scientific findings, causal limits and proposed next action.

Never rerun this spent batch to regenerate a report. The runner deliberately rejects existing scientific archives. A future study needs a new authorization, registration, evidence directory and budget.
