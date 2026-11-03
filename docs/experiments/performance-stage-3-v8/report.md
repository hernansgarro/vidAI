# Stage 3.7 — partial evidence, stopped after throughput-counter failure

**LOT STOPPED / SCIENTIFIC OBJECTIVE INCOMPLETE.** Eight fixed-120-tick controls are
preserved and verified. The first timed slot failed; **zero valid end-to-end TPS
windows**, no dummy speedup, no calibrated probe overhead and no new CPU/GC result.
No further scientific execution is authorized. Stage3 remains ongoing; Stage4 is not
started. Research draft [#90](https://github.com/hernansgarro/vidAI/pull/90) stays unmerged.

## What changed in knowledge

- **CONFIRMED in this fixed short fixture:** ordinary simulation and all-real
  research off/counter/phase controls have exactly the same complete snapshot,
  settings, learned state, PRNG and energy at120ticks. Full snapshot SHA256
  `2a7753be8bff8fc68e6cda9c93fa07d09f0e7577bdd046d44f26e59c0b9c8da6`;
  authoritative state hash is retained in each original snapshot.
- **CONFIRMED fixture feasibility:** keyed genuine A/B/C vision and brain records,
  independent learningOFF and conservation-safe synthetic feeding execute120ticks
  with valid persistence state and unchanged inherited anatomy/settings. Dummy-on
  trajectories intentionally differ. This does not validate ecology or throughput.
- **PLAUSIBLE hotspot ordering:** a short cold phase-timed all-real pilot places
  shared articulated physics/contacts first, vision second, recurrent inference
  third. These are measured instrumented elapsed times, **not stable CPU budgets**.
  The study did not reach its planned overhead controls. Sampled nested clocks
  materially perturb observations; no avoidable share is established.
- **UNKNOWN:** every dummy's actual WorkerTPS benefit, sustained phase costs,
  overhead, new CPU/GC/allocation evidence, independent scaling and production-safe
  gain. Prior Stage3.1–3.6 findings remain exactly as originally reported.

## Source, protocol and immutable evidence

[Preregistration](https://github.com/smeagol44/vidAI/issues/57#issuecomment-6615597868)
preceded scientific implementation/execution. Owner explicitly launched this task
and clarified that universe reserve can fund artificial diagnostic energy.
Base fork/main `73ee85bff65f219affde3117bd7e13d5a451f986`;
measured source `f0db3e47f3f3396492c1b6fa7ccb1fc2ee4602ee`;
upstream reference `041362eefa64971d9038f4ad7ec4fd59a747d3ec`.
Branch `audit/performance-stage-3-7` in hernansgarro/vidAI.
Original evidence commit **`812f5113931e4cc6486dcc5b7559f0f85b212bdf`** contains17 raw/ledger/summary files,
including14 receipts plus manifest. [Manifest](https://github.com/hernansgarro/vidAI/blob/812f5113931e4cc6486dcc5b7559f0f85b212bdf/docs/experiments/performance-stage-3-v8/manifest.json.gz),
[original failure](https://github.com/hernansgarro/vidAI/blob/812f5113931e4cc6486dcc5b7559f0f85b212bdf/docs/experiments/performance-stage-3-v8/failure.json.gz), [ledger](https://github.com/hernansgarro/vidAI/blob/812f5113931e4cc6486dcc5b7559f0f85b212bdf/docs/experiments/performance-stage-3-v8/ledger.json),
[all-real phase pilot](https://github.com/hernansgarro/vidAI/blob/812f5113931e4cc6486dcc5b7559f0f85b212bdf/docs/experiments/performance-stage-3-v8/pilot-4.json.gz),
[recorded values](https://github.com/hernansgarro/vidAI/blob/812f5113931e4cc6486dcc5b7559f0f85b212bdf/docs/experiments/performance-stage-3-v8/recorded-sequences.json.gz).
Derived [findings](findings.json), [verification](verification.json) and
[remote byte/Git-blob readback](remote-readback.json) run NO simulation.

Fixture is the exact Stage3.5/3.6 original30-organism checkpoint:
gzip SHA256 `c6ab22b6d12f5b38f8234c5a440620218173a31f8ae23fbf4a5ef83a9455758e`,
state SHA256 `1299114a9d1195056cacd2a2a7bac87b824d830911d7bbee88b51f1e1ce99e83`.
Original provenance is Stage3.5 final18e6673; original bytes/state verified before
import. Starts30living/162parts/132joints/78eyes/390rays/720hidden/30mouths/275food,
zeroeggs, closed1323540J universe, positive usable organism reserves300000J and
zero world reserve. No topology. Real production browserWorker,MAX,causticsOFF,
no selection/track/inspector, stationary default camera,1280x850/DPR1, normal
background/off-camera processing. Full original JS and research JS/maps preserved.
The ordinary build is genuinely loaded before research variants.

Host: AMD EPYC 7763 64-Core Processor, 4 reportedCPUs,
15.61GiB, Linux7.0.0-1017-azure, Nodev24.22.1,
Chromium145.0.7632.6/Playwright1.58.2. ANGLE/SwiftShader software graphics;
2Dcanvas unavailable_software, raster/compositing disabled_software. Cgroups report
no tighter CPU/memory cap. Shared-host contention, actual desktop/hardwareGPU,
thermal/frequency/power conditions are UNKNOWN. Absolute results cannot be compared
to different historical hosts as speedups/regressions.

## Failure, missing observation and stopping rule

[Scientific run41721182109](https://github.com/hernansgarro/vidAI/actions/runs/41721182109),
job126214042831: installation/fast/build/productionWorker steps succeeded; the
scientific step **FAILED**. All8fixed controls completed before P01. P01 ran once
for its requested12s and then the assertion reported **2 versus1885ticks**.
Source proves the harness mistakenly used `SimulationHost.frame().steps` as a
cumulative counter. That API reports ticks **since the last frame** and `frame()`
resets the counter and drains observer queues. It is unsuitable for passive
cumulative reads. This was an agent-authored research harness defect, not a
production simulation regression.

The failed slot's exact begin/end/snapshot/CPU local objects were not included in
the catch archive because validation occurred before raw window preservation.
This is an explicit **missing primary observation**, not a recovered speed result.
The assertion's1885tick endpoint and nominal12s do NOT justify reconstructing TPS.
P02–P08/C01–C04 never started. No slot was repeated/replaced, no campaign restarted,
and no prior-stage experiment rerun. Remaining budgets are not permission to retry.

Measured charges: **39.280s active**, **145.350s runner**,
**50,837,124uncompressed archive bytes**, all under360s/600s/128MiB.
One attempted timed slot, zero retained; full scientific objective remains blocked.
Original data/failure/byte hashes are immutable. Manifest itself SHA256
`e8555f91c73e2c4f92d68a62b59e946748485a3582b3efebeee626918f7dd686`.

## Exclusive phase ledger: fixed120-tick diagnostic ONLY

These numbers describe120cold/short instrumented ticks (2simulatedseconds), not an
active sustained throughput window. Mean full tick **8.930ms**, median7.250ms,
SD7.342ms,p9521.600ms,max59.500ms. Top-level mutually exclusive phase sums close
exactly to each measured tick (max absolute residual0ms in the quantized clock);
`unattributed` is retained. All included source arithmetic/order remains exact.
Clocks have approximately0.1ms granularity in these records; tiny subphase values
have limited precision. Elapsed time includes measurement, GC/preemption/JIT; it
is not independently measured threadCPU.

| Exclusive top-level phase | ms/tick | Tick elapsed share | SD ms |
| --- | ---: | ---: | ---: |
| physics | 3.7275 | 41.74% | 4.0603 |
| vision | 2.5325 | 28.36% | 1.8374 |
| inference | 1.3775 | 15.43% | 1.3790 |
| sight-build | 0.2633 | 2.95% | 0.2872 |
| motor-learning | 0.2058 | 2.30% | 0.2353 |
| feeding | 0.1917 | 2.15% | 0.1418 |
| sensory-learning | 0.1867 | 2.09% | 0.1871 |
| environment | 0.1092 | 1.22% | 0.3582 |
| metabolism | 0.0683 | 0.77% | 0.0796 |
| reproduction-death | 0.0667 | 0.75% | 0.0934 |
| feeding-index | 0.0642 | 0.72% | 0.0911 |
| neural-inputs | 0.0625 | 0.70% | 0.0857 |
| organism-overhead | 0.0392 | 0.44% | 0.0649 |
| observer | 0.0300 | 0.34% | 0.1487 |
| unattributed | 0.0042 | 0.05% | 0.0238 |
| finalize | 0.0008 | 0.01% | 0.0091 |

Combining adjacent categories only: vision+sight-build2.7958ms/tick;
learning motor+sensory0.3925ms/tick; feeding+index0.2558ms/tick.
They are local diagnostic costs, not savings or a validated production ranking.

**Perturbation:** the8ticks with nested details average22.5625ms versus7.95625ms
for112ticks without nested detail. Physics11.4375vs3.1768ms; vision6.1625vs2.2732ms.
Both sets still have coarse phase clocks and different tick positions/cache/JIT;
this contrast is NOT a causal calibrated overhead subtraction. It does demonstrate
that precise-looking nested costs must not be treated as uninstrumented budgets.
The planned ordinary/counter/phase/trace5scontrols were never reached.

### Operation counts and selective nested accounting

Counters are sampled on ordinal1mod16 (8sampled ticks), not complete window counts.
Observed averages/sampledtick:390rays/390corridorqueries/7644.875candidates,
2616.625food-circle tests/5531body-edge tests;4spatial-index constructions,
742.25indexed entries;120body advances;32contact passes (maximum8per substep in
this sample),1308.125broadphasepairs/exactSATcalls,636.875actualcontacts;
157.25joint-projection calls;1371cardinal anchors/972corner calls;
30inference calls,18motor+18sensorylearning calls,31.5somaticwriteDeltas calls;
30mouths/66oralbounds queries. Calls are executed observed work, not static loops.

Within the8sampled ticks, exclusive nested elapsed/sampledtick includes:
spatial query2.400ms plus collect0.7375ms (about8.04us inclusive/query under probes);
contact bodies0.8375ms,pairs0.9750ms,SAT1.3250ms,contact impulses0.2125ms,
joint projection1.6500ms; physicsmetadata0.1500ms (about1.25us/bodyadvance),
motors0.4125ms,drag/walls+prepayment/integration0.9875ms,jointsolve1.5000ms;
recurrenthidden1.0875ms,outputs0.3750ms,compiledBrain0.5250ms and
somaticwriteDeltas0.1250ms. These are **exclusive within the sampled call tree**;
parent top-level phases already include them. Do not add both levels or equate
sampledtick means with all120tick means. Subphase variance was not retained.
No individual neuron clock; per-ray/contact fine clocks are absent on unsampled
ticks. Existing caches/scratch remain. Per-operation figures are instrumented
quotients, not precision CPU constants or evidence that a cache pays off.

No controlled density/count/genotype scaling was run. Small natural nutrient
changes do not isolate scaling. No new GC,allocationstack/retention or threadCPU
result exists: C04 never executed. Stage3.6 evidence stays historical, not a new
3.7measurement. Backend memory counters are not a substitute for GC records.

## Equal-logical-tick counterfactual validation and divergence

Each dummy independently ran120ticks with genuine remaining subsystems. Stable
seed73/id/tick selector `(hash73(id)+tick-1)%3` selects typed values recorded from
first3genuine all-real ticks;30identities,3vision and3brain entries each. No
production PRNG call. Unknown offspring identities fail rather than invent data.
Recorded retinal dimensions match eyes*5rays*4channels, and output vectors match
individual neural output lengths. Preserved raw values come from actual simulation.
Global cyclic iterator was assessed as iteration/population dependent and not used.

Vision bypass omits sight geometry/index/ray processing and reuses recorded retinal
channels/rayhit structures; current proprioception/oral inputs remain genuine.
Recorded hit coordinates describe old surfaces, not current optical truth. Brain
substitutes outputs only: hidden state freezes, real learning calls and all motor
forces/joints/contacts remain. Zero learned deltas in this pilot are a downstream
consequence, not implicit learningOFF. LearningOFF bypasses both paid update paths,
retaining genes/senses/inference/physics, but future somatic/inference work changes.
Feeding bypasses oralindex/geometry/query/contact intake, retaining global ecology.

| Mode | Part-position difference mean/max px vs real | Mean abs output difference | Motor/sensory learned L1 | Organism reserve J |
| --- | ---: | ---: | ---: | ---: |
| vision | 1.6535 / 12.1312 | 0.022441 | 0.00552124 / 0.02610397 | 301484.6518 |
| brain | 4.6131 / 27.1574 | 0.032965 | 0.00000000 / 0.00000000 | 301210.4771 |
| learning | 0.1427 / 4.0417 | 0.000946 | 0.00000000 / 0.00000000 | 301504.9565 |
| feeding | 0.2169 / 4.5068 | 0.001861 | 0.00000000 / 0.00000000 | 298093.8842 |

Real endpoint:30living/276food/0eggs/0newbirths/deaths; motor/sensory learned L1
0.00559417/0.02747444; organismreserve301489.4288J. Dummy endpoints keep30living,
zeroeggs/birth/death, but feeding leaves275food rather than276. Real total
metabolic ledger2744.4521J versus learningOFF2730.6125J, a13.8396Jdifference;
mechanical heat86.1191vs84.4310J. End plasticity rate6.9498J/s versus0.
LearningOFF changes part positions by as much as4.0417px after only2simulatedseconds;
it cannot be treated as biologically neutral. Other dummy differences also show
that cheaper input generation can alter downstream workload. No end-to-end effects
can be added or inferred from these fixed pilots.

### Synthetic feeding: universe-funded, closed, explicitly artificial

At most1J/organism/s, capped by positive universe reserve and storage room.
All3600calls together transfer **59.999999999997875J**; source debits equal the
reported credits by construction, max per-transfer floating error1.819e-12J.
Total world energy remains1323540.0000000014J (error1.397e-9J). All pilot errors
are<=3.726e-9J. Closed total includes embodied stocks plus signed universe reserve;
heat is diagnostic and is not double counted as another stock.

No physical mouth-contact/intake cues or authentic feeding events are fabricated.
Synthetic transfer is independently reported, no extra joules, no budget change,
no starvation immunity/guaranteed survival. Nutrient evolution and physical work
remain real. **Ecologically invalid diagnostic**, never a gameplay/learning rule.
Generator pilot samples:vision1.6ms/240sampledcalls (~6.67us/call),brain0.6ms/240
(~2.50us),feeding0.5ms/240 (~2.08us). Timergranularity/probe overhead/coldJIT make
these coarse diagnostic costs, not calibrated steady costs. Copies/reference reuse
and keyed hash costs are included. Global iterator speed was not benchmarked.
Physics replay is deferred: positions without velocities,joints,contactimpulses,
work and mechanicalenergy do not form a valid shared-contact substitute.

## Ranked hotspot register and exactness constraints

| Rank / stable S2 IDs | Finding classification | Potentially avoidable question; essential work retained |
| --- | --- | --- |
|1 / S2-01,S2-02|PLAUSIBLE sustained hotspot; CONFIRMED largest short-pilot bucket|Contacts/projections and articulated solves are real. Scratch/bounds/anchor lifetime/repeated derivations merit further evidence, not fewer iterations or changed coefficients. Metadata alone is a small sampled subset; no end-to-end cache benefit.|
|2 / S2-03|PLAUSIBLE sustained hotspot; CONFIRMED many ordered queries/candidates|Index/result allocation and repeated geometry are candidates. Preserve every ray,tie/occlusion/RGB/input and off-camera eye; no finite-range shortcut or blanket elimination.|
|3 / S2-05|PLAUSIBLE sustained hotspot; CONFIRMED recurrent/learning work|Split dense sums,compiled topology,somatic alignment/deltas with independently priced probes. Caches already exist; real learning and recurrent state remain essential. No gain from disabling them established.|
|4 / S2-04|CONFIRMED mouth/index work in short pilot; sustained impact UNKNOWN|Post-movement index/order/physical intake/feedback are mandatory. Synthetic feasibility prices no legitimate optimization; no fake contact in production.|
|5 / S2-06,S2-07,S2-10|Small observed short-pilot categories; event-heavy cost UNKNOWN|Retain nutrient transfers,eggfunding/reproduction/death,observer truth. No hatch/birth-rich workload or event scaling; cannot dismiss spikes.|
|6 / S2-12-M,S2-09/11/12|UNKNOWN new GC/CPU/overhead effect|No diagnostic windows reached. Preserve historical CPU/graphics evidence with historical scope. No leak,thermal,cachebandwidth or user-device inference.|
|7 / S2-08|UNKNOWN|Disconnected fixture has no crossings; no tube result.|
|Control / frame().steps cumulative assumption|REFUTED by source and failed assertion|Researchcounter misuse repaired in source, unexecuted. APIframe() is observer-consuming, not a passive cumulative measurement.|

## Validation, repair, publication and stop

Local and measured-sourceCI npmci,385/385fast,typecheck/build and actual production
Worker gates passed. Focused Chromium ordinarystartup/import/eightfixedpilots
passed. ScientificP01 failed and remainingwindows skipped. Firefox/full-suite
expansions not run; no all-green science claim. Routine PR validation41721189976
passed with extended/npmtest/browser and Pagesassemble/deploy SKIPPED.

Analysis verifies every archived SHA256/length and17remoteGitblobs; allreal complete
snapshots agree, original source digests unchanged within run and budgets pass.
This verifies **the preserved partial evidence**, not scientific completion.
Verification fields for timed tick equations/energy are NULL when no valid timed
window exists, rather than vacuous passing. Failure/ledger remain immutable.

After stopping, research-only count plumbing was repaired to increment an
independent completed-tick counter in the Worker pump, without calling/draining
frame(). Failed-window local raw objects will be preserved before propagating an
assertion failure. The repaired research compilation passed **without executing
another tick/pilot/window**; functional confirmation awaits a new authorization.
Temporary execution workflow removed; original registered YAML retained outside
.github, and original faulty source remains pinned for audit. Do not replace
immutable evidence or claim repaired code was the measured source.

Verified conclusions/blocked status are delivered via a separate docs-only fork
PR; researchcode,rawarchives,checkpoints,probes and helpers remain on draft90.
Historical drafts66/69/80/87 unmerged; main runtime/testing/upstream unchanged.
No upstreamPR/merge/release,productionoptimization,Pages/Wiki/schema/VIDA3D change.
Shared #67 remains actual In progress (bridge41721216654/job126214164078 readback).
**STOP.** Any new timed lot needs explicit owner authorization and a fresh
preregistered bounded recovery protocol that preserves this failed observation.
