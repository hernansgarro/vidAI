# Working on VIDA

- This is the 2D simulation. Keep the current visual style, movable windows,
  camera controls, effects, and audio unless a requested change concerns them.
- `simulation.ts` is the production kernel. Controllers use 24 recurrent hidden
  neurons; sensory and motor channel identities follow stable eye/part IDs.
- `data/founders.json` contains the 50 original blueprints. Preserve their actual
  anatomy and gait data; do not replace entries with renamed duplicates.
- Maintenance uses geometric body area, not construction joules. Keep reserve,
  construction energy, storage capacity, and heat/removal accounting distinct.
- No hidden refills, replacement creatures, death immunity, target-coordinate
  steering, or fabricated diagnostic pass flags.
- New imports must be validated before replacing the active world. Current
  snapshots must continue exactly, including PRNG, activations, counters and IDs.
- Run `npm test`, `npm run build`, and `npm run test:e2e` for simulation/UI changes.
  Use `npm run benchmark -- --seed 4242 --seconds 300` for longer ecosystem work.
- Record measured results and limitations in `docs/PROJECT_STATUS.md`. Distinguish
  controlled swimming, neural response, and ecological behavior in reports.
- Work through a branch and PR. The main-branch Pages workflow deploys only after
  its simulation, build and browser checks pass.
