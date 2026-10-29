<script lang="ts">
  import globe from './assets/eurth-globe.gif';
  import yurt from './assets/eurth-yurt-circle.svg';
  import { axes } from './model/axes';
  import { defaultCountry, describe } from './model/engine';
  import { examples } from './model/examples';
  import { decodeCountry, encodeCountry } from './model/link';
  import { familyLabels, type Family } from './model/naming';
  import { settings, type Country, type SettingId } from './model/settings';
  import type { SettingDef } from './model/types';

  const defs = settings as readonly SettingDef[];
  const groups = [...new Set(defs.map((d) => d.group))].map((name) => ({
    name,
    defs: defs.filter((d) => d.group === name),
  }));
  const familyOrder: Family[] = ['structure', 'system', 'form', 'regime', 'rulers'];

  // Eurth's forum category colours, as small swatches beside each section.
  const swatches: Record<string, string> = {
    'The state': '#12a89d',
    'Head of state': '#2698d4',
    Government: '#bf1e2e',
    Legislature: '#f7941d',
    Elections: '#3ab54a',
    'Courts and rulers': '#9eb83b',
    'Religion, defence and borders': '#f1592a',
  };

  function fromLink(): Country {
    const code = new URLSearchParams(location.search).get('c');
    return code ? decodeCountry(code) : defaultCountry();
  }

  let country = $state<Country>(fromLink());
  const profile = $derived(describe(country));
  let example = $state('');
  let copied = $state(false);

  $effect(() => {
    const url = new URL(location.href);
    url.searchParams.set('c', encodeCountry(country));
    history.replaceState(null, '', url);
  });

  const values = (): Record<string, string | string[]> => country as unknown as Record<string, string | string[]>;

  function choice(id: string): string {
    return values()[id] as string;
  }

  function chosen(id: string): string[] {
    return values()[id] as string[];
  }

  function setChoice(id: string, option: string) {
    values()[id] = option;
  }

  function toggle(id: string, option: string) {
    const list = chosen(id);
    values()[id] = list.includes(option) ? list.filter((o) => o !== option) : [...list, option];
  }

  function helpFor(def: SettingDef): string {
    if (def.kind === 'choice') return def.options.find((o) => o.id === choice(def.id))?.help ?? '';
    const picked = def.options.filter((o) => chosen(def.id).includes(o.id));
    return picked.length ? picked.map((o) => o.help).join(' ') : 'Only age limits who may vote.';
  }

  function settingLabel(id: SettingId): string {
    return defs.find((d) => d.id === id)?.label ?? id;
  }

  function axisDef(id: string) {
    return axes.find((a) => a.id === id)!;
  }

  function loadExample() {
    const found = examples.find((e) => e.id === example);
    if (found) country = structuredClone(found.country);
    example = '';
  }

  function reset() {
    country = defaultCountry();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(location.href);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="topbar">
  <nav aria-label="Links">
    <a href="#about">About</a>
    <a href="https://github.com/eurth-org/eurth-government">GitHub</a>
    <a href="https://eurth.org">Eurth.org</a>
  </nav>
</div>

<header class="header">
  <div class="brand">
    <img src={globe} alt="" width="36" height="36" />
    <span class="title">Governmint</span>
    <span class="tagline">Freshly minted governments</span>
    <span class="badge">Preview</span>
  </div>
  <div class="actions">
    <select aria-label="Load an example" bind:value={example} onchange={loadExample}>
      <option value="">Examples…</option>
      {#each examples as e (e.id)}
        <option value={e.id}>{e.title}</option>
      {/each}
    </select>
    <button class="primary" onclick={copyLink}>{copied ? 'Copied' : 'Copy link'}</button>
    <button onclick={reset}>Reset</button>
  </div>
</header>

<a class="sticky-name" href="#results">
  <strong>{profile.name}</strong>
  <span>{profile.labels.regime.label}{profile.checks.length ? ` · ${profile.checks.length} to check` : ''}</span>
</a>

<div class="layout">
  <main class="settings">
    {#each groups as group (group.name)}
      <section class="panel">
        <h2><span class="swatch" style:--swatch={swatches[group.name]}></span>{group.name}</h2>
        {#each group.defs as def (def.id)}
          <div class="field">
            {#if def.kind === 'choice'}
              <label for={def.id}>{def.question}</label>
              <select id={def.id} value={choice(def.id)} onchange={(e) => setChoice(def.id, e.currentTarget.value)}>
                {#each def.options as option (option.id)}
                  <option value={option.id}>{option.label}</option>
                {/each}
              </select>
            {:else}
              <fieldset>
                <legend>{def.question}</legend>
                <div class="chips">
                  {#each def.options as option (option.id)}
                    <label class="chip">
                      <input
                        type="checkbox"
                        checked={chosen(def.id).includes(option.id)}
                        onchange={() => toggle(def.id, option.id)}
                      />
                      {option.label}
                    </label>
                  {/each}
                </div>
              </fieldset>
            {/if}
            <p class="help">{helpFor(def)}</p>
          </div>
        {/each}
      </section>
    {/each}
  </main>

  <aside class="results" id="results">
    <section class="panel">
      <p class="kicker">Your country</p>
      <h1 aria-live="polite">{profile.name}</h1>
      <p class="regime">{profile.labels.regime.label}</p>
    </section>

    {#if profile.checks.length}
      <section class="panel">
        <h2>Worth a second look</h2>
        <ul class="checks">
          {#each profile.checks as check (check.id)}
            <li class={check.severity}>
              <span class="severity">{check.severity === 'conflict' ? 'Contradiction' : 'Unusual'}</span>
              {check.message}
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <section class="panel">
      <h2>Why this name</h2>
      <dl class="labels">
        {#each familyOrder as family (family)}
          {@const label = profile.labels[family]}
          <div>
            <dt>{familyLabels[family]}</dt>
            <dd>
              <strong>{label.label}.</strong>
              {label.because}
              <span class="based-on">Based on: {label.dependsOn.map(settingLabel).join(', ')}</span>
            </dd>
          </div>
        {/each}
      </dl>
    </section>

    <section class="panel">
      <h2>Where it stands</h2>
      <ul class="axes">
        {#each profile.axes as score (score.axis)}
          {@const axis = axisDef(score.axis)}
          <li>
            <div class="axis-head">
              <span title={axis.help}>{axis.label}</span>
              <span class="score">{score.score}</span>
            </div>
            <div class="track" role="img" aria-label="{axis.label}: {score.score} out of 100">
              <span class="marker" style:left="{score.score}%"></span>
            </div>
            <div class="poles"><span>{axis.low}</span><span>{axis.high}</span></div>
          </li>
        {/each}
      </ul>
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
    (2016–2018). Open source under the
    <a href="https://github.com/eurth-org/eurth-government/blob/main/LICENSE">Apache 2.0 licence</a>.
  </p>
</footer>

<style>
  /* Top bar and header, as on eurth.org */
  .topbar {
    background: var(--accent-fill);
    height: 40px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 var(--space-4);
  }

  .topbar nav {
    display: flex;
    gap: var(--space-6);
  }

  .topbar a {
    color: var(--on-accent-small);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
  }

  .topbar a:hover {
    text-decoration: underline;
  }

  .header {
    background: var(--header);
    border-bottom: 1px solid var(--line);
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
    min-width: 0;
  }

  .actions select {
    min-width: 0;
    max-width: 16rem;
  }

  @media (max-width: 640px) {
    .actions {
      width: 100%;
    }

    .actions select {
      flex: 1;
      max-width: none;
    }
  }

  button,
  select {
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: var(--button);
    padding: 6px 12px;
    cursor: pointer;
  }

  button.primary {
    background: var(--accent-fill);
    color: var(--on-accent-small);
    font-weight: 700;
  }

  button:hover,
  select:hover {
    filter: brightness(1.08);
  }

  /* Mobile: keep the name in view while changing settings */
  .sticky-name {
    display: none;
  }

  @media (max-width: 899px) {
    .sticky-name {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      flex-direction: column;
      padding: var(--space-2) var(--space-4);
      background: var(--surface-raised);
      border-bottom: 1px solid var(--line);
      color: var(--ink);
      text-decoration: none;
    }

    .sticky-name span {
      color: var(--ink-muted);
      font-size: 13px;
    }
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

    .results {
      position: sticky;
      top: var(--space-4);
      max-height: calc(100vh - 2 * var(--space-4));
      overflow-y: auto;
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

  /* Settings */
  .field + .field {
    margin-top: var(--space-4);
  }

  .field label,
  legend {
    display: block;
    margin-bottom: var(--space-1);
    font-weight: 600;
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
  }

  .field select {
    width: 100%;
    background: var(--surface);
    border-color: var(--line-strong);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-weight: 400;
    padding: 4px 10px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-sm);
    cursor: pointer;
    margin: 0;
  }

  .chip:has(input:checked) {
    background: var(--accent-fill);
    border-color: var(--accent-fill);
    color: var(--on-accent-small);
  }

  .help {
    margin: var(--space-1) 0 0;
    color: var(--ink-muted);
    font-size: 13px;
  }

  /* Results */
  .kicker {
    margin: 0 0 var(--space-1);
    color: var(--ink-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.25;
  }

  .regime {
    margin: var(--space-1) 0 0;
    color: var(--ink-muted);
  }

  .checks {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-2);
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

  .severity::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: var(--radius-sm);
    background: var(--unusual);
  }

  .conflict .severity::before {
    background: var(--danger);
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
    color: var(--ink-muted);
    font-size: 13px;
  }

  .axes {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-3);
  }

  .axis-head {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
  }

  .score {
    font-variant-numeric: tabular-nums;
    color: var(--ink-muted);
  }

  .track {
    position: relative;
    height: 4px;
    margin: 8px 0 6px;
    background: var(--line);
    border-radius: 2px;
  }

  .marker {
    position: absolute;
    top: 50%;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent-fill);
    transform: translate(-50%, -50%);
  }

  .poles {
    display: flex;
    justify-content: space-between;
    color: var(--ink-muted);
    font-size: 12px;
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
