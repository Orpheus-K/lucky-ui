import { computed, nextTick, onUnmounted, ref, getCurrentInstance } from 'vue';

export interface RippleOptions {
  duration?: number;
  /**
   * Selector used for MP/App boundingClientRect query.
   * Defaults to '.lk-ripple'.
   */
  selector?: string;
}

type AnyRecord = Record<string, unknown>;

function isRecord(v: unknown): v is AnyRecord {
  return v !== null && typeof v === 'object';
}

/**
 * Touch-point ripple
 * - H5: Use MouseEvent.offsetX/Y directly
 * - MP/App: Calculate relative position via getBoundingClientRect
 */
export function useRipple(options: RippleOptions = {}) {
  const duration = options.duration ?? 800;
  const selector = options.selector ?? '.lk-ripple';
  const instance = getCurrentInstance();

  const active = ref(false);
  const x = ref<number | null>(null);
  const y = ref<number | null>(null);
  const size = ref<number | null>(null);

  let timer: ReturnType<typeof setTimeout> | null = null;

  function clear() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function getClientCoords(e: unknown): { x: number; y: number } | null {
    if (!isRecord(e)) return null;

    // 1. H5 MouseEvent (has offsetX/Y, prefer this)
    if (typeof e.offsetX === 'number' && typeof e.offsetY === 'number') {
      return { x: e.offsetX as number, y: e.offsetY as number };
    }

    // 2. TouchEvent / TapEvent (has touches or detail)
    // Try touches[0] first (touchstart)
    if (Array.isArray(e.touches) && e.touches.length > 0) {
      const touch = e.touches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    // Try changedTouches[0] (touchend/tap)
    if (Array.isArray(e.changedTouches) && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    // Try detail.x/y (tap event in some envs, usually clientX/Y)
    const detail = isRecord(e.detail) ? e.detail : null;
    if (detail && typeof detail.x === 'number' && typeof detail.y === 'number') {
      return { x: detail.x as number, y: detail.y as number };
    }

    return null;
  }

  function getCurrentTargetRect(
    e: unknown
  ): { left: number; top: number; width: number; height: number } | null {
    if (!isRecord(e)) return null;
    const ct = e.currentTarget;
    if (!ct || !isRecord(ct)) return null;
    const fn = ct.getBoundingClientRect;
    if (typeof fn !== 'function') return null;
    const rect = fn.call(ct);
    if (!rect || typeof rect.left !== 'number') return null;
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  function activate() {
    // Reset first to allow re-trigger
    active.value = false;
    clear();

    nextTick(() => {
      active.value = true;
      timer = setTimeout(() => {
        active.value = false;
      }, duration);
    });
  }

  function trigger(e?: unknown) {
    const coords = e ? getClientCoords(e) : null;

    // Case 1: H5 MouseEvent with offsetX (Relative already) + size from currentTarget
    if (isRecord(e) && typeof e.offsetX === 'number' && typeof e.offsetY === 'number') {
      x.value = e.offsetX as number;
      y.value = e.offsetY as number;
      const rect = getCurrentTargetRect(e);
      if (rect) size.value = Math.max(rect.width, rect.height) * 2;
      activate();
      return;
    }

    // Case 2: Need to calculate relative position (MP/App)
    if (coords && instance) {
      uni
        .createSelectorQuery()
        .in(instance)
        .select(selector)
        .boundingClientRect(rect => {
          if (
            rect &&
            !Array.isArray(rect) &&
            typeof rect.left === 'number' &&
            typeof rect.top === 'number' &&
            typeof rect.width === 'number' &&
            typeof rect.height === 'number'
          ) {
            x.value = coords.x - rect.left;
            y.value = coords.y - rect.top;
            size.value = Math.max(rect.width, rect.height) * 2;
            activate();
          } else {
            // Fallback to center if rect missing
            x.value = null;
            y.value = null;
            activate();
          }
        })
        .exec();
    } else {
      // Case 3: No event or no instance, fallback to center
      x.value = null;
      y.value = null;
      activate();
    }
  }

  const waveStyle = computed(() => {
    const style: Record<string, string> = {};
    if (typeof x.value === 'number') style['--lk-ripple-x'] = `${x.value}px`;
    if (typeof y.value === 'number') style['--lk-ripple-y'] = `${y.value}px`;
    if (typeof size.value === 'number') style['--lk-ripple-size'] = `${size.value}px`;
    return style;
  });

  onUnmounted(() => clear());

  return {
    rippleActive: active,
    rippleWaveStyle: waveStyle,
    triggerRipple: trigger,
    rippleDuration: duration,
  };
}
