<script lang="ts">
  import { faSpider } from '@fortawesome/free-solid-svg-icons';
  import { calm } from '@eurth/style';
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { axes } from '../model/axes';
  import type { AxisScore } from '../model/engine';
  import Download from './Download.svelte';

  // The scales as a web: the further out, the higher the score. Pointing at a spoke's outer end
  // shows its score. Each edge of the blue shape is a thread: brush across one and that edge
  // twangs, once. After three twangs a tiny spider comes down to see what's caught in its web.
  let { scores, name }: { scores: AxisScore[]; name: string } = $props();

  const count = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;

  // The chart is drawn at the width it's shown at (one unit to the pixel), so its labels stay
  // the size the suite sets and never shrink with the screen: where there's less room, the web
  // gets smaller and the words stay readable. Long labels take two lines.
  const split = (label: string): string[] => {
    const spaces = [...label.matchAll(/ /g)].map((m) => m.index!);
    if (label.length <= 14 || !spaces.length) return [label];
    const middle = spaces.reduce((best, i) => (Math.abs(i - label.length / 2) < Math.abs(best - label.length / 2) ? i : best));
    return [label.slice(0, middle), label.slice(middle + 1)];
  };
  const labels = axes.map((a) => split(a.label));
  const labelWidth = (i: number) => Math.max(...labels[i]!.map((line) => line.length)) * 6.8 + 6;
  let room = $state(388);
  const W = $derived(Math.max(280, Math.min(460, Math.round(room))));
  const radius = $derived(
    Math.round(
      Math.max(
        48,
        Math.min(
          100,
          ...axes.map((_, i) => {
            const across = Math.abs(Math.cos(angle(i)));
            return across < 0.2 ? Infinity : (W / 2 - labelWidth(i)) / across - 12;
          }),
        ),
      ),
    ),
  );
  const H = $derived(2 * (radius + 52));
  const point = (i: number, r: number) => [Math.cos(angle(i)) * r, Math.sin(angle(i)) * r] as const;
  const ring = (r: number) => axes.map((_, i) => point(i, r).join(',')).join(' ');
  const summary = $derived(scores.map((s) => `${axes.find((a) => a.id === s.axis)!.label} ${s.score}`).join(', '));

  // The shape glides to new scores.
  const shown = Tween.of(() => scores.map((s) => s.score), { duration: calm() ? 0 : 400, easing: cubicOut });
  const corners = $derived(axes.map((_, i) => point(i, ((shown.current[i] ?? 0) / 100) * radius)));

  // How far each edge bows out from straight, while it twangs.
  let bends = $state<number[]>(axes.map(() => 0));
  const plucks: ({ at: number; size: number } | null)[] = axes.map(() => null);
  let ringing = 0;

  /** Edge i runs from corner i to corner i + 1; its control point sits off its middle. */
  function control(i: number): [number, number] {
    const [ax, ay] = corners[i]!;
    const [bx, by] = corners[(i + 1) % count]!;
    const length = Math.hypot(bx - ax, by - ay) || 1;
    // The normal, pointing away from the centre.
    let nx = (by - ay) / length;
    let ny = -(bx - ax) / length;
    if (nx * (ax + bx) + ny * (ay + by) < 0) [nx, ny] = [-nx, -ny];
    return [(ax + bx) / 2 + nx * bends[i]! * 2, (ay + by) / 2 + ny * bends[i]! * 2];
  }

  const outline = $derived.by(() => {
    const [x0, y0] = corners[0]!;
    let d = `M ${x0.toFixed(2)} ${y0.toFixed(2)}`;
    for (let i = 0; i < count; i++) {
      const [cx, cy] = control(i);
      const [x, y] = corners[(i + 1) % count]!;
      d += ` Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return `${d} Z`;
  });

  /** A damped twang of one edge, inward or outward as the pointer crossed it. */
  function pluck(i: number, event: PointerEvent) {
    touches += 1;
    if (touches >= 3 && !spider && !calm()) {
      target = onWeb(toChart(event));
      spider = { ...home, turn: 180 };
      since = performance.now();
      crawl();
    }
    if (calm()) return;
    const [ax, ay] = corners[i]!;
    const [bx, by] = corners[(i + 1) % count]!;
    const outward = (by - ay) * (ax + bx) - (bx - ax) * (ay + by) >= 0 ? 1 : -1;
    const along = (by - ay) * event.movementX - (bx - ax) * event.movementY;
    plucks[i] = { at: performance.now(), size: (along === 0 ? 1 : Math.sign(along)) * outward * 3 };
    if (!ringing) twang();
  }

  function twang() {
    ringing = requestAnimationFrame((now) => {
      ringing = 0;
      let still = true;
      bends = plucks.map((p, i) => {
        if (!p) return 0;
        const t = (now - p.at) / 1000;
        if (t > 0.8) {
          plucks[i] = null;
          return 0;
        }
        still = false;
        return p.size * Math.exp(-t / 0.16) * Math.cos(2 * Math.PI * 7 * t);
      });
      if (!still) twang();
    });
  }

  let svg = $state<SVGSVGElement>();
  let hovered = $state<number | null>(null);

  // The spider crawls after the pointer at its own pace, on a thread from the top of the web,
  // and never off the web. After a while it loses interest and climbs back up its thread. It
  // also leaves when the pointer does; either way, the count of twangs starts again.
  const [spiderWidth, , , , spiderPath] = faSpider.icon;
  const home = $derived({ x: 0, y: -radius });
  const patience = 7000;
  let spider = $state<{ x: number; y: number; turn: number } | null>(null);
  let touches = 0;
  let target = { x: 0, y: 0 };
  let since = 0;
  let frame = 0;

  /** The point brought inside the web: as far out as the outer ring allows in its direction. */
  function onWeb(p: { x: number; y: number }): { x: number; y: number } {
    const r = Math.hypot(p.x, p.y);
    if (!r) return p;
    const sector = (Math.PI * 2) / count;
    const turn = (((Math.atan2(p.y, p.x) - angle(0)) % sector) + sector) % sector;
    const edge = (radius * Math.cos(sector / 2)) / Math.cos(turn - sector / 2);
    return r <= edge ? p : { x: (p.x / r) * edge, y: (p.y / r) * edge };
  }

  function toChart(event: PointerEvent): { x: number; y: number } {
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return target;
    const p = svg.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    const local = p.matrixTransform(matrix.inverse());
    return { x: local.x, y: local.y };
  }

  function crawl() {
    frame = requestAnimationFrame((now) => {
      if (!spider) return;
      const bored = now - since > patience;
      const goal = bored ? home : target;
      const dx = goal.x - spider.x;
      const dy = goal.y - spider.y;
      const distance = Math.hypot(dx, dy);
      if (bored && distance <= 0.5) {
        // Home: up the thread and gone.
        spider = null;
        touches = 0;
        return;
      }
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
    touches = 0;
    hovered = null;
  }

  function anchor(i: number): 'start' | 'middle' | 'end' {
    const x = Math.cos(angle(i));
    return Math.abs(x) < 0.2 ? 'middle' : x > 0 ? 'start' : 'end';
  }

  /** Where line `j` of `n` sits: stacked away from the web at the top and bottom, centred at the sides. */
  function lineY(i: number, y: number, j: number, n: number): number {
    const down = Math.sin(angle(i));
    if (down < -0.9) return y - (n - 1 - j) * 17;
    if (down > 0.9) return y + j * 17;
    return y + (j - (n - 1) / 2) * 17;
  }
</script>

<p class="eu-help">
  Each spoke is one scale, from 0% at the centre to 100% at the rim, so the shape shows all {count} at once. Point at a
  spoke's end for its score.
</p>

<div class="room" bind:clientWidth={room}>
  <svg
    bind:this={svg}
    viewBox="{-W / 2} {-H / 2} {W} {H}"
    width={W}
    height={H}
    role="img"
    aria-label="Spider chart: {summary}"
    onpointermove={(e) => spider && (target = onWeb(toChart(e)))}
    onpointerleave={leave}
  >
    <g class="web">
      {#each [25, 50, 75, 100] as r (r)}
        <polygon class="ring" points={ring((r / 100) * radius)} />
      {/each}
      {#each axes as _, i (i)}
        {@const [x, y] = point(i, radius)}
        <line class="spoke" class:active={hovered === i} x1="0" y1="0" x2={x} y2={y} />
      {/each}
    </g>
    <path class="shape" d={outline} />
    {#each corners as [x, y], i (i)}
      <circle class="dot" cx={x} cy={y} r={hovered === i ? 5 : 3.5} />
    {/each}
    {#each corners as [x1, y1], i (i)}
      {@const [x2, y2] = corners[(i + 1) % count]!}
      <line class="edge-hit" {x1} {y1} {x2} {y2} role="presentation" onpointerenter={(e) => pluck(i, e)} />
    {/each}
    {#each axes as axis, i (axis.id)}
      {@const [x, y] = point(i, radius + 12)}
      {@const lines = hovered === i ? [...labels[i]!, `${scores[i]?.score}%`] : labels[i]!}
      <text text-anchor={anchor(i)} dominant-baseline="middle" class:active={hovered === i}>
        {#each lines as line, j (j)}
          <tspan {x} y={lineY(i, y, j, lines.length)}>{line}</tspan>
        {/each}
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
</div>

<Download svg={() => svg} name="{name} shape" />

<style>
  /* The room the chart has: the chart is drawn to fit it, at one unit to the pixel. */
  .room {
    min-width: 0;
  }

  svg {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0 auto;
    overflow: visible;
  }

  .ring,
  .spoke {
    fill: none;
    stroke: var(--line-strong);
    stroke-width: 0.6;
  }

  .spoke.active {
    stroke: var(--accent-text);
    stroke-width: 1.6;
  }

  /* The country's shape: its outline drawn in the link blue, which shows on either ground,
     over a see-through wash of the same. */
  .shape {
    fill: var(--accent-text);
    fill-opacity: 0.2;
    stroke: var(--accent-text);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .dot {
    fill: var(--accent-text);
  }

  text {
    fill: var(--ink-muted);
    font: var(--type-note);
  }

  text.active {
    fill: var(--ink);
    font-weight: 700;
  }

  .hit {
    fill: transparent;
    cursor: crosshair;
  }

  /* Invisible, wider stand-ins for the shape's edges, so brushing one is easy. */
  .edge-hit {
    stroke: transparent;
    stroke-width: 8;
    pointer-events: stroke;
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
