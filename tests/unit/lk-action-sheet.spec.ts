import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canSelectAction,
  createActionSheetPayload,
  resolveActionSheetCancelClass,
  resolveActionSheetCancelText,
  resolveActionSheetItemClass,
  resolveActionSheetItemStyle,
  resolveActionSheetListClass,
  resolveActionSheetRootStyle,
  shouldCloseAfterAction,
  shouldRenderActionSheetHead,
} from '../../src/uni_modules/lucky-ui/components/lk-action-sheet/action-sheet.utils';

const nodeRequire = createRequire(import.meta.url);

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

    expect(
      resolveActionSheetCancelText({
        cancelText: '',
        fallback: '取消',
      })
    ).toBe('取消');
    expect(
      resolveActionSheetCancelText({
        cancelText: '关闭',
        fallback: '取消',
      })
    ).toBe('关闭');
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
