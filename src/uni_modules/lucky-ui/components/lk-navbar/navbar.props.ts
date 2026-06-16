import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

/** 导航栏视觉风格 */
export const NavbarVariant = {
  Default: 'default',
  Frosted: 'frosted',
  Transparent: 'transparent',
  Elevated: 'elevated',
} as const;
export type NavbarVariant = (typeof NavbarVariant)[keyof typeof NavbarVariant];

/** 标题对齐方式 */
export const NavbarTitleAlign = {
  Center: 'center',
  Left: 'left',
} as const;
export type NavbarTitleAlign = (typeof NavbarTitleAlign)[keyof typeof NavbarTitleAlign];

export const navbarProps = {
  ...baseProps,

  /** 标题 */
  title: LkProp.string(''),

  /** 副标题 */
  subtitle: LkProp.string(''),

  /** 层级 (默认 200，导航层) */
  zIndex: LkProp.number(200),

  /** 是否固定在顶部 */
  fixed: LkProp.boolean(true),

  /** 左侧文字 */
  leftText: LkProp.string(''),

  /** 右侧文字 */
  rightText: LkProp.string(''),

  /** 是否显示返回按钮 */
  showBack: LkProp.boolean(true),

  /** 自定义背景（支持颜色/渐变），优先级高于样式文件 */
  background: LkProp.string(''),

  /** 视觉风格 */
  variant: LkProp.enum(Object.values(NavbarVariant), NavbarVariant.Default, 'Navbar.variant'),

  /** 标题对齐 */
  titleAlign: LkProp.enum(
    Object.values(NavbarTitleAlign),
    NavbarTitleAlign.Center,
    'Navbar.titleAlign'
  ),

  /** 返回图标 */
  backIcon: LkProp.string('chevron-left'),

  /** 是否显示底部分割线 */
  border: LkProp.boolean(true),

  /** 是否显示投影 */
  shadow: LkProp.boolean(false),

  /** 是否占位 */
  placeholder: LkProp.boolean(true),

  /** 是否开启安全区域适配 */
  safeArea: LkProp.boolean(true),
} as const;

export type NavbarProps = ExtractPropTypes<typeof navbarProps>;

export const navbarEmits = ['back', 'click-left', 'click-right'];
