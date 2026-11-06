# P11 — maintained-grid evaluation and promotion decision evidence

2026-11-05. Fork-only research, tracked in [PR124](https://github.com/hernansgarro/vidAI/pull/124).
**Evaluation incomplete after a registered stop. Recommendation: investigate the
observed regression before considering promotion. P12 and final owner visual
acceptance remain pending.** No algorithm changes are proposed for implementation
by this report. Main and testing runtime remain untouched.

## Decision and principal result

The only completed primary populated pair ran the same initial world and reached
the same complete-snapshot SHA256 after 181 total ticks (one setup, 180 timed).
Testing delivered **104.126 versus 275.648 ticks/s: -62.22% throughput**, or
**+164.72% elapsed time per tick**. This is a substantial observed adverse result,
supported by a similar thread-CPU increase, not a demonstrated general regression
across populations/hardware. Only one of the preregistered three kernel pairs completed. Browser observations
with creatures also point adversely, with important unequal-progress limitations
detailed below.
The predeclared material-effect criterion requires all three same-direction
pairs; it was not met. Do not promote on an assumption that P10.5's gains over
P10 establish gains over main.

The primary dense testing slot timed out at the 40-second total Worker closure
guard. This includes setup, 120 warmup ticks, reset, setup tick, measurement and
output. Its useful measured interval and completed tick count were not retained.
**No testing dense rate or lower/upper throughput bound can be inferred.** The
affected local experiment stopped; no lost slot was replaced or rerun. Remaining
primary, attribution, allocation and audit-latency slots were not executed.

## Exact candidates and preparation

| Item | Main | Testing |
| --- | --- | --- |
| Immutable commit | `f74de36902d39597c48d95ee4a7fdf809094ae75` | `b9cac9a5c47d97e023e3329ba3260f565b4f2a25` |
| Implementation | Original transient broadphases | P0–P10.5; P10-B large-food filter only, A/C rejected |
| Dependency lock SHA256 | `12450a0271695e3542f0fdf21e5bf0cb5a19c48700f976b5dca8b5678cd66994` | Identical |
| Runtime/mode | Node24.22.1, Vite8.3.4 minified library, dedicated Node Worker, SimulationHost fixed ticks | Same |
| Local hardware | AMD EPYC9V74 80-Core Processor, Linux | Same host, sequential Workers |
| Observer settings | No browser/render/pacing, no inspector, no measurement-phase instrumentation | Same; P5/P6 OFF |

`package.json` differs in the expanded test command, not dependency versions.
[Source manifest](evidence/p11/source-manifest.json) pins relevant file bytes.
The [protocol](P11_PROTOCOL.md) was registered before measurements in
[PR122](https://github.com/hernansgarro/vidAI/pull/122#issuecomment-6670383167).
Research scripts/workflows are isolated from the published versions. No physics,
ecology, viscosity, solver, sensory, genetic, save or baseline parameter changed.

All initial snapshots use seed917, 2400x1500, passive-work-v3,
closed-v1/decay-v2, maxOrganisms150, targetNutrients275, inflow0; environmental
cycling stays active. Populated cases add180 actual carrion particles before
closing the energy economy. There are no execution-time subsidies.

| Scenario | Creatures | Parts | Eyes / rays per sensing pass | Initial food | Placement |
| --- | ---: | ---: | ---: | ---: | --- |
| Empty | 0 | 0 | 0 / 0 | 275 | Nutrients and environmental cycle |
| Moderate | 18 | 94 | 48 / 240 | 455 | Seeded normal initial placement |
| Dense | 100 | 520 | 260 / 1300 | 455 | Whole bodies translated onto90x60-unit lattice |
| Adversarial | 24 | 120 | 72 / 360 | 455 | CUR-006/007/009/001 clustered24x22 near cell boundaries, rotated headings |

Dense/adversarial are contact and crowding stress cases; initial interpenetration
was not independently quantified. Adversarial covers articulated/branched
featured bodies, not an exhaustive maximum-length/maximum-branch survey. No new
tube throughput scenario was added; existing correctness controls cover tubes.
Exact serialized inputs are retained losslessly; their bytes, not regeneration
timestamps, define this experiment. The same bytes were supplied to both
candidates. Setup/import and disposable warmup precede an exact reset and one
untimed preparation tick. Each primary window then requests180 fixed ticks.

## Primary individual results

These are individual round0 observations, **not medians**. TPS =180000/elapsedMs;
effective x = TPS/60. Absolute differences and percentages compare testing/main.

| Scenario | Main ms/tick | Testing ms/tick | Main TPS / x | Testing TPS / x | TPS difference | TPS change | Time change | Validity |
| --- | ---: | ---: | --- | --- | ---: | ---: | ---: | --- |
| Empty | 0.042704 | 0.129586 | 23417.013 /390.284x | 7716.891 /128.615x | -15700.122 | -67.05% | +203.45% | n1, only7.687/23.325ms elapsed; too short for a reliable rate verdict |
| Moderate | 3.627817 | 9.603713 | 275.648 /4.594x | 104.126 /1.735x | -171.521 | -62.22% | +164.72% | n1; substantial adverse signal, incomplete registered replication |
| Dense | 30.911523 | Unavailable | 32.350 /0.539x | Unavailable | Unavailable | Unavailable | Unavailable | Testing total-closure timeout; no valid pair |
| Adversarial | Unstarted | Unstarted | Unavailable | Unavailable | Unavailable | Unavailable | Unavailable | Primary stopped before this scenario |

Absolute ms/tick differences are +0.086882 empty and +5.975897 moderate.
Measured thread CPU (user+system) is0.029989→0.121983ms/tick empty and
3.603406→9.515844ms/tick moderate. These kernel-thread measurements exclude
setup, full export and browser work. They cannot locate a particular function.
RSS is process-wide and heap deltas include collection; neither is allocated
bytes, retained-heap proof or a leak diagnosis.

[Primary raw](evidence/p11/primary.json) retains every individual observation,
memory/CPU bracket, state hashes and the failed slot. Both completed primary
pairs match start and final snapshot hashes. At moderate end both have18
creatures/94parts/452food/0eggs; maximum absolute energy closure error across
completed primary rows is4.99e-8J. Dense main ends100/520/449/0. Full endpoint
JSON was hashed in the Worker but not archived: equality is supported by hashes,
not a separately inspectable full endpoint dump. Do not claim deep replay
comparison from this data alone.

## Pilot, stop and resource ledger

All8 pilot slots completed60timed ticks each; start/final hashes agree within
each scenario pair and absolute closure error is below1e-8J. The pilot overlapped
automated functional validation. Its timing is **contaminated and excluded from
performance conclusions**, including the apparently large adverse dense and
adversarial differences. Individual raw observations remain in
[pilot.json](evidence/p11/pilot.json), never substituted for missing primary rows.

| Scope | Registered maximum | Attempted / retained | Outcome |
| --- | ---: | --- | --- |
| Kernel pilot | 8 | 8 /8 | Functional pilot valid; timing contaminated |
| Primary | 24 | 6 /5 | Slot6 timeout;18 remaining unstarted |
| Attribution | 8 | 0 /0 | Unstarted after stop |
| Dense probe overhead controls | 4 | 0 /0 | Unstarted |
| Allocation | 4 | 0 /0 | Unstarted |
| Audit latency | 2 | 0 /0 | Unstarted |
| Browser pilot/primary | 2 /16 | 18 /18 | Measurements retained; workflow cancelled during closure |

There were14 attempted local windows,13 complete and one failed; no scientific
retry, replacement, longer timeout or new local lot. Completed timed intervals
sum25.549s; kernel orchestrator durations38.998s pilot and56.349s primary include
their setup/warmup/export but exclude probe compilation. The failed slot's useful
time is unknown. A unified active-time/invocation ledger was not implemented,
so the900s combined active-time budget cannot be certified from local JSON alone.
The browser job alone lasted about1204.5s including cleanup: the combined1200s
orchestration requirement was **exceeded**, even though all useful browser
measurements ended earlier. This budget failure is not waived. The JSON `started` field is regenerated
on each save and is a save timestamp, not a trustworthy admission timestamp.
Preserve these methodological defects; do not silently repair old results.

The protocol specified a30s useful-window cap and the implementation also had a
40s outer closure timer. A single long tick can overrun the internal check, and
the outer guard can interrupt warmup/export before a useful result is saved.
The original error does not identify its exact phase. Any future experiment
needs explicit approval and phase/admission/checkpoint design before execution;
this is not permission to extend/repeat the stopped slot.

## Where cost remains: measured versus source-supported

No cost-attribution, changed-cell, query-candidate or allocation observation was
executed after the primary stop. Empty `metrics`/`operations` objects in lean
rows mean **uninstrumented**, not zero work. Experimental diagnostic code was
authored but not validated/executed; its overhead is unknown and it must not be
promoted or used to produce CPU percentages from this lot.

| Cost | Source-supported finding | P11 numerical attribution |
| --- | --- | --- |
| Full reconciliation | `prepareTick` compares three array references/lengths; first tick or an actual external roster change calls full sync. No unconditional repeated tick-wide sync remains | None; passing inherited no-sync tests support covered paths, not a new P11 counter sample |
| Incremental organism upkeep | `syncOrganism` checks pose, scans COM/radius and recalculates each part's corners/AABB. Cached anatomy certificate is reused during normal pose hooks | Calls, elapsed share and true cell-change rate unmeasured |
| Contact correction hooks | Each contact positional correction synchronizes both whole organisms; joint/physics/tube hooks also synchronize. Work can repeat for many contacts within one pass | Plausible residual amplification, not proven dominant cause |
| Cell updates | `relocate` returns false without bucket mutation for unchanged range/kind; validation, range construction and upstream geometry still execute | Unchanged/changed counts unmeasured |
| Queries/dedup/order | Matrix stamp deduplication; new candidate arrays; source-rank sort still runs; overflow candidates always retained | Candidate visits, discarded duplicates, false positives and sorting time unavailable |
| Vision | Maintained individual food/egg/body-part candidates; exact per-ray intersections and dynamic appearance remain | No phase saving/regression measured |
| Feeding | Conservative organism square can return extra candidates; food lists>=128 use P10-B pure rejection before original descending sort | Filter survival/rejection and cost unmeasured |
| Contact preparation | Every pass builds wrapper list and part Map; queries each body, filters earlier ranks/AABBs, then sorts legacy first-shared-cell pairs | Prep versus SAT/impulse/projection cost unisolated |
| Allocations | Part corners/maps/bounds, pose-envelope results, query arrays, part Map and pair arrays remain allocation sites by source | No P11 sampled-byte/GC profile, no allocation-reduction or leak claim |
| P5 audit | Independent references/raw-cell enumeration only manual/due60simseconds; recovery scans raw slots after logged defects, never moves physical entities | Clean-audit and recovery latency unavailable |
| UI/render | Outside the Node kernel; observer overlays and frame serialization remain optional separate work | Browser receipt; never equate kernel x with UI FPS |

Normal physical food/egg/creature loops, rank refresh after real splices, contact
wrappers and local segment scans remain. They are not a disguised unconditional
three-roster reconciliation. This source assessment plus passing tests verifies
the intended P10.5 mechanism for covered paths, not absence of every possible
missed hook. Audits OFF provide no automatic discovery guarantee.

P10.5's -49.1% empty/-16.9% populated time and480→0 sync observations compared
**P10 versus P10.5**, used0/2creatures and retained earlier probes. They remain
antecedents, not P11 results or a main comparison. Stage3.10 phase wall times and
Stage3.12 weighted allocation samples remain historical; allocation weights are
not CPU percentages. Stage3.11 showed heavy GC tracing can substantially distort
the workload. No historical scientific campaign was rerun.

## Functional and visual review

Recovered P11 logs are from an untouched checkout of testing at the exact
recorded commit: [705/705 fast, no skips](evidence/p11/fast.log),
[typecheck/production build](evidence/p11/build.log) and
[actual compiled Worker](evidence/p11/worker.log) PASS. The second session did
not repeat them. Build emits the existing bundle-size warning. Compiled Worker
asset remains `simulation.worker-BD25PyjO.js`. The final pre-P11 source gates
were independently read back: [42099266958](https://github.com/hernansgarro/vidAI/actions/runs/42099266958)
Worker,Chromium55/55,Firefox60/60,toolbar16/16,side-window5/5 and aggregate PASS.
Those are exact-runtime historical acceptance evidence, not new P11 browser
throughput observations.

| Requested review | Automated evidence and limit |
| --- | --- |
| Movement/articulation/contact | Existing physics, no-sync lifecycle and P9 Worker long/branched/folded/dense/boundary/full-state controls pass; natural appearance still owner judgment |
| Feeding/carrion/eggs | P7/P8/P10-B controls pass, including accepted imported-radius and capped-merge optical differences |
| Vision/behavior | Ordering/ties, real optical/neural/learned/PRNG continuation pass; no ecological fitness claim |
| Tubes/borders/off-camera | Left/right transfer and boundary controls, independent Worker stepping and viewport-independent kernel architecture pass; no new tube performance coefficient |
| P6 overlays | Worker actual-matrix/bounds, independent toggles, paused refresh and reset controls pass; previous same-runtime browser canvas/scaling/state controls pass |
| P5 periodic/manual/repair | Log original defect before repair; independent verification, unsafe/failed cases, physical snapshot equality, session controls and exact60s periodic boundary pass |
| Severe pause | Independent OFF default; clean audit never pauses; original severe defect pauses after complete tick even after repair; Worker batch clears debt and stops pass |
| Pause/import | Exact paused exports/reset, external commands at0x, resume and stale epoch rejection pass |

P7's imported-food radius and P8's capped-carrion visibility corrections can
legitimately change trajectories relative to main. This campaign's completed
fixed-tick pairs did not diverge by complete-state hashes; no universal trajectory
identity is required or asserted. No baseline was refreshed to hide differences.

**Owner final visual review remains pending.** The favorable owner observation
is preliminary; neither automated passing tests nor screenshots constitute that
confirmation. No new extended manual viewing campaign was performed.

## External/headless compatibility boundary

After initialization, direct raw pose/anatomy edits or same-length in-place
roster reorders/replacements require `editSpatialState(state, edit)`, explicit
`synchronizeMaintainedGrid(state)` or immediate targeted hooks before the next
query/audit/tick. `editSpatialState` synchronizes in `finally`, even after a
partially completed throwing edit. Whole-array replacement or length change
retains next-tick detection. Neither constant-time checks nor disabled auditing
can discover arbitrary unannounced field writes.

Headless consumers and external fixture builders must adopt that boundary;
same-length mutation after setup is not transparently compatible with P10's
per-tick scans. Application commands already use hooks. This is an explicit API
tradeoff, distinct from the measured cost signal. P5 recovery does not make
unsupported writes a valid normal update strategy or guarantee earlier ticks
were unaffected. No serialized grid scratch/schema change is introduced.

## Classification and next decision

| Classification | Finding |
| --- | --- |
| Demonstrated improvements | No main→testing whole-simulation improvement established in this incomplete lot |
| Observed regressions | Moderate fixed-tick pair -62.22% TPS/+164.72% time, n1; browser populated pairs also adverse, n2, with unequal progress. No preregistered three-pair kernel verdict |
| Inconclusive | Dense testing rate, adversarial primary, all phase/candidate/allocation/audit coefficients, causal browser cost despite retained observations |
| Method limitations | Contaminated pilot, interrupted primary, short empty interval, no full endpoint archive, no unified budget ledger, unvalidated diagnostic overhead, single local host/seed, stress overlap unquantified |
| Residual investigation targets | Whole-organism sync at each part contact/projection, contact query/order/preparation, conservative coarse candidates and transient geometry allocation |

Recommend a separately authorized, small causal diagnosis of the moderate
regression and contact/joint maintenance path, with a validated low-overhead
counter/probe control and reliable phase-preserving timeout evidence. Do not
implement optimization or repeat this stopped campaign under P11's old budget.
Any follow-up must preserve physics, ordering, all historical references and
the two accepted P7/P8 corrections. The owner decides whether to authorize that
investigation, defer, or proceed to P12 despite the incomplete adverse evidence.
**No promotion is recommended at this checkpoint.**

## Reproducibility and preservation

Run `python scripts/p11-verify-evidence.py` for offline integrity/analysis only;
it executes no simulation. It verifies every distributed original against the
original manifest, losslessly decodes the exact input JSON bytes, checks paired
hashes and recomputes primary changes. The old gzip is repackaged as
`initial-scenes.json.xz` (filename→exactJSON-string map). Its original size/hash
remain in `manifest.json` as transport provenance; content hashes are unchanged.

`scripts/p11-evaluate.mjs`, compiled lean probes, scene factory, original logs,
raw JSON and source manifest are preserved on this evidence branch. The
experimental diagnostic mode is unvalidated and unexecuted. Their presence is
not authorization to run them again. Browser workflow reference is retained
outside active `.github/workflows` after closure. The research PR must remain
unmerged: it contains experimental tooling, testing identity and evidence.

## Browser receipt — all18 measurement windows retained; workflow failed closure

[Run42117025550](https://github.com/hernansgarro/vidAI/actions/runs/42117025550),
job127559268082, research head `2b32b6c30c068547924b9a4d22668e60505c558a`.
Chromium145.0.7632.6, AMD EPYC9V74, Linux, pinned Playwright1.58.2 container,
1280x850/DPR1, production minified builds, MAX, caustics/overlays/audit OFF.
The four serialized initial inputs match the kernel input SHA256 values exactly.
Browser elapsed counters measure progress between first/last received authoritative
frames; they include Worker pacing/transport/UI competition, not just kernel time.

Both pilot and all16primary observations finished and were saved, with no page
errors. Pilot2s windows: dense main24.661TPS/0.411x versus testing8.662/0.144x;
use these only as pilot observations. Primary individual results follow; they
are equal-wall observations, not fixed-tick work equivalence.

| Scene | Main TPS r0 /r1 | Testing TPS r0 /r1 | Median effective x main→testing | Median TPS change | Paired TPS changes r0 /r1 | Interpretation |
| --- | --- | --- | --- | --- | --- | --- |
| Empty | 426928.353 /434671.589 | 14617.065 /13274.775 | 7180.000→232.432 | -96.76% | -96.58% /-96.95% | **Confounded:** main loses all food after much more simulated time; no equal-work regression coefficient |
| Moderate | 224.578 /200.796 | 120.576 /121.988 | 3.545→2.021 | -42.98% | -46.31% /-39.25% | Repeated adverse end-to-end observation, n2; population/time differ |
| Dense | 35.074 /35.443 | 10.139 /10.069 | 0.588→0.168 | -71.34% | -71.09% /-71.59% | Repeated adverse observation, n2; early contact trajectories differ |
| Adversarial | 172.327 /170.504 | 59.246 /61.651 | 2.857→1.007 | -64.74% | -65.62% /-63.84% | Repeated adverse observation, n2; different simulated ages/death timing |

These are ratios of median TPS (two values), not a confidence interval. Main's
first→last simulated time in moderate r0 is14.52→36.80s,18→20creatures,
443→428food; testing6.27→18.17s,18→18creatures,447→441food. Dense main
r0 is1.47→4.98s,100→99creatures,449→445food; testing0.45→1.42s,
100→100creatures,455→450food. Adversarial main r0 is6.75→23.83s,
23→23creatures,451→428food; testing1.65→7.53s,24→23creatures,
455→451food. The faster build reaches later/easier/different physical states.
These results strengthen concern but do not isolate maintenance CPU or the
causal effect at an identical tick. Main's empty r0 advances2444.8→44871.5s
and food275→0, while testing674.5→2124.1s keeps275food. The extraordinary
empty ratio is therefore excluded from like-for-like performance conclusions.

| Scene | Main median RAF FPS | Testing median RAF FPS |
| --- | ---: | ---: |
| Empty | 60.002 | 59.919 |
| Moderate | 47.902 | 58.251 |
| Dense | 22.679 | 22.292 |
| Adversarial | 49.990 | 48.752 |

A higher UI FPS can coexist with slower simulation. RAF callback time is an
inclusive JS wall bracket containing drawing/other callback work; message handler
time brackets delivery handling, excluding queueing/deserialization. They are
not independent CPU/GPU/render-phase shares. Toolbar strings are retained as
numeric cross-checks; their smoothing windows can disagree with authoritative
whole-window rates (especially adversarial). No color is used as a metric.
Browser observer overhead has no uninstrumented control in this lot and is
unquantified. Static dense screenshots were inspected: bodies/food/UI are drawn;
static images cannot establish natural movement or final owner acceptance.

Raw frame/RAF/message rows, numeric toolbar readings and individual results are
retained losslessly in `evidence/p11/browser.json.xz`; `browser-summary.json`
provides compact individual rows. Original artifact13456604947/ZIP SHA256
`09791b7e91b4e4097f65c563baca816e07a232621dbf2d52c47f65eecd0b29bb`
contains all18screenshots, inputs and browser JSON, with an
[individual-file manifest](evidence/p11/browser-artifact-manifest.json).
Screenshots remain in the CI artifact with stated expiry2026-11-19; raw metrics
and exact inputs are preserved in Git independently of that expiry.

Last useful result was logged22:00:41UTC. The process did not exit and CI cancelled
it at22:15:49UTC at the20min job deadline, then successfully uploaded all23files.
This is a **workflow/orchestration failure**, not missing scientific measurement
rows. Source starts npm preview subprocesses and only signals their parent;
lingering subprocess handles or browser teardown are plausible closure causes,
not proven from available logs. No teardown phase markers exist. The focused
P5/P6/severe-pause step was **SKIPPED** after cancellation; historical passing
browser coverage remains separate. No unchanged rerun or third correction was
attempted. Cleanup failure does not erase completed observations or waive the
global orchestration budget failure. Active scientific workflow was removed;
its exact reference YAML is retained outside `.github/workflows`.

Original setup failure42116356309 occurred before checkout preparation;
correction1 added safe-directory/full history. Run42116620608 then failed before
import (`input[type=file]` absent with Settings closed):
[original JSON](evidence/p11/browser-setup-failure.json), artifact13456072051.
Correction2 opened Settings before import. Two targeted correction cycles were
used; zero unchanged manual CI retries. Those fixes did not repeat valid imported
scientific windows. All later18observations are originals, with no replacements.
