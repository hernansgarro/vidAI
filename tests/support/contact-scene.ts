import {synchronizeMaintainedGrid} from '../../maintainedGrid';
import {createInitialWorld, addExternalOrganism} from '../../world';
import {createFounderGenome} from '../../founders';
import {DEFAULT_SETTINGS} from '../../persistence';
import {calculateBodyCost, calculateMaxEnergyCapacity, remapBrain, type SimulationSettings} from '../../simulation';

export const contactNames = ['branched', 'long-folded', 'dense-boundary', 'reverse-dense', 'cell-corners', 'fast-substeps'] as const;
export function contactScene(name: typeof contactNames[number]) {
  const settings: SimulationSettings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0,
    gravity: 0, waterViscosity: .18, physicsRegime: 'passive-work-v3', mutationSeverity: 0};
  const state = createInitialWorld(settings, 917, 'balanced', 'standard', 0);
  const count = name.includes('dense') ? 12 : 4;
  for (let i = 0; i < count; i++) {
    const g = createFounderGenome(name === 'branched' ? ['CUR-006','CUR-007','CUR-009'][i % 3] : 'CUR-001');
    g.eyes = []; g.mouths = []; g.motorForce = 0;
    g.bodyCost = calculateBodyCost(g.parts, g.eyes, g.mouths);
    g.maxEnergyCapacity = calculateMaxEnergyCapacity(g.parts, g.storageTraitMultiplier); remapBrain(g);
    const org = addExternalOrganism(state, g, settings, 250 + i % 3 * 9, 250 + Math.floor(i / 3) * 8, i * .63)!;
    if (name === 'long-folded') {
      // A finite separated/folded imported pose; no ideal-articulation assumption.
      org.segments.forEach((p,j) => {p.x = 128 + j * 115; p.y = 256 + i * 5; p.angle = j * 1.1;});
    } else if (name === 'cell-corners') {
      org.segments.forEach((p,j) => {p.x = 128 + i * 2; p.y = 256 + j * 2; p.angle = (i+j) * Math.PI / 4;});
    }
    org.segments.forEach((p,j) => {p.vx = (i % 2 ? -1 : 1) * (name === 'fast-substeps' ? 150 : 8);
      p.vy = j % 2 ? 3 : -3; p.angVel = (i - 1) * .2;});
  }
  if (name === 'reverse-dense') state.organisms.reverse();
  // Complete the test-only external pose/roster edit transaction before queries.
  synchronizeMaintainedGrid(state);
  return {name, state, settings, ticks: 4, dt: name === 'fast-substeps' ? 1/30 : 1/60};
}
