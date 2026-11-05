import {ensureMaintainedGrid} from '../../maintainedGrid';
import type {SimulationState} from '../../simulation';

/** Test-only P9 reference path: ignore B's optional pure filter, keeping the
 * original raw query and full descending sort. No simulation rule is replaced. */
export function disableP10FeedingFilter(state: SimulationState): () => void {
  const grid=ensureMaintainedGrid(state),original=grid.queryBounds;
  grid.queryBounds=(q,k,d)=>original.call(grid,q,k,d);
  return ()=>{grid.queryBounds=original;};
}
