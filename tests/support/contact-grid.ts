import type {SimulationSettings} from '../../simulation';
import {createSnapshot} from '../../persistence';
import {opticalGridCases} from './optical-grid';
import {contactNames,contactScene} from './contact-scene';
export {contactNames,contactScene} from './contact-scene';
export function contactGridCases() {
  return [...opticalGridCases().map(f=>({...f,dt:1/60})), ...contactNames.map(contactScene)];
}
export const contactState = (state: ReturnType<typeof contactScene>['state'], settings: SimulationSettings) =>
  JSON.parse(JSON.stringify(createSnapshot(state, settings)));
