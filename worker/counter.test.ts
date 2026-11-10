import { describe, expect, it } from 'vitest';
import { fromGovernmint, mintsPerMinute, take } from './counter';

describe('counting minted countries', () => {
  it('only counts mints sent by Governmint itself', () => {
    expect(fromGovernmint('https://gov.eurth.org', 'https://gov.eurth.org')).toBe(true);
    expect(fromGovernmint('https://evil.example', 'https://gov.eurth.org')).toBe(false);
    expect(fromGovernmint(null, 'https://gov.eurth.org')).toBe(false);
  });

  it('counts at most so many a minute, then starts again', () => {
    let tally;
    const now = Date.UTC(2026, 10, 10, 12, 0, 5);
    for (let i = 0; i < mintsPerMinute; i++) {
      const step = take(tally, now);
      expect(step.counts).toBe(true);
      tally = step.tally;
    }
    expect(take(tally, now).counts).toBe(false);
    expect(take(tally, now + 60_000).counts).toBe(true);
  });
});
