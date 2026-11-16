<script lang="ts">
  import { faCrown, faDice, faFlag } from '@fortawesome/free-solid-svg-icons';
  import { onDestroy, untrack } from 'svelte';
  import type { Profile } from '../model/engine';
  import { sentence } from '../model/formats';
  import { calm } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import Line from '@eurth/style/components/Line.svelte';
  import { lineArrowRight } from '@eurth/style/line';
  import coin from '../assets/eurth-coin.svg?url';
  import { motto } from '../model/motto';
  import { nameLimit } from '../model/text';

  /**
   * The country's name card. New names are freshly minted: they type themselves out, a coin
   * flips and a seal stamps down. Monarchies get a crown on the flag, theocracies a halo, and a
   * real country its own flag. None of the movement happens for reduced motion, or with motion
   * switched off in the footer. The dice beside the name roll a random country, by way of the
   * toolbar's Random: it replaces the whole country, so the dice turn red when pointed at and
   * the first roll asks. Typing a real country's name offers its real government.
   */
  let {
    name = $bindable(),
    profile,
    seed,
    flag,
    onrandom,
    real,
    onreal,
  }: {
    name: string;
    profile: Profile;
    seed: string;
    flag?: string;
    onrandom: () => void;
    /** The real country whose name was typed, if any. */
    real?: { name: string; flag: string };
    onreal: () => void;
  } = $props();

  const monarchy = $derived(/monarch/i.test(profile.labels.form.label));
  const theocracy = $derived(/theocra/i.test(profile.labels.form.label) || profile.labels.regime.rule === 'theocracy');

  // While the empty name field has focus, its placeholder suggests a name: classics of fiction,
  // with a few of Eurth's nations among them.
  const suggestions = ['Ruritania', 'Orioni', 'Freedonia', 'Dolchland', 'Grand Fenwick', 'Adaptus', 'Elbonia', 'Lysia'];
  let placeholder = $state('Your country');
  let suggesting: ReturnType<typeof setInterval> | undefined;
  function suggestNames() {
    let i = 0;
    placeholder = suggestions[i]!;
    suggesting = setInterval(() => (placeholder = suggestions[++i % suggestions.length]!), 1800);
  }
  function stopSuggesting() {
    clearInterval(suggesting);
    placeholder = 'Your country';
  }

  // A new name is minted: it types itself out (a CSS reveal over the one copy of the name, so
  // screen readers and read-aloud tools get it once), the coin flips and the seal stamps down.
  let minted = $state(0);
  let cardHeight = $state(0);
  let previous = untrack(() => profile.name);
  $effect(() => {
    const next = profile.name;
    if (next === previous) return;
    previous = next;
    minted += 1;
  });

  onDestroy(() => clearInterval(suggesting));
</script>

