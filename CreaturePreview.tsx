import {getPartCornerVertices, restSegments, type Genome} from './simulation';

export default function CreaturePreview({genome: g}: {genome: Genome}) {
  const segments = restSegments(g.parts);
  const points = g.parts.map((p, i) => getPartCornerVertices(segments[i], p));
  const flat = points.flat(), xs = flat.map(p => p.x), ys = flat.map(p => p.y);
  const left = Math.min(...xs) - 6, top = Math.min(...ys) - 6;
  const width = Math.max(...xs) - left + 6, height = Math.max(...ys) - top + 6;
  return <svg viewBox={`${left} ${top} ${width} ${height}`} className="w-14 h-12 shrink-0" aria-label={`${g.name} body preview`}>
    {points.map((corners, i) => <polygon key={g.parts[i].id} points={corners.map(p => `${p.x},${p.y}`).join(' ')}
      fill={`hsl(${g.hue},${g.saturation}%,${g.lightness}%)`} stroke="#cffafe" strokeWidth="1" />)}
  </svg>;
}
