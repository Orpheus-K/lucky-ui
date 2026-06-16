import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

/**
 * FAB 位置
 */
export const FabPosition = {
  BottomRight: 'bottom-right',
  BottomLeft: 'bottom-left',
  TopRight: 'top-right',
  TopLeft: 'top-left',
} as const;

/**
 * FAB 方向（展开子按钮的方向）
 */
export const FabDirection = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
} as const;

export type FabPosition = (typeof FabPosition)[keyof typeof FabPosition];
export type FabDirection = (typeof FabDirection)[keyof typeof FabDirection];

export interface FabAction {
  /** 唯一标识 */
  key: string;
  /** 图标名称 */
  icon: string;
  /** 文字标签（可选） */
  label?: string;
  /** 自定义颜色 */
  color?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

export const fabProps = {
  ...baseProps,

  /**
   * 主按钮图标
   */
  icon: LkProp.string('plus'),

  /**
   * 展开后的图标（默认旋转45度变成关闭）
   */
  activeIcon: LkProp.string(''),

  /**
   * 初始位置
   */
  position: LkProp.enum(Object.values(FabPosition), FabPosition.BottomRight, 'Fab.position'),

  /**
   * 子按钮展开方向
   */
  direction: LkProp.enum(Object.values(FabDirection), FabDirection.Up, 'Fab.direction'),

  /**
   * 子按钮列表
   */
  actions: {
    type: Array as PropType<FabAction[]>,
    default: () => [],
  },

  /**
   * 是否可拖拽
   */
  draggable: LkProp.boolean(true),

  /**
   * 拖拽后是否自动吸边
   */
  magnetic: LkProp.boolean(true),

  /**
   * 主按钮尺寸 (rpx)
   */
  size: LkProp.stringNumber(112),

  /**
   * 子按钮尺寸 (rpx)
   */
  actionSize: LkProp.stringNumber(88),

  /**
   * 边距 (rpx)
   */
  offset: LkProp.stringNumber(32),

  /**
   * 主题色
   */
  color: LkProp.string('primary'),

  /**
   * 是否使用毛玻璃效果
   */
  blur: LkProp.boolean(true),

  /**
   * 层级 (默认 400，导航层最高，低于弹出层)
   */
  zIndex: LkProp.number(400),

  /**
   * 是否显示遮罩（展开时）
   */
  overlay: LkProp.boolean(false),

  /**
   * 点击遮罩关闭
   */
  closeOnOverlay: LkProp.boolean(true),

  /**
   * 是否展开
   */
  modelValue: LkProp.boolean(false),

  /**
   * 安全区域底部偏移
   */
  safeAreaInsetBottom: LkProp.boolean(true),
} as const;

export const fabEmits = {
  'update:modelValue': (val: boolean) => typeof val === 'boolean',
  click: (_event?: unknown) => true,
  'action-click': (_action: FabAction, _event?: unknown) => true,
  'action-disabled': (_action: FabAction, _event?: unknown) => true,
  open: () => true,
  close: () => true,
  'overlay-click': (_event?: unknown) => true,
  'drag-start': (_position?: { x: number; y: number; event?: unknown }) => true,
  'drag-move': (_position: { x: number; y: number; event?: unknown }) => true,
  'drag-end': (position: { x: number; y: number; event?: unknown }) => !!position,
  'direction-change': (_direction: FabDirection, _preferred: FabDirection) => true,
};

export type FabProps = ExtractPropTypes<typeof fabProps>;
export type FabEmits = typeof fabEmits;
