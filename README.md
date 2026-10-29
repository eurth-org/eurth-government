# Governmint

Freshly minted governments. A free web tool for designing a country's government, laws and economy, and seeing what kind of state you've made: what to call it, why, and where it contradicts itself. Made for worldbuilders, writers, roleplayers and anyone curious how states work, by [Eurth](https://eurth.org).

Live page: https://gov.eurth.org

Status: preview. Government settings work; economy and law come next. See [ROADMAP.md](ROADMAP.md).

## How it works

- A static site built with Vite, Svelte and TypeScript. There is no server, database or account: everything runs in the browser, and a country's settings live in its link (`?c=…`).
- The model in `src/model/` is data plus a small engine: settings, axes, naming rules and contradiction checks. [docs/model.md](docs/model.md) explains it and how to change it.
- A Cloudflare Worker serves the built files from `dist/` on the `gov.eurth.org` custom domain (`wrangler.jsonc`). It runs no code of its own.
- `public/_headers` sets security and caching headers, and allows embedding on eurth.org.
- The look follows eurth.org and the Eurth design system (`src/app.css`), light or dark through the Deluminator-style switch. `src/contrast.test.ts` checks every colour pair against WCAG 2.2 AA, and the top bar against AAA.
- Icons by [Font Awesome](https://fontawesome.com) (CC BY 4.0); sun and moon by [line-md](https://github.com/cyberalien/line-md) (MIT).

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

## Written from scratch

Governmint is inspired by the Filteries Political Simulator (filteries.com, 2016–2018), now preserved in an [unofficial archive](https://github.com/minkinfin/Filteries-Political-Simulator-Archive). Filteries was "all rights reserved", so nothing here is copied from it: no code, text, artwork or scoring formulas. Please keep it that way in contributions. The filteries.com domain now belongs to someone else; don't link to it.

## Licence

Apache 2.0, see [LICENSE](LICENSE).
