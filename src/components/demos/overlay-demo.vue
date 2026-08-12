<script setup lang="ts">
import { ref } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkOverlay from '@/uni_modules/lucky-ui/components/lk-overlay/lk-overlay.vue';
import LkSpace from '@/uni_modules/lucky-ui/components/lk-space/lk-space.vue';
import DemoBlock from '@/uni_modules/lucky-ui/components/demo-block/demo-block.vue';

const visible1 = ref(false);
const visible2 = ref(false);
const visible3 = ref(false);
const visible5 = ref(false);
const visible6 = ref(false);
const visibleLockPrimary = ref(false);
const visibleLockSecondary = ref(false);
const runtimeLockScroll = ref(true);

const showOverlay1 = () => {
  visible1.value = true;
};

const showOverlay2 = () => {
  visible2.value = true;
};

const showOverlay3 = () => {
  visible3.value = true;
};

const showScrollLockFixture = () => {
  runtimeLockScroll.value = true;
  visibleLockSecondary.value = false;
  visibleLockPrimary.value = true;
};

const closeScrollLockFixture = () => {
  visibleLockSecondary.value = false;
  visibleLockPrimary.value = false;
};
</script>

<template>
  <view class="component-demo">
    <demo-block title="基础用法">
      <lk-button type="primary" @click="showOverlay1">显示遮罩</lk-button>
      <lk-overlay v-model="visible1" />
    </demo-block>

    <demo-block title="嵌入内容（点击空白关闭）">
      <lk-button type="primary" @click="showOverlay2">嵌入内容</lk-button>
      <lk-overlay v-model="visible2">
        <view class="overlay-content" @click.stop>
          <text class="overlay-text">这是内容区域</text>
          <lk-button type="primary" @click="visible2 = false">关闭</lk-button>
        </view>
      </lk-overlay>
    </demo-block>

    <demo-block title="自定义透明度">
      <lk-space wrap>
        <lk-button @click="showOverlay3">透明度 0.8</lk-button>
      </lk-space>
      <lk-overlay v-model="visible3" :opacity="0.8" />
    </demo-block>

    <demo-block title="交互与滚动">
      <lk-space wrap>
        <lk-button @click="visible5 = true">禁止点击关闭</lk-button>
        <lk-button @click="visible6 = true">允许滚动</lk-button>
      </lk-space>
      <lk-overlay v-model="visible5" :close-on-click="false" />
      <lk-overlay id="overlay-scroll-unlocked" v-model="visible6" :lock-scroll="false" />
    </demo-block>

    <demo-block title="滚动锁回归演练">
      <lk-button id="overlay-scroll-lock-open" type="primary" @click="showScrollLockFixture">
        打开滚动锁演练
      </lk-button>
      <lk-overlay
        id="overlay-scroll-lock-primary"
        v-model="visibleLockPrimary"
        :close-on-click="false"
        :lock-scroll="runtimeLockScroll"
        :z-index="910"
      >
        <view class="overlay-content" @click.stop>
          <text id="overlay-scroll-lock-state" class="overlay-text">
            主遮罩：{{ visibleLockPrimary ? '打开' : '关闭' }}；滚动锁：{{
              runtimeLockScroll ? '开启' : '关闭'
            }}
          </text>
          <lk-space wrap>
            <lk-button
              id="overlay-scroll-lock-toggle"
              @click="runtimeLockScroll = !runtimeLockScroll"
            >
              切换滚动锁
            </lk-button>
            <lk-button id="overlay-scroll-lock-open-secondary" @click="visibleLockSecondary = true">
              打开第二层
            </lk-button>
            <lk-button id="overlay-scroll-lock-close-primary" @click="closeScrollLockFixture">
              关闭演练
            </lk-button>
          </lk-space>
        </view>
      </lk-overlay>
      <lk-overlay
        id="overlay-scroll-lock-secondary"
        v-model="visibleLockSecondary"
        :close-on-click="false"
        :z-index="920"
      >
        <view class="overlay-content" @click.stop>
          <text class="overlay-text">第二层遮罩已打开</text>
          <lk-button id="overlay-scroll-lock-close-secondary" @click="visibleLockSecondary = false">
            关闭第二层
          </lk-button>
        </view>
      </lk-overlay>
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

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  > :not(:first-child) {
    margin-top: 24rpx;
  }
  padding: 48rpx;
  background: white;
  border-radius: 16rpx;
}

.overlay-text {
  font-size: 28rpx;
  color: var(--lk-text-primary);
}
</style>
