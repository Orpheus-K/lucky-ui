import { describe, expect, it } from 'vitest';
import {
  createToastItem,
  resolveToastManagerItemClass,
  resolveToastManagerTransition,
  resolveToastOverlayClass,
  resolveToastOverlayStyle,
  resolveToastRootClass,
  resolveToastRootStyle,
  resolveToastTransition,
  shouldScheduleToastClose,
} from '../../src/uni_modules/lucky-ui/components/lk-toast/toast.utils';

describe('lk-toast display and manager rules', () => {
  it('resolves controlled toast transition by position', () => {
    expect(resolveToastTransition({
      transition: 'slide-up',
      position: 'top',
    })).toBe('slide-down');
    expect(resolveToastTransition({
      transition: 'slide-up',
      position: 'center',
    })).toBe('zoom-in');
    expect(resolveToastTransition({
      transition: 'fade',
      position: 'bottom',
    })).toBe('fade');
  });

  it('builds overlay and root classes/styles', () => {
    expect(shouldScheduleToastClose(2000)).toBe(true);
    expect(shouldScheduleToastClose(0)).toBe(false);
    expect(resolveToastOverlayClass(true)).toEqual({ 'is-lock': true });
    expect(resolveToastOverlayStyle(2000)).toEqual({ zIndex: 2000 });
    expect(resolveToastRootClass('bottom')).toEqual(['lk-toast--bottom']);
    expect(resolveToastRootStyle(2000)).toEqual({ zIndex: 2001 });
  });

  it('normalizes manager transition and item class', () => {
    expect(resolveToastManagerTransition({
      position: 'top',
    })).toBe('slide-down');
    expect(resolveToastManagerTransition({
      position: 'center',
    })).toBe('zoom-in');
    expect(resolveToastManagerTransition({
      position: 'bottom',
      transition: 'fade',
    })).toBe('fade');
    expect(resolveToastManagerItemClass('center')).toEqual(['pos-center']);
  });

  it('creates manager items from string or object options', () => {
    expect(createToastItem({
      id: 1,
      input: '保存成功',
    })).toEqual({
      id: 1,
      message: '保存成功',
      transition: 'zoom-in',
      duration: 2000,
      position: 'center',
      visible: true,
    });

    expect(createToastItem({
      id: 2,
      input: {
        message: '顶部提示',
        position: 'top',
        duration: 0,
      },
    })).toEqual({
      id: 2,
      message: '顶部提示',
      transition: 'slide-down',
      duration: 0,
      position: 'top',
      visible: true,
    });
  });
});
