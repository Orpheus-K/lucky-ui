---
title: Fab 悬浮按钮
phone: fab
---

# Fab 悬浮按钮

可拖拽的悬浮操作按钮，常用于页面快捷操作入口。支持拖拽吸边、子按钮展开、毛玻璃效果等特性。

## 基础用法

```vue
<template>
  <lk-fab icon="plus" @click="handleClick" />
</template>

<script setup>
const handleClick = () => {
  console.log('FAB clicked');
};
</script>
```

## 带子按钮

通过 `actions` 属性配置子按钮列表，点击主按钮展开。

```vue
<template>
  <lk-fab v-model="expanded" :actions="actions" @action-click="handleActionClick" />
</template>

<script setup>
import { ref } from 'vue';

const expanded = ref(false);
const actions = [
  { key: 'scan', icon: 'qr-code-scan', label: '扫一扫' },
  { key: 'photo', icon: 'camera', label: '拍照' },
  { key: 'share', icon: 'share' },
];

const handleActionClick = action => {
  console.log('点击了', action.key);
};
</script>
```

## 展开方向

通过 `direction` 属性设置子按钮展开方向。

```vue
<template>
  <lk-fab direction="up" :actions="actions" />
  <!-- 向上 -->
  <lk-fab direction="down" :actions="actions" />
  <!-- 向下 -->
  <lk-fab direction="left" :actions="actions" />
  <!-- 向左 -->
  <lk-fab direction="right" :actions="actions" />
  <!-- 向右 -->
</template>
```

## 毛玻璃效果

启用 `blur` 属性可获得 iOS 风格的毛玻璃效果。

```vue
<template>
  <lk-fab blur />
</template>
```

## 禁用拖拽

设置 `draggable` 为 `false` 可禁用拖拽功能。

```vue
<template>
  <lk-fab :draggable="false" />
</template>
```

## 自定义位置

通过 `position` 属性设置初始位置。

```vue
<template>
  <lk-fab position="bottom-right" />
  <lk-fab position="bottom-left" />
  <lk-fab position="top-right" />
  <lk-fab position="top-left" />
</template>
```

## 自定义颜色

支持自定义颜色值。

```vue
<template>
  <lk-fab color="primary" />
  <lk-fab color="#ff6b6b" />
  <lk-fab color="#4ecdc4" />
</template>
```

## Props

| 参数                | 说明             | 类型                                                           | 默认值         |
| ------------------- | ---------------- | -------------------------------------------------------------- | -------------- |
| v-model             | 是否展开子按钮   | `boolean`                                                      | `false`        |
| icon                | 主按钮图标       | `string`                                                       | `plus`         |
| activeIcon          | 展开后的图标     | `string`                                                       | -              |
| position            | 初始位置         | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `bottom-right` |
| direction           | 子按钮展开方向   | `'up' \| 'down' \| 'left' \| 'right'`                          | `up`           |
| actions             | 子按钮配置       | `FabAction[]`                                                  | `[]`           |
| draggable           | 是否可拖拽       | `boolean`                                                      | `true`         |
| magnetic            | 拖拽后是否吸边   | `boolean`                                                      | `true`         |
| size                | 主按钮尺寸       | `string \| number`                                             | `112` (rpx)    |
| actionSize          | 子按钮尺寸       | `string \| number`                                             | `88` (rpx)     |
| offset              | 边距             | `string \| number`                                             | `32` (rpx)     |
| color               | 主题色           | `string`                                                       | `primary`      |
| blur                | 毛玻璃效果       | `boolean`                                                      | `true`         |
| zIndex              | 层级             | `number`                                                       | `999`          |
| overlay             | 展开时显示遮罩   | `boolean`                                                      | `false`        |
| closeOnOverlay      | 点击遮罩关闭     | `boolean`                                                      | `true`         |
| safeAreaInsetBottom | 安全区域底部偏移 | `boolean`                                                      | `true`         |
| id                  | 根节点 id        | `string`                                                       | `''`           |
| customClass         | 根节点自定义类名 | `string \| object \| array`                                    | -              |
| customStyle         | 根节点自定义样式 | `string \| object`                                             | -              |

## Events

| 事件名       | 说明       | 回调参数                   |
| ------------ | ---------- | -------------------------- |
| update:modelValue | 展开状态变化，用于 `v-model` | `(value: boolean)` |
| click        | 点击主按钮 | -                          |
| action-click | 点击可用子按钮 | `(action: FabAction, event?: Event)` |
| action-disabled | 点击禁用子按钮 | `(action: FabAction, event?: Event)` |
| open         | 展开子按钮 | -                          |
| close        | 收起子按钮 | -                          |
| overlay-click | 点击遮罩 | `(event?: Event)` |
| drag-start   | 开始拖拽   | `{ x, y, event }` |
| drag-move    | 拖拽中     | `{ x, y, event }` |
| drag-end     | 结束拖拽   | `{ x, y, event }` |
| direction-change | 展开方向因空间不足自动修正 | `(direction, preferred)` |

## FabAction 数据结构

| 属性     | 说明       | 类型      | 必填 |
| -------- | ---------- | --------- | ---- |
| key      | 唯一标识   | `string`  | 是   |
| icon     | 图标名称   | `string`  | 是   |
| label    | 文字标签   | `string`  | 否   |
| color    | 自定义颜色 | `string`  | 否   |
| disabled | 是否禁用   | `boolean` | 否   |

## 样式变量

| 变量名      | 说明       | 默认值                    |
| ----------- | ---------- | ------------------------- |
| --fab-color | 主按钮颜色 | `var(--lk-color-primary)` |

## 发布验收

`lk-fab` 已纳入 needs-hardening showcase 回归，发布前按下面边界验收：

| 场景 | 验收方式 | 要点 |
|------|----------|------|
| 展示台基线 | 自动回归 | `tests/visual/needs-hardening-showcase.spec.ts` 校验组件路由、verified 状态与中风险标记 |
| 拖拽吸边 | 人工验收 | `drag-start/drag-move/drag-end` 顺序稳定，吸边后不越过安全区 |
| 视觉降级 | 人工验收 | `blur`、遮罩和展开方向在低端 App WebView 可接受 |

