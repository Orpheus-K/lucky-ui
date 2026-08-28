<script setup lang="ts">
import { ref } from 'vue';
import LkTextarea from '@/uni_modules/lucky-ui/components/lk-textarea/lk-textarea.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const v1 = ref('');
const v2 = ref('');
const v3 = ref('');
const v4 = ref('初始内容'); // 演示清空
const v5 = ref('');
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础描边风格 (Outline)">
      <lk-textarea v-model="v1" placeholder="默认 Outline 经典描边风格" clearable />
    </demo-block>

    <demo-block title="填充风格 (Filled)">
      <lk-textarea
        v-model="v2"
        variant="filled"
        placeholder="Filled: 浅色底填充，聚焦高亮边框"
        clearable
      />
    </demo-block>

    <demo-block title="无边框列表态 (Flush)">
      <view class="demo-cell-wrapper">
        <lk-textarea
          v-model="v3"
          variant="flush"
          label="详细地址"
          placeholder="请输入详细收货地址（街道、门牌号等）"
          auto-height
        />
      </view>
    </demo-block>

    <demo-block title="清空与字数限制">
      <view class="tips">支持快捷一键清空与实时字符统计</view>
      <lk-textarea
        v-model="v4"
        variant="filled"
        placeholder="限制 50 字，带清空"
        :maxlength="50"
        show-count
        clearable
      />
    </demo-block>

    <demo-block title="禁用与只读 (Disabled & Readonly)">
      <lk-space direction="vertical" :gap="24" fill>
        <lk-textarea model-value="禁用状态：不可编辑且不可聚焦" disabled />
        <lk-textarea model-value="只读状态：内容可查看复制，不弹出键盘" readonly />
      </lk-space>
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
  width: 100%;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
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

.demo-cell-wrapper {
  background-color: var(--lk-bg-container);
  padding: 16rpx 24rpx;
  border-radius: var(--lk-radius-lg);
}
</style>
