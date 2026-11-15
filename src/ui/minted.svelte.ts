/**
 * The count of countries minted with Governmint, as the toolbar shows it. A country is minted
 * when someone copies its link, shares or exports it: each country once per visit. The page
 * sends nothing but "one more" (worker/index.ts keeps a single number); the country itself
 * never leaves the browser. Which countries this visit has already counted is kept in memory
 * only, and is gone with the page.
 */
export const mints = $state<{ count: number | undefined }>({ count: undefined });

const counted = new Set<string>();

function read(response: Response) {
  if (!response.ok || !response.headers.get('Content-Type')?.includes('json')) return;
  return response.json().then((data: { count?: unknown }) => {
    if (typeof data.count === 'number') mints.count = data.count;
  });
}

/** The count so far. Without signal, or without the Worker (the dev server), it stays hidden. */
export function loadMints() {
  fetch('/api/mints')
    .then(read)
    .catch(() => {});
}

/** One more minted country: the one in the page's link, unless it was counted this visit. */
export function mint() {
  const country = location.search;
  if (counted.has(country)) return;
  counted.add(country);
  fetch('/api/mint', { method: 'POST', keepalive: true })
    .then(read)
    .catch(() => {});
}
