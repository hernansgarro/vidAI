import type {SimulationSettings} from '../../simulation';
import {createSnapshot} from '../../persistence';
import {feedingGridCases} from './feeding-grid';
import {opticalScene,opticalNames} from './optical-scene';
export {opticalScene,opticalNames,opticalGenome} from './optical-scene';
export function opticalGridCases() {return [...feedingGridCases(),...opticalNames.map(opticalScene)];}
export const opticalState=(state: ReturnType<typeof opticalScene>['state'], settings: SimulationSettings)=>
  JSON.parse(JSON.stringify(createSnapshot(state,settings)));
