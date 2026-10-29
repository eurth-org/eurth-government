<script lang="ts">
  import {
    faChartPie,
    faChartSimple,
    faCheck,
    faClockRotateLeft,
    faRotateLeft,
    faTableCellsLarge,
  } from '@fortawesome/free-solid-svg-icons';
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';
  import { setShare, withBudget } from '../model/budget';
  import { defaultCountry } from '../model/engine';
  import { budgetIds, settings, type BudgetId, type Country, type SettingId } from '../model/settings';
  import type { ShareSettingDef } from '../model/types';
  import Download from './Download.svelte';
  import { niceWatcher } from './fun';
  import Icon from './Icon.svelte';
  import { budgetStyle } from './icons';
  import { treemap } from './treemap';

  let {
    country,
    baseline,
    flashing,
    hits = [],
    currentHit,
    name,
    onchange,
  }: {
    country: Country;
    /** The budget the country started with (loaded, picked or rolled), to restore. */
    baseline: Country;
    flashing: SettingId[];
    /** Search matches, highlighted until the search is cleared. */
    hits?: SettingId[];
    currentHit?: SettingId;
    name: string;
    onchange: (country: Country) => void;
  } = $props();

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fresh = defaultCountry();

  const lines = budgetIds.map((id) => {
    const style = budgetStyle[id];
    const [w, h, , , d] = style.icon.icon;
    return {
      id,
      def: settings.find((s) => s.id === id) as ShareSettingDef,
      ...style,
      // The icon as SVG, so the legend inside the chart (and its downloads) can draw it.
      glyph: { box: `0 0 ${w} ${h}`, d: Array.isArray(d) ? d.join(' ') : d },
    };
  });

  const summary = $derived(lines.map((l) => `${l.def.label} ${country[l.id]}%`).join(', '));

  // The charts glide to new shares instead of jumping.
  const shares = Tween.of(() => budgetIds.map((id) => country[id]), { duration: calm ? 0 : 350, easing: cubicOut });

  // The chart: a bar, a pie or a treemap, each part showing its area and share on hover, with
  // a legend inside the picture so a download explains itself.
  let chart = $state<'bar' | 'pie' | 'treemap'>('bar');
  let svg = $state<SVGSVGElement>();
  let tip = $state<{ text: string; x: number; y: number } | null>(null);
  let wrapper: HTMLDivElement;

  const parts = $derived.by(() => {
    let start = 0;
    return lines.map((line, i) => {
      const share = shares.current[i] ?? 0;
      // Each pie slice lifts out along its middle when pointed at.
      const middle = ((start + share / 2) / 100) * Math.PI * 2 - Math.PI / 2;
      const part = { ...line, share, exact: country[line.id], start, dx: Math.cos(middle) * 6, dy: Math.sin(middle) * 6 };
      start += share;
      return part;
    });
  });

  const tiles = $derived(treemap(parts, (p) => p.share, 0, 0, 440, 220));

  function show(event: PointerEvent, label: string, share: number) {
    const box = wrapper.getBoundingClientRect();
    tip = { text: `${label}: ${share}%`, x: event.clientX - box.left, y: event.clientY - box.top };
  }

  /** A pie slice from `start` to `end` percent, as a ring between radii r1 and r2. */
  function slice(start: number, end: number, r1 = 52, r2 = 100): string {
    if (end - start >= 100) end = start + 99.999;
    const at = (p: number, r: number) => {
      const a = (p / 100) * Math.PI * 2 - Math.PI / 2;
      return `${(110 + Math.cos(a) * r).toFixed(2)} ${(110 + Math.sin(a) * r).toFixed(2)}`;
    };
    const large = end - start > 50 ? 1 : 0;
    return `M ${at(start, r2)} A ${r2} ${r2} 0 ${large} 1 ${at(end, r2)} L ${at(end, r1)} A ${r1} ${r1} 0 ${large} 0 ${at(start, r1)} Z`;
  }

  function set(id: BudgetId, value: number) {
    onchange(setShare(country, id, value));
  }

  const budgetOf = (c: Country) => Object.fromEntries(budgetIds.map((b) => [b, c[b]]));
  const same = (c: Country) => budgetIds.every((b) => c[b] === country[b]);
  const baselineIsDefault = $derived(budgetIds.every((b) => baseline[b] === fresh[b]));

  // "Nice." when a share settles on 69%.
  const watchers = Object.fromEntries(budgetIds.map((id) => [id, niceWatcher()]));
  $effect(() => {
    for (const id of budgetIds) watchers[id]!(country[id], () => document.getElementById(`share-${id}`));
  });
</script>

