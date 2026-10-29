<script lang="ts">
  import { faCheck } from '@fortawesome/free-solid-svg-icons';
  import { axes } from '../model/axes';
  import { compassAxes, compassPoint, quadrants } from '../model/compass';
  import { countries } from '../model/countries';
  import { scoreAxes, type AxisScore } from '../model/engine';
  import { examples } from '../model/examples';
  import Icon from './Icon.svelte';

  let { scores }: { scores: AxisScore[] } = $props();

  type Mode = 'examples' | 'countries' | 'none';
  let mode = $state<Mode>('examples');

  const half = 140; // half the plot's width, in SVG units
  const scale = half / 100;
  const label = (id: string) => axes.find((a) => a.id === id)!.label;

  const refs = {
    examples: examples.map((e) => ({ name: e.title.replace(/-style\b/, ''), ...compassPoint(scoreAxes(e.country)) })),
    countries: countries.map((c) => ({ name: c.name, ...compassPoint(scoreAxes(c.country)) })),
    none: [],
  };

  const here = $derived(compassPoint(scores));

  const corners = [
    { name: quadrants.topLeft, x: -half + 6, y: -half + 14, anchor: 'start', swatch: '#bf1e2e' },
    { name: quadrants.topRight, x: half - 6, y: -half + 14, anchor: 'end', swatch: '#f7941d' },
    { name: quadrants.bottomLeft, x: -half + 6, y: half - 8, anchor: 'start', swatch: '#3ab54a' },
    { name: quadrants.bottomRight, x: half - 6, y: half - 8, anchor: 'end', swatch: '#2698d4' },
  ] as const;

  interface Placed {
    name: string;
    cx: number;
    cy: number;
    text?: { x: number; y: number; anchor: 'start' | 'end' | 'middle' };
  }

  // Put each reference's label beside its dot where it fits; skip it where it would overlap.
  const placed = $derived.by((): Placed[] => {
    const boxes: [number, number, number, number][] = [
      [here.x * scale - 9, -here.y * scale - 9, 18, 18],
      // The quadrant names in the corners, swatch included.
      ...corners.map((c): [number, number, number, number] => {
        const w = c.name.length * 5.2 + 14;
        return [c.anchor === 'start' ? c.x : c.x - w, c.y - 9, w, 12];
      }),
    ];
    const overlaps = (b: [number, number, number, number]) =>
      b[0] < -half || b[0] + b[2] > half || b[1] < -half || b[1] + b[3] > half ||
      boxes.some((o) => b[0] < o[0] + o[2] && b[0] + b[2] > o[0] && b[1] < o[1] + o[3] && b[1] + b[3] > o[1]);
    const points = refs[mode].map((r) => ({ name: r.name, cx: r.x * scale, cy: -r.y * scale }));
    for (const p of points) boxes.push([p.cx - 3, p.cy - 3, 6, 6]);
    return points.map((p) => {
      const w = p.name.length * 5.4;
      const h = 11;
      const options = [
        { box: [p.cx + 6, p.cy - h / 2, w, h], text: { x: p.cx + 6, y: p.cy, anchor: 'start' } },
        { box: [p.cx - 6 - w, p.cy - h / 2, w, h], text: { x: p.cx - 6, y: p.cy, anchor: 'end' } },
        { box: [p.cx - w / 2, p.cy - 6 - h, w, h], text: { x: p.cx, y: p.cy - 6 - h / 2, anchor: 'middle' } },
        { box: [p.cx - w / 2, p.cy + 6, w, h], text: { x: p.cx, y: p.cy + 6 + h / 2, anchor: 'middle' } },
      ] as const;
      const fit = options.find((o) => !overlaps([...o.box]));
      if (!fit) return p;
      boxes.push([...fit.box]);
      return { ...p, text: { ...fit.text } };
    });
  });

  const fmt = (n: number) => (n > 0 ? `+${n}` : String(n));
</script>

