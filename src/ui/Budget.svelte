<script lang="ts">
  import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';
  import { setShare, withBudget } from '../model/budget';
  import { defaultCountry } from '../model/engine';
  import { budgetIds, settings, type BudgetId, type Country, type SettingId } from '../model/settings';
  import type { ShareSettingDef } from '../model/types';
  import Icon from './Icon.svelte';
  import { budgetStyle } from './icons';

  let {
    country,
    flashing,
    onchange,
  }: { country: Country; flashing: SettingId[]; onchange: (country: Country) => void } = $props();

  const lines = budgetIds.map((id) => ({
    id,
    def: settings.find((s) => s.id === id) as ShareSettingDef,
    ...budgetStyle[id],
  }));

  const summary = $derived(lines.map((l) => `${l.def.label} ${country[l.id]}%`).join(', '));

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

<div class="bar" role="img" aria-label="Budget: {summary}">
  {#each lines as line (line.id)}
    <span style:flex-grow={country[line.id]} style:background={line.colour} title="{line.def.label}: {country[line.id]}%"
    ></span>
  {/each}
</div>

<ul class="lines">
  {#each lines as line (line.id)}
    <li class="line" class:flash={flashing.includes(line.id)} id="field-{line.id}">
      <span class="icon" style:color={line.colour}><Icon icon={line.icon} /></span>
      <label for="share-{line.id}">{line.def.label}</label>
      <output for="share-{line.id}">{country[line.id]}%</output>
      <input
        id="share-{line.id}"
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

  .bar {
    display: flex;
    height: 14px;
    margin-bottom: var(--space-3);
    overflow: hidden;
    border-radius: var(--radius-control);
    background: var(--line);
  }

  .bar span {
    flex-basis: 0;
    min-width: 0;
    transition: flex-grow 0.15s;
  }

  .bar span + span {
    box-shadow: inset 1px 0 0 var(--surface-raised);
  }

  .lines {
    margin: 0 0 var(--space-3);
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

  input {
    grid-area: slider;
    width: 100%;
    accent-color: var(--selected);
    cursor: pointer;
  }

  .help {
    grid-area: help;
    margin: 0;
    color: var(--ink-muted);
    font-size: 13px;
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

    .bar span {
      transition: none;
    }
  }
</style>
