<script lang="ts">
  import coin from '../assets/eurth-coin.svg';
  import { loadMints, mints } from './minted.svelte';

  // How many countries have been minted with Governmint: saved, shared or exported.
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  loadMints();
  const shown = $derived(mints.count === undefined ? '' : mints.count.toLocaleString('en-GB'));
</script>

{#if mints.count !== undefined}
  <span class="mints" title="Countries saved, shared or exported with Governmint so far">
    {#key mints.count}
      <img class:pop={!calm} src={coin} alt="" width="16" height="16" />
    {/key}
    {shown} {mints.count === 1 ? 'country' : 'countries'} minted
  </span>
{/if}

<style>
  .mints {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ink-muted);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  /* A new mint: the coin pops. */
  .pop {
    animation: pop 0.4s cubic-bezier(0.3, 1.6, 0.6, 1);
  }

  @keyframes pop {
    from {
      transform: scale(0.4) rotateY(180deg);
    }
  }
</style>
