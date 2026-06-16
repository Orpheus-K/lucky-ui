import { describe, expect, it, vi } from 'vitest';
import { EmptyName } from '../../src/uni_modules/lucky-ui/components/lk-empty/empty.props';
import { getEmptyIllustrationSrc } from '../../src/uni_modules/lucky-ui/components/lk-empty/empty-illustrations';
import {
  isReadableBrandColor,
  resolveEmptyColor,
  resolveEmptyDescription,
  resolveEmptyImage,
  resolveEmptyImageStyle,
  resolveEmptyRootClass,
  resolveEmptyRootStyle,
  resolveEmptyTitle,
} from '../../src/uni_modules/lucky-ui/components/lk-empty/empty.utils';

describe('lk-empty preset and display rules', () => {
  const preset = {
    title: 'No Data',
    description: 'No content',
  };

  it('resolves title and description with prop priority', () => {
    expect(resolveEmptyTitle({ title: 'Custom', preset })).toBe('Custom');
    expect(resolveEmptyTitle({ title: '', preset })).toBe('No Data');
    expect(resolveEmptyDescription({ description: 'Custom desc', preset })).toBe('Custom desc');
    expect(resolveEmptyDescription({ description: '', preset })).toBe('No content');
  });

  it('resolves color and image priority', () => {
    expect(resolveEmptyColor({
      color: '#111111',
      runtimeBrandColor: '#222222',
    })).toBe('#111111');
    expect(resolveEmptyColor({
      color: '',
      runtimeBrandColor: '#222222',
    })).toBe('#222222');

    const getIllustrationSrc = vi.fn(() => 'generated-src');
    expect(resolveEmptyImage({
      image: 'image-src',
      src: 'alias-src',
      name: EmptyName.Empty,
      color: '#111111',
      getIllustrationSrc,
    })).toBe('image-src');
    expect(resolveEmptyImage({
      image: '',
      src: 'alias-src',
      name: EmptyName.Empty,
      color: '#111111',
      getIllustrationSrc,
    })).toBe('alias-src');
    expect(resolveEmptyImage({
      image: '',
      src: '',
      name: EmptyName.Search,
      color: '#111111',
      getIllustrationSrc,
    })).toBe('generated-src');
    expect(getIllustrationSrc).toHaveBeenCalledWith(EmptyName.Search, '#111111');
  });

  it('builds root class and styles', () => {
    expect(resolveEmptyRootClass({
      layout: 'compact',
      showImage: false,
      customClass: 'custom-empty',
    })).toEqual([
      'lk-empty',
      'lk-empty--compact',
      { 'lk-empty--no-image': true },
      'custom-empty',
    ]);

    const customStyle = { marginTop: '16rpx' };
    expect(resolveEmptyRootStyle(customStyle)).toBe(customStyle);
    expect(resolveEmptyImageStyle(240)).toEqual({
      width: '240rpx',
      height: '240rpx',
    });
  });

  it('validates readable brand color formats', () => {
    expect(isReadableBrandColor('#1677ff')).toBe(true);
    expect(isReadableBrandColor('rgb(1, 2, 3)')).toBe(true);
    expect(isReadableBrandColor('rgba(1, 2, 3, .5)')).toBe(true);
    expect(isReadableBrandColor('red')).toBe(false);
  });

  it('renders generated illustration templates with the provided brand color', () => {
    const src = getEmptyIllustrationSrc(EmptyName.Empty, '#13c2c2');
    expect(src).toContain('data:image/svg+xml;charset=utf-8,');
    expect(decodeURIComponent(src)).toContain('#13c2c2');
  });
});
