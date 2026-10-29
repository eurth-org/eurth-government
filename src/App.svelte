<script lang="ts">
  import { faGithub, faWikipediaW } from '@fortawesome/free-brands-svg-icons';
  import {
    faArrowUpRightFromSquare,
    faBookOpen,
    faCircleInfo,
    faCodeBranch,
    faDice,
    faFloppyDisk,
    faHeart,
    faKeyboard,
    faLightbulb,
    faRedo,
    faRotateLeft,
    faShareNodes,
    faUndo,
    faUserShield,
    faVolumeHigh,
    faVolumeXmark,
  } from '@fortawesome/free-solid-svg-icons';
  import { tick, untrack } from 'svelte';
  import { slide } from 'svelte/transition';
  import yurt from './assets/eurth-yurt-circle.svg';
  import { defaultCountry, describe } from './model/engine';
  import { randomCountry } from './model/random';
  import { decodeCountry, encodeCountry } from './model/link';
  import { familyLabels, type Family } from './model/naming';
  import { settings, type Country, type SettingId } from './model/settings';
  import type { SettingDef } from './model/types';
  import Budget from './ui/Budget.svelte';
  import Compass from './ui/Compass.svelte';
  import Field from './ui/Field.svelte';
  import { clink, setSound, soundOn, toast } from './ui/fun';
  import Globe from './ui/Globe.svelte';
  import Headline from './ui/Headline.svelte';
  import NameCard from './ui/NameCard.svelte';
  import { save } from './ui/saved';
  import Shortcuts from './ui/Shortcuts.svelte';
  import Icon from './ui/Icon.svelte';
  import { groupIcons, groupSwatches, panelIcons, ruleIcon, severityIcons } from './ui/icons';
  import Picker from './ui/Picker.svelte';
  import { ref, wikipedia } from './ui/ref';
  import Radar from './ui/Radar.svelte';
  import Scales from './ui/Scales.svelte';
  import SectionNav from './ui/SectionNav.svelte';
  import Share from './ui/Share.svelte';
  import ThemeSwitch from './ui/ThemeSwitch.svelte';

  const defs = settings as readonly SettingDef[];
  const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, '-');
  const groups = [...new Set(defs.map((d) => d.group))].map((name) => ({
    id: slug(name),
    name,
    icon: groupIcons[name]!,
    swatch: groupSwatches[name]!,
    defs: defs.filter((d) => d.group === name),
  }));
  const familyOrder: Family[] = ['structure', 'system', 'form', 'regime', 'rulers'];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const params = new URLSearchParams(location.search);
  let country = $state<Country>(params.get('c') ? decodeCountry(params.get('c')!) : defaultCountry());
  let name = $state(params.get('n') ?? '');
  // A real country's flag (its ISO code), shown on the name card and kept in the link.
  let flag = $state<string | undefined>(/^[a-z]{2}$/.test(params.get('f') ?? '') ? params.get('f')! : undefined);
  // The flag belongs to the country's name: rename the country and the flag goes.
  let flagFor = untrack(() => name);
  $effect(() => {
    if (flag && name !== flagFor) flag = undefined;
  });
  const profile = $derived(describe(country));
  const shownName = $derived(name.trim() || 'Your country');
  const code = $derived(encodeCountry(country));

  const link = $derived.by(() => {
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set('c', code);
    if (name.trim()) url.searchParams.set('n', name.trim());
    if (flag) url.searchParams.set('f', flag);
    return url.toString();
  });

  $effect(() => {
    history.replaceState(null, '', link);
  });

  // The country as it was loaded, picked or rolled: the budget can go back to it.
  let baseline = $state<Country>(untrack(() => $state.snapshot(country) as Country));

  // Undo and redo, for every change to the settings, the name and the flag. Quick runs of changes
  // (a slider being dragged, a name being typed) count as one.
  const snapshot = $derived(JSON.stringify([code, name, flag ?? null]));
  let past = $state<string[]>([]);
  let future = $state<string[]>([]);
  let recorded = $state(untrack(() => snapshot));
  let replaying = false;
  let settle: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    const now = snapshot;
    if (replaying) {
      replaying = false;
      recorded = now;
      return;
    }
    clearTimeout(settle);
    settle = setTimeout(() => {
      if (now === recorded) return;
      past = [...past.slice(-99), recorded];
      future = [];
      recorded = now;
    }, 400);
  });

  const canUndo = $derived(past.length > 0 || snapshot !== recorded);

  function restore(saved: string) {
    const [savedCode, savedName, savedFlag] = JSON.parse(saved) as [string, string, string | null];
    replaying = true;
    country = decodeCountry(savedCode);
    name = savedName;
    flagFor = savedName;
    flag = savedFlag ?? undefined;
  }

  function undo() {
    clearTimeout(settle);
    if (snapshot !== recorded) {
      // A change that's still settling is undone first.
      future = [snapshot, ...future];
      restore(recorded);
      return;
    }
    const previous = past.at(-1);
    if (!previous) return;
    past = past.slice(0, -1);
    future = [snapshot, ...future];
    restore(previous);
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    clearTimeout(settle);
    future = future.slice(1);
    past = [...past, snapshot];
    restore(next);
  }

  let pickerOpen = $state(false);
  let current = $state(groups[0]!.id);
  let flashing = $state<SettingId[]>([]);
  let flashTimer: ReturnType<typeof setTimeout> | undefined;

  function setValue(id: string, value: string | string[]) {
    (country as unknown as Record<string, string | string[]>)[id] = value;
  }

  /** Draws attention to settings: they flash, and the first is scrolled into view if asked. */
  async function flash(ids: SettingId[], scroll: boolean) {
    flashing = [];
    await tick();
    flashing = ids;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flashing = []), 3000);
    if (scroll && ids[0]) {
      document.getElementById(`field-${ids[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Search works like find-in-page: every match stays highlighted while the search box has
  // text, and the visitor steps through them one at a time.
  let hits = $state<SettingId[]>([]);
  let hit = $state(0);
  const hitCounts = $derived(
    Object.fromEntries(groups.map((g) => [g.id, g.defs.filter((d) => hits.includes(d.id as SettingId)).length])),
  );

  function search(query: string) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    hits = words.length
      ? defs
          .filter((d) => {
            const text = [d.label, d.question, d.group, d.kind === 'share' ? d.help : '', ...d.options.flatMap((o) => [o.label, o.help])]
              .join(' ')
              .toLowerCase();
            return words.every((w) => text.includes(w));
          })
          .map((d) => d.id as SettingId)
      : [];
    hit = 0;
    showHit();
  }

  function step(direction: 1 | -1) {
    if (!hits.length) return;
    hit = (hit + direction + hits.length) % hits.length;
    showHit();
  }

  function showHit() {
    const id = hits[hit];
    if (id) document.getElementById(`field-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Which section is under the sticky bar, so the bar can show where you are.
  $effect(() => {
    const narrow = matchMedia('(max-width: 899px)');
    const update = () => {
      // On wide screens the results sit beside the settings, so only the settings sections count.
      const ids = [...groups.map((g) => g.id), ...(narrow.matches ? ['results'] : [])];
      const line = 120;
      let found = ids[0]!;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line && el.offsetParent !== null) found = id;
      }
      current = found;
    };
    addEventListener('scroll', update, { passive: true });
    update();
    return () => removeEventListener('scroll', update);
  });

  function load(next: Country, countryName: string, countryFlag?: string) {
    country = next;
    name = countryName;
    flagFor = countryName;
    flag = countryFlag;
    baseline = $state.snapshot(next) as Country;
  }

  const fictional = ['Ruritania', 'Freedonia', 'Grand Fenwick', 'Elbonia', 'Genovia', 'Borduria', 'Kreplachistan', 'Molvania'];
  function random() {
    load(randomCountry(), fictional[Math.floor(Math.random() * fictional.length)]!);
  }

  function reset() {
    load(defaultCountry(), '');
  }

  // Save: kept on this device, and the link copied, since the link is what travels.
  async function saveCountry() {
    save({ name: shownName, code, flag, government: profile.name, at: new Date().toISOString() });
    try {
      await navigator.clipboard.writeText(link);
      toast('Saved on this device, and the link is copied.');
    } catch {
      toast('Saved on this device.');
    }
    clink();
  }

  let sound = $state(soundOn());
  function toggleSound() {
    sound = !sound;
    setSound(sound);
    if (sound) clink();
  }

  // Easter egg: choosing "The whole world" sets the globe spinning faster for a while.
  let worldSpin = $state(0);
  let lastExtent = untrack(() => country.extent);
  $effect(() => {
    if (country.extent === 'world' && lastExtent !== 'world') worldSpin += 1;
    lastExtent = country.extent;
  });

  // The footer yurt follows Eurth's seasonal avatars.
  function seasonalYurt(now = new Date()): string {
    const month = now.getMonth() + 1;
    const day = now.getDate();
    if (month === 2) return '/yurt/valentines.gif';
    if (month === 4 && day >= 16 && day <= 22) return '/yurt/earth-day.svg';
    if (month === 6) return '/yurt/pride.svg';
    if (month === 10) return '/yurt/halloween.png';
    if (month === 12) return '/yurt/december.gif';
    return yurt;
  }
  const footerYurt = seasonalYurt();

  // Keyboard shortcuts, listed with "?". They stay quiet while you type in a field.
  let shortcutsOpen = $state(false);
  function keys(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const typing = target.matches('input, textarea, select, [contenteditable]');
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.key.toLowerCase() === 'z' && !typing) {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if (typing || mod || event.altKey || document.querySelector('dialog[open]')) return;
    const sectionIds = groups.map((g) => g.id);
    const at = sectionIds.indexOf(current);
    switch (event.key) {
      case '/':
        event.preventDefault();
        document.getElementById('setting-search')?.focus();
        break;
      case '?':
        shortcutsOpen = true;
        break;
      case 'e':
      case 'E':
        pickerOpen = true;
        break;
      case 'r':
      case 'R':
        random();
        break;
      case 's':
      case 'S':
        saveCountry();
        break;
      case '[':
      case ']': {
        const next = sectionIds[Math.max(0, Math.min(sectionIds.length - 1, at + (event.key === ']' ? 1 : -1)))];
        if (next) document.getElementById(next)?.scrollIntoView({ block: 'start' });
        break;
      }
    }
  }
