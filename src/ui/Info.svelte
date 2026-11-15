<script lang="ts">
  import { faCircleInfo, faCircleQuestion, faEarthEurope, faKeyboard, faLightbulb, faUserShield, faVolumeHigh, faXmark } from '@fortawesome/free-solid-svg-icons';
  import Icon from '@eurth/style/components/Icon.svelte';
  import { ref } from './ref';

  /**
   * About Governmint, opened with the "?" button or the ? key: what it does, where your
   * country is kept, a word on real countries, the keyboard shortcuts (with a switch to turn
   * the single keys off, for speech input; WCAG 2.1.4), and where to suggest ideas. The sound
   * and motion switches are the suite's, in the footer.
   */
  let {
    open,
    onclose,
    shortcuts,
    ontoggleshortcuts,
    mod,
    host,
  }: {
    open: boolean;
    onclose: () => void;
    shortcuts: boolean;
    ontoggleshortcuts: () => void;
    /** The command key as this device writes it: "⌘" or "Ctrl+". */
    mod: string;
    /** This site's host, for the ?ref on links to other sites. */
    host: string;
  } = $props();
  let dialog: HTMLDialogElement;

  const command = $derived(mod.replace('+', ''));
  const keys: [string[], string][] = $derived([
    [['/'], 'Search settings'],
    [['E'], 'Examples and real countries'],
    [['R'], 'A random country'],
    [['S'], 'Copy the link'],
    [['[', ']'], 'Previous or next section'],
    [['?'], 'This window'],
    [[command, 'Z'], 'Undo'],
    [[command, '⇧', 'Z'], 'Redo'],
    [['Esc'], 'Close, or clear the search'],
  ]);

  $effect(() => {
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });
</script>

<dialog bind:this={dialog} class="eu-dialog about" {onclose} aria-labelledby="info-title">
  <!-- The title and Close stay in view; only the text below scrolls. -->
  <div class="eu-dialog-top">
    <h2 id="info-title"><Icon icon={faCircleQuestion} /> About Governmint</h2>
    <button type="button" class="eu-btn eu-btn--quiet eu-btn--icon" aria-label="Close" onclick={() => dialog.close()}><Icon icon={faXmark} /></button>
  </div>
  <div class="body">
    <!-- Two columns where there's room: about Governmint on the left, using it on the right. -->
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
          A country lives in its link: copy it to share it or to come back later. The profile file carries your nation
          from one Eurth tool to the next. Nothing about you or your country is stored, in this browser or anywhere
          else, and there's no account. Governmint only counts how many countries are minted (copied, shared or
          exported): a single number. After your first visit it works offline too, from a copy of itself on this
          device.
        </p>
      </section>

      <section aria-labelledby="info-real">
        <h3 id="info-real"><Icon icon={faEarthEurope} /> Real countries</h3>
        <p>
          Governmint is a worldbuilding tool, made for fiction and fun. Its pictures of real countries are simplified
          and approximate, as of 2026: not an assessment of any government, and not legal or political advice.
        </p>
      </section>

      <section aria-labelledby="info-ideas">
        <h3 id="info-ideas"><Icon icon={faLightbulb} /> Ideas</h3>
        <p>
          Fellow worldbuilder? Table a motion for the roadmap on
          <a href={ref('https://eurth.org', host)}>the Eurth forum</a>. No quorum required.
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
        <button type="button" class="eu-btn" aria-pressed={shortcuts} onclick={ontoggleshortcuts}>
          Single-key shortcuts: {shortcuts ? 'on' : 'off'}
        </button>
        <p class="eu-help">
          Turn them off if you use speech input, so a spoken word can't set one off. The switch lasts for this visit.
        </p>
      </section>

      <section aria-labelledby="info-sound">
        <h3 id="info-sound"><Icon icon={faVolumeHigh} /> Sound and motion</h3>
        <p>
          Both switches are in the footer, and both last for this visit. Sound is off unless you turn it on: then a
          soft coin clink when you copy a link, a text or an image, or when a scale reaches 100% and coins burst out
          (only if you can see it).
        </p>
      </section>
    </div>
  </div>
</dialog>

<style>
  /* As wide as a column of text, or the screen: two columns where there's room, one on a phone. */
  .about {
    width: min(var(--size-measure), calc(100vw - 2 * var(--space-4)));
  }

  .body {
    display: grid;
    gap: var(--space-4) var(--space-8);
    margin-top: var(--space-3);
  }

  @media (min-width: 720px) {
    .body {
      grid-template-columns: 1fr 1fr;
    }
  }

  .column,
  section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .column {
    gap: var(--space-4);
  }

  h3 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  h3 :global(.eu-icon) {
    color: var(--accent-text);
  }

  dl {
    display: grid;
    gap: var(--space-1);
    width: 100%;
    margin: 0;
  }

  dl div {
    display: grid;
    grid-template-columns: calc(3 * var(--size-target)) minmax(0, 1fr);
    align-items: center;
  }

  dt {
    display: flex;
    gap: var(--space-1);
  }

  dd {
    margin: 0;
  }

  kbd {
    min-width: var(--space-6);
    padding: 0 var(--space-2);
    border: 1px solid var(--line-strong);
    border-bottom-width: 2px;
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    text-align: center;
  }
</style>
