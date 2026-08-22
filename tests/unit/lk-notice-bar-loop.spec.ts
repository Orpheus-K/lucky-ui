import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import * as VueRuntime from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as NoticeBarPropsModule from '../../src/uni_modules/lucky-ui/components/lk-notice-bar/notice-bar.props';
import * as NoticeBarUtilsModule from '../../src/uni_modules/lucky-ui/components/lk-notice-bar/notice-bar.utils';

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
  ) => { descriptor: unknown; errors: unknown[] };
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

type CommonJsModule = { exports: Record<string, unknown> };

const nodeRequire = createRequire(import.meta.url);
const noticeBarSfcUrl = new URL(
  '../../src/uni_modules/lucky-ui/components/lk-notice-bar/lk-notice-bar.vue',
  import.meta.url
);
const renderer = VueRuntime.createRenderer<HostNode, HostNode>({
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

function compileProductionNoticeBar(): VueRuntime.Component {
  const uniPluginManifest = nodeRequire.resolve('@dcloudio/vite-plugin-uni/package.json');
  const dependencyRequire = createRequire(uniPluginManifest);
  const compiler = dependencyRequire('@vue/compiler-sfc') as CompilerSfc;
  const babel = dependencyRequire('@babel/core') as Babel;
  const typeScriptPlugin = (
    dependencyRequire('@babel/plugin-transform-typescript') as { default: unknown }
  ).default;
  const commonJsPlugin = (
    dependencyRequire('@babel/plugin-transform-modules-commonjs') as { default: unknown }
  ).default;
  const source = readFileSync(noticeBarSfcUrl, 'utf8');
  const { descriptor, errors } = compiler.parse(source, { filename: noticeBarSfcUrl.pathname });

  if (errors.length > 0) throw new Error(`Failed to parse lk-notice-bar.vue: ${String(errors[0])}`);

  const compiled = compiler.compileScript(descriptor, {
    id: 'lk-notice-bar-loop-production-wire',
    inlineTemplate: true,
    templateOptions: {
      compilerOptions: { isCustomElement: tag => tag === 'view' || tag === 'lk-icon' },
    },
  });
  const transformed = babel.transformSync(compiled.content, {
    babelrc: false,
    configFile: false,
    filename: 'lk-notice-bar.vue.ts',
    plugins: [typeScriptPlugin, commonJsPlugin],
  });

  if (!transformed?.code) throw new Error('Failed to transform compiled lk-notice-bar.vue');

  const requireFromNoticeBar = (request: string): unknown => {
    if (request === 'vue') return VueRuntime;
    if (request === './notice-bar.props') return NoticeBarPropsModule;
    if (request === './notice-bar.utils') return NoticeBarUtilsModule;
    throw new Error(`Unexpected lk-notice-bar.vue import: ${request}`);
  };
  const compiledModule: CommonJsModule = { exports: {} };
  const executeModule = new Function('require', 'module', 'exports', transformed.code);
  executeModule(requireFromNoticeBar, compiledModule, compiledModule.exports);
  return compiledModule.exports.default as VueRuntime.Component;
}

function findByClass(node: HostNode, className: string): HostNode | undefined {
  if (
    String(node.props.class || '')
      .split(/\s+/)
      .includes(className)
  )
    return node;
  for (const child of node.children) {
    const match = findByClass(child, className);
    if (match) return match;
  }
  return undefined;
}

function mountNoticeBar(
  initialMessages = ['A', 'B'],
  listeners: {
    onMessageChange?: (payload: { index: number; text: string }) => void;
    onLoopReset?: () => void;
  } = {}
) {
  const NoticeBar = compileProductionNoticeBar();
  const messages = VueRuntime.ref([...initialMessages]);
  const changes: Array<{ index: number; text: string }> = [];
  const clicks: Array<{ index: number; text: string }> = [];
  let resetCount = 0;
  const App = VueRuntime.defineComponent({
    render: () =>
      VueRuntime.h(NoticeBar, {
        scrollable: 'vertical',
        messages: messages.value,
        speed: 0.5,
        onMessageChange: (payload: { index: number; text: string }) => {
          changes.push(payload);
          listeners.onMessageChange?.(payload);
        },
        onLoopReset: () => {
          resetCount += 1;
          listeners.onLoopReset?.();
        },
        onClick: (payload: { index: number; text: string }) =>
          clicks.push({ index: payload.index, text: payload.text }),
      }),
  });
  const root: HostNode = { type: 'root', props: {}, children: [], parent: null };
  const app = renderer.createApp(App);
  app.component('LkIcon', VueRuntime.defineComponent({ render: () => VueRuntime.h('lk-icon') }));
  app.mount(root);
  return { app, root, messages, changes, clicks, getResetCount: () => resetCount };
}

function mountKeepAliveNoticeBar() {
  const NoticeBar = compileProductionNoticeBar();
  const active = VueRuntime.ref(true);
  const changes: Array<{ index: number; text: string }> = [];
  let resetCount = 0;
  const App = VueRuntime.defineComponent({
    render: () =>
      VueRuntime.h(VueRuntime.KeepAlive, null, {
        default: () =>
          active.value
            ? VueRuntime.h(NoticeBar, {
                scrollable: 'vertical',
                messages: ['A', 'B'],
                speed: 0.5,
                onMessageChange: (payload: { index: number; text: string }) =>
                  changes.push(payload),
                onLoopReset: () => {
                  resetCount += 1;
                },
              })
            : VueRuntime.h('view', { class: 'inactive-placeholder' }),
      }),
  });
  const root: HostNode = { type: 'root', props: {}, children: [], parent: null };
  const app = renderer.createApp(App);
  app.component('LkIcon', VueRuntime.defineComponent({ render: () => VueRuntime.h('lk-icon') }));
  app.mount(root);
  return { app, root, active, changes, getResetCount: () => resetCount };
}

async function advance(milliseconds: number) {
  vi.advanceTimersByTime(milliseconds);
  await VueRuntime.nextTick();
}

afterEach(() => {
  vi.useRealTimers();
});

describe('lk-notice-bar production vertical loop', () => {
  it('emits and clicks the logical first message during the cloned first frame', async () => {
    vi.useFakeTimers();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const mounted = mountNoticeBar();

    try {
      await advance(499);
      expect(mounted.changes).toEqual([]);
      await advance(1);
      expect(mounted.changes).toEqual([{ index: 1, text: 'B' }]);

      await advance(500);
      expect(mounted.changes).toEqual([
        { index: 1, text: 'B' },
        { index: 0, text: 'A' },
      ]);
      expect(mounted.getResetCount()).toBe(0);

      const root = findByClass(mounted.root, 'lk-notice-bar');
      expect(root).toBeTruthy();
      (root?.props.onTap as (event: unknown) => void)({ type: 'tap' });
      expect(mounted.clicks).toEqual([{ index: 0, text: 'A' }]);

      await advance(299);
      expect(mounted.getResetCount()).toBe(0);
      await advance(1);
      expect(mounted.getResetCount()).toBe(1);
      expect(mounted.changes).toHaveLength(2);
      expect(warning).not.toHaveBeenCalled();
    } finally {
      mounted.app.unmount();
      warning.mockRestore();
    }
  });

  it('cancels clone timers when messages change or the component unmounts', async () => {
    vi.useFakeTimers();
    const mounted = mountNoticeBar();

    await advance(1000);
    expect(mounted.changes.at(-1)).toEqual({ index: 0, text: 'A' });
    mounted.messages.value = ['X'];
    await VueRuntime.nextTick();
    await advance(1000);
    expect(mounted.getResetCount()).toBe(0);
    expect(mounted.changes).toHaveLength(2);
    const root = findByClass(mounted.root, 'lk-notice-bar');
    (root?.props.onTap as (event: unknown) => void)({ type: 'tap' });
    expect(mounted.clicks).toEqual([{ index: 0, text: 'X' }]);
    mounted.app.unmount();
    await advance(1000);
    expect(mounted.getResetCount()).toBe(0);
  });

  it('does not create timers after a public loop event synchronously unmounts the component', async () => {
    vi.useFakeTimers();
    let unmountFromChange = () => undefined;
    const changeUnmounted = mountNoticeBar(['A', 'B'], {
      onMessageChange: payload => {
        if (payload.index === 0) unmountFromChange();
      },
    });
    unmountFromChange = () => changeUnmounted.app.unmount();

    await advance(1000);
    expect(changeUnmounted.changes).toEqual([
      { index: 1, text: 'B' },
      { index: 0, text: 'A' },
    ]);
    expect(changeUnmounted.getResetCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    await advance(1000);
    expect(changeUnmounted.getResetCount()).toBe(0);

    let unmountFromReset = () => undefined;
    const resetUnmounted = mountNoticeBar(['A', 'B'], {
      onLoopReset: () => unmountFromReset(),
    });
    unmountFromReset = () => resetUnmounted.app.unmount();

    await advance(1300);
    expect(resetUnmounted.getResetCount()).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
    await advance(1000);
    expect(resetUnmounted.getResetCount()).toBe(1);
  });

  it('restarts from the first logical item after deactivation during the cloned frame', async () => {
    vi.useFakeTimers();
    const mounted = mountKeepAliveNoticeBar();

    await advance(1000);
    expect(mounted.changes).toEqual([
      { index: 1, text: 'B' },
      { index: 0, text: 'A' },
    ]);
    mounted.active.value = false;
    await VueRuntime.nextTick();
    await advance(1000);
    expect(mounted.getResetCount()).toBe(0);

    mounted.active.value = true;
    await VueRuntime.nextTick();
    const list = findByClass(mounted.root, 'lk-notice-bar__vertical-list');
    expect(list?.props.style).toMatchObject({
      transform: 'translateY(-0%)',
      transition: 'transform 0.3s ease-in-out',
    });
    await advance(500);
    expect(mounted.changes.at(-1)).toEqual({ index: 1, text: 'B' });
    mounted.app.unmount();
  });
});
