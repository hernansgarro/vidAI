import assert from 'node:assert/strict';
import {test} from 'node:test';
import {MIN_WINDOW_HEIGHT, sideWindowLayout, drawSideWindows} from '../sideWindows';

const cases = [[100, 1], [299, 1], [300, 1], [450, 1], [599, 1], [600, 2],
  [700, 2], [800, 2], [900, 3], [1200, 4], [1500, 5], [1600, 5],
  [1799, 5], [1800, 6], [2100, 7], [3000, 10]];

function adjacent(value: number, direction: -1 | 1) {
  const view = new DataView(new ArrayBuffer(8)); view.setFloat64(0, value);
  view.setBigUint64(0, view.getBigUint64(0) + BigInt(direction));
  return view.getFloat64(0);
}

function paint(width: number, height: number, zoom = 1) {
  const labels: Array<{id: string; x: number; y: number}> = [];
  const circles: Array<{x: number; y: number; radius: number}> = [];
  let saves = 0, restores = 0;
  const ctx = {save() {saves++;}, restore() {restores++;}, beginPath() {}, fill() {}, stroke() {},
    fillText(id: string, x: number, y: number) {labels.push({id, x, y});},
    arc(x: number, y: number, radius: number) {circles.push({x, y, radius});}} as unknown as CanvasRenderingContext2D;
  drawSideWindows(ctx, width, height, zoom);
  assert.equal(saves, 1); assert.equal(restores, 1);
  return {labels, circles};
}

test('fixed 300-world-unit reference covers every specified height, including below the UI minimum', () => {
  assert.equal(MIN_WINDOW_HEIGHT, 300);
  for (const [height, expected] of cases) {
    const {count, sectionHeight} = sideWindowLayout(height);
    assert.equal(count, expected, String(height)); assert.equal(sectionHeight, height / expected);
    assert.ok(count >= 1);
    assert.ok(height < 300 ? sectionHeight === height : sectionHeight >= 300);
  }
  assert.equal(sideWindowLayout(1799).sectionHeight, 359.8);
});

test('exact and immediately adjacent floating-point thresholds obey floor in both directions', () => {
  for (const threshold of [300, 600, 900, 1200, 1800, 2100, 3000, 3000000]) {
    const count = threshold / 300;
    assert.equal(sideWindowLayout(adjacent(threshold, -1)).count, Math.max(1, count - 1));
    assert.equal(sideWindowLayout(threshold).count, count);
    assert.equal(sideWindowLayout(adjacent(threshold, 1)).count, count);
  }
});

test('actual painter numbers from the floor and puts N-1 circles exactly at internal boundaries', () => {
  for (const [height, count] of cases) for (const zoom of [.1, .85, 4]) {
    const {labels, circles} = paint(1800, height, zoom);
    assert.equal(labels.length, count * 2); assert.equal(circles.length, (count - 1) * 2);
    for (let index = 0; index < count; index++) for (const [side, prefix] of ['L', 'R'].entries()) {
      const label = labels[index * 2 + side];
      assert.equal(label.id, prefix + index);
      assert.ok(Math.abs(label.y - (height - (index + .5) * height / count)) < 1e-10);
      assert.ok(side === 0 ? label.x < 0 : label.x > 1800);
    }
    for (let index = 1; index < count; index++) for (let side = 0; side < 2; side++) {
      const circle = circles[(index - 1) * 2 + side];
      assert.equal(circle.y, height - index * height / count);
      assert.ok(circle.y > 0 && circle.y < height, 'no floor or ceiling circles');
      assert.ok(side === 0 ? circle.x + circle.radius < 0 : circle.x - circle.radius > 1800);
      assert.equal(circle.radius * zoom, 4, 'constant CSS-pixel size without moving the boundary height');
    }
  }
});

test('repeated growth and shrinkage redistributes uniformly and leaves no stale sections or circles', () => {
  for (const height of [1500, 1799, 1800, 600, 599, 100, 3000, 900, 299, 1500]) {
    const {count, sectionHeight} = sideWindowLayout(height);
    const {labels, circles} = paint(800, height);
    assert.equal(labels.length / 2, count); assert.equal(circles.length / 2, count - 1);
    const left = labels.filter(l => l.id.startsWith('L'));
    assert.equal(left.at(-1)!.id, `L${count - 1}`);
    for (let i = 1; i < count; i++) assert.ok(Math.abs(left[i - 1].y - left[i].y - sectionHeight) < 1e-10);
  }
});

test('default-height changes and camera/viewport choices cannot redefine the reference or cap the count', () => {
  assert.deepEqual([1500, 1800, 2100].map(h => sideWindowLayout(h).count), [5, 6, 7]);
  assert.equal(sideWindowLayout(3000000).count, 10000, 'no artificial logical window cap');
  const baseline = paint(1800, 1600).labels.map(l => [l.id, l.y]);
  for (const width of [800, 2400, 4800]) for (const zoom of [.1, .5, 1, 4])
    assert.deepEqual(paint(width, 1600, zoom).labels.map(l => [l.id, l.y]), baseline);
});
