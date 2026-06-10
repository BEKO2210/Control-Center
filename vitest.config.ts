// ============================================================================
// Clawbot Mission Control — Vitest configuration
// Unit tests for pure logic (message protocol, store migrations, utils).
// Uses the Node environment — no jsdom needed for the pure modules under test.
// ============================================================================

import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
