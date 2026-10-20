import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, createSnapshot, restoreSnapshot, totalAccountedEnergy} from '../persistence';
const settings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, mutationSeverity: 0, waterViscosity: 0};
function world() {return createInitialWorld(settings, 9, 'unbiased', 'standard', 0);}
function single() {
  const g = createFounderGenome('FND-001'); g.parts = [g.parts[0]]; g.eyes = []; g.motorForce = 0;
  g.bodyCost = sim.calculateBodyCost(g.parts, g.eyes, g.mouths);
  g.maxEnergyCapacity = sim.calculateMaxEnergyCapacity(g.parts, g.storageTraitMultiplier); sim.remapBrain(g); return g;
}
function egg(g = createFounderGenome('FND-021'), x = 1200, y = 750): sim.Egg {
  return {id: 'egg', clutchId: 'clutch', parentOrgId: 'parent', x, y, vx: 0, vy: 0, genome: g,
    fundedStructural: g.bodyCost, fundedReserve: 10000, incubationProgress: 1, totalIncubationTime: 10,
    pulseTimer: 0, colorHue: 120, readyToHatch: true};
}
function close(a: number, b: number) {assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);}

test('feeding flag reflects actual previous-tick ingestion and clears after feeding stops', () => {
  const s = world(), org = addExternalOrganism(s, single(), settings, 1200, 750, 0)!;
  s.nutrients.push({id: 'food', x: 1200 + org.genome.parts[0].width / 2, y: 750, vx: 0, vy: 0, radius: 1, energyValue: 3000, bottomTimer: 0});
  const input = (key: string) => org.neuralInputs[org.genome.inputKeys!.indexOf(key)];
  const reserve = org.energy; sim.stepSimulation(s, settings, 1 / 60);
  close(input('body:energy'), reserve / org.genome.maxEnergyCapacity); assert.equal(input('body:feeding'), 0);
  assert.ok(org.mouthFeedback![org.genome.mouths[0].id].intake > 0);
  sim.stepSimulation(s, settings, 1 / 60); assert.equal(input('body:feeding'), 1);
  s.nutrients = []; sim.stepSimulation(s, settings, 1 / 60); sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(input('body:feeding'), 0);
});

test('mere mouth contact with inedible food does not signal feeding', () => {
  const s = world(), g = single(); g.mouths[0].mouthType = 'carnivore';
  const o = addExternalOrganism(s, g, settings, 1200, 750, 0)!;
  s.nutrients.push({id: 'plant', x: 1217.5, y: 750, vx: 0, vy: 0, radius: 1, energyValue: 3000, bottomTimer: 0});
  for (let i = 0; i < 2; i++) sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(o.neuralInputs[o.genome.inputKeys!.indexOf('body:feeding')], 0);
});

test('depth is normalized COM depth and clamps to the tank surface/floor', () => {
  for (const y of [-50, 300, 1800]) {
    const s = world(), g = single(), o = addExternalOrganism(s, g, settings, 1200, y, 0)!;
    sim.stepSimulation(s, settings, 1 / 60);
    close(o.neuralInputs[o.genome.inputKeys!.indexOf('body:depth')], Math.max(0, Math.min(1, y / settings.worldHeight)));
  }
  const s = world(), g = createFounderGenome('FND-001'); g.motorForce = 0;
  const o = addExternalOrganism(s, g, settings, 1200, 750, Math.PI / 2)!, depth = sim.calculateOrganismCOM(o).y / settings.worldHeight;
  sim.stepSimulation(s, settings, 1 / 60); close(o.neuralInputs[o.genome.inputKeys!.indexOf('body:depth')], depth);
});

