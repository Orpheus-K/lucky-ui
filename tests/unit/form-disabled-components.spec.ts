// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRenderer, defineComponent, h, nextTick, provide, reactive, ref } from 'vue';
import type { Component } from 'vue';
import type { FormContext } from '../../src/uni_modules/lucky-ui/components/lk-form/context';
import { formContextKey } from '../../src/uni_modules/lucky-ui/components/lk-form/context';
import LkCalendar from '../../src/uni_modules/lucky-ui/components/lk-calendar/lk-calendar.vue';
import LkCalendarPicker from '../../src/uni_modules/lucky-ui/components/lk-calendar-picker/lk-calendar-picker.vue';
import LkCheckbox from '../../src/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox.vue';
import LkCheckboxGroup from '../../src/uni_modules/lucky-ui/components/lk-checkbox/lk-checkbox-group.vue';
import LkForm from '../../src/uni_modules/lucky-ui/components/lk-form/lk-form.vue';
import LkFormItem from '../../src/uni_modules/lucky-ui/components/lk-form/lk-form-item.vue';
import LkInput from '../../src/uni_modules/lucky-ui/components/lk-input/lk-input.vue';
import LkKeyboard from '../../src/uni_modules/lucky-ui/components/lk-keyboard/lk-keyboard.vue';
import LkPicker from '../../src/uni_modules/lucky-ui/components/lk-picker/lk-picker.vue';
import LkRadio from '../../src/uni_modules/lucky-ui/components/lk-radio/lk-radio.vue';
import LkRadioGroup from '../../src/uni_modules/lucky-ui/components/lk-radio/lk-radio-group.vue';
import LkRate from '../../src/uni_modules/lucky-ui/components/lk-rate/lk-rate.vue';
import LkSelectList from '../../src/uni_modules/lucky-ui/components/lk-select-list/lk-select-list.vue';
import LkSlider from '../../src/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkStepper from '../../src/uni_modules/lucky-ui/components/lk-stepper/lk-stepper.vue';
import LkSwitch from '../../src/uni_modules/lucky-ui/components/lk-switch/lk-switch.vue';
import LkTextarea from '../../src/uni_modules/lucky-ui/components/lk-textarea/lk-textarea.vue';
import LkUpload from '../../src/uni_modules/lucky-ui/components/lk-upload/lk-upload.vue';
import type { UploadFile } from '../../src/uni_modules/lucky-ui/components/lk-upload/upload.props';
import LkVerifyCode from '../../src/uni_modules/lucky-ui/components/lk-verify-code/lk-verify-code.vue';

