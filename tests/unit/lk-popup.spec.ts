import { describe, expect, it } from 'vitest';
import { ANIMATION_PRESETS } from '../../src/uni_modules/lucky-ui/composables/useTransition';
import {
  applyPopupRubberBand,
  canExpandPopupSheet,
  isPopupContentAtUpper,
  getPopupInitialOpenTranslateY,
  getPopupMinSnapY,
  getPopupTouchClientY,
  isPopupBottomDraggable,
  isPopupContentAtLower,
  isPopupSheetExpanded,
  normalizePopupSnapPixels,
  POPUP_DEFAULT_DRAG_EASING,
  POPUP_VELOCITY_THRESHOLD,
  resolvePopupDragDamping,
  resolvePopupAdjacentSnapTarget,
  resolvePopupPanelStyle,
  resolvePopupSize,
  resolvePopupSnapTarget,
  resolvePopupTransitionConfig,
  resolvePopupWrapperClass,
  resolvePopupWrapperStyle,
  shouldPopupSheetHandOffToContentScroll,
  shouldPopupSheetTakeContentGesture,
} from '../../src/uni_modules/lucky-ui/components/lk-popup/popup.utils';

describe('lk-popup transition and drag rules', () => {
  it('resolves popup dimensions', () => {
    expect(resolvePopupSize(320)).toBe('320rpx');
    expect(resolvePopupSize('80vh')).toBe('80vh');
    expect(resolvePopupSize('')).toBe('');
  });

  it('resolves transition priority by draggable, custom type, preset and position', () => {
    expect(resolvePopupTransitionConfig({
      position: 'bottom',
      draggable: true,
      duration: undefined,
    })).toEqual({
      name: 'fade',
      duration: 260,
      delay: undefined,
      easing: 'ease-out',
    });

    expect(resolvePopupTransitionConfig({
      position: 'center',
      draggable: false,
      animationType: 'fade-up',
      duration: 120,
      easing: 'linear',
    })).toEqual({
      name: 'fade-up',
      duration: 120,
      delay: undefined,
      easing: 'linear',
    });

    expect(resolvePopupTransitionConfig({
      position: 'left',
      draggable: false,
      animation: 'scale',
    })).toMatchObject({
      name: ANIMATION_PRESETS.scale.animation,
      duration: ANIMATION_PRESETS.scale.duration,
    });

    expect(resolvePopupTransitionConfig({
      position: 'right',
      draggable: false,
    })).toEqual({
      name: 'slide-right',
      duration: 260,
      delay: 0,
      easing: 'ease-out',
    });
  });

  it('builds wrapper class and style', () => {
    expect(isPopupBottomDraggable({
      position: 'bottom',
      draggable: true,
    })).toBe(true);
    expect(resolvePopupWrapperClass({
      position: 'bottom',
      round: true,
      draggable: true,
    })).toEqual([
      'lk-popup',
      'lk-popup--bottom',
      { 'is-round': true },
      { 'is-draggable': true },
    ]);
    expect(resolvePopupWrapperStyle({
      zIndex: 1000,
      radius: '24rpx',
    })).toEqual({
      zIndex: 1001,
      '--lk-popup-radius': '24rpx',
    });
  });

  it('normalizes snap points and resolves drag targets', () => {
    expect(normalizePopupSnapPixels({
      snapPoints: [0.5, 0.1, 0.5, 2],
      windowHeight: 800,
    })).toEqual([80, 400]);
    expect(getPopupInitialOpenTranslateY({
      snapPoints: [1.5],
      windowHeight: 800,
    })).toBe(800);
    expect(getPopupMinSnapY({
      snapPixels: [],
      windowHeight: 800,
    })).toBe(80);
    expect(getPopupTouchClientY({ touches: [{ clientY: 123 }] })).toBe(123);
    expect(applyPopupRubberBand({
      nextY: 20,
      minSnapY: 80,
    })).toBeCloseTo(69.2);
    expect(applyPopupRubberBand({
      nextY: 20,
      minSnapY: 80,
      damping: 0.1,
    })).toBe(74);
    expect(resolvePopupDragDamping(-1)).toBe(0);
    expect(resolvePopupDragDamping(2)).toBe(1);

    const snapPixels = [80, 400];
    expect(resolvePopupSnapTarget({
      currentY: 300,
      velocity: POPUP_VELOCITY_THRESHOLD + 0.1,
      snapPixels,
      windowHeight: 800,
    })).toBe(400);
    expect(resolvePopupSnapTarget({
      currentY: 300,
      velocity: -POPUP_VELOCITY_THRESHOLD - 0.1,
      snapPixels,
      windowHeight: 800,
    })).toBe(80);
    expect(resolvePopupSnapTarget({
      currentY: 760,
      velocity: 0,
      snapPixels,
      windowHeight: 800,
    })).toBe(800);
  });

  it('resolves scroll lower boundary and panel styles', () => {
    expect(canExpandPopupSheet({
      translateY: 120,
      minSnapY: 80,
    })).toBe(true);
    expect(isPopupContentAtLower({
      scrollTop: 294,
      viewportHeight: 300,
      scrollHeight: 600,
    })).toBe(true);

    expect(resolvePopupPanelStyle({
      position: 'bottom',
      draggable: true,
      transitionStyles: { opacity: 1 },
      height: '600rpx',
      width: '500rpx',
      transitionDuration: 120,
      dragEasing: undefined,
      isGestureActive: false,
      windowHeight: 800,
      translateY: 300,
      round: true,
      customStyle: { transform: 'scale(0.9)' },
    })).toEqual([
      { transform: 'scale(0.9)' },
      {
        opacity: 1,
        height: '500px',
        transform: 'none',
        transition: `height 0.26s ${POPUP_DEFAULT_DRAG_EASING}`,
        width: '500rpx',
        borderRadius:
          'var(--lk-popup-radius) var(--lk-popup-radius) 0 0',
      },
    ]);

    expect(resolvePopupPanelStyle({
      position: 'center',
      draggable: false,
      transitionStyles: { opacity: 1 },
      height: '600rpx',
      width: '',
      transitionDuration: 260,
      dragEasing: undefined,
      isGestureActive: false,
      windowHeight: 800,
      translateY: 0,
      round: false,
    })).toEqual([
      '',
      {
        opacity: 1,
        height: '600rpx',
      },
    ]);

    expect(resolvePopupPanelStyle({
      position: 'bottom',
      draggable: true,
      transitionStyles: {},
      height: '',
      width: '',
      transitionDuration: 320,
      dragEasing: 'linear',
      isGestureActive: false,
      windowHeight: 800,
      translateY: 400,
      round: false,
    })).toEqual([
      '',
      {
        height: '400px',
        transform: 'none',
        transition: 'height 0.32s linear',
        borderRadius: '0',
      },
    ]);
  });

  it('resolves adjacent sheet targets without skipping states', () => {
    const snapPixels = [80, 400];

    expect(resolvePopupAdjacentSnapTarget({
      startY: 400,
      currentY: 220,
      velocity: -POPUP_VELOCITY_THRESHOLD - 0.1,
      snapPixels,
      windowHeight: 800,
    })).toBe(80);

    expect(resolvePopupAdjacentSnapTarget({
      startY: 80,
      currentY: 760,
      velocity: POPUP_VELOCITY_THRESHOLD + 0.1,
      snapPixels,
      windowHeight: 800,
    })).toBe(400);

    expect(resolvePopupAdjacentSnapTarget({
      startY: 400,
      currentY: 760,
      velocity: POPUP_VELOCITY_THRESHOLD + 0.1,
      snapPixels,
      windowHeight: 800,
    })).toBe(800);

    expect(resolvePopupAdjacentSnapTarget({
      startY: 80,
      currentY: 96,
      velocity: 0,
      snapPixels,
      windowHeight: 800,
    })).toBe(80);
  });

  it('coordinates content scroll and sheet drag priority', () => {
    expect(isPopupSheetExpanded({
      translateY: 80,
      minSnapY: 80,
    })).toBe(true);
    expect(isPopupContentAtUpper({ scrollTop: 3 })).toBe(true);
    expect(isPopupContentAtUpper({ scrollTop: 12 })).toBe(false);

    expect(shouldPopupSheetTakeContentGesture({
      translateY: 400,
      minSnapY: 80,
      scrollTop: 120,
      deltaY: -40,
    })).toBe(true);

    expect(shouldPopupSheetTakeContentGesture({
      translateY: 80,
      minSnapY: 80,
      scrollTop: 120,
      deltaY: 40,
    })).toBe(false);

    expect(shouldPopupSheetTakeContentGesture({
      translateY: 80,
      minSnapY: 80,
      scrollTop: 0,
      deltaY: 40,
    })).toBe(true);

    expect(shouldPopupSheetTakeContentGesture({
      translateY: 80,
      minSnapY: 80,
      scrollTop: 0,
      deltaY: -40,
    })).toBe(false);

    expect(shouldPopupSheetHandOffToContentScroll({
      startTranslateY: 400,
      nextY: 80,
      minSnapY: 80,
      deltaY: -320,
    })).toBe(true);

    expect(shouldPopupSheetHandOffToContentScroll({
      startTranslateY: 80,
      nextY: 60,
      minSnapY: 80,
      deltaY: -20,
    })).toBe(false);

    expect(shouldPopupSheetHandOffToContentScroll({
      startTranslateY: 400,
      nextY: 160,
      minSnapY: 80,
      deltaY: -240,
    })).toBe(false);
  });
});
