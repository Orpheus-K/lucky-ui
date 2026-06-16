<script setup lang="ts">
import { computed } from 'vue';
import ActionSheetDemo from '@/components/demos/action-sheet-demo.vue';
import AnchorDemo from '@/components/demos/anchor-demo.vue';
import AvatarDemo from '@/components/demos/avatar-demo.vue';
import BacktopDemo from '@/components/demos/backtop-demo.vue';
import BadgeDemo from '@/components/demos/badge-demo.vue';
import ButtonDemo from '@/components/demos/button-demo.vue';
import CalendarDemo from '@/components/demos/calendar-demo.vue';
import CalendarPickerDemo from '@/components/demos/calendar-picker-demo.vue';
import CardDemo from '@/components/demos/card-demo.vue';
import CarouselDemo from '@/components/demos/carousel-demo.vue';
import CellDemo from '@/components/demos/cell-demo.vue';
import ChartAreaDemo from '@/components/demos/chart-area-demo.vue';
import ChartBarDemo from '@/components/demos/chart-bar-demo.vue';
import ChartLineDemo from '@/components/demos/chart-line-demo.vue';
import ChartLiteDemo from '@/components/demos/chart-lite-demo.vue';
import ChartPieDemo from '@/components/demos/chart-pie-demo.vue';
import ChartRadarLiteDemo from '@/components/demos/chart-radar-lite-demo.vue';
import ChartRingDemo from '@/components/demos/chart-ring-demo.vue';
import ChartSparklineDemo from '@/components/demos/chart-sparkline-demo.vue';
import ChartStatCardDemo from '@/components/demos/chart-stat-card-demo.vue';
import CheckboxDemo from '@/components/demos/checkbox-demo.vue';
import ChoiceDemo from '@/components/demos/choice-demo.vue';
import CollapseDemo from '@/components/demos/collapse-demo.vue';
import CountdownDemo from '@/components/demos/countdown-demo.vue';
import CurtainDemo from '@/components/demos/curtain-demo.vue';
import DividerDemo from '@/components/demos/divider-demo.vue';
import DropdownDemo from '@/components/demos/dropdown-demo.vue';
import EmptyDemo from '@/components/demos/empty-demo.vue';
import FabDemo from '@/components/demos/fab-demo.vue';
import FormDemo from '@/components/demos/form-demo.vue';
import FormGroupDemo from '@/components/demos/form-group-demo.vue';
import GridDemo from '@/components/demos/grid-demo.vue';
import HorizontalScrollDemo from '@/components/demos/horizontal-scroll-demo.vue';
import IconDemo from '@/components/demos/icon-demo.vue';
import ImageDemo from '@/components/demos/image-demo.vue';
import InputDemo from '@/components/demos/input-demo.vue';
import KeyboardDemo from '@/components/demos/keyboard-demo.vue';
import LoadingDemo from '@/components/demos/loading-demo.vue';
import MetaRowDemo from '@/components/demos/meta-row-demo.vue';
import ModalDemo from '@/components/demos/modal-demo.vue';
import NavbarDemo from '@/components/demos/navbar-demo.vue';
import NoticeBarDemo from '@/components/demos/notice-bar-demo.vue';
import NumberRollerDemo from '@/components/demos/number-roller-demo.vue';
import OverlayDemo from '@/components/demos/overlay-demo.vue';
import PageDemo from '@/components/demos/page-demo.vue';
import PickerDemo from '@/components/demos/picker-demo.vue';
import PopupDemo from '@/components/demos/popup-demo.vue';
import PreloadDemo from '@/components/demos/preload-demo.vue';
import ProgressDemo from '@/components/demos/progress-demo.vue';
import PullRefreshDemo from '@/components/demos/pull-refresh-demo.vue';
import RadioDemo from '@/components/demos/radio-demo.vue';
import RateDemo from '@/components/demos/rate-demo.vue';
import RootDemo from '@/components/demos/root-demo.vue';
import SegmentedDemo from '@/components/demos/segmented-demo.vue';
import SelectListDemo from '@/components/demos/select-list-demo.vue';
import SkeletonDemo from '@/components/demos/skeleton-demo.vue';
import SliderDemo from '@/components/demos/slider-demo.vue';
import SpaceDemo from '@/components/demos/space-demo.vue';
import StepperDemo from '@/components/demos/stepper-demo.vue';
import StickyDemo from '@/components/demos/sticky-demo.vue';
import SwitchDemo from '@/components/demos/switch-demo.vue';
import TabDemo from '@/components/demos/tab-demo.vue';
import TabbarContainerDemo from '@/components/demos/tabbar-container-demo.vue';
import TabbarDemo from '@/components/demos/tabbar-demo.vue';
import TagDemo from '@/components/demos/tag-demo.vue';
import TextareaDemo from '@/components/demos/textarea-demo.vue';
import TimelineDemo from '@/components/demos/timeline-demo.vue';
import ToastDemo from '@/components/demos/toast-demo.vue';
import TooltipDemo from '@/components/demos/tooltip-demo.vue';
import TransitionDemo from '@/components/demos/transition-demo.vue';
import UploadDemo from '@/components/demos/upload-demo.vue';
import VerifyCodeDemo from '@/components/demos/verify-code-demo.vue';
import VirtualListDemo from '@/components/demos/virtual-list-demo.vue';
import WaterfallDemo from '@/components/demos/waterfall-demo.vue';
import WatermarkDemo from '@/components/demos/watermark-demo.vue';
import { hasPreviewDemo } from './preview-demo-registry';

const props = defineProps<{
  slug?: string;
}>();

