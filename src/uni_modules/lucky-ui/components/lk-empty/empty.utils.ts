import type { StyleValue } from 'vue';
import { addUnit } from '../../core/src/utils/unit';
import type { EmptyName } from './empty.props';
import type { EmptyPreset } from './empty-illustrations';

export function resolveEmptyTitle(options: { title: string; preset: EmptyPreset }) {
  return options.title || options.preset.title;
}

export function resolveEmptyDescription(options: { description: string; preset: EmptyPreset }) {
  return options.description || options.preset.description;
}

export function resolveEmptyColor(options: { color: string; runtimeBrandColor: string }) {
  return options.color || options.runtimeBrandColor;
}

export function resolveEmptyImage(options: {
  image: string;
  src: string;
  name: EmptyName;
  color: string;
  getIllustrationSrc: (name: EmptyName, color: string) => string;
}) {
  return options.image || options.src || options.getIllustrationSrc(options.name, options.color);
}

export function resolveEmptyRootClass(options: {
  layout: string;
  showImage: boolean;
  customClass?: unknown;
}) {
  return [
    'lk-empty',
    `lk-empty--${options.layout}`,
    {
      'lk-empty--no-image': !options.showImage,
    },
    options.customClass,
  ];
}

export function resolveEmptyRootStyle(customStyle: StyleValue): StyleValue {
  return customStyle;
}

export function resolveEmptyImageStyle(imageSize: string | number): StyleValue {
  const size = addUnit(imageSize);
  return {
    width: size,
    height: size,
  };
}

export function isReadableBrandColor(color: string): boolean {
  return /^#[a-f\d]{6}$/i.test(color) || /^rgba?\(/i.test(color);
}
