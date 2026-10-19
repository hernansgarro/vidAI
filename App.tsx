// tslint:disable
/* eslint-disable */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Zap,
  Info,
  Menu,
  X,
  Volume2,
  VolumeX,
  Compass,
  Activity,
  Plus,
  Sparkles,
  Sliders,
  Layers,
  Dna,
  Gauge,
  Network,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  GripHorizontal,
  Download,
  Upload,
  Save,
  FolderOpen,
  Swords,
  GitBranch,
  Settings as SettingsIcon,
  RefreshCw,
  Eye,
  Footprints,
  Clock,
  Split,
  FastForward,
} from 'lucide-react';
import {getConfig} from './constants';
import BackgroundMusic from './utils/BackgroundMusic';
import {
  createFixedStepper,
  drawAsset,
  GameState,
  MenuOverlay,
  Overlay,
  prepareCanvas,
  useAssets,
  useInput,
  useIsMobile,
  gameAudio,
} from './utils/helper';
import neuralNodeIconUrl from './assets/images/neural_node_icon.png';
import organismEggUrl from './assets/images/organism_egg.png';
import nutrientParticleUrl from './assets/images/nutrient_particle.png';
import dnaHelixIconUrl from './assets/images/dna_helix_icon.png';
import ambientMusicUrl from './assets/audio/ambient_deep_water_bgm.mp3';

// ============================================================================
// 1. DETERMINISTIC PRNG (xoshiro128++)
// ============================================================================
export class XoshiroPRNG {
  private s: Uint32Array;

  constructor(seed = 1337) {
    this.s = new Uint32Array(4);
    this.reseed(seed);
  }

  reseed(seed: number) {
    let x = (seed >>> 0) || 1;
    for (let i = 0; i < 4; i++) {
      let z = (x = (x + 0x9e3779b9) >>> 0);
      z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
      z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
      const val = (z ^ (z >>> 16)) >>> 0;
      this.s[i] = val || (0x9e3779b9 + i);
    }
  }

  nextUint32(): number {
    const s = this.s;
    const sum = (s[0] + s[3]) >>> 0;
    const result = ((((sum << 7) | (sum >>> 25)) >>> 0) + s[0]) >>> 0;
    const t = s[1] << 9;

    s[2] ^= s[0];
    s[3] ^= s[1];
    s[1] ^= s[2];
    s[0] ^= s[3];

    s[2] ^= t;
    s[3] = ((s[3] << 11) | (s[3] >>> 21)) >>> 0;

    return result;
  }

  nextFloat(): number {
    return (this.nextUint32() >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }

  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  getState(): [number, number, number, number] {
    return [this.s[0], this.s[1], this.s[2], this.s[3]];
  }

  setState(state: [number, number, number, number]) {
    this.s[0] = state[0];
    this.s[1] = state[1];
    this.s[2] = state[2];
    this.s[3] = state[3];
  }

  clone(): XoshiroPRNG {
    const copy = new XoshiroPRNG(1);
    copy.setState(this.getState());
    return copy;
  }
}

export const rng = new XoshiroPRNG(4242);

// ============================================================================
// 2. DATA STRUCTURES & MORPHOLOGY DEFINITIONS
// ============================================================================
export type CardinalDir = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
export type MouthType = 'herbivore' | 'carnivore' | 'omnivore';
export type FoodCategory = 'Nutrient' | 'Prey' | 'Egg';

export interface FeedingEvent {
  timestamp: number;
  mouthId: string;
  mouthType: MouthType;
  foodCategory: FoodCategory;
  energyTransferred: number;
}

export const UNIT_SIZE = 7.0; // Base unit in px
export const BASE_PART_DENSITY = 0.40; // Base mass density
export const FORCE_COST_MULTIPLIER = 0.000000175; // Mechanical work to heat dissipation (1/20th calibration)
export const BASAL_METABOLIC_RATE = 12.0; // J/s for founder-sized body (BASE_FOUNDER_AREA = 36)
export const SENSORY_NEURAL_METABOLIC_RATE = 0.45; // J/s per synapse / sensory eye
export const MAX_FRAME_MOTOR_WORK = 40.0; // Max motor dissipation per sub-step clamp to prevent solver spikes

export const MATURITY_AGE = 20.0; // 20.0s until sexual maturity
export const MIN_PARENT_SURVIVAL_RESERVE_BASE = 2000.0; // 2,000 J minimum survival reserve floor
export const MIN_PARENT_SURVIVAL_FRACTION = 0.20; // 20% of max capacity
export const BASE_FOUNDER_AREA = 36.0; // Baseline body grid area (e.g. 3 segments of 12 units)
export const FOUNDER_DEFAULT_RESERVE = 10000.0; // 10,000 J starting usable reserve
export const FOUNDER_DEFAULT_CAPACITY = 100000.0; // 100,000 J max capacity

export const CONTINUOUS_EAT_RATE = 1200.0; // J/s max transfer (scaled for 100k J economy)
export const OMNIVORE_EAT_RATE = CONTINUOUS_EAT_RATE * 0.5; // 50% rate
export const NUTRIENT_ENERGY_VALUE = 3000.0; // 3,000 J per nutrient
export const BASE_NUTRIENT_RADIUS = 18.0;

// Optical water ambient constant
export const WATER_AMBIENT_RGB: [number, number, number] = [0.04, 0.12, 0.18];

// Recurrent Brain Specs
export const NUM_INPUT_RAYS = 5;
export const NUM_INPUTS = NUM_INPUT_RAYS * 3 + 7; // 15 optical + 3 joint + speed + energy + sin + cos = 22
export const NUM_HIDDEN = 24; // 24 Recurrent Neurons
export const MAX_PARTS = 7;
export const OUTPUTS_PER_JOINT = 4; // [targetAngleOffset, motorDrive, peakTorque, jointStiffness]
export const MAX_OUTPUTS = (MAX_PARTS - 1) * OUTPUTS_PER_JOINT;
export const MAX_CLUTCH_SIZE = 8;

export const INPUT_LABELS = [
  'R1-Red', 'R1-Grn', 'R1-Blu',
  'R2-Red', 'R2-Grn', 'R2-Blu',
  'R3-Red', 'R3-Grn', 'R3-Blu',
  'R4-Red', 'R4-Grn', 'R4-Blu',
  'R5-Red', 'R5-Grn', 'R5-Blu',
  'J1 RelAngle', 'J2 RelAngle', 'J3 RelAngle',
  'Norm Speed', 'Norm Energy',
  'CPG Sin', 'CPG Cos',
];

export const OUTPUT_LABELS = ['Angle', 'Drive', 'Torque', 'Stiff'];

export interface SensoryEye {
  id: string;
  partIndex: number;
  direction: CardinalDir;
  fov: number; // in radians
  range: number; // optical distance
}

export interface SensoryMouth {
  id: string;
  partIndex: number;
  direction: CardinalDir;
  intakeWidth: number; // aperture contact width
  mouthType: MouthType;
}

export interface PartDef {
  id: string;
  parentIndex: number; // -1 for root
  attachmentPoint: CardinalDir;
  dimN: number;
  dimM: number;
  width: number;
  height: number;
  maxAngle: number;
  baseAngleOffset: number;
  cpgPhaseOffset: number;
  cpgAmp: number;
  cpgFreqMult: number;
}

export type ArchetypeId = 'eel' | 'flapper' | 'tadpole' | 'glider' | 'predator' | 'nematode' | 'random';

export interface Genome {
  id: string;
  name?: string;
  archetype?: string;
  generation: number;
  parentIds: string[];
  hue: number;
  saturation: number;
  lightness: number;
  parts: PartDef[];
  eyes: SensoryEye[];
  mouths: SensoryMouth[];
  motorFrequency: number;
  motorForce: number;
  // Recurrent Neural Weights
  weightsIH: number[][]; // [NUM_HIDDEN x NUM_INPUTS]
  weightsHH: number[][]; // [NUM_HIDDEN x NUM_HIDDEN] Recurrent Synapses
  biasesH: number[];     // [NUM_HIDDEN]
  weightsHO: number[][]; // [MAX_OUTPUTS x NUM_HIDDEN]
  biasesO: number[];     // [MAX_OUTPUTS]
  // Life History Traits
  targetClutchSize: number;    // integer 1..6 eggs desired per clutch
  maturityAge: number;         // seconds until sexual maturity (10.0..45.0s)
  incubationTime: number;      // seconds
  eggReserveFraction: number;  // fraction of budget to reserve
  reproductionThreshold: number; // energy ratio needed
  reproductionCooldown: number;  // cooldown in seconds
  maxLifespan: number;          // seconds
  metabolicEfficiency: number;
  bodyCost: number;
  storageTraitMultiplier?: number;
  maxEnergyCapacity: number;
}

export interface PartPhys {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angVel: number;
}

export interface JointState {
  phase: number;
  targetAngle: number;
  currentRelAngle: number;
  currentRelAngVel: number;
  appliedTorque: number;
  stiffness: number;
}

export interface RayHit {
  hit: boolean;
  dist: number;
  pointX: number;
  pointY: number;
  r: number;
  g: number;
  b: number;
  objectType: 'wall' | 'creature' | 'nutrient' | 'egg' | 'none';
}

export interface Organism {
  id: string;
  clutchId?: string;
  genome: Genome;
  segments: PartPhys[];
  joints: JointState[];
  energy: number;
  structuralBiomass: number;
  basalEnergyRate?: number;
  sensoryEnergyRate?: number;
  motorEnergyRate: number;
  totalEnergyRate?: number;
  age: number;
  maxLifespan: number;
  foodEaten: number;
  preyEaten: number;
  eggsPredated: number;
  offspringCount: number;
  clutchesLaid: number;
  isGravid: boolean;
  lastReproductionAge: number;
  lastReproductionTime: number;
  deathCause?: DeathCause;
  distanceTraveled: number;
  speed: number;
  neuralInputs: number[];
  neuralHidden: number[]; // Recurrent state h_t
  neuralOutputs: number[];
  rayHits: RayHit[];
  glowPulse: number;
  dissolving: boolean;
  dissolveAlpha: number;
  isFeedingHighlight: number;
  traceHistory?: Array<{x: number; y: number; time: number}>;
  recentFeedings?: FeedingEvent[];
}

export interface Egg {
  id: string;
  clutchId: string;
  parentOrgId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  genome: Genome;
  fundedStructural: number; // E_structural needed for offspring body
  fundedReserve: number;    // Usable energy given to offspring
  incubationProgress: number; // 0..1
  totalIncubationTime: number;
  pulseTimer: number;
  colorHue: number;
  readyToHatch: boolean;
}

export interface Nutrient {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energyValue: number;
  radius: number;
  bottomTimer: number;
  isSuper?: boolean;
  pulseTimer?: number;
}

export interface BubbleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  hue: number;
}

export interface CausticWave {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
  angle: number;
}

export type DeathCause = 'Old Age' | 'Starvation' | 'Predation';
export type LifeStage = 'Juvenile' | 'Adult' | 'Aging' | 'Deceased';

export interface DeathRecord {
  id: string;
  name: string;
  generation: number;
  cause: DeathCause;
  age: number;
  energyAtDeath: number;
  offspringCount: number;
  timestamp: number;
}

export interface LineageRecord {
  id: string;
  name?: string;
  parentIds: string[];
  generation: number;
  birthTime: number;
  deathTime?: number;
  deathCause?: DeathCause;
  deathAge?: number;
  deathEnergy?: number;
  offspringCount: number;
  archetype: string;
  hue: number;
  diet: string;
  genome: Genome;
}

export interface SpecimenBankItem {
  id: string;
  name: string;
  savedAt: string;
  genome: Genome;
  tags: string[];
}

export interface SimulationLedger {
  externalInflow: number;
  metabolicDissipation: number;
  mechanicalWorkHeat: number;
  recordedLosses: number; // Nonviable egg decomposition or excess feeding discard
}

export interface SimulationSettings {
  worldWidth: number;
  worldHeight: number;
  waterViscosity: number;
  targetNutrients: number;
  inflowRate: number;
  kinshipProtection: boolean;
  mutationSeverity: number;
  gravity?: number;
  maxOrganisms?: number;
}

export interface SimulationState {
  simTime: number;
  organisms: Organism[];
  eggs: Egg[];
  nutrients: Nutrient[];
  bubbles: BubbleParticle[];
  caustics: CausticWave[];
  ledger: SimulationLedger;
  nutrientAccumulator: number;
  totalBirths: number;
  totalDeaths: number;
  prng: XoshiroPRNG;
  lineage: Map<string, LineageRecord>;
  recentDeaths: DeathRecord[];
}

export const NUM_SUBSTEPS = 4; // 4 Substeps @ 1/240s for smooth, symplectic integration

// Scratch buffers
const scratchFx = new Float64Array(16);
const scratchFy = new Float64Array(16);
const scratchTorque = new Float64Array(16);
const scratchMasses = new Float64Array(16);
const scratchInvMasses = new Float64Array(16);
const scratchInertias = new Float64Array(16);
const scratchInvInertias = new Float64Array(16);
const scratchPrevHidden = new Float64Array(NUM_HIDDEN);

const clampVal = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const hsl = (h: number, s: number, l: number, a = 1) =>
  `hsla(${Math.floor(h)}, ${Math.floor(s)}%, ${Math.floor(l)}%, ${a})`;

/**
 * Enforces nutrient hue exclusion (105° to 165° green spectrum).
 * Maps any creature body colors in this band to distinct vibrant colors
 * (e.g. amber/orange 30°-55° or cyan/blue 175°-220°).
 */
export function sanitizeCreatureHue(hue: number): number {
  let h = ((hue % 360) + 360) % 360;
  if (h >= 105 && h <= 165) {
    if (h < 135) {
      h = 30 + ((h - 105) / 30) * 25; // Map to 30° - 55° (amber/gold)
    } else {
      h = 175 + ((h - 135) / 30) * 45; // Map to 175° - 220° (cyan/azure)
    }
  }
  return Math.round(((h % 360) + 360) % 360);
}

export interface DietInfo {
  category: 'Herbivore' | 'Carnivore' | 'Omnivore' | 'Mixed' | 'Passive';
  label: string;
  composition: string;
  badgeClass: string;
  textClass: string;
  icon: string;
  herbivores: number;
  carnivores: number;
  omnivores: number;
}

export function getLifeStage(org: Organism): LifeStage {
  if (org.dissolving || org.dissolveAlpha < 1.0) return 'Deceased';
  const maturityAge = org.genome.maturityAge || MATURITY_AGE;
  if (org.age < maturityAge) return 'Juvenile';
  if (org.age >= org.maxLifespan * 0.8) return 'Aging';
  return 'Adult';
}

export function evaluateReproductionAffordability(
  org: Organism,
  simTime: number,
  livingCount: number,
  eggCount: number,
  maxOrgs = 50,
  maxEggs = 75,
): {
  eligible: boolean;
  affordableCount: number;
  desiredCount: number;
  actualClutchSize: number;
  eggCost: number;
  parentReserve: number;
  availableForReproduction: number;
  requiredBudget: number;
  requiredForOneEgg: number;
  statusText: string;
  badgeClass: string;
  remainingCooldown: number;
} {
  const g = org.genome;
  const maturityAge = g.maturityAge || MATURITY_AGE;
  const desiredCount = g.targetClutchSize || 2;
  const parentReserve = Math.max(MIN_PARENT_SURVIVAL_RESERVE_BASE, g.maxEnergyCapacity * MIN_PARENT_SURVIVAL_FRACTION);
  const eggCost = g.bodyCost + FOUNDER_DEFAULT_RESERVE;
  const availableForReproduction = org.energy - parentReserve;
  const requiredForOneEgg = eggCost + parentReserve;
  const requiredBudget = eggCost * desiredCount + parentReserve;
  const cooldown = g.reproductionCooldown || 18.0;
  const timeSinceRepro = simTime - (org.lastReproductionTime || 0);
  const remainingCooldown = Math.max(0, cooldown - timeSinceRepro);

  const affordableCount = Math.max(0, Math.floor(availableForReproduction / eggCost));
  const actualClutchSize = Math.min(desiredCount, affordableCount);

  if (org.dissolving || org.dissolveAlpha < 1.0) {
    return {
      eligible: false,
      affordableCount: 0,
      desiredCount,
      actualClutchSize: 0,
      eggCost,
      parentReserve,
      availableForReproduction: 0,
      requiredBudget,
      requiredForOneEgg,
      statusText: '💀 Deceased',
      badgeClass: 'bg-slate-900 border-slate-700 text-slate-500',
      remainingCooldown: 0,
    };
  }

  if (org.age < maturityAge) {
    const timeToMaturity = maturityAge - org.age;
    return {
      eligible: false,
      affordableCount: 0,
      desiredCount,
      actualClutchSize: 0,
      eggCost,
      parentReserve,
      availableForReproduction,
      requiredBudget,
      requiredForOneEgg,
      statusText: `🌱 Immature (${timeToMaturity.toFixed(1)}s to maturity)`,
      badgeClass: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
      remainingCooldown: 0,
    };
  }

  if (livingCount >= maxOrgs) {
    return {
      eligible: false,
      affordableCount,
      desiredCount,
      actualClutchSize,
      eggCost,
      parentReserve,
      availableForReproduction,
      requiredBudget,
      requiredForOneEgg,
      statusText: '🚫 Pop Cap Reached',
      badgeClass: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
      remainingCooldown: 0,
    };
  }

  if (eggCount >= maxEggs) {
    return {
      eligible: false,
      affordableCount,
      desiredCount,
      actualClutchSize,
      eggCost,
      parentReserve,
      availableForReproduction,
      requiredBudget,
      requiredForOneEgg,
      statusText: '🥚 Egg Cap Reached',
      badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
      remainingCooldown: 0,
    };
  }

  if (remainingCooldown > 0.05) {
    return {
      eligible: false,
      affordableCount,
      desiredCount,
      actualClutchSize,
      eggCost,
      parentReserve,
      availableForReproduction,
      requiredBudget,
      requiredForOneEgg,
      statusText: `⏳ Cooldown (${remainingCooldown.toFixed(1)}s)`,
      badgeClass: 'bg-blue-950/80 border-blue-500/40 text-blue-300',
      remainingCooldown,
    };
  }

  if (actualClutchSize < 1) {
    return {
      eligible: false,
      affordableCount: 0,
      desiredCount,
      actualClutchSize: 0,
      eggCost,
      parentReserve,
      availableForReproduction,
      requiredBudget,
      requiredForOneEgg,
      statusText: `⚡ Foraging for 1st egg (${Math.round(Math.max(0, org.energy))} / ${Math.round(requiredForOneEgg)} J)`,
      badgeClass: 'bg-slate-900/80 border-slate-700 text-slate-400',
      remainingCooldown: 0,
    };
  }

  return {
    eligible: true,
    affordableCount,
    desiredCount,
    actualClutchSize,
    eggCost,
    parentReserve,
    availableForReproduction,
    requiredBudget,
    requiredForOneEgg,
    statusText: `★ Ready (Laying ${actualClutchSize}/${desiredCount} eggs)`,
    badgeClass: 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold',
    remainingCooldown: 0,
  };
}

export function getDietClassification(mouths: SensoryMouth[] | undefined): DietInfo {
  if (!mouths || mouths.length === 0) {
    return {
      category: 'Passive',
      label: 'Passive Grazer',
      composition: '0 Mouths (Passive)',
      badgeClass: 'bg-slate-900/80 border-slate-700 text-slate-400',
      textClass: 'text-slate-400',
      icon: '⚪',
      herbivores: 0,
      carnivores: 0,
      omnivores: 0,
    };
  }

  let herbivores = 0;
  let carnivores = 0;
  let omnivores = 0;

  for (const m of mouths) {
    if (m.mouthType === 'carnivore') carnivores++;
    else if (m.mouthType === 'omnivore') omnivores++;
    else herbivores++;
  }

  const parts: string[] = [];
  if (carnivores > 0) parts.push(`${carnivores} Carnivore`);
  if (omnivores > 0) parts.push(`${omnivores} Omnivore`);
  if (herbivores > 0) parts.push(`${herbivores} Herbivore`);
  const composition = parts.join(' · ');

  if (carnivores > 0 && herbivores === 0 && omnivores === 0) {
    return {
      category: 'Carnivore',
      label: 'Carnivore',
      composition,
      badgeClass: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
      textClass: 'text-rose-400 font-bold',
      icon: '🥩',
      herbivores: 0,
      carnivores,
      omnivores: 0,
    };
  }

  if (herbivores > 0 && carnivores === 0 && omnivores === 0) {
    return {
      category: 'Herbivore',
      label: 'Herbivore',
      composition,
      badgeClass: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
      textClass: 'text-emerald-400 font-bold',
      icon: '🌿',
      herbivores,
      carnivores: 0,
      omnivores: 0,
    };
  }

  if (omnivores > 0 && carnivores === 0 && herbivores === 0) {
    return {
      category: 'Omnivore',
      label: 'Omnivore',
      composition,
      badgeClass: 'bg-purple-950/80 border-purple-500/40 text-purple-300',
      textClass: 'text-purple-300 font-bold',
      icon: '🟣',
      herbivores: 0,
      carnivores: 0,
      omnivores,
    };
  }

  // Mixed diet organism
  return {
    category: 'Mixed',
    label: `Mixed (${composition})`,
    composition,
    badgeClass: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
    textClass: 'text-amber-400 font-bold',
    icon: '🥩🌿',
    herbivores,
    carnivores,
    omnivores,
  };
}

export function recordFeedingEvent(
  org: Organism,
  simTime: number,
  mouthId: string,
  mouthType: MouthType,
  foodCategory: FoodCategory,
  energyTransferred: number,
) {
  if (energyTransferred <= 0) return;
  if (!org.recentFeedings) org.recentFeedings = [];

  const last = org.recentFeedings[org.recentFeedings.length - 1];
  if (
    last &&
    last.mouthId === mouthId &&
    last.foodCategory === foodCategory &&
    simTime - last.timestamp < 0.25
  ) {
    last.energyTransferred += energyTransferred;
    last.timestamp = simTime;
  } else {
    org.recentFeedings.push({
      timestamp: simTime,
      mouthId,
      mouthType,
      foodCategory,
      energyTransferred,
    });
    if (org.recentFeedings.length > 8) {
      org.recentFeedings.shift();
    }
  }
}

export function getNutrientRadius(energy: number): number {
  const ratio = Math.max(0.1, energy / NUTRIENT_ENERGY_VALUE);
  const scale = 1 + 0.35 * Math.log2(ratio);
  return Math.max(8.0, BASE_NUTRIENT_RADIUS * Math.max(0.4, scale));
}

export function getOppositeCardinalDir(dir: CardinalDir): CardinalDir {
  switch (dir) {
    case 'EAST': return 'WEST';
    case 'WEST': return 'EAST';
    case 'NORTH': return 'SOUTH';
    case 'SOUTH': return 'NORTH';
  }
}

export function isFaceWide(dir: CardinalDir, dimN: number, dimM: number): boolean {
  if (dir === 'NORTH' || dir === 'SOUTH') {
    return dimN > dimM;
  } else {
    return dimM > dimN;
  }
}

export function isValidAttachment(
  parentAttachmentPoint: CardinalDir,
  parentN: number,
  parentM: number,
  childN: number,
  childM: number,
): boolean {
  const isParentWide = isFaceWide(parentAttachmentPoint, parentN, parentM);
  const childMatingFace = getOppositeCardinalDir(parentAttachmentPoint);
  const isChildWide = isFaceWide(childMatingFace, childN, childM);
  return !(isParentWide && isChildWide);
}

export function generateCompliantChildDimensions(
  parentDir: CardinalDir,
  parentN: number,
  parentM: number,
  customPrng: XoshiroPRNG = rng,
): {dimN: number; dimM: number} {
  const parentWide = isFaceWide(parentDir, parentN, parentM);
  if (parentWide) {
    if (parentDir === 'EAST' || parentDir === 'WEST') {
      const dimN = customPrng.rangeInt(3, 7);
      const dimM = customPrng.rangeInt(1, dimN);
      return {dimN, dimM};
    } else {
      const dimM = customPrng.rangeInt(3, 7);
      const dimN = customPrng.rangeInt(1, dimM);
      return {dimN, dimM};
    }
  } else {
    const dimN = customPrng.rangeInt(2, 6);
    const dimM = customPrng.rangeInt(2, 6);
    return {dimN, dimM};
  }
}

export function areSiblings(a: Organism, b: Organism): boolean {
  if (a.id === b.id) return true;
  if (a.clutchId && b.clutchId && a.clutchId === b.clutchId) return true;
  if (
    a.genome.generation === b.genome.generation &&
    a.genome.parentIds.length > 0 &&
    b.genome.parentIds.length > 0
  ) {
    for (const pA of a.genome.parentIds) {
      if (b.genome.parentIds.includes(pA)) return true;
    }
  }
  return false;
}

export function isEggKin(org: Organism, egg: Egg): boolean {
  if (egg.parentOrgId === org.id) return true;
  if (egg.clutchId && org.clutchId && egg.clutchId === org.clutchId) return true;
  if (egg.genome.parentIds && egg.genome.parentIds.includes(org.id)) return true;
  if (org.genome.parentIds && egg.genome.parentIds) {
    for (const p of org.genome.parentIds) {
      if (egg.genome.parentIds.includes(p)) return true;
    }
  }
  return false;
}

export function getCardinalAnchor(dir: CardinalDir, width: number, height: number): {x: number; y: number} {
  const halfW = width * 0.5;
  const halfH = height * 0.5;
  switch (dir) {
    case 'EAST': return {x: halfW, y: 0};
    case 'WEST': return {x: -halfW, y: 0};
    case 'NORTH': return {x: 0, y: -halfH};
    case 'SOUTH': return {x: 0, y: halfH};
  }
}

export function getChildAnchorForParentDir(dir: CardinalDir, width: number, height: number): {x: number; y: number} {
  const halfW = width * 0.5;
  const halfH = height * 0.5;
  switch (dir) {
    case 'EAST': return {x: -halfW, y: 0};
    case 'WEST': return {x: halfW, y: 0};
    case 'NORTH': return {x: 0, y: halfH};
    case 'SOUTH': return {x: 0, y: -halfH};
  }
}

export function getCardinalBaseAngle(dir: CardinalDir): number {
  switch (dir) {
    case 'EAST': return 0;
    case 'WEST': return Math.PI;
    case 'NORTH': return -Math.PI / 2;
    case 'SOUTH': return Math.PI / 2;
  }
}

export function getCardinalOutwardNormal(dir: CardinalDir): {x: number; y: number} {
  switch (dir) {
    case 'EAST': return {x: 1, y: 0};
    case 'WEST': return {x: -1, y: 0};
    case 'NORTH': return {x: 0, y: -1};
    case 'SOUTH': return {x: 0, y: 1};
  }
}

export function calculateBodyCost(parts: PartDef[], eyes: SensoryEye[], mouths: SensoryMouth[]): number {
  let cost = 1200.0; // BASE_BODY_COST scaled for tissue mass
  for (const part of parts) {
    cost += part.dimN * part.dimM * 80.0;
  }
  cost += eyes.length * 250.0;
  cost += mouths.length * 400.0;
  cost += Math.max(0, parts.length - 1) * 200.0;
  return Math.round(cost);
}

export function calculateTotalBodyArea(parts: PartDef[]): number {
  let area = 0;
  for (const part of parts) {
    area += part.dimN * part.dimM;
  }
  return Math.max(4.0, area);
}

export function calculateMaxEnergyCapacity(parts: PartDef[], storageMultiplier = 1.0): number {
  const totalArea = calculateTotalBodyArea(parts);
  const scaledCapacity = FOUNDER_DEFAULT_CAPACITY * (totalArea / BASE_FOUNDER_AREA) * storageMultiplier;
  return Math.round(clampVal(scaledCapacity, 40000.0, 300000.0));
}

export function formatJoules(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0 J';
  const val = Math.round(value);
  if (Math.abs(val) >= 1000000) {
    return `${(val / 1000000).toFixed(2)}M J`;
  }
  if (Math.abs(val) >= 10000) {
    return `${(val / 1000).toFixed(1)}k J`;
  }
  return `${val.toLocaleString()} J`;
}

