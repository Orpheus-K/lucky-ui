/**
 * 预加载调试面板组件 Props
 */
import { baseProps, LkProp } from '../common/props';

/** 位置类型 */
export const DebuggerPosition = {
  TopLeft: 'top-left',
  TopRight: 'top-right',
  BottomLeft: 'bottom-left',
  BottomRight: 'bottom-right',
} as const;

export type DebuggerPosition = (typeof DebuggerPosition)[keyof typeof DebuggerPosition];

export const preloadDebuggerProps = {
  ...baseProps,

  /** 是否显示 */
  visible: LkProp.boolean(false),
  /** 位置 */
  position: LkProp.enum(
    Object.values(DebuggerPosition),
    DebuggerPosition.BottomRight,
    'PreloadDebugger.position'
  ),
};
