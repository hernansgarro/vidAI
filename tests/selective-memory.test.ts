import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome, FOUNDER_BLUEPRINTS} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {createSnapshot, restoreSnapshot, DEFAULT_SETTINGS, totalAccountedEnergy, validateGenome} from '../persistence';

const dt = 1/60;
const settings = {...DEFAULT_SETTINGS,targetNutrients:0,inflowRate:0,mutationSeverity:0};
const steps = (world:sim.SimulationState,n:number) => {
 for(let i=0;i<n;i++)sim.stepSimulation(world,settings,dt);
};
const conserved=(s:sim.SimulationState)=>{
 assert.ok(Math.abs(totalAccountedEnergy(s)-s.ledger.externalInflow)<.0001);
};
const retention=(org:sim.Organism)=>[...(org.learnedMotorWeights??[]),
 ...(org.learnedSensoryWeights??[])].reduce((sum,v)=>sum+(v.consolidation??0),0);
const learned=(org:sim.Organism)=>[...(org.learnedMotorWeights??[]),
 ...(org.learnedSensoryWeights??[])].reduce((sum,v)=>sum+Math.abs(v.delta),0);
const make=(rate:number)=>{
 const state=createInitialWorld(settings,142,'unbiased','standard',0);
 const genome=createFounderGenome('FND-001','balanced');
 genome.plasticityRate=.8; genome.sensoryPlasticityRate=.8;
 genome.memoryConsolidationRate=rate; genome.forgettingRate=.65;
 genome.motorForce=0;genome.maturityAge=1000; // isolated physical mouth training
 const creature=addExternalOrganism(state,genome,settings,1200,750,0)!;
 const mouth=genome.mouths[0],root=genome.parts[mouth.partIndex];
 const anchor=sim.getOrganAnchor(mouth,root.width,root.height);
 state.nutrients.push({id:'finite-food',x:1200+anchor.x,y:750+anchor.y,vx:0,vy:0,
  kind:'nutrient',energyValue:3000,radius:18,bottomTimer:0,pulseTimer:0});
 state.ledger.externalInflow+=3000;
 return {state,creature};
};
const removeFood=(s:sim.SimulationState)=>{
 const food=s.nutrients.reduce((sum,n)=>sum+n.energyValue,0);
 s.ledger.recordedLosses+=food;
 s.nutrients=[];
};

test('reinforcing actual intake selectively stabilizes learned retinal and motor synapses; no passive consolidation',()=>{
 const trained=make(2),legacy=make(0);
 const unearned=make(2);removeFood(unearned.state);
 steps(trained.state,20);steps(legacy.state,20);steps(unearned.state,20);
 const initial=retention(trained.creature);
 assert.ok(initial>0,'compatible first learned response is reinforced again through real food');
 assert.equal(retention(legacy.creature),0,'without consolidation trait, no protected somatic memories');
 assert.equal(retention(unearned.creature),0,'no actual mouth reward means no memory is consolidated');
 assert.equal(learned(unearned.creature),0);
 steps(trained.state,35);steps(legacy.state,35);
 assert.ok(retention(trained.creature)>initial,'continued genuine reward increases retention');
 assert.ok(trained.creature.learnedSensoryWeights!.some(e=>(e.consolidation??0)>.00001));
 assert.ok(trained.creature.learnedMotorWeights!.some(e=>(e.consolidation??0)>.00001));
 assert.ok(trained.creature.recentFeedings?.some(e=>e.foodCategory==='Nutrient'&&e.energyTransferred>0));
 assert.ok(trained.creature.plasticityEnergyRate!>0);
 const snapshot=createSnapshot(trained.state,settings);
 const resumed=restoreSnapshot(snapshot);
 assert.deepEqual(createSnapshot(resumed.state,settings),snapshot);
 for(let i=0;i<3;i++){
  sim.stepSimulation(trained.state,settings,dt);
  sim.stepSimulation(resumed.state,settings,dt);
 }
 assert.deepEqual(createSnapshot(resumed.state,settings),createSnapshot(trained.state,settings));
 for(const row of [trained,legacy,unearned])conserved(row.state);
 console.log('VIDA_PHASE5_RETENTION '+JSON.stringify({stabilization:retention(trained.creature),
   gainedWeightMagnitude:learned(trained.creature),
   retainedEdges:trained.creature.learnedSensoryWeights!.filter(e=>(e.consolidation??0)>0).length}));
});

