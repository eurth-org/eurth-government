<script lang="ts">
  import { onMount } from 'svelte';

  /*
   * The Eurth globe from eurth.org: a 240-frame strip, turned by one Web Animation whose speed
   * eases up and down, so it never jumps or freezes mid-turn. It turns for a few seconds when the
   * page opens and then winds down (nothing keeps moving: WCAG 2.2.2); pointing at the link or
   * button it sits in turns it again; and each time `spin` goes up it whirls fast for a while.
   */
  let { size = 36, spin = 0 }: { size?: number; spin?: number } = $props();
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let globe: HTMLSpanElement;
  let turning: Animation | undefined;

  // What wants it turning, and how fast; it eases towards the fastest of them.
  const wants = { opening: 0, pointer: 0, whirl: 0 };
  let speed = 0;
  let frame = 0;

  function want(key: keyof typeof wants, value: number) {
    wants[key] = value;
    if (!frame) frame = requestAnimationFrame(ease);
  }

  function ease() {
    frame = 0;
    if (!turning) return;
    const target = Math.max(wants.opening, wants.pointer, wants.whirl);
    speed += (target - speed) * 0.06;
    if (Math.abs(target - speed) < 0.01) speed = target;
    if (speed === 0) {
      turning.pause();
      return;
    }
    turning.playbackRate = speed;
    if (turning.playState !== 'running') turning.play();
    if (speed !== target) frame = requestAnimationFrame(ease);
  }

  onMount(() => {
    if (calm) return;
    turning = globe.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: `0 ${-size * 240}px` }], {
      duration: 9600,
      iterations: Infinity,
      easing: 'steps(240)',
    });
    turning.pause();
    speed = 0;

    // Point at (or tab to) the link or button around it to turn it.
    const host = globe.closest<HTMLElement>('a, button');
    const on = () => want('pointer', 1);
    const off = () => want('pointer', 0);
    host?.addEventListener('pointerenter', on);
    host?.addEventListener('pointerleave', off);
    host?.addEventListener('focus', on);
    host?.addEventListener('blur', off);

    want('opening', 1);
    const opening = setTimeout(() => want('opening', 0), 5000);
    return () => {
      clearTimeout(opening);
      cancelAnimationFrame(frame);
      host?.removeEventListener('pointerenter', on);
      host?.removeEventListener('pointerleave', off);
      host?.removeEventListener('focus', on);
      host?.removeEventListener('blur', off);
      turning?.cancel();
    };
  });

  $effect(() => {
    if (!spin || calm) return;
    want('whirl', 6);
    const timer = setTimeout(() => want('whirl', 0), 6000);
    return () => clearTimeout(timer);
  });
</script>

<span class="globe" bind:this={globe} style:--size="{size}px" aria-hidden="true"></span>

<style>
  .globe {
    display: block;
    flex: none;
    width: var(--size);
    height: var(--size);
    background: url('/eurth-globe-sprite.png') 0 0 / var(--size) auto no-repeat;
  }
</style>
