# Project status — 2026-10-19

## UI, vision, feeding and body contact — version 0.4.0

### Implemented

- Current version appears at the bottom right. Feed/Feed All moved next to the
  playback controls; the Eel, Predator, Flapper, Tadpole, Glider and Random
  shortcut row is removed. The Bank, all 50 bodies and existing effects/audio remain.
- Canvas logical dimensions follow its actual CSS area between the toolbars,
  including device-pixel ratio. Wide and narrow screens show different areas of
  the same world with equal X/Y scale, rather than stretching or letterboxing.
- All five floating panels are bounded by that area, scroll and have native
  resize handles. Moving/resizing panels or changing screen size reclamps their
  full rectangles, keeping content above the bottom toolbar. Main menu/guide
  overlays retain their independent scrolling.
- Canvas selection now consumes pointer events directly. Previously a press and
  release entirely between frames could be lost by polling the held state.
  Selection, dragging, wheel/pinch zoom and tracking remain available.
- Empty retinal space is exactly black. Walls, water, bubbles, grid, selection
  indicators and glows supply no RGB or distance hit. Creatures, food particles
  (including pink carrion) and eggs retain nearest-surface occlusion. Surface RGB
  attenuates exponentially toward black with distance; distance channels remain.
- Eggs have a stable white physical shell and equal RGB surface channels. Their
  display glow/ring carries no retinal signal. Nutrient cores keep fixed geometry
  and pigment while only their display glow pulses; consuming energy can still
  legitimately shrink the physical food radius.
- Mouths have animated dark openings and bite ripples driven by that mouth's
  actual absorbed intake/recent feeding. The animation changes no contact reach,
  optical body geometry, intake budget or neural inputs.
- Every mouth absorbs 80% of removed chemical energy, recording the rest as heat.
  Existing carrion/tissue digestion loss multiplies this factor (0.8 x 0.85 =
  68%). Gross intake rates and the shared per-mouth budget remain unchanged.
  Storage limits removal before assimilation, so full creatures do not destroy
  surplus food. Reciprocal feeding cannot amplify the combined chemical reserves.
- Carnivore mouths still cannot consume plant nutrients. Default-on kin
  protection excludes living parents/offspring, same-clutch and same-generation
  shared-parent siblings, and related eggs. Unrelated generation peers are edible;
  disabling protection permits cannibalism. Remains carry no kin protection.
  Different specialist mouths can still coexist, classified overall as Omnivore;
  there is no fourth Mixed diet label or HUD count.
- Initialization, automatic inflow, Feed and Feed All use one capped nutrient
  creation function. Lowering the limit retains existing food but prevents more
  creation at/above it. Zero also disables manual plant-food creation. Carrion is
  funded animal biomass, not an external refill: mineralization waits for a plant
  slot without deleting its stored energy. Death/egg remains retain their global
  particle safety cap and existing loss accounting.
- Rotated body rectangles now collide with other living creatures and their own
  nonadjacent parts. Directly hinged neighbors are exempt to allow bending.
  Physics advances all creatures on one common substep clock (at most 1/240s at
  the tested timesteps), then resolves inelastic frictionless impulses and split
  position/hinge repair before feeding. Mass and rotational inertia enter impulse
  resolution. A deterministic spatial hash limits contact candidates. Positional
  recovery does not add separation velocity or charge biological motor work.
- Existing v6 snapshot fields suffice: no controller remapping or neuron changes.
  V3/v4/v5/v6 imports remain supported; current saves continue exactly under this
  build's updated rules. Old imports preserve neural weights and recurrent memory.
  Default founder reserves, body/gait genes, drag and force conversion are retained.

### Executed validation

All 92 simulation tests passed (62 existing, 30 new). The new cases cover black empty space/walls,
white and distance-faded eggs, nearest-surface occlusion, pulse-independent food
vision, 80%/68% assimilation and heat, manual/inflow/decay caps, kin toggle cases
for living prey and eggs, reciprocal predation, rotated geometry, momentum and
kinetic-energy behavior of the impulse, high-speed contact at 1/30, 1/60 and
1/120s, nonadjacent self-contact, exact snapshot continuation and intact hinges.

All 50 original bodies remained finite/alive for 15s at viscosity .22. Net
translations ranged from about 7 to 1488px; this includes curving/circling and
is not a claim of equal cruising ability. The controlled 15s reference remains
1206.42px, with zero motor-off drift and 0.1194px hinge error.

All 18 default founders survived 60s for seeds 4242, 71 and 1901, with no eggs or
deaths at that time. Absolute ledger discrepancies were 5.59e-9, 2.75e-8 and
7.92e-9 J. Detailed current measurements are in `docs/release-validation-0.4.0.json`.

