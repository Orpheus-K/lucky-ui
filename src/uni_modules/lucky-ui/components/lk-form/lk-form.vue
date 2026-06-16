<script setup lang="ts">
import type { StyleValue } from 'vue';
import { reactive, provide, computed, watchEffect } from 'vue';
import { formProps, formEmits } from './form.props';
import type { FormContext, FormItemContext, ValidateError } from './context';
import { formContextKey } from './context';
import { normalizeValidateErrors, resolveFormClass, resolveTargetFormFields } from './form.utils';

defineOptions({ name: 'LkForm' });
const props = defineProps(formProps);
const emit = defineEmits(formEmits);

const fields: FormItemContext[] = reactive([]);

function addField(f: FormItemContext) {
  if (f && !fields.includes(f)) fields.push(f);
}
function removeField(f: FormItemContext) {
  const i = fields.indexOf(f);
  if (i > -1) fields.splice(i, 1);
}

function findFieldByProp(prop: string) {
  return fields.find(f => {
    if (!f.prop) return false;
    if (Array.isArray(f.prop)) return f.prop.includes(prop);
    return f.prop === prop;
  });
}

/** 验证全部或指定字段，返回 Promise。失败时 reject 携带 ValidateError[] */
async function validate(opts?: { fields?: string[]; silent?: boolean }) {
  // 1. 如果使用了自定义验证器 (例如 Zod)
  if (props.customValidator) {
    try {
      const res = await props.customValidator(props.model);
      const errors: ValidateError[] = [];
      const errorMap = res || {};

      for (const f of fields) {
        if (!f.prop) continue;
        const propsList = Array.isArray(f.prop) ? f.prop : [f.prop];
        const errProp = propsList.find(p => errorMap[p]);

        if (errProp) {
          const errMsg = errorMap[errProp];
          f.setValidateStatus('error', errMsg);
          errors.push({ field: errProp, message: errMsg });
          emit('validate-field', errProp, false, [{ field: errProp, message: errMsg }]);
        } else {
          f.setValidateStatus('success', '');
          propsList.forEach(p => {
            emit('validate-field', p, true, null);
          });
        }
      }

      // 如果指定了特定字段校验，进行过滤
      const targetErrors = opts?.fields
        ? errors.filter(e => opts.fields!.includes(e.field))
        : errors;

      emit('validate', targetErrors.length === 0, targetErrors.length ? targetErrors : null);

      if (targetErrors.length) {
        if (props.scrollToError) {
          scrollToField(targetErrors[0].field);
        }
        return Promise.reject(targetErrors);
      }
      return; // 验证成功
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      const errors = [{ field: 'global', message: errMsg }];
      emit('validate', false, errors);
      return Promise.reject(errors);
    }
  }

  // 2. 默认的表单规则校验
  const target = resolveTargetFormFields(fields, opts?.fields);
  const errors: ValidateError[] = [];
  for (const f of target) {
    try {
      await f.validate();
      if (f.prop) {
        const propsList = Array.isArray(f.prop) ? f.prop : [f.prop];
        propsList.forEach(p => emit('validate-field', p, true, null));
      }
    } catch (e: unknown) {
      const fieldErrors = normalizeValidateErrors(e);
      errors.push(...fieldErrors);
      if (f.prop) {
        const propsList = Array.isArray(f.prop) ? f.prop : [f.prop];
        propsList.forEach(p => {
          const matchedErrs = fieldErrors.filter(err => err.field === p);
          emit('validate-field', p, false, matchedErrs.length ? matchedErrs : null);
        });
      }
    }
  }
  emit('validate', errors.length === 0, errors.length ? errors : null);
  if (errors.length) {
    if (props.scrollToError) {
      scrollToField(errors[0].field);
    }
    return Promise.reject(errors);
  }
}

/** 重置指定或全部字段到初始状态，并清除验证结果 */
function resetFields(list?: string[]) {
  resolveTargetFormFields(fields, list).forEach(f => f.reset());
  emit('reset', list);
}

/** 清除指定或全部字段的验证状态（不重置值） */
function clearValidate(list?: string[]) {
  resolveTargetFormFields(fields, list).forEach(f => f.setValidateStatus('idle'));
  emit('clear-validate', list);
}

/** 触发 blur 验证 */
function emitFieldBlur(prop: string) {
  emit('field-blur', prop);
  const field = findFieldByProp(prop);
  field
    ?.validate('blur')
    .then(() => emit('validate-field', prop, true, null))
    .catch((error: ValidateError[]) => emit('validate-field', prop, false, error));
}

