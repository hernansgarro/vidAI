// Build-only source transforms; original files and normal build are never edited.
import {build,preview} from 'vite';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=process.cwd();
export const sourcePaths=['simulation.worker.ts','simulationHost.ts','simulationClient.ts','App.tsx','worldScene.ts','observerPreferences.ts','world.ts','persistence.ts'];
export const digests=()=>Object.fromEntries(sourcePaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const once=(c,x,y)=>{if(c.split(x).length!==2)throw Error('Nonunique diagnostic anchor: '+x);return c.replace(x,y);};
function probe(enabled){
 return {name:'explicit-stage34-only',enforce:'pre',
 transformIndexHtml(){return [{tag:'script',attrs:{type:'module',src:'/scripts/performance-stage34/fixture.ts'},injectTo:'head'}];},
 transform(code,id){
  if(!enabled)return null;
  const path=id.split('?')[0];let c=code;
  if(['simulationHost.ts','simulationClient.ts','simulation.worker.ts'].some(p=>path===resolve(root,p)))c="import {a as __a} from './scripts/performance-stage34/runtime.mjs';\n"+c;
  if(path===resolve(root,'simulationHost.ts')){
   c=once(c,'  tick(): void {','  tick(): void {\n    const __t=__a.active?performance.now():0;');
   c=once(c,'    this.steps++;','    this.steps++; if(__a.active){__a.ticks++;__a.add("tickMs",performance.now()-__t);}');
   c=once(c,'  frame(): RenderFrame {','  frame(): RenderFrame {\n    const __t=__a.active?performance.now():0;__a.inc("constructed");');
   c=once(c,'    return result;','    __a.add("frameBuildMs",performance.now()-__t);return result;');
  }
  if(path===resolve(root,'simulationClient.ts')){
   c=once(c,"        try {onFrame(this.replica.apply(data.frame, this.current()), data.frame);}",
    '        const __t=__a.active?performance.now():0;__a.inc("received");\n        try {const __state=this.replica.apply(data.frame,this.current());const __m=__a.active?performance.now():0;__a.inc("applied");onFrame(__state,data.frame);__a.add("replicaMs",__m-__t);__a.add("callbackMs",performance.now()-__m);}');
   c=once(c,"        this.worker.postMessage({type: 'ack', epoch: this.epoch});",
    '        this.worker.postMessage({type: "ack", epoch: this.epoch});__a.inc("ackSent");__a.add("receiveApplyAckMs",performance.now()-__t);');
  }
  if(path===resolve(root,'simulation.worker.ts')){
   c=once(c,'const host = new SimulationHost();',`const host = new SimulationHost();
self.addEventListener('message',({data})=>{
 if(data.type!=='s34')return;
 let value;
 if(data.op==='start'){const initial=host.snapshot();__a.reset();__a.active=true;value={initial,clock:__a.start};}
 else if(data.op==='end'){__a.end=performance.now();__a.active=false;value={diagnostic:__a.dump(),final:host.snapshot()};}
 else if(data.op==='clock')value={now:performance.now(),origin:performance.timeOrigin};
 else if(data.op==='snapshot')value=host.snapshot();
 self.postMessage({type:'s34-result',id:data.id,value});
});`);
   c=once(c,"  if (!initialized || outstanding) return;","  if (!initialized || outstanding) {__a.inc('blockedSend');return;}");
   c=once(c,"  port.postMessage({type: 'frame', frame: host.frame()});",
    '  const __frame=host.frame(),__t=__a.active?performance.now():0;port.postMessage({type:"frame",frame:__frame,__s34Sent:__a.active?performance.now():null});__a.add("postMessageMs",performance.now()-__t);__a.inc("sent");if(__a.active)__a.sentAt=performance.now();');
   c=once(c,"    if (data.type === 'ack') {outstanding = false; return;}",
    '    if(data.type==="ack"){if(__a.sentAt!==null)__a.add("ackRoundTripMs",performance.now()-__a.sentAt);__a.inc("ackReceived");outstanding=false;return;}');
   c=once(c,"      host.selected = data.selected; return;",
    '      host.selected=data.selected;if(__a.active&&data.speed!==0&&__a.controlStart===null)__a.controlStart=performance.now();return;');
   c=once(c,"  const now = performance.now();","  const now=performance.now(),__ticks=__a.ticks;if(__a.active&&__a.pumpEnd!==null)__a.add('yieldGapMs',now-__a.pumpEnd);");
   c=once(c,"  if (delay === 0) wake.port2.postMessage(null);",
    '  if(__a.active){__a.add("batchMs",performance.now()-now);__a.add("batchTicks",__a.ticks-__ticks);__a.pumpEnd=performance.now();}\n  if(delay===0)wake.port2.postMessage(null);');
  }
  return c===code?null:{code:c,map:null};
 }
 };
}
export async function prepare(enabled,port){
 const outDir=enabled?'s34-diagnostic-dist':'s34-control-dist';
 await build({logLevel:'warn',plugins:[probe(enabled)],worker:{plugins:()=>[probe(enabled)]},build:{outDir,emptyOutDir:true}});
 return await preview({logLevel:'warn',build:{outDir},preview:{host:'127.0.0.1',port,strictPort:true}});
}
