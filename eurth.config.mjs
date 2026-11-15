// What this tool is called and where it lives. Read at build time only: astro.config.mjs, the
// frontmatter of .astro pages, tests and tools/. Never import this from a Svelte component or a
// <script>: it pulls in the list of every Eurth tool, and browser code must not carry that
// (HANDBOOK.md, Launch). Hand the component what it needs as props instead.
import { defineSite } from '@eurth/style/build';

export const site = defineSite({
  // The subdomain, and the tool's id in @eurth/style's tools.json.
  id: 'gov',
  name: 'Governmint',
  url: 'https://gov.eurth.org',
  // "<Name>: free online <thing> maker for worldbuilders"
  title: 'Governmint: free online government maker for worldbuilders',
  description: "A free online government maker for worldbuilders: set up a country and its budget, and see what kind of state you've made, why, and where it contradicts itself.",
  tagline: 'Freshly minted governments',
  // One page for now; the guide, the glossary and the examples are next (roadmap.md).
  pages: [{ href: '/', label: 'Maker' }],
  repo: 'https://github.com/eurth-org/eurth-government',
  ogAlt: 'Governmint, freshly minted governments, at gov.eurth.org: the Eurth yurt beside the gold Eurth coin.',
  // The coin clinks, once sound is switched on in the footer.
  sound: true,
  llms: `## What it does

- 27 settings in 9 sections (the state, head of state, government, legislature, elections, courts and rulers, religion, defence and borders, and a budget of ten areas) name the kind of state a country is, with the reason for each label.
- Eight scales, a spider chart, a compass, and checks that point out where the settings contradict each other.
- A country lives in its link: https://gov.eurth.org/?c=<settings>&n=<name>. The settings code starts with its version number.
- 18 examples and 197 real countries to start from. Their pictures are simplified and approximate, as of 2026.`,
});
