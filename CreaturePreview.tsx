import {getPartCornerVertices, getOrganAnchor, restSegments, type Genome} from './simulation';

export default function CreaturePreview({genome: g}: {genome: Genome}) {
  const segments = restSegments(g.parts);
  const points = g.parts.map((p, i) => getPartCornerVertices(segments[i], p));
  const flat = points.flat(), xs = flat.map(p => p.x), ys = flat.map(p => p.y);
  const left = Math.min(...xs) - 10, top = Math.min(...ys) - 10;
  const width = Math.max(...xs) - left + 10, height = Math.max(...ys) - top + 10;
  return <svg viewBox={`${left} ${top} ${width} ${height}`} className="w-14 h-12 shrink-0" aria-label={`${g.name} body preview`}>
    {points.map((corners, i) => <polygon key={g.parts[i].id} points={corners.map(p => `${p.x},${p.y}`).join(' ')}
      fill={`hsl(${g.hue},${g.saturation}%,${g.lightness}%)`} stroke="#cffafe" strokeWidth="1" />)}
    {[...g.eyes, ...g.mouths].map(organ => {
      const p = g.parts[organ.partIndex], s = segments[organ.partIndex], a = getOrganAnchor(organ, p.width, p.height);
      const x = s.x + Math.cos(s.angle) * a.x - Math.sin(s.angle) * a.y;
      const y = s.y + Math.sin(s.angle) * a.x + Math.cos(s.angle) * a.y;
      const scale = organ.slot === undefined ? 1 : Math.min(1, (organ.direction === 'NORTH' || organ.direction === 'SOUTH' ? p.width : p.height) / 30);
      return <circle key={`${'mouthType' in organ ? 'mouth' : 'eye'}:${organ.id}`} cx={x} cy={y} r={3 * scale} fill={'mouthType' in organ ? '#fb7185' : '#fff'} />;
    })}
  </svg>;
}
