<script lang="ts">
  import { faCopy, faDownload } from '@fortawesome/free-solid-svg-icons';
  import { canCopyImage, canWebp, copyImage, downloadImage, downloadSvg } from './download';
  import { clink, toast } from './fun';
  import Icon from './Icon.svelte';

  // Saving a chart, all in the browser: PNG, SVG or WebP (where the browser can make one), or a
  // copy on the clipboard to paste straight into a chat or a post.
  let { svg, name }: { svg: () => SVGSVGElement | undefined; name: string } = $props();

  async function copy() {
    const chart = svg();
    if (!chart) return;
    try {
      await copyImage(chart);
      toast('Image copied: paste it anywhere.');
      clink();
    } catch {
      toast("This browser wouldn't copy the image. Download it instead.");
    }
  }
</script>

<div class="download">
  <span class="label"><Icon icon={faDownload} /> Download as</span>
  <button class="btn" aria-label="Download {name} as PNG" onclick={() => svg() && downloadImage(svg()!, name, 'png')}>PNG</button>
  <button class="btn" aria-label="Download {name} as SVG" onclick={() => svg() && downloadSvg(svg()!, name)}>SVG</button>
  {#if canWebp}
    <button class="btn" aria-label="Download {name} as WebP" onclick={() => svg() && downloadImage(svg()!, name, 'webp')}>WebP</button>
  {/if}
  {#if canCopyImage}
    <button class="btn" aria-label="Copy {name} as an image" onclick={copy}><Icon icon={faCopy} /> Copy image</button>
  {/if}
</div>

<style>
  .download {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-3);
    font-size: 13px;
  }

  .label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ink-muted);
  }

  .btn {
    padding: 3px 10px;
  }
</style>
