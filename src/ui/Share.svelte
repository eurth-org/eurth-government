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
    {
      id: 'markdown',
      label: 'Markdown',
      help: 'For a post on the Eurth.org forum: a summary, the institutions and the budget as tables.',
    },
    {
      id: 'wikitext',
      label: 'Wikitext',
      help: 'For IIWiki: an {{Infobox country}}, a Government section and a budget table.',
    },
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

<button class="btn btn-primary" onclick={() => copy('link')}>
  <Icon icon={copied === 'link' ? faCheck : faLink} />
  {copied === 'link' ? 'Link copied' : 'Copy link'}
</button>
<p class="help">The link holds every setting and the name, so it brings this country back exactly.</p>

<div class="formats" role="radiogroup" aria-label="Format">
  {#each formats as f (f.id)}
    <label class="pill">
      <input type="radio" name="share-format" value={f.id} bind:group={format} />
      <span class="check"><Icon icon={faCheck} /></span>
      <span>{f.label}</span>
    </label>
  {/each}
</div>
<p class="help">{formats.find((f) => f.id === format)!.help}</p>
<label class="visually-hidden" for="share-text">{format === 'markdown' ? 'Markdown' : 'Wikitext'}</label>
<textarea id="share-text" readonly rows="9" value={text}></textarea>
<button class="btn" onclick={() => copy(format)}>
  <Icon icon={copied === format ? faCheck : faCopy} />
  {copied === format ? 'Copied' : 'Copy'}
</button>

<style>
  .help {
    margin: var(--space-1) 0 var(--space-3);
    color: var(--ink-muted);
    font-size: 13px;
  }

  .formats {
    display: flex;
    gap: var(--space-2);
  }

  textarea {
    display: block;
    width: 100%;
    margin-bottom: var(--space-2);
    padding: var(--space-2);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    background: var(--surface);
    font-family: ui-monospace, Menlo, monospace;
    font-size: 12px;
    resize: vertical;
  }
</style>
