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
```

## Creatures and sandbox

The existing **Bank** includes 50 built-in founders in ten body families, with body
previews, family/diet filters and individual spawning. Built-ins do not consume
saved-specimen slots. Standard seeding uses 18 founders with a herbivore majority;
**Reset with Catalogue Showcase** starts a new world with up to 50 designs, subject
to the current living-population cap. Older archetype buttons remain available.

Settings include nutrients (0–800), tank width/height, gravity, population cap
(1–150), viscosity, inflow, seed and founder brain mode. Resizing translates whole
articulated bodies. Lowering the cap does not kill existing creatures. A zero food
target disables environmental replenishment; decomposition can still create food.
**Clear Free Nutrients** records removed energy in the ledger.

Balanced founders have a weak heritable retinal steering prior. Unbiased founders
have random controllers and seeded swimming oscillators. Neither mode is trained,
and neither uses hidden target positions. Both keep 24 recurrent hidden neurons.
Every eye supplies five RGB/distance rays; every joint supplies angle and velocity.

**Copy Diagnostic Report** provides settings, seed/PRNG, population, death history,
energy balance and selected-creature telemetry. Current snapshots preserve complete
simulation state and settings for exact continuation. Older v3 JSON worlds can be
imported with sensory migration; environment settings omitted by those old files
use defaults. Imported worlds pause for inspection before resuming.

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
