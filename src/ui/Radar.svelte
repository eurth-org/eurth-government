<script lang="ts">
  import { axes } from '../model/axes';
  import type { AxisScore } from '../model/engine';
  import Download from './Download.svelte';

  // The scales as a web: the further out, the higher the score. Pointing at a spoke's outer end
  // shows its score and gives the web a little twitch.
  let { scores, name }: { scores: AxisScore[]; name: string } = $props();

  const radius = 100;
  const count = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;
  const point = (i: number, r: number) => [Math.cos(angle(i)) * r, Math.sin(angle(i)) * r] as const;
  const ring = (r: number) => axes.map((_, i) => point(i, r).join(',')).join(' ');
  const shape = $derived(scores.map((s, i) => point(i, (s.score / 100) * radius).join(',')).join(' '));
  const summary = $derived(scores.map((s) => `${axes.find((a) => a.id === s.axis)!.label} ${s.score}`).join(', '));

  let svg = $state<SVGSVGElement>();
  let hovered = $state<number | null>(null);
  let twitch = $state(0);

  function enter(i: number) {
    hovered = i;
    twitch += 1;
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

<svg bind:this={svg} viewBox="-200 -135 400 270" role="img" aria-label="Spider chart: {summary}">
  {#key twitch}
    <g class="web" class:twitching={twitch > 0}>
      {#each [25, 50, 75, 100] as r (r)}
        <polygon class="ring" points={ring(r)} />
      {/each}
      {#each axes as _, i (i)}
        {@const [x, y] = point(i, radius)}
        <line class="spoke" class:active={hovered === i} x1="0" y1="0" x2={x} y2={y} />
      {/each}
      <polygon class="shape" points={shape} />
      {#each scores as s, i (s.axis)}
        {@const [x, y] = point(i, (s.score / 100) * radius)}
        <circle class="dot" cx={x} cy={y} r={hovered === i ? 5 : 3.5} />
      {/each}
    </g>
  {/key}
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
      onpointerenter={() => enter(i)}
      onpointerleave={() => (hovered = null)}
    />
  {/each}
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

  /* A small, quick wobble around the centre. */
  .web {
    transform-box: fill-box;
    transform-origin: center;
  }

  .twitching {
    animation: twitch 0.45s ease-out;
  }

  @keyframes twitch {
    20% {
      transform: rotate(1.6deg) scale(1.01);
    }
    45% {
      transform: rotate(-1.1deg);
    }
    70% {
      transform: rotate(0.5deg);
    }
    100% {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .twitching {
      animation: none;
    }
  }
</style>
