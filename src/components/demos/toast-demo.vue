<script setup lang="ts">
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';
import LkToastManager from '@/uni_modules/lucky-ui/components/lk-toast/lk-toast-manager.vue';
import { useToast } from '@/uni_modules/lucky-ui/components/lk-toast/toast-manager';

const toast = useToast();

const showToast1 = () => {
  toast.show('这是一条提示');
};

const showSlideUp = () => {
  toast.show({
    message: '向上滑动',
    transition: 'slide-up',
  });
};

const showSlideDown = () => {
  toast.show({
    message: '向下滑动',
    transition: 'slide-down',
  });
};

const showFade = () => {
  toast.show({
    message: '淡入淡出',
    transition: 'fade',
  });
};

const showZoom = () => {
  toast.show({
    message: '缩放动画',
    transition: 'zoom-in',
  });
};

const showTop = () => {
  toast.show({
    message: '顶部提示',
    position: 'top',
  });
};

const showCenter = () => {
  toast.show({
    message: '中间提示',
    position: 'center',
  });
};

const showBottom = () => {
  toast.show({
    message: '底部提示',
    position: 'bottom',
  });
};
</script>

<template>
  <view class="component-demo">
    <lk-toast-manager />
    <demo-block title="基础用法">
      <lk-button type="primary" @click="showToast1">显示提示</lk-button>
    </demo-block>

    <demo-block title="动画效果">
      <lk-space wrap>
        <lk-button @click="showSlideUp">向上滑动</lk-button>
        <lk-button @click="showSlideDown">向下滑动</lk-button>
        <lk-button @click="showFade">淡入淡出</lk-button>
        <lk-button @click="showZoom">缩放</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="自定义位置">
      <lk-space wrap>
        <lk-button @click="showTop">顶部</lk-button>
        <lk-button @click="showCenter">中间</lk-button>
        <lk-button @click="showBottom">底部</lk-button>
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
</style>
