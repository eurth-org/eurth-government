import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

/**
 * Small delights that live for a moment outside the page's layout: a coin clink, a burst of
 * coins, a paper plane and a toast. Anything that moves is skipped for reduced motion; the
 * clink only plays when the visitor has switched sound on.
 */
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const soundKey = 'governmint:sound';

export function soundOn(): boolean {
  try {
    return localStorage.getItem(soundKey) === 'on';
  } catch {
    return false;
  }
}

export function setSound(on: boolean) {
  try {
    localStorage.setItem(soundKey, on ? 'on' : 'off');
  } catch {
    // Private mode: sound stays off.
  }
}

let audio: AudioContext | null = null;

/** A soft coin clink, made in the browser: a few bright partials that fade fast. */
export function clink() {
  if (!soundOn()) return;
  audio ??= new AudioContext();
  const now = audio.currentTime;
  const partials: [number, number, number][] = [
    [2637, 0, 0.1],
    [3951, 0.01, 0.06],
    [5274, 0.02, 0.035],
    [2793, 0.085, 0.05],
  ];
  for (const [frequency, delay, level] of partials) {
    const tone = audio.createOscillator();
    const volume = audio.createGain();
    tone.frequency.value = frequency;
    volume.gain.setValueAtTime(0.0001, now + delay);
    volume.gain.exponentialRampToValueAtTime(level, now + delay + 0.005);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.3);
    tone.connect(volume).connect(audio.destination);
    tone.start(now + delay);
    tone.stop(now + delay + 0.32);
  }
}

/** A burst of small coins from a point on the screen. */
export function coinBurst(x: number, y: number) {
  clink();
  if (calm()) return;
  for (let i = 0; i < 12; i++) {
    const coin = document.createElement('span');
    coin.className = 'burst-coin';
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
    const reach = 40 + Math.random() * 50;
    coin.style.left = `${x}px`;
    coin.style.top = `${y}px`;
    document.body.append(coin);
    coin
      .animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
          {
            transform: `translate(calc(-50% + ${Math.cos(angle) * reach}px), calc(-50% + ${Math.sin(angle) * reach}px)) rotateY(540deg)`,
            opacity: 1,
            offset: 0.6,
          },
          {
            transform: `translate(calc(-50% + ${Math.cos(angle) * reach}px), calc(-50% + ${Math.sin(angle) * reach + 40}px)) rotateY(720deg)`,
            opacity: 0,
          },
        ],
        { duration: 900 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.4,1)' },
      )
      .finished.finally(() => coin.remove());
  }
}

/** A paper plane that flies off an element, up and to the right. */
export function paperPlane(from: HTMLElement) {
  if (calm()) return;
  const box = from.getBoundingClientRect();
  const [w, h, , , d] = faPaperPlane.icon;
  const plane = document.createElement('span');
  plane.className = 'paper-plane';
  plane.innerHTML = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><path fill="currentColor" d="${d}"/></svg>`;
  plane.style.left = `${box.left + box.width / 2}px`;
  plane.style.top = `${box.top}px`;
  document.body.append(plane);
  plane
    .animate(
      [
        { transform: 'translate(-50%, 0) rotate(0deg)', opacity: 1 },
        { transform: 'translate(40px, -60px) rotate(-8deg)', opacity: 1, offset: 0.5 },
        { transform: 'translate(160px, -170px) rotate(-18deg) scale(0.6)', opacity: 0 },
      ],
      { duration: 1100, easing: 'cubic-bezier(.4,0,.6,1)' },
    )
    .finished.finally(() => plane.remove());
}

/** A short note that slides up from the bottom of the screen, read out by screen readers. */
export function toast(text: string) {
  document.querySelector('.toast')?.remove();
  const note = document.createElement('div');
  note.className = 'toast';
  note.setAttribute('role', 'status');
  note.textContent = text;
  document.body.append(note);
  setTimeout(() => note.classList.add('leaving'), 2400);
  setTimeout(() => note.remove(), 2900);
}

/**
 * "Nice." The visitor's slider landed on 69 and stayed there. Shown above the element for a
 * moment, once per landing; screen readers aren't told, since it's only a wink.
 */
export function nice(at: HTMLElement) {
  const box = at.getBoundingClientRect();
  const note = document.createElement('span');
  note.className = 'nice';
  note.setAttribute('aria-hidden', 'true');
  note.textContent = 'Nice.';
  note.style.left = `${box.left + box.width / 2}px`;
  note.style.top = `${box.top}px`;
  document.body.append(note);
  setTimeout(() => note.remove(), 1600);
}

/**
 * Watches a value and calls `nice` when it settles on 69: not while the slider is still moving
 * through it. Returns a function to feed new values to.
 */
export function niceWatcher(wait = 800) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let last: number | undefined;
  return (value: number, at: () => HTMLElement | null | undefined) => {
    if (value === last) return;
    const first = last === undefined;
    last = value;
    clearTimeout(timer);
    if (first || value !== 69) return;
    timer = setTimeout(() => {
      const el = at();
      if (el) nice(el);
    }, wait);
  };
}

/**
 * Buttons answer a click with a small movement: they press in, and their icon does what the
 * button says (data-click names it: spin-back, tumble, bounce, swing-left, swing-right, pop).
 * Installed once, for the whole page.
 */
export function clickDelights() {
  document.addEventListener('click', (event) => {
    if (calm()) return;
    const button = (event.target as Element | null)?.closest<HTMLElement>('.btn, .pill');
    if (!button || button.matches(':disabled')) return;
    button.classList.remove('clicked');
    void button.offsetWidth;
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 700);
  });
}
