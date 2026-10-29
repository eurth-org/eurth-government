import type { AxisDef } from './types';

/**
 * The scales a country is scored on. Each option in settings.ts says how far it pushes
 * an axis (-2 to 2); the score is where the country lands between the lowest and highest
 * totals its settings could reach. Economy and society axes arrive in later phases.
 */
export const axes = [
  {
    id: 'participation',
    label: 'Participation',
    low: 'Few have a say',
    high: 'Everyone has a say',
    help: 'How many people take part in choosing who governs and what the law is.',
  },
  {
    id: 'competition',
    label: 'Competition',
    low: 'Power is uncontested',
    high: 'Power is contested',
    help: 'How freely rivals can compete for power, and win it.',
  },
  {
    id: 'checks',
    label: 'Checks and balances',
    low: 'Concentrated',
    high: 'Divided',
    help: 'How far power is split between institutions that can stop each other.',
  },
  {
    id: 'decentralisation',
    label: 'Decentralisation',
    low: 'Centralised',
    high: 'Decentralised',
    help: 'How much power sits with regions rather than the centre.',
  },
  {
    id: 'religion',
    label: 'Religion',
    low: 'Secular',
    high: 'Religious',
    help: 'How much religion shapes government and law.',
  },
  {
    id: 'militarism',
    label: 'Militarism',
    low: 'Pacifist',
    high: 'Militarist',
    help: 'How large a role the armed forces play, at home and abroad.',
  },
  {
    id: 'openness',
    label: 'Openness',
    low: 'Closed',
    high: 'Open',
    help: 'How open the state is to other countries and newcomers.',
  },
] as const satisfies readonly AxisDef[];

export type AxisId = (typeof axes)[number]['id'];
