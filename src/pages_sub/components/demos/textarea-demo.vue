<script setup lang="ts">
import { ref } from 'vue';
import LkTextarea from '@/uni_modules/lucky-ui/components/lk-textarea/lk-textarea.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const v1 = ref('');
const v2 = ref('');
const v3 = ref('');
const v4 = ref('初始内容'); // 演示清空
const v5 = ref('');
</script>

<template>
  <view class="component-demo">
    <demo-block title="风格变体 (Variant)">
      <view class="demo-col">
        <!-- 1. 默认描边 -->
        <lk-textarea v-model="v1" placeholder="Outline (默认): 经典描边风格" clearable />

        <!-- 2. 填充风格 (非常适合现代APP) -->
        <lk-textarea
          v-model="v2"
          variant="filled"
          placeholder="Filled: 填充风格，聚焦变白"
          clearable
        />

        <!-- 3. 无边框 (适合作为列表项) -->
        <lk-textarea
          v-model="v3"
          variant="flush"
          placeholder="Flush: 无边框，适合List"
          auto-height
        />
      </view>
    </demo-block>

    <demo-block title="清空与统计">
      <view class="tips">输入内容后，点击右侧 × 震动清空</view>
      <lk-textarea
        v-model="v4"
        variant="filled"
        placeholder="限制 50 字，带清空"
        :maxlength="50"
        show-count
        clearable
      />
    </demo-block>

    <demo-block title="高级插槽 (Footer Slot)">
      <lk-textarea v-model="v5" placeholder="写评论..." auto-height>
        <!-- 利用插槽放置一个发送按钮 -->
        <template #footer>
          <view class="quick-tags">
            <view class="tag">#好评</view>
            <view class="tag">#推荐</view>
          </view>
        </template>
      </lk-textarea>
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
  padding: 30rpx;
  background-color: var(--lk-bg-page);
}

.demo-col {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 24rpx;
  }
}

.tips {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  margin-bottom: 12rpx;
}

// 演示 footer 插槽样式
.quick-tags {
  display: flex;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
  .tag {
    font-size: 22rpx;
    color: var(--lk-color-primary);
    background: var(--lk-color-primary-soft);
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
  }
}
</style>
