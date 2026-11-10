/**
 * The count of countries minted with Governmint, as the header shows it. A country is minted
 * when someone saves it, copies its link, shares or exports it: each country once per visit.
 * The page sends nothing but "one more" (worker/index.ts keeps a single number); the country
 * itself never leaves the browser.
 */
export const mints = $state<{ count: number | undefined }>({ count: undefined });

const key = 'governmint:minted';

function minted(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(key) ?? '[]'));
  } catch {
    return new Set();
  }
}

function remember(list: Set<string>) {
  try {
    sessionStorage.setItem(key, JSON.stringify([...list].slice(-200)));
  } catch {
    // Private mode: it may count twice, which is fine.
  }
}

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
  const list = minted();
  const country = location.search;
  if (list.has(country)) return;
  list.add(country);
  remember(list);
  fetch('/api/mint', { method: 'POST', keepalive: true })
    .then(read)
    .catch(() => {});
}
