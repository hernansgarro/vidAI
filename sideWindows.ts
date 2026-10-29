/** Independent world-unit reference, never derived from configured tank defaults. */
export const MIN_WINDOW_HEIGHT = 300;

export function sideWindowLayout(height: number) {
  if (!(height > 0) || !Number.isFinite(height)) throw new RangeError('Tank height must be positive and finite');
  const count = Math.max(1, Math.floor(height / MIN_WINDOW_HEIGHT));
  return {count, sectionHeight: height / count};
}

/** Observer-only paint, inside the existing camera transform and outside the
 * physical walls. Nothing here is part of a world, sensory scene or save. */
export function drawSideWindows(ctx: CanvasRenderingContext2D, width: number, height: number, zoom: number) {
  const {count, sectionHeight} = sideWindowLayout(height);
  const offset = 10 / zoom;
  ctx.save();
  ctx.font = `${11 / zoom}px ui-monospace, SFMono-Regular, Consolas, monospace`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#a5f3fc';
  for (let index = 0; index < count; index++) {
    const y = height - (index + .5) * sectionHeight;
    ctx.textAlign = 'right'; ctx.fillText(`L${index}`, -offset, y);
    ctx.textAlign = 'left'; ctx.fillText(`R${index}`, width + offset, y);
  }
  ctx.restore();
}

/** A fixed visual extension, independent of section height and tank defaults. */
export const GLASS_TUBE_LENGTH = 300;
export type TubeRun = {first: number; last: number; top: number; bottom: number};

/** Merge only adjacent visible agreements; never create a removed section. */
export function glassTubeRuns(height: number, accepted: readonly number[]): TubeRun[] {
  const {count, sectionHeight} = sideWindowLayout(height);
  const indices = [...new Set(accepted)].filter(i => Number.isInteger(i) && i >= 0 && i < count).sort((a, b) => a - b);
  const runs: TubeRun[] = [];
  for (const index of indices) {
    const previous = runs.at(-1);
    if (previous && index === previous.last + 1) {
      previous.last = index; previous.top = height - (index + 1) * sectionHeight;
    } else runs.push({first: index, last: index, top: height - (index + 1) * sectionHeight,
      bottom: height - index * sectionHeight});
  }
  return runs;
}

/** Water and horizontal glass edges only: no distal cap, physical opening or entities. */
export function drawGlassTubes(ctx: CanvasRenderingContext2D, width: number, zoom: number,
  sides: {L: readonly TubeRun[]; R: readonly TubeRun[]}) {
  ctx.save();
  for (const side of ['L', 'R'] as const) {
    if (!sides[side].length) continue;
    const wall = side === 'L' ? 0 : width, tip = wall + (side === 'L' ? -1 : 1) * GLASS_TUBE_LENGTH;
    const water = ctx.createLinearGradient(wall, 0, tip, 0);
    water.addColorStop(0, 'rgba(8, 145, 178, 0.13)');
    water.addColorStop(2 / 3, 'rgba(8, 145, 178, 0.035)'); water.addColorStop(1, 'rgba(8, 145, 178, 0)');
    const glass = ctx.createLinearGradient(wall, 0, tip, 0);
    glass.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    glass.addColorStop(2 / 3, 'rgba(103, 232, 249, 0.2)'); glass.addColorStop(1, 'rgba(103, 232, 249, 0.02)');
    for (const run of sides[side]) {
      ctx.fillStyle = water; ctx.fillRect(Math.min(wall, tip), run.top, GLASS_TUBE_LENGTH, run.bottom - run.top);
      ctx.strokeStyle = glass; ctx.lineWidth = 4 / zoom;
      ctx.beginPath(); ctx.moveTo(wall, run.top); ctx.lineTo(tip, run.top);
      ctx.moveTo(wall, run.bottom); ctx.lineTo(tip, run.bottom); ctx.stroke();
    }
  }
  ctx.restore();
}
