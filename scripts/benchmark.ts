import {stepSimulation} from '../simulation';
import {createInitialWorld} from '../world';
import {DEFAULT_SETTINGS, totalAccountedEnergy} from '../persistence';

const args = process.argv.slice(2);
const value = (flag: string, fallback: number) => args.includes(flag) ? Number(args[args.indexOf(flag) + 1]) : fallback;
const seed = value('--seed', 4242), seconds = value('--seconds', 60);
if (!Number.isInteger(seed) || !Number.isFinite(seconds) || seconds <= 0 || seconds > 3600) throw new Error('Use an integer seed and 0 < seconds <= 3600.');
const s = createInitialWorld(DEFAULT_SETTINGS, seed);
for (let tick = 0; tick < Math.round(seconds * 60); tick++) {
  stepSimulation(s, DEFAULT_SETTINGS, 1 / 60);
  if ((tick + 1) % 3600 === 0 || tick + 1 === Math.round(seconds * 60)) {
    const error = totalAccountedEnergy(s) - s.ledger.externalInflow;
    if (Math.abs(error) > .001 || s.organisms.some(o => !Number.isFinite(o.energy) || o.energy < 0 || o.segments.some(p => !Object.values(p).every(Number.isFinite)))) throw new Error('Simulation invariant failed.');
    console.log(JSON.stringify({seed, seconds: (tick + 1) / 60, living: s.organisms.filter(o => !o.dissolving).length,
      births: s.totalBirths, deaths: s.totalDeaths, eggs: s.eggs.length,
      nutrients: s.nutrients.filter(n => n.kind !== 'carrion').length,
      carrion: s.nutrients.filter(n => n.kind === 'carrion').length,
      maxGeneration: Math.max(1, ...s.organisms.map(o => o.genome.generation)), energyErrorJ: error}));
  }
}
