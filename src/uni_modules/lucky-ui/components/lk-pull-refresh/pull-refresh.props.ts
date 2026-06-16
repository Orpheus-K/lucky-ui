import type { ExtractPropTypes } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const PullRefreshStatus = {
  Idle: 'idle',
  Pulling: 'pulling',
  Loosing: 'loosing',
  Refreshing: 'refreshing',
  Success: 'success',
} as const;
export type PullRefreshStatus = (typeof PullRefreshStatus)[keyof typeof PullRefreshStatus];

export const PullRefreshDefaultStyle = {
  None: 'none',
  Black: 'black',
  White: 'white',
} as const;
export type PullRefreshDefaultStyle =
  (typeof PullRefreshDefaultStyle)[keyof typeof PullRefreshDefaultStyle];

export const pullRefreshProps = {
  ...baseProps,

  /** 是否处于刷新中 */
  modelValue: LkProp.boolean(false),

  /** 是否禁用下拉刷新 */
  disabled: LkProp.boolean(false),

  /** 容器高度 */
  height: LkProp.stringNumber('100%'),

  /** 触发刷新阈值，单位 px */
  threshold: LkProp.number(80),

  /** 刷新区域背景 */
  background: LkProp.string('transparent'),

  /** 原生刷新样式 */
  defaultStyle: LkProp.enum(
    Object.values(PullRefreshDefaultStyle),
    PullRefreshDefaultStyle.None,
    'PullRefresh.defaultStyle'
  ),

  /** 是否显示刷新成功状态 */
  showSuccess: LkProp.boolean(true),

  /** 加载动画类型，透传给 lk-loading */
  loadingType: LkProp.string('spinner'),

  /** 加载图标尺寸 */
  loadingSize: LkProp.stringNumber(34),

  /** 加载图标颜色 */
  loadingColor: LkProp.string('var(--lk-color-primary)'),

  /** 成功态展示时长，单位 ms */
  successDuration: LkProp.number(500),

  /** 下拉过程文案 */
  pullingText: LkProp.string(''),

  /** 释放刷新文案 */
  loosingText: LkProp.string(''),

  /** 刷新中文案 */
  loadingText: LkProp.string(''),

  /** 刷新成功文案 */
  successText: LkProp.string(''),
} as const;

export type PullRefreshProps = ExtractPropTypes<typeof pullRefreshProps>;

export const pullRefreshEmits = {
  'update:modelValue': (_value: boolean) => true,
  refresh: () => true,
  scroll: (_event: unknown) => true,
  restore: (_event: unknown) => true,
  abort: (_event: unknown) => true,
  scrolltolower: (_event: unknown) => true,
};
