<script lang="ts">
  import { faCheck, faCopy, faFloppyDisk, faLink } from '@fortawesome/free-solid-svg-icons';
  import type { Profile } from '../model/engine';
  import { toMarkdown, toWikitext } from '../model/formats';
  import type { Country } from '../model/settings';
  import { clink, paperPlane, toast } from './fun';
  import Icon from './Icon.svelte';

  let {
    name,
    country,
    profile,
    link,
    onsave,
  }: { name: string; country: Country; profile: Profile; link: string; onsave: () => void } = $props();

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

  // Copying the link sends a paper plane off; copying a text gets it postmarked.
  let postmarked = $state(0);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();

  async function copy(what: 'link' | Format, button: HTMLElement) {
    await navigator.clipboard.writeText(what === 'link' ? link : text);
    copied = what;
    clink();
    if (what === 'link') {
      paperPlane(button);
      toast('Freshly minted, and copied.');
    } else {
      postmarked += 1;
    }
    setTimeout(() => (copied = null), 2000);
  }
</script>

<div class="buttons">
  <button class="btn btn-primary" onclick={(e) => copy('link', e.currentTarget)}>
    <Icon icon={copied === 'link' ? faCheck : faLink} />
    {copied === 'link' ? 'Link copied' : 'Copy link'}
  </button>
  <button class="btn" data-click="bounce" onclick={onsave}>
    <Icon icon={faFloppyDisk} /> Save on this device
  </button>
</div>
<p class="help">
  The link holds every setting and the name, so it brings this country back exactly. Saved countries are listed under
  Examples &amp; countries, in this browser only.
</p>

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
<div class="paper">
  <textarea id="share-text" readonly rows="9" value={text}></textarea>
  {#key postmarked}
    {#if postmarked}
      <span class="postmark" aria-hidden="true">
        <span>Copied</span>
        <span class="date">{today}</span>
        <span>gov.eurth.org</span>
      </span>
    {/if}
  {/key}
</div>
<button class="btn" onclick={(e) => copy(format, e.currentTarget)}>
  <Icon icon={copied === format ? faCheck : faCopy} />
  {copied === format ? 'Copied' : 'Copy'}
</button>

<style>
  .help {
    margin: var(--space-1) 0 var(--space-3);
    color: var(--ink-muted);
    font-size: 13px;
  }

  .buttons,
  .formats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .paper {
    position: relative;
  }

  /* A postmark, stamped on the text when it's copied. */
  .postmark {
    position: absolute;
    top: var(--space-2);
    right: var(--space-3);
    display: grid;
    place-content: center;
    width: 96px;
    height: 96px;
    border: 3px double var(--accent-text);
    border-radius: 50%;
    color: var(--accent-text);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    line-height: 1.3;
    text-align: center;
    text-transform: uppercase;
    pointer-events: none;
    transform: rotate(-12deg);
    opacity: 0;
    animation: postmark 2.6s ease-out;
  }

  .postmark .date {
    margin: 2px 0;
    padding: 2px 0;
    border-block: 1px solid currentColor;
    font-size: 11px;
  }

  @keyframes postmark {
    0% {
      opacity: 0;
      transform: scale(1.6) rotate(-30deg);
    }
    10% {
      opacity: 0.9;
      transform: scale(0.96) rotate(-12deg);
    }
    16% {
      transform: scale(1) rotate(-12deg);
    }
    80% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
      transform: rotate(-12deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .postmark {
      animation: postmark-calm 2.6s steps(1);
    }

    @keyframes postmark-calm {
      0% {
        opacity: 0.9;
      }
      100% {
        opacity: 0;
      }
    }
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
