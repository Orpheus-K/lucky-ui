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

describe('lk-action-sheet selection rules', () => {
  it('resolves title, description and cancel text fallback', () => {
    expect(shouldRenderActionSheetHead({
      title: '操作',
      description: '',
    })).toBe(true);
    expect(shouldRenderActionSheetHead({
      title: '',
      description: '',
    })).toBe(false);
    expect(resolveActionSheetListClass({
      title: '',
      description: '',
    })).toEqual({ 'is-no-head': true });

    expect(resolveActionSheetCancelText({
      cancelText: '',
      fallback: '取消',
    })).toBe('取消');
    expect(resolveActionSheetCancelText({
      cancelText: '关闭',
      fallback: '取消',
    })).toBe('关闭');
  });

  it('guards disabled and loading actions before select emit', () => {
    expect(canSelectAction({ name: '编辑' })).toBe(true);
    expect(canSelectAction({ name: '删除', disabled: true })).toBe(false);
    expect(canSelectAction({ name: '提交', loading: true })).toBe(false);
  });

  it('creates action payload without cloning action or event', () => {
    const action = { name: '复制', color: '#1677ff' };
    const event = { type: 'tap' };

    expect(createActionSheetPayload({
      action,
      index: 2,
      event,
    })).toEqual({
      action,
      index: 2,
      event,
    });
  });

  it('builds action item class and inline color', () => {
    expect(resolveActionSheetItemClass({
      action: { name: '下载', disabled: true },
      rippleActive: true,
      activeIndex: 1,
      index: 1,
    })).toEqual({
      'is-disabled': true,
      'is-loading': false,
      'lk-ripple--active': true,
    });

    expect(resolveActionSheetItemClass({
      action: { name: '同步', loading: true },
      rippleActive: true,
      activeIndex: 0,
      index: 1,
    })).toEqual({
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
    expect(resolveActionSheetCancelClass({
      rippleActive: true,
      activeIndex: 'cancel',
    })).toEqual({ 'lk-ripple--active': true });
    expect(resolveActionSheetCancelClass({
      rippleActive: true,
      activeIndex: 0,
    })).toEqual({ 'lk-ripple--active': false });

    const style = { paddingBottom: '24rpx' };
    expect(resolveActionSheetRootStyle(style)).toBe(style);
    expect(shouldCloseAfterAction(true)).toBe(true);
    expect(shouldCloseAfterAction(false)).toBe(false);
  });
});
