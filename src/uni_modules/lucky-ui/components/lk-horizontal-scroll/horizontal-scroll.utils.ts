import type { StyleValue } from 'vue';
import { addUnit } from '../../core/src/utils/unit';

export function resolveHorizontalScrollClass(customClass: unknown) {
  return ['lk-horizontal-scroll', customClass];
}

export function shouldShowHorizontalScrollbar(hideScrollbar: boolean): boolean {
  return !hideScrollbar;
}

export function resolveHorizontalScrollRootStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function resolveHorizontalScrollContainerStyle(options: {
  gap: string | number;
  padding: string | number;
}) {
  const padding = addUnit(options.padding);
  return {
    '--lk-hs-gap': addUnit(options.gap),
    paddingLeft: padding,
    paddingRight: padding,
  };
}
