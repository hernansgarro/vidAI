import {readFileSync} from 'node:fs';
import {createInitialWorld, addExternalOrganism} from '../../world';
import {createFounderGenome} from '../../founders';
import {createSnapshot, restoreSnapshot, DEFAULT_SETTINGS} from '../../persistence';
import {stepSimulation, type SimulationState, type SimulationSettings} from '../../simulation';
import {selfTubeFixture} from './self-tubes';
import {cycleFixture, food} from './nutrient-cycle';
import {eggReserveFixture} from './egg-reserve';
import {energyActivityFixture} from './energy-activity';
import {createHash} from 'node:crypto';

/** Bounded correctness fixtures, never a throughput or ecology experiment.
 * Run against immutable P3 to establish NEW compatibility references; never
 * regenerate existing historical golden data to accommodate a mismatch. */
export function gridCompatibilityCases(): Array<{name: string; state: SimulationState; settings: SimulationSettings; ticks: number}> {
  const base = {...DEFAULT_SETTINGS, targetNutrients: 12, inflowRate: 1.25};
  const result = ['legacy-v0', 'surface-work-v1', 'paid-work-v2', 'passive-work-v3'].map(physicsRegime => {
    const settings = {...base, physicsRegime} as SimulationSettings;
    return {name: physicsRegime, settings, state: createInitialWorld(settings, 414, 'balanced', 'standard', 3), ticks: 16};
  });
  const dense = {...base, targetNutrients: 200, inflowRate: 0};
  const denseState = createInitialWorld(dense, 718, 'balanced', 'standard', 20);
  for (let i = 0; i < 180; i++) denseState.nutrients.push({...food(3000, true, 1100 + i % 20 * 4, 700 + Math.floor(i / 20) * 4), id: `carrion-${i}`});
  result.push({name: 'dense-food-carrion', state: denseState, settings: dense, ticks: 8});
  const anatomySettings = {...base, targetNutrients: 0, inflowRate: 0, physicsRegime: 'passive-work-v3' as const};
  const anatomy = createInitialWorld(anatomySettings, 994, 'balanced', 'showcase', 0);
  for (const [i, id] of ['CUR-006', 'CUR-007', 'CUR-009'].entries())
    addExternalOrganism(anatomy, createFounderGenome(id), anatomySettings, 500 + i * 500, 750, i * 1.1);
  // A valid finite historical pose with a gap far beyond the ideal tree bound.
  anatomy.organisms[0].segments.at(-1)!.x += 9000;
  result.push({name: 'branched-rotated-separated', state: anatomy, settings: anatomySettings, ticks: 4});
  for (const side of ['L', 'R'] as const) {
    const {state, settings} = selfTubeFixture(side);
    result.push({name: `tube-${side}`, state, settings, ticks: 8});
  }
  const cycle = cycleFixture([food(1), food(12000, true)]);
  cycle.state.nutrients[1].decayTimeRemaining = .01;
  cycle.settings.nutrientCycle = 'decay-v2';
  result.push({name: 'closed-mineralization', ...cycle, ticks: 8});
  const eggs = eggReserveFixture(true);
  eggs.state.eggs[0].incubationProgress = 1;
  eggs.state.eggs[0].fundedReserve += 5000;
  eggs.state.energyPool!.reserve -= 5000;
  result.push({name: 'closed-eggs', state: eggs.state, settings: eggs.config, ticks: 8});
  const feeding = energyActivityFixture();
  result.push({name: 'feeding-learning', state: feeding.state, settings: feeding.config, ticks: 12});
  const historical = restoreSnapshot(JSON.parse(readFileSync(new URL('../fixtures/v5-motor-world.json', import.meta.url), 'utf8')));
  result.push({name: 'historical-v5', state: historical.state, settings: historical.settings, ticks: 12});
  return result;
}
export const snapshotDigest = (state: SimulationState, settings: SimulationSettings) =>
  createHash('sha256').update(JSON.stringify(createSnapshot(state, settings))).digest('hex');
export function compatibilityReceipt(fixture: ReturnType<typeof gridCompatibilityCases>[number]) {
  const {state, settings, ticks} = fixture;
  const hashes = [snapshotDigest(state, settings)];
  for (let i = 0; i < ticks; i++) {stepSimulation(state, settings, 1 / 60); hashes.push(snapshotDigest(state, settings));}
  return {name: fixture.name, ticks, hashes};
}
