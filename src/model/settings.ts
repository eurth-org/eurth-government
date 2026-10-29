import type { AxisId } from './axes';
import type { SettingDef, ShareEffect } from './types';

function share<const Id extends string>(
  id: Id,
  label: string,
  defaultShare: number,
  help: string,
  axes?: { [A in AxisId]?: ShareEffect },
) {
  return {
    id,
    kind: 'share',
    group: 'Budget',
    label,
    question: `How much of the budget goes to ${label.toLowerCase()}?`,
    help,
    default: defaultShare,
    options: [],
    ...(axes ? { axes } : {}),
  } as const;
}

/**
 * Everything a country can be set to, in the order the tool asks.
 * Written from scratch in our own words; see README "Written from scratch".
 */
export const settings = [
  // The state
  {
    id: 'extent',
    kind: 'choice',
    group: 'The state',
    label: 'Extent',
    question: 'How far does the state reach?',
    default: 'country',
    options: [
      { id: 'city', label: 'A city', help: 'One city and its surroundings, governing itself.' },
      { id: 'country', label: 'A country', help: 'A country with many towns and regions.' },
      {
        id: 'union',
        label: 'A union of countries',
        help: 'Several countries that have joined under one government.',
        axes: { openness: 1 },
      },
      { id: 'world', label: 'The whole world', help: 'One government for the entire planet.', axes: { openness: 2 } },
    ],
  },
  {
    id: 'territory',
    kind: 'choice',
    group: 'The state',
    label: 'Regions',
    question: 'How much do regions govern themselves?',
    default: 'unitary',
    options: [
      {
        id: 'unitary',
        label: 'Run from the centre',
        help: 'The central government makes nearly all decisions; regions carry them out.',
        axes: { decentralisation: -2, checks: -1 },
      },
      {
        id: 'devolved',
        label: 'Some devolved powers',
        help: 'The centre hands some powers to regions, and can take them back.',
      },
      {
        id: 'federal',
        label: 'Federal',
        help: "Regions have powers of their own that the centre can't take away.",
        axes: { decentralisation: 1, checks: 1 },
      },
      {
        id: 'confederal',
        label: 'Confederal',
        help: 'Regions hold most power, and the centre only does what they agree on.',
        axes: { decentralisation: 2, checks: 1 },
      },
    ],
  },

  // Head of state
  {
    id: 'headOfState',
    kind: 'choice',
    group: 'Head of state',
    label: 'Head of state',
    question: 'Who represents the state?',
    default: 'president',
    options: [
      {
        id: 'monarch',
        label: 'A monarch',
        help: 'A king, queen, emperor or similar, usually for life.',
        axes: { participation: -1 },
      },
      { id: 'president', label: 'A president', help: 'One person who holds the office for a set term, or until removed.' },
      { id: 'council', label: 'A council', help: 'A small group shares the role of head of state.', axes: { checks: 1 } },
      {
        id: 'religious-leader',
        label: 'A religious leader',
        help: 'The head of the state religion is also the head of state.',
        axes: { religion: 2, participation: -1 },
      },
    ],
  },
  {
    id: 'headOfStateSelection',
    kind: 'choice',
    group: 'Head of state',
    label: 'Chosen by',
    question: 'How is the head of state chosen?',
    default: 'legislature',
    options: [
      {
        id: 'inherited',
        label: 'Inheritance',
        help: 'The title passes down a family line.',
        axes: { participation: -2, competition: -2 },
      },
      {
        id: 'people',
        label: 'Popular vote',
        help: 'Citizens vote for the head of state.',
        axes: { participation: 2, competition: 1 },
      },
      {
        id: 'legislature',
        label: 'The legislature',
        help: 'Members of the legislature choose the head of state.',
        axes: { participation: 1, competition: 1 },
      },
      {
        id: 'electors',
        label: 'A small group of electors',
        help: 'A closed circle, such as nobles, clergy or regional rulers, picks the head of state.',
        axes: { participation: -1 },
      },
      {
        id: 'party',
        label: 'The ruling party',
        help: 'The leadership of the ruling party decides.',
        axes: { participation: -2, competition: -1 },
      },
      {
        id: 'force',
        label: 'Force',
        help: 'Whoever seizes power holds it.',
        axes: { participation: -2, competition: -2, checks: -2, militarism: 1 },
      },
    ],
  },

  // Government
  {
    id: 'government',
    kind: 'choice',
    group: 'Government',
    label: 'Who governs',
    question: 'Who runs the government day to day, and who can remove them?',
    default: 'pm-legislature',
    options: [
      {
        id: 'head-of-state',
        label: 'The head of state, who also leads the government',
        help: 'One person is both head of state and head of government: a president elected by the people, or one the legislature chooses and can remove, whatever the title.',
      },
      {
        id: 'pm-legislature',
        label: 'A prime minister, answerable to the legislature',
        help: 'The government needs the support of the legislature, and falls if it loses a vote of confidence.',
        axes: { checks: 1 },
      },
      {
        id: 'pm-shared',
        label: 'A prime minister, answerable to both',
        help: 'The head of state appoints a prime minister, who also needs the support of the legislature.',
        axes: { checks: 1 },
      },
      {
        id: 'pm-head-of-state',
        label: 'A prime minister, answerable to the head of state',
        help: 'The head of state appoints and dismisses the prime minister at will.',
        axes: { checks: -1 },
      },
      {
        id: 'council',
        label: 'A council with a fixed term',
        help: "The legislature elects a governing council, which it can't dismiss before the term ends.",
        axes: { checks: 2 },
      },
      {
        id: 'elected-leader',
        label: 'A separately elected leader',
        help: 'Citizens elect the head of government, separately from the head of state.',
        axes: { participation: 1, checks: 1 },
      },
    ],
  },

  // Legislature
  {
    id: 'legislature',
    kind: 'choice',
    group: 'Legislature',
    label: 'Legislature',
    question: 'Who makes the laws?',
    default: 'elected',
    options: [
      {
        id: 'elected',
        label: 'Elected representatives',
        help: 'Citizens elect members to make laws on their behalf.',
        axes: { participation: 2, checks: 1 },
      },
      {
        id: 'partly-elected',
        label: 'Partly elected',
        help: 'One chamber is elected; the other is appointed, inherited or chosen by regions.',
        axes: { participation: 1, checks: 1 },
      },
      {
        id: 'indirect',
        label: 'Chosen by lower assemblies',
        help: 'Regional or local assemblies send members, rather than voters choosing them directly.',
        axes: { checks: 1 },
      },
      {
        id: 'appointed',
        label: 'Appointed members',
        help: 'The ruler or the ruling party appoints the members.',
        axes: { participation: -1, checks: -1 },
      },
      {
        id: 'assembly',
        label: 'All citizens',
        help: 'Citizens meet and vote on laws themselves.',
        axes: { participation: 2 },
      },
      {
        id: 'advisory',
        label: 'An advisory council',
        help: 'A council debates and advises, but the ruler decides.',
        axes: { participation: -1, checks: -1 },
      },
      {
        id: 'none',
        label: 'No legislature',
        help: 'The ruler makes the laws by decree.',
        axes: { participation: -2, checks: -2 },
      },
    ],
  },
  {
    id: 'chambers',
    kind: 'choice',
    group: 'Legislature',
    label: 'Chambers',
    question: 'How many chambers does the legislature have?',
    default: 'one',
    options: [
      { id: 'one', label: 'One', help: 'A single chamber passes laws.' },
      { id: 'two', label: 'Two', help: 'Laws pass through two chambers, which check each other.', axes: { checks: 1 } },
    ],
  },
  {
    id: 'electoralSystem',
    kind: 'choice',
    group: 'Legislature',
    label: 'Electoral system',
    question: 'How do votes turn into seats?',
    default: 'proportional',
    options: [
      {
        id: 'majoritarian',
        label: 'Winner takes the seat',
        help: 'Each district elects whoever gets the most votes, which favours big parties.',
        axes: { competition: -1 },
      },
      {
        id: 'proportional',
        label: 'Proportional',
        help: 'Parties get seats in proportion to their share of the vote.',
        axes: { competition: 1, participation: 1 },
      },
      {
        id: 'mixed',
        label: 'Mixed',
        help: 'Some seats are won in districts; the rest are shared out in proportion to the vote.',
      },
    ],
  },

  // Elections
  {
    id: 'elections',
    kind: 'choice',
    group: 'Elections',
    label: 'Elections',
    question: 'How free are elections?',
    default: 'free',
    options: [
      {
        id: 'free',
        label: 'Free and fair',
        help: 'Anyone eligible can stand, campaign and vote, and the count is honest.',
        axes: { competition: 2, participation: 1 },
      },
      {
        id: 'managed',
        label: 'Held, but managed',
        help: 'Elections take place, but the outcome is never really in doubt.',
        axes: { competition: -1 },
      },
      {
        id: 'none',
        label: 'No elections',
        help: 'Nobody in power is chosen by voters.',
        axes: { competition: -2, participation: -2 },
      },
    ],
  },
  {
    id: 'parties',
    kind: 'choice',
    group: 'Elections',
    label: 'Parties',
    question: 'Which political parties are allowed?',
    default: 'many',
    options: [
      { id: 'many', label: 'Any party', help: 'Anyone may found a party and compete for power.', axes: { competition: 2 } },
      {
        id: 'one',
        label: 'One party',
        help: 'Only one party is legal, or only one may hold power.',
        axes: { competition: -2 },
      },
      {
        id: 'none',
        label: 'No parties',
        help: 'Parties are banned; candidates stand as individuals, if at all.',
        axes: { competition: -1 },
      },
    ],
  },
  {
    id: 'suffrageLimits',
    kind: 'multi',
    group: 'Elections',
    label: 'Voting limited by',
    question: 'Besides age, what limits who may vote?',
    default: ['citizenship'],
    options: [
      {
        id: 'citizenship',
        label: 'Citizenship',
        help: 'Only citizens may vote; residents without citizenship may not.',
        axes: { participation: -1 },
      },
      {
        id: 'property',
        label: 'Property',
        help: 'Only people who own land or pay enough tax may vote.',
        axes: { participation: -1 },
      },
      {
        id: 'education',
        label: 'Education',
        help: 'Only people who pass a literacy or education test may vote.',
        axes: { participation: -1 },
      },
      { id: 'sex', label: 'Sex', help: 'Only men, or only women, may vote.', axes: { participation: -2 } },
      {
        id: 'ethnicity',
        label: 'Ethnicity',
        help: 'Only people of certain ethnic groups may vote.',
        axes: { participation: -2, openness: -1 },
      },
      {
        id: 'religion',
        label: 'Religion',
        help: 'Only followers of certain faiths may vote.',
        axes: { participation: -1, religion: 1 },
      },
      {
        id: 'service',
        label: 'Military service',
        help: 'Only people who have served in the armed forces may vote.',
        axes: { participation: -1, militarism: 1 },
      },
      {
        id: 'party',
        label: 'Party membership',
        help: 'Only members of the ruling party may vote.',
        axes: { participation: -2, competition: -1 },
      },
    ],
  },

  // Courts and rulers
  {
    id: 'courts',
    kind: 'choice',
    group: 'Courts and rulers',
    label: 'Courts',
    question: 'How independent are the courts?',
    default: 'review',
    options: [
      {
        id: 'review',
        label: 'Independent, can strike down laws',
        help: 'Judges answer to the law alone, and can overturn laws that break the constitution.',
        axes: { checks: 2 },
      },
      {
        id: 'independent',
        label: 'Independent',
        help: 'Judges answer to the law alone, but the legislature has the final word on what the law is.',
        axes: { checks: 1 },
      },
      {
        id: 'controlled',
        label: 'Controlled',
        help: 'Judges follow the wishes of those in power.',
        axes: { checks: -2 },
      },
      {
        id: 'religious',
        label: 'Religious courts',
        help: 'Religious authorities interpret and apply the law.',
        axes: { checks: -1, religion: 2 },
      },
    ],
  },
  {
    id: 'rulers',
    kind: 'choice',
    group: 'Courts and rulers',
    label: 'Who may rule',
    question: 'Who is allowed to hold high office?',
    default: 'anyone',
    options: [
      { id: 'anyone', label: 'Anyone', help: 'Any citizen may hold office.', axes: { participation: 1 } },
      {
        id: 'party',
        label: 'Party members',
        help: 'High office is reserved for members of the ruling party.',
        axes: { competition: -1 },
      },
      {
        id: 'clergy',
        label: 'Clergy',
        help: 'Religious leaders hold the highest offices.',
        axes: { religion: 2, participation: -1 },
      },
      {
        id: 'military',
        label: 'Military officers',
        help: 'Senior officers hold the highest offices.',
        axes: { militarism: 2, participation: -1 },
      },
      {
        id: 'experts',
        label: 'Experts',
        help: 'Office goes to people with proven expertise, such as scientists and engineers.',
        axes: { participation: -1 },
      },
      {
        id: 'wealthy',
        label: 'The wealthy',
        help: 'Office is open only to the rich, or is effectively bought.',
        axes: { participation: -2 },
      },
      {
        id: 'nobility',
        label: 'Nobility',
        help: 'Office is reserved for noble families.',
        axes: { participation: -2 },
      },
    ],
  },

  // Religion
  {
    id: 'religion',
    kind: 'choice',
    group: 'Religion',
    label: 'Religion',
    question: "What is religion's place in the state?",
    default: 'secular',
    options: [
      {
        id: 'state-religion',
        label: 'State religion',
        help: 'One faith is official and shapes law and public life.',
        axes: { religion: 2 },
      },
      {
        id: 'established',
        label: 'Established church',
        help: 'One faith has an official status, but others practise freely and the law is secular.',
        axes: { religion: 1 },
      },
      {
        id: 'secular',
        label: 'Secular',
        help: 'State and religion are kept apart; all faiths are treated alike.',
        axes: { religion: -1 },
      },
      {
        id: 'state-atheism',
        label: 'State atheism',
        help: 'The state promotes atheism and restricts religion.',
        axes: { religion: -2 },
      },
    ],
  },
  // Defence and borders
  {
    id: 'foreignPolicy',
    kind: 'choice',
    group: 'Defence and borders',
    label: 'Foreign policy',
    question: 'How does the state use its armed forces abroad?',
    default: 'defensive',
    options: [
      {
        id: 'pacifist',
        label: 'Pacifist',
        help: 'No armed forces for war; disputes are settled peacefully.',
        axes: { militarism: -2, openness: 1 },
      },
      {
        id: 'neutral',
        label: 'Neutral',
        help: 'Armed forces for self-defence only, and no alliances.',
        axes: { militarism: -1 },
      },
      {
        id: 'defensive',
        label: 'Defensive alliances',
        help: 'Allies defend each other if attacked.',
        axes: { openness: 1 },
      },
      {
        id: 'interventionist',
        label: 'Interventionist',
        help: 'Willing to send forces abroad to protect interests or allies.',
        axes: { militarism: 1, openness: 1 },
      },
      {
        id: 'expansionist',
        label: 'Expansionist',
        help: 'Seeks to gain territory or influence by force.',
        axes: { militarism: 2, openness: -1 },
      },
    ],
  },
  {
    id: 'conscription',
    kind: 'choice',
    group: 'Defence and borders',
    label: 'Military service',
    question: 'Do citizens have to serve in the armed forces?',
    default: 'none',
    options: [
      { id: 'none', label: 'Voluntary', help: 'Only volunteers serve.', axes: { militarism: -1 } },
      { id: 'selective', label: 'Selective', help: 'Some citizens are called up, by lottery or as needed.' },
      { id: 'universal', label: 'Universal', help: 'All eligible citizens must serve.', axes: { militarism: 2 } },
    ],
  },
  {
    id: 'immigration',
    kind: 'choice',
    group: 'Defence and borders',
    label: 'Immigration',
    question: 'Who may move to the country?',
    default: 'managed',
    options: [
      { id: 'open', label: 'Open', help: 'Anyone may move here and settle.', axes: { openness: 2 } },
      {
        id: 'managed',
        label: 'Managed',
        help: 'People may come to work, study or join family, within limits.',
        axes: { openness: 1 },
      },
      {
        id: 'restrictive',
        label: 'Restrictive',
        help: 'Only a few, carefully chosen people may settle.',
        axes: { openness: -1 },
      },
      { id: 'closed', label: 'Closed', help: 'Nobody may settle here.', axes: { openness: -2 } },
    ],
  },

  // Budget: shares of government spending, after the UN's Classification of the Functions of
  // Government (COFOG). Defaults are roughly the average of OECD countries.
  share('budgetGeneral', 'General services', 13, 'Running the state: parliament, tax collection, foreign affairs and interest on debt.'),
  share('budgetDefence', 'Defence', 3, 'Armed forces, military aid and defence research.', { militarism: { neutral: 4, per: 3 } }),
  share('budgetOrder', 'Public order', 4, 'Police, fire services, courts and prisons.'),
  share('budgetEconomy', 'Economy', 10, 'Transport, energy, farming, industry and support for business.'),
  share('budgetEnvironment', 'Environment', 2, 'Waste, pollution control and nature protection.'),
  share('budgetHousing', 'Housing', 1, 'Housing, water supply, street lighting and community development.'),
  share('budgetHealth', 'Health', 15, 'Hospitals, doctors, medicines and public health.', { welfare: { neutral: 15, per: 8 } }),
  share('budgetCulture', 'Culture and religion', 3, 'Sport, culture, broadcasting and religious bodies.'),
  share('budgetEducation', 'Education', 12, 'Schools, universities and training.', { welfare: { neutral: 12, per: 8 } }),
  share('budgetSocial', 'Social protection', 37, 'Pensions, unemployment, sickness, family and housing benefits.', { welfare: { neutral: 35, per: 8 } }),
] as const satisfies readonly SettingDef[];

type Def = (typeof settings)[number];
export type SettingId = Def['id'];
export type SettingDefOf<Id extends SettingId> = Extract<Def, { id: Id }>;
export type OptionId<Id extends SettingId> = SettingDefOf<Id>['options'][number]['id'];

/** A country: one value for every setting. */
export type Country = {
  -readonly [Id in SettingId]: SettingDefOf<Id> extends { kind: 'multi' }
    ? OptionId<Id>[]
    : SettingDefOf<Id> extends { kind: 'share' }
      ? number
      : OptionId<Id>;
};

/** The budget's settings, in order. */
export type BudgetId = Extract<Def, { kind: 'share' }>['id'];
export const budgetIds = settings.filter((s) => s.kind === 'share').map((s) => s.id) as BudgetId[];
