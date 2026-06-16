import type { Ref } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';

export interface UsePagePullRefreshOptions {
  onRefresh: () => void | Promise<void>;
  minDuration?: number;
  onFinish?: () => void;
  onError?: (error: unknown) => void;
}

export function usePagePullRefresh(refreshing: Ref<boolean>, options: UsePagePullRefreshOptions) {
  const minDuration = Math.max(0, options.minDuration ?? 300);

  async function runRefresh() {
    if (refreshing.value) {
      uni.stopPullDownRefresh();
      return;
    }
    const startedAt = Date.now();
    refreshing.value = true;

    try {
      await options.onRefresh();
      const elapsed = Date.now() - startedAt;
      if (elapsed < minDuration) {
        await wait(minDuration - elapsed);
      }
      options.onFinish?.();
    } catch (error) {
      options.onError?.(error);
    } finally {
      refreshing.value = false;
      uni.stopPullDownRefresh();
    }
  }

  onPullDownRefresh(() => {
    runRefresh();
  });

  return {
    runRefresh,
  };
}

function wait(duration: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, duration);
  });
}
