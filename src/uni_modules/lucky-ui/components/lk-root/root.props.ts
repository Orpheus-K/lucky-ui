import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const RootTheme = {
  Auto: 'auto',
  Light: 'light',
  Dark: 'dark',
} as const;

export type RootTheme = (typeof RootTheme)[keyof typeof RootTheme];

export const RootBackground = {
  Page: 'page',
  Container: 'container',
  Transparent: 'transparent',
} as const;

export type RootBackground = (typeof RootBackground)[keyof typeof RootBackground];

export const rootProps = {
  ...baseProps,

  /** 主题模式，auto 时跟随 Lucky UI 当前主题 */
  theme: LkProp.enum(Object.values(RootTheme), RootTheme.Auto, 'Root.theme'),

  /** 局部品牌色，传入后只影响当前根节点内部 */
  brandColor: LkProp.string(''),

  /** Lucky UI 组件语言，传入后调用 Locale.use */
  locale: LkProp.string(''),

  /** 根节点背景 */
  background: LkProp.enum(Object.values(RootBackground), RootBackground.Page, 'Root.background'),

  /** 是否启用页面级最小高度 */
  fullHeight: LkProp.boolean(true),

  /** 是否暴露安全区 CSS 变量 */
  safeArea: LkProp.boolean(true),

  /** 是否内置 Toast 宿主 */
  toast: LkProp.boolean(true),
} as const;

export type RootProps = ExtractPropTypes<typeof rootProps>;
