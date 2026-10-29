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

/**
 * Links to other sites open in a new tab, and say so to screen readers through one shared,
 * hidden note. A watcher catches links added later (headlines, dialogs), so none is missed.
 */
export function externalLinks() {
  const note = document.createElement('span');
  note.id = 'new-tab-note';
  note.hidden = true;
  note.textContent = 'Opens in a new tab';
  document.body.append(note);

  const mark = (root: ParentNode) => {
    for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')) {
      if (link.origin === location.origin || link.hasAttribute('aria-describedby')) continue;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-describedby', 'new-tab-note');
    }
  };
  mark(document);
  new MutationObserver(() => mark(document)).observe(document.body, { childList: true, subtree: true });
}
