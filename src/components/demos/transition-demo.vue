<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { CSSProperties } from 'vue';
import LkButton from '@/uni_modules/lucky-ui/components/lk-button/lk-button.vue';
import LkIcon from '@/uni_modules/lucky-ui/components/lk-icon/lk-icon.vue';
import LkSlider from '@/uni_modules/lucky-ui/components/lk-slider/lk-slider.vue';
import LkTag from '@/uni_modules/lucky-ui/components/lk-tag/lk-tag.vue';
import LkCard from '@/uni_modules/lucky-ui/components/lk-card/lk-card.vue';
import { useTransition } from '@/uni_modules/lucky-ui/composables/useTransition';
import {
  ANIMATION_CATEGORIES,
  ANIMATION_PRESETS,
} from '@/uni_modules/lucky-ui/composables/useTransition';
import type { AnimationType, EasingType } from '@/uni_modules/lucky-ui/composables/useTransition';

// 控制参数
const duration = ref(300);
const delay = ref(0);
const easing = ref<EasingType>('ease');

// 激活的动画
const activeAnimations = ref<AnimationType[]>([]);
const showAll = ref(false);

// 为每个动画创建 transition
const animationDisplayStates = reactive<Record<string, boolean>>({});
const animationClasses = reactive<Record<string, string>>({});
const animationStyles = reactive<Record<string, CSSProperties>>({});

// 初始化所有动画的 transition
ANIMATION_CATEGORIES.forEach(category => {
  category.animations.forEach(animation => {
    const transition = useTransition(() => activeAnimations.value.includes(animation), {
      name: animation,
      get duration() {
        return duration.value;
      },
      get delay() {
        return delay.value;
      },
      get easing() {
        return easing.value;
      },
    });

    watch(
      () => transition.display.value,
      val => {
        animationDisplayStates[animation] = val;
      },
      { immediate: true }
    );

    watch(
      () => transition.classes.value,
      val => {
        animationClasses[animation] = val;
      },
      { immediate: true }
    );

    watch(
      () => transition.styles.value,
      val => {
        animationStyles[animation] = val;
      },
      { immediate: true }
    );
  });
});

// 切换单个动画
const toggleAnimation = (animation: AnimationType) => {
  const index = activeAnimations.value.indexOf(animation);
  if (index > -1) {
    activeAnimations.value.splice(index, 1);
  } else {
    activeAnimations.value.push(animation);
  }
};

// 切换所有动画
const toggleAll = () => {
  if (showAll.value) {
    activeAnimations.value = [];
  } else {
    activeAnimations.value = ANIMATION_CATEGORIES.flatMap(cat => cat.animations);
  }
  showAll.value = !showAll.value;
};

// 预设配置
const activePreset = ref<string>('');
const presetDisplayStates = reactive<Record<string, boolean>>({});
const presetClasses = reactive<Record<string, string>>({});
const presetStyles = reactive<Record<string, CSSProperties>>({});

// 初始化预设的 transition
Object.keys(ANIMATION_PRESETS).forEach(key => {
  const preset = ANIMATION_PRESETS[key];
  const transition = useTransition(() => activePreset.value === key, {
    name: preset.animation,
    duration: preset.duration,
    delay: preset.delay,
    easing: preset.easing,
  });

  watch(
    () => transition.display.value,
    val => {
      presetDisplayStates[key] = val;
    },
    { immediate: true }
  );

  watch(
    () => transition.classes.value,
    val => {
      presetClasses[key] = val;
    },
    { immediate: true }
  );

  watch(
    () => transition.styles.value,
    val => {
      presetStyles[key] = val;
    },
    { immediate: true }
  );
});

const applyPreset = (key: string) => {
  const preset = ANIMATION_PRESETS[key];
  if (preset) {
    duration.value = preset.duration || 300;
    delay.value = preset.delay || 0;
    easing.value = preset.easing || 'ease';

    // 切换预设演示
    if (activePreset.value === key) {
      activePreset.value = '';
    } else {
      activePreset.value = key;
    }
  }
};

// 使用示例
const showList = ref(false);
const showCard = ref(false);

const listItems = [
  { id: 1, icon: 'check-circle', text: '列表项 1' },
  { id: 2, icon: 'check-circle', text: '列表项 2' },
  { id: 3, icon: 'check-circle', text: '列表项 3' },
  { id: 4, icon: 'check-circle', text: '列表项 4' },
  { id: 5, icon: 'check-circle', text: '列表项 5' },
];

