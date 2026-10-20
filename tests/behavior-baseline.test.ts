import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, totalAccountedEnergy} from '../persistence';

// Four seeded, paired counterfactuals. Compare identical genomes/settings;
// blanking retinal synapses holds the no-target baseline, not the whole brain.
const settings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, mutationSeverity: 0};
const ox = 1200, oy = 750, seconds = 3, dt = 1 / 60;
function removeVisualWeights(g: sim.Genome) {
  for (let i = 0; i < g.inputKeys!.length; i++) {
    const key = g.inputKeys![i];
    if (!key.startsWith('eye:')) continue;
    const type = key.split(':').at(-1);
    const baseline = type === 'distance' ? 1 : 0;
    g.weightsIH.forEach((row, h) => {g.biasesH[h] += row[i] * baseline; row[i] = 0;});
  }
}
function makeTrial(side: -1 | 1, seen: boolean, threat: boolean, seed: number) {
  const s = createInitialWorld(settings, seed, 'balanced', 'standard', 0);
  const g = createFounderGenome('FND-001');
  if (!seen) removeVisualWeights(g);
  const org = addExternalOrganism(s, g, settings, ox, oy, 0)!;
  org.genome.maturityAge = 1000;
  // Eye rays are at +/-0.5 rad; aiming a target at their bearings
  // makes a visible stimulus instead of an accidental retinal miss.
  const angle = side * .5, distance = 175;
  const targetX = ox + Math.cos(angle) * distance, targetY = oy + Math.sin(angle) * distance;
  if (threat) {
    const predator = createFounderGenome('FND-031');
    predator.motorForce = 0; predator.maturityAge = 1000;
    const other = addExternalOrganism(s, predator, settings, targetX, targetY, Math.PI)!;
    other.genome.motorForce = 0;
  } else {
    s.nutrients.push({id: 'single-visible-nutrient', x: targetX, y: targetY, vx: 0, vy: 0,
      kind: 'nutrient', energyValue: 3000, radius: sim.getNutrientRadius(3000), bottomTimer: 0, pulseTimer: 0});
    s.ledger.externalInflow += 3000;
  }
  const initial = totalAccountedEnergy(s);
  const before = sim.calculateOrganismCOM(org);
  sim.stepSimulation(s, settings, dt);
  const hits = org.rayHits.filter(r => r.hit && (threat ? r.objectType === 'creature' : r.objectType === 'nutrient'));
  const angleOutput = org.neuralOutputs.find((_, i) => org.genome.outputKeys![i].endsWith(':Angle')) ?? 0;
  for (let t = 1; t < seconds * 60; t++) sim.stepSimulation(s, settings, dt);
  const after = sim.calculateOrganismCOM(org);
  const endDistance = Math.hypot(after.x - targetX, after.y - targetY);
  const startDistance = Math.hypot(before.x - targetX, before.y - targetY);
  const consumed = s.nutrients.length ? 3000 - s.nutrients[0].energyValue : threat ? 0 : 3000;
  const energyError = totalAccountedEnergy(s) - initial;
  return {seed, side, vision: seen, threat, hits: hits.length, angleOutput,
    startDistance, endDistance, progressPx: startDistance - endDistance,
    eatenJ: consumed, deltaX: after.x - before.x, deltaY: after.y - before.y, energyError};
}
test('controlled seeded retina on/off microtrials report seeing, motor response and actual displacement separately', () => {
  const pairs = [];
  for (const threat of [false, true]) for (const side of [-1, 1] as const) {
    const seed = threat ? 503 : 502;
    const sight = makeTrial(side, true, threat, seed);
    const blind = makeTrial(side, false, threat, seed);
    assert.ok(sight.hits > 0, 'stimulus must be physically visible before comparing behavior');
    assert.ok(Math.abs(sight.energyError) < 1e-5 && Math.abs(blind.energyError) < 1e-5);
    assert.equal(sight.startDistance, blind.startDistance);
    pairs.push({scenario: threat ? 'creature threat' : 'food', side,
      visualHitCount: sight.hits,
      turnOutputDifference: sight.angleOutput - blind.angleOutput,
      sightedProgressPx: sight.progressPx, blindProgressPx: blind.progressPx,
      sightedConsumedJ: sight.eatenJ, blindConsumedJ: blind.eatenJ,
      sightedDy: sight.deltaY, blindDy: blind.deltaY});
  }
  console.log('VIDA_PHASE5_BASELINE '+JSON.stringify(pairs));
});
