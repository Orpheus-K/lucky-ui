import {
  ref,
  shallowRef,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  getCurrentInstance,
} from 'vue';
import { normalizeAnimationRepeat } from '../core/src/chart';

type Canvas2DLike = CanvasRenderingContext2D & {
  setTransform?: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  scale?: (x: number, y: number) => void;
};

type CanvasNodeLike = {
  width: number;
  height: number;
  getContext?: (type: '2d') => MaybeCanvas2DContext | null;
};

type RectLike = {
  left?: number;
  top?: number;
  width: number;
  height: number;
};

type UniChartApi = typeof uni & {
  upx2px?: (rpx: number) => number;
  getSystemInfoSync?: () => {
    pixelRatio?: number;
    uniPlatform?: string;
  };
};

export type MaybeCanvas2DContext = Canvas2DLike;

const raf = globalThis.requestAnimationFrame?.bind(globalThis);
const caf = globalThis.cancelAnimationFrame?.bind(globalThis);
const hasRAF = typeof raf === 'function' && typeof caf === 'function';
const rAF = (cb: () => void): number =>
  hasRAF ? raf!(cb) : (setTimeout(cb, 16) as unknown as number);
const cAF = (id: number): void =>
  hasRAF ? caf!(id) : clearTimeout(id as unknown as ReturnType<typeof setTimeout>);

export interface ChartSize {
  width: number;
  height: number;
}

export interface ChartCanvasInfo {
  ctx: MaybeCanvas2DContext;
  canvas: CanvasNodeLike | HTMLCanvasElement;
  size: ChartSize;
  dpr: number;
  px: (rpx: number) => number;
}

export type ChartRenderer<TExtra = unknown> = (
  info: ChartCanvasInfo,
  progress: number,
  extra?: TExtra
) => void;

export interface UseChartCanvasOptions {
  /** wrapper 的 id，用于 selectorQuery 取宽高 */
  wrapperId: string;
  /** canvas 的 id / canvas-id */
  canvasId: string;
  /** 是否自动测量父容器尺寸（默认 true） */
  autoSize?: boolean;
}

export interface ChartLoopFrame {
  elapsedMs: number;
  deltaMs: number;
  phase: number;
}