export function createPartDef(
  id: string,
  parentIndex: number,
  attachmentPoint: CardinalDir,
  dimN: number,
  dimM: number,
  maxAngle = 2.0,
  baseAngleOffset = 0,
  cpgPhaseOffset = 0,
  cpgAmp = 1.0,
  cpgFreqMult = 1.0,
): PartDef {
  const nClamped = clampVal(Math.round(dimN), 1, 10);
  const mClamped = clampVal(Math.round(dimM), 1, 10);
  return {
    id,
    parentIndex,
    attachmentPoint,
    dimN: nClamped,
    dimM: mClamped,
    width: nClamped * UNIT_SIZE,
    height: mClamped * UNIT_SIZE,
    maxAngle: clampVal(maxAngle, 0.6, 2.35),
    baseAngleOffset,
    cpgPhaseOffset,
    cpgAmp,
    cpgFreqMult,
  };
}

// Xavier/Glorot Initialization for Recurrent Neural Controller
export function createXavierRecurrentNetwork(customPrng: XoshiroPRNG = rng): {
  weightsIH: number[][];
  weightsHH: number[][];
  biasesH: number[];
  weightsHO: number[][];
  biasesO: number[];
} {
  const limitIH = Math.sqrt(6.0 / (NUM_INPUTS + NUM_HIDDEN));
  const limitHH = Math.sqrt(6.0 / (NUM_HIDDEN + NUM_HIDDEN));
  const limitHO = Math.sqrt(6.0 / (NUM_HIDDEN + MAX_OUTPUTS));

  const weightsIH: number[][] = Array.from({length: NUM_HIDDEN}, () =>
    Array.from({length: NUM_INPUTS}, () => customPrng.range(-limitIH, limitIH)),
  );
  const weightsHH: number[][] = Array.from({length: NUM_HIDDEN}, () =>
    Array.from({length: NUM_HIDDEN}, () => customPrng.range(-limitHH * 0.8, limitHH * 0.8)),
  );
  const biasesH = Array.from({length: NUM_HIDDEN}, () => customPrng.range(-0.05, 0.05));
  const weightsHO: number[][] = Array.from({length: MAX_OUTPUTS}, () =>
    Array.from({length: NUM_HIDDEN}, () => customPrng.range(-limitHO, limitHO)),
  );
  const biasesO = Array.from({length: MAX_OUTPUTS}, () => customPrng.range(-0.05, 0.05));

  return {weightsIH, weightsHH, biasesH, weightsHO, biasesO};
}

// Draggable modal hook with strict viewport clamping
function useDraggableModal(initialX: number, initialY: number) {
  const [pos, setPos] = useState(() => {
    const maxX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 120) : 1000;
    const maxY = typeof window !== 'undefined' ? Math.max(20, window.innerHeight - 120) : 600;
    return {
      x: Math.max(10, Math.min(maxX, initialX)),
      y: Math.max(10, Math.min(maxY, initialY)),
    };
  });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({x: 0, y: 0, posX: 0, posY: 0});

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const maxX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 120) : 1200;
    const maxY = typeof window !== 'undefined' ? Math.max(20, window.innerHeight - 120) : 800;

    setPos({
      x: Math.max(10, Math.min(maxX, dragStartRef.current.posX + dx)),
      y: Math.max(10, Math.min(maxY, dragStartRef.current.posY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      e.stopPropagation();
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  return {
    pos,
    setPos,
    headerProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}

// 3-Segment Reference Nematode Genotype for Trustworthy Benchmark
export function createReferenceNematodeGenome(): Genome {
  const parts: PartDef[] = [
    createPartDef('part-0', -1, 'EAST', 5, 3, 1.2, 0, 0, 1.0, 1.0),
    createPartDef('part-1', 0, 'WEST', 6, 2, 1.2, 0, 0, 0.8, 1.0),
    createPartDef('part-2', 1, 'WEST', 7, 2, 1.2, 0, Math.PI * 0.5, 0.8, 1.0),
  ];
  const eyes: SensoryEye[] = [
    {id: 'eye-0', partIndex: 0, direction: 'EAST', fov: 2.0, range: 500},
  ];
  const mouths: SensoryMouth[] = [
    {id: 'mouth-0', partIndex: 0, direction: 'EAST', intakeWidth: 3 * UNIT_SIZE * 0.9, mouthType: 'herbivore'},
  ];

  const bodyCost = calculateBodyCost(parts, eyes, mouths);
  const storageTraitMultiplier = 1.0;
  const maxEnergyCapacity = calculateMaxEnergyCapacity(parts, storageTraitMultiplier);
  const {weightsIH, weightsHH, biasesH, weightsHO, biasesO} = createXavierRecurrentNetwork();

  return {
    id: 'BENCH-NEMATODE',
    name: 'Benchmark Nematode',
    archetype: 'Benchmark Nematode',
    generation: 1,
    parentIds: [],
    hue: 195,
    saturation: 90,
    lightness: 55,
    parts,
    eyes,
    mouths,
    motorFrequency: 3.0,
    motorForce: 3.0,
    weightsIH,
    weightsHH,
    biasesH,
    weightsHO,
    biasesO,
    targetClutchSize: 2,
    maturityAge: 20.0,
    incubationTime: 10.0,
    eggReserveFraction: 0.35,
    reproductionThreshold: 0.60,
    reproductionCooldown: 18.0,
    maxLifespan: 360,
    metabolicEfficiency: 1.2,
    bodyCost,
    storageTraitMultiplier,
    maxEnergyCapacity,
  };
}

// Archetype Genomes with Recurrent Weights
export function createEelFlagellateGenome(generation = 1, parentIds: string[] = [], customPrng = rng): Genome {
  const parts: PartDef[] = [];
  const eyes: SensoryEye[] = [];
  const mouths: SensoryMouth[] = [];

  parts.push(createPartDef('part-0', -1, 'EAST', 5, 3, 1.2, 0, 0, 1.0, 1.0));
  mouths.push({id: 'mouth-0', partIndex: 0, direction: 'EAST', intakeWidth: 3 * UNIT_SIZE * 0.95, mouthType: 'herbivore'});
  eyes.push({id: 'eye-0', partIndex: 0, direction: 'EAST', fov: 2.0, range: 560});

  parts.push(createPartDef('part-1', 0, 'WEST', 6, 2, 1.2, 0, 0, 0.85, 1.0));
  parts.push(createPartDef('part-2', 1, 'WEST', 7, 2, 1.2, 0, Math.PI * 0.5, 0.95, 1.0));

  const bodyCost = calculateBodyCost(parts, eyes, mouths);
  const storageTraitMultiplier = 1.0;
  const maxEnergyCapacity = calculateMaxEnergyCapacity(parts, storageTraitMultiplier);
  const {weightsIH, weightsHH, biasesH, weightsHO, biasesO} = createXavierRecurrentNetwork(customPrng);

  // Optical Green Seeking & Smooth steering bias
  weightsIH[0][1] = 0.8; // Left/Right Green
  weightsIH[0][4] = 1.2;
  weightsIH[1][10] = 1.2;
  weightsIH[1][13] = 0.8;

  // Steering offset output
  weightsHO[0][0] = -0.5;
  weightsHO[0][1] = 0.5;

  return {
    id: `EEL-${customPrng.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
    name: 'Flagellate Eel',
    archetype: 'Flagellate Eel',
    generation,
    parentIds,
    hue: 185,
    saturation: 92,
    lightness: 58,
    parts,
    eyes,
    mouths,
    motorFrequency: 3.2,
    motorForce: 3.2,
    weightsIH,
    weightsHH,
    biasesH,
    weightsHO,
    biasesO,
    targetClutchSize: 1 + Math.floor(customPrng.nextFloat() * 4),
    maturityAge: customPrng.range(15.0, 24.0),
    incubationTime: 10.0,
    eggReserveFraction: 0.35,
    reproductionThreshold: 0.60,
    reproductionCooldown: 18.0,
    maxLifespan: 340,
    metabolicEfficiency: 1.18,
    bodyCost,
    storageTraitMultiplier,
    maxEnergyCapacity,
  };
}

export function createApexPredatorGenome(generation = 1, parentIds: string[] = [], customPrng = rng): Genome {
  const parts: PartDef[] = [];
  const eyes: SensoryEye[] = [];
  const mouths: SensoryMouth[] = [];

  parts.push(createPartDef('part-0', -1, 'EAST', 5, 4, 1.2, 0, 0, 1.0, 1.0));
  mouths.push({id: 'mouth-0', partIndex: 0, direction: 'EAST', intakeWidth: 4.2 * UNIT_SIZE, mouthType: 'carnivore'});
  mouths.push({id: 'mouth-1', partIndex: 0, direction: 'NORTH', intakeWidth: 3.0 * UNIT_SIZE, mouthType: 'carnivore'});

  eyes.push({id: 'eye-0', partIndex: 0, direction: 'EAST', fov: 2.3, range: 650});
  eyes.push({id: 'eye-1', partIndex: 0, direction: 'NORTH', fov: 1.6, range: 500});
  eyes.push({id: 'eye-2', partIndex: 0, direction: 'SOUTH', fov: 1.6, range: 500});

  parts.push(createPartDef('part-1', 0, 'WEST', 6, 2, 1.2, 0, 0, 0.85, 1.0));
  parts.push(createPartDef('part-2', 1, 'WEST', 7, 2, 1.2, 0, Math.PI * 0.5, 1.0, 1.05));

  const bodyCost = calculateBodyCost(parts, eyes, mouths);
  const storageTraitMultiplier = 1.05;
  const maxEnergyCapacity = calculateMaxEnergyCapacity(parts, storageTraitMultiplier);
  const {weightsIH, weightsHH, biasesH, weightsHO, biasesO} = createXavierRecurrentNetwork(customPrng);

  // Prey pursuit steering
  weightsIH[0][2] = 1.2;
  weightsIH[0][0] = 0.9;
  weightsIH[1][14] = 1.2;
  weightsIH[1][12] = 0.9;

  weightsHO[0][0] = -0.6;
  weightsHO[0][1] = 0.6;

  return {
    id: `PRED-${customPrng.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
    name: 'Apex Hunter',
    archetype: 'Apex Hunter',
    generation,
    parentIds,
    hue: 355,
    saturation: 96,
    lightness: 54,
    parts,
    eyes,
    mouths,
    motorFrequency: 3.4,
    motorForce: 3.5,
    weightsIH,
    weightsHH,
    biasesH,
    weightsHO,
    biasesO,
    targetClutchSize: 1 + Math.floor(customPrng.nextFloat() * 3),
    maturityAge: customPrng.range(18.0, 26.0),
    incubationTime: 12.0,
    eggReserveFraction: 0.40,
    reproductionThreshold: 0.65,
    reproductionCooldown: 20.0,
    maxLifespan: 380,
    metabolicEfficiency: 1.25,
    bodyCost,
    storageTraitMultiplier,
    maxEnergyCapacity,
  };
}

export function createMantaFlapperGenome(generation = 1, parentIds: string[] = [], customPrng = rng): Genome {
  const parts: PartDef[] = [];
  const eyes: SensoryEye[] = [];
  const mouths: SensoryMouth[] = [];

  parts.push(createPartDef('part-0', -1, 'EAST', 5, 4, 1.2, 0, 0, 1.0, 1.0));
  mouths.push({id: 'mouth-0', partIndex: 0, direction: 'EAST', intakeWidth: 4 * UNIT_SIZE * 0.95, mouthType: 'herbivore'});
  eyes.push({id: 'eye-0', partIndex: 0, direction: 'EAST', fov: 2.0, range: 520});
  eyes.push({id: 'eye-1', partIndex: 0, direction: 'NORTH', fov: 1.5, range: 460});
  eyes.push({id: 'eye-2', partIndex: 0, direction: 'SOUTH', fov: 1.5, range: 460});

  parts.push(createPartDef('part-1', 0, 'NORTH', 6, 2, 1.2, -Math.PI / 2, 0.0, 0.85, 1.0));
  parts.push(createPartDef('part-2', 0, 'SOUTH', 6, 2, 1.2, Math.PI / 2, Math.PI, 0.85, 1.0));
  parts.push(createPartDef('part-3', 0, 'WEST', 5, 2, 1.2, 0, Math.PI * 0.5, 0.8, 1.0));

  const bodyCost = calculateBodyCost(parts, eyes, mouths);
  const storageTraitMultiplier = 1.0;
  const maxEnergyCapacity = calculateMaxEnergyCapacity(parts, storageTraitMultiplier);
  const {weightsIH, weightsHH, biasesH, weightsHO, biasesO} = createXavierRecurrentNetwork(customPrng);

  return {
    id: `MAN-${customPrng.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
    name: 'Manta Flapper',
    archetype: 'Manta Flapper',
    generation,
    parentIds,
    hue: 215,
    saturation: 90,
    lightness: 60,
    parts,
    eyes,
    mouths,
    motorFrequency: 3.0,
    motorForce: 3.0,
    weightsIH,
    weightsHH,
    biasesH,
    weightsHO,
    biasesO,
    targetClutchSize: 1 + Math.floor(customPrng.nextFloat() * 4),
    maturityAge: customPrng.range(16.0, 24.0),
    incubationTime: 11.0,
    eggReserveFraction: 0.35,
    reproductionThreshold: 0.60,
    reproductionCooldown: 18.0,
    maxLifespan: 360,
    metabolicEfficiency: 1.18,
    bodyCost,
    storageTraitMultiplier,
    maxEnergyCapacity,
  };
}

export function createTadpoleCruiserGenome(generation = 1, parentIds: string[] = [], customPrng = rng): Genome {
  const parts: PartDef[] = [];
  const eyes: SensoryEye[] = [];
  const mouths: SensoryMouth[] = [];

  parts.push(createPartDef('part-0', -1, 'EAST', 5, 4, 1.2, 0, 0, 1.0, 1.0));
  mouths.push({id: 'mouth-0', partIndex: 0, direction: 'EAST', intakeWidth: 4 * UNIT_SIZE * 0.95, mouthType: 'herbivore'});
  eyes.push({id: 'eye-0', partIndex: 0, direction: 'EAST', fov: 2.2, range: 550});

  parts.push(createPartDef('part-1', 0, 'WEST', 6, 2, 1.2, 0, 0, 0.8, 1.0));
  parts.push(createPartDef('part-2', 1, 'WEST', 7, 2, 1.2, 0, Math.PI * 0.5, 0.9, 1.0));

  const bodyCost = calculateBodyCost(parts, eyes, mouths);
  const storageTraitMultiplier = 1.0;
  const maxEnergyCapacity = calculateMaxEnergyCapacity(parts, storageTraitMultiplier);
  const {weightsIH, weightsHH, biasesH, weightsHO, biasesO} = createXavierRecurrentNetwork(customPrng);

  return {
    id: `TAD-${customPrng.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
    name: 'Paddle Tadpole',
    archetype: 'Paddle Tadpole',
    generation,
    parentIds,
    hue: sanitizeCreatureHue(45), // Golden Amber (excluded from green nutrient band)
    saturation: 90,
    lightness: 54,
    parts,
    eyes,
    mouths,
    motorFrequency: 3.2,
    motorForce: 3.0,
    weightsIH,
    weightsHH,
    biasesH,
    weightsHO,
    biasesO,
    targetClutchSize: 1 + Math.floor(customPrng.nextFloat() * 4),
    maturityAge: customPrng.range(14.0, 22.0),
    incubationTime: 9.0,
    eggReserveFraction: 0.35,
    reproductionThreshold: 0.60,
    reproductionCooldown: 16.0,
    maxLifespan: 330,
    metabolicEfficiency: 1.22,
    bodyCost,
    storageTraitMultiplier,
    maxEnergyCapacity,
  };
}

export function createHydrofoilGliderGenome(generation = 1, parentIds: string[] = [], customPrng = rng): Genome {
  const parts: PartDef[] = [];
  const eyes: SensoryEye[] = [];
  const mouths: SensoryMouth[] = [];

  parts.push(createPartDef('part-0', -1, 'EAST', 5, 4, 1.2, 0, 0, 1.0, 1.0));
  mouths.push({id: 'mouth-0', partIndex: 0, direction: 'EAST', intakeWidth: 3.5 * UNIT_SIZE, mouthType: 'omnivore'});
  eyes.push({id: 'eye-0', partIndex: 0, direction: 'EAST', fov: 2.2, range: 560});
  eyes.push({id: 'eye-1', partIndex: 0, direction: 'NORTH', fov: 1.6, range: 480});
  eyes.push({id: 'eye-2', partIndex: 0, direction: 'SOUTH', fov: 1.6, range: 480});

  parts.push(createPartDef('part-1', 0, 'WEST', 6, 2, 1.2, 0, 0, 0.8, 1.0));
  parts.push(createPartDef('part-2', 0, 'NORTH', 5, 2, 1.2, -Math.PI / 2, 0.2, 0.8, 1.0));
  parts.push(createPartDef('part-3', 0, 'SOUTH', 5, 2, 1.2, Math.PI / 2, 0.2, 0.8, 1.0));

  const bodyCost = calculateBodyCost(parts, eyes, mouths);
  const storageTraitMultiplier = 1.0;
  const maxEnergyCapacity = calculateMaxEnergyCapacity(parts, storageTraitMultiplier);
  const {weightsIH, weightsHH, biasesH, weightsHO, biasesO} = createXavierRecurrentNetwork(customPrng);

  return {
    id: `GLI-${customPrng.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
    name: 'Hydrofoil Glider',
    archetype: 'Hydrofoil Glider',
    generation,
    parentIds,
    hue: 285,
    saturation: 90,
    lightness: 60,
    parts,
    eyes,
    mouths,
    motorFrequency: 3.0,
    motorForce: 3.0,
    weightsIH,
    weightsHH,
    biasesH,
    weightsHO,
    biasesO,
    targetClutchSize: 1 + Math.floor(customPrng.nextFloat() * 4),
    maturityAge: customPrng.range(16.0, 24.0),
    incubationTime: 10.5,
    eggReserveFraction: 0.38,
    reproductionThreshold: 0.60,
    reproductionCooldown: 18.0,
    maxLifespan: 350,
    metabolicEfficiency: 1.20,
    bodyCost,
    storageTraitMultiplier,
    maxEnergyCapacity,
  };
}

export function createRandomGenome(generation = 1, parentIds: string[] = [], customPrng = rng): Genome {
  const parts: PartDef[] = [];
  const eyes: SensoryEye[] = [];
  const mouths: SensoryMouth[] = [];

  const rootN = customPrng.rangeInt(4, 6);
  const rootM = customPrng.rangeInt(3, 5);
  parts.push(createPartDef('part-0', -1, 'EAST', rootN, rootM, 1.2, 0, 0, 1.0, 1.0));

  const mouthTypesList: MouthType[] = ['herbivore', 'carnivore', 'omnivore'];
  mouths.push({
    id: 'mouth-0',
    partIndex: 0,
    direction: 'EAST',
    intakeWidth: rootM * UNIT_SIZE * 0.85,
    mouthType: mouthTypesList[customPrng.rangeInt(0, 2)],
  });

  eyes.push({
    id: 'eye-0',
    partIndex: 0,
    direction: 'EAST',
    fov: customPrng.range(1.6, 2.3),
    range: customPrng.range(480, 620),
  });

  const chainLen = customPrng.rangeInt(2, 3);
  for (let c = 1; c <= chainLen; c++) {
    const parentP = parts[c - 1];
    const pDims = generateCompliantChildDimensions('WEST', parentP.dimN, parentP.dimM, customPrng);
    parts.push(
      createPartDef(
        `part-${c}`,
        c - 1,
        'WEST',
        pDims.dimN,
        pDims.dimM,
        1.2,
        0,
        (c - 1) * Math.PI * 0.5,
        0.8,
        1.0,
      ),
    );
  }

  const bodyCost = calculateBodyCost(parts, eyes, mouths);
  const storageTraitMultiplier = customPrng.range(0.85, 1.25);
  const maxEnergyCapacity = calculateMaxEnergyCapacity(parts, storageTraitMultiplier);
  const {weightsIH, weightsHH, biasesH, weightsHO, biasesO} = createXavierRecurrentNetwork(customPrng);

  const hasCarn = mouths.some((m) => m.mouthType === 'carnivore');
  const hasOmni = mouths.some((m) => m.mouthType === 'omnivore');
  const rawHue = hasCarn
    ? customPrng.range(345, 360)
    : hasOmni
    ? customPrng.range(275, 305)
    : customPrng.nextFloat() < 0.5
    ? customPrng.range(175, 235)
    : customPrng.range(30, 55);
  const defaultHue = sanitizeCreatureHue(rawHue);

  return {
    id: `GEN-${customPrng.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
    name: hasCarn ? 'Predator Morph' : hasOmni ? 'Omnivore Morph' : 'Grazer Morph',
    archetype: hasCarn ? 'Predator Morph' : hasOmni ? 'Omnivore Morph' : 'Grazer Morph',
    generation,
    parentIds,
    hue: defaultHue,
    saturation: customPrng.range(82, 98),
    lightness: customPrng.range(52, 65),
    parts,
    eyes,
    mouths,
    motorFrequency: customPrng.range(2.8, 3.4),
    motorForce: customPrng.range(2.8, 3.4),
    weightsIH,
    weightsHH,
    biasesH,
    weightsHO,
    biasesO,
    targetClutchSize: 1 + Math.floor(customPrng.nextFloat() * 4),
    maturityAge: customPrng.range(14.0, 26.0),
    incubationTime: customPrng.range(8.0, 13.0),
    eggReserveFraction: customPrng.range(0.3, 0.45),
    reproductionThreshold: customPrng.range(0.55, 0.70),
    reproductionCooldown: customPrng.range(15.0, 22.0),
    maxLifespan: customPrng.range(280, 420),
    metabolicEfficiency: customPrng.range(1.0, 1.28),
    bodyCost,
    storageTraitMultiplier,
    maxEnergyCapacity,
  };
}

export function createArchetypeGenome(
  archetype: ArchetypeId,
  generation = 1,
  parentIds: string[] = [],
  customPrng = rng,
): Genome {
  switch (archetype) {
    case 'eel': return createEelFlagellateGenome(generation, parentIds, customPrng);
    case 'flapper': return createMantaFlapperGenome(generation, parentIds, customPrng);
    case 'tadpole': return createTadpoleCruiserGenome(generation, parentIds, customPrng);
    case 'glider': return createHydrofoilGliderGenome(generation, parentIds, customPrng);
    case 'predator': return createApexPredatorGenome(generation, parentIds, customPrng);
    case 'nematode': return createReferenceNematodeGenome();
    case 'random':
    default:
      return createRandomGenome(generation, parentIds, customPrng);
  }
}

// Structural Topology Mutation with Strict No-Wide-to-Wide Validation
export function mutateGenome(parent: Genome, severity = 0.25, customPrng: XoshiroPRNG = rng): Genome {
  const mutChance = severity;
  const mutScale = severity * 1.2;

  let parts: PartDef[] = parent.parts.map((p) => ({...p}));

  // Structural Topology Mutations: Appendage addition / pruning
  if (customPrng.nextFloat() < mutChance * 0.25 && parts.length < MAX_PARTS) {
    const attachIdx = customPrng.rangeInt(0, parts.length - 1);
    const parentP = parts[attachIdx];
    const candidateDirs: CardinalDir[] = ['WEST', 'NORTH', 'SOUTH', 'EAST'];
    const chosenDir = candidateDirs[customPrng.rangeInt(0, candidateDirs.length - 1)];
    const dims = generateCompliantChildDimensions(chosenDir, parentP.dimN, parentP.dimM, customPrng);
    if (isValidAttachment(chosenDir, parentP.dimN, parentP.dimM, dims.dimN, dims.dimM)) {
      parts.push(createPartDef(`part-${parts.length}`, attachIdx, chosenDir, dims.dimN, dims.dimM, 2.0, 0, customPrng.range(0, Math.PI * 2), 1.2, 1.0));
    }
  } else if (customPrng.nextFloat() < mutChance * 0.15 && parts.length > 2) {
    // Prune leaf part safely
    const isLeaf = (idx: number) => !parts.some((p) => p.parentIndex === idx);
    const leafIndices = parts.map((_, i) => i).filter((i) => i > 0 && isLeaf(i));
    if (leafIndices.length > 0) {
      const pruneIdx = leafIndices[leafIndices.length - 1];
      parts.splice(pruneIdx, 1);
      // Remap parent indices
      parts = parts.map((p) => ({
        ...p,
        parentIndex: p.parentIndex >= pruneIdx ? Math.max(0, p.parentIndex - 1) : p.parentIndex,
      }));
    }
  }

  // Segment dimension & CPG mutations
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    let newN = p.dimN;
    let newM = p.dimM;
    let dimChanged = false;

    if (customPrng.nextFloat() < mutChance) {
      newN = clampVal(newN + (customPrng.nextFloat() < 0.5 ? -1 : 1), 1, 10);
      dimChanged = true;
    }
    if (customPrng.nextFloat() < mutChance) {
      newM = clampVal(newM + (customPrng.nextFloat() < 0.5 ? -1 : 1), 1, 10);
      dimChanged = true;
    }

    if (dimChanged) {
      let valid = true;
      if (i > 0) {
        const parentIdx = Math.max(0, Math.min(i - 1, p.parentIndex));
        const parentP = parts[parentIdx];
        if (!isValidAttachment(p.attachmentPoint, parentP.dimN, parentP.dimM, newN, newM)) {
          valid = false;
        }
      }
      if (valid) {
        p.dimN = newN;
        p.dimM = newM;
        p.width = newN * UNIT_SIZE;
        p.height = newM * UNIT_SIZE;
      }
    }

    p.maxAngle = clampVal(p.maxAngle + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.2, 0.2) * mutScale : 0), 0.8, 2.35);
    p.cpgPhaseOffset = (p.cpgPhaseOffset + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.4, 0.4) * mutScale : 0) + Math.PI * 2) % (Math.PI * 2);
    p.cpgAmp = clampVal(p.cpgAmp + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.2, 0.2) * mutScale : 0), 0.5, 2.6);
    p.cpgFreqMult = clampVal(p.cpgFreqMult + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.2, 0.2) * mutScale : 0), 0.5, 2.5);
  }

  // Sensory Eyes mutations
  let eyes: SensoryEye[] = parent.eyes.map((eye) => ({
    ...eye,
    partIndex: Math.min(eye.partIndex, parts.length - 1),
    fov: clampVal(eye.fov + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.2, 0.2) * mutScale : 0), 0.8, 2.4),
    range: clampVal(eye.range + (customPrng.nextFloat() < mutChance ? customPrng.range(-30, 30) * mutScale : 0), 280, 680),
  }));

  const cardinalDirs: CardinalDir[] = ['EAST', 'WEST', 'NORTH', 'SOUTH'];
  if (customPrng.nextFloat() < mutChance * 0.25 && eyes.length < 5) {
    const pIdx = customPrng.rangeInt(0, parts.length - 1);
    const dir = cardinalDirs[customPrng.rangeInt(0, cardinalDirs.length - 1)];
    eyes.push({
      id: `eye-${customPrng.nextUint32().toString(36)}`,
      partIndex: pIdx,
      direction: dir,
      fov: customPrng.range(1.5, 2.3),
      range: customPrng.range(450, 620),
    });
  } else if (customPrng.nextFloat() < mutChance * 0.15 && eyes.length > 1) {
    eyes.pop();
  }

  // Sensory Mouths mutations
  const mouthTypesList: MouthType[] = ['herbivore', 'carnivore', 'omnivore'];
  let mouths: SensoryMouth[] = parent.mouths.map((m) => {
    let mutatedType: MouthType = m.mouthType || 'herbivore';
    if (customPrng.nextFloat() < mutChance * 0.18) {
      const candidates = mouthTypesList.filter((t) => t !== mutatedType);
      mutatedType = candidates[customPrng.rangeInt(0, candidates.length - 1)];
    }
    return {
      ...m,
      partIndex: Math.min(m.partIndex, parts.length - 1),
      mouthType: mutatedType,
      intakeWidth: clampVal(m.intakeWidth + (customPrng.nextFloat() < mutChance ? customPrng.range(-2, 2) * mutScale : 0), 10, 38),
    };
  });

  if (customPrng.nextFloat() < mutChance * 0.20 && mouths.length < 3) {
    const pIdx = customPrng.rangeInt(0, parts.length - 1);
    const dir = cardinalDirs[customPrng.rangeInt(0, cardinalDirs.length - 1)];
    const chosenType = mouthTypesList[customPrng.rangeInt(0, mouthTypesList.length - 1)];
    mouths.push({
      id: `mouth-${customPrng.nextUint32().toString(36)}`,
      partIndex: pIdx,
      direction: dir,
      intakeWidth: customPrng.range(14, 28),
      mouthType: chosenType,
    });
  } else if (customPrng.nextFloat() < mutChance * 0.12 && mouths.length > 1) {
    mouths.pop();
  }

  // Neural Weights Mutations
  const weightsIH = parent.weightsIH.map((row) =>
    row.map((w) =>
      customPrng.nextFloat() < mutChance ? clampVal(w + customPrng.range(-0.3, 0.3) * mutScale, -3.5, 3.5) : w,
    ),
  );
  const weightsHH = parent.weightsHH.map((row) =>
    row.map((w) =>
      customPrng.nextFloat() < mutChance ? clampVal(w + customPrng.range(-0.25, 0.25) * mutScale, -3.0, 3.0) : w,
    ),
  );
  const biasesH = parent.biasesH.map((b) =>
    customPrng.nextFloat() < mutChance ? clampVal(b + customPrng.range(-0.15, 0.15) * mutScale, -1.5, 1.5) : b,
  );
  const weightsHO = parent.weightsHO.map((row) =>
    row.map((w) =>
      customPrng.nextFloat() < mutChance ? clampVal(w + customPrng.range(-0.3, 0.3) * mutScale, -3.5, 3.5) : w,
    ),
  );
  const biasesO = parent.biasesO.map((b) =>
    customPrng.nextFloat() < mutChance ? clampVal(b + customPrng.range(-0.15, 0.15) * mutScale, -1.5, 1.5) : b,
  );

  // Storage trait multiplier mutation
  const storageTraitMultiplier = clampVal(
    (parent.storageTraitMultiplier || 1.0) + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.1, 0.1) * mutScale : 0),
    0.8,
    2.0,
  );
  const bodyCost = calculateBodyCost(parts, eyes, mouths);
  const maxEnergyCapacity = calculateMaxEnergyCapacity(parts, storageTraitMultiplier);

  const hasCarnivoreMouth = mouths.some((m) => m.mouthType === 'carnivore');
  const hasOmnivoreMouth = mouths.some((m) => m.mouthType === 'omnivore');

  let newHue = (parent.hue + (customPrng.nextFloat() < mutChance ? customPrng.range(-20, 20) : 0) + 360) % 360;
  if (hasCarnivoreMouth && customPrng.nextFloat() < 0.3) {
    newHue = customPrng.range(345, 360);
  } else if (hasOmnivoreMouth && customPrng.nextFloat() < 0.3) {
    newHue = customPrng.range(275, 305);
  }
  newHue = sanitizeCreatureHue(newHue);

  // Heritable Target Clutch Size (mutates ±1, range 1..6)
  let mutatedTargetClutchSize = parent.targetClutchSize || 2;
  if (customPrng.nextFloat() < mutChance) {
    const clutchDelta = customPrng.nextFloat() < 0.5 ? -1 : 1;
    mutatedTargetClutchSize = clampVal(mutatedTargetClutchSize + clutchDelta, 1, 6);
  }

  // Heritable Maturity Age (mutates ±1.0..3.0s, range 10.0..45.0s)
  let mutatedMaturityAge = parent.maturityAge || 20.0;
  if (customPrng.nextFloat() < mutChance) {
    const ageDelta = customPrng.range(-3.0, 3.0) * mutScale;
    mutatedMaturityAge = clampVal(mutatedMaturityAge + ageDelta, 10.0, 45.0);
  }

  return {
    id: `GEN-${customPrng.nextUint32().toString(36).substring(0, 5).toUpperCase()}`,
    name: parent.name,
    archetype: parent.archetype,
    generation: parent.generation + 1,
    parentIds: [parent.id],
    hue: newHue,
    saturation: clampVal(parent.saturation + (customPrng.nextFloat() < mutChance ? customPrng.range(-4, 4) : 0), 65, 100),
    lightness: clampVal(parent.lightness + (customPrng.nextFloat() < mutChance ? customPrng.range(-4, 4) : 0), 45, 72),
    parts,
    eyes,
    mouths,
    motorFrequency: clampVal(parent.motorFrequency + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.3, 0.3) * mutScale : 0), 1.8, 5.2),
    motorForce: clampVal(parent.motorForce + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.5, 0.5) * mutScale : 0), 8.0, 19.5),
    weightsIH,
    weightsHH,
    biasesH,
    weightsHO,
    biasesO,
    targetClutchSize: mutatedTargetClutchSize,
    maturityAge: mutatedMaturityAge,
    incubationTime: clampVal(parent.incubationTime + (customPrng.nextFloat() < mutChance ? customPrng.range(-1, 1) : 0), 5.0, 20.0),
    eggReserveFraction: clampVal(parent.eggReserveFraction + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.05, 0.05) : 0), 0.2, 0.55),
    reproductionThreshold: clampVal(parent.reproductionThreshold + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.04, 0.04) : 0), 0.50, 0.80),
    reproductionCooldown: clampVal(parent.reproductionCooldown + (customPrng.nextFloat() < mutChance ? customPrng.range(-1, 1) : 0), 12.0, 25.0),
    maxLifespan: clampVal(parent.maxLifespan + (customPrng.nextFloat() < mutChance ? customPrng.range(-20, 20) : 0), 220, 550),
    metabolicEfficiency: clampVal(parent.metabolicEfficiency + (customPrng.nextFloat() < mutChance ? customPrng.range(-0.05, 0.05) : 0), 0.85, 1.35),
    bodyCost,
    storageTraitMultiplier,
    maxEnergyCapacity,
  };
}

