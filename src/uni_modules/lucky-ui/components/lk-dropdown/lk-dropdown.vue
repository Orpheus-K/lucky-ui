<script setup lang="ts">
import type { StyleValue } from 'vue';
import {
  ref,
  provide,
  watch,
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  getCurrentInstance,
} from 'vue';
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
  resolveDropdownTeleportTarget,
  resolveDropdownTransitionConfig,
  shouldCloseDropdownOnSelect,
  shouldRenderDropdownMask,
  shouldTeleportDropdown,
  shouldToggleDropdownOnClick,
  shouldToggleDropdownOnHover,
  type DropdownRect,
} from './dropdown.utils';

defineOptions({ name: 'LkDropdown' });

const props = defineProps(dropdownProps);
const emit = defineEmits(dropdownEmits);
const instance = getCurrentInstance();
const rootStyle = computed<StyleValue>(() =>
  resolveDropdownRootStyle(props.customStyle as StyleValue)
);
const triggerRef = ref<unknown>(null);
const triggerRect = ref<DropdownRect | null>(null);
const viewportSize = ref({ width: 0, height: 0 });
let dropdownTeleportSupported = false;
// #ifdef H5
dropdownTeleportSupported = true;
// #endif
const teleportEnabled = computed(
  () => dropdownTeleportSupported && shouldTeleportDropdown(props.teleport)
);
const teleportTarget = computed(() => resolveDropdownTeleportTarget(props.teleport));

const open = ref(false);
const active = ref(props.modelValue);
let hoverCloseTimer: ReturnType<typeof setTimeout> | undefined;
const dropdownHoverCloseDelay = 80;

watch(
  () => props.modelValue,
  v => (active.value = v)
);

type DropdownElementLike = {
  getBoundingClientRect?: () => Partial<DropdownRect>;
  $el?: DropdownElementLike;
};
type DropdownSelectorRect = Partial<DropdownRect>;
type DropdownSelectorNode = {
  boundingClientRect: (callback: (rect?: DropdownSelectorRect) => void) => DropdownSelectorQuery;
};
type DropdownSelectorQuery = {
  in?: (component: unknown) => DropdownSelectorQuery;
  select: (selector: string) => DropdownSelectorNode;
  exec: () => void;
};
type DropdownUni = {
  createSelectorQuery?: () => DropdownSelectorQuery;
  getSystemInfoSync?: () => {
    windowWidth?: number;
    windowHeight?: number;
  };
};

function normalizeRect(rect?: Partial<DropdownRect> | null): DropdownRect | null {
  if (!rect) return null;

  const left = Number(rect.left ?? 0);
  const top = Number(rect.top ?? 0);
  const width = Number(rect.width ?? Math.max(0, Number(rect.right ?? left) - left));
  const height = Number(rect.height ?? Math.max(0, Number(rect.bottom ?? top) - top));
  const right = Number(rect.right ?? left + width);
  const bottom = Number(rect.bottom ?? top + height);

  return {
    top,
    right,
    bottom,
    left,
    width,
    height,
  };
}

function resolveViewportSize() {
  const sys = (uni as unknown as DropdownUni).getSystemInfoSync?.();
  return {
    width: sys?.windowWidth || viewportSize.value.width || 0,
    height: sys?.windowHeight || viewportSize.value.height || 0,
  };
}

function setMenuPositionByRect(rect?: Partial<DropdownRect> | null) {
  const next = normalizeRect(rect);
  if (!next) return;
  triggerRect.value = next;
  viewportSize.value = resolveViewportSize();
}

function resolveElement(target: unknown): DropdownElementLike | null {
  const maybe = target as DropdownElementLike | null | undefined;
  if (!maybe) return null;
  if (typeof maybe.getBoundingClientRect === 'function') return maybe;
  if (maybe.$el && typeof maybe.$el.getBoundingClientRect === 'function') return maybe.$el;
  return null;
}

function updateMenuPositionByQuery() {
  const uniApi = uni as unknown as DropdownUni;
  let query = uniApi.createSelectorQuery?.();
  if (!query) return;
  if (query.in && instance?.proxy) query = query.in(instance.proxy);
  query
    .select('.lk-dropdown__trigger')
    .boundingClientRect(rect => {
      setMenuPositionByRect(rect);
    })
    .exec();
}

function updateMenuPosition(event?: unknown) {
  // #ifdef H5
  if (!teleportEnabled.value) return;
  const currentTarget = (event as { currentTarget?: unknown } | undefined)?.currentTarget;
  const el = resolveElement(currentTarget) || resolveElement(triggerRef.value);
  if (el?.getBoundingClientRect) {
    setMenuPositionByRect(el.getBoundingClientRect());
    return;
  }
  updateMenuPositionByQuery();
  // #endif
}

function scheduleMenuPositionUpdate() {
  nextTick(() => updateMenuPosition());
}

function clearHoverCloseTimer() {
  if (!hoverCloseTimer) return;
  clearTimeout(hoverCloseTimer);
  hoverCloseTimer = undefined;
}

function scheduleHoverClose() {
  clearHoverCloseTimer();
  hoverCloseTimer = setTimeout(() => {
    toggle(false);
    hoverCloseTimer = undefined;
  }, dropdownHoverCloseDelay);
}

function toggle(v?: boolean, event?: unknown) {
  const next = resolveDropdownNextOpen({
    targetOpen: v,
    currentOpen: open.value,
  });
  if (next === open.value) return;
  if (next) updateMenuPosition(event);
  open.value = next;
  if (next) {
    scheduleMenuPositionUpdate();
    emit('open');
  } else {
    emit('close');
  }
}

