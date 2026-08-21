/* eslint-disable vue/one-component-per-file */
import { describe, expect, it, vi } from 'vitest';
import {
  createRenderer,
  defineComponent,
  h,
  nextTick,
  provide,
  reactive,
  readonly,
  ref,
} from 'vue';
import type {
  FormContext,
  FormItemContext,
} from '../../src/uni_modules/lucky-ui/components/lk-form/context';
import {
  formContextKey,
  formItemContextKey,
} from '../../src/uni_modules/lucky-ui/components/lk-form/context';
import { useFormField } from '../../src/uni_modules/lucky-ui/components/lk-form/useFormField';

type TestNode = Record<string, unknown>;

const testRenderer = createRenderer<TestNode, TestNode>({
  patchProp() {},
  insert() {},
  remove() {},
  createElement() {
    return {};
  },
  createText() {
    return {};
  },
  createComment() {
    return {};
  },
  setText() {},
  setElementText() {},
  parentNode() {
    return null;
  },
  nextSibling() {
    return null;
  },
});

describe('useFormField', () => {
  it('inherits FormItem prop, merges disabled state and gates validation events', async () => {
    const emitFieldBlur = vi.fn();
    const emitFieldChange = vi.fn();
    const ownDisabled = ref(false);
    const explicitProp = ref('');
    const validateEvent = ref(true);
    const validateStatus = ref<'idle' | 'validating' | 'success' | 'error'>('error');
    let bridge: ReturnType<typeof useFormField> | undefined;

    const form = reactive({
      model: { title: '' },
      rules: undefined,
      showMessage: true,
      disabled: false,
      addField: vi.fn(),
      removeField: vi.fn(),
      invalidateValidation: vi.fn(),
      validateField: vi.fn(),
      emitFieldBlur,
      emitFieldChange,
      validate: vi.fn(),
      resetFields: vi.fn(),
      clearValidate: vi.fn(),
      scrollToField: vi.fn(),
    }) as unknown as FormContext;
    const formItem: FormItemContext = {
      prop: 'title',
      validateStatus: readonly(validateStatus),
      setValidateStatus: vi.fn(),
      beginValidation: () => 1,
      isValidationCurrent: () => true,
      captureValidationGeneration: () => 1,
      commitValidation: () => 1,
      rollbackValidation: vi.fn(),
      getValidationProps: () => ['title'],
      invalidateValidation: vi.fn(),
      validate: async () => 'validated',
      reset: vi.fn(),
    };

    const Child = defineComponent({
      setup() {
        bridge = useFormField({
          prop: () => explicitProp.value,
          disabled: () => ownDisabled.value,
          validateEvent: () => validateEvent.value,
          inheritFormItemProp: true,
        });
        return () => null;
      },
    });
    const App = defineComponent({
      setup() {
        provide(formContextKey, form);
        provide(formItemContextKey, formItem);
        return () => h(Child);
      },
    });
    const app = testRenderer.createApp(App);
    app.mount({});

    expect(bridge?.prop.value).toBe('title');
    expect(bridge?.hasError.value).toBe(true);
    bridge?.emitChange('first');
    bridge?.emitBlur();
    expect(emitFieldChange).toHaveBeenCalledOnce();
    expect(emitFieldChange).toHaveBeenLastCalledWith(
      'title',
      'first',
      expect.objectContaining({
        isCurrent: expect.any(Function),
        awaitCurrent: expect.any(Function),
      })
    );
    expect(emitFieldBlur).toHaveBeenCalledOnce();
    expect(emitFieldBlur).toHaveBeenLastCalledWith(
      'title',
      expect.objectContaining({
        isCurrent: expect.any(Function),
        awaitCurrent: expect.any(Function),
      })
    );

    ownDisabled.value = true;
    await nextTick();
    bridge?.emitChange('blocked-own');
    ownDisabled.value = false;
    form.disabled = true;
    await nextTick();
    bridge?.emitChange('blocked-form');
    expect(emitFieldChange).toHaveBeenCalledOnce();

    form.disabled = false;
    validateEvent.value = false;
    await nextTick();
    bridge?.emitChange('blocked-validation');
    expect(emitFieldChange).toHaveBeenCalledOnce();

    validateEvent.value = true;
    explicitProp.value = 'explicit';
    await nextTick();
    bridge?.emitChange('second');
    expect(emitFieldChange).toHaveBeenCalledTimes(2);
    expect(emitFieldChange).toHaveBeenLastCalledWith(
      'explicit',
      'second',
      expect.objectContaining({
        isCurrent: expect.any(Function),
        awaitCurrent: expect.any(Function),
      })
    );

    app.unmount();
  });

  it('keeps FormItem prop inheritance opt-in and invalidates separately delivered disabled edges', async () => {
    const emitFieldChange = vi.fn();
    const ownDisabled = ref(false);
    let bridge: ReturnType<typeof useFormField> | undefined;
    const form = reactive({
      model: { title: '' },
      showMessage: true,
      disabled: false,
      addField: vi.fn(),
      removeField: vi.fn(),
      invalidateValidation: vi.fn(),
      validateField: vi.fn(),
      emitFieldBlur: vi.fn(),
      emitFieldChange,
      validate: vi.fn(),
      resetFields: vi.fn(),
      clearValidate: vi.fn(),
      scrollToField: vi.fn(),
    }) as unknown as FormContext;
    const formItem = { prop: 'title' } as FormItemContext;
    const Child = defineComponent({
      setup() {
        bridge = useFormField({
          disabled: () => ownDisabled.value,
        });
        return () => null;
      },
    });
    const App = defineComponent({
      setup() {
        provide(formContextKey, form);
        provide(formItemContextKey, formItem);
        return () => h(Child);
      },
    });
    const app = testRenderer.createApp(App);
    app.mount({});

    expect(bridge?.prop.value).toBeUndefined();
    bridge?.emitChange('no-implicit-validation');
    expect(emitFieldChange).not.toHaveBeenCalled();

    const interaction = bridge?.captureInteraction();
    form.disabled = true;
    await nextTick();
    expect(bridge?.disabled.value).toBe(true);
    form.disabled = false;
    await nextTick();
    expect(bridge?.disabled.value).toBe(false);
    expect(bridge?.isInteractionCurrent(interaction as number)).toBe(false);

    app.unmount();
  });
});
