import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createRenderer, defineComponent, nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import {
  preventOverlayTouchMove,
  resolveOverlayBackground,
  resolveOverlayBaseStyle,
  resolveOverlayStyle,
  resolveOverlayVisible,
  shouldCloseOverlayOnClick,
  shouldLockOverlayScroll,
  useOverlayScrollLock,
} from '../../src/uni_modules/lucky-ui/components/lk-overlay/overlay.utils';
import {
  createBodyScrollLock,
  type ScrollLockStyle,
} from '../../src/uni_modules/lucky-ui/utils/scroll-lock';

type TestNode = Record<string, unknown>;
type TestElement = TestNode;

const nodeRequire = createRequire(import.meta.url);
const testRenderer = createRenderer<TestNode, TestElement>({
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

describe('lk-overlay visibility and interaction rules', () => {
  it('resolves visibility from modelValue', () => {
    expect(
      resolveOverlayVisible({
        modelValue: true,
      })
    ).toBe(true);
    expect(
      resolveOverlayVisible({
        modelValue: false,
      })
    ).toBe(false);
  });

  it('builds background and style from opacity or explicit background', () => {
    expect(
      resolveOverlayBackground({
        background: '',
        opacity: 0.42,
      })
    ).toBe('rgba(0,0,0,0.42)');
    expect(
      resolveOverlayBackground({
        background: 'rgba(255,0,0,0.3)',
        opacity: 0.42,
      })
    ).toBe('rgba(255,0,0,0.3)');

    expect(
      resolveOverlayBaseStyle({
        zIndex: 1200,
        background: '',
        opacity: 0.5,
      })
    ).toEqual({
      zIndex: 1200,
      '--lk-overlay-bg': 'rgba(0,0,0,0.5)',
    });
  });

  it('keeps transition and custom style layers in render order', () => {
    const transitionStyles = { opacity: 1 };
    const customStyle = { backdropFilter: 'blur(8px)' };

    expect(
      resolveOverlayStyle({
        zIndex: 900,
        background: '#000',
        opacity: 0.55,
        transitionStyles,
        customStyle,
      })
    ).toEqual([
      {
        zIndex: 900,
        '--lk-overlay-bg': '#000',
      },
      transitionStyles,
      customStyle,
    ]);
  });

  it('resolves click close and scroll lock guards', () => {
    expect(shouldCloseOverlayOnClick(true)).toBe(true);
    expect(shouldCloseOverlayOnClick(false)).toBe(false);
    expect(
      shouldLockOverlayScroll({
        visible: true,
        lockScroll: true,
      })
    ).toBe(true);
    expect(
      shouldLockOverlayScroll({
        visible: false,
        lockScroll: true,
      })
    ).toBe(false);
    expect(
      shouldLockOverlayScroll({
        visible: true,
        lockScroll: false,
      })
    ).toBe(false);
  });

  it('keeps the body locked until every overlay owner releases it', () => {
    const style: ScrollLockStyle = { overflow: 'auto' };
    const first = createBodyScrollLock(() => style);
    const second = createBodyScrollLock(() => style);

    expect(first.sync(true)).toBe(true);
    expect(first.sync(true)).toBe(true);
    expect(second.sync(true)).toBe(true);
    expect(style.overflow).toBe('hidden');

    expect(first.sync(false)).toBe(false);
    expect(first.isLocked()).toBe(false);
    expect(second.isLocked()).toBe(true);
    expect(style.overflow).toBe('hidden');

    second.release();
    expect(second.isLocked()).toBe(false);
    expect(style.overflow).toBe('auto');
  });

  it('tracks runtime lock toggles and restores the exact prior overflow', () => {
    const style: ScrollLockStyle = { overflow: 'clip' };
    const lock = createBodyScrollLock(() => style);

    expect(lock.sync(false)).toBe(false);
    expect(style.overflow).toBe('clip');
    expect(lock.sync(true)).toBe(true);
    expect(style.overflow).toBe('hidden');
    expect(lock.sync(false)).toBe(false);
    expect(style.overflow).toBe('clip');
    expect(lock.sync(true)).toBe(true);
    expect(style.overflow).toBe('hidden');

    lock.release();
    expect(style.overflow).toBe('clip');
  });

  it('can retry after the H5 body target becomes available', () => {
    const style: ScrollLockStyle = { overflow: '' };
    let target: ScrollLockStyle | null = null;
    const lock = createBodyScrollLock(() => target);

    expect(lock.sync(true)).toBe(false);
    target = style;
    expect(lock.sync(true)).toBe(true);
    expect(style.overflow).toBe('hidden');

    lock.release();
    expect(style.overflow).toBe('');
  });

  it('does not overwrite a newer external body overflow change when releasing', () => {
    const style: ScrollLockStyle = { overflow: 'auto' };
    const lock = createBodyScrollLock(() => style);

    expect(lock.sync(true)).toBe(true);
    style.overflow = 'clip';
    lock.release();

    expect(style.overflow).toBe('clip');
    expect(lock.isLocked()).toBe(false);
  });

  it('syncs mounted overlays across runtime toggles and releases on unmount', async () => {
    const style: ScrollLockStyle = { overflow: 'auto' };
    const firstVisible = ref(true);
    const firstLockScroll = ref(true);
    const secondVisible = ref(true);
    const firstController = createBodyScrollLock(() => style);
    const secondController = createBodyScrollLock(() => style);

    const FirstOverlay = defineComponent({
      setup() {
        useOverlayScrollLock(() => firstVisible.value && firstLockScroll.value, firstController);
        return () => null;
      },
    });
    const SecondOverlay = defineComponent({
      setup() {
        useOverlayScrollLock(() => secondVisible.value, secondController);
        return () => null;
      },
    });
    const firstApp = testRenderer.createApp(FirstOverlay);
    const secondApp = testRenderer.createApp(SecondOverlay);

    firstApp.mount({});
    secondApp.mount({});
    await nextTick();
    expect(style.overflow).toBe('hidden');

    firstLockScroll.value = false;
    await nextTick();
    expect(firstController.isLocked()).toBe(false);
    expect(secondController.isLocked()).toBe(true);
    expect(style.overflow).toBe('hidden');

    firstLockScroll.value = true;
    await nextTick();
    expect(firstController.isLocked()).toBe(true);

    firstApp.unmount();
    expect(firstController.isLocked()).toBe(false);
    expect(style.overflow).toBe('hidden');

    secondVisible.value = false;
    await nextTick();
    expect(style.overflow).toBe('auto');

    secondVisible.value = true;
    await nextTick();
    expect(style.overflow).toBe('hidden');
    secondApp.unmount();
    expect(secondController.isLocked()).toBe(false);
    expect(style.overflow).toBe('auto');
  });

  it('prevents H5 touchmove only while scroll locking is active', () => {
    const preventDefault = vi.fn();

    preventOverlayTouchMove({ preventDefault }, false);
    expect(preventDefault).not.toHaveBeenCalled();

    preventOverlayTouchMove({ preventDefault }, true);
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it('compiles a conditional catch binding only for locked WeChat overlays', () => {
    const uniBin = nodeRequire.resolve('@dcloudio/vite-plugin-uni/bin/uni.js');
    const temporaryParent = resolve(tmpdir());
    const outputDirectory = mkdtempSync(join(temporaryParent, 'lucky-ui-overlay-mp-'));
    const outputPath = join(
      outputDirectory,
      'uni_modules/lucky-ui/components/lk-overlay/lk-overlay.wxml'
    );
    const buildStartedAt = Date.now();

    expect(dirname(outputDirectory)).toBe(temporaryParent);
    expect(existsSync(outputPath)).toBe(false);

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

      expect(existsSync(outputPath)).toBe(true);
      expect(statSync(outputPath).mtimeMs).toBeGreaterThanOrEqual(buildStartedAt - 1_000);
      const output = readFileSync(outputPath, 'utf8');

      expect(output).toMatch(
        /data-testid="lk-overlay" data-scroll-locked="true"[^>]*catchtouchmove=/
      );
      expect(output).toMatch(
        /data-testid="lk-overlay" data-scroll-locked="false"[^>]*bindtouchmove=/
      );
      expect(output).not.toMatch(
        /data-scroll-locked="true"[^>]*bindtouchmove=|data-scroll-locked="false"[^>]*catchtouchmove=/
      );
    } finally {
      rmSync(outputDirectory, { recursive: true, force: true });
    }

    expect(existsSync(outputDirectory)).toBe(false);
  }, 60_000);
});
