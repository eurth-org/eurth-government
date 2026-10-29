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

/** Sets one share and scales the others in proportion, so the budget still adds up to 100. */
export function setShare(country: Country, id: BudgetId, value: number): Country {
  const share = Math.max(0, Math.min(100, Math.round(value)));
  const others = budgetIds.filter((b) => b !== id);
  const rest = apportion(
    others.map((b) => country[b]),
    100 - share,
  );
  const next = { ...country, [id]: share };
  others.forEach((b, i) => (next[b] = rest[i]!));
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
