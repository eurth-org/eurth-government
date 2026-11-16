<script lang="ts">
  import { faMarkdown } from '@fortawesome/free-brands-svg-icons';
  import { faAlignLeft, faCheck, faLink, faShareNodes } from '@fortawesome/free-solid-svg-icons';
  import type { EurthProfile } from '@eurth/profile';
  import ProfileButtons from '@eurth/profile/ProfileButtons.svelte';
  import { copyText, paperPlane, toast } from '@eurth/style';
  import type { Profile } from '../model/engine';
  import { description, toMarkdown } from '../model/formats';
  import type { Country } from '../model/settings';
  import { clink } from './fun';
  import { mint } from './minted.svelte';
  import Icon from './Icon.svelte';

  /*
   * Save & share, in Governmint's own buttons: copy the link (a paper plane flies off), share
   * it (the suite's share dialog, which App.svelte opens), copy the country as a description
   * or as Markdown, and load or save the nation's profile file. Nothing is kept in the browser:
   * the link holds the country, and the file carries the nation between Eurth's tools.
   */
  let {
    name,
    named,
    country,
    profile,
    link,
    nation,
    onshare,
    onload,
  }: {
    /** The country's name as shown: "Your country" while it has none. */
    name: string;
    /** Whether the country has a name of its own: a profile file needs one. */
    named: boolean;
    country: Country;
    profile: Profile;
    link: string;
    /** The profile file as it would be saved now; null until the country has a name. */
    nation: EurthProfile | null;
    onshare: () => void;
    onload: (profile: EurthProfile) => void;
  } = $props();

  type What = 'link' | 'description' | 'markdown';
  let copied = $state<What | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(what: What, text: string, said: string, button?: HTMLElement) {
    if (!(await copyText(text))) {
      toast("That didn't copy. Your browser may not allow it here.");
      return;
    }
    mint();
    copied = what;
    clink();
    if (button) paperPlane(button);
    toast(said);
    clearTimeout(timer);
    timer = setTimeout(() => (copied = null), 2000);
  }
</script>

<div class="buttons">
  <button class="btn btn-primary" onclick={(e) => copy('link', link, 'Freshly minted, and copied.', e.currentTarget)}>
    <Icon icon={copied === 'link' ? faCheck : faLink} />
    {copied === 'link' ? 'Copied' : 'Copy link'}
  </button>
  <button class="btn" onclick={() => (mint(), onshare())}>
    <Icon icon={faShareNodes} /> Share
  </button>
  <button class="btn" onclick={() => copy('description', description(name, country, profile), 'Description copied.')}>
    <Icon icon={copied === 'description' ? faCheck : faAlignLeft} />
    {copied === 'description' ? 'Copied' : 'Copy description'}
  </button>
  <button
    class="btn"
    onclick={() => copy('markdown', toMarkdown(name, country, profile, link), 'Markdown copied: paste it into the forum or a wiki.')}
  >
    <Icon icon={copied === 'markdown' ? faCheck : faMarkdown} />
    {copied === 'markdown' ? 'Copied' : 'Copy Markdown'}
  </button>
  <!-- The nation's profile file: these two come from @eurth/profile and wear Governmint's own
       button (app.css). -->
  <ProfileButtons
    profile={nation}
    {onload}
    onerror={(errors) => toast(errors[0]?.message ?? "That file isn't a nation profile. Pick one that ends in .eurth.json.")}
  />
</div>
<p class="help">
  The link holds every setting and the name, so it brings this country back exactly. The profile file carries your
  nation from one Eurth tool to the next{named ? '' : ': name your country to save one'}. Nothing is kept in this
  browser.
</p>

<style>
  .help {
    margin: var(--space-2) 0 0;
    color: var(--ink-muted);
    font-size: 13px;
  }

  /* Side by side in the results column. */
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .buttons .btn,
  .buttons :global(.eu-btn:not(.btn)) {
    padding-inline: 10px;
    white-space: nowrap;
  }
</style>
