import { describe, expect, it } from 'vitest';
import {
  resolveSegmentedRootStyle,
  resolveSegmentedSelection,
  resolveSegmentedSliderStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-segmented/segmented.utils';
import type { SegmentedOption } from '../../src/uni_modules/lucky-ui/components/lk-segmented/segmented.props';

const options: SegmentedOption[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly', disabled: true },
];

describe('lk-segmented interaction rules', () => {
  it('selects a different enabled option and exposes the old value', () => {
    expect(resolveSegmentedSelection({
      option: options[1],
      activeValue: 'daily',
    })).toEqual({
      value: 'weekly',
      oldValue: 'daily',
      disabled: false,
      reselected: false,
      changed: true,
    });
  });

  it('reports reselect without changing when the option is already active', () => {
    expect(resolveSegmentedSelection({
      option: options[0],
      activeValue: 'daily',
    })).toMatchObject({
      value: 'daily',
      oldValue: 'daily',
      reselected: true,
      changed: false,
    });
  });

  it('blocks disabled options before selection state can change', () => {
    expect(resolveSegmentedSelection({
      option: options[2],
      activeValue: 'daily',
    })).toMatchObject({
      value: 'monthly',
      oldValue: 'daily',
      disabled: true,
      reselected: false,
      changed: false,
    });
  });

  it('computes slider width and offset relative to the segmented wrapper', () => {
    expect(resolveSegmentedSliderStyle({
      wrap: { left: 100 },
      items: [
        { left: 104, width: 80 },
        { left: 188, width: 96 },
      ],
      options: options.slice(0, 2),
      activeValue: 'weekly',
      animated: true,
      duration: 260,
      easing: 'ease-out',
    })).toEqual({
      width: '96px',
      transform: 'translateX(88px)',
      opacity: '1',
      transition: 'width 260ms ease-out, transform 260ms ease-out, opacity 180ms ease',
    });
  });

  it('keeps slider offset aligned after the segmented wrapper scrolls horizontally', () => {
    expect(resolveSegmentedSliderStyle({
      wrap: { left: 100, scrollLeft: 128 },
      items: [
        { left: 104, width: 80 },
        { left: 188, width: 96 },
      ],
      options: options.slice(0, 2),
      activeValue: 'weekly',
      animated: true,
      duration: 260,
      easing: 'ease-out',
    })).toMatchObject({
      width: '96px',
      transform: 'translateX(216px)',
      opacity: '1',
    });
  });

  it('hides the slider when the active value is absent or rect is missing', () => {
    expect(resolveSegmentedSliderStyle({
      wrap: { left: 100 },
      items: [{ left: 104, width: 80 }],
      options,
      activeValue: 'unknown',
      animated: true,
      duration: 260,
      easing: 'ease-out',
    })).toEqual({ opacity: '0' });

    expect(resolveSegmentedSliderStyle({
      wrap: { left: 100 },
      items: [{ left: 104, width: 80 }],
      options,
      activeValue: 'weekly',
      animated: true,
      duration: 260,
      easing: 'ease-out',
    })).toEqual({ opacity: '0' });
  });

  it('turns slider animation off when animated is false', () => {
    expect(resolveSegmentedSliderStyle({
      wrap: { left: 0 },
      items: [{ left: 0, width: 120 }],
      options: [options[0]],
      activeValue: 'daily',
      animated: false,
      duration: 260,
      easing: 'ease-out',
    }).transition).toBe('none');
  });

  it('uses the latest animation options when rebuilding slider style', () => {
    expect(resolveSegmentedSliderStyle({
      wrap: { left: 0 },
      items: [{ left: 0, width: 120 }],
      options: [options[0]],
      activeValue: 'daily',
      animated: true,
      duration: 480,
      easing: 'linear',
    }).transition).toBe('width 480ms linear, transform 480ms linear, opacity 180ms ease');
  });

  it('builds root CSS variables while preserving custom style', () => {
    const customStyle = { marginTop: '12px' };
    const style = resolveSegmentedRootStyle({
      radius: '',
      duration: 300,
      easing: 'linear',
      inset: '4rpx',
      gutter: '8rpx',
      height: '72rpx',
      customStyle,
    }) as Array<Record<string, string>>;

    expect(style[0]).toMatchObject({
      '--lk-seg-radius': 'var(--lk-radius-full)',
      '--lk-seg-duration': '300ms',
      '--lk-seg-easing': 'linear',
      '--lk-seg-inset': '4rpx',
      '--lk-seg-gutter': '8rpx',
      '--lk-seg-height': '72rpx',
    });
    expect(style[1]).toBe(customStyle);
  });
});
