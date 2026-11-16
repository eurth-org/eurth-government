# Roadmap

Governmint is a tool, not a game: you set up a country and it tells you what you've built, what to call it, why, and where it contradicts itself. It's for anyone, with Eurth in the background as the community that makes it. The Filteries Political Simulator (2016–2018) and StateCrafter answer "which ideology is this?"; Governmint answers "what is my country like, and does it hold together?"

Three parts: what comes next, what each release added (newest first, times in UTC), and what's not planned. Every numbered point from the reviews is in the [feedback log](docs/feedback-log.md). Have an idea? Table a motion on [the Eurth forum](https://eurth.org), or in [Ideas](https://github.com/eurth-org/eurth-government/discussions/categories/ideas) on GitHub Discussions.

## Next

- **A guide, a glossary and examples pages**, as every Eurth tool has: forms of government explained well, with sources and a last-updated date; the words Governmint uses, each with its definition; and the 18 examples as pages that open in the maker. Linked from the header, each with its own structured data and sharing image.
- **The economy beyond the budget:** sectors, taxes, GDP, ownership and regulation, and with them economic left and right on the compass.
- **Law and society:** what's legal or illegal, rights, and a society scale.
- **More ways to share:** BBCode, an image card (the suite's picture sizes), and link previews per country with its own name and shape (the Worker would render the images).
- **More of the profile:** read `identity` and `flag` from a loaded profile (the nation's names, its own flag on the name card), and write names for the offices once Governmint asks for them.
- **Eurth's own countries** in the picker and on the compass, once their data is ready.
- **Two countries side by side**, and **a guided mode** for beginners.
- **Flags offline:** the flags of real countries need signal the first time each is shown; before the shared shell they were kept as they were shown.
- **Launch:** replace the old Filteries links in Eurth's Worldbuilding Tools docs, announce on the forum and Discord, and add Governmint to status.eurth.org.
- **Automatic deploys:** they need the organisation's `CLOUDFLARE_API_TOKEN` secret (the handbook, Stack and hosting); until it is set, releases are deployed by hand.

## 16 November 2026: round 12, onto the shared shell with Governmint's own design kept (#12, 0.12.0)

Feedback 146–160.

- Governmint stands on the shared shell of Eurth's tools (`@eurth/style`), which provides what stands around the tool: the header (the blue bar with the Tools menu and the Deluminator, then the yurt and "Governmint by Eurth"), the footer with this visit's sound and motion switches, the blue bar at the foot, the share dialog, toasts and the offline note. Governmint's own top bar, footer, theme switch and share window are gone.
- **Governmint's own design is kept exactly as it was on gov.eurth.org.** A first version of this round restyled the whole tool to the suite's rules (44 pixel options, bold labels, 12 pixel corners, a dark-blue selection colour, charts redrawn) and dropped the section bar's icons and its progress line. Stijn rejected it, and everything between the header and the footer is restored from the live site: the compact options with Eurth-blue selection and white labels, Governmint's own corners and weights, the sticky section bar with its icons and progress line, the grey buttons, the panels, the charts as they were drawn, the windows, tooltips and toasts. The suite's own scroll line is switched off (`scrollLine: false`).
- How: Governmint's styles are back in `src/app.css` and in each component, inside a `.gov` wrapper. Its tokens are declared on the wrapper (several share a name with the suite's but not a value), and the suite's base styles are undone inside it, so neither stylesheet reaches into the other's part of the page. Checked against the live site value by value: the computed styles and the place of every element, in both themes, on a desktop and a phone.
- Governmint is held to WCAG 2.2 AA and 24 pixel targets, as it is live, not to the suite's AAA and 44 pixels (`"eurth": { "axe": … }` in `package.json`; Stijn, 16 November 2026). Its own contrast test (`src/contrast.test.ts`) is back.
- The suite's header carries Governmint's own mark and its About: the gold coin stands in front of the name (it still flips when pointed at or reached with the keyboard, and still spins for "The whole world"), and About is a pill in the blue bar, where it always was. The row under the header holds the actions only: Examples & countries, Undo, Redo, Save and the "?" button. The Preview badge and the count of minted countries are gone from the page (Stijn, 16 November 2026); countries are still counted, the number just isn't shown.
- Built with Astro: the page is real HTML before any script runs, with one heading (for screen readers and search engines; there is no intro block above the tool, as there never was), and under the tool how it works and questions and answers. The shared build writes the security headers, the service worker, the web manifest, the sitemap, `robots.txt` and `llms.txt`.
- Nothing is stored. The theme, sound and motion last for the visit (About keeps its Coin clink and motion switches, which are the same two as in the footer); so do the single-key shortcuts switch and undo. Save copies the link, which holds the whole country; "Saved on this device" and its list under Examples & countries are gone, and the offline copy the old version kept is cleared away.
- The nation's profile file: Load profile and Save profile, in Save & share. Governmint writes the `government` section and leaves every other section as it was; a loaded profile with a Governmint link opens that country.
- Links are unchanged (`?c=3…&n=…&f=…`), and links from the live site are kept as a test.
- Random asks once: the dice beside the name (the suite's `RandomButton`, in Governmint's look) turn red when pointed at once there is something to lose, and the first roll that would replace a country you've changed asks before it does. The R key goes the same way.
- Copy description (the country in words) and Copy Markdown in Save & share; the Export panel saves its text as a file (Markdown, wikitext or JSON) as well as copying it; the Shape chart downloads as Markdown and JSON, as the budget and the compass already did. All in Governmint's own buttons.
- A label and its dropdown no longer share an id with their section.
- No link to GitHub before 25 December 2026 (the handbook): until then About and the list of real countries point to the Eurth forum, and the rebuild after that date brings the GitHub links back.
- The suite's checks (`npm test`, `npm run axe`, `npm run smoke`), its CI and a nightly run that keeps the shell up to date. On `@eurth/style` 1.6.0.

## 10 November 2026: round 11 (#11)

Feedback 143.

- A count of the countries minted so far, in the header. A country counts when someone saves it, copies its link, shares or exports it, once per visit. The page sends only "one more"; a small Worker (`worker/`) keeps the count as a single number in one Durable Object, and caps it at 60 a minute against floods.
- The privacy line and About say so.

## 10 November 2026, 10:56: round 10 (#10)

Feedback 142, 144 and 145.

- The light and dark switch draws its circle from the stylesheet, so going from dark to light grows the circle again instead of switching at once.
- The bottom bar's icons draw their outlines, then fill in, when pointed at, in the manner of line-md.
- Offline: after the first visit, a service worker keeps a copy of the site on the device (flags as they're shown), so Governmint opens without signal; a "No signal" note says so.
- This roadmap, in three parts, with the feedback log in its own file.

## 30 October 2026, 14:12: round 9 (#9)

Feedback 139–141.

- The Eurth coin as favicon (SVG and a 16, 32 and 48 pixel .ico) and app icon, with a web app manifest; `scripts/make-icons.sh` makes them.
- The coin as the logo in the header and in the sticky bar's way back to the top, in place of the turning globe.
- No Eurth link in the header, so it doesn't read as advertising.

## 29 October 2026, 20:47: round 8 (#8)

Feedback 134–138.

- The Eurth coin, in the style of Twemoji's coin with the yurt embossed, on the name card, in the bursts and on the sharing image.
- Names capped and cleaned wherever they go; Markdown and wikitext keep them as plain text; saved countries checked when read back.
- A strict Content-Security-Policy and a Permissions-Policy.
- A privacy line: no Google Analytics, no trackers, no cookies, no data to sell.
- A fixed back-to-top tooltip, and a word in About on when the coin clinks.

## 29 October 2026, 20:21: round 7 (#7)

Feedback 114–133.

- Budget locks, with an angry slider when the locks leave no room; wider treemap tiles; the budget as Markdown (with a Mermaid pie chart) and JSON.
- The compass as Markdown (with a Mermaid quadrant chart) and JSON; Copy text, and a check mark on Copy image.
- A softer clink, only for what you can see; plain chart and format buttons; a steadier name card.
- A merged footer, Apache 2.0 throughout, a disclaimer for real countries, and an Eurth bar at the bottom.
- No npm cache stored on GitHub.

## 29 October 2026, 19:10: round 6 (#6)

Feedback 101–113.

- The name as eurth.org writes its own, header tools of one size, and tooltips above the sticky bar.
- The logo in the sticky bar as a way back to the top.
- Budget and compass toolbars; an Export panel with JSON; WebP and Copy image for every chart.
- Options that keep their width when chosen; outside links in new tabs; a roomier About.

## 29 October 2026, 17:42: round 5 (#5)

Feedback 82–100.

- A sharing image for link previews, and a share window for the Eurth forum and nine other places.
- Famous fictional and NationStates nations for Random; the dice beside the name; real countries recognised by name.
- A tidier header, stepping through a second look, and clearer treemap labels.
- About in a window, a lighter footer, and an accessibility pass.

## 29 October 2026, 16:21: round 4 (#4)

Feedback 58–81.

- The budget's legend and treemap, and a credit on downloads.
- Random, Save, Undo and Redo, Restore budget, real flags, and keyboard shortcuts.
- Plucked edges on the spider chart, smoother movement, sixteen new delights, and a 404 page.
- `?ref` on outgoing links, and Auto for the theme switch.

## 29 October 2026, 15:21: round 3 (#3)

Feedback 27–57.

- Eurth blue, Wikipedia links and label icons, a one-sentence summary, and restricted candidacy.
- Chart downloads, a budget pie, a grouped and enlargeable compass, and find-in-page search.
- The roadmap, suggestions on GitHub Discussions, animated switch icons, and small delights.

## 29 October 2026, 14:18: rounds 1 and 2 (#2)

Feedback 1–26.

- Icons, a sticky section bar with search, buttons for short lists, and citizenship as a voting limit.
- 197 real countries and a picker; draggable scales; a spider chart and a compass.
- Markdown and wikitext exports, the Deluminator switch, the budget and its Welfare scale, and a contrast test.

## 29 October 2026, 11:32: preview (#1)

- The model for government: settings, axes, naming rules and contradiction checks as data, with tests.
- The tool itself, in eurth.org's look, with 18 examples and the settings kept in the link.
- A deploy job in CI.

## 29 October 2026, 09:22: gov.eurth.org

- Live on gov.eurth.org through a Cloudflare Worker.

## 29 October 2026, 09:12: groundwork

- The repository, the Apache 2.0 licence, a placeholder page, the Worker's configuration and CI.

## Not planned

- **Accounts, galleries, comments, or anything else that keeps your data on a server.** A country lives in its link and in the nation's profile file.
- **Saved countries in the browser: nothing is stored.** No localStorage, sessionStorage, IndexedDB or cookies (the handbook, Privacy). The list earlier versions kept is not read any more; a link is the save, and the profile file carries a nation between Eurth's tools.
- **Tracking.** No Google Analytics, trackers or cookies, and nothing to sell (feedback 135).
- **A Creative Commons licence for the text** (feedback 119, 125). Everything stays under Apache 2.0, and the countries people make are theirs.
- **A log scale for the compass** (feedback 46, 74). Scores are bounded at ±100, the clusters come from shared settings, and grouping and Enlarge handle the overlap.
- **A footer in Eurth blue with white text** (feedback 95). White on Eurth blue is 3.2:1, too low for small text, and red hearts clash on blue. The footer is the suite's now.
- **A header, footer or theme switch of Governmint's own.** They come from `@eurth/style` and are never rebuilt here; a gap in them is fixed there, for every tool.
- **Anything copied from Filteries.** It was "all rights reserved", so no code, text, artwork or scoring formulas from it; and no links to filteries.com, which now belongs to someone else.
