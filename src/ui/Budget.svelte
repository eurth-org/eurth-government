<script lang="ts">
  import { faChartPie, faChartSimple, faCheck, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
  import { setShare, withBudget } from '../model/budget';
  import { defaultCountry } from '../model/engine';
  import { budgetIds, settings, type BudgetId, type Country, type SettingId } from '../model/settings';
  import type { ShareSettingDef } from '../model/types';
  import Icon from './Icon.svelte';
  import Download from './Download.svelte';
  import { budgetStyle } from './icons';

  let {
    country,
    flashing,
    hits = [],
    currentHit,
    name,
    onchange,
  }: {
    country: Country;
    flashing: SettingId[];
    /** Search matches, highlighted until the search is cleared. */
    hits?: SettingId[];
    currentHit?: SettingId;
    name: string;
    onchange: (country: Country) => void;
  } = $props();

  const lines = budgetIds.map((id) => ({
    id,
    def: settings.find((s) => s.id === id) as ShareSettingDef,
    ...budgetStyle[id],
  }));

  const summary = $derived(lines.map((l) => `${l.def.label} ${country[l.id]}%`).join(', '));

  // The chart: a bar or a pie, each part showing its area and share on hover.
  let chart = $state<'bar' | 'pie'>('bar');
  let svg = $state<SVGSVGElement>();
  let tip = $state<{ text: string; x: number; y: number } | null>(null);
  let wrapper: HTMLDivElement;

  const parts = $derived.by(() => {
    let start = 0;
    return lines.map((line) => {
      const share = country[line.id];
      const part = { ...line, share, start };
      start += share;
      return part;
    });
  });

  function show(event: PointerEvent, label: string, share: number) {
    const box = wrapper.getBoundingClientRect();
    tip = { text: `${label}: ${share}%`, x: event.clientX - box.left, y: event.clientY - box.top };
  }

  /** A pie slice from `start` to `end` percent, as a ring between radii r1 and r2. */
  function slice(start: number, end: number, r1 = 52, r2 = 100): string {
    if (end - start >= 100) end = start + 99.999;
    const at = (p: number, r: number) => {
      const a = (p / 100) * Math.PI * 2 - Math.PI / 2;
      return `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
    };
    const large = end - start > 50 ? 1 : 0;
    return `M ${at(start, r2)} A ${r2} ${r2} 0 ${large} 1 ${at(end, r2)} L ${at(end, r1)} A ${r1} ${r1} 0 ${large} 0 ${at(start, r1)} Z`;
  }

  function set(id: BudgetId, value: number) {
    onchange(setShare(country, id, value));
  }

  function reset() {
    const fresh = defaultCountry();
    onchange(withBudget(country, Object.fromEntries(budgetIds.map((b) => [b, fresh[b]]))));
  }
</script>

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
</div>

<div class="chart" bind:this={wrapper} role="presentation" onpointerleave={() => (tip = null)}>
  {#if chart === 'bar'}
    <svg bind:this={svg} class="bar" viewBox="0 0 400 28" preserveAspectRatio="none" role="img" aria-label="Budget: {summary}">
      {#each parts as part (part.id)}
        {#if part.share > 0}
          <rect
            x={part.start * 4}
            y="0"
            width={part.share * 4}
            height="28"
            fill={part.colour}
            role="presentation"
            onpointermove={(e) => show(e, part.def.label, part.share)}
          ><title>{part.def.label}: {part.share}%</title></rect>
        {/if}
      {/each}
    </svg>
  {:else}
    <svg bind:this={svg} class="pie" viewBox="-110 -110 220 220" role="img" aria-label="Budget: {summary}">
      {#each parts as part (part.id)}
        {#if part.share > 0}
          <path
            d={slice(part.start, part.start + part.share)}
            fill={part.colour}
            role="presentation"
            onpointermove={(e) => show(e, part.def.label, part.share)}
          ><title>{part.def.label}: {part.share}%</title></path>
        {/if}
      {/each}
      <text class="centre" x="0" y="0" text-anchor="middle" dominant-baseline="middle">100%</text>
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

<button class="btn" onclick={reset}><Icon icon={faRotateLeft} /> Reset budget</button>

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

  svg {
    display: block;
    width: 100%;
  }

  svg.bar {
    height: 28px;
    border-radius: var(--radius-control);
  }

  svg.pie {
    max-width: 260px;
    height: auto;
    margin: 0 auto;
  }

  rect,
  path {
    stroke: var(--surface-raised);
    stroke-width: 1;
    cursor: crosshair;
    transition: opacity 0.15s;
  }

  rect:hover,
  path:hover {
    opacity: 0.8;
  }

  .centre {
    fill: var(--ink);
    font-size: 18px;
    font-weight: 700;
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

    rect,
    path {
      transition: none;
    }
  }
</style>
