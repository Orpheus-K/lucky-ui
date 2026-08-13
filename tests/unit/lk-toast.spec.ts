import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createServer as createViteServer } from 'vite';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRenderer, defineComponent, h, nextTick, ref, type App, type Component } from 'vue';
import {
  createToastLifecycle,
  watchToastLifecycle,
} from '../../src/uni_modules/lucky-ui/components/lk-toast/toast.lifecycle';
import { toastManagerProps } from '../../src/uni_modules/lucky-ui/components/lk-toast/toast.props';
import {
  createToastBlockerState,
  createToastItem,
  resolveToastManagerItemClass,
  resolveToastManagerStyle,
  resolveToastManagerTransition,
  resolveToastOverlayClass,
  resolveToastOverlayStyle,
  resolveToastRootClass,
  resolveToastRootStyle,
  resolveToastTransition,
  shouldScheduleToastClose,
  shouldRenderToastBlocker,
} from '../../src/uni_modules/lucky-ui/components/lk-toast/toast.utils';

const nodeRequire = createRequire(import.meta.url);

interface ToastTestNode {
  type: string;
  props: Record<string, unknown>;
  children: ToastTestNode[];
  parent: ToastTestNode | null;
  text: string;
}

async function loadProductionToastSfc(): Promise<Component> {
  const dependencyRequire = createRequire(
    nodeRequire.resolve('@dcloudio/vite-plugin-uni/package.json')
  );
  const compiler = nodeRequire(dependencyRequire.resolve('@vue/compiler-sfc')) as {
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
  const sourcePath = resolve(
    process.cwd(),
    'src/uni_modules/lucky-ui/components/lk-toast/lk-toast.vue'
  );
  const source = readFileSync(sourcePath, 'utf8');
  const parsed = compiler.parse(source, { filename: sourcePath });
  expect(parsed.errors).toEqual([]);
  const compiled = compiler.compileScript(parsed.descriptor, {
    id: 'toast-production-test',
    inlineTemplate: true,
    templateOptions: {
      compilerOptions: {
        isCustomElement: tag => tag === 'view' || tag === 'text',
      },
    },
  });
  const sourceDirectory = dirname(sourcePath).replaceAll('\\', '/');
  const executableSource = compiled.content.replace(
    /from (['"])\.\/([^'"]+)\1/g,
    (_match: string, quote: string, request: string) =>
      `from ${quote}/@fs/${sourceDirectory}/${request}${quote}`
  );
  const temporaryDirectory = mkdtempSync(join(resolve(tmpdir()), 'lucky-ui-toast-sfc-'));
  const modulePath = join(temporaryDirectory, 'lk-toast.compiled.ts');
  writeFileSync(modulePath, executableSource, 'utf8');
  const hmrServer = createHttpServer();
  const server = await createViteServer({
    appType: 'custom',
    configFile: false,
    root: process.cwd(),
    resolve: {
      alias: [
        {
          find: /^vue$/,
          replacement: nodeRequire.resolve('vue/dist/vue.runtime.esm-bundler.js'),
        },
        { find: '@', replacement: resolve(process.cwd(), 'src') },
      ],
    },
    server: { middlewareMode: true, hmr: { server: hmrServer } },
  });

  try {
    const loaded = await server.ssrLoadModule(`/@fs/${modulePath.replaceAll('\\', '/')}`);
    return loaded.default as Component;
  } finally {
    await server.close();
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

function createToastTestRenderer() {
  const createNode = (type: string, text = ''): ToastTestNode => ({
    type,
    props: {},
    children: [],
    parent: null,
    text,
  });
  const renderer = createRenderer<ToastTestNode, ToastTestNode>({
    patchProp(element, key, _previous, next) {
      if (next == null) delete element.props[key];
      else element.props[key] = next;
    },
    insert(child, parent, anchor) {
      child.parent = parent;
      const anchorIndex = anchor ? parent.children.indexOf(anchor) : -1;
      if (anchorIndex < 0) parent.children.push(child);
      else parent.children.splice(anchorIndex, 0, child);
    },
    remove(child) {
      if (!child.parent) return;
      const index = child.parent.children.indexOf(child);
      if (index >= 0) child.parent.children.splice(index, 1);
      child.parent = null;
    },
    createElement: type => createNode(type),
    createText: text => createNode('#text', text),
    createComment: text => createNode('#comment', text),
    setText(node, text) {
      node.text = text;
    },
    setElementText(element, text) {
      element.text = text;
      element.children = [];
    },
    parentNode: node => node.parent,
    nextSibling(node) {
      if (!node.parent) return null;
      const index = node.parent.children.indexOf(node);
      return node.parent.children[index + 1] ?? null;
    },
  });

  return { renderer, createRoot: () => createNode('#root') };
}

function findToastTestNode(root: ToastTestNode, className: string): ToastTestNode | null {
  const classes = String(root.props.class ?? '').split(/\s+/);
  if (classes.includes(className)) return root;
  for (const child of root.children) {
    const match = findToastTestNode(child, className);
    if (match) return match;
  }
  return null;
}

describe('lk-toast display and manager rules', () => {
  it('compiles orthogonal blocker state into the WeChat component', () => {
    const uniBin = nodeRequire.resolve('@dcloudio/vite-plugin-uni/bin/uni.js');
    const temporaryParent = resolve(tmpdir());
    const outputDirectory = mkdtempSync(join(temporaryParent, 'lucky-ui-toast-blocker-mp-'));
    const componentDirectory = join(outputDirectory, 'uni_modules/lucky-ui/components/lk-toast');
    const wxmlPath = join(componentDirectory, 'lk-toast.wxml');
    const scriptPath = join(componentDirectory, 'lk-toast.js');
    const stylePath = join(componentDirectory, 'lk-toast.wxss');

    expect(dirname(outputDirectory)).toBe(temporaryParent);
    expect(existsSync(wxmlPath)).toBe(false);

    try {
      execFileSync(process.execPath, [uniBin, 'build', '-p', 'mp-weixin'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          NODE_ENV: 'production',
          UNI_OUTPUT_DIR: outputDirectory,
        },
        stdio: 'pipe',
      });

      const wxml = readFileSync(wxmlPath, 'utf8');
      const script = readFileSync(scriptPath, 'utf8');
      const style = readFileSync(stylePath, 'utf8');
      const blockerTagPattern =
        /<view wx:if="\{\{([A-Za-z_$][\w$]*)\}\}" class="\{\{\['lk-toast__overlay', ([A-Za-z_$][\w$]*)\]\}\}" style="\{\{([A-Za-z_$][\w$]*)\}\}"\/>/;
      const blockerTag = wxml.match(blockerTagPattern);
      const blockerComputed = script.match(
        /([A-Za-z_$][\w$]*)=[A-Za-z_$][\w$]*\.computed\(\(\)=>[A-Za-z_$][\w$]*\.shouldRenderToastBlocker\(\{display:[A-Za-z_$][\w$]*\.value,overlay:([A-Za-z_$][\w$]*)\.value\.overlay,forbidClick:\2\.value\.forbidClick\}\)\)/
      );
      const blockerClassComputed = script.match(
        /([A-Za-z_$][\w$]*)=[A-Za-z_$][\w$]*\.computed\(\(\)=>[A-Za-z_$][\w$]*\.resolveToastOverlayClass\(\{overlay:([A-Za-z_$][\w$]*)\.value\.overlay,forbidClick:\2\.value\.forbidClick\}\)\)/
      );

      expect(blockerTag?.[0]).toContain('lk-toast__overlay');
      expect(blockerComputed?.[1]).toBeTruthy();
      expect(blockerClassComputed?.[1]).toBeTruthy();
      expect(script).toContain('flush:"pre"');
      expect(script).not.toContain('flush:"sync"');
      expect(script).toContain(`${blockerTag?.[1]}:${blockerComputed?.[1]}.value`);
      expect(script).toMatch(
        new RegExp(
          `${blockerTag?.[2]}:[A-Za-z_$][\\w$]*\\.n\\(${blockerClassComputed?.[1]}\\.value\\)`
        )
      );
      expect(style).toContain(
        '.lk-toast__overlay{position:fixed;left:0;top:0;right:0;bottom:0;background:transparent;pointer-events:none}'
      );
      expect(style).toContain(
        '.lk-toast__overlay.is-visible{background:var(--lk-fill-quaternary)}'
      );
      expect(style).toContain('.lk-toast__overlay.is-lock{pointer-events:auto}');
      expect(blockerTag?.[0].replace(/\s+wx:if="\{\{[A-Za-z_$][\w$]*\}\}"/, '')).not.toMatch(
        blockerTagPattern
      );
    } finally {
      rmSync(outputDirectory, { recursive: true, force: true });
    }

    expect(existsSync(outputDirectory)).toBe(false);
  }, 60_000);

  it('uses the public toast layer for the global manager', () => {
    const customStyle = { top: '24rpx', zIndex: 3000 };

    expect(toastManagerProps.zIndex.default).toBe(2000);
    expect(
      resolveToastManagerStyle({
        customStyle,
        zIndex: 2100,
      })
    ).toEqual([customStyle, { zIndex: 2100 }]);
  });

  it('resolves controlled toast transition by position', () => {
    expect(
      resolveToastTransition({
        transition: 'slide-up',
        position: 'top',
      })
    ).toBe('slide-down');
    expect(
      resolveToastTransition({
        transition: 'slide-up',
        position: 'center',
      })
    ).toBe('zoom-in');
    expect(
      resolveToastTransition({
        transition: 'fade',
        position: 'bottom',
      })
    ).toBe('fade');
  });

  it('keeps visual overlay and click blocking orthogonal for every combination', () => {
    expect(shouldScheduleToastClose(2000)).toBe(true);
    expect(shouldScheduleToastClose(0)).toBe(false);

    const combinations = [
      { overlay: false, forbidClick: false },
      { overlay: true, forbidClick: false },
      { overlay: false, forbidClick: true },
      { overlay: true, forbidClick: true },
    ];

    for (const combination of combinations) {
      expect(resolveToastOverlayClass(combination)).toEqual({
        'is-visible': combination.overlay,
        'is-lock': combination.forbidClick,
      });
      expect(shouldRenderToastBlocker({ display: true, ...combination })).toBe(
        combination.overlay || combination.forbidClick
      );
      expect(shouldRenderToastBlocker({ display: false, ...combination })).toBe(false);
    }

    expect(resolveToastOverlayStyle(2000)).toEqual({ zIndex: 2000 });
    expect(resolveToastRootClass('bottom')).toEqual(['lk-toast--bottom']);
    expect(resolveToastRootStyle(2000)).toEqual({ zIndex: 2001 });
  });

  it('freezes the last visible blocker config until leave completes', () => {
    const state = createToastBlockerState();

    expect(state.sync({ visible: true, overlay: true, forbidClick: true })).toEqual({
      overlay: true,
      forbidClick: true,
    });
    expect(state.sync({ visible: false, overlay: false, forbidClick: false })).toEqual({
      overlay: true,
      forbidClick: true,
    });
    expect(state.sync({ visible: true, overlay: true, forbidClick: false })).toEqual({
      overlay: true,
      forbidClick: false,
    });
    state.finishLeave();
    expect(state.sync({ visible: true, overlay: false, forbidClick: false })).toEqual({
      overlay: false,
      forbidClick: false,
    });
    state.dispose();
    expect(state.sync({ visible: true, overlay: true, forbidClick: true })).toEqual({
      overlay: false,
      forbidClick: false,
    });
  });

  it('normalizes manager transition and item class', () => {
    expect(
      resolveToastManagerTransition({
        position: 'top',
      })
    ).toBe('slide-down');
    expect(
      resolveToastManagerTransition({
        position: 'center',
      })
    ).toBe('zoom-in');
    expect(
      resolveToastManagerTransition({
        position: 'bottom',
        transition: 'fade',
      })
    ).toBe('fade');
    expect(resolveToastManagerItemClass('center')).toEqual(['pos-center']);
  });

  it('creates manager items from string or object options', () => {
    expect(
      createToastItem({
        id: 1,
        input: '保存成功',
      })
    ).toEqual({
      id: 1,
      message: '保存成功',
      transition: 'zoom-in',
      duration: 2000,
      position: 'center',
      visible: true,
    });

    expect(
      createToastItem({
        id: 2,
        input: {
          message: '顶部提示',
          position: 'top',
          duration: 0,
        },
      })
    ).toEqual({
      id: 2,
      message: '顶部提示',
      transition: 'slide-down',
      duration: 0,
      position: 'top',
      visible: true,
    });
  });
});

describe('lk-toast production SFC blocker lifecycle', () => {
  const mountedApps: App[] = [];
  let ProductionToast: Component;
  let consoleWarnings: unknown[][];
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    ProductionToast = await loadProductionToastSfc();
  });

  beforeEach(() => {
    vi.useFakeTimers();
    consoleWarnings = [];
    warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args) => {
      consoleWarnings.push(args);
    });
  });

  afterEach(() => {
    for (const app of mountedApps.splice(0).reverse()) app.unmount();
    expect(consoleWarnings).toEqual([]);
    warnSpy.mockRestore();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  function mountToast(options: { overlay: boolean; forbidClick: boolean }) {
    const { renderer, createRoot } = createToastTestRenderer();
    const root = createRoot();
    const visible = ref(true);
    const overlay = ref(options.overlay);
    const forbidClick = ref(options.forbidClick);
    const afterLeave = vi.fn();
    const Parent = defineComponent({
      setup() {
        return () =>
          h(ProductionToast, {
            overlay: overlay.value,
            forbidClick: forbidClick.value,
            // Keep modelValue last to prove same-batch resets cannot depend on
            // the order in which a renderer patches sibling props.
            modelValue: visible.value,
            duration: 0,
            onAfterLeave: afterLeave,
          });
      },
    });
    const app = renderer.createApp(Parent);
    app.mount(root);
    mountedApps.push(app);
    return { app, root, visible, overlay, forbidClick, afterLeave };
  }

  async function settleTransition(milliseconds = 320) {
    await nextTick();
    await vi.advanceTimersByTimeAsync(milliseconds);
    await nextTick();
  }

  async function startTransitionFrame() {
    await nextTick();
    await nextTick();
    await vi.advanceTimersByTimeAsync(16);
    await nextTick();
  }

  it('holds visual-lock when the parent closes and resets both props in one render', async () => {
    const harness = mountToast({ overlay: true, forbidClick: true });
    await settleTransition();

    harness.visible.value = false;
    harness.overlay.value = false;
    harness.forbidClick.value = false;
    await startTransitionFrame();

    let blocker = findToastTestNode(harness.root, 'lk-toast__overlay');
    expect(String(blocker?.props.class)).toContain('is-visible');
    expect(String(blocker?.props.class)).toContain('is-lock');

    await vi.advanceTimersByTimeAsync(259);
    await nextTick();
    blocker = findToastTestNode(harness.root, 'lk-toast__overlay');
    expect(String(blocker?.props.class)).toContain('is-visible');
    expect(String(blocker?.props.class)).toContain('is-lock');

    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(findToastTestNode(harness.root, 'lk-toast__overlay')).toBeNull();
    expect(harness.afterLeave).toHaveBeenCalledTimes(1);
  });

  it('holds a transparent lock when forbidClick is reset on the close edge', async () => {
    const harness = mountToast({ overlay: false, forbidClick: true });
    await settleTransition();

    harness.visible.value = false;
    harness.forbidClick.value = false;
    await startTransitionFrame();

    const blocker = findToastTestNode(harness.root, 'lk-toast__overlay');
    expect(String(blocker?.props.class)).not.toContain('is-visible');
    expect(String(blocker?.props.class)).toContain('is-lock');

    await vi.advanceTimersByTimeAsync(260);
    await nextTick();
    expect(findToastTestNode(harness.root, 'lk-toast__overlay')).toBeNull();
    expect(harness.afterLeave).toHaveBeenCalledTimes(1);
  });

  it('uses current config on rapid reopen and rejects the old leave completion', async () => {
    const harness = mountToast({ overlay: true, forbidClick: true });
    await settleTransition();

    harness.visible.value = false;
    harness.overlay.value = false;
    harness.forbidClick.value = false;
    await startTransitionFrame();
    expect(findToastTestNode(harness.root, 'lk-toast__overlay')).not.toBeNull();

    await vi.advanceTimersByTimeAsync(80);
    harness.visible.value = true;
    await nextTick();
    expect(findToastTestNode(harness.root, 'lk-toast__overlay')).toBeNull();

    await settleTransition(400);
    expect(findToastTestNode(harness.root, 'lk-toast')).not.toBeNull();
    expect(harness.afterLeave).not.toHaveBeenCalled();

    harness.visible.value = false;
    await startTransitionFrame();
    await vi.advanceTimersByTimeAsync(80);
    harness.overlay.value = true;
    harness.visible.value = true;
    await nextTick();
    const blocker = findToastTestNode(harness.root, 'lk-toast__overlay');
    expect(String(blocker?.props.class)).toContain('is-visible');
    expect(String(blocker?.props.class)).not.toContain('is-lock');

    await settleTransition(400);
    expect(findToastTestNode(harness.root, 'lk-toast')).not.toBeNull();
    expect(findToastTestNode(harness.root, 'lk-toast__overlay')).not.toBeNull();
    expect(harness.afterLeave).not.toHaveBeenCalled();
  });

  it('cancels blocker and transition work when the component unmounts mid-leave', async () => {
    const harness = mountToast({ overlay: true, forbidClick: true });
    await settleTransition();

    harness.visible.value = false;
    harness.overlay.value = false;
    harness.forbidClick.value = false;
    await startTransitionFrame();
    expect(findToastTestNode(harness.root, 'lk-toast__overlay')).not.toBeNull();

    harness.app.unmount();
    mountedApps.splice(mountedApps.indexOf(harness.app), 1);
    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();

    expect(findToastTestNode(harness.root, 'lk-toast')).toBeNull();
    expect(findToastTestNode(harness.root, 'lk-toast__overlay')).toBeNull();
    expect(harness.afterLeave).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('lk-toast controlled lifecycle', () => {
  const mountedApps: App[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    for (const app of mountedApps.splice(0).reverse()) app.unmount();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  function createHarness(initialDuration = 1000) {
    const events: string[] = [];
    let duration = initialDuration;
    const lifecycle = createToastLifecycle({
      getDuration: () => duration,
      onOpen: () => events.push('open'),
      onRequestClose: () => events.push('update:false'),
      onClose: () => events.push('close'),
      onAfterLeave: () => events.push('after-leave'),
    });

    return {
      events,
      lifecycle,
      setDuration(nextDuration: number) {
        duration = nextDuration;
        lifecycle.reschedule();
      },
    };
  }

  it('schedules an initially visible toast and retries a rejected update after a full duration', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    expect(events).toEqual(['open']);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(events).toEqual(['open', 'update:false']);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(999);
    expect(events).toEqual(['open', 'update:false']);
    vi.advanceTimersByTime(1);
    expect(events).toEqual(['open', 'update:false', 'update:false']);
    expect(vi.getTimerCount()).toBe(1);

    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    lifecycle.finishLeave();
    expect(events).toEqual(['open', 'update:false', 'update:false', 'close', 'after-leave']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('treats an external false update as one close without an update echo', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    lifecycle.syncVisibility(false);
    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    lifecycle.finishLeave();
    vi.advanceTimersByTime(2000);

    expect(events).toEqual(['open', 'close', 'after-leave']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('allows a rejected close request to retry without reporting close', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    lifecycle.requestClose();
    lifecycle.requestClose();

    expect(events).toEqual(['open', 'update:false', 'update:false']);
    expect(vi.getTimerCount()).toBe(1);

    lifecycle.syncVisibility(false);
    expect(events).toEqual(['open', 'update:false', 'update:false', 'close']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not rearm when the parent accepts a close request synchronously', () => {
    const events: string[] = [];
    const lifecycle = createToastLifecycle({
      getDuration: () => 1000,
      onOpen: () => events.push('open'),
      onRequestClose: () => {
        events.push('update:false');
        lifecycle.syncVisibility(false);
      },
      onClose: () => events.push('close'),
      onAfterLeave: () => events.push('after-leave'),
    });

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(2000);

    expect(events).toEqual(['open', 'update:false', 'close']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('invalidates the old timer and leave completion when reopened quickly', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(200);
    lifecycle.syncVisibility(false);
    lifecycle.syncVisibility(true);
    lifecycle.finishLeave();

    vi.advanceTimersByTime(800);
    expect(events).toEqual(['open', 'close', 'open']);

    vi.advanceTimersByTime(200);
    expect(events).toEqual(['open', 'close', 'open', 'update:false']);

    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    lifecycle.finishLeave();
    expect(events).toEqual(['open', 'close', 'open', 'update:false', 'close', 'after-leave']);
  });

  it('starts a fresh timer when externally reopened after leaving', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(300);
    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    lifecycle.syncVisibility(true);

    vi.advanceTimersByTime(700);
    expect(events).toEqual(['open', 'close', 'after-leave', 'open']);

    vi.advanceTimersByTime(300);
    expect(events).toEqual(['open', 'close', 'after-leave', 'open', 'update:false']);

    lifecycle.syncVisibility(false);
    expect(events.at(-1)).toBe('close');
  });

  it('keeps duration zero open until an explicit close request', () => {
    const { events, lifecycle } = createHarness(0);

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(5000);
    expect(events).toEqual(['open']);
    expect(vi.getTimerCount()).toBe(0);

    lifecycle.requestClose();
    lifecycle.requestClose();
    expect(events).toEqual(['open', 'update:false', 'update:false']);
  });

  it('reschedules or cancels automatic close when duration changes while visible', () => {
    const cancelHarness = createHarness(100);
    cancelHarness.lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(40);
    cancelHarness.setDuration(0);
    vi.advanceTimersByTime(500);
    expect(cancelHarness.events).toEqual(['open']);
    expect(vi.getTimerCount()).toBe(0);

    const scheduleHarness = createHarness(0);
    scheduleHarness.lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(500);
    scheduleHarness.setDuration(100);
    vi.advanceTimersByTime(99);
    expect(scheduleHarness.events).toEqual(['open']);
    vi.advanceTimersByTime(1);
    expect(scheduleHarness.events).toEqual(['open', 'update:false']);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('resets a positive duration from the change point without keeping the old deadline', () => {
    const { events, lifecycle, setDuration } = createHarness(100);

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(40);
    setDuration(200);

    vi.advanceTimersByTime(60);
    expect(events).toEqual(['open']);
    vi.advanceTimersByTime(139);
    expect(events).toEqual(['open']);
    vi.advanceTimersByTime(1);
    expect(events).toEqual(['open', 'update:false']);

    lifecycle.syncVisibility(false);
    vi.advanceTimersByTime(1000);
    expect(events).toEqual(['open', 'update:false', 'close']);
  });

  function createTestRenderer() {
    return createRenderer<Record<string, unknown>, Record<string, unknown>>({
      patchProp() {},
      insert() {},
      remove() {},
      createElement() {
        return {};
      },
      createText() {
        return {};
      },
      createComment() {
        return {};
      },
      setText() {},
      setElementText() {},
      parentNode() {
        return null;
      },
      nextSibling() {
        return null;
      },
    });
  }

  it('processes every delivered source edge synchronously in a mounted component', async () => {
    const renderer = createTestRenderer();
    const visible = ref(true);
    const duration = ref(1000);
    const events: string[] = [];
    let lifecycle: ReturnType<typeof createToastLifecycle> | undefined;
    const App = defineComponent({
      setup() {
        lifecycle = createToastLifecycle({
          getDuration: () => duration.value,
          onOpen: () => events.push('open'),
          onRequestClose: () => events.push('update:false'),
          onClose: () => events.push('close'),
          onAfterLeave: () => events.push('after-leave'),
        });
        watchToastLifecycle(lifecycle, { visible, duration });
        return () => null;
      },
    });
    const app = renderer.createApp(App);
    app.mount({});
    mountedApps.push(app);

    visible.value = false;
    visible.value = true;

    expect(events).toEqual(['open', 'close', 'open']);
    await nextTick();
    expect(events).toEqual(['open', 'close', 'open']);
    lifecycle?.finishLeave();
    expect(events).toEqual(['open', 'close', 'open']);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('treats only parent edges delivered across render batches as lifecycle boundaries', async () => {
    const renderer = createTestRenderer();
    const parentVisible = ref(true);
    const events: string[] = [];
    let childLifecycle: ReturnType<typeof createToastLifecycle> | undefined;
    const Child = defineComponent({
      props: {
        visible: { type: Boolean, required: true },
        duration: { type: Number, required: true },
      },
      setup(props) {
        childLifecycle = createToastLifecycle({
          getDuration: () => props.duration,
          onOpen: () => events.push('open'),
          onRequestClose: () => events.push('update:false'),
          onClose: () => events.push('close'),
          onAfterLeave: () => events.push('after-leave'),
        });
        watchToastLifecycle(childLifecycle, {
          visible: () => props.visible,
          duration: () => props.duration,
        });
        return () => null;
      },
    });
    const Parent = defineComponent({
      setup() {
        return () => h(Child, { visible: parentVisible.value, duration: 1000 });
      },
    });
    const app = renderer.createApp(Parent);
    app.mount({});
    mountedApps.push(app);

    parentVisible.value = false;
    parentVisible.value = true;
    await nextTick();
    expect(events).toEqual(['open']);

    parentVisible.value = false;
    await nextTick();
    expect(events).toEqual(['open', 'close']);

    parentVisible.value = true;
    await nextTick();
    expect(events).toEqual(['open', 'close', 'open']);
    childLifecycle?.finishLeave();
    expect(events).toEqual(['open', 'close', 'open']);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('disposes a pending close without later events', () => {
    const { events, lifecycle } = createHarness();

    lifecycle.syncVisibility(true);
    expect(vi.getTimerCount()).toBe(1);

    lifecycle.dispose();
    lifecycle.dispose();
    lifecycle.requestClose();
    lifecycle.syncVisibility(false);
    lifecycle.finishLeave();
    vi.advanceTimersByTime(2000);

    expect(events).toEqual(['open']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not emit close when the update request synchronously disposes the instance', () => {
    const events: string[] = [];
    const lifecycle = createToastLifecycle({
      getDuration: () => 1000,
      onOpen: () => events.push('open'),
      onRequestClose: () => {
        events.push('update:false');
        lifecycle.dispose();
      },
      onClose: () => events.push('close'),
      onAfterLeave: () => events.push('after-leave'),
    });

    lifecycle.syncVisibility(true);
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(1000);

    expect(events).toEqual(['open', 'update:false']);
    expect(vi.getTimerCount()).toBe(0);
  });
});
