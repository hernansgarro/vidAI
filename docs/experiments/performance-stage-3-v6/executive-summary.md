# Stage 3.5 executive summary

The research-only30→10reports/s cap change has a workload-dependent observed effect. With30starting organisms it raises MAX throughput230.1→243.4ticks/s (+5.78% median; paired +3.58%/+8.13%). With15it changes601.2→595.3(−0.99%; paired −1.58%/−0.34%). There is no demonstrated universal benefit or basis for changing production policy.

Canvas remains about59–60FPS, but fresh authoritative states fall from~22/19.8reports/s to~8.8/8.7for15/30. Repainting a stale state is not extra simulation progress or smooth fresh motion. Human movement smoothness/input-latency acceptance remains untested.

Of the directly timed communication phases, synchronous postMessage is largest (~.4–.7ms/frame); frame construction is~.1ms and replica application typically0–.1ms. At30, cutting reports reduces post-call wall totals by~.74/.93percentage points of Worker wall time. That does not explain the full3.58–8.13% throughput contrast. CPU competition, Worker GC, cache/bandwidth, deserialization and scheduler attribution remain UNKNOWN.

Overhead controls are inconclusive at small-effect precision: full versus lean median+0.92%, adjacent pair signs+3.89%/−2.48%, individual control rates578.6–704.1ticks/s. They do not establish zero overhead.30's repeated positive effect is suggestive; two repeats on a software-rendered CI host cannot establish a stable desktop gain or causal mechanism.

The single most informative next bounded study would be a preregistered30-organism/cap30-versus10 contrast with **separate Worker/main thread CPU and GC attribution**, keeping the same minimal observer profile, reporting both a lean throughput control and a separate profiled diagnostic. Do not run it automatically. Essential optics/index/allocation, articulated contacts and recurrent neural/learning work retain the strongest historical coarse evidence; this study does not newly split their costs. Tube crossings remain a separate unresolved workload.

All8primary +4overhead windows completed ONCE, no failed scientific slots or reruns;120logical-tick full state/PRNG/energy pilot passed. Active research173.099s,11,800,912bytes uncompressed archives, setup readiness53.703s after first clock step,216.442s inclusive runner wall; original run41664520289 and analysis-only verification41665757852 succeeded. Production source, main/testing, historical studies and upstream remain unchanged. Fork draft PR80 must remain unmerged. Stage3 remains ONGOING; STOP after3.5.
