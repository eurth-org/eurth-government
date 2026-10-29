<script lang="ts">
  import { axes } from '../model/axes';
  import type { AxisScore } from '../model/engine';

  // The seven axes as a web: the further out, the higher the score.
  let { scores }: { scores: AxisScore[] } = $props();

  const radius = 100;
  const count = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;
  const point = (i: number, r: number) => [Math.cos(angle(i)) * r, Math.sin(angle(i)) * r] as const;
  const ring = (r: number) => axes.map((_, i) => point(i, r).join(',')).join(' ');
  const shape = $derived(scores.map((s, i) => point(i, (s.score / 100) * radius).join(',')).join(' '));
  const summary = $derived(scores.map((s) => `${axes.find((a) => a.id === s.axis)!.label} ${s.score}`).join(', '));

  function anchor(i: number): 'start' | 'middle' | 'end' {
    const x = Math.cos(angle(i));
    return Math.abs(x) < 0.2 ? 'middle' : x > 0 ? 'start' : 'end';
  }
</script>

<svg viewBox="-190 -130 380 255" role="img" aria-label="Spider chart: {summary}">
  {#each [25, 50, 75, 100] as r (r)}
    <polygon class="ring" points={ring(r)} />
  {/each}
  {#each axes as _, i (i)}
    {@const [x, y] = point(i, radius)}
    <line class="spoke" x1="0" y1="0" x2={x} y2={y} />
  {/each}
  <polygon class="shape" points={shape} />
  {#each scores as s, i (s.axis)}
    {@const [x, y] = point(i, (s.score / 100) * radius)}
    <circle class="dot" cx={x} cy={y} r="3.5" />
  {/each}
  {#each axes as axis, i (axis.id)}
    {@const [x, y] = point(i, radius + 12)}
    <text x={x} y={y} text-anchor={anchor(i)} dominant-baseline="middle">{axis.label}</text>
  {/each}
</svg>

<style>
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
</style>
