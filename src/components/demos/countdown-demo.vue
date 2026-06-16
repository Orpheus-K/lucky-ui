<script setup lang="ts">
import { computed, ref } from 'vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkCountdown from '@/uni_modules/lucky-ui/components/lk-countdown/lk-countdown.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';

const manualRef = ref<InstanceType<typeof LkCountdown>>();
const eventText = ref('等待倒计时结束');
const flashSaleTarget = ref(Date.now() + 2 * 60 * 60 * 1000 + 18 * 60 * 1000);

const slotTarget = computed(() => Date.now() + 36 * 60 * 60 * 1000 + 8 * 60 * 1000);

function restartManual() {
  manualRef.value?.reset(true);
  eventText.value = '已重新开始';
}

function pauseManual() {
  manualRef.value?.pause();
  eventText.value = '已暂停';
}

function resumeManual() {
  manualRef.value?.start();
  eventText.value = '继续倒计时';
}

function refreshTarget() {
  flashSaleTarget.value = Date.now() + 2 * 60 * 60 * 1000 + 18 * 60 * 1000;
}

function onFinish() {
  eventText.value = '倒计时已完成';
}
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <view class="demo-card">
        <lk-countdown :time="30 * 60 * 1000" />
        <text class="demo-desc">默认 block 形态，适合活动卡片与任务时限。</text>
      </view>
    </demo-block>

    <demo-block title="目标时间">
      <view class="sale-panel">
        <view class="sale-copy">
          <text class="sale-title">限时抢购</text>
          <text class="sale-desc">距本轮结束</text>
        </view>
        <lk-countdown
          :target-time="flashSaleTarget"
          format="HH:mm:ss"
          type="danger"
          variant="card"
          size="lg"
        />
      </view>
      <lk-button size="sm" type="primary" plain @click="refreshTarget">重置目标时间</lk-button>
    </demo-block>

    <demo-block title="不同状态">
      <view class="state-list">
        <view class="state-row">
          <text class="state-label">Primary</text>
          <lk-countdown :time="8 * 60 * 1000" type="primary" size="sm" />
        </view>
        <view class="state-row">
          <text class="state-label">Success</text>
          <lk-countdown :time="8 * 60 * 1000" type="success" size="sm" />
        </view>
        <view class="state-row">
          <text class="state-label">Warning</text>
          <lk-countdown :time="8 * 60 * 1000" type="warning" size="sm" />
        </view>
      </view>
    </demo-block>

    <demo-block title="格式化">
      <view class="demo-stack">
        <lk-countdown
          :time="26 * 60 * 60 * 1000 + 12 * 60 * 1000"
          format="DD天 HH:mm:ss"
          type="info"
        />
        <lk-countdown
          :time="9 * 60 * 1000 + 35 * 1000"
          format="mm分ss秒"
          variant="plain"
          type="primary"
        />
        <lk-countdown
          :time="90 * 1000"
          format="ss.SS秒"
          millisecond
          variant="plain"
          type="danger"
        />
      </view>
    </demo-block>

    <demo-block title="手动控制">
      <view class="demo-card">
        <lk-countdown
          ref="manualRef"
          :time="20 * 1000"
          :auto-start="false"
          format="ss秒"
          type="primary"
          @finish="onFinish"
        />
        <text class="demo-desc">{{ eventText }}</text>
        <lk-space wrap>
          <lk-button size="sm" type="primary" @click="resumeManual">开始</lk-button>
          <lk-button size="sm" plain @click="pauseManual">暂停</lk-button>
          <lk-button size="sm" plain @click="restartManual">重置</lk-button>
        </lk-space>
      </view>
    </demo-block>

    <demo-block title="自定义插槽">
      <lk-countdown v-slot="{ timeData }" :target-time="slotTarget" format="DD天HH:mm:ss">
        <view class="slot-card">
          <text class="slot-kicker">订阅剩余</text>
          <view class="slot-grid">
            <view class="slot-item">
              <text class="slot-value">{{ timeData.days }}</text>
              <text class="slot-unit">天</text>
            </view>
            <view class="slot-item">
              <text class="slot-value">{{ timeData.hours }}</text>
              <text class="slot-unit">小时</text>
            </view>
            <view class="slot-item">
              <text class="slot-value">{{ timeData.minutes }}</text>
              <text class="slot-unit">分钟</text>
            </view>
          </view>
        </view>
      </lk-countdown>
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
  padding-bottom: 100rpx;
}

.demo-card,
.sale-panel,
.slot-card {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 18rpx;
  }
  padding: 28rpx;
  border-radius: var(--lk-radius-lg);
  background: var(--lk-bg-container);
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.05);
}

.demo-desc,
.sale-desc,
.state-label,
.slot-unit {
  color: var(--lk-text-secondary);
  font-size: 24rpx;
  line-height: 1.5;
}

.sale-panel {
  margin-bottom: 20rpx;
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.12), rgba(105, 101, 219, 0.08));
}

.sale-copy {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 6rpx;
  }
}

.sale-title {
  color: var(--lk-text-primary);
  font-size: 34rpx;
  font-weight: 800;
}

.state-list,
.demo-stack {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 22rpx;
  }
}

.state-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > :not(:first-child) {
    margin-left: 24rpx;
  }
}

.slot-card {
  width: 100%;
  box-sizing: border-box;
  background: var(--lk-fill-1);
}

.slot-kicker {
  color: var(--lk-color-primary);
  font-size: 24rpx;
  font-weight: 700;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  > :not(.preview-spacing-placeholder) {
    margin: 8rpx;
  }
}

.slot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 6rpx;
  }
  padding: 18rpx 8rpx;
  border-radius: var(--lk-radius-md);
  background: var(--lk-bg-container);
}

.slot-value {
  color: var(--lk-text-primary);
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1;
}
</style>
