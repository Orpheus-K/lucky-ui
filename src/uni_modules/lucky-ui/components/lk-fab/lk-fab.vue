<script setup lang="ts">
import type { CSSProperties, StyleValue } from 'vue';
import { ref, computed, watch } from 'vue';
import LkIcon from '../lk-icon/lk-icon.vue';
import LkOverlay from '../lk-overlay/lk-overlay.vue';
import { fabProps, fabEmits, type FabAction } from './fab.props';
import {
  canClickFabAction,
  resolveFabActionClass,
  resolveFabActionStyle,
  resolveFabCurrentIcon,
  resolveFabDirection,
  resolveFabDragPosition,
  resolveFabFinalPosition,
  resolveFabIconStyle,
  resolveFabInitialPosition,
  resolveFabIsAtRightSide,
  resolveFabMainClass,
  resolveFabMainStyle,
  resolveFabRootStyle,
  resolveFabSafeBottom,
  shouldCloseFabOnOverlay,
  shouldToggleFabOnClick,
  toFabRpx,
} from './fab.utils';

defineOptions({ name: 'LkFab' });

const props = defineProps(fabProps);
const emit = defineEmits(fabEmits);

const systemInfo = uni.getSystemInfoSync();
const windowWidth = systemInfo.windowWidth;
const windowHeight = systemInfo.windowHeight;
const safeBottom = systemInfo.safeAreaInsets?.bottom || 0;

function rpx2px(rpx: number): number {
  return uni.upx2px(rpx);
}

const sizePx = computed(() => rpx2px(toFabRpx(props.size)));
const actionSizePx = computed(() => rpx2px(toFabRpx(props.actionSize)));
const offsetPx = computed(() => rpx2px(toFabRpx(props.offset)));
const safeBottomPx = computed(() =>
  resolveFabSafeBottom({
    safeAreaInsetBottom: props.safeAreaInsetBottom,
    safeBottom,
  })
);

function resolvePosition() {
  return resolveFabInitialPosition({
    position: props.position,
    windowWidth,
    windowHeight,
    sizePx: rpx2px(toFabRpx(props.size)),
    offsetPx: rpx2px(toFabRpx(props.offset)),
    safeBottomPx: resolveFabSafeBottom({
      safeAreaInsetBottom: props.safeAreaInsetBottom,
      safeBottom,
    }),
    statusBarHeight: systemInfo.statusBarHeight || 0,
  });
}

const initialPosition = resolvePosition();
const posX = ref(initialPosition.x);
const posY = ref(initialPosition.y);
const isDragging = ref(false);
const isExpanded = ref(props.modelValue);

let dragStartX = 0;
let dragStartY = 0;
let startPosX = 0;
let startPosY = 0;
let dragStartTime = 0;
let hasMoved = false;
let velocity = { x: 0, y: 0 };
let lastPos = { x: 0, y: 0 };
let lastTime = 0;

watch(
  () => props.modelValue,
  val => {
    isExpanded.value = val;
  }
);

function onTouchStart(e: TouchEvent) {
  if (!props.draggable) return;
  if (!e.touches || e.touches.length === 0) return;

  const touch = e.touches[0];
  dragStartX = touch.clientX;
  dragStartY = touch.clientY;
  startPosX = posX.value;
  startPosY = posY.value;
  dragStartTime = Date.now();
  hasMoved = false;
  lastPos = { x: touch.clientX, y: touch.clientY };
  lastTime = Date.now();
  velocity = { x: 0, y: 0 };

  isDragging.value = true;
  emit('drag-start', { x: posX.value, y: posY.value, event: e });
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return;
  if (!e.touches || e.touches.length === 0) return;

  const touch = e.touches[0];
  const dx = touch.clientX - dragStartX;
  const dy = touch.clientY - dragStartY;

  const now = Date.now();
  const dt = now - lastTime;
  if (dt > 0) {
    velocity.x = (touch.clientX - lastPos.x) / dt;
    velocity.y = (touch.clientY - lastPos.y) / dt;
  }
  lastPos = { x: touch.clientX, y: touch.clientY };
  lastTime = now;

  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
    hasMoved = true;
  }

  const next = resolveFabDragPosition({
    startPosX,
    startPosY,
    dx,
    dy,
    windowWidth,
    windowHeight,
    sizePx: sizePx.value,
    safeBottomPx: safeBottomPx.value,
    statusBarHeight: systemInfo.statusBarHeight || 0,
  });

  posX.value = next.x;
  posY.value = next.y;
  emit('drag-move', { x: next.x, y: next.y, event: e });
}

