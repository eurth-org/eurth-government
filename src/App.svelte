<script lang="ts">
  /*
   * Governmint itself: the settings on the left, what they add up to on the right, under its
   * own row of actions and its sticky section bar. All of it keeps Governmint's own design,
   * exactly as it was perfected on gov.eurth.org: its styles live in app.css and in each
   * component, inside the .gov wrapper, and are never swapped for the suite's (CLAUDE.md).
   * The suite (@eurth/style) provides what stands around the tool: the header, the footer, the
   * theme switch, the share dialog, toasts and the offline note (src/pages/index.astro puts
   * this inside Page).
   *
   * Nothing is stored. A country lives in its link (model/link.ts), which the address bar
   * follows, and in the nation's profile file (model/profile.ts). Undo, the budget locks and
   * the keyboard-shortcuts switch last for the visit, in memory; sound and motion are the
   * suite's choices for the visit (getPrefs).
   */
  import './app.css';
  import { faFileExport, faShareNodes } from '@fortawesome/free-solid-svg-icons';
  import type { EurthProfile } from '@eurth/profile';
  import { calm, copyText, getPrefs, onPrefs, setPrefs, toast } from '@eurth/style';
  import ShareDialog from '@eurth/style/components/ShareDialog.svelte';
  import { onMount, tick, untrack } from 'svelte';
  import { slide } from 'svelte/transition';
  import { defaultCountry, describe } from './model/engine';
  import { countries } from './model/countries';
  import { summary } from './model/formats';
  import { randomName } from './model/names';
  import { randomCountry } from './model/random';
  import { cleanName, markdownText } from './model/text';
  import { decodeCountry, encodeCountry, readLink, writeLink } from './model/link';
  import { familyLabels, type Family } from './model/naming';
  import { fromProfile, withGovernment } from './model/profile';
  import { settings, type Country, type SettingId } from './model/settings';
  import type { SettingDef } from './model/types';
  import Budget from './ui/Budget.svelte';
  import Compass from './ui/Compass.svelte';
  import Export from './ui/Export.svelte';
  import Field from './ui/Field.svelte';
  import { clickDelights, clink } from './ui/fun';
  import Icon from './ui/Icon.svelte';
  import Info from './ui/Info.svelte';
  import { mint } from './ui/minted.svelte';
  import { world } from './ui/spin.svelte';
  import { toolbar } from './ui/toolbar.svelte';
  import NameCard from './ui/NameCard.svelte';
  import { groupIcons, groupSwatches, panelIcons, ruleIcon, severityIcons } from './ui/icons';
  import Picker from './ui/Picker.svelte';
  import { wikipedia } from './ui/ref';
  import Radar from './ui/Radar.svelte';
  import Scales from './ui/Scales.svelte';
  import SectionNav from './ui/SectionNav.svelte';
  import Share from './ui/Share.svelte';

  // Passed in by the page: browser code never imports eurth.config.mjs (see the note there).
  // `github` is whether pages may link to GitHub yet (from 25 December 2026; the handbook, Shell).
  let { siteUrl, host, github = false }: { siteUrl: string; host: string; github?: boolean } = $props();

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

  // The page is drawn on the server first, with the default country; the link is read once the
  // page is in the browser (onMount, below).
  let ready = $state(false);
  let mod = $state('Ctrl+');

  let country = $state<Country>(defaultCountry());
  // Names are cleaned wherever they come from (model/text.ts): typed, linked or loaded.
  let name = $state('');
  $effect(() => {
    const clean = cleanName(name);
    if (clean !== name) name = clean;
  });
  // A real country's flag (its ISO code), shown on the name card and kept in the link.
  let flag = $state<string | undefined>();
  // The flag belongs to the country's name: rename the country and the flag goes.
  let flagFor = '';
  $effect(() => {
    if (flag && name !== flagFor) flag = undefined;
  });
  const profile = $derived(describe(country));
  const shownName = $derived(name.trim() || 'Your country');
  const code = $derived(encodeCountry(country));

  // The link that brings this country back, whole. Before the page has loaded there is no
  // address to read: the site's own, then.
  const link = $derived(writeLink(ready ? `${location.origin}${location.pathname}` : `${siteUrl}/`, country, name, flag));

  // The address bar follows the country, so the link can be copied from there too.
  $effect(() => {
    const address = link;
    if (ready) history.replaceState(history.state, '', address);
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

  // The country the page opened with. Random only asks before it rolls once the visitor has
  // changed something: a setting, the name, or the whole country for another.
  let opened = $state(untrack(() => snapshot));
  const changed = $derived(ready && snapshot !== opened);

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
      document.getElementById(`field-${ids[0]}`)?.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'center' });
    }
  }

  // Search works like find-in-page: every match stays highlighted while the search box has
  // text, and the visitor steps through them one at a time.
  let hits = $state<SettingId[]>([]);
  let hit = $state(0);
  // Settings picked out by a check or a label, stepped through like search matches.
  let review = $state<string | null>(null);
  const hitCounts = $derived(
    Object.fromEntries(groups.map((g) => [g.id, g.defs.filter((d) => hits.includes(d.id as SettingId)).length])),
  );

  function search(query: string) {
    review = null;
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

  /** Picks out settings to look at again: highlighted until closed, one at a time. */
  function show(ids: SettingId[], label: string) {
    review = label;
    hits = [...ids];
    hit = 0;
    showHit();
    flash(ids.slice(0, 1), false);
  }

  function closeReview() {
    review = null;
    hits = [];
  }

  function showHit() {
    const id = hits[hit];
    if (id) document.getElementById(`field-${id}`)?.scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'center' });
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
    closeReview();
  }

  onMount(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) mod = '⌘';
    // Governmint's own buttons answer a click (ui/fun.ts); the suite's shell sees to its own.
    clickDelights();
    // Governmint before the shared shell kept its offline copy under another name: clear it
    // out, so the suite's own copy is the only thing kept on this device.
    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => keys.filter((key) => key.startsWith('governmint-')).forEach((key) => caches.delete(key)))
        .catch(() => {});
    }
    // A link is someone else's input: readLink checks and clamps every value (model/link.ts).
    if (location.search) {
      const arrived = readLink(location.search);
      load(arrived.country, arrived.name, arrived.flag);
      // The country the page opens with is where undo starts, not a change to undo, and
      // nothing Random would be throwing away.
      recorded = snapshot;
      opened = snapshot;
    }
    ready = true;
  });

  // Random: a random government with the name of a famous fictional nation, credited. The dice
  // beside the name are the suite's Random button (NameCard.svelte): it asks once before it
  // replaces a country the visitor has changed, and never again. The R key presses the same
  // button, so both ask the one question, once between them.
  function random() {
    const picked = randomName();
    load(randomCountry(), picked.name);
    toast(`${picked.name}, from ${picked.from}.`);
  }

  let nameCard: NameCard | undefined = $state();
  function askRandom() {
    nameCard?.roll();
  }

  // Typed the name of a real country? Offer its real government, with its flag.
  const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const realMatch = $derived.by(() => {
    if (flag || !name.trim()) return undefined;
    const typed = fold(name);
    return countries.find((c) => fold(c.name) === typed);
  });

  // Save: the link is what holds a country, so saving one is copying its link. Nothing is kept
  // in the browser. The coin clinks (with sound on), and the country counts as minted.
  async function saveCountry() {
    if (!(await copyText(link))) {
      toast("That didn't copy. Your browser may not allow it here.");
      return;
    }
    mint();
    clink();
    toast('Saved in its link, and the link is copied.');
  }

  // The nation's profile file: loaded here, saved with Governmint's section written and every
  // other section exactly as it was. Its link is always the site's own address, since a
  // profile travels further than this page does.
  let nation = $state.raw<EurthProfile | null>(null);
  const saved = $derived(withGovernment(nation, name, country, profile, writeLink(`${siteUrl}/`, country, name, flag)));

  function loaded(next: EurthProfile) {
    nation = next;
    const whose = cleanName(next.meta.nation ?? '') || 'Your nation';
    const linked = fromProfile(next, host);
    if (linked) {
      load(linked.country, linked.name, linked.flag);
      toast(`${whose} is loaded, government and all.`);
    } else {
      name = cleanName(next.meta.nation ?? '');
      toast(`${whose} is loaded. No government in the file yet: mint one.`);
    }
  }

  // Sharing: what the suite's share dialog says about this country.
  let sharing = $state(false);
  const shareTitle = $derived(`${shownName}: ${profile.name}`);
  const shareText = $derived(`${summary(shownName, profile)} Freshly minted on Governmint.`);
  // The forum reads the body as Markdown, so the name goes in as plain text.
  const forumBody = $derived(`${summary(markdownText(shownName), profile)} Freshly minted on Governmint.\n\n${link}`);

  // Easter egg: choosing "The whole world" sets the coin in front of the name spinning.
  let lastExtent = untrack(() => country.extent);
  $effect(() => {
    if (ready && country.extent === 'world' && lastExtent !== 'world') world.spins += 1;
    lastExtent = country.extent;
  });

  // About Governmint, with the keyboard shortcuts: the "?" button or the ? key.
  let infoOpen = $state(false);

  // Keyboard shortcuts. They stay quiet while you type in a field, and the single keys can be
  // turned off in About, for speech input (WCAG 2.1.4). The switch lasts for the visit.
  let shortcuts = $state(true);

  // Sound and motion are the suite's choices for this visit (the footer has their switches);
  // About shows the same two, where Governmint has always had them.
  let prefs = $state(getPrefs());
  onMount(() => onPrefs((next) => (prefs = next)));

  // The row of actions is in the suite's header (ui/Actions.svelte): tell it what can be done
  // just now, and how.
  toolbar.examples = () => (pickerOpen = true);
  toolbar.undo = () => undo();
  toolbar.redo = () => redo();
  toolbar.save = () => saveCountry();
  toolbar.about = () => (infoOpen = true);
  $effect(() => {
    toolbar.canUndo = canUndo;
    toolbar.canRedo = future.length > 0;
    toolbar.mod = mod;
  });

  // About is a pill in the suite's blue bar (pages/index.astro), a link to #about: it opens
  // the same window as the "?" button and the ? key.
  onMount(() => {
    const open = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('a[href="#about"]')) return;
      event.preventDefault();
      infoOpen = true;
    };
    document.addEventListener('click', open);
    return () => document.removeEventListener('click', open);
  });
  function toggleSound() {
    setPrefs({ sound: !prefs.sound });
    if (prefs.sound) clink();
  }

  function keys(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const typing = target.matches('input, textarea, select, [contenteditable]');
    const command = event.metaKey || event.ctrlKey;
    if (command && event.key.toLowerCase() === 'z' && !typing) {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if (typing || command || event.altKey || document.querySelector('dialog[open]')) return;
    if (event.key === 'Escape') {
      closeReview();
      return;
    }
    if (!shortcuts) return;
    const sectionIds = groups.map((g) => g.id);
    const at = sectionIds.indexOf(current);
    switch (event.key) {
      case '/':
        event.preventDefault();
        closeReview();
        // The search box comes back once the review has closed.
        tick().then(() => document.getElementById('setting-search')?.focus());
        break;
      case '?':
        event.preventDefault();
        infoOpen = true;
        break;
      case 'e':
      case 'E':
        // Or the letter lands in the window's search box as it opens.
        event.preventDefault();
        pickerOpen = true;
        break;
      case 'r':
      case 'R':
        askRandom();
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

<!-- Everything inside .gov keeps Governmint's own design (app.css). The suite's header is above
     it and the suite's footer below; neither is rebuilt here. -->
<div class="gov">
  <!-- Governmint's actions (Examples, Undo, Redo, Save, About) stand on the line of the coin
       and the name, in the suite's header: ui/Actions.svelte, by way of ui/toolbar.svelte.ts. -->
  <SectionNav
    sections={groups}
    {current}
    name={profile.name}
    {hitCounts}
    hitCount={hits.length}
    {hit}
    {review}
    onsearch={search}
    onstep={step}
    onclose={closeReview}
  />

  <div class="layout">
    <div class="settings" id="settings">
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
              {link}
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
    </div>

    <section class="results" id="results" aria-label="Result">
      <section class="panel summary" aria-label="Name">
        <NameCard
          bind:this={nameCard}
          bind:name
          {profile}
          seed={code}
          {flag}
          onrandom={random}
          risky={changed}
          real={realMatch && { name: realMatch.name, flag: realMatch.code.toLowerCase() }}
          onreal={() => realMatch && load(structuredClone(realMatch.country), realMatch.name, realMatch.code.toLowerCase())}
        />
      </section>

      {#if profile.checks.length}
        <section class="panel" aria-labelledby="checks-title" transition:slide={{ duration: calm() ? 0 : 250 }}>
          <h2 id="checks-title"><Icon icon={panelIcons.checks} /> Worth a second look</h2>
          <ul class="checks">
            {#each profile.checks as check (check.id)}
              {@const kind = check.severity === 'conflict' ? 'Contradiction' : 'Unusual'}
              <!-- Laid out like "Why this name": the icon in its own column, the words lined up beside it. -->
              <li class={check.severity} transition:slide={{ duration: calm() ? 0 : 200 }}>
                <span class="severity-icon"><Icon icon={severityIcons[check.severity]} /></span>
                <div>
                  <p class="severity">{kind}</p>
                  <p class="because">{check.message}</p>
                  <p class="label-links">
                    <button class="link" onclick={() => show(check.dependsOn, kind)}>
                      Show settings{check.dependsOn.length > 1 ? ` (${check.dependsOn.length})` : ''}
                    </button>
                  </p>
                </div>
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
                  <a class="wiki" href={wikipedia(label.wiki, host)} title="{label.wiki} on Wikipedia">
                    <strong>{label.label}</strong>
                    <span class="visually-hidden">(Wikipedia)</span>
                  </a>
                </p>
                <p class="because">{label.because}</p>
                <p class="label-links">
                  <button class="link" onclick={() => show(label.dependsOn, `${familyLabels[family]}: based on`)}>
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
        <Radar scores={profile.axes} name={shownName} {link} />
      </section>

      <section class="panel" aria-labelledby="compass-title">
        <h2 id="compass-title"><Icon icon={panelIcons.compass} /> Compass</h2>
        <Compass scores={profile.axes} name={shownName} {link} />
      </section>

      <section class="panel" aria-labelledby="share-title">
        <h2 id="share-title">
          <span title="The share icon, designed by the late, great Alex King"><Icon icon={faShareNodes} /></span>
          Save &amp; share
        </h2>
        <Share
          name={shownName}
          named={!!name.trim()}
          {country}
          {profile}
          {link}
          nation={saved}
          onshare={() => (sharing = true)}
          onload={loaded}
        />
      </section>

      <section class="panel" aria-labelledby="export-title">
        <h2 id="export-title"><Icon icon={faFileExport} /> Export</h2>
        <Export name={shownName} {country} {profile} {link} />
      </section>
    </section>
  </div>

  <!-- Governmint's own windows stay inside .gov: a dialog opens over the page, but takes its
       colours from where it stands in it. -->
  <Picker open={pickerOpen} {host} onpick={load} onclose={() => (pickerOpen = false)} />
  <Info
    open={infoOpen}
    onclose={() => (infoOpen = false)}
    sound={prefs.sound}
    ontogglesound={toggleSound}
    motion={prefs.motion}
    ontogglemotion={() => setPrefs({ motion: !prefs.motion })}
    {shortcuts}
    ontoggleshortcuts={() => (shortcuts = !shortcuts)}
    {mod}
    {host}
    {github}
  />
</div>

<!-- The share dialog is the suite's, so it stands outside .gov and keeps the suite's look. -->
<ShareDialog
  bind:open={sharing}
  url={link}
  title={shareTitle}
  text={shareText}
  {forumBody}
  heading={name.trim() ? `Share ${name.trim()}` : 'Share your country'}
  oncopy={clink}
/>

<style>
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

  /* Nothing in the name card (the stamp, the coin) may reach past its edges and shake the page. */
  .summary {
    overflow: clip;
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
    gap: var(--space-4);
  }

  .checks li {
    display: grid;
    grid-template-columns: 22px 1fr;
    gap: var(--space-2);
  }

  .severity-icon {
    padding-top: 2px;
    font-size: 16px;
  }

  .severity {
    margin: 0;
    color: var(--ink-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .unusual .severity-icon {
    color: var(--unusual);
  }

  .conflict .severity-icon {
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
</style>
