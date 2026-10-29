import { describe as group, expect, it } from 'vitest';
import { axes } from './axes';
import { checks } from './checks';
import { dependsOn, matches, type Condition } from './conditions';
import { budgetTotal, setShare, withBudget } from './budget';
import { defaultCountry, describe, fill, scoreAxes } from './engine';
import { examples } from './examples';
import { decodeCountry, encodeCountry } from './link';
import { families, type LabelRule } from './naming';
import { budgetIds, settings, type Country, type SettingId } from './settings';
import type { SettingDef } from './types';

const defs = settings as readonly SettingDef[];
const axisIds = new Set<string>(axes.map((a) => a.id));
const allRules = Object.entries(families).flatMap(([family, rules]) =>
  (rules as readonly LabelRule[]).map((rule) => ({ family, rule })),
);

function country(changes: Partial<Country>): Country {
  return { ...defaultCountry(), ...changes };
}

/** Every setting and option a condition mentions must exist. */
function checkCondition(condition: Condition, where: string) {
  for (const [key, test] of Object.entries(condition)) {
    if (key === 'allOf' || key === 'anyOf' || key === 'noneOf') {
      (test as Condition[]).forEach((c) => checkCondition(c, where));
      continue;
    }
    const def = defs.find((d) => d.id === key);
    expect(def, `${where}: unknown setting "${key}"`).toBeDefined();
    if (def!.kind === 'share') {
      expect(Object.keys(test as object).every((k) => k === 'above' || k === 'below'), where).toBe(true);
      continue;
    }
    const values: string[] =
      typeof test === 'string'
        ? [test]
        : Array.isArray(test)
          ? test
          : ['not' in test ? [test.not].flat() : [], 'any' in test ? test.any : [], 'none' in test ? test.none : []].flat();
    for (const value of values) {
      expect(def!.options.some((o) => o.id === value), `${where}: "${key}" has no option "${value}"`).toBe(true);
    }
  }
}

/** A small seeded random generator, so failures are repeatable. */
function random(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };
}

function randomCountry(next: () => number): Country {
  const raw = Object.fromEntries(
    defs.map((d) =>
      d.kind === 'share'
        ? [d.id, Math.floor(next() * 30)]
        : d.kind === 'choice'
          ? [d.id, d.options[Math.floor(next() * d.options.length)]!.id]
          : [d.id, d.options.filter(() => next() < 0.25).map((o) => o.id)],
    ),
  ) as Country;
  return withBudget(raw, {});
}

group('settings', () => {
  it('have unique ids, and unique option ids within each setting', () => {
    expect(new Set(defs.map((d) => d.id)).size).toBe(defs.length);
    for (const d of defs) expect(new Set(d.options.map((o) => o.id)).size, d.id).toBe(d.options.length);
  });

  it('default to options that exist, and a budget that adds up to 100', () => {
    expect(budgetTotal(defaultCountry())).toBe(100);
    for (const d of defs) {
      if (d.kind === 'share') continue;
      const defaults = d.kind === 'choice' ? [d.default] : d.default;
      for (const value of defaults) expect(d.options.some((o) => o.id === value), `${d.id}: ${value}`).toBe(true);
    }
  });

  it('push only known axes, by -2 to 2', () => {
    for (const d of defs) {
      for (const o of d.options) {
        for (const [axis, value] of Object.entries(o.axes ?? {})) {
          expect(axisIds.has(axis), `${d.id}.${o.id}: unknown axis ${axis}`).toBe(true);
          expect(Math.abs(value)).toBeLessThanOrEqual(2);
        }
      }
    }
  });

  it('end every sentence with a full stop', () => {
    for (const d of defs) {
      expect(d.question.endsWith('?'), d.id).toBe(true);
      if (d.kind === 'share') expect(d.help.endsWith('.'), d.id).toBe(true);
      for (const o of d.options) expect(o.help.endsWith('.'), `${d.id}.${o.id}`).toBe(true);
    }
  });
});

