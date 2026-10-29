<script lang="ts">
  import { faCheck } from '@fortawesome/free-solid-svg-icons';
  import type { SettingDef } from '../model/types';
  import Icon from './Icon.svelte';

  let {
    def,
    value,
    flash = false,
    matched = false,
    current = false,
    onchange,
  }: {
    def: SettingDef;
    value: string | string[];
    flash?: boolean;
    /** A search match: highlighted until the search is cleared. */
    matched?: boolean;
    /** The search match the visitor is on. */
    current?: boolean;
    onchange: (value: string | string[]) => void;
  } = $props();

  // Short lists read faster as buttons; longer ones stay a dropdown.
  const buttons = $derived(def.kind === 'multi' || def.options.length <= 4);
  const chosen = $derived(Array.isArray(value) ? value : [value]);
  const help = $derived.by(() => {
    const picked = def.options.filter((o) => chosen.includes(o.id));
    if (picked.length) return picked.map((o) => o.help).join(' ');
    return 'Everyone of voting age who lives here may vote.';
  });

  function pick(option: string) {
    if (def.kind === 'choice') onchange(option);
    else onchange(chosen.includes(option) ? chosen.filter((o) => o !== option) : [...chosen, option]);
  }
</script>

<div class="field" class:flash class:matched class:current id="field-{def.id}">
  {#if buttons}
    <fieldset aria-describedby="help-{def.id}">
      <legend>{def.question}</legend>
      <div class="options">
        {#each def.options as option (option.id)}
          <label class="pill">
            <input
              type={def.kind === 'multi' ? 'checkbox' : 'radio'}
              name={def.id}
              value={option.id}
              checked={chosen.includes(option.id)}
              onchange={() => pick(option.id)}
            />
            <span class="check"><Icon icon={faCheck} /></span>
            <span>{option.label}</span>
          </label>
        {/each}
      </div>
    </fieldset>
  {:else}
    <label class="question" for={def.id}>{def.question}</label>
    <select id={def.id} {value} aria-describedby="help-{def.id}" onchange={(e) => onchange(e.currentTarget.value)}>
      {#each def.options as option (option.id)}
        <option value={option.id}>{option.label}</option>
      {/each}
    </select>
  {/if}
  <p class="help" id="help-{def.id}">{help}</p>
</div>

<style>
  .field {
    margin: 0 calc(-1 * var(--space-2));
    padding: var(--space-2);
    border-radius: var(--radius-control);
  }

  .field + :global(.field) {
    margin-top: var(--space-2);
  }

  .matched {
    background: var(--flash);
  }

  .current {
    background: var(--flash);
    box-shadow: 0 0 0 2px var(--focus-ring);
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
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend,
  .question {
    display: block;
    margin-bottom: var(--space-1);
    padding: 0;
    font-weight: 600;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    background: var(--surface);
    cursor: pointer;
  }

  .help {
    margin: var(--space-1) 0 0;
    color: var(--ink-muted);
    font-size: 13px;
  }
</style>
