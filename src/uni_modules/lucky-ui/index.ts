import type { App, Component, Plugin } from 'vue';
import * as components from './components';

const INTERNAL_COMPONENTS = new Set(['DemoBlock']);

export const version = '1.0.0';

export function install(app: App): void {
  Object.entries(components).forEach(([name, component]) => {
    if (!name.startsWith('Lk') || INTERNAL_COMPONENTS.has(name)) return;
    app.component(name, component as Component);
  });
}

const LuckyUI: Plugin = {
  install,
};

export default LuckyUI;
export * from './components';
export * from './locale';
export * from './composables';
export * from './theme';
export * from './utils';
