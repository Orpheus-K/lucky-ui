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
      <view>折叠内容 1</view>
    </lk-collapse-item>
    <lk-collapse-item name="2" title="标题 2">
      <view>折叠内容 2</view>
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
      <view>仅展开当前项</view>
    </lk-collapse-item>
    <lk-collapse-item name="2" title="售后说明">
      <view>打开后会自动关闭其他项</view>
    </lk-collapse-item>
  </lk-collapse>
</template>
```

## 禁用某一项

```vue
<lk-collapse v-model="activeNames" @click-disabled="handleDisabled">
  <lk-collapse-item name="1" title="可用项">
    <view>正常展开</view>
  </lk-collapse-item>
  <lk-collapse-item name="2" title="禁用项" disabled>
    <view>点击不会展开</view>
  </lk-collapse-item>
</lk-collapse>
```

## 异步展开切换

通过 `before-toggle` 属性传入拦截函数或异步 `Promise`，可用于在展开前进行权限校验或数据异步加载，执行过程中右侧会自动展示 Loading 加载状态：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const activeNames = ref(['1'])

function handleBeforeToggle(name: string | number, expanded: boolean) {
  if (!expanded) return true // 收起无需等待
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(true) // 返回 true 允许展开，返回 false 阻止展开
    }, 600)
  })
}
</script>

<template>
  <lk-collapse v-model="activeNames">
    <lk-collapse-item
      name="1"
      title="异步加载内容"
      :before-toggle="handleBeforeToggle"
    >
      <view>异步获取的内容已加载完毕</view>
    </lk-collapse-item>
  </lk-collapse>
</template>
```

## 自定义标题与操作图标

`lk-collapse-item` 支持通过属性直接切换加减号图标（推荐使用粗体饱满的 `plus-lg` / `dash-lg`）、展开收起文字，或使用 `title` 与 `arrow` 插槽自定义：

```vue
<!-- 1. 加减号图标切换 -->
<lk-collapse-item name="1" title="加减号模式" arrow-icon="plus-lg" open-icon="dash-lg">
  <view>折叠内容</view>
</lk-collapse-item>

<!-- 2. 展开/收起文字 -->
<lk-collapse-item name="2" title="文字操作" arrow-text="展开" open-text="收起">
  <view>折叠内容</view>
</lk-collapse-item>

<!-- 3. 自定义箭头插槽 -->
<lk-collapse-item name="3" title="自定义插槽">
  <template #arrow="{ open, loading }">
    <text>{{ loading ? '加载中...' : (open ? '已展开' : '点击查看') }}</text>
  </template>
  <view>折叠内容</view>
</lk-collapse-item>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import CollapseDemo from '@/pages_sub/components/demos/collapse-demo.vue'
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
| variant | 折叠面板风格：`default` 线条列表、`group` 整块分组、`card` 分离卡片、`ghost` 轻量无框 | `default \| group \| card \| ghost` | `default` |
| gap | `card`、`ghost` 模式下的项目间距 | `string \| number` | `var(--lk-spacing-sm)` |
| bordered | 是否显示边框/分割线 | `boolean` | `true` |
| arrow | 全局是否显示右侧箭头 | `boolean` | `true` |
| arrowIcon | 全局收起时图标名 | `string` | `''` |
| openIcon | 全局展开时图标名 | `string` | `''` |
| animationDuration | 展开动画时长；为空时继承主题变量 | `string` | `''` |
| animationTiming | 展开动画缓动函数；为空时继承主题变量 | `string` | `''` |
| beforeToggle | 切换面板前的全局拦截钩子，支持异步 Promise | `(name, expanded) => boolean \| Promise<boolean>` | — |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

#### LkCollapseItem

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| name | 面板唯一标识 | `string \| number` | — |
| title | 标题文本 | `string` | `''` |
| disabled | 是否禁用当前面板 | `boolean` | `false` |
| arrow | 是否显示右侧箭头/操作区（未设置时继承父级） | `boolean` | `undefined` |
| arrowIcon | 自定义收起时的图标名（如 `'plus-lg'`） | `string` | `''` |
| openIcon | 自定义展开时的图标名（如 `'dash-lg'`） | `string` | `''` |
| arrowText | 自定义收起时的文本（如 `'展开'`） | `string` | `''` |
| openText | 自定义展开时的文本（如 `'收起'`） | `string` | `''` |
| iconSize | 右侧图标尺寸 | `string \| number` | `var(--lk-rpx-28)` |
| beforeToggle | 切换当前面板前的拦截钩子，支持异步 Promise | `(name, expanded) => boolean \| Promise<boolean>` | — |

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

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| title | 自定义标题区域 | `{ open, disabled }` |
| arrow | 自定义右侧箭头/操作区域 | `{ open, disabled, loading }` |
| default | 折叠内容 | — |

## 使用建议

::: tip
如果你的页面是以线条排布为主的常规信息，使用默认 `variant="default"`；如果需要整块卡片包裹，显式指定 `variant="group"` 或 `variant="card"`。
:::
