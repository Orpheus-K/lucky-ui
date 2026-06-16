import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';
import {
  GENERATED_EMPTY_NAME_MAP,
  GENERATED_EMPTY_NAMES,
  type GeneratedEmptyName,
} from './empty-illustrations.generated';

export const EmptyName = GENERATED_EMPTY_NAME_MAP;

export const EmptyLayout = {
  Default: 'default',
  Compact: 'compact',
  Page: 'page',
} as const;

export type EmptyName = GeneratedEmptyName;
export type EmptyLayout = (typeof EmptyLayout)[keyof typeof EmptyLayout];

export const emptyProps = {
  ...baseProps,

  /** 内置空态插画名称 */
  name: LkProp.enum(GENERATED_EMPTY_NAMES, EmptyName.Empty, 'Empty.name'),

  /** 自定义图片地址，优先级高于 name */
  image: LkProp.string(''),

  /** 自定义图片地址别名，优先级低于 image */
  src: LkProp.string(''),

  /** 主标题，为空时使用内置文案 */
  title: LkProp.string(''),

  /** 副描述，为空时使用内置文案 */
  description: LkProp.string(''),

  /** 插画尺寸 */
  imageSize: LkProp.stringNumber(240),

  /** 内置插画主题色，默认跟随品牌色 */
  color: LkProp.string(''),

  /** 布局模式 */
  layout: LkProp.enum(Object.values(EmptyLayout), EmptyLayout.Default, 'Empty.layout'),

  /** 是否显示插画 */
  showImage: LkProp.boolean(true),
} as const;

export const emptyEmits = {
  load: (event: unknown) => event !== undefined,
  error: (event: unknown) => event !== undefined,
};

export type EmptyProps = ExtractPropTypes<typeof emptyProps>;
