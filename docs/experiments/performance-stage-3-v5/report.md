# Stage 3.4 — faster drawing did not increase actual Worker throughput

**Bounded batch COMPLETE; Stage3 remains ONGOING.** All20measured windows, the retained pilot and the selected-frame component are preserved. No missing Stage3.4 scientific outcome remains. This is fork-only research, not a production optimization or a desktop performance promise.

## Result

Turning off the shipped caustics setting raises software-CI display from roughly4–5FPS to58–59FPS, but MAX Worker ticks/s fall in all six matched pairs. The median decreases are6.67%/11.66%/8.50% for5/15/30starting organisms. At requested5x, both variants achieve299.82ticks/s (~4.997x) despite very different FPS. The Worker therefore progresses independently of slow rendering/ACKs; higher display FPS is not evidence of higher simulation throughput.

The intervention changes both rendering work and the rate at which backpressure permits frame reports. It does NOT isolate serialization, cache/memory contention, scheduling or garbage collection as the cause of the MAX decline. Two windows/configuration are descriptive, not confidence intervals. No new production performance claim is justified.

## Source and environment

- Pinned fork/main at preregistration: `3e7319e9d81f86a026bcb5746512fbc1b435b5d8`, includes caustic visibility PR68.
- Measured research source: `c997001bceb7e268f03e4d649121ec1c55c2207a`, standalone evidence-branch workflow [41637788308](https://github.com/hernansgarro/vidAI/actions/runs/41637788308), job125923264339. No synthetic PR merge for these windows.
- Final readback: fork/main advanced independently to `9bdbec6567d9cd59dca7ee22d78b02bd50323887` (scent/olfaction documentation only). Its runtime is unchanged from the pinned base. This study is not rebased or remeasured; testing4bda30a and canonical main041362e remain unchanged.
- Historical PR66/headc80b25ac391a409da6c321bbdfc5cb7bec447db9 remains immutable. Its v1–v4 results use older source and sometimes different machines; they are not paired controls here.
- Measured host: AMD EPYC9V74, Linux7.0.0-1017-azure, Node24.22.1, Chromium145.0.7632.6, official Playwright1.58.2 container. Pilot ran on a separate Intel Xeon8370C runner; do not mix its absolute timing with this machine.
- Actual backend confirmed by the measured run's CDP manifest: ANGLE/SwiftShader, software Canvas2D/raster/compositing, no hardware Vulkan. A GPU-process name does not establish physical acceleration.
- Viewport1280×850, backing canvas1280×674, DPR1, visible document. No camera input/tracking. The source-default camera remains; an independent world-transform trace was not collected. Thermal/power state, external host contention and reliable OS per-thread CPU/GPU utilization are unknown.
- Original runtime files, package/lock and normal build configuration match the pinned base. Coarse probes are injected only by the explicit research builder. Ordinary production imports, fixed ticks, Worker authority and biology are unchanged. Source digests are retained in the final manifest and [verification](verification.json).

## Registered matrix and actual execution

[Original protocol](protocol.md), [HTML preflight/inclusive budget amendment](preflight-amendment.md), [epoch-barrier amendment](reset-barrier-amendment.md).

Exactly20measured windows:12MAX population/caustic windows, four15-organism0x/5x windows and four6s overhead controls. Primary windows run10s after2s warm-up and a fresh import of the original checkpoint. MAX has two reversed-order repetitions;0x and5x have ONE each. Their second repetitions were explicitly omitted to keep the20-window maximum INCLUDING overhead controls. No timed scientific window was rerun.

The full15-organism pilot checks original/instrumented/selected compiled browser hosts at120logical ticks, plus exact paused actual-Worker restore. All full-state/PRNG hashes equal `cde30a6f0a24837d64acfae5968626d289a2d5b1f6e95cddbd90fc1bca60aa2e`; accounted energy is1,074,269.9999999988J against1,074,270J budget. This tests this checkpoint/current regime, not every historical regime or lifetime. Ordinary actual-Worker regressions supply separate integration coverage.

| Starting organisms | Parts | Eyes / rays | Hidden recurrent neurons | Starting food / eggs / caustics |
| ---: | ---: | ---: | ---: | --- |
|5|27|13 /65|120|275 /0 /28|
|15|81|39 /195|360|275 /0 /28|
|30|162|78 /390|720|275 /0 /28|

Production factories, seed73, balanced standard founders,2400×1500 Default-world settings, passive-work-v3/closed-v1/capsule-v1/decay-v2, production cap30. Genotype mix/positions/PRNG/food positions necessarily differ across population factories. On/off pairs start from identical authoritative state/settings; only observer metadata differs.

The active timer records424,103ms (~7.07min), including35,731ms carried from the passed pilot/failed setup. This excludes ordinary builds/validation and archival idle time. Resource failures outside that successful timer are disclosed below.

## Quantitative MAX results

Median [minimum,maximum] across two independent ordered windows. Changes are off minus on.

| Starting population | Caustics ON ticks/s | Caustics OFF ticks/s | Absolute /relative change | Display FPS ON → OFF | Windows ON /OFF |
| ---: | ---: | ---: | ---: | ---: | ---: |
|5|1828.0 [1824.2,1831.8]|1706.0 [1613.1,1799.0]|-122.0 (-6.67%)|4.77 → 59.10|2 /2|
|15|602.8 [599.0,606.6]|532.5 [518.7,546.3]|-70.3 (-11.66%)|4.10 → 58.75|2 /2|
|30|237.8 [229.6,246.1]|217.6 [213.9,221.3]|-20.2 (-8.50%)|3.97 → 57.53|2 /2|

All paired relative changes are retained in [summary-final.json](summary-final.json):5organisms −11.57%/−1.79%;15 −14.48%/−8.81%;30 −6.84%/−10.05%. These are small-sample descriptive outcomes, not statistical confidence bounds or general hardware effects.

At15/5x,299.8193 versus299.8192ticks/s and4.18 versus58.45FPS: the requested finite speed is achieved in both. At0x, both complete ZERO ticks and send zero measured frames, while painting continues at4.40 versus59.71FPS. Pause freezes the scene's simulation phase; it does not suppress RAF repaint.

More population strongly lowers observed MAX capacity. This is not a pure linear per-organism coefficient. The5-on trajectories end with4living organisms (21parts), while5-off retain5(27parts). The15-on trajectories end with16(87parts);15-off end with15, including one egg in repetition2.30organisms remain30/162parts in both modes. Food evolves from275 to roughly280–305. Comparing equal wall-time endpoints cannot demand identical final state: more completed ticks legitimately change ecology. Full starting hashes are equal within each population.

Caustic count is28independent of population, but visible count/pixel coverage depends on the camera and randomly initialized positions. The new matrix does not vary viewport/DPR/zoom or separately count visible caustic fills. Fixed versus pixel-dependent marginal cost is therefore not quantitatively isolated.

## Actual Worker/UI transport and scheduling

The normal protocol already caps ordinary presentation near30reports/s and permits one outstanding frame. It was not replaced or retuned.

At30/MAX, both ON windows construct/send41/43frames and receive41/42ACKs in the Worker windows; OFF constructs/sends199/200and receives199/199ACKs. Boundary differences of one frame are expected. Approximate Worker send rates are4/s versus20/s, while simulation continues at230–246 versus214–221ticks/s. The many blockedSend counters mean skipped REPORT attempts while a frame is outstanding, not blocked simulation ticks or queued full frames.

Worker-clock ACK turnaround medians:232.5/230.2ms ON versus11.0/11.4ms OFF. Calibrated send-to-main receipt is roughlyhundreds of milliseconds ON versus a few milliseconds OFF; it includes serialization/queue/dispatch. Main application callbacks/replica application typically have0–0.1ms medians (values of0are below timer resolution). This does not price receiver deserialization separately.

Warm30-organism frame construction median~0.1ms; synchronous postMessage median~0.7ms. At~20reports/s the observed post call walls sum to around1.5% of Worker active wall time; these inclusive native-call walls are not CPU utilization or a fully removable budget. They are too small, by themselves, to explain the entire8.5% MAX difference. More frequent reports, indirect memory/GC effects, kernel trajectory and resource contention remain plausible, not causally separated.

Warm JSON UTF-8 payload estimates are~95KB/180KB/294–298KB for5/15/30; actual structured-clone bytes are NOT measured. Payload carries current bodies/rays/food/bubbles/caustics/ledger, events, energy presentation and changed lineage/genomes. Warm frames generally send no genomes. The paused last payload is a COLD~1.95MB frame with30genomes and15lineage rows, not recurring paused traffic. No field has been proven unused by all UI consumers.

The selected/unselected paused component uses100warm frame constructions each. Both medians are below0.1ms; totals2.0/2.5ms, JSON74,975/75,182bytes. It starts with fresh, unstepped neural state; it does not establish mature learned-inspector cost or a selected gameplay throughput effect.

MAX batches use the existing8ms target and complete fixed ticks; observed medians roughly8–10ms with about16/5/2ticks for5/15/30. The256-tick batch ceiling is not reached. Pump/yield rows also include the initially paused snapshot/command interval: do not sum every recorded yield gap as an active CPU or scheduling tax. No per-thread CPU attribution was captured.

## Timing boundaries and diagnostic overhead

Worker ticks/s uses completed ticks divided by its OWN nonzero-control-to-end-command interval; full authoritative simTime independently verifies every tick count. Main and Worker origins are calibrated with five timestamp exchanges before/after. Zero-RTT readings are timer quantization, not zero uncertainty; allow at least the~0.1ms clock resolution.

Main RAF/callback/receive arrays have their own longer collection window, including the final authoritative snapshot return to the controller. Their counts must not be equated directly to Worker sent/ACK counts. Main long tasks/heap also include export/controller activity; they are not a clean ordinary-playback CPU or retention assay.

The original uninstrumented control calculation incorrectly included494–626ms of paused snapshot-to-controller transfer before playback. Its apparent+8.90% “instrumented speedup” is a boundary artifact and is rejected. Reanalysis from retained mainStart and final snapshot-exchange midpoint gives original572.34/558.40ticks/s (median565.37) versus diagnostic562.32/564.62(median563.47), approximately−0.34%. Start/receipt uncertainty and run variation exceed that sub-percent difference. No large extra diagnostic penalty is evident in this short15/off control, but this is NOT a zero-overhead proof. Both builds retain matched Worker/Canvas/RAF browser wrappers, and code-layout/JIT effects remain.

Every per-window tick/render/batch/transport distribution and sample count is in the machine summary. p95/p99 are reported only for≥100samples; frames/ticks within a window are correlated. Do not pool nested phases or different machines into a CPU percentage.

## Presentation inventory and hypotheses

The [A/B/C inventory](visual-effects.md) inspects backgrounds/grid, caustics, cached food glows, bubbles, body/cell/mouth shadow detail, energy contours, egg layers, selection/rays/traces/gravid cues, universal mask/composite, tubes and DOM controls.

- **Confirmed in this environment:** expensive caustic-enabled display, continued paused redraw, real ACK backpressure, independent Worker progress, strong workload scaling and improved UI latency when caustics are hidden.
- **Lost support/refuted in scope:** hiding decorative caustics necessarily raises Worker throughput; ACK completion is required before simulation can advance; increasing requested speed produces one render report per tick.
- **Plausible, unisolated:** higher report frequency or indirect CPU/cache/memory/GC contention contributes to the MAX decline. Rendering and reporting both change in this contrast; their individual causal contributions remain unknown.
- **Unmeasured:** representative physical GPU/desktop behavior, per-thread CPU/GPU utilization, Worker heap/GC/long-run retention, viewport/DPR marginal cost, dense eggs/hatches/tube crossings and mature selected-inspector gameplay.
- Feeding/predation energy halos and egg reserve indicators are **informational B**, not disposable decoration. Possible later A/detail candidates include background/grid embellishment, particles and decorative shadow/highlight quality, with separate observer review.

Amdahl reasoning must target the bottleneck being improved. Removing a dominant DISPLAY cost need not improve essential Worker computation and may allow more observer work. This batch establishes no production optimization benefit.

## Failures, retention and budget deviations

All failures and uncertainty remain preserved; none was hidden by rerunning a timed window.

1. Initial2d9387/PR-merge1341cf7 HTML fixture was not bundled. Readiness waited18minutes before timeout, no pilot/timed window began. This exceeded the intended resource envelope; the timer had wrongly started only after readiness. [Incident](preflight-incident.json), original manifest/log preserved.
2. Correctedc92389f/PR-merged5b3544 passed the120-tick pilot, then the first calibration's second import requested a snapshot using a stale epoch. It failed AFTER the discarded2s warm-up but BEFORE any6s measurement. That warm-up's exact trajectory/tick count remains unknown; its failed setup is not relabeled as a benchmark. The retained pilot was reused, not rerun.
3. Superseded3c7d030 setup waited on an incorrect canvas role selector and was explicitly cancelled. No scientific archive was emitted. Correctedc997001uses the actual canvas selector and an epoch/control barrier. The timed20-window matrix ran ONCE.
4. The completed scientific step passed, but its container-side Git preservation emitted “not in a git directory” and remained reported running. Ordinary cancellation did not end the always step; a verified post-science force-cancel was required. Overall workflow is CANCELLED, not an all-green CI claim.
5. An early log read retained only19windows while the job was still active. That partial log/summary remain versioned. Final completed-log read recovered the missing final window, component and manifest. All22measurement archives now match original byte SHA256 and remote Git blob pointers; final recovery/analysis [41640257479](https://github.com/hernansgarro/vidAI/actions/runs/41640257479) succeeded on its read-only retry. There was NO scientific rerun or reconstructed timing.
6. Full snapshots/duplicated inventory caused **92.19MiB uncompressed measurement archives**, exceeding the preregistered64MiB data ceiling (36.88MiB compressed, plus the retained pilot/logs). This accounting failure is disclosed. All originals were retained rather than deleted to disguise it. Future protocols should size artifacts first, retain each full checkpoint once and use well-defined endpoint hashes/selected full states.

[Verification](verification.json), [final summary](summary-final.json), [originals/integrity/final log](measurement/), [pilot](pilot.json.gz). The immutable historical Stage3.3 missing observation remains UNKNOWN on PR66; it was not repeated or changed here.

## Validation and publication boundary

npm ci,385fast tests and build/typecheck passed at the prepared/corrected research sources; the actual production Worker gate passed. Inherited Chromium33cases passed alongside the failed preparation-only research case; Firefox38passed after one isolated inherited energy-import timeout job rerun, with the research case skipped there. Toolbar/side-window gates passed. The earlier browser aggregate remained red because of research preparation failures; it is not falsely reported green. The dedicated20-window research test/build passed; later cancellation was preservation only.

Final consolidation fast/build readback belongs in PR69/#57. Root runtime/package/lock, normal workflows, testing baseline and historical evidence are unchanged in the final research diff. Auxiliary recovery/control workflows exist only on isolated evidence/control branches. No fork-main/testing merge, upstream PR/merge, release, Pages/Wiki publication or VIDA3D change.

## Proposed next bounded Stage3 batch — NOT executed

Hold caustics OFF, viewport and ordinary drawing fixed, and test ONLY research-gated report caps of30versus10/s in15/30/MAX checkpoints, two reversed repetitions:8windows×10s plus2s warm-up,≤4min active ceiling. Keep existing one-frame ACK semantics, fixed ticks, biology and normal production source untouched; verify full state at matched logical ticks. This would separate reporting demand from the rendering change that is confounded here. Pre-size/checkpoint-deduplicate evidence and establish matching control boundaries before execution. Physical-GPU desktop validation remains a separate open question.

STOP for Hernan's review. Stage3 remains ONGOING; no Stage4 implementation or next batch is authorized automatically.
