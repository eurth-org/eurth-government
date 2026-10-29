import type { Condition } from './conditions';

export interface CheckDef {
  readonly id: string;
  readonly when: Condition;
  /** `conflict`: the settings contradict each other. `unusual`: possible, but worth a second look. */
  readonly severity: 'conflict' | 'unusual';
  readonly message: string;
}

/** Combinations worth pointing out. Every check whose `when` matches is shown. */
export const checks = [
  {
    id: 'no-legislature-to-answer-to',
    when: { government: ['pm-legislature', 'pm-shared', 'council'], legislature: ['none', 'advisory'] },
    severity: 'conflict',
    message: "The government answers to the legislature, but there's no legislature with the power to hold it to account.",
  },
  {
    id: 'chosen-by-missing-legislature',
    when: { headOfStateSelection: 'legislature', legislature: 'none' },
    severity: 'conflict',
    message: 'The legislature chooses the head of state, but there is no legislature.',
  },
  {
    id: 'votes-without-elections',
    when: {
      elections: 'none',
      anyOf: [
        { headOfStateSelection: 'people' },
        { government: 'elected-leader' },
        { legislature: ['elected', 'partly-elected', 'assembly'] },
      ],
    },
    severity: 'conflict',
    message: 'There are no elections, yet some offices are filled by a popular vote.',
  },
  {
    id: 'free-elections-nothing-to-elect',
    when: {
      elections: 'free',
      legislature: ['appointed', 'advisory', 'none'],
      headOfStateSelection: { not: ['people', 'legislature'] },
      government: { not: 'elected-leader' },
    },
    severity: 'unusual',
    message: 'Elections are free, but no office that holds power is filled by them.',
  },
  {
    id: 'one-party-free-elections',
    when: { parties: 'one', elections: 'free' },
    severity: 'unusual',
    message: 'Free elections with only one party: voters can choose between candidates, but not between parties.',
  },
  {
    id: 'party-rule-without-parties',
    when: { rulers: 'party', parties: 'none' },
    severity: 'conflict',
    message: 'Only party members may rule, but parties are banned.',
  },
  {
    id: 'party-chooses-without-parties',
    when: { headOfStateSelection: 'party', parties: 'none' },
    severity: 'conflict',
    message: 'The ruling party chooses the head of state, but parties are banned.',
  },
  {
    id: 'party-vote-without-parties',
    when: { suffrageLimits: { any: ['party'] }, parties: 'none' },
    severity: 'conflict',
    message: 'Only party members may vote, but parties are banned.',
  },
  {
    id: 'hereditary-president',
    when: { headOfState: ['president', 'council'], headOfStateSelection: 'inherited' },
    severity: 'unusual',
    message: 'A head of state who inherits the job is a monarch in all but name.',
  },
  {
    id: 'monarch-by-popular-vote',
    when: { headOfState: 'monarch', headOfStateSelection: 'people' },
    severity: 'unusual',
    message: 'A monarch chosen by popular vote is rare; elective monarchies usually leave it to a small group of electors.',
  },
  {
    id: 'atheist-theocracy',
    when: {
      religion: 'state-atheism',
      anyOf: [{ headOfState: 'religious-leader' }, { rulers: 'clergy' }, { courts: 'religious' }],
    },
    severity: 'conflict',
    message: 'The state promotes atheism, but religious leaders or courts hold power.',
  },
  {
    id: 'secular-religious-courts',
    when: { religion: ['secular', 'established'], courts: 'religious' },
    severity: 'unusual',
    message: 'The law is secular, but religious courts apply it.',
  },
  {
    id: 'religious-leader-secular-state',
    when: { headOfState: 'religious-leader', religion: 'secular' },
    severity: 'unusual',
    message: 'A religious leader heads a state that keeps religion out of government.',
  },
  {
    id: 'pacifist-conscription',
    when: { foreignPolicy: 'pacifist', conscription: 'universal' },
    severity: 'unusual',
    message: 'Everyone must serve in the armed forces of a state that has given up war.',
  },
  {
    id: 'pacifist-generals',
    when: { foreignPolicy: 'pacifist', rulers: 'military' },
    severity: 'unusual',
    message: 'Generals running a pacifist state is unusual, to put it mildly.',
  },
  {
    id: 'federal-city',
    when: { extent: 'city', territory: ['federal', 'confederal'] },
    severity: 'unusual',
    message: 'A single city split into self-governing districts is unusual; most city-states are run from the centre.',
  },
  {
    id: 'centralised-union',
    when: { extent: 'union', territory: ['unitary', 'devolved'] },
    severity: 'unusual',
    message: 'A union of countries run from the centre is, in practice, one country.',
  },
  {
    id: 'assembly-at-scale',
    when: { legislature: 'assembly', extent: ['union', 'world'] },
    severity: 'unusual',
    message: 'Every citizen voting on every law works in a city, but takes a lot of voting at this scale.',
  },
  {
    id: 'world-foreign-policy',
    when: { extent: 'world', foreignPolicy: ['interventionist', 'expansionist'] },
    severity: 'unusual',
    message: 'A world government has no foreign countries left. Expanding into space, perhaps?',
  },
  {
    id: 'world-immigration',
    when: { extent: 'world', immigration: { not: 'open' } },
    severity: 'unusual',
    message: 'A world government has nowhere for immigrants to come from, unless you count other planets.',
  },
  {
    id: 'pacifist-big-army',
    when: { foreignPolicy: 'pacifist', budgetDefence: { above: 5 } },
    severity: 'unusual',
    message: 'A state that has given up war spends {budgetDefence} of its budget on defence.',
  },
  {
    id: 'expansion-on-a-shoestring',
    when: { foreignPolicy: 'expansionist', budgetDefence: { below: 3 } },
    severity: 'unusual',
    message: 'Expanding by force on {budgetDefence} of the budget is ambitious.',
  },
  {
    id: 'conscripts-without-a-budget',
    when: { conscription: 'universal', budgetDefence: { below: 2 } },
    severity: 'unusual',
    message: 'Everyone serves in the armed forces, but defence gets only {budgetDefence} of the budget.',
  },
  {
    id: 'no-schools',
    when: { budgetEducation: { below: 3 } },
    severity: 'unusual',
    message: 'Education gets {budgetEducation} of the budget: schools will be private, religious or scarce.',
  },
  {
    id: 'no-courts-or-police',
    when: { budgetOrder: { below: 1 } },
    severity: 'unusual',
    message: 'Public order gets {budgetOrder} of the budget: who runs the courts and the police?',
  },
] as const satisfies readonly CheckDef[];
