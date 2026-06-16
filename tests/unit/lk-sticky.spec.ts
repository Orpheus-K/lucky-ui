import { describe, expect, it } from 'vitest';
import {
  resolveStickyBaseStyle,
  resolveStickyClass,
  resolveStickyOffset,
  resolveStickyRootMargin,
  resolveStickyStateFromRatio,
  resolveStickyStyle,
  resolveStickyViewportOffset,
  shouldEmitStickyChange,
} from '../../src/uni_modules/lucky-ui/components/lk-sticky/sticky.utils';

describe('lk-sticky style and observer rules', () => {
  it('builds sticky base style and preserves custom style layer', () => {
    expect(resolveStickyBaseStyle({ offsetTop: 96, zIndex: 300 })).toEqual({
      position: 'sticky',
      top: '96rpx',
      zIndex: 300,
    });

    expect(resolveStickyStyle({
      offsetTop: 48,
      zIndex: 120,
      customStyle: { background: '#fff' },
    })).toEqual([
      {
        position: 'sticky',
        top: '48rpx',
        zIndex: 120,
      },
      { background: '#fff' },
    ]);
  });

  it('builds root class with custom class passthrough', () => {
    expect(resolveStickyClass('custom-sticky')).toEqual(['lk-sticky', 'custom-sticky']);
    expect(resolveStickyClass([{ active: true }])).toEqual(['lk-sticky', [{ active: true }]]);
  });

  it('normalizes observer offsets for H5 and mini program paths', () => {
    expect(resolveStickyOffset(24)).toBe(24);
    expect(resolveStickyOffset(Number.NaN)).toBe(0);
    expect(resolveStickyRootMargin(88)).toBe('-88px 0px 0px 0px');
    expect(resolveStickyViewportOffset(88)).toEqual({ top: 88 });
  });

  it('resolves sticky state from intersection ratio', () => {
    expect(resolveStickyStateFromRatio(0)).toBe(true);
    expect(resolveStickyStateFromRatio(0.5)).toBe(false);
    expect(resolveStickyStateFromRatio(undefined)).toBe(false);
  });

  it('only emits change when sticky state changes', () => {
    expect(shouldEmitStickyChange(false, true)).toBe(true);
    expect(shouldEmitStickyChange(true, true)).toBe(false);
    expect(shouldEmitStickyChange(false, false)).toBe(false);
  });
});
