# Project status — 2026-10-19

## Direct repository development — version 0.2.0

VIDA now develops and builds directly from this repository. The established
interface, movable windows, camera, mouth/raycast effects, bubbles, eggs, audio
and Pages asset handling are retained. The simulation kernel is in
`simulation.ts`; the UI re-exports its API for existing integrations.

### Implemented

- Original 50 distinct founder anatomies, ten families, 30 herbivores, ten
  omnivores and ten carnivores. Existing Bank supplies previews, filters, safe
  individual spawning, and a new-world catalogue showcase. Built-ins stay
  separate from the 25 user-saved slots.
- Standard initialization samples 18 diverse founders (12 herbivores, four
  omnivores, two predators). Legacy archetype/preset controls remain available.
- Fixed unselected-trait clamping, including the motor-force jump from about 3
  to at least 8. Zero mutation preserves traits and weights exactly; only
  descendant identity, parent IDs and generation change.
- Every eye has five RGB/distance rays, every articulated joint has normalized
  angle/velocity inputs, and all four motor channels remain functional. Stable
  eye/part channel IDs preserve surviving neural paths through topology changes.
  Hidden recurrence remains 24 neurons. The graph displays live signals and
  recurrent connections with adjustable pruning and tooltips.
- Balanced/unbiased founder modes. Both retain seeded oscillator gaits; balanced
  adds weak heritable retinal color steering. This is a starting prior, not
  trained foraging or hunting, and uses no hidden world coordinates.
- Branch addition, leaf removal and branch relocation validate attachment
  rules, occupied faces, tree order and neutral-pose overlap. Organ hosts are
  remapped by surviving part IDs. Parent/offspring lineage uses organism IDs.
- Nutrient target 0–800, tank width 800–4800, height 600–3000, gravity -200…200
  px/s² and living-population cap 1–150 (default 100). Resizing translates each
  articulated body intact. Gravity uses consistent acceleration units for
  bodies, eggs and particles. Lowering capacity never removes existing life.
- Clear Free Nutrients records removed chemical energy in the ledger. A zero
  target prevents environmental replenishment; carcass/egg decomposition can
  still return nutrients. Initial seeding immediately uses the selected target.
- Copy Diagnostic Report, current-schema snapshots with complete state/settings,
  deterministic PRNG-funded organism IDs, legacy v3 sensory migration, validated
  imports and nonblocking isolated verification tests. Current saves continue
  exactly; v3 saves cannot recover environment settings they did not contain.
- Credits: “By Hernán Garro & Federico Regueira”.

### Executed validation

- 27 gameplay regression tests plus two additional legacy/verification checks
  passed locally (29 tests total). The combined suite is also run by CI.
- All 50 exact anatomies are unique and valid, with no initial positive-area
  body overlap. All remained finite and alive for 15 simulated seconds in
  isolated zero-food swimming checks. Measured net movement: approximately
  81–1114 px over that interval, depending on the body/controller.
- Zero-mutation preservation tested for all 50 founders over ten generations.
  A 500-generation structural mutation chain retained valid geometry and hosts.
- Exact current-snapshot round trip and continuation tested through fractional
  inflow and a hatching event, including IDs, activations, counters and PRNG.
- Three production-browser scenarios passed locally: Pages-path startup and
  pause/resume; catalogue/spawning/saved specimens/live graph/window dragging;
  sandbox settings/zero nutrients/diagnostic report/snapshot import/export.
  Browser execution used local headless Chromium; no 60-FPS claim is inferred.
- TypeScript and the production Vite build passed.

Default initialization, 60 seconds at 1/60s, 800 food, inflow up to 15/s, viscosity
0.18, cap 100, balanced founders:

| Seed | Living at 60s | Total births including 18 founders | Deaths | Absolute energy discrepancy |
| --- | ---: | ---: | ---: | ---: |
| 4242 | 20 | 20 | 0 | 7.5 × 10⁻⁹ J |
| 71 | 18 | 18 | 0 | 8.9 × 10⁻⁹ J |
| 1901 | 18 | 18 | 0 | 1.9 × 10⁻⁹ J |

Longer run, seed 4242, same settings:

| Simulated time | Living | Eggs | Highest living generation | Deaths |
| --- | ---: | ---: | ---: | ---: |
| 60 s | 20 | 0 | 2 | 0 |
| 120 s | 26 | 1 | 2 | 0 |
| 180 s | 36 | 1 | 3 | 0 |
| 240 s | 46 | 2 | 4 | 0 |
| 300 s | 60 | 4 | 5 | 0 |

The final ledger discrepancy was 1.24 × 10⁻⁷ J. Reproduce with
`npm run benchmark -- --seed 4242 --seconds 300`.

