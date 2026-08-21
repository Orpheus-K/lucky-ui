<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, nextTick, onBeforeUnmount, provide, reactive, watch, watchEffect } from 'vue';
import { formEmits, formProps } from './form.props';
import type {
  FormContext,
  FormFieldInteractionOwner,
  FormItemContext,
  FormValidateOptions,
  ValidateError,
} from './context';
import {
  FormValidationSupersededError,
  formContextKey,
  formItemContextKey,
  isFormValidationSupersededError,
} from './context';
import {
  normalizeValidateErrors,
  resolveFormClass,
  resolveFormItemProps,
  resolveTargetFormFields,
  validateRegisteredFormFields,
} from './form.utils';

defineOptions({ name: 'LkForm' });
const props = defineProps(formProps);
const emit = defineEmits(formEmits);

const fields: FormItemContext[] = reactive([]);
const fieldModelStops = new Map<FormItemContext, () => void>();
let formStateGeneration = 0;
let formActive = true;

function invalidateValidation(fieldNames?: string[]) {
  resolveTargetFormFields(fields, fieldNames).forEach(field => field.invalidateValidation(true));
}

function invalidateFormState() {
  formStateGeneration += 1;
  invalidateValidation();
}

function addField(field: FormItemContext) {
  if (field && !fields.includes(field)) {
    fields.push(field);
    formStateGeneration += 1;
    fieldModelStops.set(
      field,
      watch(
        () => resolveFormItemProps(field.prop).map(prop => props.model[prop]),
        () => {
          if (props.customValidator) invalidateValidation();
          else field.invalidateValidation(true);
        },
        { deep: true, flush: 'sync' }
      )
    );
  }
}

function removeField(field: FormItemContext) {
  const index = fields.indexOf(field);
  if (index > -1) {
    fieldModelStops.get(field)?.();
    fieldModelStops.delete(field);
    fields.splice(index, 1);
    formStateGeneration += 1;
  }
}

function findFieldByProp(prop: string) {
  return fields.find(field => {
    if (!field.prop) return false;
    if (Array.isArray(field.prop)) return field.prop.includes(prop);
    return field.prop === prop;
  });
}

/** Validate all registered fields or an explicit subset. */
async function validate(options?: FormValidateOptions) {
  const silent = options?.silent === true;
  const stateGeneration = formStateGeneration;
  const result = await validateRegisteredFormFields({
    fields,
    model: props.model,
    customValidator: props.customValidator,
    validateOptions: options,
    isCurrent: () => stateGeneration === formStateGeneration,
  });
  function isCurrent() {
    return stateGeneration === formStateGeneration && result.isCurrent();
  }

  if (!isCurrent() || result.stale) {
    result.rollback();
    throw new FormValidationSupersededError();
  }

  try {
    if (!silent) {
      for (const report of result.reports) {
        if (!isCurrent()) throw new FormValidationSupersededError();
        emit('validate-field', report.prop, report.ok, report.errors);
        await nextTick();
        if (!isCurrent()) throw new FormValidationSupersededError();
      }
      emit('validate', result.errors.length === 0, result.errors.length ? result.errors : null);
      await nextTick();
      if (!isCurrent()) throw new FormValidationSupersededError();
    }
  } catch (error) {
    result.rollback();
    if (isFormValidationSupersededError(error) || !isCurrent()) {
      throw new FormValidationSupersededError();
    }
    throw error;
  }
  result.release();

  if (result.errors.length) {
    if (!silent && props.scrollToError) {
      scrollToField(result.errors[0].field, isCurrent);
    }
    return Promise.reject(result.errors);
  }
}

/** Restore registered fields to their mount-time values and clear validation state. */
function resetFields(fieldNames?: string[]) {
  invalidateValidation(fieldNames);
  resolveTargetFormFields(fields, fieldNames).forEach(field => field.reset(fieldNames));
  emit('reset', fieldNames);
}

/** Clear validation state without changing field values. */
function clearValidate(fieldNames?: string[]) {
  invalidateValidation(fieldNames);
  resolveTargetFormFields(fields, fieldNames).forEach(field => {
    field.invalidateValidation();
    field.setValidateStatus('idle');
  });
  emit('clear-validate', fieldNames);
}

async function runOwnedFieldValidation(
  field: FormItemContext,
  prop: string,
  generation: number,
  trigger?: 'blur' | 'change',
  owner?: FormFieldInteractionOwner
): Promise<{ skipped: boolean; errors: ValidateError[] }> {
  let errors: ValidateError[] = [];
  let result: 'validated' | 'skipped' | 'stale';

  try {
    result = await field.validateGeneration(generation, trigger, {
      fields: [prop],
      silent: true,
      isCurrent: owner?.isCurrent,
    });
  } catch (error) {
    if (!field.isValidationCurrent(generation) || isFormValidationSupersededError(error)) {
      throw new FormValidationSupersededError();
    }
    errors = normalizeValidateErrors(error);
    result = 'validated';
  }

  if (
    !field.isValidationCurrent(generation) ||
    owner?.isCurrent() === false ||
    result === 'stale'
  ) {
    field.rollbackValidation(generation);
    throw new FormValidationSupersededError();
  }
  if (result === 'skipped') {
    field.rollbackValidation(generation);
    return { skipped: true, errors };
  }

  const commitToken = field.commitValidation(generation, errors);
  if (
    commitToken === undefined ||
    !field.isValidationCurrent(generation) ||
    owner?.isCurrent() === false
  ) {
    if (commitToken !== undefined) field.rollbackValidation(generation, commitToken);
    throw new FormValidationSupersededError();
  }

  try {
    emit('validate-field', prop, errors.length === 0, errors.length ? errors : null);
    const sourceCurrent = owner ? await owner.awaitCurrent() : (await nextTick(), true);
    if (!sourceCurrent || !field.isValidationCurrent(generation)) {
      throw new FormValidationSupersededError();
    }
  } catch (error) {
    field.rollbackValidation(generation, commitToken);
    if (isFormValidationSupersededError(error) || !field.isValidationCurrent(generation)) {
      throw new FormValidationSupersededError();
    }
    throw error;
  }

  field.releaseValidation(commitToken);
  return { skipped: false, errors };
}

