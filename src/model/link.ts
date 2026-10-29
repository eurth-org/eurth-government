import { defaultCountry, picked } from './engine';
import { settings, type Country, type SettingId } from './settings';
import type { SettingDef } from './types';

/**
 * A country in a link: one base-36 character per setting, in settings order.
 * Pick-one settings store the option's position; pick-many settings store a bitmask
 * of positions (up to 5 options per character, so longer lists take more characters).
 * The leading version number lets the format change without breaking old links.
 */
const version = '1';
const bitsPerChar = 5;

function charsFor(def: SettingDef): number {
  return def.kind === 'multi' ? Math.ceil(def.options.length / bitsPerChar) : 1;
}

export function encodeCountry(country: Country): string {
  let code = version;
  for (const def of settings as readonly SettingDef[]) {
    const chosen = picked(country, def.id as SettingId);
    if (def.kind === 'choice') {
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
  const country = defaultCountry() as Record<string, string | string[]>;
  if (!code.startsWith(version)) return country as Country;
  let at = version.length;
  for (const def of settings as readonly SettingDef[]) {
    const width = charsFor(def);
    const chunk = code.slice(at, at + width);
    at += width;
    if (chunk.length < width) break;
    if (def.kind === 'choice') {
      const option = def.options[parseInt(chunk, 36)];
      if (option) country[def.id] = option.id;
    } else {
      let mask = 0;
      for (let c = 0; c < width; c++) mask |= parseInt(chunk[c] ?? '0', 36) << (c * bitsPerChar);
      if (!Number.isNaN(mask)) country[def.id] = def.options.filter((_, i) => mask & (1 << i)).map((o) => o.id);
    }
  }
  return country as Country;
}
