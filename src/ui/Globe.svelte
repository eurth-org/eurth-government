<script lang="ts">
  import { onMount } from 'svelte';

  // The Eurth globe from eurth.org: a 240-frame strip that turns for a few seconds and then
  // rests, so nothing on the page keeps moving (WCAG 2.2.2). Pointing at the link it sits in
  // turns it again. Each time `spin` goes up, it whirls fast for a few seconds.
  let { size = 36, spin = 0 }: { size?: number; spin?: number } = $props();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let spinning = $state(false);
  let whirling = $state(false);

  onMount(() => {
    if (calm) return;
    spinning = true;
    const timer = setTimeout(() => (spinning = false), 5000);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    if (!spin || calm) return;
    whirling = true;
    const timer = setTimeout(() => (whirling = false), 6000);
    return () => clearTimeout(timer);
  });
</script>

<span class="globe" class:spinning class:whirling style:--size="{size}px" aria-hidden="true"></span>

<style>
  .globe {
    display: block;
    flex: none;
    width: var(--size);
    height: var(--size);
    background: url('/eurth-globe-sprite.png') 0 0 / var(--size) auto no-repeat;
    animation: turn 9.6s steps(240) infinite paused;
  }

  .spinning,
  .whirling,
  :global(a:hover) > .globe,
  :global(a:focus-visible) > .globe {
    animation-play-state: running;
  }

  .whirling {
    animation-duration: 1.6s;
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
