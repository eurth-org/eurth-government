<script lang="ts">
  import { calm } from '@eurth/style';
  import { onMount } from 'svelte';
  import Coin from './Coin.svelte';
  import { loadMints, mints } from './minted.svelte';

  // The Eurth coin, Governmint's own mark, and beside it how many countries have been minted
  // with Governmint: copied, shared or exported. Each time `spin` goes up (someone chose "The
  // whole world"), the coin spins.
  let { spin = 0 }: { spin?: number } = $props();

  onMount(loadMints);
  const shown = $derived(mints.count === undefined ? '' : mints.count.toLocaleString('en-GB'));
</script>

<p class="mints" title="Countries copied, shared or exported with Governmint so far">
  {#key mints.count}
    <span class:pop={mints.count !== undefined && !calm()}><Coin {spin} /></span>
  {/key}
  {#if mints.count !== undefined}
    <span><span class="eu-data">{shown}</span> {mints.count === 1 ? 'country' : 'countries'} minted</span>
  {/if}
</p>

<style>
  .mints {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--size-target);
    color: var(--ink-muted);
    font: var(--type-body-sm);
  }

  .mints > span {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-1);
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
