<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { Tween } from 'svelte/motion';
  import { axes, type AxisId } from '../model/axes';
  import type { AxisScore } from '../model/engine';
  import type { Country, SettingId } from '../model/settings';
  import { describeSuggestion, suggest, type Suggestion } from '../model/suggest';
  import { calm, niceWatcher } from '@eurth/style';
  import Icon from '@eurth/style/components/Icon.svelte';
  import { coinBurst } from './fun';
  import { axisIcons } from './icons';

  let {
    scores,
    country,
    onapply,
    onflash,
  }: {
    scores: AxisScore[];
    country: Country;
    onapply: (country: Country) => void;
    onflash: (ids: SettingId[], scroll: boolean) => void;
  } = $props();

  let hint = $state<{ axis: AxisId; direction: 1 | -1; suggestions: Suggestion[] } | null>(null);

  const axisDef = (id: AxisId) => axes.find((a) => a.id === id)!;

  // Scores glide to their new values. One that settles on 69 gets a "Nice."; one that reaches
  // 100% gets a little burst of coins.
  const shown = Tween.of(() => scores.map((s) => s.score), { duration: calm() ? 0 : 400, easing: cubicOut });
  const watchers = Object.fromEntries(axes.map((a) => [a.id, niceWatcher()]));
  const before = new Map<AxisId, number>();
  $effect(() => {
    for (const s of scores) {
      const output = () => document.getElementById(`score-${s.axis}`);
      watchers[s.axis]!(s.score, output);
      const previous = before.get(s.axis);
      if (previous !== undefined && previous < 100 && s.score === 100) {
        const box = output()?.getBoundingClientRect();
        if (box) coinBurst(box.left + box.width / 2, box.top + box.height / 2);
      }
      before.set(s.axis, s.score);
    }
  });

  // Dragging a scale asks how to move it: the settings that would are shown and flash.
  function drag(score: AxisScore, value: number) {
    const direction = Math.sign(value - score.score) as -1 | 0 | 1;
    if (direction === 0 || (hint?.axis === score.axis && hint.direction === direction)) return;
    const suggestions = suggest(country, score.axis, direction);
    hint = { axis: score.axis, direction, suggestions };
    onflash(
      suggestions.map((s) => s.setting),
      false,
    );
  }

  // Applying keeps the hints open, refreshed for the new settings, until the visitor closes them.
  function apply(s: Suggestion) {
    onapply(s.country);
    if (hint) hint = { ...hint, suggestions: suggest(s.country, hint.axis, hint.direction) };
  }
</script>

<ul class="scales">
  {#each scores as score, i (score.axis)}
    {@const axis = axisDef(score.axis)}
    {@const [lowIcon, highIcon] = axisIcons[score.axis]}
    <li>
      <div class="head">
        <span class="eu-label" title={axis.help}>{axis.label}</span>
        <span class="eu-data score" id="score-{score.axis}">{Math.round(shown.current[i] ?? score.score)}%</span>
      </div>
      <div class="slider">
        <span class="end" title={axis.low}><Icon icon={lowIcon} label={axis.low} /></span>
        <input
          class="eu-range"
          style:--fill="{shown.current[i] ?? score.score}%"
          type="range"
          min="0"
          max="100"
          value={score.score}
          aria-label="{axis.label}: {score.score}%. Drag to see which settings move it."
          aria-describedby={hint?.axis === score.axis ? `hint-${score.axis}` : undefined}
          oninput={(e) => drag(score, Number(e.currentTarget.value))}
          onchange={(e) => (e.currentTarget.value = String(score.score))}
        />
        <span class="end" title={axis.high}><Icon icon={highIcon} label={axis.high} /></span>
      </div>
      <div class="eu-help poles" aria-hidden="true"><span>{axis.low}</span><span>{axis.high}</span></div>

      {#if hint?.axis === score.axis}
        <div class="hint" id="hint-{score.axis}" role="status">
          {#if hint.suggestions.length}
            <p>To move towards <strong>{hint.direction > 0 ? axis.high : axis.low}</strong>, change one of these:</p>
            <ul>
              {#each hint.suggestions as s (s.setting)}
                <li>
                  <button type="button" class="eu-btn where" onclick={() => onflash([s.setting], true)}>{describeSuggestion(s)}</button>
                  <span class="eu-data delta">{s.delta > 0 ? '+' : ''}{s.delta}%</span>
                  <button type="button" class="eu-btn eu-btn--selected" onclick={() => apply(s)}>Apply</button>
                </li>
              {/each}
            </ul>
          {:else}
            <p>
              Nothing moves it further towards <strong>{hint.direction > 0 ? axis.high : axis.low}</strong> without
              contradicting another setting.
            </p>
          {/if}
          <button type="button" class="eu-btn eu-btn--quiet" onclick={() => (hint = null)}>Close</button>
        </div>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .scales {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .head {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .score {
    color: var(--ink-muted);
  }

  .slider {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .end {
    display: inline-flex;
    justify-content: center;
    width: var(--space-5);
    color: var(--ink-muted);
  }

  .eu-range {
    flex: 1;
    min-width: 0;
  }

  /* What each end means, in words under the icons. */
  .poles {
    display: flex;
    justify-content: space-between;
    gap: var(--space-2);
    margin-top: calc(-1 * var(--space-2));
  }

  .hint {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    margin-top: var(--space-2);
    padding: var(--space-3);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-md);
    background: var(--surface);
    font: var(--type-body-sm);
  }

  .hint ul {
    display: grid;
    gap: var(--space-2);
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .hint li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  /* A button whose label is a sentence: it may run over two lines. */
  .where {
    flex: 1;
    justify-content: flex-start;
    min-width: 0;
    padding-block: var(--space-2);
    text-align: left;
  }

  .delta {
    color: var(--ink-muted);
    white-space: nowrap;
  }
</style>
