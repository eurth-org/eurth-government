# How Governmint's model works

Governmint takes a country's settings and works out what kind of state they describe. Everything it says comes from the files in `src/model/`, which are written as plain data so they can be read and reviewed without knowing the engine.

## From settings to a profile

A **country** is one answer to each setting in [`settings.ts`](../src/model/settings.ts): who the head of state is, how they're chosen, who makes the laws, how free elections are, and so on. Most settings take one option; "Voting limited by" takes any number.

From a country, the engine in [`engine.ts`](../src/model/engine.ts) builds a **profile**:

- **Five labels**, each with a one-sentence reason and the settings it's based on:
  - *Structure*: unitary state, federation, city-state, world federation…
  - *System*: parliamentary, presidential, semi-presidential, directorial…
  - *Form*: republic, constitutional monarchy, theocracy, junta…
  - *Regime*: liberal democracy, electoral democracy, electoral autocracy, closed autocracy, plus one-party states, military dictatorships and theocracies.
  - *Rulers*: who may hold office, such as clergy, experts or nobility.
- **A full name**, put together from the labels: structure, system, regime, rulers, form. For example "Federal" + "presidential" + "republic", or "Unitary" + "one-party" + "republic".
- **Seven axes** from 0 to 100: participation, competition, checks and balances, decentralisation, religion, militarism and openness.
- **Checks**: combinations that contradict each other ("conflict") or are possible but odd ("unusual").

## Naming rules

[`naming.ts`](../src/model/naming.ts) has one ordered list of rules per label. The first rule whose `when` matches wins, so specific rules come before general ones, and each list ends with a rule that always matches.

```ts
{
  id: 'constitutional-monarchy',
  when: { headOfState: 'monarch', government: ['pm-legislature', 'council', 'elected-leader'] },
  label: 'Constitutional monarchy',
  term: 'constitutional monarchy',
  because: 'The monarch reigns, but a government that answers to others governs.',
}
```

A `when` lists settings and the options that make the rule apply:

| Write | Means |
| --- | --- |
| `headOfState: 'monarch'` | the setting is that option |
| `headOfState: ['president', 'council']` | it's any of these |
| `headOfState: { not: 'monarch' }` | it's anything except this (or these) |
| `suffrageLimits: { any: ['sex', 'property'] }` | at least one of these is picked |
| `suffrageLimits: { none: ['sex'] }` | none of these is picked |
| `suffrageLimits: { empty: false }` | at least one option is picked |
| `anyOf: [{…}, {…}]`, `allOf`, `noneOf` | combine conditions |

`term` is what the label adds to the full name (`''` adds nothing). In `because`, `{settingId}` is replaced with the chosen option, so "chosen by {headOfStateSelection}" reads "chosen by popular vote".

The regime labels follow political science's usual split between closed autocracy, electoral autocracy, electoral democracy and liberal democracy, with a few named types (one-party state, military dictatorship, theocracy, restricted and direct democracy) checked first.

## Axes

Each option in `settings.ts` can push an axis from -2 to 2. A country's score is where its total lands between the lowest and highest totals its settings could reach, so 0 and 100 are the extremes the tool can express. The profile lists which settings moved each axis.

## Checks

[`checks.ts`](../src/model/checks.ts) lists combinations worth pointing out. Every check whose `when` matches is shown. Use `conflict` when the settings can't both be true, and `unusual` when they can, but a reader would raise an eyebrow.

## Changing the model

1. Edit the data: a new option in `settings.ts`, a rule in `naming.ts`, a check in `checks.ts`. TypeScript flags misspelled settings and options.
2. If the change affects a name, add or update an example in [`examples.ts`](../src/model/examples.ts) and its expected name in `examples.test.ts`. The examples are also the presets in the tool's Examples menu.
3. Run `npm test`. The tests check every example, the data's consistency, and 3,000 random countries.

Write labels and reasons in plain British English, one sentence each, in your own words. Nothing may be copied from the Filteries Political Simulator; see the README.

## Coming later

Economy and budget (phase 3) and law and society (phase 4) add their own settings and axes in the same format.
