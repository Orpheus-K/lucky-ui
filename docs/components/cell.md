---
title: Cell 单元格
phone: cell
---

# Cell 单元格

用于设置页、详情页和信息列表中的通用行展示，支持分组、图标、描述、右侧插槽与点击反馈。

## 基础用法

```vue
<template>
  <lk-cell-group>
    <lk-cell title="个人信息" value="查看" />
    <lk-cell title="收货地址" value="北京市朝阳区" />
    <lk-cell title="支付方式" value="微信支付" arrow />
  </lk-cell-group>
</template>
```

## 插槽组合

```vue
<template>
  <lk-cell-group title="账号设置" card>
    <lk-cell title="消息推送" icon="bell">
      <template #value>
        <lk-switch v-model="enabled" size="sm" />
      </template>
    </lk-cell>
  </lk-cell-group>
</template>
```

## API

### CellGroup Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 分组标题 | `string` | `''` |
| border | 是否显示边框 | `boolean` | `true` |
| card | 是否使用卡片样式 | `boolean` | `false` |
| inset | 是否内嵌圆角 | `boolean` | `false` |

### Cell Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 左侧标题 | `string` | `''` |
| value | 右侧内容 | `string` | `''` |
| label | 标题下方描述 | `string` | `''` |
| icon | 左侧图标名 | `string` | `''` |
| arrow | 是否显示箭头 | `boolean` | `false` |
| clickable | 是否开启点击反馈 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| center | 是否垂直居中 | `boolean` | `false` |
| ripple | 是否启用波纹 | `boolean` | `true` |
| customClass | 自定义类名 | `string / object / array` | — |
| customStyle | 自定义样式 | `string / object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击可用单元格 | `(event?: Event)` |
| click-disabled | 点击禁用单元格 | `(event?: Event)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| value / right | 右侧内容 |
| title | 左侧标题 |
| label | 描述内容 |
| left | 左侧完整区域 |
