import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import * as VueRuntime from 'vue';
import { describe, expect, it, vi } from 'vitest';
import * as SkeletonPropsModule from '../../src/uni_modules/lucky-ui/components/lk-skeleton/skeleton.props';
import * as SkeletonUtilsModule from '../../src/uni_modules/lucky-ui/components/lk-skeleton/skeleton.utils';

const {
  resolveSkeletonAnimatedClass,
  resolveSkeletonAvatarStyle,
  resolveSkeletonHostStyle,
  resolveSkeletonIndexedValue,
  resolveSkeletonRowStyle,
  resolveSkeletonRootClass,
  resolveSkeletonTitleStyle,
} = SkeletonUtilsModule;

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
const skeletonSfcUrl = new URL(
  '../../src/uni_modules/lucky-ui/components/lk-skeleton/lk-skeleton.vue',
  import.meta.url
);
const skeletonRenderer = VueRuntime.createRenderer<HostNode, HostNode>({
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

function compileProductionSkeleton(): VueRuntime.Component {
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
  const source = readFileSync(skeletonSfcUrl, 'utf8');
  const { descriptor, errors } = compiler.parse(source, { filename: skeletonSfcUrl.pathname });

  if (errors.length > 0) throw new Error(`Failed to parse lk-skeleton.vue: ${String(errors[0])}`);

  const compiled = compiler.compileScript(descriptor, {
    id: 'lk-skeleton-stable-host-production-wire',
    inlineTemplate: true,
    templateOptions: { compilerOptions: { isCustomElement: tag => tag === 'view' } },
  });
  const transformed = babel.transformSync(compiled.content, {
    babelrc: false,
    configFile: false,
    filename: 'lk-skeleton.vue.ts',
    plugins: [typeScriptPlugin, commonJsPlugin],
  });

  if (!transformed?.code) throw new Error('Failed to transform compiled lk-skeleton.vue');

  const requireFromSkeleton = (request: string): unknown => {
    if (request === 'vue') return VueRuntime;
    if (request === './skeleton.props') return SkeletonPropsModule;
    if (request === './skeleton.utils') return SkeletonUtilsModule;
    throw new Error(`Unexpected lk-skeleton.vue import: ${request}`);
  };
  const compiledModule: CommonJsModule = { exports: {} };
  const executeModule = new Function('require', 'module', 'exports', transformed.code);
  executeModule(requireFromSkeleton, compiledModule, compiledModule.exports);
  return compiledModule.exports.default as VueRuntime.Component;
}

function findById(node: HostNode, id: string): HostNode | undefined {
  if (node.props.id === id) return node;
  for (const child of node.children) {
    const match = findById(child, id);
    if (match) return match;
  }
  return undefined;
}

describe('lk-skeleton display rules', () => {
  it('keeps the production SFC host identity and BaseProps across loading changes', async () => {
    const Skeleton = compileProductionSkeleton();
    const loading = VueRuntime.ref(true);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const App = VueRuntime.defineComponent({
      render: () =>
        VueRuntime.h(
          Skeleton,
          {
            id: 'stable-skeleton',
            loading: loading.value,
            avatar: true,
            title: true,
            customClass: 'audit-skeleton',
            customStyle: { gridArea: 'content', display: 'grid' },
          },
          {
            default: () =>
              VueRuntime.h('view', { id: 'stable-skeleton-content' }, 'loaded content'),
          }
        ),
    });
    const root: HostNode = { type: 'root', props: {}, children: [], parent: null };
    const app = skeletonRenderer.createApp(App);

    try {
      app.mount(root);
      const loadingHost = findById(root, 'stable-skeleton');
      expect(loadingHost).toBeTruthy();
      expect(String(loadingHost?.props.class)).toContain('audit-skeleton');
      expect(loadingHost?.props.style).toMatchObject({
        display: 'grid',
        gridArea: 'content',
      });
      expect(findById(root, 'stable-skeleton-content')).toBeUndefined();

      loading.value = false;
      await VueRuntime.nextTick();
      const loadedHost = findById(root, 'stable-skeleton');
      expect(loadedHost).toBe(loadingHost);
      expect(String(loadedHost?.props.class)).toContain('audit-skeleton');
      expect(loadedHost?.props.style).toMatchObject({
        display: 'grid',
        gridArea: 'content',
      });
      const loadedContent = findById(root, 'stable-skeleton-content');
      expect(loadedContent).toBeTruthy();
      expect(loadedContent?.parent).toBe(loadedHost);
      expect(loadedHost?.children.filter(child => child.type === 'view')).toHaveLength(1);

      loading.value = true;
      await VueRuntime.nextTick();
      expect(findById(root, 'stable-skeleton')).toBe(loadingHost);
      expect(findById(root, 'stable-skeleton-content')).toBeUndefined();
      expect(warning).not.toHaveBeenCalled();
    } finally {
      app.unmount();
      warning.mockRestore();
    }
  });

  it('compiles one stable WeChat host around both loading branches', () => {
    const uniBin = nodeRequire.resolve('@dcloudio/vite-plugin-uni/bin/uni.js');
    const temporaryParent = resolve(tmpdir());
    const outputDirectory = mkdtempSync(join(temporaryParent, 'lucky-ui-skeleton-host-mp-'));
    const componentDirectory = join(outputDirectory, 'uni_modules/lucky-ui/components/lk-skeleton');
    const wxmlPath = join(componentDirectory, 'lk-skeleton.wxml');

    expect(dirname(outputDirectory)).toBe(temporaryParent);
    expect(existsSync(wxmlPath)).toBe(false);

    try {
      execFileSync(process.execPath, [uniBin, 'build', '-p', 'mp-weixin'], {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'production', UNI_OUTPUT_DIR: outputDirectory },
        stdio: 'pipe',
      });
      const wxml = readFileSync(wxmlPath, 'utf8');
      const stableHost = wxml.match(
        /^<view id="\{\{[A-Za-z_$][\w$]*\}\}" class="\{\{[A-Za-z_$][\w$]*\}\}" style="\{\{[A-Za-z_$][\w$]*\}\}">([\s\S]*)<\/view>$/
      );

      expect(stableHost).toBeTruthy();
      expect(wxml.match(/\bid=/g)).toHaveLength(1);
      expect(stableHost?.[1]).toMatch(
        /^<view wx:if="\{\{[A-Za-z_$][\w$]*\}\}" class="lk-skeleton__body">[\s\S]*<\/view><slot wx:else\/>$/
      );
    } finally {
      rmSync(outputDirectory, { recursive: true, force: true });
    }

    expect(existsSync(outputDirectory)).toBe(false);
  }, 60_000);

  it('resolves indexed width and height values with last item fallback', () => {
    expect(resolveSkeletonIndexedValue(['40%', '80%'], 0, '100%')).toBe('40%');
    expect(resolveSkeletonIndexedValue(['40%', '80%'], 3, '100%')).toBe('80%');
    expect(resolveSkeletonIndexedValue([], 0, '100%')).toBe('100%');
    expect(resolveSkeletonIndexedValue('60%', 0, '100%')).toBe('60%');
  });

  it('builds host animation variables', () => {
    expect(
      resolveSkeletonHostStyle({
        duration: 2.4,
        easing: 'ease-in-out',
        customStyle: { marginTop: '8rpx' },
      })
    ).toEqual([
      {
        '--lk-skel-duration': '2.4s',
        '--lk-skel-ease': 'ease-in-out',
      },
      { marginTop: '8rpx' },
    ]);

    expect(
      resolveSkeletonHostStyle({
        duration: '',
        easing: 'linear',
      })
    ).toEqual([
      {
        '--lk-skel-duration': '1.8s',
        '--lk-skel-ease': 'linear',
      },
      '',
    ]);

    expect(resolveSkeletonRootClass('custom-skeleton')).toEqual(['lk-skeleton', 'custom-skeleton']);
  });

  it('builds avatar and title styles', () => {
    expect(
      resolveSkeletonAvatarStyle({
        avatarSize: '72rpx',
        round: true,
      })
    ).toEqual({
      width: '72rpx',
      height: '72rpx',
      borderRadius: '50%',
    });

    expect(
      resolveSkeletonTitleStyle({
        titleWidth: '40%',
        titleHeight: '32rpx',
      })
    ).toEqual({
      width: '40%',
      height: '32rpx',
    });
  });

  it('builds row style and animation class', () => {
    expect(
      resolveSkeletonRowStyle({
        rowWidth: ['100%', '60%'],
        rowHeight: '32rpx',
        index: 2,
      })
    ).toEqual({
      width: '60%',
      height: '32rpx',
    });

    expect(resolveSkeletonAnimatedClass(true)).toBe('is-anim');
    expect(resolveSkeletonAnimatedClass(false)).toBe('');
  });
});
