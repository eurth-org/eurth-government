import { describe as group, expect, it } from 'vitest';
import { describe } from './engine';
import { examples } from './examples';

/** What each example should come out as: name, regime and structure. */
const expected: Record<string, [name: string, regime: string, structure: string]> = {
  westminster: ['Unitary parliamentary constitutional monarchy', 'Liberal democracy', 'Unitary state with devolved regions'],
  american: ['Federal presidential republic', 'Liberal democracy', 'Federation'],
  french: ['Unitary semi-presidential republic', 'Liberal democracy', 'Unitary state'],
  german: ['Federal parliamentary republic', 'Liberal democracy', 'Federation'],
  swiss: ['Federal directorial republic', 'Liberal democracy', 'Federation'],
  malaysian: ['Federal parliamentary elective constitutional monarchy', 'Liberal democracy', 'Federation'],
  'one-party': ['Unitary one-party republic', 'One-party state', 'Unitary state'],
  'hereditary-one-party': ['Unitary one-party hereditary republic', 'One-party state', 'Unitary state'],
  managed: ['Federal semi-presidential republic', 'Electoral autocracy', 'Federation'],
  'absolute-monarchy': ['Unitary absolute monarchy', 'Closed autocracy', 'Unitary state'],
  'semi-constitutional': ['Unitary semi-constitutional monarchy', 'Electoral autocracy', 'Unitary state'],
  'theocratic-republic': ['Unitary presidential theocratic republic', 'Theocracy', 'Unitary state'],
  'holy-city': ['Unitary elective theocracy', 'Theocracy', 'City-state'],
  junta: ['Unitary military junta', 'Military dictatorship', 'Unitary state'],
  strongman: ['Unitary republic under a dictatorship', 'Closed autocracy', 'Unitary state'],
  'ancient-assembly': ['Unitary direct-democratic republic', 'Restricted democracy', 'City-state'],
  technocracy: ['Unitary parliamentary technocratic republic', 'Restricted democracy', 'Unitary state'],
  'world-federation': ['Federal parliamentary republic', 'Liberal democracy', 'World federation'],
};

group('examples', () => {
  it('has an expectation for every example', () => {
    expect(examples.map((e) => e.id).sort()).toEqual(Object.keys(expected).sort());
  });

  for (const example of examples) {
    it(`names the ${example.title}`, () => {
      const profile = describe(example.country);
      const [name, regime, structure] = expected[example.id]!;
      expect(profile.name).toBe(name);
      expect(profile.labels.regime.label).toBe(regime);
      expect(profile.labels.structure.label).toBe(structure);
    });

    it(`finds no conflicts in the ${example.title}`, () => {
      const conflicts = describe(example.country).checks.filter((c) => c.severity === 'conflict');
      expect(conflicts).toEqual([]);
    });
  }
});
