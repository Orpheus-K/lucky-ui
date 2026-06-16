import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * 图片填充模式
 */
export const ImageFit = {
  Cover: 'cover',
  Contain: 'contain',
  Fill: 'fill',
  None: 'none',
  ScaleDown: 'scale-down',
} as const;

export type ImageFit = (typeof ImageFit)[keyof typeof ImageFit];

export const imageProps = {
  ...baseProps,

  /** 图片地址 */
  src: LkProp.string(''),

  /** 宽度 */
  width: LkProp.string('100%'),

  /** 高度 */
  height: LkProp.string('auto'),

  /** 圆角 */
  radius: LkProp.string('var(--lk-radius-md)'),

  /**
   * 填充模式
   * @value cover 覆盖
   * @value contain 包含
   * @value fill 填充
   * @value none 无
   * @value scale-down 缩小
   */
  fit: LkProp.enum(Object.values(ImageFit), ImageFit.Cover, 'Image.fit'),

  /** 是否懒加载 */
  lazy: LkProp.boolean(false),

  /** 是否显示加载中状态 */
  showLoading: LkProp.boolean(true),

  /** 是否显示加载失败状态 */
  showError: LkProp.boolean(true),

  /** 是否开启预览（默认点击可预览） */
  preview: LkProp.boolean(true),
} as const;

export type ImageProps = ExtractPropTypes<typeof imageProps>;

export const imageEmits = {
  load: (_event?: unknown) => true,
  error: (_event?: unknown) => true,
  click: (_payload: { src: string; event?: unknown }) => true,
  preview: (_payload: { src: string; urls: string[]; event?: unknown }) => true,
  'preview-success': (_payload: { src: string; result: unknown }) => true,
  'preview-fail': (_payload: { src: string; error: unknown }) => true,
};
