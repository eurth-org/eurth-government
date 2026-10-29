<script lang="ts">
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import {
    faCircleInfo,
    faCircleQuestion,
    faKeyboard,
    faLightbulb,
    faUserShield,
    faVolumeHigh,
    faVolumeXmark,
    faXmark,
  } from '@fortawesome/free-solid-svg-icons';
  import Icon from './Icon.svelte';
  import { motion, setGlobe } from './motion.svelte';
  import { ref } from './ref';

  /**
   * About Governmint, opened with the "?" button, the About link or the ? key: what it does,
   * where your country is kept, the keyboard shortcuts (with a switch to turn the single keys
   * off, for speech input; WCAG 2.1.4), the sound switch, and where to suggest ideas.
   */
  let {
    open,
    onclose,
    sound,
    ontogglesound,
    shortcuts,
    ontoggleshortcuts,
  }: {
    open: boolean;
    onclose: () => void;
    sound: boolean;
    ontogglesound: () => void;
    shortcuts: boolean;
    ontoggleshortcuts: () => void;
  } = $props();
  let dialog: HTMLDialogElement;
  let body = $state<HTMLDivElement>();

  // Is there more below? Then the bottom edge fades, as a hint to scroll.
  let more = $state(false);
  function measure() {
    if (body) more = body.scrollTop + body.clientHeight < body.scrollHeight - 4;
  }

  const mac = /Mac|iPhone|iPad/.test(navigator.platform);
  const mod = mac ? '⌘' : 'Ctrl';
  const keys: [string[], string][] = [
    [['/'], 'Search settings'],
    [['E'], 'Examples and real countries'],
    [['R'], 'A random country'],
    [['S'], 'Save, and copy the link'],
    [['[', ']'], 'Previous or next section'],
    [['?'], 'This window'],
    [[mod, 'Z'], 'Undo'],
    [[mod, '⇧', 'Z'], 'Redo'],
    [['Esc'], 'Close, or clear the search'],
  ];

  $effect(() => {
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (open) requestAnimationFrame(measure);
  });
</script>

<svelte:window onresize={measure} />

<dialog bind:this={dialog} onclose={onclose} aria-labelledby="info-title">
  <!-- The title and Close stay in view; only the text below scrolls. -->
  <div class="top">
    <h2 id="info-title"><Icon icon={faCircleQuestion} /> About Governmint</h2>
    <button class="btn close" aria-label="Close" onclick={() => dialog.close()}><Icon icon={faXmark} /></button>
  </div>
  <div class="body" class:more bind:this={body} onscroll={measure}>
    <!-- Two columns on a desktop: about Governmint on the left, using it on the right. -->
    <div class="column">
      <section aria-labelledby="info-what">
        <h3 id="info-what"><Icon icon={faCircleInfo} /> What it does</h3>
        <p>
          Set up a country and Governmint names the kind of state you've made, explains why, and points out where the
          settings contradict each other. This preview covers government and the budget; the economy and law come next.
        </p>
        <p>
          Start from an example or a real country, or roll the dice beside the name. Drag a scale to see which settings
          would move it, and follow "Show settings" to step through what a check is about.
        </p>
      </section>

      <section aria-labelledby="info-yours">
        <h3 id="info-yours"><Icon icon={faUserShield} /> Your country stays yours</h3>
        <p>
          A country lives in its link: copy it to share it or come back later. Save also keeps a list in this browser.
          Nothing is stored anywhere else, and there's no account.
        </p>
      </section>

      <section aria-labelledby="info-ideas">
        <h3 id="info-ideas"><Icon icon={faLightbulb} /> Ideas</h3>
        <p>
          Fellow worldbuilder?
          <a href={ref('https://github.com/eurth-org/eurth-government/discussions/categories/ideas')}>
            <Icon icon={faGithub} /> Table a motion for the roadmap</a
          >
          on GitHub. No quorum required.
        </p>
      </section>
    </div>
    <div class="column">
      <section aria-labelledby="info-keys">
        <h3 id="info-keys"><Icon icon={faKeyboard} /> Keyboard</h3>
        <dl>
          {#each keys as [combo, what] (what)}
            <div>
              <dt>{#each combo as key, i (i)}<kbd>{key}</kbd>{/each}</dt>
              <dd>{what}</dd>
            </div>
          {/each}
        </dl>
        <p class="setting">
          <button class="btn" aria-pressed={shortcuts} onclick={ontoggleshortcuts}>
            Single-key shortcuts: {shortcuts ? 'on' : 'off'}
          </button>
          <span class="note">Turn them off if you use speech input, so a spoken word can't set one off.</span>
        </p>
      </section>

      <section aria-labelledby="info-sound">
        <h3 id="info-sound"><Icon icon={sound ? faVolumeHigh : faVolumeXmark} /> Sound and motion</h3>
        <p class="setting">
          <button class="btn" aria-pressed={sound} onclick={ontogglesound}>Coin clink: {sound ? 'on' : 'off'}</button>
          <span class="note">A little clink when you save or copy.</span>
        </p>
        <p class="setting">
          <button class="btn" aria-pressed={motion.globe} onclick={() => setGlobe(!motion.globe)}>
            Turning globe: {motion.globe ? 'on' : 'off'}
          </button>
          <span class="note">The Eurth globe turns, as on eurth.org. Stop it here.</span>
        </p>
      </section>
    </div>
  </div>
</dialog>

<style>
  /* Wide enough on a desktop to read everything at a glance, in two columns; one column on
     a phone, where the text scrolls under a fixed title and Close. */
  dialog {
    width: min(980px, calc(100vw - 2 * var(--space-4)));
    max-height: min(820px, calc(100dvh - 2 * var(--space-4)));
    padding: 0;
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    background: var(--surface-raised);
    color: var(--ink);
    overflow: hidden;
  }

  dialog[open] {
    display: flex;
    flex-direction: column;
  }

  .body {
    overflow-y: auto;
    padding: 0 var(--space-4) var(--space-4);
  }

  @media (min-width: 820px) {
    .body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: var(--space-8);
    }
  }

  .body.more {
    mask-image: linear-gradient(to bottom, #000 calc(100% - 56px), transparent);
  }

  .column > section:first-child h3 {
    margin-top: var(--space-1);
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 0.55);
  }

  .top {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-4) var(--space-2);
  }

  h2,
  h3 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
  }

  h2 {
    font-size: 18px;
  }

  h3 {
    margin: var(--space-4) 0 var(--space-1);
    font-size: 15px;
  }

  h3 :global(.icon) {
    color: var(--accent-fill);
  }

  p {
    margin: 0 0 var(--space-2);
  }

  .setting {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-3);
  }

  .note {
    color: var(--ink-muted);
    font-size: 13px;
  }

  dl {
    display: grid;
    gap: var(--space-1);
    margin: 0 0 var(--space-3);
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

  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
</style>
