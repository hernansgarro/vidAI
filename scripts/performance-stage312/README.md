# Stage 3.12 — Worker transient allocation source ownership

Explicit owner authorization2026-11-04; preregistered BEFORE coding in upstream#57
comment6631707584. Base fork/main a856a2d9d9f5e650a95be3abeadbd908105e70db.
Six360tick windows L01/G01/A01/A02/G02/L02, n2each lean/lightGC/lightGC+sampling;
60lean warmup and exact reset each. Fixed150spread state and all complete endpoints
match archived3.9/3.10/3.11 exactly. Ordinary Worker binary stays byte-identical.

Two24tick correctness pilots (lean, sampled) and one4+3counter,2575finite research
ticks max. Paused target/Runtime/HeapProfiler capabilities checked before finite
controls.120sactive/720srunner/30suseful; no new slot after600s,120sclosure reserve.
Stored raw192MiB +2MiBemergency;4light traces<=16MiB each,3heap profiles<=8MiBJSON
each with conservative2xcodec allowance. No scientific retry/replacement.

Sampling attaches ONLY actual dedicated simulationWorker via CDP target/session,
verifies URL/scope/origin, interval262144bytes,stackDepth64,both collected-object
flags true. HeapProfiler.startSampling immediately before resume; NO midwindow
getSamplingProfile. Stop light trace/close CPU/useful window BEFORE stopSampling,
which may forceGC in V8 inspector; then exact full snapshot export. Record bracketing
Worker clocks and command tails. No separate collectGarbage or heap snapshot.

Allocation stacks/weighted sample bytes identify source candidates, NOT CPU cost,
retained heap, leaks, wire bytes or removable savings. Keep native/unmapped/generated
locations and exclusive versus inclusive ownership distinct. Source maps/JS are
archived exact compiled assets; existing locked @jridgewell/trace-mapping is an
analysis-only dependency, no package change. Two profiles are descriptive, not an
allocation census or universal ranking. Price sampler overhead against lightGC
AND lean controls; a5%light-envelope tolerance is descriptive only.

Primary protocol/schema: https://github.com/ChromeDevTools/devtools-protocol/blob/master/json/js_protocol.json
Inspector behavior: https://github.com/v8/v8/blob/main/src/inspector/v8-heap-profiler-agent-impl.cc

Research draft/probes/raw stay isolated. Remove active launch workflow after the
single lot. Verified conclusions return to fork main in a DOCS-ONLY PR under the
standing instruction; no Stage4/production optimization/upstream submission/VIDA3D.

## Completed registered lot

Scientific run41837660795/job126600657300 succeeded, sourcea26569b0d039404cdb5bb8ceeeac46be7916e5d0,
immutable original28fb12bb67e8666b38d3e12e355dacaae5931993.6/6retained, all full endpoints
match3.9–3.11; budget/integrity pass. Active launch workflow removed. STOP after
this lot and authorized docs-only integration; no extra scientific execution.

Analysis-only reproduction with existing npm dependencies (source mapping uses
the already locked trace-mapping package):

```sh
node scripts/performance-stage312/analyze.mjs
node scripts/performance-stage312/attribute-allocations.mjs
python scripts/performance-stage312/verify-source.py
```

Full original-evidence commit is pinned. Functions/closest original caller stack
locations are ownership context, not exact allocating expressions. Exclusive groups
close to sample weights; inclusive source groups overlap. Tree/sample aggregates
differ slightly; reports use one consistent weighted-sample denominator.