async function validateFromField(
  prop: string,
  trigger: 'blur' | 'change',
  owner?: FormFieldInteractionOwner
) {
  if (owner?.isCurrent() === false) return;
  const field = findFieldByProp(prop);
  if (!field) return;
  const generation = field.beginValidation();
  await runOwnedFieldValidation(field, prop, generation, trigger, owner).catch(() => undefined);
}

async function emitFieldBlur(prop: string, owner?: FormFieldInteractionOwner) {
  if (props.disabled || owner?.isCurrent() === false) return;
  emit('field-blur', prop);
  const sourceCurrent = owner ? await owner.awaitCurrent() : (await nextTick(), true);
  if (props.disabled || !sourceCurrent) return;
  await validateFromField(prop, 'blur', owner);
}

async function emitFieldChange(prop: string, value?: unknown, owner?: FormFieldInteractionOwner) {
  if (props.disabled || owner?.isCurrent() === false) return;
  emit('field-change', prop, value);
  const sourceCurrent = owner ? await owner.awaitCurrent() : (await nextTick(), true);
  if (props.disabled || !sourceCurrent) return;
  await validateFromField(prop, 'change', owner);
}

async function validateField(prop: string) {
  const field = findFieldByProp(prop);
  if (!field) return;
  const generation = field.beginValidation();
  const result = await runOwnedFieldValidation(field, prop, generation);
  if (!result.skipped && result.errors.length) return Promise.reject(result.errors);
}

function scrollToField(prop: string, isCurrent: () => boolean = () => true) {
  function ownsScroll() {
    return formActive && isCurrent();
  }
  if (!ownsScroll()) return;
  const field = findFieldByProp(prop);
  if (field?.getBoundingClientRect) {
    field.getBoundingClientRect().then(node => {
      if (node?.top != null && ownsScroll()) {
        scrollPageToRectTop(node.top, node.height, ownsScroll);
      }
    });
  }
}

function scrollPageToRectTop(top: number, height?: number, isCurrent: () => boolean = () => true) {
  if (!isCurrent()) return;
  const query = uni.createSelectorQuery();
  applyViewportScrollOffset(query);
  query.exec(results => {
    if (!isCurrent()) return;
    const scroll = results?.[0] as { scrollTop?: number } | undefined;
    const currentScrollTop = typeof scroll?.scrollTop === 'number' ? scroll.scrollTop : 0;
    const blockOffset = getScrollBlockOffset(height);

    if (!isCurrent()) return;
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
    // Fall back to a small top offset when system information is unavailable.
  }
  return 20;
}

const classes = computed(() => [
  ...resolveFormClass({
    border: props.border,
    card: props.card,
    disabled: props.disabled,
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
  disabled: props.disabled,
  border: props.border,
  card: props.card,
  customValidator: props.customValidator,
  asteriskPosition: props.asteriskPosition,
  addField,
  removeField,
  invalidateValidation,
  validateField,
  emitFieldBlur,
  emitFieldChange,
  validate,
  resetFields,
  clearValidate,
  scrollToField,
});

watchEffect(
  () => {
    formContext.model = props.model;
    formContext.rules = props.rules;
    formContext.labelWidth = props.labelWidth;
    formContext.labelAlign = props.labelAlign;
    formContext.showMessage = props.showMessage;
    formContext.disabled = props.disabled;
    formContext.border = props.border;
    formContext.card = props.card;
    formContext.customValidator = props.customValidator;
    formContext.asteriskPosition = props.asteriskPosition;
  },
  { flush: 'sync' }
);

watch([() => props.customValidator, () => props.disabled], invalidateFormState, { flush: 'sync' });

onBeforeUnmount(() => {
  formActive = false;
  invalidateFormState();
  fieldModelStops.forEach(stop => stop());
  fieldModelStops.clear();
});

provide(formContextKey, formContext);
// A nested Form is an ownership boundary; do not inherit an outer FormItem.
provide(formItemContextKey, null);

defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
});
</script>

<template>
  <view
    :id="id"
    :class="classes"
    :style="style"
    :data-lk-form="true"
    :data-disabled="disabled ? 'true' : 'false'"
    :aria-disabled="disabled"
  >
    <slot />
  </view>
</template>

<style lang="scss">
@use './lk-form.scss';
</style>
