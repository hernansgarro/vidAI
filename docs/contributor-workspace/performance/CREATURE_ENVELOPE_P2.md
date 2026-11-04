# Creature envelope P2 — isolated anatomy calculator

> **P4 integration update:** P4 now caches this descriptor and refreshes the current-pose fallback after authoritative movements. The lifetime limitation below still applies. See [P4 contract](MAINTAINED_GRID_P4.md). The isolated-stage description below records P2 at its original scope.

**Fork/testing only, 2026-11-04.** Based on P1 testing
`3f66276e3f5b223af490a9c1a857b604dcd40993`, branch
`feature/conservative-creature-envelope-p2`. Scope and acceptance were recorded
before implementation in [fork PR107](https://github.com/hernansgarro/vidAI/pull/107#issuecomment-6639493699),
with the [solver limitation decision](https://github.com/hernansgarro/vidAI/pull/107#issuecomment-6639530313).
Canonical tracking remains upstream #67/#57, consulted read-only under the
owner's explicit prohibition on upstream writes. This is P2 of the
[maintained-grid plan](MAINTAINED_SPATIAL_GRID_DESIGN.md), not a second backlog.

## Bound and proof

`creatureEnvelope.ts` exports `calculateCreatureEnvelope(parts, maxAnchorGap?)`.
For each rectangular segment i, cache its corner radius
`h_i = hypot(width_i / 2, height_i / 2)` and mass
`m_i = max(0.35, dimN_i * dimM_i * BASE_PART_DENSITY)`, exactly the current COM
mass model. For a parent-child connection e, authoritative local face anchors
give `l_e = |parentAnchor_e| + |childAnchor_e| + gap`. Here gap is a bound on the
Euclidean separation of the two world anchors, not a joint angle or distance
between segment centers. Path distance `d_ij` is the sum of these lengths on
the unique tree path between i and j. With `M = sum(m_j)`, compute

`R = max_i (h_i + sum_j (m_j / M) * d_ij)`.

The triangle inequality gives `|c_i - c_j| <= d_ij` in every allowed posture.
Since COM is `C = sum_j (m_j / M) * c_j`,
`|c_i - C| <= sum_j (m_j / M) * |c_i - c_j|`.
Every point in segment i lies at most h_i farther away, proving the radius.
Thus `[C.x-R, C.x+R] × [C.y-R, C.y+R]` is a rotation-independent containing
square. Branches and moving COM are covered explicitly; choosing half the
longest path or measuring only the initial pose would not establish this.

All relative and global rotations are relaxed, including beyond genetic angular
limits. Ignoring angle limits and self-intersection restrictions enlarges the
permitted set, so folding, branching, arbitrary base-angle offsets and transient
angular overshoots cannot invalidate the bound. It is a conservative upper
bound, not the exact attainable maximum or a tight minimum square. No private
physics/stretch simulation, angle sampling or optimization computes it.

## Critical lifetime limitation and safe alternative

**The current solver supplies no hard maximum anchor separation.**
`advanceOrganismPhysics` uses finite velocity iterations and conditional finite
pose repair; `projectBodyJoints` and `resolveBodyContacts` do not enforce a final
distance invariant. Soft wall forces also do not guarantee strict aquarium
containment. Historical/current import checks require finite part coordinates,
but not coincident or nearby anchors. A two-part imported body can therefore
exceed any small anatomy-only radius without violating that validation.

The API makes this limitation explicit:

| Value | Contract |
| --- | --- |
| `idealRadius` | Finite anatomy bound with coincident anchors; covers every ideal articulation, not arbitrary solver residuals |
| `radius` with explicit finite gap | Conditional lifetime bound if the caller can prove **every** hinge separation remains at most that gap at **every** indexed phase |
| `radius` without gap, multiple parts | `Infinity`: no finite lifetime certificate; never convert this to a finite grid AABB or silently use idealRadius instead |
| `radius` for one part | Finite: there is no hinge residual |
| `encloseCreaturePose(descriptor, segments)` | Safe square for the **current** pose, using actual centers and cached masses/corner radii; no gap assumption |

The current-pose fallback computes COM in the same mass/summation order as
`calculateOrganismCOM`, then `max_i (|c_i-C| + h_i)`. It retains at least the
finite certified radius, or the ideal radius when uncertified, and expands to
cover the observed pose. It remains safe even when a supplied gap claim is
false. `source` distinguishes `anatomy` from `pose-fallback`; arithmetic overflow
returns `source: 'unbounded'`, `radius: Infinity`, `bounds: null`, requiring the
future consumer to bypass coarse culling/use its existing safe broadphase.
Invalid nonfinite coordinates and mismatched anatomy/pose counts throw.

This explicitly requested fallback is necessary for a demonstrable guarantee
under existing physics/import behavior. There is no invented residual allowance,
clipping to aquarium size, automatic stretch repair or solver change. A future
consumer must recompute the pose fallback after **every** relevant pose change
or retain its existing exact part bounds. An audit cannot make stale fallback
bounds safe. A truly constant finite birth radius for unrestricted runtime
states remains unavailable without a separately established invariant.

## Lifecycle, numeric domain and isolation

Calculate the tree descriptor once when creating/replacing an anatomy, retain it
as caller-owned transient data, and reuse it during movement. It snapshots and
freezes masses/radii without retaining mutable part/pose references; there is no
global WeakMap or silently stale identity cache. Recompute after dimensions,
connections or the mass law change, including import/world replacement. P2 does
not call it from spawn/import: lifecycle wiring belongs to P4.

Birth work is O(n²), retained descriptor O(n), and explicit current-pose fallback
O(n). Supported anatomy matches existing 1–7 ordered connected rectangular parts,
integer dimensions 1–10, width/height seven times those dimensions and cardinal
face connections. Invalid, disconnected or cyclic structures reject explicitly;
no unsupported anatomy is silently assigned a finite radius. Original import
rules and historical files are untouched.

Outward slack of 64 binary64 epsilons per arithmetic stage, with coordinate-scale
slack for the fallback COM and final square, guards normal finite arithmetic
rounding/cancellation. This numerical allowance is separate from physical hinge
gap. Large-coordinate and overflow cases are tested; overflow fails open rather
than clipping or yielding NaN bounds. This is a binary64 geometric implementation,
not a formal interval-arithmetic certificate for arbitrary JS math engines.

Only rigid body rectangles are enclosed. Forward mouth reach, vision range,
display glows and other consumer-specific geometry require their own bounds.
Nothing imports P2 from the runtime, Worker, persistence, P1, optics, feeding or
contacts. No save fields, PRNG draws, physical/genetic/energy changes or new UI.
P1 capacity must still be explicitly provisioned for any eventual square; its
default coverage of tube water does not prove coverage of an arbitrary envelope.

## Verification and delivery

Eleven new fast tests cover the single-body analytic result, maximum elongated
chain, unequal-mass COM displacement, branched/folded/rotated and joint-limit
postures, certified accumulated residuals, all 64 catalogue anatomies, arbitrary
imported separations, large coordinates/cancellation/overflow, invalid trees,
immutable descriptor reuse, full snapshot/PRNG nonmutation and source isolation.
Fixtures use direct kinematics and authoritative corner/COM functions to inspect
all corners; no fake stretching dynamics or historical experiment rerun.

Run `npm run test:fast`, `npm run build` and actual `npm run test:worker`; keep
existing automatic browser/aggregate gates. Exact-head results, internal PR and
testing merge/publication receipts live in the internal PR. The initial local
dependency-cache path failure and new-test import/type corrections remain
disclosed; no inherited test/threshold/baseline changes. No speedup claim.
P3/P4, main promotion, upstream submission and actual Wiki publication are excluded.
