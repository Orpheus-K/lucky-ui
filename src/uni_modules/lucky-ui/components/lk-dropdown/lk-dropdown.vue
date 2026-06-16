<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, provide, watch, computed } from 'vue';
import {
  dropdownProps,
  dropdownEmits,
  type DropdownSelectPayload,
  type DropdownValue,
} from './dropdown.props';
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
import {
  resolveDropdownMaskStyle,
  resolveDropdownMenuStyle,
  resolveDropdownNextOpen,
  resolveDropdownRootClass,
  resolveDropdownRootStyle,
  resolveDropdownTransitionConfig,
  shouldCloseDropdownOnSelect,
  shouldRenderDropdownMask,
  shouldToggleDropdownOnClick,
  shouldToggleDropdownOnHover,
} from './dropdown.utils';

defineOptions({ name: 'LkDropdown' });

const props = defineProps(dropdownProps);
const emit = defineEmits(dropdownEmits);
const rootStyle = computed<StyleValue>(() =>
  resolveDropdownRootStyle(props.customStyle as StyleValue)
);

const open = ref(false);
const active = ref(props.modelValue);
watch(
  () => props.modelValue,
  v => (active.value = v)
);

function toggle(v?: boolean) {
  const next = resolveDropdownNextOpen({
    targetOpen: v,
    currentOpen: open.value,
  });
  if (next === open.value) return;
  open.value = next;
  if (next) {
    emit('open');
  } else {
    emit('close');
  }
}
function selectItem(name: DropdownValue, payload: DropdownSelectPayload) {
  active.value = name;
  emit('update:modelValue', name);
  emit('select', payload);
  emit('change', name, payload);
  if (shouldCloseDropdownOnSelect(props.closeOnSelect)) toggle(false);
}

function onTriggerEnter() {
  if (shouldToggleDropdownOnHover(props.trigger)) toggle(true);
}
function onTriggerLeave() {
  if (shouldToggleDropdownOnHover(props.trigger)) toggle(false);
}
function onTriggerClick(event: unknown) {
  emit('click-trigger', event);
  if (shouldToggleDropdownOnClick(props.trigger)) toggle();
}

function onClickOutside(event: unknown) {
  emit('click-outside', event);
  toggle(false);
}

provide('LkDropdown', {
  active,
  selectItem,
  closeOnSelect: props.closeOnSelect,
});

const transitionConfig = computed(() =>
  resolveDropdownTransitionConfig({
    animationType: props.animationType,
    animation: props.animation,
    placement: props.placement,
    duration: props.duration,
    delay: props.delay,
    easing: props.easing,
  })
);
const {
  classes: menuClasses,
  styles: menuStyles,
  display,
} = useTransition(() => open.value, transitionConfig.value, {
  onAfterEnter: () => emit('after-enter'),
  onAfterLeave: () => emit('after-leave'),
});
const rootClass = computed(() =>
  resolveDropdownRootClass({
    placement: props.placement,
    customClass: props.customClass,
  })
);
const maskStyle = computed(() => resolveDropdownMaskStyle(props.zIndex));
const menuStyle = computed(() =>
  resolveDropdownMenuStyle({
    transitionStyles: menuStyles.value,
    zIndex: props.zIndex,
  })
);
</script>

<template>
  <view
    :id="id"
    class="lk-dropdown"
    :class="rootClass"
    :style="rootStyle"
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
  >
    <view
      v-if="
        shouldRenderDropdownMask({
          display,
          trigger,
          closeOnClickOutside,
        })
      "
      class="lk-dropdown__mask"
      :style="maskStyle"
      @tap="onClickOutside"
    />

    <view class="lk-dropdown__trigger" @tap="onTriggerClick">
      <slot />
    </view>
    <view
      v-if="display"
      class="lk-dropdown__menu lk-elevated"
      :class="menuClasses"
      :style="menuStyle"
    >
      <slot name="menu" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-dropdown.scss';
</style>
