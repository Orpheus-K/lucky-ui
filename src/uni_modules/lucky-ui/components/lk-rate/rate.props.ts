import type { ExtractPropTypes, PropType } from 'vue';
import { baseProps, LkProp } from '../common/props';

export const rateProps = {
  ...baseProps,

  /** 绑定值 */
  modelValue: LkProp.number(0),

  /** 图标数量 */
  count: LkProp.number(5),

  /** 是否禁用 */
  disabled: LkProp.boolean(false),

  /** 是否只读（能显示但不能交互） */
  readonly: LkProp.boolean(false),

  /**
   * 是否允许再次点击当前评分清零
   * @default true
   */
  allowClear: LkProp.boolean(true),

  /** 图标大小（支持 number / string） */
  size: {
    type: [String, Number] as PropType<string | number>,
    default: 48,
  },

  /** 选中时的颜色（不传走主题 warning 色） */
  color: LkProp.string(''),

  /** 未选中时的颜色 */
  colorVoid: LkProp.string(''),

  /** 自定义选中时的图标名（默认 star-fill） */
  icon: LkProp.string(''),

  /** 未选中时的图标名（默认 star） */
  iconVoid: LkProp.string(''),

  /** 表单字段名 */
  prop: LkProp.string(''),
} as const;

export type RateProps = ExtractPropTypes<typeof rateProps>;

export const rateEmits = {
  'update:modelValue': (_val: number) => true,
  change: (_val: number, _oldValue?: number) => true,
  click: (_payload: { value: number; oldValue: number; index: number; event?: unknown }) => true,
  clear: (_payload: { oldValue: number; index: number; event?: unknown }) => true,
  'click-disabled': (_payload: {
    value: number;
    index: number;
    disabled: boolean;
    readonly: boolean;
    event?: unknown;
  }) => true,
};
