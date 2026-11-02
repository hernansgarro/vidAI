/** Research fixtures only; never imported by the application. */
import {createInitialWorld, addExternalOrganism} from '../../world';
import {DEFAULT_SETTINGS, createSnapshot} from '../../persistence';
import {energyActivityFixture} from '../../tests/support/energy-activity';
import {enableClosedEconomy} from '../../energyEconomy';
import {translateLiveOrganism} from '../../selfTubes';
export function founderCheckpoint(count: number, tubes = false) {
  const settings = {...DEFAULT_SETTINGS, physicsRegime: 'passive-work-v3' as const,
    ecologyRegime: 'closed-v1' as const, mouthContactModel: 'capsule-v1' as const,
    nutrientCycle: 'decay-v2' as const, nutrientLimit: null, inflowRate: 0,
    targetNutrients: count === 5 ? 78 : count === 15 ? 200 : 300};
  const state = createInitialWorld(settings, 711, 'balanced', 'standard', count);
  if (tubes) state.selfTubes = {version: 1, connected: true, accepted: [0, 2, 4]};
  return createSnapshot(state, settings);
}
export function activityCheckpoint() {
  const first = energyActivityFixture();
  const state = first.state;
  const settings = {...first.config, physicsRegime: 'passive-work-v3' as const,
    ecologyRegime: 'closed-v1' as const, mouthContactModel: 'capsule-v1' as const,
    nutrientCycle: 'decay-v2' as const, nutrientLimit: null, targetNutrients: 7};
  const originals = [...state.organisms];
  // Seven independent copies of the established physical contact fixture.
  for (let pair = 0; pair < 7; pair++) {
    const x = 250 + pair % 4 * 520, y = 400 + Math.floor(pair / 4) * 600;
    if (pair === 0) {
      for (const o of originals) translateLiveOrganism(o, x - 1200, y - 750);
      state.nutrients[0].x = x + 30; state.nutrients[0].y = y;
    } else {
      const source = energyActivityFixture();
      for (const donor of source.state.organisms) {
        const o = addExternalOrganism(state, donor.genome, settings,
          donor.segments[0].x + x - 1200, donor.segments[0].y + y - 750, 0)!;
        o.energy = donor.energy; o.structuralBiomass = donor.structuralBiomass;
      }
      state.nutrients.push({...source.state.nutrients[0], id: `stage3-meal-${pair}`, x: x + 30, y});
    }
  }
  const donor = createInitialWorld({...settings, targetNutrients: 0}, 12, 'balanced', 'standard', 1).organisms[0];
  addExternalOrganism(state, donor.genome, settings, 2100, 1200, 0);
  delete state.energyPool; enableClosedEconomy(state);
  return createSnapshot(state, settings);
}
