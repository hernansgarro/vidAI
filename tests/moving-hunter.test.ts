import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, totalAccountedEnergy} from '../persistence';

const settings = {...DEFAULT_SETTINGS,targetNutrients:0,inflowRate:0,mutationSeverity:0,kinshipProtection:false};
type Response = 'connected'|'disconnected';
function trial(response:Response, hunterSpeed:number, separation:number, hunterAngle=0, preyId='FND-001', steps=180){
 const state=createInitialWorld(settings,733,'unbiased','standard',0);
 const preyGenome=createFounderGenome(preyId,'unbiased');
 preyGenome.maturityAge=1000;
 const ctrl=sim.mutateBrainTopology(preyGenome,'wire-injury-motor',new sim.XoshiroPRNG(13));
 assert.equal(ctrl,true);
 const node=preyGenome.hiddenIds!.at(-1)!;
 const injury=preyGenome.inputKeys!.indexOf('body:injury'),h=preyGenome.hiddenIds!.length-1;
 if(response==='disconnected')preyGenome.weightsIH[h][injury]=0;
 const prey=addExternalOrganism(state,preyGenome,settings,1200,750,0)!;
 const hunterGenome=createFounderGenome('FND-001','unbiased');
 hunterGenome.maturityAge=1000;
 hunterGenome.motorFrequency *= hunterSpeed;
 hunterGenome.mouths[0].mouthType='omnivore';
 hunterGenome.mouths[0].intakeWidth=30;
 hunterGenome.bodyCost=sim.calculateBodyCost(hunterGenome.parts,hunterGenome.eyes,hunterGenome.mouths);
 const hunter=addExternalOrganism(state,hunterGenome,settings,1200-separation,750,hunterAngle)!;
 const hunterStart=sim.calculateOrganismCOM(hunter),preyStart=sim.calculateOrganismCOM(prey);
 const initialTotal=totalAccountedEnergy(state);
 let biteJ=0,hitTicks=0,peakSignal=0,headDelta=0;
 for(let t=0;t<steps;t++){
  sim.stepSimulation(state,settings,1/60);
  const taken=prey.biteFeedbackJ??0;
  biteJ+=taken;if(taken>0)hitTicks++;
  peakSignal=Math.max(peakSignal,prey.neuralInputs[injury]??0);
 }
 const endH=sim.calculateOrganismCOM(hunter),endP=sim.calculateOrganismCOM(prey);
 assert.ok(Math.abs(totalAccountedEnergy(state)-initialTotal)<.0001);
 return {response,hunterSpeed,separation,hunterAngle,preyId,biteJ:+biteJ.toFixed(2),hitTicks,peakSignal:+peakSignal.toFixed(2),
   hunterDx:+(endH.x-hunterStart.x).toFixed(1),preyDx:+(endP.x-preyStart.x).toFixed(1),
   hunterDy:+(endH.y-hunterStart.y).toFixed(1),preyDy:+(endP.y-preyStart.y).toFixed(1),
   finalSeparation:+Math.hypot(endH.x-endP.x,endH.y-endP.y).toFixed(1),surviving:!prey.dissolving,
   predatorEnergy:hunter.energy, victimEnergy:prey.energy};
}
test('baseline moving-hunter/contact geometry sweep (short physical trial, no scripted movement)',()=>{
 const results=[];
 for(const hunterSpeed of [1,1.5,2.2])for(const separation of [82,94,106,118,130])
  for(const response of ['connected','disconnected'] as Response[])
   results.push(trial(response,hunterSpeed,separation));
 console.log('PHASE5C_MOBILE_SCOUT '+JSON.stringify(results));
});