type TestNode = {
  type: string;
  props: Record<string, unknown>;
  children: TestNode[];
  parent: TestNode | null;
  text?: string;
};

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>(nextResolve => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

async function flushTicks(count = 6) {
  for (let index = 0; index < count; index += 1) await nextTick();
}

function createNode(type: string, text?: string): TestNode {
  return { type, props: {}, children: [], parent: null, text };
}

const renderer = createRenderer<TestNode, TestNode>({
  patchProp(node, key, _previous, value) {
    node.props[key] = value;
  },
  insert(child, parent, anchor) {
    child.parent = parent;
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    if (index < 0) parent.children.push(child);
    else parent.children.splice(index, 0, child);
  },
  remove(child) {
    const index = child.parent?.children.indexOf(child) ?? -1;
    if (index >= 0) child.parent?.children.splice(index, 1);
  },
  createElement(type) {
    return createNode(type);
  },
  createText(text) {
    return createNode('text', text);
  },
  createComment(text) {
    return createNode('comment', text);
  },
  setText(node, text) {
    node.text = text;
  },
  setElementText(node, text) {
    node.children = [createNode('text', text)];
    node.children[0].parent = node;
  },
  parentNode(node) {
    return node.parent;
  },
  nextSibling(node) {
    const index = node.parent?.children.indexOf(node) ?? -1;
    return index >= 0 ? node.parent?.children[index + 1] || null : null;
  },
});

function makeForm(): FormContext {
  return reactive({
    model: {},
    rules: undefined,
    showMessage: true,
    disabled: false,
    addField: vi.fn(),
    removeField: vi.fn(),
    invalidateValidation: vi.fn(),
    validateField: vi.fn(),
    emitFieldBlur: vi.fn(),
    emitFieldChange: vi.fn(),
    validate: vi.fn(),
    resetFields: vi.fn(),
    clearValidate: vi.fn(),
    scrollToField: vi.fn(),
  }) as unknown as FormContext;
}

function hasClass(node: TestNode, className: string): boolean {
  const value = node.props.class;
  return typeof value === 'string' && value.split(/\s+/).includes(className);
}

function findNode(root: TestNode, predicate: (node: TestNode) => boolean): TestNode {
  if (predicate(root)) return root;
  for (const child of root.children) {
    try {
      return findNode(child, predicate);
    } catch {
      // Continue searching sibling branches.
    }
  }
  throw new Error('Expected rendered node was not found');
}

function findNodes(root: TestNode, predicate: (node: TestNode) => boolean): TestNode[] {
  return [root, ...root.children.flatMap(child => findNodes(child, predicate))].filter(predicate);
}

function dispatch(node: TestNode, event: string, ...args: unknown[]) {
  const handler = node.props[event];
  if (Array.isArray(handler)) {
    return Promise.all(handler.map(item => (item as (...values: unknown[]) => unknown)(...args)));
  }
  return (handler as (...values: unknown[]) => unknown)(...args);
}

function mountControl(
  component: Component,
  form: FormContext,
  props: Record<string, unknown> | (() => Record<string, unknown>)
) {
  const root = createNode('root');
  let exposed: Record<string, (...args: never[]) => unknown> | null = null;
  const App = defineComponent({
    setup() {
      provide(formContextKey, form);
      return () =>
        h(component, {
          ...(typeof props === 'function' ? props() : props),
          ref: (value: unknown) => {
            exposed = value as Record<string, (...args: never[]) => unknown> | null;
          },
        });
    },
  });
  const app = renderer.createApp(App);
  app.component('LkIcon', defineComponent({ name: 'LkIcon', render: () => h('lk-icon-stub') }));
  app.component(
    'LkModal',
    defineComponent({
      name: 'LkModal',
      render: () => h('lk-modal-stub'),
    })
  );
  app.mount(root);
  return {
    app,
    root,
    exposed: () => exposed,
  };
}

function mountRender(form: FormContext, render: () => ReturnType<typeof h>) {
  const root = createNode('root');
  const App = defineComponent({
    setup() {
      provide(formContextKey, form);
      return render;
    },
  });
  const app = renderer.createApp(App);
  app.component('LkIcon', defineComponent({ name: 'LkIcon', render: () => h('lk-icon-stub') }));
  app.component(
    'LkModal',
    defineComponent({
      name: 'LkModal',
      render: () => h('lk-modal-stub'),
    })
  );
  app.mount(root);
  return { app, root };
}

function mountWithRealForm(
  disabled: { value: boolean },
  renderControl: () => ReturnType<typeof h>,
  formProps: Record<string, unknown> = {}
) {
  const model = reactive({});
  return mountRender(makeForm(), () =>
    h(LkForm, { model, disabled: disabled.value, ...formProps }, { default: renderControl })
  );
}

beforeEach(() => {
  vi.useRealTimers();
  vi.stubGlobal('uni', {
    getSystemInfoSync: () => ({ windowWidth: 375, safeAreaInsets: { bottom: 0 } }),
    createSelectorQuery: () => ({
      in() {
        return this;
      },
      select() {
        return this;
      },
      boundingClientRect(callback: (value: { left: number; width: number }) => void) {
        callback({ left: 0, width: 300 });
        return this;
      },
      exec() {},
    }),
    vibrateShort: vi.fn(),
    previewImage: vi.fn(),
  });
});

describe('documented form controls inherit Form.disabled', () => {
  it('keeps disjoint field runs independent while superseding only an overlapping field', async () => {
    const firstA = deferred<boolean>();
    const secondA = deferred<boolean>();
    const resultB = deferred<boolean>();
    let aCalls = 0;
    const model = reactive({ a: 'a', b: 'b' });
    const reports: string[] = [];
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          model,
          rules: {
            a: {
              trigger: 'change',
              validator: () => {
                aCalls += 1;
                return aCalls === 1 ? firstA.promise : secondA.promise;
              },
            },
            b: { trigger: 'change', validator: () => resultB.promise },
          },
          onValidateField: (prop: string, ok: boolean) => reports.push(`${prop}:${ok}`),
        },
        {
          default: () => [
            h(LkFormItem, { prop: 'a' }, { default: () => h(LkInput, { modelValue: model.a }) }),
            h(LkFormItem, { prop: 'b' }, { default: () => h(LkInput, { modelValue: model.b }) }),
          ],
        }
      )
    );
    await nextTick();
    const inputs = findNodes(mounted.root, node => hasClass(node, 'lk-input__inner'));
    const items = findNodes(mounted.root, node => hasClass(node, 'lk-form-item'));

    const firstInputA = dispatch(inputs[0], 'onInput', { detail: { value: 'a1' } });
    const inputB = dispatch(inputs[1], 'onInput', { detail: { value: 'b1' } });
    const secondInputA = dispatch(inputs[0], 'onInput', { detail: { value: 'a2' } });
    secondA.resolve(true);
    resultB.resolve(false);
    firstA.resolve(false);
    await Promise.all([firstInputA, inputB, secondInputA]);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await nextTick();
    await nextTick();

    expect(items[0].props['data-validation-status']).toBe('success');
    expect(items[1].props['data-validation-status']).toBe('error');
    expect(reports).toEqual(['a:true', 'b:false']);
    mounted.app.unmount();
  });

  it('supersedes a stateful form validation with a newer silent run', async () => {
    const oldResult = deferred<Record<string, string> | null>();
    const silentResult = deferred<Record<string, string> | null>();
    let call = 0;
    const model = reactive({ title: 'title' });
    const validateField = vi.fn();
    const validateEvent = vi.fn();
    let formApi: { validate: (options?: { silent?: boolean }) => Promise<void> } | null = null;
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          ref: (value: unknown) => {
            formApi = value as typeof formApi;
          },
          model,
          customValidator: () => {
            call += 1;
            return call === 1 ? oldResult.promise : silentResult.promise;
          },
          onValidateField: validateField,
          onValidate: validateEvent,
        },
        { default: () => h(LkFormItem, { prop: 'title' }) }
      )
    );
    await nextTick();
    const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));
    const oldValidation = formApi?.validate() as Promise<void>;
    const silentValidation = formApi?.validate({ silent: true }) as Promise<void>;

    silentResult.resolve(null);
    await expect(silentValidation).resolves.toBeUndefined();
    oldResult.resolve({ title: 'old error' });
    await expect(oldValidation).rejects.toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
    expect(item.props['data-validation-status']).toBe('idle');
    expect(validateField).not.toHaveBeenCalled();
    expect(validateEvent).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('rolls back still-owned form commits when a validation listener starts a newer run', async () => {
    const model = reactive({ a: 'a', b: 'b' });
    let formApi: {
      validate: () => Promise<void>;
      validateField: (prop: string) => Promise<void>;
    } | null = null;
    const reports: string[] = [];
    let nested: Promise<void> | undefined;
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          ref: (value: unknown) => {
            formApi = value as typeof formApi;
          },
          model,
          rules: { a: { required: true }, b: { required: true } },
          onValidateField: (prop: string) => {
            reports.push(prop);
            if (prop === 'a' && !nested) nested = formApi?.validateField('a');
          },
        },
        {
          default: () => [h(LkFormItem, { prop: 'a' }), h(LkFormItem, { prop: 'b' })],
        }
      )
    );
    await nextTick();
    const items = findNodes(mounted.root, node => hasClass(node, 'lk-form-item'));

    await expect(formApi?.validate()).rejects.toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
    await expect(nested).resolves.toBeUndefined();
    expect(reports).toEqual(['a', 'a']);
    expect(items[0].props['data-validation-status']).toBe('success');
    expect(items[1].props['data-validation-status']).toBe('idle');
    mounted.app.unmount();
  });

  it('validateField listener model mutation and reentry supersede the old owned commit', async () => {
    const model = reactive({ title: 'before' });
    let formApi: { validateField: (prop: string) => Promise<void> } | null = null;
    let nested: Promise<void> | undefined;
    const reports: string[] = [];
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          ref: (value: unknown) => {
            formApi = value as typeof formApi;
          },
          model,
          rules: { title: { required: true } },
          onValidateField: () => {
            reports.push(model.title);
            if (reports.length !== 1) return;
            model.title = 'after';
            nested = formApi?.validateField('title');
          },
        },
        { default: () => h(LkFormItem, { prop: 'title' }) }
      )
    );
    await nextTick();
    const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));

    const oldValidation = formApi?.validateField('title') as Promise<void>;
    await expect(oldValidation).rejects.toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
    await expect(nested).resolves.toBeUndefined();

    expect(model.title).toBe('after');
    expect(reports).toEqual(['before', 'after']);
    expect(item.props['data-validation-status']).toBe('success');
    mounted.app.unmount();
  });

  it.each(['model', 'rules', 'prop', 'disabled'] as const)(
    'real LkForm delivered %s source invalidates a pending validateField generation',
    async source => {
      const pending = deferred<boolean>();
      const validator = vi.fn(() => pending.promise);
      const model = reactive({ title: 'before', other: 'other' });
      const rules = ref({ title: { validator } });
      const fieldProp = ref('title');
      const disabled = ref(false);
      let formApi: { validateField: (prop: string) => Promise<void> } | null = null;
      const validateFieldEvent = vi.fn();
      const mounted = mountRender(makeForm(), () =>
        h(
          LkForm,
          {
            ref: (value: unknown) => {
              formApi = value as typeof formApi;
            },
            model,
            rules: rules.value,
            disabled: disabled.value,
            onValidateField: validateFieldEvent,
          },
          { default: () => h(LkFormItem, { prop: fieldProp.value }) }
        )
      );
      await nextTick();
      const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));
      const validation = formApi?.validateField('title') as Promise<void>;
      expect(validator).toHaveBeenCalledOnce();

      if (source === 'model') model.title = 'changed';
      if (source === 'rules') rules.value = { title: { validator: () => true } };
      if (source === 'prop') fieldProp.value = 'other';
      if (source === 'disabled') disabled.value = true;
      await nextTick();
      pending.resolve(true);

      await expect(validation).rejects.toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
      expect(validateFieldEvent).not.toHaveBeenCalled();
      expect(item.props['data-validation-status']).toBe('idle');
      mounted.app.unmount();
    }
  );

  it('validateField listener delivered Form.disabled -> old promise rejects and owned commit rolls back', async () => {
    const disabled = ref(false);
    const model = reactive({ title: 'valid' });
    let formApi: { validateField: (prop: string) => Promise<void> } | null = null;
    const validateFieldEvent = vi.fn(() => {
      disabled.value = true;
    });
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          ref: (value: unknown) => {
            formApi = value as typeof formApi;
          },
          model,
          disabled: disabled.value,
          rules: { title: { required: true } },
          onValidateField: validateFieldEvent,
        },
        { default: () => h(LkFormItem, { prop: 'title' }) }
      )
    );
    await nextTick();
    const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));

    await expect(formApi?.validateField('title')).rejects.toMatchObject({
      code: 'FORM_VALIDATION_SUPERSEDED',
    });

    expect(validateFieldEvent).toHaveBeenCalledOnce();
    await nextTick();
    await Promise.resolve();
    expect(item.props['data-validation-status']).toBe('idle');
    expect(
      findNode(mounted.root, node => node.props['data-lk-form'] === true).props['data-disabled']
    ).toBe('true');
    mounted.app.unmount();
  });

  it('validate listener delivered Form.disabled -> form promise rejects and all owned commits roll back', async () => {
    const disabled = ref(false);
    const model = reactive({ title: 'valid' });
    let formApi: { validate: () => Promise<void> } | null = null;
    const validateEvent = vi.fn(() => {
      disabled.value = true;
    });
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          ref: (value: unknown) => {
            formApi = value as typeof formApi;
          },
          model,
          disabled: disabled.value,
          rules: { title: { required: true } },
          onValidate: validateEvent,
        },
        { default: () => h(LkFormItem, { prop: 'title' }) }
      )
    );
    await nextTick();
    const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));

    await expect(formApi?.validate()).rejects.toMatchObject({
      code: 'FORM_VALIDATION_SUPERSEDED',
    });

    expect(validateEvent).toHaveBeenCalledOnce();
    expect(item.props['data-validation-status']).toBe('idle');
    expect(
      findNode(mounted.root, node => node.props['data-lk-form'] === true).props['data-disabled']
    ).toBe('true');
    mounted.app.unmount();
  });

  it('automatic validate-field listener delivered Form.disabled -> owned commit rolls back', async () => {
    const disabled = ref(false);
    const model = reactive({ title: 'before' });
    const validateFieldEvent = vi.fn(() => {
      disabled.value = true;
    });
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          model,
          disabled: disabled.value,
          rules: { title: { trigger: 'change', validator: () => true } },
          onValidateField: validateFieldEvent,
        },
        {
          default: () =>
            h(
              LkFormItem,
              { prop: 'title' },
              {
                default: () =>
                  h(LkInput, {
                    modelValue: model.title,
                    'onUpdate:modelValue': (value: string) => {
                      model.title = value;
                    },
                  }),
              }
            ),
        }
      )
    );
    await nextTick();
    const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-input__inner')),
      'onInput',
      { detail: { value: 'typed' } }
    );
    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(validateFieldEvent).toHaveBeenCalledOnce();
    await nextTick();
    await Promise.resolve();
    expect(item.props['data-validation-status']).toBe('idle');
    mounted.app.unmount();
  });

  it('field-change listener delivered Form.disabled -> automatic validator never starts', async () => {
    const disabled = ref(false);
    const model = reactive({ title: 'before' });
    const validator = vi.fn(() => true);
    const validateFieldEvent = vi.fn();
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          model,
          disabled: disabled.value,
          rules: { title: { trigger: 'change', validator } },
          onFieldChange: () => {
            disabled.value = true;
          },
          onValidateField: validateFieldEvent,
        },
        {
          default: () =>
            h(
              LkFormItem,
              { prop: 'title' },
              {
                default: () =>
                  h(LkInput, {
                    modelValue: model.title,
                    'onUpdate:modelValue': (value: string) => {
                      model.title = value;
                    },
                  }),
              }
            ),
        }
      )
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-input__inner')),
      'onInput',
      { detail: { value: 'typed' } }
    );
    await nextTick();
    await Promise.resolve();

    expect(validator).not.toHaveBeenCalled();
    expect(validateFieldEvent).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('automatic field validation listener model mutation rolls its still-owned commit back', async () => {
    const model = reactive({ title: 'before' });
    const reports: string[] = [];
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          model,
          rules: { title: { trigger: 'change', validator: () => true } },
          onValidateField: () => {
            reports.push(model.title);
            model.title = 'listener-mutated';
          },
        },
        {
          default: () =>
            h(
              LkFormItem,
              { prop: 'title' },
              {
                default: () =>
                  h(LkInput, {
                    modelValue: model.title,
                    'onUpdate:modelValue': (value: string) => {
                      model.title = value;
                    },
                  }),
              }
            ),
        }
      )
    );
    await nextTick();
    const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-input__inner')),
      'onInput',
      {
        detail: { value: 'typed' },
      }
    );
    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(reports).toEqual(['typed']);
    await nextTick();
    await Promise.resolve();
    expect(model.title).toBe('listener-mutated');
    expect(item.props['data-validation-status']).toBe('idle');
    mounted.app.unmount();
  });

  it.each(['disabled', 'reset'] as const)(
    'validate-field reentry -> %s keeps the accepted idle lineage for both superseded runs',
    async scenario => {
      const disabled = ref(false);
      const later = deferred<boolean>();
      const model = reactive({ title: 'value' });
      let validatorCalls = 0;
      let formApi: {
        validateField: (prop: string) => Promise<void>;
        resetFields: (fields?: string[]) => void;
      } | null = null;
      let secondRun: Promise<void> | undefined;
      const reports = vi.fn(() => {
        if (secondRun) return;
        secondRun = formApi?.validateField('title');
        if (scenario === 'disabled') disabled.value = true;
        else formApi?.resetFields(['title']);
      });
      const mounted = mountRender(makeForm(), () =>
        h(
          LkForm,
          {
            ref: (value: unknown) => {
              formApi = value as typeof formApi;
            },
            model,
            disabled: disabled.value,
            rules: {
              title: {
                validator: () => {
                  validatorCalls += 1;
                  return validatorCalls === 1 ? true : later.promise;
                },
              },
            },
            onValidateField: reports,
          },
          { default: () => h(LkFormItem, { prop: 'title' }) }
        )
      );
      await nextTick();
      const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));

      const firstRun = formApi?.validateField('title') as Promise<void>;
      await flushTicks(2);
      expect(secondRun).toBeDefined();
      later.resolve(true);
      const [firstResult, secondResult] = await Promise.allSettled([firstRun, secondRun!]);
      await flushTicks();

      expect(firstResult.status).toBe('rejected');
      expect(secondResult.status).toBe('rejected');
      if (firstResult.status === 'rejected') {
        expect(firstResult.reason).toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
      }
      if (secondResult.status === 'rejected') {
        expect(secondResult.reason).toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
      }
      expect(reports).toHaveBeenCalledOnce();
      expect(item.props['data-validation-status']).toBe('idle');
      expect(item.props['data-validation-message']).toBe('');
      mounted.app.unmount();
    }
  );

  it.each(['change', 'blur'] as const)(
    'automatic %s validation stops before rules when its source Input unmounts from the field event',
    async trigger => {
      const showInput = ref(true);
      const model = reactive({ title: 'before' });
      const validator = vi.fn(() => true);
      const validateField = vi.fn();
      const mounted = mountRender(makeForm(), () =>
        h(
          LkForm,
          {
            model,
            rules: { title: { trigger, validator } },
            onFieldChange: trigger === 'change' ? () => (showInput.value = false) : undefined,
            onFieldBlur: trigger === 'blur' ? () => (showInput.value = false) : undefined,
            onValidateField: validateField,
          },
          {
            default: () =>
              h(
                LkFormItem,
                { prop: 'title' },
                {
                  default: () =>
                    showInput.value
                      ? h(LkInput, {
                          modelValue: model.title,
                          'onUpdate:modelValue': (value: string) => (model.title = value),
                        })
                      : null,
                }
              ),
          }
        )
      );
      await nextTick();
      const input = findNode(mounted.root, node => hasClass(node, 'lk-input__inner'));

      if (trigger === 'change') {
        await dispatch(input, 'onInput', { detail: { value: 'typed' } });
      } else {
        await dispatch(input, 'onBlur', { detail: { value: 'before' } });
      }
      await flushTicks();

      expect(showInput.value).toBe(false);
      expect(validator).not.toHaveBeenCalled();
      expect(validateField).not.toHaveBeenCalled();
      const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));
      expect(item.props['data-validation-status']).toBe('idle');
      mounted.app.unmount();
    }
  );

  it('automatic change validation rolls back when only its source Input unmounts while rules await', async () => {
    const showInput = ref(true);
    const pending = deferred<boolean>();
    const model = reactive({ title: 'before' });
    const validator = vi.fn(() => pending.promise);
    const laterRule = vi.fn(() => true);
    const validateField = vi.fn();
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          model,
          rules: {
            title: [
              { trigger: 'change', validator },
              { trigger: 'change', validator: laterRule },
            ],
          },
          onValidateField: validateField,
        },
        {
          default: () =>
            h(
              LkFormItem,
              { prop: 'title' },
              {
                default: () =>
                  showInput.value
                    ? h(LkInput, {
                        modelValue: model.title,
                        'onUpdate:modelValue': (value: string) => (model.title = value),
                      })
                    : null,
              }
            ),
        }
      )
    );
    await nextTick();
    const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));
    const interaction = dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-input__inner')),
      'onInput',
      { detail: { value: 'typed' } }
    );
    await flushTicks(8);
    expect(validator).toHaveBeenCalledOnce();
    expect(item.props['data-validation-status']).toBe('validating');

    showInput.value = false;
    await nextTick();
    pending.resolve(true);
    await interaction;
    await flushTicks();

    expect(validateField).not.toHaveBeenCalled();
    expect(laterRule).not.toHaveBeenCalled();
    expect(item.props['data-validation-status']).toBe('idle');
    mounted.app.unmount();
  });

  it.each(['disabled', 'reset', 'unmount'] as const)(
    'validation rule 1 pending -> %s prevents rule 2 side effects',
    async scenario => {
      const disabled = ref(false);
      const showItem = ref(true);
      const firstRule = deferred<boolean>();
      const secondRule = vi.fn(() => true);
      const model = reactive({ title: 'value' });
      let formApi: {
        validateField: (prop: string) => Promise<void>;
        resetFields: () => void;
      } | null = null;
      const mounted = mountRender(makeForm(), () =>
        h(
          LkForm,
          {
            ref: (value: unknown) => {
              formApi = value as typeof formApi;
            },
            model,
            disabled: disabled.value,
            rules: {
              title: [{ validator: () => firstRule.promise }, { validator: secondRule }],
            },
          },
          { default: () => (showItem.value ? h(LkFormItem, { prop: 'title' }) : null) }
        )
      );
      await nextTick();

      const run = formApi?.validateField('title') as Promise<void>;
      await flushTicks(2);
      if (scenario === 'disabled') disabled.value = true;
      else if (scenario === 'reset') formApi?.resetFields();
      else showItem.value = false;
      await nextTick();
      firstRule.resolve(true);
      await expect(run).rejects.toMatchObject({ code: 'FORM_VALIDATION_SUPERSEDED' });
      await flushTicks();

      expect(secondRule).not.toHaveBeenCalled();
      mounted.app.unmount();
    }
  );

  it('validation rule 1 synchronously mutates the model generation -> rule 2 never starts', async () => {
    const model = reactive({ title: 'value' });
    let formApi: { validateField: (prop: string) => Promise<void> } | null = null;
    const secondRule = vi.fn(() => true);
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          ref: (value: unknown) => {
            formApi = value as typeof formApi;
          },
          model,
          rules: {
            title: [
              {
                validator: () => {
                  model.title = 'mutated';
                  return true;
                },
              },
              { validator: secondRule },
            ],
          },
        },
        { default: () => h(LkFormItem, { prop: 'title' }) }
      )
    );
    await nextTick();

    await expect(formApi?.validateField('title')).rejects.toMatchObject({
      code: 'FORM_VALIDATION_SUPERSEDED',
    });
    expect(secondRule).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('suppresses a delayed mini-program scroll after validation is superseded', async () => {
    let resolveRect: ((rect: { top: number; height: number }) => void) | undefined;
    const pageScrollTo = vi.fn();
    vi.stubGlobal('uni', {
      getSystemInfoSync: () => ({ windowHeight: 800 }),
      pageScrollTo,
      createSelectorQuery: () => ({
        in() {
          return this;
        },
        select() {
          return this;
        },
        selectViewport() {
          return this;
        },
        scrollOffset() {
          return this;
        },
        boundingClientRect(callback: (rect: { top: number; height: number }) => void) {
          resolveRect = callback;
          return this;
        },
        exec() {},
      }),
    });
    const model = reactive({ title: '' });
    let formApi: { validate: () => Promise<void>; resetFields: () => void } | null = null;
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          ref: (value: unknown) => {
            formApi = value as typeof formApi;
          },
          model,
          rules: { title: [{ required: true, message: 'required' }] },
          scrollToError: true,
        },
        { default: () => h(LkFormItem, { prop: 'title' }) }
      )
    );
    await nextTick();

    await formApi?.validate().catch(() => undefined);
    expect(resolveRect).toBeTypeOf('function');
    formApi?.resetFields();
    resolveRect?.({ top: 240, height: 40 });
    await Promise.resolve();
    await nextTick();

    expect(pageScrollTo).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('manual scrollToField -> Form unmount -> delayed rect cannot reach pageScrollTo', async () => {
    let resolveRect: ((rect: { top: number; height: number }) => void) | undefined;
    const pageScrollTo = vi.fn();
    vi.stubGlobal('uni', {
      ...uni,
      getSystemInfoSync: () => ({ windowHeight: 800 }),
      pageScrollTo,
      createSelectorQuery: () => ({
        in() {
          return this;
        },
        select() {
          return this;
        },
        selectViewport() {
          return this;
        },
        scrollOffset() {
          return this;
        },
        boundingClientRect(callback: (rect: { top: number; height: number }) => void) {
          resolveRect = callback;
          return this;
        },
        exec() {},
      }),
    });
    const model = reactive({ title: '' });
    let formApi: { scrollToField: (prop: string) => void } | null = null;
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          ref: (value: unknown) => {
            formApi = value as typeof formApi;
          },
          model,
        },
        { default: () => h(LkFormItem, { prop: 'title' }) }
      )
    );
    await nextTick();

    formApi?.scrollToField('title');
    expect(resolveRect).toBeTypeOf('function');
    mounted.app.unmount();
    resolveRect?.({ top: 300, height: 40 });
    await flushTicks();

    expect(pageScrollTo).not.toHaveBeenCalled();
  });

  it.each(['disable', 'unmount'] as const)(
    'FormItem tap listener %s -> nextTick blocks the following click event',
    async scenario => {
      const disabled = ref(false);
      const showItem = ref(true);
      const tap = vi.fn(() => {
        if (scenario === 'disable') disabled.value = true;
        else showItem.value = false;
      });
      const click = vi.fn();
      const mounted = mountRender(makeForm(), () =>
        h(
          LkForm,
          { model: {}, disabled: disabled.value },
          {
            default: () =>
              showItem.value ? h(LkFormItem, { prop: 'title', onTap: tap, onClick: click }) : null,
          }
        )
      );
      await nextTick();
      const item = findNode(mounted.root, node => hasClass(node, 'lk-form-item'));

      await dispatch(item, 'onTap', { source: 'test' });
      await nextTick();

      expect(tap).toHaveBeenCalledOnce();
      expect(click).not.toHaveBeenCalled();
      mounted.app.unmount();
    }
  );

  it('FormItem enabled tap -> nextTick emits click exactly once in order', async () => {
    const order: string[] = [];
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        { model: {} },
        {
          default: () =>
            h(LkFormItem, {
              prop: 'title',
              onTap: () => order.push('tap'),
              onClick: () => order.push('click'),
            }),
        }
      )
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-form-item')),
      'onTap',
      { source: 'test' }
    );

    expect(order).toEqual(['tap', 'click']);
    mounted.app.unmount();
  });

  it('scrollToField scopes exact and duplicate props to their owning FormItem instances', async () => {
    const pageScrollTo = vi.fn();
    const scopes: unknown[] = [];
    const tops = new Map<unknown, number>();
    vi.stubGlobal('uni', {
      ...uni,
      getSystemInfoSync: () => ({ windowHeight: 800 }),
      pageScrollTo,
      createSelectorQuery: () => {
        let scope: unknown;
        return {
          in(value: unknown) {
            scope = value;
            scopes.push(value);
            if (!tops.has(value)) tops.set(value, tops.size * 1000 + 1000);
            return this;
          },
          select(selector: string) {
            expect(selector).toBe('.lk-form-item');
            return this;
          },
          boundingClientRect(callback?: (rect: { top: number; height: number }) => void) {
            if (callback && scope) callback({ top: tops.get(scope) ?? 0, height: 40 });
            return this;
          },
          selectViewport() {
            return this;
          },
          scrollOffset() {
            return this;
          },
          exec(callback?: (results: unknown[]) => void) {
            callback?.([{ scrollTop: 0 }]);
          },
        };
      },
    });
    const firstModel = reactive({ username: '', name: '' });
    const secondModel = reactive({ name: '' });
    let firstApi: { scrollToField: (prop: string) => void } | null = null;
    let secondApi: { scrollToField: (prop: string) => void } | null = null;
    const mounted = mountRender(makeForm(), () =>
      h('view', [
        h(
          LkForm,
          {
            ref: (value: unknown) => {
              firstApi = value as typeof firstApi;
            },
            model: firstModel,
          },
          {
            default: () => [h(LkFormItem, { prop: 'username' }), h(LkFormItem, { prop: 'name' })],
          }
        ),
        h(
          LkForm,
          {
            ref: (value: unknown) => {
              secondApi = value as typeof secondApi;
            },
            model: secondModel,
          },
          { default: () => h(LkFormItem, { prop: 'name' }) }
        ),
      ])
    );
    await nextTick();

    firstApi?.scrollToField('username');
    firstApi?.scrollToField('name');
    secondApi?.scrollToField('name');
    await Promise.resolve();

    expect(scopes).toHaveLength(3);
    expect(new Set(scopes).size).toBe(3);
    expect(pageScrollTo).toHaveBeenCalledTimes(3);
    const scrollTops = pageScrollTo.mock.calls.map(([options]) => options.scrollTop as number);
    expect(scrollTops[0]).toBeLessThan(scrollTops[1]);
    expect(scrollTops[1]).toBeLessThan(scrollTops[2]);
    mounted.app.unmount();
  });

  it('does not inherit an outer FormItem prop across a nested Form boundary', async () => {
    const outerModel = reactive({ outer: '' });
    const innerModel = reactive({ inner: '' });
    const outerFieldChange = vi.fn();
    const innerFieldChange = vi.fn();
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        { model: outerModel, onFieldChange: outerFieldChange },
        {
          default: () =>
            h(
              LkFormItem,
              { prop: 'outer' },
              {
                default: () =>
                  h(
                    LkForm,
                    { model: innerModel, onFieldChange: innerFieldChange },
                    { default: () => h(LkInput, { modelValue: innerModel.inner }) }
                  ),
              }
            ),
        }
      )
    );
    await nextTick();
    const control = findNode(mounted.root, node => hasClass(node, 'lk-input__inner'));
    const inputRoot = findNode(mounted.root, node => hasClass(node, 'lk-input'));

    expect(inputRoot.props['data-form-prop']).toBe('');
    dispatch(control, 'onInput', { detail: { value: 'next' } });
    expect(outerFieldChange).not.toHaveBeenCalled();
    expect(innerFieldChange).not.toHaveBeenCalled();
    expect(innerModel).not.toHaveProperty('outer');
    mounted.app.unmount();
  });

  it.each([
    {
      name: 'Checkbox',
      component: LkCheckbox,
      props: { modelValue: false, name: 'accepted' },
      selector: (node: TestNode) => node.props.role === 'checkbox',
    },
    {
      name: 'Radio',
      component: LkRadio,
      props: { modelValue: 'a', name: 'b' },
      selector: (node: TestNode) => node.props.role === 'radio',
    },
    {
      name: 'Rate',
      component: LkRate,
      props: { modelValue: 0 },
      selector: (node: TestNode) => hasClass(node, 'lk-rate__item'),
    },
    {
      name: 'Stepper',
      component: LkStepper,
      props: { modelValue: 1 },
      selector: (node: TestNode) => hasClass(node, 'lk-stepper__plus'),
    },
    {
      name: 'Slider',
      component: LkSlider,
      props: { modelValue: 10 },
      selector: (node: TestNode) => hasClass(node, 'lk-slider__track-container'),
    },
  ])('blocks $name model updates while Form is disabled', ({ component, props, selector }) => {
    const form = makeForm();
    form.disabled = true;
    const update = vi.fn();
    const change = vi.fn();
    const mounted = mountControl(component, form, {
      ...props,
      'onUpdate:modelValue': update,
      onChange: change,
    });

    dispatch(findNode(mounted.root, selector), 'onTap', {
      detail: { x: 150 },
      stopPropagation() {},
    });
    expect(update).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it.each([
    {
      name: 'Checkbox',
      component: LkCheckbox,
      field: 'accepted',
      initial: false as boolean | string,
      expected: true as boolean | string,
      controlProps: {},
      role: 'checkbox',
    },
    {
      name: 'Radio',
      component: LkRadio,
      field: 'choice',
      initial: '' as boolean | string,
      expected: 'accepted' as boolean | string,
      controlProps: { name: 'accepted' },
      role: 'radio',
    },
  ])(
    'standalone $name update/change -> Form field-change -> change-rule validation',
    async ({ component, field, initial, expected, controlProps, role }) => {
      const model = reactive<Record<string, boolean | string>>({ [field]: initial });
      const validator = vi.fn(() => true);
      const fieldChange = vi.fn();
      const validateField = vi.fn();
      const mounted = mountRender(makeForm(), () =>
        h(
          LkForm,
          {
            model,
            rules: { [field]: { trigger: 'change', validator } },
            onFieldChange: fieldChange,
            onValidateField: validateField,
          },
          {
            default: () =>
              h(
                LkFormItem,
                { prop: field },
                {
                  default: () =>
                    h(component, {
                      ...controlProps,
                      prop: field,
                      modelValue: model[field],
                      'onUpdate:modelValue': (value: boolean | string) => {
                        model[field] = value;
                      },
                    }),
                }
              ),
          }
        )
      );
      await nextTick();

      await dispatch(
        findNode(mounted.root, node => node.props.role === role),
        'onTap',
        {}
      );
      await nextTick();
      await Promise.resolve();
      await nextTick();

      expect(model[field]).toBe(expected);
      expect(fieldChange).toHaveBeenCalledWith(field, expected);
      expect(validator).toHaveBeenCalledOnce();
      expect(validateField).toHaveBeenCalledWith(field, true, null);
      mounted.app.unmount();
    }
  );

  it('Input compositionstart -> delivered readonly -> queued compositionupdate/end stay silent', async () => {
    const readonly = ref(false);
    const update = vi.fn();
    const compositionUpdate = vi.fn();
    const compositionEnd = vi.fn();
    const mounted = mountRender(makeForm(), () =>
      h(LkInput, {
        modelValue: '',
        readonly: readonly.value,
        'onUpdate:modelValue': update,
        onCompositionupdate: compositionUpdate,
        onCompositionend: compositionEnd,
      })
    );
    await nextTick();
    const control = findNode(mounted.root, node => hasClass(node, 'lk-input__inner'));

    await dispatch(control, 'onCompositionstart', { detail: { value: '' } });
    readonly.value = true;
    await nextTick();
    await dispatch(control, 'onCompositionupdate', { detail: { value: 'late' } });
    await dispatch(control, 'onCompositionend', { detail: { value: 'late' } });

    expect(compositionUpdate).not.toHaveBeenCalled();
    expect(compositionEnd).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it.each([
    { name: 'Input input', component: LkInput, controlClass: 'lk-input__inner', event: 'onInput' },
    {
      name: 'Textarea input',
      component: LkTextarea,
      controlClass: 'lk-textarea__inner',
      event: 'onInput',
    },
    { name: 'Input clear', component: LkInput, controlClass: 'lk-input__clear', event: 'onTap' },
    {
      name: 'Textarea clear',
      component: LkTextarea,
      controlClass: 'lk-textarea__clear',
      event: 'onTap',
    },
  ])('$name update listener delivers readonly -> all later business stages stop', async config => {
    const readonly = ref(false);
    const model = reactive({ value: 'seed' });
    const update = vi.fn(() => {
      readonly.value = true;
    });
    const input = vi.fn();
    const change = vi.fn();
    const clear = vi.fn();
    const fieldChange = vi.fn();
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        { model, onFieldChange: fieldChange },
        {
          default: () =>
            h(
              LkFormItem,
              { prop: 'value' },
              {
                default: () =>
                  h(config.component, {
                    modelValue: model.value,
                    readonly: readonly.value,
                    clearable: true,
                    'onUpdate:modelValue': update,
                    onInput: input,
                    onChange: change,
                    onClear: clear,
                  }),
              }
            ),
        }
      )
    );
    await nextTick();
    const control = findNode(mounted.root, node => hasClass(node, config.controlClass));

    await dispatch(
      control,
      config.event,
      config.event === 'onInput'
        ? { detail: { value: 'next' } }
        : { stopPropagation() {}, preventDefault() {} }
    );
    await flushTicks();

    expect(update).toHaveBeenCalledOnce();
    expect(input).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
    expect(fieldChange).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Input update listener rebinds FormItem a -> b and supersedes the old field chain', async () => {
    const fieldProp = ref('a');
    const model = reactive({ a: 'A', b: 'B' });
    let first = true;
    const input = vi.fn();
    const fieldChange = vi.fn();
    const validateField = vi.fn();
    const validateA = vi.fn(() => true);
    const validateB = vi.fn(() => true);
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          model,
          rules: {
            a: { trigger: 'change', validator: validateA },
            b: { trigger: 'change', validator: validateB },
          },
          onFieldChange: fieldChange,
          onValidateField: validateField,
        },
        {
          default: () =>
            h(
              LkFormItem,
              { prop: fieldProp.value },
              {
                default: () =>
                  h(LkInput, {
                    modelValue: model[fieldProp.value as 'a' | 'b'],
                    onInput: input,
                    'onUpdate:modelValue': (value: string) => {
                      model[fieldProp.value as 'a' | 'b'] = value;
                      if (first) {
                        first = false;
                        fieldProp.value = 'b';
                      }
                    },
                  }),
              }
            ),
        }
      )
    );
    await nextTick();
    const control = findNode(mounted.root, node => hasClass(node, 'lk-input__inner'));

    await dispatch(control, 'onInput', { detail: { value: 'old-a' } });
    await flushTicks();
    expect(model.a).toBe('old-a');
    expect(fieldProp.value).toBe('b');
    expect(input).not.toHaveBeenCalled();
    expect(fieldChange).not.toHaveBeenCalled();
    expect(validateA).not.toHaveBeenCalled();
    expect(validateB).not.toHaveBeenCalled();

    await dispatch(control, 'onInput', { detail: { value: 'new-b' } });
    await flushTicks();
    expect(model.b).toBe('new-b');
    expect(input).toHaveBeenCalledOnce();
    expect(fieldChange).toHaveBeenCalledWith('b', 'new-b');
    expect(validateA).not.toHaveBeenCalled();
    expect(validateB).toHaveBeenCalledOnce();
    expect(validateField).toHaveBeenCalledWith('b', true, null);
    mounted.app.unmount();
  });

  it.each([
    {
      name: 'CheckboxGroup',
      group: LkCheckboxGroup,
      child: LkCheckbox,
      modelValue: [] as string[],
      childProps: { name: 'a' },
      role: 'checkbox',
    },
    {
      name: 'RadioGroup',
      group: LkRadioGroup,
      child: LkRadio,
      modelValue: 'a',
      childProps: { name: 'b' },
      role: 'radio',
    },
  ])(
    'respects delivered child and Form disabled edges for $name',
    async ({ group, child, modelValue, childProps, role }) => {
      const form = makeForm();
      const childDisabled = ref(false);
      const reenabledUpdate = vi.fn();
      const reenabledMounted = mountRender(form, () =>
        h(
          group,
          { modelValue, 'onUpdate:modelValue': reenabledUpdate },
          {
            default: () => h(child, { ...childProps, disabled: childDisabled.value }),
          }
        )
      );
      childDisabled.value = true;
      await nextTick();
      childDisabled.value = false;
      await nextTick();
      await dispatch(
        findNode(reenabledMounted.root, node => node.props.role === role),
        'onTap',
        {}
      );
      expect(reenabledUpdate).toHaveBeenCalledOnce();
      reenabledMounted.app.unmount();

      form.disabled = true;
      const groupUpdate = vi.fn();
      const disabledMounted = mountRender(form, () =>
        h(
          group,
          { modelValue, 'onUpdate:modelValue': groupUpdate },
          { default: () => h(child, childProps) }
        )
      );
      dispatch(
        findNode(disabledMounted.root, node => node.props.role === role),
        'onTap',
        {}
      );
      expect(groupUpdate).not.toHaveBeenCalled();
      disabledMounted.app.unmount();
    }
  );

  it('stops Input input/change/Form validation after update:modelValue delivers real Form.disabled', async () => {
    const disabled = ref(false);
    const model = reactive({ title: '' });
    const sequence: string[] = [];
    const formChange = vi.fn();
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        { model, disabled: disabled.value, onFieldChange: formChange },
        {
          default: () =>
            h(
              LkFormItem,
              { prop: 'title' },
              {
                default: () =>
                  h(LkInput, {
                    modelValue: model.title,
                    'onUpdate:modelValue': (value: string) => {
                      sequence.push('update:modelValue');
                      model.title = value;
                      disabled.value = true;
                    },
                    onInput: () => sequence.push('input'),
                    onChange: () => sequence.push('change'),
                  }),
              }
            ),
        }
      )
    );
    await nextTick();
    const control = findNode(mounted.root, node => hasClass(node, 'lk-input__inner'));

    await dispatch(control, 'onInput', { detail: { value: 'next' } });
    await nextTick();

    expect(model.title).toBe('next');
    expect(sequence).toEqual(['update:modelValue']);
    expect(formChange).not.toHaveBeenCalled();
    expect(
      findNode(mounted.root, node => node.props['data-lk-form'] === true).props['data-disabled']
    ).toBe('true');
    mounted.app.unmount();
  });

  it('Input blur proposal -> nextTick real Form.disabled -> no change/Form field-blur', async () => {
    const disabled = ref(false);
    const blur = vi.fn(() => {
      disabled.value = true;
    });
    const change = vi.fn();
    const fieldBlur = vi.fn();
    const mounted = mountWithRealForm(
      disabled,
      () => h(LkInput, { modelValue: 'value', prop: 'title', onBlur: blur, onChange: change }),
      { onFieldBlur: fieldBlur }
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-input__inner')),
      'onBlur',
      { detail: { value: 'value' } }
    );
    await nextTick();

    expect(blur).toHaveBeenCalledOnce();
    expect(change).not.toHaveBeenCalled();
    expect(fieldBlur).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it.each([
    { name: 'Input', component: LkInput, controlClass: 'lk-input__inner' },
    { name: 'Textarea', component: LkTextarea, controlClass: 'lk-textarea__inner' },
  ])(
    '$name compositionstart -> delivered disable/enable -> stale compositionend cannot commit',
    async ({ component, controlClass }) => {
      const disabled = ref(false);
      const model = reactive({ value: '' });
      const update = vi.fn((value: string) => {
        model.value = value;
      });
      const input = vi.fn();
      const compositionEnd = vi.fn();
      const formChange = vi.fn();
      const mounted = mountRender(makeForm(), () =>
        h(
          LkForm,
          { model, disabled: disabled.value, onFieldChange: formChange },
          {
            default: () =>
              h(
                LkFormItem,
                { prop: 'value' },
                {
                  default: () =>
                    h(component, {
                      modelValue: model.value,
                      'onUpdate:modelValue': update,
                      onInput: input,
                      onCompositionend: compositionEnd,
                    }),
                }
              ),
          }
        )
      );
      await nextTick();
      const control = findNode(mounted.root, node => hasClass(node, controlClass));

      await dispatch(control, 'onCompositionstart', { detail: { value: '' } });
      disabled.value = true;
      await nextTick();
      disabled.value = false;
      await nextTick();
      await dispatch(control, 'onCompositionend', { detail: { value: 'stale' } });
      await nextTick();

      expect(compositionEnd).not.toHaveBeenCalled();
      expect(model.value).toBe('');
      expect(update).not.toHaveBeenCalled();
      expect(input).not.toHaveBeenCalled();
      expect(formChange).not.toHaveBeenCalled();
      mounted.app.unmount();
    }
  );

  it.each([
    { name: 'Input', component: LkInput, controlClass: 'lk-input__inner' },
    { name: 'Textarea', component: LkTextarea, controlClass: 'lk-textarea__inner' },
  ])(
    '$name Uni H5 start -> full input -> fragment end commits the cached full value once',
    async config => {
      const model = reactive({ notes: 'abc' });
      const update = vi.fn((value: string) => {
        model.notes = value;
      });
      const input = vi.fn();
      const formChange = vi.fn();
      const mounted = mountRender(makeForm(), () =>
        h(
          LkForm,
          { model, onFieldChange: formChange },
          {
            default: () =>
              h(
                LkFormItem,
                { prop: 'notes' },
                {
                  default: () =>
                    h(config.component, {
                      modelValue: model.notes,
                      'onUpdate:modelValue': update,
                      onInput: input,
                    }),
                }
              ),
          }
        )
      );
      await nextTick();
      const control = findNode(mounted.root, node => hasClass(node, config.controlClass));

      await dispatch(control, 'onCompositionstart', { detail: { value: '' } });
      await dispatch(control, 'onInput', { detail: { value: 'abc汉' } });
      expect(update).not.toHaveBeenCalled();
      expect(input).not.toHaveBeenCalled();

      await dispatch(control, 'onCompositionend', { detail: { value: '汉' } });
      await nextTick();
      await Promise.resolve();

      expect(model.notes).toBe('abc汉');
      expect(update).toHaveBeenCalledTimes(1);
      expect(input).toHaveBeenCalledTimes(1);
      expect(formChange).toHaveBeenCalledTimes(1);
      mounted.app.unmount();
    }
  );

  it.each([
    { name: 'Input', component: LkInput, controlClass: 'lk-input__inner' },
    { name: 'Textarea', component: LkTextarea, controlClass: 'lk-textarea__inner' },
  ])(
    '$name late native confirm/compositionupdate/measurement events stay silent after Form disabled',
    async ({ component, controlClass }) => {
      const disabled = ref(false);
      const confirm = vi.fn();
      const compositionUpdate = vi.fn();
      const keyboardHeightChange = vi.fn();
      const lineChange = vi.fn();
      const mounted = mountWithRealForm(disabled, () =>
        h(component, {
          modelValue: '',
          onConfirm: confirm,
          onCompositionupdate: compositionUpdate,
          onKeyboardheightchange: keyboardHeightChange,
          onLinechange: lineChange,
        })
      );
      await nextTick();
      const control = findNode(mounted.root, node => hasClass(node, controlClass));

      await dispatch(control, 'onCompositionstart', { detail: { value: '' } });
      disabled.value = true;
      await nextTick();
      await dispatch(control, 'onCompositionupdate', { detail: { value: 'late' } });
      await dispatch(control, 'onConfirm', { detail: { value: 'late' } });
      await dispatch(control, 'onKeyboardheightchange', { detail: { height: 240 } });
      if (component === LkTextarea) {
        await dispatch(control, 'onLinechange', { detail: { lineCount: 2 } });
      }

      expect(compositionUpdate).not.toHaveBeenCalled();
      expect(confirm).not.toHaveBeenCalled();
      expect(keyboardHeightChange).not.toHaveBeenCalled();
      expect(lineChange).not.toHaveBeenCalled();
      mounted.app.unmount();
    }
  );

  it('keeps readonly Input focus and blur public on H5 without committing form events', () => {
    const form = makeForm();
    const focus = vi.fn();
    const blur = vi.fn();
    const change = vi.fn();
    const mounted = mountControl(LkInput, form, {
      modelValue: 'copy me',
      readonly: true,
      prop: 'title',
      onFocus: focus,
      onBlur: blur,
      onChange: change,
    });
    const control = findNode(mounted.root, node => hasClass(node, 'lk-input__inner'));

    expect(control.props.disabled).toBe(false);
    expect(control.props.readonly).toBe(true);
    dispatch(control, 'onFocus', {});
    dispatch(control, 'onBlur', {});

    expect(focus).toHaveBeenCalledOnce();
    expect(blur).toHaveBeenCalledOnce();
    expect(change).not.toHaveBeenCalled();
    expect(form.emitFieldBlur).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it.each([
    { name: 'Input', component: LkInput, controlClass: 'lk-input__inner' },
    { name: 'Textarea', component: LkTextarea, controlClass: 'lk-textarea__inner' },
  ])(
    '$name compositionstart -> compositionend listener disables real Form -> no commit chain',
    async ({ component, controlClass }) => {
      const disabled = ref(false);
      const model = reactive({ value: '' });
      const sequence: string[] = [];
      const formChange = vi.fn();
      const mounted = mountRender(makeForm(), () =>
        h(
          LkForm,
          { model, disabled: disabled.value, onFieldChange: formChange },
          {
            default: () =>
              h(
                LkFormItem,
                { prop: 'value' },
                {
                  default: () =>
                    h(component, {
                      modelValue: model.value,
                      onCompositionend: () => {
                        sequence.push('compositionend');
                        disabled.value = true;
                      },
                      'onUpdate:modelValue': (value: string) => {
                        model.value = value;
                        sequence.push('update:modelValue');
                      },
                      onInput: () => sequence.push('input'),
                    }),
                }
              ),
          }
        )
      );
      await nextTick();
      const control = findNode(mounted.root, node => hasClass(node, controlClass));

      await dispatch(control, 'onCompositionstart', { detail: { value: '' } });
      await dispatch(control, 'onCompositionend', { detail: { value: 'blocked' } });
      await nextTick();

      expect(sequence).toEqual(['compositionend']);
      expect(model.value).toBe('');
      expect(formChange).not.toHaveBeenCalled();
      mounted.app.unmount();
    }
  );

  it('Textarea delayed blur proposal -> nextTick real Form.disabled -> no change/Form field-blur', async () => {
    vi.useFakeTimers();
    const disabled = ref(false);
    const blur = vi.fn(() => {
      disabled.value = true;
    });
    const change = vi.fn();
    const fieldBlur = vi.fn();
    const mounted = mountWithRealForm(
      disabled,
      () => h(LkTextarea, { modelValue: 'value', prop: 'notes', onBlur: blur, onChange: change }),
      { onFieldBlur: fieldBlur }
    );
    await nextTick();
    const control = findNode(mounted.root, node => hasClass(node, 'lk-textarea__inner'));

    dispatch(control, 'onBlur', { detail: { value: 'value' } });
    await vi.advanceTimersByTimeAsync(100);
    await nextTick();

    expect(blur).toHaveBeenCalledOnce();
    expect(change).not.toHaveBeenCalled();
    expect(fieldBlur).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it.each([
    {
      name: 'CheckboxGroup',
      group: LkCheckboxGroup,
      child: LkCheckbox,
      modelValue: [] as string[],
      childProps: { name: 'a' },
      role: 'checkbox',
    },
    {
      name: 'RadioGroup',
      group: LkRadioGroup,
      child: LkRadio,
      modelValue: 'a',
      childProps: { name: 'b' },
      role: 'radio',
    },
  ])(
    '$name click proposal -> nextTick real Form.disabled -> no model/change/Form field-change',
    async ({ group, child, modelValue, childProps, role }) => {
      const disabled = ref(false);
      const update = vi.fn();
      const change = vi.fn();
      const fieldChange = vi.fn();
      const click = vi.fn(() => {
        disabled.value = true;
      });
      const mounted = mountWithRealForm(
        disabled,
        () =>
          h(
            group,
            {
              modelValue,
              prop: 'choice',
              'onUpdate:modelValue': update,
              onChange: change,
            },
            { default: () => h(child, { ...childProps, onClick: click }) }
          ),
        { onFieldChange: fieldChange }
      );
      await nextTick();

      await dispatch(
        findNode(mounted.root, node => node.props.role === role),
        'onTap',
        {}
      );
      await nextTick();

      expect(click).toHaveBeenCalledOnce();
      expect(update).not.toHaveBeenCalled();
      expect(change).not.toHaveBeenCalled();
      expect(fieldChange).not.toHaveBeenCalled();
      mounted.app.unmount();
    }
  );

  it.each([
    {
      name: 'Switch',
      component: LkSwitch,
      props: { modelValue: false, prop: 'value' },
      selector: (node: TestNode) => node.props.role === 'switch',
    },
    {
      name: 'Stepper',
      component: LkStepper,
      props: { modelValue: 1, prop: 'value' },
      selector: (node: TestNode) => hasClass(node, 'lk-stepper__plus'),
    },
  ])(
    '$name before-change proposal -> nextTick real Form.disabled -> no model/change/Form field-change',
    async ({ component, props, selector }) => {
      const disabled = ref(false);
      const update = vi.fn();
      const change = vi.fn();
      const fieldChange = vi.fn();
      const beforeChange = vi.fn(() => {
        disabled.value = true;
      });
      const mounted = mountWithRealForm(
        disabled,
        () =>
          h(component, {
            ...props,
            'onUpdate:modelValue': update,
            onBeforeChange: beforeChange,
            onChange: change,
          }),
        { onFieldChange: fieldChange }
      );
      await nextTick();

      await dispatch(findNode(mounted.root, selector), 'onTap', {
        stopPropagation() {},
        preventDefault() {},
      });
      await nextTick();

      expect(beforeChange).toHaveBeenCalledOnce();
      expect(update).not.toHaveBeenCalled();
      expect(change).not.toHaveBeenCalled();
      expect(fieldChange).not.toHaveBeenCalled();
      mounted.app.unmount();
    }
  );

  it('Stepper blur proposal -> nextTick real Form.disabled -> no before-change/model/change/Form field-change', async () => {
    const disabled = ref(false);
    const blur = vi.fn(() => {
      disabled.value = true;
    });
    const beforeChange = vi.fn();
    const update = vi.fn();
    const change = vi.fn();
    const fieldChange = vi.fn();
    const mounted = mountWithRealForm(
      disabled,
      () =>
        h(LkStepper, {
          modelValue: 1,
          prop: 'value',
          onBlur: blur,
          onBeforeChange: beforeChange,
          'onUpdate:modelValue': update,
          onChange: change,
        }),
      { onFieldChange: fieldChange }
    );
    await nextTick();

    const input = findNode(mounted.root, node => hasClass(node, 'lk-stepper__input'));
    dispatch(input, 'onInput', { detail: { value: '2' } });
    await dispatch(input, 'onBlur', {});
    await nextTick();

    expect(blur).toHaveBeenCalledOnce();
    expect(beforeChange).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    expect(fieldChange).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Rate click proposal -> nextTick real Form.disabled -> no clear/model/change/Form field-change', async () => {
    const disabled = ref(false);
    const clear = vi.fn();
    const update = vi.fn();
    const change = vi.fn();
    const fieldChange = vi.fn();
    const click = vi.fn(() => {
      disabled.value = true;
    });
    const mounted = mountWithRealForm(
      disabled,
      () =>
        h(LkRate, {
          modelValue: 1,
          prop: 'rating',
          allowClear: true,
          onClick: click,
          onClear: clear,
          'onUpdate:modelValue': update,
          onChange: change,
        }),
      { onFieldChange: fieldChange }
    );
    await nextTick();

    await dispatch(
      findNodes(mounted.root, node => hasClass(node, 'lk-rate__item'))[0],
      'onTap',
      {}
    );
    await nextTick();

    expect(click).toHaveBeenCalledOnce();
    expect(clear).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    expect(fieldChange).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Rate validateEvent=false updates the value without Form field-change or validation', async () => {
    const model = reactive({ rating: 0 });
    const fieldChange = vi.fn();
    const validator = vi.fn(() => true);
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          model,
          rules: { rating: { trigger: 'change', validator } },
          onFieldChange: fieldChange,
        },
        {
          default: () =>
            h(
              LkFormItem,
              { prop: 'rating' },
              {
                default: () =>
                  h(LkRate, {
                    modelValue: model.rating,
                    prop: 'rating',
                    validateEvent: false,
                    'onUpdate:modelValue': (value: number) => {
                      model.rating = value;
                    },
                  }),
              }
            ),
        }
      )
    );
    await nextTick();

    await dispatch(
      findNodes(mounted.root, node => hasClass(node, 'lk-rate__item'))[0],
      'onTap',
      {}
    );
    await flushTicks();

    expect(model.rating).toBe(1);
    expect(fieldChange).not.toHaveBeenCalled();
    expect(validator).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('SelectList update:modelValue commit -> nextTick real Form.disabled -> no change/select', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkSelectList, {
        modelValue: '',
        options: [{ label: 'A', value: 'a' }],
        'onUpdate:modelValue': () => {
          sequence.push('update:modelValue');
          disabled.value = true;
        },
        onChange: () => sequence.push('change'),
        onSelect: () => sequence.push('select'),
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-select-list__item')),
      'onTap'
    );
    await nextTick();

    expect(sequence).toEqual(['update:modelValue']);
    mounted.app.unmount();
  });

  it('Slider update:modelValue commit -> nextTick real Form.disabled -> no input/click/change/Form field-change', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const fieldChange = vi.fn();
    const mounted = mountWithRealForm(
      disabled,
      () =>
        h(LkSlider, {
          modelValue: 10,
          prop: 'amount',
          'onUpdate:modelValue': () => {
            sequence.push('update:modelValue');
            disabled.value = true;
          },
          onInput: () => sequence.push('input'),
          onClick: () => sequence.push('click'),
          onChange: () => sequence.push('change'),
        }),
      { onFieldChange: fieldChange }
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-slider__track-container')),
      'onTap',
      { detail: { x: 150 }, stopPropagation() {} }
    );
    await nextTick();

    expect(sequence).toEqual(['update:modelValue']);
    expect(fieldChange).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Slider change -> Form field-change listener delivers disabled -> no later dragend/drag-release', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const fieldChange = vi.fn(() => {
      sequence.push('field-change');
      disabled.value = true;
    });
    const mounted = mountWithRealForm(
      disabled,
      () =>
        h(LkSlider, {
          modelValue: 10,
          prop: 'amount',
          'onUpdate:modelValue': () => sequence.push('update:modelValue'),
          onInput: () => sequence.push('input'),
          onChange: () => sequence.push('change'),
          onDragend: () => sequence.push('dragend'),
          onDragRelease: () => sequence.push('drag-release'),
        }),
      { onFieldChange: fieldChange }
    );
    await nextTick();
    const track = findNode(mounted.root, node => hasClass(node, 'lk-slider__track-container'));

    await dispatch(track, 'onTouchstart', {
      touches: [{ clientX: 150 }],
      stopPropagation() {},
      preventDefault() {},
    });
    await dispatch(track, 'onTouchend', {
      changedTouches: [{ clientX: 150 }],
      stopPropagation() {},
      preventDefault() {},
    });
    await nextTick();

    expect(fieldChange).toHaveBeenCalledOnce();
    expect(sequence).toEqual(['update:modelValue', 'input', 'change', 'field-change']);
    mounted.app.unmount();
  });

  it('Calendar update:modelValue commit -> nextTick real Form.disabled -> no select/change', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkCalendar, {
        modelValue: '2026-08-13',
        viewDate: '2026-08-01',
        minDate: '2026-08-01',
        maxDate: '2026-08-31',
        'onUpdate:modelValue': () => {
          sequence.push('update:modelValue');
          disabled.value = true;
        },
        onSelect: () => sequence.push('select'),
        onChange: () => sequence.push('change'),
      })
    );
    await nextTick();
    const target = findNode(mounted.root, node => node.props['data-date'] === '2026-08-14');

    await dispatch(target, 'onTap');
    await nextTick();

    expect(sequence).toEqual(['update:modelValue']);
    mounted.app.unmount();
  });

  it('Calendar update:viewDate -> delivered Form.disabled clears switch timers and switching UI', async () => {
    vi.useFakeTimers();
    const disabled = ref(false);
    const updateViewDate = vi.fn(() => {
      disabled.value = true;
    });
    const monthChange = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkCalendar, {
        modelValue: '',
        viewDate: '2026-08-01',
        'onUpdate:viewDate': updateViewDate,
        onMonthChange: monthChange,
      })
    );
    await nextTick();
    const gridWrap = findNode(mounted.root, node => hasClass(node, 'lk-calendar__grid-wrap'));

    dispatch(gridWrap, 'onTouchstart', { touches: [{ clientX: 240, clientY: 20 }] });
    dispatch(gridWrap, 'onTouchmove', { touches: [{ clientX: 20, clientY: 20 }] });
    dispatch(gridWrap, 'onTouchend');
    expect(updateViewDate).toHaveBeenCalledOnce();

    await nextTick();
    await vi.advanceTimersByTimeAsync(400);
    const grid = findNode(mounted.root, node => hasClass(node, 'lk-calendar__grid'));
    expect(disabled.value).toBe(true);
    expect(hasClass(grid, 'is-switching')).toBe(false);
    expect(hasClass(grid, 'is-switching-next')).toBe(false);
    expect(monthChange).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Calendar update:viewDate listener reentrant next supersedes the old panel event chain', async () => {
    const disabled = ref(false);
    const viewDate = ref('2026-01-01');
    let nextPanel: (() => void) | undefined;
    let reentered = false;
    const updates: string[] = [];
    const months: string[] = [];
    const panels: Array<{ year: number; month: number }> = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(
        LkCalendar,
        {
          viewDate: viewDate.value,
          'onUpdate:viewDate': (value: string) => {
            updates.push(value);
            viewDate.value = value;
            if (!reentered) {
              reentered = true;
              nextPanel?.();
            }
          },
          onMonthChange: (value: string) => months.push(value),
          onPanelChange: (value: { year: number; month: number }) => panels.push(value),
        },
        {
          header: (slot: { next: () => void }) => {
            nextPanel = slot.next;
            return h('calendar-header-stub');
          },
        }
      )
    );
    await nextTick();

    nextPanel?.();
    await flushTicks(10);

    expect(updates).toEqual(['2026-02', '2026-03']);
    expect(months).toEqual(['2026-03']);
    expect(panels).toEqual([{ year: 2026, month: 3 }]);
    mounted.app.unmount();
  });

  it('Calendar controlled viewDate override after update supersedes all old panel events', async () => {
    const disabled = ref(false);
    const viewDate = ref('2026-01-01');
    let nextPanel: (() => void) | undefined;
    const monthChange = vi.fn();
    const weekChange = vi.fn();
    const panelChange = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(
        LkCalendar,
        {
          viewDate: viewDate.value,
          'onUpdate:viewDate': () => {
            viewDate.value = '2030-05-01';
          },
          onMonthChange: monthChange,
          onWeekChange: weekChange,
          onPanelChange: panelChange,
        },
        {
          header: (slot: { next: () => void }) => {
            nextPanel = slot.next;
            return h('calendar-header-stub');
          },
        }
      )
    );
    await nextTick();

    nextPanel?.();
    await flushTicks(8);

    expect(viewDate.value).toBe('2030-05-01');
    expect(monthChange).not.toHaveBeenCalled();
    expect(weekChange).not.toHaveBeenCalled();
    expect(panelChange).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Slider immediate unmount cancels its deferred mount measurement before SelectorQuery', async () => {
    const createSelectorQuery = vi.fn(() => ({
      in() {
        return this;
      },
      select() {
        return this;
      },
      boundingClientRect() {
        return this;
      },
      exec() {},
    }));
    vi.stubGlobal('uni', { ...uni, createSelectorQuery });
    const mounted = mountControl(LkSlider, makeForm(), { modelValue: 10 });

    mounted.app.unmount();
    await flushTicks();

    expect(createSelectorQuery).not.toHaveBeenCalled();
  });

  it('Picker update:modelValue commit -> nextTick real Form.disabled -> no change/confirm/close', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkPicker, {
        visible: true,
        modelValue: 'a',
        columns: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
        'onUpdate:modelValue': () => {
          sequence.push('update:modelValue');
          disabled.value = true;
        },
        onChange: () => sequence.push('change'),
        onConfirm: () => sequence.push('confirm'),
        'onUpdate:visible': () => sequence.push('update:visible'),
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-picker__btn--confirm')),
      'onTap'
    );
    await nextTick();

    expect(sequence).toEqual(['update:modelValue']);
    mounted.app.unmount();
  });

  it('Picker cancel proposal -> nextTick delivered Form.disabled -> closing update remains allowed', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkPicker, {
        id: 'picker-cancel-host',
        visible: true,
        modelValue: 'a',
        columns: [{ label: 'A', value: 'a' }],
        onCancel: () => {
          sequence.push('cancel');
          disabled.value = true;
        },
        'onUpdate:visible': () => {
          const host = findNode(mounted.root, node => node.props.id === 'picker-cancel-host');
          sequence.push(`update:visible:${String(host.props['aria-disabled'])}`);
        },
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-picker__btn--cancel')),
      'onTap'
    );

    expect(sequence).toEqual(['cancel', 'update:visible:true']);
    mounted.app.unmount();
  });

  it('Picker cancel listener unmount -> no ghost closing update after nextTick', async () => {
    const disabled = ref(false);
    const updateVisible = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkPicker, {
        visible: true,
        modelValue: 'a',
        columns: [{ label: 'A', value: 'a' }],
        onCancel: () => mounted.app.unmount(),
        'onUpdate:visible': updateVisible,
      })
    );
    await nextTick();
    const cancel = findNode(mounted.root, node => hasClass(node, 'lk-picker__btn--cancel'));

    await dispatch(cancel, 'onTap');

    expect(updateVisible).not.toHaveBeenCalled();
  });

  it('Picker confirm listener delivers Form.disabled -> accepted value still closes', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkPicker, {
        visible: true,
        modelValue: 'a',
        columns: [{ label: 'A', value: 'a' }],
        'onUpdate:modelValue': () => sequence.push('update:modelValue'),
        onChange: () => sequence.push('change'),
        onConfirm: () => {
          sequence.push('confirm');
          disabled.value = true;
        },
        'onUpdate:visible': () => sequence.push('update:visible'),
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-picker__btn--confirm')),
      'onTap'
    );

    expect(sequence).toEqual(['update:modelValue', 'change', 'confirm', 'update:visible']);
    mounted.app.unmount();
  });

  it('Picker confirm listener unmount -> no ghost closing update', async () => {
    const disabled = ref(false);
    const updateVisible = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkPicker, {
        visible: true,
        modelValue: 'a',
        columns: [{ label: 'A', value: 'a' }],
        onConfirm: () => mounted.app.unmount(),
        'onUpdate:visible': updateVisible,
      })
    );
    await nextTick();
    const confirm = findNode(mounted.root, node => hasClass(node, 'lk-picker__btn--confirm'));

    await dispatch(confirm, 'onTap');

    expect(updateVisible).not.toHaveBeenCalled();
  });

  it('CalendarPicker update:modelValue commit -> nextTick real Form.disabled -> no change/confirm/close', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkCalendarPicker, {
        show: true,
        modelValue: '2026-08-13',
        viewDate: '2026-08-01',
        minDate: '2026-08-01',
        maxDate: '2026-08-31',
        'onUpdate:modelValue': () => {
          sequence.push('update:modelValue');
          disabled.value = true;
        },
        onChange: () => sequence.push('change'),
        onConfirm: () => sequence.push('confirm'),
        onClose: () => sequence.push('close'),
      })
    );
    await nextTick();
    const footer = findNode(mounted.root, node => hasClass(node, 'lk-calendar-picker__footer'));
    const confirm = findNode(footer, node => node.type === 'button');

    await dispatch(confirm, 'onTap', {});
    await nextTick();

    expect(sequence).toEqual(['update:modelValue']);
    mounted.app.unmount();
  });

  it('CalendarPicker closing update -> nextTick delivered Form.disabled -> close remains allowed', async () => {
    const disabled = ref(false);
    const show = ref(true);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkCalendarPicker, {
        id: 'calendar-picker-close-host',
        show: show.value,
        modelValue: '2026-08-13',
        'onUpdate:show': () => {
          sequence.push('update:show');
          disabled.value = true;
        },
        onClose: () => {
          const host = findNode(
            mounted.root,
            node => node.props.id === 'calendar-picker-close-host'
          );
          sequence.push(`close:${String(host.props['aria-disabled'])}`);
        },
      })
    );
    await nextTick();

    show.value = false;
    await nextTick();
    await nextTick();
    await Promise.resolve();

    expect(sequence).toEqual(['update:show', 'close:true']);
    mounted.app.unmount();
  });

  it('CalendarPicker closing update listener unmount -> no ghost close after nextTick', async () => {
    const disabled = ref(false);
    const show = ref(true);
    const close = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkCalendarPicker, {
        show: show.value,
        modelValue: '2026-08-13',
        'onUpdate:show': () => mounted.app.unmount(),
        onClose: close,
      })
    );
    await nextTick();

    show.value = false;
    await nextTick();
    await nextTick();
    await Promise.resolve();

    expect(close).not.toHaveBeenCalled();
  });

  it('CalendarPicker confirm listener delivers Form.disabled -> accepted value still closes', async () => {
    const disabled = ref(false);
    const show = ref(true);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkCalendarPicker, {
        show: show.value,
        modelValue: '2026-08-13',
        viewDate: '2026-08-01',
        minDate: '2026-08-01',
        maxDate: '2026-08-31',
        'onUpdate:modelValue': () => sequence.push('update:modelValue'),
        onChange: () => sequence.push('change'),
        onConfirm: () => {
          sequence.push('confirm');
          disabled.value = true;
        },
        'onUpdate:show': value => {
          sequence.push(`update:show:${String(value)}`);
          show.value = value;
        },
        onClose: () => sequence.push('close'),
      })
    );
    await nextTick();
    sequence.length = 0;
    const footer = findNode(mounted.root, node => hasClass(node, 'lk-calendar-picker__footer'));

    await dispatch(
      findNode(footer, node => node.type === 'button'),
      'onTap',
      {}
    );
    await nextTick();
    await nextTick();

    expect(sequence).toEqual([
      'update:modelValue',
      'change',
      'confirm',
      'update:show:false',
      'close',
    ]);
    mounted.app.unmount();
  });

  it('CalendarPicker confirm listener unmount -> no ghost closing update/close', async () => {
    const disabled = ref(false);
    const updateShow = vi.fn();
    const close = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkCalendarPicker, {
        show: true,
        modelValue: '2026-08-13',
        onConfirm: () => mounted.app.unmount(),
        'onUpdate:show': updateShow,
        onClose: close,
      })
    );
    await nextTick();
    updateShow.mockClear();
    const footer = findNode(mounted.root, node => hasClass(node, 'lk-calendar-picker__footer'));

    await dispatch(
      findNode(footer, node => node.type === 'button'),
      'onTap',
      {}
    );
    await nextTick();

    expect(updateShow).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it('Upload clickPreview proposal -> nextTick real Form.disabled -> no native preview', async () => {
    const disabled = ref(false);
    const previewImage = vi.spyOn(uni, 'previewImage');
    const clickPreview = vi.fn(() => {
      disabled.value = true;
    });
    const mounted = mountWithRealForm(disabled, () =>
      h(LkUpload, {
        modelValue: [
          { uid: 'preview', name: 'preview.png', url: 'preview.png', status: 'success' },
        ],
        showUpload: false,
        onClickPreview: clickPreview,
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-upload__item')),
      'onTap'
    );
    await nextTick();

    expect(clickPreview).toHaveBeenCalledOnce();
    expect(previewImage).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it.each([
    { direction: 'open -> controlled close', initial: false, proposed: true },
    { direction: 'close -> controlled reopen', initial: true, proposed: false },
  ])('CalendarPicker $direction supersedes the stale show event', async testCase => {
    const disabled = ref(false);
    const show = ref(testCase.initial);
    const open = vi.fn();
    const close = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkCalendarPicker, {
        modelValue: '2026-01-01',
        show: show.value,
        'onUpdate:show': (value: boolean) => {
          show.value = value === testCase.proposed ? !value : value;
        },
        onOpen: open,
        onClose: close,
      })
    );
    await nextTick();

    if (testCase.proposed) {
      await dispatch(
        findNode(mounted.root, node => hasClass(node, 'lk-calendar-picker__trigger')),
        'onTap'
      );
    } else {
      await dispatch(
        findNode(mounted.root, node => hasClass(node, 'lk-calendar-picker__close')),
        'onTap'
      );
    }
    await flushTicks(8);

    if (testCase.proposed) expect(open).not.toHaveBeenCalled();
    else expect(close).not.toHaveBeenCalled();
    expect(show.value).toBe(testCase.initial);
    mounted.app.unmount();
  });

  it('Keyboard input proposal -> nextTick real Form.disabled -> no model commit and id stays on host', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const update = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkKeyboard, {
        id: 'real-keyboard-host',
        visible: true,
        modelValue: '',
        vibrate: false,
        onKeyPress: () => sequence.push('key-press'),
        onInput: () => {
          sequence.push('input');
          disabled.value = true;
        },
        'onUpdate:modelValue': update,
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => node.props['data-key'] === '1'),
      'onTap'
    );
    await nextTick();

    expect(sequence).toEqual(['key-press', 'input']);
    expect(update).not.toHaveBeenCalled();
    expect(
      findNode(mounted.root, node => node.props.id === 'real-keyboard-host').props['data-disabled']
    ).toBe('true');
    mounted.app.unmount();
  });

  it('Keyboard closing update -> nextTick delivered Form.disabled -> close remains allowed', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkKeyboard, {
        id: 'keyboard-close-host',
        visible: true,
        modelValue: '',
        showClose: true,
        'onUpdate:visible': () => {
          sequence.push('update:visible');
          disabled.value = true;
        },
        onClose: () => {
          const host = findNode(mounted.root, node => node.props.id === 'keyboard-close-host');
          sequence.push(`close:${String(host.props['data-disabled'])}`);
        },
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-keyboard__close')),
      'onTap'
    );

    expect(sequence).toEqual(['update:visible', 'close:true']);
    mounted.app.unmount();
  });

  it('Keyboard closing update listener unmount -> no ghost close after nextTick', async () => {
    const disabled = ref(false);
    const close = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkKeyboard, {
        visible: true,
        modelValue: '',
        showClose: true,
        'onUpdate:visible': () => mounted.app.unmount(),
        onClose: close,
      })
    );
    await nextTick();
    const closeButton = findNode(mounted.root, node => hasClass(node, 'lk-keyboard__close'));

    await dispatch(closeButton, 'onTap');

    expect(close).not.toHaveBeenCalled();
  });

  it('Keyboard confirm listener delivers Form.disabled -> accepted value still closes', async () => {
    const disabled = ref(false);
    const sequence: string[] = [];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkKeyboard, {
        visible: true,
        modelValue: '123',
        showConfirm: true,
        onConfirm: () => {
          sequence.push('confirm');
          disabled.value = true;
        },
        'onUpdate:visible': value => sequence.push(`update:visible:${String(value)}`),
        onClose: () => sequence.push('close'),
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-keyboard__done')),
      'onTap'
    );

    expect(sequence).toEqual(['confirm', 'update:visible:false', 'close']);
    mounted.app.unmount();
  });

  it('Keyboard confirm listener unmount -> no ghost closing update/close', async () => {
    const disabled = ref(false);
    const updateVisible = vi.fn();
    const close = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkKeyboard, {
        visible: true,
        modelValue: '123',
        showConfirm: true,
        onConfirm: () => mounted.app.unmount(),
        'onUpdate:visible': updateVisible,
        onClose: close,
      })
    );
    await nextTick();
    const confirm = findNode(mounted.root, node => hasClass(node, 'lk-keyboard__done'));

    await dispatch(confirm, 'onTap');

    expect(updateVisible).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it('VerifyCode send proposal -> nextTick real Form.disabled -> no countdown and id stays on host', async () => {
    vi.useFakeTimers();
    const disabled = ref(false);
    const send = vi.fn(() => {
      disabled.value = true;
    });
    const countdownEnd = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkVerifyCode, {
        id: 'real-verify-host',
        modelValue: '',
        countdown: true,
        countdownDuration: 1,
        onSend: send,
        onCountdownEnd: countdownEnd,
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-verify-code__countdown-btn')),
      'onTap'
    );
    await nextTick();
    vi.advanceTimersByTime(2000);

    expect(send).toHaveBeenCalledOnce();
    expect(countdownEnd).not.toHaveBeenCalled();
    expect(
      findNode(mounted.root, node => node.props.id === 'real-verify-host').props['data-disabled']
    ).toBe('true');
    mounted.app.unmount();
  });

  it('VerifyCode exposed setValue/clear stay programmatic under inherited Form.disabled', async () => {
    const disabled = ref(true);
    const model = reactive({ code: '' });
    let verifyApi: { clear: () => void; setValue: (code: string) => void } | null = null;
    const update = vi.fn((value: string) => {
      model.code = value;
    });
    const finish = vi.fn();
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        { model, disabled: disabled.value },
        {
          default: () =>
            h(LkVerifyCode, {
              ref: (value: unknown) => {
                verifyApi = value as typeof verifyApi;
              },
              modelValue: model.code,
              'onUpdate:modelValue': update,
              onFinish: finish,
            }),
        }
      )
    );
    await nextTick();

    verifyApi?.setValue('123456');
    await nextTick();
    expect(model.code).toBe('123456');
    expect(update).toHaveBeenLastCalledWith('123456');
    expect(finish).toHaveBeenCalledWith('123456');

    verifyApi?.clear();
    await nextTick();
    expect(model.code).toBe('');
    expect(update).toHaveBeenLastCalledWith('');
    mounted.app.unmount();
  });

  it('Upload exposed retry/remove/clear/confirm remain programmatic under inherited Form.disabled', async () => {
    const disabled = ref(true);
    const model = reactive({ files: [] as UploadFile[] });
    const files = ref<UploadFile[]>([
      { uid: 'programmatic-fail', name: 'fail.png', url: 'fail.png', status: 'fail' },
    ]);
    let uploadApi: {
      retryUpload: (index: number) => Promise<void>;
      removeFile: (index: number) => Promise<void>;
      clearFiles: () => Promise<void>;
      confirmRemove: (index: number) => void;
    } | null = null;
    let callbacks: { onSuccess: (response: unknown) => Promise<void> } | undefined;
    const abort = vi.fn();
    const retry = vi.fn();
    const deleted = vi.fn();
    const clear = vi.fn();
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        { model, disabled: disabled.value },
        {
          default: () =>
            h(LkUpload, {
              ref: (value: unknown) => {
                uploadApi = value as typeof uploadApi;
              },
              modelValue: files.value,
              action: '/upload',
              customRequest: (options: { onSuccess: (response: unknown) => Promise<void> }) => {
                callbacks = options;
                return { abort };
              },
              'onUpdate:modelValue': (value: UploadFile[]) => {
                files.value = value.map(file => ({ ...file }));
              },
              onRetry: retry,
              onDelete: deleted,
              onClear: clear,
            }),
        }
      )
    );
    await nextTick();

    await uploadApi?.retryUpload(0);
    expect(callbacks).toBeDefined();
    expect(retry).toHaveBeenCalledOnce();
    expect(files.value[0].status).toBe('uploading');

    await uploadApi?.removeFile(0);
    expect(abort).toHaveBeenCalledOnce();
    expect(deleted).toHaveBeenCalledOnce();
    expect(files.value).toEqual([]);

    files.value = [{ uid: 'clear-me', name: 'clear.png', url: 'clear.png', status: 'ready' }];
    await nextTick();
    await uploadApi?.clearFiles();
    expect(clear).toHaveBeenCalledOnce();
    expect(files.value).toEqual([]);

    files.value = [{ uid: 'confirm-me', name: 'confirm.png', url: 'confirm.png', status: 'ready' }];
    await nextTick();
    uploadApi?.confirmRemove(0);
    await nextTick();
    expect(findNode(mounted.root, node => node.type === 'lk-modal-stub').props.modelValue).toBe(
      true
    );
    mounted.app.unmount();
  });

  it('blocks CalendarPicker opening while Form is disabled', () => {
    const form = makeForm();
    form.disabled = true;
    const updateShow = vi.fn();
    const open = vi.fn();
    const mounted = mountControl(LkCalendarPicker, form, {
      modelValue: '',
      show: false,
      'onUpdate:show': updateShow,
      onOpen: open,
    });

    dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-calendar-picker__trigger')),
      'onTap'
    );
    expect(updateShow).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('blocks SelectList model and business events while Form is disabled', async () => {
    const form = makeForm();
    form.disabled = true;
    const update = vi.fn();
    const change = vi.fn();
    const mounted = mountControl(LkSelectList, form, {
      modelValue: '',
      options: [{ label: 'A', value: 'a' }],
      'onUpdate:modelValue': update,
      onChange: change,
    });
    const option = findNode(mounted.root, node => hasClass(node, 'lk-select-list__item'));

    await dispatch(option, 'onTap');
    expect(update).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();

    form.disabled = false;
    await nextTick();
    await dispatch(option, 'onTap');
    expect(update).toHaveBeenCalledWith('a');
    expect(change).toHaveBeenCalledOnce();
    mounted.app.unmount();
  });

  it('supersedes a pending Switch beforeChange across disable and re-enable', async () => {
    const form = makeForm();
    let resolveBeforeChange: ((value: boolean) => void) | undefined;
    const update = vi.fn();
    const cancel = vi.fn();
    const mounted = mountControl(LkSwitch, form, {
      modelValue: false,
      beforeChange: () => new Promise<boolean>(resolve => (resolveBeforeChange = resolve)),
      'onUpdate:modelValue': update,
      onChangeCancel: cancel,
    });
    const control = findNode(mounted.root, node => node.props.role === 'switch');

    dispatch(control, 'onTap', {});
    form.disabled = true;
    form.disabled = false;
    resolveBeforeChange?.(true);
    await nextTick();
    await Promise.resolve();

    expect(update).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('invalidates a pending Switch interaction when the component unmounts', async () => {
    const form = makeForm();
    let resolveBeforeChange: ((value: boolean) => void) | undefined;
    const update = vi.fn();
    const mounted = mountControl(LkSwitch, form, {
      modelValue: false,
      prop: 'enabled',
      beforeChange: () => new Promise<boolean>(resolve => (resolveBeforeChange = resolve)),
      'onUpdate:modelValue': update,
    });
    const control = findNode(mounted.root, node => node.props.role === 'switch');

    dispatch(control, 'onTap', {});
    mounted.app.unmount();
    resolveBeforeChange?.(true);
    await Promise.resolve();
    await nextTick();

    expect(update).not.toHaveBeenCalled();
    expect(form.emitFieldChange).not.toHaveBeenCalled();
  });

  it('Switch click-listener reentry supersedes the older chain before async beforeChange', async () => {
    const form = makeForm();
    const winner = deferred<boolean>();
    const beforeChange = vi.fn(() => winner.promise);
    const update = vi.fn();
    const change = vi.fn();
    let reentered = false;
    let nested: Promise<void> | undefined;
    const mounted = mountControl(LkSwitch, form, {
      modelValue: false,
      prop: 'enabled',
      beforeChange,
      onClick: () => {
        if (reentered) return;
        reentered = true;
        nested = dispatch(
          findNode(mounted.root, node => node.props.role === 'switch'),
          'onTap',
          {}
        ) as Promise<void>;
      },
      'onUpdate:modelValue': update,
      onChange: change,
    });
    const control = findNode(mounted.root, node => node.props.role === 'switch');

    const older = dispatch(control, 'onTap', {}) as Promise<void>;
    await vi.waitFor(() => expect(beforeChange).toHaveBeenCalledTimes(1));

    winner.resolve(true);
    await nested;
    await older;

    expect(update).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);
    expect(form.emitFieldChange).toHaveBeenCalledTimes(1);
    mounted.app.unmount();
  });

  it('does not revive a Stepper long press after a listener disables and re-enables Form', async () => {
    vi.useFakeTimers();
    const form = makeForm();
    const update = vi.fn();
    const mounted = mountControl(LkStepper, form, {
      modelValue: 1,
      longPress: true,
      onBeforeChange: () => {
        form.disabled = true;
      },
      'onUpdate:modelValue': update,
    });
    const plus = findNode(mounted.root, node => hasClass(node, 'lk-stepper__plus'));

    dispatch(plus, 'onTouchstartPassive', {});
    form.disabled = false;
    await nextTick();
    vi.advanceTimersByTime(1200);

    expect(update).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Stepper latest beforeChange run wins when two async proposals resolve newer then older', async () => {
    const form = makeForm();
    const first = deferred<boolean>();
    const second = deferred<boolean>();
    const beforeChange = vi
      .fn<() => Promise<boolean>>()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const update = vi.fn();
    const change = vi.fn();
    const plus = vi.fn();
    const mounted = mountControl(LkStepper, form, {
      modelValue: 1,
      beforeChange,
      'onUpdate:modelValue': update,
      onChange: change,
      onPlus: plus,
      prop: 'count',
    });
    const plusButton = findNode(mounted.root, node => hasClass(node, 'lk-stepper__plus'));

    const older = dispatch(plusButton, 'onTap', { stopPropagation() {} }) as Promise<void>;
    await vi.waitFor(() => expect(beforeChange).toHaveBeenCalledTimes(1));
    const newer = dispatch(plusButton, 'onTap', { stopPropagation() {} }) as Promise<void>;
    await vi.waitFor(() => expect(beforeChange).toHaveBeenCalledTimes(2));

    second.resolve(true);
    await newer;
    first.resolve(true);
    await older;

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(2);
    expect(change).toHaveBeenCalledTimes(1);
    expect(plus).toHaveBeenCalledTimes(1);
    expect(form.emitFieldChange).toHaveBeenCalledTimes(1);
    mounted.app.unmount();
  });

  it('Slider touchend invalidates a touchstart still awaiting selector measurement', async () => {
    const form = makeForm();
    const update = vi.fn();
    const dragStart = vi.fn();
    const mounted = mountControl(LkSlider, form, {
      modelValue: 10,
      'onUpdate:modelValue': update,
      onDragstart: dragStart,
    });
    await nextTick();

    let resolveRect: ((rect: { left: number; width: number }) => void) | undefined;
    const currentUni = uni;
    vi.stubGlobal('uni', {
      ...currentUni,
      createSelectorQuery: () => ({
        in() {
          return this;
        },
        select() {
          return this;
        },
        boundingClientRect(callback: (rect: { left: number; width: number }) => void) {
          resolveRect = callback;
          return this;
        },
        exec() {},
      }),
    });
    const track = findNode(mounted.root, node => hasClass(node, 'lk-slider__track-container'));

    const pendingStart = dispatch(track, 'onTouchstart', {
      touches: [{ clientX: 150 }],
      stopPropagation() {},
      preventDefault() {},
    }) as Promise<void>;
    await dispatch(track, 'onTouchend', { stopPropagation() {}, preventDefault() {} });
    resolveRect?.({ left: 0, width: 300 });
    await pendingStart;

    expect(update).not.toHaveBeenCalled();
    expect(dragStart).not.toHaveBeenCalled();
    expect(
      hasClass(
        findNode(mounted.root, node => hasClass(node, 'lk-slider')),
        'is-dragging'
      )
    ).toBe(false);
    mounted.app.unmount();
  });

  it('Slider reentrant track click supersedes the older post-update event chain', async () => {
    const disabled = ref(false);
    const model = reactive({ volume: 10 });
    const sequence: string[] = [];
    let reentered = false;
    let nested: Promise<void> | undefined;
    const mounted = mountRender(makeForm(), () =>
      h(
        LkForm,
        {
          model,
          disabled: disabled.value,
          onFieldChange: (_prop: string, value: number) => sequence.push(`form:${value}`),
        },
        {
          default: () =>
            h(LkSlider, {
              modelValue: model.volume,
              prop: 'volume',
              'onUpdate:modelValue': (value: number) => {
                sequence.push(`update:${value}`);
                if (!reentered) {
                  reentered = true;
                  nested = dispatch(
                    findNode(mounted.root, node => hasClass(node, 'lk-slider__track-container')),
                    'onTap',
                    {
                      detail: { x: 240 },
                      stopPropagation() {},
                    }
                  ) as Promise<void>;
                }
              },
              onInput: (value: number) => sequence.push(`input:${value}`),
              onClick: (value: number) => sequence.push(`click:${value}`),
              onChange: (value: number) => sequence.push(`change:${value}`),
            }),
        }
      )
    );
    await nextTick();
    const track = findNode(mounted.root, node => hasClass(node, 'lk-slider__track-container'));

    const older = dispatch(track, 'onTap', {
      detail: { x: 60 },
      stopPropagation() {},
    }) as Promise<void>;
    await older;
    await nested;
    await nextTick();

    // Controlled parent intentionally ignores both updates; the winning local run must still own
    // every later event and must not be clobbered by the stale first run's continuation.
    expect(model.volume).toBe(10);
    expect(sequence).toEqual([
      'update:20',
      'update:80',
      'input:80',
      'click:80',
      'change:80',
      'form:80',
    ]);
    mounted.app.unmount();
  });

  it('cancels Calendar swipe generations without emitting panel changes', async () => {
    const form = makeForm();
    const updateViewDate = vi.fn();
    const mounted = mountControl(LkCalendar, form, {
      modelValue: '',
      viewDate: '2026-08-01',
      'onUpdate:viewDate': updateViewDate,
    });
    const grid = findNode(mounted.root, node => hasClass(node, 'lk-calendar__grid-wrap'));

    dispatch(grid, 'onTouchstart', { touches: [{ clientX: 200, clientY: 20 }] });
    form.disabled = true;
    form.disabled = false;
    await nextTick();
    dispatch(grid, 'onTouchmove', { touches: [{ clientX: 20, clientY: 20 }] });
    dispatch(grid, 'onTouchend');

    expect(updateViewDate).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('keeps Picker cancel available while blocking selection and confirm', async () => {
    const form = makeForm();
    form.disabled = true;
    const pick = vi.fn();
    const confirm = vi.fn();
    const visible = vi.fn();
    const mounted = mountControl(LkPicker, form, {
      visible: true,
      columns: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
      modelValue: 'a',
      onPick: pick,
      onConfirm: confirm,
      'onUpdate:visible': visible,
    });
    await nextTick();
    const secondItem = findNodes(mounted.root, node => hasClass(node, 'lk-picker__item'))[1];
    expect(secondItem).toBeDefined();
    const confirmButton = findNode(mounted.root, node => hasClass(node, 'lk-picker__btn--confirm'));
    const cancelButton = findNode(mounted.root, node => hasClass(node, 'lk-picker__btn--cancel'));

    dispatch(secondItem, 'onTap');
    dispatch(confirmButton, 'onTap');
    expect(pick).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
    await dispatch(cancelButton, 'onTap');
    expect(visible).toHaveBeenCalledWith(false);
    mounted.app.unmount();
  });

  it('blocks Keyboard values and confirm but preserves close', async () => {
    const form = makeForm();
    form.disabled = true;
    const update = vi.fn();
    const confirm = vi.fn();
    const close = vi.fn();
    const mounted = mountControl(LkKeyboard, form, {
      visible: true,
      modelValue: '',
      showClose: true,
      showConfirm: true,
      'onUpdate:modelValue': update,
      onConfirm: confirm,
      onClose: close,
    });
    const key = findNode(mounted.root, node => hasClass(node, 'lk-keyboard__key'));
    const confirmButton = findNode(mounted.root, node => hasClass(node, 'lk-keyboard__done'));
    const closeButton = findNode(mounted.root, node => hasClass(node, 'lk-keyboard__close'));

    dispatch(key, 'onTap');
    dispatch(confirmButton, 'onTap');
    expect(update).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
    await dispatch(closeButton, 'onTap');
    expect(close).toHaveBeenCalledOnce();
    mounted.app.unmount();
  });

  it('stops VerifyCode countdown when send synchronously disables Form', () => {
    vi.useFakeTimers();
    const form = makeForm();
    const countdownEnd = vi.fn();
    const mounted = mountControl(LkVerifyCode, form, {
      modelValue: '',
      countdown: true,
      countdownDuration: 1,
      onSend: () => {
        form.disabled = true;
      },
      onCountdownEnd: countdownEnd,
    });
    const countdown = findNode(mounted.root, node =>
      hasClass(node, 'lk-verify-code__countdown-btn')
    );

    dispatch(countdown, 'onTap');
    vi.advanceTimersByTime(2000);
    expect(countdownEnd).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Upload uploading update -> controlled parent removes uid -> no request factory or change', async () => {
    const disabled = ref(false);
    const files = ref<UploadFile[]>([
      { uid: 'cancel-before-request', name: 'cancel.png', url: 'cancel.png', status: 'fail' },
    ]);
    let uploadApi: { retryUpload: (index: number) => Promise<void> } | null = null;
    const customRequest = vi.fn();
    const change = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkUpload, {
        ref: (value: unknown) => {
          uploadApi = value as typeof uploadApi;
        },
        modelValue: files.value,
        action: '/upload',
        customRequest,
        'onUpdate:modelValue': (value: UploadFile[]) => {
          if (value[0]?.status === 'uploading') files.value = [];
        },
        onChange: change,
      })
    );
    await nextTick();

    await uploadApi?.retryUpload(0);
    await nextTick();

    expect(files.value).toEqual([]);
    expect(customRequest).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Upload success update -> controlled parent removes uid -> no ghost change/success', async () => {
    const disabled = ref(false);
    const files = ref<UploadFile[]>([
      { uid: 'cancel-at-success', name: 'success.png', url: 'success.png', status: 'fail' },
    ]);
    let uploadApi: { retryUpload: (index: number) => Promise<void> } | null = null;
    let callbacks: { onSuccess: (response: unknown) => Promise<void> } | undefined;
    const abort = vi.fn();
    const changes: string[] = [];
    const success = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkUpload, {
        ref: (value: unknown) => {
          uploadApi = value as typeof uploadApi;
        },
        modelValue: files.value,
        action: '/upload',
        customRequest: (options: NonNullable<typeof callbacks>) => {
          callbacks = options;
          return { abort };
        },
        'onUpdate:modelValue': (value: UploadFile[]) => {
          if (value[0]?.status === 'success') files.value = [];
          else files.value = value.map(file => ({ ...file }));
        },
        onChange: (value: UploadFile[]) => changes.push(value[0]?.status || 'empty'),
        onSuccess: success,
      })
    );
    await nextTick();

    await uploadApi?.retryUpload(0);
    expect(callbacks).toBeDefined();
    expect(changes).toEqual(['uploading']);

    await callbacks?.onSuccess({ ok: true });
    await nextTick();

    expect(files.value).toEqual([]);
    expect(abort).toHaveBeenCalledOnce();
    expect(changes).toEqual(['uploading']);
    expect(success).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it('Upload afterRead mutates component-owned files, publishes them, and feeds customRequest without touching parent inputs', async () => {
    let chooseSuccess:
      | ((result: {
          tempFilePaths: string[];
          tempFiles: Array<{ size: number; name: string; type: string }>;
        }) => void)
      | undefined;
    vi.stubGlobal('uni', {
      ...uni,
      chooseImage: (options: { success: typeof chooseSuccess }) => {
        chooseSuccess = options.success;
      },
    });
    const disabled = ref(false);
    const initial: UploadFile = {
      uid: 'parent-seed',
      name: 'seed.png',
      url: 'seed.png',
      status: 'ready',
      progress: 12,
    };
    const snapshot = { ...initial };
    const files = ref<UploadFile[]>([initial]);
    let uploadApi: { chooseFile: () => Promise<void> } | null = null;
    let requestFile: UploadFile | undefined;
    const afterRead = vi.fn((target: UploadFile | UploadFile[]) => {
      const file = Array.isArray(target) ? target[0] : target;
      file.url = 'processed://selected.png';
      file.message = 'processed';
    });
    const mounted = mountWithRealForm(disabled, () =>
      h(LkUpload, {
        ref: (value: unknown) => {
          uploadApi = value as typeof uploadApi;
        },
        modelValue: files.value,
        action: '/upload',
        afterRead,
        customRequest: (options: { file: UploadFile }) => {
          requestFile = options.file;
        },
        'onUpdate:modelValue': (value: UploadFile[]) => {
          files.value = value.map(file => ({ ...file }));
        },
      })
    );
    await nextTick();

    await uploadApi?.chooseFile();
    expect(chooseSuccess).toBeTypeOf('function');
    chooseSuccess?.({
      tempFilePaths: ['selected.png'],
      tempFiles: [{ size: 10, name: 'selected.png', type: 'image/png' }],
    });
    await flushTicks(30);

    expect(initial).toEqual(snapshot);
    expect(files.value[0]).not.toBe(initial);
    expect(afterRead).toHaveBeenCalledOnce();
    expect(requestFile).toBeDefined();
    expect(requestFile).not.toBe(initial);
    expect(requestFile?.url).toBe('processed://selected.png');
    expect(files.value.find(file => file.uid === requestFile?.uid)).toMatchObject({
      url: 'processed://selected.png',
      message: expect.stringMatching(/upload|上传/i),
      status: 'uploading',
    });
    mounted.app.unmount();
  });

  it('Upload controlled parent removes the selected uid at first update -> no afterRead hook or request', async () => {
    let chooseSuccess:
      | ((result: {
          tempFilePaths: string[];
          tempFiles: Array<{ size: number; name: string; type: string }>;
        }) => void)
      | undefined;
    vi.stubGlobal('uni', {
      ...uni,
      chooseImage: (options: { success: typeof chooseSuccess }) => {
        chooseSuccess = options.success;
      },
    });
    const disabled = ref(false);
    const files = ref<UploadFile[]>([]);
    let uploadApi: { chooseFile: () => Promise<void> } | null = null;
    const afterRead = vi.fn();
    const customRequest = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkUpload, {
        ref: (value: unknown) => {
          uploadApi = value as typeof uploadApi;
        },
        modelValue: files.value,
        action: '/upload',
        afterRead,
        customRequest,
        'onUpdate:modelValue': () => {
          files.value = [];
        },
      })
    );
    await nextTick();

    await uploadApi?.chooseFile();
    chooseSuccess?.({
      tempFilePaths: ['rejected.png'],
      tempFiles: [{ size: 10, name: 'rejected.png', type: 'image/png' }],
    });
    await flushTicks(12);

    expect(files.value).toEqual([]);
    expect(afterRead).not.toHaveBeenCalled();
    expect(customRequest).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it.each(['success', 'fail'] as const)(
    'Upload same-stack progress -> %s lets only the terminal stage publish after uploading',
    async terminal => {
      const disabled = ref(false);
      const files = ref<UploadFile[]>([
        { uid: `stage-${terminal}`, name: 'stage.png', url: 'stage.png', status: 'fail' },
      ]);
      let uploadApi: { retryUpload: (index: number) => Promise<void> } | null = null;
      const updates: string[] = [];
      const changes: string[] = [];
      const success = vi.fn();
      const fail = vi.fn();
      const mounted = mountWithRealForm(disabled, () =>
        h(LkUpload, {
          ref: (value: unknown) => {
            uploadApi = value as typeof uploadApi;
          },
          modelValue: files.value,
          action: '/upload',
          customRequest: (options: {
            onProgress: (progress: number) => void;
            onSuccess: (response: unknown) => void;
            onFail: (error: unknown) => void;
          }) => {
            options.onProgress(50);
            if (terminal === 'success') options.onSuccess({ ok: true });
            else options.onFail(new Error('failed'));
          },
          'onUpdate:modelValue': (value: UploadFile[]) => {
            updates.push(value[0]?.status || 'empty');
            files.value = value.map(file => ({ ...file }));
          },
          onChange: (value: UploadFile[]) => changes.push(value[0]?.status || 'empty'),
          onSuccess: success,
          onFail: fail,
        })
      );
      await nextTick();

      await uploadApi?.retryUpload(0);
      await flushTicks(12);

      expect(updates).toEqual(['uploading', terminal]);
      expect(changes).toEqual(['uploading', terminal]);
      expect(success).toHaveBeenCalledTimes(terminal === 'success' ? 1 : 0);
      expect(fail).toHaveBeenCalledTimes(terminal === 'fail' ? 1 : 0);
      expect(files.value[0].progress).toBe(terminal === 'success' ? 100 : 50);
      mounted.app.unmount();
    }
  );

  it('Upload fail listener retries same uid -> stale autoRemove never deletes the new attempt', async () => {
    vi.useFakeTimers();
    const disabled = ref(false);
    const files = ref<UploadFile[]>([
      { uid: 'retry-after-fail', name: 'retry.png', url: 'retry.png', status: 'fail' },
    ]);
    let uploadApi: { retryUpload: (index: number) => Promise<void> } | null = null;
    const callbacks: Array<{
      onFail: (error: unknown) => void;
      onSuccess: (value: unknown) => void;
    }> = [];
    const aborts = [vi.fn(), vi.fn()];
    const mounted = mountWithRealForm(disabled, () =>
      h(LkUpload, {
        ref: (value: unknown) => {
          uploadApi = value as typeof uploadApi;
        },
        modelValue: files.value,
        action: '/upload',
        autoRemoveFail: true,
        customRequest: (options: {
          onFail: (error: unknown) => void;
          onSuccess: (value: unknown) => void;
        }) => {
          const index = callbacks.length;
          callbacks.push(options);
          return { abort: aborts[index] };
        },
        'onUpdate:modelValue': (value: UploadFile[]) => {
          files.value = value.map(file => ({ ...file }));
        },
        onFail: () => {
          void uploadApi?.retryUpload(0);
        },
      })
    );
    await nextTick();

    await uploadApi?.retryUpload(0);
    await callbacks[0].onFail(new Error('first failed'));
    await flushTicks(20);
    expect(callbacks).toHaveLength(2);
    expect(files.value[0].status).toBe('uploading');
    vi.advanceTimersByTime(2000);
    await flushTicks();
    expect(files.value).toHaveLength(1);
    expect(files.value[0].status).toBe('uploading');
    expect(aborts[1]).not.toHaveBeenCalled();

    callbacks[1].onSuccess({ ok: true });
    await flushTicks();
    vi.advanceTimersByTime(2000);
    expect(files.value).toHaveLength(1);
    expect(files.value[0].status).toBe('success');
    mounted.app.unmount();
  });

  it.each(['reorder', 'removed'] as const)(
    'Upload removeFile keeps uid ownership when parent list is %s during beforeDelete',
    async scenario => {
      const disabled = ref(false);
      const decision = deferred<boolean>();
      const a: UploadFile = { uid: 'delete-a', name: 'a.png', url: 'a.png', status: 'ready' };
      const b: UploadFile = { uid: 'delete-b', name: 'b.png', url: 'b.png', status: 'ready' };
      const files = ref<UploadFile[]>([a, b]);
      let uploadApi: { removeFile: (index: number) => Promise<void> } | null = null;
      const updates = vi.fn((value: UploadFile[]) => {
        files.value = value.map(file => ({ ...file }));
      });
      const deleted = vi.fn();
      const mounted = mountWithRealForm(disabled, () =>
        h(LkUpload, {
          ref: (value: unknown) => {
            uploadApi = value as typeof uploadApi;
          },
          modelValue: files.value,
          beforeDelete: () => decision.promise,
          'onUpdate:modelValue': updates,
          onDelete: deleted,
        })
      );
      await nextTick();

      const removal = uploadApi?.removeFile(0);
      files.value = scenario === 'reorder' ? [b, a] : [b];
      await nextTick();
      decision.resolve(true);
      await removal;
      await flushTicks();

      expect(files.value.map(file => file.uid)).toEqual(['delete-b']);
      if (scenario === 'reorder') {
        expect(deleted).toHaveBeenCalledWith(expect.objectContaining({ uid: 'delete-a' }), {
          index: 1,
        });
      } else {
        expect(updates).not.toHaveBeenCalled();
        expect(deleted).not.toHaveBeenCalled();
      }
      mounted.app.unmount();
    }
  );

  it('Upload confirmRemove stores uid so parent reorder cannot redirect deletion by index', async () => {
    const disabled = ref(false);
    const a: UploadFile = { uid: 'confirm-a', name: 'a.png', url: 'a.png', status: 'ready' };
    const b: UploadFile = { uid: 'confirm-b', name: 'b.png', url: 'b.png', status: 'ready' };
    const files = ref<UploadFile[]>([a, b]);
    let uploadApi: { confirmRemove: (index: number) => void } | null = null;
    const deleted = vi.fn();
    const mounted = mountWithRealForm(disabled, () =>
      h(LkUpload, {
        ref: (value: unknown) => {
          uploadApi = value as typeof uploadApi;
        },
        modelValue: files.value,
        'onUpdate:modelValue': (value: UploadFile[]) => {
          files.value = value.map(file => ({ ...file }));
        },
        onDelete: deleted,
      })
    );
    await nextTick();

    uploadApi?.confirmRemove(0);
    files.value = [b, a];
    await nextTick();
    await dispatch(
      findNode(mounted.root, node => node.type === 'lk-modal-stub'),
      'onConfirm'
    );
    await flushTicks();

    expect(files.value.map(file => file.uid)).toEqual(['confirm-b']);
    expect(deleted).toHaveBeenCalledWith(expect.objectContaining({ uid: 'confirm-a' }), {
      index: 1,
    });
    mounted.app.unmount();
  });

  it('Upload clickPreview listener removes target uid -> no stale native preview', async () => {
    const previewImage = vi.fn();
    vi.stubGlobal('uni', { ...uni, previewImage });
    const disabled = ref(false);
    const files = ref<UploadFile[]>([
      { uid: 'preview-a', name: 'a.png', url: 'a.png', status: 'ready' },
      { uid: 'preview-b', name: 'b.png', url: 'b.png', status: 'ready' },
    ]);
    const mounted = mountWithRealForm(disabled, () =>
      h(LkUpload, {
        modelValue: files.value,
        onClickPreview: (file: UploadFile) => {
          files.value = files.value.filter(item => item.uid !== file.uid);
        },
      })
    );
    await nextTick();

    await dispatch(
      findNode(mounted.root, node => hasClass(node, 'lk-upload__item')),
      'onTap'
    );
    await flushTicks();

    expect(files.value.map(file => file.uid)).toEqual(['preview-b']);
    expect(previewImage).not.toHaveBeenCalled();
    mounted.app.unmount();
  });

  it.each(['progress', 'success', 'fail', 'disabled rollback'] as const)(
    'Upload %s keeps a controlled parent object immutable when update:modelValue is ignored',
    async scenario => {
      const disabled = ref(false);
      const initial: UploadFile = {
        uid: `immutable-${scenario}`,
        name: 'immutable.png',
        url: 'immutable.png',
        status: 'fail',
        progress: 17,
        message: 'seed failure',
        response: { seed: true },
      };
      const snapshot: UploadFile = {
        ...initial,
        response: { seed: true },
      };
      const controlled = [initial];
      const updates: UploadFile[][] = [];
      let uploadApi: { retryUpload: (index: number) => Promise<void> } | null = null;
      let requestFile: UploadFile | undefined;
      let customCallbacks:
        | {
            onProgress: (progress: number) => Promise<void>;
            onSuccess: (response: unknown) => Promise<void>;
            onFail: (error: unknown) => Promise<void>;
          }
        | undefined;
      const mounted = mountWithRealForm(disabled, () =>
        h(LkUpload, {
          ref: (value: unknown) => {
            uploadApi = value as typeof uploadApi;
          },
          modelValue: controlled,
          action: '/upload',
          previewImage: false,
          customRequest: (options: {
            file: UploadFile;
            onProgress: (progress: number) => Promise<void>;
            onSuccess: (response: unknown) => Promise<void>;
            onFail: (error: unknown) => Promise<void>;
          }) => {
            requestFile = options.file;
            customCallbacks = options;
          },
          'onUpdate:modelValue': (value: UploadFile[]) => {
            updates.push(value);
            // Intentionally ignore the controlled update.
          },
        })
      );
      await nextTick();

      await uploadApi?.retryUpload(0);

      expect(customCallbacks).toBeDefined();
      expect(requestFile).not.toBe(initial);
      expect(initial).toEqual(snapshot);

      if (scenario === 'progress') await customCallbacks?.onProgress(63);
      if (scenario === 'success') await customCallbacks?.onSuccess({ ok: true });
      if (scenario === 'fail') await customCallbacks?.onFail(new Error('network'));
      if (scenario === 'disabled rollback') {
        disabled.value = true;
        await nextTick();
      }

      expect(controlled).toEqual([snapshot]);
      expect(controlled[0]).toBe(initial);
      expect(initial).toEqual(snapshot);
      expect(updates.length).toBeGreaterThan(0);
      expect(updates.every(value => value[0] !== initial)).toBe(true);
      mounted.app.unmount();
    }
  );

  it.each(['customRequest', 'uni.uploadFile'] as const)(
    'Upload exposed removeFile aborts %s once and ignores every late callback',
    async transport => {
      const form = makeForm();
      const files = ref<UploadFile[]>([
        { uid: `remove-${transport}`, name: 'remove.png', url: 'remove.png', status: 'fail' },
      ]);
      const abort = vi.fn();
      let callbacks:
        | {
            onProgress: (progress: number) => Promise<void>;
            onSuccess: (response: unknown) => Promise<void>;
            onFail: (error: unknown) => Promise<void>;
          }
        | undefined;
      let native:
        | {
            success: (response: { data: unknown }) => Promise<void>;
            fail: (error: unknown) => Promise<void>;
          }
        | undefined;
      let nativeProgress: ((response: { progress: number }) => Promise<void>) | undefined;
      if (transport === 'uni.uploadFile') {
        vi.stubGlobal('uni', {
          ...uni,
          uploadFile: vi.fn(options => {
            native = options;
            return {
              abort,
              onProgressUpdate(callback: (response: { progress: number }) => Promise<void>) {
                nativeProgress = callback;
              },
            };
          }),
        });
      }
      const updates: UploadFile[][] = [];
      const change = vi.fn();
      const progress = vi.fn();
      const success = vi.fn();
      const fail = vi.fn();
      const deleted = vi.fn();
      const mounted = mountControl(LkUpload, form, () => ({
        modelValue: files.value,
        action: '/upload',
        customRequest:
          transport === 'customRequest'
            ? (options: NonNullable<typeof callbacks>) => {
                callbacks = options;
                return { abort };
              }
            : undefined,
        'onUpdate:modelValue': (value: UploadFile[]) => {
          files.value = value.map(file => ({ ...file }));
          updates.push(files.value);
        },
        onChange: change,
        onProgress: progress,
        onSuccess: success,
        onFail: fail,
        onDelete: deleted,
      }));

      await mounted.exposed()?.retryUpload(0 as never);
      await nextTick();
      await mounted.exposed()?.removeFile(0 as never);
      await nextTick();
      expect(files.value).toEqual([]);
      expect(abort).toHaveBeenCalledOnce();
      expect(deleted).toHaveBeenCalledOnce();
      const counts = {
        updates: updates.length,
        change: change.mock.calls.length,
        progress: progress.mock.calls.length,
        success: success.mock.calls.length,
        fail: fail.mock.calls.length,
      };

      if (callbacks) {
        await callbacks.onProgress(82);
        await callbacks.onSuccess({ ok: true });
        await callbacks.onFail(new Error('late'));
      }
      if (native) {
        await nativeProgress?.({ progress: 82 });
        await native.success({ data: { ok: true } });
        await native.fail(new Error('late'));
      }

      expect(files.value).toEqual([]);
      expect(updates).toHaveLength(counts.updates);
      expect(change).toHaveBeenCalledTimes(counts.change);
      expect(progress).toHaveBeenCalledTimes(counts.progress);
      expect(success).toHaveBeenCalledTimes(counts.success);
      expect(fail).toHaveBeenCalledTimes(counts.fail);
      mounted.app.unmount();
    }
  );

  it('Upload progress listener reentrant remove claims cancellation before removal events', async () => {
    const form = makeForm();
    const files = ref<UploadFile[]>([
      { uid: 'progress-remove', name: 'remove.png', url: 'remove.png', status: 'fail' },
    ]);
    const abort = vi.fn();
    let callbacks:
      | {
          onProgress: (progress: number) => Promise<void>;
          onSuccess: (response: unknown) => Promise<void>;
          onFail: (error: unknown) => Promise<void>;
        }
      | undefined;
    const changes: UploadFile[][] = [];
    let uploadApi: {
      retryUpload: (index: number) => Promise<void>;
      removeFile: (index: number) => Promise<void>;
    } | null = null;
    const mounted = mountControl(LkUpload, form, () => ({
      modelValue: files.value,
      action: '/upload',
      customRequest: (options: NonNullable<typeof callbacks>) => {
        callbacks = options;
        return { abort };
      },
      'onUpdate:modelValue': (value: UploadFile[]) => {
        files.value = value.map(file => ({ ...file }));
      },
      onChange: (value: UploadFile[]) => changes.push(value),
      onProgress: () => {
        void uploadApi?.removeFile(0);
      },
    }));
    uploadApi = mounted.exposed() as typeof uploadApi;

    await uploadApi?.retryUpload(0);
    const pendingProgress = callbacks?.onProgress(45);
    await pendingProgress;
    await nextTick();
    await Promise.resolve();

    expect(files.value).toEqual([]);
    expect(abort).toHaveBeenCalledOnce();
    expect(changes.at(-1)).toEqual([]);
    const changeCount = changes.length;
    await callbacks?.onSuccess({ late: true });
    expect(changes).toHaveLength(changeCount);
    mounted.app.unmount();
  });

  it('rolls controlled Upload clones back to ready when disabled mid-flight', async () => {
    const form = makeForm();
    const initial: UploadFile = {
      uid: 'file-1',
      name: 'file.png',
      url: 'file.png',
      status: 'fail',
      progress: 20,
      message: 'failed',
    };
    const parentFiles = ref([initial]);
    let customCallbacks: { onSuccess: (value: unknown) => void } | undefined;
    const updates: UploadFile[][] = [];
    const change = vi.fn();
    const mounted = mountControl(LkUpload, form, () => ({
      modelValue: parentFiles.value,
      action: '/upload',
      customRequest: (options: { onSuccess: (value: unknown) => void }) => {
        customCallbacks = options;
      },
      'onUpdate:modelValue': (value: UploadFile[]) => {
        parentFiles.value = value.map(file => ({ ...file }));
        updates.push(parentFiles.value);
      },
      onChange: change,
    }));

    await mounted.exposed()?.retryUpload(0 as never);
    await nextTick();
    expect(updates.at(-1)?.[0].status).toBe('uploading');
    expect(parentFiles.value[0]).not.toBe(initial);

    form.disabled = true;
    await nextTick();
    expect(updates.at(-1)?.[0]).toMatchObject({
      uid: 'file-1',
      status: 'fail',
      progress: 20,
      message: 'failed',
    });
    const updateCount = updates.length;
    const changeCount = change.mock.calls.length;
    await customCallbacks?.onSuccess({ ok: true });
    expect(updates).toHaveLength(updateCount);
    expect(change).toHaveBeenCalledTimes(changeCount);
    mounted.app.unmount();
  });

  it('does not schedule Upload auto-removal after a fail listener delivers Form.disabled', async () => {
    vi.useFakeTimers();
    const form = makeForm();
    const parentFiles = ref<UploadFile[]>([
      { uid: 'file-2', name: 'retry.png', url: 'retry.png', status: 'fail' },
    ]);
    let customCallbacks: { onFail: (error: unknown) => void } | undefined;
    const mounted = mountControl(LkUpload, form, () => ({
      modelValue: parentFiles.value,
      action: '/upload',
      autoRemoveFail: true,
      customRequest: (options: { onFail: (error: unknown) => void }) => {
        customCallbacks = options;
      },
      'onUpdate:modelValue': (value: UploadFile[]) => {
        parentFiles.value = value.map(file => ({ ...file }));
      },
      onFail: () => {
        form.disabled = true;
      },
    }));

    await mounted.exposed()?.retryUpload(0 as never);
    await customCallbacks?.onFail(new Error('failed'));
    await nextTick();
    vi.advanceTimersByTime(2000);

    expect(parentFiles.value).toHaveLength(1);
    expect(parentFiles.value[0].status).toBe('fail');
    mounted.app.unmount();
  });

  it('closes a pending Upload delete confirmation when Form becomes disabled', async () => {
    const form = makeForm();
    const files = ref<UploadFile[]>([
      { uid: 'file-delete', name: 'delete.png', url: 'delete.png', status: 'ready' },
    ]);
    const update = vi.fn((value: UploadFile[]) => {
      files.value = value.map(file => ({ ...file }));
    });
    const deleted = vi.fn();
    const mounted = mountControl(LkUpload, form, () => ({
      modelValue: files.value,
      previewImage: false,
      'onUpdate:modelValue': update,
      onDelete: deleted,
    }));

    mounted.exposed()?.confirmRemove(0 as never);
    await nextTick();
    const modal = findNode(mounted.root, node => node.type === 'lk-modal-stub');
    expect(modal.props.modelValue).toBe(true);

    form.disabled = true;
    await nextTick();
    expect(modal.props.modelValue).toBe(false);
    expect(files.value).toHaveLength(1);
    expect(update).not.toHaveBeenCalled();
    expect(deleted).not.toHaveBeenCalled();
    mounted.app.unmount();
  });
});
