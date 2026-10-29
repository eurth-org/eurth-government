<script lang="ts">
  import { faCheck, faExpand, faXmark } from '@fortawesome/free-solid-svg-icons';
  import { axes } from '../model/axes';
  import { compassAxes, compassPoint } from '../model/compass';
  import type { AxisScore } from '../model/engine';
  import CompassChart, { type Mode } from './CompassChart.svelte';
  import Download from './Download.svelte';
  import Icon from './Icon.svelte';

  let { scores, name }: { scores: AxisScore[]; name: string } = $props();

  let mode = $state<Mode>('examples');
  let small = $state<SVGSVGElement>();
  let large = $state<SVGSVGElement>();
  let dialog: HTMLDialogElement;

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
  <div class="modes" role="radiogroup" aria-label="Reference points">
    {#each modes as [value, text] (value)}
      <label class="pill mode">
        <input type="radio" name={group} {value} bind:group={mode} />
        <span class="check"><Icon icon={faCheck} /></span>
        <span>{text}</span>
      </label>
    {/each}
  </div>
{/snippet}

{@render modePicker('compass-mode')}
<CompassChart {scores} {mode} bind:svg={small} />

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

<div class="actions">
  <button class="btn" onclick={() => dialog.showModal()}><Icon icon={faExpand} /> Enlarge</button>
  <Download svg={() => small} name="{name} compass" />
</div>

<dialog bind:this={dialog} aria-labelledby="compass-large-title">
  <div class="top">
    <h2 id="compass-large-title">Compass</h2>
    <button class="btn" aria-label="Close" onclick={() => dialog.close()}><Icon icon={faXmark} /></button>
  </div>
  {@render modePicker('compass-mode-large')}
  <CompassChart {scores} {mode} half={300} bind:svg={large} />
  <Download svg={() => large} name="{name} compass" />
</dialog>

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

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  .actions :global(.download) {
    margin-top: 0;
  }

  dialog {
    width: min(960px, calc(100vw - 2 * var(--space-4)));
    max-height: calc(100dvh - 2 * var(--space-4));
    padding: var(--space-4);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    background: var(--surface-raised);
    color: var(--ink);
    overflow-y: auto;
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 0.55);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2);
  }

  .top h2 {
    margin: 0;
    font-size: 18px;
  }
</style>
