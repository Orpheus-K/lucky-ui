import type { StyleValue } from 'vue';
import { addUnit } from '../../core/src/utils/unit';
import {
  PullRefreshStatus,
  type PullRefreshStatus as PullRefreshStatusType,
} from './pull-refresh.props';

export interface PullRefreshPullingEventLike {
  detail?: {
    dy?: unknown;
  };
}

export function resolvePullRefreshInitialStatus(modelValue: boolean): PullRefreshStatusType {
  return modelValue ? PullRefreshStatus.Refreshing : PullRefreshStatus.Idle;
}

export function resolvePullRefreshClass(options: {
  status: PullRefreshStatusType;
  disabled: boolean;
  indicatorVisible: boolean;
  customClass?: unknown;
}) {
  return [
    'lk-pull-refresh',
    `lk-pull-refresh--${options.status}`,
    {
      'is-disabled': options.disabled,
      'is-active': options.indicatorVisible,
    },
    options.customClass,
  ];
}

export function resolvePullRefreshRootStyle(options: {
  height: string | number;
  background: string;
}) {
  return {
    height: addUnit(options.height),
    background: options.background,
  };
}

export function resolvePullRefreshMergedStyle(
  rootStyle: ReturnType<typeof resolvePullRefreshRootStyle>,
  customStyle: StyleValue
): StyleValue {
  return [rootStyle, customStyle];
}

export function resolvePullRefreshIndicatorText(options: {
  status: PullRefreshStatusType;
  loadingText: string;
  successText: string;
  loosingText: string;
  pullingText: string;
}) {
  if (options.status === PullRefreshStatus.Refreshing) return options.loadingText;
  if (options.status === PullRefreshStatus.Success) return options.successText;
  if (options.status === PullRefreshStatus.Loosing) return options.loosingText;
  return options.pullingText;
}

export function isPullRefreshIndicatorVisible(options: {
  refresherActive: boolean;
  status: PullRefreshStatusType;
  pullingDistance: number;
}): boolean {
  return (
    options.refresherActive &&
    (options.status === PullRefreshStatus.Refreshing ||
      options.status === PullRefreshStatus.Success ||
      options.pullingDistance > 0)
  );
}

export function resolvePullRefreshProgress(options: {
  status: PullRefreshStatusType;
  pullingDistance: number;
  threshold: number;
}): number {
  if (
    options.status === PullRefreshStatus.Refreshing ||
    options.status === PullRefreshStatus.Success
  ) {
    return 1;
  }

  return Math.min(1, options.pullingDistance / Math.max(1, options.threshold));
}

export function resolvePullRefreshIndicatorStyle(options: { visible: boolean; progress: number }) {
  return {
    opacity: options.visible ? 1 : 0,
    transform: `translate3d(0, ${Math.min(18, options.progress * 18)}rpx, 0)`,
  };
}

export function getPullRefreshDistance(event: PullRefreshPullingEventLike): number {
  return Math.max(0, Number(event.detail?.dy ?? 0));
}

export function resolvePullingStatus(options: {
  distance: number;
  threshold: number;
}): PullRefreshStatusType {
  if (options.distance <= 0) return PullRefreshStatus.Idle;
  return options.distance >= options.threshold
    ? PullRefreshStatus.Loosing
    : PullRefreshStatus.Pulling;
}

export function shouldIgnorePulling(options: {
  disabled: boolean;
  status: PullRefreshStatusType;
}): boolean {
  return options.disabled || options.status === PullRefreshStatus.Refreshing;
}

export function shouldShowRefreshSuccess(options: {
  status: PullRefreshStatusType;
  showSuccess: boolean;
}): boolean {
  return options.status === PullRefreshStatus.Refreshing && options.showSuccess;
}

export function normalizePullRefreshSuccessDuration(duration: number): number {
  return Math.max(0, duration);
}

export function getNextPullRefreshScrollTop(scrollTop: number): number {
  return scrollTop === 0 ? 1 : 0;
}
