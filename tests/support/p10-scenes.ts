import {contactGridCases} from './contact-grid';
import {importedRadiusCase} from './feeding-grid';

export const p10FoodNames = ['food-cell-false-positives', 'food-cell-reversed',
  'food-contact-tangency', 'food-budget-contact'] as const;
/** New fixed controls; all inherited fixtures remain unchanged. */
export function p10FoodScene(name: typeof p10FoodNames[number]) {
  const f = importedRadiusCase(false);
  f.name = name; f.ticks = 4;
  f.state.organisms = [f.state.organisms[1]];
  const eater = f.state.organisms[0];
  eater.segments[0].x = 130; eater.segments[0].y = 750;
  eater.genome.mouths[0].intakeLength = 7;
  const template = f.state.nutrients[0];
  f.state.nutrients = Array.from({length: 256}, (_, i) => ({...template, id: `p10-${i}`,
    x: 180 + i % 16 * 3, y: 710 + Math.floor(i / 16) * 4, radius: 1,
    kind: i % 3 ? 'nutrient' as const : 'carrion' as const,
    ...(i % 3 ? {} : {decayTimeRemaining: 60})}));
  if (name === 'food-contact-tangency') {
    // Mouth starts at133.5,750 and ends at140.5,750, with radius3.5.
    f.state.nutrients.push({...template, id: 'exact-tangent', x: 138, y: 754.5, radius: 1});
  } else {
    f.state.nutrients.push({...template, id: 'contact-a', x: 138, y: 750, radius: 1},
      {...template, id: 'contact-b', x: 139, y: 750, radius: 1});
  }
  if (name === 'food-cell-reversed') f.state.nutrients.reverse();
  if (name === 'food-budget-contact') eater.energy = eater.genome.maxEnergyCapacity;
  return {...f, dt: 1/60};
}
export function p10Cases() {return [...contactGridCases(), ...p10FoodNames.map(p10FoodScene)];}
