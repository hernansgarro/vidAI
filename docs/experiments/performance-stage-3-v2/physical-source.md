# Stage 3.2 — invariant physical metadata: source inspection only

2026-11-02; unchanged runtime base `11248f3431604a1b883a7a948a6e6baddc3fafdd`.
**S2-02 must receive its own future bounded Stage3 investigation. It is not closed.**
No derivation timer, cache variant, retained-heap campaign or new physics trial ran here.

Stage3.1 counts remain22500/45000 mass/inertia derivations in75 sampled ticks:
300/600 per tick for75/150 body parts over four substeps. These counts describe
`advanceOrganismPhysics`, **not every derivation across all consumers**. They do not
price CPU time, show all redundant calls, or establish cache benefit.

## Dependencies and existing reuse

| Consumer/candidate | Dependencies / possible invariant scope | What must stay dynamic or exact |
| --- | --- | --- |
| Substep part mass/inertia/inverses | `dimN`, `dimM`, dimensions, constant BASE_PART_DENSITY=.40; for a finalized immutable part/context | Preserve `Math.max(.35,dimN*dimM*density)` and `(1/12)*mass*(width*width+height*height)`, then reciprocal, in original operation order. Existing typed scratch arrays store values only for the current organism/substep. |
| Contact wrapper inverse mass/inertia | Finalized part plus **density argument** to `resolveBodyContacts` | Contact uses `12/(mass*(width**2+height**2))`; do not substitute the reciprocal of the substep formula. Existing body wrappers are pooled, but mass is rebuilt each contact iteration along with dynamic bounds. |
| Joint pose-projection local data | Parent/child anatomy, parent index, attachment directions, sizes, density | `projectBodyJoints` already precomputes local masses/inertias/anchors into scratch once per call, reuses within its iterations, and recalculates next call. Rotated anchors, matrices/determinants and corrections depend on pose. Stage3.1 did not count these derivations. |
| COM weighting | Per-part mass is a candidate, total mass depends on finalized anatomy | Weighted world position and velocity change every call. Do not cache whole COM. |
| Eye/mouth local anchor | Organ direction/slot plus host dimensions, after anatomy normalization | World origin depends on pose. Remapping/slot edits invalidate local anchor metadata. |
| Neutral/local corners or dimensions | Finalized width/height, anatomy identity | World vertices, rotation sin/cos, transformed AABB, cell bounds and contact configuration change after movement/projection. Existing within-pass geometry reuse remains. |

The inspected mass formulas do not use current usable energy, structural biomass,
world position, viscosity or gravity; density is a global constant in the motor path
and an explicit parameter in the contact API, not a discovered per-part material allele.
That source dependency statement is not a measured cache benefit.

Physical anatomy is stable during ordinary living updates in the inspected paths;
that is **not proof of universal object immutability**. Offspring construction edits
copied part dimensions/topology; imports/migrations construct/remap records. A safe
cache construction boundary must occur after these operations. Same-object authoring
or anatomy normalization requires invalidation; physical-context parameters require
context-aware keys. Genome sharing/identity across live organisms, eggs, Bank and
lineage must be mapped before assuming per-genome sharing or death-time reclamation.

Newly clarified source fact: repeated immutable work spans contact wrapper rebuilds,
pose-projection setup and COM as well as the counted motor substep block. This widens
the inventory, **not its measured CPU impact**. Existing bodyPool/contact cell pools
already reuse objects; retained reference behavior on empty worlds/reset is a future
memory inspection question, not an observed leak. No TTL, sweeper, WeakMap or LRU
has been selected.

## Mandatory future bounded study (proposal, not execution permission)

1. Count each consumer separately, sample coarse derivation blocks and call ancestry;
   price timers/probes with matched no-probe controls, avoiding a timer per scalar op.
2. Establish dimensions/density/context/anatomy invariants; quantify repeated calls
   versus unique finalized identities and required invalidations.
3. Compare original arithmetic recomputation with minimal candidate lookup/precompute
   and existing scratch. Include cold construction versus warm use. Report absolute
   ms/tick and full-kernel effect, paired uncertainty and any negative result.
4. Report numeric payload bytes **and measured retained heap**, entry/container
   overhead, hit/miss behavior and GC. Numeric slots×8 alone is not JS heap size.
5. Include reproduction/mutation, death with retained lineage/egg/Bank references,
   reset and historical save/load. Measure retention before claiming natural cleanup;
   WeakMap key reachability does not mean an organism's death frees its genome.
6. Preserve original consumer-specific floating arithmetic; compare complete serialized
   authoritative state (optics, all neural/learned state, energy, IDs, lineage, PRNG)
   and reset/save continuation for every supported regime in a registered small set.
   A mathematically equivalent inertia expression is insufficient.
7. Stop/retain all failures. A permanent production cache needs separate authorization.

Required future answer: **measured redundant time; safely reusable values and keys;
lookup/construction cost; memory/GC/invalidation cost; experimentally demonstrated
end-to-end benefit or no benefit.** Every quantitative part beyond old counts remains
unanswered in Stage3.2. Keep this visible beside the graphics/transport priorities.
