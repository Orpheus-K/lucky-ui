import type { ComputedRef, InjectionKey } from 'vue';
import type { TabbarMode } from './tabbar.props';

export type TabbarValue = string | number;

export type TabbarProvide = {
  /** 当前激活项 */
  active: ComputedRef<TabbarValue | ''>;
  /** 设置激活项 */
  setActive: (val: TabbarValue, index: number, event?: unknown) => void;
  /** 当前模式 */
  mode: ComputedRef<TabbarMode>;
  /** 激活颜色 */
  activeColor: ComputedRef<string>;
  /** 未激活颜色 */
  inactiveColor: ComputedRef<string>;
  /** 总数量 */
  itemCount: ComputedRef<number>;
  /** 注册子项，返回注销函数 */
  registerItem: () => { index: number; unregister: () => void };
};

export const tabbarContextKey: InjectionKey<TabbarProvide> = Symbol('LkTabbar');
