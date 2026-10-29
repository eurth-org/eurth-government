<script lang="ts">
  import yurt from './eurth-yurt-circle.svg';

  const audiences = [
    {
      who: 'Worldbuilders and writers',
      what: 'who need a believable government for a fictional country.',
    },
    {
      who: 'Roleplayers and nation-sim players',
      what: 'who want their nation to add up.',
    },
    {
      who: 'Anyone curious',
      what: 'about how states work, and what changes when you turn one dial.',
    },
  ];

  const roadmap = [
    { name: 'Government', what: 'how power is split, chosen and checked.' },
    { name: 'Economy and budget', what: 'sectors, taxes, spending and the balance.' },
    { name: 'Law and society', what: "what's legal, what isn't, and who has which rights." },
    { name: 'Sharing', what: 'export to wiki infoboxes, forum posts and image cards.' },
    { name: 'Compare and search', what: 'put countries side by side, or search a whole world of them.' },
  ];
</script>

<div class="page">
  <div class="coin" aria-hidden="true"></div>
  <main>
    <section class="hero">
      <p class="kicker">Under construction</p>
      <h1>Governmint</h1>
      <p class="tagline">Freshly minted governments.</p>
      <p class="lead">
        Design a country from the ground up: who governs it and how they get the job, which laws it keeps,
        how it taxes and what it spends on. Governmint tells you what kind of state you've made, explains why,
        and points out where it contradicts itself.
      </p>
      <p>Free, in your browser, no account needed. Your whole country fits in a link you can share.</p>
      <a class="button" href="https://github.com/eurth-org/eurth-government">Follow along on GitHub</a>
    </section>

    <section aria-labelledby="for-whom">
      <h2 id="for-whom">Who it's for</h2>
      <ul class="cards">
        {#each audiences as { who, what }}
          <li><strong>{who}</strong> {what}</li>
        {/each}
      </ul>
    </section>

    <section aria-labelledby="coming">
      <h2 id="coming">What's coming</h2>
      <ol class="roadmap">
        {#each roadmap as { name, what }}
          <li><strong>{name}:</strong> {what}</li>
        {/each}
      </ol>
    </section>
  </main>

  <footer>
    <p class="made-by">
      <img src={yurt} alt="" width="24" height="24" />
      <span>
        Made by <a href="https://eurth.org">Eurth</a>, a Worldbuilding &amp; Roleplay Writing Community.
        Built a country you like? Give it a world to live in.
      </span>
    </p>
    <p>
      Inspired by the
      <a href="https://minkinfin.github.io/Filteries-Political-Simulator-Archive/">Filteries Political Simulator</a>
      (2016–2018). Open source under the
      <a href="https://github.com/eurth-org/eurth-government/blob/main/LICENSE">Apache 2.0 licence</a>.
    </p>
  </footer>
</div>

<style>
  .page {
    position: relative;
    overflow-x: clip;
  }

  main,
  footer {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 var(--space-4);
  }

  main {
    padding-top: calc(var(--space-12) + 196px);
  }

  footer {
    padding-bottom: var(--space-8);
  }

  @media (min-width: 900px) {
    main,
    footer {
      padding-left: var(--space-12);
      padding-right: var(--space-12);
    }

    main {
      padding-top: var(--space-16);
    }

    footer {
      padding-bottom: var(--space-12);
    }
  }

  .hero {
    max-width: 620px;
  }

  /* The horizon disc from the Eurth design system, doubling as a freshly minted coin.
     It bleeds off the right edge and never sits behind text. */
  .coin {
    position: absolute;
    top: -96px;
    right: -120px;
    width: 300px;
    height: 300px;
    border-radius: var(--radius-full);
    background: var(--eurth-blue);
  }

  .coin::after {
    content: '';
    position: absolute;
    inset: 20px;
    border-radius: var(--radius-full);
    border: 2px solid var(--parchment);
  }

  @media (min-width: 900px) {
    .coin {
      top: 40px;
      right: -300px;
      width: 520px;
      height: 520px;
    }

    .coin::after {
      inset: 32px;
    }
  }

  @media (min-width: 1100px) {
    .coin {
      right: -160px;
    }
  }

  .kicker {
    margin: 0 0 var(--space-3);
    font-size: 14px;
    line-height: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }

  h1 {
    margin: 0;
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(44px, 12vw, 64px);
    line-height: 1.06;
    letter-spacing: -0.01em;
  }

  .tagline {
    margin: var(--space-2) 0 var(--space-8);
    font-family: var(--font-serif);
    font-size: 28px;
    line-height: 36px;
  }

  .lead {
    font-size: 18px;
    line-height: 28px;
  }

  .hero p:not(.kicker, .tagline) {
    margin: 0 0 var(--space-4);
  }

  .button {
    display: inline-block;
    margin-top: var(--space-4);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-md);
    background: var(--accent-fill);
    color: var(--on-accent-small);
    font-size: 15px;
    line-height: 20px;
    font-weight: 700;
    text-decoration: none;
  }

  h2 {
    margin: var(--space-16) 0 var(--space-6);
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: 28px;
    line-height: 36px;
  }

  .cards {
    display: grid;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  @media (min-width: 720px) {
    .cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .cards li {
    padding: var(--space-6);
    border-radius: var(--radius-md);
    background: var(--surface-raised);
    border: 1px solid var(--line);
  }

  .cards strong {
    display: block;
    margin-bottom: var(--space-1);
  }

  .roadmap {
    margin: 0;
    padding-left: var(--space-6);
    max-width: 620px;
  }

  .roadmap li + li {
    margin-top: var(--space-2);
  }

  footer {
    margin-top: var(--space-16);
    color: var(--ink-muted);
    font-size: 14px;
    line-height: 20px;
  }

  footer p {
    margin: 0 0 var(--space-3);
    max-width: 620px;
  }

  footer p:first-child {
    padding-top: var(--space-6);
    border-top: 1px solid var(--line);
  }

  .made-by {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
  }

  .made-by img {
    flex: none;
    width: 24px;
    height: 24px;
    margin-top: -2px;
  }
</style>
