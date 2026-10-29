<script lang="ts">
  import { faMarkdown, faWikipediaW } from '@fortawesome/free-brands-svg-icons';
  import { faCheck, faCopy, faFileCode, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import type { Profile } from '../model/engine';
  import { toJson, toMarkdown, toWikitext } from '../model/formats';
  import type { Country } from '../model/settings';
  import { clink } from './fun';
  import Icon from './Icon.svelte';

  // The country as text to paste elsewhere: Markdown, wikitext or JSON. Copied text gets postmarked.
  let { name, country, profile, link }: { name: string; country: Country; profile: Profile; link: string } = $props();

  type Format = 'markdown' | 'wikitext' | 'json';
  let format = $state<Format>('markdown');
  let copied = $state(false);

  const formats: { id: Format; label: string; icon: IconDefinition; help: string }[] = [
    {
      id: 'markdown',
      label: 'Markdown',
      icon: faMarkdown,
      help: 'For a post on the Eurth.org forum: a summary, the institutions and the budget as tables.',
    },
    {
      id: 'wikitext',
      label: 'Wikitext',
      icon: faWikipediaW,
      help: 'For IIWiki: an {{Infobox country}}, a Government section and a budget table.',
    },
    {
      id: 'json',
      label: 'JSON',
      icon: faFileCode,
      help: 'For tools and spreadsheets: the labels, institutions, budget, scales and checks, plus the raw settings.',
    },
  ];
  const writers = { markdown: toMarkdown, wikitext: toWikitext, json: toJson };
  const text = $derived(writers[format](name, country, profile, link));

  let postmarked = $state(0);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();

  async function copy() {
    await navigator.clipboard.writeText(text);
    copied = true;
    clink();
    postmarked += 1;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="formats" role="radiogroup" aria-label="Format">
  {#each formats as f (f.id)}
    <label class="pill plain">
      <input type="radio" name="export-format" value={f.id} bind:group={format} />
      <Icon icon={f.icon} />
      <span class="steady" data-text={f.label}>{f.label}</span>
    </label>
  {/each}
</div>
<p class="help">{formats.find((f) => f.id === format)!.help}</p>
<label class="visually-hidden" for="export-text">{formats.find((f) => f.id === format)!.label}</label>
<div class="paper">
  <textarea id="export-text" readonly rows="9" value={text}></textarea>
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
<div class="copy-row">
  <button class="btn" onclick={copy}>
    <Icon icon={copied ? faCheck : faCopy} />
    {copied ? 'Copied' : 'Copy text'}
  </button>
</div>

<style>
  /* Like the charts' "Download as" row, with "Copy image". */
  .copy-row {
    display: flex;
    margin-top: var(--space-2);
    font-size: 13px;
  }

  .copy-row .btn {
    padding: 3px 10px;
  }

  .help {
    margin: var(--space-1) 0 var(--space-3);
    color: var(--ink-muted);
    font-size: 13px;
  }

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
