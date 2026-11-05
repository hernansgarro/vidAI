import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync, readdirSync} from 'node:fs';
import {calculateCreatureEnvelope, encloseCreaturePose} from '../creatureEnvelope';
import {
  BASE_PART_DENSITY, MAX_PARTS, XoshiroPRNG, calculateOrganismCOM,
  getPartCornerVertices, getCardinalAnchor, getChildAnchorForParentDir, spawnOrganism,
  type PartDef, type PartPhys, type CardinalDir, type Organism,
} from '../simulation';
import {FOUNDER_BLUEPRINTS, FEATURED_BLUEPRINTS, createFounderGenome} from '../founders';
import {createInitialWorld} from '../world';
import {DEFAULT_SETTINGS, createSnapshot, restoreSnapshot} from '../persistence';

function part(parentIndex: number, dimN = 3, dimM = 1, attachmentPoint: CardinalDir = 'EAST'): PartDef {
  return {id: `p${parentIndex}`, parentIndex, dimN, dimM, width: dimN * 7, height: dimM * 7,
    attachmentPoint, maxAngle: 2.35, baseAngleOffset: 0, cpgPhaseOffset: 0, cpgAmp: 1, cpgFreqMult: 1};
}
const chain = (n = MAX_PARTS) => Array.from({length: n}, (_, i) => part(i - 1, 10, 1));
const branch = () => [part(-1, 10, 10), part(0, 1, 10, 'NORTH'), part(0, 10, 1, 'SOUTH'),
  part(1, 10, 1, 'WEST'), part(1, 1, 1), part(2, 1, 10, 'WEST'), part(2, 1, 1)];

// Direct forward kinematics supplies fixtures only, never a stretch simulation.
// Uses the authoritative anchors, with independent per-edge optional residuals.
function pose(parts: readonly PartDef[], angles: readonly number[], gaps: readonly [number, number][] = []): PartPhys[] {
  const result: PartPhys[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i], angle = angles[i];
    let x = 0, y = 0;
    if (i) {
      const parent = result[p.parentIndex], pd = parts[p.parentIndex];
      const a = getCardinalAnchor(p.attachmentPoint, pd.width, pd.height);
      const b = getChildAnchorForParentDir(p.attachmentPoint, p.width, p.height);
      x = parent.x + Math.cos(parent.angle) * a.x - Math.sin(parent.angle) * a.y
        - Math.cos(angle) * b.x + Math.sin(angle) * b.y + (gaps[i]?.[0] ?? 0);
      y = parent.y + Math.sin(parent.angle) * a.x + Math.cos(parent.angle) * a.y
        - Math.sin(angle) * b.x - Math.cos(angle) * b.y + (gaps[i]?.[1] ?? 0);
    }
    result.push({x, y, angle, vx: 0, vy: 0, angVel: 0});
  }
  return result;
}
function com(parts: PartDef[], segments: PartPhys[]) {
  return calculateOrganismCOM({genome: {parts}, segments} as Organism);
}
function contains(parts: PartDef[], segments: PartPhys[], radius: number, center: {x: number; y: number} = com(parts, segments)) {
  for (let i = 0; i < parts.length; i++) for (const p of getPartCornerVertices(segments[i], parts[i])) {
    assert.ok(Math.hypot(p.x - center.x, p.y - center.y) <= radius, `part ${i} exceeds radial bound`);
    assert.ok(p.x >= center.x - radius && p.x <= center.x + radius
      && p.y >= center.y - radius && p.y <= center.y + radius, `part ${i} exceeds square`);
  }
}

test('single rectangle has a finite rotation-independent corner bound with no hinge assumptions', () => {
  for (const p of [part(-1, 1, 1), part(-1, 10, 1), part(-1, 1, 10), part(-1, 10, 10)]) {
    const envelope = calculateCreatureEnvelope([p]);
    assert.ok(Number.isFinite(envelope.radius));
    assert.ok(envelope.radius >= Math.hypot(p.width, p.height) / 2);
    assert.ok(envelope.radius < Math.hypot(p.width, p.height) / 2 + 1e-9);
    for (let a = 0; a < 360; a++) contains([p], pose([p], [a * Math.PI / 180]), envelope.radius);
  }
});

