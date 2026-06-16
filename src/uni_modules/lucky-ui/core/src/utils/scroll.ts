export interface ScrollToTopOptions {
  /** 目标滚动位置 */
  scrollTop?: number;
  /** 当前滚动位置；传入后可使用自定义缓动逐帧滚动 */
  startScrollTop?: number;
  /** 页面滚动动画时长，单位 ms */
  duration?: number;
  /** 回顶缓动函数，支持 linear / easeOutCubic / cubic-bezier(x1,y1,x2,y2) */
  easing?: ScrollEasing;
  /** 页面内选择器，传入后由 uni.pageScrollTo 定位到该节点 */
  selector?: string;
}

export interface TopAreaTapOptions extends ScrollToTopOptions {
  /** 顶部可点击热区高度，单位 px */
  topAreaHeight?: number;
}

export interface ControlledScrollToTopOptions {
  /** 受控滚动容器的 scrollTop setter */
  setScrollTop: (value: number) => void;
  /** 当前滚动位置 */
  startScrollTop?: number;
  /** 目标滚动位置 */
  scrollTop?: number;
  /** 动画时长，单位 ms */
  duration?: number;
  /** 回顶缓动函数，支持 linear / easeOutCubic / cubic-bezier(x1,y1,x2,y2) */
  easing?: ScrollEasing;
}

export type ScrollEasing = 'linear' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | string;

type TouchPoint = {
  clientY?: number;
  pageY?: number;
  y?: number;
};

type TapLikeEvent = {
  touches?: TouchPoint[];
  changedTouches?: TouchPoint[];
  detail?: {
    y?: number;
  };
};

const DEFAULT_NAV_BAR_HEIGHT = 44;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  function solveCurveX(x: number) {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const x2 = sampleCurveX(t) - x;
      const d2 = sampleCurveDerivativeX(t);
      if (Math.abs(x2) < 1e-6 || Math.abs(d2) < 1e-6) return t;
      t -= x2 / d2;
    }

    let t0 = 0;
    let t1 = 1;
    t = x;
    for (let i = 0; i < 16; i++) {
      const x2 = sampleCurveX(t);
      if (Math.abs(x2 - x) < 1e-6) return t;
      if (x > x2) t0 = t;
      else t1 = t;
      t = (t1 + t0) / 2;
    }
    return t;
  }

  return (x: number) => sampleCurveY(solveCurveX(clamp(x)));
}

function resolveEasing(easing: ScrollEasing = 'linear') {
  const named: Record<string, (t: number) => number> = {
    linear: t => t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  };

  if (named[easing]) return named[easing];

  const matched = easing
    .replace(/\s+/g, '')
    .match(/^cubic-bezier\((-?\d*\.?\d+),(-?\d*\.?\d+),(-?\d*\.?\d+),(-?\d*\.?\d+)\)$/);

  if (!matched) return named.linear;

  const [, x1, y1, x2, y2] = matched.map(Number);
  if ([x1, y1, x2, y2].some(Number.isNaN)) return named.linear;
  return cubicBezier(clamp(x1), y1, clamp(x2), y2);
}

function animateScrollValue(options: {
  from: number;
  to: number;
  duration: number;
  easing?: ScrollEasing;
  onUpdate: (value: number) => void;
}) {
  const duration = Math.max(0, options.duration);
  if (duration === 0) {
    options.onUpdate(options.to);
    return;
  }

  const easing = resolveEasing(options.easing);
  const startTime = Date.now();
  const distance = options.to - options.from;

  const step = () => {
    const progress = clamp((Date.now() - startTime) / duration);
    const next = options.from + distance * easing(progress);
    options.onUpdate(progress >= 1 ? options.to : next);
    if (progress < 1) setTimeout(step, 16);
  };

  step();
}

function getTouchY(event: unknown): number | null {
  if (!event || typeof event !== 'object') return null;
  const source = event as TapLikeEvent;
  const point = source.changedTouches?.[0] || source.touches?.[0];
  const y = point?.clientY ?? point?.pageY ?? point?.y ?? source.detail?.y;
  return typeof y === 'number' ? y : null;
}

export function getTopAreaHeight() {
  let statusBarHeight = 0;
  try {
    statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
  } catch {
    statusBarHeight = 0;
  }

  // ⚠️可能存在平台差异：微信小程序胶囊按钮高度可用于近似顶部可点击区域。
  // #ifdef MP-WEIXIN
  try {
    const menuRect = uni.getMenuButtonBoundingClientRect?.();
    if (menuRect?.bottom) return menuRect.bottom + 8;
  } catch {
    return statusBarHeight + DEFAULT_NAV_BAR_HEIGHT;
  }
  // #endif

  return statusBarHeight + DEFAULT_NAV_BAR_HEIGHT;
}

export function isTopAreaTap(event: unknown, topAreaHeight = getTopAreaHeight()) {
  const y = getTouchY(event);
  return y !== null && y <= topAreaHeight;
}

export function scrollToTop(options: ScrollToTopOptions = {}) {
  const target = options.scrollTop ?? 0;
  if (
    typeof options.startScrollTop === 'number' &&
    options.duration &&
    options.duration > 0 &&
    options.easing &&
    options.easing !== 'linear'
  ) {
    animateScrollValue({
      from: options.startScrollTop,
      to: target,
      duration: options.duration,
      easing: options.easing,
      onUpdate: value => {
        uni.pageScrollTo({
          scrollTop: value,
          duration: 0,
          selector: options.selector,
        });
      },
    });
    return;
  }

  uni.pageScrollTo({
    scrollTop: target,
    duration: options.duration ?? 300,
    selector: options.selector,
  });
}

export function scrollToTopIfTopAreaTap(event: unknown, options: TopAreaTapOptions = {}) {
  if (!isTopAreaTap(event, options.topAreaHeight)) return false;
  scrollToTop(options);
  return true;
}

export function scrollControlledToTop(options: ControlledScrollToTopOptions) {
  const target = options.scrollTop ?? 0;
  if (typeof options.startScrollTop !== 'number' || !options.duration || options.duration <= 0) {
    options.setScrollTop(target);
    return;
  }

  animateScrollValue({
    from: options.startScrollTop,
    to: target,
    duration: options.duration,
    easing: options.easing,
    onUpdate: value => options.setScrollTop(value),
  });
}
