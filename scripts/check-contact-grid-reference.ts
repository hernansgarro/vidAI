import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {contactGridCases,contactState} from '../tests/support/contact-grid';
import {stepSimulation} from '../simulation';
if (!process.argv[2]) throw new Error('Provide an output JSON path');
const results = contactGridCases().map(({name,state,settings,ticks,dt}) => {
  const states = [contactState(state,settings)], events: unknown[] = [], energy: unknown[] = [];
  const mechanics=createHash('sha256'), mechanicalCounts:Record<string,number>={};
  for (let tick=0;tick<ticks;tick++) {
    stepSimulation(state,settings,dt,e=>events.push([tick,e]),(...r)=>{mechanics.update(JSON.stringify([tick,...r,state.organisms.map(o=>o.segments)]));
      mechanicalCounts[r[0]]=(mechanicalCounts[r[0]]??0)+1;},(...r)=>energy.push([tick,...r]));
    states.push(contactState(state,settings));
  }
  return {name,ticks,dt,states,events,energy,mechanicalHash:mechanics.digest('hex'),mechanicalCounts};
});
writeFileSync(process.argv[2],JSON.stringify(results));