test('mass-weighted paths cover the entire extended chain, not half a longest path or just the root', () => {
  const parts = chain(), envelope = calculateCreatureEnvelope(parts, 0), segments = pose(parts, parts.map(() => 0));
  contains(parts, segments, envelope.radius);
  const expected = 210 + Math.hypot(70, 7) / 2;
  assert.ok(envelope.radius >= expected && envelope.radius < expected + 1e-8);
  // A massive terminal part puts COM near one end, increasing opposite-tip reach.
  parts[6] = part(5, 10, 10);
  const unequal = calculateCreatureEnvelope(parts, 0), unequalPose = pose(parts, parts.map(() => 0));
  contains(parts, unequalPose, unequal.radius);
  const actualCOM = com(parts, unequalPose);
  assert.ok(actualCOM.x > 300);
  assert.ok(unequal.radius > envelope.radius);
});

test('long and branched trees contain extended, folded, joint-limit and globally rotated postures', () => {
  for (const parts of [chain(), branch()]) {
    const envelope = calculateCreatureEnvelope(parts, 0);
    const before = structuredClone(parts);
    for (let k = 0; k < 512; k++) {
      // Independent hinges at both limits plus intermediate folding; global rotation.
      const angles = parts.map((p, i) => i ? 0 : k * Math.PI / 73);
      for (let i = 1; i < parts.length; i++) angles[i] = angles[parts[i].parentIndex]
        + parts[i].baseAngleOffset + (k & (1 << i) ? 1 : -1) * parts[i].maxAngle * (k % 3 / 2);
      const segments = pose(parts, angles);
      contains(parts, segments, envelope.radius);
      const shifted = segments.map(p => ({...p, x: p.x + 5100, y: p.y - 900}));
      contains(parts, shifted, envelope.radius);
    }
    assert.deepEqual(parts, before);
  }
});

test('finite certified hinge gaps accumulate along all paths; angles are deliberately unrestricted', () => {
  const random = new XoshiroPRNG(627);
  for (const parts of [chain(), branch()]) for (const gap of [0, .02, 3, 1000]) {
    const envelope = calculateCreatureEnvelope(parts, gap);
    assert.ok(envelope.radius >= calculateCreatureEnvelope(parts, 0).radius);
    for (let k = 0; k < 80; k++) {
      const angles = parts.map(() => random.range(-100, 100));
      const gaps = parts.map(() => {
        const a = random.range(-Math.PI, Math.PI), r = gap * (k % 2 ? 1 : random.nextFloat());
        return [Math.cos(a) * r, Math.sin(a) * r] as [number, number];
      });
      contains(parts, pose(parts, angles, gaps), envelope.radius);
    }
  }
});

test('all 64 catalogue anatomies fit relaxed bounds across seeded postures and headings', () => {
  const random = new XoshiroPRNG(644);
  const designs = [...FOUNDER_BLUEPRINTS, ...FEATURED_BLUEPRINTS];
  assert.equal(designs.length, 64);
  for (const d of designs) {
    const parts = d.morphology.parts, envelope = calculateCreatureEnvelope(parts, 0);
    for (let k = 0; k < 40; k++) contains(parts,
      pose(parts, parts.map(() => random.range(-Math.PI, Math.PI))), envelope.radius);
  }
});

test('uncertified multi-part solver/import states fail open; pose fallback encloses arbitrary separation', () => {
  const parts = branch(), envelope = calculateCreatureEnvelope(parts);
  assert.equal(envelope.radius, Infinity); assert.equal(envelope.maxAnchorGap, null);
  assert.ok(Number.isFinite(envelope.idealRadius));
  const segments = pose(parts, parts.map(() => 1));
  segments[6].x = 1e7; segments[4].y = -1e7;
  const result = encloseCreaturePose(envelope, segments);
  assert.equal(result.source, 'pose-fallback');
  assert.ok(result.bounds && result.center);
  assert.deepEqual(result.center, {x: com(parts, segments).x, y: com(parts, segments).y});
  contains(parts, segments, result.radius, result.center);
  assert.ok(result.radius > envelope.idealRadius * 100);
  // Even a caller's false gap claim cannot make the explicit pose helper exclude parts.
  const invalidCertificate = encloseCreaturePose(calculateCreatureEnvelope(parts, 0), segments);
  assert.equal(invalidCertificate.source, 'pose-fallback');
  contains(parts, segments, invalidCertificate.radius);
});

