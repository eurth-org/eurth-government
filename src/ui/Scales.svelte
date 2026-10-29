<script lang="ts">
  import { axes, type AxisId } from '../model/axes';
  import type { AxisScore } from '../model/engine';
  import type { Country, SettingId } from '../model/settings';
  import { describeSuggestion, suggest, type Suggestion } from '../model/suggest';
  import Icon from './Icon.svelte';
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
  {#each scores as score (score.axis)}
    {@const axis = axisDef(score.axis)}
    {@const [lowIcon, highIcon] = axisIcons[score.axis]}
    <li>
      <div class="head">
        <span class="label" title={axis.help}>{axis.label}</span>
        <span class="score">{score.score}%</span>
      </div>
      <div class="slider">
        <span class="end" title={axis.low}><Icon icon={lowIcon} label={axis.low} /></span>
        <input
          class="range"
          style:--fill="{score.score}%"
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
      <div class="poles"><span>{axis.low}</span><span>{axis.high}</span></div>

      {#if hint?.axis === score.axis}
        <div class="hint" id="hint-{score.axis}" role="status">
          {#if hint.suggestions.length}
            <p>To move towards <strong>{hint.direction > 0 ? axis.high : axis.low}</strong>, change one of these:</p>
            <ul>
              {#each hint.suggestions as s (s.setting)}
                <li>
                  <button class="link" onclick={() => onflash([s.setting], true)}>{describeSuggestion(s)}</button>
                  <span class="delta">{s.delta > 0 ? '+' : ''}{s.delta}%</span>
                  <button class="btn btn-primary apply" onclick={() => apply(s)}>Apply</button>
                </li>
              {/each}
            </ul>
          {:else}
            <p>
              Nothing moves it further towards <strong>{hint.direction > 0 ? axis.high : axis.low}</strong> without
              contradicting another setting.
            </p>
          {/if}
          <button class="link dismiss" onclick={() => (hint = null)}>Close</button>
        </div>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .scales {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-3);
  }

  .head {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
  }

  .score {
    color: var(--ink-muted);
    font-variant-numeric: tabular-nums;
  }

  .slider {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .end {
    display: inline-flex;
    color: var(--ink-muted);
    font-size: 16px;
  }

  .range {
    flex: 1;
  }

  .poles {
    display: flex;
    justify-content: space-between;
    padding: 0 26px;
    color: var(--ink-muted);
    font-size: 12px;
  }

  .hint {
    margin-top: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    background: var(--surface);
    font-size: 14px;
  }

  .hint p {
    margin: 0 0 var(--space-1);
  }

  .hint ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--space-1);
  }

  .hint li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .delta {
    margin-left: auto;
    color: var(--ink-muted);
    font-variant-numeric: tabular-nums;
  }

  .link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent-text);
    text-align: left;
    text-decoration: underline;
    cursor: pointer;
  }

  .apply {
    padding: 2px 10px;
  }

  .dismiss {
    margin-top: var(--space-1);
    font-size: 13px;
  }
</style>
