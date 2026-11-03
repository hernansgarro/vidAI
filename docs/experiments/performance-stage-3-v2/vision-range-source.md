# Stage 3.2 — finite optical range: source inspection, not a timing experiment

2026-11-02. Inspected runtime at `11248f3431604a1b883a7a948a6e6baddc3fafdd`,
unchanged in research heads `1c4927ad0f9bb7d01368c6a1ede73b9d634c2969` and
preflight-repair `7279fc8b6d09b039bb5a738c62c8648bf89ca2ba`.
Related: S2-03, IDEA-025 (ray subset), separate IDEA-026 (per-ray range).

## Verified current behavior

| Question | Source-backed answer |
| --- | --- |
| Finite or infinite? | **Finite already.** `SensoryEye.range` is the maximum optical distance. It belongs to each eye, shared by that eye's five rays; not a global/world-size-derived cutoff. Different eyes may already have different ranges. |
| Inherited already? | Yes, **per-eye range** is copied and mutated: `mutate(eye.range, 30, 280, 680)` in offspring construction. New-eye creation uses450–620; other constructor recipes have other values. The mutation interval is not the import limit: persistence accepts `0 < range <= 5000`. These existing semantics must remain. |
| Ray direction and endpoint? | The anatomical organ anchor is rotated/translated into world space. Angular slot `r` has `(r/(5-1)-0.5)*eye.fov`; endpoint starts at `origin + unitDirection*eye.range`. A closer strict hit replaces distance/point. No world-edge visual target is added. |
| Candidate selection? | `OrderedSpatialIndex` indexes full physical AABBs in128-unit cells, visits the finite segment's horizontal cell slabs and intersected columns, deduplicates with stamps, then sorts source order. It can return AABBs anywhere in traversed cells, including beyond the precise segment; this is conservative broadphase, not exact visibility. |
| Exact intersections? | Closest distance starts at maximum range. Food/egg circle tests use that current cutoff; bodies test four edges on a segment shortened by closer hits. Group/source order and strict `< closestDist` preserve tie behavior. Own body is ignored; dissolving bodies are ignored. Current legacy body prefilter also uses `closestDist+50`; do not silently change it in this audit. |
| RGB? | Only real food/carrion/white eggs/body pigment contribute. With black water `[0,0,0]`, attenuation is `exp(-closestDist/(maxRange*0.55))`, then optional per-eye RGB spectral gains. **Changing range also changes apparent brightness of the same in-range object**, not just the cutoff. |
| Neural distance? | Four stable channels per ray: RGB and `clamp(closestDist/maxRange,0,1)` when any spectral channel exceeds1e-12; otherwise distance1. Shortening range rescales distance even for unchanged hit position. |
| Nothing detected? | Empty ray: RGB0,0,0; normalized neural distance1; diagnostic hit=false, endpoint at maximum range. A physically hit surface with zero spectral response still occludes and can have diagnostic hit=true while neural RGB is black/distance1. No diagnostic object label reaches the brain. |
| Existing range energy cost? | `eyeSensoryUpkeep` charges five times `(0.25+0.75*mean receptor gain)` per eye. It has **no explicit range factor**. A future length-dependent biological cost is a separate design choice, not current behavior. |
| Does a maximum already reject distant work? | Yes: finite grid corridor, distance prefilters and exact segment/circle cutoffs. It does not traverse all objects as an infinite ray. Index construction still includes all relevant physical entries once per sensing phase/rebuild. |

Source anchors: `simulation.ts` SensoryEye/eyeSensoryUpkeep, mutateGenome eye mutations,
`stepSimulation` optical pass and `getBrainLayout`; `spatialIndex.ts` constructor/query;
`persistence.ts` validateGenome eye parameters. See the commit above for immutable code.

## Cost hypothesis and what remains unknown

Shortening a ray can reduce visited slabs/columns, retrieved candidates, sorting and
exact tests. Savings need not be proportional to distance: discrete cells, scene density,
index construction, fixed per-ray setup/result allocation, already-near occlusion,
angle and existing finite cutoffs matter. The full maximum corridor is queried before
exact candidates reveal nearer occluders. Reusing existing candidate/order buffers is
a different exactness question from changing physical perception.

Stage3.1 measured195/390 rays per tick at15/30 founders and5.55%/4.54% candidates
relative to full scene entries; its34%/40.5% coarse optical/update share includes
index/setup/bookkeeping. It did **not** measure marginal length sensitivity or the
exact intersection/allocation share. No new query-cost experiment ran in Stage3.2.
A future bounded hypothetical geometry-only query experiment may use saved ray
origins/directions and five **proposed**, unapproved ranges, without stepping organisms
or feeding altered sensory inputs into brains. Register ranges/repetitions/budget first;
label results as cost studies, never evolutionary success or production speedups.

## Separate future design: IDEA-026

Each stable angular ray slot could inherit one of **five allowable distances**, with
values undecided. Separate this from IDEA-025's active-ray subset: a ray can exist but
have a shorter range; mask and range could later co-evolve without coupling their
mutations by default. Compare per-eye selection (already continuous) with independent
per-ray alleles/discrete steps and other bounded representations.

Before implementation, decide: inheritance/mutation probabilities and correlations;
legacy absent allele=exact stored per-eye range; validation/import/export and schema;
ray identity and neural channel/weight/disabled-edge/learned-record mapping; whether
attenuation scale and neural distance normalization follow per-ray length or preserve
eye reference; exact black/no-spectral-response behavior; structural/operational energy
costs; deterministic continuation and PRNG draw order. Do not silently re-quantize old
eyes. Biological trade-offs may change feeding/navigation/survival in either direction.
Use natural physical selection and conserved costs, never artificial fitness/rewards.
No genetic/sensory change or ecological experiment is authorized by this source review.
