import {
  BASE_PART_DENSITY, MAX_PARTS, getCardinalAnchor, getChildAnchorForParentDir,
  type PartDef, type PartPhys,
} from './simulation';
import type {SpatialBounds} from './spatialIndex';

type EnvelopePart = Pick<PartDef, 'parentIndex' | 'attachmentPoint' | 'width' | 'height' | 'dimN' | 'dimM'>;

export interface CreatureEnvelope {
  /** All hinge rotations are relaxed; anchors coincide. Not a solver certificate. */
  readonly idealRadius: number;
  /** Infinity means that no finite lifetime envelope has been established. */
  readonly radius: number;
  /** Caller-certified bound on EVERY hinge's anchor separation, at every use. */
  readonly maxAnchorGap: number | null;
  readonly masses: readonly number[];
  readonly cornerRadii: readonly number[];
  readonly totalMass: number;
}

export type CreaturePoseEnvelope = {
  source: 'anatomy' | 'pose-fallback';
  center: {x: number; y: number};
  radius: number;
  bounds: SpatialBounds;
} | {
  /** Fail open on arithmetic overflow; never pass this result to a finite grid. */
  source: 'unbounded'; center: null; radius: number; bounds: null;
};

// Outward slack for bounded anatomy arithmetic and finite pose rounding. This
// is numerical slack, NOT an assumed physical hinge-separation tolerance.
const outward = (value: number) => value + 64 * Number.EPSILON * Math.max(1, Math.abs(value));

/** Compute once for each new/replaced anatomy; retain the immutable descriptor.
 * No pose, PRNG, physics step, persistent cache or simulation hook is involved.
 * A finite multi-part lifetime radius requires an EXTERNAL gap certificate;
 * the current fixed-iteration solver does not provide one. See the P2 contract.
 */
export function calculateCreatureEnvelope(parts: readonly EnvelopePart[], maxAnchorGap?: number): CreatureEnvelope {
  if (parts.length < 1 || parts.length > MAX_PARTS) throw new RangeError('Invalid envelope part count');
  if (maxAnchorGap !== undefined && (!Number.isFinite(maxAnchorGap) || maxAnchorGap < 0))
    throw new RangeError('Invalid maximum anchor gap');
  const masses: number[] = [], cornerRadii: number[] = [];
  const edges: Array<Array<{index: number; length: number}>> = parts.map(() => []);
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!Number.isInteger(p.parentIndex) || (i === 0 ? p.parentIndex !== -1 : p.parentIndex < 0 || p.parentIndex >= i))
      throw new RangeError('Envelope requires a connected ordered body tree');
    // Match supported historical/current anatomy, without changing import rules.
    if (![p.dimN, p.dimM].every(n => Number.isInteger(n) && n >= 1 && n <= 10)
      || p.width !== p.dimN * 7 || p.height !== p.dimM * 7
      || !['NORTH', 'SOUTH', 'EAST', 'WEST'].includes(p.attachmentPoint))
      throw new RangeError('Invalid envelope part geometry');
    masses.push(Math.max(.35, p.dimN * p.dimM * BASE_PART_DENSITY));
    cornerRadii.push(outward(Math.hypot(p.width / 2, p.height / 2)));
    if (i === 0) continue;
    const parent = parts[p.parentIndex];
    const a = getCardinalAnchor(p.attachmentPoint, parent.width, parent.height);
    const b = getChildAnchorForParentDir(p.attachmentPoint, p.width, p.height);
    const length = outward(Math.hypot(a.x, a.y) + Math.hypot(b.x, b.y));
    edges[i].push({index: p.parentIndex, length});
    edges[p.parentIndex].push({index: i, length});
  }
  const totalMass = masses.reduce((sum, m) => sum + m, 0);
  const bound = (gap: number) => {
    let radius = 0;
    for (let i = 0; i < parts.length; i++) {
      let weightedDistance = 0;
      const visit = (node: number, previous: number, distance: number) => {
        if (node !== i) weightedDistance = outward(weightedDistance
          + outward(outward(masses[node] / totalMass) * distance));
        for (const edge of edges[node]) if (edge.index !== previous)
          visit(edge.index, node, outward(distance + outward(edge.length + gap)));
      };
      visit(i, -1, 0);
      radius = Math.max(radius, outward(cornerRadii[i] + weightedDistance));
    }
    return radius;
  };
  const idealRadius = bound(0);
  return Object.freeze({
    idealRadius,
    radius: parts.length === 1 ? idealRadius : maxAnchorGap === undefined ? Infinity : bound(maxAnchorGap),
    maxAnchorGap: maxAnchorGap ?? null,
    masses: Object.freeze(masses), cornerRadii: Object.freeze(cornerRadii), totalMass,
  });
}

/** Explicit safe fallback for the CURRENT pose, including unconstrained imports
 * and solver drift. O(n) COM/distance scan; does not recompute the tree bound.
 * P4 refreshes this fallback after completed authoritative pose transactions.
 * Only rigid body rectangles are covered: optical rays, forward mouth reach
 * and observer decorations require their own consumer-specific bounds.
 */
export function encloseCreaturePose(envelope: CreatureEnvelope,
  segments: readonly Pick<PartPhys, 'x' | 'y'>[]): CreaturePoseEnvelope {
  if (segments.length !== envelope.masses.length) throw new RangeError('Envelope anatomy/pose count mismatch');
  let weightedX = 0, weightedY = 0, coordinateScale = 1;
  for (let i = 0; i < segments.length; i++) {
    const p = segments[i];
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) throw new RangeError('Invalid envelope pose');
    weightedX += p.x * envelope.masses[i]; weightedY += p.y * envelope.masses[i];
    coordinateScale = Math.max(coordinateScale, Math.abs(p.x), Math.abs(p.y));
  }
  // Same mass model and summation order as calculateOrganismCOM.
  const x = weightedX / envelope.totalMass, y = weightedY / envelope.totalMass;
  let observedRadius = 0;
  for (let i = 0; i < segments.length; i++) observedRadius = Math.max(observedRadius,
    outward(Math.hypot(segments[i].x - x, segments[i].y - y) + envelope.cornerRadii[i]));
  // Include cancellation/COM and final world-coordinate bounds rounding.
  observedRadius = outward(observedRadius + 64 * Number.EPSILON * coordinateScale * segments.length);
  const radius = Math.max(Number.isFinite(envelope.radius) ? envelope.radius : envelope.idealRadius, observedRadius);
  const bounds = {left: x - radius, right: x + radius, top: y - radius, bottom: y + radius};
  if (![x, y, radius, ...Object.values(bounds)].every(Number.isFinite))
    return {source: 'unbounded', center: null, radius: Infinity, bounds: null};
  return {source: Number.isFinite(envelope.radius) && observedRadius <= envelope.radius ? 'anatomy' : 'pose-fallback',
    center: {x, y}, radius, bounds};
}
