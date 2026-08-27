import { describe, expect, it } from 'vitest';
import {
  collapseItemProps,
  collapseProps,
} from '../../src/uni_modules/lucky-ui/components/lk-collapse/collapse.props';
import {
  getCollapseEmitValue,
  resolveCollapseArrowIcon,
  resolveCollapseArrowText,
  resolveCollapseBodyStyle,
  resolveCollapseHeaderClass,
  resolveCollapseItemClass,
  resolveCollapseRootClass,
  resolveCollapseRootStyle,
  resolveCollapseToggle,
  syncCollapseActive,
} from '../../src/uni_modules/lucky-ui/components/lk-collapse/collapse.utils';

describe('lk-collapse state and style rules', () => {
  it('syncs active names for accordion and multiple modes', () => {
    expect(syncCollapseActive({ modelValue: ['a', 'b'], accordion: true })).toEqual(['a']);
    expect(syncCollapseActive({ modelValue: '', accordion: true })).toEqual([]);
    expect(syncCollapseActive({ modelValue: ['a', 'b'], accordion: false })).toEqual(['a', 'b']);
    expect(syncCollapseActive({ modelValue: 'a', accordion: false })).toEqual([]);
  });

  it('toggles accordion panels and resolves emitted values', () => {
    expect(resolveCollapseToggle({
      active: ['a'],
      name: 'a',
      accordion: true,
    })).toEqual({
      wasOpen: true,
      next: [],
      modelValue: '',
      emitValue: undefined,
    });

    expect(resolveCollapseToggle({
      active: [],
      name: 'b',
      accordion: true,
    })).toEqual({
      wasOpen: false,
      next: ['b'],
      modelValue: 'b',
      emitValue: 'b',
    });
  });

  it('toggles multiple panels without mutating the current active list', () => {
    const active = ['a', 'b'];
    const result = resolveCollapseToggle({
      active,
      name: 'b',
      accordion: false,
    });

    expect(result).toEqual({
      wasOpen: true,
      next: ['a'],
      modelValue: ['a'],
      emitValue: ['a'],
    });
    expect(active).toEqual(['a', 'b']);
    expect(getCollapseEmitValue(['a', 'c'], false)).toEqual(['a', 'c']);
  });

  it('builds root class and style', () => {
    expect(resolveCollapseRootClass({
      variant: 'card',
      customClass: 'custom-collapse',
      bordered: true,
    })).toEqual([
      'lk-collapse',
      'lk-collapse--card',
      'custom-collapse',
      { 'is-bordered': true },
    ]);

    expect(resolveCollapseRootStyle({
      customStyle: { marginTop: '16rpx' },
      gap: 12,
    })).toEqual([
      { marginTop: '16rpx' },
      { '--lk-collapse-gap': '12rpx' },
    ]);
  });

  it('builds item, header and body styles', () => {
    expect(resolveCollapseItemClass({
      open: true,
      disabled: false,
      customClass: 'custom-item',
    })).toEqual([
      {
        'is-open': true,
        'is-disabled': false,
      },
      'custom-item',
    ]);
    expect(resolveCollapseHeaderClass(true)).toEqual({ 'lk-ripple--active': true });
    expect(resolveCollapseBodyStyle({
      animationDuration: '0.2s',
      animationTiming: 'ease-out',
    })).toEqual({
      '--lk-collapse-anim-duration': '0.2s',
      '--lk-collapse-anim-timing': 'ease-out',
    });
    expect(resolveCollapseBodyStyle({})).toEqual({});
  });

  it('exposes the lightweight default variant and item icon defaults', () => {
    expect(collapseProps.variant.default).toBe('default');
    expect(collapseProps.arrow.default).toBe(true);
    expect(collapseItemProps.iconSize.default).toBe('var(--lk-rpx-28)');
  });

  it('resolves item arrow options before collapse defaults', () => {
    expect(resolveCollapseArrowIcon({
      open: false,
      itemArrowIcon: 'plus-lg',
      parentArrowIcon: 'chevron-down',
    })).toBe('plus-lg');
    expect(resolveCollapseArrowIcon({
      open: true,
      itemOpenIcon: 'dash-lg',
      parentOpenIcon: 'chevron-up',
    })).toBe('dash-lg');
    expect(resolveCollapseArrowIcon({ open: true })).toBe('chevron-down');
    expect(resolveCollapseArrowText({
      open: false,
      arrowText: '展开',
      openText: '收起',
    })).toBe('展开');
    expect(resolveCollapseArrowText({
      open: true,
      arrowText: '展开',
      openText: '收起',
    })).toBe('收起');
  });
});
