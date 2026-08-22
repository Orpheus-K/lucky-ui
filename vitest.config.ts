import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    // Vite 5.2 opens its fallback HMR WebSocket on 24678 even in middleware mode.
    // A dedicated loopback API server keeps unit runs isolated from unrelated dev servers.
    api: { host: '127.0.0.1', port: 51204, strictPort: true },
    environment: 'node',
    include: ['tests/unit/**/*.spec.ts'],
  },
});
