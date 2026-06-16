<script setup lang="ts">
import { ref, provide, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue';
import type { StyleValue } from 'vue';
import { anchorEmits, anchorProps } from './anchor.props';
import {
  normalizeAnchorTargets,
  resolveActiveAnchorByScroll,
  resolveAnchorProgrammaticState,
  resolveAnchorScrollIntoViewId,
  resolveAnchorScrollTop,
  resolveAnchorStyle,
  resolveAnchorTargetId,
  resolveAnchorNumber,
} from './anchor.utils';
import type { AnchorTarget, AnchorTargetInput } from './anchor.utils';

defineOptions({ name: 'LkAnchor' });
const props = defineProps(anchorProps);
const emit = defineEmits(anchorEmits);

type AnchorChild = { props?: { href?: string } };
const children = ref<AnchorChild[]>([]);
const activeHref = ref('');
const scrollIntoViewId = ref('');
const targets = ref<AnchorTarget[]>([]);
const pendingTargetHref = ref('');
const isProgrammaticScrolling = ref(false);

let scrollUnlockTimer: ReturnType<typeof setTimeout> | null = null;
let scrollSettleTimer: ReturnType<typeof setTimeout> | null = null;
// #ifdef H5
let h5ScrollContainer: HTMLElement | null = null;
let h5ScrollHandler: ((event: Event) => void) | null = null;
// #endif

const anchorStyle = computed(() =>
  resolveAnchorStyle({
    bgColor: props.bgColor,
    activeBgColor: props.activeBgColor,
    textColor: props.textColor,
    activeColor: props.activeColor,
    customStyle: props.customStyle as StyleValue,
  })
);

function register(child: AnchorChild) {
  children.value.push(child);
}

function unregister(child: AnchorChild) {
  const idx = children.value.indexOf(child);
  if (idx > -1) children.value.splice(idx, 1);
}

function setTargets(nextTargets: AnchorTargetInput[], baseScrollTop: number = 0) {
  targets.value = normalizeAnchorTargets(nextTargets);
  resolveActiveByScroll(baseScrollTop);
}

function clearScrollTimers() {
  if (scrollUnlockTimer) {
    clearTimeout(scrollUnlockTimer);
    scrollUnlockTimer = null;
  }
  if (scrollSettleTimer) {
    clearTimeout(scrollSettleTimer);
    scrollSettleTimer = null;
  }
}

function resolveRuntimeMaxScrollTop(): number | undefined {
  // #ifdef H5
  if (h5ScrollContainer) {
    return Math.max(0, h5ScrollContainer.scrollHeight - h5ScrollContainer.clientHeight);
  }
  // #endif
  return undefined;
}

// #ifdef H5
function resolveH5ScrollElement(selector: string): HTMLElement | null {
  if (!selector) return null;
  const root = document.querySelector(selector) as HTMLElement | null;
  if (!root) return null;
  if (root.scrollHeight > root.clientHeight + 1) return root;

  const candidates = Array.from(root.querySelectorAll<HTMLElement>('*'));
  const scrollable = candidates.find(el => {
    const style = window.getComputedStyle(el);
    return el.scrollHeight > el.clientHeight + 1 && ['auto', 'scroll'].includes(style.overflowY);
  });
  return scrollable || root;
}

function unbindH5ScrollContainer() {
  if (h5ScrollContainer && h5ScrollHandler) {
    h5ScrollContainer.removeEventListener('scroll', h5ScrollHandler);
  }
  h5ScrollContainer = null;
  h5ScrollHandler = null;
}

async function bindH5ScrollContainer() {
  unbindH5ScrollContainer();
  const selector = props.container || props.targetContainer;
  if (!selector) return;

  await nextTick();
  const scrollElement = resolveH5ScrollElement(selector);
  if (!scrollElement) return;

  h5ScrollContainer = scrollElement;
  h5ScrollHandler = () => {
    onScroll(
      scrollElement.scrollTop,
      0,
      Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight)
    );
  };
  scrollElement.addEventListener('scroll', h5ScrollHandler, { passive: true });
  await measureTargets(scrollElement.scrollTop);
}
// #endif

function finishProgrammaticScroll() {
  clearScrollTimers();
  isProgrammaticScrolling.value = false;
  pendingTargetHref.value = '';
}

async function measureTargets(baseScrollTop: number = 0) {
  await nextTick();
  const hrefs = children.value.map(child => child?.props?.href as string).filter(href => !!href);
  if (hrefs.length === 0) {
    targets.value = [];
    return;
  }

  // 在小程序中，组件内的 createSelectorQuery 作用域被限制在组件本身，
  // 无法跨组件查找到父级/兄弟组件中的目标元素。
  // 必须使用页面实例的 createSelectorQuery 才能全页面查询。
  const q = uni.createSelectorQuery();
  // #ifdef MP
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  const page = Array.isArray(pages) ? pages[pages.length - 1] : null;
  if (page) {
    (q as unknown as { in: (ctx: unknown) => ReturnType<typeof uni.createSelectorQuery> }).in(page);
  }
  // #endif

  const hasContainer = !!props.targetContainer;
  if (hasContainer) q.select(props.targetContainer).boundingClientRect();
  hrefs.forEach(href => q.select(`#${href}`).boundingClientRect());

  type RectLike = { top?: number; height?: number } | null;
  const results = await new Promise<RectLike[]>(resolve => {
    q.exec(res => resolve(Array.isArray(res) ? (res as RectLike[]) : []));
  });

  const containerRect = hasContainer ? results[0] : null;
  const startIndex = hasContainer ? 1 : 0;

  const measured = hrefs
    .map((href, idx) => {
      const rect = results[startIndex + idx];
      if (!rect) return null;
      const top = (rect.top || 0) - (containerRect?.top || 0) + resolveAnchorNumber(baseScrollTop);
      return { href, top, height: rect.height || 0 };
    })
    .filter((i): i is { href: string; top: number; height: number } => !!i)
    .sort((a, b) => a.top - b.top);

  targets.value = measured;

  resolveActiveByScroll(baseScrollTop);
}

