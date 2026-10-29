<script lang="ts">
  import { faKeyboard, faXmark } from '@fortawesome/free-solid-svg-icons';
  import Icon from './Icon.svelte';

  // The list of keyboard shortcuts, opened with "?".
  let { open, onclose }: { open: boolean; onclose: () => void } = $props();
  let dialog: HTMLDialogElement;

  const mac = /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = mac ? '⌘' : 'Ctrl';
  const keys: [string[], string][] = [
    [['/'], 'Search settings'],
    [['E'], 'Examples and real countries'],
    [['R'], 'A random country'],
    [['S'], 'Save, and copy the link'],
    [['[', ']'], 'Previous or next section'],
    [[mod, 'Z'], 'Undo'],
    [[mod, '⇧', 'Z'], 'Redo'],
    [['?'], 'This list'],
    [['Esc'], 'Close, or clear the search'],
  ];

  $effect(() => {
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });
</script>

<dialog bind:this={dialog} onclose={onclose} aria-labelledby="shortcuts-title">
  <div class="top">
    <h2 id="shortcuts-title"><Icon icon={faKeyboard} /> Keyboard shortcuts</h2>
    <button class="btn" aria-label="Close" onclick={() => dialog.close()}><Icon icon={faXmark} /></button>
  </div>
  <dl>
    {#each keys as [combo, what] (what)}
      <div>
        <dt>{#each combo as key, i (i)}<kbd>{key}</kbd>{/each}</dt>
        <dd>{what}</dd>
      </div>
    {/each}
  </dl>
</dialog>

<style>
  dialog {
    width: min(420px, calc(100vw - 2 * var(--space-4)));
    padding: var(--space-4);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    background: var(--surface-raised);
    color: var(--ink);
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 0.55);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3);
  }

  h2 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    font-size: 18px;
  }

  dl {
    display: grid;
    gap: var(--space-2);
    margin: 0;
  }

  dl div {
    display: grid;
    grid-template-columns: 110px 1fr;
    align-items: center;
  }

  dt {
    display: flex;
    gap: 4px;
  }

  dd {
    margin: 0;
  }

  kbd {
    min-width: 24px;
    padding: 2px 6px;
    border: 1px solid var(--line-strong);
    border-bottom-width: 2px;
    border-radius: var(--radius-control);
    background: var(--surface);
    font: inherit;
    font-size: 13px;
    text-align: center;
  }
</style>
