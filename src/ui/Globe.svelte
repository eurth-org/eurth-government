<script lang="ts">
  import { onMount } from 'svelte';

  // The Eurth globe from eurth.org: a 240-frame strip that turns for a few seconds and then
  // rests, so nothing on the page keeps moving (WCAG 2.2.2). Hover or focus turns it again.
  let { size = 36 }: { size?: number } = $props();
  let spinning = $state(false);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    spinning = true;
    const timer = setTimeout(() => (spinning = false), 5000);
    return () => clearTimeout(timer);
  });
</script>

<a class="globe-link" href="https://eurth.org" aria-label="eurth.org" title="Eurth: a worldbuilding and roleplay writing community">
  <span class="globe" class:spinning style:--size="{size}px" aria-hidden="true"></span>
</a>

<style>
  .globe-link {
    display: inline-flex;
    border-radius: 50%;
  }

  .globe {
    display: block;
    width: var(--size);
    height: var(--size);
    background: url('/eurth-globe-sprite.png') 0 0 / var(--size) auto no-repeat;
    animation: turn 9.6s steps(240) infinite paused;
  }

  .spinning,
  .globe-link:hover .globe,
  .globe-link:focus-visible .globe {
    animation-play-state: running;
  }

  @keyframes turn {
    to {
      background-position: 0 calc(var(--size) * -240);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .globe {
      animation: none;
    }
  }
</style>
