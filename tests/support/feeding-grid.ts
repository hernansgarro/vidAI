import {createInitialWorld, addExternalOrganism} from '../../world';
import {createFounderGenome} from '../../founders';
import {DEFAULT_SETTINGS, createSnapshot} from '../../persistence';
import {enableClosedEconomy} from '../../energyEconomy';
import {calculateBodyCost, calculateMaxEnergyCapacity, remapBrain, getNutrientRadius, spawnOrganism, XoshiroPRNG,
  type MouthType, type SimulationSettings, type Egg} from '../../simulation';
import {gridCompatibilityCases} from './maintained-grid-compatibility';

/** Fixed mechanism controls, not ecological trials or performance measurements. */
export function feedingGridCases() {
  const cases = gridCompatibilityCases();
  for (const model of [undefined, 'capsule-v1'] as const)
    for (const cycle of [undefined, 'decay-v1', 'decay-v2'] as const)
      for (const reverse of [false, true]) {
        const settings: SimulationSettings = {...DEFAULT_SETTINGS, targetNutrients: 20, inflowRate: 0,
          waterViscosity: 0, gravity: 0, mutationSeverity: 0, kinshipProtection: true,
          physicsRegime: 'passive-work-v3', mouthContactModel: model, nutrientCycle: cycle};
        const state = createInitialWorld(settings, 707, 'balanced', 'standard', 0);
        const make = (type?: MouthType, mouths = 3) => {
          const g = createFounderGenome('FND-001');
          g.parts = [g.parts[0]]; g.eyes = []; g.motorForce = 0;
          Object.assign(g.parts[0], {dimN: 1, dimM: 1, width: 7, height: 7});
          g.mouths = type ? Array.from({length: mouths}, (_, i) => ({id: `mouth-${i}`,
            partIndex: 0, direction: (['EAST', 'NORTH', 'SOUTH'] as const)[i], slot: 0, intakeWidth: type === 'herbivore' ? 7 : type === 'carnivore' ? 9 : 8,
            intakeLength: 100, mouthType: type})) : [];
          g.bodyCost = calculateBodyCost(g.parts, [], g.mouths);
          g.maxEnergyCapacity = calculateMaxEnergyCapacity(g.parts, g.storageTraitMultiplier);
          remapBrain(g); return g;
        };
        // Multiple mouths share the same overlapping targets. Source order is
        // deliberately unrelated to position and textual identity.
        for (const reserve of [3, 8, 15]) {
          const prey = addExternalOrganism(state, make(), settings, 1240 + reserve / 2, 750, 0)!;
          prey.energy = reserve;
          if (reserve === 15) {prey.dissolving = true; prey.dissolveAlpha = .001;}
        }
        for (const type of ['herbivore', 'carnivore', 'omnivore'] as const) {
          const consumer = addExternalOrganism(state, make(type), settings, type === 'omnivore' ? 1200 : type === 'carnivore' ? 1210 : 1220, 750, 0)!;
          consumer.clutchId = 'consumer-siblings';
        }
        const eggG = make();
        state.eggs = [3, 5, 9, 80].map((reserve, i): Egg => ({id: `egg-${i}`, clutchId: 'foreign',
          parentOrgId: 'absent', genome: structuredClone(eggG), x: 1260, y: 750, vx: 0, vy: 0,
          fundedStructural: 0, fundedReserve: reserve, incubationProgress: 0, totalIncubationTime: 100,
          pulseTimer: 0, colorHue: 30, readyToHatch: false}));
        state.nutrients = [2, 9, 3000, 30, 2, 12000, 8].map((energyValue, i) => ({
          id: `food-${i}`, x: 1270, y: 750, vx: 0, vy: 0, energyValue,
          radius: getNutrientRadius(energyValue, cycle), bottomTimer: 0, pulseTimer: 0,
          kind: i % 2 ? 'carrion' as const : 'nutrient' as const,
          ...(i % 2 ? {decayTimeRemaining: 60} : {})}));
        state.nutrients[1].decayTimeRemaining = .001;
        if (reverse) {state.organisms.reverse(); state.eggs.reverse(); state.nutrients.reverse();}
        if (cycle) {settings.ecologyRegime = 'closed-v1'; enableClosedEconomy(state);}
        cases.push({name: `overlap-${model ?? 'legacy'}-${cycle ?? 'historical'}-${reverse}`,
          state, settings, ticks: 6});
      }
  // Earlier organism reproduction appends an egg before the next consumer.
  const settings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0,
    waterViscosity: 0, gravity: 0, kinshipProtection: false, mutationSeverity: 0};
  const state = createInitialWorld(settings, 708, 'balanced', 'standard', 0);
  const g = createFounderGenome('FND-001'); g.parts = [g.parts[0]]; g.eyes = []; g.motorForce = 0;
  g.mouths = [{id: 'egg-eater', partIndex: 0, direction: 'EAST', slot: 0,
    intakeWidth: 9, intakeLength: 100, mouthType: 'carnivore'}];
  g.bodyCost = calculateBodyCost(g.parts, [], g.mouths);
  g.maxEnergyCapacity = calculateMaxEnergyCapacity(g.parts, g.storageTraitMultiplier); remapBrain(g);
  addExternalOrganism(state, g, settings, 1200, 750, 0);
  const parentG = structuredClone(g); parentG.mouths = []; parentG.bodyCost = calculateBodyCost(parentG.parts, [], []); remapBrain(parentG);
  const parent = addExternalOrganism(state, parentG, settings, 1200 + g.parts[0].width + 110, 750, 0)!;
  parent.age = 100; state.simTime = 100; parent.energy = parentG.maxEnergyCapacity;
  cases.push({name: 'same-tick-laying', state, settings, ticks: 4});
  for (const closed of [false, true]) cases.push(importedRadiusCase(closed));
  const shrink = importedRadiusCase(false);
  shrink.name = 'same-tick-shrink-cell-crossing';
  shrink.state.organisms[0].segments[0].x = 100;
  shrink.state.organisms[1].segments[0].x = 130;
  shrink.state.organisms[1].genome.mouths[0].intakeLength = 7;
  shrink.state.nutrients[0].x = 146; shrink.state.nutrients[0].radius = 18;
  cases.push(shrink);
  return cases;
}

