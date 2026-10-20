import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {createSnapshot, restoreSnapshot, validateGenome, totalAccountedEnergy, DEFAULT_SETTINGS} from '../persistence';

const settings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, mutationSeverity: 0, kinshipProtection: false};
const dt = 1 / 60;
const wrap = (n: number) => Math.atan2(Math.sin(n), Math.cos(n));

function createHunter(seed: number) {
  const g = createFounderGenome('FND-001', 'unbiased');
  g.maturityAge = 1000;
  g.mouths[0].mouthType = 'carnivore';
  g.mouths[0].intakeWidth = 30;
  g.bodyCost = sim.calculateBodyCost(g.parts, g.eyes, g.mouths);
  const parent = structuredClone(g);
  assert.ok(sim.mutateBrainTopology(g, 'wire-retinal-turn', new sim.XoshiroPRNG(seed)));
  assert.deepEqual(validateGenome(g), g);
  const node = g.hiddenIds!.at(-1)!;
  const h = g.hiddenIds!.length - 1;
  const inputs = g.inputKeys!.filter((k, i) => Math.abs(g.weightsIH[h][i]) > 1e-12);
  assert.equal(inputs.length, 4, 'lateral five-ray receptive field leaves its central ray silent');
  assert.ok(inputs.every(k => k.startsWith('eye:') && !k.endsWith(':distance')));
  assert.ok(g.outputKeys!.some((k, i) => k.endsWith(':Angle') && g.weightsHO[i][h] !== 0));
  assert.equal(g.disabledConnections!.filter(k => k.includes(node) && k.startsWith('["hh"')).length,
    2 * parent.hiddenIds!.length + 1, 'new receptive field does not spontaneously recur');
  return {g, parent, node, h};
}

function blind(g: sim.Genome, node: string) {
  const h = g.hiddenIds!.indexOf(node);
  assert.ok(h >= 0);
  for (let i = 0; i < g.inputKeys!.length; i++) {
    if (g.inputKeys![i].startsWith('eye:')) {
      g.weightsIH[h][i] = 0;
      const key = sim.brainEdgeKey('ih', node, g.inputKeys![i]);
      if (!g.disabledConnections!.includes(key)) g.disabledConnections!.push(key);
    }
  }
  assert.deepEqual(validateGenome(g), g);
}

type Result = ReturnType<typeof run>;
function run(seed: number, side: -1 | 1, coupled = true, preyMoving = true, steps = 240) {
  const {g, node} = createHunter(seed);
  if (!coupled) blind(g, node);
  const state = createInitialWorld(settings, 972, 'unbiased', 'standard', 0);
  const hunter = addExternalOrganism(state, g, settings, 1100, 730, 0)!;
  // Target placement is only in the experiment; the predator never receives
  // the target coordinates, its diet, identity or velocity as neural inputs.
  const preyG = createFounderGenome('FND-001', 'unbiased');
  preyG.hue = 0; preyG.saturation = 0; preyG.lightness = 90;
  preyG.maturityAge = 1000;
  if (preyMoving) {
    preyG.motorFrequency *= .75;
  } else {
    preyG.motorForce = 0;
  }
  const x = 1100 + 145 * Math.cos(.5), y = 730 + side * 145 * Math.sin(.5);
  const prey = addExternalOrganism(state, preyG, settings, x, y, side * .15)!;
  const startH = sim.calculateOrganismCOM(hunter), startP = sim.calculateOrganismCOM(prey);
  const startGap = Math.hypot(startH.x - startP.x, startH.y - startP.y);
  const initialEnergy = totalAccountedEnergy(state);
  let seen = 0, firstSignal = 0, peakMotor = 0, closest = Infinity, biteJ = 0;
  let firstHeading = 0, turn=0, signalAmplitude = 0;
  for (let tick = 0; tick < steps; tick++) {
    sim.stepSimulation(state, settings, dt);
    if (tick === 0) {
      seen = hunter.rayHits.filter(h => h.hit && h.objectType === 'creature').length;
      firstHeading = hunter.segments[0].angle;
      const h = hunter.genome.hiddenIds!.indexOf(node);
      firstSignal = hunter.neuralHidden[h];
      const angleOutput = hunter.genome.outputKeys!.findIndex(k => k.endsWith(':Angle'));
      peakMotor = hunter.neuralOutputs[angleOutput];
    }
    const a = sim.calculateOrganismCOM(hunter), b = sim.calculateOrganismCOM(prey);
    closest = Math.min(closest, Math.hypot(a.x-b.x, a.y-b.y));
    const h = hunter.genome.hiddenIds!.indexOf(node);
    signalAmplitude = Math.max(signalAmplitude, Math.abs(hunter.neuralHidden[h]));
    biteJ += Math.max(0, prey.biteFeedbackJ ?? 0);
    turn = wrap(hunter.segments[0].angle);
  }
  const endH = sim.calculateOrganismCOM(hunter), endP = sim.calculateOrganismCOM(prey);
  const endingGap = Math.hypot(endH.x - endP.x, endH.y - endP.y);
  assert.ok(Math.abs(totalAccountedEnergy(state) - initialEnergy) < 1e-4, 'no extra prey or motor energy');
  return {seed, side, coupled, seen, firstSignal, peakMotor, signalAmplitude, firstHeading, turn,
    hunterTravel: Math.hypot(endH.x-startH.x, endH.y-startH.y),
    preyTravel: Math.hypot(endP.x-startP.x,endP.y-startP.y),
    startGap, closest, endingGap, biteJ};
}

