# Governmint

> A friendly note: Governmint is live, and it is the first of a suite. The other Eurth tools arrive through Eurth's advent calendar from 10 December 2026, so please don't spoil the surprise before their doors open.

Freshly minted governments. A free web tool for designing a country's government, laws and economy, and seeing what kind of state you've made: what to call it, why, and where it contradicts itself. Made for worldbuilders, writers, roleplayers and anyone curious how states work, by [Eurth](https://eurth.org).

Live page: https://gov.eurth.org

Status: preview. Government settings and the budget work; economy and law come next. See the [roadmap](roadmap.md) and the [feedback log](docs/feedback-log.md).

The rules every Eurth tool follows are in the handbook, [`node_modules/@eurth/style/HANDBOOK.md`](https://style.eurth.org/handbook/). On anything the tools share, the handbook wins.

## Use

Answer the questions on the left, or start from an example or a real country; read what you've made on the right. Copy the link (it holds the whole country), copy its description, share it, export it as Markdown, wikitext or JSON, or save your nation's profile file to carry it to the next Eurth tool. Nothing is stored in the browser.

## How it works

- A static site built with Astro, Svelte 5 and TypeScript, the same setup as every Eurth tool. The page is real HTML before any script runs: the tool is drawn on the server with the default country (`src/pages/index.astro`), then woken up in the browser, where it reads the country from the link.
- The shell comes from [`@eurth/style`](https://style.eurth.org): the header, the footer, the Deluminator (light, Night or Auto), the share row and dialog, toasts, the offline note, the service worker, the security headers and the web manifest. None of it is rebuilt here. Governmint uses only its tokens and `eu-` classes: no colours, fonts or spacing of its own.
- **Nothing is stored**: no cookies, localStorage, sessionStorage or IndexedDB, and no account. A country lives in its link, in the query string: `?c=<settings>&n=<name>&f=<flag>`. The settings code starts with its version (3 today); `src/model/link.ts` writes and reads it, checking every value, and `tests/link.test.ts` holds links from the live site that must open the same countries for good.
- The nation's profile file (`<nation>.eurth.json`, [`@eurth/profile`](https://github.com/eurth-org/eurth-profile)) carries a nation between Eurth's tools. Governmint owns its `government` section (the link, a summary, the form of government, the offices) and leaves every other section exactly as it was (`src/model/profile.ts`).
- The model in `src/model/` is data plus a small engine: settings, axes, naming rules and contradiction checks. [docs/model.md](docs/model.md) explains it and how to change it.
- A Cloudflare Worker serves the built files from `dist/` on the `gov.eurth.org` custom domain (`wrangler.jsonc`). Its only code (`worker/`) answers `/api/*`: it counts minted countries, one number in one Durable Object, which the toolbar shows. A country counts when someone copies its link, shares or exports it, once per visit, and at most 60 a minute. The page sends "one more" and nothing else.
- Icons by [Font Awesome](https://fontawesome.com) (CC BY 4.0); sun and moon by [line-md](https://github.com/cyberalien/line-md) (MIT); flags by [Twemoji](https://github.com/jdecked/twemoji) (CC BY 4.0).
- After the first visit it works offline: the shared service worker keeps a copy of the site on the device. The 197 flags are left out of that first download (`astro.config.mjs`), so a flag needs signal the first time it is shown.

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
- Start from an example or a real country (with its flag), searchable by name or type (#2; flags #4).
- Undo and Redo, Copy link, and Random in the toolbar and as dice beside the name: a random country named after a famous fictional nation or one from NationStates issues, with its source. Random replaces the whole country, so it turns red when pointed at and asks once before replacing one you've changed. Keyboard shortcuts for each (press ?) (#4; names and dice #5; in the toolbar, asking once #12).
- Type a real country's name and its real government is a click away, with its flag (#5).
- The result: the name, a motto, a one-sentence summary, why each label applies (the label itself links to Wikipedia), and what to look at again, stepping through the settings involved (#1; summary #3; motto and label links #4; stepping #5).
- Scales you can drag: they suggest the changes that would move them, and apply them (#2).
- A spider chart, a compass with examples or real countries as reference points (grouped where they overlap, enlargeable), and a budget chart as bar, pie or treemap with its legend inside; restore the budget a country started with, and lock shares while moving the rest (#2; grouping, enlarge and pie #3; treemap, legend and restore #4; locks #7).
- Share to the Eurth forum, Reddit, Bluesky, X, Facebook, LinkedIn, Tumblr, WhatsApp, Telegram or email, or the device's share sheet (#5).
- Copy the link, the country's description or the country as Markdown, load and save the nation's profile file, Markdown for the Eurth.org forum, wikitext for IIWiki or JSON for tools (copied, or saved as a file), and every chart as PNG, SVG or WebP with a small gov.eurth.org credit, as Markdown or JSON, or copied as an image, all in the browser (link #1; Markdown and wikitext #2; downloads #3; credit #4; JSON, WebP and Copy image #6; description, profile file, Copy Markdown and text files #12).
- Charts, scales and the compass glide to new values instead of jumping (#4).

### Look and accessibility
- The suite's look, from `@eurth/style`: Night (the forum's Solarized dark) and light, the device's own fonts, flat, 12 pixel corners. Section icons, budget parts and compass quadrants take Eurth's category colours as marks; text never sits on them (#12).
- WCAG 2.2 AAA where it can be met: 7:1 text in both themes, a visible focus ring, every target at least 44 by 44 pixels, never colour alone (a word or an icon as well), a written description of every country ("Copy description"), and axe on every build (#12; the first accessibility pass #5).
- Charts are drawn at the size they're shown, so their text never shrinks on a phone: a narrow screen gets a one-column legend and a smaller web instead (#12).
- The Eurth coin is Governmint's own mark and its signature: the favicon, the app icon and the sharing image (`npm run images`), the coin that flips on each new name, the burst when a scale reaches 100% and the clink, once sound is switched on in the footer (#8; coin as icon #9; token colours #12).
- Small delights, all off for reduced motion or with motion switched off: a seal on each new name, fictional country names as placeholder, a waving flag, a crown for monarchies, a spider on the spider chart, a postmark on copied text, buttons that act out their click, and icons that draw themselves where something happens: a tick once something is copied, a download arrow, a warning sign (#3, #4; the suite's own, such as the Konami emu, and the drawn icons #12).
- About Governmint in a window (the "?" button or the ? key): what it does, privacy, real countries, keyboard shortcuts and ideas (#5).
- Privacy and security: nothing stored, no trackers; names cleaned wherever they go; the suite's strict Content-Security-Policy and Permissions-Policy (#8; nothing stored #12).
- Links to other sites carry `?ref=gov.eurth.org`; a 404 page, "Unclaimed territory" (#4).
- Search: the title pattern of the suite, one h1, WebApplication and FAQ structured data, a sitemap, `robots.txt` and `llms.txt` (#12).

## Development

Node 22 or later.

```sh
npm install
npm run dev          # the site while you work (the counter needs the Worker: use preview for that)
npm run check        # types: Astro, the Svelte components and the Worker
npm run build        # the static site, into dist/
npm test             # the model's tests, the Worker's, the links and the suite's checks (they read dist/)
npm run axe          # accessibility: every page, both themes
npm run smoke        # the built site in real Chrome: theme, nothing stored, offline
npm run preview      # the built site with its real headers and the Worker (wrangler dev)
npm run images       # the favicon, the icons and the sharing image, from the coin
```

- `eurth.config.mjs`: the tool's name, address, title and pages. Build time only.
- `src/pages/`: the maker and the 404 page. `src/App.svelte`: the tool itself. `src/ui/`: its parts. `src/model/`: its logic, free of the page.
- `src/app.css`: the few styles that live outside components (the coin burst). Everything else is tokens.
- `tests/shell.test.js`: the checks every Eurth tool runs. `tests/link.test.ts` and `tests/profile.test.ts`: links and the profile file. The model's tests sit beside the model, the Worker's beside the Worker.
- `LAUNCH_AT`: the moment Governmint's door opened (29 October 2026).

## Deployment

The site runs as the `eurth-government` Worker on the Cloudflare account that holds the eurth.org zone. The custom domain in `wrangler.jsonc` owns the `gov.eurth.org` DNS record; there is no workers.dev address.

GitHub Actions checks, builds and tests every push and pull request, and deploys `main` (`.github/workflows/ci.yml`); a nightly run (`nightly.yml`) updates `@eurth/style` and `@eurth/profile` within version 1, rebuilds and deploys if anything changed. Both call the reusable workflows in `eurth-org/eurth-style`. Deploying uses the organisation secret `CLOUDFLARE_API_TOKEN`; without it, the deploy step is skipped with a warning. To deploy by hand from a machine logged in with `npx wrangler login`, run `npm run deploy`.

## Releasing

Work comes in rounds of numbered feedback, one pull request per round:

1. Work on a branch; `main` is the live site.
2. In the same commits as the work, update [roadmap.md](roadmap.md) (move finished items out of Next, and add or extend the round's dated section) and [docs/feedback-log.md](docs/feedback-log.md).
3. Run `npm run check`, `npm run build`, `npm test`, `npm run axe` and `npm run smoke`, try it with `npm run preview`, and open the pull request.
4. Once CI passes, squash-merge it: CI deploys `main`. Set the round's time in roadmap.md to the merge time with the next round.

## Written from scratch

Governmint is inspired by the Filteries Political Simulator (filteries.com, 2016–2018), now preserved in an [unofficial archive](https://github.com/minkinfin/Filteries-Political-Simulator-Archive). Filteries was "all rights reserved", so nothing here is copied from it: no code, text, artwork or scoring formulas. Please keep it that way in contributions. The filteries.com domain now belongs to someone else; don't link to it.

## Licence

Apache 2.0, see [LICENSE](LICENSE).