export function spawnOrganism(
  genome: Genome,
  x: number,
  y: number,
  heading = 0,
  clutchId?: string,
  startingReserve?: number,
): Organism {
  const segments: PartPhys[] = [];
  const joints: JointState[] = [];
  const partCount = genome.parts.length;

  segments.push({
    x,
    y,
    vx: 0,
    vy: 0,
    angle: isNaN(heading) ? 0 : heading,
    angVel: 0,
  });

  for (let i = 1; i < partCount; i++) {
    const pDef = genome.parts[i];
    const parentIdx = Math.max(0, Math.min(i - 1, pDef.parentIndex));
    const parentPhys = segments[parentIdx];
    const parentDef = genome.parts[parentIdx];

    const parentCos = Math.cos(parentPhys.angle);
    const parentSin = Math.sin(parentPhys.angle);
    const parentAnchorLocal = getCardinalAnchor(pDef.attachmentPoint, parentDef.width, parentDef.height);

    const anchorWorldX = parentPhys.x + parentCos * parentAnchorLocal.x - parentSin * parentAnchorLocal.y;
    const anchorWorldY = parentPhys.y + parentSin * parentAnchorLocal.x + parentCos * parentAnchorLocal.y;

    const childAngle = parentPhys.angle + (pDef.baseAngleOffset || 0);
    const childCos = Math.cos(childAngle);
    const childSin = Math.sin(childAngle);

    const childAnchorLocal = getChildAnchorForParentDir(pDef.attachmentPoint, pDef.width, pDef.height);
    const childComX = anchorWorldX - (childCos * childAnchorLocal.x - childSin * childAnchorLocal.y);
    const childComY = anchorWorldY - (childSin * childAnchorLocal.x + childCos * childAnchorLocal.y);

    segments.push({
      x: isNaN(childComX) ? x : childComX,
      y: isNaN(childComY) ? y : childComY,
      vx: 0,
      vy: 0,
      angle: isNaN(childAngle) ? 0 : childAngle,
      angVel: 0,
    });

    joints.push({
      phase: pDef.cpgPhaseOffset || 0,
      targetAngle: 0,
      currentRelAngle: 0,
      currentRelAngVel: 0,
      appliedTorque: 0,
      stiffness: 1.0,
    });
  }

  // Set default starting reserve: 10,000 J for founder, or funded reserve for hatchlings
  const initialReserve = startingReserve !== undefined
    ? Math.max(0.0, startingReserve)
    : (genome.generation === 1 ? FOUNDER_DEFAULT_RESERVE : Math.max(1000.0, genome.maxEnergyCapacity * 0.15));

  return {
    id: `ORG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    clutchId,
    genome,
    segments,
    joints,
    energy: initialReserve,
    structuralBiomass: genome.bodyCost,
    basalEnergyRate: 0,
    sensoryEnergyRate: 0,
    motorEnergyRate: 0,
    totalEnergyRate: 0,
    age: 0,
    maxLifespan: genome.maxLifespan || 340,
    foodEaten: 0,
    preyEaten: 0,
    eggsPredated: 0,
    offspringCount: 0,
    clutchesLaid: 0,
    isGravid: false,
    lastReproductionAge: 0,
    lastReproductionTime: 0,
    distanceTraveled: 0,
    speed: 0,
    neuralInputs: new Array(NUM_INPUTS).fill(0),
    neuralHidden: new Array(NUM_HIDDEN).fill(0),
    neuralOutputs: new Array(MAX_OUTPUTS).fill(0),
    rayHits: [],
    glowPulse: 0,
    dissolving: false,
    dissolveAlpha: 1.0,
    isFeedingHighlight: 0,
    traceHistory: [],
    recentFeedings: [],
  };
}

export function calculateOrganismCOM(org: Organism): {x: number; y: number; totalMass: number; vxCOM: number; vyCOM: number} {
  let totalMass = 0;
  let weightedX = 0;
  let weightedY = 0;
  let weightedVx = 0;
  let weightedVy = 0;

  for (let i = 0; i < org.segments.length; i++) {
    const pDef = org.genome.parts[i];
    const m = Math.max(0.35, pDef.dimN * pDef.dimM * BASE_PART_DENSITY);
    totalMass += m;
    weightedX += org.segments[i].x * m;
    weightedY += org.segments[i].y * m;
    weightedVx += org.segments[i].vx * m;
    weightedVy += org.segments[i].vy * m;
  }

  return {
    x: totalMass > 0 ? weightedX / totalMass : org.segments[0].x,
    y: totalMass > 0 ? weightedY / totalMass : org.segments[0].y,
    totalMass,
    vxCOM: totalMass > 0 ? weightedVx / totalMass : 0,
    vyCOM: totalMass > 0 ? weightedVy / totalMass : 0,
  };
}

// Geometric Intersections
export function lineIntersection(
  p1x: number, p1y: number, p2x: number, p2y: number,
  p3x: number, p3y: number, p4x: number, p4y: number,
): {hit: boolean; t: number; u: number; x: number; y: number} {
  const denom = (p1x - p2x) * (p3y - p4y) - (p1y - p2y) * (p3x - p4x);
  if (Math.abs(denom) < 1e-6) return {hit: false, t: 0, u: 0, x: 0, y: 0};

  const t = ((p1x - p3x) * (p3y - p4y) - (p1y - p3y) * (p3x - p4x)) / denom;
  const u = -((p1x - p2x) * (p1y - p3y) - (p1y - p2y) * (p1x - p3x)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {hit: true, t, u, x: p1x + t * (p2x - p1x), y: p1y + t * (p2y - p1y)};
  }
  return {hit: false, t: 0, u: 0, x: 0, y: 0};
}

export function rayCircleIntersection(
  rayOriginX: number, rayOriginY: number,
  rayDirX: number, rayDirY: number, rayMaxLen: number,
  circleX: number, circleY: number, radius: number,
): {hit: boolean; dist: number; pointX: number; pointY: number} {
  const ocX = rayOriginX - circleX;
  const ocY = rayOriginY - circleY;
  const b = ocX * rayDirX + ocY * rayDirY;
  const c = ocX * ocX + ocY * ocY - radius * radius;
  const discriminant = b * b - c;

  if (discriminant < 0) return {hit: false, dist: 0, pointX: 0, pointY: 0};

  const sqrtDisc = Math.sqrt(discriminant);
  let t = -b - sqrtDisc;
  if (t < 0) t = -b + sqrtDisc;

  if (t >= 0 && t <= rayMaxLen) {
    return {
      hit: true,
      dist: t,
      pointX: rayOriginX + rayDirX * t,
      pointY: rayOriginY + rayDirY * t,
    };
  }
  return {hit: false, dist: 0, pointX: 0, pointY: 0};
}

export function getPartCornerVertices(phys: PartPhys, def: PartDef): Array<{x: number; y: number}> {
  const halfW = def.width * 0.5;
  const halfH = def.height * 0.5;
  const cosA = Math.cos(phys.angle);
  const sinA = Math.sin(phys.angle);

  return [
    {x: phys.x + cosA * halfW - sinA * halfH, y: phys.y + sinA * halfW + cosA * halfH},
    {x: phys.x - cosA * halfW - sinA * halfH, y: phys.y - sinA * halfW + cosA * halfH},
    {x: phys.x - cosA * halfW + sinA * halfH, y: phys.y - sinA * halfW - cosA * halfH},
    {x: phys.x + cosA * halfW + sinA * halfH, y: phys.y + sinA * halfW - cosA * halfH},
  ];
}

export function distPointToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  const t = clampVal(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1);
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

// Convert HSL to RGB (0..1)
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = (h % 360) / 360;
  s = s / 100;
  l = l / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r, g, b];
}

// ============================================================================
// 3. AUTHORITATIVE MODULAR SIMULATION KERNEL (`stepSimulation`)
// ============================================================================
export function stepSimulation(
  state: SimulationState,
  settings: SimulationSettings,
  dt: number,
  onEvent?: (type: 'birth' | 'death' | 'eat' | 'clash' | 'egg_loss') => void,
): void {
  const mu = settings.waterViscosity ?? 0.22;
  const worldWidth = settings.worldWidth;
  const worldHeight = settings.worldHeight;
  const targetNutrientsVal = settings.targetNutrients ?? 800;
  const inflowRateVal = settings.inflowRate ?? 15;
  const isKinshipProtected = settings.kinshipProtection ?? true;
  const mutationSeverity = settings.mutationSeverity ?? 0.25;
  const gravity = settings.gravity ?? 0;

  state.simTime += dt;
  const organisms = state.organisms;
  const eggs = state.eggs;
  const nutrients = state.nutrients;
  const bubbles = state.bubbles;
  const caustics = state.caustics;
  const ledger = state.ledger;
  const prng = state.prng;

  // 1. Environmental Nutrient Inflow
  if (nutrients.length >= targetNutrientsVal || inflowRateVal <= 0) {
    state.nutrientAccumulator = 0;
  } else {
    state.nutrientAccumulator += inflowRateVal * dt;
    if (state.nutrientAccumulator >= 1.0) {
      const spawnCount = Math.min(
        Math.floor(state.nutrientAccumulator),
        targetNutrientsVal - nutrients.length,
        2200 - nutrients.length,
      );
      state.nutrientAccumulator -= spawnCount;

      for (let n = 0; n < spawnCount; n++) {
        nutrients.push({
          id: `NUT-${prng.nextUint32().toString(36)}`,
          x: prng.range(40, worldWidth - 40),
          y: prng.range(40, worldHeight - 40),
          vx: 0,
          vy: 0,
          energyValue: NUTRIENT_ENERGY_VALUE,
          radius: getNutrientRadius(NUTRIENT_ENERGY_VALUE),
          bottomTimer: 0,
          pulseTimer: prng.range(0, Math.PI * 2),
        });
        ledger.externalInflow += NUTRIENT_ENERGY_VALUE;
      }
    }
  }

  // 2. Nutrients Motion
  const fluidDampingExp = Math.exp(-mu * 12.0 * dt);
  for (let i = 0; i < nutrients.length; i++) {
    const nut = nutrients[i];
    nut.vy += gravity * 20.0 * dt;
    nut.vx *= fluidDampingExp;
    nut.vy *= fluidDampingExp;
    nut.x += nut.vx * dt;
    nut.y += nut.vy * dt;
    nut.pulseTimer = (nut.pulseTimer || 0) + dt * (nut.isSuper ? 4.0 : 2.5);

    if (nut.x < 35) { nut.x = 35; nut.vx = 0; }
    if (nut.x > worldWidth - 35) { nut.x = worldWidth - 35; nut.vx = 0; }
    if (nut.y < 35) { nut.y = 35; nut.vy = 0; }
    if (nut.y > worldHeight - 35) { nut.y = worldHeight - 35; nut.vy = 0; }
  }

  // 3. Caustics
  for (const c of caustics) {
    c.angle += c.speed * dt;
    c.x += Math.cos(c.angle) * 12 * dt;
    c.y += Math.sin(c.angle) * 12 * dt;
    if (c.x < 0) c.x = worldWidth;
    if (c.x > worldWidth) c.x = 0;
    if (c.y < 0) c.y = worldHeight;
    if (c.y > worldHeight) c.y = 0;
  }

  // 4. Incubating Multi-Egg Clutches (Full energy accounting: non-viable damaged eggs decompose without duplicate hatching)
  for (let i = eggs.length - 1; i >= 0; i--) {
    const egg = eggs[i];
    egg.incubationProgress = Math.min(1.0, egg.incubationProgress + dt / egg.totalIncubationTime);
    egg.pulseTimer += dt * 4.5;
    egg.vy += gravity * 30.0 * dt;
    egg.vx *= fluidDampingExp;
    egg.vy *= fluidDampingExp;

    egg.x += egg.vx * dt;
    egg.y += egg.vy * dt;

    if (egg.x < 35) { egg.x = 35; egg.vx = 0; }
    if (egg.x > worldWidth - 35) { egg.x = worldWidth - 35; egg.vx = 0; }
    if (egg.y < 35) { egg.y = 35; egg.vy = 0; }
    if (egg.y > worldHeight - 35) { egg.y = worldHeight - 35; egg.vy = 0; }

    const remainingEggEnergy = egg.fundedStructural + egg.fundedReserve;

    // Check viability at completion
    if (egg.incubationProgress >= 1.0) {
      const requiredBodyCost = egg.genome.bodyCost;

      if (remainingEggEnergy < requiredBodyCost) {
        // Nonviable egg due to predation/starvation: decompose into nutrient particle
        if (remainingEggEnergy > 5.0 && nutrients.length < 2200) {
          nutrients.push({
            id: `NUT-${prng.nextUint32().toString(36)}`,
            x: egg.x,
            y: egg.y,
            vx: 0,
            vy: 0,
            energyValue: remainingEggEnergy,
            radius: getNutrientRadius(remainingEggEnergy),
            bottomTimer: 0,
            pulseTimer: prng.range(0, Math.PI * 2),
          });
        } else {
          ledger.recordedLosses += remainingEggEnergy;
        }
        eggs.splice(i, 1);
        if (onEvent) onEvent('egg_loss');
        continue;
      }

      // Successful Hatching: Exactly fundedStructural becomes structural biomass, remaining becomes usable reserve
      egg.readyToHatch = true;
      if (organisms.length < (settings.maxOrganisms ?? 50)) {
        const startingUsableReserve = remainingEggEnergy - requiredBodyCost;
        const baby = spawnOrganism(
          egg.genome,
          egg.x,
          egg.y,
          prng.range(0, Math.PI * 2),
          egg.clutchId,
          startingUsableReserve,
        );
        baby.structuralBiomass = requiredBodyCost;
        organisms.push(baby);
        state.totalBirths += 1;

        state.lineage.set(baby.id, {
          id: baby.id,
          parentIds: baby.genome.parentIds || [],
          generation: baby.genome.generation,
          birthTime: state.simTime,
          offspringCount: 0,
          archetype: baby.genome.archetype || 'Offspring',
          hue: baby.genome.hue,
          diet: getDietClassification(baby.genome.mouths).label,
          genome: baby.genome,
        });

        eggs.splice(i, 1);
        if (onEvent) onEvent('birth');
      }
    }
  }

  // 5. Organisms Simulation
  for (let orgIdx = organisms.length - 1; orgIdx >= 0; orgIdx--) {
    const org = organisms[orgIdx];
    const g = org.genome;

    if (org.dissolving) {
      org.dissolveAlpha -= dt * 1.5;
      if (org.dissolveAlpha <= 0) {
        const deadPos = org.segments[0];
        const totalRemainingEnergy = Math.max(0, org.structuralBiomass) + Math.max(0, org.energy);
        const fullNutrientCount = Math.floor(totalRemainingEnergy / NUTRIENT_ENERGY_VALUE);
        const remainderFraction = totalRemainingEnergy - fullNutrientCount * NUTRIENT_ENERGY_VALUE;
        let returnedEnergy = 0;

        for (let d = 0; d < fullNutrientCount; d++) {
          if (nutrients.length >= 2200) break;
          const angle = (d / Math.max(1, fullNutrientCount)) * Math.PI * 2;
          nutrients.push({
            id: `NUT-${prng.nextUint32().toString(36)}`,
            x: clampVal(deadPos.x + Math.cos(angle) * 16, 40, worldWidth - 40),
            y: clampVal(deadPos.y + Math.sin(angle) * 16, 40, worldHeight - 40),
            vx: 0,
            vy: 0,
            energyValue: NUTRIENT_ENERGY_VALUE,
            radius: getNutrientRadius(NUTRIENT_ENERGY_VALUE),
            bottomTimer: 0,
            pulseTimer: prng.range(0, Math.PI * 2),
          });
          returnedEnergy += NUTRIENT_ENERGY_VALUE;
        }

        if (remainderFraction > 5.0 && nutrients.length < 2200) {
          nutrients.push({
            id: `NUT-${prng.nextUint32().toString(36)}`,
            x: deadPos.x,
            y: deadPos.y,
            vx: 0,
            vy: 0,
            energyValue: remainderFraction,
            radius: getNutrientRadius(remainderFraction),
            bottomTimer: 0,
            pulseTimer: prng.range(0, Math.PI * 2),
          });
          returnedEnergy += remainderFraction;
        }
        ledger.recordedLosses += totalRemainingEnergy - returnedEnergy;

        const cause: DeathCause = org.deathCause || (org.age >= org.maxLifespan ? 'Old Age' : org.energy <= 0 ? 'Starvation' : 'Predation');
        const rec = state.lineage.get(org.id);
        if (rec) {
          rec.deathTime = state.simTime;
          rec.deathCause = cause;
          rec.deathAge = org.age;
          rec.deathEnergy = Math.max(0, org.energy);
        }

        if (!state.recentDeaths) state.recentDeaths = [];
        state.recentDeaths.unshift({
          id: org.id,
          name: org.genome.name || org.id,
          generation: org.genome.generation,
          cause,
          age: org.age,
          energyAtDeath: Math.max(0, org.energy),
          offspringCount: org.offspringCount,
          timestamp: state.simTime,
        });
        if (state.recentDeaths.length > 30) state.recentDeaths.pop();

        organisms.splice(orgIdx, 1);
        state.totalDeaths += 1;
        if (onEvent) onEvent('death');
      }
      continue;
    }

    org.age += dt;
    org.glowPulse += dt * 3.5;
    if (org.isFeedingHighlight > 0) {
      org.isFeedingHighlight = Math.max(0, org.isFeedingHighlight - dt);
    }

    // Trace breadcrumbs
    if (!org.traceHistory) org.traceHistory = [];
    if (org.traceHistory.length === 0 || Math.hypot(org.segments[0].x - org.traceHistory[org.traceHistory.length - 1].x, org.segments[0].y - org.traceHistory[org.traceHistory.length - 1].y) > 12) {
      org.traceHistory.push({x: org.segments[0].x, y: org.segments[0].y, time: state.simTime});
      if (org.traceHistory.length > 30) org.traceHistory.shift();
    }

    // A. MULTI-EYE OPTICAL RGB RAYCAST WITH WATER ATTENUATION
    org.rayHits = [];
    let rayInputIdx = 0;
    const totalEyes = g.eyes.length;

    for (let eIdx = 0; eIdx < totalEyes; eIdx++) {
      const eye = g.eyes[eIdx];
      const eyePartIdx = Math.min(eye.partIndex, org.segments.length - 1);
      const eyePhys = org.segments[eyePartIdx];
      const eyeDef = g.parts[eyePartIdx];

      const eyeAnchorLocal = getCardinalAnchor(eye.direction, eyeDef.width, eyeDef.height);
      const cosA = Math.cos(eyePhys.angle);
      const sinA = Math.sin(eyePhys.angle);
      const eyeWorldX = eyePhys.x + cosA * eyeAnchorLocal.x - sinA * eyeAnchorLocal.y;
      const eyeWorldY = eyePhys.y + sinA * eyeAnchorLocal.x + cosA * eyeAnchorLocal.y;

      const baseHeading = eyePhys.angle + getCardinalBaseAngle(eye.direction);
      const fov = eye.fov;
      const maxRange = eye.range;
      const raysToCast = totalEyes === 1 ? 5 : Math.max(2, Math.floor(6 / totalEyes));

      for (let r = 0; r < raysToCast; r++) {
        const rayOffset = raysToCast > 1 ? (r / (raysToCast - 1) - 0.5) * fov : 0;
        const rayAngle = baseHeading + rayOffset;
        const rayDirX = Math.cos(rayAngle);
        const rayDirY = Math.sin(rayAngle);

        let closestDist = maxRange;
        let hitHit = false;
        let hitX = eyeWorldX + rayDirX * maxRange;
        let hitY = eyeWorldY + rayDirY * maxRange;
        let hitR = WATER_AMBIENT_RGB[0];
        let hitG = WATER_AMBIENT_RGB[1];
        let hitB = WATER_AMBIENT_RGB[2];
        let hitType: RayHit['objectType'] = 'none';

        // 1. Tank Boundary Walls
        if (rayDirX < -1e-5) {
          const t = (0 - eyeWorldX) / rayDirX;
          if (t > 0 && t < closestDist) {
            const yHit = eyeWorldY + rayDirY * t;
            if (yHit >= 0 && yHit <= worldHeight) {
              closestDist = t; hitHit = true; hitX = 0; hitY = yHit;
              hitR = 0.02; hitG = 0.71; hitB = 0.83; hitType = 'wall';
            }
          }
        }
        if (rayDirX > 1e-5) {
          const t = (worldWidth - eyeWorldX) / rayDirX;
          if (t > 0 && t < closestDist) {
            const yHit = eyeWorldY + rayDirY * t;
            if (yHit >= 0 && yHit <= worldHeight) {
              closestDist = t; hitHit = true; hitX = worldWidth; hitY = yHit;
              hitR = 0.02; hitG = 0.71; hitB = 0.83; hitType = 'wall';
            }
          }
        }
        if (rayDirY < -1e-5) {
          const t = (0 - eyeWorldY) / rayDirY;
          if (t > 0 && t < closestDist) {
            const xHit = eyeWorldX + rayDirX * t;
            if (xHit >= 0 && xHit <= worldWidth) {
              closestDist = t; hitHit = true; hitX = xHit; hitY = 0;
              hitR = 0.02; hitG = 0.71; hitB = 0.83; hitType = 'wall';
            }
          }
        }
        if (rayDirY > 1e-5) {
          const t = (worldHeight - eyeWorldY) / rayDirY;
          if (t > 0 && t < closestDist) {
            const xHit = eyeWorldX + rayDirX * t;
            if (xHit >= 0 && xHit <= worldWidth) {
              closestDist = t; hitHit = true; hitX = xHit; hitY = worldHeight;
              hitR = 0.02; hitG = 0.71; hitB = 0.83; hitType = 'wall';
            }
          }
        }

        // 2. Nutrients
        for (let n = 0; n < nutrients.length; n++) {
          const nut = nutrients[n];
          if (Math.abs(nut.x - eyeWorldX) > closestDist + nut.radius || Math.abs(nut.y - eyeWorldY) > closestDist + nut.radius) continue;
          const res = rayCircleIntersection(eyeWorldX, eyeWorldY, rayDirX, rayDirY, closestDist, nut.x, nut.y, nut.radius);
          if (res.hit && res.dist < closestDist) {
            closestDist = res.dist; hitHit = true; hitX = res.pointX; hitY = res.pointY;
            hitR = 0.10; hitG = 0.95; hitB = 0.40; hitType = 'nutrient';
          }
        }

        // 3. Incubating Eggs
        for (let e = 0; e < eggs.length; e++) {
          const egg = eggs[e];
          if (Math.abs(egg.x - eyeWorldX) > closestDist + 24 || Math.abs(egg.y - eyeWorldY) > closestDist + 24) continue;
          const res = rayCircleIntersection(eyeWorldX, eyeWorldY, rayDirX, rayDirY, closestDist, egg.x, egg.y, 16.0);
          if (res.hit && res.dist < closestDist) {
            closestDist = res.dist; hitHit = true; hitX = res.pointX; hitY = res.pointY;
            hitR = 0.95; hitG = 0.75; hitB = 0.15; hitType = 'egg';
          }
        }

        // 4. Organisms with Exact Surface Colors (Self-Vision Exemption: eyes never see own body segments)
        for (let o = 0; o < organisms.length; o++) {
          const other = organisms[o];
          if (other.id === org.id || other.dissolving) continue; // Creature NEVER intersects its own body

          const [oR, oG, oB] = hslToRgb(other.genome.hue, other.genome.saturation, other.genome.lightness);

          for (let s = 0; s < other.segments.length; s++) {
            const otherSeg = other.segments[s];
            const otherDef = other.genome.parts[s];
            if (Math.abs(otherSeg.x - eyeWorldX) > closestDist + 50 || Math.abs(otherSeg.y - eyeWorldY) > closestDist + 50) continue;

            const corners = getPartCornerVertices(otherSeg, otherDef);
            for (let c = 0; c < 4; c++) {
              const c1 = corners[c];
              const c2 = corners[(c + 1) % 4];
              const inter = lineIntersection(
                eyeWorldX, eyeWorldY,
                eyeWorldX + rayDirX * closestDist, eyeWorldY + rayDirY * closestDist,
                c1.x, c1.y, c2.x, c2.y,
              );
              if (inter.hit) {
                const dist = Math.hypot(inter.x - eyeWorldX, inter.y - eyeWorldY);
                if (dist < closestDist) {
                  closestDist = dist; hitHit = true; hitX = inter.x; hitY = inter.y;
                  hitR = oR; hitG = oG; hitB = oB; hitType = 'creature';
                }
              }
            }
          }
        }

        // Realistic Optical Distance Attenuation: C_perceived = (1 - e^(-alpha*d))*C_water + e^(-alpha*d)*C_surface
        const alpha = 1.0 / (maxRange * 0.55);
        const expTerm = Math.exp(-alpha * closestDist);
        const finalR = (1 - expTerm) * WATER_AMBIENT_RGB[0] + expTerm * hitR;
        const finalG = (1 - expTerm) * WATER_AMBIENT_RGB[1] + expTerm * hitG;
        const finalB = (1 - expTerm) * WATER_AMBIENT_RGB[2] + expTerm * hitB;

        if (rayInputIdx < NUM_INPUT_RAYS * 3) {
          org.neuralInputs[rayInputIdx++] = finalR;
          org.neuralInputs[rayInputIdx++] = finalG;
          org.neuralInputs[rayInputIdx++] = finalB;
        }

        org.rayHits.push({
          hit: hitHit,
          dist: closestDist,
          pointX: hitX,
          pointY: hitY,
          r: finalR,
          g: finalG,
          b: finalB,
          objectType: hitType,
        });
      }
    }

    while (rayInputIdx < NUM_INPUT_RAYS * 3) {
      org.neuralInputs[rayInputIdx++] = WATER_AMBIENT_RGB[rayInputIdx % 3];
    }

    // Proprioception
    org.neuralInputs[15] = org.joints[0] ? org.joints[0].currentRelAngle : 0;
    org.neuralInputs[16] = org.joints[1] ? org.joints[1].currentRelAngle : 0;
    org.neuralInputs[17] = org.joints[2] ? org.joints[2].currentRelAngle : 0;
    org.neuralInputs[18] = clampVal(org.speed / 60, 0, 1);
    org.neuralInputs[19] = clampVal(org.energy / Math.max(1.0, g.maxEnergyCapacity), 0, 1);

    const masterPhase = org.joints[0] ? org.joints[0].phase : 0;
    org.neuralInputs[20] = Math.sin(masterPhase);
    org.neuralInputs[21] = Math.cos(masterPhase);

    // B. RECURRENT NEURAL EVALUATION (h_t = tanh(W_in * x_t + W_rec * h_{t-1} + b))
    for (let h = 0; h < NUM_HIDDEN; h++) {
      scratchPrevHidden[h] = org.neuralHidden[h] || 0;
    }

    for (let h = 0; h < NUM_HIDDEN; h++) {
      let sum = g.biasesH[h] || 0;
      for (let inp = 0; inp < NUM_INPUTS; inp++) {
        sum += (org.neuralInputs[inp] || 0) * (g.weightsIH[h]?.[inp] || 0);
      }
      for (let rh = 0; rh < NUM_HIDDEN; rh++) {
        sum += scratchPrevHidden[rh] * (g.weightsHH[h]?.[rh] || 0);
      }
      org.neuralHidden[h] = isNaN(sum) ? 0 : Math.tanh(sum);
    }

    const numJoints = org.segments.length - 1;
    for (let o = 0; o < numJoints * OUTPUTS_PER_JOINT; o++) {
      let sum = g.biasesO[o] || 0;
      for (let h = 0; h < NUM_HIDDEN; h++) {
        sum += org.neuralHidden[h] * (g.weightsHO[o]?.[h] || 0);
      }
      org.neuralOutputs[o] = isNaN(sum) ? 0 : Math.tanh(sum);
    }

    // C. RIGID BODY HYDRODYNAMICS & 4-CHANNEL MOTOR ACTUATION ACROSS 4 SUBSTEPS
    const partCount = org.segments.length;
    for (let i = 0; i < partCount; i++) {
      const pDef = g.parts[i];
      const mass = Math.max(0.35, pDef.dimN * pDef.dimM * BASE_PART_DENSITY);
      const inertia = (1 / 12) * mass * (pDef.width * pDef.width + pDef.height * pDef.height);
      scratchMasses[i] = mass;
      scratchInvMasses[i] = 1 / mass;
      scratchInertias[i] = inertia;
      scratchInvInertias[i] = 1 / inertia;
    }

    let frameMechanicalWork = 0;
    const dt_sub = dt / NUM_SUBSTEPS; // Fixed 1/240s substep

    for (let sub = 0; sub < NUM_SUBSTEPS; sub++) {
      scratchFx.fill(0);
      scratchFy.fill(0);
      scratchTorque.fill(0);

      // Motor torque computation across joints
      for (let j = 0; j < numJoints; j++) {
        const joint = org.joints[j];
        const childIdx = j + 1;
        const childDef = g.parts[childIdx];
        const parentIdx = Math.max(0, Math.min(childIdx - 1, childDef.parentIndex));

        const parentPhys = org.segments[parentIdx];
        const childPhys = org.segments[childIdx];

        const outBase = j * OUTPUTS_PER_JOINT;
        const targetAngleOffset = (org.neuralOutputs[outBase] || 0) * 0.45;
        const motorFreqDrive = 1.0 + (org.neuralOutputs[outBase + 1] || 0) * 0.35;
        const peakTorqueMod = clampVal(1.0 + (org.neuralOutputs[outBase + 2] || 0) * 0.4, 0.5, 1.6);
        const stiffnessDampingMod = clampVal(1.0 + (org.neuralOutputs[outBase + 3] || 0) * 0.4, 0.4, 1.8);
        joint.stiffness = stiffnessDampingMod;

        const jointFreq = g.motorFrequency * childDef.cpgFreqMult * motorFreqDrive;
        joint.phase = (joint.phase + 2 * Math.PI * jointFreq * dt_sub) % (2 * Math.PI);

        const wave = Math.sin(joint.phase) * childDef.cpgAmp;
        const targetAngle = clampVal((wave + targetAngleOffset) * childDef.maxAngle, -childDef.maxAngle, childDef.maxAngle);
        joint.targetAngle = targetAngle;

        let currentRelAngle = childPhys.angle - parentPhys.angle - (childDef.baseAngleOffset || 0);
        while (currentRelAngle > Math.PI) currentRelAngle -= Math.PI * 2;
        while (currentRelAngle < -Math.PI) currentRelAngle += Math.PI * 2;
        joint.currentRelAngle = currentRelAngle;

        const relAngVel = childPhys.angVel - parentPhys.angVel;
        joint.currentRelAngVel = relAngVel;

        const avgInertia = (scratchInertias[parentIdx] + scratchInertias[childIdx]) * 0.5;
        const kp = g.motorForce * avgInertia * 480.0 * stiffnessDampingMod;
        const kd = Math.sqrt(kp * avgInertia) * 1.4 * stiffnessDampingMod;

        let motorTorque = kp * (targetAngle - currentRelAngle) - kd * relAngVel;
        const maxTorque = avgInertia * 2200.0 * peakTorqueMod;
        motorTorque = clampVal(motorTorque, -maxTorque, maxTorque);
        if (isNaN(motorTorque)) motorTorque = 0;
        joint.appliedTorque = motorTorque;

        const deltaTheta = Math.abs(relAngVel * dt_sub);
        const stepJointWork = Math.abs(motorTorque) * deltaTheta * FORCE_COST_MULTIPLIER;
        if (!isNaN(stepJointWork) && isFinite(stepJointWork)) {
          frameMechanicalWork += stepJointWork;
        }

        scratchTorque[childIdx] += motorTorque;
        scratchTorque[parentIdx] -= motorTorque;
      }

      // Integrated Hydrodynamic Drag
      for (let i = 0; i < partCount; i++) {
        const seg = org.segments[i];
        const def = g.parts[i];
        const cosA = Math.cos(seg.angle);
        const sinA = Math.sin(seg.angle);

        const u = seg.vx * cosA + seg.vy * sinA;
        const v = -seg.vx * sinA + seg.vy * cosA;

        const fLocalX = -0.0 * mu * def.height * u; // Tangential drag (0 for calibrated benchmark propulsion)
        const fLocalY = -2.0 * mu * def.width * v;  // Normal anisotropic fluid drag

        const fDragWorldX = fLocalX * cosA - fLocalY * sinA;
        const fDragWorldY = fLocalX * sinA + fLocalY * cosA;
        const fDragTorque = -(mu * seg.angVel * (def.width * def.width * def.width + def.height * def.height * def.height)) / 6.0;

        scratchFx[i] += fDragWorldX;
        scratchFy[i] += fDragWorldY + gravity * scratchMasses[i] * 50.0;
        scratchTorque[i] += fDragTorque;

        const corners = getPartCornerVertices(seg, def);
        const kWallRepel = 24.0 * scratchMasses[i];
        const kWallDamping = 4.0 * scratchMasses[i];

        for (const pt of corners) {
          const rx = pt.x - seg.x;
          const ry = pt.y - seg.y;
          const vPtX = seg.vx - seg.angVel * ry;
          const vPtY = seg.vy + seg.angVel * rx;

          if (pt.x < 0) {
            const pen = -pt.x;
            const fx = pen * kWallRepel - vPtX * kWallDamping;
            scratchFx[i] += fx;
            scratchTorque[i] += rx * 0 - ry * fx;
          } else if (pt.x > worldWidth) {
            const pen = pt.x - worldWidth;
            const fx = -pen * kWallRepel - vPtX * kWallDamping;
            scratchFx[i] += fx;
            scratchTorque[i] += rx * 0 - ry * fx;
          }

          if (pt.y < 0) {
            const pen = -pt.y;
            const fy = pen * kWallRepel - vPtY * kWallDamping;
            scratchFy[i] += fy;
            scratchTorque[i] += rx * fy - ry * 0;
          } else if (pt.y > worldHeight) {
            const pen = pt.y - worldHeight;
            const fy = -pen * kWallRepel - vPtY * kWallDamping;
            scratchFy[i] += fy;
            scratchTorque[i] += rx * fy - ry * 0;
          }
        }
      }

      for (let i = 0; i < partCount; i++) {
        const seg = org.segments[i];
        seg.vx += scratchFx[i] * scratchInvMasses[i] * dt_sub;
        seg.vy += scratchFy[i] * scratchInvMasses[i] * dt_sub;
        seg.angVel += scratchTorque[i] * scratchInvInertias[i] * dt_sub;

        const spd = Math.hypot(seg.vx, seg.vy);
        if (spd > 400.0) {
          seg.vx = (seg.vx / spd) * 400.0;
          seg.vy = (seg.vy / spd) * 400.0;
        }
        seg.angVel = clampVal(seg.angVel, -20.0, 20.0);
      }

      // Joint Constraint Solver (Iterative impulse resolution with exact momentum conservation)
      for (let iter = 0; iter < 10; iter++) {
        for (let j = 0; j < numJoints; j++) {
          const childIdx = j + 1;
          const childDef = g.parts[childIdx];
          const parentIdx = Math.max(0, Math.min(childIdx - 1, childDef.parentIndex));

          const parentPhys = org.segments[parentIdx];
          const childPhys = org.segments[childIdx];
          const parentDef = g.parts[parentIdx];

          const parentAnchorLocal = getCardinalAnchor(childDef.attachmentPoint, parentDef.width, parentDef.height);
          const childAnchorLocal = getChildAnchorForParentDir(childDef.attachmentPoint, childDef.width, childDef.height);

          const cosP = Math.cos(parentPhys.angle);
          const sinP = Math.sin(parentPhys.angle);
          const rPx = cosP * parentAnchorLocal.x - sinP * parentAnchorLocal.y;
          const rPy = sinP * parentAnchorLocal.x + cosP * parentAnchorLocal.y;

          const cosC = Math.cos(childPhys.angle);
          const sinC = Math.sin(childPhys.angle);
          const rCx = cosC * childAnchorLocal.x - sinC * childAnchorLocal.y;
          const rCy = sinC * childAnchorLocal.x + cosC * childAnchorLocal.y;

          const anchorPx = parentPhys.x + rPx;
          const anchorPy = parentPhys.y + rPy;
          const anchorCx = childPhys.x + rCx;
          const anchorCy = childPhys.y + rCy;

          const vAnchorPx = parentPhys.vx - parentPhys.angVel * rPy;
          const vAnchorPy = parentPhys.vy + parentPhys.angVel * rPx;
          const vAnchorCx = childPhys.vx - childPhys.angVel * rCy;
          const vAnchorCy = childPhys.vy + childPhys.angVel * rCx;

          const vRelX = vAnchorCx - vAnchorPx;
          const vRelY = vAnchorCy - vAnchorPy;

          const posErrX = anchorCx - anchorPx;
          const posErrY = anchorCy - anchorPy;
          const beta = 0.35;
          const biasX = (beta / dt_sub) * posErrX;
          const biasY = (beta / dt_sub) * posErrY;

          const wP = scratchInvMasses[parentIdx];
          const wC = scratchInvMasses[childIdx];
          const iP = scratchInvInertias[parentIdx];
          const iC = scratchInvInertias[childIdx];

          const k11 = wP + wC + rPy * rPy * iP + rCy * rCy * iC;
          const k22 = wP + wC + rPx * rPx * iP + rCx * rCx * iC;
          const k12 = -rPx * rPy * iP - rCx * rCy * iC;

          const det = k11 * k22 - k12 * k12;
          if (det > 1e-7) {
            const rhsX = -(vRelX + biasX);
            const rhsY = -(vRelY + biasY);

            const impulseX = (k22 * rhsX - k12 * rhsY) / det;
            const impulseY = (-k12 * rhsX + k11 * rhsY) / det;

            childPhys.vx += impulseX * wC;
            childPhys.vy += impulseY * wC;
            childPhys.angVel += (rCx * impulseY - rCy * impulseX) * iC;

            parentPhys.vx -= impulseX * wP;
            parentPhys.vy -= impulseY * wP;
            parentPhys.angVel -= (rPx * impulseY - rPy * impulseX) * iP;
          }

          // Enforce physical joint-angle limits
          let relAngle = childPhys.angle - parentPhys.angle - (childDef.baseAngleOffset || 0);
          while (relAngle > Math.PI) relAngle -= Math.PI * 2;
          while (relAngle < -Math.PI) relAngle += Math.PI * 2;

          if (Math.abs(relAngle) > childDef.maxAngle) {
            const limitErr = Math.sign(relAngle) * (Math.abs(relAngle) - childDef.maxAngle);
            const relAngVel = childPhys.angVel - parentPhys.angVel;
            const angularBias = (0.2 / dt_sub) * limitErr;
            const angImpulse = -(relAngVel + angularBias) / (iP + iC);
            childPhys.angVel += angImpulse * iC;
            parentPhys.angVel -= angImpulse * iP;
          }
        }
      }

      for (let i = 0; i < partCount; i++) {
        const seg = org.segments[i];
        seg.x += seg.vx * dt_sub;
        seg.y += seg.vy * dt_sub;
        seg.angle += seg.angVel * dt_sub;
      }
    }

    // Clamp mechanical work to prevent frame 0 impulse spikes from draining reserves
    frameMechanicalWork = Math.min(MAX_FRAME_MOTOR_WORK, frameMechanicalWork);

    // Mass-Weighted COM Speed & Odometry
    const comData = calculateOrganismCOM(org);
    org.speed = Math.hypot(comData.vxCOM, comData.vyCOM);
    org.distanceTraveled += org.speed * dt;

    // Area-Normalized Basal & Sensory Metabolism
    const sizeRatio = calculateTotalBodyArea(g.parts) / BASE_FOUNDER_AREA;
    const basalRate = BASAL_METABOLIC_RATE * sizeRatio * g.metabolicEfficiency;
    const sensoryRate = SENSORY_NEURAL_METABOLIC_RATE * (g.eyes.length * 5 + NUM_HIDDEN);
    const motorRate = frameMechanicalWork / dt;

    const basalMetabolism = basalRate * dt;
    const sensoryMetabolism = sensoryRate * dt;
    const totalBasalDissipation = basalMetabolism + sensoryMetabolism;

    org.basalEnergyRate = basalRate;
    org.sensoryEnergyRate = sensoryRate;
    org.motorEnergyRate = motorRate;
    org.totalEnergyRate = basalRate + sensoryRate + motorRate;

    // Deduct expenditure and ensure reserves strictly stop at 0.0 (no negative reserves)
    const requiredExpenditure = totalBasalDissipation + frameMechanicalWork;
    const paidFraction = requiredExpenditure > 0
      ? Math.min(1, org.energy / requiredExpenditure) : 0;
    org.energy = Math.max(0.0, org.energy - requiredExpenditure);
    ledger.metabolicDissipation += totalBasalDissipation * paidFraction;
    ledger.mechanicalWorkHeat += frameMechanicalWork * paidFraction;

    // D. CONTACT FEEDING & EGG PREDATION (Exact Geometric Boundary, Zero Phantom Reach)
    for (let mIdx = 0; mIdx < g.mouths.length; mIdx++) {
      const mouth = g.mouths[mIdx];
      const mouthPartIdx = Math.min(mouth.partIndex, org.segments.length - 1);
      const mouthPhys = org.segments[mouthPartIdx];
      const mouthDef = g.parts[mouthPartIdx];

      const mouthAnchorLocal = getCardinalAnchor(mouth.direction, mouthDef.width, mouthDef.height);
      const cosM = Math.cos(mouthPhys.angle);
      const sinM = Math.sin(mouthPhys.angle);
      const mouthCenterX = mouthPhys.x + cosM * mouthAnchorLocal.x - sinM * mouthAnchorLocal.y;
      const mouthCenterY = mouthPhys.y + sinM * mouthAnchorLocal.x + cosM * mouthAnchorLocal.y;

      // Exact physical aperture boundary
      const mouthRadius = mouth.mouthType === 'carnivore' ? 4.5 : mouth.mouthType === 'omnivore' ? 4.0 : 3.5;
      const halfAperture = Math.max(mouthRadius, mouth.intakeWidth * 0.5);
      const normDir = getCardinalOutwardNormal(mouth.direction);
      const tanX = -normDir.y;
      const tanY = normDir.x;
      const tanWorldX = cosM * tanX - sinM * tanY;
      const tanWorldY = sinM * tanX + cosM * tanY;

      const m1x = mouthCenterX - tanWorldX * halfAperture;
      const m1y = mouthCenterY - tanWorldY * halfAperture;
      const m2x = mouthCenterX + tanWorldX * halfAperture;
      const m2y = mouthCenterY + tanWorldY * halfAperture;

      const isCarnivore = mouth.mouthType === 'carnivore';
      const isOmnivore = mouth.mouthType === 'omnivore';
      const isHerbivore = mouth.mouthType === 'herbivore';

      // 1. Meat Ingestion on Organisms (Carnivore & Omnivore ONLY)
      if (isCarnivore || isOmnivore) {
        const biteTransferRate = (isOmnivore ? OMNIVORE_EAT_RATE : CONTINUOUS_EAT_RATE) * dt;

        for (let preyIdx = organisms.length - 1; preyIdx >= 0; preyIdx--) {
          const prey = organisms[preyIdx];
          if (prey.id === org.id || prey.dissolving) continue;
          if (isKinshipProtected && areSiblings(org, prey)) continue;

          let inContact = false;
          for (let s = 0; s < prey.segments.length; s++) {
            const preySeg = prey.segments[s];
            const preyDef = prey.genome.parts[s];
            if (Math.abs(preySeg.x - mouthCenterX) > 70 || Math.abs(preySeg.y - mouthCenterY) > 70) continue;

            const corners = getPartCornerVertices(preySeg, preyDef);

            // Check exact aperture segment intersecting prey edges
            for (let c = 0; c < 4; c++) {
              const c1 = corners[c];
              const c2 = corners[(c + 1) % 4];
              const inter = lineIntersection(m1x, m1y, m2x, m2y, c1.x, c1.y, c2.x, c2.y);
              if (inter.hit) {
                inContact = true;
                break;
              }
              // Exact distance from mouth anchor to prey boundary <= mouthRadius
              const edgeDist = distPointToSegment(mouthCenterX, mouthCenterY, c1.x, c1.y, c2.x, c2.y);
              if (edgeDist <= mouthRadius) {
                inContact = true;
                break;
              }
            }
            if (inContact) break;
          }

          if (inContact) {
            org.isFeedingHighlight = 0.2;
            let netGained = 0;

            if (prey.energy > 0) {
              const transfer = Math.min(prey.energy, biteTransferRate);
              prey.energy -= transfer;
              const capacityRoom = Math.max(0, g.maxEnergyCapacity - org.energy);
              const absorbed = Math.min(transfer, capacityRoom);
              const excessRejected = transfer - absorbed;
              org.energy += absorbed;
              netGained = absorbed;
              ledger.recordedLosses += excessRejected;
            } else if (prey.structuralBiomass > 0) {
              const transfer = Math.min(prey.structuralBiomass, biteTransferRate);
              prey.structuralBiomass -= transfer;
              const usableGained = transfer * 0.85;
              const biteDissipation = transfer * 0.15;
              const capacityRoom = Math.max(0, g.maxEnergyCapacity - org.energy);
              const absorbed = Math.min(usableGained, capacityRoom);
              const excessRejected = usableGained - absorbed;
              org.energy += absorbed;
              netGained = absorbed;
              ledger.metabolicDissipation += biteDissipation;
              ledger.recordedLosses += excessRejected;
            }

            if (netGained > 0) {
              recordFeedingEvent(org, state.simTime, mouth.id, mouth.mouthType, 'Prey', netGained);
            }

            if (prey.energy <= 0 && prey.structuralBiomass <= 10.0) {
              prey.deathCause = 'Predation';
              prey.dissolving = true;
              prey.dissolveAlpha = 1.0;
              org.preyEaten += 1;
              org.foodEaten += 1;
              if (onEvent) onEvent('clash');
            }
          }
        }
      }

      // 2. Foreign Egg Predation (Carnivore & Omnivore ONLY - Exact Geometric Contact)
      if (isCarnivore || isOmnivore) {
        const eggBiteRate = (isOmnivore ? OMNIVORE_EAT_RATE : CONTINUOUS_EAT_RATE) * dt;

        for (let eggIdx = eggs.length - 1; eggIdx >= 0; eggIdx--) {
          const targetEgg = eggs[eggIdx];
          if (isKinshipProtected && isEggKin(org, targetEgg)) continue;

          const eggRadius = 16.0;
          if (Math.abs(targetEgg.x - mouthCenterX) > eggRadius + 25 || Math.abs(targetEgg.y - mouthCenterY) > eggRadius + 25) continue;

          // Exact physical contact: distance to mouth center or aperture segment <= mouthRadius + eggRadius (NO phantom +10px)
          const dist = distPointToSegment(targetEgg.x, targetEgg.y, m1x, m1y, m2x, m2y);
          if (dist <= eggRadius + mouthRadius) {
            org.isFeedingHighlight = 0.2;
            const totalEggAvail = targetEgg.fundedReserve + targetEgg.fundedStructural;
            const transfer = Math.min(totalEggAvail, eggBiteRate);

            if (transfer > 0) {
              if (targetEgg.fundedReserve >= transfer) {
                targetEgg.fundedReserve -= transfer;
              } else {
                const rem = transfer - targetEgg.fundedReserve;
                targetEgg.fundedReserve = 0;
                targetEgg.fundedStructural = Math.max(0, targetEgg.fundedStructural - rem);
              }

              const capacityRoom = Math.max(0, g.maxEnergyCapacity - org.energy);
              const absorbed = Math.min(transfer, capacityRoom);
              const excess = transfer - absorbed;
              org.energy += absorbed;
              ledger.recordedLosses += excess;

              if (absorbed > 0) {
                recordFeedingEvent(org, state.simTime, mouth.id, mouth.mouthType, 'Egg', absorbed);
              }
            }

            if (targetEgg.fundedStructural + targetEgg.fundedReserve <= 2.0) {
              ledger.recordedLosses += targetEgg.fundedStructural + targetEgg.fundedReserve;
              org.eggsPredated = (org.eggsPredated || 0) + 1;
              org.preyEaten += 1;
              org.foodEaten += 1;
              eggs.splice(eggIdx, 1);
              if (onEvent) onEvent('clash');
            }
          }
        }
      }

      // 3. Herbivore Nutrient Ingestion (Herbivore & Omnivore ONLY - Exact Geometric Contact)
      if (isHerbivore || isOmnivore) {
        const grazingTransferRate = (isOmnivore ? OMNIVORE_EAT_RATE : CONTINUOUS_EAT_RATE) * dt;

        for (let nIdx = nutrients.length - 1; nIdx >= 0; nIdx--) {
          const nut = nutrients[nIdx];
          if (Math.abs(nut.x - mouthCenterX) > nut.radius + 25 || Math.abs(nut.y - mouthCenterY) > nut.radius + 25) continue;

          // Exact physical contact: distance to mouth aperture line <= nut.radius + mouthRadius (NO phantom +12px)
          const dist = distPointToSegment(nut.x, nut.y, m1x, m1y, m2x, m2y);
          if (dist <= nut.radius + mouthRadius) {
            org.isFeedingHighlight = 0.2;
            const transfer = Math.min(nut.energyValue, grazingTransferRate);
            nut.energyValue -= transfer;
            const capacityRoom = Math.max(0, g.maxEnergyCapacity - org.energy);
            const absorbed = Math.min(transfer, capacityRoom);
            const excess = transfer - absorbed;
            org.energy += absorbed;
            ledger.recordedLosses += excess;
            nut.radius = getNutrientRadius(nut.energyValue);

            if (absorbed > 0) {
              recordFeedingEvent(org, state.simTime, mouth.id, mouth.mouthType, 'Nutrient', absorbed);
            }

            if (nut.energyValue <= 1.0) {
              ledger.recordedLosses += nut.energyValue;
              org.foodEaten += 1;
              nutrients.splice(nIdx, 1);
              if (onEvent) onEvent('eat');
            }
          }
        }
      }
    }

    // E. REPRODUCTION (Continuous Attempt with Scaled Clutch Size & Heritable DNA Traits)
    const maturityAge = g.maturityAge || MATURITY_AGE;
    const cooldown = g.reproductionCooldown || 18.0;
    const parentSurvivalReserve = Math.max(MIN_PARENT_SURVIVAL_RESERVE_BASE, g.maxEnergyCapacity * MIN_PARENT_SURVIVAL_FRACTION);
    const eggCost = g.bodyCost + FOUNDER_DEFAULT_RESERVE;
    const availableBudget = org.energy - parentSurvivalReserve;
    const isOffCooldown = state.simTime >= (org.lastReproductionTime || 0) + cooldown;
    const isMature = org.age >= maturityAge;
    const desiredCount = g.targetClutchSize || 2;
    const affordableCount = Math.max(0, Math.floor(availableBudget / eggCost));
    const actualClutchSize = Math.min(desiredCount, affordableCount);

    org.isGravid = isMature && isOffCooldown && actualClutchSize >= 1;

    if (
      org.isGravid &&
      organisms.length < (settings.maxOrganisms ?? 50) &&
      eggs.length < 75
    ) {
      const clutchCount = Math.min(actualClutchSize, 75 - eggs.length);

      if (clutchCount >= 1) {
        const rearSeg = org.segments[org.segments.length - 1];
        const clutchId = `CLUTCH-${prng.nextUint32().toString(36).substring(0, 5)}`;
        let laidAny = false;

        for (let k = 0; k < clutchCount; k++) {
          if (eggs.length >= 75) break;
          const babyGenome = mutateGenome(g, mutationSeverity, prng);
          const offspringBodyCost = babyGenome.bodyCost;
          const allocatedReserve = FOUNDER_DEFAULT_RESERVE;
          const totalEggEnergy = offspringBodyCost + allocatedReserve;

          if (org.energy >= totalEggEnergy + parentSurvivalReserve) {
            org.energy -= totalEggEnergy;
            org.offspringCount += 1;
            laidAny = true;

            const rec = state.lineage.get(org.id);
            if (rec) rec.offspringCount += 1;

            const angleSpread = (k - (clutchCount - 1) / 2) * 0.35;
            const layAngle = rearSeg.angle + Math.PI + angleSpread;

            eggs.push({
              id: `EGG-${prng.nextUint32().toString(36).substring(0, 5)}`,
              clutchId,
              parentOrgId: org.id,
              x: rearSeg.x + Math.cos(layAngle) * 25,
              y: rearSeg.y + Math.sin(layAngle) * 25,
              vx: Math.cos(layAngle) * prng.range(0.6, 1.2),
              vy: Math.sin(layAngle) * prng.range(0.6, 1.2),
              genome: babyGenome,
              fundedStructural: offspringBodyCost,
              fundedReserve: allocatedReserve,
              incubationProgress: 0,
              totalIncubationTime: babyGenome.incubationTime || prng.range(8.5, 14.0),
              pulseTimer: k * 0.4,
              colorHue: babyGenome.hue,
              readyToHatch: false,
            });
          }
        }

        if (laidAny) {
          org.lastReproductionAge = org.age;
          org.lastReproductionTime = state.simTime;
          org.clutchesLaid += 1;
          if (onEvent) onEvent('birth');
        }
      }
    }

    org.isGravid = evaluateReproductionAffordability(
      org, state.simTime, organisms.length, eggs.length, settings.maxOrganisms ?? 50,
    ).eligible;

    // F. Starvation & Senescence (Precise Cause Attribution)
    if (!org.dissolving) {
      if (org.age >= org.maxLifespan) {
        org.deathCause = 'Old Age';
        org.dissolving = true;
        org.dissolveAlpha = 1.0;
      } else if (org.energy <= 0) {
        org.deathCause = 'Starvation';
        org.dissolving = true;
        org.dissolveAlpha = 1.0;
      }
    }
  }

  // 6. Bubbles
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.life += dt;
    b.x += b.vx * dt * 60;
    b.y += b.vy * dt * 60;
    b.vy -= 0.05 * dt * 60;
    b.alpha = (1 - b.life / b.maxLife) * 0.6;
    if (b.life >= b.maxLife) bubbles.splice(i, 1);
  }
  if (bubbles.length > 60) {
    bubbles.splice(0, bubbles.length - 60);
  }
}

// ============================================================================
// 4. MAIN REACT COMPONENT (App)
// ============================================================================
export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepperRef = useRef<ReturnType<typeof createFixedStepper>>();

  const ASSETS_MANIFEST: Record<string, string> = {
    neuralNodeIcon: neuralNodeIconUrl,
    organismEgg: organismEggUrl,
    nutrientParticle: nutrientParticleUrl,
    dnaHelixIcon: dnaHelixIconUrl,
  };
  const {assets, isReady: assetsReady} = useAssets(ASSETS_MANIFEST);

  const isMobile = useIsMobile();
  const canvasWidth = getConfig('baseCanvasWidth') as number;
  const canvasHeight = getConfig('baseCanvasHeight') as number;
  const worldWidth = getConfig('worldWidth') as number;
  const worldHeight = getConfig('worldHeight') as number;

  if (!stepperRef.current) {
    const stepMs = getConfig('stepMs');
    const maxSubSteps = getConfig('maxSubSteps');
    stepperRef.current = createFixedStepper(stepMs, maxSubSteps);
  }

  // React State for HUD & Modals
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: 0,
    level: 1,
  });

  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isBrainInspectorOpen, setIsBrainInspectorOpen] = useState(false);
  const [inspectorActiveTab, setInspectorActiveTab] = useState<'brain' | 'morphology' | 'energy' | 'lineage' | 'verification'>('brain');
  const [isEcosystemGraphOpen, setIsEcosystemGraphOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpecimenBankOpen, setIsSpecimenBankOpen] = useState(false);
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [showTraces, setShowTraces] = useState(false);
  const [showMouthApertures, setShowMouthApertures] = useState(true);
  const [musicMuted, setMusicMuted] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [timeMultiplier, setTimeMultiplier] = useState<1 | 2 | 5 | 10 | 20 | 50>(1);

  // Settings & Configuration Sliders
  const [waterViscosity, setWaterViscosity] = useState<number>((getConfig('waterViscosity') as number) ?? 0.22);
  const [targetNutrientAbundance, setTargetNutrientAbundance] = useState<number>((getConfig('targetNutrientCount') as number) ?? 800);
  const [nutrientInflowRate, setNutrientInflowRate] = useState<number>((getConfig('nutrientInflowRate') as number) ?? 15);
  const [kinshipProtectionEnabled, setKinshipProtectionEnabled] = useState<boolean>(true);
  const [synapsePruningThreshold, setSynapsePruningThreshold] = useState<number>(0.25);
  const [customBranchName, setCustomBranchName] = useState<string>('Parallel Ocean');

  // Draggable Modals
  const inspectorDraggable = useDraggableModal(typeof window !== 'undefined' ? window.innerWidth - 540 : 700, 52);
  const settingsDraggable = useDraggableModal(16, 56);
  const ledgerDraggable = useDraggableModal(16, typeof window !== 'undefined' ? window.innerHeight - 400 : 380);
  const badgeDraggable = useDraggableModal(16, 12);
  const bankDraggable = useDraggableModal(typeof window !== 'undefined' ? window.innerWidth / 2 - 200 : 400, 60);
  const arenaDraggable = useDraggableModal(typeof window !== 'undefined' ? window.innerWidth / 2 - 260 : 350, 40);

  const ignoreCanvasClickUntilRef = useRef<number>(0);
  const pointerDownStateRef = useRef<{x: number; y: number; time: number; active: boolean}>({
    x: 0,
    y: 0,
    time: 0,
    active: false,
  });

  // Diagnostic Test Suite State
  const [diagnosticResults, setDiagnosticResults] = useState<{
    ran: boolean;
    comLocomotion: boolean;
    zeroDragConservation: boolean;
    eggEnergyAccounting: boolean;
    reproductionAffordability: boolean;
    raycastOcclusion: boolean;
    prngDeterminism: boolean;
    starvationLifespan: boolean;
    details: string[];
  }>({
    ran: false,
    comLocomotion: false,
    zeroDragConservation: false,
    eggEnergyAccounting: false,
    reproductionAffordability: false,
    raycastOcclusion: false,
    prngDeterminism: false,
    starvationLifespan: false,
    details: [],
  });

  // Specimen Bank & Comparison Arena State
  const [specimenBank, setSpecimenBank] = useState<SpecimenBankItem[]>([]);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [arenaCompetitorA, setArenaCompetitorA] = useState<Genome | null>(null);
  const [arenaCompetitorB, setArenaCompetitorB] = useState<Genome | null>(null);
  const [arenaState, setArenaState] = useState<{
    running: boolean;
    time: number;
    distA: number;
    distB: number;
    speedA: number;
    speedB: number;
  }>({running: false, time: 0, distA: 0, distB: 0, speedA: 0, speedB: 0});

  // Ecosystem Statistics
  const [ecoStats, setEcoStats] = useState({
    simTime: 0,
    livingCount: 0,
    eggCount: 0,
    maxGeneration: 1,
    avgGeneration: 1,
    totalBirths: 0,
    totalDeaths: 0,
    fastestSpeed: 0,
    nutrientCount: 0,
    targetNutrients: (getConfig('targetNutrientCount') as number) ?? 800,
    totalStoredBiomass: 0,
    totalStoredReserves: 0,
    totalEggEnergy: 0,
    totalFoodEnergy: 0,
    totalExternalInflow: 0,
    totalMetabolicHeat: 0,
    totalMechanicalHeat: 0,
    totalRecordedLosses: 0,
    herbivoreCount: 0,
    carnivoreCount: 0,
    omnivoreCount: 0,
    mixedCount: 0,
    simTimeRatio: 1.0,
    renderFPS: 60,
    physicsStepsPerSec: 60,
  });

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedSpecimen, setSelectedSpecimen] = useState<Organism | null>(null);
  const [isAutoTracking, setIsAutoTracking] = useState(false);

  // History for telemetry graph
  const popHistoryRef = useRef<number[]>([]);

  // AUTHORITATIVE SIMULATION STATE IN REF
  const simStateRef = useRef<SimulationState>({
    simTime: 0,
    organisms: [],
    eggs: [],
    nutrients: [],
    bubbles: [],
    caustics: [],
    ledger: {
      externalInflow: 0,
      metabolicDissipation: 0,
      mechanicalWorkHeat: 0,
      recordedLosses: 0,
    },
    nutrientAccumulator: 0,
    totalBirths: 0,
    totalDeaths: 0,
    prng: new XoshiroPRNG(4242),
    lineage: new Map<string, LineageRecord>(),
    recentDeaths: [],
  });

  // Telemetry Performance Tracker
  const realTimeTrackerRef = useRef({
    lastRealTime: performance.now(),
    simulatedSecsThisInterval: 0,
    realSecsThisInterval: 0,
    achievedRatio: 1.0,
    framesThisSec: 0,
    physicsStepsThisSec: 0,
    lastFPSUpdate: performance.now(),
    renderFPS: 60,
    physicsStepsPerSec: 60,
  });

  // Camera State
  const cameraRef = useRef({
    x: worldWidth / 2,
    y: worldHeight / 2,
    zoom: 0.85,
    targetX: worldWidth / 2,
    targetY: worldHeight / 2,
    isDragging: false,
    lastDragX: 0,
    lastDragY: 0,
  });

  const statsTimerRef = useRef(0);
  const timeMultiplierRef = useRef(timeMultiplier);
  timeMultiplierRef.current = timeMultiplier;

  useEffect(() => {
    (window as any).canHandleBackKey = gameState.status !== 'START';
  }, [gameState.status]);

  const inputRef = useInput(canvasRef, true, {
    width: canvasWidth,
    height: canvasHeight,
  });

  const closeInspector = useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    ignoreCanvasClickUntilRef.current = Date.now() + 400;
    setIsBrainInspectorOpen(false);
    setSelectedOrgId(null);
    setSelectedSpecimen(null);
    setIsAutoTracking(false);
    gameAudio.playCrispClick();
  }, []);

  // Save / Load Specimen Bank to LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vida_specimen_bank_v3');
      if (saved) {
        setSpecimenBank(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveCurrentSpecimenToBank = useCallback((name?: string) => {
    if (!selectedSpecimen) return;
    const item: SpecimenBankItem = {
      id: `BANK-${Date.now().toString(36).toUpperCase()}`,
      name: name || selectedSpecimen.genome.name || `Specimen ${selectedSpecimen.genome.id}`,
      savedAt: new Date().toLocaleTimeString(),
      genome: JSON.parse(JSON.stringify(selectedSpecimen.genome)),
      tags: [selectedSpecimen.genome.archetype || 'Custom', `Gen ${selectedSpecimen.genome.generation}`],
    };
    const updated = [item, ...specimenBank.slice(0, 24)];
    setSpecimenBank(updated);
    try {
      localStorage.setItem('vida_specimen_bank_v3', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setSaveNotification(`Saved "${item.name}" to Specimen Bank!`);
    setTimeout(() => setSaveNotification(null), 2500);
    gameAudio.playPowerupChime();
  }, [selectedSpecimen, specimenBank]);

  // Branch Ecosystem Functionality
  const branchEcosystem = useCallback(() => {
    const currentState = simStateRef.current;
    const clonedState: SimulationState = {
      simTime: currentState.simTime,
      organisms: JSON.parse(JSON.stringify(currentState.organisms)),
      eggs: JSON.parse(JSON.stringify(currentState.eggs)),
      nutrients: JSON.parse(JSON.stringify(currentState.nutrients)),
      bubbles: [],
      caustics: JSON.parse(JSON.stringify(currentState.caustics)),
      ledger: {...currentState.ledger},
      nutrientAccumulator: currentState.nutrientAccumulator,
      totalBirths: currentState.totalBirths,
      totalDeaths: currentState.totalDeaths,
      prng: currentState.prng.clone(),
      lineage: new Map(currentState.lineage),
      recentDeaths: [...(currentState.recentDeaths || [])],
    };

    simStateRef.current = clonedState;
    gameAudio.playLevelUpStinger();
    alert(`Ecosystem successfully branched! You are now observing the parallel branch "${customBranchName}". Feel free to alter physics sliders to watch evolutionary divergence.`);
  }, [customBranchName]);

  const exportEcosystemJSON = useCallback(() => {
    const s = simStateRef.current;
    const payload = {
      schemaVersion: '3.0.0',
      timestamp: Date.now(),
      simTime: s.simTime,
      prngState: s.prng.getState(),
      organisms: s.organisms,
      eggs: s.eggs,
      nutrients: s.nutrients,
      ledger: s.ledger,
      lineage: Array.from(s.lineage.entries()),
      stats: ecoStats,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vida_ecosystem_t${Math.round(s.simTime)}s.json`;
    a.click();
    URL.revokeObjectURL(url);
    gameAudio.playConfirmSelect();
  }, [ecoStats]);

  const importEcosystemJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.organisms && data.eggs && data.nutrients) {
          const loadedPRNG = new XoshiroPRNG(1337);
          if (data.prngState) loadedPRNG.setState(data.prngState);

          const loadedLineage = new Map<string, LineageRecord>();
          if (data.lineage) {
            for (const [k, v] of data.lineage) loadedLineage.set(k, v);
          }

          simStateRef.current = {
            simTime: data.simTime || 0,
            organisms: data.organisms,
            eggs: data.eggs,
            nutrients: data.nutrients,
            bubbles: [],
            caustics: [],
            ledger: data.ledger || {externalInflow: 0, metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
            nutrientAccumulator: 0,
            totalBirths: data.organisms.length,
            totalDeaths: 0,
            prng: loadedPRNG,
            lineage: loadedLineage,
            recentDeaths: data.recentDeaths || [],
          };
          gameAudio.playLevelUpStinger();
          alert('Ecosystem state fully restored!');
        }
      } catch (err) {
        alert('Invalid ecosystem JSON file.');
      }
    };
    reader.readAsText(file);
  }, []);

  // Run Automated Diagnostic Verification Suite using Production stepSimulation Kernel
  const runDiagnosticSuite = useCallback(() => {
    const details: string[] = [];

    // --- TEST 1: Trustworthy Nematode Benchmark in Isolated Sub-world ---
    const isolatedPRNG = new XoshiroPRNG(9999);
    const benchGenome = createReferenceNematodeGenome();
    const benchSwimmer = spawnOrganism(benchGenome, 1000, 750, 0);
    const initCOM = calculateOrganismCOM(benchSwimmer);

    const testState: SimulationState = {
      simTime: 0,
      organisms: [benchSwimmer],
      eggs: [],
      nutrients: [],
      bubbles: [],
      caustics: [],
      ledger: {externalInflow: 0, metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
      nutrientAccumulator: 0,
      totalBirths: 1,
      totalDeaths: 0,
      prng: isolatedPRNG,
      lineage: new Map(),
      recentDeaths: [],
    };

    const testSettings: SimulationSettings = {
      worldWidth: 3000,
      worldHeight: 2000,
      waterViscosity: 0.22,
      targetNutrients: 0,
      inflowRate: 0,
      kinshipProtection: true,
      mutationSeverity: 0.25,
      gravity: 0,
    };

    let maxAnchorSeparation = 0;
    let prevX = initCOM.x;
    let prevY = initCOM.y;
    let totalPathLength = 0;

    // Run 15.0 simulated seconds (900 outer steps @ 1/60s, with 4 substeps each = 3600 substeps)
    const fixedDt = 1 / 60;
    for (let step = 0; step < 900; step++) {
      stepSimulation(testState, testSettings, fixedDt);

      const curCOM = calculateOrganismCOM(benchSwimmer);
      totalPathLength += Math.hypot(curCOM.x - prevX, curCOM.y - prevY);
      prevX = curCOM.x;
      prevY = curCOM.y;

      // Check anchor separation across all joints
      for (let j = 0; j < benchSwimmer.joints.length; j++) {
        const childIdx = j + 1;
        const childDef = benchGenome.parts[childIdx];
        const parentIdx = Math.max(0, Math.min(childIdx - 1, childDef.parentIndex));

        const pPhys = benchSwimmer.segments[parentIdx];
        const cPhys = benchSwimmer.segments[childIdx];
        const pDef = benchGenome.parts[parentIdx];

        const pAnchLoc = getCardinalAnchor(childDef.attachmentPoint, pDef.width, pDef.height);
        const cAnchLoc = getChildAnchorForParentDir(childDef.attachmentPoint, childDef.width, childDef.height);

        const cosP = Math.cos(pPhys.angle);
        const sinP = Math.sin(pPhys.angle);
        const axP = pPhys.x + cosP * pAnchLoc.x - sinP * pAnchLoc.y;
        const ayP = pPhys.y + sinP * pAnchLoc.x + cosP * pAnchLoc.y;

        const cosC = Math.cos(cPhys.angle);
        const sinC = Math.sin(cPhys.angle);
        const axC = cPhys.x + cosC * cAnchLoc.x - sinC * cAnchLoc.y;
        const ayC = cPhys.y + sinC * cAnchLoc.x + cosC * cAnchLoc.y;

        const sep = Math.hypot(axC - axP, ayC - ayP);
        if (sep > maxAnchorSeparation) maxAnchorSeparation = sep;
      }
    }

    const finalCOM = calculateOrganismCOM(benchSwimmer);
    const comDisplacement = Math.hypot(finalCOM.x - initCOM.x, finalCOM.y - initCOM.y);
    const comLocomotion = comDisplacement >= 250.0 && maxAnchorSeparation < 0.15;
    details.push(`1. Production Nematode Benchmark (15.0s @ μ=0.22, 4 substeps @ 1/240s): Net COM Δr = ${comDisplacement.toFixed(2)} px (~${(comDisplacement / 126).toFixed(1)} body lengths), Path = ${totalPathLength.toFixed(1)} px, Max Anchor Error = ${maxAnchorSeparation.toFixed(4)} px (Pass: ${comLocomotion})`);

    // --- TEST 2: Momentum Conservation in Zero Drag (μ = 0) ---
    const zeroDragSwimmer = spawnOrganism(benchGenome, 1000, 750, 0);
    const zeroInitCOM = calculateOrganismCOM(zeroDragSwimmer);
    const zeroDragState: SimulationState = {
      simTime: 0,
      organisms: [zeroDragSwimmer],
      eggs: [],
      nutrients: [],
      bubbles: [],
      caustics: [],
      ledger: {externalInflow: 0, metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
      nutrientAccumulator: 0,
      totalBirths: 1,
      totalDeaths: 0,
      prng: new XoshiroPRNG(777),
      lineage: new Map(),
      recentDeaths: [],
    };
    const zeroDragSettings: SimulationSettings = {...testSettings, waterViscosity: 0.0};
    for (let step = 0; step < 600; step++) {
      stepSimulation(zeroDragState, zeroDragSettings, fixedDt);
    }
    const zeroFinalCOM = calculateOrganismCOM(zeroDragSwimmer);
    const zeroDragCOMDisplacement = Math.hypot(zeroFinalCOM.x - zeroInitCOM.x, zeroFinalCOM.y - zeroInitCOM.y);
    const zeroDragConservation = zeroDragCOMDisplacement < 0.0001;
    details.push(`2. Momentum Conservation (μ=0, 10s): Net COM Translation = ${zeroDragCOMDisplacement.toFixed(6)} px (Pass: ${zeroDragConservation})`);

    // --- TEST 3: Parent -> Egg -> Damaged Egg -> Hatchling Energy Accounting ---
    const testEgg: Egg = {
      id: 'TEST-EGG',
      clutchId: 'CLUTCH-TEST',
      parentOrgId: 'PARENT-1',
      x: 300,
      y: 300,
      vx: 0,
      vy: 0,
      genome: benchGenome,
      fundedStructural: benchGenome.bodyCost,
      fundedReserve: 60.0,
      incubationProgress: 0.99,
      totalIncubationTime: 1.0,
      pulseTimer: 0,
      colorHue: 180,
      readyToHatch: false,
    };
    // Simulate 30J predation damage to egg (deducts from reserve first)
    testEgg.fundedReserve -= 30.0;
    const eggState: SimulationState = {
      simTime: 0,
      organisms: [],
      eggs: [testEgg],
      nutrients: [],
      bubbles: [],
      caustics: [],
      ledger: {externalInflow: 0, metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
      nutrientAccumulator: 0,
      totalBirths: 0,
      totalDeaths: 0,
      prng: new XoshiroPRNG(555),
      lineage: new Map(),
      recentDeaths: [],
    };
    stepSimulation(eggState, testSettings, fixedDt);
    const hatchedBaby = eggState.organisms[0];
    const eggEnergyAccounting = hatchedBaby && Math.abs(hatchedBaby.structuralBiomass - benchGenome.bodyCost) < 1e-5 && Math.abs(hatchedBaby.energy - 30.0) < 1e-5;
    details.push(`3. Egg Energy Accounting (Zero Free Structural Energy): Hatchling Structural=${hatchedBaby?.structuralBiomass.toFixed(1)}J, Reserve=${hatchedBaby?.energy.toFixed(1)}J (Pass: ${eggEnergyAccounting})`);

    // --- TEST 4: True Budget Reproduction & Heritable Trait Verification ---
    // Mature adult with 35,000J reserve (affords 1 egg out of target 2)
    const matureAdult = spawnOrganism(benchGenome, 400, 400, 0);
    matureAdult.age = 25.0; // Sexually mature (> 20s)
    matureAdult.energy = 35000.0; // Affords parentReserve (20,000J) + 1 egg (~11,640J)
    matureAdult.lastReproductionTime = 0;

    const reproState: SimulationState = {
      simTime: 30.0,
      organisms: [matureAdult],
      eggs: [],
      nutrients: [],
      bubbles: [],
      caustics: [],
      ledger: {externalInflow: 0, metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
      nutrientAccumulator: 0,
      totalBirths: 1,
      totalDeaths: 0,
      prng: new XoshiroPRNG(333),
      lineage: new Map(),
      recentDeaths: [],
    };

    stepSimulation(reproState, testSettings, fixedDt);
    const laidEgg = reproState.eggs.length === 1;
    const cooldownActive = matureAdult.lastReproductionTime === reproState.simTime;

    // Immature juvenile check (< maturityAge)
    const juvenileOrg = spawnOrganism(benchGenome, 600, 600, 0);
    juvenileOrg.age = 10.0; // Immature
    juvenileOrg.energy = 90000.0; // High energy
    const evalJuv = evaluateReproductionAffordability(juvenileOrg, reproState.simTime, 2, reproState.eggs.length);
    const juvBlocked = !evalJuv.eligible && evalJuv.statusText.includes('Immature');

    // Unaffordable reserve check (< 1 egg)
    const brokeAdult = spawnOrganism(benchGenome, 700, 700, 0);
    brokeAdult.age = 30.0;
    brokeAdult.energy = 15000.0; // Less than parentReserve (20k)
    const evalBroke = evaluateReproductionAffordability(brokeAdult, reproState.simTime, 3, reproState.eggs.length);
    const brokeBlocked = !evalBroke.eligible && evalBroke.statusText.includes('Foraging for 1st egg');

    const reproductionAffordability = laidEgg && cooldownActive && juvBlocked && brokeBlocked;
    details.push(`4. True Budget Reproduction & Scaled Clutch (Target: ${benchGenome.targetClutchSize}, Mature: ${benchGenome.maturityAge}s): Laid=${laidEgg} egg, CooldownSet=${cooldownActive}, JuvBlocked=${juvBlocked}, BrokeBlocked=${brokeBlocked} (Pass: ${reproductionAffordability})`);

    // --- TEST 5: RGB Optical Occlusion & Attenuation ---
    const testRayHit1 = rayCircleIntersection(0, 0, 1, 0, 200, 50, 0, 10);
    const testRayHit2 = rayCircleIntersection(0, 0, 1, 0, 200, 100, 0, 10);
    const raycastOcclusion = testRayHit1.hit && testRayHit2.hit && testRayHit1.dist < testRayHit2.dist;
    details.push(`5. RGB Optical Occlusion: Foreground at 50px correctly occludes 100px (Pass: ${raycastOcclusion})`);

    // --- TEST 6: PRNG Determinism (1000 draws) ---
    const prng1 = new XoshiroPRNG(4242);
    const prng2 = new XoshiroPRNG(4242);
    let prngDeterminism = true;
    for (let i = 0; i < 1000; i++) {
      if (prng1.nextUint32() !== prng2.nextUint32()) {
        prngDeterminism = false;
        break;
      }
    }
    details.push(`6. PRNG Determinism & Reproducibility: Pass: ${prngDeterminism}`);

    // --- TEST 7: Unfed Starvation Lifespan & Old Age Cause Recording ---
    const starterArchetypes: ArchetypeId[] = ['eel', 'flapper', 'tadpole', 'glider', 'predator', 'nematode'];
    let allArchetypesPassed = true;
    const lifespanReports: string[] = [];

    for (const arch of starterArchetypes) {
      const archGenome = createArchetypeGenome(arch, 1, [], new XoshiroPRNG(1234));
      const testOrg = spawnOrganism(archGenome, 500, 500, 0);
      const testOrgState: SimulationState = {
        simTime: 0,
        organisms: [testOrg],
        eggs: [],
        nutrients: [],
        bubbles: [],
        caustics: [],
        ledger: {externalInflow: 0, metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
        nutrientAccumulator: 0,
        totalBirths: 1,
        totalDeaths: 0,
        prng: new XoshiroPRNG(1234),
        lineage: new Map(),
        recentDeaths: [],
      };

      let survivalSeconds = 0;
      const simDt = 0.1;
      while (testOrg.energy > 0 && survivalSeconds < 400) {
        stepSimulation(testOrgState, testSettings, simDt);
        survivalSeconds += simDt;
        if (testOrgState.organisms.length === 0) break;
      }

      const passed = survivalSeconds >= 140 && survivalSeconds <= 320;
      if (!passed) allArchetypesPassed = false;
      lifespanReports.push(`${arch}: ${survivalSeconds.toFixed(1)}s`);
    }

    // Check Old Age death cause recording with positive reserve
    const oldAgeOrg = spawnOrganism(benchGenome, 800, 800, 0);
    oldAgeOrg.age = benchGenome.maxLifespan - 0.2;
    oldAgeOrg.energy = 50000.0; // Abundant reserves at senescence
    const oldAgeState: SimulationState = {
      simTime: 0,
      organisms: [oldAgeOrg],
      eggs: [],
      nutrients: [],
      bubbles: [],
      caustics: [],
      ledger: {externalInflow: 0, metabolicDissipation: 0, mechanicalWorkHeat: 0, recordedLosses: 0},
      nutrientAccumulator: 0,
      totalBirths: 1,
      totalDeaths: 0,
      prng: new XoshiroPRNG(888),
      lineage: new Map([
        [oldAgeOrg.id, {
          id: oldAgeOrg.id,
          parentIds: [],
          generation: 1,
          birthTime: 0,
          offspringCount: 0,
          archetype: 'Benchmark Nematode',
          hue: 195,
          diet: 'Herbivore',
          genome: benchGenome,
        }],
      ]),
      recentDeaths: [],
    };
    for (let st = 0; st < 100; st++) {
      stepSimulation(oldAgeState, testSettings, 0.05);
      if (oldAgeState.organisms.length === 0) break;
    }
    const recordedDeath = oldAgeState.recentDeaths[0];
    const oldAgeRecordedCorrectly = recordedDeath && recordedDeath.cause === 'Old Age' && recordedDeath.energyAtDeath > 0;

    details.push(`7. Unfed Starvation Lifespan & Old Age Cause (Pass: ${allArchetypesPassed && !!oldAgeRecordedCorrectly}): ${lifespanReports.join(', ')} · Senescence Cause: ${recordedDeath?.cause} (Energy: ${recordedDeath?.energyAtDeath.toFixed(0)}J)`);

    setDiagnosticResults({
      ran: true,
      comLocomotion,
      zeroDragConservation,
      eggEnergyAccounting,
      reproductionAffordability,
      raycastOcclusion,
      prngDeterminism,
      starvationLifespan: allArchetypesPassed && !!oldAgeRecordedCorrectly,
      details,
    });
    gameAudio.playConfirmSelect();
  }, []);

  // Initialize Simulation
  const initGame = useCallback(
    (preset = 'standard') => {
      const initCount = preset === 'megafauna' ? 12 : (getConfig('initialOrganisms') as number);
      const targetNutrients = targetNutrientAbundance ?? getConfig('targetNutrientCount') ?? 800;

      const newPRNG = new XoshiroPRNG(4242);
      const newOrganisms: Organism[] = [];
      const archetypeList: ArchetypeId[] = ['eel', 'flapper', 'tadpole', 'glider', 'predator', 'random'];

      const newLineage = new Map<string, LineageRecord>();

      for (let i = 0; i < initCount; i++) {
        let genome: Genome;
        if (preset === 'eel_swarm') {
          genome = createArchetypeGenome('eel', 1, [], newPRNG);
        } else if (preset === 'manta_colony') {
          genome = createArchetypeGenome('flapper', 1, [], newPRNG);
        } else if (preset === 'tadpole_school') {
          genome = createArchetypeGenome('tadpole', 1, [], newPRNG);
        } else if (preset === 'glider_fleet') {
          genome = createArchetypeGenome('glider', 1, [], newPRNG);
        } else if (preset === 'predator_cove') {
          genome = createArchetypeGenome('predator', 1, [], newPRNG);
        } else {
          const chosenArchetype = archetypeList[i % archetypeList.length];
          genome = createArchetypeGenome(chosenArchetype, 1, [], newPRNG);
        }

        const ox = newPRNG.range(250, worldWidth - 250);
        const oy = newPRNG.range(200, worldHeight - 200);
        const org = spawnOrganism(genome, ox, oy, newPRNG.range(0, Math.PI * 2));
        newOrganisms.push(org);

        newLineage.set(org.id, {
          id: org.id,
          parentIds: [],
          generation: 1,
          birthTime: 0,
          offspringCount: 0,
          archetype: genome.archetype || 'Genesis',
          hue: genome.hue,
          diet: getDietClassification(genome.mouths).label,
          genome,
        });
      }

      const newNutrients: Nutrient[] = [];
      let initialNutrientEnergy = 0;
      for (let i = 0; i < targetNutrients; i++) {
        newNutrients.push({
          id: `NUT-${newPRNG.nextUint32().toString(36)}`,
          x: newPRNG.range(40, worldWidth - 40),
          y: newPRNG.range(40, worldHeight - 40),
          vx: 0,
          vy: 0,
          energyValue: NUTRIENT_ENERGY_VALUE,
          radius: getNutrientRadius(NUTRIENT_ENERGY_VALUE),
          bottomTimer: 0,
          pulseTimer: newPRNG.range(0, Math.PI * 2),
        });
        initialNutrientEnergy += NUTRIENT_ENERGY_VALUE;
      }

      const newCaustics: CausticWave[] = [];
      for (let i = 0; i < 28; i++) {
        newCaustics.push({
          x: newPRNG.range(0, worldWidth),
          y: newPRNG.range(0, worldHeight),
          radius: newPRNG.range(140, 320),
          speed: newPRNG.range(0.2, 0.55),
          alpha: newPRNG.range(0.04, 0.10),
          angle: newPRNG.range(0, Math.PI * 2),
        });
      }

      let initialOrganismEnergy = 0;
      for (const org of newOrganisms) {
        initialOrganismEnergy += org.energy + org.structuralBiomass;
      }

      simStateRef.current = {
        simTime: 0,
        organisms: newOrganisms,
        eggs: [],
        nutrients: newNutrients,
        bubbles: [],
        caustics: newCaustics,
        ledger: {
          externalInflow: initialNutrientEnergy + initialOrganismEnergy,
          metabolicDissipation: 0,
          mechanicalWorkHeat: 0,
          recordedLosses: 0,
        },
        nutrientAccumulator: 0,
        totalBirths: newOrganisms.length,
        totalDeaths: 0,
        prng: newPRNG,
        lineage: newLineage,
        recentDeaths: [],
      };

      popHistoryRef.current = [newOrganisms.length];

      setSelectedOrgId(null);
      setSelectedSpecimen(null);
      setIsBrainInspectorOpen(false);
      setIsAutoTracking(false);
      cameraRef.current.x = worldWidth / 2;
      cameraRef.current.y = worldHeight / 2;
      cameraRef.current.targetX = worldWidth / 2;
      cameraRef.current.targetY = worldHeight / 2;
      cameraRef.current.zoom = 0.85;

      setGameState({
        status: 'PLAYING',
        score: newOrganisms.length,
        level: 1,
      });

      gameAudio.playConfirmSelect();
    },
    [worldWidth, worldHeight, targetNutrientAbundance],
  );


  // Manual Add Life
  const addPrimordialSpecimen = useCallback((archetype: ArchetypeId = 'random') => {
    const s = simStateRef.current;
    if (s.organisms.length >= 50) return;
    const cam = cameraRef.current;
    const ox = clampVal(cam.x + s.prng.range(-80, 80), 100, worldWidth - 100);
    const oy = clampVal(cam.y + s.prng.range(-80, 80), 100, worldHeight - 100);
    const genome = createArchetypeGenome(archetype, 1, [], s.prng);
    const specimen = spawnOrganism(genome, ox, oy, s.prng.range(0, Math.PI * 2));
    s.organisms.push(specimen);
    s.totalBirths += 1;
    s.ledger.externalInflow += specimen.energy + specimen.structuralBiomass;

    s.lineage.set(specimen.id, {
      id: specimen.id,
      parentIds: [],
      generation: 1,
      birthTime: s.simTime,
      offspringCount: 0,
      archetype: genome.archetype || 'Custom Seed',
      hue: genome.hue,
      diet: getDietClassification(genome.mouths).label,
      genome,
    });

    setSelectedOrgId(specimen.id);
    setSelectedSpecimen(specimen);
    gameAudio.playPowerupChime();

    setGameState((prev) => {
      if (prev.status === 'GAME_OVER') {
        return {...prev, status: 'PLAYING'};
      }
      return prev;
    });
  }, [worldWidth, worldHeight]);

  const hasAutoplayed = useRef(false);
  useEffect(() => {
    if (
      !hasAutoplayed.current &&
      new URLSearchParams(window.location.search).has('autoplay')
    ) {
      hasAutoplayed.current = true;
      initGame('standard');
    }
  }, [initGame]);

  // Spawn manual nutrient burst
  const spawnNutrientBurst = useCallback(
    (worldX?: number, worldY?: number, count = 15) => {
      const s = simStateRef.current;
      const currentCount = s.nutrients.length;
      const actualCount = Math.min(count, Math.max(0, 2200 - currentCount));
      if (actualCount <= 0) return;

      const cx = worldX !== undefined ? worldX : cameraRef.current.x + s.prng.range(-50, 50);
      const cy = worldY !== undefined ? worldY : cameraRef.current.y + s.prng.range(-50, 50);

      for (let i = 0; i < actualCount; i++) {
        s.nutrients.push({
          id: `NUT-${s.prng.nextUint32().toString(36)}`,
          x: clampVal(cx + s.prng.range(-80, 80), 40, worldWidth - 40),
          y: clampVal(cy + s.prng.range(-80, 80), 40, worldHeight - 40),
          vx: 0,
          vy: 0,
          energyValue: NUTRIENT_ENERGY_VALUE,
          radius: getNutrientRadius(NUTRIENT_ENERGY_VALUE),
          bottomTimer: 0,
          pulseTimer: s.prng.range(0, Math.PI * 2),
        });
        s.ledger.externalInflow += NUTRIENT_ENERGY_VALUE;
      }
      gameAudio.playPotionGulp();
    },
    [worldWidth, worldHeight],
  );

  // Feed All living organisms
  const feedAllOrganisms = useCallback(() => {
    const s = simStateRef.current;
    if (s.organisms.length === 0) {
      spawnNutrientBurst(worldWidth / 2, worldHeight / 2, 35);
      return;
    }
    for (const org of s.organisms) {
      if (s.nutrients.length >= 2200) break;
      const root = org.segments[0];
      for (let i = 0; i < 2; i++) {
        if (s.nutrients.length >= 2200) break;
        s.nutrients.push({
          id: `NUT-${s.prng.nextUint32().toString(36)}`,
          x: clampVal(root.x + s.prng.range(-60, 60), 40, worldWidth - 40),
          y: clampVal(root.y + s.prng.range(-60, 60), 40, worldHeight - 40),
          vx: 0,
          vy: 0,
          energyValue: NUTRIENT_ENERGY_VALUE,
          radius: getNutrientRadius(NUTRIENT_ENERGY_VALUE),
          bottomTimer: 0,
          pulseTimer: s.prng.range(0, Math.PI * 2),
        });
        s.ledger.externalInflow += NUTRIENT_ENERGY_VALUE;
      }
    }
    gameAudio.playPotionGulp();
  }, [worldWidth, worldHeight, spawnNutrientBurst]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();

        if (isBrainInspectorOpen) {
          setIsBrainInspectorOpen(false);
        } else if (selectedOrgId) {
          ignoreCanvasClickUntilRef.current = Date.now() + 400;
          setSelectedOrgId(null);
          setSelectedSpecimen(null);
          setIsAutoTracking(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isEcosystemGraphOpen) {
          setIsEcosystemGraphOpen(false);
        } else if (isSpecimenBankOpen) {
          setIsSpecimenBankOpen(false);
        } else if (isArenaOpen) {
          setIsArenaOpen(false);
        } else if (isHowToPlayOpen) {
          setIsHowToPlayOpen(false);
        } else {
          setIsGameMenuOpen((prev) => !prev);
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setGameState((prev) =>
          prev.status === 'PLAYING'
            ? {...prev, status: 'PAUSED'}
            : prev.status === 'PAUSED'
            ? {...prev, status: 'PLAYING'}
            : prev,
        );
      } else if (e.key.toLowerCase() === 'f') {
        spawnNutrientBurst();
      } else if (e.key.toLowerCase() === 'n') {
        addPrimordialSpecimen();
      } else if (e.key === '1') {
        setTimeMultiplier(1);
        gameAudio.playHoverMicroTone();
      } else if (e.key === '2') {
        setTimeMultiplier(2);
        gameAudio.playHoverMicroTone();
      } else if (e.key === '3') {
        setTimeMultiplier(5);
        gameAudio.playHoverMicroTone();
      } else if (e.key === '4') {
        setTimeMultiplier(10);
        gameAudio.playHoverMicroTone();
      } else if (e.key === '5') {
        setTimeMultiplier(20);
        gameAudio.playHoverMicroTone();
      } else if (e.key.toLowerCase() === 'b') {
        setIsBrainInspectorOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'g') {
        setIsEcosystemGraphOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 't') {
        setIsAutoTracking((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spawnNutrientBurst, addPrimordialSpecimen, isBrainInspectorOpen, selectedOrgId, isSettingsOpen, isEcosystemGraphOpen, isSpecimenBankOpen, isArenaOpen, isHowToPlayOpen]);

  // Zoom handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      cameraRef.current.zoom = clampVal(cameraRef.current.zoom * zoomFactor, 0.35, 2.8);
    };

    let touchStartDist = 0;
    let initialZoom = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
        initialZoom = cameraRef.current.zoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / touchStartDist;
        cameraRef.current.zoom = clampVal(initialZoom * factor, 0.35, 2.8);
      }
    };

    canvas.addEventListener('wheel', handleWheel, {passive: false});
    canvas.addEventListener('touchstart', handleTouchStart, {passive: true});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: true});

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Update Loop
  const update = (deltaTime: number) => {
    if (gameState.status !== 'PLAYING' || isGameMenuOpen) return;

    const multiplier = timeMultiplierRef.current;
    const fixedDt = 1 / 60;
    const s = simStateRef.current;

    const settings: SimulationSettings = {
      worldWidth,
      worldHeight,
      waterViscosity,
      targetNutrients: targetNutrientAbundance,
      inflowRate: nutrientInflowRate,
      kinshipProtection: kinshipProtectionEnabled,
      mutationSeverity: getConfig('mutationRate') as number,
      maxOrganisms: getConfig('maxOrganisms'),
    };

    // Computation budget cap (16ms per frame to prevent freezing)
    const frameStartTime = performance.now();
    let stepsRun = 0;

    for (let step = 0; step < multiplier; step++) {
      stepSimulation(s, settings, fixedDt, (evt) => {
        if (evt === 'clash') gameAudio.playSwordClash();
        else if (evt === 'eat') gameAudio.playCoinPickup();
        else if (evt === 'birth') gameAudio.playPowerupChime();
      });
      realTimeTrackerRef.current.physicsStepsThisSec += 1;
      stepsRun++;
      if (performance.now() - frameStartTime > 16.0 && multiplier > 20) break;
    }

    const tracker = realTimeTrackerRef.current;
    const now = performance.now();
    const realSecs = (now - tracker.lastRealTime) / 1000;
    tracker.lastRealTime = now;
    tracker.realSecsThisInterval += realSecs;
    tracker.simulatedSecsThisInterval += fixedDt * stepsRun;

    if (tracker.realSecsThisInterval >= 0.5) {
      tracker.achievedRatio = tracker.simulatedSecsThisInterval / Math.max(0.001, tracker.realSecsThisInterval);
      tracker.realSecsThisInterval = 0;
      tracker.simulatedSecsThisInterval = 0;
    }

    if (now - tracker.lastFPSUpdate >= 1000) {
      tracker.renderFPS = tracker.framesThisSec;
      tracker.physicsStepsPerSec = tracker.physicsStepsThisSec;
      tracker.framesThisSec = 0;
      tracker.physicsStepsThisSec = 0;
      tracker.lastFPSUpdate = now;
    }

    // Camera follow
    const cam = cameraRef.current;
    if (isAutoTracking && selectedOrgId) {
      const tracked = s.organisms.find((o) => o.id === selectedOrgId);
      if (tracked && !tracked.dissolving) {
        cam.targetX = tracked.segments[0].x;
        cam.targetY = tracked.segments[0].y;
      } else {
        setSelectedOrgId(null);
        setSelectedSpecimen(null);
        setIsAutoTracking(false);
      }
    }
    cam.x += (cam.targetX - cam.x) * Math.min(1, deltaTime * 5);
    cam.y += (cam.targetY - cam.y) * Math.min(1, deltaTime * 5);

    statsTimerRef.current += fixedDt * stepsRun;
    if (statsTimerRef.current >= 0.25) {
      statsTimerRef.current = 0;

      let maxGen = 1;
      let totalGen = 0;
      let topSpeed = 0;
      let totalBiomass = 0;
      let totalReserves = 0;
      let herbivores = 0;
      let carnivores = 0;
      let omnivores = 0;
      let mixed = 0;

      for (const o of s.organisms) {
        if (o.genome.generation > maxGen) maxGen = o.genome.generation;
        totalGen += o.genome.generation;
        if (o.speed > topSpeed) topSpeed = o.speed;
        totalBiomass += o.structuralBiomass;
        totalReserves += Math.max(0, o.energy);

        const diet = getDietClassification(o.genome.mouths);
        if (diet.category === 'Carnivore') carnivores++;
        else if (diet.category === 'Omnivore') omnivores++;
        else if (diet.category === 'Herbivore') herbivores++;
        else if (diet.category === 'Mixed') mixed++;
      }

      let totalEggJ = 0;
      for (const egg of s.eggs) totalEggJ += (egg.fundedStructural + egg.fundedReserve);

      let totalFoodJ = 0;
      for (const nut of s.nutrients) totalFoodJ += nut.energyValue;

      setEcoStats({
        simTime: Math.round(s.simTime * 10) / 10,
        livingCount: s.organisms.length,
        eggCount: s.eggs.length,
        maxGeneration: maxGen,
        avgGeneration: s.organisms.length > 0 ? Math.round((totalGen / s.organisms.length) * 10) / 10 : 1,
        totalBirths: s.totalBirths,
        totalDeaths: s.totalDeaths,
        fastestSpeed: Math.round(topSpeed * 10) / 10,
        nutrientCount: s.nutrients.length,
        targetNutrients: targetNutrientAbundance,
        totalStoredBiomass: Math.round(totalBiomass),
        totalStoredReserves: Math.round(totalReserves),
        totalEggEnergy: Math.round(totalEggJ),
        totalFoodEnergy: Math.round(totalFoodJ),
        totalExternalInflow: Math.round(s.ledger.externalInflow),
        totalMetabolicHeat: Math.round(s.ledger.metabolicDissipation),
        totalMechanicalHeat: Math.round(s.ledger.mechanicalWorkHeat),
        totalRecordedLosses: Math.round(s.ledger.recordedLosses),
        herbivoreCount: herbivores,
        carnivoreCount: carnivores,
        omnivoreCount: omnivores,
        mixedCount: mixed,
        simTimeRatio: Math.round(tracker.achievedRatio * 10) / 10,
        renderFPS: tracker.renderFPS,
        physicsStepsPerSec: tracker.physicsStepsPerSec,
      });

      const selected = selectedOrgId ? s.organisms.find((o) => o.id === selectedOrgId) : null;
      setSelectedSpecimen(selected || null);

      popHistoryRef.current.push(s.organisms.length);
      if (popHistoryRef.current.length > 60) popHistoryRef.current.shift();

      if (s.organisms.length === 0 && s.eggs.length === 0) {
        if (gameState.status === 'PLAYING') {
          setGameState((prev) => ({...prev, status: 'GAME_OVER'}));
          gameAudio.playDefeatMotif();
        }
      } else {
        setGameState((prev) => ({
          ...prev,
          score: Math.max(prev.score, maxGen * 100 + s.totalBirths * 10),
          level: maxGen,
        }));
      }
    }
  };

  // Rendering Pipeline
  const draw = (ctx: CanvasRenderingContext2D) => {
    realTimeTrackerRef.current.framesThisSec += 1;
    prepareCanvas(ctx, canvasWidth, canvasHeight);

    const s = simStateRef.current;
    const cam = cameraRef.current;
    const zoom = cam.zoom;

    // Deep water background
    ctx.save();
    const bgGrad = ctx.createRadialGradient(
      canvasWidth / 2, canvasHeight / 2, 80,
      canvasWidth / 2, canvasHeight / 2, canvasWidth,
    );
    bgGrad.addColorStop(0, '#0a1e3f');
    bgGrad.addColorStop(0.5, '#051126');
    bgGrad.addColorStop(1, '#020610');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Camera Transform
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-cam.x, -cam.y);

    // Tank Boundaries & Grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 4 / zoom;
    ctx.strokeRect(0, 0, worldWidth, worldHeight);

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= worldWidth; gx += 200) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, worldHeight);
      ctx.stroke();
    }
    for (let gy = 0; gy <= worldHeight; gy += 200) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(worldWidth, gy);
      ctx.stroke();
    }

    // Caustics
    for (const c of s.caustics) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(c.x, c.y, Math.max(0, c.radius), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${c.alpha})`;
      ctx.filter = 'blur(16px)';
      ctx.fill();
      ctx.restore();
    }

    // Movement Traces
    if (showTraces) {
      for (const org of s.organisms) {
        if (!org.traceHistory || org.traceHistory.length < 2) continue;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(org.traceHistory[0].x, org.traceHistory[0].y);
        for (let i = 1; i < org.traceHistory.length; i++) {
          ctx.lineTo(org.traceHistory[i].x, org.traceHistory[i].y);
        }
        ctx.strokeStyle = `hsla(${org.genome.hue}, 90%, 65%, 0.35)`;
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Nutrients
    const nutImg = assets['nutrientParticle'];
    const nutAspect = (getConfig('assetNutrientParticleAspectRatio') as number) || 1.0;
    for (const nut of s.nutrients) {
      const isSuper = nut.isSuper || nut.energyValue > NUTRIENT_ENERGY_VALUE * 1.25;
      const baseRadius = Math.max(6.0, nut.radius);
      const pulse = 1.0 + Math.sin(nut.pulseTimer || 0) * 0.12;

      ctx.save();
      ctx.translate(nut.x, nut.y);
      ctx.scale(pulse, pulse);

      const auraRad = Math.max(14, baseRadius * 2.6);
      const auraGrad = ctx.createRadialGradient(0, 0, baseRadius * 0.3, 0, 0, auraRad);
      if (isSuper) {
        auraGrad.addColorStop(0, 'rgba(52, 211, 153, 0.9)');
        auraGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.5)');
        auraGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      } else {
        auraGrad.addColorStop(0, 'rgba(34, 224, 120, 0.75)');
        auraGrad.addColorStop(0.45, 'rgba(16, 185, 129, 0.35)');
        auraGrad.addColorStop(1, 'rgba(5, 150, 105, 0)');
      }
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, auraRad, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = isSuper ? '#4ade80' : '#22e078';
      ctx.fill();
      ctx.strokeStyle = isSuper ? '#a7f3d0' : '#6ee7b7';
      ctx.lineWidth = Math.max(1.2, 2.0 / zoom);
      ctx.stroke();

      if (nutImg && nutImg.complete && nutImg.naturalWidth > 0) {
        const drawSize = baseRadius * 2.2;
        ctx.drawImage(nutImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize / nutAspect);
      }

      ctx.restore();
    }

    // Eggs
    const eggImg = assets['organismEgg'];
    const eggAspect = (getConfig('assetOrganismEggAspectRatio') as number) || 0.785;
    for (const egg of s.eggs) {
      const eggHeight = 32;
      const eggWidth = eggHeight * eggAspect;
      const pulse = 1 + Math.sin(egg.pulseTimer) * 0.08;

      ctx.save();
      ctx.translate(egg.x, egg.y);
      ctx.scale(pulse, pulse);

      const eggGlow = ctx.createRadialGradient(0, 0, 6, 0, 0, 24);
      eggGlow.addColorStop(0, `hsla(${egg.colorHue}, 90%, 65%, 0.5)`);
      eggGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = eggGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, eggHeight * 0.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * egg.incubationProgress);
      ctx.strokeStyle = egg.readyToHatch ? '#34d399' : `hsl(${egg.colorHue}, 90%, 65%)`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      drawAsset(
        ctx,
        eggImg,
        -eggWidth / 2,
        -eggHeight / 2,
        eggWidth,
        eggHeight,
        (fallbackCtx) => {
          fallbackCtx.beginPath();
          fallbackCtx.ellipse(0, 0, eggWidth / 2, eggHeight / 2, 0, 0, Math.PI * 2);
          fallbackCtx.fillStyle = `hsla(${egg.colorHue}, 80%, 60%, 0.7)`;
          fallbackCtx.strokeStyle = '#38bdf8';
          fallbackCtx.lineWidth = 2;
          fallbackCtx.fill();
          fallbackCtx.stroke();
        },
      );
      ctx.restore();
    }

    // Bubbles
    for (const b of s.bubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, Math.max(0, b.size), 0, Math.PI * 2);
      ctx.fillStyle = hsl(b.hue, 80, 75, b.alpha);
      ctx.fill();
    }

    // Organisms
    for (const org of s.organisms) {
      const g = org.genome;
      const isSelected = org.id === selectedOrgId;
      const alpha = org.dissolving ? org.dissolveAlpha : 1.0;

      // Selection Aura & Multi-Ray Radar
      if (isSelected) {
        ctx.save();
        const root = org.segments[0];
        ctx.beginPath();
        ctx.arc(root.x, root.y, g.parts[0].width * 1.5 + Math.sin(org.glowPulse) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
        ctx.lineWidth = 2.5 / zoom;
        ctx.setLineDash([6 / zoom, 6 / zoom]);
        ctx.stroke();

        for (const ray of org.rayHits) {
          ctx.beginPath();
          ctx.moveTo(org.segments[0].x, org.segments[0].y);
          ctx.lineTo(ray.pointX, ray.pointY);
          ctx.strokeStyle = `rgba(${Math.round(ray.r * 255)}, ${Math.round(ray.g * 255)}, ${Math.round(ray.b * 255)}, 0.45)`;
          ctx.lineWidth = 1.2 / zoom;
          ctx.stroke();

          if (ray.hit) {
            ctx.beginPath();
            ctx.arc(ray.pointX, ray.pointY, 3 / zoom, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${Math.round(ray.r * 255)}, ${Math.round(ray.g * 255)}, ${Math.round(ray.b * 255)})`;
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // Render Segments with Discrete NxM grid lines
      for (let sIdx = org.segments.length - 1; sIdx >= 0; sIdx--) {
        const seg = org.segments[sIdx];
        const pDef = g.parts[sIdx];

        ctx.save();
        ctx.translate(seg.x, seg.y);
        ctx.rotate(seg.angle);
        ctx.globalAlpha = alpha;

        const w = pDef.width;
        const h = pDef.height;

        const partHue = sanitizeCreatureHue(g.hue + sIdx * 8);
        const partLight = org.energy < g.maxEnergyCapacity * 0.2 ? 30 : g.lightness;

        ctx.fillStyle = hsl(partHue, g.saturation, partLight, 0.88);
        ctx.strokeStyle = hsl(partHue, 95, 80, 0.95);
        ctx.lineWidth = 2;

        const cornerRad = Math.min(w * 0.35, h * 0.35, 6);
        ctx.beginPath();
        ctx.roundRect(-w * 0.5, -h * 0.5, w, h, [cornerRad, cornerRad, cornerRad, cornerRad]);
        ctx.fill();
        ctx.stroke();

        // Discrete NxM Grid Internal Cell Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        for (let n = 1; n < pDef.dimN; n++) {
          const gx = -w * 0.5 + n * UNIT_SIZE;
          ctx.beginPath();
          ctx.moveTo(gx, -h * 0.45);
          ctx.lineTo(gx, h * 0.45);
          ctx.stroke();
        }
        for (let m = 1; m < pDef.dimM; m++) {
          const gy = -h * 0.5 + m * UNIT_SIZE;
          ctx.beginPath();
          ctx.moveTo(-w * 0.45, gy);
          ctx.lineTo(w * 0.45, gy);
          ctx.stroke();
        }

        // Joint Node
        if (sIdx > 0) {
          const childAnchor = getChildAnchorForParentDir(pDef.attachmentPoint, w, h);
          ctx.beginPath();
          ctx.arc(childAnchor.x, childAnchor.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
        }

        // Sensory Eyes
        const partEyes = g.eyes.filter((e) => e.partIndex === sIdx);
        for (const eye of partEyes) {
          const eyeLoc = getCardinalAnchor(eye.direction, w, h);
          ctx.beginPath();
          ctx.arc(eyeLoc.x, eyeLoc.y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          const lookDir = getCardinalAnchor(eye.direction, 2.5, 2.5);
          ctx.beginPath();
          ctx.arc(eyeLoc.x + lookDir.x * 0.5, eyeLoc.y + lookDir.y * 0.5, 2.0, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.fill();
        }

        // Sensory Mouths with Exact Physical Aperture Outlines
        const partMouths = g.mouths.filter((m) => m.partIndex === sIdx);
        for (const mouth of partMouths) {
          const mouthLoc = getCardinalAnchor(mouth.direction, w, h);
          const isCarn = mouth.mouthType === 'carnivore';
          const isOmni = mouth.mouthType === 'omnivore';

          const mouthRadius = isCarn ? 4.5 : isOmni ? 4.0 : 3.5;
          const halfAperture = Math.max(mouthRadius, mouth.intakeWidth * 0.5);

          // Physical Feeding Aperture Slot Indicator (Visible under HUD toggle or selection)
          if (showMouthApertures || isSelected) {
            ctx.save();
            const normDir = getCardinalOutwardNormal(mouth.direction);
            const tanX = -normDir.y;
            const tanY = normDir.x;
            const a1x = mouthLoc.x - tanX * halfAperture;
            const a1y = mouthLoc.y - tanY * halfAperture;
            const a2x = mouthLoc.x + tanX * halfAperture;
            const a2y = mouthLoc.y + tanY * halfAperture;

            // Aperture span line
            ctx.beginPath();
            ctx.moveTo(a1x, a1y);
            ctx.lineTo(a2x, a2y);
            ctx.strokeStyle = isCarn ? '#f43f5e' : isOmni ? '#c084fc' : '#34d399';
            ctx.lineWidth = Math.max(1.5, 2.5 / zoom);
            ctx.stroke();

            // Geometric contact halo
            ctx.beginPath();
            ctx.arc(mouthLoc.x, mouthLoc.y, mouthRadius, 0, Math.PI * 2);
            ctx.fillStyle = isCarn
              ? 'rgba(244, 63, 94, 0.35)'
              : isOmni
              ? 'rgba(192, 132, 252, 0.35)'
              : 'rgba(52, 211, 153, 0.35)';
            ctx.fill();
            ctx.restore();
          }

          if (isCarn) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(mouthLoc.x, mouthLoc.y, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = '#e11d48';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.strokeStyle = '#ffe4e6';
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.restore();
          } else if (isOmni) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(mouthLoc.x, mouthLoc.y, 6.0, 0, Math.PI * 2);
            ctx.fillStyle = '#9333ea';
            ctx.shadowColor = '#d946ef';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.strokeStyle = '#f0abfc';
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(mouthLoc.x, mouthLoc.y, 5.0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
            ctx.strokeStyle = '#6ee7b7';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      // Gravid Aura
      if (org.isGravid) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(org.segments[0].x, org.segments[0].y, g.parts[0].width * 1.2, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${g.hue}, 100%, 75%, ${0.4 + Math.sin(org.glowPulse) * 0.4})`;
        ctx.lineWidth = 3 / zoom;
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  };

  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  updateRef.current = update;
  drawRef.current = draw;

  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      if (inputRef.current) {
        const ptr = inputRef.current.pointer;
        const cam = cameraRef.current;
        const pState = pointerDownStateRef.current;
        const s = simStateRef.current;

        if (ptr.down) {
          if (!pState.active) {
            pState.active = true;
            pState.x = ptr.x;
            pState.y = ptr.y;
            pState.time = Date.now();
            cam.isDragging = true;
            cam.lastDragX = ptr.x;
            cam.lastDragY = ptr.y;
          } else {
            const dx = (ptr.x - cam.lastDragX) / cam.zoom;
            const dy = (ptr.y - cam.lastDragY) / cam.zoom;
            const totalMoveDist = Math.hypot(ptr.x - pState.x, ptr.y - pState.y);
            if (totalMoveDist > 5) {
              cam.targetX -= dx;
              cam.targetY -= dy;
              setIsAutoTracking(false);
            }
            cam.lastDragX = ptr.x;
            cam.lastDragY = ptr.y;
          }
        } else {
          if (pState.active) {
            const totalMoveDist = Math.hypot(ptr.x - pState.x, ptr.y - pState.y);
            const pressDuration = Date.now() - pState.time;
            pState.active = false;
            cam.isDragging = false;

            if (totalMoveDist < 6 && pressDuration < 500 && Date.now() > ignoreCanvasClickUntilRef.current) {
              const worldX = cam.x + (pState.x - canvasWidth / 2) / cam.zoom;
              const worldY = cam.y + (pState.y - canvasHeight / 2) / cam.zoom;

              let clickedOrg: Organism | null = null;
              for (const org of s.organisms) {
                for (const seg of org.segments) {
                  const dist = Math.hypot(seg.x - worldX, seg.y - worldY);
                  if (dist < 45 / cam.zoom) {
                    clickedOrg = org;
                    break;
                  }
                }
                if (clickedOrg) break;
              }

              if (clickedOrg) {
                setSelectedOrgId(clickedOrg.id);
                setSelectedSpecimen(clickedOrg);
                setIsBrainInspectorOpen(true);
                setIsAutoTracking(true);
                gameAudio.playConfirmSelect();
              } else {
                setSelectedOrgId(null);
                setSelectedSpecimen(null);
                setIsBrainInspectorOpen(false);
                setIsAutoTracking(false);
              }
            }
          }
        }
      }

      stepperRef.current?.(time, (dt) => updateRef.current(dt));

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawRef.current(ctx);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [canvasWidth, canvasHeight]);

  const isMusicPlaying = !musicMuted && gameState.status === 'PLAYING';

  return (
    <div className="fixed inset-0 overflow-hidden touch-none flex flex-col items-center justify-between bg-slate-950 text-white select-none">
      {!assetsReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-cyan-400">
          <Sparkles className="animate-spin mb-4" size={36} />
          <div className="text-xl font-bold tracking-widest font-mono">
            VIDA: COMPILING RECURRENT CONTROLLERS...
          </div>
        </div>
      )}

      <BackgroundMusic url={ambientMusicUrl} isPlaying={isMusicPlaying} isMuted={musicMuted} volume={getConfig('defaultMusicVolume')} />

      {/* TOP DEDICATED TELEMETRY HUD BAR */}
      <header className="w-full bg-slate-900/95 border-b border-cyan-500/20 backdrop-blur-md px-3 py-2 flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono font-black text-xs md:text-sm tracking-wider text-cyan-300">
            VIDA
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            GEN {ecoStats.maxGeneration}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono" title="Simulation-to-Real Time Ratio & FPS">
            {ecoStats.simTimeRatio}x ({ecoStats.renderFPS} FPS · {ecoStats.physicsStepsPerSec} Steps/s)
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            t = {ecoStats.simTime}s
          </span>
        </div>

        {/* Live Counters with Fixed Stable Widths (Zero Layout Jitter) */}
        <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs font-mono flex-wrap">
          <div className="flex items-center gap-1 text-emerald-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
            <Activity size={13} />
            <span>Alive: <strong className="text-white">{ecoStats.livingCount}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
            <span>🌿 Herb: <strong className="text-white">{ecoStats.herbivoreCount}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
            <span>🥩 Carn: <strong className="text-white">{ecoStats.carnivoreCount}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
            <span>🟣 Omni: <strong className="text-white">{ecoStats.omnivoreCount}</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
            <span>🧬 Mixed: <strong className="text-white">{ecoStats.mixedCount}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
            <span>🥚 Eggs: <strong className="text-white">{ecoStats.eggCount}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Food: <strong className="text-white">{ecoStats.nutrientCount}</strong><span className="text-emerald-300/60"> / {ecoStats.targetNutrients}</span></span>
          </div>
        </div>

        {/* Speed Controls & Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addPrimordialSpecimen();
            }}
            title="Seed Primordial Specimen"
            className="px-2.5 py-1 rounded-lg bg-emerald-600/30 border border-emerald-400/50 hover:bg-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors">
            <Plus size={14} />
            <span className="hidden sm:inline">Add Life</span>
          </button>

          {/* Time Multiplier buttons */}
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-700">
            {([1, 2, 5, 10, 20, 50] as const).map((spd) => (
              <button
                key={spd}
                onClick={(e) => {
                  e.stopPropagation();
                  setTimeMultiplier(spd);
                  gameAudio.playHoverMicroTone();
                }}
                className={`px-1.5 md:px-2 py-1 text-[11px] font-mono rounded font-bold transition-colors ${
                  timeMultiplier === spd
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}>
                {spd === 50 ? 'MAX' : `${spd}x`}
              </button>
            ))}
          </div>

          {/* Specimen Bank Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSpecimenBankOpen((prev) => !prev);
              gameAudio.playCrispClick();
            }}
            title="Specimen Bank (Save & Spawn Custom Genomes)"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isSpecimenBankOpen
                ? 'bg-purple-600/30 border-purple-400 text-purple-300 ring-1 ring-purple-400/50'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}>
            <FolderOpen size={15} />
            <span className="hidden sm:inline font-bold">Bank</span>
          </button>

          {/* Recurrent Brain & Synapse Inspector */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isBrainInspectorOpen) {
                setIsBrainInspectorOpen(false);
                gameAudio.playCrispClick();
              } else {
                if (!selectedOrgId && simStateRef.current.organisms.length > 0) {
                  const first = simStateRef.current.organisms[0];
                  setSelectedOrgId(first.id);
                  setSelectedSpecimen(first);
                }
                setIsBrainInspectorOpen(true);
                gameAudio.playCrispClick();
              }
            }}
            title="Inspect Specimen Brain & Vision Rays"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isBrainInspectorOpen
                ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/50'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}>
            <Network size={15} className="text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline font-bold">Inspector</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsOpen((prev) => !prev);
              gameAudio.playCrispClick();
            }}
            title="Ecology & Physical Settings"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isSettingsOpen
                ? 'bg-amber-600/30 border-amber-400 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}>
            <Sliders size={15} />
            <span className="hidden sm:inline font-bold">Settings</span>
          </button>

          {/* Ecosystem Graph Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEcosystemGraphOpen((prev) => !prev);
              gameAudio.playCrispClick();
            }}
            title="Ecosystem Telemetry Graph"
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isEcosystemGraphOpen
                ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}>
            <Activity size={15} />
            <span className="hidden sm:inline">Ledger</span>
          </button>

          {/* Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsGameMenuOpen(true);
              gameAudio.playCrispClick();
            }}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 hover:bg-slate-700 flex items-center gap-1 text-xs">
            <Menu size={16} />
            <span className="hidden md:inline">Menu</span>
          </button>
        </div>
      </header>

      {/* MAIN SIMULATION CANVAS */}
      <div className="flex-1 w-full min-h-0 relative flex items-center justify-center bg-slate-950 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            aspectRatio: `${canvasWidth} / ${canvasHeight}`,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
          className="w-auto h-auto max-w-full max-h-full cursor-grab active:cursor-grabbing block"
        />

        {/* CREATURE'S-EYE RETINAL HUD STRIP (When creature is selected) */}
        {selectedSpecimen && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-3 py-1.5 flex items-center gap-3 z-30 font-mono text-[11px] shadow-lg">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Eye size={14} className="text-cyan-400" />
              <span>RETINAL VIEW:</span>
            </div>
            <div className="flex items-center gap-1">
              {selectedSpecimen.rayHits.map((ray, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-4 h-4 rounded border border-white/30 shadow-inner"
                    style={{backgroundColor: `rgb(${Math.round(ray.r * 255)}, ${Math.round(ray.g * 255)}, ${Math.round(ray.b * 255)})`}}
                    title={`Ray ${idx + 1}: ${ray.hit ? ray.objectType : 'ambient water'} @ ${Math.round(ray.dist)}px`}
                  />
                  <span className="text-[8px] text-slate-400 mt-0.5">{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DRAGGABLE FLOATING SPECIMEN QUICK BADGE */}
        {selectedSpecimen && (() => {
          const dietInfo = getDietClassification(selectedSpecimen.genome.mouths);
          const lifeStage = getLifeStage(selectedSpecimen);
          const remainingLifespan = Math.max(0, selectedSpecimen.maxLifespan - selectedSpecimen.age);
          const isAging = lifeStage === 'Aging';
          const reproStatus = evaluateReproductionAffordability(
            selectedSpecimen,
            ecoStats.simTime,
            ecoStats.livingCount,
            ecoStats.eggCount,
            getConfig('maxOrganisms'),
          );

          return (
            <div
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              style={{
                transform: `translate3d(${badgeDraggable.pos.x}px, ${badgeDraggable.pos.y}px, 0)`,
                pointerEvents: 'auto',
              }}
              className={`absolute top-0 left-0 bg-slate-900/95 backdrop-blur-md border rounded-2xl p-3 max-w-xs text-xs font-mono shadow-2xl flex flex-col gap-1.5 pointer-events-auto z-30 transition-all ${
                isAging
                  ? 'border-amber-500/80 shadow-amber-500/20 ring-1 ring-amber-400/40'
                  : 'border-cyan-500/40 shadow-cyan-500/10'
              }`}>
              <div
                {...badgeDraggable.headerProps}
                className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-1.5 cursor-grab active:cursor-grabbing select-none">
                <div
                  className="flex items-center gap-1.5 font-bold text-cyan-300 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBrainInspectorOpen(true);
                    gameAudio.playCrispClick();
                  }}>
                  <GripHorizontal size={14} className="text-slate-500" />
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{backgroundColor: hsl(selectedSpecimen.genome.hue, 90, 60)}}
                  />
                  <span>{selectedSpecimen.id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      saveCurrentSpecimenToBank();
                    }}
                    title="Save to Specimen Bank"
                    className="text-[10px] px-1.5 py-0.5 rounded border bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/50">
                    <Save size={11} className="inline mr-0.5" />
                    Save
                  </button>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsBrainInspectorOpen((prev) => !prev);
                      gameAudio.playCrispClick();
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded border bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50">
                    Inspect
                  </button>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsAutoTracking((prev) => !prev);
                    }}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                      isAutoTracking
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800 border-slate-600 text-slate-400'
                    }`}>
                    {isAutoTracking ? 'Track' : 'Free'}
                  </button>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      closeInspector(e);
                    }}
                    title="Deselect creature (✕)"
                    className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700">
                    ✕
                  </button>
                </div>
              </div>

              {/* Life Stage & Aging Banner */}
              <div className="flex items-center justify-between gap-1 text-[10px]">
                <span className="text-slate-400">Life Stage:</span>
                <span
                  className={`px-2 py-0.5 rounded-full border font-bold text-[10px] flex items-center gap-1 ${
                    lifeStage === 'Juvenile'
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : lifeStage === 'Adult'
                      ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                      : lifeStage === 'Aging'
                      ? 'bg-amber-950/90 border-amber-500/70 text-amber-300 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}>
                  {lifeStage === 'Juvenile' && '🌱 Juvenile'}
                  {lifeStage === 'Adult' && '👑 Adult'}
                  {lifeStage === 'Aging' && '⚠️ Aging (Senescent)'}
                  {lifeStage === 'Deceased' && '💀 Deceased'}
                </span>
              </div>

              {isAging && (
                <div className="bg-amber-950/50 border border-amber-500/40 rounded-lg p-1.5 text-[9px] text-amber-300 flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                  <span>Approaching max lifespan ({remainingLifespan.toFixed(1)}s remaining)</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300 pt-0.5">
                <div>Gen: <span className="text-white font-bold">{selectedSpecimen.genome.generation}</span></div>
                <div>Lineage: <span className="text-amber-300 font-bold truncate inline-block max-w-[100px] align-bottom">{selectedSpecimen.genome.archetype || 'Genesis'}</span></div>
                <div className="col-span-2">
                  Diet: <span className={`${dietInfo.textClass} font-bold`}>{dietInfo.label} {dietInfo.icon}</span>
                </div>
                <div className="col-span-2">
                  Age: <span className="text-cyan-300 font-bold">{selectedSpecimen.age.toFixed(1)}s</span> / {selectedSpecimen.maxLifespan.toFixed(0)}s <span className="text-slate-500">({remainingLifespan.toFixed(1)}s left)</span>
                </div>
                <div>DNA Clutch: <span className="text-amber-300 font-bold">{selectedSpecimen.genome.targetClutchSize || 2} eggs</span></div>
                <div>Maturity: <span className="text-emerald-300 font-bold">{(selectedSpecimen.genome.maturityAge || 20.0).toFixed(1)}s</span></div>
                <div>Organs: <span className="text-cyan-300 font-bold">{selectedSpecimen.genome.mouths.length}M · {selectedSpecimen.genome.eyes.length}E</span></div>
                <div>Biomass: <span className="text-purple-300 font-bold">{formatJoules(selectedSpecimen.structuralBiomass)}</span></div>
                <div>Clutches: <span className="text-amber-300 font-bold">{selectedSpecimen.clutchesLaid || 0} ({selectedSpecimen.offspringCount} eggs)</span></div>
                <div>Food Eaten: <span className="text-emerald-400 font-bold">{selectedSpecimen.foodEaten || 0}</span></div>
              </div>

              {/* Reproduction Status Pill (Disambiguated from Life Stage) */}
              <div className="mt-1 pt-1 border-t border-slate-800">
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-slate-400 font-bold">Reproduction:</span>
                  <span className={`px-2 py-0.5 rounded border text-[9px] ${reproStatus.badgeClass}`}>
                    {reproStatus.statusText}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>Reserve: {formatJoules(selectedSpecimen.energy)} / {formatJoules(selectedSpecimen.genome.maxEnergyCapacity)}</span>
                  <span>Reserve Floor: {formatJoules(reproStatus.parentReserve)}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-150"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, (selectedSpecimen.energy / Math.max(1, selectedSpecimen.genome.maxEnergyCapacity)) * 100),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* TOAST NOTIFICATION BADGE */}
        {saveNotification && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-900/90 to-emerald-900/90 border border-emerald-400 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-2 z-50 font-mono text-xs font-bold text-emerald-300 shadow-2xl animate-bounce">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{saveNotification}</span>
          </div>
        )}

        {/* DRAGGABLE SETTINGS & "BRANCH THIS ECOSYSTEM" PANEL */}
        {isSettingsOpen && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate3d(${settingsDraggable.pos.x}px, ${settingsDraggable.pos.y}px, 0)`,
              pointerEvents: 'auto',
            }}
            className="absolute top-0 left-0 bg-slate-900/95 backdrop-blur-lg border border-amber-500/50 rounded-2xl p-4 w-88 font-mono text-xs shadow-2xl z-40 pointer-events-auto">
            <div
              {...settingsDraggable.headerProps}
              className="flex items-center justify-between border-b border-amber-500/30 pb-2 mb-3 cursor-grab active:cursor-grabbing select-none">
              <div className="flex items-center gap-2">
                <GripHorizontal className="text-amber-400" size={16} />
                <Sliders className="text-amber-400" size={16} />
                <span className="font-bold text-amber-300 text-sm">ENVIRONMENT & BRANCHING</span>
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsSettingsOpen(false);
                  gameAudio.playCrispClick();
                }}
                title="Close settings (✕)"
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
              {/* Branch Ecosystem Button */}
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                  <Split size={15} />
                  <span>Branch this Ecosystem</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Snapshots the live world and forks a parallel branch to explore environmental changes.
                </p>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customBranchName}
                    onChange={(e) => setCustomBranchName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-purple-500/40 rounded px-2 py-1 text-[11px] text-white"
                  />
                  <button
                    onClick={branchEcosystem}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[11px]">
                    Fork
                  </button>
                </div>
              </div>

              {/* Inflow Rate */}
              <div>
                <div className="flex justify-between items-center mb-1 text-slate-300 text-[11px]">
                  <span className="font-bold text-purple-300">Nutrient Inflow Rate:</span>
                  <span className="text-purple-400 font-bold">
                    {nutrientInflowRate === 0 ? '0.0 items/s (Disabled)' : `${nutrientInflowRate.toFixed(1)} items/s`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="1"
                  value={nutrientInflowRate}
                  onChange={(e) => setNutrientInflowRate(parseFloat(e.target.value))}
                  className="w-full h-2 accent-purple-400 cursor-pointer bg-slate-950 rounded-lg"
                />
              </div>

              {/* Target Abundance */}
              <div>
                <div className="flex justify-between items-center mb-1 text-slate-300 text-[11px]">
                  <span>Nutrient Target Abundance:</span>
                  <span className="text-emerald-300 font-bold">{targetNutrientAbundance}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={targetNutrientAbundance}
                  onChange={(e) => setTargetNutrientAbundance(parseInt(e.target.value, 10))}
                  className="w-full h-2 accent-emerald-400 cursor-pointer bg-slate-950 rounded-lg"
                />
              </div>

              {/* Water Viscosity */}
              <div>
                <div className="flex justify-between items-center mb-1 text-slate-300 text-[11px]">
                  <span>Water Viscosity (&mu;):</span>
                  <span className="text-cyan-300 font-bold">{waterViscosity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.6"
                  step="0.01"
                  value={waterViscosity}
                  onChange={(e) => setWaterViscosity(parseFloat(e.target.value))}
                  className="w-full h-2 accent-cyan-400 cursor-pointer bg-slate-950 rounded-lg"
                />
              </div>

              {/* Kinship & Traces */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-300 font-bold">Kinship Protection:</span>
                <button
                  onClick={() => setKinshipProtectionEnabled((prev) => !prev)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    kinshipProtectionEnabled
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                  {kinshipProtectionEnabled ? 'Protected (On)' : 'Natural (Off)'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-300 font-bold">Movement Traces:</span>
                <button
                  onClick={() => setShowTraces((prev) => !prev)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    showTraces
                      ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                  {showTraces ? 'Visible' : 'Hidden'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-300 font-bold">Mouth Apertures:</span>
                <button
                  onClick={() => setShowMouthApertures((prev) => !prev)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    showMouthApertures
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                  {showMouthApertures ? 'Visible' : 'Hidden'}
                </button>
              </div>

              {/* Persistence: Export & Import JSON */}
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  onClick={exportEcosystemJSON}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold flex items-center justify-center gap-1 text-[11px]">
                  <Download size={13} />
                  Export JSON
                </button>
                <label className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold flex items-center justify-center gap-1 text-[11px] cursor-pointer">
                  <Upload size={13} />
                  Import JSON
                  <input type="file" accept=".json" onChange={importEcosystemJSON} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SPECIMEN BANK MODAL */}
        {isSpecimenBankOpen && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate3d(${bankDraggable.pos.x}px, ${bankDraggable.pos.y}px, 0)`,
              pointerEvents: 'auto',
            }}
            className="absolute top-0 left-0 bg-slate-900/95 backdrop-blur-xl border-2 border-purple-500/50 rounded-3xl p-4 w-96 max-h-[80vh] flex flex-col font-mono text-xs shadow-2xl z-40 pointer-events-auto">
            <div
              {...bankDraggable.headerProps}
              className="flex items-center justify-between border-b border-purple-500/30 pb-2 mb-3 cursor-grab active:cursor-grabbing select-none shrink-0">
              <div className="flex items-center gap-2">
                <GripHorizontal className="text-purple-400" size={16} />
                <FolderOpen className="text-purple-400" size={16} />
                <span className="font-bold text-purple-300 text-sm">SPECIMEN BANK</span>
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsSpecimenBankOpen(false);
                  gameAudio.playCrispClick();
                }}
                title="Close specimen bank (✕)"
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
              {specimenBank.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  No saved specimens yet. Select a living organism and click Save to store its genome!
                </div>
              ) : (
                specimenBank.map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-950/80 rounded-xl border border-purple-900/40 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: hsl(item.genome.hue, 90, 60)}} />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.tags.join(' · ')} · {item.savedAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const cam = cameraRef.current;
                          const s = simStateRef.current;
                          const spawned = spawnOrganism(item.genome, cam.x + s.prng.range(-50, 50), cam.y + s.prng.range(-50, 50));
                          s.organisms.push(spawned);
                          s.totalBirths += 1;
                          setSelectedOrgId(spawned.id);
                          setSelectedSpecimen(spawned);
                          gameAudio.playPowerupChime();
                        }}
                        className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-500/40 border border-emerald-400/50 text-emerald-300 font-bold rounded text-[10px]">
                        Spawn
                      </button>
                      <button
                        onClick={() => {
                          const updated = specimenBank.filter((b) => b.id !== item.id);
                          setSpecimenBank(updated);
                          localStorage.setItem('vida_specimen_bank_v3', JSON.stringify(updated));
                        }}
                        className="px-1.5 py-1 text-slate-500 hover:text-rose-400 text-[10px]">
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DRAGGABLE BRAIN, MORPHOLOGY, ENERGY, LINEAGE & VERIFICATION INSPECTOR */}
        {isBrainInspectorOpen && selectedSpecimen && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate3d(${inspectorDraggable.pos.x}px, ${inspectorDraggable.pos.y}px, 0)`,
              pointerEvents: 'auto',
            }}
            className="absolute top-0 left-0 bg-slate-900/95 backdrop-blur-xl border-2 border-cyan-500/50 rounded-3xl p-4 w-96 md:w-[500px] max-h-[85vh] flex flex-col font-mono text-xs shadow-2xl z-40 pointer-events-auto">
            {/* Draggable Header */}
            <div
              {...inspectorDraggable.headerProps}
              className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-2 shrink-0 cursor-grab active:cursor-grabbing select-none">
              <div className="flex items-center gap-2">
                <GripHorizontal className="text-cyan-400" size={18} />
                <Network className="text-cyan-400" size={18} />
                <span className="font-bold text-cyan-300 text-sm">
                  RECURRENT BRAIN & DIAGNOSTICS
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getDietClassification(selectedSpecimen.genome.mouths).badgeClass}`}>
                  {getDietClassification(selectedSpecimen.genome.mouths).label}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{selectedSpecimen.id}</span>
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsBrainInspectorOpen(false);
                    gameAudio.playCrispClick();
                  }}
                  title="Close Diagnostics Window (✕)"
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-cyan-900/50 mb-3 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setInspectorActiveTab('brain'); }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                  inspectorActiveTab === 'brain' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}>
                <Network size={12} />
                <span>Brain</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setInspectorActiveTab('morphology'); }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                  inspectorActiveTab === 'morphology' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}>
                <Layers size={12} />
                <span>Anatomy</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setInspectorActiveTab('energy'); }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                  inspectorActiveTab === 'energy' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}>
                <Gauge size={12} />
                <span>Energy</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setInspectorActiveTab('lineage'); }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                  inspectorActiveTab === 'lineage' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}>
                <GitBranch size={12} />
                <span>Tree</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectorActiveTab('verification');
                  if (!diagnosticResults.ran) runDiagnosticSuite();
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                  inspectorActiveTab === 'verification' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}>
                <ShieldCheck size={12} />
                <span>Verify</span>
              </button>
            </div>

            {/* TAB 1: RECURRENT BRAIN & SYNAPSES */}
            {inspectorActiveTab === 'brain' && (
              <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-1">
                <div className="flex justify-between items-center px-1 text-[10px] text-slate-400">
                  <span>Pruning Threshold: <strong className="text-cyan-400">{synapsePruningThreshold.toFixed(2)}</strong></span>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={synapsePruningThreshold}
                    onChange={(e) => setSynapsePruningThreshold(parseFloat(e.target.value))}
                    className="w-28 h-1.5 accent-cyan-400 cursor-pointer bg-slate-950 rounded"
                  />
                </div>

                <div className="w-full bg-slate-950/90 rounded-2xl p-2 border border-cyan-500/30 flex flex-col items-center shrink-0">
                  <div className="w-full flex justify-between text-[10px] text-slate-400 px-2 mb-1">
                    <span className="text-cyan-400 font-bold">22 SENSORY (RGB+PROP)</span>
                    <span className="text-purple-400 font-bold">24 RECURRENT HIDDEN (h_t)</span>
                    <span className="text-amber-400 font-bold">4-CH MOTORS</span>
                  </div>

                  <svg viewBox="0 0 460 260" className="w-full h-52 select-none">
                    {(() => {
                      const inputX = 35;
                      const hiddenX = 230;
                      const outputX = 420;

                      const inputYs = Array.from({length: NUM_INPUTS}, (_, i) => 8 + i * (244 / (NUM_INPUTS - 1)));
                      const hiddenYs = Array.from({length: NUM_HIDDEN}, (_, i) => 8 + i * (244 / (NUM_HIDDEN - 1)));
                      const numJoints = selectedSpecimen.genome.parts.length - 1;
                      const totalOutputs = Math.max(1, numJoints * OUTPUTS_PER_JOINT);
                      const outputYs = Array.from({length: totalOutputs}, (_, i) => 10 + i * (240 / Math.max(1, totalOutputs - 1)));

                      const synapses: React.ReactNode[] = [];

                      // Input -> Hidden
                      for (let h = 0; h < NUM_HIDDEN; h++) {
                        for (let inp = 0; inp < NUM_INPUTS; inp++) {
                          const w = selectedSpecimen.genome.weightsIH[h]?.[inp] || 0;
                          const inVal = selectedSpecimen.neuralInputs[inp] || 0;
                          const activity = Math.abs(inVal * w);
                          if (Math.abs(w) > synapsePruningThreshold) {
                            const isExcitatory = w > 0;
                            const strokeColor = isExcitatory
                              ? `rgba(6, 182, 212, ${Math.min(0.85, 0.15 + activity * 0.7)})`
                              : `rgba(244, 63, 94, ${Math.min(0.85, 0.15 + activity * 0.7)})`;
                            synapses.push(
                              <line
                                key={`ih-${inp}-${h}`}
                                x1={inputX}
                                y1={inputYs[inp]}
                                x2={hiddenX}
                                y2={hiddenYs[h]}
                                stroke={strokeColor}
                                strokeWidth={Math.min(2.0, 0.5 + Math.abs(w) * 0.5)}
                              />
                            );
                          }
                        }
                      }

                      // Hidden -> Output
                      for (let o = 0; o < totalOutputs; o++) {
                        for (let h = 0; h < NUM_HIDDEN; h++) {
                          const w = selectedSpecimen.genome.weightsHO[o]?.[h] || 0;
                          const hidVal = selectedSpecimen.neuralHidden[h] || 0;
                          const activity = Math.abs(hidVal * w);
                          if (Math.abs(w) > synapsePruningThreshold) {
                            const isExcitatory = w > 0;
                            const strokeColor = isExcitatory
                              ? `rgba(6, 182, 212, ${Math.min(0.85, 0.15 + activity * 0.7)})`
                              : `rgba(244, 63, 94, ${Math.min(0.85, 0.15 + activity * 0.7)})`;
                            synapses.push(
                              <line
                                key={`ho-${h}-${o}`}
                                x1={hiddenX}
                                y1={hiddenYs[h]}
                                x2={outputX}
                                y2={outputYs[o]}
                                stroke={strokeColor}
                                strokeWidth={Math.min(2.0, 0.5 + Math.abs(w) * 0.5)}
                              />
                            );
                          }
                        }
                      }

                      return (
                        <>
                          {synapses}
                          {inputYs.map((y, idx) => (
                            <g key={`inp-${idx}`}>
                              <circle cx={inputX} cy={y} r={2.8} fill="#06b6d4" />
                              <text x={inputX - 4} y={y + 2.5} fontSize="5.5" textAnchor="end" fill="#94a3b8" fontFamily="monospace">
                                {INPUT_LABELS[idx] || `I${idx}`}
                              </text>
                            </g>
                          ))}

                          {hiddenYs.map((y, idx) => {
                            const act = selectedSpecimen.neuralHidden[idx] || 0;
                            const nodeColor = act > 0 ? `rgba(168, 85, 247, ${0.4 + Math.abs(act) * 0.6})` : `rgba(244, 63, 94, ${0.4 + Math.abs(act) * 0.6})`;
                            return <circle key={`hid-${idx}`} cx={hiddenX} cy={y} r={3.2} fill={nodeColor} />;
                          })}

                          {outputYs.map((y, idx) => {
                            const jointIdx = Math.floor(idx / OUTPUTS_PER_JOINT) + 1;
                            const signalType = OUTPUT_LABELS[idx % OUTPUTS_PER_JOINT];
                            return (
                              <g key={`out-${idx}`}>
                                <circle cx={outputX} cy={y} r={3.2} fill="#f59e0b" />
                                <text x={outputX + 5} y={y + 2.5} fontSize="6" textAnchor="start" fill="#fde68a" fontFamily="monospace">
                                  J{jointIdx}:{signalType}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}

            {/* TAB 2: ANATOMY */}
            {inspectorActiveTab === 'morphology' && (() => {
              const diet = getDietClassification(selectedSpecimen.genome.mouths);
              return (
                <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-1">
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-cyan-900/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold tracking-wider">
                      <span>DISCRETE NxM MORPHOLOGY</span>
                      <span className="text-white">{selectedSpecimen.genome.parts.length} PARTS</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="text-slate-400 text-[10px]">Diet Classification:</div>
                        <div className={`${diet.textClass} font-bold text-xs flex items-center gap-1 mt-0.5`}>
                          <span>{diet.icon}</span>
                          <span>{diet.label}</span>
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-slate-400">
                        <div>Composition:</div>
                        <div className="text-white font-bold">{diet.composition}</div>
                      </div>
                    </div>

                    {/* Heritable Genetic Traits */}
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-purple-500/30 space-y-1 text-[10px]">
                      <div className="text-purple-300 font-bold flex items-center gap-1">
                        <Dna size={12} />
                        <span>HERITABLE REPRODUCTION DNA TRAITS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-300 pt-0.5">
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                          <div className="text-slate-400 text-[9px]">Target Clutch Size:</div>
                          <div className="text-amber-300 font-bold text-xs">{selectedSpecimen.genome.targetClutchSize || 2} eggs</div>
                          <div className="text-[8px] text-slate-500">Mutates &plusmn;1 (Range 1-6)</div>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                          <div className="text-slate-400 text-[9px]">Sexual Maturity Age:</div>
                          <div className="text-emerald-300 font-bold text-xs">{(selectedSpecimen.genome.maturityAge || 20.0).toFixed(1)}s</div>
                          <div className="text-[8px] text-slate-500">Mutates &plusmn;1-3s (Range 10-45s)</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {selectedSpecimen.genome.parts.map((p, idx) => (
                        <div key={idx} className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 flex justify-between items-center text-[10px]">
                          <div>
                            <span className="font-bold text-cyan-300">Part {idx}</span>
                            <span className="text-[9px] text-slate-400 ml-2">
                              {idx === 0 ? 'Root Center of Mass' : `Attached ${p.attachmentPoint} to #${p.parentIndex}`}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-300 font-bold text-xs">{p.dimN}&times;{p.dimM}</div>
                            <div className="text-[9px] text-slate-500">({Math.round(p.width)}&times;{Math.round(p.height)}px)</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detailed Per-Mouth Telemetry & Rules */}
                    <div className="mt-1 pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="text-[10px] font-bold text-cyan-400 tracking-wider">
                        MOUTH APERTURES & DIET PERMISSIONS ({selectedSpecimen.genome.mouths.length})
                      </div>
                      {selectedSpecimen.genome.mouths.map((m, idx) => {
                        const isCarn = m.mouthType === 'carnivore';
                        const isOmni = m.mouthType === 'omnivore';
                        const typeLabel = isCarn ? 'Carnivore 🥩' : isOmni ? 'Omnivore 🟣' : 'Herbivore 🌿';
                        const typeBadge = isCarn
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                          : isOmni
                          ? 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                          : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300';
                        const rules = isCarn
                          ? 'Permitted: Non-kin Prey, Foreign Eggs. Rejected: Nutrients (0 J).'
                          : isOmni
                          ? 'Permitted: Nutrients, Prey, Eggs (at 50% rate).'
                          : 'Permitted: Plant Nutrients ONLY. Rejected: Prey, Eggs.';
                        return (
                          <div key={m.id || idx} className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-[10px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">Mouth #{idx + 1} (Part {m.partIndex}, {m.direction})</span>
                              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${typeBadge}`}>
                                {typeLabel}
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-400">
                              Aperture Width: <strong className="text-cyan-300">{m.intakeWidth.toFixed(1)}px</strong> · Contact Radius: <strong className="text-cyan-300">{(isCarn ? 4.5 : isOmni ? 4.0 : 3.5).toFixed(1)}px</strong>
                            </div>
                            <div className="text-[9px] text-slate-300 italic">
                              {rules}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TAB 3: ENERGY */}
            {inspectorActiveTab === 'energy' && (() => {
              const diet = getDietClassification(selectedSpecimen.genome.mouths);
              const lifeStage = getLifeStage(selectedSpecimen);
              const remainingLifespan = Math.max(0, selectedSpecimen.maxLifespan - selectedSpecimen.age);
              const isAging = lifeStage === 'Aging';
              const reproEval = evaluateReproductionAffordability(
                selectedSpecimen,
                ecoStats.simTime,
                ecoStats.livingCount,
                ecoStats.eggCount,
                getConfig('maxOrganisms'),
              );

              const totalBurnRate = Math.max(
                0.1,
                (selectedSpecimen.basalEnergyRate || 12) +
                (selectedSpecimen.sensoryEnergyRate || 11) +
                (selectedSpecimen.motorEnergyRate || 0)
              );
              const estimatedReserveEndurance = selectedSpecimen.energy / totalBurnRate;

              return (
                <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-1 text-[11px]">
                  {/* Aging Banner in Energy Tab if senescent */}
                  {isAging && (
                    <div className="bg-amber-950/80 border-2 border-amber-500/70 rounded-xl p-2.5 text-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-400 shrink-0 animate-bounce" />
                        <div>
                          <div className="font-bold text-amber-300">SENESCENCE PHASE ACTIVE</div>
                          <div className="text-[10px] text-amber-200/80">
                            Age: {selectedSpecimen.age.toFixed(1)}s / {selectedSpecimen.maxLifespan.toFixed(0)}s ({remainingLifespan.toFixed(1)}s until natural old age dissolution)
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-900 border border-amber-400 text-amber-100 font-bold text-[10px]">
                        Aging
                      </span>
                    </div>
                  )}

                  <div className="bg-slate-950/80 rounded-xl p-3 border border-amber-900/40 space-y-1.5">
                    <div className="flex items-center justify-between text-amber-400 font-bold text-[10px] tracking-wider">
                      <span>THERMODYNAMIC BUDGET & METABOLIC CALIBRATION</span>
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] ${diet.badgeClass}`}>
                        {diet.label}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Life Stage & Chronological Age:</span>
                      <span className="font-bold text-white">
                        {lifeStage} · {selectedSpecimen.age.toFixed(1)}s / {selectedSpecimen.maxLifespan.toFixed(0)}s ({remainingLifespan.toFixed(1)}s remaining)
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>DNA Target Clutch / Maturity:</span>
                      <span className="text-amber-300 font-bold">
                        {selectedSpecimen.genome.targetClutchSize || 2} eggs · {(selectedSpecimen.genome.maturityAge || 20.0).toFixed(1)}s maturity
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Structural Biomass:</span>
                      <span className="text-purple-300 font-bold">{formatJoules(selectedSpecimen.structuralBiomass)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Geometric Body Area:</span>
                      <span className="text-cyan-300 font-bold">
                        {calculateTotalBodyArea(selectedSpecimen.genome.parts)} units² ({(calculateTotalBodyArea(selectedSpecimen.genome.parts) / BASE_FOUNDER_AREA).toFixed(2)}&times; founder)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Usable Energy Reserve:</span>
                      <span className="text-emerald-400 font-bold">{formatJoules(selectedSpecimen.energy)} / {formatJoules(selectedSpecimen.genome.maxEnergyCapacity)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Mandatory Survival Reserve Floor:</span>
                      <span className="text-slate-400 font-bold">{formatJoules(reproEval.parentReserve)} (max(2kJ, 20% cap))</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Available for Egg Budget:</span>
                      <span className={reproEval.availableForReproduction >= reproEval.eggCost ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                        {formatJoules(Math.max(0, reproEval.availableForReproduction))} (Egg Cost: {formatJoules(reproEval.eggCost)})
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-1 text-[10px] text-slate-400 font-bold">METABOLIC EXPENDITURE BREAKDOWN (J/s):</div>
                    <div className="flex justify-between text-slate-300 pl-2">
                      <span>• Basal Maintenance:</span>
                      <span className="text-rose-300 font-bold">
                        {(selectedSpecimen.basalEnergyRate ?? (BASAL_METABOLIC_RATE * (calculateTotalBodyArea(selectedSpecimen.genome.parts) / BASE_FOUNDER_AREA) * selectedSpecimen.genome.metabolicEfficiency)).toFixed(2)} J/s
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 pl-2">
                      <span>• Sensory & Neural:</span>
                      <span className="text-indigo-300 font-bold">
                        {(selectedSpecimen.sensoryEnergyRate ?? (SENSORY_NEURAL_METABOLIC_RATE * (selectedSpecimen.genome.eyes.length * 5 + NUM_HIDDEN))).toFixed(2)} J/s
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 pl-2">
                      <span>• Motor Mechanical Work:</span>
                      <span className="text-amber-300 font-bold">{(selectedSpecimen.motorEnergyRate || 0).toFixed(2)} J/s</span>
                    </div>

                    <div className="flex justify-between text-slate-200 border-t border-slate-800 pt-1">
                      <span className="font-bold">Total Net Burn Rate:</span>
                      <span className="text-orange-400 font-bold">
                        {totalBurnRate.toFixed(2)} J/s
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300 bg-emerald-950/30 p-1.5 rounded border border-emerald-500/20">
                      <span className="font-bold text-emerald-400">Estimated reserve endurance:</span>
                      <span className="text-emerald-300 font-bold font-mono">
                        {estimatedReserveEndurance.toFixed(1)}s (at net burn)
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>Reproduction Eligibility:</span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] ${reproEval.badgeClass}`}>
                        {reproEval.statusText}
                      </span>
                    </div>
                  </div>

                  {/* RECENT INGESTION LOG */}
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-emerald-900/40 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold tracking-wider">
                      <span>RECENT INGESTION LOG</span>
                      <span className="text-slate-400 font-mono text-[9px]">Last {selectedSpecimen.recentFeedings?.length || 0} bites</span>
                    </div>

                    {(!selectedSpecimen.recentFeedings || selectedSpecimen.recentFeedings.length === 0) ? (
                      <div className="p-3 text-center text-slate-500 text-[10px] italic">
                        No contact ingestions recorded yet (organism seeking nutrients/prey)...
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {selectedSpecimen.recentFeedings.slice().reverse().map((ev, idx) => {
                          const icon = ev.foodCategory === 'Nutrient' ? '🌿' : ev.foodCategory === 'Prey' ? '🥩' : '🥚';
                          const color = ev.foodCategory === 'Nutrient' ? 'text-emerald-400' : ev.foodCategory === 'Prey' ? 'text-rose-400' : 'text-amber-400';
                          return (
                            <div key={idx} className="p-1.5 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <span>{icon}</span>
                                <span className={`font-bold ${color}`}>{ev.foodCategory}</span>
                                <span className="text-slate-400 text-[9px]">({ev.mouthType})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-300 font-mono">+{formatJoules(ev.energyTransferred)}</span>
                                <span className="text-slate-500 text-[9px] font-mono">t={ev.timestamp.toFixed(1)}s</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* TAB 4: LINEAGE TREE & RECENT DEATHS LOG */}
            {inspectorActiveTab === 'lineage' && (
              <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-y-auto pr-1 text-[10px]">
                <div className="bg-slate-950/80 rounded-xl p-3 border border-cyan-500/40 space-y-2">
                  <div className="text-cyan-400 font-bold text-xs flex items-center justify-between">
                    <span>ANCESTOR LINEAGE & OFFSPRING</span>
                    <span className="text-slate-400 font-normal">ID: {selectedSpecimen.id}</span>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded border border-slate-800 space-y-1">
                    <div>Archetype / Name: <span className="font-bold text-white">{selectedSpecimen.genome.name || selectedSpecimen.genome.archetype || 'Specimen'}</span></div>
                    <div>Generation: <span className="font-bold text-cyan-300">{selectedSpecimen.genome.generation}</span></div>
                    <div>Direct Parents: <span className="text-slate-400">{selectedSpecimen.genome.parentIds.join(', ') || 'Primordial Genesis'}</span></div>
                    <div>DNA Traits: <span className="text-amber-300 font-bold">{selectedSpecimen.genome.targetClutchSize || 2} eggs clutch</span> &middot; <span className="text-emerald-300 font-bold">{(selectedSpecimen.genome.maturityAge || 20.0).toFixed(1)}s maturity</span></div>
                    <div>Total Offspring: <span className="font-bold text-emerald-400">{selectedSpecimen.offspringCount} laid across {selectedSpecimen.clutchesLaid || 0} clutches</span></div>
                    <div>Max Lifespan Cap: <span className="text-slate-300">{selectedSpecimen.genome.maxLifespan}s</span></div>
                  </div>
                </div>

                {/* RECENT DEATHS LOG WITH EXACT CAUSES */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-rose-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-rose-400" />
                      RECENT DEATHS LOG ({simStateRef.current.recentDeaths?.length || 0})
                    </span>
                    <span className="text-[9px] text-slate-500 font-normal">Cause Attribution Telemetry</span>
                  </div>

                  {(!simStateRef.current.recentDeaths || simStateRef.current.recentDeaths.length === 0) ? (
                    <div className="p-3 text-center text-slate-500 italic">
                      No deaths recorded yet in this simulation run.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {simStateRef.current.recentDeaths.map((death, dIdx) => {
                        const isOldAge = death.cause === 'Old Age';
                        const isPred = death.cause === 'Predation';
                        const badgeStyle = isOldAge
                          ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                          : isPred
                          ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                          : 'bg-purple-950/80 border-purple-500/50 text-purple-300';
                        return (
                          <div key={dIdx} className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{death.name}</span>
                                <span className="text-[9px] text-slate-500">({death.id} · Gen {death.generation})</span>
                              </div>
                              <div className="text-[9px] text-slate-400 mt-0.5">
                                Lived: <strong className="text-slate-200">{death.age.toFixed(1)}s</strong> · Energy at death: <strong className="text-cyan-300">{formatJoules(death.energyAtDeath)}</strong> · Offspring: <strong className="text-emerald-400">{death.offspringCount}</strong>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${badgeStyle}`}>
                                {isOldAge ? '⏳ Old Age' : isPred ? '🥩 Predated' : '⚡ Starved'}
                              </span>
                              <div className="text-[8px] text-slate-500 mt-0.5 font-mono">t={death.timestamp.toFixed(1)}s</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: DIAGNOSTICS */}
            {inspectorActiveTab === 'verification' && (
              <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-1 text-[10px]">
                <div className="bg-slate-950/80 rounded-xl p-3 border border-cyan-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold text-xs">DIAGNOSTIC VERIFICATION SUITE</span>
                    <button
                      onClick={runDiagnosticSuite}
                      className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded flex items-center gap-1">
                      <RotateCw size={11} />
                      Re-run
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span>1. Reference Locomotion Benchmark:</span>
                      {diagnosticResults.comLocomotion ? <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> PASS</span> : <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle size={13} /> FAIL</span>}
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span>2. Zero-Drag Momentum Conservation (&mu;=0):</span>
                      {diagnosticResults.zeroDragConservation ? <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> PASS</span> : <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle size={13} /> FAIL</span>}
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span>3. Parent &rarr; Egg &rarr; Hatchling Energy Conservation:</span>
                      {diagnosticResults.eggEnergyAccounting ? <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> PASS</span> : <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle size={13} /> FAIL</span>}
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span>4. True Budget Reproduction (No 60% capacity gate):</span>
                      {diagnosticResults.reproductionAffordability ? <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> PASS</span> : <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle size={13} /> FAIL</span>}
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span>5. Raycast RGB Occlusion & Attenuation:</span>
                      {diagnosticResults.raycastOcclusion ? <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> PASS</span> : <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle size={13} /> FAIL</span>}
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span>6. PRNG Bit Determinism (1000 draws):</span>
                      {diagnosticResults.prngDeterminism ? <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> PASS</span> : <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle size={13} /> FAIL</span>}
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span>7. Unfed Lifespan & Old Age Cause Preserved:</span>
                      {diagnosticResults.starvationLifespan ? <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 size={13} /> PASS</span> : <span className="text-rose-400 font-bold flex items-center gap-1"><XCircle size={13} /> FAIL</span>}
                    </div>
                  </div>

                  {diagnosticResults.details.length > 0 && (
                    <div className="p-2 bg-slate-950 rounded border border-slate-800 space-y-1 text-[9px] text-slate-400">
                      <div className="text-cyan-400 font-bold">Execution Telemetry Log:</div>
                      {diagnosticResults.details.map((d, i) => (
                        <div key={i}>• {d}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DRAGGABLE ECOSYSTEM TELEMETRY LEDGER */}
        {isEcosystemGraphOpen && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate3d(${ledgerDraggable.pos.x}px, ${ledgerDraggable.pos.y}px, 0)`,
              pointerEvents: 'auto',
            }}
            className="absolute top-0 left-0 bg-slate-900/95 backdrop-blur-lg border border-emerald-500/50 rounded-2xl p-4 w-88 font-mono text-xs shadow-2xl z-40 pointer-events-auto">
            <div
              {...ledgerDraggable.headerProps}
              className="flex items-center justify-between border-b border-emerald-500/30 pb-2 mb-3 cursor-grab active:cursor-grabbing select-none">
              <div className="flex items-center gap-2">
                <GripHorizontal className="text-emerald-400" size={16} />
                <Activity className="text-emerald-400" size={16} />
                <span className="font-bold text-emerald-300 text-sm">THERMODYNAMIC BUDGET LEDGER</span>
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsEcosystemGraphOpen(false);
                  gameAudio.playCrispClick();
                }}
                title="Close ledger (✕)"
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="w-full h-16 bg-slate-950 rounded-xl p-2 border border-slate-800 flex items-end gap-1 mb-3">
              {popHistoryRef.current.map((count, idx) => {
                const max = Math.max(30, ...popHistoryRef.current);
                const heightPercent = Math.min(100, Math.max(8, (count / max) * 100));
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-emerald-600 to-cyan-400 rounded-t"
                    style={{height: `${heightPercent}%`}}
                    title={`Population: ${count}`}
                  />
                );
              })}
            </div>

            <div className="space-y-1.5 text-[10px] text-slate-300">
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <span>External Nutrient Inflow:</span>
                <span className="text-emerald-400 font-bold">{formatJoules(ecoStats.totalExternalInflow)}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <span>Stored Biomass:</span>
                <span className="text-purple-300 font-bold">{formatJoules(ecoStats.totalStoredBiomass)}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <span>Stored Reserves:</span>
                <span className="text-cyan-300 font-bold">{formatJoules(ecoStats.totalStoredReserves)}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <span>Stored Egg Energy:</span>
                <span className="text-amber-300 font-bold">{formatJoules(ecoStats.totalEggEnergy)}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <span>Ambient Nutrients:</span>
                <span className="text-emerald-300 font-bold">{formatJoules(ecoStats.totalFoodEnergy)}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <span>Metabolic Heat Dissipation:</span>
                <span className="text-rose-400 font-bold">{formatJoules(ecoStats.totalMetabolicHeat)}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <span>Mechanical Work Heat:</span>
                <span className="text-orange-400 font-bold">{formatJoules(ecoStats.totalMechanicalHeat)}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <span>Recorded Losses & Rejections:</span>
                <span className="text-slate-400 font-bold">{formatJoules(ecoStats.totalRecordedLosses)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION TOOLBAR */}
      <footer className="w-full bg-slate-900/95 border-t border-cyan-500/20 backdrop-blur-md px-3 py-2 flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setGameState((prev) => ({
                ...prev,
                status: prev.status === 'PLAYING' ? 'PAUSED' : 'PLAYING',
              }));
              gameAudio.playCrispClick();
            }}
            className="min-w-[44px] min-h-[44px] px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md text-xs md:text-sm">
            {gameState.status === 'PLAYING' ? <Pause size={16} /> : <Play size={16} />}
            <span>{gameState.status === 'PLAYING' ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              cameraRef.current.targetX = worldWidth / 2;
              cameraRef.current.targetY = worldHeight / 2;
              cameraRef.current.zoom = 0.85;
              setIsAutoTracking(false);
              gameAudio.playCrispClick();
            }}
            className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-xs flex items-center justify-center gap-1.5">
            <Compass size={15} />
            <span className="hidden sm:inline">Center Cam</span>
          </button>
        </div>

        {/* Archetype Seed Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
          <span className="hidden lg:inline text-[11px] font-mono text-cyan-400 font-bold mr-1">
            SEED ARCHETYPE:
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); addPrimordialSpecimen('eel'); }}
            className="px-2.5 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm">
            <Sparkles size={13} className="text-cyan-400" />
            <span>Eel</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); addPrimordialSpecimen('predator'); }}
            className="px-2.5 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm">
            <Flame size={13} className="text-rose-400 animate-pulse" />
            <span>Predator</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); addPrimordialSpecimen('flapper'); }}
            className="px-2.5 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-500/40 text-blue-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm">
            <Sparkles size={13} className="text-blue-400" />
            <span>Flapper</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); addPrimordialSpecimen('tadpole'); }}
            className="px-2.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Tadpole</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); addPrimordialSpecimen('glider'); }}
            className="px-2.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm">
            <Sparkles size={13} className="text-purple-400" />
            <span>Glider</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); addPrimordialSpecimen('random'); }}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm">
            <Dna size={13} className="text-amber-400" />
            <span>Random</span>
          </button>
        </div>

        {/* Feeding Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); spawnNutrientBurst(); }}
            className="min-w-[44px] min-h-[44px] px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md text-xs md:text-sm">
            <Plus size={16} />
            <span>Feed (F)</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); feedAllOrganisms(); }}
            className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-md">
            <Sparkles size={15} />
            <span className="hidden sm:inline">Feed All</span>
          </button>
        </div>
      </footer>

      {/* --- OVERLAYS --- */}
      {gameState.status === 'START' && (
        <MenuOverlay tone="neutral" zIndex={50}>
          <div className="w-full max-w-lg bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center backdrop-blur-xl text-center m-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-4 shadow-inner">
              <img
                src={neuralNodeIconUrl}
                alt="Neural Node"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 text-cyan-300 font-mono tracking-wider">
              VIDA
            </h1>
            <p className="text-cyan-400/80 font-mono text-xs tracking-widest uppercase mb-4">
              Recurrent Neural Brains & Hydrodynamic Artificial Life
            </p>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Observe swimming creatures driven by 24-neuron recurrent neural networks, genuine fluid hydrodynamics, and closed-loop thermodynamics!
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => initGame('standard')}
                autoFocus
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-lg shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2">
                <Play size={22} />
                SEED SIMULATION
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => initGame('predator_cove')}
                  className="bg-slate-800/80 hover:bg-slate-750 text-rose-300 border border-rose-500/30 px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                  <Flame size={16} />
                  Predator Cove
                </button>
                <button
                  onClick={() => initGame('megafauna')}
                  className="bg-slate-800/80 hover:bg-slate-750 text-purple-300 border border-purple-500/30 px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                  <Zap size={16} />
                  Megafauna
                </button>
              </div>
            </div>
          </div>
        </MenuOverlay>
      )}

      {gameState.status === 'GAME_OVER' && (
        <Overlay
          title="TOTAL EXTINCTION"
          description={`The Vida ecosystem went cold after reaching Generation ${ecoStats.maxGeneration}. All specimens and eggs have dissolved.`}
          actionLabel="RESEED ECOSYSTEM"
          onAction={() => initGame('standard')}
          icon={<RotateCw size={24} />}
          tone="danger"
        />
      )}

      {gameState.status === 'PAUSED' && !isGameMenuOpen && (
        <Overlay
          title="SIMULATION PAUSED"
          description="Ecosystem paused. Press space or resume to continue observing."
          actionLabel="RESUME SIMULATION"
          onAction={() => setGameState((prev) => ({...prev, status: 'PLAYING'}))}
          icon={<Play size={24} />}
          tone="neutral"
        />
      )}

      {/* GAME MENU */}
      {isGameMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={60}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center backdrop-blur-xl m-4">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-cyan-300 font-mono tracking-wider">
              SIMULATION MENU
            </h2>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setIsGameMenuOpen(false); }}
                autoFocus
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2">
                <Play size={18} />
                RESUME
              </button>

              <div className="grid grid-cols-2 gap-2 my-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newMuted = gameAudio.toggleMute();
                    setSfxMuted(newMuted);
                  }}
                  className={`px-4 py-2.5 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    sfxMuted
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-700'
                  }`}>
                  {sfxMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  SFX: {sfxMuted ? 'Muted' : 'Active'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMusicMuted((prev) => !prev);
                  }}
                  className={`px-4 py-2.5 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    musicMuted
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-700'
                  }`}>
                  {musicMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  Music: {musicMuted ? 'Muted' : 'Active'}
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGameMenuOpen(false);
                  initGame('standard');
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2">
                <RotateCw size={16} />
                RESEED SOUP
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHowToPlayOpen(true);
                }}
                className="w-full bg-slate-800 hover:bg-slate-750 text-cyan-300 px-4 py-2.5 rounded-xl font-bold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2">
                <Info size={16} />
                RESEARCH & CONTROLS GUIDE
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGameMenuOpen(false);
                  setGameState((prev) => ({...prev, status: 'START'}));
                }}
                className="w-full bg-red-950/50 hover:bg-red-900/60 text-red-300 px-4 py-2.5 rounded-xl font-bold text-sm border border-red-800/40 transition-colors">
                MAIN MENU
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* HOW TO PLAY */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral" zIndex={70}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col backdrop-blur-xl m-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
              <h3 className="text-xl font-bold text-cyan-300 font-mono">
                VIDA: RESEARCH & CONTROLS GUIDE
              </h3>
              <button
                onClick={(e) => { e.stopPropagation(); setIsHowToPlayOpen(false); }}
                className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-sans leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-cyan-500/30">
                <h4 className="font-bold text-cyan-400 mb-1">1. Recurrent Neural Networks (RNN)</h4>
                <p>
                  Each organism is powered by a 24-neuron recurrent neural controller (h_t = tanh(W_in &middot; x_t + W_rec &middot; h_t-1 + b)), capable of short-term memory, rhythmic oscillators, and goal-directed swimming.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-amber-500/30">
                <h4 className="font-bold text-amber-400 mb-1">2. 4-Channel Motor Actuation</h4>
                <p>
                  Every joint is driven by 4 neural channels: Target Angle Bias, Motor Drive/Frequency, Peak Torque Limit, and Dynamic Compliance Damping ($K_p, K_d$).
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-purple-500/30">
                <h4 className="font-bold text-purple-400 mb-1">3. Closed-Loop Biological Energy Accounting</h4>
                <p>
                  Eggs strictly conserve energy upon laying and hatching. Predated eggs cannot hatch into free bodies and instead decompose into nutrients, strictly enforcing zero free structural tissue creation.
                </p>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setIsHowToPlayOpen(false); }}
              className="mt-5 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition-colors">
              BACK TO SIMULATION
            </button>
          </div>
        </MenuOverlay>
      )}
    </div>
  );
}
