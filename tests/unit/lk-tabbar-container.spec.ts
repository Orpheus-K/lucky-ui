import { describe, expect, it } from 'vitest';
import {
  getTabbarContainerPreloadIds,
  isTabbarContainerSlidingMode,
  resolveTabbarContainerActiveBgStyle,
  resolveTabbarContainerBadgeText,
  resolveTabbarContainerClass,
  resolveTabbarContainerCopyText,
  resolveTabbarContainerFillIconName,
  resolveTabbarContainerIcon,
  resolveTabbarContainerSafeAreaBottom,
  resolveTabbarContainerStyle,
  shouldChangeTabbarContainerTab,
  shouldShowTabbarContainerBadge,
} from '../../src/uni_modules/lucky-ui/components/lk-tabbar-container/tabbar-container.utils';

describe('lk-tabbar-container layout and navigation rules', () => {
  const tabs = [
    { id: 'home', label: '首页', icon: 'house' },
    { id: 'cart', label: '购物车', icon: 'cart', activeIconFill: true },
    { id: 'mine', label: '我的', icon: 'user', selectedIcon: 'user-selected' },
  ];

  it('resolves safe area, mode class and copy fallback', () => {
    expect(resolveTabbarContainerSafeAreaBottom({
      safeAreaInsets: { bottom: 20 },
    })).toBe(20);
    expect(resolveTabbarContainerSafeAreaBottom({
      screenHeight: 812,
      safeArea: { bottom: 778 },
    })).toBe(34);

    expect(isTabbarContainerSlidingMode('block')).toBe(true);
    expect(isTabbarContainerSlidingMode('float')).toBe(false);
    expect(resolveTabbarContainerCopyText({
      value: '',
      fallback: '加载中',
    })).toBe('加载中');
    expect(resolveTabbarContainerClass({
      mode: 'ripple',
      customClass: 'custom',
    })).toEqual([
      'lk-tabbar-container',
      'lk-tabbar-container--ripple',
      'custom',
    ]);
  });

  it('builds container style and active indicator geometry', () => {
    expect(resolveTabbarContainerStyle({
      preferRuntimeSafeArea: false,
      safeAreaBottom: 34,
      customStyle: { background: '#fff' },
    })).toEqual({
      '--lk-tabbar-container-safe-area-bottom': '34px',
      background: '#fff',
    });
    expect(resolveTabbarContainerActiveBgStyle({
      count: 4,
      activeIndex: 2,
    })).toEqual({
      '--item-width': '25%',
      '--item-left': '50%',
      '--item-count': 4,
      '--active-index': 2,
      '--active-center': '62.5%',
    });
    expect(resolveTabbarContainerActiveBgStyle({
      count: 0,
      activeIndex: -1,
    })).toEqual({ display: 'none' });
  });

  it('resolves active icons and preload ids', () => {
    expect(resolveTabbarContainerFillIconName('cart')).toBe('cart-fill');
    expect(resolveTabbarContainerFillIconName('cart-fill')).toBe('cart-fill');
    expect(resolveTabbarContainerIcon({
      tab: tabs[1],
      activeId: 'cart',
    })).toBe('cart-fill');
    expect(resolveTabbarContainerIcon({
      tab: tabs[2],
      activeId: 'mine',
    })).toBe('user-selected');
    expect(resolveTabbarContainerIcon({
      tab: tabs[0],
      activeId: 'cart',
    })).toBe('house');
    expect(getTabbarContainerPreloadIds({
      tabs,
      activeId: 'cart',
    })).toEqual(['home', 'mine']);
  });

  it('guards tab changes and badge display', () => {
    expect(shouldChangeTabbarContainerTab({
      nextTabId: 'cart',
      activeId: 'home',
    })).toBe(true);
    expect(shouldChangeTabbarContainerTab({
      nextTabId: 'home',
      activeId: 'home',
    })).toBe(false);
    expect(shouldShowTabbarContainerBadge(1)).toBe(true);
    expect(shouldShowTabbarContainerBadge(0)).toBe(false);
    expect(resolveTabbarContainerBadgeText(120)).toBe('99+');
    expect(resolveTabbarContainerBadgeText(undefined)).toBe('');
  });
});
