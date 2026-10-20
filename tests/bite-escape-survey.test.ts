import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, totalAccountedEnergy} from '../persistence';

type Strategy = 'neutral' | 'ampUp' | 'ampDown' | 'driveUp' | 'driveDown' | 'torqueUp' | 'angleUp' | 'angleDown' | 'engageDown';
const settings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, mutationSeverity: 0, kinshipProtection: false};
const dt = 1 / 60;
function run(strategy: Strategy, angle: number, gap: number, duration = 2.5) {
  const state = createInitialWorld(settings, 732, 'unbiased', 'standard', 0);
  const genome = createFounderGenome('FND-001', 'unbiased');
  genome.maturityAge = 1000;
  const hidden = 23;
  genome.weightsIH[hidden].fill(0);
  genome.weightsHH[hidden].fill(0);
  genome.biasesH[hidden] = 0;
  genome.weightsHO.forEach(row => row[hidden] = 0);
  const injury = genome.inputKeys!.indexOf('body:injury');
  assert.ok(injury >= 0);
  const outputs: Record<Exclude<Strategy,'neutral'>,[string,number]> = {
    ampUp: ['Amp', 3], ampDown: ['Amp', -3],
    driveUp: ['Drive', 3], driveDown: ['Drive', -3],
    torqueUp: ['Torque', 3], angleUp: ['Angle', 3], angleDown: ['Angle', -3],
    engageDown: ['Engage', -3]
  };
  if (strategy !== 'neutral') {
    genome.weightsIH[hidden][injury] = 3;
    const [channel, gain] = outputs[strategy];
    for (let i=1;i<genome.parts.length;i++) {
      const oi = genome.outputKeys!.indexOf(`joint:${genome.parts[i].id}:${channel}`);
      if (oi>=0) genome.weightsHO[oi][hidden] = gain;
    }
  }
  const victim = addExternalOrganism(state, genome, settings, 1200, 750, 0)!;
  const hunterG = sim.createReferenceNematodeGenome(new sim.XoshiroPRNG(21));
  hunterG.parts = [hunterG.parts[0]];hunterG.eyes=[];
  hunterG.mouths = [{id:'bite',partIndex:0,direction:'EAST',intakeWidth:12,mouthType:'omnivore'}];
  hunterG.motorForce = 0; hunterG.maturityAge=1000;
  hunterG.bodyCost=sim.calculateBodyCost(hunterG.parts,hunterG.eyes,hunterG.mouths);
  hunterG.maxEnergyCapacity=sim.calculateMaxEnergyCapacity(hunterG.parts,hunterG.storageTraitMultiplier);
  sim.remapBrain(hunterG);
  const tail = victim.segments[victim.segments.length - 1];
  const x=tail.x - Math.cos(angle)*(hunterG.parts[0].width/2+gap);
  const y=tail.y - Math.sin(angle)*(hunterG.parts[0].width/2+gap);
  const hunter=addExternalOrganism(state,hunterG,settings,x,y,angle)!;
  const start=sim.calculateOrganismCOM(victim);
  const total=totalAccountedEnergy(state);
  let bites=0, ticksBitten=0, maxSignal=0, changedMotor=false;
  for(let i=0;i<Math.round(duration/dt);i++) {
    sim.stepSimulation(state,settings,dt);
    const j=victim.biteFeedbackJ??0;
    bites+=j;if(j>0)ticksBitten++;
    maxSignal=Math.max(maxSignal,victim.neuralInputs[injury]??0);
    if(strategy!=='neutral') {
      const [channel]=outputs[strategy];
      const idx=victim.genome.outputKeys!.indexOf(`joint:${genome.parts[1].id}:${channel}`);
      if(Math.abs((victim.neuralOutputs[idx]??0)) > .1 && maxSignal>0)changedMotor=true;
    }
  }
  const end=sim.calculateOrganismCOM(victim);
  assert.ok(Math.abs(totalAccountedEnergy(state)-total) < 1e-4, 'energy conservation');
  return {strategy,angle,gap,bites:+bites.toFixed(1),ticksBitten,maxSignal:+maxSignal.toFixed(3),
    deltaX:+(end.x-start.x).toFixed(1),deltaY:+(end.y-start.y).toFixed(1),
    separation:+Math.hypot(end.x-hunter.segments[0].x,end.y-hunter.segments[0].y).toFixed(1),
    changedMotor,alive:!victim.dissolving};
}
test('survey inherited somatic-to-motor escape without scripts, free forces or target tracking',()=>{
  const rows = [];
  for(const angle of [0,.25,-.25]) for(const gap of [0,8])
    for(const strategy of ['neutral','ampUp','ampDown','driveUp','driveDown','torqueUp','angleUp','angleDown','engageDown'] as Strategy[])
      rows.push(run(strategy,angle,gap));
  console.log('PHASE5C_ESCAPE_SURVEY '+JSON.stringify(rows));
});
