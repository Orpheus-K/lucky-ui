---
title: Dropdown 下拉菜单
phone: dropdown
---

# Dropdown 下拉菜单

用于围绕一个触发器显示弹出菜单，常用于操作集合、筛选项切换、更多菜单等场景。

## 何时使用

- 按钮点击后展示一组轻量操作
- 页面空间有限，需要收纳轻量操作项
- 需要通过 `v-model` 维护当前选中状态，或只响应菜单点击动作

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

## 菜单对齐

`menuAlign` 控制菜单与触发器的对齐方式。默认 `start` 保持从触发器起始边展开；当触发器靠近右侧时，可以设为 `end`，让菜单右边缘对齐触发器右边缘。

```vue
<lk-dropdown placement="bottom" menu-align="end">
  <lk-button>右侧菜单</lk-button>
  <template #menu>
    <lk-dropdown-item name="archive">归档</lk-dropdown-item>
    <lk-dropdown-item name="rename">重命名</lk-dropdown-item>
  </template>
</lk-dropdown>
```

## 菜单宽度与图标

默认菜单有最小宽度。需要让菜单跟随内容时，设置 `menuFitContent`；需要固定宽度或限制宽度时，可以使用 `menuWidth`、`menuMinWidth`、`menuMaxWidth`。

菜单项左侧图标通过 `icon` 指定，不传 `icon` 时不显示。选中态通过背景色和文字色表达，不渲染右侧图标或右侧插槽，避免菜单右侧产生额外占位。

```vue
<lk-dropdown menu-fit-content>
  <lk-button>更多</lk-button>
  <template #menu>
    <lk-dropdown-item
      name="view"
      icon="files"
      :icon-size="40"
    >
      查看
    </lk-dropdown-item>
    <lk-dropdown-item name="rename" width="180">
      重命名
    </lk-dropdown-item>
  </template>
</lk-dropdown>
```

## 顶部、底部与分隔线

`menu-top` 和 `menu-bottom` 可用于放置快捷入口、说明、底部操作等自定义内容。菜单分组可以使用 `lk-dropdown-divider`，不用在业务侧手写横线。

```vue
<lk-dropdown menu-fit-content>
  <lk-button>浏览器菜单</lk-button>

  <template #menu-top>
    <view class="quick-actions">
      <lk-icon name="arrow-right" />
      <lk-icon name="star" />
      <lk-icon name="download" />
      <lk-icon name="info-circle" />
      <lk-icon name="arrow-clockwise" />
    </view>
    <lk-dropdown-divider />
  </template>

  <template #menu>
    <lk-dropdown-item name="new" icon="plus-square">打开新的标签页</lk-dropdown-item>
    <lk-dropdown-item name="group" icon="grid">向新分组添加标签页</lk-dropdown-item>
    <lk-dropdown-divider />
    <lk-dropdown-item name="history" icon="clock-history">历史记录</lk-dropdown-item>
    <lk-dropdown-item name="download" icon="download">下载内容</lk-dropdown-item>
  </template>

  <template #menu-bottom>
    <lk-dropdown-divider />
    <lk-dropdown-item name="help" icon="question-circle">帮助和反馈</lk-dropdown-item>
  </template>
</lk-dropdown>
```

## 操作型菜单

当 Dropdown 用作跳转、快捷操作或浏览器式菜单时，菜单项点击不一定代表“当前选中值”。这类场景可以设置 `selectable=false`，组件仍会触发 `select` 和 `lk-dropdown-item` 的 `click` 事件，但不会写入 `modelValue`、不会触发 `change`，也不会显示选中态。

```vue
<lk-dropdown :selectable="false" @select="handleMenuAction">
  <lk-button>更多</lk-button>
  <template #menu>
    <lk-dropdown-item name="new-tab" icon="plus-square">打开新的标签页</lk-dropdown-item>
    <lk-dropdown-item name="history" icon="clock-history">历史记录</lk-dropdown-item>
    <lk-dropdown-item name="settings" icon="gear">设置</lk-dropdown-item>
  </template>
</lk-dropdown>
```

## 选择后关闭

`closeOnSelect` 默认开启。若希望点击菜单项后保持展开，可关闭它。

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

推荐按场景拆分菜单：操作菜单用于编辑、复制、删除，设置 `selectable=false`；筛选菜单用 `v-model` 保存当前条件；需要连续操作时关闭 `closeOnSelect`。

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

## 展开时保持页面滚动

默认情况下，Dropdown 打开后会用透明遮罩承接外部点击并锁定背景滚动。如果页面内容较长，需要在菜单展开时仍然允许滚动，可关闭 `lockScroll`。

```vue
<lk-dropdown :lock-scroll="false">
  <lk-button>可滚动筛选</lk-button>
  <template #menu>
    <lk-dropdown-item name="latest">最新</lk-dropdown-item>
    <lk-dropdown-item name="priority">优先级</lk-dropdown-item>
  </template>
</lk-dropdown>
```

