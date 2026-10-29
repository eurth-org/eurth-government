import { picked, settingDef, type Profile } from './engine';
import { familyLabels, type Family } from './naming';
import type { Country, SettingId } from './settings';

/** One readable line per topic, shared by every export format. */
export interface Fact {
  label: string;
  value: string;
}

const familyOrder: Family[] = ['structure', 'system', 'form', 'regime', 'rulers'];

function option(country: Country, id: SettingId): string {
  const chosen = picked(country, id);
  return settingDef(id)
    .options.filter((o) => chosen.includes(o.id))
    .map((o) => o.label)
    .join(', ');
}

function lower(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function article(text: string): string {
  return /^[aeiou]/i.test(text) ? `an ${text}` : `a ${text}`;
}

export function facts(country: Country): Fact[] {
  const limits = option(country, 'suffrageLimits');
  return [
    {
      label: 'Head of state',
      value: `${option(country, 'headOfState')}, chosen by ${lower(option(country, 'headOfStateSelection'))}`,
    },
    { label: 'Government', value: option(country, 'government') },
    {
      label: 'Legislature',
      value:
        country.legislature === 'none'
          ? 'None'
          : `${option(country, 'legislature')}, ${country.chambers === 'two' ? 'two chambers' : 'one chamber'}`,
    },
    {
      label: 'Elections',
      value: `${option(country, 'elections')}; ${lower(option(country, 'parties'))}; voting limited by ${limits ? lower(limits) : 'age only'}`,
    },
    { label: 'Courts', value: option(country, 'courts') },
    { label: 'Who may rule', value: option(country, 'rulers') },
    { label: 'Religion', value: option(country, 'religion') },
    { label: 'Foreign policy', value: option(country, 'foreignPolicy') },
    { label: 'Military service', value: option(country, 'conscription') },
    { label: 'Immigration', value: option(country, 'immigration') },
  ];
}

export function summary(name: string, profile: Profile): string {
  return `${name} is ${article(lower(profile.name))} and ${article(lower(profile.labels.regime.label))}.`;
}

/** Markdown for the Eurth.org forum (Discourse). */
export function toMarkdown(name: string, country: Country, profile: Profile, link: string): string {
  const rows = [
    ...familyOrder.map((f) => ({ label: familyLabels[f], value: profile.labels[f].label })),
    ...facts(country),
  ];
  return [
    `### ${name}`,
    '',
    summary(name, profile),
    '',
    '| | |',
    '| --- | --- |',
    ...rows.map((r) => `| ${r.label} | ${r.value} |`),
    '',
    `<small>Made with [Governmint](${link})</small>`,
    '',
  ].join('\n');
}

const leaderTitles: Record<string, string> = {
  monarch: 'Monarch',
  president: 'President',
  council: 'Head of state',
  'religious-leader': 'Supreme leader',
};

const governmentTitles: Record<string, string> = {
  'pm-legislature': 'Prime minister',
  'pm-shared': 'Prime minister',
  'pm-head-of-state': 'Prime minister',
  council: 'Federal council',
  'elected-leader': 'Head of government',
};

/** Wikitext for IIWiki (or any MediaWiki), using the common {{Infobox country}} template. */
export function toWikitext(name: string, country: Country, profile: Profile, link: string): string {
  const infobox: [string, string][] = [
    ['conventional_long_name', name],
    ['common_name', name],
    ['government_type', profile.name],
    ['leader_title1', leaderTitles[country.headOfState] ?? 'Head of state'],
    ['leader_name1', ''],
  ];
  const second = governmentTitles[country.government];
  if (second) infobox.push(['leader_title2', second], ['leader_name2', '']);
  if (country.legislature !== 'none' && country.legislature !== 'advisory') {
    infobox.push(['legislature', '']);
    if (country.chambers === 'two') infobox.push(['upper_house', ''], ['lower_house', '']);
  }
  if (country.religion === 'state-religion') infobox.push(['religion', '']);
  const width = Math.max(...infobox.map(([key]) => key.length));

  return [
    '{{Infobox country',
    ...infobox.map(([key, value]) => `| ${key.padEnd(width)} = ${value}`),
    '}}',
    `'''${name}''' is ${article(lower(profile.name))} and ${article(lower(profile.labels.regime.label))}.`,
    '',
    '== Government and politics ==',
    familyOrder.map((f) => profile.labels[f].because).join(' '),
    '',
    ...facts(country).map((f) => `* '''${f.label}:''' ${f.value}`),
    '',
    `<!-- Made with Governmint: ${link} -->`,
    '',
  ].join('\n');
}
