/// <reference types="node" />
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The Content-Security-Policy in public/_headers allows index.html's one inline script by its
// hash. Change the script and the hash must change too, or the page would stay light in dark mode.
describe('security headers', () => {
  const headers = readFileSync('public/_headers', 'utf8');
  const html = readFileSync('index.html', 'utf8');

  it("allow index.html's inline scripts, and no others", () => {
    const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]!);
    expect(inline.length).toBeGreaterThan(0);
    for (const script of inline) {
      const hash = createHash('sha256').update(script).digest('base64');
      expect(headers).toContain(`'sha256-${hash}'`);
    }
    expect(headers).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it('turn off what the page never uses', () => {
    expect(headers).toMatch(/object-src 'none'/);
    expect(headers).toMatch(/Permissions-Policy: camera=\(\), microphone=\(\), geolocation=\(\)/);
  });
});
