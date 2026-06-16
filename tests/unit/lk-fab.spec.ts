import { describe, expect, it } from 'vitest';
import {
  applyFabRubberBand,
  canClickFabAction,
  resolveFabActionClass,
  resolveFabActionStyle,
  resolveFabCurrentIcon,
  resolveFabDirection,
  resolveFabDragPosition,
  resolveFabFinalPosition,
  resolveFabIconStyle,
  resolveFabInitialPosition,
  resolveFabIsAtRightSide,
  resolveFabMainClass,
  resolveFabMainStyle,
  resolveFabRootStyle,
  resolveFabSafeBottom,
  resolveFabThemeColor,
  shouldCloseFabOnOverlay,
  shouldToggleFabOnClick,
  toFabRpx,
} from '../../src/uni_modules/lucky-ui/components/lk-fab/fab.utils';

describe('lk-fab drag and action rules', () => {
  it('normalizes units, safe area and initial position', () => {
    expect(toFabRpx(112)).toBe(112);
    expect(toFabRpx('56px')).toBe(112);
    expect(toFabRpx('112rpx')).toBe(112);
    expect(resolveFabSafeBottom({
      safeAreaInsetBottom: true,
      safeBottom: 20,
    })).toBe(20);

    expect(resolveFabInitialPosition({
      position: 'bottom-right',
      windowWidth: 375,
      windowHeight: 812,
      sizePx: 56,
      offsetPx: 16,
      safeBottomPx: 20,
      statusBarHeight: 24,
    })).toEqual({ x: 303, y: 720 });
    expect(resolveFabInitialPosition({
      position: 'top-left',
      windowWidth: 375,
      windowHeight: 812,
      sizePx: 56,
      offsetPx: 16,
      safeBottomPx: 20,
      statusBarHeight: 24,
    })).toEqual({ x: 16, y: 40 });
  });

  it('applies drag rubber band and magnetic final position', () => {
    expect(applyFabRubberBand(-30, 0, 100)).toBe(-9);
    expect(resolveFabDragPosition({
      startPosX: 20,
      startPosY: 40,
      dx: -40,
      dy: 900,
      windowWidth: 375,
      windowHeight: 812,
      sizePx: 56,
      safeBottomPx: 20,
      statusBarHeight: 24,
    })).toEqual({
      x: -6,
      y: 797.2,
    });

    expect(resolveFabFinalPosition({
      x: 120,
      y: 900,
      windowWidth: 375,
      windowHeight: 812,
      sizePx: 56,
      safeBottomPx: 20,
      statusBarHeight: 24,
      magnetic: true,
      offsetPx: 16,
      velocityX: 0.8,
    })).toEqual({
      x: 303,
      y: 736,
    });
  });

  it('resolves expansion direction and action style', () => {
    expect(resolveFabDirection({
      preferred: 'up',
      actionSizePx: 44,
      gapPx: 12,
      actionCount: 3,
      sizePx: 56,
      posX: 303,
      posY: 720,
      windowWidth: 375,
      windowHeight: 812,
      safeBottomPx: 20,
      statusBarHeight: 24,
    })).toBe('up');
    expect(resolveFabDirection({
      preferred: 'down',
      actionSizePx: 44,
      gapPx: 12,
      actionCount: 3,
      sizePx: 56,
      posX: 303,
      posY: 720,
      windowWidth: 375,
      windowHeight: 812,
      safeBottomPx: 20,
      statusBarHeight: 24,
    })).toBe('up');

    expect(resolveFabActionStyle({
      index: 1,
      actionSizePx: 44,
      gapPx: 12,
      sizePx: 56,
      direction: 'left',
      expanded: true,
      actionCount: 3,
    })).toMatchObject({
      width: '44px',
      height: '44px',
      transform: 'translate(-106px, 6px) scale(1)',
      opacity: 1,
      transitionDelay: '0.05s',
    });
  });

  it('builds classes, styles and icons', () => {
    expect(resolveFabThemeColor('primary')).toBe('var(--lk-color-primary)');
    expect(resolveFabMainStyle({
      posX: 10,
      posY: 20,
      sizePx: 56,
      zIndex: 400,
      color: '#f00',
      dragging: true,
    })).toMatchObject({
      left: '10px',
      top: '20px',
      width: '56px',
      height: '56px',
      zIndex: 400,
      '--fab-color': '#f00',
      transition: 'none',
    });
    expect(resolveFabRootStyle({
      zIndex: 400,
      customStyle: { pointerEvents: 'auto' },
    })).toEqual([{ zIndex: 400 }, { pointerEvents: 'auto' }]);
    expect(resolveFabMainClass({
      expanded: true,
      dragging: false,
      blur: true,
    })).toEqual([
      'lk-fab__main',
      {
        'is-expanded': true,
        'is-dragging': false,
        'is-blur': true,
      },
    ]);
    expect(resolveFabActionClass({
      action: { key: 'add', icon: 'plus', disabled: true },
      blur: true,
      atRightSide: false,
    })).toEqual({
      'is-disabled': true,
      'is-blur': true,
      'is-at-right': false,
      'is-at-left': true,
    });
    expect(resolveFabIconStyle({
      expanded: true,
      activeIcon: '',
    })).toMatchObject({ transform: 'rotate(45deg)' });
    expect(resolveFabCurrentIcon({
      expanded: true,
      icon: 'plus',
      activeIcon: 'x',
    })).toBe('x');
    expect(resolveFabIsAtRightSide({
      posX: 220,
      sizePx: 56,
      windowWidth: 375,
    })).toBe(true);
  });

  it('guards action, overlay and main click behavior', () => {
    expect(canClickFabAction({ key: 'add', icon: 'plus' })).toBe(true);
    expect(canClickFabAction({ key: 'delete', icon: 'trash', disabled: true })).toBe(false);
    expect(shouldToggleFabOnClick(0)).toBe(false);
    expect(shouldToggleFabOnClick(1)).toBe(true);
    expect(shouldCloseFabOnOverlay(true)).toBe(true);
    expect(shouldCloseFabOnOverlay(false)).toBe(false);
  });
});