All eleven production-browser scenarios passed across the full local suite and
focused follow-up runs. These include 1920x900,
520x900 and 1024x480 windows, native resizing, dragging against viewport edges,
scrolling to each panel's final content, re-clamping after a 700x500 resize,
version/obsolete-button checks, actual Feed/Feed All limits, and existing catalogue,
snapshot/diet/remains behavior. A double-density canvas check verifies the white
egg pixels and actual animated mouth openings. The same check also passed after
adding quick selection, pan and wheel-zoom assertions. TypeScript/build passed.

The first CI run caught an import race: the world ref changed before React's
pause/settings render committed, so an old animation callback could step the new
zero-food world using the previous inflow. World swaps/resizing now carry a render
epoch; mismatched callbacks cannot advance the new world. A new browser regression
imports the same snapshot three times from MAX speed with 4x CPU throttling,
verifying exact saved time and zero food before resuming. The failing food-display
case and this stress check both pass. CI now runs graphics-heavy browser cases
serially: two simultaneous software-rendered canvases caused the wide-screen
case to exceed its 90s budget, while its single-worker rerun passed unchanged.

A controlled active swimmer struck a passive body moving at 100px/s: maximum
hinge error over 5s was 0.1585px and contact penetration 0.0210px. A deliberately
folded passive chain resolved root/leaf self-contact to about 0.02px slop with
hinge error below 1e-9px and COM drift below 1e-6px, without motor work.

Five-minute default ecosystem, seed 4242, production kernel at 1/60s:

| Simulated time | Living | Eggs | Highest generation | Recorded deaths |
| --- | ---: | ---: | ---: | ---: |
| 60 s | 18 | 0 | 1 | 0 |
| 120 s | 18 | 0 | 1 | 0 |
| 180 s | 20 | 0 | 2 | 0 |
| 240 s | 24 | 1 | 2 | 0 |
| 300 s | 24 | 1 | 2 | 1 |

Final ledger discrepancy: 2.98e-7 J. Reproduce with
`npm run benchmark -- --seed 4242 --seconds 300`. This is one finite ecological
sample, not proof of indefinite stability or improved intelligence.

### Remaining focused work

Contacts use discrete substeps and allow small solver slop; this is not continuous
collision detection or a full fluid solver. Directly attached rectangles may
intersect while bending. Food/eggs retain their existing circle/contact model,
not rigid-body collision response. Spatial indexing currently accelerates body
contacts, not all eye rays. Reliable foraging/escape, unused reproduction traits,
growth/injury/repair, evolving neural structure and longer ecological evaluation
remain pending.

## Previous release: neural motor control and longitudinal drag — version 0.3.0

### Implemented

- Six outputs per joint: the original angle, frequency, torque and stiffness
  channels, plus stroke amplitude and motor engagement. Amplitude ranges from
  0 to 1.75 times the inherited gait. Engagement ranges from 0 to 1; zero applies
  no active motor torque or active motor damping. Passive constraints remain.
- New commands ramp with a 0.12-second response time. This smooths transitions;
  an off command settles to exact zero. Gait phases continue during rest so
  resuming does not reset the inherited oscillator.
- New outputs initialize neutrally (full inherited amplitude/engagement). Legacy
  commands and weights map by part ID/channel, never by a changed array stride.
  Founders keep their 24-neuron recurrent core, original bodies and gait genes.
  New output connections can evolve; this is not within-lifetime learning.
- Two oral inputs per mouth: edible contact and normalized actual absorbed intake.
  Signals arrive from the previous completed tick, so no future target data is
  exposed. Contact sensing still functions at full storage. Oral sensing adds
  0.9 J/s per mouth to the existing approximate sensory upkeep calculation.
- Longitudinal drag coefficient 0.05 replaces zero in the existing anisotropic
  model. Normal and angular drag, torque constants, metabolic conversion and
  10,000 J founder reserves remain unchanged. No propulsion boost was added.
- Live inspector/brain graph/report expose the six commands and actual motor
  engagement/amplitude. The established interface, windows, effects and audio
  remain intact.
- Brain schema 3 and save schema v6 preserve ramps and oral feedback for exact
  continuation. V3/v4/v5 worlds and saved genomes migrate old commands and hidden
  memory by channel identity. New channels initialize neutral, not randomized.
  Current malformed channel identities and invalid motor/feedback values reject.

### Executed validation

- 62 simulation tests passed, including 13 new controller/physics/migration cases.
  Tests cover independent joint disengagement, zero motor work after settling,
  smooth rest/resume, zero amplitude with active pose holding, opposite turns,
  a faster-rhythm burst, energy costs at 1/30, 1/60 and 1/120s, passive coasting,
  causal oral feedback driving the real recurrent controller, and exact save
  continuation during a ramp. The legacy fixture was produced by 0.2.1's actual
  kernel: seven body parts, 24 old motor outputs, existing memory and PRNG state.
