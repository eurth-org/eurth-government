# Roadmap

Governmint is a tool, not a game: you set up a country and it tells you what you've built. It's for anyone, with Eurth in the background as the community that makes it and the first world whose countries you can browse.

## What sets it apart

The Filteries Political Simulator (2016–2018) and its successor StateCrafter answer "which real-world ideology is this?". Governmint answers "what is my country like, and does it hold together?"

1. **Builds a country, doesn't grade a quiz.** The result is a country profile you can paste into a wiki infobox or a forum post.
2. **No account.** The whole country lives in its link, and Save keeps a list in your own browser.
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
| **5. Sharing** | Markdown and wikitext exports, chart downloads, saving; BBCode, JSON, an image card | Markdown, wikitext, downloads and saving done |
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
| #4 Feedback round 4 | 29 Oct 2026, 16:21 | Feedback 58–81: budget legend and treemap, credit on downloads, Random, Save, undo and redo, restore budget, real flags, keyboard shortcuts, plucked edges on the spider chart, smoother movement, sixteen new delights, a 404 page, `?ref` on outgoing links, Auto for the theme switch |
| #5 Feedback round 5 | 29 Oct 2026, 17:10 | Feedback 82–100: a sharing image for link previews, a share window, famous fictional and NationStates nations for Random, the dice beside the name, real countries recognised by name, a tidier header, stepping through a second look, clearer treemap labels, a spider that stays on its web, About in a window and a lighter footer, an accessibility pass |

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
- A sticky section bar: where you are, a progress line, arrows when sections are off to the side, and settings search that works like find-in-page (#2; arrows and find-in-page #3; steady chip widths #4).
- Start from an example, a real country (with its flag) or a country saved on this device, searchable by name or type (#2; flags and saved #4).
- Undo and Redo, Save, and a Random country beside the name, named after a famous fictional nation or one from NationStates issues, with its source; keyboard shortcuts for each (press ?) (#4; names and dice #5).
- Type a real country's name and its real government is a click away, with its flag (#5).
- The result: the name, a motto, a one-sentence summary, why each label applies (the label itself links to Wikipedia), and what to look at again, stepping through the settings involved (#1; summary #3; motto and label links #4; stepping #5).
- Scales you can drag: they suggest the changes that would move them, and apply them (#2).
- A spider chart, a compass with examples or real countries as reference points (grouped where they overlap, enlargeable), and a budget chart as bar, pie or treemap with its legend inside; restore the budget a country started with (#2; grouping, enlarge and pie #3; treemap, legend and restore #4).
- Share to the Eurth forum, Reddit, Bluesky, X, Facebook, LinkedIn, Tumblr, WhatsApp, Telegram or email, or the device's share sheet (#5).
- Copy the link, save on this device, Markdown for the Eurth.org forum, wikitext for IIWiki, and PNG or SVG downloads of every chart with a small gov.eurth.org credit, all in the browser (link #1; Markdown and wikitext #2; downloads #3; saving and credit #4).
- Charts, scales and the compass glide to new values instead of jumping (#4).

**Look and accessibility**
- eurth.org's look: Eurth blue top bar, the turning Eurth globe, the forum's light and Solarized dark schemes, Font Awesome icons in Eurth's category colours (#1; icons #2; Eurth blue #3).
- The Deluminator switch, with its animated sun and moon: light, dark, or Auto to follow the device (#2; animation restored #3; Auto #4).
- Small delights: a shine on each new name, fictional country names as placeholder, a waving flag, popping check marks and more, all off for reduced motion (#3). Round 4 added sixteen more (see feedback 63) and buttons that act out their click (#4); the footer's hearts beat (#5).
- About Governmint in a window (the "?" button, the About link or the ? key): what it does, privacy, keyboard shortcuts, sound and ideas. The footer keeps thanks, credits, the licence and Eurth (#5).
- Accessibility: a skip link, one h1, the main landmark, field help tied to its question, labelled downloads, tooltips that stay while pointed at and go with Escape, a switch for single-key shortcuts, and the country's name in the page once. axe-core finds nothing but the Eurth blue brand pairs, in light and dark (#5).
- A contrast test for every colour pair in both themes, with the Eurth-blue brand decisions listed as named exceptions (#2; exceptions #3).
- The favicon is the Eurth globe, turning where the browser allows (#2; turning #3).
- Links to other sites carry `?ref=gov.eurth.org`; the logo goes home; a 404 page, "Unclaimed territory" (#4).
- A sharing image and Open Graph and X card tags, for link previews on Reddit, Facebook, LinkedIn, X, Bluesky, Mastodon, Discord, Slack and WhatsApp (#5).

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
| 58 | Budget legend beside the chart, with coloured icons | Inside the chart, so downloads include it (#4) |
| 59 | A small gov.eurth.org credit on downloads | Bottom right of every PNG and SVG (#4) |
| 60 | Credit the share icon to the late Alex King | In the footer, linking alexking.org, and on the icon (#4) |
| 61 | Only the touched edge jiggles, once; the spider after three touches | Each edge twangs on its own; the spider comes after three, and the count restarts when it leaves (#4) |
| 62 | Header buttons on ultra-wide screens | Lined up with the page, at most 1200px wide (#4) |
| 63 | All sixteen delights | Typewriter names with a coin flip and a "Freshly minted" seal; mottos; crowns and halos; real flags; Random; coins at 100%; "Nice."; a paper plane and toast on copy; a postmark on copied text; an optional coin clink; a whirling globe for "The whole world"; the seasonal yurt; Eurth News headlines; keyboard shortcuts; a 404 page; saved countries (#4) |
| 64 | The current chip keeps its width when bold | Room for the bold label is kept (#4) |
| 65 | Smoother movement | Charts, scales and compass glide; checks slide in and out (#4) |
| 66 | Wikipedia link on the bold label | The label is the link (#4) |
| 67 | "Start from…" isn't clear | Now "Examples & countries", with a tooltip (#4) |
| 68 | A Random button | Top right; R on the keyboard (#4) |
| 69 | "Nice." at 69% | When a scale settles there, not while dragging (#4) |
| 70 | What's left to do | See Phases and Ideas |
| 71 | Get back to the original settings or budget | Undo and redo; Restore budget, and Default budget (#4) |
| 72 | A clearer way to save | Save in the header and in "Save & share" (#4) |
| 73 | A real country's own flag | Twemoji flags, on the name card and in the picker (#4) |
| 74 | A log scale for the compass? | No: scores are bounded, the clusters come from shared settings, and grouping and Enlarge handle the overlap |
| 75 | `?ref=` on outgoing links | `?ref=gov.eurth.org` (#4) |
| 76 | The globe logo should go home, not to eurth.org | The logo and name link to a fresh Governmint (#4) |
| 77 | "Nice." on budget sliders too | Done (#4) |
| 78 | Buttons animate when clicked | They press in, and icons act out the click: the reset arrows wind back, the dice tumble (#4) |
| 79 | Pie chart legend | Done, as in 58 (#4) |
| 80 | A treemap for the budget | Done (#4) |
| 81 | Night mode: detect the device, remember the choice, and an Auto option | It always detected and remembered; now the switch also has Auto, as on Eurth's forum. Each click moves on: flip, keep, back to Auto. The tooltip says which comes next (#4) |
| 82 | A sharing image for the main platforms, Reddit above all | A 1200 × 630 image that survives Reddit's square crop, with Open Graph and X card tags (#5) |
| 83 | NationStates' non-playable nations for Random | 47 of them, from the NationStates wiki's list. The forum, the source of truth, sits behind a bot check, so the list couldn't be checked against it (#5) |
| 84 | Famous fictional nations for Random | 50, from literature, film, television, comics, opera and theatre, each credited when rolled (Duck Soup's is spelled Freedonia) (#5) |
| 85 | The favicon stops turning in background tabs | Browsers do that: they slow a background tab's timers to once a second, then once a minute, to save battery. Left as is |
| 86 | Typing a real country's name | Offers that country's real government, with its flag (#5) |
| 87 | Header order: Examples, Undo, Redo, Save | Done. Random moved to the name; Reset went, since the logo starts afresh and Undo takes back any change (#5) |
| 88 | Random as a dice button beside the name | One Eurth blue button, flush with the field, with a tooltip (#5) |
| 89 | Motto and summary not lined up with the name | The coin hangs beside all three, so they share one edge (#5) |
| 90 | The second-look flash is over too soon on mobile | "Show settings" now keeps them highlighted and steps through them from the search bar, until closed (#5) |
| 91 | Treemap labels and placement | Labels in white or near-black by contrast, no outline; icon beside the share; gaps between tiles; charts lined up on the left (#5) |
| 92 | The spider stays on the web, and gives up | It can't leave the outer ring, and after seven seconds it climbs back up its thread (#5) |
| 93 | A share button that opens a window | Share… in "Save & share": the Eurth forum first, then Reddit, Bluesky, X, Facebook, LinkedIn, Tumblr, WhatsApp, Telegram and email, and the device's own share sheet where there is one (#5) |
| 94 | Treemap: icon first, white text until WCAG says otherwise | Small tiles show their icon before anything else; text is white unless white falls below 3:1 (#5) |
| 95 | A Eurth blue footer with white text? | Not done: white on Eurth blue is 3.2:1, too low for small text, and the red hearts would clash on blue. The footer stays light |
| 96 | Hearts beating in the footer | All of them beat three times as the footer comes into view, and again when pointed at (#5) |
| 97 | The regular yurt, not the seasonal ones | Done (#5) |
| 98 | A lighter footer, with About under "?" | About moved to a window behind "?" in the tools (and the About link); the footer keeps thanks, the licence and Eurth (#5) |
| 99 | The light/dark switch in the blue bar | A white pill beside About, GitHub and Eurth.org (#5) |
| 100 | Check WCAG, without touching the colours | Done, colours untouched; see Look and accessibility above (#5) |

## Ideas

Not planned yet, but worth keeping:

- From StateCrafter: how closely a country matches named ideologies, and quizzes.
- Two countries side by side.
- A guided mode for beginners.
- Eurth's own countries in the picker and on the compass, once their data is ready.
- Link previews per country, with its own name and shape (would need the Worker to render images).

Not planned: accounts, galleries, comments, or anything else that needs a server.
