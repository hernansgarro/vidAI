import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, createSnapshot, restoreSnapshot, totalAccountedEnergy, validateGenome} from '../persistence';

const settings = {...DEFAULT_SETTINGS, mutationSeverity: 0, targetNutrients: 0, inflowRate: 0, waterViscosity: 0};
const world = () => createInitialWorld(settings, 444, 'unbiased', 'standard', 0);
const prng = (seed = 19) => new sim.XoshiroPRNG(seed);
function original() { return createFounderGenome('FND-001', 'balanced'); }
function edgeWeight(g: sim.Genome, key: string): number {
  const [kind, target, source] = JSON.parse(key) as [string, string, string];
  if (kind === 'ih') return g.weightsIH[g.hiddenIds!.indexOf(target)][g.inputKeys!.indexOf(source)];
  if (kind === 'hh') return g.weightsHH[g.hiddenIds!.indexOf(target)][g.hiddenIds!.indexOf(source)];
  return g.weightsHO[g.outputKeys!.indexOf(target)][g.hiddenIds!.indexOf(source)];
}

test('new hidden node receives stable unique ID and only two weak enabled synapses', () => {
  const g = original(), originalCopy = structuredClone(g);
  const oldEdges = sim.enabledBrainEdgeCount(g);
  assert.equal(sim.mutateBrainTopology(g, 'add-neuron', prng()), true);
  assert.deepEqual(original(), originalCopy);
  assert.equal(g.hiddenIds!.length, 25);
  assert.ok(g.hiddenIds![24].startsWith('hidden:mut-'));
  assert.deepEqual(g.hiddenIds!.slice(0, 24), originalCopy.hiddenIds);
  assert.deepEqual(g.weightsIH.slice(0, 24), originalCopy.weightsIH);
  assert.deepEqual(g.weightsHH.slice(0, 24).map(row => row.slice(0, 24)), originalCopy.weightsHH);
  assert.deepEqual(g.weightsHO.map(row => row.slice(0, 24)), originalCopy.weightsHO);
  assert.deepEqual(g.biasesH.slice(0, 24), originalCopy.biasesH);
  assert.equal(sim.enabledBrainEdgeCount(g), oldEdges + 2);
  const id = g.hiddenIds![24];
  assert.equal(g.disabledConnections!.filter(key => JSON.parse(key).includes(id)).length,
    g.inputKeys!.length + g.outputKeys!.length + g.hiddenIds!.length * 2 - 1 - 2);
  assert.deepEqual(validateGenome(g), g);
});

test('adding a weak hidden path gives only a tiny immediate perturbation to prior motor commands', () => {
  const baseline = original(), expanded = structuredClone(baseline);
  assert.equal(sim.mutateBrainTopology(expanded, 'add-neuron', prng(91)), true);
  const s0 = world(), s1 = world();
  const a = addExternalOrganism(s0, baseline, settings, 1200, 750, 0)!;
  const b = addExternalOrganism(s1, expanded, settings, 1200, 750, 0)!;
  sim.stepSimulation(s0, settings, 1 / 60);
  sim.stepSimulation(s1, settings, 1 / 60);
  assert.ok(Math.max(...a.neuralOutputs.map((v, i) => Math.abs(v - b.neuralOutputs[i]))) < 0.002,
    'the two tiny new weights must not create a large motor jump');
  assert.ok(b.neuralHidden.length === 25 && b.neuralHidden.every(Number.isFinite));
  assert.ok(Math.abs(totalAccountedEnergy(s1) - s1.ledger.externalInflow) < 1e-5);
});

test('neuron removal prefers low-influence node, keeps surviving weights and rejects removing final neuron', () => {
  const g = original(), saved = structuredClone(g);
  assert.equal(sim.mutateBrainTopology(g, 'add-neuron', prng()), true);
  const extra = g.hiddenIds![24];
  assert.equal(sim.mutateBrainTopology(g, 'remove-neuron', prng(2)), true);
  assert.equal(g.hiddenIds!.length, 24);
  assert.ok(!g.hiddenIds!.includes(extra));
  assert.deepEqual(g.hiddenIds, saved.hiddenIds);
  assert.deepEqual(g.weightsIH, saved.weightsIH);
  assert.deepEqual(g.weightsHH, saved.weightsHH);
  assert.deepEqual(g.weightsHO, saved.weightsHO);
  assert.deepEqual(validateGenome(g), g);
  const one = structuredClone(saved);
  one.hiddenIds = [saved.hiddenIds![0]]; sim.remapBrain(one, saved);
  assert.equal(sim.mutateBrainTopology(one, 'remove-neuron', prng()), false);
});

