import {
  XoshiroPRNG, migrateOrganismBrain, ensureBrainLayout, calculateBodyCost,
  calculateMaxEnergyCapacity, clampVal, getPartCornerVertices,
  getBrainLayout, getDietClassification, CARRION_DECAY_SECONDS, type Genome, type SimulationSettings, type SimulationState, type Organism,
} from './simulation';

export const BUILD_VERSION = '0.2.1';
export const DEFAULT_SETTINGS: SimulationSettings = {
  worldWidth: 2400, worldHeight: 1500, waterViscosity: .18,
  targetNutrients: 800, inflowRate: 15, kinshipProtection: true,
  mutationSeverity: .25, gravity: 0, maxOrganisms: 100,
};
export const CREDITS = 'By Hernán Garro & Federico Regueira';

export function totalAccountedEnergy(s: SimulationState): number {
  return s.organisms.reduce((sum, o) => sum + o.energy + o.structuralBiomass, 0)
    + s.eggs.reduce((sum, e) => sum + e.fundedReserve + e.fundedStructural, 0)
    + s.nutrients.reduce((sum, n) => sum + n.energyValue, 0)
    + s.ledger.metabolicDissipation + s.ledger.mechanicalWorkHeat + s.ledger.recordedLosses;
}

export function clearFreeNutrients(s: SimulationState): number {
  const removed = s.nutrients.filter(n => n.kind !== 'carrion').reduce((sum, n) => sum + n.energyValue, 0);
  s.ledger.recordedLosses += removed;
  s.nutrients = s.nutrients.filter(n => n.kind === 'carrion');
  s.nutrientAccumulator = 0;
  return removed;
}

/** Translate each articulated body as one unit; never clamp its parts separately. */
export function resizeWorld(s: SimulationState, old: SimulationSettings, width: number, height: number): void {
  const dx = (width - old.worldWidth) / 2, dy = (height - old.worldHeight) / 2;
  for (const org of s.organisms) {
    const corners = org.segments.flatMap((p, i) => getPartCornerVertices(p, org.genome.parts[i]));
    const left = Math.min(...corners.map(p => p.x)) + dx;
    const right = Math.max(...corners.map(p => p.x)) + dx;
    const top = Math.min(...corners.map(p => p.y)) + dy;
    const bottom = Math.max(...corners.map(p => p.y)) + dy;
    const tx = dx + (left < 5 ? 5 - left : right > width - 5 ? width - 5 - right : 0);
    const ty = dy + (top < 5 ? 5 - top : bottom > height - 5 ? height - 5 - bottom : 0);
    for (const p of org.segments) { p.x += tx; p.y += ty; }
    for (const p of org.traceHistory ?? []) { p.x += tx; p.y += ty; }
  }
  for (const p of [...s.eggs, ...s.nutrients]) {
    p.x = clampVal(p.x + dx, 35, width - 35);
    p.y = clampVal(p.y + dy, 35, height - 35);
  }
  for (const p of [...s.caustics, ...s.bubbles]) {
    p.x = clampVal(p.x + dx, 0, width);
    p.y = clampVal(p.y + dy, 0, height);
  }
}

