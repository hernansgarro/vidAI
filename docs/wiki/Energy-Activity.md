# Energy Activity Overlays

**Contributor fork only:** implemented in `hernansgarro/vidAI`; this page does
not assert acceptance or publication in upstream VIDA. Applies only to VIDA 2D.

Green tint follows every body segment during significant actual feeding uptake
from nutrients, carrion, eggs or living prey. Red tint follows the body segment
identified by an actual extracting predator mouth. Several mouths can mark
several contacted segments. A single mouth uses the first contacting segment
already selected by the authoritative feeding path; it does not run a new
contact search or guess how a bite is distributed across tissue.

Metabolism, movement, neural upkeep, egg funding, failed contact and food
proximity produce no red signal. Gains and losses are independent even when the
organism's net reserve change is zero or negative. Existing mouth animations,
selection, reproductive markers, eyes, grid lines and geometry remain intact.

## Significance and timing

The collector sums actual transferred joules in a rolling 250ms **simulation**
window (15 fixed ticks). Each direction uses the largest pre-transfer usable
reserve plus structural biomass stock in that window. Its denominator is at
least 1% of the larger inherited reserve capacity or body construction cost,
with a numerical floor of 1e-9J. This prevents exhausted reserves from producing
unbounded sensitivity while retaining meaningful tissue extraction. Activation
requires 0.5%; an active signal persists down to 0.35% to avoid threshold chatter.
These presentation constants are in `energyActivity.ts`, not simulation settings.

Both signals share a 400ms pause-aware **presentation** cycle, independent of
transfer count, amount and playback multiplier. Smooth squared-cosine lobes
alternate their peaks by 200ms. A faint 0.025-alpha trough keeps even short
completed intervals visible between peaks; only one color exceeds that faint
trough at any phase, avoiding strong mixed-color overlays. Peak overlay alpha
is 0.24 green / 0.28 red. The existing rounded
body path is filled again, without geometry expansion, halos or body scaling.
An inactive signal fades for at most 100ms of unpaused presentation time.

At x0, phase and fade freeze. Late in-flight activity packets cannot start new
signals while paused. Inspection and camera zoom remain operational. Resume
uses a new wall-clock baseline, so stopped wall time never becomes a burst.
World replacement/reset clears all signals; death/removal clears the affected
creature. Signals are transient and never exported or saved.

## Authority and speed

The Worker emits primitive receipts only after real uptake/extraction is known.
A host-owned collector retains active intervals crossed between delivered
frames, including in MAX. It sends small activity rows with existing render
frames, with no additional messages or per-organism timers. If an interval has
already ended, it gets only the short fade, not a queued full pulse cycle.
Multiple subframe transfers never generate a pulse each. At extreme speeds,
individual completed intervals may be brief; no decorative history is replayed.

The main-thread fallback shares the same collector and renderer. All metadata
stays outside genomes, authoritative world state and persistent schemas. Optical
sensing still reads the original inherited pigmentation and physical geometry.
The decorative tint never enters RGB rays, neural inputs, decisions or physics.
Tests compare complete observer-free and instrumented saved-state continuation,
including optical and neural data, energy and PRNG, with exact equality.

Lethal extraction follows existing mortality: a dissolving victim loses its
transient indication immediately. No extra corpse animation or altered lifespan
is introduced. Very small on-screen bodies naturally show very small tinted
areas; zoom improves readability without enlarging collision geometry.
