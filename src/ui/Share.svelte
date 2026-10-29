<script lang="ts">
  import { faCheck, faCopy, faLink } from '@fortawesome/free-solid-svg-icons';
  import type { Profile } from '../model/engine';
  import { toMarkdown, toWikitext } from '../model/formats';
  import type { Country } from '../model/settings';
  import Icon from './Icon.svelte';

  let { name, country, profile, link }: { name: string; country: Country; profile: Profile; link: string } = $props();

  type Format = 'markdown' | 'wikitext';
  let format = $state<Format>('markdown');
  let copied = $state<'link' | Format | null>(null);

  const formats: { id: Format; label: string; help: string }[] = [
    { id: 'markdown', label: 'Eurth.org forum', help: 'Markdown for a forum post, with a table.' },
    { id: 'wikitext', label: 'IIWiki', help: 'Wikitext with an {{Infobox country}} and a Government section.' },
  ];

  const text = $derived(
    format === 'markdown' ? toMarkdown(name, country, profile, link) : toWikitext(name, country, profile, link),
  );

  async function copy(what: 'link' | Format) {
    await navigator.clipboard.writeText(what === 'link' ? link : text);
    copied = what;
    setTimeout(() => (copied = null), 2000);
  }
</script>

<button class="primary" onclick={() => copy('link')}>
  <Icon icon={copied === 'link' ? faCheck : faLink} />
  {copied === 'link' ? 'Link copied' : 'Copy link'}
</button>
<p class="help">The link holds every setting and the name, so it brings this country back exactly.</p>

<div class="formats" role="radiogroup" aria-label="Format">
  {#each formats as f (f.id)}
    <label class="format">
      <input type="radio" name="share-format" value={f.id} bind:group={format} />
      <span>{f.label}</span>
    </label>
  {/each}
</div>
<p class="help">{formats.find((f) => f.id === format)!.help}</p>
<label class="visually-hidden" for="share-text">{format === 'markdown' ? 'Markdown' : 'Wikitext'}</label>
<textarea id="share-text" readonly rows="9" value={text}></textarea>
<button onclick={() => copy(format)}>
  <Icon icon={copied === format ? faCheck : faCopy} />
  {copied === format ? 'Copied' : 'Copy'}
</button>

<style>
  button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 6px 12px;
    border: 0;
    border-radius: var(--radius-sm);
    background: var(--button);
    cursor: pointer;
  }

  .primary {
    background: var(--accent-fill);
    color: var(--on-accent-small);
    font-weight: 700;
  }

  .help {
    margin: var(--space-1) 0 var(--space-3);
    color: var(--ink-muted);
    font-size: 13px;
  }

  .formats {
    display: flex;
    gap: var(--space-2);
  }

  .format {
    position: relative;
    padding: 4px 12px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .format input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  .format:has(input:checked) {
    background: var(--accent-fill);
    border-color: var(--accent-fill);
    color: var(--on-accent-small);
    font-weight: 600;
  }

  .format:has(input:focus-visible) {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }

  textarea {
    display: block;
    width: 100%;
    margin-bottom: var(--space-2);
    padding: var(--space-2);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-sm);
    background: var(--surface);
    font-family: ui-monospace, Menlo, monospace;
    font-size: 12px;
    resize: vertical;
  }
</style>