// 列表项动画
const listItemDisplayStates = reactive<Record<number, boolean>>({});
const listItemClasses = reactive<Record<number, string>>({});
const listItemStyles = reactive<Record<number, CSSProperties>>({});

listItems.forEach((item, index) => {
  const transition = useTransition(() => showList.value, {
    name: 'fade-right',
    duration: 300,
    delay: index * 50,
    easing: 'ease-out',
  });

  watch(
    () => transition.display.value,
    val => {
      listItemDisplayStates[item.id] = val;
    },
    { immediate: true }
  );

  watch(
    () => transition.classes.value,
    val => {
      listItemClasses[item.id] = val;
    },
    { immediate: true }
  );

  watch(
    () => transition.styles.value,
    val => {
      listItemStyles[item.id] = val;
    },
    { immediate: true }
  );
});

const toggleList = () => {
  showList.value = !showList.value;
};

// 卡片动画
const {
  classes: cardClasses,
  styles: cardStyles,
  display: cardDisplay,
} = useTransition(() => showCard.value, {
  name: 'zoom-in',
  duration: 400,
  easing: 'ease-out-back',
});

const toggleCard = () => {
  showCard.value = !showCard.value;
};

</script>

<template>
  <view class="transition-demo">
    <!-- 控制面板 -->
    <view class="control-panel">
      <view class="control-row">
        <text class="control-label">持续时间: {{ duration }}ms</text>
        <lk-slider v-model="duration" :min="100" :max="2000" :step="100" />
      </view>
      <view class="control-row">
        <text class="control-label">延迟时间: {{ delay }}ms</text>
        <lk-slider v-model="delay" :min="0" :max="1000" :step="100" />
      </view>
      <view class="control-row">
        <lk-button type="primary" block @click="toggleAll">
          {{ showAll ? '隐藏所有' : '显示所有' }}
        </lk-button>
      </view>
    </view>
    <scroll-view class="demo-scroll" scroll-y>
      <!-- 动画分类展示 -->
      <view
        v-for="category in ANIMATION_CATEGORIES"
        :key="category.category"
        class="animation-category"
      >
        <view class="category-header">
          <text class="category-title">{{ category.title }}</text>
          <text class="category-desc">{{ category.description }}</text>
        </view>

        <view class="animation-list">
          <view
            v-for="animation in category.animations"
            :key="animation"
            class="animation-item"
            @click="toggleAnimation(animation)"
          >
            <view class="animation-label">{{ animation }}</view>
            <view class="animation-stage">
              <view
                v-if="animationDisplayStates[animation]"
                class="animation-box"
                :class="animationClasses[animation]"
                :style="animationStyles[animation]"
              >
                <lk-icon name="check-circle" size="40" color="var(--lk-icon-color)" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 预设配置展示 -->
      <view class="animation-category">
        <view class="category-header">
          <text class="category-title">预设配置</text>
          <text class="category-desc">快速使用的预设动画配置</text>
        </view>

        <view class="preset-list">
          <view
            v-for="(preset, key) in ANIMATION_PRESETS"
            :key="key"
            class="preset-item"
            @click="applyPreset(key)"
          >
            <view class="preset-header">
              <text class="preset-name">{{ preset.name }}</text>
              <lk-tag type="solid" size="sm">{{ preset.animation }}</lk-tag>
            </view>
            <view class="preset-info">
              <text class="preset-detail">时长: {{ preset.duration }}ms</text>
              <text class="preset-detail">缓动: {{ preset.easing }}</text>
            </view>
            <view class="preset-stage">
              <view
                v-if="presetDisplayStates[key]"
                class="preset-demo-box"
                :class="presetClasses[key]"
                :style="presetStyles[key]"
              >
                <lk-icon name="star" size="40" color="var(--lk-icon-color)" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 使用示例 -->
      <view class="animation-category">
        <view class="category-header">
          <text class="category-title">使用示例</text>
          <text class="category-desc">在实际场景中的应用</text>
        </view>

        <view class="example-section">
          <view class="example-item">
            <text class="example-title">列表项动画</text>
            <lk-button size="sm" @click="toggleList">切换列表</lk-button>
            <view class="list-container">
              <view v-for="item in listItems" :key="item.id" class="list-stage">
                <view
                  v-show="listItemDisplayStates[item.id]"
                  class="list-item"
                  :class="listItemClasses[item.id]"
                  :style="listItemStyles[item.id]"
                >
                  <lk-icon :name="item.icon" size="24" />
                  <text class="list-text">{{ item.text }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="example-item">
            <text class="example-title">卡片动画</text>
            <lk-button size="sm" @click="toggleCard">切换卡片</lk-button>
            <view class="card-stage">
              <lk-card
                v-if="cardDisplay"
                title="动画卡片"
                class="demo-card"
                :class="cardClasses"
                :style="cardStyles"
              >
                <text>这是一个带有动画效果的卡片组件</text>
              </lk-card>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部间距 -->
      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>
<style scoped lang="scss">
.transition-demo {
  width: 100%;
  background: var(--lk-bg-page);
}

.demo-scroll {
  width: 100%;
  height: 54vh;
}

.control-panel {
  background: var(--lk-bg-container);
  padding: 32rpx;
  margin: 24rpx;
  border-radius: var(--lk-radius-lg);
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

  .control-row {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .control-label {
    display: block;
    font-size: 28rpx;
    color: var(--lk-text-primary);
    margin-bottom: 16rpx;
    font-weight: 500;
  }
}

.animation-category {
  margin: 24rpx;

  .category-header {
    margin-bottom: 24rpx;
  }

  .category-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: var(--lk-text-primary);
    margin-bottom: 8rpx;
  }

  .category-desc {
    display: block;
    font-size: 24rpx;
    color: var(--lk-text-secondary);
  }
}

.animation-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  > :not(.preview-spacing-placeholder) {
    margin: 8rpx;
  }
}

