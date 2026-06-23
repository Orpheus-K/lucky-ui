# Lucky UI

Lucky UI is a UniApp component library for Vue 3 applications across H5, App, and mini program targets.

## Install

Install from the npm registry. The package name is `uni-lucky-ui`; `lucky-ui` is only the `uni_modules` directory name.

```bash
pnpm add uni-lucky-ui
# or
npm install uni-lucky-ui
# or
yarn add uni-lucky-ui
```

Register the plugin when global `lk-*` components are needed:

```ts
import { createSSRApp } from 'vue';
import App from './App.vue';
import LuckyUI from 'uni-lucky-ui';

export function createApp() {
  const app = createSSRApp(App);
  app.use(LuckyUI);
  return { app };
}
```

Import the theme once:

```scss
@use 'uni-lucky-ui/theme/src/index.scss';
```

Components can also be imported directly:

```ts
import LkButton from 'uni-lucky-ui/components/lk-button/lk-button.vue';
```

For `uni_modules` usage, copy this directory into a UniApp project:

```text
src/uni_modules/lucky-ui
```

Register the plugin when global components are needed:

```ts
import { createSSRApp } from 'vue';
import App from './App.vue';
import LuckyUI from './uni_modules/lucky-ui';

export function createApp() {
  const app = createSSRApp(App);
  app.use(LuckyUI);
  return { app };
}
```

Import the theme once:

```scss
@use './uni_modules/lucky-ui/theme/src/index.scss';
```

Components can also be imported directly:

```ts
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
```

## Release Status

This package is prepared as `uni-lucky-ui@1.0.0`. Public components are installable through the default plugin export as `lk-*` components. Internal demo and debugging components are intentionally excluded from plugin registration.

