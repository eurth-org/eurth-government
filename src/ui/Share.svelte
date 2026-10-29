<script lang="ts">
  import { faCheck, faFloppyDisk, faLink, faShareNodes } from '@fortawesome/free-solid-svg-icons';
  import type { Profile } from '../model/engine';
  import { clink, paperPlane, toast } from './fun';
  import Icon from './Icon.svelte';
  import ShareDialog from './ShareDialog.svelte';

  // Copy the link (a paper plane flies off), share it, or save the country on this device.
  let { name, profile, link, onsave }: { name: string; profile: Profile; link: string; onsave: () => void } = $props();

  let sharing = $state(false);
  let copied = $state(false);

  async function copy(button: HTMLElement) {
    await navigator.clipboard.writeText(link);
    copied = true;
    clink();
    paperPlane(button);
    toast('Freshly minted, and copied.');
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="buttons">
  <button class="btn btn-primary" onclick={(e) => copy(e.currentTarget)}>
    <Icon icon={copied ? faCheck : faLink} />
    {copied ? 'Copied' : 'Copy link'}
  </button>
  <button class="btn" onclick={() => (sharing = true)}>
    <Icon icon={faShareNodes} /> Share
  </button>
  <button class="btn" data-click="bounce" onclick={onsave}>
    <Icon icon={faFloppyDisk} /> Save to this device
  </button>
</div>
<ShareDialog open={sharing} onclose={() => (sharing = false)} {name} {profile} {link} />
<p class="help">
  The link holds every setting and the name, so it brings this country back exactly. Saved countries are listed under
  Examples &amp; countries, in this browser only.
</p>

<style>
  .help {
    margin: var(--space-2) 0 0;
    color: var(--ink-muted);
    font-size: 13px;
  }

  /* The three side by side in the results column. */
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .buttons .btn {
    padding-inline: 10px;
    white-space: nowrap;
  }
</style>