const activeSlug = computed(() => {
  const slug = props.slug || '';
  return hasPreviewDemo(slug) ? slug : '';
});
</script>

<template>
  <action-sheet-demo v-if="activeSlug === 'action-sheet'" />
  <anchor-demo v-else-if="activeSlug === 'anchor'" />
  <avatar-demo v-else-if="activeSlug === 'avatar'" />
  <backtop-demo v-else-if="activeSlug === 'backtop'" />
  <badge-demo v-else-if="activeSlug === 'badge'" />
  <button-demo v-else-if="activeSlug === 'button'" />
  <calendar-demo v-else-if="activeSlug === 'calendar'" />
  <calendar-picker-demo v-else-if="activeSlug === 'calendar-picker'" />
  <card-demo v-else-if="activeSlug === 'card'" />
  <carousel-demo v-else-if="activeSlug === 'carousel'" />
  <cell-demo v-else-if="activeSlug === 'cell'" />
  <chart-area-demo v-else-if="activeSlug === 'chart-area'" />
  <chart-bar-demo v-else-if="activeSlug === 'chart-bar'" />
  <chart-line-demo v-else-if="activeSlug === 'chart-line'" />
  <chart-lite-demo v-else-if="activeSlug === 'chart-lite'" />
  <chart-pie-demo v-else-if="activeSlug === 'chart-pie'" />
  <chart-radar-lite-demo v-else-if="activeSlug === 'chart-radar-lite'" />
  <chart-ring-demo v-else-if="activeSlug === 'chart-ring'" />
  <chart-sparkline-demo v-else-if="activeSlug === 'chart-sparkline'" />
  <chart-stat-card-demo v-else-if="activeSlug === 'chart-stat-card'" />
  <checkbox-demo v-else-if="activeSlug === 'checkbox'" />
  <choice-demo v-else-if="activeSlug === 'choice'" />
  <collapse-demo v-else-if="activeSlug === 'collapse'" />
  <countdown-demo v-else-if="activeSlug === 'countdown'" />
  <curtain-demo v-else-if="activeSlug === 'curtain'" />
  <divider-demo v-else-if="activeSlug === 'divider'" />
  <dropdown-demo v-else-if="activeSlug === 'dropdown'" />
  <empty-demo v-else-if="activeSlug === 'empty'" />
  <fab-demo v-else-if="activeSlug === 'fab'" />
  <form-demo v-else-if="activeSlug === 'form'" />
  <form-group-demo v-else-if="activeSlug === 'form-group'" />
  <grid-demo v-else-if="activeSlug === 'grid'" />
  <horizontal-scroll-demo v-else-if="activeSlug === 'horizontal-scroll'" />
  <icon-demo v-else-if="activeSlug === 'icon'" />
  <image-demo v-else-if="activeSlug === 'image'" />
  <input-demo v-else-if="activeSlug === 'input'" />
  <keyboard-demo v-else-if="activeSlug === 'keyboard'" />
  <loading-demo v-else-if="activeSlug === 'loading'" />
  <meta-row-demo v-else-if="activeSlug === 'meta-row'" />
  <modal-demo v-else-if="activeSlug === 'modal'" />
  <navbar-demo v-else-if="activeSlug === 'navbar'" />
  <notice-bar-demo v-else-if="activeSlug === 'notice-bar'" />
  <number-roller-demo v-else-if="activeSlug === 'number-roller'" />
  <overlay-demo v-else-if="activeSlug === 'overlay'" />
  <page-demo v-else-if="activeSlug === 'page'" />
  <picker-demo v-else-if="activeSlug === 'picker'" />
  <popup-demo v-else-if="activeSlug === 'popup'" />
  <preload-demo v-else-if="activeSlug === 'preload'" />
  <progress-demo v-else-if="activeSlug === 'progress'" />
  <pull-refresh-demo v-else-if="activeSlug === 'pull-refresh'" />
  <radio-demo v-else-if="activeSlug === 'radio'" />
  <rate-demo v-else-if="activeSlug === 'rate'" />
  <root-demo v-else-if="activeSlug === 'root'" />
  <segmented-demo v-else-if="activeSlug === 'segmented'" />
  <select-list-demo v-else-if="activeSlug === 'select-list'" />
  <skeleton-demo v-else-if="activeSlug === 'skeleton'" />
  <slider-demo v-else-if="activeSlug === 'slider'" />
  <space-demo v-else-if="activeSlug === 'space'" />
  <stepper-demo v-else-if="activeSlug === 'stepper'" />
  <sticky-demo v-else-if="activeSlug === 'sticky'" />
  <switch-demo v-else-if="activeSlug === 'switch'" />
  <tab-demo v-else-if="activeSlug === 'tab'" />
  <tabbar-demo v-else-if="activeSlug === 'tabbar'" />
  <tabbar-container-demo v-else-if="activeSlug === 'tabbar-container'" />
  <tag-demo v-else-if="activeSlug === 'tag'" />
  <textarea-demo v-else-if="activeSlug === 'textarea'" />
  <timeline-demo v-else-if="activeSlug === 'timeline'" />
  <toast-demo v-else-if="activeSlug === 'toast'" />
  <tooltip-demo v-else-if="activeSlug === 'tooltip'" />
  <transition-demo v-else-if="activeSlug === 'transition'" />
  <upload-demo v-else-if="activeSlug === 'upload'" />
  <verify-code-demo v-else-if="activeSlug === 'verify-code'" />
  <virtual-list-demo v-else-if="activeSlug === 'virtual-list'" />
  <waterfall-demo v-else-if="activeSlug === 'waterfall'" />
  <watermark-demo v-else-if="activeSlug === 'watermark'" />
  <slot v-else />
</template>
