import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, createSnapshot, restoreSnapshot, totalAccountedEnergy, validateGenome} from '../persistence';

const opts = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, mutationSeverity: 0, waterViscosity: 0};
const near = (a: number, b: number, tolerance = 1e-8) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
type Spectrum = [number, number, number];

function genome(sensitivity?: Spectrum) {
  const g = sim.createReferenceNematodeGenome(new sim.XoshiroPRNG(2026));
  g.parts = [g.parts[0]];
  g.mouths = [];
  g.eyes = [{id: 'eye-0', partIndex: 0, direction: 'EAST', fov: .8, range: 500,
    ...(sensitivity ? {spectralSensitivity: sensitivity} : {})}];
  g.motorForce = 0; g.maturityAge = 1000;
  sim.remapBrain(g);
  g.bodyCost = sim.calculateBodyCost(g.parts, g.eyes, g.mouths);
  g.maxEnergyCapacity = sim.calculateMaxEnergyCapacity(g.parts, g.storageTraitMultiplier);
  assert.deepEqual(validateGenome(g), g);
  return g;
}
function scenario(sensitivity?: Spectrum, stimulus: 'food' | 'green-body' = 'food') {
  const s = createInitialWorld(opts, 2026, 'unbiased', 'standard', 0);
  const observer = addExternalOrganism(s, genome(sensitivity), opts, 1200, 750, 0)!;
  const x = 1200 + observer.genome.parts[0].width / 2 + 150;
  if (stimulus === 'food') {
    s.nutrients.push({id: 'food', x, y: 750, vx: 0, vy: 0, radius: 18, energyValue: 3000, bottomTimer: 0});
    s.ledger.externalInflow += 3000;
  } else {
    const target = genome();
    target.eyes = []; target.hue = 120; target.saturation = 100; target.lightness = 50;
    sim.remapBrain(target);
    target.bodyCost = sim.calculateBodyCost(target.parts, target.eyes, target.mouths);
    addExternalOrganism(s, target, opts, x, 750, 0);
  }
  const before = totalAccountedEnergy(s);
  sim.stepSimulation(s, opts, 1 / 60);
  near(totalAccountedEnergy(s), before, 1e-5);
  const i = observer.genome.inputKeys!.indexOf('eye:eye-0:ray:2:red');
  assert.ok(i >= 0);
  const rays = observer.neuralInputs.slice(i, i + 4);
  return {s, observer, rays, hit: observer.rayHits[2], before};
}

test('omitted and explicit full-band sensitivity preserve the old retina and sensory cost', () => {
  const legacy = scenario(), full = scenario([1, 1, 1]);
  assert.deepEqual(legacy.rays, full.rays);
  assert.deepEqual(legacy.hit, full.hit);
  near(legacy.observer.sensoryEnergyRate!, full.observer.sensoryEnergyRate!);
  assert.deepEqual(genome().eyes[0].spectralSensitivity, undefined);
  assert.equal(sim.eyeSensoryUpkeep(genome().eyes), 5);
});

test('green-receptor loss reduces greenish food response, not the real red/blue reflection', () => {
  const sighted = scenario(), noGreen = scenario([1, 0, 1]), dark = scenario([0, 0, 0]);
  assert.equal(sighted.hit.objectType, 'nutrient');
  assert.equal(noGreen.hit.objectType, 'nutrient');
  assert.equal(noGreen.rays[0], sighted.rays[0]);
  assert.equal(noGreen.rays[1], 0);
  assert.equal(noGreen.rays[2], sighted.rays[2]);
  assert.ok(noGreen.rays[0] > 0 && noGreen.rays[2] > 0, 'food is not pure green');
  near(noGreen.rays[3], sighted.rays[3]);
  assert.deepEqual(dark.rays, [0, 0, 0, 1]);
  assert.ok(dark.hit.hit, 'the ray still hits physical food, but provides no sensory visibility');
  near(sighted.observer.sensoryEnergyRate! - noGreen.observer.sensoryEnergyRate!,
    sim.SENSORY_NEURAL_METABOLIC_RATE * (5 - sim.eyeSensoryUpkeep(noGreen.observer.genome.eyes)));
  assert.ok(noGreen.observer.sensoryEnergyRate! > dark.observer.sensoryEnergyRate!);
});

