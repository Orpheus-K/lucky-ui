<script setup lang="ts">
import type { StyleValue } from 'vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { preloadDebuggerProps } from './preload-debugger.props';
import {
  getPreloadManager,
  type PreloadStats,
  type PreloadEventHandler,
} from '../../core/src/preload';
import { useLocale } from '../../composables/useLocale';
import {
  createPreloadDebuggerLog,
  resolvePreloadDebuggerBadgeClass,
  resolvePreloadDebuggerClass,
  resolvePreloadDebuggerStatusLabel,
  resolvePreloadDebuggerStyle,
  trimPreloadDebuggerLogs,
  type PreloadDebuggerLogItem,
  type PreloadDebuggerLogType,
} from './preload-debugger.utils';

defineOptions({ name: 'LkPreloadDebugger' });

const props = defineProps(preloadDebuggerProps);
const { t, locale } = useLocale('preloadDebugger');

const manager = getPreloadManager();
const isExpanded = ref(false);
const isPaused = ref(false);
const stats = ref<PreloadStats>({
  total: 0,
  pending: 0,
  running: 0,
  completed: 0,
  failed: 0,
  cancelled: 0,
});

const logs = ref<PreloadDebuggerLogItem[]>([]);
const lastLogId = ref('');

const debuggerClass = computed(() =>
  resolvePreloadDebuggerClass({
    position: props.position,
    customClass: props.customClass,
  })
);

const debuggerStyle = computed(() => resolvePreloadDebuggerStyle(props.customStyle as StyleValue));

const statusClass = computed(() => resolvePreloadDebuggerBadgeClass(stats.value));
const statusLabel = computed(() => resolvePreloadDebuggerStatusLabel({ stats: stats.value, t }));

