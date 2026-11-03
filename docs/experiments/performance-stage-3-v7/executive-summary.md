# Stage 3.6 executive summary

Research complete; Stage 3 ongoing; stop.

- CPU attribution is verified: Worker~98.7–99.4%of one logical processor; main/UI~98.1–98.4%; additional software graphics~73.7–75.3%. Browser~285–287%, or~71%of four reported CPUs. Worker is about35%of browser CPU, not96–98%.
- Cap30→10: primary median175.10→184.43ticks/s(+5.33%); three pairs+5.90/+9.77/−0.51%. BrowserCPU-ms/tick16.778→15.527(−7.46%); total CPU nearly unchanged. No demonstrated cooling benefit.
- Actual report cadence19.64→8.49/s; Canvas52.03→51.34FPS. Fresh-state spacing grows~51→118ms; human/input acceptance unknown.
- Traces show costly UI drawImage/composition and real Worker allocation/GC. Four long traces identify query, cardinal-anchor, somatic-delta and contact locations; avoidable fractions remain unknown. WorkerGC is~2.4–2.7%of diagnostic wall time and does not clearly fall per tick.
- Short profiler control reducesTPS5.78%andFPS14.12%; diagnostics must not be pooled with primaries or treated as a causal explanation of the untraced gain.
- No temperature/watts/throttling/hardware-desktop measurement. Software SwiftShader limits extrapolation.
- All12windows retained once,249.714sactive/372.628srunner; exact120-tick state/PRNG/energy pilot and archive/hash/tick verification passed. No production optimization, merge or next batch.

Propose separately authorized Stage3.7: fixed-logical-tick Worker phase/allocation diagnosis of measured query/geometry/delta/contact suspects. See [full report](report.md), [findings](findings.json), [verification](verification.json), [figure](throughput-cpu.png).
