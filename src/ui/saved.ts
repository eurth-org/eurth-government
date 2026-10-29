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

const key = 'governmint:saved';

export function loadSaved(): Saved[] {
  try {
    const list = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(list) ? list : [];
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
