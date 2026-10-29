# Roadmap

Governmint is a tool, not a game: you set up a country and it tells you what you've built. It's for anyone, with Eurth in the background as the community that makes it and the first world whose countries you can browse.

## What sets it apart

The Filteries Political Simulator (2016–2018) and its successor StateCrafter answer "which real-world ideology is this?". Governmint answers "what is my country like, and does it hold together?"

1. **Builds a country, doesn't grade a quiz.** The result is a country profile you can paste into a wiki infobox or a forum post.
2. **No account.** The whole country lives in its link.
3. **Explains itself.** Every label shows which settings produced it and links to Wikipedia. The rules live in readable data files, so changes are reviewed as pull requests.
4. **Catches contradictions.** A pacifist state spending 12% of its budget on defence, or a prime minister answerable to a legislature that doesn't exist.
5. **Search and compare.** 197 real countries and 18 examples to start from or compare against.
6. **Works everywhere.** Mobile-first, light and dark, contrast checked by tests.

Have an idea? [Table a motion in Ideas](https://github.com/eurth-org/eurth-government/discussions/categories/ideas) on GitHub Discussions.

## Phases

Each phase ships on its own.

| Phase | What | Status |
| --- | --- | --- |
| **0. Groundwork** | Repo, licence, static site, Cloudflare Worker on gov.eurth.org, CI, automatic deploys | Done; automatic deploys wait on the `CLOUDFLARE_API_TOKEN` secret |
| **1. Model** | Settings, axes, naming rules and checks as data, with tests; see [docs/model.md](docs/model.md) | Done for government and the budget |
| **2. Government** | The tool: government settings, labels with reasons, scales, contradiction checks, examples, link sharing | Done (preview) |
| **3. Economy and budget** | Budget shares, then sectors, taxes, GDP, ownership, regulation; economic left and right on the compass | Budget done; the rest to do |
| **4. Law and society** | What's legal or illegal; rights; a society scale | To do |
| **5. Sharing** | Markdown and wikitext exports, chart downloads; BBCode, JSON, an image card | Markdown, wikitext and downloads done |
| **6. Discover** | Search and compare countries, starting with Eurth's | Real countries done; Eurth's countries to do |
| **7. Launch** | Replace old Filteries links in Eurth's Worldbuilding Tools docs, announce on the forum and Discord, add to status.eurth.org | To do |

## Updates

Times in UTC. Pull requests are on [GitHub](https://github.com/eurth-org/eurth-government/pulls?q=is%3Apr).

| Update | When | Added |
| --- | --- | --- |
| Groundwork (`7c03450`) | 29 Oct 2026, 09:12 | Phase 0: repository, licence, placeholder page, Worker configuration, CI |
| gov.eurth.org (`e8e29dd`) | 29 Oct 2026, 09:22 | Live on gov.eurth.org through Cloudflare |
| #1 Preview | 29 Oct 2026, 11:32 | Phase 1 model for government; phase 2 tool; eurth.org look; 18 examples; settings in the link; deploy job in CI |
| #2 Feedback rounds 1 and 2 | 29 Oct 2026, 14:18 | Feedback 1–26: icons, sticky section bar with search, buttons for short lists, citizenship, 197 real countries, picker, draggable scales, spider chart, compass, Markdown and wikitext, Deluminator, budget and Welfare scale, contrast test |
| #3 Feedback round 3 | 29 Oct 2026, 15:21 | Feedback 27–57: Eurth blue, Wikipedia links and label icons, one-sentence summary, restricted candidacy, chart downloads, budget pie, grouped and enlargeable compass, find-in-page search, turning globe, this roadmap, suggestions on GitHub Discussions, animated switch icons, small delights, a wobbling shape and a resident spider |

## What's in so far

The update that added each item is in brackets.

**Model** (`src/model/`)
- 27 settings in 9 sections: the state, head of state, government, legislature, elections, courts and rulers, religion, defence and borders, and a budget of ten areas (the UN's COFOG) that always adds up to 100% (#1; citizenship #2; budget #2).
- Five labels with a reason, an icon and a Wikipedia article each: structure, system, form, regime, rulers. They combine into a full name, such as "Federal presidential republic" (#1; icons and Wikipedia #3).
- Regimes after political science's usual split (closed and electoral autocracy, electoral and liberal democracy), plus one-party states, military dictatorships, theocracies, and restricted, direct and non-partisan democracies (#1; restricted candidacy #3).
- Eight scales: participation, competition, checks and balances, decentralisation, religion, militarism, welfare, openness (#1; welfare #2).
- 25 contradiction checks, from "no legislature to answer to" to "a world government has no foreign countries left" (#1; budget checks #2).
- 18 examples and 197 real countries (UN members, Kosovo, Palestine, Taiwan, Vatican City), as of 2026 (examples #1; countries #2).

**The tool**
- Settings as buttons or dropdowns, with a one-line explanation of each choice (#1; buttons #2).
- A sticky section bar: where you are, a progress line, arrows when sections are off to the side, and settings search that works like find-in-page (#2; arrows and find-in-page #3).
- Start from an example or a real country, searchable by name or type (#2).
- The result: the name, a one-sentence summary, why each label applies, and what to look at again (#1; summary #3).
- Scales you can drag: they suggest the changes that would move them, and apply them (#2).
- A spider chart, a compass with examples or real countries as reference points (grouped where they overlap, enlargeable), and a budget chart as bar or pie (#2; grouping, enlarge and pie #3).
- Copy the link, Markdown for the Eurth.org forum, wikitext for IIWiki, and PNG or SVG downloads of every chart, all in the browser (link #1; Markdown and wikitext #2; downloads #3).

**Look and accessibility**
- eurth.org's look: Eurth blue top bar, the turning Eurth globe, the forum's light and Solarized dark schemes, Font Awesome icons in Eurth's category colours (#1; icons #2; Eurth blue #3).
- The Deluminator light/dark switch, with its animated sun and moon (#2; animation restored #3).
- Small delights: a shine on each new name, fictional country names as placeholder, a waving flag, popping check marks and more, all off for reduced motion (#3).
- A contrast test for every colour pair in both themes, with the Eurth-blue brand decisions listed as named exceptions (#2; exceptions #3).
- The favicon is the Eurth globe, turning where the browser allows (#2; turning #3).

## Feedback log

Every numbered point from the reviews, and the update that did it.

| # | Asked for | Done |
| --- | --- | --- |
| 1 | Informative icons | Font Awesome icons throughout (#2) |
| 2 | Sticky header to navigate the page | Section bar with search (#2) |
| 3 | Citizenship as a voting limit | Added, on by default (#2) |
| 4 | Radio buttons for short lists | Buttons for four options or fewer (#2) |
| 5 | Filteries' spider web | Spider chart (#2) |
| 6 | A political compass | Compass, cultural left–right until the economy arrives (#2) |
| 7 | What StateCrafter has that we don't | Adopted search and reference points; the rest under "Ideas" (#2) |
| 8 | Searchable examples | "Start from…" picker (#2) |
| 9 | Real countries of the world | 197 countries (#2) |
| 10 | Icons at both ends of each scale | Done (#2) |
| 11 | Interactive scales | Drag for suggestions; settings flash; Apply (#2) |
| 12 | Markdown and wikitext | Forum Markdown, IIWiki `{{Infobox country}}` (#2) |
| 13 | Deluminator | Light/dark switch (#2) |
| 14 | Readable top bar | White text; later white pills (#2, #3) |
| 15 | Compass after StateCrafter's, in Eurth style | Done (#2) |
| 16 | Sorted, searchable examples | Done (#2) |
| 17 | Blue selected options with a white ✔ | Done (#2) |
| 18 | Sticky header shows where you are | Fixed (#2) |
| 19 | One person as head of state and government | Clearer wording (#2) |
| 20 | Slightly rounded buttons with hover | Done (#2) |
| 21 | Icons in the colour of their squares | Done (#2) |
| 22 | White flash when going dark | Fixed (#2) |
| 23 | Budget as shares of the government budget | COFOG budget, Welfare scale (#2) |
| 24 | "Markdown" and "Wikitext" buttons | Done (#2) |
| 25 | The correct Eurth blue in the banner | Done (#2) |
| 26 | The Eurth globe as favicon | Done; reworked in #3 |
| 27 | Square chips in the sticky header | Done (#3) |
| 28 | No coloured squares next to coloured icons | Removed (#3) |
| 29 | Eurth blue (P3) for buttons and charts | Done, as a brand exception (#3) |
| 30 | Clearer than "Where it stands" | Renamed "Scales" (#3) |
| 31 | Hints stay open after Apply | Done (#3) |
| 32 | "Structure: Unitary state", icons, Wikipedia | Done (#3) |
| 33 | Name card: flag, one-sentence summary | Done; fixed the "military liberal democracy" contradiction (#3) |
| 34 | A twitch when pointing at the spider web | Done (#3) |
| 35 | Explain the spider chart | Done (#3) |
| 36 | PNG and SVG downloads of the spider chart | Done, in the browser (#3) |
| 37 | Budget area and share on hover | Done (#3) |
| 38 | Budget as a pie, with downloads | Done (#3) |
| 39 | "Made by Eurth…" as one link | Done (#3) |
| 40 | About: aligned, icons, NationStates, Wikipedia | Done (#3) |
| 41 | Globe favicon in Safari and Chrome | Still PNG plus a script that turns it; Safari stays still (#3) |
| 42 | Credit to Orioni, Eurth since 2004 | Done (#3) |
| 43 | Scales shown as percentages | Done (#3) |
| 44 | The same slider in every browser | Custom slider (#3) |
| 45 | Show that the sticky header scrolls sideways | Arrows and fades (#3) |
| 46 | Real countries clustered on the compass | Grouped dots with counts (#3) |
| 47 | Interactive, enlargeable compass with downloads | Done (#3) |
| 48 | Google Search Console | Not needed: the eurth.org domain property covers it |
| 49 | Step through search matches | Find-in-page search (#3) |
| 50 | White top-bar buttons with Eurth blue text | Done (#3) |
| 51 | Keep track of it all here | This file (#3) |
| 52 | Which update added what, and when | The Updates table and the brackets above (#3) |
| 53 | Let people suggest roadmap items | GitHub Discussions with an Ideas category, linked from the footer and here (#3) |
| 54 | Animated Deluminator icons | Deluminator's own sun and moon again: drawn on each switch, turning rays, twinkling stars, redrawn on hover (#3) |
| 55 | More delightful details | A shine on each freshly minted name, fictional (and Eurth) country names as placeholder, a waving flag, popping check marks, a winding reset arrow, lifting pie slices, growing slider handles, nudging section icons, a beating heart; none for reduced motion (#3) |
| 56 | Wobble the blue shape, not the web, when its edge is crossed | Done (#3) |
| 57 | Now and then, a tiny spider that follows the pointer | About one visit in three; leaves with the pointer; none for reduced motion (#3) |

## Ideas

Not planned yet, but worth keeping:

- From StateCrafter: how closely a country matches named ideologies, quizzes, saved countries.
- Two countries side by side.
- A guided mode for beginners.
- Eurth's own countries in the picker and on the compass, once their data is ready.
- An image card for social media, and link previews per country (would need the Worker to render images).

Not planned: accounts, galleries, comments, or anything else that needs a server.
