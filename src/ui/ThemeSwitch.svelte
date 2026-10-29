<script lang="ts">
  /*
   * Light and dark, after Deluminator (github.com/stijn/deluminator) as used in eurth-news:
   * going dark, the lit page shrinks into the switch; going light, it grows back out.
   * The visitor's choice is remembered; until they choose, the page follows the system.
   * The head script in index.html sets the theme before the page paints.
   */
  import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';

  const key = 'governmint:theme';
  const chrome = { light: '#ffffff', dark: '#002b36' };

  // Sun and moon from Deluminator (line-md by Vjacheslav Trushkin, MIT): they draw themselves
  // on each switch, then the sun's rays turn slowly and the stars twinkle. Visitors who prefer
  // reduced motion get still icons.
  const sun =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="34" stroke-dashoffset="34" d="M12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="34;0"/></path><g stroke-dasharray="2" stroke-dashoffset="2"><path d="M0 0"><animate fill="freeze" attributeName="d" begin="0.5s" dur="0.2s" values="M12 19v1M19 12h1M12 5v-1M5 12h-1;M12 21v1M21 12h1M12 3v-1M3 12h-1"/><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.2s" values="2;0"/></path><path d="M0 0"><animate fill="freeze" attributeName="d" begin="0.7s" dur="0.2s" values="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5;M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"/><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" values="2;0"/></path><animateTransform attributeName="transform" dur="30s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></g></g></svg>';
  const moon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><g stroke-dasharray="2"><path d="M12 21v1M21 12h1M12 3v-1M3 12h-1"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="4;2"/></path><path d="M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.2s" dur="0.2s" values="4;2"/></path></g><path d="M7 6 C7 12.08 11.92 17 18 17 C18.53 17 19.05 16.96 19.56 16.89 C17.95 19.36 15.17 21 12 21 C7.03 21 3 16.97 3 12 C3 8.83 4.64 6.05 7.11 4.44 C7.04 4.95 7 5.47 7 6 Z" opacity="0"><set attributeName="opacity" begin="0.5s" to="1"/></path></g><g fill="currentColor" fill-opacity="0"><path d="m15.22 6.03l2.53-1.94L14.56 4L13.5 1l-1.06 3l-3.19.09l2.53 1.94l-.91 3.06l2.63-1.81l2.63 1.81z"><animate id="deluminatorStars0" fill="freeze" attributeName="fill-opacity" begin="0.6s;deluminatorStars0.begin+6s" dur="0.4s" values="0;1"/><animate fill="freeze" attributeName="fill-opacity" begin="deluminatorStars0.begin+2.2s" dur="0.4s" values="1;0"/></path><path d="M13.61 5.25L15.25 4l-2.06-.05L12.5 2l-.69 1.95L9.75 4l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z"><animate fill="freeze" attributeName="fill-opacity" begin="deluminatorStars0.begin+3s" dur="0.4s" values="0;1"/><animate fill="freeze" attributeName="fill-opacity" begin="deluminatorStars0.begin+5.2s" dur="0.4s" values="1;0"/></path><path d="M19.61 12.25L21.25 11l-2.06-.05L18.5 9l-.69 1.95l-2.06.05l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z"><animate fill="freeze" attributeName="fill-opacity" begin="deluminatorStars0.begin+0.4s" dur="0.4s" values="0;1"/><animate fill="freeze" attributeName="fill-opacity" begin="deluminatorStars0.begin+2.8s" dur="0.4s" values="1;0"/></path><path d="m20.828 9.731l1.876-1.439l-2.366-.067L19.552 6l-.786 2.225l-2.366.067l1.876 1.439L17.601 12l1.951-1.342L21.503 12z"><animate fill="freeze" attributeName="fill-opacity" begin="deluminatorStars0.begin+3.4s" dur="0.4s" values="0;1"/><animate fill="freeze" attributeName="fill-opacity" begin="deluminatorStars0.begin+5.6s" dur="0.4s" values="1;0"/></path></g><mask id="deluminatorMoonMask"><circle cx="12" cy="12" r="12" fill="#fff"/><circle cx="12" cy="12" r="4"><animate fill="freeze" attributeName="r" begin="0.1s" dur="0.4s" values="4;8"/></circle><circle cx="22" cy="2" r="3" fill="#fff"><animate fill="freeze" attributeName="cx" begin="0.1s" dur="0.4s" values="22;18"/><animate fill="freeze" attributeName="cy" begin="0.1s" dur="0.4s" values="2;6"/><animate fill="freeze" attributeName="r" begin="0.1s" dur="0.4s" values="3;12"/></circle><circle cx="22" cy="2" r="1"><animate fill="freeze" attributeName="cx" begin="0.1s" dur="0.4s" values="22;18"/><animate fill="freeze" attributeName="cy" begin="0.1s" dur="0.4s" values="2;6"/><animate fill="freeze" attributeName="r" begin="0.1s" dur="0.4s" values="1;10"/></circle></mask><circle cx="12" cy="12" r="6" fill="currentColor" mask="url(#deluminatorMoonMask)"><set attributeName="opacity" begin="0.5s" to="0"/><animate fill="freeze" attributeName="r" begin="0.1s" dur="0.4s" values="6;10"/></circle></svg>';

  const root = document.documentElement;
  let dark = $state(root.dataset.theme === 'dark');
  // Pointing at the switch draws its icon again.
  let drawn = $state(0);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let button: HTMLButtonElement;

  function stored(): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function paint(next: boolean) {
    dark = next;
    root.dataset.theme = next ? 'dark' : 'light';
    document.getElementById('theme-color')?.setAttribute('content', next ? chrome.dark : chrome.light);
  }

  function stillMotion(): boolean {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function toggle(event: MouseEvent) {
    const next = !dark;
    try {
      localStorage.setItem(key, next ? 'dark' : 'light');
    } catch {
      // Private mode: the switch still works for this visit.
    }
    if (!document.startViewTransition || stillMotion()) {
      paint(next);
      return;
    }
    // Keyboard activation reports 0,0: start from the middle of the switch instead.
    const r = button.getBoundingClientRect();
    const x = event.clientX || r.left + r.width / 2;
    const y = event.clientY || r.top + r.height / 2;
    const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const grow = !next;
    root.classList.add(grow ? 'vt-grow' : 'vt-shrink');
    const transition = document.startViewTransition(() => paint(next));
    transition.ready
      .then(() => {
        const dot = `circle(0px at ${x}px ${y}px)`;
        const all = `circle(${far}px at ${x}px ${y}px)`;
        root.animate(
          { clipPath: grow ? [dot, all] : [all, dot] },
          {
            duration: 500,
            easing: grow ? 'cubic-bezier(.25,.55,.45,1)' : 'cubic-bezier(.55,0,.75,.45)',
            // Hold the last frame: without it the old page shows again for a moment before the
            // transition ends, a white flash when going dark.
            fill: 'forwards',
            pseudoElement: grow ? '::view-transition-new(root)' : '::view-transition-old(root)',
          },
        );
      })
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove('vt-grow', 'vt-shrink'));
  }

  onMount(() => {
    const system = matchMedia('(prefers-color-scheme: dark)');
    const follow = (e: MediaQueryListEvent) => {
      if (stored() === null) paint(e.matches);
    };
    const sync = (e: StorageEvent) => {
      if (e.key === key && (e.newValue === 'dark' || e.newValue === 'light')) paint(e.newValue === 'dark');
    };
    system.addEventListener('change', follow);
    addEventListener('storage', sync);
    return () => {
      system.removeEventListener('change', follow);
      removeEventListener('storage', sync);
    };
  });
</script>

<button
  bind:this={button}
  class="btn switch"
  aria-pressed={dark}
  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
  title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
  onclick={toggle}
  onpointerenter={() => (drawn += 1)}
>
  {#if still}
    <Icon icon={dark ? faMoon : faSun} />
  {:else}
    {#key `${dark}-${drawn}`}
      <!-- A fresh copy replays the drawing animation. -->
      {@html dark ? moon : sun}
    {/key}
  {/if}
</button>

<style>
  .switch {
    justify-content: center;
    width: 38px;
    height: 34px;
    padding: 0;
  }

  .switch :global(svg) {
    width: 20px;
    height: 20px;
  }
</style>
