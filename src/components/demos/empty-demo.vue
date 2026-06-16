<script setup lang="ts">
import { ref } from 'vue';
import { PRESET_COLORS } from '@/stores/theme';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkEmpty from '@/uni_modules/lucky-ui/components/lk-empty/lk-empty.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const brandOptions = PRESET_COLORS.slice(0, 5);
const previewColor = ref<string>(brandOptions[0]?.value || '#1677ff');

const customImage =
  'https://cdn.prod.website-files.com/69b15b68fb5a0ea0e6ef48b6/69b15b68fb5a0ea0e6ef7572_9VPIJG783rBG_-H7bascPpZIfWM-B0Lq-ZgHgpeiDrA.svg';

function changePreviewColor(color: string) {
  previewColor.value = color;
}

function handleRetry() {
  uni.showToast({
    title: '重新加载',
    icon: 'none',
  });
}
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础空态">
      <lk-empty />
    </demo-block>

    <demo-block title="搜索无结果">
      <lk-empty name="search" title="没有匹配内容" description="调整筛选条件后重新搜索" />
    </demo-block>

    <demo-block title="网络异常">
      <lk-empty name="network">
        <template #action>
          <lk-button size="sm" @click="handleRetry">重试</lk-button>
        </template>
      </lk-empty>
    </demo-block>

    <demo-block title="自定义图片">
      <lk-empty
        name="cart"
        :image="customImage"
        title="门店暂未营业"
        description="自定义图片地址会优先于内置 name"
      />
    </demo-block>

    <demo-block title="紧凑布局">
      <lk-empty name="inbox" layout="compact" :image-size="160" />
    </demo-block>

    <demo-block title="跟随品牌色">
      <lk-empty
        name="empty"
        layout="compact"
        :image-size="180"
        title="跟随当前品牌色"
        description="默认读取 Lucky UI 当前品牌色，不会在示例中修改全局主题"
      />
    </demo-block>

    <demo-block title="局部颜色预览">
      <view class="color-demo">
        <view class="brand-swatches">
          <view
            v-for="item in brandOptions"
            :key="item.value"
            class="brand-swatch"
            :class="{ 'brand-swatch--active': previewColor === item.value }"
            :style="{ backgroundColor: item.value, color: item.value }"
            @tap="changePreviewColor(item.value)"
          />
        </view>
        <lk-empty
          name="empty"
          layout="compact"
          :image-size="180"
          :color="previewColor"
          title="仅预览当前空态"
          description="色板通过 color 传入，只影响这个 lk-empty"
        />
      </view>
    </demo-block>

    <demo-block title="自定义颜色">
      <lk-empty
        name="cart"
        color="#13c2c2"
        title="指定空态颜色"
        description="color 会覆盖当前品牌色，仅影响内置插画"
      />
    </demo-block>

    <demo-block title="页面级空态">
      <view class="page-panel">
        <lk-empty
          name="permission"
          layout="page"
          title="需要授权"
          description="授权后即可查看完整数据"
        >
          <template #action>
            <lk-button size="sm" variant="soft">稍后再说</lk-button>
            <lk-button size="sm" @click="handleRetry">去授权</lk-button>
          </template>
        </lk-empty>
      </view>
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

.page-panel {
  min-height: 560rpx;
  background: var(--lk-bg-page);
  border-radius: var(--lk-radius-lg);
  overflow: hidden;
}

.color-demo {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 16rpx;
  }
}

.brand-swatches {
  display: flex;
  justify-content: center;
  > :not(:first-child) {
    margin-left: 16rpx;
  }
  padding: 12rpx 0;
}

.brand-swatch {
  width: 44rpx;
  height: 44rpx;
  border-radius: 999rpx;
  border: 4rpx solid #ffffff;
  box-shadow: 0 0 0 2rpx var(--lk-color-border);
}

.brand-swatch--active {
  box-shadow: 0 0 0 4rpx currentColor;
}
</style>
