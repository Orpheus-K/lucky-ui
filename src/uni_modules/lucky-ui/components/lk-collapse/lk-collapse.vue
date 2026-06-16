<script setup lang="ts">
import { computed, provide, ref, watch, type StyleValue } from 'vue';
import {
  collapseEmits,
  collapseInjectionKey,
  collapseProps,
  type CollapseName,
} from './collapse.props';
import {
  getCollapseEmitValue,
  resolveCollapseRootClass,
  resolveCollapseRootStyle,
  resolveCollapseToggle,
  syncCollapseActive,
} from './collapse.utils';

defineOptions({ name: 'LkCollapse' });

const props = defineProps(collapseProps);
const emit = defineEmits(collapseEmits);

const active = ref<CollapseName[]>([]);
watch(() => props.modelValue, sync, { immediate: true });

function sync() {
  active.value = syncCollapseActive({
    modelValue: props.modelValue,
    accordion: props.accordion,
  });
}

function toggle(name: CollapseName, event?: unknown) {
  const result = resolveCollapseToggle({
    active: active.value,
    name,
    accordion: props.accordion,
  });
  emit('item-click', { name, expanded: result.wasOpen, event });
  emit('update:modelValue', result.modelValue);
  active.value = result.next;
  const emitValue = getCollapseEmitValue(active.value, props.accordion);
  emit('change', emitValue, name);
  if (result.wasOpen) {
    emit('close', name, emitValue);
  } else {
    emit('open', name, emitValue);
  }
}

const rootClass = computed(() =>
  resolveCollapseRootClass({
    variant: props.variant,
    customClass: props.customClass,
    bordered: props.bordered,
  })
);

const rootStyle = computed<StyleValue>(() =>
  resolveCollapseRootStyle({
    customStyle: props.customStyle as StyleValue,
    gap: props.gap,
  })
);

function clickDisabled(name: CollapseName, event?: unknown) {
  emit('click-disabled', { name, event });
}

provide(collapseInjectionKey, {
  active,
  accordion: props.accordion,
  animationDuration: props.animationDuration,
  animationTiming: props.animationTiming,
  toggle,
  clickDisabled,
});
</script>

<template>
  <view :id="id" :class="rootClass" :style="rootStyle">
    <slot />
  </view>
</template>

<style lang="scss">
@use './lk-collapse.scss';
</style>
