<script lang="ts">
  import { faCheck, faCopy, faDownload } from '@fortawesome/free-solid-svg-icons';
  import { toast } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import { onMount } from 'svelte';
  import { canCopyImage, canWebp, copyImage, downloadImage, downloadSvg, downloadText } from './download';
  import { clink } from './fun';
  import { mint } from './minted.svelte';

  /**
   * Saving a chart, all in the browser: PNG, SVG or WebP (where the browser can make one), any
   * text versions the chart offers (Markdown, JSON), or a copy on the clipboard to paste straight
   * into a chat or a post.
   */
  interface TextVersion {
    label: string;
    extension: string;
    type: string;
    make: () => string;
  }

  let { svg, name, texts = [] }: { svg: () => SVGSVGElement | undefined; name: string; texts?: TextVersion[] } =
    $props();

  let copied = $state(false);
  // What this browser can do, asked once the page is in it.
  let webp = $state(false);
  let clipboard = $state(false);
  onMount(() => {
    webp = canWebp();
    clipboard = canCopyImage();
  });

  async function copy() {
    const chart = svg();
    if (!chart) return;
    if (!(await copyImage(chart))) {
      toast("This browser wouldn't copy the image. Download it instead.");
      return;
    }
    mint();
    copied = true;
    toast('Image copied: paste it anywhere.');
    clink();
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="download">
  <span class="eu-muted label"><Icon icon={faDownload} /> Download as</span>
  <button type="button" class="eu-btn" aria-label="Download {name} as PNG" onclick={() => svg() && (mint(), downloadImage(svg()!, name, 'png'))}>PNG</button>
  <button type="button" class="eu-btn" aria-label="Download {name} as SVG" onclick={() => svg() && (mint(), downloadSvg(svg()!, name))}>SVG</button>
  {#if webp}
    <button type="button" class="eu-btn" aria-label="Download {name} as WebP" onclick={() => svg() && (mint(), downloadImage(svg()!, name, 'webp'))}>WebP</button>
  {/if}
  {#each texts as t (t.label)}
    <button type="button" class="eu-btn" aria-label="Download {name} as {t.label}" onclick={() => (mint(), downloadText(t.make(), `${name}.${t.extension}`, t.type))}>
      {t.label}
    </button>
  {/each}
  {#if clipboard}
    <button type="button" class="eu-btn" aria-label={copied ? `Copied: ${name}` : `Copy image of ${name}`} onclick={copy}>
      <Icon icon={copied ? faCheck : faCopy} />
      {copied ? 'Copied' : 'Copy image'}
    </button>
  {/if}
</div>

<style>
  .download {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font: var(--type-body-sm);
  }

  /* Six to a row in a narrow column: a little less padding each. */
  .eu-btn {
    padding: 0 var(--space-3);
  }
</style>
