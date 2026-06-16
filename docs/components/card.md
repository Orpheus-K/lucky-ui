---
title: Card 卡片
phone: card
---

# Card 卡片

用于承载一组相关信息，适合订单信息、商品摘要、营销卡片、设置分组等内容块展示。

## 交互式调试

<PropsPlayground
  component="card"
  :props-def="[
    { key: 'title', type: 'string', label: '标题', default: '卡片标题' },
    { key: 'subTitle', type: 'string', label: '副标题', default: '' },
    { key: 'shadow', type: 'enum', label: '阴影', values: ['none', 'never', 'sm', 'md', 'base', 'lg'], default: 'sm' },
    { key: 'border', type: 'boolean', label: '边框', default: false },
    { key: 'hoverable', type: 'boolean', label: '悬浮效果', default: false },
    { key: 'transparent', type: 'boolean', label: '透明', default: false },
  ]"
  slot-content="卡片内容示例"
/>

## 基础用法

```vue
<lk-card title="卡片标题" sub-title="副标题">
  <view>卡片内容</view>
</lk-card>
```

## 带封面图

```vue
<lk-card title="今日推荐">
  <template #cover>
    <image src="https://img01.yzcdn.cn/vant/cat.jpeg" mode="aspectFill" style="width:100%;height:320rpx" />
  </template>

  <view>封面贴边展示，适合图文内容卡片。</view>
</lk-card>
```

## 底部操作区

```vue
<lk-card title="订单信息">
  <view>订单主体内容</view>

  <template #footer>
    <view style="display:flex;justify-content:flex-end;gap:16rpx">
      <lk-button size="sm" plain>取消</lk-button>
      <lk-button size="sm" type="primary">确认</lk-button>
    </view>
  </template>
</lk-card>
```

## 自定义头部右侧区域

```vue
<lk-card title="消息中心">
  <template #header-extra>
    <lk-tag type="primary">NEW</lk-tag>
  </template>

  <view>可在头部右侧放置状态标记或快捷操作。</view>
</lk-card>
```

## 交互卡片

```vue
<lk-card hoverable shadow="md" @click="handleClick">
  <view>点击或按压时会有更明显的浮层感。</view>
</lk-card>
```

## 推荐示例

### 1) 直接复用项目 Demo（推荐）

```vue
<script setup lang="ts">
import CardDemo from '@/components/demos/card-demo.vue'
</script>

<template>
  <CardDemo />
</template>
```

### 2) 在业务页中按需组合

```vue
<template>
  <view class="page-demo">
    <lk-card />
  </view>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| title | 卡片标题 | `string` | `''` |
| subTitle | 副标题 | `string` | `''` |
| padding | 内容内边距 | `string` | `'32rpx'` |
| border | 是否显示边框 | `boolean` | `false` |
| shadow | 阴影等级 | `none \| never \| sm \| md \| base \| lg` | `sm` |
| bgColor | 自定义背景色 | `string` | `''` |
| transparent | 是否透明背景 | `boolean` | `false` |
| hoverable | 是否启用交互悬浮效果 | `boolean` | `false` |
| id | 根节点 id | `string` | `''` |
| customClass | 根节点自定义类名 | `string \| object \| array` | — |
| customStyle | 根节点自定义样式 | `string \| object` | — |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击卡片时触发 | `(event)` |
| header-click | 点击卡片头部时触发 | `(event)` |
| footer-click | 点击卡片底部时触发 | `(event)` |

### Slots

| 插槽名 | 说明 |
|--------|------|
| cover | 顶部封面区域，贴边显示 |
| header | 自定义头部标题区 |
| header-extra | 头部右侧附加内容 |
| default | 卡片主体内容 |
| footer | 卡片底部区域 |

## 使用建议

::: tip
如果只是做简单分组容器，直接用默认头部即可；如果头部结构复杂，优先使用 `header` 与 `header-extra` 插槽，而不是在 `default` 中手动拼接。
:::
