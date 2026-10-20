# Working on VIDA

- This is the 2D simulation. Keep the current visual style, movable windows,
  camera controls, effects, and audio unless a requested change concerns them.
- `simulation.ts` is the production kernel. Controllers use 24 recurrent hidden
  neurons and six outputs per joint; channel identities follow stable eye/part/mouth
  IDs. Migrate old four-channel commands by key, never by the new array stride.
  Save schema v6 includes motor ramps and oral feedback; legacy migration must
  preserve recurrent memory and existing weights.
- `data/founders.json` contains the 50 original blueprints. Preserve their actual
  anatomy and gait data; do not replace entries with renamed duplicates.
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
- No hidden refills, replacement creatures, death immunity, target-coordinate
  steering, or fabricated diagnostic pass flags.
- World swaps/resizing use a UI render epoch so callbacks with old settings cannot
  step replacement state before its matching pause/settings render.
- New imports must be validated before replacing the active world. Current
  snapshots must continue exactly, including PRNG, activations, counters and IDs.
- Run `npm test`, `npm run build`, and `npm run test:e2e` for simulation/UI changes.
  Use `npm run benchmark -- --seed 4242 --seconds 300` for longer ecosystem work
  and `npm run benchmark:behavior` for isolated control and paired-vision checks.
- Record measured results and limitations in `docs/PROJECT_STATUS.md`. Distinguish
  controlled swimming, neural response, and ecological behavior in reports.
- Work through a branch and PR. The main-branch Pages workflow deploys only after
  its simulation, build and browser checks pass.
