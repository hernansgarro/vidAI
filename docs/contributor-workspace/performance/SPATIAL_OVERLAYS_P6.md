# P6 — Maintained spatial diagnostics overlays

**Fork testing only.** Authorized base P5
`ebccd7129142b580304cbfcea2440682671b68a1`, branch
`feature/spatial-overlays-p6`. Canonical upstream #67/#57 are read-only under
the owner's explicit no-upstream-write restriction. Main is excluded.

## Registered scope, decisions and acceptance (before implementation)

- Add two independent session-only Advanced Settings toggles, OFF by default:
  actual maintained cell occupancy borders and actual P4 creature enclosures.
- Read raw P4/P1 memberships and stored bounds, without reconstruction, queries,
  query stamps, synchronization, audit, repair or physical mutation.
- Nutrient green, carrion/egg red, organism/body-part blue; saturated channel
  addition. Empty cells have no border. Overflow is explicitly counted rather
  than assigned invented matrix cells; finite overflow creature bounds remain
  drawable. No clipping of authoritative data to tank dimensions.
- Draw after decoration and before creatures, subtle CSS-pixel width and inward
  inset, under existing camera/zoom/DPR transforms. Include tube water and edges.
- Show P4's conservative current-pose square; distinguish it from P2's finite
  single-part anatomy guarantee and uncertified articulated lifetime radius.
- Gate collection and Worker frame payloads by each observer toggle. Keep
  configuration and render data outside authoritative settings/snapshots;
  discard stale data on disable/reset. Preserve frame acknowledgements.
- Verify RGB combinations/removals, real memberships, edge/tube/overflow bounds,
  independent options, draw order, camera scaling, no disabled work/payload,
  exact state/PRNG/energy and historical continuation.
- Run npm ci, fast tests, build, actual Worker, required browser gates and a
  focused visual browser inspection. Retain all inherited references/gates.
- Internal PR targets testing; merge/publication authorized after validation.
  No P7+, consumer query replacement, main/upstream write, baseline reset,
  release/publishing-workflow change, performance campaign or speedup claim.

## Implementation contract

Access: **Ecology & Physical Settings → Advanced Settings → Show spatial cell
borders / Show creature enclosures**. Both are independent and session-only;
imports/restarts keep the choice, reload disables both. No saved observer or
simulation settings are extended. Cell colors use actual raw nonempty P1 buckets,
including organism and individual body-part views; repeated kinds saturate.
A stale/corrupt assignment is shown as stored, never reconstructed or repaired.
Use P5 separately to investigate integrity.

P4 exposes its stored coarse bounds and cached P2 finite-certificate flag through
a read-only visitor. Solid blue means a finite anatomy certificate (currently
single-part); dashed blue means the conservative current-pose fallback actually
used by P4. Neither includes forward mouths, glows or sight ranges. No additional
ideal-radius square is drawn or misrepresented as an unconditional guarantee.

Overflow entry totals are explicit. No fabricated cell is drawn for overflow;
finite creature enclosures remain drawable. Null/unbounded creature bounds are
counted, never converted to a finite square. Rendering clips primitives to the
viewport and uses the existing tank/tube fade mask; data is not clipped to water.
Empty cells have no colored outline. Cell inset and stroke width are one CSS
pixel at all zoom/DPR values; outlines too small for the inset are omitted.

Collection happens only for enabled layers, from the authoritative host on frame
production (not ticks). Disabled frames omit the field entirely. Cells transfer
only coordinates and saturated RGB, not IDs or entity references. Creature
payloads contain copied bounds and certificate/overflow flags, not genomes.
One acknowledged frame stays in flight. A configuration revision and existing
world epoch prevent late pre-toggle/import frames from restoring stale paint.
The fallback collects from its own authoritative world during enabled draws.
Neither path initializes a missing matrix. There is no perception/physics/input
or save dependency on this observer data.

Seven fast cases cover colors, assignments/corruption/removal, empty/OFF and
independent payloads, tube/edge/overflow/bounds, drawing scale/culling/layer order,
and all144 inherited P3 hashes plus split continuations. Real production Worker
checks cover independent toggles, paused frame refresh, reset/stale epochs and
exact continued state. Chromium/Firefox cases exercise Worker and fallback,
native paint/colors, camera zoom and DPR2, unchanged exports, imports, mobile
bounds and disabled paint/transport. CI retains focused screenshots for visual
inspection; this adds evidence upload only, without changing any existing gate,
runner, dependency, timeout or publishing workflow.

Exact results, implementation/merge heads and publication receipts are recorded
in internal PR112. No upstream completion or actual Wiki publication is claimed.
