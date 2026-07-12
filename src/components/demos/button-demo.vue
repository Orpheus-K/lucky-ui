<script setup lang="ts">
import { ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const buttonLoading = ref(false);

const showToast = (message: string) => {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000,
  });
};

const triggerLoading = () => {
  buttonLoading.value = true;
  setTimeout(() => {
    buttonLoading.value = false;
    showToast('加载完成');
  }, 2000);
};
</script>

<template>
  <view class="component-demo">
    <!-- Button 按钮演示 -->
    <demo-block title="基础按钮">
      <lk-space wrap>
        <lk-button @click="showToast('默认按钮')">默认按钮</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="文本按钮">
      <lk-space wrap>
        <lk-button variant="text">文本按钮</lk-button>
        <lk-button variant="text" @click="showToast('点击成功')">可点击</lk-button>
        <lk-button variant="text" :disabled="true">禁用文本</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="按钮状态">
      <lk-space wrap>
        <lk-button :disabled="true">禁用按钮</lk-button>
        <lk-button :loading="buttonLoading" @click="triggerLoading">
          {{ buttonLoading ? '加载中...' : '点击加载' }}
        </lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="按钮尺寸">
      <lk-space wrap>
        <lk-button size="sm">小按钮</lk-button>
        <lk-button size="md">中等按钮</lk-button>
        <lk-button size="lg">大型按钮</lk-button>
      </lk-space>
      <lk-button size="lg" block shape="round" class="block-btn">块级胶囊按钮</lk-button>
    </demo-block>

    <demo-block title="按钮形状">
      <lk-space wrap>
        <lk-button shape="default">默认</lk-button>
        <lk-button shape="square">方形</lk-button>
        <lk-button shape="round">胶囊</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="图标按钮">
      <lk-space wrap>
        <lk-button icon="search">搜索</lk-button>
        <lk-button icon="download">下载</lk-button>
        <lk-button icon="upload">上传</lk-button>
      </lk-space>
    </demo-block>

    <demo-block title="圆形按钮">
      <lk-space wrap>
        <lk-button shape="circle" icon="heart" />
        <lk-button shape="circle" icon="star" />
        <lk-button shape="circle" icon="bell" />
        <lk-button shape="circle" icon="gear" />
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

.block-btn {
  margin-top: 16rpx;
}

</style>
