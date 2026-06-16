import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const pageProps = {
  ...baseProps,

  /**
   * 是否自动预留出状态栏加标准导航栏的高度，确保页面主体内容不被自定义导航栏遮挡
   */
  reserveTop: LkProp.boolean(false),

  /**
   * 当开启胶囊对齐时，组件左侧插槽内的元素将与各平台小程序右上角“胶囊按钮”保持物理居中对齐
   */
  capsuleAlign: LkProp.boolean(false),

  /**
   * 是否开启底部安全区（Safe Area）适配
   */
  safeAreaBottom: LkProp.boolean(true),

  /**
   * 默认插槽是否开启滚动区域 (若关闭则为普通 view)
   */
  scrollable: LkProp.boolean(true),

  /**
   * 滚动区域的自定义类名
   */
  scrollClass: LkProp.string(''),

  /**
   * 滚动区域的自定义样式
   */
  scrollStyle: LkProp.string(''),
} as const;

export type PageProps = ExtractPropTypes<typeof pageProps>;
