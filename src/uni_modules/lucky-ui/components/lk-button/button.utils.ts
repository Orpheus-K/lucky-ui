import type { ButtonNativeType, ButtonShape, ButtonSize, ButtonVariant } from './button.props';

export type ButtonNativeEventName =
  | 'getuserinfo'
  | 'getphonenumber'
  | 'getrealtimephonenumber'
  | 'error'
  | 'opensetting'
  | 'launchapp'
  | 'contact'
  | 'chooseavatar'
  | 'agreeprivacyauthorization'
  | 'addgroupapp'
  | 'chooseaddress'
  | 'chooseinvoicetitle'
  | 'subscribe'
  | 'login'
  | 'im';

export interface ResolveButtonClassOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  shape: ButtonShape;
  loading: boolean;
  disabled: boolean;
  block: boolean;
  fill: boolean;
  rippleActive: boolean;
  customClass: unknown;
}

export function resolveButtonClass(options: ResolveButtonClassOptions) {
  return [
    'lk-ripple',
    'lk-button',
    `lk-button--${options.variant}`,
    `lk-button--${options.size}`,
    `lk-button--shape-${options.shape}`,
    {
      'is-loading': options.loading,
      'is-disabled': options.disabled,
      'is-block': options.block,
      'is-fill': options.fill,
      'lk-ripple--active': options.rippleActive,
    },
    options.customClass,
  ];
}

export function resolveButtonFormType(
  nativeType: ButtonNativeType
): '' | Exclude<ButtonNativeType, 'button'> {
  return nativeType === 'button' ? '' : nativeType;
}

export function isButtonNativeDisabled(options: { disabled: boolean; loading: boolean }): boolean {
  return options.disabled || options.loading;
}

export function isButtonRippleEnabled(options: {
  ripple: boolean;
  variant: ButtonVariant;
}): boolean {
  return options.ripple && options.variant !== 'text';
}

export function shouldEmitButtonEvent(options: { disabled: boolean; loading: boolean }): boolean {
  return !isButtonNativeDisabled(options);
}
