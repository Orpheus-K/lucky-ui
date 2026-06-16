<script setup lang="ts">
import type { StyleValue } from 'vue';
import { tagEmits, tagProps } from './tag.props';
import { computed } from 'vue';
import { resolveTagClass, resolveTagEventName, resolveTagStyle } from './tag.utils';

defineOptions({ name: 'LkTag' });

const props = defineProps(tagProps);
const emit = defineEmits(tagEmits);

function onClose(e: unknown) {
  const eventName = resolveTagEventName('close', props.disabled);
  if (eventName === 'close-disabled') {
    emit('close-disabled', e);
    return;
  }
  emit('close', e);
}

function onClick(e: unknown) {
  const eventName = resolveTagEventName('click', props.disabled);
  if (eventName === 'click-disabled') {
    emit('click-disabled', e);
    return;
  }
  emit('click', e);
}

const tagClass = computed(() =>
  resolveTagClass({
    type: props.type,
    size: props.size,
    disabled: props.disabled,
    round: props.round,
    closable: props.closable,
    customClass: props.customClass,
  })
);

const customStyle = computed(() =>
  resolveTagStyle({
    type: props.type,
    color: props.color,
    textColor: props.textColor,
    bgColor: props.bgColor,
  })
);
</script>

<template>
  <view
    :id="id"
    class="lk-tag"
    :class="tagClass"
    :style="[customStyle, props.customStyle as StyleValue]"
    @tap="onClick"
  >
    <view class="lk-tag__content">
      <slot />
    </view>
    <view v-if="props.closable" class="lk-tag__close" @tap.stop="onClose">×</view>
  </view>
</template>

<style lang="scss">
@use './lk-tag.scss';
</style>
