# Stage 3.7 isolated Worker research

The only scientific campaign is registered in upstream issue57 comment6615597868.
Do not run `measurement.mjs` to inspect results: it executes simulation experiments
and is not routine validation. Completed/lost scientific windows cannot be repeated
without separate owner authorization. Historical Stage3.1–3.6 are unchanged.

Ordinary `npm run build` never imports these modules. `build.mjs` injects probes and
counterfactual branches into Vite's in-memory source only when explicitly called.
Production source files stay bit-for-bit unchanged. Dummies never alter force laws,
fixed ticks, authoritative random streams, save schemas or normal-build settings.

Modes: real,vision,brain,learning,feeding. Profiles:off,counter,phase. Vision/brain
use per-organism genuine first-three-tick records; keyed selector uses seed73,
logical tick and stable ID without visiting the simulation PRNG. Vision preserves
all retinal channels and typed ray hits (coordinates represent recorded events,
not current surfaces). Brain substitutes neural outputs; recurrent hidden state
freezes but normal learning and physical motors remain. LearningOFF bypasses paid
motor and sensory updates; it also changes future deltas, energy and trajectories.
Feeding replaces oral grids/geometry/contact intake with capped1J/organism/s reserve
transfers, reports source=universe available reserve, and sets contact/intake cues
to zero. No artificial prey injury, genuine feeding event or physical intake signal.

Counter/timer nested probes sample ordinal1mod16; reported work counts are sampled,
not exhaustive whole-window totals. Top-level phase clocks run every tick only in
phase mode. Nested elapsed spans subtract children. Parent phase totals include
these children; never add both levels. Physics `drag-walls` includes the existing
prepaid motor/integration block until joint solving, not pure hydrodynamic drag.
Cardinal-anchor and ray/contact operations are not all individually clocked on
unsampled ticks. All-real full snapshots must exactly match ordinary fixed ticks.

Reproducibility after explicit authorization for a NEW campaign: Node>=22.12,
`npm ci`, `npm run test:fast`, `npm run build`, `npm run test:worker`; exact pinned
source, official Playwright1.58.2 container; use the retained registered-workflow
YAML and measurement.config.mjs. Existing evidence makes the runner refuse reuse.
Reproduction must go to a newly authorized branch/output path, never delete the
original receipts. Ports4183/4184/4185; viewport1280x850,DPR1,actual productionWorker,
MAX,causticsOFF,no selection/track/inspector,fixed disconnected topology.

For analysis only (NO simulation/browser execution):
`node scripts/performance-stage37/analyze.mjs`
It verifies receipt hashes/lengths, exact pilots, tick equations, energy closure and
finite budgets, then derives findings.json and verification.json. Raw files include
full checkpoints/pilots/endpoints,actual built JS/maps,recorded sequences,primary
receipts,independent trace,ledger,source/environment manifest. Summaries are derived,
not replacement observations. Original immutable Git commit links appear in report.

CPU: Linux `/proc` process counters independently measure browser-group execution.
C04 user-timing marks identify that trace's actual main/WorkerPID/TID. Navigation
creates a fresh Worker each window; do not apply C04's TID to primary windows.
Trace GC intervals union nested events; V8inter-GC allocation is a proxy excluding
partial intervals, not heap retention/allocation stack ownership or a leak test.
STOP after this lot. No production optimization or Stage4 implementation.
