<script setup lang="ts">
/**
 * 组件展示项。
 * 注意事项：由父组件传入基础信息与演示插槽内容。
 */
defineProps<{
  title: string;
  groupLabel: string;
  verifyStatusLabel: string;
  riskLevelLabel: string;
  verifyStatusType: 'ok' | 'warn';
  riskType: 'low' | 'medium' | 'high';
  riskNotes: string[];
}>();
</script>

<template>
  <view class="component-case">
    <view class="case-header">
      <view class="case-title-row">
        <view class="case-title-block">
          <text class="group-label">{{ groupLabel }}</text>
          <text class="case-title">{{ title }}</text>
        </view>
        <view class="case-badges">
          <text
            :class="['status-badge', verifyStatusType === 'ok' ? 'status-ok' : 'status-warn']"
            >{{ verifyStatusLabel }}</text
          >
          <text :class="['risk-badge', `risk-${riskType}`]">{{ riskLevelLabel }}</text>
        </view>
      </view>
      <view v-if="riskNotes.length" class="risk-panel">
        <text v-for="(risk, idx) in riskNotes" :key="`${title}-${idx}`" class="risk-item">{{
          risk
        }}</text>
      </view>
    </view>

    <view class="demo-panel">
      <slot name="demo" />
      <view class="empty-state">
        <text class="empty-text">当前组件暂无展示内容</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@use '@/styles/test-page.scss' as test;

.component-case {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 24rpx;
  }
}

.case-header {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 18rpx;
  }
}

.case-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  > :not(:first-child) {
    margin-left: 24rpx;
  }
}

.case-title-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 8rpx;
  }
}

.case-title {
  color: test.$test-text-primary;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1.25;
}

.group-label {
  color: test.$test-text-tertiary;
  font-size: 22rpx;
  font-weight: 600;
}

.case-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  > :not(.preview-spacing-placeholder) {
    margin: 5rpx;
  }
  max-width: 300rpx;
}

.status-badge,
.risk-badge {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1.4;
}

.status-ok {
  color: #0e6245;
  background: rgba(82, 196, 26, 0.14);
}

.status-warn {
  color: #ad6800;
  background: rgba(250, 173, 20, 0.16);
}

.risk-low {
  color: #0e6245;
  background: rgba(82, 196, 26, 0.14);
}

.risk-medium {
  color: #ad6800;
  background: rgba(250, 173, 20, 0.16);
}

.risk-high {
  color: #a8071a;
  background: rgba(255, 77, 79, 0.14);
}

.risk-panel {
  display: flex;
  flex-wrap: wrap;
  > :not(.preview-spacing-placeholder) {
    margin: 5rpx;
  }
}

.risk-item {
  padding: 8rpx 14rpx;
  color: test.$test-text-secondary;
  font-size: 22rpx;
  line-height: 1.4;
  background: test.$test-gray-50;
  border: 1rpx solid test.$test-border-color;
  border-radius: 999rpx;
}

.demo-panel {
  --lk-demo-block-bg: var(--test-bg-card);
  --lk-demo-block-border: var(--test-border-color);
  --lk-demo-block-border-width: 1rpx;
  --lk-demo-block-padding: 28rpx;
  --lk-demo-block-shadow: var(--test-shadow-sm);

  background: transparent;
}

.empty-state {
  padding: 20rpx 0;
  text-align: center;
  display: none;
}

.empty-text {
  color: #86909c;
  font-size: 24rpx;
}
</style>
