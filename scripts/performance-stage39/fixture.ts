// Research HTML entry only; complete persistence validation includes state shapes/PRNG.
import {totalAccountedEnergy,restoreSnapshot} from '../../persistence';
(window as any).__s39Fixture={
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
(window as any).__s39Fixture.make=(count:number,dense=false)=>{
 if(![25,50,100,150].includes(count)||dense&&count!==100)throw Error('Unregistered fixture');
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
 if(dense)for(let i=0;i<state.organisms.length;i++){
  const org=state.organisms[i],bounds=bodyBox(org),w=bounds.right-bounds.left,h=bounds.bottom-bounds.top;
  if(w>112.000001||h>112.000001)throw Error('Body exceeds registered dense cell envelope');
  const cx=width/2+(i%10-4.5)*140,cy=height/2+(Math.floor(i/10)-4.5)*140;
  const dx=cx-(bounds.left+bounds.right)/2,dy=cy-(bounds.top+bounds.bottom)/2;
  for(const segment of org.segments){segment.x+=dx;segment.y+=dy;}
 }
 const snapshot=createSnapshot(state,settings,{observerPreferences:{selectAddedCreature:false,trackSelectedCreature:false,showCaustics:false}});
 restoreSnapshot(snapshot);
 return snapshot;
};

import {rectangleContact} from '../../contacts';
function bodyBox(o:any){
 const boxes=o.segments.map((p:any,i:number)=>{const d=o.genome.parts[i],c=Math.cos(p.angle),s=Math.sin(p.angle),rx=(Math.abs(c)*d.width+Math.abs(s)*d.height)/2,ry=(Math.abs(s)*d.width+Math.abs(c)*d.height)/2;return {left:p.x-rx,right:p.x+rx,top:p.y-ry,bottom:p.y+ry};});
 return {left:Math.min(...boxes.map((b:any)=>b.left)),right:Math.max(...boxes.map((b:any)=>b.right)),top:Math.min(...boxes.map((b:any)=>b.top)),bottom:Math.max(...boxes.map((b:any)=>b.bottom))};
}
(window as any).__s39Fixture.geometry=(s:any)=>{
 const organisms=s.state.organisms,boxes=organisms.map(bodyBox),parts=organisms.flatMap((o:any,oi:number)=>o.segments.map((p:any,i:number)=>({p,d:o.genome.parts[i],oi,i})));let external=0,self=0,minBodyAABBGap=Infinity;
 for(let i=0;i<parts.length;i++)for(let j=0;j<i;j++){const a=parts[i],b=parts[j];if(a.oi===b.oi&&(a.d.parentIndex===b.i||b.d.parentIndex===a.i))continue;if(rectangleContact(a.p,a.d,b.p,b.d)){if(a.oi===b.oi)self++;else external++;}}
 for(let i=0;i<boxes.length;i++)for(let j=0;j<i;j++){const a=boxes[i],b=boxes[j],dx=Math.max(a.left-b.right,b.left-a.right,0),dy=Math.max(a.top-b.bottom,b.top-a.bottom,0);minBodyAABBGap=Math.min(minBodyAABBGap,Math.hypot(dx,dy));}
 return {interorganismIntersectingPartPairs:external,nonhingedSelfIntersectingPartPairs:self,minBodyAABBGap,boxes,insideWalls:boxes.every((b:any)=>b.left>=0&&b.top>=0&&b.right<=s.settings.worldWidth&&b.bottom<=s.settings.worldHeight),occupiedBounds:{left:Math.min(...boxes.map((b:any)=>b.left)),right:Math.max(...boxes.map((b:any)=>b.right)),top:Math.min(...boxes.map((b:any)=>b.top)),bottom:Math.max(...boxes.map((b:any)=>b.bottom))}};
};
