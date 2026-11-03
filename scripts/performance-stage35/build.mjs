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
 return {name:'explicit-stage35-only',enforce:'pre',
 transformIndexHtml:{order:'pre',handler(){return [{tag:'script',attrs:{type:'module',src:'/scripts/performance-stage35/fixture.ts'},injectTo:'head'}];}},
 transform(code,id){

  const path=id.split('?')[0];let c=code;
  if(enabled&&['simulationHost.ts','simulationClient.ts','simulation.worker.ts'].some(p=>path===resolve(root,p)))c="import {a as __a} from './scripts/performance-stage35/runtime.mjs';\n"+c;
  if(enabled&&path===resolve(root,'simulationHost.ts')){
   c=once(c,'  tick(): void {','  tick(): void {\n    const __t=__a.active?performance.now():0;');
   c=once(c,'    this.steps++;','    this.steps++; if(__a.active){__a.ticks++;__a.add("tickMs",performance.now()-__t);}');
   c=once(c,'  frame(): RenderFrame {','  frame(): RenderFrame {\n    const __t=__a.active?performance.now():0;__a.inc("constructed");');
   c=once(c,'    return result;','    __a.add("frameBuildMs",performance.now()-__t);return result;');
  }
  if(enabled&&path===resolve(root,'simulationClient.ts')){
   c=once(c,"        try {onFrame(this.replica.apply(data.frame, this.current()), data.frame);}",
    '        const __t=__a.active?performance.now():0;__a.inc("received");\n        try {const __state=this.replica.apply(data.frame,this.current());const __m=__a.active?performance.now():0;__a.inc("applied");onFrame(__state,data.frame);__a.add("replicaMs",__m-__t);__a.add("callbackMs",performance.now()-__m);}');
   c=once(c,"        this.worker.postMessage({type: 'ack', epoch: this.epoch});",
    '        this.worker.postMessage({type: "ack", epoch: this.epoch});__a.inc("ackSent");__a.add("receiveApplyAckMs",performance.now()-__t);');
  }
  if(path===resolve(root,'simulation.worker.ts')){
   c=once(c,'const host = new SimulationHost();',"const host = new SimulationHost();\nlet __cap=30,__armed=false,__begin=0,__initialSim=0;\nself.addEventListener('message',({data})=>{\n if(data.type!=='s35')return;\n try{\n if(data.epoch!==host.epoch)throw Error('Research epoch mismatch');\n let value;\n if(data.op==='config'){\n  if(host.speed!==0||![10,30].includes(data.cap))throw Error('Invalid research configuration');\n  __cap=data.cap;value={cap:__cap,epoch:host.epoch,speed:host.speed,selected:host.selected};\n }else if(data.op==='arm'){if(host.speed!==0)throw Error('Arm must be paused');__armed=true;value={cap:__cap,simTime:host.state.simTime};}\n else if(data.op==='end'){\n  const end=performance.now();host.speed=0;__END__\n  value={begin:__begin,end,origin:performance.timeOrigin,initialSim:__initialSim,cap:__cap,diagnostic:__DUMP__,final:host.snapshot()};\n }else if(data.op==='pilot'){\n  if(host.speed!==0)throw Error('Pilot must be paused');\n  for(let i=0;i<120;i++){host.tick();if(i%(__cap===30?2:6)===0)host.frame();}\n  value=host.snapshot();\n }else if(data.op==='snapshot')value=host.snapshot();\n else throw Error('Unknown research command');\n self.postMessage({type:'s35-result',id:data.id,value});\n }catch(e){self.postMessage({type:'s35-result',id:data.id,value:{researchError:String(e)}});}\n});".replace('__END__',enabled?'__a.end=end;__a.active=false;':'').replace('__DUMP__',enabled?'__a.dump()':'null'));
   c=once(c,'1000 / 30','1000 / __cap');
   c=once(c,'      host.selected = data.selected; return;','      host.selected=data.selected;if(__armed&&data.speed!==0){__armed=false;__begin=performance.now();__initialSim=host.state.simTime;'+(enabled?'__a.reset();__a.active=true;__a.controlStart=__begin;':'')+'}return;');
   if(enabled){
   c=once(c,"  if (!initialized || outstanding) return;","  __a.inc('attempted');if(!initialized||outstanding){__a.inc('outstandingSkipped');return;}");
   c=once(c,"  port.postMessage({type: 'frame', frame: host.frame()});",
    '  const __frame=host.frame(),__t=__a.active?performance.now():0;port.postMessage({type:"frame",frame:__frame,__s35Sent:__t,__s35Origin:performance.timeOrigin});__a.add("postMessageMs",performance.now()-__t);__a.inc("sent");if(__a.active)__a.sentAt=performance.now();');
   c=once(c,"    if (data.type === 'ack') {outstanding = false; return;}",
    '    if(data.type==="ack"){if(__a.sentAt!==null)__a.add("ackRoundTripMs",performance.now()-__a.sentAt);__a.inc("ackReceived");__a.sentAt=null;outstanding=false;return;}');
   c=once(c,"  const now = performance.now();","  const now=performance.now(),__ticks=__a.ticks;if(__a.active&&__a.pumpEnd!==null)__a.add('yieldGapMs',now-__a.pumpEnd);");
   c=once(c,"  if (delay === 0) wake.port2.postMessage(null);",
    '  if(__a.active){__a.add("batchMs",performance.now()-now);__a.add("batchTicks",__a.ticks-__ticks);__a.pumpEnd=performance.now();}\n  if(delay===0)wake.port2.postMessage(null);');
   c=once(c,'  if (initialized && dirty && now - lastFrame >= 1000 / __cap) sendFrame();','  if(initialized&&dirty){if(now-lastFrame>=1000/__cap)sendFrame();else __a.inc("capSkipped");}');
   }
  }
  return c===code?null:{code:c,map:null};
 }
 };
}
export async function prepare(enabled,port){
 const outDir=enabled?'s35-diagnostic-dist':'s35-control-dist';
 await build({logLevel:'warn',plugins:[probe(enabled)],worker:{plugins:()=>[probe(enabled)]},build:{outDir,emptyOutDir:true}});
 if(readFileSync(outDir+'/index.html','utf8').includes('/scripts/performance-stage35/fixture.ts'))throw Error('Unbundled research fixture in output HTML');
 return await preview({logLevel:'warn',build:{outDir},preview:{host:'127.0.0.1',port,strictPort:true}});
}