</script>

<svelte:window onkeydown={keys} />

<div class="topbar">
  <div class="bar">
    <nav aria-label="Links">
      <a href="#about"><Icon icon={faCircleInfo} /> About</a>
      <a href={ref('https://github.com/eurth-org/eurth-government')}><Icon icon={faGithub} /> GitHub</a>
      <a href={ref('https://eurth.org')}><Icon icon={faArrowUpRightFromSquare} /> Eurth.org</a>
    </nav>
  </div>
</div>

<header class="header">
  <div class="bar">
    <div class="brand">
      <!-- Like any site's logo, this one goes home: a fresh, default country. -->
      <a class="home" href="/" title="Governmint: start afresh">
        <Globe spin={worldSpin} />
        <span class="title">Governmint</span>
      </a>
      <span class="tagline">Freshly minted governments</span>
      <span class="badge">Preview</span>
    </div>
    <div class="actions">
      <button class="btn" onclick={() => (pickerOpen = true)} title="Start from an example or a real country (E)">
        <Icon icon={faBookOpen} /> Examples &amp; countries
      </button>
      <button class="btn" data-click="tumble" onclick={random} title="Roll a random country (R)">
        <Icon icon={faDice} /> Random
      </button>
      <button class="btn btn-primary" data-click="bounce" onclick={saveCountry} title="Save on this device and copy the link (S)">
        <Icon icon={faFloppyDisk} /> Save
      </button>
      <span class="history">
        <button class="btn icon-only" data-click="swing-left" onclick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (⌘Z)">
          <Icon icon={faUndo} />
        </button>
        <button class="btn icon-only" data-click="swing-right" onclick={redo} disabled={!future.length} aria-label="Redo" title="Redo (⇧⌘Z)">
          <Icon icon={faRedo} />
        </button>
      </span>
      <button class="btn reset" data-click="spin-back" onclick={reset} title="Back to the default country">
        <Icon icon={faRotateLeft} /> Reset
      </button>
      <ThemeSwitch />
    </div>
  </div>
