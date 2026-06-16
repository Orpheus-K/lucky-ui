---
title: Collapse 折叠面板
phone: collapse
---

# Collapse 折叠面板

用于将大段内容分组收纳，支持多项同时展开或手风琴单开模式，常用于 FAQ、筛选项说明、设置分组等场景。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const activeNames = ref(['1'])
</script>

<template>
  <lk-collapse v-model="activeNames">
    <lk-collapse-item name="1" title="标题 1">
      <view style="padding: 24rpx">折叠内容 1</view>
    </lk-collapse-item>
    <lk-collapse-item name="2" title="标题 2">
      <view style="padding: 24rpx">折叠内容 2</view>
    </lk-collapse-item>
  </lk-collapse>
</template>
```

## 手风琴模式

手风琴模式下，同一时间只允许展开一个面板。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const activeName = ref('1')
</script>

<template>
  <lk-collapse v-model="activeName" accordion>
    <lk-collapse-item name="1" title="配送说明">
      <view style="padding: 24rpx">仅展开当前项</view>
    </lk-collapse-item>
    <lk-collapse-item name="2" title="售后说明">
      <view style="padding: 24rpx">打开后会自动关闭其他项</view>
    </lk-collapse-item>
  </lk-collapse>
</template>
```

## 禁用某一项

```vue
<lk-collapse v-model="activeNames" @click-disabled="handleDisabled">
  <lk-collapse-item name="1" title="可用项">
    <view style="padding: 24rpx">正常展开</view>
  </lk-collapse-item>
  <lk-collapse-item name="2" title="禁用项" disabled>
    <view style="padding: 24rpx">点击不会展开</view>
  </lk-collapse-item>
</lk-collapse>
```

## 自定义标题内容

`lk-collapse-item` 提供 `title` 插槽，可以放入图标、状态标签等内容。

```vue
<lk-collapse v-model="activeNames">
  <lk-collapse-item name="1">
    <template #title>
      <view style="display:flex;align-items:center;gap:12rpx">
        <lk-icon name="info-circle" size="28" color="primary" />
        <text>带图标标题</text>
      </view>
    </template>

    <view style="padding:24rpx">自定义标题插槽</view>
  </lk-collapse-item>
</lk-collapse>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import CollapseDemo from '@/components/demos/collapse-demo.vue'
</script>

<template>
  <CollapseDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-collapse />
  </view>
</template>
```

## API

### Props

#### LkCollapse

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 当前展开面板；普通模式为数组，手风琴模式为字符串或数字 | `any[] \| string \| number` | `[]` |
| accordion | 是否开启手风琴模式 | `boolean` | `false` |
| variant | 折叠面板风格 | `group \| card \| ghost` | `group` |
| gap | 卡片模式下项目间距 | `string \| number` | `var(--lk-spacing-sm)` |
| bordered | 是否显示边框 | `boolean` | `true` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

#### LkCollapseItem

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 面板唯一标识 | `string \| number` | — |
| title | 标题文本 | `string` | `''` |
| disabled | 是否禁用当前面板 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 展开项变化时触发 | 当前激活值 |
| change | 展开项变化时触发 | `(value, name)` |
| item-click | 点击可用面板头部时触发，早于状态变化 | `({ name, expanded, event })` |
| open | 面板展开后触发 | `(name, value)` |
| close | 面板收起后触发 | `(name, value)` |
| click-disabled | 点击禁用面板时触发 | `({ name, event })` |

#### LkCollapseItem Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击面板头部时触发 | `({ name, expanded, event })` |
| click-disabled | 点击禁用面板时触发 | `({ name, event })` |

### Slots

#### LkCollapse

| 插槽名 | 说明 |
|--------|------|
| default | 折叠项列表 |

#### LkCollapseItem

| 插槽名 | 说明 |
|--------|------|
| title | 自定义标题区域 |
| default | 折叠内容 |

## 使用建议

::: tip
如果你需要“左侧导航 + 右侧内容联动”的结构，请使用 `lk-anchor`，不要用折叠面板替代锚点导航。
:::
