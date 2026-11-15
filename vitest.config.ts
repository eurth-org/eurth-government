import { defineConfig } from 'vitest/config';

// The suite's checks and the link tests (tests/), the model's own (src/) and the Worker's (worker/).
export default defineConfig({
  test: {
    include: ['tests/**/*.test.{js,ts}', 'src/**/*.test.ts', 'worker/**/*.test.ts'],
  },
});