<div class="modes" role="radiogroup" aria-label="Reference points">
  {#each [['examples', 'Examples'], ['countries', 'Real countries'], ['none', 'None']] as [value, text] (value)}
    <label class="pill mode">
      <input type="radio" name="compass-mode" {value} bind:group={mode} />
      <span class="check"><Icon icon={faCheck} /></span>
      <span>{text}</span>
    </label>
  {/each}
</div>

<svg
  viewBox="-178 -166 356 332"
  role="img"
  aria-label="Compass: {fmt(here.x)} from {compassAxes.x.low.toLowerCase()} to {compassAxes.x.high.toLowerCase()}, {fmt(here.y)} from {compassAxes.y.low.toLowerCase()} to {compassAxes.y.high.toLowerCase()}"
>
  <rect class="plot" x={-half} y={-half} width={half * 2} height={half * 2} rx="4" />
  {#each [-80, -60, -40, -20, 20, 40, 60, 80] as g (g)}
    <line class="grid" x1={g * scale} y1={-half} x2={g * scale} y2={half} />
    <line class="grid" x1={-half} y1={g * scale} x2={half} y2={g * scale} />
  {/each}
  <line class="axis" x1="0" y1={-half} x2="0" y2={half} />
  <line class="axis" x1={-half} y1="0" x2={half} y2="0" />

  {#each corners as c (c.name)}
    <rect
      class="swatch"
      x={c.anchor === 'start' ? c.x : c.x - 8}
      y={c.y - 7}
      width="8"
      height="8"
      rx="1.5"
      fill={c.swatch}
    />
    <text class="corner" x={c.anchor === 'start' ? c.x + 12 : c.x - 12} y={c.y} text-anchor={c.anchor}>{c.name}</text>
  {/each}

  {#each placed as p (p.name)}
    <circle class="ref" cx={p.cx} cy={p.cy} r="3"><title>{p.name}</title></circle>
    {#if p.text}
      <text class="ref-label" x={p.text.x} y={p.text.y} text-anchor={p.text.anchor} dominant-baseline="middle">{p.name}</text>
    {/if}
  {/each}

  <circle class="here-ring" cx={here.x * scale} cy={-here.y * scale} r="9" />
  <circle class="here" cx={here.x * scale} cy={-here.y * scale} r="6"><title>Your country</title></circle>

  <text class="end" x="0" y={-half - 10} text-anchor="middle">{compassAxes.y.high}</text>
  <text class="end" x="0" y={half + 18} text-anchor="middle">{compassAxes.y.low}</text>
  <text class="end" x={-half - 10} y="0" text-anchor="middle" transform="rotate(-90 {-half - 10} 0)">{compassAxes.x.low}</text>
  <text class="end" x={half + 10} y="0" text-anchor="middle" transform="rotate(90 {half + 10} 0)">{compassAxes.x.high}</text>
</svg>

<dl class="explain">
  <div>
    <dt>Across: {fmt(here.x)}</dt>
    <dd>
      {compassAxes.x.low} to {compassAxes.x.high.toLowerCase()}, from
      {compassAxes.x.from.map((f) => `${label(f.axis)}${f.reversed ? ' (reversed)' : ''}`).join(' and ')}.
      Economic left and right come with the economy settings.
    </dd>
  </div>
  <div>
    <dt>Up: {fmt(here.y)}</dt>
    <dd>
      {compassAxes.y.low} to {compassAxes.y.high.toLowerCase()}, from
      {compassAxes.y.from.map((f) => label(f.axis)).join(', ').replace(/, ([^,]*)$/, ' and $1')}, all reversed.
    </dd>
  </div>
</dl>

<style>
  .modes {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .mode {
    padding: 3px 10px;
    font-size: 13px;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .plot {
    fill: var(--surface);
    stroke: var(--line-strong);
    stroke-width: 1;
  }

  .grid {
    stroke: var(--line);
    stroke-width: 0.8;
  }

  .axis {
    stroke: var(--line-strong);
    stroke-width: 1.2;
  }

  .corner {
    fill: var(--ink-muted);
    font-size: 9.5px;
  }

  .ref {
    fill: var(--ink-muted);
  }

  .ref-label {
    fill: var(--ink-muted);
    font-size: 9px;
  }

  .here-ring {
    fill: var(--surface);
    stroke: var(--accent-fill);
    stroke-width: 2;
  }

  .here {
    fill: var(--accent-fill);
  }

  .end {
    fill: var(--ink);
    font-size: 13px;
    font-weight: 700;
  }

  .explain {
    margin: var(--space-2) 0 0;
    font-size: 13px;
    color: var(--ink-muted);
  }

  .explain div + div {
    margin-top: var(--space-1);
  }

  dt {
    display: inline;
    font-weight: 700;
    color: var(--ink);
  }

  dt::after {
    content: ' ';
  }

  dd {
    display: inline;
    margin: 0;
  }
</style>
