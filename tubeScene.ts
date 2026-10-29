import {tubeFade, TUBE_DEPTH, type TubeGeometry} from './selfTubes';

/** Whole-body observer fade also covers mouths/parts above or below a tube.
 * Ignore vertical containment here: this is appearance, never a wall repair. */
export function wholeOrganismTubeFade(geometry: TubeGeometry | undefined, rootX: number): number {
  if (!geometry?.runs.length) return 1;
  const run = geometry.runs[0];
  return tubeFade(geometry, rootX, (run.top + run.bottom) / 2);
}

/** Presentation-only surface: apply spatial opacity after all entity/effect
 * painting, without changing optical inputs or any authoritative world record. */
export class TubeSceneLayer {
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;

  begin(target: CanvasRenderingContext2D): CanvasRenderingContext2D {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d')!;
    }
    const {canvas, context: ctx} = this;
    if (canvas.width !== target.canvas.width) canvas.width = target.canvas.width;
    if (canvas.height !== target.canvas.height) canvas.height = target.canvas.height;
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.save(); ctx!.setTransform(target.getTransform());
    return ctx!;
  }

  finish(target: CanvasRenderingContext2D, geometry: TubeGeometry, viewLeft: number, viewRight: number): void {
    const ctx = this.context!;
    ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-out';
    const referenceY = (geometry.runs[0].top + geometry.runs[0].bottom) / 2;
    for (const side of [-1, 1]) {
      const wall = side < 0 ? 0 : geometry.width;
      const left = side < 0 ? viewLeft : wall, right = side < 0 ? wall : viewRight;
      if (right <= left) continue;
      const mask = ctx.createLinearGradient(wall, 0, wall + side * TUBE_DEPTH, 0);
      // Piecewise-linear approximation stays below 0.0002 opacity error.
      for (let i = 0; i <= 64; i++) {
        const fraction = i / 64;
        const removed = 1 - tubeFade(geometry, wall + side * TUBE_DEPTH * fraction, referenceY);
        mask.addColorStop(fraction, `rgba(0, 0, 0, ${removed})`);
      }
      ctx.fillStyle = mask;
      for (const run of geometry.runs) ctx.fillRect(left, run.top, right - left, run.bottom - run.top);
    }
    ctx.restore(); ctx.restore();
    target.save(); target.setTransform(1, 0, 0, 1, 0, 0);
    target.drawImage(this.canvas!, 0, 0); target.restore();
  }
}
