// Infrastructure correction1: no scientific window ran in workflow42116356309.
import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {resolve,join} from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import os from 'node:os';
const [base,outArg]=process.argv.slice(2),out=resolve(outArg),root=process.cwd();
await mkdir(out,{recursive:true});
const servers=[spawn('npm',['run','preview','--','--port','4174','--strictPort'],{cwd:resolve(base)}),spawn('npm',['run','preview','--','--port','4175','--strictPort'],{cwd:root})];
for(const s of servers){s.stdout.pipe(process.stdout);s.stderr.pipe(process.stderr);}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[],started=performance.now();
const save=()=>writeFile(join(out,'browser.json'),JSON.stringify({browser:browser.version(),cpu:os.cpus()[0].model,platform:os.platform(),results},null,2));
async function run(label,scene,round,pilot) {
  const slot={label,scene,round,pilot};results.push(slot);await save();
  const context=await browser.newContext({viewport:{width:1280,height:850},deviceScaleFactor:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try {
    if(performance.now()-started>700000)throw Error('browser budget');
    await page.addInitScript(()=>{
      const w=window;w.p11={frames:[],raf:[],messages:[],active:false};
      const W=w.Worker;
      w.Worker=class extends W {
        set onmessage(fn){super.onmessage=e=>{
          const t=performance.now();if(w.p11.active&&e.data.type==='frame') {
            const s=e.data.frame.state;w.p11.frames.push({t,sim:s.simTime,steps:e.data.frame.steps,population:s.organisms.length,food:s.nutrients.length});
          }
          fn(e);if(w.p11.active)w.p11.messages.push(performance.now()-t);
        };}
      };
      const raf=w.requestAnimationFrame.bind(w);w.requestAnimationFrame=fn=>raf(t=>{
        const start=performance.now();fn(t);if(w.p11.active)w.p11.raf.push({t,ms:performance.now()-start});
      });
    });
    await page.goto(`http://127.0.0.1:${label==='main'?4174:4175}/vidAI/?autoplay`,{timeout:30000});
    const source=await readFile(join(out,'scenes',scene+'.json'));
    await page.locator('input[type=file]').setInputFiles({name:'p11.json',mimeType:'application/json',buffer:source});
    await page.getByRole('button',{name:'Resume',exact:true}).waitFor();
    await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
    await page.getByRole('button',{name:'Advanced Settings',exact:true}).dispatchEvent('click');
    const caustics=page.getByLabel('Show water caustics',{exact:true});if(await caustics.isChecked())await caustics.dispatchEvent('click');
    await page.getByTitle('Close advanced settings',{exact:true}).dispatchEvent('click');
    await page.getByTitle('Ecology & Physical Settings').dispatchEvent('click');
    await page.getByRole('group',{name:'Simulation speed'}).getByRole('button',{name:'MAX',exact:true}).dispatchEvent('click');
    await page.waitForTimeout(pilot?1000:3000);
    await page.evaluate(()=>{window.p11.frames=[];window.p11.raf=[];window.p11.messages=[];window.p11.active=true;});
    await page.waitForTimeout(pilot?2000:6000);
    const data=await page.evaluate(()=>{window.p11.active=false;return window.p11;});
    slot.toolbar=await page.locator('.toolbar-performance-text').getAttribute('title');
    slot.errors=errors;Object.assign(slot,data);
    const a=data.frames[0],b=data.frames.at(-1);if(!a||!b||b.t<=a.t||b.sim<=a.sim)throw Error('no authoritative progress');
    slot.elapsedMs=b.t-a.t;slot.ticks=(b.sim-a.sim)*60;slot.tps=slot.ticks*1000/slot.elapsedMs;slot.effectiveX=slot.tps/60;
    const r=data.raf;slot.rafFps=r.length>1?(r.length-1)*1000/(r.at(-1).t-r[0].t):0;
    slot.rafCallbackMs=r.reduce((n,x)=>n+x.ms,0);slot.messageCallbackMs=data.messages.reduce((n,x)=>n+x,0);
    if(errors.length)throw Error('page errors');
    await page.screenshot({path:join(out,`${pilot?'pilot':'primary'}-${label}-${scene}-${round}.png`)});
    await save();console.log(JSON.stringify({...slot,frames:undefined,raf:undefined,messages:undefined}));
  }catch(e){slot.error=String(e);await save();throw e;}finally{await context.close();}
}
try {
  // Server readiness is setup, not a scientific slot.
  for(const port of [4174,4175]){let ready=false;for(let i=0;i<30;i++){try{if((await fetch(`http://127.0.0.1:${port}/vidAI/`)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('server unavailable');}
  for(const label of ['main','testing'])await run(label,'dense',-1,true);
  for(let round=0;round<2;round++)for(const scene of round?['adversarial','dense','moderate','empty']:['empty','moderate','dense','adversarial'])for(const label of round?['testing','main']:['main','testing'])await run(label,scene,round,false);
}finally{await save();await browser.close();for(const s of servers)s.kill();}
