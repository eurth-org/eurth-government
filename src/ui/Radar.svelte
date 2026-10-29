<script lang="ts">
  import { faSpider } from '@fortawesome/free-solid-svg-icons';
  import { fade } from 'svelte/transition';
  import { axes } from '../model/axes';
  import type { AxisScore } from '../model/engine';
  import Download from './Download.svelte';

  // The scales as a web: the further out, the higher the score. Pointing at a spoke's outer end
  // shows its score; crossing the edge of the blue shape makes it wobble; and now and then a
  // tiny spider comes out to follow the pointer.
  let { scores, name }: { scores: AxisScore[]; name: string } = $props();

  const radius = 100;
  const count = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;
  const point = (i: number, r: number) => [Math.cos(angle(i)) * r, Math.sin(angle(i)) * r] as const;
  const ring = (r: number) => axes.map((_, i) => point(i, r).join(',')).join(' ');
  const shape = $derived(scores.map((s, i) => point(i, (s.score / 100) * radius).join(',')).join(' '));
  const summary = $derived(scores.map((s) => `${axes.find((a) => a.id === s.axis)!.label} ${s.score}`).join(', '));
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let svg = $state<SVGSVGElement>();
  let blob = $state<SVGGElement>();
  let hovered = $state<number | null>(null);

  /** A jelly wobble of the blue shape, each time the pointer crosses its edge. */
  function wobble() {
    if (calm || !blob) return;
    blob.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.06, 0.95)' },
        { transform: 'scale(0.97, 1.04)' },
        { transform: 'scale(1.02, 0.99)' },
        { transform: 'scale(1)' },
      ],
      { duration: 550, easing: 'ease-out' },
    );
  }

  // The spider: about one visit in three, it drops in from the top of the web and crawls after
  // the pointer at its own pace, on a thread from the centre. It leaves when the pointer does.
  const [spiderWidth, , , , spiderPath] = faSpider.icon;
  let spider = $state<{ x: number; y: number; turn: number } | null>(null);
  let target = { x: 0, y: 0 };
  let frame = 0;

  function toChart(event: PointerEvent): { x: number; y: number } {
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return target;
    const p = svg.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    const local = p.matrixTransform(matrix.inverse());
    return { x: local.x, y: local.y };
  }

  function arrive(event: PointerEvent) {
    if (calm || spider || Math.random() > 0.35) return;
    target = toChart(event);
    spider = { x: 0, y: -radius, turn: 180 };
    crawl();
  }

  function crawl() {
    frame = requestAnimationFrame(() => {
      if (!spider) return;
      const dx = target.x - spider.x;
      const dy = target.y - spider.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0.5) {
        const step = Math.min(distance, 1.6);
        spider = {
          x: spider.x + (dx / distance) * step,
          y: spider.y + (dy / distance) * step,
          turn: (Math.atan2(dy, dx) * 180) / Math.PI + 90,
        };
      }
      crawl();
    });
  }

  function leave() {
    cancelAnimationFrame(frame);
    spider = null;
    hovered = null;
  }

  function anchor(i: number): 'start' | 'middle' | 'end' {
    const x = Math.cos(angle(i));
    return Math.abs(x) < 0.2 ? 'middle' : x > 0 ? 'start' : 'end';
  }
</script>

<p class="intro">
  Each spoke is one scale, from 0% at the centre to 100% at the rim, so the shape shows all {count} at once. Point at a
  spoke's end for its score.
</p>

<svg
  bind:this={svg}
  viewBox="-200 -135 400 270"
  role="img"
  aria-label="Spider chart: {summary}"
  onpointerenter={arrive}
  onpointermove={(e) => spider && (target = toChart(e))}
  onpointerleave={leave}
>
  <g class="web">
    {#each [25, 50, 75, 100] as r (r)}
      <polygon class="ring" points={ring(r)} />
    {/each}
    {#each axes as _, i (i)}
      {@const [x, y] = point(i, radius)}
      <line class="spoke" class:active={hovered === i} x1="0" y1="0" x2={x} y2={y} />
    {/each}
  </g>
  <g class="blob" bind:this={blob}>
    <polygon class="shape" points={shape} role="presentation" onpointerenter={wobble} onpointerleave={wobble} />
    {#each scores as s, i (s.axis)}
      {@const [x, y] = point(i, (s.score / 100) * radius)}
      <circle class="dot" cx={x} cy={y} r={hovered === i ? 5 : 3.5} />
    {/each}
  </g>
  {#each axes as axis, i (axis.id)}
    {@const [x, y] = point(i, radius + 12)}
    <text x={x} y={y} text-anchor={anchor(i)} dominant-baseline="middle" class:active={hovered === i}>
      {axis.label}{hovered === i ? ` ${scores[i]?.score}` : ''}
    </text>
  {/each}
  {#each axes as axis, i (axis.id)}
    {@const [x, y] = point(i, radius)}
    <circle
      class="hit"
      cx={x}
      cy={y}
      r="18"
      role="presentation"
      onpointerenter={() => (hovered = i)}
      onpointerleave={() => (hovered = null)}
    />
  {/each}
  {#if spider}
    <g class="spider" transition:fade={{ duration: 250 }}>
      <line class="thread" x1="0" y1={-radius} x2={spider.x} y2={spider.y} />
      <g transform="translate({spider.x} {spider.y}) rotate({spider.turn})">
        <path d={String(spiderPath)} transform="scale({14 / spiderWidth}) translate({-spiderWidth / 2} -256)" />
      </g>
    </g>
  {/if}
</svg>

<Download svg={() => svg} name="{name} shape" />

<style>
  .intro {
    margin: calc(-1 * var(--space-2)) 0 var(--space-2);
    color: var(--ink-muted);
    font-size: 13px;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .ring,
  .spoke {
    fill: none;
    stroke: var(--line-strong);
    stroke-width: 0.6;
    opacity: 0.6;
  }

  .spoke.active {
    stroke: var(--accent-fill);
    stroke-width: 1.6;
    opacity: 1;
  }

  .shape {
    fill: var(--accent-fill);
    fill-opacity: 0.22;
    stroke: var(--accent-fill);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .dot {
    fill: var(--accent-fill);
  }

  text {
    fill: var(--ink-muted);
    font-size: 11px;
  }

  text.active {
    fill: var(--ink);
    font-weight: 700;
  }

  .hit {
    fill: transparent;
    cursor: crosshair;
  }

  /* The blue shape wobbles around its own middle. */
  .blob {
    transform-box: fill-box;
    transform-origin: center;
  }

  .spider {
    pointer-events: none;
  }

  .spider path {
    fill: var(--ink);
  }

  .thread {
    stroke: var(--ink-muted);
    stroke-width: 0.5;
    stroke-dasharray: 1 1.5;
  }
</style>