::: warning
`lockScroll=false` 下不会渲染全屏遮罩，页面可继续滚动，但点击外部自动关闭也会随之失效。这类场景建议依靠点击菜单项或再次点击触发器收起。
:::

## 裁剪容器中使用

H5 默认将菜单传送到 `body`，避免被父容器的 `overflow: hidden/auto` 裁剪；如需保持原地渲染，可设置 `:teleport="false"`。

## 动画配置

可以使用动画预设，也可以通过 `animationType` 指定内置动画类型，并调整持续时间、延迟和缓动函数。
未指定 `animationType` 时，Dropdown 默认使用内置 `dropdown` 动画，并会根据 `placement` 自动设置展开方向。
`animationType` 支持所有内置动画类型，完整列表见 [Animation 动画](./animation)。

```vue
<lk-dropdown animation-type="dropdown" :duration="180" easing="ease-out-cubic">
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

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| id | 根节点 id | `string` | `''` |
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| modelValue | 当前选中值，仅在 `selectable=true` 时由菜单项点击写入 | `string \| number` | `''` |
| zIndex | 弹层层级 | `number` | `500` |
| trigger | 触发方式 | `click \| hover` | `click` |
| placement | 菜单展开位置 | `top \| bottom \| left \| right` | `bottom` |
| menuAlign | 菜单与触发器的对齐方式 | `start \| end` | `start` |
| menuWidth | 菜单宽度，数字默认按 rpx 处理 | `string \| number` | `''` |
| menuMinWidth | 菜单最小宽度，数字默认按 rpx 处理 | `string \| number` | `''` |
| menuMaxWidth | 菜单最大宽度，数字默认按 rpx 处理 | `string \| number` | `''` |
| menuFitContent | 菜单宽度是否跟随内容 | `boolean` | `false` |
| selectable | 点击菜单项时是否写入选中值并显示选中态 | `boolean` | `true` |
| closeOnSelect | 点击可用菜单项后是否自动关闭 | `boolean` | `true` |
| closeOnClickOutside | 点击外部透明遮罩时是否关闭 | `boolean` | `true` |
| lockScroll | 菜单展开时是否锁定背景滚动 | `boolean` | `true` |
| teleport | H5 菜单是否传送到指定目标，设为 `false` 时原地渲染 | `string \| HTMLElement \| boolean` | `body` |
| animation | 动画预设名称 | `keyof ANIMATION_PRESETS` | `undefined` |
| animationType | 内置动画类型，支持全部 `TransitionName` | [`TransitionConfig['name']`](./animation#内置动画类型) | `undefined` |
| duration | 动画持续时间 | `number` | `180` |
| delay | 动画延迟 | `number` | `0` |
| easing | 动画缓动函数 | `TransitionConfig['easing']` | `ease-out` |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:modelValue | 选中项变化，仅 `selectable=true` 时触发 | `(value: string \| number) => void` |
| change | 选中项变化后的回调，仅 `selectable=true` 时触发 | `(value: string \| number, payload?: DropdownSelectPayload) => void` |
| select | 点击可用菜单项时触发，不受 `selectable` 影响 | `(payload: { name: string \| number, event?: Event }) => void` |
| open | 菜单展开时触发 | `() => void` |
| close | 菜单收起时触发 | `() => void` |
| click-trigger | 点击触发器时触发 | `(event?: Event) => void` |
| click-outside | 点击外部透明遮罩时触发 | `(event?: Event) => void` |
| after-enter | 进入动画结束后触发 | `() => void` |
| after-leave | 离开动画结束后触发 | `() => void` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 触发器内容 |
| menu-top | 菜单顶部内容，位于菜单项之前 |
| menu | 菜单内容，通常放置 `lk-dropdown-item` |
| menu-bottom | 菜单底部内容，位于菜单项之后 |

### DropdownItem Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| id | 根节点 id | `string` | `''` |
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| name | 菜单项唯一值，必填 | `string \| number` | — |
| disabled | 是否禁用 | `boolean` | `false` |
| icon | 左侧图标名 | `string` | `''` |
| iconSize | 左侧图标尺寸，数字默认按 rpx 处理 | `string \| number` | `34` |
| width | 菜单项宽度，数字默认按 rpx 处理 | `string \| number` | `''` |

### DropdownDivider Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| id | 根节点 id | `string` | `''` |
| customClass | 组件可视根节点自定义类名 | `string \| object \| array` | `''` |
| customStyle | 组件可视根节点自定义样式 | `string \| object` | `''` |
| inset | 是否按带图标菜单项缩进 | `boolean` | `false` |

### DropdownItem Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击可用菜单项时触发 | `(payload: { name: string \| number, event?: Event }) => void` |
| click-disabled | 点击禁用菜单项时触发 | `(payload: { name: string \| number, event?: Event }) => void` |

## 使用建议

::: tip
组件本身不提供 `options` 数组直传模式，推荐用 `menu` 插槽声明菜单内容，这样扩展性更好。
:::

::: warning
在 `hover` 模式下，适合 H5 桌面交互；移动端优先使用 `click` 触发。
:::
