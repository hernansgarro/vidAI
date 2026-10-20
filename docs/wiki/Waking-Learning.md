# Waking Synaptic Learning

VIDA creatures can now **acquire motor-synapse adjustments during their
own lifetimes**, provided they inherit a nonzero plasticity allele. These
changes are separate from the inherited genome, adapt only existing
enabled synapses, use physical mouth intake as reinforcement, cost usable
energy, and gradually fade when not reinforced.

This is the **first bounded implementation** of original Phase 5.
It establishes a real within-life change to motor policy, **not yet
an improved lifetime food-gathering or survival outcome**.

## Mechanism

```mermaid
flowchart LR
  G[Heritable baseline recurrent network] --> A[Motor Angle command]
  R[Real absorbed food from physical mouth] --> E[Recent motor eligibility trace]
  A --> E
  E --> P[Somatic acquired synapse adjustment]
  P --> A
  P --> C[Energy paid as metabolic heat]
  F[Inherited forgetting rate] --> P
  P --> S[Creature-specific save state]
  G --> O[Offspring receive inherited genes]
```

### Inherited capability, acquired experience

- **`plasticityRate`** is an optional inherited allele (0–0.8 per
  second); absent or zero means **no learning** and the exact old
  runtime network. A rare ordinary asexual mutation may introduce
  or alter it. **`forgettingRate`** is an optional inherited
  relaxation allele (0–1 per second; default 0.1 when enabled).
- A learning-capable organism maintains up to **96 enabled
  hidden-neuron → joint `Angle` motor synapses**. Which ones are
  eligible comes from stable genomic neuron/output IDs and the existing
  disabled-connection mask. The selection is deterministic, not a
  new kind of physical movement or a new sensor.
- An **eligibility trace** (memory of actual recent hidden activation
  × motor output, with a 0.6-second time constant) associates recent
  command activity with the **previous completed tick's genuine
  compatible-mouth absorbed intake**. Actual absorption—not visual
  proximity, food color, or a diagnostic label—is the reward.
- After a neural update, the individual can change its own bounded
  synapse offset by a reward-modulated amount. Offsets are limited to
  **±0.8 per edge**. Learned synapses modify subsequent neural
  Angle commands and therefore use the same pre-existing
  torque-limited hinges and water resistance. Unrewarded offsets
  relax exponentially; no learning or decay step changes inherited
  genomic weights.
- **Energy:** maintaining eligible plastic edges costs
  **0.002 J per active synapse per second**, and rewriting costs
  **0.4 J per unit absolute weight adjustment**. Both are actually
  removed from creature reserves, placed in the metabolic heat ledger
  and limited by available energy. Plasticity is not free and
  cannot keep changing synapses after reserves are exhausted.

### Lifetime memory versus inheritance and previous brain memory

The inherited recurrent neural weights remain in `genome.weightsHO`.
The per-creature `learnedMotorWeights` entries contain the acquired
`delta` and recent `eligibility`, identified by stable synapse key.
**Newborns inherit the ability to learn and the genetic baseline,
never the parent's learned offsets or eligibility.** Their learned
state begins empty. Old saves continue unchanged. Current schema
**v11** saves/reloads the new optional somatic state exactly, with
strict bounds, stable identities and no resetting of ongoing learning.

This differs from the earlier **activation-memory timescale**:
leaky recurrent activations remember recent neural *activity*; Phase
5 plasticity changes an effective synaptic connection *while alive*.
Neither feature is simulated dreaming or replay.

The selected creature's Brain diagram uses the **effective weight**
(inherited weight plus acquired offset) for each motor connection.
When learning is enabled it also displays genetic learning/forgetting
rates, count of adapted motor synapses and metabolic plasticity cost.
It does not show an invented food target or prescribe behavior.

## Verified and not yet verified

- In a narrow physical-contact operant test, a one-neuron policy
  exposed to **2,400 J absorbed from real finite plant food** grew
  an existing `Angle` motor output from approximately **0.642**
  to **0.691**, while a genetically matching unfed control remained
  at **0.642**. The trained genome's original genetic weight did
  not change. The altered command existed only in the exposed animal,
  and fading lowered its acquired offsets in subsequent food-free
  steps.
- That test deliberately sets **motor force to zero** to isolate
  synaptic learning and energy accounting from changes in swimming
  geometry. It proves a within-life **reward-conditioned neural
  response**, **not** improved physical searching, eating, survival,
  reproduction, or general foraging.
- Tests also require real feeding receipts, finite energy accounting,
  correct newborn inheritance, mutation reachability, exact saved
  continuation and rejection of maliciously invalid plastic
  synapse IDs/weights. All 55 existing founders have the allele
  absent and retain their former behavior exactly.

**Original Phase 5 is in progress, not complete.** The next
meaningful validation should compare *physical* food intake/survival
under paired learning-enabled versus same-genome learning-disabled
creatures across multiple post-experience trials. Only after
demonstrating behavioral benefit should the project consider
original **Phase 6 optional sleep/replay**. No sleeping, replay,
experience handouts, extra thrust, hardcoded target selection or
within-life topology growth exists today.

## Code and checks

- `simulation.ts`: `plasticMotorEdges`, `applyWakingPlasticity`,
  real feedback and motor evaluation
- `persistence.ts`: save validation and diagnostic report
- `BrainGraph.tsx`: effective live weights and read-only acquired
  learning statistics
- `tests/waking-plasticity.test.ts`: controls, real reward,
  forgetting, mutation, inheritance, conservation and save integrity

The Wiki describes current features; experimental history belongs
in `docs/PROJECT_STATUS.md`.
