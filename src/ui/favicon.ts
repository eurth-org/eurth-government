/**
 * Turns the Eurth globe in the browser tab. Browsers other than Firefox never animate a GIF
 * favicon, so this draws the frames of the globe sprite (the strip eurth-news uses) into a
 * canvas and swaps the favicon for each one. Safari ignores favicon changes made by script and
 * keeps the still globe from index.html; visitors who prefer reduced motion keep it too.
 */
const sprite = '/eurth-globe-sprite.png';
const size = 64; // one frame of the strip, in pixels
const frames = 240;
const interval = 40; // one turn every 9.6 seconds, as in eurth-news

export function animateFavicon() {
  const link = document.getElementById('favicon') as HTMLLinkElement | null;
  if (!link || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return;

  const strip = new Image();
  strip.onload = () => {
    let frame = 0;
    setInterval(() => {
      context.clearRect(0, 0, size, size);
      context.drawImage(strip, 0, frame * size, size, size, 0, 0, size, size);
      link.href = canvas.toDataURL('image/png');
      frame = (frame + 1) % frames;
    }, interval);
  };
  strip.src = sprite;
}
