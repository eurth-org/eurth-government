<script lang="ts">
  import { faFlag, faMagnifyingGlass, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import Icon from './Icon.svelte';

  interface Section {
    id: string;
    name: string;
    icon: IconDefinition;
    swatch: string;
  }

  let {
    sections,
    current,
    name,
    onsearch,
  }: { sections: Section[]; current: string; name: string; onsearch: (query: string) => number } = $props();

  let query = $state('');
  let found = $state(0);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let list: HTMLUListElement;

  function search() {
    clearTimeout(timer);
    timer = setTimeout(() => (found = query.trim() ? onsearch(query.trim()) : 0), 250);
  }

  // Keep the current section's chip in view when the list scrolls sideways. Only the list
  // scrolls: scrollIntoView would move the page too.
  $effect(() => {
    const chip = list?.querySelector<HTMLElement>(`[href="#${current}"]`);
    if (!chip) return;
    const left = chip.offsetLeft - list.offsetLeft;
    if (left < list.scrollLeft || left + chip.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: left - 16, behavior: 'smooth' });
    }
  });
</script>

<nav class="nav" aria-label="Sections">
  <div class="inner">
    <form
      class="search"
      role="search"
      onsubmit={(e) => {
        e.preventDefault();
        found = query.trim() ? onsearch(query.trim()) : 0;
      }}
    >
      <label class="visually-hidden" for="setting-search">Search settings</label>
      <Icon icon={faMagnifyingGlass} />
      <input id="setting-search" type="search" placeholder="Search settings" bind:value={query} oninput={search} />
      {#if query.trim()}
        <span class="found" aria-live="polite">{found === 1 ? '1 match' : `${found} matches`}</span>
      {/if}
    </form>
    <ul class="chips" bind:this={list}>
      {#each sections as section (section.id)}
        <li>
          <a href="#{section.id}" aria-current={current === section.id ? 'location' : undefined}>
            <span class="swatch" style:--swatch={section.swatch}></span>
            <Icon icon={section.icon} />
            <span>{section.name}</span>
          </a>
        </li>
      {/each}
      <li class="small-only">
        <a href="#results" aria-current={current === 'results' ? 'location' : undefined}>
          <Icon icon={faFlag} />
          <span>Result</span>
        </a>
      </li>
    </ul>
  </div>
  <p class="name small-only">{name}</p>
</nav>

<style>
  .nav {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--header);
    border-bottom: 1px solid var(--line);
  }

  .inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-2) var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .search {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: none;
    padding: 0 var(--space-2);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--ink-muted);
  }

  .search input {
    width: 11rem;
    padding: 6px 0;
    border: 0;
    background: transparent;
    color: var(--ink);
  }

  .search input:focus-visible {
    outline: none;
  }

  .search:focus-within {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }

  .found {
    font-size: 13px;
    white-space: nowrap;
  }

  .chips {
    display: flex;
    gap: var(--space-1);
    margin: 0;
    padding: 2px;
    list-style: none;
    overflow-x: auto;
    scrollbar-width: thin;
  }

  .chips a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    color: var(--ink);
    text-decoration: none;
    white-space: nowrap;
    font-size: 14px;
  }

  .chips a:hover {
    background: var(--button);
  }

  .chips a[aria-current] {
    background: var(--button);
    font-weight: 700;
    box-shadow: inset 0 -2px 0 var(--accent-fill);
  }

  .swatch {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-sm);
    background: var(--swatch);
  }

  .name {
    margin: 0;
    padding: 0 var(--space-4) var(--space-2);
    font-weight: 700;
  }

  .small-only {
    display: none;
  }

  @media (max-width: 899px) {
    .small-only {
      display: block;
    }

    .inner {
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .search {
      flex: 1 1 100%;
    }

    .search input {
      width: 100%;
    }

    .chips {
      flex: 1 1 100%;
    }
  }
</style>
