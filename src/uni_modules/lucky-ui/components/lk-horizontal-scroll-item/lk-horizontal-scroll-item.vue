<script setup lang="ts">
import { getCurrentInstance, inject, onBeforeUnmount, onMounted, onUpdated } from 'vue';
import {
  horizontalScrollContextKey,
  type HorizontalScrollRect,
} from '../lk-horizontal-scroll/horizontal-scroll.context';

defineOptions({ name: 'LkHorizontalScrollItem', options: { virtualHost: true } });
const instance = getCurrentInstance();
const context = inject(horizontalScrollContextKey, null);
let unregister: (() => void) | undefined;

// 在子项自身作用域测量，避免小程序中父组件无法查询插槽节点。
function measure(): Promise<HorizontalScrollRect | null> {
  return new Promise(resolve => {
    uni
      .createSelectorQuery()
      .in(instance?.proxy)
      .select('.lk-horizontal-scroll-item')
      .boundingClientRect(result => {
        const rect = Array.isArray(result) ? result[0] : result;
        resolve(
          rect && typeof rect.left === 'number' && typeof rect.width === 'number'
            ? { left: rect.left, width: rect.width }
            : null
        );
      })
      .exec();
  });
}
onMounted(() => {
  unregister = context?.register(measure);
});
onUpdated(() => {
  void context?.refresh();
});
onBeforeUnmount(() => unregister?.());
</script>

<template>
  <view class="lk-horizontal-scroll-item"><slot /></view>
</template>

<style lang="scss" scoped>
.lk-horizontal-scroll-item {
  flex: none;
  width: max-content;
}
</style>
