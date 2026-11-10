/**
 * The rules for counting minted countries, kept apart from the Worker so they can be tested.
 * The count is one number. Nothing about the visitor or the country is kept.
 */

/** At most this many mints are counted in any one minute, so a flood can't run the number up. */
export const mintsPerMinute = 60;

/** A mint only counts when the page that sends it is Governmint itself. */
export function fromGovernmint(origin: string | null, self: string): boolean {
  return origin === self;
}

/** This minute's tally: how many mints have been counted in it so far. */
export interface Tally {
  minute: number;
  counted: number;
}

/**
 * Whether a mint at `now` (milliseconds) counts, and the tally that follows. A new minute starts
 * a new tally.
 */
export function take(tally: Tally | undefined, now: number): { counts: boolean; tally: Tally } {
  const minute = Math.floor(now / 60_000);
  const current = tally && tally.minute === minute ? tally : { minute, counted: 0 };
  if (current.counted >= mintsPerMinute) return { counts: false, tally: current };
  return { counts: true, tally: { minute, counted: current.counted + 1 } };
}
