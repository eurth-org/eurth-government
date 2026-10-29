import { describe, expect, it } from 'vitest';
import { treemap } from './treemap';

describe('treemap', () => {
  const values = [37, 15, 13, 12, 10, 4, 3, 3, 2, 1];
  const tiles = treemap(values, (v) => v, 0, 0, 440, 220);

  it('gives each item a tile in proportion to its value', () => {
    expect(tiles).toHaveLength(values.length);
    for (const t of tiles) expect(t.w * t.h).toBeCloseTo((t.item / 100) * 440 * 220, 6);
  });

  it('stays inside the rectangle, without overlaps', () => {
    for (const t of tiles) {
      expect(t.x).toBeGreaterThanOrEqual(-1e-9);
      expect(t.y).toBeGreaterThanOrEqual(-1e-9);
      expect(t.x + t.w).toBeLessThanOrEqual(440 + 1e-9);
      expect(t.y + t.h).toBeLessThanOrEqual(220 + 1e-9);
    }
    for (const a of tiles)
      for (const b of tiles) {
        if (a === b) continue;
        const overlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 1e-6 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 1e-6;
        expect(overlap).toBe(false);
      }
  });

  it('leaves out empty items', () => {
    expect(treemap([0, 5, 0], (v) => v, 0, 0, 10, 10)).toHaveLength(1);
    expect(treemap([0, 0], (v) => v, 0, 0, 10, 10)).toHaveLength(0);
  });
});