function onTouchEnd(e?: TouchEvent) {
  if (!isDragging.value) return;
  isDragging.value = false;

  const duration = Date.now() - dragStartTime;
  const finalPosition = resolveFabFinalPosition({
    x: posX.value,
    y: posY.value,
    windowWidth,
    windowHeight,
    sizePx: sizePx.value,
    safeBottomPx: safeBottomPx.value,
    statusBarHeight: systemInfo.statusBarHeight || 0,
    magnetic: props.magnetic,
    offsetPx: offsetPx.value,
    velocityX: velocity.x,
  });

  posX.value = finalPosition.x;
  posY.value = finalPosition.y;

  emit('drag-end', { x: finalPosition.x, y: finalPosition.y, event: e });

  // 如果是点击而非拖拽，触发点击
  if (!hasMoved && duration < 200) {
    handleClick();
  }
}

function handleClick(event?: unknown) {
  emit('click', event);
  if (shouldToggleFabOnClick(props.actions.length)) {
    toggleExpand();
  }
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
  emit('update:modelValue', isExpanded.value);
  if (isExpanded.value) {
    emit('open');
  } else {
    emit('close');
  }
}

function handleActionClick(action: FabAction, event?: unknown) {
  if (!canClickFabAction(action)) {
    emit('action-disabled', action, event);
    return;
  }
  emit('action-click', action, event);
  isExpanded.value = false;
  emit('update:modelValue', false);
  emit('close');
}

function handleOverlayClick(event?: unknown) {
  emit('overlay-click', event);
  if (shouldCloseFabOnOverlay(props.closeOnOverlay)) {
    isExpanded.value = false;
    emit('update:modelValue', false);
    emit('close');
  }
}

const mainStyle = computed((): CSSProperties & Record<string, string | number> => {
  return resolveFabMainStyle({
    posX: posX.value,
    posY: posY.value,
    sizePx: sizePx.value,
    zIndex: props.zIndex,
    color: props.color,
    dragging: isDragging.value,
  });
});

const mainClass = computed(() =>
  resolveFabMainClass({
    expanded: isExpanded.value,
    dragging: isDragging.value,
    blur: props.blur,
  })
);
const rootStyle = computed<StyleValue>(() =>
  resolveFabRootStyle({
    zIndex: props.zIndex,
    customStyle: props.customStyle as StyleValue,
  })
);

const resolvedDirection = computed(() => {
  const next = resolveFabDirection({
    preferred: props.direction,
    actionSizePx: actionSizePx.value,
    gapPx: rpx2px(24),
    actionCount: props.actions.length,
    sizePx: sizePx.value,
    posX: posX.value,
    posY: posY.value,
    windowWidth,
    windowHeight,
    safeBottomPx: safeBottomPx.value,
    statusBarHeight: systemInfo.statusBarHeight || 0,
  });
  if (next !== props.direction) emit('direction-change', next, props.direction);
  return next;
});

function getActionStyle(index: number) {
  return resolveFabActionStyle({
    index,
    actionSizePx: actionSizePx.value,
    gapPx: rpx2px(24),
    sizePx: sizePx.value,
    direction: resolvedDirection.value,
    expanded: isExpanded.value,
    actionCount: props.actions.length,
  });
}

const iconStyle = computed(() =>
  resolveFabIconStyle({
    expanded: isExpanded.value,
    activeIcon: props.activeIcon,
  })
);

const isAtRightSide = computed(() =>
  resolveFabIsAtRightSide({
    posX: posX.value,
    sizePx: sizePx.value,
    windowWidth,
  })
);

const currentIcon = computed(() =>
  resolveFabCurrentIcon({
    expanded: isExpanded.value,
    icon: props.icon,
    activeIcon: props.activeIcon,
  })
);
</script>

<template>
  <view :id="id" class="lk-fab" :class="customClass" :style="rootStyle">
    <LkOverlay
      v-if="overlay"
      :show="isExpanded"
      :z-index="zIndex - 1"
      @click="handleOverlayClick"
    />

    <view
      class="lk-fab__container"
      :style="mainStyle"
      @touchstart.stop.prevent="onTouchStart"
      @touchmove.stop.prevent="onTouchMove"
      @touchend.stop.prevent="onTouchEnd"
    >
      <view
        v-for="(action, index) in actions"
        :key="action.key"
        class="lk-fab__action"
        :class="
          resolveFabActionClass({
            action,
            blur,
            atRightSide: isAtRightSide,
          })
        "
        :style="getActionStyle(index)"
        @tap.stop="handleActionClick(action, $event)"
      >
        <LkIcon :name="action.icon" :size="40" />
        <text v-if="action.label" class="lk-fab__action-label">{{ action.label }}</text>
      </view>

      <view :class="mainClass">
        <view class="lk-fab__icon" :style="iconStyle">
          <LkIcon :name="currentIcon" :size="48" color="white" />
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-fab.scss';
</style>