function selectItem(name: DropdownValue, payload: DropdownSelectPayload) {
  emit('select', payload);
  if (props.selectable) {
    active.value = name;
    emit('update:modelValue', name);
    emit('change', name, payload);
  }
  if (shouldCloseDropdownOnSelect(props.closeOnSelect)) toggle(false);
}

function onTriggerEnter(event?: unknown) {
  if (!shouldToggleDropdownOnHover(props.trigger)) return;
  clearHoverCloseTimer();
  toggle(true, event);
}
function onTriggerLeave() {
  if (!shouldToggleDropdownOnHover(props.trigger)) return;
  scheduleHoverClose();
}
function onTriggerClick(event: unknown) {
  emit('click-trigger', event);
  if (shouldToggleDropdownOnClick(props.trigger)) toggle(undefined, event);
}
function onMenuEnter() {
  if (!shouldToggleDropdownOnHover(props.trigger)) return;
  clearHoverCloseTimer();
}
function onMenuLeave() {
  if (!shouldToggleDropdownOnHover(props.trigger)) return;
  scheduleHoverClose();
}

function onClickOutside(event: unknown) {
  emit('click-outside', event);
  toggle(false);
}

provide('LkDropdown', {
  active,
  selectable: computed(() => props.selectable),
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

watch(
  () => display.value,
  val => {
    if (val) scheduleMenuPositionUpdate();
  }
);

const rootClass = computed(() =>
  resolveDropdownRootClass({
    placement: props.placement,
    menuAlign: props.menuAlign,
    customClass: props.customClass,
  })
);
const maskStyle = computed(() => resolveDropdownMaskStyle(props.zIndex));
const maskVisible = computed(() =>
  shouldRenderDropdownMask({
    display: display.value,
    trigger: props.trigger,
    closeOnClickOutside: props.closeOnClickOutside,
    lockScroll: props.lockScroll,
  })
);
const menuStyle = computed(() =>
  resolveDropdownMenuStyle({
    transitionStyles: menuStyles.value,
    zIndex: props.zIndex,
    teleported: teleportEnabled.value,
    placement: props.placement,
    menuAlign: props.menuAlign,
    triggerRect: triggerRect.value,
    viewportWidth: viewportSize.value.width,
    viewportHeight: viewportSize.value.height,
    menuWidth: props.menuWidth,
    menuMinWidth: props.menuMinWidth,
    menuMaxWidth: props.menuMaxWidth,
    menuFitContent: props.menuFitContent,
  })
);

function onViewportChange() {
  if (open.value) updateMenuPosition();
}

// #ifdef H5
onMounted(() => {
  window.addEventListener('scroll', onViewportChange, true);
  window.addEventListener('resize', onViewportChange);
});
// #endif

onBeforeUnmount(() => {
  clearHoverCloseTimer();
  // #ifdef H5
  window.removeEventListener('scroll', onViewportChange, true);
  window.removeEventListener('resize', onViewportChange);
  // #endif
});
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
    <view ref="triggerRef" class="lk-dropdown__trigger" @tap="onTriggerClick">
      <slot />
    </view>

    <!-- #ifdef H5 -->
    <teleport v-if="teleportEnabled" :to="teleportTarget">
      <view v-if="maskVisible" class="lk-dropdown__mask" :style="maskStyle" @tap="onClickOutside" />
      <view
        v-if="display"
        class="lk-dropdown__menu lk-elevated"
        :class="menuClasses"
        :style="menuStyle"
        @mouseenter="onMenuEnter"
        @mouseleave="onMenuLeave"
      >
        <view v-if="$slots['menu-top']" class="lk-dropdown__menu-top">
          <slot name="menu-top" />
        </view>
        <slot name="menu" />
        <view v-if="$slots['menu-bottom']" class="lk-dropdown__menu-bottom">
          <slot name="menu-bottom" />
        </view>
      </view>
    </teleport>
    <template v-else>
      <view v-if="maskVisible" class="lk-dropdown__mask" :style="maskStyle" @tap="onClickOutside" />
      <view
        v-if="display"
        class="lk-dropdown__menu lk-elevated"
        :class="menuClasses"
        :style="menuStyle"
        @mouseenter="onMenuEnter"
        @mouseleave="onMenuLeave"
      >
        <view v-if="$slots['menu-top']" class="lk-dropdown__menu-top">
          <slot name="menu-top" />
        </view>
        <slot name="menu" />
        <view v-if="$slots['menu-bottom']" class="lk-dropdown__menu-bottom">
          <slot name="menu-bottom" />
        </view>
      </view>
    </template>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view v-if="maskVisible" class="lk-dropdown__mask" :style="maskStyle" @tap="onClickOutside" />
    <view
      v-if="display"
      class="lk-dropdown__menu lk-elevated"
      :class="menuClasses"
      :style="menuStyle"
      @mouseenter="onMenuEnter"
      @mouseleave="onMenuLeave"
    >
      <view v-if="$slots['menu-top']" class="lk-dropdown__menu-top">
        <slot name="menu-top" />
      </view>
      <slot name="menu" />
      <view v-if="$slots['menu-bottom']" class="lk-dropdown__menu-bottom">
        <slot name="menu-bottom" />
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<style lang="scss">
@use './lk-dropdown.scss';
</style>
