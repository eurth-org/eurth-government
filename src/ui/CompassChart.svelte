<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';
  import { compassAxes, compassPoint, quadrants } from '../model/compass';
  import { countries } from '../model/countries';
  import { scoreAxes, type AxisScore } from '../model/engine';
  import { examples } from '../model/examples';

  export type Mode = 'examples' | 'countries' | 'none';

  /**
   * The compass itself. `half` is half the plot's width in SVG units: a bigger plot (the
   * enlarged view) has room for more labels at the same text size. Countries that land on the
   * same spot share one dot, sized by how many it holds; pointing at a dot lists them.
   */
  let {
    scores,
    mode,
    half = 140,
    svg = $bindable(),
  }: { scores: AxisScore[]; mode: Mode; half?: number; svg?: SVGSVGElement } = $props();

  const scale = $derived(half / 100);
  const pad = 38;

  const refs = {
    examples: examples.map((e) => ({ name: e.title.replace(/-style\b/, ''), ...compassPoint(scoreAxes(e.country)) })),
    countries: countries.map((c) => ({ name: c.name, ...compassPoint(scoreAxes(c.country)) })),
    none: [] as { name: string; x: number; y: number }[],
  };

  const here = $derived(compassPoint(scores));
  // This country's dot glides to its new place.
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const moving = Tween.of(() => here, { duration: calm ? 0 : 450, easing: cubicOut });

  const corners = $derived([
    { name: quadrants.topLeft, x: -half + 6, y: -half + 14, anchor: 'start', swatch: '#bf1e2e' },
    { name: quadrants.topRight, x: half - 6, y: -half + 14, anchor: 'end', swatch: '#f7941d' },
    { name: quadrants.bottomLeft, x: -half + 6, y: half - 8, anchor: 'start', swatch: '#3ab54a' },
    { name: quadrants.bottomRight, x: half - 6, y: half - 8, anchor: 'end', swatch: '#2698d4' },
  ] as const);

  type Box = [number, number, number, number];

  interface Spot {
    names: string[];
    cx: number;
    cy: number;
    r: number;
    text?: { x: number; y: number; anchor: 'start' | 'end' | 'middle'; value: string };
  }

  // Group countries that land on (nearly) the same spot, then put each group's label beside
  // its dot where it fits, skipping it where it would overlap something.
  const spots = $derived.by((): Spot[] => {
    const groups = new Map<string, { names: string[]; x: number; y: number }>();
    for (const r of refs[mode]) {
      const key = `${Math.round(r.x / 3)}:${Math.round(r.y / 3)}`;
      const group = groups.get(key);
      if (group) group.names.push(r.name);
      else groups.set(key, { names: [r.name], x: r.x, y: r.y });
    }
    const boxes: Box[] = [
      [here.x * scale - 9, -here.y * scale - 9, 18, 18],
      ...corners.map((c): Box => {
        const w = c.name.length * 5.2 + 14;
        return [c.anchor === 'start' ? c.x : c.x - w, c.y - 9, w, 12];
      }),
    ];
    const overlaps = (b: Box) =>
      b[0] < -half || b[0] + b[2] > half || b[1] < -half || b[1] + b[3] > half ||
      boxes.some((o) => b[0] < o[0] + o[2] && b[0] + b[2] > o[0] && b[1] < o[1] + o[3] && b[1] + b[3] > o[1]);
    const dots = [...groups.values()]
      .sort((a, b) => b.names.length - a.names.length)
      .map((g) => ({
        names: g.names,
        cx: g.x * scale,
        cy: -g.y * scale,
        r: g.names.length === 1 ? 3 : Math.min(3 + Math.sqrt(g.names.length) * 1.3, 11),
      }));
    for (const d of dots) boxes.push([d.cx - d.r, d.cy - d.r, d.r * 2, d.r * 2]);
    return dots.map((d) => {
      const value = d.names.length === 1 ? d.names[0]! : `${d.names[0]} +${d.names.length - 1}`;
      const w = value.length * 5.4;
      const h = 11;
      const gap = d.r + 3;
      const options = [
        { box: [d.cx + gap, d.cy - h / 2, w, h], text: { x: d.cx + gap, y: d.cy, anchor: 'start' } },
        { box: [d.cx - gap - w, d.cy - h / 2, w, h], text: { x: d.cx - gap, y: d.cy, anchor: 'end' } },
        { box: [d.cx - w / 2, d.cy - gap - h, w, h], text: { x: d.cx, y: d.cy - gap - h / 2, anchor: 'middle' } },
        { box: [d.cx - w / 2, d.cy + gap, w, h], text: { x: d.cx, y: d.cy + gap + h / 2, anchor: 'middle' } },
      ] as const;
      const fit = options.find((o) => !overlaps([...o.box]));
      if (!fit) return d;
      boxes.push([...fit.box]);
      return { ...d, text: { ...fit.text, value } };
    });
  });

  let wrapper: HTMLDivElement;
  let tip = $state<{ text: string; x: number; y: number } | null>(null);

  function show(event: PointerEvent, names: string[]) {
    const box = wrapper.getBoundingClientRect();
    const shown = names.length > 12 ? `${names.slice(0, 12).join(', ')} and ${names.length - 12} more` : names.join(', ');
    tip = { text: names.length > 1 ? `${names.length}: ${shown}` : shown, x: event.clientX - box.left, y: event.clientY - box.top };
  }

  const fmt = (n: number) => (n > 0 ? `+${n}` : String(n));
