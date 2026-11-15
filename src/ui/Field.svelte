<script lang="ts">
  import { faCheck } from '@fortawesome/free-solid-svg-icons';
  import Icon from '@eurth/style/components/Icon.svelte';
  import type { SettingDef } from '../model/types';

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
      <legend class="eu-label"><span class="question">{def.question}</span></legend>
      <div class="eu-row options">
        {#each def.options as option (option.id)}
          <label class="eu-pill">
            <input
              type={def.kind === 'multi' ? 'checkbox' : 'radio'}
              name={def.id}
              value={option.id}
              checked={chosen.includes(option.id)}
              onchange={() => pick(option.id)}
            />
            <span class="eu-check"><Icon icon={faCheck} /></span>
            {option.label}
          </label>
        {/each}
      </div>
    </fieldset>
  {:else}
    <!-- Not the bare id: a section may carry the same word ("legislature"), and ids are one each. -->
    <label class="eu-label" for="setting-{def.id}"><span class="question">{def.question}</span></label>
    <select class="eu-select" id="setting-{def.id}" {value} aria-describedby="help-{def.id}" onchange={(e) => onchange(e.currentTarget.value)}>
      {#each def.options as option (option.id)}
        <option value={option.id}>{option.label}</option>
      {/each}
    </select>
  {/if}
  <p class="eu-help" id="help-{def.id}">{help}</p>
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0 calc(-1 * var(--space-2));
    padding: var(--space-2);
    border-radius: var(--radius-md);
    scroll-margin-top: calc(var(--size-target) + var(--space-8));
  }

  /* A match, as find-in-page marks one: the question itself is highlighted, and the setting
     gets a dashed edge. The match you're on has a solid one. */
  .matched,
  .current {
    outline: 1px dashed var(--line-strong);
  }

  .matched .question,
  .current .question,
  .flash .question {
    background: var(--highlight);
    color: var(--on-highlight);
  }

  .current {
    outline: var(--size-ring) solid var(--ink);
  }

  /* "Look here": the edge blinks a few times. Stilled for reduced motion by the suite's
     stylesheet, where it simply stays. */
  .flash {
    outline: var(--size-ring) solid var(--ink);
    animation: flash 0.7s ease-in-out 4 alternate;
  }

  @keyframes flash {
    from {
      outline-color: transparent;
    }
  }

  fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    margin-bottom: var(--space-1);
    padding: 0;
  }

  .options {
    gap: var(--space-2);
  }

  .eu-select {
    cursor: pointer;
  }
</style>
