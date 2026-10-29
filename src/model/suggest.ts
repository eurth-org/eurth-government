import type { AxisId } from './axes';
import { runChecks, scoreAxes, settingDef } from './engine';
import { settings, type Country, type SettingId } from './settings';
import type { SettingDef } from './types';

export interface Suggestion {
  setting: SettingId;
  option: string;
  /** For pick-many settings: whether the option is added or removed. */
  change: 'set' | 'add' | 'remove';
  /** How far the axis score moves, in points. */
  delta: number;
  country: Country;
}

function score(country: Country, axis: AxisId): number {
  return scoreAxes(country).find((a) => a.axis === axis)!.score;
}

function conflicts(country: Country): number {
  return runChecks(country).filter((c) => c.severity === 'conflict').length;
}

/**
 * Single changes that move an axis the way the visitor wants (direction 1 is up, -1 down),
 * biggest first, at most one per setting, leaving out changes that add a contradiction.
 */
export function suggest(country: Country, axis: AxisId, direction: 1 | -1, limit = 3): Suggestion[] {
  const now = score(country, axis);
  const conflictsNow = conflicts(country);
  const best = new Map<SettingId, Suggestion>();

  for (const def of settings as readonly SettingDef[]) {
    const id = def.id as SettingId;
    const current = country[id];
    for (const option of def.options) {
      let next: Country;
      let change: Suggestion['change'];
      if (def.kind === 'choice') {
        if (option.id === current) continue;
        next = { ...country, [id]: option.id };
        change = 'set';
      } else {
        const list = current as string[];
        const has = list.includes(option.id);
        next = { ...country, [id]: has ? list.filter((o) => o !== option.id) : [...list, option.id] };
        change = has ? 'remove' : 'add';
      }
      const delta = score(next, axis) - now;
      if (Math.sign(delta) !== direction || conflicts(next) > conflictsNow) continue;
      const kept = best.get(id);
      if (!kept || Math.abs(delta) > Math.abs(kept.delta)) best.set(id, { setting: id, option: option.id, change, delta, country: next });
    }
  }
  return [...best.values()].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, limit);
}

/** "Who may rule: Clergy", "Voting limited by: add Property". */
export function describeSuggestion(s: Suggestion): string {
  const def = settingDef(s.setting);
  const option = def.options.find((o) => o.id === s.option)!.label;
  if (s.change === 'set') return `${def.label}: ${option}`;
  return `${def.label}: ${s.change} ${option.toLowerCase()}`;
}