group('naming rules', () => {
  it('have unique ids within each family', () => {
    for (const rules of Object.values(families)) {
      const ids = (rules as readonly LabelRule[]).map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('link every label to a Wikipedia article', () => {
    for (const { family, rule } of allRules) expect(rule.wiki.trim(), `${family}.${rule.id}`).not.toBe('');
  });

  it('call free elections with restricted candidacy a restricted democracy', () => {
    const profile = describe(country({ rulers: 'military' }));
    expect(profile.labels.regime.label).toBe('Restricted democracy');
    expect(profile.labels.regime.because).toBe('Elections are free, but only military officers may hold high office.');
  });

  it('end each family with a rule that always matches', () => {
    for (const [family, rules] of Object.entries(families)) {
      const last = (rules as readonly LabelRule[]).at(-1)!;
      expect(Object.keys(last.when), family).toEqual([]);
    }
  });

  it('only mention settings and options that exist', () => {
    for (const { family, rule } of allRules) checkCondition(rule.when, `${family}.${rule.id}`);
    for (const check of checks) checkCondition(check.when, `check ${check.id}`);
  });

  it('only use placeholders for settings that exist', () => {
    const texts = [...allRules.map(({ rule }) => rule.because), ...checks.map((c) => c.message)];
    for (const text of texts) {
      for (const [, id] of text.matchAll(/\{(\w+)\}/g)) {
        expect(defs.some((d) => d.id === id), `${text}: no setting "${id}"`).toBe(true);
      }
    }
  });
});

group('conditions', () => {
  const base = country({ headOfState: 'monarch', suffrageLimits: ['sex'] });

  it('match one option, a list of options, or anything except', () => {
    expect(matches({ headOfState: 'monarch' }, base)).toBe(true);
    expect(matches({ headOfState: ['president', 'council'] }, base)).toBe(false);
    expect(matches({ headOfState: { not: 'president' } }, base)).toBe(true);
    expect(matches({ headOfState: { not: ['monarch'] } }, base)).toBe(false);
  });

  it('match pick-many settings', () => {
    expect(matches({ suffrageLimits: { any: ['sex', 'property'] } }, base)).toBe(true);
    expect(matches({ suffrageLimits: { none: ['sex'] } }, base)).toBe(false);
    expect(matches({ suffrageLimits: { empty: false } }, base)).toBe(true);
    expect(matches({ suffrageLimits: { empty: true } }, country({ suffrageLimits: [] }))).toBe(true);
    expect(matches({ suffrageLimits: { empty: true } }, defaultCountry())).toBe(false);
  });

  it('combine with allOf, anyOf and noneOf', () => {
    expect(matches({ anyOf: [{ headOfState: 'president' }, { headOfState: 'monarch' }] }, base)).toBe(true);
    expect(matches({ allOf: [{ headOfState: 'monarch' }, { extent: 'world' }] }, base)).toBe(false);
    expect(matches({ noneOf: [{ extent: 'world' }] }, base)).toBe(true);
  });

  it('list the settings they depend on', () => {
    expect(dependsOn({ elections: 'none', anyOf: [{ headOfStateSelection: 'people' }, { legislature: 'elected' }] })).toEqual(
      ['elections', 'headOfStateSelection', 'legislature'],
    );
  });
});

group('describe', () => {
  it('names the default country', () => {
    const profile = describe(defaultCountry());
    expect(profile.name).toBe('Unitary parliamentary republic');
    expect(profile.labels.regime.label).toBe('Liberal democracy');
    expect(profile.checks).toEqual([]);
  });

  it('fills placeholders with the chosen options', () => {
    const c = country({ suffrageLimits: ['property', 'sex', 'service'] });
    expect(fill('Voting is limited by {suffrageLimits}.', c)).toBe('Voting is limited by property, sex and military service.');
    expect(describe(c).labels.regime.because).toBe(
      'Elections are free, but voting is limited by property, sex and military service.',
    );
  });

  it('flags contradictions', () => {
    const ids = (c: Country) => describe(c).checks.map((x) => x.id);
    expect(ids(country({ legislature: 'none' }))).toContain('no-legislature-to-answer-to');
    expect(ids(country({ elections: 'none' }))).toContain('votes-without-elections');
    expect(ids(country({ rulers: 'party', parties: 'none' }))).toContain('party-rule-without-parties');
    expect(ids(country({ extent: 'world', foreignPolicy: 'expansionist' }))).toContain('world-foreign-policy');
  });

  it('works for thousands of random countries', () => {
    const next = random(42);
    for (let i = 0; i < 3000; i++) {
      const c = randomCountry(next);
      const profile = describe(c);
      expect(profile.name, JSON.stringify(c)).toMatch(/^[A-Z][a-z-]+( [a-z-]+)*$/);
      for (const label of Object.values(profile.labels)) {
        expect(label.because, label.rule).not.toMatch(/[{}]/);
      }
      for (const axis of profile.axes) {
        expect(axis.score).toBeGreaterThanOrEqual(0);
        expect(axis.score).toBeLessThanOrEqual(100);
      }
    }
  });
});

group('axes', () => {
  const score = (c: Country, axis: string) => scoreAxes(c).find((a) => a.axis === axis)!.score;
  const byId = (id: string) => examples.find((e) => e.id === id)!.country;

  it('rank familiar systems sensibly', () => {
    expect(score(byId('swiss'), 'decentralisation')).toBeGreaterThan(score(byId('westminster'), 'decentralisation'));
    expect(score(byId('american'), 'participation')).toBeGreaterThan(score(byId('junta'), 'participation'));
    expect(score(byId('german'), 'competition')).toBeGreaterThan(score(byId('one-party'), 'competition'));
    expect(score(byId('holy-city'), 'religion')).toBeGreaterThan(score(byId('one-party'), 'religion'));
    expect(score(byId('junta'), 'militarism')).toBeGreaterThan(score(byId('world-federation'), 'militarism'));
  });

  it('say which settings moved them', () => {
    const participation = scoreAxes(byId('junta')).find((a) => a.axis === 'participation')!;
    expect(participation.contributions.map((c) => c.setting)).toContain('headOfStateSelection' satisfies SettingId);
  });
});

group('budget', () => {
  it('keeps adding up to 100 when one share changes, scaling the others in proportion', () => {
    const before = defaultCountry();
    const after = setShare(before, 'budgetDefence', 23);
    expect(after.budgetDefence).toBe(23);
    expect(budgetTotal(after)).toBe(100);
    expect(after.budgetSocial).toBeLessThan(before.budgetSocial);
    expect(after.budgetSocial / after.budgetHealth).toBeCloseTo(before.budgetSocial / before.budgetHealth, 0);
    expect(budgetTotal(setShare(before, 'budgetSocial', 100))).toBe(100);
    expect(setShare(before, 'budgetSocial', 100).budgetDefence).toBe(0);
  });

  it('can fix several shares at once', () => {
    const c = withBudget(defaultCountry(), { budgetDefence: 20, budgetHealth: 20 });
    expect([c.budgetDefence, c.budgetHealth, budgetTotal(c)]).toEqual([20, 20, 100]);
  });

  it('moves the militarism and welfare scales', () => {
    const score = (c: Country, axis: string) => scoreAxes(c).find((a) => a.axis === axis)!.score;
    const base = defaultCountry();
    expect(score(setShare(base, 'budgetDefence', 15), 'militarism')).toBeGreaterThan(score(base, 'militarism'));
    expect(score(setShare(base, 'budgetSocial', 60), 'welfare')).toBeGreaterThan(score(base, 'welfare'));
    expect(budgetIds).toHaveLength(10);
  });

  it('flags a pacifist state with a big army', () => {
    const c = setShare(country({ foreignPolicy: 'pacifist' }), 'budgetDefence', 12);
    const check = describe(c).checks.find((x) => x.id === 'pacifist-big-army');
    expect(check?.message).toBe('A state that has given up war spends 12% of its budget on defence.');
  });
});

group('links', () => {
  it('round-trip every example and random countries', () => {
    for (const e of examples) expect(decodeCountry(encodeCountry(e.country))).toEqual(e.country);
    const next = random(7);
    for (let i = 0; i < 500; i++) {
      const c = randomCountry(next);
      expect(decodeCountry(encodeCountry(c))).toEqual(c);
    }
  });

  it('fall back to the default for codes it cannot read', () => {
    expect(decodeCountry('')).toEqual(defaultCountry());
    expect(decodeCountry('9zzzz')).toEqual(defaultCountry());
  });

  it('stay short', () => {
    expect(encodeCountry(defaultCountry()).length).toBeLessThanOrEqual(48);
  });
});
