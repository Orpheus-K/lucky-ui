<script setup lang="ts">
import { computed, inject, getCurrentInstance, onMounted, onUnmounted } from 'vue';
import type { ComponentInternalInstance, StyleValue } from 'vue';
import { anchorLinkProps } from './anchor.props';
import {
  canClickAnchorLink,
  resolveAnchorLinkActive,
  resolveAnchorLinkClass,
} from './anchor.utils';

defineOptions({ name: 'LkAnchorLink' });
const props = defineProps(anchorLinkProps);
type AnchorContext = {
  activeHref: { value: string };
  register: (child: ComponentInternalInstance) => void;
  unregister: (child: ComponentInternalInstance) => void;
  handleClick: (href: string) => void;
  props: {
    showLine?: boolean;
  };
};

const parent = inject<AnchorContext | null>('lkAnchor', null);
const instance = getCurrentInstance();

const isActive = computed(() => resolveAnchorLinkActive(parent?.activeHref.value, props.href));
const linkClass = computed(() =>
  resolveAnchorLinkClass({
    active: isActive.value,
    disabled: props.disabled,
    customClass: props.customClass,
  })
);
const linkStyle = computed<StyleValue>(() => props.customStyle as StyleValue);
const showLine = computed(() => parent?.props?.showLine);

function onClick() {
  if (!canClickAnchorLink(props.disabled, props.href)) return;
  parent?.handleClick(props.href);
}

onMounted(() => {
  if (parent && instance) parent.register(instance);
});

onUnmounted(() => {
  if (parent && instance) parent.unregister(instance);
});
</script>

<template>
  <view
    :id="'anchor-link-' + props.href"
    class="lk-anchor-link"
    :class="linkClass"
    :style="linkStyle"
    @tap="onClick"
  >
    <view
      v-if="showLine"
      class="lk-anchor-link__indicator"
      :class="{ 'lk-anchor-link__indicator--visible': isActive }"
    ></view>
    <view class="lk-anchor-link__title">
      <slot>{{ props.title }}</slot>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@use './lk-anchor.scss';
</style>
