import { ref, watch, computed, nextTick, isRef } from 'vue';
import type { CSSProperties, Ref } from 'vue';
import { Locale } from '../locale';

/**
 * requestAnimationFrame 降级
 * 小程序环境中 requestAnimationFrame 不可用，使用 setTimeout 作为 fallback
 */
const raf = globalThis.requestAnimationFrame?.bind(globalThis);
const caf = globalThis.cancelAnimationFrame?.bind(globalThis);
const hasRAF = typeof raf === 'function' && typeof caf === 'function';
const rAF = (cb: () => void): number =>
  hasRAF ? raf!(cb) : (setTimeout(cb, 16) as unknown as number);
const cAF = (id: number): void =>
  hasRAF ? caf!(id) : clearTimeout(id as unknown as ReturnType<typeof setTimeout>);

/**
 * 动画配置类型
 */
export type MaybeNumber = number | Ref<number> | (() => number);
export type MaybeString = string | Ref<string> | (() => string);
export type TransitionName =
  | 'fade'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade-up-left'
  | 'fade-up-right'
  | 'fade-down-left'
  | 'fade-down-right'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-in-up'
  | 'zoom-in-down'
  | 'zoom-in-left'
  | 'zoom-in-right'
  | 'zoom-out'
  | 'zoom-out-up'
  | 'zoom-out-down'
  | 'zoom-out-left'
  | 'zoom-out-right'
  | 'flip-left'
  | 'flip-right'
  | 'flip-up'
  | 'flip-down'
  | 'bounce-in'
  | 'bounce-in-up'
  | 'bounce-in-down'
  | 'bounce-in-left'
  | 'bounce-in-right'
  | 'rotate-in'
  | 'rotate-in-up-left'
  | 'rotate-in-up-right'
  | 'rotate-in-down-left'
  | 'rotate-in-down-right';

export interface TransitionConfig {
  /** 动画名称 */
  name?: TransitionName | Ref<TransitionName> | (() => TransitionName);
  /** 动画持续时间(ms) */
  duration?: MaybeNumber;
  /** 动画延迟时间(ms) */
  delay?: MaybeNumber;
  /** 缓动函数 */
  easing?: MaybeString;
  /** 初次显示时是否执行进入动画，默认 true；为 false 则初次直接展示为激活态 */
  appear?: boolean;
  /** 自定义进入前样式（仅在进入阶段且未激活时应用） */
  enterFrom?: CSSProperties | Ref<CSSProperties> | (() => CSSProperties);
  /** 自定义进入后样式（仅在进入阶段且已激活时应用） */
  enterTo?: CSSProperties | Ref<CSSProperties> | (() => CSSProperties);
  /** 自定义离开前样式（仅在离开阶段且仍为激活前应用） */
  leaveFrom?: CSSProperties | Ref<CSSProperties> | (() => CSSProperties);
  /** 自定义离开后样式（仅在离开阶段且非激活时应用） */
  leaveTo?: CSSProperties | Ref<CSSProperties> | (() => CSSProperties);
  /** 目标元素引用。提供后可用 transition/animationend 判断结束，否则使用定时器 */
  target?: Ref<HTMLElement | null>;
  /** 是否启用基于事件的结束检测，默认 true。仅当 target 存在时有效 */
  useEvents?: boolean;
}

/**
 * 动画状态
 */
export interface TransitionState {
  /** 是否已初始化 */
  inited: boolean;
  /** 是否显示 */
  display: boolean;
  /** 是否激活（动画进入完成） */
  active: boolean;
  /** 是否正在进入 */
  entering: boolean;
  /** 是否正在离开 */
  leaving: boolean;
}

/**
 * 动画回调
 */
export interface TransitionCallbacks {
  onBeforeEnter?: () => void;
  onEnter?: () => void;
  onAfterEnter?: () => void;
  onBeforeLeave?: () => void;
  onLeave?: () => void;
  onAfterLeave?: () => void;
}

/**
 * useTransition Composable
 *
 * 使用示例：
 * ```ts
 * const { classes, styles, display } = useTransition(
 *   () => visible.value,
 *   { name: 'fade-up', duration: 300 }
 * );
 * ```
 *
 * 在模板中使用：
 * ```vue
 * <view v-if="display" :class="classes" :style="styles">
 *   内容
 * </view>
 * ```
 */
