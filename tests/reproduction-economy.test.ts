import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, totalAccountedEnergy, createSnapshot, restoreSnapshot} from '../persistence';

const settings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, waterViscosity: 0, mutationSeverity: 0};
function world() {return createInitialWorld(settings, 11, 'unbiased', 'standard', 0);}
function breeder(fraction = .35) {
  const s = world(), g = createFounderGenome('FND-001', 'unbiased');
  g.eggReserveFraction = fraction; g.targetClutchSize = 1; g.motorForce = 0;
  const org = addExternalOrganism(s, g, settings, 1200, 750, 0)!;
  org.age = 40; s.simTime = 50;
  return {s, org};
}
function makeEgg(x = 1200, y = 750): sim.Egg {
  const genome = createFounderGenome('FND-021');
  return {id: 'inspect', clutchId: 'c', parentOrgId: 'old', x, y, vx: 0, vy: 0, genome,
    fundedStructural: genome.bodyCost, fundedReserve: 3500, incubationProgress: 1,
    totalIncubationTime: 10, pulseTimer: 0, colorHue: genome.hue, readyToHatch: true,
    hatchHeading: 0};
}

test('specialist and omnivore rate rises preserve 2:1 throughput and 80% assimilation', () => {
  assert.equal(sim.CONTINUOUS_EAT_RATE, 3600);
  assert.equal(sim.OMNIVORE_EAT_RATE, 1800);
  for (const mouthType of ['herbivore', 'omnivore'] as const) {
    const s = world(), g = createFounderGenome('FND-001', 'unbiased');
    g.motorForce = 0; g.mouths[0].mouthType = mouthType;
    const org = addExternalOrganism(s, g, settings, 1200, 750, 0)!;
    const anchor = sim.getOrganAnchor(g.mouths[0], g.parts[0].width, g.parts[0].height);
    // Enough food to cover the complete one-second physical mouth-intake budget.
    s.nutrients = Array.from({length: 10}, (_, i) => ({id: `food-${i}`, x: 1200 + anchor.x, y: 750 + anchor.y,
      vx: 0, vy: 0, energyValue: 3000, radius: 18, bottomTimer: 0}));
    const before = totalAccountedEnergy(s);
    // A single stationary anchored contact tick avoids relying on long gait trajectories.
    const eaten = s.nutrients.reduce((v, n) => v + n.energyValue, 0);
    sim.stepSimulation(s, settings, 1 / 60);
    const removed = eaten - s.nutrients.reduce((v, n) => v + n.energyValue, 0);
    const rate = mouthType === 'omnivore' ? 1800 : 3600;
    assert.ok(Math.abs(removed - rate / 60) < 1e-6);
    assert.ok(Math.abs(org.recentFeedings![0].energyTransferred - rate / 60 * sim.MOUTH_ASSIMILATION) < 1e-6);
    assert.ok(Math.abs(totalAccountedEnergy(s) - before) < 1e-6);
  }
});

test('egg reserve allele funds real transferred energy and lowers the first-egg barrier', () => {
  for (const fraction of [.2, .35, .55]) {
    const {s, org} = breeder(fraction), g = org.genome;
    const reserve = 10000 * fraction;
    const budget = sim.evaluateReproductionAffordability(org, s.simTime, 1, 0);
    assert.equal(sim.getEggReserveFunding(g), reserve);
    assert.equal(budget.eggCost, g.bodyCost + reserve);
    assert.equal(budget.parentReserve, Math.max(2000, g.maxEnergyCapacity * .12));
    assert.equal(budget.requiredForOneEgg, budget.eggCost + budget.parentReserve);
    assert.ok(budget.requiredForOneEgg < g.bodyCost + 10000 + g.maxEnergyCapacity * .2);
    org.energy = budget.requiredForOneEgg + 100;
    const before = totalAccountedEnergy(s);
    sim.stepSimulation(s, settings, 1 / 60);
    assert.equal(s.eggs.length, 1);
    const egg = s.eggs[0];
    assert.equal(egg.fundedReserve, reserve);
    assert.equal(egg.fundedStructural, egg.genome.bodyCost);
    assert.ok(org.energy >= budget.parentReserve);
    assert.ok(Math.abs(totalAccountedEnergy(s) - before) < 1e-6);
    assert.equal(egg.genome.eggReserveFraction, fraction);
    const saved = createSnapshot(s, settings), restored = restoreSnapshot(saved);
    assert.deepEqual(createSnapshot(restored.state, restored.settings), saved);
    sim.stepSimulation(s, settings, 1 / 60);
    sim.stepSimulation(restored.state, settings, 1 / 60);
    assert.deepEqual(createSnapshot(restored.state, settings), createSnapshot(s, settings));
  }
});

