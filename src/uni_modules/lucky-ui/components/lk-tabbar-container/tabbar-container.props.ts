import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';
import type { TabConfig } from '../../core/src/tabbar-container';

export type { TabConfig } from '../../core/src/tabbar-container';

export const TabbarContainerMode = {
  Plain: 'plain',
  Block: 'block',
  Flashlight: 'flashlight',
  Float: 'float',
  MarkerTop: 'marker-top',
  MarkerBottom: 'marker-bottom',
  DotSlide: 'dot-slide',
  Bubble: 'bubble',
  Ripple: 'ripple',
  MaskFill: 'mask-fill',
  TextRaise: 'text-raise',
} as const;

export type TabbarContainerMode = (typeof TabbarContainerMode)[keyof typeof TabbarContainerMode];

export const TabbarContainerRenderMode = {
  Auto: 'auto',
  Component: 'component',
  Slot: 'slot',
} as const;

export type TabbarContainerRenderMode =
  (typeof TabbarContainerRenderMode)[keyof typeof TabbarContainerRenderMode];

export const tabbarContainerProps = {
  ...baseProps,

  /** Tab 配置 */
  tabs: {
    type: Array as PropType<TabConfig[]>,
    default: () => [],
  },

  /** 默认激活的 Tab ID */
  defaultTab: LkProp.string(''),

  /** 是否开启调试模式 */
  debug: LkProp.boolean(false),

  /** Tabbar 模式 */
  mode: LkProp.enum(
    Object.values(TabbarContainerMode),
    TabbarContainerMode.TextRaise,
    'TabbarContainer.mode'
  ),

  /** 预加载延迟（毫秒） */
  preloadDelay: LkProp.number(2000),

  /** 是否预加载所有 Tab */
  preloadAll: LkProp.boolean(true),

  /** 内容面板是否使用内置纵向滚动容器 */
  panelScrollable: LkProp.boolean(true),

  /** 底部栏是否使用 fixed 定位 */
  fixed: LkProp.boolean(true),

  /** 安全视觉模式：强制使用低特效 plain 模式，减少 filter/复杂动画依赖 */
  safeMode: LkProp.boolean(false),

  /** 内容渲染方式：auto/component/slot */
  renderMode: LkProp.enum(
    Object.values(TabbarContainerRenderMode),
    TabbarContainerRenderMode.Auto,
    'TabbarContainer.renderMode'
  ),

  /** 加载中文案 */
  loadingText: LkProp.string(''),

  /** 加载失败文案 */
  errorText: LkProp.string(''),

  /** 重试文案 */
  retryText: LkProp.string(''),
} as const;

export const tabbarContainerEmits = {
  change: (tabId: string) => typeof tabId === 'string',
  beforeChange: (tabId: string, oldTabId: string) =>
    typeof tabId === 'string' && typeof oldTabId === 'string',
};

export type TabbarContainerProps = ExtractPropTypes<typeof tabbarContainerProps>;
export type TabbarContainerEmits = typeof tabbarContainerEmits;
