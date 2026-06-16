<script setup lang="ts">
import { ref } from 'vue';
import LkSkeleton from '@/uni_modules/lucky-ui/components/lk-skeleton/lk-skeleton.vue';
import LkAvatar from '@/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const loading = ref(true);

const toggleLoading = () => {
  loading.value = !loading.value;
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-skeleton :rows="3" />
    </demo-block>

    <demo-block title="显示头像">
      <lk-skeleton avatar :rows="3" />
    </demo-block>

    <demo-block title="带标题">
      <lk-skeleton title avatar :rows="3" />
    </demo-block>

    <demo-block title="动画效果">
      <lk-skeleton animated :rows="3" />
    </demo-block>

    <demo-block title="自定义行宽与圆角">
      <lk-skeleton
        :rows="4"
        :row-width="['90%', '80%', '70%', '60%']"
        :animated="true"
        :round="true"
      />
    </demo-block>

    <demo-block title="头像尺寸与圆形头像">
      <lk-space wrap fill :gap="24">
        <lk-skeleton avatar :avatar-size="'56rpx'" :rows="2" />
        <lk-skeleton avatar round :avatar-size="'88rpx'" title :rows="2" />
      </lk-space>
    </demo-block>

    <demo-block title="实际应用">
      <lk-skeleton v-if="loading" avatar title :rows="4" animated />
      <view v-else class="content-loaded">
        <view class="user-info">
          <lk-avatar src="https://picsum.photos/100" size="lg" />
          <view class="user-text">
            <text class="user-name">张三</text>
            <text class="user-desc">前端开发工程师</text>
          </view>
        </view>
        <text class="content-text">
          这是一段加载完成后显示的文本内容。骨架屏可以在内容加载过程中提供良好的用户体验。
        </text>
      </view>
      <lk-button type="primary" style="margin-top: 16rpx" @click="toggleLoading">
        {{ loading ? '加载完成' : '重新加载' }}
      </lk-button>
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

.content-loaded {
  padding: 24rpx;
  background: var(--lk-bg-page);
  border-radius: 16rpx;
}

.user-info {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 24rpx;
  }
  margin-bottom: 24rpx;
}

.user-text {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 8rpx;
  }
}

.user-name {
  font-size: 32rpx;
  font-weight: 500;
  color: var(--lk-text-primary);
}

.user-desc {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
}

.content-text {
  font-size: 28rpx;
  color: var(--lk-text-primary);
  line-height: 1.6;
}
</style>
