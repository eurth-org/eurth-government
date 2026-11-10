<script lang="ts">
  import { faSignal } from '@fortawesome/free-solid-svg-icons';
  import { onMount } from 'svelte';
  import { toast } from './fun';
  import Icon from './Icon.svelte';

  // Without signal, a note says Governmint still works: it runs from the copy the service worker
  // keeps on the device (src/offline/sw.js). Back online, the note goes, with a word to say so.
  let online = $state(navigator.onLine);

  onMount(() => {
    const up = () => {
      online = true;
      toast('Back online.');
    };
    const down = () => (online = false);
    addEventListener('online', up);
    addEventListener('offline', down);
    return () => {
      removeEventListener('online', up);
      removeEventListener('offline', down);
    };
  });
</script>

{#if !online}
  <p class="offline" role="status">
    <Icon icon={faSignal} /> No signal: Governmint keeps working from the copy on this device.
  </p>
{/if}

<style>
  .offline {
    position: fixed;
    left: var(--space-4);
    bottom: var(--space-4);
    z-index: 55;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    max-width: calc(100vw - 2 * var(--space-4));
    margin: 0;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-control);
    background: var(--ink);
    color: var(--surface);
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgb(0 0 0 / 0.25);
  }
</style>