.animation-item {
  background: var(--lk-bg-container);
  border-radius: var(--lk-radius-md);
  padding: 24rpx;
  height: 232rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    opacity: 0.8;
  }

  .animation-label {
    font-size: 24rpx;
    color: var(--lk-text-secondary);
    margin-bottom: 16rpx;
    text-align: center;
    line-height: 32rpx;
  }

  .animation-stage {
    width: 120rpx;
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
  }

  .animation-box {
    width: 120rpx;
    height: 120rpx;
    background: linear-gradient(135deg, var(--lk-color-primary), var(--lk-color-primary-soft));
    border-radius: var(--lk-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
}

.preset-list {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 16rpx;
  }
}

.preset-item {
  background: var(--lk-bg-container);
  border-radius: var(--lk-radius-md);
  padding: 24rpx;
  min-height: 256rpx;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    opacity: 0.8;
  }

  .preset-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12rpx;
  }

  .preset-name {
    font-size: 28rpx;
    font-weight: 500;
    color: var(--lk-text-primary);
  }

  .preset-info {
    display: flex;
    > :not(:first-child) {
      margin-left: 24rpx;
    }
    margin-bottom: 16rpx;
  }

  .preset-detail {
    font-size: 24rpx;
    color: var(--lk-text-secondary);
  }

  .preset-stage {
    width: 100%;
    height: 120rpx;
    overflow: visible;
  }

  .preset-demo-box {
    width: 100%;
    height: 120rpx;
    background: linear-gradient(135deg, var(--lk-color-success), var(--lk-color-success-soft));
    border-radius: var(--lk-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
}

.example-section {
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 32rpx;
  }
}

.example-item {
  background: var(--lk-bg-container);
  border-radius: var(--lk-radius-md);
  padding: 24rpx;

  .example-title {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: var(--lk-text-primary);
    margin-bottom: 16rpx;
  }
}

.list-container {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  > :not(:first-child) {
    margin-top: 12rpx;
  }
}

.list-stage {
  height: 84rpx;
  overflow: visible;
}

.list-item {
  background: var(--lk-bg-page);
  border-radius: var(--lk-radius-sm);
  padding: 20rpx;
  height: 84rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 16rpx;
  }

  .list-text {
    font-size: 28rpx;
    color: var(--lk-text-primary);
  }
}

.card-stage {
  margin-top: 16rpx;
  height: 180rpx;
  overflow: visible;
}

.demo-card {
  height: 180rpx;
  box-sizing: border-box;
}

.bottom-spacer {
  height: 40rpx;
}
</style>
