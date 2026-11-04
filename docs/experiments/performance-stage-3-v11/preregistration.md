### 2026-11-04 — Stage 3.9 preregistration: complete large-population attribution with reliable evidence

Hernan now explicitly requests starting Stage 3.9. This supersedes the prior STOP only for this single bounded research lot. No additional specifications are needed for routine experimental decisions. Searches found no allocated Stage3.9 branch or separate scoped issue; shared #67 remains the outcome, with #57 as handoff. Preserve original3.8 including failed P07 and unstarted slots; no replacement or retroactive repair.

Authenticated account hernansgarro. Fresh fork branch audit/performance-stage-3-9 from current fork/main dd7925b9d02a67459bb68985cf2d5647b737247e; upstream/main041362eefa64971d9038f4ad7ec4fd59a747d3ec and testing4bda30a269bd8650b6e12a99b99e4af5ef673d42. Source-only reuse of reviewed Stage3.8 helpers from e5101841d57cdb0e035c310b5551609b536038ff; new scripts/performance-stage39 and output docs/experiments/performance-stage-3-v11. No historical research merge. New fork-internal DRAFT, left UNMERGED. No main/testing merge, upstream PR/code/merge, production optimization, simulation-rule/schema change, Pages/Wiki publication or VIDA3D.

Research-only archive correction: lossless content-addressed genome deduplication across organism/egg/lineage snapshot records, with exact JSON round-trip hashes; original raw simulation meanings/order/values unchanged. Store dictionaries before references. Append-only exclusive-create gzip/fsync/hash/readback, write original receipts before validation. Count physically stored uncompressed envelopes+dictionary once, separately report full expanded logical bytes. Normal archive ceiling192MiB with separately reserved2MiB emergency manifest/failure ledger that never retries a rejected full payload. Before first timed slot, prove decode equality on largest fixture and pilot, exercise forced small-budget refusal/emergency metadata recovery without running simulation, and conservatively project all18slots+two bounded traces; stop before measurements if projected storage exceeds budget. No cap extension to hide failure.

Fixtures100spread and150spread retain the unchanged Stage3.8 generation recipe: equal CUR001–005 proportions, normal inherited genomes/reserves/learning, seed73, four ordinary nutrients per organism,4000x2000/4000x3000, closed-v1/passive-work-v3/capsule-v1/decay-v2, viscosity.18, gravity0,inflow0,maxOrganisms150. Freshly generate equivalent fixture state and verify hashes against archived3.8 anchors without replaying old measurements. Count200 stays outside the unchanged150 settings cap. No energy/age/fitness manipulation. New100dense is cloned from100spread, translating each whole initial body only, centering its initial full rotated AABB in a fixed10x10 grid of140px cells centered in the SAME4000x2000 habitat. Existing widths/heights<=112px allow>=28px separation between cell-contained AABBs. Assert all body AABBs fit cells, stay inside walls, and have zero initial interorganism SAT intersections; unchanged food/headings/velocities/genomes/PRNG/settings/energy. No placement search or simulation-based selection. Self-intersections inherited from ordinary spawn remain and are reported. This tests higher initial concentration without the original68external-overlap shock. Natural evolution, egg bursts and independent morphology/food factors remain out of scope.

Actual Chromium productionWorker pump, MAX, fixed1/60 ticks, causticsOFF, no selection/track/inspector,1280x850 DPR1, default centered stationary camera, full off-camera work. Maintain30/s cap and one-in-flight ACK. Same60-complete-tick warmup then exact fixture reset for every slot. Independent completed-tick counter and exact stop guard; no draining frame.steps interpretation. Primary/phase/overhead/trace windows use360ticks (6simulated seconds), increasing useful time relative to first-tick/JIT/control overhead. Finite speed probes use180ticks each at requested1x/2x with real pacing. No cadence ablation or extra configuration.

Completion notification is lightweight; record precise Worker tick begin/end and processCPU bracket BEFORE requesting/handling the full final snapshot. Preserve snapshot separately after CPU boundary; verify no extra ticks. This avoids3.8's large-export CPU bracket contamination. Record actual bracket skew and thread identity limits; do not call elapsed phases threadCPU. Actual browser/backend/cgroup/source/binaries/maps, endpoints, traffic, counters, memory and trace loss metadata preserved.

Exact18-slot order:
P01 100spread lean;
P02 100dense lean;
D01 100spread phase;
D02 100dense phase;
P03 150spread lean;
D03 150spread phase;
P04 100dense lean;
P05 100spread lean;
D04 150spread phase;
P06 150spread lean;
D05 100dense phase;
D06 100spread phase;
O01 100spread research-off;
O02 100spread counter-only;
T01 150spread lean+trace;
T02 100dense lean+trace;
S01 150spread lean requested1x180ticks;
S02 150spread lean requested2x180ticks.
Two lean and two phase repetitions per fixture, reversed/interleaved controls; overhead/trace/pacing are separate single diagnostics. No pooling traced/phase windows with lean primaries or summing overlapping phases. Robust medians/ranges, individual runs and explicit n; no significance/asymptotic/desktop extrapolation.

Pilot before FIRST timed scientific slot: fixed24tick100spread lean/research-off/counter/phase complete-state/settings/PRNG/energy equality; 24tick150spread calibration; 4+3 draining-frame cumulative counter check. Dense placement and archive preflight are static checks, not performance trials. Phase ledger times mutually exclusive tick stages with residual; sampled work counters ordinal1mod16, no nested clocks. Distinguish self/external broadphase candidates and actual resolved contacts; count actual body advances/parts/joints, rays/candidates/tests, mouths/index entries, and energy-activity records where feasible. Research frame assembly/postMessage timers stay outside tick totals. Snapshot-only initial/final intersections are not dynamic contact counts.

Two traced slots use independently marked Worker/main PID/TID, /procCPU, unioned GC intervals, V8inter-GC allocation proxy and any reliable heap signals. Bound each trace to16MiB JSON; keep tracing perturbation separate. Main performance.memory is not Workerheap/leak evidence. Record guard/contact/mortality/learning/ecology divergence; no hidden exclusions or coefficient tuning.

Hard limits: <=18timed attempts plus bounded pilots; <=360s active including warmups/correctness; <=720s runner including research builds; each slot<=30s; normal stored raw<=192MiB plus2MiB reserved emergency. npmci/385fast/build/actualproductionWorker before runner. Compilation/correctness plumbing repairs permitted before FIRST timed slot only, preserving incidents; after it starts, stop and preserve on any invalid/lost result or budget failure, no rerun/replacement/automatic second campaign. Temporary isolated push workflow runs once then is removed; reference YAML remains outside.github. Protocol/source pinned before execution.

Acceptance: exact reproducible fixture/roundtrip/counter/energy proofs; retained original/validated receipts and honest slot ledger; comparable100/150 lean and phase data, overlap-free concentration attribution, candidates/contacts/self-vs-external burden, memory/CPU/export/probe limits, actual finite-speed behavior, hypotheses/risks and missing work. Publish report/analysis and durable #57/#67 handoff, keep research DRAFT/unmerged and prior evidence intact. Native #67 In progress readback41771636509/job126382437635 from command6622316194 remains the verified status; no duplicate card. STOP after this lot; no Stage4 or production optimization.

Registration: https://github.com/smeagol44/vidAI/issues/57#issuecomment-6622977505
