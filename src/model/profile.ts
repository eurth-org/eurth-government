/**
 * Governmint and the nation's profile file (<nation>.eurth.json, @eurth/profile). Governmint
 * owns the `government` section and nothing else: every other section, known or not, comes out
 * exactly as it went in.
 *
 * The section holds the country's link (which brings the whole country back), a one-line
 * summary, and what another tool would want: the form of government and the offices. Governmint
 * knows offices, not the people in them, so headOfState and headOfGovernment are the titles
 * ("Monarch", "Prime minister") and legislature is its kind ("Elected representatives, two
 * chambers").
 */
import { createProfile, getSection, setNation, setSection, type EurthProfile } from '@eurth/profile';
import type { Profile } from './engine';
import { governmentTitles, leaderTitles, summary } from './formats';
import { readLink, type Linked } from './link';
import { settings, type Country } from './settings';
import { cleanName } from './text';

const cut = (text: string, max = 80) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

function legislature(country: Country): string | undefined {
  if (country.legislature === 'none') return undefined;
  const kind = settings.find((s) => s.id === 'legislature')?.options.find((o) => o.id === country.legislature)?.label;
  return kind ? cut(`${kind}, ${country.chambers === 'two' ? 'two chambers' : 'one chamber'}`) : undefined;
}

/**
 * The profile to save: `base` (a loaded profile, or none) with Governmint's section written
 * and the nation's name set. Null without a name: a profile needs to know whose it is.
 */
export function withGovernment(
  base: EurthProfile | null,
  nation: string,
  country: Country,
  profile: Profile,
  link: string,
  now: Date = new Date(),
): EurthProfile | null {
  const name = nation.trim();
  if (!name) return null;
  const named = base ? (base.meta.nation === name ? base : setNation(base, name, { now })) : createProfile(name, { now });
  // The old section first, so fields a newer Governmint may have added are kept; then ours.
  // An office this country doesn't have is taken out, not left over from the last one.
  const { headOfGovernment: _g, legislature: _l, ...kept } = { ...getSection(named, 'government') };
  const second = governmentTitles[country.government];
  const house = legislature(country);
  return setSection(
    named,
    'government',
    {
      ...kept,
      link,
      summary: cut(summary(name, profile), 600),
      form: cut(profile.name),
      headOfState: leaderTitles[country.headOfState] ?? 'Head of state',
      ...(second && { headOfGovernment: second }),
      ...(house && { legislature: house }),
    },
    { now },
  );
}

/**
 * The country in a loaded profile, if its government section links to Governmint: the link is
 * read as any link is (checked and clamped), and only when it points at this site. The name is
 * the profile's own; the flag stays only if the link was made for that same name.
 */
export function fromProfile(profile: EurthProfile, host: string): Linked | null {
  const nation = cleanName(profile.meta.nation ?? '');
  const link = getSection(profile, 'government')?.link;
  if (typeof link !== 'string') return null;
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.host !== host || !url.searchParams.get('c')) return null;
  const linked = readLink(url.search);
  return { country: linked.country, name: nation || linked.name, flag: !nation || linked.name === nation ? linked.flag : undefined };
}
