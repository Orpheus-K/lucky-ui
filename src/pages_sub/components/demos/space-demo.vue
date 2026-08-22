<script setup lang="ts">
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
</script>

<template>
  <view class="component-demo">
    <demo-block title="水平间距">
      <lk-space gap="md">
        <lk-button>按钮一</lk-button>
        <lk-button>按钮二</lk-button>
        <lk-button>按钮三</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="垂直间距 + 分隔符">
      <lk-space direction="vertical" :gap="16">
        <view class="cell">项目 A</view>
        <view class="cell">项目 B</view>
        <view class="cell">项目 C</view>
      </lk-space>
    </demo-block>

    <demo-block title="自动换行">
      <lk-space wrap gap="lg">
        <view v-for="i in 24" :key="i" class="tag">标签{{ i }}</view>
      </lk-space>
    </demo-block>
  </view>
</template>
<style scoped lang="scss">
.component-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
}
.cell {
  border-radius: var(--lk-radius-sm);
  background: var(--lk-color-primary-soft);
}
.tag {
  background: var(--lk-color-primary-soft);
  color: var(--lk-color-primary);
  border-radius: var(--lk-radius-sm);
}
</style>
