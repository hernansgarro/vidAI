# Stage 3.11 — GC observer calibration

Explicit owner authorization2026-11-04, preregistered BEFORE coding in upstream#57
comment6630109681; pinned main base3e1cfeec8f71f8c76056848b344596db5148e329 recorded
in6630115964. Previous3.8/3.9/3.10 conclusions are now on fork/main through docsPR101.

Six fixed360tick windows: L01none/G01light/T01detailed/T02detailed/G02light/L02none,
n2percondition, same unchanged150spread fixture.60same-mode warmup ticks then exact
reset per scientific slot. One24tick lean correctness pilot and one4+3counter check;
maximum2551finite research ticks.120s active/720s inclusive runner/30s useful window,
no new slot after600s with120s closure reserve. Stored raw192MiB +2MiB independent
emergency; each of4trace JSON streams<=16MiB. No retries/replacement after first
scientific failure. All full endpoints must match archived3.9/3.10 exactly.

Light categories ONLY v8,blink.user_timing; detailed categories same as3.10, adding
toplevel and disabled-by-default-v8.gc/v8.gc_stats. No JS stack sampling/forcedGC.
Same lean Worker binary for ALL6 modes; compiled SHA must match immutable3.10.
Vite-only helpers unchanged; production files/import graphs remain unchanged.

Goals: compare primaryTPS/elapsed per condition; quantify observer overhead and
lean drift; identify complete outerMinorGC/MajorGC incidence/durations/union share
on marked Worker/main identities. The descriptive modest-cost flag needs BOTH
light observations within lean min/max envelope expanded5%; no significance or
causal correction. Detailed inter-GC NVP allocation is separate. Positive outer
heap reduction is collected/churn diagnostic, NOT allocated or retained bytes.
Missing events/identity/metadata are unavailable, never zero. Old failure records
are immutable. No untraced GC claim from a heavily perturbed observer.

Reference YAML outside.github is historical after this single lot; remove active
launch workflow when complete. Research draft stays unmerged. Only verified
conclusions, not probes/raw/workflows, are integrated into main per owner request.
No Stage4 optimization, runtime tuning, upstream submission orVIDA3D.
