import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, createSnapshot, restoreSnapshot} from '../persistence';
import {enableClosedEconomy, embodiedEnergy} from '../energyEconomy';
import {createFounderGenome} from '../founders';
import {editSpatialState} from '../maintainedGrid';
import {writeFileSync, mkdirSync} from 'node:fs';

const out=process.argv[2];
mkdirSync(out,{recursive:true});
for(const [name,count] of [['empty',0],['moderate',18],['dense',100],['adversarial',24]] as const) {
  const settings={...DEFAULT_SETTINGS,worldWidth:2400,worldHeight:1500,maxOrganisms:150,targetNutrients:275,
    inflowRate:0,ecologyRegime:'closed-v1' as const,nutrientCycle:'decay-v2' as const,physicsRegime:'passive-work-v3' as const};
  const s=createInitialWorld({...settings,ecologyRegime:undefined},917,'balanced','standard',name==='adversarial'?0:count);
  editSpatialState(s,()=>{
    if(name==='dense') s.organisms.forEach((o,i)=>{
      const x=700+i%10*90,y=450+Math.floor(i/10)*60,dx=x-o.segments[0].x,dy=y-o.segments[0].y;
      o.segments.forEach(p=>{p.x+=dx;p.y+=dy;});
    });
    if(name==='adversarial') for(let i=0;i<count;i++) {
      const g=createFounderGenome(['CUR-006','CUR-007','CUR-009','CUR-001'][i%4]);
      addExternalOrganism(s,g,settings,768+i%6*24,512+Math.floor(i/6)*22,i*.63);
    }
    if(count) for(let i=0;i<180;i++) {
      s.nutrients.push({id:`P11-carrion-${i}`,kind:'carrion',x:s.prng.range(40,2360),y:s.prng.range(40,1460),
        vx:0,vy:0,energyValue:3000,radius:18,decayTimeRemaining:60,bottomTimer:0,pulseTimer:0});
      s.ledger.externalInflow+=3000;
    }
  });
  enableClosedEconomy(s);
  const snapshot=createSnapshot(s,settings);restoreSnapshot(snapshot);
  writeFileSync(`${out}/${name}.json`,JSON.stringify(snapshot));
  console.log(JSON.stringify({name,organisms:s.organisms.length,parts:s.organisms.reduce((n,o)=>n+o.segments.length,0),
    eyes:s.organisms.reduce((n,o)=>n+o.genome.eyes.length,0),food:s.nutrients.length,energy:embodiedEnergy(s)}));
}
