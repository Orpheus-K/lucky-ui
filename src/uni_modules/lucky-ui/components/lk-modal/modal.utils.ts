import type { StyleValue } from 'vue';
import {
  ANIMATION_PRESETS,
  type TransitionConfig,
  type TransitionName,
} from '@/uni_modules/lucky-ui/composables/useTransition';

export function resolveModalText(options: { value: string; fallback: string }): string {
  return options.value || options.fallback;
}

export function resolveModalTransitionConfig(options: {
  animationType?: TransitionConfig['name'];
  animation: keyof typeof ANIMATION_PRESETS;
  duration?: number;
  delay?: number;
  easing?: TransitionConfig['easing'];
}): TransitionConfig {
  if (options.animationType) {
    return {
      name: options.animationType,
      duration: options.duration,
      delay: options.delay,
      easing: options.easing,
    };
  }

  const preset = ANIMATION_PRESETS[options.animation] || ANIMATION_PRESETS.scale;
  return {
    name: preset.animation,
    duration: options.duration ?? preset.duration,
    delay: options.delay ?? preset.delay ?? 0,
    easing: options.easing ?? preset.easing,
  };
}

export function resolveModalTransitionName(config: TransitionConfig): TransitionName {
  return typeof config.name === 'string' ? (config.name as TransitionName) : 'fade';
}

export function resolveModalTransitionDuration(config: TransitionConfig): number {
  return typeof config.duration === 'number' ? config.duration : 300;
}

export function resolveModalTransitionDelay(config: TransitionConfig): number {
  return typeof config.delay === 'number' ? config.delay : 0;
}

export function resolveModalTransitionEasing(config: TransitionConfig): string {
  return typeof config.easing === 'string' ? config.easing : 'ease';
}

export function shouldModalHeaderRender(options: {
  showHeader: boolean;
  title: string;
  showClose: boolean;
  hasHeaderSlot: boolean;
}): boolean {
  return options.showHeader && Boolean(options.title || options.showClose || options.hasHeaderSlot);
}

export function resolveModalRootStyle(zIndex: number): StyleValue {
  return { zIndex: zIndex + 1 };
}

export function resolveModalPanelStyle(options: {
  transitionStyles: StyleValue;
  width: string;
  customStyle?: StyleValue;
}): StyleValue {
  return [
    options.customStyle || '',
    {
      ...(options.transitionStyles as Record<string, unknown>),
      width: options.width,
    },
  ] as StyleValue;
}

export function resolveModalHeaderClass(titleAlign: string) {
  return [`is-title-${titleAlign}`];
}

export function resolveModalFooterClass(options: { footerType: string; showCancel: boolean }) {
  return [`is-footer-${options.footerType}`, { 'has-cancel': options.showCancel }];
}

export function canTriggerModalAction(leaving: boolean): boolean {
  return !leaving;
}

export function shouldCloseModalOnOverlay(options: {
  leaving: boolean;
  closeOnOverlay: boolean;
}): boolean {
  return !options.leaving && options.closeOnOverlay;
}
