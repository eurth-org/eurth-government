<script lang="ts">
  import { faCheck } from '@fortawesome/free-solid-svg-icons';
  import { axes } from '../model/axes';
  import { compassAxes, compassPoint } from '../model/compass';
  import { compassJson, compassMarkdown } from '../model/compassText';
  import type { AxisScore } from '../model/engine';
  import Icon from '@eurth/style/components/Icon.svelte';
  import Line from '@eurth/style/components/Line.svelte';
  import { lineArrowsDiagonal, lineClose } from '@eurth/style/line';
  import CompassChart, { type Mode } from './CompassChart.svelte';
  import Download from './Download.svelte';

  let { scores, name, link }: { scores: AxisScore[]; name: string; link: string } = $props();

  // The compass as text too: Markdown with a Mermaid chart, and JSON.
  const texts = $derived([
    { label: 'Markdown', extension: 'md', type: 'text/markdown', make: () => compassMarkdown(name, scores, mode, link) },
    { label: 'JSON', extension: 'json', type: 'application/json', make: () => compassJson(name, scores, mode, link) },
  ]);

  let mode = $state<Mode>('examples');
  let small = $state<SVGSVGElement>();
  let large = $state<SVGSVGElement>();
  let dialog: HTMLDialogElement;
  // The enlarged compass is drawn once its window has been opened, not with the page.
  let enlarged = $state(false);

  // Each chart is drawn to fit the room it has, one unit to the pixel: 38 either side of the
  // plot for the words at its ends.
  let room = $state(388);
  let roomLarge = $state(700);
  const fit = (width: number, most: number) => Math.round(Math.max(100, Math.min(most, (width - 76) / 2)));

  const here = $derived(compassPoint(scores));
  const label = (id: string) => axes.find((a) => a.id === id)!.label;
  const fmt = (n: number) => (n > 0 ? `+${n}` : String(n));
  const modes: [Mode, string][] = [
    ['examples', 'Examples'],
    ['countries', 'Real countries'],
    ['none', 'None'],
  ];
</script>

{#snippet modePicker(group: string)}
  <div class="eu-row tight" role="radiogroup" aria-label="Reference points">
    {#each modes as [value, text] (value)}
      <label class="eu-pill">
        <input type="radio" name={group} {value} bind:group={mode} />
        <span class="eu-check"><Icon icon={faCheck} /></span>
        {text}
      </label>
    {/each}
  </div>
{/snippet}

<!-- Reference points on the left, Enlarge on the right. -->
<div class="toolbar">
  {@render modePicker('compass-mode')}
  <button type="button" class="eu-btn" onclick={() => ((enlarged = true), dialog.showModal())}><Line icon={lineArrowsDiagonal} /> Enlarge</button>
</div>
<div class="room" bind:clientWidth={room}>
  <CompassChart {scores} {mode} half={fit(room, 170)} bind:svg={small} />
</div>

<dl class="eu-help explain">
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

<Download svg={() => small} name="{name} compass" {texts} />

<dialog bind:this={dialog} class="eu-dialog large" aria-labelledby="compass-large-title">
  <div class="eu-dialog-top">
    <h2 id="compass-large-title">Compass</h2>
    <button type="button" class="eu-btn eu-btn--quiet eu-btn--icon" aria-label="Close" onclick={() => dialog.close()}><Line icon={lineClose} /></button>
  </div>
  <div class="eu-stack">
    {@render modePicker('compass-mode-large')}
    <div class="room" bind:clientWidth={roomLarge}>
      {#if enlarged}
        <CompassChart {scores} {mode} half={fit(roomLarge, 300)} bind:svg={large} />
      {/if}
    </div>
    <Download svg={() => large} name="{name} compass" {texts} />
  </div>
</dialog>

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

  /* The room the chart has: the chart is drawn to fit it. */
  .room {
    min-width: 0;
  }

  .explain div + div {
    margin-top: var(--space-1);
  }

  dt {
    display: inline;
    color: var(--ink);
    font-weight: 700;
  }

  dt::after {
    content: ' ';
  }

  dd {
    display: inline;
    margin: 0;
  }

  /* The enlarged compass: as wide as a column of text, or the screen. */
  .large {
    width: min(var(--size-measure), calc(100vw - 2 * var(--space-4)));
  }
</style>
