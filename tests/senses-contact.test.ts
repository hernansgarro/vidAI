import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as sim from '../simulation';
import {rectangleContact, contactImpulse, resolveBodyContacts} from '../contacts';
import {createInitialWorld, addExternalOrganism} from '../world';
import {DEFAULT_SETTINGS, totalAccountedEnergy, createSnapshot, restoreSnapshot} from '../persistence';

const settings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0, waterViscosity: 0, mutationSeverity: 0};
function body(type?: sim.MouthType, sight = false) {
  const g = sim.createReferenceNematodeGenome(new sim.XoshiroPRNG(21));
  g.parts = [g.parts[0]]; g.motorForce = 0;
  g.mouths = type ? [{id: 'mouth', partIndex: 0, direction: 'EAST', intakeWidth: 12, mouthType: type}] : [];
  g.eyes = sight ? [{id: 'eye', partIndex: 0, direction: 'EAST', fov: .8, range: 500}] : [];
  g.bodyCost = sim.calculateBodyCost(g.parts, g.eyes, g.mouths);
  g.maxEnergyCapacity = sim.calculateMaxEnergyCapacity(g.parts, g.storageTraitMultiplier);
  sim.ensureBrainLayout(g); return g;
}
function fixture(type?: sim.MouthType, sight = false) {
  const s = createInitialWorld(settings, 21, 'unbiased', 'standard', 0);
  const org = addExternalOrganism(s, body(type, sight), settings, 1200, 750, 0)!;
  s.caustics = [];
  return {s, org, x: 1200 + org.genome.parts[0].width / 2};
}
function food(x: number, kind: 'nutrient' | 'carrion' = 'nutrient'): sim.Nutrient {
  return {id: 'food', x, y: 750, vx: 0, vy: 0, energyValue: 3000, radius: 18, bottomTimer: 0,
    kind, pulseTimer: 0, ...(kind === 'carrion' ? {decayTimeRemaining: 60} : {})};
}
function step(s: sim.SimulationState, count = 1, opts = settings, dt = 1 / 60) {
  for (let i = 0; i < count; i++) sim.stepSimulation(s, opts, dt);
}
function close(a: number, b: number, epsilon = 1e-7) { assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`); }
function anchorError(org: sim.Organism): number {
  return Math.max(0, ...org.genome.parts.slice(1).map((def, j) => {
    const a = org.segments[def.parentIndex], b = org.segments[j + 1], pd = org.genome.parts[def.parentIndex];
    const pa = sim.getCardinalAnchor(def.attachmentPoint, pd.width, pd.height);
    const pb = sim.getChildAnchorForParentDir(def.attachmentPoint, def.width, def.height);
    return Math.hypot(a.x + Math.cos(a.angle) * pa.x - Math.sin(a.angle) * pa.y - b.x - Math.cos(b.angle) * pb.x + Math.sin(b.angle) * pb.y,
      a.y + Math.sin(a.angle) * pa.x + Math.cos(a.angle) * pa.y - b.y - Math.sin(b.angle) * pb.x - Math.cos(b.angle) * pb.y);
  }));
}

test('empty space and tank walls are black; display caustics and bubbles add no optical signal', () => {
  const {s, org} = fixture(undefined, true);
  org.segments[0].x = 2350;
  s.caustics.push({x: 2380, y: 750, radius: 100, alpha: 1, angle: 0, speed: 0});
  s.bubbles.push({x: 2380, y: 750, vx: 0, vy: 0, life: 0, maxLife: 10, alpha: 1, size: 20, hue: 60});
  step(s);
  assert.ok(org.rayHits.every(r => !r.hit && r.objectType === 'none' && r.dist === 500 && r.r === 0 && r.g === 0 && r.b === 0));
  for (let ray = 0; ray < 5; ray++) assert.deepEqual(org.neuralInputs.slice(ray * 4, ray * 4 + 4), [0, 0, 0, 1]);
});

test('eggs are optically white, fade toward black with distance, and occlude farther food', () => {
  const {s, org, x} = fixture(undefined, true), g = body();
  const egg: sim.Egg = {id: 'egg', clutchId: 'c', parentOrgId: 'foreign', x: x + 100, y: 750,
    vx: 0, vy: 0, genome: g, fundedReserve: 10000, fundedStructural: g.bodyCost, incubationProgress: 0,
    totalIncubationTime: 100, pulseTimer: 0, colorHue: 1, readyToHatch: false};
  s.eggs.push(egg); s.nutrients.push(food(x + 200)); step(s);
  const near = org.rayHits[2]; assert.equal(near.objectType, 'egg'); close(near.dist, 84);
  close(near.r, near.g); close(near.g, near.b); close(near.r, Math.exp(-84 / 275));
  egg.x += 150; s.nutrients = []; egg.colorHue = 240; egg.pulseTimer = 2; step(s);
  const far = org.rayHits[2]; assert.equal(far.objectType, 'egg');
  assert.ok(far.r < near.r); close(far.r, far.g); close(far.g, far.b);
});

test('nutrient pulse phase, glow and super-food decoration never change retinal RGB or hit geometry', () => {
  const {s, org, x} = fixture(undefined, true); const n = food(x + 150); s.nutrients = [n];
  step(s); const before = structuredClone(org.rayHits);
  n.pulseTimer = Math.PI / 2; n.isSuper = true; step(s);
  assert.deepEqual(org.rayHits, before);
  n.x += 100; step(s); assert.ok(org.rayHits[2].g < before[2].g);
  close(org.rayHits[2].dist, 232);
});

for (const [type, kind, efficiency] of [
  ['herbivore', 'nutrient', .8], ['omnivore', 'nutrient', .8],
  ['carnivore', 'carrion', .68], ['omnivore', 'carrion', .68],
] as const) test(`${type} absorbs ${efficiency * 100}% of ${kind} removal; the rest becomes heat`, () => {
  const {s, org, x} = fixture(type); s.nutrients = [food(x, kind)];
  const before = totalAccountedEnergy(s), energy = org.energy;
  step(s);
  const removed = 3000 - s.nutrients[0].energyValue;
  close(removed, (type === 'omnivore' ? 600 : 1200) / 60);
  close(org.energy - energy + org.totalEnergyRate! / 60, removed * efficiency);
  close(org.recentFeedings![0].energyTransferred, removed * efficiency);
  close(s.ledger.metabolicDissipation, org.totalEnergyRate! / 60 + removed * (1 - efficiency));
  close(totalAccountedEnergy(s), before);
});

test('plant-food limit covers manual bursts, startup, inflow, lowering the target and zero target', () => {
  const opts = {...settings, targetNutrients: 3, inflowRate: 150};
  const s = createInitialWorld(opts, 21, 'unbiased', 'standard', 0);
  assert.equal(s.nutrients.length, 3);
  const rng = s.prng.getState(), energy = s.ledger.externalInflow;
  assert.equal(sim.addNutrients(s, opts, 20), 0);
  assert.deepEqual(s.prng.getState(), rng); assert.equal(s.ledger.externalInflow, energy);
  s.ledger.recordedLosses += s.nutrients.pop()!.energyValue;
  assert.equal(sim.addNutrients(s, opts, 15, {x: 100, y: 100, spread: 20}), 1);
  for (const targetNutrients of [2, 0]) {
    const lowered = {...opts, targetNutrients};
    assert.equal(sim.addNutrients(s, lowered, 15), 0); step(s, 120, lowered);
    assert.equal(s.nutrients.length, 3);
  }
  close(totalAccountedEnergy(s), s.ledger.externalInflow);
});

test('mineralization waits at the nutrient cap without destroying carrion energy', () => {
  const {s} = fixture(); s.organisms = [];
  s.nutrients = [food(100), {...food(200, 'carrion'), id: 'remains', decayTimeRemaining: 0}];
  const before = totalAccountedEnergy(s); step(s, 1, {...settings, targetNutrients: 1});
  assert.equal(s.nutrients[1].kind, 'carrion'); close(totalAccountedEnergy(s), before);
  step(s, 1, {...settings, targetNutrients: 2});
  assert.equal(s.nutrients[1].kind, 'nutrient'); close(totalAccountedEnergy(s), before);
});

for (const relation of ['sibling', 'clutch', 'parent', 'unrelated'] as const) {
  for (const protection of [true, false]) test(`${relation} prey permission with kin protection ${protection}`, () => {
    const {s, org, x} = fixture('carnivore');
    const prey = addExternalOrganism(s, body(), settings, x + org.genome.parts[0].width / 2, 750, 0)!;
    if (relation === 'sibling') { org.genome.parentIds = ['parent']; prey.genome.parentIds = ['parent']; }
    if (relation === 'clutch') { org.clutchId = 'c'; prey.clutchId = 'c'; }
    if (relation === 'parent') org.genome.parentIds = [prey.id];
    const before = totalAccountedEnergy(s); step(s, 1, {...settings, kinshipProtection: protection});
    assert.equal(!!org.recentFeedings?.length, relation === 'unrelated' || !protection);
    close(totalAccountedEnergy(s), before);
  });
}

test('reciprocal carnivore/omnivore feeding loses chemical energy instead of amplifying it', () => {
  const {s, org, x} = fixture('carnivore');
  const prey = addExternalOrganism(s, body('omnivore'), settings, x + org.genome.parts[0].width / 2, 750, Math.PI)!;
  const initialReserves = org.energy + prey.energy, initial = totalAccountedEnergy(s);
  step(s, 60, {...settings, kinshipProtection: false});
  assert.ok(org.recentFeedings?.some(e => e.foodCategory === 'Prey'));
  assert.ok(prey.recentFeedings?.some(e => e.foodCategory === 'Prey'));
  assert.ok(org.energy + prey.energy < initialReserves - 300);
  close(totalAccountedEnergy(s), initial);
});

for (const relation of ['own', 'sibling', 'foreign'] as const) test(`carnivore egg feeding respects ${relation} kinship and 80% assimilation`, () => {
  const {s, org, x} = fixture('carnivore'); org.genome.parentIds = ['shared-parent'];
  const g = body(); g.parentIds = [relation === 'sibling' ? 'shared-parent' : relation === 'own' ? org.id : 'foreign'];
  s.eggs.push({id: 'egg', clutchId: 'other', parentOrgId: g.parentIds[0], x, y: 750, vx: 0, vy: 0,
    genome: g, fundedReserve: 10000, fundedStructural: g.bodyCost, incubationProgress: 0, totalIncubationTime: 100,
    pulseTimer: 0, colorHue: 40, readyToHatch: false});
  const before = totalAccountedEnergy(s); step(s);
  if (relation === 'foreign') { close(org.recentFeedings![0].energyTransferred, 16); close(s.eggs[0].fundedReserve, 9980); }
  else { assert.equal(org.recentFeedings?.length ?? 0, 0); close(s.eggs[0].fundedReserve, 10000); }
  close(totalAccountedEnergy(s), before);
});

test('rotated rectangle SAT rejects separated rectangles despite overlapping world bounding boxes', () => {
  const g = body(), def = {...g.parts[0], width: 70, height: 7};
  const a = {x: 0, y: 0, vx: 0, vy: 0, angle: Math.PI / 4, angVel: 0};
  const b = {...a, x: 10, y: -10};
  assert.equal(rectangleContact(a, def, b, def), null);
  b.x = 1; b.y = -1; assert.ok(rectangleContact(a, def, b, def));
});

test('off-center inelastic contact conserves linear/angular momentum and cannot increase kinetic energy', () => {
  const a = {x: -10, y: 0, vx: 12, vy: 2, angle: 0, angVel: .1};
  const b = {x: 10, y: 0, vx: -5, vy: -1, angle: .2, angVel: -.2};
  const massA = 2, massB = 3, inertiaA = 50, inertiaB = 70;
  const values = () => [massA * a.vx + massB * b.vx, massA * a.vy + massB * b.vy,
    massA * (a.x * a.vy - a.y * a.vx) + massB * (b.x * b.vy - b.y * b.vx) + inertiaA * a.angVel + inertiaB * b.angVel,
    .5 * (massA * (a.vx ** 2 + a.vy ** 2) + massB * (b.vx ** 2 + b.vy ** 2) + inertiaA * a.angVel ** 2 + inertiaB * b.angVel ** 2)];
  const before = values(); contactImpulse(a, 1 / massA, 1 / inertiaA, b, 1 / massB, 1 / inertiaB,
    {nx: 1, ny: 0, x: 0, y: 5, depth: .1});
  const after = values(); before.slice(0, 3).forEach((v, i) => close(v, after[i])); assert.ok(after[3] < before[3]);
});

for (const dt of [1 / 30, 1 / 60, 1 / 120]) test(`fast physical bodies cannot pass through one another at dt=${dt}`, () => {
  const {s, org} = fixture(); const other = addExternalOrganism(s, body(), settings, 1350, 750, 0)!;
  org.segments[0].vx = 400; other.segments[0].vx = -400;
  const initial = totalAccountedEnergy(s); step(s, Math.round(1 / dt), settings, dt);
  assert.ok(org.segments[0].x < other.segments[0].x);
  const contact = rectangleContact(org.segments[0], org.genome.parts[0], other.segments[0], other.genome.parts[0]);
  assert.ok(!contact || contact.depth < .05); close(org.speed, 0); close(other.speed, 0);
  close(totalAccountedEnergy(s), initial);
});

test('self-contact excludes directly hinged neighbors and separates nonadjacent parts', () => {
  const g = sim.createReferenceNematodeGenome(new sim.XoshiroPRNG(21)), o = sim.spawnOrganism(g, 1200, 750);
  o.segments[2].x = o.segments[0].x; o.segments[2].y = o.segments[0].y + 2;
  o.segments[1].x = 1300; // Isolate the tested root/leaf pair from its adjacent connection.
  const before = rectangleContact(o.segments[0], g.parts[0], o.segments[2], g.parts[2])!.depth;
  resolveBodyContacts([o], sim.BASE_PART_DENSITY, () => {});
  const after = rectangleContact(o.segments[0], g.parts[0], o.segments[2], g.parts[2]);
  assert.ok(!after || after.depth < before * .01);
  o.segments[1] = {...o.segments[0]}; o.segments.pop(); g.parts.pop(); o.joints.pop();
  const poses = structuredClone(o.segments); resolveBodyContacts([o], sim.BASE_PART_DENSITY, () => {});
  assert.deepEqual(o.segments, poses);
});

test('current snapshots continue exactly through a physical collision and lossy feeding', () => {
  const {s, org, x} = fixture('carnivore');
  const other = addExternalOrganism(s, body(), settings, x + 60, 750, 0)!;
  org.segments[0].vx = 100; other.segments[0].vx = -100;
  step(s, 3); const saved = createSnapshot(s, settings), copy = restoreSnapshot(saved);
  step(s, 120); step(copy.state, 120, copy.settings);
  assert.deepEqual(createSnapshot(s, settings), createSnapshot(copy.state, copy.settings));
});

test('a folded passive chain resolves real self-contact without breaking hinges or creating COM propulsion', () => {
  const s = createInitialWorld(settings, 21, 'balanced', 'standard', 0);
  const g = sim.createReferenceNematodeGenome(new sim.XoshiroPRNG(21));
  g.motorForce = 0; g.mouths = []; g.eyes = []; g.parts.forEach(p => p.maxAngle = 2.95);
  const org = addExternalOrganism(s, g, settings, 1200, 750, 0)!;
  org.segments = sim.restSegments(g.parts.map((p, i) => ({...p, baseAngleOffset: i === 1 ? 2.9 : i === 2 ? -2.9 : 0})), 1200, 750);
  const start = sim.calculateOrganismCOM(org);
  assert.ok(rectangleContact(org.segments[0], g.parts[0], org.segments[2], g.parts[2])!.depth > 1);
  for (let t = 0; t < 120; t++) {
    step(s); assert.ok(anchorError(org) < .01);
    assert.ok((rectangleContact(org.segments[0], g.parts[0], org.segments[2], g.parts[2])?.depth ?? 0) < .05);
  }
  const end = sim.calculateOrganismCOM(org);
  assert.ok(Math.hypot(end.x - start.x, end.y - start.y) < 1e-6);
  assert.equal(s.ledger.mechanicalWorkHeat, 0);
});

test('an active articulated swimmer survives a collision with finite poses and intact hinges', () => {
  const opts = {...settings, waterViscosity: .18}, s = createInitialWorld(opts, 21, 'balanced', 'standard', 0);
  const g = sim.createReferenceNematodeGenome(new sim.XoshiroPRNG(21)); g.eyes = []; g.mouths = [];
  g.weightsHO.forEach(row => row.fill(0)); g.biasesO.fill(0);
  const org = addExternalOrganism(s, g, opts, 1200, 750, 0)!;
  const obstacle = addExternalOrganism(s, body(), opts, 1330, 750, 0)!; obstacle.segments[0].vx = -100;
  for (let t = 0; t < 300; t++) {
    step(s, 1, opts); assert.ok(anchorError(org) < .4);
    assert.ok(org.segments.every(p => Object.values(p).every(Number.isFinite)));
    org.segments.forEach((p, i) => assert.ok((rectangleContact(p, g.parts[i], obstacle.segments[0], obstacle.genome.parts[0])?.depth ?? 0) < .1));
  }
  assert.ok(!org.dissolving && org.energy > 0); close(totalAccountedEnergy(s), s.ledger.externalInflow, 1e-6);
});
