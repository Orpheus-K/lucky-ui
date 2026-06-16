<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue';
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
import { tooltipProps, tooltipEmits } from './tooltip.props';
import {
  canMutateTooltipOpen,
  canUpdateTooltipOpen,
  createTooltipPayload,
  getFallbackPlacement,
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
// #ifdef MP
supportsHover = false;
// #endif
const open = computed({
  get: () => {
    return resolveTooltipOpen({
      always: props.always,
      modelValue: props.modelValue,
      innerOpen: innerOpen.value,
    });
  },
  set: (v: boolean) => {
    if (!canMutateTooltipOpen(props.always)) return; // 常驻时忽略外部变更
    if (props.modelValue === undefined) innerOpen.value = v;
    emit('update:modelValue', v);
  },
});

let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

type TooltipOpenTrigger = 'hover' | 'click' | 'manual' | 'default';
type TooltipCloseTrigger = TooltipOpenTrigger | 'disabled' | 'content';

function doOpen(
  v = true,
  trigger: TooltipOpenTrigger | TooltipCloseTrigger = props.trigger,
  event?: unknown
) {
  if (
    !canUpdateTooltipOpen({
      disabled: props.disabled,
      always: props.always,
      currentOpen: open.value,
      nextOpen: v,
    })
  )
    return;
  open.value = v;
  if (v) {
    const payload = createTooltipPayload({
      trigger: trigger as TooltipOpenTrigger,
      event,
    });
    emit('show', payload);
    emit('open', payload);
  } else {
    const payload = createTooltipPayload({
      trigger: trigger as TooltipCloseTrigger,
      event,
    });
    emit('hide', payload);
    emit('close', payload);
  }
}

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
  if (hideTimer) clearTimeout(hideTimer);
  showTimer = setTimeout(() => doOpen(true, 'hover', event), props.showDelay);
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
  if (showTimer) clearTimeout(showTimer);
  hideTimer = setTimeout(() => doOpen(false, 'hover', event), props.hideDelay);
}
function onTriggerClick(event?: unknown) {
  emit('click-trigger', event);
  if (
    !shouldToggleTooltipOnTriggerClick({
      always: props.always,
      trigger: props.trigger,
      supportsHover,
    })
  )
    return;
  doOpen(!open.value, 'click', event);
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
  if (hideTimer) clearTimeout(hideTimer);
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
  hideTimer = setTimeout(() => doOpen(false, 'content', event), props.hideDelay);
}

watch(
  () => props.disabled,
  v => {
    if (v) doOpen(false, 'disabled');
  }
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
  if (props.always || props.disabled) return;
  // 仅非受控时生效
  if (props.modelValue !== undefined) return;
  if (props.defaultOpen) {
    innerOpen.value = true;
    emit('show', { trigger: 'default' });
    emit('open', { trigger: 'default' });
  }
});

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
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
    @tap="onTriggerClick"
  >
    <view class="lk-tooltip__trigger">
      <slot />
    </view>

    <view
      v-if="display"
      :id="popId"
      class="lk-tooltip__pop lk-elevated"
      :class="placementClass"
      :style="{ ...popStyle, ...tipStyles }"
      @mouseenter="onContentEnter"
      @mouseleave="onContentLeave"
    >
      <view class="lk-tooltip__content" :class="tipClasses">
        <slot name="content">
          <text>{{ content }}</text>
        </slot>
      </view>
      <view class="lk-tooltip__arrow" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-tooltip.scss';
</style>
