<script lang="ts">
  import { faGithub, faWikipediaW } from '@fortawesome/free-brands-svg-icons';
  import {
    faArrowUpRightFromSquare,
    faBookOpen,
    faCircleInfo,
    faCodeBranch,
    faHeart,
    faRotateLeft,
    faUserShield,
  } from '@fortawesome/free-solid-svg-icons';
  import { tick } from 'svelte';
  import yurt from './assets/eurth-yurt-circle.svg';
  import { defaultCountry, describe } from './model/engine';
  import { sentence } from './model/formats';
  import { decodeCountry, encodeCountry } from './model/link';
  import { familyLabels, type Family } from './model/naming';
  import { settings, type Country, type SettingId } from './model/settings';
  import type { SettingDef } from './model/types';
  import Budget from './ui/Budget.svelte';
  import Compass from './ui/Compass.svelte';
  import Field from './ui/Field.svelte';
  import Globe from './ui/Globe.svelte';
  import Icon from './ui/Icon.svelte';
  import { groupIcons, groupSwatches, panelIcons, ruleIcon, severityIcons } from './ui/icons';
  import Picker from './ui/Picker.svelte';
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

  const params = new URLSearchParams(location.search);
  let country = $state<Country>(params.get('c') ? decodeCountry(params.get('c')!) : defaultCountry());
  let name = $state(params.get('n') ?? '');
  const profile = $derived(describe(country));
  const shownName = $derived(name.trim() || 'Your country');

  const link = $derived.by(() => {
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set('c', encodeCountry(country));
    if (name.trim()) url.searchParams.set('n', name.trim());
    return url.toString();
  });

  $effect(() => {
    history.replaceState(null, '', link);
  });

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

  function pick(next: Country, countryName: string) {
    country = next;
    name = countryName;
  }

  function reset() {
    country = defaultCountry();
    name = '';
  }
</script>

<div class="topbar">
  <nav aria-label="Links">
    <a href="#about"><Icon icon={faCircleInfo} /> About</a>
    <a href="https://github.com/eurth-org/eurth-government"><Icon icon={faGithub} /> GitHub</a>
    <a href="https://eurth.org"><Icon icon={faArrowUpRightFromSquare} /> Eurth.org</a>
  </nav>
</div>

<header class="header">
  <div class="brand">
    <Globe />
    <span class="title">Governmint</span>
    <span class="tagline">Freshly minted governments</span>
    <span class="badge">Preview</span>
  </div>
  <div class="actions">
    <button class="btn" onclick={() => (pickerOpen = true)}><Icon icon={faBookOpen} /> Start from…</button>
    <button class="btn" onclick={reset}><Icon icon={faRotateLeft} /> Reset</button>
    <ThemeSwitch />
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
          <Budget {country} {flashing} {hits} currentHit={hits[hit]} name={shownName} onchange={(next) => (country = next)} />
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
      <label class="kicker" for="country-name"><Icon icon={panelIcons.name} /> Country name</label>
      <input id="country-name" class="name-input" placeholder="Your country" bind:value={name} />
      <h1 aria-live="polite">{profile.name}</h1>
      <p class="sentence">{sentence(name.trim() || 'This country', profile)}</p>
    </section>

    {#if profile.checks.length}
      <section class="panel" aria-labelledby="checks-title">
        <h2 id="checks-title"><Icon icon={panelIcons.checks} /> Worth a second look</h2>
        <ul class="checks">
          {#each profile.checks as check (check.id)}
            <li class={check.severity}>
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
              <p class="label-title">{familyLabels[family]}: <strong>{label.label}</strong></p>
              <p class="because">{label.because}</p>
              <p class="label-links">
                <a href="https://en.wikipedia.org/wiki/{encodeURIComponent(label.wiki.replaceAll(' ', '_'))}" target="_blank" rel="noopener">
                  <Icon icon={faWikipediaW} /> {label.wiki}
                </a>
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
      <h2 id="share-title"><Icon icon={panelIcons.share} /> Share</h2>
      <Share name={shownName} {country} {profile} {link} />
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
      <p>A country lives in its link: copy it to share it or come back later. Nothing is stored anywhere else.</p>
    </li>
    <li>
      <span class="about-icon"><img src={yurt} alt="" width="18" height="18" /></span>
      <p>
        <a href="https://eurth.org">Made by Eurth, a Worldbuilding &amp; Roleplay Writing Community</a>. Built a
        country you like? Give it a world to live in.
      </p>
    </li>
    <li>
      <span class="about-icon heart"><Icon icon={faHeart} /></span>
      <p>
        Made with love by <a href="https://iiwiki.com/w/Orioni">Orioni</a>, for Eurth and the people who live in it,
        going strong since 2004. Thanks to <a href="https://www.nationstates.net">NationStates</a>, where Eurth's
        worldbuilding began.
      </p>
    </li>
    <li>
      <span class="about-icon"><Icon icon={faWikipediaW} /></span>
      <p>
        Every label links to <a href="https://en.wikipedia.org">Wikipedia</a> for the full story. Thank you, Wikipedia
        <span class="heart"><Icon icon={faHeart} label="love" /></span>
      </p>
    </li>
    <li>
      <span class="about-icon"><Icon icon={faCodeBranch} /></span>
      <p>
        Inspired by the
        <a href="https://minkinfin.github.io/Filteries-Political-Simulator-Archive/">Filteries Political Simulator</a>
        (2016–2018). Icons by <a href="https://fontawesome.com">Font Awesome</a> (CC BY 4.0) and
        <a href="https://github.com/cyberalien/line-md">line-md</a> (MIT). Open source under the
        <a href="https://github.com/eurth-org/eurth-government/blob/main/LICENSE">Apache 2.0 licence</a>.
      </p>
    </li>
  </ul>
</footer>

<Picker open={pickerOpen} onpick={pick} onclose={() => (pickerOpen = false)} />

<style>
  /* Top bar and header, as on eurth.org. The bar is Eurth blue; its links sit on the deeper
     Eurth blue so they stand out from the bar (white on it is 5.5:1). */
  .topbar {
    background: var(--eurth-blue);
    min-height: 40px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 var(--space-4);
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
    background: var(--eurth-blue-deep);
    color: var(--on-selected);
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
    outline-color: var(--on-selected);
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
    min-height: 56px;
    padding: var(--space-2) var(--space-4);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-2);
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
    gap: var(--space-2);
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

  /* Results */
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

  .kicker :global(.icon) {
    color: var(--accent-fill);
    font-size: 14px;
  }

  .name-input {
    width: 100%;
    margin: var(--space-1) 0 var(--space-3);
    padding: 4px 8px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    background: var(--surface);
    font-weight: 600;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.25;
  }

  .sentence {
    margin: var(--space-2) 0 0;
    color: var(--ink-muted);
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

  .label-links a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
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
</style>
