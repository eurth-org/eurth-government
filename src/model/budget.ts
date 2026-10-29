import { budgetIds, type BudgetId, type Country } from './settings';

/**
 * Splits `total` over `weights` in whole numbers that add up exactly to `total`,
 * in proportion to the weights (the largest remainders get the leftover points).
 */
function apportion(weights: number[], total: number): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const exact = sum > 0 ? weights.map((w) => (w / sum) * total) : weights.map(() => total / weights.length);
  const whole = exact.map(Math.floor);
  let left = total - whole.reduce((a, b) => a + b, 0);
  const order = exact.map((e, i) => [e - Math.floor(e), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    whole[i]! += 1;
    left -= 1;
  }
  return whole;
}

/**
 * How far one share can go: the locked shares stay as they are, so it can take at most what they
 * leave, and if every other share is locked, exactly that.
 */
export function shareRange(country: Country, id: BudgetId, locked: readonly BudgetId[] = []): { min: number; max: number } {
  const others = budgetIds.filter((b) => b !== id);
  const fixed = others.filter((b) => locked.includes(b)).reduce((sum, b) => sum + country[b], 0);
  const max = Math.max(0, 100 - fixed);
  return { min: others.every((b) => locked.includes(b)) ? max : 0, max };
}

/**
 * Sets one share and scales the unlocked others in proportion, so the budget still adds up to
 * 100. Locked shares don't move; the share is kept within what they leave (see shareRange).
 */
export function setShare(country: Country, id: BudgetId, value: number, locked: readonly BudgetId[] = []): Country {
  const { min, max } = shareRange(country, id, locked);
  const share = Math.max(min, Math.min(max, Math.round(value)));
  const free = budgetIds.filter((b) => b !== id && !locked.includes(b));
  const rest = apportion(
    free.map((b) => country[b]),
    max - share,
  );
  const next = { ...country, [id]: share };
  free.forEach((b, i) => (next[b] = rest[i]!));
  return next;
}

/** Sets several shares at once and spreads the rest over the others in proportion. */
export function withBudget(country: Country, shares: Partial<Record<BudgetId, number>>): Country {
  const fixed = budgetIds.filter((b) => shares[b] !== undefined);
  const others = budgetIds.filter((b) => shares[b] === undefined);
  const used = fixed.reduce((sum, b) => sum + shares[b]!, 0);
  const rest = apportion(
    others.map((b) => country[b]),
    Math.max(0, 100 - used),
  );
  const next = { ...country };
  fixed.forEach((b) => (next[b] = shares[b]!));
  others.forEach((b, i) => (next[b] = rest[i]!));
  return next;
}

export function budgetTotal(country: Country): number {
  return budgetIds.reduce((sum, b) => sum + country[b], 0);
}