function resolveActiveByScroll(scrollTop: number, headerHeight: number = 0, maxScrollTop?: number) {
  const active = resolveActiveAnchorByScroll({
    targets: targets.value,
    scrollTop,
    headerOffset: props.headerOffset,
    headerHeight,
    maxScrollTop: maxScrollTop ?? resolveRuntimeMaxScrollTop(),
  });

  if (active && active !== activeHref.value) {
    activeHref.value = active;
    emit('change', active);
  }
}

function resolveProgrammaticScroll(
  scrollTop: number,
  headerHeight: number = 0,
  maxScrollTop?: number
) {
  const state = resolveAnchorProgrammaticState({
    isProgrammaticScrolling: isProgrammaticScrolling.value,
    pendingTargetHref: pendingTargetHref.value,
    targets: targets.value,
    scrollTop,
    headerOffset: props.headerOffset,
    headerHeight,
    maxScrollTop: maxScrollTop ?? resolveRuntimeMaxScrollTop(),
  });
  if (!state.handled) return false;
  if (state.shouldFinish) {
    finishProgrammaticScroll();
    return false;
  }

  if (state.reached) {
    if (activeHref.value !== state.targetHref) {
      activeHref.value = state.targetHref;
      emit('change', state.targetHref);
    }
    clearScrollTimers();
    scrollSettleTimer = setTimeout(() => {
      finishProgrammaticScroll();
    }, 120);
    return true;
  }

  clearScrollTimers();
  scrollUnlockTimer = setTimeout(() => {
    finishProgrammaticScroll();
    resolveActiveByScroll(scrollTop, headerHeight, maxScrollTop);
  }, 900);
  return true;
}

function onScroll(scrollTop: number, headerHeight: number = 0, maxScrollTop?: number) {
  const resolvedMaxScrollTop = maxScrollTop ?? resolveRuntimeMaxScrollTop();
  if (resolveProgrammaticScroll(scrollTop, headerHeight, resolvedMaxScrollTop)) return;
  resolveActiveByScroll(scrollTop, headerHeight, resolvedMaxScrollTop);
}

function handleClick(href: string) {
  const targetId = resolveAnchorTargetId(href);
  if (!targetId) return;

  clearScrollTimers();
  pendingTargetHref.value = targetId;
  isProgrammaticScrolling.value = true;
  if (activeHref.value !== targetId) {
    activeHref.value = targetId;
    emit('change', targetId);
  }
  let handled = false;
  const target = targets.value.find(item => item.href === targetId);
  const offset = resolveAnchorNumber(props.headerOffset);

  // #ifdef H5
  try {
    const targetElement = document.getElementById(targetId);
    if (targetElement && props.targetContainer) {
      const container = resolveH5ScrollElement(props.targetContainer);
      if (container) {
        const measuredTop = targets.value.find(item => item.href === targetId)?.top;
        const top =
          typeof measuredTop === 'number'
            ? resolveAnchorScrollTop({ targetTop: measuredTop, headerOffset: offset })
            : targetElement.getBoundingClientRect().top -
              container.getBoundingClientRect().top +
              container.scrollTop;
        container.scrollTo({ top, behavior: 'smooth' });
        handled = true;
      }
    }
  } catch {
    // ignore
  }
  // #endif

  if (!handled) {
    try {
      if (target) {
        uni.pageScrollTo({
          scrollTop: resolveAnchorScrollTop({ targetTop: target.top, headerOffset: offset }),
          duration: 300,
        });
      } else {
        uni.pageScrollTo({
          selector: `#${targetId}`,
          duration: 300,
        });
      }
    } catch {
      // ignore
    }
  }

  emit('click', targetId);
}

watch(activeHref, val => {
  scrollIntoViewId.value = resolveAnchorScrollIntoViewId(val);
});

watch(
  () => children.value.length,
  () => {
    // children 注册完成后再测量，避免 setTimeout 依赖
    measureTargets(props.scrollTop || 0);
  }
);

watch(
  () => props.scrollTop,
  val => {
    onScroll(val);
  }
);

// #ifdef H5
watch(
  () => [props.container, props.targetContainer],
  () => {
    bindH5ScrollContainer();
  }
);
// #endif

provide('lkAnchor', {
  activeHref,
  register,
  unregister,
  handleClick,
  props,
});

onMounted(() => {
  setTimeout(() => measureTargets(), 500);
  // #ifdef H5
  setTimeout(() => bindH5ScrollContainer(), 500);
  // #endif
});

onBeforeUnmount(() => {
  clearScrollTimers();
  // #ifdef H5
  unbindH5ScrollContainer();
  // #endif
});

defineExpose({ measureTargets, setTargets, onScroll, scrollTo: handleClick, active: activeHref });
</script>

<template>
  <view class="lk-anchor" :class="props.customClass" :style="anchorStyle">
    <scroll-view
      scroll-y
      class="lk-anchor__scroll"
      :scroll-into-view="scrollIntoViewId"
      scroll-with-animation
      :show-scrollbar="false"
    >
      <view class="lk-anchor__wrapper">
        <slot></slot>
      </view>
      <view style="height: 20px"></view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
@use './lk-anchor.scss';
</style>
