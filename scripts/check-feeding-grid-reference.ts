import {writeFileSync} from 'node:fs';
import {feedingGridCases, feedingState} from '../tests/support/feeding-grid';
import {stepSimulation} from '../simulation';

// Explicit output path: run the same fixture against detached P6 and P7,
// then compare COMPLETE snapshots and ordered event/energy receipts externally.
if (!process.argv[2]) throw new Error('Provide a temporary output JSON path');
const results = feedingGridCases().map(({name, state, settings, ticks}) => {
  const states = [feedingState(state, settings)], events: unknown[] = [], energy: unknown[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    stepSimulation(state, settings, 1 / 60, event => events.push([tick, event]), undefined,
      (...receipt) => energy.push([tick, ...receipt]));
    states.push(feedingState(state, settings));
  }
  return {name, ticks, states, events, energy};
});
writeFileSync(process.argv[2], JSON.stringify(results));
