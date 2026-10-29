<script lang="ts">
  import { faDownload } from '@fortawesome/free-solid-svg-icons';
  import { downloadPng, downloadSvg } from './download';
  import Icon from './Icon.svelte';

  // Two small buttons that save a chart; everything happens in the browser.
  let { svg, name }: { svg: () => SVGSVGElement | undefined; name: string } = $props();
</script>

<div class="download">
  <span class="label"><Icon icon={faDownload} /> Download</span>
  <button class="btn" onclick={() => svg() && downloadPng(svg()!, name)}>PNG</button>
  <button class="btn" onclick={() => svg() && downloadSvg(svg()!, name)}>SVG</button>
</div>

<style>
  .download {
    display: flex;
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
