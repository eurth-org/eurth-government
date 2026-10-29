/**
 * Saves a chart as SVG or PNG, entirely in the browser. The page styles charts with CSS
 * variables, so the copy gets each element's computed colours and sizes written in, and wide
 * gamut colours (Eurth blue in P3) converted to sRGB, which every image viewer understands.
 */
const painted = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linejoin',
  'stroke-linecap',
  'opacity',
  'font-size',
  'font-family',
  'font-weight',
  'text-anchor',
  'dominant-baseline',
  'paint-order',
];

const svgNS = 'http://www.w3.org/2000/svg';

let probe: CanvasRenderingContext2D | null = null;

/** Any CSS colour as rgb() or rgba(), read back from a one-pixel canvas. */
function srgb(colour: string): string {
  if (!/color\(|oklch|lab\(|lch\(/.test(colour)) return colour;
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe) return colour;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = colour;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a! / 255).toFixed(3)})`;
}

function standalone(svg: SVGSVGElement): { text: string; width: number; height: number } {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const from = [svg, ...svg.querySelectorAll('*')];
  const to = [clone, ...clone.querySelectorAll('*')];
  from.forEach((element, i) => {
    const style = getComputedStyle(element);
    const target = to[i]!;
    for (const property of painted) {
      const value = style.getPropertyValue(property);
      if (value) target.setAttribute(property, srgb(value));
    }
    target.removeAttribute('class');
    target.removeAttribute('style');
  });
  // A strip along the bottom for the credit, "gov.eurth.org", small in the right-hand corner.
  const view = svg.viewBox.baseVal;
  const size = Math.max(7, view.width / 45);
  const box = { x: view.x, y: view.y, width: view.width, height: view.height + size * 1.8 };
  const background = srgb(getComputedStyle(svg.closest('.panel') ?? document.body).backgroundColor);
  const ground = document.createElementNS(svgNS, 'rect');
  for (const [key, value] of Object.entries({ x: box.x, y: box.y, width: box.width, height: box.height, fill: background })) {
    ground.setAttribute(key, String(value));
  }
  clone.insertBefore(ground, clone.firstChild);
  const credit = document.createElementNS(svgNS, 'text');
  const muted = getComputedStyle(document.documentElement).getPropertyValue('--ink-muted').trim() || '#5f5f5f';
  for (const [key, value] of Object.entries({
    x: box.x + box.width - size * 0.6,
    y: box.y + box.height - size * 0.6,
    'text-anchor': 'end',
    'font-family': 'system-ui, Arial, sans-serif',
    'font-size': size,
    fill: srgb(muted),
  })) {
    credit.setAttribute(key, String(value));
  }
  credit.textContent = 'gov.eurth.org';
  clone.append(credit);
  clone.setAttribute('xmlns', svgNS);
  clone.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
  clone.removeAttribute('preserveAspectRatio');
  clone.setAttribute('width', String(box.width));
  clone.setAttribute('height', String(box.height));
  return { text: new XMLSerializer().serializeToString(clone), width: box.width, height: box.height };
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvg(svg: SVGSVGElement, name: string) {
  save(new Blob([standalone(svg).text], { type: 'image/svg+xml' }), `${name}.svg`);
}

/** The chart drawn on a canvas, `scale` times its size, as a PNG or WebP. */
async function render(svg: SVGSVGElement, type: string, scale = 3): Promise<Blob> {
  const { text, width, height } = standalone(svg);
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No image'))), type, 0.92),
  );
}

export async function downloadImage(svg: SVGSVGElement, name: string, format: 'png' | 'webp') {
  save(await render(svg, `image/${format}`), `${name}.${format}`);
}

/** Puts the chart on the clipboard as a PNG, to paste into a chat, a post or a document. */
export function copyImage(svg: SVGSVGElement): Promise<void> {
  return navigator.clipboard.write([new ClipboardItem({ 'image/png': render(svg, 'image/png') })]);
}

/** Whether this browser can make WebP images (Safari, for one, can't yet). */
export const canWebp = (() => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
})();

export const canCopyImage = typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard?.write === 'function';
