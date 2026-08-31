<script setup lang="ts">
import type { StyleValue } from 'vue';
import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onMounted,
  nextTick,
  provide,
  readonly,
  ref,
  useSlots,
  watch,
} from 'vue';
import { formItemEmits, formItemProps } from './form.props';
import LkIcon from '../lk-icon/lk-icon.vue';
import {
  formContextKey,
  formItemContextKey,
  type FormContext,
  type FormItemContext,
  type FormRule,
} from './context';
import {
  createFormItemValidationController,
  watchFormItemInitialValueSources,
} from './form.validation';
import { useLocale } from '../../composables/useLocale';
import {
  captureFormItemInitialValues,
  getFormFieldRules,
  resolveFormItemClass,
  resolveFormItemLabelStyle,
  resolveFormItemProps,
  resolveFormItemRequired,
  restoreFormItemInitialValues,
  type FormItemInitialValues,
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
let initialValues: FormItemInitialValues = new Map();

function rules(): FormRule[] {
  return getFormFieldRules(form?.rules, props.prop);
}

const requiredMark = computed(() =>
  resolveFormItemRequired({
    explicitRequired: props.required,
    rules: rules(),
  })
);

const resolvedAsteriskPosition = computed(() => {
  return props.asteriskPosition || form?.asteriskPosition || 'left';
});

const validation = createFormItemValidationController({
  getForm: () => form,
  getProp: () => props.prop || undefined,
  getStatus: () => status.value,
  getMessage: () => msg.value,
  setState(nextStatus, message) {
    status.value = nextStatus;
    msg.value = message;
  },
  fallbackMessage: () => t<string>('validationFailed'),
});

const itemContext: FormItemContext = {
  get prop() {
    return props.prop || undefined;
  },
  validateStatus: readonly(status),
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
  setValidateStatus(nextStatus, message) {
    validation.setStatus(
      nextStatus,
      message !== undefined
        ? message
        : nextStatus === 'idle' || nextStatus === 'success'
          ? ''
          : msg.value
    );
  },
  beginValidation: validation.begin,
  isValidationCurrent: validation.isCurrent,
  captureValidationGeneration: validation.captureGeneration,
  commitValidation: validation.commitGeneration,
  rollbackValidation: validation.rollbackGeneration,
  releaseValidation: validation.releaseGeneration,
  getValidationProps: validation.getValidationProps,
  invalidateValidation: validation.invalidate,
  validate: validation.validate,
  validateGeneration: validation.validateGeneration,
  reset(fieldNames) {
    validation.invalidate();
    if (form) restoreFormItemInitialValues(form.model, initialValues, fieldNames);
    validation.setStatus('idle');
  },
};
let active = true;

provide(formItemContextKey, itemContext);

function rebuildInitialValues() {
  validation.invalidate();
  initialValues = form ? captureFormItemInitialValues(form.model, props.prop) : new Map();
  validation.setStatus('idle');
}

rebuildInitialValues();
watchFormItemInitialValueSources({
  model: () => form?.model,
  prop: () => props.prop || undefined,
  rebuild: rebuildInitialValues,
});
watch(
  () => form?.disabled,
  () => {
    validation.invalidate(true);
  },
  { flush: 'sync' }
);
watch(
  () => resolveFormItemProps(props.prop).map(prop => form?.rules?.[prop]),
  () => validation.invalidate(true),
  { deep: true, flush: 'sync' }
);

onMounted(() => form?.addField(itemContext));
onBeforeUnmount(() => {
  active = false;
  validation.invalidate();
  form?.removeField(itemContext);
});

const labelStyle = computed(() => {
  const width = props.labelWidth || form?.labelWidth;
  return resolveFormItemLabelStyle(width);
});
const resolvedLabelAlign = computed(() => props.labelAlign || form?.labelAlign || 'left');
const isTopLayout = computed(() => resolvedLabelAlign.value === 'top' || props.vertical);
const hasBorder = computed(() => {
  return props.border !== undefined ? props.border : !!form?.border;
});
const isFormDisabled = computed(() => !!form?.disabled);
const style = computed(() => props.customStyle as StyleValue);
const errorStyle = computed<StyleValue>(() => {
  if (isTopLayout.value || (!props.label && !slots.label)) return {};
  const width = addUnit(props.labelWidth || form?.labelWidth) || 'var(--lk-rpx-160)';
  return {
    paddingLeft: `calc(var(--_padding-x) + ${width} + var(--_gap-x))`,
  };
});
const classes = computed(() => [
  ...resolveFormItemClass({
    customClass: props.customClass,
    status: status.value,
    labelAlign: resolvedLabelAlign.value,
    topLayout: isTopLayout.value,
    border: hasBorder.value,
    link: props.isLink,
  }),
  { 'is-disabled': isFormDisabled.value },
]);

async function onItemTap(event: unknown) {
  if (isFormDisabled.value) return;
  emit('tap', event);
  await nextTick();
  if (!active || isFormDisabled.value) return;
  emit('click', event);
}

defineExpose({
  validate: validation.validate,
  resetField: itemContext.reset,
  clearValidate: () => {
    itemContext.invalidateValidation();
    itemContext.setValidateStatus('idle');
  },
});
</script>

<template>
  <view
    :id="id"
    class="lk-form-item"
    :class="classes"
    :style="style"
    :data-prop="Array.isArray(prop) ? prop.join(',') : prop"
    :data-validation-status="status"
    :data-validation-message="msg"
    :data-disabled="isFormDisabled ? 'true' : 'false'"
    :aria-disabled="isFormDisabled"
    @tap="onItemTap"
  >
    <view class="lk-form-item__body">
      <view v-if="label || $slots.label" class="lk-form-item__label" :style="labelStyle">
        <text
          v-if="requiredMark && resolvedAsteriskPosition === 'left'"
          class="lk-form-item__star"
          >*</text
        >
        <slot name="label">
          <text class="lk-form-item__label-text">{{ label }}</text>
        </slot>
        <text
          v-if="requiredMark && resolvedAsteriskPosition === 'right'"
          class="lk-form-item__star lk-form-item__star--right"
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
