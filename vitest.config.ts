import path from 'node:path';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const uniPluginRequire = createRequire(require.resolve('@dcloudio/vite-plugin-uni/package.json'));
const vue = (uniPluginRequire('@vitejs/plugin-vue') as { default: () => Plugin }).default;

export default defineConfig({
  plugins: [
    vue({
      // Real mounted regressions compile only Lucky UI component SFCs; demo/docs SFCs and every
      // unrelated unit fixture keep the pre-existing test transform path.
      include: /src[\\/]uni_modules[\\/]lucky-ui[\\/]components[\\/].*\.vue$/,
      template: {
        compilerOptions: {
          // Keep the SFC test compiler override limited to the Uni native element used by fixtures.
          isCustomElement: tag => tag === 'scroll-view',
        },
      },
    }),
  ],
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
