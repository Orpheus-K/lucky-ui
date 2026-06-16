---
title: Dropdown 下拉菜单
phone: dropdown
---

# Dropdown 下拉菜单

用于围绕一个触发器显示弹出菜单，常用于操作集合、筛选项切换、更多菜单等场景。

## 何时使用

- 按钮点击后展示一组轻量操作
- 页面空间有限，需要收纳轻量操作项
- 需要通过 `v-model` 维护当前选中状态

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('1')
</script>

<template>
  <lk-dropdown v-model="value">
    <lk-button>下拉菜单</lk-button>

    <template #menu>
      <lk-dropdown-item name="1">选项一</lk-dropdown-item>
      <lk-dropdown-item name="2">选项二</lk-dropdown-item>
      <lk-dropdown-item name="3">选项三</lk-dropdown-item>
    </template>
  </lk-dropdown>
</template>
```

## 位置与触发方式

```vue
<template>
  <lk-dropdown placement="bottom" trigger="click">
    <lk-button>点击触发</lk-button>
    <template #menu>
      <lk-dropdown-item name="a">A</lk-dropdown-item>
    </template>
  </lk-dropdown>
</template>
```

## 选择后关闭

`closeOnSelect` 默认开启。若希望菜单选择后保持展开，可关闭它。

```vue
<lk-dropdown :close-on-select="false">
  <lk-button>多次操作</lk-button>
  <template #menu>
    <lk-dropdown-item name="edit">编辑</lk-dropdown-item>
    <lk-dropdown-item name="share">分享</lk-dropdown-item>
  </template>
</lk-dropdown>
```

## 多场景组合

推荐按场景拆分菜单：操作菜单用于编辑、复制、删除；筛选菜单用 `v-model` 保存当前条件；需要连续操作时关闭 `closeOnSelect`。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const sortValue = ref('latest')
</script>

<template>
  <lk-dropdown v-model="sortValue">
    <lk-button>排序</lk-button>
    <template #menu>
      <lk-dropdown-item name="latest">最新创建</lk-dropdown-item>
      <lk-dropdown-item name="priority">优先级最高</lk-dropdown-item>
      <lk-dropdown-item name="progress">进度最快</lk-dropdown-item>
    </template>
  </lk-dropdown>
</template>
```

## 点击外部关闭

点击触发模式下默认会渲染遮罩层，点击外部自动收起。

```vue
<lk-dropdown :close-on-click-outside="true">
  <lk-button>打开菜单</lk-button>
</lk-dropdown>
```

## 动画配置

可以使用预设动画，也可以自定义动画类型、持续时间、延迟和缓动函数。

```vue
<lk-dropdown animation-type="fade-up" :duration="220" easing="ease-out">
  <lk-button type="primary">操作</lk-button>
  <template #menu>
    <lk-dropdown-item name="edit">编辑</lk-dropdown-item>
    <lk-dropdown-item name="delete">删除</lk-dropdown-item>
  </template>
</lk-dropdown>
```

## DropdownItem

`lk-dropdown-item` 用于声明菜单项，可通过 `name` 指定唯一值，通过 `disabled` 控制禁用态。

```vue
<lk-dropdown-item name="delete" icon="trash-fill" disabled>删除</lk-dropdown-item>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import DropdownDemo from '@/components/demos/dropdown-demo.vue'
</script>

<template>
  <DropdownDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-dropdown />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| modelValue | 当前选中值 | `string \| number` | `''` |
| zIndex | 弹层层级 | `number` | `500` |
| trigger | 触发方式 | `click \| hover` | `click` |
| placement | 菜单展开位置 | `top \| bottom \| left \| right` | `bottom` |
| closeOnSelect | 选择后是否自动关闭 | `boolean` | `true` |
| closeOnClickOutside | 点击菜单外部是否关闭 | `boolean` | `true` |
| animation | 动画预设名称 | `keyof ANIMATION_PRESETS` | `undefined` |
| animationType | 自定义动画类型 | `TransitionConfig['name']` | `undefined` |
| duration | 动画持续时间 | `number` | `180` |
| delay | 动画延迟 | `number` | `0` |
| easing | 动画缓动函数 | `TransitionConfig['easing']` | `ease-out` |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 选中项变化 | `(value: string \| number) => void` |
| change | 选中项变化后的回调 | `(value: string \| number, payload?: DropdownSelectPayload) => void` |
| select | 选择菜单项时触发 | `(payload: { name, event }) => void` |
| open | 菜单展开时触发 | `() => void` |
| close | 菜单收起时触发 | `() => void` |
| click-trigger | 点击触发器时触发 | `(event?: Event) => void` |
| click-outside | 点击外部遮罩时触发 | `(event?: Event) => void` |
| after-enter | 进入动画结束后触发 | `() => void` |
| after-leave | 离开动画结束后触发 | `() => void` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 触发器内容 |
| menu | 菜单内容，通常放置 `lk-dropdown-item` |

### DropdownItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| name | 菜单项唯一值，必填 | `string \| number` | — |
| disabled | 是否禁用 | `boolean` | `false` |
| icon | 左侧图标名 | `string` | `''` |

### DropdownItem Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击可用菜单项时触发 | `({ name, event }) => void` |
| click-disabled | 点击禁用菜单项时触发 | `({ name, event }) => void` |

## 使用建议

::: tip
组件本身不提供 `options` 数组直传模式，推荐用 `menu` 插槽声明菜单内容，这样扩展性更好。
:::

::: warning
在 `hover` 模式下，适合 H5 桌面交互；移动端优先使用 `click` 触发。
:::
