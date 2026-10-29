<script lang="ts">
  import {
    faChevronLeft,
    faChevronRight,
    faFlag,
    faMagnifyingGlass,
    type IconDefinition,
  } from '@fortawesome/free-solid-svg-icons';
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

  // How far down the page you are, as a thin bar along the bottom of the sticky bar.
  let progress = $state(0);
  $effect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress = max > 0 ? Math.min(100, (scrollY / max) * 100) : 0;
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  });

  // Whether more chips are hidden to the left or right, to show arrows and a fade on that side.
  let more = $state({ left: false, right: false });
  function measure() {
    if (!list) return;
    more = {
      left: list.scrollLeft > 2,
      right: list.scrollLeft + list.clientWidth < list.scrollWidth - 2,
    };
  }
  $effect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  });

  function scrollChips(direction: 1 | -1) {
    list.scrollBy({ left: direction * list.clientWidth * 0.7, behavior: 'smooth' });
  }

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
    <div class="chips-wrap" class:more-left={more.left} class:more-right={more.right}>
      {#if more.left}
        <button class="scroll left" aria-label="Show earlier sections" onclick={() => scrollChips(-1)}>
          <Icon icon={faChevronLeft} />
        </button>
      {/if}
    <ul class="chips" bind:this={list} onscroll={measure}>
      {#each sections as section (section.id)}
        <li>
          <a
            href="#{section.id}"
            aria-current={current === section.id ? 'location' : undefined}
            style:--swatch={section.swatch}
          >
            <span class="chip-icon"><Icon icon={section.icon} /></span>
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
      {#if more.right}
        <button class="scroll right" aria-label="Show more sections" onclick={() => scrollChips(1)}>
          <Icon icon={faChevronRight} />
        </button>
      {/if}
    </div>
  </div>
  <p class="name small-only">{name}</p>
  <div class="progress" aria-hidden="true"><span style:width="{progress}%"></span></div>
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
    border-radius: var(--radius-control);
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
    scrollbar-width: none;
  }

  /* More sections off to one side: a fade and an arrow on that side. */
  .chips-wrap {
    position: relative;
    display: flex;
    min-width: 0;
    flex: 1;
  }

  .chips-wrap .chips {
    flex: 1;
  }

  .more-left .chips {
    mask-image: linear-gradient(to right, transparent 0, #000 48px);
  }

  .more-right .chips {
    mask-image: linear-gradient(to left, transparent 0, #000 48px);
  }

  .more-left.more-right .chips {
    mask-image: linear-gradient(to right, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%);
  }

  .scroll {
    position: absolute;
    top: 50%;
    z-index: 1;
    display: inline-grid;
    place-items: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    background: var(--surface);
    color: var(--ink);
    transform: translateY(-50%);
    cursor: pointer;
  }

  .scroll:hover {
    background: var(--hover);
  }

  .scroll.left {
    left: 0;
  }

  .scroll.right {
    right: 0;
  }

  .chips a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    color: var(--ink);
    text-decoration: none;
    white-space: nowrap;
    font-size: 14px;
    transition: background-color 0.15s;
  }

  .chips a:hover {
    background: var(--hover);
  }

  /* Where you are: the current section's chip, underlined in its own colour. */
  .chips a[aria-current] {
    font-weight: 700;
    box-shadow: inset 0 -3px 0 var(--swatch);
  }

  .chip-icon {
    display: inline-flex;
    color: var(--swatch);
  }

  .progress {
    height: 3px;
    background: var(--line);
  }

  .progress span {
    display: block;
    height: 100%;
    background: var(--eurth-blue);
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

    .chips-wrap {
      flex: 1 1 100%;
    }
  }
</style>
