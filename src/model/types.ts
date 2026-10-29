import type { AxisId } from './axes';

/** One answer to a setting's question. */
export interface OptionDef {
  readonly id: string;
  /** Short label for the control. Also used inside sentences, lower-cased. */
  readonly label: string;
  /** One sentence saying what choosing this means. */
  readonly help: string;
  /** How far this option pushes each axis, from -2 to 2. */
  readonly axes?: { readonly [A in AxisId]?: number };
}

interface SettingBase {
  readonly id: string;
  /** Section the setting appears under. */
  readonly group: string;
  readonly label: string;
  readonly question: string;
  readonly options: readonly OptionDef[];
}

/** Pick exactly one option. */
export interface ChoiceSettingDef extends SettingBase {
  readonly kind: 'choice';
  readonly default: string;
}

/** Pick any number of options, including none. */
export interface MultiSettingDef extends SettingBase {
  readonly kind: 'multi';
  readonly default: readonly string[];
}

export type SettingDef = ChoiceSettingDef | MultiSettingDef;

export interface AxisDef {
  readonly id: string;
  readonly label: string;
  /** What a score of 0 means. */
  readonly low: string;
  /** What a score of 100 means. */
  readonly high: string;
  readonly help: string;
}
