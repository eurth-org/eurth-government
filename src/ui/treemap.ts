/**
 * A squarified treemap (Bruls, Huizing and van Wijk): it fills a rectangle with one tile per
 * item, each tile's area in proportion to its value, keeping the tiles as close as it can to
 * `aspect` (width over height): 1 for squares, 2 for tiles twice as wide, which leaves room
 * for a label on one line.
 */
export interface Tile<T> {
  item: T;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function treemap<T>(
  items: readonly T[],
  value: (item: T) => number,
  x: number,
  y: number,
  w: number,
  h: number,
  aspect = 1,
): Tile<T>[] {
  // Lay out squares in a space `aspect` times narrower, then stretch it back.
  if (aspect !== 1) {
    return treemap(items, value, x / aspect, y, w / aspect, h).map((t) => ({ ...t, x: t.x * aspect, w: t.w * aspect }));
  }
  const total = items.reduce((sum, item) => sum + Math.max(0, value(item)), 0);
  if (!total) return [];
  const scale = (w * h) / total;
  let rest = items
    .filter((item) => value(item) > 0)
    .map((item, order) => ({ item, order, area: value(item) * scale }))
    .sort((a, b) => b.area - a.area || a.order - b.order);
  const tiles: Tile<T>[] = [];

  // How far the worst tile in a row strays from square, when the row is laid along `side`.
  const worst = (row: typeof rest, side: number) => {
    const sum = row.reduce((s, r) => s + r.area, 0);
    const max = Math.max(...row.map((r) => r.area));
    const min = Math.min(...row.map((r) => r.area));
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };

  while (rest.length) {
    const side = Math.min(w, h);
    let count = 1;
    while (count < rest.length && worst(rest.slice(0, count + 1), side) <= worst(rest.slice(0, count), side)) count++;
    const row = rest.slice(0, count);
    rest = rest.slice(count);
    const area = row.reduce((s, r) => s + r.area, 0);
    if (w >= h) {
      // A column down the left-hand side.
      const width = area / h;
      let top = y;
      for (const r of row) {
        tiles.push({ item: r.item, x, y: top, w: width, h: r.area / width });
        top += r.area / width;
      }
      x += width;
      w -= width;
    } else {
      // A row across the top.
      const height = area / w;
      let left = x;
      for (const r of row) {
        tiles.push({ item: r.item, x: left, y, w: r.area / height, h: height });
        left += r.area / height;
      }
      y += height;
      h -= height;
    }
  }
  return tiles;
}
