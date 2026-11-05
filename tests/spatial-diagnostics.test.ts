import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {collectSpatialOverlay, drawSpatialOverlay, gridKindRGB, saturatedRGB, rgbHex, SPATIAL_OVERLAYS_OFF} from '../spatialDiagnostics';
import {ensureMaintainedGrid, getMaintainedGrid} from '../maintainedGrid';
import {createInitialWorld, addExternalOrganism} from '../world';
import {createFounderGenome} from '../founders';
import {DEFAULT_SETTINGS, createSnapshot} from '../persistence';
import {SimulationHost} from '../simulationHost';
import {food} from './support/nutrient-cycle';
import {gridCompatibilityCases, snapshotDigest} from './support/maintained-grid-compatibility';

const options = {cells: true, envelopes: true};
const cfg = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0};
const fixture = () => {
  const state = createInitialWorld(cfg, 712, 'balanced', 'standard', 0);
  const grid = ensureMaintainedGrid(state);
  return {state, grid};
};
test('all RGB category combinations saturate independently, including repeated red/blue views', () => {
  const colors = ['#000000','#00FF00','#FF0000','#FFFF00','#0000FF','#00FFFF','#FF00FF','#FFFFFF'];
  for (let mask = 0; mask < 8; mask++) {
    let rgb = 0;
    for (let i = 0; i < 3; i++) if (mask & (1 << i)) {
      const channel = gridKindRGB(['nutrient', 'egg', 'organism'][i]);
      rgb = saturatedRGB(saturatedRGB(rgb, channel), channel);
    }
    assert.equal(rgbHex(rgb), colors[mask]);
  }
  assert.equal(gridKindRGB('egg'), gridKindRGB('carrion'));
  assert.equal(gridKindRGB('organism'), gridKindRGB('body-part'));
  assert.equal(saturatedRGB(0x102030, 0xffef01), 0xffff31);
});
test('cells read actual raw assignments, empty/removal and category multiplicity, never reconstructed geometry', () => {
  const {state, grid} = fixture();
  assert.deepEqual(collectSpatialOverlay(state, options)!.cells, []);
  const a = food(3000, false, 80, 80), b = food(3000, false, 80, 80);
  state.nutrients.push(a,b); grid.synchronize();
  let entry: any; grid.inspectRecords(e => {if (e.value.entity === a) entry = e;});
  // Deliberate stale assignment: readback must show P4's actual buckets, unlike P5.
  grid.matrix.relocate(entry, {left: 300, right: 301, top: 300, bottom: 301}, 'egg');
  const stamp = (grid.matrix as any).stamp;
  const before = createSnapshot(state, cfg);
  assert.deepEqual(collectSpatialOverlay(state, options)!.cells, [
    {x:0, y:0, rgb:0x00ff00}, {x:2, y:2, rgb:0xff0000}]);
  assert.equal((grid.matrix as any).stamp, stamp);
  assert.deepEqual(createSnapshot(state,cfg), before);
  grid.remove(a);
  assert.equal(collectSpatialOverlay(state, options)!.cells![0].rgb, 0x00ff00);
  grid.remove(b); assert.deepEqual(collectSpatialOverlay(state,options)!.cells, []);
  for (const kind of ['nutrient','carrion','egg','organism','body-part'] as const) {
    const e = grid.matrix.createEntry({} as any,kind);
    grid.matrix.register(e,{left:80,right:81,top:80,bottom:81});
  }
  assert.deepEqual(collectSpatialOverlay(state,options)!.cells,[{x:0,y:0,rgb:0xffffff}]);
});
test('independent OFF options do no inspection/initialization; per-option payloads omit unused arrays', () => {
  const {state, grid} = fixture();
  assert.deepEqual(SPATIAL_OVERLAYS_OFF,{cells:false,envelopes:false});
  const inspectCells = grid.matrix.inspectCells, inspectEnvelopes = grid.inspectCreatureEnvelopes;
  grid.matrix.inspectCells = () => {throw new Error('cell scan');};
  grid.inspectCreatureEnvelopes = () => {throw new Error('envelope scan');};
  assert.equal(collectSpatialOverlay(state, SPATIAL_OVERLAYS_OFF),undefined);
  const host = new SimulationHost(); host.reset(createSnapshot(state,cfg),1);
  assert.equal(Object.hasOwn(host.frame(),'spatialOverlay'),false);
  grid.inspectCreatureEnvelopes = inspectEnvelopes;
  assert.equal(Object.hasOwn(collectSpatialOverlay(state,{cells:false,envelopes:true})!,'cells'),false);
  grid.matrix.inspectCells = inspectCells; grid.inspectCreatureEnvelopes = () => {throw new Error('envelope scan');};
  assert.equal(Object.hasOwn(collectSpatialOverlay(state,{cells:true,envelopes:false})!,'envelopes'),false);
  const detached = {...state}; assert.equal(getMaintainedGrid(detached),undefined);
  assert.equal(collectSpatialOverlay(detached,options)!.available,false);
  assert.equal(getMaintainedGrid(detached),undefined);
});
test('P4 bounds/certificates, cell edges, both tube sides and overflow are copied without clipping or invented cells', () => {
  const {state,grid} = fixture();
  const org = addExternalOrganism(state,createFounderGenome('CUR-009'),cfg,1200,750,0)!;
  org.segments[1].x += 10000;
  state.nutrients.push(food(3000,false,-200,200),food(3000,false,2600,200),food(3000,false,128,128));
  grid.synchronize();
  const frame = collectSpatialOverlay(state,options)!;
  assert.ok(frame.overflow>0);
  assert.ok(frame.cells!.some(c=>c.x<0));
  assert.ok(frame.cells!.some(c=>c.x===20));
  for (const [x,y] of [[0,0],[0,1],[1,0],[1,1]]) assert.ok(frame.cells!.some(c=>c.x===x&&c.y===y));
  const bounds: any[]=[]; grid.inspectCreatureEnvelopes((b,certified,overflow)=>bounds.push({bounds:b,certified,overflow}));
  assert.deepEqual(frame.envelopes,bounds);
  assert.equal(frame.envelopes![0].certified,false);
  assert.equal(frame.envelopes![0].overflow,true);
  assert.ok(frame.envelopes![0].bounds.right > 5100);
  frame.envelopes![0].bounds.left = -999999;
  assert.notEqual(bounds[0].bounds.left,-999999);
  org.genome.parts = [org.genome.parts[0]]; org.segments = [org.segments[0]];
  grid.synchronize();
  assert.equal(collectSpatialOverlay(state,options)!.envelopes![0].certified,true);
  org.segments[0].x = Infinity; grid.syncOrganism(org,0);
  const unbounded = collectSpatialOverlay(state,options)!;
  assert.equal(unbounded.unboundedCreatures,1); assert.equal(unbounded.envelopes!.length,0);
});
test('paint inset and line/dash widths stay one CSS pixel at every zoom/DPR, cull viewport and preserve context', () => {
  const view={left:-500,right:600,top:-500,bottom:600};
  for (const dpr of [1,2,3]) for (const zoom of [.1,.5,1,3]) {
    const calls:any[]=[]; const ctx:any={save:()=>calls.push(['save']),restore:()=>calls.push(['restore']),
      setLineDash:(a:number[])=>calls.push(['dash',a]), strokeRect(...a:number[]){calls.push(['rect',this.strokeStyle,this.lineWidth*dpr*zoom,...a.map(v=>v*zoom)]);},
      beginPath(){},moveTo(){},lineTo(){},stroke(){calls.push(['stroke',this.strokeStyle]);}};
    const frame:any={cells:[{x:0,y:0,rgb:0xffffff},{x:999,y:999,rgb:0xff0000}],envelopes:[
      {bounds:{left:50,right:100,top:50,bottom:100},certified:false},
      {bounds:{left:150,right:200,top:50,bottom:100},certified:true}]};
    drawSpatialOverlay(ctx,frame,SPATIAL_OVERLAYS_OFF,zoom,view); assert.equal(calls.length,0);
    drawSpatialOverlay(ctx,frame,options,zoom,view);
    const rect=calls.find(c=>c[0]==='rect')!;
    assert.equal(rect[1],'#FFFFFF'); assert.equal(rect[2]/dpr,1);
    assert.equal(rect[3],1); assert.equal(rect[4],1);
    assert.equal(rect[5],128*zoom-2); assert.equal(calls.filter(c=>c[0]==='rect').length,1);
    assert.deepEqual(calls.find(c=>c[0]==='dash'&&c[1].length),['dash',[4/zoom,3/zoom]]);
    assert.equal(calls.at(-1)![0],'restore');
  }
});
test('render order is after caustics and before all physical entities, inside existing tube mask', () => {
  const source=readFileSync(new URL('../App.tsx',import.meta.url),'utf8');
  const draw=source.slice(source.indexOf('const draw ='));
  assert.ok(draw.indexOf('if (observerPreferences.showCaustics)') < draw.indexOf('drawSpatialOverlay('));
  assert.ok(draw.indexOf('drawSpatialOverlay(') < draw.indexOf('// Glow pass:'));
  assert.ok(draw.indexOf('drawSpatialOverlay(') < draw.indexOf('// Entities: nutrients'));
  assert.ok(draw.indexOf('drawSpatialOverlay(') < draw.indexOf('worldSceneRef.current.finish('));
});
test('enabled overlays preserve all 144 inherited full-state hashes and split historical continuations', () => {
  const references=JSON.parse(readFileSync(new URL('./fixtures/maintained-grid-p3.json',import.meta.url),'utf8'));
  // Use the same immutable fixtures as P4/P5; collection cannot alter any tick.
  for (const item of gridCompatibilityCases()) {
    const host=new SimulationHost(); host.reset(createSnapshot(item.state,item.settings),1); host.spatialOverlays={...options};
    const expected=references.cases.find((r:any)=>r.name===item.name);
    assert.ok(expected,item.name);
    for (let tick=0;tick<=item.ticks;tick++) {
      host.frame();
      assert.equal(snapshotDigest(host.state,host.settings),expected.hashes[tick],`${item.name} tick ${tick}`);
      if(tick<item.ticks) host.tick();
    }
    const restored=new SimulationHost(); restored.reset(host.snapshot(),2); restored.spatialOverlays={...options};
    for(let i=0;i<3;i++){host.tick(); restored.tick(); restored.frame();}
    assert.deepEqual(host.snapshot(),restored.snapshot());
  }
});
