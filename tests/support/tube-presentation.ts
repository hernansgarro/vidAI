import {CARRION_DECAY_SECONDS} from '../../simulation';
import {selfTubeFixture} from './self-tubes';
import {eggReserveFixture} from './egg-reserve';
import {createSnapshot} from '../../persistence';
import {enableClosedEconomy, setWorldEnergy} from '../../energyEconomy';
import {translateLiveOrganism} from '../../selfTubes';

/** Static, funded scene for observer-only pixel checks. Never runs in the app. */
export function tubePresentationFixture(side: 'L' | 'R', depth: number, empty = false) {
  const {state, settings} = selfTubeFixture();
  settings.worldWidth = 800; settings.worldHeight = 1800;
  state.selfTubes!.accepted = [0, 1, 2, 3, 4, 5];
  const x = side === 'L' ? -depth : settings.worldWidth + depth;
  const org = state.organisms[0];
  translateLiveOrganism(org, x - org.segments[0].x, 1650 - org.segments[0].y);
  org.traceHistory = [{x: x - 60, y: 1700, time: 0}, {x: x + 60, y: 1700, time: 0}];
  state.caustics = [{x, y: 150, radius: 45, speed: 0, alpha: 1, angle: 0}];
  state.bubbles = [{x, y: 450, vx: 0, vy: 0, size: 16, alpha: 1, life: 1, maxLife: 100, hue: 50}];
  state.nutrients = [750, 1050].map((y, i) => ({id: `optical-food-${i}`, x, y, vx: 0, vy: 0,
    radius: 12, energyValue: 3000, pulseTimer: 0, bottomTimer: 0,
    ...(i ? {kind: 'carrion' as const, decayTimeRemaining: CARRION_DECAY_SECONDS} : {})}));
  state.eggs = [{...eggReserveFixture(true).state.eggs[2], x, y: 1350}];
  if (empty) {state.organisms = []; state.caustics = []; state.bubbles = []; state.nutrients = []; state.eggs = [];}
  delete state.energyPool; enableClosedEconomy(state); setWorldEnergy(state, state.energyPool!.budget + 1200000);
  return createSnapshot(state, settings);
}
