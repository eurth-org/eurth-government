// A country lives in its link. A link made on the live site must open the same country for
// good, so a set of links in the live format (made on 15 November 2026, before Governmint
// moved onto the shared shell) is frozen in fixtures/live-links.json and read back here.
import { readFileSync } from 'node:fs';
import { describe as group, expect, it } from 'vitest';
import { defaultCountry } from '../src/model/engine';
import { encodeCountry, readLink, writeLink } from '../src/model/link';
import type { Country } from '../src/model/settings';
import { nameLimit } from '../src/model/text';

interface Row {
  link: string;
  name: string;
  flag: string | null;
  country: Country;
}
const live: Row[] = JSON.parse(readFileSync(new URL('./fixtures/live-links.json', import.meta.url), 'utf8'));

group('a link made on the live site', () => {
  it.each(live)('still opens the same country: $link', ({ link, name, flag, country }) => {
    const read = readLink(new URL(link).search);
    expect(read.country).toEqual(country);
    expect(read.name).toBe(name);
    expect(read.flag ?? null).toBe(flag);
  });

  it.each(live)('is written today exactly as it was: $link', ({ link, name, flag, country }) => {
    expect(writeLink('https://gov.eurth.org/', country, name, flag ?? undefined)).toBe(link);
  });
});

group('the link format', () => {
  it('is in the query string, and its settings code starts with its version', () => {
    const url = new URL(writeLink('https://gov.eurth.org/', defaultCountry(), 'Orioni'));
    expect(url.hash).toBe('');
    expect(url.searchParams.get('c')).toMatch(/^3[0-9a-z]+$/);
    expect(url.searchParams.get('n')).toBe('Orioni');
    expect(encodeCountry(defaultCountry())[0]).toBe('3');
  });

  it("drops whatever else was in the page's address", () => {
    expect(writeLink('http://localhost:4321/?x=1#top', defaultCountry())).toBe(`http://localhost:4321/?c=${encodeCountry(defaultCountry())}`);
  });
});

group('a link is someone else’s input', () => {
  it('gives the default country for nothing, for nonsense and for a version it does not know', () => {
    for (const search of ['', '?c=', '?c=zzzzzzzz', '?c=1abc', '?c=9' + '0'.repeat(40), '?c=%00%ff', `?c=3${'!'.repeat(60)}`]) {
      expect(readLink(search).country, search).toEqual(defaultCountry());
    }
  });

  it('never throws, and never gives a budget that does not add up', () => {
    const full = encodeCountry(defaultCountry());
    for (let cut = 1; cut < full.length; cut++) {
      const country = readLink(`?c=${full.slice(0, cut)}`).country;
      const total = Object.entries(country)
        .filter(([key]) => key.startsWith('budget'))
        .reduce((sum, [, share]) => sum + (share as number), 0);
      expect(total, `cut at ${cut}`).toBe(100);
    }
    expect(() => readLink(`?c=3${'z'.repeat(5000)}`)).not.toThrow();
  });

  it('cleans and caps the name, and takes a flag only as two lower-case letters', () => {
    expect(readLink(`?n=${'x'.repeat(500)}`).name).toHaveLength(nameLimit);
    expect(readLink(`?n=${encodeURIComponent('Ori‮oni\u0000')}`).name).toBe('Orioni');
    expect(readLink('?f=be').flag).toBe('be');
    for (const flag of ['BE', 'b', 'bel', '../', '%3Cb']) expect(readLink(`?f=${flag}`).flag, flag).toBeUndefined();
  });
});
