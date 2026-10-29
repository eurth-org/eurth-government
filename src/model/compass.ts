import type { AxisId } from './axes';
import type { AxisScore } from './engine';

/**
 * A two-way compass built from the axes. Up is authoritarian, down libertarian; until the
 * economy settings exist, left and right are cultural: progressive on the left, traditional
 * on the right. Both run from -100 to 100.
 */
export const compassAxes = {
  x: {
    low: 'Progressive',
    high: 'Traditional',
    from: [
      { axis: 'religion', reversed: false },
      { axis: 'openness', reversed: true },
    ],
  },
  y: {
    low: 'Libertarian',
    high: 'Authoritarian',
    from: [
      { axis: 'participation', reversed: true },
      { axis: 'competition', reversed: true },
      { axis: 'checks', reversed: true },
    ],
  },
} as const satisfies Record<'x' | 'y', { low: string; high: string; from: readonly { axis: AxisId; reversed: boolean }[] }>;

export const quadrants = {
  topLeft: 'Authoritarian progressive',
  topRight: 'Authoritarian traditional',
  bottomLeft: 'Libertarian progressive',
  bottomRight: 'Libertarian traditional',
};

function position(scores: AxisScore[], from: readonly { axis: AxisId; reversed: boolean }[]): number {
  const values = from.map(({ axis, reversed }) => {
    const score = scores.find((s) => s.axis === axis)!.score;
    return reversed ? 100 - score : score;
  });
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(mean * 2 - 100);
}

export function compassPoint(scores: AxisScore[]): { x: number; y: number } {
  return { x: position(scores, compassAxes.x.from), y: position(scores, compassAxes.y.from) };
}
