<script lang="ts">
  import { faArrowRight, faCrown, faDice, faFlag } from '@fortawesome/free-solid-svg-icons';
  import { onDestroy, untrack } from 'svelte';
  import type { Profile } from '../model/engine';
  import { sentence } from '../model/formats';
  import { motto } from '../model/motto';
  import Icon from './Icon.svelte';

  /**
   * The country's name card. New names are freshly minted: they type themselves out, a coin
   * flips and a seal stamps down. Monarchies get a crown on the flag, theocracies a halo, and a
   * real country its own flag. None of the movement happens for reduced motion. The dice beside
   * the name roll a random country; typing a real country's name offers its real government.
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

  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
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

<label class="kicker" for="country-name">
  <span class="flag" class:crowned={monarchy} class:haloed={theocracy}>
    {#if flag}
      <img src="/flags/{flag}.svg" alt="" width="18" height="18" />
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
    class="name-input"
    {placeholder}
    bind:value={name}
    onfocus={suggestNames}
    onblur={stopSuggesting}
  />
  <button class="btn btn-primary dice" data-click="tumble" aria-label="Roll a random country" data-tip="Roll a random country (R)" onclick={onrandom}>
    <Icon icon={faDice} />
  </button>
</div>
{#if real}
  <button class="real" onclick={onreal}>
    <img src="/flags/{real.flag}.svg" alt="" width="16" height="16" />
    <span>Real country: load its actual government</span>
    <span class="visually-hidden">({real.name})</span>
    <Icon icon={faArrowRight} />
  </button>
{/if}

<!-- The coin hangs beside the name, the motto and the summary, so all three share one edge.
     When a new name is longer or shorter, the card grows or shrinks smoothly instead of jumping. -->
<div class="card-size" style:height={cardHeight ? `${cardHeight + 14}px` : undefined}>
<div class="card" bind:clientHeight={cardHeight}>
  {#key minted}
    <span class="coin" class:flipping={minted > 0 && !calm} aria-hidden="true">
      <span class="face front">
        {#if flag}<img src="/flags/{flag}.svg" alt="" />{:else}<Icon icon={faFlag} />{/if}
      </span>
      <span class="face back"><img src="/apple-touch-icon.png" alt="" /></span>
    </span>
  {/key}
  <div class="title">
    <h2 class="government" aria-live="polite">
      {#key minted}
        <span class="minted" class:typing={minted > 0 && !calm}>{profile.name}</span>
      {/key}
    </h2>
    {#key minted}
      {#if minted > 0 && !calm}
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
    color: var(--ink-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .flag {
    position: relative;
    display: inline-flex;
    color: var(--accent-fill);
    font-size: 14px;
  }

  .flag img {
    width: 18px;
    height: 18px;
  }

  /* Easter eggs: a crown for monarchies, a halo for theocracies. */
  .crown {
    position: absolute;
    left: 50%;
    top: -9px;
    color: #e0a325;
    font-size: 9px;
    transform: translateX(-50%) rotate(-12deg);
  }

  .halo {
    position: absolute;
    left: 50%;
    top: -6px;
    width: 14px;
    height: 4px;
    border: 1.5px solid #e0a325;
    border-radius: 50%;
    transform: translateX(-50%);
    opacity: 0.85;
  }

  .crowned .halo {
    top: -13px;
  }

  /* The name field and the dice, joined into one control of one height. */
  .name-row {
    display: flex;
    margin: var(--space-1) 0 var(--space-3);
  }

  .name-input {
    flex: 1;
    min-width: 0;
    padding: 4px 8px;
    border: 1px solid var(--line-strong);
    border-right: 0;
    border-radius: var(--radius-control) 0 0 var(--radius-control);
    background: var(--surface);
    font-weight: 600;
  }

  .dice {
    padding: 0 12px;
    border-radius: 0 var(--radius-control) var(--radius-control) 0;
    font-size: 16px;
  }

  .dice:hover {
    transform: none;
  }

  /* Typed a real country's name: its real government is a click away. */
  .real {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: calc(-1 * var(--space-2)) 0 var(--space-3);
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent-text);
    font-size: 13px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }

  .real:hover {
    text-decoration: underline;
  }

  .real img {
    width: 16px;
    height: 16px;
  }

  /* The card's box: it clips the coin's hop and the seal, so they never widen the page, with
     14px of room above for both. */
  .card-size {
    margin-top: -14px;
    padding-top: 14px;
    overflow: clip;
  }

  @media (prefers-reduced-motion: no-preference) {
    .card-size {
      transition: height 0.3s ease;
    }
  }

  .card {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    column-gap: var(--space-2);
  }

  .card > :not(.coin) {
    grid-column: 2;
  }

  .title {
    position: relative;
  }

  .government {
    margin: 0;
    font-size: 24px;
    line-height: 1.25;
    min-height: 1.25em;
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

  /* A coin with the flag on one side and the yurt on the other, flipped once per new name. */
  .coin {
    position: relative;
    grid-column: 1;
    grid-row: 1 / span 3;
    align-self: start;
    width: 24px;
    height: 24px;
    margin-top: 3px;
    transform-style: preserve-3d;
  }

  .face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border: 2px solid #b8740f;
    border-radius: 50%;
    background: #f7c548;
    color: #7a4a00;
    font-size: 11px;
    backface-visibility: hidden;
  }

  .face img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .back {
    transform: rotateY(180deg);
  }

  .motto {
    margin: var(--space-1) 0 0;
    color: var(--ink-muted);
    font-style: italic;
  }

  .sentence {
    margin: var(--space-2) 0 0;
    color: var(--ink-muted);
  }

  .seal {
    position: absolute;
    right: 0;
    top: -12px;
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    padding: 6px;
    border: 2px dashed #b8740f;
    border-radius: 50%;
    background: rgb(247 197 72 / 0.92);
    color: #5a3600;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.1;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    pointer-events: none;
    opacity: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .flipping {
      animation: flip 0.8s cubic-bezier(0.3, 0.7, 0.4, 1);
    }

    .seal {
      animation: stamp 1.8s ease-out;
    }

    .crown {
      animation: settle 0.5s cubic-bezier(0.3, 1.6, 0.6, 1);
    }

    .halo {
      animation: glow 2.4s ease-in-out infinite alternate;
    }

    .kicker:hover .flag :global(.icon),
    .kicker:hover .flag img {
      animation: wave 0.6s ease-in-out;
      transform-origin: 10% 90%;
    }
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

  @keyframes glow {
    to {
      opacity: 0.4;
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
