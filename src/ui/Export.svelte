<script lang="ts">
  import { faMarkdown, faWikipediaW } from '@fortawesome/free-brands-svg-icons';
  import { faCheck, faCopy, faFileCode, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import { copyText, toast } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import Line from '@eurth/style/components/Line.svelte';
  import { lineConfirm, lineDownloadOutline } from '@eurth/style/line';
  import type { Profile } from '../model/engine';
  import { toJson, toMarkdown, toWikitext } from '../model/formats';
  import type { Country } from '../model/settings';
  import { downloadText } from './download';
  import { clink } from './fun';
  import { mint } from './minted.svelte';

  // The country as text to paste elsewhere, or to keep as a file: Markdown, wikitext or JSON.
  // Copied text gets postmarked.
  let { name, country, profile, link }: { name: string; country: Country; profile: Profile; link: string } = $props();

  type Format = 'markdown' | 'wikitext' | 'json';
  let format = $state<Format>('markdown');
  let copied = $state(false);

  const formats: { id: Format; label: string; icon: IconDefinition; help: string; extension: string; type: string }[] = [
    {
      id: 'markdown',
      label: 'Markdown',
      icon: faMarkdown,
      extension: 'md',
      type: 'text/markdown',
      help: 'For a post on the Eurth.org forum: a summary, the institutions and the budget as tables.',
    },
    {
      id: 'wikitext',
      label: 'Wikitext',
      icon: faWikipediaW,
      extension: 'txt',
      type: 'text/plain',
      help: 'For IIWiki: an {{Infobox country}}, a Government section and a budget table.',
    },
    {
      id: 'json',
      label: 'JSON',
      icon: faFileCode,
      extension: 'json',
      type: 'application/json',
      help: 'For tools and spreadsheets: the labels, institutions, budget, scales and checks, plus the raw settings.',
    },
  ];
  const writers = { markdown: toMarkdown, wikitext: toWikitext, json: toJson };
  const chosen = $derived(formats.find((f) => f.id === format)!);
  const text = $derived(writers[format](name, country, profile, link));

  let postmarked = $state(0);
  let today = $state('');

  async function copy() {
    if (!(await copyText(text))) {
      toast("That didn't copy. Select the text and copy it.");
      return;
    }
    mint();
    copied = true;
    clink();
    today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
    postmarked += 1;
    setTimeout(() => (copied = false), 2000);
  }

  // The same text as a file, named after the country: "Ruritania.md".
  function save() {
    mint();
    downloadText(text, `${name}.${chosen.extension}`, chosen.type);
  }
</script>

<div class="eu-row formats" role="radiogroup" aria-label="Format">
  {#each formats as f (f.id)}
    <label class="eu-pill">
      <input type="radio" name="export-format" value={f.id} bind:group={format} />
      <span class="eu-check"><Icon icon={faCheck} /></span>
      <Icon icon={f.icon} />
      {f.label}
    </label>
  {/each}
</div>
<p class="eu-help">{chosen.help}</p>
<label class="eu-visually-hidden" for="export-text">{chosen.label}</label>
<div class="paper">
  <textarea id="export-text" class="eu-textarea" readonly rows="9" value={text}></textarea>
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
<div class="eu-row">
  <button type="button" class="eu-btn" onclick={copy}>
    {#if copied}<Line icon={lineConfirm} />{:else}<Icon icon={faCopy} />{/if}
    {copied ? 'Copied' : 'Copy text'}
  </button>
  <button type="button" class="eu-btn" data-click="bounce" aria-label="Download {name} as {chosen.label}" onclick={save}>
    <Line icon={lineDownloadOutline} /> Download
  </button>
</div>

<style>
  .formats {
    gap: var(--space-2);
  }

  .paper {
    position: relative;
  }

  textarea {
    display: block;
    font: var(--type-data);
  }

  /* A postmark, stamped on the text when it's copied, and gone again. Only ever shown while
     it moves, so with motion off it never appears: the button's "Copied" says the same. */
  .postmark {
    position: absolute;
    top: var(--space-2);
    right: var(--space-3);
    display: grid;
    place-content: center;
    width: calc(3 * var(--size-target));
    height: calc(3 * var(--size-target));
    border: 3px double var(--accent-text);
    border-radius: var(--radius-full);
    background: var(--surface);
    color: var(--accent-text);
    font: var(--type-note);
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    pointer-events: none;
    transform: rotate(-12deg);
    opacity: 0;
    animation: postmark 2.6s ease-out;
  }

  .postmark .date {
    margin: var(--space-1) 0;
    padding: var(--space-1) 0;
    border-block: 1px solid currentColor;
  }

  @keyframes postmark {
    0% {
      opacity: 0;
      transform: scale(1.6) rotate(-30deg);
    }
    10% {
      opacity: 1;
      transform: scale(0.96) rotate(-12deg);
    }
    16% {
      transform: scale(1) rotate(-12deg);
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(-12deg);
    }
  }
</style>
