import type { Profile } from './engine';

/**
 * A national motto in Eurth's dry humour, chosen by the regime and fixed for a given set of
 * settings, so the same country always gets the same motto.
 */
const mottos: Record<string, string[]> = {
  'liberal-democracy': ['In Committees We Trust', 'Checks, Balances, Biscuits', 'Consensus, Eventually', 'Ask Your Representative'],
  'electoral-democracy': ['One Person, One Vote, One Recount', 'Free Elections, Mostly', 'Democracy, Some Assembly Required'],
  'electoral-democracy-weak-courts': ['The Judges Agree With Us', 'Elected, Therefore Right'],
  'non-partisan-democracy': ['No Parties, Just People', 'Independent, Like Everyone Else'],
  'restricted-democracy': ['Liberty for Some', 'Everyone Welcome (Terms Apply)', 'Equal, Within Reason'],
  'restricted-candidacy': ['Anyone May Vote for Us', 'Choose Wisely, From Our List'],
  'direct-democracy': ['Let Us Vote On It', 'Everyone Has a Say, at Length', 'Motion Carried, Eventually'],
  'electoral-autocracy': ['Free and Fair, Ask Anyone', 'Ninety-Nine Percent Agree', 'The Count Is Final'],
  'unelected-ruler': ['You Vote, We Decide', 'Consulted, Not Asked'],
  'nothing-to-elect': ['Ballots Optional', 'Elections for Everything Else'],
  'closed-autocracy': ['Because I Said So', 'Order Above All', 'No Questions, Please'],
  dictatorship: ['Because I Said So', 'Stability, Whatever It Takes', 'Here to Stay'],
  'one-party-state': ['One Party, Many Opinions (Privately)', 'United in Agreement', 'All in Favour'],
  'military-dictatorship': ['Discipline, Duty, Parades', 'Peace Through Superior Parades', 'Atten-tion!'],
  theocracy: ['Faith, Order, Forms in Triplicate', 'As Above, So Below', 'Blessed Be the Paperwork'],
};

const fallback = ['Freshly Minted', 'Sovereign, Mostly', 'Here We Stand'];

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** `seed` is anything that changes with the country, such as its link code. */
export function motto(profile: Profile, seed: string): string {
  const list = mottos[profile.labels.regime.rule] ?? fallback;
  return list[hash(seed) % list.length]!;
}
