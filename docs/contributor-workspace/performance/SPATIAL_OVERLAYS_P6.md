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
  release/workflow change, performance campaign or speedup claim.