/** Accepted imported-radius correction: P6 misses the second physical contact
 * after the first bite expands the radius across the128-unit cell boundary. */
export function importedRadiusCase(closed: boolean) {
  const settings: SimulationSettings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0,
    waterViscosity: 0, gravity: 0, mutationSeverity: 0, kinshipProtection: false,
    physicsRegime: 'passive-work-v3', mouthContactModel: 'capsule-v1'};
  const state = createInitialWorld(settings, 709, 'balanced', 'standard', 0);
  state.organisms = [134, 100].map((x, i) => {
    const g = createFounderGenome('FND-001'); g.parts = [g.parts[0]]; g.eyes = []; g.motorForce = 0;
    Object.assign(g.parts[0], {dimN: 1, dimM: 1, width: 7, height: 7});
    g.mouths = [{id: 'mouth', partIndex: 0, direction: 'EAST', slot: 0,
      intakeWidth: 7, intakeLength: i === 0 ? 7 : 20, mouthType: 'herbivore'}];
    g.bodyCost = calculateBodyCost(g.parts, [], g.mouths);
    g.maxEnergyCapacity = calculateMaxEnergyCapacity(g.parts, g.storageTraitMultiplier); remapBrain(g);
    return {...spawnOrganism(g, x, 750, 0, undefined, 1000, new XoshiroPRNG(710 + i)), id: `radius-${i}`};
  });
  state.nutrients = [{id: 'small-imported-radius', x: 126, y: 750, vx: 0, vy: 0, energyValue: 3000,
    radius: 1, bottomTimer: 0, pulseTimer: 0}];
  state.lineage.clear();
  if (closed) {settings.ecologyRegime = 'closed-v1'; enableClosedEconomy(state);}
  return {name: `imported-radius-growth-${closed ? 'closed' : 'open'}`, state, settings, ticks: 1};
}

export const feedingState = (state: ReturnType<typeof feedingGridCases>[number]['state'], settings: SimulationSettings) =>
  JSON.parse(JSON.stringify(createSnapshot(state, settings)));
