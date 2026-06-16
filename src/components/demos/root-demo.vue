<script setup lang="ts">
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkRoot from '@/uni_modules/lucky-ui/components/lk-root/lk-root.vue';
import { toastStore } from '@/uni_modules/lucky-ui/components/lk-toast/toast-manager';

function showToast() {
  toastStore.show({
    message: 'Toast 已由 LkRoot 承载',
    position: 'bottom',
  });
}
</script>

<template>
  <lk-root class="component-demo root-demo" :full-height="false">
    <demo-block title="Toast 宿主">
      <lk-button block @click="showToast">显示 Toast</lk-button>
    </demo-block>
  </lk-root>
</template>

<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  padding-bottom: 60rpx;
}

.root-demo {
  --lk-demo-block-self-gap: 0;
}
</style>
