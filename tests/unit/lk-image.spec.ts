import { describe, expect, it } from 'vitest';
import {
  createImageInitialState,
  resolveImageClickPayload,
  resolveImagePreviewPayload,
  resolveImageRootStyle,
  resolveImageStateOnError,
  resolveImageStateOnLoad,
  resolveImageStateOnSrcChange,
  shouldPreviewImage,
} from '../../src/uni_modules/lucky-ui/components/lk-image/image.utils';

describe('lk-image state and preview rules', () => {
  it('starts and resets to loading state without error', () => {
    expect(createImageInitialState()).toEqual({ loading: true, error: false });
    expect(resolveImageStateOnSrcChange()).toEqual({ loading: true, error: false });
  });

  it('resolves load and error states', () => {
    expect(resolveImageStateOnLoad()).toEqual({ loading: false, error: false });
    expect(resolveImageStateOnError()).toEqual({ loading: false, error: true });
  });

  it('builds root style from sizing props and custom style', () => {
    const customStyle = { display: 'block' };
    expect(resolveImageRootStyle({
      width: '100%',
      height: '160rpx',
      radius: '8rpx',
      customStyle,
    })).toEqual([
      { width: '100%', height: '160rpx', borderRadius: '8rpx' },
      customStyle,
    ]);
  });

  it('previews only when enabled and src is present', () => {
    expect(shouldPreviewImage({ preview: true, src: 'https://example.com/a.png' })).toBe(true);
    expect(shouldPreviewImage({ preview: false, src: 'https://example.com/a.png' })).toBe(false);
    expect(shouldPreviewImage({ preview: true, src: '' })).toBe(false);
  });

  it('creates click and preview payloads with the source and event', () => {
    const event = { type: 'tap' };
    expect(resolveImageClickPayload({ src: '/a.png', event })).toEqual({
      src: '/a.png',
      event,
    });
    expect(resolveImagePreviewPayload({ src: '/a.png', event })).toEqual({
      src: '/a.png',
      urls: ['/a.png'],
      event,
    });
  });
});