test('a passing body blocks hatching; a ready egg keeps its funding and chosen heading', () => {
  const s = world(), blocker = addExternalOrganism(s, single(), settings, 1200, 750, 0)!;
  const e = egg(); s.eggs.push(e); s.ledger.externalInflow += e.fundedReserve + e.fundedStructural;
  const before = totalAccountedEnergy(s), funds = e.fundedReserve + e.fundedStructural;
  sim.stepSimulation(s, settings, 1 / 60); const heading = e.hatchHeading, prng = s.prng.getState();
  assert.equal(s.eggs.length, 1); assert.equal(s.organisms.length, 1); assert.ok(e.readyToHatch);
  sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(e.hatchHeading, heading); assert.deepEqual(s.prng.getState(), prng);
  close(e.fundedReserve + e.fundedStructural, funds); close(totalAccountedEnergy(s), before);
  blocker.segments[0].x += 500; sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(s.eggs.length, 0); assert.equal(s.organisms.length, 2); close(totalAccountedEnergy(s), before);
});

test('the entire newborn envelope must be empty, including gaps between its limbs', () => {
  const s = world(), g = single(); g.parts[0] = {...g.parts[0], width: 3, height: 3};
  const blocker = sim.spawnOrganism(g, 1220, 770, 0, undefined, undefined, s.prng);
  const e = egg(); e.hatchHeading = 0;
  assert.equal(sim.findClearHatchHeading(e, settings, [blocker]), null);
  blocker.dissolving = true; assert.notEqual(sim.findClearHatchHeading(e, settings, [blocker]), null);
});

test('edge eggs choose a contained orientation deterministically, without drawing randomness', () => {
  const e = egg(createFounderGenome('FND-001'), 35, 750); e.hatchHeading = 0;
  const a = sim.findClearHatchHeading(e, settings, []), b = sim.findClearHatchHeading(e, settings, []);
  assert.notEqual(a, null); assert.notEqual(a, 0); assert.equal(a, b);
});

test('simultaneous eggs cannot create overlapping siblings', () => {
  const s = world(); s.eggs = [egg(single()), {...egg(single()), id: 'egg-2'}];
  sim.stepSimulation(s, settings, 1 / 60);
  assert.equal(s.organisms.length, 1); assert.equal(s.eggs.length, 1); assert.ok(s.eggs[0].readyToHatch);
});

test('v7 migration preserves old pathways, activations and PRNG; new channels start neutral', () => {
  const s = world(), o = addExternalOrganism(s, single(), settings, 1200, 750, 0)!;
  o.neuralHidden[3] = .35;
  const old = createSnapshot(s, settings); old.schemaVersion = '7.0.0';
  const downgrade = (g: sim.Genome) => {g.brainVersion = 3; g.inputKeys = g.inputKeys!.slice(0, -2); g.weightsIH = g.weightsIH.map(row => row.slice(0, -2));};
  downgrade(old.state.organisms[0].genome); old.state.organisms[0].neuralInputs = old.state.organisms[0].neuralInputs.slice(0, -2);
  for (const [, rec] of old.state.lineage) downgrade(rec.genome);
  const before = structuredClone(old.state.organisms[0]), restored = restoreSnapshot(old), current = restored.state.organisms[0];
  assert.equal(current.genome.brainVersion, 4); assert.deepEqual(current.neuralHidden, before.neuralHidden);
  current.genome.weightsIH.forEach((row, h) => {assert.deepEqual(row.slice(0, -2), before.genome.weightsIH[h]); assert.deepEqual(row.slice(-2), [0, 0]);});
  assert.deepEqual(current.neuralInputs.slice(0, -2), before.neuralInputs); assert.deepEqual(current.neuralOutputs, before.neuralOutputs);
  assert.deepEqual(restored.state.prng.getState(), old.state.prngState);
});

test('blocked hatch state and new senses round-trip exactly in current saves', () => {
  const s = world(); addExternalOrganism(s, single(), settings, 1200, 750, 0); s.eggs.push(egg());
  sim.stepSimulation(s, settings, 1 / 60); const snapshot = createSnapshot(s, settings), restored = restoreSnapshot(snapshot);
  assert.deepEqual(createSnapshot(restored.state, settings), snapshot);
  sim.stepSimulation(s, settings, 1 / 60); sim.stepSimulation(restored.state, settings, 1 / 60);
  assert.deepEqual(createSnapshot(s, settings), createSnapshot(restored.state, settings));
});
