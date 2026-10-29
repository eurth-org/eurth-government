import { describe as group, expect, it } from 'vitest';
import { countries } from './countries';
import { describe } from './engine';

const named = (name: string) => describe(countries.find((c) => c.name === name)!.country);

group('real countries', () => {
  it('cover the UN members plus Kosovo, Palestine, Taiwan and Vatican City, once each', () => {
    expect(countries.length).toBeGreaterThanOrEqual(196);
    expect(new Set(countries.map((c) => c.code)).size).toBe(countries.length);
    expect(new Set(countries.map((c) => c.name)).size).toBe(countries.length);
  });

  it('have no contradictions, except countries noted as in transition', () => {
    for (const c of countries.filter((c) => !c.note)) {
      const conflicts = describe(c.country).checks.filter((x) => x.severity === 'conflict');
      expect(conflicts.map((x) => x.id), c.name).toEqual([]);
    }
  });

  it('get the familiar names', () => {
    const expected: Record<string, string> = {
      'United Kingdom': 'Unitary parliamentary constitutional monarchy',
      'United States': 'Federal presidential republic',
      France: 'Unitary semi-presidential republic',
      Germany: 'Federal parliamentary republic',
      Switzerland: 'Federal directorial republic',
      China: 'Unitary one-party republic',
      'North Korea': 'Unitary one-party hereditary republic',
      'Saudi Arabia': 'Unitary absolute monarchy',
      Iran: 'Unitary presidential theocratic republic',
      'Vatican City': 'Unitary elective theocracy',
      Malaysia: 'Federal parliamentary elective constitutional monarchy',
      'South Africa': 'Unitary parliamentary republic',
      Japan: 'Unitary parliamentary constitutional monarchy',
      India: 'Federal parliamentary republic',
      Russia: 'Federal semi-presidential republic',
      Mexico: 'Federal presidential republic',
    };
    for (const [name, government] of Object.entries(expected)) expect(named(name).name, name).toBe(government);
  });

  it('get the familiar regimes', () => {
    expect(named('Germany').labels.regime.label).toBe('Liberal democracy');
    expect(named('Russia').labels.regime.label).toBe('Electoral autocracy');
    expect(named('Saudi Arabia').labels.regime.label).toBe('Closed autocracy');
    expect(named('China').labels.regime.label).toBe('One-party state');
    expect(named('Mali').labels.regime.label).toBe('Military dictatorship');
    expect(named('Iran').labels.regime.label).toBe('Theocracy');
  });
});