export function createSnapshot(s: SimulationState, settings: SimulationSettings, metadata: Record<string, unknown> = {}) {
  const {prng, lineage, ...data} = s;
  const snapshot = {schemaVersion: '5.0.0', build: BUILD_VERSION, metadata, settings,
    state: {...data, prngState: prng.getState(), lineage: [...lineage]}};
  // Canonical JSON representation also drops optional undefined fields in memory.
  return JSON.parse(JSON.stringify(snapshot)) as typeof snapshot;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid snapshot: ${message}`);
}
function finiteTree(value: unknown, depth = 0): void {
  assert(depth < 40, 'excessive nesting');
  if (typeof value === 'number') assert(Number.isFinite(value), 'non-finite number');
  if (value && typeof value === 'object') for (const v of Object.values(value)) finiteTree(v, depth + 1);
}

export function validateGenome(raw: unknown): Genome {
  assert(raw && typeof raw === 'object', 'genome');
  const g = structuredClone(raw) as Genome;
  finiteTree(g);
  assert(typeof g.id === 'string', 'genome ID');
  assert(Array.isArray(g.parts) && g.parts.length >= 1 && g.parts.length <= 7, 'body part count');
  assert(Array.isArray(g.eyes) && g.eyes.length <= 5 && Array.isArray(g.mouths) && g.mouths.length <= 3, 'organ count');
  const dirs = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
  const ids = new Set<string>();
  for (const [i, p] of g.parts.entries()) {
    assert(p && typeof p.id === 'string' && !ids.has(p.id), 'part ID'); ids.add(p.id);
    assert(Number.isInteger(p.parentIndex) && (i === 0 ? p.parentIndex === -1 : p.parentIndex >= 0 && p.parentIndex < i), 'body tree');
    assert([p.dimN, p.dimM].every(n => Number.isInteger(n) && n >= 1 && n <= 10), 'part dimensions');
    assert(p.width === p.dimN * 7 && p.height === p.dimM * 7 && dirs.includes(p.attachmentPoint), 'part geometry');
    assert(Number.isFinite(p.maxAngle) && Number.isFinite(p.baseAngleOffset) && Number.isFinite(p.cpgPhaseOffset)
      && Number.isFinite(p.cpgAmp) && Number.isFinite(p.cpgFreqMult), 'joint parameters');
  }
  for (const organ of [...g.eyes, ...g.mouths]) {
    assert(typeof organ.id === 'string' && Number.isInteger(organ.partIndex) && organ.partIndex >= 0 && organ.partIndex < g.parts.length
      && dirs.includes(organ.direction), 'organ placement');
  }
  assert(g.eyes.every(e => e.fov > 0 && e.fov <= Math.PI * 2 && e.range > 0 && e.range <= 5000), 'eye parameters');
  assert(g.mouths.every(m => ['herbivore', 'omnivore', 'carnivore'].includes(m.mouthType) && m.intakeWidth > 0), 'mouth parameters');
  for (const matrix of [g.weightsIH, g.weightsHH, g.weightsHO]) {
    assert(Array.isArray(matrix) && matrix.length <= 24 && matrix.every(row => Array.isArray(row) && row.length <= 128 && row.every(Number.isFinite)), 'neural weights');
  }
  assert(g.weightsIH.length === 24 && g.weightsHH.length === 24 && g.weightsHH.every(row => row.length === 24), 'hidden layer');
  assert(Array.isArray(g.biasesH) && g.biasesH.length === 24 && g.biasesH.every(Number.isFinite)
    && Array.isArray(g.biasesO) && g.biasesO.length <= 24 && g.biasesO.every(Number.isFinite), 'neural biases');
  assert([g.motorForce, g.motorFrequency, g.maturityAge, g.incubationTime, g.maxLifespan, g.metabolicEfficiency,
    g.eggReserveFraction, g.reproductionThreshold, g.reproductionCooldown, g.hue, g.saturation, g.lightness].every(Number.isFinite), 'life-history parameters');
  assert(g.motorForce >= 0 && g.motorForce <= 100 && g.motorFrequency >= 0 && g.motorFrequency <= 20
    && g.maturityAge >= 0 && g.maxLifespan > 0 && g.incubationTime > 0 && g.metabolicEfficiency > 0
    && Number.isInteger(g.targetClutchSize) && g.targetClutchSize >= 1 && g.targetClutchSize <= 8, 'trait bounds');
  assert(g.colorMutationRate === undefined || (Number.isFinite(g.colorMutationRate) && g.colorMutationRate >= 0 && g.colorMutationRate <= 1), 'pigment variability');
  assert(Array.isArray(g.parentIds) && g.parentIds.every(id => typeof id === 'string'), 'parent IDs');
  g.bodyCost = calculateBodyCost(g.parts, g.eyes, g.mouths);
  g.maxEnergyCapacity = calculateMaxEnergyCapacity(g.parts, g.storageTraitMultiplier ?? 1);
  ensureBrainLayout(g);
  const layout = getBrainLayout(g);
  assert(JSON.stringify(g.inputKeys) === JSON.stringify(layout.inputs) && JSON.stringify(g.outputKeys) === JSON.stringify(layout.outputs), 'neural channel identities');
  assert(g.weightsIH.every(row => row.length === layout.inputs.length) && g.weightsHO.length === layout.outputs.length
    && g.weightsHO.every(row => row.length === 24) && g.biasesO.length === layout.outputs.length, 'neural dimensions');
  return g;
}

export function restoreSnapshot(input: unknown): {state: SimulationState; settings: SimulationSettings; metadata: Record<string, unknown>} {
  const raw = typeof input === 'string' ? (() => {
    assert(input.length <= 25_000_000, 'file exceeds 25 MB'); return JSON.parse(input);
  })() : structuredClone(input);
  assert(raw && typeof raw === 'object', 'document');
  assert(['5.0.0', '4.0.0', '3.0.0'].includes(raw.schemaVersion), 'unsupported schema');
  const legacy = raw.schemaVersion === '3.0.0';
  const data = legacy ? raw : raw.state;
  assert(data && typeof data === 'object', 'state');
  finiteTree(data);
  const settings: SimulationSettings = {...DEFAULT_SETTINGS, ...raw.settings};
  for (const [key, min, max] of [['worldWidth', 800, 4800], ['worldHeight', 600, 3000], ['waterViscosity', 0, .8],
    ['targetNutrients', 0, 800], ['inflowRate', 0, 150], ['gravity', -200, 200], ['maxOrganisms', 1, 150], ['mutationSeverity', 0, 1]] as const) {
    assert(typeof settings[key] === 'number' && Number.isFinite(settings[key]) && settings[key]! >= min && settings[key]! <= max, `setting ${key}`);
  }
  assert(Number.isInteger(settings.targetNutrients) && Number.isInteger(settings.maxOrganisms), 'integer settings');
  assert(typeof settings.kinshipProtection === 'boolean', 'kinship setting');
  for (const [key, limit] of [['organisms', 500], ['eggs', 300], ['nutrients', 2200], ['lineage', 20000]] as const) {
    assert(Array.isArray(data[key]) && data[key].length <= limit, key);
  }
  assert(Array.isArray(data.prngState) && data.prngState.length === 4 && data.prngState.every((n: unknown) => Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 0xffffffff)
    && data.prngState.some((n: number) => n !== 0), 'PRNG state');
  const prng = new XoshiroPRNG(); prng.setState(data.prngState);
  const organisms: Organism[] = data.organisms.map((o: Organism) => {
    if (legacy) migrateOrganismBrain(o);
    o.genome = validateGenome(o.genome);
    assert(typeof o.id === 'string' && Array.isArray(o.segments) && o.segments.length === o.genome.parts.length
      && Array.isArray(o.joints) && o.joints.length === o.segments.length - 1, 'organism articulation');
    assert(o.segments.every(p => [p.x, p.y, p.vx, p.vy, p.angle, p.angVel].every(Number.isFinite)), 'physical state');
    assert(o.joints.every(j => [j.phase, j.targetAngle, j.currentRelAngle, j.currentRelAngVel, j.appliedTorque, j.stiffness].every(Number.isFinite)), 'joint state');
    assert(o.energy >= 0 && Number.isFinite(o.energy) && o.structuralBiomass >= 0 && Number.isFinite(o.structuralBiomass)
      && Number.isFinite(o.age) && Number.isFinite(o.maxLifespan) && typeof o.dissolving === 'boolean', 'organism state');
    assert(Array.isArray(o.neuralInputs) && o.neuralInputs.length <= 128 && o.neuralInputs.every(Number.isFinite)
      && Array.isArray(o.neuralHidden) && o.neuralHidden.length === 24 && o.neuralHidden.every(Number.isFinite)
      && Array.isArray(o.neuralOutputs) && o.neuralOutputs.length <= 24 && o.neuralOutputs.every(Number.isFinite), 'activations');
    // Preserve exact activations for current saves; migrate only legacy buffers.
    assert(o.neuralInputs.length === o.genome.inputKeys!.length, 'input buffer size');
    return o;
  });
  assert(new Set(organisms.map(o => o.id)).size === organisms.length, 'duplicate organism IDs');
  for (const egg of data.eggs) {
    egg.genome = validateGenome(egg.genome);
    assert([egg.x, egg.y, egg.vx, egg.vy, egg.fundedReserve, egg.fundedStructural, egg.incubationProgress, egg.totalIncubationTime].every(Number.isFinite)
      && egg.fundedReserve >= 0 && egg.fundedStructural >= 0 && egg.totalIncubationTime > 0, 'egg state');
  }
  for (const n of data.nutrients) {
    assert([n.x, n.y, n.vx, n.vy, n.energyValue, n.radius].every(Number.isFinite) && n.energyValue >= 0 && n.radius > 0, 'nutrient state');
    assert(n.kind === undefined || n.kind === 'nutrient' || n.kind === 'carrion', 'food type');
    assert(n.decayTimeRemaining === undefined || (Number.isFinite(n.decayTimeRemaining) && n.decayTimeRemaining >= 0 && n.decayTimeRemaining <= CARRION_DECAY_SECONDS), 'food decay timer');
    assert(n.kind !== 'carrion' || n.decayTimeRemaining !== undefined, 'carrion decay timer');
  }
  const ledger = data.ledger;
  assert(ledger && ['externalInflow', 'metabolicDissipation', 'mechanicalWorkHeat', 'recordedLosses'].every(k => Number.isFinite(ledger[k]) && ledger[k] >= 0), 'energy ledger');
  assert(Number.isFinite(data.simTime) && data.simTime >= 0, 'simulation time');
  if (!legacy) {
    assert(Number.isFinite(data.nutrientAccumulator) && data.nutrientAccumulator >= 0, 'fractional inflow');
    assert([data.totalBirths, data.totalDeaths].every(n => Number.isInteger(n) && n >= 0), 'counters');
    assert(Array.isArray(data.recentDeaths) && data.recentDeaths.length <= 2000, 'death history');
  }
  assert((data.bubbles ?? []).length <= 1000 && (data.caustics ?? []).length <= 1000, 'effects count');
  const state: SimulationState = {
    ...data, organisms, prng, lineage: new Map(data.lineage), ledger,
    bubbles: data.bubbles ?? [], caustics: data.caustics ?? [],
    nutrientAccumulator: data.nutrientAccumulator ?? 0,
    totalBirths: data.totalBirths ?? organisms.length, totalDeaths: data.totalDeaths ?? 0,
    recentDeaths: data.recentDeaths ?? [],
  };
  delete (state as unknown as Record<string, unknown>).prngState;
  for (const rec of state.lineage.values()) rec.genome = validateGenome(rec.genome);
  return {state, settings, metadata: raw.metadata ?? {legacyImport: true}};
}

export function diagnosticReport(s: SimulationState, settings: SimulationSettings, selectedId?: string | null, metadata = {}) {
  const living = s.organisms.filter(o => !o.dissolving);
  const selected = living.find(o => o.id === selectedId);
  return {build: BUILD_VERSION, ...metadata, simTime: s.simTime, prngState: s.prng.getState(), settings,
    population: {living: living.length, decomposing: s.organisms.length - living.length, eggs: s.eggs.length,
      nutrients: s.nutrients.filter(n => n.kind !== 'carrion').length,
      carrion: s.nutrients.filter(n => n.kind === 'carrion').length, births: s.totalBirths, deaths: s.totalDeaths,
      families: [...new Set(living.map(o => o.genome.archetype))],
      diets: living.reduce<Record<string, number>>((counts, o) => {
        const diet = getDietClassification(o.genome.mouths).category;
        counts[diet] = (counts[diet] ?? 0) + 1; return counts;
      }, {})},
    energy: {...s.ledger, accounted: totalAccountedEnergy(s), errorJ: totalAccountedEnergy(s) - s.ledger.externalInflow},
    recentDeaths: s.recentDeaths,
    selected: selected ? {id: selected.id, name: selected.genome.name, generation: selected.genome.generation,
      age: selected.age, lifespan: selected.maxLifespan, energy: selected.energy, capacity: selected.genome.maxEnergyCapacity,
      bodyParts: selected.genome.parts.length, eyes: selected.genome.eyes.length, neuralInputs: selected.neuralInputs.length,
      speed: selected.speed, clutches: selected.clutchesLaid, offspring: selected.offspringCount,
      expenditureJPerSecond: {basal: selected.basalEnergyRate, sensory: selected.sensoryEnergyRate, motor: selected.motorEnergyRate},
      feedings: selected.recentFeedings} : null};
}