- All five production-browser scenarios passed locally. They include old v5
  import/export with unchanged old motor weights, all 36 new output slots,
  inspector telemetry, catalogue, settings, food/remains, save/load, dragging,
  and production-path startup/pause. TypeScript and the production build passed.
- All 50 original founders remained finite, alive and swimming for 15 isolated
  simulated seconds. Net displacements were 55.35–880.48px at viscosity 0.18.
  Median displacement was 87.4% of the 0.2.1 baseline at unchanged gait/force
  genes; individual ratios ranged from 68.9% to 106.0%. Net displacement includes
  turning, not just cruising speed. No universal faster-swimming claim is made.
- Six longitudinal drag candidates (0, .02, .05, .1, .2, .4) were compared before
  selecting .05. Stronger values increasingly reduced catalogue movement.
  The reference passive-coast check at viscosity .18 starts at 60px/s; speed
  after 10s was 45.85px/s with .05 versus 60px/s with zero drag. Resting does not
  mean an instant stop. At zero viscosity, momentum remains conserved.

Controlled reference swimmer, 10 seconds, viscosity .18, no food/reproduction:

| Neural command | Net displacement | Motor work heat | Basal + sensory heat |
| --- | ---: | ---: | ---: |
| Neutral inherited gait | 728.46 px | 11.286 J | 303.50 J |
| Motors disengaged, including initial ramp | 46.67 px | 0.167 J | 303.50 J |
| Gentle amplitude (0.4×) | 305.98 px | 1.729 J | 303.50 J |
| Faster rhythm (+28%) | 867.66 px | 16.615 J | 303.50 J |
| Maximum amplitude (1.75×) | 274.41 px | 11.658 J | 303.50 J |

Motor work after disengagement settles is exactly zero; initial ramp/coasting
explains residual displacement. Maximum amplitude is not automatically efficient:
it causes the reference to turn/fold more. Opposite angle commands produced
opposite lateral displacements (+161.31 and -163.81px). These are controlled
actuation results, not evolved hunting. The in-game 15s reference verification
at viscosity .22 measured 1206.42px, zero motor-off drift and .1194px anchor error.

Paired food-seeking protocol: two untrained balanced founder types, eight seeds
each, 40 food particles in the same 1000px-square patch, 30 simulated seconds,
no inflow and reproduction disabled. The comparison holds retinal input at its
empty-water baseline while keeping anatomy, costs and internal feedback intact.

| Build | Mean intake with vision | Mean intake with retinal input held at baseline |
| --- | ---: | ---: |
| 0.2.1 baseline | 2323.75 J | 2106.25 J |
| 0.3.0 | 2092.50 J | 2175.00 J |

This small heterogeneous sample establishes no consistent vision advantage and
no improved foraging claim. Bodies, drag and temporal feedback affect encounters;
these means are not a general intelligence score. New motor authority works,
but reliable food-seeking/escape still needs deliberate controller evaluation.
Reproduce current measurements with `npm run benchmark:behavior`; recorded
trial data and the drag sweep are in `docs/behavior-results-0.3.0.json`.

Default initialization, 60 seconds at 1/60s: all 18 founders survived for seeds
4242, 71 and 1901. Seed 4242 also hatched one offspring (19 living). Absolute
ledger discrepancies were 1.21e-8, 6.98e-9 and 1.40e-9 J respectively.

Five-minute default ecosystem, seed 4242:

| Simulated time | Living | Eggs | Highest living generation | Recorded deaths |
| --- | ---: | ---: | ---: | ---: |
| 60 s | 19 | 0 | 2 | 0 |
| 120 s | 23 | 1 | 2 | 0 |
| 180 s | 28 | 0 | 2 | 0 |
| 240 s | 33 | 2 | 3 | 0 |
| 300 s | 41 | 1 | 3 | 0 |

Final ledger discrepancy: 3.29e-7 J. Reproduce with the standard 300s benchmark.
This sample does not establish indefinite ecological stability; founder age
turnover, natural selection and hunting need longer dedicated evaluation.

### Remaining focused work

Solid inter-organism and nonadjacent self-contact remains next. Other pending
work includes unused reproduction genes/trade-offs, growth/injury/repair,
controller training or stronger evaluated founder priors, evolving brain
structure, spatial indexing, UI-thread separation, niches and experiment archives.

## Previous release — version 0.2.1

This release changes ecological outcomes. The 0.2.0 results below are historical,
not expected results for the corrected feeding model.

### Implemented

