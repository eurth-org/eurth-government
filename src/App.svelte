<script lang="ts">
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import {
    faArrowUpRightFromSquare,
    faBookOpen,
    faCircleInfo,
    faRotateLeft,
  } from '@fortawesome/free-solid-svg-icons';
  import { tick } from 'svelte';
  import yurt from './assets/eurth-yurt-circle.svg';
  import { defaultCountry, describe } from './model/engine';
  import { decodeCountry, encodeCountry } from './model/link';
  import { familyLabels, type Family } from './model/naming';
  import { settings, type Country, type SettingId } from './model/settings';
  import type { SettingDef } from './model/types';
  import Budget from './ui/Budget.svelte';
  import Compass from './ui/Compass.svelte';
  import Field from './ui/Field.svelte';
  import Icon from './ui/Icon.svelte';
  import { groupIcons, groupSwatches, panelIcons, severityIcons } from './ui/icons';
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

  function search(query: string): number {
    const words = query.toLowerCase().split(/\s+/);
    const found = defs.filter((d) => {
      const text = [d.label, d.question, d.group, ...d.options.flatMap((o) => [o.label, o.help])].join(' ').toLowerCase();
      return words.every((w) => text.includes(w));
    });
    flash(
      found.map((d) => d.id as SettingId),
      true,
    );
    return found.length;
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
    <img src="/eurth-globe.gif" alt="" width="36" height="36" />
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

<SectionNav sections={groups} {current} name={profile.name} onsearch={search} />

<div class="layout">
  <main class="settings">
    {#each groups as group (group.id)}
      <section class="panel" id={group.id} aria-labelledby="{group.id}-title">
        <h2 id="{group.id}-title">
          <span class="swatch" style:--swatch={group.swatch}></span>
          <span class="group-icon" style:color={group.swatch}><Icon icon={group.icon} /></span>
          {group.name}
        </h2>
        {#if group.name === 'Budget'}
          <Budget {country} {flashing} onchange={(next) => (country = next)} />
        {:else}
          {#each group.defs as def (def.id)}
            <Field
              {def}
              value={country[def.id as SettingId] as string | string[]}
              flash={flashing.includes(def.id as SettingId)}
              onchange={(value) => setValue(def.id, value)}
            />
          {/each}
        {/if}
      </section>
    {/each}
  </main>

  <aside class="results" id="results">
    <section class="panel summary">
      <label class="kicker" for="country-name">Country name</label>
      <input id="country-name" class="name-input" placeholder="Your country" bind:value={name} />
      <h1 aria-live="polite"><Icon icon={panelIcons.name} /> {profile.name}</h1>
      <p class="regime">{profile.labels.regime.label}</p>
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
      <dl class="labels">
        {#each familyOrder as family (family)}
          {@const label = profile.labels[family]}
          <div>
            <dt>{familyLabels[family]}</dt>
            <dd>
              <strong>{label.label}.</strong>
              {label.because}
              <button class="based-on link" onclick={() => flash(label.dependsOn, true)}>
                Based on: {label.dependsOn.map((id) => defs.find((d) => d.id === id)?.label ?? id).join(', ')}
              </button>
            </dd>
          </div>
        {/each}
      </dl>
    </section>

    <section class="panel" aria-labelledby="scales-title">
      <h2 id="scales-title"><Icon icon={panelIcons.scales} /> Where it stands</h2>
      <p class="intro">Drag a scale to see which settings would move it.</p>
      <Scales scores={profile.axes} {country} onapply={(next) => (country = next)} onflash={flash} />
    </section>

    <section class="panel" aria-labelledby="radar-title">
      <h2 id="radar-title"><Icon icon={panelIcons.radar} /> Shape</h2>
      <Radar scores={profile.axes} />
    </section>

    <section class="panel" aria-labelledby="compass-title">
      <h2 id="compass-title"><Icon icon={panelIcons.compass} /> Compass</h2>
      <Compass scores={profile.axes} />
    </section>

    <section class="panel" aria-labelledby="share-title">
      <h2 id="share-title"><Icon icon={panelIcons.share} /> Share</h2>
      <Share name={shownName} {country} {profile} {link} />
    </section>
  </aside>
</div>

<footer id="about">
  <h2>About Governmint</h2>
  <p>
    Set up a country and Governmint names the kind of state you've made, explains why, and points out where the
    settings contradict each other. This preview covers government; economy and law come next.
  </p>
  <p>Your country lives in the link: copy it to share it or come back later. Nothing is stored anywhere else.</p>
  <p class="made-by">
    <img src={yurt} alt="" width="20" height="20" />
    <span>
      Made by <a href="https://eurth.org">Eurth</a>, a Worldbuilding &amp; Roleplay Writing Community. Built a
      country you like? Give it a world to live in.
    </span>
  </p>
  <p class="fine">
    Inspired by the
    <a href="https://minkinfin.github.io/Filteries-Political-Simulator-Archive/">Filteries Political Simulator</a>
    (2016–2018). Icons by <a href="https://fontawesome.com">Font Awesome</a> (CC BY 4.0) and
    <a href="https://github.com/cyberalien/line-md">line-md</a> (MIT). Open source under the
    <a href="https://github.com/eurth-org/eurth-government/blob/main/LICENSE">Apache 2.0 licence</a>.
  </p>
</footer>

<Picker open={pickerOpen} onpick={pick} onclose={() => (pickerOpen = false)} />

<style>
  /* Top bar and header, as on eurth.org. The bar is Eurth blue; its links sit on the deeper
     Eurth blue, because white text on Eurth blue itself is too faint (3.2:1). */
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
    background: var(--selected);
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

  .swatch {
    width: 10px;
    height: 10px;
    border-radius: var(--radius-sm);
    background: var(--swatch);
    flex: none;
  }

  .group-icon {
    display: inline-flex;
  }

  /* Results */
  .kicker {
    display: block;
    color: var(--ink-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
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
    display: flex;
    gap: var(--space-2);
    margin: 0;
    font-size: 24px;
    line-height: 1.25;
  }

  h1 :global(.icon) {
    margin-top: 0.2em;
    color: var(--accent-fill);
    font-size: 0.8em;
  }

  .regime {
    margin: var(--space-1) 0 0;
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
  }

  .labels div + div {
    margin-top: var(--space-3);
  }

  dt {
    color: var(--ink-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  dd {
    margin: 2px 0 0;
  }

  .based-on {
    display: block;
    margin-top: 2px;
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

  footer p {
    max-width: 720px;
    margin: 0 0 var(--space-3);
  }

  .made-by {
    display: flex;
    gap: var(--space-2);
    align-items: flex-start;
  }

  .made-by img {
    flex: none;
    margin-top: 1px;
  }
</style>
