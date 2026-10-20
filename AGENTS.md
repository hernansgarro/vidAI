# Working on VIDA

- This is the 2D simulation. Keep the current visual style, movable windows,
  camera controls, effects, and audio unless a requested change concerns them.
- `simulation.ts` is the production kernel. Controllers use 24 recurrent hidden
  neurons and six outputs per joint; channel identities follow stable eye/part/mouth
  IDs. Brain v4 adds aggregate feeding and normalized COM depth; preserve the existing
  normalized reserve input. Migrate old four-channel commands by key, never by the new array stride.
  Save schema v8 includes stable organ slots, motor ramps and oral feedback; legacy migration must
  preserve recurrent memory and existing weights.
- `data/founders.json` contains 51 distinct blueprints (50 revised originals and
  Moonbell Jellyfish). Preserve their actual anatomy and measured gaits; never
  replace entries with renamed duplicates. Selective symmetry is not a mutation rule.
- Anatomy v1 uses one physical connection OR three organs combined per face.
  Count both ends of hinges. Preserve stable organ slots and IDs across mutation,
  pruning, imports and brain remapping. Use getOrganAnchor for vision, bites,
  markers, previews and debug ray origins. Legacy saved positions stay centered
  unless their explicit slots say otherwise; do not rewrite living legacy anatomy.
- Default seeding distributes 18 organisms across up to five uniformly sampled
  distinct designs, with independent genomes. Default nutrients are 400.
  Specialist mouths transfer 2400 J/s and omnivore mouths 1200 J/s, gross before loss.
- Maintenance uses geometric body area, not construction joules. Keep reserve,
  construction energy, storage capacity, and heat/removal accounting distinct.
- Vision is black except for physical creatures, food and white eggs. Display
  glows/pulses and tank walls must not affect retinal RGB or hit geometry.
- All mouth transfers apply 80% assimilation, stacking the existing carrion
  digestion factor; rejected energy becomes heat. Use addNutrients for all
  external plant-food creation so manual feeding obeys the environmental cap.
- Body contacts resolve on the common substep clock. Exclude directly hinged
  neighbors; preserve mass-weighted COM and hinge stability during self-contact.
- Floating windows must fit the tank viewport between toolbars. Canvas backing
  dimensions must follow its CSS area/device-pixel ratio without stretching.
  Noninteractive notification banners must not intercept pointer input.
- No hidden refills, replacement creatures, death immunity, target-coordinate
  steering, or fabricated diagnostic pass flags.
- World swaps/resizing use a UI render epoch so callbacks with old settings cannot
  step replacement state before its matching pause/settings render.
- New imports must be validated before replacing the active world. Current
  snapshots must continue exactly, including PRNG, activations, counters and IDs.
- Default verification is `npm run test:fast` and `npm run build`. Prefer pure
  geometry/state assertions and a few kernel ticks. Full `npm test`, browser tests,
  ecosystem/behavior benchmarks and manual browser checks are opt-in for a concrete
  unresolved regression or an explicit user request; do not repeat them routinely.
- Hatching requires a clear whole-body envelope and tank containment. Blocked eggs
  keep funded energy and hatch heading; they wait rather than spawning interlocked
  with a passerby or consuming new randomness on every attempt.
- Record measured results and limitations in `docs/PROJECT_STATUS.md`. Distinguish
  controlled swimming, neural response, and ecological behavior in reports.
- Work through a branch and PR. The main-branch Pages workflow deploys only after
  its fast automated tests and build pass. Extended checks are opt-in.
