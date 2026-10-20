import * as sim from '../simulation';
import {FOUNDER_BLUEPRINTS, createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, BUILD_VERSION, totalAccountedEnergy} from '../persistence';

// Isolated, nonreproductive evaluations. Controllers receive only kernel sensors.
const settings = {...DEFAULT_SETTINGS, worldWidth: 12000, worldHeight: 12000,
  targetNutrients: 0, inflowRate: 0, mutationSeverity: 0};
const seconds = 30;
function world(g: sim.Genome, seed = 7, heading = 0) {
  const s = createInitialWorld(settings, seed, 'unbiased', 'standard', 0);
  s.caustics = [];
  const org = addExternalOrganism(s, g, settings, 6000, 6000, heading)!;
  org.genome.maturityAge = 1000;
  return {s, org};
}
function run(s: sim.SimulationState, duration: number) {
  for (let i = 0; i < duration * 60; i++) sim.stepSimulation(s, settings, 1 / 60);
  if (Math.abs(totalAccountedEnergy(s) - s.ledger.externalInflow) > .001) throw new Error('Energy discrepancy');
}
function reference() {
  const g = sim.createReferenceNematodeGenome(new sim.XoshiroPRNG(7));
  sim.ensureBrainLayout(g); g.weightsHO.forEach(row => row.fill(0)); g.biasesO.fill(0);
  return g;
}
function command(g: sim.Genome, name: string, value: number) {
  g.outputKeys!.forEach((key, i) => { if (key.endsWith(`:${name}`)) g.biasesO[i] = Math.atanh(value); });
}
function blind(g: sim.Genome) {
  // Hold retinal input at empty-water baseline, preserving its original bias.
  g.inputKeys!.forEach((key, i) => {
    if (!key.startsWith('eye:')) return;
    const channel = key.split(':').at(-1);
    const baseline = channel === 'distance' ? 1 : sim.WATER_AMBIENT_RGB[['red', 'green', 'blue'].indexOf(channel!)];
    g.weightsIH.forEach((row, h) => { g.biasesH[h] += row[i] * baseline; row[i] = 0; });
  });
}

console.log(JSON.stringify({protocol: 'isolated-controls-and-paired-vision-v1', build: BUILD_VERSION,
  dt: 1 / 60, viscosity: settings.waterViscosity, longitudinalDrag: sim.LONGITUDINAL_DRAG,
  foragingSeconds: seconds, founderBrainsTrained: false, reproductionEnabled: false}));

if (!process.argv.includes('--foraging-only')) {
  for (const [name, amplitude, engagement, angle, drive] of [
    ['active', 0, 0, 0, 0], ['rest', 0, -.9, 0, 0], ['gentle', -.4, 0, 0, 0],
    ['strong-stroke', .5, 0, 0, 0], ['burst', 0, 0, 0, .8],
    ['turn-left', 0, 0, -.6, 0], ['turn-right', 0, 0, .6, 0],
  ] as const) {
    const g = reference(); command(g, 'Amp', amplitude); command(g, 'Engage', engagement); command(g, 'Angle', angle); command(g, 'Drive', drive);
    const {s, org} = world(g), start = sim.calculateOrganismCOM(org);
    run(s, 10); const end = sim.calculateOrganismCOM(org);
    console.log(JSON.stringify({type: 'control', name, dx: end.x - start.x, dy: end.y - start.y,
      distance: Math.hypot(end.x - start.x, end.y - start.y), motorHeatJ: s.ledger.mechanicalWorkHeat,
      basalAndSensoryHeatJ: s.ledger.metabolicDissipation, finalSpeed: org.speed,
      amplitudes: org.joints.map(j => j.amplitude), engagements: org.joints.map(j => j.engagement)}));
  }
  const movements = FOUNDER_BLUEPRINTS.map(f => {
    const {s, org} = world(createFounderGenome(f.id)), start = sim.calculateOrganismCOM(org);
    run(s, 15); const end = sim.calculateOrganismCOM(org);
    return {id: f.id, distance: Math.hypot(end.x - start.x, end.y - start.y), energy: org.energy,
      finite: org.segments.every(p => Object.values(p).every(Number.isFinite))};
  });
  console.log(JSON.stringify({type: 'catalogue', movements}));
}

const trials: Array<{founder: string; seed: number; vision: boolean; intakeJ: number; motorHeatJ: number}> = [];
for (const founder of ['FND-001', 'FND-031']) for (const seed of [71, 81, 91, 101, 111, 121, 131, 141]) {
  for (const vision of [true, false]) {
    const g = createFounderGenome(founder); if (!vision) blind(g);
    const rng = new sim.XoshiroPRNG(seed), {s, org} = world(g, seed, rng.range(-Math.PI, Math.PI));
    for (let i = 0; i < 40; i++) {
      s.nutrients.push({id: `food-${i}`, x: 6000 + rng.range(-500, 500), y: 6000 + rng.range(-500, 500),
        vx: 0, vy: 0, energyValue: 3000, radius: sim.getNutrientRadius(3000), bottomTimer: 0, pulseTimer: 0});
      s.ledger.externalInflow += 3000;
    }
    const initial = org.energy; run(s, seconds);
    trials.push({founder, seed, vision, intakeJ: org.energy - initial + s.ledger.metabolicDissipation + s.ledger.mechanicalWorkHeat,
      motorHeatJ: s.ledger.mechanicalWorkHeat});
  }
}
const mean = (vision: boolean) => trials.filter(t => t.vision === vision).reduce((sum, t) => sum + t.intakeJ, 0) / (trials.length / 2);
console.log(JSON.stringify({type: 'foraging', scenarios: trials.length / 2, visionMeanIntakeJ: mean(true),
  blindMeanIntakeJ: mean(false), trials,
  interpretation: 'Paired seeded baseline measurement, not proof of learned or reliable food seeking.'}));
