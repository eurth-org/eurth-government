import type { Country, OptionId, SettingDefOf, SettingId } from './settings';

/** Tests for a pick-one setting: one option, any of a list, or anything except. */
type ChoiceTest<V extends string> = V | readonly V[] | { readonly not: V | readonly V[] };

/** Tests for a pick-many setting. `empty: false` means at least one is picked. */
type MultiTest<V extends string> =
  | { readonly any: readonly V[] }
  | { readonly none: readonly V[] }
  | { readonly empty: boolean };

/** Tests for a budget share, in percent: strictly above or below. */
type ShareTest = { readonly above?: number; readonly below?: number };

type Test<Id extends SettingId> =
  SettingDefOf<Id> extends { kind: 'multi' }
    ? MultiTest<OptionId<Id>>
    : SettingDefOf<Id> extends { kind: 'share' }
      ? ShareTest
      : ChoiceTest<OptionId<Id>>;

type SettingTests = { readonly [Id in SettingId]?: Test<Id> };

interface Combinators {
  readonly allOf?: readonly Condition[];
  readonly anyOf?: readonly Condition[];
  readonly noneOf?: readonly Condition[];
}

/**
 * When a rule applies. Every test listed must hold; `{}` always holds.
 * Example: `{ headOfState: 'monarch', government: ['pm-legislature', 'council'] }`.
 */
export type Condition = SettingTests & Combinators;

type AnyTest =
  | string
  | readonly string[]
  | { readonly not: string | readonly string[] }
  | { readonly any: readonly string[] }
  | { readonly none: readonly string[] }
  | { readonly empty: boolean }
  | ShareTest;

const combinators = new Set<string>(['allOf', 'anyOf', 'noneOf']);

function isList(value: unknown): value is readonly string[] {
  return Array.isArray(value);
}

function asList(value: string | readonly string[]): readonly string[] {
  return isList(value) ? value : [value];
}

function passes(test: AnyTest, value: string | readonly string[] | number): boolean {
  if (typeof value === 'number') {
    if (typeof test !== 'object' || isList(test) || !('above' in test || 'below' in test)) {
      throw new Error(`Test ${JSON.stringify(test)} doesn't fit a budget share`);
    }
    return (test.above === undefined || value > test.above) && (test.below === undefined || value < test.below);
  }
  if (!isList(value)) {
    if (typeof test === 'string') return value === test;
    if (isList(test)) return test.includes(value);
    if ('not' in test) return !asList(test.not).includes(value);
    throw new Error(`Test ${JSON.stringify(test)} doesn't fit a pick-one setting`);
  }
  if (typeof test === 'string' || isList(test)) {
    throw new Error(`Test ${JSON.stringify(test)} doesn't fit a pick-many setting`);
  }
  if ('any' in test) return test.any.some((v) => value.includes(v));
  if ('none' in test) return !test.none.some((v) => value.includes(v));
  if ('empty' in test) return (value.length === 0) === test.empty;
  throw new Error(`Test ${JSON.stringify(test)} doesn't fit a pick-many setting`);
}

export function matches(condition: Condition, country: Country): boolean {
  if (condition.allOf && !condition.allOf.every((c) => matches(c, country))) return false;
  if (condition.anyOf && !condition.anyOf.some((c) => matches(c, country))) return false;
  if (condition.noneOf && condition.noneOf.some((c) => matches(c, country))) return false;
  for (const [id, test] of Object.entries(condition)) {
    if (combinators.has(id) || test === undefined) continue;
    if (!passes(test as AnyTest, country[id as SettingId])) return false;
  }
  return true;
}

/** The settings a condition looks at, in the order it mentions them. */
export function dependsOn(condition: Condition): SettingId[] {
  const ids = new Set<SettingId>();
  const visit = (c: Condition) => {
    for (const [key, value] of Object.entries(c)) {
      if (combinators.has(key)) (value as readonly Condition[]).forEach(visit);
      else ids.add(key as SettingId);
    }
  };
  visit(condition);
  return [...ids];
}
