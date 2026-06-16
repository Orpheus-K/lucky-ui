import { describe, expect, it } from 'vitest';
import {
  createPreloadDebuggerLog,
  resolvePreloadDebuggerBadgeClass,
  resolvePreloadDebuggerClass,
  resolvePreloadDebuggerStatusLabel,
  resolvePreloadDebuggerStyle,
  trimPreloadDebuggerLogs,
} from '../../src/uni_modules/lucky-ui/components/lk-preload-debugger/preload-debugger.utils';

describe('lk-preload-debugger display and log rules', () => {
  it('builds root class and forwards custom style', () => {
    expect(resolvePreloadDebuggerClass({
      position: 'bottom-right',
      customClass: 'debug-panel',
    })).toEqual([
      'lk-preload-debugger',
      'lk-preload-debugger--bottom-right',
      'debug-panel',
    ]);

    const customStyle = { zIndex: 10000 };
    expect(resolvePreloadDebuggerStyle(customStyle)).toBe(customStyle);
  });

  it('resolves badge class and status label by queue priority', () => {
    const t = (key: string) => `i18n:${key}`;

    expect(resolvePreloadDebuggerBadgeClass({ running: 1, pending: 2 })).toBe(
      'lk-preload-debugger__badge--running'
    );
    expect(resolvePreloadDebuggerBadgeClass({ running: 0, pending: 2 })).toBe(
      'lk-preload-debugger__badge--pending'
    );
    expect(resolvePreloadDebuggerBadgeClass({ running: 0, pending: 0 })).toBe(
      'lk-preload-debugger__badge--idle'
    );
    expect(resolvePreloadDebuggerStatusLabel({
      stats: { running: 1, pending: 2 },
      t,
    })).toBe('i18n:running');
    expect(resolvePreloadDebuggerStatusLabel({
      stats: { running: 0, pending: 2 },
      t,
    })).toBe('i18n:pending');
    expect(resolvePreloadDebuggerStatusLabel({
      stats: { running: 0, pending: 0 },
      t,
    })).toBe('i18n:idle');
  });

  it('creates and trims log items', () => {
    expect(createPreloadDebuggerLog({
      id: 'log_1',
      type: 'info',
      time: '10:00:00',
      message: 'started',
    })).toEqual({
      id: 'log_1',
      type: 'info',
      time: '10:00:00',
      message: 'started',
    });

    const logs = Array.from({ length: 55 }, (_, index) => createPreloadDebuggerLog({
      id: `log_${index}`,
      type: 'info',
      time: '10:00:00',
      message: String(index),
    }));

    expect(trimPreloadDebuggerLogs(logs)).toHaveLength(50);
    expect(trimPreloadDebuggerLogs(logs)[0].id).toBe('log_5');
  });
});
