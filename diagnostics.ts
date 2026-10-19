import {
  XoshiroPRNG, createReferenceNematodeGenome, createArchetypeGenome, spawnOrganism,
  stepSimulation, calculateOrganismCOM, getCardinalAnchor, getChildAnchorForParentDir,
  evaluateReproductionAffordability, type SimulationState, type Genome, type ArchetypeId,
} from './simulation';
import {DEFAULT_SETTINGS, totalAccountedEnergy, createSnapshot, restoreSnapshot} from './persistence';

export const emptyDiagnostics = {ran: false, comLocomotion: false, zeroDragConservation: false,
  eggEnergyAccounting: false, reproductionAffordability: false, raycastOcclusion: false,
  prngDeterminism: false, starvationLifespan: false, details: [] as string[]};

/** Every test owns its world and PRNG. Yield between chunks so the UI remains usable. */
export async function runProductionChecks() {
  const result = {...emptyDiagnostics, details: [] as string[]};
  const settings = {...DEFAULT_SETTINGS, worldWidth: 4800, worldHeight: 3000,
    targetNutrients: 0, inflowRate: 0, waterViscosity: .22, mutationSeverity: 0};
  const world = (genome?: Genome): SimulationState => {
    const prng = new XoshiroPRNG(9999);
    return {simTime: 0, organisms: genome ? [spawnOrganism(genome, 2400, 1500, 0, undefined, undefined, prng)] : [],
      eggs: [], nutrients: [], bubbles: [], caustics: [], ledger: {externalInflow: 0,
        metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
      nutrientAccumulator: 0, totalBirths: 0, totalDeaths: 0, prng, lineage: new Map(), recentDeaths: []};
  };
  const steps = async (s: SimulationState, count: number, viscosity = .22) => {
    for (let i = 0; i < count; i++) {
      stepSimulation(s, {...settings, waterViscosity: viscosity}, 1 / 60);
      if (i % 240 === 239) await new Promise(resolve => setTimeout(resolve, 0));
    }
  };
  const reference = () => {
    const g = createReferenceNematodeGenome(new XoshiroPRNG(9999));
    // Isolate physical propulsion with a controlled traveling wave, rather than
    // making a physics pass depend on an arbitrary random controller's steering.
    g.weightsHO.forEach(row => row.fill(0)); g.biasesO.fill(0);
    return g;
  };
  const active = world(reference()), stillGenome = reference(); stillGenome.motorForce = 0;
  const still = world(stillGenome), activeStart = calculateOrganismCOM(active.organisms[0]), stillStart = calculateOrganismCOM(still.organisms[0]);
  await steps(active, 900); await steps(still, 900);
  const activeEnd = calculateOrganismCOM(active.organisms[0]), stillEnd = calculateOrganismCOM(still.organisms[0]);
  const distance = Math.hypot(activeEnd.x - activeStart.x, activeEnd.y - activeStart.y);
  const drift = Math.hypot(stillEnd.x - stillStart.x, stillEnd.y - stillStart.y);
  let anchorError = 0;
  const o = active.organisms[0];
  o.genome.parts.slice(1).forEach((p, j) => {
    const parent = o.segments[p.parentIndex], child = o.segments[j + 1], pd = o.genome.parts[p.parentIndex];
    const pa = getCardinalAnchor(p.attachmentPoint, pd.width, pd.height), ca = getChildAnchorForParentDir(p.attachmentPoint, p.width, p.height);
    const x = parent.x + Math.cos(parent.angle) * pa.x - Math.sin(parent.angle) * pa.y - child.x - Math.cos(child.angle) * ca.x + Math.sin(child.angle) * ca.y;
    const y = parent.y + Math.sin(parent.angle) * pa.x + Math.cos(parent.angle) * pa.y - child.y - Math.sin(child.angle) * ca.x - Math.cos(child.angle) * ca.y;
    anchorError = Math.max(anchorError, Math.hypot(x, y));
  });
  result.comLocomotion = distance >= 126 && drift < 1e-4 && anchorError < .4;
  result.details.push(`Controlled CPG swimming, 15s (126px body): active COM ${distance.toFixed(2)}px; motors off ${drift.toFixed(6)}px; final anchor error ${anchorError.toFixed(4)}px. Pass: ${result.comLocomotion}`);

  const zero = world(reference()), zeroStart = calculateOrganismCOM(zero.organisms[0]);
  await steps(zero, 600, 0);
  const zeroEnd = calculateOrganismCOM(zero.organisms[0]);
  const zeroDrift = Math.hypot(zeroEnd.x - zeroStart.x, zeroEnd.y - zeroStart.y);
  result.zeroDragConservation = zeroDrift < 1e-4;
  result.details.push(`Zero drag, 10s: COM drift ${zeroDrift.toFixed(6)}px. Pass: ${result.zeroDragConservation}`);

  const eggWorld = world(), g = reference();
  eggWorld.eggs.push({id: 'test', clutchId: 'test', parentOrgId: 'test', x: 2400, y: 1500, vx: 0, vy: 0, genome: g,
    fundedStructural: g.bodyCost - 20, fundedReserve: 50, incubationProgress: 1, totalIncubationTime: 1,
    pulseTimer: 0, colorHue: 200, readyToHatch: false});
  const before = totalAccountedEnergy(eggWorld);
  await steps(eggWorld, 1);
  const baby = eggWorld.organisms[0], eggError = Math.abs(totalAccountedEnergy(eggWorld) - before);
  result.eggEnergyAccounting = !!baby && baby.energy <= 30 && baby.energy >= 0 && baby.structuralBiomass === g.bodyCost && eggError < 1e-6;
  result.details.push(`Damaged egg → hatchling: reserve ${baby?.energy.toFixed(2)}J, energy error ${eggError.toExponential(2)}J. Pass: ${result.eggEnergyAccounting}`);

  const repro = world(reference()), adult = repro.organisms[0];
  adult.genome.motorForce = 0; adult.genome.targetClutchSize = 1; adult.age = 30; repro.simTime = 30;
  const budget = evaluateReproductionAffordability(adult, repro.simTime, 1, 0, 100);
  adult.energy = budget.requiredForOneEgg + 100;
  const reproBefore = totalAccountedEnergy(repro);
  await steps(repro, 1);
  const funded = repro.eggs.length === 1 && Math.abs(totalAccountedEnergy(repro) - reproBefore) < 1e-6;
  await steps(repro, 1);
  const juvenile = world(reference()).organisms[0]; juvenile.energy = 90000;
  result.reproductionAffordability = funded && repro.eggs.length === 1 && !evaluateReproductionAffordability(juvenile, 30, 1, 0).eligible;
  result.details.push(`Reproduction: funded egg ${funded}; cooldown and juvenile gate checked. Pass: ${result.reproductionAffordability}`);

  const opticGenome = reference(); opticGenome.motorForce = 0;
  const optic = world(opticGenome), eye = opticGenome.eyes[0];
  const anchor = getCardinalAnchor(eye.direction, opticGenome.parts[eye.partIndex].width, opticGenome.parts[eye.partIndex].height);
  for (const offset of [100, 200]) optic.nutrients.push({id: `food${offset}`, x: 2400 + anchor.x + offset, y: 1500 + anchor.y,
    vx: 0, vy: 0, energyValue: 3000, radius: 8, bottomTimer: 0});
  await steps(optic, 1);
  const center = optic.organisms[0].rayHits.find(r => r.eyeId === eye.id && r.rayIndex === 2);
  result.raycastOcclusion = center?.objectType === 'nutrient' && Math.abs(center.dist - 92) < 1e-4;
  result.details.push(`Production eye ray: nearest food surface ${center?.dist.toFixed(2)}px (expected 92). Pass: ${result.raycastOcclusion}`);

  const a = new XoshiroPRNG(4242), b = a.clone();
  let equal = true; for (let i = 0; i < 1000; i++) equal &&= a.nextUint32() === b.nextUint32();
  const continuation = world(reference()); await steps(continuation, 17);
  const copy = restoreSnapshot(createSnapshot(continuation, {...settings, worldWidth: 4800, worldHeight: 3000}));
  // Keep identical settings for both continuations; their bodies are away from walls.
  await steps(continuation, 10); await steps(copy.state, 10);
  result.prngDeterminism = equal && JSON.stringify(createSnapshot(continuation, settings).state) === JSON.stringify(createSnapshot(copy.state, settings).state);
  result.details.push(`1000 PRNG draws and exact snapshot continuation. Pass: ${result.prngDeterminism}`);

  const lifespan: string[] = [];
  let valid = true;
  for (const arch of ['eel', 'flapper', 'tadpole', 'glider', 'predator', 'nematode'] as ArchetypeId[]) {
    const s = world(createArchetypeGenome(arch, 1, [], new XoshiroPRNG(1234))), org = s.organisms[0];
    while (!org.dissolving && s.simTime < 600) await steps(s, 120);
    valid &&= org.age >= 60 && org.dissolving && Number.isFinite(org.energy) && org.energy >= 0
      && (org.deathCause === 'Old Age' ? org.age >= org.maxLifespan : org.deathCause === 'Starvation' && org.energy === 0);
    lifespan.push(`${arch} ${org.age.toFixed(1)}s (${org.deathCause ?? 'no death'})`);
  }
  result.starvationLifespan = valid;
  result.details.push(`Isolated unfed survival at 1/60s: ${lifespan.join('; ')}. Pass: ${valid}`);
  result.ran = true;
  return result;
}
