import { defaultCountry, picked } from './engine';
import { budgetTotal } from './budget';
import { budgetIds, settings, type Country, type SettingId } from './settings';
import { cleanName } from './text';
import type { SettingDef } from './types';

/**
 * A country lives in its link, in the query string (so a Worker could read it one day):
 *
 *   https://gov.eurth.org/?c=31012100100100022010d03040a02010f030c11&n=Orioni&f=be
 *
 * c is the settings code below, and it starts with its version; n is the country's name; f is
 * a real country's flag (its two-letter code). When the settings change shape, raise the
 * version and keep reading the old ones: a link made today must open next year.
 *
 * The code: one base-36 character per setting, in settings order.
 * Pick-one settings store the option's position; pick-many settings store a bitmask
 * of positions (up to 5 options per character, so longer lists take more characters).
 * Budget shares take two base-36 characters each (0 to 100).
 * The leading version number lets the format change without breaking old links.
 */
const version = '3';
const bitsPerChar = 5;

function charsFor(def: SettingDef): number {
  if (def.kind === 'share') return 2;
  return def.kind === 'multi' ? Math.ceil(def.options.length / bitsPerChar) : 1;
}

export function encodeCountry(country: Country): string {
  let code = version;
  for (const def of settings as readonly SettingDef[]) {
    const chosen = picked(country, def.id as SettingId);
    if (def.kind === 'share') {
      code += (country[def.id as SettingId] as number).toString(36).padStart(2, '0');
    } else if (def.kind === 'choice') {
      code += def.options.findIndex((o) => o.id === chosen[0]).toString(36);
    } else {
      let mask = 0;
      def.options.forEach((o, i) => {
        if (chosen.includes(o.id)) mask |= 1 << i;
      });
      for (let c = 0; c < charsFor(def); c++) {
        code += ((mask >> (c * bitsPerChar)) & 0b11111).toString(36);
      }
    }
  }
  return code;
}

/** Reads a code made by encodeCountry. Anything unreadable falls back to the default. */
export function decodeCountry(code: string): Country {
  const country = defaultCountry() as unknown as Record<string, string | string[] | number>;
  if (!code.startsWith(version)) return country as unknown as Country;
  let at = version.length;
  for (const def of settings as readonly SettingDef[]) {
    const width = charsFor(def);
    const chunk = code.slice(at, at + width);
    at += width;
    if (chunk.length < width) break;
    if (def.kind === 'share') {
      const share = parseInt(chunk, 36);
      if (share >= 0 && share <= 100) country[def.id] = share;
    } else if (def.kind === 'choice') {
      const option = def.options[parseInt(chunk, 36)];
      if (option) country[def.id] = option.id;
    } else {
      // Five bits to a character, so each is 0 to v; anything else isn't ours, and the setting
      // keeps its default.
      if (!/^[0-9a-v]+$/.test(chunk)) continue;
      let mask = 0;
      for (let c = 0; c < width; c++) mask |= parseInt(chunk[c]!, 36) << (c * bitsPerChar);
      country[def.id] = def.options.filter((_, i) => mask & (1 << i)).map((o) => o.id);
    }
  }
  // A budget that no longer adds up to 100 is not ours: fall back to the default budget.
  const result = country as unknown as Country;
  return budgetTotal(result) === 100 ? result : { ...result, ...defaultBudget() };
}

function defaultBudget(): Partial<Country> {
  const fresh = defaultCountry();
  return Object.fromEntries(budgetIds.map((b) => [b, fresh[b]]));
}

/** What a link holds: the settings, the name and, for a real country, its flag. */
export interface Linked {
  country: Country;
  name: string;
  flag?: string;
}

/**
 * Reads a link's query string (location.search). A link is someone else's input: the code is
 * read setting by setting and anything unreadable falls back to the default, the name is
 * cleaned and capped, and the flag is two lower-case letters or nothing.
 */
export function readLink(search: string): Linked {
  const params = new URLSearchParams(search);
  const code = params.get('c');
  const flag = params.get('f') ?? '';
  return {
    country: code ? decodeCountry(code) : defaultCountry(),
    name: cleanName(params.get('n') ?? ''),
    flag: /^[a-z]{2}$/.test(flag) ? flag : undefined,
  };
}

/** The link for a country: the page's address (`base`) with the country as its query string. */
export function writeLink(base: string, country: Country, name = '', flag?: string): string {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  url.searchParams.set('c', encodeCountry(country));
  if (name.trim()) url.searchParams.set('n', name.trim());
  if (flag) url.searchParams.set('f', flag);
  return url.toString();
}
