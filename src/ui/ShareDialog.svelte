<script lang="ts">
  import {
    faBluesky,
    faFacebook,
    faLinkedin,
    faReddit,
    faTelegram,
    faTumblr,
    faWhatsapp,
    faXTwitter,
  } from '@fortawesome/free-brands-svg-icons';
  import { faCopy, faEllipsis, faEnvelope, faShareNodes, faXmark, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import yurt from '../assets/eurth-yurt-circle.svg';
  import type { Profile } from '../model/engine';
  import { summary } from '../model/formats';
  import { markdownText } from '../model/text';
  import { clink, toast } from './fun';
  import Icon from './Icon.svelte';

  /**
   * Share a country: the places people share it most, the Eurth.org forum first, each opening
   * that site's own share page in a new tab with the link filled in. Nothing is sent until the
   * visitor posts it there. Where the device has a share sheet, "More" opens it.
   */
  let {
    open,
    onclose,
    name,
    profile,
    link,
  }: { open: boolean; onclose: () => void; name: string; profile: Profile; link: string } = $props();
  let dialog: HTMLDialogElement;

  const title = $derived(`${name}: ${profile.name}`);
  // Unnamed, the country is "Your country", which reads better in lower case mid-sentence.
  const heading = $derived(name === 'Your country' ? 'your country' : name);
  const text = $derived(`${summary(name, profile)} Freshly minted on Governmint.`);
  const e = encodeURIComponent;
  const canShare = typeof navigator.share === 'function';

  interface Target {
    label: string;
    href: string;
    icon?: IconDefinition;
    /** A brand colour for the icon; dark ones follow the text colour. */
    colour?: string;
  }

  const targets: Target[] = $derived([
    // The forum reads the body as Markdown, so the name goes in as plain text.
    {
      label: 'Eurth forum',
      href: `https://eurth.org/new-topic?title=${e(title)}&body=${e(`${summary(markdownText(name), profile)} Freshly minted on Governmint.\n\n${link}`)}`,
    },
    { label: 'Reddit', icon: faReddit, colour: '#ff4500', href: `https://www.reddit.com/submit?url=${e(link)}&title=${e(title)}` },
    { label: 'Bluesky', icon: faBluesky, colour: '#1185fe', href: `https://bsky.app/intent/compose?text=${e(`${text} ${link}`)}` },
    { label: 'X', icon: faXTwitter, href: `https://x.com/intent/post?text=${e(text)}&url=${e(link)}` },
    { label: 'Facebook', icon: faFacebook, colour: '#0866ff', href: `https://www.facebook.com/sharer/sharer.php?u=${e(link)}` },
    { label: 'LinkedIn', icon: faLinkedin, colour: '#0a66c2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(link)}` },
    {
      label: 'Tumblr',
      icon: faTumblr,
      href: `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${e(link)}&title=${e(title)}&caption=${e(text)}`,
    },
    { label: 'WhatsApp', icon: faWhatsapp, colour: '#25d366', href: `https://wa.me/?text=${e(`${text} ${link}`)}` },
    { label: 'Telegram', icon: faTelegram, colour: '#26a5e4', href: `https://t.me/share/url?url=${e(link)}&text=${e(text)}` },
    { label: 'Email', icon: faEnvelope, href: `mailto:?subject=${e(title)}&body=${e(`${text}\n\n${link}`)}` },
  ]);

  $effect(() => {
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toast('Link copied.');
      clink();
    } catch {
      toast('Select the link and copy it.');
    }
  }

  async function more() {
    try {
      await navigator.share({ title, text, url: link });
    } catch {
      // Cancelled: nothing to do.
    }
  }
</script>

<dialog bind:this={dialog} onclose={onclose} aria-labelledby="share-dialog-title">
  <div class="top">
    <h2 id="share-dialog-title"><Icon icon={faShareNodes} /> Share {heading}</h2>
    <button class="btn close" aria-label="Close" onclick={() => dialog.close()}><Icon icon={faXmark} /></button>
  </div>
  <p class="preview">{text}</p>

  <div class="link">
    <label class="visually-hidden" for="share-dialog-link">Link</label>
    <input id="share-dialog-link" readonly value={link} onfocus={(e) => e.currentTarget.select()} />
    <button class="btn btn-primary" onclick={copy}><Icon icon={faCopy} /> Copy</button>
  </div>

  <ul class="targets">
    {#each targets as t (t.label)}
      <li>
        <a class="btn" href={t.href}>
          {#if t.icon}
            <span class="target-icon" style:color={t.colour}><Icon icon={t.icon} /></span>
          {:else}
            <img class="target-icon" src={yurt} alt="" width="18" height="18" />
          {/if}
          {t.label}
        </a>
      </li>
    {/each}
    {#if canShare}
      <li>
        <button class="btn" onclick={more}><span class="target-icon"><Icon icon={faEllipsis} /></span> More</button>
      </li>
    {/if}
  </ul>
  <p class="note">Each opens that site's own share page with the link filled in. Nothing is posted until you post it.</p>
</dialog>

<style>
  dialog {
    width: min(520px, calc(100vw - 2 * var(--space-4)));
    max-height: min(720px, calc(100dvh - 2 * var(--space-4)));
    padding: var(--space-4);
    border: 1px solid var(--line);
    border-radius: var(--radius-panel);
    background: var(--surface-raised);
    color: var(--ink);
    overflow-y: auto;
  }

  dialog::backdrop {
    background: rgb(0 0 0 / 0.55);
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  h2 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    font-size: 18px;
  }

  .preview {
    margin: var(--space-2) 0 var(--space-3);
    color: var(--ink-muted);
  }

  .link {
    display: flex;
    gap: var(--space-2);
  }

  .link input {
    flex: 1;
    min-width: 0;
    padding: 4px 8px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    background: var(--surface);
    font-size: 13px;
  }

  .targets {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-2);
    margin: var(--space-4) 0 var(--space-2);
    padding: 0;
    list-style: none;
  }

  .targets .btn {
    width: 100%;
    color: var(--ink);
    text-decoration: none;
  }

  .target-icon {
    display: inline-flex;
    width: 18px;
    height: 18px;
    align-items: center;
    justify-content: center;
    font-size: 17px;
  }

  .note {
    margin: 0;
    color: var(--ink-muted);
    font-size: 13px;
  }
</style>
