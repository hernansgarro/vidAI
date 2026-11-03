// Separate research HTML entry; ordinary application imports stay unchanged.
import {DEFAULT_SETTINGS,createSnapshot,totalAccountedEnergy,restoreSnapshot} from '../../persistence';
import {createInitialWorld} from '../../world';
import {SimulationHost} from '../../simulationHost';
import {getBrainLayout} from '../../simulation';
const settings={...DEFAULT_SETTINGS,physicsRegime:'passive-work-v3' as const,ecologyRegime:'closed-v1' as const,mouthContactModel:'capsule-v1' as const,nutrientCycle:'decay-v2' as const,nutrientLimit:null};
(window as any).__s36Fixture={
 create(n:number){return createSnapshot(createInitialWorld(settings,73,'balanced','standard',n),settings);},
 energy(s:any){return totalAccountedEnergy(restoreSnapshot(s).state);},
 inventory(s:any){const o=s.state.organisms;return {organisms:o.length,living:o.filter((x:any)=>!x.dissolving).length,parts:o.reduce((t:number,x:any)=>t+x.genome.parts.length,0),eyes:o.reduce((t:number,x:any)=>t+x.genome.eyes.length,0),hiddenNeurons:o.reduce((t:number,x:any)=>t+x.neuralHidden.length,0),nutrients:s.state.nutrients.length,eggs:s.state.eggs.length,caustics:s.state.caustics.length,bubbles:s.state.bubbles.length};},
 validity(snapshot:any,selected:boolean){const h=new SimulationHost();h.reset(snapshot,71);h.selected=selected?h.state.organisms[0].id:null;const r=(window as any).__s36Runtime;if(r){r.reset();r.active=true;}for(let i=0;i<120;i++){h.tick();if(i%4===0)h.frame();}if(r)r.active=false;return {snapshot:h.snapshot(),energy:totalAccountedEnergy(h.state),budget:h.state.energyPool?.budget};}
};
