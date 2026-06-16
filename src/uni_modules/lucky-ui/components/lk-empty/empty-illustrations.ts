import { DEFAULT_BRAND_COLOR } from '../../theme';
import { Locale } from '../../locale';
import type { EmptyName } from './empty.props';
import {
  GENERATED_EMPTY_META,
  GENERATED_EMPTY_PRESETS,
  GENERATED_EMPTY_SVG_TEMPLATES,
  type GeneratedEmptyIllustrationMeta,
  type GeneratedEmptyPreset,
} from './empty-illustrations.generated';

export type EmptyPreset = GeneratedEmptyPreset;
export type EmptyIllustrationMeta = GeneratedEmptyIllustrationMeta;

export const emptyPresetText: Record<EmptyName, EmptyPreset> = GENERATED_EMPTY_PRESETS;
export const emptyIllustrationMeta: Record<EmptyName, EmptyIllustrationMeta> = GENERATED_EMPTY_META;

interface EmptyPalette {
  primary: string;
  primarySoft: string;
}

function normalizeHexColor(color: string): string {
  const trimmed = color.trim();
  const rgb = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i.exec(trimmed);
  if (rgb) {
    const toHex = (value: string) =>
      Math.max(0, Math.min(255, Number(value)))
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  }
  const short = /^#([a-f\d])([a-f\d])([a-f\d])$/i.exec(trimmed);
  if (short) {
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  }
  return /^#[a-f\d]{6}$/i.test(trimmed) ? trimmed : DEFAULT_BRAND_COLOR;
}

function hexToRgb(color: string) {
  const hex = normalizeHexColor(color);
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function mixWithWhite(color: string, ratio: number): string {
  const { r, g, b } = hexToRgb(color);
  return `rgb(${Math.round(r + (255 - r) * ratio)}, ${Math.round(g + (255 - g) * ratio)}, ${Math.round(b + (255 - b) * ratio)})`;
}

function createPalette(color?: string): EmptyPalette {
  const primary = normalizeHexColor(color || DEFAULT_BRAND_COLOR);
  return {
    primary,
    primarySoft: mixWithWhite(primary, 0.82),
  };
}

function renderTemplate(svg: string, palette: EmptyPalette): string {
  return svg
    .replace(/\{\{primary\}\}/gi, palette.primary)
    .replace(/\{\{primarySoft\}\}/g, palette.primarySoft)
    .replace(/\{\{primarysoft\}\}/gi, palette.primarySoft);
}

export function getEmptyPreset(name: EmptyName): EmptyPreset {
  const title = Locale.t(`lk.empty.${name}.title`);
  const description = Locale.t(`lk.empty.${name}.description`);

  return {
    title:
      title !== `lk.empty.${name}.title`
        ? title
        : emptyPresetText[name]?.title || emptyPresetText.empty.title,
    description:
      description !== `lk.empty.${name}.description`
        ? description
        : emptyPresetText[name]?.description || emptyPresetText.empty.description,
  };
}

export function getEmptyIllustrationSrc(name: EmptyName, color?: string): string {
  const template = GENERATED_EMPTY_SVG_TEMPLATES[name] || GENERATED_EMPTY_SVG_TEMPLATES.empty;
  const svg = renderTemplate(template, createPalette(color));
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
