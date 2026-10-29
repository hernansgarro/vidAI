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
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 1 / zoom;
  for (let index = 1; index < count; index++) {
    // Canvas y increases downward; the specification measures up from the floor.
    const y = height - index * height / count;
    for (const x of [-offset, width + offset]) {
      ctx.beginPath(); ctx.arc(x, y, 4 / zoom, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
  ctx.restore();
}