export function useChartCanvas<TExtra = unknown>(options: UseChartCanvasOptions) {
  const instance = getCurrentInstance()?.proxy as unknown;

  const ready = ref(false);
  const size = ref<ChartSize>({ width: 0, height: 0 });
  const dpr = ref(1);

  const canvasNode = shallowRef<CanvasNodeLike | HTMLCanvasElement | null>(null);
  const ctx = shallowRef<MaybeCanvas2DContext | null>(null);

  const renderer = shallowRef<ChartRenderer<TExtra> | null>(null);

  // 交互坐标换算需要缓存 wrapper rect
  const wrapperRect = shallowRef<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  let rafId: number | undefined;
  let animRafId: number | undefined;
  let loopRafId: number | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let loopStartTime = 0;
  let lastLoopTime = 0;
  let animationSerial = 0;

  function getUniChartApi(): UniChartApi | null {
    return typeof uni === 'undefined' ? null : (uni as UniChartApi);
  }

  function px(rpx: number) {
    // rpx -> px
    const uniApi = getUniChartApi();
    if (typeof uniApi?.upx2px === 'function') return uniApi.upx2px(rpx);
    return rpx;
  }

  function getDpr() {
    try {
      const uniApi = getUniChartApi();
      if (typeof uniApi?.getSystemInfoSync === 'function') {
        return uniApi.getSystemInfoSync()?.pixelRatio || 1;
      }
    } catch {
      // ignore
    }
    // H5 fallback
    // #ifdef H5
    try {
      if (typeof window !== 'undefined') return (window.devicePixelRatio as number) || 1;
    } catch {
      // ignore
    }
    // #endif
    return 1;
  }

  function usesUniWebCanvasAdapter() {
    try {
      return getUniChartApi()?.getSystemInfoSync?.()?.uniPlatform === 'web';
    } catch {
      return false;
    }
  }

  function queryRect(scoped = true): Promise<RectLike | null> {
    return new Promise(resolve => {
      const query = uni.createSelectorQuery();
      if (scoped && instance) {
        (query as typeof query & { in: (ctx: unknown) => typeof query }).in(instance);
      }

      query
        .select(`#${options.wrapperId}`)
        .boundingClientRect(rect => {
          const rectObj = rect as RectLike | null;
          if (
            rectObj &&
            !Array.isArray(rectObj) &&
            typeof rectObj.width === 'number' &&
            typeof rectObj.height === 'number'
          ) {
            resolve(rectObj);
            return;
          }
          resolve(null);
        })
        .exec();
    });
  }

  function queryCanvasField(scoped = true): Promise<unknown> {
    return new Promise(resolve => {
      const query = uni.createSelectorQuery();
      if (scoped && instance) {
        (query as typeof query & { in: (ctx: unknown) => typeof query }).in(instance);
      }

      query
        .select(`#${options.canvasId}`)
        .fields({ node: true, size: true } as unknown as UniApp.NodeField, res => {
          resolve(res ?? null);
        })
        .exec();
    });
  }

  function measure(): Promise<ChartSize> {
    const autoSize = options.autoSize !== false;
    if (!autoSize) return Promise.resolve(size.value);

    return (async () => {
      const rectObj = (instance ? await queryRect(true) : null) ?? (await queryRect(false));

      if (rectObj) {
        wrapperRect.value = {
          left: rectObj.left ?? 0,
          top: rectObj.top ?? 0,
          width: rectObj.width,
          height: rectObj.height,
        };
        return { width: rectObj.width, height: rectObj.height };
      }

      return size.value;
    })();
  }

  function initCanvas2D(): Promise<void> {
    return (async () => {
      const scopedResult = instance ? await queryCanvasField(true) : null;
      const result = scopedResult ?? (await queryCanvasField(false));

      const node = (result as { node?: CanvasNodeLike | null } | null)?.node || null;
      canvasNode.value = node;

      const context = node?.getContext ? node.getContext('2d') : null;
      ctx.value = context;

      // H5 fallback：某些环境 fields({node:true}) 拿不到 node
      // #ifdef H5
      if (!ctx.value) {
        try {
          if (typeof document !== 'undefined') {
            const el = document.getElementById(options.canvasId) as HTMLCanvasElement | null;
            if (el && typeof el.getContext === 'function') {
              canvasNode.value = el;
              ctx.value = el.getContext('2d');
            }
          }
        } catch {
          // ignore
        }
      }
      // #endif
    })();
  }

  function resizeCanvas(targetSize: ChartSize) {
    const node = canvasNode.value;
    const context = ctx.value;
    if (!node || !context) return;

    const ratio = getDpr();
    const shouldScaleContext = !usesUniWebCanvasAdapter();
    dpr.value = ratio;

    // 设定物理像素大小，避免模糊
    node.width = Math.max(1, Math.floor(targetSize.width * ratio));
    node.height = Math.max(1, Math.floor(targetSize.height * ratio));

    // 归一化坐标系到 CSS 像素
    if (typeof context.setTransform === 'function') {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
    if (shouldScaleContext && typeof context.scale === 'function') {
      context.scale(ratio, ratio);
    }

    size.value = { width: targetSize.width, height: targetSize.height };
  }

  function clearRetryTimer() {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  async function ensureMeasuredVisible(attempts = 10) {
    // 典型场景：组件挂载在 v-show 隐藏的 tab 内，初次测量得到 0x0
    // 短时间重试，等可见后自动 resize + render。
    const delays = [50, 100, 150, 250, 400, 650, 1000, 1500, 2000, 3000];
    for (let i = 0; i < Math.min(attempts, delays.length); i += 1) {
      const s = await measure();
      if (s.width > 0 && s.height > 0) {
        resizeCanvas(s);
        if (ready.value) scheduleRender(1);
        return;
      }
      await new Promise<void>(resolve => {
        clearRetryTimer();
        retryTimer = setTimeout(() => resolve(), delays[i]);
      });
    }
  }

  function clear() {
    if (!ctx.value) return;
    ctx.value?.clearRect?.(0, 0, size.value.width, size.value.height);
  }

  function render(progress = 1, extra?: TExtra) {
    if (!renderer.value || !ctx.value || !canvasNode.value) return;

    clear();
    renderer.value(
      {
        ctx: ctx.value,
        canvas: canvasNode.value,
        size: size.value,
        dpr: dpr.value,
        px,
      },
      progress,
      extra
    );
  }

  function scheduleRender(progress = 1, extra?: TExtra) {
    if (rafId) return;
    rafId = rAF(() => {
      rafId = undefined;
      render(progress, extra);
    });
  }

  function animateTo(durationMs: number, onFrame: (p: number) => void, onDone?: () => void) {
    if (animRafId) {
      cAF(animRafId);
      animRafId = undefined;
    }

    const serial = ++animationSerial;
    const start = Date.now();
    const tick = () => {
      if (serial !== animationSerial) return;
      const t = (Date.now() - start) / Math.max(1, durationMs);
      const p = t >= 1 ? 1 : t;
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      onFrame(eased);
      if (p >= 1) {
        animRafId = undefined;
        onDone?.();
      } else {
        animRafId = rAF(tick);
      }
    };

    animRafId = rAF(tick);
  }

  function animateToRepeated(
    durationMs: number,
    repeat: number,
    onFrame: (p: number) => void,
    onDone?: () => void
  ) {
    if (animRafId) {
      cAF(animRafId);
      animRafId = undefined;
    }

    const serial = ++animationSerial;
    const duration = Math.max(1, durationMs);
    const repeatCount = normalizeAnimationRepeat(repeat);
    let cycle = 0;
    let cycleStart = Date.now();

    const tick = () => {
      if (serial !== animationSerial) return;
      const t = (Date.now() - cycleStart) / duration;
      const p = t >= 1 ? 1 : t;
      const eased = 1 - Math.pow(1 - p, 3);
      onFrame(eased);

      if (p >= 1) {
        cycle += 1;
        if (repeatCount > 0 && cycle >= repeatCount) {
          animRafId = undefined;
          onDone?.();
          return;
        }
        cycleStart = Date.now();
        onFrame(0);
      }

      animRafId = rAF(tick);
    };

    animRafId = rAF(tick);
  }

  function stopLoop() {
    if (loopRafId) {
      cAF(loopRafId);
      loopRafId = undefined;
    }
    loopStartTime = 0;
    lastLoopTime = 0;
  }

  function startLoop(durationMs: number, onFrame: (frame: ChartLoopFrame) => void) {
    stopLoop();
    const duration = Math.max(240, durationMs);

    const tick = () => {
      const now = Date.now();
      if (!loopStartTime) {
        loopStartTime = now;
        lastLoopTime = now;
      }
      const elapsedMs = now - loopStartTime;
      const deltaMs = now - lastLoopTime;
      lastLoopTime = now;
      onFrame({
        elapsedMs,
        deltaMs,
        phase: (elapsedMs % duration) / duration,
      });
      loopRafId = rAF(tick);
    };

    loopRafId = rAF(tick);
  }

  function setRenderer(fn: ChartRenderer<TExtra>) {
    renderer.value = fn;
  }

  function getRelativePoint(e: unknown): { x: number; y: number } | null {
    const ev = e as {
      offsetX?: number;
      offsetY?: number;
      touches?: Array<{ x?: number; y?: number; clientX?: number; clientY?: number }>;
      changedTouches?: Array<{ x?: number; y?: number; clientX?: number; clientY?: number }>;
      detail?: { x?: number; y?: number };
    };
    // H5
    if (ev && typeof ev.offsetX === 'number' && typeof ev.offsetY === 'number') {
      return { x: ev.offsetX, y: ev.offsetY };
    }

    const touch = ev?.touches?.[0] || ev?.changedTouches?.[0];
    const x = touch?.x ?? touch?.clientX ?? ev?.detail?.x;
    const y = touch?.y ?? touch?.clientY ?? ev?.detail?.y;
    if (typeof x !== 'number' || typeof y !== 'number') return null;

    const rect = wrapperRect.value;
    if (!rect) return null;

    return {
      x: x - rect.left,
      y: y - rect.top,
    };
  }

  async function init() {
    await nextTick();
    await initCanvas2D();
    const measured = await measure();
    resizeCanvas(measured);
    ready.value = !!ctx.value;
    if (measured.width <= 0 || measured.height <= 0) {
      // 初次测量失败时，等待可见后再测。
      ensureMeasuredVisible();
    } else {
      scheduleRender(1);
    }
  }

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    if (rafId) cAF(rafId);
    if (animRafId) cAF(animRafId);
    stopLoop();
    clearRetryTimer();
  });

  return {
    ready: computed(() => ready.value),
    size: computed(() => size.value),
    dpr: computed(() => dpr.value),
    px,

    setRenderer,
    render,
    scheduleRender,
    animateTo,
    animateToRepeated,
    startLoop,
    stopLoop,

    measure,
    init,
    getRelativePoint,
  };
}
