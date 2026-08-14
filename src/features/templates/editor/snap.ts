export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Guide {
  axis: 'x' | 'y';
  position: number;
}

export const SNAP_THRESHOLD = 6;

function snapAxis(
  start: number,
  size: number,
  targets: number[],
  threshold: number,
): { value: number; guide: number | null } {
  const anchors = [0, size / 2, size];
  let best: { delta: number; guide: number } | null = null;
  for (const anchor of anchors) {
    for (const target of targets) {
      const delta = target - (start + anchor);
      if (
        Math.abs(delta) <= threshold &&
        (!best || Math.abs(delta) < Math.abs(best.delta))
      ) {
        best = { delta, guide: target };
      }
    }
  }
  return best
    ? { value: start + best.delta, guide: best.guide }
    : { value: start, guide: null };
}

/**
 * Snaps a moving rectangle to the canvas edges/center and to the edges and
 * centers of the other layers. Returns the adjusted position and the guides
 * to draw.
 */
export function snapMove(
  rect: Rect,
  others: Rect[],
  canvas: { width: number; height: number },
  threshold = SNAP_THRESHOLD,
): { x: number; y: number; guides: Guide[] } {
  const xTargets = [0, canvas.width / 2, canvas.width];
  const yTargets = [0, canvas.height / 2, canvas.height];
  for (const o of others) {
    xTargets.push(o.x, o.x + o.width / 2, o.x + o.width);
    yTargets.push(o.y, o.y + o.height / 2, o.y + o.height);
  }
  const sx = snapAxis(rect.x, rect.width, xTargets, threshold);
  const sy = snapAxis(rect.y, rect.height, yTargets, threshold);
  const guides: Guide[] = [];
  if (sx.guide !== null) guides.push({ axis: 'x', position: sx.guide });
  if (sy.guide !== null) guides.push({ axis: 'y', position: sy.guide });
  return { x: sx.value, y: sy.value, guides };
}