test('pose fallback covers cancellation, large coordinates, rotations, and numerical overflow without finite clipping', () => {
  const parts = branch(), envelope = calculateCreatureEnvelope(parts);
  for (const scale of [1, 1e12, 1e150]) {
    const segments = pose(parts, parts.map((_, i) => i * 9));
    for (let i = 0; i < segments.length; i++) {
      segments[i].x = (i % 2 ? -1 : 1) * scale;
      segments[i].y = (i % 3 ? -1 : 1) * scale;
    }
    const result = encloseCreaturePose(envelope, segments);
    assert.ok(result.bounds && result.center);
    contains(parts, segments, result.radius, result.center);
  }
  const huge = pose(parts, parts.map(() => 0)); huge[0].x = Number.MAX_VALUE;
  assert.deepEqual(encloseCreaturePose(envelope, huge), {source: 'unbounded', center: null, radius: Infinity, bounds: null});
  assert.equal(calculateCreatureEnvelope(chain(), Number.MAX_VALUE).radius, Infinity);
});

test('immutable reusable birth descriptor has no pose references or accidental stale-geometry cache', () => {
  const parts = chain(), saved = structuredClone(parts), envelope = calculateCreatureEnvelope(parts);
  assert.ok(Object.isFrozen(envelope)); assert.ok(Object.isFrozen(envelope.masses));
  assert.ok(Object.isFrozen(envelope.cornerRadii));
  assert.deepEqual(parts, saved);
  const segments = pose(parts, parts.map(() => 0)), before = structuredClone(segments);
  assert.deepEqual(encloseCreaturePose(envelope, segments), encloseCreaturePose(envelope, segments));
  assert.deepEqual(segments, before);
  parts[6] = part(5, 1, 1);
  assert.deepEqual(envelope, calculateCreatureEnvelope(saved));
  assert.notEqual(calculateCreatureEnvelope(parts).idealRadius, envelope.idealRadius);
});

test('invalid/disconnected/cyclic geometry and malformed poses reject explicitly', () => {
  const valid = chain();
  for (const parts of [[], [...valid, part(6)], [part(0)], [part(-1), part(-1)], [part(-1), part(1)],
    [part(-1), part(3)], [{...part(-1), dimN: 0}], [{...part(-1), width: Infinity}],
    [{...part(-1), height: NaN}], [{...part(-1), width: 22}], [{...part(-1), dimM: 11}],
    [{...part(-1), parentIndex: .5}], [{...part(-1), attachmentPoint: 'other' as CardinalDir}]])
    assert.throws(() => calculateCreatureEnvelope(parts), RangeError);
  for (const gap of [-1, NaN, Infinity]) assert.throws(() => calculateCreatureEnvelope(valid, gap), RangeError);
  const envelope = calculateCreatureEnvelope(valid);
  assert.throws(() => encloseCreaturePose(envelope, []), /count mismatch/);
  const segments = pose(valid, valid.map(() => 0)); segments[1].x = NaN;
  assert.throws(() => encloseCreaturePose(envelope, segments), /Invalid envelope pose/);
});

test('snapshot/PRNG are untouched and actual saved separated bodies use the explicit fallback', () => {
  const settings = {...DEFAULT_SETTINGS, targetNutrients: 0, inflowRate: 0};
  const world = createInitialWorld(settings, 242, 'balanced', 'standard', 0);
  const org = spawnOrganism(createFounderGenome('CUR-009'), 1200, 750, .7, undefined, 10000, world.prng);
  world.organisms.push(org);
  org.segments[1].x += 10000;
  const before = createSnapshot(world, settings);
  const descriptor = calculateCreatureEnvelope(org.genome.parts);
  encloseCreaturePose(descriptor, org.segments);
  assert.deepEqual(createSnapshot(world, settings), before);
  const loaded = restoreSnapshot(before).state.organisms[0];
  const enclosure = encloseCreaturePose(calculateCreatureEnvelope(loaded.genome.parts), loaded.segments);
  assert.equal(enclosure.source, 'pose-fallback');
  contains(loaded.genome.parts, loaded.segments, enclosure.radius);
});

test('P2 runtime integration is confined to P4 authority and the P5 observer', () => {
  assert.match(readFileSync(new URL('../maintainedGrid.ts', import.meta.url), 'utf8'), /from\s*['"].*creatureEnvelope/);
  for (const name of readdirSync(new URL('..', import.meta.url)).filter(n => /\.(ts|tsx)$/.test(n) && n !== 'creatureEnvelope.ts' && n !== 'maintainedGrid.ts' && n !== 'gridIntegrityAudit.ts'))
    assert.doesNotMatch(readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'), /from\s*['"].*creatureEnvelope/,
      `${name} must not integrate P2`);
  assert.equal(BASE_PART_DENSITY, .4); assert.equal(MAX_PARTS, 7);
});
