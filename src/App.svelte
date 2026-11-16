<script lang="ts">
  /*
   * Governmint itself: the settings on the left, what they add up to on the right. The header,
   * the footer, the theme switch, the share dialog, toasts and the offline note come from
   * @eurth/style (src/pages/index.astro puts this inside Page); the tool's own actions sit in
   * its own toolbar.
   *
   * Nothing is stored. A country lives in its link (model/link.ts), which the address bar
   * follows, and in the nation's profile file (model/profile.ts). Undo, the budget locks and
   * the keyboard-shortcuts switch last for the visit, in memory.
   */
  import {
    faBookOpen,
    faCircleQuestion,
    faFileExport,
    faRedo,
    faShareNodes,
    faUndo,
  } from '@fortawesome/free-solid-svg-icons';
  import type { EurthProfile } from '@eurth/profile';
  import ProfileButtons from '@eurth/profile/ProfileButtons.svelte';
  import { calm, copyText, paperPlane, toast } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import Line from '@eurth/style/components/Line.svelte';
  import RandomButton from '@eurth/style/components/RandomButton.svelte';
  import ShareButtons from '@eurth/style/components/ShareButtons.svelte';
  import { lineAlert, lineConfirm, lineLink } from '@eurth/style/line';
  import { onMount, tick, untrack } from 'svelte';
  import { slide } from 'svelte/transition';
  import { defaultCountry, describe } from './model/engine';
  import { countries } from './model/countries';
  import { description, summary, toMarkdown } from './model/formats';
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
  import { clink } from './ui/fun';
  import Info from './ui/Info.svelte';
  import { mint } from './ui/minted.svelte';
  import Mints from './ui/Mints.svelte';
  import NameCard from './ui/NameCard.svelte';
  import { groupIcons, groupSwatches, panelIcons, ruleIcon, severityIcons } from './ui/icons';
  import Picker from './ui/Picker.svelte';
  import { wikipedia } from './ui/ref';
  import Radar from './ui/Radar.svelte';
  import Scales from './ui/Scales.svelte';
  import SectionNav from './ui/SectionNav.svelte';

  // Passed in by the page: browser code never imports eurth.config.mjs (see the note there).
  let { siteUrl, host }: { siteUrl: string; host: string } = $props();

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
      const line = narrow.matches ? 200 : 120;
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

  // Random: a random government with the name of a famous fictional nation, credited. The
  // suite's Random button (in the toolbar) calls this: it asks once before it replaces a country
  // the visitor has changed, and never again.
  function random() {
    const picked = randomName();
    load(randomCountry(), picked.name);
    toast(`${picked.name}, from ${picked.from}.`);
  }

  // The dice beside the name and the R key press the toolbar's Random, so all three ask the
  // one question, once between them.
  let randomHost: HTMLElement | undefined = $state();
  function askRandom() {
    randomHost?.querySelector<HTMLButtonElement>(':scope > button')?.click();
  }

  // Typed the name of a real country? Offer its real government, with its flag.
  const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  const realMatch = $derived.by(() => {
    if (flag || !name.trim()) return undefined;
    const typed = fold(name);
    return countries.find((c) => fold(c.name) === typed);
  });

  // Copy link: the link is what travels, and what "saving" a country means. A paper plane flies
  // off the button, a tick draws itself in the link's place, the coin clinks (with sound on),
  // and the country counts as minted.
  let linkCopied = $state(false);
  let linkTimer: ReturnType<typeof setTimeout> | undefined;
  async function copyLink(from?: HTMLElement) {
    if (!(await copyText(link))) {
      toast("That didn't copy. Your browser may not allow it here.");
      return;
    }
    mint();
    clink();
    if (from) paperPlane(from);
    toast('Freshly minted, and copied.');
    linkCopied = true;
    clearTimeout(linkTimer);
    linkTimer = setTimeout(() => (linkCopied = false), 2000);
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

  // Sharing: what the share row and the dialog say about this country.
  const shareTitle = $derived(`${shownName}: ${profile.name}`);
  const shareText = $derived(`${summary(shownName, profile)} Freshly minted on Governmint.`);
  // The forum reads the body as Markdown, so the name goes in as plain text.
  const forumBody = $derived(`${summary(markdownText(shownName), profile)} Freshly minted on Governmint.\n\n${link}`);

  // Easter egg: choosing "The whole world" sets the coin in the toolbar spinning.
  let worldSpin = $state(0);
  let lastExtent = untrack(() => country.extent);
  $effect(() => {
    if (ready && country.extent === 'world' && lastExtent !== 'world') worldSpin += 1;
    lastExtent = country.extent;
  });

  // About Governmint, with the keyboard shortcuts: the "?" button or the ? key.
  let infoOpen = $state(false);

  // Keyboard shortcuts. They stay quiet while you type in a field, and the single keys can be
  // turned off in About, for speech input (WCAG 2.1.4). The switch lasts for the visit.
  let shortcuts = $state(true);

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
        copyLink();
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

<div class="governmint">
  <!-- The tool's own actions. The header above belongs to the suite. -->
  <div class="toolbar">
    <Mints spin={worldSpin} />
    <div class="eu-row actions">
      <button type="button" class="eu-btn" onclick={() => (pickerOpen = true)} data-tip="Start from an example or a real country (E)" data-tip-align="start">
        <Icon icon={faBookOpen} /> <span>Examples<span class="wide-only">{' '}&amp; countries</span></span>
      </button>
      <span class="random" bind:this={randomHost}>
        <RandomButton onrandom={random} guard={changed} what="country" />
      </span>
      <button type="button" class="eu-btn eu-btn--icon" data-click="swing-left" onclick={undo} disabled={!canUndo} aria-label="Undo" data-tip="Undo ({mod}Z)">
        <Icon icon={faUndo} />
      </button>
      <button type="button" class="eu-btn eu-btn--icon" data-click="swing-right" onclick={redo} disabled={!future.length} aria-label="Redo" data-tip="Redo (⇧{mod}Z)">
        <Icon icon={faRedo} />
      </button>
      <button type="button" class="eu-btn" onclick={(e) => copyLink(e.currentTarget)} data-tip="The link holds the whole country (S)">
        <Line icon={linkCopied ? lineConfirm : lineLink} /> {linkCopied ? 'Copied' : 'Copy link'}
      </button>
      <button
        type="button"
        class="eu-btn eu-btn--icon"
        aria-label="About Governmint and keyboard shortcuts"
        data-tip="About and shortcuts (?)"
        onclick={() => (infoOpen = true)}
      >
        <Icon icon={faCircleQuestion} />
      </button>
    </div>
  </div>

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
        <section class="eu-card eu-card--outline panel" id={group.id} aria-labelledby="{group.id}-title">
          <h2 id="{group.id}-title">
            <span class="group-icon" style:color="var(--{group.swatch})"><Icon icon={group.icon} /></span>
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
      <section class="eu-card eu-card--outline panel summary" aria-label="Name">
        <NameCard
          bind:name
          {profile}
          seed={code}
          {flag}
          onrandom={askRandom}
          real={realMatch && { name: realMatch.name, flag: realMatch.code.toLowerCase() }}
          onreal={() => realMatch && load(structuredClone(realMatch.country), realMatch.name, realMatch.code.toLowerCase())}
        />
      </section>

      {#if profile.checks.length}
        <section class="eu-card eu-card--outline panel" aria-labelledby="checks-title" transition:slide={{ duration: calm() ? 0 : 250 }}>
          <!-- The panel arrives when a check does: its warning sign draws itself as it opens. -->
          <h2 id="checks-title"><Line icon={lineAlert} /> Worth a second look</h2>
          <ul class="points">
            {#each profile.checks as check (check.id)}
              {@const kind = check.severity === 'conflict' ? 'Contradiction' : 'Unusual'}
              <!-- Laid out like "Why this name": the icon in its own column, the words lined up beside it. -->
              <li class={check.severity} transition:slide={{ duration: calm() ? 0 : 200 }}>
                <span class="point-icon"><Icon icon={severityIcons[check.severity]} /></span>
                <div class="point">
                  <p class="eu-kicker">{kind}</p>
                  <p>{check.message}</p>
                  <button type="button" class="eu-btn based" onclick={() => show(check.dependsOn, kind)}>
                    Show settings{check.dependsOn.length > 1 ? ` (${check.dependsOn.length})` : ''}
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <section class="eu-card eu-card--outline panel" aria-labelledby="why-title">
        <h2 id="why-title"><Icon icon={panelIcons.why} /> Why this name</h2>
        <ul class="points">
          {#each familyOrder as family (family)}
            {@const label = profile.labels[family]}
            <li>
              <span class="point-icon label-icon"><Icon icon={ruleIcon(family, label.rule)} /></span>
              <div class="point">
                <p class="label-title">
                  {familyLabels[family]}:
                  <a class="wiki" href={wikipedia(label.wiki, host)} title="{label.wiki} on Wikipedia">
                    <strong>{label.label}</strong>
                    <span class="eu-visually-hidden">(Wikipedia)</span>
                  </a>
                </p>
                <p>{label.because}</p>
                <button type="button" class="eu-btn based" onclick={() => show(label.dependsOn, `${familyLabels[family]}: based on`)}>
                  Based on: {label.dependsOn.map((id) => defs.find((d) => d.id === id)?.label ?? id).join(', ')}
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </section>

      <section class="eu-card eu-card--outline panel" aria-labelledby="scales-title">
        <h2 id="scales-title"><Icon icon={panelIcons.scales} /> Scales</h2>
        <p class="eu-help">Each scale runs from 0% to 100%. Drag one to see which settings move it.</p>
        <Scales scores={profile.axes} {country} onapply={(next) => (country = next)} onflash={flash} />
      </section>

      <section class="eu-card eu-card--outline panel" aria-labelledby="radar-title">
        <h2 id="radar-title"><Icon icon={panelIcons.radar} /> Shape</h2>
        <Radar scores={profile.axes} name={shownName} {link} />
      </section>

      <section class="eu-card eu-card--outline panel" aria-labelledby="compass-title">
        <h2 id="compass-title"><Icon icon={panelIcons.compass} /> Compass</h2>
        <Compass scores={profile.axes} name={shownName} {link} />
      </section>

      <section class="eu-card eu-card--outline panel" aria-labelledby="share-title">
        <h2 id="share-title">
          <span title="The share icon, designed by the late, great Alex King"><Icon icon={faShareNodes} /></span>
          Save &amp; share
        </h2>
        <!-- Anything pressed in the share row counts the country as minted, once per visit
             (ui/minted.svelte.ts): the row's buttons are real buttons, so keys reach this too. -->
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div class="share" onclick={mint}>
          <ShareButtons
            url={link}
            title={shareTitle}
            text={shareText}
            {forumBody}
            description={() => description(shownName, country, profile)}
            markdown={() => toMarkdown(shownName, country, profile, link)}
            heading={name.trim() ? `Share ${name.trim()}` : 'Share your country'}
            said={{ link: 'Freshly minted, and copied.' }}
            oncopy={clink}
          />
        </div>
        <div class="eu-row">
          <ProfileButtons
            profile={saved}
            onload={loaded}
            onerror={(errors) => toast(errors[0]?.message ?? "That file isn't a nation profile. Pick one that ends in .eurth.json.")}
          />
        </div>
        <p class="eu-help">
          The link holds every setting and the name, so it brings this country back exactly. The profile file carries
          your nation from one Eurth tool to the next{name.trim() ? '' : ': name your country to save one'}. Nothing is
          kept in this browser.
        </p>
      </section>

      <section class="eu-card eu-card--outline panel" aria-labelledby="export-title">
        <h2 id="export-title"><Icon icon={faFileExport} /> Export</h2>
        <Export name={shownName} {country} {profile} {link} />
      </section>
    </section>
  </div>

  <Picker open={pickerOpen} {host} onpick={load} onclose={() => (pickerOpen = false)} />
  <Info open={infoOpen} onclose={() => (infoOpen = false)} {shortcuts} ontoggleshortcuts={() => (shortcuts = !shortcuts)} {mod} {host} />
</div>

<style>
  .governmint {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3) var(--space-4);
  }

  .actions {
    gap: var(--space-2);
  }

  @media (max-width: 480px) {
    .wide-only {
      display: none;
    }
  }

  .layout {
    display: grid;
    gap: var(--space-4);
  }

  @media (min-width: 900px) {
    .layout {
      grid-template-columns: minmax(0, 1fr) 420px;
      align-items: start;
    }

    /* The name stays in view beside whichever settings you're changing; the rest scrolls
       under it, behind an edge in the page's own colour. */
    .summary {
      position: sticky;
      top: calc(var(--size-target) + var(--space-8));
      z-index: 1;
      outline: var(--space-3) solid var(--surface);
    }
  }

  .settings,
  .results {
    display: grid;
    gap: var(--space-4);
    min-width: 0;
  }

  /* A panel is the suite's card, a little tighter: Governmint has many of them. A jump to one
     lands below the sticky bar. */
  .panel {
    padding: var(--space-4);
    scroll-margin-top: calc(var(--size-target) + var(--space-8));
  }

  @media (max-width: 899px) {
    .panel,
    .results {
      scroll-margin-top: calc(3 * var(--size-target) + var(--space-8));
    }
  }

  /* Nothing in the name card (the stamp, the coin) may reach past its edges and shake the page. */
  .summary {
    overflow: clip;
  }

  h2 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font: var(--type-heading);
  }

  .group-icon {
    display: inline-flex;
  }

  /* Checks and labels: the icon in its own column, the words lined up beside it. */
  .points {
    display: grid;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .points li {
    display: grid;
    grid-template-columns: var(--space-6) minmax(0, 1fr);
    gap: var(--space-2);
  }

  .point {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .point-icon {
    padding-top: var(--space-1);
  }

  /* Never colour alone: each check also says "Contradiction" or "Unusual", with its own icon. */
  .unusual .point-icon {
    color: var(--caution-text);
  }

  .conflict .point-icon {
    color: var(--danger-text);
  }

  .label-icon {
    color: var(--accent-text);
  }

  .label-title {
    color: var(--ink-muted);
  }

  .label-title strong {
    color: var(--ink);
  }

  /* The label itself is the Wikipedia link. */
  .wiki {
    color: var(--ink);
    text-decoration-color: var(--accent-text);
  }

  .wiki:hover {
    color: var(--accent-text);
  }

  /* A button whose label is a sentence: it may run over two lines. */
  .based {
    justify-content: flex-start;
    margin-top: var(--space-1);
    padding-block: var(--space-2);
    text-align: left;
  }

  .share,
  .random {
    display: contents;
  }
</style>
