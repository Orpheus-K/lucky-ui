import type { StyleValue } from 'vue';
import type { Action } from './action-sheet.props';

export function resolveActionSheetRootStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function resolveActionSheetCancelText(options: {
  cancelText: string;
  fallback: string;
}): string {
  return options.cancelText || options.fallback;
}

export function shouldRenderActionSheetHead(options: {
  title: string;
  description: string;
}): boolean {
  return Boolean(options.title || options.description);
}

export function resolveActionSheetListClass(options: { title: string; description: string }) {
  return { 'is-no-head': !shouldRenderActionSheetHead(options) };
}

export function canSelectAction(action: Action): boolean {
  return !action.disabled && !action.loading;
}

export function createActionSheetPayload(options: {
  action: Action;
  index: number;
  event?: unknown;
}) {
  return {
    action: options.action,
    index: options.index,
    event: options.event,
  };
}

export function resolveActionSheetItemClass(options: {
  action: Action;
  rippleActive: boolean;
  activeIndex: number | string;
  index: number;
}) {
  return {
    'is-disabled': !!options.action.disabled,
    'is-loading': !!options.action.loading,
    'lk-ripple--active': options.rippleActive && options.activeIndex === options.index,
  };
}

export function resolveActionSheetItemStyle(action: Action): StyleValue {
  return { color: action.color || 'inherit' };
}

export function resolveActionSheetCancelClass(options: {
  rippleActive: boolean;
  activeIndex: number | string;
}) {
  return { 'lk-ripple--active': options.rippleActive && options.activeIndex === 'cancel' };
}

export function shouldCloseAfterAction(closeOnClickAction: boolean): boolean {
  return closeOnClickAction;
}
