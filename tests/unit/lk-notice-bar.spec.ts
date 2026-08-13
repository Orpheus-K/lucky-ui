import { describe, expect, it } from 'vitest';
import {
  resolveNoticeBarClickPayload,
  resolveNoticeBarDisplayMessages,
  resolveNoticeBarInterval,
  resolveNoticeBarLogicalIndex,
  resolveNoticeBarMessagePayload,
  resolveNoticeBarScrollMode,
  resolveNoticeBarStyle,
  resolveNoticeBarVerticalList,
  resolveNoticeBarVerticalStyle,
} from '../../src/uni_modules/lucky-ui/components/lk-notice-bar/notice-bar.utils';

describe('lk-notice-bar display rules', () => {
  it('builds flat style for no-background mode and themed style otherwise', () => {
    const customStyle = { marginTop: '8px' };
    expect(
      resolveNoticeBarStyle({
        noBackground: true,
        background: 'red',
        color: 'blue',
        customStyle,
      })
    ).toEqual([{ padding: '0', borderRadius: '0' }, customStyle]);

    expect(
      resolveNoticeBarStyle({
        noBackground: false,
        background: 'var(--bg)',
        color: 'var(--color)',
        customStyle,
      })
    ).toEqual([{ background: 'var(--bg)', color: 'var(--color)' }, customStyle]);
  });

  it('normalizes scrollable prop into render modes', () => {
    expect(resolveNoticeBarScrollMode(false)).toBe('none');
    expect(resolveNoticeBarScrollMode(true)).toBe('horizontal');
    expect(resolveNoticeBarScrollMode('horizontal')).toBe('horizontal');
    expect(resolveNoticeBarScrollMode('vertical')).toBe('vertical');
  });

  it('provides vertical display messages from messages or fallback text', () => {
    expect(
      resolveNoticeBarDisplayMessages({
        scrollMode: 'vertical',
        messages: ['A', 'B'],
        text: 'Fallback',
      })
    ).toEqual(['A', 'B']);
    expect(
      resolveNoticeBarDisplayMessages({
        scrollMode: 'vertical',
        messages: [],
        text: 'Fallback',
      })
    ).toEqual(['Fallback']);
    expect(
      resolveNoticeBarDisplayMessages({
        scrollMode: 'horizontal',
        messages: ['A'],
        text: 'Fallback',
      })
    ).toEqual([]);
  });

  it('appends the first vertical message for seamless looping', () => {
    expect(resolveNoticeBarVerticalList(['A', 'B', 'C'])).toEqual(['A', 'B', 'C', 'A']);
    expect(resolveNoticeBarVerticalList([])).toEqual([]);
  });

  it('computes vertical transform and transition state', () => {
    expect(
      resolveNoticeBarVerticalStyle({
        verticalListLength: 4,
        currentIndex: 2,
        enableTransition: true,
      })
    ).toEqual({
      transform: 'translateY(-50%)',
      transition: 'transform 0.3s ease-in-out',
    });

    expect(
      resolveNoticeBarVerticalStyle({
        verticalListLength: 0,
        currentIndex: 2,
        enableTransition: false,
      })
    ).toEqual({
      transform: 'translateY(-0%)',
      transition: 'none',
    });
  });

  it('clamps vertical loop interval to at least 500ms', () => {
    expect(resolveNoticeBarInterval(10)).toBe(10000);
    expect(resolveNoticeBarInterval(0.1)).toBe(500);
  });

  it('creates click payload from current vertical message or plain text', () => {
    const event = { type: 'tap' };
    expect(
      resolveNoticeBarClickPayload({
        scrollMode: 'vertical',
        displayMessages: ['A', 'B'],
        currentIndex: 1,
        text: 'Plain',
        event,
      })
    ).toEqual({ text: 'B', index: 1, event });

    expect(
      resolveNoticeBarClickPayload({
        scrollMode: 'horizontal',
        displayMessages: ['A', 'B'],
        currentIndex: 1,
        text: 'Plain',
        event,
      })
    ).toEqual({ text: 'Plain', index: 0, event });
  });

  it('normalizes the cloned first frame to the first logical message', () => {
    expect(resolveNoticeBarLogicalIndex(2, 2)).toBe(0);
    expect(resolveNoticeBarLogicalIndex(-1, 2)).toBe(1);
    expect(resolveNoticeBarLogicalIndex(Number.NaN, 2)).toBe(0);
    expect(resolveNoticeBarLogicalIndex(3, 0)).toBe(0);
    expect(resolveNoticeBarMessagePayload(['A', 'B'], 2)).toEqual({ index: 0, text: 'A' });
    expect(
      resolveNoticeBarClickPayload({
        scrollMode: 'vertical',
        displayMessages: ['A', 'B'],
        currentIndex: 2,
        text: 'Plain',
      })
    ).toEqual({ text: 'A', index: 0, event: undefined });
  });
});
