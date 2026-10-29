/**
 * Links to other websites carry ?ref=gov.eurth.org, so the sites we link to can see where their
 * visitors came from. Links within Governmint stay as they are.
 */
export const site = 'gov.eurth.org';

export function ref(href: string): string {
  try {
    const url = new URL(href);
    if (url.hostname === site || url.protocol !== 'https:') return href;
    url.searchParams.set('ref', site);
    return url.toString();
  } catch {
    return href;
  }
}

/** A Wikipedia article's address, from its title. */
export function wikipedia(title: string): string {
  return ref(`https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`);
}
