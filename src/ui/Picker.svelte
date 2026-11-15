<script lang="ts">
  import { faBookOpen, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
  import Icon from '@eurth/style/components/Icon.svelte';
  import { countries, type Region } from '../model/countries';
  import { describe } from '../model/engine';
  import { examples } from '../model/examples';
  import type { Country } from '../model/settings';
  import { ref } from './ref';

  let {
    open,
    host,
    onpick,
    onclose,
  }: {
    open: boolean;
    /** This site's host, for the ?ref on links to other sites. */
    host: string;
    onpick: (country: Country, name: string, flag?: string) => void;
    onclose: () => void;
  } = $props();

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

  // The lists are worked out the first time the window opens, not with the page: describing
  // 215 countries is work the page shouldn't wait for.
  let shown = $state(false);
  const all = $derived.by(() => {
    if (!shown) return { examples: [] as Entry[], regions: [] as { region: Region; entries: Entry[] }[] };
    return {
      examples: examples.map((e) => entry(`example-${e.id}`, e.title, e.country)).sort(byTitle),
      regions: (['Africa', 'Americas', 'Asia', 'Europe', 'Middle East', 'Oceania'] satisfies Region[]).map((region) => ({
        region,
        entries: countries
          .filter((c) => c.region === region)
          .map((c) => entry(`country-${c.code}`, c.name, c.country, c.note, c.code.toLowerCase()))
          .sort(byTitle),
      })),
    };
  });

  let dialog: HTMLDialogElement;
  let query = $state('');
  const words = $derived(fold(query).split(/\s+/).filter(Boolean));
  const matches = (e: Entry) => words.every((w) => e.text.includes(w));

  const shownExamples = $derived(all.examples.filter(matches));
  const shownRegions = $derived(
    all.regions.map((r) => ({ ...r, entries: r.entries.filter(matches) })).filter((r) => r.entries.length),
  );
  const shownCountries = $derived(shownRegions.reduce((n, r) => n + r.entries.length, 0));

  $effect(() => {
    if (open) shown = true;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });

  function pick(e: Entry, isCountry: boolean) {
    onpick(structuredClone(e.country), isCountry ? e.title : '', e.flag);
    dialog.close();
  }
</script>

<dialog bind:this={dialog} class="eu-dialog picker" {onclose} aria-labelledby="picker-title">
  <div class="eu-dialog-top">
    <h2 id="picker-title"><Icon icon={faBookOpen} /> Start from an example or a real country</h2>
    <button type="button" class="eu-btn eu-btn--quiet eu-btn--icon" aria-label="Close" onclick={() => dialog.close()}><Icon icon={faXmark} /></button>
  </div>
  <div class="search">
    <Icon icon={faMagnifyingGlass} />
    <label class="eu-visually-hidden" for="picker-search">Search</label>
    <!-- svelte-ignore a11y_autofocus -->
    <input
      id="picker-search"
      class="eu-input"
      maxlength="100"
      autocomplete="off"
      type="search"
      placeholder="Search by name, or by type: monarchy, one-party, federal…"
      bind:value={query}
      autofocus
    />
  </div>

  {#if shown}
    <div class="lists">
      <section aria-labelledby="examples-title">
        <h3 id="examples-title">Examples <span class="count">{shownExamples.length}</span></h3>
        {#if shownExamples.length}
          <ul>
            {#each shownExamples as e (e.key)}
              <li>
                <button type="button" class="eu-btn eu-btn--quiet entry" onclick={() => pick(e, false)}>
                  <span class="title">{e.title}</span>
                  <span class="meta">{e.government} · {e.regime}</span>
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="eu-help">No examples match.</p>
        {/if}
      </section>

      <section aria-labelledby="countries-title">
        <h3 id="countries-title">Real countries <span class="count">{shownCountries}</span></h3>
        <p class="eu-help">
          Approximate, as of 2026: institutions follow each constitution, and how free elections are follows the
          consensus of election observers. Spot a mistake?
          <a href={ref('https://eurth.org', host)}>Tell us on the Eurth forum</a>.
        </p>
        {#each shownRegions as r (r.region)}
          <h4 class="eu-kicker">{r.region}</h4>
          <ul>
            {#each r.entries as e (e.key)}
              <li>
                <button type="button" class="eu-btn eu-btn--quiet entry" onclick={() => pick(e, true)}>
                  <span class="title">
                    <img class="flag" src="/flags/{e.flag}.svg" alt="" width="20" height="20" loading="lazy" />
                    {e.title}
                  </span>
                  <span class="meta">{e.government} · {e.regime}</span>
                  {#if e.note}<span class="meta note">{e.note}</span>{/if}
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="eu-help">No countries match.</p>
        {/each}
      </section>
    </div>
  {/if}
</dialog>

<style>
  /* As wide as a column of text, or the screen. The title and the search stay put; the lists
     scroll under them. */
  .picker {
    width: min(var(--size-measure), calc(100vw - 2 * var(--space-4)));
    overflow: hidden;
  }

  .picker[open] {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .search {
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--space-2);
    color: var(--ink-muted);
  }

  .lists {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-height: 0;
    margin: 0 calc(-1 * var(--space-2));
    padding: 0 var(--space-2) var(--space-2);
    overflow-y: auto;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  h3 {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }

  h4 {
    margin-top: var(--space-2);
  }

  .count {
    color: var(--ink-muted);
    font: var(--type-data);
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
    gap: var(--space-1) var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* A country to start from: its name, then what it is in a smaller line. */
  .entry {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    justify-items: start;
    gap: 0;
    width: 100%;
    padding: var(--space-2);
    text-align: left;
  }

  .title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .flag {
    flex: none;
    width: var(--space-5);
    height: var(--space-5);
  }

  .meta {
    color: var(--ink-muted);
    font: var(--type-note);
  }

  /* On the hover fill, text is ink. */
  .entry:hover .meta {
    color: var(--ink);
  }

  .note {
    font-style: italic;
  }
</style>
