import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as VueRuntime from 'vue';
import { describe, expect, it, vi } from 'vitest';
import * as TransitionModule from '../../src/uni_modules/lucky-ui/composables/useTransition';
import * as PopupPropsModule from '../../src/uni_modules/lucky-ui/components/lk-popup/popup.props';
import * as PopupUtilsModule from '../../src/uni_modules/lucky-ui/components/lk-popup/popup.utils';

type HostNode = {
  type: string;
  props: Record<string, unknown>;
  children: HostNode[];
  parent: HostNode | null;
  text?: string;
};

type CompilerSfc = {
  parse: (
    source: string,
    options: { filename: string }
  ) => { descriptor: { template?: { ast?: unknown } }; errors: unknown[] };
  compileScript: (
    descriptor: unknown,
    options: {
      id: string;
      inlineTemplate: boolean;
      templateOptions: { compilerOptions: { isCustomElement: (tag: string) => boolean } };
    }
  ) => { content: string };
};

type Babel = {
  transformSync: (
    source: string,
    options: {
      babelrc: boolean;
      configFile: boolean;
      filename: string;
      plugins: unknown[];
    }
  ) => { code?: string | null } | null;
};

type CommonJsModule = {
  exports: Record<string, unknown>;
};

const popupSfcUrl = new URL(
  '../../src/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue',
  import.meta.url
);

const testRenderer = VueRuntime.createRenderer<HostNode, HostNode>({
  patchProp(element, key, _previousValue, nextValue) {
    element.props[key] = nextValue;
  },
  insert(child, parent, anchor) {
    child.parent = parent;
    const anchorIndex = anchor ? parent.children.indexOf(anchor) : -1;
    if (anchorIndex === -1) parent.children.push(child);
    else parent.children.splice(anchorIndex, 0, child);
  },
  remove(child) {
    if (!child.parent) return;
    const index = child.parent.children.indexOf(child);
    if (index >= 0) child.parent.children.splice(index, 1);
    child.parent = null;
  },
  createElement(type) {
    return { type, props: {}, children: [], parent: null };
  },
  createText(text) {
    return { type: 'text', props: {}, children: [], parent: null, text };
  },
  createComment(text) {
    return { type: 'comment', props: {}, children: [], parent: null, text };
  },
  setText(node, text) {
    node.text = text;
  },
  setElementText(node, text) {
    node.text = text;
    node.children = [];
  },
  parentNode(node) {
    return node.parent;
  },
  nextSibling(node) {
    if (!node.parent) return null;
    const index = node.parent.children.indexOf(node);
    return node.parent.children[index + 1] ?? null;
  },
});

function compileProductionPopup(): VueRuntime.Component {
  const localRequire = createRequire(import.meta.url);
  const uniPluginManifest = localRequire.resolve('@dcloudio/vite-plugin-uni/package.json');
  const dependencyRequire = createRequire(uniPluginManifest);
  const compiler = dependencyRequire('@vue/compiler-sfc') as CompilerSfc;
  const babel = dependencyRequire('@babel/core') as Babel;
  const typeScriptPlugin = (
    dependencyRequire('@babel/plugin-transform-typescript') as { default: unknown }
  ).default;
  const commonJsPlugin = (
    dependencyRequire('@babel/plugin-transform-modules-commonjs') as { default: unknown }
  ).default;
  const source = readFileSync(popupSfcUrl, 'utf8');
  const { descriptor, errors } = compiler.parse(source, { filename: popupSfcUrl.pathname });

  if (errors.length > 0) throw new Error(`Failed to parse lk-popup.vue: ${String(errors[0])}`);
  // The parser's cached template AST predates our custom-element option.
  if (descriptor.template) descriptor.template.ast = undefined;

  const compiledScript = compiler.compileScript(descriptor, {
    id: 'lk-popup-reactive-transition-production-wire',
    inlineTemplate: true,
    templateOptions: {
      compilerOptions: {
        isCustomElement: tag => tag === 'scroll-view',
      },
    },
  });
  const transformed = babel.transformSync(compiledScript.content, {
    babelrc: false,
    configFile: false,
    filename: 'lk-popup.vue.ts',
    plugins: [typeScriptPlugin, commonJsPlugin],
  });

  if (!transformed?.code) throw new Error('Failed to transform compiled lk-popup.vue script');

  const EmptyChild = VueRuntime.defineComponent({ render: () => null });
  const childModule = { __esModule: true, default: EmptyChild };
  const requireFromPopup = (request: string): unknown => {
    if (request === 'vue') return VueRuntime;
    if (request === './popup.props') return PopupPropsModule;
    if (request === './popup.utils') return PopupUtilsModule;
    if (request === '@/uni_modules/lucky-ui/composables/useTransition') return TransitionModule;
    if (request.endsWith('/lk-overlay.vue') || request.endsWith('/lk-icon.vue')) return childModule;
    throw new Error(`Unexpected lk-popup.vue import: ${request}`);
  };
  const compiledModule: CommonJsModule = { exports: {} };
  const executeModule = new Function('require', 'module', 'exports', transformed.code);
  executeModule(requireFromPopup, compiledModule, compiledModule.exports);

  return compiledModule.exports.default as VueRuntime.Component;
}

function findPopupPanel(node: HostNode): HostNode | undefined {
  const classes = typeof node.props.class === 'string' ? node.props.class : '';
  if (classes.split(' ').includes('lk-popup__panel')) return node;

  for (const child of node.children) {
    const panel = findPopupPanel(child);
    if (panel) return panel;
  }

  return undefined;
}

