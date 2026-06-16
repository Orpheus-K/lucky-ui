import { describe, expect, it } from 'vitest';
import {
  resolveOverlayBackground,
  resolveOverlayBaseStyle,
  resolveOverlayStyle,
  resolveOverlayVisible,
  shouldCloseOverlayOnClick,
  shouldLockOverlayScroll,
  shouldPreventOverlayTouchMove,
} from '../../src/uni_modules/lucky-ui/components/lk-overlay/overlay.utils';

describe('lk-overlay visibility and interaction rules', () => {
  it('resolves visibility from modelValue', () => {
    expect(resolveOverlayVisible({
      modelValue: true,
    })).toBe(true);
    expect(resolveOverlayVisible({
      modelValue: false,
    })).toBe(false);
  });

  it('builds background and style from opacity or explicit background', () => {
    expect(resolveOverlayBackground({
      background: '',
      opacity: 0.42,
    })).toBe('rgba(0,0,0,0.42)');
    expect(resolveOverlayBackground({
      background: 'rgba(255,0,0,0.3)',
      opacity: 0.42,
    })).toBe('rgba(255,0,0,0.3)');

    expect(resolveOverlayBaseStyle({
      zIndex: 1200,
      background: '',
      opacity: 0.5,
    })).toEqual({
      zIndex: 1200,
      '--lk-overlay-bg': 'rgba(0,0,0,0.5)',
    });
  });

  it('keeps transition and custom style layers in render order', () => {
    const transitionStyles = { opacity: 1 };
    const customStyle = { backdropFilter: 'blur(8px)' };

    expect(resolveOverlayStyle({
      zIndex: 900,
      background: '#000',
      opacity: 0.55,
      transitionStyles,
      customStyle,
    })).toEqual([
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
    expect(shouldLockOverlayScroll({
      visible: true,
      lockScroll: true,
    })).toBe(true);
    expect(shouldLockOverlayScroll({
      visible: false,
      lockScroll: true,
    })).toBe(false);
    expect(shouldLockOverlayScroll({
      visible: true,
      lockScroll: false,
    })).toBe(false);
    expect(shouldPreventOverlayTouchMove(true)).toBe(true);
    expect(shouldPreventOverlayTouchMove(false)).toBe(false);
  });
});
