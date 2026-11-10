# Roadmap

Governmint is a tool, not a game: you set up a country and it tells you what you've built, what to call it, why, and where it contradicts itself. It's for anyone, with Eurth in the background as the community that makes it. The Filteries Political Simulator (2016–2018) and StateCrafter answer "which ideology is this?"; Governmint answers "what is my country like, and does it hold together?"

Three parts: what comes next, what each release added (newest first, times in UTC), and what's not planned. Every numbered point from the reviews is in the [feedback log](docs/feedback-log.md). Have an idea? [Table a motion in Ideas](https://github.com/eurth-org/eurth-government/discussions/categories/ideas) on GitHub Discussions.

## Next

- **A count of the countries minted so far** (feedback 143). Waiting on a decision: Cloudflare's own analytics count page loads, not countries, and need an API token in the Worker; a true count needs the page to send one anonymous "minted" signal to a tiny counter (a Worker with one stored number), which changes the privacy line.
- **The economy beyond the budget:** sectors, taxes, GDP, ownership and regulation, and with them economic left and right on the compass.
- **Law and society:** what's legal or illegal, rights, and a society scale.
- **More ways to share:** BBCode, an image card, and link previews per country with its own name and shape (the Worker would render the images).
- **Eurth's own countries** in the picker and on the compass, once their data is ready.
- **Two countries side by side**, and **a guided mode** for beginners.
- **Launch:** replace the old Filteries links in Eurth's Worldbuilding Tools docs, announce on the forum and Discord, and add Governmint to status.eurth.org.
- **Automatic deploys:** add the `CLOUDFLARE_API_TOKEN` secret (see the README); until then, releases are deployed by hand.

## 10 November 2026: round 10 (#10)

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

- **Accounts, galleries, comments, or anything else that keeps your data on a server.** A country lives in its link, and Save keeps a list in your own browser.
- **Tracking.** No Google Analytics, trackers or cookies, and nothing to sell (feedback 135).
- **A Creative Commons licence for the text** (feedback 119, 125). Everything stays under Apache 2.0, and the countries people make are theirs.
- **A log scale for the compass** (feedback 46, 74). Scores are bounded at ±100, the clusters come from shared settings, and grouping and Enlarge handle the overlap.
- **A footer in Eurth blue with white text** (feedback 95). White on Eurth blue is 3.2:1, too low for small text, and red hearts clash on blue.
- **Anything copied from Filteries.** It was "all rights reserved", so no code, text, artwork or scoring formulas from it; and no links to filteries.com, which now belongs to someone else.
