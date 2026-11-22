<script lang="ts">
  /*
   * Governmint's actions: Examples & countries, Undo, Redo, Save and About. They stand at the
   * right end of the line that carries the coin and the name, as they always have; that line
   * is the suite's header now, so pages/index.astro places this component in its "actions"
   * slot. The tool tells it what can be done and how (toolbar.svelte.ts). The .gov wrapper
   * gives the buttons Governmint's own look (app.css).
   */
  import { faBookOpen, faCircleQuestion, faFloppyDisk, faRedo, faUndo } from '@fortawesome/free-solid-svg-icons';
  import Icon from './Icon.svelte';
  import { toolbar } from './toolbar.svelte';
</script>

<div class="gov actions">
  <button class="btn" onclick={() => toolbar.examples()} data-tip="Start from an example or a real country (E)">
    <Icon icon={faBookOpen} /> Examples<span class="wide-only">&amp; countries</span>
  </button>
  <span class="history">
    <button class="btn icon-only" data-click="swing-left" onclick={() => toolbar.undo()} disabled={!toolbar.canUndo} aria-label="Undo" data-tip="Undo ({toolbar.mod}Z)">
      <Icon icon={faUndo} />
    </button>
    <button class="btn icon-only" data-click="swing-right" onclick={() => toolbar.redo()} disabled={!toolbar.canRedo} aria-label="Redo" data-tip="Redo (⇧{toolbar.mod}Z)">
      <Icon icon={faRedo} />
    </button>
  </span>
  <button class="btn btn-primary" data-click="bounce" onclick={() => toolbar.save()} data-tip="Save: copy the link, which holds the whole country (S)">
    <Icon icon={faFloppyDisk} /> Save
  </button>
  <button class="btn icon-only" aria-label="About Governmint and keyboard shortcuts" data-tip="About and shortcuts (?)" onclick={() => toolbar.about()}>
    <Icon icon={faCircleQuestion} />
  </button>
</div>

<style>
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  @media (max-width: 480px) {
    .wide-only {
      display: none;
    }
  }

  .history {
    display: inline-flex;
    gap: 2px;
  }

  /* Every header tool is the same height; the icon-only ones are square. */
  .actions .btn {
    height: 36px;
  }

  .icon-only {
    justify-content: center;
    width: 36px;
    padding: 0;
  }

  .actions .btn:disabled {
    opacity: 0.45;
    cursor: default;
    box-shadow: none;
    transform: none;
  }

  .actions .btn:disabled:hover {
    background: var(--button);
    border-color: transparent;
  }
</style>
