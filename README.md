# VIDA / vidAI

An aquatic artificial life simulator with articulated 2D bodies, physical swimming,
recurrent neural controllers, mouth-specific feeding, inherited mutations and eggs.
Developed directly in this repository. The standalone build preserves the established
VIDA interface and validated energy-accounting fixes. No Playground dependency is used.

By Hernán Garro & Federico Regueira.

**Play:** https://smeagol44.github.io/vidAI/

## Development

Use Node.js 24 LTS (minimum 22.12).

```sh
npm ci
npm run dev
```

Open the printed URL ending in `/vidAI/`. No API keys, Google account, backend,
or Playground SDK are required. Dependencies, CSS, images and audio are bundled
locally into the build. Exported Playground configuration values are retained.

```sh
npm test             # kernel regressions, 50 bodies, genetics, snapshots and seeded ecosystems
npm run build        # TypeScript checks and production build
npx playwright install --with-deps chromium
npm run test:e2e     # production build at the Pages subpath
npm run preview      # serve dist locally after building
npm run benchmark -- --seed 4242 --seconds 300
npm run benchmark:behavior # controlled motion and paired vision measurements
```

## Creatures and sandbox

The existing **Bank** includes 50 built-in founders in ten body families, with body
previews, family/diet filters and individual spawning. Built-ins do not consume
saved-specimen slots. Standard seeding uses 18 founders with a herbivore majority;
**Reset with Catalogue Showcase** starts a new world with up to 50 designs, subject
to the current living-population cap. The old six archetype shortcuts have been removed; use the Bank or Add Life.

Settings include nutrients (0–800), tank width/height, gravity, population cap
(1–150), viscosity, inflow, seed and founder brain mode. Resizing translates whole
articulated bodies. Lowering the cap does not kill existing creatures. A zero food
target stops automatic and manual nutrient creation. Existing particles are retained.
**Clear Free Nutrients** removes plant food and records its energy in the ledger.
Pink remains are separate animal food: carnivore and omnivore mouths can scavenge
it; herbivore mouths cannot. Uneaten remains become plant nutrients after 60
simulated seconds when a plant-food slot is available, without adding energy. The HUD counts plant food and remains
separately. A mouth shares its intake limit across all contacted foods and stops
removing food when storage is full. All mouths absorb 80% of removed energy;
20% becomes heat. The existing 85% carrion digestion factor also applies, so
carrion's combined assimilation is 68%. Kin protection defaults on for living
parents/offspring, same-generation siblings and related eggs; unrelated creatures
of the same generation remain edible. Carrion carries no kin protection.

Diet labels are herbivore, carnivore and omnivore. A creature with different
specialist mouths has an omnivorous overall diet; each mouth retains its own
permissions. Body pigment is inherited independently of diet, including green.
The inherited color-variability trait scales pigment mutation probability; zero
preserves the parent's pigment in its next offspring. Variability itself can
mutate. This is genetic inheritance, not brain-controlled color changing.

Balanced founders have a weak heritable retinal steering prior. Unbiased founders
have random controllers and seeded swimming oscillators. Neither mode is trained,
and neither uses hidden target positions. Both keep 24 recurrent hidden neurons.
Every eye supplies five RGB/distance rays; every joint supplies angle and velocity.
Each mouth reports edible contact and normalized absorbed intake from the previous
completed tick. Each joint has six neural outputs: angle, frequency, torque,
stiffness, stroke amplitude and engagement. Commands ramp over 0.12 seconds;
disengaged motors apply zero torque while passive joints and water drag remain.
Neutral new outputs preserve starter gaits; their connections can evolve through
mutation. These controls do not train founders or guarantee successful foraging.
Nonzero longitudinal water resistance slows passive coasting. The inspector shows
per-joint stroke amplitude and engagement alongside the live brain graph.

Only physical creatures, food particles (including pink remains) and white eggs
produce retinal colors. Walls, water, grid and display effects return black.
Distance attenuates surface RGB toward black; the distance channel remains.
Nutrient cores stay fixed while only their display glow pulses. Mouth openings
animate during actual feeding. Display water and boundaries remain visible to
the player.

Solid rotated body rectangles collide with other creatures and their own
nonadjacent parts. Directly hinged neighbors are exempt to allow bending. All
bodies advance on one substep clock, with inelastic contact impulses and positional
hinge repair before feeding. A spatial broad phase limits collision candidates.
This is a discrete frictionless solver, not continuous collision detection.

The canvas fills the area between the toolbars using equal X/Y world scale;
changing screen shape changes the visible area rather than stretching bodies.
Floating windows scroll, resize from their lower corner, and stay inside that
area after dragging or viewport changes. The current build appears at bottom right.

**Copy Diagnostic Report** provides settings, seed/PRNG, population, death history,
energy balance and selected-creature telemetry. Current v6 snapshots preserve
motor ramps, oral feedback, pigment variability, decomposition timers and complete
simulation state/settings for exact continuation in this build. Older v3/v4/v5
JSON worlds import under the updated rules; existing neural commands and memory
migrate by eye/part/mouth channel IDs and omitted environment settings use defaults. Imported worlds pause for inspection before resuming.

## GitHub Pages

The repository's Pages source should be **GitHub Actions**. Every push to `main`
runs simulation tests, type checks, a production build and a Chromium smoke test,
then deploys `dist` to Pages. Pull requests run the checks without deployment.
The workflow can also be started manually from the Actions tab.

Vite's base URL is `/vidAI/`; update `vite.config.ts` if renaming the repository
or moving to a custom domain. Images and music use imported asset URLs, so they
resolve correctly below the repository subpath.

## Controls

Choose **Seed Simulation** to start. Drag the tank to pan and scroll to zoom.
Click a creature to inspect it. Space pauses/resumes; the on-screen buttons
provide settings, simulation speed, specimen tools, ecosystem export/import,
and diagnostics. The help panel lists the other shortcuts.

Simulation energy and time use the game's existing calibrated units. Finite
lifespans and natural extinction remain enabled. See [project status](docs/PROJECT_STATUS.md)
for verified repairs and remaining limitations. Original asset provenance is
retained in `design/asset_manifest.json` and `THIRD_PARTY_NOTICES.md`.
