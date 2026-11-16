<script lang="ts">
  import {
    faChartPie,
    faChartSimple,
    faCheck,
    faLock,
    faLockOpen,
    faRotateLeft,
    faTableCellsLarge,
  } from '@fortawesome/free-solid-svg-icons';
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';
  import { setShare, shareRange, withBudget } from '../model/budget';
  import { defaultCountry } from '../model/engine';
  import { budgetJson, budgetMarkdown } from '../model/formats';
  import { budgetIds, settings, type BudgetId, type Country, type SettingId } from '../model/settings';
  import type { ShareSettingDef } from '../model/types';
  import { calm, niceWatcher } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import Line from '@eurth/style/components/Line.svelte';
  import { lineBackupRestore } from '@eurth/style/line';
  import Download from './Download.svelte';
  import { budgetStyle } from './icons';
  import { treemap } from './treemap';

  let {
    country,
    baseline,
    flashing,
    hits = [],
    currentHit,
    name,
    link,
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
    /** The country's link, for the Markdown and JSON downloads. */
    link: string;
    onchange: (country: Country) => void;
  } = $props();

  // The budget as text too: Markdown with a Mermaid pie chart, and JSON.
  const texts = $derived([
    { label: 'Markdown', extension: 'md', type: 'text/markdown', make: () => budgetMarkdown(name, country, link) },
    { label: 'JSON', extension: 'json', type: 'application/json', make: () => budgetJson(name, country, link) },
  ]);

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
  const shares = Tween.of(() => budgetIds.map((id) => country[id]), { duration: calm() ? 0 : 350, easing: cubicOut });

  // The chart: a bar, a pie or a treemap, each part showing its area and share on hover, with
  // a legend inside the picture so a download explains itself. The picture is drawn at the
  // width it's shown at (one unit to the pixel), so its text stays the size the suite sets and
  // never shrinks with the screen: a narrow screen gets a one-column legend instead.
  let chart = $state<'bar' | 'pie' | 'treemap'>('bar');
  let room = $state(540);
  const W = $derived(Math.max(280, Math.min(540, Math.round(room))));
  const columns = $derived(W >= 440 ? 2 : 1);
  const column = $derived(columns === 2 ? (W - 20) / 2 : W);
  const rows = $derived(Math.ceil(lines.length / columns));
  const row = 24;
  // The pie sits beside its legend where there's room, and above it where there isn't.
  const beside = $derived(W >= 440);
  const tilesHeight = $derived(Math.round(W / 2));
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

  // Tiles about twice as wide as tall, so the names fit beside the shares.
  const tiles = $derived(treemap(parts, (p) => p.share, 0, 0, W, tilesHeight, 2));

  /** A tile's name in one line if it fits, else two (split at the middle space), else none. */
  function nameLines(label: string, width: number, height: number): string[] {
    const fits = (text: string) => text.length * 7.4 + 28 <= width;
    if (height >= 62 && fits(label)) return [label];
    const spaces = [...label.matchAll(/ /g)].map((m) => m.index!);
    if (height < 80 || !spaces.length) return [];
    const middle = spaces.reduce((best, i) => (Math.abs(i - label.length / 2) < Math.abs(best - label.length / 2) ? i : best));
    const lines = [label.slice(0, middle), label.slice(middle + 1)];
    return lines.every(fits) ? lines : [];
  }

  function show(event: PointerEvent, label: string, share: number) {
    const box = wrapper.getBoundingClientRect();
    tip = { text: `${label}: ${share}%`, x: event.clientX - box.left, y: event.clientY - box.top };
  }

  /** A pie slice from `start` to `end` percent, as a ring between radii r1 and r2. */
  function slice(start: number, end: number, cx = 110, r1 = 52, r2 = 100): string {
    if (end - start >= 100) end = start + 99.999;
    const at = (p: number, r: number) => {
      const a = (p / 100) * Math.PI * 2 - Math.PI / 2;
      return `${(cx + Math.cos(a) * r).toFixed(2)} ${(110 + Math.sin(a) * r).toFixed(2)}`;
    };
    const large = end - start > 50 ? 1 : 0;
    return `M ${at(start, r2)} A ${r2} ${r2} 0 ${large} 1 ${at(end, r2)} L ${at(end, r1)} A ${r1} ${r1} 0 ${large} 0 ${at(start, r1)} Z`;
  }

  // Locked shares stay put while the others move. Pushing a share past what the locks leave makes
  // its slider angry (a little red, a shake), and the locks in the way light up.
  let locks = $state<BudgetId[]>([]);
  let strained = $state<BudgetId | null>(null);
  let calming: ReturnType<typeof setTimeout> | undefined;
  const strainNote = $derived(
    strained ? `The locked shares leave room for at most ${shareRange(country, strained, locks).max}%.` : '',
  );

  // A new country starts unlocked.
  $effect(() => {
    void baseline;
    locks = [];
  });

  function toggleLock(id: BudgetId) {
    locks = locks.includes(id) ? locks.filter((l) => l !== id) : [...locks, id];
  }

  function set(id: BudgetId, value: number, slider: HTMLInputElement) {
    const { min, max } = shareRange(country, id, locks);
    if (value > max || value < min) {
      strained = id;
      clearTimeout(calming);
      calming = setTimeout(() => (strained = null), 900);
    }
    const next = setShare(country, id, value, locks);
    slider.value = String(next[id]);
    onchange(next);
  }

  function resetTo(c: Country) {
    locks = [];
    onchange(withBudget(country, budgetOf(c)));
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
  {@const perColumn = Math.ceil(lines.length / columns)}
  {#each parts as part, i (part.id)}
    <g class="key" transform="translate({x + Math.floor(i / perColumn) * (width + 20)} {y + (i % perColumn) * row})">
      <rect class="key-swatch" x="0.5" y="-6.5" width="13" height="13" rx="2" style:fill="var(--{part.colour})" />
      <svg x="20" y="-7" width="14" height="14" viewBox={part.glyph.box}><path class="key-icon" d={part.glyph.d} /></svg>
      <text class="key-label" x="40" y="0">{part.def.label}</text>
      <text class="key-share" x={width} y="0">{part.exact}%</text>
    </g>
  {/each}
{/snippet}

<p class="eu-help">
  Each area's share of all government spending. Move one and the others make room, so the total stays at 100%.
</p>

<!-- Chart types on the left; ways back to an earlier budget on the right. Both throw away the
     shares as they stand, so each turns red when pointed at and says what goes (above the
     button, clear of the chart), but only while there is something to throw away. -->
<div class="toolbar">
  <div class="eu-row tight" role="radiogroup" aria-label="Chart">
    <label class="eu-pill">
      <input type="radio" name="budget-chart" value="bar" bind:group={chart} />
      <span class="eu-check"><Icon icon={faCheck} /></span>
      <Icon icon={faChartSimple} /> Bar
    </label>
    <label class="eu-pill">
      <input type="radio" name="budget-chart" value="pie" bind:group={chart} />
      <span class="eu-check"><Icon icon={faCheck} /></span>
      <Icon icon={faChartPie} /> Pie
    </label>
    <label class="eu-pill">
      <input type="radio" name="budget-chart" value="treemap" bind:group={chart} />
      <span class="eu-check"><Icon icon={faCheck} /></span>
      <Icon icon={faTableCellsLarge} /> Treemap
    </label>
  </div>
  <div class="eu-row tight">
    <button
      type="button"
      class="eu-btn"
      class:eu-btn--risky={!same(baseline)}
      data-click="spin"
      disabled={same(baseline)}
      data-tip="Replaces your shares and locks with the budget this country started with"
      data-tip-side="top"
      onclick={() => resetTo(baseline)}
    >
      <Line icon={lineBackupRestore} /> Restore budget
    </button>
    {#if !baselineIsDefault}
      <button
        type="button"
        class="eu-btn"
        class:eu-btn--risky={!same(fresh)}
        data-click="spin"
        disabled={same(fresh)}
        data-tip="Replaces your shares and locks with Governmint's default budget"
        data-tip-side="top"
        onclick={() => resetTo(fresh)}
      >
        <Icon icon={faRotateLeft} /> Default budget
      </button>
    {/if}
  </div>
</div>

<div class="room" bind:clientWidth={room}>
  <div class="chart" bind:this={wrapper} role="presentation" onpointerleave={() => (tip = null)}>
    {#if chart === 'bar'}
      {@const H = 56 + rows * row}
      <svg bind:this={svg} viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label="Budget: {summary}">
        <clipPath id="budget-bar"><rect width={W} height="32" rx="12" /></clipPath>
        <g clip-path="url(#budget-bar)">
          {#each parts as part (part.id)}
            {#if part.share > 0}
              <rect
                class="part"
                x={(part.start * W) / 100}
                y="0"
                width={(part.share * W) / 100}
                height="32"
                style:fill="var(--{part.colour})"
                role="presentation"
                onpointermove={(e) => show(e, part.def.label, part.exact)}
              ><title>{part.def.label}: {part.exact}%</title></rect>
            {/if}
          {/each}
        </g>
        {@render legend(0, 56, columns, column)}
      </svg>
    {:else if chart === 'pie'}
      {@const cx = beside ? 110 : W / 2}
      {@const H = beside ? Math.max(220, 24 + lines.length * row) : 244 + lines.length * row}
      <svg bind:this={svg} viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label="Budget: {summary}">
        {#each parts as part (part.id)}
          {#if part.share > 0}
            <path
              class="part slice"
              d={slice(part.start, part.start + part.share, cx)}
              style:fill="var(--{part.colour})"
              style:--dx="{part.dx}px"
              style:--dy="{part.dy}px"
              role="presentation"
              onpointermove={(e) => show(e, part.def.label, part.exact)}
            ><title>{part.def.label}: {part.exact}%</title></path>
          {/if}
        {/each}
        <text class="centre" x={cx} y="110">100%</text>
        {#if beside}
          {@render legend(240, 20, 1, W - 240)}
        {:else}
          {@render legend(0, 244, 1, W)}
        {/if}
      </svg>
    {:else}
      {@const H = tilesHeight + 24 + rows * row}
      <svg bind:this={svg} viewBox="0 0 {W} {H}" width={W} height={H} role="img" aria-label="Budget: {summary}">
        {#each tiles as tile (tile.item.id)}
          {@const part = tile.item}
          <!-- A tile is its area's colour. Where there's room for words, they sit on a plate in
               the page's own colour, framed by the tile: text never sits on the colour itself. -->
          {@const plate = tile.w >= 40 && tile.h >= 36}
          <g class="part tile" role="presentation" onpointermove={(e) => show(e, part.def.label, part.exact)}>
            <rect x={tile.x + 1} y={tile.y + 1} width={Math.max(0, tile.w - 2)} height={Math.max(0, tile.h - 2)} rx="2" style:fill="var(--{part.colour})"
              ><title>{part.def.label}: {part.exact}%</title></rect
            >
            {#if plate}
              {@const wide = tile.w >= 86}
              <rect class="plate" x={tile.x + 6} y={tile.y + 6} width={tile.w - 12} height={tile.h - 12} rx="2" />
              <svg x={tile.x + 12} y={tile.y + 12} width="15" height="15" viewBox={part.glyph.box}>
                <path class="key-icon" d={part.glyph.d} />
              </svg>
              {#if wide}
                <text class="tile-share" x={tile.x + 34} y={tile.y + 20}>{part.exact}%</text>
                {#each nameLines(part.def.label, tile.w, tile.h) as line, i (i)}
                  <text class="tile-label" x={tile.x + 12} y={tile.y + 44 + i * 18}>{line}</text>
                {/each}
              {:else if tile.h >= 62}
                <text class="tile-share" x={tile.x + 12} y={tile.y + 44}>{part.exact}%</text>
              {/if}
            {/if}
          </g>
        {/each}
        {@render legend(0, tilesHeight + 24, columns, column)}
      </svg>
    {/if}
    {#if tip}
      <div class="tip" style:left="{tip.x}px" style:top="{tip.y}px" aria-hidden="true">{tip.text}</div>
    {/if}
  </div>
</div>
<Download svg={() => svg} name="{name} budget" {texts} />

<ul class="lines">
  {#each lines as line (line.id)}
    {@const locked = locks.includes(line.id)}
    <li
      class="line"
      class:flash={flashing.includes(line.id)}
      class:matched={hits.includes(line.id)}
      class:current={currentHit === line.id}
      class:angry={strained === line.id}
      id="field-{line.id}"
    >
      <span class="mark">
        <span class="eu-swatch" style:--swatch="var(--{line.colour})"></span>
        <span class="mark-icon"><Icon icon={line.icon} /></span>
      </span>
      <label class="eu-label" for="share-{line.id}"><span class="question">{line.def.label}</span></label>
      <output class="eu-data" for="share-{line.id}">{country[line.id]}%</output>
      <input
        id="share-{line.id}"
        class="eu-range"
        style:--fill="{country[line.id]}%"
        type="range"
        min="0"
        max="100"
        value={country[line.id]}
        disabled={locked}
        aria-describedby="help-{line.id}"
        oninput={(e) => set(line.id, Number(e.currentTarget.value), e.currentTarget)}
      />
      <button
        type="button"
        class="eu-btn eu-btn--quiet eu-btn--icon lock"
        class:strain={strained !== null && locked}
        aria-pressed={locked}
        aria-label="{locked ? 'Unlock' : 'Lock'} {line.def.label} at {country[line.id]}%"
        data-tip={locked ? 'Unlock' : `Lock at ${country[line.id]}%`}
        onclick={() => toggleLock(line.id)}
      >
        <Icon icon={locked ? faLock : faLockOpen} />
      </button>
      <p class="eu-help" id="help-{line.id}">{line.def.help}</p>
    </li>
  {/each}
</ul>
<p class="eu-visually-hidden" aria-live="polite">{strainNote}</p>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .tight {
    gap: var(--space-2);
  }

  /* The room the chart has: the chart is drawn to fit it, at one unit to the pixel. */
  .room {
    min-width: 0;
  }

  .chart {
    position: relative;
  }

  .chart > svg {
    display: block;
    max-width: 100%;
    height: auto;
    overflow: visible;
  }

  /* Parts are told apart by a gap in the panel's own colour, as well as by their colours. */
  rect.part,
  path.part,
  .tile > rect:first-child {
    stroke: var(--surface-raised);
    stroke-width: 2;
  }

  .part {
    cursor: crosshair;
  }

  .slice {
    transition: transform 0.2s cubic-bezier(0.3, 1.4, 0.6, 1);
  }

  .slice:hover {
    transform: translate(var(--dx), var(--dy));
  }

  .centre {
    fill: var(--ink);
    font: var(--type-heading);
    text-anchor: middle;
    dominant-baseline: middle;
  }

  /* The legend: a swatch with an edge that shows on any ground, the area's icon and name, and
     its share. */
  .key-swatch {
    stroke: var(--line-strong);
    stroke-width: 1;
  }

  .key-icon {
    fill: var(--ink);
  }

  .key text {
    fill: var(--ink);
    font: var(--type-note);
    dominant-baseline: middle;
  }

  .key .key-share {
    font: var(--type-data);
    font-weight: 700;
    text-anchor: end;
  }

  /* Words on the treemap sit on a plate in the page's colour, inside the tile's own. */
  .plate {
    fill: var(--surface);
  }

  .tile-share,
  .tile-label {
    fill: var(--ink);
    dominant-baseline: middle;
    pointer-events: none;
  }

  .tile-share {
    font: var(--type-label);
  }

  .tile-label {
    font: var(--type-note);
  }

  .tile svg,
  .plate {
    pointer-events: none;
  }

  .tip {
    position: absolute;
    z-index: 2;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    background: var(--ink);
    color: var(--surface);
    font: var(--type-note);
    font-weight: 700;
    white-space: nowrap;
    pointer-events: none;
    transform: translate(-50%, calc(-100% - var(--space-3)));
  }

  .lines {
    display: grid;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .line {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    grid-template-areas:
      'mark label value lock'
      'mark slider slider lock'
      'mark help help help';
    column-gap: var(--space-2);
    align-items: center;
    margin: 0 calc(-1 * var(--space-2));
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-md);
    scroll-margin-top: calc(var(--size-target) + var(--space-8));
  }

  /* The area's colour as a swatch, and its icon: the same pair as in the chart's legend. */
  .mark {
    grid-area: mark;
    align-self: start;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding-top: var(--space-1);
  }

  /* Icons differ in width; their column doesn't. */
  .mark-icon {
    display: inline-flex;
    justify-content: center;
    width: var(--space-5);
  }

  label {
    grid-area: label;
  }

  output {
    grid-area: value;
    font-weight: 700;
  }

  .eu-range {
    grid-area: slider;
  }

  .eu-range:disabled {
    cursor: not-allowed;
  }

  .eu-help {
    grid-area: help;
  }

  /* The lock, to the right of each share. Locked, it is filled (aria-pressed) and its icon closes. */
  .lock {
    grid-area: lock;
    margin-left: var(--space-1);
  }

  /* Too far: the share gets a red edge and shakes, and the locks in the way are ringed. A
     note for screen readers says how much room the locks leave. */
  .angry {
    outline: var(--size-ring) solid var(--danger-text);
    animation: shake 0.3s ease-in-out 2;
  }

  .lock.strain {
    outline: var(--size-ring) solid var(--danger-text);
    outline-offset: var(--size-ring);
  }

  .lock.strain :global(.eu-icon) {
    animation: pop 0.3s ease-out;
  }

  @keyframes pop {
    from {
      transform: scale(0);
    }
  }

  @keyframes shake {
    20% {
      transform: translateX(-3px);
    }
    40% {
      transform: translateX(3px);
    }
    60% {
      transform: translateX(-2px);
    }
    80% {
      transform: translateX(2px);
    }
  }

  /* Search matches and "look here", as on the other settings (Field.svelte). */
  .matched,
  .current {
    outline: 1px dashed var(--line-strong);
  }

  .matched .question,
  .current .question,
  .flash .question {
    background: var(--highlight);
    color: var(--on-highlight);
  }

  .current {
    outline: var(--size-ring) solid var(--ink);
  }

  .flash {
    outline: var(--size-ring) solid var(--ink);
    animation: flash 0.7s ease-in-out 4 alternate;
  }

  @keyframes flash {
    from {
      outline-color: transparent;
    }
  }
</style>