test('repeated real-reward memory decays more slowly than identical unprotected experience, without subsidy or inheritance',()=>{
 const trained=make(2);
 steps(trained.state,65);
 assert.ok(retention(trained.creature)>0);
 // Counterfactual begins from precisely the same body, food, reward history
 // and genetic synaptic baseline. Only the learned stabilization trait and
 // acquired consolidation are disabled; the learned deltas remain identical.
 const control=restoreSnapshot(createSnapshot(trained.state,settings)).state;
 const old=control.organisms[0];
 old.genome.memoryConsolidationRate=0;
 old.learnedMotorWeights!.forEach(e=>{delete e.consolidation});
 old.learnedSensoryWeights!.forEach(e=>{delete e.consolidation});
 const originalGenome=structuredClone(trained.creature.genome);
 const inheritedGenes=sim.mutateGenome(trained.creature.genome,0,new sim.XoshiroPRNG(13));
 assert.equal(inheritedGenes.memoryConsolidationRate,2);
 assert.equal(sim.spawnOrganism(inheritedGenes,1800,750,0).learnedMotorWeights,undefined);
 assert.equal(sim.spawnOrganism(inheritedGenes,1800,750,0).learnedSensoryWeights,undefined);
 const begin=learned(trained.creature);
 removeFood(trained.state); removeFood(control);
 steps(trained.state,240);steps(control,240);
 const protectedChange=learned(trained.creature),unprotectedChange=learned(old);
 assert.ok(protectedChange>unprotectedChange+1e-5,
   'reward-earned consolidation must retain stronger weights for the same past experience');
 assert.ok(protectedChange<begin,'even stabilized personal memories are not permanent');
 assert.ok(retention(trained.creature)>0,'earned consolidation persists across a later food-free interval');
 assert.deepEqual(trained.creature.genome,originalGenome,'acquired memory cannot touch inherited DNA');
 conserved(trained.state);conserved(control);
 console.log('VIDA_PHASE5_FORGET '+JSON.stringify({initial:begin,consolidated:protectedChange,
   unprotected:unprotectedChange}));
});

test('old founders preserve exact snapshots; trait mutation and invalid stored retention are bounded',()=>{
 for(const bp of FOUNDER_BLUEPRINTS){
  const g=createFounderGenome(bp.id);
  assert.equal(g.memoryConsolidationRate,undefined);
 }
 const original=createInitialWorld(settings,41,'unbiased','standard',0);
 const legacy=addExternalOrganism(original,createFounderGenome('FND-001'),settings,1200,750,0)!;
 const checkpoint=createSnapshot(original,settings);
 steps(original,5);steps(restoreSnapshot(checkpoint).state,0);
 const cloned=restoreSnapshot(checkpoint).state;steps(cloned,5);
 assert.deepEqual(createSnapshot(cloned,settings),createSnapshot(original,settings));
 assert.equal(legacy.learnedSensoryWeights,undefined);
 assert.equal(legacy.learnedMotorWeights,undefined);
 const parent=createFounderGenome('FND-001','unbiased');parent.plasticityRate=.8;
 let generated=false;
 for(let seed=1;seed<=160;seed++){
  const child=sim.mutateGenome(parent,1,new sim.XoshiroPRNG(seed));
  if((child.memoryConsolidationRate??0)>0){generated=true;assert.deepEqual(validateGenome(child),child);break}
 }
 assert.ok(generated,'ordinary asexual mutation must be capable of introducing retention');
 for(const value of [-1,2.01,Number.NaN,Infinity]){
  const g=structuredClone(parent);g.memoryConsolidationRate=value;
  assert.throws(()=>validateGenome(g),/Invalid snapshot/);
 }
 const trained=make(2);steps(trained.state,40);
 const snapshot=createSnapshot(trained.state,settings);
 const reject=(f:(s:typeof snapshot)=>void)=>{
  const bad=structuredClone(snapshot);f(bad);
  assert.throws(()=>restoreSnapshot(bad),/Invalid snapshot/);
 };
 reject(s=>{s.state.organisms[0].learnedSensoryWeights![0].consolidation=1.2});
 reject(s=>{s.state.organisms[0].learnedMotorWeights![0].consolidation=-.01});
 reject(s=>{s.state.organisms[0].learnedSensoryWeights![0].consolidation=Infinity});
 reject(s=>{s.state.organisms[0].genome.memoryConsolidationRate=0});
 reject(s=>{s.state.organisms[0].genome.memoryConsolidationRate=2.4});
 conserved(trained.state);conserved(original);
});
