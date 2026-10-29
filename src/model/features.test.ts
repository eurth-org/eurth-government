import { describe as group, expect, it } from 'vitest';
import { compassPoint } from './compass';
import { defaultCountry, describe, scoreAxes } from './engine';
import { examples } from './examples';
import { summary, toMarkdown, toWikitext } from './formats';
import { suggest } from './suggest';
import type { Country } from './settings';

const byId = (id: string) => examples.find((e) => e.id === id)!.country;
const score = (c: Country, axis: string) => scoreAxes(c).find((a) => a.axis === axis)!.score;

group('suggestions', () => {
  it('move the axis the way asked, biggest first, one per setting', () => {
    const country = defaultCountry();
    for (const direction of [1, -1] as const) {
      const found = suggest(country, 'religion', direction);
      expect(found.length).toBeGreaterThan(0);
      expect(new Set(found.map((s) => s.setting)).size).toBe(found.length);
      for (const s of found) expect(Math.sign(score(s.country, 'religion') - score(country, 'religion'))).toBe(direction);
      const sizes = found.map((s) => Math.abs(s.delta));
      expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
    }
  });

  it('never add a contradiction', () => {
    const country = defaultCountry();
    for (const s of suggest(country, 'participation', -1, 10)) {
      expect(describe(s.country).checks.filter((c) => c.severity === 'conflict')).toEqual([]);
    }
  });
});

group('compass', () => {
  it('puts closed autocracies above democracies, and theocracies right of secular states', () => {
    const junta = compassPoint(scoreAxes(byId('junta')));
    const german = compassPoint(scoreAxes(byId('german')));
    expect(junta.y).toBeGreaterThan(german.y);
    expect(compassPoint(scoreAxes(byId('holy-city'))).x).toBeGreaterThan(compassPoint(scoreAxes(byId('one-party'))).x);
    for (const e of examples) {
      const p = compassPoint(scoreAxes(e.country));
      expect(Math.abs(p.x)).toBeLessThanOrEqual(100);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(100);
    }
  });
});

group('formats', () => {
  const country = byId('american');
  const profile = describe(country);

  it('sum a country up in one sentence', () => {
    expect(summary('Ruritania', profile)).toBe('Ruritania is a federal presidential republic and a liberal democracy.');
    expect(summary('Ruritania', describe(byId('managed')))).toBe(
      'Ruritania is a federal semi-presidential republic and an electoral autocracy.',
    );
  });

  it('make a Markdown table for the forum', () => {
    const md = toMarkdown('Ruritania', country, profile, 'https://gov.eurth.org/?c=x');
    expect(md).toContain('### Ruritania');
    expect(md).toContain('| Head of state | A president, chosen by popular vote |');
    expect(md).toContain('[Governmint](https://gov.eurth.org/?c=x)');
    for (const line of md.split('\n').filter((l) => l.startsWith('|'))) expect(line.split('|').length).toBe(4);
  });

  it('make an infobox and section for the wiki', () => {
    const wiki = toWikitext('Ruritania', country, profile, 'https://gov.eurth.org/?c=x');
    expect(wiki.startsWith('{{Infobox country\n')).toBe(true);
    expect(wiki).toMatch(/\| government_type +\= Federal presidential republic/);
    expect(wiki).toMatch(/\| upper_house +\= /);
    expect(wiki).toContain("'''Ruritania''' is a federal presidential republic and a liberal democracy.");
    expect(wiki).toContain('== Government and politics ==');
    expect(wiki.match(/\{\{/g)?.length).toBe(wiki.match(/\}\}/g)?.length);
  });
});
