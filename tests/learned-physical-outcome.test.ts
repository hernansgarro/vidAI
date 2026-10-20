import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, createSnapshot, restoreSnapshot, totalAccountedEnergy} from '../persistence';

const settings={...DEFAULT_SETTINGS, targetNutrients:0, inflowRate:0, mutationSeverity:0};
const dt=1/60;
const step=(world:sim.SimulationState,n:number)=>{for(let t=0;t<n;t++)sim.stepSimulation(world,settings,dt);};
function addFood(world:sim.SimulationState,id:string,x:number,y:number,amount=3000){
  world.nutrients.push({id,x,y,vx:0,vy:0,kind:'nutrient' as const,energyValue:amount,
    radius:sim.getNutrientRadius(amount),bottomTimer:0,pulseTimer:0});
  world.ledger.externalInflow+=amount;
}
function clearFood(world:sim.SimulationState){
  world.ledger.recordedLosses+=world.nutrients.reduce((sum,food)=>sum+food.energyValue,0);
  world.nutrients=[];
}
const magnitude=(o:sim.Organism)=>[...(o.learnedMotorWeights??[]),...(o.learnedSensoryWeights??[])]
  .reduce((sum,v)=>sum+Math.abs(v.delta),0);
function train(seed:number) {
 const world=createInitialWorld(settings,seed,'balanced','standard',0);
 const g=createFounderGenome('FND-001','balanced');
 g.plasticityRate=.8;g.sensoryPlasticityRate=.8;g.plasticMotorScope='all';
 g.memoryConsolidationRate=2;g.forgettingRate=.04;g.maturityAge=1000;
 const org=addExternalOrganism(world,g,settings,1200,750,0)!;
 // Finite starting nutrient patch in a normal physical forward swimming lane:
 // no scripted reward, food following, teleporting, steering, or energy bonus.
 for(let i=0;i<6;i++)addFood(world,'training-'+i,1280+i*40,750,3000);
 const start=sim.calculateOrganismCOM(org);
 step(world,240);
 const end=sim.calculateOrganismCOM(org);
 return {world,org,trainDx:end.x-start.x,foodReceived:org.foodEaten,stored:magnitude(org)};
}
function followup(seed:number, side:number, d:number) {
 const trained=train(seed);
 const snapshot=createSnapshot(trained.world,settings);
 const original=restoreSnapshot(snapshot).state;
 const control=restoreSnapshot(snapshot).state;
 for(const w of [original,control])clearFood(w);
 const a=original.organisms[0], b=control.organisms[0];
 const erase=(o:sim.Organism)=>{
  o.learnedMotorWeights?.forEach(s=>{s.delta=0;s.eligibility=0;s.consolidation=0});
  o.learnedSensoryWeights?.forEach(s=>{s.delta=0;s.eligibility=0;s.consolidation=0});
 };
 erase(b);
 const center=sim.calculateOrganismCOM(a);
 // Identical physical bodies and world RNG. New stimulus starts as a
 // static finite food particle near the swimmer's forward trajectory.
 const x=center.x+d,y=center.y+side;
 addFood(original,'new-food',x,y);
 addFood(control,'new-food',x,y);
 const initialA=totalAccountedEnergy(original),initialB=totalAccountedEnergy(control);
 const start=sim.calculateOrganismCOM(a);
 step(original,300);step(control,300);
 const endA=sim.calculateOrganismCOM(a), endB=sim.calculateOrganismCOM(b);
 const consumed=(w:sim.SimulationState)=>3000-w.nutrients.reduce((sum,n)=>sum+n.energyValue,0);
 const eatenA=consumed(original),eatenB=consumed(control);
 assert.ok(Math.abs(totalAccountedEnergy(original)-initialA)<.0001);
 assert.ok(Math.abs(totalAccountedEnergy(control)-initialB)<.0001);
 const moveA=Math.hypot(endA.x-start.x,endA.y-start.y);
 const moveB=Math.hypot(endB.x-start.x,endB.y-start.y);
 return {seed,side,d,trainingFoodJ:trained.foodReceived,trainedDelta:trained.stored,
  trainingTravelX:trained.trainDx, eatenA,eatenB,netIntakeDifferenceJ:eatenA-eatenB,
  travelA:moveA,travelB:moveB,
  targetProgressA:Math.hypot(start.x-x,start.y-y)-Math.hypot(endA.x-x,endA.y-y),
  targetProgressB:Math.hypot(start.x-x,start.y-y)-Math.hypot(endB.x-x,endB.y-y),
  reserveA:a.energy,reserveB:b.energy};
}
test('real learned experience is compared against its own erased-experience physical twin',()=>{
 const cases=[{seed:711,side:0,d:120},{seed:711,side:-34,d:130},
 {seed:711,side:34,d:130},{seed:733,side:0,d:130}];
 const results=cases.map(x=>followup(x.seed,x.side,x.d));
 console.log('VIDA_PHASE5_PHYSICAL_LEARNING_PRECONDITIONS '+JSON.stringify(results));
 assert.ok(results.every(r=>r.trainingFoodJ>0&&r.trainedDelta>0&&r.trainingTravelX>10),
   'each animal must genuinely swim, acquire physical food, and learn before the test');
 const improved=results.filter(r=>r.netIntakeDifferenceJ>0.1).length;
 const worsened=results.filter(r=>r.netIntakeDifferenceJ<-.1).length;
 console.log('VIDA_PHASE5_PHYSICAL_LEARNING '+JSON.stringify({improved,worsened,results}));
});
