import { compassAxes, compassPoint, quadrants } from './compass';
import { countries } from './countries';
import { scoreAxes, type AxisScore } from './engine';
import { examples } from './examples';

/** Which reference points the compass shows beside the country. */
export type CompassMode = 'examples' | 'countries' | 'none';

export interface CompassDot {
  name: string;
  x: number;
  y: number;
}

let cached: Record<'examples' | 'countries', CompassDot[]> | undefined;

export function compassReferences(mode: CompassMode): CompassDot[] {
  if (mode === 'none') return [];
  cached ??= {
    examples: examples.map((e) => ({ name: e.title.replace(/-style\b/, ''), ...compassPoint(scoreAxes(e.country)) })),
    countries: countries.map((c) => ({ name: c.name, ...compassPoint(scoreAxes(c.country)) })),
  };
  return cached[mode];
}

export function quadrantOf(point: { x: number; y: number }): string {
  if (point.y >= 0) return point.x < 0 ? quadrants.topLeft : quadrants.topRight;
  return point.x < 0 ? quadrants.bottomLeft : quadrants.bottomRight;
}

/** A name Mermaid takes as a point label, without the characters its syntax uses. */
const label = (name: string) => name.replace(/[:[\]"#;{}]/g, '').trim() || 'Country';
/** From the compass's -100…100 to Mermaid's 0…1. */
const unit = (value: number) => ((value + 100) / 200).toFixed(3);

/**
 * Markdown with a Mermaid quadrant chart of the compass, for GitHub, Obsidian or any other
 * place that draws Mermaid; elsewhere it reads as a short list.
 */
export function compassMarkdown(name: string, scores: AxisScore[], mode: CompassMode, link: string): string {
  const here = compassPoint(scores);
  return [
    `### ${name} on the compass`,
    '',
    '```mermaid',
    'quadrantChart',
    `    title ${label(name)}`,
    `    x-axis ${compassAxes.x.low} --> ${compassAxes.x.high}`,
    `    y-axis ${compassAxes.y.low} --> ${compassAxes.y.high}`,
    `    quadrant-1 ${quadrants.topRight}`,
    `    quadrant-2 ${quadrants.topLeft}`,
    `    quadrant-3 ${quadrants.bottomLeft}`,
    `    quadrant-4 ${quadrants.bottomRight}`,
    ...compassReferences(mode).map((r) => `    ${label(r.name)}: [${unit(r.x)}, ${unit(r.y)}]`),
    `    ${label(name)}: [${unit(here.x)}, ${unit(here.y)}]`,
    '```',
    '',
    `- **Across:** ${here.x}, from ${compassAxes.x.low.toLowerCase()} (-100) to ${compassAxes.x.high.toLowerCase()} (100)`,
    `- **Up:** ${here.y}, from ${compassAxes.y.low.toLowerCase()} (-100) to ${compassAxes.y.high.toLowerCase()} (100)`,
    `- **Quadrant:** ${quadrantOf(here)}`,
    '',
    `<small>Made with [Governmint](${link})</small>`,
    '',
  ].join('\n');
}

/** The compass as JSON: the country's place, its quadrant, and the reference points shown. */
export function compassJson(name: string, scores: AxisScore[], mode: CompassMode, link: string): string {
  const here = compassPoint(scores);
  const data = {
    name,
    compass: {
      across: here.x,
      up: here.y,
      quadrant: quadrantOf(here),
      scale: {
        across: `${compassAxes.x.low} (-100) to ${compassAxes.x.high} (100)`,
        up: `${compassAxes.y.low} (-100) to ${compassAxes.y.high} (100)`,
      },
    },
    references: compassReferences(mode).map((r) => ({ name: r.name, across: r.x, up: r.y })),
    link,
    madeWith: 'Governmint, https://gov.eurth.org',
  };
  return `${JSON.stringify(data, null, 2)}\n`;
}
