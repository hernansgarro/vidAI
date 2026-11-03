# Reproduction and evidence interpretation

This is research, not a production optimization. Do not automatically repeat an executed or failed scientific slot. A new run requires its own recorded authorization, fixed source/checkpoints, fresh output version and resource budget. The original Stage3.3 missing outcome remains unknown.

## Exact original source
Use the Stage3.4 experimental commit recorded in report/manifest. Its temporary final import in e2e/energy-activity.spec.ts registered scripts/performance-stage34/browser.ts in the existing Chromium-only CI job. The final branch restores the inherited spec byte-for-byte, so normal CI cannot repeat the spent batch. No workflow changes are required.

The builder creates two isolated build directories through programmatic Vite plugins: control (original runtime, separate fixture entry only) and diagnostics (same sources with coarse timers/counters). It does not edit runtime files. Original production build output and imports are unchanged. Worker and main modules use separate realm-local diagnostic objects. All phase times are wall durations, not OS thread CPU utilization.

## Required prerequisites and ordinary checks
Node matching package engines, npm ci, compatible preinstalled Playwright1.58.2 Chromium. Run npm run test:fast, npm run build and npm run test:worker for ordinary validation. Never reinterpret these checks as performance trials. Keep inherited Worker/browser gates.

For a newly authorized run, create an explicit standalone Playwright configuration selecting only scripts/performance-stage34/browser.ts, one worker, zero retries and the registered timeout; point output/evidence to a NEW versioned empty directory before execution. Do not restore the temporary regression import on an active PR merely to trigger another already-spent campaign. Preserve the exact final source and original checkpoint inventory.

## Measurement boundaries
The amended inclusive budget is4short overhead controls +12MAX windows +4single-repetition0x/5x windows =20measured windows total. Primary trials use2s playback warm-up, stop, re-import the original full authoritative checkpoint and then10s measured playback. Warm-up trajectories are intentionally discarded BEFORE measurement; JIT/cache effects remain. On/off variants differ only in snapshot observerPreferences.showCaustics; selected/track defaults stay false. Original imported state/settings equality is checked each time. The original source uses the regular control buttons and frame/ACK path.

Worker diagnostic start/end commands execute between complete ticks; initial/final snapshots are outside the diagnostic timer arrays. Active ticks/s is completed ticks divided by Worker wall time from first nonzero control receipt to end-command handling.0x uses the complete paused interval. Startup-to-control delays must be reported separately. Independently verify completed ticks from authoritative simTime×60, within floating-point rounding. Main FPS uses actual drawn RAF timestamp intervals; callback wall time includes deferred native raster blocking.

Original-build short controls use authoritative snapshot deltas and main-thread midpoint timestamps around request/response. This boundary differs from diagnostic Worker boundaries and can include queue/boundary error. The controls price added instrumentation/build-layout effects approximately, not a pure nanosecond timer tax. Both retain matched browser Worker/Canvas/RAF wrappers; no fully pristine browser baseline is claimed.

Frame construction, postMessage synchronous wall time, receive/apply/callback, ACK turnaround and pump yield gaps are distinct measurements. Do not sum overlapping inclusive phases or confuse queue latency with synchronous clone work. JSON UTF-8 length is an off-hot-path payload estimate, not actual structured-clone transport bytes. Warm selected/unselected host-frame construction is a paused100-sample component control, not an inspector gameplay contrast.

Cross-thread frame timestamps are retained raw. Clock-exchange rows bracket each main interval and provide Worker-minus-main offset bounds: [workerNow-mainReceive, workerNow-mainSend]. Any midpoint offset has uncertainty at least half that round-trip; worker frame timestamp precedes serialization. Treat derived send-to-receive latency as serialization+queue+dispatch, not pure IPC. ACK turnaround and batch gaps need no cross-thread subtraction.

## Evidence integrity and analysis
Every pilot/control/trial is exclusive-created, fsynced, re-read and SHA256-verified before the next dependent trial; compressed originals are also emitted as numbered base64 log parts followed by independent receipts. Preserve the original log and all partial outcomes. Reassemble parts by name/index, check contiguous indices/no inconsistent duplicates, decode, verify byte length/SHA256 and decompress. Do not obtain “missing” trials by rerunning them.

For summaries use medians/ranges of the two independent windows per configuration. Frame/tick samples within a window are correlated. p95/p99 require at least100retained samples and are descriptive, not confidence intervals. Report changes in ticks/s separately from display FPS. Baseline/diagnostic phases are not additive CPU budgets.

The machine offers only the recorded graphics backend. A named GPU process or graphics API does not establish physical hardware acceleration. Thermal/power state, external host contention, OS per-thread CPU attribution, GPU utilization, GC attribution and long-run retained heap remain unknown unless directly evidenced. Short JS heap samples after snapshot operations are not a leak test.

## Stop
No automatic Stage3.5/Stage4, new visualization toggle, simulation change, main/testing merge, upstream PR or release. The next bounded proposal is for owner review only.

## Final recovery and analysis correction
The first19-window log read was partial while the job was still in preservation. Final completed-log recovery obtained all20windows plus component/manifest. Use summary-final.json; summary.json/summary-compact.json retain the first partial analysis for provenance only. For short original controls use retained mainStart→final snapshot-exchange midpoint; the earlier snapshot-to-snapshot interval included494–626ms of paused transfer to the controller and its apparent8.9% speedup is invalid. Corrected approximate medians565.37original/563.47diagnosticTPS differ−.34%, within boundary/run variation. UI and Worker collection intervals remain distinct.

The final optional measurement runner refuses existing archive directories BEFORE preparation. To analyze saved data without simulation or Git writes, run `node scripts/performance-stage34/analyze.mjs` and redirect stdout to a NEW file if desired. The exact executed source remains c997001; final harness changes add only an upfront evidence guard and a trusted-checkout Git metadata fix. No new scientific run validated those safety guards.
