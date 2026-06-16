import { describe, expect, it } from 'vitest';
import { ANIMATION_PRESETS } from '../../src/uni_modules/lucky-ui/composables/useTransition';
import {
  canTriggerModalAction,
  resolveModalFooterClass,
  resolveModalHeaderClass,
  resolveModalPanelStyle,
  resolveModalRootStyle,
  resolveModalText,
  resolveModalTransitionConfig,
  resolveModalTransitionDelay,
  resolveModalTransitionDuration,
  resolveModalTransitionEasing,
  resolveModalTransitionName,
  shouldCloseModalOnOverlay,
  shouldModalHeaderRender,
} from '../../src/uni_modules/lucky-ui/components/lk-modal/modal.utils';

describe('lk-modal transition and action rules', () => {
  it('resolves locale fallback text and transition config', () => {
    expect(resolveModalText({ value: '', fallback: '确定' })).toBe('确定');
    expect(resolveModalText({ value: '提交', fallback: '确定' })).toBe('提交');

    expect(resolveModalTransitionConfig({
      animationType: 'fade-up',
      animation: 'scale',
      duration: 120,
      delay: 30,
      easing: 'linear',
    })).toEqual({
      name: 'fade-up',
      duration: 120,
      delay: 30,
      easing: 'linear',
    });

    const presetConfig = resolveModalTransitionConfig({
      animation: 'scale',
    });
    expect(presetConfig).toEqual({
      name: ANIMATION_PRESETS.scale.animation,
      duration: ANIMATION_PRESETS.scale.duration,
      delay: ANIMATION_PRESETS.scale.delay ?? 0,
      easing: ANIMATION_PRESETS.scale.easing,
    });
  });

  it('normalizes transition primitive values', () => {
    expect(resolveModalTransitionName({ name: 'zoom-in' })).toBe('zoom-in');
    expect(resolveModalTransitionName({ name: undefined })).toBe('fade');
    expect(resolveModalTransitionDuration({ duration: 180 })).toBe(180);
    expect(resolveModalTransitionDuration({ duration: undefined })).toBe(300);
    expect(resolveModalTransitionDelay({ delay: 60 })).toBe(60);
    expect(resolveModalTransitionDelay({ delay: undefined })).toBe(0);
    expect(resolveModalTransitionEasing({ easing: 'ease-out' })).toBe('ease-out');
    expect(resolveModalTransitionEasing({ easing: undefined })).toBe('ease');
  });

  it('builds header/footer classes and styles', () => {
    expect(shouldModalHeaderRender({
      showHeader: true,
      title: '',
      showClose: false,
      hasHeaderSlot: true,
    })).toBe(true);
    expect(shouldModalHeaderRender({
      showHeader: false,
      title: '标题',
      showClose: true,
      hasHeaderSlot: true,
    })).toBe(false);

    expect(resolveModalRootStyle(1500)).toEqual({ zIndex: 1501 });
    expect(resolveModalPanelStyle({
      transitionStyles: { opacity: 1 },
      width: '600rpx',
      customStyle: { transform: 'scale(0.9)' },
    })).toEqual([
      { transform: 'scale(0.9)' },
      { opacity: 1, width: '600rpx' },
    ]);
    expect(resolveModalHeaderClass('center')).toEqual(['is-title-center']);
    expect(resolveModalFooterClass({
      footerType: 'text',
      showCancel: true,
    })).toEqual(['is-footer-text', { 'has-cancel': true }]);
  });

  it('guards actions while leaving and overlay closing by prop', () => {
    expect(canTriggerModalAction(false)).toBe(true);
    expect(canTriggerModalAction(true)).toBe(false);
    expect(shouldCloseModalOnOverlay({
      leaving: false,
      closeOnOverlay: true,
    })).toBe(true);
    expect(shouldCloseModalOnOverlay({
      leaving: true,
      closeOnOverlay: true,
    })).toBe(false);
    expect(shouldCloseModalOnOverlay({
      leaving: false,
      closeOnOverlay: false,
    })).toBe(false);
  });
});