export function useTransition(
  show: () => boolean,
  config: TransitionConfig = {},
  callbacks: TransitionCallbacks = {}
) {
  // 工具函数: 解析动态/静态值
  const resolve = <T>(val: T | Ref<T> | (() => T) | undefined | null, fallback: T): T => {
    if (val == null) return fallback;
    if (isRef(val)) return val.value as T;
    if (typeof val === 'function') return (val as () => T)();
    return val as T;
  };

  const state = ref<TransitionState>({
    inited: false,
    display: false,
    active: false,
    entering: false,
    leaving: false,
  });

  // 目标元素引用与事件控制
  const internalElRef = ref<HTMLElement | null>(null);
  const elRef = (config.target as Ref<HTMLElement | null>) || internalElRef;
  const useEvents = config.useEvents !== false; // 默认启用

  // 首次出现控制
  const hasAppeared = ref(false);

  // 定时器与事件清理
  let enterTimer: number | undefined;
  let leaveTimer: number | undefined;
  let rafEnter: number | undefined;
  let rafLeave: number | undefined;
  let removeEndListeners: (() => void) | null = null;

  const clearTimersAndListeners = () => {
    if (enterTimer) {
      clearTimeout(enterTimer);
      enterTimer = undefined;
    }
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      leaveTimer = undefined;
    }
    if (rafEnter) {
      cAF(rafEnter);
      rafEnter = undefined;
    }
    if (rafLeave) {
      cAF(rafLeave);
      rafLeave = undefined;
    }
    if (removeEndListeners) {
      removeEndListeners();
      removeEndListeners = null;
    }
  };

  const classes = computed(() => {
    const currentName = resolve(config.name, 'fade' as TransitionName);
    const result: string[] = ['lk-transition'];

    if (currentName) {
      result.push(`lk-transition-${currentName}`);
    }

    if (state.value.entering) {
      result.push('lk-transition-entering');
    }

    if (state.value.leaving) {
      result.push('lk-transition-leaving');
    }

    if (state.value.active) {
      result.push('lk-transition-active');
    }

    return result.join(' ');
  });

  const baseStyles = computed<CSSProperties>(() => {
    const currentDuration = resolve(config.duration, 300);
    const currentDelay = resolve(config.delay, 0);
    const currentEasing = resolve(config.easing, 'ease');
    const result: CSSProperties = {};

    if (currentDuration) {
      result.transitionDuration = `${currentDuration}ms`;
      result.animationDuration = `${currentDuration}ms`;
      (result as CSSProperties & Record<string, string>)['--lk-transition-duration'] =
        `${currentDuration}ms`;
    }

    if (currentDelay) {
      result.transitionDelay = `${currentDelay}ms`;
      result.animationDelay = `${currentDelay}ms`;
      (result as CSSProperties & Record<string, string>)['--lk-transition-delay'] =
        `${currentDelay}ms`;
    }

    if (currentEasing) {
      const easingMap: Record<string, string> = {
        linear: 'linear',
        ease: 'ease',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
        'ease-in-sine': 'cubic-bezier(0.12, 0, 0.39, 0)',
        'ease-out-sine': 'cubic-bezier(0.61, 1, 0.88, 1)',
        'ease-in-out-sine': 'cubic-bezier(0.37, 0, 0.63, 1)',
        'ease-in-cubic': 'cubic-bezier(0.32, 0, 0.67, 0)',
        'ease-out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'ease-in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
        'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      };
      const easingValue = easingMap[currentEasing] || currentEasing;
      result.transitionTimingFunction = easingValue;
      result.animationTimingFunction = easingValue;
      (result as CSSProperties & Record<string, string>)['--lk-transition-easing'] = easingValue;
    }
    return result;
  });

  // from/to 阶段样式
  const phaseStyles = computed<CSSProperties>(() => {
    const result: CSSProperties = {};
    const enterFrom = resolve(config.enterFrom, undefined) as CSSProperties | undefined;
    const enterTo = resolve(config.enterTo, undefined) as CSSProperties | undefined;
    const leaveFrom = resolve(config.leaveFrom, undefined) as CSSProperties | undefined;
    const leaveTo = resolve(config.leaveTo, undefined) as CSSProperties | undefined;

    if (state.value.entering) {
      if (!state.value.active && enterFrom) Object.assign(result, enterFrom);
      if (state.value.active && enterTo) Object.assign(result, enterTo);
    }
    if (state.value.leaving) {
      // active=false 后保持 leaveTo，避免离场样式回跳。
      if (!state.value.active && leaveTo) Object.assign(result, leaveTo);
      if (state.value.active && leaveFrom) Object.assign(result, leaveFrom);
    }
    return result;
  });

  const styles = computed<CSSProperties>(() => ({ ...baseStyles.value, ...phaseStyles.value }));

  const attachEndListeners = (done: () => void) => {
    const el = elRef?.value;
    if (!el || !useEvents) return;
    let called = false;
    const handler = () => {
      if (called) return;
      called = true;
      done();
      if (removeEndListeners) {
        removeEndListeners();
        removeEndListeners = null;
      }
    };
    const onTransitionEnd = () => handler();
    const onAnimationEnd = () => handler();
    el.addEventListener('transitionend', onTransitionEnd, { passive: true });
    el.addEventListener('animationend', onAnimationEnd, { passive: true });
    removeEndListeners = () => {
      el.removeEventListener('transitionend', onTransitionEnd);
      el.removeEventListener('animationend', onAnimationEnd);
    };
  };

  const finishEnter = () => {
    state.value.entering = false;
    callbacks.onAfterEnter?.();
  };

  const finishLeave = () => {
    state.value.leaving = false;
    state.value.display = false;
    state.value.inited = false;
    callbacks.onAfterLeave?.();
  };

  const enter = () => {
    const localDuration = resolve(config.duration, 300);
    const localDelay = resolve(config.delay, 0);
    callbacks.onBeforeEnter?.();
    state.value.entering = true;
    state.value.leaving = false;

    nextTick(() => {
      callbacks.onEnter?.();
      // 下一帧切换 active，让初始样式先落到节点。
      rafEnter = rAF(() => {
        state.value.active = true;
        // 事件监听与超时降级并行。
        attachEndListeners(finishEnter);
        enterTimer = setTimeout(
          () => {
            finishEnter();
          },
          (localDuration as number) + (localDelay as number)
        ) as unknown as number;
      });
    });
  };

  const leave = () => {
    const localDuration = resolve(config.duration, 300);
    const localDelay = resolve(config.delay, 0);
    callbacks.onBeforeLeave?.();
    state.value.leaving = true;
    state.value.entering = false;

    nextTick(() => {
      callbacks.onLeave?.();
      rafLeave = rAF(() => {
        state.value.active = false;
        attachEndListeners(finishLeave);
        leaveTimer = setTimeout(
          () => {
            finishLeave();
          },
          (localDuration as number) + (localDelay as number)
        ) as unknown as number;
      });
    });
  };

  watch(
    show,
    newVal => {
      if (newVal) {
        if (!state.value.inited) {
          state.value.inited = true;
          state.value.display = true;
          // appear 行为：默认动画进入；当 appear=false 时，首次直接激活，无进入动画
          const appear = config.appear !== false;
          if (!appear && !hasAppeared.value) {
            state.value.active = true;
            state.value.entering = false;
            hasAppeared.value = true;
            return; // 跳过本次 enter
          }
          hasAppeared.value = true;
        }
        nextTick(() => {
          // 防抖：先清理可能残留
          clearTimersAndListeners();
          enter();
        });
      } else {
        if (state.value.display) {
          clearTimersAndListeners();
          leave();
        }
      }
    },
    { immediate: true }
  );

  return {
    /** 动画类名 */
    classes,
    /** 动画样式 */
    styles,
    /** 是否显示（用于 v-if） */
    display: computed(() => state.value.display),
    /** 动画状态 */
    state: computed(() => state.value),
    /** 目标元素引用（可用于事件精确结束）；示例：<view ref="elRef" ...> */
    elRef,
    /** 取消当前进行中的进入/离开动画（不会改变显示状态） */
    cancel: () => clearTimersAndListeners(),
    /** 主动触发进入/离开（一般不需要，保持可用） */
    enter,
    leave,
  };
}

