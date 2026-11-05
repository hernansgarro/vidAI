import {writeFileSync} from 'node:fs';
import {opticalGridCases,opticalState} from '../tests/support/optical-grid';
import {stepSimulation} from '../simulation';
if(!process.argv[2]) throw new Error('Provide an output JSON path');
const results=opticalGridCases().map(({name,state,settings,ticks})=>{
  const states=[opticalState(state,settings)],events:unknown[]=[],energy:unknown[]=[];
  for(let tick=0;tick<ticks;tick++) {
    stepSimulation(state,settings,1/60,event=>events.push([tick,event]),undefined,(...r)=>energy.push([tick,...r]));
    states.push(opticalState(state,settings));
  }
  return {name,ticks,states,events,energy};
});
writeFileSync(process.argv[2],JSON.stringify(results));
