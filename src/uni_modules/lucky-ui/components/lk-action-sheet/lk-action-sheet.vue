<script setup lang="ts">
import type { StyleValue } from 'vue';
import { computed, watch, ref } from 'vue';
import LkPopup from '../lk-popup/lk-popup.vue';
import { actionSheetProps, actionSheetEmits, type Action } from './action-sheet.props';
import { useRipple } from '@/uni_modules/lucky-ui/composables/useRipple';
import { useLocale } from '../../composables/useLocale';
import {
  canSelectAction,
  createActionSheetPayload,
  resolveActionSheetCancelClass,
  resolveActionSheetCancelText,
  resolveActionSheetItemClass,
  resolveActionSheetItemStyle,
  resolveActionSheetListClass,
  resolveActionSheetRootStyle,
  shouldCloseAfterAction,
} from './action-sheet.utils';

defineOptions({ name: 'LkActionSheet' });

const props = defineProps(actionSheetProps);
const emit = defineEmits(actionSheetEmits);
const { t } = useLocale('actionSheet');

const { rippleActive, rippleWaveStyle, triggerRipple } = useRipple();
const activeIndex = ref<number | string>(-1);
const rootStyle = computed<StyleValue>(() =>
  resolveActionSheetRootStyle(props.customStyle as StyleValue)
);

/**
 * 监听 modelValue 变化，打开或关闭动作面板
 */
watch(
  () => props.modelValue,
  v => (v ? emit('open') : emit('close'))
);

/**
 * 隐藏动作面板
 */
function hide() {
  emit('update:modelValue', false);
}

/**
 * 选项点击事件
 * @param act 选项
 * @param idx 选项索引
 * @param event 事件对象
 */
function onSelect(act: Action, idx: number, event: unknown) {
  if (!canSelectAction(act)) return;

  activeIndex.value = idx;
  triggerRipple(event);

  const payload = createActionSheetPayload({ action: act, index: idx, event });
  emit('click-action', payload);
  emit('select', payload);
  if (shouldCloseAfterAction(props.closeOnClickAction)) hide();
}

/**
 * 取消按钮点击事件
 * @param event 事件对象
 */
function cancel(event: unknown) {
  activeIndex.value = 'cancel';
  triggerRipple(event);

  emit('click-cancel', event);
  emit('cancel', event);
  hide();
}

/**
 * 监听 popup 的 modelValue 变化，向上抛出，避免在子组件内对 prop 写入引发警告
 * @param v 是否显示
 */
function onPopupModelChange(v: boolean) {
  emit('update:modelValue', v);
}
const resolvedCancelText = computed(() =>
  resolveActionSheetCancelText({
    cancelText: props.cancelText,
    fallback: t('cancel'),
  })
);
</script>

<template>
  <lk-popup
    :model-value="modelValue"
    position="bottom"
    :round="true"
    :z-index="zIndex"
    :animation="animation"
    :animation-type="animationType"
    :duration="duration"
    :delay="delay"
    :easing="easing"
    @update:model-value="onPopupModelChange"
    @click-overlay="emit('click-overlay', $event)"
    @after-enter="emit('after-enter')"
    @after-leave="emit('after-leave')"
  >
    <view :id="id" class="lk-action-sheet" :class="customClass" :style="rootStyle">
      <view v-if="title || description" class="lk-action-sheet__head">
        <text v-if="title" class="lk-action-sheet__title">{{ title }}</text>
        <text v-if="description" class="lk-action-sheet__desc">{{ description }}</text>
      </view>

      <view
        class="lk-action-sheet__list"
        :class="resolveActionSheetListClass({ title, description })"
      >
        <view
          v-for="(a, i) in actions"
          :key="i"
          class="lk-action-sheet__item lk-ripple"
          :class="
            resolveActionSheetItemClass({
              action: a,
              rippleActive,
              activeIndex,
              index: i,
            })
          "
          :style="resolveActionSheetItemStyle(a)"
          @tap="onSelect(a, i, $event)"
        >
          <text class="lk-action-sheet__name">{{ a.name }}</text>
          <text v-if="a.sub" class="lk-action-sheet__sub">{{ a.sub }}</text>
          <view v-if="a.loading" class="lk-action-sheet__spinner" />
          <view class="lk-ripple__wave" :style="rippleWaveStyle" />
        </view>
      </view>

      <view
        v-if="cancelText || t('cancel')"
        class="lk-action-sheet__cancel lk-ripple"
        :class="resolveActionSheetCancelClass({ rippleActive, activeIndex })"
        @tap="cancel"
      >
        <text class="lk-action-sheet__cancel-text">{{ resolvedCancelText }}</text>
        <view class="lk-ripple__wave" :style="rippleWaveStyle" />
      </view>
      <view v-if="safeArea" class="lk-action-sheet__safe" />
    </view>
  </lk-popup>
</template>

<style lang="scss">
@use './lk-action-sheet.scss';
</style>
