/**
 * Whether the Eurth globe keeps turning. It does, unless the visitor stops it in About (the
 * pause WCAG 2.2.2 asks for, for anything that moves on its own) or prefers reduced motion.
 */
const key = 'governmint:globe';

function stored(): boolean {
  try {
    return localStorage.getItem(key) !== 'still';
  } catch {
    return true;
  }
}

export const motion = $state({ globe: stored() });

export function setGlobe(on: boolean) {
  motion.globe = on;
  try {
    if (on) localStorage.removeItem(key);
    else localStorage.setItem(key, 'still');
  } catch {
    // Private mode: the choice lasts for this visit.
  }
}
