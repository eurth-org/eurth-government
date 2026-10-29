import type { Condition } from './conditions';

export interface LabelRule {
  readonly id: string;
  readonly when: Condition;
  /** What the profile shows for this family. */
  readonly label: string;
  /** The word or words this family adds to the full name; '' adds nothing. */
  readonly term: string;
  /** One sentence. `{settingId}` inserts the chosen option, lower-cased. */
  readonly because: string;
  /** Regime only: leave the system out of the name, because it says little here. */
  readonly hidesSystem?: boolean;
  /** Regime only: words added after the name. */
  readonly suffix?: string;
}

/**
 * Each family is an ordered list: the first rule whose `when` matches wins, so specific
 * rules come first and every list ends with a rule that always matches.
 *
 * The full name is built as: structure, system, regime, rulers, form, then any suffix.
 * For example "Federal" + "presidential" + "republic".
 */
export const families = {
  structure: [
    {
      id: 'world-federation',
      when: { extent: 'world', territory: 'federal' },
      label: 'World federation',
      term: 'federal',
      because: 'One government runs the whole world, and its regions keep powers of their own.',
    },
    {
      id: 'world-confederation',
      when: { extent: 'world', territory: 'confederal' },
      label: 'World confederation',
      term: 'confederal',
      because: "The world's regions hold most power and work together through a shared government.",
    },
    {
      id: 'world-state',
      when: { extent: 'world' },
      label: 'World state',
      term: 'unitary',
      because: 'One central government runs the whole world.',
    },
    {
      id: 'federal-union',
      when: { extent: 'union', territory: 'federal' },
      label: 'Federal union',
      term: 'federal',
      because: "Several countries have joined, and each keeps powers the union can't take away.",
    },
    {
      id: 'confederation-of-states',
      when: { extent: 'union', territory: 'confederal' },
      label: 'Confederation of states',
      term: 'confederal',
      because: 'Several countries work together, but each keeps most of its power.',
    },
    {
      id: 'union-state',
      when: { extent: 'union' },
      label: 'Union state',
      term: 'unitary',
      because: 'Several countries have merged under one central government.',
    },
    {
      id: 'federal-city-state',
      when: { extent: 'city', territory: 'federal' },
      label: 'Federal city-state',
      term: 'federal',
      because: 'The state is a single city, split into districts with powers of their own.',
    },
    {
      id: 'confederal-city-state',
      when: { extent: 'city', territory: 'confederal' },
      label: 'Confederal city-state',
      term: 'confederal',
      because: 'The state is a single city whose districts hold most of the power.',
    },
    {
      id: 'city-state',
      when: { extent: 'city' },
      label: 'City-state',
      term: 'unitary',
      because: 'The state is a single city that governs itself.',
    },
    {
      id: 'federation',
      when: { territory: 'federal' },
      label: 'Federation',
      term: 'federal',
      because: "Regions have powers of their own that the central government can't take away.",
    },
    {
      id: 'confederation',
      when: { territory: 'confederal' },
      label: 'Confederation',
      term: 'confederal',
      because: 'Regions keep most of the power, and the centre only does what they agree on.',
    },
    {
      id: 'devolved-unitary-state',
      when: { territory: 'devolved' },
      label: 'Unitary state with devolved regions',
      term: 'unitary',
      because: 'The central government hands some powers to regions, but can take them back.',
    },
    {
      id: 'unitary-state',
      when: {},
      label: 'Unitary state',
      term: 'unitary',
      because: 'The central government makes nearly all decisions.',
    },
  ],

  system: [
    {
      id: 'direct-democratic',
      when: { legislature: 'assembly' },
      label: "Citizens' assembly",
      term: 'direct-democratic',
      because: 'Citizens make the laws themselves, in an assembly.',
    },
    {
      id: 'directorial',
      when: { government: 'council' },
      label: 'Directorial system',
      term: 'directorial',
      because: "The legislature elects a governing council for a fixed term, and can't dismiss it.",
    },
    {
      id: 'semi-presidential',
      when: { government: 'pm-shared', headOfState: ['president', 'council'] },
      label: 'Semi-presidential system',
      term: 'semi-presidential',
      because: "The head of state shares power with a prime minister who needs the legislature's support.",
    },
    {
      id: 'shared-executive',
      when: { government: 'pm-shared' },
      label: 'Shared executive',
      term: '',
      because: 'Both the head of state and the legislature have a hold over the prime minister.',
    },
    {
      id: 'parliamentary',
      when: { government: 'pm-legislature' },
      label: 'Parliamentary system',
      term: 'parliamentary',
      because: "The government needs the legislature's support, and falls if it loses a vote of confidence.",
    },
    {
      id: 'presidential',
      when: { government: 'head-of-state', headOfStateSelection: 'people', headOfState: ['president', 'council'] },
      label: 'Presidential system',
      term: 'presidential',
      because: 'A head of state elected by the people also leads the government.',
    },
    {
      id: 'presidential-elected-leader',
      when: { government: 'elected-leader' },
      label: 'Presidential system',
      term: 'presidential',
      because: 'Citizens elect the head of government directly, for a fixed term.',
    },
    {
      id: 'parliamentary-executive-president',
      when: {
        government: 'head-of-state',
        headOfStateSelection: 'legislature',
        legislature: { not: ['none', 'advisory'] },
      },
      label: 'Parliamentary system with an executive president',
      term: 'parliamentary',
      because: 'The legislature elects a head of state who also leads the government.',
    },
    {
      id: 'presidential-with-prime-minister',
      when: { government: 'pm-head-of-state', headOfState: ['president', 'council'], headOfStateSelection: 'people' },
      label: 'Presidential system with a prime minister',
      term: 'presidential',
      because: 'An elected head of state leads, with a prime minister who serves at their pleasure.',
    },
    {
      id: 'rule-by-head-of-state',
      when: {},
      label: 'Rule by the head of state',
      term: '',
      because: 'The head of state governs, and no elected body can remove them.',
    },
  ],

  form: [
    {
      id: 'theocratic-republic',
      when: { headOfState: 'religious-leader', government: ['elected-leader', 'pm-legislature', 'pm-shared'] },
      label: 'Theocratic republic',
      term: 'theocratic republic',
      because: 'A religious leader is head of state, but a government chosen by voters or their representatives runs daily affairs.',
    },
    {
      id: 'hereditary-theocracy',
      when: { headOfState: 'religious-leader', headOfStateSelection: 'inherited' },
      label: 'Hereditary theocracy',
      term: 'hereditary theocracy',
      because: 'A religious leader inherits the role of head of state, and rules.',
    },
    {
      id: 'elective-theocracy',
      when: { headOfState: 'religious-leader', headOfStateSelection: ['people', 'legislature', 'electors'] },
      label: 'Elective theocracy',
      term: 'elective theocracy',
      because: 'A religious leader, chosen by {headOfStateSelection}, is head of state and rules.',
    },
    {
      id: 'theocracy',
      when: { headOfState: 'religious-leader' },
      label: 'Theocracy',
      term: 'theocracy',
      because: 'A religious leader is head of state, and rules.',
    },
    {
      id: 'elective-constitutional-monarchy',
      when: {
        headOfState: 'monarch',
        headOfStateSelection: ['people', 'legislature', 'electors'],
        government: ['pm-legislature', 'council', 'elected-leader'],
      },
      label: 'Elective constitutional monarchy',
      term: 'elective constitutional monarchy',
      because: 'A monarch chosen by {headOfStateSelection} reigns, while an accountable government governs.',
    },
    {
      id: 'constitutional-monarchy',
      when: { headOfState: 'monarch', government: ['pm-legislature', 'council', 'elected-leader'] },
      label: 'Constitutional monarchy',
      term: 'constitutional monarchy',
      because: 'The monarch reigns, but a government that answers to others governs.',
    },
    {
      id: 'elective-semi-constitutional-monarchy',
      when: {
        headOfState: 'monarch',
        headOfStateSelection: ['people', 'legislature', 'electors'],
        legislature: ['elected', 'partly-elected', 'indirect', 'assembly'],
      },
      label: 'Elective semi-constitutional monarchy',
      term: 'elective semi-constitutional monarchy',
      because: 'A monarch chosen by {headOfStateSelection} governs alongside a legislature with real lawmaking power.',
    },
    {
      id: 'semi-constitutional-monarchy',
      when: { headOfState: 'monarch', legislature: ['elected', 'partly-elected', 'indirect', 'assembly'] },
      label: 'Semi-constitutional monarchy',
      term: 'semi-constitutional monarchy',
      because: 'The monarch governs alongside a legislature with real lawmaking power.',
    },
    {
      id: 'elective-absolute-monarchy',
      when: { headOfState: 'monarch', headOfStateSelection: ['people', 'legislature', 'electors'] },
      label: 'Elective absolute monarchy',
      term: 'elective absolute monarchy',
      because: 'A monarch chosen by {headOfStateSelection} rules, and no legislature can stop them.',
    },
    {
      id: 'absolute-monarchy',
      when: { headOfState: 'monarch' },
      label: 'Absolute monarchy',
      term: 'absolute monarchy',
      because: 'The monarch rules, and no legislature can stop them.',
    },
    {
      id: 'hereditary-republic',
      when: { headOfState: ['president', 'council'], headOfStateSelection: 'inherited' },
      label: 'Hereditary republic',
      term: 'hereditary republic',
      because: "The head of state's office passes down a family line: a monarchy in all but name.",
    },
    {
      id: 'junta',
      when: { headOfState: 'council', rulers: 'military' },
      label: 'Junta',
      term: 'junta',
      because: 'A council of military officers serves as head of state.',
    },
    {
      id: 'republic',
      when: {},
      label: 'Republic',
      term: 'republic',
      because: 'The head of state is chosen, not born to the role.',
    },
  ],

  regime: [
    {
      id: 'military-dictatorship',
      when: { rulers: 'military', elections: ['managed', 'none'] },
      label: 'Military dictatorship',
      term: 'military',
      hidesSystem: true,
      because: "Military officers hold power, and voters can't remove them.",
    },
    {
      id: 'one-party-state',
      when: { parties: 'one' },
      label: 'One-party state',
      term: 'one-party',
      hidesSystem: true,
      because: 'Only one party may hold power.',
    },
    {
      id: 'theocracy',
      when: { anyOf: [{ rulers: 'clergy' }, { headOfState: 'religious-leader' }] },
      label: 'Theocracy',
      term: '',
      because: 'Religious leaders have the final say over government.',
    },
    {
      id: 'dictatorship',
      when: { elections: 'none', headOfState: ['president', 'council'] },
      label: 'Closed autocracy',
      term: '',
      suffix: 'under a dictatorship',
      because: 'Nobody in power is chosen by voters.',
    },
    {
      id: 'closed-autocracy',
      when: { elections: 'none' },
      label: 'Closed autocracy',
      term: '',
      because: 'Nobody in power is chosen by voters.',
    },
    {
      id: 'electoral-autocracy',
      when: { elections: 'managed' },
      label: 'Electoral autocracy',
      term: '',
      because: "Elections are held, but those in power make sure they can't lose.",
    },
    {
      id: 'nothing-to-elect',
      when: {
        legislature: ['appointed', 'advisory', 'none'],
        headOfStateSelection: { not: ['people', 'legislature'] },
        government: { not: 'elected-leader' },
      },
      label: 'Closed autocracy',
      term: '',
      because: 'Elections may be free, but no office that holds power is filled by them.',
    },
    {
      id: 'unelected-ruler',
      when: {
        government: ['head-of-state', 'pm-head-of-state', 'pm-shared'],
        headOfStateSelection: ['inherited', 'electors', 'party', 'force'],
      },
      label: 'Electoral autocracy',
      term: '',
      because: "People vote, but whoever actually governs isn't chosen by them.",
    },
    {
      id: 'restricted-democracy',
      when: { suffrageLimits: { empty: false } },
      label: 'Restricted democracy',
      term: '',
      because: 'Elections are free, but voting is limited by {suffrageLimits}.',
    },
    {
      id: 'direct-democracy',
      when: { legislature: 'assembly' },
      label: 'Direct democracy',
      term: '',
      because: 'Citizens vote on laws themselves.',
    },
    {
      id: 'liberal-democracy',
      when: { parties: 'many', courts: ['review', 'independent'] },
      label: 'Liberal democracy',
      term: '',
      because: 'Free elections, competing parties and independent courts keep those in power in check.',
    },
    {
      id: 'electoral-democracy-weak-courts',
      when: { courts: ['controlled', 'religious'] },
      label: 'Electoral democracy',
      term: '',
      because: "Elections are free, but the courts can't hold the government to account.",
    },
    {
      id: 'electoral-democracy',
      when: {},
      label: 'Electoral democracy',
      term: '',
      because: 'Elections are free, but without parties voters have little to choose between.',
    },
  ],

  rulers: [
    {
      id: 'anyone',
      when: { rulers: 'anyone' },
      label: 'Open to all citizens',
      term: '',
      because: 'Any citizen may hold office.',
    },
    {
      id: 'party-members',
      when: { rulers: 'party' },
      label: 'Party members',
      term: '',
      because: 'High office is reserved for members of the ruling party.',
    },
    {
      id: 'clergy-under-religious-leader',
      when: { rulers: 'clergy', headOfState: 'religious-leader' },
      label: 'Clergy',
      term: '',
      because: 'Religious leaders hold the highest offices, under the head of the faith.',
    },
    {
      id: 'clergy',
      when: { rulers: 'clergy' },
      label: 'Clergy',
      term: 'theocratic',
      because: 'Religious leaders hold the highest offices.',
    },
    {
      id: 'military',
      when: { rulers: 'military' },
      label: 'Military officers',
      term: 'military',
      because: 'Senior officers hold the highest offices.',
    },
    {
      id: 'technocracy',
      when: { rulers: 'experts' },
      label: 'Technocracy',
      term: 'technocratic',
      because: 'Office goes to people with proven expertise.',
    },
    {
      id: 'plutocracy',
      when: { rulers: 'wealthy' },
      label: 'Plutocracy',
      term: 'plutocratic',
      because: 'Only the rich hold office.',
    },
    {
      id: 'nobility-under-monarch',
      when: { rulers: 'nobility', headOfState: 'monarch' },
      label: 'Nobility',
      term: '',
      because: 'Noble families hold office under the monarch.',
    },
    {
      id: 'aristocracy',
      when: { rulers: 'nobility' },
      label: 'Aristocracy',
      term: 'aristocratic',
      because: 'Noble families hold the highest offices.',
    },
    {
      id: 'unrestricted',
      when: {},
      label: 'Open to all citizens',
      term: '',
      because: 'Any citizen may hold office.',
    },
  ],
} as const satisfies Record<string, readonly LabelRule[]>;

export type Family = keyof typeof families;

export const familyLabels: Record<Family, string> = {
  structure: 'Structure',
  system: 'System',
  form: 'Form',
  regime: 'Regime',
  rulers: 'Rulers',
};
