---
title: Toast 轻提示
phone: toast
---

# Toast 轻提示

轻量级的全局通知提示，不打断用户流程，自动消失。

## 使用前准备

推荐在主页面或业务根布局使用 `LkRoot`。Root 会自动挂载 Toast 宿主：

```vue
<template>
  <lk-root>
    <page-layout />
  </lk-root>
</template>
```

如果暂不使用 `LkRoot`，也可以直接放置低层 Toast 管理器：

```vue
<template>
  <view>
    <page-layout />
    <lk-toast-manager />
  </view>
</template>
```

同一页面只保留一个 Toast 宿主。使用 `LkRoot` 默认配置时，不要再额外挂载 `<lk-toast-manager />`。

## 基础用法

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui/components/lk-toast/toast-manager'

function showMsg() {
  toastStore.show('操作成功！')
}
</script>

<template>
  <lk-button @click="showMsg">显示 Toast</lk-button>
</template>
```

## 不同位置

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui'

function top() { toastStore.show({ message: '顶部提示', position: 'top' }) }
function center() { toastStore.show({ message: '居中提示', position: 'center' }) }
function bottom() { toastStore.show({ message: '底部提示', position: 'bottom' }) }
</script>

<template>
  <view class="demo-row">
    <lk-button @click="top">顶部</lk-button>
    <lk-button @click="center">居中</lk-button>
    <lk-button @click="bottom">底部</lk-button>
  </view>
</template>
```

## 自定义时长

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui'

function show1s() { toastStore.show({ message: '显示 1 秒', duration: 1000 }) }
function show4s() { toastStore.show({ message: '显示 4 秒', duration: 4000 }) }
function stay() { toastStore.show({ message: '不自动关闭', duration: 0 }) }
</script>

<template>
  <view class="demo-row">
    <lk-button @click="show1s">1 秒</lk-button>
    <lk-button @click="show4s">4 秒</lk-button>
    <lk-button @click="stay">不关闭</lk-button>
  </view>
</template>
```

## 动画效果

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui'
</script>

<template>
  <view class="demo-row">
    <lk-button @click="toastStore.show({ message: 'slide-up', transition: 'slide-up' })">
      SlideUp
    </lk-button>
    <lk-button @click="toastStore.show({ message: 'fade', transition: 'fade' })">
      Fade
    </lk-button>
    <lk-button @click="toastStore.show({ message: 'zoom', transition: 'zoom' })">
      Zoom
    </lk-button>
  </view>
</template>
```

## 手动关闭

```vue
<script setup lang="ts">
import { toastStore } from '@/uni_modules/lucky-ui'
import { ref } from 'vue'

const toastId = ref<number | null>(null)

function open() {
  toastId.value = toastStore.show({ message: '长时间 Toast，点击关闭', duration: 0 })
}

function close() {
  if (toastId.value !== null) {
    toastStore.close(toastId.value)
    toastId.value = null
  }
}
</script>

<template>
  <lk-button @click="open">打开</lk-button>
  <lk-button variant="outline" @click="close">关闭</lk-button>
</template>
```

## API

### toastStore 方法

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| show | 显示 Toast | `string \| ToastOptions` | `id: number` |
| close | 关闭指定 Toast（带退出动画） | `(id: number) => void` | — |
| clear | 关闭所有 Toast | `() => void` | — |

### ToastOptions

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| message | 提示内容 | `string` | — |
| duration | 自动关闭时长（ms），0 表示不关闭 | `number` | `2000` |
| position | 显示位置 | `top \| center \| bottom` | `center` |
| transition | 动画效果 | `slide-up \| fade \| zoom` | `slide-up` |

### LkToastManager 组件

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 显隐状态变化，用于 `v-model` | `(value: boolean)` |
| open | Toast 显示时触发 | `()` |
| close | Toast 关闭时触发 | `()` |
| after-leave | 离开动画结束后触发 | `()` |

## 发布验收

`lk-toast` 已纳入 needs-hardening showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/needs-hardening-showcase.spec.ts` 校验组件路由、verified 状态与中风险标记 |
| 全局管理 | 自动/人工 | 多个 Toast 连续触发时 id、关闭动画和 `clear()` 行为稳定 |
| 定位与时序 | 人工验收 | `top/center/bottom` 与自动关闭时长在 H5/App/小程序端一致 |
