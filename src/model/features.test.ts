import { describe as group, expect, it } from 'vitest';
import { compassPoint } from './compass';
import { defaultCountry, describe, scoreAxes } from './engine';
import { examples } from './examples';
import { article, budgetJson, budgetMarkdown, sentence, summary, toJson, toMarkdown, toWikitext } from './formats';
import { suggest } from './suggest';
import { motto } from './motto';
import { randomCountry } from './random';
import { budgetTotal } from './budget';
import { families, type LabelRule } from './naming';
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

  it('choose a or an by sound', () => {
    expect(article('unitary state')).toBe('a unitary state');
    expect(article('one-party state')).toBe('a one-party state');
    expect(article('electoral autocracy')).toBe('an electoral autocracy');
    expect(article('absolute monarchy')).toBe('an absolute monarchy');
    expect(article('federal republic')).toBe('a federal republic');
  });

  it('explain the regime in one sentence', () => {
    expect(sentence('Ruritania', profile)).toBe(
      'Ruritania is a liberal democracy: free elections, competing parties and independent courts keep those in power in check.',
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

group('random countries', () => {
  it('hold together and add up', () => {
    let seed = 1;
    const next = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 50; i++) {
      const c = randomCountry(next);
      const checks = describe(c).checks;
      expect(checks.filter((x) => x.severity === 'conflict')).toEqual([]);
      expect(checks.length).toBeLessThanOrEqual(1);
      expect(budgetTotal(c)).toBe(100);
    }
  });
});

group('mottos', () => {
  it('cover every regime, and stay the same for the same country', () => {
    const profile = describe(byId('american'));
    expect(motto(profile, 'abc')).toBe(motto(profile, 'abc'));
    for (const rule of families.regime as readonly LabelRule[]) {
      const fake = { ...profile, labels: { ...profile.labels, regime: { ...profile.labels.regime, rule: rule.id } } };
      expect(motto(fake, 'x').length).toBeGreaterThan(3);
    }
  });
});

group('fictional names for Random', () => {
  it('are unique, credited, and not real countries', async () => {
    const { fictionalNames } = await import('./names');
    const { countries } = await import('./countries');
    const names = fictionalNames.map((n) => n.name);
    expect(new Set(names).size).toBe(names.length);
    for (const n of fictionalNames) expect(n.from.length).toBeGreaterThan(3);
    const real = new Set(countries.map((c) => c.name.toLowerCase()));
    expect(names.filter((n) => real.has(n.toLowerCase()))).toEqual([]);
  });
});

group('JSON export', () => {
  it('holds the profile and the raw settings', () => {
    const country = defaultCountry();
    const profile = describe(country);
    const data = JSON.parse(toJson('Ruritania', country, profile, 'https://gov.eurth.org/?c=x'));
    expect(data.name).toBe('Ruritania');
    expect(data.government).toBe(profile.name);
    expect(Object.values(data.budget as Record<string, number>).reduce((a, b) => a + b, 0)).toBe(100);
    expect(Object.keys(data.scales)).toHaveLength(profile.axes.length);
    expect(data.settings).toEqual(country);
    expect(data.link).toBe('https://gov.eurth.org/?c=x');
  });
});

group('compass as text', () => {
  it('writes a Mermaid quadrant chart and JSON', async () => {
    const { compassJson, compassMarkdown } = await import('./compassText');
    const scores = describe(defaultCountry()).axes;
    const md = compassMarkdown('Ruritania: the Kingdom', scores, 'examples', 'https://gov.eurth.org/?c=x');
    expect(md).toContain('```mermaid\nquadrantChart');
    expect(md).toContain('    Ruritania the Kingdom: [');
    for (const point of md.matchAll(/: \[([\d.]+), ([\d.]+)\]/g)) {
      expect(Number(point[1])).toBeGreaterThanOrEqual(0);
      expect(Number(point[2])).toBeLessThanOrEqual(1);
    }
    const data = JSON.parse(compassJson('Ruritania', scores, 'none', 'https://gov.eurth.org/?c=x'));
    expect(data.references).toEqual([]);
    expect(data.compass.quadrant).toMatch(/Authoritarian|Libertarian/);
  });
});

group('budget as text', () => {
  it('writes a Mermaid pie chart and JSON', () => {
    const country = defaultCountry();
    const md = budgetMarkdown('Ruritania', country, 'https://gov.eurth.org/?c=x');
    expect(md).toContain('```mermaid\npie showData');
    expect(md).toContain('"Social protection" : 37');
    const data = JSON.parse(budgetJson('Ruritania', country, 'https://gov.eurth.org/?c=x'));
    expect(Object.values(data.budget as Record<string, number>).reduce((a, b) => a + b, 0)).toBe(100);
  });
});

group('text people type', () => {
  it('keeps names clean and short', async () => {
    const { cleanName, nameLimit } = await import('./text');
    expect(cleanName('Ruri‮tania\u0000')).toBe('Ruritania');
    expect(cleanName('x'.repeat(200))).toHaveLength(nameLimit);
    expect(cleanName("Robert'); DROP TABLE countries;--")).toBe("Robert'); DROP TABLE countries;--");
  });

  it('keeps names as plain text in Markdown and wikitext', async () => {
    const { toMarkdown: md, toWikitext: wiki } = await import('./formats');
    const country = defaultCountry();
    const profile = describe(country);
    const name = '<script>alert(1)</script> [link](x) | }} {{Delete';
    const markdown = md(name, country, profile, 'https://gov.eurth.org/?c=x');
    expect(markdown).not.toContain('<script>');
    expect(markdown).toContain('\\[link\\](x) \\|');
    const wikitext = wiki(name, country, profile, 'https://gov.eurth.org/?c=x');
    expect(wikitext).toContain('<nowiki><script>alert(1)</script> [link](x) | }} {{Delete</nowiki>');
    expect(wikitext).not.toMatch(/= <script>/);
  });

  it('makes safe file names', async () => {
    const { fileName } = await import('./text');
    expect(fileName('../../etc/passwd budget')).toBe('....etcpasswd budget');
    expect(fileName('  ')).toBe('governmint');
  });
});
