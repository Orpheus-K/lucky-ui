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

    <!-- #ifdef H5 -->
    <demo-block title="H5 native select reset">
      <view
        id="theme-select-reset-fixture"
        class="theme-select-reset-fixture"
        data-expected-font-family="Courier New"
        data-expected-font-size="19px"
      >
        <text id="theme-select-reset-reference">Inherited font reference</text>
        <select
          id="theme-select-reset-probe"
          class="theme-select-reset-probe"
          aria-label="Theme select reset probe"
          data-reset-contract="font-inherit"
        >
          <option>Inherited font select</option>
        </select>
      </view>
    </demo-block>
    <!-- #endif -->
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

/* #ifdef H5 */
.theme-select-reset-fixture {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  color: var(--lk-text-primary);
  font-family: 'Courier New', monospace;
  font-size: 19px;
  font-style: italic;
  font-weight: 700;
  line-height: 29px;
  background: var(--lk-fill-1);
  border-radius: var(--lk-radius-sm);
}

.theme-select-reset-probe {
  width: 100%;
  padding: 8px 12px;
  color: inherit;
  background: var(--lk-bg-container);
  border: 1px solid var(--lk-color-border);
  border-radius: var(--lk-radius-xs);
}
/* #endif */
</style>
