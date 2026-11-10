# Governmint

Freshly minted governments. A free web tool for designing a country's government, laws and economy, and seeing what kind of state you've made: what to call it, why, and where it contradicts itself. Made for worldbuilders, writers, roleplayers and anyone curious how states work, by [Eurth](https://eurth.org).

Live page: https://gov.eurth.org

Status: preview. Government settings work; economy and law come next. See the [roadmap](roadmap.md) and the [feedback log](docs/feedback-log.md).

## How it works

- A static site built with Vite, Svelte and TypeScript. There is no account, and nothing about you or your country is kept on a server: everything runs in the browser, and a country's settings live in its link (`?c=…`).
- The model in `src/model/` is data plus a small engine: settings, axes, naming rules and contradiction checks. [docs/model.md](docs/model.md) explains it and how to change it.
- A Cloudflare Worker serves the built files from `dist/` on the `gov.eurth.org` custom domain (`wrangler.jsonc`). Its only code (`worker/`) answers `/api/*`: it counts minted countries, one number in one Durable Object, which the header shows. A country counts when someone saves, copies its link, shares or exports it, once per visit, and at most 60 a minute.
- `public/_headers` sets security and caching headers, and allows embedding on eurth.org.
- The look follows eurth.org and the Eurth design system (`src/app.css`), light, dark or Auto (following the device) through the Deluminator-style switch. `src/contrast.test.ts` checks every colour pair against WCAG 2.2 AA, and the top bar against AAA.
- Icons by [Font Awesome](https://fontawesome.com) (CC BY 4.0); sun and moon by [line-md](https://github.com/cyberalien/line-md) (MIT); flags by [Twemoji](https://github.com/jdecked/twemoji) (CC BY 4.0).
- After the first visit it works offline: the build writes a service worker (`src/offline/sw.js`, filled in by `vite.config.ts`) that keeps a copy of the site on the device.

## What's in it

The release that added each item is in brackets; see [roadmap.md](roadmap.md).

### Model (`src/model/`)
- 27 settings in 9 sections: the state, head of state, government, legislature, elections, courts and rulers, religion, defence and borders, and a budget of ten areas (the UN's COFOG) that always adds up to 100% (#1; citizenship #2; budget #2).
- Five labels with a reason, an icon and a Wikipedia article each: structure, system, form, regime, rulers. They combine into a full name, such as "Federal presidential republic" (#1; icons and Wikipedia #3).
- Regimes after political science's usual split (closed and electoral autocracy, electoral and liberal democracy), plus one-party states, military dictatorships, theocracies, and restricted, direct and non-partisan democracies (#1; restricted candidacy #3).
- Eight scales: participation, competition, checks and balances, decentralisation, religion, militarism, welfare, openness (#1; welfare #2).
- 25 contradiction checks, from "no legislature to answer to" to "a world government has no foreign countries left" (#1; budget checks #2).
- 18 examples and 197 real countries (UN members, Kosovo, Palestine, Taiwan, Vatican City), as of 2026 (examples #1; countries #2).

### The tool
- Settings as buttons or dropdowns, with a one-line explanation of each choice (#1; buttons #2).
- A sticky section bar: where you are, a progress line, arrows when sections are off to the side, and settings search that works like find-in-page (#2; arrows and find-in-page #3; steady chip widths #4).
- Start from an example, a real country (with its flag) or a country saved on this device, searchable by name or type (#2; flags and saved #4).
- Undo and Redo, Save, and a Random country beside the name, named after a famous fictional nation or one from NationStates issues, with its source; keyboard shortcuts for each (press ?) (#4; names and dice #5).
- Type a real country's name and its real government is a click away, with its flag (#5).
- The result: the name, a motto, a one-sentence summary, why each label applies (the label itself links to Wikipedia), and what to look at again, stepping through the settings involved (#1; summary #3; motto and label links #4; stepping #5).
- Scales you can drag: they suggest the changes that would move them, and apply them (#2).
- A spider chart, a compass with examples or real countries as reference points (grouped where they overlap, enlargeable), and a budget chart as bar, pie or treemap with its legend inside; restore the budget a country started with, and lock shares while moving the rest (#2; grouping, enlarge and pie #3; treemap, legend and restore #4; locks #7).
- Share to the Eurth forum, Reddit, Bluesky, X, Facebook, LinkedIn, Tumblr, WhatsApp, Telegram or email, or the device's share sheet (#5).
- Copy the link, save on this device, Markdown for the Eurth.org forum, wikitext for IIWiki or JSON for tools, and every chart as PNG, SVG or WebP with a small gov.eurth.org credit, or copied as an image, all in the browser (link #1; Markdown and wikitext #2; downloads #3; saving and credit #4; JSON, WebP and Copy image #6).
- Charts, scales and the compass glide to new values instead of jumping (#4).

### Look and accessibility
- eurth.org's look: Eurth blue bars at the top and bottom (the bottom one linking Eurth's forums, map, news and status, with icons that draw themselves on hover), the Eurth coin as logo, favicon and app icon, the forum's light and Solarized dark schemes, Font Awesome icons in Eurth's category colours (#1; icons #2; Eurth blue #3).
- The Deluminator switch, with its animated sun and moon: light, dark, or Auto to follow the device (#2; animation restored #3; Auto #4; a steady circle both ways #10).
- Small delights: a shine on each new name, fictional country names as placeholder, a waving flag, popping check marks and more, all off for reduced motion (#3). Round 4 added sixteen more (see feedback 63) and buttons that act out their click (#4); the footer's hearts beat (#5).
- About Governmint in a window (the "?" button, the About link or the ? key): what it does, privacy, keyboard shortcuts, sound and ideas. The footer keeps thanks, credits, the licence and Eurth (#5).
- Privacy and security: no trackers or cookies; names cleaned wherever they go; a strict Content-Security-Policy and Permissions-Policy (#8).
- Works offline after the first visit: a service worker keeps a copy of the site on the device, and a note says when there's no signal (#10).
- Accessibility: a skip link, one h1, the main landmark, field help tied to its question, labelled downloads, tooltips that stay while pointed at and go with Escape, a switch for single-key shortcuts, and the country's name in the page once. axe-core finds nothing but the Eurth blue brand pairs, in light and dark (#5).
- A contrast test for every colour pair in both themes, with the Eurth-blue brand decisions listed as named exceptions (#2; exceptions #3).
- The favicon and app icons are the Eurth coin, made by scripts/make-icons.sh; a web app manifest puts it on phones' home screens (#2; turning globe #3; coin #9).
- Links to other sites carry `?ref=gov.eurth.org`; the logo goes home; a 404 page, "Unclaimed territory" (#4).
- A sharing image and Open Graph and X card tags, for link previews on Reddit, Facebook, LinkedIn, X, Bluesky, Mastodon, Discord, Slack and WhatsApp (#5).

## Local development

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run check    # Svelte and TypeScript checks
npm test         # unit tests
npm run build    # static build into dist/
```

## Deployment

The site runs as the `eurth-government` Worker on the Cloudflare account that holds the eurth.org zone. The custom domain in `wrangler.jsonc` owns the `gov.eurth.org` DNS record.

GitHub Actions (`.github/workflows/ci.yml`) checks, tests and builds every push and pull request. Pushes to `main` that pass are deployed to gov.eurth.org.

Deploying needs one repository secret, `CLOUDFLARE_API_TOKEN`. To create or replace it:

1. Open [this pre-filled token form](https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22workers_scripts%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22workers_routes%22%2C%22type%22%3A%22edit%22%7D%5D&accountId=%2A&zoneId=all&name=Governmint%20deploys%20from%20GitHub) (Workers Scripts and Workers Routes, edit), choose **Continue to summary**, then **Create Token**, and copy it.
2. Run `gh secret set CLOUDFLARE_API_TOKEN --repo eurth-org/eurth-government` and paste it.

Without the secret, the deploy step is skipped with a warning. To deploy by hand from a machine logged in with `npx wrangler login`, run `npm run deploy`.

## Releasing

Work comes in rounds of numbered feedback, one pull request per round:

1. Work on a `feedback-round-N` branch.
2. In the same commits as the work, update [roadmap.md](roadmap.md) (move finished items out of Next, and add or extend the round's dated section) and [docs/feedback-log.md](docs/feedback-log.md).
3. Run `npm run check`, `npm test` and `npm run build`, open the pull request, and deploy it by hand (`npm run deploy`) to try it on gov.eurth.org.
4. Once CI passes, squash-merge it, and set the round's time in roadmap.md to the merge time with the next round.

## Written from scratch

Governmint is inspired by the Filteries Political Simulator (filteries.com, 2016–2018), now preserved in an [unofficial archive](https://github.com/minkinfin/Filteries-Political-Simulator-Archive). Filteries was "all rights reserved", so nothing here is copied from it: no code, text, artwork or scoring formulas. Please keep it that way in contributions. The filteries.com domain now belongs to someone else; don't link to it.

## Licence

Apache 2.0, see [LICENSE](LICENSE).
