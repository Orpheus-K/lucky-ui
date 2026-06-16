<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, onActivated, onDeactivated, watch } from 'vue';
import type { StyleValue } from 'vue';
import { noticeBarEmits, noticeBarProps } from './notice-bar.props';
import {
  resolveNoticeBarClickPayload,
  resolveNoticeBarDisplayMessages,
  resolveNoticeBarInterval,
  resolveNoticeBarScrollMode,
  resolveNoticeBarStyle,
  resolveNoticeBarVerticalList,
  resolveNoticeBarVerticalStyle,
} from './notice-bar.utils';

defineOptions({ name: 'LkNoticeBar' });

const props = defineProps(noticeBarProps);
const emit = defineEmits(noticeBarEmits);

// 计算最终要绑定的样式：当用户希望无背景时，不设置 background 和 color
const styleObj = computed<StyleValue>(() =>
  resolveNoticeBarStyle({
    noBackground: props.noBackground,
    background: props.background,
    color: props.color,
    customStyle: props.customStyle as StyleValue,
  })
);

// 判断滚动方向
const scrollMode = computed(() => resolveNoticeBarScrollMode(props.scrollable));

// 显示的消息列表（用于竖向滚动）
const displayMessages = computed(() =>
  resolveNoticeBarDisplayMessages({
    scrollMode: scrollMode.value,
    messages: props.messages,
    text: props.text,
  })
);

// 竖向逐条滚动相关状态
const currentIndex = ref(0); // 当前可视的索引
const verticalTimer = ref<number | ReturnType<typeof setInterval> | null>(null);
const enableTransition = ref(true); // 用于无缝重置时临时关闭过渡
const verticalListEl = ref<unknown>(null);
const resetTimer = ref<number | ReturnType<typeof setTimeout> | null>(null);
const resumeTimer = ref<number | ReturnType<typeof setTimeout> | null>(null);

// 竖向渲染列表（最后追加第一项以实现无缝滚动）
const verticalList = computed(() => resolveNoticeBarVerticalList(displayMessages.value));
const verticalListStyle = computed(() =>
  resolveNoticeBarVerticalStyle({
    verticalListLength: verticalList.value.length,
    currentIndex: currentIndex.value,
    enableTransition: enableTransition.value,
  })
);

function stopVerticalLoop() {
  if (verticalTimer.value) {
    clearInterval(verticalTimer.value as number);
    verticalTimer.value = null;
  }
  if (resetTimer.value) {
    clearTimeout(resetTimer.value as number);
    resetTimer.value = null;
  }
  if (resumeTimer.value) {
    clearTimeout(resumeTimer.value as number);
    resumeTimer.value = null;
  }
}

function startVerticalLoop() {
  stopVerticalLoop();
  // 单条不滚动
  if (scrollMode.value !== 'vertical' || displayMessages.value.length <= 1) return;
  const interval = resolveNoticeBarInterval(props.speed); // 每条停留时长（秒）
  verticalTimer.value = setInterval(() => {
    // 检查是否即将到达补位项（最后一项）
    if (currentIndex.value === displayMessages.value.length - 1) {
      // 先滚动到补位项（视觉上是第一条）
      enableTransition.value = true;
      currentIndex.value += 1;
      // 在过渡完成后立即无缝重置到真正的第一条
      resetTimer.value = setTimeout(() => {
        enableTransition.value = false;
        currentIndex.value = 0;
        emit('loop-reset');
        // 强制重绘（仅 H5 需要，通过读取 offsetHeight 触发）
        // #ifdef H5
        if (verticalListEl.value) {
          void (verticalListEl.value as HTMLElement).offsetHeight;
        }
        // #endif
        // 立即恢复过渡能力，为下一次步进做准备
        resumeTimer.value = setTimeout(() => {
          enableTransition.value = true;
        }, 20);
      }, 300); // 与过渡时长一致
    } else {
      // 正常步进到下一条
      enableTransition.value = true;
      currentIndex.value += 1;
      emit('message-change', {
        index: currentIndex.value,
        text: displayMessages.value[currentIndex.value] || '',
      });
    }
  }, interval);
}

// 监听相关依赖，切换/更新时重启竖向轮播
watch([scrollMode, () => props.speed, displayMessages], () => {
  currentIndex.value = 0;
  enableTransition.value = true;
  startVerticalLoop();
});

onMounted(() => {
  startVerticalLoop();
});

onActivated(() => {
  startVerticalLoop();
});

onDeactivated(() => {
  stopVerticalLoop();
});

onBeforeUnmount(() => {
  stopVerticalLoop();
});

function close(event?: unknown) {
  emit('close', event);
}

function click(event?: unknown) {
  emit(
    'click',
    resolveNoticeBarClickPayload({
      scrollMode: scrollMode.value,
      displayMessages: displayMessages.value,
      currentIndex: currentIndex.value,
      text: props.text,
      event,
    })
  );
}
</script>

<template>
  <view :id="id" class="lk-notice-bar" :class="customClass" :style="styleObj" @tap="click">
    <view v-if="icon || $slots['left-icon']" class="lk-notice-bar__icon">
      <slot name="left-icon">
        <lk-icon v-if="icon" :name="icon" size="32" />
      </slot>
    </view>

    <view class="lk-notice-bar__wrap">
      <view
        v-if="scrollMode === 'horizontal'"
        class="lk-notice-bar__content lk-notice-bar__content--horizontal"
        :style="{ animationDuration: speed + 's' }"
      >
        <slot>{{ text }}</slot>
      </view>

      <view
        v-else-if="scrollMode === 'vertical'"
        class="lk-notice-bar__content lk-notice-bar__content--vertical"
      >
        <view ref="verticalListEl" class="lk-notice-bar__vertical-list" :style="verticalListStyle">
          <view v-for="(msg, index) in verticalList" :key="index" class="lk-notice-bar__message">
            {{ msg }}
          </view>
        </view>
      </view>

      <view v-else class="lk-notice-bar__content">
        <slot>{{ text }}</slot>
      </view>
    </view>

    <template v-if="$slots.right || $slots['right-icon']">
      <view class="lk-notice-bar__right">
        <slot name="right" />
        <template v-if="!$slots.right">
          <slot name="right-icon" />
        </template>
      </view>
    </template>

    <view v-if="closeable" class="lk-notice-bar__close" @tap.stop="close">
      <lk-icon name="x" size="32" />
    </view>
  </view>
</template>

<style lang="scss">
@use './lk-notice-bar.scss';
</style>
