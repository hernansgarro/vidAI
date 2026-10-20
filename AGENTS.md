# Working on VIDA

- This is the 2D simulation. Keep the current visual style, movable windows,
  camera controls, effects, and audio unless a requested change concerns them.
- `simulation.ts` is the production kernel. Founders retain 24 recurrent
  hidden neurons and six outputs per joint; brain v6 supports identity-stable
  1–96 hidden neurons, at most 65,536 enabled connections, and explicit disabled
  synapse keys. Preserve existing dense weights, hidden activations, founder
  steering and stable eye/part/mouth/motor channels by ID. Brain v4 added
  aggregate feeding and normalized COM depth; do not duplicate reserve input.
  Migrate old four-channel motor commands by key, never array stride. Save
  schema v10 imports v3–v9 and preserves exact current continuation. Brain
  v6 supports rare inherited structural mutation (neurons and connection masks)
  and per-neuron inherited leaky activation memory (tau 0–4 seconds). Tau=0
  follows the exact original recurrence; every founder and earlier save
  migrates to tau=0. Offspring start with zero neural activations.
  Lifetime plasticity/weight learning is not implemented. Legacy dense-24 controllers retain their exact baseline
  neural upkeep through reference-normalized enabled-synapse cost.
- `data/founders.json` contains 55 distinct blueprints (50 revised originals and
  five jellyfish designs). Preserve their actual anatomy and measured gaits; never
  replace entries with renamed duplicates. Selective symmetry is not a mutation rule.
- Anatomy v1 uses one physical connection OR three organs combined per face.
  Count both ends of hinges. Preserve stable organ slots and IDs across mutation,
  pruning, imports and brain remapping. Use getOrganAnchor for vision, bites,
  markers, previews and debug ray origins. Legacy saved positions stay centered
  unless their explicit slots say otherwise; do not rewrite living legacy anatomy.
- Default seeding distributes 18 organisms across up to five uniformly sampled
  distinct designs, with independent genomes. Default nutrients are 400.
  Specialist mouths transfer 3600 J/s and omnivores 1800 J/s gross
  before 80% assimilation. Egg reserve funding uses the parent's inherited
  eggReserveFraction × 10,000 J; retain at least 12% of storage capacity
  (minimum 2,000 J) in the parent. No unfunded egg or automatic survival aid.
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
