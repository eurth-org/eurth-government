<script lang="ts">
  import {
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faChevronUp,
    faFlag,
    faMagnifyingGlass,
    faXmark,
    type IconDefinition,
  } from '@fortawesome/free-solid-svg-icons';
  import { calm } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import { scale } from 'svelte/transition';
  import Coin from './Coin.svelte';

  interface Section {
    id: string;
    name: string;
    icon: IconDefinition;
    /** The name of a colour token: "cat-teal". */
    swatch: string;
  }

  let {
    sections,
    current,
    name,
    hitCounts,
    hitCount,
    hit,
    review = null,
    onsearch,
    onstep,
    onclose,
  }: {
    sections: Section[];
    current: string;
    name: string;
    /** Search matches per section. */
    hitCounts: Record<string, number>;
    hitCount: number;
    /** Which match the visitor is on, from 0. */
    hit: number;
    /**
     * Settings picked out elsewhere (a check's "Show settings", a label's "Based on"), named
     * here. They stay highlighted, and the visitor steps through them, until closed.
     */
    review?: string | null;
    onsearch: (query: string) => void;
    onstep: (direction: 1 | -1) => void;
    onclose: () => void;
  } = $props();

  let query = $state('');
  const reviewing = $derived(!!review && !query.trim());
  let timer: ReturnType<typeof setTimeout> | undefined;
  let list: HTMLUListElement;

  // Once the suite's header has scrolled away, the Eurth coin joins the bar as a way back to
  // the top. (How far down the page you are is the suite's own scroll line, from @eurth/style.)
  let away = $state(false);
  $effect(() => {
    const update = () => {
      away = (document.querySelector('.eu-header')?.getBoundingClientRect().bottom ?? 0) < 0;
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
    list.scrollBy({ left: direction * list.clientWidth * 0.7, behavior: calm() ? 'auto' : 'smooth' });
  }

  function search() {
    clearTimeout(timer);
    timer = setTimeout(() => onsearch(query.trim()), 250);
  }

  // Enter goes to the next match, Shift+Enter to the previous; Escape clears the search.
  function keys(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      query = '';
      clearTimeout(timer);
      onsearch('');
    }
  }

  // Keep the current section's chip in view when the list scrolls sideways. Only the list
  // scrolls: scrollIntoView would move the page too.
  $effect(() => {
    const chip = list?.querySelector<HTMLElement>(`[href="#${current}"]`);
    if (!chip) return;
    const left = chip.offsetLeft - list.offsetLeft;
    if (left < list.scrollLeft || left + chip.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: left - 16, behavior: calm() ? 'auto' : 'smooth' });
    }
  });
</script>

