<script setup lang="ts">
defineOptions({ name: 'DemoBlock' });
defineProps({
  title: { type: String, default: '' },
  desc: { type: String, default: '' },
  padding: { type: Boolean, default: true },
});
</script>

<template>
  <view class="demo-block lk-demo-block">
    <view v-if="title || desc" class="demo-block__header lk-demo-block__header">
      <view v-if="title" class="demo-block__title lk-demo-block__title">{{ title }}</view>
      <view v-if="desc" class="demo-block__desc lk-demo-block__desc">{{ desc }}</view>
    </view>
    <view
      class="demo-block__body lk-demo-block__body"
      :class="{ 'no-pad': !padding, 'is-no-pad': !padding }"
      ><slot
    /></view>
  </view>
</template>

<style lang="scss">
@use './demo-block.scss';
</style>
