import type { CSSProperties, StyleValue } from 'vue';

export const cardShadowMap: Record<string, string> = {
  none: 'none',
  never: 'none',
  sm: 'var(--lk-shadow-sm)',
  md: 'var(--lk-shadow-base)',
  base: 'var(--lk-shadow-base)',
  lg: 'var(--lk-shadow-lg)',
};

export function resolveCardClass(options: {
  customClass?: unknown;
  border: boolean;
  ripple: boolean;
  rippleActive: boolean;
}) {
  return [
    'lk-card',
    options.customClass,
    {
      'is-border': options.border,
      'lk-ripple': options.ripple,
      'lk-ripple--active': options.ripple && options.rippleActive,
    },
  ];
}

export function resolveCardStyle(options: {
  transparent: boolean;
  bgColor: string;
  overflow: string;
  shadow: string;
}): CSSProperties {
  const style: CSSProperties = {};

  if (options.transparent) {
    style['--_bg'] = 'transparent';
  } else if (options.bgColor) {
    style['--_bg'] = options.bgColor;
  }

  style['--_overflow'] = options.overflow;

  const shadow = cardShadowMap[options.shadow];
  if (shadow) {
    style['--_shadow'] = shadow;
  }

  return style;
}

export function resolveCardRootStyle(
  cardStyle: CSSProperties,
  customStyle: StyleValue
): StyleValue {
  return [cardStyle, customStyle];
}

export function resolveCardHeaderStyle(padding: string) {
  return { padding: `${padding} ${padding} 0` };
}

export function resolveCardBodyStyle(padding: string) {
  return { padding };
}

export function resolveCardFooterStyle(padding: string) {
  return { padding: `0 ${padding} ${padding}` };
}