describe('lk-popup reactive transition production wiring', () => {
  it('uses seven closed-state prop changes when reopening the same mounted SFC instance', async () => {
    vi.useFakeTimers();
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubGlobal('uni', {
      getSystemInfoSync: () => ({ windowHeight: 844 }),
    });

    const Popup = compileProductionPopup();
    const popupRef = VueRuntime.ref<VueRuntime.ComponentPublicInstance>();
    const props = VueRuntime.reactive({
      modelValue: false,
      overlay: false,
      position: 'bottom',
      draggable: false,
      animation: 'bounce' as string | undefined,
      animationType: 'fade-left' as string | undefined,
      duration: 180,
      delay: 0,
      easing: 'ease-out',
    });
    const App = VueRuntime.defineComponent({
      render: () => VueRuntime.h(Popup, { ...props, ref: popupRef }),
    });
    const root: HostNode = { type: 'root', props: {}, children: [], parent: null };
    const app = testRenderer.createApp(App);

    try {
      app.mount(root);
      const mountedInstance = popupRef.value;

      props.modelValue = true;
      await VueRuntime.nextTick();
      await VueRuntime.nextTick();
      await vi.advanceTimersByTimeAsync(16);
      await VueRuntime.nextTick();

      let panel = findPopupPanel(root);
      expect(panel?.props.class).toContain('lk-transition-fade-left');
      expect(panel?.props.style).toMatchObject({
        transitionDuration: '180ms',
        transitionTimingFunction: 'ease-out',
      });

      await vi.advanceTimersByTimeAsync(180);
      props.modelValue = false;
      await VueRuntime.nextTick();
      await VueRuntime.nextTick();
      await vi.advanceTimersByTimeAsync(16);
      await vi.advanceTimersByTimeAsync(180);
      await VueRuntime.nextTick();
      expect(findPopupPanel(root)).toBeUndefined();

      props.animation = undefined;
      props.animationType = undefined;
      await VueRuntime.nextTick();

      props.modelValue = true;
      await VueRuntime.nextTick();
      await VueRuntime.nextTick();
      await vi.advanceTimersByTimeAsync(16);
      await VueRuntime.nextTick();

      panel = findPopupPanel(root);
      expect(popupRef.value).toBe(mountedInstance);
      expect(panel?.props.class).toContain('lk-transition-slide-up');
      expect(panel?.props.class).toContain('lk-transition-entering');

      await vi.advanceTimersByTimeAsync(179);
      await VueRuntime.nextTick();
      expect(findPopupPanel(root)?.props.class).toContain('lk-transition-entering');

      await vi.advanceTimersByTimeAsync(1);
      await VueRuntime.nextTick();
      expect(findPopupPanel(root)?.props.class).not.toContain('lk-transition-entering');

      props.modelValue = false;
      await VueRuntime.nextTick();
      await VueRuntime.nextTick();
      await vi.advanceTimersByTimeAsync(16);
      await vi.advanceTimersByTimeAsync(180);
      await VueRuntime.nextTick();
      expect(findPopupPanel(root)).toBeUndefined();

      props.draggable = true;
      await VueRuntime.nextTick();

      props.modelValue = true;
      await VueRuntime.nextTick();
      await VueRuntime.nextTick();
      await vi.advanceTimersByTimeAsync(16);
      await VueRuntime.nextTick();

      panel = findPopupPanel(root);
      expect(popupRef.value).toBe(mountedInstance);
      expect(panel?.props.class).toContain('lk-transition-fade');
      expect(panel?.props.class).toContain('lk-transition-entering');

      await vi.advanceTimersByTimeAsync(179);
      await VueRuntime.nextTick();
      expect(findPopupPanel(root)?.props.class).toContain('lk-transition-entering');

      await vi.advanceTimersByTimeAsync(1);
      await VueRuntime.nextTick();
      expect(findPopupPanel(root)?.props.class).not.toContain('lk-transition-entering');

      props.modelValue = false;
      await VueRuntime.nextTick();
      await VueRuntime.nextTick();
      await vi.advanceTimersByTimeAsync(16);
      await vi.advanceTimersByTimeAsync(180);
      await VueRuntime.nextTick();
      expect(findPopupPanel(root)).toBeUndefined();

      props.position = 'right';
      props.draggable = false;
      props.duration = 700;
      props.delay = 45;
      props.easing = 'linear';
      await VueRuntime.nextTick();

      props.modelValue = true;
      await VueRuntime.nextTick();
      await VueRuntime.nextTick();
      await vi.advanceTimersByTimeAsync(16);
      await VueRuntime.nextTick();

      panel = findPopupPanel(root);
      expect(popupRef.value).toBe(mountedInstance);
      expect(panel?.props.class).toContain('lk-transition-slide-right');
      expect(panel?.props.class).toContain('lk-transition-entering');
      expect(panel?.props.style).toMatchObject({
        transitionDuration: '700ms',
        transitionDelay: '45ms',
        transitionTimingFunction: 'linear',
      });

      await vi.advanceTimersByTimeAsync(744);
      await VueRuntime.nextTick();
      expect(findPopupPanel(root)?.props.class).toContain('lk-transition-entering');

      await vi.advanceTimersByTimeAsync(1);
      await VueRuntime.nextTick();
      expect(findPopupPanel(root)?.props.class).not.toContain('lk-transition-entering');
      expect(consoleWarn).not.toHaveBeenCalled();
    } finally {
      app.unmount();
      consoleWarn.mockRestore();
      vi.clearAllTimers();
      vi.useRealTimers();
      vi.unstubAllGlobals();
    }
  });
});