/**
 * 获取动画类名（静态方法）
 *
 * 适用于不需要响应式控制的场景
 */
export function getTransitionClass(name: TransitionName = 'fade', active: boolean = false): string {
  const classes = ['lk-transition', `lk-transition-${name}`];
  if (active) {
    classes.push('lk-transition-active');
  }
  return classes.join(' ');
}

/**
 * 获取动画样式（静态方法）
 */
export function getTransitionStyle(config: TransitionConfig = {}): CSSProperties {
  const resolveStatic = <T>(val: T | Ref<T> | (() => T) | undefined | null, fallback: T): T => {
    if (val == null) return fallback;
    if (isRef(val)) return val.value as T;
    if (typeof val === 'function') return (val as () => T)();
    return val as T;
  };
  const duration = resolveStatic(config.duration, 300);
  const delay = resolveStatic(config.delay, 0);
  const easing = resolveStatic(config.easing, 'ease');
  const styles: CSSProperties = {};
  if (duration) {
    styles.transitionDuration = `${duration}ms`;
    styles.animationDuration = `${duration}ms`;
    (styles as CSSProperties & Record<string, string>)['--lk-transition-duration'] =
      `${duration}ms`;
  }
  if (delay) {
    styles.transitionDelay = `${delay}ms`;
    styles.animationDelay = `${delay}ms`;
    (styles as CSSProperties & Record<string, string>)['--lk-transition-delay'] = `${delay}ms`;
  }
  if (easing) {
    const easingMap: Record<string, string> = {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'ease-in-sine': 'cubic-bezier(0.12, 0, 0.39, 0)',
      'ease-out-sine': 'cubic-bezier(0.61, 1, 0.88, 1)',
      'ease-in-out-sine': 'cubic-bezier(0.37, 0, 0.63, 1)',
      'ease-in-cubic': 'cubic-bezier(0.32, 0, 0.67, 0)',
      'ease-out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
      'ease-in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
      'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
      'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    };
    const easingKey = String(easing);
    const easingValue = easingMap[easingKey] || easingKey;
    styles.transitionTimingFunction = easingValue;
    styles.animationTimingFunction = easingValue;
    (styles as CSSProperties & Record<string, string>)['--lk-transition-easing'] = easingValue;
  }
  return styles;
}

/**
 * 导出动画类型定义
 */
export type AnimationType = TransitionName;
export type EasingType = NonNullable<TransitionConfig['easing']>;

/**
 * 动画配置预设
 */
export interface AnimationPreset {
  /** 预设名称 */
  name: string;
  /** 动画类型 */
  animation: AnimationType;
  /** 持续时间(ms) */
  duration?: number;
  /** 延迟时间(ms) */
  delay?: number;
  /** 缓动函数 */
  easing?: EasingType;
}

/**
 * 动画类别配置
 */
export interface AnimationCategory {
  /** 类别名称 */
  category: string;
  /** 类别标题 */
  title: string;
  /** 类别描述 */
  description: string;
  /** 动画列表 */
  animations: AnimationType[];
}

function transitionText(key: string): string {
  return Locale.t(`lk.transition.${key}`);
}

/**
 * 动画分类列表
 */
export const ANIMATION_CATEGORIES: AnimationCategory[] = [
  {
    category: 'fade',
    get title() {
      return transitionText('fadeTitle');
    },
    get description() {
      return transitionText('fadeDescription');
    },
    animations: [
      'fade',
      'fade-up',
      'fade-down',
      'fade-left',
      'fade-right',
      'fade-up-left',
      'fade-up-right',
      'fade-down-left',
      'fade-down-right',
    ],
  },
  {
    category: 'slide',
    get title() {
      return transitionText('slideTitle');
    },
    get description() {
      return transitionText('slideDescription');
    },
    animations: ['slide-up', 'slide-down', 'slide-left', 'slide-right'],
  },
  {
    category: 'zoom',
    get title() {
      return transitionText('zoomTitle');
    },
    get description() {
      return transitionText('zoomDescription');
    },
    animations: [
      'zoom-in',
      'zoom-in-up',
      'zoom-in-down',
      'zoom-in-left',
      'zoom-in-right',
      'zoom-out',
      'zoom-out-up',
      'zoom-out-down',
      'zoom-out-left',
      'zoom-out-right',
    ],
  },
  {
    category: 'flip',
    get title() {
      return transitionText('flipTitle');
    },
    get description() {
      return transitionText('flipDescription');
    },
    animations: ['flip-left', 'flip-right', 'flip-up', 'flip-down'],
  },
  {
    category: 'bounce',
    get title() {
      return transitionText('bounceTitle');
    },
    get description() {
      return transitionText('bounceDescription');
    },
    animations: [
      'bounce-in',
      'bounce-in-up',
      'bounce-in-down',
      'bounce-in-left',
      'bounce-in-right',
    ],
  },
  {
    category: 'rotate',
    get title() {
      return transitionText('rotateTitle');
    },
    get description() {
      return transitionText('rotateDescription');
    },
    animations: [
      'rotate-in',
      'rotate-in-up-left',
      'rotate-in-up-right',
      'rotate-in-down-left',
      'rotate-in-down-right',
    ],
  },
];

/**
 * 预设动画配置
 */
export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  // 快速动画
  quick: {
    get name() {
      return transitionText('presetQuick');
    },
    animation: 'fade-up',
    duration: 200,
    easing: 'ease-out',
  },
  // 标准动画
  normal: {
    get name() {
      return transitionText('presetNormal');
    },
    animation: 'fade-up',
    duration: 300,
    easing: 'ease',
  },
  // 缓慢动画
  slow: {
    get name() {
      return transitionText('presetSlow');
    },
    animation: 'fade-up',
    duration: 500,
    easing: 'ease-in-out',
  },
  // 弹性动画
  bounce: {
    get name() {
      return transitionText('presetBounce');
    },
    animation: 'bounce-in-up',
    duration: 600,
    easing: 'ease-out-back',
  },
  // 缩放动画
  scale: {
    get name() {
      return transitionText('presetScale');
    },
    animation: 'zoom-in',
    duration: 300,
    easing: 'ease-out-cubic',
  },
};
