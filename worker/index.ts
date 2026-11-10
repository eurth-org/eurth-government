/*
 * Governmint's Worker. The site itself is static files (dist/), served by Cloudflare without
 * running this code; only /api/* comes here, to count minted countries:
 *   GET  /api/mints  the count so far
 *   POST /api/mint   one more: sent when someone saves, copies the link, shares or exports
 * The count is a single number in one Durable Object. Nothing about the visitor or the country
 * is kept, not even this minute's tally beyond its number.
 */
import { DurableObject } from 'cloudflare:workers';
import { fromGovernmint, take, type Tally } from './counter';

export class Mints extends DurableObject<Env> {
  async count(): Promise<number> {
    return (await this.ctx.storage.get<number>('count')) ?? 0;
  }

  async mint(now: number): Promise<{ count: number; counted: boolean }> {
    const count = await this.count();
    const { counts, tally } = take(await this.ctx.storage.get<Tally>('tally'), now);
    if (!counts) return { count, counted: false };
    await this.ctx.storage.put({ count: count + 1, tally });
    return { count: count + 1, counted: true };
  }
}

function json(body: unknown, cache: string, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const mints = env.MINTS.get(env.MINTS.idFromName('governmint'));
    if (url.pathname === '/api/mints' && request.method === 'GET') {
      return json({ count: await mints.count() }, 'public, max-age=30');
    }
    if (url.pathname === '/api/mint' && request.method === 'POST') {
      if (!fromGovernmint(request.headers.get('Origin'), url.origin)) {
        return json({ error: 'Mints are counted from Governmint itself.' }, 'no-store', 403);
      }
      return json(await mints.mint(Date.now()), 'no-store');
    }
    return json({ error: 'Not here.' }, 'no-store', 404);
  },
} satisfies ExportedHandler<Env>;
