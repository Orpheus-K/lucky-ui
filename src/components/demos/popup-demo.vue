<script setup lang="ts">
import { ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkPopup from '@/uni_modules/lucky-ui/components/lk-popup/lk-popup.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const visible1 = ref(false);
const visible2 = ref(false);
const visibleRadius = ref(false);
const visibleDraggable = ref(false);
const visibleNestedScroll = ref(false);
const visibleTop = ref(false);
const visibleBottom = ref(false);
const visibleLeft = ref(false);
const visibleRight = ref(false);
const visiblePreset1 = ref(false);
const visiblePreset2 = ref(false);
const visibleCustom = ref(false);
const visibleWithTitle = ref(false);
const visibleWithClose = ref(false);
const visibleWithBoth = ref(false);
const visibleCustomTitle = ref(false);

const showPopup1 = () => {
  visible1.value = true;
};

const showPopup2 = () => {
  visible2.value = true;
};

const showTop = () => {
  visibleTop.value = true;
};

const showBottom = () => {
  visibleBottom.value = true;
};

const showLeft = () => {
  visibleLeft.value = true;
};

const showRight = () => {
  visibleRight.value = true;
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-button type="primary" @click="showPopup1">显示弹出层</lk-button>
      <lk-popup v-model="visible1">
        <view class="popup-content"> 这是弹出层内容 </view>
      </lk-popup>
    </demo-block>

    <demo-block title="不同位置（带默认方向动画）">
      <view class="button-row">
        <lk-button @click="showTop">顶部</lk-button>
        <lk-button @click="showBottom">底部</lk-button>
        <lk-button @click="showLeft">左侧</lk-button>
        <lk-button @click="showRight">右侧</lk-button>
      </view>
      <lk-popup v-model="visibleTop" position="top">
        <view class="popup-content">顶部弹出</view>
      </lk-popup>
      <lk-popup v-model="visibleBottom" position="bottom">
        <view class="popup-content">底部弹出</view>
      </lk-popup>
      <lk-popup v-model="visibleLeft" position="left">
        <view class="popup-content-side">
          <text>左侧弹出</text>
          <text class="desc">高度已自动填满</text>
        </view>
      </lk-popup>
      <lk-popup v-model="visibleRight" position="right">
        <view class="popup-content-side">
          <text>右侧弹出</text>
          <text class="desc">高度已自动填满</text>
        </view>
      </lk-popup>
    </demo-block>

    <demo-block title="标题与关闭按钮">
      <view class="button-row">
        <lk-button @click="visibleWithTitle = true">带标题</lk-button>
        <lk-button @click="visibleWithClose = true">带关闭按钮</lk-button>
        <lk-button @click="visibleWithBoth = true">标题+关闭</lk-button>
      </view>
      <lk-popup v-model="visibleWithTitle" position="bottom" title="弹窗标题">
        <view class="popup-content">这是带标题的弹窗</view>
      </lk-popup>
      <lk-popup v-model="visibleWithClose" position="center" closable>
        <view class="popup-content">带关闭按钮的居中弹窗</view>
      </lk-popup>
      <lk-popup v-model="visibleWithBoth" position="bottom" title="完整示例" closable>
        <view class="popup-content">标题和关闭按钮都有</view>
      </lk-popup>
    </demo-block>

    <demo-block title="自定义标题插槽">
      <lk-button type="primary" @click="visibleCustomTitle = true">自定义标题</lk-button>
      <lk-popup v-model="visibleCustomTitle" position="bottom" closable>
        <template #title>
          <view class="custom-title">
            <lk-icon name="star-fill" size="32" color="warning" />
            <text>自定义标题内容</text>
          </view>
        </template>
        <view class="popup-content">使用插槽自定义标题样式</view>
      </lk-popup>
    </demo-block>

    <demo-block title="预设与自定义动画">
      <view class="button-row">
        <lk-button @click="visiblePreset1 = true">preset: scale</lk-button>
        <lk-button @click="visiblePreset2 = true">preset: bounce</lk-button>
        <lk-button @click="visibleCustom = true">type: fade-up</lk-button>
      </view>
      <lk-popup v-model="visiblePreset1" animation="scale">
        <view class="popup-content">使用预设 scale 显示</view>
      </lk-popup>
      <lk-popup v-model="visiblePreset2" animation="bounce">
        <view class="popup-content">使用预设 bounce 显示</view>
      </lk-popup>
      <lk-popup v-model="visibleCustom" animation-type="fade-up">
        <view class="popup-content">使用自定义动画类型 fade-up</view>
      </lk-popup>
    </demo-block>

    <demo-block title="圆角与自定义圆角">
      <view class="button-row">
        <lk-button type="primary" @click="showPopup2">默认圆角</lk-button>
        <lk-button type="primary" @click="visibleRadius = true">自定义圆角(40rpx)</lk-button>
      </view>
      <lk-popup v-model="visible2" round position="bottom">
        <view class="popup-content"> 默认圆角弹出层内容 </view>
      </lk-popup>
      <lk-popup v-model="visibleRadius" round radius="40rpx" position="bottom">
        <view class="popup-content"> 自定义圆角 40rpx </view>
      </lk-popup>
    </demo-block>

    <demo-block title="可拖拽 (Snap Points)">
      <lk-button type="primary" @click="visibleDraggable = true">可拖拽底部弹窗</lk-button>
      <lk-popup
        v-model="visibleDraggable"
        position="bottom"
        round
        draggable
        title="拖拽示例"
        closable
      >
        <view class="popup-content-large">
          <view class="desc">
            <p>1. 默认打开在半屏位置</p>
            <p>2. 向上拖动可吸附到最高位置（90%）</p>
            <p>3. 向下拖动可关闭</p>
            <p>4. 带有速度检测和阻尼回弹效果</p>
          </view>
          <view v-for="i in 20" :key="i" class="list-item">列表项 {{ i }}</view>
        </view>
      </lk-popup>
    </demo-block>

    <demo-block title="可拖拽 + 自定义滚动列表">
      <lk-button type="primary" @click="visibleNestedScroll = true">滚动列表弹窗</lk-button>
      <lk-popup
        v-model="visibleNestedScroll"
        position="bottom"
        round
        draggable
        title="列表边界联动"
        closable
      >
        <view class="nested-scroll-popup">
          <view class="nested-scroll-header">
            <text>内容滚动由 Popup 托管：半屏时上下滑动面板，全屏后滚动列表</text>
          </view>
          <view v-for="i in 28" :key="i" class="nested-scroll-item"> 自定义列表项 {{ i }} </view>
        </view>
      </lk-popup>
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

.button-row {
  display: flex;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
  flex-wrap: wrap;
}

.popup-content {
  padding: 40rpx;
  font-size: 32rpx;
  color: var(--lk-text-primary);
  background-color: var(--lk-bg-container);
  min-width: 200rpx;
  min-height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-content-side {
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 20rpx;
  }
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 32rpx;
  color: var(--lk-text-primary);

  .desc {
    font-size: 24rpx;
    color: var(--lk-text-secondary);
  }
}

.custom-title {
  display: flex;
  align-items: center;
  justify-content: center;
  > :not(:first-child) {
    margin-left: 12rpx;
  }
  font-size: 32rpx;
  font-weight: 600;
  color: var(--lk-color-warning);
}

.popup-content-large {
  padding: 0 40rpx 40rpx;
  background-color: var(--lk-bg-container);

  .desc {
    font-size: 28rpx;
    color: var(--lk-text-secondary);
    margin-bottom: 30rpx;
    line-height: 1.6;
    background: var(--lk-fill-tertiary);
    padding: 20rpx;
    border-radius: 12rpx;
  }

  .list-item {
    padding: 30rpx 0;
    border-bottom: 1rpx solid var(--lk-color-border-light);
    font-size: 30rpx;
  }
}

.nested-scroll-popup {
  background-color: var(--lk-bg-container);
}

.nested-scroll-header {
  flex-shrink: 0;
  padding: 24rpx 40rpx;
  color: var(--lk-text-secondary);
  font-size: 26rpx;
  line-height: 1.5;
  border-bottom: 1rpx solid var(--lk-color-border-light);
}

.nested-scroll-item {
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid var(--lk-color-border-light);
  color: var(--lk-text-primary);
  font-size: 30rpx;
}
</style>
