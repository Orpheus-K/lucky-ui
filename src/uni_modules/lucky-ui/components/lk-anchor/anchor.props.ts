import { baseProps, LkProp } from '../common/props';
import type { ExtractPropTypes } from 'vue';

export const anchorProps = {
  ...baseProps,

  /**
   * 侧边栏背景颜色（可选；不传则走主题变量）
   */
  bgColor: LkProp.string(''),

  /**
   * 激活项的背景颜色（可选；不传则走主题变量）
   */
  activeBgColor: LkProp.string(''),

  /**
   * 普通项文本颜色（可选；不传则走主题变量）
   */
  textColor: LkProp.string(''),
  /**
   * 激活项的文本颜色（可选；不传则走主题变量）
   */
  activeColor: LkProp.string(''),
  /**
   * 是否显示左侧装饰竖线
   */
  showLine: LkProp.boolean(true),

  /**
   * 目标内容滚动容器选择器（例如："#anchor-content"）。
   * 传入后会按该容器计算锚点位置，解决 scroll-view 场景下的小程序端联动问题。
   */
  targetContainer: LkProp.string(''),
  /**
   * 滚动容器的选择器 (如果指定，将尝试监听该元素的滚动 - H5友好，小程序建议手动传入 scrollTop)
   */
  container: LkProp.string(''),
  /**
   * 顶部偏移量 (px/rpx) - 判断吸顶/激活的阈值
   */
  headerOffset: LkProp.stringNumber(0),
  /**
   * 当前滚动条高度，用于计算激活项
   */
  scrollTop: LkProp.number(0),
};

export const anchorLinkProps = {
  ...baseProps,

  /**
   * 标题
   */
  title: LkProp.string(''),
  /**
   * 锚点对应的内容 ID (不带 #)
   */
  href: LkProp.string(''),
  /**
   * 是否禁用
   */
  disabled: LkProp.boolean(false),
};

export type AnchorProps = ExtractPropTypes<typeof anchorProps>;
export type AnchorLinkProps = ExtractPropTypes<typeof anchorLinkProps>;

export const anchorEmits = {
  change: (_href: string) => true,
  click: (_href: string) => true,
};