test('enabled connections can be disabled, permanently pruned, restored or reconnected', () => {
  const g = original();
  assert.equal(sim.mutateBrainTopology(g, 'add-neuron', prng(7)), true);
  const initial = sim.enabledBrainEdgeCount(g);
  assert.equal(sim.mutateBrainTopology(g, 'disable-connection', prng(8)), true);
  assert.equal(sim.enabledBrainEdgeCount(g), initial - 1);
  const disabledKey = g.disabledConnections!.at(-1)!;
  const dormantWeight = edgeWeight(g, disabledKey);
  assert.equal(sim.mutateBrainTopology(g, 'enable-connection', prng(9)), true);
  assert.equal(sim.enabledBrainEdgeCount(g), initial);
  // Directly re-enabling the saved dormant edge leaves its weight unchanged.
  if (g.disabledConnections!.includes(disabledKey)) assert.equal(edgeWeight(g, disabledKey), dormantWeight);
  const beforePrune = sim.enabledBrainEdgeCount(g);
  assert.equal(sim.mutateBrainTopology(g, 'prune-connection', prng(10)), true);
  assert.equal(sim.enabledBrainEdgeCount(g), beforePrune - 1);
  assert.equal(edgeWeight(g, g.disabledConnections!.at(-1)!), 0);
  const beforeReconnect = sim.enabledBrainEdgeCount(g), mask = [...g.disabledConnections!];
  assert.equal(sim.mutateBrainTopology(g, 'reconnect', prng(11)), true);
  assert.equal(sim.enabledBrainEdgeCount(g), beforeReconnect);
  assert.notDeepEqual(g.disabledConnections, mask);
  assert.deepEqual(validateGenome(g), g);
});

test('mutation severity zero clones every inherited allele without editing parents', () => {
  const parent = original();
  sim.mutateBrainTopology(parent, 'add-neuron', prng(5));
  sim.mutateBrainTopology(parent, 'prune-connection', prng(6));
  const before = structuredClone(parent);
  const child = sim.mutateGenome(parent, 0, prng(78));
  assert.deepEqual(parent, before);
  const compare = (g: sim.Genome) => {
    const c = structuredClone(g);
    c.id = before.id; c.parentIds = before.parentIds; c.generation = before.generation;
    return c;
  };
  assert.deepEqual(compare(child), before);
  assert.notEqual(child, parent);
  // The positive-severity mutation route also must never migrate or mutate its parent.
  const offspring = sim.mutateGenome(parent, 0.6, prng(81));
  assert.deepEqual(parent, before);
  assert.ok(offspring.hiddenIds!.length >= 1 && offspring.hiddenIds!.length <= sim.MAX_HIDDEN);
  assert.deepEqual(validateGenome(offspring), offspring);
});

test('positive-severity reproduction can inherit and actually change topology deterministically', () => {
  const parent = original(), saved = structuredClone(parent);
  let found: sim.Genome | undefined;
  let foundSeed = 0;
  for (let seed = 1; seed <= 120; seed++) {
    const offspring = sim.mutateGenome(parent, 1, prng(seed));
    if (offspring.hiddenIds!.length !== parent.hiddenIds!.length || offspring.disabledConnections!.length !== 0) {
      found = offspring; foundSeed = seed; break;
    }
  }
  assert.ok(found, 'a bounded deterministic seed sweep should exercise a structural change');
  assert.deepEqual(parent, saved);
  assert.deepEqual(validateGenome(found), found);
  const replay = sim.mutateGenome(parent, 1, prng(foundSeed));
  assert.deepEqual(replay, found);
});

test('topology survives save/load with exact continuation and compatible upkeep', () => {
  const base = original(), grown = structuredClone(base);
  sim.mutateBrainTopology(grown, 'add-neuron', prng(21));
  const s1 = world(), s2 = world();
  const old = addExternalOrganism(s1, base, settings, 1200, 750, 0)!;
  const grownOrg = addExternalOrganism(s2, grown, settings, 1200, 750, 0)!;
  sim.stepSimulation(s1, settings, 1 / 60);
  sim.stepSimulation(s2, settings, 1 / 60);
  const baseRate = sim.SENSORY_NEURAL_METABOLIC_RATE *
    (base.eyes.length * 5 + 24 + base.mouths.length * 2);
  assert.equal(old.sensoryEnergyRate, baseRate);
  assert.ok(Math.abs(grownOrg.sensoryEnergyRate! -
    (baseRate + sim.SENSORY_NEURAL_METABOLIC_RATE + 2 * sim.NEURAL_EDGE_METABOLIC_RATE)) < 1e-9);
  const saved = createSnapshot(s2, settings), restored = restoreSnapshot(saved);
  assert.deepEqual(createSnapshot(restored.state, restored.settings), saved);
  sim.stepSimulation(s2, settings, 1 / 60);
  sim.stepSimulation(restored.state, settings, 1 / 60);
  assert.deepEqual(createSnapshot(restored.state, settings), createSnapshot(s2, settings));
  assert.ok(Math.abs(totalAccountedEnergy(s2) - s2.ledger.externalInflow) < 1e-5);
  const disabled = structuredClone(grown);
  const enabledKey = sim.brainEdgeKey('ih', disabled.hiddenIds![0], disabled.inputKeys![0]);
  disabled.disabledConnections!.push(enabledKey);
  const s3 = world(), masked = addExternalOrganism(s3, disabled, settings, 1200, 750, 0)!;
  sim.stepSimulation(s3, settings, 1 / 60);
  assert.ok(Math.abs(masked.sensoryEnergyRate! - grownOrg.sensoryEnergyRate! + sim.NEURAL_EDGE_METABOLIC_RATE) < 1e-9);
});

test('node and connection bounds reject illegal operations without partial mutations', () => {
  const base = original(), g = structuredClone(base);
  g.hiddenIds = Array.from({length: sim.MAX_HIDDEN}, (_, i) => `stable:${i}`);
  sim.remapBrain(g, base);
  const before = structuredClone(g);
  assert.equal(sim.mutateBrainTopology(g, 'add-neuron', prng()), false);
  assert.deepEqual(g, before);
  const dense = original();
  assert.equal(sim.mutateBrainTopology(dense, 'enable-connection', prng()), false);
  assert.deepEqual(dense, original());
});
