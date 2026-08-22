import { computed, inject, nextTick, onBeforeUnmount, watch } from 'vue';
import { formContextKey, formItemContextKey } from './context';
import { resolveFormControlProp } from './form.utils';

export interface UseFormFieldOptions {
  prop?: () => string;
  disabled: () => boolean;
  validateEvent?: () => boolean;
  inheritFormItemProp?: boolean;
  /** Editing locks (for example readonly) invalidate an in-flight user chain without styling disabled. */
  interactionLocked?: () => boolean;
}

/**
 * Connect a form control to its nearest Form/FormItem pair.
 * FormItem prop inheritance is opt-in so existing controls keep their explicit-prop contract.
 */
export function useFormField(options: UseFormFieldOptions) {
  const disabledState = useFormDisabled(
    options.disabled,
    () => options.disabled() || options.interactionLocked?.() === true
  );
  const form = disabledState.form;
  const formItem = inject(formItemContextKey, null);

  const prop = computed(() =>
    resolveFormControlProp(
      options.prop?.() || '',
      options.inheritFormItemProp ? formItem?.prop : undefined
    )
  );
  // A pending interaction belongs to the field identity captured at its entrypoint.
  // Rebinding either an explicit prop or an inherited FormItem prop supersedes it.
  watch(prop, () => disabledState.invalidateInteraction(), { flush: 'sync' });
  const disabled = disabledState.disabled;
  const validateEvent = computed(() => options.validateEvent?.() !== false);
  const hasError = computed(() => formItem?.validateStatus?.value === 'error');

  async function emitChange(value?: unknown, interaction = disabledState.captureInteraction()) {
    if (disabled.value || !validateEvent.value || !prop.value) return;
    const fieldProp = prop.value;
    if (!disabledState.isInteractionCurrent(interaction)) return;
    await form?.emitFieldChange(fieldProp, value, {
      isCurrent: () => disabledState.isInteractionCurrent(interaction),
      awaitCurrent: () => disabledState.awaitInteractionCurrent(interaction),
    });
  }

  async function emitBlur(interaction = disabledState.captureInteraction()) {
    if (disabled.value || !validateEvent.value || !prop.value) return;
    const fieldProp = prop.value;
    if (!disabledState.isInteractionCurrent(interaction)) return;
    await form?.emitFieldBlur(fieldProp, {
      isCurrent: () => disabledState.isInteractionCurrent(interaction),
      awaitCurrent: () => disabledState.awaitInteractionCurrent(interaction),
    });
  }

  return {
    awaitInteractionCurrent: disabledState.awaitInteractionCurrent,
    captureInteraction: disabledState.captureInteraction,
    disabled,
    emitBlur,
    emitChange,
    form,
    formItem,
    hasError,
    isInteractionCurrent: disabledState.isInteractionCurrent,
    prop,
  };
}

export function useFormDisabled(
  disabledSource: () => boolean,
  interactionLockedSource: () => boolean = disabledSource
) {
  const form = inject(formContextKey, null);
  const disabled = computed(() => disabledSource() || !!form?.disabled);
  let interactionGeneration = 0;
  let active = true;

  watch([interactionLockedSource, () => !!form?.disabled], () => (interactionGeneration += 1), {
    flush: 'sync',
  });

  onBeforeUnmount(() => {
    active = false;
    interactionGeneration += 1;
  });

  function captureInteraction() {
    return interactionGeneration;
  }

  function invalidateInteraction() {
    interactionGeneration += 1;
  }

  function isInteractionCurrent(generation: number) {
    return (
      active &&
      generation === interactionGeneration &&
      !interactionLockedSource() &&
      !form?.disabled
    );
  }

  /**
   * Let a public event listener's parent-state proposal reach the real Form props before
   * continuing a multi-stage interaction. A same-stack true -> false pulse is intentionally
   * not observable; only the state delivered by Vue's next render edge is authoritative.
   */
  async function awaitInteractionCurrent(generation: number) {
    await nextTick();
    return isInteractionCurrent(generation);
  }

  /**
   * Observe one Vue delivery edge without treating Form.disabled as a cancellation signal.
   * This is reserved for close/cancel flows that must remain available while disabled.
   */
  async function awaitActive() {
    await nextTick();
    return active;
  }

  return {
    awaitActive,
    awaitInteractionCurrent,
    captureInteraction,
    disabled,
    form,
    invalidateInteraction,
    isInteractionCurrent,
  };
}