- Independent inherited body pigment, with no mouth-driven recoloring or excluded
  green band. Heritable `colorMutationRate` scales the world's pigment mutation
  probability. Zero preserves parental hue, saturation and lightness in the next
  offspring; the variability gene itself can mutate. This does not add conscious
  color selection or neural control of pigment.
- Rendering and optical sensing share the per-part body pigment, including the
  existing low-energy shading. Founder anatomy, gaits, oscillator/motor equations,
  drag, energy-conversion constants and the interface layout are preserved.
- Three diet labels: herbivore, carnivore and omnivore. Different specialist mouths
  give an omnivorous overall diet without changing any individual mouth's food
  permissions. Bank diet filters use the same overall classification. Mouth
  anatomy remains visible separately.
- One intake allowance per mouth per simulated tick, shared across prey, eggs,
  nutrients and remains. Capacity limits intake before food is removed; full
  storage no longer destroys surplus food. Omnivore mouths retain their half-rate
  trade-off. Resource visitation order is still deterministic and sequential.
- The bite exhausting a living prey's reserve immediately records lethal predation,
  so the victim cannot subsequently be mislabeled as starving in its own update.
  Existing reserve-first predation remains a simplified model, not tissue injury.
- Corpses and nonviable eggs leave pink edible remains. Carnivore/omnivore mouths
  can scavenge these at 85% assimilation, with the remainder recorded as heat.
  Uneaten remains become plant nutrients after 60 simulated seconds, preserving
  their remaining chemical energy. This is a simple timed conversion, not a
  microbial decomposition model. Existing particle-cap loss accounting remains.
- HUD/report counts distinguish plant food and remains. Remains do not suppress
  plant-food replenishment, and Clear Free Nutrients removes only plant food.
- Save schema v5 retains food type, decay timers and pigment variability, with
  exact continuation in this build. V3/v4 saves still import; their untyped food
  stays plant food. Older saves run under the updated simulation rules.

### Executed validation

- 49 simulation tests passed (29 existing, 20 new). Coverage includes the six-food
  intake reproduction at 1/30, 1/60 and 1/120s; shared mixed-resource intake;
  permissions for all mouths against plant food and remains; lethal predation in
  both organism orders; finite-storage feeding; conserved body/egg energy;
  remains decay; color inheritance; optical pigment; validation and v5 exact
  continuation through decay, plus v3/v4 import compatibility.
- All four production-browser tests passed locally, including import/render of a
  green creature with different specialist mouths and a distinct pink remains
  particle. HUD/report show one omnivore, one remains particle and zero nutrients.
  Existing catalogue, inspector dragging, live neural graph, sandbox, save/load,
  Pages-subpath startup and pause/resume checks remain covered.
- TypeScript and production build passed. Controlled swimming remains 1263.19px
  COM displacement in 15s, with zero motor-off drift and 0.1197px final anchor error.
  No frame-rate or learned-behavior claim is inferred from headless execution.

Default initialization, 60 simulated seconds at 1/60s:

| Seed | Living | Eggs | Recorded deaths | Absolute ledger discrepancy |
| --- | ---: | ---: | ---: | ---: |
| 4242 | 18 | 1 | 0 | 7.0 × 10⁻⁹ J |
| 71 | 18 | 0 | 0 | 8.4 × 10⁻⁹ J |
| 1901 | 18 | 0 | 0 | 2.3 × 10⁻⁹ J |

Five-minute default ecosystem, seed 4242:

| Simulated time | Living | Eggs | Highest living generation | Recorded deaths |
| --- | ---: | ---: | ---: | ---: |
| 60 s | 18 | 1 | 1 | 0 |
| 120 s | 23 | 1 | 2 | 0 |
| 180 s | 29 | 2 | 2 | 0 |
| 240 s | 37 | 1 | 3 | 1 |
| 300 s | 49 | 5 | 4 | 1 |

Final ledger discrepancy: 1.36 × 10⁻⁷ J. Reproduce with
`npm run benchmark -- --seed 4242 --seconds 300`. This is one short ecological
sample; it does not establish indefinite sustainability or reliable hunting.
No reserve inflation, replacement creatures or survival immunity were added.

### Next focused work

- Give brains control over oscillator amplitude/motor engagement, with useful
  feeding/contact feedback and controlled behavioral comparisons.
- Add inter-organism and nonadjacent self-contact; calibrate nonzero longitudinal
  drag while retaining effective active swimming.
- Retire or implement the unused reproduction genes; establish meaningful trait
  trade-offs before expanding brain structure. Growth, injury/repair and gradual
  senescence remain future biology features.
- Spatial indexing, UI-thread separation, environmental niches and selectable
  experiment archives remain pending. Preserve honest measured limits.

## Previous release — version 0.2.0

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
