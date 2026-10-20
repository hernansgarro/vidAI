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
npm run test:fast    # routine automated regressions, no long ecosystem runs
npm test             # optional full simulation suite
npm run build        # TypeScript checks and production build
npx playwright install --with-deps chromium
npm run test:e2e     # optional browser suite at the Pages subpath
npm run preview      # serve dist locally after building
npm run benchmark -- --seed 4242 --seconds 300
npm run benchmark:behavior # controlled motion and paired vision measurements
```

## Creatures and sandbox

The existing **Bank** includes 55 built-in founders in eleven body families, with body
previews, family/diet filters and individual spawning. Built-ins do not consume
saved-specimen slots. Standard seeding uses 18 organisms drawn evenly from up to five randomly selected
designs, without replacement at design selection. The same seed reproduces the
same selection; each organism owns an independent genome and brain state. There
is no forced diet quota; some random communities will fare better than others.
The default plant-food target is 400;
**Reset with Catalogue Showcase** starts a new world with up to 55 designs, subject
to the current living-population cap. The old six archetype shortcuts have been removed; use the Bank or Add Life.

Each body face holds either a physical connection (including a part's parent)
or up to three organs **combined**, with stable center/side slots. Eyes and mouths
use exactly those positions for drawing, sight rays and feeding. Eyes and mouths share an extensible surface-organ representation for future organ types. The former global limits of five eyes and three
mouths have been removed; valid face capacity, seven body parts and bounded neural
arrays still constrain anatomy. More eyes cost simulation time and metabolic energy.
Body changes and ordinary mutations need not preserve symmetry.

Twenty-eight existing designs now have more symmetric eye layouts. Five existing
bodies (FND-021/022/024/034/035) have more balanced limbs, while the asymmetric and
irregular families remain distinct. Moonbell Jellyfish (FND-051, **Bell swimmers**)
uses five hinged rectangles—a bell, two rims and two trailing tentacles—with
phased strokes. It is a rigid-part swimmer, not a deformable bell or fluid-jet model.
Four additional jellyfish share that family: Lantern (compact grazer, five parts),
Sailbell (broad grazer, five parts), Ribbon (segmented tentacles, seven parts,
omnivore), and Crown (terminal paddles, seven parts, carnivore). Their bodies,
phases, stroke rates and life histories differ; none use artificial thrust.
Find and spawn them through the Bank's family filter. Its quiet initial neural motor
weights are evolvable; both founder modes still use the same recurrent architecture.
The retinal strip scrolls horizontally for creatures with many eyes.

New saves use schema v9, with identity-stable variable hidden neurons and explicit
disabled neural connections. Existing 24-neuron founders and their mutable
sensory/motor pathways retain their weights and memory. Versions v3–v8 remain
importable; structural brain mutations and lifetime learning are not yet enabled. Imported legacy organ positions and live geometry are
retained; offspring undergoing mutation acquire valid slots. Old fin presets are
repaired for new organisms and mutated descendants, without moving their saved parents.
Zero-mutation legacy clones retain the original anatomy. New imports are checked
before the active world is replaced. Feeding in old saves uses the current rates.

Settings include nutrients (0–800), tank width/height, gravity, population cap
(1–150), viscosity, inflow, seed and founder brain mode. Resizing translates whole
articulated bodies. Lowering the cap does not kill existing creatures. A zero food
target stops automatic and manual nutrient creation. Existing particles are retained.
**Clear Free Nutrients** removes plant food and records its energy in the ledger.
Pink remains are separate animal food: carnivore and omnivore mouths can scavenge
it; herbivore mouths cannot. Uneaten remains become plant nutrients after 60
simulated seconds when a plant-food slot is available, without adding energy. The HUD counts plant food and remains
separately. Transfer rates are now **2,400 J/s per specialist mouth** and **1,200 J/s per
omnivore mouth**, twice the previous rates. A mouth shares its intake limit across all contacted foods and stops
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
and neither uses hidden target positions. Both start with 24 recurrent hidden neurons, while the runtime supports 1–96
with an enabled-edge budget of 65,536. Neuron count does not yet mutate at reproduction.
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
migrate by eye/part/mouth channel IDs and omitted environment settings use defaults. Imported worlds preserve their exact saved time while pausing for inspection;
callbacks holding the previous settings cannot advance replacement state.

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

Version 0.6.0 adds a whole-body feeding flag (actual intake during the previous
completed tick) and normalized center-of-mass depth (surface 0, floor 1). Current
usable energy already has a normalized reserve/capacity input. Per-mouth contact
and intake inputs remain. Brain v4/schema v8 migrate old channels by stable IDs,
preserving their weights, recurrent memory, outputs and PRNG; new old-save
pathways start neutral. New founders can evolve/use the added senses.

Mature eggs now wait until the newborn's full initial bounding envelope is clear
of living bodies and inside the tank. Eight deterministic orientations are tried
at the egg's position; eggs are never teleported. Waiting retains the funded
reserve, stored heading, predation exposure and population-cap rules. This prevents
newborn limbs from appearing around a passerby as well as direct overlap. It is
conservative and can delay hatching near densely packed bodies.

Routine GitHub validation runs fast automated tests and the production build.
Full simulations and browser checks remain available through a manual workflow
run with **extended_validation** enabled; they no longer run on every release.
