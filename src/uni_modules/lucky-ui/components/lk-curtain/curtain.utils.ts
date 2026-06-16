import type { StyleValue } from 'vue';
import type { TransitionConfig } from '@/uni_modules/lucky-ui/composables/useTransition';
import { addUnit } from '../../core/src/utils/unit';
import type { CurtainClosePosition } from './curtain.props';

export function resolveCurtainWidth(width: string | number): string {
  return addUnit(width) || '';
}

export function resolveCurtainHeight(height: string | number): string {
  return addUnit(height) || '';
}

export function resolveCurtainCopySuccessText(options: {
  copySuccessText: string;
  fallback: string;
}): string {
  return options.copySuccessText || options.fallback;
}

export function resolveCurtainRootStyle(options: {
  customStyle: StyleValue;
  zIndex: number;
  show: boolean;
}): StyleValue {
  return [
    options.customStyle || '',
    {
      zIndex: options.zIndex,
      pointerEvents: options.show ? 'auto' : 'none',
    },
  ];
}

export function resolveCurtainContentStyle(options: {
  zIndex: number;
  width: string;
  height: string;
}): StyleValue {
  return {
    zIndex: options.zIndex,
    width: options.width,
    height: options.height,
  };
}

export function ensureCurtainNegativeOffset(value: string): string {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `calc(${value} * -1)`;

  const unit = value.replace(num.toString(), '');
  const offset = Math.abs(num);
  return `-${offset}${unit || 'rpx'}`;
}

function formatOffset(value: string | number | undefined, defaultVal: string): string {
  if (value === undefined || value === null || value === '') {
    return defaultVal;
  }
  const str = String(value);
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return `${str}rpx`;
  }
  return str;
}

export function resolveCurtainCloseOffset(options: {
  closePosition: CurtainClosePosition;
  closeOffset: string | number;
  closeOffsetBottom: string | number;
}): string {
  if (options.closePosition === 'bottom') {
    const offset = formatOffset(options.closeOffsetBottom, 'var(--lk-rpx-80)');
    return ensureCurtainNegativeOffset(offset);
  }
  return formatOffset(options.closeOffset, 'var(--lk-rpx-24)');
}

function isNegativeOffset(value: string): boolean {
  return value.trim().startsWith('-') || value.includes('* -1');
}

export function resolveCurtainCloseStyle(options: {
  closePosition: CurtainClosePosition;
  closeOffset: string | number;
  closeOffsetBottom: string | number;
}) {
  const offset = resolveCurtainCloseOffset(options);

  if (options.closePosition === 'bottom') {
    return { bottom: offset };
  }

  const isNeg = isNegativeOffset(offset);
  const styles: Record<string, string> = {};
  if (options.closePosition.includes('top')) {
    styles.top = isNeg ? `calc(${offset} - var(--lk-rpx-72))` : offset;
  }
  if (options.closePosition.includes('bottom')) {
    styles.bottom = isNeg ? `calc(${offset} - var(--lk-rpx-72))` : offset;
  }
  if (options.closePosition.includes('left')) styles.left = isNeg ? '0' : offset;
  if (options.closePosition.includes('right')) styles.right = isNeg ? '0' : offset;

  return styles;
}

export function resolveCurtainTransitionConfig(): TransitionConfig {
  return {
    name: 'zoom-in',
    duration: 220,
    easing: 'ease-out',
  };
}

export function shouldCloseCurtainOnOverlay(closeOnOverlay: boolean): boolean {
  return closeOnOverlay;
}

export function shouldNavigateCurtainLink(link: string): boolean {
  return link.length > 0;
}

export function isCurtainHttpLink(link: string): boolean {
  return /^https?:\/\//.test(link);
}
