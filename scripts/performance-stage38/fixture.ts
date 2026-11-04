// Research HTML entry only; complete persistence validation includes state shapes/PRNG.
import {totalAccountedEnergy,restoreSnapshot} from '../../persistence';
(window as any).__s38Fixture={
 validate(s:any){const {state}=restoreSnapshot(s);return {energy:totalAccountedEnergy(state),budget:state.energyPool?.budget};},
 inventory(s:any){const o=s.state.organisms;const sum=(fn:(v:any)=>number)=>o.reduce((t:number,x:any)=>t+fn(x),0);return {
 organisms:o.length,living:o.filter((x:any)=>!x.dissolving).length,parts:sum(x=>x.genome.parts.length),joints:sum(x=>x.joints.length),eyes:sum(x=>x.genome.eyes.length),rays:sum(x=>x.genome.eyes.length*5),mouths:sum(x=>x.genome.mouths.length),hiddenNeurons:sum(x=>x.neuralHidden.length),inputs:sum(x=>x.neuralInputs.length),outputs:sum(x=>x.neuralOutputs.length),nutrients:s.state.nutrients.length,eggs:s.state.eggs.length,births:s.state.totalBirths,deaths:s.state.totalDeaths,caustics:s.state.caustics.length,bubbles:s.state.bubbles.length,
 reserveJ:sum(x=>x.energy),worldReserveJ:s.state.energyPool?.reserve,basalRate:sum(x=>x.basalEnergyRate??0),plasticityRate:sum(x=>x.plasticityEnergyRate??0),motorRate:sum(x=>x.motorEnergyRate??0),motorLearnedL1:sum(x=>(x.learnedMotorWeights??[]).reduce((t:number,v:any)=>t+Math.abs(v.delta),0)),sensoryLearnedL1:sum(x=>(x.learnedSensoryWeights??[]).reduce((t:number,v:any)=>t+Math.abs(v.delta),0)),motorOutputL1:sum(x=>x.neuralOutputs.reduce((t:number,v:number)=>t+Math.abs(v),0)),distance:sum(x=>x.distanceTraveled),guards:sum(x=>x.motorDiagnostics?.numericalGuardEvents??0),ledger:s.state.ledger
 };}
};

import {DEFAULT_SETTINGS, createSnapshot} from '../../persistence';
import {createInitialWorld, addExternalOrganism} from '../../world';
import {createFounderGenome} from '../../founders';
import {addNutrients} from '../../simulation';
import {enableClosedEconomy} from '../../energyEconomy';
(window as any).__s38Fixture.make=(count:number,compact=false)=>{
 if(![25,50,100,150].includes(count)||compact&&count!==100)throw Error('Unregistered fixture');
 const tiles=count/25, width=tiles===1?2000:4000,height=Math.ceil(tiles/2)*1000;
 const settings={...DEFAULT_SETTINGS,physicsRegime:'passive-work-v3' as const,ecologyRegime:'closed-v1' as const,mouthContactModel:'capsule-v1' as const,nutrientCycle:'decay-v2' as const,nutrientLimit:null,worldWidth:width,worldHeight:height,maxOrganisms:150,targetNutrients:count*4,inflowRate:0};
 const state=createInitialWorld({...settings,ecologyRegime:undefined,targetNutrients:0},73,'balanced','standard',0);
 for(let i=0;i<count;i++){
  const tile=Math.floor(i/25),j=i%25;
  const x=(tile%2)*2000+(j%5+.5)*400,y=Math.floor(tile/2)*1000+(Math.floor(j/5)+.5)*200;
  const g=createFounderGenome('CUR-00'+(j%5+1),'balanced');
  if(!addExternalOrganism(state,g,settings,x,y,(j*.37)% (2*Math.PI)))throw Error('Fixture population funding/cap');
 }
 addNutrients(state,settings,count*4);enableClosedEconomy(state);
 if(compact)for(const org of state.organisms){const root=org.segments[0],dx=(width/2-root.x)*.65,dy=(height/2-root.y)*.65;for(const segment of org.segments){segment.x+=dx;segment.y+=dy;}}
 const snapshot=createSnapshot(state,settings,{observerPreferences:{selectAddedCreature:false,trackSelectedCreature:false,showCaustics:false}});
 restoreSnapshot(snapshot);
 return snapshot;
};
