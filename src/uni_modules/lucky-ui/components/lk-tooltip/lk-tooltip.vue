<script setup lang="ts">
import type { StyleValue } from 'vue';
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  getCurrentInstance,
} from 'vue';
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
import { tooltipProps, tooltipEmits } from './tooltip.props';
import {
  createTooltipVisibilityController,
  getFallbackPlacement,
  isTooltipTouchLikeEvent,
  resolveTooltipOpen,
  resolveTooltipPlacementClass,
  resolveTooltipPopStyle,
  resolveTooltipTransitionConfig,
  shouldKeepTooltipContentHover,
  shouldOpenTooltipOnTriggerEnter,
  shouldToggleTooltipOnTriggerClick,
} from './tooltip.utils';

defineOptions({ name: 'LkTooltip' });

const props = defineProps(tooltipProps);
const emit = defineEmits(tooltipEmits);
const instance = getCurrentInstance();
const popId = `lk-tooltip-pop-${instance?.uid ?? Math.floor(Math.random() * 1000000)}`;

const innerOpen = ref(false);
const resolvedPlacement = ref(props.placement);
let supportsHover = true;
let lastTouchInputAt: number | undefined;
// #ifdef MP
supportsHover = false;
// #endif
// #ifdef H5
supportsHover =
  typeof globalThis.matchMedia !== 'function' ||
  globalThis.matchMedia('(hover: hover) and (pointer: fine)').matches;
// #endif
const visibilityController = createTooltipVisibilityController({
  getConfig: () => ({
    always: props.always,
    disabled: props.disabled,
    modelValue: props.modelValue,
    trigger: props.trigger,
  }),
  getInnerOpen: () => innerOpen.value,
  setInnerOpen: value => {
    innerOpen.value = value;
  },
  onUpdate: value => emit('update:modelValue', value),
  onVisibilityChange: (visible, payload) => {
    if (visible) {
      emit('show', payload);
      emit('open', payload);
    } else {
      emit('hide', payload);
      emit('close', payload);
    }
  },
  defer: callback => void nextTick(callback),
});
const open = computed(() =>
  resolveTooltipOpen({
    always: props.always,
    disabled: props.disabled,
    modelValue: props.modelValue,
    innerOpen: innerOpen.value,
  })
);

function onTriggerEnter(event?: unknown) {
  emit('mouseenter-trigger', event);
  if (
    !shouldOpenTooltipOnTriggerEnter({
      supportsHover,
      always: props.always,
      trigger: props.trigger,
    })
  )
    return;
  visibilityController.scheduleOpen('hover', event, props.showDelay);
}
function onTriggerLeave(event?: unknown) {
  emit('mouseleave-trigger', event);
  if (
    !shouldOpenTooltipOnTriggerEnter({
      supportsHover,
      always: props.always,
      trigger: props.trigger,
    })
  )
    return;
  visibilityController.scheduleClose('hover', event, props.hideDelay);
}
function onTriggerClick(event?: unknown) {
  emit('click-trigger', event);
  const touchLike = isTooltipTouchLikeEvent(event, { recentTouchAt: lastTouchInputAt });
  lastTouchInputAt = undefined;
  if (
    !shouldToggleTooltipOnTriggerClick({
      always: props.always,
      trigger: props.trigger,
      supportsHover,
      touchLike,
    })
  )
    return;
  visibilityController.request(!visibilityController.getRequestedOpen(), 'click', event);
}
function onTriggerTouchStart() {
  lastTouchInputAt = Date.now();
}
function onContentEnter(event?: unknown) {
  emit('mouseenter-content', event);
  if (
    !shouldKeepTooltipContentHover({
      always: props.always,
      trigger: props.trigger,
    })
  )
    return;
  visibilityController.cancelHide();
}
function onContentLeave(event?: unknown) {
  emit('mouseleave-content', event);
  if (
    !shouldKeepTooltipContentHover({
      always: props.always,
      trigger: props.trigger,
    })
  )
    return;
  visibilityController.scheduleClose('content', event, props.hideDelay);
}