function formatTime(date: Date): string {
  return date.toLocaleTimeString(locale.value, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function addLog(type: PreloadDebuggerLogType, message: string) {
  const id = `log_${Date.now()}`;
  logs.value.push(
    createPreloadDebuggerLog({
      id,
      type,
      time: formatTime(new Date()),
      message,
    })
  );

  // 保持最多 50 条日志
  logs.value = trimPreloadDebuggerLogs(logs.value);

  lastLogId.value = id;
}

function updateStats() {
  stats.value = manager.getStats();
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function togglePause() {
  if (isPaused.value) {
    manager.resume();
    addLog('info', t('queueResumed'));
  } else {
    manager.pause();
    addLog('info', t('queuePaused'));
  }
  isPaused.value = !isPaused.value;
}

function handleClear() {
  manager.clear();
  addLog('info', t('queueCleared'));
  updateStats();
}

function handleTaskStart(event: Parameters<PreloadEventHandler>[0]) {
  addLog('start', t('taskStart', { resource: event.task?.resource || t('unknown') }));
  updateStats();
}

function handleTaskComplete(event: Parameters<PreloadEventHandler>[0]) {
  addLog('complete', t('taskComplete', { resource: event.task?.resource || t('unknown') }));
  updateStats();
}

function handleTaskError(event: Parameters<PreloadEventHandler>[0]) {
  addLog(
    'error',
    t('taskError', {
      resource: event.task?.resource || t('unknown'),
      message: event.error?.message || '',
    })
  );
  updateStats();
}

onMounted(() => {
  updateStats();

  manager.on('task:start', handleTaskStart);
  manager.on('task:complete', handleTaskComplete);
  manager.on('task:error', handleTaskError);

  addLog('info', t('panelStarted'));
});

onUnmounted(() => {
  manager.off('task:start', handleTaskStart);
  manager.off('task:complete', handleTaskComplete);
  manager.off('task:error', handleTaskError);
});
</script>

<template>
  <view v-if="props.visible" :class="debuggerClass" :style="debuggerStyle">
    <view class="lk-preload-debugger__header" @tap="toggleExpand">
      <view class="lk-preload-debugger__title-container">
        <text class="lk-preload-debugger__title">{{ t('title') }}</text>
        <text class="lk-preload-debugger__experimental-badge">{{ t('experimental') }}</text>
      </view>
      <view class="lk-preload-debugger__badge" :class="statusClass">
        {{ statusLabel }}
      </view>
    </view>

    <view v-if="isExpanded" class="lk-preload-debugger__body">
      <view class="lk-preload-debugger__stats-wrapper">
        <view class="lk-preload-debugger__stats">
          <view class="stat-item">
            <text class="stat-label">{{ t('total') }}</text>
            <text class="stat-value">{{ stats.total }}</text>
          </view>
          <view class="stat-item stat-item--running">
            <text class="stat-label">{{ t('running') }}</text>
            <text class="stat-value">{{ stats.running }}</text>
          </view>
          <view class="stat-item stat-item--pending">
            <text class="stat-label">{{ t('pending') }}</text>
            <text class="stat-value">{{ stats.pending }}</text>
          </view>
          <view class="stat-item stat-item--completed">
            <text class="stat-label">{{ t('completed') }}</text>
            <text class="stat-value">{{ stats.completed }}</text>
          </view>
          <view class="stat-item stat-item--failed">
            <text class="stat-label">{{ t('failed') }}</text>
            <text class="stat-value">{{ stats.failed }}</text>
          </view>
        </view>
      </view>

      <view class="lk-preload-debugger__actions">
        <view class="action-btn" :class="{ 'action-btn--active': isPaused }" @tap="togglePause">
          {{ isPaused ? t('resume') : t('pause') }}
        </view>
        <view class="action-btn action-btn--danger" @tap="handleClear">{{ t('clear') }}</view>
      </view>

      <scroll-view class="lk-preload-debugger__logs" scroll-y :scroll-into-view="lastLogId">
        <view
          v-for="log in logs"
          :id="log.id"
          :key="log.id"
          class="log-item"
          :class="`log-item--${log.type}`"
        >
          <text class="log-time">{{ log.time }}</text>
          <text class="log-message">{{ log.message }}</text>
        </view>
        <view v-if="logs.length === 0" class="log-empty">{{ t('emptyLogs') }}</view>
      </scroll-view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@use './lk-preload-debugger.scss';

.lk-preload-debugger {
  position: fixed;
  z-index: 9999;
  background: var(--lk-preload-debugger-bg);
  border-radius: var(--lk-radius-md);
  color: var(--lk-preload-debugger-text);
  font-size: var(--lk-font-size-xs);
  min-width: var(--lk-preload-debugger-width-min);
  max-width: var(--lk-preload-debugger-width-max);
  box-shadow: var(--lk-shadow-lg);

  &--top-left {
    top: calc(env(safe-area-inset-top) + var(--lk-spacing-md));
    left: var(--lk-spacing-md);
  }

  &--top-right {
    top: calc(env(safe-area-inset-top) + var(--lk-spacing-md));
    right: var(--lk-spacing-md);
  }

  &--bottom-left {
    bottom: calc(
      env(safe-area-inset-bottom) + calc(var(--lk-control-height-lg) + var(--lk-spacing-xxl))
    );
    left: var(--lk-spacing-md);
  }

  &--bottom-right {
    bottom: calc(
      env(safe-area-inset-bottom) + calc(var(--lk-control-height-lg) + var(--lk-spacing-xxl))
    );
    right: var(--lk-spacing-md);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--lk-spacing-sm) var(--lk-spacing-lg);
    border-bottom: 1px solid var(--lk-preload-debugger-border);
  }

  &__title-container {
    display: flex;
    align-items: center;
    gap: var(--lk-spacing-xs);
  }

  &__title {
    font-weight: 600;
    font-size: var(--lk-font-size-sm);
  }

  &__experimental-badge {
    padding: 2rpx 8rpx;
    font-size: 18rpx;
    color: #ffc53d;
    background: rgba(255, 197, 61, 0.15);
    border: 1px solid rgba(255, 197, 61, 0.25);
    border-radius: var(--lk-radius-xs);
    font-weight: normal;
    line-height: 1.2;
  }

  &__badge {
    padding: var(--lk-spacing-xxs) var(--lk-spacing-md);
    border-radius: var(--lk-radius-lg);
    font-size: var(--lk-font-size-xs);

    &--running {
      background: var(--lk-color-success);
      animation: pulse 1.5s infinite;
    }

    &--pending {
      background: var(--lk-color-warning);
    }

    &--idle {
      background: var(--lk-text-secondary);
    }
  }

  &__body {
    padding: var(--lk-spacing-md);

    & > view:not(:first-child) {
      margin-top: var(--lk-spacing-md);
    }
  }

  &__stats-wrapper {
    width: 100%;
    overflow: hidden;
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    margin: calc(var(--lk-spacing-xxs) * -1);

    .stat-item {
      flex: 1;
      min-width: var(--lk-control-height-md);
      text-align: center;
      padding: var(--lk-spacing-sm) var(--lk-spacing-xs);

      margin: var(--lk-spacing-xxs);
      background: var(--lk-preload-debugger-item-bg);
      border-radius: var(--lk-radius-sm);
      box-sizing: border-box;

      &--running {
        background: var(--lk-color-success-soft);
      }

      &--pending {
        background: var(--lk-color-warning-soft);
      }

      &--completed {
        background: var(--lk-color-info-soft);
      }

      &--failed {
        background: var(--lk-color-danger-soft);
      }
    }

    .stat-label {
      display: block;
      font-size: var(--lk-font-size-xs);
      color: var(--lk-preload-debugger-text-muted);
      margin-bottom: var(--lk-spacing-xxs);
    }

    .stat-value {
      display: block;
      font-size: var(--lk-font-size-base);
      font-weight: 600;
    }
  }

  &__actions {
    display: flex;
    margin: 0 calc(var(--lk-spacing-xxs) * -1);

    .action-btn {
      flex: 1;
      text-align: center;
      padding: var(--lk-spacing-sm);
      margin: 0 var(--lk-spacing-xxs);
      background: var(--lk-preload-debugger-btn-bg);
      border-radius: var(--lk-radius-sm);
      transition: all 0.2s;

      &:active {
        transform: scale(0.95);
        background: var(--lk-preload-debugger-btn-bg-active);
      }

      &--active {
        background: var(--lk-color-success);
      }

      &--danger {
        background: var(--lk-color-danger);
      }
    }
  }

  &__logs {
    max-height: calc(var(--lk-control-height-md) * 3.75);
    background: var(--lk-preload-debugger-log-bg);
    border-radius: var(--lk-radius-sm);
    padding: var(--lk-spacing-xs);
    box-sizing: border-box;

    .log-item {
      display: flex;
      align-items: flex-start;
      padding: var(--lk-rpx-8);
      border-bottom: 1px solid var(--lk-preload-debugger-log-border);

      &:last-child {
        border-bottom: none;
      }

      &--start {
        .log-message {
          color: var(--lk-color-primary-soft);
        }
      }

      &--complete {
        .log-message {
          color: var(--lk-color-success);
        }
      }

      &--error {
        .log-message {
          color: var(--lk-color-danger);
        }
      }

      &--info {
        .log-message {
          color: var(--lk-color-info);
        }
      }
    }

    .log-time {
      flex-shrink: 0;
      color: var(--lk-preload-debugger-text-faint);
      font-size: var(--lk-font-size-xs);
      margin-right: var(--lk-spacing-sm);
    }

    .log-message {
      flex: 1;
      word-break: break-all;
      font-size: var(--lk-font-size-sm);
    }

    .log-empty {
      text-align: center;
      padding: var(--lk-spacing-lg);
      color: var(--lk-preload-debugger-text-faint);
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
