<script setup lang="ts">
import type { StyleValue } from 'vue';
import {
  inject,
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  watch,
  getCurrentInstance,
  useSlots,
} from 'vue';
import { formItemEmits, formItemProps } from './form.props';
import LkIcon from '../lk-icon/lk-icon.vue';
import {
  formContextKey,
  type FormContext,
  type FormRule,
  type FormItemContext,
} from './context';
import { useLocale } from '../../composables/useLocale';
import {
  filterFormRulesByTrigger,
  getFormFieldRules,
  resolveFormItemClass,
  resolveFormItemLabelStyle,
  resolveFormItemRequired,
  resolveFormItemResetValue,
  validateFormValue,
  type FormValidateStatus,
} from './form.utils';
import { addUnit } from '../../core/src/utils/unit';

defineOptions({ name: 'LkFormItem' });
const props = defineProps(formItemProps);
const emit = defineEmits(formItemEmits);
const form = inject(formContextKey, null as FormContext | null);
const { t } = useLocale('form');
const instance = getCurrentInstance();
const slots = useSlots();

const status = ref<FormValidateStatus>('idle');
const msg = ref('');
const requiredMark = ref(false);

function rules(): FormRule[] {
  return getFormFieldRules(form?.rules, props.prop);
}
function computeReq() {
  return resolveFormItemRequired({
    explicitRequired: props.required,
    rules: rules(),
  });
}

const resolvedAsteriskPosition = computed(() => {
  return props.asteriskPosition || form?.asteriskPosition || 'left';
});

async function doValidate(trigger?: 'blur' | 'change') {
  const prop = props.prop;
  if (!prop || !form) return;

  // 1. 如果使用了自定义验证器 (例如 Zod)
  if (form.customValidator) {
    try {
      const errorMap = await form.customValidator(form.model);
      const propsList = Array.isArray(prop) ? prop : [prop];
      const matchedProp = errorMap ? propsList.find(p => errorMap[p]) : undefined;
      if (matchedProp) {
        status.value = 'error';
        msg.value = errorMap?.[matchedProp] || '';
        return Promise.reject([{ field: matchedProp, message: msg.value }]);
      } else {
        status.value = 'success';
        msg.value = '';
      }
    } catch (e) {
      status.value = 'error';
      msg.value = e instanceof Error ? e.message : String(e);
      return Promise.reject([{ field: Array.isArray(prop) ? prop[0] : prop, message: msg.value }]);
    }
    return;
  }

  // 2. 默认的表单规则校验
  const propsList = Array.isArray(prop) ? prop : [prop];
  for (const p of propsList) {
    const list = filterFormRulesByTrigger(getFormFieldRules(form.rules, p), trigger);
    if (!list.length) continue;
    const val = form.model[p];
    status.value = 'validating';
    msg.value = '';
    const errs = await validateFormValue({
      field: p,
      value: val,
      rules: list,
      model: form.model,
      fallbackMessage: t<string>('validationFailed'),
    });
    if (errs.length) {
      status.value = 'error';
      msg.value = errs[0].message;
      return Promise.reject(errs);
    }
  }
  status.value = 'success';
  msg.value = '';
}

const itemCtx: FormItemContext = {
  prop: props.prop || undefined,
  getBoundingClientRect() {
    return new Promise(resolve => {
      const query = uni.createSelectorQuery();
      const proxy = instance?.proxy;
      const scopedQuery = typeof query.in === 'function' && proxy ? query.in(proxy) : query;
      scopedQuery
        .select('.lk-form-item')
        .boundingClientRect(rect => {
          const node = Array.isArray(rect) ? rect[0] : rect;
          resolve(node || null);
        })
        .exec();
    });
  },
  setValidateStatus(s, m) {
    status.value = s;
    if (m !== undefined) msg.value = m;
  },
  validate: doValidate,
  reset() {
    if (props.prop && form) {
      const propsList = Array.isArray(props.prop) ? props.prop : [props.prop];
      propsList.forEach(p => {
        const v = form.model[p];
        form.model[p] = resolveFormItemResetValue(v);
      });
    }
    status.value = 'idle';
    msg.value = '';
  },
};

onMounted(() => {
  requiredMark.value = computeReq();
  form?.addField(itemCtx);
});
onBeforeUnmount(() => form?.removeField(itemCtx));
watch([() => props.required, () => form?.rules], () => (requiredMark.value = computeReq()), {
  deep: true,
});

const labelStyle = computed(() => {
  const w = props.labelWidth || form?.labelWidth;
  return resolveFormItemLabelStyle(w);
});

// 继承表单的 labelAlign
const resolvedLabelAlign = computed(() => props.labelAlign || form?.labelAlign || 'left');

// 是否 top 布局
const isTopLayout = computed(() => resolvedLabelAlign.value === 'top' || props.vertical);

// 表单是否开启 border/card
const hasBorder = computed(() => {
  return props.border !== undefined ? props.border : !!form?.border;
});

const style = computed(() => props.customStyle as StyleValue);
const errorStyle = computed<StyleValue>(() => {
  if (isTopLayout.value || (!props.label && !slots.label)) return {};

  const width = addUnit(props.labelWidth || form?.labelWidth) || 'var(--lk-rpx-160)';
  return {
    paddingLeft: `calc(var(--_padding-x) + ${width} + var(--_gap-x))`,
  };
});
const classes = computed(() =>
  resolveFormItemClass({
    customClass: props.customClass,
    status: status.value,
    labelAlign: resolvedLabelAlign.value,
    topLayout: isTopLayout.value,
    border: hasBorder.value,
    link: props.isLink,
  })
);

function onItemTap(event: unknown) {
  emit('tap', event);
  emit('click', event);
}

defineExpose({
  validate: doValidate,
  resetField: itemCtx.reset,
  clearValidate: () => itemCtx.setValidateStatus('idle'),
});
</script>

<template>
  <view
    :id="id"
    class="lk-form-item"
    :class="classes"
    :style="style"
    :data-prop="Array.isArray(prop) ? prop.join(',') : prop"
    @tap="onItemTap"
  >
    <view class="lk-form-item__body">
      <view v-if="label || $slots.label" class="lk-form-item__label" :style="labelStyle">
        <text
          v-if="resolvedAsteriskPosition === 'left'"
          class="lk-form-item__star"
          :class="{ 'is-hidden': !requiredMark }"
          >*</text
        >
        <slot name="label">
          <text class="lk-form-item__label-text">{{ label }}</text>
        </slot>
        <text
          v-if="resolvedAsteriskPosition === 'right'"
          class="lk-form-item__star lk-form-item__star--right"
          :class="{ 'is-hidden': !requiredMark }"
          >*</text
        >
      </view>
      <view class="lk-form-item__content">
        <slot />
      </view>
      <view v-if="isLink" class="lk-form-item__arrow">
        <lk-icon name="chevron-right" size="32" />
      </view>
    </view>
    <view
      v-if="(showMessage ?? form?.showMessage) !== false && status === 'error' && msg"
      class="lk-form-item__error"
      :style="errorStyle"
    >
      {{ msg }}
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-form.scss';
</style>
