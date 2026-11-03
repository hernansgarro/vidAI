import {writeFileSync, readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync, brotliCompressSync, constants} from 'node:zlib';
import {Session} from 'node:inspector/promises';
import {PerformanceObserver} from 'node:perf_hooks';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {founderCheckpoint, activityCheckpoint} from './fixtures.ts';
const [scenario, mode, repetition, output] = process.argv.slice(2);
const diagnostic = mode === 'diagnostic', omitted = mode === 'no-observer';
const root = resolve(diagnostic ? '.audit-stage3' : '.');
const load = file => import(pathToFileURL(resolve(root, file)).href);
const {SimulationHost, RenderReplica} = await load('simulationHost.ts');
const {stepSimulation} = await load('simulation.ts');
const {createSnapshot, restoreSnapshot, totalAccountedEnergy} = await load('persistence.ts');
const {collectWorldStats} = await load('world.ts');
const {EnergyActivityPresentation} = await load('energyActivity.ts');
const {probe} = await import('./probe.mjs');
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');
const source = scenario === 'activity15' ? activityCheckpoint() : founderCheckpoint(Number(scenario.match(/\d+/)[0]), scenario === 'tube15');
const host = new SimulationHost(); host.reset(source, 1);
const inventory = state => ({organisms: state.organisms.length, living: state.organisms.filter(o=>!o.dissolving).length,
  parts: state.organisms.reduce((n,o)=>n+o.segments.length,0), eyes: state.organisms.reduce((n,o)=>n+o.genome.eyes.length,0),
  mouths: state.organisms.reduce((n,o)=>n+o.genome.mouths.length,0), food: state.nutrients.length, eggs: state.eggs.length});
const receipt = {gain: 0, loss: 0, gainJ: 0, lossJ: 0};
const originalRecord = host.energyActivity.record;
host.energyActivity.record = (...args) => {receipt[args[5] < 0 ? 'gain' : 'loss']++; receipt[args[5] < 0 ? 'gainJ' : 'lossJ'] += args[2]; originalRecord(...args);};
const tick = () => {if (omitted) stepSimulation(host.state, host.settings, 1/60); else host.tick();};
const initial = inventory(host.state), checkpointHash = hash(source);
const outputSource = resolve(output, `${scenario}-checkpoint.json.br`);
try {writeFileSync(outputSource, brotliCompressSync(JSON.stringify(source), {params: {[constants.BROTLI_PARAM_QUALITY]: 6}}), {flag: 'wx'});} catch(e) {if (e.code !== 'EEXIST') throw e;}
const gc = []; const gcObserver = new PerformanceObserver(list => {for(const e of list.getEntries()) gc.push({ms:e.duration,kind:e.detail.kind});});
gcObserver.observe({entryTypes:['gc']});
for (let t = 0; t < 120; t++) tick();
const warmHash = hash(createSnapshot(host.state, host.settings));
probe.reset(); for (const key of Object.keys(receipt)) receipt[key] = 0;
const session = new Session();
if (diagnostic) {session.connect(); await session.post('Profiler.enable'); await session.post('Profiler.setSamplingInterval',{interval:500}); await session.post('Profiler.start');}
const samples = [], collector = [], snapshots = [], countHistory = [];
const startHeap = process.memoryUsage(), cpu = process.cpuUsage(), start = performance.now();
for (let t = 0; t < 600; t++) {
  const before = performance.now(); tick(); samples.push(performance.now() - before);
  if (t % 60 === 59) {
    snapshots.push(hash(createSnapshot(host.state, host.settings)));
    countHistory.push(inventory(host.state));
  }
  if (performance.now() - start > 40000 || process.memoryUsage().heapUsed > 1.5e9) throw new Error('Registered time/memory stop');
}
const wallMs = performance.now()-start, used = process.cpuUsage(cpu), endHeap = process.memoryUsage();
let profile;
if (diagnostic) {({profile}=await session.post('Profiler.stop')); session.disconnect();}
const final = createSnapshot(host.state, host.settings);
// Component measurements are separate from the timed kernel loop and include
// real structuredClone, but neither a browser message queue nor IPC latency.
const componentHost = new SimulationHost(); componentHost.reset(final, 1);
const replica = new RenderReplica(), presentation = new EnergyActivityPresentation(); presentation.setPaused(false,0);
let previous = restoreSnapshot(final).state;
const components = {frame:[], clone:[], apply:[], stats:[], collectorAdvance:[], collectorFrame:[], presentation:[], bytes:0};
const measure = (key, call) => {const start = performance.now(); const value=call(); components[key].push(performance.now()-start); return value;};
for(let n=0;n<200;n++) {
  // Collector component uses the trial's actual activity. After the first frame,
  // seen flags clear exactly as in production; retained active slots stay real.
  measure('collectorAdvance',()=>host.energyActivity.advance(host.state));
  const signal=measure('collectorFrame',()=>host.energyActivity.frame());
  const frame=measure('frame',()=>componentHost.frame());
  const copied=measure('clone',()=>structuredClone(frame));
  previous=measure('apply',()=>replica.apply(copied,previous));
  measure('stats',()=>collectWorldStats(previous,host.settings.targetNutrients));
  measure('presentation',()=>{presentation.accept(signal);presentation.advance(n*1000/60,false,previous.organisms);});
  if(n===1) components.bytes=JSON.stringify(frame).length;
}
await new Promise(resolve=>setImmediate(resolve)); gcObserver.disconnect();
const result = {scenario,mode,repetition:Number(repetition),runtime:'isolated Node process, production kernel/host; not browser Worker CPU',
  sourceHash:checkpointHash,warmHash,finalHash:hash(final),periodicHashes:snapshots,
  initial,final:inventory(host.state),countHistory,wallMs,kernelMs:samples.reduce((a,b)=>a+b,0),
  ticks:600,warmupTicks:120,cpuMicroseconds:used,heap:{start:startHeap,end:endHeap},gc,
  receipts:omitted?null:receipt,energyErrorJ:totalAccountedEnergy(host.state)-host.state.energyPool.budget,
  tickMs:samples,probe:diagnostic?{phases:probe.phases,counters:probe.counters,sampledTicks:75}:null,components,
  sourceDigests:diagnostic?JSON.parse(readFileSync('.audit-stage3/sources.json','utf8')):null};
if(profile) writeFileSync(resolve(output,`${scenario}-${mode}-${repetition}.cpuprofile.json.gz`),gzipSync(JSON.stringify(profile)),{flag:'wx'});
writeFileSync(resolve(output,`${scenario}-${mode}-${repetition}.json.gz`),gzipSync(JSON.stringify(result)),{flag:'wx'});
console.log(JSON.stringify({scenario,mode,repetition,kernelMs:result.kernelMs,wallMs,finalHash:result.finalHash,receipts:result.receipts}));
