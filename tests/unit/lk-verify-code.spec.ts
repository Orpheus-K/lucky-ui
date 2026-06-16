import { describe, expect, it } from 'vitest';
import {
  VerifyCodeStatus,
  VerifyCodeType,
} from '../../src/uni_modules/lucky-ui/components/lk-verify-code/verify-code.props';
import {
  getVerifyCodeInputRawValue,
  normalizeVerifyCodeValue,
  resolveVerifyCodeActiveIndex,
  resolveVerifyCodeCellClass,
  resolveVerifyCodeCellStyle,
  resolveVerifyCodeContainerStyle,
  resolveVerifyCodeCountdownText,
  resolveVerifyCodeFocusIndex,
  resolveVerifyCodeInputValue,
  resolveVerifyCodeKeydownValue,
  resolveVerifyCodeRootClass,
  resolveVerifyCodeStatusClass,
  shouldFinishVerifyCode,
} from '../../src/uni_modules/lucky-ui/components/lk-verify-code/verify-code.utils';

describe('lk-verify-code input and countdown rules', () => {
  it('normalizes numeric and text values by configured length', () => {
    expect(normalizeVerifyCodeValue({
      value: 'a1 b2-3',
      type: VerifyCodeType.Number,
      length: 4,
    })).toBe('123');

    expect(normalizeVerifyCodeValue({
      value: 'ab12cd',
      type: VerifyCodeType.Text,
      length: 4,
    })).toBe('ab12');

    expect(normalizeVerifyCodeValue({
      value: null,
      type: VerifyCodeType.Number,
      length: 6,
    })).toBe('');
  });

  it('reads input event value from uni and browser event shapes', () => {
    expect(getVerifyCodeInputRawValue({ detail: { value: '123' } })).toBe('123');
    expect(getVerifyCodeInputRawValue({ target: { value: '456' } })).toBe('456');

    expect(resolveVerifyCodeInputValue({
      event: { detail: { value: '1a2b3c' } },
      type: VerifyCodeType.Number,
      length: 6,
    })).toBe('123');
  });

  it('resolves backspace and finish state', () => {
    expect(resolveVerifyCodeKeydownValue({
      event: { key: 'Backspace' },
      currentValue: '123',
    })).toBe('12');

    expect(resolveVerifyCodeKeydownValue({
      event: { key: 'Enter' },
      currentValue: '123',
    })).toBeNull();

    expect(shouldFinishVerifyCode('123456', 6)).toBe(true);
    expect(shouldFinishVerifyCode('12345', 6)).toBe(false);
  });

  it('computes active and focus indexes within bounds', () => {
    expect(resolveVerifyCodeActiveIndex('', 6)).toBe(0);
    expect(resolveVerifyCodeActiveIndex('123456', 6)).toBe(5);
    expect(resolveVerifyCodeFocusIndex('1234567', 6)).toBe(6);
  });

  it('builds countdown text from send, resend and countdown states', () => {
    expect(resolveVerifyCodeCountdownText({
      isCountingDown: true,
      countdownRemaining: 58,
      value: '',
      countdownText: '{s}s后重发',
      sendText: '发送',
      resendText: '重发',
    })).toBe('58s后重发');

    expect(resolveVerifyCodeCountdownText({
      isCountingDown: false,
      countdownRemaining: 0,
      value: '',
      countdownText: '{s}s后重发',
      sendText: '发送',
      resendText: '重发',
    })).toBe('发送');

    expect(resolveVerifyCodeCountdownText({
      isCountingDown: false,
      countdownRemaining: 0,
      value: '1',
      countdownText: '{s}s后重发',
      sendText: '发送',
      resendText: '重发',
    })).toBe('重发');
  });

  it('builds status, root and cell classes', () => {
    expect(resolveVerifyCodeStatusClass({
      status: VerifyCodeStatus.Error,
      isFocused: true,
    })).toBe('is-error');
    expect(resolveVerifyCodeStatusClass({
      status: VerifyCodeStatus.Default,
      isFocused: true,
    })).toBe('is-focus');

    expect(resolveVerifyCodeRootClass({
      variant: 'rounded',
      statusClass: 'is-success',
      disabled: true,
      customClass: 'custom-code',
    })).toEqual([
      'lk-verify-code--rounded',
      'is-success',
      { 'is-disabled': true },
      'custom-code',
    ]);

    expect(resolveVerifyCodeCellClass({
      index: 2,
      isFocused: true,
      activeIndex: 2,
      valueLength: 2,
      length: 6,
    })).toEqual({
      'is-active': true,
      'is-filled': false,
      'is-next': true,
    });
  });

  it('builds stable cell and container styles', () => {
    expect(resolveVerifyCodeCellStyle({ cellSize: 96, fontSize: 40 })).toEqual({
      width: '96rpx',
      height: '96rpx',
      fontSize: '40rpx',
    });
    expect(resolveVerifyCodeContainerStyle(12)).toEqual({
      '--lk-verify-code-gap': '12rpx',
    });
  });
});
