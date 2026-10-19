import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createServer} from 'vite';
import type {Egg, Genome, Organism, SimulationState, SimulationSettings} from '../App';

// Load the actual gameplay module, including Vite's asset transforms.
const server = await createServer({server: {middlewareMode: true}, appType: 'custom'});
const sim = await server.ssrLoadModule('/App.tsx') as typeof import('../App');
await server.close();

const settings: SimulationSettings = {
  worldWidth: 2400, worldHeight: 1500, waterViscosity: 0.22,
  targetNutrients: 0, inflowRate: 0, kinshipProtection: true, mutationSeverity: 0,
};
function world(organisms: Organism[] = [], eggs: Egg[] = []): SimulationState {
  return {
    simTime: 0, organisms, eggs, nutrients: [], bubbles: [], caustics: [],
    ledger: {externalInflow: 0, metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
    nutrientAccumulator: 0, totalBirths: 0, totalDeaths: 0,
    prng: new sim.XoshiroPRNG(4242), lineage: new Map(), recentDeaths: [],
  };
}
function accounted(s: SimulationState): number {
  return s.organisms.reduce((v, o) => v + o.energy + o.structuralBiomass, 0)
    + s.eggs.reduce((v, e) => v + e.fundedReserve + e.fundedStructural, 0)
    + s.nutrients.reduce((v, n) => v + n.energyValue, 0)
    + s.ledger.metabolicDissipation + s.ledger.mechanicalWorkHeat + s.ledger.recordedLosses;
}
function egg(genome: Genome, structural: number, reserve: number): Egg {
  return {
    id: 'egg', clutchId: 'clutch', parentOrgId: 'parent', x: 1200, y: 750,
    vx: 0, vy: 0, genome, fundedStructural: structural, fundedReserve: reserve,
    incubationProgress: 1, totalIncubationTime: 10, pulseTimer: 0,
    colorHue: 120, readyToHatch: false,
  };
}
function nutrient(x: number, y: number, energyValue = 3000) {
  return {id: 'food', x, y, vx: 0, vy: 0, energyValue,
    radius: sim.getNutrientRadius(energyValue), bottomTimer: 0, pulseTimer: 0};
}

test('damaged eggs repair tissue from their finite reserve without a hatchling energy floor', () => {
  const genome = sim.createReferenceNematodeGenome();
  const s = world([], [egg(genome, genome.bodyCost - 80, 90)]);
  const before = accounted(s);
  sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(s.totalBirths, 1);
  assert.ok(Math.abs(accounted(s) - before) < 1e-7);
  assert.ok(s.organisms[0].energy < 10);
});

test('nonviable eggs transfer into nutrients exactly once', () => {
  const s = world([], [egg(sim.createReferenceNematodeGenome(), 10, 80)]);
  sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(s.eggs.length, 0);
  assert.equal(s.nutrients[0].energyValue, 90);
  assert.equal(accounted(s), 90);
});

test('decomposition records energy removed when the resource cap is full', () => {
  const org = sim.spawnOrganism(sim.createReferenceNematodeGenome(), 1200, 750);
  org.dissolving = true;
  org.dissolveAlpha = 0.001;
  const s = world([org]);
  s.nutrients = Array.from({length: 2200}, () => nutrient(100, 100));
  const before = accounted(s);
  sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(s.organisms.length, 0);
  assert.ok(Math.abs(accounted(s) - before) < 1e-7);
});

test('starvation dissipates only available energy', () => {
  const org = sim.spawnOrganism(sim.createReferenceNematodeGenome(), 1200, 750, 0, undefined, 0.001);
  const s = world([org]);
  const before = accounted(s);
  sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(org.energy, 0);
  assert.equal(org.deathCause, 'Starvation');
  assert.ok(Math.abs(accounted(s) - before) < 1e-7);
});

for (const mouthType of ['carnivore', 'herbivore', 'omnivore'] as const) {
  test(`${mouthType} mouth respects nutrient permissions in gameplay`, () => {
    const g = sim.createReferenceNematodeGenome();
    g.motorForce = 0;
    g.mouths[0].mouthType = mouthType;
    const org = sim.spawnOrganism(g, 1200, 750);
    const anchor = sim.getCardinalAnchor('EAST', g.parts[0].width, g.parts[0].height);
    const s = world([org]);
    s.nutrients = [nutrient(1200 + anchor.x, 750 + anchor.y)];
    sim.stepSimulation(s, settings, 1 / 60);
    assert.equal(s.nutrients[0].energyValue < 3000, mouthType !== 'carnivore');
  });
}

test('adult lays an affordable egg below the retired capacity threshold and respects cooldown', () => {
  const g = sim.createReferenceNematodeGenome();
  g.motorForce = 0;
  const org = sim.spawnOrganism(g, 1200, 750);
  org.age = 30;
  const s = world([org]);
  s.simTime = 30;
  org.energy = sim.evaluateReproductionAffordability(org, 30, 1, 0).requiredBudget + 100;
  assert.ok(org.energy < g.maxEnergyCapacity * g.reproductionThreshold);
  const before = accounted(s);
  sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(s.eggs.length, 1);
  assert.equal(org.clutchesLaid, 1);
  assert.equal(org.isGravid, false);
  assert.ok(Math.abs(accounted(s) - before) < 1e-7);
  sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(s.eggs.length, 1);
});

test('age death is recorded with positive reserve', () => {
  const org = sim.spawnOrganism(sim.createReferenceNematodeGenome(), 1200, 750);
  org.age = org.maxLifespan - 0.001;
  const s = world([org]);
  for (let i = 0; i < 45; i++) sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(s.recentDeaths[0].cause, 'Old Age');
  assert.ok(s.recentDeaths[0].energyAtDeath > 0);
});

test('an 18-founder ecosystem runs for 60 simulated seconds with a balanced energy ledger', () => {
  const s = world();
  const archetypes = ['eel', 'flapper', 'tadpole', 'glider', 'predator', 'random'] as const;
  for (let i = 0; i < 18; i++) {
    const genome = sim.createArchetypeGenome(archetypes[i % archetypes.length], 1, [], s.prng);
    s.organisms.push(sim.spawnOrganism(genome,
      s.prng.range(250, 2150), s.prng.range(200, 1300), s.prng.range(0, Math.PI * 2)));
  }
  for (let i = 0; i < 900; i++) {
    const n = nutrient(s.prng.range(40, 2360), s.prng.range(40, 1460));
    n.pulseTimer = s.prng.range(0, Math.PI * 2);
    s.nutrients.push(n);
  }
  const before = accounted(s);
  const ecosystemSettings = {...settings, waterViscosity: 0.18, targetNutrients: 900,
    inflowRate: 15, mutationSeverity: 0.25, maxOrganisms: 45};
  for (let i = 0; i < 60 * 60; i++) sim.stepSimulation(s, ecosystemSettings, 1 / 60);
  const error = accounted(s) - before - s.ledger.externalInflow;
  assert.ok(Math.abs(error) < 1e-4, `energy discrepancy: ${error} J`);
  assert.ok(s.organisms.length > 0);
  for (const o of s.organisms) {
    assert.ok(Number.isFinite(o.energy) && o.energy >= 0);
    for (const segment of o.segments) assert.ok(Object.values(segment).every(Number.isFinite));
  }
  console.log(JSON.stringify({simTime: s.simTime, survivors: s.organisms.length,
    eggs: s.eggs.length, hatches: s.totalBirths, deaths: s.totalDeaths, energyErrorJ: error}));
});
