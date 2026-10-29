<script lang="ts">
  import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import { ref } from './ref';

  // The newest headline from Eurth News Network (eurth-org/eurth-news), read from its RSS feed
  // in the visitor's browser. If the feed can't be reached, the line simply doesn't appear.
  const feed = 'https://eurth-org.github.io/eurth-news/news.rss';
  let story = $state<{ title: string; link: string } | null>(null);

  onMount(async () => {
    try {
      const response = await fetch(feed);
      if (!response.ok) return;
      const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
      const item = xml.querySelector('item');
      const title = item?.querySelector('title')?.textContent?.trim();
      const link = item?.querySelector('link')?.textContent?.trim();
      if (title && link?.startsWith('https://')) story = { title, link };
    } catch {
      // Offline or blocked: no headline.
    }
  });
</script>

{#if story}
  <li>
    <span class="about-icon"><Icon icon={faNewspaper} /></span>
    <p>
      Meanwhile on Eurth: <a href={ref(story.link)}>{story.title}</a>
      <span class="source">(Eurth News Network)</span>
    </p>
  </li>
{/if}

<style>
  li {
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: var(--space-3);
    align-items: start;
  }

  p {
    margin: 0;
  }

  .about-icon {
    display: inline-flex;
    justify-content: center;
    padding-top: 2px;
    color: var(--ink-muted);
    font-size: 16px;
  }

  .source {
    color: var(--ink-muted);
  }
</style>