watch(
  () => [props.disabled, props.always, props.modelValue, innerOpen.value, props.trigger] as const,
  (_value, oldValue) => {
    if (oldValue && oldValue[4] !== props.trigger) visibilityController.cancelTimers();
    visibilityController.sync('external');
  },
  { flush: 'sync' }
);

watch(
  () => props.placement,
  v => {
    resolvedPlacement.value = v;
  }
);

type TooltipRect = Record<'top' | 'right' | 'bottom' | 'left', number>;
type TooltipSelectorNode = {
  boundingClientRect: (callback: (rect?: TooltipRect) => void) => TooltipSelectorQuery;
};
type TooltipSelectorQuery = {
  in?: (component: unknown) => TooltipSelectorQuery;
  select: (selector: string) => TooltipSelectorNode;
  exec: () => void;
};
type TooltipUni = {
  createSelectorQuery?: () => TooltipSelectorQuery;
  getSystemInfoSync: () => {
    windowWidth?: number;
    windowHeight?: number;
  };
};

function adjustPlacementByViewport() {
  if (!display.value) return;

  nextTick(() => {
    const uniApi = uni as unknown as TooltipUni;
    let query = uniApi.createSelectorQuery?.();
    if (!query) return;
    if (query.in && instance?.proxy) query = query.in(instance.proxy);

    query
      .select(`#${popId}`)
      .boundingClientRect(rect => {
        if (!rect) return;
        const sys = uniApi.getSystemInfoSync();
        const vw = sys.windowWidth || 375;
        const vh = sys.windowHeight || 667;
        const next = getFallbackPlacement(props.placement, rect, vw, vh) as typeof props.placement;
        if (next !== resolvedPlacement.value) {
          const old = resolvedPlacement.value;
          resolvedPlacement.value = next;
          emit('placement-change', next, old);
        }
      })
      .exec();
  });
}

// 计算方位 class 与偏移变量
const placementClass = computed(() => resolveTooltipPlacementClass(resolvedPlacement.value));
const popStyle = computed(() =>
  resolveTooltipPopStyle({
    offset: props.offset,
    zIndex: props.zIndex,
    width: props.width,
  })
);

onMounted(() => {
  if (props.defaultOpen) visibilityController.setDefaultOpen();
});

onBeforeUnmount(() => visibilityController.destroy());

const transitionConfig = computed(() =>
  resolveTooltipTransitionConfig({
    animationType: props.animationType,
    animation: props.animation,
    placement: resolvedPlacement.value,
    duration: props.duration,
    delay: props.delay,
    easing: props.easing,
  })
);

const {
  classes: tipClasses,
  styles: tipStyles,
  display,
} = useTransition(() => open.value, transitionConfig.value, {
  onAfterEnter: () => emit('after-enter'),
  onAfterLeave: () => emit('after-leave'),
});

const rootStyle = computed<StyleValue>(() => props.customStyle as StyleValue);

watch(
  () => display.value,
  val => {
    if (val) adjustPlacementByViewport();
  },
  { immediate: true }
);

watch(
  () => open.value,
  val => {
    if (val) adjustPlacementByViewport();
  }
);
</script>

<template>
  <view
    :id="id"
    class="lk-tooltip"
    :class="[customClass, disabled && 'is-disabled', always && 'is-always']"
    :style="rootStyle"
  >
    <view
      class="lk-tooltip__trigger"
      @mouseenter="onTriggerEnter"
      @mouseleave="onTriggerLeave"
      @touchstart="onTriggerTouchStart"
      @tap="onTriggerClick"
    >
      <slot />
    </view>

    <view
      v-if="display"
      :id="popId"
      class="lk-tooltip__pop"
      :class="placementClass"
      :style="popStyle"
      @mouseenter="onContentEnter"
      @mouseleave="onContentLeave"
      @tap.stop
    >
      <view class="lk-tooltip__body lk-elevated" :class="tipClasses" :style="tipStyles">
        <view class="lk-tooltip__content">
          <slot name="content">
            <text>{{ content }}</text>
          </slot>
        </view>
        <view class="lk-tooltip__arrow" />
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-tooltip.scss';
</style>
