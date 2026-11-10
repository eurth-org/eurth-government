import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/**
 * Offline: after the build, writes dist/sw.js from src/offline/sw.js, with the files the app
 * needs to work without signal and a version made from their contents. Left out: the flags
 * (kept as they're shown, rather than 1 MB up front), the sharing image and the server's files.
 */
function offline(): Plugin {
  const skip = (path: string) => /^(flags\/|og\.png$|_headers$|404\.html$|sw\.js$)/.test(path);
  return {
    name: 'governmint-offline',
    apply: 'build',
    closeBundle() {
      const dist = 'dist';
      const files: string[] = [];
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const path = join(dir, entry.name);
          if (entry.isDirectory()) walk(path);
          else files.push(relative(dist, path));
        }
      };
      walk(dist);
      const app = files.filter((f) => !skip(f)).sort();
      const hash = createHash('sha256');
      for (const file of app) hash.update(file).update(readFileSync(join(dist, file)));
      const urls = app.map((f) => (f === 'index.html' ? '/' : `/${f}`));
      const worker = readFileSync('src/offline/sw.js', 'utf8')
        .replace("'__VERSION__'", JSON.stringify(hash.digest('hex').slice(0, 12)))
        .replace('__APP__', JSON.stringify(urls));
      writeFileSync(join(dist, 'sw.js'), worker);
    },
  };
}

export default defineConfig({
  plugins: [svelte(), offline()],
});