</script>

<div class="chart" bind:this={wrapper} role="presentation" onpointerleave={() => (tip = null)}>
  <svg
    bind:this={svg}
    viewBox="{-half - pad} {-half - 26} {(half + pad) * 2} {half * 2 + 52}"
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

    {#each spots as s (s.names[0])}
      <circle
        class="ref"
        class:group={s.names.length > 1}
        cx={s.cx}
        cy={s.cy}
        r={s.r}
        role="presentation"
        onpointerenter={(e) => show(e, s.names)}
        onpointermove={(e) => show(e, s.names)}
      ><title>{s.names.join(', ')}</title></circle>
      {#if s.text}
        <text class="ref-label" x={s.text.x} y={s.text.y} text-anchor={s.text.anchor} dominant-baseline="middle">{s.text.value}</text>
      {/if}
    {/each}

    <circle class="here-ring" cx={moving.current.x * scale} cy={-moving.current.y * scale} r="9" />
    <circle
      class="here"
      cx={moving.current.x * scale}
      cy={-moving.current.y * scale}
      r="6"
      role="presentation"
      onpointerenter={(e) => show(e, ['This country'])}
    ><title>This country</title></circle>

    <!-- Quadrant names last, with a halo, so dots never hide them. -->
    {#each corners as c (c.name)}
      <rect class="swatch" x={c.anchor === 'start' ? c.x : c.x - 8} y={c.y - 7} width="8" height="8" rx="1.5" fill={c.swatch} />
      <text class="corner" x={c.anchor === 'start' ? c.x + 12 : c.x - 12} y={c.y} text-anchor={c.anchor}>{c.name}</text>
    {/each}

    <text class="end" x="0" y={-half - 10} text-anchor="middle">{compassAxes.y.high}</text>
    <text class="end" x="0" y={half + 18} text-anchor="middle">{compassAxes.y.low}</text>
    <text class="end" x={-half - 10} y="0" text-anchor="middle" transform="rotate(-90 {-half - 10} 0)">{compassAxes.x.low}</text>
    <text class="end" x={half + 10} y="0" text-anchor="middle" transform="rotate(90 {half + 10} 0)">{compassAxes.x.high}</text>
  </svg>
  {#if tip}
    <div class="tip" style:left="{tip.x}px" style:top="{tip.y}px" aria-hidden="true">{tip.text}</div>
  {/if}
</div>

<style>
  .chart {
    position: relative;
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
    paint-order: stroke;
    stroke: var(--surface);
    stroke-width: 3px;
    stroke-linejoin: round;
  }

  .ref {
    fill: var(--ink-muted);
    cursor: crosshair;
  }

  .ref.group {
    fill-opacity: 0.75;
    stroke: var(--surface);
    stroke-width: 1;
  }

  .ref:hover {
    fill: var(--ink);
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

  .tip {
    position: absolute;
    max-width: 280px;
    transform: translate(-50%, calc(-100% - 12px));
    padding: 4px 8px;
    border-radius: var(--radius-control);
    background: var(--ink);
    color: var(--surface);
    font-size: 13px;
    font-weight: 600;
    pointer-events: none;
  }
</style>
