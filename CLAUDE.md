# Building Governmint

Governmint (gov.eurth.org) is live: `main` deploys it. It is one of Eurth's worldbuilding tools and stands on their shared shell. The standing instructions:

- Read `node_modules/@eurth/style/HANDBOOK.md` first. On anything the tools share (stack, look, shell, privacy, accessibility, search, sharing, offline, delight, launch, writing), the handbook wins over any brief; say so if they disagree.
- The shell comes from `@eurth/style` and is never rebuilt here: the header, the footer, the theme switch, the share row and dialog, toasts and the offline note. Use only its tokens and `eu-` classes: no local colours, fonts or spacing. Charts take their colours from tokens too; text never sits on a `cat-` colour.
- Nothing is stored: no cookies, localStorage, sessionStorage or IndexedDB. A country lives in its link (`src/model/link.ts`: query string, versioned) and in the nation's profile file. A link made today must open the same country for good: `tests/link.test.ts` holds links from the live site, and they must keep passing. When the settings change shape, raise the version and keep reading the old ones.
- Governmint owns the `government` section of the profile file and leaves every other section untouched (`src/model/profile.ts`).
- The Worker (`worker/`) only counts minted countries behind `/api/*`: one number in one Durable Object. Ask Stijn before giving it anything else to do.
- `eurth.config.mjs` and `@eurth/style/build` are for build time only; never import them from a Svelte component. Hand components what they need as props (`siteUrl`, `host`).
- Found a gap or a bug in the shell? Don't patch around it here: it is fixed in `@eurth/style`, so every tool gets the fix.
- Done means: every handbook rule met, `npm run check`, `build`, `test`, `axe` and `smoke` passing, README, roadmap and feedback log up to date.
- Work on a branch; `main` is the live site. Ask Stijn before spending money, adding any Cloudflare product, or changing another repository.
