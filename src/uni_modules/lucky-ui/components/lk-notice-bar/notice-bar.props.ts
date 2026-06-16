import type { PropType, ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const ScrollMode = {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
} as const;

export type ScrollMode = (typeof ScrollMode)[keyof typeof ScrollMode];

export const noticeBarProps = {
  ...baseProps,

  /** 文本内容 */
  text: LkProp.string(''),

  /**
   * 滚动模式: false | true | 'horizontal' | 'vertical'
   * - false: 不滚动
   * - true | 'horizontal': 横向滚动
   * - 'vertical': 竖向逐条滚动
   */
  scrollable: {
    type: [Boolean, String] as PropType<boolean | ScrollMode>,
    default: ScrollMode.Horizontal,
  },

  /** 滚动速度（秒） */
  speed: LkProp.number(10),

  /** 是否可关闭 */
  closeable: LkProp.boolean(false),

  /** 左侧图标名 */
  icon: LkProp.string(''),

  /** 文字颜色 */
  // 默认使用警告色（橙色/黄色），而不是品牌色
  color: LkProp.string('var(--lk-color-warning)'),

  /** 背景颜色 */
  // 默认使用中性填充色，而不是品牌淡色
  background: LkProp.string('var(--lk-fill-1)'),

  /** 是否不要背景（包括不注入 background 与 color） */
  noBackground: LkProp.boolean(false),

  /** 竖向滚动时的消息列表 */
  messages: {
    type: Array as PropType<string[]>,
    default: () => [] as string[],
  },
} as const;

export type NoticeBarProps = ExtractPropTypes<typeof noticeBarProps>;

export const noticeBarEmits = {
  click: (_payload: { text: string; index: number; event?: unknown }) => true,
  close: (_event?: unknown) => true,
  'message-change': (_payload: { index: number; text: string }) => true,
  'loop-reset': () => true,
};
