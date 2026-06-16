import { describe, expect, it } from 'vitest';
import {
  expandShortHex,
  resolveTagClass,
  resolveTagEventName,
  resolveTagSemanticColor,
  resolveTagStyle,
  toSoftColor,
} from '../../src/uni_modules/lucky-ui/components/lk-tag/tag.utils';

describe('lk-tag style and event rules', () => {
  it('expands short hex and converts hex colors to soft rgba backgrounds', () => {
    expect(expandShortHex('0af')).toBe('00aaff');
    expect(toSoftColor('#0af')).toBe('rgba(0, 170, 255, 0.12)');
    expect(toSoftColor('#336699')).toBe('rgba(51, 102, 153, 0.12)');
  });

  it('converts rgb and rgba colors to soft backgrounds', () => {
    expect(toSoftColor('rgb(10, 20, 30)')).toBe('rgba(10, 20, 30, 0.12)');
    expect(toSoftColor('rgba(10, 20, 30, 0.5)')).toBe('rgba(10, 20, 30, 0.12)');
    expect(toSoftColor('currentColor')).toBe('currentColor');
  });

  it('resolves semantic color tokens and custom colors', () => {
    expect(resolveTagSemanticColor('success')).toEqual({
      text: 'var(--lk-color-success)',
      bg: 'var(--lk-color-success-soft)',
    });
    expect(resolveTagSemanticColor('#123456')).toEqual({
      text: '#123456',
      bg: 'rgba(18, 52, 86, 0.12)',
    });
  });

  it('builds custom color style with textColor taking precedence', () => {
    expect(resolveTagStyle({
      type: 'light',
      color: 'warning',
      textColor: '#111',
      bgColor: '',
    })).toMatchObject({
      color: '#111',
      background: 'var(--lk-color-warning-soft)',
      boxShadow: 'none',
    });
  });

  it('uses bgColor as outline border for outline tags', () => {
    expect(resolveTagStyle({
      type: 'outline',
      color: '',
      textColor: '',
      bgColor: '#409eff',
    })).toEqual({
      boxShadow: 'inset 0 0 0 var(--lk-rpx-2) #409eff',
      background: 'transparent',
    });
  });

  it('builds class entries from visual and state props', () => {
    const classes = resolveTagClass({
      type: 'solid',
      size: 'lg',
      disabled: true,
      round: false,
      closable: true,
      customClass: 'custom-tag',
    });

    expect(classes).toContain('lk-tag--solid');
    expect(classes).toContain('lk-tag--lg');
    expect(classes).toContain('custom-tag');
    expect(classes[2]).toMatchObject({
      'is-disabled': true,
      'is-round': false,
      'is-closable': true,
    });
  });

  it('routes disabled click and close events to disabled event names', () => {
    expect(resolveTagEventName('click', false)).toBe('click');
    expect(resolveTagEventName('close', false)).toBe('close');
    expect(resolveTagEventName('click', true)).toBe('click-disabled');
    expect(resolveTagEventName('close', true)).toBe('close-disabled');
  });
});
