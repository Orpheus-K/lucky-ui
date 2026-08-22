<script setup lang="ts">
import { ref } from 'vue';
import LkBadge from '@/uni_modules/lucky-ui/components/lk-badge/lk-badge.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkAvatar from '@/uni_modules/lucky-ui/components/lk-avatar/lk-avatar.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const badgeCount = ref(5);

const increaseBadge = () => {
  badgeCount.value++;
  uni.showToast({ title: `徽章计数: ${badgeCount.value}`, icon: 'none' });
};

const resetBadge = () => {
  badgeCount.value = 5;
  uni.showToast({ title: '徽章已重置', icon: 'none' });
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-space wrap>
        <lk-badge :value="5">
          <lk-button>消息</lk-button>
        </lk-badge>
        <lk-badge :value="99" :max="99">
          <lk-icon name="bell-fill" size="44" />
        </lk-badge>
        <lk-badge :value="188" :max="99">
          <lk-icon name="envelope-fill" size="44" />
        </lk-badge>
      </lk-space>
    </demo-block>

    <demo-block title="小红点">
      <lk-space wrap>
        <lk-badge dot bg-color="#f00">
          <lk-button>新消息</lk-button>
        </lk-badge>
        <lk-badge dot bg-color="#f00">
          <lk-icon name="chat-dots-fill" size="44" />
        </lk-badge>
        <lk-badge dot bg-color="#f00">
          <lk-avatar text="U" />
        </lk-badge>
      </lk-space>
    </demo-block>

    <demo-block title="自定义内容">
      <lk-space wrap>
        <lk-badge :value="'HOT'" type="danger">
          <lk-button>热门</lk-button>
        </lk-badge>
        <lk-badge :value="'NEW'" type="success">
          <lk-button>最新</lk-button>
        </lk-badge>
        <lk-badge :value="'VIP'" type="warning">
          <lk-icon name="person-fill" size="44" />
        </lk-badge>
      </lk-space>
    </demo-block>

    <demo-block title="不同类型">
      <lk-space wrap>
        <lk-badge :value="8" type="primary" color="#000">
          <lk-button>主要</lk-button>
        </lk-badge>
        <lk-badge :value="8" type="success">
          <lk-button>成功</lk-button>
        </lk-badge>
        <lk-badge :value="8" type="warning" color="#000">
          <lk-button>告警</lk-button>
        </lk-badge>
        <lk-badge :value="8" type="danger">
          <lk-button>危险</lk-button>
        </lk-badge>
        <lk-badge :value="8" type="info">
          <lk-button>信息</lk-button>
        </lk-badge>
      </lk-space>
    </demo-block>

    <demo-block title="动态徽章">
      <lk-space wrap>
        <lk-badge :value="badgeCount">
          <lk-button @click="increaseBadge">点击增加</lk-button>
        </lk-badge>
        <lk-button size="md" @click="resetBadge">重置</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="实用场景">
      <lk-space wrap :gap="32">
        <lk-badge :value="3" type="danger">
          <view class="scene-item">
            <lk-icon name="chat-dots-fill" size="40" />
            <text>消息</text>
          </view>
        </lk-badge>
        <lk-badge :value="12" type="danger">
          <view class="scene-item">
            <lk-icon name="bell-fill" size="40" />
            <text>通知</text>
          </view>
        </lk-badge>
        <lk-badge :value="99" :max="99" type="danger">
          <view class="scene-item">
            <lk-icon name="envelope-fill" size="40" />
            <text>邮件</text>
          </view>
        </lk-badge>
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

.scene-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 8rpx;
  }
  padding: 16rpx;
  background: var(--lk-bg-container);
  border-radius: var(--lk-radius-md);

  text {
    font-size: 22rpx;
    color: var(--lk-text-secondary);
  }
}
</style>
