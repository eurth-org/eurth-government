// Governmint and the nation's profile file: it writes the government section and leaves every
// other section, known or not, exactly as it was.
import { getSection, parseProfile, serialiseProfile, validateProfile, type EurthProfile } from '@eurth/profile';
import calderwyn from '@eurth/profile/examples/calderwyn.eurth.json' with { type: 'json' };
import { describe as group, expect, it } from 'vitest';
import { defaultCountry, describe } from '../src/model/engine';
import { examples } from '../src/model/examples';
import { writeLink } from '../src/model/link';
import { fromProfile, withGovernment } from '../src/model/profile';

const now = new Date('2026-11-15T12:00:00.000Z');
const kingdom = examples.find((e) => /monarch/i.test(describe(e.country).name))!.country;
const link = (country = kingdom, name = 'Calderwyn') => writeLink('https://gov.eurth.org/', country, name);
const loaded = calderwyn as unknown as EurthProfile;

group('saving the profile', () => {
  it('needs a name: a profile has to know whose it is', () => {
    expect(withGovernment(null, '  ', kingdom, describe(kingdom), link(), now)).toBeNull();
  });

  it('starts a new profile with the name and the government section, and nothing else', () => {
    const made = withGovernment(null, 'Orioni', kingdom, describe(kingdom), link(kingdom, 'Orioni'), now)!;
    expect(Object.keys(made)).toEqual(['meta', 'government']);
    expect(made.meta.nation).toBe('Orioni');
    expect(validateProfile(made).ok).toBe(true);
    const government = getSection(made, 'government')!;
    expect(government.link).toBe(link(kingdom, 'Orioni'));
    expect(government.form).toBe(describe(kingdom).name);
    expect(government.headOfState).toBe('Monarch');
    expect(government.summary).toContain('Orioni is a');
    expect(parseProfile(serialiseProfile(made)).ok).toBe(true);
  });

  it('leaves every other section exactly as it was, unknown ones too', () => {
    const before = { ...loaded, moonbase: { crew: 12, nested: { deep: [1, 2, 3] } } } as EurthProfile;
    const after = withGovernment(before, before.meta.nation, kingdom, describe(kingdom), link(), now)!;
    for (const key of Object.keys(before)) {
      if (key === 'meta' || key === 'government') continue;
      expect((after as Record<string, unknown>)[key], key).toBe((before as Record<string, unknown>)[key]);
    }
    expect(Object.keys(after)).toEqual(Object.keys(before));
    expect(after.meta.nation).toBe(before.meta.nation);
    expect(validateProfile(after).ok).toBe(true);
  });

  it('keeps fields in its own section that it does not know, and drops offices the country no longer has', () => {
    const before = { ...loaded, government: { ...loaded.government, cabinet: 'Twelve ministers', headOfGovernment: 'Prime Minister X', legislature: 'Old Moot' } } as EurthProfile;
    const alone = { ...defaultCountry(), government: 'head-of-state', legislature: 'none' } as typeof kingdom;
    const government = getSection(withGovernment(before, 'Calderwyn', alone, describe(alone), link(alone), now)!, 'government')!;
    expect(government.cabinet).toBe('Twelve ministers');
    expect(government.headOfGovernment).toBeUndefined();
    expect(government.legislature).toBeUndefined();
  });

  it('keeps every field within the profile’s limits, whatever the country', () => {
    for (const { country } of examples) {
      const made = withGovernment(null, 'N'.repeat(200), country, describe(country), link(country, 'N'.repeat(60)), now)!;
      expect(validateProfile(made).ok, describe(country).name).toBe(true);
    }
  });
});

group('loading the profile', () => {
  it('opens the country its government link holds, under the profile’s own name', () => {
    const saved = withGovernment(null, 'Orioni', kingdom, describe(kingdom), link(kingdom, 'Orioni'), now)!;
    expect(fromProfile(saved, 'gov.eurth.org')).toEqual({ country: kingdom, name: 'Orioni', flag: undefined });
  });

  it('opens nothing from a link that is not Governmint’s own', () => {
    const elsewhere = (href: string) => fromProfile({ ...loaded, government: { link: href } } as EurthProfile, 'gov.eurth.org');
    expect(elsewhere('https://evil.example/?c=3abc')).toBeNull();
    expect(elsewhere('https://gov.eurth.org.evil.example/?c=3abc')).toBeNull();
    expect(elsewhere('https://gov.eurth.org/')).toBeNull();
    expect(elsewhere('not a link')).toBeNull();
    expect(fromProfile({ meta: loaded.meta } as EurthProfile, 'gov.eurth.org')).toBeNull();
  });

  it('reads the example profiles without complaint', () => {
    expect(() => fromProfile(loaded, 'gov.eurth.org')).not.toThrow();
  });
});
