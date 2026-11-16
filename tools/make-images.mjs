// Makes the pictures that aren't drawn by hand, with the Chrome on this machine: the favicon,
// the home-screen icons and the sharing image. Run it after changing the coin or the sharing
// image, and commit what it writes to public/:  npm run images
//
// The Eurth coin (src/assets/eurth-coin.svg) is Governmint's own mark: it is the favicon, it
// stands on Eurth blue on home screens, and it is the picture on the sharing image. The header
// of the site shows the yurt, as every Eurth tool's does.
import { readFileSync } from 'node:fs';
import { resolveColors } from '@eurth/style';
import { makeImages, sharingImage } from '@eurth/style/images';
import tokens from '@eurth/style/tokens.json' with { type: 'json' };
import { site } from '../eurth.config.mjs';

const coin = readFileSync(new URL('../src/assets/eurth-coin.svg', import.meta.url), 'utf8');
const made = await makeImages({
  logo: coin,
  ground: resolveColors(tokens, 'light')['eurth-blue'],
  sharing: [{ file: 'og.png', html: sharingImage({ site, art: coin }) }],
});
console.log(`Made ${made.map((file) => `public/${file}`).join(', ')}`);
