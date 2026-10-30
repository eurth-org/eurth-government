/**
 * Whether what keeps moving on its own does: the footer's hearts, which beat every few seconds.
 * They do, unless the visitor stops them in About (the pause WCAG 2.2.2 asks for) or prefers
 * reduced motion.
 */
const key = 'governmint:motion';

function stored(): boolean {
  try {
    return localStorage.getItem(key) !== 'still';
  } catch {
    return true;
  }
}

export const motion = $state({ on: stored() });

export function setMotion(on: boolean) {
  motion.on = on;
  try {
    if (on) localStorage.removeItem(key);
    else localStorage.setItem(key, 'still');
  } catch {
    // Private mode: the choice lasts for this visit.
  }
}
