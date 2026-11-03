# Stage 3.2 — deferred caustic blur explains the CI composition block

**Batch COMPLETED; Stage 3 status: ONGOING — additional investigation remains pending.**
Executed2026-11-02; consolidated2026-11-03. Fork-only research, no production optimization.

## Outcome and changed conclusions

The expensive operation reported at world-surface `drawImage` is chiefly **deferred
raster work associated with caustic blur in this software-rendered scene**, rather
than intrinsically expensive copying of an already rendered full-size canvas.

Two controls support that attribution: keeping caustic geometry but removing only
its `blur(16px)` changes the observed display from~3.34 to~58.81FPS; omitting
caustic fills produces~58.94FPS. Forcing source1×1 readback just before composition
moves~287ms to that readback while `drawImage` becomes below timer resolution and
FPS stays~3.31. Moving the synchronization point is **not an optimization**.

This clarifies a major Stage3.1 uncertainty. It does not establish the same cost on
Hernan's hardware, exact Skia/filter microarchitecture, or active Worker throughput.
The unblur/omit controls intentionally alter appearance and are not approved quality
changes. No permanent optimization or gameplay speedup has been implemented.

## Provenance and environment

- Preregistration: [#57 receipt6589623007](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6589623007);
  [retained protocol](protocol.md).
- First harness head1c4927a failed **before browser navigation or measurement** in
  SHA metadata collection. [Original failure](preflight-failure.log),
  [receipt](preflight-receipt.json), [pre-execution technical repair amendment](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6589871014).
  Zero scientific slots started; none were repeated/replaced.
- Research head: `7279fc8b6d09b039bb5a738c62c8648bf89ca2ba`.
  Actual tested synthetic PR-merge SHA: `6971be781a41c7c3909e554b43212ed3fd2aee88`.
  Runtime base fork/main: `11248f3431604a1b883a7a948a6e6baddc3fafdd`.
  The synthetic merge is the CI checkout, not an actual fork-main merge.
- [Successful Worker/browser run41536057085](https://github.com/hernansgarro/vidAI/actions/runs/41536057085),
  Chromium job125588052746, Playwright1.58.2 official preinstalled-browser container.
- Chromium headless145.0.7632.6; viewport1280×850; backing canvas1280×674, CSS1280×675;
  DPR1; visible page; four exposed logical processors; AMD EPYC9V74.
  Exact Linux kernel, browser flags, source/target context attributes and transforms
  are retained in original data and summary. Camera matrix is unchanged across
  windows (scale~.85; translation~-380,-300.25).
- **Backend identified:** CDP SystemInfo reports ANGLE/SwiftShader, SwANGLE5.0.0,
  `ANGLE_SWIFTSHADER`, GaneshGL; 2D Canvas=`unavailable_software`,
  rasterization/compositing=`disabled_software`. This is software graphics; presence
  of a named CrGpuMain process is not proof of physical GPU acceleration.
  Actual desktop driver/GPU utilization, host contention and power/thermal state
  remain unknown. CDP feature labels/launch flags do not price each internal raster step.

## Workload, controls and original evidence

Imported the exact Stage3.1 held authoritative snapshot atx0:15living organisms,
17parts, zero food,28caustics, simTime3.0333333333333274. Twenty-three caustic fill
calls are visible per rendered frame. One actual Worker exists; cumulative frame/ACK
counts stay15/14 in every measured window. No authoritative ticks or new evolution
ran during the contrasts. All10 per-window full-state hashes equal
`b22f499523d8e172306816f85f280df451fcbfe074c93e74cbb6a31126be73fa`.
Initial/final full snapshots, settings and PRNG/optics/learning/ledger agree.

**Transient visual limit:** import resets energy collector/presentation state.
These windows do not reconstruct Stage3.1's retained live contour glow. The old and
new absolute timings are not a paired glow comparison; conclusions concern paired
Stage3.2 graphics controls with identical authoritative state.

Five modes, two repetitions with reverse order in repetition2,2s settling +8s
measurement each. Baseline/no-timers retains RAF/method wrappers and aggregate
counters but omits additional native-call timers. The other modes keep those timers.
Then two separately labeled3s diagnostic captures (baseline/unblur, each2s settling),
with V8 sampling and native CDP traces; they are excluded from timing aggregates.
Finally, two isolated blocks of30 already-flushed-source copy+readback calls run
synchronously outside game RAF. No high-population/vision/cache campaign occurred.

Actual registered experimental elapsed time: **127357ms (~2m7s)**, below5min.
No scientific failure/retry/replacement occurred. The first metadata preflight
failure is retained separately; inherited correctness regressions are not research
repetitions. Full original archive is2781599bytes, SHA256
`4f5ea0b32c55ae30ddb7daf0f6b85ebcb85c2db3fc289c9fa6e109078a02fa5e`.

## Quantitative findings

Two independent ordered windows/mode. Window FPS medians interpolate the two values;
pooled frame medians are correlated observations, **not confidence bounds**.

| Mode | Individual window FPS | Median window FPS | Frames pooled | Callback median ms | Composition median ms | Forced readback median ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Baseline, native timers disabled |3.353 /3.314 |3.334 |58 |294.35 |not timed |— |
| Baseline, native timers enabled |3.307 /3.372 |3.340 |59 |288.90 |287.90 |— |
| Caustic geometry retained, blur removed |59.250 /58.373 |58.811 |940 |5.40 |4.50 |— |
| Native caustic fills omitted |58.877 /59.000 |58.939 |944 |4.20 |3.40 |— |
| Original blur + source1×1 readback before copy |3.301 /3.327 |3.314 |58 |289.35 |0.00* |287.35 |

*Zero means below browser timer resolution, not zero computation.*

Baseline caustic **submission** takes~.1ms/frame, yet its associated deferred cost
appears at composition/readback. A cheap submission timer must not be interpreted
as cheap rendering. Removing blur yields an experimental display-FPS ratio~17.61;
omitting fills~17.65. These ratios are observed paused visual ablations, **not
achieved production speedups, Worker acceleration or a recommended quality setting**.
Near59FPS is display/cadence constrained; it does not measure unlimited render capacity.

The unblurred pooled callback p95/p99 is8.50/9.161ms; without caustics6.50/7.114ms.
Slow modes have fewer than100frames, so no p95/p99 is reported. Native timer control
FPS differs by~+0.18% in aggregate, with mixed paired signs; this is no detectable
large extra-timer effect at this coarse scale, not proof that instrumentation is free.
All modes share wrappers/counters/RAF timing; no completely unwrapped baseline exists.

The separate same-size static-copy assay has median draw+target1×1 readback~.10ms
in both30-call blocks (draw median below resolution; first-block max2.10ms).
The source is the final **unblurred diagnostic** surface and is already flushed.
This supports rejection of a universal~290ms bare-copy interpretation, but it is
not a pure GPU bandwidth measurement: repeated source/target reuse and readbacks
may change backing/storage policy, and the assay is not ordinary game composition.

## Profiles, native traces and causal limits

The separately profiled baseline places97.45% of V8 weighted self-sample time in
native `drawImage` (748samples); unblur31.95% (734samples), with~1.60s in V8 idle.
Baseline native trace contains45570events; unblur75664. Raw events preserve renderer,
DedicatedWorker, compositor, VizCompositorThread and CrGpuMain thread identities.
Baseline long renderer RAF/main-frame tasks reach~316ms; unblur exposes other display
pipeline work while operating near59FPS. Trace durations are **wall durations**;
nested/overlapping events and parallel threads must not be summed into a CPU budget.
No OS per-thread utilization, GPU utilization or detailed Skia blur-stage CPU price
was measured. The traces corroborate placement; paired visual/flush controls supply
the main attribution evidence.

Readback may trigger a different backing/storage policy and can flush more than the
requested pixel. Same-context order/caching/carryover are not fully isolated by two
reversed repetitions. Nevertheless, slow baseline returns after the fast variants
and repeated flush modes, and large blur-related differences occur in both orders.
Do not equate these results with every graphics backend or a fresh-context study.
CSS/backing height differs by1px throughout, so this batch does not vary pixel/DPR
scaling. All render transforms, visibility and state hashes remain fixed.

## Reassessment of the cumulative register

- **S2-11 strengthened/root clarified:** severe software-CI cost is associated with
  caustic blur/deferred raster. The old composition boundary remains a valid observation;
  the interpretation 'pure copy costs260ms' is refuted in this measured scope.
- **S2-11 backend newly established:** software graphics identified; desktop/GPU
  representativeness remains open. Remaining filter-size/pixel/DPR/cache mechanism
  questions are not closed by the association.
- **S2-12 scheduling:** paused unchanged state still incurs23blurred fills/frame;
  exact static-scene reuse/demand redraw is now a justified research question.
  UI/camera/presentation invalidation and active rendering require separate evidence.
- **S2-10/S2-11-G retained:** Stage3.1's low observed receipt/native-contour cost
  remains scoped to those fixtures; this batch adds no live-glow causal evidence.
- **S2-02 clarified but unpriced:** source inventory now includes contact wrappers,
  joint-projection local setup and COM;300/600 old substep derivations are not all
  calls and are not timed benefit. Dedicated future investigation remains mandatory.
- **S2-03 clarified:** vision already has finite inherited/mutable **per-eye** range,
  shared by five rays; range affects attenuation and normalized neural distance.
  Separate IDEA-026 registers five possible **per-ray** lengths, exact distances,
  inheritance/energy/migration decisions unapproved. No optical-cost experiment ran.
- **Other S2 rows reassessed unchanged:** optics/contact/neural coarse costs still
  substantial; warm clone component still not actual IPC; food prefilter remains
  effective in tested cases; ecology low observed there; GC/retention, hatching,
  real tube crossings, independent population scaling and long-run age remain open.
  No new end-to-end optimization benefit is established.

## Validation, preservation and access

Local npm ci,385fast tests and build passed before execution; corrected helper
compiled, final research-entrypoint removal built with unchanged app
`index-Cq_4ZBoJ.js` and Worker `simulation.worker-BOfAki5g.js`.
Corrected source7279fc8 passed [fast/build41536057133](https://github.com/hernansgarro/vidAI/actions/runs/41536057133)
and [Worker/browser41536057085](https://github.com/hernansgarro/vidAI/actions/runs/41536057085):
31inherited+1research Chromium,36Firefox (additional Chromium-only research excluded),
toolbar16, side-windows5, actual Worker and mandatory browser-smoke aggregate.
Pages assembly/deploy were skipped. The preflight source's failed research invocation
and passing inherited tests remain in the original run/log; they are not relabeled passed.

The original65-file v1 manifest and entire v1 directory compare unchanged.
Verification recovered the **complete original** gzip from232ordered log parts;
its emitted archive digest matches independently. Initial/final snapshots and all
10state hashes/settings match. No experiment was rerun during recovery/analysis.

After evidence capture, the original energy regression file is restored byte-for-byte
and the new optional e2e entrypoint removed. Research helper/analysis remain under
scripts only; no standard/default test discovery can repeat this Stage3.2 budget.
All original application/runtime/package/lock/workflow/release files are unchanged.

During final consolidation the resumed local environment is read-only. Analysis was
performed in memory with read-only source/evidence verification; durable final files
are committed through the existing GitHub connector. The local drafts predate that
final commit and cannot be updated/cleaned in this environment. No additional tests
were run merely to repeat already validated unchanged source. Remote final tree/head
readback is the publication check; no clean local checkout is claimed.

Fork admin access was verified; upstream collaborator-permission endpoint returned403.
Coordination comments succeeded, but upstream runtime/project-field authority is not
inferred. No new native Project transition is claimed. Upstream #67 remains open.
Fork/main11248f3, fork/testing4bda30a and upstream/main041362e were read back unchanged.
No fork-main merge, upstream PR, release, Pages/Wiki update or VIDA3D change occurred.
Prior app publication receipts remain in #57; this research does not republish the site.

## Next review and stop

The [proposed Stage3.3](next-substage-proposal.md) is a dedicated bounded S2-02
derivation/cache-cost investigation: at most12short paired process slots using two
small checkpoints, plus explicitly preregistered isolated lookup/lifetime work;
10min proposed experimental ceiling. It is **not executed or implicitly authorized**.
Real Worker/UI contention/IPC and representative desktop/active graphics are also
high-priority pending work. If priorities change, register the new scope before trials.

**Stage 3 status: ONGOING — additional investigation remains pending.**
Stop for Hernan's review. No automatic next substage or performance implementation.
