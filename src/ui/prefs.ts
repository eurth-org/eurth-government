/** Single-key shortcuts (E, R, S, /, [ and ]) are on unless the visitor turns them off. */
const key = 'governmint:shortcuts';

export function shortcutsOn(): boolean {
  try {
    return localStorage.getItem(key) !== 'off';
  } catch {
    return true;
  }
}

export function setShortcuts(on: boolean) {
  try {
    if (on) localStorage.removeItem(key);
    else localStorage.setItem(key, 'off');
  } catch {
    // Private mode: the choice lasts for this visit.
  }
}
