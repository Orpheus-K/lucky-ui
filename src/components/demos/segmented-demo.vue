<script setup lang="ts">
import { ref } from 'vue';
import LkSegmented from '@/uni_modules/lucky-ui/components/lk-segmented/lk-segmented.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

/* v-model refs */
const v1 = ref('daily');
const v2 = ref('daily');
const v3 = ref('1');
const v4 = ref('rec');
const v5 = ref('a');
const v6 = ref('daily');
const v7 = ref('nearby');
const v8 = ref('daily');
const scrollVal = ref('week');

const hVal = ref('weekly');
const slotVal = ref('1');
const slotOpts = [
  { label: 'A', value: '1' },
  { label: 'B', value: '2' },
  { label: 'C', value: '3' },
];

/* options */
const baseOptions = [
  { label: '每日精选', value: 'daily' },
  { label: '周榜', value: 'weekly' },
  { label: '月榜', value: 'monthly' },
];
const simpleOptions = [
  { label: 'Map', value: '1' },
  { label: 'Transit', value: '2' },
  { label: 'Satellite', value: '3' },
];
const variedOptions = [
  { label: '推荐', value: 'rec' },
  { label: '附近的人', value: 'nearby' },
  { label: '关注', value: 'follow' },
];
const disabledOptions = [
  { label: '启用 A', value: 'a' },
  { label: '禁用 B', value: 'b', disabled: true },
  { label: '启用 C', value: 'c' },
];
const scrollOptions = [
  { label: '今日热榜', value: 'today' },
  { label: '本周精选内容', value: 'week' },
  { label: '设计趋势观察', value: 'design' },
  { label: '工程效率', value: 'engineering' },
  { label: '跨端兼容', value: 'compat' },
];
</script>

<template>
  <view class="demo-container">
    <!-- 基础用法 ------------------------------------------------------->
    <demo-block title="基础用法">
      <view class="sub-title">磁吸滑块效果，点击切换</view>
      <lk-segmented v-model="v1" :options="baseOptions" />
      <view class="tip-text">移动端使用 tap 事件切换，避免 click 在部分端响应不稳定。</view>
    </demo-block>

    <!-- 通栏 Block ----------------------------------------------------->
    <demo-block title="块级模式 (Block)">
      <view class="sub-title">宽度自适应，适用于顶部导航</view>
      <lk-segmented v-model="v2" :options="baseOptions" block />
    </demo-block>

    <!-- 尺寸 ----------------------------------------------------------->
    <demo-block title="不同尺寸">
      <view class="row"><lk-segmented v-model="v3" :options="simpleOptions" size="sm" /></view>
      <view class="row"><lk-segmented v-model="v3" :options="simpleOptions" size="md" /></view>
      <view class="row"><lk-segmented v-model="v3" :options="simpleOptions" size="lg" /></view>
    </demo-block>

    <!-- 滑块宽度自适应 ------------------------------------------------->
    <demo-block title="自适应滑块宽度">
      <view class="sub-title">滑块会随文字长度伸缩（观察 “附近的人”）</view>
      <lk-segmented v-model="v4" :options="variedOptions" />
    </demo-block>

    <!-- 禁用 ----------------------------------------------------------->
    <demo-block title="禁用选项">
      <view class="sub-title">部分选项不可点击</view>
      <lk-segmented v-model="v5" :options="disabledOptions" />
    </demo-block>

    <!-- 自定义圆角 / 动画 --------------------------------------------->
    <demo-block title="自定义圆角 & 动画">
      <view class="sub-title">大圆角 + 磁吸回弹 + 500 ms</view>
      <lk-segmented
        v-model="v6"
        :options="baseOptions"
        radius="20rpx"
        :duration="500"
        easing="cubic-bezier(0.34,1.56,0.64,1)"
      />
    </demo-block>

    <!-- gutter / inset ------------------------------------------------->
    <demo-block title="留缝风格 (gutter) + 轨道内边距 (inset)">
      <view class="sub-title">更像原生 iOS Segmented Control</view>
      <lk-segmented
        v-model="v7"
        :options="variedOptions"
        block
        gutter="8rpx"
        inset="6rpx"
        radius="999px"
      />
    </demo-block>

    <demo-block title="横向滚动选项">
      <view class="sub-title">选项超过容器宽度时，滑块会跟随滚动后的点击位置</view>
      <lk-segmented v-model="scrollVal" :options="scrollOptions" />
    </demo-block>

    <!-- 主题变量覆写 --------------------------------------------------->
    <demo-block title="主题内覆写（不写死颜色）">
      <view class="sub-title">演示把滑块与文字颜色反转</view>
      <lk-segmented
        v-model="v8"
        :options="baseOptions"
        block
        style="
          --lk-seg-track-bg: var(--lk-color-primary);
          --lk-seg-slider-bg: var(--lk-color-primary-soft);
          --lk-seg-text: var(--lk-text-inverse);
          --lk-seg-text-active: var(--lk-color-primary);
        "
      />
    </demo-block>

    <demo-block title="自定义高度">
      <lk-segmented v-model="hVal" :options="baseOptions" height="96rpx" />
    </demo-block>

    <!-- 插槽示例 ------------------------------------->
    <demo-block title="插槽自定义">
      <lk-segmented v-model="slotVal" :options="slotOpts">
        <template #item="{ option, active }">
          <view class="slot-item" :class="{ 'is-active': active }">
            <!-- 可以放图标、徽章等 -->
            <text>{{ option.label }}</text>
            <text v-if="active" class="slot-item__mark">★</text>
          </view>
        </template>
      </lk-segmented>
    </demo-block>
  </view>
</template>

<style scoped lang="scss">
.demo-container {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
  padding-bottom: 60rpx;
}

.sub-title {
  font-size: 24rpx;
  color: var(--lk-text-secondary);
  margin-bottom: 16rpx;
}

.tip-text {
  margin-top: 12rpx;
  color: var(--lk-text-secondary);
  font-size: var(--lk-font-size-xs);
}

.row {
  margin-bottom: 20rpx;
}

.slot-item {
  padding: 0 24rpx;
  font-weight: 500;
}

.slot-item.is-active {
  font-weight: 600;
}

.slot-item__mark {
  margin-left: 4rpx;
  color: var(--lk-color-danger);
}
</style>
