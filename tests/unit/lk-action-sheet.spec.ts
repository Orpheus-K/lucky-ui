import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import * as VueRuntime from 'vue';
import { describe, expect, it, vi } from 'vitest';
import * as RippleModule from '../../src/uni_modules/lucky-ui/composables/useRipple';
import * as LocaleComposableModule from '../../src/uni_modules/lucky-ui/composables/useLocale';
import { Locale } from '../../src/uni_modules/lucky-ui/locale';
import * as ActionSheetPropsModule from '../../src/uni_modules/lucky-ui/components/lk-action-sheet/action-sheet.props';
import * as ActionSheetUtilsModule from '../../src/uni_modules/lucky-ui/components/lk-action-sheet/action-sheet.utils';

const {
  canSelectAction,
  createActionSheetPayload,
  resolveActionSheetCancelClass,
  resolveActionSheetCancelText,
  resolveActionSheetItemClass,
  resolveActionSheetItemStyle,
  resolveActionSheetListClass,
  resolveActionSheetRootStyle,
  shouldCloseAfterAction,
  shouldRenderActionSheetCancel,
  shouldRenderActionSheetHead,
} = ActionSheetUtilsModule;

const nodeRequire = createRequire(import.meta.url);
const actionSheetSfcUrl = new URL(
  '../../src/uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.vue',
  import.meta.url
);

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

type CommonJsModule = {
  exports: Record<string, unknown>;
};

