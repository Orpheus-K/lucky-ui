import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    api: false,
    environment: 'node',
    include: ['tests/unit/**/*.spec.ts'],
  },
});
