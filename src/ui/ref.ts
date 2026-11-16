/**
 * Links to other websites carry ?ref=<this site's host>, so the sites we link to can see where
 * their visitors came from. The host is handed down from the page (site.host): browser code
 * never imports the site's configuration. The shell opens such links in a new tab and says so.
 */
export function ref(href: string, host: string): string {
  try {
    const url = new URL(href);
    if (url.host === host || url.protocol !== 'https:') return href;
    url.searchParams.set('ref', host);
    return url.toString();
  } catch {
    return href;
  }
}

/** A Wikipedia article's address, from its title. */
export function wikipedia(title: string, host: string): string {
  return ref(`https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`, host);
}
