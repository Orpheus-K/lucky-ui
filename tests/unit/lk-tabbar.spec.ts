import { describe, expect, it } from 'vitest';
import { TabbarMode } from '../../src/uni_modules/lucky-ui/components/lk-tabbar/tabbar.props';
import {
  isTabbarBumpItem,
  resolveTabbarBadgeText,
  resolveTabbarFillIconName,
  resolveTabbarIconColor,
  resolveTabbarIndex,
  resolveTabbarItemActive,
  resolveTabbarItemClass,
  resolveTabbarItemLabelStyle,
  resolveTabbarListItemIcon,
  resolveTabbarPlaceholderStyle,
  resolveTabbarRootClass,
  resolveTabbarRootStyle,
  resolveTabbarSafeAreaBottom,
  resolveTabbarSliderMetrics,
  resolveTabbarSliderStyle,
  resolveTabbarStyleLayers,
  shouldShowTabbarBadge,
  shouldSwitchTabbarPage,
} from '../../src/uni_modules/lucky-ui/components/lk-tabbar/tabbar.utils';

describe('lk-tabbar layout and item rules', () => {
  it('resolves safe area and root style/class', () => {
    expect(resolveTabbarSafeAreaBottom({
      safeAreaInsets: { bottom: 18 },
    })).toBe(18);
    expect(resolveTabbarSafeAreaBottom({
      screenHeight: 812,
      safeArea: { bottom: 778 },
    })).toBe(34);

    expect(resolveTabbarRootStyle({
      zIndex: 300,
      safeArea: true,
      preferRuntimeSafeArea: false,
      safeAreaBottom: 34,
      bgColor: '#fff',
      activeColor: '#1677ff',
      inactiveColor: '#999',
    })).toEqual({
      zIndex: 300,
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      '--lk-tabbar-safe-area-bottom': '34px',
      '--lk-tabbar-bg': '#fff',
      '--lk-tabbar-active-color': '#1677ff',
      '--lk-tabbar-inactive-color': '#999',
    });

    expect(resolveTabbarRootClass({
      customClass: 'custom',
      mode: TabbarMode.Slider,
      fixed: true,
      safeArea: true,
      border: false,
      glassBg: true,
    })).toEqual([
      'custom',
      'lk-tabbar--slider',
      {
        'lk-tabbar--fixed': true,
        'lk-tabbar--safe-area': true,
        'lk-tabbar--border': false,
        'lk-tabbar--glass': true,
      },
    ]);
  });

  it('resolves slider and placeholder geometry', () => {
    expect(resolveTabbarIndex('2')).toBe(2);
    expect(resolveTabbarIndex('abc')).toBe(0);
    expect(resolveTabbarSliderMetrics({
      mode: TabbarMode.Slider,
      totalItems: 4,
      index: 2,
    })).toEqual({
      left: 50,
      width: 25,
    });
    expect(resolveTabbarSliderMetrics({
      mode: TabbarMode.Fixed,
      totalItems: 4,
      index: 2,
    })).toBeNull();
    expect(resolveTabbarSliderStyle({
      left: 50,
      width: 25,
    })).toEqual({
      left: '50%',
      width: '25%',
    });
    expect(resolveTabbarPlaceholderStyle({
      safeArea: true,
      preferRuntimeSafeArea: false,
      safeAreaBottom: 34,
    })).toEqual({
      '--lk-tabbar-safe-area-bottom': '34px',
    });
    expect(resolveTabbarStyleLayers({
      rootStyle: { zIndex: 300 },
      customStyle: 'color:red;',
    })).toEqual([{ zIndex: 300 }, 'color:red;']);
  });

  it('resolves item active, bump and icon rules', () => {
    expect(resolveTabbarItemActive('home', 'home')).toBe(true);
    expect(resolveTabbarItemActive('1', 1)).toBe(false);
    expect(isTabbarBumpItem({
      mode: TabbarMode.Bump,
      total: 5,
      index: 2,
    })).toBe(true);
    expect(isTabbarBumpItem({
      mode: TabbarMode.Bump,
      total: 4,
      index: 2,
    })).toBe(false);
    expect(resolveTabbarItemClass({
      active: true,
      bump: false,
      customClass: 'custom-item',
    })).toEqual([
      {
        'is-active': true,
        'lk-tabbar-item--bump': false,
      },
      'custom-item',
    ]);
    expect(resolveTabbarIconColor({
      active: true,
      bump: false,
      activeColor: '',
      inactiveColor: '',
    })).toBe('var(--lk-color-primary)');
    expect(resolveTabbarIconColor({
      active: false,
      bump: true,
      activeColor: '#1677ff',
      inactiveColor: '#999',
    })).toBe('var(--lk-color-white)');
  });

  it('resolves fill icons, badges, label style and page switch', () => {
    expect(resolveTabbarFillIconName('house')).toBe('house-fill');
    expect(resolveTabbarFillIconName('house-fill')).toBe('house-fill');
    expect(resolveTabbarListItemIcon({
      active: true,
      item: {
        icon: 'house',
        selectedIcon: 'house-selected',
        text: '首页',
      },
    })).toBe('house-selected');
    expect(resolveTabbarListItemIcon({
      active: true,
      item: {
        icon: 'house',
        activeIconFill: true,
        text: '首页',
      },
    })).toBe('house-fill');

    expect(shouldShowTabbarBadge({
      dot: false,
      badge: 0,
    })).toBe(true);
    expect(shouldShowTabbarBadge({
      dot: true,
      badge: 5,
    })).toBe(false);
    expect(resolveTabbarBadgeText(5)).toBe('5');
    expect(resolveTabbarItemLabelStyle({
      active: false,
      bump: false,
      activeColor: '#1677ff',
      inactiveColor: '#999',
    })).toBe('color: #999');
    expect(shouldSwitchTabbarPage({
      switchPage: true,
      item: {
        icon: 'house',
        text: '首页',
        pagePath: '/pages/index/index',
      },
    })).toBe(true);
  });
});
