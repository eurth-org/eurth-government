import { withBudget } from './budget';
import { defaultCountry, describe } from './engine';
import { settings, type Country } from './settings';
import type { SettingDef } from './types';

/**
 * A random country that holds together: no contradictions, and at most one combination worth
 * a second look. Tries again until it finds one (it nearly always does within a few tries).
 */
export function randomCountry(next: () => number = Math.random): Country {
  for (let attempt = 0; attempt < 500; attempt++) {
    const raw = Object.fromEntries(
      (settings as readonly SettingDef[]).map((d) =>
        d.kind === 'share'
          ? [d.id, 1 + Math.floor(next() * 30)]
          : d.kind === 'choice'
            ? [d.id, d.options[Math.floor(next() * d.options.length)]!.id]
            : [d.id, d.options.filter((o) => (o.id === 'citizenship' ? next() < 0.8 : next() < 0.12)).map((o) => o.id)],
      ),
    ) as Country;
    const country = withBudget(raw, {});
    const checks = describe(country).checks;
    if (!checks.some((c) => c.severity === 'conflict') && checks.length <= 1) return country;
  }
  return defaultCountry();
}
