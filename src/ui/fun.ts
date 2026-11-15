/**
 * Governmint's signature: the coin. A soft clink when something is minted or copied, and a
 * burst of small coins when a scale reaches 100%. The tones come from @eurth/style's playTones,
 * which stays silent until the visitor switches sound on in the footer; the burst is skipped
 * for reduced motion and when motion is switched off (calm()). The coins' colours are tokens
 * (src/app.css). Toasts, the paper plane and "Nice." are the suite's own.
 */
import { calm, inView, playTones } from '@eurth/style';

/** A soft coin clink: three gentle, rounded tones, fading in a quarter of a second. */
export function clink() {
  playTones([
    [1319, 0, 0.035],
    [1976, 0.008, 0.016],
    [1397, 0.07, 0.02],
  ]);
}

/** A burst of small coins from a point on the screen. Out of sight, nothing happens. */
export function coinBurst(x: number, y: number) {
  if (!inView(x, y)) return;
  clink();
  if (calm()) return;
  for (let i = 0; i < 12; i++) {
    const coin = document.createElement('span');
    coin.className = 'gov-burst-coin';
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
