import type { StyleValue } from 'vue';
import { addUnit } from '@/uni_modules/lucky-ui/core/src/utils/unit';
import type { CollapseName } from './collapse.props';

export function syncCollapseActive(options: {
  modelValue: CollapseName[] | CollapseName;
  accordion: boolean;
}): CollapseName[] {
  if (options.accordion) {
    const value = Array.isArray(options.modelValue) ? options.modelValue[0] : options.modelValue;
    return value === '' || value === undefined ? [] : [value];
  }

  return Array.isArray(options.modelValue) ? [...options.modelValue] : [];
}

export function getCollapseEmitValue(
  value: CollapseName[],
  accordion: boolean
): CollapseName[] | CollapseName | undefined {
  return accordion ? value[0] : value;
}

export function resolveCollapseToggle(options: {
  active: CollapseName[];
  name: CollapseName;
  accordion: boolean;
}) {
  const wasOpen = options.active.includes(options.name);
  let next: CollapseName[];
  let modelValue: CollapseName[] | CollapseName;

  if (options.accordion) {
    next = wasOpen ? [] : [options.name];
    modelValue = next[0] ?? '';
  } else {
    const set = new Set(options.active);
    if (set.has(options.name)) {
      set.delete(options.name);
    } else {
      set.add(options.name);
    }
    next = Array.from(set);
    modelValue = next;
  }

  return {
    wasOpen,
    next,
    modelValue,
    emitValue: getCollapseEmitValue(next, options.accordion),
  };
}

export function resolveCollapseRootClass(options: {
  variant: string;
  customClass?: unknown;
  bordered: boolean;
}) {
  return [
    'lk-collapse',
    `lk-collapse--${options.variant}`,
    options.customClass,
    {
      'is-bordered': options.bordered,
    },
  ];
}

export function resolveCollapseRootStyle(options: {
  customStyle: StyleValue;
  gap: string | number;
}): StyleValue {
  return [
    options.customStyle,
    {
      '--lk-collapse-gap': addUnit(options.gap),
    },
  ];
}

export function resolveCollapseItemClass(options: {
  open: boolean;
  disabled: boolean;
  customClass?: unknown;
}) {
  return [
    {
      'is-open': options.open,
      'is-disabled': options.disabled,
    },
    options.customClass,
  ];
}

export function resolveCollapseHeaderClass(rippleActive: boolean) {
  return { 'lk-ripple--active': rippleActive };
}

export function resolveCollapseBodyStyle(options: {
  animationDuration?: string;
  animationTiming?: string;
}): Record<string, string> {
  const style: Record<string, string> = {};
  if (options.animationDuration) {
    style['--lk-collapse-anim-duration'] = options.animationDuration;
  }
  if (options.animationTiming) {
    style['--lk-collapse-anim-timing'] = options.animationTiming;
  }
  return style;
}

export function resolveCollapseArrowIcon(options: {
  open: boolean;
  itemArrowIcon?: string;
  itemOpenIcon?: string;
  parentArrowIcon?: string;
  parentOpenIcon?: string;
}): string {
  if (options.open) {
    if (options.itemOpenIcon) return options.itemOpenIcon;
    if (options.parentOpenIcon) return options.parentOpenIcon;
  }
  if (options.itemArrowIcon) return options.itemArrowIcon;
  if (options.parentArrowIcon) return options.parentArrowIcon;
  return 'chevron-down';
}

export function resolveCollapseArrowText(options: {
  open: boolean;
  arrowText?: string;
  openText?: string;
}): string {
  if (options.open && options.openText) return options.openText;
  if (!options.open && options.arrowText) return options.arrowText;
  return '';
}
