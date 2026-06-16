import { describe, expect, it } from 'vitest';
import {
  isButtonNativeDisabled,
  isButtonRippleEnabled,
  resolveButtonClass,
  resolveButtonFormType,
  shouldEmitButtonEvent,
} from '../../src/uni_modules/lucky-ui/components/lk-button/button.utils';

describe('lk-button state rules', () => {
  it('builds stable class entries from visual and state props', () => {
    const classes = resolveButtonClass({
      variant: 'solid',
      size: 'lg',
      shape: 'round',
      loading: true,
      disabled: false,
      block: true,
      rippleActive: true,
      customClass: 'custom-button',
    });

    expect(classes).toContain('lk-ripple');
    expect(classes).toContain('lk-button');
    expect(classes).toContain('lk-button--solid');
    expect(classes).toContain('lk-button--lg');
    expect(classes).toContain('lk-button--shape-round');
    expect(classes).toContain('custom-button');
    expect(classes[5]).toMatchObject({
      'is-loading': true,
      'is-disabled': false,
      'is-block': true,
      'lk-ripple--active': true,
    });
  });

  it('omits native form-type for plain button and preserves submit/reset', () => {
    expect(resolveButtonFormType('button')).toBe('');
    expect(resolveButtonFormType('submit')).toBe('submit');
    expect(resolveButtonFormType('reset')).toBe('reset');
  });

  it('maps disabled and loading to native disabled state', () => {
    expect(isButtonNativeDisabled({ disabled: false, loading: false })).toBe(false);
    expect(isButtonNativeDisabled({ disabled: true, loading: false })).toBe(true);
    expect(isButtonNativeDisabled({ disabled: false, loading: true })).toBe(true);
  });

  it('enables ripple only when requested and the variant is not text', () => {
    expect(isButtonRippleEnabled({ ripple: true, variant: 'solid' })).toBe(true);
    expect(isButtonRippleEnabled({ ripple: true, variant: 'outline' })).toBe(true);
    expect(isButtonRippleEnabled({ ripple: true, variant: 'text' })).toBe(false);
    expect(isButtonRippleEnabled({ ripple: false, variant: 'solid' })).toBe(false);
  });

  it('blocks click and native events while disabled or loading', () => {
    expect(shouldEmitButtonEvent({ disabled: false, loading: false })).toBe(true);
    expect(shouldEmitButtonEvent({ disabled: true, loading: false })).toBe(false);
    expect(shouldEmitButtonEvent({ disabled: false, loading: true })).toBe(false);
  });
});
