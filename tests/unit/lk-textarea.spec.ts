import { describe, expect, it } from 'vitest';
import {
  applyTextareaMaxlength,
  isTextareaNativeFocused,
  readTextareaValue,
  resolveTextareaClass,
  resolveTextareaCount,
  resolveTextareaPlaceholder,
  shouldShowTextareaClear,
  shouldShowTextareaFooter,
} from '../../src/uni_modules/lucky-ui/components/lk-textarea/textarea.utils';

describe('lk-textarea value and display rules', () => {
  it('reads values from textarea event payloads', () => {
    expect(readTextareaValue({ detail: { value: 'detail text' } })).toBe('detail text');
    expect(readTextareaValue({ target: { value: 'target text' } })).toBe('target text');
    expect(readTextareaValue({})).toBe('');
  });

  it('clips values only when maxlength is enabled', () => {
    expect(applyTextareaMaxlength('abcdef', 4)).toBe('abcd');
    expect(applyTextareaMaxlength('abc', 4)).toBe('abc');
    expect(applyTextareaMaxlength('abcdef', -1)).toBe('abcdef');
  });

  it('resolves count and placeholder fallback', () => {
    expect(resolveTextareaCount('hello')).toBe(5);
    expect(resolveTextareaCount('')).toBe(0);
    expect(resolveTextareaPlaceholder('自定义', '默认')).toBe('自定义');
    expect(resolveTextareaPlaceholder('', '默认')).toBe('默认');
  });

  it('resolves focus from controlled focus and autofocus props', () => {
    expect(isTextareaNativeFocused({ focus: false, autofocus: false })).toBe(false);
    expect(isTextareaNativeFocused({ focus: true, autofocus: false })).toBe(true);
    expect(isTextareaNativeFocused({ focus: false, autofocus: true })).toBe(true);
  });

  it('guards clear button visibility by value and interaction state', () => {
    expect(shouldShowTextareaClear({
      clearable: true,
      value: 'text',
      disabled: false,
      readonly: false,
    })).toBe(true);
    expect(shouldShowTextareaClear({
      clearable: true,
      value: '',
      disabled: false,
      readonly: false,
    })).toBe(false);
    expect(shouldShowTextareaClear({
      clearable: true,
      value: 'text',
      disabled: true,
      readonly: false,
    })).toBe(false);
  });

  it('shows footer for bounded counts or footer slot', () => {
    expect(shouldShowTextareaFooter({
      showCount: true,
      maxlength: 100,
      hasFooterSlot: false,
    })).toBe(true);
    expect(shouldShowTextareaFooter({
      showCount: true,
      maxlength: -1,
      hasFooterSlot: false,
    })).toBe(false);
    expect(shouldShowTextareaFooter({
      showCount: false,
      maxlength: -1,
      hasFooterSlot: true,
    })).toBe(true);
  });

  it('builds root classes from variant and state', () => {
    expect(resolveTextareaClass({
      variant: 'filled',
      disabled: true,
      focused: true,
      autoHeight: true,
      label: '备注',
      customClass: 'custom',
    })).toEqual([
      'lk-textarea',
      'lk-textarea--filled',
      {
        'is-disabled': true,
        'is-focused': true,
        'is-auto-height': true,
        'has-label': true,
      },
      'custom',
    ]);
  });
});
