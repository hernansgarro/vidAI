// Research HTML entry only; complete persistence validation includes state shapes/PRNG.
import {totalAccountedEnergy,restoreSnapshot} from '../../persistence';
(window as any).__s37Fixture={
 validate(s:any){const {state}=restoreSnapshot(s);return {energy:totalAccountedEnergy(state),budget:state.energyPool?.budget};},
 inventory(s:any){const o=s.state.organisms;const sum=(fn:(v:any)=>number)=>o.reduce((t:number,x:any)=>t+fn(x),0);return {
 organisms:o.length,living:o.filter((x:any)=>!x.dissolving).length,parts:sum(x=>x.genome.parts.length),joints:sum(x=>x.joints.length),eyes:sum(x=>x.genome.eyes.length),rays:sum(x=>x.genome.eyes.length*5),mouths:sum(x=>x.genome.mouths.length),hiddenNeurons:sum(x=>x.neuralHidden.length),inputs:sum(x=>x.neuralInputs.length),outputs:sum(x=>x.neuralOutputs.length),nutrients:s.state.nutrients.length,eggs:s.state.eggs.length,births:s.state.totalBirths,deaths:s.state.totalDeaths,caustics:s.state.caustics.length,bubbles:s.state.bubbles.length,
 reserveJ:sum(x=>x.energy),worldReserveJ:s.state.energyPool?.reserve,basalRate:sum(x=>x.basalEnergyRate??0),plasticityRate:sum(x=>x.plasticityEnergyRate??0),motorRate:sum(x=>x.motorEnergyRate??0),motorLearnedL1:sum(x=>(x.learnedMotorWeights??[]).reduce((t:number,v:any)=>t+Math.abs(v.delta),0)),sensoryLearnedL1:sum(x=>(x.learnedSensoryWeights??[]).reduce((t:number,v:any)=>t+Math.abs(v.delta),0)),motorOutputL1:sum(x=>x.neuralOutputs.reduce((t:number,v:number)=>t+Math.abs(v),0)),distance:sum(x=>x.distanceTraveled),guards:sum(x=>x.motorDiagnostics?.numericalGuardEvents??0),ledger:s.state.ledger
 };}
};