Controlled physical-swimming verification uses the reference 126px body with
neural motor modulation disabled and its traveling-wave CPG intact: 1263.19px
COM displacement in 15s; disabled motors and zero drag each produced less than
10⁻⁴px drift. This is distinct from random-controller ecological performance.
Six isolated unfed legacy starters starved after approximately 247–329 seconds
in fixed 1/60s checks. Separate regressions cover positive-reserve age death.

### Limits

These checks establish startup stability, reproduction, inheritance, geometry,
accounting and reproducible continuation. They do not establish indefinite
sustainability, reliable hunting, or learned intelligence. Neutral-pose validation
is not full self-collision avoidance throughout every moving gait. CPU limits
still reduce effective acceleration; HUD throughput reports actual performance.
Named branching still forks the active in-memory experiment; it does not yet
provide a selectable archive of independent running worlds.

## Historical validation before version 0.2.0


## Latest export update

Integrated `project-files (11).zip` using the previous export as a merge base.
This retains all new game changes: inherited target clutch size and maturity age,
budget-limited clutches, nutrient-distinct creature colors, new trait displays,
and diagnostics-window closing without clearing the creature selection.

The standalone Pages build, bundled asset URLs, exported configuration defaults,
configured population cap, zero-valued settings, and previously tested energy
accounting repairs are preserved. The hosted Playground SDK is still unused.

Local validation: **12 simulation tests passed** and `npm run build` passed.
The added coverage exercises inherited clutch limits, partial affordable clutches,
inherited maturity, and energy-conserving egg funding through the gameplay kernel.
The existing single-egg regression now uses the explicit one-egg budget instead
of the new desired-clutch budget.

In the same seeded 60-second workload described below, all 18 founders survived,
one offspring hatched, one egg remained, and no deaths occurred. The energy ledger
discrepancy was approximately **1.4 × 10⁻⁸ J**. This remains a short startup check;
long-term ecological sustainability is unverified. Chromium execution and Pages
deployment are checked by the existing GitHub Actions workflow on push.

## Initial GitHub Pages import

## Scope

This is the **2D** VIDA project from `project-files (10).zip`, not the separate 3D
experiment. The attached source and assets are retained alongside a standalone
React/TypeScript/Vite build. Tailwind CSS is compiled locally, and the application
no longer initializes Google's hosted Playground SDK. `playground_config.json`
values initialize the standalone configuration (including 18 founders, 900 food,
0.18 viscosity and a 45-organism cap).

GitHub Actions validates pushes and pull requests; only pushes to main or manual
runs deploy to Pages. Dependencies are pinned and the lockfile is committed.

## Focused game repairs

- Respect an egg's actual reserve at hatching; remove the unfunded 100 J minimum.
- Count nonviable egg energy as nutrient energy **or** removed energy, once.
- Record decomposition energy lost when the nutrient cap prevents recycling,
  including discarded small remainders.
- At starvation, record only expenditure actually paid from the remaining reserve.
- Record tiny discarded food and egg remainders after feeding.
- Prevent negative storage room from producing negative absorption.
- Recompute reproduction readiness immediately after laying.
- Honor valid zero-valued environmental settings and the configured population cap.

No changes were made to motor torques, water drag, controller weights, energy
conversion constants, or inherited lifespan policies in this import.

## Executed local validation

`npm test`: **10 tests passed** against the gameplay `stepSimulation` module.
Coverage includes damaged and nonviable eggs, decomposition at the resource cap,
starvation accounting, all three mouth types, reproduction below the retired
capacity threshold, cooldown, positive-reserve age death, and a seeded ecosystem.

The seed-4242, 18-founder workload ran 60 simulated seconds at 60 ticks/s with
900 initial nutrients, 15 nutrients/s inflow and 0.18 water viscosity. Results:
**18 survivors, 0 deaths, 0 eggs, 0 hatches**; energy ledger discrepancy was
approximately **7 × 10⁻⁹ J**. This short workload verifies startup stability and
accounting; it does not establish long-term ecological sustainability.

`npm run build`: TypeScript checks and production compilation passed.
The browser test loads the built game below `/vidAI/`, checks startup assets,
starts the ecosystem, waits for simulated time to advance and pauses/resumes it.
Chromium downloads were unavailable in the local environment; browser execution
is therefore a required GitHub Actions check before deployment.

## Existing limitations / follow-up work

- The simulation and React UI remain mostly in the large `App.tsx` module.
- Save/load is not yet a complete deterministic continuation: settings,
  accumulator/counters and some histories are not all preserved, imports need
  deeper validation, and organism IDs still use `Math.random()`.
- The existing “Branch this Ecosystem” action clones the active state in memory;
  it does not yet retain independently selectable named experiments.
- The reference diagnostic still needs stronger isolation from the global PRNG
  and an audit of every displayed pass criterion.
- Functional sensory channel expansion and spatial indexing remain separate work.
- The brief startup run does not prove successful multigeneration evolution.

Keep these distinctions when reporting results. No hidden energy refill,
replacement population, or immunity was added.