test('inherited egg allocation trades earlier reproduction for hatchling reserves', () => {
  const low = breeder(.2), high = breeder(.55);
  const lowBudget = sim.evaluateReproductionAffordability(low.org, low.s.simTime, 1, 0);
  const highBudget = sim.evaluateReproductionAffordability(high.org, high.s.simTime, 1, 0);
  assert.equal(highBudget.requiredForOneEgg - lowBudget.requiredForOneEgg, 3500);
  low.org.energy = highBudget.requiredForOneEgg - 1000;
  high.org.energy = low.org.energy;
  assert.equal(sim.evaluateReproductionAffordability(low.org, low.s.simTime, 1, 0).eligible, true);
  assert.equal(sim.evaluateReproductionAffordability(high.org, high.s.simTime, 1, 0).eligible, false);
  sim.stepSimulation(low.s, settings, 1 / 60);
  sim.stepSimulation(high.s, settings, 1 / 60);
  assert.equal(low.s.eggs.length, 1);
  assert.equal(high.s.eggs.length, 0);
});

test('egg inspector status reports incubation, funding, capacity and true spatial blockers without PRNG', () => {
  const s = world(), egg = makeEgg();
  const check = () => sim.evaluateEggHatchStatus(egg, settings, s.organisms);
  const rng = s.prng.getState();
  egg.incubationProgress = .4;
  assert.equal(check().status, 'incubating');
  egg.incubationProgress = 1;
  egg.fundedStructural = 1; egg.fundedReserve = 1;
  assert.equal(check().status, 'nonviable');
  egg.fundedStructural = egg.genome.bodyCost; egg.fundedReserve = 3500;
  assert.equal(sim.evaluateEggHatchStatus(egg, {...settings, maxOrganisms: 1}, [
    addExternalOrganism(s, createFounderGenome('FND-001'), settings, 1200, 750, 0)!
  ]).status, 'population-cap');
  assert.equal(check().status, 'space-blocked');
  s.organisms[0].segments.forEach(seg => {seg.x += 700;});
  assert.equal(check().status, 'clear');
  egg.x = 0; egg.y = 0;
  assert.equal(check().status, 'tank-boundary');
  egg.x = 1200; egg.y = 750; delete egg.hatchHeading;
  assert.equal(check().status, 'orientation-pending');
  assert.deepEqual(s.prng.getState(), rng);
});

test('funded hatching has no reserve refill; clear/blocked status agrees with next kernel step', () => {
  const s = world(), egg = makeEgg();
  s.eggs.push(egg); s.ledger.externalInflow += egg.fundedReserve + egg.fundedStructural;
  const before = totalAccountedEnergy(s);
  assert.equal(sim.evaluateEggHatchStatus(egg, settings, s.organisms).status, 'clear');
  sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(s.eggs.length, 0); assert.equal(s.organisms.length, 1);
  assert.ok(s.organisms[0].energy <= 3500 && s.organisms[0].energy > 0);
  assert.ok(Math.abs(totalAccountedEnergy(s) - before) < 1e-6);
});