{#snippet legend(x: number, y: number, columns: number, width: number)}
  {@const rows = Math.ceil(lines.length / columns)}
  {#each parts as part, i (part.id)}
    <g class="key" transform="translate({x + Math.floor(i / rows) * (width + 20)} {y + (i % rows) * 19})">
      <svg x="0" y="-7" width="14" height="14" viewBox={part.glyph.box}><path d={part.glyph.d} fill={part.colour} /></svg>
      <text class="key-label" x="20" y="0">{part.def.label}</text>
      <text class="key-share" x={width} y="0">{part.exact}%</text>
    </g>
  {/each}
{/snippet}

<p class="intro">
  Each area's share of all government spending. Move one and the others make room, so the total stays at 100%.
</p>

<div class="chart-modes" role="radiogroup" aria-label="Chart">
  <label class="pill mode">
    <input type="radio" name="budget-chart" value="bar" bind:group={chart} />
    <span class="check"><Icon icon={faCheck} /></span>
    <Icon icon={faChartSimple} /> Bar
  </label>
  <label class="pill mode">
    <input type="radio" name="budget-chart" value="pie" bind:group={chart} />
    <span class="check"><Icon icon={faCheck} /></span>
    <Icon icon={faChartPie} /> Pie
  </label>
  <label class="pill mode">
    <input type="radio" name="budget-chart" value="treemap" bind:group={chart} />
    <span class="check"><Icon icon={faCheck} /></span>
    <Icon icon={faTableCellsLarge} /> Treemap
  </label>
</div>

<div class="chart" bind:this={wrapper} role="presentation" onpointerleave={() => (tip = null)}>
  {#if chart === 'bar'}
    <svg bind:this={svg} viewBox="0 0 440 136" role="img" aria-label="Budget: {summary}">
      <clipPath id="budget-bar"><rect width="440" height="32" rx="6" /></clipPath>
      <g clip-path="url(#budget-bar)">
        {#each parts as part (part.id)}
          {#if part.share > 0}
            <rect
              class="part"
              x={part.start * 4.4}
              y="0"
              width={part.share * 4.4}
              height="32"
              fill={part.colour}
              role="presentation"
              onpointermove={(e) => show(e, part.def.label, part.exact)}
            ><title>{part.def.label}: {part.exact}%</title></rect>
          {/if}
        {/each}
      </g>
      {@render legend(0, 52, 2, 200)}
    </svg>
  {:else if chart === 'pie'}
    <svg bind:this={svg} viewBox="0 0 440 220" role="img" aria-label="Budget: {summary}">
      {#each parts as part (part.id)}
        {#if part.share > 0}
          <path
            class="part slice"
            d={slice(part.start, part.start + part.share)}
            fill={part.colour}
            style:--dx="{part.dx}px"
            style:--dy="{part.dy}px"
            role="presentation"
            onpointermove={(e) => show(e, part.def.label, part.exact)}
          ><title>{part.def.label}: {part.exact}%</title></path>
        {/if}
      {/each}
      <text class="centre" x="110" y="110">100%</text>
      {@render legend(240, 25, 1, 200)}
    </svg>
  {:else}
    <svg bind:this={svg} viewBox="0 0 440 324" role="img" aria-label="Budget: {summary}">
      {#each tiles as tile (tile.item.id)}
        {@const part = tile.item}
        <g
          class="part tile"
          role="presentation"
          onpointermove={(e) => show(e, part.def.label, part.exact)}
        >
          <rect x={tile.x} y={tile.y} width={tile.w} height={tile.h} fill={part.colour}
            ><title>{part.def.label}: {part.exact}%</title></rect
          >
          {#if tile.w >= 44 && tile.h >= 40}
            <svg x={tile.x + 7} y={tile.y + 7} width="14" height="14" viewBox={part.glyph.box}>
              <path d={part.glyph.d} class="tile-glyph" />
            </svg>
            <text class="tile-share" x={tile.x + 7} y={tile.y + 32}>{part.exact}%</text>
            {#if tile.w >= 104 && tile.h >= 56}
              <text class="tile-label" x={tile.x + 7} y={tile.y + 48}>{part.def.label}</text>
            {/if}
          {/if}
        </g>
      {/each}
      {@render legend(0, 240, 2, 200)}
    </svg>
  {/if}
  {#if tip}
    <div class="tip" style:left="{tip.x}px" style:top="{tip.y}px" aria-hidden="true">{tip.text}</div>
  {/if}
</div>
<Download svg={() => svg} name="{name} budget" />

<ul class="lines">
  {#each lines as line (line.id)}
    <li
      class="line"
      class:flash={flashing.includes(line.id)}
      class:matched={hits.includes(line.id)}
      class:current={currentHit === line.id}
      id="field-{line.id}"
    >
      <span class="icon" style:color={line.colour}><Icon icon={line.icon} /></span>
      <label for="share-{line.id}">{line.def.label}</label>
      <output for="share-{line.id}">{country[line.id]}%</output>
      <input
        id="share-{line.id}"
        class="range"
        style:--fill="{country[line.id]}%"
        type="range"
        min="0"
        max="100"
        value={country[line.id]}
        aria-describedby="help-{line.id}"
        oninput={(e) => set(line.id, Number(e.currentTarget.value))}
      />
      <p class="help" id="help-{line.id}">{line.def.help}</p>
    </li>
  {/each}
</ul>

<div class="budget-actions">
  <button
    class="btn"
    data-click="spin-back"
    disabled={same(baseline)}
    title="Back to the budget this country started with"
    onclick={() => onchange(withBudget(country, budgetOf(baseline)))}
  >
    <Icon icon={faClockRotateLeft} /> Restore budget
  </button>
  {#if !baselineIsDefault}
    <button
      class="btn"
      data-click="spin-back"
      disabled={same(fresh)}
      title="Governmint's default shares"
      onclick={() => onchange(withBudget(country, budgetOf(fresh)))}
    >
      <Icon icon={faRotateLeft} /> Default budget
    </button>
  {/if}
</div>

<style>
  .intro {
    margin: 0 0 var(--space-3);
    color: var(--ink-muted);
    font-size: 13px;
  }

  .chart-modes {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .mode {
    padding: 3px 10px;
    font-size: 13px;
  }

  .chart {
    position: relative;
  }

  .chart > svg {
    display: block;
    width: 100%;
    max-width: 540px;
    height: auto;
    margin: 0 auto;
    overflow: visible;
  }

  rect.part,
  path.part,
  .tile rect {
    stroke: var(--surface-raised);
    stroke-width: 1;
  }

  .part {
    cursor: crosshair;
    transition: opacity 0.15s;
  }

  .part:hover {
    opacity: 0.85;
  }

  @media (prefers-reduced-motion: no-preference) {
    .slice {
      transition:
        opacity 0.15s,
        transform 0.2s cubic-bezier(0.3, 1.4, 0.6, 1);
    }

    .slice:hover {
      transform: translate(var(--dx), var(--dy));
    }
  }

  .centre {
    fill: var(--ink);
    font-size: 18px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .key text {
    fill: var(--ink);
    font-size: 13px;
    dominant-baseline: middle;
  }

  .key .key-share {
    font-weight: 700;
    text-anchor: end;
  }

  /* Labels on the treemap's tiles: white, with a dark edge so they read on every colour. */
  .tile-share,
  .tile-label {
    fill: #ffffff;
    stroke: rgb(0 0 0 / 0.45);
    stroke-width: 3px;
    stroke-linejoin: round;
    paint-order: stroke;
    pointer-events: none;
  }

  .tile-share {
    font-size: 15px;
    font-weight: 700;
  }

  .tile-label {
    font-size: 12px;
    font-weight: 600;
  }

  .tile-glyph {
    fill: #ffffff;
  }

  .budget-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .budget-actions .btn:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .tip {
    position: absolute;
    transform: translate(-50%, calc(-100% - 10px));
    padding: 3px 8px;
    border-radius: var(--radius-control);
    background: var(--ink);
    color: var(--surface);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
  }

  .lines {
    margin: var(--space-3) 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }

  .line {
    display: grid;
    grid-template-columns: 22px 1fr auto;
    grid-template-areas:
      'icon label value'
      'icon slider slider'
      'icon help help';
    column-gap: var(--space-2);
    margin: 0 calc(-1 * var(--space-2));
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-control);
  }

  .icon {
    grid-area: icon;
    padding-top: 2px;
    font-size: 16px;
  }

  label {
    grid-area: label;
    font-weight: 600;
  }

  output {
    grid-area: value;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  .range {
    grid-area: slider;
  }

  .help {
    grid-area: help;
    margin: 0;
    color: var(--ink-muted);
    font-size: 13px;
  }

  .matched {
    background: var(--flash);
  }

  .current {
    background: var(--flash);
    box-shadow: 0 0 0 2px var(--focus-ring);
  }

  .flash {
    animation: flash 0.7s ease-in-out 4 alternate;
  }

  @keyframes flash {
    from {
      background: transparent;
      box-shadow: none;
    }
    to {
      background: var(--flash);
      box-shadow: 0 0 0 2px var(--focus-ring);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .flash {
      animation: none;
      background: var(--flash);
      box-shadow: 0 0 0 2px var(--focus-ring);
    }

    .part {
      transition: none;
    }
  }
</style>
