# Stage 3 original evidence (v1)

Target11248f3431604a1b883a7a948a6e6baddc3fafdd; no production optimization.
Protocol: https://github.com/smeagol44/vidAI/issues/57#issuecomment-6587965264.
Interpretation and limitations: [Stage 3 report](../../PERFORMANCE_AUDIT_STAGE_3.md).

- `*-checkpoint.json.br`: exact complete initial checkpoints, lossless Brotli JSON.
- `*-(baseline|diagnostic|no-observer)-[123].json.gz`: original measurement rows,
 600 tick timings,10 periodic full-state hashes, inventories, receipts, components,
 process CPU/heap, probe counters/phase times. Empty GC event arrays are invalid
 telemetry, not zero-GC proof.
- `*.cpuprofile.json.gz`: original V8 profiles, including harness snapshots and
 inspector overhead. Subtracting only convenient samples cannot establish an
 uninstrumented end-to-end budget; use the report's denominators.
- `executions.jsonl`, `campaign.log.gz`: all30 process outcomes/order/wall budget.
- `summary.json`: derived quantiles/phase shares/profile attribution; regenerate
 without simulation using `node scripts/performance-stage3/summarize.mjs`.
- `environment.json`, `source-equivalence.json`: source/hardware and disclosed
 build overlap. CPU power/host contention and allocation/retention unknown.
- `npm-ci.log.gz`, `build.log.gz`, `test-fast.log.gz`, `test-worker.log.gz`:
 installation/regression evidence, not experimental CPU benchmarks.
- `browser-original.json.gz`: original emitted browser checkpoint/state, all six
 frame series and full CPU profiles recovered from the successful CI stdout,
 without rerunning a trial. `browser-summary.json` is derived by
 `node scripts/performance-stage3/summarize-browser.mjs`.
- `ci-receipts.json`: exact tested commit, job IDs/results and original log digest.
- `manifest.json`: SHA256 archive inventory; verify with the evidence-only script.

Decode without running a trial:

```js
import {readFileSync} from 'node:fs';
import {brotliDecompressSync, gunzipSync} from 'node:zlib';
const checkpoint = JSON.parse(brotliDecompressSync(readFileSync('founders15-checkpoint.json.br')));
const row = JSON.parse(gunzipSync(readFileSync('founders15-baseline-1.json.gz')));
```

Exactness verification (no benchmark, no source-state regeneration):

```sh
node scripts/performance-stage3/verify-evidence.mjs
```

Never delete or overwrite these trial archives to bypass exclusive output checks.
New scientific trials require a separately recorded budget/output version.
