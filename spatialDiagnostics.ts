import {GRID_CELL_SIZE} from './centralSpatialGrid';
import {getMaintainedGrid} from './maintainedGrid';
import type {SimulationState} from './simulation';
import type {SpatialBounds} from './spatialIndex';

export interface SpatialOverlayOptions {cells: boolean; envelopes: boolean}
export const SPATIAL_OVERLAYS_OFF: Readonly<SpatialOverlayOptions> = Object.freeze({cells: false, envelopes: false});
export interface SpatialOverlayFrame {
  revision: number;
  available: boolean;
  cells?: Array<{x: number; y: number; rgb: number}>;
  envelopes?: Array<{bounds: SpatialBounds; certified: boolean; overflow: boolean}>;
  overflow: number;
  unboundedCreatures: number;
}
/** Presence channels are already saturated: duplicate occupants never brighten. */
export function gridKindRGB(kind: string): number {
  return kind === 'nutrient' ? 0x00ff00 : kind === 'carrion' || kind === 'egg' ? 0xff0000
    : kind === 'organism' || kind === 'body-part' ? 0x0000ff : 0;
}
export function saturatedRGB(a: number, b: number): number {
  return (Math.min(255, (a >>> 16 & 255) + (b >>> 16 & 255)) << 16)
    | (Math.min(255, (a >>> 8 & 255) + (b >>> 8 & 255)) << 8)
    | Math.min(255, (a & 255) + (b & 255));
}
export function rgbHex(rgb: number): string {return '#' + rgb.toString(16).padStart(6, '0').toUpperCase();}

/** Observer readback only. Never initialize/synchronize a missing grid or infer
 * cells from geometry. Overflow has no matrix assignment, so it gets no cells. */
export function collectSpatialOverlay(state: SimulationState, options: SpatialOverlayOptions, revision = 0): SpatialOverlayFrame | undefined {
  if (!options.cells && !options.envelopes) return undefined;
  const grid = getMaintainedGrid(state);
  const frame: SpatialOverlayFrame = {revision, available: !!grid, overflow: grid?.overflowCount ?? 0, unboundedCreatures: 0};
  if (!grid) return frame;
  if (options.cells) {
    const cells = new Map<string, {x: number; y: number; rgb: number}>();
    grid.matrix.inspectCells((x, y, kind, entries) => {
      // Read bucket presence, not bounds, rank, query output or entity positions.
      if (entries[Symbol.iterator]().next().done) return;
      const rgb = gridKindRGB(kind); if (!rgb) return;
      const key = `${x},${y}`, old = cells.get(key);
      if (old) old.rgb = saturatedRGB(old.rgb, rgb); else cells.set(key, {x, y, rgb});
    });
    frame.cells = [...cells.values()];
  }
  if (options.envelopes) {
    frame.envelopes = [];
    grid.inspectCreatureEnvelopes((bounds, certified, overflow) => {
      if (bounds) frame.envelopes!.push({bounds: {...bounds}, certified, overflow});
      else frame.unboundedCreatures++;
    });
  }
  return frame;
}
const finiteBounds = (b: SpatialBounds) => [b.left, b.right, b.top, b.bottom].every(Number.isFinite)
  && b.left <= b.right && b.top <= b.bottom;
const visible = (b: SpatialBounds, view: SpatialBounds) => b.right >= view.left && b.left <= view.right
  && b.bottom >= view.top && b.top <= view.bottom;

/** Called in world coordinates after decoration, before every entity/glow pass.
 * The existing scene's tube/edge mask applies afterward. Width/inset are CSS
 * pixels: DPR is already in the canvas transform and must not be divided twice. */
export function drawSpatialOverlay(ctx: CanvasRenderingContext2D, frame: SpatialOverlayFrame | undefined,
  options: SpatialOverlayOptions, zoom: number, view: SpatialBounds): void {
  if ((!options.cells && !options.envelopes) || !frame || !Number.isFinite(zoom) || zoom <= 0) return;
  const pixel = 1 / zoom;
  ctx.save(); ctx.globalAlpha = .55; ctx.lineWidth = pixel;
  ctx.shadowBlur = 0; ctx.setLineDash([]);
  if (options.cells) for (const cell of frame.cells ?? []) {
    const b = {left: cell.x * GRID_CELL_SIZE, right: (cell.x + 1) * GRID_CELL_SIZE,
      top: cell.y * GRID_CELL_SIZE, bottom: (cell.y + 1) * GRID_CELL_SIZE};
    if (!visible(b, view) || GRID_CELL_SIZE <= 2 * pixel) continue;
    ctx.strokeStyle = rgbHex(cell.rgb);
    ctx.strokeRect(b.left + pixel, b.top + pixel, GRID_CELL_SIZE - 2 * pixel, GRID_CELL_SIZE - 2 * pixel);
  }
  if (options.envelopes) for (const envelope of frame.envelopes ?? []) {
    const b = envelope.bounds;
    // Extreme finite imported bounds may overflow subtraction. Clip the paint
    // primitives to the viewport, never create a false edge at the clip border.
    if (!finiteBounds(b) || !visible(b, view)) continue;
    ctx.strokeStyle = '#0000FF';
    ctx.setLineDash(envelope.certified ? [] : [4 * pixel, 3 * pixel]);
    ctx.beginPath();
    const left = Math.max(b.left, view.left), right = Math.min(b.right, view.right);
    const top = Math.max(b.top, view.top), bottom = Math.min(b.bottom, view.bottom);
    if (b.top >= view.top) {ctx.moveTo(left, b.top); ctx.lineTo(right, b.top);}
    if (b.bottom <= view.bottom) {ctx.moveTo(left, b.bottom); ctx.lineTo(right, b.bottom);}
    if (b.left >= view.left) {ctx.moveTo(b.left, top); ctx.lineTo(b.left, bottom);}
    if (b.right <= view.right) {ctx.moveTo(b.right, top); ctx.lineTo(b.right, bottom);}
    ctx.stroke();
  }
  ctx.restore();
}
