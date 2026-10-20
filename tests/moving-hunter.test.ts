import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, totalAccountedEnergy} from '../persistence';

const settings = {...DEFAULT_SETTINGS,targetNutrients:0,inflowRate:0,mutationSeverity:0,kinshipProtection:false};
type Response = 'connected'|'disconnected';
function trial(response:Response, hunterSpeed:number, separation:number, hunterAngle=0, preyId='FND-001', steps=180, placeByRearEdge=false){
 const state=createInitialWorld(settings,733,'unbiased','standard',0);
 const preyGenome=createFounderGenome(preyId,'unbiased');
 preyGenome.maturityAge=1000;
 let circuitSeed=13;
 if(preyId!=='FND-001'){
   for(let seed=1;seed<175;seed++){
     const copy=structuredClone(preyGenome);
     if(!sim.mutateBrainTopology(copy,'wire-injury-motor',new sim.XoshiroPRNG(seed))) continue;
     const h=copy.hiddenIds!.length-1, input=copy.inputKeys!.indexOf('body:injury');
     const amp=copy.outputKeys!.findIndex(key=>key.endsWith(':Amp'));
     const sensory=copy.weightsIH[h][input], motor=copy.weightsHO[amp][h];
     if(sensory*motor>3 && !copy.disabledConnections!.includes(sim.brainEdgeKey('ho',copy.outputKeys![amp],copy.hiddenIds![h]))) {
       circuitSeed=seed; break;
     }
   }
 }
 const ctrl=sim.mutateBrainTopology(preyGenome,'wire-injury-motor',new sim.XoshiroPRNG(circuitSeed));
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
 const rearEdge=Math.min(...prey.segments.map(p=>p.x-p.width/2));
 const hunterX=placeByRearEdge ? rearEdge - hunterGenome.parts[0].width/2 + separation : 1200-separation;
 const hunter=addExternalOrganism(state,hunterGenome,settings,hunterX,750,hunterAngle)!;
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
 return {response,hunterSpeed,separation,hunterAngle,preyId,circuitSeed,biteJ:+biteJ.toFixed(2),hitTicks,peakSignal:+peakSignal.toFixed(2),
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

test('different body plans: physical rear-edge contact and freely moving predator diagnostic',()=>{
 const observations=[];
 for(const preyId of ['FND-001','FND-006','FND-021','FND-031','FND-051']) {
   for(const overlap of [3,6,9]) {
     for(const response of ['connected','disconnected'] as Response[])
       observations.push(trial(response,1.5,overlap,0,preyId,120,true));
   }
 }
 console.log('PHASE5C_MULTIMORPH_SCOUT '+JSON.stringify(observations));
});