test('new inherited retinal turn innovation is isolated, color-sensitive, stochastically signed, and saved exactly', () => {
  let signs = new Set<number>(), channels = new Set<string>();
  for (let seed = 1; seed <= 20; seed++) {
    const {g, parent, h, node} = createHunter(seed);
    const retinal = g.inputKeys!.map((key, i) => ({key, weight: g.weightsIH[h][i]})).filter(x => x.weight !== 0);
    signs.add(Math.sign(retinal[0].weight * g.weightsHO[g.outputKeys!.findIndex(x=>x.endsWith(':Angle'))][h]));
    channels.add(retinal[0].key.split(':').at(-1)!);
    assert.deepEqual(parent.eyes, g.eyes);
    assert.deepEqual(parent.parts, g.parts);
    const inherited = sim.mutateGenome(g, 0, new sim.XoshiroPRNG(1));
    assert.deepEqual(inherited.weightsIH, g.weightsIH);
    assert.deepEqual(inherited.weightsHO, g.weightsHO);
    assert.deepEqual(inherited.disabledConnections, g.disabledConnections);
    const state = createInitialWorld(settings, 911, 'unbiased', 'standard', 0);
    addExternalOrganism(state, g, settings, 1000, 700, 0);
    const snap = createSnapshot(state, settings);
    const resumed = restoreSnapshot(snap);
    assert.deepEqual(createSnapshot(resumed.state, settings), snap);
    sim.stepSimulation(state, settings, dt);
    sim.stepSimulation(resumed.state, settings, dt);
    assert.deepEqual(createSnapshot(state, settings), createSnapshot(resumed.state, settings));
    assert.equal(g.hiddenIds!.at(-1), node);
  }
  assert.deepEqual([...signs].sort(), [-1, 1]);
  assert.deepEqual([...channels].sort(), ['blue', 'green', 'red']);
});

test('controlled moving prey produces physical pursuit observations against a disconnected retinal innovation', () => {
  const results = [];
  for (const seed of [1,2,3,4,5,6,7,8,9,10,11,12]) {
    const sighted = run(seed, 1, true);
    const disconnected = run(seed, 1, false);
    assert.ok(sighted.preyTravel > 5 && disconnected.preyTravel > 5, 'moving prey must propel itself');
    assert.ok(sighted.hunterTravel > 10 && disconnected.hunterTravel > 10, 'hunter must propel itself');
    assert.ok(sighted.seen > 0 && disconnected.seen > 0, 'visible physical initial stimulus required');
    assert.equal(disconnected.signalAmplitude, 0, 'an unwired novel neuron never knows about prey');
    results.push({seed, preyTravel:sighted.preyTravel, hunterTravel:sighted.hunterTravel,
      signal:sighted.signalAmplitude, visible:sighted.seen,
      trackedClosest:sighted.closest, blindClosest:disconnected.closest,
      trackedEnd:sighted.endingGap, blindEnd:disconnected.endingGap,
      trackedTurn:sighted.turn, blindTurn:disconnected.turn,
      biteJ:sighted.biteJ, blindBiteJ:disconnected.biteJ});
  }
  console.log('VIDA_BC_MOVING_VISUAL_HUNTER ' + JSON.stringify(results));
});