/** 触发 change 验证 */
function emitFieldChange(prop: string, _value?: unknown) {
  emit('field-change', prop, _value);
  const field = findFieldByProp(prop);
  field
    ?.validate('change')
    .then(() => emit('validate-field', prop, true, null))
    .catch((error: ValidateError[]) => emit('validate-field', prop, false, error));
}

/** 验证单个字段 */
async function validateField(prop: string) {
  const f = findFieldByProp(prop);
  if (!f) return;
  try {
    await f.validate();
    emit('validate-field', prop, true, null);
  } catch (error) {
    const errors = normalizeValidateErrors(error);
    emit('validate-field', prop, false, errors);
    return Promise.reject(errors);
  }
}

/** 滚动到指定字段 */
function scrollToField(prop: string) {
  const selector = `.lk-form-item[data-prop*="${prop}"]`;

  // #ifdef H5
  const el = typeof document !== 'undefined' ? document.querySelector(selector) : null;
  if (el instanceof HTMLElement) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
    return;
  }
  // #endif

  const field = findFieldByProp(prop);
  if (field?.getBoundingClientRect) {
    field.getBoundingClientRect().then(node => {
      if (node?.top != null) {
        scrollPageToRectTop(node.top, node.height);
      }
    });
    return;
  }

  const query = uni.createSelectorQuery();
  query.select(selector).boundingClientRect();
  applyViewportScrollOffset(query);
  query.exec(results => {
    const rect = results?.[0];
    const scroll = results?.[1] as { scrollTop?: number } | undefined;
    const node = Array.isArray(rect) ? rect[0] : rect;
    const currentScrollTop = typeof scroll?.scrollTop === 'number' ? scroll.scrollTop : 0;

    if (node?.top != null) {
      const blockOffset = getScrollBlockOffset(node.height);
      uni.pageScrollTo({
        scrollTop: Math.max(0, currentScrollTop + node.top - blockOffset),
        duration: 300,
      });
    }
  });
}

function scrollPageToRectTop(top: number, height?: number) {
  const query = uni.createSelectorQuery();
  applyViewportScrollOffset(query);
  query.exec(results => {
    const scroll = results?.[0] as { scrollTop?: number } | undefined;
    const currentScrollTop = typeof scroll?.scrollTop === 'number' ? scroll.scrollTop : 0;
    const blockOffset = getScrollBlockOffset(height);

    uni.pageScrollTo({
      scrollTop: Math.max(0, currentScrollTop + top - blockOffset),
      duration: 300,
    });
  });
}

function applyViewportScrollOffset(query: ReturnType<typeof uni.createSelectorQuery>) {
  const viewportQuery = query.selectViewport() as unknown as { scrollOffset: () => void };
  viewportQuery.scrollOffset();
}

function getScrollBlockOffset(height?: number) {
  try {
    const viewportHeight = uni.getSystemInfoSync?.().windowHeight;
    if (typeof viewportHeight === 'number' && viewportHeight > 0) {
      return Math.max(20, (viewportHeight - (height || 0)) / 2);
    }
  } catch {
    // ignore
  }
  return 20;
}

const classes = computed(() => [
  ...resolveFormClass({
    border: props.border,
    card: props.card,
    customClass: props.customClass,
  }),
]);

const style = computed(() => props.customStyle as StyleValue);

const formContext = reactive<FormContext>({
  model: props.model,
  rules: props.rules,
  labelWidth: props.labelWidth,
  labelAlign: props.labelAlign,
  showMessage: props.showMessage,
  border: props.border,
  card: props.card,
  customValidator: props.customValidator,
  asteriskPosition: props.asteriskPosition,
  addField,
  removeField,
  validateField,
  emitFieldBlur,
  emitFieldChange,
  validate,
  resetFields,
  clearValidate,
  scrollToField,
});

watchEffect(() => {
  formContext.model = props.model;
  formContext.rules = props.rules;
  formContext.labelWidth = props.labelWidth;
  formContext.labelAlign = props.labelAlign;
  formContext.showMessage = props.showMessage;
  formContext.border = props.border;
  formContext.card = props.card;
  formContext.customValidator = props.customValidator;
  formContext.asteriskPosition = props.asteriskPosition;
});

provide(formContextKey, formContext);

defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
});
</script>

<template>
  <view :id="id" :class="classes" :style="style" :data-lk-form="true"><slot /></view>
</template>

<style lang="scss">
@use './lk-form.scss';
</style>