</header>

<SectionNav
  sections={groups}
  {current}
  name={profile.name}
  {hitCounts}
  hitCount={hits.length}
  {hit}
  onsearch={search}
  onstep={step}
/>

<div class="layout">
  <main class="settings">
    {#each groups as group (group.id)}
      <section class="panel" id={group.id} aria-labelledby="{group.id}-title">
        <h2 id="{group.id}-title">
          <span class="group-icon" style:color={group.swatch}><Icon icon={group.icon} /></span>
          {group.name}
        </h2>
        {#if group.name === 'Budget'}
          <Budget
            {country}
            {baseline}
            {flashing}
            {hits}
            currentHit={hits[hit]}
            name={shownName}
            onchange={(next) => (country = next)}
          />
        {:else}
          {#each group.defs as def (def.id)}
            <Field
              {def}
              value={country[def.id as SettingId] as string | string[]}
              flash={flashing.includes(def.id as SettingId)}
              matched={hits.includes(def.id as SettingId)}
              current={hits[hit] === def.id}
              onchange={(value) => setValue(def.id, value)}
            />
          {/each}
        {/if}
      </section>
    {/each}
  </main>

  <aside class="results" id="results">
    <section class="panel summary">
      <NameCard bind:name {profile} seed={code} {flag} />
    </section>

    {#if profile.checks.length}
      <section class="panel" aria-labelledby="checks-title" transition:slide={{ duration: calm ? 0 : 250 }}>
        <h2 id="checks-title"><Icon icon={panelIcons.checks} /> Worth a second look</h2>
        <ul class="checks">
          {#each profile.checks as check (check.id)}
            <li class={check.severity} transition:slide={{ duration: calm ? 0 : 200 }}>
              <span class="severity">
                <Icon icon={severityIcons[check.severity]} />
                {check.severity === 'conflict' ? 'Contradiction' : 'Unusual'}
              </span>
              {check.message}
              <button class="link" onclick={() => flash(check.dependsOn, true)}>Show settings</button>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <section class="panel" aria-labelledby="why-title">
      <h2 id="why-title"><Icon icon={panelIcons.why} /> Why this name</h2>
      <ul class="labels">
        {#each familyOrder as family (family)}
          {@const label = profile.labels[family]}
          <li>
            <span class="label-icon"><Icon icon={ruleIcon(family, label.rule)} /></span>
            <div>
              <p class="label-title">
                {familyLabels[family]}:
                <a class="wiki" href={wikipedia(label.wiki)} target="_blank" rel="noopener" title="{label.wiki} on Wikipedia">
                  <strong>{label.label}</strong>
                </a>
              </p>
              <p class="because">{label.because}</p>
              <p class="label-links">
                <button class="link" onclick={() => flash(label.dependsOn, true)}>
                  Based on: {label.dependsOn.map((id) => defs.find((d) => d.id === id)?.label ?? id).join(', ')}
                </button>
              </p>
            </div>
          </li>
        {/each}
      </ul>
    </section>

    <section class="panel" aria-labelledby="scales-title">
      <h2 id="scales-title"><Icon icon={panelIcons.scales} /> Scales</h2>
      <p class="intro">Each scale runs from 0% to 100%. Drag one to see which settings move it.</p>
      <Scales scores={profile.axes} {country} onapply={(next) => (country = next)} onflash={flash} />
    </section>

    <section class="panel" aria-labelledby="radar-title">
      <h2 id="radar-title"><Icon icon={panelIcons.radar} /> Shape</h2>
      <Radar scores={profile.axes} name={shownName} />
    </section>

    <section class="panel" aria-labelledby="compass-title">
      <h2 id="compass-title"><Icon icon={panelIcons.compass} /> Compass</h2>
      <Compass scores={profile.axes} name={shownName} />
    </section>

    <section class="panel" aria-labelledby="share-title">
      <h2 id="share-title">
        <span title="The share icon, designed by the late, great Alex King"><Icon icon={faShareNodes} /></span>
        Save &amp; share
      </h2>
      <Share name={shownName} {country} {profile} {link} onsave={saveCountry} />
    </section>
  </aside>
</div>

<footer id="about">
  <h2>About Governmint</h2>
  <ul class="about">
    <li>
      <span class="about-icon"><Icon icon={faCircleInfo} /></span>
      <p>
        Set up a country and Governmint names the kind of state you've made, explains why, and points out where the
        settings contradict each other. This preview covers government and the budget; the economy and law come next.
      </p>
    </li>
    <li>
      <span class="about-icon"><Icon icon={faUserShield} /></span>
      <p>
        A country lives in its link: copy it to share it or come back later. Save keeps a list on this device too, in
        your browser; nothing is stored anywhere else.
      </p>
    </li>
    <li>
      <span class="about-icon"><img src={footerYurt} alt="" width="18" height="18" /></span>
      <p>
        <a href={ref('https://eurth.org')}>Made by Eurth, a Worldbuilding &amp; Roleplay Writing Community</a>. Built
        a country you like? Give it a world to live in.
      </p>
    </li>
    <Headline />
    <li>
      <span class="about-icon heart beat"><Icon icon={faHeart} /></span>
      <p>
        Made with love by <a href={ref('https://iiwiki.com/w/Orioni')}>Orioni</a>, for Eurth and the people who live
        in it, going strong since 2004. Thanks to <a href={ref('https://www.nationstates.net')}>NationStates</a>,
        where Eurth's worldbuilding began.
      </p>
    </li>
    <li>
      <span class="about-icon"><Icon icon={faShareNodes} /></span>
      <p>
        The share icon was designed by the late, great <a href={ref('https://alexking.org')}>Alex King</a>. We never
        met him, but his work shaped how the web shares things, and how Orioni thinks about design.
        <span class="heart"><Icon icon={faHeart} label="love" /></span>
      </p>
    </li>
    <li>
      <span class="about-icon"><Icon icon={faLightbulb} /></span>
      <p>
        Fellow worldbuilder?
        <a href={ref('https://github.com/eurth-org/eurth-government/discussions/categories/ideas')}>Table a motion for the roadmap</a>
        on GitHub. No quorum required.
      </p>
    </li>
    <li>
      <span class="about-icon"><Icon icon={faWikipediaW} /></span>
      <p>
        Every label links to <a href={ref('https://en.wikipedia.org')}>Wikipedia</a> for the full story. Thank you,
        Wikipedia <span class="heart"><Icon icon={faHeart} label="love" /></span>
      </p>
    </li>
    <li>
      <span class="about-icon"><Icon icon={faKeyboard} /></span>
      <p>
        Prefer the keyboard? <button class="link" onclick={() => (shortcutsOpen = true)}>Press ? for the shortcuts</button>.
        And for a little sound when coins change hands:
        <button class="link sound" aria-pressed={sound} onclick={toggleSound}>
          <Icon icon={sound ? faVolumeHigh : faVolumeXmark} /> Sound: {sound ? 'on' : 'off'}
        </button>
      </p>
    </li>
    <li>
      <span class="about-icon"><Icon icon={faCodeBranch} /></span>
      <p>
        Inspired by the
        <a href={ref('https://minkinfin.github.io/Filteries-Political-Simulator-Archive/')}>Filteries Political Simulator</a>
        (2016–2018). Icons by <a href={ref('https://fontawesome.com')}>Font Awesome</a> (CC BY 4.0) and
        <a href={ref('https://github.com/cyberalien/line-md')}>line-md</a> (MIT); flags by
        <a href={ref('https://github.com/jdecked/twemoji')}>Twemoji</a> (CC BY 4.0). Open source under the
        <a href={ref('https://github.com/eurth-org/eurth-government/blob/main/LICENSE')}>Apache 2.0 licence</a>.
      </p>
    </li>
  </ul>
</footer>

<Picker open={pickerOpen} onpick={load} onclose={() => (pickerOpen = false)} />
<Shortcuts open={shortcutsOpen} onclose={() => (shortcutsOpen = false)} />

<style>
  /* Top bar and header, as on eurth.org. The bar is Eurth blue; its links are white pills with
     Eurth blue text, so the bar stays two colours (a brand exception in contrast.test.ts). */
  .topbar {
    background: var(--eurth-blue);
    padding: 0 var(--space-4);
  }

  /* On wide screens, the bars' contents line up with the page below instead of the screen's edges. */
  .bar {
    max-width: calc(1200px - 2 * var(--space-4));
    margin: 0 auto;
  }

  .topbar .bar {
    min-height: 40px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .topbar nav {
    display: flex;
    gap: var(--space-2);
  }

  .topbar a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: var(--radius-control);
    background: #ffffff;
    color: var(--eurth-blue);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition:
      box-shadow 0.15s,
      transform 0.15s;
  }

  .topbar a:hover {
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
    transform: translateY(-1px);
  }

  .topbar a:focus-visible {
    outline-color: #ffffff;
  }

  @media (prefers-reduced-motion: reduce) {
    .topbar a {
      transition: none;
    }

    .topbar a:hover {
      transform: none;
    }
  }

  .header {
    background: var(--header);
    padding: var(--space-2) var(--space-4);
  }

  .header .bar {
    min-height: 56px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
  }

  .brand,
  .home {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .home {
    color: inherit;
    text-decoration: none;
    border-radius: var(--radius-control);
  }

  .title {
    font-size: 22px;
    font-weight: 700;
  }

  .tagline {
    color: var(--ink-muted);
    font-size: 14px;
  }

  .badge {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-muted);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-sm);
    padding: 0 6px;
  }

  @media (max-width: 640px) {
    .tagline {
      display: none;
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .history {
    display: inline-flex;
    gap: 2px;
  }

  .icon-only {
    padding: 6px 9px;
  }

  .actions .btn:disabled {
    opacity: 0.45;
    cursor: default;
    box-shadow: none;
    transform: none;
  }

  .actions .btn:disabled:hover {
    background: var(--button);
    border-color: transparent;
  }

  /* Layout */
  .layout {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-4);
    display: grid;
    gap: var(--space-4);
  }

  @media (min-width: 900px) {
    .layout {
      grid-template-columns: minmax(0, 1fr) 420px;
      align-items: start;
    }

    /* The name stays in view beside whichever settings you're changing; the rest scrolls. */
    .summary {
      position: sticky;
      top: calc(var(--nav-height) + var(--space-3));
      z-index: 1;
      box-shadow: 0 0 0 var(--space-3) var(--surface);
    }
  }

  .settings,
  .results {
    display: grid;
    gap: var(--space-4);
  }

  .panel {
    background: var(--surface-raised);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    padding: var(--space-4);
  }

  h2 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0 0 var(--space-3);
    font-size: 16px;
  }


  .group-icon {
    display: inline-flex;
  }

  @media (prefers-reduced-motion: no-preference) {
    /* The reset arrow winds back when you point at it, the heart beats. */
    .reset :global(.icon) {
      transition: transform 0.4s ease-out;
    }

    .reset:hover :global(.icon) {
      transform: rotate(-200deg);
    }

    .about li:hover .beat :global(.icon) {
      animation: beat 0.8s ease-in-out;
    }
  }

  @keyframes beat {
    15%,
    45% {
      transform: scale(1.3);
    }
    30% {
      transform: scale(1.05);
    }
  }

  .intro {
    margin: calc(-1 * var(--space-2)) 0 var(--space-3);
    color: var(--ink-muted);
    font-size: 13px;
  }

  .checks {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-3);
  }

  .severity {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-right: var(--space-1);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .unusual .severity :global(.icon) {
    color: var(--unusual);
  }

  .conflict .severity :global(.icon) {
    color: var(--danger);
  }

  .link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent-text);
    text-align: left;
    text-decoration: underline;
    cursor: pointer;
    font-size: 13px;
  }

  .labels {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-4);
  }

  .labels li {
    display: grid;
    grid-template-columns: 22px 1fr;
    gap: var(--space-2);
  }

  .label-icon {
    padding-top: 2px;
    color: var(--accent-fill);
    font-size: 16px;
  }

  .label-title,
  .because {
    margin: 0;
  }

  .label-title {
    color: var(--ink-muted);
  }

  .label-title strong {
    color: var(--ink);
  }

  .label-links {
    display: flex;
    flex-wrap: wrap;
    gap: 2px var(--space-3);
    margin: 2px 0 0;
    font-size: 13px;
  }

  /* The label itself is the Wikipedia link. */
  .wiki {
    color: var(--ink);
    text-decoration-color: var(--accent-text);
    text-underline-offset: 3px;
  }

  .wiki:hover {
    color: var(--accent-text);
  }

  /* Footer */
  footer {
    max-width: 1200px;
    margin: var(--space-4) auto 0;
    padding: var(--space-4) var(--space-4) var(--space-8);
    border-top: 1px solid var(--line);
    color: var(--ink-muted);
    font-size: 14px;
  }

  footer h2 {
    color: var(--ink);
  }

  .about {
    display: grid;
    gap: var(--space-3);
    max-width: 760px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .about li {
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: var(--space-3);
    align-items: start;
  }

  .about p {
    margin: 0;
  }

  .about-icon {
    display: inline-flex;
    justify-content: center;
    padding-top: 2px;
    color: var(--ink-muted);
    font-size: 16px;
  }

  .heart {
    color: #bf1e2e;
  }

  footer .link {
    font-size: inherit;
  }

  .sound {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
</style>
