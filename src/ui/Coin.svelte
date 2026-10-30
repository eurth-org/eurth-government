<script lang="ts">
  import { onMount } from 'svelte';
  import coin from '../assets/eurth-coin.svg';

  /*
   * The Eurth coin as Governmint's logo. It flips once when the page opens and whenever the link or
   * button it sits in is pointed at or focused; each time `spin` goes up (someone chose "The whole
   * world"), it spins five times. Every turn is short, and none happen for reduced motion.
   */
  let { size = 36, spin = 0 }: { size?: number; spin?: number } = $props();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let image: HTMLImageElement;

  function flip(turns = 1, duration = 900) {
    if (calm || !image) return;
    for (const animation of image.getAnimations()) animation.cancel();
    image.animate(
      [{ transform: 'perspective(400px) rotateY(0)' }, { transform: `perspective(400px) rotateY(${360 * turns}deg)` }],
      { duration, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' },
    );
  }

  onMount(() => {
    flip();
    const host = image.closest<HTMLElement>('a, button');
    const again = () => flip();
    host?.addEventListener('pointerenter', again);
    host?.addEventListener('focus', again);
    return () => {
      host?.removeEventListener('pointerenter', again);
      host?.removeEventListener('focus', again);
    };
  });

  $effect(() => {
    if (spin) flip(5, 2000);
  });
</script>

<img class="coin" bind:this={image} src={coin} alt="" width={size} height={size} />

<style>
  .coin {
    display: block;
    flex: none;
  }
</style>
