<script lang="ts">
  import { faBookOpen, faFloppyDisk, faMagnifyingGlass, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
  import { countries, type Region } from '../model/countries';
  import { describe } from '../model/engine';
  import { examples } from '../model/examples';
  import { decodeCountry } from '../model/link';
  import type { Country } from '../model/settings';
  import Icon from './Icon.svelte';
  import { ref } from './ref';
  import { forget, loadSaved, type Saved } from './saved';

  let {
    open,
    onpick,
    onclose,
  }: { open: boolean; onpick: (country: Country, name: string, flag?: string) => void; onclose: () => void } = $props();

  interface Entry {
    key: string;
    title: string;
    government: string;
    regime: string;
    note?: string;
    /** A real country's ISO code, for its flag. */
    flag?: string;
    country: Country;
    /** What the search matches against. */
    text: string;
  }

  const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const byTitle = (a: Entry, b: Entry) => a.title.localeCompare(b.title);

  function entry(key: string, title: string, country: Country, note?: string, flag?: string): Entry {
    const profile = describe(country);
    const regime = profile.labels.regime.label;
    return { key, title, government: profile.name, regime, note, flag, country, text: fold(`${title} ${profile.name} ${regime}`) };
  }

  const exampleEntries = examples.map((e) => entry(`example-${e.id}`, e.title, e.country)).sort(byTitle);
  const regions = (['Africa', 'Americas', 'Asia', 'Europe', 'Middle East', 'Oceania'] satisfies Region[]).map((region) => ({
    region,
    entries: countries
      .filter((c) => c.region === region)
      .map((c) => entry(`country-${c.code}`, c.name, c.country, c.note, c.code.toLowerCase()))
      .sort(byTitle),
  }));

  let dialog: HTMLDialogElement;
  let query = $state('');
  const words = $derived(fold(query).split(/\s+/).filter(Boolean));
  const matches = (e: Entry) => words.every((w) => e.text.includes(w));

  // Countries saved on this device, read again each time the dialog opens.
  let saved = $state<Saved[]>([]);
  const shownSaved = $derived(saved.filter((s) => words.every((w) => fold(`${s.name} ${s.government}`).includes(w))));
  const shownExamples = $derived(exampleEntries.filter(matches));
  const shownRegions = $derived(
    regions.map((r) => ({ ...r, entries: r.entries.filter(matches) })).filter((r) => r.entries.length),
  );
  const shownCountries = $derived(shownRegions.reduce((n, r) => n + r.entries.length, 0));

  $effect(() => {
    if (open) saved = loadSaved();
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });

  function pick(e: Entry, isCountry: boolean) {
    onpick(structuredClone(e.country), isCountry ? e.title : '', e.flag);
    dialog.close();
  }

  function pickSaved(s: Saved) {
    onpick(decodeCountry(s.code), s.name === 'Your country' ? '' : s.name, s.flag);
    dialog.close();
  }

  const savedOn = (at: string) => new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
</script>

<dialog bind:this={dialog} onclose={onclose} aria-labelledby="picker-title">
  <div class="top">
    <h2 id="picker-title"><Icon icon={faBookOpen} /> Start from an example or a real country</h2>
    <button class="btn close" aria-label="Close" onclick={() => dialog.close()}><Icon icon={faXmark} /></button>
  </div>
  <div class="search">
    <Icon icon={faMagnifyingGlass} />
    <label class="visually-hidden" for="picker-search">Search</label>
    <!-- svelte-ignore a11y_autofocus -->
    <input
      id="picker-search"
      maxlength="100"
      autocomplete="off"
      type="search"
      placeholder="Search by name, or by type: monarchy, one-party, federal…"
      bind:value={query}
      autofocus
    />
  </div>

  <div class="lists">
    {#if shownSaved.length}
      <section aria-labelledby="saved-title">
        <h3 id="saved-title"><Icon icon={faFloppyDisk} /> Saved on this device <span class="count">{shownSaved.length}</span></h3>
        <ul>
          {#each shownSaved as s (s.name + s.code)}
            <li class="saved">
              <button onclick={() => pickSaved(s)}>
                <span class="title">
                  {#if s.flag}<img class="flag" src="/flags/{s.flag}.svg" alt="" width="16" height="16" />{/if}
                  {s.name}
                </span>
                <span class="meta">{s.government} · saved {savedOn(s.at)}</span>
              </button>
              <button class="forget" aria-label="Forget {s.name}" title="Forget" onclick={() => (saved = forget(s))}>
                <Icon icon={faTrashCan} />
              </button>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <section aria-labelledby="examples-title">
      <h3 id="examples-title">Examples <span class="count">{shownExamples.length}</span></h3>
      {#if shownExamples.length}
        <ul>
          {#each shownExamples as e (e.key)}
            <li>
              <button onclick={() => pick(e, false)}>
                <span class="title">{e.title}</span>
                <span class="meta">{e.government} · {e.regime}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="empty">No examples match.</p>
      {/if}
    </section>

    <section aria-labelledby="countries-title">
      <h3 id="countries-title">Real countries <span class="count">{shownCountries}</span></h3>
      <p class="about">
        Approximate, as of 2026: institutions follow each constitution, and how free elections are follows the
        consensus of election observers. Spot a mistake?
        <a href={ref('https://github.com/eurth-org/eurth-government/issues')}>Tell us on GitHub</a>.
      </p>
      {#each shownRegions as r (r.region)}
        <h4>{r.region}</h4>
        <ul>
          {#each r.entries as e (e.key)}
            <li>
              <button onclick={() => pick(e, true)}>
                <span class="title">
                  <img class="flag" src="/flags/{e.flag}.svg" alt="" width="16" height="16" loading="lazy" />
                  {e.title}
                </span>
                <span class="meta">{e.government} · {e.regime}</span>
                {#if e.note}<span class="note">{e.note}</span>{/if}
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="empty">No countries match.</p>
      {/each}
    </section>
  </div>
</dialog>

<style>
  dialog {
    width: min(720px, calc(100vw - 2 * var(--space-4)));
    max-height: min(820px, calc(100dvh - 2 * var(--space-4)));
    padding: 0;
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    background: var(--surface);
    color: var(--ink);
    display: none;
    flex-direction: column;
  }

  dialog[open] {
    display: flex;
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 0.55);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-4) var(--space-2);
  }

  h2 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    font-size: 18px;
  }

  .search {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0 var(--space-4) var(--space-3);
    padding: 0 var(--space-3);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    color: var(--ink-muted);
  }

  .search:focus-within {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }

  .search input {
    flex: 1;
    padding: 8px 0;
    border: 0;
    background: transparent;
    color: var(--ink);
  }

  .search input:focus-visible {
    outline: none;
  }

  .lists {
    overflow-y: auto;
    padding: 0 var(--space-4) var(--space-4);
  }

  h3 {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    margin: var(--space-3) 0 var(--space-2);
    font-size: 16px;
  }

  h4 {
    margin: var(--space-3) 0 var(--space-1);
    color: var(--ink-muted);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .count {
    color: var(--ink-muted);
    font-size: 13px;
    font-weight: 400;
  }

  .about,
  .empty {
    margin: 0 0 var(--space-2);
    color: var(--ink-muted);
    font-size: 13px;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 2px var(--space-2);
  }

  li button {
    display: grid;
    width: 100%;
    padding: 6px var(--space-2);
    border: 0;
    border-radius: var(--radius-control);
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  li button:hover {
    background: var(--hover);
  }

  .title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }

  .flag {
    flex: none;
    width: 16px;
    height: 16px;
  }

  .saved {
    display: flex;
    align-items: stretch;
  }

  .saved > button:first-child {
    flex: 1;
  }

  li .forget {
    display: grid;
    place-items: center;
    width: 32px;
    padding: 0;
    color: var(--ink-muted);
  }

  li .forget:hover {
    color: var(--danger);
  }

  .meta,
  .note {
    color: var(--ink-muted);
    font-size: 13px;
  }

  .note {
    font-style: italic;
  }
</style>