const actionSheetRenderer = VueRuntime.createRenderer<HostNode, HostNode>({
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

function compileProductionActionSheet(): VueRuntime.Component {
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
  const source = readFileSync(actionSheetSfcUrl, 'utf8');
  const { descriptor, errors } = compiler.parse(source, {
    filename: actionSheetSfcUrl.pathname,
  });

  if (errors.length > 0) {
    throw new Error(`Failed to parse lk-action-sheet.vue: ${String(errors[0])}`);
  }

  const compiledScript = compiler.compileScript(descriptor, {
    id: 'lk-action-sheet-cancel-production-wire',
    inlineTemplate: true,
    templateOptions: {
      compilerOptions: {
        isCustomElement: tag => tag === 'view' || tag === 'text',
      },
    },
  });
  const transformed = babel.transformSync(compiledScript.content, {
    babelrc: false,
    configFile: false,
    filename: 'lk-action-sheet.vue.ts',
    plugins: [typeScriptPlugin, commonJsPlugin],
  });

  if (!transformed?.code) {
    throw new Error('Failed to transform compiled lk-action-sheet.vue script');
  }

  const PopupStub = VueRuntime.defineComponent({
    setup(_props, { slots }) {
      return () => VueRuntime.h('popup-stub', {}, slots.default?.());
    },
  });
  const popupModule = { __esModule: true, default: PopupStub };
  const requireFromActionSheet = (request: string): unknown => {
    if (request === 'vue') return VueRuntime;
    if (request === '../lk-popup/lk-popup.vue') return popupModule;
    if (request === './action-sheet.props') return ActionSheetPropsModule;
    if (request === '@/uni_modules/lucky-ui/composables/useRipple') return RippleModule;
    if (request === '../../composables/useLocale') return LocaleComposableModule;
    if (request === './action-sheet.utils') return ActionSheetUtilsModule;
    throw new Error(`Unexpected lk-action-sheet.vue import: ${request}`);
  };
  const compiledModule: CommonJsModule = { exports: {} };
  const executeModule = new Function('require', 'module', 'exports', transformed.code);
  executeModule(requireFromActionSheet, compiledModule, compiledModule.exports);

  return compiledModule.exports.default as VueRuntime.Component;
}

function nodesByClass(node: HostNode, className: string): HostNode[] {
  const classes = typeof node.props.class === 'string' ? node.props.class.split(' ') : [];
  const matches = classes.includes(className) ? [node] : [];
  return matches.concat(node.children.flatMap(child => nodesByClass(child, className)));
}

function hostText(node: HostNode): string {
  return `${node.text ?? ''}${node.children.map(hostText).join('')}`;
}

describe('lk-action-sheet selection rules', () => {
  it('compiles exactly one conditional safe-area owner for WeChat', () => {
    const uniBin = nodeRequire.resolve('@dcloudio/vite-plugin-uni/bin/uni.js');
    const temporaryParent = resolve(tmpdir());
    const outputDirectory = mkdtempSync(join(temporaryParent, 'lucky-ui-action-sheet-mp-'));
    const actionSheetPath = join(
      outputDirectory,
      'uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.wxml'
    );
    const actionSheetScriptPath = join(
      outputDirectory,
      'uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.js'
    );
    const actionSheetStylePath = join(
      outputDirectory,
      'uni_modules/lucky-ui/components/lk-action-sheet/lk-action-sheet.wxss'
    );
    expect(dirname(outputDirectory)).toBe(temporaryParent);
    expect(existsSync(actionSheetPath)).toBe(false);

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

      expect(existsSync(actionSheetPath)).toBe(true);
      const actionSheetWxml = readFileSync(actionSheetPath, 'utf8');
      const actionSheetScript = readFileSync(actionSheetScriptPath, 'utf8');
      const actionSheetStyle = readFileSync(actionSheetStylePath, 'utf8');
      const safeAreaTag = actionSheetWxml.match(
        /<view(?=[^>]*\bdata-testid="lk-action-sheet-safe-area")(?=[^>]*\bwx:if="\{\{([A-Za-z_$][\w$]*)\}\}")[^>]*\/>/
      );

      expect(safeAreaTag?.[0]).toContain('data-testid="lk-action-sheet-safe-area"');
      expect(safeAreaTag?.[0]).toContain('wx:if=');
      expect(safeAreaTag?.[1]).toBeTruthy();
      expect(
        actionSheetScript.match(
          new RegExp(`\\b${safeAreaTag?.[1]}\\s*:\\s*[A-Za-z_$][\\w$]*\\.safeArea\\b`)
        )
      ).not.toBeNull();
      expect(actionSheetScript).toContain('"safe-area":!1');
      expect(actionSheetStyle).toContain(
        'height:var(--lk-action-sheet-safe-area-bottom, env(safe-area-inset-bottom))'
      );
      expect((actionSheetWxml.match(/data-testid="lk-action-sheet-safe-area"/g) || []).length).toBe(
        1
      );
      expect(
        safeAreaTag?.[0]
          .replace(/\s+wx:if="\{\{[A-Za-z_$][\w$]*\}\}"/, '')
          .match(
            /<view(?=[^>]*\bdata-testid="lk-action-sheet-safe-area")(?=[^>]*\bwx:if="\{\{([A-Za-z_$][\w$]*)\}\}")[^>]*\/>/
          )
      ).toBeNull();
    } finally {
      rmSync(outputDirectory, { recursive: true, force: true });
    }

    expect(existsSync(outputDirectory)).toBe(false);
  }, 60_000);

  it('executes the production SFC cancel fallback and hide contract reactively', async () => {
    type CancelMode = 'omitted' | 'undefined' | 'null' | 'empty' | 'custom';

    const ActionSheet = compileProductionActionSheet();
    const mode = VueRuntime.ref<CancelMode>('omitted');
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const originalLocale = Locale.locale;
    const App = VueRuntime.defineComponent({
      render() {
        const props: Record<string, unknown> = {
          modelValue: true,
          actions: [],
          safeArea: false,
        };
        if (mode.value === 'undefined') props.cancelText = undefined;
        if (mode.value === 'null') props.cancelText = null;
        if (mode.value === 'empty') props.cancelText = '';
        if (mode.value === 'custom') props.cancelText = 'Close';
        return VueRuntime.h(ActionSheet, props);
      },
    });
    const root: HostNode = { type: 'root', props: {}, children: [], parent: null };
    const app = actionSheetRenderer.createApp(App);

    const expectCancel = (expectedText: string) => {
      const cancelNodes = nodesByClass(root, 'lk-action-sheet__cancel');
      expect(cancelNodes).toHaveLength(1);
      expect(hostText(cancelNodes[0])).toBe(expectedText);
    };

    try {
      Locale.use('zh-Hans');
      app.mount(root);
      await VueRuntime.nextTick();
      expectCancel('取消');

      mode.value = 'undefined';
      await VueRuntime.nextTick();
      expectCancel('取消');

      mode.value = 'null';
      await VueRuntime.nextTick();
      expectCancel('取消');

      Locale.use('en');
      await VueRuntime.nextTick();
      expectCancel('Cancel');

      mode.value = 'custom';
      await VueRuntime.nextTick();
      expectCancel('Close');

      Locale.use('ja');
      await VueRuntime.nextTick();
      expectCancel('Close');

      mode.value = 'empty';
      await VueRuntime.nextTick();
      expect(nodesByClass(root, 'lk-action-sheet__cancel')).toHaveLength(0);

      Locale.use('fr');
      await VueRuntime.nextTick();
      expect(nodesByClass(root, 'lk-action-sheet__cancel')).toHaveLength(0);

      mode.value = 'omitted';
      await VueRuntime.nextTick();
      expectCancel('Annuler');
      expect(warning).not.toHaveBeenCalled();
    } finally {
      app.unmount();
      Locale.use(originalLocale);
      warning.mockRestore();
    }
  });

  it('compiles omitted and empty cancel text as distinct WeChat states', () => {
    const uniBin = nodeRequire.resolve('@dcloudio/vite-plugin-uni/bin/uni.js');
    const temporaryParent = resolve(tmpdir());
    const outputDirectory = mkdtempSync(join(temporaryParent, 'lucky-ui-action-sheet-cancel-mp-'));
    const componentDirectory = join(
      outputDirectory,
      'uni_modules/lucky-ui/components/lk-action-sheet'
    );
    const wxmlPath = join(componentDirectory, 'lk-action-sheet.wxml');
    const scriptPath = join(componentDirectory, 'lk-action-sheet.js');
    const propsPath = join(componentDirectory, 'action-sheet.props.js');

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
      const props = readFileSync(propsPath, 'utf8');
      const cancelTagPattern =
        /<view(?=[^>]*\blk-action-sheet__cancel\b)(?=[^>]*\bwx:if="\{\{([A-Za-z_$][\w$]*)\}\}")[^>]*>/;
      const cancelTag = wxml.match(cancelTagPattern);
      const showCancelComputed = script.match(
        /([A-Za-z_$][\w$]*)=[A-Za-z_$][\w$]*\.computed\(\(\)=>[A-Za-z_$][\w$]*\.shouldRenderActionSheetCancel\(/
      );

      expect(cancelTag?.[0]).toContain('lk-action-sheet__cancel');
      expect(cancelTag?.[0]).toContain('wx:if=');
      expect(showCancelComputed?.[1]).toBeTruthy();
      expect(
        script.match(
          new RegExp(`\\b${cancelTag?.[1]}\\s*:\\s*${showCancelComputed?.[1]}\\.value\\b`)
        )
      ).not.toBeNull();
      expect(props).toContain('cancelText:{type:String,default:void 0}');
      expect(
        cancelTag?.[0].replace(/\s+wx:if="\{\{[A-Za-z_$][\w$]*\}\}"/, '').match(cancelTagPattern)
      ).toBeNull();
    } finally {
      rmSync(outputDirectory, { recursive: true, force: true });
    }

    expect(existsSync(outputDirectory)).toBe(false);
  }, 60_000);

  it('resolves title, description and cancel text fallback', () => {
    expect(
      shouldRenderActionSheetHead({
        title: '操作',
        description: '',
      })
    ).toBe(true);
    expect(
      shouldRenderActionSheetHead({
        title: '',
        description: '',
      })
    ).toBe(false);
    expect(
      resolveActionSheetListClass({
        title: '',
        description: '',
      })
    ).toEqual({ 'is-no-head': true });

    expect(resolveActionSheetCancelText({ fallback: '取消' })).toBe('取消');
    expect(resolveActionSheetCancelText({ cancelText: null, fallback: '取消' })).toBe('取消');
    expect(
      resolveActionSheetCancelText({
        cancelText: '',
        fallback: '取消',
      })
    ).toBe('');
    expect(
      resolveActionSheetCancelText({
        cancelText: '关闭',
        fallback: '取消',
      })
    ).toBe('关闭');
    expect(shouldRenderActionSheetCancel('取消')).toBe(true);
    expect(shouldRenderActionSheetCancel('')).toBe(false);
  });

  it('guards disabled and loading actions before select emit', () => {
    expect(canSelectAction({ name: '编辑' })).toBe(true);
    expect(canSelectAction({ name: '删除', disabled: true })).toBe(false);
    expect(canSelectAction({ name: '提交', loading: true })).toBe(false);
  });

  it('creates action payload without cloning action or event', () => {
    const action = { name: '复制', color: '#1677ff' };
    const event = { type: 'tap' };

    expect(
      createActionSheetPayload({
        action,
        index: 2,
        event,
      })
    ).toEqual({
      action,
      index: 2,
      event,
    });
  });

  it('builds action item class and inline color', () => {
    expect(
      resolveActionSheetItemClass({
        action: { name: '下载', disabled: true },
        rippleActive: true,
        activeIndex: 1,
        index: 1,
      })
    ).toEqual({
      'is-disabled': true,
      'is-loading': false,
      'lk-ripple--active': true,
    });

    expect(
      resolveActionSheetItemClass({
        action: { name: '同步', loading: true },
        rippleActive: true,
        activeIndex: 0,
        index: 1,
      })
    ).toEqual({
      'is-disabled': false,
      'is-loading': true,
      'lk-ripple--active': false,
    });

    expect(resolveActionSheetItemStyle({ name: '删除', color: '#ff4d4f' })).toEqual({
      color: '#ff4d4f',
    });
    expect(resolveActionSheetItemStyle({ name: '默认' })).toEqual({ color: 'inherit' });
  });

  it('resolves cancel ripple, custom root style and auto close policy', () => {
    expect(
      resolveActionSheetCancelClass({
        rippleActive: true,
        activeIndex: 'cancel',
      })
    ).toEqual({ 'lk-ripple--active': true });
    expect(
      resolveActionSheetCancelClass({
        rippleActive: true,
        activeIndex: 0,
      })
    ).toEqual({ 'lk-ripple--active': false });

    const style = { paddingBottom: '24rpx' };
    expect(resolveActionSheetRootStyle(style)).toBe(style);
    expect(shouldCloseAfterAction(true)).toBe(true);
    expect(shouldCloseAfterAction(false)).toBe(false);
  });
});
