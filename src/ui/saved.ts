/**
 * Countries saved on this device, newest first. They live in the browser's storage only, so
 * they stay on this device; the link is what travels.
 */
export interface Saved {
  name: string;
  code: string;
  flag?: string;
  government: string;
  at: string;
}

import { cleanName } from '../model/text';

const key = 'governmint:saved';

/** One saved entry as read back from storage, which anyone with the browser could have edited. */
function checked(entry: unknown): Saved | null {
  if (!entry || typeof entry !== 'object') return null;
  const e = entry as Record<string, unknown>;
  if (typeof e.name !== 'string' || typeof e.code !== 'string' || e.code.length > 200) return null;
  return {
    name: cleanName(e.name),
    code: e.code,
    flag: typeof e.flag === 'string' && /^[a-z]{2}$/.test(e.flag) ? e.flag : undefined,
    government: typeof e.government === 'string' ? e.government.slice(0, 120) : '',
    at: typeof e.at === 'string' && !Number.isNaN(Date.parse(e.at)) ? e.at : new Date(0).toISOString(),
  };
}

export function loadSaved(): Saved[] {
  try {
    const list = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(list) ? list.map(checked).filter((e): e is Saved => e !== null).slice(0, 30) : [];
  } catch {
    return [];
  }
}

export function save(entry: Saved): Saved[] {
  const list = [entry, ...loadSaved().filter((s) => !(s.name === entry.name && s.code === entry.code))].slice(0, 30);
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Private mode or full storage: the link still works.
  }
  return list;
}

export function forget(entry: Saved): Saved[] {
  const list = loadSaved().filter((s) => !(s.name === entry.name && s.code === entry.code));
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Nothing to do.
  }
  return list;
}
