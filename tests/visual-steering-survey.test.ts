import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {createFounderGenome} from '../founders';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, totalAccountedEnergy} from '../persistence';

const settings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, mutationSeverity: 0};
function cueWeights(g: sim.Genome, retinalGain: number, outputGain: number) {
  const spectral: [number, number, number] = [-.5, 1, -.25];
  for (const [e, eye] of g.eyes.entries()) for (let r = 0; r < sim.RAYS_PER_EYE; r++) {
    const bearing = sim.getCardinalBaseAngle(eye.direction) + (r / (sim.RAYS_PER_EYE - 1) - .5) * eye.fov;
    for(let c=0;c<3;c++){
      const delta = (retinalGain - .2) * Math.sin(bearing) * spectral[c] / Math.sqrt(g.eyes.length);
      const key = `eye:${eye.id}:ray:${r}:${['red','green','blue'][c]}`;
      const i = g.inputKeys!.indexOf(key);
      assert.ok(i>=0);
      g.weightsIH[0][i]+=delta;
      g.weightsIH[1][i]-=delta;
    }
  }
  for (let j = 0; j < g.parts.length - 1; j++) {
    const o=g.outputKeys!.indexOf(`joint:${g.parts[j+1].id}:Angle`);
    g.weightsHO[o][0] += -outputGain - .04;
    g.weightsHO[o][1] += outputGain + .04;
  }
}
function blind(g:sim.Genome) {
  g.inputKeys!.forEach((key,i)=>{
    if(!key.startsWith('eye:')) return;
    const baseline=key.endsWith(':distance')?1:0;
    g.weightsIH.forEach((row,h)=>{g.biasesH[h]+=row[i]*baseline;row[i]=0});
  });
}
function run(side: -1|1, gain:number, output:number, sight:boolean, type:'food'|'body', distance:number, duration=6){
 const s=createInitialWorld(settings,510,'balanced','standard',0);
 const g=createFounderGenome('FND-001');
 if(gain>=0)cueWeights(g,gain,output);
 if(!sight)blind(g);
 const o=addExternalOrganism(s,g,settings,1200,750,0)!;
 o.genome.maturityAge=1000;
 const angle=side*.5,x=1200+Math.cos(angle)*distance,y=750+Math.sin(angle)*distance;
 if(type==='food'){
  s.nutrients.push({id:'target',x,y,vx:0,vy:0,energyValue:3000,radius:sim.getNutrientRadius(3000),bottomTimer:0,pulseTimer:0});
  s.ledger.externalInflow+=3000;
 }else{
  const danger=createFounderGenome('FND-031');danger.motorForce=0;danger.maturityAge=1000;
  const other=addExternalOrganism(s,danger,settings,x,y,Math.PI)!;
  other.genome.motorForce=0;
 }
 const energy=totalAccountedEnergy(s), start=sim.calculateOrganismCOM(o);
 let startMotor=0,hit=0,minDistance=Infinity,firstHeading=0;
 for(let i=0;i<duration*60;i++){
  sim.stepSimulation(s,settings,1/60);
  if(i===0){
    hit=o.rayHits.filter(r=>r.hit&&r.objectType===(type==='food'?'nutrient':'creature')).length;
    startMotor=o.neuralOutputs.find((_,ix)=>o.genome.outputKeys![ix].endsWith(':Angle'))??0;
  }
  if(i===120)firstHeading=o.segments[0].angle;
  const p=sim.calculateOrganismCOM(o);
  minDistance=Math.min(minDistance,Math.hypot(p.x-x,p.y-y));
 }
 const end=sim.calculateOrganismCOM(o);
 assert.ok(Math.abs(totalAccountedEnergy(s)-energy)<1e-4);
 return {side,gain,output,sight,type,distance,hit,startMotor,
  dx:+(end.x-start.x).toFixed(1),dy:+(end.y-start.y).toFixed(1),
  finalHead:+o.segments[0].angle.toFixed(2),firstHead:+firstHeading.toFixed(2),
  minDistance:+minDistance.toFixed(1),eaten: type==='food'?3000-s.nutrients.reduce((a,n)=>a+n.energyValue,0):0};
}
test('measure targeted retinal neural priors through real physics before deploying',()=>{
 const rows=[];
 for(const [gain,output] of [[-1,0],[.2,.04],[.2,.8],[1.5,.5],[3,1.2],[5,1.5]]){
  for(const type of ['food','body'] as const) for(const side of [-1,1] as const){
   for(const sight of [true,false]){
    rows.push(run(side,gain,output,sight,type,150,5));
   }
  }
 }
 console.log('PHASE5C_RETINAL_SURVEY '+JSON.stringify(rows));
});
