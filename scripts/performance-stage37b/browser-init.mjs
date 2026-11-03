// Matched browser observation wrappers used in control and diagnostic builds.
export function install(){
 const w=window;
 const b={active:false,frames:0,rows:[],transports:[],longTasks:[],workers:[],pending:new Map(),next:1000000000,latest:null,previous:0,control:null};
 w.__s37bBrowser=b;
 const Base=w.Worker;
 w.Worker=class extends Base{
  constructor(url,opts){super(url,opts);b.workers.push(this);this.addEventListener('message',e=>{
   const d=e.data;
   if(d?.type==='result'||d?.type==='s37b-result'){const p=b.pending.get(d.id);if(p){b.pending.delete(d.id);p(d.value);}}
   if(d?.type==='error')b.error=d.message;
   if(d?.type==='frame'){b.latest=d.frame;if(b.active)b.transports.push({main:performance.now(),sent:d.__s37bSent??null,sentOrigin:d.__s37bOrigin??null,steps:d.frame.steps,epoch:d.frame.epoch});}
  });}
  postMessage(d,...rest){if(d?.type==='control')b.control=d;return Base.prototype.postMessage.call(this,d,...rest);}
 };
 b.ask=(op,extra={})=>new Promise((resolve,reject)=>{
  const id=b.next++;b.pending.set(id,resolve);
  b.workers.at(-1).postMessage({type:'s37b',op,id,epoch:b.control?.epoch,...extra});
  setTimeout(()=>{if(b.pending.has(id)){b.pending.delete(id);reject(Error('Research reply timeout '+op));}},15000);
 });
 const proto=CanvasRenderingContext2D.prototype,fill=proto.fillRect;
 proto.fillRect=function(...args){if(this.canvas.getAttribute('aria-label')==='Aquatic simulation'&&args[0]===0&&args[1]===0)b.frames++;return fill.apply(this,args);};
 const raf=w.requestAnimationFrame;
 w.requestAnimationFrame=fn=>raf.call(w,t=>{const n=b.frames,start=performance.now();fn(t);if(b.active&&b.frames!==n){b.rows.push({timestamp:t,callbackMs:performance.now()-start,intervalMs:b.previous?t-b.previous:null});b.previous=t;}});
 try{new PerformanceObserver(list=>{if(b.active)b.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})));}).observe({type:'longtask',buffered:false});}catch(e){b.longTaskUnavailable=String(e);}
 b.begin=()=>{b.rows=[];b.transports=[];b.longTasks=[];b.previous=0;b.active=true;const a=w.__s37bRuntime;if(a){a.reset();a.active=true;}return performance.now();};
 b.end=()=>{const end=performance.now();b.active=false;const a=w.__s37bRuntime;if(a)a.active=false;
 const c=document.querySelector('canvas[aria-label="Aquatic simulation"]');
 return {end,origin:performance.timeOrigin,rows:b.rows,transports:b.transports,longTasks:b.longTasks,error:b.error??null,main:a?.dump(),canvas:[c.width,c.height],css:[c.clientWidth,c.clientHeight],dpr:devicePixelRatio,viewport:[innerWidth,innerHeight],visible:document.visibilityState,hardwareConcurrency:navigator.hardwareConcurrency,heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null,
 payload:b.latest?{jsonUtf8Bytes:new TextEncoder().encode(JSON.stringify(b.latest)).length,topKeys:Object.keys(b.latest),stateKeys:Object.keys(b.latest.state),genomes:b.latest.genomes.length,lineage:b.latest.lineage.length,selectedNeural:b.latest.state.organisms.reduce((n,o)=>n+o.neuralHidden.length,0)}:null};
 };
}
