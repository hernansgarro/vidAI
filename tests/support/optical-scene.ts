import {createInitialWorld, addExternalOrganism} from '../../world';
import {DEFAULT_SETTINGS} from '../../persistence';
import {enableClosedEconomy} from '../../energyEconomy';
import {createReferenceNematodeGenome, XoshiroPRNG, remapBrain, calculateBodyCost,
  calculateMaxEnergyCapacity, spawnOrganism, type Genome, type Egg, type SimulationSettings} from '../../simulation';

export function opticalGenome(eyes = true): Genome {
  const g = createReferenceNematodeGenome(new XoshiroPRNG(817));
  g.parts = [g.parts[0]]; g.mouths = []; g.motorForce = 0; g.maturityAge = 1000;
  g.eyes = eyes ? [{id:'optical-eye',partIndex:0,direction:'EAST',fov:.0001,range:500}] : [];
  g.bodyCost = calculateBodyCost(g.parts,g.eyes,g.mouths);
  g.maxEnergyCapacity = calculateMaxEnergyCapacity(g.parts,g.storageTraitMultiplier);
  remapBrain(g); return g;
}
export function opticalScene(name: string) {
  const settings: SimulationSettings = {...DEFAULT_SETTINGS,targetNutrients:0,inflowRate:0,
    waterViscosity:0,gravity:0,mutationSeverity:0,physicsRegime:'passive-work-v3'};
  const state = createInitialWorld(settings,818,'unbiased','standard',0);
  const observer = addExternalOrganism(state,opticalGenome(),settings,100,126,0)!;
  const food = (id:string,x=260,y=126,radius=16,carrion=false) => ({id,x,y,vx:0,vy:0,
    radius,energyValue:3000,bottomTimer:0,pulseTimer:0,
    kind:carrion?'carrion' as const:'nutrient' as const,...(carrion?{decayTimeRemaining:60}:{})});
  const target = () => addExternalOrganism(state,opticalGenome(false),settings,260,126,0)!;
  const egg = (): Egg => ({id:'optical-egg',clutchId:'foreign',parentOrgId:'absent',
    genome:opticalGenome(false),x:260,y:126,vx:0,vy:0,fundedStructural:100,fundedReserve:100,
    incubationProgress:0,totalIncubationTime:100,pulseTimer:0,colorHue:45,readyToHatch:false});
  if (name==='food-egg-body-tie' || name==='reverse-food-tie') {
    state.nutrients=[food('first'),food('second',260,126,16,true)];
    state.eggs=[egg()];
    const body=target(); body.segments[0].x=244+body.genome.parts[0].width/2;
    if (name==='reverse-food-tie') state.nutrients.reverse();
  } else if (name==='egg-body-tie') {
    state.eggs=[egg()]; const body=target();body.segments[0].x=244+body.genome.parts[0].width/2;
  } else if (name==='body-order-tie' || name==='reverse-body-tie' || name==='dynamic-pigment') {
    const a=target(),b=target();
    a.genome.hue=0;a.genome.saturation=100;a.genome.lightness=50;
    b.genome.hue=240;b.genome.saturation=100;b.genome.lightness=50;
    if(name==='reverse-body-tie') state.organisms=[observer,b,a];
    if(name==='dynamic-pigment') {
      // This target senses/learns before the lower-rank observer sees its pigment.
      b.genome.eyes=structuredClone(observer.genome.eyes);
      b.genome.sensoryPlasticityRate=.8;
      b.genome.bodyCost=calculateBodyCost(b.genome.parts,b.genome.eyes,[]);remapBrain(b.genome);
      Object.assign(b,spawnOrganism(b.genome,260,126,0,undefined,1000,new XoshiroPRNG(820)),{id:b.id});
      b.energy=b.genome.maxEnergyCapacity*.2+1e-8;
      state.organisms=[observer,b];
    }
  } else if (name==='part-order-tie') {
    const g=createReferenceNematodeGenome(new XoshiroPRNG(819));g.eyes=[];g.mouths=[];g.motorForce=0;
    g.bodyCost=calculateBodyCost(g.parts,[],[]);
    g.maxEnergyCapacity=calculateMaxEnergyCapacity(g.parts,g.storageTraitMultiplier);remapBrain(g);
    const body=addExternalOrganism(state,g,settings,260,126,.7)!;
    body.segments.forEach(p=>Object.assign(p,{x:260,y:126,angle:.7}));
  } else if (name==='dark-occlusion' || name==='spectral-occlusion' || name==='nearest-body') {
    observer.genome.eyes[0].spectralSensitivity=name==='dark-occlusion'?[0,0,0]:[1,0,1];
    const body=target();body.genome.hue=120;body.genome.saturation=100;body.genome.lightness=50;
    state.nutrients=[food('behind',350)];
  } else if (name==='same-tick-carrion' || name.startsWith('cap-merge-')) {
    const dead=target();dead.dissolving=true;dead.dissolveAlpha=.001;
    if(name.startsWith('cap-merge-')) {
      dead.energy=30000;
      state.nutrients=[food('growing-carrion',260,name==='cap-merge-cross-cell'?150:126,8,true),
        ...Array.from({length:2199},(_,i)=>food(`far-${i}`,1500+i%10,1000))];
      state.nutrients[0].energyValue=10;
      // This high-rank animal triggers P7's initial optical build before the
      // corpse merges into existing carrion without changing collection length.
      addExternalOrganism(state,opticalGenome(),settings,700,700,Math.PI);
      settings.ecologyRegime='closed-v1';enableClosedEconomy(state);
    }
  } else if(name==='boundary-tangent') state.nutrients=[food('tangent',256,142,16)];
  else throw new Error(`Unknown optical scene: ${name}`);
  return {name,state,settings,ticks:name.startsWith('cap-merge-')?1:4};
}
export const opticalNames=['food-egg-body-tie','reverse-food-tie','egg-body-tie','body-order-tie',
  'reverse-body-tie','part-order-tie','dynamic-pigment','dark-occlusion','spectral-occlusion',
  'nearest-body','same-tick-carrion','cap-merge-same-cell','cap-merge-cross-cell','boundary-tangent'];