<nav class="nav" aria-label="Sections">
  <div class="inner">
    {#if away}
      <button
        type="button"
        class="eu-btn eu-btn--quiet eu-btn--icon to-top"
        aria-label="Back to the top"
        data-tip="Back to the top"
        data-tip-align="start"
        transition:scale={{ duration: calm() ? 0 : 200, start: 0.6 }}
        onclick={() => scrollTo({ top: 0, behavior: calm() ? 'auto' : 'smooth' })}
      >
        <Coin size={32} />
      </button>
    {/if}
    <form
      class="search"
      role="search"
      onsubmit={(e) => {
        e.preventDefault();
        clearTimeout(timer);
        if (!hitCount) onsearch(query.trim());
        else onstep((e.submitter as HTMLElement | null)?.dataset.step === '-1' ? -1 : 1);
      }}
    >
      <Icon icon={faMagnifyingGlass} />
      <!-- While stepping through picked-out settings, their name stands in for the search box. -->
      {#if reviewing}
        <span class="review">{review}</span>
      {:else}
      <label class="eu-visually-hidden" for="setting-search">Search settings</label>
      <input
        id="setting-search"
        maxlength="100"
        autocomplete="off"
        type="search"
        placeholder="Search settings"
        bind:value={query}
        oninput={search}
        onkeydown={(e) => {
          keys(e);
          if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            onstep(-1);
          }
        }}
      />
      {/if}
      {#if query.trim() || reviewing}
        <span class="found" aria-live="polite">{hitCount ? `${hit + 1} of ${hitCount}` : 'No matches'}</span>
        <button class="eu-btn eu-btn--quiet eu-btn--icon" type="button" aria-label="Previous" disabled={!hitCount} onclick={() => onstep(-1)}>
          <Icon icon={faChevronUp} />
        </button>
        <button class="eu-btn eu-btn--quiet eu-btn--icon" type="submit" aria-label="Next" disabled={!hitCount}>
          <Icon icon={faChevronDown} />
        </button>
      {/if}
      {#if reviewing}
        <button class="eu-btn eu-btn--quiet eu-btn--icon" type="button" aria-label="Done" onclick={onclose}>
          <Icon icon={faXmark} />
        </button>
      {/if}
    </form>
    <div class="chips-wrap">
      {#if more.left}
        <button type="button" class="eu-btn eu-btn--icon scroll left" aria-label="Show earlier sections" onclick={() => scrollChips(-1)}>
          <Icon icon={faChevronLeft} />
        </button>
      {/if}
      <ul class="chips" bind:this={list} onscroll={measure}>
        {#each sections as section (section.id)}
          <li>
            <a href="#{section.id}" aria-current={current === section.id ? 'location' : undefined} style:--swatch="var(--{section.swatch})">
              <span class="chip-icon"><Icon icon={section.icon} /></span>
              <span class="chip-label" data-label={section.name}>{section.name}</span>
              {#if hitCounts[section.id]}
                <span class="hits" aria-label="{hitCounts[section.id]} search matches">{hitCounts[section.id]}</span>
              {/if}
            </a>
          </li>
        {/each}
        <li class="small-only">
          <a href="#results" aria-current={current === 'results' ? 'location' : undefined}>
            <Icon icon={faFlag} />
            <span class="chip-label" data-label="Result">Result</span>
          </a>
        </li>
      </ul>
      {#if more.right}
        <button type="button" class="eu-btn eu-btn--icon scroll right" aria-label="Show more sections" onclick={() => scrollChips(1)}>
          <Icon icon={faChevronRight} />
        </button>
      {/if}
    </div>
  </div>
  <p class="name small-only">{name}</p>
</nav>

<style>
  /* The sticky bar: search, the sections and how far down you are. It sits under the suite's
     header and its menus, and over the page as that scrolls by. */
  .nav {
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid var(--line);
    background: var(--surface);
  }

  .inner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) 0;
  }

  .to-top {
    flex: none;
  }

  /* One box for the search: the magnifier, the field, the count and the arrows. */
  .search {
    display: flex;
    flex: none;
    align-items: center;
    gap: var(--space-2);
    padding-left: var(--space-3);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-md);
    background: var(--surface);
    color: var(--ink-muted);
  }

  .search input {
    width: calc(4 * var(--size-target));
    min-height: var(--size-target);
    padding: 0 var(--space-2) 0 0;
    border: 0;
    background: transparent;
    color: var(--ink);
    font: var(--type-body);
  }

  .search input::placeholder {
    color: var(--ink-muted);
    opacity: 1;
  }

  .search input:focus-visible {
    outline: none;
  }

  .search:focus-within {
    outline: var(--size-ring) solid var(--focus-ring);
    outline-offset: var(--size-ring);
  }

  /* The arrows keep their own ring inside the box. */
  .search:has(button:focus-visible) {
    outline: none;
  }

  /* While stepping through picked-out settings, their name stands in for the search box. */
  .review {
    max-width: calc(4 * var(--size-target));
    overflow: hidden;
    color: var(--ink);
    font: var(--type-label);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .found {
    color: var(--ink);
    font: var(--type-data);
    white-space: nowrap;
  }

  /* How many search matches a section holds. */
  .hits {
    min-width: var(--space-5);
    padding: 0 var(--space-1);
    border-radius: var(--radius-md);
    background: var(--highlight);
    color: var(--on-highlight);
    font: var(--type-note);
    font-weight: 700;
    text-align: center;
  }

  .chips {
    display: flex;
    flex: 1;
    gap: var(--space-1);
    margin: 0;
    padding: var(--size-ring);
    list-style: none;
    overflow-x: auto;
    scrollbar-width: none;
  }

  /* More sections off to one side: an arrow on that side. */
  .chips-wrap {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
  }

  .scroll {
    position: absolute;
    top: 50%;
    z-index: 1;
    background: var(--surface);
    transform: translateY(-50%);
  }

  .scroll:hover {
    transform: translateY(-50%);
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
    gap: var(--space-2);
    min-height: var(--size-target);
    padding: 0 var(--space-3);
    border-radius: var(--radius-md);
    color: var(--ink);
    font: var(--type-body-sm);
    text-decoration: none;
    white-space: nowrap;
    transition: background-color 0.15s;
  }

  .chips a:hover {
    background: var(--hover);
  }

  /* Where you are: the current section's chip is bold, with a bar under it in its own colour. */
  .chips a[aria-current] {
    box-shadow: inset 0 calc(-1 * var(--space-1)) 0 var(--swatch, var(--accent-fill));
    font-weight: 700;
  }

  /* Each label keeps room for its bold self (an invisible bold copy sets the width), so chips
     don't shift as the current one turns bold. */
  .chip-label {
    display: inline-grid;
  }

  .chip-label::after {
    content: attr(data-label) / '';
    height: 0;
    visibility: hidden;
    font-weight: 700;
    user-select: none;
    pointer-events: none;
  }

  .chip-label,
  .chip-label::after {
    grid-area: 1 / 1;
  }

  .chip-icon {
    display: inline-flex;
    color: var(--swatch);
    transition: transform 0.2s cubic-bezier(0.3, 1.6, 0.6, 1);
  }

  /* Section icons give a little nudge under the pointer. */
  .chips a:hover .chip-icon {
    transform: translateY(-2px) rotate(-8deg);
  }

  .name {
    padding-bottom: var(--space-2);
    font: var(--type-label);
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

    /* The search fills the row, leaving room for the coin beside it when it's there. */
    .search {
      flex: 1 1 0;
      min-width: 0;
    }

    .search input {
      flex: 1;
      width: 100%;
      min-width: var(--size-target);
    }

    .chips-wrap {
      flex: 1 1 100%;
    }
  }
</style>
