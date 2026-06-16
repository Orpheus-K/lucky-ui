import type { StyleValue } from 'vue';
import type { DebuggerPosition } from './preload-debugger.props';

export type PreloadDebuggerLogType = 'start' | 'complete' | 'error' | 'info';

export interface PreloadDebuggerStats {
  pending: number;
  running: number;
}

export interface PreloadDebuggerLogItem {
  id: string;
  type: PreloadDebuggerLogType;
  time: string;
  message: string;
}

export function resolvePreloadDebuggerClass(options: {
  position: DebuggerPosition;
  customClass?: unknown;
}) {
  return ['lk-preload-debugger', `lk-preload-debugger--${options.position}`, options.customClass];
}

export function resolvePreloadDebuggerStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function resolvePreloadDebuggerBadgeClass(stats: PreloadDebuggerStats): string {
  if (stats.running > 0) return 'lk-preload-debugger__badge--running';
  if (stats.pending > 0) return 'lk-preload-debugger__badge--pending';
  return 'lk-preload-debugger__badge--idle';
}

export function resolvePreloadDebuggerStatusLabel(options: {
  stats: PreloadDebuggerStats;
  t: (key: string) => string;
}): string {
  if (options.stats.running > 0) return options.t('running');
  if (options.stats.pending > 0) return options.t('pending');
  return options.t('idle');
}

export function trimPreloadDebuggerLogs(
  logs: PreloadDebuggerLogItem[],
  maxLength = 50
): PreloadDebuggerLogItem[] {
  return logs.length > maxLength ? logs.slice(logs.length - maxLength) : logs;
}

export function createPreloadDebuggerLog(options: {
  id: string;
  type: PreloadDebuggerLogType;
  time: string;
  message: string;
}): PreloadDebuggerLogItem {
  return {
    id: options.id,
    type: options.type,
    time: options.time,
    message: options.message,
  };
}