<label class="eu-kicker kicker" for="country-name">
  <span class="flag" class:crowned={monarchy} class:haloed={theocracy}>
    {#if flag}
      <img src="/flags/{flag}.svg" alt="" width="20" height="20" />
    {:else}
      <Icon icon={faFlag} />
    {/if}
    {#if monarchy}<span class="crown" aria-hidden="true"><Icon icon={faCrown} /></span>{/if}
    {#if theocracy}<span class="halo" aria-hidden="true"></span>{/if}
  </span>
  Country name
</label>
<div class="name-row">
  <input
    id="country-name"
    class="eu-input name-input"
    maxlength={nameLimit}
    autocomplete="off"
    spellcheck="false"
    {placeholder}
    bind:value={name}
    onfocus={suggestNames}
    onblur={stopSuggesting}
  />
  <button
    type="button"
    class="eu-btn eu-btn--selected eu-btn--risky eu-btn--icon"
    data-click="tumble"
    aria-label="Roll a random country"
    data-tip="Replaces your country (R)"
    onclick={onrandom}
  >
    <Icon icon={faDice} />
  </button>
</div>
{#if real}
  <button type="button" class="eu-btn real" onclick={onreal}>
    <img src="/flags/{real.flag}.svg" alt="" width="20" height="20" />
    <span>Real country: load its actual government</span>
    <span class="eu-visually-hidden">({real.name})</span>
    <Line icon={lineArrowRight} />
  </button>
{/if}

<!-- The coin hangs beside the name, the motto and the summary, so all three share one edge.
     When a new name is longer or shorter, the card grows or shrinks smoothly instead of jumping. -->
<div class="card-size" style:height={cardHeight ? `${cardHeight + 16}px` : undefined}>
  <div class="card" bind:clientHeight={cardHeight}>
    {#key minted}
      <span class="coin" class:flipping={minted > 0 && !calm()} aria-hidden="true">
        <span class="face front"><img src={coin} alt="" /></span>
        <span class="face back"><img src={coin} alt="" /></span>
      </span>
    {/key}
    <div class="title">
      <h2 class="government" aria-live="polite">
        {#key minted}
          <span class="minted" class:typing={minted > 0 && !calm()}>{profile.name}</span>
        {/key}
      </h2>
      {#key minted}
        {#if minted > 0 && !calm()}
          <span class="seal" aria-hidden="true">Freshly minted</span>
        {/if}
      {/key}
    </div>
    <p class="motto">“{motto(profile, seed)}”</p>
    <p class="sentence">{sentence(name.trim() || 'This country', profile)}</p>
  </div>
</div>

<style>
  .kicker {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .flag {
    position: relative;
    display: inline-flex;
    color: var(--accent-text);
    font: var(--type-body);
  }

  .flag img {
    width: var(--space-5);
    height: var(--space-5);
  }

  /* Easter eggs: a crown for monarchies, a halo for theocracies, both in the coin's gold. */
  .crown {
    position: absolute;
    left: 50%;
    top: calc(-1 * var(--space-2));
    display: inline-flex;
    width: var(--space-3);
    color: var(--cat-amber);
    transform: translateX(-50%) rotate(-12deg);
    animation: settle 0.5s cubic-bezier(0.3, 1.6, 0.6, 1);
  }

  .halo {
    position: absolute;
    left: 50%;
    top: calc(-1 * var(--space-2));
    width: var(--space-4);
    height: var(--space-1);
    border: 2px solid var(--cat-amber);
    border-radius: var(--radius-full);
    transform: translateX(-50%);
  }

  .crowned .halo {
    top: calc(-1 * var(--space-4));
  }

  /* The name field and the dice, side by side at one height. */
  .name-row {
    display: flex;
    gap: var(--space-2);
  }

  .name-input {
    flex: 1;
    min-width: 0;
    font-weight: 700;
  }

  /* Typed a real country's name: its real government is a click away. */
  .real {
    justify-content: flex-start;
    padding-block: var(--space-2);
    text-align: left;
  }

  .real img {
    flex: none;
    width: var(--space-5);
    height: var(--space-5);
  }

  /* The card's box: it clips the coin's hop and the seal, so they never widen the page, with
     room above for both. */
  .card-size {
    margin-top: calc(-1 * var(--space-4));
    padding-top: var(--space-4);
    overflow: clip;
    transition: height 0.3s ease;
  }

  .card {
    display: grid;
    grid-template-columns: var(--space-6) minmax(0, 1fr);
    column-gap: var(--space-2);
    row-gap: var(--space-1);
  }

  .card > :not(.coin) {
    grid-column: 2;
  }

  .title {
    position: relative;
  }

  .government {
    min-height: 1lh;
    font: var(--type-subtitle);
  }

  /* The typewriter: the name is uncovered from left to right, a few letters at a time. */
  .typing {
    animation: type 0.45s steps(16, end);
  }

  @keyframes type {
    from {
      clip-path: inset(0 100% 0 0);
    }
  }

  .minted {
    display: inline-block;
  }

  /* The Eurth coin (assets/eurth-coin.svg), flipped once per new name. */
  .coin {
    position: relative;
    grid-column: 1;
    grid-row: 1 / span 3;
    align-self: start;
    width: var(--space-6);
    height: var(--space-6);
    margin-top: var(--space-1);
    transform-style: preserve-3d;
  }

  .face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
  }

  .face img {
    display: block;
    width: 100%;
    height: 100%;
  }

  .back {
    transform: rotateY(180deg);
  }

  .motto {
    color: var(--ink-muted);
    font-style: italic;
  }

  .sentence {
    color: var(--ink-muted);
  }

  /* The seal, stamped on each new name and gone again: gold, as the coin is. Only ever shown
     while it moves, so with motion off it never appears. */
  .seal {
    position: absolute;
    right: 0;
    top: calc(-1 * var(--space-3));
    display: grid;
    place-items: center;
    width: calc(2 * var(--size-target));
    height: calc(2 * var(--size-target));
    padding: var(--space-2);
    border: 2px dashed var(--on-highlight);
    border-radius: var(--radius-full);
    background: var(--highlight);
    color: var(--on-highlight);
    font: var(--type-note);
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    pointer-events: none;
    opacity: 0;
    animation: stamp 1.8s ease-out;
  }

  .flipping {
    animation: flip 0.8s cubic-bezier(0.3, 0.7, 0.4, 1);
  }

  .kicker:hover .flag :global(.eu-icon),
  .kicker:hover .flag img {
    animation: wave 0.6s ease-in-out;
    transform-origin: 10% 90%;
  }

  @keyframes flip {
    from {
      transform: rotateY(0) translateY(0);
    }
    40% {
      transform: rotateY(540deg) translateY(-10px);
    }
    to {
      transform: rotateY(720deg) translateY(0);
    }
  }

  @keyframes stamp {
    0% {
      opacity: 0;
      transform: scale(1.8) rotate(-30deg);
    }
    12% {
      opacity: 1;
      transform: scale(0.95) rotate(-14deg);
    }
    18% {
      transform: scale(1) rotate(-14deg);
    }
    75% {
      opacity: 1;
      transform: scale(1) rotate(-14deg);
    }
    100% {
      opacity: 0;
      transform: scale(1) rotate(-14deg);
    }
  }

  @keyframes settle {
    from {
      transform: translate(-50%, -8px) rotate(-30deg);
      opacity: 0;
    }
  }

  @keyframes wave {
    25% {
      transform: rotate(-12deg);
    }
    60% {
      transform: rotate(9deg);
    }
  }
</style>