test('a truly green creature becomes optically undetectable with no green receptor; distance cannot betray it', () => {
  const seen = scenario([1, 1, 1], 'green-body');
  const blindGreen = scenario([1, 0, 1], 'green-body');
  assert.equal(seen.hit.objectType, 'creature');
  assert.ok(seen.rays[1] > 0 && seen.rays[3] < 1);
  assert.equal(blindGreen.hit.objectType, 'creature', 'hit type is diagnostic only');
  assert.deepEqual(blindGreen.rays, [0, 0, 0, 1]);
  assert.equal(blindGreen.hit.hit, true, 'opaque body continues to block light behind it');
});

test('sensory alleles evolve de novo, may become exactly absent, remain heritable, and can reappear', () => {
  const parent = genome(), old = structuredClone(parent);
  const zeroSeverity = sim.mutateGenome(parent, 0, new sim.XoshiroPRNG(1));
  assert.deepEqual(zeroSeverity.eyes, parent.eyes);
  let mutant: sim.Genome | undefined;
  for (let seed = 1; seed <= 180; seed++) {
    const offspring = sim.mutateGenome(parent, 1, new sim.XoshiroPRNG(seed));
    assert.deepEqual(validateGenome(offspring), offspring);
    if (offspring.eyes.some(e => e.spectralSensitivity?.includes(0))) {mutant = offspring; break;}
  }
  assert.ok(mutant, 'offspring mutation must be able to remove a receptor entirely');
  assert.deepEqual(parent, old, 'never edit the inherited parent in place');
  const inherited = sim.mutateGenome(mutant, 0, new sim.XoshiroPRNG(9));
  assert.deepEqual(inherited.eyes, mutant.eyes);
  const index = mutant.eyes.findIndex(e => e.spectralSensitivity?.includes(0));
  const channel = mutant.eyes[index].spectralSensitivity!.indexOf(0);
  let recovered = false;
  for (let seed = 1; seed <= 300; seed++) {
    const offspring = sim.mutateGenome(mutant, 1, new sim.XoshiroPRNG(seed));
    const equivalentEye = offspring.eyes.find(e => e.id === mutant!.eyes[index].id);
    if ((equivalentEye?.spectralSensitivity?.[channel] ?? 0) > 0) { recovered = true; break; }
  }
  assert.ok(recovered, 'a lost receptor can re-evolve');
});

test('new alleles round-trip and continue identically in v11; missing alleles stay missing', () => {
  for (const sensitivity of [undefined, [0, .4, 1] as Spectrum]) {
    const {s, observer} = scenario(sensitivity);
    assert.deepEqual(observer.genome.eyes[0].spectralSensitivity, sensitivity);
    const saved = createSnapshot(s, opts);
    const restored = restoreSnapshot(saved);
    assert.deepEqual(createSnapshot(restored.state, opts), saved);
    for (let i = 0; i < 3; i++) {
      sim.stepSimulation(s, opts, 1 / 60);
      sim.stepSimulation(restored.state, opts, 1 / 60);
    }
    assert.deepEqual(createSnapshot(restored.state, opts), createSnapshot(s, opts));
    near(totalAccountedEnergy(restored.state), s.ledger.externalInflow, 1e-5);
  }
});

test('import rejects malformed receptor arrays, NaN, negatives and gains above one', () => {
  const base = genome([1, 0, .5]);
  for (const invalid of [[1, 0], [1, 0, .5, 0], [NaN, 0, 1], [-.1, 0, 1], [0, 1.01, 1], ['1', 0, 1]]) {
    const g = structuredClone(base);
    (g.eyes[0] as unknown as {spectralSensitivity: unknown}).spectralSensitivity = invalid;
    assert.throws(() => validateGenome(g), /Invalid snapshot/);
  }
});
