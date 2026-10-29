import { axes, type AxisId } from './axes';
import { checks } from './checks';
import { dependsOn, matches } from './conditions';
import { families, type Family, type LabelRule } from './naming';
import { settings, type Country, type SettingId } from './settings';
import type { SettingDef } from './types';

export interface Label {
  family: Family;
  rule: string;
  label: string;
  because: string;
  /** The English Wikipedia article that explains it. */
  wiki: string;
  /** Settings the matching rule looked at. */
  dependsOn: SettingId[];
}

export interface AxisContribution {
  setting: SettingId;
  option: string;
  value: number;
}

export interface AxisScore {
  axis: AxisId;
  /** 0 is the axis's `low` end, 100 its `high` end. */
  score: number;
  contributions: AxisContribution[];
}

export interface CheckResult {
  id: string;
  severity: 'conflict' | 'unusual';
  message: string;
  dependsOn: SettingId[];
}

export interface Profile {
  /** For example "Federal presidential republic". */
  name: string;
  labels: Record<Family, Label>;
  axes: AxisScore[];
  checks: CheckResult[];
}

const familyOrder: Family[] = ['structure', 'system', 'form', 'regime', 'rulers'];

export function defaultCountry(): Country {
  return Object.fromEntries(
    settings.map((s: SettingDef) => [s.id, s.kind === 'multi' ? [...s.default] : s.default]),
  ) as Country;
}

export function settingDef(id: SettingId): SettingDef {
  const def = settings.find((s) => s.id === id);
  if (!def) throw new Error(`Unknown setting "${id}"`);
  return def;
}

/** The options picked for a setting, as a list even for pick-one settings. Budget shares have none. */
export function picked(country: Country, id: SettingId): string[] {
  const value = country[id];
  if (typeof value === 'number') return [];
  return Array.isArray(value) ? [...value] : [value as string];
}

function optionLabel(id: SettingId, option: string): string {
  const found = settingDef(id).options.find((o) => o.id === option);
  if (!found) throw new Error(`Setting "${id}" has no option "${option}"`);
  return found.label;
}

function listInWords(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Replaces `{settingId}` with the chosen option labels, lower-cased, or a budget share as "12%". */
export function fill(text: string, country: Country): string {
  return text.replace(/\{(\w+)\}/g, (_, id: string) => {
    const settingId = id as SettingId;
    if (settingDef(settingId).kind === 'share') return `${country[settingId]}%`;
    return listInWords(picked(country, settingId).map((o) => optionLabel(settingId, o).toLowerCase()));
  });
}

function classify(family: Family, country: Country): { rule: LabelRule; label: Label } {
  const rules = families[family] as readonly LabelRule[];
  const index = rules.findIndex((r) => matches(r.when, country));
  const rule = rules[index];
  if (!rule) throw new Error(`No ${family} rule matches; the list must end with a catch-all rule`);
  // A catch-all rule looks at nothing itself; it applies because the rules before it didn't.
  const own = dependsOn(rule.when);
  const looked = own.length ? own : [...new Set(rules.slice(0, index).flatMap((r) => dependsOn(r.when)))];
  return {
    rule,
    label: {
      family,
      rule: rule.id,
      label: rule.label,
      because: fill(rule.because, country),
      wiki: rule.wiki,
      dependsOn: looked,
    },
  };
}

function compose(rules: Record<Family, LabelRule>): string {
  const { structure, system, form, regime, rulers } = rules;
  const terms = [
    structure.term,
    regime.hidesSystem ? '' : system.term,
    regime.term,
    rulers.term,
    form.term,
    regime.suffix ?? '',
  ];
  const words: string[] = [];
  for (const term of terms) {
    if (term && !words.includes(term)) words.push(term);
  }
  const name = words.join(' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function scoreAxes(country: Country): AxisScore[] {
  return axes.map(({ id: axis }) => {
    let low = 0;
    let high = 0;
    let total = 0;
    const contributions: AxisContribution[] = [];
    for (const def of settings as readonly SettingDef[]) {
      if (def.kind === 'share') {
        const effect = def.axes?.[axis];
        if (!effect) continue;
        const step = (share: number) => Math.max(-2, Math.min(2, (share - effect.neutral) / effect.per));
        low += step(0);
        high += step(100);
        const share = country[def.id as SettingId] as number;
        const value = Math.round(step(share) * 100) / 100;
        total += value;
        if (value !== 0) contributions.push({ setting: def.id as SettingId, option: `${share}%`, value });
        continue;
      }
      const values = def.options.map((o) => o.axes?.[axis] ?? 0);
      if (def.kind === 'choice') {
        low += Math.min(...values);
        high += Math.max(...values);
      } else {
        low += values.filter((v) => v < 0).reduce((a, b) => a + b, 0);
        high += values.filter((v) => v > 0).reduce((a, b) => a + b, 0);
      }
      const id = def.id as SettingId;
      for (const option of picked(country, id)) {
        const value = def.options.find((o) => o.id === option)?.axes?.[axis] ?? 0;
        if (value !== 0) {
          total += value;
          contributions.push({ setting: id, option, value });
        }
      }
    }
    const score = high === low ? 50 : Math.round(((total - low) / (high - low)) * 100);
    return { axis, score, contributions };
  });
}

export function runChecks(country: Country): CheckResult[] {
  return checks
    .filter((c) => matches(c.when, country))
    .map((c) => ({ id: c.id, severity: c.severity, message: fill(c.message, country), dependsOn: dependsOn(c.when) }));
}

/** Everything the tool says about a country. */
export function describe(country: Country): Profile {
  const rules = {} as Record<Family, LabelRule>;
  const labels = {} as Record<Family, Label>;
  for (const family of familyOrder) {
    const result = classify(family, country);
    rules[family] = result.rule;
    labels[family] = result.label;
  }
  return { name: compose(rules), labels, axes: scoreAxes(country), checks: runChecks(country) };
}
