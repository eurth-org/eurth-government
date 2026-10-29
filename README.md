# Governmint

Freshly minted governments. A free web tool for designing a country's government, laws and economy, and seeing what kind of state you've made: what to call it, why, and where it contradicts itself. Made for worldbuilders, writers, roleplayers and anyone curious how states work, by [Eurth](https://eurth.org).

Live page: https://gov.eurth.org

Status: phase 0, groundwork. See [ROADMAP.md](ROADMAP.md) for what's planned.

## How it works

- A static site built with Vite, Svelte and TypeScript. There is no server, database or account: everything runs in the browser, and a country's settings will live in its link.
- A Cloudflare Worker serves the built files from `dist/` on the `gov.eurth.org` custom domain (`wrangler.jsonc`). It runs no code of its own.
- `public/_headers` sets security and caching headers, and allows embedding on eurth.org.
- Colours, type and spacing come from the Eurth design system (`src/app.css`). The page follows the visitor's light or dark setting.

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

To deploy by hand, from a machine logged in with `npx wrangler login`:

```bash
npm run deploy   # build, then upload dist/ to the Worker
```

To deploy on every push to `main`, connect the repository once in the Cloudflare dashboard: Workers & Pages → `eurth-government` → Settings → Build → Connect, with build command `npm run build` and deploy command `npx wrangler deploy`.

GitHub Actions (`.github/workflows/ci.yml`) only checks, tests and builds; it needs no secrets.

## Written from scratch

Governmint is inspired by the Filteries Political Simulator (filteries.com, 2016–2018), now preserved in an [unofficial archive](https://github.com/minkinfin/Filteries-Political-Simulator-Archive). Filteries was "all rights reserved", so nothing here is copied from it: no code, text, artwork or scoring formulas. Please keep it that way in contributions. The filteries.com domain now belongs to someone else; don't link to it.

## Licence

Apache 2.0, see [LICENSE](LICENSE).
