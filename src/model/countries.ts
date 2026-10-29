import { withBudget } from './budget';
import { defaultCountry } from './engine';
import type { Country } from './settings';

export type Region = 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Middle East' | 'Oceania';

export interface RealCountry {
  /** ISO 3166-1 alpha-2, or XK for Kosovo. */
  code: string;
  name: string;
  region: Region;
  country: Country;
  /** Set when the country is between constitutions, so the settings may contradict each other. */
  note?: string;
}

/*
 * The world's countries as Governmint sees them, as of 2026. Institutions follow each
 * country's constitution; how free elections are and how independent the courts are
 * follow the broad consensus of election observers and democracy indices. Religion,
 * foreign policy, military service and immigration are rough. Corrections welcome.
 */

type Part = Partial<Country>;

// Templates: the system a country starts from.
const parl: Part = {}; // parliamentary republic, president chosen by the legislature
const parlPop: Part = { headOfStateSelection: 'people' }; // ditto, president elected by the people
const pres: Part = { headOfStateSelection: 'people', government: 'head-of-state' };
const presPm: Part = { headOfStateSelection: 'people', government: 'pm-head-of-state' };
const semi: Part = { headOfStateSelection: 'people', government: 'pm-shared' };
const execParl: Part = { government: 'head-of-state' }; // president elected by and answerable to the legislature
const crown: Part = { headOfState: 'monarch', headOfStateSelection: 'inherited' };
const semiCrown: Part = { ...crown, government: 'pm-shared' };
const absCrown: Part = {
  ...crown,
  government: 'head-of-state',
  legislature: 'advisory',
  elections: 'none',
  parties: 'none',
  courts: 'controlled',
};
const oneParty: Part = {
  government: 'pm-head-of-state',
  legislature: 'indirect',
  elections: 'managed',
  parties: 'one',
  courts: 'controlled',
  rulers: 'party',
};
const junta: Part = {
  headOfStateSelection: 'force',
  government: 'head-of-state',
  legislature: 'appointed',
  elections: 'none',
  parties: 'none',
  courts: 'controlled',
  rulers: 'military',
};

// Modifiers.
const managed: Part = { elections: 'managed', courts: 'controlled' };
const fed: Part = { territory: 'federal' };
const devolved: Part = { territory: 'devolved' };
const two: Part = { chambers: 'two' };
const partly: Part = { chambers: 'two', legislature: 'partly-elected' };
const fptp: Part = { electoralSystem: 'majoritarian' };
const mixed: Part = { electoralSystem: 'mixed' };
const indep: Part = { courts: 'independent' };
const islam: Part = { religion: 'state-religion' };
const est: Part = { religion: 'established' };
const draft: Part = { conscription: 'universal' };
const lottery: Part = { conscription: 'selective' };
const neutral: Part = { foreignPolicy: 'neutral' };
const active: Part = { foreignPolicy: 'interventionist' };
const strict: Part = { immigration: 'restrictive' };
const noParties: Part = { parties: 'none' };

function c(code: string, name: string, region: Region, ...parts: Part[]): RealCountry {
  // Budget shares given in the parts stay as they are; the rest of the budget is scaled to fit.
  const merged: Country = Object.assign(defaultCountry(), ...parts);
  const shares = Object.fromEntries(parts.flatMap((p) => Object.entries(p)).filter(([key]) => key.startsWith('budget')));
  return { code, name, region, country: withBudget(merged, shares) };
}

/** Defence as a share of government spending, roughly. */
const defence = (share: number): Part => ({ budgetDefence: share });

function transitional(entry: RealCountry, note: string): RealCountry {
  return { ...entry, note };
}

