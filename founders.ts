import rawFounders from './data/founders.json';
import {
  XoshiroPRNG, createXavierRecurrentNetwork, calculateBodyCost,
  calculateMaxEnergyCapacity, getBrainLayout, getCardinalBaseAngle,
  RAYS_PER_EYE, OUTPUTS_PER_JOINT, remapBrain, WATER_AMBIENT_RGB,
  type Genome, type PartDef, type SensoryEye, type SensoryMouth,
  type SpecimenBankItem, type MouthType,
} from './simulation';

export type FounderMode = 'balanced' | 'unbiased';
interface FounderBlueprint {
  id: string; name: string; family: string; diet: MouthType; seed: number;
  morphology: {parts: PartDef[]; eyes: SensoryEye[]; mouths: SensoryMouth[];
    hue: number; saturation: number; lightness: number};
  locomotion: {motorFrequency: number; motorForce: number};
  lifeHistory: {targetClutchSize: number; maturityAge: number; incubationTime: number;
    reproductionCooldown: number; maxLifespan: number; metabolicEfficiency: number;
    storageTraitMultiplier: number};
}

/** Validated geometry and calibrated gaits from the original 50-founder catalogue. */
export const FOUNDER_BLUEPRINTS = rawFounders as FounderBlueprint[];
export const FOUNDER_FAMILIES = [...new Set(FOUNDER_BLUEPRINTS.map(f => f.family))];

export function createFounderGenome(id: string, mode: FounderMode = 'balanced'): Genome {
  const blueprint = FOUNDER_BLUEPRINTS.find(f => f.id === id);
  if (!blueprint) throw new Error(`Unknown founder ${id}`);
  const d = structuredClone(blueprint);
  const {parts, eyes, mouths, hue, saturation, lightness} = d.morphology;
  const layout = getBrainLayout({parts, eyes});
  // Preserve the brain used when these gaits were calibrated, then expand it by ID.
  const localPrng = new XoshiroPRNG(d.seed);
  const brain = createXavierRecurrentNetwork(localPrng);
  brain.weightsHO = brain.weightsHO.map(row => row.map(w => w * .1));
  brain.biasesO = brain.biasesO.map(b => b * .1);
  const g: Genome = {
    id: d.id, name: d.name, archetype: d.family, generation: 1, parentIds: [],
    hue, saturation, lightness, parts, eyes, mouths, ...d.locomotion, ...d.lifeHistory,
    ...brain,
    founderMode: mode, eggReserveFraction: .35, reproductionThreshold: .6,
    bodyCost: calculateBodyCost(parts, eyes, mouths),
    maxEnergyCapacity: calculateMaxEnergyCapacity(parts, d.lifeHistory.storageTraitMultiplier),
  };
  remapBrain(g);
  // New channels start weak and neutral in empty water, while remaining functional.
  for (let h = 0; h < g.weightsIH.length; h++) for (let i = 0; i < layout.inputs.length; i++) {
    if (g.weightsIH[h][i] !== 0) continue;
    const w = localPrng.range(-.015, .015);
    g.weightsIH[h][i] = w;
    const channel = layout.inputs[i].split(':').at(-1);
    const baseline = channel === 'red' ? WATER_AMBIENT_RGB[0] : channel === 'green' ? WATER_AMBIENT_RGB[1]
      : channel === 'blue' ? WATER_AMBIENT_RGB[2] : channel === 'distance' ? 1 : 0;
    g.biasesH[h] -= baseline * w;
  }
  if (mode === 'balanced') addRetinalSteeringPrior(g, d.diet);
  return g;
}

/** A weak heritable neural prior, using perceived colors only; no target coordinates. */
function addRetinalSteeringPrior(g: Genome, diet: MouthType): void {
  // Green contrast for grazers, red/blue contrast for predators. Omnivores blend both.
  const color = diet === 'herbivore' ? [-.5, 1, -.25]
    : diet === 'carnivore' ? [.7, -.7, .5] : [.3, .5, .2];
  g.eyes.forEach((eye, e) => {
    for (let r = 0; r < RAYS_PER_EYE; r++) {
      const angle = getCardinalBaseAngle(eye.direction) + (r / (RAYS_PER_EYE - 1) - .5) * eye.fov;
      for (let c = 0; c < 3; c++) {
        const i = (e * RAYS_PER_EYE + r) * 4 + c;
        const sensitivity = .2 * Math.sin(angle) * color[c] / Math.sqrt(g.eyes.length);
        g.weightsIH[0][i] += sensitivity;
        g.weightsIH[1][i] -= sensitivity;
        g.biasesH[0] -= sensitivity * WATER_AMBIENT_RGB[c];
        g.biasesH[1] += sensitivity * WATER_AMBIENT_RGB[c];
      }
    }
  });
  for (let j = 0; j < g.parts.length - 1; j++) {
    g.weightsHO[j * OUTPUTS_PER_JOINT][0] += .04;
    g.weightsHO[j * OUTPUTS_PER_JOINT][1] -= .04;
  }
}

export function createFounderBankItems(mode: FounderMode = 'balanced'): SpecimenBankItem[] {
  return FOUNDER_BLUEPRINTS.map(d => ({id: `FOUNDER-${d.id}`, name: d.name,
    savedAt: 'Built-in', genome: createFounderGenome(d.id, mode), tags: [d.family, d.diet]}));
}

/** Eighteen diverse starters, twelve herbivores, four omnivores and two predators. */
export function sampleFounderGenomes(prng: XoshiroPRNG, count = 18, mode: FounderMode = 'balanced'): Genome[] {
  const used = new Set<string>();
  return Array.from({length: count}, (_, i) => {
    const diet = i % 18 < 12 ? 'herbivore' : i % 18 < 16 ? 'omnivore' : 'carnivore';
    let candidates = FOUNDER_BLUEPRINTS.filter(d => d.family === FOUNDER_FAMILIES[i % FOUNDER_FAMILIES.length]
      && d.diet === diet && !used.has(d.id));
    if (!candidates.length) candidates = FOUNDER_BLUEPRINTS.filter(d => d.diet === diet && !used.has(d.id));
    if (!candidates.length) candidates = FOUNDER_BLUEPRINTS.filter(d => d.diet === diet);
    const d = candidates[prng.rangeInt(0, candidates.length - 1)];
    used.add(d.id);
    return createFounderGenome(d.id, mode);
  });
}