export const countries: RealCountry[] = [
  // Africa
  c('DZ', 'Algeria', 'Africa', semi, partly, managed, islam, draft),
  c('AO', 'Angola', 'Africa', pres, managed),
  c('BJ', 'Benin', 'Africa', pres, managed),
  c('BW', 'Botswana', 'Africa', execParl, fptp),
  transitional(c('BF', 'Burkina Faso', 'Africa', junta, draft), 'Military government since the 2022 coups.'),
  c('BI', 'Burundi', 'Africa', presPm, partly, managed),
  c('CV', 'Cabo Verde', 'Africa', parlPop),
  c('CM', 'Cameroon', 'Africa', presPm, partly, fptp, managed),
  c('CF', 'Central African Republic', 'Africa', presPm, fptp, managed),
  c('TD', 'Chad', 'Africa', presPm, partly, managed),
  c('KM', 'Comoros', 'Africa', pres, fed, fptp, managed, islam),
  c('CD', 'DR Congo', 'Africa', semi, partly, managed),
  c('CG', 'Republic of the Congo', 'Africa', presPm, partly, fptp, managed),
  c('CI', "Côte d'Ivoire", 'Africa', presPm, partly, fptp, managed),
  c('DJ', 'Djibouti', 'Africa', presPm, mixed, managed, islam),
  c('EG', 'Egypt', 'Africa', semi, partly, mixed, managed, islam, draft),
  c('GQ', 'Equatorial Guinea', 'Africa', presPm, partly, managed, strict),
  c('ER', 'Eritrea', 'Africa', {
    headOfStateSelection: 'party',
    government: 'head-of-state',
    legislature: 'none',
    elections: 'none',
    parties: 'one',
    courts: 'controlled',
    rulers: 'party',
    conscription: 'universal',
    immigration: 'closed',
  }),
  c('SZ', 'Eswatini', 'Africa', crown, partly, fptp, managed, noParties, { government: 'pm-head-of-state' }),
  c('ET', 'Ethiopia', 'Africa', parl, fed, partly, fptp, managed),
  c('GA', 'Gabon', 'Africa', pres, partly, fptp, managed),
  c('GM', 'Gambia', 'Africa', pres, fptp),
  c('GH', 'Ghana', 'Africa', pres, fptp),
  transitional(
    c('GN', 'Guinea', 'Africa', presPm, managed, { legislature: 'appointed', rulers: 'military' }),
    'Military leader elected president in 2025; the legislature is still a transitional council.',
  ),
  transitional(c('GW', 'Guinea-Bissau', 'Africa', junta), 'Military government since the 2025 coup.'),
  c('KE', 'Kenya', 'Africa', pres, devolved, two, fptp),
  c('LS', 'Lesotho', 'Africa', crown, partly, mixed),
  c('LR', 'Liberia', 'Africa', pres, two, fptp),
  transitional(
    c('LY', 'Libya', 'Africa', {
      headOfState: 'council',
      headOfStateSelection: 'electors',
      government: 'pm-shared',
      elections: 'none',
      courts: 'controlled',
      ...islam,
    }),
    'Divided between rival governments; no national elections since 2014.',
  ),
  transitional(c('MG', 'Madagascar', 'Africa', junta, { headOfState: 'president' }), 'Military government since the 2025 coup.'),
  c('MW', 'Malawi', 'Africa', pres, fptp),
  transitional(c('ML', 'Mali', 'Africa', junta), 'Military government since the 2020 and 2021 coups; parties dissolved in 2025.'),
  c('MR', 'Mauritania', 'Africa', presPm, mixed, managed, islam, strict),
  c('MU', 'Mauritius', 'Africa', parl, fptp),
  c('MA', 'Morocco', 'Africa', semiCrown, partly, managed, islam, lottery),
  c('MZ', 'Mozambique', 'Africa', presPm, managed),
  c('NA', 'Namibia', 'Africa', presPm, partly),
  transitional(c('NE', 'Niger', 'Africa', junta, { legislature: 'advisory' }), 'Military government since the 2023 coup.'),
  c('NG', 'Nigeria', 'Africa', pres, fed, two, fptp),
  c('RW', 'Rwanda', 'Africa', presPm, partly, managed),
  c('ST', 'São Tomé and Príncipe', 'Africa', semi),
  c('SN', 'Senegal', 'Africa', semi, mixed),
  c('SC', 'Seychelles', 'Africa', pres, mixed),
  c('SL', 'Sierra Leone', 'Africa', pres),
  c('SO', 'Somalia', 'Africa', fed, islam, {
    government: 'pm-shared',
    legislature: 'indirect',
    chambers: 'two',
    elections: 'managed',
    parties: 'none',
    courts: 'controlled',
  }),
  c('ZA', 'South Africa', 'Africa', execParl, partly),
  transitional(
    c('SS', 'South Sudan', 'Africa', presPm, { headOfStateSelection: 'electors', legislature: 'appointed', elections: 'none', courts: 'controlled' }),
    'Transitional government; no national elections have been held since independence.',
  ),
  transitional(
    c('SD', 'Sudan', 'Africa', junta, { headOfState: 'council', government: 'pm-head-of-state', legislature: 'none' }),
    'Military council in power during the civil war.',
  ),
  c('TZ', 'Tanzania', 'Africa', pres, devolved, fptp, managed),
  c('TG', 'Togo', 'Africa', parl, partly, managed),
  c('TN', 'Tunisia', 'Africa', presPm, partly, fptp, managed, islam),
  c('UG', 'Uganda', 'Africa', pres, fptp, managed),
  c('ZM', 'Zambia', 'Africa', pres, fptp),
  c('ZW', 'Zimbabwe', 'Africa', pres, two, fptp, managed),

  // Americas
  c('AG', 'Antigua and Barbuda', 'Americas', crown, partly, fptp),
  c('AR', 'Argentina', 'Americas', pres, fed, two),
  c('BS', 'Bahamas', 'Americas', crown, partly, fptp),
  c('BB', 'Barbados', 'Americas', parl, partly, fptp),
  c('BZ', 'Belize', 'Americas', crown, partly, fptp),
  c('BO', 'Bolivia', 'Americas', pres, two, mixed),
  c('BR', 'Brazil', 'Americas', pres, fed, two, lottery),
  c('CA', 'Canada', 'Americas', crown, fed, partly, fptp),
  c('CL', 'Chile', 'Americas', pres, two),
  c('CO', 'Colombia', 'Americas', pres, two, lottery),
  c('CR', 'Costa Rica', 'Americas', pres, est, defence(0), { foreignPolicy: 'pacifist' }),
  c('CU', 'Cuba', 'Americas', oneParty, draft, strict, { legislature: 'elected' }),
  c('DM', 'Dominica', 'Americas', parl, fptp),
  c('DO', 'Dominican Republic', 'Americas', pres, two),
  c('EC', 'Ecuador', 'Americas', pres),
  c('SV', 'El Salvador', 'Americas', pres, managed),
  c('GD', 'Grenada', 'Americas', crown, partly, fptp),
  c('GT', 'Guatemala', 'Americas', pres),
  c('GY', 'Guyana', 'Americas', pres),
  transitional(
    c('HT', 'Haiti', 'Americas', {
      headOfState: 'council',
      headOfStateSelection: 'electors',
      government: 'pm-head-of-state',
      legislature: 'none',
      elections: 'none',
    }),
    'Run by a transitional council; no elected officials since 2023.',
  ),
  c('HN', 'Honduras', 'Americas', pres),
  c('JM', 'Jamaica', 'Americas', crown, partly, fptp),
  c('MX', 'Mexico', 'Americas', pres, fed, two, mixed, lottery),
  c('NI', 'Nicaragua', 'Americas', pres, managed, { headOfState: 'council' }),
  c('PA', 'Panama', 'Americas', pres, mixed, neutral, defence(0)),
  c('PY', 'Paraguay', 'Americas', pres, two, lottery),
  c('PE', 'Peru', 'Americas', pres, two),
  c('KN', 'Saint Kitts and Nevis', 'Americas', crown, fed, fptp),
  c('LC', 'Saint Lucia', 'Americas', crown, partly, fptp),
  c('VC', 'Saint Vincent and the Grenadines', 'Americas', crown, fptp),
  c('SR', 'Suriname', 'Americas', execParl),
  c('TT', 'Trinidad and Tobago', 'Americas', parl, partly, fptp),
  c('US', 'United States', 'Americas', pres, fed, two, fptp, active, defence(9), { budgetHealth: 22 }),
  c('UY', 'Uruguay', 'Americas', pres, two),
  c('VE', 'Venezuela', 'Americas', pres, fed, mixed, managed, draft),

  // Asia
  c('AF', 'Afghanistan', 'Asia', {
    headOfState: 'religious-leader',
    headOfStateSelection: 'electors',
    government: 'pm-head-of-state',
    legislature: 'none',
    elections: 'none',
    parties: 'none',
    courts: 'religious',
    rulers: 'clergy',
    religion: 'state-religion',
    immigration: 'restrictive',
  }),
  c('AM', 'Armenia', 'Asia', parl, draft),
  c('AZ', 'Azerbaijan', 'Asia', presPm, fptp, managed, draft, active),
  c('BD', 'Bangladesh', 'Asia', parl, fptp, est),
  c('BT', 'Bhutan', 'Asia', crown, two, fptp, est),
  c('BN', 'Brunei', 'Asia', absCrown, islam, strict),
  c('KH', 'Cambodia', 'Asia', crown, partly, managed, est, { headOfStateSelection: 'electors' }),
  c('CN', 'China', 'Asia', oneParty, strict, defence(5), { religion: 'state-atheism' }),
  c('GE', 'Georgia', 'Asia', parl, managed, lottery),
  c('IN', 'India', 'Asia', parl, fed, partly, fptp, defence(9)),
  c('ID', 'Indonesia', 'Asia', pres, two),
  c('JP', 'Japan', 'Asia', crown, two, mixed, strict),
  c('KZ', 'Kazakhstan', 'Asia', presPm, partly, mixed, managed, draft),
  c('KG', 'Kyrgyzstan', 'Asia', pres, mixed, managed, draft),
  c('LA', 'Laos', 'Asia', oneParty, lottery, { legislature: 'elected' }),
  c('MY', 'Malaysia', 'Asia', crown, fed, partly, fptp, est, { headOfStateSelection: 'electors' }),
  c('MV', 'Maldives', 'Asia', pres, fptp, islam, { suffrageLimits: ['citizenship', 'religion'] }),
  c('MN', 'Mongolia', 'Asia', parlPop, mixed),
  c('MM', 'Myanmar', 'Asia', execParl, partly, fptp, managed, draft, { rulers: 'military' }),
  c('NP', 'Nepal', 'Asia', parl, fed, partly, mixed),
  c('KP', 'North Korea', 'Asia', oneParty, draft, defence(25), {
    headOfStateSelection: 'inherited',
    legislature: 'elected',
    religion: 'state-atheism',
    immigration: 'closed',
  }),
  c('PK', 'Pakistan', 'Asia', parl, fed, partly, fptp, managed, islam, defence(14)),
  c('PH', 'Philippines', 'Asia', pres, two, mixed),
  c('SG', 'Singapore', 'Asia', parlPop, fptp, indep, draft, { elections: 'managed' }),
  c('KR', 'South Korea', 'Asia', presPm, mixed, draft),
  c('LK', 'Sri Lanka', 'Asia', semi, est),
  c('TW', 'Taiwan', 'Asia', semi, mixed, draft),
  c('TJ', 'Tajikistan', 'Asia', presPm, partly, mixed, managed, draft),
  c('TH', 'Thailand', 'Asia', crown, partly, mixed, est, lottery, { courts: 'controlled' }),
  c('TL', 'Timor-Leste', 'Asia', semi),
  c('TM', 'Turkmenistan', 'Asia', pres, managed, neutral, draft, { immigration: 'closed' }),
  c('UZ', 'Uzbekistan', 'Asia', presPm, partly, mixed, managed, draft),
  c('VN', 'Vietnam', 'Asia', oneParty, draft, { legislature: 'elected' }),

  // Europe
  c('AL', 'Albania', 'Europe', parl),
  c('AD', 'Andorra', 'Europe', crown, est, { headOfStateSelection: 'electors' }),
  c('AT', 'Austria', 'Europe', parlPop, fed, partly, neutral, draft),
  c('BY', 'Belarus', 'Europe', presPm, partly, fptp, managed, draft),
  c('BE', 'Belgium', 'Europe', crown, fed, partly),
  c('BA', 'Bosnia and Herzegovina', 'Europe', fed, partly, { headOfState: 'council', headOfStateSelection: 'people' }),
  c('BG', 'Bulgaria', 'Europe', parlPop),
  c('HR', 'Croatia', 'Europe', parlPop),
  c('CY', 'Cyprus', 'Europe', pres, draft),
  c('CZ', 'Czechia', 'Europe', parlPop, two),
  c('DK', 'Denmark', 'Europe', crown, est, indep, lottery),
  c('EE', 'Estonia', 'Europe', parl, draft),
  c('FI', 'Finland', 'Europe', parlPop, est, draft),
  c('FR', 'France', 'Europe', semi, partly, fptp, active),
  c('DE', 'Germany', 'Europe', parl, fed, partly, mixed),
  c('GR', 'Greece', 'Europe', parl, est, draft),
  c('HU', 'Hungary', 'Europe', parl, mixed),
  c('IS', 'Iceland', 'Europe', parlPop, est, defence(0)),
  c('IE', 'Ireland', 'Europe', parlPop, partly, neutral),
  c('IT', 'Italy', 'Europe', parl, two, mixed),
  c('XK', 'Kosovo', 'Europe', parl),
  c('LV', 'Latvia', 'Europe', parl, lottery),
  c('LI', 'Liechtenstein', 'Europe', semiCrown, est, neutral),
  c('LT', 'Lithuania', 'Europe', semi, mixed, lottery),
  c('LU', 'Luxembourg', 'Europe', crown),
  c('MT', 'Malta', 'Europe', parl, est, neutral),
  c('MD', 'Moldova', 'Europe', parlPop, neutral),
  c('MC', 'Monaco', 'Europe', crown, est, { government: 'pm-head-of-state' }),
  c('ME', 'Montenegro', 'Europe', parlPop),
  c('NL', 'Netherlands', 'Europe', crown, partly, indep),
  c('MK', 'North Macedonia', 'Europe', parlPop),
  c('NO', 'Norway', 'Europe', crown, est, lottery),
  c('PL', 'Poland', 'Europe', semi, two),
  c('PT', 'Portugal', 'Europe', semi),
  c('RO', 'Romania', 'Europe', semi, two),
  c('RU', 'Russia', 'Europe', semi, fed, partly, mixed, managed, draft, defence(22), { foreignPolicy: 'expansionist' }),
  c('SM', 'San Marino', 'Europe', est, { headOfState: 'council', government: 'council' }),
  c('RS', 'Serbia', 'Europe', parlPop),
  c('SK', 'Slovakia', 'Europe', parlPop),
  c('SI', 'Slovenia', 'Europe', parlPop, partly),
  c('ES', 'Spain', 'Europe', crown, devolved, two),
  c('SE', 'Sweden', 'Europe', crown, indep, lottery),
  c('CH', 'Switzerland', 'Europe', fed, two, neutral, draft, { headOfState: 'council', government: 'council' }),
  c('UA', 'Ukraine', 'Europe', semi, draft, defence(45)),
  c('GB', 'United Kingdom', 'Europe', crown, devolved, partly, fptp, indep, est, active),
  c('VA', 'Vatican City', 'Europe', {
    extent: 'city',
    headOfState: 'religious-leader',
    headOfStateSelection: 'electors',
    government: 'head-of-state',
    legislature: 'appointed',
    elections: 'none',
    parties: 'none',
    courts: 'religious',
    rulers: 'clergy',
    religion: 'state-religion',
    foreignPolicy: 'neutral',
    immigration: 'closed',
  }),

  // Middle East
  c('BH', 'Bahrain', 'Middle East', crown, partly, managed, noParties, islam, strict, { government: 'pm-head-of-state' }),
  c('IR', 'Iran', 'Middle East', fptp, managed, draft, active, strict, {
    headOfState: 'religious-leader',
    headOfStateSelection: 'electors',
    government: 'elected-leader',
    courts: 'religious',
    rulers: 'clergy',
    religion: 'state-religion',
  }),
  c('IQ', 'Iraq', 'Middle East', parl, fed, islam),
  c('IL', 'Israel', 'Middle East', parl, indep, est, draft, active, defence(12)),
  c('JO', 'Jordan', 'Middle East', semiCrown, partly, mixed, managed, islam, draft),
  c('KW', 'Kuwait', 'Middle East', absCrown, islam, draft, strict, { legislature: 'none' }),
  c('LB', 'Lebanon', 'Middle East', parl, est),
  c('OM', 'Oman', 'Middle East', absCrown, islam, strict, { elections: 'managed' }),
  c('PS', 'Palestine', 'Middle East', presPm, managed, islam, { legislature: 'none' }),
  c('QA', 'Qatar', 'Middle East', absCrown, islam, draft, strict),
  c('SA', 'Saudi Arabia', 'Middle East', absCrown, islam, active, strict, defence(22), { courts: 'religious' }),
  transitional(
    c('SY', 'Syria', 'Middle East', execParl, islam, {
      headOfStateSelection: 'electors',
      legislature: 'indirect',
      elections: 'none',
      parties: 'none',
      courts: 'controlled',
    }),
    'Transitional government since the fall of the Assad regime in 2024.',
  ),
  c('TR', 'Turkey', 'Middle East', pres, managed, draft, active),
  c('AE', 'United Arab Emirates', 'Middle East', crown, fed, islam, active, strict, {
    headOfStateSelection: 'electors',
    government: 'pm-head-of-state',
    legislature: 'advisory',
    elections: 'managed',
    parties: 'none',
    courts: 'controlled',
  }),
  transitional(
    c('YE', 'Yemen', 'Middle East', islam, {
      headOfState: 'council',
      headOfStateSelection: 'electors',
      government: 'pm-head-of-state',
      elections: 'none',
      courts: 'controlled',
    }),
    'Civil war; a presidential council governs, and the legislature dates from 2003.',
  ),

  // Oceania
  c('AU', 'Australia', 'Oceania', crown, fed, two, fptp),
  c('FJ', 'Fiji', 'Oceania', parl),
  c('KI', 'Kiribati', 'Oceania', pres, fptp),
  c('MH', 'Marshall Islands', 'Oceania', execParl, fptp),
  c('FM', 'Micronesia', 'Oceania', execParl, fed, fptp, noParties),
  c('NR', 'Nauru', 'Oceania', execParl, fptp, noParties),
  c('NZ', 'New Zealand', 'Oceania', crown, mixed, indep),
  c('PW', 'Palau', 'Oceania', pres, devolved, two, fptp, noParties),
  c('PG', 'Papua New Guinea', 'Oceania', crown, fptp, est),
  c('WS', 'Samoa', 'Oceania', parl, fptp, est),
  c('SB', 'Solomon Islands', 'Oceania', crown, fptp),
  c('TO', 'Tonga', 'Oceania', crown, fptp, { legislature: 'partly-elected' }),
  c('TV', 'Tuvalu', 'Oceania', crown, fptp, noParties),
  c('VU', 'Vanuatu', 'Oceania', parl, fptp),
];
